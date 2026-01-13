// components/forms/servicio/ServicioCreateForm.jsx - ORDEN CORRECTO
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Importar campos personalizados
import ClienteField from './fields/ClienteField';
import CuentaField from './fields/CuentaField';
import ProveedorField from './fields/ProveedorField';
import M3Field from './fields/M3Field';
import TNField from './fields/TNField';
import FlotaField from './fields/FlotaField';
import ConductorField from './fields/ConductorField';
import AuxiliarField from './fields/AuxiliarField';
import TipoCamionField from './fields/TipoCamionField';
import OrigenField from './fields/OrigenField';
import DestinoField from './fields/DestinoField';
import TipoServicioField from './fields/TipoServicioField';
import ModalidadField from './fields/ModalidadField';
import FechaServicioField from './fields/FechaServicioField';
import FechaSalidaField from './fields/FechaSalidaField';
import HoraCitaField from './fields/HoraCitaField';
import GiaRrField from './fields/GiaRrField';
import GiaRtField from './fields/GiaRtField';
import MesField from './fields/MesField';
import SolicitudField from './fields/SolicitudField';
import ZonaField from './fields/ZonaField';
import ObservacionesField from './fields/ObservacionesField';

const ServicioCreateForm = ({ 
  initialData = null, 
  mode = 'create', 
  onSuccess, 
  onCancel 
}) => {
  // Estado central del formulario
  const [formData, setFormData] = useState({
    cliente: null,
    cuenta: null,
    proveedor: null,
    m3: null,
    tn: '',
    flota: null,
    conductores: [],
    auxiliares: [],
    tipo_camion: '',
    origen: '',
    destino: '',
    tipo_servicio: null,
    modalidad_servicio: null,
    fecha_servicio: new Date().toISOString().split('T')[0],
    fecha_salida: new Date().toISOString().split('T')[0],
    hora_cita: '',
    gia_rr: '',
    gia_rt: '',
    mes: new Date().toLocaleString('es-ES', { month: 'long' }),
    solicitud: 'DIA',
    zona: 'LIMA',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales para edición
  useEffect(() => {
    if (initialData && mode === 'edit') {
      console.log('Cargando datos iniciales:', initialData);
      
      // Normalizar los datos de relaciones para que sean objetos
      const normalizedData = {
        ...initialData,
        // Asegurar que las relaciones sean objetos completos
        cliente: initialData.cliente || null,
        cuenta: initialData.cuenta || null,
        proveedor: initialData.proveedor || null,
        flota: initialData.flota || null,
        conductores: initialData.conductores || [],
        auxiliares: initialData.auxiliares || [],
        tipo_servicio: initialData.tipo_servicio ? 
          { id: initialData.tipo_servicio, nombre: initialData.tipo_servicio } : null,
        modalidad_servicio: initialData.modalidad_servicio ? 
          { id: initialData.modalidad_servicio, nombre: initialData.modalidad_servicio } : null,
        m3: initialData.m3 ? 
          { id: initialData.m3.toString(), nombre: `${initialData.m3} m³` } : null
      };
      
      setFormData(normalizedData);
    }
  }, [initialData, mode]);

  // Actualizar tipo de camión automáticamente cuando se selecciona una placa
  useEffect(() => {
    if (formData.flota?.tipo_vehiculo) {
      setFormData(prev => ({ 
        ...prev, 
        tipo_camion: formData.flota.tipo_vehiculo 
      }));
    }
  }, [formData.flota]);

  // Handler genérico para actualizar cualquier campo
  const handleFieldChange = (fieldName, value) => {
    console.log(`Campo ${fieldName} cambiado:`, value);
    
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Limpiar error del campo al cambiar
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  // Validación
  const validate = () => {
    const newErrors = {};
    
    // Campos requeridos según tu especificación
    if (!formData.cliente) newErrors.cliente = 'Cliente es requerido';
    if (!formData.cuenta) newErrors.cuenta = 'Cuenta es requerida';
    if (!formData.flota) newErrors.flota = 'Placa es requerida';
    if (formData.conductores.length === 0) {
      newErrors.conductores = 'Al menos un conductor es requerido';
    }
    if (!formData.origen?.trim()) newErrors.origen = 'Origen es requerido';
    if (!formData.destino?.trim()) newErrors.destino = 'Destino es requerido';
    if (!formData.tipo_servicio) newErrors.tipo_servicio = 'Tipo de servicio es requerido';
    if (!formData.modalidad_servicio) newErrors.modalidad_servicio = 'Modalidad es requerida';
    if (!formData.fecha_servicio) newErrors.fecha_servicio = 'Fecha de servicio es requerida';
    
    // Validar fecha de servicio no inferior a la fecha actual
    const today = new Date().toISOString().split('T')[0];
    if (formData.fecha_servicio < today) {
      newErrors.fecha_servicio = 'La fecha de servicio no puede ser anterior a hoy';
    }
    
    // Validar fecha de salida no más de 1 día de adelanto sobre fecha de servicio
    if (formData.fecha_salida) {
      const fechaServicio = new Date(formData.fecha_servicio);
      const fechaSalida = new Date(formData.fecha_salida);
      const diffDays = Math.floor((fechaSalida - fechaServicio) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        newErrors.fecha_salida = 'La fecha de salida no puede ser más de 1 día después de la fecha de servicio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// En la función extractId del ServicioCreateForm.jsx
const extractId = (field) => {
  if (!field) return null;
  if (typeof field === 'object') {
    // Para cuentas sin ID, usar el nombre de cuenta
    return field.nombre_cuenta || field.id;
  }
  return field;
};

// En la función extractValue
const extractValue = (field) => {
  if (!field) return null;
  if (typeof field === 'object') {
    // Para cuentas, devolver el nombre
    return field.nombre_cuenta || field.id || field.value || field;
  }
  return field;
};

  // Enviar datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Validando formulario...');
    
    if (!validate()) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    console.log('Enviando formulario...');
    console.log('Datos del formulario:', formData);

    setLoading(true);
    
    try {
      // Preparar datos para API
      const dataToSend = {
        // Campos básicos
        m3: formData.m3 ? parseFloat(extractValue(formData.m3)) || 0 : 0,
        tn: parseFloat(formData.tn) || 0,
        origen: formData.origen,
        destino: formData.destino,
        tipo_servicio: extractValue(formData.tipo_servicio),
        modalidad_servicio: extractValue(formData.modalidad_servicio),
        fecha_servicio: formData.fecha_servicio,
        fecha_salida: formData.fecha_salida,
        hora_cita: formData.hora_cita,
        tipo_camion: formData.tipo_camion || formData.flota?.tipo_vehiculo || '',
        zona: formData.zona,
        observaciones: formData.observaciones || '',
        gia_rr: formData.gia_rr || '',
        gia_rt: formData.gia_rt || '',
        mes: formData.mes,
        solicitud: formData.solicitud,
        
        // IDs de relaciones
        cliente_id: extractId(formData.cliente),
        proveedor_id: extractId(formData.proveedor),
        cuenta_id: extractId(formData.cuenta),
        flota_id: extractId(formData.flota),
        conductores_ids: formData.conductores.map(c => extractId(c)).filter(id => id),
        auxiliares_ids: formData.auxiliares.map(a => extractId(a)).filter(id => id)
      };

      console.log('Datos a enviar a API:', dataToSend);

      const endpoint = mode === 'edit' && initialData?.id
        ? `http://127.0.0.1:8000/servicios/${initialData.id}/`
        : 'http://127.0.0.1:8000/servicios/';
      
      const method = mode === 'edit' ? 'put' : 'post';
      
      const response = await axios({
        method,
        url: endpoint,
        data: dataToSend,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta de API:', response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      alert(mode === 'create' ? 'Servicio creado exitosamente' : 'Servicio actualizado');
      
    } catch (error) {
      console.error('Error al guardar:', error);
      
      if (error.response?.data) {
        // Mostrar errores específicos de la API
        const apiErrors = error.response.data;
        const fieldErrors = {};
        
        Object.keys(apiErrors).forEach(key => {
          if (typeof apiErrors[key] === 'string') {
            fieldErrors[key] = apiErrors[key];
          } else if (Array.isArray(apiErrors[key])) {
            fieldErrors[key] = apiErrors[key].join(', ');
          }
        });
        
        setErrors(fieldErrors);
        
        if (Object.keys(fieldErrors).length > 0) {
          alert('Errores en el formulario: ' + Object.values(fieldErrors).join(', '));
        } else {
          alert('Error al guardar el servicio');
        }
      } else {
        alert('Error al guardar el servicio: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* FILA 1: CLIENTE */}
        <div>
          <ClienteField
            value={formData.cliente}
            onChange={(value) => handleFieldChange('cliente', value)}
            error={errors.cliente}
            disabled={loading}
            autoFocus={mode === 'create'}
          />
        </div>

        {/* FILA 1: CUENTAS */}
        <div>
          <CuentaField
            value={formData.cuenta}
            onChange={(value) => handleFieldChange('cuenta', value)}
            error={errors.cuenta}
            disabled={loading || !formData.cliente}
            clienteId={formData.cliente?.id}
          />
        </div>

        {/* FILA 1: PROVEEDOR */}
        <div>
          <ProveedorField
            value={formData.proveedor}
            onChange={(value) => handleFieldChange('proveedor', value)}
            error={errors.proveedor}
            disabled={loading}
          />
        </div>

        {/* FILA 2: M3 */}
        <div>
          <M3Field
            value={formData.m3}
            onChange={(value) => handleFieldChange('m3', value)}
            error={errors.m3}
            disabled={loading}
            flota={formData.flota}
          />
        </div>

        {/* FILA 2: TONELADAS */}
        <div>
          <TNField
            value={formData.tn}
            onChange={(value) => handleFieldChange('tn', value)}
            error={errors.tn}
            disabled={loading}
            placeholder="Peso en toneladas"
          />
        </div>

        {/* FILA 2: PLACA */}
        <div>
          <FlotaField
            value={formData.flota}
            onChange={(value) => handleFieldChange('flota', value)}
            error={errors.flota}
            disabled={loading}
            label="Placa"
            placeholder="Buscar placa..."
          />
        </div>

        {/* FILA 3: CONDUCTOR */}
        <div>
          <ConductorField
            value={formData.conductores}
            onChange={(value) => handleFieldChange('conductores', value)}
            error={errors.conductores}
            disabled={loading}
          />
        </div>

        {/* FILA 3: AUXILIAR */}
        <div>
          <AuxiliarField
            value={formData.auxiliares}
            onChange={(value) => handleFieldChange('auxiliares', value)}
            disabled={loading}
          />
        </div>

        {/* FILA 3: TIPO DE CAMIÓN (Automático) */}
        <div>
          <TipoCamionField
            value={formData.tipo_camion}
            onChange={(value) => handleFieldChange('tipo_camion', value)}
            disabled={loading || !formData.flota}
            flota={formData.flota}
          />
        </div>

        {/* FILA 4: ORIGEN */}
        <div>
          <OrigenField
            value={formData.origen}
            onChange={(value) => handleFieldChange('origen', value)}
            error={errors.origen}
            disabled={loading}
            placeholder="Ej: Lima, Callao..."
          />
        </div>

        {/* FILA 4: DESTINO */}
        <div>
          <DestinoField
            value={formData.destino}
            onChange={(value) => handleFieldChange('destino', value)}
            error={errors.destino}
            disabled={loading}
            placeholder="Ej: Arequipa, Trujillo..."
          />
        </div>

        {/* FILA 4: TIPO DE SERVICIO */}
        <div>
          <TipoServicioField
            value={formData.tipo_servicio}
            onChange={(value) => handleFieldChange('tipo_servicio', value)}
            error={errors.tipo_servicio}
            disabled={loading}
          />
        </div>

        {/* FILA 5: MODALIDAD DE SERVICIO */}
        <div>
          <ModalidadField
            value={formData.modalidad_servicio}
            onChange={(value) => handleFieldChange('modalidad_servicio', value)}
            error={errors.modalidad_servicio}
            disabled={loading}
          />
        </div>

        {/* FILA 5: FECHA DE SERVICIO */}
        <div>
          <FechaServicioField
            value={formData.fecha_servicio}
            onChange={(value) => handleFieldChange('fecha_servicio', value)}
            error={errors.fecha_servicio}
            disabled={loading}
            required={true}
            minDate={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* FILA 5: FECHA DE SALIDA */}
        <div>
          <FechaSalidaField
            value={formData.fecha_salida}
            onChange={(value) => handleFieldChange('fecha_salida', value)}
            error={errors.fecha_salida}
            disabled={loading}
            minDate={formData.fecha_servicio}
            maxDate={formData.fecha_servicio ? 
              new Date(new Date(formData.fecha_servicio).getTime() + 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0] : 
              undefined
            }
          />
        </div>

        {/* FILA 6: HORA DE CITA */}
        <div>
          <HoraCitaField
            value={formData.hora_cita}
            onChange={(value) => handleFieldChange('hora_cita', value)}
            error={errors.hora_cita}
            disabled={loading}
            step="30"
          />
        </div>

        {/* FILA 6: GIA R REMITENTE */}
        <div>
          <GiaRrField
            value={formData.gia_rr}
            onChange={(value) => handleFieldChange('gia_rr', value)}
            disabled={loading}
            placeholder="Número de GIA RR..."
          />
        </div>

        {/* FILA 6: GIA R TRANSPORTISTA */}
        <div>
          <GiaRtField
            value={formData.gia_rt}
            onChange={(value) => handleFieldChange('gia_rt', value)}
            disabled={loading}
            placeholder="Número de GIA RT..."
          />
        </div>

        {/* FILA 7: MES */}
        <div>
          <MesField
            value={formData.mes}
            onChange={(value) => handleFieldChange('mes', value)}
            disabled={loading}
          />
        </div>

        {/* FILA 7: SOLICITUD */}
        <div>
          <SolicitudField
            value={formData.solicitud}
            onChange={(value) => handleFieldChange('solicitud', value)}
            disabled={loading}
          />
        </div>

        {/* FILA 7: ZONA */}
        <div>
          <ZonaField
            value={formData.zona}
            onChange={(value) => handleFieldChange('zona', value)}
            disabled={loading}
          />
        </div>

        {/* FILA 8: OBSERVACIONES (full width) */}
        <div className="md:col-span-3">
          <ObservacionesField
            value={formData.observaciones}
            onChange={(value) => handleFieldChange('observaciones', value)}
            disabled={loading}
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : (
            mode === 'create' ? 'Crear Servicio' : 'Actualizar Servicio'
          )}
        </button>
      </div>
    </form>
  );
};

export default ServicioCreateForm;