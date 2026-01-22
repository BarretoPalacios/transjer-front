// UsuariosSimplificado.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import { usePermissions } from '../../../hooks/usePermissions';

// Importamos la API de usuarios
import { userAPI } from '../../../api/endpoints/usuarios';

const Usuarios = () => {
  // Estados básicos
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    is_active: true,
    role_names: [] // Cambiamos de apartados a role_names
  });
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Hook de permisos
  const { can } = usePermissions();

  // Obtener lista de usuarios y roles
  const fetchUsuarios = async () => {
    setLoading(true);
    setError(''); 
    try {
      const response = await userAPI.getAllUsers();
      setUsuarios(response || []);
    } catch (err) {
      setError('Error al cargar usuarios: ' + (err.response?.data?.detail || err.message));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener roles disponibles
  const fetchRolesDisponibles = async () => {
    try {
      // Asumiendo que tienes una API para obtener roles
      // Si no, puedes definir los roles manualmente
      const roles = [
        {
          _id: "69720fcb64c2b05603164636",
          name: "administrador",
          description: "Administrador con acceso completo"
        },
        {
          _id: "69720fcc64c2b05603164637",
          name: "comercial",
          description: "Rol para equipo comercial"
        },
        {
          _id: "69720fcc64c2b05603164638",
          name: "contabilidad",
          description: "Rol para equipo de contabilidad"
        },
        {
          _id: "69720fcc64c2b05603164639",
          name: "operaciones",
          description: "Rol para equipo de operaciones"
        },
        // {
        //   _id: "69720fcc64c2b0560316463a",
        //   name: "visualizador",
        //   description: "Rol solo para visualizar"
        // }
      ];
      setRolesDisponibles(roles);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchRolesDisponibles();
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('role_')) {
      const roleName = name.replace('role_', '');
      if (checked) {
        // Agregar rol si no está ya en la lista
        setFormData({
          ...formData,
          role_names: [...formData.role_names, roleName]
        });
      } else {
        // Remover rol
        setFormData({
          ...formData,
          role_names: formData.role_names.filter(role => role !== roleName)
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Limpiar formulario
  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      password: '',
      full_name: '',
      is_active: true,
      role_names: []
    });
  };

  // Preparar usuario para edición
  const prepareEdit = (usuario) => {
    setSelectedUser(usuario);
    
    // Extraer los nombres de roles del usuario
    const userRoles = usuario.roles ? usuario.roles.map(role => role.name) : [];
    
    setFormData({
      email: usuario.email,
      username: usuario.username,
      password: '', // No mostrar contraseña actual
      full_name: usuario.full_name || '',
      is_active: usuario.is_active,
      role_names: userRoles
    });
    setShowEditModal(true);
  };

  // Toggle para seleccionar/deseleccionar todos los roles
  const toggleAllRoles = () => {
    const allSelected = rolesDisponibles.length > 0 && 
                       rolesDisponibles.every(role => formData.role_names.includes(role.name));
    
    if (allSelected) {
      // Deseleccionar todos
      setFormData({
        ...formData,
        role_names: []
      });
    } else {
      // Seleccionar todos
      setFormData({
        ...formData,
        role_names: rolesDisponibles.map(role => role.name)
      });
    }
  };

  // Crear nuevo usuario
  const handleCreateUser = async () => {
    setError('');
    setSuccessMessage('');
    
    // Validaciones básicas
    if (!formData.email || !formData.username || formData.password.length < 6) {
      setError('Por favor, completa todos los campos (Contraseña: mín. 6 caracteres)');
      return;
    }

    // Verificar que al menos un rol esté seleccionado
    if (formData.role_names.length === 0) {
      setError('Debe seleccionar al menos un rol');
      return;
    }

    try {
      // Preparar datos para enviar - ENVIAR LOS ROLES DIRECTAMENTE
      const userToCreate = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || formData.username,
        is_active: formData.is_active,
        role_ids: formData.role_names // Enviar los roles seleccionados
      };

      console.log('Creando usuario con roles:', userToCreate.role_names);
      
      // Llamar a la API de registro
      await userAPI.registerUser(userToCreate);
      
      // Limpiar formulario
      resetForm();
      
      setSuccessMessage('Usuario creado exitosamente');
      setShowCreateModal(false);
      
      // Actualizar lista de usuarios
      await fetchUsuarios();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al crear usuario: ' + (err.response?.data?.detail || err.message));
      console.error('Error creating user:', err);
    }
  };

  // Actualizar usuario existente
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setError('');
    setSuccessMessage('');
    
    try {
      // Preparar datos para actualizar
      const updateData = {
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name || formData.username,
        is_active: formData.is_active,
        role_names: formData.role_names // Enviar los roles seleccionados
      };

      // Solo incluir password si se cambió
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      console.log('Actualizando usuario con roles:', updateData.role_names);
      
      // Actualizar datos del usuario (incluyendo roles)
      await userAPI.updateUser(selectedUser.id, updateData);
      
      setSuccessMessage('Usuario actualizado exitosamente');
      setShowEditModal(false);
      setSelectedUser(null);
      
      // Actualizar lista de usuarios
      await fetchUsuarios();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar usuario: ' + (err.response?.data?.detail || err.message));
      console.error('Error updating user:', err);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    
    try {
      await userAPI.deleteUser(selectedUserId);
      setShowDeleteModal(false);
      setSelectedUserId(null);
      await fetchUsuarios();
      setSuccessMessage('Usuario eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al eliminar usuario: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Renderizar roles de un usuario
  const renderUserRoles = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return 'Sin roles asignados';
    }
    
    return roles.map(role => {
      // Formatear el nombre del rol (primera letra mayúscula)
      const roleName = role.name.charAt(0).toUpperCase() + role.name.slice(1);
      return roleName;
    }).join(', ');
  };

  // Obtener tipo de usuario basado en roles
  const getUserType = (roles) => {
    if (!roles || roles.length === 0) return 'Sin tipo';
    
    if (roles.some(role => role.name === 'administrador')) return 'Administrador';
    if (roles.some(role => role.name === 'comercial')) return 'Comercial';
    if (roles.some(role => role.name === 'contabilidad')) return 'Contabilidad';
    if (roles.some(role => role.name === 'operaciones')) return 'Operaciones';
    if (roles.some(role => role.name === 'visualizador')) return 'Visualizador';
    
    return roles[0]?.name || 'Usuario';
  };

  // Obtener color de badge según el tipo
  const getTypeColor = (roles) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-800';
    
    const userType = getUserType(roles);
    switch(userType) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-800';
      case 'Comercial':
        return 'bg-blue-100 text-blue-800';
      case 'Contabilidad':
        return 'bg-green-100 text-green-800';
      case 'Operaciones':
        return 'bg-orange-100 text-orange-800';
      case 'Visualizador':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header y botón de crear */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Asigna roles a cada usuario</p>
        </div>
        {can('usuarios', 'manage') && (
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            + Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            {successMessage}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center">
            <span className="mr-2">✗</span>
            {error}
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Usuarios del Sistema</h2>
          <p className="text-sm text-gray-600 mt-1">Administra los roles de cada usuario</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles Asignados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Cargando usuarios...</p>
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <p>No hay usuarios registrados</p>
                      <p className="text-sm mt-1">Crea el primer usuario usando el botón "Nuevo Usuario"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold mr-3">
                          {usuario.full_name?.charAt(0) || usuario.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {usuario.full_name || usuario.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{usuario.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{usuario.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {usuario.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(usuario.roles)}`}>
                        {getUserType(usuario.roles)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {renderUserRoles(usuario.roles)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {usuario.roles?.length || 0} {usuario.roles?.length === 1 ? 'rol' : 'roles'} asignado{usuario.roles?.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${usuario.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium ${usuario.is_active ? 'text-green-700' : 'text-red-700'}`}>
                          {usuario.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {can('usuarios', 'manage') && (
                          <>
                            {/* <button
                              onClick={() => prepareEdit(usuario)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar usuario"
                            >
                              Editar
                            </button> */}
                            <button
                              onClick={() => {
                                setSelectedUserId(usuario.id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar usuario"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear usuario */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Usuario"
        size="large"
      >
        <div className="space-y-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <div className="flex items-center">
                <span className="mr-2">✗</span>
                {error}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="usuario123"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          {/* Sección de roles */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Roles del Usuario</h3>
                <p className="text-sm text-gray-600">Selecciona los roles que tendrá este usuario</p>
              </div>
              <button
                type="button"
                onClick={toggleAllRoles}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {rolesDisponibles.length > 0 && 
                 rolesDisponibles.every(role => formData.role_names.includes(role.name)) 
                 ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rolesDisponibles.map((role) => (
                <div 
                  key={role._id} 
                  className={`border rounded-lg p-3 transition-all ${formData.role_names.includes(role.name) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id={`role_${role.name}`}
                      name={`role_${role.name}`}
                      checked={formData.role_names.includes(role.name)}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <label
                          htmlFor={`role_${role.name}`}
                          className="text-sm font-medium text-gray-900"
                        >
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Nota:</span> Los permisos del usuario se determinarán automáticamente según los roles asignados.
              </p>
            </div>
          </div>

          <div className="flex items-center pt-4 border-t border-gray-200">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="is_active"
              className="ml-2 text-sm text-gray-700"
            >
              Usuario activo (puede iniciar sesión inmediatamente)
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="secondary"
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              >
                Crear Usuario
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal para editar usuario */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        title="Editar Usuario"
        size="large"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de usuario *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña (dejar vacío para mantener la actual)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Sección de roles */}
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Roles del Usuario</h3>
                <p className="text-sm text-gray-600">Actualiza los roles de este usuario</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rolesDisponibles.map((role) => (
                  <div 
                    key={role._id} 
                    className={`border rounded-lg p-3 transition-all ${formData.role_names.includes(role.name) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id={`edit_role_${role.name}`}
                        name={`role_${role.name}`}
                        checked={formData.role_names.includes(role.name)}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <label
                            htmlFor={`edit_role_${role.name}`}
                            className="text-sm font-medium text-gray-900"
                          >
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center pt-4 border-t border-gray-200">
              <input
                type="checkbox"
                id="edit_is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="edit_is_active"
                className="ml-2 text-sm text-gray-700"
              >
                Usuario activo
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  variant="secondary"
                  className="px-4 py-2"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="¿Eliminar usuario?"
        message="Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default Usuarios;