import React from 'react';
import { Modal } from 'antd';

interface StatusConfirmationModalProps {
  visible: boolean;
  type: 'ativar' | 'desativar' | null;
  clienteName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const StatusConfirmationModal: React.FC<StatusConfirmationModalProps> = ({
  visible,
  type,
  clienteName,
  onConfirm,
  onCancel,
  isLoading
}) => {
  const isAtivar = type === 'ativar';
  const color = isAtivar ? '#52c41a' : '#f5222d';

  return (
    <Modal
      title={<span style={{ color }}>{isAtivar ? 'Ativar Cliente' : 'Desativar Cliente'}</span>}
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={isLoading}
      okText={isAtivar ? 'Confirmar Ativação' : 'Confirmar Desativação'}
      cancelText="Cancelar"
      okButtonProps={{ 
        style: { backgroundColor: color, borderColor: color } 
      }}
      centered
    >
      <div className="py-4">
        <p className="text-lg mb-2">
          Deseja {isAtivar ? 'ativar' : 'desativar'} o cliente <strong>{clienteName}</strong>?
        </p>
        
        {isAtivar ? (
          <p className="text-gray-600">
            O cliente voltará a aparecer nas listas e poderá ser selecionado para novas operações.
          </p>
        ) : (
          <div className="space-y-2 text-gray-600">
            <p>⚠️ Esta ação irá:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Marcar o cliente como inativo</li>
              <li>Remover das listas de clientes ativos (por padrão)</li>
              <li>Impedir novas vendas para este cliente</li>
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};