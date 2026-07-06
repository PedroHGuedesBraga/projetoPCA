import { useState, useEffect, useCallback } from 'react';
import contratoEmpresaService from '@/services/contratoEmpresa/contratoEmpresaService';
import { ContratoEmpresa } from '@/types/contratoEmpresa';

export function useContratosEmpresa(empresaId: string) {
  const [contratos, setContratos] = useState<ContratoEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contratoEmpresaService.getAll(empresaId);
      setContratos(data);
    } catch {
      setError('Não foi possível carregar os contratos.');
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { contratos, loading, error, refetch: fetch };
}
