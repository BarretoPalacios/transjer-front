// components/forms/servicio/fields/BaseField.jsx
import React from 'react';

const BaseField = ({ 
  children, 
  label, 
  error, 
  required = false, 
  className = "",
  helpText = ""
}) => {
  return (
    <div className={`text-xs ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-0.5 text-xs text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-0.5 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default BaseField;