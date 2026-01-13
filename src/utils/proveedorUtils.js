// Función para obtener color según estado
export const getEstadoColor = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'activo':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactivo':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Función para obtener color según tipo
export const getTipoProveedorColor = (tipo) => {
  switch (tipo) {
    case 'Transportista':
      return 'bg-blue-100 text-blue-800';
    case 'Logística':
      return 'bg-purple-100 text-purple-800';
    case 'Seguridad':
      return 'bg-red-100 text-red-800';
    case 'Mantenimiento':
      return 'bg-orange-100 text-orange-800';
    case 'Combustible':
      return 'bg-yellow-100 text-yellow-800';
    case 'Tecnología':
      return 'bg-indigo-100 text-indigo-800';
    case 'Seguros':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Función para validar RUC
export const validarRUC = (ruc) => {
  if (!ruc) return false;
  // Validación básica de RUC peruano
  const rucRegex = /^[0-9]{11}$/;
  return rucRegex.test(ruc);
};

// Función para formatear servicios
export const formatearServicios = (servicios) => {
  if (!servicios) return [];
  if (Array.isArray(servicios)) return servicios;
  if (typeof servicios === 'string') {
    return servicios.split(';').map(s => s.trim()).filter(s => s);
  }
  return [];
};

// Función para obtener información de proveedor para display
export const getProveedorInfo = (proveedor) => {
  return {
    nombre: proveedor.nombre_comercial || proveedor.razon_social,
    ruc: proveedor.ruc,
    contacto: proveedor.contacto,
    telefono: proveedor.telefono,
    email: proveedor.email,
    servicios: formatearServicios(proveedor.servicios),
    capacidadCamiones: proveedor.capacidad_camiones || 0,
    tipo: proveedor.tipo,
    estado: proveedor.estado,
    fechaRegistro: proveedor.fecha_registro,
    observaciones: proveedor.observaciones
  };
};