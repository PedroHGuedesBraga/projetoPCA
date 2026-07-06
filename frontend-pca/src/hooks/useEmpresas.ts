import { useState, useEffect, useCallback } from 'react';
import empresaService from '@/services/empresa/empresaService';
import { Empresa } from '@/types/empresa';

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await empresaService.getAll();
      setEmpresas(data);
    } catch {
      setError('Não foi possível carregar as empresas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { empresas, loading, error, refetch: fetch };
}
