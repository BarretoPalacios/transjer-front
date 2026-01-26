import axiosInstance from '../axiosConfig';

export const serviciosPrincipalesAPI = {
  // ========================================
  // CRUD BÁSICO
  // ========================================
  
  createServicioPrincipal: async (servicioData) => {
    const response = await axiosInstance.post('/servicios-principales/', servicioData);
    return response.data;
  },

  getServicioPrincipalById: async (servicioId) => {
    const response = await axiosInstance.get(`/servicios-principales/${servicioId}`);
    return response.data;
  },
  
  getServicioPrincipalByCodigo: async (codigoServicio) => {
    const response = await axiosInstance.get(`/servicios-principales/codigo/${codigoServicio}`);
    return response.data;
  },

  updateServicioPrincipal: async (servicioId, updateData) => {
    const response = await axiosInstance.put(`/servicios-principales/${servicioId}`, updateData);
    return response.data;
  },

  deleteServicioPrincipal: async (servicioId) => {
    const response = await axiosInstance.delete(`/servicios-principales/${servicioId}`);
    return response.data;
  },

  // ========================================
  // GESTIÓN DE ESTADOS
  // ========================================
  
  cambiarEstadoServicio: async (servicioId, cambioEstadoRequest) => {
    console.log("cambioEstadoRequest en API:",cambioEstadoRequest);
    const response = await axiosInstance.patch(
      `/servicios-principales/${servicioId}/cambiar-estado`,
      cambioEstadoRequest
    );
    return response.data;
  },

  obtenerHistorialServicio: async (servicioId) => {
    const response = await axiosInstance.get(`/servicios-principales/${servicioId}/historial`);
    return response.data;
  },

  verificarPermisosServicio: async (servicioId) => {
    const response = await axiosInstance.get(`/servicios-principales/${servicioId}/permisos`);
    return response.data;
  },

  // ========================================
  // CIERRE CONTABLE
  // ========================================
  
  cerrarServicio: async (servicioId, cierreServicioRequest) => {
    const response = await axiosInstance.post(
      `/servicios-principales/${servicioId}/cerrar`,
      cierreServicioRequest
    );
    return response.data;
  },

  // ========================================
  // LISTADO CON FILTROS AVANZADOS
  // ========================================
  
  getAllServiciosPrincipales: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.codigo_servicio_principal) params.append('codigo_servicio_principal', filters.codigo_servicio_principal);
    if (filters.mes) params.append('mes', filters.mes);
    if (filters.tipo_servicio) params.append('tipo_servicio', filters.tipo_servicio);
    if (filters.zona) params.append('zona', filters.zona);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.solicitud) params.append('solicitud', filters.solicitud);
    
    if (filters.periodo) params.append('periodo', filters.periodo);
    if (filters.fecha_servicio) params.append('fecha_servicio', filters.fecha_servicio);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    if (filters.servicio_cerrado !== undefined) params.append('servicio_cerrado', filters.servicio_cerrado);
    if (filters.periodo_cerrado) params.append('periodo_cerrado', filters.periodo_cerrado);
    if (filters.es_editable !== undefined) params.append('es_editable', filters.es_editable);
    if (filters.es_eliminable !== undefined) params.append('es_eliminable', filters.es_eliminable);
    
    if (filters.cliente_nombre) params.append('cliente_nombre', filters.cliente_nombre);
    if (filters.proveedor_nombre) params.append('proveedor_nombre', filters.proveedor_nombre);
    if (filters.cuenta_nombre) params.append('cuenta_nombre', filters.cuenta_nombre);
    if (filters.flota_placa) params.append('flota_placa', filters.flota_placa);
    if (filters.conductor_nombre) params.append('conductor_nombre', filters.conductor_nombre);
    
    if (filters.origen) params.append('origen', filters.origen);
    if (filters.destino) params.append('destino', filters.destino);
    if (filters.responsable) params.append('responsable', filters.responsable);
    if (filters.gia_rr) params.append('gia_rr', filters.gia_rr);
    if (filters.gia_rt) params.append('gia_rt', filters.gia_rt);
    if (filters.pertenece_a_factura == false) params.append('pertenece_a_factura', filters.pertenece_a_factura);

    console.log("filtros por enviar",filters)

    const response = await axiosInstance.get(`/servicios-principales/?${params.toString()}`);
    return response.data;
  },

  // ========================================
  // MÉTODOS DE CONVENIENCIA
  // ========================================
  
  getServiciosByPeriodo: async (periodo) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ periodo });
  },

  getServiciosHoy: async () => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ periodo: 'hoy' });
  },

  getServiciosSemana: async () => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ periodo: 'semana' });
  },

  getServiciosMes: async () => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ periodo: 'mes' });
  },

  getServiciosAnio: async () => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ periodo: 'año' });
  },

  getServiciosByMes: async (mes) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ mes });
  },

  getServiciosByTipo: async (tipoServicio) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ tipo_servicio: tipoServicio });
  },

  getServiciosByZona: async (zona) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ zona });
  },

  getServiciosByEstado: async (estado) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ estado });
  },

  getServiciosByFecha: async (fecha) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ fecha_servicio: fecha });
  },

  getServiciosByRangoFechas: async (fechaInicio, fechaFin) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ 
      fecha_inicio: fechaInicio, 
      fecha_fin: fechaFin 
    });
  },

  getServiciosByClienteNombre: async (clienteNombre) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ cliente_nombre: clienteNombre });
  },

  getServiciosByProveedorNombre: async (proveedorNombre) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ proveedor_nombre: proveedorNombre });
  },

  getServiciosByVehiculoPlaca: async (placa) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ vehiculo_placa: placa });
  },

  getServiciosByConductorNombre: async (conductorNombre) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ conductor_nombre: conductorNombre });
  },

  getServiciosByCuentaNombre: async (cuentaNombre) => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ cuenta_nombre: cuentaNombre });
  },

  getServiciosEditables: async () => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ es_editable: true });
  },

  getServiciosNoEditables: async () => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ es_editable: false });
  },

  getServiciosCerrados: async () => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ servicio_cerrado: true });
  },

  getServiciosNoCerrados: async () => {
    return serviciosPrincipalesAPI.getAllServiciosPrincipales({ servicio_cerrado: false });
  },

  // ========================================
  // IMPORTAR / EXPORTAR
  // ========================================
  
  exportServiciosExcel: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.mes) params.append('mes', filters.mes);
    if (filters.tipo_servicio) params.append('tipo_servicio', filters.tipo_servicio);
    if (filters.zona) params.append('zona', filters.zona);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.solicitud) params.append('solicitud', filters.solicitud);
    
    if (filters.periodo) params.append('periodo', filters.periodo);
    if (filters.fecha_servicio) params.append('fecha_servicio', filters.fecha_servicio);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    if (filters.servicio_cerrado !== undefined) params.append('servicio_cerrado', filters.servicio_cerrado);
    if (filters.periodo_cerrado) params.append('periodo_cerrado', filters.periodo_cerrado);
    
    if (filters.cliente_nombre) params.append('cliente_nombre', filters.cliente_nombre);
    if (filters.proveedor_nombre) params.append('proveedor_nombre', filters.proveedor_nombre);
    if (filters.cuenta_nombre) params.append('cuenta_nombre', filters.cuenta_nombre);
    if (filters.vehiculo_placa) params.append('vehiculo_placa', filters.vehiculo_placa);
    if (filters.conductor_nombre) params.append('conductor_nombre', filters.conductor_nombre);
    
    if (filters.origen) params.append('origen', filters.origen);
    if (filters.destino) params.append('destino', filters.destino);
    if (filters.responsable) params.append('responsable', filters.responsable);
    if (filters.gia_rr) params.append('gia_rr', filters.gia_rr);
    if (filters.gia_rt) params.append('gia_rt', filters.gia_rt);
    
    const response = await axiosInstance.get(
      `/servicios-principales/export/excel?${params.toString()}`, 
      { responseType: 'blob' }
    );
    return response.data;
  },

  importServiciosExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(
      '/servicios-principales/import/excel', 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // ========================================
  // ESTADÍSTICAS
  // ========================================
  
  getEstadisticas: async () => {
    const response = await axiosInstance.get('/servicios-principales/stats/estadisticas');
    return response.data;
  },

  // ========================================
  // UTILIDADES
  // ========================================
  
  downloadExcel: (blob, filename = 'servicios_principales.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadCSV: (csvData, filename = 'servicios_principales.csv') => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  formatDateForParams: (dateObj) => {
    if (!dateObj) return null;
    
    if (typeof dateObj === 'string') return dateObj;
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  isValidPeriodo: (periodo) => {
    return ['hoy', 'semana', 'mes', 'año'].includes(periodo);
  },

  isValidZona: (zona) => {
    return ['Lima', 'Provincia', 'Extranjero'].includes(zona);
  },

  isValidEstado: (estado) => {
    return ['Programado', 'Completado', 'Cancelado', 'Reprogramado'].includes(estado);
  },

  // ========================================
  // CONSTANTES Y ENUMS
  // ========================================
  
  EstadoServicio: {
    PROGRAMADO: 'Programado',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado',
    REPROGRAMADO: 'Reprogramado'
  },

  ZonaServicio: {
    LIMA: 'Lima',
    PROVINCIA: 'Provincia',
    EXTRANJERO: 'Extranjero'
  },

  PeriodoFiltro: {
    HOY: 'hoy',
    SEMANA: 'semana',
    MES: 'mes',
    AÑO: 'año'
  },

  // ========================================
  // FACTORY METHODS PARA REQUEST OBJECTS
  // ========================================
  
  createCambioEstadoRequest: (nuevoEstado, justificacion, usuario) => {
    return {
      nuevo_estado: nuevoEstado,
      justificacion: justificacion,
      usuario: usuario
    };
  },

  createCierreServicioRequest: (periodo, usuario) => {
    return {
      periodo: periodo,
      usuario: usuario
    };
  },

  // ========================================
  // VALIDACIONES ESPECÍFICAS
  // ========================================
  
  validarCambioEstado: (estadoActual, nuevoEstado) => {
    const transicionesPermitidas = {
      'Programado': ['Completado', 'Cancelado', 'Reprogramado'],
      'Reprogramado': ['Completado', 'Cancelado'],
      'Cancelado': [],
      'Completado': []
    };
    
    return transicionesPermitidas[estadoActual]?.includes(nuevoEstado) || false;
  },

  validarJustificacion: (justificacion, nuevoEstado) => {
    if (!justificacion || justificacion.trim() === '') {
      return 'La justificación es requerida';
    }
    
    if (justificacion.trim().length < 10) {
      return 'La justificación debe tener al menos 10 caracteres';
    }
    
    return null;
  },

  // ========================================
  // HELPERS PARA PERMISOS
  // ========================================
  
  puedeEditarServicio: (servicio) => {
    return servicio?.es_editable === true;
  },

  puedeEliminarServicio: (servicio) => {
    return servicio?.es_eliminable === true;
  },

  puedeCambiarEstado: (servicio) => {
    return servicio?.estado !== 'Completado' && !servicio?.servicio_cerrado;
  },

  estaCerrado: (servicio) => {
    return servicio?.servicio_cerrado === true;
  },

  // ========================================
  // FORMATTERS PARA UI
  // ========================================
  
  formatEstadoBadge: (estado) => {
    const badges = {
      'Programado': 'info',
      'Completado': 'success',
      'Cancelado': 'danger',
      'Reprogramado': 'warning'
    };
    return badges[estado] || 'secondary';
  },

  formatEditableBadge: (esEditable) => {
    return esEditable ? 
      { text: 'Editable', variant: 'success' } : 
      { text: 'No editable', variant: 'danger' };
  },

  formatCerradoBadge: (servicioCerrado) => {
    return servicioCerrado ? 
      { text: 'Cerrado', variant: 'secondary' } : 
      { text: 'Abierto', variant: 'primary' };
  }
};

export default serviciosPrincipalesAPI;