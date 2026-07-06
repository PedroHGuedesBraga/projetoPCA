export interface DescontoItem {
  id: string;
  motivo: string;
  valor: number;
  dataEnvio: string;
}

export interface DescontoEmpresaResponse {
  contratoEmpresaId: string;
  totalDescontos: number;
  valorTotalDescontos: number;
  descontos: DescontoItem[];
}
