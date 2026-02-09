import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Download,
  Loader2,
  Eye,
  Building,
  DollarSign,
  Clock,
  CheckCircle,
  Percent,
  Truck,
  RefreshCw,
  ChevronRight,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";
import { formatCurrency, formatDate } from "../../../utils/facturacionUtils";
import { facturacionGestionAPI } from "../../../api/endpoints/facturacionGestion";

const DetalleGestion = () => {
  // Estados para datos
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [exporting, setExporting] = useState(false);

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
  const [expandedRows, setExpandedRows] = useState({});

  // Función para obtener query parameters de la URL
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    const filters = {};
    
    // Mapear parámetros de URL a los nombres que espera la API
    if (params.has('cliente')) {
      // Decodificar el valor (puede estar URL-encoded dos veces)
      filters.nombre_cliente = decodeURIComponent(decodeURIComponent(params.get('cliente')));
    }
    
    if (params.has('mes') && params.has('año')) {
      const mes = params.get('mes').padStart(2, '0');
      const año = params.get('año');
      
      // Crear fechas para el mes completo
      const fechaInicio = `${año}-${mes}-01`;
      const lastDay = new Date(año, mes, 0).getDate();
      const fechaFin = `${año}-${mes}-${lastDay}`;
      
      filters.fecha_emision_inicio = fechaInicio;
      filters.fecha_emision_fin = fechaFin;
    }
    
    if (params.has('filtro_tipo')) {
      // Puedes agregar lógica adicional según el tipo de filtro
      const tipoFiltro = params.get('filtro_tipo');
      // Por ahora solo registramos el tipo
      console.log('Tipo de filtro:', tipoFiltro);
    }
    
    return filters;
  };

  // Función para obtener todas las gestiones
  const fetchInvoices = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      setLoadingData(true);

      try {
        // Obtener filtros de la URL
        const filtersFromUrl = getQueryParams();
        
        // Preparar filtros para la API
        const filters = { ...filtersFromUrl };

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
    [pagination.pageSize],
  );

  // Función para exportar datos
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      // Obtener filtros de la URL
      const filtersForAPI = getQueryParams();
      
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
  }, []);

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
  };

  // Función para expandir/contraer fila
  const toggleRowExpand = (invoiceId, e) => {
    e.stopPropagation(); // Prevenir que se abra el modal
    setExpandedRows(prev => ({
      ...prev,
      [invoiceId]: !prev[invoiceId]
    }));
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

  // Obtener colores según estado de pago
  const getPaymentStatusColor = (status) => {
    if (!status) return "bg-gray-50 text-gray-700 border-gray-200";

    switch (status) {
      case "Pendiente":
      case "Vencido":
        return "bg-red-50 text-red-700 border-red-200";
      case "Pagado Parcial":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Pagado":
        return "bg-green-50 text-green-700 border-green-200";
      case "En Disputa":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Anulado":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Obtener colores según estado de detracción
  const getDetractionStatusColor = (status) => {
    if (!status) return "bg-gray-50 text-gray-700 border-gray-200";

    switch (status) {
      case "Pendiente":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Pagado":
        return "bg-green-50 text-green-700 border-green-200";
      case "No Aplica":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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
        {/* Encabezado simple */}
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

        {loadingData && (
          <div className="flex items-center justify-center p-3 bg-white/80 backdrop-blur-sm mb-4 rounded-lg border border-gray-200">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Cargando datos...</span>
          </div>
        )}

        {/* Tabla de Facturas - Simplificada */}
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
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[180px]">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Cliente
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Factura
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
                      Facturado Bruto
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
                      Monto Cobrar
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Cobrado
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[120px]">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Pendiente
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300 min-w-[100px]">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Estado
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 min-w-[80px]">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Acciones
                    </div>
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
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="font-medium text-gray-900">
                            {servicio.nombre_cliente || "N/A"}
                          </div>
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div className="font-medium text-gray-900 font-mono">
                            {datosCompletos.numero_factura}
                          </div>
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
                            <span className={`inline-block px-2 py-1 rounded text-xs ${getDetractionStatusColor(invoice.estado_detraccion)}`}>
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
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <div
                            className={`font-bold ${saldoPendiente > 0 ? "text-red-600" : saldoPendiente < 0 ? "text-green-600" : "text-gray-600"}`}
                          >
                            {formatCurrency(saldoPendiente)}
                          </div>
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${getPaymentStatusColor(invoice.estado_pago_neto)}`}>
                            {invoice.estado_pago_neto || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
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
                      {isExpanded && (
                        <tr className="bg-blue-50" onClick={(e) => e.stopPropagation()}>
                          <td colSpan="11" className="p-4 border-b border-gray-200">
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <div className="font-medium mb-1">Información</div>
                                <div className="space-y-1">
                                  <div><span className="text-gray-600">Emisión:</span> {formatDate(datosCompletos.fecha_emision)}</div>
                                  <div><span className="text-gray-600">Proveedor:</span> {servicio.nombre_proveedor || 'N/A'}</div>
                                  <div><span className="text-gray-600">Fletes:</span> {fletes.length}</div>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium mb-1">Detracción</div>
                                <div className="space-y-1">
                                  <div><span className="text-gray-600">Monto:</span> {formatCurrency(invoice.monto_detraccion)}</div>
                                  <div><span className="text-gray-600">Constancia:</span> {invoice.nro_constancia_detraccion || 'N/A'}</div>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium mb-1">Detalles</div>
                                <div className="space-y-1">
                                  <div><span className="text-gray-600">Centro Costo:</span> {invoice.centro_costo || 'N/A'}</div>
                                  <div><span className="text-gray-600">Responsable:</span> {invoice.responsable_gestion || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
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
              No hay facturas que coincidan con los filtros aplicados.
            </p>
          </div>
        )}

        {/* Modal de Detalles de Factura - Simplificado */}
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
          size="large"
        >
          {selectedInvoice && (
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Información General</h4>
                  <div className="text-sm space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Número Factura:</span>
                      <span className="font-medium">{selectedInvoice.datos_completos?.numero_factura}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Emisión:</span>
                      <span className="font-medium">{formatDate(selectedInvoice.datos_completos?.fecha_emision)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Vencimiento:</span>
                      <span className="font-medium">{formatDate(selectedInvoice.datos_completos?.fecha_vencimiento)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Información Financiera</h4>
                  <div className="text-sm space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Monto Total:</span>
                      <span className="font-semibold">{formatCurrency(selectedInvoice.datos_completos?.monto_total)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Monto Neto:</span>
                      <span className="font-semibold">{formatCurrency(selectedInvoice.monto_neto)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Pagado:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(selectedInvoice.monto_pagado_acumulado)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Saldo:</span>
                      <span className={`font-bold ${(selectedInvoice.monto_neto - selectedInvoice.monto_pagado_acumulado) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(selectedInvoice.monto_neto - selectedInvoice.monto_pagado_acumulado)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Estados</h4>
                  <div className="text-sm space-y-2">
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-gray-600">Pago Neto:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(selectedInvoice.estado_pago_neto)}`}>
                        {selectedInvoice.estado_pago_neto || 'N/A'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-gray-600">Detracción:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getDetractionStatusColor(selectedInvoice.estado_detraccion)}`}>
                        {selectedInvoice.estado_detraccion || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Detracción</h4>
                  <div className="text-sm space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Tasa:</span>
                      <span className="font-medium">{selectedInvoice.tasa_detraccion || 0}%</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-600">Monto:</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.monto_detraccion)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowInvoiceModal(false)}
                    variant="secondary"
                    className="px-4 py-2 text-sm"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default DetalleGestion;