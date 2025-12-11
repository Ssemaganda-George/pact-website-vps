import { apiClient } from './client';
import type { Location } from '@shared/schema';

type LocationInput = {
  city: string;
  country: string;
  address: string;
  image?: File | string | null;
};

type LocationUpdate = {
  city?: string;
  country?: string;
  address?: string | null;
  image?: File | string | null;
};

export const getLocations = async () => {
  const response = await apiClient.get('/locations');
  return response.data;
};

export const getLocation = async (id: number) => {
  const response = await apiClient.get(`/locations/${id}`);
  return response.data;
};

export const createLocation = async (data: LocationInput) => {
  const formData = new FormData();
  
  // Handle image file
  if (data.image && typeof data.image !== 'string' && (data.image as any) instanceof File) {
    formData.append('image', data.image as File);
  }
  
  // Add other fields
  Object.entries(data).forEach(([key, value]) => {
    if (value && (key !== 'image' || !((value as any) instanceof File))) {
      formData.append(key, value as string);
    }
  });

  const response = await apiClient.post('/locations', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const updateLocation = async (id: number, data: LocationUpdate) => {
  const formData = new FormData();
  
  // Handle image file
  if (data.image && typeof data.image !== 'string' && (data.image as any) instanceof File) {
    formData.append('image', data.image as File);
  }
  
  // Add other fields
  Object.entries(data).forEach(([key, value]) => {
    if (value && (key !== 'image' || !((value as any) instanceof File))) {
      formData.append(key, value as string);
    }
  });

  const response = await apiClient.put(`/locations/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const deleteLocation = async (id: number) => {
  const response = await apiClient.delete(`/locations/${id}`);
  return response.data;
}; 