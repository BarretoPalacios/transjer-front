import React from 'react';
import { MapPin, Phone, Clock, Navigation, Eye, Edit, Trash2, MoreVertical, Shield } from 'lucide-react';
import Button from '../common/Button/Button';

const LugarCard = ({ 
  lugar,
  onView,
  onEdit,
  onDelete,
  getEstadoColor,
  getTipoLugarColor,
  getTipoLugarIcon,
  className = "",
  ...props 
}) => {
  const TipoIcon = getTipoLugarIcon(lugar.tipo_lugar);

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`} {...props}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-50">
                <TipoIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{lugar.nombre}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-gray-500">{lugar.codigo_lugar}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(lugar.estado)}`}>
                    {lugar.estado}
                  </span>
                  {lugar.es_principal && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Principal
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoLugarColor(lugar.tipo_lugar)}`}>
                <TipoIcon className="h-3 w-3 mr-1" />
                {lugar.tipo_lugar}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Detalles del lugar */}
        <div className="space-y-3 text-sm">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">{lugar.direccion}</div>
              <div className="text-gray-600">{lugar.distrito}, {lugar.provincia}</div>
              <div className="text-gray-500 text-xs">{lugar.departamento}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <Phone className="h-4 w-4 mr-2" />
                <span className="truncate">{lugar.telefono || 'No especificado'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{lugar.horario_atencion || 'Sin horario'}</span>
              </div>
            </div>
            
            <div>
              {lugar.contacto && (
                <div className="text-gray-600 mb-1">
                  <span className="font-medium">Contacto:</span> {lugar.contacto}
                </div>
              )}
              {lugar.capacidad_estacionamiento && (
                <div className="text-gray-600">
                  <span className="font-medium">Estacionamiento:</span> {lugar.capacidad_estacionamiento} vehículos
                </div>
              )}
            </div>
          </div>
          
          {lugar.servicios_disponibles && lugar.servicios_disponibles.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-1">Servicios disponibles:</div>
              <div className="flex flex-wrap gap-1">
                {lugar.servicios_disponibles.map((servicio, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {servicio}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {lugar.coordenadas && (
            <div className="flex items-center text-sm text-blue-600 pt-3 border-t border-gray-100">
              <Navigation className="h-4 w-4 mr-2" />
              <span>Coordenadas: {lugar.coordenadas.lat?.toFixed(4)}, {lugar.coordenadas.lng?.toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 truncate max-w-[60%]">
            {lugar.observaciones ? (
              <div className="truncate" title={lugar.observaciones}>
                {lugar.observaciones}
              </div>
            ) : (
              <span className="text-gray-400">Sin observaciones</span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onView(lugar)}
              variant="secondary"
              size="small"
              icon={Eye}
              title="Ver detalles"
            />
            <Button
              onClick={() => onEdit(lugar)}
              variant="secondary"
              size="small"
              icon={Edit}
              title="Editar"
            />
            <Button
              onClick={() => onDelete(lugar.id)}
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

export default React.memo(LugarCard);