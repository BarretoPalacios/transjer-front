import React, { useState, useEffect } from "react";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";
import { Save, X, Plus, Trash2, AlertTriangle, ChevronDown, User, IdCard } from "lucide-react";
import { flotaAPI } from "../../api/endpoints/flotas";

// Data
const tiposVehiculo = [
  { value: "Volquete", label: "Volquete" },
  { value: "Furgón", label: "Furgón" },
  { value: "Plataforma", label: "Plataforma" },
  { value: "Tanque", label: "Tanque" },
  { value: "Cisterna", label: "Cisterna" },
  { value: "Cama baja", label: "Cama baja" },
  { value: "Camión ligero", label: "Camión ligero" },
  { value: "Camión pesado", label: "Camión pesado" },
  { value: "Trailer", label: "Trailer" },
  { value: "Grúa", label: "Grúa" },
  { value: "Otros", label: "Otros" },
];

// Marcas comunes de vehículos
const marcasVehiculo = [
  "Volvo",
  "Mercedes-Benz",
  "Scania",
  "MAN",
  "Iveco",
  "DAF",
  "Renault Trucks",
  "Ford",
  "Chevrolet",
  "Toyota",
  "Nissan",
  "Hino",
  "Isuzu",
  "Mitsubishi",
  "Kenworth",
  "Peterbilt",
  "Mack",
  "Freightliner",
  "International",
  "Otro"
];

const tiposCombustible = [
  { value: "Diesel", label: "Diesel" },
  { value: "Gasolina", label: "Gasolina" },
  { value: "GNV", label: "Gas Natural Vehicular (GNV)" },
  { value: "Eléctrico", label: "Eléctrico" },
  { value: "Híbrido", label: "Híbrido" },
  { value: "GLP", label: "Gas Licuado de Petróleo (GLP)" },
];

const estadosFlota = [
  { value: true, label: "Activo" },
  { value: false, label: "Inactivo" },
];

const FlotaForm = ({
  initialData,
  onSubmit,
  onCancel,
  mode = "create",
  isLoading = false,
  error = null,
  ...props
}) => {
  const [formData, setFormData] = useState({
    codigo_flota: "",
    placa: "",
    marca: "",
    modelo: "",
    anio: new Date().getFullYear(),
    tn: 0,
    m3: 0,
    tipo_vehiculo: "Volquete",
    tipo_combustible: "Diesel",
    // NUEVOS CAMPOS: Datos del conductor
    nombre_conductor: "",
    numero_licencia: "",
    // Campos existentes
    revision_tecnica_emision: "",
    revision_tecnica_vencimiento: "",
    soat_vigencia_inicio: "",
    soat_vigencia_fin: "",
    mtc_numero: "",
    extintor_vencimiento: "",
    cantidad_parihuelas: 0,
    dias_alerta_revision_tecnica: 30,
    dias_alerta_soat: 30,
    dias_alerta_extintor: 15,
    observaciones: "",
    activo: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [showMarcasDropdown, setShowMarcasDropdown] = useState(false);
  const [marcaPersonalizada, setMarcaPersonalizada] = useState("");
  const [marcasFiltradas, setMarcasFiltradas] = useState(marcasVehiculo);

  // Referencia para cerrar dropdown al hacer clic fuera
  const marcaDropdownRef = React.useRef(null);

  useEffect(() => {
    if (initialData) {
      // Formatear fechas para input type="date"
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        ...initialData,
        // Asegurar que los nuevos campos tengan valores por defecto
        nombre_conductor: initialData.nombre_conductor || "",
        numero_licencia: initialData.numero_licencia || "",
        // Formatear fechas
        revision_tecnica_emision: formatDateForInput(
          initialData.revision_tecnica_emision
        ),
        revision_tecnica_vencimiento: formatDateForInput(
          initialData.revision_tecnica_vencimiento
        ),
        soat_vigencia_inicio: formatDateForInput(
          initialData.soat_vigencia_inicio
        ),
        soat_vigencia_fin: formatDateForInput(initialData.soat_vigencia_fin),
        extintor_vencimiento: formatDateForInput(
          initialData.extintor_vencimiento
        ),
        // Valores por defecto
        anio: initialData.anio || new Date().getFullYear(),
        tn: initialData.tn || 0,
        m3: initialData.m3 || 0,
        cantidad_parihuelas: initialData.cantidad_parihuelas || 0,
        dias_alerta_revision_tecnica:
          initialData.dias_alerta_revision_tecnica || 30,
        dias_alerta_soat: initialData.dias_alerta_soat || 30,
        dias_alerta_extintor: initialData.dias_alerta_extintor || 15,
        observaciones: initialData.observaciones || "",
        activo: initialData.activo !== false,
      });

      // Si la marca no está en la lista, activar modo personalizado
      if (initialData.marca && !marcasVehiculo.includes(initialData.marca)) {
        setMarcaPersonalizada(initialData.marca);
      }

      // Verificar alertas si estamos en modo edición
      if (mode === "edit") {
        verificarFechasVencimiento({
          ...initialData,
          revision_tecnica_vencimiento: initialData.revision_tecnica_vencimiento
            ? new Date(initialData.revision_tecnica_vencimiento)
            : null,
          soat_vigencia_fin: initialData.soat_vigencia_fin
            ? new Date(initialData.soat_vigencia_fin)
            : null,
          extintor_vencimiento: initialData.extintor_vencimiento
            ? new Date(initialData.extintor_vencimiento)
            : null,
        });
      }
    }
  }, [initialData, mode]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (marcaDropdownRef.current && !marcaDropdownRef.current.contains(event.target)) {
        setShowMarcasDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;

    if (type === "number") {
      processedValue = value === "" ? 0 : parseFloat(value);
    } else if (type === "checkbox") {
      processedValue = e.target.checked;
    } else if (name === "placa" || name === "numero_licencia") {
      // Convertir a mayúsculas automáticamente para placa y número de licencia
      processedValue = value.toUpperCase();
    } else if (name === "nombre_conductor") {
      // Capitalizar nombre del conductor (primera letra de cada palabra)
      processedValue = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } else if (name.includes("alerta") || name === "anio" || name === "cantidad_parihuelas") {
      processedValue = value === "" ? 0 : parseInt(value, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Limpiar error si existe
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Si cambia una fecha de vencimiento, verificar alertas
    if (
      name.includes("vencimiento") ||
      name.includes("fin") ||
      name.includes("alerta")
    ) {
      verificarFechasVencimiento({
        ...formData,
        [name]: processedValue,
      });
    }
  };

  // Manejar cambio de marca desde dropdown o input personalizado
  const handleMarcaChange = (value, isCustom = false) => {
    if (isCustom) {
      setMarcaPersonalizada(value);
      setFormData((prev) => ({
        ...prev,
        marca: value,
      }));
    } else {
      setMarcaPersonalizada("");
      setFormData((prev) => ({
        ...prev,
        marca: value,
      }));
      setShowMarcasDropdown(false);
    }

    // Limpiar error de marca si existe
    if (formErrors.marca) {
      setFormErrors((prev) => ({
        ...prev,
        marca: "",
      }));
    }
  };

  // Filtrar marcas según lo que el usuario escribe
  const handleMarcaInputChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      marca: value,
    }));
    
    // Si el usuario escribe, mostrar dropdown con filtro
    if (value.trim() !== "") {
      setShowMarcasDropdown(true);
      const filtradas = marcasVehiculo.filter(marca =>
        marca.toLowerCase().includes(value.toLowerCase())
      );
      setMarcasFiltradas(filtradas);
    } else {
      setShowMarcasDropdown(true);
      setMarcasFiltradas(marcasVehiculo);
    }
  };

  const verificarFechasVencimiento = (data) => {
    const hoy = new Date();
    const alertasTemp = [];

    // Verificar revisión técnica
    if (data.revision_tecnica_vencimiento) {
      const fechaVencimiento = new Date(data.revision_tecnica_vencimiento);
      const diasFaltantes = Math.ceil(
        (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
      );
      const diasAlerta = data.dias_alerta_revision_tecnica || 30;

      if (diasFaltantes <= diasAlerta && diasFaltantes >= 0) {
        alertasTemp.push({
          tipo: "revision_tecnica",
          mensaje: `Revisión técnica vence en ${diasFaltantes} días (${fechaVencimiento.toLocaleDateString()})`,
          severidad: diasFaltantes <= 7 ? "alta" : "media",
        });
      } else if (diasFaltantes < 0) {
        alertasTemp.push({
          tipo: "revision_tecnica",
          mensaje: `Revisión técnica VENCIDA hace ${Math.abs(diasFaltantes)} días`,
          severidad: "alta",
        });
      }
    }

    // Verificar SOAT
    if (data.soat_vigencia_fin) {
      const fechaVencimiento = new Date(data.soat_vigencia_fin);
      const diasFaltantes = Math.ceil(
        (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
      );
      const diasAlerta = data.dias_alerta_soat || 30;

      if (diasFaltantes <= diasAlerta && diasFaltantes >= 0) {
        alertasTemp.push({
          tipo: "soat",
          mensaje: `SOAT vence en ${diasFaltantes} días (${fechaVencimiento.toLocaleDateString()})`,
          severidad: diasFaltantes <= 7 ? "alta" : "media",
        });
      } else if (diasFaltantes < 0) {
        alertasTemp.push({
          tipo: "soat",
          mensaje: `SOAT VENCIDO hace ${Math.abs(diasFaltantes)} días`,
          severidad: "alta",
        });
      }
    }

    // Verificar extintor
    if (data.extintor_vencimiento) {
      const fechaVencimiento = new Date(data.extintor_vencimiento);
      const diasFaltantes = Math.ceil(
        (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
      );
      const diasAlerta = data.dias_alerta_extintor || 15;

      if (diasFaltantes <= diasAlerta && diasFaltantes >= 0) {
        alertasTemp.push({
          tipo: "extintor",
          mensaje: `Extintor vence en ${diasFaltantes} días (${fechaVencimiento.toLocaleDateString()})`,
          severidad: diasFaltantes <= 3 ? "alta" : "media",
        });
      } else if (diasFaltantes < 0) {
        alertasTemp.push({
          tipo: "extintor",
          mensaje: `Extintor VENCIDO hace ${Math.abs(diasFaltantes)} días`,
          severidad: "alta",
        });
      }
    }

    setAlertas(alertasTemp);
  };

  const validateForm = () => {
    const errors = {};

    // Validaciones básicas
    if (!formData.placa.trim()) {
      errors.placa = "La placa es requerida";
    } else if (formData.placa.length < 6) {
      errors.placa = "La placa debe tener al menos 6 caracteres";
    }

    if (!formData.anio) {
      errors.anio = "El año es requerido";
    } else if (formData.anio < 1990 || formData.anio > new Date().getFullYear()) {
      errors.anio = `El año debe estar entre 1990 y ${new Date().getFullYear()}`;
    }

    if (!formData.tn || formData.tn <= 0) {
      errors.tn = "La capacidad en toneladas debe ser mayor a 0";
    }

    if (!formData.m3 || formData.m3 <= 0) {
      errors.m3 = "La capacidad en m³ debe ser mayor a 0";
    }

    if (!formData.tipo_vehiculo) {
      errors.tipo_vehiculo = "El tipo de vehículo es requerido";
    }

    // Validaciones para los nuevos campos (opcionales pero con validaciones si se ingresan)
    if (formData.nombre_conductor && formData.nombre_conductor.trim() !== "") {
      if (formData.nombre_conductor.length < 2) {
        errors.nombre_conductor = "El nombre debe tener al menos 2 caracteres";
      } else if (formData.nombre_conductor.length > 100) {
        errors.nombre_conductor = "El nombre no puede exceder los 100 caracteres";
      }
    }

    if (formData.numero_licencia && formData.numero_licencia.trim() !== "") {
      if (formData.numero_licencia.length < 5) {
        errors.numero_licencia = "El número de licencia debe tener al menos 5 caracteres";
      } else if (formData.numero_licencia.length > 20) {
        errors.numero_licencia = "El número de licencia no puede exceder los 20 caracteres";
      }
    }

    // Validar fechas
    if (formData.revision_tecnica_emision && formData.revision_tecnica_vencimiento) {
      const emision = new Date(formData.revision_tecnica_emision);
      const vencimiento = new Date(formData.revision_tecnica_vencimiento);
      if (vencimiento <= emision) {
        errors.revision_tecnica_vencimiento = "La fecha de vencimiento debe ser posterior a la de emisión";
      }
    }

    if (formData.soat_vigencia_inicio && formData.soat_vigencia_fin) {
      const inicio = new Date(formData.soat_vigencia_inicio);
      const fin = new Date(formData.soat_vigencia_fin);
      if (fin <= inicio) {
        errors.soat_vigencia_fin = "La fecha de fin debe ser posterior a la de inicio";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Preparar data para enviar
      const dataToSubmit = { ...formData };

      // Si no hay código de flota y estamos en modo creación, eliminar el campo
      if (mode === "create" && !dataToSubmit.codigo_flota.trim()) {
        delete dataToSubmit.codigo_flota;
      }

      // Formatear campos numéricos
      dataToSubmit.tn = parseFloat(dataToSubmit.tn);
      dataToSubmit.m3 = parseFloat(dataToSubmit.m3);
      dataToSubmit.cantidad_parihuelas = parseInt(dataToSubmit.cantidad_parihuelas, 10);
      dataToSubmit.dias_alerta_revision_tecnica = parseInt(dataToSubmit.dias_alerta_revision_tecnica, 10);
      dataToSubmit.dias_alerta_soat = parseInt(dataToSubmit.dias_alerta_soat, 10);
      dataToSubmit.dias_alerta_extintor = parseInt(dataToSubmit.dias_alerta_extintor, 10);

      // Limpiar campos opcionales vacíos
      const camposOpcionales = [
        "codigo_flota",
        "nombre_conductor",
        "numero_licencia",
        "revision_tecnica_emision",
        "revision_tecnica_vencimiento",
        "soat_vigencia_inicio",
        "soat_vigencia_fin",
        "mtc_numero",
        "extintor_vencimiento",
        "observaciones"
      ];

      camposOpcionales.forEach(campo => {
        if (!dataToSubmit[campo] || dataToSubmit[campo] === "") {
          delete dataToSubmit[campo];
        }
      });

      onSubmit(dataToSubmit);
    }
  };

  const getCodigoFlotaLabel = () => {
    if (mode === "create") {
      return "Generado automáticamente (opcional)";
    } else {
      return formData.codigo_flota || "Sin código";
    }
  };

  const getColorAlerta = (severidad) => {
    switch (severidad) {
      case "alta":
        return "text-red-700 bg-red-50 border-red-200";
      case "media":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-700 bg-blue-50 border-blue-200";
    }
  };

  const calcularAntiguedad = () => {
    const anioActual = new Date().getFullYear();
    return anioActual - formData.anio;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm" {...props}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Alertas de vencimiento */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg flex items-center ${getColorAlerta(alerta.severidad)}`}
            >
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-xs font-medium">{alerta.mensaje}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primera fila: Estado y Código */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="activo"
            value={formData.activo}
            onChange={(e) => handleChange({
              target: {
                name: "activo",
                value: e.target.value === "true",
                type: "select"
              }
            })}
            disabled={mode === "view" || isLoading}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            {estadosFlota.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Código Flota
          </label>
          <input
            name="codigo_flota"
            value={formData.codigo_flota}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="Ej: FL-001 (opcional)"
            maxLength="20"
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.codigo_flota ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          />
          {formErrors.codigo_flota && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.codigo_flota}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Si no se especifica, se generará automáticamente
          </p>
        </div>
      </div>

      {/* Segunda fila: Placa, Marca, Modelo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Placa *
          </label>
          <input
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="Ej: ABC-123"
            maxLength="10"
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.placa ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase disabled:bg-gray-100`}
          />
          {formErrors.placa && (
            <p className="mt-1 text-xs text-red-600">{formErrors.placa}</p>
          )}
        </div>

        <div ref={marcaDropdownRef}>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Marca *
          </label>
          <div className="relative">
            <div className="flex">
              <input
                name="marca"
                value={formData.marca}
                onChange={(e) => handleMarcaInputChange(e.target.value)}
                onFocus={() => setShowMarcasDropdown(true)}
                disabled={mode === "view" || isLoading}
                placeholder="Seleccione o escriba una marca"
                className={`flex-1 px-3 py-1.5 text-sm border ${
                  formErrors.marca ? "border-red-300" : "border-gray-300"
                } rounded-l focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
              />
              <button
                type="button"
                onClick={() => setShowMarcasDropdown(!showMarcasDropdown)}
                disabled={mode === "view" || isLoading}
                className={`px-2 py-1.5 border ${
                  formErrors.marca ? "border-red-300" : "border-gray-300"
                } border-l-0 rounded-r bg-gray-50 hover:bg-gray-100 disabled:opacity-50`}
              >
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Dropdown de marcas */}
            {showMarcasDropdown && mode !== "view" && !isLoading && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                {/* Opción para escribir marca personalizada */}
                <div className="p-2 border-b">
                  <div className="text-xs text-gray-500 mb-1">Escribir marca:</div>
                  <input
                    type="text"
                    value={marcaPersonalizada || formData.marca}
                    onChange={(e) => handleMarcaChange(e.target.value, true)}
                    placeholder="Escriba una marca personalizada"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Lista de marcas predefinidas */}
                <div className="py-1">
                  <div className="text-xs text-gray-500 px-3 py-1">Marcas comunes:</div>
                  {marcasFiltradas.map((marca) => (
                    <button
                      key={marca}
                      type="button"
                      onClick={() => handleMarcaChange(marca, false)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 ${
                        formData.marca === marca ? "bg-blue-50 text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {marca}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {formErrors.marca && (
            <p className="mt-1 text-xs text-red-600">{formErrors.marca}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Modelo *
          </label>
          <input
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="Ej: FH16, Actros, Sprinter"
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.modelo ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          />
          {formErrors.modelo && (
            <p className="mt-1 text-xs text-red-600">{formErrors.modelo}</p>
          )}
        </div>
      </div>

      {/* Tercera fila: Año, Tipo, Combustible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Año *
          </label>
          <input
            type="number"
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            min="1990"
            max={new Date().getFullYear()}
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.anio ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          />
          {formErrors.anio && (
            <p className="mt-1 text-xs text-red-600">{formErrors.anio}</p>
          )}
          {formData.anio > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Antigüedad: {calcularAntiguedad()} años
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de Vehículo *
          </label>
          <select
            name="tipo_vehiculo"
            value={formData.tipo_vehiculo}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.tipo_vehiculo ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          >
            <option value="">Seleccionar tipo</option>
            {tiposVehiculo.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          {formErrors.tipo_vehiculo && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.tipo_vehiculo}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de Combustible
          </label>
          <select
            name="tipo_combustible"
            value={formData.tipo_combustible}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            {tiposCombustible.map((combustible) => (
              <option key={combustible.value} value={combustible.value}>
                {combustible.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* NUEVA SECCIÓN: Datos del conductor */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-500" />
          Datos del Conductor (Opcionales)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nombre del Conductor
            </label>
            <div className="relative">
              <input
                name="nombre_conductor"
                value={formData.nombre_conductor}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                placeholder="Ej: Juan Pérez García"
                maxLength="100"
                className={`w-full pl-10 pr-3 py-1.5 text-sm border ${
                  formErrors.nombre_conductor ? "border-red-300" : "border-gray-300"
                } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {formErrors.nombre_conductor && (
              <p className="mt-1 text-xs text-red-600">{formErrors.nombre_conductor}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Número de Licencia
            </label>
            <div className="relative">
              <input
                name="numero_licencia"
                value={formData.numero_licencia}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                placeholder="Ej: Q12345678"
                maxLength="20"
                className={`w-full pl-10 pr-3 py-1.5 text-sm border ${
                  formErrors.numero_licencia ? "border-red-300" : "border-gray-300"
                } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase disabled:bg-gray-100`}
              />
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {formErrors.numero_licencia && (
              <p className="mt-1 text-xs text-red-600">{formErrors.numero_licencia}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              El número de licencia debe ser único por conductor
            </p>
          </div>
        </div>
      </div>

      {/* Cuarta fila: Capacidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Capacidad de Carga (TN) *
          </label>
          <div className="relative">
            <input
              type="number"
              name="tn"
              value={formData.tn}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              min="0"
              step="0.1"
              placeholder="0.0"
              className={`w-full px-3 py-1.5 text-sm border ${
                formErrors.tn ? "border-red-300" : "border-gray-300"
              } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              TN
            </span>
          </div>
          {formErrors.tn && (
            <p className="mt-1 text-xs text-red-600">{formErrors.tn}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Capacidad Volumétrica (m³) *
          </label>
          <div className="relative">
            <input
              type="number"
              name="m3"
              value={formData.m3}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              min="0"
              step="0.1"
              placeholder="0.0"
              className={`w-full px-3 py-1.5 text-sm border ${
                formErrors.m3 ? "border-red-300" : "border-gray-300"
              } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              m³
            </span>
          </div>
          {formErrors.m3 && (
            <p className="mt-1 text-xs text-red-600">{formErrors.m3}</p>
          )}
        </div>
      </div>

      {/* Quinta fila: Parihuelas y MTC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cantidad de Parihuelas
          </label>
          <input
            type="number"
            name="cantidad_parihuelas"
            value={formData.cantidad_parihuelas}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            min="0"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Número MTC (opcional)
          </label>
          <input
            name="mtc_numero"
            value={formData.mtc_numero}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="Ej: MTC-458712"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Sección: Documentación - Revisión Técnica */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3">
          Revisión Técnica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Fecha de Emisión (opcional)
            </label>
            <input
              type="date"
              name="revision_tecnica_emision"
              value={formData.revision_tecnica_emision}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Fecha de Vencimiento (opcional)
            </label>
            <input
              type="date"
              name="revision_tecnica_vencimiento"
              value={formData.revision_tecnica_vencimiento}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              className={`w-full px-3 py-1.5 text-sm border ${
                formErrors.revision_tecnica_vencimiento
                  ? "border-red-300"
                  : "border-gray-300"
              } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
            />
            {formErrors.revision_tecnica_vencimiento && (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.revision_tecnica_vencimiento}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Días de Alerta
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="dias_alerta_revision_tecnica"
                value={formData.dias_alerta_revision_tecnica}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                min="1"
                max="365"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">
                días antes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: SOAT */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3">SOAT</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Vigencia Inicio (opcional)
            </label>
            <input
              type="date"
              name="soat_vigencia_inicio"
              value={formData.soat_vigencia_inicio}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Vigencia Fin (opcional)
            </label>
            <input
              type="date"
              name="soat_vigencia_fin"
              value={formData.soat_vigencia_fin}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              className={`w-full px-3 py-1.5 text-sm border ${
                formErrors.soat_vigencia_fin
                  ? "border-red-300"
                  : "border-gray-300"
              } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
            />
            {formErrors.soat_vigencia_fin && (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.soat_vigencia_fin}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Días de Alerta
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="dias_alerta_soat"
                value={formData.dias_alerta_soat}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                min="1"
                max="365"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">
                días antes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Extintor */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Extintor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Fecha de Vencimiento (opcional)
            </label>
            <input
              type="date"
              name="extintor_vencimiento"
              value={formData.extintor_vencimiento}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Días de Alerta
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="dias_alerta_extintor"
                value={formData.dias_alerta_extintor}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                min="1"
                max="365"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">
                días antes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Observaciones (opcional)
        </label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          disabled={mode === "view" || isLoading}
          rows="3"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          placeholder="Información adicional sobre el vehículo, mantenimiento, características especiales..."
        />
      </div>

      {mode !== "view" && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="text-sm"
          >
            <X className="h-3 w-3 mr-1" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            className="text-sm"
          >
            <Save className="h-3 w-3 mr-1" />
            {mode === "create" ? "Crear Vehículo" : "Guardar"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default React.memo(FlotaForm);