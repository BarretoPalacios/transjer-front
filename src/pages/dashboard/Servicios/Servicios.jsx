import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  RefreshCw,
  Filter,
  Upload,
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
  DollarSign,
  Hash,
  CalendarDays,
  Check,
  XCircle,
  CalendarClock
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Pagination from '../../../components/common/Pagination/Pagination';
import Modal from '../../../components/common/Modal/Modal';

// API 
import { serviciosPrincipalesAPI } from '../../../api/endpoints/servicioPrincipal';

const Servicios = () => {
  const navigate = useNavigate();
  const [serviciosData, setServiciosData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Estados de paginación (igual que en FletesPendientes)
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
    codigo_servicio_principal:'',
    cliente_nombre: '',
    flota_placa: '',
    fecha_servicio: '',
    fecha_inicio:'',
    fecha_fin:"",
    gia_rr: '',
    gia_rt: '',
    estado: 'Programado',
    cuenta_nombre: '',
    proveedor_nombre: ''
  });
  
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  
  const [showCambioEstadoModal, setShowCambioEstadoModal] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [justificacion, setJustificacion] = useState('');
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  
  const [isCambiandoEstado, setIsCambiandoEstado] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [usuarioActual] = useState('admin@empresa.com');
  const [loadingDownload,setloadingDownload]=useState(false);

  const itemsPerPageOptions = [10, 20, 30, 50];

  // Función principal para cargar servicios (similar a fetchFletes)
  const fetchServicios = useCallback(
    async (page = 1, itemsPerPage = pagination.itemsPerPage, filtersToUse = filters) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      try {
        // Preparar filtros para API
        const cleanFilters = {};
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            cleanFilters[key] = value.trim();
          }
        });
        
        // Añadir paginación
        cleanFilters.page = page;
        cleanFilters.page_size = itemsPerPage;
        
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
          // Si la API devuelve un array plano
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
    []
  );

  // Efecto para búsqueda en tiempo real con debounce (igual que en FletesPendientes)
  React.useEffect(() => {
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
  }, [filters]);

  // Cargar datos iniciales
  React.useEffect(() => {
    fetchServicios();
  }, []);

  // Handlers optimizados
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
      setloadingDownload(true)
      const filtersForAPI = {};
      
      // Solo enviar filtros que tengan valor
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
      setloadingDownload(false)
    } catch (err) {
      setError('Error al exportar: ' + err.message);
      console.error('Error exporting servicios:', err);
    }
  }, [filters]);

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
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`Servicio actualizado exitosamente a ${estadoSeleccionado}`);
      
      // Recargar datos
      await fetchServicios(pagination.currentPage, pagination.itemsPerPage, filters);
      
      // Cerrar modales y limpiar
      setEstadoSeleccionado('');
      setJustificacion('');
      setShowCambioEstadoModal(false);
      
    } catch (err) {
      setError('Error al cambiar el estado: ' + err.message);
    } finally {
      setIsCambiandoEstado(false);
    }
  }, [estadoSeleccionado, justificacion, servicioSeleccionado, usuarioActual, fetchServicios, pagination.currentPage, pagination.itemsPerPage, filters]);

  // Handler para actualizar filtros (similar a handleFilterChange en FletesPendientes)
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      codigo_servicio_principal:'',
      cliente_nombre: '',
      flota_placa: '',
      fecha_servicio: '',
       fecha_inicio:'',
    fecha_fin:"",
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
      {/* Header */}
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

      {/* Filtros - Actualizados para usar handleFilterChange */}
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
            <input
              type="text"
              value={filters.cliente_nombre}
              onChange={(e) => handleFilterChange('cliente_nombre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Buscar por cliente..."
            />
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
              Codigo
            </label>
            <input
              type="text"
              value={filters.codigo_servicio_principal}
              onChange={(e) => handleFilterChange('codigo_servicio_principal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="SRV-000000001"
            />
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor
            </label>
            <input
              type="text"
              value={filters.proveedor_nombre}
              onChange={(e) => handleFilterChange('proveedor_nombre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Nombre del proveedor"
            />
          </div>

          {/* Cuenta */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta
            </label>
            <input
              type="text"
              value={filters.cuenta_nombre}
              onChange={(e) => handleFilterChange('cuenta_nombre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Nombre de la cuenta"
            />
          </div> */}

          {/* GIA RR */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              GIA RR
            </label>
            <input
              type="text"
              value={filters.gia_rr}
              onChange={(e) => handleFilterChange('gia_rr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Número GIA RR"
            />
          </div> */}

          {/* GIA RT */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              GIA RT   
            </label>
            <input
              type="text"
              value={filters.gia_rt} 
              onChange={(e) => handleFilterChange('gia_rt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Número GIA RT"
            />
          </div> */}
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

      {/* Paginación y registros por página - Igual que en FletesPendientes */}
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

      {/* Modal de cambio de estado */}
      <Modal 
        isOpen={showCambioEstadoModal}
        onClose={handleCloseCambioEstadoModal}
        title="Cambiar Estado del Servicio"
        size="medium"
      >
        {servicioSeleccionado && (
          <div className="space-y-6">
            {/* Información del servicio */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Servicio seleccionado:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Código:</span>
                  <span className="font-medium ml-2">{servicioSeleccionado.codigo_servicio_principal}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium ml-2">{servicioSeleccionado.cliente?.nombre}</span>
                </div>
                <div>
                  <span className="text-gray-600">Origen → Destino:</span>
                  <span className="font-medium ml-2">{servicioSeleccionado.origen?.split(',')[0]} → {servicioSeleccionado.destino?.split(',')[0]}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium ml-2">{servicioSeleccionado.fecha_servicio} {servicioSeleccionado.hora_cita?.slice(0, 5)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Estado actual:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEstadoBadgeClass(servicioSeleccionado.estado)}`}>
                    {servicioSeleccionado.estado}
                  </span>
                </div>
              </div>
            </div>

            {/* Selección de nuevo estado */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Selecciona el nuevo estado:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {opcionesEstado.map((opcion) => {
                  const Icono = opcion.icon;
                  const estaSeleccionado = estadoSeleccionado === opcion.valor;
                  
                  return (
                    <button
                      key={opcion.valor}
                      onClick={() => setEstadoSeleccionado(opcion.valor)}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        estaSeleccionado 
                          ? `${opcion.bgColor} border-${opcion.color.replace('text-', '')} ring-2 ring-offset-2 ring-${opcion.color.replace('text-', '')}`
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <Icono className={`h-8 w-8 mb-2 ${opcion.color}`} />
                      <span className={`font-medium ${opcion.color}`}>{opcion.label}</span>
                      {opcion.valor === 'Cancelado' || opcion.valor === 'Reprogramado' ? (
                        <span className="text-xs text-gray-500 mt-1">Requiere justificación</span>
                      ) : (
                        <span className="text-xs text-gray-500 mt-1">Cambio inmediato</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo de justificación */}
            {(estadoSeleccionado === 'Cancelado' || estadoSeleccionado === 'Reprogramado') && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Justificación para {estadoSeleccionado === 'Cancelado' ? 'cancelar' : 'reprogramar'} el servicio:
                </h4>
                <div className="space-y-2">
                  <textarea
                    value={justificacion}
                    onChange={(e) => setJustificacion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    rows="4"
                    placeholder={`Describe la razón para ${estadoSeleccionado === 'Cancelado' ? 'cancelar' : 'reprogramar'} este servicio...`}
                  />
                  <div className="flex justify-between text-sm">
                    <div className="text-gray-500">
                      {justificacion.length}/10 caracteres mínimos
                    </div>
                    <div className={justificacion.length >= 10 ? 'text-green-600 font-medium' : 'text-red-600'}>
                      {justificacion.length >= 10 ? '✓ Justificación válida' : 'Justificación demasiado corta'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleCloseCambioEstadoModal}
                variant="secondary"
                disabled={isCambiandoEstado}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCambiarEstado}
                isLoading={isCambiandoEstado}
                disabled={isCambiandoEstado || !estadoSeleccionado || 
                  ((estadoSeleccionado === 'Cancelado' || estadoSeleccionado === 'Reprogramado') && 
                   justificacion.trim().length < 10)}
              >
                {isCambiandoEstado ? 'Cambiando estado...' : 'Confirmar cambio'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de resumen del servicio */}
      <Modal 
        isOpen={showResumenModal}
        onClose={handleCloseResumenModal}
        title={`Resumen del Servicio - ${servicioSeleccionado?.codigo_servicio_principal || ''}`}
        size="medium"
      >
        {servicioSeleccionado && (
          <div className="space-y-4">
            {/* Botón para cambiar estado */}
            {puedeCambiarEstado(servicioSeleccionado) && (
              <div className="mb-4">
                <div className="bg-blue-50 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">¿Necesitas cambiar el estado de este servicio?</h4>
                      <p className="text-xs text-gray-600 mt-1">Estado actual: <span className="font-medium">{servicioSeleccionado.estado}</span></p>
                    </div>
                    <Button
                      onClick={() => {
                        handleCloseResumenModal();
                        handleAbrirCambioEstado(servicioSeleccionado, { stopPropagation: () => {} });
                      }}
                      size="small"
                    >
                      Cambiar Estado
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tabla de información */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-300 rounded border-collapse">
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-gray-50">
                    <td colSpan="2" className="px-3 py-2 font-semibold text-gray-900">
                      Información General
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium w-1/3">Código</td>
                    <td className="px-3 py-2">{servicioSeleccionado.codigo_servicio_principal || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Cliente</td>
                    <td className="px-3 py-2">{servicioSeleccionado.cliente?.nombre || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Cuenta</td>
                    <td className="px-3 py-2">{servicioSeleccionado.cuenta?.nombre || servicioSeleccionado.cuenta?.numero || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Proveedor</td>
                    <td className="px-3 py-2">{servicioSeleccionado.proveedor?.nombre || 'N/A'}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan="2" className="px-3 py-2 font-semibold text-gray-900">
                      Fechas y Horarios
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Fecha</td>
                    <td className="px-3 py-2">
                      {servicioSeleccionado.fecha_servicio} ({servicioSeleccionado.mes})
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Hora de Cita</td>
                    <td className="px-3 py-2">
                      {servicioSeleccionado.hora_cita?.slice(0, 5) || 'N/A'}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan="2" className="px-3 py-2 font-semibold text-gray-900">
                      Detalles del Servicio
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Tipo de Servicio</td>
                    <td className="px-3 py-2">{servicioSeleccionado.tipo_servicio}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Modalidad</td>
                    <td className="px-3 py-2">{servicioSeleccionado.modalidad_servicio || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Origen</td>
                    <td className="px-3 py-2">{servicioSeleccionado.origen}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Destino</td>
                    <td className="px-3 py-2">{servicioSeleccionado.destino}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Zona</td>
                    <td className="px-3 py-2">{servicioSeleccionado.zona}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan="2" className="px-3 py-2 font-semibold text-gray-900">
                      Vehículo y Conductor
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Placa</td>
                    <td className="px-3 py-2">{servicioSeleccionado.flota?.placa || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Marca / Modelo</td>
                    <td className="px-3 py-2">
                      {servicioSeleccionado.flota?.marca || ''} {servicioSeleccionado.flota?.modelo || ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Tipo Vehículo</td>
                    <td className="px-3 py-2">{servicioSeleccionado.flota?.tipo_vehiculo || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Conductor</td>
                    <td className="px-3 py-2">
                      {servicioSeleccionado.conductor?.[0]?.nombres_completos || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Auxiliar</td>
                    <td className="px-3 py-2">
                      {servicioSeleccionado.auxiliar?.[0]?.nombres_completos || 'Sin auxiliar'}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan="2" className="px-3 py-2 font-semibold text-gray-900">
                      Capacidad y Documentos
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Capacidad</td>
                    <td className="px-3 py-2">
                      {servicioSeleccionado.m3} m³ / {servicioSeleccionado.tn} TN
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">GIA RR</td>
                    <td className="px-3 py-2">{servicioSeleccionado.gia_rr || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">GIA RT</td>
                    <td className="px-3 py-2">{servicioSeleccionado.gia_rt || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Estado</td>
                    <td className="px-3 py-2">{servicioSeleccionado.estado}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Botón para ver detalles completos */}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => {
                  handleCloseResumenModal();
                  handleView(servicioSeleccionado);
                }}
                variant="secondary"
                size="small"
              >
                Ver Detalles Completos
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(Servicios);