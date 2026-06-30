"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";

import { planoAnualService, SecretariaPlano } from "@/services/planoAnual/planoAnualService";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { authService } from "@/services/authService";

// Subcomponentes
import { Header } from "./components/Header";
import { YearSelector } from "./components/YearSelector";
import { SecretariaCard } from "./components/SecretariaCard";

// Utilitários de exportação
import { handleExportExcel } from "./utils/exportExcel";
import { handleExportPDF } from "./utils/exportDoc";

// Constantes estruturais
const fmtDate = (d: string) => {
  if (!d) return "-";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
};

const STATUS_LABEL: Record<string, string> = {
  aprovado: "Aprovado", andamento: "Em Andamento", urgente: "Urgente", rascunho: "Rascunho",
};

const STATUS_COLOR: Record<string, string> = {
  aprovado: "#15803d", andamento: "#1d4ed8", urgente: "#b91c1c", rascunho: "#64748b",
};

export default function PlanoAnualPage() {
  useRouteGuard("admin");
  const router = useRouter();
  const toastRef = useRef<Toast>(null);
  
  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(anoAtual);
  const [dados, setDados] = useState<SecretariaPlano[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

 useEffect(() => {
  if (!authService.isAdmin()) {
    router.push("/");
  }
}, [router]); // Adicionado router como dependência para limpar o warning

  useEffect(() => {
    setLoading(true);
    planoAnualService.getByAno(ano)
      .then(d => { 
        setDados(d); 
        setExpandidas(new Set(d.map(s => s.id))); 
      })
      .catch(() => 
        toastRef.current?.show({ 
          severity: "error", 
          summary: "Erro", 
          detail: "Não foi possível carregar o plano.", 
          life: 3000 
        })
      )
      .finally(() => setLoading(false));
  }, [ano]);

  const toggleSecretaria = (id: string) =>
    setExpandidas(prev => { 
      const n = new Set(prev); 
      n.has(id) ? n.delete(id) : n.add(id); 
      return n; 
    });

  const totalItens = dados.reduce((s, sec) => s + sec.contratos.reduce((cs, c) => cs + (c.Items?.length || 0), 0), 0);
  const totalContratos = dados.reduce((s, sec) => s + sec.contratos.length, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-5">
      <Toast ref={toastRef} position="top-right" />

      <div className="w-full max-w-6xl mx-auto">
        <Header 
          onExportExcel={() => handleExportExcel({ ano, dados, toast: toastRef, fmtDate, STATUS_LABEL })}
          onExportDoc={() => handleExportPDF({ ano, dados, totalContratos, totalItens, toast: toastRef, fmtDate, STATUS_LABEL, STATUS_COLOR })}
        />

        <YearSelector 
          ano={ano} 
          setAno={setAno} 
          loading={loading} 
          totalSecretarias={dados.length} 
          totalContratos={totalContratos} 
          totalItens={totalItens} 
        />

        {loading && (
          <div className="flex justify-center items-center py-20">
            <ProgressSpinner />
          </div>
        )}

        {!loading && dados.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <i className="pi pi-inbox text-4xl mb-3 block" />
            <p className="font-semibold">Nenhum contrato encontrado para {ano}</p>
          </div>
        )}

        {!loading && dados.map(sec => (
          <SecretariaCard 
            key={sec.id}
            sec={sec}
            aberta={expandidas.has(sec.id)}
            onToggle={() => toggleSecretaria(sec.id)}
            fmtDate={fmtDate}
            STATUS_LABEL={STATUS_LABEL}
            STATUS_COLOR={STATUS_COLOR}
          />
        ))}
      </div>
    </div>
  );
}