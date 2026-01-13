// components/forms/servicio/modals/QuickProveedorModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

const QuickProveedorModal = ({ onClose, onSuccess, initialSearch = "" }) => {
  const [formData, setFormData] = useState({
    razon_social: initialSearch,
    ruc: "",
    direccion: "",
    telefono: "",
    email: "",
    contacto: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.razon_social.trim()) {
      setErrors({ razon_social: "Razón social es requerida" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/proveedores/', formData);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="px-4 py-3 border-b flex justify-between items-center bg-orange-50">
          <h3 className="font-medium text-orange-800">Nuevo Proveedor Rápido</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón Social *
              </label>
              <input
                type="text"
                name="razon_social"
                value={formData.razon_social}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                autoFocus
                required
              />
              {errors.razon_social && (
                <p className="mt-1 text-xs text-red-600">{errors.razon_social}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUC
              </label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto
              </label>
              <input
                type="text"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickProveedorModal;