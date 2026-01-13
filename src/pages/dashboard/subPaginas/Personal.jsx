import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  Upload,
  Shield,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { personalAPI } from "../../../api/endpoints/personal";

// Utils
import {
  getEstadoColor,
  getTipoPersonalColor,
  getTurnoColor,
  getLicenciaStatusColor,
  calcularEstadisticasPersonal,
} from "../../../utils/personalUtils";

// Componentes específicos
import PersonalForm from "../../../components/personal/PersonalForm";
import ImportModal from "../../../components/personal/ImportModal";

const Personal = () => {
  const [personalList, setPersonalList] = useState([]);
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
    dni: "",
    nombres_completos: "",
    tipo: "",
    estado: "",
    licencia_conducir: "",
    categoria_licencia: "",
    turno: "",
    fecha_ingreso_desde: "",
    fecha_ingreso_hasta: "",
    salario_min: "",
    salario_max: "",
    banco: "",
    telefono: "",
    email: "",
    contacto_emergencia: "",
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
    licencia: 0,
    vacaciones: 0,
    conductores: 0,
    administrativos: 0,
    promedio_salario: 0,
    licencias_por_vencer: 0,
  });

  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50];
  const isInitialMount = useRef(true);

  // Función principal para cargar personal
  const fetchPersonal = useCallback(
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

        // Si hay búsqueda aplicada, agregar filtro de nombres
        if (appliedSearch) {
          filtersForAPI.nombres_completos = appliedSearch;
        }

        const response = await personalAPI.getAllPersonal(filtersForAPI, {
          page: page,
          pageSize: itemsPerPage,
        });

        setPersonalList(response.items);

        // Actualizar paginación
        setPagination({
          currentPage: page,
          itemsPerPage: itemsPerPage,
          totalItems: response.pagination.total,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNext,
          hasPrev: response.pagination.hasPrev,
        });

        // Calcular estadísticas locales con los datos actuales
        const estadisticasLocal = calcularEstadisticasPersonal(response.items);
        setEstadisticas(estadisticasLocal);

      } catch (err) {
        setError("Error al cargar el personal: " + err.message);
        console.error("Error fetching personal:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters, appliedSearch]
  );

  // Cargar datos cuando cambian los filtros aplicados o la búsqueda aplicada
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchPersonal(1, pagination.itemsPerPage);
    }
  }, [appliedFilters, appliedSearch, fetchPersonal]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialMount.current) {
      fetchPersonal(1, pagination.itemsPerPage);
      isInitialMount.current = false;
    }
  }, []);

  const fetchEstadisticas = useCallback(async () => {
    try {
      const stats = await personalAPI.getEstadisticas();
      setEstadisticas((prev) => ({
        ...prev,
        ...stats,
      }));
    } catch (err) {
      console.error("Error fetching estadísticas:", err);
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

  const handleEdit = useCallback((personal) => {
    setModalState({
      show: true,
      mode: "edit",
      data: personal,
    });
    setError(null);
  }, []);

  const handleView = useCallback((personal) => {
    setModalState({
      show: true,
      mode: "view",
      data: personal,
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
      await personalAPI.deletePersonal(deleteId);
      // Recargar datos después de eliminar
      await fetchPersonal(pagination.currentPage, pagination.itemsPerPage);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchEstadisticas();
    } catch (err) {
      setError("Error al eliminar el personal: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  }, [
    deleteId,
    fetchPersonal,
    pagination.currentPage,
    pagination.itemsPerPage,
    fetchEstadisticas,
  ]);

  const handleSavePersonal = useCallback(
    async (formData) => {
      setIsSaving(true);
      setError(null);

      try {
        if (modalState.mode === "create") {
          await personalAPI.createPersonal(formData);
        } else if (modalState.mode === "edit") {
          await personalAPI.updatePersonal(modalState.data.id, formData);
        }

        setModalState({ show: false, mode: "create", data: null });
        // Recargar datos después de guardar
        await fetchPersonal(pagination.currentPage, pagination.itemsPerPage);
        fetchEstadisticas();
      } catch (err) {
        setError("Error al guardar el personal: " + err.message);
      } finally {
        setIsSaving(false);
      }
    },
    [
      modalState,
      fetchPersonal,
      pagination.currentPage,
      pagination.itemsPerPage,
      fetchEstadisticas,
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

      // Si hay búsqueda aplicada, agregar filtro de nombres
      if (appliedSearch) {
        filtersForAPI.nombres_completos = appliedSearch;
      }

      const blob = await personalAPI.exportAllPersonalExcel(filtersForAPI);
      personalAPI.downloadExcel(
        blob,
        `personal_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err) {
      setError("Error al exportar: " + err.message);
    }
  }, [appliedFilters, appliedSearch]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      dni: "",
      nombres_completos: "",
      tipo: "",
      estado: "",
      licencia_conducir: "",
      categoria_licencia: "",
      turno: "",
      fecha_ingreso_desde: "",
      fecha_ingreso_hasta: "",
      salario_min: "",
      salario_max: "",
      banco: "",
      telefono: "",
      email: "",
      contacto_emergencia: "",
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
      fetchPersonal(newPage, pagination.itemsPerPage);
    },
    [fetchPersonal, pagination.itemsPerPage]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      // Actualizar tamaño de página y recargar con página 1
      fetchPersonal(1, newItemsPerPage);
    },
    [fetchPersonal]
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

  // Función para obtener color de estado de licencia
  const getLicenciaColor = (personal) => {
    if (!personal.fecha_venc_licencia || !personal.licencia_conducir) {
      return "bg-gray-100 text-gray-600";
    }
    
    const fechaVenc = new Date(personal.fecha_venc_licencia);
    const hoy = new Date();
    const diasRestantes = Math.floor((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return "bg-red-100 text-red-800";
    if (diasRestantes < 30) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  if (isLoading && personalList.length === 0) {
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
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar por nombres..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
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
            <label className="block text-xs text-gray-600 mb-1">DNI</label>
            <input
              type="text"
              value={filters.dni || ""}
              onChange={(e) =>
                setFilters({ ...filters, dni: e.target.value })
              }
              placeholder="DNI"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Tipo Personal
            </label>
            <select
              value={filters.tipo || ""}
              onChange={(e) =>
                setFilters({ ...filters, tipo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="Conductor">Conductor</option>
              <option value="Auxiliar">Auxiliar</option>
              <option value="Operario">Operario</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Mecánico">Mecánico</option>
              <option value="Almacenero">Almacenero</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Estado</label>
            <select
              value={filters.estado || ""}
              onChange={(e) =>
                setFilters({ ...filters, estado: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Licencia">Licencia</option>
              <option value="Vacaciones">Vacaciones</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Turno
            </label>
            <select
              value={filters.turno || ""}
              onChange={(e) =>
                setFilters({ ...filters, turno: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="Día">Día</option>
              <option value="Noche">Noche</option>
              <option value="Rotativo">Rotativo</option>
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
                fetchPersonal(pagination.currentPage, pagination.itemsPerPage)
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
              Nuevo Personal
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
          <div className="text-xs text-gray-600">Total Personal</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {estadisticas.activos}
          </div>
          <div className="text-xs text-gray-600">Activos</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-orange-600">
            {estadisticas.conductores}
          </div>
          <div className="text-xs text-gray-600">Conductores</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {estadisticas.licencias_por_vencer}
          </div>
          <div className="text-xs text-gray-600">Licencias por vencer</div>
        </div>
      </div>

      {/* Tabla de personal */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Personal
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Documento
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Información Laboral
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Contacto
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Estado
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Licencia
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Salario
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {personalList.map((personal) => (
                <tr key={personal.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 text-sm">
                      {personal.nombres_completos}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cód: {personal.codigo_personal || "N/E"}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">
                      DNI: {personal.dni}
                    </div>
                    <div className="text-xs text-gray-500">
                      {personal.fecha_nacimiento ? 
                        `Nac: ${formatDate(personal.fecha_nacimiento)}` : 
                        "N/E"}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTipoPersonalColor(
                          personal.tipo
                        )}`}
                      >
                        {personal.tipo}
                      </span>
                      {personal.turno && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTurnoColor(
                            personal.turno
                          )}`}
                        >
                          {personal.turno}
                        </span>
                      )}
                      <div className="text-xs text-gray-500">
                        {personal.fecha_ingreso ? 
                          `Ingreso: ${formatDate(personal.fecha_ingreso)}` : 
                          "N/E"}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="font-medium">Tel:</span> {personal.telefono || "N/E"}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Email:</span> {personal.email ? 
                          <span className="text-blue-600 truncate">{personal.email}</span> : 
                          "N/E"}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoColor(
                        personal.estado
                      )}`}
                    >
                      {personal.estado || "N/E"}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {personal.tipo === "Conductor" ? (
                      <div className="space-y-1">
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLicenciaColor(personal)}`}>
                          {personal.licencia_conducir || "N/E"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {personal.fecha_venc_licencia ? 
                            `Vence: ${formatDate(personal.fecha_venc_licencia)}` : 
                            "N/E"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No aplica</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {personal.salario ? (
                      <div className="space-y-1">
                        <span className="font-medium text-green-600">
                          S/ {parseFloat(personal.salario).toFixed(2)}
                        </span>
                        {personal.banco && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {personal.banco}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/E</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleView(personal)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleEdit(personal)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(personal.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación y registros por página */}
      {personalList.length > 0 && (
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
      {personalList.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontró personal
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            {Object.values(appliedFilters).some((f) => f !== "") ||
            appliedSearch
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay personal registrado en el sistema"}
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
              Registrar primer empleado
            </Button>
          </div>
        </div>
      )}

      {/* Modal de CRUD de personal */}
      <Modal
        isOpen={modalState.show}
        onClose={() =>
          setModalState({ show: false, mode: "create", data: null })
        }
        title={
          modalState.mode === "create"
            ? "Nuevo Personal"
            : modalState.mode === "edit"
            ? "Editar Personal"
            : "Detalles del Personal"
        }
        size="large"
      >
        <PersonalForm
          initialData={modalState.data}
          onSubmit={handleSavePersonal}
          onCancel={() =>
            setModalState({ show: false, mode: "create", data: null })
          }
          mode={modalState.mode}
          isLoading={isSaving}
          error={error}
        />
      </Modal>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => {
          // Recargar personal después de importación exitosa
          fetchPersonal(1, pagination.itemsPerPage);
        }}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message="Esta acción eliminará permanentemente el registro de personal seleccionado. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default React.memo(Personal);