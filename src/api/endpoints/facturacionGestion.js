// api/endpoints/facturacionGestion.js
import axiosInstance from '../axiosConfig';

export const facturacionGestionAPI = {
  // Crear nueva gestión
  createGestion: async (gestionData) => {
    console.log(gestionData);
    const response = await axiosInstance.post('/facturacion-gestion/', gestionData);
    return response.data;
  },

  // Obtener todas las gestiones con filtros y paginación (ACTUALIZADO)
  getAllGestiones: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 10;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // Parámetros de filtrado - actualizados según router
    if (filters.codigo_factura) params.append('codigo_factura', filters.codigo_factura);
    if (filters.numero_factura) params.append('numero_factura', filters.numero_factura);
    if (filters.estado_detraccion) params.append('estado_detraccion', filters.estado_detraccion);
    if (filters.estado_pago_neto) params.append('estado_pago_neto', filters.estado_pago_neto);
    if (filters.prioridad) params.append('prioridad', filters.prioridad);
    if (filters.centro_costo) params.append('centro_costo', filters.centro_costo);
    if (filters.responsable_gestion) params.append('responsable_gestion', filters.responsable_gestion);
    if (filters.fecha_probable_inicio) params.append('fecha_probable_inicio', filters.fecha_probable_inicio);
    if (filters.fecha_probable_fin) params.append('fecha_probable_fin', filters.fecha_probable_fin);
    
    // Nuevos filtros del router
    if (filters.fecha_emision_inicio) params.append('fecha_emision_inicio', filters.fecha_emision_inicio);
    if (filters.fecha_emision_fin) params.append('fecha_emision_fin', filters.fecha_emision_fin);
    if (filters.fecha_vencimiento_inicio) params.append('fecha_vencimiento_inicio', filters.fecha_vencimiento_inicio);
    if (filters.fecha_vencimiento_fin) params.append('fecha_vencimiento_fin', filters.fecha_vencimiento_fin);
    if (filters.fecha_servicio_inicio) params.append('fecha_servicio_inicio', filters.fecha_servicio_inicio);
    if (filters.fecha_servicio_fin) params.append('fecha_servicio_fin', filters.fecha_servicio_fin);
    if (filters.fecha_pago_detraccion_inicio) params.append('fecha_pago_detraccion_inicio', filters.fecha_pago_detraccion_inicio);
    if (filters.fecha_pago_detraccion_fin) params.append('fecha_pago_detraccion_fin', filters.fecha_pago_detraccion_fin);
    if (filters.nombre_cliente) params.append('nombre_cliente', filters.nombre_cliente);
    if (filters.nombre_cuenta) params.append('nombre_cuenta', filters.nombre_cuenta);
    if (filters.nombre_proveedor) params.append('nombre_proveedor', filters.nombre_proveedor);
    if (filters.placa_flota) params.append('placa_flota', filters.placa_flota);
    if (filters.nombre_conductor) params.append('nombre_conductor', filters.nombre_conductor);
    if (filters.nombre_auxiliar) params.append('nombre_auxiliar', filters.nombre_auxiliar);
    if (filters.tipo_servicio) params.append('tipo_servicio', filters.tipo_servicio);
    if (filters.modalidad) params.append('modalidad', filters.modalidad);
    if (filters.zona) params.append('zona', filters.zona);
    if (filters.origen) params.append('origen', filters.origen);
    if (filters.destino) params.append('destino', filters.destino);
    if (filters.monto_total_min) params.append('monto_total_min', filters.monto_total_min);
    if (filters.monto_total_max) params.append('monto_total_max', filters.monto_total_max);
    if (filters.monto_neto_min) params.append('monto_neto_min', filters.monto_neto_min);
    if (filters.monto_neto_max) params.append('monto_neto_max', filters.monto_neto_max);
    if (filters.monto_detraccion_min) params.append('monto_detraccion_min', filters.monto_detraccion_min);
    if (filters.monto_detraccion_max) params.append('monto_detraccion_max', filters.monto_detraccion_max);
    if (filters.tiene_saldo_pendiente !== undefined) params.append('tiene_saldo_pendiente', filters.tiene_saldo_pendiente);
    if (filters.saldo_pendiente_min) params.append('saldo_pendiente_min', filters.saldo_pendiente_min);
    if (filters.saldo_pendiente_max) params.append('saldo_pendiente_max', filters.saldo_pendiente_max);
    if (filters.gia_rr) params.append('gia_rr', filters.gia_rr);
    if (filters.gia_rt) params.append('gia_rt', filters.gia_rt);
    if (filters.search) params.append('search', filters.search);

    const response = await axiosInstance.get(`/facturacion-gestion/?${params.toString()}`);
    
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

getKpisCompletos: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 100;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // Parámetros de filtro (nombres actualizados según la nueva API)
    if (filters.nombre_cliente) params.append('nombre_cliente', filters.nombre_cliente);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await axiosInstance.get(`/gerencia/kpis-completos/?${params.toString()}`);
    
    console.log('KPI Completos Response:', response.data); // Para debugging
    
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

  // Obtener gestión por ID
  getGestionById: async (gestionId) => {
    const response = await axiosInstance.get(`/facturacion-gestion/${gestionId}`);
    return response.data;
  },

  // Obtener gestión por código de factura
  getGestionByFactura: async (codigoFactura) => {
    const response = await axiosInstance.get(`/facturacion-gestion/factura/${codigoFactura}`);
    return response.data;
  },

  // Actualizar gestión
  updateGestion: async (gestionId, updateData) => {
    console.log(updateData);
    const response = await axiosInstance.put(`/facturacion-gestion/${gestionId}`, updateData);
    return response.data;
  },

  // Eliminar gestión
  deleteGestion: async (gestionId) => {
    const response = await axiosInstance.delete(`/facturacion-gestion/${gestionId}`);
    return response.data;
  },

  // Registrar pago parcial
  registrarPagoParcial: async (gestionId, montoPago, nroOperacion) => {
    const params = new URLSearchParams();
    params.append('monto_pago', montoPago);
    if (nroOperacion) params.append('nro_operacion', nroOperacion);
    
    const response = await axiosInstance.post(`/facturacion-gestion/${gestionId}/pago-parcial?${params.toString()}`);
    return response.data;
  },

  // Obtener estadísticas del dashboard
  getEstadisticasDashboard: async () => {
    const response = await axiosInstance.get('/facturacion-gestion/dashboard/estadisticas');
    return response.data;
  },

  // Obtener gestiones vencidas
  getGestionesVencidas: async () => {
    const response = await axiosInstance.get('/facturacion-gestion/alertas/vencidas');
    return response.data;
  },

  // Obtener gestiones por vencer
  getGestionesPorVencer: async (dias = 7) => {
    const response = await axiosInstance.get(`/facturacion-gestion/alertas/por-vencer?dias=${dias}`);
    return response.data;
  },

  // Cambiar prioridad de una gestión (MÉTODO ACTUALIZADO)
  cambiarPrioridad: async (gestionId, prioridad) => {
    const response = await axiosInstance.put(`/facturacion-gestion/${gestionId}`, { prioridad });
    return response.data;
  },

  // Exportar gestión específica a Excel (ENDOPOINT NO EXISTE EN ROUTER - REMOVIDO)
  // exportGestionExcel: async (gestionId) => {
  //   const response = await axiosInstance.get(
  //     `/facturacion-gestion/${gestionId}/export/excel`,
  //     { responseType: 'blob' }
  //   );
  //   return response.data;
  // },

  // Exportar todas las gestiones a Excel con filtros (ACTUALIZADO)
  exportAllGestionesExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    // Filtros para exportación según router
    if (filters.codigo_factura) params.append('codigo_factura', filters.codigo_factura);
    if (filters.numero_factura) params.append('numero_factura', filters.numero_factura);
    if (filters.estado_detraccion) params.append('estado_detraccion', filters.estado_detraccion);
    if (filters.estado_pago_neto) params.append('estado_pago_neto', filters.estado_pago_neto);
    if (filters.prioridad) params.append('prioridad', filters.prioridad);
    if (filters.centro_costo) params.append('centro_costo', filters.centro_costo);
    if (filters.responsable_gestion) params.append('responsable_gestion', filters.responsable_gestion);
    if (filters.fecha_probable_inicio) params.append('fecha_probable_inicio', filters.fecha_probable_inicio);
    if (filters.fecha_probable_fin) params.append('fecha_probable_fin', filters.fecha_probable_fin);
    if (filters.fecha_emision_inicio) params.append('fecha_emision_inicio', filters.fecha_emision_inicio);
    if (filters.fecha_emision_fin) params.append('fecha_emision_fin', filters.fecha_emision_fin);
    if (filters.nombre_cliente) params.append('nombre_cliente', filters.nombre_cliente);
    if (filters.nombre_proveedor) params.append('nombre_proveedor', filters.nombre_proveedor);
    if (filters.placa_flota) params.append('placa_flota', filters.placa_flota);
    if (filters.tipo_servicio) params.append('tipo_servicio', filters.tipo_servicio);
    if (filters.zona) params.append('zona', filters.zona);
    if (filters.search) params.append('search', filters.search);

    const response = await axiosInstance.get(
      `/facturacion-gestion/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Método alias para mantener consistencia con clienteAPI
  exportGestionesExcel: async (filters = {}) => {
    return facturacionGestionAPI.exportAllGestionesExcel(filters);
  },

  // Buscar gestiones por responsable (ACTUALIZADO)
  buscarPorResponsable: async (responsable, estado) => {
    const params = new URLSearchParams();
    if (estado) params.append('estado', estado);

    // Usando el endpoint de búsqueda avanzada
    const response = await axiosInstance.get(`/facturacion-gestion/busqueda/avanzada?responsable_gestion=${responsable}&${params.toString()}`);
    return response.data;
  },

  // Obtener gestiones por centro de costo (ACTUALIZADO)
  getGestionesPorCentroCosto: async (centroCosto, pagination = {}) => {
    const params = new URLSearchParams();
    params.append('centro_costo', centroCosto);
    params.append('page', pagination.page || 1);
    params.append('page_size', pagination.pageSize || 10);

    const response = await axiosInstance.get(`/facturacion-gestion/?${params.toString()}`);
    return response.data;
  },

  // Obtener resumen de pendientes
  getResumenPendientes: async () => {
    const response = await axiosInstance.get('/facturacion-gestion/resumen/pendientes');
    return response.data;
  },

  // Búsqueda avanzada (NUEVO MÉTODO)
  busquedaAvanzada: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    params.append('page', pagination.page || 1);
    params.append('page_size', pagination.pageSize || 10);

    // Filtros de búsqueda avanzada según router
    if (filters.cliente) params.append('cliente', filters.cliente);
    if (filters.proveedor) params.append('proveedor', filters.proveedor);
    if (filters.placa) params.append('placa', filters.placa);
    if (filters.conductor) params.append('conductor', filters.conductor);
    if (filters.zona) params.append('zona', filters.zona);
    if (filters.origen) params.append('origen', filters.origen);
    if (filters.destino) params.append('destino', filters.destino);
    if (filters.monto_min) params.append('monto_min', filters.monto_min);
    if (filters.monto_max) params.append('monto_max', filters.monto_max);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.prioridad) params.append('prioridad', filters.prioridad);
    if (filters.solo_pendientes !== undefined) params.append('solo_pendientes', filters.solo_pendientes);

    const response = await axiosInstance.get(`/facturacion-gestion/busqueda/avanzada?${params.toString()}`);
    
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

  // Análisis por cliente (NUEVO MÉTODO)
  getAnalisisPorCliente: async (cliente) => {
    const response = await axiosInstance.get(`/facturacion-gestion/analisis/por-cliente/${cliente}`);
    return response.data;
  },

  // Análisis por proveedor (NUEVO MÉTODO)
  getAnalisisPorProveedor: async (proveedor) => {
    const response = await axiosInstance.get(`/facturacion-gestion/analisis/por-proveedor/${proveedor}`);
    return response.data;
  },

  // Descargar Excel (método auxiliar)
  downloadExcel: (blob, filename = 'gestion_facturacion.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  // Alias para mantener consistencia
  getEstadisticas: async () => {
    return facturacionGestionAPI.getEstadisticasDashboard();
  },

  getAnalyticsAvanzadas: async (timeframe = 'month') => {
    const response = await axiosInstance.get(`/facturacion-gestion/dashboard/analytics/advanced?timeframe=${timeframe}`);
    return response.data;
  },

  // Alias para export
  exportToExcel: async (filters = {}) => {
    return facturacionGestionAPI.exportAllGestionesExcel(filters);
  }
};