/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import type { GOVToken, GOVAxiosRequestConfig } from "../models/govModels";
import { authService } from "./consultaCnpjService";
// import { toast } from "react-toastify";

export const authInterceptor = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  const tokenString = window.sessionStorage.getItem("GOV_TOKEN");
  const newConfig = config;

  if (tokenString) {
      const token: GOVToken = JSON.parse(tokenString);
      newConfig.headers.Authorization = `Bearer ${token.access_token}`;
  }
  return newConfig;
}

export const errorInterceptor = async (error: AxiosError | any) => {
  const originalRequest = error.config as GOVAxiosRequestConfig;
  if (error.response?.status === 401 && !originalRequest.retry && originalRequest?.headers) {
    console.error(error.response?.data?.message || error.message)
    // toast.error(error.response?.data?.message || error.message, { toastId: "errorInterceptor" })
    originalRequest.retry = true;
    try {
      const tokenString = await authService();
      const token: GOVToken = JSON.parse(tokenString);
      originalRequest.headers.Authorization = `Bearer ${token.access_token}`;
      return await axios(error.config as InternalAxiosRequestConfig);
    } catch (newError: any) {
      return Promise.reject(error);
    }
  }
  return Promise.reject(error);
}