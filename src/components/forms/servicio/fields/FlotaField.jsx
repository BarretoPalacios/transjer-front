// components/forms/servicio/fields/FlotaField.jsx - ACTUALIZADO
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';
import QuickFlotaModal from '../modals/QuickFlotaModal';

const FlotaField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = true,
  label = "Vehículo",
  placeholder = "Buscar por placa..."
}) => {
  const [showModal, setShowModal] = useState(false);

  const fetchFlotas = useCallback(async (search = '') => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/flota/', {
        params: {
          placa: search,
          disponible: true,
          page: 1,
          page_size: 10
        }
      });
      
      return {
        items: response.data.items || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Error buscando flota:', error);
      return { items: [], total: 0 };
    }
  }, []);

  const renderOption = useCallback((option, { isSelected, onSelect }) => {
    return (
      <div
        onClick={onSelect}
        className="px-2 py-1.5 cursor-pointer text-xs transition-colors hover:bg-green-50 text-gray-700"
      >
        <div className="flex flex-col">
          <div className="font-medium truncate">{option.placa}</div>
          <div className="text-xs text-gray-500 flex justify-between mt-0.5">
            <span>{option.tipo_vehiculo || 'Sin tipo'}</span>
            {option.capacidad_m3 && (
              <span className="font-medium text-green-600">{option.capacidad_m3} m³</span>
            )}
          </div>
          {option.marca && option.modelo && (
            <div className="text-xs text-gray-400 mt-0.5">
              {option.marca} {option.modelo}
            </div>
          )}
        </div>
      </div>
    );
  }, []);

  const getOptionLabel = useCallback((option) => {
    if (!option) return '';
    return option.placa || '';
  }, []);

  const handleAddClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleFlotaCreated = useCallback((nuevaFlota) => {
    onChange(nuevaFlota);
    setShowModal(false);
  }, [onChange]);

  return (
    <>
      <BaseField label={label} error={error} required={required}>
        <AdvancedSearchDropdown
          value={value}
          onChange={onChange}
          fetchOptions={fetchFlotas}
          placeholder={placeholder}
          disabled={disabled}
          showAddButton={true}
          onAddClick={handleAddClick}
          getOptionLabel={getOptionLabel}
          renderOption={renderOption}
          error={error}
          minSearchChars={1}
          className="w-full"
        />
      </BaseField>

      {showModal && (
        <QuickFlotaModal
          onClose={() => setShowModal(false)}
          onSuccess={handleFlotaCreated}
        />
      )}
    </>
  );
};

export default FlotaField;