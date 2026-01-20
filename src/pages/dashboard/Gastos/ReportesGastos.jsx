import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { gastosAPI } from "../../../api/endpoints/gastos";

const ReportesGastos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    total: 0,
    pendientes: 0,
    aprobados: 0,
    rechazados: 0,
    pagados: 0,
    por_ambito: {},
    por_placa: {},
    por_tipo_gasto: {},
    total_gastado: 0
  });

  const chartEstadosRef = useRef(null);
  const chartPlacasRef = useRef(null);
  const chartTiposRef = useRef(null);
  
  const chartEstadosInstance = useRef(null);
  const chartPlacasInstance = useRef(null);
  const chartTiposInstance = useRef(null);

  // Función para obtener los datos del backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await gastosAPI.getEstadisticas();
      setData(response.data || response);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setError('No se pudieron cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loading || error) return;

    // Preparar datos para gráficos
    const placasData = Object.entries(data.por_placa || {})
      .map(([placa, cantidad]) => ({ placa, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8);

    const tiposData = Object.entries(data.por_tipo_gasto || {})
      .map(([tipo, cantidad]) => ({ tipo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Inicializar gráficos cuando los datos estén disponibles
    if (chartEstadosRef.current && chartPlacasRef.current && chartTiposRef.current) {
      // Destruir gráficos anteriores si existen
      if (chartEstadosInstance.current) chartEstadosInstance.current.destroy();
      if (chartPlacasInstance.current) chartPlacasInstance.current.destroy();
      if (chartTiposInstance.current) chartTiposInstance.current.destroy();

      // Configuración de Gráfico Circular (Estados)
      const estadosLabels = ['Pendientes', 'Aprobados', 'Rechazados', 'Pagados'];
      const estadosData = [data.pendientes, data.aprobados, data.rechazados, data.pagados];
      const estadosColors = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

      chartEstadosInstance.current = new Chart(chartEstadosRef.current, {
        type: 'doughnut',
        data: {
          labels: estadosLabels,
          datasets: [{
            data: estadosData,
            backgroundColor: estadosColors,
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

      // Configuración de Gráfico Placas
      chartPlacasInstance.current = new Chart(chartPlacasRef.current, {
        type: 'bar',
        data: {
          labels: placasData.map(item => item.placa),
          datasets: [{
            label: 'Gastos',
            data: placasData.map(item => item.cantidad),
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

      // Configuración de Gráfico Tipos de Gasto
      chartTiposInstance.current = new Chart(chartTiposRef.current, {
        type: 'bar',
        data: {
          labels: tiposData.map(item => item.tipo),
          datasets: [{
            label: 'Cantidad',
            data: tiposData.map(item => item.cantidad),
            backgroundColor: '#8b5cf6',
            borderRadius: 5
          }]
        },
        options: {
          indexAxis: 'y',
          scales: { 
            x: { 
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            y: {
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
      if (chartPlacasInstance.current) chartPlacasInstance.current.destroy();
      if (chartTiposInstance.current) chartTiposInstance.current.destroy();
    };
  }, [data, loading, error]);

  // Calcular porcentajes
  const porcentajePendientes = data.total > 0 
    ? ((data.pendientes / data.total) * 100).toFixed(1)
    : 0;

  const porcentajePagados = data.total > 0 
    ? ((data.pagados / data.total) * 100).toFixed(1)
    : 0;

  // Preparar datos de ámbito para la tabla
  const ambitoData = Object.entries(data.por_ambito || {})
    .map(([ambito, cantidad]) => ({ ambito, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

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
      <main className="mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Total Gastos</p>
            <h3 className="text-3xl font-bold text-gray-800">{data.total.toLocaleString()}</h3>
            <p className="text-xs text-blue-500 mt-2">
              <i className="fas fa-receipt mr-1"></i> Registros históricos
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
            <p className="text-sm text-gray-500 font-medium text-amber-600">Pendientes Aprobación</p>
            <h3 className="text-3xl font-bold text-gray-800">{data.pendientes.toLocaleString()}</h3>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ width: `${porcentajePendientes}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
            <p className="text-sm text-gray-500 font-medium text-green-600">Total Gastado</p>
            <h3 className="text-3xl font-bold text-gray-800">S/ {data.total_gastado.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 mt-2">Acumulado histórico</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Gastos Pagados</p>
            <h3 className="text-3xl font-bold text-gray-800">{data.pagados.toLocaleString()}</h3>
            <p className="text-xs text-green-500 mt-2">
              <i className="fas fa-check-circle mr-1"></i> {porcentajePagados}% del total
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
            <h4 className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider">
              Distribución por Estado
            </h4>
            <div className="relative h-64">
              <canvas ref={chartEstadosRef}></canvas>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h4 className="text-gray-700 font-bold mb-4 uppercase text-xs tracking-wider">
              Gastos por Placa (Top 8)
            </h4>
            <div className="relative h-64">
              <canvas ref={chartPlacasRef}></canvas>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h4 className="text-gray-700 font-bold uppercase text-xs tracking-wider">
                Distribución por Ámbito
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Ámbito</th>
                    <th className="px-6 py-3 font-medium text-right">Cantidad</th>
                    <th className="px-6 py-3 font-medium">Porcentaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ambitoData.map((item, index) => {
                    const porcentaje = (item.cantidad / data.total * 100) || 0;
                    return (
                      <tr key={item.ambito}>
                        <td className={`px-6 py-4 ${index === 0 ? 'font-semibold text-blue-600' : ''} capitalize`}>
                          {item.ambito}
                        </td>
                        <td className="px-6 py-4 text-right">{item.cantidad.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-100 rounded h-2">
                              <div 
                                className={`h-2 rounded ${index === 0 ? 'bg-blue-600' : 'bg-gray-400'}`}
                                style={{ width: `${Math.min(porcentaje, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">
                              {porcentaje.toFixed(1)}%
                            </span>
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
              Gastos por Tipo
            </h4>
            <div className="relative h-64">
              <canvas ref={chartTiposRef}></canvas>
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

export default ReportesGastos;