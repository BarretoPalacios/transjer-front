// components/forms/servicio/fields/HoraCitaField.jsx
import React, { useCallback } from 'react';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';

const HoraCitaField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = false,
  label = "Hora Cita"
}) => {
  // Generar horas con intervalos de 30 minutos
  const generarHoras = useCallback(() => {
    const horas = [];
    for (let hora = 0; hora < 24; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = hora.toString().padStart(2, '0');
        const minutoStr = minuto.toString().padStart(2, '0');
        const horaCompleta = `${horaStr}:${minutoStr}`;
        const horaDisplay = `${horaStr}:${minutoStr} ${hora < 12 ? 'AM' : 'PM'}`;
        
        horas.push({
          id: horaCompleta,
          nombre: horaDisplay,
          value: horaCompleta
        });
      }
    }
    return horas;
  }, []);

  const fetchOptions = useCallback(async (search = '') => {
    const horas = generarHoras();
    
    const filtered = search
      ? horas.filter(hora => 
          hora.nombre.toLowerCase().includes(search.toLowerCase()) ||
          hora.id.includes(search)
        )
      : horas;
    
    return {
      items: filtered,
      total: filtered.length
    };
  }, [generarHoras]);

  const renderOption = useCallback((option, { isSelected, onSelect }) => {
    return (
      <div
        onClick={onSelect}
        className="px-2 py-1.5 cursor-pointer text-xs transition-colors hover:bg-blue-50 text-gray-700"
      >
        <div className="font-medium">{option.nombre}</div>
      </div>
    );
  }, []);

  const getOptionLabel = useCallback((option) => {
    if (!option) return '';
    if (typeof option === 'string') {
      // Si es un string en formato HH:MM, convertirlo a formato display
      const [hora, minuto] = option.split(':');
      const horaNum = parseInt(hora);
      const periodo = horaNum < 12 ? 'AM' : 'PM';
      const horaDisplay = horaNum > 12 ? horaNum - 12 : horaNum;
      return `${horaDisplay}:${minuto} ${periodo}`;
    }
    return option.nombre || '';
  }, []);

  // Convertir el value de string a objeto si es necesario
  const getValue = useCallback(() => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    
    // Buscar la hora en la lista generada
    const horas = generarHoras();
    const horaObj = horas.find(h => h.id === value);
    return horaObj || { id: value, nombre: getOptionLabel(value), value: value };
  }, [value, generarHoras, getOptionLabel]);

  return (
    <BaseField label={label} error={error} required={required}>
      {/* <AdvancedSearchDropdown
        value={getValue()}
        onChange={onChange}
        fetchOptions={fetchOptions}
        placeholder="Seleccionar hora..."
        disabled={disabled}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        error={error}
        minSearchChars={0}
        className="w-full"
        showAddButton={false}
        initialLoad={true}
      /
      > */}
      {/* Opción alternativa simple de select nativo */}
      <div className="mt-1">
        <select
          value={typeof value === 'object' ? value?.id : value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-2 py-1 text-xs border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            error ? "border-red-300" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">Seleccionar hora...</option>
          {generarHoras().map((hora) => (
            <option key={hora.id} value={hora.id}>
              {hora.nombre}
            </option>
          ))}
        </select>
      </div>
    </BaseField>
  );
};

export default HoraCitaField;