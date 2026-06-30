import api from "../api";

export interface Comentario {
  id: string;
  itemId: string;
  texto: string;
  autorTipo: "admin" | "usuario";
  autorId: string;
  createdAt: string;
}

export const comentarioItemService = {
  listar: async (itemId: string): Promise<Comentario[]> => {
    const res = await api.get<Comentario[]>(`/item/${itemId}/comentarios`);
    return res.data;
  },

  criar: async (itemId: string, texto: string): Promise<Comentario> => {
    const res = await api.post<Comentario>(`/item/${itemId}/comentarios`, { texto });
    return res.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/item/comentarios/${id}`);
  },
};
