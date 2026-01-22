  import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  FileText,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Edit,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Truck,
  FileEdit,
  FileCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";

import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";

import { facturasAPI } from "../../../api/endpoints/facturas";

import {
  formatCurrency,
  formatDate,
  getEstadoColor,
  getMonedaColor,
  getDiasVencimientoColor,
  calcularDiasVencimiento,
} from "../../../utils/facturasUtils";

import FacturaForm from "./FacturaForm";

const Facturacion = () => {
  const [servicioModal, setServicioModal] = useState({
    show: false,
    data: null,
    loading: false,
  });

  const [pagoModal, setPagoModal] = useState({
    show: false,
    facturaId: null,
    fechaPago: new Date().toISOString().split("T")[0],
  });

  const [facturas, setFacturas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [filters, setFilters] = useState({
    numero_factura: "",
    estado: "",
    moneda: "",
    periodo: "",
    fecha_emision_inicio: "",
    fecha_emision_fin: "",
    fecha_vencimiento_inicio: "",
    fecha_vencimiento_fin: "",
    fecha_pago_inicio: "",
    fecha_pago_fin: "",
    monto_total_minimo: "",
    monto_total_maximo: "",
    cliente_nombre: "",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState("codigo_factura");
  const [sortOrder, setSortOrder] = useState(-1);

  const [activeTab, setActiveTab] = useState("borradores");

  const [modalState, setModalState] = useState({
    show: false,
    mode: "edit",
    data: null,
  });

  const [detailModal, setDetailModal] = useState({
    show: false,
    data: null,
  });

  const [estadisticas, setEstadisticas] = useState({
    facturas_borrador: 0,
    por_estado: { Emitida: { count: 0 } },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEmitting, setIsEmitting] = useState(false);

  const searchInputRef = useRef(null);

const fetchFacturas = useCallback(
  async (searchValue = "", tab = activeTab) => {
    setIsLoading(true);
    setError(null);

    try {
      // Crear filtros combinando búsqueda por número y nombre de cliente
      const filtersForAPI = facturasAPI.buildFilterParams({
        ...filters,
        // Si hay término de búsqueda, buscar por número de factura
        ...(searchValue && { numero_factura: searchValue }),
        // El filtro de cliente_nombre ya está en filters
        ...(tab === "borradores" && { estado: "Borrador" }),
        ...(tab === "emitidas" && { estado: "Emitida" }),
      });
      
      const data = await facturasAPI.getAllFacturas(
        filtersForAPI,
        currentPage,
        pageSize, // Ahora será 20
        sortBy,
        sortOrder
      );
      
      setFacturas(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalItems(data.total || 0);

      setEstadisticas(prev => ({
        ...prev,
        facturas_borrador: data.items?.filter(f => f.estado === "Borrador").length || 0
      }));
    } catch (err) {
      setError("Error al cargar las facturas: " + err.message);
      console.error("Error fetching facturas:", err);
    } finally {
      setIsLoading(false);
    }
  },
  [
    filters,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    activeTab,
  ]
);
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchTerm !== "") {
      const timeout = setTimeout(() => {
        fetchFacturas(searchTerm);
      }, 500);
      setSearchTimeout(timeout);
    } else {
      fetchFacturas();
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [
    searchTerm,
    activeTab,
    filters,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
  ]);

  const handleViewServicioDetails = useCallback(async (servicioId) => {
    setServicioModal({ show: true, data: null, loading: true });
    setError(null);

    try {
      const servicioData = await facturasAPI.getServicioById(servicioId);
      setServicioModal({ show: true, data: servicioData, loading: false });
    } catch (err) {
      setError("Error al cargar detalles del servicio: " + err.message);
      setServicioModal({ show: false, data: null, loading: false });
    }
  }, []);

  const handleEditSubmit = useCallback(
    async (formData) => {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        if (modalState.data && modalState.data.id) {
          await facturasAPI.updateFactura(modalState.data.id, formData);

          setSuccessMessage("Factura actualizada correctamente");

          setTimeout(() => {
            setModalState({ show: false, mode: "edit", data: null });
            fetchFacturas();
          }, 1500);
        }
      } catch (err) {
        setError("Error al actualizar la factura: " + err.message);
      } finally {
        setIsSaving(false);
      }
    },
    [modalState.data, fetchFacturas]
  );

  const handleEmitirFactura = useCallback(
    async (facturaId) => {
      setError(null);
      setSuccessMessage(null);
      setIsEmitting(true);

      try {
        const facturaActual = facturas.find((f) => f.id === facturaId);

        if (!facturaActual) {
          throw new Error("No se encontró la factura");
        }

        const numeroFactura = facturaActual.numero_factura;
        const fechaEmision = facturaActual.fecha_emision;
        const fechaVencimiento = facturaActual.fecha_vencimiento;

        await facturasAPI.emitirFactura(
          facturaId,
          numeroFactura,
          fechaEmision,
          fechaVencimiento
        );
        setSuccessMessage("Factura emitida correctamente");


          setDetailModal({ show: false, data: null });
          fetchFacturas();

      } catch (err) {
        setError("Error al emitir factura: " + err.message);
      } finally {
        setIsEmitting(false);
      }
    },
    [facturas, fetchFacturas]
  );

  const canEditOrDeleteFactura = useCallback((factura) => {
    return factura.estado === "Borrador";
  }, []);

  const handleEdit = useCallback(
    (factura) => {
      if (!canEditOrDeleteFactura(factura)) {
        setError("Esta factura ya fue emitida y no se puede editar");
        return;
      }

      setModalState({
        show: true,
        mode: "edit",
        data: factura,
      });
      setError(null);
      setSuccessMessage(null);
    },
    [canEditOrDeleteFactura]
  );

  const handleViewDetails = useCallback((factura) => {
    setDetailModal({
      show: true,
      data: factura,
    });
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleRowClick = useCallback(
    (factura) => {
      handleViewDetails(factura);
    },
    [handleViewDetails]
  );

  const handleEditFromDetails = useCallback(() => {
    if (detailModal.data) {
      if (!canEditOrDeleteFactura(detailModal.data)) {
        setError("Esta factura ya fue emitida y no se puede editar");
        return;
      }

      setModalState({
        show: true,
        mode: "edit",
        data: detailModal.data,
      });
      setDetailModal({ show: false, data: null });
    }
  }, [detailModal.data, canEditOrDeleteFactura]);

  const handleMarkAsPaid = useCallback(
    async (facturaId, fechaPago = null) => {
      try {
        const fechaAPagar = fechaPago || pagoModal.fechaPago;

        await facturasAPI.marcarFacturaComoPagada(facturaId, fechaAPagar);
        fetchFacturas();
        setDetailModal({ show: false, data: null });
        setPagoModal({
          show: false,
          facturaId: null,
          fechaPago: new Date().toISOString().split("T")[0],
        });
        setSuccessMessage("Factura marcada como pagada");
      } catch (err) {
        setError("Error al marcar como pagada: " + err.message);
      }
    },
    [fetchFacturas, pagoModal.fechaPago]
  );

  const handleOpenPagoModal = useCallback((facturaId) => {
    setPagoModal({
      show: true,
      facturaId: facturaId,
      fechaPago: new Date().toISOString().split("T")[0],
    });
  }, []);

  const handleDeleteFactura = useCallback(
    async (facturaId) => {
      const factura = facturas.find((f) => f.id === facturaId);

      if (!factura || !canEditOrDeleteFactura(factura)) {
        setError("Esta factura ya fue emitida y no se puede eliminar");
        return;
      }

      if (
        !window.confirm("¿Estás seguro de que deseas eliminar esta factura?")
      ) {
        return;
      }

      try {
        await facturasAPI.deleteFactura(facturaId);
        fetchFacturas();
        setDetailModal({ show: false, data: null });
        setSuccessMessage("Factura eliminada correctamente");
      } catch (err) {
        setError("Error al eliminar factura: " + err.message);
      }
    },
    [facturas, canEditOrDeleteFactura, fetchFacturas]
  );

  const handleExport = useCallback(async () => {
    try {
      const filtersForAPI = facturasAPI.buildFilterParams({
        ...filters,
        ...(activeTab === "borradores" && { estado: "Borrador" }),
        ...(activeTab === "emitidas" && { estado: "Emitida" }),
      });
      const blob = await facturasAPI.exportAllFacturasExcel(filtersForAPI);
      const fileName = `facturas_${activeTab}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      facturasAPI.downloadExcel(blob, fileName);
    } catch (err) {
      setError("Error al exportar: " + err.message);
    }
  }, [filters, activeTab]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

const clearFilters = useCallback(() => {
  setFilters({
    numero_factura: "",
    estado: "",
    moneda: "",
    periodo: "",
    fecha_emision_inicio: "",
    fecha_emision_fin: "",
    fecha_vencimiento_inicio: "",
    fecha_vencimiento_fin: "",
    fecha_pago_inicio: "",
    fecha_pago_fin: "",
    monto_total_minimo: "",
    monto_total_maximo: "",
    cliente_nombre: "",
  });
  setSearchTerm("");
  setCurrentPage(1);
  if (searchInputRef.current) {
    searchInputRef.current.focus();
  }
}, []);

  const getActiveFiltersCount = useCallback(() => {
    return (
      Object.values(filters).filter((value) => value !== "" && value !== null)
        .length + (searchTerm ? 1 : 0)
    );
  }, [filters, searchTerm]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    if (tab === "borradores") {
      setFilters((prev) => ({
        ...prev,
        estado: "Borrador",
      }));
    } else if (tab === "emitidas") {
      setFilters((prev) => ({
        ...prev,
        estado: "Emitida",
      }));
    }
  }, []);

  const getClienteInfoFromFactura = useCallback((factura) => {
    if (!factura.fletes || !Array.isArray(factura.fletes) || factura.fletes.length === 0) {
      return {
        cliente: "No especificado",
        fechaServicio: "No especificada",
      };
    }

    const primerFlete = factura.fletes[0];
    if (primerFlete.servicio && primerFlete.servicio.cliente) {
      return {
        cliente: primerFlete.servicio.cliente.nombre || "No especificado",
        fechaServicio: primerFlete.servicio.fecha_servicio ? 
          formatDate(primerFlete.servicio.fecha_servicio) : "No especificada",
        codigoServicio: primerFlete.servicio.codigo_servicio || "N/A",
        tipoServicio: primerFlete.servicio.tipo_servicio || "No especificado",
        zona: primerFlete.servicio.zona || "No especificado",
      };
    }

    return {
      cliente: "No especificado",
      fechaServicio: "No especificada",
    };
  }, []);

  const getServicioInfo = useCallback((flete) => {
    if (!flete) return { servicio_id: "N/A", codigo_servicio: "N/A" };

    return {
      servicio_id: flete.servicio_id || "N/A",
      codigo_servicio: flete.codigo_servicio || "N/A",
    };
  }, []);

  const renderServicioDetails = useCallback((servicio) => {
    if (!servicio) return null;

    const conductor = servicio.conductor?.[0];
    const auxiliar = servicio.auxiliar?.[0];
    const flota = servicio.flota;
    const cliente = servicio.cliente;
    const cuenta = servicio.cuenta;
    const proveedor = servicio.proveedor;

    const getValue = (value) => value || value === 0 ? value : 'N/A';
    const getObjectValue = (obj, key) => obj?.[key] ? obj[key] : 'N/A';

    const tableData = [
      { categoria: 'INFORMACIÓN GENERAL', label: 'Código Servicio', value: servicio.codigo_servicio_principal },
      { categoria: 'INFORMACIÓN GENERAL', label: 'Estado', value: servicio.estado },
      { categoria: 'INFORMACIÓN GENERAL', label: 'Tipo Servicio', value: servicio.tipo_servicio },
      { categoria: 'INFORMACIÓN GENERAL', label: 'Modalidad Servicio', value: servicio.modalidad_servicio },
      { categoria: 'INFORMACIÓN GENERAL', label: 'Zona', value: servicio.zona },
      { categoria: 'INFORMACIÓN GENERAL', label: 'Solicitud', value: servicio.solicitud },
      { categoria: 'INFORMACIÓN GENERAL', label: 'Mes', value: servicio.mes },
      { categoria: 'INFORMACIÓN GENERAL', label: 'M3', value: servicio.m3 },
      { categoria: 'INFORMACIÓN GENERAL', label: 'TN', value: servicio.tn },
      { categoria: 'INFORMACIÓN GENERAL', label: 'Descripción', value: servicio.descripcion },

      { categoria: 'FECHAS Y HORARIOS', label: 'Fecha Servicio', value: servicio.fecha_servicio },
      { categoria: 'FECHAS Y HORARIOS', label: 'Fecha Salida', value: servicio.fecha_salida },
      { categoria: 'FECHAS Y HORARIOS', label: 'Hora Cita', value: servicio.hora_cita },
      
      { categoria: 'RUTA Y LOGÍSTICA', label: 'Origen', value: servicio.origen },
      { categoria: 'RUTA Y LOGÍSTICA', label: 'Destino', value: servicio.destino },
      { categoria: 'RUTA Y LOGÍSTICA', label: 'Guía RR', value: servicio.gia_rr },
      { categoria: 'RUTA Y LOGÍSTICA', label: 'Guía RT', value: servicio.gia_rt },

      { categoria: 'CLIENTE', label: 'RUC Cliente', value: getObjectValue(cliente, 'ruc') },
      { categoria: 'CLIENTE', label: 'Razón Social', value: getObjectValue(cliente, 'razon_social') },
      { categoria: 'CLIENTE', label: 'Número Documento', value: getObjectValue(cliente, 'numero_documento') },

      { categoria: 'CUENTA', label: 'Nombre Cuenta', value: getObjectValue(cuenta, 'nombre') },
      { categoria: 'CUENTA', label: 'Tipo Pago', value: getObjectValue(cuenta, 'tipo_pago') },
      { categoria: 'CUENTA', label: 'Dirección Origen', value: getObjectValue(cuenta, 'direccion_origen') },
      { categoria: 'CUENTA', label: 'Días Crédito', value: getObjectValue(cuenta, 'dias_credito') },
      { categoria: 'CUENTA', label: 'Límite Crédito', value: getObjectValue(cuenta, 'limite_credito') },

      { categoria: 'PROVEEDOR', label: 'RUC Proveedor', value: getObjectValue(proveedor, 'ruc') },
      { categoria: 'PROVEEDOR', label: 'Razón Social Proveedor', value: getObjectValue(proveedor, 'razon_social') },
      { categoria: 'PROVEEDOR', label: 'Número Documento Proveedor', value: getObjectValue(proveedor, 'numero_documento') },

      { categoria: 'FLOTA', label: 'Placa', value: getObjectValue(flota, 'placa') },
      { categoria: 'FLOTA', label: 'Marca', value: getObjectValue(flota, 'marca') },
      { categoria: 'FLOTA', label: 'Modelo', value: getObjectValue(flota, 'modelo') },
      { categoria: 'FLOTA', label: 'Tipo Vehículo', value: getObjectValue(flota, 'tipo_vehiculo') },
      { categoria: 'FLOTA', label: 'Capacidad M3', value: getObjectValue(flota, 'capacidad_m3') },
      { categoria: 'FLOTA', label: 'Nombre Conductor Flota', value: getObjectValue(flota, 'nombre_conductor') },

      { categoria: 'CONDUCTOR', label: 'Nombres Completos Conductor', value: getObjectValue(conductor, 'nombres_completos') },
      { categoria: 'CONDUCTOR', label: 'DNI Conductor', value: getObjectValue(conductor, 'dni') },
      { categoria: 'CONDUCTOR', label: 'Licencia Conducir', value: getObjectValue(conductor, 'licencia_conducir') },
      { categoria: 'CONDUCTOR', label: 'Tipo Conductor', value: getObjectValue(conductor, 'tipo') },

      { categoria: 'AUXILIAR', label: 'Nombres Completos Auxiliar', value: getObjectValue(auxiliar, 'nombres_completos') },
      { categoria: 'AUXILIAR', label: 'DNI Auxiliar', value: getObjectValue(auxiliar, 'dni') },
      { categoria: 'AUXILIAR', label: 'Tipo Auxiliar', value: getObjectValue(auxiliar, 'tipo') },
    ];

    const groupedData = tableData.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = [];
      }
      acc[item.categoria].push(item);
      return acc;
    }, {});

    return (
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {servicio.codigo_servicio_principal || 'Sin código'}
              </h2>
              <p className="text-gray-600 text-sm">
                {servicio.tipo_servicio} • {servicio.modalidad_servicio}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${getEstadoColor(servicio.estado)}`}>
              {servicio.estado}
            </span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-3">
            <h3 className="text-sm font-semibold">Todos los Campos del Servicio</h3>
          </div>
          
          <div className="overflow-x-auto">
            {Object.entries(groupedData).map(([categoria, items]) => (
              <div key={categoria} className="border-b border-gray-200 last:border-b-0">
                <div className="bg-gray-100 px-4 py-2">
                  <h4 className="text-sm font-semibold text-gray-700">{categoria}</h4>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={`${categoria}-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 w-1/3">
                          {item.label}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {getValue(item.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, []);

  const renderFacturaDetails = useCallback(
    (factura) => {
      if (!factura) return null;

      const clienteInfo = getClienteInfoFromFactura(factura);
      const diasVencimiento = calcularDiasVencimiento(
        factura.fecha_vencimiento
      );
      const puedeEditarEliminar = canEditOrDeleteFactura(factura);

      return (
        <div className="space-y-4">
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div className="ml-2">
                  <p className="text-xs text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
                <div className="ml-2">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {factura.numero_factura || "Sin número"}
                </h2>
                <p className="text-gray-600 text-sm">
                  {factura.codigo_factura}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${getEstadoColor(
                    factura.estado
                  )}`}
                >
                  {factura.estado}
                </span>
                {factura.estado === "Borrador" && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    Borrador
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Monto Total</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(factura.monto_total || 0, factura.moneda)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Moneda</div>
                <div className="text-sm font-medium text-gray-900">
                  {factura.moneda}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Fecha Emisión</div>
                <div className="text-sm font-medium text-gray-900">
                  {factura.fecha_emision
                    ? formatDate(factura.fecha_emision)
                    : "No especificada"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Fecha Vencimiento</div>
                <div className="text-sm font-medium text-gray-900">
                  {factura.fecha_vencimiento
                    ? formatDate(factura.fecha_vencimiento)
                    : "No especificada"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Información de Factura
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">
                        Número Factura
                      </div>
                      <div className="font-medium">
                        {factura.numero_factura || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Código</div>
                      <div className="font-medium">
                        {factura.codigo_factura}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Descripción</div>
                    <div className="font-medium">
                      {factura.descripcion || "Sin descripción"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Cliente</div>
                    <div className="font-medium">
                      {clienteInfo.cliente}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Fecha Servicio</div>
                    <div className="font-medium">
                      {clienteInfo.fechaServicio}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">
                        Fecha Registro
                      </div>
                      <div className="font-medium">
                        {formatDate(factura.fecha_registro)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Fecha Pago</div>
                      <div className="font-medium">
                        {factura.fecha_pago
                          ? formatDate(factura.fecha_pago)
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Resumen Financiero
                    </div>
                    <div className="space-y-1 mt-1">
                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-800 font-semibold">
                          Total Factura:
                        </span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(
                            factura.monto_total || 0,
                            factura.moneda
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Fletes Asociados ({factura.fletes?.length || 0})
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3 text-sm">
                  {factura.fletes && factura.fletes.length > 0 ? (
                    <>
                      {factura.fletes.map((flete, index) => {
                        const servicioInfo = getServicioInfo(flete);
                        return (
                          <div
                            key={flete.id || index}
                            className="border border-gray-200 rounded p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {flete.codigo_flete}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Servicio: {servicioInfo.codigo_servicio}
                                </div>
                              </div>
                              <div className="font-bold text-gray-900">
                                {formatCurrency(
                                  flete.monto_flete || 0,
                                  factura.moneda
                                )}
                              </div>
                              {flete.servicio_id && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewServicioDetails(
                                      flete.servicio_id
                                    );
                                  }}
                                  variant="primary"
                                  size="small"
                                  title="Ver detalles del servicio"
                                >
                                  Info del Servicio
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <div className="text-gray-500">Estado</div>
                                <div className="font-medium">
                                  {flete.estado_flete}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">
                                  Fecha Creación
                                </div>
                                <div className="font-medium">
                                  {formatDate(flete.fecha_creacion)}
                                </div>
                              </div>
                            </div>

                            {flete.observaciones && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="text-xs text-gray-500">
                                  Observaciones
                                </div>
                                <div className="text-xs">
                                  {flete.observaciones}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="font-semibold text-gray-900">
                            Total Fletes:
                          </div>
                          <div className="font-bold text-gray-900">
                            {formatCurrency(
                              factura.fletes.reduce(
                                (sum, flete) => sum + (flete.monto_flete || 0),
                                0
                              ),
                              factura.moneda
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Truck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">
                        No hay fletes asociados a esta factura
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">ID: {factura.id}</div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setDetailModal({ show: false, data: null })}
                variant="secondary"
                size="small"
              >
                Cerrar
              </Button>

              {puedeEditarEliminar && (
                <Button
                  onClick={handleEditFromDetails}
                  variant="primary"
                  size="small"
                  icon={Edit}
                >
                  Editar
                </Button>
              )}

              {factura.estado === "Borrador" && (
                <Button
                  onClick={() => handleEmitirFactura(factura.id)}
                  variant="warning"
                  size="small"
                  icon={FileCheck}
                  disabled={isEmitting}
                >
                  {isEmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      Emitiendo...
                    </>
                  ) : (
                    "Emitir Factura"
                  )}
                </Button>
              )}

              {puedeEditarEliminar && (
                <Button
                  onClick={() => handleDeleteFactura(factura.id)}
                  variant="danger"
                  size="small"
                  icon={XCircle}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    },
    [
      getClienteInfoFromFactura,
      getServicioInfo,
      handleEditFromDetails,
      handleEmitirFactura,
      handleDeleteFactura,
      canEditOrDeleteFactura,
      successMessage,
      error,
      isEmitting,
    ]
  );

  if (isLoading && facturas.length === 0) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Emision de Facturación
          </h1>
        
        </div>

        <div className="flex items-center space-x-2 mt-3 lg:mt-0">
          <Button
            onClick={() => {
              setIsLoading(true);
              fetchFacturas("");
            }}
            icon={RefreshCw}
            size="small"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Actualizando...
              </>
            ) : (
              "Actualizar"
            )}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            <button
              onClick={() => handleTabChange("borradores")}
              className={`py-2 px-1 border-b-2 font-medium text-xs flex items-center ${
                activeTab === "borradores"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Facturas en Borrador
              {/* <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {estadisticas.facturas_borrador || 0}
              </span> */}
            </button>

            <button
              onClick={() => handleTabChange("emitidas")}
              className={`py-2 px-1 border-b-2 font-medium text-xs flex items-center ${
                activeTab === "emitidas"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Facturas Emitidas
              {/* <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {estadisticas.por_estado?.Emitida?.count || 0}
              </span> */}
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Ejem: F001-001`}
                className="w-full pl-8 pr-4 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={filters.cliente_nombre}
            onChange={(e) => handleFilterChange("cliente_nombre", e.target.value)}
            placeholder="Ejem: SONEPAR"
            className="w-full pl-8 pr-4 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
          {filters.cliente_nombre && (
            <button
              onClick={() => handleFilterChange("cliente_nombre", "")}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

          <div className="flex items-center space-x-2 mt-2 lg:mt-0">
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="secondary"
              size="small"
              icon={Filter}
            >
              Filtros
              {getActiveFiltersCount() > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>

            <Button
              onClick={handleExport}
              variant="secondary"
              size="small"
              icon={Download}
            >
              Exportar
            </Button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  N° Factura
                </label>
                <input
                  type="text"
                  value={filters.numero_factura}
                  onChange={(e) =>
                    handleFilterChange("numero_factura", e.target.value)
                  }
                  placeholder="Ej: FAC-001"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rango de Fechas (Emisión)
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.fecha_emision_inicio}
                    onChange={(e) =>
                      handleFilterChange("fecha_emision_inicio", e.target.value)
                    }
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                  <span className="flex items-center text-gray-500 text-xs">
                    a
                  </span>
                  <input
                    type="date"
                    value={filters.fecha_emision_fin}
                    onChange={(e) =>
                      handleFilterChange("fecha_emision_fin", e.target.value)
                    }
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rango de Fechas (Vencimiento)
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.fecha_vencimiento_inicio}
                    onChange={(e) =>
                      handleFilterChange(
                        "fecha_vencimiento_inicio",
                        e.target.value
                      )
                    }
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                  <span className="flex items-center text-gray-500 text-xs">
                    a
                  </span>
                  <input
                    type="date"
                    value={filters.fecha_vencimiento_fin}
                    onChange={(e) =>
                      handleFilterChange(
                        "fecha_vencimiento_fin",
                        e.target.value
                      )
                    }
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rango de Monto
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.monto_total_minimo}
                    onChange={(e) =>
                      handleFilterChange(
                        "monto_total_minimo",
                        e.target.value
                      )
                    }
                    step="0.01"
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                  <span className="flex items-center text-gray-500 text-xs">
                    a
                  </span>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={filters.monto_total_maximo}
                    onChange={(e) =>
                      handleFilterChange(
                        "monto_total_maximo",
                        e.target.value
                      )
                    }
                    step="0.01"
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                variant="ghost"
                size="xsmall"
              >
                {showAdvancedFilters ? "Menos filtros" : "Más filtros"}
                {showAdvancedFilters ? (
                  <ChevronUp className="ml-1 h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                )}
              </Button>

              <div className="flex space-x-2">
                {getActiveFiltersCount() > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant="secondary"
                    size="xsmall"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Limpiar ({getActiveFiltersCount()})
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 m-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <div className="ml-2">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 m-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div className="ml-2">
                <p className="text-xs text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                
                <th className="py-2 px-3 text-left font-medium text-gray-700">
                  Cliente
                </th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">
                  Numero Factura
                </th>
                
                <th className="py-2 px-3 text-left font-medium text-gray-700">
                  Fechas Factura
                </th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">
                   Monto
                </th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">
                  Estado
                </th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">
                  Fletes
                </th>
                {/* <th className="py-2 px-3 text-left font-medium text-gray-700">
                  Fecha Servicio
                </th> */}
                
                <th className="py-2 px-3 text-left font-medium text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {facturas.map((factura) => {
                const clienteInfo = getClienteInfoFromFactura(factura);
                const diasVencimiento = calcularDiasVencimiento(
                  factura.fecha_vencimiento
                );
                const puedeEditar = canEditOrDeleteFactura(factura);

                return (
                  <tr
                    key={factura.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    onClick={() => handleRowClick(factura)}
                  >
                    <td className="py-2 px-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {clienteInfo.cliente}
                        </div>
                       
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div>
                        <div className="font-medium text-gray-900">
                           {factura.numero_factura}
                        </div>
                      
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <div className="space-y-0.5">
                        <div className="text-gray-900">
                          F. Emision:{" "}
                          {factura.fecha_emision
                            ? formatDate(factura.fecha_emision)
                            : "-"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          F. Vencimiento:{" "}
                          {factura.fecha_vencimiento
                            ? formatDate(factura.fecha_vencimiento)
                            : "-"}
                        </div>
                      </div>
                    </td>

                     <td className="py-2 px-3">
                      <div>
                        <div className="font-bold text-gray-900">
                          {formatCurrency(
                            factura.monto_total || 0,
                            factura.moneda
                          )}
                        </div>
                        <div
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 ${getMonedaColor(
                            factura.moneda
                          )}`}
                        >
                          {factura.moneda}
                        </div>
                      </div>
                    </td>

                    {/* <td className="py-2 px-3">
                      <div className="font-medium text-gray-900">
                        {clienteInfo.fechaServicio}
                      </div>
                    </td> */}

                    

                    <td className="py-2 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getEstadoColor(
                            factura.estado
                          )}`}
                        >
                          {factura.estado}
                        </span>
                        {diasVencimiento !== null &&
                          factura.estado === "Emitida" && (
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${getDiasVencimientoColor(
                                diasVencimiento
                              )}`}
                            >
                              {diasVencimiento < 0
                                ? `Vencida`
                                : `Vence en ${diasVencimiento}d`}
                            </span>
                          )}
                      </div>
                    </td>

                                       <td className="py-2 px-3">
                      <div className="flex items-center">
                        <Truck className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {factura.fletes?.length || 0}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      className="py-2 px-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => handleViewDetails(factura)}
                          variant="ghost"
                          size="medium"
                          icon={Eye}
                          title="Ver detalles"
                        >Detalles</Button> 
                        {puedeEditar && (
                          <>
                            <Button
                              onClick={() => handleEdit(factura)}
                              variant="primary"
                              size="medium"
                              icon={Edit}
                              title="Editar">
                                Editar Factura
                              </Button>
                            <Button
                              onClick={() => handleDeleteFactura(factura.id)}
                              variant="danger"
                              size="medium"
                              icon={XCircle}
                              title="Eliminar">
                                Eliminar Factura
                              </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {facturas.length === 0 && !isLoading && (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No se encontraron facturas
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {searchTerm ||
              Object.values(filters).some((f) => f !== "" && f !== null)
                ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                : `No hay facturas en estado ${
                    activeTab === "borradores"
                      ? "Borrador"
                      : "Emitida"
                  }`}
            </p>
            <div className="flex justify-center space-x-2">
              <Button onClick={clearFilters} size="small">
                Limpiar búsqueda
              </Button>
            </div>
          </div>
        )}

        {isLoading && facturas.length === 0 && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Cargando facturas...</p>
          </div>
        )}
      </div>

{facturas.length > 0 && (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div className="text-xs text-gray-700 mb-3 sm:mb-0 flex items-center gap-2">
      Mostrando{" "}
      <span className="font-medium">
        {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
      </span>{" "}
      a{" "}
      <span className="font-medium">
        {Math.min(currentPage * pageSize, totalItems)}
      </span>{" "}
      de <span className="font-medium">{totalItems}</span> resultados
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          setCurrentPage(1);
        }}
        className="ml-2 border border-gray-300 rounded text-xs p-1"
      >
        <option value={10}>10 por página</option>
        <option value={20}>20 por página</option>
        <option value={50}>50 por página</option>
      </select>
    </div>
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={pageSize}
      onPageChange={setCurrentPage}
      size="small"
    />
  </div>
)}


      <Modal
        isOpen={modalState.show}
        onClose={() => setModalState({ show: false, mode: "edit", data: null })}
        title="Editar Factura"
        size="large"
      >
        <FacturaForm
          initialData={modalState.data}
          onSubmit={handleEditSubmit}
          onCancel={() =>
            setModalState({ show: false, mode: "edit", data: null })
          }
          mode="edit"
          isLoading={isSaving}
          error={error}
          successMessage={successMessage}
        />
      </Modal>

      <Modal
        isOpen={detailModal.show}
        onClose={() => setDetailModal({ show: false, data: null })}
        title="Detalles de Factura"
        size="large"
      >
        {detailModal.data && renderFacturaDetails(detailModal.data)}
      </Modal>

      <Modal
        isOpen={pagoModal.show}
        onClose={() =>
          setPagoModal({
            show: false,
            facturaId: null,
            fechaPago: new Date().toISOString().split("T")[0],
          })
        }
        title="Confirmar Pago de Factura"
        size="small"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-blue-700">
                  Estás por marcar esta factura como pagada. Por favor, confirma
                  la fecha de pago.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Pago
            </label>
            <input
              type="date"
              value={pagoModal.fechaPago}
              onChange={(e) =>
                setPagoModal((prev) => ({ ...prev, fechaPago: e.target.value }))
              }
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Selecciona la fecha en que se realizó el pago
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button
              onClick={() =>
                setPagoModal({
                  show: false,
                  facturaId: null,
                  fechaPago: new Date().toISOString().split("T")[0],
                })
              }
              variant="secondary"
              size="small"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleMarkAsPaid(pagoModal.facturaId)}
              variant="success"
              size="small"
              icon={CheckCircle}
            >
              Confirmar Pago
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={servicioModal.show}
        onClose={() =>
          setServicioModal({ show: false, data: null, loading: false })
        }
        title="Detalles del Servicio"
        size="large"
      >
        {servicioModal.loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">
              Cargando detalles del servicio...
            </p>
          </div>
        ) : (
          servicioModal.data && renderServicioDetails(servicioModal.data)
        )}
      </Modal>
    </div>
  );
};

export default Facturacion;