import React, { useState, useEffect } from "react";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";
import {
  Save,
  X,
  Plus,
  Trash2,
  Search,
  CreditCard,
  Star,
  StarOff,
} from "lucide-react";
import { clienteAPI } from "../../api/endpoints/clientes";

// Data
const tiposDocumento = [
  { value: "RUC", label: "RUC" },
  { value: "DNI", label: "DNI" },
  { value: "CE", label: "Carnet de Extranjería" },
];

const rubrosComerciales = [
  { value: "transporte", label: "Transporte y Logística" },
  { value: "importador", label: "Importador" },
  { value: "exportador", label: "Exportador" },
  { value: "distribuidor", label: "Distribuidor" },
  { value: "minorista", label: "Minorista" },
  { value: "mayorista", label: "Mayorista" },
  { value: "manufactura", label: "Manufactura" },
  { value: "servicios", label: "Servicios" },
  { value: "construccion", label: "Construcción" },
  { value: "otros", label: "Otros" },
];

const estadosCliente = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "pendiente", label: "Pendiente" },
  { value: "suspendido", label: "Suspendido" },
];

const tiposPago = [
  { value: "Contado", label: "Contado" },
  { value: "Crédito", label: "Crédito" },
  { value: "Crédito Factoring", label: "Crédito Factoring" },
];

const periodosFacturacion = [
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual" },
  { value: "bimestral", label: "Bimestral" },
  { value: "trimestral", label: "Trimestral" },
  { value: "personalizado", label: "Personalizado" },
];

const tiposContacto = [
  { value: "comercial", label: "Comercial" },
  { value: "contable", label: "Contable" },
  { value: "logistica", label: "Logística" },
  { value: "administrativo", label: "Administrativo" },
  { value: "gerencia", label: "Gerencia" },
];

const estadosCuenta = [
  { value: "activa", label: "Activa" },
  { value: "suspendida", label: "Suspendida" },
];

const ClienteForm = ({
  initialData,
  onSubmit,
  onCancel,
  mode = "create",
  isLoading = false,
  error = null,
  ...props
}) => {
  const [formData, setFormData] = useState({
    codigo_cliente: "",
    tipo_documento: "RUC",
    numero_documento: "",
    razon_social: "",
    rubro_comercial: "",
    periodo_facturacion: "mensual",
    periodo_facturacion_dias: "",
    tipo_pago: "Contado",
    dias_credito: 0,
    estado: "activo",
    email: "",
    direccion: "",
    website: "",
    observaciones: "",
  });

  const [contactos, setContactos] = useState([
    { tipo: "comercial", nombre: "", telefono: "" },
  ]);

  const [cuentasFacturacion, setCuentasFacturacion] = useState([
    {
      nombre_cuenta: "Cuenta Principal",
      tipo_pago: "Contado",
      dias_credito: 0,
      limite_credito: 0,
      estado: "activa",
      es_principal: true,
      direccion_origen: "",
    },
  ]);

  const [formErrors, setFormErrors] = useState({});
  const [contactosErrors, setContactosErrors] = useState([]);
  const [cuentasErrors, setCuentasErrors] = useState([]);
  const [isConsultingRuc, setIsConsultingRuc] = useState(false);
  const [rucError, setRucError] = useState(null);

  useEffect(() => {
    if (initialData) {
      // Datos básicos del formulario
      setFormData({
        ...formData,
        ...initialData,
        rubro_comercial: initialData.tipo_cliente || "",
        periodo_facturacion: initialData.periodo_facturacion || "mensual",
        periodo_facturacion_dias: initialData.periodo_facturacion_dias || "",
        tipo_pago: initialData.tipo_pago || "Contado",
        dias_credito: initialData.dias_credito || 0,
      });

      // Contactos - parsear desde JSON string si existe
      if (initialData.contactos) {
        try {
          const contactosParsed = initialData.contactos;
          if (Array.isArray(contactosParsed) && contactosParsed.length > 0) {
            setContactos(contactosParsed);
          }
        } catch (e) {
          console.error("Error parsing contactos:", e);
          // Si hay error, usar contacto_principal y telefono como fallback
          if (initialData.contacto_principal || initialData.telefono) {
            setContactos([
              {
                tipo: "comercial",
                nombre: initialData.contacto_principal || "",
                telefono: initialData.telefono || "",
              },
            ]);
          }
        }
      } else if (initialData.contacto_principal || initialData.telefono) {
        setContactos([
          {
            tipo: "comercial",
            nombre: initialData.contacto_principal || "",
            telefono: initialData.telefono || "",
          },
        ]);
      }

      // Cuentas de facturación - parsear desde JSON string si existe
      if (initialData.cuentas_facturacion) {
        try {
          const cuentasParsed = initialData.cuentas_facturacion;
          if (Array.isArray(cuentasParsed) && cuentasParsed.length > 0) {
            setCuentasFacturacion(cuentasParsed);
          }
        } catch (e) {
          console.error("Error parsing cuentas_facturacion:", e);
        }
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "codigo_cliente") return;

    let processedValue = value;

    if (name === "dias_credito") {
      processedValue = value === "" ? 0 : parseInt(value, 10);
    } else if (name === "periodo_facturacion_dias") {
      processedValue = value === "" ? "" : parseInt(value, 10) || 0;
    }

    // Validar RUC máximo 11 caracteres
    if (
      name === "numero_documento" &&
      formData.tipo_documento === "RUC" &&
      value.length > 11
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (name === "tipo_pago" && value === "Contado") {
      setFormData((prev) => ({
        ...prev,
        dias_credito: 0,
      }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Limpiar error de RUC cuando se modifica el campo
    if (name === "numero_documento") {
      setRucError(null);
    }
  };

  const handleConsultarRuc = async () => {
    if (!formData.numero_documento.trim()) {
      setRucError("Ingrese un RUC para consultar");
      return;
    }

    if (formData.tipo_documento !== "RUC") {
      setRucError("La consulta solo está disponible para RUC");
      return;
    }

    if (formData.numero_documento.length !== 11) {
      setRucError("El RUC debe tener 11 dígitos");
      return;
    }

    setIsConsultingRuc(true);
    setRucError(null);

    try {
      const response = await clienteAPI.consultarRuc(formData.numero_documento);

      if (response.success && response.data) {
        const rucData = response.data;

        // Mapear los datos del RUC a los campos del formulario
        setFormData((prev) => ({
          ...prev,
          razon_social: rucData.nombre_razon_social || "",
          direccion: rucData.direccion_completa || "",
          // Si el estado del RUC es "ACTIVO", establecer estado como "activo", de lo contrario "suspendido"
          estado:
            rucData.estado_contribuyente?.includes("ACTIVO") ||
            rucData.condicion_domicilio?.includes("HABIDO")
              ? "activo"
              : "suspendido",
        }));
      } else {
        setRucError("No se encontró información para el RUC proporcionado");
      }
    } catch (error) {
      console.error("Error al consultar RUC:", error);
      setRucError(
        error.response?.data?.message ||
          "Error al consultar el RUC. Intente nuevamente."
      );
    } finally {
      setIsConsultingRuc(false);
    }
  };

  const handleContactoChange = (index, field, value) => {
    const nuevosContactos = [...contactos];
    nuevosContactos[index][field] = value;
    setContactos(nuevosContactos);

    // Limpiar error de este contacto si existe
    if (contactosErrors[index]) {
      const nuevosErrores = [...contactosErrors];
      nuevosErrores[index] = { ...nuevosErrores[index], [field]: undefined };
      setContactosErrors(nuevosErrores);
    }
  };

  const agregarContacto = () => {
    setContactos([
      ...contactos,
      { tipo: "comercial", nombre: "", telefono: "" },
    ]);
  };

  const eliminarContacto = (index) => {
    if (contactos.length > 1) {
      const nuevosContactos = contactos.filter((_, i) => i !== index);
      setContactos(nuevosContactos);

      // Eliminar el error asociado a este contacto
      const nuevosErrores = contactosErrors.filter((_, i) => i !== index);
      setContactosErrors(nuevosErrores);
    }
  };

  // Funciones para cuentas de facturación
  const handleCuentaChange = (index, field, value) => {
    const nuevasCuentas = [...cuentasFacturacion];

    // Si se está cambiando el tipo_pago a "Contado", establecer días_credito a 0
    if (
      field === "tipo_pago" &&
      (value === "Contado" || value === "Crédito Factoring")
    ) {
      nuevasCuentas[index].dias_credito = 0;
    }

    // Si se está cambiando a principal, quitar principal de las demás
    if (field === "es_principal" && value === true) {
      nuevasCuentas.forEach((cuenta, i) => {
        if (i !== index) {
          cuenta.es_principal = false;
        }
      });
    }

    nuevasCuentas[index][field] = value;
    setCuentasFacturacion(nuevasCuentas);

    // Limpiar error de esta cuenta si existe
    if (cuentasErrors[index]) {
      const nuevosErrores = [...cuentasErrors];
      nuevosErrores[index] = { ...nuevosErrores[index], [field]: undefined };
      setCuentasErrors(nuevosErrores);
    }
  };

  const agregarCuenta = () => {
    const nuevaCuenta = {
      nombre_cuenta: `Cuenta ${cuentasFacturacion.length + 1}`,
      tipo_pago: "Contado",
      dias_credito: 0,
      limite_credito: 0,
      estado: "activa",
      es_principal: false,
      direccion_origen: "",
    };
    setCuentasFacturacion([...cuentasFacturacion, nuevaCuenta]);
  };

  const eliminarCuenta = (index) => {
    if (cuentasFacturacion.length > 1) {
      const cuentaAEliminar = cuentasFacturacion[index];

      // Si se está eliminando la cuenta principal, establecer la primera como principal
      if (cuentaAEliminar.es_principal) {
        const nuevasCuentas = cuentasFacturacion.filter((_, i) => i !== index);
        if (nuevasCuentas.length > 0) {
          nuevasCuentas[0].es_principal = true;
        }
        setCuentasFacturacion(nuevasCuentas);
      } else {
        setCuentasFacturacion(cuentasFacturacion.filter((_, i) => i !== index));
      }

      // Eliminar el error asociado a esta cuenta
      const nuevosErrores = cuentasErrors.filter((_, i) => i !== index);
      setCuentasErrors(nuevosErrores);
    }
  };

  const establecerComoPrincipal = (index) => {
    const nuevasCuentas = cuentasFacturacion.map((cuenta, i) => ({
      ...cuenta,
      es_principal: i === index,
    }));
    setCuentasFacturacion(nuevasCuentas);
  };

  const validarContactos = () => {
    const erroresContactos = [];
    let tieneErrores = false;

    contactos.forEach((contacto, index) => {
      const errores = {};

      if (!contacto.tipo.trim()) {
        errores.tipo = "El tipo de contacto es requerido";
        tieneErrores = true;
      }

      if (!contacto.nombre.trim()) {
        errores.nombre = "El nombre del contacto es requerido";
        tieneErrores = true;
      }

      if (!contacto.telefono.trim()) {
        errores.telefono = "El teléfono del contacto es requerido";
        tieneErrores = true;
      }

      erroresContactos[index] = errores;
    });

    setContactosErrors(erroresContactos);
    return !tieneErrores;
  };

  const validarCuentas = () => {
    const erroresCuentas = [];
    let tieneErrores = false;
    let tienePrincipal = false;

    cuentasFacturacion.forEach((cuenta, index) => {
      const errores = {};

      if (!cuenta.nombre_cuenta.trim()) {
        errores.nombre_cuenta = "El nombre de la cuenta es requerido";
        tieneErrores = true;
      }

      if (!cuenta.tipo_pago) {
        errores.tipo_pago = "El tipo de pago es requerido";
        tieneErrores = true;
      }

      if (cuenta.tipo_pago === "Crédito" && cuenta.dias_credito <= 0) {
        errores.dias_credito = "Los días de crédito deben ser mayores a 0";
        tieneErrores = true;
      }

      if (cuenta.limite_credito < 0) {
        errores.limite_credito = "El límite de crédito no puede ser negativo";
        tieneErrores = true;
      }

      if (!cuenta.estado) {
        errores.estado = "El estado de la cuenta es requerido";
        tieneErrores = true;
      }

      if (cuenta.es_principal) {
        tienePrincipal = true;
      }

      erroresCuentas[index] = errores;
    });

    // Validar que haya al menos una cuenta principal
    if (!tienePrincipal) {
      setFormErrors((prev) => ({
        ...prev,
        cuentas_facturacion: "Debe haber al menos una cuenta principal",
      }));
      tieneErrores = true;
    }

    setCuentasErrors(erroresCuentas);
    return !tieneErrores;
  };

  const validateForm = () => {
    const errors = {};

    // Validaciones básicas
    if (!formData.numero_documento.trim()) {
      errors.numero_documento = "El RUC es requerido";
    } else if (
      formData.tipo_documento === "RUC" &&
      formData.numero_documento.length !== 11
    ) {
      errors.numero_documento = "El RUC debe tener 11 dígitos";
    }

    if (!formData.razon_social.trim()) {
      errors.razon_social = "La razón social es requerida";
    }

    // Validar período de facturación personalizado
    if (
      formData.periodo_facturacion === "personalizado" &&
      !formData.periodo_facturacion_dias
    ) {
      errors.periodo_facturacion_dias =
        "Debe especificar los días para el período personalizado";
    }

    // Validar contactos
    // const contactosValidos = validarContactos();

    // Validar cuentas
    const cuentasValidas = validarCuentas();

    setFormErrors(errors);

    return Object.keys(errors).length === 0 && cuentasValidas;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Filtrar contactos vacíos
      const contactosFiltrados = contactos.filter(
        (contacto) =>
          contacto.tipo.trim() &&
          contacto.nombre.trim() &&
          contacto.telefono.trim()
      );

      // Filtrar campos vacíos de contactos
      const contactosFormateados = contactosFiltrados.map((contacto) => ({
        tipo: contacto.tipo.trim(),
        nombre: contacto.nombre.trim(),
        telefono: contacto.telefono.trim(),
      }));

      // Formatear cuentas con los tipos de datos correctos
      const cuentasFormateadas = cuentasFacturacion.map((cuenta) => ({
        nombre_cuenta: cuenta.nombre_cuenta.trim(),
        tipo_pago: cuenta.tipo_pago,
        dias_credito: Number(cuenta.dias_credito) || 0,
        limite_credito: Number(cuenta.limite_credito) || 0,
        estado: cuenta.estado,
        es_principal: Boolean(cuenta.es_principal),
        direccion_origen: cuenta.direccion_origen?.trim() || "",
      }));

      // if (!cuentasFormateadas.direccion_origen) {
      //   delete cuentasFormateadas.direccion_origen;
      // }

      // Preparar data para enviar
      const dataToSubmit = {
        ...formData,
        tipo_cliente: formData.rubro_comercial,
        // Mantener contacto_principal y telefono para compatibilidad
        contacto_principal: contactosFormateados[0]?.nombre || "",
        telefono: contactosFormateados[0]?.telefono || "",
        // Enviar como JSON strings
        contactos: contactosFormateados,
        cuentas_facturacion: cuentasFormateadas,
      };

      // Limpiar campos opcionales vacíos
      if (!dataToSubmit.email?.trim()) delete dataToSubmit.email;
      if (!dataToSubmit.direccion?.trim()) delete dataToSubmit.direccion;
      if (!dataToSubmit.website?.trim()) delete dataToSubmit.website;
      if (!dataToSubmit.observaciones?.trim())
        delete dataToSubmit.observaciones;
      if (
        !dataToSubmit.periodo_facturacion_dias ||
        dataToSubmit.periodo_facturacion_dias <= 0
      ) {
        delete dataToSubmit.periodo_facturacion_dias;
      }

      if (mode === "create") {
        const { codigo_cliente, ...restData } = dataToSubmit;
        onSubmit(restData);
      } else {
        onSubmit(dataToSubmit);
      }
    }
  };

  const getCodigoClienteLabel = () => {
    if (mode === "create") {
      return "Generado automáticamente";
    } else {
      return formData.codigo_cliente || "Sin código";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm" {...props}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <div className="flex items-center">
            <svg
              className="h-4 w-4 text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Primera fila: Estado y Código */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            {estadosCliente.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Código Cliente
          </label>
          <div
            className={`w-full px-3 py-1.5 border border-gray-300 rounded text-sm ${
              mode === "create"
                ? "bg-gray-100 text-gray-500"
                : "bg-gray-50 text-gray-700"
            }`}
          >
            {getCodigoClienteLabel()}
          </div>
        </div>
      </div>

      {/* Segunda fila: Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de Documento
          </label>
          <select
            name="tipo_documento"
            value={formData.tipo_documento}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            {tiposDocumento.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            RUC *
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                name="numero_documento"
                value={formData.numero_documento}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                placeholder="11 dígitos"
                maxLength="11"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={handleConsultarRuc}
                disabled={
                  mode === "view" ||
                  isLoading ||
                  isConsultingRuc ||
                  formData.tipo_documento !== "RUC"
                }
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Consultar RUC"
              >
                {isConsultingRuc ? (
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>

            {rucError && <p className="text-xs text-red-600">{rucError}</p>}

            {formErrors.numero_documento && (
              <p className="text-xs text-red-600">
                {formErrors.numero_documento}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Razón Social *
          </label>
          <input
            name="razon_social"
            value={formData.razon_social}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="Nombre legal de la empresa"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          />
          {formErrors.razon_social && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.razon_social}
            </p>
          )}
        </div>
      </div>

      {/* Tercera fila: Información comercial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Rubro Comercial
          </label>
          <select
            name="rubro_comercial"
            value={formData.rubro_comercial}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="">Seleccionar rubro</option>
            {rubrosComerciales.map((rubro) => (
              <option key={rubro.value} value={rubro.value}>
                {rubro.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Período de Facturación
          </label>
          <div className="space-y-2">
            <select
              name="periodo_facturacion"
              value={formData.periodo_facturacion}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
            >
              {periodosFacturacion.map((periodo) => (
                <option key={periodo.value} value={periodo.value}>
                  {periodo.label}
                </option>
              ))}
            </select>

            {formData.periodo_facturacion === "personalizado" && (
              <div>
                <input
                  type="number"
                  name="periodo_facturacion_dias"
                  value={formData.periodo_facturacion_dias}
                  onChange={handleChange}
                  disabled={mode === "view" || isLoading}
                  placeholder="Ingrese cantidad de días"
                  min="1"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                />
                {formErrors.periodo_facturacion_dias && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.periodo_facturacion_dias}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de Pago (General)
          </label>
          <select
            name="tipo_pago"
            value={formData.tipo_pago}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            {tiposPago.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cuarta fila: Días de crédito */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Días de Crédito (General){" "}
          {formData.tipo_pago !== "Contado" ? "*" : ""}
        </label>
        <div className="flex gap-2">
          <select
            name="dias_credito"
            value={formData.dias_credito}
            onChange={handleChange}
            disabled={
              mode === "view" || isLoading || formData.tipo_pago === "Contado"
            }
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="0">0 días</option>
            <option value="7">7 días</option>
            <option value="15">15 días</option>
            <option value="30">30 días</option>
            <option value="45">45 días</option>
            <option value="60">60 días</option>
            <option value="90">90 días</option>
          </select>
          <input
            type="number"
            value={formData.dias_credito}
            onChange={(e) =>
              handleChange({
                target: { name: "dias_credito", value: e.target.value },
              })
            }
            disabled={
              mode === "view" || isLoading || formData.tipo_pago === "Contado"
            }
            placeholder="Manual"
            min="0"
            className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>
        {formErrors.dias_credito && (
          <p className="mt-1 text-xs text-red-600">{formErrors.dias_credito}</p>
        )}
      </div>

      {/* Contactos dinámicos */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-xs font-medium text-gray-700">
            Contactos *
          </label>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={agregarContacto}
            className="text-xs"
            icon={Plus}
          >
            Agregar Contacto
          </Button>
        </div>

        {contactos.map((contacto, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 border border-gray-200 rounded"
          >
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Tipo de Contacto *
              </label>
              <select
                value={contacto.tipo}
                onChange={(e) =>
                  handleContactoChange(index, "tipo", e.target.value)
                }
                disabled={mode === "view" || isLoading}
                className={`w-full px-3 py-1.5 text-sm border ${
                  contactosErrors[index]?.tipo
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
              >
                <option value="">Seleccionar tipo</option>
                {tiposContacto.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {contactosErrors[index]?.tipo && (
                <p className="mt-1 text-xs text-red-600">
                  {contactosErrors[index].tipo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={contacto.nombre}
                onChange={(e) =>
                  handleContactoChange(index, "nombre", e.target.value)
                }
                disabled={mode === "view" || isLoading}
                placeholder="Nombre del contacto"
                className={`w-full px-3 py-1.5 text-sm border ${
                  contactosErrors[index]?.nombre
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
              />
              {contactosErrors[index]?.nombre && (
                <p className="mt-1 text-xs text-red-600">
                  {contactosErrors[index].nombre}
                </p>
              )}
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">
                  Teléfono *
                </label>
                <input
                  type="text"
                  value={contacto.telefono}
                  onChange={(e) =>
                    handleContactoChange(index, "telefono", e.target.value)
                  }
                  disabled={mode === "view" || isLoading}
                  placeholder="Teléfono"
                  className={`w-full px-3 py-1.5 text-sm border ${
                    contactosErrors[index]?.telefono
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
                />
                {contactosErrors[index]?.telefono && (
                  <p className="mt-1 text-xs text-red-600">
                    {contactosErrors[index].telefono}
                  </p>
                )}
              </div>

              {contactos.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarContacto(index)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  title="Eliminar contacto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cuentas de Facturación */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <label className="block text-xs font-medium text-gray-700">
              Cuentas de Facturación *
            </label>
            {formErrors.cuentas_facturacion && (
              <span className="text-xs text-red-600">
                {formErrors.cuentas_facturacion}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={agregarCuenta}
            className="text-xs"
            icon={Plus}
          >
            Agregar Cuenta
          </Button>
        </div>

        {cuentasFacturacion.map((cuenta, index) => (
          <div
            key={index}
            className="mb-3 p-3 border border-gray-200 rounded bg-gray-50"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-700">
                  Cuenta de Facturación #{index + 1}
                </span>
                {cuenta.es_principal && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Principal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => establecerComoPrincipal(index)}
                  className="p-1 text-yellow-500 hover:bg-yellow-50 rounded"
                  title={
                    cuenta.es_principal
                      ? "Cuenta principal"
                      : "Establecer como principal"
                  }
                >
                  {cuenta.es_principal ? (
                    <Star className="h-4 w-4 fill-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </button>
                {cuentasFacturacion.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarCuenta(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Eliminar cuenta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">
                  Nombre de la Cuenta *
                </label>
                <input
                  type="text"
                  value={cuenta.nombre_cuenta}
                  onChange={(e) =>
                    handleCuentaChange(index, "nombre_cuenta", e.target.value)
                  }
                  disabled={mode === "view" || isLoading}
                  placeholder="Ej: Obra Lima Sur, Administración Central"
                  className={`w-full px-3 py-1.5 text-sm border ${
                    cuentasErrors[index]?.nombre_cuenta
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
                />
                {cuentasErrors[index]?.nombre_cuenta && (
                  <p className="mt-1 text-xs text-red-600">
                    {cuentasErrors[index].nombre_cuenta}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Tipo de Pago *
                </label>
                <select
                  value={cuenta.tipo_pago}
                  onChange={(e) =>
                    handleCuentaChange(index, "tipo_pago", e.target.value)
                  }
                  disabled={mode === "view" || isLoading}
                  className={`w-full px-3 py-1.5 text-sm border ${
                    cuentasErrors[index]?.tipo_pago
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Contado">Contado</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Crédito Factoring">Crédito Factoring</option>
                </select>
                {cuentasErrors[index]?.tipo_pago && (
                  <p className="mt-1 text-xs text-red-600">
                    {cuentasErrors[index].tipo_pago}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Estado *
                </label>
                <select
                  value={cuenta.estado}
                  onChange={(e) =>
                    handleCuentaChange(index, "estado", e.target.value)
                  }
                  disabled={mode === "view" || isLoading}
                  className={`w-full px-3 py-1.5 text-sm border ${
                    cuentasErrors[index]?.estado
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
                >
                  <option value="">Seleccionar estado</option>
                  {estadosCuenta.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
                {cuentasErrors[index]?.estado && (
                  <p className="mt-1 text-xs text-red-600">
                    {cuentasErrors[index].estado}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Días de Crédito {cuenta.tipo_pago === "Crédito" ? "*" : ""}
                </label>
                <input
                  type="number"
                  value={cuenta.dias_credito}
                  onChange={(e) =>
                    handleCuentaChange(
                      index,
                      "dias_credito",
                      parseInt(e.target.value) || 0
                    )
                  }
                  disabled={
                    mode === "view" ||
                    isLoading ||
                    cuenta.tipo_pago !== "Crédito"
                  }
                  min="0"
                  placeholder={
                    cuenta.tipo_pago === "Crédito" ? "Ingrese días" : "N/A"
                  }
                  className={`w-full px-3 py-1.5 text-sm border ${
                    cuentasErrors[index]?.dias_credito
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
                />
                {cuentasErrors[index]?.dias_credito && (
                  <p className="mt-1 text-xs text-red-600">
                    {cuentasErrors[index].dias_credito}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Límite de Crédito (S/) *
                </label>
                <input
                  type="number"
                  value={cuenta.limite_credito}
                  onChange={(e) =>
                    handleCuentaChange(
                      index,
                      "limite_credito",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={mode === "view" || isLoading}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-3 py-1.5 text-sm border ${
                    cuentasErrors[index]?.limite_credito
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
                />
                {cuentasErrors[index]?.limite_credito && (
                  <p className="mt-1 text-xs text-red-600">
                    {cuentasErrors[index].limite_credito}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">
                  Dirección de Origen (opcional)
                </label>
                <input
                  type="text"
                  value={cuenta.direccion_origen || ""}
                  onChange={(e) =>
                    handleCuentaChange(
                      index,
                      "direccion_origen",
                      e.target.value
                    )
                  }
                  disabled={mode === "view" || isLoading}
                  placeholder="Ej: Almacén Central, Planta Norte, etc."
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional (opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email (opcional)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="correo@empresa.com"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Dirección (opcional)
          </label>
          <input
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="Dirección completa"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Website (opcional)
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="https://www.empresa.com"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Observaciones (opcional)
        </label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          disabled={mode === "view" || isLoading}
          rows="2"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          placeholder="Información adicional relevante..."
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
            {mode === "create" ? "Crear Cliente" : "Guardar"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default React.memo(ClienteForm);
