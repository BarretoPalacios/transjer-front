// components/forms/servicio/modals/QuickClienteModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import ClienteForm from '../../../clientes/ClienteForm'; // Asegúrate de que la ruta sea correcta

const QuickClienteModal = ({ onClose, onSuccess, initialSearch = "" }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Datos iniciales basados en la búsqueda
  const initialData = {
    razon_social: initialSearch,
    tipo_documento: "RUC",
    numero_documento: "",
    estado: "activo",
    tipo_pago: "Contado",
    dias_credito: 0,
  };

  // Manejar el envío del formulario
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Enviar datos al backend
      const response = await axios.post('http://127.0.0.1:8000/clientes/', formData);

      const newClient = response.data;
      
      // Notificar al componente padre
      if (onSuccess) {
        onSuccess(newClient);
      }
      
      // Cerrar el modal
      onClose();
      
    } catch (error) {
      console.error("Error al crear cliente:", error);
      setError(error.message || 'Error al crear el cliente. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
          <h3 className="font-medium text-blue-800 text-lg">Nuevo Cliente Rápido</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* Contenido del Modal con el ClienteForm */}
        <div className="p-6">
          <ClienteForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode="create"
            isLoading={loading}
            error={error}
            className="bg-transparent p-0 shadow-none"
          />
        </div>
      </div>
    </div>
  );
};

export default QuickClienteModal;