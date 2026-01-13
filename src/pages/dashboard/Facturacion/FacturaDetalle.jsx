// src/components/facturacion/FacturaDetalle.js
import React from 'react';
import {
  Package,
  MapPin,
  Calendar,
  Truck,
  User,
  FileText,
  DollarSign,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getEstadoColor,
  getMonedaColor,
  getMetodoPagoColor,
  extraerInfoServicio,
} from '../../../utils/facturasUtils';

const FacturaDetalle = ({ factura }) => {
  const infoServicio = extraerInfoServicio(factura.servicio);
  
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Detalles de la Factura
          </h3>
          <p className="text-sm text-gray-500">
            Información completa del documento
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(factura.estado)}`}>
          {factura.estado}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de la factura */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            <h4 className="text-md font-semibold text-gray-900">
              Información de Factura
            </h4>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Número</p>
                <p className="font-medium text-gray-900">{factura.numero_factura}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Código</p>
                <p className="font-medium text-gray-900">{factura.codigo_factura}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Descripción</p>
              <p className="font-medium text-gray-900">{factura.descripcion || 'Sin descripción'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Observaciones</p>
              <p className="font-medium text-gray-900">{factura.observaciones || 'Sin observaciones'}</p>
            </div>
          </div>
        </div>

        {/* Información financiera */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="text-md font-semibold text-gray-900">
              Información Financiera
            </h4>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Moneda</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMonedaColor(factura.moneda)}`}>
                  {factura.moneda}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Método de Pago</p>
                {factura.metodo_pago ? (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMetodoPagoColor(factura.metodo_pago)}`}>
                    {factura.metodo_pago}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">No especificado</span>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                {factura.subtotal && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(factura.subtotal, factura.moneda)}</span>
                  </div>
                )}
                
                {factura.igv && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">IGV (18%):</span>
                    <span className="font-medium">{formatCurrency(factura.igv, factura.moneda)}</span>
                  </div>
                )}
                
                {factura.descuento && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Descuento:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(factura.descuento, factura.moneda)}</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-md font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(factura.monto, factura.moneda)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del servicio */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-purple-500 mr-2" />
            <h4 className="text-md font-semibold text-gray-900">
              Información del Servicio
            </h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium text-gray-900">{infoServicio.cliente}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Servicio</p>
                <p className="font-medium text-gray-900">{infoServicio.tipoServicio}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Zona</p>
                <p className="font-medium text-gray-900">{infoServicio.zona}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Fecha del Servicio</p>
              <p className="font-medium text-gray-900">{infoServicio.fechaServicio}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Origen</p>
                <p className="font-medium text-gray-900">{infoServicio.origen}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destino</p>
                <p className="font-medium text-gray-900">{infoServicio.destino}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de seguimiento */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-orange-500 mr-2" />
            <h4 className="text-md font-semibold text-gray-900">
              Información de Seguimiento
            </h4>
          </div>
          
          <div className="space-y-4">
            {infoServicio.vehiculo !== 'N/A' && (
              <div>
                <p className="text-sm text-gray-500">Vehículo</p>
                <p className="font-medium text-gray-900">{infoServicio.vehiculo}</p>
              </div>
            )}
            
            {infoServicio.conductor !== 'N/A' && (
              <div>
                <p className="text-sm text-gray-500">Conductor</p>
                <p className="font-medium text-gray-900">{infoServicio.conductor}</p>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-2">Fechas del Sistema</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Registro:</span>
                  <span className="text-xs font-medium">{formatDateTime(factura.fecha_registro)}</span>
                </div>
                {factura.fecha_actualizacion && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Actualización:</span>
                    <span className="text-xs font-medium">{formatDateTime(factura.fecha_actualizacion)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacturaDetalle;