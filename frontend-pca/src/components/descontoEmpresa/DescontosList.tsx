"use client";

import { useState } from "react";

import { formatCurrency, formatDate } from "@/utils/formatters";
import { DescontoItem } from "@/types/descontoEmpresa";

interface Props {
  descontos: DescontoItem[];
}

export default function DescontosList({
  descontos,
}: Props) {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const toggleExpandido = (id: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (descontos.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
        <i className="pi pi-inbox text-4xl text-gray-300 block mb-3" />
        <p className="text-gray-400">
          Nenhum desconto registrado.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {descontos.map((desconto) => (
        <div
          key={desconto.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => toggleExpandido(desconto.id)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <i className="pi pi-percentage text-blue-500" />

              <span className="font-semibold text-gray-800">
                {desconto.motivo}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-red-600 font-bold">
                − {formatCurrency(desconto.valor)}
              </span>

              <i
                className={`pi ${
                  expandidos.has(desconto.id)
                    ? "pi-chevron-up"
                    : "pi-chevron-down"
                } text-gray-400`}
              />
            </div>
          </button>

          {expandidos.has(desconto.id) && (
            <div className="px-5 pb-4 pt-3 border-t border-gray-100 bg-gray-50 flex gap-8">
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">
                  Motivo
                </span>

                <p className="text-gray-700 mt-0.5">
                  {desconto.motivo}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">
                  Valor
                </span>

                <p className="text-red-600 font-bold mt-0.5">
                  {formatCurrency(desconto.valor)}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">
                  Data de Envio
                </span>

                <p className="text-gray-700 mt-0.5">
                  {formatDate(desconto.dataEnvio)}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}