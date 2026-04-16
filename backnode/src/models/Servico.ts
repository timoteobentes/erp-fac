export interface Servico {
    id?: number;
    usuario_id: number;
    nome: string;
    codigo_lc116: string;
    codigo_tributacao_nacional?: string;
    cnae?: string;
    aliquota_iss: number;
    valor_padrao?: number;
    ativo?: boolean;
    created_at?: Date;
    updated_at?: Date;
}
