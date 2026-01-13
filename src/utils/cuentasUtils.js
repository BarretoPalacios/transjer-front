// Función para obtener color según tipo de cliente
export const getTipoClienteColor = (tipoCliente) => {
  switch (tipoCliente?.toLowerCase()) {
    case 'vip':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'regular':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'corporativo':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'gubernamental':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Función para obtener color según estado
export const getEstadoCuentaColor = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'activo':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactivo':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'suspendido':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'moroso':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Función para formatear moneda
export const formatMoneda = (valor) => {
  if (valor === null || valor === undefined) return 'S/. 0.00';
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0
  }).format(valor);
};

// Función para calcular antigüedad de registro
export const calcularAntiguedadCuenta = (fechaRegistro) => {
  if (!fechaRegistro) return 'N/A';
  
  const fecha = new Date(fechaRegistro);
  const hoy = new Date();
  const diffTiempo = hoy.getTime() - fecha.getTime();
  const diffDias = Math.floor(diffTiempo / (1000 * 3600 * 24));
  
  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 30) return `Hace ${diffDias} días`;
  
  const diffMeses = Math.floor(diffDias / 30);
  if (diffMeses === 1) return 'Hace 1 mes';
  if (diffMeses < 12) return `Hace ${diffMeses} meses`;
  
  const diffAnios = Math.floor(diffMeses / 12);
  return `Hace ${diffAnios} año${diffAnios !== 1 ? 's' : ''}`;
};

// Función para formatear fecha
export const formatFechaCuenta = (dateString) => {
  if (!dateString) return 'N/A';
  
  const fecha = new Date(dateString);
  return fecha.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Validar formato de RUC peruano (simplificado)
export const validarRUC = (ruc) => {
  if (!ruc) return false;
  // RUC peruano: 11 dígitos numéricos
  const rucRegex = /^[0-9]{11}$/;
  return rucRegex.test(ruc);
};

// Validar límite de crédito
export const validarLimiteCredito = (limite) => {
  if (limite === null || limite === undefined || limite === '') return true;
  const num = parseFloat(limite);
  return !isNaN(num) && num >= 0;
};

// Generar código de cliente automático
export const generarCodigoCliente = (nombre) => {
  if (!nombre) return '';
  const palabras = nombre.toUpperCase().split(' ');
  let codigo = '';
  
  if (palabras.length === 1) {
    codigo = palabras[0].substring(0, 3);
  } else {
    codigo = palabras[0].substring(0, 1) + 
             palabras[palabras.length - 1].substring(0, 2);
  }
  
  const timestamp = Date.now().toString().slice(-3);
  return `CL${codigo}${timestamp}`;
};

// Tipos de cliente disponibles
export const tiposCliente = [
  'Regular',
  'VIP',
  'Corporativo',
  'Gubernamental',
  'Especial',
  'Distribuidor'
];

// Estados disponibles
export const estadosCuenta = [
  'activo',
  'inactivo',
  'suspendido',
  'moroso'
];

export const generarCodigoCuenta = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CTA${timestamp}${random}`;
};