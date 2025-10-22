from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import os
from typing import List, Optional
from models import Base, Site, Category, Product, Variant

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://devops:devops123@postgres:5432/devops_db")

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FastAPI app
app = FastAPI(title="Site Service", version="1.0.0")

# Pydantic models
class VariantResponse(BaseModel):
    id: int
    product_id: int
    sku: str
    attributes: Optional[str]
    price: int
    currency: str
    stock_qty: int

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    slug: str
    category_id: Optional[int]
    variants: List[VariantResponse] = []

    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]
    products: List[ProductResponse] = []

    class Config:
        from_attributes = True

class CatalogResponse(BaseModel):
    site_slug: str
    site_label: str
    categories: List[CategoryResponse]
    products: List[ProductResponse]

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@app.get("/")
def read_root():
    return {"service": "Site Service", "status": "running"}

@app.get("/api/site/{site_slug}/catalog", response_model=CatalogResponse)
def get_catalog(site_slug: str, db: Session = Depends(get_db)):
    # Get site
    site = db.query(Site).filter(Site.slug == site_slug).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    # Get categories for this site
    categories = db.query(Category).filter(Category.id_site == site.id).all()
    
    # Get products for this site
    products = db.query(Product).filter(Product.id_site == site.id).all()
    
    # Build response with variants
    categories_response = []
    for category in categories:
        category_products = [p for p in products if p.category_id == category.id]
        products_with_variants = []
        
        for product in category_products:
            variants = db.query(Variant).filter(Variant.product_id == product.id).all()
            product_dict = {
                "id": product.id,
                "title": product.title,
                "description": product.description,
                "slug": product.slug,
                "category_id": product.category_id,
                "variants": [VariantResponse.from_orm(v) for v in variants]
            }
            products_with_variants.append(product_dict)
        
        categories_response.append({
            "id": category.id,
            "name": category.name,
            "parent_id": category.parent_id,
            "products": products_with_variants
        })
    
    # All products with variants
    all_products_response = []
    for product in products:
        variants = db.query(Variant).filter(Variant.product_id == product.id).all()
        product_dict = {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "slug": product.slug,
            "category_id": product.category_id,
            "variants": [VariantResponse.from_orm(v) for v in variants]
        }
        all_products_response.append(product_dict)
    
    return {
        "site_slug": site.slug,
        "site_label": site.label,
        "categories": categories_response,
        "products": all_products_response
    }

@app.get("/health")
def health():
    return {"status": "healthy"}