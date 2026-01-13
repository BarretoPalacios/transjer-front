import axiosInstance from '../axiosConfig';

export const cuentasAPI = {
  createCuenta: async (cuentaData) => {
    const response = await axiosInstance.post('/cuentas/', cuentaData);
    return response.data;
  },

  getAllCuentas: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.codigo_cuenta) params.append('codigo_cuenta', filters.codigo_cuenta);
    if (filters.codigo_cliente) params.append('codigo_cliente', filters.codigo_cliente);
    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.ruc) params.append('ruc', filters.ruc);
    if (filters.tipo_cliente && filters.tipo_cliente !== 'todos') {
      params.append('tipo_cliente', filters.tipo_cliente);
    }
    if (filters.estado && filters.estado !== 'todos') {
      params.append('estado', filters.estado);
    }
    if (filters.contacto) params.append('contacto', filters.contacto);
    
    const response = await axiosInstance.get(`/cuentas/?${params.toString()}`);
    return response.data;
  },

  getCuentaById: async (cuentaId) => {
    const response = await axiosInstance.get(`/cuentas/${cuentaId}`);
    return response.data;
  },

  getCuentaByCodigo: async (codigoCuenta) => {
    const response = await axiosInstance.get(`/cuentas/codigo/${codigoCuenta}`);
    return response.data;
  },

  getCuentasByRUC: async (ruc) => {
    const response = await axiosInstance.get(`/cuentas/ruc/${ruc}`);
    return response.data;
  },

  getCuentasByTipo: async (tipoCliente) => {
    const response = await axiosInstance.get(`/cuentas/tipo/${tipoCliente}`);
    return response.data;
  },

  getCuentasByEstado: async (estado) => {
    const response = await axiosInstance.get(`/cuentas/estado/${estado}`);
    return response.data;
  },

  updateCuenta: async (cuentaId, updateData) => {
    const response = await axiosInstance.put(`/cuentas/${cuentaId}`, updateData);
    return response.data;
  },

  deleteCuenta: async (cuentaId) => {
    const response = await axiosInstance.delete(`/cuentas/${cuentaId}`);
    return response.data;
  },

  deleteCuentaPermanente: async (cuentaId) => {
    const response = await axiosInstance.delete(`/cuentas/${cuentaId}`);
    return response.data;
  },

  exportAllCuentasExcel: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.codigo_cuenta) params.append('codigo_cuenta', filters.codigo_cuenta);
    if (filters.codigo_cliente) params.append('codigo_cliente', filters.codigo_cliente);
    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.ruc) params.append('ruc', filters.ruc);
    if (filters.tipo_cliente) params.append('tipo_cliente', filters.tipo_cliente);
    if (filters.estado) params.append('estado', filters.estado);
    
    const response = await axiosInstance.get(`/cuentas/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  importCuentasExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/cuentas/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await axiosInstance.get('/cuentas/stats/estadisticas');
    return response.data;
  },

  getLimiteCreditoInfo: async () => {
    const response = await axiosInstance.get('/cuentas/stats/limite-credito');
    return response.data;
  },

  downloadExcel: (blob, filename = 'cuentas.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  handleError: (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error(error.response.data.detail || 'Datos inválidos');
        case 404:
          throw new Error('Cuenta no encontrada');
        case 409:
          throw new Error('El código de cuenta ya existe en el sistema');
        case 500:
          throw new Error('Error interno del servidor');
        default:
          throw new Error(error.response.data.detail || 'Error desconocido');
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      throw new Error(error.message || 'Error desconocido');
    }
  },

  normalizeFilters: (frontendFilters) => {
    const apiFilters = {};
    
    if (frontendFilters.codigo_cuenta) apiFilters.codigo_cuenta = frontendFilters.codigo_cuenta;
    if (frontendFilters.codigo_cliente) apiFilters.codigo_cliente = frontendFilters.codigo_cliente;
    if (frontendFilters.nombre) apiFilters.nombre = frontendFilters.nombre;
    if (frontendFilters.ruc) apiFilters.ruc = frontendFilters.ruc;
    if (frontendFilters.contacto) apiFilters.contacto = frontendFilters.contacto;
    
    if (frontendFilters.tipo_cliente && frontendFilters.tipo_cliente !== 'todos') {
      apiFilters.tipo_cliente = frontendFilters.tipo_cliente;
    }
    
    if (frontendFilters.estado && frontendFilters.estado !== 'todos') {
      apiFilters.estado = frontendFilters.estado;
    }
    
    return apiFilters;
  }
};