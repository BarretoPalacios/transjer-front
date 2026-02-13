// api/endpoints/fletes.js
import axiosInstance from '../axiosConfig';

export const fletesAPI = {
  // Crear un nuevo flete (manual)
  createFlete: async (fleteData) => {
    console.log('Creando flete:', fleteData);
    const response = await axiosInstance.post('/fletes/', fleteData);
    return response.data;
  },

  // Obtener todos los fletes con filtros y paginación (básico)
  getAllFletes: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = filters.page || 1;
    const pageSize = filters.page_size || 10;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // Parámetros de filtrado específicos de fletes
    if (filters.codigo_flete) params.append('codigo_flete', filters.codigo_flete);
    if (filters.servicio_id) params.append('servicio_id', filters.servicio_id);
    if (filters.codigo_servicio) params.append('codigo_servicio', filters.codigo_servicio);
    if (filters.estado_flete) params.append('estado_flete', filters.estado_flete);
    if (filters.pertenece_a_factura !== undefined && filters.pertenece_a_factura !== null) {
      params.append('pertenece_a_factura', filters.pertenece_a_factura);
    }
    if (filters.codigo_factura) params.append('codigo_factura', filters.codigo_factura);
    if (filters.monto_min) params.append('monto_min', filters.monto_min);
    if (filters.monto_max) params.append('monto_max', filters.monto_max);
    
    // Filtros de fecha
    if (filters.fecha_creacion) params.append('fecha_creacion', filters.fecha_creacion);
    if (filters.fecha_creacion_desde) params.append('fecha_creacion_desde', filters.fecha_creacion_desde);
    if (filters.fecha_creacion_hasta) params.append('fecha_creacion_hasta', filters.fecha_creacion_hasta);

    const response = await axiosInstance.get(`/fletes/?${params.toString()}`);
    return response.data;
  },

  // ======== NUEVO: Búsqueda Avanzada con Información del Servicio ========
  getAdvancedFletes: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = filters.page || 1;
    const pageSize = filters.page_size || 10;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // === Filtros del Flete ===
    if (filters.codigo_flete) params.append('codigo_flete', filters.codigo_flete);
    if (filters.estado_flete) params.append('estado_flete', filters.estado_flete);
    if (filters.pertenece_a_factura !== undefined && filters.pertenece_a_factura !== null) {
      params.append('pertenece_a_factura', filters.pertenece_a_factura);
    }
    if (filters.codigo_factura) params.append('codigo_factura', filters.codigo_factura);
    if (filters.monto_min) params.append('monto_min', filters.monto_min);
    if (filters.monto_max) params.append('monto_max', filters.monto_max);

    // === Filtros del Servicio Asociado ===
    if (filters.cliente) params.append('cliente', filters.cliente);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.conductor) params.append('conductor', filters.conductor);
    if (filters.tipo_servicio) params.append('tipo_servicio', filters.tipo_servicio);
    if (filters.zona) params.append('zona', filters.zona);
    if (filters.estado_servicio) params.append('estado_servicio', filters.estado_servicio);

    // === Filtros de Fecha del Servicio ===
    if (filters.fecha_servicio_desde) {
      params.append('fecha_servicio_desde', formatDateToISO(filters.fecha_servicio_desde));
    }
    if (filters.fecha_servicio_hasta) {
      params.append('fecha_servicio_hasta', formatDateToISO(filters.fecha_servicio_hasta));
    }

    // === Filtros de Fecha del Flete ===
    if (filters.fecha_creacion_desde) {
      params.append('fecha_creacion_desde', formatDateToISO(filters.fecha_creacion_desde));
    }
    if (filters.fecha_creacion_hasta) {
      params.append('fecha_creacion_hasta', formatDateToISO(filters.fecha_creacion_hasta));
    }

    const response = await axiosInstance.get(`/fletes/advanced/search?${params.toString()}`);
    return response.data;
  },

  // Buscar fletes por cliente (usa búsqueda avanzada)
  getFletesByCliente: async (nombreCliente, additionalFilters = {}) => {
    return await fletesAPI.getAdvancedFletes({
      ...additionalFilters,
      cliente: nombreCliente
    });
  },

  // Buscar fletes por placa (usa búsqueda avanzada)
  getFletesByPlaca: async (placa, additionalFilters = {}) => {
    return await fletesAPI.getAdvancedFletes({
      ...additionalFilters,
      placa: placa
    });
  },

  // Buscar fletes por conductor (usa búsqueda avanzada)
  getFletesByConductor: async (conductor, additionalFilters = {}) => {
    return await fletesAPI.getAdvancedFletes({
      ...additionalFilters,
      conductor: conductor
    });
  },

  // Buscar fletes por zona (usa búsqueda avanzada)
  getFletesByZona: async (zona, additionalFilters = {}) => {
    return await fletesAPI.getAdvancedFletes({
      ...additionalFilters,
      zona: zona
    });
  },

  // Buscar fletes por rango de fechas del servicio
  getFletesByFechaServicio: async (fechaDesde, fechaHasta, additionalFilters = {}) => {
    return await fletesAPI.getAdvancedFletes({
      ...additionalFilters,
      fecha_servicio_desde: fechaDesde,
      fecha_servicio_hasta: fechaHasta
    });
  },

  // Buscar fletes con múltiples criterios de servicio
  searchFletesByServicio: async (servicioFilters = {}) => {
    return await fletesAPI.getAdvancedFletes(servicioFilters);
  },

  // ======== Endpoints Originales ========

  // Obtener fletes por servicio (endpoint específico de tu API)
  getFletesByServicio: async (servicioId, filters = {}) => {
    try {
      // Primero intenta usar el endpoint específico para fletes por servicio
      const response = await axiosInstance.get(`/fletes/servicio/${servicioId}`);
      
      // Si la respuesta es exitosa, la devolvemos con la estructura adecuada
      if (response.data && Array.isArray(response.data)) {
        return {
          items: response.data,
          total: response.data.length,
          page: 1,
          page_size: response.data.length,
          total_pages: 1,
          has_next: false,
          has_prev: false
        };
      }
      
      // Si falla, usamos el endpoint general con filtro
      return await fletesAPI.getAllFletes({
        ...filters,
        servicio_id: servicioId
      });
      
    } catch (error) {
      // Si el endpoint específico no existe, usamos el general
      if (error.response?.status === 404) {
        return await fletesAPI.getAllFletes({
          ...filters,
          servicio_id: servicioId
        });
      }
      throw error;
    }
  },

  // Obtener un flete por ID
  getFleteById: async (fleteId) => {
    const response = await axiosInstance.get(`/fletes/${fleteId}`);
    return response.data;
  },

  // Obtener un flete por código
  getFleteByCodigo: async (codigoFlete) => {
    const response = await axiosInstance.get(`/fletes/codigo/${codigoFlete}`);
    return response.data;
  },

  // Actualizar un flete
  updateFlete: async (fleteId, updateData) => {
    console.log('Actualizando flete:', updateData);
    const response = await axiosInstance.put(`/fletes/${fleteId}`, updateData);
    return response.data;
  },

  // Eliminar un flete
  deleteFlete: async (fleteId) => {
    const response = await axiosInstance.delete(`/fletes/${fleteId}`);
    return response.data;
  },

  // Obtener estadísticas de fletes
  getEstadisticas: async () => {
    const response = await axiosInstance.get('/fletes/stats/estadisticas');
    return response.data;
  },

  getPendientesFacturacion: async () => {
    const response = await axiosInstance.get('/fletes/stats/pendientes-facturacion');
    return response.data;
  },

  // Método específico para exportar fletes (si tu backend lo soporta)
  exportFletesExcel: async (filters = {}) => {
    try {
      // Primero obtenemos los datos usando búsqueda avanzada si hay filtros de servicio
      const hasServiceFilters = filters.cliente || filters.placa || filters.conductor || 
                                filters.zona || filters.tipo_servicio || filters.estado_servicio ||
                                filters.fecha_servicio_desde || filters.fecha_servicio_hasta;
      
      const fletesData = hasServiceFilters 
        ? await fletesAPI.getAdvancedFletes(filters)
        : await fletesAPI.getAllFletes(filters);
      
      // Creamos un workbook de Excel (usando una librería como xlsx)
      const XLSX = window.XLSX || require('xlsx');
      
      // Preparar datos para Excel incluyendo info del servicio
      const excelData = (fletesData.items || []).map(flete => {
        const baseData = {
          'Código Flete': flete.codigo_flete,
          'Estado': flete.estado_flete,
          'Monto': flete.monto_flete,
          'Facturado': flete.pertenece_a_factura ? 'Sí' : 'No',
          'Código Factura': flete.codigo_factura || '-',
          'Fecha Creación': flete.fecha_creacion ? new Date(flete.fecha_creacion).toLocaleDateString() : '-',
        };

        // Si hay información del servicio, agregarla
        if (flete.servicio) {
          return {
            ...baseData,
            'Cliente': flete.servicio.cliente?.nombre || '-',
            'Placa': flete.servicio.flota?.placa || '-',
            'Conductor': flete.servicio.conductor?.[0]?.nombre || '-',
            'Zona': flete.servicio.zona || '-',
            'Tipo Servicio': flete.servicio.tipo_servicio || '-',
            'Fecha Servicio': flete.servicio.fecha_servicio ? new Date(flete.servicio.fecha_servicio).toLocaleDateString() : '-',
            'Estado Servicio': flete.servicio.estado || '-',
          };
        }

        return baseData;
      });
      
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Fletes");
      
      // Generamos el archivo
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      
      // Convertimos a blob
      const buf = new ArrayBuffer(wbout.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xFF;
      }
      
      return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('No se pudo generar el archivo Excel');
    }
  },

    exportAllFletesExcel: async (filters = {}) => {
      const params = new URLSearchParams();
  
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.pertenece_a_factura !== undefined) params.append('pertenece_a_factura', filters.pertenece_a_factura);
      if (filters.cliente_nombre) params.append('cliente_nombre', filters.cliente_nombre);
  
      const response = await axiosInstance.get(
        `/fletes/export/excel?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    },

  // Función para descargar archivos Excel
  downloadExcel: (blob, filename = 'fletes.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  },

  // Métodos adicionales que podrías necesitar

  // Obtener fletes pendientes de facturación
  getFletesPendientesFacturacion: async (filters = {}) => {
    return await fletesAPI.getAllFletes({
      ...filters,
      pertenece_a_factura: false
    });
  },

  // Obtener fletes pendientes con info de servicio (NUEVO)
  getFletesPendientesAdvanced: async (filters = {}) => {
    return await fletesAPI.getAdvancedFletes({
      ...filters,
      pertenece_a_factura: false
    });
  },

  // Obtener fletes por estado específico
  getFletesByEstado: async (estado, filters = {}) => {
    return await fletesAPI.getAllFletes({
      ...filters,
      estado_flete: estado
    });
  },

  // Marcar flete como pagado (usando update)
  marcarComoPagado: async (fleteId, fechaPago = null) => {
    const updateData = {
      estado_flete: 'PAGADO',
      fecha_pago: fechaPago || new Date().toISOString().split('T')[0]
    };
    return await fletesAPI.updateFlete(fleteId, updateData);
  },

  // Asociar flete a factura (usando update)
  asociarAFactura: async (fleteId, facturaId, codigoFactura = null) => {
    const updateData = {
      factura_id: facturaId,
      pertenece_a_factura: true
    };
    
    if (codigoFactura) {
      updateData.codigo_factura = codigoFactura;
    }
    
    return await fletesAPI.updateFlete(fleteId, updateData);
  },

  // Desasociar flete de factura
  desasociarDeFactura: async (fleteId) => {
    const updateData = {
      factura_id: null,
      pertenece_a_factura: false,
      codigo_factura: null
    };
    return await fletesAPI.updateFlete(fleteId, updateData);
  },

  // Generar código de flete automático
  generarCodigoFlete: async () => {
    try {
      const response = await fletesAPI.getEstadisticas();
      const totalFletes = response.total_fletes || 0;
      const nextNumber = totalFletes + 1;
      return `FLT-${String(nextNumber).padStart(10, '0')}`;
    } catch (error) {
      const timestamp = Date.now();
      return `FLT-TEMP-${timestamp}`;
    }
  },

  // Gastos adicionales
  getGastosByFlete: async (codigoFlete) => {
    const response = await axiosInstance.get(`/gastos-adicionales/flete/${codigoFlete}`);
    return response.data;
  },

  getGastosByCodeFlete: async (codigoFlete) => {
    const response = await axiosInstance.get(`/gastos-adicionales/flete-code/${codigoFlete}`);
    return response.data;
  },

  createGasto: async (gastoData) => {
    const response = await axiosInstance.post('gastos-adicionales/', gastoData);
    return response.data;
  },
  deleteGasto: async (gastoId) => {
    try {
      const response = await axiosInstance.delete(`gastos-adicionales/${gastoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ======== Helper Functions ========

// Helper para formatear fechas a ISO
export const formatDateToISO = (fecha) => {
  if (!fecha) return null;
  
  // Si ya es ISO string
  if (typeof fecha === 'string' && fecha.includes('T')) {
    return fecha;
  }
  
  // Si es objeto Date
  if (fecha instanceof Date) {
    return fecha.toISOString();
  }
  
  // Si es string de fecha YYYY-MM-DD
  if (typeof fecha === 'string') {
    return new Date(fecha).toISOString();
  }
  
  return null;
};

// Helper function para formatear filtros de fecha (deprecado, usar formatDateToISO)
export const formatFechaFilter = (fecha) => {
  if (!fecha) return null;
  if (typeof fecha === 'string' && fecha.includes('T')) {
    return fecha.split('T')[0]; // Solo fecha YYYY-MM-DD
  }
  return fecha;
};

// Helper function para construir query params
export const buildFleteFilters = (filters) => {
  const cleanFilters = {};
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      cleanFilters[key] = filters[key];
    }
  });
  
  return cleanFilters;
};

// NUEVO: Helper para construir filtros avanzados con validación
export const buildAdvancedFleteFilters = (filters) => {
  const cleanFilters = {};
  
  // Filtros de Flete
  if (filters.codigo_flete) cleanFilters.codigo_flete = filters.codigo_flete;
  if (filters.estado_flete) cleanFilters.estado_flete = filters.estado_flete;
  if (filters.pertenece_a_factura !== undefined) cleanFilters.pertenece_a_factura = filters.pertenece_a_factura;
  if (filters.codigo_factura) cleanFilters.codigo_factura = filters.codigo_factura;
  if (filters.monto_min !== undefined && filters.monto_min !== null) cleanFilters.monto_min = filters.monto_min;
  if (filters.monto_max !== undefined && filters.monto_max !== null) cleanFilters.monto_max = filters.monto_max;
  
  // Filtros de Servicio
  if (filters.cliente) cleanFilters.cliente = filters.cliente;
  if (filters.placa) cleanFilters.placa = filters.placa;
  if (filters.conductor) cleanFilters.conductor = filters.conductor;
  if (filters.tipo_servicio) cleanFilters.tipo_servicio = filters.tipo_servicio;
  if (filters.zona) cleanFilters.zona = filters.zona;
  if (filters.estado_servicio) cleanFilters.estado_servicio = filters.estado_servicio;
  
  // Filtros de Fecha
  if (filters.fecha_servicio_desde) cleanFilters.fecha_servicio_desde = formatDateToISO(filters.fecha_servicio_desde);
  if (filters.fecha_servicio_hasta) cleanFilters.fecha_servicio_hasta = formatDateToISO(filters.fecha_servicio_hasta);
  if (filters.fecha_creacion_desde) cleanFilters.fecha_creacion_desde = formatDateToISO(filters.fecha_creacion_desde);
  if (filters.fecha_creacion_hasta) cleanFilters.fecha_creacion_hasta = formatDateToISO(filters.fecha_creacion_hasta);
  
  // Paginación
  if (filters.page) cleanFilters.page = filters.page;
  if (filters.page_size) cleanFilters.page_size = filters.page_size;
  
  return cleanFilters;
};

