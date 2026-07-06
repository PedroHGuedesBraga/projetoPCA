export const formatDate = (date: string | Date): string => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
