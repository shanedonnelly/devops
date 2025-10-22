from pydantic import BaseModel
from typing import List

class VariantResponse(BaseModel):
    id: int
    name: str
    stock: int
    productId: int

class VariantCreate(BaseModel):
    name: str
    stock: int

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    categoryId: int
    variants: List[VariantResponse]

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    variants: List[VariantCreate]

class CategoryResponse(BaseModel):
    id: int
    name: str
    siteId: int
    products: List[ProductResponse]

class CategoryCreate(BaseModel):
    name: str
    products: List[ProductCreate]

class CatalogueResponse(BaseModel):
    categories: List[CategoryResponse]

class CatalogueUpdate(BaseModel):
    categories: List[CategoryCreate]