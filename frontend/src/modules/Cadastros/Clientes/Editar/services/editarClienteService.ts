/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../../api/api";

export const editarService = async (id: any, data: any) => {
  try {
    const response = await api.put(`/api/clientes/${id}`, data);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}