import React from 'react';
import { 
  User, Mail, Phone, Building, Calendar, 
  Hash, Shield, Lock, Eye, Edit, Trash2, MoreVertical 
} from 'lucide-react';
import Button from '../../common/Button/Button';

const UsuarioCard = ({ 
  usuario,
  onView,
  onEdit,
  onDelete,
  onManagePermissions,
  getEstadoColor,
  getRolColor,
  className = "",
  ...props 
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`} {...props}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-50">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{usuario.nombre} {usuario.apellidos}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-gray-500">@{usuario.usuario}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(usuario.estado)}`}>
                    {usuario.estado}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRolColor(usuario.rol)}`}>
                {usuario.rol}
              </span>
              {usuario.twoFactorEnabled && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  2FA
                </span>
              )}
              {usuario.bloqueado && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado
                </span>
              )}
            </div>
          </div>
          
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Hash className="h-4 w-4 mr-2" />
            <span>DNI: {usuario.dni}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            <span className="truncate">{usuario.email}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span>{usuario.telefono}</span>
          </div>
          {usuario.departamento && (
            <div className="flex items-center text-gray-600">
              <Building className="h-4 w-4 mr-2" />
              <span>{usuario.departamento}</span>
            </div>
          )}
        </div>

        {/* Último acceso */}
        {usuario.fechaUltimoAcceso && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Último acceso: {usuario.fechaUltimoAcceso}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {usuario.permisos.length} permisos
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onView(usuario)}
              variant="secondary"
              size="small"
              icon={Eye}
              title="Ver detalles"
            />
            <Button
              onClick={() => onManagePermissions(usuario)}
              variant="secondary"
              size="small"
              icon={Shield}
              title="Gestionar permisos"
            />
            <Button
              onClick={() => onEdit(usuario)}
              variant="secondary"
              size="small"
              icon={Edit}
              title="Editar"
            />
            <Button
              onClick={() => onDelete(usuario.id)}
              variant="danger"
              size="small"
              icon={Trash2}
              title="Eliminar"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UsuarioCard);