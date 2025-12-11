import { apiClient } from './client';
import { BlogArticle } from '@shared/schema';

// Get all articles, optionally filtered by published status
export const getArticles = async (publishedOnly: boolean = false) => {
  const response = await apiClient.get<{ success: boolean; data: BlogArticle[] }>(
    `/articles?publishedOnly=${publishedOnly}`
  );
  return response.data;
};

// Get article by ID
export const getArticleById = async (id: number) => {
  const response = await apiClient.get<{ success: boolean; data: BlogArticle }>(
    `/articles/${id}`
  );
  return response.data;
};

// Get article by slug
export const getArticleBySlug = async (slug: string) => {
  const response = await apiClient.get<{ success: boolean; data: BlogArticle }>(
    `/articles/slug/${slug}`
  );
  return response.data;
};

// Get services related to an article
export const getArticleServices = async (articleId: number) => {
  const response = await apiClient.get<{ success: boolean; data: any[] }>(
    `/articles/${articleId}/services`
  );
  return response.data;
};

// Get projects related to an article
export const getArticleProjects = async (articleId: number) => {
  const response = await apiClient.get<{ success: boolean; data: any[] }>(
    `/articles/${articleId}/projects`
  );
  return response.data;
};

// Admin endpoints

// Create new article
export const createArticle = async (formData: FormData) => {
  try {
    const response = await apiClient.post<{ success: boolean; data: BlogArticle }>(
      '/admin/blog/articles',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('API error creating article:', error);
    throw error;
  }
};

// Update existing article
export const updateArticle = async (id: number, formData: FormData) => {
  const response = await apiClient.patch<{ success: boolean; data: BlogArticle }>(
    `/admin/blog/articles/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Delete article
export const deleteArticle = async (id: number) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/admin/blog/articles/${id}`
  );
  return response.data;
}; 