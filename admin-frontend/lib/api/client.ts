import axios from 'axios';

/**
 * Admin API Client
 * 
 * SECURITY: This client ONLY communicates with admin-backend.
 * It must NEVER be pointed at customer-backend.
 */
const adminApiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor — attach Bearer token
adminApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and common errors
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default adminApiClient;
