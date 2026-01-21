import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import Button from "../../common/Button/Button";

const UsuarioForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  mode, 
  isLoading,
  error 
}) => {
  const isViewMode = mode === "view";
  
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    is_active: true,
    permisos: {
      gestion: false,
      contabilidad: false,
      servicios: false,
      gastos: false,
      gerencia: false,
      otros: false,
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Lista de permisos disponibles
  const permisosList = [
    { id: "gestion", label: "Gestión" },
    { id: "contabilidad", label: "Contabilidad" },
    { id: "servicios", label: "Servicios" },
    { id: "gastos", label: "Gastos" },
    { id: "gerencia", label: "Gerencia" },
    { id: "otros", label: "Otros" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || "",
        username: initialData.username || "",
        password: "", // No mostrar contraseña actual
        confirmPassword: "",
        full_name: initialData.full_name || "",
        is_active: initialData.is_active ?? true,
        permisos: initialData.permisos || {
          gestion: false,
          contabilidad: false,
          servicios: false,
          gastos: false,
          gerencia: false,
          otros: false,
        }
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "is_active") {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.startsWith("permisos.")) {
      const permisoKey = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        permisos: {
          ...prev.permisos,
          [permisoKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectAllPermisos = () => {
    setFormData(prev => ({
      ...prev,
      permisos: {
        gestion: true,
        contabilidad: true,
        servicios: true,
        gastos: true,
        gerencia: true,
        otros: true,
      }
    }));
  };

  const handleClearAllPermisos = () => {
    setFormData(prev => ({
      ...prev,
      permisos: {
        gestion: false,
        contabilidad: false,
        servicios: false,
        gastos: false,
        gerencia: false,
        otros: false,
      }
    }));
  };

  const validateForm = () => {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Por favor ingrese un email válido");
      return false;
    }

    // Validar username
    if (formData.username.length < 3) {
      setFormError("El nombre de usuario debe tener al menos 3 caracteres");
      return false;
    }

    // Solo validar contraseña en creación o si se está cambiando
    if (mode === "create" || formData.password) {
      if (formData.password.length < 6) {
        setFormError("La contraseña debe tener al menos 6 caracteres");
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setFormError("Las contraseñas no coinciden");
        return false;
      }
    }

    // Validar al menos un permiso seleccionado
    const hasAnyPermiso = Object.values(formData.permisos).some(value => value);
    if (!hasAnyPermiso) {
      setFormError("Debe seleccionar al menos un permiso");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar
    const dataToSubmit = {
      email: formData.email,
      username: formData.username,
      full_name: formData.full_name,
      is_active: formData.is_active,
      permisos: formData.permisos
    };

    // Solo incluir contraseña si se está creando o cambiando
    if (mode === "create" || formData.password) {
      dataToSubmit.password = formData.password;
    }

    onSubmit(dataToSubmit);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setFormData(prev => ({
      ...prev,
      password: password,
      confirmPassword: password
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Información Básica</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50"
              placeholder="usuario@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Usuario *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50"
              placeholder="Nombre de usuario único"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled={isViewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50"
              placeholder="Nombre y apellidos"
            />
          </div>

          {!isViewMode && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Usuario Activo
              </label>
            </div>
          )}
        </div>

        {/* Contraseña (solo para creación o edición) */}
        {!isViewMode && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              {mode === "create" ? "Contraseña *" : "Cambiar Contraseña"}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña {mode === "create" && "*"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={mode === "create"}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                  placeholder={mode === "create" ? "Mínimo 6 caracteres" : "Dejar vacío para no cambiar"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña {mode === "create" && "*"}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  required={mode === "create"}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                  placeholder="Repetir contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={generateRandomPassword}
              className="w-full"
            >
              Generar Contraseña Aleatoria
            </Button>
          </div>
        )}
      </div>

      {/* Permisos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">Permisos de Acceso *</h3>
          {!isViewMode && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSelectAllPermisos}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Seleccionar Todos
              </button>
              <button
                type="button"
                onClick={handleClearAllPermisos}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {permisosList.map((permiso) => (
            <div key={permiso.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              {isViewMode ? (
                formData.permisos[permiso.id] ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-green-500 rounded flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">{permiso.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border border-gray-300 rounded"></div>
                    <span className="text-sm text-gray-500">{permiso.label}</span>
                  </div>
                )
              ) : (
                <>
                  <input
                    type="checkbox"
                    id={`permiso-${permiso.id}`}
                    name={`permisos.${permiso.id}`}
                    checked={formData.permisos[permiso.id] || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label 
                    htmlFor={`permiso-${permiso.id}`}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {permiso.label}
                  </label>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          * Indica qué secciones del sistema podrá ver el usuario
        </div>
      </div>

      {/* Resumen de permisos seleccionados */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Permisos seleccionados:</h4>
        <div className="flex flex-wrap gap-2">
          {permisosList.map((permiso) => 
            formData.permisos[permiso.id] && (
              <span 
                key={permiso.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {permiso.label}
              </span>
            )
          )}
          {!Object.values(formData.permisos).some(v => v) && (
            <span className="text-sm text-gray-500 italic">
              No se han seleccionado permisos
            </span>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      {!isViewMode && (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : mode === "create" ? "Crear Usuario" : "Guardar Cambios"}
          </Button>
        </div>
      )}

      {isViewMode && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            type="button"
            onClick={onCancel}
          >
            Cerrar
          </Button>
        </div>
      )}
    </form>
  );
};

export default UsuarioForm;