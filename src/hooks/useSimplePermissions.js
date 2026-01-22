import { useAuth } from './useAuth';
import { checkPermission } from '../utils/permissions';

export const useSimplePermissions = () => {
  const { user } = useAuth();
  
  const can = (resource, action = null) => {
    return checkPermission(user, resource, action);
  };
  
  const isAdmin = user?.roles?.some(role => role.name === 'administrador') || false;
  
  return { can, isAdmin };
};