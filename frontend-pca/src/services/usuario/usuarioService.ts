import api from '@/services/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  cargo: string;
  secretariaId: string;
  Secretaria?: { nome: string };
}

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>('/usuario');
    return data;
  },

  create: async (payload: {
    nome: string;
    email: string;
    cpf: string;
    senha: string;
    cargo: string;
    secretariaId: string;
  }): Promise<Usuario> => {
    const { data } = await api.post<any>('/usuario', payload);
    return data.usuario || data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/usuario/${id}`);
  },
};
