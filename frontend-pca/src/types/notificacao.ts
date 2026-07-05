
export interface Notificacao {
  id: string;
  texto: string;
  tipo: string;
  referenciaId: string | null; // contratoId
  itemId: string | null;
  secretariaId: string | null;
  lida: boolean;
  createdAt: string;
}