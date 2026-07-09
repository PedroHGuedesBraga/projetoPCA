"use client";

import { authService } from "@/services/authService";
import ExportMenu from "./ExportMenu";

type ShowToast = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => void;

interface ItensContratoHeaderProps {
  contrato: any;
  itens: any[];
  logo: string | null;
  secretariaNome: string;
  onBack: () => void;
  onAddItem: () => void;
  onMudarMes: () => void;
  onAprovarTodos: () => void;
  onDeleteContrato: () => void;
  showToast: ShowToast;
}

export default function ItensContratoHeader({
  contrato, itens, logo, secretariaNome,
  onBack, onAddItem, onMudarMes, onAprovarTodos, onDeleteContrato, showToast,
}: ItensContratoHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 gap-3">
      <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer">
        <i className="pi pi-arrow-left" /> Voltar
      </button>

      <div className="flex gap-3 flex-wrap justify-end">
        <ExportMenu contrato={contrato} itens={itens} logo={logo} secretariaNome={secretariaNome} showToast={showToast} />

        {authService.isAdmin() && (
          <button onClick={onMudarMes} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "#7c3aed" }}>
            <i className="pi pi-calendar text-xs" /> Mudar de Mês
          </button>
        )}

        <button onClick={onAddItem} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "#16a34a" }}>
          <i className="pi pi-plus text-xs" /> Adicionar Item
        </button>

        {authService.isAdmin() && (
          <>
            <button onClick={onAprovarTodos} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "#2563eb" }}>
              <i className="pi pi-check-circle text-xs" /> Aprovar Todos
            </button>
            <button onClick={onDeleteContrato} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "#dc2626" }}>
              <i className="pi pi-trash text-xs" /> Deletar Contrato
            </button>
          </>
        )}
      </div>
    </div>
  );
}
