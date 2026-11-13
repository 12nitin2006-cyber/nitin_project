// One axios instance for the whole app, so the base URL and token are set in one place
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Images are served by the backend at /uploads, which is outside /api
export const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({ baseURL: API_URL });

// Before every request, attach the JWT from localStorage (if the user is logged in)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pull a readable message out of an axios error
export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export default api;
