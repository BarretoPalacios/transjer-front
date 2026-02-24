import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Edit2,
  X,
  PlusIcon,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  User,
  Car,
  MapPin,
  Package,
  Hash,
  CalendarDays,
  XCircle,
  CalendarClock
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Pagination from '../../../components/common/Pagination/Pagination';
import Modal from '../../../components/common/Modal/Modal';

// API 
import { serviciosPrincipalesAPI } from '../../../api/endpoints/servicioPrincipal';
import { utilsAPI } from '../../../api/endpoints/utils';

const Servicios = ({ clienteId = '', fechaInicio = '', fechaFin = '' }) => {
  const navigate = useNavigate();

  const [serviciosData, setServiciosData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Estados para las listas de clientes y proveedores
  const [clientesList, setClientesList] = useState([]);
  const [proveedoresList, setProveedoresList] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  // Estados para filtros - SOLO se inicializan con props si se enviaron
  const [filters, setFilters] = useState({
    codigo_servicio_principal: '',
    cliente_nombre: clienteId || '', // Se inicializa con clienteId solo si tiene valor
    flota_placa: '',
    fecha_servicio: '',
    fecha_inicio: fechaInicio || '', // Se inicializa con fechaInicio solo si tiene valor
    fecha_fin: fechaFin || '', // Se inicializa con fechaFin solo si tiene valor
    gia_rr: '',
    gia_rt: '',
    estado: '',
    cuenta_nombre: '',
    proveedor_nombre: ''
  });
  
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  
  const [showCambioEstadoModal, setShowCambioEstadoModal] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [justificacion, setJustificacion] = useState('');
  
  const [isCambiandoEstado, setIsCambiandoEstado] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [usuarioActual] = useState('admin@empresa.com');
  const [loadingDownload, setLoadingDownload] = useState(false);

  const itemsPerPageOptions = [10, 20, 30, 50];

  // Determinar si tenemos props para filtrar inicialmente
  const hasInitialFilters = !!(clienteId && fechaInicio && fechaFin);

  // Función principal para cargar servicios
  const fetchServicios = useCallback(
    async (page = 1, itemsPerPage = pagination.itemsPerPage, filtersToUse = filters) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      try {
        // Preparar filtros para API - SIEMPRE usar los filtros actuales
        const cleanFilters = {};
        
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            cleanFilters[key] = value.trim();
          }
        });
        
        // Añadir paginación
        cleanFilters.page = page;
        cleanFilters.page_size = itemsPerPage;
        
        console.log('Filtros enviados a la API (Servicios):', cleanFilters);
        
        const response = await serviciosPrincipalesAPI.getAllServiciosPrincipales(cleanFilters);
        
        // Adaptar la respuesta según la estructura de tu API
        if (response && response.data && response.pagination) {
          setServiciosData(response.data);
          
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.pagination.total || 0,
            totalPages: response.pagination.total_pages || 1,
            hasNext: response.pagination.total_pages > page,
            hasPrev: page > 1,
          });
        } else if (response && Array.isArray(response)) {
          setServiciosData(response);
          
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.length || 0,
            totalPages: Math.ceil((response.length || 0) / itemsPerPage),
            hasNext: (response.length || 0) >= itemsPerPage,
            hasPrev: page > 1,
          });
        } else {
          setServiciosData([]);
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          });
        }
        
      } catch (err) {
        setError('Error al cargar los servicios: ' + (err.message || 'Error desconocido'));
        console.error('Error fetching servicios:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.itemsPerPage]
  );

  // Efecto para cargar datos iniciales con los filtros de props si existen
  useEffect(() => {
    if (hasInitialFilters) {
      // Si hay props, cargar inmediatamente con esos filtros
      fetchServicios(1, pagination.itemsPerPage, filters);
    } else {
      // Si no hay props, cargar normalmente
      fetchServicios();
    }
    cargarClientes();
    cargarProveedores();
  }, []); // Solo al montar el componente

  // Efecto para búsqueda en tiempo real con debounce (SIEMPRE activo)
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      fetchServicios(1, pagination.itemsPerPage, filters);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters, pagination.itemsPerPage, fetchServicios]);

  // Función para cargar clientes desde el endpoint
  const cargarClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const response = await utilsAPI.getClientesList();
      setClientesList(response || []);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setClientesList([]);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Función para cargar proveedores desde el endpoint
  const cargarProveedores = useCallback(async () => {
    setLoadingProveedores(true);
    try {
      const response = await utilsAPI.getProveedoresList();
      setProveedoresList(response || []);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
      setProveedoresList([]);
    } finally {
      setLoadingProveedores(false);
    }
  }, []);

  // Handlers
  const handleCreate = useCallback(() => {
    navigate('/servicios/nuevo');
  }, [navigate]);

  const handleEdit = useCallback((servicio) => {
    navigate(`/servicios/editar/${servicio.id}`);
  }, [navigate]);

  const handleView = useCallback((servicio) => {
    navigate(`/servicios/detalle/${servicio.id}`);
  }, [navigate]);

  const handleExport = useCallback(async () => {
    try {
      setLoadingDownload(true);
      const filtersForAPI = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          filtersForAPI[key] = value.trim();
        }
      });
      
      const blob = await serviciosPrincipalesAPI.exportServiciosExcel(filtersForAPI);
      serviciosPrincipalesAPI.downloadExcel(
        blob, 
        `servicios_principales_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      setLoadingDownload(false);
    } catch (err) {
      setError('Error al exportar: ' + err.message);
      console.error('Error exporting servicios:', err);
      setLoadingDownload(false);
    }
  }, [filters]);

  // Handler para actualizar filtros (SIEMPRE disponible)
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      codigo_servicio_principal: '',
      cliente_nombre: '',
      flota_placa: '',
      fecha_servicio: '',
      fecha_inicio: '',
      fecha_fin: '',
      gia_rr: '',
      gia_rt: '',
      estado: '',
      cuenta_nombre: '',
      proveedor_nombre: ''
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchServicios(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchServicios, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchServicios(newPage, pagination.itemsPerPage, filters);
    },
    [fetchServicios, pagination.itemsPerPage, filters]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchServicios(1, newItemsPerPage, filters);
    },
    [fetchServicios, filters]
  );

  // Función para manejar clic en fila
  const handleRowClick = useCallback((servicio) => {
    setServicioSeleccionado(servicio);
    setShowResumenModal(true);
  }, []);

  // Función para abrir modal de cambio de estado
  const handleAbrirCambioEstado = useCallback((servicio, event) => {
    event.stopPropagation();
    if (!puedeCambiarEstado(servicio)) {
      setError('No se puede cambiar el estado de este servicio');
      return;
    }
    
    setServicioSeleccionado(servicio);
    setEstadoSeleccionado('');
    setJustificacion('');
    setShowCambioEstadoModal(true);
  }, []);

  // Función para verificar si un servicio puede cambiar de estado
  const puedeCambiarEstado = useCallback((servicio) => {
    return servicio.estado !== 'Completado' && 
           servicio.estado !== 'Cancelado' && 
           !servicio.servicio_cerrado &&
           servicio.es_editable;
  }, []);

  // Función para cambiar estado de un servicio desde modal
  const handleCambiarEstado = useCallback(async () => {
    if (!servicioSeleccionado?.id) {
      setError('No se ha seleccionado un servicio');
      return;
    }

    if (!estadoSeleccionado) {
      setError('Selecciona un nuevo estado');
      return;
    }

    if ((estadoSeleccionado === 'Cancelado' || estadoSeleccionado === 'Reprogramado') && !justificacion.trim()) {
      setError('Debes proporcionar una justificación para cancelar o reprogramar');
      return;
    }

    if (justificacion.trim().length < 10 && (estadoSeleccionado === 'Cancelado' || estadoSeleccionado === 'Reprogramado')) {
      setError('La justificación debe tener al menos 10 caracteres');
      return;
    }

    setIsCambiandoEstado(true);
    setError(null);

    try {
      const cambioRequest = {
        nuevo_estado: estadoSeleccionado,
        justificacion: justificacion || 'Cambio de estado realizado',
        usuario: usuarioActual
      };

      await serviciosPrincipalesAPI.cambiarEstadoServicio(servicioSeleccionado.id, cambioRequest);
      
      setSuccessMessage(`Servicio actualizado exitosamente a ${estadoSeleccionado}`);
      
      await fetchServicios(pagination.currentPage, pagination.itemsPerPage, filters);
      
      setEstadoSeleccionado('');
      setJustificacion('');
      setShowCambioEstadoModal(false);
      
    } catch (err) {
      setError('Error al cambiar el estado: ' + err.message);
    } finally {
      setIsCambiandoEstado(false);
    }
  }, [estadoSeleccionado, justificacion, servicioSeleccionado, usuarioActual, fetchServicios, pagination.currentPage, pagination.itemsPerPage, filters]);

  // Opciones de estado disponibles
  const opcionesEstado = [
    { valor: 'Completado', label: 'Completado', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    { valor: 'Cancelado', label: 'Cancelado', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
    { valor: 'Reprogramado', label: 'Reprogramado', icon: CalendarClock, color: 'text-blue-600', bgColor: 'bg-blue-100' }
  ];

  // Función para obtener clase de estado
  const getEstadoBadgeClass = (estado) => {
    switch(estado) {
      case 'Programado': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Completado': return 'bg-green-100 text-green-800 border border-green-300';
      case 'Cancelado': return 'bg-red-100 text-red-800 border border-red-300';
      case 'Reprogramado': return 'bg-blue-100 text-blue-800 border border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Función para obtener icono de estado
  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'Programado': return Clock;
      case 'Completado': return CheckCircle;
      case 'Cancelado': return AlertTriangle;
      case 'Reprogramado': return AlertCircle;
      default: return Clock;
    }
  };

  // Función para cerrar modales
  const handleCloseResumenModal = useCallback(() => {
    setShowResumenModal(false);
    setServicioSeleccionado(null);
  }, []);

  const handleCloseCambioEstadoModal = useCallback(() => {
    setShowCambioEstadoModal(false);
    setServicioSeleccionado(null);
    setEstadoSeleccionado('');
    setJustificacion('');
  }, []);

  if (isLoading && serviciosData.length === 0) {
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
      {/* Header - Siempre visible */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios Principales</h1>
          <p className="text-gray-600 mt-1">
            Total: {pagination.totalItems} servicios
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            onClick={handleCreate}
            icon={PlusIcon}
          >
            Nuevo Servicio
          </Button>
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

      {/* Filtros - Siempre visibles */}
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
              onClick={handleExport}
              variant="secondary"
              icon={Download}
              size="small"
              isLoading={loadingDownload}  
            >
              Exportar
            </Button>

            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="small"
              icon={RefreshCw}
              isLoading={isLoading}
            >
              Actualizar
            </Button>

            <Button
              onClick={clearFilters}
              variant="secondary"
              size="small"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Filtros en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </label>
            <select
              value={filters.cliente_nombre}
              onChange={(e) => handleFilterChange('cliente_nombre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              disabled={loadingClientes}
            >
              <option value="">Todos los clientes</option>
              {loadingClientes ? (
                <option value="" disabled>Cargando clientes...</option>
              ) : (
                clientesList.map((cliente, index) => (
                  <option key={index} value={cliente}>
                    {cliente}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Placa
            </label>
            <input
              type="text"
              value={filters.flota_placa}
              onChange={(e) => handleFilterChange('flota_placa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: ABC-123"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="Programado">Programado</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Reprogramado">Reprogramado</option>
            </select>
          </div>

          {/* Fecha de servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Servicio
            </label>
            <input
              type="date"
              value={filters.fecha_servicio}
              onChange={(e) => handleFilterChange('fecha_servicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código
            </label>
            <input
              type="text"
              value={filters.codigo_servicio_principal}
              onChange={(e) => handleFilterChange('codigo_servicio_principal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="SRV-000000001"
            />
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Servicio Desde
            </label>
            <input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Servicio Hasta
            </label> 
            <input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Proveedor
            </label>
            <select
              value={filters.proveedor_nombre}
              onChange={(e) => handleFilterChange('proveedor_nombre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              disabled={loadingProveedores}
            >
              <option value="">Todos los proveedores</option>
              {loadingProveedores ? (
                <option value="" disabled>Cargando proveedores...</option>
              ) : (
                proveedoresList.map((proveedor, index) => (
                  <option key={index} value={proveedor}>
                    {proveedor}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Contador de filtros activos */}
        {Object.values(filters).some(f => f && f.trim() !== '') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                Filtros activos: 
                <span className="font-medium text-blue-600 ml-2">
                  {Object.values(filters).filter(f => f && f.trim() !== '').length}
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

      {/* Tabla estilo Excel */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Código
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Fecha de Servicio
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Cliente / Cuenta
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Tipo Servicio
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Origen
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Destino
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    Placa 
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Conductor
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Capacidad
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    GIA's
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Estado
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {serviciosData.map((servicio) => {
                const EstadoIcon = getEstadoIcon(servicio.estado);
                const puedeCambiar = puedeCambiarEstado(servicio);
                
                return (
                  <tr 
                    key={servicio.id} 
                    className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleRowClick(servicio)}
                  >
                    {/* Código */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {servicio.codigo_servicio_principal || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {servicio.zona || 'Sin zona'}
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                       F. Servicio: {servicio.fecha_servicio}
                      </div>
                      <div className="font-medium text-gray-900">
                       F. Salida: {servicio.fecha_salida}
                      </div>
                      <div className="text-xs text-gray-500">
                       Mes: {servicio.mes || 'N/A'} 
                      </div>
                      <div className="text-xs text-gray-500">
                       H. Cita: {servicio.hora_cita?.slice(0, 5) || 'Sin hora'}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {servicio.cliente?.nombre || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Cuenta: {servicio.cuenta?.nombre || servicio.cuenta?.numero || 'N/A'}
                      </div>
                    </td>

                    {/* Tipo Servicio */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {servicio.tipo_servicio || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Modalidad: {servicio.modalidad_servicio || 'N/A'}
                      </div>
                    </td>

                    {/* Origen/Destino */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="text-sm text-gray-900 truncate max-w-[150px]">
                        {servicio.origen?.split(',')[0] || 'N/A'}
                      </div>
                      
                    </td>
                    <td className="px-3 py-2 border-r border-gray-200">    
                      <div className="text-sm text-gray-900 truncate max-w-[150px]">
                        {servicio.destino?.split(',')[0] || 'N/A'}
                      </div>
                    </td>

                    {/* Vehículo */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {servicio.flota?.placa || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {servicio.flota?.tipo_vehiculo || 'Sin tipo'}
                      </div>
                    </td>

                    {/* Conductor */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {servicio.conductor?.[0]?.nombres_completos || servicio.conductor?.[0]?.nombres || servicio.conductor?.[0]?.nombre || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Aux: {servicio.auxiliar?.[0]?.nombres_completos || 'Sin auxiliar'}
                      </div>
                    </td>

                    {/* Capacidad */}
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {servicio.m3 || '0'}
                          </div>
                          <div className="text-xs text-gray-500">m³</div>
                        </div>
                        <div className="text-gray-300">/</div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {servicio.tn || '0'}
                          </div>
                          <div className="text-xs text-gray-500">TN</div>
                        </div>
                      </div>
                    </td>

                    {/* GIA's */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">RR:</span>
                          <span className="font-medium">{servicio.gia_rr || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">RT:</span>
                          <span className="font-medium">{servicio.gia_rt || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Estado con botón para cambiar */}
                    <td className="px-3 py-2 border-r border-gray-200" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-start gap-1">
                        {/* Badge de estado */}
                        <div className={`flex items-center px-2 py-1 rounded ${getEstadoBadgeClass(servicio.estado)}`}>
                          <EstadoIcon className={`h-3 w-3 mr-1 ${
                            servicio.estado === 'Programado' ? 'text-yellow-600' :
                            servicio.estado === 'Completado' ? 'text-green-600' :
                            servicio.estado === 'Cancelado' ? 'text-red-600' :
                            'text-blue-600'
                          }`} />
                          <span className="text-xs font-medium">{servicio.estado}</span>
                        </div>
                        
                        {/* Botón para cambiar estado */}
                        {puedeCambiar && (
                          <button
                            onClick={(e) => handleAbrirCambioEstado(servicio, e)}
                            className="text-xs text-white font-medium flex items-center bg-blue-500 p-2 rounded hover:underline"
                            title="Cambiar estado"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Cambiar estado
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(servicio);
                          }}
                          className={`p-1 rounded hover:bg-gray-200 ${
                            servicio.es_editable && !servicio.servicio_cerrado
                              ? 'text-blue-600 hover:text-blue-800' 
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={servicio.es_editable && !servicio.servicio_cerrado ? "Editar" : "No editable"}
                          disabled={!servicio.es_editable || servicio.servicio_cerrado}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(servicio);
                          }}
                          className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                          title="Ver detalles completos"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {serviciosData.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron servicios</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f && f.trim() !== '')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay servicios registrados en el sistema'}
            </p>
            <div className="flex justify-center space-x-3">
              <Button onClick={clearFilters} size="small">
                Limpiar filtros
              </Button>
              <Button
                onClick={handleCreate}
                variant="secondary"
                size="small"
              >
                Registrar primer servicio
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Paginación y registros por página */}
      {serviciosData.length > 0 && (
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

      {/* Modales... (se mantienen igual) */}
      <Modal 
        isOpen={showCambioEstadoModal}
        onClose={handleCloseCambioEstadoModal}
        title="Cambiar Estado del Servicio"
        size="medium"
      >
        {/* ... contenido del modal ... */}
      </Modal>

      <Modal 
        isOpen={showResumenModal}
        onClose={handleCloseResumenModal}
        title={`Resumen del Servicio - ${servicioSeleccionado?.codigo_servicio_principal || ''}`}
        size="medium"
      >
        {/* ... contenido del modal ... */}
      </Modal>
    </div>
  );
};

export default React.memo(Servicios);