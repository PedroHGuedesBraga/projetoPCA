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
    localStorage.setItem('userName', data.admin?.nome || '');
    localStorage.removeItem('secretariaId');
    return data;
  },

  loginUsuario: async (cpf: string, senha: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/usuario/login', { cpf, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userType', 'usuario');
    localStorage.setItem('userName', data.usuario?.nome || data.user?.nome || '');
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
    localStorage.removeItem('userName');
  },

  getToken: () => localStorage.getItem('token'),
  getUserType: () => localStorage.getItem('userType'),
  getSecretariaId: () => localStorage.getItem('secretariaId'),
  getUserName: () => localStorage.getItem('userName') || '',
  isLoggedIn: () => !!localStorage.getItem('token'),
  isAdmin: () => localStorage.getItem('userType') === 'admin',
};
