/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosResponse } from "axios";
import { apiGovBr, apiConsultaCNPJ } from "../../../api/api";
import type { GOVToken, GOVCompany } from "../models/govModels";

export const authService = async () => {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_secret", import.meta.env.VITE_APP_GOV_API_CLIENT_SECRET);
    params.append("client_id", import.meta.env.VITE_APP_GOV_API_CLIENT_ID);
    params.append("scope", import.meta.env.VITE_SCOPE_GOV);

    const { data: token } = await apiGovBr.post<GOVToken>(`/token`, params);
    window.sessionStorage.setItem("GOV_TOKEN", JSON.stringify(token));
    return JSON.stringify(token);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const getCompany = async (cnpj: string): Promise<AxiosResponse<GOVCompany>> => {
  try {
    const response = await apiGovBr.get<GOVCompany>(`consulta-cnpj-df/v2/empresa/${cnpj}`);
    return response;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

export const consultaCNPJService = async (cnpj: string) => {
  try {
    const response = await apiConsultaCNPJ.get(`/${cnpj}`);
    return response;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}