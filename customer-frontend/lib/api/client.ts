import axios from 'axios';

/**
 * Customer API Client
 * 
 * SECURITY: This client ONLY communicates with customer-backend.
 * It must NEVER be pointed at admin-backend.
 */
const customerApiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customer`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor — attach Bearer token
customerApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('crm_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and common errors
customerApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default customerApiClient;
