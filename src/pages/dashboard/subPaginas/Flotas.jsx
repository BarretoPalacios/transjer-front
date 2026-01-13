import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Truck,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  Upload,
  AlertTriangle,
  Calendar,
  Fuel,
  Settings,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { flotaAPI } from "../../../api/endpoints/flotas";

// Utils (debes crear este archivo)
import {
  getEstadoColor,
  getTipoVehiculoColor,
  getCombustibleColor,
  getAntiguedadColor,
  getAlertaColor,
  calcularAlertas,
  formatearFecha,
} from "../../../utils/flotaUtils";

// Componentes específicos
import FlotaForm from "../../../components/flotas/FlotaForm";
import ImportModal from "../../../components/flotas/ImportModal";

const Flotas = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

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
    marca: "",
    modelo: "",
    tipo_vehiculo: "",
    tipo_combustible: "",
    activo: "",
    codigo_flota: "",
    anio: undefined,
    mtc_numero: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Estados para modales
  const [modalState, setModalState] = useState({
    show: false,
    mode: "create",
    data: null,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    por_tipo_vehiculo: {},
    por_marca: {},
    alertas_activas: 0,
    promedio_antiguedad: 0,
    total_capacidad_tn: 0,
    total_capacidad_m3: 0,
  });

  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50];
  const isInitialMount = useRef(true);

  // Tipos de vehículo para filtros
  const tiposVehiculo = [
    { value: "Volquete", label: "Volquete" },
    { value: "Furgón", label: "Furgón" },
    { value: "Plataforma", label: "Plataforma" },
    { value: "Tanque", label: "Tanque" },
    { value: "Cisterna", label: "Cisterna" },
    { value: "Cama baja", label: "Cama baja" },
    { value: "Camión ligero", label: "Camión ligero" },
    { value: "Camión pesado", label: "Camión pesado" },
    { value: "Trailer", label: "Trailer" },
    { value: "Grúa", label: "Grúa" },
  ];

  const tiposCombustible = [
    { value: "Diesel", label: "Diesel" },
    { value: "Gasolina", label: "Gasolina" },
    { value: "GNV", label: "GNV" },
    { value: "Eléctrico", label: "Eléctrico" },
    { value: "Híbrido", label: "Híbrido" },
  ];

  // Función principal para cargar vehículos
  const fetchVehiculos = useCallback(
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

        // Si hay búsqueda aplicada, agregar filtro de placa o modelo
        if (appliedSearch) {
          filtersForAPI.placa = appliedSearch;
        }

        const response = await flotaAPI.getAllFlotas(filtersForAPI, {
          page: page,
          pageSize: itemsPerPage,
        });

        setVehiculos(response.items);

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
        const estadisticasCalculadas = calcularEstadisticas(response.items);
        setEstadisticas(estadisticasCalculadas);
      } catch (err) {
        setError("Error al cargar los vehículos: " + err.message);
        console.error("Error fetching vehículos:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters, appliedSearch]
  );

  // Función para calcular estadísticas
  const calcularEstadisticas = (vehiculos) => {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();

    let totalCapacidadTN = 0;
    let totalCapacidadM3 = 0;
    let totalAntiguedad = 0;
    let alertasActivas = 0;

    const porTipo = {};
    const porMarca = {};

    vehiculos.forEach((vehiculo) => {
      // Capacidades
      totalCapacidadTN += vehiculo.tn || 0;
      totalCapacidadM3 += vehiculo.m3 || 0;

      // Antigüedad
      const antiguedad = anioActual - (vehiculo.anio || anioActual);
      totalAntiguedad += antiguedad;

      // Tipo de vehículo
      const tipo = vehiculo.tipo_vehiculo || "Sin especificar";
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;

      // Marca
      const marca = vehiculo.marca || "Sin especificar";
      porMarca[marca] = (porMarca[marca] || 0) + 1;

      // Alertas
      const alertas = calcularAlertas(vehiculo);
      if (alertas.total > 0) {
        alertasActivas++;
      }
    });

    return {
      total: vehiculos.length,
      activos: vehiculos.filter((v) => v.activo === true).length,
      inactivos: vehiculos.filter((v) => v.activo === false).length,
      por_tipo_vehiculo: porTipo,
      por_marca: porMarca,
      alertas_activas: alertasActivas,
      promedio_antiguedad: vehiculos.length > 0 ? Math.round(totalAntiguedad / vehiculos.length) : 0,
      total_capacidad_tn: Math.round(totalCapacidadTN),
      total_capacidad_m3: Math.round(totalCapacidadM3),
    };
  };

  // Cargar datos cuando cambian los filtros aplicados o la búsqueda aplicada
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchVehiculos(1, pagination.itemsPerPage);
    }
  }, [appliedFilters, appliedSearch, fetchVehiculos]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialMount.current) {
      fetchVehiculos(1, pagination.itemsPerPage);
      isInitialMount.current = false;
    }
  }, []);

  // Obtener estadísticas generales
  const fetchEstadisticasGenerales = useCallback(async () => {
    try {
      const stats = await flotaAPI.getEstadisticasGenerales();
      setEstadisticas((prev) => ({
        ...prev,
        ...stats,
      }));
    } catch (err) {
      console.error("Error fetching estadísticas generales:", err);
    }
  }, []);

  // Obtener alertas
  const fetchAlertas = useCallback(async () => {
    try {
      const alertas = await flotaAPI.getAlertas(30); // 30 días de anticipación
      // Puedes usar estas alertas si necesitas mostrarlas en otro lugar
      console.log("Alertas obtenidas:", alertas);
    } catch (err) {
      console.error("Error fetching alertas:", err);
    }
  }, []);

  // Handlers optimizados
  const handleCreate = useCallback(() => {
    setModalState({
      show: true,
      mode: "create",
      data: null,
    });
    setError(null);
  }, []);

  const handleEdit = useCallback((vehiculo) => {
    setModalState({
      show: true,
      mode: "edit",
      data: vehiculo,
    });
    setError(null);
  }, []);

  const handleView = useCallback((vehiculo) => {
    setModalState({
      show: true,
      mode: "view",
      data: vehiculo,
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
      await flotaAPI.deleteFlota(deleteId);
      // Recargar datos después de eliminar
      await fetchVehiculos(pagination.currentPage, pagination.itemsPerPage);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchEstadisticasGenerales();
    } catch (err) {
      setError("Error al eliminar el vehículo: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  }, [
    deleteId,
    fetchVehiculos,
    pagination.currentPage,
    pagination.itemsPerPage,
    fetchEstadisticasGenerales,
  ]);

  const handleSaveVehiculo = useCallback(
    async (formData) => {
      setIsSaving(true);
      setError(null);

      try {
        if (modalState.mode === "create") {
          await flotaAPI.createFlota(formData);
        } else if (modalState.mode === "edit") {
          await flotaAPI.updateFlota(modalState.data.id, formData);
        }

        setModalState({ show: false, mode: "create", data: null });
        // Recargar datos después de guardar
        await fetchVehiculos(pagination.currentPage, pagination.itemsPerPage);
        fetchEstadisticasGenerales();
        fetchAlertas();
      } catch (err) {
        setError("Error al guardar el vehículo: " + err.message);
      } finally {
        setIsSaving(false);
      }
    },
    [
      modalState,
      fetchVehiculos,
      pagination.currentPage,
      pagination.itemsPerPage,
      fetchEstadisticasGenerales,
      fetchAlertas,
    ]
  );

  const handleExport = useCallback(async () => {
    try {
      const filtersForAPI = {};
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          filtersForAPI[key] = value;
        }
      });

      // Si hay búsqueda aplicada, agregar filtro
      if (appliedSearch) {
        filtersForAPI.placa = appliedSearch;
      }

      const blob = await flotaAPI.exportFlotaExcel(filtersForAPI);
      flotaAPI.downloadExcel(
        blob,
        `flota_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err) {
      setError("Error al exportar: " + err.message);
    }
  }, [appliedFilters, appliedSearch]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      placa: "",
      marca: "",
      modelo: "",
      tipo_vehiculo: "",
      tipo_combustible: "",
      activo: "",
      codigo_flota: "",
      anio: undefined,
      mtc_numero: "",
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
      fetchVehiculos(newPage, pagination.itemsPerPage);
    },
    [fetchVehiculos, pagination.itemsPerPage]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      // Actualizar tamaño de página y recargar con página 1
      fetchVehiculos(1, newItemsPerPage);
    },
    [fetchVehiculos]
  );

  // Handler para Enter en el buscador
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Función para calcular antigüedad
  const calcularAntiguedad = (anio) => {
    const anioActual = new Date().getFullYear();
    return anioActual - anio;
  };

  // Función para verificar alertas de un vehículo
  const verificarAlertasVehiculo = (vehiculo) => {
    return calcularAlertas(vehiculo);
  };

  if (isLoading && vehiculos.length === 0) {
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
      {/* Header con título */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Flota</h1>
              <p className="text-gray-600 text-sm mt-1">
                Administra los vehículos, documentación y mantenimiento de tu flota
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        {/* Buscador principal */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Buscar por Placa..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm uppercase"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Filtros avanzados */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Código Flota
            </label>
            <input
              type="text"
              value={filters.codigo_flota || ""}
              onChange={(e) =>
                setFilters({ ...filters, codigo_flota: e.target.value })
              }
              placeholder="Código"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Tipo de Vehículo
            </label>
            <select
              value={filters.tipo_vehiculo || ""}
              onChange={(e) =>
                setFilters({ ...filters, tipo_vehiculo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              {tiposVehiculo.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Estado</label>
            <select
              value={filters.activo || ""}
              onChange={(e) =>
                setFilters({ ...filters, activo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Combustible
            </label>
            <select
              value={filters.tipo_combustible || ""}
              onChange={(e) =>
                setFilters({ ...filters, tipo_combustible: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              {tiposCombustible.map((combustible) => (
                <option key={combustible.value} value={combustible.value}>
                  {combustible.label}
                </option>
              ))}
            </select>
          </div>
        </div> */}

        {/* Botones de acción */}
        <div className="flex justify-between items-center">
          {/* <div className="flex space-x-2">
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
          </div> */}

          <div className="flex space-x-2">
            <Button
              onClick={() =>
                fetchVehiculos(pagination.currentPage, pagination.itemsPerPage)
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
            <Button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              icon={Plus}
            >
              Nuevo Vehículo
            </Button>
          </div>
        </div>
      </div>

      {/* Contadores rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-gray-900">
            {estadisticas.total}
          </div>
          <div className="text-xs text-gray-600">Total Vehículos</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {estadisticas.activos}
          </div>
          <div className="text-xs text-gray-600">Activos</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className={`text-lg font-bold ${estadisticas.alertas_activas > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {estadisticas.alertas_activas}
          </div>
          <div className="text-xs text-gray-600">Con Alertas</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {estadisticas.total_capacidad_tn} TN
          </div>
          <div className="text-xs text-gray-600">Capacidad Total</div>
        </div>
      </div>

      {/* Tabla de vehículos */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Vehículo
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Especificaciones
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Documentación
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Estado
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Alertas
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {vehiculos.map((vehiculo) => {
                const alertas = verificarAlertasVehiculo(vehiculo);
                const antiguedad = calcularAntiguedad(vehiculo.anio);
                
                return (
                  <tr key={vehiculo.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Truck className="h-6 w-6 text-gray-400 mr-2" />
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {vehiculo.placa}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehiculo.codigo_flota || "Sin código"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 text-sm">
                        {vehiculo.marca} {vehiculo.modelo}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className={getTipoVehiculoColor(vehiculo.tipo_vehiculo)}>
                          {vehiculo.tipo_vehiculo}
                        </span>
                        <span className="mx-2">•</span>
                        <span className={getAntiguedadColor(antiguedad)}>
                          {antiguedad} años
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {vehiculo.tn} TN • {vehiculo.m3} m³
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Revisión: {formatearFecha(vehiculo.revision_tecnica_vencimiento) || "N/A"}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          SOAT: {formatearFecha(vehiculo.soat_vigencia_fin) || "N/A"}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center">
                          <Fuel className="h-3 w-3 mr-1" />
                          {vehiculo.tipo_combustible}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoColor(
                          vehiculo.activo
                        )}`}
                      >
                        {vehiculo.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {alertas.total > 0 ? (
                        <div className="flex flex-col space-y-1">
                          {alertas.mensajes.map((mensaje, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getAlertaColor(mensaje.severidad)}`}
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {mensaje.texto}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Sin alertas</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleView(vehiculo)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleEdit(vehiculo)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehiculo.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación y registros por página */}
      {vehiculos.length > 0 && (
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
      {vehiculos.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron vehículos
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            {Object.values(appliedFilters).some((f) => f !== "") ||
            appliedSearch
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay vehículos registrados en el sistema"}
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
              Registrar primer vehículo
            </Button>
          </div>
        </div>
      )}

      {/* Modal de CRUD de vehículo */}
      <Modal
        isOpen={modalState.show}
        onClose={() =>
          setModalState({ show: false, mode: "create", data: null })
        }
        title={
          modalState.mode === "create"
            ? "Nuevo Vehículo"
            : modalState.mode === "edit"
            ? "Editar Vehículo"
            : "Detalles del Vehículo"
        }
        size="large"
      >
        <FlotaForm
          initialData={modalState.data}
          onSubmit={handleSaveVehiculo}
          onCancel={() =>
            setModalState({ show: false, mode: "create", data: null })
          }
          mode={modalState.mode}
          isLoading={isSaving}
          error={error}
        />
      </Modal>

      {/* Modal de importación */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => {
          // Recargar vehículos después de importación exitosa
          fetchVehiculos(1, pagination.itemsPerPage);
          fetchEstadisticasGenerales();
        }}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message="Esta acción eliminará permanentemente el vehículo seleccionado. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default React.memo(Flotas);