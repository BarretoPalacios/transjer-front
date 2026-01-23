import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DollarSign,
  Search,
  RefreshCw,
  Filter,
  FileText,
  Eye,
  Edit,
  Check,
  X,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  Truck,
  MapPin,
  Package,
  Building,
  CreditCard,
  FileDigit,
  Tag,
  Info,
  XCircle,
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
  calcularDiasFaltantes,
  getFechaStatusClass,
} from "../../../utils/facturacionUtils";

const SeguimientoFacturas = () => {
  const [gestiones, setGestiones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  
  // Estado para controlar qué fila está en modo edición
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // Estado para modal de detalles
  const [modalDetails, setModalDetails] = useState({
    show: false,
    gestion: null,
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

  // Estados para filtros - AÑADIR nombre_cliente
  const [filters, setFilters] = useState({
    estado_pago_neto: "",
    prioridad: "",
    nombre_cliente: "", // NUEVO CAMPO
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const itemsPerPageOptions = [10, 20, 30, 50];
  const isInitialMount = useRef(true);

  // Función principal para cargar gestiones
  const fetchGestiones = useCallback(
    async (page = 1, itemsPerPage = pagination.itemsPerPage) => {
      setIsLoading(true);
      setError(null);
      try {
        // Preparar filtros para API
        const filtersForAPI = {};

        // Solo enviar filtros aplicados que tengan valor
        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (value !== "" && value !== undefined && value !== null) {
            filtersForAPI[key] = value;
          }
        });

        // Si hay búsqueda aplicada, agregar filtro de código de factura
        if (appliedSearch) {
          filtersForAPI.codigo_factura = appliedSearch;
        }

        const response = await facturacionGestionAPI.getAllGestiones(filtersForAPI, {
          page: page,
          pageSize: itemsPerPage,
        });
        console.log("data:" , response)
        setGestiones(response.items);

        // Actualizar paginación
        setPagination({ 
          currentPage: response.pagination.page,
          itemsPerPage: response.pagination.pageSize,
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
      }
    },
    [appliedFilters, appliedSearch, pagination.itemsPerPage]
  );

  // Calcular estadísticas
const calcularEstadisticas = useCallback(async () => {
  try {
    const stats = await facturacionGestionAPI.getEstadisticasDashboard();
    
    // Guardar todas las estadísticas del backend
    setEstadisticas({
      // Mantener las propiedades originales si se usan en otras partes
      ...stats,
      neto_cobrado: parseFloat(stats.montos_totales?.pagado || 0),
      neto_pendiente: parseFloat(stats.montos_totales?.pendiente || 0),
      detracciones_pendientes: parseFloat(stats.montos_totales?.detraccion || 0) *
        ((stats.por_estado_detraccion?.Pendiente || 0) / 
         (stats.por_estado_detraccion?.Pagado || 1 + stats.por_estado_detraccion?.Pendiente || 1)),
      detracciones_pagadas: parseFloat(stats.montos_totales?.detraccion || 0) *
        ((stats.por_estado_detraccion?.Pagado || 0) / 
         (stats.por_estado_detraccion?.Pagado || 1 + stats.por_estado_detraccion?.Pendiente || 1)),
      por_vencer: stats.vencidas || 0,
      saldo_total: parseFloat(stats.montos_totales?.pendiente || 0),
    });
  } catch (err) {
    console.error("Error al cargar estadísticas del dashboard:", err);
    // Valores por defecto si hay error
    setEstadisticas({
      montos_totales: {
        neto: "0.00",
        pagado: "0.00",
        detraccion: "0.00",
        pendiente: "0.00"
      },
      neto_cobrado: 0,
      neto_pendiente: 0,
      detracciones_pendientes: 0,
      detracciones_pagadas: 0,
      por_vencer: 0,
      saldo_total: 0,
    });
  }
}, []);

  const [estadisticas, setEstadisticas] = useState({
  // Propiedades principales del backend
  total_gestiones: 0,
  vencidas: 0,
  por_estado_pago: {},
  por_estado_detraccion: {},
  por_prioridad: {},
  montos_totales: {
    neto: "0.00",
    pagado: "0.00",
    detraccion: "0.00",
    pendiente: "0.00"
  },
  // Propiedades calculadas para compatibilidad
  neto_cobrado: 0,
  neto_pendiente: 0,
  detracciones_pendientes: 0,
  detracciones_pagadas: 0,
  por_vencer: 0,
  saldo_total: 0,
});  

  useEffect(() => {
    if (!isInitialMount.current) {
      fetchGestiones(1, pagination.itemsPerPage);
    }
  }, [appliedFilters, appliedSearch, fetchGestiones, pagination.itemsPerPage]);

  useEffect(() => {
    if (isInitialMount.current) {
      fetchGestiones(1, pagination.itemsPerPage);
      isInitialMount.current = false;
    }
  }, [fetchGestiones, pagination.itemsPerPage]);

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

  // Handler para iniciar edición
  const handleStartEdit = useCallback((gestion) => {
    setEditingRowId(gestion.id);
    setEditFormData({
      estado_detraccion: gestion.estado_detraccion || 'Pendiente',
      tasa_detraccion: gestion.tasa_detraccion || '4.0',
      monto_detraccion: gestion.monto_detraccion || '',
      nro_constancia_detraccion: gestion.nro_constancia_detraccion || '',
      fecha_pago_detraccion: gestion.fecha_pago_detraccion || '',
      estado_pago_neto: gestion.estado_pago_neto || 'Pendiente',
      monto_pagado_acumulado: gestion.monto_pagado_acumulado || '',
      banco_destino: gestion.banco_destino || '',
      cuenta_bancaria_destino: gestion.cuenta_bancaria_destino || '',
      nro_operacion_pago_neto: gestion.nro_operacion_pago_neto || '',
      fecha_probable_pago: gestion.fecha_probable_pago || '',
      prioridad: gestion.prioridad || 'Media',
    });
  }, []);

  // Handler para cancelar edición
  const handleCancelEdit = useCallback(() => {
    setEditingRowId(null);
    setEditFormData({});
  }, []);

  // Handler para cambios en el formulario de edición
  const handleEditChange = useCallback((field, value) => {
    setEditFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Si estado de detracción cambia a Pagado, mostrar fecha de pago
      // Si cambia a Pendiente, limpiar fecha de pago
      if (field === 'estado_detraccion') {
        if (value === 'Pagado') {
          // Si no hay fecha, poner fecha actual
          if (!prev.fecha_pago_detraccion) {
            const today = new Date().toISOString().split('T')[0];
            newData.fecha_pago_detraccion = today;
          }
        } else if (value === 'Pendiente') {
          // Limpiar fecha de pago si vuelve a pendiente
          newData.fecha_pago_detraccion = '';
        }
      }
      
      // Si estado de pago neto cambia a Pagado, ajustar monto pagado
      if (field === 'estado_pago_neto' && value === 'Pagado') {
        const montoNeto = parseFloat(gestiones.find(g => g.id === editingRowId)?.monto_neto) || 0;
        newData.monto_pagado_acumulado = montoNeto.toFixed(2);
      }
      
      return newData;
    });
  }, [editingRowId, gestiones]);

  // Handler para guardar cambios
  const handleSaveEdit = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Preparar datos para enviar
      const dataToSubmit = {};
      
      // Solo incluir campos que tienen valor
      Object.entries(editFormData).forEach(([key, value]) => {
        // Para campos numéricos, convertir a número
        if (['tasa_detraccion', 'monto_detraccion', 'monto_pagado_acumulado'].includes(key)) {
          // NO permitir modificar tasa o monto de detracción
          if (key === 'tasa_detraccion' || key === 'monto_detraccion') {
            // No enviar estos campos, mantienen su valor original
            return;
          }
          const numValue = parseFloat(value) || 0;
          dataToSubmit[key] = numValue;
        }
        // Para otros campos
        else if (value !== '' && value !== undefined && value !== null) {
          dataToSubmit[key] = value;
        }
      });

      // Reglas específicas
      if (editFormData.estado_detraccion !== 'Pagado') {
        delete dataToSubmit.nro_constancia_detraccion;
        delete dataToSubmit.fecha_pago_detraccion;
      }

      if (editFormData.estado_pago_neto !== 'Pagado Parcial') {
        delete dataToSubmit.monto_pagado_acumulado;
      }

      await facturacionGestionAPI.updateGestion(editingRowId, dataToSubmit);
      
      setEditingRowId(null);
      setEditFormData({});
      
      // Actualizar la tabla
      await fetchGestiones(pagination.currentPage, pagination.itemsPerPage);
      
      setSuccessMessage("Gestión actualizada correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Error al guardar los cambios: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [editingRowId, editFormData, fetchGestiones, pagination.currentPage, pagination.itemsPerPage]);

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

      const blob = await facturacionGestionAPI.exportAllGestionesExcel(filtersForAPI);
      facturacionGestionAPI.downloadExcel(
        blob,
        `gestion_facturacion_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err) {
      setError("Error al exportar: " + err.message);
    }
  }, [appliedFilters, appliedSearch]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      estado_pago_neto: "",
      prioridad: "",
      nombre_cliente: "", // LIMPIAR NUEVO CAMPO
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchTerm("");
    setAppliedSearch("");
  }, []);

  const aplicarFiltros = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const handleSearch = useCallback(() => {
    setAppliedSearch(searchTerm);
  }, [searchTerm]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchGestiones(newPage, pagination.itemsPerPage);
    },
    [fetchGestiones, pagination.itemsPerPage]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchGestiones(1, newItemsPerPage);
    },
    [fetchGestiones]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Función para formatear fecha para input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

const formatDate = (dateString) => {
  if (!dateString) return 'No especificada';
  try {
    const fecha = new Date(dateString);
    
    if (dateString.includes('-') && !dateString.includes('T')) {
      fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    }

    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

  // Función para renderizar detalles de gestión
  const renderDetallesGestion = (gestion) => {
    if (!gestion) return null;

    const datos = gestion.datos_completos || {};
    const fletes = datos.fletes || [];
    const montoTotal = parseFloat(gestion.monto_neto) + parseFloat(gestion.monto_detraccion);

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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoPagoColor(gestion.estado_pago_neto)}`}>
                {gestion.estado_pago_neto}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadColor(gestion.prioridad)}`}>
                {gestion.prioridad}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 1: Información de la Factura */}
        <div className="border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <FileDigit className="h-4 w-4 mr-2" />
            Información de Factura
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Número de Factura</p>
              <p className="text-sm text-gray-900">{datos.numero_factura || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Fecha Emisión</p>
              <p className="text-sm text-gray-900">{formatDate(datos.fecha_emision)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Fecha Vencimiento</p>
              <p className="text-sm text-gray-900">{formatDate(datos.fecha_vencimiento)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Monto Total Factura</p>
              <p className="text-sm font-semibold text-gray-900">
                S/ {parseFloat(datos.monto_total || 0).toFixed(2)}
              </p>
            </div>
                        <div>
              <p className="text-xs font-medium text-gray-500">Fecha De Pago</p>
              <p className="text-sm text-gray-900">{formatDate(gestion.fecha_probable_pago)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Banco Destino</p>
              <p className="text-sm text-gray-900">{gestion.banco_destino || "No especificado"}</p>
            </div>
          </div>
        </div>

        {/* Sección 2: Montos y Estados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Montos
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monto Total (Monto a Pagar + Detracción)</span>
                <span className="text-sm font-semibold">S/ {montoTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monto por Pagar</span>
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
                <span className="text-sm text-gray-600">Pagado hasta Ahora</span>
                <span className="text-sm font-semibold text-blue-600">
                  S/ {parseFloat(gestion.monto_pagado_acumulado || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium text-gray-900">Saldo Pendiente</span>
                <span className="text-sm font-bold text-orange-600">
                  S/ {parseFloat(gestion.saldo_pendiente || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Estados y Detracción
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500">Estado Pago Neto</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoPagoColor(gestion.estado_pago_neto)}`}>
                  {gestion.estado_pago_neto}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Estado Detracción</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoDetraccionColor(gestion.estado_detraccion)}`}>
                  {gestion.estado_detraccion}
                </span>
                {gestion.nro_constancia_detraccion && (
                  <p className="text-xs text-gray-600 mt-1">
                    Constancia: {gestion.nro_constancia_detraccion}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Tasa Detracción</p>
                <p className="text-sm text-gray-900">{gestion.tasa_detraccion || "0"}%</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Fecha Pago Detracción</p>
                <p className="text-sm text-gray-900">{formatDate(gestion.fecha_pago_detraccion)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Información de Gestión */}
        {/* <div className="border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Gestión y Programación
          </h4> */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}

            {/* <div>
              <p className="text-xs font-medium text-gray-500">Prioridad</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPrioridadColor(gestion.prioridad)}`}>
                {gestion.prioridad}
              </span>
            </div> */}
            {/* <div>
              <p className="text-xs font-medium text-gray-500">Centro de Costo</p>
              <p className="text-sm text-gray-900">{gestion.centro_costo || "No especificado"}</p>
            </div> */}
            {/* <div>
              <p className="text-xs font-medium text-gray-500">Responsable</p>
              <p className="text-sm text-gray-900">{gestion.responsable_gestion || "No asignado"}</p>
            </div> */}
            
            {/* <div>
              <p className="text-xs font-medium text-gray-500">N° Operación</p>
              <p className="text-sm text-gray-900">{gestion.nro_operacion_pago_neto || "No registrado"}</p>
            </div> */}
          {/* </div> */}
          {/* {gestion.observaciones_admin && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500">Observaciones</p>
              <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                {gestion.observaciones_admin}
              </p>
            </div>
          )} */}
        {/* </div> */}

        {/* Sección 4: Información de Entidades */}
        {fletes.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Información de Entidades
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Cliente</p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.nombre_cliente || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Cuenta</p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.nombre_cuenta || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Proveedor</p>
                <p className="text-sm text-gray-900">
                  {fletes[0]?.servicio?.nombre_proveedor || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sección 5: Servicios y Fletes */}
        {fletes.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Servicios y Fletes ({fletes.length})
            </h4>
            <div className="space-y-4">
              {fletes.map((flete, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Flete: {flete.codigo_flete}
                      </p>
                      <p className="text-xs text-gray-600">
                        Monto: S/ {parseFloat(flete.monto_flete || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {flete.servicio && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Servicio</p>
                        <p className="text-sm text-gray-900">{flete.servicio.codigo_servicio}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Placa</p>
                        <p className="text-sm text-gray-900">{flete.servicio.placa_flota}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Conductor</p>
                        <p className="text-sm text-gray-900">{flete.servicio.nombre_conductor}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Auxiliar</p>
                        <p className="text-sm text-gray-900">{flete.servicio.nombre_auxiliar}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Tipo Servicio</p>
                        <p className="text-sm text-gray-900">{flete.servicio.tipo_servicio}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Modalidad</p>
                        <p className="text-sm text-gray-900">{flete.servicio.modalidad}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Zona</p>
                        <p className="text-sm text-gray-900">{flete.servicio.zona}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Fecha Servicio</p>
                        <p className="text-sm text-gray-900">{formatDate(flete.servicio.fecha_servicio)}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-gray-500">Origen / Destino</p>
                        <p className="text-sm text-gray-900">
                          Origen: {flete.servicio.origen} <br />
                          Destino {flete.servicio.destino}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">GIA RR</p>
                        <p className="text-sm text-gray-900">{flete.servicio.gia_rr || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">GIA RT</p>
                        <p className="text-sm text-gray-900">{flete.servicio.gia_rt || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Metraje (m³)</p>
                        <p className="text-sm text-gray-900">{flete.servicio.m3}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Toneladas (TN)</p>
                        <p className="text-sm text-gray-900">{flete.servicio.tn}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección 6: Resumen de Valores */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Resumen Financiero</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500">Total Factura</p>
              <p className="text-lg font-bold text-gray-900">
                S/ {parseFloat(datos.monto_total || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500">Monto por Pagar</p>
              <p className="text-lg font-bold text-green-600">
                S/ {parseFloat(gestion.monto_neto || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500">Detracción</p>
              <p className="text-lg font-bold text-red-600">
                S/ {parseFloat(gestion.monto_detraccion || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500">Saldo Pendiente</p>
              <p className="text-lg font-bold text-orange-600">
                S/ {parseFloat(gestion.saldo_pendiente || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && gestiones.length === 0) {
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
    <div className="p-2">
      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700 text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}


{/* PANEL DE MONTOS TOTALES - DATOS DIRECTOS DEL BACKEND */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
  {/* Neto Total */}
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">Total Facturado</p>
        <p className="text-lg font-semibold text-gray-900">
          S/ {estadisticas.montos_totales?.neto || "0.00"}
        </p>
      </div>
      <DollarSign className="text-green-500 h-5 w-5" />
    </div>
    <p className="text-xs text-gray-400 mt-2">Monto total facturado</p>
  </div>

  {/* Pagado Total */}
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">Total Pagado</p>
        <p className="text-lg font-semibold text-gray-900">
          S/ {estadisticas.montos_totales?.pagado || "0.00"}
        </p>
      </div>
      <CheckCircle className="text-blue-500 h-5 w-5" />
    </div>
    <p className="text-xs text-gray-400 mt-2">Monto total ya pagado</p>
  </div>

  {/* Detracción Total */}
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">Detracción Total</p>
        <p className="text-lg font-semibold text-gray-900">
          S/ {estadisticas.montos_totales?.detraccion || "0.00"}
        </p>
      </div>
      <AlertTriangle className="text-yellow-500 h-5 w-5" />
    </div>
    <p className="text-xs text-gray-400 mt-2">Total de detracciones</p>
  </div>

  {/* Pendiente Total */}
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">Total Pendiente</p>
        <p className="text-lg font-semibold text-gray-900">
          S/ {estadisticas.montos_totales?.pendiente || "0.00"}
        </p>
      </div>
      <Clock className="text-orange-500 h-5 w-5" />
    </div>
    <p className="text-xs text-gray-400 mt-2">Monto total pendiente de pago</p>
  </div>
</div>

      {/* FILTROS SIMPLIFICADOS */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
  <div className="flex flex-wrap gap-2 items-center">
    
    {/* Buscador compacto */}
    <div className="flex items-center gap-1 min-w-[300px]">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Factura..."
          className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-xs"
        />
      </div>
      {/* NUEVO: Filtro por Nombre de Cliente */}
    <div className="w-60">
      <div className="relative">
        <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={filters.nombre_cliente}
          onChange={(e) => setFilters({ ...filters, nombre_cliente: e.target.value })}
          onKeyDown={(e) => {
    if (e.key === 'Enter') {
      aplicarFiltros();
    }
  }}
          placeholder="Cliente..."
          className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-xs h-8"
        />
      </div>
    </div>
      {/* <Button
        onClick={handleSearch}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-8"
      >
        Buscar
      </Button> */}
    </div>

    {/* Filtro por Estado */}
    <div className="w-40">
      <select
        value={filters.estado_pago_neto}
        onChange={(e) => setFilters({ ...filters, estado_pago_neto: e.target.value })}
        className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 h-8 outline-none"
      >
        <option value="">Estados</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Programado">Programado</option>
        <option value="Pagado Parcial">Pagado Parcial</option>
        <option value="Pagado">Pagado</option>
        <option value="Vencido">Vencido</option>
        <option value="En Disputa">En Disputa</option>
        <option value="Anulado">Anulado</option>
      </select>
    </div>

    {/* Filtro por Prioridad */}
    <div className="w-70 flex">
      <select
        value={filters.prioridad}
        onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
        className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 h-8 outline-none"
      >
        <option value="">Prioridades</option>
        <option value="Urgente">Urgente</option>
        <option value="Alta">Alta</option>
        <option value="Media">Media</option>
        <option value="Baja">Baja</option>
      </select>
      <Button
        onClick={aplicarFiltros}
        icon={Filter}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-8"
      >
        Filtrar
      </Button>
    </div>

    

    {/* Botones de acción agrupados */}
    <div className="flex gap-1 ml-auto">
      <Button
        onClick={aplicarFiltros}
        icon={Filter}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-8"
      >
        Filtrar
      </Button>
      <Button
        onClick={clearFilters}
        variant="secondary"
        className="px-2.5 py-1.5 text-xs h-8"
      >
        Limpiar Filtros
      </Button>
      <div className="h-8 w-[1px] bg-gray-200 mx-1" /> {/* Separador visual */}
      <Button
        onClick={() => fetchGestiones(pagination.currentPage, pagination.itemsPerPage)}
        variant="secondary"
        icon={RefreshCw}
        className="px-2 py-1.5 text-xs h-8"
        title="Actualizar"
      />
      <Button
        onClick={handleExport}
        variant="secondary"
        icon={Download}
        className="px-2 py-1.5 text-xs h-8"
        title="Exportar"
      />
    </div>
  </div>
</div>

      {/* TABLA CON EDICIÓN INLINE */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300">
                  Cliente
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300">
                  Numero Factura
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300">
                  Monto Total
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300 bg-red-50">
                  Detracción (4%)
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300 bg-green-50">
                  Monto Por Pagar
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300">
                  Estado de Pago
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300">
                  Estado Detracción
                </th>
                
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300">
                  Fecha Pago del MOnto
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-700 border-r border-gray-300">
                  Prioridad
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {gestiones.map((gestion) => {
                const montoTotal = parseFloat(gestion.monto_neto) + parseFloat(gestion.monto_detraccion);
                const montoNeto = parseFloat(gestion.monto_neto);
                const montoPagado = parseFloat(gestion.monto_pagado_acumulado);
                const saldoPendiente = parseFloat(gestion.saldo_pendiente);
                const montoDetraccion = parseFloat(gestion.monto_detraccion);

                const isEditing = editingRowId === gestion.id;
                const tieneDetraccion = parseFloat(gestion.monto_detraccion) > 0;

                return (
                  <tr
                    key={gestion.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}
                  >
                    {/* Cliente */}
                    <td className="py-3 px-4 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {gestion.datos_completos?.fletes?.[0]?.servicio?.nombre_cliente || "SIN CLIENTE"}
                      </div>
                      
                    </td>
                    {/* Factura */}
                    <td className="py-3 px-4 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {gestion.codigo_factura || "SIN CÓDIGO"}
                      </div>
                      <div className="text-xs text-gray-500">
                       Fecha Emision: {gestion.datos_completos?.fecha_emision || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                       Fecha Vencimiento: {gestion.datos_completos?.fecha_vencimiento || "-"}
                      </div>
                    </td>

                    {/* Monto Total */}
                    <td className="py-3 px-4 border-r border-gray-200">
                      <div className="font-medium">
                        S/ {montoTotal.toFixed(2)}
                      </div>
                    </td>
  
                    {/* Detracción - Solo lectura, no editable */}
                    <td className="py-3 px-4 border-r border-gray-200 bg-red-50">
                      <div className="font-medium text-gray-900">
                        S/ {montoDetraccion.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {gestion.nro_constancia_detraccion || "Sin constancia"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Tasa: {gestion.tasa_detraccion || "0"}%
                      </div>
                    </td>

                    {/* Neto a Cobrar */}
                    <td className="py-3 px-4 border-r border-gray-200 bg-green-50">
                      <div className="font-medium text-gray-900">
                        S/ {montoNeto.toFixed(2)}
                      </div>
                      <div className={`text-xs ${montoPagado > 0 ? "text-blue-600" : "text-gray-500"}`}>
                        Pagado: S/ {montoPagado.toFixed(2)}
                      </div>
                      <div className={`text-xs font-medium ${saldoPendiente > 0 ? "text-orange-600" : "text-green-600"}`}>
                        Saldo: S/ {saldoPendiente.toFixed(2)}
                      </div>
                    </td>

                    {/* Estado Neto */}
                    <td className="py-3 px-4 border-r border-gray-200">
                      {isEditing ? (
                        <select
                          value={editFormData.estado_pago_neto || 'Pendiente'}
                          onChange={(e) => handleEditChange('estado_pago_neto', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Programado">Programado</option>
                          <option value="Pagado Parcial">Pagado Parcial</option>
                          <option value="Pagado">Pagado</option>
                          <option value="Vencido">Vencido</option>
                          <option value="En Disputa">En Disputa</option>
                          <option value="Anulado">Anulado</option>
                        </select>
                      ) : (
                        <>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoPagoColor(gestion.estado_pago_neto)}`}>
                            {gestion.estado_pago_neto}
                          </span>
                          {gestion.estado_pago_neto === "Pagado Parcial" && (
                            <div className="text-xs text-blue-600 mt-1">
                              {((montoPagado / montoNeto) * 100).toFixed(0)}% completado
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    {/* Estado Detracción */}
                    <td className="py-3 px-4 border-r border-gray-200">
                      {isEditing ? (
                        <div className="space-y-2">
                          {/* Solo mostrar opción de estado si hay detracción */}
                          {tieneDetraccion ? (
                            <select
                              value={editFormData.estado_detraccion || 'Pendiente'}
                              onChange={(e) => handleEditChange('estado_detraccion', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="Pagado">Pagado</option>
                            </select>
                          ) : (
                            <div className="text-xs text-gray-500 py-1">
                              Sin detracción
                            </div>
                          )}
                          
                          {/* Mostrar fecha de pago solo si estado es Pagado */}
                          {(editFormData.estado_detraccion === 'Pagado' && tieneDetraccion) && (
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-700">
                                Fecha Pago
                              </label>
                              <input
                                type="date"
                                value={formatDateForInput(editFormData.fecha_pago_detraccion)}
                                onChange={(e) => handleEditChange('fecha_pago_detraccion', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          )}
                          
                          {/* Mostrar N° Constancia solo si estado es Pagado */}
                          {(editFormData.estado_detraccion === 'Pagado' && tieneDetraccion) && (
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-700">
                                N° Constancia
                              </label>
                              <input
                                type="text"
                                value={editFormData.nro_constancia_detraccion || ''}
                                onChange={(e) => handleEditChange('nro_constancia_detraccion', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Número"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <span className={`text-xs font-medium ${getEstadoDetraccionColor(gestion.estado_detraccion)}`}>
                            {gestion.estado_detraccion}
                          </span>
                          {gestion.estado_detraccion === "Pagado" && gestion.nro_constancia_detraccion && (
                            <div className="text-xs text-gray-500 mt-1">
                              {gestion.nro_constancia_detraccion}
                            </div>
                          )}
                          {gestion.estado_detraccion === "Pagado" && gestion.fecha_pago_detraccion && (
                            <div className="text-xs text-gray-500 mt-1">
                              F.Pago:{formatDate(gestion.fecha_pago_detraccion)}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    

                    {/* Programación */}
                    <td className="py-3 px-4 border-r border-gray-200">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Fecha Pago
                            </label>
                            <input
                              type="date"
                              value={formatDateForInput(editFormData.fecha_probable_pago)}
                              onChange={(e) => handleEditChange('fecha_probable_pago', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          
                          {/* Campos bancarios para estados Programado, Pagado Parcial o Pagado */}
                          {['Programado', 'Pagado Parcial', 'Pagado'].includes(editFormData.estado_pago_neto) && (
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-700">
                                Banco
                              </label>
                              <input
                                type="text"
                                value={editFormData.banco_destino || ''}
                                onChange={(e) => handleEditChange('banco_destino', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Banco destino"
                              />
                            </div>
                          )}
                          
                          {/* Campo para monto pagado parcial */}
                          {editFormData.estado_pago_neto === 'Pagado Parcial' && (
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-700">
                                Monto Pagado
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={editFormData.monto_pagado_acumulado || ''}
                                onChange={(e) => handleEditChange('monto_pagado_acumulado', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0.00"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-gray-700">
                            {gestion.fecha_probable_pago || "Sin fecha"}
                          </div>
                          {gestion.fecha_probable_pago && (
                            <div className={`text-xs ${getFechaStatusClass(gestion.fecha_probable_pago)}`}>
                              {calcularDiasFaltantes(gestion.fecha_probable_pago)}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                  {/* Prioridad */}
                    <td className="py-3 px-4 border-r border-gray-200">
                      {isEditing ? (
                        <select
                          value={editFormData.prioridad || 'Media'}
                          onChange={(e) => handleEditChange('prioridad', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="Baja">Baja</option>
                          <option value="Media">Media</option>
                          <option value="Alta">Alta</option>
                          <option value="Urgente">Urgente</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPrioridadColor(gestion.prioridad)}`}>
                          {gestion.prioridad}
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(gestion)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={isLoading}
                              className="p-1 hover:bg-green-50 rounded text-green-600"
                              title="Guardar"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isLoading}
                              className="p-1 hover:bg-red-50 rounded text-red-600"
                              title="Cancelar"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          gestion.estado_pago_neto !== 'Anulado' && (
        <button
          onClick={() => handleStartEdit(gestion)}
          className="p-1 hover:bg-gray-100 rounded"
          title="Editar"
        >
          <Edit className="h-4 w-4 text-gray-500" />
        </button>
      )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {gestiones.length > 0 && (
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
            startIndex={(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            endIndex={Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}
          />
        </div>
      )}

      {/* Sin resultados */}
      {gestiones.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron gestiones
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            {Object.values(appliedFilters).some((f) => f !== "") || appliedSearch
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay gestiones de facturación registradas"}
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={clearFilters} className="text-sm">
              Limpiar búsqueda
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      <Modal
        isOpen={modalDetails.show}
        onClose={handleCloseModal}
        title={`Detalles de Factura: ${modalDetails.gestion?.codigo_factura || ''}`}
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
            className="px-4 py-2"
          >
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(SeguimientoFacturas);