// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Truck,
//   RefreshCw,
//   Filter,
//   Download,
//   Eye,
//   X,
//   CheckCircle,
//   Calendar,
//   FileText,
//   User,
//   DollarSign,
//   Hash,
//   CheckSquare,
//   Square,
//   FilePlus,
//   Edit,
//   Save,
//   XCircle,
//   Info,
//   AlertCircle,
//   CalendarDays,
//   PlusCircle,
//   Receipt,
//   ArrowLeft,
//   CheckSquare as CheckSquareIcon,
//   XSquare
// } from "lucide-react";

// // Componentes comunes
// import Button from "../../../components/common/Button/Button";
// import Modal from "../../../components/common/Modal/Modal";
// import Pagination from "../../../components/common/Pagination/Pagination";

// // API
// import { fletesAPI } from "../../../api/endpoints/fletes";
// import { facturasAPI } from "../../../api/endpoints/facturas";
// import { serviciosPrincipalesAPI } from "../../../api/endpoints/servicioPrincipal";

// const FletesPorFacturar = () => {
//   const navigate = useNavigate();

//   // Estados principales
//   const [fletes, setFletes] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchTimeout, setSearchTimeout] = useState(null);

//   const [gastosFleteData, setGastosFleteData] = useState(null);
//   const [loadingGastos, setLoadingGastos] = useState(false);

//   // Estados de paginación
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     itemsPerPage: 15,
//     totalItems: 0,
//     totalPages: 0,
//     hasNext: false,
//     hasPrev: false,
//   });

//   // Estados para filtros
//   const [filters, setFilters] = useState({
//     codigo_flete: "",
//     cliente: ""
//   });

//   // Estados para modales y selección
//   const [showDetalleModal, setShowDetalleModal] = useState(false);
//   const [fleteSeleccionado, setFleteSeleccionado] = useState(null);
//   const [showFacturaModal, setShowFacturaModal] = useState(false);
//   const [selectedFletes, setSelectedFletes] = useState([]);
//   const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
//   const [editingFlete, setEditingFlete] = useState(null);
//   const [editForm, setEditForm] = useState({
//     monto_flete: "",
//     observaciones: "",
//   });
//   const [servicioDetalle, setServicioDetalle] = useState(null);
//   const [loadingServicio, setLoadingServicio] = useState(false);
//   const [modalMode, setModalMode] = useState("flete");

//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);



//   // Estados para gastos adicionales (NUEVO)
//   const [showGastoModal, setShowGastoModal] = useState(false);
//   const [gastosFlete, setGastosFlete] = useState([]);
//   const [gastoForm, setGastoForm] = useState({
//     fecha: '',
//     tipo_gasto: '',
//     valor: '',
//     se_factura: false,
//     estado_facturacion: 'N/A',
//     n_factura: '',
//     estado_aprobacion: 'PENDIENTE',
//     observaciones: ''
//   });

//   // Estado para el formulario de factura
//   const [facturaForm, setFacturaForm] = useState({
//     numero_factura: "",
//     fecha_emision: "",
//     fecha_vencimiento: "",
//     monto_total: "",
//     moneda: "PEN",
//     descripcion: "",
//   });

//   const [formErrors, setFormErrors] = useState({});

//   const itemsPerPageOptions = [10, 15, 20, 30, 50];
//   const isInitialMount = useRef(true);

//   // Opciones para tipo de gasto (NUEVO)
//   const tipoGastoOptions = [
//     'Estadía',
//     'Reparación',
//     'Peaje Extra',
//     'Maniobras',
//     'Multa',
//     'Combustible Extra',
//     'Alimentación',
//     'Hospedaje',
//     'Gastos Extraordinarios',
//     'Otros'
//   ];

//   // Función principal para cargar fletes
//   const fetchFletes = useCallback(
//     async (page = 1, itemsPerPage = pagination.itemsPerPage, filtersToUse = filters) => {
//       setIsLoading(true);
//       setError(null);
//       setSuccessMessage(null);

//       try {
//         // Preparar filtros para API
//         const filtersForAPI = {};
//         Object.entries(filtersToUse).forEach(([key, value]) => {
//           if (value && value.trim() !== "") {
//             filtersForAPI[key] = value.trim();
//           }
//         });

//         // Añadir filtros fijos
//         filtersForAPI.estado_flete = "VALORIZADO";
//         filtersForAPI.pertenece_a_factura = false;
//         filtersForAPI.page = page;
//         filtersForAPI.page_size = itemsPerPage;

//         console.log('Fetching fletes with params:', filtersForAPI); // Para debug

//         // Usar la API
//         const response = await fletesAPI.getAdvancedFletes(filtersForAPI);
//         console.log('API Response:', response); // Para debug

//         // Procesar respuesta
//         if (response && response.items) {
//           setFletes(response.items);

//           // Actualizar paginación
//           setPagination({
//             currentPage: page,
//             itemsPerPage: itemsPerPage,
//             totalItems: response.total || 0,
//             totalPages: response.total_pages || 1,
//             hasNext: response.has_next || false,
//             hasPrev: response.has_prev || false,
//           });
//         } else if (response && Array.isArray(response)) {
//           // Si la respuesta es un array directo
//           setFletes(response);
//           setPagination({
//             currentPage: page,
//             itemsPerPage: itemsPerPage,
//             totalItems: response.length || 0,
//             totalPages: Math.ceil((response.length || 0) / itemsPerPage),
//             hasNext: (response.length || 0) >= itemsPerPage,
//             hasPrev: page > 1,
//           });
//         } else {
//           setFletes([]);
//           setPagination({
//             currentPage: page,
//             itemsPerPage: itemsPerPage,
//             totalItems: 0,
//             totalPages: 1,
//             hasNext: false,
//             hasPrev: false,
//           });
//         }

//       } catch (err) {
//         setError("Error al cargar los fletes: " + (err.message || "Error desconocido"));
//         console.error("Error fetching fletes:", err);
//         setFletes([]);
//         setPagination({
//           currentPage: page,
//           itemsPerPage: itemsPerPage,
//           totalItems: 0,
//           totalPages: 1,
//           hasNext: false,
//           hasPrev: false,
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [] // No dependencias para mantener referencia estable
//   );

//   // Función para cargar gastos de un flete (MODIFICADA)
//   const fetchGastosFlete = useCallback(async (fleteId) => {
//     if (!fleteId) return;

//     setLoadingGastos(true);
//     setError(null);

//     try {
//       const response = await fletesAPI.getGastosByFlete(fleteId);

//       // Guardamos TODO el objeto
//       setGastosFleteData(response);
//       // También guardamos los gastos en el array para la vista de tabla
//       setGastosFlete(response.gastos || []);

//     } catch (err) {
//       console.error(err);
//       setError("Error al cargar los gastos del flete");
//     } finally {
//       setLoadingGastos(false);
//     }
//   }, []);

//   // Función para ver gastos del flete (NUEVO)
//   const handleVerGastos = useCallback(
//     async (flete) => {
//       setFleteSeleccionado(flete);
//       await fetchGastosFlete(flete.id);
//       setModalMode('gastos');
//       setShowDetalleModal(true);
//     },
//     [fetchGastosFlete]
//   );

//   // Función para manejar gastos adicionales (NUEVO)
//   const handleGastosAdicionales = useCallback((flete) => {
//     setFleteSeleccionado(flete);
//     setGastoForm({
//       fecha: new Date().toISOString().split('T')[0], // Fecha actual
//       tipo_gasto: '',
//       valor: '',
//       se_factura: false,
//       estado_facturacion: 'N/A',
//       n_factura: '',
//       estado_aprobacion: 'PENDIENTE',
//       observaciones: ''
//     });
//     setShowGastoModal(true);
//   }, []);

// const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
// const [gastoToDelete, setGastoToDelete] = useState(null);
// const [isDeletingGasto, setIsDeletingGasto] = useState(false);

// // Agrega estas funciones para manejar la eliminación de gastos
// const handleDeleteGastoClick = useCallback((gasto, e) => {
//   if (e) e.stopPropagation();
//   setGastoToDelete(gasto);
//   setShowDeleteConfirm(true);
// }, []);

// const handleConfirmDeleteGasto = useCallback(async () => {
//   if (!gastoToDelete) return;

//   setIsDeletingGasto(true);
//   setError(null);

//   try {
//     await fletesAPI.deleteGasto(gastoToDelete.id);
    
//     setSuccessMessage(`Gasto ${gastoToDelete.codigo_gasto} eliminado exitosamente`);
    
//     // Recargar los gastos del flete
//     if (fleteSeleccionado) {
//       await fetchGastosFlete(fleteSeleccionado.id);
//     }
    
//     setShowDeleteConfirm(false);
//     setGastoToDelete(null);
//   } catch (err) {
//     setError(`Error al eliminar el gasto: ${err.message || 'Error desconocido'}`);
//   } finally {
//     setIsDeletingGasto(false);
//   }
// }, [gastoToDelete, fleteSeleccionado, fetchGastosFlete]);

// const handleCancelDeleteGasto = useCallback(() => {
//   setShowDeleteConfirm(false);
//   setGastoToDelete(null);
// }, []);

//   // Efecto para búsqueda en tiempo real con debounce
//   useEffect(() => {
//     if (isInitialMount.current) {
//       return;
//     }

//     // Limpiar timeout anterior
//     if (searchTimeout) {
//       clearTimeout(searchTimeout);
//     }

//     // Crear nuevo timeout
//     const timeout = setTimeout(() => {
//       // Resetear a página 1 cuando cambian los filtros
//       setPagination(prev => ({
//         ...prev,
//         currentPage: 1
//       }));

//       // Llamar a fetchFletes con página 1
//       fetchFletes(1, pagination.itemsPerPage, filters);
//     }, 300); // 300ms de debounce

//     setSearchTimeout(timeout);

//     // Limpiar timeout al desmontar
//     return () => {
//       if (timeout) clearTimeout(timeout);
//     };
//   }, [filters]); // Solo se ejecuta cuando cambian los filtros

//   // Efecto para cargar cuando cambia la página o itemsPerPage
//   useEffect(() => {
//     if (!isInitialMount.current) {
//       fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
//     }
//   }, [pagination.currentPage, pagination.itemsPerPage]);

//   // Cargar datos iniciales
//   useEffect(() => {
//     if (isInitialMount.current) {
//       fetchFletes(1, pagination.itemsPerPage, filters);
//       isInitialMount.current = false;
//     }
//   }, []);

//   // Efecto para inicializar el formulario cuando se abre el modal de factura
//   useEffect(() => {
//     if (showFacturaModal && selectedFletes.length > 0) {
//       // Calcular monto total
//       const montoTotal = selectedFletes.reduce((total, id) => {
//         const flete = fletes.find((f) => f.id === id);
//         return total + (flete ? parseFloat(flete.monto_flete || 0) : 0);
//       }, 0);

//       // Generar secuencia para número de factura
//       const fecha = new Date();
//       const year = fecha.getFullYear();
//       const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
//       const numeroSugerido = `F-${year}${month}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

//       // Configurar fechas
//       const formatLocalDate = (date) => {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//       };

//       const fechaBase = new Date(); // Fecha actual local
//       const fechaEmision = formatLocalDate(fechaBase);

//       const fechaVenc = new Date(fechaBase);
//       fechaVenc.setMonth(fechaVenc.getMonth() + 1);
//       const fechaVencimiento = formatLocalDate(fechaVenc);

//       // 3. Actualización del formulario
//       setFacturaForm({
//         numero_factura: numeroSugerido,
//         fecha_emision: fechaEmision,
//         fecha_vencimiento: fechaVencimiento,
//         monto_total: montoTotal.toFixed(2),
//         moneda: "PEN",
//         descripcion: selectedFletes.length === 1
//           ? `Factura por flete: ${fletes.find(f => f.id === selectedFletes[0])?.codigo_flete || ""}`
//           : `Factura por ${selectedFletes.length} fletes`,
//       });
//     }
//   }, [showFacturaModal, selectedFletes, fletes]);

//   // Función para cargar detalles del servicio
//   const fetchServicioDetalle = useCallback(
//     async (servicioId) => {
//       setLoadingServicio(true);
//       setError(null);

//       try {
//         const response = await serviciosPrincipalesAPI.getServicioPrincipalById(
//           servicioId
//         );
//         setServicioDetalle(response);
//       } catch (err) {
//         setServicioDetalle({
//           codigo_servicio_principal:
//             fleteSeleccionado?.codigo_servicio || "N/A",
//           fecha_servicio: "Fecha no disponible",
//           estado: "Estado no disponible",
//           cliente: {
//             nombre: "Cliente no disponible",
//             ruc: "No disponible",
//           },
//           origen: "Origen no disponible",
//           destino: "Destino no disponible",
//           tipo_servicio: "Tipo no disponible",
//           modalidad_servicio: "Modalidad no disponible",
//           flota: { placa: "Placa no disponible" },
//           gia_rr: "No disponible",
//           gia_rt: "No disponible",
//           descripcion: "Sin descripción disponible",
//         });
//       } finally {
//         setLoadingServicio(false);
//       }
//     },
//     [fleteSeleccionado]
//   );

//   const handleViewServicioFromFlete = useCallback(async () => {
//     if (!fleteSeleccionado?.servicio_id) {
//       setError("No hay información del servicio asociado");
//       return;
//     }

//     await fetchServicioDetalle(fleteSeleccionado.servicio_id);
//     setModalMode("servicio");
//   }, [fleteSeleccionado, fetchServicioDetalle]);

//   const handleBackToFlete = useCallback(() => {
//     setModalMode("flete");
//   }, []);

//   // Handlers
//   const handleView = useCallback((flete) => {
//     setFleteSeleccionado(flete);
//     setModalMode("flete");
//     setShowDetalleModal(true);
//   }, []);

//   // Handler para actualizar filtros
//   const handleFilterChange = useCallback((key, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [key]: value
//     }));
//   }, []);

//   const clearFilters = useCallback(() => {
//     setFilters({
//       codigo_flete: "",
//       cliente: ""
//     });
//   }, []);

//   const handleRefresh = useCallback(() => {
//     fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
//   }, [fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]);

//   // Función para manejar clic en fila
//   const handleRowClick = useCallback((flete) => {
//     setFleteSeleccionado(flete);
//     setModalMode("flete");
//     setShowDetalleModal(true);
//   }, []);

//   // Manejar selección individual
//   const handleSelectFlete = useCallback(
//     (id, e) => {
//       e.stopPropagation();
//       if (selectedFletes.includes(id)) {
//         setSelectedFletes(selectedFletes.filter((fleteId) => fleteId !== id));
//       } else {
//         setSelectedFletes([...selectedFletes, id]);
//       }
//     },
//     [selectedFletes]
//   );

//   // Manejar selección todos
//   const handleSelectAll = useCallback(() => {
//     if (selectedFletes.length === fletes.length) {
//       setSelectedFletes([]);
//     } else {
//       setSelectedFletes(fletes.map((flete) => flete.id));
//     }
//   }, [selectedFletes, fletes]);

//   // Abrir modal de factura
//   const handleCreateInvoice = useCallback(() => {
//     if (selectedFletes.length === 0) {
//       setError("Por favor seleccione al menos un flete");
//       return;
//     }
//     setShowFacturaModal(true);
//   }, [selectedFletes]);

//   // Cerrar modal de factura
//   const handleCloseFacturaModal = useCallback(() => {
//     setShowFacturaModal(false);
//     setFacturaForm({
//       numero_factura: "",
//       fecha_emision: "",
//       fecha_vencimiento: "",
//       monto_total: "",
//       moneda: "PEN",
//       descripcion: "",
//     });
//     setFormErrors({});
//   }, []);

//   // Cerrar modal de detalle
//   const handleCloseDetalleModal = useCallback(() => {
//     setShowDetalleModal(false);
//     setModalMode("flete");
//     setServicioDetalle(null);
//     setFleteSeleccionado(null);
//     setGastosFleteData(null);
//     setGastosFlete([]);
//   }, []);

//   // Cerrar modal de gasto (NUEVO)
//   const handleCloseGastoModal = useCallback(() => {
//     setShowGastoModal(false);
//     setGastoForm({
//       fecha: '',
//       tipo_gasto: '',
//       valor: '',
//       se_factura: false,
//       estado_facturacion: 'N/A',
//       n_factura: '',
//       estado_aprobacion: 'PENDIENTE',
//       observaciones: ''
//     });
//   }, []);

//   // Handler para cambios en el formulario de factura
//   const handleFacturaFormChange = useCallback((field, value) => {
//     setFacturaForm(prev => ({ ...prev, [field]: value }));

//     // Limpiar error del campo
//     if (formErrors[field]) {
//       setFormErrors(prev => ({ ...prev, [field]: '' }));
//     }
//   }, [formErrors]);

//   // Handler para cambio en formulario de gasto (NUEVO)
//   const handleGastoFormChange = useCallback((field, value) => {
//     setGastoForm(prev => {
//       const newForm = { ...prev, [field]: value };

//       // Convertir valores string a boolean para se_factura
//       if (field === 'se_factura') {
//         // Si viene como string 'true' o 'false', convertirlo
//         if (value === 'true' || value === true) {
//           newForm.se_factura = true;
//           newForm.estado_facturacion = 'Pendiente';
//           newForm.n_factura = '';
//         } else if (value === 'false' || value === false) {
//           newForm.se_factura = false;
//           newForm.estado_facturacion = 'N/A';
//           newForm.n_factura = '---';
//         }
//       }

//       return newForm;
//     });
//   }, []);

//   // Handler para guardar gasto (NUEVO)
//   const handleSaveGasto = useCallback(async () => {
//     if (!fleteSeleccionado) return;

//     try {
//       // Validaciones básicas
//       if (!gastoForm.tipo_gasto) {
//         throw new Error('El tipo de gasto es requerido');
//       }

//       if (!gastoForm.valor || parseFloat(gastoForm.valor) <= 0) {
//         throw new Error('El valor debe ser mayor a 0');
//       }

//       // Preparar datos para enviar al backend
//       const gastoData = {
//         id_flete: fleteSeleccionado.id,
//         fecha_gasto: gastoForm.fecha,
//         tipo_gasto: gastoForm.tipo_gasto,
//         valor: parseFloat(gastoForm.valor),
//         se_factura_cliente: gastoForm.se_factura,
//         descripcion: gastoForm.observaciones === "" ? "GASTO AGREGADO" : gastoForm.observaciones,
//         usuario_registro: 'Sistema'
//       };

//       console.log('Datos listos para enviar al backend:', gastoData);

//       // Llamada al backend
//       await fletesAPI.createGasto(gastoData);

//       // Mensaje de éxito
//       setSuccessMessage('Gasto adicional registrado exitosamente');
//       handleCloseGastoModal();

//       // Recargar gastos si estamos en la vista de gastos
//       if (modalMode === 'gastos') {
//         fetchGastosFlete(fleteSeleccionado.id);
//       }

//     } catch (err) {
//       setError('Error al registrar el gasto: ' + err.message);
//     }
//   }, [fleteSeleccionado, gastoForm, modalMode, fetchGastosFlete, handleCloseGastoModal]);

//   // Validar formulario de factura
//   const validateFacturaForm = () => {
//     const errors = {};

//     if (!facturaForm.numero_factura.trim()) {
//       errors.numero_factura = 'El número de factura es requerido';
//     }

//     if (!facturaForm.fecha_emision) {
//       errors.fecha_emision = 'La fecha de emisión es requerida';
//     }

//     if (!facturaForm.fecha_vencimiento) {
//       errors.fecha_vencimiento = 'La fecha de vencimiento es requerida';
//     }

//     const montoNum = parseFloat(facturaForm.monto_total || 0);
//     if (!facturaForm.monto_total || montoNum <= 0) {
//       errors.monto_total = 'El monto total debe ser mayor a 0';
//     }

//     // Validar que fecha de vencimiento sea mayor o igual a fecha de emisión
//     if (facturaForm.fecha_emision && facturaForm.fecha_vencimiento) {
//       const emision = new Date(facturaForm.fecha_emision);
//       const vencimiento = new Date(facturaForm.fecha_vencimiento);

//       if (vencimiento < emision) {
//         errors.fecha_vencimiento = 'La fecha de vencimiento no puede ser anterior a la fecha de emisión';
//       }
//     }

//     return errors;
//   };

//   // Handler para crear factura
//   const handleCreateFactura = useCallback(async () => {
//     const errors = validateFacturaForm();
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }

//     setIsCreatingInvoice(true);
//     setError(null);

//     try {
//       // Preparar datos de factura
//       const facturaData = {
//         numero_factura: facturaForm.numero_factura,
//         fletes: selectedFletes.map((id) => ({ id })),
//         fecha_emision: facturaForm.fecha_emision,
//         fecha_vencimiento: facturaForm.fecha_vencimiento,
//         estado: "Pendiente",
//         monto_total: parseFloat(facturaForm.monto_total),
//         moneda: facturaForm.moneda,
//         descripcion: facturaForm.descripcion,
//         es_borrador: false, // Siempre será emitida
//       };

//       // Crear factura
//       await facturasAPI.createFactura(facturaData);

//       setSuccessMessage(
//         `Factura ${facturaForm.numero_factura} creada exitosamente para ${selectedFletes.length} flete(s)`
//       );

//       handleCloseFacturaModal();
//       setSelectedFletes([]);
//       fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters); // Refrescar lista
//     } catch (err) {
//       setError("Error al crear la factura: " + err.message);
//     } finally {
//       setIsCreatingInvoice(false);
//     }
//   }, [facturaForm, selectedFletes, fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters, handleCloseFacturaModal]);

//   // Editar flete
//   const handleEdit = useCallback((flete, e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setEditingFlete(flete.id);
//     setEditForm({
//       monto_flete: flete.monto_flete?.toString() || "",
//       observaciones: flete.observaciones || "",
//     });
//   }, []);

//   const handleSaveEdit = useCallback(
//     async (fleteId) => {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const updateData = {
//           monto_flete: parseFloat(editForm.monto_flete) || 0,
//           observaciones: editForm.observaciones,
//         };

//         if (updateData.monto_flete < 0) {
//           throw new Error("El monto no puede ser negativo");
//         }

//         await fletesAPI.updateFlete(fleteId, updateData);

//         setSuccessMessage("Flete actualizado exitosamente");
//         setEditingFlete(null);
//         fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
//       } catch (err) {
//         setError("Error al actualizar el flete: " + err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [editForm, fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]
//   );

//   const handleCancelEdit = useCallback(() => {
//     setEditingFlete(null);
//     setEditForm({
//       monto_flete: "",
//       observaciones: "",
//     });
//   }, []);

//   // Funciones de paginación
//   const handlePageChange = useCallback(
//     (newPage) => {
//       fetchFletes(newPage, pagination.itemsPerPage, filters);
//     },
//     [fetchFletes, pagination.itemsPerPage, filters]
//   );

//   const handleItemsPerPageChange = useCallback(
//     (newItemsPerPage) => {
//       fetchFletes(1, newItemsPerPage, filters);
//     },
//     [fetchFletes, filters]
//   );

//   // Función para obtener clase de estado
//   const getEstadoBadgeClass = (estado) => {
//     switch (estado?.toUpperCase()) {
//       case "VALORIZADO":
//         return "bg-blue-100 text-blue-800 border border-blue-300";
//       case "PENDIENTE":
//         return "bg-yellow-100 text-yellow-800 border border-yellow-300";
//       case "PAGADO":
//         return "bg-green-100 text-green-800 border border-green-300";
//       case "CANCELADO":
//         return "bg-red-100 text-red-800 border border-red-300";
//       case "FACTURADO":
//         return "bg-purple-100 text-purple-800 border border-purple-300";
//       default:
//         return "bg-gray-100 text-gray-800 border border-gray-300";
//     }
//   };

//   // Función para obtener clase de estado de aprobación (NUEVO)
//   const getEstadoAprobacionClass = (estado) => {
//     switch (estado?.toUpperCase()) {
//       case 'APROBADO':
//         return 'bg-green-100 text-green-800 border border-green-300';
//       case 'RECHAZADO':
//         return 'bg-red-100 text-red-800 border border-red-300';
//       case 'PENDIENTE':
//         return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
//       default:
//         return 'bg-gray-100 text-gray-800 border border-gray-300';
//     }
//   };

//   // Función para obtener clase de estado de facturación (NUEVO)
//   const getEstadoFacturacionClass = (estado) => {
//     switch (estado?.toUpperCase()) {
//       case 'FACTURADO':
//         return 'bg-blue-100 text-blue-800 border border-blue-300';
//       case 'PENDIENTE':
//         return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
//       case 'N/A':
//         return 'bg-gray-100 text-gray-800 border border-gray-300';
//       default:
//         return 'bg-gray-100 text-gray-800 border border-gray-300';
//     }
//   };

//   // Formatear fecha
//   const formatFecha = (fecha) => {
//     if (!fecha) return "N/A";
//     try {
//       return new Date(fecha).toLocaleDateString("es-ES", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch (e) {
//       return fecha;
//     }
//   };

//   // Formatear valor monetario (NUEVO)
//   const formatMoneda = (valor) => {
//     if (!valor) return 'S/ 0.00';
//     return `S/ ${parseFloat(valor).toFixed(2)}`;
//   };

//   // Calcular monto total de fletes seleccionados
//   const totalMontoSeleccionado = selectedFletes.reduce((total, id) => {
//     const flete = fletes.find((f) => f.id === id);
//     return total + (flete ? parseFloat(flete.monto_flete || 0) : 0);
//   }, 0);

//   // Mostrar loading solo en carga inicial
//   if (isLoading && fletes.length === 0) {
//     return (
//       <div className="p-4 sm:p-6 lg:p-8">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//           <div className="bg-white rounded-lg border border-gray-200 p-6">
//             <div className="h-64 bg-gray-200 rounded"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Fletes por Facturar
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Total: {pagination.totalItems} fletes pendientes de facturación
//           </p>
//         </div>

//         <div className="flex items-center space-x-3 mt-4 lg:mt-0">
//           <Button
//             onClick={handleCreateInvoice}
//             icon={FilePlus}
//             disabled={selectedFletes.length === 0}
//           >
//             Crear Factura ({selectedFletes.length})
//           </Button>
//         </div>
//       </div>

//       {/* Mostrar mensajes */}
//       {successMessage && (
//         <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//           <div className="flex items-center text-green-700">
//             <CheckCircle className="h-5 w-5 mr-2" />
//             <div>
//               <span className="font-medium">Éxito:</span>
//               <span className="ml-2">{successMessage}</span>
//             </div>
//           </div>
//           <button
//             onClick={() => setSuccessMessage(null)}
//             className="mt-2 text-sm text-green-600 hover:text-green-800"
//           >
//             Cerrar
//           </button>
//         </div>
//       )}

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <div className="flex items-center text-red-700">
//             <X className="h-5 w-5 mr-2" />
//             <div>
//               <span className="font-medium">Error:</span>
//               <span className="ml-2">{error}</span>
//             </div>
//           </div>
//           <button
//             onClick={() => setError(null)}
//             className="mt-2 text-sm text-red-600 hover:text-red-800"
//           >
//             Cerrar
//           </button>
//         </div>
//       )}

//       {/* Filtros */}
//       <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6 shadow-sm">
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Filter className="h-5 w-5 text-blue-600" />
//               Filtros de Búsqueda
//             </h3>
//           </div>

//           <div className="flex items-center space-x-2">
//             <Button
//               onClick={handleRefresh}
//               variant="secondary"
//               size="small"
//               icon={RefreshCw}
//               isLoading={isLoading}
//             >
//               Actualizar
//             </Button>

//             <Button onClick={clearFilters} variant="secondary" size="small">
//               Limpiar
//             </Button>
//           </div>
//         </div>

//         {/* Filtros en tiempo real */}
//         <div className="grid grid-cols-1 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//               <Hash className="h-4 w-4" />
//               Cliente
//             </label>
//             <input
//               type="text"
//               value={filters.cliente}
//               onChange={(e) => handleFilterChange('cliente', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
//               placeholder="Ej: SONEPAR"
//             />
//           </div>
//         </div>

//         {Object.values(filters).some((f) => f.trim() !== "") && (
//           <div className="mt-4 pt-4 border-t border-gray-200">
//             <div className="text-sm text-gray-600 flex items-center justify-between">
//               <span>
//                 Filtros activos:
//                 <span className="font-medium text-blue-600 ml-2">
//                   {Object.values(filters).filter((f) => f.trim() !== "").length}
//                 </span>
//               </span>
//               <button
//                 onClick={clearFilters}
//                 className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//               >
//                 Limpiar todos los filtros
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Resumen selección */}
//       {selectedFletes.length > 0 && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="text-sm text-blue-800">
//                 <span className="font-medium">{selectedFletes.length}</span>{" "}
//                 flete(s) seleccionado(s)
//               </div>
//               <div className="text-sm text-blue-800">
//                 Monto total: S/. {totalMontoSeleccionado.toFixed(2)}
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setSelectedFletes([])}
//                 className="text-sm text-blue-600 hover:text-blue-800"
//               >
//                 Deseleccionar todos
//               </button>
//               <Button
//                 onClick={handleCreateInvoice}
//                 icon={FilePlus}
//                 size="small"
//               >
//                 Crear Factura
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tabla estilo Excel */}
//       <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-xs border-collapse">
//             <thead>
//               <tr className="bg-gray-100 border-b border-gray-300">
//                 <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={handleSelectAll}
//                       className="focus:outline-none"
//                       title={
//                         selectedFletes.length === fletes.length
//                           ? "Deseleccionar todos"
//                           : "Seleccionar todos"
//                       }
//                     >
//                       {selectedFletes.length === fletes.length &&
//                         fletes.length > 0 ? (
//                         <CheckSquare className="h-4 w-4 text-blue-600" />
//                       ) : (
//                         <Square className="h-4 w-4 text-gray-400" />
//                       )}
//                     </button>
//                   </div>
//                 </th>
//                 <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
//                   <div className="flex items-center gap-1">
//                     <Hash className="h-3 w-3" />
//                     Códigos
//                   </div>
//                 </th>
//                 <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
//                   <div className="flex items-center gap-1">
//                     <Hash className="h-3 w-3" />
//                     Clientes
//                   </div>
//                 </th>
//                 <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
//                   <div className="flex items-center gap-1">
//                     <Hash className="h-3 w-3" />
//                     Placa
//                   </div>
//                 </th>
//                 <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
//                   <div className="flex items-center gap-1">
//                     <Calendar className="h-3 w-3" />
//                     Fecha Servicio
//                   </div>
//                 </th>
//                 <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
//                   <div className="flex items-center gap-1">
//                     <DollarSign className="h-3 w-3" />
//                     Monto Flete
//                   </div>
//                 </th>
//                 <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
//                   <div className="flex items-center gap-1">
//                     <CheckCircle className="h-3 w-3" />
//                     Estado
//                   </div>
//                 </th>

//                 <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
//                   <div className="flex items-center gap-1">
//                     <FileText className="h-3 w-3" />
//                     Observaciones
//                   </div>
//                 </th>
//                 <th className="py-2 px-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                   Acciones
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {Array.isArray(fletes) && fletes.length > 0 ? (
//                 fletes.map((flete) => {
//                   const isSelected = selectedFletes.includes(flete.id);
//                   const isEditing = editingFlete === flete.id;

//                   return (
//                     <tr
//                       key={flete.id}
//                       className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${isSelected ? "bg-blue-50" : ""
//                         }`}
//                       onClick={() => handleRowClick(flete)}
//                     >
//                       <td
//                         className="px-3 py-2 border-r border-gray-200"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <div className="flex items-center">
//                           <input
//                             type="checkbox"
//                             checked={isSelected}
//                             onChange={(e) => handleSelectFlete(flete.id, e)}
//                             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                         </div>
//                       </td>

//                       <td className="px-3 py-2 border-r border-gray-200">
//                         <div className="font-medium text-gray-900">
//                           C. Flete: <p class="text-xs">{flete.codigo_flete}</p>
//                           C. Servicio: <p class="text-xs"> {flete.codigo_servicio}</p>
//                         </div>
//                       </td>

//                       <td className="px-3 py-2 border-r border-gray-200">
//                         <div className="font-medium text-gray-900">
//                           {flete?.servicio?.cliente?.nombre}
//                         </div>
//                       </td>
//                       <td className="px-3 py-2 border-r border-gray-200">
//                         <div className="font-medium text-gray-900">
//                           {flete?.servicio?.flota?.placa} 
//                         </div>
//                       </td>

//                       {/* Fecha Servicio */}
//                       <td className="px-3  border-r border-gray-200 whitespace-nowrap">
//                         <div className="text-gray-900">
//                           {formatFecha(flete?.servicio?.fecha_servicio)}
//                         </div>
//                       </td>

//                       <td className="px-3 py-2 border-r border-gray-200">
//                         {isEditing ? (
//                           <div className="flex items-center gap-2">
//                             <span className="text-gray-500">S/.</span>
//                             <input
//                               type="number"
//                               value={editForm.monto_flete}
//                               onChange={(e) => setEditForm({ ...editForm, monto_flete: e.target.value })}
//                               onClick={(e) => e.stopPropagation()}
//                               onMouseDown={(e) => e.stopPropagation()}
//                               className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
//                               placeholder="0.00"
//                               step="0.01"
//                               min="0"
//                             />
//                           </div>
//                         ) : (
//                           <div className="font-medium text-gray-900">
//                             S/. {parseFloat(flete.monto_flete || 0).toFixed(2)}
//                           </div>
//                         )}
//                       </td>

//                       <td className="px-3 py-2 border-r border-gray-200">
//                         <span
//                           className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium`}
//                         >
//                           {flete.estado_flete || "N/A"}
//                         </span>
//                       </td>

//                       <td className="px-3 py-2 border-r border-gray-200">
//                         {isEditing ? (
//                           <textarea
//                             value={editForm.observaciones}
//                             onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
//                             onClick={(e) => e.stopPropagation()}
//                             onMouseDown={(e) => e.stopPropagation()}
//                             className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
//                             placeholder="Observaciones..."
//                             rows="2"
//                           />
//                         ) : (
//                           <div className="text-gray-900 truncate max-w-[100px]">
//                             {flete.observaciones || "Sin observaciones"}
//                           </div>
//                         )}
//                       </td>

//                       <td
//                         className="px-3 py-2"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <div className="flex space-x-1">
//                           {isEditing ? (
//                             <>
//                               <button
//                                 onClick={(e) => {
//                                   e.preventDefault();
//                                   e.stopPropagation();
//                                   handleSaveEdit(flete.id);
//                                 }}
//                                 className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
//                                 title="Guardar cambios"
//                                 disabled={isLoading}
//                               >
//                                 <Save className="h-3.5 w-3.5" />
//                               </button>
//                               <button
//                                 onClick={(e) => {
//                                   e.preventDefault();
//                                   e.stopPropagation();
//                                   handleCancelEdit();
//                                 }}
//                                 className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
//                                 title="Cancelar edición"
//                               >
//                                 <XCircle className="h-3.5 w-3.5" />
//                               </button>
//                             </>
//                           ) : (
//                             <>
//                               <button
//                                 onClick={(e) => {
//                                   e.preventDefault();
//                                   e.stopPropagation();
//                                   handleEdit(flete, e);
//                                 }}
//                                 className=" rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100"
//                                 title="Editar flete"
//                               >
//                                 Editar Flete
//                               </button>
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleView(flete);
//                                 }}
//                                 className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
//                                 title="Ver detalles"
//                               >
//                                 Detalles Flete
//                               </button>
//                               {/* Botón para ver gastos (NUEVO) */}
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleVerGastos(flete);
//                                 }}
//                                 className="p-1 rounded text-purple-600 hover:text-purple-800 hover:bg-purple-100"
//                                 title="Ver gastos asociados"
//                               >
//                                 Gastos Asociados
//                               </button>
//                               {/* Botón para agregar gasto (NUEVO) */}
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleGastosAdicionales(flete);
//                                 }}
//                                 className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
//                                 title="Agregar gasto adicional"
//                               >
//                                 Agregar Gastos
//                               </button>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan="9" className="px-3 py-8 text-center">
//                     {isLoading ? (
//                       <div className="flex justify-center">
//                         <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
//                       </div>
//                     ) : (
//                       <div className="text-center py-12">
//                         <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                           No se encontraron fletes
//                         </h3>
//                         <p className="text-gray-600 mb-6">
//                           {Object.values(filters).some((f) => f.trim() !== "")
//                             ? "Intenta ajustar los filtros de búsqueda"
//                             : "No hay fletes valorizados pendientes de facturación"}
//                         </p>
//                         {Object.values(filters).some(
//                           (f) => f.trim() !== ""
//                         ) && (
//                             <Button onClick={clearFilters} size="small">
//                               Limpiar filtros
//                             </Button>
//                           )}
//                       </div>
//                     )}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Paginación y registros por página */}
//       {fletes.length > 0 && (
//         <div className="flex flex-col sm:flex-row items-center justify-between mt-6">
//           <div className="flex items-center space-x-4 mb-4 sm:mb-0">
//             <span className="text-sm text-gray-600">Mostrar</span>
//             <select
//               className="border border-gray-300 rounded px-3 py-1 text-sm"
//               value={pagination.itemsPerPage}
//               onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
//             >
//               {itemsPerPageOptions.map((option) => (
//                 <option key={option} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </select>
//             <span className="text-sm text-gray-600">registros por página</span>
//           </div>

//           <Pagination
//             currentPage={pagination.currentPage}
//             totalPages={pagination.totalPages}
//             totalItems={pagination.totalItems}
//             itemsPerPage={pagination.itemsPerPage}
//             onPageChange={handlePageChange}
//             startIndex={
//               (pagination.currentPage - 1) * pagination.itemsPerPage + 1
//             }
//             endIndex={Math.min(
//               pagination.currentPage * pagination.itemsPerPage,
//               pagination.totalItems
//             )}
//           />
//         </div>
//       )}

//       {/* Modal de detalles del flete/servicio/gastos */}
//       <Modal
//         isOpen={showDetalleModal}
//         onClose={handleCloseDetalleModal}
//         title={
//           modalMode === "flete"
//             ? `Detalles del Flete - ${fleteSeleccionado?.codigo_flete || ""}`
//             : modalMode === "servicio"
//               ? `Detalles del Servicio - ${servicioDetalle?.codigo_servicio_principal ||
//               fleteSeleccionado?.codigo_servicio ||
//               ""
//               }`
//               : `Gastos del Flete - ${fleteSeleccionado?.codigo_flete || ""}`
//         }
//         size={modalMode === 'gastos' ? 'large' : 'medium'}
//       >
//         {modalMode === "flete" ? (
//           // Vista de detalles del flete
//           fleteSeleccionado && (
//             <div className="space-y-6">
//               <div className="flex justify-end mb-4 space-x-2">
//                 <Button
//                   onClick={handleViewServicioFromFlete}
//                   variant="secondary"
//                   size="small"
//                   icon={Info}
//                   isLoading={loadingServicio}
//                 >
//                   Ver Detalles del Servicio
//                 </Button>
//                 <Button
//                   onClick={() => handleVerGastos(fleteSeleccionado)}
//                   variant="secondary"
//                   size="small"
//                   icon={Receipt}
//                   isLoading={loadingGastos}
//                 >
//                   Ver Gastos Asociados
//                 </Button>
//                 <Button
//                   onClick={() => handleGastosAdicionales(fleteSeleccionado)}
//                   variant="primary"
//                   size="small"
//                   icon={PlusCircle}
//                 >
//                   Agregar Gasto
//                 </Button>
//               </div>

//               <div className="bg-white rounded-lg border border-gray-200">
//                 <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                     <FileText className="h-5 w-5" />
//                     Información General del Flete
//                   </h3>
//                 </div>
//                 <div className="p-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Código Flete
//                       </label>
//                       <p className="text-sm font-semibold text-gray-900">
//                         {fleteSeleccionado.codigo_flete}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Código Servicio
//                       </label>
//                       <p className="text-sm font-semibold text-gray-900">
//                         {fleteSeleccionado.codigo_servicio}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Estado
//                       </label>
//                       <span
//                         className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(
//                           fleteSeleccionado.estado_flete
//                         )}`}
//                       >
//                         {fleteSeleccionado.estado_flete}
//                       </span>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Monto
//                       </label>
//                       <p className="text-sm font-semibold text-gray-900">
//                         S/.{" "}
//                         {parseFloat(fleteSeleccionado.monto_flete || 0).toFixed(
//                           2
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-500 mb-1">
//                         Fecha Creación
//                       </label>
//                       <p className="text-sm text-gray-900">
//                         {formatFecha(fleteSeleccionado.fecha_creacion)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {gastosFleteData && (
//                 <div className="bg-white rounded-lg border border-gray-200">
//                   <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
//                     <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                       <AlertCircle className="h-5 w-5" />
//                       Gastos Adicionales (Resumen)
//                     </h3>
//                   </div>

//                   <div className="p-4 space-y-4">
//                     {/* Loading */}
//                     {loadingGastos && (
//                       <p className="text-sm text-gray-500">Cargando gastos...</p>
//                     )}

//                     {/* Resumen */}
//                     {gastosFleteData && (
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
//                         <div className="bg-gray-50 p-3 rounded">
//                           <p className="text-gray-500">Cantidad</p>
//                           <p className="font-semibold">{gastosFleteData.cantidad_gastos}</p>
//                         </div>

//                         <div className="bg-gray-50 p-3 rounded">
//                           <p className="text-gray-500">Total Gastos</p>
//                           <p className="font-semibold">
//                             S/ {gastosFleteData.total_gastos.toFixed(2)}
//                           </p>
//                         </div>

//                         <div className="bg-green-50 p-3 rounded">
//                           <p className="text-gray-500">Recuperable Cliente</p>
//                           <p className="font-semibold text-green-700">
//                             S/ {gastosFleteData.total_recuperable_cliente.toFixed(2)}
//                           </p>
//                         </div>

//                         <div className="bg-red-50 p-3 rounded">
//                           <p className="text-gray-500">Costo Operativo</p>
//                           <p className="font-semibold text-red-700">
//                             S/ {gastosFleteData.total_costo_operativo.toFixed(2)}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {/* Sin gastos */}
//                     {gastosFleteData && gastosFleteData.cantidad_gastos === 0 && (
//                       <p className="text-sm text-gray-500">
//                         Este flete no tiene gastos registrados
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div className="bg-white rounded-lg border border-gray-200">
//                 <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                     <AlertCircle className="h-5 w-5" />
//                     Observaciones
//                   </h3>
//                 </div>
//                 <div className="p-4">
//                   <p className="text-sm text-gray-900 whitespace-pre-wrap">
//                     {fleteSeleccionado.observaciones || "Sin observaciones"}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex justify-end pt-4 border-t border-gray-200">
//                 <Button
//                   onClick={handleCloseDetalleModal}
//                   variant="secondary"
//                   size="small"
//                 >
//                   Cerrar
//                 </Button>
//               </div>
//             </div>
//           )
//         ) : modalMode === "servicio" ? (
//           // Vista de detalles del servicio
//           <div className="space-y-6">
//             <div className="flex justify-between items-center mb-4">
//               <Button
//                 onClick={handleBackToFlete}
//                 variant="secondary"
//                 size="small"
//                 icon={ArrowLeft}
//               >
//                 Volver al Flete
//               </Button>
//               {loadingServicio && (
//                 <div className="text-sm text-blue-600 animate-pulse">
//                   Cargando detalles del servicio...
//                 </div>
//               )}
//             </div>

//             {servicioDetalle && (
//               <>
//                 <div className="bg-white rounded-lg border border-gray-200">
//                   <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
//                     <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                       <Info className="h-5 w-5" />
//                       Información del Servicio
//                     </h3>
//                   </div>
//                   <div className="p-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Código
//                         </label>
//                         <p className="text-sm font-semibold text-gray-900">
//                           {servicioDetalle.codigo_servicio_principal ||
//                             fleteSeleccionado?.codigo_servicio ||
//                             "N/A"}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Estado
//                         </label>
//                         <span
//                           className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${servicioDetalle.estado === "Completado"
//                               ? "bg-green-100 text-green-800 border border-green-300"
//                               : servicioDetalle.estado === "Cancelado"
//                                 ? "bg-red-100 text-red-800 border border-red-300"
//                                 : "bg-yellow-100 text-yellow-800 border border-yellow-300"
//                             }`}
//                         >
//                           {servicioDetalle.estado || "Estado no disponible"}
//                         </span>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Fecha Servicio
//                         </label>
//                         <p className="text-sm text-gray-900">
//                           {servicioDetalle.fecha_servicio ||
//                             "Fecha no disponible"}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Tipo de Servicio
//                         </label>
//                         <p className="text-sm text-gray-900">
//                           {servicioDetalle.tipo_servicio ||
//                             "Tipo no disponible"}{" "}
//                           -
//                           {servicioDetalle.modalidad_servicio ||
//                             "Modalidad no disponible"}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Placa
//                         </label>
//                         <p className="text-sm text-gray-900">
//                           {servicioDetalle.flota?.placa ||
//                             "Placa no disponible"}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Cliente
//                         </label>
//                         <p className="text-sm text-gray-900">
//                           {servicioDetalle.cliente?.nombre ||
//                             "Cliente no disponible"}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Origen
//                         </label>
//                         <p className="text-sm text-gray-900">
//                           {servicioDetalle.origen || "Origen no disponible"}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Destino
//                         </label>
//                         <p className="text-sm text-gray-900">
//                           {servicioDetalle.destino || "Destino no disponible"}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Gías
//                         </label>
//                         <p className="text-sm text-gray-900">
//                           RR: {servicioDetalle.gia_rr || "No disponible"} <br />
//                           RT: {servicioDetalle.gia_rt || "No disponible"}
//                         </p>
//                       </div>
//                       {servicioDetalle.descripcion && (
//                         <div className="md:col-span-2">
//                           <label className="block text-sm font-medium text-gray-500 mb-1">
//                             Descripción
//                           </label>
//                           <p className="text-sm text-gray-900">
//                             {servicioDetalle.descripcion}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg border border-gray-200">
//                   <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
//                     <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                       <DollarSign className="h-5 w-5" />
//                       Flete Relacionado
//                     </h3>
//                   </div>
//                   <div className="p-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Código Flete
//                         </label>
//                         <p className="text-sm font-semibold text-gray-900">
//                           {fleteSeleccionado?.codigo_flete || "N/A"}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Estado del Flete
//                         </label>
//                         <span
//                           className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(
//                             fleteSeleccionado?.estado_flete
//                           )}`}
//                         >
//                           {fleteSeleccionado?.estado_flete || "N/A"}
//                         </span>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Monto del Flete
//                         </label>
//                         <p className="text-sm font-semibold text-gray-900">
//                           S/.{" "}
//                           {fleteSeleccionado
//                             ? parseFloat(
//                               fleteSeleccionado.monto_flete || 0
//                             ).toFixed(2)
//                             : "0.00"}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-500 mb-1">
//                           Fecha Creación
//                         </label>
//                         <p className="text-sm text-gray-900">
//                           {fleteSeleccionado
//                             ? formatFecha(fleteSeleccionado.fecha_creacion)
//                             : "N/A"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}

//             <div className="flex justify-end pt-4 border-t border-gray-200">
//               <Button
//                 onClick={handleCloseDetalleModal}
//                 variant="secondary"
//                 size="small"
//               >
//                 Cerrar
//               </Button>
//             </div>
//           </div>
//         ) : (
//           // Vista de gastos del flete (NUEVO)
//           <div className="space-y-6">
//             {/* Botón para volver al flete */}
//             <div className="flex justify-between items-center mb-4">
//               <Button
//                 onClick={handleBackToFlete}
//                 variant="secondary"
//                 size="small"
//                 icon={ArrowLeft}
//               >
//                 Volver al Flete
//               </Button>
//               <div className="flex space-x-2">
//                 <Button
//                   onClick={() => handleGastosAdicionales(fleteSeleccionado)}
//                   variant="primary"
//                   size="small"
//                   icon={PlusCircle}
//                 >
//                   Agregar Gasto
//                 </Button>
//               </div>
//             </div>

//             {/* Tabla de gastos */}
//             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-xs">
//                   <thead>
//   <tr className="bg-gray-100 border-b border-gray-300">
//     <th className="py-2 px-3 text-left font-semibold text-gray-700">ID</th>
//     <th className="py-2 px-3 text-left font-semibold text-gray-700">Fecha</th>
//     <th className="py-2 px-3 text-left font-semibold text-gray-700">Tipo de Gasto</th>
//     <th className="py-2 px-3 text-left font-semibold text-gray-700">Valor</th>
//     <th className="py-2 px-3 text-left font-semibold text-gray-700">¿Se Factura?</th>
//     <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado Facturación</th>
//     <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado Aprobación</th>
//     <th className="py-2 px-3 text-left font-semibold text-gray-700">Observaciones</th>
//     <th className="py-2 px-3 text-left font-semibold text-gray-700">Acciones</th>
//   </tr>
// </thead>
//                  <tbody>
//   {loadingGastos ? (
//     <tr>
//       <td colSpan="9" className="py-4 text-center">
//         <div className="animate-pulse flex items-center justify-center">
//           <div className="h-4 bg-gray-200 rounded w-1/4"></div>
//         </div>
//       </td>
//     </tr>
//   ) : gastosFlete.length === 0 ? (
//     <tr>
//       <td colSpan="9" className="py-8 text-center text-gray-500">
//         <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
//         <p>No hay gastos registrados para este flete</p>
//       </td>
//     </tr>
//   ) : (
//     gastosFlete.map((gasto) => (
//       <tr key={gasto.id} className="border-b border-gray-200 hover:bg-gray-50">
//         <td className="py-2 px-3">{gasto.codigo_gasto}</td>
//         <td className="py-2 px-3">{formatFecha(gasto.fecha_gasto)}</td>
//         <td className="py-2 px-3 font-medium">{gasto.tipo_gasto}</td>
//         <td className="py-2 px-3 font-semibold">{formatMoneda(gasto.valor)}</td>
//         <td className="py-2 px-3">
//           <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
//             gasto.se_factura_cliente 
//               ? 'bg-blue-100 text-blue-800' 
//               : 'bg-gray-100 text-gray-800'
//           }`}>
//             {gasto.se_factura_cliente ? 'SÍ' : 'NO'}
//           </span>
//         </td>
//         <td className="py-2 px-3">
//           <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getEstadoFacturacionClass(gasto.estado_facturacion)}`}>
//             {gasto.estado_facturacion}
//           </span>
//         </td>
//         <td className="py-2 px-3">
//           <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getEstadoAprobacionClass(gasto.estado_aprobacion)}`}>
//             {gasto.estado_aprobacion}
//           </span>
//         </td>
//         <td className="py-2 px-3">{gasto.descripcion}</td>
//         <td className="py-2 px-3">
//           <div className="flex space-x-1">
//             <button
//               onClick={(e) => handleDeleteGastoClick(gasto, e)}
//               className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
//               title="Eliminar gasto"
//               disabled={isDeletingGasto}
//             >
//               <X className="h-3.5 w-3.5" />
//             </button>
//           </div>
//         </td>
//       </tr>
//     ))
//   )}
// </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Totales */}
//             {gastosFlete.length > 0 && (
//               <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h4 className="font-semibold text-gray-900">Resumen de Gastos</h4>
//                     <p className="text-sm text-gray-600">{gastosFlete.length} gasto(s) registrado(s)</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-600">Total de Gastos</p>
//                     <p className="text-xl font-bold text-gray-900">
//                       S/ {gastosFlete.reduce((sum, gasto) => sum + parseFloat(gasto.valor), 0).toFixed(2)}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Botón de cierre */}
//             <div className="flex justify-end pt-4 border-t border-gray-200">
//               <Button
//                 onClick={handleCloseDetalleModal}
//                 variant="secondary"
//                 size="small"
//               >
//                 Cerrar
//               </Button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Modal para crear factura - FORMULARIO SIMPLIFICADO */}
//       <Modal
//         isOpen={showFacturaModal}
//         onClose={handleCloseFacturaModal}
//         title="Crear Factura"
//         size="medium"
//       >
//         <div className="space-y-6">
//           {/* Resumen de fletes seleccionados */}
//           <div className="bg-gray-50 rounded-lg p-4">
//             <h4 className="text-md font-semibold text-gray-900 mb-3">
//               Fletes Seleccionados ({selectedFletes.length})
//             </h4>
//             <div className="max-h-40 overflow-y-auto">
//               <table className="min-w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="py-2 text-left font-medium text-gray-700">
//                       Código Flete
//                     </th>
//                     <th className="py-2 text-left font-medium text-gray-700">
//                       Código Servicio
//                     </th>
//                     <th className="py-2 text-left font-medium text-gray-700">
//                       Monto
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedFletes.map((id) => {
//                     const flete = fletes.find((f) => f.id === id);
//                     if (!flete) return null;

//                     return (
//                       <tr key={id} className="border-b border-gray-100">
//                         <td className="py-2">{flete.codigo_flete}</td>
//                         <td className="py-2">{flete.codigo_servicio}</td>
//                         <td className="py-2">
//                           S/. {parseFloat(flete.monto_flete || 0).toFixed(2)}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//             <div className="mt-3 pt-3 border-t border-gray-200">
//               <div className="text-sm font-semibold text-gray-900">
//                 Total: S/. {totalMontoSeleccionado.toFixed(2)}
//               </div>
//             </div>
//           </div>

//           {/* Formulario de factura simplificado */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Número de Factura *
//               </label>
//               <input
//                 type="text"
//                 value={facturaForm.numero_factura}
//                 onChange={(e) => handleFacturaFormChange('numero_factura', e.target.value)}
//                 className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${formErrors.numero_factura ? 'border-red-300' : 'border-gray-300'
//                   }`}
//                 placeholder="Ej: F-20240001"
//               />
//               {formErrors.numero_factura && (
//                 <p className="mt-1 text-sm text-red-600">{formErrors.numero_factura}</p>
//               )}
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Fecha Emisión *
//                 </label>
//                 <div className="flex items-center gap-2">
//                   <CalendarDays className="h-4 w-4 text-gray-400" />
//                   <input
//                     type="date"
//                     value={facturaForm.fecha_emision}
//                     onChange={(e) => handleFacturaFormChange('fecha_emision', e.target.value)}
//                     className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${formErrors.fecha_emision ? 'border-red-300' : 'border-gray-300'
//                       }`}
//                   />
//                 </div>
//                 {formErrors.fecha_emision && (
//                   <p className="mt-1 text-sm text-red-600">{formErrors.fecha_emision}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Fecha Vencimiento *
//                 </label>
//                 <div className="flex items-center gap-2">
//                   <CalendarDays className="h-4 w-4 text-gray-400" />
//                   <input
//                     type="date"
//                     value={facturaForm.fecha_vencimiento}
//                     onChange={(e) => handleFacturaFormChange('fecha_vencimiento', e.target.value)}
//                     className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${formErrors.fecha_vencimiento ? 'border-red-300' : 'border-gray-300'
//                       }`}
//                   />
//                 </div>
//                 {formErrors.fecha_vencimiento && (
//                   <p className="mt-1 text-sm text-red-600">{formErrors.fecha_vencimiento}</p>
//                 )}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Moneda *
//               </label>
//               <select
//                 value={facturaForm.moneda}
//                 onChange={(e) => handleFacturaFormChange('moneda', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//               >
//                 <option value="PEN">Soles (PEN)</option>
            
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Monto Total *
//               </label>
//               <div className="relative">
//                 <span className="absolute left-3 top-2 text-gray-500">
//                   {facturaForm.moneda === 'PEN' ? 'S/' : '$'}
//                 </span>
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   value={facturaForm.monto_total}
//                   onChange={(e) => handleFacturaFormChange('monto_total', e.target.value)}
//                   className={`w-full pl-10 pr-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${formErrors.monto_total ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                   placeholder="0.00"
//                 />
//               </div>
//               {formErrors.monto_total && (
//                 <p className="mt-1 text-sm text-red-600">{formErrors.monto_total}</p>
//               )}
//               <p className="mt-1 text-xs text-gray-500">
//                 Suma automática de fletes: {totalMontoSeleccionado.toFixed(2)} {facturaForm.moneda === 'PEN' ? 'S/' : '$'}
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Descripción
//               </label>
//               <textarea
//                 value={facturaForm.descripcion}
//                 onChange={(e) => handleFacturaFormChange('descripcion', e.target.value)}
//                 rows="3"
//                 className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 placeholder="Descripción de la factura..."
//               />
//             </div>
//           </div>

//           {/* Botones del formulario */}
//           <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
//             <Button
//               type="button"
//               onClick={handleCloseFacturaModal}
//               variant="secondary"
//               disabled={isCreatingInvoice}
//             >
//               Cancelar
//             </Button>
//             <Button
//               onClick={handleCreateFactura}
//               isLoading={isCreatingInvoice}
//             >
//               Crear Factura
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Modal para agregar gasto adicional (NUEVO) */}
//       <Modal
//         isOpen={showGastoModal}
//         onClose={handleCloseGastoModal}
//         title={`Agregar Gasto Adicional - ${fleteSeleccionado?.codigo_flete || ''}`}
//         size="medium"
//       >
//         <div className="space-y-4">
//           <p className="text-sm text-gray-600 mb-4">
//             Complete el formulario para registrar un gasto adicional al flete
//           </p>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Fecha */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                 <Calendar className="h-4 w-4" />
//                 Fecha *
//               </label>
//               <input
//                 type="date"
//                 value={gastoForm.fecha}
//                 onChange={(e) => handleGastoFormChange('fecha', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
//                 required
//               />
//               <p className="text-xs text-gray-500 mt-1">La fecha se establece automáticamente</p>
//             </div>

//             {/* Tipo de Gasto */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Tipo de Gasto *
//               </label>
//               <select
//                 value={gastoForm.tipo_gasto}
//                 onChange={(e) => handleGastoFormChange('tipo_gasto', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
//                 required
//               >
//                 <option value="">Seleccione un tipo</option>
//                 {tipoGastoOptions.map((tipo) => (
//                   <option key={tipo} value={tipo}>
//                     {tipo}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Valor */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                 Valor *
//               </label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
//                 <input
//                   type="number"
//                   value={gastoForm.valor}
//                   onChange={(e) => handleGastoFormChange('valor', e.target.value)}
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
//                   placeholder="0.00"
//                   step="0.01"
//                   min="0"
//                   required
//                 />
//               </div>
//             </div>

//             {/* ¿Se Factura? */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 ¿Se Factura al Cliente? *
//               </label>
//               <div className="flex space-x-4">
//                 <label className="flex items-center">
//                   <input
//                     type="radio"
//                     name="se_factura"
//                     value={true}
//                     checked={gastoForm.se_factura === true}
//                     onChange={(e) => handleGastoFormChange('se_factura', e.target.value === 'true' ? true : e.target.value)}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500"
//                   />
//                   <span className="ml-2 text-sm">SÍ</span>
//                 </label>
//                 <label className="flex items-center">
//                   <input
//                     type="radio"
//                     name="se_factura"
//                     value={false}
//                     checked={gastoForm.se_factura === false}
//                     onChange={(e) => handleGastoFormChange('se_factura', e.target.value === 'false' ? false : e.target.value)}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500"
//                   />
//                   <span className="ml-2 text-sm">NO</span>
//                 </label>
//               </div>
//             </div>


//           </div>

//           {/* Observaciones */}
//           <div className="col-span-1 md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Observaciones
//             </label>
//             <textarea
//               value={gastoForm.observaciones}
//               onChange={(e) => handleGastoFormChange('observaciones', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
//               placeholder="Observaciones adicionales..."
//               rows="3"
//             />
//           </div>

//           {/* Botones */}
//           <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
//             <Button
//               onClick={handleCloseGastoModal}
//               variant="secondary"
//               size="small"
//             >
//               Cancelar
//             </Button>
//             <Button
//               onClick={handleSaveGasto}
//               variant="primary"
//               size="small"
//               icon={Save}
//             >
//               Guardar Gasto
//             </Button>
//           </div>
//         </div>
//       </Modal>


//       <Modal
//   isOpen={showDeleteConfirm}
//   onClose={handleCancelDeleteGasto}
//   title="Confirmar Eliminación"
//   size="small"
// >
//   <div className="space-y-4">
//     <div className="flex items-center gap-3 text-red-600">
//       <AlertCircle className="h-6 w-6" />
//       <p className="font-semibold">¿Está seguro de eliminar este gasto?</p>
//     </div>
    
//     {gastoToDelete && (
//       <div className="bg-gray-50 p-3 rounded border border-gray-200">
//         <p className="text-sm font-medium">Código: {gastoToDelete.codigo_gasto}</p>
//         <p className="text-sm">Tipo: {gastoToDelete.tipo_gasto}</p>
//         <p className="text-sm">Valor: {formatMoneda(gastoToDelete.valor)}</p>
//         <p className="text-sm text-gray-600 mt-1">
//           Fecha: {formatFecha(gastoToDelete.fecha_gasto)}
//         </p>
//       </div>
//     )}
    
//     <p className="text-sm text-gray-600">
//       Esta acción no se puede deshacer. El gasto será eliminado permanentemente.
//     </p>
    
//     <div className="flex justify-end space-x-3 pt-4">
//       <Button
//         onClick={handleCancelDeleteGasto}
//         variant="secondary"
//         disabled={isDeletingGasto}
//       >
//         Cancelar
//       </Button>
//       <Button
//         onClick={handleConfirmDeleteGasto}
//         variant="danger"
//         isLoading={isDeletingGasto}
//       >
//         Eliminar Gasto
//       </Button>
//     </div>
//   </div>
// </Modal>
//     </div>
//   );
// };

// export default React.memo(FletesPorFacturar);

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  RefreshCw,
  Filter,
  Download,
  Eye,
  X,
  CheckCircle,
  Calendar,
  FileText,
  User,
  DollarSign,
  Hash,
  CheckSquare,
  Square,
  FilePlus,
  Edit,
  Save,
  XCircle,
  Info,
  AlertCircle,
  CalendarDays,
  PlusCircle,
  Receipt,
  ArrowLeft,
  CheckSquare as CheckSquareIcon,
  XSquare,
  MapPin,
  Package,
  Users,
  Tag
} from "lucide-react";

// Componentes comunes
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";

// API
import { fletesAPI } from "../../../api/endpoints/fletes";
import { facturasAPI } from "../../../api/endpoints/facturas";
import { serviciosPrincipalesAPI } from "../../../api/endpoints/servicioPrincipal";

const FletesPorFacturar = () => {
  const navigate = useNavigate();

  // Estados principales
  const [fletes, setFletes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [gastosFleteData, setGastosFleteData] = useState(null);
  const [loadingGastos, setLoadingGastos] = useState(false);

  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 15,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Estados para filtros
  const [filters, setFilters] = useState({
    codigo_flete: "",
    cliente: ""
  });

  // Estados para modales y selección
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [fleteSeleccionado, setFleteSeleccionado] = useState(null);
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [selectedFletes, setSelectedFletes] = useState([]);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [editingFlete, setEditingFlete] = useState(null);
  const [editForm, setEditForm] = useState({
    monto_flete: "",
    observaciones: "",
  });
  const [modalMode, setModalMode] = useState("flete");

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados para gastos adicionales
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [gastosFlete, setGastosFlete] = useState([]);
// En los estados del componente, dentro de la sección de estados para gastos adicionales:
const [gastoForm, setGastoForm] = useState({
  fecha: '',
  tipo_gasto: '',
  valor: '',
  se_factura: false,
  estado_facturacion: 'N/A',
  n_factura: '',
  estado_aprobacion: 'PENDIENTE',
  observaciones: '',
  tipo_gasto_personalizado: '' // ← AGREGAR ESTA LÍNEA
});

  // Estado para el formulario de factura
  const [facturaForm, setFacturaForm] = useState({
    numero_factura: "",
    fecha_emision: "",
    fecha_vencimiento: "",
    monto_total: "",
    moneda: "PEN",
    descripcion: "",
  });

  const [formErrors, setFormErrors] = useState({});
  
  // Estados para eliminación de gastos
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState(null);
  const [isDeletingGasto, setIsDeletingGasto] = useState(false);

  const itemsPerPageOptions = [10, 15, 20, 30, 50];
  const isInitialMount = useRef(true);

  // Opciones para tipo de gasto
  const tipoGastoOptions = [
    'Estadía',
    'Reparación',
    'Peaje Extra',
    'Maniobras',
    'Multa',
    'Combustible Extra',
    'Alimentación',
    'Hospedaje',
    'Gastos Extraordinarios',
    'Otros'
  ];

  // Función principal para cargar fletes
  const fetchFletes = useCallback(
    async (page = 1, itemsPerPage = pagination.itemsPerPage, filtersToUse = filters) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        // Preparar filtros para API
        const filtersForAPI = {};
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value && value.trim() !== "") {
            filtersForAPI[key] = value.trim();
          }
        });

        // Añadir filtros fijos
        filtersForAPI.estado_flete = "VALORIZADO";
        filtersForAPI.pertenece_a_factura = false;
        filtersForAPI.page = page;
        filtersForAPI.page_size = itemsPerPage;

        console.log('Fetching fletes with params:', filtersForAPI);

        // Usar la API
        const response = await fletesAPI.getAdvancedFletes(filtersForAPI);
        console.log('API Response:', response);

        // Procesar respuesta
        if (response && response.items) {
          setFletes(response.items);

          // Actualizar paginación
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.total || 0,
            totalPages: response.total_pages || 1,
            hasNext: response.has_next || false,
            hasPrev: response.has_prev || false,
          });
        } else if (response && Array.isArray(response)) {
          // Si la respuesta es un array directo
          setFletes(response);
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: response.length || 0,
            totalPages: Math.ceil((response.length || 0) / itemsPerPage),
            hasNext: (response.length || 0) >= itemsPerPage,
            hasPrev: page > 1,
          });
        } else {
          setFletes([]);
          setPagination({
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          });
        }

      } catch (err) {
        setError("Error al cargar los fletes: " + (err.message || "Error desconocido"));
        console.error("Error fetching fletes:", err);
        setFletes([]);
        setPagination({
          currentPage: page,
          itemsPerPage: itemsPerPage,
          totalItems: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Función para cargar gastos de un flete
  const fetchGastosFlete = useCallback(async (fleteId) => {
    if (!fleteId) return;

    setLoadingGastos(true);
    setError(null);

    try {
      const response = await fletesAPI.getGastosByFlete(fleteId);

      // Guardamos TODO el objeto
      setGastosFleteData(response);
      // También guardamos los gastos en el array para la vista de tabla
      setGastosFlete(response.gastos || []);

    } catch (err) {
      console.error(err);
      setError("Error al cargar los gastos del flete");
    } finally {
      setLoadingGastos(false);
    }
  }, []);

  // Función para ver gastos del flete
  const handleVerGastos = useCallback(
    async (flete) => {
      setFleteSeleccionado(flete);
      await fetchGastosFlete(flete.id);
      setModalMode('gastos');
      setShowDetalleModal(true);
    },
    [fetchGastosFlete]
  );

  // Función para manejar gastos adicionales
  const handleGastosAdicionales = useCallback((flete) => {
    setFleteSeleccionado(flete);
    setGastoForm({
      fecha: new Date().toISOString().split('T')[0], // Fecha actual
      tipo_gasto: '',
      valor: '',
      se_factura: false,
      estado_facturacion: 'N/A',
      n_factura: '',
      estado_aprobacion: 'PENDIENTE',
      observaciones: ''
    });
    setShowGastoModal(true);
  }, []);

  // Efecto para búsqueda en tiempo real con debounce
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Crear nuevo timeout
    const timeout = setTimeout(() => {
      // Resetear a página 1 cuando cambian los filtros
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));

      // Llamar a fetchFletes con página 1
      fetchFletes(1, pagination.itemsPerPage, filters);
    }, 300); // 300ms de debounce

    setSearchTimeout(timeout);

    // Limpiar timeout al desmontar
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters]);

  // Efecto para cargar cuando cambia la página o itemsPerPage
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
    }
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialMount.current) {
      fetchFletes(1, pagination.itemsPerPage, filters);
      isInitialMount.current = false;
    }
  }, []);

  // Efecto para inicializar el formulario cuando se abre el modal de factura
  useEffect(() => {
    if (showFacturaModal && selectedFletes.length > 0) {
      // Calcular monto total
      const montoTotal = selectedFletes.reduce((total, id) => {
        const flete = fletes.find((f) => f.id === id);
        return total + (flete ? parseFloat(flete.monto_flete || 0) : 0);
      }, 0);

      // Generar secuencia para número de factura
      const fecha = new Date();
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const numeroSugerido = `F-${year}${month}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      // Configurar fechas
      const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const fechaBase = new Date(); // Fecha actual local
      const fechaEmision = formatLocalDate(fechaBase);

      const fechaVenc = new Date(fechaBase);
      fechaVenc.setMonth(fechaVenc.getMonth() + 1);
      const fechaVencimiento = formatLocalDate(fechaVenc);

      // Actualización del formulario
      setFacturaForm({
        numero_factura: numeroSugerido,
        fecha_emision: fechaEmision,
        fecha_vencimiento: fechaVencimiento,
        monto_total: montoTotal.toFixed(2),
        moneda: "PEN",
        descripcion: selectedFletes.length === 1
          ? `Factura por flete: ${fletes.find(f => f.id === selectedFletes[0])?.codigo_flete || ""}`
          : `Factura por ${selectedFletes.length} fletes`,
      });
    }
  }, [showFacturaModal, selectedFletes, fletes]);

  // Handlers
  const handleView = useCallback((flete) => {
    setFleteSeleccionado(flete);
    setModalMode("flete");
    setShowDetalleModal(true);
  }, []);

  // Handler para actualizar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      codigo_flete: "",
      cliente: ""
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]);

  // Función para manejar clic en fila
  const handleRowClick = useCallback((flete) => {
    setFleteSeleccionado(flete);
    setModalMode("flete");
    setShowDetalleModal(true);
  }, []);

  // Manejar selección individual
  const handleSelectFlete = useCallback(
    (id, e) => {
      e.stopPropagation();
      if (selectedFletes.includes(id)) {
        setSelectedFletes(selectedFletes.filter((fleteId) => fleteId !== id));
      } else {
        setSelectedFletes([...selectedFletes, id]);
      }
    },
    [selectedFletes]
  );

  // Manejar selección todos
  const handleSelectAll = useCallback(() => {
    if (selectedFletes.length === fletes.length) {
      setSelectedFletes([]);
    } else {
      setSelectedFletes(fletes.map((flete) => flete.id));
    }
  }, [selectedFletes, fletes]);

  // Abrir modal de factura
  const handleCreateInvoice = useCallback(() => {
    if (selectedFletes.length === 0) {
      setError("Por favor seleccione al menos un flete");
      return;
    }
    setShowFacturaModal(true);
  }, [selectedFletes]);

  // Cerrar modal de factura
  const handleCloseFacturaModal = useCallback(() => {
    setShowFacturaModal(false);
    setFacturaForm({
      numero_factura: "",
      fecha_emision: "",
      fecha_vencimiento: "",
      monto_total: "",
      moneda: "PEN",
      descripcion: "",
    });
    setFormErrors({});
  }, []);

  // Cerrar modal de detalle
  const handleCloseDetalleModal = useCallback(() => {
    setShowDetalleModal(false);
    setModalMode("flete");
    setFleteSeleccionado(null);
    setGastosFleteData(null);
    setGastosFlete([]);
  }, []);

  // Cerrar modal de gasto
const handleCloseGastoModal = useCallback(() => {
  setShowGastoModal(false);
  setGastoForm({
    fecha: '',
    tipo_gasto: '',
    valor: '',
    se_factura: false,
    estado_facturacion: 'N/A',
    n_factura: '',
    estado_aprobacion: 'PENDIENTE',
    observaciones: '',
    tipo_gasto_personalizado: '' // ← AGREGAR ESTA LÍNEA
  });
}, []);

  // Handler para cambios en el formulario de factura
  const handleFacturaFormChange = useCallback((field, value) => {
    setFacturaForm(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

// Handler para cambio en formulario de gasto (NUEVO)
const handleGastoFormChange = useCallback((field, value) => {
  setGastoForm(prev => {
    const newForm = { ...prev, [field]: value };

    // Convertir valores string a boolean para se_factura
    if (field === 'se_factura') {
      // Si viene como string 'true' o 'false', convertirlo
      if (value === 'true' || value === true) {
        newForm.se_factura = true;
        newForm.estado_facturacion = 'Pendiente';
        newForm.n_factura = '';
      } else if (value === 'false' || value === false) {
        newForm.se_factura = false;
        newForm.estado_facturacion = 'N/A';
        newForm.n_factura = '---';
      }
    }

    // Si cambia el tipo de gasto y no es "Otros", limpiar el campo personalizado
    if (field === 'tipo_gasto' && value !== 'Otros') {
      newForm.tipo_gasto_personalizado = ''; // ← AGREGAR ESTA LÍNEA
    }

    return newForm;
  });
}, []);

  // Handler para guardar gasto
const handleSaveGasto = useCallback(async () => {
  if (!fleteSeleccionado) return;

  try {
    // Validaciones básicas
    if (!gastoForm.tipo_gasto) {
      throw new Error('El tipo de gasto es requerido');
    }

    // Validación específica para "Otros"
    if (gastoForm.tipo_gasto === 'Otros' && !gastoForm.tipo_gasto_personalizado.trim()) {
      throw new Error('Debe especificar el tipo de gasto personalizado');
    }

    if (!gastoForm.valor || parseFloat(gastoForm.valor) <= 0) {
      throw new Error('El valor debe ser mayor a 0');
    }

    // Determinar el tipo de gasto final
    const tipoGastoFinal = gastoForm.tipo_gasto === 'Otros' 
      ? gastoForm.tipo_gasto_personalizado 
      : gastoForm.tipo_gasto;

    // Preparar datos para enviar al backend
    const gastoData = {
      id_flete: fleteSeleccionado.id,
      fecha_gasto: gastoForm.fecha,
      tipo_gasto: tipoGastoFinal, // ← USAR EL TIPO CORRECTO
      valor: parseFloat(gastoForm.valor),
      se_factura_cliente: gastoForm.se_factura,
      descripcion: gastoForm.observaciones === "" ? "GASTO AGREGADO" : gastoForm.observaciones,
      usuario_registro: 'Sistema'
    };

    console.log('Datos listos para enviar al backend:', gastoData);

    // Llamada al backend
    await fletesAPI.createGasto(gastoData);

    // Mensaje de éxito
    setSuccessMessage('Gasto adicional registrado exitosamente');
    handleCloseGastoModal();

    // Recargar gastos si estamos en la vista de gastos
    if (modalMode === 'gastos') {
      fetchGastosFlete(fleteSeleccionado.id);
    }

  } catch (err) {
    setError('Error al registrar el gasto: ' + err.message);
  }
}, [fleteSeleccionado, gastoForm, modalMode, fetchGastosFlete, handleCloseGastoModal]);

  // Validar formulario de factura
  const validateFacturaForm = () => {
    const errors = {};

    if (!facturaForm.numero_factura.trim()) {
      errors.numero_factura = 'El número de factura es requerido';
    }

    if (!facturaForm.fecha_emision) {
      errors.fecha_emision = 'La fecha de emisión es requerida';
    }

    if (!facturaForm.fecha_vencimiento) {
      errors.fecha_vencimiento = 'La fecha de vencimiento es requerida';
    }

    const montoNum = parseFloat(facturaForm.monto_total || 0);
    if (!facturaForm.monto_total || montoNum <= 0) {
      errors.monto_total = 'El monto total debe ser mayor a 0';
    }

    // Validar que fecha de vencimiento sea mayor o igual a fecha de emisión
    if (facturaForm.fecha_emision && facturaForm.fecha_vencimiento) {
      const emision = new Date(facturaForm.fecha_emision);
      const vencimiento = new Date(facturaForm.fecha_vencimiento);

      if (vencimiento < emision) {
        errors.fecha_vencimiento = 'La fecha de vencimiento no puede ser anterior a la fecha de emisión';
      }
    }

    return errors;
  };

  // Handler para crear factura
  const handleCreateFactura = useCallback(async () => {
    const errors = validateFacturaForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsCreatingInvoice(true);
    setError(null);

    try {
      // Preparar datos de factura
      const facturaData = {
        numero_factura: facturaForm.numero_factura,
        fletes: selectedFletes.map((id) => ({ id })),
        fecha_emision: facturaForm.fecha_emision,
        fecha_vencimiento: facturaForm.fecha_vencimiento,
        estado: "Pendiente",
        monto_total: parseFloat(facturaForm.monto_total),
        moneda: facturaForm.moneda,
        descripcion: facturaForm.descripcion,
        es_borrador: false,
      };

      // Crear factura
      await facturasAPI.createFactura(facturaData);

      setSuccessMessage(
        `Factura ${facturaForm.numero_factura} creada exitosamente para ${selectedFletes.length} flete(s)`
      );

      handleCloseFacturaModal();
      setSelectedFletes([]);
      fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (err) {
      setError("Error al crear la factura: " + err.message);
    } finally {
      setIsCreatingInvoice(false);
    }
  }, [facturaForm, selectedFletes, fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters, handleCloseFacturaModal]);

  // Editar flete
  const handleEdit = useCallback((flete, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingFlete(flete.id);
    setEditForm({
      monto_flete: flete.monto_flete?.toString() || "",
      observaciones: flete.observaciones || "",
    });
  }, []);

  const handleSaveEdit = useCallback(
    async (fleteId) => {
      setIsLoading(true);
      setError(null);

      try {
        const updateData = {
          monto_flete: parseFloat(editForm.monto_flete) || 0,
          observaciones: editForm.observaciones,
        };

        if (updateData.monto_flete < 0) {
          throw new Error("El monto no puede ser negativo");
        }

        await fletesAPI.updateFlete(fleteId, updateData);

        setSuccessMessage("Flete actualizado exitosamente");
        setEditingFlete(null);
        fetchFletes(pagination.currentPage, pagination.itemsPerPage, filters);
      } catch (err) {
        setError("Error al actualizar el flete: " + err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [editForm, fetchFletes, pagination.currentPage, pagination.itemsPerPage, filters]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingFlete(null);
    setEditForm({
      monto_flete: "",
      observaciones: "",
    });
  }, []);

  // Funciones de paginación
  const handlePageChange = useCallback(
    (newPage) => {
      fetchFletes(newPage, pagination.itemsPerPage, filters);
    },
    [fetchFletes, pagination.itemsPerPage, filters]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage) => {
      fetchFletes(1, newItemsPerPage, filters);
    },
    [fetchFletes, filters]
  );

  // Función para obtener clase de estado
  const getEstadoBadgeClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case "VALORIZADO":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "PAGADO":
        return "bg-green-100 text-green-800 border border-green-300";
      case "CANCELADO":
        return "bg-red-100 text-red-800 border border-red-300";
      case "FACTURADO":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // Función para obtener clase de estado del servicio
  const getEstadoServicioClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'EN PROCESO':
      case 'EN CURSO':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'PROGRAMADO':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Función para obtener clase de estado de aprobación
  const getEstadoAprobacionClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'APROBADO':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Función para obtener clase de estado de facturación
  const getEstadoFacturacionClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'FACTURADO':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'N/A':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (e) {
      return fecha;
    }
  };

  // Formatear fecha y hora
  const formatFechaHora = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fecha;
    }
  };

const formatHora = (fecha) => {
  if (!fecha) return 'N/A';
  try {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Cambia a true si prefieres formato AM/PM
    });
  } catch (e) {   
    return fecha;
  }
};

  // Formatear valor monetario
  const formatMoneda = (valor) => {
    if (!valor) return 'S/ 0.00';
    return `S/ ${parseFloat(valor).toFixed(2)}`;
  };

  // Calcular monto total de fletes seleccionados
  const totalMontoSeleccionado = selectedFletes.reduce((total, id) => {
    const flete = fletes.find((f) => f.id === id);
    return total + (flete ? parseFloat(flete.monto_flete || 0) : 0);
  }, 0);

  // Funciones para manejar eliminación de gastos
  const handleDeleteGastoClick = useCallback((gasto, e) => {
    if (e) e.stopPropagation();
    setGastoToDelete(gasto);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDeleteGasto = useCallback(async () => {
    if (!gastoToDelete) return;

    setIsDeletingGasto(true);
    setError(null);

    try {
      // Llamada a API para eliminar gasto
      await fletesAPI.deleteGasto(gastoToDelete.id);
      
      setSuccessMessage(`Gasto ${gastoToDelete.codigo_gasto} eliminado exitosamente`);
      
      // Recargar los gastos del flete
      if (fleteSeleccionado) {
        await fetchGastosFlete(fleteSeleccionado.id);
      }
      
      setShowDeleteConfirm(false);
      setGastoToDelete(null);
    } catch (err) {
      setError(`Error al eliminar el gasto: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsDeletingGasto(false);
    }
  }, [gastoToDelete, fleteSeleccionado, fetchGastosFlete]);

  const handleCancelDeleteGasto = useCallback(() => {
    setShowDeleteConfirm(false);
    setGastoToDelete(null);
  }, []);

  // Mostrar loading solo en carga inicial
  if (isLoading && fletes.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Fletes por Facturar
          </h1>
          <p className="text-gray-600 mt-1">
            Total: {pagination.totalItems} fletes pendientes de facturación
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button
            onClick={handleCreateInvoice}
            icon={FilePlus}
            disabled={selectedFletes.length === 0}
          >
            Crear Factura ({selectedFletes.length})
          </Button>
        </div>
      </div>

      {/* Mostrar mensajes */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <div>
              <span className="font-medium">Éxito:</span>
              <span className="ml-2">{successMessage}</span>
            </div>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="mt-2 text-sm text-green-600 hover:text-green-800"
          >
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <X className="h-5 w-5 mr-2" />
            <div>
              <span className="font-medium">Error:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros de Búsqueda
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="small"
              icon={RefreshCw}
              isLoading={isLoading}
            >
              Actualizar
            </Button>

            <Button onClick={clearFilters} variant="secondary" size="small">
              Limpiar
            </Button>
          </div>
        </div>

        {/* Filtros en tiempo real */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Cliente
            </label>
            <input
              type="text"
              value={filters.cliente}
              onChange={(e) => handleFilterChange('cliente', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Ej: SONEPAR"
            />
          </div>
        </div>

        {Object.values(filters).some((f) => f.trim() !== "") && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>
                Filtros activos:
                <span className="font-medium text-blue-600 ml-2">
                  {Object.values(filters).filter((f) => f.trim() !== "").length}
                </span>
              </span>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Limpiar todos los filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resumen selección */}
      {selectedFletes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-blue-800">
                <span className="font-medium">{selectedFletes.length}</span>{" "}
                flete(s) seleccionado(s)
              </div>
              <div className="text-sm text-blue-800">
                Monto total: S/. {totalMontoSeleccionado.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFletes([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Deseleccionar todos
              </button>
              <Button
                onClick={handleCreateInvoice}
                icon={FilePlus}
                size="small"
              >
                Crear Factura
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla estilo Excel */}
      <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSelectAll}
                      className="focus:outline-none"
                      title={
                        selectedFletes.length === fletes.length
                          ? "Deseleccionar todos"
                          : "Seleccionar todos"
                      }
                    >
                      {selectedFletes.length === fletes.length &&
                        fletes.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Códigos
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Clientes
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Placa
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fecha Servicio
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Monto Flete
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Estado
                  </div>
                </th>

                <th className="py-2 px-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Observaciones
                  </div>
                </th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(fletes) && fletes.length > 0 ? (
                fletes.map((flete) => {
                  const isSelected = selectedFletes.includes(flete.id);
                  const isEditing = editingFlete === flete.id;

                  return (
                    <tr
                      key={flete.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${isSelected ? "bg-blue-50" : ""
                        }`}
                      onClick={() => handleRowClick(flete)}
                    >
                      <td
                        className="px-3 py-2 border-r border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectFlete(flete.id, e)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <div className="font-medium text-gray-900">
                          C. Flete: <p class="text-xs">{flete.codigo_flete}</p>
                          C. Servicio: <p class="text-xs"> {flete.codigo_servicio}</p>
                        </div>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <div className="font-medium text-gray-900">
                          {flete?.servicio?.cliente?.nombre}
                        </div>
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200">
                        <div className="font-medium text-gray-900">
                          {flete?.servicio?.flota?.placa} 
                        </div>
                      </td>

                      {/* Fecha Servicio */}
                      <td className="px-3  border-r border-gray-200 whitespace-nowrap">
                        <div className="text-gray-900">
                          {formatFecha(flete?.servicio?.fecha_servicio)}
                        </div>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">S/.</span>
                            <input
                              type="number"
                              value={editForm.monto_flete}
                              onChange={(e) => setEditForm({ ...editForm, monto_flete: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        ) : (
                          <div className="font-medium text-gray-900">
                            S/. {parseFloat(flete.monto_flete || 0).toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(
                            flete.estado_flete
                          )}`}
                        >
                          {flete.estado_flete || "N/A"}
                        </span>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-200">
                        {isEditing ? (
                          <textarea
                            value={editForm.observaciones}
                            onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="Observaciones..."
                            rows="2"
                          />
                        ) : (
                          <div className="text-gray-900 truncate max-w-[100px]">
                            {flete.observaciones || "Sin observaciones"}
                          </div>
                        )}
                      </td>

                      <td
                        className="px-3 py-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex space-x-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSaveEdit(flete.id);
                                }}
                                className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
                                title="Guardar cambios"
                                disabled={isLoading}
                              >
                                <Save className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                                title="Cancelar edición"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEdit(flete, e);
                                }}
                                className=" rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                title="Editar flete"
                              >
                                Editar Flete
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(flete);
                                }}
                                className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                                title="Ver detalles"
                              >
                                Detalles Flete
                              </button>
                              {/* Botón para ver gastos */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerGastos(flete);
                                }}
                                className="p-1 rounded text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                                title="Ver gastos asociados"
                              >
                                Gastos
                              </button>
                              {/* Botón para agregar gasto */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGastosAdicionales(flete);
                                }}
                                className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-100"
                                title="Agregar gasto adicional"
                              >
                                Agregar Gasto
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-3 py-8 text-center">
                    {isLoading ? (
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No se encontraron fletes
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {Object.values(filters).some((f) => f.trim() !== "")
                            ? "Intenta ajustar los filtros de búsqueda"
                            : "No hay fletes valorizados pendientes de facturación"}
                        </p>
                        {Object.values(filters).some(
                          (f) => f.trim() !== ""
                        ) && (
                            <Button onClick={clearFilters} size="small">
                              Limpiar filtros
                            </Button>
                          )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación y registros por página */}
      {fletes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <span className="text-sm text-gray-600">Mostrar</span>
            <select
              className="border border-gray-300 rounded px-3 py-1 text-sm"
              value={pagination.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">registros por página</span>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            startIndex={
              (pagination.currentPage - 1) * pagination.itemsPerPage + 1
            }
            endIndex={Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}
          />
        </div>
      )}

      {/* Modal de detalles del flete/servicio/gastos */}
      <Modal
        isOpen={showDetalleModal}
        onClose={handleCloseDetalleModal}
        title={
          modalMode === "flete"
            ? `Detalles del Flete - ${fleteSeleccionado?.codigo_flete || ""}`
            : `Gastos del Flete - ${fleteSeleccionado?.codigo_flete || ""}`
        }
        size={modalMode === 'gastos' ? 'large' : 'extra-large'}
      >
        {modalMode === "flete" && fleteSeleccionado ? (
          // Vista de detalles del flete con la estructura del otro componente
          <div className="space-y-6">
            {/* Botones de acción en la parte superior */}
            <div className="flex justify-end mb-4 space-x-2">
              <Button
                onClick={() => handleVerGastos(fleteSeleccionado)}
                variant="secondary"
                size="small"
                icon={Receipt}
                isLoading={loadingGastos}
              >
                Ver Gastos Asociados
              </Button>
              <Button
                onClick={() => handleGastosAdicionales(fleteSeleccionado)}
                variant="primary"
                size="small"
                icon={PlusCircle}
              >
                Agregar Gasto
              </Button>
            </div>

            {/* Información General del Flete */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Información del Flete
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Código Flete
                    </label>
                    <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado.codigo_flete}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Estado del Flete
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(fleteSeleccionado.estado_flete)}`}>
                      {fleteSeleccionado.estado_flete}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Monto Flete
                    </label>
                    <p className="text-sm font-semibold text-gray-900">
                      S/. {parseFloat(fleteSeleccionado.monto_flete || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha Creación
                    </label>
                    <p className="text-sm text-gray-900">{formatFechaHora(fleteSeleccionado.fecha_creacion)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha Actualización
                    </label>
                    <p className="text-sm text-gray-900">{formatFechaHora(fleteSeleccionado.fecha_actualizacion)}</p>
                  </div>
                  {fleteSeleccionado.fecha_pago && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha Pago
                      </label>
                      <p className="text-sm text-gray-900">{formatFecha(fleteSeleccionado.fecha_pago)}</p>
                    </div>
                  )}
                  {fleteSeleccionado.codigo_factura && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Factura Asociada</label>
                      <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado.codigo_factura}</p>
                    </div>
                  )}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Observaciones del Flete
                    </label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {fleteSeleccionado.observaciones || 'Sin observaciones'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de Gastos Adicionales */}
            {gastosFleteData && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Resumen de Gastos Adicionales
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Cantidad de Gastos</p>
                      <p className="font-semibold">{gastosFleteData.cantidad_gastos || 0}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Total Gastos</p>
                      <p className="font-semibold">
                        S/ {(gastosFleteData.total_gastos || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-gray-500">Recuperable Cliente</p>
                      <p className="font-semibold text-green-700">
                        S/ {(gastosFleteData.total_recuperable_cliente || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-gray-500">Costo Operativo</p>
                      <p className="font-semibold text-red-700">
                        S/ {(gastosFleteData.total_costo_operativo || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información del Servicio */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-green-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Información del Servicio
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información Básica del Servicio */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Información Básica</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Código Servicio</label>
                        <p className="text-sm font-semibold text-gray-900">
                          {fleteSeleccionado.servicio?.codigo_servicio_principal || fleteSeleccionado.codigo_servicio || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Estado Servicio</label>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEstadoServicioClass(fleteSeleccionado.servicio?.estado)}`}>
                          {fleteSeleccionado.servicio?.estado || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tipo Servicio</label>
                        <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.tipo_servicio || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Modalidad</label>
                        <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.modalidad_servicio || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Zona</label>
                        <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.zona || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Fecha Servicio</label>
                        <p className="text-sm text-gray-900">{formatFecha(fleteSeleccionado.servicio?.fecha_servicio)}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Fecha Salida</label>
                        <p className="text-sm text-gray-900">{formatFecha(fleteSeleccionado.servicio?.fecha_salida)}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hora de Cita</label>
                        <p className="text-sm text-gray-900">{formatHora(fleteSeleccionado.servicio?.hora_cita)}</p> 
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                        <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.descripcion || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detalles de Carga y Ruta */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Carga y Ruta</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Metros Cúbicos (m³)</label>
                        <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado.servicio?.m3 || '0'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Toneladas (TN)</label>
                        <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado.servicio?.tn || '0'}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Origen
                        </label>
                        <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                          <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.origen || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Destino
                        </label>
                        <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                          <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.destino || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del Cliente */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Cliente</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Nombre
                        </label>
                        <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado.servicio?.cliente?.nombre || 'N/A'}</p>
                        <p className="text-sm text-gray-900">Cuenta: {fleteSeleccionado.servicio?.cuenta?.nombre || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Razón Social</label>
                        <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.cliente?.razon_social || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">RUC</label>
                        <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.cliente?.ruc || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Documento</label>
                        <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.cliente?.numero_documento || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Información de la Cuenta */}
                    {fleteSeleccionado.servicio?.cuenta && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Dirección Origen</label>
                            <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.cuenta?.direccion_origen || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo Pago</label>
                            <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.cuenta?.tipo_pago || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre Conductor</label>
                            <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.cuenta?.nombre_conductor || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Información del Vehículo y Personal */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Vehículo y Personal</h4>
                    
                    {/* Información del Vehículo */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Vehículo</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Placa</label>
                          <p className="text-sm font-semibold text-gray-900">{fleteSeleccionado.servicio?.flota?.placa || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo Vehículo</label>
                          <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.flota?.tipo_vehiculo || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Capacidad (m³)</label>
                          <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.flota?.capacidad_m3 || '0'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Conductor Asignado</label>
                          <p className="text-sm text-gray-900">{fleteSeleccionado.servicio?.flota?.nombre_conductor || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Conductores */}
                    {fleteSeleccionado.servicio?.conductor && fleteSeleccionado.servicio.conductor.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Conductor(es)
                        </h5>
                        <div className="space-y-2">
                          {fleteSeleccionado.servicio.conductor.map((cond, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Nombre</label>
                                  <p className="text-sm text-gray-900">{cond.nombres_completos || cond.nombre || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Tipo</label>
                                  <p className="text-sm text-gray-900">{cond.tipo || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auxiliares */}
                    {fleteSeleccionado.servicio?.auxiliar && fleteSeleccionado.servicio.auxiliar.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Auxiliar(es)
                        </h5>
                        <div className="space-y-2">
                          {fleteSeleccionado.servicio.auxiliar.map((aux, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Nombre</label>
                                  <p className="text-sm text-gray-900">{aux.nombres_completos || aux.nombre || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500">Tipo</label>
                                  <p className="text-sm text-gray-900">{aux.tipo || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de cierre */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleCloseDetalleModal}
                variant="secondary"
                size="small"
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          // Vista de gastos del flete
          <div className="space-y-6">
            {/* Botón para volver al flete */}
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={() => setModalMode('flete')}
                variant="secondary"
                size="small"
                icon={ArrowLeft}
              >
                Volver al Flete
              </Button>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleGastosAdicionales(fleteSeleccionado)}
                  variant="primary"
                  size="small"
                  icon={PlusCircle}
                >
                  Agregar Gasto
                </Button>
              </div>
            </div>

            {/* Tabla de gastos */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">ID</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Fecha</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Tipo de Gasto</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Valor</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">¿Se Factura?</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado Facturación</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Estado Aprobación</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Observaciones</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingGastos ? (
                      <tr>
                        <td colSpan="9" className="py-4 text-center">
                          <div className="animate-pulse flex items-center justify-center">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </td>
                      </tr>
                    ) : gastosFlete.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-gray-500">
                          <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No hay gastos registrados para este flete</p>
                        </td>
                      </tr>
                    ) : (
                      gastosFlete.map((gasto) => (
                        <tr key={gasto.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2 px-3">{gasto.codigo_gasto}</td>
                          <td className="py-2 px-3">{formatFecha(gasto.fecha_gasto)}</td>
                          <td className="py-2 px-3 font-medium">{gasto.tipo_gasto}</td>
                          <td className="py-2 px-3 font-semibold">{formatMoneda(gasto.valor)}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              gasto.se_factura_cliente 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {gasto.se_factura_cliente ? 'SÍ' : 'NO'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getEstadoFacturacionClass(gasto.estado_facturacion)}`}>
                              {gasto.estado_facturacion}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getEstadoAprobacionClass(gasto.estado_aprobacion)}`}>
                              {gasto.estado_aprobacion}
                            </span>
                          </td>
                          <td className="py-2 px-3">{gasto.descripcion}</td>
                          <td className="py-2 px-3">
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => handleDeleteGastoClick(gasto, e)}
                                className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-100"
                                title="Eliminar gasto"
                                disabled={isDeletingGasto}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totales */}
            {gastosFlete.length > 0 && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">Resumen de Gastos</h4>
                    <p className="text-sm text-gray-600">{gastosFlete.length} gasto(s) registrado(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total de Gastos</p>
                    <p className="text-xl font-bold text-gray-900">
                      S/ {gastosFlete.reduce((sum, gasto) => sum + parseFloat(gasto.valor || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de cierre */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleCloseDetalleModal}
                variant="secondary"
                size="small"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para crear factura - FORMULARIO SIMPLIFICADO */}
      <Modal
        isOpen={showFacturaModal}
        onClose={handleCloseFacturaModal}
        title="Crear Factura"
        size="medium"
      >
        <div className="space-y-6">
          {/* Resumen de fletes seleccionados */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Fletes Seleccionados ({selectedFletes.length})
            </h4>
            <div className="max-h-40 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-left font-medium text-gray-700">
                      Código Flete
                    </th>
                    <th className="py-2 text-left font-medium text-gray-700">
                      Código Servicio
                    </th>
                    <th className="py-2 text-left font-medium text-gray-700">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFletes.map((id) => {
                    const flete = fletes.find((f) => f.id === id);
                    if (!flete) return null;

                    return (
                      <tr key={id} className="border-b border-gray-100">
                        <td className="py-2">{flete.codigo_flete}</td>
                        <td className="py-2">{flete.codigo_servicio}</td>
                        <td className="py-2">
                          S/. {parseFloat(flete.monto_flete || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-900">
                Total: S/. {totalMontoSeleccionado.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Formulario de factura simplificado */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Factura *
              </label>
              <input
                type="text"
                value={facturaForm.numero_factura}
                onChange={(e) => handleFacturaFormChange('numero_factura', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${formErrors.numero_factura ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Ej: F-20240001"
              />
              {formErrors.numero_factura && (
                <p className="mt-1 text-sm text-red-600">{formErrors.numero_factura}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Emisión *
                </label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={facturaForm.fecha_emision}
                    onChange={(e) => handleFacturaFormChange('fecha_emision', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${formErrors.fecha_emision ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                </div>
                {formErrors.fecha_emision && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.fecha_emision}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Vencimiento *
                </label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={facturaForm.fecha_vencimiento}
                    onChange={(e) => handleFacturaFormChange('fecha_vencimiento', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${formErrors.fecha_vencimiento ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                </div>
                {formErrors.fecha_vencimiento && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.fecha_vencimiento}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                value={facturaForm.moneda}
                onChange={(e) => handleFacturaFormChange('moneda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="PEN">Soles (PEN)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Total *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">
                  {facturaForm.moneda === 'PEN' ? 'S/' : '$'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={facturaForm.monto_total}
                  onChange={(e) => handleFacturaFormChange('monto_total', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${formErrors.monto_total ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="0.00"
                />
              </div>
              {formErrors.monto_total && (
                <p className="mt-1 text-sm text-red-600">{formErrors.monto_total}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Suma automática de fletes: {totalMontoSeleccionado.toFixed(2)} {facturaForm.moneda === 'PEN' ? 'S/' : '$'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={facturaForm.descripcion}
                onChange={(e) => handleFacturaFormChange('descripcion', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Descripción de la factura..."
              />
            </div>
          </div>

          {/* Botones del formulario */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleCloseFacturaModal}
              variant="secondary"
              disabled={isCreatingInvoice}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFactura}
              isLoading={isCreatingInvoice}
            >
              Crear Factura
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para agregar gasto adicional */}
      <Modal
  isOpen={showGastoModal}
  onClose={handleCloseGastoModal}
  title={`Agregar Gasto Adicional - ${fleteSeleccionado?.codigo_flete || ''}`}
  size="medium"
>
  <div className="space-y-4">
    <p className="text-sm text-gray-600 mb-4">
      Complete el formulario para registrar un gasto adicional al flete
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Fecha *
        </label>
        <input
          type="date"
          value={gastoForm.fecha}
          onChange={(e) => handleGastoFormChange('fecha', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          required
        />
        <p className="text-xs text-gray-500 mt-1">La fecha se establece automáticamente</p>
      </div>

      {/* Tipo de Gasto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Gasto *
        </label>
        <select
          value={gastoForm.tipo_gasto}
          onChange={(e) => handleGastoFormChange('tipo_gasto', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          required
        >
          <option value="">Seleccione un tipo</option>
          {tipoGastoOptions.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        
        {/* ↓ AGREGAR ESTE CAMPO DINÁMICO ↓ */}
        {gastoForm.tipo_gasto === 'Otros' && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especifique el tipo de gasto *
            </label>
            <input
              type="text"
              value={gastoForm.tipo_gasto_personalizado}
              onChange={(e) => handleGastoFormChange('tipo_gasto_personalizado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Escriba el tipo de gasto personalizado"
              required={gastoForm.tipo_gasto === 'Otros'}
            />
          </div>
        )}
      </div>

      {/* Valor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          Valor *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
          <input
            type="number"
            value={gastoForm.valor}
            onChange={(e) => handleGastoFormChange('valor', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      {/* ¿Se Factura? */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ¿Se Factura al Cliente? *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="se_factura"
              value={true}
              checked={gastoForm.se_factura === true}
              onChange={(e) => handleGastoFormChange('se_factura', e.target.value === 'true' ? true : e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">SÍ</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="se_factura"
              value={false}
              checked={gastoForm.se_factura === false}
              onChange={(e) => handleGastoFormChange('se_factura', e.target.value === 'false' ? false : e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">NO</span>
          </label>
        </div>
      </div>
    </div>

    {/* Observaciones */}
    <div className="col-span-1 md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Observaciones
      </label>
      <textarea
        value={gastoForm.observaciones}
        onChange={(e) => handleGastoFormChange('observaciones', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        placeholder="Observaciones adicionales..."
        rows="3"
      />
    </div>

    {/* Botones */}
    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <Button
        onClick={handleCloseGastoModal}
        variant="secondary"
        size="small"
      >
        Cancelar
      </Button>
      <Button
        onClick={handleSaveGasto}
        variant="primary"
        size="small"
        icon={Save}
      >
        Guardar Gasto
      </Button>
    </div>
  </div>
</Modal>

      {/* Modal de confirmación para eliminar gasto */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDeleteGasto}
        title="Confirmar Eliminación"
        size="small"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <p className="font-semibold">¿Está seguro de eliminar este gasto?</p>
          </div>
          
          {gastoToDelete && (
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="text-sm font-medium">Código: {gastoToDelete.codigo_gasto}</p>
              <p className="text-sm">Tipo: {gastoToDelete.tipo_gasto}</p>
              <p className="text-sm">Valor: {formatMoneda(gastoToDelete.valor)}</p>
              <p className="text-sm text-gray-600 mt-1">
                Fecha: {formatFecha(gastoToDelete.fecha_gasto)}
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            Esta acción no se puede deshacer. El gasto será eliminado permanentemente.
          </p>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={handleCancelDeleteGasto}
              variant="secondary"
              disabled={isDeletingGasto}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDeleteGasto}
              variant="danger"
              isLoading={isDeletingGasto}
            >
              Eliminar Gasto
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(FletesPorFacturar);