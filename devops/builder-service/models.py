from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    pseudo = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
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
    attributes = Column(String)  # JSON stocké en string
    price = Column(Integer, nullable=False)  # En centimes
    currency = Column(String, default="EUR")
    stock_qty = Column(Integer, default=0)

class Media(Base):
    __tablename__ = "media"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    url = Column(String, nullable=False)
    alt = Column(String)
    sort_order = Column(Integer, default=0)

class Promotion(Base):
    __tablename__ = "promotions"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    type = Column(String, nullable=False)
    value = Column(Integer, nullable=False)
    start_at = Column(DateTime(timezone=True))
    end_at = Column(DateTime(timezone=True))
    active = Column(Integer, default=1)

class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    traffic_split = Column(Integer)
    start_at = Column(DateTime(timezone=True))
    end_at = Column(DateTime(timezone=True))

class VariantAssignment(Base):
    __tablename__ = "variant_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    user_key = Column(String, nullable=False)
    arm = Column(String, nullable=False)

class Metrics(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    arm = Column(String, nullable=False)
    metric_name = Column(String, nullable=False)
    metric_value = Column(Integer, nullable=False)
    ts = Column(DateTime(timezone=True), server_default=func.now())