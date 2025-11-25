"""
Test suite for Catalogue Service

This test file tests all service layer functions.
When run inside Dockerfile.test, if any test fails, the container exits with code 1.
"""

import pytest
from unittest.mock import MagicMock
from service import (
    TokenService, CatalogueService, CategoryService, 
    ProductService, VariantService, AuthorizationService
)


class TestTokenService:
    """Tests for TokenService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.secret_key = "test_secret_key_12345"
        self.token_service = TokenService(self.secret_key, "HS256")
    
    def test_decode_token_valid(self):
        """Test decoding a valid token."""
        from jose import jwt
        from datetime import datetime, timedelta
        
        # Create a valid token
        token = jwt.encode(
            {"sub": "42", "exp": datetime.utcnow() + timedelta(minutes=30)},
            self.secret_key,
            algorithm="HS256"
        )
        
        user_id = self.token_service.decode_token(token)
        assert user_id == 42
    
    def test_decode_token_invalid(self):
        """Test decoding an invalid token returns None."""
        result = self.token_service.decode_token("invalid_token")
        assert result is None
    
    def test_decode_token_wrong_secret(self):
        """Test decoding a token with wrong secret returns None."""
        from jose import jwt
        from datetime import datetime, timedelta
        
        # Create token with different secret
        token = jwt.encode(
            {"sub": "1", "exp": datetime.utcnow() + timedelta(minutes=30)},
            "different_secret",
            algorithm="HS256"
        )
        
        result = self.token_service.decode_token(token)
        assert result is None
    
    def test_decode_token_missing_sub(self):
        """Test decoding a token without sub returns None."""
        from jose import jwt
        from datetime import datetime, timedelta
        
        token = jwt.encode(
            {"exp": datetime.utcnow() + timedelta(minutes=30)},
            self.secret_key,
            algorithm="HS256"
        )
        result = self.token_service.decode_token(token)
        assert result is None
    
    def test_decode_token_empty_string(self):
        """Test decoding empty string returns None."""
        result = self.token_service.decode_token("")
        assert result is None
    
    def test_decode_token_with_int_sub(self):
        """Test decoding token with integer sub string."""
        from jose import jwt
        from datetime import datetime, timedelta
        
        token = jwt.encode(
            {"sub": "123", "exp": datetime.utcnow() + timedelta(minutes=30)},
            self.secret_key,
            algorithm="HS256"
        )
        
        user_id = self.token_service.decode_token(token)
        assert user_id == 123
        assert isinstance(user_id, int)


class TestCatalogueService:
    """Tests for CatalogueService."""
    
    def test_format_variant(self):
        """Test formatting a variant object."""
        variant = MagicMock()
        variant.id = 1
        variant.name = "Small"
        variant.stock = 10
        variant.productId = 5
        
        result = CatalogueService.format_variant(variant)
        
        assert result["id"] == 1
        assert result["name"] == "Small"
        assert result["stock"] == 10
        assert result["productId"] == 5
    
    def test_format_product(self):
        """Test formatting a product object."""
        product = MagicMock()
        product.id = 5
        product.name = "T-Shirt"
        product.description = "A nice t-shirt"
        product.price = 29.99
        product.categoryId = 2
        
        variants = [{"id": 1, "name": "Small", "stock": 10, "productId": 5}]
        
        result = CatalogueService.format_product(product, variants)
        
        assert result["id"] == 5
        assert result["name"] == "T-Shirt"
        assert result["description"] == "A nice t-shirt"
        assert result["price"] == 29.99
        assert result["categoryId"] == 2
        assert result["variants"] == variants
    
    def test_format_category(self):
        """Test formatting a category object."""
        category = MagicMock()
        category.id = 2
        category.name = "Clothing"
        category.siteId = 1
        
        products = [{"id": 5, "name": "T-Shirt", "variants": []}]
        
        result = CatalogueService.format_category(category, products)
        
        assert result["id"] == 2
        assert result["name"] == "Clothing"
        assert result["siteId"] == 1
        assert result["products"] == products
    
    def test_build_catalogue_response(self):
        """Test building a complete catalogue response."""
        # Create mock objects
        variant = MagicMock()
        variant.id = 1
        variant.name = "Small"
        variant.stock = 10
        variant.productId = 5
        
        product = MagicMock()
        product.id = 5
        product.name = "T-Shirt"
        product.description = "A nice t-shirt"
        product.price = 29.99
        product.categoryId = 2
        product.variants = [variant]
        
        category = MagicMock()
        category.id = 2
        category.name = "Clothing"
        category.siteId = 1
        category.products = [product]
        
        site = MagicMock()
        site.categories = [category]
        
        result = CatalogueService.build_catalogue_response(site)
        
        assert "categories" in result
        assert len(result["categories"]) == 1
        assert result["categories"][0]["name"] == "Clothing"
        assert len(result["categories"][0]["products"]) == 1
        assert result["categories"][0]["products"][0]["name"] == "T-Shirt"
    
    def test_build_catalogue_response_empty(self):
        """Test building catalogue response with empty categories."""
        site = MagicMock()
        site.categories = []
        
        result = CatalogueService.build_catalogue_response(site)
        
        assert result == {"categories": []}


class TestCategoryService:
    """Tests for CategoryService."""
    
    def test_validate_category_name_valid(self):
        """Test that validate_category_name returns True for valid names."""
        assert CategoryService.validate_category_name("Electronics") is True
        assert CategoryService.validate_category_name("a") is True
        assert CategoryService.validate_category_name("Category 123") is True
    
    def test_validate_category_name_empty(self):
        """Test that validate_category_name returns False for empty names."""
        assert CategoryService.validate_category_name("") is False
        assert CategoryService.validate_category_name("   ") is False
    
    def test_validate_category_name_none(self):
        """Test that validate_category_name returns False for None."""
        assert CategoryService.validate_category_name(None) is False
    
    def test_get_category_count(self):
        """Test counting categories."""
        categories = [MagicMock(), MagicMock(), MagicMock()]
        assert CategoryService.get_category_count(categories) == 3
    
    def test_get_category_count_empty(self):
        """Test counting empty categories list."""
        assert CategoryService.get_category_count([]) == 0


class TestProductService:
    """Tests for ProductService."""
    
    def test_validate_product_name_valid(self):
        """Test that validate_product_name returns True for valid names."""
        assert ProductService.validate_product_name("iPhone 15") is True
        assert ProductService.validate_product_name("Product") is True
    
    def test_validate_product_name_empty(self):
        """Test that validate_product_name returns False for empty names."""
        assert ProductService.validate_product_name("") is False
        assert ProductService.validate_product_name("   ") is False
    
    def test_validate_product_name_none(self):
        """Test that validate_product_name returns False for None."""
        assert ProductService.validate_product_name(None) is False
    
    def test_validate_product_price_valid(self):
        """Test that validate_product_price returns True for valid prices."""
        assert ProductService.validate_product_price(0) is True
        assert ProductService.validate_product_price(99.99) is True
        assert ProductService.validate_product_price(1000) is True
    
    def test_validate_product_price_negative(self):
        """Test that validate_product_price returns False for negative prices."""
        assert ProductService.validate_product_price(-1) is False
        assert ProductService.validate_product_price(-0.01) is False
    
    def test_calculate_total_price(self):
        """Test calculating total price."""
        products = [
            {"price": 10.00},
            {"price": 20.00},
            {"price": 30.00}
        ]
        assert ProductService.calculate_total_price(products) == 60.00
    
    def test_calculate_total_price_empty(self):
        """Test calculating total price with empty list."""
        assert ProductService.calculate_total_price([]) == 0
    
    def test_calculate_total_price_missing_price(self):
        """Test calculating total price with missing price field."""
        products = [{"name": "Product 1"}, {"price": 20.00}]
        assert ProductService.calculate_total_price(products) == 20.00
    
    def test_get_product_count(self):
        """Test counting products."""
        products = [MagicMock(), MagicMock()]
        assert ProductService.get_product_count(products) == 2


class TestVariantService:
    """Tests for VariantService."""
    
    def test_validate_variant_name_valid(self):
        """Test that validate_variant_name returns True for valid names."""
        assert VariantService.validate_variant_name("Small") is True
        assert VariantService.validate_variant_name("XL") is True
        assert VariantService.validate_variant_name("Red - 32GB") is True
    
    def test_validate_variant_name_empty(self):
        """Test that validate_variant_name returns False for empty names."""
        assert VariantService.validate_variant_name("") is False
        assert VariantService.validate_variant_name("   ") is False
    
    def test_validate_variant_name_none(self):
        """Test that validate_variant_name returns False for None."""
        assert VariantService.validate_variant_name(None) is False
    
    def test_validate_variant_stock_valid(self):
        """Test that validate_variant_stock returns True for valid stock."""
        assert VariantService.validate_variant_stock(0) is True
        assert VariantService.validate_variant_stock(100) is True
        assert VariantService.validate_variant_stock(999999) is True
    
    def test_validate_variant_stock_negative(self):
        """Test that validate_variant_stock returns False for negative stock."""
        assert VariantService.validate_variant_stock(-1) is False
        assert VariantService.validate_variant_stock(-100) is False
    
    def test_calculate_total_stock(self):
        """Test calculating total stock."""
        variants = [
            {"stock": 10},
            {"stock": 20},
            {"stock": 30}
        ]
        assert VariantService.calculate_total_stock(variants) == 60
    
    def test_calculate_total_stock_empty(self):
        """Test calculating total stock with empty list."""
        assert VariantService.calculate_total_stock([]) == 0
    
    def test_calculate_total_stock_missing_stock(self):
        """Test calculating total stock with missing stock field."""
        variants = [{"name": "Small"}, {"stock": 20}]
        assert VariantService.calculate_total_stock(variants) == 20
    
    def test_get_in_stock_variants(self):
        """Test getting in-stock variants."""
        variants = [
            {"name": "Small", "stock": 10},
            {"name": "Medium", "stock": 0},
            {"name": "Large", "stock": 5}
        ]
        result = VariantService.get_in_stock_variants(variants)
        assert len(result) == 2
        assert result[0]["name"] == "Small"
        assert result[1]["name"] == "Large"
    
    def test_get_in_stock_variants_all_out(self):
        """Test getting in-stock variants when all are out of stock."""
        variants = [
            {"name": "Small", "stock": 0},
            {"name": "Medium", "stock": 0}
        ]
        result = VariantService.get_in_stock_variants(variants)
        assert len(result) == 0
    
    def test_get_out_of_stock_variants(self):
        """Test getting out-of-stock variants."""
        variants = [
            {"name": "Small", "stock": 10},
            {"name": "Medium", "stock": 0},
            {"name": "Large", "stock": 0}
        ]
        result = VariantService.get_out_of_stock_variants(variants)
        assert len(result) == 2
        assert result[0]["name"] == "Medium"
        assert result[1]["name"] == "Large"
    
    def test_get_out_of_stock_variants_all_in_stock(self):
        """Test getting out-of-stock variants when all are in stock."""
        variants = [
            {"name": "Small", "stock": 10},
            {"name": "Medium", "stock": 5}
        ]
        result = VariantService.get_out_of_stock_variants(variants)
        assert len(result) == 0


class TestAuthorizationService:
    """Tests for AuthorizationService."""
    
    def test_is_site_owner_true(self):
        """Test that is_site_owner returns True when user is owner."""
        assert AuthorizationService.is_site_owner(1, 1) is True
        assert AuthorizationService.is_site_owner(42, 42) is True
    
    def test_is_site_owner_false(self):
        """Test that is_site_owner returns False when user is not owner."""
        assert AuthorizationService.is_site_owner(1, 2) is False
        assert AuthorizationService.is_site_owner(42, 43) is False
    
    def test_can_modify_site_owner(self):
        """Test that can_modify_site returns True for site owner."""
        assert AuthorizationService.can_modify_site(1, 1) is True
    
    def test_can_modify_site_not_owner(self):
        """Test that can_modify_site returns False for non-owner."""
        assert AuthorizationService.can_modify_site(1, 2) is False


class TestIntegration:
    """Integration tests between services."""
    
    def test_token_and_authorization_flow(self):
        """Test the flow of token decoding and authorization check."""
        from jose import jwt
        from datetime import datetime, timedelta
        
        secret_key = "integration_test_secret"
        token_service = TokenService(secret_key, "HS256")
        
        # Create a token for user 42
        token = jwt.encode(
            {"sub": "42", "exp": datetime.utcnow() + timedelta(minutes=30)},
            secret_key,
            algorithm="HS256"
        )
        
        # Decode token
        user_id = token_service.decode_token(token)
        assert user_id == 42
        
        # Check authorization
        site_owner_id = 42
        assert AuthorizationService.can_modify_site(site_owner_id, user_id) is True
        
        # Different owner
        other_site_owner_id = 99
        assert AuthorizationService.can_modify_site(other_site_owner_id, user_id) is False
    
    def test_product_and_variant_validation_flow(self):
        """Test product and variant validation together."""
        # Validate product
        product_name = "Gaming Laptop"
        product_price = 1299.99
        
        assert ProductService.validate_product_name(product_name) is True
        assert ProductService.validate_product_price(product_price) is True
        
        # Validate variants
        variants = [
            {"name": "16GB RAM", "stock": 5},
            {"name": "32GB RAM", "stock": 3},
            {"name": "64GB RAM", "stock": 0}
        ]
        
        for v in variants:
            assert VariantService.validate_variant_name(v["name"]) is True
            assert VariantService.validate_variant_stock(v["stock"]) is True
        
        # Check stock levels
        total_stock = VariantService.calculate_total_stock(variants)
        assert total_stock == 8
        
        in_stock = VariantService.get_in_stock_variants(variants)
        assert len(in_stock) == 2
        
        out_of_stock = VariantService.get_out_of_stock_variants(variants)
        assert len(out_of_stock) == 1
        assert out_of_stock[0]["name"] == "64GB RAM"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
