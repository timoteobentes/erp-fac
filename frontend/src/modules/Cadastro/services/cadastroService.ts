/* eslint-disable no-useless-catch */
import api from "../../../api/api";

export interface CadastroData {
  cnpj: string;
  nome_empresa: string;
  telefone: string;
  cidade: string;
  estado: string;
  email: string;
  nome_usuario: string;
  senha: string;
  termos_aceitos: boolean;
}

export const cadastroService = (data: CadastroData) => {
  try {
    const response = api.post("/api/auth/registrar", data);
    return response;
  } catch (error) {
    throw error;
  }
}