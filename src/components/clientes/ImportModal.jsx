import React, { useState, useCallback } from 'react';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import { Upload, Download, AlertCircle, X, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { clienteAPI } from '../../api/endpoints/clientes';

const ImportModal = ({
  isOpen,
  onClose,
  onImportSuccess, // Callback opcional después de importación exitosa
  ...props
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Seleccionar archivo, 2: Ver resultado

  // Descargar plantilla Excel
  const handleDownloadTemplate = useCallback(async () => {
    try {
      const blob = await clienteAPI.downloadPlantillaExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_clientes.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al descargar la plantilla: ' + err.message);
    }
  }, []);

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

      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setImportResult(null);
    }
  };

  // Importar clientes
  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo Excel primero.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await clienteAPI.importClientesExcel(selectedFile);
      setImportResult(result);
      setStep(2); // Mostrar resultados
      
      // Si no hay errores, cerrar modal después de 3 segundos
      if (!result.result?.has_errors && result.result?.success_rate === "100.0%") {
        setTimeout(() => {
          onClose();
          if (onImportSuccess) onImportSuccess();
        }, 3000);
      }
    } catch (err) {
      console.error('Error al importar:', err);
      setError(err.response?.data?.message || 'Error al importar el archivo. Verifica el formato.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, onClose, onImportSuccess]);

  // Reiniciar el proceso
  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError(null);
    setStep(1);
    if (document.getElementById('file-input')) {
      document.getElementById('file-input').value = '';
    }
  };

  // Cerrar modal y reiniciar
  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Clientes desde Excel"
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
                <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">Instrucciones de importación:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Descarga la plantilla para ver el formato requerido</li>
                    <li>• Mantén los nombres de las columnas iguales a la plantilla</li>
                    <li>• Solo se aceptan archivos Excel (.xlsx, .xls)</li>
                    <li>• Tamaño máximo: 10MB</li>
                    <li>• Las columnas obligatorias son: RUC/Razón Social</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Descargar plantilla */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-4 text-center">
                Descarga la plantilla de Excel para asegurar el formato correcto
              </p>
              <Button
                onClick={handleDownloadTemplate}
                variant="secondary"
                icon={Download}
                className="mb-6"
              >
                Descargar Plantilla Excel
              </Button>

              {/* Subida de archivo */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona tu archivo Excel:
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('file-input').click()}
                    variant="secondary"
                    icon={Upload}
                    disabled={isLoading}
                  >
                    Seleccionar Archivo Excel
                  </Button>
                  
                  {selectedFile && (
                    <div className="flex items-center space-x-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">{selectedFile.name}</span>
                        <span className="text-gray-500 ml-2">
                          ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        onClick={handleReset}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Paso 2: Mostrar resultados */}
        {step === 2 && importResult && (
          <div className="space-y-4">
            {/* Resumen principal */}
            <div className={`p-4 rounded-lg ${
              importResult.result?.has_errors 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-start">
                {importResult.result?.has_errors ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-medium mb-1 ${
                    importResult.result?.has_errors ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                    {importResult.message}
                  </h3>
                  <p className={`text-sm ${
                    importResult.result?.has_errors ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    Tasa de éxito: {importResult.result?.success_rate}
                  </p>
                </div>
              </div>
            </div>

            {/* Estadísticas detalladas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{importResult.result?.total_rows || 0}</div>
                <div className="text-xs text-gray-600">Total filas</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{importResult.result?.created || 0}</div>
                <div className="text-xs text-gray-600">Creados</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{importResult.result?.updated || 0}</div>
                <div className="text-xs text-gray-600">Actualizados</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-600">{importResult.result?.skipped || 0}</div>
                <div className="text-xs text-gray-600">Omitidos</div>
              </div>
            </div>

            {/* Errores detallados */}
            {importResult.result?.errors && importResult.result.errors.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-700">Errores encontrados:</h4>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {importResult.result.errors.map((errorMsg, index) => (
                      <li key={index} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{errorMsg}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Mensaje de éxito completo */}
            {!importResult.result?.has_errors && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-green-800 font-medium">¡Importación completada exitosamente!</p>
                    <p className="text-sm text-green-700 mt-1">
                      El modal se cerrará automáticamente en unos segundos...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 mb-1">Error</h3>
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
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                isLoading={isLoading}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? 'Importando...' : 'Importar Archivo'}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
              >
                Importar Otro Archivo
              </Button>
              <div className="flex space-x-3">
                {importResult?.result?.has_errors && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleDownloadTemplate()}
                    icon={Download}
                  >
                    Descargar Plantilla
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleClose}
                >
                  {importResult?.result?.has_errors ? 'Cerrar' : 'Listo'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ImportModal);