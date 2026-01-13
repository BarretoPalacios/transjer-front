import axiosInstance from '../axiosConfig';

export const flotaAPI = {
  createFlota: async (flotaData) => {
    console.log(flotaData)
    const response = await axiosInstance.post('/flota/', flotaData);
    return response.data;
  },

  getAllFlotas: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 10;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // Parámetros de filtrado según los routers
    if (filters.codigo_flota) params.append('codigo_flota', filters.codigo_flota);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.marca) params.append('marca', filters.marca);
    if (filters.modelo) params.append('modelo', filters.modelo);
    if (filters.anio !== undefined) params.append('anio', filters.anio);
    if (filters.tipo_vehiculo) params.append('tipo_vehiculo', filters.tipo_vehiculo);
    if (filters.tipo_combustible) params.append('tipo_combustible', filters.tipo_combustible);
    if (filters.mtc_numero) params.append('mtc_numero', filters.mtc_numero);
    if (filters.activo !== undefined) params.append('activo', filters.activo);

    const response = await axiosInstance.get(`/flota/?${params.toString()}`);
    
    // Devuelve toda la respuesta paginada
    return {
        items: response.data.items,
        pagination: {
            total: response.data.total,
            page: response.data.page,
            pageSize: response.data.page_size,
            totalPages: response.data.total_pages,
            hasNext: response.data.has_next,
            hasPrev: response.data.has_prev
        }
    };
  },

  getFlotaById: async (flotaId) => {
    const response = await axiosInstance.get(`/flota/${flotaId}`);
    return response.data;
  },

  getFlotaByCodigo: async (codigoFlota) => {
    const response = await axiosInstance.get(`/flota/codigo/${codigoFlota}`);
    return response.data;
  },

  getFlotaByPlaca: async (placa) => {
    const response = await axiosInstance.get(`/flota/placa/${placa}`);
    return response.data;
  },

  updateFlota: async (flotaId, updateData) => {
    console.log(updateData)
    const response = await axiosInstance.put(`/flota/${flotaId}`, updateData);
    return response.data;
  },

  deleteFlota: async (flotaId) => {
    const response = await axiosInstance.delete(`/flota/${flotaId}`);
    return response.data;
  },

  exportFlotaExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de filtrado para exportación
    if (filters.codigo_flota) params.append('codigo_flota', filters.codigo_flota);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.marca) params.append('marca', filters.marca);
    if (filters.modelo) params.append('modelo', filters.modelo);
    if (filters.anio !== undefined) params.append('anio', filters.anio);
    if (filters.tipo_vehiculo) params.append('tipo_vehiculo', filters.tipo_vehiculo);
    if (filters.tipo_combustible) params.append('tipo_combustible', filters.tipo_combustible);
    if (filters.mtc_numero) params.append('mtc_numero', filters.mtc_numero);
    if (filters.activo !== undefined) params.append('activo', filters.activo);

    const response = await axiosInstance.get(
      `/flota/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  downloadPlantillaExcel: async () => {
    const response = await axiosInstance.get(
      '/flota/template/excel',
      { responseType: 'blob' }
    );
    return response.data;
  },

  importFlotasExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      '/flota/import/excel',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  },

  getEstadisticasGenerales: async () => {
    const response = await axiosInstance.get('/flota/stats/general');
    return response.data;
  },

  getAlertas: async (diasAnticipacion = 30) => {
    const response = await axiosInstance.get(`/flota/stats/alertas?dias_anticipacion=${diasAnticipacion}`);
    return response.data;
  },

  downloadExcel: (blob, filename = 'flota_export.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

};