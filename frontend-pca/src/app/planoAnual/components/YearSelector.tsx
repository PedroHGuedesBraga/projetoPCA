"use client";

import React from "react";

interface YearSelectorProps {
  ano: number;
  setAno: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  totalSecretarias: number;
  totalContratos: number;
  totalItens: number;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  ano,
  setAno,
  loading,
  totalSecretarias,
  totalContratos,
  totalItens,
}) => {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl shadow-sm px-3 py-1.5">
        <button
          onClick={() => setAno(a => a - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer text-gray-500 text-base font-bold select-none"
        >
          ‹
        </button>
        <span className="text-base font-bold text-gray-700 px-2 min-w-[3.5rem] text-center tabular-nums">{ano}</span>
        <button
          onClick={() => setAno(a => a + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer text-gray-500 text-base font-bold select-none"
        >
          ›
        </button>
      </div>

      {!loading && (
        <div className="flex gap-3 text-sm text-gray-500">
          <span><strong className="text-gray-700">{totalSecretarias}</strong> secretarias</span>
          <span>·</span>
          <span><strong className="text-gray-700">{totalContratos}</strong> contratos</span>
          <span>·</span>
          <span><strong className="text-gray-700">{totalItens}</strong> itens</span>
        </div>
      )}
    </div>
  );
};