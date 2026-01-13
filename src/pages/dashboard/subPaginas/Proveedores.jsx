import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Building,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  Upload,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { proveedoresAPI } from "../../../api/endpoints/proveedores";

// Utils
import {
  getEstadoColor,
  getTipoProveedorColor,
} from "../../../utils/proveedorUtils";

// Componentes específicos
import ProveedorForm from "../../../components/proveedores/ProveedorForm";
import ImportModal from "../../../components/proveedores/ImportModal";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
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
    codigo_proveedor: "",
    tipo_documento: "",
    numero_documento: "",
    razon_social: "",
    rubro_proveedor: "",
    contacto_principal: "",
    telefono: "",
    estado: "",
    servicio: "",
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
    suspendidos: 0,
    transportistas: 0,
    logistica: 0,
    tecnologia: 0,
  });

  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50];
  const isInitialMount = useRef(true);

  // Función principal para cargar proveedores
  const fetchProveedores = useCallback(
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

        // Si hay búsqueda aplicada, agregar filtro de razón social
        if (appliedSearch) {
          filtersForAPI.razon_social = appliedSearch;
        }

        const response = await proveedoresAPI.getAllProveedores(filtersForAPI, {
          page: page,
          pageSize: itemsPerPage,
        });

        setProveedores(response.items);

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
        const transportistas = response.items.filter((p) => p.rubro_proveedor === "transportista").length;
        const logistica = response.items.filter((p) => p.rubro_proveedor === "logistica").length;
        const tecnologia = response.items.filter((p) => p.rubro_proveedor === "tecnologia").length;
        const nuevosEsteAnio = response.items.filter((p) => {
          const fechaRegistro = new Date(p.fecha_registro);
          return fechaRegistro.getFullYear() === new Date().getFullYear();
        }).length;

        setEstadisticas({
          total: response.pagination.total,
          activos: response.items.filter((p) => p.estado === "activo").length,
          inactivos: response.items.filter((p) => p.estado === "inactivo").length,
          suspendidos: response.items.filter((p) => p.estado === "suspendido").length,
          transportistas,
          logistica,
          tecnologia,
          nuevosEsteAnio,
        });
      } catch (err) {
        setError("Error al cargar los proveedores: " + err.message);
        console.error("Error fetching proveedores:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters, appliedSearch]
  );

  // Cargar datos cuando cambian los filtros aplicados o la búsqueda aplicada
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchProveedores(1, pagination.itemsPerPage);
    }
  }, [appliedFilters, appliedSearch, fetchProveedores]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialMount.current) {
      fetchProveedores(1, pagination.itemsPerPage);
      isInitialMount.current = false;
    }
  }, []);

  const fetchEstadisticas = useCallback(async () => {
    try {
      const stats = await proveedoresAPI.getEstadisticas();
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

  const handleEdit = useCallback((proveedor) => {
    setModalState({
      show: true,
      mode: "edit",
      data: proveedor,
    });
    setError(null);
  }, []);

  const handleView = useCallback((proveedor) => {
    setModalState({
      show: true,
      mode: "view",
      data: proveedor,
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
      await proveedoresAPI.deleteProveedor(deleteId);
      // Recargar datos después de eliminar
      await fetchProveedores(pagination.currentPage, pagination.itemsPerPage);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchEstadisticas();
    } catch (err) {
      setError("Error al eliminar el proveedor: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  }, [
    deleteId,
    fetchProveedores,
    pagination.currentPage,
    pagination.itemsPerPage,
    fetchEstadisticas,
  ]);

  const handleSaveProveedor = useCallback(
    async (formData) => {
      setIsSaving(true);
      setError(null);

      try {
        if (modalState.mode === "create") {
          await proveedoresAPI.createProveedor(formData);
        } else if (modalState.mode === "edit") {
          await proveedoresAPI.updateProveedor(modalState.data.id, formData);
        }

        setModalState({ show: false, mode: "create", data: null });
        // Recargar datos después de guardar
        await fetchProveedores(pagination.currentPage, pagination.itemsPerPage);
        fetchEstadisticas();
      } catch (err) {
        setError("Error al guardar el proveedor: " + err.message);
      } finally {
        setIsSaving(false);
      }
    },
    [
      modalState,
      fetchProveedores,
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

      // Si hay búsqueda aplicada, agregar filtro de razón social
      if (appliedSearch) {
        filtersForAPI.razon_social = appliedSearch;
      }

      const blob = await proveedoresAPI.exportAllProveedoresExcel(filtersForAPI);
      proveedoresAPI.downloadExcel(
        blob,
        `proveedores_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err) {
      setError("Error al exportar: " + err.message);
    }
  }, [appliedFilters, appliedSearch]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      codigo_proveedor: "",
      tipo_documento: "",
      numero_documento: "",
      razon_social: "",
      rubro_proveedor: "",
      contacto_principal: "",
      telefono: "",
      estado: "",
      servicio: "",
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
      fetchProveedores(newPage, pagination.itemsPerPage);
    },
    [fetchProveedores, pagination.itemsPerPage]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      // Actualizar tamaño de página y recargar con página 1
      fetchProveedores(1, newItemsPerPage);
    },
    [fetchProveedores]
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

  if (isLoading && proveedores.length === 0) {
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
                placeholder="Buscar por Razón Social o RUC..."
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
            <label className="block text-xs text-gray-600 mb-1">
              Código Proveedor
            </label>
            <input
              type="text"
              value={filters.codigo_proveedor || ""}
              onChange={(e) =>
                setFilters({ ...filters, codigo_proveedor: e.target.value })
              }
              placeholder="Código"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Rubro Proveedor
            </label>
            <select
              value={filters.rubro_proveedor || ""}
              onChange={(e) =>
                setFilters({ ...filters, rubro_proveedor: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="transportista">Transportista</option>
              <option value="logistica">Logística</option>
              <option value="seguridad">Seguridad</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="tecnologia">Tecnología</option>
              <option value="servicios">Servicios</option>
              <option value="otros">Otros</option>
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
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              RUC/Documento
            </label>
            <input
              type="text"
              value={filters.numero_documento || ""}
              onChange={(e) =>
                setFilters({ ...filters, numero_documento: e.target.value })
              }
              placeholder="RUC o documento"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
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
                fetchProveedores(pagination.currentPage, pagination.itemsPerPage)
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
              Nuevo Proveedor
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
          <div className="text-xs text-gray-600">Total Proveedores</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {estadisticas.activos}
          </div>
          <div className="text-xs text-gray-600">Activos</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {estadisticas.transportistas}
          </div>
          <div className="text-xs text-gray-600">Transportistas</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-purple-600">
            {estadisticas.logistica}
          </div>
          <div className="text-xs text-gray-600">Logística</div>
        </div>
      </div>

      {/* Tabla de proveedores */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Proveedor
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Documento
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Contacto
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Rubro
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Estado
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Servicios
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {proveedores.map((proveedor) => (
                <tr key={proveedor.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 text-sm">
                      {proveedor.razon_social}
                    </div>
                    {proveedor.nombre_comercial && (
                      <div className="text-xs text-gray-500 italic">
                        {proveedor.nombre_comercial}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {proveedor.direccion}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">
                      {proveedor.tipo_documento}
                    </div>
                    <div className="text-xs text-gray-500">
                      {proveedor.numero_documento}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 text-sm">
                      {proveedor.contacto_principal || "N/E"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {proveedor.telefono || "N/E"}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTipoProveedorColor(
                        proveedor.rubro_proveedor
                      )}`}
                    >
                      {proveedor.rubro_proveedor || "N/E"}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoColor(
                        proveedor.estado
                      )}`}
                    >
                      {proveedor.estado}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-700 max-w-xs truncate">
                      {proveedor.servicios && Array.isArray(proveedor.servicios) 
                        ? proveedor.servicios.slice(0, 2).join(", ")
                        : proveedor.servicios || "No especificado"}
                      {proveedor.servicios && Array.isArray(proveedor.servicios) && proveedor.servicios.length > 2 && (
                        <span className="text-gray-500"> +{proveedor.servicios.length - 2} más</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleView(proveedor)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleEdit(proveedor)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(proveedor.id)}
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
      {proveedores.length > 0 && (
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
      {proveedores.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron proveedores
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            {Object.values(appliedFilters).some((f) => f !== "") ||
            appliedSearch
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay proveedores registrados en el sistema"}
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
              Registrar primer proveedor
            </Button>
          </div>
        </div>
      )}

      {/* Modal de CRUD de proveedor */}
      <Modal
        isOpen={modalState.show}
        onClose={() =>
          setModalState({ show: false, mode: "create", data: null })
        }
        title={
          modalState.mode === "create"
            ? "Nuevo Proveedor"
            : modalState.mode === "edit"
            ? "Editar Proveedor"
            : "Detalles del Proveedor"
        }
        size="large"
      >
        <ProveedorForm
          initialData={modalState.data}
          onSubmit={handleSaveProveedor}
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
          // Recargar proveedores después de importación exitosa
          fetchProveedores(1, pagination.itemsPerPage);
        }}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message="Esta acción eliminará permanentemente el proveedor seleccionado. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default React.memo(Proveedores);