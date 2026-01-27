/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../api/api";

export const solicitarNovaSenhaService = async (data: any) => {
  try {
    const response = await api.post(`/api/auth/reset-password/request`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}