import axiosInstance from '../axiosConfig';

export const authAPI = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await axiosInstance.get('/user/me');
    return response.data;
  },

  verifyUser: async (token) => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axiosInstance.get('/users/me/advance');
    return response.data;
  },
  
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  }
};