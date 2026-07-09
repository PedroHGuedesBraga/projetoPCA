import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

interface HistoricoFiltrosProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  filtroSecretaria: string | null;
  onFiltroSecretariaChange: (value: string | null) => void;
  filtroStatus: string | null;
  onFiltroStatusChange: (value: string | null) => void;
  filtroAno: number | null;
  onFiltroAnoChange: (value: number | null) => void;
  secretarias: { label: string; value: string }[];
  anos: { label: string; value: number }[];
}

export default function HistoricoFiltros({
  busca, onBuscaChange, filtroSecretaria, onFiltroSecretariaChange,
  filtroStatus, onFiltroStatusChange, filtroAno, onFiltroAnoChange,
  secretarias, anos,
}: HistoricoFiltrosProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
      <div className="relative flex-1" style={{ minWidth: 200 }}>
        <i className="pi pi-search" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none", zIndex: 1 }} />
        <InputText
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar por nome ou código..."
          className="w-full"
          style={{ paddingLeft: "2.25rem" }}
        />
      </div>
      <Dropdown value={filtroSecretaria} options={secretarias} onChange={(e) => onFiltroSecretariaChange(e.value)} placeholder="Todas as secretarias" showClear style={{ minWidth: 220 }} />
      <Dropdown
        value={filtroStatus}
        options={[
          { label: "Em Andamento", value: "andamento" },
          { label: "Aprovado",     value: "aprovado"  },
          { label: "Urgente",      value: "urgente"   },
          { label: "Rascunho",     value: "rascunho"  },
        ]}
        onChange={(e) => onFiltroStatusChange(e.value)}
        placeholder="Todos os status"
        showClear
        style={{ minWidth: 180 }}
      />
      <Dropdown value={filtroAno} options={anos} onChange={(e) => onFiltroAnoChange(e.value)} placeholder="Todos os anos" showClear style={{ minWidth: 140 }} />
    </div>
  );
}
