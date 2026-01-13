// components/forms/servicio/modals/QuickCuentaModal.jsx - ACTUALIZADO
import React, { useState } from 'react';
import axios from 'axios';

const QuickCuentaModal = ({ clienteId, onClose, onSuccess, initialSearch = "" }) => {
  const [formData, setFormData] = useState({
    nombre_cuenta: initialSearch || "",
    tipo_pago: "Contado",
    dias_credito: 0,
    limite_credito: 0,
    estado: "activa",
    es_principal: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tiposPago = [
    { value: 'Contado', label: 'CONTADO' },
    { value: 'Credito', label: 'CRÉDITO' }
  ];

  const estados = [
    { value: 'activa', label: 'ACTIVA' },
    { value: 'inactiva', label: 'INACTIVA' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_cuenta.trim()) {
      setErrors({ nombre_cuenta: "Nombre de cuenta es requerido" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://127.0.0.1:8000/clientes/${clienteId}/cuentas/`, {
        ...formData,
        cliente_id: clienteId,
        dias_credito: parseInt(formData.dias_credito) || 0,
        limite_credito: parseFloat(formData.limite_credito) || 0
      });
      console.log("Cuenta creada:", response.data);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="px-4 py-3 border-b flex justify-between items-center bg-purple-50">
          <h3 className="font-medium text-purple-800">Nueva Cuenta</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Cuenta *
              </label>
              <input
                type="text"
                name="nombre_cuenta"
                value={formData.nombre_cuenta}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                autoFocus
                placeholder="Ej: Cuenta Principal"
                required
              />
              {errors.nombre_cuenta && (
                <p className="mt-1 text-xs text-red-600">{errors.nombre_cuenta}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pago
                </label>
                <select
                  name="tipo_pago"
                  value={formData.tipo_pago}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {tiposPago.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {estados.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {formData.tipo_pago === 'Credito' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días de Crédito
                  </label>
                  <input
                    type="number"
                    name="dias_credito"
                    value={formData.dias_credito}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Límite de Crédito
                  </label>
                  <input
                    type="number"
                    name="limite_credito"
                    value={formData.limite_credito}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="es_principal"
                checked={formData.es_principal}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                ¿Es cuenta principal?
              </label>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickCuentaModal;