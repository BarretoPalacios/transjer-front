import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();
  
  const can = (resource, action = null) => {
    if (!user?.roles) return false;
    
    // Si es administrador, puede todo
    if (user.roles.some(role => role.name === 'administrador')) {
      return true;
    }
    
    // Buscar permiso específico
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        if (permission.resource === resource) {
          // Si no se especifica acción, o si coincide la acción
          if (!action || permission.action === action) {
            return true;
          }
        }
      }
    }
    
    return false;
  };
  
  const isAdmin = user?.roles?.some(role => role.name === 'administrador') || false;
  
  return { can, isAdmin };
};