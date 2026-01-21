import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Truck,
  CreditCard,
  ClipboardList,
  Activity,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bell,
  Menu,
  X,

  Building,
  FileCheck,
  Receipt,
  
  TruckIcon,

  Users2,

  HistoryIcon,

  Timer,
  Package2, 
  TriangleAlert,
  ArrowBigLeftIcon,
  ArrowBigRightIcon,
  AlignEndHorizontalIcon,
  ChartColumnDecreasing,
  MonitorCheck,
  FileStack,
  Search,
  DollarSign,
  BanknoteArrowDownIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Detecta la ruta activa cuando cambia la ubicación
  useEffect(() => {
    const path = location.pathname;
    let activeId = "dashboard";

    // Buscar coincidencia exacta o parcial
    menuItems.forEach((item) => {
      if (path === item.path || path.startsWith(item.path + "/")) {
        activeId = item.id;
      }
    });

    setActiveItem(activeId);
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  const toggleSubmenu = (menuId) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  // Mapeo de rutas a IDs del menú
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      badge: null,
    },
    {
      id: "gestion",
      label: "Gestion",
      icon: ClipboardList, 
      path: "/gestion",
      badge: null,
      submenu: [
        {
          id: "clientes",
          label: "Clientes",
          path: "/gestion/clientes",
          icon: Users,
        },
        {
          id: "proveedores",
          label: "Proveedores",
          path: "/gestion/proveedores",
          icon: Building,
        },
        {
          id: "flotas",
          label: "Placas",
          path: "/gestion/flotas",
          icon: TruckIcon,
        },
        {
          id: "personal",
          label: "Personal",
          path: "/gestion/personal",
          icon: Users2,
        },
      ],
    },
    {
      id: "contabilidad",
      label: "Contabilidad",
      icon: CreditCard,
      path: "/contabilidad",
      badge: null,
      submenu: [
        {
          id: "fletes-pendientes",
          label: "Fletes Pendientes",
          path: "/contabilidad/fletes-pendientes",
          icon: TriangleAlert,
        },
        {
          id: "fletes-por-facturar",
          label: "Fletes Por Facturar",
          path: "/contabilidad/fletes-por-facturar",
          icon: Timer,
        },
        {
          id: "facturacion",
          label: "Emision de Facturas",
          path: "/contabilidad/facturacion",
          icon: ArrowBigRightIcon,
        },
        {
          id: "segimineto",
          label: "Segimineto De Facturas",
          path: "/contabilidad/segimineto",
          icon: Receipt,
        },
        // {
        //   id: "reportes",
        //   label: "Reportes Generales",
        //   icon: BarChart3,
        //   path: "/contabilidad/reportes",
        // },
      ],
    },
    {
      id: "servicios",
      label: "Servicios",
      icon: Package2,
      path: "/servicios",
      submenu: [
        {
          id: "buscar-servicio",
          label: "Buscar Servicio",
          icon: Search,
          path: "/buscar-servicio",
          badge: null,
        },
        {
          id: "servicios",
          label: "Servicios Actuales",
          icon: Truck,
          path: "/servicios",
          badge: null,
        },
        {
          id: "historicos",
          label: "Servicios Pasados",
          icon: HistoryIcon,
          path: "/historicos",
          badge: null,
        },
        {
          id:"reportes-historicos",
          label:"Estadisticas de Servicios Pasados",
          icon:ChartColumnDecreasing,
          path:"/reportes-historicos",
           badge: null,
        }
      ],
    },
{
      id: "gastos",
      label: "Gastos",
      icon: BanknoteArrowDownIcon,
      path: "/gastos",
      submenu: [
        {
          id: "gastos",
          label: "Gastos",
          icon: BanknoteArrowDownIcon,
          path: "/gastos",
          badge: null,
        },
        {
          id: "gastos-reportes",
          label: "Reportes de Gastos",
          icon: ChartColumnDecreasing,
          path: "/gastos-reportes",
          badge: null,
        },
      ],
    },
    {
      id: "gerencia",
      label: "Gerencia",
      icon: AlignEndHorizontalIcon,
      path: "/gerencia",
      submenu: [
        {
          id: "gerencia",
          label: "Gerencia",
          icon: MonitorCheck,
          path: "/gerencia/gerencia",
        },
        {
          id: "analiticas",
          label: "Analiticas",
          path: "/gerencia/analiticas",
          icon:   BarChart3,
        },
          {
          id: "historial",
          label: "Historial de Cambios",
          path: "/gerencia/actividad",
          icon:   FileStack,
        },
        
        
      ],
    },
  ];

  const systemItems = [
    {
      id: "configuracion",
      label: "Configuración",
      icon: Settings,
      path: "/configuracion",
    },
  ];

  // Componente para los elementos del menú principal
  const MenuItem = ({ item, isCollapsed }) => {
    const isActive = activeItem === item.id;
    const isSubmenuOpen = openSubmenus[item.id];
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    // Verificar si algún submenú está activo
    const isSubmenuActive =
      hasSubmenu &&
      item.submenu.some(
        (sub) =>
          location.pathname === sub.path ||
          location.pathname.startsWith(sub.path + "/")
      );

    return (
      <div className="space-y-1">
        {hasSubmenu ? (
          <>
            <button
              onClick={() => toggleSubmenu(item.id)}
              className={`w-full flex items-center justify-between rounded-xl p-3 transition-all duration-200 group ${
                isActive || isSubmenuActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="flex items-center">
                <item.icon
                  className={`h-5 w-5 ${
                    isActive || isSubmenuActive
                      ? "text-blue-600"
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </div>

              {!isCollapsed && (
                <>
                  <div className="flex items-center gap-2">
                    {/* {item.badge !== null && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )} */}
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isSubmenuOpen ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </>
              )}

              {/* {isCollapsed && item.badge !== null && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-semibold h-5 w-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )} */}
            </button>

            {/* Submenú para desktop */}
            {!isCollapsed && hasSubmenu && isSubmenuOpen && (
              <div className="ml-8 mt-1 space-y-1 animate-fadeIn">
                {item.submenu.map((subItem) => {
                  const isSubActive =
                    location.pathname === subItem.path ||
                    location.pathname.startsWith(subItem.path + "/");
                  return (
                    <Link
                      key={subItem.id}
                      to={subItem.path}
                      className={`flex items-center py-2 px-3 rounded-lg text-sm transition-colors ${
                        isSubActive
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      onClick={() =>
                        window.innerWidth < 1024 && setIsMobileOpen(false)
                      }
                    >
                      {subItem.icon && (
                        <subItem.icon className="h-4 w-4 mr-2" />
                      )}
                      {subItem.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Link
            to={item.path}
            className={`flex items-center rounded-xl p-3 transition-all duration-200 group relative ${
              isActive
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
            } ${isCollapsed ? "justify-center" : ""}`}
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileOpen(false);
              }
            }}
          >
            <item.icon
              className={`h-5 w-5 ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 group-hover:text-gray-700"
              }`}
            />

            {!isCollapsed && (
              <>
                <span className="ml-3 text-sm font-medium flex-1 text-left">
                  {item.label}
                </span>
                {/* {item.badge !== null && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )} */}
              </>
            )}

            {/* {isCollapsed && item.badge !== null && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-semibold h-5 w-5 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )} */}
          </Link>
        )}
      </div>
    );
  };

  // Obtener el título de la página basado en la ruta
  const getPageTitle = () => {
    const path = location.pathname;

    // Buscar primero en submenús
    for (const item of menuItems) {
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (path === subItem.path || path.startsWith(subItem.path + "/")) {
            return subItem.label;
          }
        }
      }
      if (path === item.path || path.startsWith(item.path + "/")) {
        return item.label;
      }
    }

    // Buscar en los ítems de sistema
    for (const item of systemItems) {
      if (path === item.path) return item.label;
    }

    // Si no encuentra, usar "Dashboard"
    return "Dashboard";
  };

  return (
    <>
      {/* Botón para abrir sidebar en móvil */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Sidebar para escritorio */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full border-r border-gray-200 bg-white transition-all duration-300 z-40 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <Link
                to="/dashboard"
                className="flex items-center hover:opacity-90 transition-opacity"
                onClick={() => setActiveItem("dashboard")}
              >
                <div className="h-10 w-10 rounded-xl bg-yellow-500 flex items-center justify-center shadow-sm">
                  <Truck className="h-6 w-6 text-black" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-bold text-gray-900">Transjer</h2>
                  <p className="text-xs text-gray-500">Transporte Logístico</p>
                </div>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="mx-auto"
                onClick={() => setActiveItem("dashboard")}
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-sm">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </Link>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:flex"
              aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Menú principal */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} isCollapsed={isCollapsed} />
            ))}
          </nav>

          {/* Separador para sección de sistema */}
          {!isCollapsed && (
            <>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  Sistema
                </h3>
                <div className="space-y-2">
                  {systemItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center rounded-xl p-3 text-sm transition-colors ${
                          isActive
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        onClick={() => setActiveItem(item.id)}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Perfil del usuario */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || "A"}
              </span>
            </div>

            {!isCollapsed && (
              <>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name || "Administrador"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.role || "Gerente Logístico"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4 text-gray-500" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar para móvil */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Panel lateral */}
          <div className="relative flex-1 flex flex-col w-64 bg-white h-full">
            {/* Header móvil */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Link
                  to="/dashboard"
                  className="flex items-center"
                  onClick={() => {
                    setActiveItem("dashboard");
                    setIsMobileOpen(false);
                  }}
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      LogiTrack
                    </h2>
                    <p className="text-xs text-gray-500">Sistema Logístico</p>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Menú móvil */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="space-y-1">
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() => toggleSubmenu(item.id)}
                          className={`w-full flex items-center justify-between rounded-xl p-4 ${
                            activeItem === item.id
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "text-gray-700 hover:bg-gray-50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center">
                            <item.icon
                              className={`h-5 w-5 ${
                                activeItem === item.id
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              }`}
                            />
                            <span className="ml-3 text-sm font-medium">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* {item.badge !== null && (
                              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                                {item.badge}
                              </span>
                            )} */}
                            <ChevronRight
                              className={`h-4 w-4 transition-transform duration-200 ${
                                openSubmenus[item.id] ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {openSubmenus[item.id] && (
                          <div className="ml-8 mt-1 space-y-1 animate-fadeIn">
                            {item.submenu.map((subItem) => {
                              const isSubActive =
                                location.pathname === subItem.path;
                              return (
                                <Link
                                  key={subItem.id}
                                  to={subItem.path}
                                  className={`flex items-center py-2 px-3 rounded-lg text-sm transition-colors ${
                                    isSubActive
                                      ? "bg-blue-100 text-blue-700 font-medium"
                                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                  }`}
                                  onClick={() => setIsMobileOpen(false)}
                                >
                                  {subItem.icon && (
                                    <subItem.icon className="h-4 w-4 mr-2" />
                                  )}
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center justify-between rounded-xl p-4 ${
                          activeItem === item.id
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-50 border border-transparent"
                        }`}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`h-5 w-5 ${
                              activeItem === item.id
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          />
                          <span className="ml-3 text-sm font-medium">
                            {item.label}
                          </span>
                        </div>
                        {/* {item.badge !== null && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )} */}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Sección sistema en móvil */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Sistema
                </h3>
                <div className="space-y-2">
                  {systemItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center rounded-xl p-4 text-sm ${
                        activeItem === item.id
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setActiveItem(item.id);
                        setIsMobileOpen(false);
                      }}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Perfil en móvil */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <span className="text-white font-semibold text-base">
                      {user?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || "Administrador"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || "admin@logitrack.com"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar superior */}
      <div
        className={`sticky top-0 z-30 bg-white border-b border-gray-200 transition-all duration-300 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Título de página */}
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>

            {/* Acciones del usuario */}
            <div className="flex items-center space-x-3">
              <button
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative transition-colors"
                aria-label="Notificaciones"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              <div className="relative group">
                <button
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Perfil de usuario"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "Administrador"}
                    </p>
                    <p className="text-xs text-gray-500">Gerente Logístico</p>
                  </div>
                </button>

                {/* Dropdown del perfil */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 hidden group-hover:block z-40">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "Administrador"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "admin@logitrack.com"}
                    </p>
                  </div>
                  <Link
                    to="/configuracion"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setActiveItem("configuracion")}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Configuración
                  </Link>
                  <Link
                    to="/seguridad"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setActiveItem("seguridad")}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Seguridad
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Estilos CSS para animaciones
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
`;

// Agregar estilos al documento
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Sidebar;
