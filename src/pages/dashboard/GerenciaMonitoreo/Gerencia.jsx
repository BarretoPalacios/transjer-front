import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  Filter,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Truck,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  Download,
  FileDigit,
  Info,
  Loader2,
  ChevronRight,
  Building,
  User,
  Package,
  MapPin,
  CreditCard,
  Percent
} from 'lucide-react';
import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import Pagination from '../../../components/common/Pagination/Pagination';
import { formatCurrency, formatDate } from '../../../utils/facturacionUtils';
import { facturacionGestionAPI } from '../../../api/endpoints/facturacionGestion';

const Gerencia = () => {
  // Estados para datos
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  
  // Estados para filtros (basados en el router)
  const [filters, setFilters] = useState({
    // Filtros básicos
    nombre_cliente: '',
    fecha_emision_inicio: '',
    fecha_emision_fin: '',
    estado_pago_neto: '',
    estado_detraccion: '',
    // Podemos agregar más filtros según necesidad
  });
  
  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  
  // Estados para paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
    pageSize: 10
  });
  
  // Estados para detalles
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [expandedFreightIndex, setExpandedFreightIndex] = useState(null);
  
  // Estados para totales
  const [totals, setTotals] = useState({
    totalInvoiced: 0,
    totalDetraction: 0,
    totalNet: 0,
    totalCollected: 0,
    totalPending: 0
  });

  // Estados para filtros expandidos
  const [showFilters, setShowFilters] = useState(true);

  // Calcular días hasta vencimiento
  const getDaysUntilDue = (dueDateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Obtener colores según estado
  const getStatusColor = (status, type = 'detraction') => {
    switch (type) {
      case 'detraction':
        return status === 'Pendiente' 
          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
          : 'bg-green-50 text-green-700 border-green-200';
      
      case 'payment':
        return status === 'Pendiente'
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-green-50 text-green-700 border-green-200';
      
      case 'priority':
        switch (status) {
          case 'Alta': return 'bg-red-50 text-red-700 border-red-200';
          case 'Media': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
          case 'Baja': return 'bg-blue-50 text-blue-700 border-blue-200';
          default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
      
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Función para obtener todas las gestiones
  const fetchInvoices = useCallback(async (page = 1, pageSize = pagination.pageSize) => {
    setLoadingData(true);
    
    try {
      // Preparar filtros para la API según el router
      const filtersForAPI = {};
      
      // Solo agregar filtros si tienen valor
      if (filters.nombre_cliente) {
        filtersForAPI.nombre_cliente = filters.nombre_cliente;
      }
      
      if (filters.fecha_emision_inicio) {
        filtersForAPI.fecha_emision_inicio = filters.fecha_emision_inicio;
      }
      
      if (filters.fecha_emision_fin) {
        filtersForAPI.fecha_emision_fin = filters.fecha_emision_fin;
      }
      
      if (filters.estado_pago_neto && filters.estado_pago_neto !== 'all') {
        filtersForAPI.estado_pago_neto = filters.estado_pago_neto;
      }
      
      if (filters.estado_detraccion && filters.estado_detraccion !== 'all') {
        filtersForAPI.estado_detraccion = filters.estado_detraccion;
      }
      
      // Búsqueda general (busca en múltiples campos)
      if (appliedSearch) {
        filtersForAPI.search = appliedSearch;
      }
      
      // Llamar a la API con los filtros
      const response = await facturacionGestionAPI.getAllGestiones(filtersForAPI, {
        page: page,
        pageSize: pageSize
      });
      
      // Actualizar estado con los datos recibidos
      setInvoices(response.items || []);
      
      // Actualizar paginación
      setPagination({
        currentPage: response.page || 1,
        totalItems: response.total || 0,
        totalPages: response.total_pages || 1,
        hasNext: response.has_next || false,
        hasPrev: response.has_prev || false,
        pageSize: response.page_size || pageSize
      });
      
      // Calcular totales
      calculateTotals(response.items || []);
      
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
      setLoadingData(false);
    }
  }, [filters, appliedSearch, pagination.pageSize]);

  // Función para calcular totales
  const calculateTotals = (invoices) => {
    let totalInvoiced = 0;
    let totalDetraction = 0;
    let totalNet = 0;
    let totalCollected = 0;
    let totalPending = 0;

    invoices.forEach(invoice => {
      totalInvoiced += parseFloat(invoice.datos_completos?.monto_total || 0);
      totalDetraction += parseFloat(invoice.monto_detraccion || 0);
      totalNet += parseFloat(invoice.monto_neto || 0);
      totalCollected += parseFloat(invoice.monto_pagado_acumulado || 0);
      totalPending += parseFloat(invoice.saldo_pendiente || 0);
    });

    setTotals({
      totalInvoiced,
      totalDetraction,
      totalNet,
      totalCollected,
      totalPending
    });
  };

  // Función para aplicar filtros
  const applyFilters = () => {
    fetchInvoices(1, pagination.pageSize);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      nombre_cliente: '',
      fecha_emision_inicio: '',
      fecha_emision_fin: '',
      estado_pago_neto: '',
      estado_detraccion: ''
    });
    setSearchTerm('');
    setAppliedSearch('');
  };

  // Función para buscar
  const handleSearch = () => {
    setAppliedSearch(searchTerm);
  };

  // Función para manejar tecla Enter en búsqueda
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Función para cambiar página
  const handlePageChange = (newPage) => {
    fetchInvoices(newPage, pagination.pageSize);
  };

  // Función para cambiar items por página
  const handleItemsPerPageChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize }));
    fetchInvoices(1, newPageSize);
  };

  // Función para ver detalles de factura (clic en fila)
  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
    setExpandedFreightIndex(null); // Resetear flete expandido
  };

  // Función para alternar detalles de flete
  const toggleFreightDetails = (index) => {
    setExpandedFreightIndex(expandedFreightIndex === index ? null : index);
  };

  // Renderizar detalles de un flete
  const renderFreightDetails = (freight, index) => {
    const isExpanded = expandedFreightIndex === index;
    const servicio = freight.servicio || {};
    
    return (
      <div key={freight.codigo_flete} className="border border-gray-200 rounded-lg mb-2">
        {/* Encabezado del flete */}
        <div 
          className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-lg"
          onClick={() => toggleFreightDetails(index)}
        >
          <div className="flex items-center space-x-3">
            <Truck className="h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-sm text-gray-900">{freight.codigo_flete}</span>
              <span className="ml-2 text-xs text-gray-500">{servicio.destino}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(parseFloat(freight.monto_flete || 0))}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
              {servicio.tipo_servicio || 'Local'}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        {/* Detalles expandidos del flete */}
        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Información del servicio */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 flex items-center">
                  <Info className="h-3 w-3 mr-1" /> Información del Servicio
                </h4>
                <div className="text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Código:</span>
                    <span className="font-medium">{servicio.codigo_servicio || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Modalidad:</span>
                    <span className="font-medium">{servicio.modalidad || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Zona:</span>
                    <span className="font-medium">{servicio.zona || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Fecha Servicio:</span>
                    <span className="font-medium">{formatDate(servicio.fecha_servicio)}</span>
                  </div>
                </div>
              </div>
              
              {/* Información de transporte */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 flex items-center">
                  <Truck className="h-3 w-3 mr-1" /> Transporte
                </h4>
                <div className="text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Placa:</span>
                    <span className="font-medium">{servicio.placa_flota || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Conductor:</span>
                    <span className="font-medium">{servicio.nombre_conductor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Auxiliar:</span>
                    <span className="font-medium">{servicio.nombre_auxiliar || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Carga:</span>
                    <span className="font-medium">{servicio.m3 || '0'} m³ / {servicio.tn || '0'} TN</span>
                  </div>
                </div>
              </div>
              
              {/* Información de ubicación */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" /> Ubicación
                </h4>
                <div className="text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Origen:</span>
                    <span className="font-medium text-right">{servicio.origen || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Destino:</span>
                    <span className="font-medium text-right">{servicio.destino || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">GIA RR:</span>
                    <span className="font-medium">{servicio.gia_rr || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">GIA RT:</span>
                    <span className="font-medium">{servicio.gia_rt || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sección de gastos adicionales (preparada para API) */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                <CreditCard className="h-3 w-3 mr-1" /> Gastos Adicionales
              </h4>
              <div className="text-center py-4 text-gray-500 text-sm">
                <p>Aquí se mostrarían los gastos adicionales asociados a este flete.</p>
                <p className="text-xs mt-1">Implementa la llamada a la API para obtener los gastos.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Componente de tarjeta de métrica
  const MetricCard = ({ title, value, icon: Icon, color = 'blue', borderColor = 'blue' }) => (
    <div className={`bg-white p-3 rounded border border-gray-300 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium text-gray-500">{title}</h3>
          <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-2 bg-${color}-50 rounded`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  // Renderizar panel de filtros
  const renderFiltersPanel = () => (
    <div className="bg-white border border-gray-300 rounded p-3 mb-3 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Cliente */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <input
            type="text"
            value={filters.nombre_cliente}
            onChange={(e) => setFilters({...filters, nombre_cliente: e.target.value})}
            placeholder="Buscar cliente..."
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Fecha Emisión - Inicio */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Emisión (Desde)
          </label>
          <input
            type="date"
            value={filters.fecha_emision_inicio}
            onChange={(e) => setFilters({...filters, fecha_emision_inicio: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Fecha Emisión - Fin */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Emisión (Hasta)
          </label>
          <input
            type="date"
            value={filters.fecha_emision_fin}
            onChange={(e) => setFilters({...filters, fecha_emision_fin: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Estado de Pago */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado de Pago
          </label>
          <select
            value={filters.estado_pago_neto}
            onChange={(e) => setFilters({...filters, estado_pago_neto: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
            <option value="Pagado Parcial">Pagado Parcial</option>
          </select>
        </div>

        {/* Estado de Detracción */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado de Detracción
          </label>
          <select
            value={filters.estado_detraccion}
            onChange={(e) => setFilters({...filters, estado_detraccion: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
            <option value="No Aplica">No Aplica</option>
          </select>
        </div>
      </div>

      {/* Botones de acción de filtros */}
      <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
        <Button
          onClick={applyFilters}
          variant="primary"
          className="text-xs px-3 py-1.5"
        >
          Aplicar Filtros
        </Button>
        <Button
          onClick={clearFilters}
          variant="secondary"
          className="text-xs px-3 py-1.5"
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );

  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Barra de búsqueda y filtros */}
        <div className="mb-4 bg-white p-3 rounded border border-gray-300 shadow-sm">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Buscador general */}
            <div className="flex items-center gap-2 flex-1 min-w-[250px]">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Buscar facturas, clientes, proveedores..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs"
              >
                Buscar
              </Button>
            </div>

            {/* Botón para mostrar/ocultar filtros */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              icon={Filter}
              className="px-3 py-1.5 text-xs"
            >
              Filtros {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>

            {/* Botón exportar */}
            <Button
              onClick={() => {/* Implementar exportación */}}
              variant="secondary"
              icon={Download}
              className="px-3 py-1.5 text-xs"
            >
              Exportar
            </Button>
          </div>

          {/* Panel de filtros desplegable */}
          {showFilters && renderFiltersPanel()}
        </div>

        {/* Resumen de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          <MetricCard
            title="Total Facturado"
            value={formatCurrency(totals.totalInvoiced)}
            icon={DollarSign}
            color="blue"
          />
          
          <MetricCard
            title="Total Detracciones"
            value={formatCurrency(totals.totalDetraction)}
            icon={AlertTriangle}
            color="yellow"
          />
          
          <MetricCard
            title="Neto a Recibir"
            value={formatCurrency(totals.totalNet)}
            icon={TrendingUp}
            color="green"
          />
          
          <MetricCard
            title="Total Cobrado"
            value={formatCurrency(totals.totalCollected)}
            icon={CheckCircle}
            color="purple"
          />
          
          <MetricCard
            title="Saldo Pendiente"
            value={formatCurrency(totals.totalPending)}
            icon={Clock}
            color="red"
          />
        </div>

        {/* Indicador de carga durante actualización */}
        {loadingData && (
          <div className="flex items-center justify-center p-2 bg-white/50 backdrop-blur-sm mb-3 rounded">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
            <span className="text-xs text-gray-600">Cargando datos...</span>
          </div>
        )}

        {/* Tabla de Facturas - Estilo Excel */}
        <div className="bg-white rounded border border-gray-300 shadow-sm mb-4 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-300 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Facturas</h2>
            <p className="text-gray-600 text-xs">
              Mostrando {invoices.length} de {pagination.totalItems} facturas
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[100px]">
                    Factura
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[80px]">
                    Emisión
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[80px]">
                    Vencimiento
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[100px]">
                    Días
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Neto
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Detracción
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Estado Neto
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Estado Detrac.
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[80px]">
                    Prioridad
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Saldo
                  </th>
                  <th className="py-1.5 px-2 text-left font-medium text-gray-700 min-w-[70px]">
                    Fletes
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const daysUntilDue = getDaysUntilDue(invoice.datos_completos?.fecha_vencimiento);
                  const isOverdue = daysUntilDue < 0;
                  const datos = invoice.datos_completos || {};
                  const fletesCount = datos.fletes?.length || 0;
                  
                  return (
                    <tr 
                      key={invoice.id}
                      onClick={() => handleRowClick(invoice)}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="py-1.5 px-2 border-r border-gray-200">
                        <div className="font-medium text-gray-900">{invoice.codigo_factura}</div>
                        <div className="text-gray-500 text-xs truncate">{datos.numero_factura}</div>
                      </td>
                      
                      <td className="py-1.5 px-2 border-r border-gray-200 text-gray-700">
                        {formatDate(datos.fecha_emision)}
                      </td>
                      
                      <td className="py-1.5 px-2 border-r border-gray-200 text-gray-700">
                        {formatDate(datos.fecha_vencimiento)}
                      </td>
                      
                      <td className="py-1.5 px-2 border-r border-gray-200">
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                          {isOverdue ? 'VENCIDO' : `${daysUntilDue} días`}
                        </span>
                      </td>
                      
                      <td className="py-1.5 px-2 border-r border-gray-200">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(parseFloat(invoice.monto_neto || 0))}
                        </div>
                      </td>
                      
                      <td className="py-1.5 px-2 border-r border-gray-200">
                        <div className="text-gray-900">
                          {formatCurrency(parseFloat(invoice.monto_detraccion || 0))}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {invoice.tasa_detraccion}%
                        </div>
                      </td>
                      
                      <td className="py-1.5 px-2 border-r border-gray-200">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${getStatusColor(invoice.estado_pago_neto, 'payment')}`}>
                          {invoice.estado_pago_neto}
                        </span>
                      </td>
                      
                      <td className="py-1.5 px-2 border-r border-gray-200">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${getStatusColor(invoice.estado_detraccion, 'detraction')}`}>
                          {invoice.estado_detraccion}
                        </span>
                      </td>
                      
                      <td className="py-1.5 px-2 border-r border-gray-200">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${getStatusColor(invoice.prioridad, 'priority')}`}>
                          {invoice.prioridad}
                        </span>
                      </td>
                      
                      <td className="py-1.5 px-2 border-r border-gray-200">
                        <div className={`font-medium ${parseFloat(invoice.saldo_pendiente || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(parseFloat(invoice.saldo_pendiente || 0))}
                        </div>
                      </td>
                      
                      <td className="py-1.5 px-2">
                        <div className="flex items-center justify-center">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            {fletesCount}
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

        {/* Paginación */}
        {invoices.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <span className="text-xs text-gray-600">Mostrar</span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500"
                value={pagination.pageSize}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs text-gray-600">registros</span>
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.pageSize}
              onPageChange={handlePageChange}
              startIndex={(pagination.currentPage - 1) * pagination.pageSize + 1}
              endIndex={Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems
              )}
              size="small"
            />
          </div>
        )}

        {/* Sin resultados */}
        {invoices.length === 0 && !loading && (
          <div className="bg-white rounded border border-gray-300 p-6 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No se encontraron facturas
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {appliedSearch || Object.values(filters).some(f => f !== '')
                ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                : "No hay facturas registradas"}
            </p>
            <Button
              onClick={clearFilters}
              variant="primary"
              className="px-3 py-1.5 text-sm"
            >
              Limpiar búsqueda
            </Button>
          </div>
        )}

        {/* Modal de Detalles de Factura */}
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title={`Detalles de Factura: ${selectedInvoice?.codigo_factura || ''}`}
          size="xlarge"
        >
          {selectedInvoice && (
            <div className="p-4">
              {/* Información de la factura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 rounded p-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Información de Factura
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Número:</span>
                      <p className="font-medium">{selectedInvoice.datos_completos?.numero_factura || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Emisión:</span>
                      <p className="font-medium">{formatDate(selectedInvoice.datos_completos?.fecha_emision)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Vencimiento:</span>
                      <p className="font-medium">{formatDate(selectedInvoice.datos_completos?.fecha_vencimiento)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <p className="font-medium">{formatCurrency(parseFloat(selectedInvoice.datos_completos?.monto_total || 0))}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Estados y Montos
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Neto:</span>
                      <p className="font-medium">{formatCurrency(parseFloat(selectedInvoice.monto_neto || 0))}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Detracción:</span>
                      <p className="font-medium">{formatCurrency(parseFloat(selectedInvoice.monto_detraccion || 0))}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pagado:</span>
                      <p className="font-medium">{formatCurrency(parseFloat(selectedInvoice.monto_pagado_acumulado || 0))}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Saldo:</span>
                      <p className={`font-medium ${parseFloat(selectedInvoice.saldo_pendiente || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(parseFloat(selectedInvoice.saldo_pendiente || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de fletes */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Fletes ({selectedInvoice.datos_completos?.fletes?.length || 0})
                </h4>
                
                {selectedInvoice.datos_completos?.fletes?.map((freight, index) => (
                  renderFreightDetails(freight, index)
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowInvoiceModal(false)}
                  variant="secondary"
                  className="px-4 py-2 text-sm"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Gerencia;