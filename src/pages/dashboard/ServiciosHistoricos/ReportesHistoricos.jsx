import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { serviciosHistoricosAPI } from "../../../api/endpoints/serviciosHistoricos";

const ReportesHistoricos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    por_estado_factura: [],
    por_estado_servicio: [],
    por_cliente: [],
    por_mes: [],
    por_proveedor: [],
    total: [{ total: 0 }],
    pendientes_facturacion: [{ total: 0 }]
  });

  const chartEstadosRef = useRef(null);
  const chartClientesRef = useRef(null);
  const chartMensualRef = useRef(null);
  
  const chartEstadosInstance = useRef(null);
  const chartClientesInstance = useRef(null);
  const chartMensualInstance = useRef(null);

  // Función para obtener los datos del backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviciosHistoricosAPI.getEstadisticas();
      setData(response.data || response);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setError('No se pudieron cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar y combinar datos de ALICORP y ALICOPR
  const procesarDatosClientes = (clientes) => {
    const clientesMap = {};
    
    clientes.forEach(cliente => {
      const nombre = cliente._id;
      // Combinar ALICORP y ALICOPR
      if (nombre === 'ALICORP' || nombre === 'ALICOPR') {
        if (!clientesMap['ALICORP']) {
          clientesMap['ALICORP'] = { _id: 'ALICORP', cantidad: 0 };
        }
        clientesMap['ALICORP'].cantidad += cliente.cantidad;
      } else if (nombre !== 'DESCONOCIDO') {
        // Excluir "DESCONOCIDO" y otros valores no deseados
        clientesMap[nombre] = { ...cliente };
      }
    });
    
    // Ordenar por cantidad descendente y tomar top 10
    return Object.values(clientesMap)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8); // Top 8 para coincidir con el diseño original
  };

  // Función para procesar datos mensuales en orden correcto
  const procesarDatosMensuales = (meses) => {
    const ordenMeses = ['Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesesMap = {};
    
    meses.forEach(mes => {
      mesesMap[mes._id] = mes.cantidad;
    });
    
    return ordenMeses.map(mes => mesesMap[mes] || 0);
  };

  // Función para obtener etiquetas cortas de meses
  const obtenerEtiquetasMeses = (meses) => {
    const etiquetasCortas = {
      'Enero': 'Ene', 'Febrero': 'Feb', 'Marzo': 'Mar', 'Abril': 'Abr',
      'Mayo': 'May', 'Junio': 'Jun', 'Julio': 'Jul', 'Agosto': 'Ago',
      'Setiembre': 'Set', 'Octubre': 'Oct', 'Noviembre': 'Nov', 'Diciembre': 'Dic'
    };
    
    return meses.map(mes => etiquetasCortas[mes._id] || mes._id.substring(0, 3));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loading || error) return;

    // Preparar datos para gráficos
    const clientesProcesados = procesarDatosClientes(data.por_cliente);
    const datosMensuales = procesarDatosMensuales(data.por_mes);
    const etiquetasMeses = obtenerEtiquetasMeses(data.por_mes);

    // Inicializar gráficos cuando los datos estén disponibles
    if (chartEstadosRef.current && chartClientesRef.current && chartMensualRef.current) {
      // Destruir gráficos anteriores si existen
      if (chartEstadosInstance.current) chartEstadosInstance.current.destroy();
      if (chartClientesInstance.current) chartClientesInstance.current.destroy();
      if (chartMensualInstance.current) chartMensualInstance.current.destroy();

      // Configuración de Gráfico Circular (Estados)
      chartEstadosInstance.current = new Chart(chartEstadosRef.current, {
        type: 'doughnut',
        data: {
          labels: data.por_estado_factura.map(estado => estado._id),
          datasets: [{
            data: data.por_estado_factura.map(estado => estado.cantidad),
            backgroundColor: ['#f59e0b', '#10b981', '#3b82f6'],
            borderWidth: 0
          }]
        },
        options: {
          plugins: { 
            legend: { 
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
              }
            } 
          },
          cutout: '70%'
        }
      });

      // Configuración de Gráfico Clientes
      chartClientesInstance.current = new Chart(chartClientesRef.current, {
        type: 'bar',
        data: {
          labels: clientesProcesados.map(cliente => cliente._id),
          datasets: [{
            label: 'Servicios',
            data: clientesProcesados.map(cliente => cliente.cantidad),
            backgroundColor: '#6366f1',
            borderRadius: 5
          }]
        },
        options: {
          scales: { 
            y: { 
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: { 
            legend: { 
              display: false 
            } 
          },
          maintainAspectRatio: false
        }
      });

      // Configuración de Gráfico Mensual
      chartMensualInstance.current = new Chart(chartMensualRef.current, {
        type: 'line',
        data: {
          labels: etiquetasMeses,
          datasets: [{
            label: 'Volumen',
            data: datosMensuales,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          scales: {
            y: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: { 
            legend: { 
              display: false 
            } 
          },
          maintainAspectRatio: false
        }
      });
    }

    // Limpiar gráficos al desmontar el componente
    return () => {
      if (chartEstadosInstance.current) chartEstadosInstance.current.destroy();
      if (chartClientesInstance.current) chartClientesInstance.current.destroy();
      if (chartMensualInstance.current) chartMensualInstance.current.destroy();
    };
  }, [data, loading, error]);

  // Calcular datos para las tarjetas
  const totalOperaciones = data.total[0]?.total || 0;
  const pendientesFacturacion = data.pendientes_facturacion[0]?.total || 0;
  
  // Buscar el monto facturado (estado FACTURADO)
  const estadoFacturado = data.por_estado_factura.find(estado => estado._id === 'FACTURADO');
  const montoFacturado = estadoFacturado?.monto_total || 0;
  
  // Buscar servicios completados
  const estadoCompletado = data.por_estado_servicio.find(estado => estado._id === 'COMPLETADO');
  const serviciosCompletados = estadoCompletado?.cantidad || 0;
  
  // Calcular porcentaje de servicios completados
  const porcentajeCompletados = totalOperaciones > 0 
    ? ((serviciosCompletados / totalOperaciones) * 100).toFixed(1)
    : 0;

  // Procesar proveedores para la tabla
  const proveedoresParaTabla = data.por_proveedor.slice(0, 10);
  const otrosProveedores = data.por_proveedor.length - 2;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 font-medium mb-2">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans">
      <main className=" mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Total Operaciones</p>
            <h3 className="text-3xl font-bold text-gray-800">{totalOperaciones.toLocaleString()}</h3>
            <p className="text-xs text-blue-500 mt-2">
              <i className="fas fa-sync mr-1"></i> Datos históricos
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
            <p className="text-sm text-gray-500 font-medium text-red-600">Pendientes Facturación</p>
            <h3 className="text-3xl font-bold text-gray-800">{pendientesFacturacion.toLocaleString()}</h3>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
              <div 
                className="bg-red-500 h-1.5 rounded-full" 
                style={{ 
                  width: totalOperaciones > 0 
                    ? `${(pendientesFacturacion / totalOperaciones * 100)}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
            <p className="text-sm text-gray-500 font-medium text-green-600">Monto Facturado</p>
            <h3 className="text-3xl font-bold text-gray-800">S/ {montoFacturado.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 mt-2">Solo estado 'FACTURADO'</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Servicios Completados</p>
            <h3 className="text-3xl font-bold text-gray-800">{serviciosCompletados.toLocaleString()}</h3>
            <p className="text-xs text-green-500 mt-2">
              <i className="fas fa-check-circle mr-1"></i> {porcentajeCompletados}% del total
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
            <h4 className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider">
              Distribución de Facturación
            </h4>
            <div className="relative h-64">
              <canvas id="chartEstados" ref={chartEstadosRef}></canvas>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h4 className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider">
              Volumen por Cliente (Top {data.por_cliente.length > 8 ? 8 : data.por_cliente.length})
            </h4>
            <div className="relative h-64">
              <canvas id="chartClientes" ref={chartClientesRef}></canvas>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h4 className="text-gray-700 font-bold uppercase text-xs tracking-wider">
                Carga por Proveedor (Top {proveedoresParaTabla.length})
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Proveedor</th>
                    <th className="px-6 py-3 font-medium text-right">Cantidad</th>
                    <th className="px-6 py-3 font-medium">Capacidad Utilizada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {proveedoresParaTabla.slice(0, 2).map((proveedor, index) => {
                    const porcentaje = (proveedor.cantidad / data.por_proveedor[0]?.cantidad * 100) || 0;
                    return (
                      <tr key={proveedor._id}>
                        <td className={`px-6 py-4 ${index === 0 ? 'font-semibold text-blue-600' : ''}`}>
                          {proveedor._id}
                        </td>
                        <td className="px-6 py-4 text-right">{proveedor.cantidad.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-100 rounded h-2">
                            <div 
                              className={`h-2 rounded ${index === 0 ? 'bg-blue-600' : 'bg-gray-400'}`}
                              style={{ width: `${Math.min(porcentaje, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {otrosProveedores > 0 && (
                    <tr>
                      <td className="px-6 py-4 font-light italic text-gray-400 text-xs" colSpan="3">
                        + Otros {otrosProveedores} proveedores con menos de {proveedoresParaTabla[2]?.cantidad || 0} servicios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider">
              Evolución Mensual de Servicios
            </h4>
            <div className="relative h-64">
              <canvas id="chartMensual" ref={chartMensualRef}></canvas>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p>Última actualización: {new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </main>
    </div>
  );
};

export default ReportesHistoricos;