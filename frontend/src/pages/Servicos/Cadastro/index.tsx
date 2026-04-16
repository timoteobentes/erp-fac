import React, { useState, useEffect } from "react";
import { Box, Typography } from '@mui/material';
import { ConfigProvider } from "antd";
import Layout from "../../../template/Layout";
import { useServicos } from '../../../modules/Servicos/Cadastro/hooks/useServicos';
import { TabelaServicos } from '../../../modules/Servicos/Cadastro/components/TabelaServicos';
import { ServicosActions } from '../../../modules/Servicos/Cadastro/components/ServicosActions';

export default function ListaServicos() {
  const { servicos, isLoading, deletarServico } = useServicos();
  const [mounted, setMounted] = useState(false);

  // Efeito de Montagem (Animação Suave)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Renderização de Loading Premium
  if (isLoading && (!servicos || servicos.length === 0)) {
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
        
        {/* HEADER DA PÁGINA */}
        <div className="flex flex-col mb-8">
          <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
            Gerenciar Serviços
          </Typography>
          <Typography variant="body2" color="#64748B">
            Organize os serviços prestados pela sua empresa e prepare o catálogo para a emissão ágil de NFS-e.
          </Typography>
        </div>

        {/* CONTAINER PRINCIPAL (Soft UX) */}
        <Box 
          sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '24px', 
            boxShadow: '0 4px 24px rgba(0,0,0,0.02)', 
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* BARRA DE AÇÕES (Fundo levemente destacado) */}
          <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
             <ServicosActions />
          </Box>

          {/* ÁREA DA TABELA */}
          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              {/* Badge indicadora de registros */}
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {servicos && servicos.length > 0 ? `${servicos.length} serviços cadastrados` : 'Nenhum registro encontrado'}
              </span>
            </div>

            <ConfigProvider
              theme={{
                components: {
                  Checkbox: {
                    colorPrimary: '#5B21B6',
                    colorPrimaryHover: '#3C0473'
                  },
                  Table: {
                    headerBg: '#F8FAFC',
                    headerColor: '#475569',
                    headerBorderRadius: 8,
                    rowHoverBg: '#F8FAFC',
                    rowSelectedBg: '#F3E8FF',      // Roxo super claro B2B
                    rowSelectedHoverBg: '#E9D5FF', // Hover do selecionado
                    borderColor: '#F1F5F9',
                  },
                  Pagination: {
                    colorPrimary: '#5B21B6',
                    colorPrimaryHover: '#3C0473',
                    itemActiveBg: '#F3E8FF'
                  },
                  Spin: {
                    colorPrimary: '#5B21B6'
                  }
                }
              }}
            >
              <TabelaServicos servicos={servicos} onDelete={deletarServico} />
            </ConfigProvider>
          </Box>
        </Box>
      </div>
    </Layout>
  );
}