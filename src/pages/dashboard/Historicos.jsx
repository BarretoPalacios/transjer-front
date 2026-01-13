// components/historicos/Historicos.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Filter,
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  AlertCircle,
  BarChart3,
  FileText,
  Tag,
} from "lucide-react";

// Componentes comunes
import Button from "../../components/common/Button/Button";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import StatsCard from "../../components/common/StatsCard/StatsCard";
import Pagination from "../../components/common/Pagination/Pagination";

// API
import { historicoAPI } from "../../api/endpoints/historicos";

// Utils
import {
  getTipoColor,
  getEstadoFinalColor,
  formatFecha,
  calcularTiempoTranscurrido,
  formatPeriodo,
  calcularEstadisticasHistoricos,
  isValidPeriodo,
} from "../../utils/historicoUtils";

const Historicos = () => {
  const [historicos, setHistoricos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo: "todos",
    periodo: "todos",
    estado_final: "todos",
    usuario: "todos",
  });
  const [fechaFiltros, setFechaFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    periodo_inicio: "",
    periodo_fin: "",
  });
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    completados: 0,
    cancelados: 0,
    porcentajeCompletados: 0,
    porcentajeCancelados: 0,
  });

  // Estados para operaciones
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    sort_by: "fecha_registro",
    sort_order: -1,
  });

  // Configuración de paginación
  const historicosPorPagina = 15;
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    skip: 0,
    limit: 100,
  });

  // Obtener periodos disponibles para filtros
  const periodosDisponibles = React.useMemo(() => {
    const periodos = [...new Set(historicos.map(h => h.periodo).filter(Boolean))];
    return ['todos', ...periodos.sort().reverse()];
  }, [historicos]);

  // Obtener usuarios disponibles para filtros
  const usuariosDisponibles = React.useMemo(() => {
    const usuarios = [...new Set(historicos.map(h => h.usuario).filter(Boolean))];
    return ['todos', ...usuarios];
  }, [historicos]);

  // Cargar históricos desde el backend
  const fetchHistoricos = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        skip: (page - 1) * historicosPorPagina,
        limit: historicosPorPagina,
        sort_by: sortConfig.sort_by,
        sort_order: sortConfig.sort_order,
      };

      // Aplicar filtros de texto exacto
      if (filters.tipo !== "todos") params.tipo = filters.tipo;
      if (filters.periodo !== "todos") params.periodo = filters.periodo;
      if (filters.estado_final !== "todos") params.estado_final = filters.estado_final;
      if (filters.usuario !== "todos") params.usuario = filters.usuario;

      // Aplicar búsqueda
      if (searchTerm) {
        params.codigo_servicio = searchTerm;
        params.servicio_id = searchTerm;
      }

      // Aplicar filtros de fecha
      if (fechaFiltros.fecha_inicio) params.fecha_inicio = fechaFiltros.fecha_inicio;
      if (fechaFiltros.fecha_fin) params.fecha_fin = fechaFiltros.fecha_fin;
      if (fechaFiltros.periodo_inicio) params.periodo_inicio = fechaFiltros.periodo_inicio;
      if (fechaFiltros.periodo_fin) params.periodo_fin = fechaFiltros.periodo_fin;

      const data = await historicoAPI.getAllHistoricos(params);
      
      setHistoricos(data.data || []);
      setPaginationInfo({
        total: data.total || 0,
        skip: data.skip || 0,
        limit: data.limit || 100,
      });

      // Calcular estadísticas locales
      const stats = calcularEstadisticasHistoricos(data.data || []);
      setEstadisticas(stats);

      // Resetear filas expandidas al cambiar página o filtros
      setExpandedRows({});

    } catch (err) {
      setError("Error al cargar los históricos: " + (err.response?.data?.detail || err.message));
      console.error("Error fetching históricos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm, fechaFiltros, sortConfig]);

  // Manejar expandir/contraer fila
  const toggleRowExpansion = useCallback((historicoId) => {
    setExpandedRows(prev => ({
      ...prev,
      [historicoId]: !prev[historicoId]
    }));
  }, []);

  // Efecto inicial
  useEffect(() => {
    fetchHistoricos(currentPage);
  }, [fetchHistoricos, currentPage]);

  // Handlers optimizados
  const handleSort = useCallback((field) => {
    setSortConfig(prev => ({
      sort_by: field,
      sort_order: prev.sort_by === field ? -prev.sort_order : -1,
    }));
    fetchHistoricos(1); // Recargar con nuevo ordenamiento
  }, [fetchHistoricos]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const params = {};
      
      // Aplicar filtros
      if (filters.tipo !== "todos") params.tipo = filters.tipo;
      if (filters.periodo !== "todos") params.periodo = filters.periodo;
      if (filters.estado_final !== "todos") params.estado_final = filters.estado_final;
      if (filters.usuario !== "todos") params.usuario = filters.usuario;
      
      // Aplicar filtros de fecha
      if (fechaFiltros.fecha_inicio) params.fecha_inicio = fechaFiltros.fecha_inicio;
      if (fechaFiltros.fecha_fin) params.fecha_fin = fechaFiltros.fecha_fin;
      if (fechaFiltros.periodo_inicio) params.periodo_inicio = fechaFiltros.periodo_inicio;
      if (fechaFiltros.periodo_fin) params.periodo_fin = fechaFiltros.periodo_fin;

      const blob = await historicoAPI.exportAllHistoricosExcel(params);
      historicoAPI.downloadExcel(
        blob,
        `historicos_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (err) {
      setError("Error al exportar: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsExporting(false);
    }
  }, [filters, fechaFiltros]);

  const clearFilters = useCallback(() => {
    setFilters({
      tipo: "todos",
      periodo: "todos",
      estado_final: "todos",
      usuario: "todos",
    });
    setFechaFiltros({
      fecha_inicio: "",
      fecha_fin: "",
      periodo_inicio: "",
      periodo_fin: "",
    });
    setSearchTerm("");
    fetchHistoricos(1);
  }, [fetchHistoricos]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(paginationInfo.total / historicosPorPagina);

  // Componente para renderizar fila expandida
  const renderDetallesExpandidos = (historico) => {
    if (!expandedRows[historico.id]) return null;

    return (
      <tr className="bg-gray-50">
        <td colSpan="8" className="p-0">
          <div className="p-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Información del servicio */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Información del Servicio
                </h4>
                <div>
                  <span className="text-xs text-gray-500">Código:</span>
                  <p className="font-medium text-gray-900">{historico.codigo_servicio || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">ID del Servicio:</span>
                  <p className="font-medium text-gray-900 text-sm truncate">{historico.servicio_id || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Tipo:</span>
                  <p className="font-medium text-gray-900">{historico.tipo || 'N/A'}</p>
                </div>
              </div>

              {/* Fechas y tiempos */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Fechas y Tiempos
                </h4>
                <div>
                  <span className="text-xs text-gray-500">Fecha Inicio:</span>
                  <p className="font-medium text-gray-900">
                    {formatFecha(historico.fecha_registro, 'datetime')}
                  </p>
                </div>
                {/* <div>
                  <span className="text-xs text-gray-500">Fecha Fin:</span>
                  <p className="font-medium text-gray-900">
                    {formatFecha(historico.fecha_fin_servicio, 'datetime')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Duración Total:</span>
                  <p className="font-medium text-gray-900">
                    {calcularTiempoTranscurrido(
                      historico.fecha_inicio_servicio,
                      historico.fecha_fin_servicio
                    )}
                  </p>
                </div> */}
              </div>

              {/* Información adicional */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Información Adicional
                </h4>
                <div>
                  <span className="text-xs text-gray-500">Período:</span>
                  <p className="font-medium text-gray-900">{formatPeriodo(historico.periodo)}</p>
                </div>
                {historico.justificacion && (
                  <div>
                    <span className="text-xs text-gray-500">Justificación:</span>
                    <p className="text-sm text-gray-700 mt-1 bg-gray-100 p-3 rounded-lg">
                      {historico.justificacion}
                    </p>
                  </div>
                )}
                {historico.observaciones && (
                  <div>
                    <span className="text-xs text-gray-500">Observaciones:</span>
                    <p className="text-sm text-gray-700 mt-1 bg-gray-100 p-3 rounded-lg">
                      {historico.observaciones}
                    </p>
                  </div>
                )}
                {historico.metodo_cierre && (
                  <div>
                    <span className="text-xs text-gray-500">Método de Cierre:</span>
                    <p className="font-medium text-gray-900">{historico.metodo_cierre}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadatos adicionales */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-500">ID Histórico:</span>
                  <p className="font-medium text-gray-900 truncate">{historico.id}</p>
                </div>
                {/* <div>
                  <span className="text-xs text-gray-500">Usuario:</span>
                  <p className="font-medium text-gray-900">{historico.usuario || 'Sistema'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Rol Usuario:</span>
                  <p className="font-medium text-gray-900">{historico.rol_usuario || '-'}</p>
                </div> */}
                <div>
                  <span className="text-xs text-gray-500">Fecha Registro:</span>
                  <p className="font-medium text-gray-900">
                    {formatFecha(historico.fecha_registro, 'datetime')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Histórico de Servicios
          </h1>
          <p className="text-gray-600 mt-1">
            Registro de servicios completados y cancelados
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            onClick={handleExport}
            variant="secondary"
            icon={Download}
            isLoading={isExporting}
          >
            Exportar Excel
          </Button>
          <Button
            onClick={() => fetchHistoricos(currentPage)}
            variant="secondary"
            icon={RefreshCw}
            isLoading={isLoading}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Registros"
          value={estadisticas.total}
          icon={History}
          color="blue"
          subtitle={`${paginationInfo.total} en total`}
        />

        <StatsCard
          title="Completados"
          value={estadisticas.completados}
          icon={CheckCircle}
          color="green"
          subtitle={`${estadisticas.porcentajeCompletados}%`}
          subtitleColor="green"
        />

        <StatsCard
          title="Cancelados"
          value={estadisticas.cancelados}
          icon={XCircle}
          color="red"
          subtitle={`${estadisticas.porcentajeCancelados}%`}
          subtitleColor="red"
        />

        <StatsCard
          title="Página Actual"
          value={historicos.length}
          icon={BarChart3}
          color="purple"
          subtitle={`Página ${currentPage} de ${totalPaginas}`}
        />
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por código o ID de servicio..."
            onSearch={() => fetchHistoricos(1)}
          />

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              icon={Filter}
            >
              Filtros
              {Object.values(filters).some((f) => f !== "todos") && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Activos
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={filters.tipo}
                  onChange={(e) =>
                    setFilters({ ...filters, tipo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periodo
                </label>
                <select
                  value={filters.periodo}
                  onChange={(e) =>
                    setFilters({ ...filters, periodo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los periodos</option>
                  {periodosDisponibles.slice(1).map((periodo) => (
                    <option key={periodo} value={periodo}>
                      {formatPeriodo(periodo)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Final
                </label>
                <select
                  value={filters.estado_final}
                  onChange={(e) =>
                    setFilters({ ...filters, estado_final: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los estados</option>
             
                  <option value="Cancelado">Cancelado</option>
           
                  <option value="Completados">Completados</option>
                </select>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <select
                  value={filters.usuario}
                  onChange={(e) =>
                    setFilters({ ...filters, usuario: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los usuarios</option>
                  {usuariosDisponibles.slice(1).map((usuario) => (
                    <option key={usuario} value={usuario}>
                      {usuario}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>

            {/* Filtros de fecha avanzados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={fechaFiltros.fecha_inicio}
                    onChange={(e) =>
                      setFechaFiltros({...fechaFiltros, fecha_inicio: e.target.value})
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={fechaFiltros.fecha_fin}
                    onChange={(e) =>
                      setFechaFiltros({...fechaFiltros, fecha_fin: e.target.value})
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periodo Inicio (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    value={fechaFiltros.periodo_inicio}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || isValidPeriodo(value)) {
                        setFechaFiltros({...fechaFiltros, periodo_inicio: value});
                      }
                    }}
                    placeholder="2024-01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periodo Fin (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    value={fechaFiltros.periodo_fin}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || isValidPeriodo(value)) {
                        setFechaFiltros({...fechaFiltros, periodo_fin: value});
                      }
                    }}
                    placeholder="2024-12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div> */}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={clearFilters} variant="secondary">
                Limpiar filtros
              </Button>
              <Button onClick={() => fetchHistoricos(1)}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de históricos */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th 
                  className="py-4 px-6 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('fecha_registro')}
                >
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Fecha Registro
                    {sortConfig.sort_by === 'fecha_registro' && (
                      <span className="ml-1 text-gray-400">
                        {sortConfig.sort_order === 1 ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
                <th 
                  className="py-4 px-6 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('tipo')}
                >
                  Tipo
                  {sortConfig.sort_by === 'tipo' && (
                    <span className="ml-1 text-gray-400">
                      {sortConfig.sort_order === 1 ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                  Servicio
                </th>
                {/* <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                  Periodo
                </th> */}
                <th 
                  className="py-4 px-6 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('estado_final')}
                >
                  Estado Final
                  {sortConfig.sort_by === 'estado_final' && (
                    <span className="ml-1 text-gray-400">
                      {sortConfig.sort_order === 1 ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                {/* <th 
                  className="py-4 px-6 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('usuario')}
                >
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Usuario
                    {sortConfig.sort_by === 'usuario' && (
                      <span className="ml-1 text-gray-400">
                        {sortConfig.sort_order === 1 ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th> */}
                {/* <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Duración
                  </span>
                </th> */}
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {historicos.map((historico) => {
                const isExpanded = expandedRows[historico.id];
                
                return (
                  <React.Fragment key={historico.id}>
                    {/* Fila principal */}
                    <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {formatFecha(historico.fecha_registro, 'short')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFecha(historico.fecha_registro, 'time')}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTipoColor(
                            historico.tipo
                          )}`}
                        >
                          {historico.tipo === 'completado' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {historico.tipo}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {historico.codigo_servicio || 'Sin código'}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]">
                          ID: {historico.servicio_id?.substring(0, 10)}...
                        </div>
                      </td>

                      {/* <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {formatPeriodo(historico.periodo)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {historico.periodo}
                        </div>
                      </td> */}

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoFinalColor(
                            historico.estado_final
                          )}`}
                        >
                          {historico.estado_final}
                        </span>
                      </td>

                      {/* <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {historico.usuario || 'Sistema'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {historico.rol_usuario || '-'}
                        </div>
                      </td> */}

                      {/* <td className="py-4 px-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {calcularTiempoTranscurrido(
                            historico.fecha_inicio_servicio,
                            historico.fecha_fin_servicio
                          )}
                        </div>
                      </td> */}

                      <td className="py-4 px-6">
                        <Button
                          onClick={() => toggleRowExpansion(historico.id)}
                          variant="ghost"
                          size="small"
                          icon={isExpanded ? ChevronUp : ChevronDown}
                          className={isExpanded ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : ""}
                        >
                          {isExpanded ? 'Ocultar' : 'Detalles'}
                        </Button>
                      </td>
                    </tr>

                    {/* Fila expandida con detalles */}
                    {renderDetallesExpandidos(historico)}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {paginationInfo.total > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPaginas}
          totalItems={paginationInfo.total}
          itemsPerPage={historicosPorPagina}
          onPageChange={handlePageChange}
          startIndex={(currentPage - 1) * historicosPorPagina}
          endIndex={Math.min(
            currentPage * historicosPorPagina,
            paginationInfo.total
          )}
        />
      )}

      {/* Sin resultados */}
      {historicos.length === 0 && !isLoading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron históricos
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || Object.values(filters).some((f) => f !== "todos") || 
             Object.values(fechaFiltros).some(f => f)
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay registros históricos en el sistema"}
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={clearFilters}>Limpiar búsqueda</Button>
            <Button
              onClick={() => fetchHistoricos(1)}
              variant="secondary"
              icon={RefreshCw}
            >
              Recargar
            </Button>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historicos;