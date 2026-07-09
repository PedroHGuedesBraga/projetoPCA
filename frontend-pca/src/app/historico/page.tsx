"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { contratoService } from "@/services/contrato/contratoService";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import HistoricoHeader from "@/components/historico/HistoricoHeader";
import HistoricoFiltros from "@/components/historico/HistoricoFiltros";
import HistoricoTable from "@/components/historico/HistoricoTable";

export default function HistoricoPage() {
  useRouteGuard("admin");
  const router = useRouter();
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroSecretaria, setFiltroSecretaria] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroAno, setFiltroAno] = useState<number | null>(null);

  useEffect(() => {
    contratoService.getAll().then((data) => { setContratos(data); setLoading(false); });
  }, []);

  const secretarias = useMemo(() => {
    const map = new Map<string, string>();
    contratos.forEach((c) => { if (c.secretaria) map.set(c.secretaria.id, c.secretaria.nome); });
    return Array.from(map.entries()).map(([id, nome]) => ({ label: nome, value: id }));
  }, [contratos]);

  const anos = useMemo(() => {
    const set = new Set<number>();
    contratos.forEach((c) => { if (c.createdAt) set.add(new Date(c.createdAt).getFullYear()); });
    return Array.from(set).sort((a, b) => b - a).map((a) => ({ label: String(a), value: a }));
  }, [contratos]);

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase();
    return contratos.filter((c) => {
      if (busca && !c.nome?.toLowerCase().includes(q) && !c.codigoRastreio?.toLowerCase().includes(q)) return false;
      if (filtroSecretaria && c.secretariaId !== filtroSecretaria) return false;
      if (filtroAno && c.createdAt && new Date(c.createdAt).getFullYear() !== filtroAno) return false;
      if (filtroStatus) {
        const st = c.aprovado ? "aprovado" : c.itensQuantidade === 0 || c.status === "rascunho" ? "rascunho" : c.status === "urgente" ? "urgente" : "andamento";
        if (st !== filtroStatus) return false;
      }
      return true;
    });
  }, [contratos, busca, filtroSecretaria, filtroStatus, filtroAno]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><ProgressSpinner /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-5">
      <div className="w-full max-w-7xl mx-auto">
        <HistoricoHeader totalFiltrados={filtrados.length} onBack={() => router.back()} />
        <HistoricoFiltros
          busca={busca} onBuscaChange={setBusca}
          filtroSecretaria={filtroSecretaria} onFiltroSecretariaChange={setFiltroSecretaria}
          filtroStatus={filtroStatus} onFiltroStatusChange={setFiltroStatus}
          filtroAno={filtroAno} onFiltroAnoChange={setFiltroAno}
          secretarias={secretarias} anos={anos}
        />
        <HistoricoTable contratos={filtrados} />
      </div>
    </div>
  );
}
