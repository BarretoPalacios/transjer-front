// serviciosData.js
export const tiposServicio = [
  { value: 'Local', label: 'Local' },
  { value: 'Nacional', label: 'Nacional' },
  { value: 'Cuadrilla', label: 'Cuadrilla' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Alquiler', label: 'Alquiler' },
  { value: 'Otros', label: 'Otros' }
];

export const modalidadesServicio = [
  { value: 'Carga', label: 'Carga' },
  { value: 'Descarga', label: 'Descarga' },
  { value: 'Carga y Descarga', label: 'Carga y Descarga' },
  { value: 'Ida y Vuelta', label: 'Ida y Vuelta' },
  { value: 'Solo Ida', label: 'Solo Ida' },
  { value: 'Por Hora', label: 'Por Hora' },
  { value: 'Por Día', label: 'Por Día' },
  { value: 'Mixto', label: 'Mixto' }
];

export const unidadesMedida = [
  { value: 'm³', label: 'Metros cúbicos (m³)' },
  { value: 'Tonelada', label: 'Tonelada' },
  { value: 'Viaje', label: 'Viaje' },
  { value: 'Hora', label: 'Hora' },
  { value: 'Día', label: 'Día' }
];

export const estadosServicio = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' }
];

// Funciones de ayuda para ServicioCard
export const getEstadoColor = (estado) => {
  switch(estado) {
    case 'activo': return 'bg-green-100 text-green-800 border-green-200';
    case 'inactivo': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getTipoServicioColor = (tipo) => {
  switch(tipo) {
    case 'Local': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Nacional': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Cuadrilla': return 'bg-green-100 text-green-800 border-green-200';
    case 'Transporte': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'Alquiler': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Otros': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getModalidadServicioColor = (modalidad) => {
  switch(modalidad) {
    case 'Carga': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Descarga': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Carga y Descarga': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Ida y Vuelta': return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'Solo Ida': return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'Por Hora': return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'Por Día': return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'Mixto': return 'bg-violet-100 text-violet-800 border-violet-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};