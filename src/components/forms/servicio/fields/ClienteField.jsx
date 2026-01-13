// components/forms/servicio/fields/ClienteField.jsx - VERSIÓN CORREGIDA
import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';
import { Plus, Loader2 } from 'lucide-react';

// Componente de creación rápida de cliente en línea
const InlineClienteCreator = ({ 
  searchTerm, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    razon_social: searchTerm,
    tipo_documento: "RUC",
    numero_documento: "",
    contacto_principal: "",
    telefono: "",
    email: "",
    direccion: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const rucInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.razon_social.trim()) {
      newErrors.razon_social = "Razón social es requerida";
    }
    
    if (!formData.numero_documento.trim()) {
      newErrors.numero_documento = "RUC es requerido";
    } else if (formData.tipo_documento === "RUC" && formData.numero_documento.length !== 11) {
      newErrors.numero_documento = "El RUC debe tener 11 dígitos";
    }
    
    if (!formData.contacto_principal.trim()) {
      newErrors.contacto_principal = "Nombre del contacto es requerido";
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = "Teléfono es requerido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ¡IMPORTANTE! Esto previene el comportamiento por defecto del formulario
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const dataToSend = {
        razon_social: formData.razon_social.trim(),
        tipo_documento: formData.tipo_documento,
        numero_documento: formData.numero_documento.trim(),
        tipo_cliente: "otros",
        estado: "activo",
        tipo_pago: "Contado",
        dias_credito: 0,
        contacto_principal: formData.contacto_principal.trim(),
        telefono: formData.telefono.trim(),
        ...(formData.email.trim() && { email: formData.email.trim() }),
        ...(formData.direccion.trim() && { direccion: formData.direccion.trim() }),
        contactos: [{
          tipo: "comercial",
          nombre: formData.contacto_principal.trim(),
          telefono: formData.telefono.trim()
        }],
        cuentas_facturacion: [{
          nombre_cuenta: "Cuenta Principal",
          tipo_pago: "Contado",
          dias_credito: 0,
          limite_credito: 0,
          estado: "activa",
          es_principal: true
        }]
      };

      console.log("Enviando datos:", dataToSend); // Para debug

      const response = await axios.post('http://127.0.0.1:8000/clientes/', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Cliente creado:", response.data); // Para debug
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
    } catch (error) {
      console.error("Error detallado:", error.response || error); // Para debug
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "Error al crear cliente. Intente nuevamente." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === "numero_documento") {
      processedValue = value.replace(/\D/g, '').slice(0, 11);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
    
    if (e.key === 'Enter' && e.target.type !== 'textarea') {
      e.preventDefault();
      if (formRef.current) {
        const submitButton = formRef.current.querySelector('button[type="submit"]');
        if (submitButton) submitButton.click();
      }
    }
  };

  // Enfocar el campo RUC después de montar
  React.useEffect(() => {
    if (rucInputRef.current && !formData.numero_documento) {
      rucInputRef.current.focus();
    }
  }, []);

  return (
    <div 
      className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        onKeyDown={handleKeyDown}
        className="p-4"
        // No usar action ni method aquí - dejamos que React maneje todo
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-blue-700 text-sm">Crear Nuevo Cliente</h4>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-lg"
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        {errors.general && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {errors.general}
          </div>
        )}
        
        <div className="space-y-3">
          {/* Razón Social */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Razón Social *
            </label>
            <input
              type="text"
              name="razon_social"
              value={formData.razon_social}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.razon_social ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.razon_social && (
              <p className="mt-1 text-xs text-red-600">{errors.razon_social}</p>
            )}
          </div>
          
          {/* RUC */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              RUC *
            </label>
            <input
              ref={rucInputRef}
              type="text"
              name="numero_documento"
              value={formData.numero_documento}
              onChange={handleChange}
              placeholder="11 dígitos"
              className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.numero_documento ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength="11"
              required
            />
            {errors.numero_documento && (
              <p className="mt-1 text-xs text-red-600">{errors.numero_documento}</p>
            )}
          </div>
          
          {/* Contacto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contacto *
              </label>
              <input
                type="text"
                name="contacto_principal"
                value={formData.contacto_principal}
                onChange={handleChange}
                placeholder="Nombre"
                className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.contacto_principal ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.contacto_principal && (
                <p className="mt-1 text-xs text-red-600">{errors.contacto_principal}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Número"
                className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.telefono ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.telefono && (
                <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>
              )}
            </div>
          </div>
          
          {/* Email y Dirección */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="opcional"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="opcional"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="h-3 w-3 mr-1" />
                Crear Cliente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ClienteField principal
const ClienteField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = true,
  label = "Cliente",
  placeholder = "Buscar cliente...",
  autoFocus = false
}) => {
  const [showCreator, setShowCreator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para buscar clientes
  const fetchClientes = useCallback(async (search = '') => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/clientes/', {
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
      console.error('Error buscando clientes:', error);
      return { items: [], total: 0 };
    }
  }, []);

  // Renderizar opción
  const renderOption = useCallback((option, { isSelected, onSelect }) => {
    return (
      <div
        onClick={onSelect}
        className="px-2 py-1.5 cursor-pointer text-xs transition-colors hover:bg-blue-50 text-gray-700"
      >
        <div className="flex flex-col">
          <div className="font-medium truncate">{option.razon_social}</div>
          <div className="text-xs text-gray-500 flex justify-between mt-0.5">
            {option.numero_documento && <span>RUC: {option.numero_documento}</span>}
            {option.direccion && <span className="truncate max-w-[150px]">{option.direccion}</span>}
          </div>
        </div>
      </div>
    );
  }, []);

  // Obtener etiqueta
  const getOptionLabel = useCallback((option) => {
    if (!option) return '';
    return option.razon_social || '';
  }, []);

  // Manejar agregar nuevo
  const handleAddClick = useCallback((searchTerm = '') => {
    setSearchTerm(searchTerm);
    setShowCreator(true);
  }, []);

  // Manejar cliente creado
  const handleClienteCreated = useCallback((nuevoCliente) => {
    onChange(nuevoCliente);
    setShowCreator(false);
  }, [onChange]);

  return (
    <div className="relative">
      <BaseField label={label} error={error} required={required}>
        <AdvancedSearchDropdown
          value={value}
          onChange={onChange}
          fetchOptions={fetchClientes}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          showAddButton={true}
          onAddClick={handleAddClick}
          getOptionLabel={getOptionLabel}
          renderOption={renderOption}
          error={error}
          minSearchChars={1}
          autoFocus={autoFocus}
          className="w-full"
        />
      </BaseField>

      {showCreator && (
        <InlineClienteCreator
          searchTerm={searchTerm}
          onSuccess={handleClienteCreated}
          onCancel={() => setShowCreator(false)}
        />
      )}
    </div>
  );
};

export default ClienteField;