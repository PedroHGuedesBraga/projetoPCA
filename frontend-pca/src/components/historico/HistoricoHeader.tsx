interface HistoricoHeaderProps {
  totalFiltrados: number;
  onBack: () => void;
}

export default function HistoricoHeader({ totalFiltrados, onBack }: HistoricoHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <i className="pi pi-arrow-left" /> Voltar
      </button>
      <div className="flex flex-col items-center flex-1">
        <h1 className="text-3xl font-bold text-center">Histórico Geral</h1>
        <span className="text-sm text-gray-400 mt-1">
          {totalFiltrados} contrato{totalFiltrados !== 1 ? "s" : ""} encontrado{totalFiltrados !== 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ width: 120 }} />
    </div>
  );
}
