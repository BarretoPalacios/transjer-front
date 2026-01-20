import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  Car,
  DollarSign,
  FileText,
  MapPin,
  Globe,
  Save,
  PlusCircle,
  MinusCircle,
  RefreshCw,
} from "lucide-react";

// Componente para el campo de valor numérico
const ValorInput = React.memo(({ value, onChange, disabled, placeholder = "0.00" }) => {
  const handleChange = (e) => {
    // Permitir solo números y punto decimal
    const inputValue = e.target.value;
    
    // Validar que sea un número válido o esté vacío
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        S/
      </span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
  );
});

  const getFechaLocal = () => {
  const hoy = new Date();
  // Ajustamos la fecha restando el desfase de la zona horaria en milisegundos
  const offset = hoy.getTimezoneOffset() * 60000;
  const local = new Date(hoy.getTime() - offset);
  return local.toISOString().split("T")[0];
};

const GastoForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  mode = "create",
  error = null,
  tiposPredefinidos = [],
}) => {
    
  // Estados
  const [formData, setFormData] = useState({
    placa: "",
    ambito: "local",
    fecha_gasto: getFechaLocal(),
    detalles_gastos: [
      {
        tipo_gasto: "",
        tipo_gasto_personalizado: "",
        valor: "",
        observacion: ""
      }
    ],
    estado: "pendiente",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Referencias para mantener el foco
  const placaInputRef = useRef(null);
  const detallesInputsRef = useRef([]);

  // Inicializar formulario
  useEffect(() => {
    if (initialData) {
      setFormData({
        placa: initialData.placa || "",
        ambito: initialData.ambito || "local",
        fecha_gasto: initialData.fecha_gasto ? 
          new Date(initialData.fecha_gasto).toISOString().split("T")[0] : 
          getFechaLocal(),
        detalles_gastos: initialData.detalles_gastos || [{
          tipo_gasto: "",
          tipo_gasto_personalizado: "",
          valor: "",
          observacion: ""
        }],
        estado: initialData.estado || "pendiente",
      });
    } else {
      // Resetear a valores por defecto
      setFormData({
        placa: "",
        ambito: "local",
        fecha_gasto: getFechaLocal(),
        detalles_gastos: [
          {
            tipo_gasto: "",
            tipo_gasto_personalizado: "",
            valor: "",
            observacion: ""
          }
        ],
        estado: "pendiente",
      });
    }

    // Enfocar el primer input después de un pequeño delay
    setTimeout(() => {
      if (placaInputRef.current) {
        placaInputRef.current.focus();
      }
    }, 100);
  }, [initialData]);

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetalleChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const nuevosDetalles = [...prev.detalles_gastos];
      const nuevoDetalle = { ...nuevosDetalles[index] };
      
      nuevoDetalle[field] = value;
      
      // Si cambia tipo_gasto y no es "Personalizado", limpiar campo personalizado
      if (field === 'tipo_gasto' && value !== 'Personalizado') {
        nuevoDetalle.tipo_gasto_personalizado = '';
      }
      
      nuevosDetalles[index] = nuevoDetalle;
      
      return {
        ...prev,
        detalles_gastos: nuevosDetalles
      };
    });
  }, []);

  const agregarDetalle = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      detalles_gastos: [
        ...prev.detalles_gastos,
        {
          tipo_gasto: "",
          tipo_gasto_personalizado: "",
          valor: "",
          observacion: ""
        }
      ]
    }));
    
    // Enfocar el nuevo input después de agregarlo
    setTimeout(() => {
      const lastIndex = formData.detalles_gastos.length;
      if (detallesInputsRef.current[lastIndex]) {
        detallesInputsRef.current[lastIndex].focus();
      }
    }, 100);
  }, [formData.detalles_gastos.length]);

  const eliminarDetalle = useCallback((index) => {
    if (formData.detalles_gastos.length > 1) {
      setFormData(prev => ({
        ...prev,
        detalles_gastos: prev.detalles_gastos.filter((_, i) => i !== index)
      }));
    }
  }, [formData.detalles_gastos.length]);

  // Función para formatear moneda
  const formatMoneda = (valor) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor || 0);
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!formData.placa.trim()) {
      return "La placa es obligatoria";
    }

    if (formData.detalles_gastos.length === 0) {
      return "Debe agregar al menos un detalle de gasto";
    }

    for (let i = 0; i < formData.detalles_gastos.length; i++) {
      const detalle = formData.detalles_gastos[i];
      
      if (!detalle.tipo_gasto) {
        return `El tipo de gasto es obligatorio en el detalle ${i + 1}`;
      }
      
      if (!detalle.valor || parseFloat(detalle.valor) <= 0) {
        return `El valor es obligatorio y debe ser mayor a 0 en el detalle ${i + 1}`;
      }
      
      if (detalle.tipo_gasto === 'Personalizado' && !detalle.tipo_gasto_personalizado?.trim()) {
        return `Debe especificar el tipo de gasto personalizado en el detalle ${i + 1}`;
      }
    }

    return "";
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setFormError(errorValidacion);
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Preparar datos para enviar
      const datosParaEnviar = {
        ...formData,
        detalles_gastos: formData.detalles_gastos.map(detalle => ({
          ...detalle,
          valor: parseFloat(detalle.valor) || 0
        }))
      };

      await onSubmit(datosParaEnviar);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isViewMode = mode === "view";
  const totalGasto = formData.detalles_gastos.reduce((sum, detalle) => 
    sum + (parseFloat(detalle.valor) || 0), 0);

  // Limpiar referencias de inputs
  detallesInputsRef.current = [];


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mostrar errores */}
      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error || formError}
        </div>
      )}

      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Placa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-2 text-gray-400" />
              Placa del Vehículo
            </div>
          </label>
          <input
            ref={placaInputRef}
            type="text"
            name="placa"
            value={formData.placa}
            onChange={handleFormChange}
            placeholder="Ej: ABC-123"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
            required
            readOnly={isViewMode}
          />
        </div>

        {/* Ámbito */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              {formData.ambito === "local" ? (
                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
              ) : (
                <Globe className="h-4 w-4 mr-2 text-purple-500" />
              )}
              Ámbito
            </div>
          </label>
          {isViewMode ? (
            <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50">
              {formData.ambito === "local" ? "Local" : "Nacional"}
            </div>
          ) : (
            <select
              name="ambito"
              value={formData.ambito}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            >
              <option value="local">Local</option>
              <option value="nacional">Nacional</option>
            </select>
          )}
        </div>

        {/* Fecha de Gasto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              Fecha de Gasto
            </div>
          </label>
          <input
            type="date"
            name="fecha_gasto"
            value={formData.fecha_gasto}
            onChange={handleFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
            readOnly={isViewMode}
          />
        </div>
      </div>

      {/* Detalles de Gastos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Detalles de Gastos
          </label>
          {!isViewMode && (
            <button
              type="button"
              onClick={agregarDetalle}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Agregar Gasto
            </button>
          )}
        </div>

        {formData.detalles_gastos.map((detalle, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Gasto {index + 1}
              </span>
              {!isViewMode && formData.detalles_gastos.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarDetalle(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar este gasto"
                >
                  <MinusCircle className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Tipo de Gasto */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Tipo de Gasto
                </label>
                {isViewMode ? (
                  <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50">
                    {detalle.tipo_gasto}
                    {detalle.tipo_gasto === 'Personalizado' && detalle.tipo_gasto_personalizado && (
                      <span className="text-gray-500 ml-1">({detalle.tipo_gasto_personalizado})</span>
                    )}
                  </div>
                ) : (
                  <select
                    value={detalle.tipo_gasto}
                    onChange={(e) => handleDetalleChange(index, 'tipo_gasto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposPredefinidos.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Valor */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Valor (S/)
                </label>
                {isViewMode ? (
                  <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50 font-bold">
                    {formatMoneda(detalle.valor)}
                  </div>
                ) : (
                  <ValorInput
                    value={detalle.valor}
                    onChange={(value) => handleDetalleChange(index, 'valor', value)}
                    disabled={isViewMode}
                    placeholder="0.00"
                  />
                )}
              </div>
            </div>

            {/* Tipo de Gasto Personalizado */}
            {detalle.tipo_gasto === 'Personalizado' && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Especificar tipo de gasto
                </label>
                {isViewMode ? (
                  <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50">
                    {detalle.tipo_gasto_personalizado}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={detalle.tipo_gasto_personalizado}
                    onChange={(e) => handleDetalleChange(index, 'tipo_gasto_personalizado', e.target.value)}
                    placeholder="Ingrese el tipo de gasto personalizado"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required={detalle.tipo_gasto === 'Personalizado'}
                  />
                )}
              </div>
            )}

            {/* Observación */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Observación
              </label>
              {isViewMode ? (
                <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50">
                  {detalle.observacion || "Sin observación"}
                </div>
              ) : (
                <textarea
                  ref={el => detallesInputsRef.current[index] = el}
                  value={detalle.observacion}
                  onChange={(e) => handleDetalleChange(index, 'observacion', e.target.value)}
                  placeholder="Detalles adicionales del gasto..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
        <span className="text-lg font-bold text-gray-800">Total:</span>
        <span className="text-2xl font-bold text-green-600">
          {formatMoneda(totalGasto)}
        </span>
      </div>

      {/* Nota sobre ámbito */}
      {mode === "create" && formData.ambito === "nacional" && (
        <div className="bg-purple-50 border border-purple-200 rounded p-3">
          <p className="text-sm text-purple-700">
            <strong>Nota:</strong> Para gastos nacionales, puedes agregar múltiples gastos 
            usando el botón "Agregar Gasto". Todos los gastos se registrarán bajo la misma placa.
          </p>
        </div>
      )}

      {/* Botones (solo en modo crear/editar) */}
      {!isViewMode && (
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded text-sm font-medium text-white ${
              formData.ambito === "local"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-purple-600 hover:bg-purple-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                Guardando...
              </>
            ) : mode === "create" ? (
              <>
                <Save className="h-4 w-4 inline mr-2" />
                Registrar Gastos
              </>
            ) : (
              <>
                <Save className="h-4 w-4 inline mr-2" />
                Actualizar Gastos
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};

export default React.memo(GastoForm);