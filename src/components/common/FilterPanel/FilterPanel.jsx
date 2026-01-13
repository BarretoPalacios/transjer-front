import React from 'react';
import Button from '../Button/Button';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClear, 
  onApply,
  className = ""
}) => {
  const handleFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  return (
    <div className={`mt-6 pt-6 border-t border-gray-200 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filters.estado}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol
          </label>
          <select
            value={filters.rol}
            onChange={(e) => handleFilterChange('rol', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="todos">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Gerente">Gerente</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Operador">Operador</option>
            <option value="Auditor">Auditor</option>
            <option value="Analista">Analista</option>
            <option value="Desarrollador">Desarrollador</option>
            <option value="Soporte">Soporte</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento
          </label>
          <select
            value={filters.departamento}
            onChange={(e) => handleFilterChange('departamento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="todos">Todos los departamentos</option>
            <option value="TI">TI</option>
            <option value="Logística">Logística</option>
            <option value="Operaciones">Operaciones</option>
            <option value="Auditoría">Auditoría</option>
            <option value="Administración">Administración</option>
            <option value="Análisis">Análisis</option>
            <option value="Soporte">Soporte</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button
          onClick={onClear}
          variant="secondary"
        >
          Limpiar filtros
        </Button>
        <Button
          onClick={onApply}
        >
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
};

export default React.memo(FilterPanel);