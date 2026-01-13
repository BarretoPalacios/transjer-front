import React from 'react';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  CreditCard,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,Edit,Trash2
} from 'lucide-react';
import Button from '../common/Button/Button';
import { getTipoClienteColor, getEstadoCuentaColor, formatMoneda, formatFechaCuenta, calcularAntiguedadCuenta } from '../../utils/cuentasUtils';

const CuentaCard = ({ 
  cuenta, 
  onView, 
  onEdit, 
  onDelete,
  razonSocialCliente,
  ...props 
}) => {
  const renderEstadoIcono = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactivo':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'suspendido':
      case 'moroso':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200" {...props}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center mb-2">
            <Building className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{cuenta.nombre}</h3>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <FileText className="h-4 w-4 mr-1" />
            <span className="font-medium">Código:</span>
            <span className="ml-1 font-mono">{cuenta.codigo_cuenta}</span>
          </div>
          {cuenta.codigo_cliente && (
            <div className="flex items-center text-sm text-gray-600 mb-1">  
              <User className="h-4 w-4 mr-1" />
              <span className="font-medium">Cliente:</span>
              <span className="ml-1">{razonSocialCliente}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${getEstadoCuentaColor(cuenta.estado)}`}>
            {renderEstadoIcono(cuenta.estado)}
            <span className="ml-1 capitalize">{cuenta.estado}</span>
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoClienteColor(cuenta.tipo_cliente)}`}>
            {cuenta.tipo_cliente}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm">
          <CreditCard className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          <span className="text-gray-600">RUC:</span>
          <span className="ml-2 font-medium">{cuenta.ruc}</span>
        </div>
        
        {cuenta.contacto && (
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-600">Contacto:</span>
            <span className="ml-2 font-medium">{cuenta.contacto}</span>
          </div>
        )}
        
        {cuenta.telefono && (
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-600">Teléfono:</span>
            <span className="ml-2 font-medium">{cuenta.telefono}</span>
          </div>
        )}
        
        {cuenta.email && (
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-medium truncate">{cuenta.email}</span>
          </div>
        )}
        
        {cuenta.limite_credito !== undefined && cuenta.limite_credito !== null && (
  <div className="flex items-center text-sm">
    <CreditCard className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
    <span className="text-gray-600">Límite crédito:</span>
    <span className="ml-2 font-medium text-green-700">
      {cuenta.limite_credito === 0
        ? 'No se asignó un valor'
        : formatMoneda(cuenta.limite_credito)}
    </span>
  </div>
)}

      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formatFechaCuenta(cuenta.fecha_registro)}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{cuenta.direccion?.split(',')[0] || 'Sin dirección'}</span>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
        <Button
          onClick={() => onView(cuenta)}
          variant="ghost"
          size="small"
          icon={Eye}
          title="Ver detalles"
        />
        <Button
          onClick={() => onEdit(cuenta)}
          variant="ghost"
          size="small"
          icon={Edit}
          title="Editar"
        />
        <Button
          onClick={() => onDelete(cuenta._id || cuenta.id)}
          variant="ghost"
          size="small"
          icon={Trash2}
          className="text-red-600 hover:text-red-700"
          title="Eliminar"
        />
      </div>
    </div>
  );
};

export default React.memo(CuentaCard);