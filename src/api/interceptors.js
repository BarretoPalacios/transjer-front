import axiosInstance from './axiosConfig';

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Verificamos que no estemos YA en el login para evitar bucles infinitos
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Opcional: Guardar la URL actual para redirigir al usuario después del login
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    return Promise.reject(error);
  }
);