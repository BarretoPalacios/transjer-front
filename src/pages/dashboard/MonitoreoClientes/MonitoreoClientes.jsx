import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, RefreshCw, X, CheckCircle, Eye, Download } from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Pagination from '../../../components/common/Pagination/Pagination';

// API
import { gerenciaServiceAPI } from '../../../api/endpoints/gerenciaService';

const MonitoreoClientes = () => {
  const navigate = useNavigate();
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
    mes: '',
    año: '',
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
  
  const itemsPerPageOptions = [10, 20, 30, 50];

  // Mapeo de nombres de mes a números
  const mesesANumero = {
    'Enero': 1,
    'Febrero': 2,
    'Marzo': 3,
    'Abril': 4,
    'Mayo': 5,
    'Junio': 6,
    'Julio': 7,
    'Agosto': 8,
    'Septiembre': 9,
    'Octubre': 10,
    'Noviembre': 11,
    'Diciembre': 12
  };

  // Obtener mes actual
  const obtenerMesActual = () => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[new Date().getMonth()];
  };

  // Obtener año actual
  const obtenerAñoActual = () => new Date().getFullYear().toString();

  // Inicializar filtros con mes y año actual
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      mes: obtenerMesActual(),
      año: obtenerAñoActual()
    }));
  }, []);

  // Función para obtener número del mes
  const obtenerNumeroMes = useCallback((nombreMes) => {
    return mesesANumero[nombreMes] || null;
  }, []);

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
      
      // Si hay rango de fechas específico, usar eso (tiene prioridad)
      let filtrosAPI = {};
      
      if (filtersToUse.fecha_inicio && filtersToUse.fecha_fin) {
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
        
        filtrosAPI = {
          fecha_inicio: filtersToUse.fecha_inicio,
          fecha_fin: filtersToUse.fecha_fin
        };
      } else if (filtersToUse.mes && filtersToUse.año) {
        // Si no hay rango de fechas específico, usar mes y año (convertir mes a número)
        const mesNumero = obtenerNumeroMes(filtersToUse.mes);
        if (mesNumero) {
          filtrosAPI = {
            mes: mesNumero,  // Enviar como número, no como string
            anio: parseInt(filtersToUse.año, 10)  // También enviar año como número
          };
        }
      }
      
      try {
        // Preparar filtros para API
        const cleanFilters = {};
        Object.entries(filtrosAPI).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            // Para números, asegurarnos de enviarlos como números
            if (typeof value === 'number') {
              cleanFilters[key] = value;
            } else if (typeof value === 'string' && value.trim() !== '') {
              cleanFilters[key] = value.trim();
            }
          }
        });
        console.log('Filtros enviados a la API:', cleanFilters);
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
    [obtenerNumeroMes]
  );

  // Cargar datos iniciales
  useEffect(() => {
    fetchResumen();
  }, []);

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = useCallback(() => {
    fetchResumen(1, pagination.itemsPerPage, filters);
  }, [fetchResumen, pagination.itemsPerPage, filters]);

  const clearFilters = useCallback(() => {
    setFilters({
      mes: obtenerMesActual(),
      año: obtenerAñoActual(),
      fecha_inicio: '',
      fecha_fin: ''
    });
    setErrors({
      fecha_inicio: '',
      fecha_fin: '',
      rango_fechas: ''
    });
    fetchResumen(1, pagination.itemsPerPage, {
      mes: obtenerMesActual(),
      año: obtenerAñoActual(),
      fecha_inicio: '',
      fecha_fin: ''
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

  // Formatear moneda
  const formatMoneda = (valor) => {
    return gerenciaServiceAPI.formatMoneda(valor);
  };

  // Función para navegar a detalles del cliente
  const verDetallesCliente = useCallback((cliente) => {
    // Construir query parameters
    const queryParams = new URLSearchParams();
    
    // Siempre pasar el nombre del cliente
    queryParams.append('cliente', encodeURIComponent(cliente.cliente || ''));
    
    // Si hay filtros de fecha específicos, pasarlos
    if (filters.fecha_inicio && filters.fecha_fin) {
      queryParams.append('fecha_inicio', filters.fecha_inicio);
      queryParams.append('fecha_fin', filters.fecha_fin);
      queryParams.append('filtro_tipo', 'rango_fechas');
    } else if (filters.mes && filters.año) {
      // Si hay mes y año, pasarlos como números
      const mesNumero = obtenerNumeroMes(filters.mes);
      if (mesNumero) {
        queryParams.append('mes', mesNumero.toString());  // Convertir a string para URL
        queryParams.append('año', filters.año);
        queryParams.append('filtro_tipo', 'mes_año');
      }
    }
    
    // Navegar a la ruta de detalles con todos los parámetros
    navigate(`/gerencia/detalles?${queryParams.toString()}`);
  }, [navigate, filters, obtenerNumeroMes]);

  // Función para exportar a Excel
  const handleExportarExcel = useCallback(() => {
    // Construir parámetros para exportación
    const params = {};
    
    if (filters.fecha_inicio && filters.fecha_fin) {
      params.fecha_inicio = filters.fecha_inicio;
      params.fecha_fin = filters.fecha_fin;
    } else if (filters.mes && filters.año) {
      const mesNumero = obtenerNumeroMes(filters.mes);
      if (mesNumero) {
        params.mes = mesNumero;  // Enviar como número
        params.año = parseInt(filters.año, 10);  // Enviar como número
      }
    }
    
    // Aquí iría la lógica para exportar a Excel con los parámetros
    console.log('Exportando con parámetros:', params);
    
    // Simular exportación a Excel
    const confirmExport = window.confirm(
      `¿Exportar datos a Excel?\n` +
      `Filtros aplicados:\n` +
      `${filters.fecha_inicio && filters.fecha_fin 
        ? `Rango: ${filters.fecha_inicio} a ${filters.fecha_fin}` 
        : `Mes/Año: ${filters.mes} ${filters.año}`}`
    );
    
    if (confirmExport) {
      // Aquí llamarías a la API de exportación
      alert('Exportación iniciada. Los datos se están procesando.');
    }
  }, [filters, obtenerNumeroMes]);

  // Mostrar loading solo en carga inicial
  if (isLoading && data.detalle_por_cliente.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Resumen de Facturación por Cliente</h1>
         
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

        {/* Filtros - Mes/Año y Rango de fechas */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* Filtros de Mes y Año */}
            <div className="md:col-span-2 flex gap-3 border-r border-gray-100 pr-6">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mes</label>
                <select 
                  value={filters.mes}
                  onChange={(e) => handleFilterChange('mes', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Enero">Enero</option>
                  <option value="Febrero">Febrero</option>
                  <option value="Marzo">Marzo</option>
                  <option value="Abril">Abril</option>
                  <option value="Mayo">Mayo</option>
                  <option value="Junio">Junio</option>
                  <option value="Julio">Julio</option>
                  <option value="Agosto">Agosto</option>
                  <option value="Septiembre">Septiembre</option>
                  <option value="Octubre">Octubre</option>
                  <option value="Noviembre">Noviembre</option>
                  <option value="Diciembre">Diciembre</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Año</label>
                <select 
                  value={filters.año}
                  onChange={(e) => handleFilterChange('año', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            {/* Filtros de Rango de Fechas */}
            <div className="md:col-span-2 flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Desde</label>
                <input 
                  type="date" 
                  value={filters.fecha_inicio}
                  onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Hasta</label>
                <input 
                  type="date" 
                  value={filters.fecha_fin}
                  onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  min={filters.fecha_inicio}
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center mt-6">
            {/* Botón Exportar a Excel */}
            <button 
              onClick={handleExportarExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar a Excel
            </button>

            {/* Botones de filtros */}
            <div className="flex gap-3">
              <button 
                onClick={clearFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg text-sm font-bold transition"
              >
                <span className="font-bold">Limpiar Filtros</span>
              </button>
              <button 
                onClick={aplicarFiltros}
                className="bg-gray-800 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-md"
              >
                <span className="font-bold">Filtrar</span>
              </button>
              <Button
                onClick={handleRefresh}
                variant="secondary"
                size="small"
                icon={RefreshCw}
                isLoading={isLoading}
              >
                <span className="font-bold">Recargar</span>
              </Button>
            </div>
          </div>
          
          {errors.rango_fechas && (
            <p className="text-xs text-red-500 mt-2">{errors.rango_fechas}</p>
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
              </div>
            </div>
          )}
          
          <p className="text-[10px] text-gray-400 mt-3 italic">
            * El rango de fechas tiene prioridad sobre la selección de mes y año.
          </p>
        </div>

        {/* Tabla de Detalle por Cliente */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Numero de Facturas</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase ">Total Facturado Con Detracción</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.detalle_por_cliente.map((item, index) => (
                <tr key={`${item.cliente}-${index}`} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {item.cliente || "CLIENTE SIN NOMBRE"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {item.nro_facturas || 0} Facturas
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700 font-mono">
                    {formatMoneda(item.neto_total)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => verDetallesCliente(item)}
                      className="text-blue-500 hover:text-blue-700 text-xs font-bold uppercase"
                    >
                      <span className="font-bold">Ver Detalles</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Sin resultados */}
              {data.detalle_por_cliente.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-gray-300 mb-3">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
                      <p className="text-gray-600">
                        {Object.values(filters).some(f => f && f.trim() !== '')
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'No hay datos disponibles para mostrar'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-bold text-gray-800">TOTAL PERIODO</td>
                <td></td>
                <td className="px-6 py-4 text-sm text-center text-blue-700 font-mono font-bold">
                  {formatMoneda(data.resumen_general.gran_total_neto)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Paginación */}
        {data.detalle_por_cliente.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
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
    </div>
  );
};

export default MonitoreoClientes;