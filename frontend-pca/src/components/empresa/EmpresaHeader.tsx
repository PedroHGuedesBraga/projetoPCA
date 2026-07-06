import React from "react";

interface EmpresasHeaderProps {
  onCadastrar: () => void;
}

export default function EmpresasHeader({
  onCadastrar,
}: EmpresasHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-900">Empresas</h1>
        <p className="text-500 mt-1">
          Gestão de empresas e contratos
        </p>
      </div>

      <button
        onClick={onCadastrar}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        style={{ backgroundColor: "#16a34a" }}
      >
        <i className="pi pi-plus text-xs" />
        Cadastrar Empresa
      </button>
    </div>
  );
}