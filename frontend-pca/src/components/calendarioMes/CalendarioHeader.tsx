const MESES_NOMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

interface CalendarioHeaderProps {
  secretariaNome: string;
  mes: number;
  ano: number;
  onBack: () => void;
  onNavMes: (delta: number) => void;
  onAddContrato: () => void;
}

export default function CalendarioHeader({ secretariaNome, mes, ano, onBack, onNavMes, onAddContrato }: CalendarioHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
        <i className="pi pi-arrow-left" /> Voltar
      </button>

      <div className="flex flex-col items-center gap-1">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{secretariaNome}</div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavMes(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer text-gray-600 text-lg font-bold">‹</button>
          <span className="text-xl font-bold text-gray-800 w-44 text-center">{MESES_NOMES[mes - 1]} {ano}</span>
          <button onClick={() => onNavMes(1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer text-gray-600 text-lg font-bold">›</button>
        </div>
      </div>

      <button onClick={onAddContrato} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "#16a34a" }}>
        <i className="pi pi-plus text-xs" /> Adicionar Contrato
      </button>
    </div>
  );
}
