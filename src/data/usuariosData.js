export const usuariosEjemplo = [
  {
    id: 'USR-001',
    dni: '12345678',
    nombre: 'Juan',
    apellidos: 'Pérez García',
    email: 'juan.perez@empresa.com',
    telefono: '+51 987 654 321',
    usuario: 'jperez',
    password: '********',
    rol: 'Administrador',
    departamento: 'TI',
    estado: 'activo',
    fechaRegistro: '2024-01-15',
    fechaUltimoAcceso: '2024-12-10',
    permisos: ['usuarios:gestionar', 'roles:gestionar', 'configuracion:ver'],
    twoFactorEnabled: true,
    intentosFallidos: 0,
    bloqueado: false
  },
  // ... (copiar aquí todos los demás usuarios de tu ejemplo original)
];

export const rolesDisponibles = [
  { id: 'admin', nombre: 'Administrador', descripcion: 'Acceso completo al sistema' },
  { id: 'gerente', nombre: 'Gerente', descripcion: 'Gestión departamental completa' },
  { id: 'supervisor', nombre: 'Supervisor', descripcion: 'Supervisión de equipos' },
  { id: 'operador', nombre: 'Operador', descripcion: 'Operaciones diarias' },
  { id: 'auditor', nombre: 'Auditor', descripcion: 'Revisión y auditoría' },
  { id: 'analista', nombre: 'Analista', descripcion: 'Análisis de datos' },
  { id: 'desarrollador', nombre: 'Desarrollador', descripcion: 'Mantenimiento del sistema' },
  { id: 'soporte', nombre: 'Soporte', descripcion: 'Soporte técnico' }
];

export const permisosDisponibles = [
  { categoria: 'Usuarios', permisos: [
    { id: 'usuarios:ver', nombre: 'Ver usuarios', descripcion: 'Ver lista de usuarios' },
    { id: 'usuarios:crear', nombre: 'Crear usuarios', descripcion: 'Crear nuevos usuarios' },
    { id: 'usuarios:editar', nombre: 'Editar usuarios', descripcion: 'Modificar usuarios' },
    { id: 'usuarios:eliminar', nombre: 'Eliminar usuarios', descripcion: 'Eliminar usuarios' },
    { id: 'usuarios:gestionar', nombre: 'Gestionar usuarios', descripcion: 'Gestión completa' }
  ]},
  { categoria: 'Roles', permisos: [
    { id: 'roles:ver', nombre: 'Ver roles', descripcion: 'Ver lista de roles' },
    { id: 'roles:crear', nombre: 'Crear roles', descripcion: 'Crear nuevos roles' },
    { id: 'roles:editar', nombre: 'Editar roles', descripcion: 'Modificar roles' },
    { id: 'roles:eliminar', nombre: 'Eliminar roles', descripcion: 'Eliminar roles' },
    { id: 'roles:gestionar', nombre: 'Gestionar roles', descripcion: 'Gestión completa' }
  ]},
  { categoria: 'Proveedores', permisos: [
    { id: 'proveedores:ver', nombre: 'Ver proveedores', descripcion: 'Ver lista de proveedores' },
    { id: 'proveedores:crear', nombre: 'Crear proveedores', descripcion: 'Crear nuevos proveedores' },
    { id: 'proveedores:editar', nombre: 'Editar proveedores', descripcion: 'Modificar proveedores' },
    { id: 'proveedores:eliminar', nombre: 'Eliminar proveedores', descripcion: 'Eliminar proveedores' },
    { id: 'proveedores:gestionar', nombre: 'Gestionar proveedores', descripcion: 'Gestión completa' }
  ]},
  { categoria: 'Servicios', permisos: [
    { id: 'servicios:ver', nombre: 'Ver servicios', descripcion: 'Ver lista de servicios' },
    { id: 'servicios:crear', nombre: 'Crear servicios', descripcion: 'Crear nuevos servicios' },
    { id: 'servicios:editar', nombre: 'Editar servicios', descripcion: 'Modificar servicios' },
    { id: 'servicios:eliminar', nombre: 'Eliminar servicios', descripcion: 'Eliminar servicios' },
    { id: 'servicios:gestionar', nombre: 'Gestionar servicios', descripcion: 'Gestión completa' }
  ]},
  { categoria: 'Sistema', permisos: [
    { id: 'configuracion:ver', nombre: 'Ver configuración', descripcion: 'Ver configuración del sistema' },
    { id: 'configuracion:editar', nombre: 'Editar configuración', descripcion: 'Modificar configuración' },
    { id: 'sistema:configurar', nombre: 'Configurar sistema', descripcion: 'Configuración avanzada' },
    { id: 'api:gestionar', nombre: 'Gestionar API', descripcion: 'Gestión de APIs' },
    { id: 'backup:gestionar', nombre: 'Gestionar backup', descripcion: 'Gestión de copias de seguridad' }
  ]}
];