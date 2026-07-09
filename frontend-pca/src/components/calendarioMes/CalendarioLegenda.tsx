const STATUS_LEGENDA = [
  { key: "aprovado",  dot: "#22c55e", label: "Aprovado"     },
  { key: "urgente",   dot: "#ef4444", label: "Urgente"      },
  { key: "rascunho",  dot: "#94a3b8", label: "Rascunho"     },
  { key: "andamento", dot: "#3b82f6", label: "Em Andamento" },
];

export default function CalendarioLegenda() {
  return (
    <div className="flex gap-4 mt-4 justify-end flex-wrap">
      {STATUS_LEGENDA.map(({ key, dot, label }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#64748b" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
          {label}
        </div>
      ))}
    </div>
  );
}
