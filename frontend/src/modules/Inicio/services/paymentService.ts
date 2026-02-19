/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */
import api from "../../../api/api";

export const paymentService = (data: any, method: any) => {
  try {
    const response = api.post(`/api/payments/${method}`, data);
    return response;
  } catch (error) {
    throw error;
  }
}