import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SearchDropdown from "./SearchDropdown";
import { optionsDataAPI } from "./optionsData";
import { serviciosPrincipalesAPI } from "../../../api/endpoints/servicioPrincipal";
import { DISTRITOS_LIMA, DEPARTAMENTOS_PERU } from "../../../data/destinosLimaProvincia";

const ServiceEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Obtener fecha actual
  const getCurrentDate = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Obtener mes actual
  const getCurrentMonth = useCallback(() => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[new Date().getMonth()];
  }, []);

  // Valores predeterminados para M3
  const m3Options = [
    { value: "1.5", label: "1.5 M3" },
    { value: "3", label: "3 M3" },
    { value: "5", label: "5 M3" },
    { value: "7", label: "7 M3" },
    { value: "10", label: "10 M3" },
    { value: "15", label: "15 M3" },
    { value: "20", label: "20 M3" },
    { value: "25", label: "25 M3" },
    { value: "30", label: "30 M3" },
    { value: "otro", label: "Otro (especificar)" },
  ];

  // Valores predeterminados para TN
  const tnOptions = [
    { value: "1", label: "1 TN" },
    { value: "2", label: "2 TN" },
    { value: "3", label: "3 TN" },
    { value: "5", label: "5 TN" },
    { value: "8", label: "8 TN" },
    { value: "10", label: "10 TN" },
    { value: "15", label: "15 TN" },
    { value: "20", label: "20 TN" },
    { value: "25", label: "25 TN" },
    { value: "otro", label: "Otro (especificar)" },
  ];

  // Horas de cita cada 30 minutos
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourStr = hour.toString().padStart(2, "0");
        const minuteStr = minute.toString().padStart(2, "0");
        const time = `${hourStr}:${minuteStr}`;
        const displayTime = `${hourStr}:${minuteStr}`;
        options.push({ value: time, label: displayTime });
      }
    }
    return options;
  };

  // Opciones para solicitud
  const solicitudOptions = [
    { value: "Dia", label: "DÍA" },
    { value: "Tarde", label: "TARDE" },
    { value: "Noche", label: "NOCHE" },
  ];

  // Opciones para zona
  const zonaOptions = [
    { value: "lima", label: "Lima" },
    { value: "provincia", label: "Provincia" },
  ];

  const [formData, setFormData] = useState(() => ({
    cliente: null,
    cuenta: null,
    proveedor: null,
    m3: "",
    m3Custom: "",
    tn: "",
    tnCustom: "",
    flota: null,
    conductor: [],
    auxiliar: [],
    origen: "",
    destino: "",
    tipoServicio: "",
    tipoServicioCustom: "",
    modalidad: "",
    modalidadCustom: "",
    fechaServicio: getCurrentDate(),
    fechaSalida: getCurrentDate(),
    horaCita: "08:00",
    giaRr: "",
    giaRt: "",
    mes: getCurrentMonth(),
    solicitud: "Dia",
    zona: "lima",
    descripcion: "",
    destinoPersonalizado: "",
    tipoCamionAuto: "",
  }));

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [modalidades, setModalidades] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [timeOptions] = useState(() => generateTimeOptions());
  const [showM3Custom, setShowM3Custom] = useState(false);
  const [showTNCustom, setShowTNCustom] = useState(false);
  const [showTipoServicioCustom, setShowTipoServicioCustom] = useState(false);
  const [showModalidadCustom, setShowModalidadCustom] = useState(false);
  const [showDestinoPersonalizado, setShowDestinoPersonalizado] = useState(false);

  // ============= CARGAR DATOS DEL SERVICIO POR ID =============
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!id) return;

      try {
        setInitialLoading(true);
        // 1. Obtener los datos del servicio desde el backend
        const servicioData = await serviciosPrincipalesAPI.getServicioPrincipalById(id);
        
        console.log("Datos recibidos del backend:", servicioData);

        // 2. Obtener datos fijos (modalidades y tipos de servicio)
        const [modalidadesData, tiposData] = await Promise.all([
          optionsDataAPI.getModalidades(),
          optionsDataAPI.getTiposServicioForSelect(),
        ]);

        if (Array.isArray(modalidadesData)) {
          setModalidades(modalidadesData.map((m) => ({ id: m, nombre: m })));
        }

        if (Array.isArray(tiposData)) {
          setTiposServicio(tiposData.map((t) => ({ id: t, nombre: t })));
        }

        // 3. Mapear los datos del servicio al estado del formulario
        const mappedData = {
          // Información básica
          cliente: servicioData.cliente || null,
          cuenta: servicioData.cuenta || null,
          proveedor: servicioData.proveedor || null,

          // Medidas y capacidad
          m3: servicioData.m3 || "",
          m3Custom: m3Options.some(opt => opt.value === servicioData.m3) ? "" : servicioData.m3,
          tn: servicioData.tn || "",
          tnCustom: tnOptions.some(opt => opt.value === servicioData.tn) ? "" : servicioData.tn,

          // Personal y vehículo
          flota: servicioData.flota || null,
          conductor: Array.isArray(servicioData.conductor) ? servicioData.conductor : [],
          auxiliar: Array.isArray(servicioData.auxiliar) ? servicioData.auxiliar : [],

          // Ruta y servicio
          origen: servicioData.origen || "",
          destino: servicioData.destino || "",
          tipoServicio: servicioData.tipo_servicio || "",
          tipoServicioCustom: "",
          modalidad: servicioData.modalidad_servicio || "",
          modalidadCustom: "",

          // Fechas y horarios
          fechaServicio: servicioData.fecha_servicio || getCurrentDate(),
          fechaSalida: servicioData.fecha_salida || getCurrentDate(),
          horaCita: servicioData.hora_cita || "08:00",

          // Documentación
          giaRr: servicioData.gia_rr || "",
          giaRt: servicioData.gia_rt || "",
          mes: servicioData.mes || getCurrentMonth(),
          solicitud: servicioData.solicitud || "Dia",
          zona: servicioData.zona || "lima",

          // Información adicional
          descripcion: servicioData.descripcion || "",
          tipoCamionAuto: servicioData.tipo_camion || "",
          destinoPersonalizado: "",
        };

        // 4. Manejar campos personalizados para M3 y TN
        if (!m3Options.some(opt => opt.value === servicioData.m3) && servicioData.m3) {
          setShowM3Custom(true);
          mappedData.m3 = "otro";
        }

        if (!tnOptions.some(opt => opt.value === servicioData.tn) && servicioData.tn) {
          setShowTNCustom(true);
          mappedData.tn = "otro";
        }

        // 5. Manejar tipo de servicio personalizado
        const tipoExists = tiposData?.includes(servicioData.tipo_servicio);
        if (servicioData.tipo_servicio && !tipoExists) {
          setShowTipoServicioCustom(true);
          mappedData.tipoServicio = "otro";
          mappedData.tipoServicioCustom = servicioData.tipo_servicio;
        }

        // 6. Manejar modalidad personalizada
        const modalidadExists = modalidadesData?.includes(servicioData.modalidad_servicio);
        if (servicioData.modalidad_servicio && !modalidadExists) {
          setShowModalidadCustom(true);
          mappedData.modalidad = "otro";
          mappedData.modalidadCustom = servicioData.modalidad_servicio;
        }

        if (servicioData.destino && 
    !DISTRITOS_LIMA.includes(servicioData.destino) && 
    !DEPARTAMENTOS_PERU.includes(servicioData.destino)) {
  // Es un destino personalizado
  setShowDestinoPersonalizado(true);
  mappedData.destinoPersonalizado = servicioData.destino;
  mappedData.destino = ""; // Dejar vacío el select
}

        setFormData(mappedData);

      } catch (error) {
        console.error("Error cargando datos del servicio:", error);
        alert("Error al cargar los datos del servicio. Por favor, intente nuevamente.");
        navigate("/servicios");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchServiceData();
  }, [id, getCurrentDate, getCurrentMonth, navigate]);

  // ============= FUNCIONES FETCH =============
  const fetchClientes = useCallback(
    async (search = "", page = 1, pageSize = 10) => {
      try {
        const response = await optionsDataAPI.getClientesForSelect(
          search,
          page,
          pageSize
        );

        return {
          items: response.items.map((cliente) => ({
            ...cliente,
            id: cliente.id,
            nombre: cliente.razon_social || cliente.nombre || "Sin nombre",
            ruc: cliente.numero_documento || "",
          })),
          hasNext: response.hasNext || false,
        };
      } catch (error) {
        console.error("Error obteniendo clientes:", error);
        return { items: [], hasNext: false };
      }
    },
    []
  );

  const fetchCuentas = useCallback(
    async (search = "", page = 1, pageSize = 10) => {
      try {
        if (!formData.cliente?.id) {
          return { items: [], hasNext: false };
        }

        const response = await optionsDataAPI.getCuentasForSelect(
          formData.cliente.id,
          search,
          page,
          pageSize
        );

        if (!response || !response.items) {
          return { items: [], hasNext: false };
        }

        const items = response.items.map((cuenta) => ({
          ...cuenta,
          id: cuenta.id || cuenta._id,
          nombre: cuenta.nombre || cuenta.nombre_cuenta || "Sin nombre",
          tipo_pago: cuenta.tipo_pago || "",
          direccion_origen: cuenta.direccion_origen || "",
          nombre_conductor: cuenta.nombre_conductor || "",
        }));

        return {
          items,
          hasNext: response.hasNext || false,
        };
      } catch (error) {
        console.error("Error obteniendo cuentas:", error);
        return { items: [], hasNext: false };
      }
    },
    [formData.cliente?.id]
  );

  const fetchProveedores = useCallback(
    async (search = "", page = 1, pageSize = 10) => {
      try {
        const response = await optionsDataAPI.getProveedoresForSelect(
          search,
          page,
          pageSize
        );
        return {
          items: response.items.map((proveedor) => ({
            ...proveedor,
            id: proveedor.id,
            nombre: proveedor.razon_social || proveedor.nombre || "Sin nombre",
            ruc: proveedor.numero_documento || "",
          })),
          hasNext: response.hasNext || false,
        };
      } catch (error) {
        console.error("Error obteniendo proveedores:", error);
        return { items: [], hasNext: false };
      }
    },
    []
  );

  const fetchConductores = useCallback(
    async (search = "", page = 1, pageSize = 10) => {
      try {
        const response = await optionsDataAPI.getConductoresForSelect(
          search,
          page,
          pageSize
        );
        return {
          items: response.items.map((conductor) => ({
            ...conductor,
            id: conductor.id,
            nombre: conductor.nombres_completos || "Sin nombre",
            licencia: conductor.licencia_conducir || "",
            dni: conductor.dni || "",
          })),
          hasNext: response.hasNext || false,
        };
      } catch (error) {
        console.error("Error obteniendo conductores:", error);
        return { items: [], hasNext: false };
      }
    },
    []
  );

  const fetchAuxiliares = useCallback(
    async (search = "", page = 1, pageSize = 10) => {
      try {
        const response = await optionsDataAPI.getAuxiliaresForSelect(
          search,
          page,
          pageSize
        );
        return {
          items: response.items.map((auxiliar) => ({
            ...auxiliar,
            id: auxiliar.id,
            nombre: auxiliar.nombres_completos || "Sin nombre",
            dni: auxiliar.dni || "",
          })),
          hasNext: response.hasNext || false,
        };
      } catch (error) {
        console.error("Error obteniendo auxiliares:", error);
        return { items: [], hasNext: false };
      }
    },
    []
  );

  const fetchVehiculos = useCallback(
    async (search = "", page = 1, pageSize = 10) => {
      try {
        const response = await optionsDataAPI.getVehiculosForSelect(
          search,
          page,
          pageSize
        );
        return {
          items: response.items.map((vehiculo) => ({
            ...vehiculo,
            id: vehiculo.id,
            nombre: `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`,
            placa: vehiculo.placa,
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            capacidad_m3: vehiculo.capacidad_m3 || vehiculo.m3 || "",
            tipo_vehiculo: vehiculo.tipo_vehiculo || vehiculo.tipo || "",
            nombre_conductor: vehiculo.nombre_conductor || "",
          })),
          hasNext: response.hasNext || false,
        };
      } catch (error) {
        console.error("Error obteniendo vehículos:", error);
        return { items: [], hasNext: false };
      }
    },
    []
  );

  // ============= HANDLERS =============
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClienteChange = useCallback((value) => {
    setFormData((prev) => ({
      ...prev,
      cliente: value,
      cuenta: null,
      origen: "",
    }));
  }, []);

  const handleCuentaChange = useCallback((value) => {
    const newFormData = { cuenta: value };
    
    // Si la cuenta tiene dirección_origen, establecerla en origen
    if (value?.direccion_origen) {
      newFormData.origen = value.direccion_origen;
    }
    
    // Si la cuenta tiene nombre_conductor, agregarlo a conductores
    if (value?.nombre_conductor) {
      const conductorExists = formData.conductor.some(
        cond => cond.nombre === value.nombre_conductor
      );
      
      if (!conductorExists) {
        const newConductor = {
          id: `temp-${Date.now()}`,
          nombre: value.nombre_conductor,
          licencia: "",
          dni: "",
        };
        newFormData.conductor = [...formData.conductor, newConductor];
      }
    }
    
    setFormData(prev => ({ ...prev, ...newFormData }));
  }, [formData.conductor]);

  const handleM3Change = useCallback((e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, m3: value }));

    if (value === "otro") {
      setShowM3Custom(true);
      setFormData((prev) => ({ ...prev, m3Custom: "" }));
    } else {
      setShowM3Custom(false);
      setFormData((prev) => ({ ...prev, m3Custom: "" }));
    }
  }, []);

  const handleTNChange = useCallback((e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, tn: value }));

    if (value === "otro") {
      setShowTNCustom(true);
      setFormData((prev) => ({ ...prev, tnCustom: "" }));
    } else {
      setShowTNCustom(false);
      setFormData((prev) => ({ ...prev, tnCustom: "" }));
    }
  }, []);

  const handleTipoServicioChange = useCallback((e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, tipoServicio: value }));

    if (value === "otro") {
      setShowTipoServicioCustom(true);
      setFormData((prev) => ({ ...prev, tipoServicioCustom: "" }));
    } else {
      setShowTipoServicioCustom(false);
      setFormData((prev) => ({ ...prev, tipoServicioCustom: "" }));
    }
    
    // Resetear destino cuando cambia el tipo de servicio
    setFormData(prev => ({ ...prev, destino: "", destinoPersonalizado: "" }));
    setShowDestinoPersonalizado(false);
  }, []);

  const handleModalidadChange = useCallback((e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, modalidad: value }));

    if (value === "otro") {
      setShowModalidadCustom(true);
      setFormData((prev) => ({ ...prev, modalidadCustom: "" }));
    } else {
      setShowModalidadCustom(false);
      setFormData((prev) => ({ ...prev, modalidadCustom: "" }));
    }
  }, []);

  const handleDestinoChange = useCallback((e) => {
    const value = e.target.value;
    if (value === "personalizado") {
      setShowDestinoPersonalizado(true);
      setFormData(prev => ({ 
        ...prev, 
        destino: "", 
        destinoPersonalizado: "" 
      }));
    } else {
      setShowDestinoPersonalizado(false);
      setFormData(prev => ({ 
        ...prev, 
        destino: value,
        destinoPersonalizado: "" 
      }));
    }
  }, []);

  const handleFlotaChange = useCallback((vehiculo) => {
    const newFormData = {
      flota: vehiculo,
      ...(vehiculo?.tipo_vehiculo && {
        tipoCamionAuto: vehiculo.tipo_vehiculo,
      }),
    };
    
    // Si el vehículo tiene nombre_conductor, agregarlo a conductores
    if (vehiculo?.nombre_conductor) {
      const conductorExists = formData.conductor.some(
        cond => cond.nombre === vehiculo.nombre_conductor
      );
      
      if (!conductorExists) {
        const newConductor = {
          id: `temp-vehiculo-${Date.now()}`,
          nombre: vehiculo.nombre_conductor,
          licencia: "",
          dni: "",
        };
        newFormData.conductor = [...formData.conductor, newConductor];
      }
    }
    
    setFormData(prev => ({ ...prev, ...newFormData }));
  }, [formData.conductor]);

  const handleAddConductor = useCallback((conductor) => {
    if (!conductor) return;

    setFormData((prev) => {
      const current = Array.isArray(prev.conductor) ? prev.conductor : [];
      const exists = current.some((item) => item.id === conductor.id);

      if (exists) {
        return {
          ...prev,
          conductor: current.filter((item) => item.id !== conductor.id),
        };
      } else {
        return {
          ...prev,
          conductor: [...current, conductor],
        };
      }
    });
  }, []);

  const handleAddAuxiliar = useCallback((auxiliar) => {
    if (!auxiliar) return;

    setFormData((prev) => {
      const current = Array.isArray(prev.auxiliar) ? prev.auxiliar : [];
      const exists = current.some((item) => item.id === auxiliar.id);

      if (exists) {
        return {
          ...prev,
          auxiliar: current.filter((item) => item.id !== auxiliar.id),
        };
      } else {
        return {
          ...prev,
          auxiliar: [...current, auxiliar],
        };
      }
    });
  }, []);

  const handleRemoveConductor = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      conductor: prev.conductor.filter((item) => item.id !== id),
    }));
  }, []);

  const handleRemoveAuxiliar = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      auxiliar: prev.auxiliar.filter((item) => item.id !== id),
    }));
  }, []);

  // ============= HANDLER PARA ACTUALIZAR =============
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        // Validar campos requeridos
        const requiredFields = [
          { field: "cliente", label: "Cliente" },
          { field: "cuenta", label: "Cuenta" },
          { field: "proveedor", label: "Proveedor" },
          { field: "m3", label: "M3" },
          { field: "tn", label: "TN" },
          { field: "flota", label: "Placa" },
          { field: "origen", label: "Origen" },
          // { field: "destino", label: "Destino" },
          { field: "conductor", label: "Conductor" },
          { field: "fechaServicio", label: "Fecha de Servicio" },
          { field: "fechaSalida", label: "Fecha de Salida" },
          { field: "horaCita", label: "Hora de Cita" },
          { field: "tipoServicio", label: "Tipo de Servicio" },
          { field: "modalidad", label: "Modalidad" },
          { field: "zona", label: "Zona" },
          { field: "solicitud", label: "Solicitud" },
          { field: "mes", label: "Mes" },
          // { field: "giaRr", label: "GIA RR" },
          { field: "giaRt", label: "GIA RT" },
        ];

        for (const { field, label } of requiredFields) {
          if (
            !formData[field] ||
            (Array.isArray(formData[field]) && formData[field].length === 0)
          ) {
            alert(`El campo ${label} es requerido`);
            setLoading(false);
            return;
          }
        }

        // Determinar valores finales
        const finalM3 = formData.m3 === "otro" ? formData.m3Custom : formData.m3;
        const finalTN = formData.tn === "otro" ? formData.tnCustom : formData.tn;
        const finalTipoServicio = formData.tipoServicio === "otro"
          ? formData.tipoServicioCustom
          : formData.tipoServicio;
        const finalModalidad = formData.modalidad === "otro"
          ? formData.modalidadCustom
          : formData.modalidad;
        const finalDestino = showDestinoPersonalizado 
  ? formData.destinoPersonalizado 
  : formData.destino;

if (!finalDestino || finalDestino.trim() === "") {
  alert("El campo Destino es requerido");
  setLoading(false);
  return;
}

        const servicioData = {
          cliente: formData.cliente,
          cuenta: formData.cuenta,
          proveedor: formData.proveedor,
          m3: String(finalM3) || "0",
          tn: String(finalTN) || "0",
          flota: formData.flota,
          tipo_camion: formData.flota?.tipo_vehiculo || formData.tipoCamionAuto || "",
          conductor: formData.conductor,
          auxiliar: formData.auxiliar,
          origen: formData.origen,
          destino: finalDestino,
          tipo_servicio: finalTipoServicio,
          modalidad_servicio: finalModalidad,
          fecha_servicio: formData.fechaServicio,
          fecha_salida: formData.fechaSalida,
          hora_cita: formData.horaCita,
          gia_rr: formData.giaRr,
          gia_rt: formData.giaRt,
          mes: formData.mes,
          solicitud: formData.solicitud,
          zona: formData.zona,
          descripcion: formData.descripcion,
        };

        console.log("Datos a actualizar:", JSON.stringify(servicioData, null, 2));

        // Llamada a la API para actualizar
        await serviciosPrincipalesAPI.updateServicioPrincipal(id, servicioData);
        alert("Servicio actualizado exitosamente!");
        navigate("/servicios");

      } catch (error) {
        console.error("Error al actualizar servicio:", error);
        alert("Error al actualizar el servicio. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    },
    [formData, id, navigate, showDestinoPersonalizado]
  );

  const handleClearForm = useCallback(() => {
    if (
      window.confirm(
        "¿Está seguro de limpiar el formulario? Se perderán todos los cambios no guardados."
      )
    ) {
      setFormData({
        cliente: null,
        cuenta: null,
        proveedor: null,
        m3: "",
        m3Custom: "",
        tn: "",
        tnCustom: "",
        flota: null,
        conductor: [],
        auxiliar: [],
        origen: "",
        destino: "",
        tipoServicio: "",
        tipoServicioCustom: "",
        modalidad: "",
        modalidadCustom: "",
        fechaServicio: getCurrentDate(),
        fechaSalida: getCurrentDate(),
        horaCita: "08:00",
        giaRr: "",
        giaRt: "",
        mes: getCurrentMonth(),
        solicitud: "Dia",
        zona: "lima",
        descripcion: "",
        destinoPersonalizado: "",
        tipoCamionAuto: "",
      });

      setShowM3Custom(false);
      setShowTNCustom(false);
      setShowTipoServicioCustom(false);
      setShowModalidadCustom(false);
      setShowDestinoPersonalizado(false);
    }
  }, [getCurrentDate, getCurrentMonth]);

  // Calcular fecha mínima
  const minDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Opciones de destino basadas en tipo de servicio
  const destinoOptions = useMemo(() => {
    if (formData.tipoServicio === "Local") {
      return DISTRITOS_LIMA.map(distrito => ({
        value: distrito,
        label: distrito
      }));
    } else if (formData.tipoServicio === "Nacional") {
      return [
        ...DEPARTAMENTOS_PERU.map(depto => ({
          value: depto,
          label: depto
        })),
        // { value: "personalizado", label: "Personalizado..." }
      ];
    }
    return [];
  }, [formData.tipoServicio]);

  const cuentaDropdownKey = useMemo(() => {
    return `cuenta-dropdown-${formData.cliente?.id || "no-cliente"}`;
  }, [formData.cliente?.id]);

  // Mostrar loading mientras se cargan los datos iniciales
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del servicio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Editar Servicio de Transporte
              </h1>
              <p className="text-gray-600">
                ID: {id} • Modifique los campos necesarios
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/servicios")}
              disabled={loading}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECCIÓN 1: INFORMACIÓN PRINCIPAL */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Información Principal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <SearchDropdown
                    placeholder="Buscar cliente..."
                    value={formData.cliente}
                    onChange={handleClienteChange}
                    onFetch={fetchClientes}
                    displayKey="nombre"
                    secondaryKey="ruc"
                    required
                    showSearchIcon
                    disabled={loading}
                    initialLoad={true}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cuenta <span className="text-red-500">*</span>
                  </label>
                  <SearchDropdown
                    key={cuentaDropdownKey}
                    placeholder={
                      formData.cliente
                        ? "Buscar cuenta..."
                        : "Seleccione un cliente primero"
                    }
                    value={formData.cuenta}
                    onChange={handleCuentaChange}
                    onFetch={fetchCuentas}
                    displayKey="nombre"
                    secondaryKey="tipo_pago"
                    showSearchIcon
                    disabled={loading || !formData.cliente}
                    initialLoad={!!formData.cliente}
                  />
                  {!formData.cliente && (
                    <p className="mt-1 text-sm text-gray-500 italic">
                      Seleccione un cliente para ver y gestionar sus cuentas
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Proveedor <span className="text-red-500">*</span>
                  </label>
                  <SearchDropdown
                    placeholder="Buscar proveedor..."
                    value={formData.proveedor}
                    onChange={(value) => handleSelectChange("proveedor", value)}
                    onFetch={fetchProveedores}
                    displayKey="nombre"
                    secondaryKey="ruc"
                    showSearchIcon
                    disabled={loading}
                    initialLoad={true}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: MEDIDAS Y CAPACIDAD */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Medidas y Capacidad
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Metros Cúbicos (M3) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="m3"
                    value={formData.m3}
                    onChange={handleM3Change}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  >
                    <option value="">Seleccionar M3</option>
                    {m3Options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {showM3Custom && (
                    <div className="mt-2">
                      <input
                        type="number"
                        name="m3Custom"
                        value={formData.m3Custom}
                        onChange={handleInputChange}
                        placeholder="Especificar M3"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={loading}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Toneladas (TN) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tn"
                    value={formData.tn}
                    onChange={handleTNChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  >
                    <option value="">Seleccionar TN</option>
                    {tnOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {showTNCustom && (
                    <div className="mt-2">
                      <input
                        type="number"
                        name="tnCustom"
                        value={formData.tnCustom}
                        onChange={handleInputChange}
                        placeholder="Especificar TN"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={loading}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Placa <span className="text-red-500">*</span>
                  </label>
                  <SearchDropdown
                    placeholder="Buscar vehículo..."
                    value={formData.flota}
                    onChange={handleFlotaChange}
                    onFetch={fetchVehiculos}
                    displayKey="nombre"
                    secondaryKey="placa"
                    showSearchIcon
                    disabled={loading}
                    initialLoad={true}
                  />
                  {formData.flota?.tipo_vehiculo && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">
                          Tipo de camión detectado:
                        </span>{" "}
                        {formData.flota.tipo_vehiculo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: PERSONAL */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Conductores <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <SearchDropdown
                      placeholder="Buscar conductor..."
                      value={null}
                      onChange={handleAddConductor}
                      onFetch={fetchConductores}
                      displayKey="nombre"
                      secondaryKey="licencia"
                      showSearchIcon
                      disabled={loading}
                      initialLoad={true}
                    />

                    {formData.conductor.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {formData.conductor.map((conductor) => (
                          <div
                            key={conductor.id}
                            className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded"
                          >
                            <span className="text-sm">
                              {conductor.nombre} ({conductor.licencia})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveConductor(conductor.id)
                              }
                              className="text-red-500 hover:text-red-700"
                              disabled={loading}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Auxiliares
                  </label>
                  <div className="space-y-2">
                    <SearchDropdown
                      placeholder="Buscar auxiliar..."
                      value={null}
                      onChange={handleAddAuxiliar}
                      onFetch={fetchAuxiliares}
                      displayKey="nombre"
                      secondaryKey="dni"
                      showSearchIcon
                      disabled={loading}
                      initialLoad={true}
                    />

                    {formData.auxiliar.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {formData.auxiliar.map((auxiliar) => (
                          <div
                            key={auxiliar.id}
                            className="flex items-center justify-between bg-green-50 px-3 py-2 rounded"
                          >
                            <span className="text-sm">
                              {auxiliar.nombre} ({auxiliar.dni})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAuxiliar(auxiliar.id)}
                              className="text-red-500 hover:text-red-700"
                              disabled={loading}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: RUTA Y SERVICIO */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Ruta y Servicio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Tipo de Servicio */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Servicio <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipoServicio"
                    value={formData.tipoServicio}
                    onChange={handleTipoServicioChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  >
                    <option value="">Seleccionar tipo de servicio</option>
                    {tiposServicio.map((tipo) => (
                      <option key={tipo.id} value={tipo.nombre}>
                        {tipo.nombre}
                      </option>
                    ))}
                    <option value="otro">Otro (especificar)</option>
                  </select>
                  {showTipoServicioCustom && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="tipoServicioCustom"
                        value={formData.tipoServicioCustom}
                        onChange={handleInputChange}
                        placeholder="Especificar tipo de servicio"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={loading}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Modalidad */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Modalidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="modalidad"
                    value={formData.modalidad}
                    onChange={handleModalidadChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  >
                    <option value="">Seleccionar modalidad</option>
                    {modalidades.map((modalidad) => (
                      <option key={modalidad.id} value={modalidad.nombre}>
                        {modalidad.nombre}
                      </option>
                    ))}
                    <option value="otro">Otro (especificar)</option>
                  </select>
                  {showModalidadCustom && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="modalidadCustom"
                        value={formData.modalidadCustom}
                        onChange={handleInputChange}
                        placeholder="Especificar modalidad"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={loading}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Origen */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Origen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="origen"
                    value={formData.origen}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. Principal 123, Lima"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Destino */}
                {/* Destino */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Destino <span className="text-red-500">*</span>
  </label>
  {formData.tipoServicio && (formData.tipoServicio === "Local" || formData.tipoServicio === "Nacional") ? (
    <div className="space-y-2">
      <select
        name="destino"
        value={showDestinoPersonalizado ? "" : formData.destino}
        onChange={(e) => {
          if (e.target.value === "") return;
          setFormData(prev => ({ 
            ...prev, 
            destino: e.target.value 
          }));
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        disabled={loading || showDestinoPersonalizado}
      >
        <option value="">Seleccionar destino</option>
        {destinoOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Checkbox para destino personalizado */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="destinoPersonalizadoCheckbox"
          checked={showDestinoPersonalizado}
          onChange={(e) => {
            const checked = e.target.checked;
            setShowDestinoPersonalizado(checked);
            if (checked) {
              setFormData(prev => ({ 
                ...prev, 
                destino: "",
                destinoPersonalizado: formData.destino || "" // Copiar valor actual si existe
              }));
            } else {
              setFormData(prev => ({ 
                ...prev, 
                destinoPersonalizado: "" 
              }));
            }
          }}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={loading}
        />
        <label htmlFor="destinoPersonalizadoCheckbox" className="ml-2 text-sm text-gray-700">
          Usar destino personalizado
        </label>
      </div>
      
      {showDestinoPersonalizado && (
        <div className="mt-2">
          <input
            type="text"
            name="destinoPersonalizado"
            value={formData.destinoPersonalizado}
            onChange={handleInputChange}
            placeholder="Ingrese destino personalizado"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
            required={showDestinoPersonalizado}
          />
        </div>
      )}
    </div>
  ) : (
    <input
      type="text"
      name="destino"
      value={formData.destino}
      onChange={handleInputChange}
      placeholder="Ingrese destino"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      required
      disabled={loading}
    />
  )}
</div>

                {/* Solicitud */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Solicitud <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="solicitud"
                    value={formData.solicitud}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  >
                    {solicitudOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zona */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Zona <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="zona"
                    value={formData.zona}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  >
                    {zonaOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: FECHAS Y HORARIOS */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Fechas y Horarios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Servicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaServicio"
                    value={formData.fechaServicio}
                    onChange={handleInputChange}
                    // min={minDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Salida <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaSalida"
                    value={formData.fechaSalida}
                    onChange={handleInputChange}
                    // min={minDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hora de Cita <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="horaCita"
                    value={formData.horaCita}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  >
                    {timeOptions.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.mes}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 outline-none"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 6: DOCUMENTACIÓN */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Documentación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    GIA RR <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="giaRr"
                    value={formData.giaRr}
                    onChange={handleInputChange}
                    placeholder="Número GIA RR"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    GIA RT <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="giaRt"
                    value={formData.giaRt}
                    onChange={handleInputChange}
                    placeholder="Número GIA RT"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 7: DESCRIPCIÓN */}
            <div className="pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Descripción
              </h2>
              <div className="space-y-2">
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripciones adicionales, instrucciones especiales, comentarios..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={handleClearForm}
                disabled={loading}
                className="sm:flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Restablecer Cambios
              </button>
              <button
                type="submit"
                disabled={loading}
                className="sm:flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Actualizando Servicio...
                  </span>
                ) : (
                  "Guardar Cambios"
                )}
              </button>
            </div>
          </form>

          {/* VISTA PREVIA */}
          {(formData.cliente || formData.origen || formData.destino) && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-4 text-lg">
                Resumen del Servicio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {formData.cliente && (
                  <div>
                    <p className="font-semibold text-blue-700">Cliente:</p>
                    <p className="text-blue-600">{formData.cliente.nombre}</p>
                    {formData.cliente.ruc && (
                      <p className="text-blue-500 text-xs">
                        RUC: {formData.cliente.ruc}
                      </p>
                    )}
                  </div>
                )}
                {formData.origen && (
                  <div>
                    <p className="font-semibold text-blue-700">Origen:</p>
                    <p className="text-blue-600">{formData.origen}</p>
                  </div>
                )}
                {formData.destino && (
                  <div>
                    <p className="font-semibold text-blue-700">Destino:</p>
                    <p className="text-blue-600">{formData.destino}</p>
                  </div>
                )}
                {formData.tipoServicio && (
                  <div>
                    <p className="font-semibold text-blue-700">Tipo de Servicio:</p>
                    <p className="text-blue-600">{formData.tipoServicio}</p>
                  </div>
                )}
                {formData.flota && (
                  <div>
                    <p className="font-semibold text-blue-700">Vehículo:</p>
                    <p className="text-blue-600">{formData.flota.placa}</p>
                  </div>
                )}
                {formData.fechaServicio && (
                  <div>
                    <p className="font-semibold text-blue-700">Fecha Servicio:</p>
                    <p className="text-blue-600">{formData.fechaServicio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceEditForm;