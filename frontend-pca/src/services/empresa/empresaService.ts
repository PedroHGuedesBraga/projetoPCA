import api from '@/services/api';
import { Empresa } from '@/types/empresa';

const empresaService = {
  getAll: async (): Promise<Empresa[]> => {
    const res = await api.get('/empresa');
    return res.data;
  },

  getById: async (id: string): Promise<Empresa> => {
    const res = await api.get(`/empresa/${id}`);
    return res.data;
  },

  create: async (cnpj: string, nome: string): Promise<Empresa> => {
    const res = await api.post('/empresa', { cnpj, nome });
    return res.data;
  },
};

export default empresaService;
