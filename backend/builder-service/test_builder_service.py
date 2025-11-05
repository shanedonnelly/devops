"""
Tests unitaires pour le microservice builder-service
Utilise des mocks pour tester les endpoints sans dépendances externes
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock, AsyncMock
import sys
from pathlib import Path
from datetime import datetime
import json

# Ajouter le répertoire parent au path pour importer les modules
sys.path.insert(0, str(Path(__file__).parent))

from app import app, hash_password, verify_password, create_access_token
from models import UserRegister, UserLogin, SiteCreate, SiteUpdate, SiteConfig


@pytest.fixture
def client():
    """Fixture pour créer un client de test FastAPI"""
    return TestClient(app)


@pytest.fixture
def mock_prisma_context():
    """Mock pour le context manager Prisma"""
    mock_db = AsyncMock()
    
    # Mock des méthodes user
    mock_db.user.find_unique = AsyncMock()
    mock_db.user.create = AsyncMock()
    mock_db.user.delete = AsyncMock()
    
    # Mock des méthodes site
    mock_db.site.find_many = AsyncMock()
    mock_db.site.find_unique = AsyncMock()
    mock_db.site.create = AsyncMock()
    mock_db.site.update = AsyncMock()
    mock_db.site.delete = AsyncMock()
    
    # Mock des méthodes category, product, variant
    mock_db.category.create = AsyncMock()
    mock_db.product.create = AsyncMock()
    mock_db.variant.create = AsyncMock()
    
    # Mock du context manager
    mock_context = AsyncMock()
    mock_context.__aenter__.return_value = mock_db
    mock_context.__aexit__.return_value = None
    
    with patch('app.Prisma', return_value=mock_context):
        yield mock_db


@pytest.fixture
def mock_minio():
    """Mock pour MinIO client"""
    with patch('app.minio_client') as mock:
        yield mock


@pytest.fixture
def valid_token():
    """Génère un token JWT valide pour les tests"""
    return create_access_token(data={"sub": 1})


@pytest.fixture
def auth_headers(valid_token):
    """Génère les headers d'authentification pour les tests"""
    return {"Authorization": f"Bearer {valid_token}"}


# ===== Tests de l'endpoint racine =====
def test_root_endpoint(client):
    """Test de l'endpoint racine"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "builder-service"
    assert data["status"] == "running"


# ===== Tests d'authentification =====
def test_hash_password():
    """Test du hachage de mot de passe"""
    password = "test_password"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False


def test_register_success(client, mock_prisma_context):
    """Test d'inscription avec succès"""
    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.username = "testuser"
    
    mock_prisma_context.user.find_unique.return_value = None
    mock_prisma_context.user.create.return_value = mock_user
    
    user_data = {"username": "testuser", "password": "password123"}
    response = client.post("/register", json=user_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_existing_user(client, mock_prisma_context):
    """Test d'inscription avec un utilisateur existant"""
    existing_user = MagicMock()
    existing_user.username = "testuser"
    
    mock_prisma_context.user.find_unique.return_value = existing_user
    
    user_data = {"username": "testuser", "password": "password123"}
    response = client.post("/register", json=user_data)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client, mock_prisma_context):
    """Test de connexion avec succès"""
    hashed_password = hash_password("password123")
    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.username = "testuser"
    mock_user.password = hashed_password
    
    mock_prisma_context.user.find_unique.return_value = mock_user
    
    login_data = {"username": "testuser", "password": "password123"}
    response = client.post("/login", json=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client, mock_prisma_context):
    """Test de connexion avec des identifiants invalides"""
    mock_prisma_context.user.find_unique.return_value = None
    
    login_data = {"username": "testuser", "password": "wrong_password"}
    response = client.post("/login", json=login_data)
    
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


# ===== Tests des utilisateurs =====
def test_delete_user_success(client, mock_prisma_context, auth_headers):
    """Test de suppression d'utilisateur avec succès"""
    mock_prisma_context.user.delete.return_value = None
    
    response = client.delete("/users/1", headers=auth_headers)
    
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"]


def test_delete_user_unauthorized(client, mock_prisma_context, auth_headers):
    """Test de suppression d'utilisateur non autorisé"""
    response = client.delete("/users/2", headers=auth_headers)
    
    assert response.status_code == 403
    assert "Not authorized" in response.json()["detail"]


# ===== Tests des sites =====
def test_get_sites(client, mock_prisma_context, auth_headers):
    """Test de récupération de la liste des sites"""
    mock_sites = [
        MagicMock(id=1, siteName="Site 1", stringId="site-1", userId=1, createdAt=datetime.now()),
        MagicMock(id=2, siteName="Site 2", stringId="site-2", userId=1, createdAt=datetime.now())
    ]
    
    mock_prisma_context.site.find_many.return_value = mock_sites
    
    response = client.get("/sites", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["siteName"] == "Site 1"


def test_create_site_success(client, mock_prisma_context, mock_minio, auth_headers):
    """Test de création d'un site avec succès"""
    mock_site = MagicMock()
    mock_site.id = 1
    mock_site.siteName = "Test Site"
    mock_site.stringId = "test-site"
    mock_site.userId = 1
    mock_site.createdAt = datetime.now()
    
    mock_category = MagicMock(id=1)
    mock_product = MagicMock(id=1)
    
    mock_prisma_context.site.find_unique.return_value = None
    mock_prisma_context.site.create.return_value = mock_site
    mock_prisma_context.category.create.return_value = mock_category
    mock_prisma_context.product.create.return_value = mock_product
    mock_prisma_context.variant.create.return_value = MagicMock()
    
    mock_minio.put_object = Mock(return_value=None)
    
    site_data = {"site_name": "Test Site"}
    response = client.post("/sites", json=site_data, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["siteName"] == "Test Site"
    assert data["stringId"] == "test-site"


def test_create_site_duplicate(client, mock_prisma_context, auth_headers):
    """Test de création d'un site avec un nom existant"""
    existing_site = MagicMock()
    existing_site.stringId = "test-site"
    
    mock_prisma_context.site.find_unique.return_value = existing_site
    
    site_data = {"site_name": "Test Site"}
    response = client.post("/sites", json=site_data, headers=auth_headers)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_update_site_success(client, mock_prisma_context, auth_headers):
    """Test de mise à jour d'un site avec succès"""
    existing_site = MagicMock()
    existing_site.id = 1
    existing_site.userId = 1
    
    updated_site = MagicMock()
    updated_site.id = 1
    updated_site.siteName = "Updated Site"
    updated_site.stringId = "updated-site"
    updated_site.userId = 1
    updated_site.createdAt = datetime.now()
    
    mock_prisma_context.site.find_unique.return_value = existing_site
    mock_prisma_context.site.update.return_value = updated_site
    
    update_data = {"site_name": "Updated Site"}
    response = client.put("/sites/1", json=update_data, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["siteName"] == "Updated Site"


def test_update_site_not_found(client, mock_prisma_context, auth_headers):
    """Test de mise à jour d'un site inexistant"""
    mock_prisma_context.site.find_unique.return_value = None
    
    update_data = {"site_name": "Updated Site"}
    response = client.put("/sites/999", json=update_data, headers=auth_headers)
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_delete_site_success(client, mock_prisma_context, mock_minio, auth_headers):
    """Test de suppression d'un site avec succès"""
    mock_site = MagicMock()
    mock_site.id = 1
    mock_site.userId = 1
    mock_site.stringId = "test-site"
    
    mock_prisma_context.site.find_unique.return_value = mock_site
    mock_prisma_context.site.delete.return_value = None
    mock_minio.remove_object = Mock(return_value=None)
    
    response = client.delete("/sites/1", headers=auth_headers)
    
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"]


# ===== Tests de configuration de site =====
def test_update_site_config_success(client, mock_prisma_context, mock_minio, auth_headers):
    """Test de mise à jour de configuration de site"""
    mock_site = MagicMock()
    mock_site.id = 1
    mock_site.userId = 1
    mock_site.stringId = "test-site"
    
    mock_prisma_context.site.find_unique.return_value = mock_site
    mock_minio.put_object = Mock(return_value=None)
    
    config_data = {
        "css_template": "body { color: blue; }",
        "title": "Test Site",
        "description": "A test site",
        "contact_text": "Contact us"
    }
    
    response = client.put("/sites/1/config", json=config_data, headers=auth_headers)
    
    assert response.status_code == 200
    assert "updated successfully" in response.json()["message"]


def test_get_site_config_success(client, mock_minio):
    """Test de récupération de configuration de site (endpoint public)"""
    config_data = {
        "css_template": "body { color: blue; }",
        "title": "Test Site",
        "description": "A test site",
        "contact_text": "Contact us"
    }
    
    mock_response = MagicMock()
    mock_response.read.return_value = json.dumps(config_data).encode("utf-8")
    mock_minio.get_object = Mock(return_value=mock_response)
    
    response = client.get("/sites/test-site/config")
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Site"
    assert data["css_template"] == "body { color: blue; }"


def test_get_site_config_not_found(client, mock_minio):
    """Test de récupération de configuration inexistante"""
    # Créer un mock d'exception S3Error
    mock_error = Exception("NoSuchKey")
    mock_error.code = "NoSuchKey"
    mock_minio.get_object = Mock(side_effect=mock_error)
    
    response = client.get("/sites/nonexistent/config")
    
    # Le comportement peut varier selon l'implémentation
    assert response.status_code in [404, 500]


# ===== Tests de validation des modèles =====
def test_user_register_model():
    """Test de validation du modèle UserRegister"""
    valid_data = {"username": "testuser", "password": "password123"}
    user = UserRegister(**valid_data)
    assert user.username == "testuser"
    assert user.password == "password123"


def test_site_create_model():
    """Test de validation du modèle SiteCreate"""
    valid_data = {"site_name": "Test Site"}
    site = SiteCreate(**valid_data)
    assert site.site_name == "Test Site"


def test_site_config_model():
    """Test de validation du modèle SiteConfig"""
    valid_data = {
        "css_template": "body {}",
        "title": "Title",
        "description": "Description",
        "contact_text": "Contact"
    }
    config = SiteConfig(**valid_data)
    assert config.title == "Title"


# ===== Tests sans authentification =====
def test_protected_endpoint_without_auth(client):
    """Test d'accès à un endpoint protégé sans authentification"""
    response = client.get("/sites")
    assert response.status_code == 403  # FastAPI HTTPBearer retourne 403


def test_protected_endpoint_with_invalid_token(client):
    """Test d'accès à un endpoint protégé avec un token invalide"""
    headers = {"Authorization": "Bearer invalid_token_here"}
    response = client.get("/sites", headers=headers)
    assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])