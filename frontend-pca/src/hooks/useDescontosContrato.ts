import { useState, useEffect, useCallback } from 'react';
import contratoEmpresaService from '@/services/contratoEmpresa/contratoEmpresaService';
import descontoEmpresaService from '@/services/descontoEmpresa/descontoEmpresaService';
import { ContratoEmpresa } from '@/types/contratoEmpresa';
import { DescontoEmpresaResponse } from '@/types/descontoEmpresa';

export function useDescontosContrato(contratoId: string) {
  const [contrato, setContrato] = useState<ContratoEmpresa | null>(null);
  const [descontos, setDescontos] = useState<DescontoEmpresaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [contratoData, descontosData] = await Promise.all([
        contratoEmpresaService.getById(contratoId),
        descontoEmpresaService.getAll(contratoId),
      ]);
      setContrato(contratoData);
      setDescontos(descontosData);
    } catch {
      setError('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [contratoId]);

  useEffect(() => { fetch(); }, [fetch]);

  const saldo = contrato && descontos
    ? contrato.valorContrato - descontos.valorTotalDescontos
    : null;

  return { contrato, descontos, loading, error, saldo, refetch: fetch };
}
