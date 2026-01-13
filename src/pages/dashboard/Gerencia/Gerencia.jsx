import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DollarSign,
  Search,
  Filter,
  FileText,
  Eye,
  Download,
  Calendar,
  Clock,
  Building,
  Truck,
  User,
  ChevronDown,
  ChevronUp,
  X,
  FileDigit,
  Info,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Filter as FilterIcon,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Pagination from "../../../components/common/Pagination/Pagination";
import Modal from "../../../components/common/Modal/Modal";

// API
import { facturacionGestionAPI } from "../../../api/endpoints/facturacionGestion";

// Utils
import {
  getEstadoPagoColor,
  getEstadoDetraccionColor,
  getPrioridadColor,
  formatCurrency,
} from "../../../utils/facturacionUtils";

const Gerencia = () => {
  const [gestiones, setGestiones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Separar itemsPerPage del objeto pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estado para modal de detalles
  const [modalDetails, setModalDetails] = useState({
    show: false,
    gestion: null,
  });
  // Estados de paginación (SIN itemsPerPage aquí)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Estados para filtros avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estado_pago_neto: "",
    estado_detraccion: "",
    prioridad: "",
    nombre_cuenta: "",
    nombre_cliente: "",
    nombre_proveedor: "",
    nombre_conductor: "",
    nombre_auxiliar: "",
    fecha_emision_inicio: "",
    fecha_emision_fin: "",
    fecha_vencimiento_inicio: "",
    fecha_vencimiento_fin: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Estados para ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Estados para columnas visibles
  const [visibleColumns, setVisibleColumns] = useState({
    factura: true,
    cliente: true,
    proveedor: true,
    cuenta: true,
    placa: true,
    conductor: true,
    auxiliar: true,
    fecha_emision: true,
    fecha_vencimiento: true,
    monto_total: true,
    neto_cobrar: true,
    detraccion: true,
    estado_pago: true,
    estado_detraccion: true,
    prioridad: true,
    fecha_probable: true,
    saldo: true,
  });

  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Estadísticas del dashboard
  const [estadisticas, setEstadisticas] = useState({
    total_gestiones: 0,
    vencidas: 0,
    por_estado_pago: {},
    por_estado_detraccion: {},
    por_prioridad: {},
    montos_totales: {
      neto: "0.00",
      pagado: "0.00",
      detraccion: "0.00",
      pendiente: "0.00",
    },
  });

  const itemsPerPageOptions = [10, 25, 50, 100];
  const isInitialMount = useRef(true);

  // Opciones de filtros
  const filterOptions = {
    estado_pago: [
      { value: "", label: "Todos los estados" },
      { value: "Pendiente", label: "Pendiente" },
      { value: "Pagado", label: "Pagado" },
      { value: "Pagado Parcial", label: "Pagado Parcial" },
      { value: "Vencido", label: "Vencido" },
    ],
    estado_detraccion: [
      { value: "", label: "Todos los estados" },
      { value: "Pendiente", label: "Pendiente" },
      { value: "Pagado", label: "Pagado" },
      { value: "No Aplica", label: "No Aplica" },
    ],
    prioridad: [
      { value: "", label: "Todas las prioridades" },
      { value: "Alta", label: "Alta" },
      { value: "Media", label: "Media" },
      { value: "Baja", label: "Baja" },
    ],
    montos_estado: [
      { value: "", label: "Todos" },
      { value: "con_saldo", label: "Con saldo pendiente" },
      { value: "sin_saldo", label: "Sin saldo pendiente" },
      { value: "con_detraccion", label: "Con detracción pendiente" },
      { value: "sin_detraccion", label: "Sin detracción pendiente" },
    ],
  };

  // Función principal para cargar gestiones - CORREGIDA
  const fetchGestiones = useCallback(
    async (page = 1, pageSize = itemsPerPage) => {
      setIsLoadingData(true);
      setError(null);
      try {
        const filtersForAPI = {};

        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (value !== "" && value !== undefined && value !== null) {
            filtersForAPI[key] = value;
          }
        });

        if (appliedSearch) {
          filtersForAPI.codigo_factura = appliedSearch;
        }

        const response = await facturacionGestionAPI.getAllGestiones(
          filtersForAPI,
          {
            page: page,
            pageSize: pageSize,
          }
        );

        setGestiones(response.items);

        setPagination({
          currentPage: response.pagination.page,
          totalItems: response.pagination.total,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNext,
          hasPrev: response.pagination.hasPrev,
        });

        await calcularEstadisticas();
      } catch (err) {
        setError("Error al cargar las gestiones: " + err.message);
        console.error("Error fetching gestiones:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingData(false);
      }
    },
    [appliedFilters, appliedSearch, itemsPerPage] // itemsPerPage como dependencia externa
  );

  // Calcular estadísticas del dashboard
  const calcularEstadisticas = useCallback(async () => {
    try {
      const stats = await facturacionGestionAPI.getEstadisticasDashboard();
      setEstadisticas(stats);
    } catch (err) {
      console.error("Error al cargar estadísticas del dashboard:", err);
    }
  }, []);

  useEffect(() => {
    fetchGestiones(1, pagination.itemsPerPage);
  }, [appliedFilters, appliedSearch, pagination.itemsPerPage, fetchGestiones]);

  // Carga inicial
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

    // Handler para ver detalles
  const handleViewDetails = useCallback((gestion) => {
    setModalDetails({
      show: true,
      gestion: gestion,
    });
  }, []);

  // Handler para cerrar modal
  const handleCloseModal = useCallback(() => {
    setModalDetails({
      show: false,
      gestion: null,
    });
  }, []);

  // Handler para exportar a Excel
  const handleExport = useCallback(async () => {
    try {
      const filtersForAPI = {};
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          filtersForAPI[key] = value;
        }
      });

      if (appliedSearch) {
        filtersForAPI.codigo_factura = appliedSearch;
      }

      const blob = await facturacionGestionAPI.exportToExcel(filtersForAPI);
      facturacionGestionAPI.downloadExcel(
        blob,
        `gestion_facturas_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err) {
      setError("Error al exportar: " + err.message);
    }
  }, [appliedFilters, appliedSearch]);

  // Handler para ordenamiento
  const requestSort = useCallback(
    (key) => {
      let direction = "ascending";
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  // Función para ordenar gestiones
  const sortedGestiones = useCallback(() => {
    const sortableItems = [...gestiones];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case "factura":
            aValue = a.codigo_factura || "";
            bValue = b.codigo_factura || "";
            break;
          case "cliente":
            aValue =
              a.datos_completos?.fletes?.[0]?.servicio?.nombre_cliente || "";
            bValue =
              b.datos_completos?.fletes?.[0]?.servicio?.nombre_cliente || "";
            break;
          case "monto_total":
            aValue = parseFloat(a.datos_completos?.monto_total || 0);
            bValue = parseFloat(b.datos_completos?.monto_total || 0);
            break;
          case "fecha_vencimiento":
            aValue = new Date(a.datos_completos?.fecha_vencimiento || "");
            bValue = new Date(b.datos_completos?.fecha_vencimiento || "");
            break;
          case "estado_pago":
            aValue = a.estado_pago_neto || "";
            bValue = b.estado_pago_neto || "";
            break;
          case "saldo":
            aValue = parseFloat(a.saldo_pendiente || 0);
            bValue = parseFloat(b.saldo_pendiente || 0);
            break;
          default:
            aValue = a[sortConfig.key] || "";
            bValue = b[sortConfig.key] || "";
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [gestiones, sortConfig]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    const emptyFilters = {
      estado_pago_neto: "",
      estado_detraccion: "",
      prioridad: "",
      nombre_cuenta: "",
      nombre_cliente: "",
      nombre_proveedor: "",
      nombre_conductor: "",
      nombre_auxiliar: "",
      fecha_emision_inicio: "",
      fecha_emision_fin: "",
      fecha_vencimiento_inicio: "",
      fecha_vencimiento_fin: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchTerm("");
    setAppliedSearch("");
    setShowFilters(false);
  }, []);

  // Aplicar filtros
  const aplicarFiltros = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  // Handler para búsqueda (solo código de factura)
  const handleSearch = useCallback(() => {
    setAppliedSearch(searchTerm);
  }, [searchTerm]);

  // ✅ Handlers corregidos
  const handlePageChange = useCallback(
    (newPage) => {
      fetchGestiones(newPage, itemsPerPage);
    },
    [fetchGestiones, itemsPerPage]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      setItemsPerPage(newItemsPerPage);
      fetchGestiones(1, newItemsPerPage);
    },
    [fetchGestiones]
  );

  // Handler para tecla Enter en búsqueda
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      const fecha = new Date(dateString);

      if (dateString.includes("-") && !dateString.includes("T")) {
        fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
      }

      return fecha.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  // Renderizar panel de filtros desplegable
  const renderFiltersPanel = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 mt-2 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* Cliente */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <input
            type="text"
            value={filters.nombre_cliente}
            onChange={(e) =>
              setFilters({ ...filters, nombre_cliente: e.target.value })
            }
            placeholder="Buscar cliente..."
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        {/* Nombre de Cuenta */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nombre de Cuenta
          </label>
          <input
            type="text"
            value={filters.nombre_cuenta}
            onChange={(e) =>
              setFilters({ ...filters, nombre_cuenta: e.target.value })
            }
            placeholder="Buscar cuenta..."
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

       

        {/* Proveedor */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Proveedor
          </label>
          <input
            type="text"
            value={filters.nombre_proveedor}
            onChange={(e) =>
              setFilters({ ...filters, nombre_proveedor: e.target.value })
            }
            placeholder="Buscar proveedor..."
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Estado de Pago */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado de Pago
          </label>
          <select
            value={filters.estado_pago_neto}
            onChange={(e) =>
              setFilters({ ...filters, estado_pago_neto: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {filterOptions.estado_pago.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Conductor */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Conductor
          </label>
          <input
            type="text"
            value={filters.nombre_conductor}
            onChange={(e) =>
              setFilters({ ...filters, nombre_conductor: e.target.value })
            }
            placeholder="Buscar conductor..."
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Auxiliar */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Auxiliar
          </label>
          <input
            type="text"
            value={filters.nombre_auxiliar}
            onChange={(e) =>
              setFilters({ ...filters, nombre_auxiliar: e.target.value })
            }
            placeholder="Buscar auxiliar..."
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Estado de Detracción */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado de Detracción
          </label>
          <select
            value={filters.estado_detraccion}
            onChange={(e) =>
              setFilters({ ...filters, estado_detraccion: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {filterOptions.estado_detraccion.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            value={filters.prioridad}
            onChange={(e) =>
              setFilters({ ...filters, prioridad: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {filterOptions.prioridad.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha Emisión - Desde */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Emisión (Desde)
          </label>
          <input
            type="date"
            value={filters.fecha_emision_inicio}
            onChange={(e) =>
              setFilters({ ...filters, fecha_emision_inicio: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Fecha Emisión - Hasta */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Emisión (Hasta)
          </label>
          <input
            type="date"
            value={filters.fecha_emision_fin}
            onChange={(e) =>
              setFilters({ ...filters, fecha_emision_fin: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Fecha Vencimiento - Desde */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Vencimiento (Desde)
          </label>
          <input
            type="date"
            value={filters.fecha_vencimiento_inicio}
            onChange={(e) =>
              setFilters({
                ...filters,
                fecha_vencimiento_inicio: e.target.value,
              })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Fecha Vencimiento - Hasta */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Vencimiento (Hasta)
          </label>
          <input
            type="date"
            value={filters.fecha_vencimiento_fin}
            onChange={(e) =>
              setFilters({ ...filters, fecha_vencimiento_fin: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Botones de acción de filtros */}
      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
        <Button
          onClick={aplicarFiltros}
          variant="primary"
          className="text-sm px-4 py-1.5"
        >
          Aplicar Filtros
        </Button>
        <Button
          onClick={clearFilters}
          variant="secondary"
          className="text-sm px-4 py-1.5"
        >
          Limpiar Todo
        </Button>
      </div>
    </div>
  );

  // Función para renderizar detalles de gestión (mantenida igual)
  const renderDetallesGestion = (gestion) => {
    if (!gestion) return null;

    const datos = gestion.datos_completos || {};
    const fletes = datos.fletes || [];

    return (
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {gestion.codigo_factura || "SIN CÓDIGO"}
              </h3>
              <p className="text-sm text-gray-600">
                Última actualización: {formatDate(gestion.ultima_actualizacion)}
              </p>
            </div>
            <div className="flex space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoPagoColor(
                  gestion.estado_pago_neto
                )}`}
              >
                {gestion.estado_pago_neto}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadColor(
                  gestion.prioridad
                )}`}
              >
                {gestion.prioridad}
              </span>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Montos */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Montos
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Monto Total Factura
                </span>
                <span className="text-sm font-semibold">
                  S/ {parseFloat(datos.monto_total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monto Neto</span>
                <span className="text-sm font-semibold text-green-600">
                  S/ {parseFloat(gestion.monto_neto || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monto Detracción</span>
                <span className="text-sm font-semibold text-red-600">
                  S/ {parseFloat(gestion.monto_detraccion || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pagado Acumulado</span>
                <span className="text-sm font-semibold text-blue-600">
                  S/{" "}
                  {parseFloat(gestion.monto_pagado_acumulado || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium text-gray-900">
                  Saldo Pendiente
                </span>
                <span className="text-sm font-bold text-orange-600">
                  S/ {parseFloat(gestion.saldo_pendiente || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Estados */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Estados
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Estado Pago Neto
                </p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoPagoColor(
                    gestion.estado_pago_neto
                  )}`}
                >
                  {gestion.estado_pago_neto}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Estado Detracción
                </p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoDetraccionColor(
                    gestion.estado_detraccion
                  )}`}
                >
                  {gestion.estado_detraccion}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Prioridad</p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPrioridadColor(
                    gestion.prioridad
                  )}`}
                >
                  {gestion.prioridad}
                </span>
              </div>
              {gestion.tasa_detraccion && (
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Tasa Detracción
                  </p>
                  <p className="text-sm text-gray-900">
                    {gestion.tasa_detraccion}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de la factura */}
        <div className="border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <FileDigit className="h-4 w-4 mr-2" />
            Información de Factura
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Número Factura
              </p>
              <p className="text-sm text-gray-900">
                {datos.numero_factura || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Fecha Emisión</p>
              <p className="text-sm text-gray-900">
                {formatDate(datos.fecha_emision)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Fecha Vencimiento
              </p>
              <p className="text-sm text-gray-900">
                {formatDate(datos.fecha_vencimiento)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Fecha Probable Pago
              </p>
              <p className="text-sm text-gray-900">
                {formatDate(gestion.fecha_probable_pago)}
              </p>
            </div>
          </div>
        </div>

        {/* Información de entidades */}
        {fletes.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Información de Entidades
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Cliente</p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.nombre_cliente || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Proveedor</p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.nombre_proveedor || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Cuenta</p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.nombre_cuenta || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información de transporte */}
        {fletes.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Información de Transporte
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Placa</p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.placa_flota || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Conductor</p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.nombre_conductor || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Auxiliar</p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.nombre_auxiliar || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Tipo Servicio
                </p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.tipo_servicio || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading && gestiones.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Cargando gestiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-sm">
      {/* Mensajes de éxito/error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* PANEL DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Total Gestiones */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Total Gestiones
              </p>
              <p className="text-lg font-bold text-gray-900">
                {estadisticas.total_gestiones || 0}
              </p>
            </div>
            <FileText className="text-blue-500 h-5 w-5" />
          </div>
        </div>

        {/* Pendiente Total */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Total Pendiente
              </p>
              <p className="text-lg font-bold text-orange-600">
                S/ {estadisticas.montos_totales?.pendiente || "0.00"}
              </p>
            </div>
            <Clock className="text-orange-500 h-5 w-5" />
          </div>
        </div>

        {/* Detracción Total */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Total Detracción
              </p>
              <p className="text-lg font-bold text-red-600">
                S/ {estadisticas.montos_totales?.detraccion || "0.00"}
              </p>
            </div>
            <AlertTriangle className="text-red-500 h-5 w-5" />
          </div>
        </div>

        {/* Facturas Vencidas */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Facturas Vencidas
              </p>
              <p className="text-lg font-bold text-red-600">
                {estadisticas.vencidas || 0}
              </p>
            </div>
            <Clock className="text-red-500 h-5 w-5" />
          </div>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Buscador solo para código de factura */}
          <div className="flex items-center gap-2 flex-1 min-w-[250px]">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar por código de factura..."
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm"
            >
              Buscar
            </Button>
          </div>

          {/* Botón para mostrar/ocultar filtros */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
            icon={FilterIcon}
            className="px-3 py-1.5 text-sm"
          >
            Filtros{" "}
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </Button>

          {/* Botones de acción */}
          <div className="flex gap-2 ml-auto">
            <div className="relative">
              <Button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                variant="secondary"
                className="px-3 py-1.5 text-sm"
              >
                {showColumnMenu ? "Cerrar" : "Mostrar Columnas Activas"}
              </Button>
              {showColumnMenu && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">
                      Mostrar/Ocultar Columnas
                    </h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto text-xs">
                      {Object.entries({
                        factura: "Factura",
                        cliente: "Cliente",
                        proveedor: "Proveedor",
                        cuenta: "Cuenta",
                        placa: "Placa",
                        conductor: "Conductor",
                        auxiliar: "Auxiliar",
                        fecha_emision: "Fecha Emisión",
                        fecha_vencimiento: "Fecha Vencimiento",
                        monto_total: "Monto Total",
                        neto_cobrar: "Neto a Cobrar",
                        detraccion: "Detracción",
                        estado_pago: "Estado Pago",
                        estado_detraccion: "Estado Detracción",
                        prioridad: "Prioridad",
                        fecha_probable: "Fecha Probable",
                        saldo: "Saldo Pendiente",
                      }).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center space-x-2 px-1 py-1 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[key]}
                            onChange={(e) =>
                              setVisibleColumns({
                                ...visibleColumns,
                                [key]: e.target.checked,
                              })
                            }
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={handleExport}
              variant="secondary"
              icon={Download}
              className="px-3 py-1.5 text-sm"
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Panel de filtros desplegable */}
        {showFilters && renderFiltersPanel()}
      </div>

      {/* Loading indicator durante carga de datos */}
      {isLoadingData && (
        <div className="flex items-center justify-center p-4 bg-white/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-10">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
          <span className="text-sm text-gray-600">Cargando datos...</span>
        </div>
      )}

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {visibleColumns.factura && (
                  <th
                    className="py-2 px-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("factura")}
                  >
                    <div className="flex items-center">
                      Factura
                      {sortConfig.key === "factura" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        ))}
                    </div>
                  </th>
                )}

                {visibleColumns.cliente && (
                  <th
                    className="py-2 px-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("cliente")}
                  >
                    <div className="flex items-center">
                      Cliente
                      {sortConfig.key === "cliente" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        ))}
                    </div>
                  </th>
                )}

                {visibleColumns.cuenta && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Cuenta
                  </th>
                )}

                {visibleColumns.proveedor && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Proveedor
                  </th>
                )}

                {visibleColumns.placa && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Placa
                  </th>
                )}

                {visibleColumns.conductor && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Conductor
                  </th>
                )}

                {visibleColumns.auxiliar && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Auxiliar
                  </th>
                )}

                {visibleColumns.fecha_emision && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Emisión
                  </th>
                )}

                {visibleColumns.fecha_vencimiento && (
                  <th
                    className="py-2 px-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("fecha_vencimiento")}
                  >
                    <div className="flex items-center">
                      Vencimiento
                      {sortConfig.key === "fecha_vencimiento" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        ))}
                    </div>
                  </th>
                )}

                {visibleColumns.monto_total && (
                  <th
                    className="py-2 px-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("monto_total")}
                  >
                    <div className="flex items-center">
                      Total Factura
                      {sortConfig.key === "monto_total" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        ))}
                    </div>
                  </th>
                )}

                {visibleColumns.neto_cobrar && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Neto a Cobrar
                  </th>
                )}

                {visibleColumns.detraccion && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Detracción
                  </th>
                )}

                {visibleColumns.estado_pago && (
                  <th
                    className="py-2 px-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("estado_pago")}
                  >
                    <div className="flex items-center">
                      Estado Pago
                      {sortConfig.key === "estado_pago" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        ))}
                    </div>
                  </th>
                )}

                {visibleColumns.estado_detraccion && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Estado Detrac.
                  </th>
                )}

                {visibleColumns.prioridad && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Prioridad
                  </th>
                )}

                {visibleColumns.fecha_probable && (
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">
                    Fecha Probable
                  </th>
                )}

                {visibleColumns.saldo && (
                  <th
                    className="py-2 px-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("saldo")}
                  >
                    <div className="flex items-center">
                      Saldo Pendiente
                      {sortConfig.key === "saldo" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        ))}
                    </div>
                  </th>
                )}

                <th className="py-2 px-3 text-left font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedGestiones().map((gestion) => {
                const datos = gestion.datos_completos || {};
                const flete = datos.fletes?.[0] || {};
                const servicio = flete.servicio || {};
                const montoTotal = parseFloat(datos.monto_total || 0);
                const montoNeto = parseFloat(gestion.monto_neto || 0);
                const montoDetraccion = parseFloat(
                  gestion.monto_detraccion || 0
                );
                const saldoPendiente = parseFloat(gestion.saldo_pendiente || 0);
                const montoPagado = parseFloat(
                  gestion.monto_pagado_acumulado || 0
                );

                return (
                  <tr
                    key={gestion.id}
                    className="border-b border-gray-100 hover:bg-gray-50 font-small" 
                  >
                    {visibleColumns.factura && (
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-900">
                          {gestion.codigo_factura}
                        </div>
                        {/* <div className="text-gray-500">
                          {datos.numero_factura}
                        </div> */}
                      </td>
                    )}

                    {visibleColumns.cliente && (
                      <td className="py-2 px-3">
                        <div className="text-gray-900">
                          {servicio.nombre_cliente || "N/A"}
                        </div>
                      </td>
                    )}

                    {visibleColumns.cuenta && (
                      <td className="py-2 px-3 text-gray-700">
                        {servicio.nombre_cuenta || "N/A"}
                      </td>
                    )}

                    {visibleColumns.proveedor && (
                      <td className="py-2 px-3 text-gray-700">
                        {servicio.nombre_proveedor || "N/A"}
                      </td>
                    )}

                    {visibleColumns.placa && (
                      <td className="py-2 px-3 text-gray-700">
                        {servicio.placa_flota || "N/A"}
                      </td>
                    )}

                    {visibleColumns.conductor && (
                      <td className="py-2 px-3 text-gray-700">
                        {servicio.nombre_conductor || "N/A"}
                      </td>
                    )}

                    {visibleColumns.auxiliar && (
                      <td className="py-2 px-3 text-gray-700">
                        {servicio.nombre_auxiliar || "N/A"}
                      </td>
                    )}

                    {visibleColumns.fecha_emision && (
                      <td className="py-2 px-3 text-gray-700">
                        {formatDate(datos.fecha_emision)}
                      </td>
                    )}

                    {visibleColumns.fecha_vencimiento && (
                      <td className="py-2 px-3 text-gray-700">
                        {formatDate(datos.fecha_vencimiento)}
                      </td>
                    )}

                    {visibleColumns.monto_total && (
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-900">
                          S/ {montoTotal.toFixed(2)}
                        </div>
                      </td>
                    )}

                    {visibleColumns.neto_cobrar && (
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-900">
                          S/ {montoNeto.toFixed(2)}
                        </div>
                        <div className="text-gray-500">
                          Pagado: S/ {montoPagado.toFixed(2)}
                        </div>
                      </td>
                    )}

                    {visibleColumns.detraccion && (
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-900">
                          S/ {montoDetraccion.toFixed(2)}
                        </div>
                        <div className="text-gray-500">
                          {gestion.tasa_detraccion}%
                        </div>
                      </td>
                    )}

                    {visibleColumns.estado_pago && (
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getEstadoPagoColor(
                            gestion.estado_pago_neto
                          )}`}
                        >
                          {gestion.estado_pago_neto}
                        </span>
                      </td>
                    )}

                    {visibleColumns.estado_detraccion && (
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getEstadoDetraccionColor(
                            gestion.estado_detraccion
                          )}`}
                        >
                          {gestion.estado_detraccion}
                        </span>
                      </td>
                    )}

                    {visibleColumns.prioridad && (
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getPrioridadColor(
                            gestion.prioridad
                          )}`}
                        >
                          {gestion.prioridad}
                        </span>
                      </td>
                    )}

                    {visibleColumns.fecha_probable && (
                      <td className="py-2 px-3 text-gray-700">
                        {formatDate(gestion.fecha_probable_pago)}
                      </td>
                    )}

                    {visibleColumns.saldo && (
                      <td className="py-2 px-3">
                        <div
                          className={`font-medium ${
                            saldoPendiente > 0
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          S/ {saldoPendiente.toFixed(2)}
                        </div>
                      </td>
                    )}

                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewDetails(gestion)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="Ver detalles"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      {gestiones.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <span className="text-xs text-gray-600">Mostrar</span>
            <select
              className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-600">registros por página</span>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            startIndex={(pagination.currentPage - 1) * itemsPerPage + 1}
            endIndex={Math.min(
              pagination.currentPage * itemsPerPage,
              pagination.totalItems
            )}
            size="small"
          />
        </div>
      )}

      {/* SIN RESULTADOS */}
      {gestiones.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            No se encontraron gestiones
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            {Object.values(appliedFilters).some((f) => f !== "") ||
            appliedSearch
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay gestiones de facturación registradas"}
          </p>
          <div className="flex justify-center space-x-2">
            <Button
              onClick={clearFilters}
              variant="primary"
              className="text-sm px-3 py-1.5"
            >
              Limpiar búsqueda
            </Button>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      <Modal
        isOpen={modalDetails.show}
        onClose={handleCloseModal}
        title={`Detalles de Factura: ${
          modalDetails.gestion?.codigo_factura || ""
        }`}
        size="large"
      >
        {modalDetails.gestion ? (
          renderDetallesGestion(modalDetails.gestion)
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron detalles</p>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleCloseModal}
            variant="secondary"
            className="px-4 py-2 text-sm"
          >
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(Gerencia);
