import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Loader2, X } from 'lucide-react';

// Componente reutilizable
function SearchDropdown({ 
  label,
  placeholder = "Buscar...",
  value,
  onChange,
  onFetch,
  onCreate,
  fields = [],
  displayKey = "name",
  disabled = false
}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [allOptions, setAllOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const dropdownRef = useRef(null);

  // Inicializar formData con valores vacíos
  useEffect(() => {
    const initialData = {};
    fields.forEach(field => {
      initialData[field.name] = field.defaultValue || '';
    });
    setFormData(initialData);
  }, [fields]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      if (!onFetch) return;
      
      setLoading(true);
      try {
        const data = await onFetch();
        setAllOptions(data);
        setOptions(data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [onFetch]);

  // Actualizar query cuando cambia el valor externo
  useEffect(() => {
    if (value) {
      setQuery(value[displayKey] || '');
    } else {
      setQuery('');
    }
  }, [value, displayKey]);

  // Filtrar opciones
  useEffect(() => {
    if (!query.trim()) {
      setOptions(allOptions);
      return;
    }

    const filtered = allOptions.filter(item =>
      item[displayKey]?.toLowerCase().includes(query.toLowerCase())
    );
    
    setOptions(filtered);
  }, [query, allOptions, displayKey]);

  const handleSelect = (option) => {
    setQuery(option[displayKey]);
    setIsOpen(false);
    onChange && onChange(option);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async () => {
    if (!onCreate) return;

    // Validar campos requeridos
    const requiredFields = fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name].trim() === '') {
        alert(`El campo ${field.label} es requerido`);
        return;
      }
    }

    setLoading(true);
    try {
      const newItem = await onCreate(formData);
      
      setAllOptions([newItem, ...allOptions]);
      setOptions([newItem, ...allOptions]);
      handleSelect(newItem);
      setShowModal(false);
      
      // Reset form
      const resetData = {};
      fields.forEach(field => {
        resetData[field.name] = field.defaultValue || '';
      });
      setFormData(resetData);
    } catch (error) {
      console.error('Error al crear:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleInputChange,
      disabled: loading,
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={field.rows || 3}
            placeholder={field.placeholder}
          />
        );
      
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{field.placeholder || 'Seleccionar...'}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            placeholder={field.placeholder}
          />
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={field.type || 'text'}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        <div className="relative flex-1" ref={dropdownRef}> 
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      {option[displayKey]}
                    </button>
                  ))}
                  
                  {options.length === 0 && !loading && (
                    <div className="px-4 py-8 text-center text-gray-400">
                      No hay resultados
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {onCreate && fields.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            disabled={disabled}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo</span>
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Nuevo Registro</h2>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {fields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitForm}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// EJEMPLO DE USO
export default function App() {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Simular API para servicios
  const fetchServices = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, name: 'Transporte de Carga Pesada', price: 500 },
      { id: 2, name: 'Mudanzas Residenciales', price: 300 },
      { id: 3, name: 'Mudanzas Corporativas', price: 800 },
      { id: 4, name: 'Transporte Internacional', price: 1500 },
      { id: 5, name: 'Almacenamiento Temporal', price: 200 },
    ];
  };

  const createService = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: Date.now(),
      ...data
    };
  };

  // Simular API para productos
  const fetchProducts = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, name: 'Laptop Dell', category: 'Electrónica' },
      { id: 2, name: 'Mouse Logitech', category: 'Accesorios' },
      { id: 3, name: 'Teclado Mecánico', category: 'Accesorios' },
    ];
  };

  const createProduct = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: Date.now(),
      ...data
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Componente Reutilizable</h1>
        
        {/* Ejemplo 1: Servicios de Transporte */}
        <div>
          <SearchDropdown
            label="Servicio de Transporte"
            placeholder="Buscar servicio..."
            value={selectedService}
            onChange={setSelectedService}
            onFetch={fetchServices}
            onCreate={createService}
            displayKey="name"
            fields={[
              { 
                name: 'name', 
                label: 'Nombre del Servicio', 
                type: 'text', 
                required: true,
                placeholder: 'Ej: Transporte Express'
              },
              { 
                name: 'description', 
                label: 'Descripción', 
                type: 'textarea', 
                rows: 3,
                placeholder: 'Describe el servicio...'
              },
              { 
                name: 'price', 
                label: 'Precio (USD)', 
                type: 'number', 
                step: '0.01',
                placeholder: '0.00'
              },
              { 
                name: 'duration', 
                label: 'Duración (días)', 
                type: 'number', 
                min: 1,
                placeholder: '1'
              }
            ]}
          />
          
          {selectedService && (
            <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Seleccionado:</strong> {selectedService.name}
              </p>
            </div>
          )}
        </div>

        {/* Ejemplo 2: Productos */}
        <div>
          <SearchDropdown
            label="Producto"
            placeholder="Buscar producto..."
            value={selectedProduct}
            onChange={setSelectedProduct}
            onFetch={fetchProducts}
            onCreate={createProduct}
            displayKey="name"
            fields={[
              { 
                name: 'name', 
                label: 'Nombre del Producto', 
                type: 'text', 
                required: true,
                placeholder: 'Ej: Laptop HP'
              },
              { 
                name: 'category', 
                label: 'Categoría', 
                type: 'select',
                required: true,
                options: [
                  { value: 'electronica', label: 'Electrónica' },
                  { value: 'accesorios', label: 'Accesorios' },
                  { value: 'muebles', label: 'Muebles' },
                ]
              },
              { 
                name: 'stock', 
                label: 'Stock', 
                type: 'number',
                min: 0,
                defaultValue: 0
              },
              { 
                name: 'available_date', 
                label: 'Fecha Disponible', 
                type: 'date'
              }
            ]}
          />
          
          {selectedProduct && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Seleccionado:</strong> {selectedProduct.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}