import { apiClient } from './client';
import type { ClientContent } from '@shared/schema';

// Define interface for Client data
export interface Client {
  id: number;
  name: string;
  logo: string | null;
  link?: string | null; // Optional link to client website
  // Add other client specific fields as needed
}

// API functions for Clients

// Get all clients and associates
export const getClients = async () => {
  const response = await apiClient.get<{ success: boolean; data: ClientContent[] }>(
    '/content/clients'
  );
  return response.data;
};

// Get clients by type (client or partner)
export const getClientsByType = async (type: 'client' | 'partner') => {
  const response = await apiClient.get<{ success: boolean; data: ClientContent[] }>(
    `/content/clients?type=${type}`
  );
  return response.data;
};

// Admin functions for client management
export const createClient = async (data: FormData) => {
  const response = await apiClient.post<{ success: boolean; data: ClientContent }>(
    '/admin/clients',
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const updateClient = async (id: number, data: FormData) => {
  const response = await apiClient.put<{ success: boolean; data: ClientContent }>(
    `/admin/clients/${id}`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const deleteClient = async (id: number) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/admin/clients/${id}`
  );
  return response.data;
}; 