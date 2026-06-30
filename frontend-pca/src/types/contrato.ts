import type { Secretaria } from './secretaria';
import type { Item } from './item';

export interface Contrato {
  id: string;
  nome: string;
  data: string; // DATEONLY -> string
  status: string;
  aprovado: boolean;
  itensQuantidade: number;
  secretariaId: string;
  codigoRastreio?: string;
  justificativa?: string;
  createdAt?: string;
  itens?: Item[];
  secretaria?: Secretaria;
}
