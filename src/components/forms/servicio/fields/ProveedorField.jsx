// components/forms/servicio/fields/ProveedorField.jsx - ACTUALIZADO
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';
import QuickProveedorModal from '../modals/QuickProveedorModal';

const ProveedorField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = false,
  label = "Proveedor",
  placeholder = "Buscar proveedor..."
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTermForModal, setSearchTermForModal] = useState('');

  const fetchProveedores = useCallback(async (search = '') => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/proveedores/', {
        params: {
          razon_social: search,
          page: 1,
          page_size: 10
        }
      });
      
      return {
        items: response.data.items || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Error buscando proveedores:', error);
      return { items: [], total: 0 };
    }
  }, []);

  const renderOption = useCallback((option, { isSelected, onSelect }) => {
    return (
      <div
        onClick={onSelect}
        className="px-2 py-1.5 cursor-pointer text-xs transition-colors hover:bg-orange-50 text-gray-700"
      >
        <div className="flex flex-col">
          <div className="font-medium truncate">{option.razon_social}</div>
          <div className="text-xs text-gray-500 flex justify-between mt-0.5">
            {option.ruc && <span>RUC: {option.ruc}</span>}
            {option.contacto && <span className="truncate max-w-[150px]">Contacto: {option.contacto}</span>}
          </div>
        </div>
      </div>
    );
  }, []);

  const getOptionLabel = useCallback((option) => {
    if (!option) return '';
    return option.razon_social || '';
  }, []);

  const handleAddClick = useCallback((searchTerm = '') => {
    setSearchTermForModal(searchTerm);
    setShowModal(true);
  }, []);

  const handleProveedorCreated = useCallback((nuevoProveedor) => {
    onChange(nuevoProveedor);
    setShowModal(false);
  }, [onChange]);

  return (
    <>
      <BaseField label={label} error={error} required={required}>
        <AdvancedSearchDropdown
          value={value}
          onChange={onChange}
          fetchOptions={fetchProveedores}
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
        <QuickProveedorModal
          onClose={() => setShowModal(false)}
          onSuccess={handleProveedorCreated}
          initialSearch={searchTermForModal}
        />
      )}
    </>
  );
};

export default ProveedorField;