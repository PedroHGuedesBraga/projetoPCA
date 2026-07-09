"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge } from "primereact/badge";
import { useRouter } from "next/navigation";

const fmtData = (d?: string) => {
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

const VENC_STYLE: Record<string, { bg: string; icon: string }> = {
  ok:      { bg: "#16a34a", icon: "pi-calendar-clock"       },
  proximo: { bg: "#f97316", icon: "pi-clock"                },
  critico: { bg: "#dc2626", icon: "pi-clock"                },
  vencido: { bg: "#7f1d1d", icon: "pi-exclamation-triangle" },
};

function getVencInfo(data?: string): { tipo: string | null; label: string } {
  if (!data) return { tipo: null, label: "" };
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(data); d.setHours(0, 0, 0, 0);
  const dias = Math.ceil((d.getTime() - hoje.getTime()) / 86400000);
  if (dias < 0)   return { tipo: "vencido",  label: `Vencido há ${Math.abs(dias)}d` };
  if (dias <= 3)  return { tipo: "critico",  label: `Vence em ${dias}d` };
  if (dias <= 30) return { tipo: "proximo",  label: `Vence em ${dias}d` };
  return { tipo: "ok", label: `Vence em ${dias}d` };
}

function resolveStatus(c: any) {
  return c.aprovado ? "aprovado"
    : c.itensQuantidade === 0 || c.status === "rascunho" ? "rascunho"
    : c.status === "urgente" ? "urgente"
    : "andamento";
}

interface HistoricoTableProps {
  contratos: any[];
}

export default function HistoricoTable({ contratos }: HistoricoTableProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <style>{`
        .historico-table .p-datatable-thead > tr > th { background:#f8fafc;color:#64748b;font-size:.75rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border-bottom:2px solid #e2e8f0;border-right:1px solid #e9edf2; }
        .historico-table .p-datatable-thead > tr > th:last-child { border-right:none; }
        .historico-table .p-datatable-tbody > tr > td { border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9;padding:.875rem 1rem; }
        .historico-table .p-datatable-tbody > tr > td:last-child { border-right:none; }
        .historico-table .p-datatable-tbody > tr { cursor:pointer;transition:background .15s; }
        .historico-table .p-datatable-tbody > tr:hover td { background:#f8fafc; }
      `}</style>
      <DataTable
        value={contratos}
        dataKey="id"
        className="historico-table"
        emptyMessage="Nenhum contrato encontrado."
        onRowClick={(e) => router.push(`/itensContrato/${e.data.id}`)}
        paginator
        rows={15}
        rowsPerPageOptions={[15, 30, 50]}
      >
        <Column field="codigoRastreio" header="Código" sortable style={{ width: 150 }}
          pt={{ headerContent: { style: { justifyContent: "center" } } }}
          headerStyle={{ textAlign: "center" }} bodyStyle={{ textAlign: "center" }}
          body={(c) => <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>{c.codigoRastreio ?? "—"}</span>}
        />
        <Column header="Secretaria" sortable field="secretaria.nome" style={{ width: 200 }}
          body={(c) => <span style={{ fontSize: "0.88rem", color: "#1e293b", fontWeight: 500 }}>{c.secretaria?.nome ?? "—"}</span>}
        />
        <Column field="nome" header="Nome do Contrato" sortable
          body={(c) => <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}>{c.nome}</span>}
        />
        <Column field="itensQuantidade" header="Itens" sortable style={{ width: 80 }}
          pt={{ headerContent: { style: { justifyContent: "center" } } }}
          headerStyle={{ textAlign: "center" }} bodyStyle={{ textAlign: "center" }}
          body={(c) => (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Badge value={c.itensQuantidade ?? 0} severity={c.itensQuantidade > 0 ? "info" : undefined} style={c.itensQuantidade === 0 ? { background: "#9ca3af" } : {}} />
            </div>
          )}
        />
        <Column header="Status" style={{ width: 190 }}
          pt={{ headerContent: { style: { justifyContent: "center" } } }}
          headerStyle={{ textAlign: "center" }} bodyStyle={{ textAlign: "center" }}
          body={(c) => {
            const cfg = STATUS_CONFIG[resolveStatus(c)];
            const venc = getVencInfo(c.data);
            return (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, borderRadius: "999px", padding: "0.3rem 0.85rem", fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot }} />
                  {cfg.label}
                </span>
                {venc.tipo && !c.aprovado && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: VENC_STYLE[venc.tipo].bg, color: "#fff", borderRadius: "999px", padding: "0.2rem 0.7rem", fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                    <i className={`pi ${VENC_STYLE[venc.tipo].icon}`} style={{ fontSize: "0.68rem" }} />
                    {venc.label}
                  </span>
                )}
              </div>
            );
          }}
        />
        <Column header="Datas" style={{ width: 140 }}
          pt={{ headerContent: { style: { justifyContent: "center" } } }}
          headerStyle={{ textAlign: "center" }} bodyStyle={{ textAlign: "center" }}
          body={(c) => (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
              {c.createdAt && <span style={{ fontSize: "0.72rem", color: "#64748b" }}><i className="pi pi-calendar-plus" style={{ fontSize: "0.65rem", marginRight: "0.25rem" }} />{fmtData(c.createdAt)}</span>}
              {c.data && <span style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 600 }}><i className="pi pi-calendar-times" style={{ fontSize: "0.65rem", marginRight: "0.25rem" }} />{fmtData(c.data)}</span>}
            </div>
          )}
        />
        <Column style={{ width: 50 }} bodyStyle={{ textAlign: "center" }}
          body={() => <i className="pi pi-chevron-right" style={{ color: "#94a3b8", fontSize: "0.9rem" }} />}
        />
      </DataTable>
    </div>
  );
}
