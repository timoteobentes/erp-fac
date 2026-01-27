/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { LoginData } from '../services/loginService';
import { loginService, logoutService } from '../services/loginService';
import { useNavigate } from 'react-router';
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextData {
  isLoading: boolean;
  error: any;
  success: boolean;
  user: any;
  token: string | null;
  adm: any;
  login: (data: LoginData) => Promise<void>;
  logout: () => any;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [adm, setAdm] = useState<boolean>(() => {
    return localStorage.getItem('adm') === 'true';
  });
  const [success, setSuccess] = useState<boolean>(false);

  const clearError = () => setError(null);

  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: any = await loginService(data);

      if (response.data.usuario && response.data.token) {
        const isAdm = response.data.usuario.grupo_acesso_id == '1';
        
        setAdm(isAdm);
        setUser(response.data.usuario);
        setToken(response.data.token);
        setSuccess(true);

        // Salva no localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
        localStorage.setItem('adm', isAdm.toString());
      }
      
      return response.data;
    } catch (err: any) {
      if(err.status == 401) {
        toast.error('Credenciais inválidas. Tente novamente.');
      }
      setError(err);
      setSuccess(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const response = await logoutService();

      setAdm(false);
      setUser(null);
      setToken(null);
      setSuccess(false);

      // Remove do localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adm');

      navigate("/login");

      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const contextValue: AuthContextData = {
    isLoading,
    error,
    success,
    user,
    token,
    adm,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};