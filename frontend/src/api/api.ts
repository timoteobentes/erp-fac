import axios from "axios";
import { authInterceptor, errorInterceptor } from "../modules/Cadastro/services/consulta.requester";

const api = axios.create({
  baseURL: import.meta.env.VITE_API
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // ou sessionStorage, conforme você armazena
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - redirecionar para login
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const apiViaCep = axios.create({
  baseURL: import.meta.env.VITE_API_VIACEP
});

const apiConsultaCNPJ = axios.create({
  baseURL: import.meta.env.VITE_API_CNPJ_JA
});

const apiGovBr = axios.create({
  baseURL: import.meta.env.VITE_URL_GOV
});

apiGovBr.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
apiGovBr.interceptors.response.use((response) => response, errorInterceptor);

export { apiGovBr, apiViaCep, apiConsultaCNPJ };

export default api;