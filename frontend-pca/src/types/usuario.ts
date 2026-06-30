import type { Secretaria } from './secretaria';

export type CargoUsuario = 'gerente' | 'usuario';

export interface Usuario {
  id: string;
  cpf: string;
  nome: string;
  email: string;
  senha: string;
  cargo: CargoUsuario;
  secretariaId?: string | null;
  secretaria?: Secretaria;
}
