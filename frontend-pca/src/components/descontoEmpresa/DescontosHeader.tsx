"use client";

import BackButton from "@/components/ui/BackButton";
import { ContratoEmpresa } from "@/types/contratoEmpresa";

interface Props {
  contrato: ContratoEmpresa | null;
  onNovo: () => void;
}

export default function DescontosHeader({
  contrato,
  onNovo,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <BackButton />

        <div>
          <h1 className="text-3xl font-bold text-900">
            Descontos
          </h1>

          {contrato && (
            <p className="text-500 mt-1">
              {contrato.nomeContrato}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onNovo}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        style={{ backgroundColor: "#16a34a" }}
      >
        <i className="pi pi-plus text-xs" />
        Novo Desconto
      </button>
    </div>
  );
}