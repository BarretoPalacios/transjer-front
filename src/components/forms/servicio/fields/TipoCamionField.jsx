// components/forms/servicio/fields/TipoCamionField.jsx
import React from 'react';
import BaseField from './BaseField';

const TipoCamionField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = false,
  label = "Tipo de Camión",
  flota
}) => {
  return (
    <BaseField label={label} error={error} required={required}>
      <input
        type="text"
        value={value || flota?.tipo_vehiculo || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || !!flota?.tipo_vehiculo}
        className={`w-full px-2 py-1 text-xs border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-300" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        placeholder={flota?.tipo_vehiculo ? "Automático de la placa" : "Ingrese tipo..."}
      />
      {flota?.tipo_vehiculo && (
        <p className="mt-1 text-xs text-green-600">
          Automático de la placa seleccionada
        </p>
      )}
    </BaseField>
  );
};

export default TipoCamionField;