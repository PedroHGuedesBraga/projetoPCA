import notificacaoApi from "./notificacaoApi";

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

export const notificacaoService = {
  listar: async (): Promise<Notificacao[]> => {
    const res = await notificacaoApi.get<Notificacao[]>("/notificacoes");
    return res.data;
  },
  marcarLida: async (id: string): Promise<void> => {
    await notificacaoApi.patch(`/notificacoes/${id}/lida`);
  },
  marcarTodasLidas: async (): Promise<void> => {
    await notificacaoApi.patch("/notificacoes/lidas-todas");
  },

  // Admin
  listarAdmin: async (): Promise<Notificacao[]> => {
    const res = await notificacaoApi.get<Notificacao[]>("/notificacoes/admin");
    return res.data;
  },
  marcarLidaAdmin: async (id: string): Promise<void> => {
    await notificacaoApi.patch(`/notificacoes/admin/${id}/lida`);
  },
  marcarTodasLidasAdmin: async (): Promise<void> => {
    await notificacaoApi.patch("/notificacoes/admin/lidas-todas");
  },
};
