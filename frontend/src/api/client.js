import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('honeychain_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global responses & unauthorized redirect
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Clear token if invalid/expired and redirect
      if (window.location.pathname !== '/login' && window.location.pathname !== '/verify') {
        localStorage.removeItem('honeychain_token');
        localStorage.removeItem('honeychain_user');
      }
    }
    return Promise.reject(error);
  }
);

export default client;
