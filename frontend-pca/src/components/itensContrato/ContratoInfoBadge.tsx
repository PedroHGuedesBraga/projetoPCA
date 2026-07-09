interface ContratoInfoBadgeProps {
  nome: string;
  codigoRastreio?: string;
  justificativa?: string;
}

export default function ContratoInfoBadge({ nome, codigoRastreio, justificativa }: ContratoInfoBadgeProps) {
  return (
    <div className="mb-5 mt-6" style={{ display: "inline-block", border: "1.5px solid #cbd5e1", borderRadius: "14px", padding: "0.55rem 1.2rem", background: "#fff", maxWidth: "100%" }}>
      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.15rem" }}>Contrato</span>
      <span style={{ display: "block", fontSize: "1rem", fontWeight: 700, color: "#1e293b", wordBreak: "break-word" }}>{nome}</span>
      {codigoRastreio && (
        <span style={{ display: "block", fontSize: "0.72rem", fontFamily: "monospace", color: "#94a3b8", marginTop: "0.1rem" }}>{codigoRastreio}</span>
      )}
      {justificativa && (
        <span style={{ display: "block", fontSize: "0.75rem", color: "#7c3aed", marginTop: "0.35rem", fontStyle: "italic" }}>
          <i className="pi pi-calendar mr-1" style={{ fontSize: "0.7rem" }} />Justificativa: {justificativa}
        </span>
      )}
    </div>
  );
}
