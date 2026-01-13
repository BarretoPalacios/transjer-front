// components/forms/servicio/fields/TipoServicioField.jsx
import React, { useState, useCallback } from 'react';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';

const TipoServicioField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = true,
  label = "Tipo de Servicio"
}) => {
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const tiposServicio = [
    { id: 'LOCAL', nombre: 'LOCAL' },
    { id: 'NACIONAL', nombre: 'NACIONAL' },
    { id: 'CUADRILLA', nombre: 'CUADRILLA' },
    { id: 'OTRO', nombre: 'OTRO (Personalizado)' }
  ];

  const fetchOptions = useCallback(async (search = '') => {
    const filtered = search
      ? tiposServicio.filter(tipo => 
          tipo.nombre.toLowerCase().includes(search.toLowerCase())
        )
      : tiposServicio;
    
    return {
      items: filtered,
      total: filtered.length
    };
  }, []);

  const renderOption = useCallback((option, { isSelected, onSelect }) => {
    const isOther = option.id === 'OTRO';
    
    return (
      <div
        onClick={onSelect}
        className={`px-2 py-1.5 cursor-pointer text-xs transition-colors ${
          isOther ? 'hover:bg-yellow-50' : 'hover:bg-blue-50'
        } text-gray-700`}
      >
        <div className="font-medium">
          {option.nombre}
          {isOther && (
            <span className="ml-1 text-xs text-yellow-600">(Personalizado)</span>
          )}
        </div>
      </div>
    );
  }, []);

  const getOptionLabel = useCallback((option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    return option.nombre || '';
  }, []);

  const handleSelect = useCallback((selected) => {
    if (selected?.id === 'OTRO') {
      setShowCustomInput(true);
      onChange('');
    } else {
      setShowCustomInput(false);
      onChange(selected);
    }
  }, [onChange]);

  const handleCustomChange = useCallback((e) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange({ id: val, nombre: val });
  }, [onChange]);

  const handleCancelCustom = useCallback(() => {
    setShowCustomInput(false);
    setCustomValue('');
    onChange(null);
  }, [onChange]);

  if (showCustomInput) {
    return (
      <BaseField label={label} error={error} required={required}>
        <div className="flex space-x-1">
          <input
            type="text"
            value={customValue}
            onChange={handleCustomChange}
            placeholder="Ingrese tipo personalizado..."
            disabled={disabled}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCancelCustom}
            disabled={disabled}
            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            ×
          </button>
        </div>
      </BaseField>
    );
  }

  return (
    <BaseField label={label} error={error} required={required}>
      <AdvancedSearchDropdown
        value={value}
        onChange={handleSelect}
        fetchOptions={fetchOptions}
        placeholder="Seleccionar tipo..."
        disabled={disabled}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        error={error}
        minSearchChars={0}
        className="w-full"
        showAddButton={false}
      />
    </BaseField>
  );
};

export default TipoServicioField;