// personal.js
import axiosInstance from '../axiosConfig';

export const personalAPI = {
  createPersonal: async (personalData) => {
    console.log('Datos de personal a crear:', personalData);
    const response = await axiosInstance.post('/personal/', personalData);
    return response.data;
  },

  getAllPersonal: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 10;
    const sortBy = pagination.sortBy || 'fecha_registro';
    const sortOrder = pagination.sortOrder || 'desc';
    
    params.append('page', page);
    params.append('page_size', pageSize);
    params.append('sort_by', sortBy);
    params.append('sort_order', sortOrder);

    // Parámetros de filtrado
    if (filters.dni) params.append('dni', filters.dni);
    if (filters.nombres_completos) params.append('nombres_completos', filters.nombres_completos);
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.licencia_conducir) params.append('licencia_conducir', filters.licencia_conducir);
    if (filters.categoria_licencia) params.append('categoria_licencia', filters.categoria_licencia);
    if (filters.turno) params.append('turno', filters.turno);
    if (filters.fecha_ingreso_desde) params.append('fecha_ingreso_desde', filters.fecha_ingreso_desde);
    if (filters.fecha_ingreso_hasta) params.append('fecha_ingreso_hasta', filters.fecha_ingreso_hasta);
    if (filters.salario_min !== undefined) params.append('salario_min', filters.salario_min);
    if (filters.salario_max !== undefined) params.append('salario_max', filters.salario_max);
    if (filters.banco) params.append('banco', filters.banco);
    if (filters.telefono) params.append('telefono', filters.telefono);
    if (filters.email) params.append('email', filters.email);
    if (filters.contacto_emergencia) params.append('contacto_emergencia', filters.contacto_emergencia);

    const response = await axiosInstance.get(`/personal/?${params.toString()}`);
    
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

  getPersonalById: async (personalId) => {
    const response = await axiosInstance.get(`/personal/${personalId}`);
    return response.data;
  },

  getPersonalByCodigo: async (codigoPersonal) => {
    const response = await axiosInstance.get(`/personal/codigo/${codigoPersonal}`);
    return response.data;
  },

  getPersonalByDni: async (dni) => {
    const response = await axiosInstance.get(`/personal/dni/${dni}`);
    return response.data;
  },

  updatePersonal: async (personalId, updateData) => {
    console.log('Datos de personal a actualizar:', updateData);
    const response = await axiosInstance.put(`/personal/${personalId}`, updateData);
    return response.data;
  },

  deletePersonal: async (personalId) => {
    const response = await axiosInstance.delete(`/personal/${personalId}`);
    return response.data;
  },

  exportPersonalExcel: async (personalId) => {
    const response = await axiosInstance.get(
      `/personal/${personalId}/export/excel`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  exportAllPersonalExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.dni) params.append('dni', filters.dni);
    if (filters.nombres_completos) params.append('nombres_completos', filters.nombres_completos);
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.licencia_conducir) params.append('licencia_conducir', filters.licencia_conducir);
    if (filters.categoria_licencia) params.append('categoria_licencia', filters.categoria_licencia);
    if (filters.turno) params.append('turno', filters.turno);
    if (filters.fecha_ingreso_desde) params.append('fecha_ingreso_desde', filters.fecha_ingreso_desde);
    if (filters.fecha_ingreso_hasta) params.append('fecha_ingreso_hasta', filters.fecha_ingreso_hasta);

    const response = await axiosInstance.get(
      `/personal/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  downloadPlantillaExcel: async () => {
    const response = await axiosInstance.get(
      '/personal/template/excel',
      { responseType: 'blob' }
    );
    return response.data;
  },

  importPersonalExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      '/personal/import/excel',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  },

  getEstadisticas: async () => {
    const response = await axiosInstance.get('/personal/stats/estadisticas');
    return response.data;
  },

  getLicenciasPorVencer: async (diasRestantes = 30) => {
    const response = await axiosInstance.get(`/personal/licencias/por-vencer?dias_restantes=${diasRestantes}`);
    return response.data;
  },

  getCumpleaniosProximos: async (diasProximos = 30) => {
    const response = await axiosInstance.get(`/personal/cumpleanios/proximos?dias_proximos=${diasProximos}`);
    return response.data;
  },

  bulkUpdateStatus: async (personalIds, nuevoEstado, motivo = null, fechaEfectiva = null) => {
    const bulkData = {
      personal_ids: personalIds,
      nuevo_estado: nuevoEstado,
      motivo: motivo,
      fecha_efectiva: fechaEfectiva
    };
    const response = await axiosInstance.post('/personal/bulk/estado', bulkData);
    return response.data;
  },

  // Método auxiliar para descargar archivos Excel
  downloadExcel: (blob, filename = 'personal.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  // Método auxiliar para formatear datos para filtros
  formatFilterParams: (filters) => {
    const formatted = {};
    
    if (filters.dni) formatted.dni = filters.dni;
    if (filters.nombres_completos) formatted.nombres_completos = filters.nombres_completos;
    if (filters.tipo) formatted.tipo = filters.tipo;
    if (filters.estado) formatted.estado = filters.estado;
    if (filters.licencia_conducir) formatted.licencia_conducir = filters.licencia_conducir;
    if (filters.categoria_licencia) formatted.categoria_licencia = filters.categoria_licencia;
    if (filters.turno) formatted.turno = filters.turno;
    
    // Formatear fechas a YYYY-MM-DD
    if (filters.fecha_ingreso_desde) {
      formatted.fecha_ingreso_desde = filters.fecha_ingreso_desde instanceof Date 
        ? filters.fecha_ingreso_desde.toISOString().split('T')[0]
        : filters.fecha_ingreso_desde;
    }
    
    if (filters.fecha_ingreso_hasta) {
      formatted.fecha_ingreso_hasta = filters.fecha_ingreso_hasta instanceof Date 
        ? filters.fecha_ingreso_hasta.toISOString().split('T')[0]
        : filters.fecha_ingreso_hasta;
    }
    
    if (filters.salario_min !== undefined) formatted.salario_min = parseFloat(filters.salario_min);
    if (filters.salario_max !== undefined) formatted.salario_max = parseFloat(filters.salario_max);
    if (filters.banco) formatted.banco = filters.banco;
    if (filters.telefono) formatted.telefono = filters.telefono;
    if (filters.email) formatted.email = filters.email;
    if (filters.contacto_emergencia) formatted.contacto_emergencia = filters.contacto_emergencia;

    return formatted;
  },

  // Método auxiliar para formatear datos de paginación
  formatPaginationParams: (pagination) => {
    const formatted = {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 10,
      sortBy: pagination.sortBy || 'fecha_registro',
      sortOrder: pagination.sortOrder || 'desc'
    };
    return formatted;
  },

  // Método para consultar DNI (si tienes un servicio similar al de RUC)
  consultarDni: async (dni) => {
    try {
      // Si tienes un endpoint para consultar DNI, lo implementas aquí
      // const response = await axiosInstance.get(`/utils/consultar-dni/${dni}`);
      // return response.data;
      
      // Por ahora, devolvemos un mock o puedes implementarlo más tarde
      return {
        success: false,
        message: "Servicio de consulta de DNI no disponible",
        data: null
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al consultar DNI",
        data: null
      };
    }
  }
};

// Opcional: función para exportar por defecto
export default personalAPI;