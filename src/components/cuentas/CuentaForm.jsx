import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  User, 
  Building, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import { tiposCliente, estadosCuenta, validarRUC, validarLimiteCredito } from '../../utils/cuentasUtils';

const CuentaForm = ({
  initialData,
  clientes = [], // Lista de clientes: [{codigo_cliente, razon_social, nombre, ruc, ...}]
  onSubmit,
  onCancel,
  mode = 'create',
  isLoading = false,
  error = null,
  ...props
}) => {
  const [formData, setFormData] = useState({
    codigo_cliente: '',
    razon_social: '',
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
    tipo_cliente: 'Regular',
    limite_credito: '',
    estado: 'activo',
    notas: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Función para obtener los datos del cliente por su código
  const getDatosCliente = (codigoCliente) => {
    if (!codigoCliente || !clientes.length) return null;
    return clientes.find(c => c.codigo_cliente === codigoCliente);
  };

  // Efecto para inicializar el formulario
  useEffect(() => {
    if (initialData) {
      const cliente = getDatosCliente(initialData.codigo_cliente);
      
      const datosIniciales = {
        codigo_cliente: initialData.codigo_cliente || '',
        razon_social: cliente?.razon_social || cliente?.nombre || '',
        nombre: initialData.nombre || '',
        ruc: initialData.ruc || '',
        direccion: initialData.direccion || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        contacto: initialData.contacto || '',
        tipo_cliente: initialData.tipo_cliente || 'Regular',
        limite_credito: initialData.limite_credito || '',
        estado: initialData.estado || 'activo',
        notas: initialData.notas || ''
      };

      setFormData(datosIniciales);
      
      if (cliente) {
        setClienteSeleccionado(cliente);
      }
    } else if (mode === 'create') {
      // Si es creación, establecer valores por defecto
      setFormData(prev => ({ 
        ...prev, 
        estado: 'activo',
        tipo_cliente: 'Regular'
      }));
    }
  }, [initialData, mode]); // Solo depende de initialData y mode

  // Efecto para actualizar clienteSeleccionado cuando cambia codigo_cliente
  useEffect(() => {
    if (formData.codigo_cliente) {
      const cliente = getDatosCliente(formData.codigo_cliente);
      setClienteSeleccionado(cliente || null);
    } else {
      setClienteSeleccionado(null);
    }
  }, [formData.codigo_cliente]); // Solo depende de codigo_cliente

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Manejar cambio de cliente (dropdown)
    if (name === 'codigo_cliente') {
      const cliente = getDatosCliente(value);
      
      if (cliente) {
        // Si se seleccionó un cliente válido, actualizar todos los campos
        setFormData(prev => ({
          ...prev,
          codigo_cliente: cliente.codigo_cliente,
          razon_social: cliente.razon_social || cliente.nombre || '',
          nombre: cliente.nombre || '',
          ruc: cliente.ruc || '',
          direccion: cliente.direccion || '',
          telefono: cliente.telefono || '',
          email: cliente.email || '',
          contacto: cliente.contacto || '',
          tipo_cliente: cliente.tipo_cliente || 'Regular'
        }));
      } else {
        // Si se seleccionó "Seleccionar cliente" o no hay cliente
        setFormData(prev => ({
          ...prev,
          codigo_cliente: value,
          razon_social: '',
          nombre: '',
          ruc: '',
          direccion: '',
          telefono: '',
          email: '',
          contacto: '',
          tipo_cliente: 'Regular'
        }));
      }
    } else {
      // Para otros campos
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
      }));
    }
    
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validar código de cliente
    if (!formData.codigo_cliente.trim()) {
      errors.codigo_cliente = 'Debe seleccionar un cliente';
    }
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3 || formData.nombre.length > 200) {
      errors.nombre = 'El nombre debe tener entre 3 y 200 caracteres';
    }
    
    // Validar RUC
    if (!formData.ruc.trim()) {
      errors.ruc = 'El RUC es requerido';
    } else if (!validarRUC(formData.ruc)) {
      errors.ruc = 'El RUC debe tener 11 dígitos numéricos';
    }
    
    // Validar dirección
    if (!formData.direccion.trim()) {
      errors.direccion = 'La dirección es requerida';
    } else if (formData.direccion.length < 5 || formData.direccion.length > 300) {
      errors.direccion = 'La dirección debe tener entre 5 y 300 caracteres';
    }
    
    // Validar teléfono
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    }
    
    // Validar email si se proporciona
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    // Validar límite de crédito
    if (formData.limite_credito !== '' && !validarLimiteCredito(formData.limite_credito)) {
      errors.limite_credito = 'El límite de crédito debe ser un número positivo';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Preparar datos para enviar
      const dataToSubmit = {
        codigo_cliente: formData.codigo_cliente,
        nombre: formData.nombre,
        ruc: formData.ruc,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email || null,
        contacto: formData.contacto || null,
        tipo_cliente: formData.tipo_cliente,
        limite_credito: formData.limite_credito !== '' ? parseFloat(formData.limite_credito) : 0,
        estado: formData.estado,
        notas: formData.notas || null
      };
      
      onSubmit(dataToSubmit);
    }
  };

  const isFormValid = () => {
    return formData.codigo_cliente.trim() &&
           formData.nombre.trim() &&
           formData.ruc.trim() &&
           formData.direccion.trim() &&
           formData.telefono.trim();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" {...props}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Información Básica */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Información Básica
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <div className="relative">
              <select
                name="codigo_cliente"
                value={formData.codigo_cliente}
                onChange={handleChange}
                disabled={mode === 'view' || isLoading || clientes.length === 0}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 appearance-none ${
                  formErrors.codigo_cliente ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">-- Seleccionar cliente --</option>
                {clientes.map(cliente => (
                  <option 
                    key={cliente.codigo_cliente} 
                    value={cliente.codigo_cliente}
                  >
                    {cliente.razon_social || cliente.nombre} ({cliente.codigo_cliente})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {formErrors.codigo_cliente && (
              <p className="mt-1 text-sm text-red-600">{formErrors.codigo_cliente}</p>
            )}
            
            {/* Información del cliente seleccionado */}
            {clienteSeleccionado && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm">
                <div className="font-medium text-blue-800">
                  {clienteSeleccionado.razon_social || clienteSeleccionado.nombre}
                </div>
                <div className="text-blue-600 mt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Código:</span> {clienteSeleccionado.codigo_cliente}
                    </div>
                    <div>
                      <span className="font-medium">RUC:</span> {clienteSeleccionado.ruc}
                    </div>
                    <div>
                      <span className="font-medium">Teléfono:</span> {clienteSeleccionado.telefono}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {clienteSeleccionado.email || 'No especificado'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Input
              label="Nombre para la Cuenta *"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={formErrors.nombre}
              placeholder="Ej: Cuenta Constructora Lima S.A.C."
              disabled={mode === 'view' || isLoading}
              required
              maxLength={200}
              icon={Building}
            />
          </div>

          <Input
            label="RUC *"
            name="ruc"
            value={formData.ruc}
            onChange={handleChange}
            error={formErrors.ruc}
            placeholder="Ej: 20123456789"
            disabled={mode === 'view' || isLoading}
            required
            maxLength={11}
            minLength={11}
            icon={CreditCard}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cliente *
            </label>
            <select
              name="tipo_cliente"
              value={formData.tipo_cliente}
              onChange={handleChange}
              disabled={mode === 'view' || isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
            >
              {tiposCliente.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Información de Contacto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Dirección *"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            error={formErrors.direccion}
            placeholder="Ej: Av. Javier Prado Este 456, San Isidro, Lima"
            disabled={mode === 'view' || isLoading}
            required
            maxLength={300}
            icon={MapPin}
          />

          <Input
            label="Teléfono *"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            error={formErrors.telefono}
            placeholder="Ej: 987654321"
            disabled={mode === 'view' || isLoading}
            required
            icon={Phone}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            placeholder="Ej: contacto@empresa.com"
            disabled={mode === 'view' || isLoading}
            icon={Mail}
          />

          <Input
            label="Persona de Contacto"
            name="contacto"
            value={formData.contacto}
            onChange={handleChange}
            placeholder="Ej: María García López"
            disabled={mode === 'view' || isLoading}
            maxLength={150}
            icon={User}
          />
        </div>
      </div>

      {/* Configuración y Notas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Límite de Crédito (S/.)"
            name="limite_credito"
            type="number"
            value={formData.limite_credito}
            onChange={handleChange}
            error={formErrors.limite_credito}
            placeholder="Ej: 50000.00"
            disabled={mode === 'view' || isLoading}
            min="0"
            step="0.01"
            icon={CreditCard}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la Cuenta *
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              disabled={mode === 'view' || isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
            >
              {estadosCuenta.map(estado => (
                <option key={estado} value={estado} className="capitalize">
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            disabled={mode === 'view' || isLoading}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Notas adicionales sobre la cuenta..."
          />
        </div>
      </div>

      {mode !== 'view' && (
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid() || isLoading}
            isLoading={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {mode === 'create' ? 'Crear Cuenta' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default React.memo(CuentaForm);