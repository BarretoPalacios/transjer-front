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

export const getEstadoPagoColor = (estado) => {
  const colors = {
    Pendiente: "bg-red-100 text-red-800",
    Programado: "bg-yellow-100 text-yellow-800",
    "Pagado Parcial": "bg-blue-100 text-blue-800",
    Pagado: "bg-green-100 text-green-800",
    Vencido: "bg-red-100 text-red-800 font-bold",
    "En Disputa": "bg-purple-100 text-purple-800",
    Anulado: "bg-gray-100 text-gray-800",
  };
  return colors[estado] || "bg-gray-100 text-gray-800";
};

export const getEstadoDetraccionColor = (estado) => {
  const colors = {
    "No Aplica": "text-gray-500",
    Pendiente: "text-red-600 font-bold",
    Pagado: "text-green-600",
  };
  return colors[estado] || "text-gray-500";
};

export const getPrioridadColor = (prioridad) => {
  const colors = {
    Urgente: "bg-red-100 text-red-700",
    Alta: "bg-orange-100 text-orange-700",
    Media: "bg-yellow-100 text-yellow-700",
    Baja: "bg-green-100 text-green-700",
  };
  return colors[prioridad] || "bg-gray-100 text-gray-700";
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatearFecha = (fechaString) => {
  // Dividimos la cadena por el guion para evitar problemas de zona horaria
  const [year, month, day] = fechaString.split('-');
  
  // Retornamos el formato deseado
  return `${day}/${month}/${year}`;
}

const normalizarFecha = (fechaStr) => {
  const fecha = new Date(fechaStr);
  if (fechaStr.includes('-') && !fechaStr.includes('T')) {
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
  }
  fecha.setHours(0, 0, 0, 0);
  return fecha;
};

export const calcularDiasFaltantes = (fechaStr) => {
  if (!fechaStr) return "-";
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fecha = normalizarFecha(fechaStr);
  
  const diffTime = fecha.getTime() - hoy.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  return `En ${diffDays} días`;
};

export const getFechaStatusClass = (fechaStr) => {
  if (!fechaStr) return '';
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fecha = normalizarFecha(fechaStr);
  
  const diffDays = Math.round((fecha - hoy) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'text-red-600 font-bold';
  if (diffDays <= 3) return 'text-orange-600 font-bold';
  if (diffDays <= 7) return 'text-yellow-600';
  return 'text-green-600';
};

export const calcularMontoTotal = (gestion) => {
  const neto = parseFloat(gestion.monto_neto || 0);
  const detraccion = parseFloat(gestion.monto_detraccion || 0);
  return neto + detraccion;
};

export const aplicaDetraccion = (montoTotal) => {
  return montoTotal >= 400;
};  