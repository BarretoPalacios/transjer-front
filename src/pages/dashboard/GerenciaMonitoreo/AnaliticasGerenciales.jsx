import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle,
  Percent,
  AlertCircle,
  Calendar,
  RefreshCw,
  BarChart3,
  Filter
} from 'lucide-react';
import { facturacionGestionAPI } from "../../../api/endpoints/facturacionGestion";

const AnaliticasGerenciales = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mostrarHistoricoTotal, setMostrarHistoricoTotal] = useState(false);
  
  // Estados para los filtros
  const [mes, setMes] = useState(new Date().getMonth() + 1); // Mes actual (1-12)
  const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual
  
  // Datos iniciales del dashboard
  const [dashboardData, setDashboardData] = useState(null);

  // Función para obtener datos del backend
  const fetchData = async (mostrarTodo = false) => {
    try {
      setLoading(true);
      setError(null);
      setMostrarHistoricoTotal(mostrarTodo);
      
      // Usar el nuevo endpoint getResumenFinanciero
      const response = await facturacionGestionAPI.getResumenFinanciero(
        mostrarTodo ? undefined : {
          mes,
          anio
        }
      );
      
      // Mapear los datos de la API al formato esperado
      
      setDashboardData(response);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error al obtener KPIs financieros:', err);
      setError('No se pudieron cargar los datos financieros. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear moneda
  const formatCurrency = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue || 0);
  };

  // Lista de meses
  const meses = [
    { id: 1, nombre: 'Enero' },
    { id: 2, nombre: 'Febrero' },
    { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' },
    { id: 5, nombre: 'Mayo' },
    { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' },
    { id: 8, nombre: 'Agosto' },
    { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' },
    { id: 11, nombre: 'Noviembre' },
    { id: 12, nombre: 'Diciembre' }
  ];

  // Generar lista de años (últimos 10 años y próximos 2)
  const generarAnios = () => {
    const anios = [];
    const anioInicio = 2026;
    const anioFin = 2030;

    for (let i = anioInicio; i <= anioFin; i++) {
      anios.push(i);
    }

    // Retornamos con sort((a, b) => b - a) para mantener el orden descendente (2030 -> 2026)
    return anios.sort((a, b) => b - a);
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    setMostrarHistoricoTotal(false);
    fetchData(false);
  };

  const verTodoHistorico = () => {
    fetchData(true);
  };

const vendidoBruto = dashboardData?.fletes?.venta_total_valorizada * 1.18

  useEffect(() => {
    fetchData();
  }, []); // Solo se ejecuta al montar el componente

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos financieros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-medium mb-2">{error}</p>
          <button
            onClick={() => fetchData(mostrarHistoricoTotal)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 font-sans">
      {/* Encabezado con filtros integrados */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Resumen Financiero</h1>
                <p className="text-gray-600 text-sm">
                  Período: {mostrarHistoricoTotal 
                    ? 'HISTÓRICO TOTAL' 
                    : `${meses.find(m => m.id === mes)?.nombre} ${anio}`}
                </p>
                {mostrarHistoricoTotal && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    Mostrando todos los períodos
                  </span>
                )}
              </div>
              
              <button
                onClick={() => fetchData(mostrarHistoricoTotal)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
            
            {/* Filtros de mes y año - SIEMPRE HABILITADOS */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-white rounded-lg shadow-sm ">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                {/* Selector de Mes - Siempre habilitado */}
                <div className="flex-1 md:max-w-[150px]">
                  <select
                    value={mes}
                    onChange={(e) => setMes(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {meses.map((mesItem) => (
                      <option key={mesItem.id} value={mesItem.id}>
                        {mesItem.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Año - Siempre habilitado */}
                <div className="flex-1 md:max-w-[120px]">
                  <select
                    value={anio}
                    onChange={(e) => setAnio(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {generarAnios().map((anioItem) => (
                      <option key={anioItem} value={anioItem}>
                        {anioItem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={aplicarFiltros}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                  >
                    Filtrar
                  </button>
                  
                  <button
                    onClick={verTodoHistorico}
                    className={`px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap ${
                      mostrarHistoricoTotal
                        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
                    }`}
                  >
                    Mostrar Todos Los Periodos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 w-16 bg-blue-500 mt-3 rounded"></div>
      </div>

      {/* Sección de ventas */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
          <BarChart3 className="text-blue-500 mr-2 text-sm h-4 w-4" />
          Resumen de Ventas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Total Vendido Neto */}
          <div className="bg-white rounded-lg shadow-sm p-3 border-l-3 border-blue-500 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Vendido Neto</h3>
                <p className="text-black text-lg font-semibold">
                  {formatCurrency(dashboardData.fletes.venta_total_valorizada)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Suma de todos los fletes valorizados</p>
          </div>
          
          {/* Total Vendido Bruto */}
          <div className="bg-white rounded-lg shadow-sm p-3 border-l-3 border-green-500 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Vendido Bruto</h3>
                <p className="text-black text-lg font-semibold">
                  {formatCurrency(vendidoBruto)}
                </p>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-md">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Vendido Neto + IVG</p>
          </div>
          
          {/* Facturación Bruta */}
          <div className="bg-white rounded-lg shadow-sm p-3 border-l-3 border-purple-500 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Facturación Bruta</h3>
                <p className="text-black text-lg font-semibold">
                  {formatCurrency(dashboardData.facturas.monto_total_bruto)}
                </p>
                <p className="text-black text-xs font-semibold">
                  Con Detracción: {formatCurrency(dashboardData.facturas.monto_neto_total)}
                </p>
              </div> 
              <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-gray-500 text-xs">Total facturado</p>
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                {dashboardData.facturas.conteo_facturas} factura{dashboardData.facturas.conteo_facturas !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {/* Facturación Bruta Pendiente */}
          <div className="bg-white rounded-lg shadow-sm p-3 border-l-3 border-yellow-500 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Facturación Pendiente</h3>
                <p className="text-black text-lg font-semibold">
                  {formatCurrency(vendidoBruto - dashboardData.facturas.monto_total_bruto)} 
                </p>
              </div>
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Falta un </span>
                {/* <span className="font-medium">{porcentajes.porcentajeFacturacionPendiente}%</span> */}
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-500"
                  // style={{ width: `${porcentajes.porcentajeFacturacionPendiente}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sección de cobranza y detracciones */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
          <DollarSign className="text-green-500 mr-2 text-sm h-4 w-4" />
          Cobranza y Detracciones
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pendiente por Cobrar */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Pendiente por Cobrar</h3>
                <p className="text-black text-lg font-semibold">
                  {formatCurrency(dashboardData.facturas.monto_total_pendiente)}
                </p>
              </div>
              <div className="p-2 bg-red-100 text-red-600 rounded-md">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            
            <div className="space-y-2 mt-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Por Vencer</span>
                  <span className="font-medium">
                    {formatCurrency(dashboardData.facturas.por_vencer.monto)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    // style={{ width: `${porcentajes.porcentajePorVencer}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Vencido</span>
                  <span className="font-medium">
                    {formatCurrency(dashboardData.facturas.vencido.monto)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: dashboardData.facturas.vencido.cantidad > 0 ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Cobrado */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Total Cobrado</h3>
                <p className="text-black text-lg font-semibold">
                  {formatCurrency(dashboardData.facturas.pagado.monto)}
                </p>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-md">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>  
            
            <div className="flex justify-between items-center mt-1 mb-3">
              <p className="text-gray-500 text-xs">Monto cobrado</p>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
                {dashboardData.facturas.pagado.cantidad} factura{dashboardData.facturas.pagado.cantidad !== 1 ? 's' : ''} cobrada{dashboardData.facturas.pagado.cantidad !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {/* Detracciones */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Total Detracciones</h3>
                <p className="text-black text-lg font-semibold">
                  {formatCurrency(dashboardData.total_detracciones)}
                </p>
              </div>
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-md">
                <Percent className="h-4 w-4" />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-1 mb-3">
              <p className="text-gray-500 text-xs">Monto retenido</p>
              <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">
                {dashboardData.cnt_detracciones} factura{dashboardData.cnt_detracciones !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sección de vencimientos */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
          <Calendar className="text-orange-500 mr-2 text-sm h-4 w-4" />
          Estado de Vencimientos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Por Vencer */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Por Vencer</h3>
                <p className="text-black text-lg font-semibold">
                  {formatCurrency(dashboardData.facturas.por_vencer.monto)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-left">
                <p className="text-gray-500 text-xs">Próximos vencimientos</p>
                <p className="text-gray-400 text-xs">
                  {dashboardData.facturas.por_vencer.cantidad === 0 ? 'Sin facturas por vencer' : `${dashboardData.facturas.por_vencer.cantidad} factura(s) por vencer`}
                </p>
              </div>
              {/* <div className="text-right">
                <div className="text-xs text-gray-600">Estado</div>
                <div className={`text-xs font-medium ${dashboardData.total_vencido === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardData.total_vencido === 0 ? 'Al día' : 'Con mora'}
                </div>
              </div> */}
            </div>
          </div>
          
          {/* Vencido */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Vencido</h3>
                <p className={`text-lg font-semibold ${dashboardData.facturas.vencido.monto === 0 ? 'text-green-600' : 'text-black'}`}>
                  {formatCurrency(dashboardData.facturas.vencido.monto)}
                </p>
              </div>
              <div className={`p-2 rounded-md ${dashboardData.facturas.vencido.monto === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {dashboardData.facturas.vencido.monto === 0 ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-left">
                <p className="text-gray-500 text-xs">Documentos vencidos</p>
                <p className="text-gray-400 text-xs">
                  {dashboardData.facturas.vencido.monto === 0 ? 'Sin mora en pagos' : 'Atención requerida'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Cantidad</div>
                <div className="text-xs font-medium">
                  {dashboardData.facturas.vencido.cantidad} factura{dashboardData.facturas.vencido.cantidad !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sección de fletes */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
          <Truck className="text-teal-500 mr-2 text-sm h-4 w-4" />
          Estado de Fletes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Total Fletes */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Total Fletes</h3>
                <p className="text-gray-800 text-lg font-semibold">
                  {dashboardData.fletes.conteo_total}
                </p>
              </div>
              <div className="p-2 bg-gray-100 text-gray-600 rounded-md">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Total Registrado</p>
            <p className="text-gray-500 text-xs flex items-center">
              Valor Neto
              <span className="ml-2 text-xs text-black font-bold">
                {formatCurrency(dashboardData.fletes.venta_total_valorizada)}
              </span>
            </p>
          </div>
          
          {/* Fletes Pendientes */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Fletes Pendientes</h3>
                <p className="text-black text-lg font-semibold">
                  {dashboardData.fletes.detalles.pendientes.cantidad}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Pendientes por Valorizar</p>
            <p className="text-gray-500 text-xs flex items-center">
              Valor Neto
              <span className="ml-2 text-xs text-black font-bold">
                {formatCurrency(dashboardData.fletes.detalles.pendientes.monto)}
              </span>
            </p>
          </div>
          
          {/* Fletes Valorizados */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Fletes Valorizados</h3>
                <p className="text-black text-lg font-semibold">
                  {dashboardData.fletes.detalles.valorizados_sin_factura.cantidad}
                </p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Valorizados (sin facturar)</p>
            <p className="text-gray-500 text-xs flex items-center">
              Valor Neto
              <span className="ml-2 text-xs text-black font-bold">
                {formatCurrency(dashboardData.fletes.detalles.valorizados_sin_factura.monto)}
              </span>
            </p>
          </div>
          
          {/* Fletes con Factura */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Fletes con Factura</h3>
                <p className="text-black text-lg font-semibold">
                  {dashboardData.fletes.detalles.valorizados_con_factura.cantidad}
                </p>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-md">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Completamente procesados</p>
            <p className="text-gray-500 text-xs flex items-center">
              Valor Neto
              <span className="ml-2 text-xs text-black font-bold">
                {formatCurrency(dashboardData.fletes.detalles.valorizados_con_factura.monto)}
              </span>
            </p>
          </div>
        </div>
        
        {/* Gráfico de distribución de fletes */}
<div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
  <h3 className="text-gray-700 text-sm font-medium mb-2">Distribución de Estados</h3>
  <div className="flex items-center justify-between">
    <div className="w-3/4">
      <div className="flex items-center h-4 mb-2 rounded overflow-hidden bg-gray-100">
        {dashboardData.fletes.conteo_total > 0 ? (
          <>
            <div 
              className="h-full bg-yellow-500 transition-all duration-500" 
              style={{ 
                width: `${(dashboardData.fletes.detalles.pendientes.cantidad / dashboardData.fletes.conteo_total) * 100}%` 
              }}
              title={`Pendientes: ${dashboardData.fletes.detalles.pendientes.cantidad}`}
            ></div>
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ 
                width: `${(dashboardData.fletes.detalles.valorizados_sin_factura.cantidad / dashboardData.fletes.conteo_total) * 100}%` 
              }}
              title={`Sin Factura: ${dashboardData.fletes.detalles.valorizados_sin_factura.cantidad}`}
            ></div>
            <div 
              className="h-full bg-green-500 transition-all duration-500" 
              style={{ 
                width: `${(dashboardData.fletes.detalles.valorizados_con_factura.cantidad / dashboardData.fletes.conteo_total) * 100}%` 
              }}
              title={`Con Factura: ${dashboardData.fletes.detalles.valorizados_con_factura.cantidad}`}
            ></div>
          </>
        ) : (
          <div className="h-full w-full bg-gray-200"></div>
        )}
      </div>
    </div>
    
    <div className="w-1/4 pl-4">
      {dashboardData.fletes.conteo_total > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
              <span className="text-[10px] text-gray-500">Pendientes por Valorizar</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {Math.round((dashboardData.fletes.detalles.pendientes.cantidad / dashboardData.fletes.conteo_total) * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-[10px] text-gray-500">Valorizados sin factura</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {Math.round((dashboardData.fletes.detalles.valorizados_sin_factura.cantidad / dashboardData.fletes.conteo_total) * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              <span className="text-[10px] text-gray-500">Facturados</span>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {Math.round((dashboardData.fletes.detalles.valorizados_con_factura.cantidad / dashboardData.fletes.conteo_total) * 100)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-400">Sin datos</div>
      )}
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default AnaliticasGerenciales;