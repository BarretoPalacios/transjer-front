import React, { useState, useCallback, useEffect } from "react";
import {
  Filter,
  Calendar,
  RefreshCw,
  X,
  CheckCircle,
  Download,
  Loader,
  MapPin,
  DollarSign,
  Clock,
  FileCheck,
  FileX,
  Building2,
  Package,
  Save,
  Fuel,
  Utensils,
  Car,
  Building,
  Package as PackageIcon,
  Archive,
  User,
  CreditCard,
  AlertCircle,
  CarFrontIcon,
  ArrowBigUp,
  ExpandIcon,
  AlignVerticalJustifyCenter,
  Hash,
} from "lucide-react";

import Button from "../../../components/common/Button/Button";
import Pagination from "../../../components/common/Pagination/Pagination";
import Modal from "../../../components/common/Modal/Modal";

import { monitoreoAPI } from "../../../api/endpoints/monitoreo";
import utilsAPI from "../../../api/endpoints/utils";
import { fletesAPI } from "../../../api/endpoints/fletes";
import { Link } from "react-router-dom";

const formatFecha = (fecha) => {
  if (!fecha) return "N/A";
  try {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return fecha;
  }
};

const Rentabilidad = () => {
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [selectedFlete, setSelectedFlete] = useState(null);
  const [fletesProvinciaSinGasto, setFletesProvinciaSinGasto] = useState([]);
  const [gastoFormData, setGastoFormData] = useState({
    combustible: "",
    peaje: "",
    viaticos: "",
    lavado: "",
    cochera: "",
    otros: "",
    estiba: "",
    desestiba: "",
    tercerizado: "",
    abono: "",
  });

  const [clientesList, setClientesList] = useState([]);
  const [placasList, setPlacasList] = useState([]);
  const [proveedoresList, setProveedoresList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [metrics, setMetrics] = useState({
    total_clientes: 0,
    monto_total_acumulado: 0,
    monto_total_bruto: 0,
    total_pendientes: 0,
    facturados: 0,
    no_facturados: 0,
    monto_total_rentabilidad: 0,
    monto_inversion_total: 0,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    cliente_id: "",
    proveedor_id: "",
    placa_id: "",
    mes: "",
  });

  const [errors, setErrors] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    rango_fechas: "",
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const itemsPerPageOptions = [10, 20, 30, 50, 100];

  const meses = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  useEffect(() => {
    cargarClientesList();
    cargarPlacasList();
    cargarProveedoresList();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));
      fetchFletesProvinciaSinGasto(1, pagination.itemsPerPage, filters);
    }, 500);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters.fecha_inicio, filters.fecha_fin, filters.cliente_id,filters.placa_id,filters.proveedor_id]);

  useEffect(() => {
    if (filters.mes) {
      const year = new Date().getFullYear();
      const fechaInicio = `${year}-${filters.mes}-01`;
      const lastDay = new Date(year, parseInt(filters.mes), 0).getDate();
      const fechaFin = `${year}-${filters.mes}-${lastDay}`;

      setFilters((prev) => ({
        ...prev,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }));
    }
  }, [filters.mes]);

  const cargarClientesList = useCallback(async () => {
    try {
      const response = await utilsAPI.getClientesList();
      setClientesList(response || []);
    } catch (err) {
      console.error("Error cargando lista de clientes:", err);
      setError("Error al cargar la lista de clientes");
    }
  }, []);

    const cargarPlacasList = useCallback(async () => {
    try {
      const response = await utilsAPI.getPlacasList();
      setPlacasList(response || []);
    } catch (err) {
      console.error("Error cargando lista de clientes:", err);
      setError("Error al cargar la lista de clientes");
    }
  }, []);

    const cargarProveedoresList = useCallback(async () => {
    try {
      const response = await utilsAPI.getProveedoresList();
      setProveedoresList(response || []);
    } catch (err) {
      console.error("Error cargando lista de clientes:", err);
      setError("Error al cargar la lista de clientes");
    }
  }, []);

  const fetchFletesProvinciaSinGasto = useCallback(
    async (
      page = 1,
      itemsPerPage = pagination.itemsPerPage,
      filtersToUse = filters,
    ) => {
      setIsLoading(true);
      setError(null);

      if (filtersToUse.fecha_inicio && filtersToUse.fecha_fin) {
        if (filtersToUse.fecha_inicio > filtersToUse.fecha_fin) {
          setErrors((prev) => ({
            ...prev,
            rango_fechas: "La fecha de inicio no puede ser mayor a la fecha de fin",
          }));
          setIsLoading(false);
          return;
        }
      }

      try {
        const apiFilters = {
          page: page,
          page_size: itemsPerPage,
          zona: "provincia",
        };

        if (filtersToUse.fecha_inicio) {
          apiFilters.fecha_servicio_desde = filtersToUse.fecha_inicio;
        }

        if (filtersToUse.fecha_fin) {
          apiFilters.fecha_servicio_hasta = filtersToUse.fecha_fin;
        }

        if (filtersToUse.cliente_id && filtersToUse.cliente_id.trim() !== "") {
          apiFilters.cliente = filtersToUse.cliente_id.trim();
        }
        if (filtersToUse.proveedor_id && filtersToUse.proveedor_id.trim() !== "") {
          apiFilters.proveedor = filtersToUse.proveedor_id.trim();
        }
        if (filtersToUse.placa_id && filtersToUse.placa_id.trim() !== "") {
          apiFilters.placa = filtersToUse.placa_id.trim();
        }

        apiFilters.solo_con_inversion = false

        const response = await monitoreoAPI.getFletes(apiFilters);

        const montoBrutoTotal = (response.metrics?.monto_total_acumulado || 0) * 1.18;

        setFletesProvinciaSinGasto(response.items || []);
        setMetrics({
          ...response.metrics,
          monto_total_bruto: montoBrutoTotal,
          monto_total_acumulado: response.metrics?.monto_total_acumulado || 0,
        });

        setPagination({
          currentPage: response.pagination.page,
          itemsPerPage: response.pagination.page_size,
          totalItems: response.pagination.total,
          totalPages: response.pagination.total_pages,
          hasNext: response.pagination.has_next,
          hasPrev: response.pagination.has_prev,
        });
      } catch (err) {
        setError(
          "Error al cargar los fletes de provincia: " +
            (err.message || "Error desconocido"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleGuardarGastos = useCallback(async () => {
    const totalGastos = 
      parseFloat(gastoFormData.combustible || 0) +
      parseFloat(gastoFormData.peaje || 0) +
      parseFloat(gastoFormData.viaticos || 0) +
      parseFloat(gastoFormData.lavado || 0) +
      parseFloat(gastoFormData.cochera || 0) +
      parseFloat(gastoFormData.otros || 0) +
      parseFloat(gastoFormData.estiba || 0) +
      parseFloat(gastoFormData.desestiba || 0) +
      parseFloat(gastoFormData.tercerizado || 0);

    const abono = parseFloat(gastoFormData.abono || 0);
    const montoFlete = selectedFlete?.monto_flete || 0;

    const montoFleteBruto = montoFlete * 1.18;
    
    const rentabilidad = montoFleteBruto - totalGastos;
    const saldo = abono - totalGastos;
    const esRentable = rentabilidad > 0;

    const gastoData = {
      flete_id: selectedFlete.id,
      combustible: parseFloat(gastoFormData.combustible || 0),
      peaje: parseFloat(gastoFormData.peaje || 0),
      viaticos: parseFloat(gastoFormData.viaticos || 0),
      lavado: parseFloat(gastoFormData.lavado || 0),
      cochera: parseFloat(gastoFormData.cochera || 0),
      otros: parseFloat(gastoFormData.otros || 0),
      estiba: parseFloat(gastoFormData.estiba || 0),
      desestiba: parseFloat(gastoFormData.desestiba || 0),
      tercerizado: parseFloat(gastoFormData.tercerizado || 0),
      abono: abono,
      saldo: saldo,
      total_gastos: totalGastos,
      rentabilidad: rentabilidad,
      es_rentable: esRentable,
    };

    try {
      setIsLoading(true);
      const response = await monitoreoAPI.gastoProvincia(gastoData);
      
      if (response.status === "success") {
        setSuccessMessage(
          `Gastos registrados correctamente. Rentabilidad: ${rentabilidad.toFixed(2)} (${esRentable ? "Rentable" : "No rentable"})`
        );
        
        setGastoFormData({
          combustible: "",
          peaje: "",
          viaticos: "",
          lavado: "",
          cochera: "",
          otros: "",
          estiba: "",
          desestiba: "",
          tercerizado: "",
          abono: "",
        });
        setShowGastoForm(false);
        setSelectedFlete(null);
        
        fetchFletesProvinciaSinGasto(
          pagination.currentPage,
          pagination.itemsPerPage,
          filters
        );
        
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err) {
      setError("Error al registrar los gastos: " + err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [gastoFormData, selectedFlete, fetchFletesProvinciaSinGasto, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handleInputChange = (field, value) => {
    setGastoFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "mes") {
      setFilters((prev) => ({
        ...prev,
        fecha_inicio: "",
        fecha_fin: "",
      }));
    }

    if (key === "fecha_inicio" || key === "fecha_fin") {
      setErrors((prev) => ({
        ...prev,
        [key]: "",
        rango_fechas: "",
      }));
    }
  }, []);

  const handleDateChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      mes: "",
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
      rango_fechas: "",
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      fecha_inicio: "",
      fecha_fin: "",
      cliente_id: "",
      proveedor_id:"",
      placa_id:"",
      mes: "",
    });
    setErrors({
      fecha_inicio: "",
      fecha_fin: "",
      rango_fechas: "",
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchFletesProvinciaSinGasto(
      pagination.currentPage,
      pagination.itemsPerPage,
      filters,
    );
  }, [fetchFletesProvinciaSinGasto, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchFletesProvinciaSinGasto(newPage, pagination.itemsPerPage, filters);
    },
    [fetchFletesProvinciaSinGasto, pagination.itemsPerPage, filters],
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchFletesProvinciaSinGasto(1, newItemsPerPage, filters);
    },
    [fetchFletesProvinciaSinGasto, filters],
  );

  const handleAbrirFormularioGastos = (flete) => {
    setSelectedFlete(flete);
    setShowGastoForm(true);
  };

  const handleExportarExcel = useCallback(async () => {
    try {
      setLoadingDownload(true);

      const filtersForAPI = {
        fecha_servicio_desde: filters.fecha_inicio,
        fecha_servicio_hasta: filters.fecha_fin,
        cliente_nombre: filters.cliente_id,
        placa:filters.placa_id,
        proveedor_nombre:filters.proveedor_id,
        zona: "provincia",
      };

      const blob = await fletesAPI.exportAllFletesExcel(filtersForAPI);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `fletes_provincia_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Exportación completada exitosamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Error al exportar: " + err.message);
    } finally {
      setLoadingDownload(false);
    }
  }, [filters]);

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(monto || 0);
  };

  if (isLoading && fletesProvinciaSinGasto.length === 0) {
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
    <div>
      <Modal
        isOpen={showGastoForm}
        onClose={() => {
          setShowGastoForm(false);
          setSelectedFlete(null);
        }}
        title={`Registrar Gastos - Flete #${selectedFlete?.id || ''}`}
        size="xlarge"
      >
        {selectedFlete && (
          <>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Información del Flete</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Servicio</p>
                  <p className="font-medium">{formatFecha(selectedFlete.servicio?.fecha_servicio)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Placa</p>
                  <p className="font-medium">{selectedFlete.servicio?.flota?.placa || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Origen</p>
                  <p className="font-medium">{selectedFlete.servicio?.origen || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destino</p>
                  <p className="font-medium">{selectedFlete.servicio?.destino || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Flete Neto</p>
                  <p className="font-medium text-green-600">{formatearMonto(selectedFlete.monto_flete)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Flete Bruto</p>
                  <p className="font-medium text-blue-600">{formatearMonto(selectedFlete.monto_flete * 1.18)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Fuel className="h-4 w-4 inline mr-2" />
                  Combustible
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.combustible}
                  onChange={(e) => handleInputChange("combustible", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CarFrontIcon className="h-4 w-4 inline mr-2" />
                  Peaje
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.peaje}
                  onChange={(e) => handleInputChange("peaje", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Utensils className="h-4 w-4 inline mr-2" />
                  Viáticos
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.viaticos}
                  onChange={(e) => handleInputChange("viaticos", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="h-4 w-4 inline mr-2" />
                  Lavado
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.lavado}
                  onChange={(e) => handleInputChange("lavado", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  Cochera
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.cochera}
                  onChange={(e) => handleInputChange("cochera", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PackageIcon className="h-4 w-4 inline mr-2" />
                  Otros
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.otros}
                  onChange={(e) => handleInputChange("otros", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Archive className="h-4 w-4 inline mr-2" />
                  Estiba
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.estiba}
                  onChange={(e) => handleInputChange("estiba", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Archive className="h-4 w-4 inline mr-2" />
                  Desestiba
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.desestiba}
                  onChange={(e) => handleInputChange("desestiba", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Cobro Tercerizado
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.tercerizado}
                  onChange={(e) => handleInputChange("tercerizado", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  Abono
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoFormData.abono}
                  onChange={(e) => handleInputChange("abono", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Resumen Financiero</h3>
              <div className="space-y-2">
                {(() => {
                  const totalGastos = 
                    parseFloat(gastoFormData.combustible || 0) +
                    parseFloat(gastoFormData.peaje || 0) +
                    parseFloat(gastoFormData.viaticos || 0) +
                    parseFloat(gastoFormData.lavado || 0) +
                    parseFloat(gastoFormData.cochera || 0) +
                    parseFloat(gastoFormData.otros || 0) +
                    parseFloat(gastoFormData.estiba || 0) +
                    parseFloat(gastoFormData.desestiba || 0) +
                    parseFloat(gastoFormData.tercerizado || 0);
                  
                  const abono = parseFloat(gastoFormData.abono || 0);
                  const montoFlete = selectedFlete?.monto_flete || 0;
                  const montoFleteBruto = montoFlete * 1.18;

                  const rentabilidad = montoFleteBruto - totalGastos;

                  const saldo = abono - totalGastos;
                  const esRentable = rentabilidad > 0;
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Gastos:</span>
                        <span className="font-medium text-red-600">{formatearMonto(totalGastos)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Abono:</span>
                        <span className="font-medium text-orange-600">{formatearMonto(abono)}</span>
                      </div>
                      {/* <div className="flex justify-between">
                        <span className="text-gray-600">Saldo (Abono - Gastos):</span>
                        <span className={`font-medium ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatearMonto(saldo)}
                        </span>
                      </div> */}
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-900">Rentabilidad (Flete - Gastos):</span>
                        <span className={`font-bold ${esRentable ? 'text-green-600' : 'text-red-600'}`}>
                          {formatearMonto(rentabilidad)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`font-medium ${esRentable ? 'text-green-600' : 'text-red-600'}`}>
                          {esRentable ? 'Rentable ✓' : 'No rentable ✗'}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowGastoForm(false);
                  setSelectedFlete(null);
                }}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarGastos}
                variant="primary"
                icon={Save}
                isLoading={isLoading}
              >
                Guardar Gastos
              </Button>
            </div>
          </>
        )}
      </Modal>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <X className="h-5 w-5 mr-2" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px gap-2">
          <Link to="/gerencia/rentabilidad-fletes">
            <div className="py-4 px-1  font-medium text-sm flex items-center gap-2 text-blue-600">
            
            Fletes a Provincia (Sin gastos registrados)
          </div>
          </Link>
          <Link to="/gerencia/rentabilidad-fletes-con-gastos">
            <div className="py-4 px-1  font-medium text-sm flex items-center gap-2 text-gray-600">
              
              Fletes a Provincia (Con gastos registrados)
            </div>
          </Link>
          
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Total Vendido (sin IGV)
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {formatearMonto(metrics.monto_total_acumulado)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.total_fletes} fletes
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="p-1.5 bg-green-100 rounded-md">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
              Total Vendido (con IGV)
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 leading-none">
            {formatearMonto(metrics.monto_total_bruto)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.total_fletes} fletes
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros de Búsqueda
            </h3>
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

            <Button onClick={clearFilters} variant="secondary" size="small">
              Limpiar Filtros
            </Button>

            <Button
              onClick={handleExportarExcel}
              disabled={loadingDownload}
              variant="primary"
              size="small"
            >
              {loadingDownload ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar a Excel
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mes
            </label>
            <select
              value={filters.mes}
              onChange={(e) => handleFilterChange("mes", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Seleccionar mes</option>
              {meses.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Seleccione un mes para rango automático
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Cliente
            </label>
            <select
              value={filters.cliente_id}
              onChange={(e) => handleFilterChange("cliente_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Todos los clientes</option>
              {clientesList.map((cliente) => (
                <option key={cliente} value={cliente}>
                  {cliente}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Placa
            </label>
            <select
              value={filters.placa_id}
              onChange={(e) => handleFilterChange("placa_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Todas las placas</option>
              {placasList.map((placa) => (
                <option key={placa} value={placa}>
                  {placa}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Proveedor
            </label>
            <select
              value={filters.proveedor_id}
              onChange={(e) => handleFilterChange("proveedor_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Todas las clientes</option>
              {proveedoresList.map((proveedores) => (
                <option key={proveedores} value={proveedores}>
                  {proveedores}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => handleDateChange("fecha_inicio", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              max={filters.fecha_fin || new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => handleDateChange("fecha_fin", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              min={filters.fecha_inicio}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {errors.rango_fechas && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">{errors.rango_fechas}</p>
          </div>
        )}
      </div>

      {fletesProvinciaSinGasto.length > 0 && (
        <div className="mb-4 text-sm text-gray-600 text-center">
          Mostrando {fletesProvinciaSinGasto.length} de {pagination.totalItems} registros
          {filters.cliente_id && " · Filtrado por cliente"}
          {filters.placa_id && " · Filtrado por placa"}
          {filters.proveedor_id && " · Filtrado por proveedor"}
          {(filters.fecha_inicio || filters.fecha_fin) &&
            " · Filtrado por rango de fechas"}
          <span className="font-medium ml-2">Provincia SIN gasto</span>
        </div>
      )}

      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Fecha de Servicio
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Placa
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Proveedor
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Cliente
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Origen
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Destino
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Flete Neto
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-300">
                  Flete Bruto
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {fletesProvinciaSinGasto.map((flete) => (
                <tr
                  key={flete.id}
                  className="border-b border-gray-200 hover:bg-blue-50"
                >
                  <td className="px-4 py-3 border-r border-gray-200 whitespace-nowrap">
                    <div className="text-gray-900">
                      {formatFecha(flete?.servicio?.fecha_servicio)}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {flete.servicio?.flota?.placa || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      
                      {flete.servicio?.proveedor?.razon_social || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {flete.servicio?.cliente?.nombre || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-900">
                        {flete.servicio?.origen?.split(",")[0] || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-900">
                        {flete.servicio?.destino?.split(",")[0] || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {formatearMonto(flete.monto_flete)}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="font-medium text-gray-900">
                      {formatearMonto(flete.monto_flete * 1.18)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      onClick={() => handleAbrirFormularioGastos(flete)}
                      size="small"
                      variant="primary"
                      icon={Save}
                    >
                      Registrar Gastos
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {fletesProvinciaSinGasto.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron registros
            </h3>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some((f) => f && f.trim() !== "")
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay fletes a provincia sin gastos registrados"}
            </p>
            <Button onClick={clearFilters} size="small">
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {fletesProvinciaSinGasto.length > 0 && (
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
              pagination.totalItems,
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Rentabilidad;