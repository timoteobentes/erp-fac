import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ConfigProvider } from 'antd';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from "../../../template/Layout";
import { useNFSe } from '../../../modules/Servicos/EmissaoNFSe/hooks/useNFSe';
import { TabelaNFSe } from '../../../modules/Servicos/EmissaoNFSe/components/TabelaNFSe';

export default function HistoricoNFSe() {
  const navigate = useNavigate();
  const { notas, isLoading, fetchNotas } = useNFSe();
  const [mounted, setMounted] = useState(false);

  // Efeito de Montagem (Animação Suave)
  useEffect(() => {
    fetchNotas();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchNotas]);

  // Renderização de Loading Premium B2B
  if (isLoading && (!notas || notas.length === 0)) {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
          <div className="flex flex-col">
            <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
              Histórico NFS-e
            </Typography>
            <Typography variant="body2" color="#64748B">
              Consulte as notas de serviço emitidas, rascunhos e acompanhe o estado de autorização na prefeitura.
            </Typography>
          </div>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/servicos/nfse/nova')}
            sx={{ 
              background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', 
              color: 'white', 
              textTransform: 'none', 
              fontWeight: 600, 
              borderRadius: '8px', 
              px: 4, py: 1.2,
              boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)', 
              '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' } 
            }}
          >
            Emitir Nova NFS-e
          </Button>
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
          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              {/* Badge indicadora de registos */}
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {notas && notas.length > 0 ? `${notas.length} notas registadas` : 'Nenhum registo encontrado'}
              </span>
            </div>

            {/* Injeção de Tema do Ant Design para a Tabela */}
            <ConfigProvider
              theme={{
                components: {
                  Checkbox: { colorPrimary: '#5B21B6', colorPrimaryHover: '#3C0473' },
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
              <TabelaNFSe notas={notas} isLoading={isLoading} />
            </ConfigProvider>
          </Box>
        </Box>
      </div>
    </Layout>
  );
}