/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../../api/api";

export const criarProdutoService = async (dados: any) => {
  try {
    const response = await api.post("/produtos", dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};