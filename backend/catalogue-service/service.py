"""
Catalogue Service - Business Logic Layer

This module contains all the business logic for the catalogue service,
separated from the API controllers.
"""

import logging
from typing import Optional, List, Dict, Any
from jose import jwt

logger = logging.getLogger(__name__)


class TokenService:
    """Service for JWT token operations."""
    
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
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


class CatalogueService:
    """Service for catalogue business logic."""
    
    @staticmethod
    def format_variant(variant: Any) -> Dict[str, Any]:
        """Format a variant object into a dictionary."""
        return {
            "id": variant.id,
            "name": variant.name,
            "stock": variant.stock,
            "productId": variant.productId
        }
    
    @staticmethod
    def format_product(product: Any, variants: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Format a product object into a dictionary."""
        return {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "categoryId": product.categoryId,
            "variants": variants
        }
    
    @staticmethod
    def format_category(category: Any, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Format a category object into a dictionary."""
        return {
            "id": category.id,
            "name": category.name,
            "siteId": category.siteId,
            "products": products
        }
    
    @staticmethod
    def build_catalogue_response(site: Any) -> Dict[str, List[Dict[str, Any]]]:
        """Build a complete catalogue response from a site object."""
        categories = []
        for category in site.categories:
            products = []
            for product in category.products:
                variants = [
                    CatalogueService.format_variant(v) 
                    for v in product.variants
                ]
                products.append(
                    CatalogueService.format_product(product, variants)
                )
            categories.append(
                CatalogueService.format_category(category, products)
            )
        return {"categories": categories}


class CategoryService:
    """Service for category business logic."""
    
    @staticmethod
    def validate_category_name(name: str) -> bool:
        """Validate category name. Returns True if valid."""
        if not name or not name.strip():
            return False
        return True
    
    @staticmethod
    def get_category_count(categories: List[Any]) -> int:
        """Get the count of categories."""
        return len(categories)


class ProductService:
    """Service for product business logic."""
    
    @staticmethod
    def validate_product_name(name: str) -> bool:
        """Validate product name. Returns True if valid."""
        if not name or not name.strip():
            return False
        return True
    
    @staticmethod
    def validate_product_price(price: float) -> bool:
        """Validate product price. Returns True if valid (non-negative)."""
        return price >= 0
    
    @staticmethod
    def calculate_total_price(products: List[Dict[str, Any]]) -> float:
        """Calculate total price of all products."""
        return sum(p.get("price", 0) for p in products)
    
    @staticmethod
    def get_product_count(products: List[Any]) -> int:
        """Get the count of products."""
        return len(products)


class VariantService:
    """Service for variant business logic."""
    
    @staticmethod
    def validate_variant_name(name: str) -> bool:
        """Validate variant name. Returns True if valid."""
        if not name or not name.strip():
            return False
        return True
    
    @staticmethod
    def validate_variant_stock(stock: int) -> bool:
        """Validate variant stock. Returns True if valid (non-negative)."""
        return stock >= 0
    
    @staticmethod
    def calculate_total_stock(variants: List[Dict[str, Any]]) -> int:
        """Calculate total stock of all variants."""
        return sum(v.get("stock", 0) for v in variants)
    
    @staticmethod
    def get_in_stock_variants(variants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get variants that are in stock (stock > 0)."""
        return [v for v in variants if v.get("stock", 0) > 0]
    
    @staticmethod
    def get_out_of_stock_variants(variants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get variants that are out of stock (stock == 0)."""
        return [v for v in variants if v.get("stock", 0) == 0]


class AuthorizationService:
    """Service for authorization logic."""
    
    @staticmethod
    def is_site_owner(site_user_id: int, current_user_id: int) -> bool:
        """Check if the current user is the owner of the site."""
        return site_user_id == current_user_id
    
    @staticmethod
    def can_modify_site(site_user_id: int, current_user_id: int) -> bool:
        """Check if the current user can modify the site."""
        return AuthorizationService.is_site_owner(site_user_id, current_user_id)
