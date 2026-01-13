// components/forms/servicio/fields/MesField.jsx
import React, { useState, useEffect, useCallback } from 'react';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';

const MesField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = false,
  label = "Mes"
}) => {
  const meses = [
    { id: 'enero', nombre: 'ENERO' },
    { id: 'febrero', nombre: 'FEBRERO' },
    { id: 'marzo', nombre: 'MARZO' },
    { id: 'abril', nombre: 'ABRIL' },
    { id: 'mayo', nombre: 'MAYO' },
    { id: 'junio', nombre: 'JUNIO' },
    { id: 'julio', nombre: 'JULIO' },
    { id: 'agosto', nombre: 'AGOSTO' },
    { id: 'septiembre', nombre: 'SEPTIEMBRE' },
    { id: 'octubre', nombre: 'OCTUBRE' },
    { id: 'noviembre', nombre: 'NOVIEMBRE' },
    { id: 'diciembre', nombre: 'DICIEMBRE' }
  ];

  // Establecer mes actual por defecto
  useEffect(() => {
    if (!value) {
      const mesActual = new Date().toLocaleString('es-ES', { month: 'long' });
      const mesObj = meses.find(m => m.id === mesActual.toLowerCase());
      if (mesObj) {
        onChange(mesObj);
      }
    }
  }, [value, onChange]);

  const fetchOptions = useCallback(async (search = '') => {
    const filtered = search
      ? meses.filter(mes => 
          mes.nombre.toLowerCase().includes(search.toLowerCase())
        )
      : meses;
    
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
    if (typeof option === 'string') return option.toUpperCase();
    return option.nombre || '';
  }, []);

  return (
    <BaseField label={label} error={error} required={required}>
      <AdvancedSearchDropdown
        value={value}
        onChange={onChange}
        fetchOptions={fetchOptions}
        placeholder="Seleccionar mes..."
        disabled={disabled}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        error={error}
        minSearchChars={0}
        className="w-full"
        showAddButton={false}
        initialLoad={true}
      />
    </BaseField>
  );
};

export default MesField;