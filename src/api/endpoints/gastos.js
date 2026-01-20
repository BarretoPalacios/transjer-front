// archivo: src/api/endpoints/gastos.js
import axiosInstance from '../axiosConfig';

export const gastosAPI = {
  // Crear un nuevo gasto
  createGasto: async (gastoData) => {
    // console.log('Creando gasto:', gastoData);
    const response = await axiosInstance.post('/gastos/', gastoData);
    return response.data;
  },

  // Obtener todos los gastos con filtros y paginación
  getAllGastos: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 10;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // Parámetros de filtrado
    if (filters.search) params.append('search', filters.search);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.tipo_gasto) params.append('tipo_gasto', filters.tipo_gasto);
    if (filters.alcance) params.append('alcance', filters.alcance);
    if (filters.estado) params.append('estado', filters.estado);
    
    // Filtros de fecha
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    
    // Filtros de valor
    if (filters.valor_min) params.append('valor_min', filters.valor_min);
    if (filters.valor_max) params.append('valor_max', filters.valor_max);
    
    // Filtros adicionales
    if (filters.observacion) params.append('observacion', filters.observacion);

    const response = await axiosInstance.get(`/gastos/?${params.toString()}`);
    
    // Devuelve toda la respuesta paginada
    return {
      items: response.data.items || [],
      pagination: {
        total: response.data.total || 0,
        page: response.data.page || 1,
        pageSize: response.data.page_size || 10,
        totalPages: response.data.total_pages || 1,
        hasNext: response.data.has_next || false,
        hasPrev: response.data.has_prev || false
      }
    };
  },

  // Obtener gasto por ID
  getGastoById: async (gastoId) => {
    const response = await axiosInstance.get(`/gastos/${gastoId}`);
    return response.data;
  },

  // Obtener gastos por placa
  getGastosByPlaca: async (placa, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.tipo_gasto) params.append('tipo_gasto', filters.tipo_gasto);
    if (filters.estado) params.append('estado', filters.estado);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/gastos/placa/${placa}?${queryString}`
      : `/gastos/placa/${placa}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener gastos por tipo
  getGastosByTipo: async (tipoGasto, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.estado) params.append('estado', filters.estado);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/gastos/tipo/${tipoGasto}?${queryString}`
      : `/gastos/tipo/${tipoGasto}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Actualizar gasto
  updateGasto: async (gastoId, updateData) => {
    console.log('Actualizando gasto:', updateData);
    const response = await axiosInstance.put(`/gastos/${gastoId}`, updateData);
    return response.data;
  },

  // Eliminar gasto
  deleteGasto: async (gastoId) => {
    const response = await axiosInstance.delete(`/gastos/${gastoId}`);
    return response.data;
  },

  // Exportar un gasto específico a Excel
  exportGastoExcel: async (gastoId) => {
    const response = await axiosInstance.get(
      `/gastos/${gastoId}/export/excel`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Exportar todos los gastos a Excel con filtros
  exportAllGastosExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.tipo_gasto) params.append('tipo_gasto', filters.tipo_gasto);
    if (filters.alcance) params.append('alcance', filters.alcance);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.valor_min) params.append('valor_min', filters.valor_min);
    if (filters.valor_max) params.append('valor_max', filters.valor_max);

    const response = await axiosInstance.get(
      `/gastos/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Descargar plantilla para importar gastos
  downloadPlantillaExcel: async () => {
    const response = await axiosInstance.get(
      '/gastos/template/excel',
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Importar gastos desde Excel
  importGastosExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      '/gastos/import/excel',
      formData,
      { 
        headers: { 
          'Content-Type': 'multipart/form-data' 
        } 
      }
    );

    return response.data;
  },

  // Obtener estadísticas de gastos
  getEstadisticas: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.alcance) params.append('alcance', filters.alcance);
    if (filters.tipo_gasto) params.append('tipo_gasto', filters.tipo_gasto);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/gastos/stats/estadisticas?${queryString}`
      : `/gastos/stats/estadisticas`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener resumen por placa
  getResumenPorPlaca: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.placa) params.append('placa', filters.placa);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/gastos/stats/resumen-placa?${queryString}`
      : `/gastos/stats/resumen-placa`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener resumen por tipo de gasto
  getResumenPorTipo: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.alcance) params.append('alcance', filters.alcance);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/gastos/stats/resumen-tipo?${queryString}`
      : `/gastos/stats/resumen-tipo`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener placas activas (con gastos recientes)
  getPlacasActivas: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.ultimos_dias) params.append('ultimos_dias', filters.ultimos_dias);
    if (filters.alcance) params.append('alcance', filters.alcance);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/gastos/stats/placas-activas?${queryString}`
      : `/gastos/stats/placas-activas`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Actualizar estado de un gasto
  updateEstado: async (gastoId, estado) => {
    const response = await axiosInstance.patch(`/gastos/${gastoId}/estado`, { estado });
    return response.data;
  },

  // Función auxiliar para descargar archivos Excel
  downloadExcel: (blob, filename = 'gastos.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Consultar información de placa (si tu backend tiene esta funcionalidad)
  consultarPlaca: async (placa) => {
    try {
      const response = await axiosInstance.get(`/utils/consultar-placa/${placa}`);
      return response.data;
    } catch (error) {
      console.error('Error consultando placa:', error);
      return null;
    }
  },

  // Obtener tipos de gasto comunes
  getTiposGastoComunes: async () => {
    try {
      const response = await axiosInstance.get('/gastos/tipos-comunes');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo tipos de gasto:', error);
      // Retornar lista predeterminada si falla
      return [
        'Combustible',
        'Peaje',
        'Mantenimiento',
        'Reparación',
        'Lavado',
        'Seguro',
        'Impuestos',
        'Multas',
        'Alojamiento',
        'Alimentación',
        'Viáticos',
        'Otros'
      ];
    }
  }
};