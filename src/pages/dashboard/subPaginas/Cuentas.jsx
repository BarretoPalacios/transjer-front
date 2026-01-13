import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users,
  Building,
  Phone,
  Mail,
  CreditCard,
  Plus,
  FileText,
  BarChart3,
  RefreshCw,
  Filter,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import StatsCard from '../../../components/common/StatsCard/StatsCard';
import Pagination from '../../../components/common/Pagination/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';

// API
import { cuentasAPI } from '../../../api/endpoints/cuentas';
// Nueva API para clientes
import { clienteAPI } from '../../../api/endpoints/clientes';

// Utils
import { 
  getTipoClienteColor, 
  getEstadoCuentaColor, 
  formatMoneda, 
  formatFechaCuenta,
  calcularAntiguedadCuenta,
  tiposCliente,
  estadosCuenta
} from '../../../utils/cuentasUtils';

// Componentes específicos
import CuentaCard from '../../../components/cuentas/CuentaCard';
import CuentaForm from '../../../components/cuentas/CuentaForm';
import ImportModal from '../../../components/cuentas/ImportModal';

const Cuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [clientes, setClientes] = useState([]); // Nueva: lista de clientes
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo_cliente: 'todos',
    estado: 'todos'
  });
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'grid' o 'list'
  
  // Estados para modales
  const [modalState, setModalState] = useState({
    show: false,
    mode: 'create',
    data: null
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  
  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    suspendidos: 0,
    morosos: 0,
    total_limite_credito: 0,
    promedio_limite_credito: 0,
    clientes_vip: 0,
    clientes_corporativos: 0
  });

  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  // Configuración de paginación
  const cuentasPorPagina = 10;

  // Cargar clientes desde el backend
  const fetchClientes = useCallback(async () => {
    setIsLoadingClientes(true);
    try {
      const data = await clienteAPI.getAllClientes({'estado':"activo"});
      setClientes(data);
    } catch (err) {
      console.error('Error fetching clientes:', err);
      // Si falla, establecer array vacío
      setClientes([]);
    } finally {
      setIsLoadingClientes(false);
    }
  }, []);

  // Cargar cuentas desde el backend
  const fetchCuentas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filtersForAPI = cuentasAPI.normalizeFilters(filters);
      const data = await cuentasAPI.getAllCuentas(filtersForAPI);
      setCuentas(data);
      
      // Calcular estadísticas locales
      const totalLimiteCredito = data.reduce((sum, cuenta) => sum + (cuenta.limite_credito || 0), 0);
      const cuentasConLimite = data.filter(cuenta => cuenta.limite_credito).length;
      
      setEstadisticas({
        total: data.length,
        activos: data.filter(c => c.estado === 'activo').length,
        inactivos: data.filter(c => c.estado === 'inactivo').length,
        suspendidos: data.filter(c => c.estado === 'suspendido').length,
        morosos: data.filter(c => c.estado === 'moroso').length,
        total_limite_credito: totalLimiteCredito,
        promedio_limite_credito: cuentasConLimite > 0 ? totalLimiteCredito / cuentasConLimite : 0,
        clientes_vip: data.filter(c => c.tipo_cliente === 'VIP').length,
        clientes_corporativos: data.filter(c => c.tipo_cliente === 'Corporativo').length
      });
    } catch (err) {
      const errorMessage =  'Error al cargar las cuentas';
      setError(errorMessage);
      console.error('Error fetching cuentas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Cargar estadísticas desde el backend
  const fetchEstadisticas = useCallback(async () => {
    try {
      const stats = await cuentasAPI.getEstadisticas();
      
      setEstadisticas(prev => ({
        ...prev,
        ...stats,
      
      }));
    } catch (err) {
      console.error('Error fetching estadísticas:', err);
    }
  }, []);

  // Efecto inicial - cargar clientes y cuentas
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar clientes primero
        await fetchClientes();
        // Luego cargar cuentas
        await fetchCuentas();
        // Finalmente cargar estadísticas
        await fetchEstadisticas();
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadData();
  }, []);

  // Efecto para recargar cuentas cuando cambian filtros
  useEffect(() => {
    if (!isLoadingClientes) {
      fetchCuentas();
    }
  }, [filters, fetchCuentas, isLoadingClientes]);

  // Filtrar cuentas localmente por búsqueda y filtros avanzados
  const filteredCuentas = useMemo(() => {
    let filtered = [...cuentas];
    
    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cuenta =>
        (cuenta.codigo_cliente && cuenta.codigo_cliente.toLowerCase().includes(searchLower)) ||
        (cuenta.nombre && cuenta.nombre.toLowerCase().includes(searchLower)) ||
        (cuenta.ruc && cuenta.ruc.toLowerCase().includes(searchLower)) ||
        (cuenta.contacto && cuenta.contacto.toLowerCase().includes(searchLower)) ||
        (cuenta.email && cuenta.email.toLowerCase().includes(searchLower)) ||
        // Buscar por razón social del cliente
        (() => {
          const cliente = clientes.find(c => c.codigo_cliente === cuenta.codigo_cliente);
          return cliente && (
            (cliente.razon_social && cliente.razon_social.toLowerCase().includes(searchLower)) ||
            (cliente.nombre && cliente.nombre.toLowerCase().includes(searchLower))
          );
        })()
      );
    }
    
    // Filtro por tipo de cliente
    if (filters.tipo_cliente !== 'todos') {
      filtered = filtered.filter(cuenta => cuenta.tipo_cliente === filters.tipo_cliente);
    }
    
    // Filtro por estado
    if (filters.estado !== 'todos') {
      filtered = filtered.filter(cuenta => cuenta.estado === filters.estado);
    }
    
    return filtered;
  }, [cuentas, clientes, searchTerm, filters]);

  // Función para obtener la razón social de un cliente por su código
  const getRazonSocialCliente = useCallback((codigoCliente) => {
    if (!codigoCliente || !clientes.length) return '';
    const cliente = clientes.find(c => c.codigo_cliente === codigoCliente);
    return cliente ? (cliente.razon_social || cliente.nombre || '') : '';
  }, [clientes]);

  // Calcular paginación
  const totalPaginas = Math.ceil(filteredCuentas.length / cuentasPorPagina);
  const indexOfLastCuenta = currentPage * cuentasPorPagina;
  const indexOfFirstCuenta = indexOfLastCuenta - cuentasPorPagina;
  const currentCuentas = filteredCuentas.slice(indexOfFirstCuenta, indexOfLastCuenta);

  // Handlers optimizados
  const handleCreate = useCallback(() => {
    setModalState({
      show: true,
      mode: 'create',
      data: null
    });
    setError(null);
  }, []);

  const handleEdit = useCallback((cuenta) => {
    setModalState({
      show: true,
      mode: 'edit',
      data: cuenta
    });
    setError(null);
  }, []);

  const handleView = useCallback((cuenta) => {
    setModalState({
      show: true,
      mode: 'view',
      data: cuenta
    });
  }, []);

  const handleDelete = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await cuentasAPI.deleteCuentaPermanente(deleteId);
      setCuentas(prev => prev.filter(c => c._id !== deleteId && c.id !== deleteId));
      
      setShowDeleteConfirm(false);
      setDeleteId(null);
      
      // Recargar estadísticas
      fetchCuentas();
      fetchEstadisticas();
    } catch (err) {
      const errorMessage = cuentasAPI.handleError(err) || 'Error al eliminar la cuenta';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId, fetchCuentas, fetchEstadisticas]);

  const handleSaveCuenta = useCallback(async (formData) => {
    setIsSaving(true);
    setError(null);
    
    try {
      if (modalState.mode === 'create') {
        const nuevaCuenta = await cuentasAPI.createCuenta(formData);
        setCuentas(prev => [...prev, nuevaCuenta]);
      } else if (modalState.mode === 'edit') {
        const cuentaActualizada = await cuentasAPI.updateCuenta(modalState.data._id || modalState.data.id, formData);
        setCuentas(prev => 
          prev.map(c => (c._id === modalState.data._id || c.id === modalState.data.id) ? cuentaActualizada : c)
        );
      }
      
      setModalState({ show: false, mode: 'create', data: null });
      // Recargar estadísticas
      fetchCuentas();
      fetchEstadisticas();
    } catch (err) {
      const errorMessage = cuentasAPI.handleError(err) || 'Error al guardar la cuenta';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [modalState, fetchCuentas, fetchEstadisticas]);

  const handleExport = useCallback(async () => {
    try {
      const filtersForAPI = cuentasAPI.normalizeFilters(filters);
      const blob = await cuentasAPI.exportAllCuentasExcel(filtersForAPI);
      cuentasAPI.downloadExcel(blob, `cuentas_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      const errorMessage = cuentasAPI.handleError(err) || 'Error al exportar';
      setError(errorMessage);
    }
  }, [filters]);

  const handleImport = useCallback(async (file) => {
    setIsImporting(true);
    setImportErrors([]);
    
    try {
      const result = await cuentasAPI.importCuentasExcel(file);
      
      if (result && result.message) {
        // Importación exitosa, recargar datos
        fetchCuentas();
        fetchEstadisticas();
        setShowImportModal(false);
      } else {
        setImportErrors(['Error en la importación: respuesta inválida del servidor']);
      }
    } catch (err) {
      const errorMessage = cuentasAPI.handleError(err) || 'Error en la importación';
      setImportErrors([errorMessage]);
    } finally {
      setIsImporting(false);
    }
  }, [fetchCuentas, fetchEstadisticas]);

  const downloadTemplate = useCallback(async () => {
    try {
      // Si no hay endpoint específico para template, puedes crear uno o usar uno genérico
      throw new Error('La función de descargar plantilla no está implementada');
    } catch (err) {
      const errorMessage = err.message || 'Error al descargar plantilla';
      setError(errorMessage);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ 
      tipo_cliente: 'todos',
      estado: 'todos'
    });
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Función para renderizar el icono de estado
  const renderEstadoIcono = useCallback((estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactivo':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'suspendido':
      case 'moroso':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  }, []);

  // Función para recargar datos
  const handleRefresh = useCallback(() => {
    fetchClientes();
    fetchCuentas();
    fetchEstadisticas();
  }, [fetchClientes, fetchCuentas, fetchEstadisticas]);

  if (isLoading || isLoadingClientes) {
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Cuentas</h1>
          <p className="text-gray-600 mt-1">
            Administra y gestiona las cuentas de clientes
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            onClick={handleCreate}
            icon={Plus}
          >
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Cuentas"
          value={estadisticas.total}
          icon={Users}
          color="blue"
          subtitle={`${estadisticas.activos} activas`}
          subtitleColor="green"
        />
        
        <StatsCard
          title="Clientes con Cuenta"
          value={Object.keys(estadisticas.top_clientes || {}).length}
          icon={CreditCard}
          color="purple"
        />
        
        <StatsCard
          title="Límite Total Crédito"
          value={formatMoneda(estadisticas.total_limite_credito)}
          icon={CreditCard}
          color="green"
          subtitle="Crédito autorizado"
        />
        
        <StatsCard
          title="Cuentas Inactivas"
          value={estadisticas.inactivos + estadisticas.suspendidos + estadisticas.morosos}
          icon={AlertCircle}
          color="red"
          subtitleColor="yellow"
        />
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por código cliente, nombre, RUC, razón social..."
          />
          
          <div className="flex items-center space-x-3">
            {/* Controles de vista */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="small"
                className="rounded-none"
                icon={BarChart3}
              />
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="small"
                className="rounded-none"
                icon={FileText}
              />
            </div>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              icon={Filter}
            >
              Filtros
              {Object.values(filters).some(f => f !== 'todos') && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Activos
                </span>
              )}
            </Button>

            <Button
              onClick={() => setShowImportModal(true)}
              variant="secondary"
              icon={Upload}
            >
              Importar
            </Button>

            <Button
              onClick={handleExport}
              variant="secondary"
              icon={Download}
            >
              Exportar
            </Button>

            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="small"
              icon={RefreshCw}
              isLoading={isLoading || isLoadingClientes}
            />
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cliente
                </label>
                <select
                  value={filters.tipo_cliente}
                  onChange={(e) => setFilters({...filters, tipo_cliente: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los tipos</option>
                  {tiposCliente.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la Cuenta
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters({...filters, estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  {estadosCuenta.map(estado => (
                    <option key={estado} value={estado} className="capitalize">
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={clearFilters}
                variant="secondary"
              >
                Limpiar filtros
              </Button>
              <Button
                onClick={() => setShowFilters(false)}
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentCuentas.map((cuenta) => (
            <CuentaCard
              key={cuenta._id || cuenta.id}
              cuenta={cuenta}
              razonSocialCliente={getRazonSocialCliente(cuenta.codigo_cliente)}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Cuenta</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Contacto</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Límite Crédito</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Tipo</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Registro</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentCuentas.map((cuenta) => {
                  const razonSocial = getRazonSocialCliente(cuenta.codigo_cliente);
                  
                  return (
                    <tr key={cuenta._id || cuenta.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        {/* <div className="font-medium text-gray-900">{cuenta.codigo_cliente}</div> */}
                        <div className="font-medium text-gray-900">{cuenta.nombre}</div>
                        {/* <div className="text-sm text-gray-900">{cuenta.nombre}</div> */}
                        <div className="text-xs text-gray-500">RUC: {cuenta.ruc}</div> 
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {razonSocial || 'No disponible'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {cuenta.telefono && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-gray-900">{cuenta.telefono}</span>
                            </div>
                          )}
                          {cuenta.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-gray-900 truncate max-w-[150px]">{cuenta.email}</span>
                            </div>
                          )}
                          {cuenta.contacto && (
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-gray-900">{cuenta.contacto}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className={`font-medium ${
                            cuenta.limite_credito ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {cuenta.limite_credito ? formatMoneda(cuenta.limite_credito) : 'Sin límite'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoClienteColor(cuenta.tipo_cliente)}`}>
                          {cuenta.tipo_cliente}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoCuentaColor(cuenta.estado)}`}>
                          {renderEstadoIcono(cuenta.estado)}
                          <span className="ml-1 capitalize">{cuenta.estado}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatFechaCuenta(cuenta.fecha_registro)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {calcularAntiguedadCuenta(cuenta.fecha_registro)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleView(cuenta)}
                            variant="ghost"
                            size="small"
                            icon={Eye}
                            title="Ver detalles"
                          />
                          <Button
                            onClick={() => handleEdit(cuenta)}
                            variant="ghost"
                            size="small"
                            icon={Edit}
                            title="Editar"
                          />
                          <Button
                            onClick={() => handleDelete(cuenta._id || cuenta.id)}
                            variant="ghost"
                            size="small"
                            icon={Trash2}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {filteredCuentas.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPaginas}
          totalItems={filteredCuentas.length}
          itemsPerPage={cuentasPorPagina}
          onPageChange={setCurrentPage}
          startIndex={indexOfFirstCuenta}
          endIndex={Math.min(indexOfLastCuenta, filteredCuentas.length)}
        />
      )}

      {/* Sin resultados */}
      {filteredCuentas.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron cuentas</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || Object.values(filters).some(f => f !== 'todos')
              ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
              : 'No hay cuentas registradas en el sistema'}
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={clearFilters}>
              Limpiar búsqueda
            </Button>
            <Button
              onClick={handleCreate}
              variant="secondary"
            >
              Registrar primera cuenta
            </Button>
          </div>
        </div>
      )}

      {/* Modal de CRUD de cuenta */}
      <Modal
        isOpen={modalState.show}
        onClose={() => setModalState({ show: false, mode: 'create', data: null })}
        title={
          modalState.mode === 'create' ? 'Nueva Cuenta' : 
          modalState.mode === 'edit' ? 'Editar Cuenta' : 
          'Detalles de la Cuenta'
        }
        size="large"
      >
        <CuentaForm
          initialData={modalState.data}
          clientes={clientes} // Pasar la lista de clientes al formulario
          onSubmit={handleSaveCuenta}
          onCancel={() => setModalState({ show: false, mode: 'create', data: null })}
          mode={modalState.mode}
          isLoading={isSaving}
          error={error}
        />
      </Modal>

      {/* Modal de importación */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportErrors([]);
        }}
        onImport={handleImport}
        onDownloadTemplate={downloadTemplate}
        importErrors={importErrors}
        setImportErrors={setImportErrors}
        isLoading={isImporting}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message="Esta acción eliminará permanentemente la cuenta seleccionada. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default React.memo(Cuentas);