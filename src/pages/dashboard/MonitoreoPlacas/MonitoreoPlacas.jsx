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
  Download,
  Printer,
  Search
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Pagination from '../../../components/common/Pagination/Pagination';

// API
import { gerenciaServiceAPI } from '../../../api/endpoints/gerenciaService';


const MonitoreoPlacas = () => {
  const [data, setData] = useState({
    resumen: {
      total_placas: 0,
      total_servicios: 0,
      total_vendido: 0
    },
    filtros_aplicados: {
      placa: null,
      fecha_inicio: null,
      fecha_fin: null
    },
    detalle_por_placa: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
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
    placa: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  
  // Estados para errores de validación
  const [errors, setErrors] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    rango_fechas: ''
  });
  
  // Sugerencias de placas
  const [placasSugerencias, setPlacasSugerencias] = useState([]);
  
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const itemsPerPageOptions = [10, 20, 30, 50];

  // Función principal para cargar datos
  const fetchResumen = useCallback(
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
      
      if (filtersToUse.fecha_inicio && !gerenciaServiceAPI.validarFecha(filtersToUse.fecha_inicio)) {
        validationErrors.fecha_inicio = 'Formato de fecha inválido. Use YYYY-MM-DD';
      }
      
      if (filtersToUse.fecha_fin && !gerenciaServiceAPI.validarFecha(filtersToUse.fecha_fin)) {
        validationErrors.fecha_fin = 'Formato de fecha inválido. Use YYYY-MM-DD';
      }
      
      if (filtersToUse.fecha_inicio && filtersToUse.fecha_fin && 
          !gerenciaServiceAPI.validarRangoFechas(filtersToUse.fecha_inicio, filtersToUse.fecha_fin)) {
        validationErrors.rango_fechas = 'La fecha de inicio no puede ser mayor a la fecha de fin';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }
      
      try {
        // Preparar filtros para API
        const cleanFilters = {};
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            cleanFilters[key] = value.trim();
          }
        });
        
        const response = await gerenciaServiceAPI.getResumenPorPlaca(cleanFilters);
        
        // Calcular paginación
        const totalItems = response.detalle_por_placa?.length || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Calcular índices para la página actual
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Obtener elementos de la página actual
        const paginatedItems = response.detalle_por_placa?.slice(startIndex, endIndex) || [];
        
        setData({
          ...response,
          detalle_por_placa: paginatedItems
        });
        
        setPagination({
          currentPage: page,
          itemsPerPage: itemsPerPage,
          totalItems: totalItems,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        });
        
      } catch (err) {
        setError('Error al cargar el resumen: ' + (err.message || 'Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Efecto para búsqueda en tiempo real con debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      fetchResumen(1, pagination.itemsPerPage, filters);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchResumen();
    cargarPlacasSugerencias();
  }, []);

  // Cargar sugerencias de placas
  const cargarPlacasSugerencias = useCallback(async () => {
    try {
      const placas = await gerenciaServiceAPI.getPlacasSugerencias();
      setPlacasSugerencias(placas);
    } catch (err) {
      console.error('Error cargando sugerencias de placas:', err);
    }
  }, []);

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Handler para seleccionar fecha automáticamente
  const handleSelectToday = useCallback((field) => {
    const today = new Date().toISOString().split('T')[0];
    handleFilterChange(field, today);
  }, [handleFilterChange]);

  const clearFilters = useCallback(() => {
    setFilters({
      placa: '',
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
    fetchResumen(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchResumen, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchResumen(newPage, pagination.itemsPerPage, filters);
    },
    [fetchResumen, pagination.itemsPerPage, filters]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchResumen(1, newItemsPerPage, filters);
    },
    [fetchResumen, filters]
  );

  // Función para exportar a Excel
  const handleExportExcel = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Aquí iría la lógica para exportar a Excel
      // Por ahora solo mostramos un mensaje
      setSuccessMessage('Función de exportación a Excel implementada en el backend');
    } catch (err) {
      setError('Error al exportar: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Formatear moneda
  const formatMoneda = (valor) => {
    return gerenciaServiceAPI.formatMoneda(valor);
  };

  // Mostrar loading solo en carga inicial
  if (isLoading && data.detalle_por_placa.length === 0) {
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
            Resumen por Placa
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis de servicios y ventas por vehículo
          </p>
        </div>
      </div>

      {/* Panel de Resumen General */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-blue-300 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Placas</p>
              <p className="text-2xl font-bold text-blue-700">{data.resumen.total_placas}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-green-300 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Servicios</p>
              <p className="text-2xl font-bold text-green-700">{data.resumen.total_servicios}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-300 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Vendido</p>
              <p className="text-2xl font-bold text-purple-700">{formatMoneda(data.resumen.total_vendido)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
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

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros de Búsqueda
            </h3>
            <p className="text-sm text-gray-600">Filtrado en tiempo real (debounce 500ms)</p>
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

        {/* Filtros en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Placa del Vehículo
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.placa}
                onChange={(e) => handleFilterChange('placa', e.target.value.toUpperCase())}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm uppercase"
                placeholder="Ej: ABC-123"
                list="placas-sugerencias"
              />
              <datalist id="placas-sugerencias">
                {placasSugerencias.map((placa, index) => (
                  <option key={index} value={placa} />
                ))}
              </datalist>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Deje vacío para ver todas las placas
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
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 border border-gray-300"
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
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 border border-gray-300"
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

      {/* Tabla de Detalle por Placa */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  PLACA
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  TOTAL DE SERVICIOS
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  TOTAL VENDIDO
                </th>
                {/* <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  SERVICIOS DISTINTOS
                </th> */}
                {/* <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  FLETES ASOCIADOS
                </th> */}
              </tr>
            </thead>
            <tbody>
              {data.detalle_por_placa.map((item, index) => (
                <tr 
                  key={`${item.placa}-${index}`} 
                  className="border-b border-gray-200 hover:bg-blue-50"
                >
                  {/* Placa */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900 text-lg">
                      {item.placa}
                    </div>
                  </td>

                  {/* Total de Servicios */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full mr-2">
                        {item.total_servicios}
                      </span>
                     
                     
                    </div>
                  </td>

                  {/* Total Vendido */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-green-700">
                      {formatMoneda(item.total_vendido)}
                    </div>
                  </td>

                  {/* Servicios Distintos */}
                  {/* <td className="px-4 py-3">
                    <div className="text-gray-900 text-center">
                      {item.cantidad_servicios_distintos}
                    </div>
                  </td> */}

                  {/* Fletes Asociados */}
                  {/* <td className="px-4 py-3">
                    <div className="text-gray-900 text-center">
                      {item.cantidad_fletes}
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {data.detalle_por_placa.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f && f.trim() !== '')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay datos disponibles para mostrar'}
            </p>
            {Object.values(filters).some(f => f && f.trim() !== '') && (
              <Button onClick={clearFilters} size="small">
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Paginación y registros por página */}
      {data.detalle_por_placa.length > 0 && (
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

      {/* Información de filtros aplicados */}
      {Object.values(data.filtros_aplicados).some(f => f !== null) && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Filtros Aplicados:</h4>
          <div className="text-sm text-gray-600">
            {data.filtros_aplicados.placa && (
              <p>• Placa: <span className="font-medium">{data.filtros_aplicados.placa}</span></p>
            )}
            {data.filtros_aplicados.fecha_inicio && (
              <p>• Fecha Inicio: <span className="font-medium">
                {gerenciaServiceAPI.formatFechaDisplay(data.filtros_aplicados.fecha_inicio)}
              </span></p>
            )}
            {data.filtros_aplicados.fecha_fin && (
              <p>• Fecha Fin: <span className="font-medium">
                {gerenciaServiceAPI.formatFechaDisplay(data.filtros_aplicados.fecha_fin)}
              </span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoreoPlacas;