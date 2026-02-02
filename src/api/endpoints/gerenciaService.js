// archivo: src/api/endpoints/gerenciaService.js
import axiosInstance from '../axiosConfig';

export const gerenciaServiceAPI = {
  // ==========================================
  // KPI's Completos
  // ==========================================
  
  getKpisCompletos: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 100;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // Parámetros de filtro
    if (filters.nombre_cliente) params.append('nombre_cliente', filters.nombre_cliente);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await axiosInstance.get(`/gerencia/kpis-completos?${params.toString()}`);
    
    console.log('KPI Completos Response:', response.data);
    
    // Formatear la respuesta para que coincida con la estructura esperada por el frontend
    return {
      summary: response.data.summary || {
        total_vendido: 0,
        total_facturado: 0,
        total_pagado: 0,
        total_pendiente: 0,
        total_detracciones: 0,
        total_pagado_detracc: 0,
        total_pendiente_detracc: 0,
        cantidad_fletes_vendidos: 0,
        total_facturas: 0,
        cliente_buscado: '',
        cliente_encontrado: ''
      },
      items: response.data.items || [],
      pagination: {
        total: response.data.pagination?.total || 0,
        page: response.data.pagination?.page || page,
        pageSize: response.data.pagination?.page_size || pageSize,
        totalPages: response.data.pagination?.total_pages || 1,
        hasNext: response.data.pagination?.has_next || false,
        hasPrev: response.data.pagination?.has_prev || false
      }
    };
  },

  // ==========================================
  // Resumen por Placa
  // ==========================================
  
  getResumenPorPlaca: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de filtrado
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await axiosInstance.get(`/gerencia/resumen-por-placa?${params.toString()}`);
    
    console.log('Resumen por Placa Response:', response.data);
    
    // Formatear la respuesta para consistencia
    return {
      resumen: response.data.resumen || {
        total_placas: 0,
        total_servicios: 0,
        total_vendido: 0
      },
      filtros_aplicados: response.data.filtros_aplicados || {
        placa: null,
        fecha_inicio: null,
        fecha_fin: null
      },
      detalle_por_placa: response.data.detalle_por_placa || [],
      items: response.data.detalle_por_placa || [], // Para compatibilidad con paginación
      pagination: {
        total: response.data.detalle_por_placa?.length || 0,
        page: 1,
        pageSize: response.data.detalle_por_placa?.length || 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  },

  // ==========================================
  // Reportes por Periodo (si existe)
  // ==========================================
  
  getReportePorPeriodo: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 100;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // Parámetros de filtro
    if (filters.periodo) params.append('periodo', filters.periodo);
    if (filters.tipo_reporte) params.append('tipo_reporte', filters.tipo_reporte);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    try {
      const response = await axiosInstance.get(`/gerencia/reporte-periodo?${params.toString()}`);
      
      console.log('Reporte por Periodo Response:', response.data);
      
      // Formatear la respuesta
      return {
        summary: response.data.summary || {},
        items: response.data.items || [],
        pagination: {
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || page,
          pageSize: response.data.pagination?.page_size || pageSize,
          totalPages: response.data.pagination?.total_pages || 1,
          hasNext: response.data.pagination?.has_next || false,
          hasPrev: response.data.pagination?.has_prev || false
        }
      };
    } catch (error) {
      console.warn('Endpoint reporte-periodo no disponible:', error.message);
      return {
        summary: {},
        items: [],
        pagination: {
          total: 0,
          page: page,
          pageSize: pageSize,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  },

  // ==========================================
  // Dashboard Principal
  // ==========================================
  
  getDashboardData: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de filtro
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    try {
      const response = await axiosInstance.get(`/gerencia/dashboard?${params.toString()}`);
      
      console.log('Dashboard Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.warn('Endpoint dashboard no disponible:', error.message);
      return {
        metrics: {},
        charts: {},
        recent_activity: []
      };
    }
  },

  // ==========================================
  // Top Clientes
  // ==========================================
  
  getTopClientes: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de filtro
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    try {
      const response = await axiosInstance.get(`/gerencia/top-clientes?${params.toString()}`);
      
      console.log('Top Clientes Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.warn('Endpoint top-clientes no disponible:', error.message);
      return {
        top_clientes: [],
        total_vendido: 0
      };
    }
  },

  // ==========================================
  // Exportación a Excel
  // ==========================================
  
  exportKpisExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de filtro
    if (filters.nombre_cliente) params.append('nombre_cliente', filters.nombre_cliente);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await axiosInstance.get(
      `/gerencia/export/kpis-excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  exportResumenPlacaExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de filtro
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await axiosInstance.get(
      `/gerencia/export/resumen-placa-excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // ==========================================
  // Funciones Auxiliares
  // ==========================================
  
  // Validar formato de fecha (YYYY-MM-DD)
  validarFecha: (fecha) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) {
      return false;
    }
    
    const date = new Date(fecha);
    return date instanceof Date && !isNaN(date);
  },

  // Validar rango de fechas
  validarRangoFechas: (fechaInicio, fechaFin) => {
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return inicio <= fin;
    }
    return true;
  },

  // Formatear fecha para mostrar
  formatFechaDisplay: (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return fecha;
    }
  },

  // Formatear fecha completa
  formatFechaCompleta: (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch (e) {
      return fecha;
    }
  },

  // Formatear moneda
  formatMoneda: (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor || 0);
  },

  // Formatear número con separadores
  formatNumero: (valor) => {
    return new Intl.NumberFormat('es-PE').format(valor || 0);
  },

  // Calcular porcentaje
  calcularPorcentaje: (valor, total) => {
    if (total === 0) return 0;
    return ((valor / total) * 100).toFixed(1);
  },

  // Obtener periodos predefinidos
  getPeriodosPredefinidos: () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    return [
      { value: 'today', label: 'Hoy', fecha_inicio: today.toISOString().split('T')[0], fecha_fin: today.toISOString().split('T')[0] },
      { value: 'this_month', label: 'Este Mes', fecha_inicio: startOfMonth.toISOString().split('T')[0], fecha_fin: today.toISOString().split('T')[0] },
      { value: 'this_year', label: 'Este Año', fecha_inicio: startOfYear.toISOString().split('T')[0], fecha_fin: today.toISOString().split('T')[0] },
      { value: 'last_month', label: 'Mes Anterior', 
        fecha_inicio: new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0],
        fecha_fin: new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]
      },
      { value: 'last_year', label: 'Año Anterior',
        fecha_inicio: new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0],
        fecha_fin: new Date(today.getFullYear() - 1, 11, 31).toISOString().split('T')[0]
      }
    ];
  },

  // Obtener placas activas para sugerencias
  getPlacasSugerencias: async () => {
    try {
      // Primero obtenemos el resumen sin filtros para todas las placas
      const response = await gerenciaServiceAPI.getResumenPorPlaca({});
      
      // Extraemos solo las placas del detalle
      const placas = response.detalle_por_placa?.map(item => item.placa) || [];
      
      return [...new Set(placas)].sort(); // Eliminar duplicados y ordenar
    } catch (error) {
      console.error('Error obteniendo sugerencias de placas:', error);
      return [];
    }
  },


  // ==========================================
// Resumen por Proveedor
// ==========================================

getResumenPorProveedor: async (filters = {}) => {
  const params = new URLSearchParams();

  // Parámetros de filtrado
  if (filters.proveedor) params.append('nombre_proveedor', filters.proveedor);
  if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
  if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

  const response = await axiosInstance.get(`/gerencia/resumen-por-proveedor?${params.toString()}`);
  
  console.log('Resumen por Proveedor Response:', response.data);
  
  // Formatear la respuesta para consistencia
  return {
    resumen: response.data.resumen || {
      total_proveedores: 0,
      total_servicios: 0,
      total_vendido: 0
    },
    filtros_aplicados: response.data.filtros_aplicados || {
      proveedor: null,
      fecha_inicio: null,
      fecha_fin: null
    },
    detalle_por_proveedor: response.data.detalle_por_proveedor || [],
    items: response.data.detalle_por_proveedor || [], // Para compatibilidad con paginación
    pagination: {
      total: response.data.detalle_por_proveedor?.length || 0,
      page: 1,
      pageSize: response.data.detalle_por_proveedor?.length || 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  };
},


getResumenPorCliente: async (filters = {}) => {
  const params = new URLSearchParams();

  // Parámetros de filtrado específicos para Clientes
  if (filters.cliente) params.append('nombre_cliente', filters.cliente);
  if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
  if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

  const response = await axiosInstance.get(`/gerencia/resumen-financiero-por-cliente?${params.toString()}`);
  
  console.log('Resumen por Cliente Response:', response.data);

  return response.data
},
// ==========================================
// Sugerencias de Proveedores (autocompletado)
// ==========================================

getProveedoresSugerencias: async () => {
  try {
    // Primero obtenemos el resumen sin filtros para todos los proveedores
    const response = await gerenciaServiceAPI.getResumenPorProveedor({});
    
    // Extraemos solo los nombres de proveedores del detalle
    const proveedores = response.detalle_por_proveedor?.map(item => item.proveedor) || [];
    
    // Eliminar duplicados y ordenar alfabéticamente
    return [...new Set(proveedores)].sort();
  } catch (error) {
    console.error('Error obteniendo sugerencias de proveedores:', error);
    
    // Si hay error, intentamos obtener directamente del backend
    try {
      const response = await axiosInstance.get('/gerencia/proveedores-sugerencias');
      return response.data;
    } catch (fallbackError) {
      console.error('Error en fallback de sugerencias:', fallbackError);
      return [];
    }
  }
},

getClientesSugerencias: async () => {
  try {
    // 1. Intentamos obtener la lista desde el resumen general de clientes
    const response = await gerenciaServiceAPI.getResumenPorCliente({});
    
    // Extraemos los nombres de clientes del detalle
    const clientes = response.detalle_por_cliente?.map(item => item.cliente) || [];
    
    // Eliminar duplicados y ordenar alfabéticamente
    return [...new Set(clientes)].sort();
    
  } catch (error) {
    console.error('Error obteniendo sugerencias de clientes:', error);
    
    // 2. Si falla, intentamos el endpoint directo de sugerencias (si existe en tu API)
    try {
      const response = await axiosInstance.get('/gerencia/clientes-sugerencias');
      return response.data;
    } catch (fallbackError) {
      console.error('Error en fallback de sugerencias de clientes:', fallbackError);
      return [];
    }
  }
},

  // ==========================================
  // Funciones para descargar archivos
  // ==========================================
  
  downloadExcel: (blob, filename = 'reporte.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadPDF: (blob, filename = 'reporte.pdf') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ==========================================
  // Funciones de utilidad para componentes
  // ==========================================
  
  // Obtener color basado en valor (para métricas)
  getColorByValue: (valor, tipo = 'positivo') => {
    if (tipo === 'positivo') {
      return valor > 0 ? 'text-green-600' : 'text-red-600';
    } else if (tipo === 'negativo') {
      return valor > 0 ? 'text-red-600' : 'text-green-600';
    }
    return 'text-gray-600';
  },

  // Obtener icono basado en métrica
  getIconByMetric: (metricName) => {
    const icons = {
      'total_vendido': 'DollarSign',
      'total_facturado': 'FileText',
      'total_pagado': 'CheckCircle',
      'total_pendiente': 'Clock',
      'total_detracciones': 'AlertCircle',
      'total_servicios': 'Truck',
      'total_clientes': 'Users',
      'eficiencia': 'TrendingUp'
    };
    
    return icons[metricName] || 'Activity';
  },

  // Formatear tamaño de archivo
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default gerenciaServiceAPI;