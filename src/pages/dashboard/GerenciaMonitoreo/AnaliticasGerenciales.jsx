import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { facturacionGestionAPI } from "../../../api/endpoints/facturacionGestion";
import {
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
  Truck,
  Users,
  MapPin,
  Building,
  BarChart3,
  Calendar,
  RefreshCw,
  AlertCircle,
  Filter,
  TrendingDown,
  CheckCircle,
  Percent
} from 'lucide-react';
import Button from '../../../components/common/Button/Button';

const AnaliticasGerenciales = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeframe, setTimeframe] = useState('month'); // "day", "week", "month", "year"
  const [data, setData] = useState({
    kpis: {
      facturado_total: "0.00",
      pagado_total: "0.00",
      pendiente_total: "0.00",
      total_facturas: 0,
      total_fletes: 0,
      facturas_vencidas: 0
    },
    graficos: {
      linea_tiempo: {
        labels: [],
        datasets: []
      },
      conductores_activos: {
        labels: [],
        data: []
      },
      rutas_top: {
        labels: [],
        data: []
      },
      clientes_top: {
        labels: [],
        data: []
      },
      proveedores_top: {
        labels: [],
        data: []
      },
      placas_activas: {
        labels: [],
        data: [],
        tonelaje: []
      },
      tendencia_mensual: {
        labels: [],
        data: []
      }
    }
  });

  // Referencias para los gráficos
  const chartLineaTiempoRef = useRef(null);
  const chartConductoresRef = useRef(null);
  const chartRutasRef = useRef(null);
  const chartClientesRef = useRef(null);
  const chartProveedoresRef = useRef(null);
  const chartPlacasRef = useRef(null);
  const chartTendenciaRef = useRef(null);
  
  const chartLineaTiempoInstance = useRef(null);
  const chartConductoresInstance = useRef(null);
  const chartRutasInstance = useRef(null);
  const chartClientesInstance = useRef(null);
  const chartProveedoresInstance = useRef(null);
  const chartPlacasInstance = useRef(null);
  const chartTendenciaInstance = useRef(null);

  // Función para obtener los datos del backend
  const fetchData = async (selectedTimeframe = timeframe) => {
    try {
      setLoading(true);
      setError(null);
      const response = await facturacionGestionAPI.getAnalyticsAvanzadas(selectedTimeframe);
      setData(response);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error al obtener análisis gerenciales:', err);
      setError('No se pudieron cargar los datos analíticos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear montos
  const formatCurrency = (value) => {
    // Si es string con comas, limpiarlo primero
    let num;
    if (typeof value === 'string') {
      num = parseFloat(value.replace(/,/g, ''));
    } else {
      num = value;
    }
    
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(num);
  };

  // Función para obtener la etiqueta del timeframe
  const getTimeframeLabel = (tf) => {
    switch(tf) {
      case 'day': return 'Día';
      case 'week': return 'Semana';
      case 'month': return 'Mes';
      case 'year': return 'Año';
      default: return 'Mes';
    }
  };

  // Función para obtener el título del gráfico según timeframe
  const getChartTitle = (baseTitle) => {
    const tfLabel = getTimeframeLabel(timeframe);
    switch(timeframe) {
      case 'day':
        return `${baseTitle} - Hoy`;
      case 'week':
        return `${baseTitle} - Esta semana`;
      case 'month':
        return `${baseTitle} - Este mes`;
      case 'year':
        return `${baseTitle} - Este año`;
      default:
        return baseTitle;
    }
  };

  // Función para procesar etiquetas largas (rutas)
  const procesarEtiquetasRutas = (rutas) => {
    return rutas.map(ruta => {
      if (ruta && ruta.length > 30) {
        const [origen, destino] = ruta.split('→');
        if (origen && destino) {
          return `${origen.trim().substring(0, 15)}... → ${destino.trim().substring(0, 15)}...`;
        }
        return ruta.substring(0, 30) + '...';
      }
      return ruta || '';
    });
  };

  // Función para calcular métricas adicionales
  const calcularMetricasAdicionales = () => {
    const facturado = parseFloat(data.kpis.facturado_total?.replace(/,/g, '') || 0);
    const pagado = parseFloat(data.kpis.pagado_total?.replace(/,/g, '') || 0);
    const pendiente = parseFloat(data.kpis.pendiente_total?.replace(/,/g, '') || 0);
    const totalFacturas = data.kpis.total_facturas || 0;
    const totalFletes = data.kpis.total_fletes || 0;
    const facturasVencidas = data.kpis.facturas_vencidas || 0;

    return {
      tasaCobranza: facturado > 0 ? ((pagado / facturado) * 100).toFixed(1) : '0.0',
      promedioPorFactura: totalFacturas > 0 ? (facturado / totalFacturas).toFixed(2) : '0.00',
      promedioPorFlete: totalFletes > 0 ? (facturado / totalFletes).toFixed(2) : '0.00',
      tasaVencimiento: totalFacturas > 0 ? ((facturasVencidas / totalFacturas) * 100).toFixed(1) : '0.0',
      pendientePorcentaje: facturado > 0 ? ((pendiente / facturado) * 100).toFixed(1) : '0.0',
      eficienciaCobranza: totalFacturas > 0 ? ((totalFacturas - facturasVencidas) / totalFacturas * 100).toFixed(1) : '100.0'
    };
  };

  // Función para manejar cambio de período
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    fetchData(newTimeframe);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loading || error || !data.graficos) return;

    // Destruir gráficos anteriores si existen
    const destroyAllCharts = () => {
      const charts = [
        chartLineaTiempoInstance,
        chartConductoresInstance,
        chartRutasInstance,
        chartClientesInstance,
        chartProveedoresInstance,
        chartPlacasInstance,
        chartTendenciaInstance
      ];
      
      charts.forEach(chartRef => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      });
    };

    // Inicializar gráficos
    const initCharts = () => {
      // Colores para gráficos
      const colors = {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444',
        purple: '#8b5cf6',
        pink: '#ec4899',
        indigo: '#6366f1',
        cyan: '#06b6d4',
        teal: '#14b8a6'
      };

      // 1. Gráfico de Línea de Tiempo (Facturas vs Monto)
      if (chartLineaTiempoRef.current && data.graficos.linea_tiempo) {
        chartLineaTiempoInstance.current = new Chart(chartLineaTiempoRef.current, {
          type: 'line',
          data: {
            labels: data.graficos.linea_tiempo.labels || [],
            datasets: (data.graficos.linea_tiempo.datasets || []).map((dataset, index) => ({
              ...dataset,
              borderColor: index === 0 ? colors.primary : colors.secondary,
              backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: index === 0 ? colors.primary : colors.secondary,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 5,
              fill: true,
              tension: 0.4
            }))
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  padding: 20,
                  usePointStyle: true,
                  font: {
                    size: 11
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || '';
                    let value = context.raw;
                    
                    if (label.includes('Monto')) {
                      return `${label}: ${formatCurrency(value)}`;
                    }
                    return `${label}: ${value}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  callback: function(value) {
                    const datasets = this.chart.data.datasets;
                    const isMontoChart = datasets.some(ds => ds.label?.includes('Monto'));
                    
                    if (isMontoChart && datasets[0].label?.includes('Monto')) {
                      return formatCurrency(value);
                    }
                    return value;
                  }
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'nearest'
            },
            maintainAspectRatio: false
          }
        });
      }

      // 2. Gráfico de Conductores Activos
      if (chartConductoresRef.current && data.graficos.conductores_activos) {
        chartConductoresInstance.current = new Chart(chartConductoresRef.current, {
          type: 'bar',
          data: {
            labels: data.graficos.conductores_activos.labels || [],
            datasets: [{
              label: 'Fletes Asignados',
              data: data.graficos.conductores_activos.data || [],
              backgroundColor: colors.indigo,
              borderRadius: 6,
              barPercentage: 0.7
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `Fletes: ${context.parsed.x}`;
                  }
                }
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  stepSize: 1
                }
              },
              y: {
                grid: {
                  display: false
                }
              }
            },
            maintainAspectRatio: false
          }
        });
      }

      // 3. Gráfico de Rutas Top (Horizontal Bar)
      if (chartRutasRef.current && data.graficos.rutas_top) {
        const etiquetasProcesadas = procesarEtiquetasRutas(data.graficos.rutas_top.labels || []);
        
        chartRutasInstance.current = new Chart(chartRutasRef.current, {
          type: 'bar',
          data: {
            labels: etiquetasProcesadas,
            datasets: [{
              label: 'Viajes',
              data: data.graficos.rutas_top.data || [],
              backgroundColor: colors.accent,
              borderRadius: 6,
              barPercentage: 0.7
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const index = context.dataIndex;
                    return `Viajes: ${context.parsed.x}`;
                  },
                  afterLabel: (context) => {
                    const index = context.dataIndex;
                    return `Ruta completa: ${data.graficos.rutas_top.labels?.[index] || ''}`;
                  }
                }
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  stepSize: 1
                }
              },
              y: {
                grid: {
                  display: false
                },
                ticks: {
                  font: {
                    size: 10
                  }
                }
              }
            },
            maintainAspectRatio: false
          }
        });
      }

      // 4. Gráfico de Clientes Top (Doughnut)
      if (chartClientesRef.current && data.graficos.clientes_top) {
        chartClientesInstance.current = new Chart(chartClientesRef.current, {
          type: 'doughnut',
          data: {
            labels: data.graficos.clientes_top.labels || [],
            datasets: [{
              data: data.graficos.clientes_top.data || [],
              backgroundColor: [
                colors.primary,
                colors.secondary,
                colors.accent,
                colors.purple,
                colors.pink,
                colors.cyan,
                colors.teal
              ],
              borderWidth: 0,
              hoverOffset: 15
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  padding: 15,
                  usePointStyle: true,
                  pointStyle: 'circle',
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
                    return `${label}: ${formatCurrency(value)}`;
                  }
                }
              }
            },
            cutout: '65%'
          }
        });
      }

      // 5. Gráfico de Proveedores Top
      if (chartProveedoresRef.current && data.graficos.proveedores_top) {
        chartProveedoresInstance.current = new Chart(chartProveedoresRef.current, {
          type: 'bar',
          data: {
            labels: data.graficos.proveedores_top.labels || [],
            datasets: [{
              label: 'Monto Facturado',
              data: data.graficos.proveedores_top.data || [],
              backgroundColor: colors.purple,
              borderRadius: 6,
              barPercentage: 0.7
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `Monto: ${formatCurrency(context.raw)}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  callback: (value) => formatCurrency(value)
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  font: {
                    size: 11
                  }
                }
              }
            },
            maintainAspectRatio: false
          }
        });
      }

      // 6. Gráfico de Placas Activas (Doble Eje)
      if (chartPlacasRef.current && data.graficos.placas_activas) {
        chartPlacasInstance.current = new Chart(chartPlacasRef.current, {
          type: 'bar',
          data: {
            labels: data.graficos.placas_activas.labels || [],
            datasets: [
              {
                label: 'Fletes Asignados',
                data: data.graficos.placas_activas.data || [],
                backgroundColor: colors.primary,
                borderRadius: 6,
                barPercentage: 0.7,
                yAxisID: 'y'
              },
              {
                label: 'Tonelaje (TN)',
                data: data.graficos.placas_activas.tonelaje || [],
                type: 'line',
                borderColor: colors.danger,
                backgroundColor: 'transparent',
                borderWidth: 3,
                pointBackgroundColor: colors.danger,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  font: {
                    size: 11
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Fletes',
                  font: {
                    size: 11
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  stepSize: 1
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Tonelaje (TN)',
                  font: {
                    size: 11
                  }
                },
                grid: {
                  drawOnChartArea: false,
                }
              }
            },
            maintainAspectRatio: false
          }
        });
      }

      // 7. Gráfico de Tendencia Mensual
      if (chartTendenciaRef.current && data.graficos.tendencia_mensual) {
        // Cambiar título según timeframe
        let chartLabel = 'Facturación';
        if (timeframe === 'day') chartLabel = 'Facturación del día';
        else if (timeframe === 'week') chartLabel = 'Facturación semanal';
        else if (timeframe === 'month') chartLabel = 'Facturación mensual';
        else if (timeframe === 'year') chartLabel = 'Facturación anual';
        
        chartTendenciaInstance.current = new Chart(chartTendenciaRef.current, {
          type: 'line',
          data: {
            labels: data.graficos.tendencia_mensual.labels || [],
            datasets: [{
              label: chartLabel,
              data: data.graficos.tendencia_mensual.data || [],
              borderColor: colors.secondary,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: colors.secondary,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 5,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `${chartLabel}: ${formatCurrency(context.raw)}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  callback: (value) => formatCurrency(value)
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            maintainAspectRatio: false
          }
        });
      }
    };

    destroyAllCharts();
    initCharts();

    // Limpiar gráficos al desmontar el componente
    return destroyAllCharts;
  }, [data, loading, error, timeframe]);

  // Calcular métricas adicionales
  const metricasAdicionales = calcularMetricasAdicionales();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando análisis gerenciales...</p>
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
          <Button
            onClick={() => fetchData(timeframe)}
            variant="primary"
            icon={RefreshCw}
            className="mt-4"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 font-sans">
      {/* Encabezado con filtros */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Análisis Gerencial</h1>
            <p className="text-gray-600 text-sm">Dashboard analítico de facturación logística</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Período:</span>
            </div>
            <div className="flex space-x-1">
              <Button
                onClick={() => handleTimeframeChange('day')}
                variant={timeframe === 'day' ? 'primary' : 'secondary'}
                className="text-xs px-3 py-1.5"
              >
                Día
              </Button>
              <Button
                onClick={() => handleTimeframeChange('week')}
                variant={timeframe === 'week' ? 'primary' : 'secondary'}
                className="text-xs px-3 py-1.5"
              >
                Semana
              </Button>
              <Button
                onClick={() => handleTimeframeChange('month')}
                variant={timeframe === 'month' ? 'primary' : 'secondary'}
                className="text-xs px-3 py-1.5"
              >
                Mes
              </Button>
              <Button
                onClick={() => handleTimeframeChange('year')}
                variant={timeframe === 'year' ? 'primary' : 'secondary'}
                className="text-xs px-3 py-1.5"
              >
                Año
              </Button>
            </div>
            <Button
              onClick={() => fetchData(timeframe)}
              variant="secondary"
              icon={RefreshCw}
              className="text-sm"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Facturado Total</p>
              <p className="text-xl font-bold text-gray-800">
                {formatCurrency(data.kpis.facturado_total)}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">{data.kpis.total_facturas} facturas</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Pagado Total</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(data.kpis.pagado_total)}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-green-600">
              {metricasAdicionales.tasaCobranza}% de tasa de cobranza
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Pendiente Total</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(data.kpis.pendiente_total)}
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-red-600">
              {metricasAdicionales.pendientePorcentaje}% del facturado
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Fletes</p>
              <p className="text-xl font-bold text-gray-800">{data.kpis.total_fletes}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Truck className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {formatCurrency(metricasAdicionales.promedioPorFlete)} por flete
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Facturas Vencidas</p>
              <p className="text-xl font-bold text-orange-600">{data.kpis.facturas_vencidas}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-orange-600">
              {metricasAdicionales.tasaVencimiento}% del total
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Eficiencia</p>
              <p className="text-xl font-bold text-indigo-600">
                {metricasAdicionales.eficienciaCobranza}%
              </p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Percent className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">Facturas sin vencer</p>
          </div>
        </div>
      </div>

      {/* Gráficos - Primera Fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Línea de Tiempo */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">
                {getChartTitle('Evolución Temporal')}
              </h3>
            </div>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              {getTimeframeLabel(timeframe)}
            </span>
          </div>
          <div className="relative h-64">
            <canvas ref={chartLineaTiempoRef}></canvas>
          </div>
        </div>

        {/* Clientes Top */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">
                Top Clientes por Facturación
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              {data.graficos.clientes_top?.labels?.length || 0} clientes
            </span>
          </div>
          <div className="relative h-64">
            <canvas ref={chartClientesRef}></canvas>
          </div>
        </div>
      </div>

      {/* Gráficos - Segunda Fila */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Conductores Activos */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">
                Conductores Más Activos ({getTimeframeLabel(timeframe)})
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              {data.graficos.conductores_activos?.labels?.length || 0} conductores
            </span>
          </div>
          <div className="relative h-56">
            <canvas ref={chartConductoresRef}></canvas>
          </div>
        </div>

        {/* Rutas Top */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">
                Rutas Más Frecuentes ({getTimeframeLabel(timeframe)})
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              {data.graficos.rutas_top?.labels?.length || 0} rutas
            </span>
          </div>
          <div className="relative h-56">
            <canvas ref={chartRutasRef}></canvas>
          </div>
        </div>

        {/* Placas Activas */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">
                Vehículos por Fletes y Tonelaje
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              {data.graficos.placas_activas?.labels?.length || 0} vehículos
            </span>
          </div>
          <div className="relative h-56">
            <canvas ref={chartPlacasRef}></canvas>
          </div>
        </div>
      </div>

      {/* Gráficos - Tercera Fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Proveedores Top */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">
                Top Proveedores por Facturación
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              {data.graficos.proveedores_top?.labels?.length || 0} proveedores
            </span>
          </div>
          <div className="relative h-56">
            <canvas ref={chartProveedoresRef}></canvas>
          </div>
        </div>

        {/* Tendencia */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">
                {timeframe === 'day' ? 'Facturación del día' : 
                 timeframe === 'week' ? 'Facturación semanal' :
                 timeframe === 'month' ? 'Facturación mensual' :
                 'Facturación anual'}
              </h3>
            </div>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              {getTimeframeLabel(timeframe)}
            </span>
          </div>
          <div className="relative h-56">
            <canvas ref={chartTendenciaRef}></canvas>
          </div>
        </div>
      </div>

      {/* Resumen de Métricas */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Indicadores Clave de Desempeño (KPIs) - {getTimeframeLabel(timeframe)}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Percent className="h-4 w-4 text-blue-600 mr-1" />
              <p className="text-xs font-medium text-blue-600">Tasa de Cobranza</p>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {metricasAdicionales.tasaCobranza}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(data.kpis.pagado_total)} / {formatCurrency(data.kpis.facturado_total)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
              <p className="text-xs font-medium text-green-600">Promedio por Factura</p>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {formatCurrency(metricasAdicionales.promedioPorFactura)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.kpis.total_facturas} facturas total
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Truck className="h-4 w-4 text-purple-600 mr-1" />
              <p className="text-xs font-medium text-purple-600">Promedio por Flete</p>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {formatCurrency(metricasAdicionales.promedioPorFlete)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.kpis.total_fletes} fletes total
            </p>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-orange-600 mr-1" />
              <p className="text-xs font-medium text-orange-600">Eficiencia</p>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {metricasAdicionales.eficienciaCobranza}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.kpis.facturas_vencidas} de {data.kpis.total_facturas} facturas
            </p>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>
            Última actualización: {lastUpdated ? lastUpdated.toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'No disponible'}
          </p>
          <div className="flex items-center mt-2 md:mt-0">
            <span className="mr-2">Período seleccionado:</span>
            <span className="font-medium">
              {getTimeframeLabel(timeframe)}
            </span>
            <span className="mx-2">•</span>
            <span className="text-gray-400">
              {data.graficos.linea_tiempo?.labels?.length || 0} períodos analizados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnaliticasGerenciales;