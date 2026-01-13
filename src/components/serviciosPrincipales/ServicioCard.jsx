import React from "react";
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  Building,
  Users,
  ArrowRight,
  Eye,
  Edit,
  User,
  FileText,
  Hash,
  CheckCircle,
  XCircle,
  ClockIcon,
} from "lucide-react";
import Button from "../common/Button/Button";

const ServicioCard = ({
  servicio,
  onView,
  onEdit = true,
  onDelete,
  showEdit = true,
  showDelete = false, // Cambiado a false por defecto como solicitaste
}) => {
  // Función para obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "completado":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          badge: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          gradient: "from-green-50 to-emerald-50",
          headerGradient: "from-green-100/20 to-emerald-100/20",
        };
      case "cancelado":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          badge: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          gradient: "from-red-50 to-rose-50",
          headerGradient: "from-red-100/20 to-rose-100/20",
        };
      case "programado":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: ClockIcon,
          gradient: "from-yellow-50 to-amber-50",
          headerGradient: "from-yellow-100/20 to-amber-100/20",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          icon: ClockIcon,
          gradient: "from-gray-50 to-gray-100",
          headerGradient: "from-gray-100 to-gray-200",
        };
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "CARGA/DESCARGA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Importación":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Exportación":
        return "bg-green-100 text-green-800 border-green-200";
      case "Carga Especial":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Distribución":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getZonaColor = (zona) => {
    if (zona?.includes("Lima"))
      return "bg-blue-50 text-blue-700 border-blue-100";
    if (zona?.includes("Provincia"))
      return "bg-green-50 text-green-700 border-green-100";
    return "bg-gray-50 text-gray-700 border-gray-100";
  };

  // Función para formatear la fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Función para obtener el día de la semana
  const getDiaSemana = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-PE", { weekday: "long" });
  };

  // Obtener hora formateada
  const getHora = (horaStr) => {
    if (!horaStr) return "Por definir";
    const [hours, minutes] = horaStr.split(":");
    return `${hours}:${minutes}`;
  };

  const estadoInfo = getEstadoColor(servicio.estado);
  const EstadoIcon = estadoInfo.icon;

  return (
    <div className={`bg-white rounded-xl border ${estadoInfo.border} overflow-hidden hover:shadow-md transition-all duration-200 group`}>
      {/* Header con código, tipo de servicio y estado */}
      <div className={`p-4 border-b ${estadoInfo.border} bg-gradient-to-r ${estadoInfo.headerGradient}`}>
        {/* Fila superior */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${estadoInfo.border}`}>
              <Truck className={`h-5 w-5 ${estadoInfo.text}`} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Hash className="h-3 w-3" />
                <span className="font-mono font-semibold text-gray-700">
                  {servicio.codigo_servicio_principal || servicio.id}
                </span>
              </div>

              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getTipoColor(
                  servicio.tipo_servicio
                )}`}
              >
                <Package className="h-3 w-3 mr-1" />
                <span className="truncate max-w-[100px]">
                  {servicio.tipo_servicio}
                </span>
              </span>
            </div>

            {/* Estado destacado */}
            <div className="mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${estadoInfo.badge}`}>
                <EstadoIcon className="h-3 w-3 mr-1" />
                {servicio.estado || "Programado"}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getZonaColor(
                  servicio.zona
                )}`}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {servicio.zona}
              </span>

              <span className="text-xs text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {servicio.solicitud}
              </span>
            </div>
          </div>
        </div>

        {/* GIA RR / RT debajo */}
        {(servicio.gia_rr || servicio.gia_rt) && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="p-2 bg-white/70 rounded border border-gray-200/50">
              <div className="text-[10px] text-gray-500 leading-none">GRR</div>
              <div className="text-xs font-medium text-gray-900 truncate">
                {servicio.gia_rr}
              </div>
            </div>

            <div className="p-2 bg-white/70 rounded border border-gray-200/50">
              <div className="text-[10px] text-gray-500 leading-none">GRT</div>
              <div className="text-xs font-medium text-gray-900 truncate">
                {servicio.gia_rt}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información principal */}
      <div className="p-4">
        {/* Fecha y hora destacada */}
        <div className={`mb-4 p-3 rounded-lg border ${estadoInfo.border} bg-gradient-to-r ${estadoInfo.gradient}`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Fecha de Servicio</span>
              </div>
              <div className="pl-6">
                <div className="font-semibold text-gray-900 text-lg">
                  {formatFecha(servicio.fecha_servicio)}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {getDiaSemana(servicio.fecha_servicio)}
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Hora Cita</span>
              </div>
              <div className="pl-6">
                <div className="font-semibold text-gray-900 text-lg">
                  {getHora(servicio.hora_cita)}
                </div>
                <div className="text-sm text-gray-600">
                  {servicio.fecha_salida &&
                    `Salida: ${formatFecha(servicio.fecha_salida)}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ruta: Origen → Destino */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${estadoInfo.text.replace('text-', 'bg-')}`}></div>
              <span className="text-sm font-medium text-gray-700">Ruta</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border ${estadoInfo.border} ${estadoInfo.bg}`}>
              <div className="text-xs text-gray-500 mb-1">Origen</div>
              <div className="font-medium text-gray-900 truncate">
                {servicio.origen || "No especificado"}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${estadoInfo.border} ${estadoInfo.bg}`}>
              <div className="text-xs text-gray-500 mb-1">Destino</div>
              <div className="font-medium text-gray-900 truncate">
                {servicio.destino || "No especificado"}
              </div>
              {servicio.cliente_destino && (
                <div className="text-xs text-gray-600 mt-1 truncate">
                  Destinatario: {servicio.cliente_destino}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de Cliente/Proveedor/Cuenta */}
        <div className="space-y-3">
          {/* Cuenta */}
          {servicio.cuenta && (
            <div className={`p-3 rounded-lg border ${estadoInfo.border} ${estadoInfo.bg}`}>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Building className="h-4 w-4" />
                <span className="font-semibold">Cuenta</span>
              </div>
              <div className="font-medium text-gray-900">
                {servicio.cuenta.nombre}
              </div>
              {servicio.cuenta.ruc && (
                <div className="text-xs text-gray-600 mt-1">
                  RUC: {servicio.cuenta.ruc}
                </div>
              )}
            </div>
          )}

          {/* Cliente */}
          {servicio.cliente && (
            <div className={`p-3 rounded-lg border ${estadoInfo.border} ${estadoInfo.bg}`}>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <User className="h-4 w-4" />
                <span className="font-semibold">Cliente</span>
              </div>
              <div className="font-medium text-gray-900">
                {servicio.cliente.razon_social ||
                  servicio.cliente.nombre_comercial}
              </div>
              <div className="flex gap-3 text-xs text-gray-600 mt-1">
                <span>
                  {servicio.cliente.tipo_documento}:{" "}
                  {servicio.cliente.numero_documento}
                </span>
                <span className="capitalize">
                  {servicio.cliente.tipo_cliente}
                </span>
              </div>
            </div>
          )}

          {/* Proveedor */}
          {servicio.proveedor && (
            <div className={`p-3 rounded-lg border ${estadoInfo.border} ${estadoInfo.bg}`}>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Users className="h-4 w-4" />
                <span className="font-semibold">Proveedor</span>
              </div>
              <div className="font-medium text-gray-900">
                {servicio.proveedor.razon_social ||
                  servicio.proveedor.nombre_comercial}
              </div>
              <div className="flex gap-3 text-xs text-gray-600 mt-1">
                <span>RUC: {servicio.proveedor.ruc}</span>
                <span className="capitalize">{servicio.proveedor.tipo}</span>
              </div>
            </div>
          )}
        </div>

        {/* Información de Vehículo y Conductor/Auxiliar */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {servicio.vehiculo && (
            <div className={`p-3 rounded-lg border ${estadoInfo.border} ${estadoInfo.bg}`}>
              <div className="text-xs text-gray-500 mb-1">Vehículo</div>
              <div className="font-medium text-gray-900">
                {servicio.vehiculo.placa}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {servicio.vehiculo.marca} {servicio.vehiculo.modelo}
                {servicio.vehiculo.tn && ` • ${servicio.vehiculo.tn} TN`}
                {servicio.m3_tn && ` • ${servicio.m3_tn} m³/TN`}
              </div>
            </div>
          )}

          {servicio.conductor && (
            <div className={`p-3 rounded-lg border ${estadoInfo.border} ${estadoInfo.bg}`}>
              <div className="text-xs text-gray-500 mb-1">Conductor</div>
              <div className="font-medium text-gray-900">
                {servicio.conductor.nombres} {servicio.conductor.apellidos}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {servicio.conductor.licencia_conducir &&
                  `Lic: ${servicio.conductor.licencia_conducir}`}
                {servicio.conductor.categoria_licencia &&
                  ` • Cat: ${servicio.conductor.categoria_licencia}`}
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500">Mes</div>
              <div className="font-semibold text-gray-900">
                {servicio.mes || "-"}
              </div>
            </div>
            <div className="p-2 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500">Auxiliar</div>
              <div className="font-semibold text-gray-900">
                {servicio.aux === "1" ? "Sí" : "No"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer de la tarjeta */}
      <div className={`p-4 border-t ${estadoInfo.border} ${estadoInfo.bg}`}>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Registro: </span>
            {servicio.fecha_registro || servicio.created_at
              ? formatFecha(servicio.fecha_registro || servicio.created_at)
              : "N/A"}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onView && onView(servicio)}
              variant="ghost"
              size="small"
              icon={Eye}
              title="Ver detalles"
              className={`${estadoInfo.text} hover:${estadoInfo.text.replace('text-', 'bg-')}/20 hover:${estadoInfo.border}`}
            />
            {showEdit && onEdit && (
              <Button
                onClick={() => onEdit(servicio)}
                variant="ghost"
                size="small"
                icon={Edit}
                title="Editar"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              />
            )}
            {/* Eliminar oculto como solicitaste */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ServicioCard);