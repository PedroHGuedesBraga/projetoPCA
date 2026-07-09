import MesesCard from "@/components/cards/MesesCard";

const MESES_NOMES: Record<string, string> = {
  "01": "Janeiro",  "02": "Fevereiro", "03": "Março",    "04": "Abril",
  "05": "Maio",     "06": "Junho",     "07": "Julho",    "08": "Agosto",
  "09": "Setembro", "10": "Outubro",   "11": "Novembro", "12": "Dezembro",
};

const MESES = ["01","02","03","04","05","06","07","08","09","10","11","12"];

interface MesesGridProps {
  anoSelecionado: string;
  contratosOrganizados: Record<string, any>;
  temNotifContrato: (id: string) => boolean;
  onMonthClick: (ano: string, mes: string) => void;
}

export default function MesesGrid({ anoSelecionado, contratosOrganizados, temNotifContrato, onMonthClick }: MesesGridProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
      {MESES.map((mes) => {
        const contratos: any[] = contratosOrganizados[anoSelecionado]?.[mes] ?? [];
        return (
          <MesesCard
            key={mes}
            monthName={MESES_NOMES[mes]}
            totalCount={contratos.length}
            onClick={() => onMonthClick(anoSelecionado, mes)}
            hasNotif={contratos.some((c) => temNotifContrato(c.id))}
          />
        );
      })}
    </div>
  );
}
