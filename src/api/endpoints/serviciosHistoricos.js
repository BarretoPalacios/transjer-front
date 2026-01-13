import axiosInstance from '../axiosConfig';

export const serviciosHistoricosAPI = {
  // Obtener todos los servicios con filtros y paginación
  getAllServicios: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación - adaptado a tu API que usa skip/limit
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 10;
    
    // Convertir page/pageSize a skip/limit
    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    
    params.append('skip', skip);
    params.append('limit', limit);

    // Parámetros de filtrado según tus endpoints
    if (filters.cliente) params.append('cliente', filters.cliente);
    if (filters.estado_factura) params.append('estado_factura', filters.estado_factura);
    if (filters.estado_servicio) params.append('estado_servicio', filters.estado_servicio);
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.servicio) params.append('servicio', filters.servicio);
    if (filters.grte) params.append('grte', filters.grte);
    if (filters.cliente_destino) params.append('cliente_destino', filters.cliente_destino);
    if (filters.proveedor) params.append('proveedor', filters.proveedor);
    if (filters.conductor) params.append('conductor', filters.conductor);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.busqueda_general) params.append('busqueda_general', filters.busqueda_general);
    
    // Parámetros de ordenación
    if (filters.ordenar_por) params.append('ordenar_por', filters.ordenar_por);
    if (filters.orden) params.append('orden', filters.orden);

    const response = await axiosInstance.get(`/servicios-historicos/buscar?${params.toString()}`);
    
    // Transformar la respuesta a un formato consistente
    return {
        servicios: response.data.servicios || [],
        paginacion: {
            skip: response.data.paginacion?.skip || skip,
            limit: response.data.paginacion?.limit || limit,
            total: response.data.paginacion?.total || 0,
            has_more: response.data.paginacion?.has_more || false,
            currentPage: page,
            itemsPerPage: pageSize,
            totalPages: Math.ceil((response.data.paginacion?.total || 0) / pageSize)
        }
    };
  },

  // Obtener un servicio por ID
  getServicioById: async (servicioId) => {
    const response = await axiosInstance.get(`/servicios-historicos/${servicioId}`);
    return response.data;
  },

updateServicio: async (servicioId, updateData) => {
    const payload = {
      nuevo_estado: updateData.estado,
      numero_factura: updateData.numero_factura,
      monto: updateData.monto,
      moneda: updateData.moneda || "PEN",
      fecha_emision: updateData.fecha_emision
    };
    
    const response = await axiosInstance.put(`/servicios-historicos/${servicioId}`, payload);
    return response.data;
  },


  // Obtener estadísticas
  getEstadisticas: async () => {
    const response = await axiosInstance.get('/servicios-historicos/estadisticas');
    return response.data;
  },

  // Obtener servicios pendientes de facturación
  getPendientesFacturacion: async (skip = 0, limit = 100) => {
    const response = await axiosInstance.get(
      `/servicios-historicos/pendientes-facturacion?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  // Obtener servicios recientes
  getServiciosRecientes: async (dias = 7, limit = 50) => {
    const response = await axiosInstance.get(
      `/servicios-historicos/recientes?dias=${dias}&limit=${limit}`
    );
    return response.data;
  },

  // Buscar por texto en múltiples campos
  buscarPorTexto: async (query, limit = 50) => {
    const response = await axiosInstance.get(
      `/servicios-historicos/busqueda/texto?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data;
  },

// Exportar servicios a Excel
exportServiciosExcel: async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Agregar todos los parámetros disponibles según el endpoint
  if (filters.cliente) params.append('cliente', filters.cliente);
  if (filters.estado_factura) params.append('estado_factura', filters.estado_factura);
  if (filters.estado_servicio) params.append('estado_servicio', filters.estado_servicio);
  if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
  if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
  if (filters.servicio) params.append('servicio', filters.servicio);
  if (filters.grte) params.append('grte', filters.grte);
  if (filters.cliente_destino) params.append('cliente_destino', filters.cliente_destino);
  if (filters.proveedor) params.append('proveedor', filters.proveedor);
  if (filters.conductor) params.append('conductor', filters.conductor);
  if (filters.placa) params.append('placa', filters.placa);
  if (filters.busqueda_general) params.append('busqueda_general', filters.busqueda_general);
  // Nota: El parámetro 'cuenta' no está en el endpoint, así que no lo incluyas
  // Nota: El parámetro 'mes' no está en el endpoint, así que no lo incluyas
  // Nota: El parámetro 'tipo_servicio' no está en el endpoint, así que no lo incluyas
  // Nota: El parámetro 'origen' no está en el endpoint, así que no lo incluyas
  // Nota: El parámetro 'destino' no está en el endpoint, así que no lo incluyas
  
  const response = await axiosInstance.get(
    `/servicios-historicos/exportar/excel?${params.toString()}`,
    { responseType: 'blob' }
  );
  return response.data;
},

  // Descargar Excel (helper function)
  downloadExcel: (blob, filename = 'servicios_historicos.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Cargar archivo Excel
  importServiciosExcel: async (file, usuario = "sistema") => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('usuario', usuario);

    const response = await axiosInstance.post(
      '/servicios-historicos/cargar-excel',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  },

  // Eliminar servicio
  deleteServicio: async (servicioId) => {
    const response = await axiosInstance.delete(`/servicios-historicos/${servicioId}`);
    return response.data;
  }
};