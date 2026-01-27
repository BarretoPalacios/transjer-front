import React, { useState, useCallback, useEffect } from 'react';
import {
  DollarSign,
  Filter,
  Eye,
  X,
  CheckCircle,
  Calendar,
  FileText,
  Tag,
  Edit,
  Save,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Receipt,
  User,
  Check,
  X as XIcon,
  Clock,
  Hash
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import Pagination from '../../../components/common/Pagination/Pagination';

// API actualizado
import { gastosAdicionalesAPI } from '../../../api/endpoints/gastosAdicionales';

const GastosAdicionales = ({ fleteId, fleteCodigo }) => {
  const [gastos, setGastos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  // Estados para filtros enfocados en facturación
  const [filters, setFilters] = useState({
    tipo_gasto: '',
    estado_facturacion: '',
    estado_aprobacion: '',
    se_factura_cliente: '',
    numero_factura: ''
  });
  
  // Estadísticas de facturación
  const [estadisticas, setEstadisticas] = useState({
    total_gastos: 0,
    facturados: 0,
    pendientes: 0
  });
  
  // Modal para crear/editar
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [gastoSeleccionado, setGastoSeleccionado] = useState(null);
  
  // Formulario
  const [formData, setFormData] = useState({
    tipo_gasto: '',
    descripcion: '',
    valor: '',
    fecha_gasto: new Date().toISOString().split('T')[0],
    se_factura_cliente: true,
    estado_facturacion: 'Pendiente',
    estado_aprobacion: 'pendiente',
    numero_factura: ''
  });
  
  // Modal de detalles
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const itemsPerPageOptions = [10, 20, 30, 50];

  // Tipos de gasto predefinidos
  const tiposGasto = [
    'Estadía',
    'Peaje',
    'Combustible',
    'Alimentación',
    'Hospedaje',
    'Viáticos',
    'Lavado',
    'Mantenimiento',
    'Estacionamiento',
    'Maniobra',
    'Reparación',
    'Seguro',
    'Impuestos',
    'Otros'
  ];

  // Estados de aprobación
  const estadosAprobacion = [
    { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'aprobado', label: 'Aprobado', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'rechazado', label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-300' }
  ];

  // Estados de facturación
  const estadosFacturacion = [
    { value: 'Pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'Facturado', label: 'Facturado', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'No Facturable', label: 'No Facturable', color: 'bg-gray-100 text-gray-800 border-gray-300' }
  ];

  // Opciones para facturación al cliente
  const opcionesFacturaCliente = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Facturable' },
    { value: 'false', label: 'No Facturable' }
  ];

  // Función principal para cargar gastos
  const fetchGastos = useCallback(
    async (page = 1, itemsPerPage = pagination.itemsPerPage, filtersToUse = filters) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      try {
        // Preparar filtros para API
        const cleanFilters = {};
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            if (key === 'se_factura_cliente') {
              cleanFilters[key] = value === 'true';
            } else {
              cleanFilters[key] = value.trim();
            }
          }
        });
        
        // Añadir filtros fijos
        cleanFilters.id_flete = fleteId;
        
        const response = await gastosAdicionalesAPI.getAllGastos(
          cleanFilters, 
          { page, pageSize: itemsPerPage }
        );
        
        if (response && response.items) {
          setGastos(response.items);
          
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 1,
            hasNext: response.pagination.hasNext || false,
            hasPrev: response.pagination.hasPrev || false,
          });
          
          // Calcular estadísticas
          calcularEstadisticas(response.items);
        } else {
          setGastos(response || []);
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response?.length || 0,
            totalPages: Math.ceil((response?.length || 0) / itemsPerPage),
            hasNext: (response?.length || 0) >= itemsPerPage,
            hasPrev: page > 1,
          });
          
          calcularEstadisticas(response || []);
        }
        
      } catch (err) {
        setError('Error al cargar los gastos: ' + (err.message || 'Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    },
    [fleteId]
  );

  // Función para calcular estadísticas
  const calcularEstadisticas = useCallback((gastosList) => {
    const stats = {
      total_gastos: 0,
      facturados: 0,
      pendientes: 0
    };
    
    gastosList.forEach(gasto => {
      const valor = parseFloat(gasto.valor) || 0;
      stats.total_gastos += valor;
      
      if (gasto.estado_facturacion === 'Facturado') {
        stats.facturados += valor;
      } else if (gasto.estado_facturacion === 'Pendiente') {
        stats.pendientes += valor;
      }
    });
    
    setEstadisticas(stats);
  }, []);

  // Efecto para búsqueda en tiempo real con debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      fetchGastos(1, pagination.itemsPerPage, filters);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters]);

  // Cargar datos iniciales
  useEffect(() => {
    if (fleteId) {
      fetchGastos();
    }
  }, [fleteId]);

  const handleViewDetalle = useCallback((gasto) => {
    setGastoSeleccionado(gasto);
    setShowDetalleModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setShowDetalleModal(false);
    setGastoSeleccionado(null);
    resetForm();
  }, []);

  const resetForm = () => {
    setFormData({
      tipo_gasto: '',
      descripcion: '',
      valor: '',
      fecha_gasto: new Date().toISOString().split('T')[0],
      se_factura_cliente: true,
      estado_facturacion: 'Pendiente',
      estado_aprobacion: 'pendiente',
      numero_factura: ''
    });
  };

  const handleCreate = useCallback(() => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((gasto) => {
    setModalMode('edit');
    setGastoSeleccionado(gasto);
    setFormData({
      tipo_gasto: gasto.tipo_gasto,
      descripcion: gasto.descripcion,
      valor: gasto.valor.toString(),
      fecha_gasto: gasto.fecha_gasto?.split('T')[0] || new Date().toISOString().split('T')[0],
      se_factura_cliente: gasto.se_factura_cliente,
      estado_facturacion: gasto.estado_facturacion,
      estado_aprobacion: gasto.estado_aprobacion,
      numero_factura: gasto.numero_factura || ''
    });
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const gastoData = {
        id_flete: fleteId,
        tipo_gasto: formData.tipo_gasto,
        descripcion: formData.descripcion,
        valor: parseFloat(formData.valor) || 0,
        fecha_gasto: formData.fecha_gasto,
        se_factura_cliente: formData.se_factura_cliente,
        estado_facturacion: formData.estado_facturacion,
        estado_aprobacion: formData.estado_aprobacion,
        usuario_registro: localStorage.getItem('username') || 'Sistema'
      };
      
      // Incluir número de factura si se proporciona
      if (formData.numero_factura) {
        gastoData.numero_factura = formData.numero_factura;
      }
      
      if (!gastoData.tipo_gasto) {
        throw new Error('El tipo de gasto es requerido');
      }
      
      if (!gastoData.descripcion) {
        throw new Error('La descripción es requerida');
      }
      
      if (gastoData.valor <= 0) {
        throw new Error('El valor debe ser mayor a 0');
      }
      
      if (modalMode === 'create') {
        await gastosAdicionalesAPI.createGasto(gastoData);
        setSuccessMessage('Gasto creado exitosamente');
      } else {
        await gastosAdicionalesAPI.updateGasto(gastoSeleccionado.id, gastoData);
        setSuccessMessage('Gasto actualizado exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      fetchGastos(pagination.currentPage, pagination.itemsPerPage, filters);
      
    } catch (err) {
      setError('Error al guardar el gasto: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, modalMode, gastoSeleccionado, fetchGastos, pagination.currentPage, pagination.itemsPerPage, filters, fleteId]);

  const handleDelete = useCallback(async (gastoId) => {
    if (!window.confirm('¿Está seguro de eliminar este gasto?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await gastosAdicionalesAPI.deleteGasto(gastoId);
      setSuccessMessage('Gasto eliminado exitosamente');
      fetchGastos(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (err) {
      setError('Error al eliminar el gasto: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGastos, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handleAprobarRechazar = useCallback(async (gastoId, accion) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await gastosAdicionalesAPI.updateEstadoAprobacion(gastoId, {
        estado_aprobacion: accion,
        fecha_aprobacion: new Date().toISOString()
      });
      
      setSuccessMessage(`Gasto ${accion === 'aprobado' ? 'aprobado' : 'rechazado'} exitosamente`);
      fetchGastos(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (err) {
      setError('Error al actualizar el estado: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGastos, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handleFacturar = useCallback(async (gastoId, numeroFactura = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      let facturaNum = numeroFactura;
      
      if (!facturaNum) {
        facturaNum = prompt('Ingrese el número de factura:');
        if (!facturaNum) {
          setIsLoading(false);
          return;
        }
      }
      
      await gastosAdicionalesAPI.updateEstadoFacturacion(gastoId, {
        estado_facturacion: 'Facturado',
        numero_factura: facturaNum
      });
      
      setSuccessMessage('Gasto facturado exitosamente');
      fetchGastos(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (err) {
      setError('Error al facturar el gasto: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGastos, pagination.currentPage, pagination.itemsPerPage, filters]);

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      tipo_gasto: '',
      estado_facturacion: '',
      estado_aprobacion: '',
      se_factura_cliente: '',
      numero_factura: ''
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchGastos(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchGastos, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchGastos(newPage, pagination.itemsPerPage, filters);
    },
    [fetchGastos, pagination.itemsPerPage, filters]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchGastos(1, newItemsPerPage, filters);
    },
    [fetchGastos, filters]
  );

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return fecha;
    }
  };

  // Formatear moneda
  const formatMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor || 0);
  };

  // Mostrar loading solo en carga inicial
  if (isLoading && gastos.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gastos Adicionales - Flete: {fleteCodigo}
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de gastos adicionales y control de facturación
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
          {/* <Button
            onClick={handleCreate}
            variant="primary"
            size="small"
            icon={Plus}
          >
            Nuevo Gasto
          </Button> */}
        </div>
      </div>

      {/* Panel de Estadísticas */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Gastos</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoneda(estadisticas.total_gastos)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-yellow-300 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendiente Fact.</p>
              <p className="text-2xl font-bold text-yellow-700">{formatMoneda(estadisticas.pendientes)}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-green-300 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Facturado</p>
              <p className="text-2xl font-bold text-green-700">{formatMoneda(estadisticas.facturados)}</p>
            </div>
            <Receipt className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <div>
              <span className="font-medium">Éxito:</span>
              <span className="ml-2">{successMessage}</span>
            </div>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="mt-2 text-sm text-green-600 hover:text-green-800"
          >
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <X className="h-5 w-5 mr-2" />
            <div>
              <span className="font-medium">Error:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros de Facturación
            </h3>
            <p className="text-sm text-gray-600">Filtrado en tiempo real</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="small"
              icon={RefreshCw}
              isLoading={isLoading}
            >
              Actualizar
            </Button>

            <Button
              onClick={clearFilters}
              variant="secondary"
              size="small"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Filtros en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Estado de Facturación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Estado Facturación
            </label>
            <select
              value={filters.estado_facturacion}
              onChange={(e) => handleFilterChange('estado_facturacion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos los estados</option>
              {estadosFacturacion.map((estado) => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>
          
          {/* Factura al Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Factura Cliente
            </label>
            <select
              value={filters.se_factura_cliente}
              onChange={(e) => handleFilterChange('se_factura_cliente', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              {opcionesFacturaCliente.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
              ))}
            </select>
          </div>

          {/* Estado Aprobación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprobación
            </label>
            <select
              value={filters.estado_aprobacion}
              onChange={(e) => handleFilterChange('estado_aprobacion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos los estados</option>
              {estadosAprobacion.map((estado) => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Gasto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Gasto
            </label>
            <select
              value={filters.tipo_gasto}
              onChange={(e) => handleFilterChange('tipo_gasto', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Todos los tipos</option>
              {tiposGasto.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          {/* Número de Factura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              N° Factura
            </label>
            <input
              type="text"
              value={filters.numero_factura}
              onChange={(e) => handleFilterChange('numero_factura', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Buscar por número..."
            />
          </div>
        </div>

        {/* Contador de filtros activos */}
        {Object.values(filters).some(f => f && f !== '') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                Filtros activos: 
                <span className="font-medium text-blue-600 ml-2">
                  {Object.values(filters).filter(f => f && f !== '').length}
                </span>
              </span>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Limpiar todos los filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Gastos */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Código
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Tipo
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Descripción
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Fecha
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Valor
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Fact. Cliente
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Aprobación
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Facturación
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((gasto) => (
                <tr 
                  key={gasto.id} 
                  className="border-b border-gray-200 hover:bg-blue-50"
                >
                  {/* Código */}
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {gasto.codigo_gasto}
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                      ${gasto.tipo_gasto === 'Estadía' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                        gasto.tipo_gasto === 'Peaje' ? 'bg-green-100 text-green-800 border border-green-300' :
                        gasto.tipo_gasto === 'Combustible' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                        'bg-gray-100 text-gray-800 border border-gray-300'}`}
                    >
                      {gasto.tipo_gasto}
                    </span>
                  </td>

                  {/* Descripción */}
                  <td className="px-4 py-3">
                    <div className="text-gray-900 max-w-[200px] truncate" title={gasto.descripcion}>
                      {gasto.descripcion}
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-gray-900 text-sm">
                      {formatFecha(gasto.fecha_gasto)}
                    </div>
                  </td>

                  {/* Valor */}
                  <td className="px-4 py-3">
                    <div className={`font-semibold ${gasto.se_factura_cliente ? 'text-green-700' : 'text-red-700'}`}>
                      {formatMoneda(gasto.valor)}
                    </div>
                  </td>

                  {/* Factura Cliente */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                      ${gasto.se_factura_cliente ? 
                        'bg-green-100 text-green-800 border border-green-300' : 
                        'bg-red-100 text-red-800 border border-red-300'}`}
                    >
                      {gasto.se_factura_cliente ? 'Sí' : 'No'}
                    </span>
                  </td>

                  {/* Aprobación */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                      ${estadosAprobacion.find(e => e.value === gasto.estado_aprobacion)?.color || 
                        'bg-gray-100 text-gray-800 border border-gray-300'}`}
                    >
                      {estadosAprobacion.find(e => e.value === gasto.estado_aprobacion)?.label || gasto.estado_aprobacion}
                    </span>
                  </td>

                  {/* Facturación */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                        ${estadosFacturacion.find(e => e.value === gasto.estado_facturacion)?.color || 
                          'bg-gray-100 text-gray-800 border border-gray-300'}`}
                      >
                        {gasto.estado_facturacion}
                      </span>
                      {gasto.numero_factura && (
                        <span className="text-xs text-gray-600 font-mono">
                          {gasto.numero_factura}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetalle(gasto)}
                        className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEdit(gasto)}
                        className="p-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {gasto.estado_aprobacion === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleAprobarRechazar(gasto.id, 'aprobado')}
                            className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
                            title="Aprobar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAprobarRechazar(gasto.id, 'rechazado')}
                            className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                            title="Rechazar"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      {/* {gasto.estado_facturacion === 'Pendiente' && gasto.se_factura_cliente && gasto.estado_aprobacion === 'aprobado' && (
                        <button
                          onClick={() => handleFacturar(gasto.id)}
                          className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
                          title="Facturar"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                      )} */}
                      
                      <button
                        onClick={() => handleDelete(gasto.id)}
                        className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                        title="Eliminar"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {gastos.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron gastos</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f && f !== '')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay gastos registrados para este flete'}
            </p>
            {Object.values(filters).some(f => f && f !== '') && (
              <Button onClick={clearFilters} size="small">
                Limpiar filtros
              </Button>
            )}
            {/* <div className="mt-4">
              <Button onClick={handleCreate} variant="primary" icon={Plus}>
                Registrar primer gasto
              </Button>
            </div> */}
          </div>
        )}
      </div>

      {/* Paginación y registros por página */}
      {gastos.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <span className="text-sm text-gray-600">Mostrar</span>
            <select
              className="border border-gray-300 rounded px-3 py-1 text-sm"
              value={pagination.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">registros por página</span>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            startIndex={
              (pagination.currentPage - 1) * pagination.itemsPerPage + 1
            }
            endIndex={Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}
          />
        </div>
      )}

      {/* Modal para crear/editar gasto */}
      <Modal 
        isOpen={showModal}
        onClose={handleCloseModal}
        title={`${modalMode === 'create' ? 'Nuevo Gasto' : 'Editar Gasto'}`}
        size="medium"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Gasto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Gasto *
              </label>
              <select
                value={formData.tipo_gasto}
                onChange={(e) => setFormData({...formData, tipo_gasto: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Seleccionar tipo</option>
                {tiposGasto.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (S/.) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">S/.</span>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Gasto *
              </label>
              <input
                type="date"
                value={formData.fecha_gasto}
                onChange={(e) => setFormData({...formData, fecha_gasto: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            {/* Estado Aprobación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Aprobación
              </label>
              <select
                value={formData.estado_aprobacion}
                onChange={(e) => setFormData({...formData, estado_aprobacion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {estadosAprobacion.map((estado) => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
            </div>

            {/* Factura al Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Factura al Cliente
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.se_factura_cliente === true}
                    onChange={() => setFormData({...formData, se_factura_cliente: true})}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Sí</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.se_factura_cliente === false}
                    onChange={() => setFormData({...formData, se_factura_cliente: false})}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Estado Facturación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Facturación
              </label>
              <select
                value={formData.estado_facturacion}
                onChange={(e) => setFormData({...formData, estado_facturacion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {estadosFacturacion.map((estado) => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
            </div>

            {/* Número de Factura - Ahora siempre visible en edición */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Factura
              </label>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.numero_factura}
                  onChange={(e) => setFormData({...formData, numero_factura: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ej: F001-0000001"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ingrese el número de factura si el gasto ya ha sido facturado
              </p>
            </div>

            {/* Descripción (full width) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows="3"
                placeholder="Descripción detallada del gasto..."
                required
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleCloseModal}
              variant="secondary"
              size="small"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              size="small"
              isLoading={isLoading}
            >
              {modalMode === 'create' ? 'Crear Gasto' : 'Actualizar Gasto'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para detalles del gasto */}
      <Modal 
        isOpen={showDetalleModal}
        onClose={handleCloseModal}
        title={`Detalles del Gasto - ${gastoSeleccionado?.codigo_gasto || ''}`}
        size="medium"
      >
        {gastoSeleccionado && (
          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  Información del Gasto
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Código
                    </label>
                    <p className="text-sm font-mono font-semibold text-gray-900">{gastoSeleccionado.codigo_gasto}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Tipo de Gasto
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                      ${gastoSeleccionado.tipo_gasto === 'Estadía' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                        gastoSeleccionado.tipo_gasto === 'Peaje' ? 'bg-green-100 text-green-800 border border-green-300' :
                        'bg-gray-100 text-gray-800 border border-gray-300'}`}
                    >
                      {gastoSeleccionado.tipo_gasto}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Valor
                    </label>
                    <p className={`text-lg font-bold ${gastoSeleccionado.se_factura_cliente ? 'text-green-700' : 'text-red-700'}`}>
                      {formatMoneda(gastoSeleccionado.valor)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Fecha del Gasto
                    </label>
                    <p className="text-sm text-gray-900">{formatFecha(gastoSeleccionado.fecha_gasto)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Factura al Cliente
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                      ${gastoSeleccionado.se_factura_cliente ? 
                        'bg-green-100 text-green-800 border border-green-300' : 
                        'bg-red-100 text-red-800 border border-red-300'}`}
                    >
                      {gastoSeleccionado.se_factura_cliente ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Estado de Aprobación
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                      ${estadosAprobacion.find(e => e.value === gastoSeleccionado.estado_aprobacion)?.color || 
                        'bg-gray-100 text-gray-800 border border-gray-300'}`}
                    >
                      {estadosAprobacion.find(e => e.value === gastoSeleccionado.estado_aprobacion)?.label || gastoSeleccionado.estado_aprobacion}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Estado de Facturación
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                      ${estadosFacturacion.find(e => e.value === gastoSeleccionado.estado_facturacion)?.color || 
                        'bg-gray-100 text-gray-800 border border-gray-300'}`}
                    >
                      {gastoSeleccionado.estado_facturacion}
                    </span>
                  </div>
                  {gastoSeleccionado.numero_factura && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Número de Factura
                      </label>
                      <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 p-2 rounded border">
                        {gastoSeleccionado.numero_factura}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Descripción
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {gastoSeleccionado.descripcion}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Registrado por
                    </label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {gastoSeleccionado.usuario_registro}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Fecha Registro
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatFecha(gastoSeleccionado.fecha_registro)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de cierre */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleCloseModal}
                variant="secondary"
                size="small"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(GastosAdicionales);