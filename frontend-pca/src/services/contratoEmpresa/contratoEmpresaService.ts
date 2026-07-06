import api from '@/services/api';
import { ContratoEmpresa } from '@/types/contratoEmpresa';

interface CreateContratoPayload {
  empresaId: string;
  nomeContrato: string;
  valorContrato: number;
  dataInicioContrato: string;
  dataTerminoContrato: string;
}

const contratoEmpresaService = {
  getAll: async (empresaId: string): Promise<ContratoEmpresa[]> => {
    const res = await api.get(`/contratoEmpresa/${empresaId}`);
    return res.data;
  },

  getById: async (contratoId: string): Promise<ContratoEmpresa> => {
    const res = await api.get(`/contratoEmpresa/contratoUnico/${contratoId}`);
    return res.data;
  },

  create: async (payload: CreateContratoPayload): Promise<ContratoEmpresa> => {
    const res = await api.post('/contratoEmpresa', payload);
    return res.data;
  },
};

export default contratoEmpresaService;
