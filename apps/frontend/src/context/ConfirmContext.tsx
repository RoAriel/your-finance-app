/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ConfirmVariant } from '../components/common/ConfirmationModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  onConfirm: () => Promise<void> | void; // Soporta funciones asíncronas
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const confirm = (newOptions: ConfirmOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await options.onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error en confirmación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {/* El Modal vive aquí, siempre disponible */}
      <ConfirmationModal
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onClose={handleClose}
        isLoading={isLoading}
      />
    </ConfirmContext.Provider>
  );
};

// Hook personalizado para usarlo fácil
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm debe usarse dentro de un ConfirmProvider');
  }
  return context;
};
