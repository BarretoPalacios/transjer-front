import React, { useState, useCallback, useEffect } from 'react';
import {
  Truck,
  Filter,
  Calendar,
  DollarSign,
  RefreshCw,
  X,
  CheckCircle,
  TrendingUp,
  Search,
  Building,
  FileText,
  Download,
  Loader,
  MapPin,
  User,
  CreditCard
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Pagination from '../../../components/common/Pagination/Pagination';

// API
import { gerenciaServiceAPI } from '../../../api/endpoints/gerenciaService';
import utilsAPI from '../../../api/endpoints/utils';

const MonitoreoProveedores = () => {
  const [data, setData] = useState({
    paginacion: {
      total_registros: 0,
      total_paginas: 0,
      pagina_actual: 1,
      limite_por_pagina: 10
    },
    resultados: []
  });
  
  const [proveedores, setProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
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
    proveedor_id: '',
    fecha_inicio: '',
    fecha_fin: ''
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
      
      fetchFletes(1, pagination.itemsPerPage, filters);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters.proveedor_id, filters.fecha_inicio, filters.fecha_fin]);

  // Cargar proveedores
  const cargarProveedores = useCallback(async () => {
    try {
      const response = await utilsAPI.getProveedoresList ();
      setProveedores(response || []);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
      setError('Error al cargar la lista de proveedores');
    }
  }, []);

  // Función principal para cargar fletes
  const fetchFletes = useCallback(
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
          pagina: page,
          limite: itemsPerPage
        };
        
        if (filtersToUse.proveedor_id) {
          apiFilters.proveedor_id = filtersToUse.proveedor_id;
        }
        
        if (filtersToUse.fecha_inicio) {
          apiFilters.fecha_inicio = filtersToUse.fecha_inicio;
        }
        
        if (filtersToUse.fecha_fin) {
          apiFilters.fecha_fin = filtersToUse.fecha_fin;
        }
        
        // Llamar a la API de fletes
        const response = await gerenciaServiceAPI.getFletesProveedores(apiFilters);
        
        setData(response);
        
        setPagination({
          currentPage: response.paginacion.pagina_actual,
          itemsPerPage: response.paginacion.limite_por_pagina,
          totalItems: response.paginacion.total_registros,
          totalPages: response.paginacion.total_paginas,
          hasNext: response.paginacion.pagina_actual < response.paginacion.total_paginas,
          hasPrev: response.paginacion.pagina_actual > 1,
        });
        
      } catch (err) {
        setError('Error al cargar los fletes: ' + (err.message || 'Error desconocido'));
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
      proveedor_id: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
    setErrors({
      fecha_inicio: '',
      fecha_fin: '',
      rango_fechas: ''
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchFletes(newPage, pagination.itemsPerPage, filters);
    },
    [fetchFletes, pagination.itemsPerPage, filters]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchFletes(1, newItemsPerPage, filters);
    },
    [fetchFletes, filters]
  );

  // Exportar a Excel
  const handleExportarExcel = useCallback(async () => {
    try {
      setLoadingDownload(true);
      
      const apiFilters = {};
      
      if (filters.proveedor_id) {
        apiFilters.proveedor_id = filters.proveedor_id;
      }
      if (filters.fecha_inicio) {
        apiFilters.fecha_inicio = filters.fecha_inicio;
      }
      if (filters.fecha_fin) {
        apiFilters.fecha_fin = filters.fecha_fin;
      }
      
      const blob = await gerenciaServiceAPI.exportFletesExcel(apiFilters);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `fletes_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      setSuccessMessage('Exportación completada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      setError('Error al exportar: ' + err.message);
    } finally {
      setLoadingDownload(false);
    }
  }, [filters]);

  // Formatear moneda
  const formatMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor || 0);
  };

  // Formatear fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado) => {
    const estados = {
      'PENDIENTE': { color: 'text-yellow-800', bg: 'bg-yellow-100', icon: '⏳' },
      'PAGADO': { color: 'text-green-800', bg: 'bg-green-100', icon: '✅' },
      'VENCIDO': { color: 'text-red-800', bg: 'bg-red-100', icon: '⚠️' },
      'ANULADO': { color: 'text-gray-800', bg: 'bg-gray-100', icon: '❌' }
    };
    
    const style = estados[estado] || { color: 'text-blue-800', bg: 'bg-blue-100', icon: '📄' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.color}`}>
        <span className="mr-1">{style.icon}</span>
        {estado}
      </span>
    );
  };

  // Mostrar loading solo en carga inicial
  if (isLoading && data.resultados.length === 0) {
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
            Monitoreo de Fletes
          </h1>
          <p className="text-gray-600 mt-1">
            Visualización y seguimiento de fletes por proveedor y rango de fechas
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
              value={filters.proveedor_id}
              onChange={(e) => handleFilterChange('proveedor_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor} value={proveedor}>
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

      {/* Tabla de Fletes - Estilo Excel */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  CÓDIGO FLETE
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  CÓDIGO SERVICIO
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  PROVEEDOR
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  CLIENTE
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  FECHA SERVICIO
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  ORIGEN
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  DESTINO
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  VEHÍCULO
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  CONDUCTOR
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  M³ / TN
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  ESTADO
                </th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700 whitespace-nowrap">
                  MONTO FLETE
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  FACTURA
                </th>
                <th className="py-3 px-4 text-center font-semibold text-gray-700 whitespace-nowrap">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {data.resultados.map((item, index) => (
                <tr 
                  key={`${item.flete._id}-${index}`} 
                  className="border-b border-gray-200 hover:bg-blue-50"
                >
                  {/* Código Flete */}
                  <td className="px-4 py-3 font-mono text-xs font-medium">
                    {item.flete.codigo_flete}
                  </td>

                  {/* Código Servicio */}
                  <td className="px-4 py-3 font-mono text-xs">
                    {item.servicio.codigo_servicio_principal}
                  </td>

                  {/* Proveedor */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {item.servicio.proveedor.nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      RUC: {item.servicio.proveedor.ruc}
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {item.servicio.cliente.nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      RUC: {item.servicio.cliente.ruc}
                    </div>
                  </td>

                  {/* Fecha Servicio */}
                  <td className="px-4 py-3 text-xs">
                    {formatFecha(item.servicio.fecha_servicio)}
                  </td>

                  {/* Origen */}
                  <td className="px-4 py-3 text-xs max-w-[150px] truncate" title={item.servicio.origen}>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                      <span className="truncate">{item.servicio.origen}</span>
                    </div>
                  </td>

                  {/* Destino */}
                  <td className="px-4 py-3 text-xs max-w-[150px] truncate" title={item.servicio.destino}>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                      <span className="truncate">{item.servicio.destino}</span>
                    </div>
                  </td>

                  {/* Vehículo */}
                  <td className="px-4 py-3 text-xs">
                    <div className="font-mono">{item.servicio.flota.placa}</div>
                    <div className="text-gray-500 text-xs">{item.servicio.flota.marca} {item.servicio.flota.modelo}</div>
                  </td>

                  {/* Conductor */}
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center">
                      <User className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                      <span>
                        {item.servicio.conductor[0]?.nombres_completos || 
                         item.servicio.conductor[0]?.nombre || 
                         item.servicio.flota.nombre_conductor || '-'}
                      </span>
                    </div>
                    {item.servicio.conductor[0]?.dni && (
                      <div className="text-gray-500 text-xs">DNI: {item.servicio.conductor[0].dni}</div>
                    )}
                  </td>

                  {/* M³ / TN */}
                  <td className="px-4 py-3 text-xs">
                    {item.servicio.m3} m³ / {item.servicio.tn} tn
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    {getEstadoBadge(item.flete.estado_flete)}
                  </td>

                  {/* Monto Flete */}
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    {formatMoneda(item.flete.monto_flete)}
                  </td>

                  {/* Factura */}
                  <td className="px-4 py-3 text-xs">
                    {item.flete.codigo_factura ? (
                      <div className="flex items-center">
                        <FileText className="h-3 w-3 text-gray-400 mr-1" />
                        {item.flete.codigo_factura}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => window.location.href = `/gerencia/fletes/${item.flete._id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}

              {/* Fila de totales */}
              {data.resultados.length > 0 && (
                <tr className="bg-gray-50 border-t-2 border-gray-300 font-medium">
                  <td colSpan="11" className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    TOTAL GENERAL:
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">
                    {formatMoneda(data.resultados.reduce((sum, item) => sum + (item.flete.monto_flete || 0), 0))}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {data.resultados.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron fletes</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f)
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay fletes disponibles para mostrar'}
            </p>
            {Object.values(filters).some(f => f) && (
              <Button onClick={clearFilters} size="small">
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Paginación y registros por página */}
      {data.resultados.length > 0 && (
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

      {/* Información de registros */}
      {data.resultados.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {data.resultados.length} de {pagination.totalItems} registros
          {filters.proveedor_id && ' · Filtrado por proveedor específico'}
          {(filters.fecha_inicio || filters.fecha_fin) && ' · Filtrado por rango de fechas'}
        </div>
      )}
    </div>
  );
};

export default MonitoreoProveedores;