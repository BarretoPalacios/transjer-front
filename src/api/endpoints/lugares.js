import axiosInstance from '../axiosConfig';

export const lugaresAPI = {
  // Crear un nuevo lugar
  createLugar: async (lugarData) => {
    const response = await axiosInstance.post('/lugares/', lugarData);
    return response.data;
  },

  // Obtener todos los lugares con filtros opcionales
  getAllLugares: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.codigo_lugar) params.append('codigo_lugar', filters.codigo_lugar);
    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.tipo_lugar) params.append('tipo_lugar', filters.tipo_lugar);
    if (filters.departamento) params.append('departamento', filters.departamento);
    if (filters.provincia) params.append('provincia', filters.provincia);
    if (filters.distrito) params.append('distrito', filters.distrito);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.es_principal) params.append('es_principal', filters.es_principal);
    
    const response = await axiosInstance.get(`/lugares/?${params.toString()}`);
    return response.data;
  },

  // Obtener lugar por ID
  getLugarById: async (lugarId) => {
    const response = await axiosInstance.get(`/lugares/${lugarId}`);
    return response.data;
  },

  // Obtener lugar por código
  getLugarByCodigo: async (codigoLugar) => {
    const response = await axiosInstance.get(`/lugares/codigo/${codigoLugar}`);
    return response.data;
  },

  // Obtener lugares por tipo
  getLugaresByTipo: async (tipoLugar) => {
    const response = await axiosInstance.get(`/lugares/tipo/${tipoLugar}`);
    return response.data;
  },

  // Obtener lugares principales
  getLugaresPrincipales: async () => {
    const response = await axiosInstance.get('/lugares/principales/');
    return response.data;
  },

  // Actualizar lugar
  updateLugar: async (lugarId, updateData) => {
    console.log("updateLugar called with:", lugarId, updateData);
    const response = await axiosInstance.put(`/lugares/${lugarId}`, updateData);
    return response.data;
  },

  // Eliminar lugar
  deleteLugar: async (lugarId) => {
    const response = await axiosInstance.delete(`/lugares/${lugarId}`);
    return response.data;
  },

  // Exportar a Excel
  exportAllLugaresExcel: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.tipo_lugar) params.append('tipo_lugar', filters.tipo_lugar);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.departamento) params.append('departamento', filters.departamento);
    
    const response = await axiosInstance.get(`/lugares/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Importar desde Excel
  importLugaresExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/lugares/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    const response = await axiosInstance.get('/lugares/stats/estadisticas');
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await axiosInstance.get('/lugares/template/excel', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Función para descargar archivo Excel
  downloadExcel: (blob, filename = 'lugares.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};