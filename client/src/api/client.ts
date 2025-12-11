import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Function to get the base URL based on the environment
const getBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (isDevelopment) {
    return '/api'; // This will be handled by Vite's proxy in development
  }
  
  // In production, use the actual API URL with port if specified
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
};

// Create an axios instance with default config
export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS requests with credentials
  timeout: 10000, // 10 second timeout
  timeoutErrorMessage: 'Request timed out. Please try again.',
  // Note: Retry logic is handled in the response interceptor
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('cms-jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle common errors and retries
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as any;
    
    // Only retry on network errors or 5xx server errors
    if (
      (!error.response || (error.response.status >= 500 && error.response.status <= 599)) &&
      config &&
      config.retries > 0
    ) {
      config.retries--;
      
      // Implement exponential backoff
      const backoff = Math.min(1000 * (3 - config.retries), 3000);
      
      await new Promise(resolve => setTimeout(resolve, backoff));
      
      return apiClient(config);
    }

    if (error.response?.status === 401) {
      // Only redirect to login for admin routes
      const isAdminRoute = error.config?.url?.startsWith('/admin/');
      if (isAdminRoute) {
        localStorage.removeItem('cms-jwt');
        localStorage.removeItem('cms-user');
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
); 