/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { ConfigProvider, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  RiseOutlined
} from "@ant-design/icons";
import Layout from "../../../template/Layout";
import { useContasReceber } from "../../../modules/Financeiro/ContasReceber/hooks/useContasReceber";
import { ContasReceberActions } from "../../../modules/Financeiro/ContasReceber/components/ContasReceberActions";
import { ContasReceberFilters } from "../../../modules/Financeiro/ContasReceber/components/ContasReceberFilters";
import { TabelaContasReceber } from "../../../modules/Financeiro/ContasReceber/components/TabelaContasReceber";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const ContasReceber: React.FC = () => {
  const navigate = useNavigate();
  const { contas, loading, carregarContas, baixarConta, excluirConta, exportarContas } = useContasReceber();
  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<any>({});
  const [termoBusca, setTermoBusca] = useState('');
  const [pagination] = useState({ pageSize: 12 });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLimparFiltros = () => {
    setFiltros({});
  };

  const contasFiltradas = useMemo(() => {
    let result = [...(contas || [])];

    if (termoBusca) {
      result = result.filter(c => c.descricao?.toLowerCase().includes(termoBusca.toLowerCase()));
    }

    if (filtros.status) {
      result = result.filter(c => c.status === filtros.status);
    }
    if (filtros.data_vencimento_inicio) {
      result = result.filter(c => new Date(c.data_vencimento) >= new Date(filtros.data_vencimento_inicio));
    }
    if (filtros.data_vencimento_fim) {
      result = result.filter(c => new Date(c.data_vencimento) <= new Date(filtros.data_vencimento_fim));
    }

    return result;
  }, [contas, termoBusca, filtros]);

  const resumo = useMemo(() => {
    let aVencer = 0;
    let venceHoje = 0;
    let vencidos = 0;
    let recebidos = 0;
    let total = 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    (contas || []).forEach(c => {
      const valor = Number(c.valor_total) || 0;
      if (c.status === 'recebido') {
        recebidos += valor;
        return;
      }
      if (c.status === 'cancelado') return;

      const dataVenc = new Date(c.data_vencimento);
      dataVenc.setHours(0, 0, 0, 0);

      if (dataVenc < hoje) vencidos += valor;
      else if (dataVenc.getTime() === hoje.getTime()) venceHoje += valor;
      else aVencer += valor;

      total += valor;
    });

    return { aVencer, venceHoje, vencidos, recebidos, total };
  }, [contas]);

  if (loading && (!contas || contas.length === 0)) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-140px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F1F5F9] border-t-[#5B21B6]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`transition-all duration-500 ease-in-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} pb-8`}>
        <div className="flex flex-col mb-8">
          <Typography.Title level={1} style={{ margin: 0, color: '#0F172A', fontWeight: 800, letterSpacing: 0 }}>
            Contas a Receber
          </Typography.Title>
          <Typography.Text style={{ color: '#64748B' }}>
            Acompanhe o fluxo de receitas, verifique recebimentos de clientes e controle a inadimplencia.
          </Typography.Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-[#F1F5F9] rounded-lg text-[#64748B]"><RiseOutlined /></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">A Vencer</span>
            <strong className="text-xl text-[#0F172A]">{formatCurrency(resumo.aVencer)}</strong>
          </div>

          <div className="bg-white rounded-2xl border border-[#FDE68A] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-[#FFFBEB] rounded-lg text-[#F59E0B]"><WarningOutlined /></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706] mb-1">Vence Hoje</span>
            <strong className="text-xl text-[#B45309]">{formatCurrency(resumo.venceHoje)}</strong>
          </div>

          <div className="bg-[#FEF2F2] rounded-2xl border border-[#FECACA] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-white rounded-lg text-[#EF4444] shadow-sm"><ExclamationCircleOutlined /></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626] mb-1">Vencidos</span>
            <strong className="text-xl text-[#991B1B]">{formatCurrency(resumo.vencidos)}</strong>
          </div>

          <div className="bg-white rounded-2xl border border-[#A7F3D0] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-[#ECFDF5] rounded-lg text-[#10B981]"><CheckCircleOutlined /></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669] mb-1">Recebidos</span>
            <strong className="text-xl text-[#047857]">{formatCurrency(resumo.recebidos)}</strong>
          </div>

          <div className="bg-gradient-to-br from-[#3C0473] to-[#5B21B6] rounded-2xl p-5 flex flex-col relative overflow-hidden shadow-[0_10px_20px_-5px_rgba(91,33,182,0.3)] transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white"><WalletOutlined /></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1 relative z-10">Total Geral</span>
            <strong className="text-xl text-white relative z-10">{formatCurrency(resumo.total)}</strong>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]">
            <ContasReceberActions
              mounted={mounted}
              onAdd={() => navigate('/financeiro/receber/novo')}
              onRefresh={() => carregarContas?.()}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={(term) => setTermoBusca(term)}
              onExport={(formato) => exportarContas(formato as 'csv' | 'xlsx' | 'pdf', filtros)}
            />
          </div>

          {openFilters && (
            <div className="p-8 border-b border-[#E2E8F0] bg-white">
              <ContasReceberFilters
                filtros={filtros}
                setFiltros={setFiltros}
                onBuscar={() => {}}
                onLimpar={handleLimparFiltros}
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {contasFiltradas.length > 0 ? `${contasFiltradas.length} contas encontradas` : 'Nenhuma conta encontrada'}
              </span>
            </div>

            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#5B21B6',
                },
                components: {
                  Button: {
                    borderRadius: 8,
                  },
                  Table: {
                    headerBg: '#F8FAFC',
                    headerColor: '#475569',
                    headerBorderRadius: 8,
                    rowHoverBg: '#F8FAFC',
                    rowSelectedBg: '#F3E8FF',
                    rowSelectedHoverBg: '#E9D5FF',
                    borderColor: '#F1F5F9',
                  },
                  Pagination: { colorPrimary: '#5B21B6', colorPrimaryHover: '#3C0473', itemActiveBg: '#F3E8FF' },
                  Spin: { colorPrimary: '#5B21B6' }
                }
              }}
            >
              <TabelaContasReceber
                contas={contasFiltradas as any}
                isLoading={loading}
                onRefresh={() => carregarContas?.()}
                pagination={pagination}
                onDelete={excluirConta}
                onBaixa={baixarConta}
              />
            </ConfigProvider>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContasReceber;
