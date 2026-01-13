import React, { useState, useEffect } from 'react';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import { Save, X, MapPin, Phone, Clock, Users } from 'lucide-react';

const tiposLugar = [
  { value: 'origen', label: 'Origen' },
  { value: 'destino', label: 'Destino' },
  { value: 'almacen', label: 'Almacén' },
  { value: 'taller', label: 'Taller' },
  { value: 'oficina', label: 'Oficina' }
];

const departamentosPeru = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho',
  'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
  'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima',
  'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
  'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
];

const serviciosDisponibles = [
  'Carga', 'Descarga', 'Almacenamiento', 'Estacionamiento',
  'Mantenimiento', 'Oficinas', 'Baños', 'Cafetería',
  'WiFi', 'Seguridad 24/7', 'Pesaje', 'Climatización'
];

const LugarForm = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
  isLoading = false,
  error = null,
  ...props
}) => {
  const [formData, setFormData] = useState({
    codigo_lugar: '',
    nombre: '',
    tipo_lugar: 'origen',
    direccion: '',
    distrito: '',
    provincia: '',
    departamento: 'Lima',
    coordenadas: {},
    contacto: '',
    telefono: '',
    horario_atencion: '',
    capacidad_estacionamiento: null,
    servicios_disponibles: [],
    estado: 'activo',
    es_principal: false,
    observaciones: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [coordenadasInput, setCoordenadasInput] = useState('');

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        coordenadas: initialData.coordenadas || {},
        capacidad_estacionamiento: initialData.capacidad_estacionamiento || null,
        servicios_disponibles: initialData.servicios_disponibles || [],
        contacto: initialData.contacto || '',
        telefono: initialData.telefono || '',
        horario_atencion: initialData.horario_atencion || '',
        observaciones: initialData.observaciones || ''
      };
      
      setFormData(formattedData);
      if (formattedData.coordenadas?.lat && formattedData.coordenadas?.lng) {
        setCoordenadasInput(`${formattedData.coordenadas.lat}, ${formattedData.coordenadas.lng}`);
      } else {
        setCoordenadasInput('');
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // No permitir editar el código de lugar
    if (name === "codigo_lugar") return;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCoordenadasChange = (e) => {
    const value = e.target.value;
    setCoordenadasInput(value);
    
    if (value.trim() === '') {
      setFormData(prev => ({
        ...prev,
        coordenadas: {}
      }));
      return;
    }
    
    try {
      const [latStr, lngStr] = value.split(',').map(s => s.trim());
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setFormData(prev => ({
          ...prev,
          coordenadas: { lat, lng }
        }));
        
        if (formErrors.coordenadas) {
          setFormErrors(prev => ({
            ...prev,
            coordenadas: ''
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          coordenadas: {}
        }));
      }
    } catch (error) {
      setFormData(prev => ({
        ...prev,
        coordenadas: {}
      }));
    }
  };

  const handleServicioToggle = (servicio) => {
    setFormData(prev => ({
      ...prev,
      servicios_disponibles: prev.servicios_disponibles.includes(servicio)
        ? prev.servicios_disponibles.filter(s => s !== servicio)
        : [...prev.servicios_disponibles, servicio]
    }));
  };

  const handleProvinciaChange = (provincia) => {
    setFormData(prev => ({
      ...prev,
      provincia
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Eliminada validación para codigo_lugar ya que no se requiere en creación
    // if (!formData.codigo_lugar.trim()) {
    //   errors.codigo_lugar = 'El código de lugar es requerido';
    // } else if (!/^[A-Z]{3}-[0-9]{3}$/.test(formData.codigo_lugar)) {
    //   errors.codigo_lugar = 'Formato inválido (ej: LUG-001)';
    // }
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.direccion.trim()) {
      errors.direccion = 'La dirección es requerida';
    }
    
    if (!formData.distrito.trim()) {
      errors.distrito = 'El distrito es requerido';
    }
    
    if (!formData.provincia.trim()) {
      errors.provincia = 'La provincia es requerida';
    }
    
    if (!formData.departamento.trim()) {
      errors.departamento = 'El departamento es requerido';
    }
    
    if (coordenadasInput.trim() && (!formData.coordenadas.lat || !formData.coordenadas.lng)) {
      errors.coordenadas = 'Formato de coordenadas inválido (ej: -12.0464, -77.0428)';
    }
    
    if (formData.telefono && !/^[0-9+\s\-()]{6,}$/.test(formData.telefono)) {
      errors.telefono = 'Formato de teléfono inválido';
    }
    
    if (formData.capacidad_estacionamiento && formData.capacidad_estacionamiento < 0) {
      errors.capacidad_estacionamiento = 'La capacidad no puede ser negativa';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        capacidad_estacionamiento: formData.capacidad_estacionamiento || null,
        servicios_disponibles: formData.servicios_disponibles,
        coordenadas: formData.coordenadas
      };
      
      if (mode === "create") {
        // En creación, no enviamos el código al backend
        const { codigo_lugar, ...restData } = dataToSubmit;
        onSubmit(restData);
      } else {
        // En edición, sí enviamos el código para identificar el lugar
        onSubmit(dataToSubmit);
      }
    }
  };

  const isFormValid = () => {
    // Eliminada validación para codigo_lugar en creación
    return formData.nombre.trim() &&
           formData.direccion.trim() &&
           formData.distrito.trim() &&
           formData.provincia.trim() &&
           formData.departamento.trim();
  };

  const getCodigoLugarLabel = () => {
    if (mode === "create") {
      return "Se generará automáticamente";
    } else if (mode === "edit") {
      return formData.codigo_lugar || "No disponible";
    } else {
      return formData.codigo_lugar || "Sin código";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" {...props}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo de código de lugar - solo lectura/visualización */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código Lugar
          </label>
          <div className={`w-full px-3 py-2 border border-gray-300 rounded-lg 
            ${mode === 'create' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-700'}`}>
            {getCodigoLugarLabel()}
          </div>
          {mode === 'create' && (
            <p className="mt-1 text-xs text-gray-500">
              El código será generado automáticamente al guardar
            </p>
          )}
        </div>

        <Input
          label="Nombre *"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={formErrors.nombre}
          placeholder="Ej: Planta de Arena Lima Norte"
          disabled={mode === 'view' || isLoading}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Lugar *
          </label>
          <select
            name="tipo_lugar"
            value={formData.tipo_lugar}
            onChange={handleChange}
            disabled={mode === 'view' || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
          >
            {tiposLugar.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        <Input
          label="Dirección *"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          error={formErrors.direccion}
          placeholder="Dirección completa"
          disabled={mode === 'view' || isLoading}
          required
          icon={MapPin}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento *
          </label>
          <select
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            disabled={mode === 'view' || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
          >
            {departamentosPeru.map(depto => (
              <option key={depto} value={depto}>{depto}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provincia *
          </label>
          <input
            type="text"
            name="provincia"
            value={formData.provincia}
            onChange={(e) => handleProvinciaChange(e.target.value)}
            disabled={mode === 'view' || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Ej: Lima"
            required
          />
          {formErrors.provincia && (
            <p className="mt-1 text-sm text-red-600">{formErrors.provincia}</p>
          )}
        </div>

        <Input
          label="Distrito *"
          name="distrito"
          value={formData.distrito}
          onChange={handleChange}
          error={formErrors.distrito}
          placeholder="Ej: Carabayllo"
          disabled={mode === 'view' || isLoading}
          required
        />

        <Input
          label="Coordenadas (opcional)"
          value={coordenadasInput}
          onChange={handleCoordenadasChange}
          error={formErrors.coordenadas}
          placeholder="Ej: -12.0464, -77.0428"
          disabled={mode === 'view' || isLoading}
        />

        <Input
          label="Contacto (opcional)"
          name="contacto"
          value={formData.contacto}
          onChange={handleChange}
          placeholder="Persona de contacto"
          disabled={mode === 'view' || isLoading}
          icon={Users}
        />

        <Input
          label="Teléfono (opcional)"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          error={formErrors.telefono}
          placeholder="Ej: 987654321"
          disabled={mode === 'view' || isLoading}
          icon={Phone}
        />

        <Input
          label="Horario de Atención (opcional)"
          name="horario_atencion"
          value={formData.horario_atencion}
          onChange={handleChange}
          placeholder="Ej: 06:00 - 18:00"
          disabled={mode === 'view' || isLoading}
          icon={Clock}
        />

        <Input
          label="Capacidad Estacionamiento (opcional)"
          name="capacidad_estacionamiento"
          type="number"
          value={formData.capacidad_estacionamiento || ''}
          onChange={handleChange}
          error={formErrors.capacidad_estacionamiento}
          placeholder="Número de vehículos"
          disabled={mode === 'view' || isLoading}
          min="0"
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled={mode === 'view' || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Servicios Disponibles
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {serviciosDisponibles.map((servicio) => (
            <div key={servicio} className="flex items-center">
              <input
                type="checkbox"
                id={`servicio-${servicio}`}
                checked={formData.servicios_disponibles.includes(servicio)}
                onChange={() => handleServicioToggle(servicio)}
                disabled={mode === 'view' || isLoading}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={`servicio-${servicio}`} className="ml-2 text-sm text-gray-700">
                {servicio}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="es_principal"
          name="es_principal"
          checked={formData.es_principal}
          onChange={handleChange}
          disabled={mode === 'view' || isLoading}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="es_principal" className="ml-2 block text-sm text-gray-700">
          Marcar como lugar principal
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (opcional)
        </label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          disabled={mode === 'view' || isLoading}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Información adicional relevante..."
        />
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
            {mode === 'create' ? 'Crear Lugar' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default React.memo(LugarForm);