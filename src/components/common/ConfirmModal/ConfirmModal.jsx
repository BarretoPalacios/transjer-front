import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
  ...props
}) => {
  const variantIcons = {
    danger: AlertCircle,
    warning: AlertCircle,
    success: CheckCircle,
    info: AlertCircle,
  };

  const variantColors = {
    danger: 'text-red-600 bg-red-100',
    warning: 'text-yellow-600 bg-yellow-100',
    success: 'text-green-600 bg-green-100',
    info: 'text-blue-600 bg-blue-100',
  };

  const Icon = variantIcons[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      {...props}
    >
      <div className="text-center">
        <div className={`flex items-center justify-center w-12 h-12 ${variantColors[variant]} rounded-full mx-auto mb-4`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex justify-center space-x-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={variant === 'success' ? 'success' : 'danger'}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ConfirmModal);