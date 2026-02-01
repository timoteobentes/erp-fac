/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface StatusConfirmationModalProps {
  // Controle de Estado
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;

  // Conteúdo Personalizável
  title: string;
  description: React.ReactNode; // Permite string ou JSX (negrito, quebra de linha)
  
  // Botão de Confirmação
  confirmText?: string;
  confirmColor?: 'primary' | 'danger' | 'success' | 'warning'; // Mapeamento interno de cores
  cancelText?: string;
}

export const StatusConfirmationModal: React.FC<StatusConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmText = "Confirmar",
  confirmColor = 'primary',
  cancelText = "Cancelar"
}) => {
  
  // Define a cor do botão baseado na prop
  const getButtonProps = () => {
    switch (confirmColor) {
      case 'danger':
      case 'error' as any: // Compatibilidade com Material UI names se passar errado
        return { danger: true, type: 'primary' as const };
      case 'success':
        return { style: { backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' } };
      case 'warning':
        return { style: { backgroundColor: '#faad14', borderColor: '#faad14', color: '#fff' } };
      default: // primary
        return { type: 'primary' as const };
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-yellow-500" />
          <span>{title}</span>
        </div>
      }
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>,
        <Button
          key="submit"
          loading={isLoading}
          onClick={onConfirm}
          {...getButtonProps()}
        >
          {confirmText}
        </Button>,
      ]}
      centered
      width={450}
    >
      <div className="py-4 text-gray-600 text-base leading-relaxed">
        {description}
      </div>
    </Modal>
  );
};