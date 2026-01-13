// components/forms/servicio/fields/ZonaField.jsx
import React, { useCallback } from 'react';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';

const ZonaField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = true,
  label = "Zona"
}) => {
  const zonas = [
    { id: 'LIMA', nombre: 'LIMA' },
    { id: 'PROVINCIA', nombre: 'PROVINCIA' }
  ];

  const fetchOptions = useCallback(async (search = '') => {
    const filtered = search
      ? zonas.filter(zona => 
          zona.nombre.toLowerCase().includes(search.toLowerCase())
        )
      : zonas;
    
    return {
      items: filtered,
      total: filtered.length
    };
  }, []);

  const renderOption = useCallback((option, { isSelected, onSelect }) => {
    return (
      <div
        onClick={onSelect}
        className="px-2 py-1.5 cursor-pointer text-xs transition-colors hover:bg-gray-100 text-gray-700"
      >
        <div className="font-medium">{option.nombre}</div>
      </div>
    );
  }, []);

  const getOptionLabel = useCallback((option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    return option.nombre || '';
  }, []);

  return (
    <BaseField label={label} error={error} required={required}>
      <AdvancedSearchDropdown
        value={value}
        onChange={onChange}
        fetchOptions={fetchOptions}
        placeholder="Seleccionar zona..."
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

export default ZonaField;