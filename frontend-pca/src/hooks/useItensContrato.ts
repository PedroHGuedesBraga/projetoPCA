import { useState, useEffect } from "react";
import { contratoService } from "@/services/contrato/contratoService";
import { Contrato } from "@/types/contrato";
import { Item } from "@/types/item";

export default function useItensContrato(contratoId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [itens, setItens] = useState<Item[]>([]);

  const fetchItens = async () => {
    try {
      setLoading(true);
      const res = await contratoService.getItensByContrato(contratoId);

      // Como o 'res' já é o objeto do contrato:
      setContrato(res);
      // Como a lista de itens está na chave 'itens':
      setItens(res.itens || []);

      setError(null);
    } catch (err: any) {
      // ... erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItens();
  }, [contratoId]);

  return { contrato, itens, loading, error, fetchItens };
}
