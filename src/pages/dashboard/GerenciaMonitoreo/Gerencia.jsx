import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Truck,
  TrendingUp,
  CheckCircle,
  Search,
  Download,
  Loader2,
  Eye,
  X,
  FileDigit,
  Info,
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
import { fletesAPI } from "../../../api/endpoints/fletes";

const Gerencia = () => {
  // Estados para datos
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  
  // Estados para filtros (SOLO 3 como especificado)
  const [filters, setFilters] = useState({
    nombre_cliente: '',
    fecha_servicio_inicio: '',
    fecha_servicio_fin: '',
  });
  
  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  
  // Estados para paginación - 100 registros por página
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
    pageSize: 100 // 100 registros por página
  });
  
  // Estados para detalles
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [expandedFreightIndex, setExpandedFreightIndex] = useState(null);
  
  // Estados para totales del summary
  const [summary, setSummary] = useState({
    total_vendido: 0,
    total_facturado: 0,
    total_pagado: 0,
    total_pendiente: 0,
    total_detracciones: 0,
    total_pagado_detracc: 0,
    total_pendiente_detracc: 0
  });

  // Estados para filtros expandidos
  const [showFilters, setShowFilters] = useState(true);

  // Estados para gastos de fletes
  const [freightExpenses, setFreightExpenses] = useState({});
  const [loadingExpenses, setLoadingExpenses] = useState({});

  // Calcular saldo en fila (Monto Neto - Monto Pagado Acumulado)
  const calculateRowBalance = (invoice) => {
    const montoNeto = parseFloat(invoice.monto_neto || 0);
    const pagado = parseFloat(invoice.monto_pagado_acumulado || 0);
    return montoNeto - pagado;
  };

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
          : status === 'Pagado'
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-gray-50 text-gray-700 border-gray-200';
      
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

  // Función para obtener gastos de un flete
  const fetchFreightExpenses = useCallback(async (fleteId) => {
    if (!fleteId) return;
    
    setLoadingExpenses(prev => ({ ...prev, [fleteId]: true }));
    
    try {
      const response = await fletesAPI.getGastosByCodeFlete(fleteId);
      
      setFreightExpenses(prev => ({
        ...prev,
        [fleteId]: response
      }));
    } catch (error) {
      console.error(`Error fetching expenses for freight ${fleteId}:`, error);
      // En caso de error, establecer un objeto vacío
      setFreightExpenses(prev => ({
        ...prev,
        [fleteId]: {
          id_flete: fleteId,
          total_gastos: 0,
          total_recuperable_cliente: 0,
          total_costo_operativo: 0,
          cantidad_gastos: 0,
          gastos: []
        }
      }));
    } finally {
      setLoadingExpenses(prev => ({ ...prev, [fleteId]: false }));
    }
  }, []);

  // Función para obtener todas las gestiones usando getAllGestionesAdvance
  const fetchInvoices = useCallback(async (page = 1, pageSize = pagination.pageSize) => {
    setLoadingData(true);
    
    try {
      // Preparar filtros para la API
      const filtersForAPI = {};
      
      // Solo los 3 filtros especificados
      if (filters.nombre_cliente) {
        filtersForAPI.nombre_cliente = filters.nombre_cliente;
      }
      
      if (filters.fecha_servicio_inicio) {
        filtersForAPI.fecha_servicio_inicio = filters.fecha_servicio_inicio;
      }
      
      if (filters.fecha_servicio_fin) {
        filtersForAPI.fecha_servicio_fin = filters.fecha_servicio_fin;
      }
      
      // Búsqueda general
      if (appliedSearch) {
        filtersForAPI.search = appliedSearch;
      }
      
      // Llamar a la API getAllGestionesAdvance con los filtros
      const response = await facturacionGestionAPI.getAllGestionesAdvance(filtersForAPI, {
        page: page,
        pageSize: pageSize
      });
      
      // Actualizar estado con los datos recibidos
      setInvoices(response.items || []);
      
      // Actualizar summary si viene en la respuesta
      if (response.summary) {
        setSummary(response.summary);
      }
      
      // Actualizar paginación
      setPagination({
        currentPage: response.page || 1,
        totalItems: response.total || 0,
        totalPages: response.total_pages || 1,
        hasNext: response.has_next || false,
        hasPrev: response.has_prev || false,
        pageSize: response.page_size || pageSize
      });
      
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
      setLoadingData(false);
    }
  }, [filters, appliedSearch, pagination.pageSize]);

  // Función para aplicar filtros
  const applyFilters = () => {
    fetchInvoices(1, pagination.pageSize);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      nombre_cliente: '',
      fecha_servicio_inicio: '',
      fecha_servicio_fin: '',
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

  // Función para ver detalles de factura
  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
    setExpandedFreightIndex(null);
  };

  // Función para alternar detalles de flete
  const toggleFreightDetails = useCallback(async (index, freight) => {
    const fleteId = freight.id || freight.codigo_flete;
    
    if (expandedFreightIndex === index) {
      setExpandedFreightIndex(null);
    } else {
      setExpandedFreightIndex(index);
      
      if (fleteId && !freightExpenses[fleteId]) {
        await fetchFreightExpenses(fleteId);
      }
    }
  }, [expandedFreightIndex, freightExpenses, fetchFreightExpenses]);

  // Renderizar detalles de gastos
  const renderExpensesDetails = (fleteId) => {
    const expensesData = freightExpenses[fleteId];
    
    if (loadingExpenses[fleteId]) {
      return (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <span className="text-xs text-gray-600">Cargando gastos...</span>
        </div>
      );
    }
    
    if (!expensesData || expensesData.cantidad_gastos === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          <p>No hay gastos adicionales registrados para este flete.</p>
        </div>
      );
    }
    
    const { gastos = [], total_gastos, total_recuperable_cliente, total_costo_operativo } = expensesData;
    
    return (
      <div className="space-y-3">
        {/* Resumen de gastos */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <div className="text-gray-500">Total Gastos</div>
            <div className="font-semibold text-gray-900">
              {formatCurrency(total_gastos)}
            </div>
          </div>
          <div className="bg-blue-50 p-2 rounded border border-blue-200">
            <div className="text-blue-600">Recuperable Cliente</div>
            <div className="font-semibold text-blue-700">
              {formatCurrency(total_recuperable_cliente)}
            </div>
          </div>
          <div className="bg-amber-50 p-2 rounded border border-amber-200">
            <div className="text-amber-600">Costo Operativo</div>
            <div className="font-semibold text-amber-700">
              {formatCurrency(total_costo_operativo)}
            </div>
          </div>
        </div>
        
        {/* Tabla de gastos detallados */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-1 px-2 text-left font-medium text-gray-700 border border-gray-200">
                  Código
                </th>
                <th className="py-1 px-2 text-left font-medium text-gray-700 border border-gray-200">
                  Tipo
                </th>
                <th className="py-1 px-2 text-left font-medium text-gray-700 border border-gray-200">
                  Valor
                </th>
                <th className="py-1 px-2 text-left font-medium text-gray-700 border border-gray-200">
                  Factura Cliente
                </th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((gasto, index) => (
                <tr key={gasto.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-1 px-2 border border-gray-200">
                    <span className="font-mono text-xs">{gasto.codigo_gasto}</span>
                  </td>
                  <td className="py-1 px-2 border border-gray-200">
                    {gasto.tipo_gasto}
                  </td>
                  <td className="py-1 px-2 border border-gray-200 font-medium text-gray-900">
                    {formatCurrency(gasto.valor)}
                  </td>
                  <td className="py-1 px-2 border border-gray-200">
                    {gasto.se_factura_cliente ? 'Sí' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Renderizar detalles de un flete
  const renderFreightDetails = (freight, index) => {
    const isExpanded = expandedFreightIndex === index;
    const servicio = freight.servicio || {};
    const fleteId = freight.id || freight.codigo_flete;
    
    return (
      <div key={freight.codigo_flete || index} className="border border-gray-200 rounded-lg mb-2">
        <div 
          className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-lg"
          onClick={() => toggleFreightDetails(index, freight)}
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
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div>
                <div className="font-medium mb-1">Información del Servicio</div>
                <div className="space-y-1">
                  <div><span className="text-gray-600">Placa:</span> {servicio.placa_flota}</div>
                  <div><span className="text-gray-600">Conductor:</span> {servicio.nombre_conductor}</div>
                  <div><span className="text-gray-600">Origen:</span> {servicio.origen}</div>
                  <div><span className="text-gray-600">Destino:</span> {servicio.destino}</div>
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Detalles</div>
                <div className="space-y-1">
                  <div><span className="text-gray-600">Tipo:</span> {servicio.tipo_servicio}</div>
                  <div><span className="text-gray-600">Fecha Servicio:</span> {formatDate(servicio.fecha_servicio)}</div>
                  <div><span className="text-gray-600">Carga:</span> {servicio.m3} m³ / {servicio.tn} TN</div>
                  <div><span className="text-gray-600">Guía:</span> {servicio.gia_rt || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Gastos Adicionales</h4>
              {renderExpensesDetails(fleteId)}
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
  const MetricCard = ({ title, value, icon: Icon, color = 'blue', highlight = false }) => (
    <div className="bg-white p-3 rounded border border-gray-300 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium text-gray-500">{title}</h3>
          <p className={`text-lg font-bold text-gray-800 mt-1 ${highlight ? 'text-red-600' : ''}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 ${color === 'red' ? 'bg-red-50' : color === 'yellow' ? 'bg-yellow-50' : 'bg-blue-50'} rounded`}>
          <Icon className={`h-5 w-5 ${color === 'red' ? 'text-red-600' : color === 'yellow' ? 'text-yellow-600' : 'text-blue-600'}`} />
        </div>
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
                  placeholder="Buscar facturas, clientes..."
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

          {/* Panel de filtros desplegable - SOLO 3 FILTROS */}
          {showFilters && (
            <div className="bg-white border border-gray-300 rounded p-3 mt-3 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Cliente */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={filters.nombre_cliente}
                    onChange={(e) => setFilters({...filters, nombre_cliente: e.target.value})}
                    placeholder="Nombre del cliente..."
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Fecha Servicio - Inicio */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fecha Servicio (Desde)
                  </label>
                  <input
                    type="date"
                    value={filters.fecha_servicio_inicio}
                    onChange={(e) => setFilters({...filters, fecha_servicio_inicio: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Fecha Servicio - Fin */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fecha Servicio (Hasta)
                  </label>
                  <input
                    type="date"
                    value={filters.fecha_servicio_fin}
                    onChange={(e) => setFilters({...filters, fecha_servicio_fin: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
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
          )}
        </div>

        {/* Resumen de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          <MetricCard
            title="Total Vendido"
            value={formatCurrency(summary.total_vendido)}
            icon={DollarSign}
            color="blue"
          />
          
          <MetricCard
            title="Total Facturado"
            value={formatCurrency(summary.total_facturado)}
            icon={FileText}
            color="blue"
          />
          
          <MetricCard
            title="Saldo Pendiente"
            value={formatCurrency(summary.total_pendiente)}
            icon={Clock}
            color="red"
            highlight={summary.total_pendiente > 0}
          />
          
          <div className="bg-white p-3 rounded border border-gray-300 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-medium text-gray-500">Total Detracciones</h3>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {formatCurrency(summary.total_detracciones)}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  <div>Pagado: {formatCurrency(summary.total_pagado_detracc)}</div>
                  <div>Pendiente: {formatCurrency(summary.total_pendiente_detracc)}</div>
                </div>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <MetricCard
            title="Total Pagado"
            value={formatCurrency(summary.total_pagado)}
            icon={CheckCircle}
            color="green"
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
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[150px]">
                    Cliente
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[100px]">
                    Factura
                  </th>
                  
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Fac Emisión
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Fac Vencimiento
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Fecha Servicio
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[100px]">
                    Monto Facturado
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[100px]">
                    Monto por Pagar
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[100px]">
                    Monto Pagado
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[100px]">
                    Saldo  
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Estado De Pago
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 border-r border-gray-300 min-w-[90px]">
                    Estado De Detraccion
                  </th>
                  <th className="py-2 px-3 text-left font-medium text-gray-700 min-w-[70px]">
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const datos = invoice.datos_completos || {};
                  const fechaServicio = datos.fletes?.[0]?.servicio?.fecha_servicio;
                  const rowBalance = calculateRowBalance(invoice);
                  const montoTotal = parseFloat(datos.monto_total || 0);
                  const montoNeto = parseFloat(invoice.monto_neto || 0);
                  const montoPagado = parseFloat(invoice.monto_pagado_acumulado || 0);
                  
                  return (
                    <tr 
                      key={invoice.id}
                      className="border-b border-gray-200 hover:bg-blue-50"
                    >
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="font-medium text-gray-900">
                          {datos.fletes?.[0]?.servicio?.nombre_cliente || "N/A"}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="font-medium text-gray-900">{invoice.codigo_factura}</div>
                        {/* <div className="text-gray-500 text-xs truncate">{datos.numero_factura}</div> */}
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        {formatDate(datos.fecha_emision)}
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        {formatDate(datos.fecha_vencimiento)}
                      </td>
                      
                      <td className="py-2 px-3 border-r border-gray-200">
                        {fechaServicio ? formatDate(fechaServicio) : 'N/A'}
                      </td>
                      
                      <td className="py-2 px-3 border-r border-gray-200 font-medium">
                        {formatCurrency(montoTotal)}
                      </td>
                      
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="font-medium">{formatCurrency(montoNeto)}</div>
                        {montoTotal !== montoNeto && (
                          <div className="text-xs text-gray-500">
                            -{formatCurrency(montoTotal - montoNeto)} detracción
                          </div>
                        )}
                      </td>
                      
                      <td className="py-2 px-3 border-r border-gray-200">
                        {formatCurrency(montoPagado)}
                      </td>
                      
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className={`font-bold ${rowBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(rowBalance)}
                        </div>
                      </td>
                      
                      <td className="py-2 px-3 border-r border-gray-200">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(invoice.estado_pago_neto, 'payment')}`}>
                          {invoice.estado_pago_neto}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(invoice.estado_pago_neto, 'payment')}`}>
                          {invoice.estado_detraccion}  
                        </span>
                      </td>
                      
                      <td className="py-2 px-3">
                        <Button
                          onClick={() => handleRowClick(invoice)}
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2 py-1"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación ORIGINAL (igual a la versión anterior) */}
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
              <span className="text-xs text-gray-600">registros por página</span>
            </div>

            {/* Usando el componente Pagination original */}
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