from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os
from models import Base, User, Site

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://devops:devops123@postgres:5432/devops_db")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
PUBLIC_URL = os.getenv("PUBLIC_URL", "http://localhost:8001")

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FastAPI app
app = FastAPI(title="Builder Service", version="1.0.0")
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    pseudo: str
    password: str

class UserLogin(BaseModel):
    pseudo: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SiteCreate(BaseModel):
    label: str

class SiteResponse(BaseModel):
    id: int
    label: str
    slug: str
    url: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(datetime.timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Routes
@app.get("/")
def read_root():
    return {"service": "Builder Service", "status": "running"}

@app.post("/api/builder/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.pseudo == user.pseudo).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create user
    hashed_password = pwd_context.hash(user.password)
    new_user = User(pseudo=user.pseudo, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    access_token = create_access_token(data={"sub": new_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/builder/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.pseudo == user.pseudo).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": db_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/builder/sites", response_model=SiteResponse)
def create_site(site: SiteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Generate slug
    slug = site.label.lower().replace(" ", "-")
    
    # Check if slug exists
    existing_site = db.query(Site).filter(Site.slug == slug).first()
    if existing_site:
        raise HTTPException(status_code=400, detail="Site with this name already exists")
    
    # Create site
    url = f"{PUBLIC_URL}/site/{slug}"
    new_site = Site(user_id=current_user.id, label=site.label, slug=slug, url=url)
    db.add(new_site)
    db.commit()
    db.refresh(new_site)
    
    return new_site

@app.get("/api/builder/sites", response_model=list[SiteResponse])
def get_my_sites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sites = db.query(Site).filter(Site.user_id == current_user.id).all()
    return sites

@app.delete("/api/builder/sites/{site_id}")
def delete_site(site_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id, Site.user_id == current_user.id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    db.delete(site)
    db.commit()
    return {"message": "Site deleted successfully"}

@app.get("/health")
def health():
    return {"status": "healthy"}