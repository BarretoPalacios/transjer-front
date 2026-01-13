// components/forms/servicio/fields/TNField.jsx
import React from 'react';
import BaseField from './BaseField';

const TNField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = false,
  label = "TN",
  placeholder = "Peso en toneladas"
}) => {
  return (
    <BaseField label={label} error={error} required={required}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        step="0.1"
        min="0"
        className={`w-full px-2 py-1 text-xs border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-300" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
    </BaseField>
  );
};

export default TNField;