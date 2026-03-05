import React, { useState, useCallback, useEffect } from "react";
import {
  Truck,
  Filter,
  Calendar,
  RefreshCw,
  X,
  CheckCircle,
  Download,
  Loader,
  MapPin,
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  FileCheck,
  FileX,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { fletesAPI } from "../../../api/endpoints/fletes";
import utilsAPI from "../../../api/endpoints/utils";
import { monitoreoAPI } from "../../../api/endpoints/monitoreo";

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

const MonitoreoPlacas = () => {
  const [fletesData, setFletesData] = useState([]);
  const [placas, setPlacas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [metrics, setMetrics] = useState({
    total_fletes: 0,
    monto_total_acumulado: 0,
    total_pendientes: 0,
    valorizados_con_factura: 0,
    valorizados_sin_factura: 0,
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
    flota_placa: "",
    mes: "", // Nuevo filtro de mes
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

  // Cargar placas al montar el componente
  useEffect(() => {
    cargarPlacas();
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));

      fetchFletes(1, pagination.itemsPerPage, filters);
    }, 500);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters.fecha_inicio, filters.fecha_fin, filters.flota_placa]);

  // Efecto para actualizar rango de fechas cuando cambia el mes
  useEffect(() => {
    if (filters.mes) {
      const year = new Date().getFullYear();
      const fechaInicio = `${year}-${filters.mes}-01`;

      // Calcular último día del mes
      const lastDay = new Date(year, parseInt(filters.mes), 0).getDate();
      const fechaFin = `${year}-${filters.mes}-${lastDay}`;

      setFilters((prev) => ({
        ...prev,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }));
    }
  }, [filters.mes]);

  // Cargar placas desde la API
  const cargarPlacas = useCallback(async () => {
    try {
      const response = await utilsAPI.getPlacasListTranjer();
      setPlacas(response || []);
    } catch (err) {
      console.error("Error cargando placas:", err);
      setError("Error al cargar la lista de placas");
    }
  }, []);

  // Función principal para cargar fletes
  const fetchFletes = useCallback(
    async (
      page = 1,
      itemsPerPage = pagination.itemsPerPage,
      filtersToUse = filters,
    ) => {
      setIsLoading(true);
      setError(null);

      // Validar fechas
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
        // Preparar filtros para API
        const apiFilters = {
          page: page,
          page_size: itemsPerPage,
          // Agregar filtro para obtener solo fletes valorizados
          // estado_flete: "VALORIZADO",
        };

        if (filtersToUse.fecha_inicio) {
          apiFilters.fecha_servicio_desde = filtersToUse.fecha_inicio;
        }

        if (filtersToUse.fecha_fin) {
          apiFilters.fecha_servicio_hasta = filtersToUse.fecha_fin;
        }

        if (
          filtersToUse.flota_placa &&
          filtersToUse.flota_placa.trim() !== ""
        ) {
          apiFilters.placa = filtersToUse.flota_placa.trim();
        }

        // Llamar a la API de fletes
        const response = await monitoreoAPI.getPlacas(apiFilters);

        setFletesData(response.items || []);
        setMetrics(
          response.metrics || {
            total_fletes: 0,
            monto_total_acumulado: 0,
            total_pendientes: 0,
            valorizados_con_factura: 0,
            valorizados_sin_factura: 0,
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
          "Error al cargar los fletes: " + (err.message || "Error desconocido"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Si cambia mes, limpiar fechas manuales
    if (key === "mes") {
      setFilters((prev) => ({
        ...prev,
        fecha_inicio: "",
        fecha_fin: "",
      }));
    }

    // Limpiar errores
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
      mes: "", // Limpiar selección de mes cuando se selecciona fecha manual
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
      flota_placa: "",
      mes: "",
    });
    setErrors({
      fecha_inicio: "",
      fecha_fin: "",
      rango_fechas: "",
    });
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

  // Exportar a Excel
  const handleExportarExcel = useCallback(async () => {
    try {
      setLoadingDownload(true);

      const filtersForAPI = {
         fecha_servicio_desde: filters.fecha_inicio,
         fecha_servicio_hasta: filters.fecha_fin,
         placa:filters.flota_placa
      };

      const blob = await fletesAPI.exportAllFletesExcel(filtersForAPI);

      fletesAPI.downloadExcel(
        blob,
        `monitoreo_fletes_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      setSuccessMessage("Exportación completada exitosamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Error al exportar: " + err.message);
    } finally {
      setLoadingDownload(false);
    }
  }, [filters]);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "N/A";
    const date = typeof fechaStr === "object" ? fechaStr.$date : fechaStr;
    const [year, month, day] = date.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(monto || 0);
  };

  // Loading inicial
  if (isLoading && fletesData.length === 0) {
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

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
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

        {/* Valorizados sin factura */}
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

        {/* Valorizados con factura */}
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

          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Placa
            </label>
            <select
              value={filters.flota_placa}
              onChange={(e) =>
                handleFilterChange("flota_placa", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Todas las placas</option>
              {placas.map((placa, index) => (
                <option key={index} value={placa}>
                  {placa}
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
      {fletesData.length > 0 && (
        <div className="mb-4 text-sm text-gray-600 text-center">
          Mostrando {fletesData.length} de {pagination.totalItems} fletes
          {filters.flota_placa && " · Filtrado por placa"}
          {(filters.fecha_inicio || filters.fecha_fin) &&
            " · Filtrado por rango de fechas"}
        </div>
      )}

      {/* Tabla de Fletes */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Placa
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Monto
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Fecha de Servicio
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Cliente
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Origen
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">
                  Destino
                </th>
              </tr>
            </thead>
            <tbody>
              {fletesData.map((flete) => (
                <tr
                  key={flete.id}
                  className="border-b border-gray-200 hover:bg-blue-50"
                >
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {flete.servicio?.flota?.placa || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Código: {flete.codigo_flete}
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {formatearMonto(flete.monto_flete)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {flete.pertenece_a_factura ? (
                        <span className="text-green-600">Facturado</span>
                      ) : (
                        <span className="text-orange-600">Sin factura</span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                    <div className="text-gray-900">
                      {formatFecha(flete?.servicio?.fecha_servicio)}
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {flete.servicio?.cliente?.nombre || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      RUC: {flete.servicio?.cliente?.ruc || ""}
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

                  <td className="px-4 py-3">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-900">
                        {flete.servicio?.destino?.split(",")[0] || "N/A"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {fletesData.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron fletes
            </h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some((f) => f && f.trim() !== "")
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay fletes valorizados en el sistema"}
            </p>
            <Button onClick={clearFilters} size="small">
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Paginación */}
      {fletesData.length > 0 && (
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

export default MonitoreoPlacas;
