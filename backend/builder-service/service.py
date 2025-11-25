"""
Builder Service - Business Logic Layer

This module contains all the business logic for the builder service,
separated from the API controllers.
"""

import logging
import json
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt
from io import BytesIO

logger = logging.getLogger(__name__)


class PasswordService:
    """Service for password hashing and verification."""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password using bcrypt."""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )


class TokenService:
    """Service for JWT token operations."""
    
    def __init__(self, secret_key: str, algorithm: str = "HS256", expire_minutes: int = 30):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.expire_minutes = expire_minutes
    
    def create_access_token(self, data: dict) -> str:
        """Create JWT token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.expire_minutes)
        to_encode.update({"exp": expire})
        # Convert user_id to string for JWT sub claim
        if "sub" in to_encode and isinstance(to_encode["sub"], int):
            to_encode["sub"] = str(to_encode["sub"])
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def decode_token(self, token: str) -> Optional[int]:
        """Decode JWT token and return user id."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id_str: str = payload.get("sub")
            if user_id_str is None:
                return None
            return int(user_id_str)
        except Exception:
            return None


class SiteConfigService:
    """Service for site configuration operations in MinIO."""
    
    def __init__(self, minio_client, bucket_name: str):
        self.minio_client = minio_client
        self.bucket_name = bucket_name
    
    def ensure_bucket_exists(self) -> bool:
        """Ensure MinIO bucket exists. Returns True if successful."""
        try:
            if not self.minio_client.bucket_exists(self.bucket_name):
                self.minio_client.make_bucket(self.bucket_name)
                logger.info(f"Bucket {self.bucket_name} created")
            return True
        except Exception as e:
            logger.error(f"Error ensuring bucket exists: {e}")
            return False
    
    def create_default_config(self, string_id: str) -> bool:
        """Create default site configuration in MinIO. Returns True if successful."""
        default_config = {
            "css_template": "",
            "title": "",
            "description": "",
            "contact_text": ""
        }
        return self.save_config(string_id, default_config)
    
    def save_config(self, string_id: str, config: Dict[str, Any]) -> bool:
        """Save site configuration to MinIO. Returns True if successful."""
        try:
            config_json = json.dumps(config).encode("utf-8")
            self.minio_client.put_object(
                self.bucket_name,
                f"{string_id}.json",
                BytesIO(config_json),
                len(config_json),
                content_type="application/json"
            )
            return True
        except Exception as e:
            logger.error(f"Error saving config to MinIO: {e}")
            return False
    
    def get_config(self, string_id: str) -> Optional[Dict[str, Any]]:
        """Get site configuration from MinIO. Returns None if not found."""
        try:
            response = self.minio_client.get_object(self.bucket_name, f"{string_id}.json")
            config_data = json.loads(response.read().decode("utf-8"))
            return config_data
        except Exception as e:
            logger.error(f"Error getting config from MinIO: {e}")
            return None
    
    def delete_config(self, string_id: str) -> bool:
        """Delete site configuration from MinIO. Returns True if successful."""
        try:
            self.minio_client.remove_object(self.bucket_name, f"{string_id}.json")
            logger.info(f"Config file deleted from MinIO: {string_id}.json")
            return True
        except Exception as e:
            logger.error(f"Error deleting config from MinIO: {e}")
            return False


class SiteService:
    """Service for site business logic."""
    
    @staticmethod
    def generate_string_id(site_name: str) -> str:
        """Generate string ID from site name."""
        return site_name.lower().replace(" ", "-")
    
    @staticmethod
    def validate_site_name(site_name: str) -> bool:
        """Validate site name. Returns True if valid."""
        if not site_name or not site_name.strip():
            return False
        return True


class UserService:
    """Service for user business logic."""
    
    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate username. Returns True if valid."""
        if not username or not username.strip():
            return False
        if len(username) < 3:
            return False
        return True
    
    @staticmethod
    def validate_password(password: str) -> bool:
        """Validate password. Returns True if valid."""
        if not password or len(password) < 1:
            return False
        return True
