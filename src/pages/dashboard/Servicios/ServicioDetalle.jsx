import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  Building,
  Users,
  User,
  FileText,
  Hash,
  Ruler,
  UserCheck,
  Target,
  ArrowRight,
  Phone,
  Mail,
  Home,
  Car,
  UserCircle,
  File,
  AlertCircle,
  Download,
  Printer,
  Edit,
  ArrowLeft,
  Loader2,
  Info,
  Briefcase,
  Map,
  Navigation,
  FileSearch,
  CalendarDays,
  Clock3,
  Route,
  Trash2,
  ChevronRight,
  Box,
  Weight,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import { serviciosPrincipalesAPI } from '../../../api/endpoints/servicioPrincipal';

const ServicioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchServicioDetalle();
  }, [id]);

  const fetchServicioDetalle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await serviciosPrincipalesAPI.getServicioPrincipalById(id);
      
      // Formatear datos para el formulario de edición
      const formattedData = {
        ...data,
        cliente: data.cliente ? {
          id: data.cliente._id || data.cliente.id,
          nombre: data.cliente.razon_social || data.cliente.nombre || "Sin nombre",
          ruc: data.cliente.numero_documento || "",
          direccion: data.cliente.direccion || "",
          telefono: data.cliente.telefono || "",
          email: data.cliente.email || ""
        } : null,
        
        cuenta: data.cuenta ? {
          id: data.cuenta._id || data.cuenta.id,
          nombre: data.cuenta.nombre || data.cuenta.nombre_cuenta || "Sin nombre",
          tipo_pago: data.cuenta.tipo_pago || "",
          es_principal: data.cuenta.es_principal || false
        } : null,
        
        proveedor: data.proveedor ? {
          id: data.proveedor._id || data.proveedor.id,
          nombre: data.proveedor.razon_social || data.proveedor.nombre || "Sin nombre",
          ruc: data.proveedor.numero_documento || "",
          contacto: data.proveedor.contacto || "",
          telefono: data.proveedor.telefono || "",
          email: data.proveedor.email || ""
        } : null,
        
        flota: data.flota ? {
          id: data.flota._id || data.flota.id,
          nombre: `${data.flota.placa} - ${data.flota.marca} ${data.flota.modelo}`,
          placa: data.flota.placa,
          marca: data.flota.marca,
          modelo: data.flota.modelo,
          tipo_vehiculo: data.flota.tipo_vehiculo || data.flota.tipo || "",
          capacidad_m3: data.flota.capacidad_m3 || data.flota.m3 || ""
        } : null,
        
        conductor: data.conductor ? Array.isArray(data.conductor) ? data.conductor.map(c => ({
          id: c._id || c.id,
          nombre: c.nombres_completos || c.nombre || "Sin nombre",
          licencia: c.licencia_conducir || "",
          dni: c.dni || ""
        })) : [{
          id: data.conductor._id || data.conductor.id,
          nombre: data.conductor.nombres_completos || data.conductor.nombres || "Sin nombre",
          licencia: data.conductor.licencia_conducir || "",
          dni: data.conductor.dni || ""
        }] : [],
        
        auxiliar: data.auxiliar ? Array.isArray(data.auxiliar) ? data.auxiliar.map(a => ({
          id: a._id || a.id,
          nombre: a.nombres_completos || a.nombres || "Sin nombre",
          dni: a.dni || ""
        })) : [{
          id: data.auxiliar._id || data.auxiliar.id,
          nombre: data.auxiliar.nombres_completos || data.auxiliar.nombres || "Sin nombre",
          dni: data.auxiliar.dni || ""
        }] : [],
        
        // Determinar si usar campos personalizados
        m3: data.m3 === "otro" ? "otro" : data.m3 || "",
        m3Custom: data.m3 === "otro" ? data.m3 : "",
        tn: data.tn === "otro" ? "otro" : data.tn || "",
        tnCustom: data.tn === "otro" ? data.tn : "",
        
        tipoServicio: data.tipo_servicio || "",
        modalidad: data.modalidad_servicio || "",
        
        origen: data.origen || "",
        destino: data.destino || "",
        fechaServicio: data.fecha_servicio || "",
        fechaSalida: data.fecha_salida || "",
        horaCita: data.hora_cita || "08:00",
        giaRr: data.gia_rr || "",
        giaRt: data.gia_rt || "",
        mes: data.mes || "",
        solicitud: data.solicitud || "Dia",
        zona: { id: "lima", nombre: data.zona || "Lima" },
        descripcion: data.descripcion || ""
      };
      
      setServicio(formattedData);
    } catch (err) {
      setError('Error al cargar los detalles del servicio: ' + err.message);
      console.error('Error fetching servicio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await serviciosPrincipalesAPI.deleteServicioPrincipal(id);
      navigate('/servicios');
    } catch (err) {
      setError('Error al eliminar el servicio: ' + err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getHora = (horaStr) => {
    if (!horaStr) return 'Por definir';
    return horaStr;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-red-200 p-6 rounded-lg text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el servicio</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-3">
              <Button
                onClick={() => navigate('/servicios')}
                variant="secondary"
                icon={ArrowLeft}
              >
                Volver
              </Button>
              <Button
                onClick={fetchServicioDetalle}
                variant="primary"
                icon={Loader2}
                isLoading={isLoading}
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 p-6 rounded-lg text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Servicio no encontrado</h3>
            <p className="text-gray-600 mb-6">El servicio solicitado no existe.</p>
            <Button
              onClick={() => navigate('/servicios')}
              variant="primary"
              icon={ArrowLeft}
            >
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/servicios')}
                variant="ghost"
                size="small"
                icon={ArrowLeft}
                className="flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {servicio.codigo_servicio_principal || id}
                  </h1>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                    {servicio.tipoServicio}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {servicio.zona.nombre}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {servicio.solicitud}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handlePrint}
                variant="outline"
                size="small"
                icon={Printer}
              >
                Imprimir
              </Button>
              <Button
                onClick={() => navigate(`/servicios/editar/${id}`)}
                variant="primary"
                size="small"
                icon={Edit}
              >
                Editar
              </Button>
            </div>
          </div>
        </div>

        {/* Grid principal de datos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Columna 1: Información básica */}
          <div className="space-y-4">
            {/* Fechas y Horas */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Fechas y Horarios
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Fecha Servicio:</span>
                  <span className="font-medium">{servicio.fechaServicio}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Fecha Salida:</span>
                  <span className="font-medium">{servicio.fechaSalida}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Hora Cita:</span>
                  <span className="font-medium">{servicio.horaCita}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Mes:</span>
                  <span className="font-medium">{servicio.mes}</span>
                </div>
              </div>  
            </div>

            {/* Capacidades */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Capacidad
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Metros Cúbicos:</span>
                  <span className="font-medium">{servicio.m3 === "otro" ? servicio.m3Custom : servicio.m3 || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Toneladas:</span>
                  <span className="font-medium">{servicio.tn === "otro" ? servicio.tnCustom : servicio.tn || '-'}</span>
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <File className="h-5 w-5 text-purple-600" />
                Documentación
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">GIA RR:</span>
                  <span className="font-medium">{servicio.giaRr || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">GIA RT:</span>
                  <span className="font-medium">{servicio.giaRt || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2: Personal y Vehículo */}
          <div className="space-y-4">
            {/* Cliente, Cuenta, Proveedor */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Cliente y Proveedores
              </h2>
              <div className="space-y-4">
                {servicio.cliente && (
                  <div className="border-b border-gray-100 pb-3">
                    <div className="text-sm text-gray-500 mb-1">Cliente</div>
                    <div className="font-medium">{servicio.cliente.nombre}</div>
                    {servicio.cliente.ruc && (
                      <div className="text-sm text-gray-600">RUC: {servicio.cliente.ruc}</div>
                    )}
                  </div>
                )}
                
                {servicio.cuenta && (
                  <div className="border-b border-gray-100 pb-3">
                    <div className="text-sm text-gray-500 mb-1">Cuenta</div>
                    <div className="font-medium">{servicio.cuenta.nombre}</div>
                    {servicio.cuenta.tipo_pago && (
                      <div className="text-sm text-gray-600">Tipo: {servicio.cuenta.tipo_pago}</div>
                    )}
                  </div>
                )}
                
                {servicio.proveedor && (
                  <div className="pb-3">
                    <div className="text-sm text-gray-500 mb-1">Proveedor</div>
                    <div className="font-medium">{servicio.proveedor.nombre}</div>
                    {servicio.proveedor.ruc && (
                      <div className="text-sm text-gray-600">RUC: {servicio.proveedor.ruc}</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Vehículo */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-green-600" />
                Vehículo
              </h2>
              {servicio.flota ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Placa:</span>
                    <span className="font-medium">{servicio.flota.placa}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Marca/Modelo:</span>
                    <span className="font-medium">{servicio.flota.marca} {servicio.flota.modelo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="font-medium">{servicio.flota.tipo_vehiculo || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Capacidad M3:</span>
                    <span className="font-medium">{servicio.flota.capacidad_m3 || '-'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">No asignado</div>
              )}
            </div>

            {/* Conductor */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-orange-600" />
                Conductor
              </h2>
              {servicio.conductor && servicio.conductor.length > 0 ? (
                <div className="space-y-3">
                  {servicio.conductor.map((cond, index) => (
                    <div key={cond.id || index} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="font-medium">{cond.nombre || servicio.conductor?.[0]?.nombres_completos || servicio.conductor?.[0]?.nombres || servicio.conductor?.[0]?.nombre || 'N/A'}</div> 
                      <div className="text-sm text-gray-600 space-y-1">
                        {cond.licencia && <div>Licencia: {cond.licencia}</div>}
                        {cond.dni && <div>DNI: {cond.dni}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">No asignado</div>
              )}
            </div>

            {/* Auxiliar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Auxiliar
              </h2>
              {servicio.auxiliar && servicio.auxiliar.length > 0 ? (
                <div className="space-y-3">
                  {servicio.auxiliar.map((aux, index) => (
                    <div key={aux.id || index} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="font-medium">{aux.nombre}</div>
                      {aux.dni && (
                        <div className="text-sm text-gray-600">DNI: {aux.dni}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">No asignado</div>
              )}
            </div>
          </div>

          {/* Columna 3: Ruta y Detalles */}
          <div className="space-y-4">
            {/* Ruta */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Route className="h-5 w-5 text-red-600" />
                Ruta del Servicio
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-2">Origen</div>
                  <div className="font-medium bg-blue-50 p-3 rounded border border-blue-100">
                    {servicio.origen || 'No especificado'}
                  </div>
                </div>
                
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-2">Destino</div>
                  <div className="font-medium bg-green-50 p-3 rounded border border-green-100">
                    {servicio.destino || 'No especificado'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tipo de Servicio y Modalidad */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-600" />
                Detalles del Servicio
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Tipo de Servicio:</span>
                  <span className="font-medium">{servicio.tipoServicio || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Modalidad:</span>
                  <span className="font-medium">{servicio.modalidad || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Zona:</span>
                  <span className="font-medium">{servicio.zona.nombre}</span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {servicio.descripcion && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-600" />
                  Descripción
                </h2>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap">
                  {servicio.descripcion}
                </div>
              </div>
            )}

            {/* Acciones rápidas */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate(`/servicios/editar/${id}`)}
                  variant="primary"
                  className="w-full"
                  icon={Edit}
                >
                  Editar Servicio
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="w-full"
                  icon={Printer}
                >  
                  Imprimir ahora
                </Button>
                <Button
                  onClick={() => navigate('/servicios')}
                  variant="outline"
                  className="w-full"
                  icon={ArrowLeft}
                >
                  Volver a Servicios
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen en una sola fila (opcional, para vista más compacta) */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen Completo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Servicio</div>
              <div className="font-medium">{servicio.tipoServicio} ({servicio.solicitud})</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Cliente</div>
              <div className="font-medium">{servicio.cliente?.nombre || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Ruta</div>
              <div className="font-medium">{servicio.origen} → {servicio.destino}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Capacidad</div>
              <div className="font-medium">
                {servicio.m3 === "otro" ? servicio.m3Custom : servicio.m3 || '-'} m³ / 
                {servicio.tn === "otro" ? servicio.tnCustom : servicio.tn || '-'} TN
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Confirmar eliminación?"
        message={
          <div>
            <p className="mb-2">Esta acción eliminará permanentemente el servicio:</p>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <div className="font-semibold text-red-800">
                {servicio.codigo_servicio_principal || id} - {servicio.tipoServicio}
              </div>
              <div className="text-sm text-red-600 mt-1">
                {servicio.origen} → {servicio.destino}
              </div>
            </div>
            <p className="mt-3 text-red-600 font-medium">
              Esta acción no se puede deshacer.
            </p>
          </div>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ServicioDetalle;