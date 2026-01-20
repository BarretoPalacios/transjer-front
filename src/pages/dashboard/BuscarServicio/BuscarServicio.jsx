import React, { useState, useCallback } from 'react';
import { Search, Loader2, AlertCircle, Hash } from 'lucide-react';
import { serviciosPrincipalesAPI } from '../../../api/endpoints/servicioPrincipal';

const BuscarServicio = () => {
  const [codigo, setCodigo] = useState('');
  const [servicio, setServicio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscarServicio = useCallback(async () => {
    if (!codigo.trim()) {
      setError('Por favor ingresa un código de servicio');
      return;
    }

    setIsLoading(true);
    setError(null);
    setServicio(null);

    try {
      // Usando el endpoint correcto
      const response = await serviciosPrincipalesAPI.getServicioPrincipalByCodigo(codigo.trim());
      
      if (response) {
        setServicio(response);
      } else {
        setError('No se encontró ningún servicio con ese código');
      }
    } catch (err) {
      setError('Error al buscar el servicio: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [codigo]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarServicio();
    }
  };

  const formatFecha = (fechaObj) => {
    if (!fechaObj) return 'N/A';
    
    if (fechaObj.$date) {
      const date = new Date(fechaObj.$date);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    const date = new Date(fechaObj);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatHora = (horaObj) => {
    if (!horaObj) return 'N/A';
    
    if (horaObj.$date) {
      const date = new Date(horaObj.$date);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    const date = new Date(horaObj);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4">
      {/* Buscador */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Buscar Servicio por Código</h1>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 pl-11 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Ej: SRV-0000000038 o HIST-202601-0002"
                autoFocus
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <button
            onClick={buscarServicio}
            disabled={isLoading || !codigo.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            Buscar
          </button>
        </div>

        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Resultado en formato tabla */}
      {servicio && (
        <div className="bg-white border border-gray-300 rounded">
          {/* Header de la tabla */}
          <div className="border-b border-gray-300 p-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold">{servicio.codigo_servicio_principal}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  servicio.estado === 'Completado' ? 'bg-green-100 text-green-800 border border-green-300' :
                  servicio.estado === 'Cancelado' ? 'bg-red-100 text-red-800 border border-red-300' :
                  servicio.estado === 'Reprogramado' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                  'bg-yellow-100 text-yellow-800 border border-yellow-300'
                }`}>
                  {servicio.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Contenido de la tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <tbody>
                {/* Información Básica */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50 w-1/4">Código</td>
                  <td className="px-3 py-2">{servicio.codigo_servicio_principal}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50 w-1/4">Tipo Servicio</td>
                  <td className="px-3 py-2">{servicio.tipo_servicio}</td>
                </tr>
                
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Modalidad</td>
                  <td className="px-3 py-2">{servicio.modalidad_servicio || 'N/A'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Zona</td>
                  <td className="px-3 py-2">{servicio.zona || 'N/A'}</td>
                </tr>

                {/* Fechas y Horas */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Fecha de Servicio</td>
                  <td className="px-3 py-2">{formatFecha(servicio.fecha_servicio)}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Fecha de Salida</td>
                  <td className="px-3 py-2">{formatFecha(servicio.fecha_salida)}</td>
                </tr>
                
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Hora de Cita</td>
                  <td className="px-3 py-2">{(servicio.hora_cita)}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Mes</td>
                  <td className="px-3 py-2">{servicio.mes || 'N/A'}</td>
                </tr>
                
                {/* Cliente */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Cliente</td>
                  <td className="px-3 py-2" colSpan="3">{servicio.cliente?.nombre || 'N/A'}</td>
                </tr>
                
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">RUC/DNI</td>
                  <td className="px-3 py-2">{servicio.cliente?.ruc || servicio.cliente?.numero_documento || 'N/A'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Razón Social</td>
                  <td className="px-3 py-2">{servicio.cliente?.razon_social || 'N/A'}</td>
                </tr>

                {/* Cuenta */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Cuenta</td>
                  <td className="px-3 py-2">{servicio.cuenta?.nombre || 'N/A'}</td>
                  {/* <td className="px-3 py-2 font-medium bg-gray-50">Tipo Pago</td>
                  <td className="px-3 py-2">{servicio.cuenta?.tipo_pago || 'N/A'}</td> */}
                </tr>

                {/* <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Días Crédito</td>
                  <td className="px-3 py-2">{servicio.cuenta?.dias_credito || 0}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Límite Crédito</td>
                  <td className="px-3 py-2">{servicio.cuenta?.limite_credito || 0}</td>
                </tr> */}

                {/* Ruta */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Origen</td>
                  <td className="px-3 py-2">{servicio.origen || 'N/A'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Destino</td>
                  <td className="px-3 py-2">{servicio.destino || 'N/A'}</td>
                </tr>

                {/* <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Cliente Destino</td>
                  <td className="px-3 py-2" colSpan="3">{servicio.cliente_destino || 'N/A'}</td>
                </tr> */}

                {/* Vehículo */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Vehículo</td>
                  <td className="px-3 py-2">{servicio.flota?.placa || 'N/A'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Tipo</td>
                  <td className="px-3 py-2">{servicio.flota?.tipo_vehiculo || 'N/A'}</td>
                </tr>

                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Marca</td>
                  <td className="px-3 py-2">{servicio.flota?.marca || 'N/A'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Modelo</td>
                  <td className="px-3 py-2">{servicio.flota?.modelo || 'N/A'}</td>
                </tr>

                <tr className="border-b border-gray-200">
                  {/* <td className="px-3 py-2 font-medium bg-gray-50">Capacidad Vehículo</td>
                  <td className="px-3 py-2">{servicio.flota?.capacidad_m3 || 0} m³</td> */}
                  {/* <td className="px-3 py-2 font-medium bg-gray-50">Nombre Conductor</td>
                  <td className="px-3 py-2">{servicio.flota?.nombre_conductor || 'N/A'}</td> */}
                </tr>

                {/* Personal */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Conductor</td>
                  <td className="px-3 py-2">
                    {servicio.conductor?.[0]?.nombres_completos || servicio.conductor?.[0]?.nombres || 'N/A'}
                  </td>
                  <td className="px-3 py-2 font-medium bg-gray-50">DNI</td>
                  <td className="px-3 py-2">{servicio.conductor?.[0]?.dni || 'N/A'}</td>
                </tr>

                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Licencia</td>
                  <td className="px-3 py-2">{servicio.conductor?.[0]?.licencia_conducir || 'N/A'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Tipo</td>
                  <td className="px-3 py-2">{servicio.conductor?.[0]?.tipo || 'N/A'}</td>
                </tr>

                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Auxiliar</td>
                  <td className="px-3 py-2">
                    {servicio.auxiliar?.[0]?.nombres_completos || servicio.auxiliar?.[0]?.nombre || 'Sin auxiliar'}
                  </td>
                  <td className="px-3 py-2 font-medium bg-gray-50">DNI Auxiliar</td>
                  <td className="px-3 py-2">{servicio.auxiliar?.[0]?.dni || 'N/A'}</td>
                </tr>

                {/* Capacidad de Carga */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Carga (m³)</td>
                  <td className="px-3 py-2">{servicio.m3 || '0'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Carga (TN)</td>
                  <td className="px-3 py-2">{servicio.tn || '0'}</td>
                </tr>

                {/* Documentos */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">GIA RR</td>
                  <td className="px-3 py-2">{servicio.gia_rr || 'No asignado'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">GIA RT</td>
                  <td className="px-3 py-2">{servicio.gia_rt || 'No asignado'}</td>
                </tr>

                {/* Proveedor */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Proveedor</td>
                  <td className="px-3 py-2">{servicio.proveedor?.nombre || 'N/A'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">RUC Proveedor</td>
                  <td className="px-3 py-2">{servicio.proveedor?.ruc || servicio.proveedor?.numero_documento || 'N/A'}</td>
                </tr>

                {/* <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Razón Social Proveedor</td>
                  <td className="px-3 py-2" colSpan="3">{servicio.proveedor?.razon_social || 'N/A'}</td>
                </tr> */}

                {/* Estado del Servicio */}
                {/* <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Servicio Cerrado</td>
                  <td className="px-3 py-2">{servicio.servicio_cerrado ? 'Sí' : 'No'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Editable</td>
                  <td className="px-3 py-2">{servicio.es_editable ? 'Sí' : 'No'}</td>
                </tr>

                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Eliminable</td>
                  <td className="px-3 py-2">{servicio.es_eliminable ? 'Sí' : 'No'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Pertenece a Factura</td>
                  <td className="px-3 py-2">{servicio.pertenece_a_factura ? 'Sí' : 'No'}</td>
                </tr> */}

                {/* Fechas importantes */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Fecha Registro</td>
                  <td className="px-3 py-2">{formatFecha(servicio.fecha_registro)}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Última Modificación</td>
                  <td className="px-3 py-2">{formatFecha(servicio.fecha_ultima_modificacion) || 'N/A'}</td>
                </tr>

                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Fecha Completado</td>
                  <td className="px-3 py-2">{formatFecha(servicio.fecha_completado) || 'N/A'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Fecha Cierre</td>
                  <td className="px-3 py-2">{formatFecha(servicio.fecha_cierre) || 'N/A'}</td>
                </tr>

                {/* Responsable */}
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-medium bg-gray-50">Responsable</td>
                  <td className="px-3 py-2">{servicio.responsable || 'N/A'}</td>
                  <td className="px-3 py-2 font-medium bg-gray-50">Descripción</td>
                  <td className="px-3 py-2">{servicio.descripcion || 'N/A'}</td>
                </tr>

                {/* Historial de Estados */}
                {/* {servicio.historial_estados?.length > 0 && (
                
                  <tr>
                    <td className="px-3 py-2 font-medium bg-gray-50 align-top">Historial de Estados</td>
                    <td className="px-3 py-2" colSpan="3">
                      <div className="space-y-2">
                        {servicio.historial_estados.map((historial, index) => (
                          <div key={index} className="text-xs border-l-2 border-gray-400 pl-2 py-1">
                            <div className="font-medium">
                              {historial.estado_anterior} → {historial.estado_nuevo}
                            </div>
                            <div className="text-gray-600">
                              {formatFecha(historial.fecha || historial.fecha_cambio)} - {historial.usuario}
                            </div>
                            {historial.justificacion && (
                              <div className="text-gray-500 mt-0.5">
                                {historial.justificacion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )} */}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estado inicial */}
      {!servicio && !isLoading && !error && (
        <div className="text-center py-12 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Ingresa un código de servicio para buscar</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(BuscarServicio);