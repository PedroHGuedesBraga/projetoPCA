// ContratoTypes.ts
export interface Contrato {
  id: string;
  nome: string;
  data: string;
  status: string;
  aprovado: boolean;
  itensQuantidade: number;
  secretariaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContratoOrganizadoResponse {
  [ano: string]: {
    [mes: string]: Contrato[];
  };
}
