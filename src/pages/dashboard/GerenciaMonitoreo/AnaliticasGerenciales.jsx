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
  PieChart
} from 'lucide-react';
import { facturacionGestionAPI } from "../../../api/endpoints/facturacionGestion";

const AnaliticasGerenciales = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Datos iniciales del dashboard
  const [dashboardData, setDashboardData] = useState({
    total_vendido_neto: 0,
    total_vendido_bruto: 0,
    facturacion_bruta: 0,
    cnt_facturas_bruta: 0,
    facturacion_bruta_pendiente: 0,
    total_detracciones: 0,
    cnt_detracciones: 0,
    pendiente_por_cobrar: 0,
    facturacion_bruta_con_detraccion: 0,
    total_cobrado: 0,
    cnt_cobrado: 0,
    total_por_vencer: 0,
    total_vencido: 0,
    cnt_vencido: 0,
    fletes: {
      total_fletes: 0,
      fletes_pendientes: 0,
      fletes_valorizados: 0,
      fletes_con_factura: 0
    }
  });

  // Función para obtener datos del backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await facturacionGestionAPI.getKpisFinancierosEspecificos();
      
      // Mapear los datos de la API al formato esperado
      // NOTA: Ajusta este mapeo según la estructura real de la respuesta de tu API
      setDashboardData({
        total_vendido_neto: response.total_vendido_neto || 0,
        total_vendido_bruto: response.total_vendido_bruto || 0,
        facturacion_bruta: response.facturacion_bruta || 0,
        cnt_facturas_bruta: response.cnt_facturas_bruta || 0,
        facturacion_bruta_pendiente: response.facturacion_bruta_pendiente || 0,
        total_detracciones: response.total_detracciones || 0,
        cnt_detracciones: response.cnt_detracciones || 0,
        pendiente_por_cobrar: response.pendiente_por_cobrar || 0,
        facturacion_bruta_con_detraccion: response.facturacion_bruta_con_detraccion || 0,
        total_cobrado: response.total_cobrado || 0,
        cnt_cobrado: response.cnt_cobrado || 0,
        total_por_vencer: response.total_por_vencer || 0,
        total_vencido: response.total_vencido || 0,
        cnt_vencido: response.cnt_vencido || 0,
        fletes: {
          total_fletes: response.fletes?.total_fletes || 0,
          fletes_pendientes: response.fletes?.fletes_pendientes || 0,
          fletes_valorizados: response.fletes?.fletes_valorizados || 0,
          fletes_con_factura: response.fletes?.fletes_con_factura || 0
        }
      });
      
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

  // Calcular porcentajes
  const calcularPorcentajes = () => {
    const {
      facturacion_bruta,
      facturacion_bruta_pendiente,
      total_cobrado,
      pendiente_por_cobrar,
      total_vendido_bruto,
      total_detracciones,
      fletes
    } = dashboardData;

    const facturacionTotal = facturacion_bruta + facturacion_bruta_pendiente;
    const porcentajeFacturado = facturacionTotal > 0 ? (facturacion_bruta / facturacionTotal * 100) : 0;
    const porcentajeCobrado = facturacion_bruta > 0 ? (total_cobrado / facturacion_bruta * 100) : 0;
    const porcentajeDetracciones = total_vendido_bruto > 0 ? (total_detracciones / total_vendido_bruto * 100) : 0;
    const porcentajePorVencer = pendiente_por_cobrar > 0 ? (dashboardData.total_por_vencer / pendiente_por_cobrar * 100) : 0;
    const porcentajeFletesCompletados = fletes.total_fletes > 0 ? ((fletes.total_fletes - fletes.fletes_pendientes) / fletes.total_fletes * 100) : 0;
    const porcentajeFletesFacturados = fletes.total_fletes > 0 ? (fletes.fletes_con_factura / fletes.total_fletes * 100) : 0;

    return {
      porcentajeFacturado: porcentajeFacturado.toFixed(0),
      porcentajeFacturacionPendiente: (100 - porcentajeFacturado).toFixed(0),
      porcentajeCobrado: porcentajeCobrado.toFixed(0),
      porcentajeDetracciones: porcentajeDetracciones.toFixed(1),
      porcentajePorVencer: porcentajePorVencer.toFixed(0),
      porcentajeFletesCompletados: porcentajeFletesCompletados.toFixed(0),
      porcentajeFletesFacturados: porcentajeFletesFacturados.toFixed(0),
      facturacionTotal: facturacionTotal
    };
  };

  const porcentajes = calcularPorcentajes();

  useEffect(() => {
    fetchData();
  }, []);

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
            onClick={fetchData}
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
      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Resumen Financiero</h1>
            {/* <p className="text-gray-600 text-sm">Resumen completo de métricas financieras</p> */}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        <div className="h-1 w-16 bg-blue-500 mt-2 rounded"></div>
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
                  {formatCurrency(dashboardData.total_vendido_neto)}
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
                  {formatCurrency(dashboardData.total_vendido_bruto)}
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
                  {formatCurrency(dashboardData.facturacion_bruta)}
                </p>
              </div> 
              <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-gray-500 text-xs">Total facturado</p>
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                {dashboardData.cnt_facturas_bruta} factura{dashboardData.cnt_facturas_bruta !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {/* Facturación Bruta Pendiente */}
          <div className="bg-white rounded-lg shadow-sm p-3 border-l-3 border-yellow-500 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Facturación Pendiente</h3>
                <p className="text-black text-lg font-semibold">
                  {formatCurrency(dashboardData.facturacion_bruta_pendiente)}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Falta un </span>
                <span className="font-medium">{porcentajes.porcentajeFacturacionPendiente}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${porcentajes.porcentajeFacturacionPendiente}%` }}
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
                  {formatCurrency(dashboardData.pendiente_por_cobrar)}
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
                    {formatCurrency(dashboardData.total_por_vencer)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${porcentajes.porcentajePorVencer}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Vencido</span>
                  <span className="font-medium">
                    {formatCurrency(dashboardData.total_vencido)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: dashboardData.total_vencido > 0 ? '100%' : '0%' }}
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
                  {formatCurrency(dashboardData.total_cobrado)}
                </p>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-md">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-1 mb-3">
              <p className="text-gray-500 text-xs">Monto cobrado</p>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
                {dashboardData.cnt_cobrado} factura{dashboardData.cnt_cobrado !== 1 ? 's' : ''} cobrada{dashboardData.cnt_cobrado !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* <div> 
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Porcentaje cobrado</span>
                <span className="font-medium">{porcentajes.porcentajeCobrado}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${porcentajes.porcentajeCobrado}%` }}
                ></div>
              </div>
            </div> */} 
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
            
            {/* <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">% sobre ventas</span>
                <span className="font-medium">{porcentajes.porcentajeDetracciones}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.min(parseFloat(porcentajes.porcentajeDetracciones) * 10, 100)}%` }}
                ></div>
              </div>
            </div> */}
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
                  {formatCurrency(dashboardData.total_por_vencer)}
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
                  {dashboardData.cnt_vencido === 0 ? 'Sin facturas vencidas' : `${dashboardData.cnt_vencido} factura(s) vencida(s)`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Estado</div>
                <div className={`text-xs font-medium ${dashboardData.total_vencido === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardData.total_vencido === 0 ? 'Al día' : 'Con mora'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Vencido */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Vencido</h3>
                <p className={`text-lg font-semibold ${dashboardData.total_vencido === 0 ? 'text-green-600' : 'text-black'}`}>
                  {formatCurrency(dashboardData.total_vencido)}
                </p>
              </div>
              <div className={`p-2 rounded-md ${dashboardData.total_vencido === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {dashboardData.total_vencido === 0 ? (
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
                  {dashboardData.total_vencido === 0 ? 'Sin mora en pagos' : 'Atención requerida'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Cantidad</div>
                <div className="text-xs font-medium">
                  {dashboardData.cnt_vencido} factura{dashboardData.cnt_vencido !== 1 ? 's' : ''}
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
                  {dashboardData.fletes.total_fletes}
                </p>
              </div>
              <div className="p-2 bg-gray-100 text-gray-600 rounded-md">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Fletes registrados</p>
          </div>
          
          {/* Fletes Pendientes */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Fletes Pendientes</h3>
                <p className="text-black text-lg font-semibold">
                  {dashboardData.fletes.fletes_pendientes}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Por valorizar o facturar</p>
          </div>
          
          {/* Fletes Valorizados */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Fletes Valorizados</h3>
                <p className="text-black text-lg font-semibold">
                  {dashboardData.fletes.fletes_valorizados}
                </p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Valorizados sin factura</p>
          </div>
          
          {/* Fletes con Factura */}
          <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-gray-500 text-xs font-medium">Fletes con Factura</h3>
                <p className="text-black text-lg font-semibold">
                  {dashboardData.fletes.fletes_con_factura}
                </p>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-md">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-500 text-xs">Completamente procesados</p>
          </div>
        </div>
        
        {/* Gráfico de distribución de fletes */}
        <div className="bg-white rounded-lg shadow-sm p-3 transition-transform hover:-translate-y-1">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Distribución de Estados</h3>
          <div className="flex items-center justify-between">
            <div className="w-3/4">
              <div className="flex items-center h-4 mb-2 rounded overflow-hidden">
                {dashboardData.fletes.total_fletes > 0 && (
                  <>
                    <div 
                      className="h-full bg-yellow-500" 
                      style={{ 
                        width: `${(dashboardData.fletes.fletes_pendientes / dashboardData.fletes.total_fletes) * 100}%` 
                      }}
                      title={`Pendientes: ${dashboardData.fletes.fletes_pendientes}`}
                    ></div>
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ 
                        width: `${(dashboardData.fletes.fletes_valorizados / dashboardData.fletes.total_fletes) * 100}%` 
                      }}
                      title={`Valorizados: ${dashboardData.fletes.fletes_valorizados}`}
                    ></div>
                    <div 
                      className="h-full bg-green-500" 
                      style={{ 
                        width: `${(dashboardData.fletes.fletes_con_factura / dashboardData.fletes.total_fletes) * 100}%` 
                      }}
                      title={`Con factura: ${dashboardData.fletes.fletes_con_factura}`}
                    ></div>
                  </>
                )}
                {dashboardData.fletes.total_fletes === 0 && (
                  <div className="h-full w-full bg-gray-200"></div>
                )}
              </div>
            </div>
            <div className="w-1/4 pl-4">
              {dashboardData.fletes.total_fletes > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-xs text-gray-600">
                      {Math.round((dashboardData.fletes.fletes_pendientes / dashboardData.fletes.total_fletes) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                    <span className="text-xs text-gray-600">
                      {Math.round((dashboardData.fletes.fletes_valorizados / dashboardData.fletes.total_fletes) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-xs text-gray-600">
                      {Math.round((dashboardData.fletes.fletes_con_factura / dashboardData.fletes.total_fletes) * 100)}%
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
      
      {/* Resumen general */}
      {/* <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm p-4 transition-transform hover:-translate-y-1">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <PieChart className="text-blue-600 mr-2 text-sm h-4 w-4" />
          Resumen General
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-gray-700 text-xs font-medium mb-2">Estado Financiero</h4>
            <ul className="space-y-1">
              <li className="flex justify-between text-xs">
                <span className="text-gray-600">Ventas Brutas:</span>
                <span className="font-medium">{formatCurrency(dashboardData.total_vendido_bruto)}</span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-600">Facturación:</span>
                <span className="font-medium">
                  {formatCurrency(dashboardData.facturacion_bruta)} ({dashboardData.cnt_facturas_bruta} factura{dashboardData.cnt_facturas_bruta !== 1 ? 's' : ''})
                </span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-600">Por Cobrar:</span>
                <span className="font-medium">{formatCurrency(dashboardData.pendiente_por_cobrar)}</span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-600">Cobrado:</span>
                <span className="font-medium">
                  {formatCurrency(dashboardData.total_cobrado)} ({dashboardData.cnt_cobrado} cobro{dashboardData.cnt_cobrado !== 1 ? 's' : ''})
                </span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-700 text-xs font-medium mb-2">Retenciones y Logística</h4>
            <ul className="space-y-1">
              <li className="flex justify-between text-xs">
                <span className="text-gray-600">Detracciones:</span>
                <span className="font-medium">
                  {formatCurrency(dashboardData.total_detracciones)} ({dashboardData.cnt_detracciones} retención{dashboardData.cnt_detracciones !== 1 ? 'es' : ''})
                </span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-600">Total Fletes:</span>
                <span className="font-medium">{dashboardData.fletes.total_fletes} servicio{dashboardData.fletes.total_fletes !== 1 ? 's' : ''}</span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-600">Fletes Pendientes:</span>
                <span className="font-medium">
                  {dashboardData.fletes.fletes_pendientes} ({porcentajes.porcentajeFletesCompletados}% completados)
                </span>
              </li>
              <li className="flex justify-between text-xs">
                <span className="text-gray-600">Fletes Facturados:</span>
                <span className="font-medium">
                  {dashboardData.fletes.fletes_con_factura} ({porcentajes.porcentajeFletesFacturados}%)
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-blue-200">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 text-xs">Última actualización:</p>
              <p className="font-medium text-xs">
                {lastUpdated ? lastUpdated.toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'No disponible'}
              </p>
            </div>
          </div>
        </div>
      </div> */}
      
      {/* Pie de página */}
      {/* <footer className="mt-6 text-center text-gray-500 text-xs">
        <p>Dashboard financiero • Datos actualizados desde API</p>
      </footer> */}
    </div>
  );
};

export default AnaliticasGerenciales;