// archivo: src/api/endpoints/gastosAdicionales.js
import axiosInstance from '../axiosConfig';

export const gastosAdicionalesAPI = {
  // ==========================================
  // CRUD Básico
  // ==========================================
  
  // Crear un nuevo gasto adicional
  createGasto: async (gastoData) => {
    console.log('Creando gasto adicional:', gastoData);
    const response = await axiosInstance.post('/gastos-adicionales/', gastoData);
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
    if (filters.id_flete) params.append('id_flete', filters.id_flete);
    if (filters.codigo_gasto) params.append('codigo_gasto', filters.codigo_gasto);
    if (filters.tipo_gasto) params.append('tipo_gasto', filters.tipo_gasto);
    if (filters.se_factura_cliente !== undefined) params.append('se_factura_cliente', filters.se_factura_cliente);
    if (filters.estado_facturacion) params.append('estado_facturacion', filters.estado_facturacion);
    if (filters.estado_aprobacion) params.append('estado_aprobacion', filters.estado_aprobacion);
    if (filters.usuario_registro) params.append('usuario_registro', filters.usuario_registro);
    if (filters.numero_factura) params.append('numero_factura', filters.numero_factura);
    
    // Filtros de fecha
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await axiosInstance.get(`/gastos-adicionales/?${params.toString()}`);
    
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
    const response = await axiosInstance.get(`/gastos-adicionales/${gastoId}`);
    return response.data;
  },

  // Obtener gasto por código
  getGastoByCodigo: async (codigoGasto) => {
    const response = await axiosInstance.get(`/gastos-adicionales/codigo/${codigoGasto}`);
    return response.data;
  },

  // Actualizar gasto
  updateGasto: async (gastoId, updateData) => {
    console.log('Actualizando gasto adicional:', updateData);
    const response = await axiosInstance.put(`/gastos-adicionales/${gastoId}`, updateData);
    return response.data;
  },

  // Eliminar gasto
  deleteGasto: async (gastoId) => {
    const response = await axiosInstance.delete(`/gastos-adicionales/${gastoId}`);
    return response.data;
  },

  // ==========================================
  // Gastos por Flete
  // ==========================================
  
  // Obtener gastos por ID de flete
  getGastosByFleteId: async (fleteId) => {
    const response = await axiosInstance.get(`/gastos-adicionales/flete/${fleteId}`);
    return response.data;
  },

  // Obtener gastos por código de flete
  getGastosByFleteCode: async (fleteCodigo) => {
    const response = await axiosInstance.get(`/gastos-adicionales/flete-code/${fleteCodigo}`);
    return response.data;
  },

  // ==========================================
  // Exportación a Excel
  // ==========================================
  
  // Exportar gastos a Excel con filtros
  exportGastosExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de filtrado
    if (filters.id_flete) params.append('id_flete', filters.id_flete);
    if (filters.codigo_gasto) params.append('codigo_gasto', filters.codigo_gasto);
    if (filters.tipo_gasto) params.append('tipo_gasto', filters.tipo_gasto);
    if (filters.se_factura_cliente !== undefined) params.append('se_factura_cliente', filters.se_factura_cliente);
    if (filters.estado_facturacion) params.append('estado_facturacion', filters.estado_facturacion);
    if (filters.estado_aprobacion) params.append('estado_aprobacion', filters.estado_aprobacion);
    if (filters.usuario_registro) params.append('usuario_registro', filters.usuario_registro);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await axiosInstance.get(
      `/gastos-adicionales/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // ==========================================
  // Estadísticas y Reportes
  // ==========================================
  
  // Obtener estadísticas generales
  getEstadisticas: async () => {
    const response = await axiosInstance.get('/gastos-adicionales/stats/estadisticas');
    return response.data;
  },

  // Obtener resumen por flete
  getResumenByFlete: async (fleteId) => {
    try {
      const response = await axiosInstance.get(`/gastos-adicionales/flete/${fleteId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo resumen por flete:', error);
      return null;
    }
  },

  // ==========================================
  // Funciones Auxiliares
  // ==========================================
  
  // Función auxiliar para descargar archivos Excel
  downloadExcel: (blob, filename = 'gastos_adicionales.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Descargar plantilla para importar gastos (si tu backend la provee)
  downloadPlantillaExcel: async () => {
    try {
      const response = await axiosInstance.get(
        '/gastos-adicionales/template/excel',
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      return null;
    }
  },

  // Importar gastos desde Excel (si tu backend lo soporta)
  importGastosExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(
        '/gastos-adicionales/import/excel',
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error importando gastos:', error);
      throw error;
    }
  },

  // Obtener tipos de gasto comunes
  getTiposGastoComunes: async () => {
    try {
      // Si tu backend no tiene esta ruta, puedes devolver una lista predeterminada
      // const response = await axiosInstance.get('/gastos-adicionales/tipos-comunes');
      // return response.data;
      
      // Lista predeterminada basada en tu esquema
      return [
        'Estadía',
        'Peaje Extra',
        'Maniobra',
        'Reparación',
        'Combustible Extra',
        'Viáticos',
        'Alimentación',
        'Hospedaje',
        'Lavado',
        'Mantenimiento',
        'Estacionamiento',
        'Otros'
      ];
    } catch (error) {
      console.error('Error obteniendo tipos de gasto:', error);
      // Retornar lista predeterminada si falla
      return [
        'Estadía',
        'Peaje Extra',
        'Maniobra',
        'Reparación',
        'Combustible Extra',
        'Viáticos',
        'Alimentación',
        'Hospedaje',
        'Otros'
      ];
    }
  },

  // Actualizar estado de aprobación
  updateEstadoAprobacion: async (gastoId, estadoData) => {
    const updateData = {
      estado_aprobacion: estadoData.estado_aprobacion,
      ...(estadoData.fecha_aprobacion && { fecha_aprobacion: estadoData.fecha_aprobacion })
    };
    
    const response = await axiosInstance.put(`/gastos-adicionales/${gastoId}`, updateData);
    return response.data;
  },

  // Actualizar estado de facturación
  updateEstadoFacturacion: async (gastoId, estadoData) => {
    const updateData = {
      estado_facturacion: estadoData.estado_facturacion,
      numero_factura: estadoData.numero_factura || null
    };
    
    const response = await axiosInstance.put(`/gastos-adicionales/${gastoId}`, updateData);
    return response.data;
  },

  // Función específica para el componente de gastos por flete
  getGastos: async (filters = {}) => {
    // Esta función es un wrapper que mantiene compatibilidad con el componente
    return await gastosAdicionalesAPI.getAllGastos(filters, { page: 1, pageSize: 100 });
  }
};

export default gastosAdicionalesAPI;