import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Users,
  CheckCircle,
  Shield,
  Lock,
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Componentes comunes
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import Input from '../../components/common/Input/Input';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import FilterPanel from '../../components/common/FilterPanel/FilterPanel';
import StatsCard from '../../components/common/StatsCard/StatsCard';
import Pagination from '../../components/common/Pagination/Pagination';

// Componentes específicos
import UsuarioCard from '../../components/usuarios/UsuarioCard/UsuarioCard';
import UsuarioForm from '../../components/usuarios/UsuarioForm/UsuarioForm';
import PermisosModal from '../../components/usuarios/PermisosModal/PermisosModal';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';

// Datos y configuraciones
import { usuariosEjemplo, rolesDisponibles, permisosDisponibles } from '../../data/usuariosData';
import { getEstadoColor, getRolColor } from '../../utils/usuarioUtils';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estado: 'todos',
    rol: 'todos',
    departamento: 'todos'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  
  // Estados para modales
  const [modalState, setModalState] = useState({
    show: false,
    mode: 'create', // 'create', 'edit', 'view'
    data: null
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [selectedUsuarioForPermisos, setSelectedUsuarioForPermisos] = useState(null);

  // Configuración de paginación
  const usuariosPorPagina = 8;

  // Simular carga de datos
  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setUsuarios(usuariosEjemplo);
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  // Filtrar usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          usuario.id.toLowerCase().includes(searchLower) ||
          usuario.dni.toLowerCase().includes(searchLower) ||
          usuario.nombre.toLowerCase().includes(searchLower) ||
          usuario.apellidos.toLowerCase().includes(searchLower) ||
          usuario.email.toLowerCase().includes(searchLower) ||
          usuario.usuario.toLowerCase().includes(searchLower)
        );
      }

      if (filters.estado !== 'todos' && usuario.estado !== filters.estado) {
        return false;
      }

      if (filters.rol !== 'todos' && usuario.rol !== filters.rol) {
        return false;
      }

      if (filters.departamento !== 'todos' && usuario.departamento !== filters.departamento) {
        return false;
      }

      return true;
    });
  }, [usuarios, searchTerm, filters]);

  // Calcular paginación
  const totalPaginas = Math.ceil(filteredUsuarios.length / usuariosPorPagina);
  const indexOfLastUsuario = currentPage * usuariosPorPagina;
  const indexOfFirstUsuario = indexOfLastUsuario - usuariosPorPagina;
  const currentUsuarios = filteredUsuarios.slice(indexOfFirstUsuario, indexOfLastUsuario);

  // Handlers optimizados con useCallback
  const handleCreate = useCallback(() => {
    setModalState({
      show: true,
      mode: 'create',
      data: null
    });
  }, []);

  const handleEdit = useCallback((usuario) => {
    setModalState({
      show: true,
      mode: 'edit',
      data: usuario
    });
  }, []);

  const handleView = useCallback((usuario) => {
    setModalState({
      show: true,
      mode: 'view',
      data: usuario
    });
  }, []);

  const handleDelete = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(() => {
    setUsuarios(prev => prev.filter(p => p.id !== deleteId));
    setShowDeleteConfirm(false);
    setDeleteId(null);
  }, [deleteId]);

  const handleSaveUsuario = useCallback((formData) => {
    if (modalState.mode === 'create') {
      const newId = `USR-${String(usuarios.length + 1).padStart(3, '0')}`;
      const newUsuario = {
        ...formData,
        id: newId,
        fechaRegistro: new Date().toISOString().split('T')[0],
        fechaUltimoAcceso: null,
        intentosFallidos: 0,
        bloqueado: false,
        password: '********'
      };
      setUsuarios(prev => [...prev, newUsuario]);
    } else if (modalState.mode === 'edit') {
      setUsuarios(prev => 
        prev.map(p => p.id === modalState.data.id ? { 
          ...formData, 
          id: modalState.data.id,
          password: formData.password ? '********' : p.password
        } : p)
      );
    }
    
    setModalState({ show: false, mode: 'create', data: null });
  }, [modalState, usuarios.length]);

  const handleGestionarPermisos = useCallback((usuario) => {
    setSelectedUsuarioForPermisos(usuario);
    setShowPermisosModal(true);
  }, []);

  const handleExport = useCallback(() => {
    // Lógica de exportación
    console.log('Exportando usuarios...');
  }, []);

  const toggleUsuarioSelection = useCallback((id) => {
    setSelectedUsuarios(prev => 
      prev.includes(id) 
        ? prev.filter(usuarioId => usuarioId !== id)
        : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedUsuarios.length === currentUsuarios.length) {
      setSelectedUsuarios([]);
    } else {
      setSelectedUsuarios(currentUsuarios.map(p => p.id));
    }
  }, [currentUsuarios, selectedUsuarios.length]);

  const clearFilters = useCallback(() => {
    setFilters({ estado: 'todos', rol: 'todos', departamento: 'todos' });
    setSearchTerm('');
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            onClick={handleCreate}
            icon={Plus}
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Usuarios"
          value={usuarios.length}
          icon={Users}
          color="blue"
        />
        
        <StatsCard
          title="Activos"
          value={usuarios.filter(u => u.estado === 'activo').length}
          icon={CheckCircle}
          color="green"
        />
        
        <StatsCard
          title="2FA Activado"
          value={usuarios.filter(u => u.twoFactorEnabled).length}
          icon={Shield}
          color="purple"
        />
        
        <StatsCard
          title="Administradores"
          value={usuarios.filter(u => u.rol === 'Administrador').length}
          icon={Lock}
          color="red"
        />
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por DNI, nombre, email, usuario..."
          />
          
          <div className="flex items-center space-x-3">
            {/* Controles de vista */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="small"
                className="rounded-none"
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="small"
                className="rounded-none"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              icon={Filter}
            >
              Filtros
              {Object.values(filters).some(f => f !== 'todos' && f !== '') && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Activos
                </span>
              )}
            </Button>

            <Button
              onClick={handleExport}
              variant="secondary"
              icon={Download}
            >
              Exportar
            </Button>

            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              size="small"
              icon={RefreshCw}
            />
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onClear={clearFilters}
            onApply={() => setShowFilters(false)}
          />
        )}
      </div>

      {/* Contenido principal */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentUsuarios.map((usuario) => (
            <UsuarioCard
              key={usuario.id}
              usuario={usuario}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManagePermissions={handleGestionarPermisos}
              getEstadoColor={getEstadoColor}
              getRolColor={getRolColor}
            />
          ))}
        </div>
      ) : (
        // Vista tabla (simplificada por ahora)
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedUsuarios.length === currentUsuarios.length && currentUsuarios.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Usuario</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Rol</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedUsuarios.includes(usuario.id)}
                        onChange={() => toggleUsuarioSelection(usuario.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-blue-50 mr-3">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{usuario.nombre} {usuario.apellidos}</div>
                          <div className="text-sm text-gray-500">@{usuario.usuario}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{usuario.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRolColor(usuario.rol)}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(usuario.estado)}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleView(usuario)}
                          variant="ghost"
                          size="small"
                          icon={Eye}
                        />
                        <Button
                          onClick={() => handleEdit(usuario)}
                          variant="ghost"
                          size="small"
                          icon={Edit}
                        />
                        <Button
                          onClick={() => handleDelete(usuario.id)}
                          variant="ghost"
                          size="small"
                          icon={Trash2}
                          className="text-red-600 hover:text-red-700"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {filteredUsuarios.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPaginas}
          totalItems={filteredUsuarios.length}
          itemsPerPage={usuariosPorPagina}
          onPageChange={setCurrentPage}
          startIndex={indexOfFirstUsuario}
          endIndex={Math.min(indexOfLastUsuario, filteredUsuarios.length)}
        />
      )}

      {/* Sin resultados */}
      {filteredUsuarios.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || Object.values(filters).some(f => f !== 'todos')
              ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
              : 'No hay usuarios registrados en el sistema'}
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={clearFilters}>
              Limpiar búsqueda
            </Button>
            <Button
              onClick={handleCreate}
              variant="secondary"
            >
              Crear primer usuario
            </Button>
          </div>
        </div>
      )}

      {/* Modal de CRUD de usuario */}
      <Modal
        isOpen={modalState.show}
        onClose={() => setModalState({ show: false, mode: 'create', data: null })}
        title={
          modalState.mode === 'create' ? 'Nuevo Usuario' : 
          modalState.mode === 'edit' ? 'Editar Usuario' : 
          'Detalles del Usuario'
        }
        size="large"
      >
        <UsuarioForm
          initialData={modalState.data}
          onSubmit={handleSaveUsuario}
          onCancel={() => setModalState({ show: false, mode: 'create', data: null })}
          mode={modalState.mode}
          rolesDisponibles={rolesDisponibles}
        />
      </Modal>

      {/* Modal de permisos */}
      <PermisosModal
        isOpen={showPermisosModal}
        onClose={() => {
          setShowPermisosModal(false);
          setSelectedUsuarioForPermisos(null);
        }}
        usuario={selectedUsuarioForPermisos}
        permisosDisponibles={permisosDisponibles}
        getRolColor={getRolColor}
        onUpdate={(updatedUsuario) => {
          setUsuarios(prev => 
            prev.map(u => u.id === updatedUsuario.id ? updatedUsuario : u)
          );
          setSelectedUsuarioForPermisos(updatedUsuario);
        }}
      />

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
      />
    </div>
  );
};

export default Usuarios;