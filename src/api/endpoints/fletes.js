// api/endpoints/fletes.js
import axiosInstance from '../axiosConfig';

export const fletesAPI = {
  // Crear un nuevo flete (manual)
  createFlete: async (fleteData) => {
    console.log('Creando flete:', fleteData);
    const response = await axiosInstance.post('/fletes/', fleteData);
    return response.data;
  },

  // Obtener todos los fletes con filtros y paginación
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
    
    // Filtros de fecha (si los agregas a tu API)
    if (filters.fecha_creacion) params.append('fecha_creacion', filters.fecha_creacion);
    if (filters.fecha_creacion_desde) params.append('fecha_creacion_desde', filters.fecha_creacion_desde);
    if (filters.fecha_creacion_hasta) params.append('fecha_creacion_hasta', filters.fecha_creacion_hasta);

    const response = await axiosInstance.get(`/fletes/?${params.toString()}`);
    
    // Devuelve la estructura que espera tu API
    return response.data;
  },

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

  // Método específico para exportar fletes (si tu backend lo soporta)
  exportFletesExcel: async (filters = {}) => {
    try {
      // Primero obtenemos los datos
      const fletesData = await fletesAPI.getAllFletes(filters);
      
      // Creamos un workbook de Excel (usando una librería como xlsx)
      // Si no tienes xlsx instalado: npm install xlsx
      const XLSX = window.XLSX || require('xlsx');
      
      const ws = XLSX.utils.json_to_sheet(fletesData.items || []);
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

  // Método alternativo si tu backend tiene exportación nativa
  exportAllFletesExcel: async (filters = {}) => {
    // NOTA: Tu API actual no tiene endpoint de exportación
    // Puedes implementarlo en el backend o usar la versión frontend arriba
    
    // Si tu backend soporta exportación, descomenta esto:
    /*
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axiosInstance.get(
      `/fletes/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
    */
    
    // Por ahora usamos la versión frontend
    return await fletesAPI.exportFletesExcel(filters);
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

  // Generar código de flete automático (si tu backend lo soporta)
  generarCodigoFlete: async () => {
    try {
      // Puedes implementar esto si tu backend tiene un endpoint para generar códigos
      // Por ahora, podemos generar uno simple en el frontend
      const response = await fletesAPI.getEstadisticas();
      const totalFletes = response.total_fletes || 0;
      const nextNumber = totalFletes + 1;
      return `FLT-${String(nextNumber).padStart(10, '0')}`;
    } catch (error) {
      // Si falla, generamos uno basado en timestamp
      const timestamp = Date.now();
      return `FLT-TEMP-${timestamp}`;
    }
  },
    getGastosByFlete: async (codigoFlete) => {
    const response = await axiosInstance.get(`/gastos-adicionales/flete/${codigoFlete}`);
    return response.data;
  },

    getGastosByCodeFlete: async (codigoFlete) => {
    const response = await axiosInstance.get(`/gastos-adicionales/flete-code/${codigoFlete}`);
    return response.data;
  },
  createGasto: async (gastoData) => {
    // console.log('Creando gasto:', gastoData);
    const response = await axiosInstance.post('gastos-adicionales/', gastoData);
    return response.data;
  },


};

// Helper function para formatear filtros de fecha
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