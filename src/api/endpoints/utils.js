import axiosInstance from '../axiosConfig';

export const utilsAPI = {


  getClientesList: async () => {
    const response = await axiosInstance.get(`/utils/clientes-list`);
    return response.data;
  },
  getProveedoresList: async () => {
    const response = await axiosInstance.get(`/utils/proveedores-list`);
    return response.data;
  },
  getPlacasList: async () => {
    const response = await axiosInstance.get(`/utils/placas-list`);
    return response.data;
  },
};

export default utilsAPI;