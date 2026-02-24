import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { serviciosPrincipalesAPI } from '../../../api/endpoints/servicioPrincipal';

const ReportesPrincipales = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    resumen_general: {
      total_fletes: 0,
      programados: 0,
      cancelados: 0,
      completados: 0,
      total_lima: 0,
      total_provincia: 0
    },
    top_conductores: [],
    top_clientes: [],
    top_placas: [],
    top_modalidades: [],
    servicios_por_mes: []
  });

  const chartConductoresRef = useRef(null);
  const chartClientesRef = useRef(null);
  const chartMensualRef = useRef(null);
  
  const chartConductoresInstance = useRef(null);
  const chartClientesInstance = useRef(null);
  const chartMensualInstance = useRef(null);

  // Función para obtener los datos del backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviciosPrincipalesAPI.getAnaliticasGenerales();
      setData(response.data || response);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setError('No se pudieron cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
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

  // Función para generar colores basados en el índice
  const getColor = (index) => {
    const colors = [
      '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', 
      '#ef4444', '#14b8a6', '#f97316', '#6366f1', '#06b6d4'
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loading || error || !data.servicios_por_mes.length) return;

    // Preparar datos para gráficos
    const etiquetasMeses = obtenerEtiquetasMeses(data.servicios_por_mes);
    const datosMensuales = data.servicios_por_mes.map(mes => mes.total);

    // Inicializar gráficos cuando los datos estén disponibles
    if (chartConductoresRef.current && chartClientesRef.current && chartMensualRef.current) {
      // Destruir gráficos anteriores si existen
      if (chartConductoresInstance.current) chartConductoresInstance.current.destroy();
      if (chartClientesInstance.current) chartClientesInstance.current.destroy();
      if (chartMensualInstance.current) chartMensualInstance.current.destroy();

      // Configuración de Gráfico Circular (Conductores)
      chartConductoresInstance.current = new Chart(chartConductoresRef.current, {
        type: 'doughnut',
        data: {
          labels: data.top_conductores.map(conductor => {
            // Acortar nombres muy largos
            const nombre = conductor._id;
            return nombre.length > 20 ? nombre.substring(0, 18) + '...' : nombre;
          }),
          datasets: [{
            data: data.top_conductores.map(conductor => conductor.total),
            backgroundColor: data.top_conductores.map((_, index) => getColor(index)),
            borderWidth: 0
          }]
        },
        options: {
          plugins: { 
            legend: { 
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true,
                boxWidth: 8,
                font: {
                  size: 10
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} servicios (${percentage}%)`;
                }
              }
            }
          },
          cutout: '65%',
          maintainAspectRatio: false
        }
      });

      // Configuración de Gráfico Clientes
      chartClientesInstance.current = new Chart(chartClientesRef.current, {
        type: 'bar',
        data: {
          labels: data.top_clientes.map(cliente => {
            // Acortar nombres de clientes largos
            const nombre = cliente._id;
            return nombre.length > 25 ? nombre.substring(0, 23) + '...' : nombre;
          }),
          datasets: [{
            label: 'Servicios',
            data: data.top_clientes.map(cliente => cliente.total),
            backgroundColor: '#10b981',
            borderRadius: 5,
            barPercentage: 0.6
          }]
        },
        options: {
          scales: { 
            y: { 
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                stepSize: 25,
                callback: (value) => value.toLocaleString()
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10
                }
              }
            }
          },
          plugins: { 
            legend: { 
              display: false 
            },
            tooltip: {
              callbacks: {
                label: (context) => `Servicios: ${context.raw.toLocaleString()}`
              }
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
            label: 'Servicios',
            data: datosMensuales,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                stepSize: 50,
                callback: (value) => value.toLocaleString()
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
            },
            tooltip: {
              callbacks: {
                label: (context) => `Servicios: ${context.raw.toLocaleString()}`
              }
            }
          },
          maintainAspectRatio: false
        }
      });
    }

    // Limpiar gráficos al desmontar el componente
    return () => {
      if (chartConductoresInstance.current) chartConductoresInstance.current.destroy();
      if (chartClientesInstance.current) chartClientesInstance.current.destroy();
      if (chartMensualInstance.current) chartMensualInstance.current.destroy();
    };
  }, [data, loading, error]);

  // Calcular porcentajes para las tarjetas
  const totalServicios = data.resumen_general.total_fletes || 0;
  const completados = data.resumen_general.completados || 0;
  const programados = data.resumen_general.programados || 0;
  const cancelados = data.resumen_general.cancelados || 0;
  const lima = data.resumen_general.total_lima || 0;
  const provincia = data.resumen_general.total_provincia || 0;
  
  const porcentajeCompletados = totalServicios > 0 
    ? ((completados / totalServicios) * 100).toFixed(1)
    : 0;
  
  const porcentajeCancelados = totalServicios > 0
    ? ((cancelados / totalServicios) * 100).toFixed(1)
    : 0;

  const porcentajeLima = totalServicios > 0
    ? ((lima / totalServicios) * 100).toFixed(1)
    : 0;

  // Encontrar el valor máximo para las barras de la tabla
  const maxServiciosPlaca = data.top_placas.length > 0 ? data.top_placas[0].total : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicios principales...</p>
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
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans">
      <main className="mx-auto space-y-6">
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Total Servicios</p>
            <h3 className="text-3xl font-bold text-gray-800">{totalServicios.toLocaleString()}</h3>
            <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
              <i className="fas fa-truck"></i> Servicios principales
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
            <p className="text-sm text-gray-500 font-medium text-green-600">Completados</p>
            <h3 className="text-3xl font-bold text-gray-800">{completados.toLocaleString()}</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${porcentajeCompletados}%` }}
              ></div>
            </div>
            <p className="text-xs text-green-500 mt-2">{porcentajeCompletados}% del total</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
            <p className="text-sm text-gray-500 font-medium text-yellow-600">Programados</p>
            <h3 className="text-3xl font-bold text-gray-800">{programados.toLocaleString()}</h3>
            <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
              <i className="fas fa-calendar"></i> Pendientes de ejecución
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
            <p className="text-sm text-gray-500 font-medium text-red-600">Cancelados</p>
            <h3 className="text-3xl font-bold text-gray-800">{cancelados.toLocaleString()}</h3>
            <p className="text-xs text-red-500 mt-2">
              {porcentajeCancelados}% del total
            </p>
          </div>
        </div>

        {/* Gráficos de conductores y clientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
            <h4 className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider flex items-center justify-between">
              <span>Top 5 Conductores</span>
              <span className="text-gray-400 font-normal text-xxs">{data.top_conductores.length} registros</span>
            </h4>
            <div className="relative h-80">
              <canvas id="chartConductores" ref={chartConductoresRef}></canvas>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              {data.top_conductores.slice(0, 3).map((conductor, index) => (
                <div key={conductor._id} className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(index) }}></span>
                    {conductor._id.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className="font-semibold text-gray-800">{conductor.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h4 className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider flex items-center justify-between">
              <span>Volumen por Cliente</span>
              <span className="text-gray-400 font-normal text-xxs">Total: {totalServicios.toLocaleString()} servicios</span>
            </h4>
            <div className="relative h-80">
              <canvas id="chartClientes" ref={chartClientesRef}></canvas>
            </div>
          </div>
        </div>

        {/* Tablas y gráfico mensual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h4 className="text-gray-700 font-bold uppercase text-xs tracking-wider flex items-center justify-between">
                <span>Top Vehículos</span>
                <span className="text-gray-400 font-normal text-xxs">{data.top_placas.length} unidades</span>
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Placa</th>
                    <th className="px-6 py-3 font-medium text-right">Servicios</th>
                    <th className="px-6 py-3 font-medium">% del Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.top_placas.map((placa, index) => {
                    const porcentaje = totalServicios > 0 
                      ? ((placa.total / totalServicios) * 100).toFixed(1)
                      : 0;
                    return (
                      <tr key={placa._id} className="hover:bg-gray-50">
                        <td className={`px-6 py-4 font-mono font-medium ${index === 0 ? 'text-orange-600' : ''}`}>
                          {placa._id}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">{placa.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-100 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${index === 0 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                style={{ width: `${(placa.total / maxServiciosPlaca) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{porcentaje}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider">
              Evolución Mensual {new Date().getFullYear()}
            </h4>
            <div className="relative h-64">
              <canvas id="chartMensual" ref={chartMensualRef}></canvas>
            </div>
            
            {/* Resumen de modalidades */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h5 className="text-gray-600 font-semibold text-sm mb-3">Distribución por Modalidad</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.top_modalidades.map((modalidad, index) => {
                  const porcentaje = totalServicios > 0 
                    ? ((modalidad.total / totalServicios) * 100).toFixed(1)
                    : 0;
                  return (
                    <div key={modalidad._id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase mb-1">{modalidad._id}</p>
                      <p className="text-lg font-bold text-gray-800">{modalidad.total.toLocaleString()}</p>
                      <p className="text-xs" style={{ color: getColor(index) }}>{porcentaje}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Información de ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                <i className="fas fa-city mr-2 text-blue-500"></i>
                Servicios Lima
              </span>
              <span className="text-lg font-bold text-gray-800">{lima.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${porcentajeLima}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{porcentajeLima}% del total</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                <i className="fas fa-mountain mr-2 text-purple-500"></i>
                Servicios Provincia
              </span>
              <span className="text-lg font-bold text-gray-800">{provincia.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-500 h-2.5 rounded-full" 
                style={{ width: `${(provincia / totalServicios) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{((provincia / totalServicios) * 100).toFixed(1)}% del total</p>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <i className="fas fa-chart-line text-orange-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">Promedio mensual</p>
                <p className="text-xl font-bold text-gray-800">
                  {Math.round(totalServicios / data.servicios_por_mes.length).toLocaleString()} servicios
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">Eficiencia</p>
                <p className="text-xl font-bold text-gray-800">{porcentajeCompletados}% completados</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <i className="fas fa-tachometer-alt text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">Top modalidad</p>
                <p className="text-xl font-bold text-gray-800">{data.top_modalidades[0]?._id || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p>Servicios Principales - Actualizado: {new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p className="mt-1 text-gray-400">Total servicios: {totalServicios.toLocaleString()} | Completados: {completados.toLocaleString()} ({porcentajeCompletados}%)</p>
        </div>
      </main>
    </div>
  );
};

export default ReportesPrincipales;