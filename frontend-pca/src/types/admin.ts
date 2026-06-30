export interface Admin {
  id: string;
  cpf: string;
  nome: string;
  email: string;
  senha: string;
  cargo: string; // normalmente "admin"
}
