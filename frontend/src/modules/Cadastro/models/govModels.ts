import type { AxiosRequestConfig } from "axios";

export interface GOVToken {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface GOVAxiosRequestConfig extends AxiosRequestConfig {
  retry?: boolean;
}

export interface GOVCompany {
  "ni": string;
  "tipoEstabelecimento": string;
  "nomeEmpresarial": string;
  "nomeFantasia": string;
  "situacaoCadastral": {
    "codigo": string;
    "data": string;
    "motivo": string;
  };
  "naturezaJuridica": {
    "codigo": string;
    "descricao": string;
  };
  "dataAbertura": string;
  "cnaePrincipal": {
    "codigo": string;
    "descricao": string;
  };
  "cnaeSecundarias": [
    {
      "codigo": string;
      "descricao": string;
    }
  ];
  "endereco": {
    "tipoLogradouro": string;
    "logradouro": string;
    "numero": string;
    "complemento": string;
    "cep": string;
    "bairro": string;
    "municipio": {
      "codigo": string;
      "descricao": string;
    };
    "uf": string;
    "pais": {
      "codigo": string;
      "descricao": string;
    };
  };
  "municipioJurisdicao": {
    "codigo": string;
    "descricao": string;
  };
  "telefones": [
    {
      "ddd": string;
      "numero": string;
    }
  ];
  "correioEletronico": string;
  "capitalSocial": number;
  "porte": string;
  "situacaoEspecial": string;
  "dataSituacaoEspecial": string;
  "informacoesAdicionais": {
    "optanteSimples": string;
    "optanteMei": string;
    "listaPeriodosSimples": [
      {
        "dataInicio": string;
        "dataFim": string;
      }
    ];
  };
}