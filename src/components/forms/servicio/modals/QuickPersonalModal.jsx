// components/forms/servicio/modals/QuickPersonalModal.jsx - ACTUALIZADO
import React, { useState } from 'react';
import axios from 'axios';

const QuickPersonalModal = ({ tipo, onClose, onSuccess, initialSearch = "" }) => {
  const [formData, setFormData] = useState({
    dni: "",
    nombres_completos: initialSearch || "",
    tipo: tipo,
    estado: "Activo",
    licencia_conducir: tipo === 'Conductor' ? "" : undefined,
    categoria_licencia: tipo === 'Conductor' ? "" : undefined,
    telefono: "",
    email: "",
    direccion: "",
    fecha_nacimiento: "",
    turno: "",
    salario: "",
    banco: "",
    numero_cuenta: "",
    contacto_emergencia: "",
    telefono_emergencia: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categoriasLicencia = [
    "A-I", "A-II-a", "A-II-b", "A-III-a", "A-III-b", "A-III-c",
    "B-I", "B-II-a", "B-II-b", "B-III",
    "C-I", "C-II", "C-III"
  ];

  const turnos = ["Mañana", "Tarde", "Noche", "Mixto"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombres_completos.trim()) {
      setErrors({ nombres_completos: "Nombres completos son requeridos" });
      return;
    }

    if (tipo === 'Conductor' && !formData.licencia_conducir.trim()) {
      setErrors({ licencia_conducir: "Licencia de conducir es requerida" });
      return;
    }

    setLoading(true);
    try {
      // Limpiar campos undefined
      const dataToSend = { ...formData };
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === undefined || dataToSend[key] === "") {
          delete dataToSend[key];
        }
      });

      const response = await axios.post('http://127.0.0.1:8000/personal/', dataToSend);
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

  const bgColor = tipo === 'Conductor' ? 'bg-yellow-50' : 'bg-teal-50';
  const textColor = tipo === 'Conductor' ? 'text-yellow-800' : 'text-teal-800';
  const btnColor = tipo === 'Conductor' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-teal-600 hover:bg-teal-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className={`px-4 py-3 border-b flex justify-between items-center ${bgColor}`}>
          <h3 className={`font-medium ${textColor}`}>Nuevo {tipo} Rápido</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres Completos *
              </label>
              <input
                type="text"
                name="nombres_completos"
                value={formData.nombres_completos}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                autoFocus
                required
              />
              {errors.nombres_completos && (
                <p className="mt-1 text-xs text-red-600">{errors.nombres_completos}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="8 dígitos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="999888777"
                />
              </div>
            </div>
            
            {tipo === 'Conductor' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Licencia *
                    </label>
                    <input
                      type="text"
                      name="licencia_conducir"
                      value={formData.licencia_conducir}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Número de licencia"
                      required={tipo === 'Conductor'}
                    />
                    {errors.licencia_conducir && (
                      <p className="mt-1 text-xs text-red-600">{errors.licencia_conducir}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      name="categoria_licencia"
                      value={formData.categoria_licencia}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      {categoriasLicencia.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="ejemplo@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turno
              </label>
              <select
                name="turno"
                value={formData.turno}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Seleccionar turno...</option>
                {turnos.map(turno => (
                  <option key={turno} value={turno}>{turno}</option>
                ))}
              </select>
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
              className={`px-3 py-1.5 text-sm text-white rounded disabled:opacity-50 ${btnColor}`}
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickPersonalModal;