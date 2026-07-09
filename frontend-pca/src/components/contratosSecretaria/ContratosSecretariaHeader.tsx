"use client";

import { Button } from "primereact/button";
import { useRouter } from "next/navigation";

interface ContratosSecretariaHeaderProps {
  secretariaNome: string;
  secretariaId: string;
  viewMode: "cards" | "lista";
  onViewModeChange: (mode: "cards" | "lista") => void;
}

export default function ContratosSecretariaHeader({ secretariaNome, secretariaId, viewMode, onViewModeChange }: ContratosSecretariaHeaderProps) {
  const router = useRouter();
  return (
    <div className="flex items-center mb-4 gap-4">
      <div className="flex-1 flex items-start">
        <button
          onClick={() => router.push(`/mesesSecretaria/${secretariaId}`)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <i className="pi pi-arrow-left" /> Voltar
        </button>
      </div>
      <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100 text-center">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest leading-none mb-1">Secretaria</p>
        <h2 className="text-lg font-bold text-gray-800 leading-tight whitespace-nowrap">{secretariaNome}</h2>
      </div>
      <div className="flex-1 flex gap-2 justify-end">
        <Button
          icon="pi pi-th-large"
          tooltip="Visualização em cards"
          className={`p-button-sm ${viewMode === "cards" ? "p-button-primary" : "p-button-outlined p-button-secondary"}`}
          onClick={() => onViewModeChange("cards")}
        />
        <Button
          icon="pi pi-list"
          tooltip="Visualização em lista"
          className={`p-button-sm ${viewMode === "lista" ? "p-button-primary" : "p-button-outlined p-button-secondary"}`}
          onClick={() => onViewModeChange("lista")}
        />
      </div>
    </div>
  );
}
