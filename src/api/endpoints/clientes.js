import axiosInstance from '../axiosConfig';

export const clienteAPI = {
  createCliente: async (clienteData) => {
    console.log(clienteData)
    const response = await axiosInstance.post('/clientes/', clienteData);
    return response.data;
  },

  getAllClientes: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 10;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // Parámetros de filtrado
    if (filters.codigo_cliente) params.append('codigo_cliente', filters.codigo_cliente);
    if (filters.tipo_documento) params.append('tipo_documento', filters.tipo_documento);
    if (filters.numero_documento) params.append('numero_documento', filters.numero_documento);
    if (filters.razon_social) params.append('razon_social', filters.razon_social);
    if (filters.nombre_comercial) params.append('nombre_comercial', filters.nombre_comercial);
    if (filters.tipo_cliente) params.append('tipo_cliente', filters.tipo_cliente);
    if (filters.tipo_pago) params.append('tipo_pago', filters.tipo_pago);
    if (filters.dias_credito !== undefined) params.append('dias_credito', filters.dias_credito);
    if (filters.contacto_principal) params.append('contacto_principal', filters.contacto_principal);
    if (filters.telefono) params.append('telefono', filters.telefono);
    if (filters.periodo_facturacion) params.append('periodo_facturacion', filters.periodo_facturacion);
    if (filters.estado) params.append('estado', filters.estado);

    const response = await axiosInstance.get(`/clientes/?${params.toString()}`);
    
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

  getClienteById: async (clienteId) => {
    const response = await axiosInstance.get(`/clientes/${clienteId}`);
    return response.data;
  },

  getClienteByCodigo: async (codigoCliente) => {
    const response = await axiosInstance.get(`/clientes/codigo/${codigoCliente}`);
    return response.data;
  },

  getClienteByDocumento: async (tipoDocumento, numeroDocumento) => {
    const response = await axiosInstance.get(
      `/clientes/documento/${tipoDocumento}/${numeroDocumento}`
    );
    return response.data;
  },

  updateCliente: async (clienteId, updateData) => {
    console.log(updateData)
    const response = await axiosInstance.put(`/clientes/${clienteId}`, updateData);
    return response.data;
  },

  deleteCliente: async (clienteId) => {
    const response = await axiosInstance.delete(`/clientes/${clienteId}`);
    return response.data;
  },

  exportClienteExcel: async (clienteId) => {
    const response = await axiosInstance.get(
      `/clientes/${clienteId}/export/excel`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  exportAllClientesExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.codigo_cliente) params.append('codigo_cliente', filters.codigo_cliente);
    if (filters.razon_social) params.append('razon_social', filters.razon_social);
    if (filters.tipo_cliente) params.append('tipo_cliente', filters.tipo_cliente);
    if (filters.tipo_pago) params.append('tipo_pago', filters.tipo_pago);
    if (filters.dias_credito !== undefined) params.append('dias_credito', filters.dias_credito);
    if (filters.estado) params.append('estado', filters.estado);

    const response = await axiosInstance.get(
      `/clientes/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  downloadPlantillaExcel: async () => {
    const response = await axiosInstance.get(
      '/clientes/template/excel',
      { responseType: 'blob' }
    );
    return response.data;
  },

  importClientesExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      '/clientes/import/excel',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  },

  getEstadisticas: async () => {
    const response = await axiosInstance.get('/clientes/stats/estadisticas');
    return response.data;
  },

  downloadExcel: (blob, filename = 'clientes.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  consultarRuc: async (ruc) => {
    const response = await axiosInstance.get(`/utils/consultar-ruc/${ruc}`);
    return response.data;
  }

};
