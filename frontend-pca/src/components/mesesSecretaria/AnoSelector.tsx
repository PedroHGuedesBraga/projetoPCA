interface AnoSelectorProps {
  anoSelecionado: string;
  onAnoChange: (ano: string) => void;
}

export default function AnoSelector({ anoSelecionado, onAnoChange }: AnoSelectorProps) {
  const ano = parseInt(anoSelecionado);
  return (
    <div className="flex items-center justify-start mb-3 pl-1">
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl shadow-sm px-3 py-1.5">
        <button onClick={() => onAnoChange(String(ano - 1))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer text-gray-500 text-base font-bold select-none">‹</button>
        <span className="text-base font-bold text-gray-700 px-2 min-w-[3.5rem] text-center tabular-nums">{ano}</span>
        <button onClick={() => onAnoChange(String(ano + 1))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer text-gray-500 text-base font-bold select-none">›</button>
      </div>
    </div>
  );
}
