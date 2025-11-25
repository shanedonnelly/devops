import axios from 'axios';
import type { TokenResponse, UserCredentials, Site, SiteConfig, SiteCreate, SiteUpdate, CatalogueResponse, CatalogueUpdate } from '../types';

const API_BASE_URL = window.location.origin + "/devops/api"

console.log("API_BASE_URL:", API_BASE_URL);

const builderApi = axios.create({
  baseURL: `${API_BASE_URL}/builder-service`,
});

const catalogueApiClient = axios.create({
  baseURL: `${API_BASE_URL}/catalogue-service`,
});

builderApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

catalogueApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (credentials: UserCredentials): Promise<TokenResponse> => {
    console.log(API_BASE_URL);
    const response = await builderApi.post<TokenResponse>('/register', credentials);
    return response.data;
  },

  login: async (credentials: UserCredentials): Promise<TokenResponse> => {
    const response = await builderApi.post<TokenResponse>('/login', credentials);
    return response.data;
  },
};

export const sitesApi = {
  getAll: async (): Promise<Site[]> => {
    const response = await builderApi.get<Site[]>('/sites');
    return response.data;
  },

  create: async (data: SiteCreate): Promise<Site> => {
    const response = await builderApi.post<Site>('/sites', data);
    return response.data;
  },

  update: async (id: number, data: SiteUpdate): Promise<Site> => {
    const response = await builderApi.put<Site>(`/sites/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await builderApi.delete(`/sites/${id}`);
  },

  getConfig: async (stringId: string): Promise<SiteConfig> => {
    const response = await builderApi.get<SiteConfig>(`/sites/${stringId}/config`);
    return response.data;
  },

  updateConfig: async (id: number, config: SiteConfig): Promise<void> => {
    await builderApi.put(`/sites/${id}/config`, config);
  },
};

export const catalogueApi = {
  get: async (siteStringId: string): Promise<CatalogueResponse> => {
    const response = await catalogueApiClient.get<CatalogueResponse>(`/sites/${siteStringId}/catalogue`);
    return response.data;
  },

  update: async (siteStringId: string, data: CatalogueUpdate): Promise<void> => {
    await catalogueApiClient.put(`/sites/${siteStringId}/catalogue`, data);
  },
};

