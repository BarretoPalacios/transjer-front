import axiosInstance from "../axiosConfig";

export const monitoreoAPI = {
  getFletes: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const page = filters.page || 1;
    const pageSize = filters.page_size || 10;

    params.append("page", page);
    params.append("page_size", pageSize);

    // === Filtros del Flete ===
    if (filters.codigo_flete)
      params.append("codigo_flete", filters.codigo_flete);
    if (filters.estado_flete)
      params.append("estado_flete", filters.estado_flete);
    if (
      filters.pertenece_a_factura !== undefined &&
      filters.pertenece_a_factura !== null
    ) {
      params.append("pertenece_a_factura", filters.pertenece_a_factura);
    }
    if (filters.codigo_factura)
      params.append("codigo_factura", filters.codigo_factura);
    if (filters.monto_min) params.append("monto_min", filters.monto_min);
    if (filters.monto_max) params.append("monto_max", filters.monto_max);

    // === Filtros del Servicio Asociado ===
    if (filters.cliente) params.append("cliente", filters.cliente);
    if (filters.proveedor) params.append("proveedor", filters.proveedor);
    if (filters.placa) params.append("placa", filters.placa);
    if (filters.conductor) params.append("conductor", filters.conductor);
    if (filters.tipo_servicio)
      params.append("tipo_servicio", filters.tipo_servicio);
    if (filters.zona) params.append("zona", filters.zona);
    if (filters.estado_servicio)
      params.append("estado_servicio", filters.estado_servicio);

    // === Filtros de Fecha del Servicio ===
    if (filters.fecha_servicio_desde) {
      params.append(
        "fecha_servicio_desde",
        formatDateToISO(filters.fecha_servicio_desde),
      );
    }
    if (filters.fecha_servicio_hasta) {
      params.append(
        "fecha_servicio_hasta",
        formatDateToISO(filters.fecha_servicio_hasta),
      );
    }

    // === Filtros de Fecha del Flete ===
    if (filters.fecha_creacion_desde) {
      params.append(
        "fecha_creacion_desde",
        formatDateToISO(filters.fecha_creacion_desde),
      );
    }
    if (filters.fecha_creacion_hasta) {
      params.append(
        "fecha_creacion_hasta",
        formatDateToISO(filters.fecha_creacion_hasta),
      );
    }

    const response = await axiosInstance.get(
      `/monitoreo/fletes?${params.toString()}`,
    );
    // console.log(response)
    return response.data;
  },

  getMetricsClientes: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.month) params.append("month", filters.month);
    if (filters.year) params.append("year", filters.year);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await axiosInstance.get(
      `/monitoreo/get_metrics_by_client?${params.toString()}`,
    );
    // console.log(response)
    return response.data;
  },

  getMetricsPlacas: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.month) params.append("month", filters.month);
    if (filters.year) params.append("year", filters.year);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await axiosInstance.get(
      `/monitoreo/get_metrics_by_specific_plates?${params.toString()}`,
    );
    // console.log(response)
    return response.data;
  },

  getMetricsProveedores: async (filters = {}) => {
    const params = new URLSearchParams();

    // Parámetros de paginación
    const month = filters.month;
    const year = filters.year;

    params.append("month", month);
    params.append("year", year);

    const response = await axiosInstance.get(
      `/monitoreo/get_metrics_by_provider?${params.toString()}`,
    );
    // console.log(response)
    return response.data;
  },
};

export const formatDateToISO = (fecha) => {
  if (!fecha) return null;

  // Si ya es ISO string
  if (typeof fecha === "string" && fecha.includes("T")) {
    return fecha;
  }

  // Si es objeto Date
  if (fecha instanceof Date) {
    return fecha.toISOString();
  }

  // Si es string de fecha YYYY-MM-DD
  if (typeof fecha === "string") {
    return new Date(fecha).toISOString();
  }

  return null;
};
