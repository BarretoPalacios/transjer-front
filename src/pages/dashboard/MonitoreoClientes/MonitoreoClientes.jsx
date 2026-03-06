// import React, { useState, useCallback, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { RefreshCw, X, CheckCircle, Download, Loader, Truck, Wrench, FileText } from 'lucide-react';

// // Componentes comunes
// import Button from '../../../components/common/Button/Button';

// import SeguimientoFacturas from './FacturasProp';
// import TodosLosFletes from './FletesProp';
// import Servicios from './ServiciosProps';


// // API
// import { gerenciaServiceAPI } from '../../../api/endpoints/gerenciaService';
// import utilsAPI from '../../../api/endpoints/utils';

// // Tarjeta de resumen para el dashboard - versión simplificada
// const TarjetaResumen = ({ titulo, valor }) => {
//   return (
//     <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
//       <div className="flex flex-col">
//         <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{titulo}</p>
//         <p className="text-xl font-bold text-gray-900 mt-1">{valor}</p>
//       </div>
//     </div>
//   );
// };

// // Componente de Tabs
// const Tabs = ({ activeTab, onTabChange, tabs }) => {
//   return (
//     <div className="border-b border-gray-200 mb-6">
//       <nav className="flex -mb-px space-x-8">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => onTabChange(tab.id)}
//             className={`
//               py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2
//               ${activeTab === tab.id
//                 ? 'border-blue-500 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }
//             `}
//           >
//             {tab.icon}
//             {tab.label}
//           </button>
//         ))}
//       </nav>
//     </div>
//   );
// };

// const MonitoreoClientes = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState({
//     resumen_general: {
//       clientes_activos: 0,
//       gran_total_facturado: 0,
//       gran_total_detraccion: 0,
//       gran_total_neto: 0,
//       gran_total_neto_pagado: 0,
//       gran_total_neto_pendiente: 0,
//       gran_total_neto_vencido: 0,
//       gran_total_neto_por_vencer: 0
//     },
//     detalle_por_cliente: []
//   });

//   const [analisisFletes, setAnalisisFletes] = useState({
//   conteo_total: 0,
//   periodo: '',
//   cliente_filtrado: '',
//   detalles: {
//     pendientes: { cantidad: 0, monto: 0 },
//     valorizados_sin_factura: { cantidad: 0, monto: 0 },
//     valorizados_con_factura: { cantidad: 0, monto: 0 }
//   },
//   venta_total_valorizada: 0
// });
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [clientes, setClientes] = useState([]);
//   const [loadingClientes, setLoadingClientes] = useState(true);
  
//   // Estado para el tab activo
//   const [activeTab, setActiveTab] = useState('facturacion');
  
//   // Definición de los tabs
//   const tabs = [
//     { id: 'facturacion', label: 'Facturación', icon: <FileText className="h-4 w-4" /> },
//     { id: 'flotas', label: 'Flotas', icon: <Truck className="h-4 w-4" /> },
//     { id: 'servicios', label: 'Servicios', icon: <Wrench className="h-4 w-4" /> }
//   ];
  
//   // Estados para filtros - SOLO cliente y rango de fechas
//   const [filters, setFilters] = useState({
//     cliente_id: '',
//     fecha_inicio: '',
//     fecha_fin: ''
//   });
  
//   // Estados para errores de validación
//   const [errors, setErrors] = useState({
//     fecha_inicio: '',
//     fecha_fin: '',
//     rango_fechas: ''
//   });
  
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
  
//   // Cargar lista de clientes al iniciar
//   useEffect(() => {
//     const fetchClientes = async () => {
//       try {
//         setLoadingClientes(true);
//         const response = await utilsAPI.getClientesList();
//         setClientes(response || []);
//       } catch (err) {
//         console.error('Error al cargar clientes:', err);
//         setError('Error al cargar la lista de clientes');
//       } finally {
//         setLoadingClientes(false);
//       }
//     };

//     fetchClientes();
//   }, []);


//   // Función principal para cargar datos
// // Función principal para cargar datos
// const fetchResumen = useCallback(
//   async (filtersToUse = filters) => {
//     // Validar que haya al menos un cliente y rango de fechas
//     if (!filtersToUse.cliente_id || !filtersToUse.fecha_inicio || !filtersToUse.fecha_fin) {
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setSuccessMessage(null);
//     setErrors({
//       fecha_inicio: '',
//       fecha_fin: '',
//       rango_fechas: ''
//     });
    
//     // Validar fechas
//     const validationErrors = {};
    
//     if (filtersToUse.fecha_inicio && !gerenciaServiceAPI.validarFecha(filtersToUse.fecha_inicio)) {
//       validationErrors.fecha_inicio = 'Formato de fecha inválido. Use YYYY-MM-DD';
//     }
    
//     if (filtersToUse.fecha_fin && !gerenciaServiceAPI.validarFecha(filtersToUse.fecha_fin)) {
//       validationErrors.fecha_fin = 'Formato de fecha inválido. Use YYYY-MM-DD';
//     }
    
//     if (filtersToUse.fecha_inicio && filtersToUse.fecha_fin && 
//         !gerenciaServiceAPI.validarRangoFechas(filtersToUse.fecha_inicio, filtersToUse.fecha_fin)) {
//       validationErrors.rango_fechas = 'La fecha de inicio no puede ser mayor a la fecha de fin';
//     }
    
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       setIsLoading(false);
//       return;
//     }
    
//     // Preparar filtros para API - SOLO cliente y rango de fechas
//     const filtrosAPI = {
//       cliente: filtersToUse.cliente_id,
//       fecha_inicio: filtersToUse.fecha_inicio,
//       fecha_fin: filtersToUse.fecha_fin
//     };
    
//     try {
//       // Limpiar filtros vacíos
//       const cleanFilters = {};
//       Object.entries(filtrosAPI).forEach(([key, value]) => {
//         if (value !== null && value !== undefined && value !== '') {
//           cleanFilters[key] = value;
//         }
//       });

//       console.log('Filtros enviados a la API:', cleanFilters);
      
//       // Llamar a ambas APIs en paralelo para mejor rendimiento
//       const [resumenResponse, analisisResponse] = await Promise.all([
//         gerenciaServiceAPI.getResumenPorCliente(cleanFilters),
//         gerenciaServiceAPI.getAnalisisFletesPorCliente(cleanFilters)
//       ]);
      
//       setData({
//         resumen_general: resumenResponse.resumen_general || {
//           clientes_activos: 0,
//           gran_total_facturado: 0,
//           gran_total_detraccion: 0,
//           gran_total_neto: 0,
//           gran_total_neto_pagado: 0,
//           gran_total_neto_pendiente: 0,
//           gran_total_neto_vencido: 0,
//           gran_total_neto_por_vencer: 0
//         },
//         detalle_por_cliente: resumenResponse.detalle_por_cliente || []
//       });
      
//       setAnalisisFletes(analisisResponse || {
//         conteo_total: 0,
//         periodo: '',
//         cliente_filtrado: '',
//         detalles: {
//           pendientes: { cantidad: 0, monto: 0 },
//           valorizados_sin_factura: { cantidad: 0, monto: 0 },
//           valorizados_con_factura: { cantidad: 0, monto: 0 }
//         },
//         venta_total_valorizada: 0
//       });
      
//     } catch (err) {
//       setError('Error al cargar el resumen: ' + (err.message || 'Error desconocido'));
//     } finally {
//       setIsLoading(false);
//     }
//   },
//   []
// );

//   // Handler para actualizar filtros
//   const handleFilterChange = useCallback((key, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [key]: value
//     }));

//   }, []);

//   // Función para aplicar filtros
//   const aplicarFiltros = useCallback(() => {
//     if (!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin) {
//       setError('Debe seleccionar un cliente y un rango de fechas completo');
//       return;
//     }
//     fetchResumen(filters);
//   }, [fetchResumen, filters]);

// const clearFilters = useCallback(() => {
//   setFilters({
//     cliente_id: '',
//     fecha_inicio: '',
//     fecha_fin: ''
//   });
//   setErrors({
//     fecha_inicio: '',
//     fecha_fin: '',
//     rango_fechas: ''
//   });
//   setData({
//     resumen_general: {
//       clientes_activos: 0,
//       gran_total_facturado: 0,
//       gran_total_detraccion: 0,
//       gran_total_neto: 0,
//       gran_total_neto_pagado: 0,
//       gran_total_neto_pendiente: 0,
//       gran_total_neto_vencido: 0,
//       gran_total_neto_por_vencer: 0
//     },
//     detalle_por_cliente: []
//   });
//   setAnalisisFletes({
//     conteo_total: 0,
//     periodo: '',
//     cliente_filtrado: '',
//     detalles: {
//       pendientes: { cantidad: 0, monto: 0 },
//       valorizados_sin_factura: { cantidad: 0, monto: 0 },
//       valorizados_con_factura: { cantidad: 0, monto: 0 }
//     },
//     venta_total_valorizada: 0
//   });
// }, []);

//   const handleRefresh = useCallback(() => {
//     if (filters.cliente_id && filters.fecha_inicio && filters.fecha_fin) {
//       fetchResumen(filters);
//     }
//   }, [fetchResumen, filters]);

//   // Formatear moneda
//   const formatMoneda = (valor) => {
//     return gerenciaServiceAPI.formatMoneda(valor);
//   };

//   const [loadingDownload, setloadingDownload] = useState(false);

//   // Función para exportar a Excel
//   const handleExportarExcel = useCallback(async () => {
//     if (!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin) {
//       setError('Debe seleccionar un cliente y un rango de fechas para exportar');
//       return;
//     }

//     try {
//       setloadingDownload(true);
      
//       const blob = await gerenciaServiceAPI.exportResumenExcel(filters);
      
//       const url = window.URL.createObjectURL(new Blob([blob]));
//       const link = document.createElement('a');
//       link.setAttribute('href', url);
//       link.setAttribute('download', `resumen_cliente_${filters.cliente_id}_${Date.now()}.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);

//       setloadingDownload(false);
//     } catch (err) {
//       setError('Error al exportar: ' + err.message);
//       console.error('Error exporting:', err);
//       setloadingDownload(false);
//     }
//   }, [filters]);

//   // Mostrar loading solo en carga inicial
//   if (loadingClientes) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
//           <div className="bg-white rounded-lg border border-gray-200 p-4">
//             <div className="h-32 bg-gray-200 rounded"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const hayResultados = data.detalle_por_cliente.length > 0;

//   // Renderizar el componente según el tab activo
// const renderTabContent = () => {
//   if (!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin) {
//     return null;
//   }

//   const props = {
//     clienteId: filters.cliente_id,
//     fechaInicio: filters.fecha_inicio,
//     fechaFin: filters.fecha_fin
//   };

//   // Crear una key única basada en los filtros y el tab activo
//   // Esto hará que el componente se recree cuando cambien los filtros
//   const componentKey = `${activeTab}-${filters.cliente_id}-${filters.fecha_inicio}-${filters.fecha_fin}`;

//   switch (activeTab) {
//     case 'facturacion':
//       return <SeguimientoFacturas key={componentKey} {...props} />;
//     case 'flotas':
//       return <TodosLosFletes key={componentKey} {...props} />;
//     case 'servicios':
//       return <Servicios key={componentKey} {...props} />;
//     default:
//       return null;
//   }
// };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto p-4">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">Monitoreo de Clientes</h1>
//         </div>

//         {/* Mensajes de éxito y error */}
//         {successMessage && (
//           <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//             <div className="flex items-center text-green-700">
//               <CheckCircle className="h-5 w-5 mr-2" />
//               <div>
//                 <span className="font-medium">Éxito:</span>
//                 <span className="ml-2">{successMessage}</span>
//               </div>
//             </div>
//             <button 
//               onClick={() => setSuccessMessage(null)}
//               className="mt-2 text-sm text-green-600 hover:text-green-800"
//             >
//               Cerrar
//             </button>
//           </div>
//         )}

//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <div className="flex items-center text-red-700">
//               <X className="h-5 w-5 mr-2" />
//               <div>
//                 <span className="font-medium">Error:</span>
//                 <span className="ml-2">{error}</span>
//               </div>
//             </div>
//             <button 
//               onClick={() => setError(null)}
//               className="mt-2 text-sm text-red-600 hover:text-red-800"
//             >
//               Cerrar
//             </button>
//           </div>
//         )}

//         {/* Filtros - SOLO Cliente y Rango de fechas */}
//         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
//             {/* Select de Clientes */}
//             <div className="md:col-span-1">
//               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
//                 Cliente <span className="text-red-500">*</span>
//               </label>
//               <select 
//                 value={filters.cliente_id}
//                 onChange={(e) => handleFilterChange('cliente_id', e.target.value)}
//                 className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
//                 disabled={loadingClientes}
//               >
//                 <option value="">Seleccionar cliente</option>
//                 {clientes.map((cliente) => (
//                   <option key={cliente} value={cliente}>
//                     {cliente}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Filtros de Rango de Fechas */}
//             <div className="md:col-span-2 flex gap-3 items-end">
//               <div className="flex-1">
//                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
//                   Desde <span className="text-red-500">*</span>
//                 </label>
//                 <input 
//                   type="date" 
//                   value={filters.fecha_inicio}
//                   onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
//                   className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 {errors.fecha_inicio && (
//                   <p className="text-xs text-red-500 mt-1">{errors.fecha_inicio}</p>
//                 )}
//               </div>
//               <div className="flex-1">
//                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
//                   Hasta <span className="text-red-500">*</span>
//                 </label>
//                 <input 
//                   type="date" 
//                   value={filters.fecha_fin}
//                   onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
//                   className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
//                   min={filters.fecha_inicio}
//                 />
//                 {errors.fecha_fin && (
//                   <p className="text-xs text-red-500 mt-1">{errors.fecha_fin}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {errors.rango_fechas && (
//             <p className="text-xs text-red-500 mt-2">{errors.rango_fechas}</p>
//           )}

//           {/* Botones de acción */}
//           <div className="flex justify-between items-center mt-6">
//             <div className="flex gap-3">
//               <button 
//                 onClick={clearFilters}
//                 className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg text-sm font-bold transition"
//               >
//                 Limpiar
//               </button>
//               <button 
//                 onClick={aplicarFiltros}
//                 disabled={!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin || isLoading}
//                 className="bg-gray-800 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? 'Buscando...' : 'Buscar'}
//               </button>
//               <Button
//                 onClick={handleRefresh}
//                 variant="secondary"
//                 size="small"
//                 icon={RefreshCw}
//                 isLoading={isLoading}
//                 disabled={!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin}
//               >
//                 Recargar
//               </Button>
//             </div>

//             {hayResultados && (
//               <button 
//                 onClick={handleExportarExcel}
//                 disabled={loadingDownload}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
//               >
//                 {loadingDownload ? (
//                   <span className="flex items-center">
//                     <Loader className="h-4 w-4 mr-2 animate-spin" />
//                     Exportando...
//                   </span>
//                 ) : (
//                   <>
//                     <Download className="h-4 w-4" />
//                     Exportar a Excel
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Dashboard de Resultados - SOLO si hay datos */}
//         {hayResultados ? (
//           <>
//             {/* Primera fila de tarjetas - Información General */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//               {/* <TarjetaResumen 
//                 titulo="Clientes Activos" 
//                 valor={data.resumen_general.clientes_activos}
//               /> */}
//               <TarjetaResumen 
//                 titulo="Facturado Bruto" 
//                 valor={formatMoneda(data.resumen_general.gran_total_facturado)}
//               />
//               <TarjetaResumen 
//                 titulo="Facturado Bruto (con detracción)" 
//                 valor={formatMoneda(data.resumen_general.gran_total_neto)}
//               />
//               <TarjetaResumen 
//                 titulo="Total Detracción" 
//                 valor={formatMoneda(data.resumen_general.gran_total_detraccion)}
//               />
//               <TarjetaResumen 
//                 titulo="Numero de Facturas" 
//                 valor={(data.detalle_por_cliente[0]?.nro_facturas || 0)}
//               />
//             </div>

//             {/* Segunda fila de tarjetas - Estado de Pagos */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//               <TarjetaResumen 
//                 titulo="Cobrado" 
//                 valor={formatMoneda(data.resumen_general.gran_total_neto_pagado)}
//               />
              
//               <TarjetaResumen 
//                 titulo="Vencido" 
//                 valor={formatMoneda(data.resumen_general.gran_total_neto_vencido)}
//               />
//               <TarjetaResumen 
//                 titulo="Por Vencer" 
//                 valor={formatMoneda(data.resumen_general.gran_total_neto_por_vencer)}
//               />
//             </div>

// {/* Separador para Análisis de Fletes */}
// <div className="mb-4">
//   <h2 className="text-lg font-semibold text-gray-800">Fletes</h2>
// </div>

//             {/* Tercera fila de tarjetas - Análisis de Fletes */}
// <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//   <TarjetaResumen 
//     titulo="Total Fletes" 
//     valor={analisisFletes.conteo_total}
//   />
//   <TarjetaResumen 
//     titulo="Venta Neta" 
//     valor={formatMoneda(analisisFletes.venta_total_valorizada)}
//   />
//   <TarjetaResumen 
//     titulo="Venta Bruta (con IGV) " 
//     valor={formatMoneda(analisisFletes.venta_total_valorizada * 1.18)}
//   />

//   <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
//       <div className="flex flex-col">
//         {/* <p className="text-xs font-medium text-black uppercase tracking-wider">Fletes</p> */}
//         <p className="text-sm text-gray-600 mt-1">Pendientes: {analisisFletes.detalles?.pendientes?.cantidad || 0} - {formatMoneda(analisisFletes.detalles?.pendientes?.monto || 0)}</p>
//         <p className="text-sm text-gray-600 mt-1">Valorizados s/Factura: {analisisFletes.detalles?.valorizados_sin_factura?.cantidad || 0} - {formatMoneda(analisisFletes.detalles?.valorizados_sin_factura?.monto || 0)}</p>
//         <p className="text-sm text-gray-600 mt-1">Valorizados c/Factura: {analisisFletes.detalles?.valorizados_con_factura?.cantidad || 0} - {formatMoneda(analisisFletes.detalles?.valorizados_con_factura?.monto || 0)}</p>
//       </div>
//     </div>
// </div>

//             {/* Tabs horizontales */}
//             <Tabs 
//               activeTab={activeTab} 
//               onTabChange={setActiveTab} 
//               tabs={tabs} 
//             />

//             {/* Contenido del tab actual */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               {renderTabContent()}
//             </div>
//           </>
//         ) : (
//           /* Mensaje cuando no hay resultados */
//           filters.cliente_id && filters.fecha_inicio && filters.fecha_fin && !isLoading && (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//               <div className="flex flex-col items-center">
//                 <div className="text-gray-300 mb-4">
//                   <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
//                 <p className="text-gray-600 max-w-md">
//                   No hay datos disponibles para el cliente y rango de fechas seleccionados.
//                   Intenta con otro cliente o ajusta las fechas de búsqueda.
//                 </p>
//               </div>
//             </div>
//           )
//         )}

//         {/* Mensaje inicial cuando no hay filtros seleccionados */}
//         {(!filters.cliente_id || !filters.fecha_inicio || !filters.fecha_fin) && !isLoading && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//             <div className="flex flex-col items-center">
//               <div className="text-gray-300 mb-4">
//                 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona un cliente y rango de fechas</h3>
//               <p className="text-gray-600 max-w-md">
//                 Para ver el resumen de facturación, selecciona un cliente y define un rango de fechas.
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MonitoreoClientes;





























import React, { useState, useCallback, useEffect } from "react";
import {
  Users,
  Filter,
  Calendar,
  RefreshCw,
  X,
  CheckCircle,
  Download,
  Loader,
  MapPin,
  DollarSign,
  Clock,
  FileCheck,
  FileX,
  Building2,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { monitoreoAPI } from "../../../api/endpoints/monitoreo";
import utilsAPI from "../../../api/endpoints/utils";
import { fletesAPI } from "../../../api/endpoints/fletes";
import ReportesClientes from "./ReportesClientes";

const formatFecha = (fecha) => {
  if (!fecha) return "N/A";
  try {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return fecha;
  }
};

const MonitoreoClientes = () => {
  const [clientesData, setClientesData] = useState([]);
  const [clientesList, setClientesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [metrics, setMetrics] = useState({
    total_clientes: 0,
    monto_total_acumulado: 0,
    total_pendientes: 0,
    facturados: 0,
    no_facturados: 0,
  });

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
    fecha_inicio: "",
    fecha_fin: "",
    cliente_id: "", // Cambiado de flota_placa a cliente_id
    mes: "",
  });

  // Estados para errores
  const [errors, setErrors] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    rango_fechas: "",
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50, 100];

  // Opciones de meses
  const meses = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  // Cargar lista de clientes al montar el componente
  useEffect(() => {
    cargarClientesList();
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));

      fetchClientes(1, pagination.itemsPerPage, filters);
    }, 500);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters.fecha_inicio, filters.fecha_fin, filters.cliente_id]);

  // Efecto para actualizar rango de fechas cuando cambia el mes
  useEffect(() => {
    if (filters.mes) {
      const year = new Date().getFullYear();
      const fechaInicio = `${year}-${filters.mes}-01`;

      const lastDay = new Date(year, parseInt(filters.mes), 0).getDate();
      const fechaFin = `${year}-${filters.mes}-${lastDay}`;

      setFilters((prev) => ({
        ...prev,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }));
    }
  }, [filters.mes]);

  // Cargar lista de clientes desde la API
  const cargarClientesList = useCallback(async () => {
    try {
      const response = await utilsAPI.getClientesList(); // Usando getClientesList
      setClientesList(response || []);
    } catch (err) {
      console.error("Error cargando lista de clientes:", err);
      setError("Error al cargar la lista de clientes");
    }
  }, []);

  // Función principal para cargar datos de clientes
  const fetchClientes = useCallback(
    async (
      page = 1,
      itemsPerPage = pagination.itemsPerPage,
      filtersToUse = filters,
    ) => {
      setIsLoading(true);
      setError(null);

      // Validar fechas
      if (filtersToUse.fecha_inicio && filtersToUse.fecha_fin) {
        if (filtersToUse.fecha_inicio > filtersToUse.fecha_fin) {
          setErrors((prev) => ({
            ...prev,
            rango_fechas:
              "La fecha de inicio no puede ser mayor a la fecha de fin",
          }));
          setIsLoading(false);
          return;
        }
      }

      try {
        // Preparar filtros para API
        const apiFilters = {
          page: page,
          page_size: itemsPerPage,
        };

        if (filtersToUse.fecha_inicio) {
          apiFilters.fecha_servicio_desde = filtersToUse.fecha_inicio;
        }

        if (filtersToUse.fecha_fin) {
          apiFilters.fecha_servicio_hasta = filtersToUse.fecha_fin;
        }

        if (filtersToUse.cliente_id && filtersToUse.cliente_id.trim() !== "") {
          apiFilters.cliente = filtersToUse.cliente_id.trim();
        }

        // Llamar a la API de monitoreo para clientes
        const response = await monitoreoAPI.getFletes(apiFilters); // Cambiado a getClientes

        setClientesData(response.items || []);
        setMetrics(
          response.metrics || {
            total_clientes: 0,
            monto_total_acumulado: 0,
            total_pendientes: 0,
            facturados: 0,
            no_facturados: 0,
          },
        );

        setPagination({
          currentPage: response.pagination.page,
          itemsPerPage: response.pagination.page_size,
          totalItems: response.pagination.total,
          totalPages: response.pagination.total_pages,
          hasNext: response.pagination.has_next,
          hasPrev: response.pagination.has_prev,
        });
      } catch (err) {
        setError(
          "Error al cargar los datos de clientes: " + (err.message || "Error desconocido"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "mes") {
      setFilters((prev) => ({
        ...prev,
        fecha_inicio: "",
        fecha_fin: "",
      }));
    }

    if (key === "fecha_inicio" || key === "fecha_fin") {
      setErrors((prev) => ({
        ...prev,
        [key]: "",
        rango_fechas: "",
      }));
    }
  }, []);

  // Handler para seleccionar fecha manual
  const handleDateChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      mes: "",
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
      rango_fechas: "",
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      fecha_inicio: "",
      fecha_fin: "",
      cliente_id: "",
      mes: "",
    });
    setErrors({
      fecha_inicio: "",
      fecha_fin: "",
      rango_fechas: "",
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchClientes(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchClientes, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchClientes(newPage, pagination.itemsPerPage, filters);
    },
    [fetchClientes, pagination.itemsPerPage, filters],
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchClientes(1, newItemsPerPage, filters);
    },
    [fetchClientes, filters],
  );

  // Exportar a Excel
  const handleExportarExcel = useCallback(async () => {
    try {
      setLoadingDownload(true);

      const filtersForAPI = {
        fecha_servicio_desde: filters.fecha_inicio,
        fecha_servicio_hasta: filters.fecha_fin,
        cliente_nombre: filters.cliente_id,
      };

      // Asumiendo que existe un endpoint para exportar datos de clientes
      const blob = await fletesAPI.exportAllFletesExcel(filtersForAPI);

      // Función para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `monitoreo_clientes_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Exportación completada exitosamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Error al exportar: " + err.message);
    } finally {
      setLoadingDownload(false);
    }
  }, [filters]);

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(monto || 0);
  };

  // Obtener nombre del cliente por ID
  const getNombreCliente = (clienteId) => {
    if (!clienteId) return "N/A";
    const cliente = clientesList.find(c => c.id === clienteId || c.value === clienteId);
    return cliente?.nombre || cliente?.label || clienteId;
  };

  // Loading inicial
  if (isLoading && clientesData.length === 0) {
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
      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <X className="h-5 w-5 mr-2" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <ReportesClientes />

      <br />

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {/* Total Venta Neta */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Total Vendido (sin IGV)
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {formatearMonto(metrics.monto_total_acumulado)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
             {metrics.total_fletes} fletess
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-yellow-100 rounded-md">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Por facturar
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {metrics.total_pendientes}
          </div>
          <div className="text-xs text-gray-500 mt-1">Fletes pendientes</div>
        </div>

        {/* No facturados */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-orange-100 rounded-md">
              <FileX className="h-4 w-4 text-orange-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Sin factura
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {metrics.valorizados_sin_factura}
          </div>
          <div className="text-xs text-gray-500 mt-1">Sin factura</div>
        </div>

        {/* Facturados */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-green-100 rounded-md">
              <FileCheck className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Con factura
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
             {metrics.valorizados_con_factura}
          </div>
          <div className="text-xs text-gray-500 mt-1">Con factura</div>
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

            <Button onClick={clearFilters} variant="secondary" size="small">
              Limpiar Filtros
            </Button>

            <Button
              onClick={handleExportarExcel}
              disabled={loadingDownload}
              variant="primary"
              size="small"
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
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mes
            </label>
            <select
              value={filters.mes}
              onChange={(e) => handleFilterChange("mes", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Seleccionar mes</option>
              {meses.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Seleccione un mes para rango automático
            </p>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Cliente
            </label>
            <select
              value={filters.cliente_id}
              onChange={(e) => handleFilterChange("cliente_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Todos los clientes</option>
              {clientesList.map((cliente) => (
                <option key={cliente} value={cliente}>
                  {cliente}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => handleDateChange("fecha_inicio", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              max={filters.fecha_fin || new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => handleDateChange("fecha_fin", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              min={filters.fecha_inicio}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Error de rango de fechas */}
        {errors.rango_fechas && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">{errors.rango_fechas}</p>
          </div>
        )}
      </div>

      {/* Información de registros */}
      {clientesData.length > 0 && (
        <div className="mb-4 text-sm text-gray-600 text-center">
          Mostrando {clientesData.length} de {pagination.totalItems} registros de clientes
          {filters.cliente_id && " · Filtrado por cliente"}
          {(filters.fecha_inicio || filters.fecha_fin) &&
            " · Filtrado por rango de fechas"}
        </div>
      )}

      {/* Tabla de Clientes */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                   Cliente
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Monto
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Fecha de Servicio
                </th>
              
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Origen
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">
                  Destino
                </th> 
                <th className="py-3 px-4 text-left font-semibold text-gray-700">
                  Placa
                </th> 
              </tr>
            </thead>
            <tbody>
                          {clientesData.map((flete) => (
                            <tr
                              key={flete.id}
                              className="border-b border-gray-200 hover:bg-blue-50"
                            >
                              <td className="px-4 py-3 border-r border-gray-200">
                                <div className="font-medium text-gray-900">
                                  {flete.servicio?.cliente?.nombre || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  RUC: {flete.servicio?.cliente?.ruc || ""}
                                </div>
                              </td>
                              
            
                              <td className="px-4 py-3 border-r border-gray-200">
                                <div className="font-medium text-gray-900">
                                  {formatearMonto(flete.monto_flete)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {flete.estado_flete === "PENDIENTE" ? (
              <span className="text-yellow-600 font-medium">Pendiente</span>
            ) : flete.estado_flete === "VALORIZADO" && flete.pertenece_a_factura ? (
              <span className="text-green-600 font-medium">Facturado</span>
            ) : (
              <span className="text-orange-600 font-medium">Sin factura</span>
            )}
                                </div>
                              </td>
            
                              <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                                <div className="text-gray-900">
                                  {formatFecha(flete?.servicio?.fecha_servicio)}
                                </div>
                              </td>
            
                              
            
                              <td className="px-4 py-3 border-r border-gray-200">
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                                  <span className="text-gray-900">
                                    {flete.servicio?.origen?.split(",")[0] || "N/A"}
                                  </span>
                                </div>
                              </td>
            
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                                  <span className="text-gray-900">
                                    {flete.servicio?.destino?.split(",")[0] || "N/A"}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3 border-r border-gray-200">
                                <div className="font-medium text-gray-900">
                                  {flete.servicio?.flota?.placa || "N/A"}
                                </div>
                                {/* <div className="text-xs text-gray-500">
                                  Código: {flete.codigo_flete}
                                </div> */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {clientesData.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron registros de clientes
            </h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some((f) => f && f.trim() !== "")
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay datos de clientes en el sistema"}
            </p>
            <Button onClick={clearFilters} size="small">
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Paginación */}
      {clientesData.length > 0 && (
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
              pagination.totalItems,
            )}
          />
        </div>
      )}

      
    </div>
  );
};

export default MonitoreoClientes;