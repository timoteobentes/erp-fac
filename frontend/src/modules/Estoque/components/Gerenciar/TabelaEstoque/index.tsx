/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Table } from "antd";
import { IconButton, Tooltip } from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline, Edit } from "@mui/icons-material";
import type { TablePaginationConfig } from "antd";

export interface ProdutoEstoque {
  id: number;
  nome: string;
  codigo_interno: string;
  codigo_barras: string;
  estoque_atual: string | number;
  movimenta_estoque: boolean;
}

interface TabelaEstoqueProps {
  produtos: ProdutoEstoque[];
  isLoading: boolean;
  pagination?: TablePaginationConfig;
  onMovimentar: (produto: ProdutoEstoque, tipo: 'entrada' | 'saida' | 'ajuste') => void;
}

export const TabelaEstoque: React.FC<TabelaEstoqueProps> = ({
  produtos,
  isLoading,
  pagination,
  onMovimentar
}) => {
  const columns = [
    {
      title: 'Código',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Produto',
      dataIndex: 'nome',
      key: 'nome',
      width: 350,
      render: (text: string, record: any) => (
        <div>
           <div className="font-bold text-gray-800">{text}</div>
           {!record.movimenta_estoque && (
             <div className="text-xs text-red-500 bg-red-50 inline-block px-1 rounded border border-red-100 mt-1">
               Bloqueado / Não movimenta
             </div>
           )}
        </div>
      )
    },
    {
      title: 'SKU / Barras',
      dataIndex: 'codigo_interno',
      key: 'codigo_interno',
      render: (text: string, record: any) => text || record.codigo_barras || '-'
    },
    {
      title: 'Estoque Atual',
      dataIndex: 'estoque_atual',
      key: 'estoque_atual',
      render: (val: number | string) => {
         const saldo = Number(val || 0);
         const color = saldo > 0 ? "text-green-700 font-bold" : "text-red-600 font-bold";
         return <span className={`text-base ${color}`}>{saldo.toFixed(2).replace('.', ',')}</span>
      }
    },
    {
      title: 'Operações de Saldo',
      key: 'acoes',
      width: 280,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: ProdutoEstoque) => (
        <div className="flex justify-center gap-2">
          <Tooltip title="Entrada de Estoque">
            <span>
              <IconButton 
                color="success"
                disabled={!record.movimenta_estoque}
                onClick={() => onMovimentar(record, 'entrada')} 
              >
                <AddCircleOutline />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Saída de Estoque">
            <span>
              <IconButton 
                color="error"
                disabled={!record.movimenta_estoque}
                onClick={() => onMovimentar(record, 'saida')} 
              >
                <RemoveCircleOutline />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Ajuste de Estoque">
            <span>
              <IconButton 
                color="warning"
                disabled={!record.movimenta_estoque}
                onClick={() => onMovimentar(record, 'ajuste')} 
              >
                <Edit />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="text-[#3C0473] font-normal text-sm mb-4">
        {produtos.length > 0 ? `Mostrando ${produtos.length} produtos` : 'Nenhum produto cadastrado no sistema.'}
      </div>
      <Table 
        dataSource={produtos} 
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
