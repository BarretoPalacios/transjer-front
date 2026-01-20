import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  Upload,
  Car,
  MapPin,
  Globe,
  Calendar,
  DollarSign,
  CheckCircle,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";
import Pagination from "../../../components/common/Pagination/Pagination";

// Componentes específicos
import GastoForm from "./GastoForm";
// import ImportModal from "../../../components/gastos/ImportModal";

// API
import { gastosAPI } from "../../../api/endpoints/gastos";

// Tipos de gastos predefinidos según el modelo
const TIPOS_GASTO_PREDEFINIDOS = [
  "Combustible",
  "Peaje",
  "Mantenimiento",
  "Reparación",
  "Estacionamiento",
  "Lavado",
  "Seguro",
  "Multa",
  "Lubricantes",
  "Llantas",
  "Personalizado",
];

const AmbitoGastoEnum = {
  LOCAL: "local",
  NACIONAL: "nacional"
};

const EstadoGastoEnum = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  RECHAZADO: "rechazado",
  PAGADO: "pagado"
};

const Gastos = () => {
  const [gastos, setGastos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

  // Estados para modales de confirmación de pago
  const [showPagoConfirm, setShowPagoConfirm] = useState(false);
  const [gastoAPagar, setGastoAPagar] = useState(null);
  const [isMarcandoPago, setIsMarcandoPago] = useState(false);

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
    placa: "",
    tipo_gasto: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
    ambito: "",
    valor_min: "",
    valor_max: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Estados para modales
  const [modalState, setModalState] = useState({
    show: false,
    mode: "create", // 'create', 'edit', 'view'
    data: null,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    totalLocal: 0,
    totalNacional: 0,
    gastoTotal: 0,
    gastoPromedio: 0,
    gastosEsteMes: 0,
    placasActivas: 0,
    totalPendientes: 0,
    totalPagados: 0,
  });

  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50];
  const isInitialMount = useRef(true);

  // Función principal para cargar gastos
  const fetchGastos = useCallback(
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

        // Si hay búsqueda aplicada, agregar filtro de búsqueda
        if (appliedSearch) {
          filtersForAPI.search = appliedSearch;
        }

        const response = await gastosAPI.getAllGastos(filtersForAPI, {
          page: page,
          pageSize: itemsPerPage,
        });

        setGastos(response.items);

        // Actualizar paginación
        setPagination({
          currentPage: page,
          itemsPerPage: itemsPerPage,
          totalItems: response.pagination.total,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNext,
          hasPrev: response.pagination.hasPrev,
        });

        // Calcular estadísticas
        const gastosEsteMes = response.items.filter((g) => {
          const fechaGasto = new Date(g.fecha_gasto);
          const hoy = new Date();
          return (
            fechaGasto.getMonth() === hoy.getMonth() &&
            fechaGasto.getFullYear() === hoy.getFullYear()
          );
        }).length;

        const placasUnicas = [...new Set(response.items.map((g) => g.placa))];

        const gastoTotal = response.items.reduce(
          (sum, g) => sum + (g.total || 0),
          0
        );

        const pendientes = response.items.filter((g) => 
          g.estado === EstadoGastoEnum.PENDIENTE || 
          g.estado === EstadoGastoEnum.APROBADO
        ).length;
        
        const pagados = response.items.filter((g) => 
          g.estado === EstadoGastoEnum.PAGADO
        ).length;

        setEstadisticas({
          total: response.pagination.total,
          totalLocal: response.items.filter((g) => g.ambito === AmbitoGastoEnum.LOCAL).length,
          totalNacional: response.items.filter((g) => g.ambito === AmbitoGastoEnum.NACIONAL)
            .length,
          gastoTotal,
          gastoPromedio:
            response.items.length > 0
              ? gastoTotal / response.items.length
              : 0,
          gastosEsteMes,
          placasActivas: placasUnicas.length,
          totalPendientes: pendientes,
          totalPagados: pagados,
        });
      } catch (err) {
        setError("Error al cargar los gastos: " + err.message);
        console.error("Error fetching gastos:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters, appliedSearch]
  );

  // Cargar datos cuando cambian los filtros aplicados o la búsqueda aplicada
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchGastos(1, pagination.itemsPerPage);
    }
  }, [appliedFilters, appliedSearch, fetchGastos]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialMount.current) {
      fetchGastos(1, pagination.itemsPerPage);
      isInitialMount.current = false;
    }
  }, []);

  // Handlers para marcar como pagado
  const handleMarcarComoPagado = useCallback((gasto) => {
    setGastoAPagar(gasto);
    setShowPagoConfirm(true);
    setError(null);
  }, []);

  const confirmarPago = useCallback(async () => {
    if (!gastoAPagar) return;

    setIsMarcandoPago(true);
    setError(null);

    try {
      // Actualizar el estado del gasto a "pagado"
      console.log(gastoAPagar.id, EstadoGastoEnum.PAGADO)
      await gastosAPI.updateGasto(gastoAPagar.id, {estado:EstadoGastoEnum.PAGADO});
      
      // Recargar datos después de actualizar
      await fetchGastos(pagination.currentPage, pagination.itemsPerPage);
      
      // Cerrar modal y resetear estado
      setShowPagoConfirm(false);
      setGastoAPagar(null);
      
    } catch (err) {
      setError("Error al marcar como pagado: " + err.message);
    } finally {
      setIsMarcandoPago(false);
    }
  }, [gastoAPagar, fetchGastos, pagination.currentPage, pagination.itemsPerPage]);

  // Handlers optimizados
  const handleCreate = useCallback(() => {
    setModalState({
      show: true,
      mode: "create",
      data: null,
    });
    setError(null);
  }, []);

  const handleEdit = useCallback((gasto) => {
    setModalState({
      show: true,
      mode: "edit",
      data: gasto,
    });
    setError(null);
  }, []);

  const handleView = useCallback((gasto) => {
    setModalState({
      show: true,
      mode: "view",
      data: gasto,
    });
  }, []);

  const handleDelete = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await gastosAPI.deleteGasto(deleteId);
      // Recargar datos después de eliminar
      await fetchGastos(pagination.currentPage, pagination.itemsPerPage);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (err) {
      setError("Error al eliminar el gasto: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId, fetchGastos, pagination.currentPage, pagination.itemsPerPage]);

  // Handler para guardar gasto
  const handleSaveGasto = useCallback(async (formData) => {
    try {
      if (modalState.mode === "create") {
        await gastosAPI.createGasto(formData);
      } else if (modalState.mode === "edit") {
        await gastosAPI.updateGasto(modalState.data.id, formData);
      }

      setModalState({ show: false, mode: "create", data: null });
      // Recargar datos después de guardar
      await fetchGastos(pagination.currentPage, pagination.itemsPerPage);
    } catch (err) {
      throw new Error("Error al guardar el gasto: " + (err.response?.data?.message || err.message));
    }
  }, [modalState, fetchGastos, pagination.currentPage, pagination.itemsPerPage]);

  const handleExport = useCallback(async () => {
    try {
      const filtersForAPI = {};
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          filtersForAPI[key] = value;
        }
      });

      if (appliedSearch) {
        filtersForAPI.search = appliedSearch;
      }

      const blob = await gastosAPI.exportAllGastosExcel(filtersForAPI);
      gastosAPI.downloadExcel(
        blob,
        `gastos_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err) {
      setError("Error al exportar: " + err.message);
    }
  }, [appliedFilters, appliedSearch]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      placa: "",
      tipo_gasto: "",
      estado: "",
      fecha_desde: "",
      fecha_hasta: "",
      ambito: "",
      valor_min: "",
      valor_max: "",
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
      fetchGastos(newPage, pagination.itemsPerPage);
    },
    [fetchGastos, pagination.itemsPerPage]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchGastos(1, newItemsPerPage);
    },
    [fetchGastos]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Función para formatear fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-ES");
  };

  // Función para formatear moneda
  const formatMoneda = (valor) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor || 0);
  };

  // Función para obtener color según el ámbito
  const getAmbitoColor = (ambito) => {
    switch (ambito) {
      case AmbitoGastoEnum.LOCAL:
        return "bg-blue-100 text-blue-800";
      case AmbitoGastoEnum.NACIONAL:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Función para obtener color según el estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case EstadoGastoEnum.PENDIENTE:
        return "bg-yellow-100 text-yellow-800";
      case EstadoGastoEnum.APROBADO:
        return "bg-green-100 text-green-800";
      case EstadoGastoEnum.RECHAZADO:
        return "bg-red-100 text-red-800";
      case EstadoGastoEnum.PAGADO:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && gastos.length === 0) {
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
      {/* Mostrar errores */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Controles de búsqueda y filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        {/* Filtros avanzados */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Placa</label>
            <input
              type="text"
              value={filters.placa || ""}
              onChange={(e) => setFilters({ ...filters, placa: e.target.value })}
              placeholder="Ej: ABC-123"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Tipo de Gasto
            </label>
            <select
              value={filters.tipo_gasto || ""}
              onChange={(e) =>
                setFilters({ ...filters, tipo_gasto: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              {TIPOS_GASTO_PREDEFINIDOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Ámbito</label>
            <select
              value={filters.ambito || ""}
              onChange={(e) =>
                setFilters({ ...filters, ambito: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value={AmbitoGastoEnum.LOCAL}>Local</option>
              <option value={AmbitoGastoEnum.NACIONAL}>Nacional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Estado
            </label>
            <select
              value={filters.estado || ""}
              onChange={(e) =>
                setFilters({ ...filters, estado: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value={EstadoGastoEnum.PENDIENTE}>Pendiente</option>
              <option value={EstadoGastoEnum.APROBADO}>Aprobado</option>
              <option value={EstadoGastoEnum.RECHAZADO}>Rechazado</option>
              <option value={EstadoGastoEnum.PAGADO}>Pagado</option>
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              onClick={aplicarFiltros}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              icon={Filter}
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

          <div className="flex space-x-2">
            <Button
              onClick={() =>
                fetchGastos(pagination.currentPage, pagination.itemsPerPage)
              }
              variant="secondary"
              icon={RefreshCw}
              className="px-3 py-2 text-sm"
              title="Actualizar"
            >
              Actualizar
            </Button>
            <Button
              onClick={() => setShowImportModal(true)}
              variant="secondary"
              icon={Upload}
              className="px-3 py-2 text-sm"
            >
              Importar Excel
            </Button>
            <Button
              onClick={handleExport}
              variant="secondary"
              icon={Download}
              className="px-3 py-2 text-sm"
            >
              Descargar Excel
            </Button>
            <div className="flex space-x-2">
              <Button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                icon={Plus}
              >
                Nuevo Gasto
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contadores rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-gray-900">
            {estadisticas.total}
          </div>
          <div className="text-xs text-gray-600">Total Gastos</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-yellow-600">
            {estadisticas.totalPendientes}
          </div>
          <div className="text-xs text-gray-600">Pendientes</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {estadisticas.totalPagados}
          </div>
          <div className="text-xs text-gray-600">Pagados</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {formatMoneda(estadisticas.gastoTotal)}
          </div>
          <div className="text-xs text-gray-600">Gasto Total</div>
        </div>
      </div>

      {/* Tabla de gastos */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Fecha
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Placa
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Ámbito
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Tipo de Gasto
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Total
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Estado
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Observaciones
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {gastos.map((gasto) => (
                <tr key={gasto.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="font-medium text-gray-900">
                        {formatFecha(gasto.fecha_gasto)}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="font-medium text-gray-900 text-sm">
                        {gasto.placa}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getAmbitoColor(
                        gasto.ambito
                      )}`}
                    >
                      {gasto.ambito === AmbitoGastoEnum.LOCAL ? (
                        <MapPin className="h-3 w-3 mr-1" />
                      ) : (
                        <Globe className="h-3 w-3 mr-1" />
                      )}
                      {gasto.ambito === AmbitoGastoEnum.LOCAL ? "Local" : "Nacional"}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {gasto.detalles_gastos?.map((detalle, index) => (
                        <div key={index} className="flex items-center">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2">
                            {detalle.tipo_gasto === "Personalizado" 
                              ? detalle.tipo_gasto_personalizado 
                              : detalle.tipo_gasto}
                          </span>
                          <span className="text-xs text-gray-600">
                            {formatMoneda(detalle.valor)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="font-bold text-gray-900">
                        {formatMoneda(gasto.total)}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoColor(
                        gasto.estado
                      )}`}
                    >
                      {gasto.estado === EstadoGastoEnum.PAGADO && (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      {gasto.estado}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-600 max-w-xs">
                      {gasto.detalles_gastos?.[0]?.observacion || "Sin observación"}
                      {gasto.detalles_gastos?.length > 1 && (
                        <span className="text-gray-400 ml-1">
                          (+{gasto.detalles_gastos.length - 1} más)
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(gasto)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(gasto)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(gasto.id)}
                        className="p-1 hover:bg-gray-100 rounded text-red-500 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {/* Botón para marcar como pagado - solo visible si no está pagado */}
                      {(gasto.estado === EstadoGastoEnum.PENDIENTE || 
                        gasto.estado === EstadoGastoEnum.APROBADO) && (
                        <button
                          onClick={() => handleMarcarComoPagado(gasto)}
                          className="p-1 hover:bg-green-50 rounded text-green-500 hover:text-green-700"
                          title="Marcar como pagado"
                        >
                          {/* <CheckCircle className="h-4 w-4" /> */}
                          Marcar Como Pagado
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación y registros por página */}
      {gastos.length > 0 && (
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

      {/* Sin resultados */}
      {gastos.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron gastos
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            {Object.values(appliedFilters).some((f) => f !== "") ||
            appliedSearch
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay gastos registrados en el sistema"}
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={clearFilters} className="text-sm">
              Limpiar búsqueda
            </Button>
            <Button
              onClick={handleCreate}
              variant="secondary"
              className="text-sm"
            >
              Registrar primer gasto
            </Button>
          </div>
        </div>
      )}

      {/* Modal de CRUD de gasto */}
      <Modal
        isOpen={modalState.show}
        onClose={() =>
          setModalState({ show: false, mode: "create", data: null })
        }
        title={
          modalState.mode === "create"
            ? "Nuevo Gasto"
            : modalState.mode === "edit"
            ? "Editar Gastos"
            : "Detalles de Gastos"
        }
        size="large"
      >
        <GastoForm
          initialData={modalState.data}
          onSubmit={handleSaveGasto}
          onCancel={() => setModalState({ show: false, mode: "create", data: null })}
          mode={modalState.mode}
          error={error}
          tiposPredefinidos={TIPOS_GASTO_PREDEFINIDOS}
        />
      </Modal>

      {/* Import Modal */}
      {/* <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => {
          fetchGastos(1, pagination.itemsPerPage);
        }}
      /> */}

      {/* Modal de confirmación de pago */}
      <ConfirmModal
        isOpen={showPagoConfirm}
        onClose={() => {
          setShowPagoConfirm(false);
          setGastoAPagar(null);
        }}
        onConfirm={confirmarPago}
        title="Confirmar Pago"
        message={
          gastoAPagar ? (
            <>
              <div className="mb-4">
                <p>¿Estás seguro de marcar este gasto como pagado?</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Placa:</span> {gastoAPagar.placa}
                  </div>
                  <div>
                    <span className="font-medium">Fecha:</span> {formatFecha(gastoAPagar.fecha_gasto)}
                  </div>
                  <div>
                    <span className="font-medium">Ámbito:</span> {gastoAPagar.ambito === AmbitoGastoEnum.LOCAL ? "Local" : "Nacional"}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> {formatMoneda(gastoAPagar.total)}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Tipo de gastos:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {gastoAPagar.detalles_gastos?.map((detalle, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {detalle.tipo_gasto === "Personalizado" 
                          ? detalle.tipo_gasto_personalizado 
                          : detalle.tipo_gasto}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null
        }
        confirmText="Sí, marcar como pagado"
        cancelText="Cancelar"
        variant="success"
        isLoading={isMarcandoPago}
        confirmIcon={<CheckCircle className="h-4 w-4 mr-1" />}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message="Esta acción eliminará permanentemente el gasto seleccionado. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default React.memo(Gastos);