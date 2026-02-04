import React, { useState, useCallback } from "react";
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
  Edit,
  Save,
  XCircle,
  AlertCircle,
  Info,
  MapPin,
  User,
  Package,
  Truck as TruckIcon,
  Users,
  Tag,
  Trash,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { fletesAPI } from "../../../api/endpoints/fletes";

const FletesPendientes = ({ servicioId, servicioCodigo }) => {
  const [fletes, setFletes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fleteToDelete, setFleteToDelete] = useState(null);

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
    cliente: "",
    codigo_flete: "",
    codigo_servicio: "",
  });

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [fleteSeleccionado, setFleteSeleccionado] = useState(null);
  const [editingFlete, setEditingFlete] = useState(null);
  const [editForm, setEditForm] = useState({
    monto_flete: "",
    observaciones: "",
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50];
  // NUEVOS ESTADOS
  const [editingMonto, setEditingMonto] = useState(null);
  const [montoEditValue, setMontoEditValue] = useState("");
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
        cleanFilters.estado_flete = "PENDIENTE";

        // Añadir filtro de servicio si existe
        if (servicioId) {
          cleanFilters.servicio_id = servicioId;
        }

        const response = await fletesAPI.getAdvancedFletes(cleanFilters);

        if (response && response.items) {
          setFletes(response.items);

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
    [servicioId],
  );

  // Efecto para búsqueda en tiempo real con debounce
  React.useEffect(() => {
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
  }, [filters]);

  // Cargar datos iniciales
  React.useEffect(() => {
    fetchFletes();
  }, []);

  // Función para manejar clic en el monto
  const handleMontoClick = useCallback(
    (flete, e) => {
      e.preventDefault();
      e.stopPropagation();

      // Si ya está en edición, no hacer nada
      if (editingMonto === flete.id) return;

      setEditingMonto(flete.id);
      setMontoEditValue(flete.monto_flete?.toString() || "0.00");

      // Limpiar modo de edición completo si está activo
      setEditingFlete(null);
      setEditForm({
        monto_flete: "",
        observaciones: "",
      });
    },
    [editingMonto],
  );

  // Función para guardar el monto editado
  const handleSaveMonto = useCallback(
    async (fleteId) => {
      if (!montoEditValue || parseFloat(montoEditValue) < 0) {
        setError("El monto debe ser mayor o igual a 0");
        setEditingMonto(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updateData = {
          monto_flete: parseFloat(montoEditValue),
        };

        await fletesAPI.updateFlete(fleteId, updateData);

        setSuccessMessage("Monto actualizado exitosamente");
        setEditingMonto(null);
        setMontoEditValue("");
        fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
      } catch (err) {
        setError("Error al actualizar el monto: " + err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [
      montoEditValue,
      fetchFletes,
      pagination.currentPage,
      pagination.itemsPerPage,
      filters,
    ],
  );

  const handleDeleteClick = useCallback((flete) => {
    setFleteToDelete(flete);
    setShowDeleteModal(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setFleteToDelete(null);
    setShowDeleteModal(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!fleteToDelete) return;

    setIsLoading(true);
    setError(null);

    try {
      // Llamar a la API para eliminar el flete
      await fletesAPI.deleteFlete(fleteToDelete.id);

      setSuccessMessage(
        `Flete ${fleteToDelete.codigo_flete} eliminado exitosamente. El servicio asociado ha sido cambiado a estado CANCELADO.`,
      );

      // Cerrar modal y actualizar lista
      setShowDeleteModal(false);
      setFleteToDelete(null);

      // Refrescar la lista de fletes
      fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (err) {
      setError(
        "Error al eliminar el flete: " + (err.message || "Error desconocido"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    fleteToDelete,
    fetchFletes,
    pagination.currentPage,
    pagination.itemsPerPage,
    filters,
  ]);

  // Función para cancelar edición de monto
  const handleCancelMontoEdit = useCallback(() => {
    setEditingMonto(null);
    setMontoEditValue("");
  }, []);

  const handleViewDetalle = useCallback((flete) => {
    setFleteSeleccionado(flete);
    setShowDetalleModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDetalleModal(false);
  }, []);

  const handleEdit = useCallback((flete) => {
    setEditingFlete(flete.id);
    setEditForm({
      monto_flete: flete.monto_flete.toString(),
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
    [
      editForm,
      fetchFletes,
      pagination.currentPage,
      pagination.itemsPerPage,
      filters,
    ],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingFlete(null);
    setEditForm({
      monto_flete: "",
      observaciones: "",
    });
  }, []);

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      cliente: "",
      codigo_flete: "",
      codigo_servicio: "",
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
        hour12: false, // Cambia a true si prefieres formato AM/PM
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
            Fletes del Servicio: {servicioCodigo}
          </h1>
          <p className="text-gray-600 mt-1">
            Total: {pagination.totalItems} fletes asociados
          </p>
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
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Filtros en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Cliente
            </label>
            <input
              type="text"
              value={filters.cliente}
              onChange={(e) => handleFilterChange("cliente", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: SONEPAR"
            />
          </div>

          {/* Código Flete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Código Flete
            </label>
            <input
              type="text"
              value={filters.codigo_flete}
              onChange={(e) =>
                handleFilterChange("codigo_flete", e.target.value)
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
              value={filters.codigo_servicio}
              onChange={(e) =>
                handleFilterChange("codigo_servicio", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: SRV-0000000019"
            />
          </div>
        </div>

        {/* Contador de filtros activos */}
        {Object.values(filters).some((f) => f && f.trim() !== "") && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                Filtros activos:
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
                    <Hash className="h-3 w-3" />
                    Cliente
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Placa
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fecha De Servicio
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
                    <DollarSign className="h-3 w-3" />
                    Tipo Servicio
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Origen
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Destino
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Estado
                  </div>
                </th>

                {/* <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Observaciones
                  </div>
                </th> */}
                <th className="py-2 px-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {fletes.map((flete) => {
                const isEditing = editingFlete === flete.id;

                return (
                  <tr
                    key={flete.id}
                    className="border-b border-gray-200 hover:bg-blue-50"
                  >
                    {/* Código Flete / Servicio */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className=" text-gray-900">
                        C. Flete: <p class="text-xs">{flete.codigo_flete}</p>
                        C. Servicio:{" "}
                        <p class="text-xs"> {flete.codigo_servicio}</p>
                      </div>
                    </td>

                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {flete?.servicio?.cliente?.nombre}
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {flete?.servicio?.flota?.placa}
                      </div>
                    </td>

                    <td className="px-3  border-r border-gray-200 whitespace-nowrap">
                      <div className="text-gray-900">
                        {formatFecha(flete?.servicio?.fecha_servicio)}
                      </div>
                    </td>

                    {/* Monto Flete */}

                    <td
                      className="px-3 py-2 border-r border-gray-200"
                      onClick={(e) => {
                        if (editingFlete !== flete.id) {
                          // Solo permitir si no está en modo edición completo
                          handleMontoClick(flete, e);
                        }
                      }}
                    >
                      {editingMonto === flete.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">S/.</span>
                          <input
                            type="number"
                            value={montoEditValue}
                            onChange={(e) => setMontoEditValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveMonto(flete.id);
                              } else if (e.key === "Escape") {
                                handleCancelMontoEdit();
                              }
                            }}
                            onBlur={() => handleSaveMonto(flete.id)}
                          />
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveMonto(flete.id);
                              }}
                              className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
                              title="Guardar monto"
                            >
                              <Save className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelMontoEdit();
                              }}
                              className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                              title="Cancelar edición"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ) : editingFlete === flete.id ? (
                        // Mantener el input original cuando está en modo edición completo
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">S/.</span>
                          <input
                            type="number"
                            value={editForm.monto_flete}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                monto_flete: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      ) : (
                        <div
                          className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors border border-transparent hover:border-blue-200"
                          title="Haz clic para editar el monto"
                        >
                          S/. {parseFloat(flete.monto_flete).toFixed(2)}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-2 border-r border-gray-200">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium`}
                      >
                        {flete?.servicio?.tipo_servicio ||
                          flete?.servicio?.modalidad_servicio}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium`}
                      >
                        {flete?.servicio?.origen}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium`}
                      >
                        {flete?.servicio?.destino}
                      </span>
                    </td>
                    {/* Estado */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(flete.estado_flete)}`}
                      >
                        {flete.estado_flete}
                      </span>
                    </td>

                    {/* Observaciones */}
                    {/* <td className="px-3 py-2 border-r border-gray-200">
                      {isEditing ? (
                        <textarea
                          value={editForm.observaciones}
                          onChange={(e) => setEditForm({...editForm, observaciones: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          placeholder="Observaciones..."
                          rows="2"
                        />
                      ) : (
                        <div className="text-gray-900 truncate max-w-[100px]">
                          {flete.observaciones || 'Sin observaciones'}
                        </div>
                      )}
                    </td> */}

                    {/* Acciones - Solo editar y detalles */}
                    <td className="px-3 py-2">
                      <div className="flex space-x-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(flete.id)}
                              className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
                              title="Guardar cambios"
                              disabled={isLoading}
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                              title="Cancelar edición"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(flete)}
                              className="p-3 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                              title="Editar flete"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleViewDetalle(flete)}
                              className="p-3 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                              title="Ver detalles"
                            >
                              Detalles
                            </button>
                            <button
                              onClick={() => handleDeleteClick(flete)}
                              className="p-3 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                              title="Eliminar flete"
                            >
                              Eliminar
                            </button>
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
                : "No hay fletes asociados a este servicio"}
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
                      S/. {parseFloat(fleteSeleccionado.monto_flete).toFixed(2)}
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
                        <p className="text-sm text-gray-900">
                          Cuenta:{" "}
                          {fleteSeleccionado.servicio?.cuenta?.nombre || "N/A"}
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

                    {/* Información de la Cuenta */}
                    {/* {fleteSeleccionado.servicio?.cuenta && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Información de Cuenta</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">NOmbre Nombre</label>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo Pago</label>
                            <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.cuenta?.tipo_pago || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Días Crédito</label>
                            <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.cuenta?.dias_credito || '0'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre Conductor</label>
                            <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.cuenta?.nombre_conductor || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )} */}
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
                        {/* <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Capacidad (m³)</label>
                          <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.flota?.capacidad_m3 || '0'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Marca/Modelo</label>
                          <p className="text-sm text-gray-900">
                            {fleteSeleccionado.servicio?.flota?.marca || ''} {fleteSeleccionado.servicio?.flota?.modelo || ''}
                          </p>
                        </div> */}
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
                                    {/* <div>
                                  <label className="block text-xs font-medium text-gray-500">DNI</label>
                                  <p className="text-sm text-gray-900">{cond.dni || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Licencia</label>
                                  <p className="text-sm text-gray-900">{cond.licencia_conducir || cond.licencia || 'N/A'}</p>
                                </div> */}
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
                                    {/* <div>
                                  <label className="block text-xs font-medium text-gray-500">DNI</label>
                                  <p className="text-sm text-gray-900">{aux.dni || 'N/A'}</p>
                                </div> */}
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

      {/* Modal de confirmación para eliminar flete */}
<Modal
  isOpen={showDeleteModal}
  onClose={handleCancelDelete}
  title="Confirmar Eliminación"
  size="medium"
>
  {fleteToDelete && (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Advertencia: Esta acción no se puede deshacer</h4>
            <p className="text-sm text-red-700 mt-1">
              ¿Estás seguro de que deseas eliminar el flete <span className="font-bold">{fleteToDelete.codigo_flete}</span>?
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800">Impacto en el servicio asociado</h4>
            <p className="text-sm text-yellow-700 mt-1">
              El servicio <span className="font-bold">{fleteToDelete.codigo_servicio}</span> asociado a este flete será cambiado automáticamente a estado <span className="font-bold">CANCELADO</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Detalles del flete a eliminar:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Código: {fleteToDelete.codigo_flete}</li>
            <li>• Cliente: {fleteToDelete.servicio?.cliente?.nombre || 'N/A'}</li>
            <li>• Monto: S/. {parseFloat(fleteToDelete.monto_flete).toFixed(2)}</li>
            <li>• Estado actual: {fleteToDelete.estado_flete}</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Servicio asociado:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Código: {fleteToDelete.codigo_servicio}</li>
            <li>• Origen: {fleteToDelete.servicio?.origen || 'N/A'}</li>
            <li>• Destino: {fleteToDelete.servicio?.destino || 'N/A'}</li>
            <li>• Estado actual: {fleteToDelete.servicio?.estado || 'N/A'}</li>
            <li>• Nuevo estado: <span className="font-bold text-red-600">CANCELADO</span></li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          onClick={handleCancelDelete}
          variant="secondary"
          size="small"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmDelete}
          variant="danger"
          size="small"
          isLoading={isLoading}
          icon={Trash}
        >
          Sí, eliminar flete
        </Button>
      </div>
    </div>
  )}
</Modal>
    </div>
  );
};

export default React.memo(FletesPendientes);
