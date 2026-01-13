import axiosInstance from '../axiosConfig';

export const serviciosAPI = {
  // Crear un nuevo servicio
  createServicio: async (servicioData) => {
    const response = await axiosInstance.post('/servicios/', servicioData);
    return response.data;
  },

  // Obtener todos los servicios con filtros opcionales
  getAllServicios: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.codigo_servicio) params.append('codigo_servicio', filters.codigo_servicio);
    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.tipo_servicio) params.append('tipo_servicio', filters.tipo_servicio);
    if (filters.modalidad_servicio) params.append('modalidad_servicio', filters.modalidad_servicio);
    if (filters.unidad_medida) params.append('unidad_medida', filters.unidad_medida);
    if (filters.precio_min !== undefined && filters.precio_min !== null) params.append('precio_min', filters.precio_min);
    if (filters.precio_max !== undefined && filters.precio_max !== null) params.append('precio_max', filters.precio_max);
    if (filters.estado) params.append('estado', filters.estado);
    
    const response = await axiosInstance.get(`/servicios/?${params.toString()}`);
    return response.data;
  },

  // Obtener servicio por ID
  getServicioById: async (servicioId) => {
    const response = await axiosInstance.get(`/servicios/${servicioId}`);
    return response.data;
  },

  // Obtener servicio por código
  getServicioByCodigo: async (codigoServicio) => {
    const response = await axiosInstance.get(`/servicios/codigo/${codigoServicio}`);
    return response.data;
  },

  // Obtener servicios por tipo
  getServiciosByTipo: async (tipoServicio) => {
    const response = await axiosInstance.get(`/servicios/tipo/${tipoServicio}`);
    return response.data;
  },

  // Obtener servicios por modalidad
  getServiciosByModalidad: async (modalidadServicio) => {
    const response = await axiosInstance.get(`/servicios/modalidad/${modalidadServicio}`);
    return response.data;
  },

  // Obtener servicios por unidad de medida
  getServiciosByUnidad: async (unidadMedida) => {
    const response = await axiosInstance.get(`/servicios/unidad/${unidadMedida}`);
    return response.data;
  },

  // Obtener servicios activos
  getServiciosActivos: async () => {
    const response = await axiosInstance.get('/servicios/activos/lista');
    return response.data;
  },

  // Obtener servicios inactivos
  getServiciosInactivos: async () => {
    const response = await axiosInstance.get('/servicios/inactivos/lista');
    return response.data;
  },

  // Actualizar servicio
  updateServicio: async (servicioId, updateData) => {
    console.log("updateServicio called with:", servicioId, updateData);
    const response = await axiosInstance.put(`/servicios/${servicioId}`, updateData);
    return response.data;
  },

  // Eliminar servicio (soft delete)
  deleteServicio: async (servicioId) => {
    const response = await axiosInstance.delete(`/servicios/${servicioId}`);
    return response.data;
  },

  // Eliminar servicio permanentemente
  hardDeleteServicio: async (servicioId) => {
    const response = await axiosInstance.delete(`/servicios/${servicioId}/hard`);
    return response.data;
  },

  // Exportar servicio específico a Excel
  exportServicioExcel: async (servicioId) => {
    const response = await axiosInstance.get(`/servicios/${servicioId}/export/excel`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Exportar todos los servicios a Excel con filtros
  exportAllServiciosExcel: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.codigo_servicio) params.append('codigo_servicio', filters.codigo_servicio);
    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.tipo_servicio) params.append('tipo_servicio', filters.tipo_servicio);
    if (filters.modalidad_servicio) params.append('modalidad_servicio', filters.modalidad_servicio);
    if (filters.unidad_medida) params.append('unidad_medida', filters.unidad_medida);
    if (filters.precio_min !== undefined && filters.precio_min !== null) params.append('precio_min', filters.precio_min);
    if (filters.precio_max !== undefined && filters.precio_max !== null) params.append('precio_max', filters.precio_max);
    if (filters.estado) params.append('estado', filters.estado);
    
    const response = await axiosInstance.get(`/servicios/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Importar servicios desde Excel
  importServiciosExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/servicios/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Obtener estadísticas de servicios
  getEstadisticas: async () => {
    const response = await axiosInstance.get('/servicios/stats/estadisticas');
    return response.data;
  },

  // Descargar plantilla de Excel para importación
  downloadTemplate: async () => {
    const response = await axiosInstance.get('/servicios/template/excel', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Función para descargar archivo Excel
  downloadExcel: (blob, filename = 'servicios.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Función helper para descargar Excel con nombre personalizado
  downloadServicioExcel: async (servicioId, codigoServicio) => {
    const blob = await serviciosAPI.exportServicioExcel(servicioId);
    serviciosAPI.downloadExcel(blob, `servicio_${codigoServicio}.xlsx`);
  },

  // Función helper para descargar todos los servicios
  downloadAllServiciosExcel: async (filters = {}) => {
    const blob = await serviciosAPI.exportAllServiciosExcel(filters);
    const filename = filters.tipo_servicio 
      ? `servicios_${filters.tipo_servicio}.xlsx`
      : 'servicios.xlsx';
    serviciosAPI.downloadExcel(blob, filename);
  }
};