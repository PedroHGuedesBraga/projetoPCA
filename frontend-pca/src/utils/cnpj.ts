export const somenteNumeros = (valor: string): string => {
  return valor.replace(/\D/g, "");
};

export const validarCNPJ = (cnpj: string): boolean => {
  cnpj = somenteNumeros(cnpj);

  if (cnpj.length !== 14) return false;

  // elimina CNPJs do tipo 11111111111111
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = 12;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);

  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  if (resultado !== Number(digitos.charAt(0))) return false;

  tamanho = 13;
  numeros = cnpj.substring(0, tamanho);

  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  return resultado === Number(digitos.charAt(1));
};