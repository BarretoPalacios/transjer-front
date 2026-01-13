export const formatForSelect = (dataArray, valueField = 'id', labelField = 'nombre', descriptionField = null) => {
  if (!Array.isArray(dataArray)) return [];
  
  return dataArray.map(item => ({
    value: item[valueField]?.toString() || '',
    label: item[labelField] || 'Sin nombre',
    description: descriptionField ? item[descriptionField] : null
  }));
};

export const formatPersonaForSelect = (personas) => {
  return personas.map(persona => ({
    value: persona.id?.toString() || '',
    label: `${persona.nombres || ''} ${persona.apellidos || ''}`.trim(),
    description: persona.dni ? `DNI: ${persona.dni}` : null
  }));
};

export const formatVehiculoForSelect = (vehiculos) => {
  return vehiculos.map(vehiculo => ({
    value: vehiculo.id?.toString() || '',
    label: `${vehiculo.placa || ''} - ${vehiculo.marca || ''} ${vehiculo.modelo || ''}`.trim(),
    description: vehiculo.capacidad_m3 ? `Cap: ${vehiculo.capacidad_m3} m³` : null
  }));
};