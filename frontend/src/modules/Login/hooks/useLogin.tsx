/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import type { LoginData } from '../services/loginService';

export const useLogin = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const login = async (data: LoginData) => {
    await auth.login(data);
    return navigate("/inicio");
  }

  const logout = async () => {
    return await auth.logout();
  }

  return {
    isLoading: auth.isLoading,
    error: auth.error,
    success: auth.success,
    user: auth.user,
    token: auth.token,
    adm: auth.adm,
    login,
    logout,
    clearError: auth.clearError
  };
}