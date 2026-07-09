import ContratoCard from "@/components/cards/ContratoCard";

function resolveStatus(c: any) {
  return c.aprovado ? "aprovado"
    : c.itensQuantidade === 0 || c.status === "rascunho" ? "rascunho"
    : c.status === "urgente" ? "urgente"
    : "andamento";
}

interface ContratosCardsViewProps {
  contratos: any[];
  temNotifContrato: (id: string) => boolean;
}

export default function ContratosCardsView({ contratos, temNotifContrato }: ContratosCardsViewProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
      {contratos.map((c) => (
        <ContratoCard
          key={c.id}
          contratoId={c.id}
          contratoNome={c.nome}
          itemCount={c.itensQuantidade}
          codigoRastreio={c.codigoRastreio}
          hasNotif={temNotifContrato(c.id)}
          data={c.data}
          createdAt={c.createdAt}
          aprovado={c.aprovado}
          status={resolveStatus(c)}
        />
      ))}
    </div>
  );
}
