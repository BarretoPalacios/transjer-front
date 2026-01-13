import React, { useState, useEffect } from 'react';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import { Save, X } from 'lucide-react';

// Datos para selectores
const tiposServicio = [
  { value: 'Local', label: 'Local' },
  { value: 'Nacional', label: 'Nacional' },
  { value: 'Cuadrilla', label: 'Cuadrilla' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Alquiler', label: 'Alquiler' },
  { value: 'Otros', label: 'Otros' }
];

// Modalidades por tipo de servicio
const modalidadesPorTipo = {
  // Modalidades para Local
  Local: [
    { value: 'REGULAR', label: 'REGULAR' },
    { value: 'FLETE', label: 'FLETE' },
    { value: 'TRASLADO', label: 'TRASLADO' },
    { value: 'DUADO', label: 'DUADO' },
    { value: 'SIMPLE', label: 'SIMPLE' },
    { value: 'DESCARGA ACTIVOS', label: 'DESCARGA ACTIVOS' },
    { value: '2DA VUELTA', label: '2DA VUELTA' },
    { value: '1RA VUELTA', label: '1RA VUELTA' },
    { value: 'TRIADO', label: 'TRIADO' }
  ],
  // Modalidades para Nacional
  Nacional: [
    { value: 'DIRECTO', label: 'DIRECTO' },
    { value: 'CON ESCALA', label: 'CON ESCALA' }
  ],
  // Modalidades para Cuadrilla
  Cuadrilla: [
    { value: 'CARGA', label: 'CARGA' },
    { value: 'DESCARGA', label: 'DESCARGA' },
    { value: 'ALMACEN', label: 'ALMACEN' }
  ],
  // Modalidades por defecto (para otros tipos)
  default: [
    { value: 'Carga', label: 'Carga' },
    { value: 'Descarga', label: 'Descarga' },
    { value: 'Carga y Descarga', label: 'Carga y Descarga' },
    { value: 'Ida y Vuelta', label: 'Ida y Vuelta' },
    { value: 'Solo Ida', label: 'Solo Ida' },
    { value: 'Por Hora', label: 'Por Hora' },
    { value: 'Por Día', label: 'Por Día' },
    { value: 'Mixto', label: 'Mixto' }
  ]
};

// Valor por defecto por tipo de servicio
const modalidadPorDefectoPorTipo = {
  Local: 'REGULAR',
  Nacional: 'DIRECTO',
  Cuadrilla: 'CARGA',
  Transporte: 'Carga',
  Alquiler: 'Por Día',
  Otros: 'Mixto'
};

const unidadesMedida = [
  { value: 'm³', label: 'Metros cúbicos (m³)' },
  { value: 'Tonelada', label: 'Tonelada' },
  { value: 'Viaje', label: 'Viaje' },
  { value: 'Hora', label: 'Hora' },
  { value: 'Día', label: 'Día' }
];

const estadosServicio = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' }
];

const ServicioForm = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
  isLoading = false,
  error = null,
  ...props
}) => {
  const [formData, setFormData] = useState({
    codigo_servicio: '',
    nombre: '',
    descripcion: '',
    tipo_servicio: 'Local',
    modalidad_servicio: 'REGULAR', // Cambiado: Usar 'REGULAR' que es el valor por defecto para Local
    unidad_medida: 'm³',
    precio_base: '',
    tiempo_estimado: '',
    estado: 'activo',
    condiciones: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [modalidadesDisponibles, setModalidadesDisponibles] = useState(modalidadesPorTipo.Local); // Cambiado: Inicializar con modalidades de Local

  // Obtener modalidades según el tipo de servicio
  const obtenerModalidadesPorTipo = (tipo) => {
    return modalidadesPorTipo[tipo] || modalidadesPorTipo.default;
  };

  // Obtener modalidad por defecto según el tipo de servicio
  const obtenerModalidadPorDefecto = (tipo) => {
    return modalidadPorDefectoPorTipo[tipo] || modalidadesPorTipo.default[0]?.value || 'Carga';
  };

  // Actualizar modalidades cuando cambia el tipo de servicio
  const actualizarModalidadPorTipo = (tipo) => {
    const nuevasModalidades = obtenerModalidadesPorTipo(tipo);
    setModalidadesDisponibles(nuevasModalidades);
    
    // Obtener la modalidad por defecto para el tipo seleccionado
    const modalidadPorDefecto = obtenerModalidadPorDefecto(tipo);
    
    // Actualizar la modalidad si la actual no está en las nuevas modalidades
    const modalidadActual = formData.modalidad_servicio;
    const modalidadExiste = nuevasModalidades.some(m => m.value === modalidadActual);
    
    if (!modalidadExiste) {
      setFormData(prev => ({
        ...prev,
        modalidad_servicio: modalidadPorDefecto
      }));
    }
  };

  useEffect(() => {
    if (initialData) {
      const nuevoFormData = {
        codigo_servicio: initialData.codigo_servicio || '',
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        tipo_servicio: initialData.tipo_servicio || 'Local',
        modalidad_servicio: initialData.modalidad_servicio || obtenerModalidadPorDefecto(initialData.tipo_servicio || 'Local'),
        unidad_medida: initialData.unidad_medida || 'm³',
        precio_base: initialData.precio_base ? initialData.precio_base.toString() : '',
        tiempo_estimado: initialData.tiempo_estimado ? initialData.tiempo_estimado.toString() : '',
        estado: initialData.estado || 'activo',
        condiciones: initialData.condiciones || ''
      };
      
      setFormData(nuevoFormData);
      
      // Actualizar modalidades disponibles según el tipo de servicio
      if (initialData.tipo_servicio) {
        const modalidades = obtenerModalidadesPorTipo(initialData.tipo_servicio);
        setModalidadesDisponibles(modalidades);
      } else {
        // Si no hay tipo de servicio en los datos iniciales, usar Local por defecto
        setModalidadesDisponibles(modalidadesPorTipo.Local);
      }
    } else {
      // Si no hay datos iniciales (creación), inicializar con valores coherentes
      const modalidadInicial = obtenerModalidadPorDefecto('Local');
      setFormData(prev => ({
        ...prev,
        modalidad_servicio: modalidadInicial
      }));
      setModalidadesDisponibles(modalidadesPorTipo.Local);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // No permitir editar el código de servicio
    if (name === "codigo_servicio") return;
    
    // Si cambia el tipo de servicio, actualizar modalidades disponibles
    if (name === "tipo_servicio") {
      actualizarModalidadPorTipo(value);
    }
    
    // Validaciones específicas para campos numéricos
    if (name === 'precio_base') {
      // Permitir solo números y punto decimal
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (name === 'tiempo_estimado') {
      // Permitir solo números enteros
      if (value === '' || /^\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
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

  const validateForm = () => {
    const errors = {};
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre del servicio es requerido';
    } else if (formData.nombre.length < 3 || formData.nombre.length > 100) {
      errors.nombre = 'El nombre debe tener entre 3 y 100 caracteres';
    }
    
    // Validar descripción
    if (formData.descripcion && formData.descripcion.length > 500) {
      errors.descripcion = 'La descripción no debe exceder 500 caracteres';
    }
    
    // Validar tipo de servicio
    if (!formData.tipo_servicio) {
      errors.tipo_servicio = 'El tipo de servicio es requerido';
    }
    
    // Validar modalidad de servicio
    if (!formData.modalidad_servicio) {
      errors.modalidad_servicio = 'La modalidad de servicio es requerida';
    } else {
      // Validar que la modalidad seleccionada esté en las modalidades disponibles
      const modalidadValida = modalidadesDisponibles.some(m => m.value === formData.modalidad_servicio);
      if (!modalidadValida) {
        errors.modalidad_servicio = 'Seleccione una modalidad válida para el tipo de servicio';
      }
    }
    
    // Validar unidad de medida
    if (!formData.unidad_medida) {
      errors.unidad_medida = 'La unidad de medida es requerida';
    }
    
    // Validar precio base
    if (!formData.precio_base.trim()) {
      errors.precio_base = 'El precio base es requerido';
    } else {
      const precio = parseFloat(formData.precio_base);
      if (isNaN(precio)) {
        errors.precio_base = 'El precio debe ser un número válido';
      } else if (precio < 0) {
        errors.precio_base = 'El precio debe ser mayor o igual a 0';
      }
    }
    
    // Validar tiempo estimado (si se proporciona)
    if (formData.tiempo_estimado.trim()) {
      const tiempo = parseInt(formData.tiempo_estimado);
      if (isNaN(tiempo)) {
        errors.tiempo_estimado = 'El tiempo debe ser un número válido';
      } else if (tiempo < 0) {
        errors.tiempo_estimado = 'El tiempo debe ser mayor o igual a 0';
      }
    }
    
    // Validar condiciones (si se proporcionan)
    if (formData.condiciones && formData.condiciones.length > 500) {
      errors.condiciones = 'Las condiciones no deben exceder 500 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Preparar datos para enviar
      const dataToSubmit = {
        ...formData,
        precio_base: parseFloat(formData.precio_base),
        tiempo_estimado: formData.tiempo_estimado ? parseInt(formData.tiempo_estimado) : 0,
        // Limpiar campos vacíos
        descripcion: formData.descripcion || '',
        condiciones: formData.condiciones || null
      };
      
      if (mode === "create") {
        // En creación, no enviamos el código al backend
        const { codigo_servicio, ...restData } = dataToSubmit;
        onSubmit(restData);
      } else {
        // En edición, sí enviamos el código para identificar el servicio
        onSubmit(dataToSubmit);
      }
    }
  };

  const isFormValid = () => {
    return formData.nombre.trim() &&
           formData.tipo_servicio &&
           formData.modalidad_servicio &&
           modalidadesDisponibles.some(m => m.value === formData.modalidad_servicio) &&
           formData.unidad_medida &&
           formData.precio_base.trim() &&
           parseFloat(formData.precio_base) >= 0;
  };

  const getCodigoServicioLabel = () => {
    if (mode === "create") {
      return "Se generará automáticamente";
    } else if (mode === "edit") {
      return formData.codigo_servicio || "No disponible";
    } else {
      return formData.codigo_servicio || "Sin código";
    }
  };

  // Obtener descripción del tipo de servicio para ayuda
  const getDescripcionTipoServicio = (tipo) => {
    switch(tipo) {
      case 'Local':
        return 'Servicios dentro de la ciudad o área local';
      case 'Nacional':
        return 'Servicios a nivel nacional en el país';
      case 'Cuadrilla':
        return 'Servicios realizados por equipos de trabajo';
      case 'Transporte':
        return 'Servicios de transporte de materiales';
      case 'Alquiler':
        return 'Servicios de alquiler de equipos';
      case 'Otros':
        return 'Otros tipos de servicios especiales';
      default:
        return '';
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
        {/* Código de Servicio - solo lectura/visualización */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Servicio
          </label>
          <div className={`w-full px-3 py-2 border border-gray-300 rounded-lg 
            ${mode === 'create' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-700'}`}>
            {getCodigoServicioLabel()}
          </div>
          {mode === 'create' && (
            <p className="mt-1 text-xs text-gray-500">
              El código será generado automáticamente al guardar
            </p>
          )}
          {mode !== 'create' && formData.codigo_servicio && (
            <p className="mt-1 text-xs text-gray-500">
              Código del servicio
            </p>
          )}
        </div>

        <Input
          label="Nombre del Servicio *"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={formErrors.nombre}
          placeholder="Ej: Transporte de Materiales"
          disabled={mode === 'view' || isLoading}
          required
          maxLength={100}
          tooltip="Nombre descriptivo del servicio (3-100 caracteres)"
        />

        {/* Tipo de servicio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Servicio *
            </label>
            <span className="text-xs text-gray-500">
              {getDescripcionTipoServicio(formData.tipo_servicio)}
            </span>
          </div>
          <select
            name="tipo_servicio"
            value={formData.tipo_servicio}
            onChange={handleChange}
            disabled={mode === 'view' || isLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 ${
              formErrors.tipo_servicio ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            {tiposServicio.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
          {formErrors.tipo_servicio && (
            <p className="mt-1 text-sm text-red-600">{formErrors.tipo_servicio}</p>
          )}
        </div>

        {/* Modalidad de servicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modalidad de Servicio *
          </label>
          <select
            name="modalidad_servicio"
            value={formData.modalidad_servicio}
            onChange={handleChange}
            disabled={mode === 'view' || isLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 ${
              formErrors.modalidad_servicio ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            {modalidadesDisponibles.map(modalidad => (
              <option key={modalidad.value} value={modalidad.value}>{modalidad.label}</option>
            ))}
          </select>
          {formErrors.modalidad_servicio && (
            <p className="mt-1 text-sm text-red-600">{formErrors.modalidad_servicio}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.tipo_servicio === 'Local' && 'Modalidades específicas para servicios locales'}
            {formData.tipo_servicio === 'Nacional' && 'Modalidades para servicios nacionales'}
            {formData.tipo_servicio === 'Cuadrilla' && 'Modalidades para servicios de cuadrilla'}
            {(formData.tipo_servicio === 'Transporte' || formData.tipo_servicio === 'Alquiler' || formData.tipo_servicio === 'Otros') && 
             'Modalidades generales para este tipo de servicio'}
          </p>
        </div>

        {/* Unidad de medida */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unidad de Medida *
          </label>
          <select
            name="unidad_medida"
            value={formData.unidad_medida}
            onChange={handleChange}
            disabled={mode === 'view' || isLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 ${
              formErrors.unidad_medida ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            {unidadesMedida.map(unidad => (
              <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
            ))}
          </select>
          {formErrors.unidad_medida && (
            <p className="mt-1 text-sm text-red-600">{formErrors.unidad_medida}</p>
          )}
        </div>

        {/* Estado */}
        <div>
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
            {estadosServicio.map(estado => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {formData.estado === 'activo' ? 'El servicio estará disponible para uso' : 'El servicio no estará disponible'}
          </p>
        </div>

        {/* Precio Base */}
        <Input
          label="Precio Base (S/) *"
          name="precio_base"
          type="text"
          value={formData.precio_base}
          onChange={handleChange}
          error={formErrors.precio_base}
          placeholder="Ej: 150.00"
          disabled={mode === 'view' || isLoading}
          required
          tooltip="Precio base del servicio (debe ser mayor o igual a 0)"
        />

        {/* Tiempo Estimado */}
        <Input
          label="Tiempo Estimado (minutos)"
          name="tiempo_estimado"
          type="text"
          value={formData.tiempo_estimado}
          onChange={handleChange}
          error={formErrors.tiempo_estimado}
          placeholder="Ej: 120"
          disabled={mode === 'view' || isLoading}
          tooltip="Tiempo estimado en minutos (0 para no especificar)"
        />
      </div>

      {/* Descripción */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <span className="text-xs text-gray-500">
            {formData.descripcion.length}/500 caracteres
          </span>
        </div>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          disabled={mode === 'view' || isLoading}
          rows="3"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 ${
            formErrors.descripcion ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descripción detallada del servicio..."
          maxLength={500}
        />
        {formErrors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{formErrors.descripcion}</p>
        )}
      </div>

      {/* Condiciones */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Condiciones Especiales
          </label>
          <span className="text-xs text-gray-500">
            {formData.condiciones.length}/500 caracteres
          </span>
        </div>
        <textarea
          name="condiciones"
          value={formData.condiciones}
          onChange={handleChange}
          disabled={mode === 'view' || isLoading}
          rows="2"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 ${
            formErrors.condiciones ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: Mínimo 5 m³, Máximo 10 horas..."
          maxLength={500}
        />
        {formErrors.condiciones && (
          <p className="mt-1 text-sm text-red-600">{formErrors.condiciones}</p>
        )}
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
            {mode === 'create' ? 'Crear Servicio' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default React.memo(ServicioForm);