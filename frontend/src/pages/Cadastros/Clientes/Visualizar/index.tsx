/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, type SyntheticEvent } from "react";
import { useParams, useNavigate } from "react-router";
import { Button, Box, Skeleton, Typography, IconButton, Tabs, Tab } from "@mui/material";
import { ArrowBack, PersonOutline, History, AttachFile, EditOutlined, InsertDriveFileOutlined, CloudDownloadOutlined } from "@mui/icons-material";

import Layout from "../../../../template/Layout";
import { useClientes } from "../../../../modules/Cadastros/Clientes/hooks/useClientes";
import { TabDadosCadastrais } from "../../../../modules/Cadastros/Clientes/Visualizar/TabDadosCadastrais";

// Componente simples para Painel de Abas com Animação
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index} className={`transition-opacity duration-300 ${value === index ? 'opacity-100 animate-fadeIn' : 'opacity-0 hidden'}`}>
    {value === index && <Box sx={{ p: { xs: 3, md: 5 } }}>{children}</Box>}
  </div>
);

const VisualizarCliente: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchClienteId } = useClientes();
  
  const [loading, setLoading] = useState(true);
  const [clienteData, setClienteData] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  // Busca Dados
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchClienteId(id)
        .then((data: any) => setClienteData(data))
        .catch(() => navigate('/cadastros/clientes')) // Redireciona se der erro
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Renderização de Anexos (Estilo Premium File Cards)
  const renderAnexos = () => {
    const anexos = clienteData?.data?.anexos || [];
    
    if (anexos.length === 0) {
      return (
        <div className="text-center py-16 px-4 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1]">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <AttachFile className="text-[#94A3B8] text-3xl" />
          </div>
          <Typography variant="h6" color="#0F172A" fontWeight={600} mb={1}>Nenhum anexo</Typography>
          <Typography variant="body2" color="#64748B">Este cliente ainda não possui documentos ou arquivos anexados.</Typography>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {anexos.map((anexo: any, index: number) => (
          <div key={index} className="group p-4 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl flex items-center justify-between hover:border-[#5B21B6] hover:shadow-md transition-all">
            <div className="flex items-center gap-4 overflow-hidden">
                <div className="bg-white p-2.5 rounded-lg shadow-sm text-[#5B21B6]">
                    <InsertDriveFileOutlined />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <Typography variant="subtitle2" color="#0F172A" fontWeight={600} noWrap>
                        {anexo.nome_arquivo || `Documento_Anexado_${index + 1}.pdf`}
                    </Typography>
                    <Typography variant="caption" color="#64748B">
                        Arquivo anexo
                    </Typography>
                </div>
            </div>
            <IconButton 
                component="a" 
                href={anexo.url} 
                target="_blank" 
                rel="noreferrer"
                size="small"
                sx={{ color: '#64748B', '&:hover': { color: '#5B21B6', backgroundColor: '#F3E8FF' } }}
            >
                <CloudDownloadOutlined fontSize="small" />
            </IconButton>
          </div>
        ))}
      </div>
    );
  };

  // LOADING PREMIUM B2B
  if (loading) {
    return (
      <Layout>
        <div className="mb-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div>
                 <Skeleton variant="text" width={200} height={40} />
                 <Skeleton variant="text" width={300} height={20} />
              </div>
           </div>
           <Skeleton variant="rounded" width={140} height={42} sx={{ borderRadius: '8px' }} />
        </div>
        <Skeleton variant="rounded" width="100%" height={600} sx={{ borderRadius: '24px' }} />
      </Layout>
    );
  }

  // Acessa o objeto interno 'cliente' retornado pela API
  const dados = clienteData?.data;

  return (
    <Layout>
      
      {/* HEADER DE NAVEGAÇÃO PREMIUM */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <IconButton 
            onClick={() => navigate('/cadastros/clientes')}
            sx={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
                color: '#475569',
                '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {dados?.nome || dados?.razao_social || 'Detalhes do Cliente'}
            </Typography>
            <Typography variant="body2" color="#64748B">
                Código: <strong className="text-[#3C0473]">#{dados?.id?.toString().padStart(4, '0') || '----'}</strong> • Visualize ou altere as informações abaixo.
            </Typography>
          </div>
        </div>
        
        <Button 
          variant="outlined" 
          startIcon={<EditOutlined />}
          onClick={() => navigate(`/cadastros/clientes/editar/${id}`)}
          sx={{ 
              borderColor: '#E2E8F0', 
              color: '#0F172A', 
              fontWeight: 600, 
              textTransform: 'none', 
              borderRadius: '8px',
              px: 3, py: 1,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              '&:hover': { borderColor: '#5B21B6', backgroundColor: '#F8FAFC', color: '#5B21B6' }
          }}
        >
          Editar Cliente
        </Button>
      </div>

      {/* CONTAINER PRINCIPAL (Soft UX) */}
      <Box sx={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '24px', 
          border: "1px solid #E2E8F0", 
          boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
          overflow: 'hidden'
      }}>
        
        {/* CABEÇALHO DAS ABAS ESTILIZADO */}
        <Box sx={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FCFDFD', px: { xs: 1, md: 3 }, pt: 1 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{
                '& .MuiTab-root': { 
                    textTransform: 'none', 
                    fontWeight: 600, 
                    color: '#64748B', 
                    fontSize: '0.95rem',
                    minHeight: '60px',
                    marginRight: 2
                },
                '& .Mui-selected': { color: '#5B21B6 !important' },
                '& .MuiTabs-indicator': { 
                    backgroundColor: '#5B21B6', 
                    height: '3px', 
                    borderTopLeftRadius: '3px', 
                    borderTopRightRadius: '3px' 
                }
            }}
          >
            <Tab icon={<PersonOutline sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Dados Cadastrais" />
            <Tab icon={<History sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Histórico Comercial" />
            <Tab icon={<AttachFile sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label={`Anexos (${clienteData?.data?.anexos?.length || 0})`} />
          </Tabs>
        </Box>
        
        {/* CONTEÚDO DAS ABAS */}
        <Box sx={{ minHeight: '400px' }}>
          <CustomTabPanel value={tabValue} index={0}>
            <TabDadosCadastrais dados={dados} />
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={1}>
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                 <History sx={{ fontSize: 40, color: '#CBD5E1' }} />
              </div>
              <Typography variant="h6" color="#0F172A" fontWeight={600} mb={1}>Histórico em desenvolvimento</Typography>
              <Typography variant="body2" color="#64748B" maxWidth={400} mx="auto">
                  Em breve, você poderá visualizar todo o histórico de compras, orçamentos e movimentações financeiras deste cliente aqui.
              </Typography>
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={2}>
            {renderAnexos()}
          </CustomTabPanel>
        </Box>
      </Box>
    </Layout>
  );
};

export default VisualizarCliente;