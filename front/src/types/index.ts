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