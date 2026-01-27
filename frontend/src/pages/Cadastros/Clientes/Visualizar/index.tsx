/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, type SyntheticEvent } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Button, Card, CardContent, Tabs, Tab, Box, Skeleton
} from "@mui/material";
import { ArrowBack, Person, History, AttachFile } from "@mui/icons-material";

import Layout from "../../../../template/Layout";
import { useClientes } from "../../../../modules/Cadastros/Clientes/hooks/useClientes";
import { TabDadosCadastrais } from "../../../../modules/Cadastros/Clientes/Visualizar/TabDadosCadastrais";

// Componente simples para Painel de Abas
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index} className="animate-fadeIn">
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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

  // Renderização de Anexos (Simplificada por enquanto)
  const renderAnexos = () => {
    console.log("clienteData > ", clienteData)
    const anexos = clienteData?.data?.anexos || [];
    if (anexos.length === 0) {
      return (
        <div className="text-center py-10">
          <AttachFile className="text-gray-400 text-5xl mb-2" />
          <p className="text-gray-500">Nenhum anexo encontrado para este cliente.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {anexos.map((anexo: any, index: number) => (
          <div key={index} className="p-3 border rounded flex items-center gap-2">
            <AttachFile />
            <a href={anexo.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              {anexo.nome_arquivo || `Anexo ${index + 1}`}
            </a>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <Box className="p-4">
          <Skeleton variant="rectangular" height={60} className="mb-4 rounded" />
          <Skeleton variant="rectangular" height={400} className="rounded" />
        </Box>
      </Layout>
    );
  }

  // Acessa o objeto interno 'cliente' retornado pela API
  const dados = clienteData?.data; 

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/cadastros/clientes')}
            color="inherit"
          >
            Voltar
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="contained" 
            color="warning"
            onClick={() => navigate(`/cadastros/clientes/editar/${id}`)}
          >
            Editar Cadastro
          </Button>
        </div>
      </div>

      <Card sx={{ boxShadow: "none !important", border: "1px solid #E9DEF6", borderRadius: "4px" }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<Person />} iconPosition="start" label="Dados Cadastrais" />
            <Tab icon={<History />} iconPosition="start" label="Histórico" />
            <Tab icon={<AttachFile />} iconPosition="start" label={`Anexos (${clienteData?.data?.anexos?.length || 0})`} />
          </Tabs>
        </Box>
        
        <CardContent>
          <CustomTabPanel value={tabValue} index={0}>
            <TabDadosCadastrais dados={dados} />
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={1}>
            <div className="text-center py-10 text-gray-500">
              <History sx={{ fontSize: 60, opacity: 0.2, marginBottom: 2 }} />
              <p>Histórico de vendas e orçamentos em desenvolvimento.</p>
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={2}>
            {renderAnexos()}
          </CustomTabPanel>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default VisualizarCliente;