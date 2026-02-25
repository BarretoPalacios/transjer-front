import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, X, CheckCircle, Download, Loader, Truck, Wrench, FileText } from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';

import SeguimientoFacturas from './FacturasProp';
import TodosLosFletes from './FletesProp';
import Servicios from './ServiciosProps';


// API
import { gerenciaServiceAPI } from '../../../api/endpoints/gerenciaService';
import utilsAPI from '../../../api/endpoints/utils';

// Tarjeta de resumen para el dashboard - versión simplificada
const TarjetaResumen = ({ titulo, valor }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{titulo}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{valor}</p>
      </div>
    </div>
  );
};

// Componente de Tabs
const Tabs = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex -mb-px space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

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
  
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  
  // Estado para el tab activo
  const [activeTab, setActiveTab] = useState('facturacion');
  
  // Definición de los tabs
  const tabs = [
    { id: 'facturacion', label: 'Facturación', icon: <FileText className="h-4 w-4" /> },
    { id: 'flotas', label: 'Flotas', icon: <Truck className="h-4 w-4" /> },
    { id: 'servicios', label: 'Servicios', icon: <Wrench className="h-4 w-4" /> }
  ];
  
  // Estados para filtros - SOLO cliente y rango de fechas
  const [filters, setFilters] = useState({
    cliente_id: '',
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
  
  // Cargar lista de clientes al iniciar
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoadingClientes(true);
        const response = await utilsAPI.getClientesList();
        setClientes(response || []);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError('Error al cargar la lista de clientes');
      } finally {
        setLoadingClientes(false);
      }
    };

    fetchClientes();
  }, []);


  // Función principal para cargar datos
  const fetchResumen = useCallback(
    async (filtersToUse = filters) => {
      // Validar que haya al menos un cliente y rango de fechas
      if (!filtersToUse.cliente_id || !filtersToUse.fecha_inicio || !filtersToUse.fecha_fin) {
        return;
      }

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
      
      // Preparar filtros para API - SOLO cliente y rango de fechas
      const filtrosAPI = {
        cliente: filtersToUse.cliente_id,
        fecha_inicio: filtersToUse.fecha_inicio,
        fecha_fin: filtersToUse.fecha_fin
      };
      
      try {
        // Limpiar filtros vacíos
        const cleanFilters = {};
        Object.entries(filtrosAPI).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            cleanFilters[key] = value;
          }
        });

        console.log('Filtros enviados a la API:', cleanFilters);
        
        // Llamar a la API específica para clientes
        const response = await gerenciaServiceAPI.getResumenPorCliente(cleanFilters);
        
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
          detalle_por_cliente: response.detalle_por_cliente || []
        });
        
      } catch (err) {
        setError('Error al cargar el resumen: ' + (err.message || 'Error desconocido'));
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
    
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = useCallback(() => {
    if (!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin) {
      setError('Debe seleccionar un cliente y un rango de fechas completo');
      return;
    }
    fetchResumen(filters);
  }, [fetchResumen, filters]);

  const clearFilters = useCallback(() => {
    setFilters({
      cliente_id: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
    setErrors({
      fecha_inicio: '',
      fecha_fin: '',
      rango_fechas: ''
    });
    setData({
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
  }, []);

  const handleRefresh = useCallback(() => {
    if (filters.cliente_id && filters.fecha_inicio && filters.fecha_fin) {
      fetchResumen(filters);
    }
  }, [fetchResumen, filters]);

  // Formatear moneda
  const formatMoneda = (valor) => {
    return gerenciaServiceAPI.formatMoneda(valor);
  };

  const [loadingDownload, setloadingDownload] = useState(false);

  // Función para exportar a Excel
  const handleExportarExcel = useCallback(async () => {
    if (!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin) {
      setError('Debe seleccionar un cliente y un rango de fechas para exportar');
      return;
    }

    try {
      setloadingDownload(true);
      
      const blob = await gerenciaServiceAPI.exportResumenExcel(filters);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `resumen_cliente_${filters.cliente_id}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setloadingDownload(false);
    } catch (err) {
      setError('Error al exportar: ' + err.message);
      console.error('Error exporting:', err);
      setloadingDownload(false);
    }
  }, [filters]);

  // Mostrar loading solo en carga inicial
  if (loadingClientes) {
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

  const hayResultados = data.detalle_por_cliente.length > 0;

  // Renderizar el componente según el tab activo
const renderTabContent = () => {
  if (!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin) {
    return null;
  }

  const props = {
    clienteId: filters.cliente_id,
    fechaInicio: filters.fecha_inicio,
    fechaFin: filters.fecha_fin
  };

  // Crear una key única basada en los filtros y el tab activo
  // Esto hará que el componente se recree cuando cambien los filtros
  const componentKey = `${activeTab}-${filters.cliente_id}-${filters.fecha_inicio}-${filters.fecha_fin}`;

  switch (activeTab) {
    case 'facturacion':
      return <SeguimientoFacturas key={componentKey} {...props} />;
    case 'flotas':
      return <TodosLosFletes key={componentKey} {...props} />;
    case 'servicios':
      return <Servicios key={componentKey} {...props} />;
    default:
      return null;
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Monitoreo de Clientes</h1>
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

        {/* Filtros - SOLO Cliente y Rango de fechas */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Select de Clientes */}
            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select 
                value={filters.cliente_id}
                onChange={(e) => handleFilterChange('cliente_id', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingClientes}
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente} value={cliente}>
                    {cliente}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtros de Rango de Fechas */}
            <div className="md:col-span-2 flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Desde <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={filters.fecha_inicio}
                  onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fecha_inicio && (
                  <p className="text-xs text-red-500 mt-1">{errors.fecha_inicio}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Hasta <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={filters.fecha_fin}
                  onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  min={filters.fecha_inicio}
                />
                {errors.fecha_fin && (
                  <p className="text-xs text-red-500 mt-1">{errors.fecha_fin}</p>
                )}
              </div>
            </div>
          </div>

          {errors.rango_fechas && (
            <p className="text-xs text-red-500 mt-2">{errors.rango_fechas}</p>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-3">
              <button 
                onClick={clearFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg text-sm font-bold transition"
              >
                Limpiar
              </button>
              <button 
                onClick={aplicarFiltros}
                disabled={!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin || isLoading}
                className="bg-gray-800 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
              <Button
                onClick={handleRefresh}
                variant="secondary"
                size="small"
                icon={RefreshCw}
                isLoading={isLoading}
                disabled={!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin}
              >
                Recargar
              </Button>
            </div>

            {hayResultados && (
              <button 
                onClick={handleExportarExcel}
                disabled={loadingDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
              >
                {loadingDownload ? (
                  <span className="flex items-center">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </span>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Exportar a Excel
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Dashboard de Resultados - SOLO si hay datos */}
        {hayResultados ? (
          <>
            {/* Primera fila de tarjetas - Información General */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* <TarjetaResumen 
                titulo="Clientes Activos" 
                valor={data.resumen_general.clientes_activos}
              /> */}
              <TarjetaResumen 
                titulo="Facturado Bruto" 
                valor={formatMoneda(data.resumen_general.gran_total_facturado)}
              />
              <TarjetaResumen 
                titulo="Facturado Bruto (con detracción)" 
                valor={formatMoneda(data.resumen_general.gran_total_neto)}
              />
              <TarjetaResumen 
                titulo="Total Detracción" 
                valor={formatMoneda(data.resumen_general.gran_total_detraccion)}
              />
              <TarjetaResumen 
                titulo="Numero de Facturas" 
                valor={(data.detalle_por_cliente[0]?.nro_facturas || 0)}
              />
            </div>

            {/* Segunda fila de tarjetas - Estado de Pagos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <TarjetaResumen 
                titulo="Cobrado" 
                valor={formatMoneda(data.resumen_general.gran_total_neto_pagado)}
              />
              
              <TarjetaResumen 
                titulo="Vencido" 
                valor={formatMoneda(data.resumen_general.gran_total_neto_vencido)}
              />
              <TarjetaResumen 
                titulo="Por Vencer" 
                valor={formatMoneda(data.resumen_general.gran_total_neto_por_vencer)}
              />
            </div>

            {/* Información del cliente y período */}
            {/* <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Cliente:</span> {filters.cliente_id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Período:</span> {new Date(filters.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(filters.fecha_fin).toLocaleDateString('es-ES')}
              </p>
            </div> */}

            {/* Tabs horizontales */}
            <Tabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              tabs={tabs} 
            />

            {/* Contenido del tab actual */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {renderTabContent()}
            </div>
          </>
        ) : (
          /* Mensaje cuando no hay resultados */
          filters.cliente_id && filters.fecha_inicio && filters.fecha_fin && !isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="text-gray-300 mb-4">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
                <p className="text-gray-600 max-w-md">
                  No hay datos disponibles para el cliente y rango de fechas seleccionados.
                  Intenta con otro cliente o ajusta las fechas de búsqueda.
                </p>
              </div>
            </div>
          )
        )}

        {/* Mensaje inicial cuando no hay filtros seleccionados */}
        {(!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin) && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="text-gray-300 mb-4">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona un cliente y rango de fechas</h3>
              <p className="text-gray-600 max-w-md">
                Para ver el resumen de facturación, selecciona un cliente y define un rango de fechas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoreoClientes;