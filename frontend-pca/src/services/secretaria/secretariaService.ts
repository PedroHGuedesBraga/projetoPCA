import api from '@/services/api';
import { Secretaria } from '@/types/secretaria';
import { ContratoOrganizadoResponse } from "@/types/ContratoTypes";
export const secretariaService = {
  getAll: async (): Promise<Secretaria[]> => {
    const { data } = await api.get<Secretaria[]>('/secretaria');
    return data;
  },

  getById: async (id: string): Promise<Secretaria> => {
    const { data } = await api.get<Secretaria>(`/secretaria/${id}`);
    return data;
  },

  create: async (payload: Partial<Secretaria>): Promise<Secretaria> => {
    const { data } = await api.post<Secretaria>('/secretaria', payload);
    return data;
  },

  update: async (id: string, payload: Partial<Secretaria>): Promise<Secretaria> => {
    const { data } = await api.put<Secretaria>(`/secretaria/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/secretaria/${id}`);
  },
  getContratosOrganizados: async (id: string): Promise<ContratoOrganizadoResponse> => {
    const res = await api.get<ContratoOrganizadoResponse>(`/secretaria/${id}/contratos-organizados`);
    return res.data;
  },
};
