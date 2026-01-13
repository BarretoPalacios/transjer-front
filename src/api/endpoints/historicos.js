// api/endpoints/historicos.js
import axiosInstance from '../axiosConfig';

export const historicoAPI = {
  // ============ OBTENER TODOS LOS HISTÓRICOS CON FILTROS ============
  getAllHistoricos: async (filters = {}) => {
    const params = new URLSearchParams();

    // Filtros de texto exacto
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.periodo) params.append('periodo', filters.periodo);
    if (filters.estado_final) params.append('estado_final', filters.estado_final);
    if (filters.servicio_id) params.append('servicio_id', filters.servicio_id);
    
    // Filtros de texto con regex
    if (filters.codigo_servicio) params.append('codigo_servicio', filters.codigo_servicio);
    if (filters.usuario) params.append('usuario', filters.usuario);
    
    // Filtros de fecha
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    // Filtros de periodo (rango)
    if (filters.periodo_inicio) params.append('periodo_inicio', filters.periodo_inicio);
    if (filters.periodo_fin) params.append('periodo_fin', filters.periodo_fin);
    
    // Paginación
    if (filters.skip !== undefined) params.append('skip', filters.skip);
    if (filters.limit !== undefined) params.append('limit', filters.limit);
    
    // Ordenamiento
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order !== undefined) params.append('sort_order', filters.sort_order);

    const response = await axiosInstance.get(`/historicos/?${params.toString()}`);
    return response.data;
  },

  // ============ OBTENER HISTÓRICO POR ID ============
  getHistoricoById: async (historicoId) => {
    const response = await axiosInstance.get(`/historicos/${historicoId}`);
    return response.data;
  },

  // ============ OBTENER HISTÓRICO CON SERVICIO COMPLETO ============
  getHistoricoConServicio: async (historicoId) => {
    const response = await axiosInstance.get(`/historicos/${historicoId}/servicio`);
    return response.data;
  },

  // ============ OBTENER HISTÓRICOS DE UN SERVICIO ============
  getHistoricosByServicio: async (servicioId) => {
    const response = await axiosInstance.get(`/historicos/servicio/${servicioId}`);
    return response.data;
  },

  // ============ OBTENER ESTADÍSTICAS ============
  getEstadisticas: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await axiosInstance.get(`/historicos/estadisticas/resumen?${params.toString()}`);
    return response.data;
  },

  // ============ OBTENER HISTÓRICOS POR PERIODO ============
  getHistoricosByPeriodo: async (periodo, filters = {}) => {
    const params = new URLSearchParams();

    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.skip !== undefined) params.append('skip', filters.skip);
    if (filters.limit !== undefined) params.append('limit', filters.limit);

    const response = await axiosInstance.get(`/historicos/periodo/${periodo}?${params.toString()}`);
    return response.data;
  },

  // ============ OBTENER ÚLTIMOS HISTÓRICOS ============
  getUltimosHistoricos: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.limit !== undefined) params.append('limit', filters.limit);
    if (filters.tipo) params.append('tipo', filters.tipo);

    const response = await axiosInstance.get(`/historicos/recientes/ultimos?${params.toString()}`);
    return response.data;
  },

  // ============ EXPORTAR HISTÓRICOS A EXCEL ============
  exportAllHistoricosExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    // Filtros de texto exacto
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.periodo) params.append('periodo', filters.periodo);
    if (filters.estado_final) params.append('estado_final', filters.estado_final);
    if (filters.servicio_id) params.append('servicio_id', filters.servicio_id);
    
    // Filtros de texto con regex
    if (filters.codigo_servicio) params.append('codigo_servicio', filters.codigo_servicio);
    if (filters.usuario) params.append('usuario', filters.usuario);
    
    // Filtros de fecha
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    // Filtros de periodo (rango)
    if (filters.periodo_inicio) params.append('periodo_inicio', filters.periodo_inicio);
    if (filters.periodo_fin) params.append('periodo_fin', filters.periodo_fin);

    const response = await axiosInstance.get(
      `/historicos/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // ============ DESCARGAR ARCHIVO EXCEL ============
  downloadExcel: (blob, filename = 'historicos.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
};