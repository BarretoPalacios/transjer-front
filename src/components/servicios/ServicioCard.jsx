import React from 'react';
import { 
  Package, 
  Clock, 
  DollarSign, 
  Tag, 
  Ruler, 
  AlertCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  FileText,
  Layers // Nuevo icono para modalidad
} from 'lucide-react';
import Button from '../common/Button/Button';

const ServicioCard = ({ 
  servicio,
  onView,
  onEdit,
  onDelete,
  getEstadoColor,
  getTipoServicioColor,
  getModalidadServicioColor, // Nueva prop
  formatFecha,
  className = "",
  ...props 
}) => {
  const esPrecioAlto = servicio.precio_base > 1000;
  const tiempoExtendido = servicio.tiempo_estimado > 180;

  const formatPrecio = (precio) => {
    return parseFloat(precio).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatTiempo = (minutos) => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`} {...props}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            {/* Icono del servicio */}
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white">
                <Package className="h-7 w-7 text-indigo-600" />
              </div>
              {/* Indicador de estado */}
              <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center ${
                servicio.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {servicio.estado === 'activo' ? (
                  <CheckCircle className="h-3 w-3 text-white" />
                ) : (
                  <XCircle className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {servicio.nombre}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono text-gray-500 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {servicio.codigo_servicio}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(servicio.estado)}`}>
                  {servicio.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tipo de servicio, modalidad y unidad de medida */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoServicioColor(servicio.tipo_servicio)}`}>
            {servicio.tipo_servicio}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getModalidadServicioColor(servicio.modalidad_servicio)}`}>
            <Layers className="h-3 w-3 mr-1" />
            {servicio.modalidad_servicio}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Ruler className="h-3 w-3 mr-1" />
            {servicio.unidad_medida}
          </span>
        </div>

        {/* Información principal */}
        <div className="space-y-3 text-sm">
          {/* Descripción */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Descripción</div>
            <div className="text-gray-900 line-clamp-2">
              {servicio.descripcion || 'Sin descripción'}
            </div>
          </div>

          {/* Precio y Tiempo */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Precio Base</div>
                  <div className={`font-bold text-lg ${esPrecioAlto ? 'text-red-600' : 'text-gray-900'}`}>
                    S/ {formatPrecio(servicio.precio_base)}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Tiempo Estimado</div>
                  <div className={`font-medium text-gray-900 ${tiempoExtendido ? 'text-yellow-600' : ''}`}>
                    {formatTiempo(servicio.tiempo_estimado)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de servicio */}
          <div className="pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Modalidad</div>
                <div className="flex items-center text-sm text-gray-900">
                  <Layers className="h-3 w-3 mr-1 text-gray-500" />
                  {servicio.modalidad_servicio}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Unidad de Medida</div>
                <div className="flex items-center text-sm text-gray-900">
                  <Ruler className="h-3 w-3 mr-1 text-gray-500" />
                  {servicio.unidad_medida}
                </div>
              </div>
            </div>
          </div>

          {/* Condiciones especiales */}
          {servicio.condiciones && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-start">
                <Info className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-700 mb-1">Condiciones Especiales</div>
                  <div className="text-sm text-gray-900 line-clamp-2">{servicio.condiciones}</div>
                </div>
              </div>
            </div>
          )}

          {/* Fecha de registro */}
          {servicio.fecha_registro && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-gray-700">Registrado el</div>
                  <div className="text-sm text-gray-900">{formatFecha(servicio.fecha_registro)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            ID: {servicio.codigo_servicio }
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onView(servicio)}
              variant="secondary"
              size="small"
              icon={Eye}
              title="Ver detalles"
            />
            <Button
              onClick={() => onEdit(servicio)}
              variant="secondary"
              size="small"
              icon={Edit}
              title="Editar"
            />
            <Button
              onClick={() => onDelete(servicio._id || servicio.id)}
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

// Funciones helper para colores
ServicioCard.defaultProps = {
  getEstadoColor: (estado) => {
    switch(estado) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactivo': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },
  getTipoServicioColor: (tipo) => {
    switch(tipo) {
      case 'Local': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Nacional': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Cuadrilla': return 'bg-green-100 text-green-800 border-green-200';
      case 'Transporte': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Alquiler': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Otros': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },
  getModalidadServicioColor: (modalidad) => {
    switch(modalidad) {
      case 'Carga': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Descarga': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Carga y Descarga': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Ida y Vuelta': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Solo Ida': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Por Hora': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Por Día': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Mixto': return 'bg-violet-100 text-violet-800 border-violet-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },
  formatFecha: (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
};

export default React.memo(ServicioCard);