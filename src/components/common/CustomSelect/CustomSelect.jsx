// common/CustomSelect/CustomSelect.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check, Loader2 } from 'lucide-react';

const CustomSelect = ({
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = 'Seleccionar...',
  error,
  isRequired = false,
  searchable = true,
  loading = false,
  formatOptionLabel,
  getOptionValue = (option) => option?.value || option?.id || option,
  getOptionLabel = (option) => option?.label || option?.nombre || option?.toString(),
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsRef = useRef([]);

  // Filtrar opciones basadas en búsqueda
  const filteredOptions = searchTerm.trim() 
    ? options.filter(option => {
        const label = getOptionLabel(option).toLowerCase();
        const value = getOptionValue(option).toString().toLowerCase();
        const search = searchTerm.toLowerCase();
        return label.includes(search) || value.includes(search);
      })
    : options;

  // Encontrar opción seleccionada
  const selectedOption = options.find(opt => 
    getOptionValue(opt) === (value ? getOptionValue(value) : value)
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Efectos
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  // Scroll a opción destacada
  useEffect(() => {
    if (isOpen && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex, isOpen]);

  // Render
  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        {/* Campo principal */}
        <div
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className={`
            w-full min-h-[48px] px-3 py-3 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200 ease-in-out
            flex items-center justify-between
            cursor-pointer select-none
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        >
          <div className="flex-1 truncate text-left">
            {selectedOption ? (
              formatOptionLabel ? (
                formatOptionLabel(selectedOption)
              ) : (
                <span className="text-gray-900">{getOptionLabel(selectedOption)}</span>
              )
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
            
            {selectedOption && !disabled && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded"
                title="Limpiar selección"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-8 text-center text-gray-500">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedOption && 
                    getOptionValue(selectedOption) === getOptionValue(option);
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={getOptionValue(option)}
                      ref={el => optionsRef.current[index] = el}
                      onClick={() => handleSelect(option)}
                      className={`
                        px-3 py-3 cursor-pointer transition-colors flex items-center justify-between
                        ${isSelected ? 'bg-blue-50' : ''}
                        ${isHighlighted ? 'bg-gray-50' : ''}
                        hover:bg-gray-50
                        ${index < filteredOptions.length - 1 ? 'border-b border-gray-100' : ''}
                      `}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="flex-1">
                        {formatOptionLabel ? (
                          formatOptionLabel(option)
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900">
                              {getOptionLabel(option)}
                            </div>
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer con contador */}
            <div className="px-3 py-2 border-t border-gray-200 text-xs text-gray-500 bg-gray-50">
              {filteredOptions.length} de {options.length} opciones
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CustomSelect;