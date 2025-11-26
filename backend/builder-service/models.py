from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class SiteCreate(BaseModel):
    site_name: str

class SiteUpdate(BaseModel):
    site_name: str

class SiteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    siteName: str
    stringId: str
    userId: int
    createdAt: datetime

class SiteConfig(BaseModel):
    css_template: str
    title: str
    description: str
    contact_text: str