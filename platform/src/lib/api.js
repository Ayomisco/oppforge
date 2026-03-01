import axios from 'axios';
import Cookies from 'js-cookie';

// Always fall back to the real production backend — never localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oppbackendapi.oppforge.xyz';

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token from cookie
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 logout + log network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network-level error (backend unreachable, CORS, DNS)
      console.error('[API] Network error — backend unreachable:', API_URL, error.message);
    }
    if (error.response?.status === 401) {
      Cookies.remove('token', { path: '/' });
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        if (window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
