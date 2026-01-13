import React from 'react';
import { ChevronDown, AlertCircle, Loader2 } from 'lucide-react';

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  isLoading = false,
  error,
  required = false,
  disabled = false,
  placeholder = 'Seleccionar...',
  searchable = false,
  className = '',
  helperText = '',
  emptyMessage = 'No hay opciones disponibles',
  onAddNew = null // Nueva prop para agregar opción
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef(null);

  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.value && option.value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  const selectedOption = options.find(opt => 
    opt.value.toString() === value?.toString()
  );

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddNew = () => {
    if (onAddNew && searchTerm.trim()) {
      onAddNew(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
          disabled={disabled || isLoading}
          className={`
            w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
            ${error ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
            ${isLoading ? 'cursor-wait' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`truncate ${!selectedOption ? 'text-gray-500' : ''}`}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Cargando...
                </span>
              ) : (
                selectedOption?.label || placeholder
              )}
            </span>
            {!isLoading && (
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            )}
          </div>
        </button>

        {isOpen && !disabled && !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                />
                {onAddNew && searchTerm.trim() && filteredOptions.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAddNew}
                    className="w-full mt-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                  >
                    + Agregar "{searchTerm.trim()}"
                  </button>
                )}
              </div>
            )}

            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-8 text-sm text-gray-500 text-center">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange({ target: { name, value: option.value } });
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`
                      w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors
                      ${option.value === value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                    `}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500 mt-1 truncate">{option.description}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default React.memo(SelectField);