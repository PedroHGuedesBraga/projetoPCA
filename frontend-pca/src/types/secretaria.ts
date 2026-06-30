import type { Contrato } from './contrato';
import type { Usuario } from './usuario';

export interface Secretaria {
  id: string;
  nome: string;
  contratos?: Contrato[];
  usuarios?: Usuario[];
}
