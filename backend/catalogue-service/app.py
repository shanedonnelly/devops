import logging
import os
import uuid
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from prisma import Prisma
from minio import Minio
from models import CatalogueResponse, CatalogueUpdate, CategoryResponse, ProductResponse, VariantResponse
from service import TokenService, CatalogueService, AuthorizationService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# a la con
app = FastAPI(
    title="Catalogue Service API",
    version="1.0.0",
    root_path="/devops/api/catalogue-service"
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# MinIO Configuration
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ROOT_USER = os.getenv("MINIO_ROOT_USER", "minioadmin")
MINIO_ROOT_PASSWORD = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
BUCKET_NAME = "product-images"

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ROOT_USER,
    secret_key=MINIO_ROOT_PASSWORD,
    secure=False
)

security = HTTPBearer()

# Initialize services
token_service = TokenService(SECRET_KEY, ALGORITHM)

import json

# ...existing code...

@app.on_event("startup")
async def startup():
    try:
        if not minio_client.bucket_exists(BUCKET_NAME):
            minio_client.make_bucket(BUCKET_NAME)
            logger.info(f"Bucket {BUCKET_NAME} created")
        
        # Always ensure bucket policy is public read
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{BUCKET_NAME}/*"]
                }
            ]
        }
        minio_client.set_bucket_policy(BUCKET_NAME, json.dumps(policy))
        logger.info(f"Bucket policy set to public read for {BUCKET_NAME}")
            
    except Exception as e:
        logger.error(f"Error ensuring bucket exists or setting policy: {e}")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    try:
        token = credentials.credentials
        user_id = token_service.decode_token(token)
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.get("/sites/{site_string_id}/catalogue", response_model=CatalogueResponse, tags=["Catalogue"])
async def get_catalogue(site_string_id: str):
    # Get entire catalogue for a site (public route)
    logger.info(f"Getting catalogue for site: {site_string_id}")
    try:
        async with Prisma() as db:
            site = await db.site.find_unique(where={"stringId": site_string_id}, include={"categories": {"include": {"products": {"include": {"variants": True}}}}})
            
            if not site:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
            categories = []
            for category in site.categories:
                products = []
                for product in category.products:
                    variants = [VariantResponse(id=v.id, name=v.name, stock=v.stock, productId=v.productId) for v in product.variants]
                    products.append(ProductResponse(id=product.id, name=product.name, description=product.description, price=product.price, imageUrl=product.imageUrl, categoryId=product.categoryId, variants=variants))
                categories.append(CategoryResponse(id=category.id, name=category.name, siteId=category.siteId, products=products))
            
            logger.info(f"Catalogue retrieved successfully for site: {site_string_id}")
            return CatalogueResponse(categories=categories)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting catalogue: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.put("/sites/{site_string_id}/catalogue", tags=["Catalogue"])
async def update_catalogue(site_string_id: str, catalogue: CatalogueUpdate, user_id: int = Depends(get_current_user)):
    # Update entire catalogue for a site (owner only)
    logger.info(f"Updating catalogue for site: {site_string_id}")
    try:
        async with Prisma() as db:
            site = await db.site.find_unique(where={"stringId": site_string_id})
            
            if not site:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
            if not AuthorizationService.can_modify_site(site.userId, user_id):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
            
            await db.category.delete_many(where={"siteId": site.id})
            
            for category_data in catalogue.categories:
                category = await db.category.create(data={"name": category_data.name, "siteId": site.id})
                
                for product_data in category_data.products:
                    product = await db.product.create(data={"name": product_data.name, "description": product_data.description, "price": product_data.price, "imageUrl": product_data.imageUrl, "categoryId": category.id})
                    
                    for variant_data in product_data.variants:
                        await db.variant.create(data={"name": variant_data.name, "stock": variant_data.stock, "productId": product.id})
            
            logger.info(f"Catalogue updated successfully for site: {site_string_id}")
            return {"message": "Catalogue updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating catalogue: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
@app.post("/products/{product_id}/image", tags=["Catalogue"])
async def upload_product_image(product_id: int, file: UploadFile = File(...), user_id: int = Depends(get_current_user)):
    logger.info(f"Uploading image for product: {product_id}")
    try:
        async with Prisma() as db:
            # Verify product ownership
            product = await db.product.find_unique(where={"id": product_id}, include={"category": {"include": {"site": True}}})
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
            
            if not AuthorizationService.can_modify_site(product.category.site.userId, user_id):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

            # Upload to MinIO
            file_ext = os.path.splitext(file.filename)[1]
            filename = f"{product.category.site.stringId}/{product.id}/{uuid.uuid4()}{file_ext}"
            
            minio_client.put_object(
                BUCKET_NAME,
                filename,
                file.file,
                file.size,
                content_type=file.content_type
            )
            
            # Update product with image URL
            # The URL is relative to the MinIO bucket, Nginx will handle the proxying
            # Format: product-images/site-id/product-id/filename
            image_url = f"{BUCKET_NAME}/{filename}"
            
            await db.product.update(
                where={"id": product_id},
                data={"imageUrl": image_url}
            )
            
            logger.info(f"Image uploaded successfully for product: {product_id}")
            return {"imageUrl": image_url}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
# a nice little health check endpoint
@app.get("/health", tags=["Health"])
async def root():
    return {"service": "catalogue-service", "status": "running"}