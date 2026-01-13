// components/forms/servicio/fields/CuentaField.jsx - VERSIÓN CORREGIDA
import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import BaseField from './BaseField';
import AdvancedSearchDropdown from '../AdvancedSearchDropdown';
import QuickCuentaModal from '../modals/QuickCuentaModal';

const CuentaField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = true,
  label = "Cuenta",
  placeholder = "Buscar cuenta...",
  clienteId
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTermForModal, setSearchTermForModal] = useState('');
  const [cuentasCache, setCuentasCache] = useState([]);

  // Cargar cuentas cuando cambie el clienteId
  useEffect(() => {
    if (clienteId) {
      loadCuentas();
    } else {
      setCuentasCache([]);
      onChange(null); // Limpiar selección cuando no hay cliente
    }
  }, [clienteId]);

  const loadCuentas = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/clientes/${clienteId}/cuentas/`);
      console.log('Respuesta de cuentas:', response.data);
      
      // Normalizar la respuesta a un array
      let cuentasArray = [];
      
      if (Array.isArray(response.data)) {
        cuentasArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Intentar extraer array del objeto
        if (Array.isArray(response.data.cuentas_facturacion)) {
          cuentasArray = response.data.cuentas_facturacion;
        } else {
          // Si es un objeto simple, convertirlo a array
          cuentasArray = [response.data];
        }
      }
      
      console.log('Cuentas normalizadas:', cuentasArray);
      setCuentasCache(cuentasArray);
      
      // Si hay solo una cuenta, seleccionarla automáticamente
      if (cuentasArray.length === 1) {
        onChange(cuentasArray[0]);
      }
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      setCuentasCache([]);
    }
  };

  const fetchCuentas = useCallback(async (search = '') => {
    if (!clienteId || !Array.isArray(cuentasCache)) {
      return { items: [], total: 0 };
    }

    try {
      // Si no hay término de búsqueda y hay cuentas en cache, devolver todas
      if (!search && cuentasCache.length > 0) {
        return {
          items: cuentasCache.slice(0, 10),
          total: cuentasCache.length
        };
      }
      
      // Filtrar del cache local
      let filtered = cuentasCache;
      
      if (search) {
        filtered = cuentasCache.filter(cuenta => {
          const nombre = (cuenta.nombre_cuenta || '').toString().toLowerCase();
          const tipo = (cuenta.tipo_pago || '').toString().toLowerCase();
          const searchLower = search.toLowerCase();
          
          return nombre.includes(searchLower) || tipo.includes(searchLower);
        });
      }
      
      // Limitar resultados
      const limitedResults = filtered.slice(0, 10);
      
      return {
        items: limitedResults,
        total: filtered.length
      };
    } catch (error) {
      console.error('Error filtrando cuentas:', error);
      return { items: [], total: 0 };
    }
  }, [clienteId, cuentasCache]);

  const renderOption = useCallback((option, { isSelected, onSelect }) => {
    if (!option) return null;
    
    return (
      <div
        onClick={() => onSelect(option)} // Asegurar que pasa el objeto completo
        className="px-2 py-1.5 cursor-pointer text-xs transition-colors hover:bg-purple-50 text-gray-700"
      >
        <div className="flex flex-col">
          <div className="font-medium truncate">{option.nombre_cuenta || 'Sin nombre'}</div>
          <div className="text-xs text-gray-500 flex justify-between mt-0.5">
            <span>Tipo: {option.tipo_pago || 'No especificado'}</span>
            {option.es_principal && (
              <span className="bg-green-100 text-green-800 px-1 rounded text-xs">
                Principal
              </span>
            )}
          </div>
          {option.tipo_pago === 'Credito' && (
            <div className="text-xs text-gray-400 mt-0.5">
              {option.dias_credito || 0} días crédito
            </div>
          )}
        </div>
      </div>
    );
  }, []);

  const getOptionLabel = useCallback((option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    return option.nombre_cuenta || 'Cuenta sin nombre';
  }, []);

  const getOptionValue = useCallback((option) => {
    if (!option) return null;
    
    // Si es un string, buscar en cache
    if (typeof option === 'string') {
      const found = cuentasCache.find(cuenta => 
        cuenta.nombre_cuenta === option || 
        cuenta.id === option || 
        cuenta.cuenta_id === option
      );
      return found || null;
    }
    
    // Si ya es un objeto, devolverlo completo
    return option;
  }, [cuentasCache]);

  const handleAddClick = useCallback((searchTerm = '') => {
    setSearchTermForModal(searchTerm);
    setShowModal(true);
  }, []);

  const handleCuentaCreated = useCallback((nuevaCuenta) => {
    // Actualizar cache y seleccionar la nueva cuenta
    setCuentasCache(prev => [...prev, nuevaCuenta]);
    onChange(nuevaCuenta); // Aquí se pasa el objeto completo
    setShowModal(false);
  }, [onChange]);

  const isDisabled = disabled || !clienteId;

  return (
    <>
      <BaseField 
        label={label} 
        error={error} 
        required={required}
        helpText={!clienteId ? "Seleccione un cliente primero" : 
                  cuentasCache.length === 0 ? "No hay cuentas registradas" : ""}
      >
        <AdvancedSearchDropdown
          value={value}
          onChange={onChange}
          fetchOptions={fetchCuentas}
          placeholder={clienteId ? placeholder : "Seleccione cliente primero"}
          disabled={isDisabled}
          showAddButton={!!clienteId}
          onAddClick={handleAddClick}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          renderOption={renderOption}
          error={error}
          minSearchChars={0}
          className="w-full"
          initialLoad={!!clienteId}
        />
      </BaseField>

      {showModal && clienteId && (
        <QuickCuentaModal
          clienteId={clienteId}
          onClose={() => setShowModal(false)}
          onSuccess={handleCuentaCreated}
          initialSearch={searchTermForModal}
        />
      )}
    </>
  );
};

export default CuentaField;