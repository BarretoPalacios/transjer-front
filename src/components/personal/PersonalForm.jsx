import React, { useState, useEffect } from "react";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";
import { Save, X, Search } from "lucide-react";

// Data
const tiposPersonal = [
  { value: "Conductor", label: "Conductor" },
  { value: "Auxiliar", label: "Auxiliar" },
  { value: "Operario", label: "Operario" },
  { value: "Administrativo", label: "Administrativo" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Mecánico", label: "Mecánico" },
  { value: "Almacenero", label: "Almacenero" },
];

const estadosTrabajador = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
  { value: "Licencia", label: "Licencia" },
  { value: "Vacaciones", label: "Vacaciones" },
];

const turnosTrabajo = [
  { value: "Día", label: "Día" },
  { value: "Noche", label: "Noche" },
  { value: "Rotativo", label: "Rotativo" },
];

const categoriasLicencia = [
  // { value: "A-I", label: "A-I" },
  { value: "A-II-a", label: "A-II-a" },
  { value: "A-II-b", label: "A-II-b" },
  { value: "A-III-a", label: "A-III-a" },
  // { value: "A-III-b", label: "A-III-b" },
  { value: "A-III-c", label: "A-III-c" },

  { value: "A1", label: "A1" },
  { value: "A3C", label: "A3C "},
  { value: "A3B", label: "A3B" },
  { value: "A-III-b", label: "A-III-b" },
];

const bancosPeru = [
  { value: "BCP", label: "Banco de Crédito del Perú" },
  { value: "BBVA", label: "BBVA" },
  { value: "INTERBANK", label: "Interbank" },
  { value: "SCOTIABANK", label: "Scotiabank" },
  { value: "BANBIF", label: "BanBif" },
  { value: "BN", label: "Banco de la Nación" },
  { value: "MI_BANCO", label: "Mi Banco" },
  { value: "BANCO_PICHINCHA", label: "Banco Pichincha" },
];

const PersonalForm = ({
  initialData,
  onSubmit,
  onCancel,
  mode = "create",
  isLoading = false,
  error = null,
  ...props
}) => {
  const [formData, setFormData] = useState({
    dni: "",
    nombres_completos: "",
    tipo: "Operario",
    estado: "Activo",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    licencia_conducir: "",
    categoria_licencia: "",
    fecha_venc_licencia: "",
    turno: "",
    salario: "",
    banco: "",
    numero_cuenta: "",
    contacto_emergencia: "",
    telefono_emergencia: "",
    observaciones: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isConsultingDni, setIsConsultingDni] = useState(false);
  const [dniError, setDniError] = useState(null);
  const [isConductor, setIsConductor] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Formatear fechas para input type="date"
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const newData = {
        dni: initialData.dni || "",
        nombres_completos: initialData.nombres_completos || "",
        tipo: initialData.tipo || "Operario",
        estado: initialData.estado || "Activo",
        fecha_ingreso: formatDate(initialData.fecha_ingreso),
        fecha_nacimiento: formatDate(initialData.fecha_nacimiento),
        telefono: initialData.telefono || "",
        email: initialData.email || "",
        direccion: initialData.direccion || "",
        licencia_conducir: initialData.licencia_conducir || "",
        categoria_licencia: initialData.categoria_licencia || "",
        fecha_venc_licencia: formatDate(initialData.fecha_venc_licencia),
        turno: initialData.turno || "",
        salario: initialData.salario || "",
        banco: initialData.banco || "",
        numero_cuenta: initialData.numero_cuenta || "",
        contacto_emergencia: initialData.contacto_emergencia || "",
        telefono_emergencia: initialData.telefono_emergencia || "",
        observaciones: initialData.observaciones || "",
      };

      setFormData(newData);
      setIsConductor(newData.tipo === "Conductor");
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "salario") {
      processedValue = value === "" ? "" : value;
    }

    // Validar DNI solo números (8-15 caracteres)
    if (name === "dni") {
      // Solo permitir números
      if (!/^\d*$/.test(value) && value !== "") {
        return;
      }
      // Limitar a 15 caracteres máximo
      if (value.length > 15) {
        return;
      }
    }

    if (name === "tipo") {
      setIsConductor(value === "Conductor");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Limpiar error de DNI cuando se modifica el campo
    if (name === "dni") {
      setDniError(null);
    }
  };

  // const handleConsultarDni = async () => {
  //   if (!formData.dni.trim()) {
  //     setDniError("Ingrese un DNI para consultar");
  //     return;
  //   }

  //   if (formData.dni.length < 8) {
  //     setDniError("El DNI debe tener al menos 8 dígitos");
  //     return;
  //   }

  //   setIsConsultingDni(true);
  //   setDniError(null);

  //   try {
  //     // Aquí puedes integrar con un servicio de consulta de DNI si lo tienes
  //     // Por ahora, solo simularemos una consulta
  //     // const response = await personalAPI.consultarDni(formData.dni);
      
  //     // Simulando una respuesta exitosa
  //     setTimeout(() => {
  //       // En una implementación real, aquí obtendrías los datos del DNI
  //       setDniError("Servicio de consulta de DNI no disponible");
  //       setIsConsultingDni(false);
  //     }, 1000);

  //   } catch (error) {
  //     console.error("Error al consultar DNI:", error);
  //     setDniError(
  //       error.response?.data?.message ||
  //         "Error al consultar el DNI. Intente nuevamente."
  //     );
  //     setIsConsultingDni(false);
  //   }
  // };

  const validateForm = () => {
    const errors = {};

    // Validar DNI (8-15 dígitos, solo números)
    if (!formData.dni.trim()) {
      errors.dni = "El DNI es requerido";
    } else if (formData.dni.length < 8 || formData.dni.length > 15) {
      errors.dni = "El DNI debe tener entre 8 y 15 dígitos";
    } else if (!/^\d+$/.test(formData.dni)) {
      errors.dni = "El DNI debe contener solo números";
    }

    // Validar nombres completos (2-200 caracteres)
    if (!formData.nombres_completos.trim()) {
      errors.nombres_completos = "Los nombres completos son requeridos";
    } else if (formData.nombres_completos.length < 2 || formData.nombres_completos.length > 200) {
      errors.nombres_completos = "Los nombres completos deben tener entre 2 y 200 caracteres";
    }

    // Validar tipo de personal
    if (!formData.tipo) {
      errors.tipo = "El tipo de personal es requerido";
    }

    // Validar estado (opcional, pero si tiene valor debe ser válido)
    if (formData.estado && !estadosTrabajador.find(e => e.value === formData.estado)) {
      errors.estado = "Estado inválido";
    }

    // Validar fecha de ingreso (si existe)
    if (formData.fecha_ingreso) {
      const fechaIngreso = new Date(formData.fecha_ingreso);
      if (fechaIngreso > new Date()) {
        errors.fecha_ingreso = "La fecha de ingreso no puede ser futura";
      }
    }

    // Validar fecha de nacimiento (si existe)
    if (formData.fecha_nacimiento) {
      const fechaNacimiento = new Date(formData.fecha_nacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      
      if (fechaNacimiento > hoy) {
        errors.fecha_nacimiento = "La fecha de nacimiento no puede ser futura";
      } else if (edad < 18) {
        errors.fecha_nacimiento = "El trabajador debe ser mayor de edad (18 años)";
      }
    }

    // Validar teléfono (si existe)
    if (formData.telefono && !/^[\d\s\-\(\)\+]{7,}$/.test(formData.telefono)) {
      errors.telefono = "Formato de teléfono inválido";
    }

    // Validar email (si existe)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    // Validar campos específicos para conductores
    if (isConductor) {
      if (!formData.licencia_conducir.trim()) {
        errors.licencia_conducir = "La licencia de conducir es requerida para conductores";
      }

      if (!formData.categoria_licencia) {
        errors.categoria_licencia = "La categoría de licencia es requerida para conductores";
      }

      // if (!formData.fecha_venc_licencia) {
      //   errors.fecha_venc_licencia = "La fecha de vencimiento de licencia es requerida para conductores";
      // } else {
      //   const fechaVencimiento = new Date(formData.fecha_venc_licencia);
      //   const hoy = new Date();
      //   if (fechaVencimiento < hoy) {
      //     errors.fecha_venc_licencia = "La licencia está vencida";
      //   }
      // }
    }

    // Validar salario (si existe)
    if (formData.salario) {
      const salarioNum = parseFloat(formData.salario);
      if (isNaN(salarioNum) || salarioNum < 0) {
        errors.salario = "El salario debe ser un número positivo";
      }
    }

    // Validar teléfono de emergencia (si existe)
    if (formData.telefono_emergencia && !/^[\d\s\-\(\)\+]{7,}$/.test(formData.telefono_emergencia)) {
      errors.telefono_emergencia = "Formato de teléfono inválido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Preparar datos para enviar
      const dataToSubmit = {
        ...formData,
        // Convertir salario a número si existe
        salario: formData.salario ? parseFloat(formData.salario) : null,
        // Convertir fechas vacías a null
        fecha_ingreso: formData.fecha_ingreso || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        fecha_venc_licencia: formData.fecha_venc_licencia || null,
        // Mantener campos opcionales como están
        telefono: formData.telefono || null,
        email: formData.email || null,
        direccion: formData.direccion || null,
        licencia_conducir: formData.licencia_conducir || null,
        categoria_licencia: formData.categoria_licencia || null,
        turno: formData.turno || null,
        banco: formData.banco || null,
        numero_cuenta: formData.numero_cuenta || null,
        contacto_emergencia: formData.contacto_emergencia || null,
        telefono_emergencia: formData.telefono_emergencia || null,
        observaciones: formData.observaciones || null,
        estado: formData.estado || null,
      };

      // Eliminar campos vacíos que deben ser null
      Object.keys(dataToSubmit).forEach(key => {
        if (dataToSubmit[key] === "") {
          dataToSubmit[key] = null;
        }
      });

      onSubmit(dataToSubmit);
    }
  };

  const getCodigoPersonalLabel = () => {
    if (mode === "create") {
      return "Generado automáticamente";
    } else {
      return initialData?.codigo_personal || "Sin código";
    }
  };

  const isFormValid = () => {
    return formData.dni.trim() &&
           formData.nombres_completos.trim() &&
           formData.tipo &&
           (!formData.fecha_ingreso || new Date(formData.fecha_ingreso) <= new Date()) &&
           (!formData.fecha_nacimiento || (new Date(formData.fecha_nacimiento) <= new Date() && 
             new Date().getFullYear() - new Date(formData.fecha_nacimiento).getFullYear() >= 18));
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
            {estadosTrabajador.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Código Personal
          </label>
          <div
            className={`w-full px-3 py-1.5 border border-gray-300 rounded text-sm ${
              mode === "create"
                ? "bg-gray-100 text-gray-500"
                : "bg-gray-50 text-gray-700"
            }`}
          >
            {getCodigoPersonalLabel()}
          </div>
        </div>
      </div>

      {/* Segunda fila: Documentos y Nombre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            DNI *
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                placeholder="8-15 dígitos"
                maxLength="15"
                className={`flex-1 px-3 py-1.5 text-sm border ${
                  formErrors.dni ? "border-red-300" : "border-gray-300"
                } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
              />
              {/* <button
                type="button"
                onClick={handleConsultarDni}
                disabled={
                  mode === "view" ||
                  isLoading ||
                  isConsultingDni
                }
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Consultar DNI"
              >
                {isConsultingDni ? (
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button> */}
            </div>

            {dniError && <p className="text-xs text-red-600">{dniError}</p>}
            {formErrors.dni && (
              <p className="text-xs text-red-600">{formErrors.dni}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nombres Completos *
          </label>
          <input
            name="nombres_completos"
            value={formData.nombres_completos}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="Nombre y apellidos completos"
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.nombres_completos ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          />
          {formErrors.nombres_completos && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.nombres_completos}
            </p>
          )}
        </div>
      </div>

      {/* Tercera fila: Tipo y Turno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de Personal *
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.tipo ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          >
            {tiposPersonal.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          {formErrors.tipo && (
            <p className="mt-1 text-xs text-red-600">{formErrors.tipo}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Turno de Trabajo
          </label>
          <select
            name="turno"
            value={formData.turno}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="">Seleccionar turno</option>
            {turnosTrabajo.map((turno) => (
              <option key={turno.value} value={turno.value}>
                {turno.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cuarta fila: Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha de Ingreso
          </label>
          <input
            type="date"
            name="fecha_ingreso"
            value={formData.fecha_ingreso}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.fecha_ingreso ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          />
          {formErrors.fecha_ingreso && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.fecha_ingreso}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.fecha_nacimiento ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          />
          {formErrors.fecha_nacimiento && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.fecha_nacimiento}
            </p>
          )}
        </div>
      </div>

      {/* Quinta fila: Información de Contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="Ej: +51 987 654 321"
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.telefono ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          />
          {formErrors.telefono && (
            <p className="mt-1 text-xs text-red-600">{formErrors.telefono}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={mode === "view" || isLoading}
            placeholder="ejemplo@correo.com"
            className={`w-full px-3 py-1.5 text-sm border ${
              formErrors.email ? "border-red-300" : "border-gray-300"
            } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
          />
          {formErrors.email && (
            <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Dirección
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

      {/* Información de Licencia (solo para conductores) */}
      {isConductor && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-xs font-medium text-gray-700">
              Información de Licencia (Conductor)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Licencia de Conducir *
              </label>
              <input
                name="licencia_conducir"
                value={formData.licencia_conducir}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                placeholder="Ej: Q12345678"
                className={`w-full px-3 py-1.5 text-sm border ${
                  formErrors.licencia_conducir ? "border-red-300" : "border-gray-300"
                } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
              />
              {formErrors.licencia_conducir && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.licencia_conducir}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Categoría de Licencia *
              </label>
              <select
                name="categoria_licencia"
                value={formData.categoria_licencia}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                className={`w-full px-3 py-1.5 text-sm border ${
                  formErrors.categoria_licencia ? "border-red-300" : "border-gray-300"
                } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
              >
                <option value="">Seleccionar categoría</option>
                {categoriasLicencia.map((categoria) => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
              {formErrors.categoria_licencia && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.categoria_licencia}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha Vencimiento Licencia *
              </label>
              <input
                type="date"
                name="fecha_venc_licencia"
                value={formData.fecha_venc_licencia}
                onChange={handleChange}
                disabled={mode === "view" || isLoading}
                className={`w-full px-3 py-1.5 text-sm border ${
                  formErrors.fecha_venc_licencia ? "border-red-300" : "border-gray-300"
                } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
              />
              {formErrors.fecha_venc_licencia && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.fecha_venc_licencia}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información Económica */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-xs font-medium text-gray-700">
            Información Económica
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Salario Mensual (S/)
            </label>
            <input
              type="number"
              name="salario"
              value={formData.salario}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              placeholder="Ej: 3500.00"
              min="0"
              step="0.01"
              className={`w-full px-3 py-1.5 text-sm border ${
                formErrors.salario ? "border-red-300" : "border-gray-300"
              } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
            />
            {formErrors.salario && (
              <p className="mt-1 text-xs text-red-600">{formErrors.salario}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Banco
            </label>
            <select
              name="banco"
              value={formData.banco}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
            >
              <option value="">Seleccionar banco</option>
              {bancosPeru.map((banco) => (
                <option key={banco.value} value={banco.value}>
                  {banco.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Número de Cuenta
            </label>
            <input
              name="numero_cuenta"
              value={formData.numero_cuenta}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              placeholder="Ej: 001-123456-1-99"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-xs font-medium text-gray-700">
            Contacto de Emergencia
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nombre del Contacto
            </label>
            <input
              name="contacto_emergencia"
              value={formData.contacto_emergencia}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              placeholder="Nombre del contacto"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Teléfono de Emergencia
            </label>
            <input
              type="tel"
              name="telefono_emergencia"
              value={formData.telefono_emergencia}
              onChange={handleChange}
              disabled={mode === "view" || isLoading}
              placeholder="Ej: +51 987 123 456"
              className={`w-full px-3 py-1.5 text-sm border ${
                formErrors.telefono_emergencia ? "border-red-300" : "border-gray-300"
              } rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100`}
            />
            {formErrors.telefono_emergencia && (
              <p className="mt-1 text-xs text-red-600">
                {formErrors.telefono_emergencia}
              </p>
            )}
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
          rows="2"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
          placeholder="Observaciones adicionales..."
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
            disabled={!isFormValid() || isLoading}
            isLoading={isLoading}
            className="text-sm"
          >
            <Save className="h-3 w-3 mr-1" />
            {mode === "create" ? "Crear Personal" : "Guardar Cambios"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default React.memo(PersonalForm);