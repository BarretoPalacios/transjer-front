import React, { useState, useCallback } from 'react';
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import { Shield } from 'lucide-react';

const PermisosModal = ({
  isOpen,
  onClose,
  usuario,
  permisosDisponibles,
  getRolColor,
  onUpdate,
  ...props
}) => {
  const [localUsuario, setLocalUsuario] = useState(usuario);

  React.useEffect(() => {
    if (usuario) {
      setLocalUsuario(usuario);
    }
  }, [usuario]);

  const togglePermiso = useCallback((permisoId) => {
    if (!localUsuario) return;

    const nuevosPermisos = localUsuario.permisos.includes(permisoId)
      ? localUsuario.permisos.filter(p => p !== permisoId)
      : [...localUsuario.permisos, permisoId];
    
    const updatedUsuario = { ...localUsuario, permisos: nuevosPermisos };
    setLocalUsuario(updatedUsuario);
  }, [localUsuario]);

  const toggleAllPermisos = useCallback((categoria) => {
    if (!localUsuario) return;

    const categoriaPermisos = permisosDisponibles
      .find(cat => cat.categoria === categoria)
      .permisos.map(p => p.id);
    
    const todosPermisosActivos = categoriaPermisos.every(p => 
      localUsuario.permisos.includes(p)
    );
    
    const nuevosPermisos = todosPermisosActivos
      ? localUsuario.permisos.filter(p => !categoriaPermisos.includes(p))
      : [...localUsuario.permisos, ...categoriaPermisos.filter(p => 
          !localUsuario.permisos.includes(p)
        )];
    
    const updatedUsuario = { ...localUsuario, permisos: nuevosPermisos };
    setLocalUsuario(updatedUsuario);
  }, [localUsuario, permisosDisponibles]);

  const handleSave = useCallback(() => {
    if (localUsuario) {
      onUpdate(localUsuario);
      onClose();
    }
  }, [localUsuario, onUpdate, onClose]);

  const clearAllPermisos = useCallback(() => {
    if (localUsuario) {
      const updatedUsuario = { ...localUsuario, permisos: [] };
      setLocalUsuario(updatedUsuario);
    }
  }, [localUsuario]);

  if (!localUsuario) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos: ${localUsuario.nombre} ${localUsuario.apellidos}`}
      size="xlarge"
      {...props}
    >
      {/* Resumen de permisos */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-blue-800">
                {localUsuario.permisos.length} permisos asignados
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRolColor(localUsuario.rol)}`}>
                {localUsuario.rol}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Selecciona o deselecciona los permisos para este usuario
            </p>
          </div>
          <Button
            onClick={clearAllPermisos}
            variant="danger"
            size="small"
          >
            Limpiar todos
          </Button>
        </div>
      </div>

      {/* Lista de permisos por categoría */}
      <div className="space-y-6">
        {permisosDisponibles.map(categoria => {
          const permisosCategoria = categoria.permisos;
          const permisosSeleccionados = permisosCategoria.filter(p => 
            localUsuario.permisos.includes(p.id)
          ).length;
          
          return (
            <div key={categoria.categoria} className="border border-gray-200 rounded-lg">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{categoria.categoria}</h3>
                  <p className="text-xs text-gray-500">
                    {permisosSeleccionados} de {permisosCategoria.length} permisos seleccionados
                  </p>
                </div>
                <Button
                  onClick={() => toggleAllPermisos(categoria.categoria)}
                  variant="secondary"
                  size="small"
                >
                  {permisosSeleccionados === permisosCategoria.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </Button>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permisosCategoria.map(permiso => (
                    <div key={permiso.id} className="flex items-start">
                      <input
                        type="checkbox"
                        id={`permiso-${permiso.id}`}
                        checked={localUsuario.permisos.includes(permiso.id)}
                        onChange={() => togglePermiso(permiso.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                      />
                      <label htmlFor={`permiso-${permiso.id}`} className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{permiso.nombre}</div>
                        <div className="text-xs text-gray-500">{permiso.descripcion}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
        <Button
          onClick={onClose}
          variant="secondary"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
        >
          <Shield className="h-4 w-4 mr-2" />
          Guardar Permisos
        </Button>
      </div>
    </Modal>
  );
};

export default React.memo(PermisosModal);