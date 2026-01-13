// data/personalData.js

export const tiposPersonal = [
  { value: 'Conductor', label: 'Conductor' },
  { value: 'Auxiliar', label: 'Auxiliar' },
  { value: 'Operario', label: 'Operario' },
  { value: 'Administrativo', label: 'Administrativo' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Mecánico', label: 'Mecánico' },
  { value: 'Almacenero', label: 'Almacenero' }
];

export const estadosTrabajador = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
  { value: 'Licencia', label: 'Licencia' },
  { value: 'Vacaciones', label: 'Vacaciones' }
];

export const turnosTrabajo = [
  { value: 'Día', label: 'Día' },
  { value: 'Noche', label: 'Noche' },
  { value: 'Rotativo', label: 'Rotativo' }
];

export const categoriasLicencia = [
  { value: 'A-I', label: 'A-I' },
  { value: 'A-II-a', label: 'A-II-a' },
  { value: 'A-II-b', label: 'A-II-b' },
  { value: 'A-III-a', label: 'A-III-a' },
  { value: 'A-III-b', label: 'A-III-b' },
  { value: 'A-III-c', label: 'A-III-c' }
];

export const bancosPeru = [
  { value: 'BCP', label: 'Banco de Crédito del Perú (BCP)' },
  { value: 'BBVA', label: 'BBVA Perú' },
  { value: 'Interbank', label: 'Interbank' },
  { value: 'Scotiabank', label: 'Scotiabank Perú' },
  { value: 'Banco de la Nación', label: 'Banco de la Nación' },
  { value: 'Banco Pichincha', label: 'Banco Pichincha' },
  { value: 'Banco Falabella', label: 'Banco Falabella' },
  { value: 'Banco Ripley', label: 'Banco Ripley' },
  { value: 'MiBanco', label: 'MiBanco' },
  { value: 'Banco GNB Perú', label: 'Banco GNB Perú' },
  { value: 'Citibank Perú', label: 'Citibank Perú' },
  { value: 'Banco Santander', label: 'Banco Santander Perú' }
];

// Para uso en filtros y otros componentes
export const getTipoPersonalLabel = (value) => {
  const tipo = tiposPersonal.find(t => t.value === value);
  return tipo ? tipo.label : value;
};

export const getEstadoTrabajadorLabel = (value) => {
  const estado = estadosTrabajador.find(e => e.value === value);
  return estado ? estado.label : value;
};

export const getTurnoTrabajoLabel = (value) => {
  const turno = turnosTrabajo.find(t => t.value === value);
  return turno ? turno.label : value;
};

export const getCategoriaLicenciaLabel = (value) => {
  const categoria = categoriasLicencia.find(c => c.value === value);
  return categoria ? categoria.label : value;
};