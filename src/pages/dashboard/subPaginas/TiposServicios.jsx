import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  PackagePlus,
  PackageCheck,
  PackageX,
  Plus,
  FileText,
  BarChart3,
  RefreshCw,
  Filter,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Ruler,
  Tag,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Layers // Nuevo icono para modalidad
} from 'lucide-react';

// Componentes comunes
import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import StatsCard from '../../../components/common/StatsCard/StatsCard';
import Pagination from '../../../components/common/Pagination/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';

// API
import { serviciosAPI } from '../../../api/endpoints/servicios';

// Utils
import {
  getEstadoServicioColor,
  getTipoServicioColor,
  getModalidadServicioColor, // Nueva función importada
  formatFecha,
  formatPrecio,
  formatTiempoEstimado
} from '../../../utils/serviciosUtils';

// Componentes específicos de servicios
import ServicioCard from '../../../components/servicios/ServicioCard';
import ServicioForm from '../../../components/servicios/ServicioForm';
import ImportModal from '../../../components/servicios/ImportModal';

// Datos para selectores
import {
  tiposServicio,
  modalidadesServicio, // Nueva importación
  unidadesMedida,
  estadosServicio
} from '../../../data/serviciosData';

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo_servicio: 'todos',
    modalidad_servicio: 'todos', // Nuevo filtro
    unidad_medida: 'todos',
    estado: 'todos',
    precio_min: '',
    precio_max: ''
  });
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedServicios, setSelectedServicios] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  // Estados para modales
  const [modalState, setModalState] = useState({
    show: false,
    mode: 'create',
    data: null
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importErrors, setImportErrors] = useState([]);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    porTipo: {},
    porModalidad: {}, // Nueva estadística
    promedioPrecio: 0,
    precioMasAlto: 0,
    precioMasBajo: Infinity,
    tiempoPromedio: 0
  });

  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  // Configuración de paginación
  const serviciosPorPagina = 8;

  // Función para calcular estadísticas locales
  const calcularEstadisticasLocales = useCallback((data) => {
    const activos = data.filter(s => s.estado === 'activo').length;
    const inactivos = data.filter(s => s.estado === 'inactivo').length;

    // Calcular distribución por tipo
    const porTipo = {};
    const porModalidad = {}; // Nuevo cálculo
    data.forEach(servicio => {
      const tipo = servicio.tipo_servicio;
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
      
      // Calcular distribución por modalidad
      const modalidad = servicio.modalidad_servicio;
      porModalidad[modalidad] = (porModalidad[modalidad] || 0) + 1;
    });

    // Calcular estadísticas de precios
    const precios = data.map(s => s.precio_base).filter(p => !isNaN(p));
    const promedioPrecio = precios.length > 0
      ? precios.reduce((sum, precio) => sum + precio, 0) / precios.length
      : 0;

    const precioMasAlto = precios.length > 0 ? Math.max(...precios) : 0;
    const precioMasBajo = precios.length > 0 ? Math.min(...precios) : 0;

    // Calcular tiempo promedio estimado
    const tiempos = data.map(s => s.tiempo_estimado).filter(t => !isNaN(t));
    const tiempoPromedio = tiempos.length > 0
      ? tiempos.reduce((sum, tiempo) => sum + tiempo, 0) / tiempos.length
      : 0;

    setEstadisticas({
      total: data.length,
      activos,
      inactivos,
      porTipo,
      porModalidad, // Incluir en estadísticas
      promedioPrecio: parseFloat(promedioPrecio.toFixed(2)),
      precioMasAlto: parseFloat(precioMasAlto.toFixed(2)),
      precioMasBajo: precioMasBajo === Infinity ? 0 : parseFloat(precioMasBajo.toFixed(2)),
      tiempoPromedio: parseFloat(tiempoPromedio.toFixed(0))
    });
  }, []);

  // Cargar servicios desde el backend
  const fetchServicios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filtersForAPI = {};

      if (filters.tipo_servicio !== 'todos') filtersForAPI.tipo_servicio = filters.tipo_servicio;
      if (filters.modalidad_servicio !== 'todos') filtersForAPI.modalidad_servicio = filters.modalidad_servicio; // Nuevo filtro
      if (filters.unidad_medida !== 'todos') filtersForAPI.unidad_medida = filters.unidad_medida;
      if (filters.estado !== 'todos') filtersForAPI.estado = filters.estado;
      if (filters.precio_min) filtersForAPI.precio_min = parseFloat(filters.precio_min);
      if (filters.precio_max) filtersForAPI.precio_max = parseFloat(filters.precio_max);

      const data = await serviciosAPI.getAllServicios(filtersForAPI);
      setServicios(data);

      // Intentar obtener estadísticas desde el backend
      try {
        const stats = await serviciosAPI.getEstadisticas();
        setEstadisticas(prev => ({
          ...prev,
          ...stats
        }));
      } catch (statsErr) {
        // Si falla, calculamos estadísticas locales
        console.warn('No se pudieron cargar estadísticas del backend:', statsErr);
        calcularEstadisticasLocales(data);
      }

    } catch (err) {
      setError('Error al cargar los servicios: ' + err.message);
      console.error('Error fetching servicios:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, calcularEstadisticasLocales]);

  // Efecto inicial
  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  // Filtrar servicios localmente por búsqueda
  const filteredServicios = useMemo(() => {
    if (!searchTerm) return servicios;

    const searchLower = searchTerm.toLowerCase();
    return servicios.filter(servicio =>
      servicio.codigo_servicio?.toLowerCase().includes(searchLower) ||
      servicio.nombre?.toLowerCase().includes(searchLower) ||
      servicio.descripcion?.toLowerCase().includes(searchLower) ||
      servicio.tipo_servicio?.toLowerCase().includes(searchLower) ||
      servicio.modalidad_servicio?.toLowerCase().includes(searchLower) // Nueva búsqueda
    );
  }, [servicios, searchTerm]);

  // Calcular paginación
  const totalPaginas = Math.ceil(filteredServicios.length / serviciosPorPagina);
  const indexOfLastServicio = currentPage * serviciosPorPagina;
  const indexOfFirstServicio = indexOfLastServicio - serviciosPorPagina;
  const currentServicios = filteredServicios.slice(indexOfFirstServicio, indexOfLastServicio);

  // Handlers optimizados
  const handleCreate = useCallback(() => {
    setModalState({
      show: true,
      mode: 'create',
      data: null
    });
    setError(null);
  }, []);

  const handleEdit = useCallback((servicio) => {
    setModalState({
      show: true,
      mode: 'edit',
      data: servicio
    });
    setError(null);
  }, []);

  const handleView = useCallback((servicio) => {
    setModalState({
      show: true,
      mode: 'view',
      data: servicio
    });
  }, []);

  const handleDelete = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await serviciosAPI.hardDeleteServicio(deleteId);
      setServicios(prev => prev.filter(s => s._id !== deleteId && s.id !== deleteId));
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchServicios();
    } catch (err) {
      setError('Error al eliminar el servicio: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId, fetchServicios]);

  const handleSaveServicio = useCallback(async (formData) => {
    setIsSaving(true);
    setError(null);

    try {
      if (modalState.mode === 'create') {
        // Verificar si el código ya existe
        const existeCodigo = servicios.some(s => s.codigo_servicio === formData.codigo_servicio);
        if (existeCodigo) {
          setError('El código de servicio ya está registrado');
          setIsSaving(false);
          return;
        }

        const nuevoServicio = await serviciosAPI.createServicio(formData);
        setServicios(prev => [...prev, nuevoServicio]);
      } else if (modalState.mode === 'edit') {
        const servicioId = modalState.data._id || modalState.data.id;
        const servicioActualizado = await serviciosAPI.updateServicio(servicioId, formData);
        setServicios(prev =>
          prev.map(s => (s._id === servicioId || s.id === servicioId) ? servicioActualizado : s)
        );
      }

      setModalState({ show: false, mode: 'create', data: null });
      fetchServicios();
    } catch (err) {
      setError('Error al guardar el servicio: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }, [modalState, servicios, fetchServicios]);

  const handleExport = useCallback(async () => {
    try {
      const filtersForAPI = {};

      if (filters.tipo_servicio !== 'todos') filtersForAPI.tipo_servicio = filters.tipo_servicio;
      if (filters.modalidad_servicio !== 'todos') filtersForAPI.modalidad_servicio = filters.modalidad_servicio; // Nuevo filtro
      if (filters.unidad_medida !== 'todos') filtersForAPI.unidad_medida = filters.unidad_medida;
      if (filters.estado !== 'todos') filtersForAPI.estado = filters.estado;
      if (filters.precio_min) filtersForAPI.precio_min = parseFloat(filters.precio_min);
      if (filters.precio_max) filtersForAPI.precio_max = parseFloat(filters.precio_max);

      await serviciosAPI.downloadAllServiciosExcel(filtersForAPI);
    } catch (err) {
      setError('Error al exportar: ' + err.message);
    }
  }, [filters]);

  const handleImport = useCallback(async (file) => {
    setIsImporting(true);
    setImportErrors([]);

    try {
      const result = await serviciosAPI.importServiciosExcel(file);

      // Actualizar lista si hay datos
      if (result.data && result.data.length > 0) {
        setServicios(prev => [...prev, ...result.data]);
      }

      setShowImportModal(false);

      // Recargar estadísticas
      fetchServicios();

      return { success: true, count: result.data?.length || 0 };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error en la importación';
      setImportErrors([errorMsg]);
      return { success: false, error: errorMsg };
    } finally {
      setIsImporting(false);
    }
  }, [fetchServicios]);

  const downloadTemplate = useCallback(() => {
    serviciosAPI.downloadTemplate();
  }, []);

  const toggleServicioSelection = useCallback((id) => {
    setSelectedServicios(prev =>
      prev.includes(id)
        ? prev.filter(servicioId => servicioId !== id)
        : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedServicios.length === currentServicios.length) {
      setSelectedServicios([]);
    } else {
      setSelectedServicios(currentServicios.map(s => s._id || s.id));
    }
  }, [currentServicios, selectedServicios.length]);

  const clearFilters = useCallback(() => {
    setFilters({
      tipo_servicio: 'todos',
      modalidad_servicio: 'todos', // Incluir en limpieza
      unidad_medida: 'todos',
      estado: 'todos',
      precio_min: '',
      precio_max: ''
    });
    setSearchTerm('');
  }, []);

  const getTopTipo = () => {
    const tipos = Object.entries(estadisticas.porTipo);
    if (tipos.length === 0) return { tipo: 'N/A', count: 0 };

    const [tipo, count] = tipos.sort((a, b) => b[1] - a[1])[0];
    return { tipo, count };
  };

  const topTipo = getTopTipo();

  if (isLoading && servicios.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h1>
          <p className="text-gray-600 mt-1">
            Administra y gestiona los servicios ofrecidos por la empresa
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            onClick={handleCreate}
            icon={PackagePlus}
          >
            Nuevo Servicio
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Servicios"
          value={estadisticas.total}
          icon={Package}
          color="blue"
          subtitle={`${topTipo.count} de ${topTipo.tipo}`}
          subtitleColor="blue"
        />

        <StatsCard
          title="Servicios Activos"
          value={estadisticas.activos}
          icon={PackageCheck}
          color="green"
          subtitle={`${estadisticas.total > 0 ? ((estadisticas.activos / estadisticas.total) * 100).toFixed(1) : 0}% del total`}
        />

        <StatsCard
          title="Precio Promedio"
          value={`S/ ${estadisticas.promedioPrecio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="purple"
          subtitle={`Rango: S/ ${estadisticas.precioMasBajo.toLocaleString('es-ES')} - S/ ${estadisticas.precioMasAlto.toLocaleString('es-ES')}`}
        />

        <StatsCard
          title="Tiempo Promedio"
          value={formatTiempoEstimado(estadisticas.tiempoPromedio)}
          icon={Clock}
          color="orange"
          subtitle={`${estadisticas.total} servicios registrados`}
        />
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por código, nombre, descripción, modalidad..."
          />

          <div className="flex items-center space-x-3">
            {/* Controles de vista */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="small"
                className="rounded-none"
                icon={BarChart3}
              />
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="small"
                className="rounded-none"
                icon={FileText}
              />
            </div>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              icon={Filter}
            >
              Filtros
              {Object.values(filters).some(f => f !== 'todos' && f !== '') && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Activos
                </span>
              )}
            </Button>

            <Button
              onClick={() => setShowImportModal(true)}
              variant="secondary"
              icon={Upload}
            >
              Importar
            </Button>

            <Button
              onClick={handleExport}
              variant="secondary"
              icon={Download}
            >
              Exportar
            </Button>

            <Button
              onClick={fetchServicios}
              variant="secondary"
              size="small"
              icon={RefreshCw}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Servicio
                </label>
                <select
                  value={filters.tipo_servicio}
                  onChange={(e) => setFilters({ ...filters, tipo_servicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los tipos</option>
                  {tiposServicio.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              {/* Nuevo filtro de modalidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalidad
                </label>
                <select
                  value={filters.modalidad_servicio}
                  onChange={(e) => setFilters({ ...filters, modalidad_servicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todas las modalidades</option>
                  {modalidadesServicio.map(modalidad => (
                    <option key={modalidad.value} value={modalidad.value}>{modalidad.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de Medida
                </label>
                <select
                  value={filters.unidad_medida}
                  onChange={(e) => setFilters({ ...filters, unidad_medida: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todas las unidades</option>
                  {unidadesMedida.map(unidad => (
                    <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  {estadosServicio.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de Precio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filters.precio_min}
                    onChange={(e) => setFilters({ ...filters, precio_min: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    step="0.01"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filters.precio_max}
                    onChange={(e) => setFilters({ ...filters, precio_max: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={clearFilters}
                variant="secondary"
              >
                Limpiar filtros
              </Button>
              <Button
                onClick={() => setShowFilters(false)}
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentServicios.map((servicio) => (
            <ServicioCard
              key={servicio._id || servicio.id}
              servicio={servicio}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getEstadoColor={getEstadoServicioColor}
              getTipoServicioColor={getTipoServicioColor}
              getModalidadServicioColor={getModalidadServicioColor} // Nueva prop
              formatFecha={formatFecha}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {/* <th className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedServicios.length === currentServicios.length && currentServicios.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th> */}
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Servicio</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Código /  Unidad</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900"> Tipo / Modalidad</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Precio / Tiempo</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Registro</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentServicios.map((servicio) => (
                  <tr key={servicio._id || servicio.id} className="hover:bg-gray-50">
                    {/* <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedServicios.includes(servicio._id || servicio.id)}
                        onChange={() => toggleServicioSelection(servicio._id || servicio.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td> */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 line-clamp-2">
                        {servicio.nombre}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {servicio.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {servicio.codigo_servicio}
                      </div>
                      <div className="mt-1 flex justify-start items-center gap-1">
                        <Ruler className="h-3 w-3" /> {servicio.unidad_medida}
                        
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoServicioColor(servicio.tipo_servicio)}`}>
                          {servicio.tipo_servicio}
                        </span>
                      </div>
                      <div className="mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModalidadServicioColor(servicio.modalidad_servicio)}`}>
                          <Layers className="h-2 w-2 mr-1" />
                          {servicio.modalidad_servicio}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-lg font-bold text-gray-900">
                        S/ {formatPrecio(servicio.precio_base)}
                      </div>
                      {servicio.tiempo_estimado > 0 && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTiempoEstimado(servicio.tiempo_estimado)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoServicioColor(servicio.estado)}`}>
                        {servicio.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {formatFecha(servicio.fecha_registro)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleView(servicio)}
                          variant="ghost"
                          size="small"
                          icon={Eye}
                          title="Ver detalles"
                        />
                        <Button
                          onClick={() => handleEdit(servicio)}
                          variant="ghost"
                          size="small"
                          icon={Edit}
                          title="Editar"
                        />
                        <Button
                          onClick={() => handleDelete(servicio._id || servicio.id)}
                          variant="ghost"
                          size="small"
                          icon={Trash2}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {filteredServicios.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPaginas}
          totalItems={filteredServicios.length}
          itemsPerPage={serviciosPorPagina}
          onPageChange={setCurrentPage}
          startIndex={indexOfFirstServicio}
          endIndex={Math.min(indexOfLastServicio, filteredServicios.length)}
        />
      )}

      {/* Sin resultados */}
      {filteredServicios.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron servicios</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || Object.values(filters).some(f => f !== 'todos' && f !== '')
              ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
              : 'No hay servicios registrados en el sistema'}
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={clearFilters}>
              Limpiar búsqueda
            </Button>
            <Button
              onClick={handleCreate}
              variant="secondary"
            >
              Registrar primer servicio
            </Button>
          </div>
        </div>
      )}

      {/* Modal de CRUD de servicios */}
      <Modal
        isOpen={modalState.show}
        onClose={() => setModalState({ show: false, mode: 'create', data: null })}
        title={
          modalState.mode === 'create' ? 'Nuevo Servicio' :
            modalState.mode === 'edit' ? 'Editar Servicio' :
              'Detalles del Servicio'
        }
        size="large"
      >
        <ServicioForm
          initialData={modalState.data}
          onSubmit={handleSaveServicio}
          onCancel={() => setModalState({ show: false, mode: 'create', data: null })}
          mode={modalState.mode}
          isLoading={isSaving}
          error={error}
        />
      </Modal>

      {/* Modal de importación */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportErrors([]);
        }}
        onImport={handleImport}
        onDownloadTemplate={downloadTemplate}
        importErrors={importErrors}
        setImportErrors={setImportErrors}
        isLoading={isImporting}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message="Esta acción eliminara el servicio seleccionado. Los datos se eliminaran del  sistema"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default React.memo(Servicios);