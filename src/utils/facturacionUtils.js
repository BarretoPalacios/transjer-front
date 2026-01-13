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