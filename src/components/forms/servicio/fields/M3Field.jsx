// components/forms/servicio/fields/M3Field.jsx
import React, { useState, useCallback, useEffect } from 'react';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';

const M3Field = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = true,
  label = "m³",
  placeholder = "Capacidad en m³",
  flota
}) => {
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const m3Options = [
    { id: '5', nombre: '5 m³' },
    { id: '10', nombre: '10 m³' },
    { id: '15', nombre: '15 m³' },
    { id: '20', nombre: '20 m³' },
    { id: '25', nombre: '25 m³' },
    { id: '30', nombre: '30 m³' },
    { id: 'otro', nombre: 'Otro (Personalizado)' }
  ];

  // Cuando se selecciona una flota, usar su capacidad por defecto
  useEffect(() => {
    if (flota?.capacidad_m3 && !value && !showCustomInput) {
      const flotaValue = flota.capacidad_m3.toString();
      const exists = m3Options.some(opt => opt.id === flotaValue);
      
      if (exists) {
        onChange({ id: flotaValue, nombre: `${flotaValue} m³` });
      } else {
        setCustomValue(flotaValue);
        setShowCustomInput(true);
        onChange({ id: flotaValue, nombre: `${flotaValue} m³` });
      }
    }
  }, [flota, value, showCustomInput, onChange]);

  const fetchOptions = useCallback(async (search = '') => {
    const filtered = search
      ? m3Options.filter(option => 
          option.nombre.toLowerCase().includes(search.toLowerCase())
        )
      : m3Options;
    
    return {
      items: filtered,
      total: filtered.length
    };
  }, []);

  const renderOption = useCallback((option, { isSelected, onSelect }) => {
    const isOther = option.id === 'otro';
    
    return (
      <div
        onClick={onSelect}
        className={`px-2 py-1.5 cursor-pointer text-xs transition-colors ${
          isOther ? 'hover:bg-yellow-50' : 'hover:bg-green-50'
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
    if (selected?.id === 'otro') {
      setShowCustomInput(true);
      setCustomValue('');
      onChange('');
    } else {
      setShowCustomInput(false);
      onChange(selected);
    }
  }, [onChange]);

  const handleCustomChange = useCallback((e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setCustomValue(val);
    onChange({ id: val, nombre: `${val} m³` });
  }, [onChange]);

  const handleCancelCustom = useCallback(() => {
    setShowCustomInput(false);
    setCustomValue('');
    onChange(null);
  }, [onChange]);

  const handleUseFlotaCapacity = useCallback(() => {
    if (flota?.capacidad_m3) {
      const capacity = flota.capacidad_m3.toString();
      const exists = m3Options.some(opt => opt.id === capacity);
      
      if (exists) {
        onChange({ id: capacity, nombre: `${capacity} m³` });
      } else {
        setCustomValue(capacity);
        setShowCustomInput(true);
        onChange({ id: capacity, nombre: `${capacity} m³` });
      }
    }
  }, [flota, onChange]);

  if (showCustomInput) {
    return (
      <BaseField label={label} error={error} required={required}>
        <div className="flex space-x-1">
          <input
            type="text"
            value={customValue}
            onChange={handleCustomChange}
            placeholder="Ej: 12.5"
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
      <div className="flex space-x-1">
        <div className="flex-1">
          <AdvancedSearchDropdown
            value={value}
            onChange={handleSelect}
            fetchOptions={fetchOptions}
            placeholder="Seleccionar m³..."
            disabled={disabled}
            getOptionLabel={getOptionLabel}
            renderOption={renderOption}
            error={error}
            minSearchChars={0}
            className="w-full"
            showAddButton={false}
          />
        </div>
        
        {flota?.capacidad_m3 && (
          <button
            type="button"
            onClick={handleUseFlotaCapacity}
            disabled={disabled}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 whitespace-nowrap"
            title="Usar capacidad del vehículo"
          >
            {flota.capacidad_m3}m³
          </button>
        )}
      </div>
    </BaseField>
  );
};

export default M3Field;