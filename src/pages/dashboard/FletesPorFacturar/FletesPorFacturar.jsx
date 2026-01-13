import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  RefreshCw,
  Filter,
  Download,
  Eye,
  X,
  CheckCircle,
  Calendar,
  FileText,
  User,
  DollarSign,
  Hash,
  CheckSquare,
  Square,
  FilePlus,
  Edit,
  Save,
  XCircle,
  Info,
  AlertCircle,
  CalendarDays,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { fletesAPI } from "../../../api/endpoints/fletes";
import { facturasAPI } from "../../../api/endpoints/facturas";
import { serviciosPrincipalesAPI } from "../../../api/endpoints/servicioPrincipal";

const FletesPorFacturar = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [fletes, setFletes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 15,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    codigo_flete: "",
  });
  
  // Estados para modales y selección
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [fleteSeleccionado, setFleteSeleccionado] = useState(null);
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [selectedFletes, setSelectedFletes] = useState([]);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [editingFlete, setEditingFlete] = useState(null);
  const [editForm, setEditForm] = useState({
    monto_flete: "",
    observaciones: "",
  });
  const [servicioDetalle, setServicioDetalle] = useState(null);
  const [loadingServicio, setLoadingServicio] = useState(false);
  const [modalMode, setModalMode] = useState("flete");
  
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Estado para el formulario de factura
  const [facturaForm, setFacturaForm] = useState({
    numero_factura: "",
    fecha_emision: "",
    fecha_vencimiento: "",
    monto_total: "",
    moneda: "PEN",
    descripcion: "",
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  const itemsPerPageOptions = [10, 15, 20, 30, 50];
  const isInitialMount = useRef(true);

  // Función principal para cargar fletes
  const fetchFletes = useCallback(
    async (page = 1, itemsPerPage = pagination.itemsPerPage, filtersToUse = filters) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      try {
        // Preparar filtros para API
        const filtersForAPI = {};
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value && value.trim() !== "") {
            filtersForAPI[key] = value.trim();
          }
        });
        
        // Añadir filtros fijos
        filtersForAPI.estado_flete = "VALORIZADO";
        filtersForAPI.pertenece_a_factura = false;
        filtersForAPI.page = page;
        filtersForAPI.page_size = itemsPerPage;
        
        console.log('Fetching fletes with params:', filtersForAPI); // Para debug
        
        // Usar la API
        const response = await fletesAPI.getAllFletes(filtersForAPI);
        console.log('API Response:', response); // Para debug
        
        // Procesar respuesta
        if (response && response.items) {
          setFletes(response.items);
          
          // Actualizar paginación
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.total || 0,
            totalPages: response.total_pages || 1,
            hasNext: response.has_next || false,
            hasPrev: response.has_prev || false,
          });
        } else if (response && Array.isArray(response)) {
          // Si la respuesta es un array directo
          setFletes(response);
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.length || 0,
            totalPages: Math.ceil((response.length || 0) / itemsPerPage),
            hasNext: (response.length || 0) >= itemsPerPage,
            hasPrev: page > 1,
          });
        } else {
          setFletes([]);
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          });
        }
        
      } catch (err) {
        setError("Error al cargar los fletes: " + (err.message || "Error desconocido"));
        console.error("Error fetching fletes:", err);
        setFletes([]);
        setPagination({
          currentPage: page,
          itemsPerPage: itemsPerPage,
          totalItems: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [] // No dependencias para mantener referencia estable
  );

  // Efecto para búsqueda en tiempo real con debounce
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Crear nuevo timeout
    const timeout = setTimeout(() => {
      // Resetear a página 1 cuando cambian los filtros
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      // Llamar a fetchFletes con página 1
      fetchFletes(1, pagination.itemsPerPage, filters);
    }, 300); // 300ms de debounce

    setSearchTimeout(timeout);

    // Limpiar timeout al desmontar
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters]); // Solo se ejecuta cuando cambian los filtros

  // Efecto para cargar cuando cambia la página o itemsPerPage
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
    }
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialMount.current) {
      fetchFletes(1, pagination.itemsPerPage, filters);
      isInitialMount.current = false;
    }
  }, []);

  // Efecto para inicializar el formulario cuando se abre el modal de factura
  useEffect(() => {
    if (showFacturaModal && selectedFletes.length > 0) {
      // Calcular monto total
      const montoTotal = selectedFletes.reduce((total, id) => {
        const flete = fletes.find((f) => f.id === id);
        return total + (flete ? parseFloat(flete.monto_flete || 0) : 0);
      }, 0);

      // Generar secuencia para número de factura
      const fecha = new Date();
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const numeroSugerido = `F-${year}${month}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      // Configurar fechas
      // 1. Función auxiliar para obtener YYYY-MM-DD en formato local
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 2. Lógica de fechas
const fechaBase = new Date(); // Fecha actual local
const fechaEmision = formatLocalDate(fechaBase);

// Creamos una copia para el vencimiento y sumamos un mes
const fechaVenc = new Date(fechaBase);
fechaVenc.setMonth(fechaVenc.getMonth() + 1);
const fechaVencimiento = formatLocalDate(fechaVenc);

// 3. Actualización del formulario
setFacturaForm({
  numero_factura: numeroSugerido,
  fecha_emision: fechaEmision,
  fecha_vencimiento: fechaVencimiento,
  monto_total: montoTotal.toFixed(2),
  moneda: "PEN",
  descripcion: selectedFletes.length === 1 
    ? `Factura por flete: ${fletes.find(f => f.id === selectedFletes[0])?.codigo_flete || ""}`
    : `Factura por ${selectedFletes.length} fletes`,
});
    }
  }, [showFacturaModal, selectedFletes, fletes]);

  // Función para cargar detalles del servicio
  const fetchServicioDetalle = useCallback(
    async (servicioId) => {
      setLoadingServicio(true);
      setError(null);

      try {
        const response = await serviciosPrincipalesAPI.getServicioPrincipalById(
          servicioId
        );
        setServicioDetalle(response);
      } catch (err) {
        setServicioDetalle({
          codigo_servicio_principal:
            fleteSeleccionado?.codigo_servicio || "N/A",
          fecha_servicio: "Fecha no disponible",
          estado: "Estado no disponible",
          cliente: {
            nombre: "Cliente no disponible",
            ruc: "No disponible",
          },
          origen: "Origen no disponible",
          destino: "Destino no disponible",
          tipo_servicio: "Tipo no disponible",
          modalidad_servicio: "Modalidad no disponible",
          flota: { placa: "Placa no disponible" },
          gia_rr: "No disponible",
          gia_rt: "No disponible",
          descripcion: "Sin descripción disponible",
        });
      } finally {
        setLoadingServicio(false);
      }
    },
    [fleteSeleccionado]
  );

  const handleViewServicioFromFlete = useCallback(async () => {
    if (!fleteSeleccionado?.servicio_id) {
      setError("No hay información del servicio asociado");
      return;
    }

    await fetchServicioDetalle(fleteSeleccionado.servicio_id);
    setModalMode("servicio");
  }, [fleteSeleccionado, fetchServicioDetalle]);

  const handleBackToFlete = useCallback(() => {
    setModalMode("flete");
  }, []);

  // Handlers
  const handleView = useCallback((flete) => {
    setFleteSeleccionado(flete);
    setModalMode("flete");
    setShowDetalleModal(true);
  }, []);

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      codigo_flete: ""
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]);

  // Función para manejar clic en fila
  const handleRowClick = useCallback((flete) => {
    setFleteSeleccionado(flete);
    setModalMode("flete");
    setShowDetalleModal(true);
  }, []);

  // Manejar selección individual
  const handleSelectFlete = useCallback(
    (id, e) => {
      e.stopPropagation();
      if (selectedFletes.includes(id)) {
        setSelectedFletes(selectedFletes.filter((fleteId) => fleteId !== id));
      } else {
        setSelectedFletes([...selectedFletes, id]);
      }
    },
    [selectedFletes]
  );

  // Manejar selección todos
  const handleSelectAll = useCallback(() => {
    if (selectedFletes.length === fletes.length) {
      setSelectedFletes([]);
    } else {
      setSelectedFletes(fletes.map((flete) => flete.id));
    }
  }, [selectedFletes, fletes]);

  // Abrir modal de factura
  const handleCreateInvoice = useCallback(() => {
    if (selectedFletes.length === 0) {
      setError("Por favor seleccione al menos un flete");
      return;
    }
    setShowFacturaModal(true);
  }, [selectedFletes]);

  // Cerrar modal de factura
  const handleCloseFacturaModal = useCallback(() => {
    setShowFacturaModal(false);
    setFacturaForm({
      numero_factura: "",
      fecha_emision: "",
      fecha_vencimiento: "",
      monto_total: "",
      moneda: "PEN",
      descripcion: "",
    });
    setFormErrors({});
  }, []);

  // Cerrar modal de detalle
  const handleCloseDetalleModal = useCallback(() => {
    setShowDetalleModal(false);
    setModalMode("flete");
    setServicioDetalle(null);
    setFleteSeleccionado(null);
  }, []);

  // Handler para cambios en el formulario de factura
  const handleFacturaFormChange = useCallback((field, value) => {
    setFacturaForm(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  // Validar formulario de factura
  const validateFacturaForm = () => {
    const errors = {};

    if (!facturaForm.numero_factura.trim()) {
      errors.numero_factura = 'El número de factura es requerido';
    }

    if (!facturaForm.fecha_emision) {
      errors.fecha_emision = 'La fecha de emisión es requerida';
    }

    if (!facturaForm.fecha_vencimiento) {
      errors.fecha_vencimiento = 'La fecha de vencimiento es requerida';
    }

    const montoNum = parseFloat(facturaForm.monto_total || 0);
    if (!facturaForm.monto_total || montoNum <= 0) {
      errors.monto_total = 'El monto total debe ser mayor a 0';
    }

    // Validar que fecha de vencimiento sea mayor o igual a fecha de emisión
    if (facturaForm.fecha_emision && facturaForm.fecha_vencimiento) {
      const emision = new Date(facturaForm.fecha_emision);
      const vencimiento = new Date(facturaForm.fecha_vencimiento);
      
      if (vencimiento < emision) {
        errors.fecha_vencimiento = 'La fecha de vencimiento no puede ser anterior a la fecha de emisión';
      }
    }

    return errors;
  };

  // Handler para crear factura
  const handleCreateFactura = useCallback(async () => {
    const errors = validateFacturaForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsCreatingInvoice(true);
    setError(null);

    try {
      // Preparar datos de factura
      const facturaData = {
        numero_factura: facturaForm.numero_factura,
        fletes: selectedFletes.map((id) => ({ id })),
        fecha_emision: facturaForm.fecha_emision,
        fecha_vencimiento: facturaForm.fecha_vencimiento,
        estado: "Pendiente",
        monto_total: parseFloat(facturaForm.monto_total),
        moneda: facturaForm.moneda,
        descripcion: facturaForm.descripcion,
        es_borrador: false, // Siempre será emitida
      };

      // Crear factura
      await facturasAPI.createFactura(facturaData);

      setSuccessMessage(
        `Factura ${facturaForm.numero_factura} creada exitosamente para ${selectedFletes.length} flete(s)`
      );
      
      handleCloseFacturaModal();
      setSelectedFletes([]);
      fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters); // Refrescar lista
    } catch (err) {
      setError("Error al crear la factura: " + err.message);
    } finally {
      setIsCreatingInvoice(false);
    }
  }, [facturaForm, selectedFletes, fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters, handleCloseFacturaModal]);

  // Editar flete
  const handleEdit = useCallback((flete, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingFlete(flete.id);
    setEditForm({
      monto_flete: flete.monto_flete?.toString() || "",
      observaciones: flete.observaciones || "",
    });
  }, []);

  const handleSaveEdit = useCallback(
    async (fleteId) => {
      setIsLoading(true);
      setError(null);

      try {
        const updateData = {
          monto_flete: parseFloat(editForm.monto_flete) || 0,
          observaciones: editForm.observaciones,
        };

        if (updateData.monto_flete < 0) {
          throw new Error("El monto no puede ser negativo");
        }

        await fletesAPI.updateFlete(fleteId, updateData);

        setSuccessMessage("Flete actualizado exitosamente");
        setEditingFlete(null);
        fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
      } catch (err) {
        setError("Error al actualizar el flete: " + err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [editForm, fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingFlete(null);
    setEditForm({
      monto_flete: "",
      observaciones: "",
    });
  }, []);

  // Funciones de paginación
  const handlePageChange = useCallback(
    (newPage) => {
      fetchFletes(newPage, pagination.itemsPerPage, filters);
    },
    [fetchFletes, pagination.itemsPerPage, filters]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchFletes(1, newItemsPerPage, filters);
    },
    [fetchFletes, filters]
  );

  // Función para obtener clase de estado
  const getEstadoBadgeClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case "VALORIZADO":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "PAGADO":
        return "bg-green-100 text-green-800 border border-green-300";
      case "CANCELADO":
        return "bg-red-100 text-red-800 border border-red-300";
      case "FACTURADO":
        return "bg-purple-100 text-purple-800 border border-purple-300";
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
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return fecha;
    }
  };

  // Calcular monto total de fletes seleccionados
  const totalMontoSeleccionado = selectedFletes.reduce((total, id) => {
    const flete = fletes.find((f) => f.id === id);
    return total + (flete ? parseFloat(flete.monto_flete || 0) : 0);
  }, 0);

  // Mostrar loading solo en carga inicial
  if (isLoading && fletes.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
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
            Fletes por Facturar
          </h1>
          <p className="text-gray-600 mt-1">
            Total: {pagination.totalItems} fletes pendientes de facturación
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            onClick={handleCreateInvoice}
            icon={FilePlus}
            disabled={selectedFletes.length === 0}
          >
            Crear Factura ({selectedFletes.length})
          </Button>
        </div>
      </div>

      {/* Mostrar mensajes */}
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

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros de Búsqueda
            </h3>
            <p className="text-sm text-gray-600">Filtrado en tiempo real</p>
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
              Limpiar
            </Button>
          </div>
        </div>

        {/* Filtros en tiempo real - SOLO CÓDIGO DE FLETE */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Código Flete
            </label>
            <input
              type="text"
              value={filters.codigo_flete}
              onChange={(e) => handleFilterChange('codigo_flete', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: FLT-0000000001"
            />
          </div>
        </div>

        {Object.values(filters).some((f) => f.trim() !== "") && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                Filtros activos:
                <span className="font-medium text-blue-600 ml-2">
                  {Object.values(filters).filter((f) => f.trim() !== "").length}
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

      {/* Resumen selección */}
      {selectedFletes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-blue-800">
                <span className="font-medium">{selectedFletes.length}</span>{" "}
                flete(s) seleccionado(s)
              </div>
              <div className="text-sm text-blue-800">
                Monto total: S/. {totalMontoSeleccionado.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFletes([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Deseleccionar todos
              </button>
              <Button
                onClick={handleCreateInvoice}
                icon={FilePlus}
                size="small"
              >
                Crear Factura
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla estilo Excel */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSelectAll}
                      className="focus:outline-none"
                      title={
                        selectedFletes.length === fletes.length
                          ? "Deseleccionar todos"
                          : "Seleccionar todos"
                      }
                    >
                      {selectedFletes.length === fletes.length &&
                      fletes.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Código Flete
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Código Servicio
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Monto Flete
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Estado
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fecha Creación
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Observaciones
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(fletes) && fletes.length > 0 ? (
                fletes.map((flete) => {
                  const isSelected = selectedFletes.includes(flete.id);
                  const isEditing = editingFlete === flete.id;

                  return (
                    <tr
                      key={flete.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleRowClick(flete)}
                    >
                      <td
                        className="px-3 py-2 border-r border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectFlete(flete.id, e)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <div className="font-medium text-gray-900">
                          {flete.codigo_flete || "N/A"}
                        </div>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <div className="font-medium text-gray-900">
                          {flete.codigo_servicio || "N/A"}
                        </div>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">S/.</span>
                            <input
                              type="number"
                              value={editForm.monto_flete}
                              onChange={(e) => setEditForm({...editForm, monto_flete: e.target.value})}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        ) : (
                          <div className="font-medium text-gray-900">
                            S/. {parseFloat(flete.monto_flete || 0).toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(
                            flete.estado_flete
                          )}`}
                        >
                          {flete.estado_flete || "N/A"}
                        </span>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                        <div className="text-gray-900">
                          {formatFecha(flete.fecha_creacion)}
                        </div>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        {isEditing ? (
                          <textarea
                            value={editForm.observaciones}
                            onChange={(e) => setEditForm({...editForm, observaciones: e.target.value})}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="Observaciones..."
                            rows="2"
                          />
                        ) : (
                          <div className="text-gray-900 truncate max-w-[150px]">
                            {flete.observaciones || "Sin observaciones"}
                          </div>
                        )}
                      </td>

                      <td
                        className="px-3 py-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex space-x-1">
                          {isEditing ? (
                            <>
                              <button
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSaveEdit(flete.id);
                                }}
                                className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
                                title="Guardar cambios"
                                disabled={isLoading}
                              >
                                <Save className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                                title="Cancelar edición"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEdit(flete, e);
                                }}
                                className="p-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                title="Editar flete"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(flete);
                                }}
                                className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                                title="Ver detalles"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-3 py-8 text-center">
                    {isLoading ? (
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No se encontraron fletes
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {Object.values(filters).some((f) => f.trim() !== "")
                            ? "Intenta ajustar los filtros de búsqueda"
                            : "No hay fletes valorizados pendientes de facturación"}
                        </p>
                        {Object.values(filters).some(
                          (f) => f.trim() !== ""
                        ) && (
                          <Button onClick={clearFilters} size="small">
                            Limpiar filtros
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
              pagination.totalItems
            )}
          />
        </div>
      )}

      {/* Modal de detalles del flete/servicio */}
      <Modal
        isOpen={showDetalleModal}
        onClose={handleCloseDetalleModal}
        title={
          modalMode === "flete"
            ? `Detalles del Flete - ${fleteSeleccionado?.codigo_flete || ""}`
            : `Detalles del Servicio - ${
                servicioDetalle?.codigo_servicio_principal ||
                fleteSeleccionado?.codigo_servicio ||
                ""
              }`
        }
        size="large"
      >
        {modalMode === "flete" ? (
          fleteSeleccionado && (
            <div className="space-y-6">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleViewServicioFromFlete}
                  variant="secondary"
                  size="small"
                  icon={Info}
                  isLoading={loadingServicio}
                >
                  Ver Detalles del Servicio
                </Button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información General del Flete
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Código Flete
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {fleteSeleccionado.codigo_flete}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Código Servicio
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {fleteSeleccionado.codigo_servicio}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Estado
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(
                          fleteSeleccionado.estado_flete
                        )}`}
                      >
                        {fleteSeleccionado.estado_flete}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Monto
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        S/.{" "}
                        {parseFloat(fleteSeleccionado.monto_flete || 0).toFixed(
                          2
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Fecha Creación
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatFecha(fleteSeleccionado.fecha_creacion)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Cliente
                      </label>
                      <p className="text-sm text-gray-900">
                        {fleteSeleccionado.cliente_nombre ||
                          fleteSeleccionado.cliente?.nombre ||
                          "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fleteSeleccionado.cliente_ruc ||
                          fleteSeleccionado.cliente?.ruc ||
                          ""}
                      </p>
                    </div>
                    {fleteSeleccionado.servicio_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          ID Servicio
                        </label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado.servicio_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Observaciones
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {fleteSeleccionado.observaciones || "Sin observaciones"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleCloseDetalleModal}
                  variant="secondary"
                  size="small"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={handleBackToFlete}
                variant="secondary"
                size="small"
                icon={Info}
              >
                Volver al Flete
              </Button>
              {loadingServicio && (
                <div className="text-sm text-blue-600 animate-pulse">
                  Cargando detalles del servicio...
                </div>
              )}
            </div>

            {servicioDetalle && (
              <>
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Información del Servicio
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Código
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {servicioDetalle.codigo_servicio_principal ||
                            fleteSeleccionado?.codigo_servicio ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Estado
                        </label>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            servicioDetalle.estado === "Completado"
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : servicioDetalle.estado === "Cancelado"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                          }`}
                        >
                          {servicioDetalle.estado || "Estado no disponible"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Fecha Servicio
                        </label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.fecha_servicio ||
                            "Fecha no disponible"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Tipo de Servicio
                        </label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.tipo_servicio ||
                            "Tipo no disponible"}{" "}
                          -
                          {servicioDetalle.modalidad_servicio ||
                            "Modalidad no disponible"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Placa
                        </label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.flota?.placa ||
                            "Placa no disponible"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Cliente
                        </label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.cliente?.nombre ||
                            "Cliente no disponible"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Origen
                        </label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.origen || "Origen no disponible"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Destino
                        </label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.destino || "Destino no disponible"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Gías
                        </label>
                        <p className="text-sm text-gray-900">
                          RR: {servicioDetalle.gia_rr || "No disponible"} <br />
                          RT: {servicioDetalle.gia_rt || "No disponible"}
                        </p>
                      </div>
                      {servicioDetalle.descripcion && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Descripción
                          </label>
                          <p className="text-sm text-gray-900">
                            {servicioDetalle.descripcion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Flete Relacionado
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Código Flete
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {fleteSeleccionado?.codigo_flete || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Estado del Flete
                        </label>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(
                            fleteSeleccionado?.estado_flete
                          )}`}
                        >
                          {fleteSeleccionado?.estado_flete || "N/A"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Monto del Flete
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          S/.{" "}
                          {fleteSeleccionado
                            ? parseFloat(
                                fleteSeleccionado.monto_flete || 0
                              ).toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Fecha Creación
                        </label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado
                            ? formatFecha(fleteSeleccionado.fecha_creacion)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleCloseDetalleModal}
                variant="secondary"
                size="small"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para crear factura - FORMULARIO SIMPLIFICADO */}
      <Modal
        isOpen={showFacturaModal}
        onClose={handleCloseFacturaModal}
        title="Crear Factura"
        size="medium"
      >
        <div className="space-y-6">
          {/* Resumen de fletes seleccionados */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Fletes Seleccionados ({selectedFletes.length})
            </h4>
            <div className="max-h-40 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-left font-medium text-gray-700">
                      Código Flete
                    </th>
                    <th className="py-2 text-left font-medium text-gray-700">
                      Código Servicio
                    </th>
                    <th className="py-2 text-left font-medium text-gray-700">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFletes.map((id) => {
                    const flete = fletes.find((f) => f.id === id);
                    if (!flete) return null;

                    return (
                      <tr key={id} className="border-b border-gray-100">
                        <td className="py-2">{flete.codigo_flete}</td>
                        <td className="py-2">{flete.codigo_servicio}</td>
                        <td className="py-2">
                          S/. {parseFloat(flete.monto_flete || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-900">
                Total: S/. {totalMontoSeleccionado.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Formulario de factura simplificado */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Factura *
              </label>
              <input
                type="text"
                value={facturaForm.numero_factura}
                onChange={(e) => handleFacturaFormChange('numero_factura', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  formErrors.numero_factura ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: F-20240001"
              />
              {formErrors.numero_factura && (
                <p className="mt-1 text-sm text-red-600">{formErrors.numero_factura}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Emisión *
                </label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={facturaForm.fecha_emision}
                    onChange={(e) => handleFacturaFormChange('fecha_emision', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      formErrors.fecha_emision ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.fecha_emision && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.fecha_emision}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Vencimiento *
                </label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={facturaForm.fecha_vencimiento}
                    onChange={(e) => handleFacturaFormChange('fecha_vencimiento', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      formErrors.fecha_vencimiento ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.fecha_vencimiento && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.fecha_vencimiento}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                value={facturaForm.moneda}
                onChange={(e) => handleFacturaFormChange('moneda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Total *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">
                  {facturaForm.moneda === 'PEN' ? 'S/' : '$'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={facturaForm.monto_total}
                  onChange={(e) => handleFacturaFormChange('monto_total', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    formErrors.monto_total ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {formErrors.monto_total && (
                <p className="mt-1 text-sm text-red-600">{formErrors.monto_total}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Suma automática de fletes: {totalMontoSeleccionado.toFixed(2)} {facturaForm.moneda === 'PEN' ? 'S/' : '$'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={facturaForm.descripcion}
                onChange={(e) => handleFacturaFormChange('descripcion', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Descripción de la factura..."
              />
            </div>
          </div>

          {/* Botones del formulario */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleCloseFacturaModal}
              variant="secondary"
              disabled={isCreatingInvoice}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFactura}
              isLoading={isCreatingInvoice}
            >
              Crear Factura
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(FletesPorFacturar);