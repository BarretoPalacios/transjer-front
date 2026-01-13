import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MapPin,
  Building,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Check,
  AlertCircle,
  Phone,
  Clock,
  Truck,
  Package,
  Home,
  Warehouse,
  Navigation,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  Map,
  Target,
  Users,
  Shield,
  TrendingUp,
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Input from "../../../components/common/Input/Input";
import SearchBar from "../../../components/common/SearchBar/SearchBar";
import StatsCard from "../../../components/common/StatsCard/StatsCard";
import Pagination from "../../../components/common/Pagination/Pagination";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";

// API
import { lugaresAPI } from "../../../api/endpoints/lugares";

// Utils
import { getEstadoColor, getTipoLugarColor } from "../../../utils/lugarUtils";

// Componentes específicos
import LugarCard from "../../../components/lugares/LugarCard";
import LugarForm from "../../../components/lugares/LugarForm";
import ImportModal from "../../../components/lugares/ImportModal";

const Lugares = () => {
  const [lugares, setLugares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo_lugar: "todos",
    estado: "todos",
    departamento: "todos",
  });
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLugares, setSelectedLugares] = useState([]);
  const [viewMode, setViewMode] = useState("list");

  // Estados para modales
  const [modalState, setModalState] = useState({
    show: false,
    mode: "create",
    data: null,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState("");
  const [importErrors, setImportErrors] = useState([]);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    principales: 0,
    porTipo: {},
    porDepartamento: {},
  });

  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  // Configuración de paginación
  const lugaresPorPagina = 8;

  // Cargar lugares desde el backend
  const fetchLugares = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filtersForAPI = {};
      if (filters.tipo_lugar !== "todos")
        filtersForAPI.tipo_lugar = filters.tipo_lugar;
      if (filters.estado !== "todos") filtersForAPI.estado = filters.estado;
      if (filters.departamento !== "todos")
        filtersForAPI.departamento = filters.departamento;

      const data = await lugaresAPI.getAllLugares(filtersForAPI);
      setLugares(data);

      // Calcular estadísticas locales
      const activos = data.filter((l) => l.estado === "activo").length;
      const principales = data.filter((l) => l.es_principal).length;

      const porTipo = data.reduce((acc, lugar) => {
        acc[lugar.tipo_lugar] = (acc[lugar.tipo_lugar] || 0) + 1;
        return acc;
      }, {});

      const porDepartamento = data.reduce((acc, lugar) => {
        acc[lugar.departamento] = (acc[lugar.departamento] || 0) + 1;
        return acc;
      }, {});

      setEstadisticas({
        total: data.length,
        activos,
        principales,
        porTipo,
        porDepartamento,
      });
    } catch (err) {
      setError("Error al cargar los lugares: " + err.message);
      console.error("Error fetching lugares:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Cargar estadísticas desde el backend (opcional)
  const fetchEstadisticas = useCallback(async () => {
    try {
      const stats = await lugaresAPI.getEstadisticas();
      setEstadisticas((prev) => ({
        ...prev,
        ...stats,
      }));
    } catch (err) {
      console.error("Error fetching estadísticas:", err);
    }
  }, []);

  // Efecto inicial
  useEffect(() => {
    fetchLugares();
    fetchEstadisticas();
  }, [fetchLugares, fetchEstadisticas]);

  // Filtrar lugares localmente por búsqueda
  const filteredLugares = useMemo(() => {
    if (!searchTerm) return lugares;

    const searchLower = searchTerm.toLowerCase();
    return lugares.filter(
      (lugar) =>
        lugar.codigo_lugar.toLowerCase().includes(searchLower) ||
        lugar.nombre.toLowerCase().includes(searchLower) ||
        lugar.direccion.toLowerCase().includes(searchLower) ||
        lugar.distrito.toLowerCase().includes(searchLower) ||
        lugar.contacto?.toLowerCase().includes(searchLower)
    );
  }, [lugares, searchTerm]);

  // Calcular paginación
  const totalPaginas = Math.ceil(filteredLugares.length / lugaresPorPagina);
  const indexOfLastLugar = currentPage * lugaresPorPagina;
  const indexOfFirstLugar = indexOfLastLugar - lugaresPorPagina;
  const currentLugares = filteredLugares.slice(
    indexOfFirstLugar,
    indexOfLastLugar
  );

  // Obtener tipos únicos para filtros
  const tiposUnicos = useMemo(
    () => [...new Set(lugares.map((l) => l.tipo_lugar).filter(Boolean))],
    [lugares]
  );

  const departamentosUnicos = useMemo(
    () => [...new Set(lugares.map((l) => l.departamento).filter(Boolean))],
    [lugares]
  );

  // Handlers optimizados
  const handleCreate = useCallback(() => {
    setModalState({
      show: true,
      mode: "create",
      data: null,
    });
    setError(null);
  }, []);

  const handleEdit = useCallback((lugar) => {
    setModalState({
      show: true,
      mode: "edit",
      data: lugar,
    });
    setError(null);
  }, []);

  const handleView = useCallback((lugar) => {
    setModalState({
      show: true,
      mode: "view",
      data: lugar,
    });
  }, []);

  const handleDelete = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) {
      console.log("no hay xd")
      return
    };

    setIsDeleting(true);
    try {
      console.log("holaaa",deleteId)
      await lugaresAPI.deleteLugar(deleteId);
      // Actualizar lista localmente
      setLugares((prev) => prev.filter((l) => l.id !== deleteId));
      setShowDeleteConfirm(false);
      setDeleteId(null);
      // Recargar estadísticas
      fetchEstadisticas();
    } catch (err) {
      setError("Error al eliminar el lugar: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId, fetchEstadisticas]);

  const handleSaveLugar = useCallback(
    async (formData) => {
      setIsSaving(true);
      setError(null);

      try {
        if (modalState.mode === "create") {
          // Verificar si el código ya existe
          const existeCodigo = lugares.some(
            (l) => l.codigo_lugar === formData.codigo_lugar
          );
          if (existeCodigo) {
            setError("El código de lugar ya existe");
            setIsSaving(false);
            return;
          }

          const nuevoLugar = await lugaresAPI.createLugar(formData);
          setLugares((prev) => [...prev, nuevoLugar]);
        } else if (modalState.mode === "edit") {

          const lugarActualizado = await lugaresAPI.updateLugar(
            modalState.data.id,
            formData
          );
          setLugares((prev) =>
            prev.map((l) =>
              l.id === modalState.data.id ? lugarActualizado : l
            )
          );
        }

        setModalState({ show: false, mode: "create", data: null });
        // Recargar estadísticas
        fetchEstadisticas();
      } catch (err) {
        setError("Error al guardar el lugar: " + err.message);
      } finally {
        setIsSaving(false);
      }
    },
    [modalState, lugares, fetchEstadisticas]
  );

  const handleExport = useCallback(async () => {
    try {
      const filtersForAPI = {};
      if (filters.tipo_lugar !== "todos")
        filtersForAPI.tipo_lugar = filters.tipo_lugar;
      if (filters.estado !== "todos") filtersForAPI.estado = filters.estado;
      if (filters.departamento !== "todos")
        filtersForAPI.departamento = filters.departamento;

      const blob = await lugaresAPI.exportAllLugaresExcel(filtersForAPI);
      lugaresAPI.downloadExcel(
        blob,
        `lugares_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (err) {
      setError("Error al exportar: " + err.message);
    }
  }, [filters]);

  const handleImport = useCallback(
    async (file) => {
      if (!file) {
        setImportErrors(["Por favor, selecciona un archivo para importar"]);
        return;
      }

      setIsImporting(true);
      setImportErrors([]);

      try {
        // Usar la API del backend para importar el archivo Excel
        const formData = new FormData();
        formData.append("file", file);

        // Llamar al endpoint de importación del backend
        const response = await lugaresAPI.importLugaresExcel(file);

        // Si la importación fue exitosa, actualizar la lista
        if (response.success) {
          const lugaresImportados = response.data;
          setLugares((prev) => [...prev, ...lugaresImportados]);
          setShowImportModal(false);
          setSelectedFile(null);

          // Mostrar mensaje de éxito
          alert(
            `Se importaron ${lugaresImportados.length} lugares exitosamente`
          );

          // Recargar estadísticas
          fetchEstadisticas();
        } else {
          setImportErrors(response.errors || ["Error en la importación"]);
        }
      } catch (err) {
        setImportErrors(["Error al importar el archivo: " + err.message]);
      } finally {
        setIsImporting(false);
      }
    },
    [fetchEstadisticas]
  );

  const downloadTemplate = useCallback(async () => {
    try {
      // Usar la API para descargar plantilla del backend si está disponible
      const response = await fetch("/api/lugares/template"); // Ajusta la ruta según tu backend
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla_lugares.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Si no hay endpoint en el backend, crear una plantilla básica
        const templateData = [
          [
            "codigo_lugar",
            "nombre",
            "tipo_lugar",
            "direccion",
            "distrito",
            "provincia",
            "departamento",
            "contacto",
            "telefono",
            "horario_atencion",
            "capacidad_estacionamiento",
            "servicios_disponibles",
            "estado",
            "es_principal",
            "observaciones",
          ],
          [
            "LUG-001",
            "Planta de Arena Lima Norte",
            "origen",
            "Km 22.5 Panamericana Norte",
            "Carabayllo",
            "Lima",
            "Lima",
            "Sr. Rodríguez",
            "987654321",
            "06:00 - 18:00",
            "10",
            "Carga;Almacenamiento",
            "activo",
            "TRUE",
            "Lugar principal para carga de materiales",
          ],
          [
            "LUG-002",
            "Almacén Central",
            "almacen",
            "Av. Industrial 123",
            "San Martín de Porres",
            "Lima",
            "Lima",
            "Ing. Pérez",
            "987654322",
            "08:00 - 20:00",
            "15",
            "Almacenamiento;Seguridad",
            "activo",
            "FALSE",
            "Almacén con seguridad 24/7",
          ],
        ];

        let csvContent = templateData
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla_lugares.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error al descargar plantilla:", err);
      // Fallback: mostrar mensaje y descargar plantilla básica
      alert("Descargando plantilla básica...");
      const templateData = [
        [
          "codigo_lugar",
          "nombre",
          "tipo_lugar",
          "direccion",
          "distrito",
          "provincia",
          "departamento",
          "contacto",
          "telefono",
          "horario_atencion",
          "capacidad_estacionamiento",
          "servicios_disponibles",
          "estado",
          "es_principal",
          "observaciones",
        ],
      ];

      let csvContent = templateData
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla_lugares.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }, []);

  const toggleLugarSelection = useCallback((id) => {
    setSelectedLugares((prev) =>
      prev.includes(id)
        ? prev.filter((lugarId) => lugarId !== id)
        : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedLugares.length === currentLugares.length) {
      setSelectedLugares([]);
    } else {
      setSelectedLugares(currentLugares.map((l) => l.id));
    }
  }, [currentLugares, selectedLugares.length]);

  const clearFilters = useCallback(() => {
    setFilters({ tipo_lugar: "todos", estado: "todos", departamento: "todos" });
    setSearchTerm("");
  }, []);

  const getTipoLugarIcon = (tipo) => {
    switch (tipo) {
      case "origen":
        return Truck;
      case "destino":
        return Package;
      case "almacen":
        return Warehouse;
      case "taller":
        return Building;
      case "oficina":
        return Home;
      default:
        return MapPin;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
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
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Lugares
          </h1>
          <p className="text-gray-600 mt-1">
            Administra orígenes, destinos, almacenes y oficinas
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button onClick={handleCreate} icon={Plus}>
            Nuevo Lugar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Lugares"
          value={estadisticas.total}
          icon={MapPin}
          color="blue"
          subtitle={`${estadisticas.principales} principales`}
          subtitleColor="green"
        />

        <StatsCard
          title="Lugares Activos"
          value={estadisticas.activos}
          icon={Check}
          color="green"
          subtitle={`${(
            (estadisticas.activos / estadisticas.total) *
            100
          ).toFixed(1)}% del total`}
        />

        <StatsCard
          title="Tipos de Lugares"
          value={Object.keys(estadisticas.porTipo).length}
          icon={Building}
          color="purple"
          subtitle="Variedad de ubicaciones"
          subtitleColor="blue"
        />

        <StatsCard
          title="Departamentos"
          value={Object.keys(estadisticas.porDepartamento).length}
          icon={Map}
          color="yellow"
          subtitle="Cobertura nacional"
          subtitleColor="green"
          subtitleIcon={TrendingUp}
        />
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por código, nombre, dirección..."
          />

          <div className="flex items-center space-x-3">
            {/* Controles de vista */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "primary" : "secondary"}
                size="small"
                className="rounded-none"
                icon={BarChart3}
              />
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "primary" : "secondary"}
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
              {Object.values(filters).some((f) => f !== "todos") && (
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

            <Button onClick={handleExport} variant="secondary" icon={Download}>
              Exportar
            </Button>

            <Button
              onClick={fetchLugares}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Lugar
                </label>
                <select
                  value={filters.tipo_lugar}
                  onChange={(e) =>
                    setFilters({ ...filters, tipo_lugar: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="origen">Origen</option>
                  <option value="destino">Destino</option>
                  <option value="almacen">Almacén</option>
                  <option value="taller">Taller</option>
                  <option value="oficina">Oficina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) =>
                    setFilters({ ...filters, estado: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <select
                  value={filters.departamento}
                  onChange={(e) =>
                    setFilters({ ...filters, departamento: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos los departamentos</option>
                  {departamentosUnicos.map((depto) => (
                    <option key={depto} value={depto}>
                      {depto}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={clearFilters} variant="secondary">
                Limpiar filtros
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentLugares.map((lugar) => (
            <LugarCard
              key={lugar.id}
              lugar={lugar}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getEstadoColor={getEstadoColor}
              getTipoLugarColor={getTipoLugarColor}
              getTipoLugarIcon={getTipoLugarIcon}
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
                      checked={
                        selectedLugares.length === currentLugares.length &&
                        currentLugares.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th> */}
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Lugar
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Ubicación
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Contacto
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Tipo
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentLugares.map((lugar) => {
                  const TipoIcon = getTipoLugarIcon(lugar.tipo_lugar);
                  return (
                    <tr key={lugar.id} className="hover:bg-gray-50">
                      {/* <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedLugares.includes(lugar.id)}
                          onChange={() => toggleLugarSelection(lugar.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td> */}
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-50 mr-3">
                            <TipoIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {lugar.nombre}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lugar.codigo_lugar}
                            </div>
                            {lugar.es_principal && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                Principal
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">
                          {lugar.direccion}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lugar.distrito}, {lugar.provincia}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lugar.departamento}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">
                          {lugar.contacto || "No especificado"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lugar.telefono || "No especificado"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lugar.horario_atencion || "Sin horario"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoLugarColor(
                            lugar.tipo_lugar
                          )}`}
                        >
                          <TipoIcon className="h-3 w-3 mr-1" />
                          {lugar.tipo_lugar}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
                            lugar.estado
                          )}`}
                        >
                          {lugar.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleView(lugar)}
                            variant="ghost"
                            size="small"
                            icon={Eye}
                          />
                          <Button
                            onClick={() => handleEdit(lugar)}
                            variant="ghost"
                            size="small"
                            icon={Edit}
                          />
                          <Button
                            onClick={() => handleDelete(lugar.id)}
                            variant="ghost"
                            size="small"
                            icon={Trash2}
                            className="text-red-600 hover:text-red-700"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {filteredLugares.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPaginas}
          totalItems={filteredLugares.length}
          itemsPerPage={lugaresPorPagina}
          onPageChange={setCurrentPage}
          startIndex={indexOfFirstLugar}
          endIndex={Math.min(indexOfLastLugar, filteredLugares.length)}
        />
      )}

      {/* Sin resultados */}
      {filteredLugares.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron lugares
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || Object.values(filters).some((f) => f !== "todos")
              ? "Intenta con otros términos de búsqueda o ajusta los filtros"
              : "No hay lugares registrados en el sistema"}
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={clearFilters}>Limpiar búsqueda</Button>
            <Button onClick={handleCreate} variant="secondary">
              Registrar primer lugar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de CRUD de lugar */}
      <Modal
        isOpen={modalState.show}
        onClose={() =>
          setModalState({ show: false, mode: "create", data: null })
        }
        title={
          modalState.mode === "create"
            ? "Nuevo Lugar"
            : modalState.mode === "edit"
            ? "Editar Lugar"
            : "Detalles del Lugar"
        }
        size="large"
      >
        <LugarForm
          initialData={modalState.data}
          onSubmit={handleSaveLugar}
          onCancel={() =>
            setModalState({ show: false, mode: "create", data: null })
          }
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
        importData={importData}
        setImportData={setImportData}
        importErrors={importErrors}
        setImportErrors={setImportErrors}
        onDownloadTemplate={downloadTemplate}
        onAddImportedLugares={(newLugares) => {
          setLugares((prev) => [...prev, ...newLugares]);
        }}
        isLoading={isImporting}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message="Esta acción eliminará permanentemente el lugar seleccionado. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default React.memo(Lugares);
