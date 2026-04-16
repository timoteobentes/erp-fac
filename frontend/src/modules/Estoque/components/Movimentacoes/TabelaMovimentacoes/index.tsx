/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Table, Tag } from "antd";
import type { TablePaginationConfig } from "antd";

export interface MovimentacaoEstoque {
  id: number;
  produto_id: number;
  produto_nome: string;
  codigo_interno?: string;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  saldo_apos: number;
  origem: string;
  observacao?: string;
  usuario_id: number;
  criado_em: string;
}

interface TabelaMovimentacoesProps {
  movimentacoes: MovimentacaoEstoque[];
  isLoading: boolean;
  pagination?: TablePaginationConfig;
}

export const TabelaMovimentacoes: React.FC<TabelaMovimentacoesProps> = ({
  movimentacoes,
  isLoading,
  pagination
}) => {
  const getQuantidadeSinal = (tipo: string, qtd: number) => {
    if (tipo === 'entrada') return <span className="text-green-600 font-bold">+{qtd}</span>;
    if (tipo === 'saida') return <span className="text-red-500 font-bold">-{qtd}</span>;
    return <span className="text-blue-600 font-bold">{qtd}</span>;
  };

  const columns = [
    {
      title: 'Data / Hora',
      dataIndex: 'criado_em',
      key: 'criado_em',
      width: 160,
      render: (text: string) => {
          const date = new Date(text);
          return date.toLocaleString('pt-BR');
      }
    },
    {
      title: 'Produto',
      dataIndex: 'produto_nome',
      key: 'produto_nome',
      width: 300,
      render: (text: string, record: any) => (
        <div>
           <div className="font-bold text-gray-800">{text}</div>
           <div className="text-xs text-gray-500">{record.codigo_interno || '-'}</div>
        </div>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      align: 'center' as const,
      width: 120,
      render: (tipo: string) => {
        let color = 'default';
        let text = tipo;
        if (tipo === 'entrada') color = 'success';
        if (tipo === 'saida') color = 'error';
        if (tipo === 'ajuste') color = 'processing';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Qtd.',
      dataIndex: 'quantidade',
      key: 'quantidade',
      align: 'right' as const,
      render: (val: number, record: any) => getQuantidadeSinal(record.tipo, val)
    },
    {
      title: 'Saldo Pós',
      dataIndex: 'saldo_apos',
      key: 'saldo_apos',
      align: 'right' as const,
      render: (val: number) => <span className="font-semibold">{val}</span>
    },
    {
      title: 'Origem / Obs',
      dataIndex: 'origem',
      key: 'origem',
      width: 250,
      render: (text: string, record: any) => (
        <div>
           <span className="font-semibold text-gray-700 bg-gray-100 px-1 rounded">{text}</span>
           {record.observacao && (
             <div className="text-xs truncate max-w-[220px] mt-1 text-gray-500" title={record.observacao}>
               {record.observacao}
             </div>
           )}
        </div>
      )
    }
  ];

  return (
    <>
      <div className="text-[#3C0473] font-normal text-sm mb-4">
        {movimentacoes.length > 0 ? `Mostrando ${movimentacoes.length} movimentações no Histórico (Últimos 100)` : 'Nenhuma movimentação registrada.'}
      </div>
      <Table 
        dataSource={movimentacoes} 
        columns={columns} 
        rowKey="id"
        loading={isLoading}
        pagination={pagination ? { ...pagination, align: 'center' } : { pageSize: 12, align: 'center' }}
        scroll={{ x: 1000 }}
        size="middle"
      />
    </>
  );
};
