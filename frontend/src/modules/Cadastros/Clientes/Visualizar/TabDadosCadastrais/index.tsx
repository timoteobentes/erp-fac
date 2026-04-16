/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import dayjs from 'dayjs';
import { InfoField } from '../InfoField';
import { maskRegexCNPJ, maskRegexCPF } from '../../../../../types/regex';
import { 
  BadgeOutlined, 
  MapOutlined, 
  ContactsOutlined, 
  MonetizationOnOutlined, 
  FormatQuoteOutlined 
} from '@mui/icons-material';

interface TabDadosCadastraisProps {
  dados: any; // Idealmente, use a interface Cliente completa aqui
}

export const TabDadosCadastrais: React.FC<TabDadosCadastraisProps> = ({ dados }) => {
  if (!dados) return null;

  const isPF = dados.tipo_cliente === 'PF';
  const dataNasc = dados.data_nascimento ? dayjs(dados.data_nascimento).format('DD/MM/YYYY') : '-';

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      
      {/* SEÇÃO 1: IDENTIFICAÇÃO */}
      <section>
        <div className="flex items-center gap-2 mb-6">
           <BadgeOutlined sx={{ color: '#5B21B6' }} />
           <Typography variant="h6" fontWeight={700} color="#0F172A">
             Identificação
           </Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4">
          <InfoField label="Tipo de Cliente" value={dados.tipo_cliente === 'PF' ? 'Pessoa Física' : dados.tipo_cliente === 'estrangeiro' ? 'Estrangeiro' : 'Pessoa Jurídica'} />
          <InfoField label="Situação" value={dados.situacao === 'ativo' ? 'Ativo' : dados.situacao === 'bloqueado' ? 'Bloqueado' : 'Inativo'} />
          <InfoField label="Vendedor Responsável" value={dados.vendedor_responsavel || '-'} />
          <InfoField label={isPF ? "Nome Completo" : "Razão Social"} value={dados.nome || '-'} />
          {!isPF && <InfoField label="Nome Fantasia" value={dados.nome_fantasia || '-'} />}
          
          {isPF ? (
            <>
              <InfoField label="CPF" value={maskRegexCPF(dados.cpf)} />
              <InfoField label="RG" value={dados.rg || '-'} />
              <InfoField label="Data de Nascimento" value={dataNasc} />
            </>
          ) : dados.tipo_cliente === 'estrangeiro' ? (
            <>
              <InfoField label="Documento" value={dados.documento_estrangeiro || '-'} />
              <InfoField label="País de Origem" value={dados.pais_origem || '-'} />
            </>
          ) : (
            <>
              <InfoField label="CNPJ" value={maskRegexCNPJ(dados.cnpj)} />
              <InfoField label="Inscrição Municipal" value={dados.inscricao_municipal || '-'} />
              <InfoField label="Inscrição Estadual" value={dados.inscricao_estadual || '-'} />
              <InfoField label="Inscrição Suframa" value={dados.inscricao_suframa || '-'} />
            </>
          )}
        </div>
      </section>

      <Divider sx={{ borderColor: '#F1F5F9' }} />

      {/* SEÇÃO 2: ENDEREÇOS */}
      <section>
        <div className="flex items-center gap-2 mb-6">
           <MapOutlined sx={{ color: '#5B21B6' }} />
           <Typography variant="h6" fontWeight={700} color="#0F172A">
             Endereços Cadastrados
           </Typography>
        </div>

        {dados.enderecos && dados.enderecos.length >= 1 ? (
          <div className="grid grid-cols-1 gap-4">
            {dados.enderecos.map((item: any) => (
              <Box key={item.id} className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] relative transition-all hover:border-[#CBD5E1]">
                
                {/* Badge Visual para "Principal" em vez de um campo de texto */}
                {item.principal && (
                   <span className="absolute top-4 right-4 bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-[#A7F3D0]">
                      Endereço Principal
                   </span>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-4 mt-2">
                  <InfoField label="Tipo" value={item.tipo || '-'} />
                  <InfoField label="CEP" value={item.cep || '-'} />
                  <InfoField label="Logradouro" value={item.logradouro || '-'} />
                  <InfoField label="Número" value={item.numero || '-'} />
                  <InfoField label="Bairro" value={item.bairro || '-'} />
                  <InfoField label="Cidade" value={item.cidade || '-'} />
                  <InfoField label="Estado" value={item.estado || '-'} />
                  <InfoField label="Complemento" value={item.complemento || '-'} />
                </div>
              </Box>
            ))}
          </div>
        ) : (
          <Typography variant="body2" color="#94A3B8">Nenhum endereço registado.</Typography>
        )}
      </section>

      <Divider sx={{ borderColor: '#F1F5F9' }} />

      {/* SEÇÃO 3: CONTATOS */}
      <section>
        <div className="flex items-center gap-2 mb-6">
           <ContactsOutlined sx={{ color: '#5B21B6' }} />
           <Typography variant="h6" fontWeight={700} color="#0F172A">
             Contatos Adicionais
           </Typography>
        </div>

        {dados.contatos && dados.contatos.length >= 1 ? (
          <div className="grid grid-cols-1 gap-4">
            {dados.contatos.map((item: any) => (
              <Box key={item.id} className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] relative transition-all hover:border-[#CBD5E1]">
                
                {/* Badge Visual para "Principal" */}
                {item.principal && (
                   <span className="absolute top-4 right-4 bg-[#EEF2FF] text-[#6366F1] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-[#C7D2FE]">
                      Contato Principal
                   </span>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-4 mt-2">
                  <InfoField label="Tipo" value={item.tipo || '-'} />
                  <InfoField label="Nome" value={item.nome || '-'} />
                  <InfoField label="Valor" value={item.valor || '-'} />
                  <InfoField label="Cargo" value={item.cargo || '-'} />
                </div>
              </Box>
            ))}
          </div>
        ) : (
          <Typography variant="body2" color="#94A3B8">Nenhum contacto adicional registado.</Typography>
        )}
      </section>

      <Divider sx={{ borderColor: '#F1F5F9' }} />

      {/* SEÇÃO 4: FINANCEIRO */}
      <section>
        <div className="flex items-center gap-2 mb-6">
           <MonetizationOnOutlined sx={{ color: '#5B21B6' }} />
           <Typography variant="h6" fontWeight={700} color="#0F172A">
             Dados Financeiros
           </Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-4">
          <InfoField label="Limite de Crédito" value={dados.limite_credito ? `R$ ${dados.limite_credito}` : 'R$ 0,00'} />
          <InfoField label="Permitir Ultrapassar Limite" value={dados.permitir_ultrapassar_limite ? "SIM" : "NÃO"} />
        </div>
      </section>

      {/* SEÇÃO 5: OBSERVAÇÕES */}
      {dados.observacoes && (
        <>
          <Divider sx={{ borderColor: '#F1F5F9' }} />
          <section>
            <div className="flex items-center gap-2 mb-6">
              <FormatQuoteOutlined sx={{ color: '#5B21B6' }} />
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Observações
              </Typography>
            </div>
            
            <Box className="p-5 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] text-sm leading-relaxed">
               <InfoField label="" value={dados.observacoes} fullWidth />
            </Box>
          </section>
        </>
      )}
    </div>
  );
};