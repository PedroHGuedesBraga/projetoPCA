import api from "@/services/api";

export interface ItemPlano {
  id: string;
  nome: string;
  descricao?: string;
  quantidadeItem: number;
  unidadeDeMedida?: string;
  aprovado: boolean;
}

export interface ContratoPlano {
  id: string;
  nome: string;
  data: string;
  status: string;
  aprovado: boolean;
  codigoRastreio?: string;
  justificativa?: string;
  Items: ItemPlano[];
}

export interface SecretariaPlano {
  id: string;
  nome: string;
  contratos: ContratoPlano[];
}

export const planoAnualService = {
  getByAno: async (ano: number): Promise<SecretariaPlano[]> => {
    const res = await api.get<SecretariaPlano[]>(`/plano-anual/${ano}`);
    return res.data;
  },
};
