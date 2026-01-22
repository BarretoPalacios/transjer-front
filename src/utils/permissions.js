// Función simple para verificar permisos
export const checkPermission = (user, resource, action = null) => {
  if (!user?.permissionsMap) return false;
  
  // Si es administrador, tiene todos los permisos
  if (user.roles?.some(role => role.name === 'administrador')) {
    return true;
  }
  
  // Si no se especifica acción, verificar cualquier permiso del recurso
  if (!action) {
    return Object.keys(user.permissionsMap).some(key => 
      key.startsWith(`${resource}_`)
    );
  }
  
  // Verificar permiso específico
  const permissionKey = `${resource}_${action}`;
  return !!user.permissionsMap[permissionKey];
};

// Mapeo simple de rutas a permisos
export const getRequiredPermission = (path) => {
  const permissionMap = {
    '/dashboard': ['dashboard', 'view'],
    '/servicios': ['servicios', 'view'],
    '/servicios/nuevo': ['servicios', 'manage'],
    '/servicios/editar': ['servicios', 'manage'],
    '/servicios/detalle': ['servicios', 'view'],
    '/buscar-servicio': ['servicios', 'view'],
    '/historicos': ['servicios', 'view'],
    '/reportes-historicos': ['servicios', 'view'],
    '/contabilidad': ['contabilidad', 'view'],
    '/gestion': ['gestion', 'view'],
    '/gestion/clientes': ['gestion', 'view'],
    '/gestion/proveedores': ['gestion', 'view'],
    '/gestion/flotas': ['gestion', 'view'],
    '/gestion/personal': ['gestion', 'view'],
    '/gastos': ['gastos', 'view'],
    '/gerencia/gerencia': ['gerencia', 'view'],
    '/gerencia/analiticas': ['gerencia', 'view'],
    '/usuarios': ['usuarios', 'view']
  };
  
  // Buscar coincidencia
  for (const [route, permission] of Object.entries(permissionMap)) {
    if (path.startsWith(route)) {
      return permission;
    }
  }
  
  return null;
};