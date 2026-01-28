import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DollarSign,
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Truck,
  TrendingUp,
  CheckCircle,
  Search,
  Download,
  Loader2,
  Eye,
  X,
  FileDigit,
  Info,
  ChevronRight,
  Building,
  User,
  Package,
  MapPin,
  CreditCard,
  Percent,
  Users,
  Car,
  Box,
  Target,
  Receipt,
  Shield,
  Database,
  Layers,
  BarChart3,
  Filter as FilterIcon,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";
import { formatCurrency, formatDate } from "../../../utils/facturacionUtils";
import { facturacionGestionAPI } from "../../../api/endpoints/facturacionGestion";
import { fletesAPI } from "../../../api/endpoints/fletes";

const Gerencia = () => {
  // Estados para datos
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Estados para filtros (almacenados temporalmente)
  const [tempFilters, setTempFilters] = useState({
    nombre_cliente: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  // Estados para filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState({
    nombre_cliente: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  // Estados para paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
    pageSize: 100,
  });

  // Estados para detalles
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [expandedFreightIndex, setExpandedFreightIndex] = useState(null);

  // Estados para totales del summary
  const [summary, setSummary] = useState({
    total_vendido: 0,
    total_vendido_bruto: 0,
    total_facturado: 0,
    total_pagado: 0,
    total_pendiente: 0,
    total_detracciones: 0,
    total_pagado_detracc: 0,
    total_pendiente_detracc: 0,
    cantidad_fletes_vendidos: 0,
    total_pendiente_vencido: 0,
    cantidad_vencidas: 0,
    total_facturas: 0,
    cliente_buscado: "",
    cliente_encontrado: "",
  });

  const [fletesStats, setFletesStats] = useState({
    total_fletes: 0,
    resumen_estados: {},
  });

  // Estados para filtros expandidos
  const [showFilters, setShowFilters] = useState(true);

  // Estados para gastos de fletes
  const [freightExpenses, setFreightExpenses] = useState({});
  const [loadingExpenses, setLoadingExpenses] = useState({});

  // Refs para inputs
  const clienteInputRef = useRef(null);

  // Calcular saldo en fila usando los datos financieros nuevos
  const calculateRowBalance = (invoice) => {
    return invoice.financiero?.saldo_pendiente || 0;
  };

  // Obtener días hasta vencimiento
  const getDaysUntilDue = (dueDateString) => {
    if (!dueDateString) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Obtener colores según estado
  const getStatusColor = (status, type = "detraction") => {
    if (!status) return "bg-gray-50 text-gray-700 border-gray-200";

    switch (type) {
      case "detraction":
        return status === "Pendiente"
          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
          : status === "Pagado"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-gray-50 text-gray-700 border-gray-200";

      case "payment":
        return status === "Pendiente"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-green-50 text-green-700 border-green-200";

      case "priority":
        switch (status) {
          case "Alta":
            return "bg-red-50 text-red-700 border-red-200";
          case "Media":
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
          case "Baja":
            return "bg-blue-50 text-blue-700 border-blue-200";
          default:
            return "bg-gray-50 text-gray-700 border-gray-200";
        }

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Función para obtener gastos de un flete
  const fetchFreightExpenses = useCallback(async (fleteId) => {
    if (!fleteId) return;

    setLoadingExpenses((prev) => ({ ...prev, [fleteId]: true }));

    try {
      const response = await fletesAPI.getGastosByCodeFlete(fleteId);

      setFreightExpenses((prev) => ({
        ...prev,
        [fleteId]: response,
      }));
    } catch (error) {
      console.error(`Error fetching expenses for freight ${fleteId}:`, error);
      setFreightExpenses((prev) => ({
        ...prev,
        [fleteId]: {
          id_flete: fleteId,
          total_gastos: 0,
          total_recuperable_cliente: 0,
          total_costo_operativo: 0,
          cantidad_gastos: 0,
          gastos: [],
        },
      }));
    } finally {
      setLoadingExpenses((prev) => ({ ...prev, [fleteId]: false }));
    }
  }, []);

  // Función para obtener todas las gestiones usando get_kpis_completos
  const fetchInvoices = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      setLoadingData(true);

      try {
        // Llamar a la API get_kpis_completos con los filtros aplicados
        const response = await facturacionGestionAPI.getKpisCompletos(
          {
            ...appliedFilters,
          },
          {
            page: page,
            pageSize: pageSize,
          },
        );

        console.log("API Response:", response);

        // Actualizar estado con los datos recibidos
        setInvoices(response.items || []);

        // Actualizar summary
        if (response.summary) {
          setSummary(response.summary);
        }
        await fetchFletesStats();
        // Actualizar paginación
        setPagination({
          currentPage: response.pagination?.page || 1,
          totalItems: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1,
          hasNext: response.pagination?.hasNext || false,
          hasPrev: response.pagination?.hasPrev || false,
          pageSize: pageSize,
        });
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
        setLoadingData(false);
      }
    },
    [appliedFilters, pagination.pageSize],
  );

  const fetchFletesStats = useCallback(async () => {
    try {
      // Asumiendo que tu API tiene este endpoint
      const response = await facturacionGestionAPI.getFletesIndicator();

      setFletesStats({
        total_fletes: response.total_fletes || 0,
        resumen_estados: response.resumen_estados || {},
      });
    } catch (error) {
      console.error("Error fetching fletes stats:", error);
    }
  }, []);

  // Función para aplicar filtros
  const applyFilters = () => {
    // Copiar los filtros temporales a los aplicados
    setAppliedFilters(tempFilters);

    // Si hay cliente en los filtros, dar foco al input de cliente
    if (tempFilters.nombre_cliente && clienteInputRef.current) {
      clienteInputRef.current.focus();
    }
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setTempFilters({
      nombre_cliente: "",
      fecha_inicio: "",
      fecha_fin: "",
    });
    setAppliedFilters({
      nombre_cliente: "",
      fecha_inicio: "",
      fecha_fin: "",
    });
  };

  // Función para manejar la tecla Enter en el input de cliente
  const handleClienteKeyPress = (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  // Función para cambiar página
  const handlePageChange = (newPage) => {
    fetchInvoices(newPage, pagination.pageSize);
  };

  // Función para cambiar items por página
  const handleItemsPerPageChange = (newPageSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newPageSize }));
    fetchInvoices(1, newPageSize);
  };

  // Función para ver detalles de factura
  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
    setExpandedFreightIndex(null);
  };

  // Función para alternar detalles de flete
  const toggleFreightDetails = useCallback(
    async (index, freight) => {
      const fleteId = freight.codigo_flete;

      if (expandedFreightIndex === index) {
        setExpandedFreightIndex(null);
      } else {
        setExpandedFreightIndex(index);

        if (fleteId && !freightExpenses[fleteId]) {
          await fetchFreightExpenses(fleteId);
        }
      }
    },
    [expandedFreightIndex, freightExpenses, fetchFreightExpenses],
  );

  // Renderizar detalles de gastos
  const renderExpensesDetails = (fleteId) => {
    const expensesData = freightExpenses[fleteId];

    if (loadingExpenses[fleteId]) {
      return (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <span className="text-xs text-gray-600">Cargando gastos...</span>
        </div>
      );
    }

    if (!expensesData || expensesData.cantidad_gastos === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          <p>No hay gastos adicionales registrados para este flete.</p>
        </div>
      );
    }

    const {
      gastos = [],
      total_gastos,
      total_recuperable_cliente,
      total_costo_operativo,
    } = expensesData;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <div className="text-gray-500">Total Gastos</div>
            <div className="font-semibold text-gray-900">
              {formatCurrency(total_gastos)}
            </div>
          </div>
          <div className="bg-blue-50 p-2 rounded border border-blue-200">
            <div className="text-blue-600">Recuperable Cliente</div>
            <div className="font-semibold text-blue-700">
              {formatCurrency(total_recuperable_cliente)}
            </div>
          </div>
          <div className="bg-amber-50 p-2 rounded border border-amber-200">
            <div className="text-amber-600">Costo Operativo</div>
            <div className="font-semibold text-amber-700">
              {formatCurrency(total_costo_operativo)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-1 px-2 text-left font-medium text-gray-700 border border-gray-200">
                  Código
                </th>
                <th className="py-1 px-2 text-left font-medium text-gray-700 border border-gray-200">
                  Tipo
                </th>
                <th className="py-1 px-2 text-left font-medium text-gray-700 border border-gray-200">
                  Valor
                </th>
                <th className="py-1 px-2 text-left font-medium text-gray-700 border border-gray-200">
                  Factura Cliente
                </th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((gasto, index) => (
                <tr
                  key={gasto.id || index}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-1 px-2 border border-gray-200">
                    <span className="font-mono text-xs">
                      {gasto.codigo_gasto}
                    </span>
                  </td>
                  <td className="py-1 px-2 border border-gray-200">
                    {gasto.tipo_gasto}
                  </td>
                  <td className="py-1 px-2 border border-gray-200 font-medium text-gray-900">
                    {formatCurrency(gasto.valor)}
                  </td>
                  <td className="py-1 px-2 border border-gray-200">
                    {gasto.se_factura_cliente ? "Sí" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Renderizar detalles de un flete
  const renderFreightDetails = (freight, index) => {
    const isExpanded = expandedFreightIndex === index;
    const fleteId = freight.codigo_flete;

    return (
      <div
        key={freight.codigo_flete || index}
        className="border border-gray-200 rounded-lg mb-2"
      >
        <div
          className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-lg"
          onClick={() => toggleFreightDetails(index, freight)}
        >
          <div className="flex items-center space-x-3">
            <Truck className="h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-sm text-gray-900">
                {freight.codigo_flete}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {freight.cliente || "N/A"}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(parseFloat(freight.monto_flete || 0))}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div>
                <div className="font-medium mb-1">Información del Flete</div>
                <div className="space-y-1">
                  <div>
                    <span className="text-gray-600">Cliente:</span>{" "}
                    {freight.cliente}
                  </div>
                  <div>
                    <span className="text-gray-600">Proveedor:</span>{" "}
                    {freight.proveedor}
                  </div>
                  <div>
                    <span className="text-gray-600">Conductor:</span>{" "}
                    {freight.conductor}
                  </div>
                  <div>
                    <span className="text-gray-600">Placa:</span>{" "}
                    {freight.placa}
                  </div>
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Detalles del Servicio</div>
                <div className="space-y-1">
                  <div>
                    <span className="text-gray-600">Tipo Servicio:</span>{" "}
                    {freight.tipo_servicio}
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha Servicio:</span>{" "}
                    {formatDate(freight.fecha_servicio)}
                  </div>
                  <div>
                    <span className="text-gray-600">Origen:</span>{" "}
                    {freight.servicio?.origen || "N/A"}
                  </div>
                  <div>
                    <span className="text-gray-600">Destino:</span>{" "}
                    {freight.servicio?.destino || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                Gastos Adicionales
              </h4>
              {renderExpensesDetails(fleteId)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Componente de tarjeta de métrica
  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
    highlight = false,
  }) => (
    <div
      className={`bg-white p-4 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow ${highlight ? "ring-1 ring-red-300" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-1">{title}</h3>
          <p
            className={`text-lg font-bold ${highlight ? "text-red-600" : "text-gray-800"}`}
          >
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-2 rounded-lg ${color === "red" ? "bg-red-50" : color === "yellow" ? "bg-yellow-50" : color === "green" ? "bg-green-50" : "bg-blue-50"}`}
        >
          <Icon
            className={`h-5 w-5 ${color === "red" ? "text-red-600" : color === "yellow" ? "text-yellow-600" : color === "green" ? "text-green-600" : "text-blue-600"}`}
          />
        </div>
      </div>
    </div>
  );

  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-4 mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard de Gerencia
              </h1>
              <p className="text-gray-600 text-sm">
                Visión completa de facturación, pagos y pendientes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => fetchInvoices()}
                variant="secondary"
                icon={RefreshCw}
                className="px-3 py-1.5 text-xs"
              >
                Actualizar
              </Button>
              <Button
                onClick={() => {
                  /* Implementar exportación */
                }}
                variant="secondary"
                icon={Download}
                className="px-3 py-1.5 text-xs"
              >
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Panel de Filtros - Siempre visible */}
        <div className="mb-6 bg-white rounded-lg border border-gray-300 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FilterIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={applyFilters}
                variant="primary"
                icon={Search}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700"
              >
                Aplicar Filtros
              </Button>
              <Button
                onClick={clearFilters}
                variant="secondary"
                className="px-3 py-2 text-sm"
              >
                Limpiar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro Cliente */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Building className="h-4 w-4 inline mr-1" />
                Cliente
              </label>
              <div className="relative">
                <input
                  ref={clienteInputRef}
                  type="text"
                  value={tempFilters.nombre_cliente}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      nombre_cliente: e.target.value,
                    })
                  }
                  onKeyPress={handleClienteKeyPress}
                  placeholder="Escriba el nombre del cliente..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {tempFilters.nombre_cliente && (
                  <button
                    onClick={() =>
                      setTempFilters({ ...tempFilters, nombre_cliente: "" })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Presione Enter para filtrar automáticamente
              </p>
            </div>

            {/* Filtro Fecha Inicio */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha Desde
              </label>
              <input
                type="date"
                value={tempFilters.fecha_inicio}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    fecha_inicio: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Filtro Fecha Fin */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha Hasta
              </label>
              <input
                type="date"
                value={tempFilters.fecha_fin}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, fecha_fin: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Indicador de filtros aplicados */}
          {Object.values(appliedFilters).some((filter) => filter !== "") && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Filtros aplicados:
                </span>
                <div className="flex flex-wrap gap-2 ml-3">
                  {appliedFilters.nombre_cliente && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Cliente: {appliedFilters.nombre_cliente}
                    </span>
                  )}
                  {appliedFilters.fecha_inicio && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Desde: {appliedFilters.fecha_inicio}
                    </span>
                  )}
                  {appliedFilters.fecha_fin && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Hasta: {appliedFilters.fecha_fin}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información del cliente buscado */}
        {summary.cliente_buscado && (
          <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">
                  Información del Cliente
                </h3>
                <p className="text-sm text-gray-600">
                  Buscando:{" "}
                  <span className="font-semibold">
                    {summary.cliente_buscado}
                  </span>
                  {summary.cliente_encontrado &&
                    summary.cliente_encontrado !== summary.cliente_buscado && (
                      <span className="ml-3">
                        → Encontrado:{" "}
                        <span className="font-semibold">
                          {summary.cliente_encontrado}
                        </span>
                      </span>
                    )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resumen de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-medium text-gray-500">
                  Total Vendido Neto
                </h3>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(summary.total_vendido)}
                </p>
                <h3 className="text-xs font-medium text-gray-500">
                  Total Vendido Bruto
                </h3>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(summary.total_vendido_bruto)}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                {/* Fletes Pendientes */}
                <h3 className="text-xs font-medium text-gray-500">
                  Fletes Pendientes
                </h3>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {fletesStats.resumen_estados?.PENDIENTE || 0}
                </p>

                {/* Fletes Por Facturar (Valorizados) */}
                <h3 className="text-xs font-medium text-gray-500">
                  Fletes con Valor
                </h3>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {fletesStats.resumen_estados?.VALORIZADO || 0}
                </p>

                {/* Si quieres mostrar el Total General */}
                <h3 className="text-xs font-medium text-gray-500">
                  Total Fletes
                </h3>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {fletesStats.total_fletes || 0}
                </p>
              </div>
            
            </div>
          </div>

          <MetricCard
            title="Total Facturado Bruto"
            value={formatCurrency(summary.total_facturado)}
            subtitle={`${summary.total_facturas} facturas`}
            icon={FileText}
            color="blue"
          />

          <MetricCard
            title="Saldo Pendiente"
            value={formatCurrency(summary.total_pendiente)}
            subtitle={
              summary.total_pendiente > 0
                ? "⚠️ Pendiente por cobrar"
                : "✅ Al día"
            }
            icon={Clock}
            color="red"
            highlight={summary.total_pendiente > 0}
          />

          <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-medium text-gray-500">
                  Total Detracciones
                </h3>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(summary.total_detracciones)}
                </p>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    Pagado: {formatCurrency(summary.total_pagado_detracc)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 text-yellow-500 mr-1" />
                    Pendiente: {formatCurrency(summary.total_pendiente_detracc)}
                  </div>
                </div>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <MetricCard
            title="Total Pagado"
            value={formatCurrency(summary.total_pagado)}
            subtitle={`${Math.round((summary.total_pagado / summary.total_facturado) * 100)}% del total`}
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Total vencido"
            value={formatCurrency(summary.total_pendiente_vencido)}
            subtitle={`${summary.cantidad_vencidas} facturas del total`}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Indicador de carga */}
        {loadingData && (
          <div className="flex items-center justify-center p-3 bg-white/80 backdrop-blur-sm mb-4 rounded-lg border border-gray-200">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Actualizando datos...</span>
          </div>
        )}

        {/* Tabla de Facturas */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-700 mr-2" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Facturas
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Mostrando {invoices.length} de {pagination.totalItems}{" "}
                    facturas
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Database className="h-4 w-4 mr-1" />
                <span>Datos enriquecidos</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[180px] sticky left-0 bg-gray-100 z-10">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Cliente
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <FileDigit className="h-4 w-4 mr-2" />
                      Factura
                    </div>
                  </th>

                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[110px]">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Emisión
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[110px]">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Vencimiento
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Total Facturado
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Monto por Pagar
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Monto Pagado
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Saldo
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Estado Factura
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[100px]">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2" />
                      Detr.
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[80px]">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Fletes
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 min-w-[80px] sticky right-0 bg-gray-100 z-10">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const financiero = invoice.financiero || {};
                  const estados = invoice.estados || {};
                  const servicio = invoice.servicio || {};
                  const fletesInfo = invoice.fletes_incluidos || {};
                  const fechas = invoice.fechas || {};

                  const rowBalance = calculateRowBalance(invoice);
                  const daysUntilDue = getDaysUntilDue(fechas.vencimiento);

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-200 hover:bg-blue-50 transition-colors group"
                    >
                      <td className="py-3 px-4 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-blue-50 z-10">
                        <div className="font-medium text-gray-900">
                          {servicio.cliente || "N/A"}
                        </div>
                        {/* {servicio.cuenta && (
                          <div className="text-gray-500 text-xs truncate">Cuenta: {servicio.cuenta}</div>
                        )} */}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200">
                        <div className="font-medium text-gray-900 font-mono">
                          {invoice.codigo_factura || invoice.numero_factura}
                        </div>
                        {/* <div className="text-gray-500 text-xs truncate">{}</div> */}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200">
                        {formatDate(fechas.emision)}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200">
                        <div className="flex flex-col">
                          <span>{formatDate(fechas.vencimiento)}</span>
                          {daysUntilDue !== null && daysUntilDue < 30 && (
                            <span
                              className={`text-xs font-medium px-1 rounded ${daysUntilDue < 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                            >
                              {daysUntilDue < 0
                                ? `Vencido ${Math.abs(daysUntilDue)}d`
                                : `Vence en ${daysUntilDue}d`}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 border-r border-gray-200 font-semibold text-gray-900">
                        {formatCurrency(financiero.monto_total)}
                      </td>

                      <td className="py-3 px-4 border-r border-gray-200">
                        <div className="font-semibold">
                          {formatCurrency(financiero.monto_neto)}
                        </div>
                        {financiero.monto_total > financiero.monto_neto && (
                          <div className="text-xs text-yellow-600 flex items-center">
                            <Percent className="h-3 w-3 mr-1" />-
                            {formatCurrency(financiero.monto_detraccion)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 border-r border-gray-200">
                        <div className="font-semibold">
                          {formatCurrency(financiero.monto_pagado_acumulado)}
                        </div>
                        {financiero.monto_pagado_acumulado > 0 && (
                          <div className="text-xs text-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pagado
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 border-r border-gray-200">
                        <div
                          className={`font-bold ${rowBalance > 0 ? "text-red-600" : rowBalance < 0 ? "text-green-600" : "text-gray-600"}`}
                        >
                          {formatCurrency(rowBalance)}
                        </div>
                      </td>

                      <td className="py-3 px-4 border-r border-gray-200">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs`}
                          >
                            {estados.estado_pago_neto || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 border-r border-gray-200">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(estados.estado_detraccion, "detraction")}`}
                          >
                            {estados.estado_detraccion || "N/A"}
                          </span>
                          {financiero.monto_detraccion > 0 && (
                            <div className="text-xs text-gray-500">
                              {formatCurrency(financiero.monto_detraccion)}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 border-r border-gray-200">
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-semibold">
                            {fletesInfo.cantidad || 0}
                          </span>
                        </div>
                        {/* {estados.prioridad && (
                          <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusColor(estados.prioridad, 'priority')}`}>
                            {estados.prioridad}
                          </span>
                        )} */}
                      </td>

                      <td className="py-3 px-4 sticky right-0 bg-white group-hover:bg-blue-50 z-10">
                        <Button
                          onClick={() => handleRowClick(invoice)}
                          variant="ghost"
                          size="sm"
                          className="text-xs px-3 py-1.5 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                          icon={Eye}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {invoices.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg border border-gray-300 shadow-sm p-4">
            <div className="flex items-center space-x-3 mb-3 sm:mb-0">
              <span className="text-sm text-gray-600">Mostrar</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={pagination.pageSize}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <span className="text-sm text-gray-600">
                registros por página
              </span>
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.pageSize}
              onPageChange={handlePageChange}
              startIndex={
                (pagination.currentPage - 1) * pagination.pageSize + 1
              }
              endIndex={Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems,
              )}
              size="medium"
            />
          </div>
        )}

        {/* Sin resultados */}
        {invoices.length === 0 && !loading && (
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron facturas
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              {Object.values(appliedFilters).some((filter) => filter !== "")
                ? "No hay resultados para los filtros aplicados. Intenta ajustar los criterios de búsqueda."
                : "No hay facturas registradas en el sistema."}
            </p>
            {Object.values(appliedFilters).some((filter) => filter !== "") && (
              <Button
                onClick={clearFilters}
                variant="primary"
                className="px-4 py-2 text-sm"
              >
                Limpiar filtros y ver todo
              </Button>
            )}
          </div>
        )}

        {/* Modal de Detalles de Factura */}
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title={
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              <span>
                Detalles de Factura: {selectedInvoice?.codigo_factura}
              </span>
            </div>
          }
          size="xlarge"
        >
          {selectedInvoice && (
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              {/* Encabezado con información principal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Información de Factura */}
                <div className="border border-gray-200 rounded p-4 bg-blue-50">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Información de Factura
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Número:</span>
                      <span className="font-medium">
                        {selectedInvoice.numero_factura}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Código:</span>
                      <span className="font-medium font-mono">
                        {selectedInvoice.codigo_factura}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Emisión:</span>
                      <span className="font-medium">
                        {formatDate(selectedInvoice.fechas?.emision)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Vencimiento:</span>
                      <span className="font-medium">
                        {formatDate(selectedInvoice.fechas?.vencimiento)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información Financiera */}
                <div className="border border-gray-200 rounded p-4 bg-green-50">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Estados Financieros
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Monto Total:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          selectedInvoice.financiero?.monto_total,
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Monto Neto:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedInvoice.financiero?.monto_neto)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Detracción:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          selectedInvoice.financiero?.monto_detraccion,
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Pagado:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          selectedInvoice.financiero?.monto_pagado_acumulado,
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Saldo:</span>
                      <span
                        className={`font-bold ${selectedInvoice.financiero?.saldo_pendiente > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {formatCurrency(
                          selectedInvoice.financiero?.saldo_pendiente,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del Servicio */}
                <div className="border border-gray-200 rounded p-4 bg-purple-50">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Información del Cliente
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium">
                        {selectedInvoice.servicio?.cliente}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Cuenta:</span>
                      <span className="font-medium">
                        {selectedInvoice.servicio?.cuenta}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Proveedor:</span>
                      <span className="font-medium">
                        {selectedInvoice.servicio?.proveedor}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Conductor:</span>
                      <span className="font-medium">
                        {selectedInvoice.servicio?.conductor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estados y Prioridades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 rounded p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Estados
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-4 py-2 rounded-lg text-sm ${getStatusColor(selectedInvoice.estados?.estado_detraccion, "detraction")}`}
                    >
                      Detracción:{" "}
                      {selectedInvoice.estados?.estado_detraccion || "N/A"}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-lg text-sm ${getStatusColor(selectedInvoice.estados?.estado_pago_neto, "payment")}`}
                    >
                      Pago Neto:{" "}
                      {selectedInvoice.estados?.estado_pago_neto || "N/A"}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-lg text-sm ${getStatusColor(selectedInvoice.estados?.prioridad, "priority")}`}
                    >
                      Prioridad: {selectedInvoice.estados?.prioridad || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fechas Importantes
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Pago Detracción:</span>
                      <span className="font-medium">
                        {selectedInvoice.fechas?.pago_detraccion
                          ? formatDate(selectedInvoice.fechas.pago_detraccion)
                          : "Pendiente"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Probable Pago:</span>
                      <span className="font-medium">
                        {selectedInvoice.fechas?.probable_pago
                          ? formatDate(selectedInvoice.fechas.probable_pago)
                          : "No definido"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Últ. Actualización:</span>
                      <span className="font-medium">
                        {selectedInvoice.fechas?.ultima_actualizacion
                          ? formatDate(
                              selectedInvoice.fechas.ultima_actualizacion,
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de fletes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    Fletes ({selectedInvoice.fletes_incluidos?.cantidad || 0})
                  </h4>
                  <div className="text-sm text-gray-500 font-semibold">
                    Total fletes:{" "}
                    {formatCurrency(selectedInvoice.financiero?.monto_total)}
                  </div>
                </div>

                {selectedInvoice.fletes_incluidos?.detalles?.map(
                  (freight, index) => renderFreightDetails(freight, index),
                )}
              </div>

              {/* Información Adicional */}
              {selectedInvoice.informacion_adicional && (
                <div className="border border-gray-200 rounded p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Información Adicional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedInvoice.informacion_adicional
                      .nro_constancia_detraccion && (
                      <div className="bg-gray-50 p-3 rounded border">
                        <span className="text-gray-600 block mb-1">
                          Constancia Detracción:
                        </span>
                        <span className="font-medium">
                          {
                            selectedInvoice.informacion_adicional
                              .nro_constancia_detraccion
                          }
                        </span>
                      </div>
                    )}
                    {selectedInvoice.informacion_adicional.banco_destino && (
                      <div className="bg-gray-50 p-3 rounded border">
                        <span className="text-gray-600 block mb-1">
                          Banco Destino:
                        </span>
                        <span className="font-medium">
                          {selectedInvoice.informacion_adicional.banco_destino}
                        </span>
                      </div>
                    )}
                    {selectedInvoice.informacion_adicional
                      .observaciones_admin && (
                      <div className="col-span-2 bg-gray-50 p-3 rounded border">
                        <span className="text-gray-600 block mb-2">
                          Observaciones:
                        </span>
                        <p className="font-medium">
                          {
                            selectedInvoice.informacion_adicional
                              .observaciones_admin
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowInvoiceModal(false)}
                  variant="secondary"
                  className="px-4 py-2 text-sm"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Gerencia;
