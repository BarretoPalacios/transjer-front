import React from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  Briefcase,
  Clock,
  DollarSign,
  AlertCircle,
  IdCard,
  Shield,
  Star,
  MoreVertical,
  Banknote,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Button from "../common/Button/Button";

const PersonalCard = ({
  trabajador,
  onView,
  onEdit,
  onDelete,
  getEstadoColor,
  getTipoColor,
  calcularAntiguedad,
  calcularEdad,
  formatFecha,
  className = "",
  ...props
}) => {
  const licenciaProximaVencer =
    trabajador.fecha_venc_licencia &&
    (new Date(trabajador.fecha_venc_licencia) - new Date()) /
      (1000 * 60 * 60 * 24) <=
      30;

  const esConductor = trabajador.tipo === "Conductor";
  const tieneLicenciaVencida =
    trabajador.fecha_venc_licencia &&
    new Date(trabajador.fecha_venc_licencia) < new Date();

  const generarLinkMaps = (direccion) => {
    if (!direccion) return null;

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      direccion
    )}`;
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`}
      {...props}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            {/* Avatar/Icono */}
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white">
                <User className="h-7 w-7 text-blue-600" />
              </div>
              {/* Indicador de estado */}
              <div
                className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center ${
                  trabajador.estado === "Activo"
                    ? "bg-green-500"
                    : trabajador.estado === "Inactivo"
                    ? "bg-red-500"
                    : trabajador.estado === "Licencia"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
              >
                {trabajador.estado === "Activo" && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {trabajador.nombres} {trabajador.apellidos}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono text-gray-500 flex items-center gap-1">
                  <IdCard className="h-3 w-3" />
                  {trabajador.codigo_empleado || `EMP-${trabajador.dni}`}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
                    trabajador.estado
                  )}`}
                >
                  {trabajador.estado}
                </span>
                {trabajador.turno === "Día" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Turno Día
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tipo y Cargo */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(
              trabajador.tipo
            )}`}
          >
            {trabajador.tipo}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Briefcase className="h-3 w-3 mr-1" />
            {trabajador.cargo || "Sin cargo asignado"}
          </span>
        </div>

        {/* Información principal */}
        <div className="space-y-3 text-sm">
          {/* Documento y Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">
                Documento
              </div>
              <div className="font-medium text-gray-900">
                DNI: {trabajador.dni}
              </div>
              {trabajador.licencia_conducir && (
                <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <Car className="h-3 w-3" />
                  Lic: {trabajador.licencia_conducir}
                  {trabajador.categoria_licencia && (
                    <span className="ml-2 px-1 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {trabajador.categoria_licencia}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">
                Contacto
              </div>
              {trabajador.telefono && (
                <div className="flex items-center text-gray-900 mb-1">
                  <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{trabajador.telefono}</span>
                </div>
              )}
              {trabajador.email && (
                <div className="flex items-center text-gray-900">
                  <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{trabajador.email}</span>
                </div>
              )}
              {!trabajador.telefono && !trabajador.email && (
                <span className="text-gray-400 text-xs">Sin contacto</span>
              )}
            </div>
          </div>

          {/* Fechas importantes */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">
                Fechas
              </div>
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">
                    Ingreso: {formatFecha(trabajador.fecha_ingreso)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {calcularAntiguedad(trabajador.fecha_ingreso)} de antigüedad
                  </div>
                </div>
              </div>
              {trabajador.fecha_nacimiento && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Nacimiento: {formatFecha(trabajador.fecha_nacimiento)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {calcularEdad(trabajador.fecha_nacimiento)} años
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">
                Información Laboral
              </div>
              {trabajador.turno && (
                <div className="flex items-center text-gray-600 mb-1">
                  <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span>Turno: {trabajador.turno}</span>
                </div>
              )}
              {trabajador.salario && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900">
                    S/{" "}
                    {parseFloat(trabajador.salario).toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Información de licencia para conductores */}
          {esConductor && trabajador.licencia_conducir && (
            <div
              className={`pt-3 border-t border-gray-100 ${
                licenciaProximaVencer || tieneLicenciaVencida
                  ? "bg-red-50 p-3 rounded-lg"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <Car className="h-4 w-4" />
                  Información de Licencia
                </div>
                {(licenciaProximaVencer || tieneLicenciaVencida) && (
                  <div className="flex items-center gap-1">
                    <AlertCircle
                      className={`h-4 w-4 ${
                        tieneLicenciaVencida
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        tieneLicenciaVencida
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {tieneLicenciaVencida ? "VENCIDA" : "POR VENCER"}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-600">Número:</div>
                  <div className="text-sm font-medium text-gray-900">
                    {trabajador.licencia_conducir}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Categoría:</div>
                  <div className="text-sm font-medium text-gray-900">
                    {trabajador.categoria_licencia}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-600">Vence:</div>
                  <div
                    className={`text-sm font-medium ${
                      tieneLicenciaVencida
                        ? "text-red-600"
                        : licenciaProximaVencer
                        ? "text-yellow-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formatFecha(trabajador.fecha_venc_licencia)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información bancaria */}
          {(trabajador.banco || trabajador.numero_cuenta) && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Banknote className="h-4 w-4" />
                Información Bancaria
              </div>
              <div className="grid grid-cols-2 gap-2">
                {trabajador.banco && (
                  <div>
                    <div className="text-xs text-gray-600">Banco:</div>
                    <div className="text-sm font-medium text-gray-900">
                      {trabajador.banco}
                    </div>
                  </div>
                )}
                {trabajador.numero_cuenta && (
                  <div>
                    <div className="text-xs text-gray-600">Cuenta:</div>
                    <div className="text-sm font-medium text-gray-900">
                      {trabajador.numero_cuenta}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dirección */}
          {trabajador.direccion && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="text-sm w-full">
                  <div className="font-medium text-gray-900">Dirección:</div>
                  <div className="text-gray-600 mb-2">
                    {trabajador.direccion}
                  </div>

                  <a
                    href={generarLinkMaps(trabajador.direccion)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Contacto de emergencia */}
          {(trabajador.contacto_emergencia ||
            trabajador.telefono_emergencia) && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Contacto de Emergencia
              </div>
              <div className="grid grid-cols-2 gap-2">
                {trabajador.contacto_emergencia && (
                  <div>
                    <div className="text-xs text-gray-600">Nombre:</div>
                    <div className="text-sm font-medium text-gray-900">
                      {trabajador.contacto_emergencia}
                    </div>
                  </div>
                )}
                {trabajador.telefono_emergencia && (
                  <div>
                    <div className="text-xs text-gray-600">Teléfono:</div>
                    <div className="text-sm font-medium text-gray-900">
                      {trabajador.telefono_emergencia}
                    </div>
                  </div>
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
            {trabajador.observaciones ? (
              <div className="truncate" title={trabajador.observaciones}>
                <span className="font-medium text-gray-700">
                  Observaciones:
                </span>{" "}
                {trabajador.observaciones}
              </div>
            ) : (
              <span className="text-gray-400">Sin observaciones</span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onView(trabajador)}
              variant="secondary"
              size="small"
              icon={Eye}
              title="Ver detalles"
            />
            <Button
              onClick={() => onEdit(trabajador)}
              variant="secondary"
              size="small"
              icon={Edit}
              title="Editar"
            />
            <Button
              onClick={() => onDelete(trabajador.id)}
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

export default React.memo(PersonalCard);
