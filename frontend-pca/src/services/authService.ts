import api from './api';

interface LoginResponse {
  token: string;
  user?: any;
  usuario?: any;
  admin?: any;
}

export const authService = {
  loginAdmin: async (cpf: string, senha: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/admin/login', { cpf, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userType', 'admin');
    localStorage.removeItem('secretariaId');
    return data;
  },

  loginUsuario: async (cpf: string, senha: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/usuario/login', { cpf, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userType', 'usuario');
    const secretariaId = data.usuario?.secretariaId || data.user?.secretariaId;
    if (secretariaId) {
      localStorage.setItem('secretariaId', secretariaId);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('secretariaId');
  },

  getToken: () => localStorage.getItem('token'),
  getUserType: () => localStorage.getItem('userType'),
  getSecretariaId: () => localStorage.getItem('secretariaId'),
  isLoggedIn: () => !!localStorage.getItem('token'),
  isAdmin: () => localStorage.getItem('userType') === 'admin',
};
