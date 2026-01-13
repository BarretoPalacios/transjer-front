// utils/flotaUtils.js
import {
  Truck,
  AlertTriangle,
  Calendar,
  Fuel,
  Settings,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

/**
 * Calcula los días restantes hasta una fecha de vencimiento
 * @param {string|Date} fechaVencimiento - Fecha de vencimiento
 * @returns {number} Días restantes (negativo si ya venció)
 */
export const calcularDiasRestantes = (fechaVencimiento) => {
  if (!fechaVencimiento) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día

  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0); // Normalizar a inicio del día

  const diffTime = vencimiento - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Determina el estado de un documento basado en su fecha de vencimiento
 * @param {string|Date} fechaVencimiento - Fecha de vencimiento
 * @returns {object} Objeto con estado, etiqueta y color
 */
export const getEstadoDocumento = (fechaVencimiento) => {
  if (!fechaVencimiento) {
    return {
      estado: "sin-datos",
      label: "Sin datos",
      color: "gray",
      icon: "AlertCircle",
    };
  }

  const diasRestantes = calcularDiasRestantes(fechaVencimiento);

  if (diasRestantes < 0) {
    return {
      estado: "vencido",
      label: "Vencido",
      color: "red",
      icon: "XCircle",
      diasRestantes,
    };
  } else if (diasRestantes <= 7) {
    return {
      estado: "urgente",
      label: `Vence en ${diasRestantes} día${diasRestantes !== 1 ? "s" : ""}`,
      color: "orange",
      icon: "AlertTriangle",
      diasRestantes,
    };
  } else if (diasRestantes <= 30) {
    return {
      estado: "por-vencer",
      label: `Vence en ${diasRestantes} días`,
      color: "yellow",
      icon: "Clock",
      diasRestantes,
    };
  } else {
    return {
      estado: "vigente",
      label: "Vigente",
      color: "green",
      icon: "CheckCircle",
      diasRestantes,
    };
  }
};

/**
 * Retorna las clases CSS para el color según el estado del documento
 * @param {string} estado - Estado del documento
 * @returns {string} Clases CSS para el color
 */
export const getEstadoDocumentoColor = (estado) => {
  switch (estado) {
    case "vigente":
      return "text-green-700 bg-green-50 border-green-200";
    case "por-vencer":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "urgente":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "vencido":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

/**
 * Obtiene el estado del peor documento de un vehículo
 * @param {object} flota - Objeto de flota con fechas de documentos
 * @returns {object} Estado del documento más crítico
 */
export const getPeorEstadoDocumento = (flota) => {
  const estados = [
    getEstadoDocumento(flota.revision_tecnica_vencimiento),
    getEstadoDocumento(flota.soat_vigencia_fin),
    getEstadoDocumento(flota.extintor_vencimiento),
  ];

  // Prioridad: vencido > urgente > por-vencer > vigente > sin-datos
  const prioridad = {
    vencido: 1,
    urgente: 2,
    "por-vencer": 3,
    vigente: 4,
    "sin-datos": 5,
  };

  return estados.reduce((peor, actual) => {
    return prioridad[actual.estado] < prioridad[peor.estado] ? actual : peor;
  });
};

/**
 * Calcula la antigüedad de un vehículo desde su año de fabricación
 * @param {number} anio - Año de fabricación del vehículo
 * @returns {number} Antigüedad en años
 */
export const calcularAntiguedad = (anio) => {
  if (!anio) return 0;
  const anioActual = new Date().getFullYear();
  return anioActual - anio;
};

/**
 * Obtiene color CSS para la antigüedad del vehículo
 * @param {number} antiguedad - Años de antigüedad
 * @returns {string} Clases CSS para el color
 */
export const getAntiguedadColor = (antiguedad) => {
  if (antiguedad <= 3) return "text-green-600";
  if (antiguedad <= 7) return "text-yellow-600";
  if (antiguedad <= 12) return "text-orange-600";
  return "text-red-600";
};

/**
 * Obtiene color CSS para el tipo de vehículo
 * @param {string} tipo - Tipo de vehículo
 * @returns {string} Clases CSS para el color
 */
export const getTipoVehiculoColor = (tipo) => {
  switch (tipo?.toLowerCase()) {
    case "volquete":
      return "text-orange-800 bg-orange-100";
    case "furgón":
    case "furgon":
      return "text-blue-800 bg-blue-100";
    case "plataforma":
      return "text-purple-800 bg-purple-100";
    case "tanque":
    case "cisterna":
      return "text-cyan-800 bg-cyan-100";
    case "camión":
    case "camion":
      return "text-red-800 bg-red-100";
    case "cama baja":
      return "text-indigo-800 bg-indigo-100";
    case "camión ligero":
    case "camion ligero":
      return "text-pink-800 bg-pink-100";
    case "camión pesado":
    case "camion pesado":
      return "text-red-800 bg-red-100";
    case "trailer":
      return "text-teal-800 bg-teal-100";
    case "grúa":
    case "grua":
      return "text-pink-800 bg-pink-100";
    default:
      return "text-gray-800 bg-gray-100";
  }
};

/**
 * Obtiene color CSS para el tipo de combustible
 * @param {string} combustible - Tipo de combustible
 * @returns {string} Clases CSS para el color
 */
export const getCombustibleColor = (combustible) => {
  switch (combustible?.toLowerCase()) {
    case "diesel":
      return "text-blue-800 bg-blue-100";
    case "gasolina":
      return "text-yellow-800 bg-yellow-100";
    case "gnv":
      return "text-green-800 bg-green-100";
    case "eléctrico":
      return "text-teal-800 bg-teal-100";
    case "híbrido":
      return "text-purple-800 bg-purple-100";
    case "glp":
      return "text-orange-800 bg-orange-100";
    default:
      return "text-gray-800 bg-gray-100";
  }
};

/**
 * Obtiene color CSS para el estado activo/inactivo
 * @param {boolean} activo - Estado del vehículo
 * @returns {string} Clases CSS para el color
 */
export const getEstadoColor = (activo) => {
  return activo
    ? "text-green-700 bg-green-50 border-green-200"
    : "text-red-700 bg-red-50 border-red-200";
};

/**
 * Formatea una fecha para mostrar de manera legible
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Incluir hora
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (date, includeTime = false) => {
  if (!date) return "N/A";

  try {
    const fecha = new Date(date);

    if (isNaN(fecha.getTime())) {
      return "Fecha inválida";
    }

    if (includeTime) {
      return fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return fecha.toLocaleDateString("es-ES");
  } catch (error) {
    return "Fecha inválida";
  }
};

/**
 * Calcula la próxima fecha de alerta para un vehículo
 * @param {object} flota - Objeto de flota
 * @returns {object} Información de próxima alerta
 */
export const getProximaAlerta = (flota) => {
  const fechas = [
    { tipo: "Revisión Técnica", fecha: flota.revision_tecnica_vencimiento },
    { tipo: "SOAT", fecha: flota.soat_vigencia_fin },
    { tipo: "Extintor", fecha: flota.extintor_vencimiento },
  ]
    .filter((item) => item.fecha)
    .map((item) => ({
      ...item,
      diasRestantes: calcularDiasRestantes(item.fecha),
    }))
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  return fechas[0] || null;
};

/**
 * Valida si un vehículo tiene documentos por vencer o vencidos
 * @param {object} flota - Objeto de flota
 * @returns {boolean} True si hay documentos críticos
 */
export const tieneDocumentosCriticos = (flota) => {
  const revision = getEstadoDocumento(flota.revision_tecnica_vencimiento);
  const soat = getEstadoDocumento(flota.soat_vigencia_fin);
  const extintor = getEstadoDocumento(flota.extintor_vencimiento);

  return [revision, soat, extintor].some(
    (doc) =>
      doc.estado === "vencido" ||
      doc.estado === "urgente" ||
      doc.estado === "por-vencer"
  );
};

/**
 * Calcula todas las alertas de un vehículo
 * @param {object} vehiculo - Objeto del vehículo
 * @returns {object} Objeto con alertas
 */
export const calcularAlertas = (vehiculo) => {
  const hoy = new Date();
  const alertas = {
    total: 0,
    mensajes: [],
    revision_tecnica: false,
    soat: false,
    extintor: false,
  };

  // Alerta para revisión técnica
  if (vehiculo.revision_tecnica_vencimiento) {
    const fechaVencimiento = new Date(vehiculo.revision_tecnica_vencimiento);
    const diasFaltantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
    const diasAlerta = vehiculo.dias_alerta_revision_tecnica || 30;

    if (diasFaltantes <= diasAlerta && diasFaltantes >= 0) {
      alertas.revision_tecnica = true;
      alertas.total++;
      alertas.mensajes.push({
        texto: `Revisión técnica vence en ${diasFaltantes} días`,
        severidad: diasFaltantes <= 7 ? "alta" : "media",
        tipo: "revision_tecnica",
      });
    } else if (diasFaltantes < 0) {
      alertas.revision_tecnica = true;
      alertas.total++;
      alertas.mensajes.push({
        texto: `Revisión técnica VENCIDA hace ${Math.abs(diasFaltantes)} días`,
        severidad: "alta",
        tipo: "revision_tecnica",
      });
    }
  }

  // Alerta para SOAT
  if (vehiculo.soat_vigencia_fin) {
    const fechaVencimiento = new Date(vehiculo.soat_vigencia_fin);
    const diasFaltantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
    const diasAlerta = vehiculo.dias_alerta_soat || 30;

    if (diasFaltantes <= diasAlerta && diasFaltantes >= 0) {
      alertas.soat = true;
      alertas.total++;
      alertas.mensajes.push({
        texto: `SOAT vence en ${diasFaltantes} días`,
        severidad: diasFaltantes <= 7 ? "alta" : "media",
        tipo: "soat",
      });
    } else if (diasFaltantes < 0) {
      alertas.soat = true;
      alertas.total++;
      alertas.mensajes.push({
        texto: `SOAT VENCIDO hace ${Math.abs(diasFaltantes)} días`,
        severidad: "alta",
        tipo: "soat",
      });
    }
  }

  // Alerta para extintor
  if (vehiculo.extintor_vencimiento) {
    const fechaVencimiento = new Date(vehiculo.extintor_vencimiento);
    const diasFaltantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
    const diasAlerta = vehiculo.dias_alerta_extintor || 15;

    if (diasFaltantes <= diasAlerta && diasFaltantes >= 0) {
      alertas.extintor = true;
      alertas.total++;
      alertas.mensajes.push({
        texto: `Extintor vence en ${diasFaltantes} días`,
        severidad: diasFaltantes <= 3 ? "alta" : "media",
        tipo: "extintor",
      });
    } else if (diasFaltantes < 0) {
      alertas.extintor = true;
      alertas.total++;
      alertas.mensajes.push({
        texto: `Extintor VENCIDO hace ${Math.abs(diasFaltantes)} días`,
        severidad: "alta",
        tipo: "extintor",
      });
    }
  }

  return alertas;
};

/**
 * Obtiene color CSS para la severidad de una alerta
 * @param {string} severidad - Severidad de la alerta (alta, media, baja)
 * @returns {string} Clases CSS para el color
 */
export const getAlertaColor = (severidad) => {
  switch (severidad) {
    case "alta":
      return "text-red-700 bg-red-50 border-red-200";
    case "media":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "baja":
      return "text-blue-700 bg-blue-50 border-blue-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

/**
 * Calcula estadísticas de pago para la página de flotas
 * @param {Array} vehiculos - Lista de vehículos
 * @returns {object} Estadísticas calculadas
 */
export const calcularEstadisticasPago = (vehiculos) => {
  // Esta función se mantiene por compatibilidad, aunque para flotas
  // las estadísticas de pago no aplican directamente
  return {
    totalContado: 0,
    totalCredito: 0,
    promedioDiasCredito: 0,
  };
};

/**
 * Obtiene el icono correspondiente para un tipo de vehículo
 * @param {string} tipo - Tipo de vehículo
 * @returns {React.Component} Componente de icono
 */
export const getTipoVehiculoIcon = (tipo) => {
  switch (tipo?.toLowerCase()) {
    case "volquete":
      return Truck;
    case "furgón":
    case "furgon":
      return Truck;
    case "plataforma":
      return Truck;
    case "tanque":
    case "cisterna":
      return Truck;
    case "camión":
    case "camion":
      return Truck;
    case "cama baja":
      return Truck;
    case "grúa":
    case "grua":
      return Settings;
    default:
      return Truck;
  }
};

/**
 * Formatea la capacidad de carga para mostrar
 * @param {number} tn - Toneladas
 * @param {number} m3 - Metros cúbicos
 * @returns {string} Capacidad formateada
 */
export const formatearCapacidad = (tn, m3) => {
  if (!tn && !m3) return "Sin datos";
  
  const partes = [];
  if (tn) partes.push(`${tn} TN`);
  if (m3) partes.push(`${m3} m³`);
  
  return partes.join(" • ");
};

/**
 * Verifica si un vehículo necesita mantenimiento
 * @param {object} vehiculo - Objeto del vehículo
 * @param {number} kmUltimoMantenimiento - KM desde el último mantenimiento
 * @returns {boolean} True si necesita mantenimiento
 */
export const necesitaMantenimiento = (vehiculo, kmUltimoMantenimiento) => {
  // Si no hay datos de kilometraje, no se puede determinar
  if (!kmUltimoMantenimiento || kmUltimoMantenimiento === 0) return false;
  
  // Lógica básica: si ha recorrido más de 10,000 km desde el último mantenimiento
  return kmUltimoMantenimiento > 10000;
};

/**
 * Obtiene información resumida del vehículo para tarjetas
 * @param {object} vehiculo - Objeto del vehículo
 * @returns {object} Información resumida
 */
export const getResumenVehiculo = (vehiculo) => {
  const antiguedad = calcularAntiguedad(vehiculo.anio);
  const alertas = calcularAlertas(vehiculo);
  
  return {
    placa: vehiculo.placa || "Sin placa",
    marcaModelo: `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim(),
    tipo: vehiculo.tipo_vehiculo || "Sin especificar",
    estado: vehiculo.activo ? "Activo" : "Inactivo",
    antiguedad,
    capacidad: formatearCapacidad(vehiculo.tn, vehiculo.m3),
    tieneAlertas: alertas.total > 0,
    proximaAlerta: getProximaAlerta(vehiculo),
  };
};