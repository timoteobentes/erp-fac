/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Box, TextField, MenuItem } from "@mui/material";
import { maskRegexCPF, maskRegexCNPJ, maskRegexRG } from '../../../../../../types/regex';
import { type NovoClienteFormData } from '../../schemas/clienteSchema';

export const DadosPrincipais: React.FC = () => {
  const { register, watch, formState: { errors }, setValue } = useFormContext<NovoClienteFormData>();
  const tipoCliente = watch('tipo_cliente');

  // Exemplo de normalização simples ao digitar
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>, mask: (v: string) => string) => {
    setValue(e.target.name as any, mask(e.target.value));
  };

  return (
    <Box className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fadeIn">
      {/* Linha 1: Tipo e Situação */}
      <div className="md:col-span-3">
        <TextField select fullWidth label="Tipo de Cliente" {...register("tipo_cliente")} error={!!errors.tipo_cliente}>
          <MenuItem value="PJ">Pessoa Jurídica</MenuItem>
          <MenuItem value="PF">Pessoa Física</MenuItem>
          <MenuItem value="estrangeiro">Estrangeiro</MenuItem>
        </TextField>
      </div>
      
      <div className="md:col-span-3">
        <TextField select fullWidth label="Situação" {...register("situacao")} defaultValue="ativo">
          <MenuItem value="ativo">Ativo</MenuItem>
          <MenuItem value="inativo">Inativo</MenuItem>
        </TextField>
      </div>

      {/* Renderização Condicional baseada no Tipo */}
      {tipoCliente === 'PJ' && (
        <>
          <div className="md:col-span-3">
            <TextField 
              fullWidth 
              label="CNPJ" 
              {...register("cnpj")} 
              onChange={(e: any) => handleDocChange(e, maskRegexCNPJ)}
              error={!!(errors as any).cnpj}
              helperText={(errors as any).cnpj?.message}
            />
          </div>
          <div className="md:col-span-6">
            <TextField fullWidth label="Razão Social" {...register("razao_social")} error={!!(errors as any).razao_social} />
          </div>
          <div className="md:col-span-6">
            <TextField fullWidth label="Nome Fantasia" {...register("nome")} error={!!errors.nome} />
          </div>
          {/* <div className="md:col-span-3">
            <FormControlLabel control={<Checkbox {...register("isento")} />} label="Isento IE" />
          </div> */}
        </>
      )}

      {tipoCliente === 'PF' && (
        <>
          <div className="md:col-span-3">
            <TextField 
              fullWidth 
              label="CPF" 
              {...register("cpf")} 
              onChange={(e: any) => handleDocChange(e, maskRegexCPF)}
              error={!!(errors as any).cpf}
            />
          </div>
          <div className="md:col-span-3">
            <TextField 
              fullWidth 
              label="RG" 
              {...register("rg")} 
              onChange={(e: any) => handleDocChange(e, maskRegexRG)}
            />
          </div>
          <div className="md:col-span-6">
            <TextField fullWidth label="Nome Completo" {...register("nome")} error={!!errors.nome} />
          </div>
        </>
      )}
      
      {/* Campos Comuns */}
      {/* <div className="md:col-span-4">
        <TextField fullWidth label="E-mail Principal" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
      </div>
      <div className="md:col-span-4">
        <TextField fullWidth label="Telefone Comercial" {...register("telefone_comercial")} />
      </div>
      <div className="md:col-span-4">
        <TextField fullWidth label="Celular/WhatsApp" {...register("telefone_celular")} />
      </div> */}
    </Box>
  );
};