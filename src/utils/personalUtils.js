// utils/personalUtils.js

// Colores para tipos de personal
export const getTipoPersonalColor = (tipo) => {
  switch (tipo) {
    case 'Conductor':
      return 'bg-blue-100 text-blue-800';
    case 'Auxiliar':
      return 'bg-green-100 text-green-800';
    case 'Operario':
      return 'bg-yellow-100 text-yellow-800';
    case 'Administrativo':
      return 'bg-purple-100 text-purple-800';
    case 'Supervisor':
      return 'bg-indigo-100 text-indigo-800';
    case 'Mecánico':
      return 'bg-orange-100 text-orange-800';
    case 'Almacenero':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Colores para estados
export const getEstadoColor = (estado) => {
  switch (estado) {
    case 'Activo':
      return 'bg-green-100 text-green-800';
    case 'Inactivo':
      return 'bg-red-100 text-red-800';
    case 'Licencia':
      return 'bg-yellow-100 text-yellow-800';
    case 'Vacaciones':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Colores para turnos
export const getTurnoColor = (turno) => {
  switch (turno) {
    case 'Día':
      return 'bg-yellow-100 text-yellow-800';
    case 'Noche':
      return 'bg-indigo-100 text-indigo-800';
    case 'Rotativo':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Colores para estado de licencia
export const getLicenciaStatusColor = (fechaVencimiento) => {
  if (!fechaVencimiento) return 'bg-gray-100 text-gray-800';
  
  const fechaVenc = new Date(fechaVencimiento);
  const hoy = new Date();
  const diasRestantes = Math.floor((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
  
  if (diasRestantes < 0) return 'bg-red-100 text-red-800';
  if (diasRestantes < 30) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

// Calcular estadísticas del personal
export const calcularEstadisticasPersonal = (personalList) => {
  if (!personalList || personalList.length === 0) {
    return {
      total: 0,
      activos: 0,
      inactivos: 0,
      licencia: 0,
      vacaciones: 0,
      conductores: 0,
      administrativos: 0,
      promedio_salario: 0,
      licencias_por_vencer: 0
    };
  }

  const hoy = new Date();
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + 30); // Próximos 30 días

  return {
    total: personalList.length,
    activos: personalList.filter(p => p.estado === 'Activo').length,
    inactivos: personalList.filter(p => p.estado === 'Inactivo').length,
    licencia: personalList.filter(p => p.estado === 'Licencia').length,
    vacaciones: personalList.filter(p => p.estado === 'Vacaciones').length,
    conductores: personalList.filter(p => p.tipo === 'Conductor').length,
    administrativos: personalList.filter(p => p.tipo === 'Administrativo').length,
    promedio_salario: calcularPromedioSalario(personalList),
    licencias_por_vencer: personalList.filter(p => 
      p.fecha_venc_licencia && 
      new Date(p.fecha_venc_licencia) >= hoy && 
      new Date(p.fecha_venc_licencia) <= fechaLimite
    ).length
  };
};

// Calcular promedio de salario
const calcularPromedioSalario = (personalList) => {
  const personalConSalario = personalList.filter(p => p.salario && p.salario > 0);
  if (personalConSalario.length === 0) return 0;
  
  const sumaSalarios = personalConSalario.reduce((sum, p) => sum + parseFloat(p.salario), 0);
  return Math.round((sumaSalarios / personalConSalario.length) * 100) / 100;
};

// Formatear salario
export const formatSalario = (salario) => {
  if (!salario) return 'N/E';
  return `S/ ${parseFloat(salario).toFixed(2)}`;
};

// Formatear fecha
export const formatDate = (dateString) => {
  if (!dateString) return 'N/E';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Verificar si la licencia está por vencer
export const isLicenciaPorVencer = (fechaVencimiento) => {
  if (!fechaVencimiento) return false;
  
  const fechaVenc = new Date(fechaVencimiento);
  const hoy = new Date();
  const diasRestantes = Math.floor((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
  
  return diasRestantes >= 0 && diasRestantes <= 30;
};