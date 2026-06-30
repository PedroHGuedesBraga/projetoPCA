import api from '@/services/api';
import  {Contrato}  from "@/types/contrato";

export const contratoService = {
  getById: async (id: string): Promise<Contrato> => {
    const res = await api.get<Contrato>(`/contrato/${id}`);
    return res.data;
  },

  getAll: async (): Promise<Contrato[]> => {
    const res = await api.get<Contrato[]>(`/contrato`);
    return res.data;
  },

  create: async (payload: Partial<Contrato>): Promise<Contrato> => {
    const res = await api.post<Contrato>(`/contrato`, payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<Contrato>): Promise<Contrato> => {
    const res = await api.put<Contrato>(`/contrato/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contrato/${id}`);
  },
  getItensByContrato: async (contratoId: string) => {
    const res = await api.get(`/contrato/${contratoId}/itens`);
    return res.data;
  },

  mudarMes: async (id: string, payload: { data: string; justificativa: string }): Promise<Contrato> => {
    const res = await api.patch<Contrato>(`/contrato/${id}/mudar-mes`, payload);
    return res.data;
  },

  clonarAno: async (secretariaId: string, anoOrigem: number): Promise<{ clonados: number; anoDestino: number }> => {
    const res = await api.post('/contrato/clonar-ano', { secretariaId, anoOrigem });
    return res.data;
  },
};
