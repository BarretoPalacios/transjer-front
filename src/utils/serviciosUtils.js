// serviciosUtils.js

// Formato de fecha
export const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

// Formato de fecha completa con hora
export const formatFechaCompleta = (fecha) => {
  if (!fecha) return 'Sin fecha';
  
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formateando fecha completa:', error);
    return 'Fecha inválida';
  }
};

// Formato de precio
export const formatPrecio = (precio) => {
  if (precio === null || precio === undefined || isNaN(precio)) {
    return '0.00';
  }
  
  return precio.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Formato de tiempo estimado
export const formatTiempoEstimado = (minutos) => {
  if (!minutos || minutos === 0) return 'Sin tiempo estimado';
  
  if (minutos < 60) {
    return `${minutos} min`;
  }
  
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  
  if (minutosRestantes === 0) {
    return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  }
  
  return `${horas}h ${minutosRestantes}min`;
};

// Colores para estado de servicio
export const getEstadoServicioColor = (estado) => {
  if (!estado) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  switch(estado.toLowerCase()) {
    case 'activo':
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactivo':
    case 'inactive':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pendiente':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Texto legible para estado
export const getEstadoServicioTexto = (estado) => {
  if (!estado) return 'Desconocido';
  
  switch(estado.toLowerCase()) {
    case 'activo':
    case 'active':
      return 'Activo';
    case 'inactivo':
    case 'inactive':
      return 'Inactivo';
    case 'pendiente':
    case 'pending':
      return 'Pendiente';
    default:
      return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  }
};

// Colores para tipo de servicio
export const getTipoServicioColor = (tipo) => {
  if (!tipo) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  const tipoLower = tipo.toLowerCase();
  
  switch(tipoLower) {
    case 'local':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'nacional':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'cuadrilla':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'transporte':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'alquiler':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'otros':
    case 'other':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'carga':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'descarga':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Colores para modalidad de servicio (NUEVA FUNCIÓN)
export const getModalidadServicioColor = (modalidad) => {
  if (!modalidad) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  const modalidadLower = modalidad.toLowerCase();
  
  switch(modalidadLower) {
    case 'carga':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'descarga':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'carga y descarga':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'ida y vuelta':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'solo ida':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'por hora':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'por día':
    case 'por dia':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'mixto':
      return 'bg-violet-100 text-violet-800 border-violet-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Texto legible para modalidad
export const getModalidadServicioTexto = (modalidad) => {
  if (!modalidad) return 'No especificada';
  
  const modalidadLower = modalidad.toLowerCase();
  
  switch(modalidadLower) {
    case 'carga':
      return 'Carga';
    case 'descarga':
      return 'Descarga';
    case 'carga y descarga':
      return 'Carga y Descarga';
    case 'ida y vuelta':
      return 'Ida y Vuelta';
    case 'solo ida':
      return 'Solo Ida';
    case 'por hora':
      return 'Por Hora';
    case 'por día':
    case 'por dia':
      return 'Por Día';
    case 'mixto':
      return 'Mixto';
    default:
      return modalidad.charAt(0).toUpperCase() + modalidad.slice(1).toLowerCase();
  }
};

// Colores para unidad de medida
export const getUnidadMedidaColor = (unidad) => {
  if (!unidad) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  const unidadLower = unidad.toLowerCase();
  
  switch(unidadLower) {
    case 'm³':
    case 'm3':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'tonelada':
    case 'ton':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'viaje':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'hora':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'día':
    case 'dia':
    case 'días':
    case 'dias':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Generar código de servicio automático
export const generarCodigoServicio = (tipoServicio, contador) => {
  const prefijos = {
    'local': 'LOC',
    'nacional': 'NAC',
    'cuadrilla': 'CUA',
    'transporte': 'TRA',
    'alquiler': 'ALQ',
    'otros': 'OTR',
    'carga': 'CAR'
  };
  
  const tipo = tipoServicio.toLowerCase();
  const prefijo = prefijos[tipo] || 'SERV';
  const numero = contador.toString().padStart(3, '0');
  
  return `${prefijo}-${numero}`;
};

// Validar datos de servicio
export const validarServicio = (servicio) => {
  const errors = {};
  
  if (!servicio.nombre || servicio.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  }
  
  if (!servicio.tipo_servicio) {
    errors.tipo_servicio = 'El tipo de servicio es requerido';
  }
  
  // Nueva validación para modalidad_servicio
  if (!servicio.modalidad_servicio) {
    errors.modalidad_servicio = 'La modalidad de servicio es requerida';
  }
  
  if (!servicio.unidad_medida) {
    errors.unidad_medida = 'La unidad de medida es requerida';
  }
  
  if (servicio.precio_base === undefined || servicio.precio_base === null) {
    errors.precio_base = 'El precio base es requerido';
  } else if (isNaN(servicio.precio_base) || servicio.precio_base < 0) {
    errors.precio_base = 'El precio base debe ser un número válido mayor o igual a 0';
  }
  
  if (servicio.tiempo_estimado !== undefined && servicio.tiempo_estimado !== null) {
    if (isNaN(servicio.tiempo_estimado) || servicio.tiempo_estimado < 0) {
      errors.tiempo_estimado = 'El tiempo estimado debe ser un número válido mayor o igual a 0';
    }
  }
  
  if (servicio.descripcion && servicio.descripcion.length > 500) {
    errors.descripcion = 'La descripción no debe exceder 500 caracteres';
  }
  
  if (servicio.condiciones && servicio.condiciones.length > 500) {
    errors.condiciones = 'Las condiciones no deben exceder 500 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Calcular precio con impuestos
export const calcularPrecioConImpuestos = (precioBase, tasaImpuesto = 0.18) => {
  const precio = parseFloat(precioBase) || 0;
  const impuesto = precio * tasaImpuesto;
  const total = precio + impuesto;
  
  return {
    base: precio,
    impuesto: impuesto,
    total: total,
    impuestoFormateado: formatPrecio(impuesto),
    totalFormateado: formatPrecio(total)
  };
};

// Agrupar servicios por tipo
export const agruparServiciosPorTipo = (servicios) => {
  return servicios.reduce((grupos, servicio) => {
    const tipo = servicio.tipo_servicio || 'Sin tipo';
    if (!grupos[tipo]) {
      grupos[tipo] = [];
    }
    grupos[tipo].push(servicio);
    return grupos;
  }, {});
};

// Nueva función: Agrupar servicios por modalidad
export const agruparServiciosPorModalidad = (servicios) => {
  return servicios.reduce((grupos, servicio) => {
    const modalidad = servicio.modalidad_servicio || 'Sin modalidad';
    if (!grupos[modalidad]) {
      grupos[modalidad] = [];
    }
    grupos[modalidad].push(servicio);
    return grupos;
  }, {});
};

// Calcular estadísticas de servicios
export const calcularEstadisticasServicios = (servicios) => {
  if (!servicios || servicios.length === 0) {
    return {
      total: 0,
      activos: 0,
      inactivos: 0,
      porTipo: {},
      porModalidad: {},
      promedioPrecio: 0,
      precioMasAlto: 0,
      precioMasBajo: 0,
      tiempoPromedio: 0
    };
  }
  
  const activos = servicios.filter(s => s.estado === 'activo').length;
  const inactivos = servicios.filter(s => s.estado === 'inactivo').length;
  
  // Distribución por tipo
  const porTipo = servicios.reduce((acc, servicio) => {
    const tipo = servicio.tipo_servicio || 'Sin tipo';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});
  
  // Nueva: Distribución por modalidad
  const porModalidad = servicios.reduce((acc, servicio) => {
    const modalidad = servicio.modalidad_servicio || 'Sin modalidad';
    acc[modalidad] = (acc[modalidad] || 0) + 1;
    return acc;
  }, {});
  
  // Estadísticas de precios
  const precios = servicios.map(s => parseFloat(s.precio_base)).filter(p => !isNaN(p));
  const promedioPrecio = precios.length > 0
    ? precios.reduce((sum, precio) => sum + precio, 0) / precios.length
    : 0;
  
  const precioMasAlto = precios.length > 0 ? Math.max(...precios) : 0;
  const precioMasBajo = precios.length > 0 ? Math.min(...precios) : 0;
  
  // Estadísticas de tiempo
  const tiempos = servicios.map(s => parseInt(s.tiempo_estimado || 0)).filter(t => !isNaN(t));
  const tiempoPromedio = tiempos.length > 0
    ? tiempos.reduce((sum, tiempo) => sum + tiempo, 0) / tiempos.length
    : 0;
  
  return {
    total: servicios.length,
    activos,
    inactivos,
    porTipo,
    porModalidad, // Incluir en estadísticas
    promedioPrecio: parseFloat(promedioPrecio.toFixed(2)),
    precioMasAlto: parseFloat(precioMasAlto.toFixed(2)),
    precioMasBajo: parseFloat(precioMasBajo.toFixed(2)),
    tiempoPromedio: parseFloat(tiempoPromedio.toFixed(0))
  };
};

// Ordenar servicios
export const ordenarServicios = (servicios, criterio = 'nombre', direccion = 'asc') => {
  const serviciosCopiados = [...servicios];
  
  return serviciosCopiados.sort((a, b) => {
    let valorA, valorB;
    
    switch(criterio) {
      case 'nombre':
        valorA = a.nombre?.toLowerCase() || '';
        valorB = b.nombre?.toLowerCase() || '';
        break;
      case 'codigo':
        valorA = a.codigo_servicio?.toLowerCase() || '';
        valorB = b.codigo_servicio?.toLowerCase() || '';
        break;
      case 'tipo':
        valorA = a.tipo_servicio?.toLowerCase() || '';
        valorB = b.tipo_servicio?.toLowerCase() || '';
        break;
      case 'modalidad': // Nuevo criterio de ordenación
        valorA = a.modalidad_servicio?.toLowerCase() || '';
        valorB = b.modalidad_servicio?.toLowerCase() || '';
        break;
      case 'precio':
        valorA = parseFloat(a.precio_base) || 0;
        valorB = parseFloat(b.precio_base) || 0;
        break;
      case 'estado':
        valorA = a.estado?.toLowerCase() || '';
        valorB = b.estado?.toLowerCase() || '';
        break;
      case 'fecha':
        valorA = new Date(a.fecha_registro || 0).getTime();
        valorB = new Date(b.fecha_registro || 0).getTime();
        break;
      default:
        valorA = a.nombre?.toLowerCase() || '';
        valorB = b.nombre?.toLowerCase() || '';
    }
    
    if (direccion === 'asc') {
      return valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
    } else {
      return valorA > valorB ? -1 : valorA < valorB ? 1 : 0;
    }
  });
};

// Filtrar servicios
export const filtrarServicios = (servicios, filtros) => {
  return servicios.filter(servicio => {
    // Filtro por tipo de servicio
    if (filtros.tipo_servicio && filtros.tipo_servicio !== 'todos') {
      if (servicio.tipo_servicio !== filtros.tipo_servicio) return false;
    }
    
    // Nuevo filtro por modalidad de servicio
    if (filtros.modalidad_servicio && filtros.modalidad_servicio !== 'todos') {
      if (servicio.modalidad_servicio !== filtros.modalidad_servicio) return false;
    }
    
    // Filtro por unidad de medida
    if (filtros.unidad_medida && filtros.unidad_medida !== 'todos') {
      if (servicio.unidad_medida !== filtros.unidad_medida) return false;
    }
    
    // Filtro por estado
    if (filtros.estado && filtros.estado !== 'todos') {
      if (servicio.estado !== filtros.estado) return false;
    }
    
    // Filtro por rango de precio
    if (filtros.precio_min !== undefined && filtros.precio_min !== '') {
      if (parseFloat(servicio.precio_base) < parseFloat(filtros.precio_min)) return false;
    }
    
    if (filtros.precio_max !== undefined && filtros.precio_max !== '') {
      if (parseFloat(servicio.precio_base) > parseFloat(filtros.precio_max)) return false;
    }
    
    // Filtro por tiempo estimado
    if (filtros.tiempo_min !== undefined && filtros.tiempo_min !== '') {
      if ((servicio.tiempo_estimado || 0) < parseInt(filtros.tiempo_min)) return false;
    }
    
    if (filtros.tiempo_max !== undefined && filtros.tiempo_max !== '') {
      if ((servicio.tiempo_estimado || 0) > parseInt(filtros.tiempo_max)) return false;
    }
    
    return true;
  });
};

// Obtener servicio por ID
export const obtenerServicioPorId = (servicios, id) => {
  return servicios.find(
    servicio => servicio._id === id || servicio.id === id
  );
};

// Formatear datos para exportación CSV/Excel
export const formatearDatosParaExportacion = (servicios) => {
  return servicios.map(servicio => ({
    'Código': servicio.codigo_servicio || '',
    'Nombre': servicio.nombre || '',
    'Descripción': servicio.descripcion || '',
    'Tipo de Servicio': servicio.tipo_servicio || '',
    'Modalidad de Servicio': servicio.modalidad_servicio || '', // Nuevo campo
    'Unidad de Medida': servicio.unidad_medida || '',
    'Precio Base': formatPrecio(servicio.precio_base),
    'Tiempo Estimado (min)': servicio.tiempo_estimado || 0,
    'Estado': getEstadoServicioTexto(servicio.estado),
    'Condiciones': servicio.condiciones || '',
    'Fecha de Registro': formatFechaCompleta(servicio.fecha_registro)
  }));
};

export default {
  formatFecha,
  formatFechaCompleta,
  formatPrecio,
  formatTiempoEstimado,
  getEstadoServicioColor,
  getEstadoServicioTexto,
  getTipoServicioColor,
  getModalidadServicioColor,
  getModalidadServicioTexto,
  getUnidadMedidaColor,
  generarCodigoServicio,
  validarServicio,
  calcularPrecioConImpuestos,
  agruparServiciosPorTipo,
  agruparServiciosPorModalidad,
  calcularEstadisticasServicios,
  ordenarServicios,
  filtrarServicios,
  obtenerServicioPorId,
  formatearDatosParaExportacion
};