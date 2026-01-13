import React from 'react';
import { 
  Truck, 
  Building, 
  Calendar, 
  Weight, 
  Package, 
  Fuel, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  FileCheck,
  Droplets,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Button from '../common/Button/Button';

const FlotaCard = ({ 
  flota,
  onView,
  onEdit,
  onDelete,
  getTipoVehiculoColor,
  calcularAntiguedad,
  className = "",
  ...props 
}) => {
  const esViejo = flota.anio && (new Date().getFullYear() - flota.anio) > 15;
  const tieneCapacidad = flota.tn > 0 || flota.m3 > 0;
  
  const formatFecha = (date) => {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-ES');
  };

  // Calcular días restantes para vencimiento
  const calcularDiasRestantes = (fechaVencimiento) => {
    if (!fechaVencimiento) return null;
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Verificar estado de documentos
  const getEstadoDocumento = (fechaVencimiento) => {
    if (!fechaVencimiento) return { estado: 'sin-datos', label: 'Sin datos', color: 'gray' };
    
    const diasRestantes = calcularDiasRestantes(fechaVencimiento);
    
    if (diasRestantes < 0) {
      return { estado: 'vencido', label: 'Vencido', color: 'red' };
    } else if (diasRestantes <= 30) {
      return { estado: 'por-vencer', label: 'Por vencer', color: 'yellow' };
    } else {
      return { estado: 'vigente', label: 'Vigente', color: 'green' };
    }
  };

  // Estados de los documentos
  const estadoRevisionTecnica = getEstadoDocumento(flota.revision_tecnica_vencimiento);
  const estadoSOAT = getEstadoDocumento(flota.soat_vigencia_fin);
  const estadoExtintor = getEstadoDocumento(flota.extintor_vencimiento);

  // Contar documentos por vencer
  const documentosPorVencer = [
    estadoRevisionTecnica.estado === 'por-vencer' || estadoRevisionTecnica.estado === 'vencido',
    estadoSOAT.estado === 'por-vencer' || estadoSOAT.estado === 'vencido',
    estadoExtintor.estado === 'por-vencer' || estadoExtintor.estado === 'vencido'
  ].filter(Boolean).length;

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`} {...props}>
      {/* Header con placa y estado */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            {/* Icono de vehículo */}
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white">
                <Truck className="h-7 w-7 text-blue-600" />
              </div>
              {/* Indicador de estado */}
              <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center ${
                flota.activo ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {flota.activo && (
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {flota.placa}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono text-gray-500">
                  {flota.marca} {flota.modelo}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                  flota.activo 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {flota.activo ? 'Activo' : 'Inactivo'}
                </span>
                {esViejo && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Antiguo
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Badge para documentos por vencer */}
          {documentosPorVencer > 0 && (
            <div className="relative">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {documentosPorVencer} doc{documentosPorVencer > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Tipo y Empresa */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoVehiculoColor(flota.tipo_vehiculo)}`}>
            {flota.tipo_vehiculo}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Building className="h-3 w-3 mr-1" />
            {flota.empresa || 'Sin empresa'}
          </span>
        </div>

        {/* Información principal */}
        <div className="space-y-3 text-sm">
          {/* Especificaciones técnicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Especificaciones</div>
              <div className="font-medium text-gray-900">
                {flota.marca} {flota.modelo}
              </div>
              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                Año: {flota.anio}
                <span className="ml-2 px-1 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                  {new Date().getFullYear() - flota.anio} años
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Combustible</div>
              <div className="flex items-center text-gray-900">
                <Fuel className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{flota.tipo_combustible || 'Diesel'}</span>
              </div>
            </div>
          </div>

          {/* Capacidad */}
          {tieneCapacidad && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Weight className="h-4 w-4" />
                Capacidad
              </div>
              <div className="grid grid-cols-2 gap-2">
                {flota.tn > 0 && (
                  <div>
                    <div className="text-xs text-gray-600">Peso:</div>
                    <div className="text-sm font-medium text-gray-900">{flota.tn} TN</div>
                  </div>
                )}
                {flota.m3 > 0 && (
                  <div>
                    <div className="text-xs text-gray-600">Volumen:</div>
                    <div className="text-sm font-medium text-gray-900">{flota.m3} M³</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parihuelas */}
          {flota.cantidad_parihuelas > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Package className="h-4 w-4" />
                Parihuelas
              </div>
              <div className="text-sm font-medium text-gray-900">
                {flota.cantidad_parihuelas} unidad{flota.cantidad_parihuelas > 1 ? 'es' : ''}
              </div>
            </div>
          )}

          {/* Documentación - Estado resumido */}
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Documentación
              </span>
              {flota.mtc_numero && (
                <span className="text-xs font-mono text-gray-600">
                  MTC: {flota.mtc_numero}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Revisión Técnica */}
              <div className="p-2 rounded-lg border text-center transition-all hover:shadow-sm cursor-pointer" onClick={() => onView(flota)}>
                <div className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  estadoRevisionTecnica.estado === 'vencido' ? 'bg-red-100' :
                  estadoRevisionTecnica.estado === 'por-vencer' ? 'bg-yellow-100' :
                  estadoRevisionTecnica.estado === 'vigente' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <FileCheck className={`h-4 w-4 ${
                    estadoRevisionTecnica.estado === 'vencido' ? 'text-red-600' :
                    estadoRevisionTecnica.estado === 'por-vencer' ? 'text-yellow-600' :
                    estadoRevisionTecnica.estado === 'vigente' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-xs font-medium text-gray-700">Revisión</div>
                <div className={`text-xs ${
                  estadoRevisionTecnica.estado === 'vencido' ? 'text-red-600 font-bold' :
                  estadoRevisionTecnica.estado === 'por-vencer' ? 'text-yellow-600' :
                  estadoRevisionTecnica.estado === 'vigente' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {flota.revision_tecnica_vencimiento ? formatFecha(flota.revision_tecnica_vencimiento) : 'N/A'}
                </div>
              </div>

              {/* SOAT */}
              <div className="p-2 rounded-lg border text-center transition-all hover:shadow-sm cursor-pointer" onClick={() => onView(flota)}>
                <div className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  estadoSOAT.estado === 'vencido' ? 'bg-red-100' :
                  estadoSOAT.estado === 'por-vencer' ? 'bg-yellow-100' :
                  estadoSOAT.estado === 'vigente' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Shield className={`h-4 w-4 ${
                    estadoSOAT.estado === 'vencido' ? 'text-red-600' :
                    estadoSOAT.estado === 'por-vencer' ? 'text-yellow-600' :
                    estadoSOAT.estado === 'vigente' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-xs font-medium text-gray-700">SOAT</div>
                <div className={`text-xs ${
                  estadoSOAT.estado === 'vencido' ? 'text-red-600 font-bold' :
                  estadoSOAT.estado === 'por-vencer' ? 'text-yellow-600' :
                  estadoSOAT.estado === 'vigente' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {flota.soat_vigencia_fin ? formatFecha(flota.soat_vigencia_fin) : 'N/A'}
                </div>
              </div>

              {/* Extintor */}
              <div className="p-2 rounded-lg border text-center transition-all hover:shadow-sm cursor-pointer" onClick={() => onView(flota)}>
                <div className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  estadoExtintor.estado === 'vencido' ? 'bg-red-100' :
                  estadoExtintor.estado === 'por-vencer' ? 'bg-yellow-100' :
                  estadoExtintor.estado === 'vigente' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Droplets className={`h-4 w-4 ${
                    estadoExtintor.estado === 'vencido' ? 'text-red-600' :
                    estadoExtintor.estado === 'por-vencer' ? 'text-yellow-600' :
                    estadoExtintor.estado === 'vigente' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-xs font-medium text-gray-700">Extintor</div>
                <div className={`text-xs ${
                  estadoExtintor.estado === 'vencido' ? 'text-red-600 font-bold' :
                  estadoExtintor.estado === 'por-vencer' ? 'text-yellow-600' :
                  estadoExtintor.estado === 'vigente' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {flota.extintor_vencimiento ? formatFecha(flota.extintor_vencimiento) : 'N/A'}
                </div>
              </div>
            </div>
            
            {/* Leyenda de colores */}
            <div className="flex justify-center gap-3 mt-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Vigente</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span>Por vencer</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span>Vencido</span>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Registro</div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{formatFecha(flota.fecha_registro)}</div>
                  <div className="text-xs text-gray-500">{calcularAntiguedad(flota.fecha_registro)} en sistema</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Revisión Técnica</div>
              <div className="flex items-center text-gray-600">
                <ClipboardCheck className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">
                    Emisión: {flota.revision_tecnica_emision ? formatFecha(flota.revision_tecnica_emision) : 'N/A'}
                  </div>
                  <div className={`text-xs ${
                    estadoRevisionTecnica.estado === 'vencido' ? 'text-red-600' :
                    estadoRevisionTecnica.estado === 'por-vencer' ? 'text-yellow-600' :
                    'text-gray-500'
                  }`}>
                    Vence: {flota.revision_tecnica_vencimiento ? formatFecha(flota.revision_tecnica_vencimiento) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advertencias */}
          {(esViejo || documentosPorVencer > 0) && (
            <div className={`pt-3 border-t border-gray-100 p-3 rounded-lg ${
              documentosPorVencer > 0 ? 'bg-yellow-50 border-yellow-200' :
              esViejo ? 'bg-red-50 border-red-200' : ''
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className={`text-xs font-medium flex items-center gap-1 ${
                  documentosPorVencer > 0 ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  {documentosPorVencer > 0 ? 'Documentación' : 'Advertencia'}
                </div>
              </div>
              <div className={`text-xs ${
                documentosPorVencer > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {documentosPorVencer > 0 ? (
                  <>
                    {documentosPorVencer} documento{documentosPorVencer > 1 ? 's' : ''} {
                      documentosPorVencer > 0 && estadoRevisionTecnica.estado === 'vencido' ? 'vencido' : 'por vencer'
                    }. 
                    {estadoRevisionTecnica.estado === 'vencido' && ' Revisión técnica vencida.'}
                    {estadoSOAT.estado === 'vencido' && ' SOAT vencido.'}
                    {estadoExtintor.estado === 'vencido' && ' Extintor vencido.'}
                  </>
                ) : (
                  'Vehículo con más de 15 años de antigüedad. Considerar mantenimiento preventivo.'
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 truncate max-w-[60%]">
            {flota.observaciones ? (
              <div className="truncate" title={flota.observaciones}>
                <span className="font-medium text-gray-700">Obs:</span> {flota.observaciones}
              </div>
            ) : (
              <span className="text-gray-400">Sin observaciones</span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onView(flota)}
              variant="secondary"
              size="small"
              icon={Eye}
              title="Ver detalles"
            />
            <Button
              onClick={() => onEdit(flota)}
              variant="secondary"
              size="small"
              icon={Edit}
              title="Editar"
            />
            <Button
              onClick={() => onDelete(flota.id)}
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

export default React.memo(FlotaCard);