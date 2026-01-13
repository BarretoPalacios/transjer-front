// // components/ServicioForm/ServicioForm.jsx
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { 
//   Calendar, 
//   FileText, 
//   RefreshCw, 
//   Plus, 
//   Truck,
//   MapPin,
//   Users,
//   Building,
//   Package,
//   Clock,
//   User,
//   AlertCircle,
//   Save,
//   X,
//   Check,
//   Search,
//   Database,
//   Download,
//   Upload,
//   ChevronDown,
//   ChevronUp
// } from 'lucide-react';
// import Button from '../common/Button/Button';
// import { useOptionsData } from '../../hooks/useOptionsData';
// import CustomSelect from '../common/CustomSelect/CustomSelect';

// const ServicioForm = ({ initialData, onSubmit, onCancel, mode, isLoading, error }) => {
//   const {
//     options,
//     loading,
//     detailedLoading,
//     refetch,
//     rawData,
//     saveToLocalStorage,
//     clearLocalStorage,
//     exportData,
//     importData,
//     getStats,
//     lastUpdate
//   } = useOptionsData();

//   const [formData, setFormData] = useState({
//     cuenta: null,
//     cliente: null,
//     proveedor: null,
//     vehiculo: null,
//     conductor: null,
//     auxiliar: null,
//     m3_tn: '',
//     aux: '',
//     mes: '',
//     solicitud: '',
//     tipo_servicio: '',
//     zona: 'Lima',
//     fecha_servicio: new Date(),
//     fecha_salida: null,
//     hora_cita: '',
//     gia_rr: '',
//     gia_rt: '',
//     descripcion: '',
//     origen: '',
//     destino: '',
//     cliente_destino: '',
//     responsable: '',
//     estado: 'Pendiente'
//   });

//   const [errors, setErrors] = useState({});
//   const [showStorageManager, setShowStorageManager] = useState(false);
//   const [showAdvanced, setShowAdvanced] = useState(false);
//   const [stats, setStats] = useState({});

//   // Meses del año
//   const mesesOptions = useMemo(() => [
//     { value: 'Enero', label: 'Enero' },
//     { value: 'Febrero', label: 'Febrero' },
//     { value: 'Marzo', label: 'Marzo' },
//     { value: 'Abril', label: 'Abril' },
//     { value: 'Mayo', label: 'Mayo' },
//     { value: 'Junio', label: 'Junio' },
//     { value: 'Julio', label: 'Julio' },
//     { value: 'Agosto', label: 'Agosto' },
//     { value: 'Septiembre', label: 'Septiembre' },
//     { value: 'Octubre', label: 'Octubre' },
//     { value: 'Noviembre', label: 'Noviembre' },
//     { value: 'Diciembre', label: 'Diciembre' }
//   ], []);

//   // Opciones de M3/TN
//   const m3TnOptions = useMemo(() => [
//     { value: '5 m³', label: '5 m³' },
//     { value: '10 m³', label: '10 m³' },
//     { value: '15 m³', label: '15 m³' },
//     { value: '20 m³', label: '20 m³' },
//     { value: '25 m³', label: '25 m³' },
//     { value: '30 m³', label: '30 m³' },
//     { value: '35 m³', label: '35 m³' },
//     { value: '40 m³', label: '40 m³' },
//     { value: '45 m³', label: '45 m³' },
//     { value: '50 m³', label: '50 m³' },
//     { value: '5 TN', label: '5 TN' },
//     { value: '10 TN', label: '10 TN' },
//     { value: '15 TN', label: '15 TN' },
//     { value: '20 TN', label: '20 TN' },
//     { value: '25 TN', label: '25 TN' },
//     { value: '30 TN', label: '30 TN' },
//     { value: '35 TN', label: '35 TN' },
//     { value: '40 TN', label: '40 TN' }
//   ], []);

//   // Horas del día
//   const horaOptions = useMemo(() => {
//     const horas = [];
//     for (let i = 0; i < 24; i++) {
//       const hora = i.toString().padStart(2, '0');
//       horas.push(
//         { value: `${hora}:00`, label: `${hora}:00` },
//         { value: `${hora}:30`, label: `${hora}:30` }
//       );
//     }
//     return horas;
//   }, []);

//   // Estados de servicio
//   const estadoOptions = useMemo(() => 
//     options.estados.map(estado => ({
//       value: estado,
//       label: estado
//     })), [options.estados]);

//   // Inicializar formulario
//   useEffect(() => {
//     if (initialData) {
//       // Modo edición o vista
//       const fechaServicio = initialData.fecha_servicio 
//         ? new Date(initialData.fecha_servicio)
//         : new Date();
      
//       const fechaSalida = initialData.fecha_salida 
//         ? new Date(initialData.fecha_salida)
//         : null;

//       setFormData({
//         cuenta: initialData.cuenta || null,
//         cliente: initialData.cliente || null,
//         proveedor: initialData.proveedor || null,
//         vehiculo: initialData.vehiculo || null,
//         conductor: initialData.conductor || null,
//         auxiliar: initialData.auxiliar || null,
//         m3_tn: initialData.m3_tn || '',
//         aux: initialData.aux || '',
//         mes: initialData.mes || '',
//         solicitud: initialData.solicitud || '',
//         tipo_servicio: initialData.tipo_servicio || '',
//         zona: initialData.zona || 'Lima',
//         fecha_servicio: fechaServicio,
//         fecha_salida: fechaSalida,
//         hora_cita: initialData.hora_cita || '',
//         gia_rr: initialData.gia_rr || '',
//         gia_rt: initialData.gia_rt || '',
//         descripcion: initialData.descripcion || '',
//         origen: initialData.origen || '',
//         destino: initialData.destino || '',
//         cliente_destino: initialData.cliente_destino || '',
//         responsable: initialData.responsable || '',
//         estado: initialData.estado || 'Pendiente'
//       });
//     } else {
//       // Modo creación
//       const today = new Date();
//       const currentMonth = mesesOptions[today.getMonth()]?.value || 'Enero';
      
//       setFormData(prev => ({
//         ...prev,
//         mes: currentMonth,
//         fecha_servicio: today,
//         zona: 'Lima',
//         estado: 'Pendiente'
//       }));
//     }
//   }, [initialData, mesesOptions]);

//   // Actualizar estadísticas
//   useEffect(() => {
//     setStats(getStats());
//   }, [getStats, options]);

//   // Handlers
//   const handleSelectChange = useCallback((name, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: null
//       }));
//     }
//   }, [errors]);

//   const handleInputChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: null
//       }));
//     }
//   }, [errors]);

//   const handleDateChange = useCallback((name, date) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: date
//     }));
//   }, []);

//   // Validación
//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.cuenta?.id) newErrors.cuenta = 'La cuenta es requerida';
//     if (!formData.cliente?.id) newErrors.cliente = 'El cliente es requerido';
//     if (!formData.tipo_servicio) newErrors.tipo_servicio = 'El tipo de servicio es requerido';
//     if (!formData.mes) newErrors.mes = 'El mes es requerido';
//     if (!formData.zona) newErrors.zona = 'La zona es requerida';
//     if (!formData.fecha_servicio) newErrors.fecha_servicio = 'La fecha de servicio es requerida';
//     if (!formData.origen.trim()) newErrors.origen = 'El origen es requerido';
//     if (!formData.destino.trim()) newErrors.destino = 'El destino es requerido';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Submit
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (validateForm()) {
//       const dataToSubmit = {
//         ...formData,
//         fecha_servicio: formData.fecha_servicio.toISOString().split('T')[0],
//         fecha_salida: formData.fecha_salida ? formData.fecha_salida.toISOString().split('T')[0] : null,
//         fecha_registro: new Date().toISOString()
//       };
      
//       onSubmit(dataToSubmit);
//     }
//   };

//   // Formatear fecha
//   const formatDate = (date) => {
//     if (!date) return '';
//     return date.toLocaleDateString('es-PE', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   };

//   // Gestor de datos locales
//   const StorageManagerModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//               <Database className="h-5 w-5" />
//               Gestor de Datos Locales
//             </h4>
//             <button
//               type="button"
//               onClick={() => setShowStorageManager(false)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
          
//           <div className="space-y-4">
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <p className="text-sm text-blue-800">
//                 Los datos se guardan localmente para evitar peticiones repetidas al servidor.
//                 Última actualización: {lastUpdate ? lastUpdate.toLocaleString() : 'Nunca'}
//               </p>
//             </div>
            
//             <div className="grid grid-cols-2 gap-4">
//               <Button
//                 type="button"
//                 onClick={saveToLocalStorage}
//                 variant="primary"
//                 icon={Save}
//                 fullWidth
//               >
//                 Guardar Actual
//               </Button>
              
//               <Button
//                 type="button"
//                 onClick={clearLocalStorage}
//                 variant="danger"
//                 icon={X}
//                 fullWidth
//               >
//                 Limpiar Datos
//               </Button>
              
//               <Button
//                 type="button"
//                 onClick={exportData}
//                 variant="secondary"
//                 icon={Download}
//                 fullWidth
//               >
//                 Exportar
//               </Button>
              
//               <Button
//                 type="button"
//                 onClick={importData}
//                 variant="secondary"
//                 icon={Upload}
//                 fullWidth
//               >
//                 Importar
//               </Button>
//             </div>
            
//             <div className="pt-4 border-t border-gray-200">
//               <h5 className="font-medium text-gray-700 mb-2">Estadísticas:</h5>
//               <div className="text-sm text-gray-600 space-y-1">
//                 <div className="flex justify-between">
//                   <span>Clientes:</span>
//                   <span className="font-medium">{stats.clientes || 0}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Proveedores:</span>
//                   <span className="font-medium">{stats.proveedores || 0}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Vehículos:</span>
//                   <span className="font-medium">{stats.vehiculos || 0}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Personal:</span>
//                   <span className="font-medium">{stats.personal || 0}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
//             <Button
//               type="button"
//               onClick={() => setShowStorageManager(false)}
//               variant="secondary"
//             >
//               Cerrar
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
//       {/* Modal Gestor de Datos */}
//       {showStorageManager && <StorageManagerModal />}

//       {/* Encabezado */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
//         <div>
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             {mode === 'create' ? <Plus className="h-6 w-6" /> : 
//              mode === 'edit' ? <FileText className="h-6 w-6" /> : 
//              <Truck className="h-6 w-6" />}
//             {mode === 'create' ? 'NUEVO SERVICIO' : 
//              mode === 'edit' ? 'EDITAR SERVICIO' : 
//              'DETALLES DEL SERVICIO'}
//           </h3>
//           <p className="text-sm text-gray-600 mt-1">
//             {mode === 'view' ? 'Información completa del servicio' : 'Complete los campos obligatorios (*)'}
//           </p>
//         </div>
        
//         <div className="flex flex-wrap gap-2">
//           <Button
//             type="button"
//             onClick={refetch}
//             variant="secondary"
//             size="small"
//             icon={RefreshCw}
//             title="Actualizar datos desde servidor"
//             isLoading={loading}
//           >
//             Actualizar Datos
//           </Button>
          
//           <Button
//             type="button"
//             onClick={() => setShowStorageManager(true)}
//             variant="outline"
//             size="small"
//             icon={Database}
//             title="Gestionar datos locales"
//           >
//             Datos Locales
//           </Button>
          
//           {mode !== 'view' && (
//             <Button
//               type="button"
//               onClick={() => setShowAdvanced(!showAdvanced)}
//               variant="ghost"
//               size="small"
//               icon={showAdvanced ? ChevronUp : ChevronDown}
//             >
//               {showAdvanced ? 'Ocultar' : 'Avanzado'}
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Mensaje de error global */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
//           <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
//           <div>
//             <p className="font-medium">Error al guardar</p>
//             <p className="text-sm">{error}</p>
//           </div>
//         </div>
//       )}

//       {/* Sección 1: Información Básica */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//         <h4 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
//           <FileText className="h-5 w-5 text-blue-600" />
//           INFORMACIÓN BÁSICA
//         </h4>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {/* Solicitud */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               N° Solicitud
//             </label>
//             <input
//               type="text"
//               name="solicitud"
//               value={formData.solicitud}
//               onChange={handleInputChange}
//               disabled={mode === 'view'}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
//               placeholder="SOL-YYYYMMDD-001"
//             />
//           </div>

//           {/* Mes */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Mes *
//             </label>
//             <CustomSelect
//               name="mes"
//               value={formData.mes}
//               onChange={(value) => handleSelectChange('mes', value)}
//               options={mesesOptions}
//               disabled={mode === 'view'}
//               placeholder="Seleccionar mes"
//               error={errors.mes}
//               isRequired
//               searchable
//             />
//           </div>

//           {/* Tipo de Servicio */}
//           <div className="lg:col-span-2">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Tipo de Servicio *
//             </label>
//             <CustomSelect
//               name="tipo_servicio"
//               value={formData.tipo_servicio}
//               onChange={(value) => handleSelectChange('tipo_servicio', value)}
//               options={options.tiposServicio}
//               disabled={mode === 'view'}
//               placeholder="Seleccionar tipo de servicio"
//               error={errors.tipo_servicio}
//               isRequired
//               searchable
//               loading={detailedLoading.tiposServicio}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Sección 2: Cuenta y Cliente */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Cuenta */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <h4 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
//             <Building className="h-5 w-5 text-green-600" />
//             INFORMACIÓN DE CUENTA *
//           </h4>
          
//           <div className="space-y-4">
//             <CustomSelect
//               name="cuenta"
//               value={formData.cuenta}
//               onChange={(value) => handleSelectChange('cuenta', value)}
//               options={options.cuentas}
//               disabled={mode === 'view'}
//               placeholder="Buscar cuenta..."
//               error={errors.cuenta}
//               isRequired
//               searchable
//               loading={detailedLoading.cuentas}
//               formatOptionLabel={(option) => (
//                 <div className="py-1">
//                   <div className="font-medium">{option.nombre}</div>
//                   <div className="text-sm text-gray-500">{option.numero}</div>
//                 </div>
//               )}
//             />
            
//             {formData.cuenta?.id && (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                 <div className="flex items-start gap-3">
//                   <Check className="h-5 w-5 text-green-600 mt-0.5" />
//                   <div>
//                     <div className="font-medium text-green-800">
//                       {formData.cuenta.nombre}
//                     </div>
//                     {formData.cuenta.numero && (
//                       <div className="text-sm text-green-700">
//                         N°: {formData.cuenta.numero}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Cliente */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <h4 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
//             <Users className="h-5 w-5 text-purple-600" />
//             INFORMACIÓN DEL CLIENTE *
//           </h4>
          
//           <div className="space-y-4">
//             <CustomSelect
//               name="cliente"
//               value={formData.cliente}
//               onChange={(value) => handleSelectChange('cliente', value)}
//               options={options.clientes}
//               disabled={mode === 'view'}
//               placeholder="Buscar cliente..."
//               error={errors.cliente}
//               isRequired
//               searchable
//               loading={detailedLoading.clientes}
//               formatOptionLabel={(option) => (
//                 <div className="py-1">
//                   <div className="font-medium">{option.nombre}</div>
//                   <div className="text-sm text-gray-500">RUC: {option.ruc}</div>
//                 </div>
//               )}
//             />
            
//             {formData.cliente?.id && (
//               <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
//                 <div className="flex items-start gap-3">
//                   <Check className="h-5 w-5 text-purple-600 mt-0.5" />
//                   <div>
//                     <div className="font-medium text-purple-800">
//                       {formData.cliente.nombre}
//                     </div>
//                     <div className="text-sm text-purple-700">
//                       RUC: {formData.cliente.ruc}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Sección 3: Proveedor y Vehículo */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Proveedor */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <h4 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
//             <Building className="h-5 w-5 text-orange-600" />
//             PROVEEDOR
//           </h4>
          
//           <CustomSelect
//             name="proveedor"
//             value={formData.proveedor}
//             onChange={(value) => handleSelectChange('proveedor', value)}
//             options={options.proveedores}
//             disabled={mode === 'view'}
//             placeholder="Buscar proveedor..."
//             searchable
//             loading={detailedLoading.proveedores}
//             formatOptionLabel={(option) => (
//               <div className="py-1">
//                 <div className="font-medium">{option.nombre}</div>
//                 <div className="text-sm text-gray-500">RUC: {option.ruc}</div>
//               </div>
//             )}
//           />
//         </div>

//         {/* Vehículo */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//           <h4 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
//             <Truck className="h-5 w-5 text-blue-600" />
//             VEHÍCULO (FLOTA)
//           </h4>
          
//           <CustomSelect
//             name="vehiculo"
//             value={formData.vehiculo}
//             onChange={(value) => handleSelectChange('vehiculo', value)}
//             options={options.vehiculos}
//             disabled={mode === 'view'}
//             placeholder="Buscar vehículo..."
//             searchable
//             loading={detailedLoading.vehiculos}
//             formatOptionLabel={(option) => (
//               <div className="py-1">
//                 <div className="font-medium">{option.placa}</div>
//                 <div className="text-sm text-gray-500">
//                   {option.marca} {option.modelo} • {option.capacidad_m3} m³
//                 </div>
//               </div>
//             )}
//           />
//         </div>
//       </div>

//       {/* Sección 4: Personal */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//         <h4 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
//           <User className="h-5 w-5 text-indigo-600" />
//           PERSONAL ASIGNADO
//         </h4>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Conductor */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Conductor
//             </label>
//             <CustomSelect
//               name="conductor"
//               value={formData.conductor}
//               onChange={(value) => handleSelectChange('conductor', value)}
//               options={options.conductores}
//               disabled={mode === 'view'}
//               placeholder="Buscar conductor..."
//               searchable
//               loading={detailedLoading.conductores}
//               formatOptionLabel={(option) => (
//                 <div className="py-1">
//                   <div className="font-medium">{option.label}</div>
//                   <div className="text-sm text-gray-500">
//                     {option.licencia ? `Lic: ${option.licencia}` : option.dni}
//                   </div>
//                 </div>
//               )}
//             />
//           </div>

//           {/* Auxiliar */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Auxiliar
//             </label>
//             <CustomSelect
//               name="auxiliar"
//               value={formData.auxiliar}
//               onChange={(value) => handleSelectChange('auxiliar', value)}
//               options={options.auxiliares}
//               disabled={mode === 'view'}
//               placeholder="Buscar auxiliar..."
//               searchable
//               loading={detailedLoading.auxiliares}
//               formatOptionLabel={(option) => (
//                 <div className="py-1">
//                   <div className="font-medium">{option.label}</div>
//                   <div className="text-sm text-gray-500">
//                     {option.cargo || option.dni}
//                   </div>
//                 </div>
//               )}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Sección 5: Ruta y Fechas */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//         <h4 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
//           <MapPin className="h-5 w-5 text-red-600" />
//           RUTA Y FECHAS *
//         </h4>
        
//         {/* Origen y Destino */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Origen *
//             </label>
//             <div className="space-y-2">
//               <CustomSelect
//                 name="origen"
//                 value={formData.origen}
//                 onChange={(value) => handleSelectChange('origen', value)}
//                 options={options.origenes}
//                 disabled={mode === 'view'}
//                 placeholder="Buscar origen..."
//                 searchable
//                 loading={detailedLoading.origenes}
//               />
//               {!formData.origen && (
//                 <input
//                   type="text"
//                   name="origen"
//                   value={formData.origen}
//                   onChange={handleInputChange}
//                   disabled={mode === 'view'}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
//                   placeholder="O ingrese origen manualmente..."
//                   maxLength={300}
//                 />
//               )}
//             </div>
//             {errors.origen && (
//               <p className="mt-2 text-sm text-red-600">{errors.origen}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Destino *
//             </label>
//             <div className="space-y-2">
//               <CustomSelect
//                 name="destino"
//                 value={formData.destino}
//                 onChange={(value) => handleSelectChange('destino', value)}
//                 options={options.destinos}
//                 disabled={mode === 'view'}
//                 placeholder="Buscar destino..."
//                 searchable
//                 loading={detailedLoading.destinos}
//               />
//               {!formData.destino && (
//                 <input
//                   type="text"
//                   name="destino"
//                   value={formData.destino}
//                   onChange={handleInputChange}
//                   disabled={mode === 'view'}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
//                   placeholder="O ingrese destino manualmente..."
//                   maxLength={300}
//                 />
//               )}
//             </div>
//             {errors.destino && (
//               <p className="mt-2 text-sm text-red-600">{errors.destino}</p>
//             )}
//           </div>
//         </div>

//         {/* Cliente en Destino */}
//         <div className="mb-6">
//           <label className="block text-sm font-semibold text-gray-700 mb-2">
//             Cliente en Destino
//           </label>
//           <input
//             type="text"
//             name="cliente_destino"
//             value={formData.cliente_destino}
//             onChange={handleInputChange}
//             disabled={mode === 'view'}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
//             placeholder="Nombre del cliente en destino"
//             maxLength={200}
//           />
//         </div>

//         {/* Fechas y Horas */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Fecha Servicio */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Fecha Servicio *
//             </label>
//             <div className="relative">
//               <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//               <input
//                 type="date"
//                 value={formData.fecha_servicio ? formData.fecha_servicio.toISOString().split('T')[0] : ''}
//                 onChange={(e) => {
//                   const date = e.target.value ? new Date(e.target.value) : null;
//                   handleDateChange('fecha_servicio', date);
//                 }}
//                 disabled={mode === 'view'}
//                 required
//                 className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
//               />
//             </div>
//             {errors.fecha_servicio && (
//               <p className="mt-2 text-sm text-red-600">{errors.fecha_servicio}</p>
//             )}
//           </div>

//           {/* Hora Cita */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Hora de Cita
//             </label>
//             <CustomSelect
//               name="hora_cita"
//               value={formData.hora_cita}
//               onChange={(value) => handleSelectChange('hora_cita', value)}
//               options={horaOptions}
//               disabled={mode === 'view'}
//               placeholder="Seleccionar hora"
//               searchable
//             />
//           </div>

//           {/* Zona */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Zona *
//             </label>
//             <CustomSelect
//               name="zona"
//               value={formData.zona}
//               onChange={(value) => handleSelectChange('zona', value)}
//               options={options.zonas}
//               disabled={mode === 'view'}
//               placeholder="Seleccionar zona"
//               error={errors.zona}
//               isRequired
//               searchable
//             />
//           </div>
//         </div>
//       </div>

//       {/* Sección 6: Detalles Adicionales */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//         <h4 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
//           <Package className="h-5 w-5 text-amber-600" />
//           DETALLES ADICIONALES
//         </h4>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           {/* M3/TN */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Medida (M3/TN)
//             </label>
//             <CustomSelect
//               name="m3_tn"
//               value={formData.m3_tn}
//               onChange={(value) => handleSelectChange('m3_tn', value)}
//               options={m3TnOptions}
//               disabled={mode === 'view'}
//               placeholder="Seleccionar medida"
//               searchable
//             />
//           </div>

//           {/* Campo Auxiliar */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Campo Auxiliar
//             </label>
//             <input
//               type="text"
//               name="aux"
//               value={formData.aux}
//               onChange={handleInputChange}
//               disabled={mode === 'view'}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
//               placeholder="Información adicional"
//               maxLength={100}
//             />
//           </div>
//         </div>

//         {/* Descripción */}
//         <div className="mb-6">
//           <label className="block text-sm font-semibold text-gray-700 mb-2">
//             Descripción del Servicio
//           </label>
//           <textarea
//             name="descripcion"
//             value={formData.descripcion}
//             onChange={handleInputChange}
//             disabled={mode === 'view'}
//             rows="3"
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500 resize-none"
//             placeholder="Describa el servicio a realizar..."
//             maxLength={200}
//           />
//         </div>

//         {/* Campos Avanzados */}
//         {showAdvanced && (
//           <div className="border-t border-gray-200 pt-6 mt-6 space-y-6">
//             <h5 className="text-md font-semibold text-gray-700">Documentación Avanzada</h5>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* GIA RR */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   GIA Remisión Remitente
//                 </label>
//                 <input
//                   type="text"
//                   name="gia_rr"
//                   value={formData.gia_rr}
//                   onChange={handleInputChange}
//                   disabled={mode === 'view'}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
//                   placeholder="Número de GIA RR"
//                   maxLength={100}
//                 />
//               </div>

//               {/* GIA RT */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   GIA Remisión Transportista
//                 </label>
//                 <input
//                   type="text"
//                   name="gia_rt"
//                   value={formData.gia_rt}
//                   onChange={handleInputChange}
//                   disabled={mode === 'view'}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
//                   placeholder="Número de GIA RT"
//                   maxLength={100}
//                 />
//               </div>
//             </div>

//             {/* Responsable */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Responsable del Servicio
//               </label>
//               <input
//                 type="text"
//                 name="responsable"
//                 value={formData.responsable}
//                 onChange={handleInputChange}
//                 disabled={mode === 'view'}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
//                 placeholder="Nombre del responsable interno"
//                 maxLength={100}
//               />
//             </div>

//             {/* Estado (solo para edición) */}
//             {mode === 'edit' && (
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Estado del Servicio
//                 </label>
//                 <CustomSelect
//                   name="estado"
//                   value={formData.estado}
//                   onChange={(value) => handleSelectChange('estado', value)}
//                   options={estadoOptions}
//                   disabled={mode === 'view'}
//                   placeholder="Seleccionar estado"
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Botones de Acción */}
//       {mode !== 'view' && (
//         <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-lg -mx-6 -mb-6">
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//             <div className="text-sm text-gray-600">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="h-4 w-4" />
//                 <span>Los campos marcados con * son obligatorios</span>
//               </div>
//             </div>
            
//             <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//               <Button
//                 type="button"
//                 onClick={onCancel}
//                 variant="secondary"
//                 disabled={isLoading}
//                 className="w-full sm:w-auto"
//               >
//                 Cancelar
//               </Button>
//               <Button
//                 type="submit"
//                 isLoading={isLoading}
//                 icon={mode === 'create' ? Plus : Save}
              
//                 className="w-full sm:w-auto"
//               >
//                 {mode === 'create' ? 'Crear Servicio' : 'Guardar Cambios'}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </form>
//   );
// };

// export default React.memo(ServicioForm);




// components/ServicioForm/ServicioForm.jsx
import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Truck,
  MapPin,
  Users,
  Building,
  Package,
  Clock,
  User,
  Save,
  X
} from 'lucide-react';

const ServicioForm = ({ mode = 'create', onCancel }) => {
  const [formData, setFormData] = useState({
    solicitud: '',
    mes: '',
    tipo_servicio: '',
    cuenta: '',
    cliente: '',
    proveedor: '',
    vehiculo: '',
    conductor: '',
    auxiliar: '',
    m3_tn: '',
    aux: '',
    zona: 'Lima',
    fecha_servicio: new Date().toISOString().split('T')[0],
    hora_cita: '',
    origen: '',
    destino: '',
    cliente_destino: '',
    descripcion: '',
    gia_rr: '',
    gia_rt: '',
    responsable: '',
    estado: 'Pendiente'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
  };

  // Opciones para los selects
  const mesesOptions = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const tipoServicioOptions = [
    'Transporte de Carga', 'Mudanza', 'Distribución', 'Recolección',
    'Almacenaje', 'Logística', 'Otros'
  ];

  const m3TnOptions = [
    '5 m³', '10 m³', '15 m³', '20 m³', '25 m³', '30 m³',
    '35 m³', '40 m³', '45 m³', '50 m³', '5 TN', '10 TN',
    '15 TN', '20 TN', '25 TN', '30 TN', '35 TN', '40 TN'
  ];

  const estadoOptions = [
    'Pendiente', 'Confirmado', 'En Proceso', 'En Ruta',
    'Completado', 'Cancelado'
  ];

  const zonasOptions = [
    'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura',
    'Ica', 'Cusco', 'Huancayo', 'Tacna', 'Otros'
  ];

  // Generar horas
  const horaOptions = [];
  for (let i = 0; i < 24; i++) {
    const hora = i.toString().padStart(2, '0');
    horaOptions.push(`${hora}:00`, `${hora}:30`);
  }

  return (
    <form onSubmit={handleSubmit} className="container-fluid py-4">
      {/* Encabezado */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1">
                {mode === 'create' ? <><Plus className="me-2" />NUEVO SERVICIO</> : 
                 mode === 'edit' ? <><FileText className="me-2" />EDITAR SERVICIO</> : 
                 <><Truck className="me-2" />DETALLES DEL SERVICIO</>}
              </h3>
              <p className="text-muted mb-0">
                {mode === 'view' ? 'Información del servicio' : 'Complete los campos obligatorios (*)'}
              </p>
            </div>
            <div>
              {mode !== 'view' && (
                <button 
                  type="button" 
                  className="btn btn-link text-muted"
                  onClick={onCancel}
                >
                  <X className="me-1" /> Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección 1: Información Básica */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0"><FileText className="me-2 text-primary" />INFORMACIÓN BÁSICA</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">N° Solicitud</label>
              <input
                type="text"
                name="solicitud"
                value={formData.solicitud}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="SOL-001"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Mes *</label>
              <select
                name="mes"
                value={formData.mes}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-select form-select-sm"
                required
              >
                <option value="">Seleccionar mes</option>
                {mesesOptions.map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Tipo de Servicio *</label>
              <select
                name="tipo_servicio"
                value={formData.tipo_servicio}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-select form-select-sm"
                required
              >
                <option value="">Seleccionar tipo</option>
                {tipoServicioOptions.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Cuenta y Cliente */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0"><Building className="me-2 text-success" />CUENTA *</h5>
            </div>
            <div className="card-body">
              <label className="form-label small fw-semibold">Nombre de Cuenta</label>
              <input
                type="text"
                name="cuenta"
                value={formData.cuenta}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Nombre de la cuenta"
                required
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0"><Users className="me-2 text-purple" />CLIENTE *</h5>
            </div>
            <div className="card-body">
              <label className="form-label small fw-semibold">Nombre del Cliente</label>
              <input
                type="text"
                name="cliente"
                value={formData.cliente}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Nombre del cliente"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección 3: Proveedor y Vehículo */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0"><Building className="me-2 text-warning" />PROVEEDOR</h5>
            </div>
            <div className="card-body">
              <label className="form-label small fw-semibold">Nombre del Proveedor</label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0"><Truck className="me-2 text-primary" />VEHÍCULO</h5>
            </div>
            <div className="card-body">
              <label className="form-label small fw-semibold">Placa/Descripción</label>
              <input
                type="text"
                name="vehiculo"
                value={formData.vehiculo}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Placa o descripción del vehículo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección 4: Personal */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0"><User className="me-2 text-info" />PERSONAL ASIGNADO</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Conductor</label>
              <input
                type="text"
                name="conductor"
                value={formData.conductor}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Nombre del conductor"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Auxiliar</label>
              <input
                type="text"
                name="auxiliar"
                value={formData.auxiliar}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Nombre del auxiliar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección 5: Ruta y Fechas */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0"><MapPin className="me-2 text-danger" />RUTA Y FECHAS</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Origen *</label>
              <input
                type="text"
                name="origen"
                value={formData.origen}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Dirección de origen"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Destino *</label>
              <input
                type="text"
                name="destino"
                value={formData.destino}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Dirección de destino"
                required
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Fecha Servicio *</label>
              <input
                type="date"
                name="fecha_servicio"
                value={formData.fecha_servicio}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Hora de Cita</label>
              <select
                name="hora_cita"
                value={formData.hora_cita}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-select form-select-sm"
              >
                <option value="">Seleccionar hora</option>
                {horaOptions.map(hora => (
                  <option key={hora} value={hora}>{hora}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Zona *</label>
              <select
                name="zona"
                value={formData.zona}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-select form-select-sm"
                required
              >
                <option value="">Seleccionar zona</option>
                {zonasOptions.map(zona => (
                  <option key={zona} value={zona}>{zona}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 6: Detalles Adicionales */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0"><Package className="me-2 text-warning" />DETALLES ADICIONALES</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Medida (M3/TN)</label>
              <select
                name="m3_tn"
                value={formData.m3_tn}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-select form-select-sm"
              >
                <option value="">Seleccionar medida</option>
                {m3TnOptions.map(medida => (
                  <option key={medida} value={medida}>{medida}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Campo Auxiliar</label>
              <input
                type="text"
                name="aux"
                value={formData.aux}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Información adicional"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              className="form-control form-control-sm"
              rows="2"
              placeholder="Descripción del servicio..."
            />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Cliente en Destino</label>
              <input
                type="text"
                name="cliente_destino"
                value={formData.cliente_destino}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Cliente en destino"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Responsable</label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="Responsable interno"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección 7: Documentación y Estado */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0"><FileText className="me-2 text-secondary" />DOCUMENTACIÓN Y ESTADO</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">GIA RR</label>
              <input
                type="text"
                name="gia_rr"
                value={formData.gia_rr}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="N° GIA Remisión Remitente"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">GIA RT</label>
              <input
                type="text"
                name="gia_rt"
                value={formData.gia_rt}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="form-control form-control-sm"
                placeholder="N° GIA Remisión Transportista"
              />
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              className="form-select form-select-sm"
            >
              {estadoOptions.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      {mode !== 'view' && (
        <div className="sticky-bottom py-3 bg-white border-top shadow-sm">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Los campos marcados con * son obligatorios
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  {mode === 'create' ? (
                    <>
                      <Plus className="me-1" size={16} /> Crear Servicio
                    </>
                  ) : (
                    <>
                      <Save className="me-1" size={16} /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ServicioForm;