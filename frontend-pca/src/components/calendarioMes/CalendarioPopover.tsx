"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const MESES_NOMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

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

interface CalendarioPopoverProps {
  day: number;
  mes: number;
  contratos: any[];
  x: number;
  y: number;
  onClose: () => void;
}

export default function CalendarioPopover({ day, mes, contratos, x, y, onClose }: CalendarioPopoverProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const margin = 10;
    if (rect.bottom > window.innerHeight - margin) {
      ref.current.style.top = `${y - (rect.bottom - window.innerHeight + margin)}px`;
    }
  }, [y]);

  return (
    <div ref={ref} style={{ position: "fixed", top: y, left: x, zIndex: 999, background: "#fff", borderRadius: "14px", boxShadow: "0 8px 30px rgba(0,0,0,0.14)", border: "1px solid #e2e8f0", padding: "0.75rem", minWidth: "220px", maxWidth: "280px" }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
        {day} de {MESES_NOMES[mes - 1]} — {contratos.length} contratos
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {contratos.map((c: any) => {
          const col = STATUS_COLOR[resolveStatus(c)];
          return (
            <div key={c.id} onClick={() => { onClose(); router.push(`/itensContrato/${c.id}`); }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: col.bg, border: `1px solid ${col.border}`, borderRadius: "8px", padding: "0.4rem 0.65rem", fontSize: "0.78rem", fontWeight: 600, color: col.text, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.8"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />{c.nome}
            </div>
          );
        })}
      </div>
    </div>
  );
}
