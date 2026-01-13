import React, { useState, useCallback } from 'react';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import { Upload, Download, AlertCircle, FileUp, X } from 'lucide-react';

const ImportModal = ({
  isOpen,
  onClose,
  onImport,
  onDownloadTemplate,
  importErrors = [],
  setImportErrors,
  isLoading = false,
  ...props
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    setImportErrors([]);
    
    // Validar extensión del archivo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setImportErrors(['Formato de archivo no válido. Solo se permiten archivos .xlsx, .xls o .csv']);
      setSelectedFile(null);
      return;
    }

    // Validar tamaño del archivo (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImportErrors(['El archivo es demasiado grande. El tamaño máximo permitido es 10MB']);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleImport = useCallback(() => {
    if (!selectedFile) {
      setImportErrors(['Por favor, selecciona un archivo para importar']);
      return;
    }
    
    onImport(selectedFile);
  }, [selectedFile, onImport, setImportErrors]);

  const handleCancel = () => {
    setSelectedFile(null);
    setImportErrors([]);
    onClose();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setImportErrors([]);
    if (document.getElementById('file-input')) {
      document.getElementById('file-input').value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Importar Lugares desde Excel"
      size="medium"
      {...props}
    >
      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Instrucciones de importación:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Descarga la plantilla para asegurar el formato correcto</li>
            <li>• Completa la plantilla con los datos de los lugares</li>
            <li>• Guarda el archivo en formato Excel (.xlsx o .xls) o CSV</li>
            <li>• Arrastra el archivo o haz clic para seleccionarlo</li>
          </ul>
        </div>

        {/* Botón para descargar plantilla */}
        <div className="text-center">
          <Button
            onClick={onDownloadTemplate}
            variant="secondary"
            icon={Download}
          >
            Descargar Plantilla Excel
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            La plantilla incluye las columnas necesarias y ejemplos de formato
          </p>
        </div>

        {/* Área de carga de archivos */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <FileUp className="h-12 w-12 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.name.split('.').pop().toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Haz clic para cambiar de archivo o arrastra otro aquí
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Arrastra tu archivo aquí
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  o haz clic para seleccionar un archivo
                </p>
                <p className="text-xs text-gray-400">
                  Formatos soportados: .xlsx, .xls, .csv (máx. 10MB)
                </p>
              </div>
            </>
          )}
        </div>

        {/* Errores */}
        {importErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Errores encontrados ({importErrors.length})
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {importErrors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            isLoading={isLoading}
            disabled={isLoading || !selectedFile}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Archivo
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ImportModal);