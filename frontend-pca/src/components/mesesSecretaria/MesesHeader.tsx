"use client";

import { authService } from "@/services/authService";

interface MesesHeaderProps {
  secretariaNome: string;
  clonando: boolean;
  anoSelecionado: string;
  onBack: () => void;
  onAddContrato: () => void;
  onClonarAno: () => void;
  onDeleteSecretaria: () => void;
}

export default function MesesHeader({
  secretariaNome, clonando, anoSelecionado,
  onBack, onAddContrato, onClonarAno, onDeleteSecretaria,
}: MesesHeaderProps) {
  return (
    <div className="flex items-center mb-4 gap-4">
      <div className="flex-1 flex items-center">
        {authService.isAdmin() && (
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
            <i className="pi pi-arrow-left" /> Voltar
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100 text-center">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest leading-none mb-1">Secretaria</p>
        <h1 className="text-lg font-bold text-gray-800 leading-tight whitespace-nowrap">{secretariaNome}</h1>
      </div>

      <div className="flex-1 flex flex-row gap-2 items-center justify-end">
        <button onClick={onAddContrato} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold whitespace-nowrap shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "#16a34a" }}>
          <i className="pi pi-plus text-xs" /> Adicionar Contrato
        </button>
        {authService.isAdmin() && (
          <button onClick={onClonarAno} disabled={clonando} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold whitespace-nowrap shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{ backgroundColor: "#7c3aed" }}>
            <i className={`pi ${clonando ? "pi-spin pi-spinner" : "pi-copy"} text-xs`} />
            Clonar para {parseInt(anoSelecionado) + 1}
          </button>
        )}
        {authService.isAdmin() && (
          <button onClick={onDeleteSecretaria} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold whitespace-nowrap shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "#dc2626" }}>
            <i className="pi pi-trash text-xs" /> Deletar Secretaria
          </button>
        )}
      </div>
    </div>
  );
}
