"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { secretariaService } from "@/services/secretaria/secretariaService";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useNotificacao } from "@/context/NotificacaoContext";
import ContratosSecretariaHeader from "@/components/contratosSecretaria/ContratosSecretariaHeader";
import ContratosCardsView from "@/components/contratosSecretaria/ContratosCardsView";
import ContratosListaView from "@/components/contratosSecretaria/ContratosListaView";

const MONTH_NAMES: Record<string, string> = {
  "01": "Janeiro",  "02": "Fevereiro", "03": "Março",    "04": "Abril",
  "05": "Maio",     "06": "Junho",     "07": "Julho",    "08": "Agosto",
  "09": "Setembro", "10": "Outubro",   "11": "Novembro", "12": "Dezembro",
};

export default function ContratosSecretariaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const secretariaId = params.secretariaId as string;
  const yearParam = searchParams.get("year") || "";
  const monthParam = searchParams.get("month") || "";

  useRouteGuard("any", secretariaId);
  const { temNotifContrato } = useNotificacao();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [secretariaNome, setSecretariaNome] = React.useState("");
  const [contratosFiltrados, setContratosFiltrados] = React.useState<any[]>([]);
  const [viewMode, setViewMode] = React.useState<"cards" | "lista">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("contratosViewMode") as "cards" | "lista") || "cards";
    return "cards";
  });

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const contratosPriorizados = React.useMemo(() => {
    const calcPrioridade = (c: any): number => {
      if (c.aprovado) return 7;
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      const d = new Date(c.data); d.setHours(0, 0, 0, 0);
      const dias = Math.ceil((d.getTime() - hoje.getTime()) / 86400000);
      if (dias < 0) return 0;
      if (c.status === "urgente") return 1;
      if (dias <= 3) return 2;
      if (dias <= 30) return 3;
      if (c.status === "andamento") return 4;
      if (c.status === "rascunho") return 5;
      return 6;
    };
    return [...contratosFiltrados].sort((a, b) => {
      const diff = calcPrioridade(a) - calcPrioridade(b);
      return diff !== 0 ? diff : new Date(a.data).getTime() - new Date(b.data).getTime();
    });
  }, [contratosFiltrados]);

  React.useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true);
        const res = await secretariaService.getContratosOrganizados(secretariaId);
        const secretaria = await secretariaService.getById(secretariaId);
        setSecretariaNome(secretaria?.nome || "Secretaria");
        setContratosFiltrados(res[yearParam]?.[monthParam] || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Erro ao buscar contratos");
      } finally {
        setLoading(false);
      }
    };
    if (yearParam && monthParam) fetchContratos();
    else { setContratosFiltrados([]); setLoading(false); }
  }, [secretariaId, yearParam, monthParam]);

  const handleViewModeChange = (mode: "cards" | "lista") => {
    setViewMode(mode);
    localStorage.setItem("contratosViewMode", mode);
  };

  const monthTitle = MONTH_NAMES[monthParam] || "Mês Desconhecido";

  if (loading) return <div className="flex justify-content-center align-items-center min-h-screen"><ProgressSpinner /></div>;
  if (error) return <p className="text-red-500 p-5">Erro: {error}</p>;
  if (!secretariaNome && contratosFiltrados.length === 0) return <p className="p-5">Secretaria não encontrada ou não há contratos neste período</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-5">
      <div className="w-full max-w-6xl mx-auto">
        <ContratosSecretariaHeader
          secretariaNome={secretariaNome}
          secretariaId={secretariaId}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
        {contratosFiltrados.length === 0 ? (
          <div className="text-center p-5 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-700">Não há contratos para <strong>{monthTitle}</strong> de <strong>{yearParam}</strong>.</p>
          </div>
        ) : viewMode === "cards" ? (
          <ContratosCardsView contratos={contratosPriorizados} temNotifContrato={temNotifContrato} />
        ) : (
          <ContratosListaView
            contratos={contratosPriorizados}
            totalCount={contratosFiltrados.length}
            monthTitle={monthTitle}
            yearParam={yearParam}
            temNotifContrato={temNotifContrato}
          />
        )}
      </div>
    </div>
  );
}
