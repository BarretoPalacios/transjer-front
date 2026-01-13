export const getTipoServicioColor = (tipo) => {
  switch (tipo) {
    case 'Importación': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Exportación': return 'bg-green-100 text-green-800 border-green-200';
    case 'Carga Especial': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Distribución': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getEstadoServicioColor = (estado) => {
  switch (estado) {
    case 'Completado': return 'bg-green-100 text-green-800 border-green-200';
    case 'En Proceso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Pendiente': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getZonaColor = (zona) => {
  switch (zona) {
    case 'Lima': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Provincia': return 'bg-green-100 text-green-800 border-green-200';
    case 'Extranjero': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatFecha = (fechaString) => {
  if (!fechaString) return '';
  const fecha = new Date(fechaString);
  return fecha.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatMoneda = (valor) => {
  if (!valor) return 'S/ 0.00';
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(valor);
};

export const calcularUtilidad = (ingresoTotal, costoTotal) => {
  const ingreso = parseFloat(ingresoTotal) || 0;
  const costo = parseFloat(costoTotal) || 0;
  return ingreso - costo;
};