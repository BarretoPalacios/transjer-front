import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/endpoints/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario autenticado al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        // Verificar si el token es válido con el backend
        await authAPI.verifyUser(token);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        // Si hay error, limpiar el localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Sesión expirada');
      }
    }
    setLoading(false);
  };

 const login = async (email, password) => {
  try {
    setError(null);
    const response = await authAPI.login({ email, password });
    
    const token = response.access_token;
    localStorage.setItem('token', token);
    
    const user = await authAPI.verifyUser(token);
    
    // Crear un mapa simple de permisos
    user.permissionsMap = {};
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach(role => {
        role.permissions.forEach(perm => {
          const key = `${perm.resource}_${perm.action}`;
          user.permissionsMap[key] = true;
        });
      });
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return { success: true, data: response };
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  }
};
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Opcional: llamar al endpoint de logout del backend
    // authAPI.logout();
  };



  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      // register,
      setError,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};