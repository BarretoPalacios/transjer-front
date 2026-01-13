import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Eye,
  Edit,
  Save,
  X,
  Calendar,
  FileText,
  Truck,
  User,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Upload,
  Download,
  CalendarDays,
  Car,
  Package,
  Hash,
} from "lucide-react";

import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";
import { serviciosHistoricosAPI } from "../../../api/endpoints/serviciosHistoricos";
import ImportModalServicios from "../../../components/ServiciosHistoricos/ImportModalServicios";

const ServiciosHistoricos = () => {
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [isFiltersLoading, setIsFiltersLoading] = useState(false);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    cuenta: "",
    cliente: "",
    mes: "",
    tipo_servicio: "",
    proveedor: "",
    estado_servicio: "",
    estado_factura: "",
    fecha_desde: "",
    fecha_hasta: "",
    servicio: "",
    conductor: "",
    placa: "",
    origen: "",
    destino: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [modalState, setModalState] = useState({
    show: false,
    data: null,
    isEditing: false,
    editFormData: {}
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50];
  const isInitialMount = useRef(true);
  const searchTimeoutRef = useRef(null);

  const fetchServicios = useCallback(
    async (page = 1, itemsPerPage = pagination.itemsPerPage) => {
      setIsLoading(true);
      setError(null);
      try {
        const filtersForAPI = {};

        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (value !== "" && value !== undefined && value !== null) {
            filtersForAPI[key] = String(value).trim();
          }
        });

        if (appliedSearch) {
          filtersForAPI.busqueda_general = appliedSearch;
        }

        const response = await serviciosHistoricosAPI.getAllServicios(
          filtersForAPI,
          { page, pageSize: itemsPerPage }
        );

        setServicios(response.servicios || []);

        if (response.paginacion) {
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.paginacion.total,
            totalPages: response.paginacion.totalPages,
            hasNext: response.paginacion.has_more,
            hasPrev: page > 1,
          });
        }
      } catch (err) {
        setError("Error al cargar los servicios: " + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters, appliedSearch, pagination.itemsPerPage]
  );

  // useEffect(() => {
  //   if (isInitialMount.current) {
  //     fetchServicios(1, pagination.itemsPerPage);
  //     isInitialMount.current = false;
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!isInitialMount.current) {
  //     fetchServicios(1, pagination.itemsPerPage);
  //   }
  // }, [appliedFilters, appliedSearch]);
   
  useEffect(() => {
  fetchServicios(pagination.currentPage, pagination.itemsPerPage);
}, [appliedFilters, appliedSearch, pagination.currentPage, pagination.itemsPerPage]);


  const handleRowClick = useCallback((servicio) => {
    setModalState({
      show: true,
      data: servicio,
      isEditing: false,
      editFormData: {
        estado: servicio.factura?.estado || "PENDIENTE",
        numero_factura: servicio.factura?.numero || "",
        monto: servicio.factura?.monto || "",
        moneda: servicio.factura?.moneda || "PEN",
        fecha_emision: servicio.factura?.fecha_emision 
          ? new Date(servicio.factura.fecha_emision).toISOString().split('T')[0]
          : ""
      }
    });
  }, []);

  const handleEditFactura = useCallback((servicio) => {
    setEditingId(servicio._id);
    setEditFormData({
      estado: servicio.factura?.estado || "PENDIENTE",
      numero_factura: servicio.factura?.numero || "",
      fecha_emision: servicio.factura?.fecha_emision 
        ? new Date(servicio.factura.fecha_emision).toISOString().split('T')[0]
        : "",
      monto: servicio.factura?.monto || "",
      moneda: servicio.factura?.moneda || "PEN",
    });
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleModalEdit = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isEditing: true
    }));
  }, []);

  const handleModalCancelEdit = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isEditing: false,
      editFormData: {
        estado: prev.data.factura?.estado || "PENDIENTE",
        numero_factura: prev.data.factura?.numero || "",
        monto: prev.data.factura?.monto || "",
        moneda: prev.data.factura?.moneda || "PEN",
        fecha_emision: prev.data.factura?.fecha_emision 
          ? new Date(prev.data.factura.fecha_emision).toISOString().split('T')[0]
          : ""
      }
    }));
  }, []);

  const handleModalInputChange = useCallback((field, value) => {
    setModalState(prev => ({
      ...prev,
      editFormData: {
        ...prev.editFormData,
        [field]: value
      }
    }));
  }, []);

  const handleModalSave = useCallback(async () => {
    if (!modalState.data?._id) return;

    setIsSaving(true);
    setError(null);
    try {
      const updateData = {
        estado: modalState.editFormData.estado,
        numero_factura: modalState.editFormData.numero_factura,
        fecha_emision: modalState.editFormData.fecha_emision 
          ? new Date(modalState.editFormData.fecha_emision).toISOString()
          : null,
        monto: modalState.editFormData.monto ? parseFloat(modalState.editFormData.monto) : null,
        moneda: modalState.editFormData.moneda,
      };

      await serviciosHistoricosAPI.updateServicio(modalState.data._id, updateData);
      
      setSuccessMessage("Factura actualizada correctamente");
      await fetchServicios(pagination.currentPage, pagination.itemsPerPage);
      
      setModalState(prev => ({
        ...prev,
        isEditing: false
      }));
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError("Error al actualizar la factura: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  }, [modalState, fetchServicios, pagination.currentPage]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditFormData({});
    setError(null);
  }, []);

  const handleSaveEdit = useCallback(async (id) => {
    if (!id) return;

    setIsSaving(true);
    setError(null);
    try {
      const updateData = {
        estado: editFormData.estado,
        numero_factura: editFormData.numero_factura,
        fecha_emision: editFormData.fecha_emision 
          ? new Date(editFormData.fecha_emision).toISOString()
          : null,
        monto: editFormData.monto ? parseFloat(editFormData.monto) : null,
        moneda: editFormData.moneda,
      };

      await serviciosHistoricosAPI.updateServicio(id, updateData);
      
      setSuccessMessage("Factura actualizada correctamente");
      await fetchServicios(pagination.currentPage, pagination.itemsPerPage);
      
      setEditingId(null);
      setEditFormData({});
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError("Error al actualizar la factura: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  }, [editFormData, fetchServicios, pagination.currentPage]);

  const handleInputChange = useCallback((field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSearch = useCallback(() => {
    setAppliedSearch(searchTerm);
  }, [searchTerm]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const aplicarFiltros = useCallback(() => {
    setIsFiltersLoading(true);
    const validFilters = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        validFilters[key] = String(value).trim();
      }
    });
    
    setAppliedFilters(validFilters);
    setTimeout(() => setIsFiltersLoading(false), 300);
  }, [filters]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  useEffect(() => {

    

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (!isInitialMount.current) {
        handleSearch();
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const clearFilters = useCallback(() => {
    setFilters({
      cuenta: "",
      cliente: "",
      mes: "",
      tipo_servicio: "",
      proveedor: "",
      estado_servicio: "",
      estado_factura: "",
      fecha_desde: "",
      fecha_hasta: "",
      servicio: "",
      conductor: "",
      placa: "",
      origen: "",
      destino: "",
    });
    setAppliedFilters({});
    setSearchTerm("");
    setAppliedSearch("");
  }, []);

const handleExport = useCallback(async () => {
  try {
    setIsLoadingExport(true);
    const filtersForAPI = {};
    
    // Solo incluir los filtros que el endpoint /exportar/excel acepta
    const filtrosPermitidos = [
      'cliente',
      'estado_factura', 
      'estado_servicio',
      'fecha_desde',
      'fecha_hasta',
      'servicio',
      'grte',
      'cliente_destino',
      'proveedor',
      'conductor',
      'placa'
    ];
    
    // Filtrar solo los parámetros permitidos
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        // Solo incluir si está en la lista de permitidos
        if (filtrosPermitidos.includes(key)) {
          filtersForAPI[key] = String(value).trim();
        }
      }
    });

    // Búsqueda general siempre se incluye si existe
    if (appliedSearch) {
      filtersForAPI.busqueda_general = appliedSearch;
    }

    const blob = await serviciosHistoricosAPI.exportServiciosExcel(filtersForAPI);
    serviciosHistoricosAPI.downloadExcel(blob, `servicios_historicos_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsLoadingExport(false);
  } catch (err) {
    setError("Error al exportar: " + (err.message || err));
  } finally {
    setIsLoadingExport(false);
  }
}, [appliedFilters, appliedSearch]);

  const handleImport = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    fetchServicios(newPage, pagination.itemsPerPage);
  }, [fetchServicios, pagination.itemsPerPage]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    fetchServicios(1, newItemsPerPage);
  }, [fetchServicios]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const getEstadoServicioColor = (estado) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PROGRAMADO':
        return 'bg-blue-100 text-blue-800';
      case 'PENDIENTE_FACTURACION':
      case 'PENDIENTE FACTURACION':
        return 'bg-yellow-100 text-gray-800';
      case 'COMPLETADO':
      case 'COMPLETO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoFacturaColor = (estado) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PAGADA':
      case 'FACTURADO':
        return 'bg-green-100 text-green-800';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-gray-800';
      case 'ANULADA':
      case 'ANULADO':
        return 'bg-red-100 text-red-800';
      case 'EMITIDA':
      case 'POR_COBRAR':
      case 'EN_PROCESO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && servicios.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Servicios Históricos</h1>
        <p className="text-gray-600 text-sm mt-1">
          Visualización y gestión de servicios históricos del sistema
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700 text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar por cliente, conductor, placa, factura..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
            >
              Buscar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Cliente</label>
            <input
              type="text"
              value={filters.cliente || ""}
              onChange={(e) => handleFilterChange('cliente', e.target.value)}
              placeholder="Cliente"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Estado Servicio</label>
            <select
              value={filters.estado_servicio || ""}
              onChange={(e) => handleFilterChange('estado_servicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="PROGRAMADO">PROGRAMADO</option>
              <option value="COMPLETADO">COMPLETADO</option>
              <option value="PENDIENTE_FACTURACION">PENDIENTE FACTURACIÓN</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Estado Factura</label>
            <select
              value={filters.estado_factura || ""}
              onChange={(e) => handleFilterChange('estado_factura', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="EMITIDA">EMITIDA</option>
              <option value="FACTURADO">FACTURADO</option>
              <option value="POR_COBRAR">POR COBRAR</option>
              <option value="ANULADO">ANULADO</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filters.fecha_desde || ""}
              onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={filters.fecha_hasta || ""}
              onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              onClick={aplicarFiltros}
              disabled={isFiltersLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              icon={Filter}
            >
              {isFiltersLoading ? "Aplicando..." : "Aplicar Filtros"}
            </Button>
            <Button
              onClick={clearFilters}
              variant="secondary"
              className="px-3 py-2 text-sm"
            >
              Limpiar
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => fetchServicios(pagination.currentPage, pagination.itemsPerPage)}
              variant="secondary"
              icon={RefreshCw}
              className="px-3 py-2 text-sm"
            >
              Actualizar
            </Button>
            <Button
              onClick={handleImport}
              variant="secondary"
              icon={Upload}
              className="px-3 py-2 text-sm"
            >
              Importar Excel
            </Button>
            <Button
              onClick={handleExport}
              variant="secondary"
              icon={Download}
              className="px-3 py-2 text-sm"
              disabled={isLoadingExport}
            >
        
              {isLoadingExport ? "Descargando archivo" : "Descargar Excel"}
            </Button>
          </div>
        </div>
      </div>
         
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full text-xs border-collapse">
      <thead>
        <tr className="bg-gray-100 border-b border-gray-300">
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Estado Servicio
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Cliente / Cuenta
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Mes / Servicio
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Fecha Servicio
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              Vehículo
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Conductor / Auxiliar
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Origen / Destino
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              Capacidad
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Factura
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Monto
            </div>
          </th>
          <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Proveedor / Zona
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {servicios.map((servicio) => (
          <tr 
            key={servicio._id} 
            className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
            onClick={() => handleRowClick(servicio)}
          >
            {/* Estado Servicio */}
            <td className="px-3 py-2 border-r border-gray-200">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoServicioColor(servicio.estado_servicio)}`}>
                {servicio.estado_servicio || "N/E"}
              </span>
              
            </td>

            {/* Cliente / Cuenta */}
            <td className="px-3 py-2 border-r border-gray-200">
              <div className="font-medium text-gray-900">
                {servicio.cliente || "N/E"}
              </div>
              <div className="text-xs text-gray-500">
                Cuenta: {servicio.cuenta || "N/E"}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-[120px]">
                Cliente Destino: {servicio.cliente_destino || "N/A"}
              </div>
            </td>

            {/* Mes / Servicio */}
            <td className="px-3 py-2 border-r border-gray-200">
              <div className="font-medium text-gray-900">
                {servicio.mes || "N/E"}
              </div>
              <div className="text-xs text-gray-500">
                {servicio.tipo_servicio || "N/E"}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-[120px]">
                {servicio.servicio_descripcion || "Sin descripción"}
              </div>
            </td>

            {/* Fecha Servicio */}
            <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
              <div className="font-medium text-gray-900">
                {formatDate(servicio.fecha_servicio)}
              </div>
              <div className="text-xs text-gray-500">
                Salida: {servicio.fecha_salida ? formatDate(servicio.fecha_salida) : "N/A"}
              </div>
              <div className="text-xs text-gray-500">
                Hora: {servicio.hora_cita || "N/A"}
              </div>
            </td>

            {/* Vehículo */}
            <td className="px-3 py-2 border-r border-gray-200">
              <div className="font-medium text-gray-900">
                {servicio.placa || "N/E"}
              </div>
              <div className="text-xs text-gray-500">
                Tipo: {servicio.tipo_camion || "N/E"}
              </div>
              <div className="text-xs text-gray-500">
                {servicio.tipo_vehiculo || ""}
              </div>
            </td>

            {/* Conductor / Auxiliar */}
            <td className="px-3 py-2 border-r border-gray-200">
              <div className="font-medium text-gray-900">
                {servicio.conductor || "N/E"}
              </div>
              <div className="text-xs text-gray-500">
                Aux: {servicio.auxiliar || "N/A"}
              </div>
              {/* <div className="text-xs text-gray-500">
                DNI: {servicio.conductor_dni || "N/A"}
              </div> */}
            </td>

            {/* Origen / Destino */}
            <td className="px-3 py-2 border-r border-gray-200">
              <div className="text-sm text-gray-900 truncate max-w-[150px]">
                {servicio.origen || "N/E"}
              </div>
              <div className="text-xs text-gray-600 flex items-center">
                <span className="mr-1">→</span>
                <span className="truncate max-w-[150px]">
                  {servicio.destino || "N/E"}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Solicitud: {servicio.solicitud || "N/A"}
              </div>
            </td>

            {/* Capacidad */}
            <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <div className="font-medium text-gray-900">
                    {servicio.capacidad_m3 || "0"}
                  </div>
                  <div className="text-xs text-gray-500">m³</div>
                </div>
                <div className="text-gray-300">/</div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">
                    {servicio.capacidad_tn || "0"}
                  </div>
                  <div className="text-xs text-gray-500">TN</div>
                </div>
              </div>
              {/* <div className="text-xs text-gray-500 mt-1">
                Ratio: {(servicio.capacidad_m3 && servicio.capacidad_tn) ? 
                  (servicio.capacidad_m3 / servicio.capacidad_tn).toFixed(2) : "N/A"}
              </div> */}
            </td>

            {/* Factura */}
            <td className="px-3 py-2 border-r border-gray-200">
              {editingId === servicio._id ? (
                <div className="space-y-1">
                  <select
                    value={editFormData.estado || "PENDIENTE"}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="w-full px-1 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="EMITIDA">EMITIDA</option>
                    <option value="FACTURADO">FACTURADO</option>
                    <option value="POR_COBRAR">POR COBRAR</option>
                    <option value="ANULADO">ANULADO</option>
                  </select>
                  <input
                    type="text"
                    value={editFormData.numero_factura || ""}
                    onChange={(e) => handleInputChange('numero_factura', e.target.value)}
                    placeholder="N° Factura"
                    className="w-full px-1 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="date"
                    value={editFormData.fecha_emision || ""}
                    onChange={(e) => handleInputChange('fecha_emision', e.target.value)}
                    className="w-full px-1 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoFacturaColor(
                      servicio.factura?.estado
                    )}`}
                  >
                    {servicio.factura?.estado || "PENDIENTE"}
                  </span>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {servicio.factura?.numero || "Sin número"}
                  </div>
                  <div className="text-gray-500 text-xs">
                    Emisión: {servicio.factura?.fecha_emision ? 
                      formatDate(servicio.factura.fecha_emision) : "N/A"}
                  </div>
                </div>
              )}
            </td>

            {/* Monto */}
            <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
              {editingId === servicio._id ? (
                <div className="space-y-1">
                  <div className="flex">
                    <select
                      value={editFormData.moneda || "PEN"}
                      onChange={(e) => handleInputChange('moneda', e.target.value)}
                      className="w-16 px-1 py-1 border border-gray-300 rounded-l text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="PEN">PEN</option>
                      <option value="USD">USD</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.monto || ""}
                      onChange={(e) => handleInputChange('monto', e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-1 py-1 border border-l-0 border-gray-300 rounded-r text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium text-gray-900">
                    {servicio.factura?.monto ? 
                      `${servicio.factura.monto.toLocaleString('es-PE')} ${servicio.factura.moneda || 'PEN'}` 
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Moneda: {servicio.factura?.moneda || "PEN"}
                  </div>
                  {/* {servicio.m3_tn && (
                    <div className="text-xs text-gray-500">
                      M3/TN: {servicio.m3_tn}
                    </div>
                  )} */}
                </div>
              )}
            </td>

            {/* Proveedor / Zona */}
            <td className="px-3 py-2 border-r border-gray-200">
              <div className="font-medium text-gray-900">
                {servicio.proveedor || "N/E"}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Zona: {servicio.servicio || "N/E"}
              </div>
              <div className="text-xs text-gray-500">
                GRTE: {servicio.grte || "N/A"}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      )}

      {servicios.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <span className="text-sm text-gray-600">Mostrar</span>
            <select
              className="border border-gray-300 rounded px-3 py-1 text-sm"
              value={pagination.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">registros por página</span>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            startIndex={
              (pagination.currentPage - 1) * pagination.itemsPerPage + 1
            }
            endIndex={Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}
          />
        </div>
      )}

      {servicios.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron servicios
          </h3>
          <p className="text-gray-600 text-sm">
            {Object.values(appliedFilters).some((f) => f !== "") || appliedSearch
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay servicios históricos registrados en el sistema"}
          </p>
          <div className="flex justify-center space-x-3 mt-4">
            <Button onClick={clearFilters} className="text-sm">
              Limpiar búsqueda
            </Button>
            <Button
              onClick={handleImport}
              variant="secondary"
              className="text-sm"
            >
              Importar servicios
            </Button>
          </div>
        </div>
      )}

      <ImportModalServicios
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => {
          fetchServicios(pagination.currentPage, pagination.itemsPerPage);
          setSuccessMessage("Servicios importados exitosamente");
        }}
      />

      <Modal
        isOpen={modalState.show}
        onClose={() => setModalState({ show: false, data: null, isEditing: false, editFormData: {} })}
        title="Detalles del Servicio"
        size="large"
      >
        {modalState.data && (
          <div className="space-y-6">
            {/* Sección de edición de factura */}
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-blue-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Información de Factura
                </h4>
                {modalState.isEditing ? (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleModalSave}
                      disabled={isSaving}
                      size="small"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      icon={Save}
                    >
                      {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button
                      onClick={handleModalCancelEdit}
                      disabled={isSaving}
                      variant="secondary"
                      size="small"
                      icon={X}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleModalEdit}
                    variant="secondary"
                    size="small"
                    icon={Edit}
                  >
                    Editar Factura
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Estado Factura
                  </label>
                  {modalState.isEditing ? (
                    <select
                      value={modalState.editFormData.estado || "PENDIENTE"}
                      onChange={(e) => handleModalInputChange('estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="EMITIDA">EMITIDA</option>
                      <option value="FACTURADO">FACTURADO</option>
                      <option value="POR_COBRAR">POR COBRAR</option>
                      <option value="ANULADO">ANULADO</option>
                    </select>
                  ) : (
                    <div className={`px-3 py-2 rounded ${getEstadoFacturaColor(modalState.data.factura?.estado)}`}>
                      {modalState.data.factura?.estado || "PENDIENTE"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Número Factura
                  </label>
                  {modalState.isEditing ? (
                    <input
                      type="text"
                      value={modalState.editFormData.numero_factura || ""}
                      onChange={(e) => handleModalInputChange('numero_factura', e.target.value)}
                      placeholder="Número de factura"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <div className="px-3 py-2">
                      {modalState.data.factura?.numero || "Sin número"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Fecha Emisión
                  </label>
                  {modalState.isEditing ? (
                    <input
                      type="date"
                      value={modalState.editFormData.fecha_emision || ""}
                      onChange={(e) => handleModalInputChange('fecha_emision', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <div className="px-3 py-2">
                      {modalState.data.factura?.fecha_emision 
                        ? formatDate(modalState.data.factura.fecha_emision)
                        : "N/A"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Monto
                  </label>
                  {modalState.isEditing ? (
                    <div className="flex">
                      <select
                        value={modalState.editFormData.moneda || "PEN"}
                        onChange={(e) => handleModalInputChange('moneda', e.target.value)}
                        className="w-20 px-2 py-2 border border-gray-300 rounded-l text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="PEN">PEN</option>
                        <option value="USD">USD</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={modalState.editFormData.monto || ""}
                        onChange={(e) => handleModalInputChange('monto', e.target.value)}
                        placeholder="0.00"
                        className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div className="px-3 py-2">
                      {modalState.data.factura?.monto 
                        ? `${modalState.data.factura.monto} ${modalState.data.factura.moneda || 'PEN'}`
                        : "N/A"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles del servicio en formato de tabla de 2 columnas */}
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold text-gray-900 mb-3">
                Información Completa del Servicio
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado Servicio:</span>
                    <span className={`font-small ${getEstadoServicioColor(modalState.data.estado_servicio)} px-2 py-1 rounded`}>
                      {modalState.data.estado_servicio || "N/E"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo Servicio:</span>
                    <span className="font-medium">{modalState.data.tipo_servicio || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proveedor:</span>
                    <span className="font-medium">{modalState.data.proveedor || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{modalState.data.cliente || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cuenta:</span>
                    <span className="font-medium">{modalState.data.cuenta || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zona:</span>
                    <span className="font-medium">{modalState.data.zona || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mes:</span>
                    <span className="font-medium">{modalState.data.mes || "N/E"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha Servicio:</span>
                    <span className="font-medium">{formatDate(modalState.data.fecha_servicio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha Salida:</span>
                    <span className="font-medium">{modalState.data.fecha_salida ? formatDate(modalState.data.fecha_salida) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora Cita:</span>
                    <span className="font-medium">{modalState.data.hora_cita || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Placa:</span>
                    <span className="font-medium">{modalState.data.placa || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo Camión:</span>
                    <span className="font-medium">{modalState.data.tipo_camion || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conductor:</span>
                    <span className="font-medium">{modalState.data.conductor || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auxiliar:</span>
                    <span className="font-medium">{modalState.data.auxiliar || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Origen:</span>
                    <span className="font-medium">{modalState.data.origen || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destino:</span>
                    <span className="font-medium">{modalState.data.destino || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Servicio:</span>
                    <span className="font-medium">{modalState.data.servicio || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descripción:</span>
                    <span className="font-medium">{modalState.data.servicio_descripcion || "N/E"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Solicitud:</span>
                    <span className="font-medium">{modalState.data.solicitud || "N/E"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacidad M3:</span>
                    <span className="font-medium">{modalState.data.capacidad_m3 || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacidad TN:</span>
                    <span className="font-medium">{modalState.data.capacidad_tn || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">M3/TN:</span>
                    <span className="font-medium">{modalState.data.m3_tn || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aux:</span>
                    <span className="font-medium">{modalState.data.aux || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GRTE:</span>
                    <span className="font-medium">{modalState.data.grte || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente Destino:</span>
                    <span className="font-medium">{modalState.data.cliente_destino || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(ServiciosHistoricos);