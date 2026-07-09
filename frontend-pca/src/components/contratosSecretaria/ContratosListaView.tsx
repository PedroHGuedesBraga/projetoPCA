"use client";

import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Badge } from "primereact/badge";
import { useRouter } from "next/navigation";

const fmt = (d?: string) => {
  if (!d) return "-";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  aprovado:  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e", label: "Aprovado"     },
  urgente:   { bg: "#fef2f2", text: "#b91c1c", border: "#fca5a5", dot: "#ef4444", label: "Urgente"      },
  rascunho:  { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8", label: "Rascunho"     },
  andamento: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6", label: "Em Andamento" },
};

function resolveStatus(c: any) {
  return c.aprovado ? "aprovado"
    : c.itensQuantidade === 0 || c.status === "rascunho" ? "rascunho"
    : c.status === "urgente" ? "urgente"
    : "andamento";
}

function getVencInfo(data?: string) {
  if (!data) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(data); d.setHours(0, 0, 0, 0);
  const dias = Math.ceil((d.getTime() - hoje.getTime()) / 86400000);
  if (dias < 0)   return { tipo: "vencido",  bg: "#7f1d1d", icon: "pi-exclamation-triangle", label: `Vencido há ${Math.abs(dias)}d` };
  if (dias <= 3)  return { tipo: "critico",  bg: "#dc2626", icon: "pi-clock",                label: `Vence em ${dias}d` };
  if (dias <= 30) return { tipo: "proximo",  bg: "#f97316", icon: "pi-clock",                label: `Vence em ${dias}d` };
  return           { tipo: "ok",      bg: "#16a34a", icon: "pi-calendar-clock",       label: `Vence em ${dias}d` };
}

interface ContratosListaViewProps {
  contratos: any[];
  totalCount: number;
  monthTitle: string;
  yearParam: string;
  temNotifContrato: (id: string) => boolean;
}

export default function ContratosListaView({ contratos, totalCount, monthTitle, yearParam, temNotifContrato }: ContratosListaViewProps) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <span className="text-sm text-gray-500 font-medium">
          <i className="pi pi-file-o mr-2 text-blue-500" />
          {totalCount} contrato{totalCount !== 1 ? "s" : ""} em {monthTitle}/{yearParam}
        </span>
        <div className="relative">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none z-10" />
          <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar contrato..." className="text-sm w-56 border border-gray-200 rounded-lg bg-white shadow-sm" style={{ paddingLeft: "2.25rem" }} />
        </div>
      </div>

      <style>{`
        .contratos-lista .p-datatable-tbody > tr { transition:background .15s,box-shadow .15s; }
        .contratos-lista .p-datatable-tbody > tr:hover { background:#eff6ff !important;box-shadow:inset 3px 0 0 #3b82f6; }
        .contratos-lista .p-datatable-tbody > tr:hover td:first-child { padding-left:calc(1rem - 3px); }
        .contratos-lista .p-datatable-thead > tr > th { background:#f8fafc;color:#64748b;font-size:.75rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border-bottom:2px solid #e2e8f0;border-right:1px solid #e9edf2; }
        .contratos-lista .p-datatable-thead > tr > th:last-child { border-right:none; }
        .contratos-lista .p-datatable-tbody > tr > td { border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9;padding:.875rem 1rem; }
        .contratos-lista .p-datatable-tbody > tr > td:last-child { border-right:none; }
      `}</style>

      <DataTable
        value={contratos} dataKey="id" size="normal" paginator rows={12}
        globalFilter={globalFilter} globalFilterFields={["nome", "codigoRastreio"]}
        emptyMessage={<div className="text-center py-10 text-gray-400"><i className="pi pi-inbox text-4xl mb-3 block" />Nenhum contrato encontrado</div>}
        className="contratos-lista"
        onRowClick={(e) => router.push(`/itensContrato/${e.data.id}`)}
        rowClassName={() => "cursor-pointer"}
        paginatorClassName="border-t border-gray-100 bg-gray-50"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      >
        <Column field="codigoRastreio" header="Código" sortable style={{ width: "140px" }} headerStyle={{ textAlign: "center" }} pt={{ headerContent: { style: { justifyContent: "center" } } }} bodyStyle={{ textAlign: "center" }}
          body={(c) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>{c.codigoRastreio ?? "—"}</span>}
        />
        <Column field="nome" header="Nome do Contrato" sortable
          body={(c) => (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="pi pi-file" style={{ color: "#3b82f6", fontSize: "0.9rem" }} />
                </div>
                {temNotifContrato(c.id) && <span style={{ position: "absolute", top: -3, right: -3, width: 9, height: 9, borderRadius: "50%", background: "#ef4444", border: "1.5px solid #fff" }} />}
              </div>
              <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>{c.nome}</span>
            </div>
          )}
        />
        <Column field="itensQuantidade" header="Itens" sortable style={{ width: "90px" }} headerStyle={{ textAlign: "center" }} pt={{ headerContent: { style: { justifyContent: "center" } } }} bodyStyle={{ textAlign: "center" }}
          body={(c) => <div style={{ display: "flex", justifyContent: "center" }}><Badge value={c.itensQuantidade ?? 0} severity={c.itensQuantidade > 0 ? "info" : undefined} style={c.itensQuantidade === 0 ? { background: "#9ca3af" } : {}} /></div>}
        />
        <Column header="Status" style={{ width: "190px" }} headerStyle={{ textAlign: "center" }} pt={{ headerContent: { style: { justifyContent: "center" } } }} bodyStyle={{ textAlign: "center" }}
          body={(c) => {
            const cfg = STATUS_CONFIG[resolveStatus(c)];
            const venc = getVencInfo(c.data);
            return (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, borderRadius: "999px", padding: "0.3rem 0.85rem", fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />{cfg.label}
                </span>
                {venc && !c.aprovado && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: venc.bg, color: "#fff", borderRadius: "999px", padding: "0.2rem 0.7rem", fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                    <i className={`pi ${venc.icon}`} style={{ fontSize: "0.68rem" }} />{venc.label}
                  </span>
                )}
              </div>
            );
          }}
        />
        <Column header="Datas" style={{ width: "150px" }} headerStyle={{ textAlign: "center" }} pt={{ headerContent: { style: { justifyContent: "center" } } }} bodyStyle={{ textAlign: "center" }}
          body={(c) => (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center" }}>
              {c.createdAt && <span style={{ fontSize: "0.72rem", color: "#64748b" }}><i className="pi pi-calendar-plus" style={{ fontSize: "0.65rem", marginRight: "0.25rem" }} />{fmt(c.createdAt)}</span>}
              {c.data && <span style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 600 }}><i className="pi pi-calendar-times" style={{ fontSize: "0.65rem", marginRight: "0.25rem" }} />{fmt(c.data)}</span>}
            </div>
          )}
        />
        <Column style={{ width: "50px" }} headerStyle={{ textAlign: "center" }} bodyStyle={{ textAlign: "center" }}
          body={() => <div style={{ display: "flex", justifyContent: "center" }}><i className="pi pi-chevron-right" style={{ color: "#94a3b8", fontSize: "0.9rem" }} /></div>}
        />
      </DataTable>
    </div>
  );
}
