// api/optionsData.js
import axiosInstance from '../../../api/axiosConfig';

export const optionsDataAPI = {
  // Obtener clientes con búsqueda y paginación
  getClientesForSelect: async (search = '', page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('razon_social', search);
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/clientes/?${params}`);
      
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return {
          items: response.data.items.map(cliente => ({
            id: cliente.id || cliente._id,
            nombre: cliente.razon_social || 'Cliente sin nombre',
            ruc: cliente.numero_documento || '',
            razon_social: cliente.razon_social,
            numero_documento: cliente.numero_documento
          })),
          total: response.data.total || 0,
          page: response.data.page || 1,
          pageSize: response.data.page_size || pageSize,
          hasNext: response.data.has_next || false
        };
      }
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    }
  },

  // Obtener proveedores con búsqueda y paginación
  getProveedoresForSelect: async (search = '', page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('razon_social', search);
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/proveedores/?${params}`);
      
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return {
          items: response.data.items.map(proveedor => ({
            id: proveedor.id || proveedor._id,
            nombre: proveedor.razon_social || 'Proveedor sin nombre',
            ruc: proveedor.numero_documento || '',
            razon_social: proveedor.razon_social,
            numero_documento: proveedor.numero_documento
          })),
          total: response.data.total || 0,
          page: response.data.page || 1,
          pageSize: response.data.page_size || pageSize,
          hasNext: response.data.has_next || false
        };
      }
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    } catch (error) {
      console.error('Error obteniendo proveedores:', error);
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    }
  },

  // Obtener conductores con búsqueda y paginación
  getConductoresForSelect: async (search = '', page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('nombres_completos', search);
      params.append('tipo', 'Conductor');
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/personal/?${params}`);
      
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return {
          items: response.data.items.map(conductor => ({
            id: conductor.id || conductor._id,
            nombres_completos: conductor.nombres_completos || '',
            dni: conductor.dni || '',
            licencia_conducir: conductor.licencia_conducir || '',
            tipo: conductor.tipo || 'Conductor'
          })),
          total: response.data.total || 0,
          page: response.data.page || 1,
          pageSize: response.data.page_size || pageSize,
          hasNext: response.data.has_next || false
        };
      }
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    } catch (error) {
      console.error('Error obteniendo conductores:', error);
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    }
  },

  // Obtener auxiliares con búsqueda y paginación
  getAuxiliaresForSelect: async (search = '', page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('nombres_completos', search);
      params.append('tipo', 'Auxiliar');
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/personal/?${params}`);
      
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return {
          items: response.data.items.map(auxiliar => ({
            id: auxiliar.id || auxiliar._id,
            nombres_completos: auxiliar.nombres_completos || '',
            dni: auxiliar.dni || '',
            tipo: auxiliar.tipo || 'Auxiliar'
          })),
          total: response.data.total || 0,
          page: response.data.page || 1,
          pageSize: response.data.page_size || pageSize,
          hasNext: response.data.has_next || false
        };
      }
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    } catch (error) {
      console.error('Error obteniendo auxiliares:', error);
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    }
  },

  // Obtener vehículos con búsqueda y paginación
  getVehiculosForSelect: async (search = '', page = 1, pageSize = 10) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('placa', search);
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await axiosInstance.get(`/flota/?${params}`);
      
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        return {
          items: response.data.items.map(vehiculo => ({
            id: vehiculo.id || vehiculo._id,
            placa: vehiculo.placa || 'Sin placa',
            marca: vehiculo.marca || 'Sin marca',
            modelo: vehiculo.modelo || 'Sin modelo',
            tipo_vehiculo: vehiculo.tipo_vehiculo || '',
            capacidad_m3: vehiculo.m3 || 0,
            nombre_conductor: vehiculo.nombre_conductor || ''
          })),
          total: response.data.total || 0,
          page: response.data.page || 1,
          pageSize: response.data.page_size || pageSize,
          hasNext: response.data.has_next || false
        };
      }
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    } catch (error) {
      console.error('Error obteniendo vehículos:', error);
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    }
  },

  // optionsDataAPI.js - Correcciones
getCuentasForSelect: async (clienteId = null, search = '', page = 1, pageSize = 10) => {
  try {
    if (!clienteId) {
      return { items: [], total: 0, page: 1, pageSize, hasNext: false };
    }

    const params = new URLSearchParams();
    if (search) params.append('nombre', search);
    params.append('page', page);
    params.append('page_size', pageSize);

    const response = await axiosInstance.get(`/clientes/${clienteId}/cuentas?${params}`);
    
    if (response.data && response.data.cuentas_facturacion && Array.isArray(response.data.cuentas_facturacion)) {
      return {
        items: response.data.cuentas_facturacion.map(cuenta => ({
          direccion_origen: cuenta.direccion_origen || cuenta.direccion_origen,
          nombre: cuenta.nombre_cuenta || 'Sin nombre',
          tipo_pago: cuenta.tipo_pago || '',
          dias_credito: cuenta.dias_credito || 0,
          limite_credito: cuenta.limite_credito || 0,
          estado: cuenta.estado || 'activa',
          es_principal: cuenta.es_principal || false
        })),
        total: response.data.total || response.data.cuentas_facturacion.length,
        page: response.data.page || 1,
        pageSize: response.data.page_size || pageSize,
        hasNext: response.data.has_next || false
      };
    }
    return { items: [], total: 0, page: 1, pageSize, hasNext: false };
  } catch (error) {
    console.error('Error obteniendo cuentas:', error);
    return { items: [], total: 0, page: 1, pageSize, hasNext: false };
  }
},

createCuenta: async (clienteId, cuentaData) => {
  try {
    const response = await axiosInstance.post(`/clientes/${clienteId}/cuentas`, cuentaData);
    return response.data;
  } catch (error) {
    console.error('Error creando cuenta:', error);
    throw error;
  }
},

  // Datos fijos
  getTiposServicioForSelect: async () => {
    return ['Local', 'Nacional',"Cuadrilla"];
  },

  getModalidades: async () => {
    return [
      "FLETE",
      "TRASLADO",
      "CARGA/DESCARGA",
      "DUADO",
      "SIMPLE",
      "DESCARGA ACTIVOS",
      "1RA VUELTA",
      "2DA VUELTA",
      "TRIADO",
      "ALMACEN",
      "REGULAR",
    ];
  },

  getZonas: async () => {
    return ['Lima', 'Provincia', 'Extranjero'];
  },

  getMeses: async () => {
    return [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
  },

  // Crear nuevo cliente
  createCliente: async (clienteData) => {
    try {
      const response = await axiosInstance.post('/clientes', clienteData);
      return response.data;
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  },


  // Crear nuevo proveedor
  createProveedor: async (proveedorData) => {
    try {
      const response = await axiosInstance.post('/proveedores', proveedorData);
      return response.data;
    } catch (error) {
      console.error('Error creando proveedor:', error);
      throw error;
    }
  },

  // Crear nuevo vehículo
  createVehiculo: async (vehiculoData) => {
    try {
      const response = await axiosInstance.post('/flota', vehiculoData);
      return response.data;
    } catch (error) {
      console.error('Error creando vehículo:', error);
      throw error;
    }
  },

  // Crear nuevo conductor
  createConductor: async (conductorData) => {
    try {
      const data = {
        ...conductorData,
        tipo: 'Conductor'
      };
      
      const response = await axiosInstance.post('/personal', data);
      return response.data;
    } catch (error) {
      console.error('Error creando conductor:', error);
      throw error;
    }
  },

  // Crear nuevo auxiliar
  createAuxiliar: async (auxiliarData) => {
    try {
      const data = {
        ...auxiliarData,
        tipo: 'Auxiliar'
      };
      
      const response = await axiosInstance.post('/personal', data);
      return response.data;
    } catch (error) {
      console.error('Error creando auxiliar:', error);
      throw error;
    }
  }
};