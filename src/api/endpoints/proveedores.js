import axiosInstance from '../axiosConfig';
import axios from 'axios';

const WEBNOVA_TOKEN = import.meta.env.VITE_WEBNOVA_TOKEN;

export const proveedoresAPI = {
  createProveedor: async (proveedorData) => {
    console.log(proveedorData);
    const response = await axiosInstance.post('/proveedores/', proveedorData);
    return response.data;
  },

  getAllProveedores: async (filters = {}, pagination = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 10;
    
    params.append('page', page);
    params.append('page_size', pageSize);

    // Parámetros de filtrado según tus rutas FastAPI
    if (filters.codigo_proveedor) params.append('codigo_proveedor', filters.codigo_proveedor);
    if (filters.tipo_documento) params.append('tipo_documento', filters.tipo_documento);
    if (filters.numero_documento) params.append('numero_documento', filters.numero_documento);
    if (filters.razon_social) params.append('razon_social', filters.razon_social);
    if (filters.rubro_proveedor) params.append('rubro_proveedor', filters.rubro_proveedor);
    if (filters.contacto_principal) params.append('contacto_principal', filters.contacto_principal);
    if (filters.telefono) params.append('telefono', filters.telefono);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.servicio) params.append('servicio', filters.servicio);
    
    // Para mantener compatibilidad con los filtros del componente anterior
    if (filters.ruc) params.append('numero_documento', filters.ruc);
    if (filters.tipo) params.append('rubro_proveedor', filters.tipo);
    if (filters.nombre_comercial) params.append('razon_social', filters.nombre_comercial);

    const response = await axiosInstance.get(`/proveedores/?${params.toString()}`);
    
    // Devuelve toda la respuesta paginada
    return {
        items: response.data.items,
        pagination: {
            total: response.data.total,
            page: response.data.page,
            pageSize: response.data.page_size,
            totalPages: response.data.total_pages,
            hasNext: response.data.has_next,
            hasPrev: response.data.has_prev
        }
    };
  },

  getProveedorById: async (proveedorId) => {
    const response = await axiosInstance.get(`/proveedores/${proveedorId}`);
    return response.data;
  },

  getProveedorByCodigo: async (codigoProveedor) => {
    const response = await axiosInstance.get(`/proveedores/codigo/${codigoProveedor}`);
    return response.data;
  },

  getProveedorByDocumento: async (tipoDocumento, numeroDocumento) => {
    const response = await axiosInstance.get(
      `/proveedores/documento/${tipoDocumento}/${numeroDocumento}`
    );
    return response.data;
  },

  updateProveedor: async (proveedorId, updateData) => {
    console.log(updateData);
    const response = await axiosInstance.put(`/proveedores/${proveedorId}`, updateData);
    return response.data;
  },

  deleteProveedor: async (proveedorId) => {
    const response = await axiosInstance.delete(`/proveedores/${proveedorId}`);
    return response.data;
  },

  exportProveedorExcel: async (proveedorId) => {
    const response = await axiosInstance.get(
      `/proveedores/${proveedorId}/export/excel`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  exportAllProveedoresExcel: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de filtrado según tus rutas FastAPI
    if (filters.codigo_proveedor) params.append('codigo_proveedor', filters.codigo_proveedor);
    if (filters.tipo_documento) params.append('tipo_documento', filters.tipo_documento);
    if (filters.numero_documento) params.append('numero_documento', filters.numero_documento);
    if (filters.razon_social) params.append('razon_social', filters.razon_social);
    if (filters.rubro_proveedor) params.append('rubro_proveedor', filters.rubro_proveedor);
    if (filters.contacto_principal) params.append('contacto_principal', filters.contacto_principal);
    if (filters.telefono) params.append('telefono', filters.telefono);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.servicio) params.append('servicio', filters.servicio);
    
    // Para mantener compatibilidad
    if (filters.ruc) params.append('numero_documento', filters.ruc);
    if (filters.tipo) params.append('rubro_proveedor', filters.tipo);

    const response = await axiosInstance.get(
      `/proveedores/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  downloadPlantillaExcel: async () => {
    const response = await axiosInstance.get(
      '/proveedores/template/excel',
      { responseType: 'blob' }
    );
    return response.data;
  },

  importProveedoresExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      '/proveedores/import/excel',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  },

  getEstadisticas: async () => {
    const response = await axiosInstance.get('/proveedores/stats/estadisticas');
    return response.data;
  },

  downloadExcel: (blob, filename = 'proveedores.xlsx') => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  consultarRuc: async (ruc) => {
    try {
      const response = await axios.get(`https://api.webnova.pe/api/v1/buscar/${ruc}`, {
        headers: {
          'Authorization': `Bearer ${WEBNOVA_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      // La API de Webnova suele devolver los datos directamente o envueltos
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error en la consulta"
      };
    }
  }

};