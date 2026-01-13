// src/utils/facturasUtils.js

// Formatear moneda
export const formatCurrency = (amount, currency = 'PEN') => {
  if (!amount && amount !== 0) return 'N/A';
  
  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  
  return formatter.format(parseFloat(amount));
};

// Formatear fecha (corregido problema de zona horaria)
export const formatDate = (dateString, format = 'date') => {
  if (!dateString) return 'N/A';
  
  try {
    // Manejar diferentes tipos de entrada de fecha
    let date;
    
    if (dateString.includes('T')) {
      // Si ya tiene formato ISO con hora
      date = new Date(dateString);
    } else {
      // Si solo tiene fecha YYYY-MM-DD, agregamos tiempo para evitar problemas de zona horaria
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // Mes es 0-indexed
    }
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    if (format === 'time') {
      return date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    if (format === 'datetime') {
      return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    // Formato por defecto: solo fecha
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

// Formatear fecha completa (alias para mantener compatibilidad)
export const formatDateTime = (dateString) => {
  return formatDate(dateString, 'datetime');
};

// Obtener color según estado de factura
export const getEstadoColor = (estado) => {
  const colores = {
    'Pendiente': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'Pagada': 'bg-green-100 text-green-800 border border-green-200',
    'Vencida': 'bg-red-100 text-red-800 border border-red-200',
    'Anulada': 'bg-gray-100 text-gray-800 border border-gray-200',
    'Parcial': 'bg-blue-100 text-blue-800 border border-blue-200',
  };
  
  return colores[estado] || 'bg-gray-100 text-gray-800 border border-gray-200';
};

// Obtener color según moneda
export const getMonedaColor = (moneda) => {
  const colores = {
    'PEN': 'bg-blue-100 text-blue-800',
    'USD': 'bg-green-100 text-green-800',
    'EUR': 'bg-purple-100 text-purple-800',
  };
  
  return colores[moneda] || 'bg-gray-100 text-gray-800';
};

// Obtener color según método de pago
export const getMetodoPagoColor = (metodo) => {
  const colores = {
    'Transferencia': 'bg-blue-100 text-blue-800',
    'Depósito': 'bg-green-100 text-green-800',
    'Efectivo': 'bg-yellow-100 text-yellow-800',
    'Tarjeta': 'bg-purple-100 text-purple-800',
    'Cheque': 'bg-indigo-100 text-indigo-800',
    'Yape': 'bg-pink-100 text-pink-800',
    'Plin': 'bg-teal-100 text-teal-800',
  };
  
  return colores[metodo] || 'bg-gray-100 text-gray-800';
};

// Función auxiliar para crear fechas consistentes (corregida)
const createLocalDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    if (dateString.includes('T')) {
      // Formato ISO con tiempo
      return new Date(dateString);
    } else {
      // Formato YYYY-MM-DD sin tiempo
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Crear fecha en zona horaria local
      // Mes es 0-indexed, así que restamos 1
      return new Date(year, month - 1, day);
    }
  } catch (error) {
    console.error('Error creando fecha:', error);
    return null;
  }
};

// Calcular días hasta el vencimiento (corregido)
export const calcularDiasVencimiento = (fechaVencimiento) => {
  if (!fechaVencimiento) return null;
  
  try {
    const fechaVenc = createLocalDate(fechaVencimiento);
    if (!fechaVenc || isNaN(fechaVenc.getTime())) return null;
    
    // Fecha actual en zona horaria local
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Normalizar la fecha de vencimiento también
    const vencimiento = new Date(fechaVenc);
    vencimiento.setHours(0, 0, 0, 0);
    
    // Calcular diferencia en días
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Error calculando días de vencimiento:', error);
    return null;
  }
};

// Obtener color según días de vencimiento
export const getDiasVencimientoColor = (dias) => {
  if (dias === null || dias === undefined) return 'bg-gray-100 text-gray-800';
  
  if (dias < 0) return 'bg-red-100 text-red-800'; // Ya vencido
  if (dias === 0) return 'bg-orange-100 text-orange-800'; // Vence hoy
  if (dias <= 3) return 'bg-yellow-100 text-yellow-800'; // Por vencer (1-3 días)
  return 'bg-green-100 text-green-800'; // Aún tiene tiempo
};

// Extraer información útil del servicio (actualizada)
export const extraerInfoServicio = (servicio) => {
  if (!servicio) return {
    cliente: 'N/A',
    tipoServicio: 'N/A',
    zona: 'N/A',
    fechaServicio: 'N/A',
    origen: 'N/A',
    destino: 'N/A',
    vehiculo: 'N/A',
    conductor: 'N/A',
    codigo: servicio?.codigo_servicio_principal || 'N/A',
    mes: servicio?.mes || 'N/A',
  };
  
  // Manejar diferentes estructuras de cliente
  let clienteNombre = 'N/A';
  if (servicio.cliente) {
    if (typeof servicio.cliente === 'string') {
      clienteNombre = servicio.cliente;
    } else if (servicio.cliente.nombre) {
      clienteNombre = servicio.cliente.nombre;
    } else if (servicio.cliente.razon_social) {
      clienteNombre = servicio.cliente.razon_social;
    } else if (servicio.cliente.nombre_comercial) {
      clienteNombre = servicio.cliente.nombre_comercial;
    }
  }
  
  // Manejar conductor (puede ser array o objeto)
  let conductorNombre = 'N/A';
  if (servicio.conductor) {
    if (Array.isArray(servicio.conductor) && servicio.conductor.length > 0) {
      conductorNombre = servicio.conductor
        .map(c => c.nombres_completos || c.nombre || `${c.nombres || ''} ${c.apellidos || ''}`.trim())
        .filter(Boolean)
        .join(', ');
    } else if (servicio.conductor.nombres_completos) {
      conductorNombre = servicio.conductor.nombres_completos;
    } else if (servicio.conductor.nombres) {
      conductorNombre = `${servicio.conductor.nombres || ''} ${servicio.conductor.apellidos || ''}`.trim();
    }
  }
  
  // Manejar vehículo/flota
  let vehiculoInfo = 'N/A';
  if (servicio.flota) {
    vehiculoInfo = servicio.flota.placa ? 
      `${servicio.flota.placa} - ${servicio.flota.marca} ${servicio.flota.modelo || ''}`.trim() :
      servicio.flota;
  } else if (servicio.vehiculo) {
    vehiculoInfo = servicio.vehiculo.placa ? 
      `${servicio.vehiculo.placa} - ${servicio.vehiculo.marca} ${servicio.vehiculo.modelo || ''}`.trim() :
      servicio.vehiculo;
  }
  
  return {
    cliente: clienteNombre,
    tipoServicio: servicio.tipo_servicio || 'N/A',
    zona: servicio.zona || 'N/A',
    fechaServicio: formatDate(servicio.fecha_servicio),
    origen: servicio.origen || 'N/A',
    destino: servicio.destino || 'N/A',
    vehiculo: vehiculoInfo,
    conductor: conductorNombre,
    codigo: servicio.codigo_servicio_principal || 'N/A',
    mes: servicio.mes || 'N/A',
    m3: servicio.m3 || servicio.m3_tn || 'N/A',
    tn: servicio.tn || 'N/A',
    proveedor: servicio.proveedor?.nombre || servicio.proveedor?.razon_social || 'N/A',
    modalidad: servicio.modalidad_servicio || 'N/A',
  };
};

// Calcular antigüedad de la factura (corregido)
export const calcularAntiguedadFactura = (fechaRegistro) => {
  if (!fechaRegistro) return 'N/A';
  
  try {
    const registro = createLocalDate(fechaRegistro);
    if (!registro || isNaN(registro.getTime())) return 'N/A';
    
    const hoy = new Date();
    
    // Calcular diferencia en días (redondeando hacia abajo)
    const diffTime = hoy.getTime() - registro.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes < 1 ? 'Recién' : `Hace ${diffMinutes} minutos`;
      }
      return `Hoy (${diffHours} horas)`;
    }
    
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) {
      const semanas = Math.floor(diffDays / 7);
      return semanas === 1 ? 'Hace 1 semana' : `Hace ${semanas} semanas`;
    }
    
    if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
    }
    
    const años = Math.floor(diffDays / 365);
    return años === 1 ? 'Hace 1 año' : `Hace ${años} años`;
  } catch (error) {
    console.error('Error calculando antigüedad:', error);
    return 'N/A';
  }
};

// Opciones para filtros
export const filterOptions = {
  estados: [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Pagada', label: 'Pagada' },
    { value: 'Vencida', label: 'Vencida' },
    { value: 'Anulada', label: 'Anulada' },
    { value: 'Parcial', label: 'Parcial' },
  ],
  
  monedas: [
    { value: 'todos', label: 'Todas las monedas' },
    { value: 'PEN', label: 'Soles (PEN)' },
    { value: 'USD', label: 'Dólares (USD)' },
    { value: 'EUR', label: 'Euros (EUR)' },
  ],
  
  periodos: [
    { value: '', label: 'Todos los períodos' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mes' },
    { value: 'año', label: 'Este año' },
  ],
  
  meses: [
    { value: '', label: 'Todos los meses' },
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ],
};

// Calcular estadísticas de facturas
export const calcularEstadisticasFacturas = (facturas) => {
  if (!facturas || facturas.length === 0) {
    return {
      total: 0,
      pendientes: 0,
      pagadas: 0,
      vencidas: 0,
      totalMonto: 0,
      montoPendiente: 0,
      montoPagado: 0,
      promedioMonto: 0,
    };
  }
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  // Calcular vencidas correctamente
  const pendientes = facturas.filter(f => f.estado === 'Pendiente');
  const pagadas = facturas.filter(f => f.estado === 'Pagada');
  
  // Las vencidas son las pendientes cuya fecha de vencimiento ya pasó
  const vencidas = pendientes.filter(f => {
    if (!f.fecha_vencimiento) return false;
    
    const fechaVenc = createLocalDate(f.fecha_vencimiento);
    if (!fechaVenc || isNaN(fechaVenc.getTime())) return false;
    
    const vencimiento = new Date(fechaVenc);
    vencimiento.setHours(0, 0, 0, 0);
    
    return vencimiento < hoy;
  });
  
  const totalMonto = facturas.reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
  const montoPendiente = pendientes.reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
  const montoPagado = pagadas.reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
  
  return {
    total: facturas.length,
    pendientes: pendientes.length,
    pagadas: pagadas.length,
    vencidas: vencidas.length,
    totalMonto,
    montoPendiente,
    montoPagado,
    promedioMonto: facturas.length > 0 ? totalMonto / facturas.length : 0,
  };
};

// Nueva función: formatear fecha ISO para inputs de tipo date
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = createLocalDate(dateString);
    if (!date || isNaN(date.getTime())) return '';
    
    // Formato YYYY-MM-DD para inputs de tipo date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formateando fecha para input:', error);
    return '';
  }
};