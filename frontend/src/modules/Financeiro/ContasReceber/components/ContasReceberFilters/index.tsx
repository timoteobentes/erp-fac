import React from 'react';
import { Button, DatePicker, Select, Typography } from 'antd';
import { SearchOutlined, ClearOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface ContasReceberFiltersProps {
  filtros: any;
  setFiltros: React.Dispatch<React.SetStateAction<any>>;
  onBuscar: () => void;
  onLimpar: () => void;
}

export const ContasReceberFilters: React.FC<ContasReceberFiltersProps> = ({
  filtros,
  setFiltros,
  onBuscar,
  onLimpar
}) => {
  const handleDateChange = (field: 'data_vencimento_inicio' | 'data_vencimento_fim', date: dayjs.Dayjs | null) => {
    setFiltros((prev: any) => ({ ...prev, [field]: date ? date.format('YYYY-MM-DD') : '' }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2 text-[#475569]">
        <FilterOutlined />
        <Typography.Text className="uppercase tracking-wider text-xs font-semibold text-[#475569]">
          Filtros Avancados
        </Typography.Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          placeholder="Status da cobranca"
          value={filtros.status || undefined}
          onChange={(value) => setFiltros((prev: any) => ({ ...prev, status: value || '' }))}
          allowClear
          style={{ width: '100%', height: 40 }}
          options={[
            { value: 'pendente', label: 'Pendente' },
            { value: 'recebido', label: 'Recebido' },
            { value: 'atrasado', label: 'Em atraso' },
            { value: 'cancelado', label: 'Cancelado' },
          ]}
        />

        <DatePicker
          placeholder="Vencimento Inicio"
          format="DD/MM/YYYY"
          value={filtros.data_vencimento_inicio ? dayjs(filtros.data_vencimento_inicio) : null}
          onChange={(date) => handleDateChange('data_vencimento_inicio', date)}
          style={{ width: '100%', height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
        />

        <DatePicker
          placeholder="Vencimento Fim"
          format="DD/MM/YYYY"
          value={filtros.data_vencimento_fim ? dayjs(filtros.data_vencimento_fim) : null}
          onChange={(date) => handleDateChange('data_vencimento_fim', date)}
          style={{ width: '100%', height: 40, borderRadius: 8, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
      </div>

      <div className="mt-2 flex gap-3 justify-end border-t border-[#F1F5F9] pt-4">
        <Button
          icon={<ClearOutlined />}
          onClick={onLimpar}
          style={{ height: 40, borderRadius: 8, fontWeight: 600, color: '#64748B', borderColor: '#E2E8F0' }}
        >
          Limpar Filtros
        </Button>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={onBuscar}
          style={{ height: 40, borderRadius: 8, fontWeight: 600, background: '#5B21B6', borderColor: '#5B21B6' }}
        >
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};
