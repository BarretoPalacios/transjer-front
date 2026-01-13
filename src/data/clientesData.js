// En clientesData.js
export const tiposDocumento = [
  { value: "RUC", label: "RUC" },
  { value: "DNI", label: "DNI" },
  { value: "CE", label: "Carnet de Extranjería" },
  { value: "PASAPORTE", label: "Pasaporte" },
];

export const tiposCliente = [
  { value: "Corporativo", label: "Corporativo" },
  { value: "PYME", label: "PYME" },
  { value: "Individual", label: "Individual" },
  { value: "Gobierno", label: "Gobierno" },
  { value: "Educacion", label: "Educación" },
];

// Agrega estas nuevas constantes
export const tiposPago = [
  { value: "Contado", label: "Contado" },
  { value: "Crédito", label: "Crédito" },
];

export const diasCreditoOptions = [
  { value: 0, label: "0 días (Contado)" },
  { value: 7, label: "7 días" },
  { value: 15, label: "15 días" },
  { value: 30, label: "30 días" },
  { value: 60, label: "60 días" },
  { value: 90, label: "90 días" },
];

export const estadosCliente = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "suspendido", label: "Suspendido" },
];