// userAPI.js
import axiosInstance from '../axiosConfig';

export const userAPI = {

  // Registrar un nuevo usuario
  registerUser: async (userData) => {
    console.log('Datos de usuario para registro:', userData);
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  // Obtener todos los usuarios (con sus roles)
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get('/users/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      throw error; 
    }
  },

  // Actualizar cualquier usuario (Acceso Admin)
  updateUser: async (userId, updateData) => {
    try {
      // updateData debe contener los campos a cambiar (ej: { full_name: "Nuevo Nombre", role_ids: [...] })
      const response = await axiosInstance.put(`/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el usuario ${userId}:`, error);
      throw error;
    }
  },

  // Eliminar cualquier usuario (Acceso Admin)
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/users/${userId}`);
      return response.data; // Normalmente será un status 204 sin contenido
    } catch (error) {
      console.error(`Error al eliminar el usuario ${userId}:`, error);
      throw error;
    }
  }

};

export default userAPI;