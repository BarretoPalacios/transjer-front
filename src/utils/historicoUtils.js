// utils/historicoUtils.js

// Función para obtener color según el tipo de histórico
export const getTipoColor = (tipo) => {
  switch (tipo?.toLowerCase()) {
    case 'completado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Función para obtener color según estado final
export const getEstadoFinalColor = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'finalizado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelado':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'en_proceso':
    case 'en proceso':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Función para formatear fecha
export const formatFecha = (fechaString, format = 'short') => {
  if (!fechaString) return '-';
  
  const fecha = new Date(fechaString);
  
  if (format === 'time') {
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  if (format === 'datetime') {
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Formato short por defecto
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Función para calcular tiempo transcurrido
export const calcularTiempoTranscurrido = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return '-';
  
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffMs = fin - inicio;
  
  // Convertir a días, horas, minutos
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '<1m';
  }
};

// Función para extraer periodo en formato legible
export const formatPeriodo = (periodo) => {
  if (!periodo) return '-';
  
  const [year, month] = periodo.split('-');
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

// Función para calcular estadísticas locales
export const calcularEstadisticasHistoricos = (historicos) => {
  const total = historicos.length;
  const completados = historicos.filter(h => h.tipo?.toLowerCase() === 'completado').length;
  const cancelados = historicos.filter(h => h.tipo?.toLowerCase() === 'cancelado').length;
  
  return {
    total,
    completados,
    cancelados,
    porcentajeCompletados: total > 0 ? (completados / total * 100).toFixed(1) : 0,
    porcentajeCancelados: total > 0 ? (cancelados / total * 100).toFixed(1) : 0
  };
};

// Función para validar periodo (YYYY-MM)
export const isValidPeriodo = (periodo) => {
  const pattern = /^\d{4}-\d{2}$/;
  if (!pattern.test(periodo)) return false;
  
  const [year, month] = periodo.split('-').map(Number);
  return year >= 2000 && year <= 2100 && month >= 1 && month <= 12;
};

// Función para manejar errores de API
export const handleAPIError = (error, defaultMessage = 'Error en la operación') => {
  const message = error.response?.data?.detail || error.response?.data?.message || error.message;
  console.error(defaultMessage + ':', error);
  return message || defaultMessage;
};