// import { useState, useEffect, useRef, useCallback } from 'react';
// import { ChevronDown, Plus, Loader2, X, Search } from 'lucide-react';

// function SearchDropdown({ 
//   label,
//   placeholder = "Buscar...",
//   value,
//   onChange,
//   onFetch,
//   onCreate,
//   fields = [],
//   displayKey = "nombre",
//   secondaryKey = "",
//   disabled = false,
//   className = "",
//   inputClassName = "",
//   required = false,
//   error = "",
//   debounceTime = 500,
//   showSearchIcon = false,
//   showClearButton = true,
//   searchKey = "search", // Nuevo: parámetro para la API
//   initialLoad = true // Nuevo: cargar datos al abrir
// }) {
//   // Estado local para el input
//   const [inputValue, setInputValue] = useState('');
//   const [options, setOptions] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({});
//   const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  
//   const dropdownRef = useRef(null);
//   const searchTimeoutRef = useRef(null);
//   const isMounted = useRef(true);

//   // Efecto para mostrar el valor actual cuando cambia value
//   useEffect(() => {
//     if (value) {
//       const displayValue = value[displayKey] || value.nombre || value.razon_social || '';
//       setInputValue(displayValue);
//     } else {
//       setInputValue('');
//     }
//   }, [value, displayKey]);

//   // Cerrar dropdown al hacer click fuera
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Cargar datos iniciales cuando se abre el dropdown
//   useEffect(() => {
//     if (isOpen && onFetch && !hasLoadedInitial && initialLoad) {
//       loadInitialData();
//     }
//   }, [isOpen, onFetch, hasLoadedInitial, initialLoad]);

//   // Cargar datos iniciales
//   const loadInitialData = useCallback(async () => {
//     if (!onFetch) return;
    
//     setLoading(true);
//     try {
//       const data = await onFetch('', 1, 20); // Búsqueda vacía para datos iniciales
      
//       if (!isMounted.current) return;
      
//       if (data && data.items && Array.isArray(data.items)) {
//         setOptions(data.items);
//       } else if (Array.isArray(data)) {
//         setOptions(data);
//       } else {
//         setOptions([]);
//       }
      
//       setHasLoadedInitial(true);
//     } catch (error) {
//       console.error('Error cargando datos iniciales:', error);
//       setOptions([]);
//     } finally {
//       if (isMounted.current) {
//         setLoading(false);
//       }
//     }
//   }, [onFetch]);

//   // Limpiar timeout al desmontar
//   useEffect(() => {
//     return () => {
//       isMounted.current = false;
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Función para buscar
//   const handleSearch = useCallback(async (searchTerm) => {
//     if (!onFetch) return;
    
//     setSearchLoading(true);
//     try {
//       // Usar searchKey para construir el parámetro de búsqueda
//       // Si searchKey es "razon_social", buscar por ese campo
//       const data = await onFetch(searchTerm, 1, 20);
      
//       if (!isMounted.current) return;
      
//       if (data && data.items && Array.isArray(data.items)) {
//         setOptions(data.items);
//       } else if (Array.isArray(data)) {
//         setOptions(data);
//       } else {
//         setOptions([]);
//       }
//     } catch (error) {
//       console.error('Error en búsqueda:', error);
//       setOptions([]);
//     } finally {
//       if (isMounted.current) {
//         setSearchLoading(false);
//       }
//     }
//   }, [onFetch]);

//   // Handler para cambio en el input
//   const handleInputChange = useCallback((e) => {
//     const newValue = e.target.value;
//     setInputValue(newValue);
    
//     if (!onFetch) return;
    
//     if (!isOpen) {
//       setIsOpen(true);
//     }

//     // Limpiar timeout anterior
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }

//     // Si el input está vacío, cargar datos iniciales
//     if (newValue.length === 0) {
//       searchTimeoutRef.current = setTimeout(() => {
//         loadInitialData();
//       }, 300);
//     } 
//     // Si tiene 2+ caracteres, buscar
//     else if (newValue.length >= 2) {
//       searchTimeoutRef.current = setTimeout(() => {
//         handleSearch(newValue);
//       }, debounceTime);
//     }
//     // Si tiene 1 carácter, limpiar opciones
//     else {
//       setOptions([]);
//     }
//   }, [onFetch, debounceTime, isOpen, handleSearch, loadInitialData]);

//   // Handler para abrir dropdown
//   const handleOpenDropdown = useCallback(() => {
//     if (disabled) return;
    
//     setIsOpen(true);
    
//     // Si no se han cargado datos iniciales y está configurado para hacerlo
//     if (!hasLoadedInitial && initialLoad && onFetch) {
//       loadInitialData();
//     }
//   }, [disabled, hasLoadedInitial, initialLoad, onFetch, loadInitialData]);

//   // Handler para seleccionar una opción
//   const handleSelectOption = useCallback((option) => {
//     const displayValue = option[displayKey] || option.nombre || option.razon_social || '';
//     setInputValue(displayValue);
//     setIsOpen(false);
//     onChange?.(option);
//   }, [displayKey, onChange]);

//   // Handler para limpiar selección
//   const handleClear = useCallback(() => {
//     setInputValue('');
//     setIsOpen(false);
//     setHasLoadedInitial(false);
//     onChange?.(null);
//   }, [onChange]);

//   // Handler para abrir modal de creación
//   const handleOpenModal = useCallback(() => {
//     if (disabled) return;
    
//     setShowModal(true);
//     // Inicializar formData con valores por defecto
//     const initialData = {};
//     fields.forEach(field => {
//       initialData[field.name] = field.defaultValue || '';
//     });
//     setFormData(initialData);
//   }, [disabled, fields]);

//   // Handler para cerrar modal
//   const handleCloseModal = useCallback(() => {
//     setShowModal(false);
//   }, []);

//   // Handler para crear nuevo registro
//   const handleCreate = useCallback(async () => {
//     if (!onCreate) return;

//     // Validar campos requeridos
//     const requiredFields = fields.filter(f => f.required);
//     for (const field of requiredFields) {
//       if (!formData[field.name] || formData[field.name].toString().trim() === '') {
//         alert(`El campo ${field.label} es requerido`);
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const newItem = await onCreate(formData);
      
//       if (!isMounted.current) return;
      
//       // Agregar a las opciones
//       setOptions(prev => [newItem, ...prev]);
      
//       // Seleccionar el nuevo item
//       handleSelectOption(newItem);
//       setShowModal(false);
//     } catch (error) {
//       console.error('Error al crear:', error);
//       const errorMsg = error.response?.data?.message || error.message || 'Error al crear el registro';
//       alert(errorMsg);
//     } finally {
//       if (isMounted.current) {
//         setLoading(false);
//       }
//     }
//   }, [onCreate, formData, fields, handleSelectOption]);

//   // Handler para cambio en campos del modal
//   const handleFormChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   }, []);

//   // Renderizar campo del formulario
//   const renderField = useCallback((field) => {
//     const commonProps = {
//       name: field.name,
//       value: formData[field.name] || '',
//       onChange: handleFormChange,
//       disabled: loading,
//       className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//     };

//     switch (field.type) {
//       case 'textarea':
//         return (
//           <textarea
//             key={field.name}
//             {...commonProps}
//             rows={field.rows || 3}
//             placeholder={field.placeholder}
//           />
//         );
      
//       case 'number':
//         return (
//           <input
//             key={field.name}
//             {...commonProps}
//             type="number"
//             placeholder={field.placeholder}
//             min={field.min}
//             max={field.max}
//             step={field.step}
//           />
//         );
      
//       case 'select':
//         return (
//           <select key={field.name} {...commonProps}>
//             <option value="">{field.placeholder || 'Seleccionar...'}</option>
//             {field.options?.map(opt => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         );
      
//       case 'date':
//         return (
//           <input
//             key={field.name}
//             {...commonProps}
//             type="date"
//             placeholder={field.placeholder}
//           />
//         );
      
//       default:
//         return (
//           <input
//             key={field.name}
//             {...commonProps}
//             type={field.type || 'text'}
//             placeholder={field.placeholder}
//           />
//         );
//     }
//   }, [formData, handleFormChange, loading]);

//   return (
//     <div className={`w-full ${className}`}>
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           {label} {required && <span className="text-red-500">*</span>}
//         </label>
//       )}
      
//       <div className="flex gap-2">
//         <div className="relative flex-1" ref={dropdownRef}>
//           <div className="relative">
//             {showSearchIcon && (
//               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
//                 <Search className="w-4 h-4" />
//               </div>
//             )}
            
//             <input
//               type="text"
//               value={inputValue}
//               onChange={handleInputChange}
//               onFocus={handleOpenDropdown}
//               placeholder={placeholder}
//               disabled={disabled}
//               className={`w-full px-4 py-3 ${showSearchIcon ? 'pl-10' : ''} pr-10 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${inputClassName}`}
//             />
            
//             <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
//               {inputValue && showClearButton && (
//                 <button
//                   onClick={handleClear}
//                   type="button"
//                   className="text-gray-400 hover:text-gray-600"
//                   tabIndex={-1}
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               )}
              
//               <button
//                 onClick={handleOpenDropdown}
//                 disabled={disabled}
//                 type="button"
//                 className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
//                 tabIndex={-1}
//               >
//                 <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//               </button>
//             </div>
//           </div>

//           {error && (
//             <p className="mt-1 text-sm text-red-600">{error}</p>
//           )}

//           {isOpen && (
//             <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
//               {loading || searchLoading ? (
//                 <div className="flex items-center justify-center py-8">
//                   <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
//                   <span className="ml-2 text-gray-600">Cargando...</span>
//                 </div>
//               ) : (
//                 <>
//                   {options.length > 0 ? (
//                     options.map((option, index) => (
//                       <button
//                         key={`${option.id || option._id || index}`}
//                         onClick={() => handleSelectOption(option)}
//                         type="button"
//                         className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
//                       >
//                         <div className="font-medium text-gray-900">
//                           {option[displayKey] || option.nombre || option.razon_social || ''}
//                         </div>
//                         {secondaryKey && option[secondaryKey] && (
//                           <div className="text-sm text-gray-500 mt-1">
//                             {option[secondaryKey]}
//                           </div>
//                         )}
//                       </button>
//                     ))
//                   ) : (
//                     <div className="px-4 py-8 text-center text-gray-400">
//                       {inputValue.length >= 2 ? 'No se encontraron resultados' : 'Escriba al menos 2 caracteres para buscar'}
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         {onCreate && fields.length > 0 && (
//           <button
//             type="button"
//             onClick={handleOpenModal}
//             disabled={disabled || loading}
//             className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shrink-0"
//           >
//             <Plus className="w-5 h-5" />
//             <span>Nuevo</span>
//           </button>
//         )}
//       </div>

//       {/* Modal para crear nuevo registro */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Registro</h2>
//               <button
//                 type="button"
//                 onClick={handleCloseModal}
//                 disabled={loading}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             <div className="space-y-4">
//               {fields.map(field => (
//                 <div key={field.name}>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     {field.label} {field.required && <span className="text-red-500">*</span>}
//                   </label>
//                   {renderField(field)}
//                   {field.helperText && (
//                     <p className="mt-1 text-sm text-gray-500">{field.helperText}</p>
//                   )}
//                 </div>
//               ))}

//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={handleCloseModal}
//                   disabled={loading}
//                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
//                 >
//                   Cancelar
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleCreate}
//                   disabled={loading}
//                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       Guardando...
//                     </>
//                   ) : (
//                     'Guardar'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default SearchDropdown;


































import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Plus, Loader2, X, Search } from 'lucide-react';

function SearchDropdown({ 
  label,
  placeholder = "Buscar...",
  value,
  onChange,
  onFetch,
  onCreate,
  fields = [],
  displayKey = "nombre",
  secondaryKey = "",
  disabled = false,
  className = "",
  inputClassName = "",
  required = false,
  error = "",
  debounceTime = 500,
  showSearchIcon = false,
  showClearButton = true,
  searchKey = "search", // Nuevo: parámetro para la API
  initialLoad = true // Nuevo: cargar datos al abrir
}) {
  // Estado local para el input
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const isMounted = useRef(true);

  // Efecto para mostrar el valor actual cuando cambia value
  useEffect(() => {
    if (value) {
      const displayValue = value[displayKey] || value.nombre || value.razon_social || '';
      setInputValue(displayValue);
    } else {
      setInputValue('');
    }
  }, [value, displayKey]);

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

  // Cargar datos iniciales cuando se abre el dropdown
useEffect(() => {
  // Solo cargar datos si se abre el dropdown, hay función de fetch,
  // no se han cargado datos iniciales y está configurado para cargarlos al abrir
  if (isOpen && onFetch && !hasLoadedInitial && initialLoad) {
    setHasLoadedInitial(true); // Marcar como cargado ANTES de la llamada
    loadInitialData();
  }
}, [isOpen]);

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    if (!onFetch) return;
    
    setLoading(true);
    try {
      const data = await onFetch('', 1, 20); // Búsqueda vacía para datos iniciales
      
      if (!isMounted.current) return;
      
      if (data && data.items && Array.isArray(data.items)) {
        setOptions(data.items);
      } else if (Array.isArray(data)) {
        setOptions(data);
      } else {
        setOptions([]);
      }
      
      setHasLoadedInitial(true);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setOptions([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [onFetch]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Función para buscar
  const handleSearch = useCallback(async (searchTerm) => {
    if (!onFetch) return;
    
    setSearchLoading(true);
    try {
      // Usar searchKey para construir el parámetro de búsqueda
      // Si searchKey es "razon_social", buscar por ese campo
      const data = await onFetch(searchTerm, 1, 20);
      
      if (!isMounted.current) return;
      
      if (data && data.items && Array.isArray(data.items)) {
        setOptions(data.items);
      } else if (Array.isArray(data)) {
        setOptions(data);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setOptions([]);
    } finally {
      if (isMounted.current) {
        setSearchLoading(false);
      }
    }
  }, [onFetch]);

  // Handler para cambio en el input
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (!onFetch) return;
    
    if (!isOpen) {
      setIsOpen(true);
    }

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si el input está vacío, cargar datos iniciales
    if (newValue.length === 0) {
      searchTimeoutRef.current = setTimeout(() => {
        loadInitialData();
      }, 300);
    } 
    // Si tiene 2+ caracteres, buscar
    else if (newValue.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(newValue);
      }, debounceTime);
    }
    // Si tiene 1 carácter, limpiar opciones
    else {
      setOptions([]);
    }
  }, [onFetch, debounceTime, isOpen, handleSearch, loadInitialData]);

  // Handler para abrir dropdown
const handleOpenDropdown = useCallback(() => {
  if (disabled) return;
  
  setIsOpen(true);
  
  // Elimina esta lógica del handler ya que ahora está manejada por el useEffect
  // if (!hasLoadedInitial && initialLoad && onFetch) {
  //   loadInitialData();
  // }
}, [disabled]);

  // Handler para seleccionar una opción
  const handleSelectOption = useCallback((option) => {
    const displayValue = option[displayKey] || option.nombre || option.razon_social || '';
    setInputValue(displayValue);
    setIsOpen(false);
    onChange?.(option);
  }, [displayKey, onChange]);

  // Handler para limpiar selección
  const handleClear = useCallback(() => {
    setInputValue('');
    setIsOpen(false);
    setHasLoadedInitial(false);
    onChange?.(null);
  }, [onChange]);

  // Handler para abrir modal de creación
  const handleOpenModal = useCallback(() => {
    if (disabled) return;
    
    setShowModal(true);
    // Inicializar formData con valores por defecto
    const initialData = {};
    fields.forEach(field => {
      initialData[field.name] = field.defaultValue || '';
    });
    setFormData(initialData);
  }, [disabled, fields]);

  // Handler para cerrar modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Handler para crear nuevo registro
  const handleCreate = useCallback(async () => {
    if (!onCreate) return;

    // Validar campos requeridos
    const requiredFields = fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name].toString().trim() === '') {
        alert(`El campo ${field.label} es requerido`);
        return;
      }
    }

    setLoading(true);
    try {
      const newItem = await onCreate(formData);
      
      if (!isMounted.current) return;
      
      // Agregar a las opciones
      setOptions(prev => [newItem, ...prev]);
      
      // Seleccionar el nuevo item
      handleSelectOption(newItem);
      setShowModal(false);
    } catch (error) {
      console.error('Error al crear:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al crear el registro';
      // alert(errorMsg);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [onCreate, formData, fields, handleSelectOption]);

  // Handler para cambio en campos del modal
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Renderizar campo del formulario
  const renderField = useCallback((field) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleFormChange,
      disabled: loading,
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.name}
            {...commonProps}
            rows={field.rows || 3}
            placeholder={field.placeholder}
          />
        );
      
      case 'number':
        return (
          <input
            key={field.name}
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
          <select key={field.name} {...commonProps}>
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
            key={field.name}
            {...commonProps}
            type="date"
            placeholder={field.placeholder}
          />
        );
      
      default:
        return (
          <input
            key={field.name}
            {...commonProps}
            type={field.type || 'text'}
            placeholder={field.placeholder}
          />
        );
    }
  }, [formData, handleFormChange, loading]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="flex gap-2">
        <div className="relative flex-1" ref={dropdownRef}>
          <div className="relative">
            {showSearchIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
            )}
            
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleOpenDropdown}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full px-4 py-3 ${showSearchIcon ? 'pl-10' : ''} pr-10 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${inputClassName}`}
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {inputValue && showClearButton && (
                <button
                  onClick={handleClear}
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={handleOpenDropdown}
                disabled={disabled}
                type="button"
                className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                tabIndex={-1}
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {loading || searchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Cargando...</span>
                </div>
              ) : (
                <>
                  {options.length > 0 ? (
                    options.map((option, index) => (
                      <button
                        key={`${option.id || option._id || index}`}
                        onClick={() => handleSelectOption(option)}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {option[displayKey] || option.nombre || option.razon_social || ''}
                        </div>
                        {secondaryKey && option[secondaryKey] && (
                          <div className="text-sm text-gray-500 mt-1">
                            {option[secondaryKey]}
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-400">
                      {inputValue.length >= 2 ? 'No se encontraron resultados' : 'Escriba al menos 2 caracteres para buscar'}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {onCreate && fields.length > 0 && (
          <button
            type="button"
            onClick={handleOpenModal}
            disabled={disabled || loading}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo</span>
          </button>
        )}
      </div>

      {/* Modal para crear nuevo registro */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Registro</h2>
              <button
                type="button"
                onClick={handleCloseModal}
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
                  {field.helperText && (
                    <p className="mt-1 text-sm text-gray-500">{field.helperText}</p>
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
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

export default SearchDropdown;