import React, { useState, useCallback, useEffect } from "react";
import {
  Users,
  Filter,
  Calendar,
  RefreshCw,
  X,
  CheckCircle,
  Download,
  Loader,
  MapPin,
  DollarSign,
  Clock,
  FileCheck,
  FileX,
  Building2,
  Package,
  TrendingUp,
  Save,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { monitoreoAPI } from "../../../api/endpoints/monitoreo";
import utilsAPI from "../../../api/endpoints/utils";
import { fletesAPI } from "../../../api/endpoints/fletes";

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

const Rentabilidad = () => {
  const [activeTab, setActiveTab] = useState("sin-gasto"); // "sin-gasto" o "con-gasto"

  // Estados para fletes sin gasto
  const [fletesSinGasto, setFletesSinGasto] = useState([]);
  const [gastoInput, setGastoInput] = useState({});
  const [guardandoGasto, setGuardandoGasto] = useState({});

  // Estados para fletes con gasto
  const [fletesConGasto, setFletesConGasto] = useState([]);

  const [clientesList, setClientesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [metrics, setMetrics] = useState({
    total_clientes: 0,
    monto_total_acumulado: 0,
    total_pendientes: 0,
    facturados: 0,
    no_facturados: 0,
    monto_total_rentabilidad:0,
  });

  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Estados para filtros
  const [filters, setFilters] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    cliente_id: "",
    mes: "",
  });

  // Estados para errores
  const [errors, setErrors] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    rango_fechas: "",
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50, 100];

  // Opciones de meses
  const meses = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  // Cargar lista de clientes al montar el componente
  useEffect(() => {
    cargarClientesList();
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));

      if (activeTab === "sin-gasto") {
        fetchFletesSinGasto(1, pagination.itemsPerPage, filters);
      } else {
        fetchFletesConGasto(1, pagination.itemsPerPage, filters);
      }
    }, 500);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters.fecha_inicio, filters.fecha_fin, filters.cliente_id, activeTab]);

  // Efecto para actualizar rango de fechas cuando cambia el mes
  useEffect(() => {
    if (filters.mes) {
      const year = new Date().getFullYear();
      const fechaInicio = `${year}-${filters.mes}-01`;

      const lastDay = new Date(year, parseInt(filters.mes), 0).getDate();
      const fechaFin = `${year}-${filters.mes}-${lastDay}`;

      setFilters((prev) => ({
        ...prev,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }));
    }
  }, [filters.mes]);

  // Cargar lista de clientes desde la API
  const cargarClientesList = useCallback(async () => {
    try {
      const response = await utilsAPI.getClientesList();
      setClientesList(response || []);
    } catch (err) {
      console.error("Error cargando lista de clientes:", err);
      setError("Error al cargar la lista de clientes");
    }
  }, []);

  // Función para cargar fletes SIN gasto
  const fetchFletesSinGasto = useCallback(
    async (
      page = 1,
      itemsPerPage = pagination.itemsPerPage,
      filtersToUse = filters,
    ) => {
      setIsLoading(true);
      setError(null);

      if (filtersToUse.fecha_inicio && filtersToUse.fecha_fin) {
        if (filtersToUse.fecha_inicio > filtersToUse.fecha_fin) {
          setErrors((prev) => ({
            ...prev,
            rango_fechas:
              "La fecha de inicio no puede ser mayor a la fecha de fin",
          }));
          setIsLoading(false);
          return;
        }
      }

      try {
        const apiFilters = {
          page: page,
          page_size: itemsPerPage,
          solo_con_inversion: false,
        };

        if (filtersToUse.fecha_inicio) {
          apiFilters.fecha_servicio_desde = filtersToUse.fecha_inicio;
        }

        if (filtersToUse.fecha_fin) {
          apiFilters.fecha_servicio_hasta = filtersToUse.fecha_fin;
        }

        if (filtersToUse.cliente_id && filtersToUse.cliente_id.trim() !== "") {
          apiFilters.cliente = filtersToUse.cliente_id.trim();
        }

        const response = await monitoreoAPI.getFletes(apiFilters);

        setFletesSinGasto(response.items || []);
        setMetrics(
          response.metrics || {
            total_clientes: 0,
            monto_total_acumulado: 0,
            total_pendientes: 0,
            facturados: 0,
            no_facturados: 0,
            monto_inversion_total: 0,
            monto_total_rentabilidad:0
          },
        );

        setPagination({
          currentPage: response.pagination.page,
          itemsPerPage: response.pagination.page_size,
          totalItems: response.pagination.total,
          totalPages: response.pagination.total_pages,
          hasNext: response.pagination.has_next,
          hasPrev: response.pagination.has_prev,
        });
      } catch (err) {
        setError(
          "Error al cargar los fletes sin gasto: " +
            (err.message || "Error desconocido"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Función para cargar fletes CON gasto
  const fetchFletesConGasto = useCallback(
    async (
      page = 1,
      itemsPerPage = pagination.itemsPerPage,
      filtersToUse = filters,
    ) => {
      setIsLoading(true);
      setError(null);

      if (filtersToUse.fecha_inicio && filtersToUse.fecha_fin) {
        if (filtersToUse.fecha_inicio > filtersToUse.fecha_fin) {
          setErrors((prev) => ({
            ...prev,
            rango_fechas:
              "La fecha de inicio no puede ser mayor a la fecha de fin",
          }));
          setIsLoading(false);
          return;
        }
      }

      try {
        const apiFilters = {
          page: page,
          page_size: itemsPerPage,
          solo_con_inversion: true,
        };

        if (filtersToUse.fecha_inicio) {
          apiFilters.fecha_servicio_desde = filtersToUse.fecha_inicio;
        }

        if (filtersToUse.fecha_fin) {
          apiFilters.fecha_servicio_hasta = filtersToUse.fecha_fin;
        }

        if (filtersToUse.cliente_id && filtersToUse.cliente_id.trim() !== "") {
          apiFilters.cliente = filtersToUse.cliente_id.trim();
        }

        const response = await monitoreoAPI.getFletes(apiFilters);

        setFletesConGasto(response.items || []);
        setMetrics(
          response.metrics || {
            total_clientes: 0,
            monto_total_acumulado: 0,
            total_pendientes: 0,
            facturados: 0,
            no_facturados: 0,
            monto_inversion_total: 0,
            monto_total_rentabilidad:0
          },
        );

        setPagination({
          currentPage: response.pagination.page,
          itemsPerPage: response.pagination.page_size,
          totalItems: response.pagination.total,
          totalPages: response.pagination.total_pages,
          hasNext: response.pagination.has_next,
          hasPrev: response.pagination.has_prev,
        });
      } catch (err) {
        setError(
          "Error al cargar los fletes con gasto: " +
            (err.message || "Error desconocido"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Función para guardar gasto
  const handleGuardarGasto = useCallback(
    async (fleteId) => {
      const monto = gastoInput[fleteId];

      if (!monto || parseFloat(monto) <= 0) {
        setError("Ingrese un monto válido");
        setTimeout(() => setError(null), 3000);
        return;
      }

      setGuardandoGasto((prev) => ({ ...prev, [fleteId]: true }));

      try {
        const res = await monitoreoAPI.registrarGastoInversion(fleteId, monto);
        if (res.status === "success") {
          setSuccessMessage(
            `Gasto de S/ ${parseFloat(monto).toFixed(2)} registrado correctamente`,
          );
        }
        // Limpiar input
        setGastoInput((prev) => {
          const newInput = { ...prev };
          delete newInput[fleteId];
          return newInput;
        });

        // Recargar datos
        fetchFletesSinGasto(
          pagination.currentPage,
          pagination.itemsPerPage,
          filters,
        );

        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError("Error al registrar el gasto: " + err.message);
      } finally {
        setGuardandoGasto((prev) => ({ ...prev, [fleteId]: false }));
      }
    },
    [
      gastoInput,
      fetchFletesSinGasto,
      pagination.currentPage,
      pagination.itemsPerPage,
      filters,
    ],
  );

  // Manejar tecla Enter en input de gasto
  const handleKeyPress = useCallback(
    (e, fleteId) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleGuardarGasto(fleteId);
      }
    },
    [handleGuardarGasto],
  );

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "mes") {
      setFilters((prev) => ({
        ...prev,
        fecha_inicio: "",
        fecha_fin: "",
      }));
    }

    if (key === "fecha_inicio" || key === "fecha_fin") {
      setErrors((prev) => ({
        ...prev,
        [key]: "",
        rango_fechas: "",
      }));
    }
  }, []);

  // Handler para seleccionar fecha manual
  const handleDateChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      mes: "",
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
      rango_fechas: "",
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      fecha_inicio: "",
      fecha_fin: "",
      cliente_id: "",
      mes: "",
    });
    setErrors({
      fecha_inicio: "",
      fecha_fin: "",
      rango_fechas: "",
    });
  }, []);

  const handleRefresh = useCallback(() => {
    if (activeTab === "sin-gasto") {
      fetchFletesSinGasto(
        pagination.currentPage,
        pagination.itemsPerPage,
        filters,
      );
    } else {
      fetchFletesConGasto(
        pagination.currentPage,
        pagination.itemsPerPage,
        filters,
      );
    }
  }, [
    activeTab,
    fetchFletesSinGasto,
    fetchFletesConGasto,
    pagination.currentPage,
    pagination.itemsPerPage,
    filters,
  ]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (activeTab === "sin-gasto") {
        fetchFletesSinGasto(newPage, pagination.itemsPerPage, filters);
      } else {
        fetchFletesConGasto(newPage, pagination.itemsPerPage, filters);
      }
    },
    [
      activeTab,
      fetchFletesSinGasto,
      fetchFletesConGasto,
      pagination.itemsPerPage,
      filters,
    ],
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      if (activeTab === "sin-gasto") {
        fetchFletesSinGasto(1, newItemsPerPage, filters);
      } else {
        fetchFletesConGasto(1, newItemsPerPage, filters);
      }
    },
    [activeTab, fetchFletesSinGasto, fetchFletesConGasto, filters],
  );

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  // Exportar a Excel
  const handleExportarExcel = useCallback(async () => {
    try {
      setLoadingDownload(true);

      const filtersForAPI = {
        fecha_servicio_desde: filters.fecha_inicio,
        fecha_servicio_hasta: filters.fecha_fin,
        cliente_nombre: filters.cliente_id,
        con_gasto: activeTab === "con-gasto",
      };

      const blob = await fletesAPI.exportAllFletesExcel(filtersForAPI);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `rentabilidad_fletes_${activeTab}_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Exportación completada exitosamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Error al exportar: " + err.message);
    } finally {
      setLoadingDownload(false);
    }
  }, [filters, activeTab]);

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(monto || 0);
  };

  // Obtener nombre del cliente por ID
  const getNombreCliente = (clienteId) => {
    if (!clienteId) return "N/A";
    const cliente = clientesList.find(
      (c) => c.id === clienteId || c.value === clienteId,
    );
    return cliente?.nombre || cliente?.label || clienteId;
  };

  const currentData =
    activeTab === "sin-gasto" ? fletesSinGasto : fletesConGasto;

  // Loading inicial
  if (isLoading && currentData.length === 0) {
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
      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <X className="h-5 w-5 mr-2" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => handleTabChange("sin-gasto")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${
                activeTab === "sin-gasto"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <Package className="h-5 w-5" />
            Fletes SIN gasto
          </button>
          <button
            onClick={() => handleTabChange("con-gasto")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${
                activeTab === "con-gasto"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <TrendingUp className="h-5 w-5" />
            Fletes CON gasto
          </button>
        </nav>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-6">
        {/* Total Venta Neta */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Total Vendido (sin IGV)
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {formatearMonto(metrics.monto_total_acumulado)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.total_fletes} fletes
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Total Invertido
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {formatearMonto(metrics.monto_inversion_total)}
          </div>
          
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Total De Rentabilidad
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {formatearMonto(metrics.monto_total_rentabilidad)}
          </div>
          
        </div>

        {/* Pendientes */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-yellow-100 rounded-md">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Por facturar
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {metrics.total_pendientes}
          </div>
          <div className="text-xs text-gray-500 mt-1">Fletes pendientes</div>
        </div>

        {/* No facturados */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-orange-100 rounded-md">
              <FileX className="h-4 w-4 text-orange-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Sin factura
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {metrics.valorizados_sin_factura}
          </div>
          <div className="text-xs text-gray-500 mt-1">Sin factura</div>
        </div>

        {/* Facturados */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-green-100 rounded-md">
              <FileCheck className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Con factura
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {metrics.valorizados_con_factura}
          </div>
          <div className="text-xs text-gray-500 mt-1">Con factura</div>
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
          </div>

          <div className="flex items-center space-x-2">
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

            <Button
              onClick={handleExportarExcel}
              disabled={loadingDownload}
              variant="primary"
              size="small"
            >
              {loadingDownload ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar a Excel
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mes
            </label>
            <select
              value={filters.mes}
              onChange={(e) => handleFilterChange("mes", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Seleccionar mes</option>
              {meses.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Seleccione un mes para rango automático
            </p>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Cliente
            </label>
            <select
              value={filters.cliente_id}
              onChange={(e) => handleFilterChange("cliente_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Todos los clientes</option>
              {clientesList.map((cliente) => (
                <option key={cliente} value={cliente}>
                  {cliente}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => handleDateChange("fecha_inicio", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              max={filters.fecha_fin || new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => handleDateChange("fecha_fin", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              min={filters.fecha_inicio}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Error de rango de fechas */}
        {errors.rango_fechas && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">{errors.rango_fechas}</p>
          </div>
        )}
      </div>

      {/* Información de registros */}
      {currentData.length > 0 && (
        <div className="mb-4 text-sm text-gray-600 text-center">
          Mostrando {currentData.length} de {pagination.totalItems} registros
          {filters.cliente_id && " · Filtrado por cliente"}
          {(filters.fecha_inicio || filters.fecha_fin) &&
            " · Filtrado por rango de fechas"}
          <span className="font-medium ml-2">
            {activeTab === "sin-gasto" ? "SIN gasto" : "CON gasto"}
          </span>
        </div>
      )}

      {/* Tabla de Fletes */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Cliente
                </th>
                
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Fecha de Servicio
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Origen
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Destino
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Placa
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Servicio
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Monto
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Inversión
                </th>
                {activeTab === "sin-gasto" && (
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">
                    Registrar Gasto
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentData.map((flete) => (
                <tr
                  key={flete.id}
                  className="border-b border-gray-200 hover:bg-blue-50"
                >
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {flete.servicio?.cliente?.nombre || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      RUC: {flete.servicio?.cliente?.ruc || ""}
                    </div>
                  </td>

                  

                  <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                    <div className="text-gray-900">
                      {formatFecha(flete?.servicio?.fecha_servicio)}
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-900">
                        {flete.servicio?.origen?.split(",")[0] || "N/A"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-900">
                        {flete.servicio?.destino?.split(",")[0] || "N/A"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {flete.servicio?.flota?.placa || "N/A"}
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {flete.servicio?.tipo_servicio || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {flete.servicio?.modalidad_servicio || ""}
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {formatearMonto(flete.monto_flete)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {flete.estado_flete === "PENDIENTE" ? (
                        <span className="text-yellow-600 font-medium">
                          Pendiente
                        </span>
                      ) : flete.estado_flete === "VALORIZADO" &&
                        flete.pertenece_a_factura ? (
                        <span className="text-green-600 font-medium">
                          Facturado
                        </span>
                      ) : (
                        <span className="text-orange-600 font-medium">
                          Sin factura
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-gray-200 text-right text-gray-900 font-medium">
  {flete.monto_inversion > 0 ? `S/ ${flete.monto_inversion.toFixed(2)}` : "No Ingresado"}
</td>  

                  {activeTab === "sin-gasto" && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={gastoInput[flete.id] || ""}
                          onChange={(e) =>
                            setGastoInput((prev) => ({
                              ...prev,
                              [flete.id]: e.target.value,
                            }))
                          }
                          onKeyPress={(e) => handleKeyPress(e, flete.id)}
                          placeholder="Monto"
                          className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          disabled={guardandoGasto[flete.id]}
                        />
                        <Button
                          onClick={() => handleGuardarGasto(flete.id)}
                          size="small"
                          variant="primary"
                          icon={Save}
                          disabled={
                            guardandoGasto[flete.id] || !gastoInput[flete.id]
                          }
                          isLoading={guardandoGasto[flete.id]}
                        >
                          Guardar
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {currentData.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron registros
            </h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some((f) => f && f.trim() !== "")
                ? "Intenta ajustar los filtros de búsqueda"
                : `No hay fletes ${activeTab === "sin-gasto" ? "sin gasto" : "con gasto"} registrados`}
            </p>
            <Button onClick={clearFilters} size="small">
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Paginación */}
      {currentData.length > 0 && (
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
    </div>
  );
};

export default Rentabilidad;
