"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onExportExcel: () => void;
  onExportDoc: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExportExcel, onExportDoc }) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => router.push("/home")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <i className="pi pi-arrow-left" /> Voltar
      </button>

      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800">Plano de Contratações Anual</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">Consolidado de todas as secretarias</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#15803d" }}
        >
          <i className="pi pi-table text-xs" /> Excel
        </button>
        <button
          onClick={onExportDoc}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#1d4ed8" }}
        >
          <i className="pi pi-file-word text-xs" /> DOC
        </button>
      </div>
    </div>
  );
};