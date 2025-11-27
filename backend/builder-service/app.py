import logging
import os
from typing import List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from prisma import Prisma
from minio import Minio
from minio.error import S3Error
from models import UserRegister, UserLogin, TokenResponse, SiteCreate, SiteResponse, SiteUpdate, SiteConfig
from service import PasswordService, TokenService, SiteConfigService, SiteService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# a change in the builder service to test ci/cd pipeline
# a second change in the builder service to test ci/cd pipeline
# a third change in the builder service to test ci/cd pipeline
# a fourth change in the builder service to test ci/cd pipeline
app = FastAPI(
    title="Builder Service API",
    version="1.0.0",
    root_path="/devops/api/builder-service"
)

SECRET_KEY = os.getenv("SECRET_KEY")
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

# Initialize services
password_service = PasswordService()
token_service = TokenService(SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES)
site_config_service = SiteConfigService(minio_client, BUCKET_NAME)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    # Decode JWT token and return user id
    logger.info("Attempting to authenticate user from token")
    try:
        token = credentials.credentials
        logger.info(f"Token received: {token[:20]}...")
        
        user_id = token_service.decode_token(token)
        if user_id is None:
            logger.error("Token payload missing 'sub' field or invalid")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        logger.info(f"User authenticated successfully: {user_id}")
        return user_id
    except JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except ValueError as e:
        logger.error(f"Invalid user_id format: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except Exception as e:
        logger.error(f"Unexpected error during authentication: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.on_event("startup")
async def startup():
    # Initialize database and MinIO on startup
    logger.info("Starting builder service")
    try:
        logger.info("Connecting to database")
        await Prisma().connect()
        site_config_service.ensure_bucket_exists()
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

@app.post("/register", response_model=TokenResponse, tags=["Authentication"])
async def register(user: UserRegister):
    # Register a new user
    logger.info(f"Registering user: {user.username}")
    try:
        async with Prisma() as db:
            existing_user = await db.user.find_unique(where={"username": user.username})
            if existing_user:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
            
            hashed_password = password_service.hash_password(user.password)
            new_user = await db.user.create(data={"username": user.username, "password": hashed_password})
            
            access_token = token_service.create_access_token(data={"sub": new_user.id})
            logger.info(f"User registered successfully: {user.username}, user_id: {new_user.id}")
            return TokenResponse(access_token=access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.post("/login", response_model=TokenResponse, tags=["Authentication"])
async def login(user: UserLogin):
    # Login a user
    logger.info(f"Logging in user: {user.username}")
    try:
        async with Prisma() as db:
            db_user = await db.user.find_unique(where={"username": user.username})
            if not db_user or not password_service.verify_password(user.password, db_user.password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
            
            access_token = token_service.create_access_token(data={"sub": db_user.id})
            logger.info(f"User logged in successfully: {user.username}, user_id: {db_user.id}")
            return TokenResponse(access_token=access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.delete("/users/{id}", tags=["Users"])
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

@app.get("/sites", response_model=List[SiteResponse], tags=["Sites"])
async def get_sites(user_id: int = Depends(get_current_user)):
    # Get all sites for a user
    logger.info(f"Getting sites for user: {user_id}")
    try:
        async with Prisma() as db:
            sites = await db.site.find_many(where={"userId": user_id})
            logger.info(f"Sites retrieved successfully for user: {user_id}, count: {len(sites)}")
            return sites
    except Exception as e:
        logger.error(f"Error getting sites: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.post("/sites", response_model=SiteResponse, tags=["Sites"])
async def create_site(site: SiteCreate, user_id: int = Depends(get_current_user)):
    # Create a new site with default category, product and variant
    logger.info(f"Creating site: {site.site_name} for user: {user_id}")
    try:
        async with Prisma() as db:
            string_id = SiteService.generate_string_id(site.site_name)
            
            existing_site = await db.site.find_unique(where={"stringId": string_id})
            if existing_site:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Site with this name already exists")
            
            new_site = await db.site.create(data={"siteName": site.site_name, "stringId": string_id, "userId": user_id})
            
            category = await db.category.create(data={"name": "Default Category", "siteId": new_site.id})
            product = await db.product.create(data={"name": "Default Product", "description": "", "price": 0.0, "categoryId": category.id})
            await db.variant.create(data={"name": "Default Variant", "stock": 0, "productId": product.id})
            
            site_config_service.create_default_config(string_id)
            
            logger.info(f"Site created successfully: {site.site_name}")
            return new_site
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating site: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.delete("/sites/{id}", tags=["Sites"])
async def delete_site(id: int, user_id: int = Depends(get_current_user)):
    # Delete a site
    logger.info(f"Deleting site: {id}")
    try:
        async with Prisma() as db:
            site = await db.site.find_unique(where={"id": id})
            if not site or site.userId != user_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
            # Delete config file from MinIO
            site_config_service.delete_config(site.stringId)
            
            # Delete site from database (CASCADE will delete categories, products, variants)
            await db.site.delete(where={"id": id})
            logger.info(f"Site deleted successfully: {id}")
            return {"message": "Site deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting site: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.put("/sites/{id}", response_model=SiteResponse, tags=["Sites"])
async def update_site(id: int, site: SiteUpdate, user_id: int = Depends(get_current_user)):
    # Update a site
    logger.info(f"Updating site: {id}")
    try:
        async with Prisma() as db:
            existing_site = await db.site.find_unique(where={"id": id})
            if not existing_site or existing_site.userId != user_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
            new_string_id = SiteService.generate_string_id(site.site_name)
            updated_site = await db.site.update(where={"id": id}, data={"siteName": site.site_name, "stringId": new_string_id})
            
            logger.info(f"Site updated successfully: {id}")
            return updated_site
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating site: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.put("/sites/{id}/config", tags=["Sites"])
async def update_site_config(id: int, config: SiteConfig, user_id: int = Depends(get_current_user)):
    # Update site configuration
    logger.info(f"Updating site config: {id}")
    try:
        async with Prisma() as db:
            site = await db.site.find_unique(where={"id": id})
            if not site or site.userId != user_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
            
            config_dict = config.model_dump()
            if not site_config_service.save_config(site.stringId, config_dict):
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating config")
            
            logger.info(f"Site config updated successfully: {id}")
            return {"message": "Site config updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating site config: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.get("/sites/{string_id}/config", response_model=SiteConfig, tags=["Sites"])
async def get_site_config(string_id: str):
    # Get site configuration (public route)
    logger.info(f"Getting site config: {string_id}")
    try:
        config_data = site_config_service.get_config(string_id)
        if config_data is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site config not found")
        logger.info(f"Site config retrieved successfully: {string_id}")
        return SiteConfig(**config_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting site config: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.get("/health", tags=["Health"])
async def root():
    return {"service": "builder-service", "status": "running"}