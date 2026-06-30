import type { Contrato } from './contrato';

export interface Item {
  id: string;
  nome: string;
  descricao: string;
  quantidadeItem: number;
  data: string;
  unidadeDeMedida: string;
  aprovado: boolean;
  contratoId: string;
  contrato?: Contrato;
}
