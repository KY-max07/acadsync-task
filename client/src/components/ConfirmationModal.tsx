import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-black rounded w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 p-6 transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="bg-red-50 text-red-500 p-2 rounded-full">
                <AlertTriangle size={24} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
