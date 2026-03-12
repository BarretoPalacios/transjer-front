import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { monitoreoAPI } from '../../../api/endpoints/monitoreo';
import { Loader, Users, BarChart, Calendar } from 'lucide-react';

const ReportesClientes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [useMonthFilter, setUseMonthFilter] = useState(false);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    start_date: '',
    end_date: ''
  });

  // Refs para los gráficos
  const chartMontoRef = useRef(null);
  const chartMontoInstance = useRef(null);

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  const years = [2026, 2027, 2028, 2029, 2030];

  // Función para obtener el primer y último día del mes
  const getMonthDateRange = (year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    return {
      start_date: formatDate(startDate),
      end_date: formatDate(endDate)
    };
  };

  // Función para generar colores
  const getColor = (index) => {
    const colors = [
      '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', 
      '#ef4444', '#14b8a6', '#f97316', '#6366f1', '#06b6d4'
    ];
    return colors[index % colors.length];
  };

  // Efecto para actualizar fechas cuando cambia el mes/año
  useEffect(() => {
    if (useMonthFilter && filters.month && filters.year) {
      const { start_date, end_date } = getMonthDateRange(parseInt(filters.year), parseInt(filters.month));
      setFilters(prev => ({
        ...prev,
        start_date,
        end_date
      }));
    }
  }, [filters.month, filters.year, useMonthFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await monitoreoAPI.getMetricsClientes(filters);
      setData(response);
    } catch (err) {
      console.error('Error al obtener reporte de clientes:', err);
      setError('No se pudo cargar el reporte. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambian los filtros (tiempo real)
  useEffect(() => {
    fetchData();
  }, [filters.start_date, filters.end_date, filters.month, filters.year]);

  // Efecto para crear/actualizar gráficos
  useEffect(() => {
    if (loading || error || !data || !data.detalle_clientes || !data.detalle_clientes.length) return;

    // Destruir gráficos anteriores
    if (chartMontoInstance.current) {
      chartMontoInstance.current.destroy();
      chartMontoInstance.current = null;
    }

    // Preparar datos para gráficos
    const clientes = data.detalle_clientes.map(c => {
      const nombre = c.cliente;
      return nombre.length > 20 ? nombre.substring(0, 18) + '...' : nombre;
    });
    
    const montos = data.detalle_clientes.map(c => c.monto_total);

    // Gráfico de Montos por Cliente (Barras)
    if (chartMontoRef.current) {
      chartMontoInstance.current = new Chart(chartMontoRef.current, {
        type: 'bar',
        data: {
          labels: clientes,
          datasets: [{
            label: 'Monto Total (S/)',
            data: montos,
            backgroundColor: montos.map((_, index) => getColor(index)),
            borderRadius: 5,
            barPercentage: 0.6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              ticks: {
                callback: (value) => 'S/ ' + value.toLocaleString()
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: { size: 10 }
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Monto: S/ ${context.raw.toLocaleString()}`
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartMontoInstance.current) {
        chartMontoInstance.current.destroy();
        chartMontoInstance.current = null;
      }
    };
  }, [data, loading, error]);

  const handleMonthChange = (key, value) => {
    setUseMonthFilter(true);
    setFilters(prev => ({
      ...prev,
      [key]: value ? parseInt(value) : ''
    }));
  };

  const handleDateChange = (key, value) => {
    setUseMonthFilter(false);
    setFilters(prev => ({
      ...prev,
      [key]: value,
      month: '',
      year: ''
    }));
  };

  const handleShowFullPeriod = () => {
    setUseMonthFilter(false);
    setFilters({
      month: '',
      year: '',
      start_date: '',
      end_date: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-gray-600">Cargando reporte de clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-gray-800 font-medium mb-3">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
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
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Mes:</label>
              <select
                value={filters.month}
                onChange={(e) => handleMonthChange('month', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los meses</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Año:</label>
              <select
                value={filters.year}
                onChange={(e) => handleMonthChange('year', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los años</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-6 border-l border-gray-300"></div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Fecha inicio:</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Fecha fin:</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleDateChange('end_date', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleShowFullPeriod}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
            >
              Mostrar período completo
            </button>
          </div>

          {/* Indicador de filtro activo */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3 text-gray-400" />
            {filters.start_date && filters.end_date ? (
              <span className="text-gray-600">
                Mostrando datos desde {new Date(filters.start_date).toLocaleDateString()} hasta {new Date(filters.end_date).toLocaleDateString()}
              </span>
            ) : !filters.start_date && !filters.end_date && !filters.month && !filters.year ? (
              <span className="text-gray-600">
                Mostrando período completo (todos los datos)
              </span>
            ) : filters.month && filters.year ? (
              <span className="text-gray-600">
                Mostrando datos de {months.find(m => m.value === parseInt(filters.month))?.label} {filters.year}
              </span>
            ) : (
              <span className="text-gray-600">
                Filtros personalizados aplicados
              </span>
            )}
          </div>
        </div>

        {data && (
          <>
            {/* Encabezado del período */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Período</p>
                  <p className="text-2xl font-bold">{data.periodo || 'Todos los datos'}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Total período</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.resumen?.monto_total_periodo || 0)}</p>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            {data.detalle_clientes && data.detalle_clientes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Montos por Cliente */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-blue-600" />
                        Montos por Cliente
                      </h4>
                      <span className="text-xs text-gray-400">
                        Total: {formatCurrency(data.resumen?.monto_total_periodo || 0)}
                      </span>
                    </div>
                    <div className="relative h-80">
                      <canvas ref={chartMontoRef}></canvas>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-700">Detalle por Cliente</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-5 py-3 text-left font-medium text-gray-600">Cliente</th>
                            <th className="px-5 py-3 text-right font-medium text-gray-600">Fletes</th>
                            <th className="px-5 py-3 text-right font-medium text-gray-600">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.detalle_clientes.map((cliente, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-5 py-3 font-medium text-gray-900">
                                {cliente.cliente}
                              </td>
                              <td className="px-5 py-3 text-right text-gray-700">
                                {cliente.total_fletes}
                              </td>
                              <td className="px-5 py-3 text-right font-medium text-blue-600">
                                {formatCurrency(cliente.monto_total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No hay datos para el período seleccionado
                </h3>
                <p className="text-gray-500">
                  {filters.start_date && filters.end_date 
                    ? `Desde ${new Date(filters.start_date).toLocaleDateString()} hasta ${new Date(filters.end_date).toLocaleDateString()}`
                    : filters.month && filters.year
                    ? `${months.find(m => m.value === parseInt(filters.month))?.label} ${filters.year}`
                    : 'Sin filtros de fecha - Período completo'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ReportesClientes;