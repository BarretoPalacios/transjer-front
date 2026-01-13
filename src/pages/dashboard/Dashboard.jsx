import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  CreditCard,
  Users,
  Package,
  DollarSign,
  FileText,
  UserCheck,
  ShieldCheck,
  Settings,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  UserPlus,
  Bell,
  Package2Icon
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (route, e) => {
    // Si el clic proviene de un elemento que ya tiene su propio manejador, no navegar
    if (e.target.closest('button, a, [data-prevent-navigation]')) {
      return;
    }
    navigate(route);
  };

  // Tarjetas de navegación principales
  const mainNavigationCards = [
    {
      title: 'Servicios',
      description: 'Ver detalles de servicios realizados',
      icon: Package2Icon,
      color: 'bg-blue-500',
      route: '/servicios/',
      
    },
    {
      title: 'Ver Facturación',
      description: 'Gestión de facturas y pagos',
      icon: CreditCard,
      color: 'bg-green-500',
      route: '/contabilidad/facturacion',
      
    },
    {
      title: 'Ver Reportes',
      description: 'Reportes y estadísticas',
      icon: BarChart3,
      color: 'bg-orange-500',
      route: '/administracion/reportes',
    
    },
    {
      title: 'Ver Clientes',
      description: 'Lista de clientes y contactos',
      icon: Users,
      color: 'bg-purple-500',
      route: '/gestion/clientes',
   
    },
    {
      title: 'Ver Proveedores',
      description: 'Gestión de proveedores',
      icon: ShieldCheck,
      color: 'bg-yellow-500',
      route: '/gestion/proveedores',
      
    },
    {
      title: 'Ver Flotas',
      description: 'Control de vehículos',
      icon: Truck,
      color: 'bg-indigo-500',
      route: '/gestion/flotas',
      
    },
    {
      title: 'Ver Conductores',
      description: 'Gestión de conductores',
      icon: UserCheck,
      color: 'bg-red-500',
      route: '/gestion/personal',
  
    },
    {
      title: 'Ver Auxiliares',
      description: 'Personal de apoyo',
      icon: Users,
      color: 'bg-teal-500',
      route: '/gestion/personal',
     
    },
    {
      title: 'Ver Usuarios',
      description: 'Usuarios del sistema',
      icon: UserPlus,
      color: 'bg-pink-500',
      route: '/usuarios',

    },
    
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: Settings,
      color: 'bg-gray-500',
      route: '/configuracion',
     
    }
  ];

  // Indicadores con valores por defecto
  const indicatorCards = [
    {
      title: 'Facturas Pendientes',
      value: '12',
      amount: '$15,240.75',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+2 esta semana',
      route: '/facturacion?estado=pendiente'
    },
    {
      title: 'Facturas Vencidas',
      value: '3',
      amount: '$4,850.00',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: 'Urgente',
      route: '/facturacion?estado=vencida'
    },
    {
      title: 'Pagos por Procesar',
      value: '8',
      amount: '$9,560.25',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: '3 días máximo',
      route: '/contabilidad/pagos'
    },
    {
      title: 'Servicios del Día',
      value: '24',
      amount: '$12,450.00',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+4 vs ayer',
      route: '/servicios?fecha=hoy'
    }
  ];

  // Actividades recientes
  const activityCards = [
    {
      id: 1,
      title: 'Nueva factura generada',
      description: 'FAC-7890 - Importadora ABC',
      time: '10:30 AM',
      status: 'completado',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      route: '/facturacion/detalle/7890'
    },
    {
      id: 2,
      title: 'Servicio completado',
      description: 'TRK-2456 - Lima → Arequipa',
      time: '9:15 AM',
      status: 'completado',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      route: '/servicios/detalle/2456'
    },
    {
      id: 3,
      title: 'Factura vencida',
      description: 'FAC-7888 - Comercial Delta',
      time: 'Ayer',
      status: 'pendiente',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      route: '/facturacion/detalle/7888'
    },
    {
      id: 4,
      title: 'Nuevo cliente registrado',
      description: 'Exportadora Global SAC',
      time: 'Ayer',
      status: 'completado',
      icon: UserPlus,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      route: '/clientes/detalle/nuevo'
    }
  ];

  // Tarjetas de información
  const infoCards = [
    {
      title: 'Indicadores Financieros',
      description: 'Resumen financiero y métricas',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      content: (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Ingresos del Mes</span>
              <span className="font-semibold">$45,820.50</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Gastos Operativos</span>
              <span className="font-semibold">$28,450.75</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Margen Utilidad</span>
              <span className="font-semibold">42.5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42.5%' }}></div>
            </div>
          </div>
        </div>
      ),
      route: '/reportes/financieros'
    },
    {
      title: 'Actividad Reciente',
      description: 'Últimas acciones del sistema',
      icon: Bell,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      content: (
        <div className="space-y-3">
          {activityCards.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(activity.route);
              }}
            >
              <div className={`p-2 rounded-lg ${activity.bgColor} mr-3`}>
                <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                <p className="text-xs text-gray-600 truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      ),
      route: '/actividad'
    },
    {
      title: 'Acciones Inmediatas',
      description: 'Tareas que requieren atención',
      icon: Clock,
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      content: (
        <div className="space-y-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/servicios/nuevo');
            }}
            className="w-full flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group text-left"
          >
            <Plus className="h-5 w-5 text-orange-600 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Registrar servicio</p>
              <p className="text-sm text-gray-600">Nuevo cliente</p>
            </div>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/facturacion/nueva');
            }}
            className="w-full flex items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors group text-left"
          >
            <CreditCard className="h-5 w-5 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Generar factura</p>
              <p className="text-sm text-gray-600">Servicio completado</p>
            </div>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/reportes/generar');
            }}
            className="w-full flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group text-left"
          >
            <BarChart3 className="h-5 w-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Reporte mensual</p>
              <p className="text-sm text-gray-600">Vence mañana</p>
            </div>
          </button>
        </div>
      ),
      route: '/tareas'
    }
  ];

  return (
    <div className="p-4">
      

      {/* Indicadores rápidos */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {indicatorCards.map((indicator, index) => (
          <div
            key={index}
            onClick={(e) => handleCardClick(indicator.route, e)}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{indicator.title}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">{indicator.value}</span>
                  <span className="text-sm text-gray-500">{indicator.amount}</span>
                </div>
                <p className={`text-sm mt-2 ${indicator.color}`}>
                  {indicator.trend}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${indicator.bgColor}`}>
                <indicator.icon className={`h-6 w-6 ${indicator.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Tarjetas de navegación principales */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {mainNavigationCards.map((card, index) => (
            <div
              key={index}
              onClick={(e) => handleCardClick(card.route, e)}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.color} transform group-hover:scale-110 transition-transform`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                {card.badge && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {card.badge}
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{card.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{card.description}</p>
              
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <span>Acceder</span>
                <Eye className="h-4 w-4 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tarjetas de información */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {infoCards.map((card, index) => (
          <div
            key={index}
            onClick={(e) => handleCardClick(card.route, e)}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    <div className={`p-3 rounded-xl ${card.color} mr-3`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{card.title}</h3>
                      <p className="text-sm text-gray-600">{card.description}</p>
                    </div>
                  </div>
                </div>
                <Eye className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              
              {card.content}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Ver detalles completos</span>
                  <div className="text-blue-600">
                    →
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Resumen rápido */}
      {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Clientes Activos</p>
              <p className="text-2xl font-bold mt-1">45</p>
            </div>
            <Users className="h-8 w-8 opacity-80" />
          </div>
          <div className="mt-4">
            <Link to="/clientes" className="text-sm opacity-90 hover:opacity-100 inline-block">
              Ver todos →
            </Link>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Flota Disponible</p>
              <p className="text-2xl font-bold mt-1">28</p>
            </div>
            <Truck className="h-8 w-8 opacity-80" />
          </div>
          <div className="mt-4">
            <Link to="/flotas" className="text-sm opacity-90 hover:opacity-100 inline-block">
              Ver vehículos →
            </Link>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Personal Activo</p>
              <p className="text-2xl font-bold mt-1">38</p>
            </div>
            <UserCheck className="h-8 w-8 opacity-80" />
          </div>
          <div className="mt-4">
            <Link to="/personal" className="text-sm opacity-90 hover:opacity-100 inline-block">
              Ver equipo →
            </Link>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;