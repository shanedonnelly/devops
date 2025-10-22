import logging
import os
import json
from datetime import datetime, timedelta
from typing import List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.hash import bcrypt
from prisma import Prisma
from minio import Minio
from minio.error import S3Error
from models import UserRegister, UserLogin, TokenResponse, SiteCreate, SiteResponse, SiteUpdate, SiteConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Builder Service API",
    version="1.0.0",
    root_path="/api/builder-service"
)

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

minio_client = Minio(
    os.getenv("MINIO_ENDPOINT", "minio:9000"),
    access_key=os.getenv("MINIO_ROOT_USER", "minioadmin"),
    secret_key=os.getenv("MINIO_ROOT_PASSWORD", "minioadmin"),
    secure=False
)

BUCKET_NAME = "site-configs"

def ensure_bucket_exists():
    # Ensure MinIO bucket exists
    try:
        if not minio_client.bucket_exists(BUCKET_NAME):
            minio_client.make_bucket(BUCKET_NAME)
            logger.info(f"Bucket {BUCKET_NAME} created")
    except S3Error as e:
        logger.error(f"Error ensuring bucket exists: {e}")

def create_access_token(data: dict) -> str:
    # Create JWT token
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

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

@app.on_event("startup")
async def startup():
    # Initialize database and MinIO on startup
    logger.info("Starting builder service")
    try:
        logger.info("Connecting to database")
        await Prisma().connect()
        ensure_bucket_exists()
        logger.info("Builder service started successfully")
    except Exception as e:
        logger.error(f"Error starting builder service: {e}")
        raise

@app.on_event("shutdown")
async def shutdown():
    # Disconnect from database on shutdown
    logger.info("Shutting down builder service")
    try:
        await Prisma().disconnect()
        logger.info("Builder service shut down successfully")
    except Exception as e:
        logger.error(f"Error shutting down builder service: {e}")

@app.post("/api/register", response_model=TokenResponse, tags=["Authentication"])
async def register(user: UserRegister):
    # Register a new user
    logger.info(f"Registering user: {user.username}")
    try:
        async with Prisma() as db:
            existing_user = await db.user.find_unique(where={"username": user.username})
            if existing_user:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
            
            hashed_password = bcrypt.hash(user.password)
            new_user = await db.user.create(data={"username": user.username, "password": hashed_password})
            
            access_token = create_access_token(data={"sub": new_user.id})
            logger.info(f"User registered successfully: {user.username}")
            return TokenResponse(access_token=access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.post("/api/login", response_model=TokenResponse, tags=["Authentication"])
async def login(user: UserLogin):
    # Login a user
    logger.info(f"Logging in user: {user.username}")
    try:
        async with Prisma() as db:
            db_user = await db.user.find_unique(where={"username": user.username})
            if not db_user or not bcrypt.verify(user.password, db_user.password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
            
            access_token = create_access_token(data={"sub": db_user.id})
            logger.info(f"User logged in successfully: {user.username}")
            return TokenResponse(access_token=access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.delete("/api/users/{id}", tags=["Users"])
async def delete_user(id: int, user_id: int = Depends(get_current_user)):
    # Delete a user
    logger.info(f"Deleting user: {id}")
    try:
        if id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
        async with Prisma() as db:
            await db.user.delete(where={"id": id})
            logger.info(f"User deleted successfully: {id}")
            return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.get("/api/sites", response_model=List[SiteResponse], tags=["Sites"])
async def get_sites(user_id: int = Depends(get_current_user)):
    # Get all sites for a user
    logger.info(f"Getting sites for user: {user_id}")
    try:
        async with Prisma() as db:
            sites = await db.site.find_many(where={"userId": user_id})
            logger.info(f"Sites retrieved successfully for user: {user_id}")
            return sites
    except Exception as e:
        logger.error(f"Error getting sites: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.post("/api/sites", response_model=SiteResponse, tags=["Sites"])
async def create_site(site: SiteCreate, user_id: int = Depends(get_current_user)):
    # Create a new site with default category, product and variant
    logger.info(f"Creating site: {site.site_name} for user: {user_id}")
    try:
        async with Prisma() as db:
            string_id = site.site_name.lower().replace(" ", "-")
            
            existing_site = await db.site.find_unique(where={"stringId": string_id})
            if existing_site:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Site with this name already exists")
            
            new_site = await db.site.create(data={"siteName": site.site_name, "stringId": string_id, "userId": user_id})
            
            category = await db.category.create(data={"name": "Default Category", "siteId": new_site.id})
            product = await db.product.create(data={"name": "Default Product", "description": "", "price": 0.0, "categoryId": category.id})
            await db.variant.create(data={"name": "Default Variant", "stock": 0, "productId": product.id})
            
            default_config = {"css_template": "", "title": "", "description": "", "contact_text": ""}
            config_json = json.dumps(default_config).encode("utf-8")
            
            try:
                from io import BytesIO
                minio_client.put_object(BUCKET_NAME, f"{string_id}.json", BytesIO(config_json), len(config_json), content_type="application/json")
            except S3Error as e:
                logger.error(f"Error creating config file in MinIO: {e}")
            
            logger.info(f"Site created successfully: {site.site_name}")
            return new_site
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating site: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.delete("/api/sites/{id}", tags=["Sites"])
async def delete_site(id: int, user_id: int = Depends(get_current_user)):
    # Delete a site
    logger.info(f"Deleting site: {id}")
    try:
        async with Prisma() as db:
            site = await db.site.find_unique(where={"id": id})
            if not site or site.userId != user_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
            try:
                minio_client.remove_object(BUCKET_NAME, f"{site.stringId}.json")
            except S3Error as e:
                logger.error(f"Error deleting config file from MinIO: {e}")
            
            await db.site.delete(where={"id": id})
            logger.info(f"Site deleted successfully: {id}")
            return {"message": "Site deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting site: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.put("/api/sites/{id}", response_model=SiteResponse, tags=["Sites"])
async def update_site(id: int, site: SiteUpdate, user_id: int = Depends(get_current_user)):
    # Update a site
    logger.info(f"Updating site: {id}")
    try:
        async with Prisma() as db:
            existing_site = await db.site.find_unique(where={"id": id})
            if not existing_site or existing_site.userId != user_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
            new_string_id = site.site_name.lower().replace(" ", "-")
            updated_site = await db.site.update(where={"id": id}, data={"siteName": site.site_name, "stringId": new_string_id})
            
            logger.info(f"Site updated successfully: {id}")
            return updated_site
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating site: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.put("/api/sites/{id}/config", tags=["Sites"])
async def update_site_config(id: int, config: SiteConfig, user_id: int = Depends(get_current_user)):
    # Update site configuration
    logger.info(f"Updating site config: {id}")
    try:
        async with Prisma() as db:
            site = await db.site.find_unique(where={"id": id})
            if not site or site.userId != user_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
            config_dict = config.model_dump()
            config_json = json.dumps(config_dict).encode("utf-8")
            
            from io import BytesIO
            minio_client.put_object(BUCKET_NAME, f"{site.stringId}.json", BytesIO(config_json), len(config_json), content_type="application/json")
            
            logger.info(f"Site config updated successfully: {id}")
            return {"message": "Site config updated successfully"}
    except HTTPException:
        raise
    except S3Error as e:
        logger.error(f"Error updating site config in MinIO: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating config")
    except Exception as e:
        logger.error(f"Error updating site config: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.get("/api/sites/{string_id}/config", response_model=SiteConfig, tags=["Sites"])
async def get_site_config(string_id: str):
    # Get site configuration (public route)
    logger.info(f"Getting site config: {string_id}")
    try:
        response = minio_client.get_object(BUCKET_NAME, f"{string_id}.json")
        config_data = json.loads(response.read().decode("utf-8"))
        logger.info(f"Site config retrieved successfully: {string_id}")
        return SiteConfig(**config_data)
    except S3Error as e:
        logger.error(f"Error getting site config from MinIO: {e}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site config not found")
    except Exception as e:
        logger.error(f"Error getting site config: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.get("/", tags=["Health"])
async def root():
    return {"service": "builder-service", "status": "running"}