/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../../api/api";

export const cadastrarService = async (data: any) => {
  try {
    const response = await api.post(`/api/clientes`, data);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}