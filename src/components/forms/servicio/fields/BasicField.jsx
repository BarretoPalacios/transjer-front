// components/forms/servicio/fields/BasicField.jsx
import React from 'react';
import BaseField from './BaseField';

const BasicField = ({ 
  type = 'text',
  value, 
  onChange, 
  error, 
  disabled = false,
  required = false,
  label,
  placeholder = '',
  min,
  max,
  step,
  rows = 2,
  className = ''
}) => {
  const commonClasses = `w-full px-2 py-1 text-xs border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
    error ? "border-red-300" : "border-gray-300"
  } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`;

  if (type === 'textarea') {
    return (
      <BaseField label={label} error={error} required={required}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={commonClasses}
        />
      </BaseField>
    );
  }

  if (type === 'date' || type === 'time') {
    return (
      <BaseField label={label} error={error} required={required}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={commonClasses}
        />
      </BaseField>
    );
  }

  if (type === 'number') {
    return (
      <BaseField label={label} error={error} required={required}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={commonClasses}
        />
      </BaseField>
    );
  }

  return (
    <BaseField label={label} error={error} required={required}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={commonClasses}
      />
    </BaseField>
  );
};

export default BasicField;