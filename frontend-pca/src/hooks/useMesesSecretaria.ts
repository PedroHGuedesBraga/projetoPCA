// hooks/GET/useMesesSecretaria.ts
import { useEffect, useState } from "react";
import { secretariaService } from "@/services/secretaria/secretariaService";

export interface ContratosOrganizados {
  [ano: string]: {
    [mes: string]: any[]; // Aqui você pode colocar a interface de Contrato se já tiver
  };
}

export function useMesesSecretaria(secretariaId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secretariaNome, setSecretariaNome] = useState<string>("");
  const [contratosOrganizados, setContratosOrganizados] = useState<ContratosOrganizados>({});
  const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);

  useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true);
        const res = await secretariaService.getContratosOrganizados(secretariaId);
        setContratosOrganizados(res || {});

        const secretaria = await secretariaService.getById(secretariaId);
        setSecretariaNome(secretaria?.nome || "Secretaria");

        setAnoSelecionado(String(new Date().getFullYear()));
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Erro ao buscar contratos");
      } finally {
        setLoading(false);
      }
    };

    fetchContratos();
  }, [secretariaId]);

  return {
    loading,
    error,
    secretariaNome,
    contratosOrganizados,
    anoSelecionado,
    setAnoSelecionado,
  };
}
