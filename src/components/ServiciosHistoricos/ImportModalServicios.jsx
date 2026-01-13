import React, { useState, useCallback } from 'react';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import { Upload, AlertCircle, X, FileSpreadsheet, CheckCircle, Info, FileText, AlertTriangle } from 'lucide-react';
import { serviciosHistoricosAPI } from '../../api/endpoints/serviciosHistoricos';

const ImportModalServicios = ({
  isOpen,
  onClose,
  onImportSuccess,
  ...props
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar extensión
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Por favor, selecciona un archivo Excel (.xlsx o .xls)');
        return;
      }

      // Validar tamaño (max 20MB - servicios pueden tener más datos)
      if (file.size > 20 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 20MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setImportResult(null);
    }
  };

  // Importar servicios
  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo primero.');
      return;
    }

    setIsLoading(true);
    setIsUploading(true);
    setError(null);

    try {
      // Usar tu función existente
      const result = await serviciosHistoricosAPI.importServiciosExcel(
        selectedFile, 
        "sistema"
      );
      
      console.log('Respuesta de API:', result);
      
      // Asegurar que todos los campos existan
      const formattedResult = {
        success: true,
        message: result.mensaje || `Archivo procesado exitosamente`,
        data: {
          total_registros: result.total_registros || 0,
          insertados: result.insertados || 0,
          errores: result.errores || 0,
          advertencias: result.advertencias || 0,
          tiempo_procesamiento: result.tiempo_procesamiento || 0,
          detalles_errores: result.detalles_errores || [],
          detalles_advertencias: result.detalles_advertencias || [],
          has_errors: (result.errores && result.errores > 0) || false
        }
      };
      
      setImportResult(formattedResult);
      setStep(2);
      setIsUploading(false);
      
      // Si no hay errores, cerrar modal después de 3 segundos
      if (!formattedResult.data.has_errors && formattedResult.data.errores === 0) {
        setTimeout(() => {
          onClose();
          if (onImportSuccess) onImportSuccess();
        }, 3000);
      }
    } catch (err) {
      console.error('Error al importar:', err);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        err.message || 
        'Error al importar el archivo. Verifica el formato y los datos.'
      );
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  }, [selectedFile, onClose, onImportSuccess]);

  // Reiniciar el proceso
  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError(null);
    setStep(1);
    setIsUploading(false);
    if (document.getElementById('file-input-servicios')) {
      document.getElementById('file-input-servicios').value = '';
    }
  };

  // Cerrar modal y reiniciar
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Formatear número con separadores
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Formatear tiempo de procesamiento
  const formatTiempoProcesamiento = (segundos) => {
    if (!segundos) return '0s';
    if (segundos < 60) {
      return `${segundos.toFixed(2)} segundos`;
    }
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = (segundos % 60).toFixed(2);
    return `${minutos}m ${segundosRestantes}s`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Servicios Históricos desde Excel"
      size="large"
      {...props}
    >
      <div className="space-y-6">
        {/* Paso 1: Seleccionar archivo */}
        {step === 1 && (
          <>
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800 mb-2">Instrucciones de importación:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <span className="font-medium">Formato Excel requerido:</span> .xlsx o .xls</li>
                    <li>• <span className="font-medium">Tamaño máximo:</span> 20MB</li>
                    <li>• <span className="font-medium">Columnas requeridas:</span></li>
                    <div className="ml-4 mt-1">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div>• Cuenta</div>
                        <div>• Cliente</div>
                        <div>• Mes</div>
                        <div>• Tipo Servicio</div>
                        <div>• Fecha Servicio</div>
                        <div>• Placa</div>
                        <div>• Conductor</div>
                        <div>• Estado Servicio</div>
                      </div>
                    </div>
                    <li>• <span className="font-medium">Formato de fecha:</span> DD/MM/YYYY o YYYY-MM-DD</li>
                    <li>• <span className="font-medium">Estados válidos:</span> PROGRAMADO, COMPLETADO, PENDIENTE_FACTURACION</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ejemplo de estructura */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-700 mb-2">Estructura del archivo:</h3>
                  <div className="text-xs text-gray-600 overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-2 py-1 text-left">Cuenta</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Cliente</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Mes</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Tipo Servicio</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Fecha Servicio</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Placa</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Conductor</th>
                          <th className="border border-gray-300 px-2 py-1 text-left">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-2 py-1">CUENTA001</td>
                          <td className="border border-gray-300 px-2 py-1">EMPRESA ABC</td>
                          <td className="border border-gray-300 px-2 py-1">Enero</td>
                          <td className="border border-gray-300 px-2 py-1">TRASLADO</td>
                          <td className="border border-gray-300 px-2 py-1">15/01/2024</td>
                          <td className="border border-gray-300 px-2 py-1">ABC-123</td>
                          <td className="border border-gray-300 px-2 py-1">JUAN PEREZ</td>
                          <td className="border border-gray-300 px-2 py-1">PROGRAMADO</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Subida de archivo */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-3" />
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sube tu archivo Excel de servicios:
                </label>
                <div className="flex flex-col items-center space-y-4">
                  <input
                    id="file-input-servicios"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('file-input-servicios').click()}
                    variant="secondary"
                    icon={Upload}
                    disabled={isLoading || isUploading}
                    className="w-full justify-center"
                  >
                    {selectedFile ? 'Cambiar Archivo' : 'Seleccionar Archivo Excel'}
                  </Button>
                  
                  {selectedFile && (
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="h-8 w-8 text-green-600" />
                          <div>
                            <div className="font-medium text-gray-700">{selectedFile.name}</div>
                            <div className="text-xs text-gray-500">
                              {(selectedFile.size / 1024).toFixed(0)} KB • {
                                selectedFile.name.split('.').pop().toUpperCase()
                              }
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleReset}
                          className="text-gray-400 hover:text-gray-600"
                          disabled={isLoading || isUploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 text-xs text-gray-500 text-center max-w-md">
                <p>La importación puede tomar algunos minutos dependiendo del tamaño del archivo.</p>
                <p className="mt-1">Se recomienda importar archivos con hasta 5,000 registros por lote.</p>
              </div>
            </div>
          </>
        )}

        {/* Paso 2: Mostrar resultados */}
        {step === 2 && importResult && (
          <div className="space-y-4">
            {/* Resumen principal */}
            <div className={`p-4 rounded-lg ${
              importResult.data?.errores > 0 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-start">
                {importResult.data?.errores > 0 ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-medium mb-1 ${
                    importResult.data?.errores > 0 ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                    {importResult.message}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p className={importResult.data?.errores > 0 ? 'text-yellow-700' : 'text-green-700'}>
                      Tiempo de procesamiento: {formatTiempoProcesamiento(importResult.data?.tiempo_procesamiento)}
                    </p>
                    {importResult.data?.errores > 0 && (
                      <p className="text-yellow-700">
                        Se encontraron {importResult.data.errores} error(es) que requieren atención.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas detalladas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(importResult.data?.total_registros || 0)}
                </div>
                <div className="text-xs text-gray-600">Total Registros</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatNumber(importResult.data?.insertados || 0)}
                </div>
                <div className="text-xs text-gray-600">Insertados</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-600">
                  {formatNumber(importResult.data?.errores || 0)}
                </div>
                <div className="text-xs text-gray-600">Errores</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {formatNumber(importResult.data?.advertencias || 0)}
                </div>
                <div className="text-xs text-gray-600">Advertencias</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">
                  {formatTiempoProcesamiento(importResult.data?.tiempo_procesamiento || 0)}
                </div>
                <div className="text-xs text-gray-600">Tiempo</div>
              </div>
            </div>

            {/* Mensaje de éxito sin errores */}
            {importResult.data?.errores === 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium">¡Importación completada exitosamente!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Todos los servicios han sido importados correctamente. 
                      {importResult.data?.advertencias > 0 ? 
                        ` Se encontraron ${importResult.data.advertencias} advertencias.` : 
                        ' Sin errores ni advertencias.'
                      }
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      El modal se cerrará automáticamente en unos segundos...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detalles de errores - CORREGIDO */}
            {Array.isArray(importResult.data?.detalles_errores) && importResult.data.detalles_errores.length > 0 && (
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-red-700 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Errores críticos ({importResult.data.detalles_errores.length})
                    </h4>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                      Requieren atención
                    </span>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <ul className="divide-y divide-red-100">
                    {importResult.data.detalles_errores.map((error, index) => (
                      <li key={index} className="px-4 py-3 hover:bg-red-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                              {error.fila}
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="text-sm text-gray-800">
                              <span className="font-medium">{error.mensaje}</span>
                              {error.campo && (
                                <span className="text-gray-600 ml-2">(Campo: {error.campo})</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Fila {error.fila} • Tipo: {error.tipo || "ERROR"}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Detalles de advertencias - CORREGIDO */}
            {Array.isArray(importResult.data?.detalles_advertencias) && importResult.data.detalles_advertencias.length > 0 && (
              <div className="border border-yellow-200 rounded-lg overflow-hidden">
                <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-yellow-700 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Advertencias ({importResult.data.detalles_advertencias.length})
                    </h4>
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                      Revisión recomendada
                    </span>
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="divide-y divide-yellow-100">
                    {importResult.data.detalles_advertencias.map((warning, index) => (
                      <li key={index} className="px-4 py-3 hover:bg-yellow-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-6 h-6 flex items-center justify-center bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              {warning.fila}
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="text-sm text-gray-800">
                              <span className="font-medium">{warning.mensaje}</span>
                              {warning.campo && (
                                <span className="text-gray-600 ml-2">(Campo: {warning.campo})</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Fila {warning.fila} • Tipo: {warning.tipo || "ADVERTENCIA"}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Resumen final */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Resumen de la importación:</p>
                <ul className="space-y-1">
                  <li>• <span className="font-medium">{formatNumber(importResult.data?.insertados || 0)} servicios</span> insertados correctamente</li>
                  {importResult.data?.errores > 0 && (
                    <li>• <span className="font-medium text-red-600">{formatNumber(importResult.data.errores)} errores</span> encontrados que impidieron la inserción</li>
                  )}
                  {importResult.data?.advertencias > 0 && (
                    <li>• <span className="font-medium text-yellow-600">{formatNumber(importResult.data.advertencias)} advertencias</span> detectadas durante el proceso</li>
                  )}
                  <li>• Tiempo total de procesamiento: <span className="font-medium">{formatTiempoProcesamiento(importResult.data?.tiempo_procesamiento || 0)}</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error general */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-1">Error en la importación</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading || isUploading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                isLoading={isLoading}
                disabled={!selectedFile || isLoading || isUploading}
                icon={Upload}
              >
                {isLoading ? 'Procesando...' : 'Importar Servicios'}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={isLoading}
              >
                Importar Otro Archivo
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
              >
                {importResult?.data?.errores > 0 ? 'Cerrar y revisar' : 'Listo'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ImportModalServicios);