export const getEstadoColor = (estado) => {
  switch (estado) {
    case 'activo':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactivo':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getTipoLugarColor = (tipo) => {
  switch (tipo) {
    case 'origen':
      return 'bg-blue-100 text-blue-800';
    case 'destino':
      return 'bg-green-100 text-green-800';
    case 'almacen':
      return 'bg-purple-100 text-purple-800';
    case 'taller':
      return 'bg-orange-100 text-orange-800';
    case 'oficina':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatServicios = (servicios) => {
  if (!servicios || servicios.length === 0) return 'Sin servicios';
  return servicios.join(', ');
};