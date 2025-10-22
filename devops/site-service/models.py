from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    label = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    url = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    id_site = Column(Integer, ForeignKey("sites.id"), nullable=False)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    id_site = Column(Integer, ForeignKey("sites.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    slug = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Variant(Base):
    __tablename__ = "variants"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    sku = Column(String, unique=True, nullable=False)
    attributes = Column(String)
    price = Column(Integer, nullable=False)
    currency = Column(String, default="EUR")
    stock_qty = Column(Integer, default=0)