export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface Site {
  id: number;
  siteName: string;
  stringId: string;
  userId: number;
  createdAt: string;
}

export interface SiteConfig {
  css_template: string;
  title: string;
  description: string;
  contact_text: string;
}

export interface SiteCreate {
  site_name: string;
}

export interface SiteUpdate {
  site_name: string;
}

export interface VariantCreate {
  name: string;
  stock: number;
}

export interface VariantResponse {
  id: number;
  name: string;
  stock: number;
  productId: number;
}

export interface ProductCreate {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  variants: VariantCreate[];
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  variants: VariantResponse[];
}

export interface CategoryCreate {
  name: string;
  products: ProductCreate[];
}

export interface CategoryResponse {
  id: number;
  name: string;
  siteId: number;
  products: ProductResponse[];
}

export interface CatalogueResponse {
  categories: CategoryResponse[];
}

export interface CatalogueUpdate {
  categories: CategoryCreate[];
}