import axios from 'axios';

// 1. Configuración de la URL base
const API_BASE_URL = (import.meta.env.VITE_API_URL || '') //.replace('http://', 'https://');   

// 2. Creación de la instancia
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Interceptor de Petición (Request)
// Aquí adjuntamos el token antes de que la petición salga
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Interceptor de Respuesta (Response)
// Aquí manejamos errores globales, como el 401 (No autorizado)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;