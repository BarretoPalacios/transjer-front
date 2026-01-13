// src/components/facturacion/FacturaForm.js
import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import Button from '../../../components/common/Button/Button';

const FacturaForm = ({ initialData, onSubmit, onCancel, mode, isLoading, error, fletes = [] }) => {
  const [formData, setFormData] = useState({
    numero_factura: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    moneda: 'PEN',
    monto: '',
    descripcion: '',
    estado: 'Borrador',
  });

  const [formErrors, setFormErrors] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      const data = {
        numero_factura: initialData.numero_factura || '',
        fecha_emision: initialData.fecha_emision ? initialData.fecha_emision.split('T')[0] : '',
        fecha_vencimiento: initialData.fecha_vencimiento ? initialData.fecha_vencimiento.split('T')[0] : '',
        moneda: initialData.moneda || 'PEN',
        monto: initialData.monto_total?.toString() || '',
        descripcion: initialData.descripcion || '',
        estado: initialData.estado || 'Borrador',
      };
      console.log("data:", initialData);
      
      setFormData(data);
    }
  }, [initialData]);

  // Calcular monto total de fletes si es modo creación
  useEffect(() => {
    if (mode === 'create' && fletes.length > 0) {
      const montoTotal = fletes.reduce((total, flete) => {
        return total + (parseFloat(flete.monto_flete || 0));
      }, 0);
      
      // Generar número de factura sugerido
      const fecha = new Date();
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const numeroSugerido = `FAC-${year}${month}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Configurar fechas
      const fechaEmision = fecha.toISOString().split('T')[0];
      const fechaVencimiento = new Date(fecha.setMonth(fecha.getMonth() + 1))
        .toISOString()
        .split('T')[0];

      setFormData(prev => ({
        ...prev,
        numero_factura: numeroSugerido,
        fecha_emision: fechaEmision,
        fecha_vencimiento: fechaVencimiento,
        monto: montoTotal.toFixed(2),
        descripcion: fletes.length === 1 
          ? `Factura por flete: ${fletes[0]?.codigo_flete || ""}`
          : `Factura por ${fletes.length} fletes`,
      }));
    }
  }, [fletes, mode]);

  // Handler para cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Preparar datos para backend
  const prepareBackendData = () => {
    const formatForBackend = (value) => {
      if (!value && value !== '0') return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    const data = {
      numero_factura: formData.numero_factura || null,
      fecha_emision: formData.fecha_emision || null,
      fecha_vencimiento: formData.fecha_vencimiento || null,
      // estado: formData.estado || null,
      monto_total: formatForBackend(formData.monto),
      moneda: formData.moneda || null,
      descripcion: formData.descripcion || null,
      // es_borrador: formData.estado === 'Borrador',
    };

    // Si es modo creación, incluir fletes
    if (mode === 'create' && fletes.length > 0) {
      data.fletes = fletes.map((flete) => ({ id: flete.id }));
    }

    return data;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.numero_factura.trim()) {
      errors.numero_factura = 'El número de factura es requerido';
    }

    if (!formData.fecha_emision) {
      errors.fecha_emision = 'La fecha de emisión es requerida';
    }

    if (!formData.fecha_vencimiento) {
      errors.fecha_vencimiento = 'La fecha de vencimiento es requerida';
    }

    const montoNum = parseFloat(formData.monto || 0);
    if (!formData.monto || montoNum <= 0) {
      errors.monto = 'El monto debe ser mayor a 0';
    }

    if (formData.fecha_emision && formData.fecha_vencimiento) {
      const emision = new Date(formData.fecha_emision);
      const vencimiento = new Date(formData.fecha_vencimiento);
      
      if (vencimiento < emision) {
        errors.fecha_vencimiento = 'La fecha de vencimiento no puede ser anterior a la fecha de emisión';
      }
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const backendData = prepareBackendData();
    onSubmit(backendData);
  };

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-1.5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Resumen de fletes (solo para creación) */}
      {isCreateMode && fletes.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Fletes a Facturar ({fletes.length})
          </h4>
          <div className="max-h-32 overflow-y-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1.5 text-left font-medium text-gray-700">Código Flete</th>
                  <th className="py-1.5 text-left font-medium text-gray-700">Código Servicio</th>
                  <th className="py-1.5 text-left font-medium text-gray-700">Monto</th>
                </tr>
              </thead>
              <tbody>
                {fletes.map((flete) => (
                  <tr key={flete.id} className="border-b border-gray-100">
                    <td className="py-1.5">{flete.codigo_flete}</td>
                    <td className="py-1.5">{flete.codigo_servicio}</td>
                    <td className="py-1.5">
                      S/. {parseFloat(flete.monto_flete || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-sm font-semibold text-gray-900">
              Total: S/. {fletes.reduce((sum, flete) => sum + parseFloat(flete.monto_flete || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Formulario simplificado */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Número de Factura *
          </label>
          <input
            type="text"
            value={formData.numero_factura}
            onChange={(e) => handleChange('numero_factura', e.target.value)}
            disabled={isViewMode}
            className={`w-full px-2.5 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
              formErrors.numero_factura ? 'border-red-300' : 'border-gray-300'
            } ${isViewMode ? 'bg-gray-100' : ''}`}
            placeholder="Ej: FAC-20240001"
          />
          {formErrors.numero_factura && (
            <p className="mt-0.5 text-xs text-red-600">{formErrors.numero_factura}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha Emisión *
            </label>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <input
                type="date"
                value={formData.fecha_emision}
                onChange={(e) => handleChange('fecha_emision', e.target.value)}
                disabled={isViewMode}
                className={`w-full px-2.5 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                  formErrors.fecha_emision ? 'border-red-300' : 'border-gray-300'
                } ${isViewMode ? 'bg-gray-100' : ''}`}
              />
            </div>
            {formErrors.fecha_emision && (
              <p className="mt-0.5 text-xs text-red-600">{formErrors.fecha_emision}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha Vencimiento *
            </label>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
                disabled={isViewMode}
                className={`w-full px-2.5 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                  formErrors.fecha_vencimiento ? 'border-red-300' : 'border-gray-300'
                } ${isViewMode ? 'bg-gray-100' : ''}`}
              />
            </div>
            {formErrors.fecha_vencimiento && (
              <p className="mt-0.5 text-xs text-red-600">{formErrors.fecha_vencimiento}</p>
            )}
          </div>
        </div>

        {/* <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={formData.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            disabled={isViewMode}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="Borrador">Borrador</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagada">Pagada</option>
          </select>
        </div> */}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Moneda *
          </label>
          <select
            value={formData.moneda}
            onChange={(e) => handleChange('moneda', e.target.value)}
            disabled={isViewMode}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="PEN">Soles (PEN)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Monto Total *
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1.5 text-gray-500 text-sm">
              {formData.moneda === 'PEN' ? 'S/' : '$'}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.monto}
              onChange={(e) => handleChange('monto', e.target.value)}
              disabled={isViewMode}
              className={`w-full pl-8 pr-2.5 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                formErrors.monto ? 'border-red-300' : 'border-gray-300'
              } ${isViewMode ? 'bg-gray-100' : ''}`}
              placeholder="0.00"
            />
          </div>
          {formErrors.monto && (
            <p className="mt-0.5 text-xs text-red-600">{formErrors.monto}</p>
          )}
          {isCreateMode && fletes.length > 0 && (
            <p className="mt-0.5 text-xs text-gray-500">
              Suma automática de fletes: {fletes.reduce((sum, flete) => sum + parseFloat(flete.monto_flete || 0), 0).toFixed(2)} {formData.moneda === 'PEN' ? 'S/' : '$'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            disabled={isViewMode}
            rows="2"
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            placeholder="Descripción de la factura..."
          />
        </div>
      </div>

      {/* Botones de acción */}
      {!isViewMode && (
        <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={isLoading}
            size="small"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            size="small"
          >
            {mode === 'create' ? 'Crear Factura' : 'Actualizar Factura'}
          </Button>
        </div>
      )}

      {isViewMode && (
        <div className="flex justify-end pt-3 border-t border-gray-200">
          <Button
            type="button"
            onClick={onCancel}
            size="small"
          >
            Cerrar
          </Button>
        </div>
      )}
    </form>
  );
};

export default FacturaForm;