"use client";

import { useRouter } from "next/navigation";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  aprovado:  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  urgente:   { bg: "#fef2f2", text: "#b91c1c", border: "#fca5a5", dot: "#ef4444" },
  rascunho:  { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
  andamento: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
};

function resolveStatus(c: any) {
  return c.aprovado ? "aprovado"
    : c.itensQuantidade === 0 || c.status === "rascunho" ? "rascunho"
    : c.status === "urgente" ? "urgente"
    : "andamento";
}

interface CalendarioGridProps {
  ano: number;
  mes: number;
  contratosPorDia: Record<number, any[]>;
  onDayClick: (day: number) => void;
  onShowPopover: (day: number, contratos: any[], x: number, y: number) => void;
}

export default function CalendarioGrid({ ano, mes, contratosPorDia, onDayClick, onShowPopover }: CalendarioGridProps) {
  const router = useRouter();
  const primeiroDia = new Date(ano, mes - 1, 1).getDay();
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const hoje = new Date();
  const ehHoje = (day: number) => day === hoje.getDate() && mes === hoje.getMonth() + 1 && ano === hoje.getFullYear();
  const totalCells = Math.ceil((primeiroDia + diasNoMes) / 7) * 7;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ padding: "0.75rem 0", textAlign: "center", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: d === "Dom" || d === "Sáb" ? "#94a3b8" : "#64748b", textTransform: "uppercase", borderBottom: "2px solid #f1f5f9", background: "#f8fafc" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {Array.from({ length: totalCells }).map((_, idx) => {
          const day = idx - primeiroDia + 1;
          const valid = day >= 1 && day <= diasNoMes;
          const contratos = valid ? (contratosPorDia[day] ?? []) : [];
          const isToday = valid && ehHoje(day);
          const isFds = idx % 7 === 0 || idx % 7 === 6;

          return (
            <div key={idx} onClick={() => valid && onDayClick(day)}
              style={{ minHeight: "120px", borderRight: idx % 7 !== 6 ? "1px solid #f1f5f9" : "none", borderBottom: "1px solid #f1f5f9", padding: "0.5rem", background: !valid ? "#fafafa" : isFds ? "#fdfcff" : "#fff", cursor: valid ? "pointer" : "default", transition: "background 0.12s", position: "relative" }}
              onMouseEnter={e => { if (valid) (e.currentTarget as HTMLDivElement).style.background = "#f0f7ff"; }}
              onMouseLeave={e => { if (valid) (e.currentTarget as HTMLDivElement).style.background = !valid ? "#fafafa" : isFds ? "#fdfcff" : "#fff"; }}
            >
              {valid && (
                <>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", marginBottom: "0.35rem", background: isToday ? "#1d4ed8" : "transparent", color: isToday ? "#fff" : isFds ? "#94a3b8" : "#374151", fontSize: "0.82rem", fontWeight: isToday ? 700 : 500 }}>
                    {day}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    {contratos.slice(0, 2).map((c: any) => {
                      const col = STATUS_COLOR[resolveStatus(c)];
                      return (
                        <div key={c.id} onClick={e => { e.stopPropagation(); router.push(`/itensContrato/${c.id}`); }}
                          style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: col.bg, border: `1px solid ${col.border}`, borderRadius: "6px", padding: "0.2rem 0.45rem", fontSize: "0.68rem", fontWeight: 600, color: col.text, cursor: "pointer", overflow: "hidden", maxWidth: "100%" }}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.8"}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                          title={c.nome}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nome}</span>
                        </div>
                      );
                    })}
                    {contratos.length > 2 && (
                      <button onClick={e => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                        const pw = 288; const margin = 10;
                        let x = rect.left; let y = rect.bottom + 6;
                        if (x + pw + margin > window.innerWidth) x = window.innerWidth - pw - margin;
                        if (x < margin) x = margin;
                        onShowPopover(day, contratos, x, y);
                      }}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "0.2rem 0.45rem", fontSize: "0.65rem", fontWeight: 700, color: "#475569", cursor: "pointer", width: "100%" }}
                      >
                        <i className="pi pi-ellipsis-h" style={{ fontSize: "0.6rem" }} />+{contratos.length - 2} mais
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
