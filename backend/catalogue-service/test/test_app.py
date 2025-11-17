import os
import json
from typing import Any
from fastapi.testclient import TestClient
from jose import jwt

# Set dummy secret for JWT decoding
os.environ.setdefault("SECRET_KEY", "test-secret")

import app  # noqa: E402

client = TestClient(app.app)

# ------------------ Helper Fakes ------------------

class FakeVariant:
    def __init__(self, id=1, name="V1", stock=10, productId=1):
        self.id = id
        self.name = name
        self.stock = stock
        self.productId = productId

class FakeProduct:
    def __init__(self, id=1, name="Prod1", description="Desc", price=9.99, categoryId=1, variants=None):
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.categoryId = categoryId
        self.variants = variants or [FakeVariant()]

class FakeCategory:
    def __init__(self, id=1, name="Cat1", siteId=1, products=None):
        self.id = id
        self.name = name
        self.siteId = siteId
        self.products = products or [FakeProduct()]

class FakeSite:
    def __init__(self, id=1, stringId="site-x", userId=99, categories=None):
        self.id = id
        self.stringId = stringId
        self.userId = userId
        self.categories = categories or [FakeCategory()]

class FakeDB:
    def __init__(self, site: Any = None):
        self._site = site
        self.category = self  # for delete_many, create
        self.product = self
        self.variant = self

    async def site_find_unique(self, where, include=None):
        return self._site

    async def site_find_unique_include(self, where, include=None):
        return self._site

    async def site_find_unique_wrapper(self, where, include=None):
        # mimic prisma original signature used in code (find_unique)
        return self._site

    async def site_find_unique(self, where, include=None):  # duplicate for clarity
        return self._site

    async def site_find_unique(self, where, include=None):
        return self._site

    async def site_find_unique(self, where, include=None):
        return self._site

    async def site_find_unique(self, where, include=None):
        return self._site

    # Methods used in update routine
    async def category_delete_many(self, where):
        return None

    async def category_create(self, data):
        return FakeCategory(id=2, name=data["name"], siteId=data["siteId"], products=[])

    async def product_create(self, data):
        return FakeProduct(id=2, name=data["name"], description=data["description"], price=data["price"], categoryId=data["categoryId"], variants=[])

    async def variant_create(self, data):
        return FakeVariant(id=2, name=data["name"], stock=data["stock"], productId=data["productId"])

    # Prisma attribute access simulation
    async def site_find_unique(self, where, include=None):
        return self._site

    async def site_find_unique(self, where, include=None):
        return self._site

    async def site_find_unique(self, where, include=None):
        return self._site

    async def site_find_unique(self, where, include=None):
        return self._site

class FakePrismaContext:
    def __init__(self, site: Any = None):
        self._site = site

    async def __aenter__(self):
        # Accessor mimicking prisma pattern: db.site.find_unique(...)
        class SiteAccessor:
            async def find_unique(_self, where, include=None):
                return self._site

        class CategoryAccessor:
            async def delete_many(_self, where):
                return None
            async def create(_self, data):
                return FakeCategory(id=2, name=data["name"], siteId=data["siteId"], products=[])

        class ProductAccessor:
            async def create(_self, data):
                return FakeProduct(id=2, name=data["name"], description=data["description"], price=data["price"], categoryId=data["categoryId"], variants=[])

        class VariantAccessor:
            async def create(_self, data):
                return FakeVariant(id=2, name=data["name"], stock=data["stock"], productId=data["productId"])

        class DBWrapper:
            site = SiteAccessor()
            category = CategoryAccessor()
            product = ProductAccessor()
            variant = VariantAccessor()

        return DBWrapper()

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        return False

# ------------------ Tests ------------------

def test_root_health():
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("service") == "catalogue-service"
    assert data.get("status") == "running"


def test_get_catalogue_not_found(monkeypatch):
    # Force site None
    monkeypatch.setattr("app.Prisma", lambda: FakePrismaContext(site=None))
    r = client.get("/sites/unknown/catalogue")
    assert r.status_code == 404


def test_get_catalogue_success(monkeypatch):
    site = FakeSite(stringId="site-ok", userId=42)
    monkeypatch.setattr("app.Prisma", lambda: FakePrismaContext(site=site))
    r = client.get("/sites/site-ok/catalogue")
    assert r.status_code == 200
    data = r.json()
    assert "categories" in data and len(data["categories"]) >= 1
    cat = data["categories"][0]
    assert "products" in cat and len(cat["products"]) >= 1
    prod = cat["products"][0]
    assert "variants" in prod and len(prod["variants"]) >= 1


def test_update_catalogue_unauthenticated():
    # No Authorization header -> 403 from HTTPBearer
    r = client.put("/sites/site-ok/catalogue", json={"categories": []})
    assert r.status_code == 403


def _make_token(uid: int) -> str:
    secret = os.environ["SECRET_KEY"]
    return jwt.encode({"sub": str(uid)}, secret, algorithm="HS256")


def test_update_catalogue_forbidden(monkeypatch):
    # Site userId differs from token user id
    site = FakeSite(stringId="site-ok", userId=999)  # owner is 999
    monkeypatch.setattr("app.Prisma", lambda: FakePrismaContext(site=site))
    token = _make_token(uid=42)  # not owner
    r = client.put(
        "/sites/site-ok/catalogue",
        headers={"Authorization": f"Bearer {token}"},
        json={"categories": []},
    )
    assert r.status_code == 403


def test_update_catalogue_success(monkeypatch):
    site = FakeSite(stringId="site-ok", userId=42)  # owner matches token
    monkeypatch.setattr("app.Prisma", lambda: FakePrismaContext(site=site))
    token = _make_token(uid=42)
    payload = {"categories": [{"name": "NewCat", "products": []}]}
    r = client.put(
        "/sites/site-ok/catalogue",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert r.status_code == 200
    assert r.json().get("message") == "Catalogue updated successfully"

if __name__ == "__main__":
    import pytest, sys
    code = pytest.main([__file__])
    sys.exit(code)
