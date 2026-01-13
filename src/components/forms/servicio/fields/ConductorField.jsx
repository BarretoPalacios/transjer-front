// components/forms/servicio/fields/ConductorField.jsx - ACTUALIZADO
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';
import QuickPersonalModal from '../modals/QuickPersonalModal';

const ConductorField = ({ 
  value = [], 
  onChange, 
  error, 
  disabled = false,
  required = true,
  label = "Conductores",
  placeholder = "Buscar conductores..."
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTermForModal, setSearchTermForModal] = useState('');

  const fetchConductores = useCallback(async (search = '') => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/personal/', {
        params: {
          nombre_completo: search,
          tipo: 'Conductor',
          estado: 'Activo',
          page: 1,
          page_size: 10
        }
      });
      
      // Normalizar respuesta
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      console.log('Conductores obtenidos:', items);
      
      return {
        items: items,
        total: items.length
      };
    } catch (error) {
      console.error('Error buscando conductores:', error);
      return { items: [], total: 0 };
    }
  }, []);

  const renderOption = useCallback((option, { isSelected, onSelect }) => {
    return (
      <div
        onClick={onSelect}
        className={`px-2 py-1.5 cursor-pointer text-xs transition-colors ${
          isSelected ? 'bg-yellow-50' : 'hover:bg-yellow-50'
        } text-gray-700`}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="font-medium truncate">{option.nombres_completos || 'Sin nombre'}</div>
            {isSelected && (
              <span className="text-green-600 text-xs">✓ Seleccionado</span>
            )}
          </div>
          <div className="text-xs text-gray-500 flex justify-between mt-0.5">
            {option.licencia_conducir && <span>Licencia: {option.licencia_conducir}</span>}
            {option.dni && <span>DNI: {option.dni}</span>}
          </div>
          {option.categoria_licencia && (
            <div className="text-xs text-gray-400 mt-0.5">
              Categoría: {option.categoria_licencia}
            </div>
          )}
        </div>
      </div>
    );
  }, []);

  const getOptionLabel = useCallback((option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    return option.nombres_completos || option.nombre_completo || '';
  }, []);

  const getOptionValue = useCallback((option) => {
    if (!option) return null;
    if (typeof option === 'string') return option;
    return option.id || option._id;
  }, []);

  const handleAddClick = useCallback((searchTerm = '') => {
    setSearchTermForModal(searchTerm);
    setShowModal(true);
  }, []);

  const handleConductorCreated = useCallback((nuevoConductor) => {
    const newValue = [...(value || []), nuevoConductor];
    onChange(newValue);
    setShowModal(false);
  }, [onChange, value]);

  return (
    <>
      <BaseField label={label} error={error} required={required}>
        <AdvancedSearchDropdown
          value={value}
          onChange={onChange}
          fetchOptions={fetchConductores}
          placeholder={placeholder}
          disabled={disabled}
          multiple={true}
          showAddButton={true}
          onAddClick={handleAddClick}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          renderOption={renderOption}
          error={error}
          minSearchChars={1}
          className="w-full"
        />
      </BaseField>

      {showModal && (
        <QuickPersonalModal
          tipo="Conductor"
          onClose={() => setShowModal(false)}
          onSuccess={handleConductorCreated}
          initialSearch={searchTermForModal}
        />
      )}
    </>
  );
};

export default ConductorField;