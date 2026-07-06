import api from '@/services/api';
import { DescontoEmpresaResponse } from '@/types/descontoEmpresa';

interface CreateDescontoPayload {
  contratoEmpresaId: string;
  motivoDesconto: string;
  valorDesconto: number;
  dataEnvio: string;
}

const descontoEmpresaService = {
  getAll: async (contratoEmpresaId: string): Promise<DescontoEmpresaResponse> => {
    const res = await api.get(`/descontoEmpresa/${contratoEmpresaId}`);
    return res.data;
  },

  create: async (payload: CreateDescontoPayload): Promise<void> => {
    await api.post('/descontoEmpresa', payload);
  },
};

export default descontoEmpresaService;
