// components/forms/servicio/fields/FechaSalidaField.jsx
import React from 'react';
import BaseField from './BaseField';

const FechaSalidaField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = false,
  label = "Fecha Salida"
}) => {
  return (
    <BaseField label={label} error={error} required={required}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-2 py-1 text-xs border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-300" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
    </BaseField>
  );
};

export default FechaSalidaField;