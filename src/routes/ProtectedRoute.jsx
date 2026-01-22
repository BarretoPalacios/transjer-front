import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { checkPermission, getRequiredPermission } from '../utils/permissions';

const ProtectedRoute = ({ children, requirePermission = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="mt-4 text-white text-lg font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, ir al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especificaron permisos requeridos explícitos
  if (requirePermission.length > 0) {
    const [resource, action] = requirePermission;
    const hasPerm = checkPermission(user, resource, action);
    
    if (!hasPerm) {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    // Verificar permiso basado en la ruta
    const requiredPerm = getRequiredPermission(location.pathname);
    
    if (requiredPerm) {
      const [resource, action] = requiredPerm;
      const hasPerm = checkPermission(user, resource, action);
      
      if (!hasPerm) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;