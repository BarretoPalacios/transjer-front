// hooks/useOptionsData.js
import { useState, useEffect, useCallback } from 'react';
import { optionsDataAPI } from '../api/optionsDataAPI';
import { personalAPI } from '../api/personal';

const STORAGE_KEYS = {
  CLIENTES: 'servicios_options_clientes',
  PROVEEDORES: 'servicios_options_proveedores',
  CUENTAS: 'servicios_options_cuentas',
  VEHICULOS: 'servicios_options_vehiculos',
  TIPOS_SERVICIO: 'servicios_options_tipos_servicio',
  PERSONAL: 'servicios_options_personal',
  ZONAS: 'servicios_options_zonas',
  ORIGENES: 'servicios_options_origenes',
  DESTINOS: 'servicios_options_destinos',
  LAST_UPDATE: 'servicios_options_last_update',
  METADATA: 'servicios_options_metadata'
};

const CACHE_DURATION = {
  MINUTES_30: 30 * 60 * 1000, // 30 minutos
  HOURS_24: 24 * 60 * 60 * 1000, // 24 horas
  DAYS_7: 7 * 24 * 60 * 60 * 1000 // 7 días
};

export const useOptionsData = () => {
  const [options, setOptions] = useState({
    clientes: [],
    proveedores: [],
    cuentas: [],
    vehiculos: [],
    conductores: [],
    auxiliares: [],
    tiposServicio: [],
    zonas: [],
    origenes: [],
    destinos: [],
    estados: ['Pendiente', 'Programado', 'En Proceso', 'Completado', 'Cancelado']
  });

  const [rawData, setRawData] = useState({
    clientes: [],
    proveedores: [],
    cuentas: [],
    vehiculos: [],
    personal: [],
    tiposServicio: [],
    zonas: [],
    origenes: [],
    destinos: []
  });

  const [loading, setLoading] = useState({
    clientes: false,
    proveedores: false,
    cuentas: false,
    vehiculos: false,
    conductores: false,
    auxiliares: false,
    tiposServicio: false,
    zonas: false,
    origenes: false,
    destinos: false,
    all: false
  });

  const [lastUpdate, setLastUpdate] = useState(null);

  // Helper para formatear datos
  const formatOptions = useCallback((data, type) => {
    switch (type) {
      case 'clientes':
        return data.map(cliente => ({
          value: cliente.id || cliente._id,
          label: cliente.nombre || cliente.razon_social || 'Cliente sin nombre',
          nombre: cliente.nombre || cliente.razon_social || 'Cliente sin nombre',
          ruc: cliente.ruc || cliente.documento || '',
          id: cliente.id || cliente._id
        }));

      case 'proveedores':
        return data.map(proveedor => ({
          value: proveedor.id || proveedor._id,
          label: proveedor.nombre || proveedor.razon_social || 'Proveedor sin nombre',
          nombre: proveedor.nombre || proveedor.razon_social || 'Proveedor sin nombre',
          ruc: proveedor.ruc || proveedor.documento || '',
          id: proveedor.id || proveedor._id
        }));

      case 'cuentas':
        return data.map(cuenta => ({
          value: cuenta.id || cuenta._id,
          label: cuenta.nombre || cuenta.numero || 'Cuenta sin nombre',
          nombre: cuenta.nombre || cuenta.numero || 'Cuenta sin nombre',
          numero: cuenta.numero || '',
          id: cuenta.id || cuenta._id
        }));

      case 'vehiculos':
        return data.map(vehiculo => ({
          value: vehiculo.id || vehiculo._id,
          label: vehiculo.placa || 'Sin placa',
          placa: vehiculo.placa || 'Sin placa',
          marca: vehiculo.marca || 'Sin marca',
          modelo: vehiculo.modelo || 'Sin modelo',
          capacidad_m3: vehiculo.capacidad_m3 || vehiculo.capacidad || 0,
          id: vehiculo.id || vehiculo._id
        }));

      case 'personal':
        return data.map(persona => ({
          value: persona.id || persona._id,
          label: `${persona.nombres || ''} ${persona.apellidos || ''}`.trim(),
          nombres: persona.nombres || '',
          apellidos: persona.apellidos || '',
          dni: persona.dni || persona.documento || '',
          licencia: persona.licencia_conducir || '',
          cargo: persona.cargo || '',
          tipo: persona.tipo || '',
          id: persona.id || persona._id
        }));

      case 'tiposServicio':
        return data.map((tipo, index) => ({
          value: tipo.codigo || tipo.nombre || tipo,
          label: tipo.nombre || tipo,
          nombre: tipo.nombre || tipo,
          id: tipo.id || tipo._id || index.toString()
        }));

      case 'zonas':
        return data.map((zona, index) => ({
          value: zona,
          label: zona,
          id: index.toString()
        }));

      case 'origenes':
        return data.map((origen, index) => ({
          value: origen,
          label: origen,
          id: index.toString()
        }));

      case 'destinos':
        return data.map((destino, index) => ({
          value: destino,
          label: destino,
          id: index.toString()
        }));

      default:
        return [];
    }
  }, []);

  // Filtrar conductores y auxiliares del personal
  const filterPersonal = useCallback((personalData) => {
    const conductores = personalData.filter(persona => 
      persona.tipo?.toLowerCase() === 'conductor' ||
      persona.cargo?.toLowerCase().includes('conductor')
    );

    const auxiliares = personalData.filter(persona => 
      persona.tipo?.toLowerCase() === 'auxiliar' ||
      persona.cargo?.toLowerCase().includes('auxiliar') ||
      persona.cargo?.toLowerCase().includes('ayudante')
    );

    return { conductores, auxiliares };
  }, []);

  // Cargar datos desde localStorage
  const loadFromLocalStorage = useCallback(() => {
    const loadedData = {};
    const loadedOptions = {};

    // Cargar cada tipo de dato
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (key !== 'LAST_UPDATE' && key !== 'METADATA') {
        const data = localStorage.getItem(storageKey);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            loadedData[key.toLowerCase()] = parsed;
            loadedOptions[key.toLowerCase()] = formatOptions(parsed, key.toLowerCase());
          } catch (error) {
            console.error(`Error parsing ${storageKey}:`, error);
            loadedData[key.toLowerCase()] = [];
            loadedOptions[key.toLowerCase()] = [];
          }
        }
      }
    });

    // Cargar fecha de última actualización
    const lastUpdateStr = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    if (lastUpdateStr) {
      setLastUpdate(new Date(lastUpdateStr));
    }

    // Filtrar conductores y auxiliares del personal
    if (loadedData.personal && loadedData.personal.length > 0) {
      const { conductores, auxiliares } = filterPersonal(loadedData.personal);
      loadedOptions.conductores = formatOptions(conductores, 'personal');
      loadedOptions.auxiliares = formatOptions(auxiliares, 'personal');
    }

    setRawData(loadedData);
    setOptions(prev => ({ ...prev, ...loadedOptions }));
  }, [formatOptions, filterPersonal]);

  // Verificar si los datos necesitan actualización
  const needsUpdate = useCallback((storageKey) => {
    const data = localStorage.getItem(storageKey);
    if (!data) return true;

    try {
      const metadataStr = localStorage.getItem(STORAGE_KEYS.METADATA);
      if (!metadataStr) return true;

      const metadata = JSON.parse(metadataStr);
      const cacheInfo = metadata[storageKey];
      
      if (!cacheInfo || !cacheInfo.timestamp) return true;

      const cacheAge = Date.now() - cacheInfo.timestamp;
      
      // Determinar tiempo de cache según el tipo de dato
      let cacheDuration;
      switch (storageKey) {
        case STORAGE_KEYS.VEHICULOS:
        case STORAGE_KEYS.PERSONAL:
          cacheDuration = CACHE_DURATION.MINUTES_30; // 30 minutos
          break;
        case STORAGE_KEYS.CLIENTES:
        case STORAGE_KEYS.PROVEEDORES:
        case STORAGE_KEYS.CUENTAS:
          cacheDuration = CACHE_DURATION.HOURS_24; // 24 horas
          break;
        default:
          cacheDuration = CACHE_DURATION.DAYS_7; // 7 días
      }

      return cacheAge > cacheDuration;
    } catch (error) {
      return true;
    }
  }, []);

  // Fetch datos individuales
  const fetchData = useCallback(async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));

    try {
      let data;
      switch (type) {
        case 'clientes':
          data = await optionsDataAPI.getClientesForSelect();
          break;
        case 'proveedores':
          data = await optionsDataAPI.getProveedoresForSelect();
          break;
        case 'cuentas':
          // Asumo que tienes un endpoint para cuentas
          data = await optionsDataAPI.getCuentasForSelect?.() || [];
          break;
        case 'vehiculos':
          data = await optionsDataAPI.getVehiculosForSelect();
          break;
        case 'personal':
          data = await personalAPI.getAllPersonal?.() || [];
          break;
        case 'tiposServicio':
          data = await optionsDataAPI.getTiposServicioForSelect();
          break;
        case 'zonas':
          data = await optionsDataAPI.getZonas();
          break;
        case 'origenes':
          data = await optionsDataAPI.getOrigenesComunes();
          break;
        case 'destinos':
          data = await optionsDataAPI.getDestinosComunes();
          break;
        default:
          data = [];
      }

      // Guardar en localStorage
      const storageKey = STORAGE_KEYS[type.toUpperCase()];
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        // Actualizar metadata
        const metadataStr = localStorage.getItem(STORAGE_KEYS.METADATA);
        const metadata = metadataStr ? JSON.parse(metadataStr) : {};
        metadata[storageKey] = {
          timestamp: Date.now(),
          count: data.length
        };
        localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(metadata));
      }

      // Actualizar estados
      setRawData(prev => ({ ...prev, [type]: data }));
      const formatted = formatOptions(data, type);
      setOptions(prev => ({ ...prev, [type]: formatted }));

      // Filtrar conductores y auxiliares si es personal
      if (type === 'personal') {
        const { conductores, auxiliares } = filterPersonal(data);
        setOptions(prev => ({
          ...prev,
          conductores: formatOptions(conductores, 'personal'),
          auxiliares: formatOptions(auxiliares, 'personal')
        }));
      }

      return data;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      
      // En caso de error, usar datos del localStorage si existen
      const storageKey = STORAGE_KEYS[type.toUpperCase()];
      if (storageKey) {
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
          const data = JSON.parse(cachedData);
          const formatted = formatOptions(data, type);
          setOptions(prev => ({ ...prev, [type]: formatted }));
          return data;
        }
      }
      
      return [];
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [formatOptions, filterPersonal]);

  // Fetch todos los datos necesarios
  const refetch = useCallback(async (force = false) => {
    setLoading(prev => ({ ...prev, all: true }));

    try {
      const fetchPromises = [];
      const types = [
        'clientes', 'proveedores', 'cuentas', 'vehiculos', 
        'personal', 'tiposServicio', 'zonas', 'origenes', 'destinos'
      ];

      types.forEach(type => {
        const storageKey = STORAGE_KEYS[type.toUpperCase()];
        if (force || needsUpdate(storageKey)) {
          fetchPromises.push(fetchData(type));
        }
      });

      await Promise.all(fetchPromises);
      
      // Actualizar timestamp
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, now);
      setLastUpdate(new Date(now));
    } catch (error) {
      console.error('Error refetching data:', error);
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  }, [fetchData, needsUpdate]);

  // Fetch datos solo si no están en cache
  const fetchIfNeeded = useCallback(async () => {
    const typesToCheck = [
      { type: 'clientes', key: STORAGE_KEYS.CLIENTES },
      { type: 'proveedores', key: STORAGE_KEYS.PROVEEDORES },
      { type: 'vehiculos', key: STORAGE_KEYS.VEHICULOS },
      { type: 'personal', key: STORAGE_KEYS.PERSONAL }
    ];

    const needsFetch = typesToCheck.some(({ key }) => needsUpdate(key));
    
    if (needsFetch) {
      await refetch();
    }
  }, [needsUpdate, refetch]);

  // Inicializar
  useEffect(() => {
    loadFromLocalStorage();
    fetchIfNeeded();
  }, [loadFromLocalStorage, fetchIfNeeded]);

  // Funciones para gestionar localStorage
  const saveToLocalStorage = useCallback(() => {
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (key !== 'LAST_UPDATE' && key !== 'METADATA') {
        const dataKey = key.toLowerCase();
        if (rawData[dataKey] && rawData[dataKey].length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(rawData[dataKey]));
        }
      }
    });

    const metadata = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (key !== 'LAST_UPDATE' && key !== 'METADATA') {
        const data = localStorage.getItem(storageKey);
        if (data) {
          metadata[storageKey] = {
            timestamp: Date.now(),
            count: JSON.parse(data).length
          };
        }
      }
    });

    localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(metadata));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
    
    alert('Datos guardados localmente correctamente');
  }, [rawData]);

  const clearLocalStorage = useCallback(() => {
    if (window.confirm('¿Está seguro de limpiar todos los datos locales?')) {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      setOptions({
        clientes: [],
        proveedores: [],
        cuentas: [],
        vehiculos: [],
        conductores: [],
        auxiliares: [],
        tiposServicio: [],
        zonas: [],
        origenes: [],
        destinos: [],
        estados: ['Pendiente', 'Programado', 'En Proceso', 'Completado', 'Cancelado']
      });
      
      setRawData({
        clientes: [],
        proveedores: [],
        cuentas: [],
        vehiculos: [],
        personal: [],
        tiposServicio: [],
        zonas: [],
        origenes: [],
        destinos: []
      });
      
      setLastUpdate(null);
      alert('Datos locales limpiados correctamente');
    }
  }, []);

  const exportData = useCallback(() => {
    const exportObj = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0'
      },
      data: {}
    };

    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (key !== 'LAST_UPDATE' && key !== 'METADATA') {
        const data = localStorage.getItem(storageKey);
        if (data) {
          exportObj.data[storageKey] = JSON.parse(data);
        }
      }
    });

    const metadata = localStorage.getItem(STORAGE_KEYS.METADATA);
    if (metadata) {
      exportObj.metadata.cacheInfo = JSON.parse(metadata);
    }

    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const fileName = `servicios_backup_${new Date().toISOString().split('T')[0]}.json`;

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const importData = useCallback(async () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No se seleccionó archivo'));
          return;
        }

        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            
            if (!importedData.data || typeof importedData.data !== 'object') {
              throw new Error('Formato de archivo inválido');
            }

            // Importar datos
            Object.entries(importedData.data).forEach(([key, data]) => {
              localStorage.setItem(key, JSON.stringify(data));
            });

            // Importar metadata si existe
            if (importedData.metadata?.cacheInfo) {
              localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(importedData.metadata.cacheInfo));
            }

            // Recargar datos
            loadFromLocalStorage();
            alert('Datos importados correctamente');
            resolve();
          } catch (error) {
            alert(`Error al importar datos: ${error.message}`);
            reject(error);
          }
        };
        
        reader.onerror = () => {
          alert('Error al leer el archivo');
          reject(new Error('Error al leer el archivo'));
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    });
  }, [loadFromLocalStorage]);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const stats = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (key !== 'LAST_UPDATE' && key !== 'METADATA') {
        const data = localStorage.getItem(storageKey);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            stats[key.toLowerCase()] = parsed.length;
          } catch {
            stats[key.toLowerCase()] = 0;
          }
        } else {
          stats[key.toLowerCase()] = 0;
        }
      }
    });
    return stats;
  }, []);

  return {
    options,
    rawData,
    loading: loading.all,
    detailedLoading: loading,
    refetch: () => refetch(true),
    saveToLocalStorage,
    clearLocalStorage,
    exportData,
    importData,
    getStats,
    lastUpdate,
    fetchData, // Exportar para fetch individual
    filterPersonal // Exportar para uso externo si es necesario
  };
};