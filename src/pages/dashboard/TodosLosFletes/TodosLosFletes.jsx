import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Truck,
  RefreshCw,
  Filter,
  Eye,
  X,
  CheckCircle,
  Calendar,
  FileText,
  DollarSign,
  Hash,
  AlertCircle,
  Info,
  MapPin,
  User,
  Package,
  Truck as TruckIcon,
  Users,
  Tag,
  DollarSignIcon,
  Clock,
  FileX,
  FileCheck,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { fletesAPI } from "../../../api/endpoints/fletes";
import utilsAPI from "../../../api/endpoints/utils";

const TodosLosFletes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [fletes, setFletes] = useState([]);
  const [stats,setStats]= useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Función para convertir mes y año a rango de fechas
  const getDateRangeFromMonthYear = useCallback((mes, anio) => {
    if (!mes || !anio) {
      return {
        fecha_servicio_desde: "",
        fecha_servicio_hasta: ""
      };
    }

    const año = parseInt(anio);
    const mesNum = parseInt(mes);
    
    // Crear fecha de inicio (primer día del mes)
    const fechaInicio = new Date(año, mesNum - 1, 1);
    
    // Crear fecha de fin (último día del mes)
    const fechaFin = new Date(año, mesNum, 0); // El día 0 del mes siguiente da el último día del mes actual
    
    // Formatear a YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      fecha_servicio_desde: formatDate(fechaInicio),
      fecha_servicio_hasta: formatDate(fechaFin)
    };
  }, []);

  // Obtener mes y año de la URL
  const mesFromURL = searchParams.get("mes") || "";
  const anioFromURL = searchParams.get("anio") || "";
  
  // Obtener rango de fechas basado en mes y año
  const dateRange = getDateRangeFromMonthYear(mesFromURL, anioFromURL);

  // Estados para filtros
  const [filters, setFilters] = useState({
    cliente: "",
    codigo_flete: "",
    codigo_servicio: "",
    estado_flete: "",
    fecha_servicio_desde: dateRange.fecha_servicio_desde,
    fecha_servicio_hasta: dateRange.fecha_servicio_hasta,
  });

  const [localFilters, setLocalFilters] = useState({
    cliente: "",
    codigo_flete: "",
    codigo_servicio: "",
    estado_flete: "",
    fecha_servicio_desde: dateRange.fecha_servicio_desde,
    fecha_servicio_hasta: dateRange.fecha_servicio_hasta,
  });

  // Actualizar filtros cuando cambian los parámetros de URL (mes/año)
  useEffect(() => {
    const mes = searchParams.get("mes") || "";
    const anio = searchParams.get("anio") || "";
    const newDateRange = getDateRangeFromMonthYear(mes, anio);
    
    setFilters(prev => ({
      ...prev,
      fecha_servicio_desde: newDateRange.fecha_servicio_desde,
      fecha_servicio_hasta: newDateRange.fecha_servicio_hasta,
    }));
    
    setLocalFilters(prev => ({
      ...prev,
      fecha_servicio_desde: newDateRange.fecha_servicio_desde,
      fecha_servicio_hasta: newDateRange.fecha_servicio_hasta,
    }));
  }, [searchParams, getDateRangeFromMonthYear]);

  const [clientesList, setClientesList] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [fleteSeleccionado, setFleteSeleccionado] = useState(null);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50];

  // Opciones para el filtro de estado
  const estadoOptions = [
    { value: "", label: "Todos los estados" },
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "VALORIZADO", label: "Valorizado" },
  ];

  // Función principal para cargar fletes
  const fetchFletes = useCallback(
    async (
      page = 1,
      itemsPerPage = pagination.itemsPerPage,
      filtersToUse = filters,
    ) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        // Preparar filtros para API
        const cleanFilters = {};
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value && value.trim() !== "") {
            cleanFilters[key] = value.trim();
          }
        });

        // Añadir filtros fijos
        cleanFilters.page = page;
        cleanFilters.page_size = itemsPerPage;

        const response = await fletesAPI.getAdvancedFletes(cleanFilters);

        if (response && response.items) {
          setFletes(response.items);
          setStats(response.stats)
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.total || 0,
            totalPages: response.total_pages || 1,
            hasNext: response.has_next || false,
            hasPrev: response.has_prev || false,
          });
        } else {
          setFletes(response || []);
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response?.length || 0,
            totalPages: Math.ceil((response?.length || 0) / itemsPerPage),
            hasNext: (response?.length || 0) >= itemsPerPage,
            hasPrev: page > 1,
          });
        }
      } catch (err) {
        setError(
          "Error al cargar los fletes: " + (err.message || "Error desconocido"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.itemsPerPage, filters],
  );

  // Función para cargar clientes desde el endpoint
  const cargarClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const response = await utilsAPI.getClientesList();
      setClientesList(response || []);
    } catch (err) {
      console.error("Error cargando clientes:", err);
      setClientesList([]);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Efecto para búsqueda en tiempo real con debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));

      fetchFletes(1, pagination.itemsPerPage, filters);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters, fetchFletes, pagination.itemsPerPage]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchFletes();
    cargarClientes();
  }, []);

  // Función para aplicar filtros manualmente
  const handleApplyFilters = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

    setFilters(localFilters);
    fetchFletes(1, pagination.itemsPerPage, localFilters);
  }, [localFilters, pagination.itemsPerPage, fetchFletes]);

  const handleDownloadData = useCallback(async () => {
    try {
      setIsDownloading(true);
      setError(null);
      const filters_post = {
        cliente_nombre: filters.cliente || undefined,
        estado: filters.estado_flete || undefined,
        fecha_servicio_desde: filters.fecha_servicio_desde || undefined,
        fecha_servicio_hasta: filters.fecha_servicio_hasta || undefined,
      }
      const blob = await fletesAPI.exportAllFletesExcel({
        ...filters_post,
      });
      fletesAPI.downloadExcel(
        blob,
        `todos_fletes_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      setSuccessMessage("Descarga iniciada exitosamente");
    } catch (err) {
      setError("Error al exportar: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  }, [filters]);

  const clearFilters = useCallback(() => {
    // Obtener el rango de fechas actual desde la URL
    const mes = searchParams.get("mes") || "";
    const anio = searchParams.get("anio") || "";
    const dateRange = getDateRangeFromMonthYear(mes, anio);

    setLocalFilters({
      cliente: "",
      codigo_flete: "",
      codigo_servicio: "",
      estado_flete: "",
      fecha_servicio_desde: dateRange.fecha_servicio_desde,
      fecha_servicio_hasta: dateRange.fecha_servicio_hasta,
    });
    setFilters({
      cliente: "",
      codigo_flete: "",
      codigo_servicio: "",
      estado_flete: "",
      fecha_servicio_desde: dateRange.fecha_servicio_desde,
      fecha_servicio_hasta: dateRange.fecha_servicio_hasta,
    });

    fetchFletes(1, pagination.itemsPerPage, dateRange);
  }, [fetchFletes, pagination.itemsPerPage, searchParams, getDateRangeFromMonthYear]);

  const handleLocalFilterChange = useCallback((key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleViewDetalle = useCallback((flete) => {
    setFleteSeleccionado(flete);
    setShowDetalleModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDetalleModal(false);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchFletes(newPage, pagination.itemsPerPage, filters);
    },
    [fetchFletes, pagination.itemsPerPage, filters],
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchFletes(1, newItemsPerPage, filters);
    },
    [fetchFletes, filters],
  );

  // Función para actualizar mes y año en la URL
  const updateMesAnio = useCallback((mes, anio) => {
    const params = new URLSearchParams(searchParams);
    if (mes) {
      params.set("mes", mes);
    } else {
      params.delete("mes");
    }
    if (anio) {
      params.set("anio", anio);
    } else {
      params.delete("anio");
    }
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Función para obtener el nombre del mes
  const getMonthName = (mes) => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return months[parseInt(mes) - 1] || mes;
  };

  // Función para obtener clase de estado
  const getEstadoBadgeClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "PAGADO":
        return "bg-green-100 text-green-800 border border-green-300";
      case "CANCELADO":
        return "bg-red-100 text-red-800 border border-red-300";
      case "FACTURADO":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "VALORIZADO":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // Función para obtener clase de estado del servicio
  const getEstadoServicioClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case "COMPLETADO":
        return "bg-green-100 text-green-800 border border-green-300";
      case "CANCELADO":
        return "bg-red-100 text-red-800 border border-red-300";
      case "EN PROCESO":
      case "EN CURSO":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "PROGRAMADO":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return fecha;
    }
  };

  // Formatear fecha y hora
  const formatFechaHora = (fecha) => {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return fecha;
    }
  };

  const formatHora = (fecha) => {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return fecha;
    }
  };

  // Mostrar loading solo en carga inicial
  if (isLoading && fletes.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Todos los Fletes
          </h1>
          <p className="text-gray-600 mt-1">
            Total: {pagination.totalItems} fletes encontrados
          </p>
          {/* Mostrar mes y año si están en la URL */}
          {(mesFromURL || anioFromURL) && (
            <div className="mt-2">
              <p className="text-sm text-blue-600 font-medium">
                Filtrando por: {mesFromURL && getMonthName(mesFromURL)} {anioFromURL}
              </p>
              <p className="text-xs text-gray-500">
                Rango: {filters.fecha_servicio_desde} al {filters.fecha_servicio_hasta}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <div>
              <span className="font-medium">Éxito:</span>
              <span className="ml-2">{successMessage}</span>
            </div>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="mt-2 text-sm text-green-600 hover:text-green-800"
          >
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <X className="h-5 w-5 mr-2" />
            <div>
              <span className="font-medium">Error:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Cerrar
          </button>
        </div>
      )}

  {/* tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
  {/* Monto Total */}
  <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
    <div className="flex items-center justify-between mb-1">
      <div className="p-1.5 bg-blue-50 rounded-lg">
        <DollarSignIcon className="h-4 w-4 text-blue-600" />
      </div>
      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Monto Total</span>
    </div>
    <div className="text-xl font-extrabold text-gray-900 leading-none">
      {/* Usando el monto_total de tus stats */}
      {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(stats.monto_total)}
    </div>
    <p className="text-[11px] text-gray-500 mt-1">Venta neta acumulada</p>
  </div>

  {/* Pendientes */}
  <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
    <div className="flex items-center justify-between mb-1">
      <div className="p-1.5 bg-yellow-50 rounded-lg">
        <Clock className="h-4 w-4 text-yellow-600" />
      </div>
      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Estado</span>
    </div>
    <div className="text-xl font-extrabold text-gray-900 leading-none">
      {stats.total_pendientes}
    </div>
    <p className="text-[11px] text-yellow-600 font-medium mt-1 italic">Pendientes</p>
  </div>

  {/* Valorizados Sin Factura */}
  <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
    <div className="flex items-center justify-between mb-1">
      <div className="p-1.5 bg-orange-50 rounded-lg">
        <FileX className="h-4 w-4 text-orange-600" />
      </div>
      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Por Gestionar</span>
    </div>
    <div className="text-xl font-extrabold text-gray-900 leading-none">
      {stats.valorizados_sin_factura}
    </div>
    <p className="text-[11px] text-orange-600 font-medium mt-1">Sin Factura</p>
  </div>

  {/* Valorizados Con Factura */}
  <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
    <div className="flex items-center justify-between mb-1">
      <div className="p-1.5 bg-green-50 rounded-lg">
        <FileCheck className="h-4 w-4 text-green-600" />
      </div>
      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Completados</span>
    </div>
    <div className="text-xl font-extrabold text-gray-900 leading-none">
      {stats.valorizados_con_factura}
    </div>
    <p className="text-[11px] text-green-600 font-medium mt-1">Facturados</p>
  </div>
</div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros de Búsqueda
            </h3>
            <p className="text-sm text-gray-600">
              Filtra por los siguientes campos
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleApplyFilters}
              variant="primary"
              size="small"
              icon={Filter}
              isLoading={isLoading}
            >
              Aplicar Filtros
            </Button>

            <Button
              onClick={handleDownloadData}
              variant="secondary"
              size="small"
              icon={FileText}
              isLoading={isDownloading}
            >
              Descargar Datos
            </Button>

            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="small"
              icon={RefreshCw}
              isLoading={isLoading}
            >
              Actualizar
            </Button>

            <Button onClick={clearFilters} variant="secondary" size="small">
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Campos de filtro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </label>
            <select
              value={localFilters.cliente}
              onChange={(e) =>
                handleLocalFilterChange("cliente", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              disabled={loadingClientes}
            >
              <option value="">Todos los clientes</option>
              {loadingClientes ? (
                <option value="" disabled>
                  Cargando clientes...
                </option>
              ) : (
                clientesList.map((cliente, index) => (
                  <option key={index} value={cliente}>
                    {cliente}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Código Flete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Código Flete
            </label>
            <input
              type="text"
              value={localFilters.codigo_flete}
              onChange={(e) =>
                handleLocalFilterChange("codigo_flete", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: FLT-0000000001"
            />
          </div>

          {/* Código Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Código Servicio
            </label>
            <input
              type="text"
              value={localFilters.codigo_servicio}
              onChange={(e) =>
                handleLocalFilterChange("codigo_servicio", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: SRV-0000000019"
            />
          </div>

          {/* Estado Flete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Estado del Flete
            </label>
            <select
              value={localFilters.estado_flete}
              onChange={(e) =>
                handleLocalFilterChange("estado_flete", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              {estadoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Servicio Desde - Solo lectura ya que viene de la URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Servicio Desde
            </label>
            <input
              type="date"
              value={localFilters.fecha_servicio_desde}
              onChange={(e) =>
                handleLocalFilterChange("fecha_servicio_desde", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            {mesFromURL && anioFromURL && (
              <p className="text-xs text-gray-500 mt-1">
                Del mes {getMonthName(mesFromURL)} {anioFromURL}
              </p>
            )}
          </div>

          {/* Fecha Servicio Hasta - Solo lectura ya que viene de la URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Servicio Hasta
            </label>
            <input
              type="date"
              value={localFilters.fecha_servicio_hasta}
              onChange={(e) =>
                handleLocalFilterChange("fecha_servicio_hasta", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              min={localFilters.fecha_servicio_desde}
            />
          </div>
        </div>

        {/* Contador de filtros activos */}
        {Object.values(filters).some((f) => f && f.trim() !== "") && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                Filtros aplicados:
                <span className="font-medium text-blue-600 ml-2">
                  {
                    Object.values(filters).filter((f) => f && f.trim() !== "")
                      .length
                  }
                </span>
              </span>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Limpiar todos los filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Fletes */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Códigos
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Cliente
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Placa
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
                    <DollarSign className="h-3 w-3" />
                    Monto
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Tipo Servicio
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Origen
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Destino
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Estado Flete
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Pertenece a Factura
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {fletes.map((flete) => (
                <tr
                  key={flete.id}
                  className="border-b border-gray-200 hover:bg-blue-50"
                >
                  {/* Código Flete / Servicio */}
                  <td className="px-3 py-2 border-r border-gray-200">
                    <div className="text-gray-900">
                      <div className="font-medium">Flete:</div>
                      <p className="text-xs">{flete.codigo_flete}</p>
                      <div className="font-medium mt-1">Servicio:</div>
                      <p className="text-xs">{flete.codigo_servicio}</p>
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {flete?.servicio?.cliente?.nombre || "N/A"}
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {flete?.servicio?.flota?.placa || "N/A"}
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                    <div className="text-gray-900">
                      {formatFecha(flete?.servicio?.fecha_servicio)}
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      S/. {parseFloat(flete.monto_flete || 0).toFixed(2)}
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100">
                      {flete?.servicio?.tipo_servicio ||
                        flete?.servicio?.modalidad_servicio ||
                        "N/A"}
                    </span>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100">
                      {flete?.servicio?.origen || "N/A"}
                    </span>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100">
                      {flete?.servicio?.destino || "N/A"}
                    </span>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(flete.estado_flete)}`}
                    >
                      {flete.estado_flete || "N/A"}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-gray-200">
                    {flete.factura_id ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                        Sí
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewDetalle(flete)}
                        className="p-2 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {fletes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron fletes
            </h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some((f) => f && f.trim() !== "")
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay fletes disponibles"}
            </p>
            {Object.values(filters).some((f) => f && f.trim() !== "") && (
              <Button onClick={clearFilters} size="small">
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Paginación y registros por página */}
      {fletes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6">
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
              pagination.totalItems,
            )}
          />
        </div>
      )}

      {/* Modal para detalles del flete y servicio */}
      <Modal
        isOpen={showDetalleModal}
        onClose={handleCloseModal}
        title={`Detalles Completos - ${fleteSeleccionado?.codigo_flete || ""}`}
        size="large"
      >
        {fleteSeleccionado && (
          <div className="space-y-6">
            {/* Información General del Flete */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TruckIcon className="h-5 w-5 text-blue-600" />
                  Información del Flete
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Código Flete
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      {fleteSeleccionado.codigo_flete}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Estado del Flete
                    </label>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(fleteSeleccionado.estado_flete)}`}
                    >
                      {fleteSeleccionado.estado_flete}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Monto Flete
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      S/. {parseFloat(fleteSeleccionado.monto_flete || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha Creación
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatFechaHora(fleteSeleccionado.fecha_creacion)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha Actualización
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatFechaHora(fleteSeleccionado.fecha_actualizacion)}
                    </p>
                  </div>
                  {fleteSeleccionado.fecha_pago && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha Pago
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatFecha(fleteSeleccionado.fecha_pago)}
                      </p>
                    </div>
                  )}
                  {fleteSeleccionado.codigo_factura && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Factura Asociada
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {fleteSeleccionado.codigo_factura}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Observaciones del Flete
                    </label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {fleteSeleccionado.observaciones || "Sin observaciones"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Servicio */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-green-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Información del Servicio
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información Básica del Servicio */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">
                      Información Básica
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Código Servicio
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {fleteSeleccionado.servicio
                            ?.codigo_servicio_principal || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Estado Servicio
                        </label>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoServicioClass(fleteSeleccionado.servicio?.estado)}`}
                        >
                          {fleteSeleccionado.servicio?.estado || "N/A"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Tipo Servicio
                        </label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado.servicio?.tipo_servicio || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Modalidad
                        </label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado.servicio?.modalidad_servicio ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Zona
                        </label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado.servicio?.zona || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Fecha Servicio
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatFecha(
                            fleteSeleccionado.servicio?.fecha_servicio,
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Fecha Salida
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatFecha(
                            fleteSeleccionado.servicio?.fecha_salida,
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Hora de Cita
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatHora(fleteSeleccionado.servicio?.hora_cita)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Descripción
                        </label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado.servicio?.descripcion || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detalles de Carga y Ruta */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">
                      Carga y Ruta
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Metros Cúbicos (m³)
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {fleteSeleccionado.servicio?.m3 || "0"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Toneladas (TN)
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {fleteSeleccionado.servicio?.tn || "0"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Origen
                        </label>
                        <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                          <p className="text-sm text-gray-900">
                            {fleteSeleccionado.servicio?.origen || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Destino
                        </label>
                        <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                          <p className="text-sm text-gray-900">
                            {fleteSeleccionado.servicio?.destino || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del Cliente */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">
                      Cliente
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Nombre
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {fleteSeleccionado.servicio?.cliente?.nombre || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Razón Social
                        </label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado.servicio?.cliente?.razon_social ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          RUC
                        </label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado.servicio?.cliente?.ruc || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Documento
                        </label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado.servicio?.cliente
                            ?.numero_documento || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información del Vehículo y Personal */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">
                      Vehículo y Personal
                    </h4>

                    {/* Información del Vehículo */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">
                        Vehículo
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Placa
                          </label>
                          <p className="text-sm font-semibold text-gray-900">
                            {fleteSeleccionado.servicio?.flota?.placa || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Tipo Vehículo
                          </label>
                          <p className="text-sm text-gray-900">
                            {fleteSeleccionado.servicio?.flota?.tipo_vehiculo ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conductores */}
                    {fleteSeleccionado.servicio?.conductor &&
                      fleteSeleccionado.servicio.conductor.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Conductor(es)
                          </h5>
                          <div className="space-y-2">
                            {fleteSeleccionado.servicio.conductor.map(
                              (cond, index) => (
                                <div
                                  key={index}
                                  className="p-2 bg-gray-50 rounded border border-gray-200"
                                >
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-500">
                                        Nombre
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {cond.nombres_completos ||
                                          cond.nombre ||
                                          "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Auxiliares */}
                    {fleteSeleccionado.servicio?.auxiliar &&
                      fleteSeleccionado.servicio.auxiliar.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Auxiliar(es)
                          </h5>
                          <div className="space-y-2">
                            {fleteSeleccionado.servicio.auxiliar.map(
                              (aux, index) => (
                                <div
                                  key={index}
                                  className="p-2 bg-gray-50 rounded border border-gray-200"
                                >
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-500">
                                        Nombre
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {aux.nombres_completos ||
                                          aux.nombre ||
                                          "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de cierre */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleCloseModal}
                variant="secondary"
                size="small"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(TodosLosFletes);