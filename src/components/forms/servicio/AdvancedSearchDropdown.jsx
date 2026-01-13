// components/common/AdvancedSearchDropdown.jsx - ACTUALIZADO CON TUS ESTILOS
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Check, X, Loader2 } from 'lucide-react';

const AdvancedSearchDropdown = ({
  value,
  onChange,
  fetchOptions,
  placeholder = 'Buscar...',
  disabled = false,
  required = false,
  multiple = false,
  showAddButton = false,
  onAddClick,
  getOptionLabel = (option) => {
    if (!option) return '';
    return option.label || option.nombre || option.razon_social || option.placa || option.numero || String(option);
  },
  getOptionValue = (option) => option?.id || option?.value,
  renderOption,
  className = '',
  error = '',
  minSearchChars = 1,
  debounceDelay = 300,
  initialLoad = true,
  autoFocus = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState(multiple ? (Array.isArray(value) ? value : []) : []);
  const [totalItems, setTotalItems] = useState(0);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Cargar opciones desde API
  const loadOptions = useCallback(async (search = '') => {
    if (!fetchOptions) return;
    
    setLoading(true);
    try {
      const result = await fetchOptions(search);
      setOptions(result.items || result || []);
      setTotalItems(result.total || (result.items ? result.items.length : result.length) || 0);
    } catch (error) {
      console.error('Error loading options:', error);
      setOptions([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [fetchOptions]);

  // Cargar opciones iniciales cuando se abre
  useEffect(() => {
    if (isOpen && initialLoad && searchTerm === '') {
      loadOptions('');
    }
  }, [isOpen, initialLoad, searchTerm, loadOptions]);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchTerm.length >= minSearchChars || searchTerm === '') {
      debounceTimeout.current = setTimeout(() => {
        if (isOpen) {
          loadOptions(searchTerm);
        }
      }, debounceDelay);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, isOpen, minSearchChars, debounceDelay, loadOptions]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar selección simple
  const handleSingleSelect = useCallback((option) => {
    console.log('Seleccionando opción:', option); // Debug
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  }, [onChange]);

  // Manejar selección múltiple
  const handleMultipleSelect = useCallback((option) => {
    const optionValue = getOptionValue(option);
    const isSelected = selectedItems.some(item => getOptionValue(item) === optionValue);
    
    let newSelectedItems;
    if (isSelected) {
      newSelectedItems = selectedItems.filter(item => getOptionValue(item) !== optionValue);
    } else {
      newSelectedItems = [...selectedItems, option];
    }
    
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
    setSearchTerm('');
  }, [selectedItems, onChange, getOptionValue]);

  // Remover item seleccionado (múltiple)
  const removeSelectedItem = useCallback((item, e) => {
    e.stopPropagation();
    const optionValue = getOptionValue(item);
    const newSelectedItems = selectedItems.filter(selected => getOptionValue(selected) !== optionValue);
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  }, [selectedItems, onChange, getOptionValue]);

  // Renderizar opción por defecto (con tus estilos)
  const defaultRenderOption = useCallback((option, { isSelected, onSelect }) => {
    return (
      <div
        onClick={onSelect}
        className={`px-2 py-1.5 cursor-pointer text-xs transition-colors ${
          isSelected 
            ? 'bg-blue-50 text-blue-700' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {multiple && (
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}>
                {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
            )}
            <span className="truncate">{getOptionLabel(option)}</span>
          </div>
          {option.ruc && (
            <span className="text-xs text-gray-500 ml-1">RUC: {option.ruc}</span>
          )}
        </div>
      </div>
    );
  }, [multiple, getOptionLabel]);

  return (
    <div className={`relative text-xs ${className}`} ref={dropdownRef}>
      {/* Input principal - CON TUS ESTILOS */}
      <div className="flex">
        {/* Contenedor principal del input */}
        <div 
          className={`flex-1 flex items-center min-h-[32px] px-2 py-1 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${showAddButton && onAddClick ? 'rounded-l' : 'rounded-l'} bg-white ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          onClick={() => !disabled && !isOpen && setIsOpen(true)}
        >
          {/* Items seleccionados (múltiple) */}
          {multiple && selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedItems.map((item, index) => (
                <div
                  key={getOptionValue(item) || index}
                  className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs"
                >
                  <span className="truncate max-w-[80px]">{getOptionLabel(item)}</span>
                  <button
                    type="button"
                    onClick={(e) => removeSelectedItem(item, e)}
                    className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={selectedItems.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[40px] outline-none bg-transparent text-xs"
                disabled={disabled}
                autoFocus={autoFocus}
              />
            </div>
          )}
          
          {/* Input para selección única */}
          {!multiple && (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm || (value ? getOptionLabel(value) : '')}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="flex-1 outline-none bg-transparent text-xs"
              disabled={disabled}
              required={required}
              autoFocus={autoFocus}
            />
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="ml-1.5">
              <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Botón para agregar nuevo - CON TUS ESTILOS */}
        {showAddButton && onAddClick && (
          <button
            type="button"
            onClick={() => {
              if (searchTerm) {
                onAddClick(searchTerm);
              } else {
                onAddClick();
              }
              setIsOpen(false);
            }}
            className="bg-blue-600 text-white px-2 py-1 border border-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[28px] text-xs"
            title="Agregar nuevo"
            disabled={disabled}
          >
            <span className="font-medium">+</span>
          </button>
        )}

        {/* Botón desplegable - CON TUS ESTILOS */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`px-2 py-1 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${
            showAddButton && onAddClick ? 'border-l-0 rounded-r' : 'rounded-r'
          } bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={disabled}
        >
          <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="mt-0.5 text-xs text-red-600">{error}</p>
      )}

      {/* Dropdown - CON TUS ESTILOS */}
      {isOpen && !disabled && (
        <div 
          className="absolute z-50 w-full mt-0.5 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto text-xs"
          style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          {/* Campo de búsqueda dentro del dropdown */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-1.5 z-10">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Información de resultados */}
          {totalItems > 0 && (
            <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
              {totalItems} resultado{totalItems !== 1 ? 's' : ''}
              {loading && ' • Buscando...'}
            </div>
          )}

          {/* Lista de opciones */}
          <div className="py-0.5">
            {loading && options.length === 0 ? (
              <div className="px-2 py-6 text-center text-gray-500 text-xs">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin mx-auto mb-1.5" />
                <p>Cargando...</p>
              </div>
            ) : options.length === 0 ? (
              <div className="px-2 py-4 text-center text-gray-500 text-xs">
                {searchTerm.length >= minSearchChars 
                  ? 'No se encontraron resultados' 
                  : 'Escriba para buscar'}
              </div>
            ) : (
              options.map((option, index) => {
                const isSelected = multiple && selectedItems.some(item => 
                  getOptionValue(item) === getOptionValue(option)
                );
                
                return renderOption ? (
                  React.cloneElement(renderOption(option, { 
                    isSelected,
                    onSelect: () => multiple ? handleMultipleSelect(option) : handleSingleSelect(option)
                  }), {
                    key: getOptionValue(option) || index
                  })
                ) : (
                  defaultRenderOption(option, {
                    isSelected,
                    onSelect: () => multiple ? handleMultipleSelect(option) : handleSingleSelect(option)
                  })
                );
              })
            )}
          </div>

          {/* Opción para agregar nuevo si no hay resultados */}
          {options.length === 0 && searchTerm.length >= minSearchChars && onAddClick && (
            <div className="border-t border-gray-200 p-1.5">
              <button
                type="button"
                onClick={() => {
                  onAddClick(searchTerm);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full text-left px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1.5 transition-colors"
              >
                <span className="font-medium">+</span>
                <span>Agregar "{searchTerm}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchDropdown;