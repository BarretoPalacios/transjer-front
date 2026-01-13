import React, { useState, useEffect } from 'react';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import { Save, X } from 'lucide-react';

const UsuarioForm = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
  rolesDisponibles = [],
  ...props
}) => {
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: '',
        confirmPassword: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = () => {
    const requiredFields = ['dni', 'nombre', 'apellidos', 'email', 'usuario'];
    const isValid = requiredFields.every(field => formData[field].trim() !== '');
    
    if (mode === 'create') {
      return isValid && formData.password && formData.password === formData.confirmPassword;
    }
    
    if (formData.password || formData.confirmPassword) {
      return isValid && formData.password === formData.confirmPassword;
    }
    
    return isValid;
  };

  const departamentos = [
    'TI', 'Logística', 'Operaciones', 'Auditoría', 
    'Administración', 'Análisis', 'Soporte'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6" {...props}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="DNI"
          name="dni"
          value={formData.dni}
          onChange={handleChange}
          disabled={mode === 'view'}
          required
        />

        <Input
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          disabled={mode === 'view'}
          required
        />

        <Input
          label="Apellidos"
          name="apellidos"
          value={formData.apellidos}
          onChange={handleChange}
          disabled={mode === 'view'}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={mode === 'view'}
          required
        />

        <Input
          label="Teléfono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          disabled={mode === 'view'}
        />

        <Input
          label="Usuario"
          name="usuario"
          value={formData.usuario}
          onChange={handleChange}
          disabled={mode === 'view'}
          required
        />

        {mode !== 'view' && (
          <>
            <Input
              label={mode === 'edit' ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={mode === 'create'}
            />

            <Input
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formData.password && formData.password !== formData.confirmPassword ? 'Las contraseñas no coinciden' : ''}
            />
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol *
          </label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            disabled={mode === 'view'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
          >
            {rolesDisponibles.map(rol => (
              <option key={rol.id} value={rol.nombre}>{rol.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento
          </label>
          <select
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            disabled={mode === 'view'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Seleccionar departamento</option>
            {departamentos.map(depto => (
              <option key={depto} value={depto}>{depto}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled={mode === 'view'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="twoFactorEnabled"
            name="twoFactorEnabled"
            checked={formData.twoFactorEnabled}
            onChange={handleChange}
            disabled={mode === 'view'}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="twoFactorEnabled" className="ml-2 block text-sm text-gray-700">
            Habilitar autenticación de dos factores (2FA)
          </label>
        </div>
      </div>

      {mode !== 'view' && (
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid()}
          >
            <Save className="h-4 w-4 mr-2" />
            {mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default React.memo(UsuarioForm);