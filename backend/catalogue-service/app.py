import logging
import os
from typing import List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from prisma import Prisma
from models import CatalogueResponse, CatalogueUpdate, CategoryResponse, ProductResponse, VariantResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Catalogue Service API", version="1.0.0")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    # Decode JWT token and return user id
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.get("/api/sites/{site_string_id}/catalogue", response_model=CatalogueResponse, tags=["Catalogue"])
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
                    products.append(ProductResponse(id=product.id, name=product.name, description=product.description, price=product.price, categoryId=product.categoryId, variants=variants))
                categories.append(CategoryResponse(id=category.id, name=category.name, siteId=category.siteId, products=products))
            
            logger.info(f"Catalogue retrieved successfully for site: {site_string_id}")
            return CatalogueResponse(categories=categories)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting catalogue: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.put("/api/sites/{site_string_id}/catalogue", tags=["Catalogue"])
async def update_catalogue(site_string_id: str, catalogue: CatalogueUpdate, user_id: int = Depends(get_current_user)):
    # Update entire catalogue for a site (owner only)
    logger.info(f"Updating catalogue for site: {site_string_id}")
    try:
        async with Prisma() as db:
            site = await db.site.find_unique(where={"stringId": site_string_id})
            
            if not site:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
            if site.userId != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
            
            await db.category.delete_many(where={"siteId": site.id})
            
            for category_data in catalogue.categories:
                category = await db.category.create(data={"name": category_data.name, "siteId": site.id})
                
                for product_data in category_data.products:
                    product = await db.product.create(data={"name": product_data.name, "description": product_data.description, "price": product_data.price, "categoryId": category.id})
                    
                    for variant_data in product_data.variants:
                        await db.variant.create(data={"name": variant_data.name, "stock": variant_data.stock, "productId": product.id})
            
            logger.info(f"Catalogue updated successfully for site: {site_string_id}")
            return {"message": "Catalogue updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating catalogue: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.get("/", tags=["Health"])
async def root():
    return {"service": "catalogue-service", "status": "running"}