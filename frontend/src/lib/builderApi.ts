export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type SiteResponse = {
  id: number;
  siteName: string;
  stringId: string;
  userId: number;
  createdAt: string;
};

export type SiteConfig = {
  css_template: string;
  title: string;
  description: string;
  contact_text: string;
};

const BASE = '/api/builder-service';
const TOKEN_KEY = 'builder_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path: string, opts: RequestInit = {}) {
  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...((opts.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${res.statusText} - ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

export async function login(username: string, password: string) {
  const body = JSON.stringify({ username, password });
  const data = await request('/login', { method: 'POST', body });
  const token = (data as TokenResponse).access_token;
  if (token) saveToken(token);
  return data as TokenResponse;
}

export async function register(username: string, password: string) {
  const body = JSON.stringify({ username, password });
  const data = await request('/register', { method: 'POST', body });
  const token = (data as TokenResponse).access_token;
  if (token) saveToken(token);
  return data as TokenResponse;
}

export async function getSites(): Promise<SiteResponse[]> {
  return request('/sites');
}

export async function createSite(site_name: string): Promise<SiteResponse> {
  const body = JSON.stringify({ site_name });
  return request('/sites', { method: 'POST', body });
}

export async function updateSite(id: number, site_name: string): Promise<SiteResponse> {
  const body = JSON.stringify({ site_name });
  return request(`/sites/${id}`, { method: 'PUT', body });
}

export async function deleteSite(id: number) {
  return request(`/sites/${id}`, { method: 'DELETE' });
}

export async function updateSiteConfig(id: number, config: SiteConfig) {
  const body = JSON.stringify(config);
  return request(`/sites/${id}/config`, { method: 'PUT', body });
}

export async function getSiteConfig(string_id: string): Promise<SiteConfig> {
  return request(`/sites/${string_id}/config`);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken() {
  return getToken();
}