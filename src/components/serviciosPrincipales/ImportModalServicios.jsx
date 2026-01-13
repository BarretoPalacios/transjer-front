import React, { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';

const ImportModalServicios = ({
  isOpen,
  onClose,
  onImport,
  onDownloadTemplate,
  importErrors,
  setImportErrors,
  isLoading
}) => {
  const [file, setFile] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (validExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setImportErrors([]);
        setImportResult(null);
      } else {
        setImportErrors(['Formato de archivo no válido. Use .xlsx, .xls o .csv']);
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setImportErrors(['Seleccione un archivo para importar']);
      return;
    }

    const result = await onImport(file);
    if (result.success) {
      setImportResult({
        success: true,
        message: `Importación exitosa: ${result.count} servicios importados`,
        count: result.count
      });
      setFile(null);
    } else {
      setImportResult({
        success: false,
        message: 'Error en la importación'
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportErrors([]);
    setImportResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Servicios"
      size="medium"
    >
      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instrucciones de importación:</h3>
          <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
            <li>Descargue la plantilla de ejemplo para conocer el formato requerido</li>
            <li>El archivo debe estar en formato Excel (.xlsx, .xls) o CSV</li>
            <li>Los campos marcados con * son obligatorios</li>
            <li>Verifique que los datos estén correctamente formateados</li>
          </ul>
        </div>

        {/* Plantilla */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Descargar Plantilla</h3>
            <Button
              onClick={onDownloadTemplate}
              variant="secondary"
              icon={Download}
              size="small"
            >
              Descargar Plantilla
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            La plantilla incluye ejemplos de cómo deben estructurarse los datos.
          </p>
        </div>

        {/* Subir archivo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir Archivo</h3>
          
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra y suelta tu archivo aquí, o haz clic para seleccionarlo
              </p>
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload">
                <Button
                  as="span"
                  variant="secondary"
                  className="cursor-pointer"
                >
                  Seleccionar Archivo
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formatos aceptados: .xlsx, .xls, .csv
              </p>
            </div>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">{file.name}</p>
                    <p className="text-xs text-green-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setFile(null)}
                  variant="ghost"
                  size="small"
                  className="text-red-600 hover:text-red-700"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Errores */}
        {importErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h4 className="text-sm font-medium text-red-800">Errores encontrados:</h4>
            </div>
            <ul className="text-sm text-red-700 list-disc pl-5">
              {importErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Resultado de importación */}
        {importResult && (
          <div className={`border rounded-lg p-4 ${
            importResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.message}
                </p>
                {importResult.success && importResult.count && (
                  <p className="text-sm text-green-700 mt-1">
                    Se importaron {importResult.count} servicios correctamente.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleClose}
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isLoading}
            isLoading={isLoading}
          >
            Importar Servicios
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportModalServicios;