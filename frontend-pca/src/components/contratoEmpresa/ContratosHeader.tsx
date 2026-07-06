"use client";

import BackButton from "@/components/ui/BackButton";

interface Props {
  empresaNome: string;
  onNew: () => void;
}

export default function ContratosHeader({ empresaNome, onNew }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <BackButton href="/empresas" />
        <div>
          <h1 className="text-3xl font-bold text-900">Contratos</h1>
          {empresaNome && <p className="text-500 mt-1">{empresaNome}</p>}
        </div>
      </div>

      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
        style={{ backgroundColor: "#16a34a" }}
      >
        <i className="pi pi-plus text-xs" />
        Novo Contrato
      </button>
    </div>
  );
}