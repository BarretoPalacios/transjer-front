import React, { useState, useCallback, useEffect } from 'react';
import {
  Truck,
  Filter,
  Calendar,
  RefreshCw,
  X,
  CheckCircle,
  Search,
  Building,
  Download,
  Loader,
  MapPin,
  User,
  Package,
  Car,
  FileText,
  Clock,
  Hash,
  CalendarDays,
  DollarSign
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Pagination from '../../../components/common/Pagination/Pagination';

// API
import { serviciosPrincipalesAPI } from '../../../api/endpoints/servicioPrincipal';
import utilsAPI from '../../../api/endpoints/utils';

const MonitoreoProveedores = () => {
  const [serviciosData, setServiciosData] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Estado para los montos por servicio
  const [montos, setMontos] = useState({});
  
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
    fecha_inicio: '',
    fecha_fin: '',
    proveedor_nombre: ''
  });
  
  // Estados para errores de validación
  const [errors, setErrors] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    rango_fechas: ''
  });
  
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const itemsPerPageOptions = [10, 20, 30, 50, 100];

  // Cargar proveedores al montar el componente
  useEffect(() => {
    cargarProveedores();
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      fetchServiciosPrincipales(1, pagination.itemsPerPage, filters);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters.fecha_inicio, filters.fecha_fin, filters.proveedor_nombre]);

  // Cargar proveedores
  const cargarProveedores = useCallback(async () => {
    try {
      const response = await utilsAPI.getProveedoresList();
      setProveedores(response || []);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
      setError('Error al cargar la lista de proveedores');
    }
  }, []);

  // Función principal para cargar servicios principales
  const fetchServiciosPrincipales = useCallback(
    async (page = 1, itemsPerPage = pagination.itemsPerPage, filtersToUse = filters) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      setErrors({
        fecha_inicio: '',
        fecha_fin: '',
        rango_fechas: ''
      });
      
      // Validar fechas
      const validationErrors = {};
      
      if (filtersToUse.fecha_inicio && filtersToUse.fecha_fin) {
        if (filtersToUse.fecha_inicio > filtersToUse.fecha_fin) {
          validationErrors.rango_fechas = 'La fecha de inicio no puede ser mayor a la fecha de fin';
        }
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }
      
      try {
        // Preparar filtros para API
        const apiFilters = {
          page: page,
          page_size: itemsPerPage
        };
        
        // Solo enviar filtros que tengan valor
        if (filtersToUse.fecha_inicio) {
          apiFilters.fecha_inicio = filtersToUse.fecha_inicio;
        }
        
        if (filtersToUse.fecha_fin) {
          apiFilters.fecha_fin = filtersToUse.fecha_fin;
        }
        
        if (filtersToUse.proveedor_nombre && filtersToUse.proveedor_nombre.trim() !== '') {
          apiFilters.proveedor_nombre = filtersToUse.proveedor_nombre.trim();
        }
        
        // Llamar a la API de servicios principales
        const response = await serviciosPrincipalesAPI.getAllServiciosPrincipales(apiFilters);
        
        setServiciosData(response.data || []);
        
        setPagination({
          currentPage: response.pagination.page,
          itemsPerPage: response.pagination.page_size,
          totalItems: response.pagination.total,
          totalPages: response.pagination.total_pages,
          hasNext: response.pagination.has_next,
          hasPrev: response.pagination.has_prev,
        });
        
      } catch (err) {
        setError('Error al cargar los servicios: ' + (err.message || 'Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Limpiar errores específicos
    if (key === 'fecha_inicio' || key === 'fecha_fin') {
      setErrors(prev => ({
        ...prev,
        [key]: '',
        rango_fechas: ''
      }));
    }
  }, []);

  // Handler para seleccionar fecha automáticamente
  const handleSelectToday = useCallback((field) => {
    const today = new Date().toISOString().split('T')[0];
    handleFilterChange(field, today);
  }, [handleFilterChange]);

  const clearFilters = useCallback(() => {
    setFilters({
      fecha_inicio: '',
      fecha_fin: '',
      proveedor_nombre: ''
    });
    setErrors({
      fecha_inicio: '',
      fecha_fin: '',
      rango_fechas: ''
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchServiciosPrincipales(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchServiciosPrincipales, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchServiciosPrincipales(newPage, pagination.itemsPerPage, filters);
    },
    [fetchServiciosPrincipales, pagination.itemsPerPage, filters]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchServiciosPrincipales(1, newItemsPerPage, filters);
    },
    [fetchServiciosPrincipales, filters]
  );

  // Handler para cambio de monto
  const handleMontoChange = useCallback((servicioId, value) => {
    setMontos(prev => ({
      ...prev,
      [servicioId]: value
    }));
  }, []);

  // Handler para enviar monto (solo lógica, no envía a API aún)
  const handleEnviarMonto = useCallback((servicioId, e) => {
    e.stopPropagation();
    const monto = montos[servicioId];
    console.log('Enviar monto para servicio:', servicioId, 'Monto:', monto);
    // Aquí iría la llamada a la API
  }, [montos]);

  // Exportar a Excel
  const handleExportarExcel = useCallback(async () => {
    try {
      setLoadingDownload(true);
      
      const filtersForAPI = {};
      
      // Solo enviar filtros que tengan valor
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          filtersForAPI[key] = value.trim();
        }
      });
      
      const blob = await serviciosPrincipalesAPI.exportServiciosExcel(filtersForAPI);
      
      // Usar el método downloadExcel de la API
      serviciosPrincipalesAPI.downloadExcel(
        blob, 
        `servicios_principales_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      
      setSuccessMessage('Exportación completada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      setError('Error al exportar: ' + err.message);
      console.error('Error exporting servicios:', err);
    } finally {
      setLoadingDownload(false);
    }
  }, [filters]);

  // Funciones auxiliares para estados y badges
  const getEstadoIcon = (estado) => {
    const iconMap = {
      'Programado': Clock,
      'En Proceso': Truck,
      'Completado': CheckCircle,
      'Cancelado': X
    };
    return iconMap[estado] || Clock;
  };

  const getEstadoBadgeClass = (estado) => {
    const classMap = {
      'Programado': 'bg-yellow-100 text-yellow-800',
      'En Proceso': 'bg-blue-100 text-blue-800',
      'Completado': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800'
    };
    return classMap[estado] || 'bg-gray-100 text-gray-800';
  };

  const puedeCambiarEstado = (servicio) => {
    return servicio.estado === 'Programado' || servicio.estado === 'En Proceso';
  };

  // Handlers para acciones
  const handleRowClick = (servicio) => {
    console.log('Fila clickeada:', servicio);
  };

  const handleAbrirCambioEstado = (servicio, e) => {
    e.stopPropagation();
    console.log('Cambiar estado:', servicio);
  };

  const handleCreate = () => {
    console.log('Crear nuevo servicio');
  };

  const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "N/A";
  // Si viene como objeto de Mongo, extraemos el string
  const date = typeof fechaStr === 'object' ? fechaStr.$date : fechaStr;
  
  // Dividimos "2026-02-03..." por el guion y tomamos solo los primeros 3 elementos
  const [year, month, day] = date.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

  // Mostrar loading solo en carga inicial
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
          <h1 className="text-2xl font-bold text-gray-900">
            Monitoreo de Proveedores
          </h1>
          <p className="text-gray-600 mt-1">
            Visualización y seguimiento de servicios por proveedor y rango de fechas
          </p>
        </div>
        
        {/* Botón de exportación */}
        <button
          onClick={handleExportarExcel}
          disabled={loadingDownload}
          className="mt-4 lg:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {loadingDownload ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Exportar a Excel
            </>
          )}
        </button>
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

            <Button
              onClick={clearFilters}
              variant="secondary"
              size="small"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Proveedor - Ahora es un select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Proveedor
            </label>
            <select
              value={filters.proveedor_nombre}
              onChange={(e) => handleFilterChange('proveedor_nombre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map((proveedor, index) => (
                <option key={index} value={proveedor}>
                  {proveedor}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Seleccione un proveedor para filtrar
            </p>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Inicio Servicio
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.fecha_inicio}
                onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                max={filters.fecha_fin || new Date().toISOString().split('T')[0]}
              />
              <button
                onClick={() => handleSelectToday('fecha_inicio')}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 border border-gray-300 whitespace-nowrap"
                type="button"
              >
                Hoy
              </button>
            </div>
            {errors.fecha_inicio && (
              <p className="text-xs text-red-600 mt-1">{errors.fecha_inicio}</p>
            )}
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Fin Servicio
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.fecha_fin}
                onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                min={filters.fecha_inicio}
                max={new Date().toISOString().split('T')[0]}
              />
              <button
                onClick={() => handleSelectToday('fecha_fin')}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 border border-gray-300 whitespace-nowrap"
                type="button"
              >
                Hoy
              </button>
            </div>
            {errors.fecha_fin && (
              <p className="text-xs text-red-600 mt-1">{errors.fecha_fin}</p>
            )}
          </div>
        </div>

        {/* Error de rango de fechas */}
        {errors.rango_fechas && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">{errors.rango_fechas}</p>
          </div>
        )}

        {/* Contador de filtros activos */}
        {Object.values(filters).some(f => f) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                Filtros activos: 
                <span className="font-medium text-blue-600 ml-2">
                  {Object.values(filters).filter(f => f).length}
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

      {/* Información de registros */}
      {serviciosData.length > 0 && (
        <div className="m-4 text-sm text-gray-600 text-center">
          Mostrando {serviciosData.length} de {pagination.totalItems} registros
          {filters.proveedor_nombre && ' · Filtrado por proveedor'}
          {(filters.fecha_inicio || filters.fecha_fin) && ' · Filtrado por rango de fechas'}
        </div>
      )}

      {/* Tabla de Servicios */}
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
                {/* <th className="py-2 px-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Monto
                  </div>
                </th> */}
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
                       F. Servicio: {formatearFecha(servicio.fecha_servicio)}
                      </div>
                      <div className="font-medium text-gray-900">
                       F. Salida: {formatearFecha(servicio.fecha_salida)}
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
                        {Array.isArray(servicio.conductor) 
                          ? (servicio.conductor[0]?.nombre || servicio.conductor[0]?.nombres_completos || 'N/A')
                          : (servicio.conductor?.nombre || servicio.conductor?.nombres_completos || 'N/A')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Aux: {Array.isArray(servicio.auxiliar) 
                          ? (servicio.auxiliar[0]?.nombres_completos || 'Sin auxiliar')
                          : (servicio.auxiliar?.nombres_completos || 'Sin auxiliar')}
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

                    {/* Monto - Input y botón */}
                    {/* <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 min-w-[140px]">
                        <div className="relative flex-1">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            value={montos[servicio.id] || ''}
                            onChange={(e) => handleMontoChange(servicio.id, e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <button
                          onClick={(e) => handleEnviarMonto(servicio.id, e)}
                          className="px-2 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition whitespace-nowrap"
                        >
                          Enviar
                        </button>
                      </div>
                    </td> */}
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

      
    </div>
  );
};

export default MonitoreoProveedores;