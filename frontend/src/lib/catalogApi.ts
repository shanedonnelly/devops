import { getStoredToken } from './builderApi';

export type Variant = {
  id?: number;
  name: string;
  stock: number;
};

export type ProductResponse = {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  variants: Variant[];
};

export type CategoryResponse = {
  id: number;
  name: string;
  siteId: number;
  products: ProductResponse[];
};

export type CatalogueResponse = {
  categories: CategoryResponse[];
};

const BASE = '/api/catalogue-service';

async function request(path: string, opts: RequestInit = {}) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Catalogue API ${res.status} ${res.statusText} - ${text}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return null;
}

export async function getCatalogue(siteStringId: string): Promise<CatalogueResponse> {
  return request(`/api/sites/${encodeURIComponent(siteStringId)}/catalogue`);
}

export type CategoryCreate = {
  name: string;
  products: Array<{
    name: string;
    description: string;
    price: number;
    variants: Array<{ name: string; stock: number }>;
  }>;
};

export async function updateCatalogue(siteStringId: string, categories: CategoryCreate[]) {
  const body = JSON.stringify({ categories });
  return request(`/api/sites/${encodeURIComponent(siteStringId)}/catalogue`, { method: 'PUT', body });
}
