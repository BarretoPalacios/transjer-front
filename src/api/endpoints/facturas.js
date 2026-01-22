// src/api/endpoints/facturas.js
import axiosInstance from '../axiosConfig';

// Helper para manejar errores de API
const handleApiError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    console.error('Error de API:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    
    if (error.response.status === 400) {
      throw new Error(`Error de validación: ${error.response.data.detail || 'Datos inválidos'}`);
    } else if (error.response.status === 404) {
      throw new Error('Recurso no encontrado');
    } else if (error.response.status === 500) {
      throw new Error('Error interno del servidor. Por favor, intente más tarde.');
    } else {
      throw new Error(error.response.data.detail || 'Error desconocido');
    }
  } else if (error.request) {
    // La solicitud fue hecha pero no se recibió respuesta
    console.error('Error de red:', error.request);
    throw new Error('Error de conexión. Por favor, verifique su red e intente nuevamente.');
  } else {
    // Algo sucedió al configurar la solicitud
    console.error('Error:', error.message);
    throw new Error(`Error: ${error.message}`);
  }
};

// Helper para formatear fechas para la API
const formatDateForAPI = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  return date;
};

export const facturasAPI = {
  // Crear factura
  createFactura: async (facturaData) => {
    try {
      const response = await axiosInstance.post('/facturas/', facturaData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener todas las facturas con filtros y paginación
  getAllFacturas: async (filters = {}, page = 1, pageSize = 10, sortBy = 'fecha_emnumero_facturaision', sortOrder = -1) => {
    try {
      const params = new URLSearchParams();

      // Filtros básicos (según nuevo router)
      if (filters.numero_factura) params.append('numero_factura', filters.numero_factura);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.moneda) params.append('moneda', filters.moneda);
      if (filters.es_borrador !== undefined) params.append('es_borrador', filters.es_borrador);
      
      // Filtros de fechas individuales
      if (filters.fecha_emision) params.append('fecha_emision', formatDateForAPI(filters.fecha_emision));
      if (filters.fecha_vencimiento) params.append('fecha_vencimiento', formatDateForAPI(filters.fecha_vencimiento));
      if (filters.fecha_pago) params.append('fecha_pago', formatDateForAPI(filters.fecha_pago));
      
      // Filtros de rango de fechas
      if (filters.fecha_emision_inicio) params.append('fecha_emision_inicio', formatDateForAPI(filters.fecha_emision_inicio));
      if (filters.fecha_emision_fin) params.append('fecha_emision_fin', formatDateForAPI(filters.fecha_emision_fin));
      if (filters.fecha_vencimiento_inicio) params.append('fecha_vencimiento_inicio', formatDateForAPI(filters.fecha_vencimiento_inicio));
      if (filters.fecha_vencimiento_fin) params.append('fecha_vencimiento_fin', formatDateForAPI(filters.fecha_vencimiento_fin));
      if (filters.fecha_pago_inicio) params.append('fecha_pago_inicio', formatDateForAPI(filters.fecha_pago_inicio));
      if (filters.fecha_pago_fin) params.append('fecha_pago_fin', formatDateForAPI(filters.fecha_pago_fin));
      
      // Filtros de monto (nuevo nombre según router)
      if (filters.monto_total_minimo) params.append('monto_total_minimo', filters.monto_total_minimo);
      if (filters.monto_total_maximo) params.append('monto_total_maximo', filters.monto_total_maximo);
      
      // Filtro de flete_id (nuevo en router)
      if (filters.flete_id) params.append('flete_id', filters.flete_id);
      
      // Filtro de período
      if (filters.periodo) params.append('periodo', filters.periodo);

      if (filters.cliente_nombre) params.append('nombre_cliente', filters.cliente_nombre);

      // Parámetros de paginación y ordenamiento
      params.append('page', page);
      params.append('page_size', pageSize);
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);

      const response = await axiosInstance.get(`/facturas/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener facturas por período específico con paginación
  getFacturasPorPeriodo: async (periodo, page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/facturas/periodo/${periodo}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener facturas por rango de fechas con paginación
  getFacturasPorRangoFechas: async (fechaInicio, fechaFin, page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      params.append('fecha_inicio', formatDateForAPI(fechaInicio));
      params.append('fecha_fin', formatDateForAPI(fechaFin));
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/facturas/rango-fechas/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener facturas por estado con paginación
  getFacturasPorEstado: async (estado, page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/facturas/estado/${estado}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener facturas vencidas con paginación
  getFacturasVencidas: async (page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/facturas/vencidas?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener facturas por vencer con paginación
  getFacturasPorVencer: async (dias = 7, page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      params.append('dias', dias);
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/facturas/por-vencer?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener factura por ID
  getFacturaById: async (facturaId) => {
    try {
      const response = await axiosInstance.get(`/facturas/${facturaId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener factura por número
  getFacturaByNumero: async (numeroFactura) => {
    try {
      const response = await axiosInstance.get(`/facturas/numero/${numeroFactura}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Actualizar factura
  updateFactura: async (facturaId, updateData) => {
    try {
      const response = await axiosInstance.put(`/facturas/${facturaId}`, updateData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Marcar factura como pagada
  marcarFacturaComoPagada: async (facturaId, fechaPago = null) => {
    try {
      const params = new URLSearchParams();
      if (fechaPago) params.append('fecha_pago', formatDateForAPI(fechaPago));
      
      const url = params.toString() 
        ? `/facturas/${facturaId}/marcar-pagada?${params.toString()}`
        : `/facturas/${facturaId}/marcar-pagada`;
      
      const response = await axiosInstance.patch(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Emitir factura desde borrador
  emitirFactura: async (facturaId, numeroFactura, fechaEmision = null, fechaVencimiento = null) => {
    try {
      const params = new URLSearchParams();
      params.append('numero_factura', numeroFactura);
      if (fechaEmision) params.append('fecha_emision', formatDateForAPI(fechaEmision));
      if (fechaVencimiento) params.append('fecha_vencimiento', formatDateForAPI(fechaVencimiento));
      
      const response = await axiosInstance.post(`/facturas/${facturaId}/emitir?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Eliminar factura
  deleteFactura: async (facturaId) => {
    try {
      const response = await axiosInstance.delete(`/facturas/${facturaId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    try {
      const response = await axiosInstance.get('/facturas/stats/estadisticas');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Exportar a Excel
  exportAllFacturasExcel: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      // Filtros para exportación (según nuevo router)
      if (filters.numero_factura) params.append('numero_factura', filters.numero_factura);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.moneda) params.append('moneda', filters.moneda);
      if (filters.es_borrador !== undefined) params.append('es_borrador', filters.es_borrador);
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.fecha_emision_inicio) params.append('fecha_emision_inicio', formatDateForAPI(filters.fecha_emision_inicio));
      if (filters.fecha_emision_fin) params.append('fecha_emision_fin', formatDateForAPI(filters.fecha_emision_fin));
      if (filters.monto_total_minimo) params.append('monto_total_minimo', filters.monto_total_minimo);
      if (filters.monto_total_maximo) params.append('monto_total_maximo', filters.monto_total_maximo);
      if (filters.flete_id) params.append('flete_id', filters.flete_id);

      const response = await axiosInstance.get(
        `/facturas/export/excel?${params.toString()}`,
        { 
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Helper para descargar archivos Excel
  downloadExcel: (blob, filename = 'facturas.xlsx') => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Helper para manejar errores de API
  handleApiError,

  // Helper para formatear fechas para la API
  formatDateForAPI,

  // Helper para construir filtros de búsqueda
  buildFilterParams: (filters) => {
    const formattedFilters = { ...filters };
    
    // Formatear fechas si existen
    if (filters.fecha_emision) {
      formattedFilters.fecha_emision = formatDateForAPI(filters.fecha_emision);
    }
    if (filters.fecha_emision_inicio) {
      formattedFilters.fecha_emision_inicio = formatDateForAPI(filters.fecha_emision_inicio);
    }
    if (filters.fecha_emision_fin) {
      formattedFilters.fecha_emision_fin = formatDateForAPI(filters.fecha_emision_fin);
    }
    if (filters.fecha_vencimiento) {
      formattedFilters.fecha_vencimiento = formatDateForAPI(filters.fecha_vencimiento);
    }
    if (filters.fecha_vencimiento_inicio) {
      formattedFilters.fecha_vencimiento_inicio = formatDateForAPI(filters.fecha_vencimiento_inicio);
    }
    if (filters.fecha_vencimiento_fin) {
      formattedFilters.fecha_vencimiento_fin = formatDateForAPI(filters.fecha_vencimiento_fin);
    }
    if (filters.fecha_pago) {
      formattedFilters.fecha_pago = formatDateForAPI(filters.fecha_pago);
    }
    if (filters.fecha_pago_inicio) {
      formattedFilters.fecha_pago_inicio = formatDateForAPI(filters.fecha_pago_inicio);
    }
    if (filters.fecha_pago_fin) {
      formattedFilters.fecha_pago_fin = formatDateForAPI(filters.fecha_pago_fin);
    }
    
    return formattedFilters;
  },


  getServicioById : async (servicioId) => {
    try {
      const response = await axiosInstance.get(`/servicios-principales/${servicioId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }

  }
};