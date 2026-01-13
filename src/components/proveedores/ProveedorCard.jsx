import React from 'react';
import { Phone, Mail, Truck, Star, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import Button from '../common/Button/Button';

const ProveedorCard = ({ 
  proveedor, 
  onView, 
  onEdit, 
  onDelete, 
  getEstadoColor, 
  getTipoProveedorColor,
  getTipoProveedorIcon 
}) => {
  const TipoIcon = getTipoProveedorIcon(proveedor.tipo);
  const servicios = Array.isArray(proveedor.servicios) 
    ? proveedor.servicios 
    : (proveedor.servicios || '').split(';').filter(s => s.trim());

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {proveedor.nombre_comercial || proveedor.razon_social}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(proveedor.estado)}`}>
                {proveedor.estado}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center mb-1">
                <span className="font-medium">RUC: </span>
                <span className="ml-1">{proveedor.ruc}</span>
              </div>
              {proveedor.contacto && (
                <div className="flex items-center">
                  <span className="mr-1">👤</span>
                  <span>{proveedor.contacto}</span>
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tipo y Calificación */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoProveedorColor(proveedor.tipo)}`}>
            <TipoIcon className="h-3 w-3 mr-1" />
            {proveedor.tipo}
          </span>
          {proveedor.calificacion > 0 && (
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(proveedor.calificacion) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-1 text-sm text-gray-600">{proveedor.calificacion?.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 text-sm">
          {proveedor.telefono && (
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{proveedor.telefono}</span>
            </div>
          )}
          {proveedor.email && (
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span className="truncate">{proveedor.email}</span>
            </div>
          )}
          {proveedor.capacidad_camiones > 0 && (
            <div className="flex items-center text-gray-600">
              <Truck className="h-4 w-4 mr-2" />
              <span>{proveedor.capacidad_camiones} camiones</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 truncate">
            {servicios.slice(0, 2).join(', ')}
            {servicios.length > 2 && '...'}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onView(proveedor)}
              variant="ghost"
              size="small"
              icon={Eye}
            />
            <Button
              onClick={() => onEdit(proveedor)}
              variant="ghost"
              size="small"
              icon={Edit}
            />
            <Button
              onClick={() => onDelete(proveedor.id)}
              variant="ghost"
              size="small"
              icon={Trash2}
              className="text-red-600 hover:text-red-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveedorCard;