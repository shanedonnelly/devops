"""
Test suite for Builder Service

This test file tests all service layer functions.
When run inside Dockerfile.test, if any test fails, the container exits with code 1.
"""

import pytest
import json
from unittest.mock import MagicMock, patch
from service import PasswordService, TokenService, SiteConfigService, SiteService, UserService


class TestPasswordService:
    """Tests for PasswordService."""
    
    def test_hash_password_returns_string(self):
        """Test that hash_password returns a string."""
        password = "my_secret_password"
        hashed = PasswordService.hash_password(password)
        assert isinstance(hashed, str)
        assert hashed != password
    
    def test_hash_password_different_for_same_password(self):
        """Test that hashing the same password twice gives different results (due to salt)."""
        password = "my_secret_password"
        hash1 = PasswordService.hash_password(password)
        hash2 = PasswordService.hash_password(password)
        assert hash1 != hash2
    
    def test_verify_password_correct(self):
        """Test that verify_password returns True for correct password."""
        password = "my_secret_password"
        hashed = PasswordService.hash_password(password)
        assert PasswordService.verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test that verify_password returns False for incorrect password."""
        password = "my_secret_password"
        hashed = PasswordService.hash_password(password)
        assert PasswordService.verify_password("wrong_password", hashed) is False
    
    def test_verify_password_empty_password(self):
        """Test verify_password with empty password."""
        password = ""
        hashed = PasswordService.hash_password(password)
        assert PasswordService.verify_password("", hashed) is True
        assert PasswordService.verify_password("something", hashed) is False
    
    def test_hash_password_unicode(self):
        """Test hashing password with unicode characters."""
        password = "пароль123密码"
        hashed = PasswordService.hash_password(password)
        assert PasswordService.verify_password(password, hashed) is True
    
    def test_hash_password_long_password(self):
        """Test hashing a very long password."""
        password = "a" * 1000
        hashed = PasswordService.hash_password(password)
        assert PasswordService.verify_password(password, hashed) is True


class TestTokenService:
    """Tests for TokenService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.secret_key = "test_secret_key_12345"
        self.token_service = TokenService(self.secret_key, "HS256", 30)
    
    def test_create_access_token_returns_string(self):
        """Test that create_access_token returns a string."""
        token = self.token_service.create_access_token({"sub": 1})
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_create_access_token_with_int_sub(self):
        """Test that create_access_token converts int sub to string."""
        token = self.token_service.create_access_token({"sub": 123})
        user_id = self.token_service.decode_token(token)
        assert user_id == 123
    
    def test_create_access_token_with_string_sub(self):
        """Test that create_access_token works with string sub."""
        token = self.token_service.create_access_token({"sub": "456"})
        user_id = self.token_service.decode_token(token)
        assert user_id == 456
    
    def test_decode_token_valid(self):
        """Test decoding a valid token."""
        original_user_id = 42
        token = self.token_service.create_access_token({"sub": original_user_id})
        decoded_user_id = self.token_service.decode_token(token)
        assert decoded_user_id == original_user_id
    
    def test_decode_token_invalid(self):
        """Test decoding an invalid token returns None."""
        result = self.token_service.decode_token("invalid_token")
        assert result is None
    
    def test_decode_token_wrong_secret(self):
        """Test decoding a token with wrong secret returns None."""
        token = self.token_service.create_access_token({"sub": 1})
        other_service = TokenService("different_secret", "HS256", 30)
        result = other_service.decode_token(token)
        assert result is None
    
    def test_decode_token_missing_sub(self):
        """Test decoding a token without sub returns None."""
        # Create a token manually without sub
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
    
    def test_token_service_different_algorithms(self):
        """Test TokenService with different expiration times."""
        short_service = TokenService(self.secret_key, "HS256", 1)
        long_service = TokenService(self.secret_key, "HS256", 60)
        
        token1 = short_service.create_access_token({"sub": 1})
        token2 = long_service.create_access_token({"sub": 1})
        
        # Both tokens should be valid initially
        assert short_service.decode_token(token1) == 1
        assert long_service.decode_token(token2) == 1


class TestSiteConfigService:
    """Tests for SiteConfigService."""
    
    def setup_method(self):
        """Set up test fixtures with mocked MinIO client."""
        self.mock_minio = MagicMock()
        self.bucket_name = "test-bucket"
        self.service = SiteConfigService(self.mock_minio, self.bucket_name)
    
    def test_ensure_bucket_exists_creates_bucket(self):
        """Test that ensure_bucket_exists creates bucket if it doesn't exist."""
        self.mock_minio.bucket_exists.return_value = False
        result = self.service.ensure_bucket_exists()
        assert result is True
        self.mock_minio.make_bucket.assert_called_once_with(self.bucket_name)
    
    def test_ensure_bucket_exists_already_exists(self):
        """Test that ensure_bucket_exists doesn't create bucket if it exists."""
        self.mock_minio.bucket_exists.return_value = True
        result = self.service.ensure_bucket_exists()
        assert result is True
        self.mock_minio.make_bucket.assert_not_called()
    
    def test_ensure_bucket_exists_error(self):
        """Test that ensure_bucket_exists returns False on error."""
        self.mock_minio.bucket_exists.side_effect = Exception("Connection error")
        result = self.service.ensure_bucket_exists()
        assert result is False
    
    def test_create_default_config(self):
        """Test creating default configuration."""
        result = self.service.create_default_config("test-site")
        assert result is True
        self.mock_minio.put_object.assert_called_once()
        call_args = self.mock_minio.put_object.call_args
        assert call_args[0][0] == self.bucket_name
        assert call_args[0][1] == "test-site.json"
    
    def test_save_config_success(self):
        """Test saving configuration successfully."""
        config = {"title": "My Site", "description": "Test"}
        result = self.service.save_config("my-site", config)
        assert result is True
        self.mock_minio.put_object.assert_called_once()
    
    def test_save_config_error(self):
        """Test saving configuration with error."""
        self.mock_minio.put_object.side_effect = Exception("Upload error")
        config = {"title": "My Site"}
        result = self.service.save_config("my-site", config)
        assert result is False
    
    def test_get_config_success(self):
        """Test getting configuration successfully."""
        config = {"title": "My Site", "description": "Test"}
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(config).encode("utf-8")
        self.mock_minio.get_object.return_value = mock_response
        
        result = self.service.get_config("my-site")
        assert result == config
    
    def test_get_config_not_found(self):
        """Test getting configuration that doesn't exist."""
        self.mock_minio.get_object.side_effect = Exception("Not found")
        result = self.service.get_config("nonexistent-site")
        assert result is None
    
    def test_delete_config_success(self):
        """Test deleting configuration successfully."""
        result = self.service.delete_config("my-site")
        assert result is True
        self.mock_minio.remove_object.assert_called_once_with(
            self.bucket_name, "my-site.json"
        )
    
    def test_delete_config_error(self):
        """Test deleting configuration with error."""
        self.mock_minio.remove_object.side_effect = Exception("Delete error")
        result = self.service.delete_config("my-site")
        assert result is False


class TestSiteService:
    """Tests for SiteService."""
    
    def test_generate_string_id_lowercase(self):
        """Test that generate_string_id converts to lowercase."""
        result = SiteService.generate_string_id("My Site")
        assert result == "my-site"
    
    def test_generate_string_id_replaces_spaces(self):
        """Test that generate_string_id replaces spaces with dashes."""
        result = SiteService.generate_string_id("My New Site")
        assert result == "my-new-site"
    
    def test_generate_string_id_multiple_spaces(self):
        """Test that generate_string_id handles multiple spaces."""
        result = SiteService.generate_string_id("My  Site")
        assert result == "my--site"
    
    def test_generate_string_id_already_lowercase(self):
        """Test that generate_string_id handles already lowercase text."""
        result = SiteService.generate_string_id("my-site")
        assert result == "my-site"
    
    def test_generate_string_id_with_numbers(self):
        """Test that generate_string_id handles numbers."""
        result = SiteService.generate_string_id("Site 123")
        assert result == "site-123"
    
    def test_generate_string_id_empty_string(self):
        """Test generate_string_id with empty string."""
        result = SiteService.generate_string_id("")
        assert result == ""
    
    def test_validate_site_name_valid(self):
        """Test that validate_site_name returns True for valid names."""
        assert SiteService.validate_site_name("My Site") is True
        assert SiteService.validate_site_name("a") is True
    
    def test_validate_site_name_empty(self):
        """Test that validate_site_name returns False for empty names."""
        assert SiteService.validate_site_name("") is False
        assert SiteService.validate_site_name("   ") is False
    
    def test_validate_site_name_none(self):
        """Test that validate_site_name returns False for None."""
        assert SiteService.validate_site_name(None) is False


class TestUserService:
    """Tests for UserService."""
    
    def test_validate_username_valid(self):
        """Test that validate_username returns True for valid usernames."""
        assert UserService.validate_username("john") is True
        assert UserService.validate_username("john_doe") is True
        assert UserService.validate_username("abc") is True
    
    def test_validate_username_too_short(self):
        """Test that validate_username returns False for short usernames."""
        assert UserService.validate_username("ab") is False
        assert UserService.validate_username("a") is False
    
    def test_validate_username_empty(self):
        """Test that validate_username returns False for empty usernames."""
        assert UserService.validate_username("") is False
        assert UserService.validate_username("   ") is False
    
    def test_validate_username_none(self):
        """Test that validate_username returns False for None."""
        assert UserService.validate_username(None) is False
    
    def test_validate_password_valid(self):
        """Test that validate_password returns True for valid passwords."""
        assert UserService.validate_password("password123") is True
        assert UserService.validate_password("a") is True
    
    def test_validate_password_empty(self):
        """Test that validate_password returns False for empty passwords."""
        assert UserService.validate_password("") is False
    
    def test_validate_password_none(self):
        """Test that validate_password returns False for None."""
        assert UserService.validate_password(None) is False


class TestIntegration:
    """Integration tests between services."""
    
    def test_password_hash_and_token_flow(self):
        """Test the flow of hashing password and creating token."""
        # Hash password
        password = "test_password"
        hashed = PasswordService.hash_password(password)
        
        # Verify password
        assert PasswordService.verify_password(password, hashed) is True
        
        # Create token
        secret_key = "integration_test_secret"
        token_service = TokenService(secret_key, "HS256", 30)
        token = token_service.create_access_token({"sub": 1})
        
        # Decode token
        user_id = token_service.decode_token(token)
        assert user_id == 1
    
    def test_site_string_id_validation(self):
        """Test site name validation and string ID generation."""
        site_name = "My New Site"
        
        # Validate
        assert SiteService.validate_site_name(site_name) is True
        
        # Generate string ID
        string_id = SiteService.generate_string_id(site_name)
        assert string_id == "my-new-site"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
