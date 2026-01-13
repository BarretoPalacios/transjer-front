// components/forms/servicio/modals/QuickFlotaModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

const QuickFlotaModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    placa: "",
    tipo_vehiculo: "",
    capacidad_m3: "",
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    estado: "DISPONIBLE"
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tiposVehiculo = [
    "CAMION",
    "VOLQUETE", 
    "FURGON",
    "CISTERNA",
    "PLATAFORMA",
    "GRUA",
    "OTRO"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.placa.trim()) {
      setErrors({ placa: "Placa es requerida" });
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        capacidad_m3: formData.capacidad_m3 ? parseFloat(formData.capacidad_m3) : null,
        ano: formData.ano ? parseInt(formData.ano) : null
      };
      
      const response = await axios.post('http://127.0.0.1:8000/flota/', dataToSend);
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-4 py-3 border-b flex justify-between items-center bg-green-50">
          <h3 className="font-medium text-green-800">Nuevo Vehículo Rápido</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placa *
              </label>
              <input
                type="text"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm uppercase"
                autoFocus
                placeholder="Ej: ABC-123"
                required
              />
              {errors.placa && (
                <p className="mt-1 text-xs text-red-600">{errors.placa}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                name="tipo_vehiculo"
                value={formData.tipo_vehiculo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Seleccionar tipo...</option>
                {tiposVehiculo.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad (m³)
              </label>
              <input
                type="number"
                name="capacidad_m3"
                value={formData.capacidad_m3}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Ej: 20"
                step="0.1"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Ej: Volvo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Ej: FH16"
              />
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
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickFlotaModal;