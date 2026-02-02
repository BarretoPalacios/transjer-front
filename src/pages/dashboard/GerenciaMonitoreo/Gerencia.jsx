
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Calendar,
  Filter,
  Search,
  Download,
  Loader2,
  Eye,
  X,
  FileDigit,
  Building,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Percent,
  Truck,
  RefreshCw,
  Filter as FilterIcon,
  ChevronDown,
  ChevronRight,
  User,
  Package,
  MapPin,
  Shield,
  Info,
  CreditCard,
  Users,
} from "lucide-react";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";
import { formatCurrency, formatDate } from "../../../utils/facturacionUtils";
import { facturacionGestionAPI } from "../../../api/endpoints/facturacionGestion";
import { fletesAPI } from "../../../api/endpoints/fletes";

// Enums para estados por defecto
const EstadoPagoNeto = {
  PENDIENTE: "Pendiente",
  // PROGRAMADO: "Programado",
  PAGADO_PARCIAL: "Pagado Parcial",
  PAGADO: "Pagado",
  VENCIDO: "Vencido",
  DISPUTA: "En Disputa",
  ANULADO: "Anulado",
};

const EstadoDetraccion = {
  NO_APLICA: "No Aplica",
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
};

const PrioridadPago = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

const Gerencia = () => {
  // Estados para datos
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Estados para filtros
  const [tempFilters, setTempFilters] = useState({
    nombre_cliente: "",
    numero_factura: "",
    fecha_emision_inicio: "",
    fecha_emision_fin: "",
    fecha_vencimiento_inicio: "",
    fecha_vencimiento_fin: "",
    estado_pago_neto: "",
    estado_detraccion: "",
    nombre_proveedor: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    nombre_cliente: "",
    numero_factura: "",
    fecha_emision_inicio: "",
    fecha_emision_fin: "",
    fecha_vencimiento_inicio: "",
    fecha_vencimiento_fin: "",
    estado_pago_neto: "",
    estado_detraccion: "",
    nombre_proveedor: "",
  });

  // Estados para opciones de filtros
  const [filterOptions, setFilterOptions] = useState({
    estadosPago: Object.values(EstadoPagoNeto),
    estadosDetraccion: Object.values(EstadoDetraccion),
    proveedores: [],
    clientes: [],
  });

  // Estados para modo texto personalizado
  const [showClienteCustomInput, setShowClienteCustomInput] = useState(false);
  const [clienteCustomValue, setClienteCustomValue] = useState("");
  const [showProveedorCustomInput, setShowProveedorCustomInput] = useState(false);
  const [proveedorCustomValue, setProveedorCustomValue] = useState("");

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
  const [expandedRows, setExpandedRows] = useState({});

  // Estados para gastos de fletes
  const [freightExpenses, setFreightExpenses] = useState({});
  const [loadingExpenses, setLoadingExpenses] = useState({});

  // Obtener opciones de filtros
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await facturacionGestionAPI.getAllGestiones(
        {},
        { page: 1, pageSize: 50 }
      );

      const proveedores = new Set();
      const clientes = new Set();

      response.items?.forEach(invoice => {
        invoice.datos_completos?.fletes?.forEach(flete => {
          if (flete.servicio?.nombre_proveedor) {
            proveedores.add(flete.servicio.nombre_proveedor);
          }
          if (flete.servicio?.nombre_cliente) {
            clientes.add(flete.servicio.nombre_cliente);
          }
        });
      });

      setFilterOptions(prev => ({
        ...prev,
        proveedores: Array.from(proveedores),
        clientes: Array.from(clientes),
      }));
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  // Función para obtener todas las gestiones
  const fetchInvoices = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      setLoadingData(true);

      try {
        // Preparar filtros para la API
        const filters = {};
        
        // Solo incluir filtros que tengan valor
        Object.keys(appliedFilters).forEach(key => {
          if (appliedFilters[key]) {
            filters[key] = appliedFilters[key];
          }
        });

        const response = await facturacionGestionAPI.getAllGestiones(
          filters,
          {
            page: page,
            pageSize: pageSize,
            sort: { "datos_completos.fecha_emision": -1 }
          }
        );

        setInvoices(response.items || []);

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

  // Función para exportar datos
const handleExport = useCallback(async () => {
  setExporting(true);
  try {
    // Preparar filtros para la API
    const filtersForAPI = {};
    
    // Incluir filtros aplicados
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        filtersForAPI[key] = value;
      }
    });
    
    // Si hay valores personalizados de cliente o proveedor, incluirlos
    if (clienteCustomValue) {
      filtersForAPI.nombre_cliente = clienteCustomValue;
    }
    
    if (proveedorCustomValue) {
      filtersForAPI.nombre_proveedor = proveedorCustomValue;
    }

    console.log("Exporting with filters:", filtersForAPI);
    
    // Llamar a la API de exportación Excel
    const blob = await facturacionGestionAPI.exportAllGestionesExcel(filtersForAPI);
    
    // Descargar el archivo
    facturacionGestionAPI.downloadExcel(
      blob,
      `gestion_facturacion_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    
  } catch (error) {
    console.error("Error exporting data:", error);
    alert("Error al exportar los datos: " + (error.message || "Error desconocido"));
  } finally {
    setExporting(false);
  }
}, [appliedFilters, clienteCustomValue, proveedorCustomValue]);

  // Función para aplicar filtros
  const applyFilters = () => {
    // Preparar los filtros finales
    const finalFilters = { ...tempFilters };
    
    // Si hay valor personalizado de cliente, usarlo
    if (showClienteCustomInput && clienteCustomValue) {
      finalFilters.nombre_cliente = clienteCustomValue;
    }
    
    // Si hay valor personalizado de proveedor, usarlo
    if (showProveedorCustomInput && proveedorCustomValue) {
      finalFilters.nombre_proveedor = proveedorCustomValue;
    }
    
    setAppliedFilters(finalFilters);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    const emptyFilters = {
      nombre_cliente: "",
      numero_factura: "",
      fecha_emision_inicio: "",
      fecha_emision_fin: "",
      fecha_vencimiento_inicio: "",
      fecha_vencimiento_fin: "",
      estado_pago_neto: "",
      estado_detraccion: "",
      nombre_proveedor: "",
    };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setClienteCustomValue("");
    setShowClienteCustomInput(false);
    setProveedorCustomValue("");
    setShowProveedorCustomInput(false);
  };

  // Función para manejar selección de cliente
  const handleClienteSelectChange = (e) => {
    const value = e.target.value;
    
    if (value === "__custom__") {
      setShowClienteCustomInput(true);
      setTempFilters({ ...tempFilters, nombre_cliente: "" });
    } else {
      setShowClienteCustomInput(false);
      setClienteCustomValue("");
      setTempFilters({ ...tempFilters, nombre_cliente: value });
    }
  };

  // Función para manejar selección de proveedor
  const handleProveedorSelectChange = (e) => {
    const value = e.target.value;
    
    if (value === "__custom__") {
      setShowProveedorCustomInput(true);
      setTempFilters({ ...tempFilters, nombre_proveedor: "" });
    } else {
      setShowProveedorCustomInput(false);
      setProveedorCustomValue("");
      setTempFilters({ ...tempFilters, nombre_proveedor: value });
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

  // Función para hacer clic en fila (abrir detalles)
  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
    setExpandedFreightIndex(null);
  };

  // Función para expandir/contraer fila
  const toggleRowExpand = (invoiceId, e) => {
    e.stopPropagation(); // Prevenir que se abra el modal
    setExpandedRows(prev => ({
      ...prev,
      [invoiceId]: !prev[invoiceId]
    }));
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

  // Función para alternar detalles de flete
  const toggleFreightDetails = useCallback(
    async (index, freight, e) => {
      e.stopPropagation(); // Prevenir que se abra el modal
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
        switch (status) {
          case EstadoDetraccion.PENDIENTE:
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
          case EstadoDetraccion.PAGADO:
            return "bg-green-50 text-green-700 border-green-200";
          case EstadoDetraccion.NO_APLICA:
            return "bg-gray-50 text-gray-700 border-gray-200";
          default:
            return "bg-gray-50 text-gray-700 border-gray-200";
        }

      case "payment":
        switch (status) {
          case EstadoPagoNeto.PENDIENTE:
          case EstadoPagoNeto.VENCIDO:
            return "bg-red-50 text-red-700 border-red-200";
          case EstadoPagoNeto.PAGADO_PARCIAL:
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
          case EstadoPagoNeto.PAGADO:
            return "bg-green-50 text-green-700 border-green-200";
          case EstadoPagoNeto.PROGRAMADO:
            return "bg-blue-50 text-blue-700 border-blue-200";
          case EstadoPagoNeto.DISPUTA:
            return "bg-purple-50 text-purple-700 border-purple-200";
          case EstadoPagoNeto.ANULADO:
            return "bg-gray-50 text-gray-700 border-gray-200";
          default:
            return "bg-gray-50 text-gray-700 border-gray-200";
        }

      case "priority":
        switch (status) {
          case PrioridadPago.URGENTE:
            return "bg-red-100 text-red-800 border-red-300";
          case PrioridadPago.ALTA:
            return "bg-orange-50 text-orange-700 border-orange-200";
          case PrioridadPago.MEDIA:
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
          case PrioridadPago.BAJA:
            return "bg-blue-50 text-blue-700 border-blue-200";
          default:
            return "bg-gray-50 text-gray-700 border-gray-200";
        }

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

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
    const servicio = freight.servicio || {};

    return (
      <div
        key={freight.codigo_flete || index}
        className="border border-gray-200 rounded-lg mb-2"
        onClick={(e) => toggleFreightDetails(index, freight, e)}
      >
        <div
          className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Truck className="h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-sm text-gray-900">
                {freight.codigo_flete}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {servicio.nombre_cliente || "N/A"}
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
                    {servicio.nombre_cliente}
                  </div>
                  <div>
                    <span className="text-gray-600">Proveedor:</span>{" "}
                    {servicio.nombre_proveedor}
                  </div>
                  <div>
                    <span className="text-gray-600">Conductor:</span>{" "}
                    {servicio.nombre_conductor}
                  </div>
                  <div>
                    <span className="text-gray-600">Placa:</span>{" "}
                    {servicio.placa_flota}
                  </div>
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Detalles del Servicio</div>
                <div className="space-y-1">
                  <div>
                    <span className="text-gray-600">Tipo Servicio:</span>{" "}
                    {servicio.tipo_servicio}
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha Servicio:</span>{" "}
                    {formatDate(servicio.fecha_servicio)}
                  </div>
                  <div>
                    <span className="text-gray-600">Origen:</span>{" "}
                    {servicio.origen || "N/A"}
                  </div>
                  <div>
                    <span className="text-gray-600">Destino:</span>{" "}
                    {servicio.destino || "N/A"}
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

  // Renderizar fila expandida con detalles
  const renderExpandedRow = (invoice) => {
    const datosCompletos = invoice.datos_completos || {};
    const fletes = datosCompletos.fletes || [];
    const primerFlete = fletes[0] || {};
    const servicio = primerFlete.servicio || {};

    return (
      <tr className="bg-blue-50" onClick={(e) => e.stopPropagation()}>
        <td colSpan="13" className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Información Básica */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Información Factura
              </h4>
              <div className="text-xs space-y-1">
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Número:</span>
                  <span className="font-medium">{datosCompletos.numero_factura}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Emisión:</span>
                  <span className="font-medium">{formatDate(datosCompletos.fecha_emision)}</span>
                </div> 
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Vencimiento:</span>
                  <span className="font-medium">{formatDate(datosCompletos.fecha_vencimiento)}</span>
                </div>
              </div>
            </div>

            {/* Información Financiera */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Información Financiera
              </h4>
              <div className="text-xs space-y-1">
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Monto Total:</span>
                  <span className="font-medium">{formatCurrency(datosCompletos.monto_total)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Monto Neto:</span>
                  <span className="font-medium">{formatCurrency(invoice.monto_neto)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Monto Pagado:</span>
                  <span className="font-medium">{formatCurrency(invoice.monto_pagado_acumulado)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Saldo:</span>
                  <span className={`font-medium ${(invoice.monto_neto - invoice.monto_pagado_acumulado) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(invoice.monto_neto - invoice.monto_pagado_acumulado)}
                  </span>
                </div>
              </div>
            </div>

            {/* Información del Cliente/Proveedor */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Cliente / Proveedor
              </h4>
              <div className="text-xs space-y-1">
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{servicio.nombre_cliente || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Cuenta:</span>
                  <span className="font-medium">{servicio.nombre_cuenta || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Proveedor:</span>
                  <span className="font-medium">{servicio.nombre_proveedor || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Conductor:</span>
                  <span className="font-medium">{servicio.nombre_conductor || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Estados */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Estados
              </h4>
              <div className="text-xs space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Pago Neto:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(invoice.estado_pago_neto, 'payment')}`}>
                    {invoice.estado_pago_neto || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Detracción:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(invoice.estado_detraccion, 'detraction')}`}>
                    {invoice.estado_detraccion || 'N/A'}
                  </span>
                </div>
                {invoice.prioridad && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Prioridad:</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(invoice.prioridad, 'priority')}`}>
                      {invoice.prioridad}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Detracción */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <Percent className="h-4 w-4 mr-2" />
                Detracción
              </h4>
              <div className="text-xs space-y-1">
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Tasa:</span>
                  <span className="font-medium">{invoice.tasa_detraccion}%</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-medium">{formatCurrency(invoice.monto_detraccion)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Constancia:</span>
                  <span className="font-medium">{invoice.nro_constancia_detraccion || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Pago:</span>
                  <span className="font-medium">{invoice.fecha_pago_detraccion ? formatDate(invoice.fecha_pago_detraccion) : 'Pendiente'}</span>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Información Adicional
              </h4>
              <div className="text-xs space-y-1">
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Centro Costo:</span>
                  <span className="font-medium">{invoice.centro_costo || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Responsable:</span>
                  <span className="font-medium">{invoice.responsable_gestion || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Fecha Probable Pago:</span>
                  <span className="font-medium">{invoice.fecha_probable_pago ? formatDate(invoice.fecha_probable_pago) : 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Últ. Actualización:</span>
                  <span className="font-medium">{invoice.ultima_actualizacion ? formatDate(invoice.ultima_actualizacion) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón para ver más detalles en modal */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => handleRowClick(invoice)}
              variant="ghost"
              size="sm"
              className="text-xs px-3 py-1.5 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
              icon={Eye}
            >
              Ver Detalles Completos
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchFilterOptions();
    fetchInvoices();
  }, [fetchInvoices, fetchFilterOptions]);

  // Refetch cuando cambian los filtros aplicados
  useEffect(() => {
    if (!loading) {
      fetchInvoices();
    }
  }, [appliedFilters]);

  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando facturas...</p>
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
                Listado de Facturas
              </h1>
              <p className="text-gray-600 text-sm">
                Gestión y seguimiento de facturas
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => fetchInvoices()}
                variant="secondary"
                icon={RefreshCw}
                className="px-3 py-1.5 text-xs"
                disabled={loadingData}
              >
                {loadingData ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button
  onClick={handleExport}
  variant="secondary"
  icon={Download}
  className="px-3 py-1.5 text-xs"
  disabled={exporting || loadingData}
>
  {exporting ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      Exportando...
    </>
  ) : (
    "Exportar Excel"
  )}
</Button>
            </div>
          </div>
        </div>

        {/* Panel de Filtros */}
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
                disabled={loadingData}
              >
                Aplicar Filtros
              </Button>
              <Button
                onClick={clearFilters}
                variant="secondary"
                className="px-3 py-2 text-sm"
                disabled={loadingData}
              >
                Limpiar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro Cliente - COMBINADO */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Users className="h-4 w-4 inline mr-1" />
                Cliente
              </label>
              
              {!showClienteCustomInput ? (
                <select
                  value={tempFilters.nombre_cliente}
                  onChange={handleClienteSelectChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={loadingData}
                >
                  <option value="">Todos los clientes</option>
                  {filterOptions.clientes.map((cliente) => (
                    <option key={cliente} value={cliente}>
                      {cliente}
                    </option>
                  ))}
                  <option value="__custom__">➕ Otro cliente...</option>
                </select>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={clienteCustomValue}
                    onChange={(e) => setClienteCustomValue(e.target.value)}
                    placeholder="Ingrese nombre del cliente..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={loadingData}
                  />
                  <button
                    onClick={() => {
                      setShowClienteCustomInput(false);
                      setClienteCustomValue("");
                      setTempFilters({ ...tempFilters, nombre_cliente: "" });
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loadingData}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Filtro Proveedor - COMBINADO */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <User className="h-4 w-4 inline mr-1" />
                Proveedor
              </label>
              
              {!showProveedorCustomInput ? (
                <select
                  value={tempFilters.nombre_proveedor}
                  onChange={handleProveedorSelectChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={loadingData}
                >
                  <option value="">Todos los proveedores</option>
                  {filterOptions.proveedores.map((proveedor) => (
                    <option key={proveedor} value={proveedor}>
                      {proveedor}
                    </option>
                  ))}
                  <option value="__custom__">➕ Otro proveedor...</option>
                </select>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={proveedorCustomValue}
                    onChange={(e) => setProveedorCustomValue(e.target.value)}
                    placeholder="Ingrese nombre del proveedor..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={loadingData}
                  />
                  <button
                    onClick={() => {
                      setShowProveedorCustomInput(false);
                      setProveedorCustomValue("");
                      setTempFilters({ ...tempFilters, nombre_proveedor: "" });
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loadingData}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Filtro Número de Factura */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <FileDigit className="h-4 w-4 inline mr-1" />
                Número de Factura
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tempFilters.numero_factura}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      numero_factura: e.target.value,
                    })
                  }
                  placeholder="Ej: F-202601604"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={loadingData}
                />
                {tempFilters.numero_factura && (
                  <button
                    onClick={() =>
                      setTempFilters({ ...tempFilters, numero_factura: "" })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loadingData}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro Estado Pago */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Estado de Pago
              </label>
              <select
                value={tempFilters.estado_pago_neto}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    estado_pago_neto: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loadingData}
              >
                <option value="">Todos los estados</option>
                {filterOptions.estadosPago.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Estado Detracción */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Percent className="h-4 w-4 inline mr-1" />
                Estado de Detracción
              </label>
              <select
                value={tempFilters.estado_detraccion}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    estado_detraccion: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loadingData}
              >
                <option value="">Todos los estados</option>
                {filterOptions.estadosDetraccion.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Resto de los filtros (fechas) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 inline mr-1" />
                Emisión Desde
              </label>
              <input
                type="date"
                value={tempFilters.fecha_emision_inicio}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    fecha_emision_inicio: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loadingData}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 inline mr-1" />
                Emisión Hasta
              </label>
              <input
                type="date"
                value={tempFilters.fecha_emision_fin}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    fecha_emision_fin: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loadingData}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4 inline mr-1" />
                Vencimiento Desde
              </label>
              <input
                type="date"
                value={tempFilters.fecha_vencimiento_inicio}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    fecha_vencimiento_inicio: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loadingData}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4 inline mr-1" />
                Vencimiento Hasta
              </label>
              <input
                type="date"
                value={tempFilters.fecha_vencimiento_fin}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    fecha_vencimiento_fin: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loadingData}
              />
            </div>
          </div>

          {/* Indicador de filtros aplicados */}
          {(Object.values(appliedFilters).some((filter) => filter !== "") || clienteCustomValue || proveedorCustomValue) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Filtros aplicados:
                </span>
                <div className="flex flex-wrap gap-2 ml-3">
                  {(appliedFilters.nombre_cliente || clienteCustomValue) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Users className="h-3 w-3 mr-1" />
                      Cliente: {clienteCustomValue || appliedFilters.nombre_cliente}
                    </span>
                  )}
                  {(appliedFilters.nombre_proveedor || proveedorCustomValue) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <User className="h-3 w-3 mr-1" />
                      Proveedor: {proveedorCustomValue || appliedFilters.nombre_proveedor}
                    </span>
                  )}
                  {appliedFilters.numero_factura && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <FileDigit className="h-3 w-3 mr-1" />
                      Factura: {appliedFilters.numero_factura}
                    </span>
                  )}
                  {appliedFilters.estado_pago_neto && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Pago: {appliedFilters.estado_pago_neto}
                    </span>
                  )}
                  {appliedFilters.estado_detraccion && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Percent className="h-3 w-3 mr-1" />
                      Detracción: {appliedFilters.estado_detraccion}
                    </span>
                  )}
                  {appliedFilters.fecha_emision_inicio && appliedFilters.fecha_emision_fin && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      <Calendar className="h-3 w-3 mr-1" />
                      Emisión: {appliedFilters.fecha_emision_inicio} - {appliedFilters.fecha_emision_fin}
                    </span>
                  )}
                  {appliedFilters.fecha_vencimiento_inicio && appliedFilters.fecha_vencimiento_fin && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Vencimiento: {appliedFilters.fecha_vencimiento_inicio} - {appliedFilters.fecha_vencimiento_fin}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {loadingData && (
          <div className="flex items-center justify-center p-3 bg-white/80 backdrop-blur-sm mb-4 rounded-lg border border-gray-200">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Cargando datos...</span>
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[50px]">
                    {/* Columna para expandir */}
                  </th>
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
                      Total
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2" />
                      Detracción
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Neto
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Pagado
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Saldo
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[100px]">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Estado
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
                  const datosCompletos = invoice.datos_completos || {};
                  const fletes = datosCompletos.fletes || [];
                  const primerFlete = fletes[0] || {};
                  const servicio = primerFlete.servicio || {};
                  
                  const montoTotal = datosCompletos.monto_total || 0;
                  const montoNeto = invoice.monto_neto || 0;
                  const montoPagado = invoice.monto_pagado_acumulado || 0;
                  const saldoPendiente = montoNeto - montoPagado;
                  const daysUntilDue = getDaysUntilDue(datosCompletos.fecha_vencimiento);
                  const isExpanded = expandedRows[invoice._id?.$oid || invoice.codigo_factura];

                  return (
                    <React.Fragment key={invoice._id?.$oid || invoice.codigo_factura}>
                      <tr
                        className="border-b border-gray-200 hover:bg-blue-50 transition-colors group cursor-pointer"
                        onClick={() => handleRowClick(invoice)}
                      >
                        <td className="py-3 px-4 border-r border-gray-200">
                          <button
                            onClick={(e) => toggleRowExpand(invoice._id?.$oid || invoice.codigo_factura, e)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <ChevronRight
                              className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-blue-50 z-10">
                          <div className="font-medium text-gray-900">
                            {servicio.nombre_cliente || "N/A"}
                          </div>
                          <div className="text-gray-500 text-xs truncate">
                            {servicio.nombre_cuenta || ""}
                          </div>
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="font-medium text-gray-900 font-mono">
                            {invoice.codigo_factura}
                          </div>
                          <div className="text-gray-500 text-xs truncate">
                            {datosCompletos.numero_factura}
                          </div>
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          {formatDate(datosCompletos.fecha_emision)}
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="flex flex-col">
                            <span>{formatDate(datosCompletos.fecha_vencimiento)}</span>
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
                          {formatCurrency(montoTotal)}
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(invoice.estado_detraccion, "detraction")}`}>
                              {invoice.estado_detraccion || "N/A"}
                            </span>
                            <div className="text-xs text-gray-500">
                              {invoice.tasa_detraccion ? `${invoice.tasa_detraccion}%` : ""}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200 font-semibold">
                          {formatCurrency(montoNeto)}
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="font-semibold">
                            {formatCurrency(montoPagado)}
                          </div>
                          {montoPagado > 0 && (
                            <div className="text-xs text-green-600 flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Pagado
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div
                            className={`font-bold ${saldoPendiente > 0 ? "text-red-600" : saldoPendiente < 0 ? "text-green-600" : "text-gray-600"}`}
                          >
                            {formatCurrency(saldoPendiente)}
                          </div>
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(invoice.estado_pago_neto, "payment")}`}>
                            {invoice.estado_pago_neto || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="font-semibold">
                              {fletes.length}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 sticky right-0 bg-white group-hover:bg-blue-50 z-10" onClick={(e) => e.stopPropagation()}>
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
                      {isExpanded && renderExpandedRow(invoice)}
                    </React.Fragment>
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
                disabled={loadingData}
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
              disabled={loadingData}
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
              {Object.values(appliedFilters).some((filter) => filter !== "") || clienteCustomValue || proveedorCustomValue
                ? "No hay resultados para los filtros aplicados. Intenta ajustar los criterios de búsqueda."
                : "No hay facturas registradas en el sistema."}
            </p>
            {(Object.values(appliedFilters).some((filter) => filter !== "") || clienteCustomValue || proveedorCustomValue) && (
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

        {/* Modal de Detalles de Factura - MEJORADO */}
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
              {/* Tabla principal con información */}
              <div className="mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th colSpan="2" className="py-3 px-4 text-left font-semibold text-gray-900 border-b border-gray-300">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Información General de la Factura
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300 w-1/3">Código Factura</td>
                        <td className="py-2 px-4 font-semibold text-gray-900">{selectedInvoice.codigo_factura}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Número Factura</td>
                        <td className="py-2 px-4">{selectedInvoice.datos_completos?.numero_factura}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Fecha Emisión</td>
                        <td className="py-2 px-4">{formatDate(selectedInvoice.datos_completos?.fecha_emision)}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Fecha Vencimiento</td>
                        <td className="py-2 px-4">{formatDate(selectedInvoice.datos_completos?.fecha_vencimiento)}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Monto Total Factura</td>
                        <td className="py-2 px-4 font-semibold text-blue-700">{formatCurrency(selectedInvoice.datos_completos?.monto_total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sección Financiera */}
              <div className="mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th colSpan="2" className="py-3 px-4 text-left font-semibold text-gray-900 border-b border-gray-300">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Información Financiera
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300 w-1/3">Monto Neto</td>
                        <td className="py-2 px-4 font-semibold">{formatCurrency(selectedInvoice.monto_neto)}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Monto Pagado Acumulado</td>
                        <td className="py-2 px-4 font-semibold text-green-600">{formatCurrency(selectedInvoice.monto_pagado_acumulado)}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Saldo Pendiente</td>
                        <td className="py-2 px-4 font-bold text-lg">
                          <span className={(selectedInvoice.monto_neto - selectedInvoice.monto_pagado_acumulado) > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(selectedInvoice.monto_neto - selectedInvoice.monto_pagado_acumulado)}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Banco Destino</td>
                        <td className="py-2 px-4">{selectedInvoice.banco_destino || 'No especificado'}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Cuenta Bancaria Destino</td>
                        <td className="py-2 px-4 font-mono">{selectedInvoice.cuenta_bancaria_destino || 'No especificada'}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Número Operación Pago</td>
                        <td className="py-2 px-4 font-mono">{selectedInvoice.nro_operacion_pago_neto || 'No registrado'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Estados y Prioridades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan="2" className="py-3 px-4 text-left font-semibold text-gray-900 border-b border-gray-300">
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              Estados
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300 w-1/2">Estado Pago Neto</td>
                          <td className="py-2 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.estado_pago_neto, 'payment')}`}>
                              {selectedInvoice.estado_pago_neto || 'No especificado'}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Estado Detracción</td>
                          <td className="py-2 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.estado_detraccion, 'detraction')}`}>
                              {selectedInvoice.estado_detraccion || 'No especificado'}
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Prioridad de Pago</td>
                          <td className="py-2 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.prioridad, 'priority')}`}>
                              {selectedInvoice.prioridad || 'No especificada'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th colSpan="2" className="py-3 px-4 text-left font-semibold text-gray-900 border-b border-gray-300">
                            <div className="flex items-center">
                              <Percent className="h-4 w-4 mr-2" />
                              Detracción
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300 w-1/2">Tasa Detracción</td>
                          <td className="py-2 px-4 font-semibold">{selectedInvoice.tasa_detraccion || 0}%</td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Monto Detracción</td>
                          <td className="py-2 px-4 font-semibold">{formatCurrency(selectedInvoice.monto_detraccion)}</td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Número Constancia</td>
                          <td className="py-2 px-4 font-mono">{selectedInvoice.nro_constancia_detraccion || 'No generada'}</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Fecha Pago Detracción</td>
                          <td className="py-2 px-4">
                            {selectedInvoice.fecha_pago_detraccion ? (
                              <span className="text-green-600 font-medium">{formatDate(selectedInvoice.fecha_pago_detraccion)}</span>
                            ) : (
                              <span className="text-yellow-600">Pendiente</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th colSpan="2" className="py-3 px-4 text-left font-semibold text-gray-900 border-b border-gray-300">
                          <div className="flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            Información Adicional
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300 w-1/3">Centro de Costo</td>
                        <td className="py-2 px-4">{selectedInvoice.centro_costo || 'No asignado'}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Responsable Gestión</td>
                        <td className="py-2 px-4">{selectedInvoice.responsable_gestion || 'No asignado'}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Fecha Probable Pago</td>
                        <td className="py-2 px-4">
                          {selectedInvoice.fecha_probable_pago ? formatDate(selectedInvoice.fecha_probable_pago) : 'No programada'}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Última Actualización</td>
                        <td className="py-2 px-4">
                          {selectedInvoice.ultima_actualizacion ? formatDate(selectedInvoice.ultima_actualizacion) : 'No disponible'}
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-700 border-r border-gray-300">Observaciones Admin</td>
                        <td className="py-2 px-4 text-gray-600 italic">
                          {selectedInvoice.observaciones_admin || 'Sin observaciones'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lista de fletes */}
              {selectedInvoice.datos_completos?.fletes && selectedInvoice.datos_completos.fletes.length > 0 && (
                <div className="mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-3 px-4 text-left font-semibold text-gray-900 border-b border-gray-300">
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 mr-2" />
                              Fletes Asociados ({selectedInvoice.datos_completos.fletes.length})
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.datos_completos.fletes.map(
                          (freight, index) => (
                            <tr key={freight.codigo_flete || index}>
                              <td className="py-2 px-4">
                                {renderFreightDetails(freight, index)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
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