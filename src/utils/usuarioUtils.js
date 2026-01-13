export const getEstadoColor = (estado) => {
  switch (estado) {
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

export const getRolColor = (rol) => {
  switch (rol) {
    case 'Administrador':
      return 'bg-red-100 text-red-800';
    case 'Gerente':
      return 'bg-purple-100 text-purple-800';
    case 'Supervisor':
      return 'bg-blue-100 text-blue-800';
    case 'Operador':
      return 'bg-green-100 text-green-800';
    case 'Auditor':
      return 'bg-orange-100 text-orange-800';
    case 'Analista':
      return 'bg-cyan-100 text-cyan-800';
    case 'Desarrollador':
      return 'bg-indigo-100 text-indigo-800';
    case 'Soporte':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const initialUsuarioForm = {
  dni: '',
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  usuario: '',
  password: '',
  confirmPassword: '',
  rol: 'Operador',
  departamento: '',
  estado: 'activo',
  twoFactorEnabled: false,
  permisos: []
};

export const departamentos = [
  'TI', 'Logística', 'Operaciones', 'Auditoría', 
  'Administración', 'Análisis', 'Soporte'
];