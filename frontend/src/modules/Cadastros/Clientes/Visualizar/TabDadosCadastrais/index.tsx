/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { InfoField } from '../InfoField';
import { maskRegexCNPJ, maskRegexCPF } from '../../../../../types/regex';

interface TabDadosCadastraisProps {
  dados: any; // Idealmente, use a interface Cliente completa aqui
}

export const TabDadosCadastrais: React.FC<TabDadosCadastraisProps> = ({ dados }) => {
  if (!dados) return null;

  const isPF = dados.tipo_cliente === 'PF';
  const dataNasc = dados.data_nascimento ? dayjs(dados.data_nascimento).format('DD/MM/YYYY') : '-';

  console.log("dados em TabDadosCadastrais > ", dados);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Seção 1: Identificação */}
      <section>
        <h3 className="text-[#3C0473] text-lg font-bold mb-4">
          Identificação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoField label="Tipo de Cliente" value={dados.tipo_cliente === 'PF' ? 'PESSOA FÍSCIA' : dados.tipo_cliente === 'estrangeiro' ? 'ESTRANGEIRO' : 'PESSOA JURÍDICA'} />
          <InfoField label="Situação" value={dados.situacao === 'ativo' ? 'ATIVO' : dados.situacao === 'bloqueado' ? 'BLOQUEADO' : 'INATIVO'} />
          <InfoField label="Vendedor Responsável" value={dados.vendedor_responsavel.toUpperCase()} />
          <InfoField label={isPF ? "Nome Completo" : "Razão Social"} value={dados.nome.toUpperCase()} fullWidth={!dados.nome_fantasia.toUpperCase()} />
          {!isPF && <InfoField label="Nome Fantasia" value={dados.nome_fantasia.toUpperCase()} />}
          
          {isPF ? (
            <>
              <InfoField label="CPF" value={maskRegexCPF(dados.cpf)} />
              <InfoField label="RG" value={dados.rg} />
              <InfoField label="Data de Nascimento" value={dataNasc} />
            </>
          ) : dados.tipo_cliente === 'estrangeiro' ? (
            <>
              <InfoField label="Documento" value={dados.documento_estrangeiro} />
              <InfoField label="País de Origem" value={dados.pais_origem} />
            </>
          ) : (
            <>
              <InfoField label="CNPJ" value={maskRegexCNPJ(dados.cnpj)} />
              <InfoField label="Inscrição Municipal" value={dados.inscricao_estadual} />
              <InfoField label="Inscrição Estadual" value={dados.inscricao_estadual} />
              <InfoField label="Inscrição Suframa" value={dados.inscricao_suframa} />
            </>
          )}
        
          
          {/* <InfoField label="E-mail" value={dados.email?.toUpperCase()} />
          <InfoField label="Telefone" value={dados.telefone} />
          <InfoField label="Celular/WhatsApp" value={dados.celular} /> */}
        </div>
      </section>

      {/* Seção 2: Endereço */}
      <section>
        <h3 className="text-[#3C0473] text-lg font-bold mb-4">
          Endereço
        </h3>
        {dados.enderecos && dados.enderecos.length >= 1 && (
          <>
            {dados.enderecos.map((item: any) => (
              <Box key={item.id} className="bg-gray-50 p-4 rounded mb-4 relative border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InfoField label="Tipo" value={item.tipo.toUpperCase()} />
                  <InfoField label="CEP" value={item.cep} />
                  <InfoField label="Logradouro" value={item.logradouro} />
                  <InfoField label="Número" value={item.numero} />
                  <InfoField label="Bairro" value={item.bairro} />
                  <InfoField label="Cidade" value={item.cidade} />
                  <InfoField label="Estado" value={item.estado} />
                  <InfoField label="Complemento" value={item.complemento} />
                  <InfoField label="Principal" value={item.principal ? "SIM" : "NÃO"} />
                </div>
              </Box>
            ))}
          </>
        )}
      </section>

      <section>
        <h3 className="text-[#3C0473] text-lg font-bold mb-4">
          Contato
        </h3>
        {dados.contatos && dados.contatos.length >= 1 && (
          <>
            {dados.contatos.map((item: any) => (
              <Box key={item.id} className="bg-gray-50 p-4 rounded mb-4 relative border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InfoField label="Tipo" value={item.tipo.toUpperCase()} />
                  <InfoField label="Nome" value={item.nome.toUpperCase()} />
                  <InfoField label="Valor" value={item.valor.toUpperCase()} />
                  <InfoField label="Cargo" value={item.cargo.toUpperCase()} />
                  <InfoField label="Principal" value={item.principal ? "SIM" : "NÃO"} />
                </div>
              </Box>
            ))}
          </>
        )}
      </section>

      {/* Seção 3: Financeiro e Outros */}
      <section>
        <h3 className="text-[#3C0473] text-lg font-bold mb-4">
          Financeiro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InfoField label="Limite de Crédito" value={dados.limite_credito ? `R$ ${dados.limite_credito}` : 'R$ 0,00'} />
          <InfoField label="Permitir Ultrapassar Limite" value={dados.permitir_ultrapassar_limite ? "SIM" : "NÃO"} />
        </div>
      </section>

      {/* Seção 4: Observações */}
      {dados.observacoes && (
        <section>
          <h3 className="text-[#3C0473] text-lg font-bold mb-4">
            Observações
          </h3>
          <InfoField label="" value={dados.observacoes} fullWidth />
        </section>
      )}
    </div>
  );
};