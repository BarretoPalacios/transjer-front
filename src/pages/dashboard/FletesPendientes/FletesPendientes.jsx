import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Truck,
  RefreshCw,
  Filter,
  Eye,
  X,
  CheckCircle,
  Calendar,
  FileText,
  DollarSign,
  Hash,
  Edit,
  Save,
  XCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  PlusCircle,
  Receipt,
  Clock,
  CheckSquare,
  XSquare
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import Pagination from '../../../components/common/Pagination/Pagination';

// API
import { fletesAPI } from '../../../api/endpoints/fletes';
// Importar API de servicios
import { serviciosPrincipalesAPI } from '../../../api/endpoints/servicioPrincipal';

const FletesPendientes = ({ servicioId, servicioCodigo }) => {
  const [fletes, setFletes] = useState([]);
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
  
  // Estados para filtros - ahora usamos solo uno para filtrado en tiempo real
  const [filters, setFilters] = useState({
    codigo_flete: '',
    codigo_servicio: ''
  });
  
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [modalMode, setModalMode] = useState('flete'); // 'flete' o 'servicio' o 'gastos'
  const [fleteSeleccionado, setFleteSeleccionado] = useState(null);
  const [servicioDetalle, setServicioDetalle] = useState(null);
  const [editingFlete, setEditingFlete] = useState(null);
  const [editForm, setEditForm] = useState({
    monto_flete: '',
    observaciones: ''
  });
  
  // Estados para gastos adicionales
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [gastosFlete, setGastosFlete] = useState([]);
  const [loadingGastos, setLoadingGastos] = useState(false);
  const [gastoForm, setGastoForm] = useState({
    fecha: '',
    tipo_gasto: '',
    valor: '',
    se_factura: false,
    estado_facturacion: 'N/A',
    n_factura: '',
    estado_aprobacion: 'PENDIENTE',
    observaciones: ''
  });
  
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loadingServicio, setLoadingServicio] = useState(false);
  
  const itemsPerPageOptions = [10, 20, 30, 50];
  const isInitialMount = useRef(true);

  // Opciones para tipo de gasto
  const tipoGastoOptions = [
    'Estadía',
    'Reparación',
    'Peaje Extra',
    'Maniobras',
    'Multa',
    'Combustible Extra',
    'Alimentación',
    'Hospedaje',
    'Gastos Extraordinarios',
    'Otros'
  ];

  // Función principal para cargar fletes
  const fetchFletes = useCallback(
    async (page = 1, itemsPerPage = pagination.itemsPerPage, filtersToUse = filters) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      try {
        // Preparar filtros para API
        const cleanFilters = {};
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            cleanFilters[key] = value.trim();
          }
        });
        
        // Añadir filtros fijos
        cleanFilters.page = page;
        cleanFilters.page_size = itemsPerPage;
        cleanFilters.estado_flete = 'PENDIENTE';
        
        // Añadir filtro de servicio si existe
        if (servicioId) {
          cleanFilters.servicio_id = servicioId;
        }
        
        console.log('Fetching fletes with params:', cleanFilters); // Para debug
        
        // Usar la API
        const response = await fletesAPI.getAllFletes(cleanFilters);
        console.log('API Response:', response); // Para debug
        
        // Asegurar que la respuesta tenga la estructura esperada
        if (response && response.items) {
          setFletes(response.items);
          
          // Actualizar paginación
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.total || 0,
            totalPages: response.total_pages || 1,
            hasNext: response.has_next || false,
            hasPrev: response.has_prev || false,
          });
        } else {
          // Si la respuesta no tiene la estructura paginada, la convertimos
          setFletes(response || []);
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response?.length || 0,
            totalPages: Math.ceil((response?.length || 0) / itemsPerPage),
            hasNext: (response?.length || 0) >= itemsPerPage,
            hasPrev: page > 1,
          });
        }
        
      } catch (err) {
        setError('Error al cargar los fletes: ' + (err.message || 'Error desconocido'));
        console.error('Error fetching fletes:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [servicioId]
  );

  // Función para cargar gastos de un flete
  const fetchGastosFlete = useCallback(async (fleteId) => {
    if (!fleteId) return;
    
    setLoadingGastos(true);
    setError(null);
    
    try {
      console.log('Cargando gastos para el flete ID:', fleteId);
      
      const response = await fletesAPI.getGastosByFlete(fleteId);
       
      setGastosFlete(response.gastos || []);
      
    } catch (err) {
      console.error('Error al cargar gastos del flete:', err);
      setError('Error al cargar los gastos del flete');
    } finally {
      setLoadingGastos(false);
    }
  }, []);

  // Efecto para búsqueda en tiempo real con debounce
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Crear nuevo timeout
    const timeout = setTimeout(() => {
      // Resetear a página 1 cuando cambian los filtros
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      // Llamar a fetchFletes con página 1
      fetchFletes(1, pagination.itemsPerPage, filters);
    }, 300); // 300ms de debounce

    setSearchTimeout(timeout);

    // Limpiar timeout al desmontar
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters]); // Solo se ejecuta cuando cambian los filtros

  // Efecto para cargar cuando cambia la página o itemsPerPage
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
    }
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialMount.current) {
      fetchFletes(1, pagination.itemsPerPage, filters);
      isInitialMount.current = false;
    }
  }, []);

  // Función para cargar detalles del servicio
  const fetchServicioDetalle = useCallback(async (servicioIdToFetch) => {
    setLoadingServicio(true);
    setError(null);
    
    try {
      if (serviciosPrincipalesAPI?.getServicioPrincipalById) {
        const response = await serviciosPrincipalesAPI.getServicioPrincipalById(servicioIdToFetch);
        setServicioDetalle(response);
      } else {
        throw new Error('API de servicios no disponible');
      }
    } catch (err) {
      console.error('Error al cargar detalles del servicio:', err);
      setServicioDetalle({
        codigo_servicio_principal: servicioCodigo || 'N/A',
        servicio_id: servicioIdToFetch,
        fecha_servicio: 'Fecha no disponible',
        estado: 'Estado no disponible',
        cliente: { 
          nombre: 'Cliente no disponible',
          ruc: 'No disponible'
        },
        origen: 'Origen no disponible',
        destino: 'Destino no disponible',
        tipo_servicio: 'Tipo no disponible',
        descripcion: 'Sin descripción disponible'
      });
    } finally {
      setLoadingServicio(false);
    }
  }, [servicioCodigo]);

  const handleViewServicioFromFlete = useCallback(async () => {
    if (!fleteSeleccionado?.servicio_id) {
      setError('No hay información del servicio asociado');
      return;
    }
    
    await fetchServicioDetalle(fleteSeleccionado.servicio_id);
    setModalMode('servicio');
  }, [fleteSeleccionado, fetchServicioDetalle]);

  const handleViewDetalle = useCallback((flete) => {
    setFleteSeleccionado(flete);
    setModalMode('flete');
    setShowDetalleModal(true);
  }, []);

  // Función para manejar gastos adicionales
  const handleGastosAdicionales = useCallback((flete) => {
    setFleteSeleccionado(flete);
    setGastoForm({
      fecha: new Date().toISOString().split('T')[0], // Fecha actual
      tipo_gasto: '',
      valor: '',
      se_factura: false,
      estado_facturacion: 'N/A',
      n_factura: '',
      estado_aprobacion: 'PENDIENTE',
      observaciones: ''
    });
    setShowGastoModal(true);
  }, []);

  // Función para ver gastos del flete
  const handleVerGastos = useCallback(async (flete) => {
    setFleteSeleccionado(flete);
    await fetchGastosFlete(flete.id);
    setModalMode('gastos');
    setShowDetalleModal(true);
  }, [fetchGastosFlete]);

  const handleBackToFlete = useCallback(() => {
    setModalMode('flete');
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDetalleModal(false);
    setModalMode('flete');
    setServicioDetalle(null);
  }, []);

  const handleCloseGastoModal = useCallback(() => {
    setShowGastoModal(false);
    setGastoForm({
      fecha: '',
      tipo_gasto: '',
      valor: '',
      se_factura: false,
      estado_facturacion: 'N/A',
      n_factura: '',
      estado_aprobacion: 'PENDIENTE',
      observaciones: ''
    });
  }, []);

  const handleEdit = useCallback((flete) => {
    setEditingFlete(flete.id);
    setEditForm({
      monto_flete: flete.monto_flete.toString(),
      observaciones: flete.observaciones || ''
    });
  }, []);

  const handleSaveEdit = useCallback(async (fleteId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData = {
        monto_flete: parseFloat(editForm.monto_flete) || 0,
        observaciones: editForm.observaciones
      };
      
      // Validar monto
      if (updateData.monto_flete < 0) {
        throw new Error('El monto no puede ser negativo');
      }
      
      await fletesAPI.updateFlete(fleteId, updateData);
      
      setSuccessMessage('Flete actualizado exitosamente');
      setEditingFlete(null);
      // Recargar datos manteniendo la página actual
      fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
      
    } catch (err) {
      setError('Error al actualizar el flete: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [editForm, fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handleCancelEdit = useCallback(() => {
    setEditingFlete(null);
    setEditForm({
      monto_flete: '',
      observaciones: ''
    });
  }, []);

  // Handler para cambio en formulario de gasto
  const handleGastoFormChange = useCallback((field, value) => {
    setGastoForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Convertir valores string a boolean para se_factura
      if (field === 'se_factura') {
        // Si viene como string 'true' o 'false', convertirlo
        if (value === 'true' || value === true) {
          newForm.se_factura = true;
          newForm.estado_facturacion = 'Pendiente';
          newForm.n_factura = '';
        } else if (value === 'false' || value === false) {
          newForm.se_factura = false;
          newForm.estado_facturacion = 'N/A';
          newForm.n_factura = '---';
        }
      }
      
      return newForm;
    });
  }, []);

  // Handler para guardar gasto
  const handleSaveGasto = useCallback(async () => {
    if (!fleteSeleccionado) return;
    
    try {
      // Validaciones básicas
      if (!gastoForm.tipo_gasto) {
        throw new Error('El tipo de gasto es requerido');
      }
      
      if (!gastoForm.valor || parseFloat(gastoForm.valor) <= 0) {
        throw new Error('El valor debe ser mayor a 0');
      }
      
      // Preparar datos para enviar al backend
      const gastoData = {
        id_flete: fleteSeleccionado.id,
        fecha_gasto: gastoForm.fecha,   
        tipo_gasto: gastoForm.tipo_gasto,
        valor: parseFloat(gastoForm.valor),
        se_factura_cliente: gastoForm.se_factura, // Ya es booleano
        descripcion: gastoForm.observaciones === "" ? "GASTO AGREGADO" : gastoForm.observaciones,
        usuario_registro: 'Sistema'  
      };

      console.log('Datos listos para enviar al backend:', gastoData);
      
      // Llamada al backend
      await fletesAPI.createGasto(gastoData);
      
      // Mensaje de éxito
      setSuccessMessage('Gasto adicional registrado exitosamente');
      handleCloseGastoModal();
      
      // Recargar gastos si estamos en la vista de gastos
      if (modalMode === 'gastos') {
        fetchGastosFlete(fleteSeleccionado.id);
      }
      
    } catch (err) {
      setError('Error al registrar el gasto: ' + err.message);
    }
  }, [fleteSeleccionado, gastoForm, modalMode, fetchGastosFlete, handleCloseGastoModal]);

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      codigo_flete: '',
      codigo_servicio: ''
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchFletes(newPage, pagination.itemsPerPage, filters);
    },
    [fetchFletes, pagination.itemsPerPage, filters]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchFletes(1, newItemsPerPage, filters);
    },
    [fetchFletes, filters]
  );

  // Función para obtener clase de estado
  const getEstadoBadgeClass = (estado) => {
    switch(estado) {
      case 'PENDIENTE': 
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'PAGADO': 
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'CANCELADO': 
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'FACTURADO': 
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      default: 
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Función para obtener clase de estado de aprobación
  const getEstadoAprobacionClass = (estado) => {
    switch(estado?.toUpperCase()) {
      case 'APROBADO': 
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'RECHAZADO': 
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'PENDIENTE': 
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default: 
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Función para obtener clase de estado de facturación
  const getEstadoFacturacionClass = (estado) => {
    switch(estado?.toUpperCase()) {
      case 'FACTURADO': 
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'PENDIENTE': 
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'N/A': 
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default: 
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch (e) {
      return fecha;
    }
  };

  // Formatear valor monetario
  const formatMoneda = (valor) => {
    if (!valor) return 'S/ 0.00';
    return `S/ ${parseFloat(valor).toFixed(2)}`;
  };

  // Mostrar loading solo en carga inicial
  if (isLoading && fletes.length === 0) {
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
            Fletes del Servicio: {servicioCodigo}
          </h1>
          <p className="text-gray-600 mt-1">
            Total: {pagination.totalItems} fletes asociados
          </p>
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
              Filtros de Búsqueda
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código Flete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Código Flete
            </label>
            <input
              type="text"
              value={filters.codigo_flete}
              onChange={(e) => handleFilterChange('codigo_flete', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: FLT-0000000001"
            />
          </div>

          {/* Código Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Código Servicio
            </label>
            <input
              type="text"
              value={filters.codigo_servicio}
              onChange={(e) => handleFilterChange('codigo_servicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: SRV-0000000019"
            />
          </div>
        </div>

        {/* Contador de filtros activos */}
        {Object.values(filters).some(f => f && f.trim() !== '') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                Filtros activos: 
                <span className="font-medium text-blue-600 ml-2">
                  {Object.values(filters).filter(f => f && f.trim() !== '').length}
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

      {/* Tabla de Fletes */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Código Flete
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Código Servicio
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Monto
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Estado
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fecha Creación
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Observaciones
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {fletes.map((flete) => {
                const isEditing = editingFlete === flete.id;
                
                return (
                  <tr 
                    key={flete.id} 
                    className="border-b border-gray-200 hover:bg-blue-50"
                  >
                    {/* Código Flete */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {flete.codigo_flete}
                      </div>
                    </td>

                    {/* Código Servicio */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <div className="font-medium text-gray-900">
                        {flete.codigo_servicio}
                      </div>
                    </td>

                    {/* Monto Flete */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">S/.</span>
                          <input
                            type="number"
                            value={editForm.monto_flete}
                            onChange={(e) => setEditForm({...editForm, monto_flete: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      ) : (
                        <div className="font-medium text-gray-900">
                          S/. {parseFloat(flete.monto_flete).toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(flete.estado_flete)}`}>
                        {flete.estado_flete}
                      </span>
                    </td>

                    {/* Fecha Creación */}
                    <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                      <div className="text-gray-900">
                        {formatFecha(flete.fecha_creacion)}
                      </div>
                    </td>

                    {/* Observaciones */}
                    <td className="px-3 py-2 border-r border-gray-200">
                      {isEditing ? (
                        <textarea
                          value={editForm.observaciones}
                          onChange={(e) => setEditForm({...editForm, observaciones: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          placeholder="Observaciones..."
                          rows="2"
                        />
                      ) : (
                        <div className="text-gray-900 truncate max-w-[200px]">
                          {flete.observaciones || 'Sin observaciones'}
                        </div>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-3 py-2">
                      <div className="flex space-x-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(flete.id)}
                              className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
                              title="Guardar cambios"
                              disabled={isLoading}
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                              title="Cancelar edición"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(flete)}
                              className="p-3 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                              title="Editar flete"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleViewDetalle(flete)}
                              className="p-3 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                              title="Ver detalles"
                            >
                              Detalles
                            </button>
                            <button
                              onClick={() => handleVerGastos(flete)}
                              className="p-3 rounded text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                              title="Ver gastos"
                            >
                              Gastos Asociados
                            </button>
                            <button
                              onClick={() => handleGastosAdicionales(flete)}
                              className="p-3 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
                              title="Agregar gasto adicional"
                            >
                              Agregar Gastos
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sin resultados */}
        {fletes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron fletes</h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f && f.trim() !== '')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay fletes asociados a este servicio'}
            </p>
            {Object.values(filters).some(f => f && f.trim() !== '') && (
              <Button onClick={clearFilters} size="small">
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Paginación y registros por página */}
      {fletes.length > 0 && (
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

      {/* Modal unificado para detalles de flete, servicio y gastos */}
      <Modal 
        isOpen={showDetalleModal}
        onClose={handleCloseModal}
        title={
          modalMode === 'flete' 
            ? `Detalles del Flete - ${fleteSeleccionado?.codigo_flete || ''}`
            : modalMode === 'servicio'
            ? `Detalles del Servicio - ${servicioDetalle?.codigo_servicio_principal || fleteSeleccionado?.codigo_servicio || ''}`
            : `Gastos del Flete - ${fleteSeleccionado?.codigo_flete || ''}`
        }
        size={modalMode === 'gastos' ? 'large' : 'medium'}
      >
        {modalMode === 'flete' ? (
          // Vista de detalles del flete
          fleteSeleccionado && (
            <div className="space-y-6">
              {/* Botón para ver servicio */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleViewServicioFromFlete}
                  variant="secondary"
                  size="small"
                  icon={Info}
                  isLoading={loadingServicio}
                >
                  Ver Detalles del Servicio
                </Button>
              </div>

              {/* Información General del Flete */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información General del Flete
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Código Flete</label>
                      <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado.codigo_flete}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Código Servicio</label>
                      <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado.codigo_servicio}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(fleteSeleccionado.estado_flete)}`}>
                        {fleteSeleccionado.estado_flete}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Monto</label>
                      <p className="text-sm font-semibold text-gray-900">
                        S/. {parseFloat(fleteSeleccionado.monto_flete).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Fecha Creación</label>
                      <p className="text-sm text-gray-900">{formatFecha(fleteSeleccionado.fecha_creacion)}</p>
                    </div>
                    {fleteSeleccionado.fecha_pago && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Fecha Pago</label>
                        <p className="text-sm text-gray-900">{formatFecha(fleteSeleccionado.fecha_pago)}</p>
                      </div>
                    )}
                    {fleteSeleccionado.codigo_factura && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Factura Asociada</label>
                        <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado.codigo_factura}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Observaciones del Flete */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Observaciones del Flete
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {fleteSeleccionado.observaciones || 'Sin observaciones'}
                  </p>
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
          )
        ) : modalMode === 'servicio' ? (
          // Vista de detalles del servicio
          <div className="space-y-6">
            {/* Botón para volver al flete */}
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={handleBackToFlete}
                variant="secondary"
                size="small"
                icon={ArrowLeft}
              >
                Volver al Flete
              </Button>
              {loadingServicio && (
                <div className="text-sm text-blue-600 animate-pulse">
                  Cargando detalles del servicio...
                </div>
              )}
            </div>

            {servicioDetalle && (
              <>
                {/* Información General del Servicio */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Información del Servicio
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Código</label>
                        <p className="text-sm font-semibold text-gray-900">
                          {servicioDetalle.codigo_servicio_principal || fleteSeleccionado?.codigo_servicio || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          servicioDetalle.estado === 'Completado' 
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : servicioDetalle.estado === 'Cancelado'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}>
                          {servicioDetalle.estado || 'Estado no disponible'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Fecha Servicio</label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.fecha_servicio || 'Fecha no disponible'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Tipo de Servicio</label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.tipo_servicio || 'Tipo no disponible'}- 
                          {servicioDetalle.modalidad_servicio || 'Modalidad no disponible'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Cliente</label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.cliente?.nombre || 'Cliente no disponible'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Origen</label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.origen || 'Origen no disponible'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Destino</label>
                        <p className="text-sm text-gray-900">
                          {servicioDetalle.destino || 'Destino no disponible'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Gias</label>
                        <p className="text-sm text-gray-900">
                          RR : {servicioDetalle.gia_rr || 'Gia no disponible'} <br/>
                          RT : {servicioDetalle.gia_rt || 'Gia no disponible'}
                        </p>
                      </div>
                      {servicioDetalle.descripcion && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
                          <p className="text-sm text-gray-900">{servicioDetalle.descripcion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información del Flete Relacionado */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Flete Relacionado
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Código Flete</label>
                        <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado?.codigo_flete || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Estado del Flete</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(fleteSeleccionado?.estado_flete)}`}>
                          {fleteSeleccionado?.estado_flete || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Monto del Flete</label>
                        <p className="text-sm font-semibold text-gray-900">
                          S/. {fleteSeleccionado ? parseFloat(fleteSeleccionado.monto_flete).toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Fecha Creación</label>
                        <p className="text-sm text-gray-900">
                          {fleteSeleccionado ? formatFecha(fleteSeleccionado.fecha_creacion) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

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
        ) : (
          // Vista de gastos del flete
          <div className="space-y-6">
            {/* Botón para volver al flete */}
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={handleBackToFlete}
                variant="secondary"
                size="small"
                icon={ArrowLeft}
              >
                Volver al Flete
              </Button>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleGastosAdicionales(fleteSeleccionado)}
                  variant="primary"
                  size="small"
                  icon={PlusCircle}
                >
                  Agregar Gasto
                </Button>
              </div>
            </div>

            {/* Tabla de gastos */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">ID</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Fecha</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Tipo de Gasto</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Valor</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">¿Se Factura?</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado Facturación</th>
                      {/* <th className="py-2 px-3 text-left font-semibold text-gray-700">Nº Factura</th> */}
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado Aprobación</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingGastos ? (
                      <tr>
                        <td colSpan="9" className="py-4 text-center">
                          <div className="animate-pulse flex items-center justify-center">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </td>
                      </tr>
                    ) : gastosFlete.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-gray-500">
                          <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No hay gastos registrados para este flete</p>
                        </td>
                      </tr>
                    ) : (
                      gastosFlete.map((gasto) => (
                        <tr key={gasto.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2 px-3">{gasto.codigo_gasto}</td>
                          <td className="py-2 px-3">{formatFecha(gasto.fecha_gasto)}</td>
                          <td className="py-2 px-3 font-medium">{gasto.tipo_gasto}</td>
                          <td className="py-2 px-3 font-semibold">{formatMoneda(gasto.valor)}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              gasto.se_factura 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {gasto.se_factura_cliente ? 'SÍ' : 'NO'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getEstadoFacturacionClass(gasto.estado_facturacion)}`}>
                              {gasto.estado_facturacion}
                            </span>
                          </td>
                          {/* <td className="py-2 px-3">{gasto.numero_factura}</td> */}
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getEstadoAprobacionClass(gasto.estado_aprobacion)}`}>
                              {gasto.estado_aprobacion}
                            </span>
                          </td>
                          <td className="py-2 px-3">{gasto.descripcion}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totales */}
            {gastosFlete.length > 0 && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">Resumen de Gastos</h4>
                    <p className="text-sm text-gray-600">{gastosFlete.length} gasto(s) registrado(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total de Gastos</p>
                    <p className="text-xl font-bold text-gray-900">
                      S/ {gastosFlete.reduce((sum, gasto) => sum + parseFloat(gasto.valor), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

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

      {/* Modal para agregar gasto adicional */}
      <Modal
        isOpen={showGastoModal}
        onClose={handleCloseGastoModal}
        title={`Agregar Gasto Adicional - ${fleteSeleccionado?.codigo_flete || ''}`}
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Complete el formulario para registrar un gasto adicional al flete
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha *
              </label>
              <input
                type="date"
                value={gastoForm.fecha}
                onChange={(e) => handleGastoFormChange('fecha', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">La fecha se establece automáticamente</p>
            </div>

            {/* Tipo de Gasto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Gasto *
              </label>
              <select
                value={gastoForm.tipo_gasto}
                onChange={(e) => handleGastoFormChange('tipo_gasto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              >
                <option value="">Seleccione un tipo</option>
                {tipoGastoOptions.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Valor *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                <input
                  type="number"
                  value={gastoForm.valor}
                  onChange={(e) => handleGastoFormChange('valor', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* ¿Se Factura? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Se Factura al Cliente? *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="se_factura"
                    value={true}
                    checked={gastoForm.se_factura === true}
                    onChange={(e) => handleGastoFormChange('se_factura', e.target.value === 'true' ? true : e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">SÍ</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="se_factura"
                    value={false}
                    checked={gastoForm.se_factura === false}
                    onChange={(e) => handleGastoFormChange('se_factura', e.target.value === 'false' ? false : e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">NO</span>
                </label>
              </div>
            </div>

            {/* Estado de Facturación (solo lectura) */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Facturación
              </label>
              <input
                type="text"
                value={gastoForm.estado_facturacion}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {gastoForm.se_factura === true 
                  ? 'Se establecerá como "Pendiente" automáticamente'
                  : 'No aplica para gastos no facturables'}
              </p>
            </div> */}

            {/* Nº Factura (solo si se factura) */}
            {/* {gastoForm.se_factura === true && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nº Factura
                </label>
                <input
                  type="text"
                  value={gastoForm.n_factura}
                  onChange={(e) => handleGastoFormChange('n_factura', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="Ej: FAC-2026-001"
                />
              </div>
            )} */}

            {/* Estado de Aprobación */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Aprobación
              </label>
              <select
                value={gastoForm.estado_aprobacion}
                onChange={(e) => handleGastoFormChange('estado_aprobacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="APROBADO">Aprobado</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div> */}
          </div>

          {/* Observaciones */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={gastoForm.observaciones}
              onChange={(e) => handleGastoFormChange('observaciones', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Observaciones adicionales..."
              rows="3"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              onClick={handleCloseGastoModal}
              variant="secondary"
              size="small"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveGasto}
              variant="primary"
              size="small"
              icon={Save}
            >
              Guardar Gasto
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(FletesPendientes);  