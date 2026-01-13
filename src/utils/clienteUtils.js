// En utils/clienteUtils.js
export const getEstadoColor = (estado) => {
  const colors = {
    activo: "bg-green-100 text-green-800 border-green-200",
    inactivo: "bg-red-100 text-red-800 border-red-200",
    pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
    suspendido: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[estado] || colors.inactivo;
};

export const getTipoClienteColor = (tipo) => {
  const colors = {
    Corporativo: "bg-blue-100 text-blue-800 border-blue-200",
    PYME: "bg-purple-100 text-purple-800 border-purple-200",
    Individual: "bg-green-100 text-green-800 border-green-200",
    Gobierno: "bg-red-100 text-red-800 border-red-200",
    Educacion: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return colors[tipo] || "bg-gray-100 text-gray-800 border-gray-200";
};

// Nuevas funciones para los campos de pago
export const getTipoPagoColor = (tipoPago) => {
  const colors = {
    Contado: "bg-green-100 text-green-800 border-green-200",
    Crédito: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return colors[tipoPago] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const getDiasCreditoColor = (dias) => {
  if (dias === 0) return "bg-gray-100 text-gray-800 border-gray-200";
  if (dias <= 15) return "bg-green-100 text-green-800 border-green-200";
  if (dias <= 30) return "bg-blue-100 text-blue-800 border-blue-200";
  if (dias <= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
};

export const calcularAntiguedad = (fechaRegistro) => {
  const fecha = new Date(fechaRegistro);
  const ahora = new Date();
  const diffMs = ahora - fecha;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDias < 30) return `${diffDias} días`;
  if (diffDias < 365) return `${Math.floor(diffDias / 30)} meses`;
  return `${Math.floor(diffDias / 365)} años`;
};

// Función para calcular estadísticas de pago
export const calcularEstadisticasPago = (clientes) => {
  const totalContado = clientes.filter(c => c.tipo_pago === 'Contado').length;
  const totalCredito = clientes.filter(c => c.tipo_pago === 'Crédito').length;
  
  // Promedio de días de crédito (solo para clientes con crédito)
  const clientesCredito = clientes.filter(c => c.tipo_pago === 'Crédito');
  const promedioDiasCredito = clientesCredito.length > 0 
    ? Math.round(clientesCredito.reduce((sum, c) => sum + (c.dias_credito || 0), 0) / clientesCredito.length)
    : 0;
  
  return {
    totalContado,
    totalCredito,
    promedioDiasCredito,
  };
};