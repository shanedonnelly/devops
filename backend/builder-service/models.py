from pydantic import BaseModel
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

class SiteResponse(BaseModel):
    id: int
    siteName: str
    stringId: str
    userId: int
    createdAt: str

class SiteUpdate(BaseModel):
    site_name: str

class SiteConfig(BaseModel):
    css_template: str
    title: str
    description: str
    contact_text: str