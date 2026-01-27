import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button, IconButton, TextField, MenuItem, Typography } from "@mui/material";
import { Delete, Add, Search } from "@mui/icons-material";
import { type NovoClienteFormData } from '../../schemas/clienteSchema';
import { maskRegexCEP } from '../../../../../../types/regex';
// Importe seu hook de CEP ou lógica aqui se necessário
// import { useNovoCliente } from ...

export const EnderecosList: React.FC = () => {
  const { control, register, setValue, formState: { errors } } = useFormContext<NovoClienteFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "enderecos" });

  const handleBuscarCep = async (index: number, cep: string) => {
    // Lógica simplificada - idealmente viria do seu hook useNovoCliente
    // const dados = await fetchCep(cep);
    // setValue(`enderecos.${index}.logradouro`, dados.logradouro);
    // ...
    console.log(`Buscar CEP ${cep} para índice ${index}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#3C0473] text-lg font-bold border-l-4 border-[#3C0473] pl-2">Endereços</h3>
        <Button 
            startIcon={<Add />} 
            onClick={() => append({ tipo: "comercial", cep: "", logradouro: "", numero: "", bairro: "", cidade: "", uf: "", pais: "Brasil", principal: false })}
            variant="outlined"
            size="small"
        >
          Adicionar Endereço
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative animate-fadeIn">
          {index > 0 && (
            <div className="absolute top-2 right-2">
              <IconButton onClick={() => remove(index)} color="error" size="small"><Delete /></IconButton>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-2">
              <TextField select fullWidth label="Tipo" size="small" {...register(`enderecos.${index}.tipo`)}>
                  <MenuItem value="comercial">Comercial</MenuItem>
                  <MenuItem value="cobranca">Cobrança</MenuItem>
                  <MenuItem value="entrega">Entrega</MenuItem>
              </TextField>
            </div>
            
            <div className="md:col-span-2 relative">
              <TextField 
                  fullWidth 
                  label="CEP" 
                  size="small" 
                  {...register(`enderecos.${index}.cep`)} 
                  onChange={(e) => setValue(`enderecos.${index}.cep`, maskRegexCEP(e.target.value))}
                  InputProps={{
                      endAdornment: (
                          <IconButton size="small" edge="end" onClick={() => handleBuscarCep(index, "")}>
                              <Search fontSize="small" />
                          </IconButton>
                      )
                  }}
              />
            </div>

            <div className="md:col-span-6">
              <TextField fullWidth label="Logradouro" size="small" {...register(`enderecos.${index}.logradouro`)} />
            </div>
            
            <div className="md:col-span-2">
              <TextField fullWidth label="Número" size="small" {...register(`enderecos.${index}.numero`)} />
            </div>

            <div className="md:col-span-3">
              <TextField fullWidth label="Bairro" size="small" {...register(`enderecos.${index}.bairro`)} />
            </div>
            <div className="md:col-span-4">
              <TextField fullWidth label="Cidade" size="small" {...register(`enderecos.${index}.cidade`)} />
            </div>
            <div className="md:col-span-1">
              <TextField fullWidth label="UF" size="small" {...register(`enderecos.${index}.uf`)} />
            </div>
          </div>
          
          {errors.enderecos?.[index] && (
            <Typography variant="caption" color="error">Preencha os campos obrigatórios deste endereço</Typography>
          )}
        </div>
      ))}
    </div>
  );
};