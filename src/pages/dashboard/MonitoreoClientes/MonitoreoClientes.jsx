import React, { useState, useCallback, useEffect } from 'react';
import {
  Filter,
  Calendar,
  DollarSign,
  RefreshCw,
  X,
  CheckCircle,
  Search,
  User,
  Percent,
  FileText,
  Eye
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Pagination from '../../../components/common/Pagination/Pagination';

// API
import { gerenciaServiceAPI } from '../../../api/endpoints/gerenciaService';

const MonitoreoClientes = () => {
  const [data, setData] = useState({
    resumen_general: {
      clientes_activos: 0,
      gran_total_facturado: 0,
      gran_total_detraccion: 0,
      gran_total_neto: 0,
      gran_total_neto_pagado: 0,
      gran_total_neto_pendiente: 0,
      gran_total_neto_vencido: 0,
      gran_total_neto_por_vencer: 0
    },
    detalle_por_cliente: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 50,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    cliente: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  
  // Estados para errores de validación
  const [errors, setErrors] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    rango_fechas: ''
  });
  
  // Sugerencias de clientes
  const [clientesSugerencias, setClientesSugerencias] = useState([]);
  
  // Modal de facturas
  const [showFacturasModal, setShowFacturasModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  
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
        
        // Llamar a la API específica para clientes
        const response = await gerenciaServiceAPI.getResumenPorCliente(cleanFilters);
        
        // Calcular paginación
        const totalItems = response.detalle_por_cliente?.length || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Calcular índices para la página actual
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Obtener elementos de la página actual
        const paginatedItems = response.detalle_por_cliente?.slice(startIndex, endIndex) || [];
        
        setData({
          resumen_general: response.resumen_general || {
            clientes_activos: 0,
            gran_total_facturado: 0,
            gran_total_detraccion: 0,
            gran_total_neto: 0,
            gran_total_neto_pagado: 0,
            gran_total_neto_pendiente: 0,
            gran_total_neto_vencido: 0,
            gran_total_neto_por_vencer: 0
          },
          detalle_por_cliente: paginatedItems
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

  // Cargar datos iniciales
  useEffect(() => {
    fetchResumen();
    cargarClientesSugerencias();
  }, []);

  // Cargar sugerencias de clientes
  const cargarClientesSugerencias = useCallback(async () => {
    try {
      const clientes = await gerenciaServiceAPI.getClientesSugerencias();
      setClientesSugerencias(clientes);
    } catch (err) {
      console.error('Error cargando sugerencias de clientes:', err);
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

  // Función para aplicar filtros
  const aplicarFiltros = useCallback(() => {
    fetchResumen(1, pagination.itemsPerPage, filters);
  }, [fetchResumen, pagination.itemsPerPage, filters]);

  const clearFilters = useCallback(() => {
    setFilters({
      cliente: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
    setErrors({
      fecha_inicio: '',
      fecha_fin: '',
      rango_fechas: ''
    });
    fetchResumen(1, pagination.itemsPerPage, filters);
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

  // Formatear moneda
  const formatMoneda = (valor) => {
    return gerenciaServiceAPI.formatMoneda(valor);
  };

  // Función para calcular porcentaje
  const calcularPorcentaje = (parcial, total) => {
    if (total === 0) return 0;
    return ((parcial / total) * 100).toFixed(1);
  };

  // Función para abrir modal de facturas
  const abrirModalFacturas = useCallback((cliente) => {
    setClienteSeleccionado(cliente);
    setShowFacturasModal(true);
  }, []);

  // Función para cerrar modal
  const cerrarModal = useCallback(() => {
    setShowFacturasModal(false);
    setClienteSeleccionado(null);
  }, []);

  // Mostrar loading solo en carga inicial
  if (isLoading && data.detalle_por_cliente.length === 0) {
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
            Monitoreo de Facturación por Cliente
          </h1>
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

      {/* Resumen General Acumulado - TODOS LOS CAMPOS */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Clientes Activos</p>
            <p className="text-xl font-bold text-blue-700">
              {data.resumen_general.clientes_activos}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Facturado Bruto</p>
            <p className="text-xl font-bold text-gray-900">
              {formatMoneda(data.resumen_general.gran_total_facturado)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Detracción</p>
            <p className="text-xl font-bold text-gray-900">
              {formatMoneda(data.resumen_general.gran_total_detraccion)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Pendiente Cobrar</p>
            <p className="text-xl font-bold text-purple-700">
              {formatMoneda(data.resumen_general.gran_total_neto)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Cobrado</p>
            <p className="text-xl font-bold text-green-700">
              {formatMoneda(data.resumen_general.gran_total_neto_pagado)}
            </p>
            {data.resumen_general.gran_total_neto > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {calcularPorcentaje(data.resumen_general.gran_total_neto_pagado, data.resumen_general.gran_total_neto)}% del total
              </p>
            )}
          </div>
          {/* <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Neto Pendiente</p>
            <p className="text-xl font-bold text-amber-700">
              {formatMoneda(data.resumen_general.gran_total_neto_pendiente)}
            </p>
            {data.resumen_general.gran_total_neto > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {calcularPorcentaje(data.resumen_general.gran_total_neto_pendiente, data.resumen_general.gran_total_neto)}% del total
              </p>
            )}
          </div> */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Vencido</p>
            <p className={`text-xl font-bold ${data.resumen_general.gran_total_neto_vencido > 0 ? 'text-red-700' : 'text-gray-700'}`}>
              {formatMoneda(data.resumen_general.gran_total_neto_vencido)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total por Vencer</p>
            <p className="text-xl font-bold text-gray-900">
              {formatMoneda(data.resumen_general.gran_total_neto_por_vencer)}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros de Búsqueda
            </h3>
            <p className="text-sm text-gray-600">Seleccione los filtros y presione "Aplicar Filtros"</p>
          </div>
          
          <div className="flex items-center space-x-2">
            

            <Button
              onClick={aplicarFiltros}
              variant="primary"
              size="small"
              icon={Filter}
            >
              Aplicar Filtros
            </Button>

            <Button
              onClick={clearFilters}
              variant="secondary"
              size="small"
            >
              Limpiar Filtros
            </Button>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="small"
              icon={RefreshCw}
              isLoading={isLoading}
            >
              Recargar data
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre del Cliente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.cliente}
                onChange={(e) => handleFilterChange('cliente', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Ej: ALICORP, GLORIA"
                list="clientes-sugerencias"
              />
              <datalist id="clientes-sugerencias">
                {clientesSugerencias.map((cliente, index) => (
                  <option key={index} value={cliente} />
                ))}
              </datalist>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Deje vacío para ver todos los clientes
            </p>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Emision (Desde)
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.fecha_inicio}
                onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                // max={filters.fecha_fin || new Date().toISOString().split('T')[0]}
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
              Fecha Emision (Hasta)
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.fecha_fin}
                onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                min={filters.fecha_inicio}
                // max={new Date().toISOString().split('T')[0]}
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
                Filtros configurados: 
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

      {/* Tabla de Detalle por Cliente */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  CLIENTE
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  FACTURAS
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  FACTURADO
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  DETRACCIÓN
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  PENDIENTE COBRAR
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  COBRADO
                </th>
                {/* <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  PENDIENTE
                </th> */}
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  VENCIDO
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  POR VENCER
                </th>
                {/* <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  MOROSIDAD
                </th> */}
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {data.detalle_por_cliente.map((item, index) => (
                <tr 
                  key={`${item.cliente}-${index}`} 
                  className="border-b border-gray-200 hover:bg-blue-50"
                >
                  {/* Cliente */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">
                      {item.cliente || "CLIENTE SIN NOMBRE"}
                    </div>
                  </td>

                  {/* Número de Facturas */}
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold mr-2">
                        {item.nro_facturas}
                      </span>
                    </div>
                  </td>

                  {/* Facturado */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">
                      {formatMoneda(item.facturado)}
                    </div>
                  </td>

                  {/* Detracción */}
                  <td className="px-4 py-3">
                    <div className="text-gray-700">
                      {formatMoneda(item.detraccion)}
                    </div>
                  </td>

                  {/* Neto Total */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-purple-700">
                      {formatMoneda(item.neto_total)}
                    </div>
                  </td>

                  {/* Neto Pagado */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-green-700">
                        {formatMoneda(item.neto_pagado)}
                      </span>
                      {/* {item.neto_total > 0 && (
                        <span className="text-xs text-gray-500 mt-1">
                          {calcularPorcentaje(item.neto_pagado, item.neto_total)}%
                        </span>
                      )} */}
                    </div>
                  </td>

                  {/* Neto Pendiente */}
                  {/* <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-amber-700">
                        {formatMoneda(item.neto_pendiente)}
                      </span>
                      {item.neto_total > 0 && (
                        <span className="text-xs text-gray-500 mt-1">
                          {calcularPorcentaje(item.neto_pendiente, item.neto_total)}%
                        </span>
                      )}
                    </div>
                  </td> */}

                  {/* Neto Vencido */}
                  <td className="px-4 py-3">
                    <div className={item.neto_vencido > 0 ? "text-red-700 font-bold" : "text-gray-500"}>
                      {formatMoneda(item.neto_vencido)}
                    </div>
                  </td>

                  {/* Neto por Vencer */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">
                      {formatMoneda(item.neto_por_vencer)}
                    </div>
                  </td>

                  {/* Porcentaje de Morosidad */}
                  {/* <td className="px-4 py-3">
                    <div className={`flex items-center ${item.porcentaje_morosidad > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      <Percent className="h-4 w-4 mr-1" />
                      <span className="font-bold">
                        {item.porcentaje_morosidad}%
                      </span>
                    </div>
                  </td> */}

                  {/* Acciones - Botón Ver Facturas */}
                  <td className="px-4 py-3">
                    <Button
                      onClick={() => abrirModalFacturas(item)}
                      variant="outline"
                      size="small"
                      icon={Eye}
                    >
                      Ver Facturas
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {data.detalle_por_cliente.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
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
      {data.detalle_por_cliente.length > 0 && (
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

      {/* Modal para ver facturas */}
      {showFacturasModal && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Facturas del Cliente
                    </h2>
                    <p className="text-sm text-gray-600">
                      {clienteSeleccionado.cliente}
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Total Facturas</p>
                    <p className="text-xl font-bold text-blue-700">
                      {clienteSeleccionado.nro_facturas}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Facturado Total</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatMoneda(clienteSeleccionado.facturado)}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Pendiente</p>
                    <p className="text-xl font-bold text-amber-700">
                      {formatMoneda(clienteSeleccionado.neto_pendiente)}
                    </p>
                  </div>
                </div>

                <p className="text-center text-gray-500 py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <span className="block font-medium">Próximamente</span>
                  <span className="text-sm">Aquí se mostrará el listado detallado de facturas para este cliente.</span>
                </p>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-300">
              <div className="flex justify-end">
                <Button
                  onClick={cerrarModal}
                  variant="secondary"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoreoClientes;