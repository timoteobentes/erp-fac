/* eslint-disable no-useless-catch */
import api from "../../../api/api";

export interface LoginData {
  usuarioLogin: string;
  senha: string;
}

export const loginService = (data: LoginData) => {
  try {
    const response = api.post("/api/auth/login", data);
    return response;
  } catch (error) {
    throw error;
  }
}

export const logoutService = () => {
  try {
    const response = "success";
    return response;
  } catch (error) {
    throw error;
  }
}