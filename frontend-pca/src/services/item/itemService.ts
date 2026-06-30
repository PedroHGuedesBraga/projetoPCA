import  api  from "../api";
import { Item } from "@/types/item";

export const itemService = {
  getById: async (id: string): Promise<Item> => {
    const res = await api.get<Item>(`/item/${id}`);
    return res.data;
  },

  getAll: async (): Promise<Item[]> => {
    const res = await api.get<Item[]>(`/item`);
    return res.data;
  },

  create: async (payload: Partial<Item>): Promise<Item> => {
    const res = await api.post<Item>(`/item`, payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<Item>): Promise<Item> => {
    const res = await api.put<Item>(`/item/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/item/${id}`);
  },

  toggleAprovado: async (id: string, aprovado: boolean): Promise<Item> => {
    const res = await api.patch<Item>(`/item/${id}/aprovado`, { aprovado });
    return res.data;
  },

  aprovarTodos: async (contratoId: string): Promise<void> => {
    await api.patch(`/item/contrato/${contratoId}/aprovar-todos`);
  },
};
