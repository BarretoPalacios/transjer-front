import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/auth/Login/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import NotFound from "../pages/NotFound";
import Layout from "../components/Layout/Layout";
import Contabilidad from "../pages/dashboard/Contabilidad";
import Administracion from "../pages/dashboard/Administracion";
import Historicos from "../pages/dashboard/Historicos";
import Proveedores from "../pages/dashboard/subPaginas/Proveedores";
import Personal from "../pages/dashboard/subPaginas/Personal";
import Clientes from "../pages/dashboard/subPaginas/Clientes";
import Flotas from "../pages/dashboard/subPaginas/Flotas";
import Servicios from "../pages/dashboard/Servicios/Servicios";
import ServicioForm from "../pages/dashboard/Servicios/ServicioForm";
import ServicioDetalle from "../pages/dashboard/Servicios/ServicioDetalle";
import ServiceEditForm from "../pages/dashboard/Servicios/ServiceEditForm";
import Facturacion from "../pages/dashboard/Facturacion/Facturacion";
import ServiciosHistoricos from "../pages/dashboard/ServiciosHistoricos/ServiciosHistoricos";
import FletesPendientes from "../pages/dashboard/FletesPendientes/FletesPendientes";
import FletesPorFacturar from "../pages/dashboard/FletesPorFacturar/FletesPorFacturar";
import SeguimientoFacturas from "../pages/dashboard/SeguimientoFacturas/SeguimientoFacturas";
import ReportesHistoricos from "../pages/dashboard/ServiciosHistoricos/ReportesHistoricos";
import Gerencia from "../pages/dashboard/GerenciaMonitoreo/Gerencia";
import AnaliticasGerenciales from "../pages/dashboard/GerenciaMonitoreo/AnaliticasGerenciales";
import BuscarServicio from "../pages/dashboard/BuscarServicio/BuscarServicio";
import Gastos from "../pages/dashboard/Gastos/Gastos";
import ReportesGastos from "../pages/dashboard/Gastos/ReportesGastos";
import GastosAsociados from "../pages/dashboard/GastosAsociados/GastosAsociados";
import MonitoreoPlacas from "../pages/dashboard/MonitoreoPlacas/MonitoreoPlacas";
import MonitoreoProveedores from "../pages/dashboard/MonitoreoProveedores/MonitoreoProveedores";
import Usuarios from "../pages/dashboard/Usuarios/Usuarios";
import MonitoreoClientes from "../pages/dashboard/MonitoreoClientes/MonitoreoClientes";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Rutas privadas con Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Redirección por defecto */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Dashboard - Solo necesita ver dashboard */}
          <Route path="dashboard" element={
            <ProtectedRoute requirePermission={['dashboard', 'view']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Servicios */}
          <Route path="servicios" element={
            <ProtectedRoute requirePermission={['servicios', 'view']}>
              <Servicios />
            </ProtectedRoute>
          } />
          
          <Route path="buscar-servicio" element={
            <ProtectedRoute requirePermission={['servicios', 'view']}>
              <BuscarServicio />
            </ProtectedRoute>
          } />
          
          <Route path="servicios/nuevo" element={
            <ProtectedRoute requirePermission={['servicios', 'manage']}>
              <ServicioForm />
            </ProtectedRoute>
          } />
          
          <Route path="servicios/editar/:id" element={
            <ProtectedRoute requirePermission={['servicios', 'manage']}>
              <ServiceEditForm />
            </ProtectedRoute>
          } />
          
          <Route path="servicios/detalle/:id" element={
            <ProtectedRoute requirePermission={['servicios', 'view']}>
              <ServicioDetalle />
            </ProtectedRoute>
          } />
          
          <Route path="historicos" element={
            <ProtectedRoute requirePermission={['servicios', 'view']}>
              <ServiciosHistoricos />
            </ProtectedRoute>
          } />
          
          <Route path="reportes-historicos" element={
            <ProtectedRoute requirePermission={['servicios', 'view']}>
              <ReportesHistoricos />
            </ProtectedRoute>
          } />

          {/* Contabilidad */}
          <Route path="contabilidad" element={
            <ProtectedRoute requirePermission={['contabilidad', 'view']}>
              <Contabilidad />
            </ProtectedRoute>
          } />
          
          <Route path="contabilidad/fletes-pendientes" element={
            <ProtectedRoute requirePermission={['contabilidad', 'view']}>
              <FletesPendientes />
            </ProtectedRoute>
          } />
          
          <Route path="contabilidad/fletes-por-facturar" element={
            <ProtectedRoute requirePermission={['contabilidad', 'view']}>
              <FletesPorFacturar />
            </ProtectedRoute>
          } />
          
          <Route path="contabilidad/facturacion" element={
            <ProtectedRoute requirePermission={['contabilidad', 'manage']}>
              <Facturacion />
            </ProtectedRoute>
          } />
          
          <Route path="contabilidad/segimineto" element={
            <ProtectedRoute requirePermission={['contabilidad', 'view']}>
              <SeguimientoFacturas />
            </ProtectedRoute>
          } />
          
          <Route path="contabilidad/gastos-adicionales" element={
            <ProtectedRoute requirePermission={['contabilidad', 'manage']}>
              <GastosAsociados />
            </ProtectedRoute>
          } />

          {/* Gastos */}
          <Route path="gastos" element={
            <ProtectedRoute requirePermission={['gastos', 'view']}>
              <Gastos />
            </ProtectedRoute>
          } />
          
          <Route path="gastos-reportes" element={
            <ProtectedRoute requirePermission={['gastos', 'view']}>
              <ReportesGastos />
            </ProtectedRoute>
          } />

          {/* Gestión */}
          <Route path="gestion" element={
            <ProtectedRoute requirePermission={['gestion', 'view']}>
              <Administracion />
            </ProtectedRoute>
          } />
          
          <Route path="gestion/clientes" element={
            <ProtectedRoute requirePermission={['gestion', 'view']}>
              <Clientes />
            </ProtectedRoute>
          } />
          
          <Route path="gestion/proveedores" element={
            <ProtectedRoute requirePermission={['gestion', 'view']}>
              <Proveedores />
            </ProtectedRoute>
          } />
          
          <Route path="gestion/flotas" element={
            <ProtectedRoute requirePermission={['gestion', 'view']}>
              <Flotas />
            </ProtectedRoute>
          } />
          
          <Route path="gestion/personal" element={
            <ProtectedRoute requirePermission={['gestion', 'view']}>
              <Personal />
            </ProtectedRoute>
          } />

          {/* Gerencia */}
          <Route path="gerencia/actividad" element={
            <ProtectedRoute requirePermission={['gerencia', 'view']}>
              <Historicos />
            </ProtectedRoute>
          } />
          
          <Route path="gerencia/gerencia" element={
            <ProtectedRoute requirePermission={['gerencia', 'view']}>
              <Gerencia />
            </ProtectedRoute>
          } />
          
          {/* <Route path="gerencia/analiticas" element={
            <ProtectedRoute requirePermission={['gerencia', 'view']}>
              <AnaliticasGerenciales />
            </ProtectedRoute>
          } /> */}
          
          <Route path="gerencia/monitoreo-placas" element={
            <ProtectedRoute requirePermission={['gerencia', 'view']}>
              <MonitoreoPlacas />
            </ProtectedRoute>
          } />
          
          <Route path="gerencia/monitoreo-proveedores" element={
            <ProtectedRoute requirePermission={['gerencia', 'view']}>
              <MonitoreoProveedores />
            </ProtectedRoute>
          } />
          <Route path="gerencia/monitoreo-clientes" element={
            <ProtectedRoute requirePermission={['gerencia', 'view']}>
              <MonitoreoClientes />
            </ProtectedRoute>
          } />

          {/* Usuarios */}
          <Route path="usuarios" element={
            <ProtectedRoute requirePermission={['usuarios', 'view']}>
              <Usuarios />
            </ProtectedRoute>
          } />
          
          {/* Ruta 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;