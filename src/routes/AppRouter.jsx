import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/auth/Login/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import NotFound from "../pages/NotFound";
import Layout from "../components/Layout/Layout";
import Contabilidad from "../pages/dashboard/Contabilidad";
import Administracion from "../pages/dashboard/Administracion";
import Historicos from "../pages/dashboard/Historicos";
import Reportes from "../pages/dashboard/Reportes";
import Documentos from "../pages/dashboard/Documentos";
import Configuracion from "../pages/dashboard/Configuracion";
import Seguridad from "../pages/dashboard/Seguridad";
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
import Generales from "../pages/dashboard/Generales/Generales";
import ReportesHistoricos from "../pages/dashboard/ServiciosHistoricos/ReportesHistoricos";
import Gerencia from "../pages/dashboard/GerenciaMonitoreo/Gerencia";
import AnaliticasGerenciales from "../pages/dashboard/GerenciaMonitoreo/AnaliticasGerenciales";
import BuscarServicio from "../pages/dashboard/BuscarServicio/BuscarServicio";
import Gastos from "../pages/dashboard/Gastos/Gastos";
import ReportesGastos from "../pages/dashboard/Gastos/ReportesGastos";

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
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} /> 
          
          <Route path="servicios" element={<Servicios />} />
          <Route path="buscar-servicio" element={<BuscarServicio />} />
          
          <Route path="servicios/nuevo" element={<ServicioForm />} />
          <Route path="servicios/editar/:id" element={<ServiceEditForm />} />
          <Route path="servicios/detalle/:id" element={<ServicioDetalle />} />
          <Route path="historicos" element={<ServiciosHistoricos />} />
          <Route path="reportes-historicos" element={<ReportesHistoricos />} />


          <Route path="contabilidad" element={<Contabilidad />} />
          <Route path="contabilidad/fletes-pendientes" element={<FletesPendientes />} />
          <Route path="contabilidad/fletes-por-facturar" element={<FletesPorFacturar />} />
          <Route path="contabilidad/facturacion" element={<Facturacion />} />
          <Route path="contabilidad/segimineto" element={<SeguimientoFacturas />} />
          {/* <Route path="contabilidad/reportes" element={<Generales />} /> */}

          <Route path="gastos" element={<Gastos />} />
          <Route path="gastos-reportes" element={<ReportesGastos />} />

          <Route path="gestion" element={<Administracion />} />
          <Route path="gestion/clientes" element={<Clientes />} />
          <Route path="gestion/proveedores" element={<Proveedores />} />
          <Route path="gestion/flotas" element={<Flotas />} />
          <Route path="gestion/personal" element={<Personal />} />
          

          <Route path="gerencia/actividad" element={<Historicos />} />
          <Route path="gerencia/gerencia" element={<Gerencia />} />
          <Route path="gerencia/analiticas" element={<AnaliticasGerenciales />} />
          <Route path="documentos" element={<Documentos />} />
          
        </Route>

        
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
