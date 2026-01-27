/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import type { GOVCompany } from "../models/govModels";
import { getCompany, consultaCNPJService } from "../services/consultaCnpjService";

export const useConsultaCnpj = () => {
  const [company, setCompany] = useState<Partial<GOVCompany> | undefined>();
  const [consultaCNPJ, setConsultaCNPJ] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const getCompanyGov = async (cnpj: string) => {
    try {
      setLoading(true);
      const cnpjFormat = cnpj.replace(".", "").replace(".", "").replace("/", "").replace("-", "")
      const response = await getCompany(cnpjFormat);
      setCompany(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const getConsultaCNPJ = async (cnpj: string) => {
    try {
      setLoading(true);
      const cnpjFormat = cnpj.replace(".", "").replace(".", "").replace("/", "").replace("-", "")
      const response = await consultaCNPJService(cnpjFormat);
      setConsultaCNPJ(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return {
    getCompanyGov,
    getConsultaCNPJ,
    consultaCNPJ,
    company,
    loading,
    error
  }
}