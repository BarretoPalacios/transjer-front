import React from 'react';
import { Building, User, MapPin, Briefcase, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import Button from '../common/Button/Button';

const ClienteCard = ({ 
  cliente,
  onView,
  onEdit,
  onDelete,
  getEstadoColor,
  getTipoClienteColor,
  calcularAntiguedad,
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
              <h3 className="text-lg font-bold text-gray-900">{cliente.nombre_comercial}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(cliente.estado)}`}>
                {cliente.estado}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center mb-1">
                <Building className="h-4 w-4 mr-1" />
                <span className="font-medium">{cliente.razon_social}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{cliente.contacto_principal}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Categorías y tipos */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoClienteColor(cliente.tipo_cliente)}`}>
            <Briefcase className="h-3 w-3 mr-1" />
            {cliente.tipo_cliente || 'No especificado'}
          </span>
        </div>

        {/* Detalles del cliente */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Documento:</span>
            <span className="font-medium">{cliente.tipo_documento} {cliente.numero_documento}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Código:</span>
            <span className="font-medium">{cliente.codigo_cliente}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium truncate max-w-[150px]">{cliente.email || 'No especificado'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Antigüedad:</span>
            <span className="font-medium">{calcularAntiguedad(cliente.fecha_registro)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Website:</span>
            <span className="font-medium truncate max-w-[150px]">{cliente.website || 'No especificado'}</span>
          </div>

          {/* ✅ NUEVOS CAMPOS AGREGADOS */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tipo de pago:</span>
            <span className="font-medium">{cliente.tipo_pago || 'No especificado'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Días de crédito:</span>
            <span className="font-medium">
              {cliente.dias_credito !== undefined ? `${cliente.dias_credito} días` : 'No especificado'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 truncate max-w-[70%]">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{cliente.direccion}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onView(cliente)}
              variant="secondary"
              size="small"
              icon={Eye}
              title="Ver detalles"
            />
            <Button
              onClick={() => onEdit(cliente)}
              variant="secondary"
              size="small"
              icon={Edit}
              title="Editar"
            />
            <Button
              onClick={() => onDelete(cliente.id)}
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

export default React.memo(ClienteCard);
