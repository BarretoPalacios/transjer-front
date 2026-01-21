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
  Lock,
  Unlock,
  Check,
  X,
  Upload,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";
import Pagination from "../../../components/common/Pagination/Pagination";

// API de usuarios (necesitarás crear este archivo)
import { usuariosAPI } from "../../../api/endpoints/usuarios";

// Componente de formulario (crearás este después)
import UsuarioForm from "../../../components/usuarios/UsuarioForm";

// Utils para usuarios
import { getEstadoColor } from "../../../utils/usuarioUtils";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  
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
    username: "",
    email: "",
    full_name: "",
    is_active: "",
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
    con_permisos: {
      gestion: 0,
      contabilidad: 0,
      servicios: 0,
      gastos: 0,
      gerencia: 0,
      otros: 0,
    },
  });

  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50];
  const isInitialMount = useRef(true);

  // Función principal para cargar usuarios
  const fetchUsuarios = useCallback(
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

        // Si hay búsqueda aplicada, agregar filtro de búsqueda general
        if (appliedSearch) {
          filtersForAPI.search = appliedSearch;
        }

        const response = await usuariosAPI.getAllUsuarios(filtersForAPI, {
          page: page,
          pageSize: itemsPerPage,
        });

        setUsuarios(response.items);

        // Actualizar paginación
        setPagination({
          currentPage: page,
          itemsPerPage: itemsPerPage,
          totalItems: response.pagination.total,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNext,
          hasPrev: response.pagination.hasPrev,
        });

        // Calcular estadísticas locales
        const activos = response.items.filter((u) => u.is_active).length;
        const inactivos = response.items.filter((u) => !u.is_active).length;
        
        // Calcular estadísticas de permisos
        const permisosStats = {
          gestion: 0,
          contabilidad: 0,
          servicios: 0,
          gastos: 0,
          gerencia: 0,
          otros: 0,
        };

        response.items.forEach(usuario => {
          if (usuario.permisos) {
            Object.keys(permisosStats).forEach(permiso => {
              if (usuario.permisos[permiso]) {
                permisosStats[permiso]++;
              }
            });
          }
        });

        setEstadisticas({
          total: response.pagination.total,
          activos,
          inactivos,
          con_permisos: permisosStats,
        });
      } catch (err) {
        setError("Error al cargar los usuarios: " + err.message);
        console.error("Error fetching usuarios:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [appliedFilters, appliedSearch, pagination.itemsPerPage]
  );

  // Cargar datos cuando cambian los filtros aplicados o la búsqueda aplicada
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchUsuarios(1, pagination.itemsPerPage);
    }
  }, [appliedFilters, appliedSearch, fetchUsuarios, pagination.itemsPerPage]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialMount.current) {
      fetchUsuarios(1, pagination.itemsPerPage);
      isInitialMount.current = false;
    }
  }, []);

  const fetchEstadisticas = useCallback(async () => {
    try {
      const stats = await usuariosAPI.getEstadisticas();
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

  const handleEdit = useCallback((usuario) => {
    setModalState({
      show: true,
      mode: "edit",
      data: usuario,
    });
    setError(null);
  }, []);

  const handleView = useCallback((usuario) => {
    setModalState({
      show: true,
      mode: "view",
      data: usuario,
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
      await usuariosAPI.deleteUsuario(deleteId);
      // Recargar datos después de eliminar
      await fetchUsuarios(pagination.currentPage, pagination.itemsPerPage);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchEstadisticas();
    } catch (err) {
      setError("Error al eliminar el usuario: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  }, [
    deleteId,
    fetchUsuarios,
    pagination.currentPage,
    pagination.itemsPerPage,
    fetchEstadisticas,
  ]);

  const handleSaveUsuario = useCallback(
    async (formData) => {
      setIsSaving(true);
      setError(null);

      try {
        if (modalState.mode === "create") {
          await usuariosAPI.createUsuario(formData);
        } else if (modalState.mode === "edit") {
          await usuariosAPI.updateUsuario(modalState.data.id, formData);
        }

        setModalState({ show: false, mode: "create", data: null });
        // Recargar datos después de guardar
        await fetchUsuarios(pagination.currentPage, pagination.itemsPerPage);
        fetchEstadisticas();
      } catch (err) {
        setError("Error al guardar el usuario: " + err.message);
      } finally {
        setIsSaving(false);
      }
    },
    [
      modalState,
      fetchUsuarios,
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

      // Si hay búsqueda aplicada, agregar filtro de búsqueda general
      if (appliedSearch) {
        filtersForAPI.search = appliedSearch;
      }

      const blob = await usuariosAPI.exportAllUsuariosExcel(filtersForAPI);
      usuariosAPI.downloadExcel(
        blob,
        `usuarios_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err) {
      setError("Error al exportar: " + err.message);
    }
  }, [appliedFilters, appliedSearch]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {
      username: "",
      email: "",
      full_name: "",
      is_active: "",
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
      fetchUsuarios(newPage, pagination.itemsPerPage);
    },
    [fetchUsuarios, pagination.itemsPerPage]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchUsuarios(1, newItemsPerPage);
    },
    [fetchUsuarios]
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

  // Handler para activar/desactivar usuario
  const toggleActivarUsuario = useCallback(async (usuario) => {
    try {
      await usuariosAPI.updateUsuario(usuario.id, {
        ...usuario,
        is_active: !usuario.is_active
      });
      // Recargar datos
      await fetchUsuarios(pagination.currentPage, pagination.itemsPerPage);
    } catch (err) {
      setError("Error al cambiar estado del usuario: " + err.message);
    }
  }, [fetchUsuarios, pagination.currentPage, pagination.itemsPerPage]);

  if (isLoading && usuarios.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Función para renderizar permisos
  const renderPermisos = (permisos) => {
    if (!permisos) return null;
    
    const permisosLabels = {
      gestion: "Gestión",
      contabilidad: "Contabilidad",
      servicios: "Servicios",
      gastos: "Gastos",
      gerencia: "Gerencia",
      otros: "Otros",
    };

    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(permisos).map(([key, value]) => 
          value && (
            <span 
              key={key} 
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {permisosLabels[key] || key}
            </span>
          )
        )}
      </div>
    );
  };

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
                placeholder="Buscar por nombre de usuario, email o nombre completo..."
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={filters.username || ""}
              onChange={(e) =>
                setFilters({ ...filters, username: e.target.value })
              }
              placeholder="Username"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={filters.email || ""}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Estado
            </label>
            <select
              value={filters.is_active || ""}
              onChange={(e) =>
                setFilters({ ...filters, is_active: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              onClick={aplicarFiltros}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
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
                fetchUsuarios(pagination.currentPage, pagination.itemsPerPage)
              }
              variant="secondary"
              icon={RefreshCw}
              className="px-3 py-2 text-sm"
              title="Actualizar"
            >
              Actualizar
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
              Nuevo Usuario
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
          <div className="text-xs text-gray-600">Total Usuarios</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {estadisticas.activos}
          </div>
          <div className="text-xs text-gray-600">Activos</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-red-600">
            {estadisticas.inactivos}
          </div>
          <div className="text-xs text-gray-600">Inactivos</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {estadisticas.con_permisos.gestion}
          </div>
          <div className="text-xs text-gray-600">Con acceso a Gestión</div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Usuario
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Email
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Nombre Completo
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Estado
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Permisos
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-900 text-xs uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 text-sm">
                      {usuario.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {usuario.id}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 text-sm">
                      {usuario.email}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 text-sm">
                      {usuario.full_name || "No especificado"}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          usuario.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {usuario.is_active ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </span>
                      <button
                        onClick={() => toggleActivarUsuario(usuario)}
                        className={`text-xs px-2 py-1 rounded ${
                          usuario.is_active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {usuario.is_active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {renderPermisos(usuario.permisos)}
                    {!usuario.permisos && (
                      <span className="text-xs text-gray-500 italic">
                        Sin permisos específicos
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleView(usuario)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
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
      {usuarios.length > 0 && (
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
      {usuarios.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            {Object.values(appliedFilters).some((f) => f !== "") ||
            appliedSearch
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay usuarios registrados en el sistema"}
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
              Registrar primer usuario
            </Button>
          </div>
        </div>
      )}

      {/* Modal de CRUD de usuario */}
      <Modal
        isOpen={modalState.show}
        onClose={() =>
          setModalState({ show: false, mode: "create", data: null })
        }
        title={
          modalState.mode === "create"
            ? "Nuevo Usuario"
            : modalState.mode === "edit"
            ? "Editar Usuario"
            : "Detalles del Usuario"
        }
        size="large"
      >
        <UsuarioForm
          initialData={modalState.data}
          onSubmit={handleSaveUsuario}
          onCancel={() =>
            setModalState({ show: false, mode: "create", data: null })
          }
          mode={modalState.mode}
          isLoading={isSaving}
          error={error}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message="Esta acción eliminará permanentemente el usuario seleccionado. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default React.memo(Usuarios);