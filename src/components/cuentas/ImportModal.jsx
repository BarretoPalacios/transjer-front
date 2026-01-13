import React, { useState } from 'react';
import { Upload, Download, X, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';

const ImportModal = ({
  isOpen,
  onClose,
  onImport,
  onDownloadTemplate,
  importErrors = [],
  setImportErrors,
  isLoading = false,
}) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.match(/\.(xlsx|xls)$/)) {
        setFile(droppedFile);
        setImportErrors([]);
      } else {
        setImportErrors(['Solo se permiten archivos Excel (.xlsx, .xls)']);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setFile(selectedFile);
        setImportErrors([]);
      } else {
        setImportErrors(['Solo se permiten archivos Excel (.xlsx, .xls)']);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setImportErrors(['Por favor seleccione un archivo']);
      return;
    }
    await onImport(file);
  };

  const handleClose = () => {
    setFile(null);
    setImportErrors([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Cuentas desde Excel"
      size="medium"
    >
      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Instrucciones:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Descargue la plantilla para ver el formato requerido</li>
            <li>• Las columnas requeridas son: Código, Nombre, RUC, Dirección, Teléfono</li>
            <li>• Asegúrese de que los datos estén en la primera hoja</li>
            <li>• Los códigos de cuenta deben ser únicos</li>
          </ul>
        </div>

        {/* Errores */}
        {importErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Errores encontrados:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {importErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Área de arrastrar y soltar */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className={`h-12 w-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          {file ? (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cambiar archivo
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">
                Arrastre y suelte su archivo Excel aquí
              </p>
              <p className="text-xs text-gray-500 mb-4">o</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Seleccionar archivo
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formatos soportados: .xlsx, .xls
              </p>
            </>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex space-x-3">
            <Button
              onClick={onDownloadTemplate}
              variant="secondary"
              icon={Download}
            >
              Descargar Plantilla
            </Button>
            <Button
              onClick={handleClose}
              variant="secondary"
              icon={X}
            >
              Cancelar
            </Button>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!file || isLoading}
            isLoading={isLoading}
            icon={Upload}
          >
            Importar Cuentas
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal;