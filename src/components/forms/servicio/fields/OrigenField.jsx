// components/forms/servicio/fields/OrigenField.jsx
import React from 'react';
import BaseField from './BaseField';

const OrigenField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = true,
  label = "Origen",
  placeholder = "Ej: Lima, Callao..."
}) => {
  return (
    <BaseField label={label} error={error} required={required}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-2 py-1 text-xs border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-300" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
    </BaseField>
  );
};

export default OrigenField;