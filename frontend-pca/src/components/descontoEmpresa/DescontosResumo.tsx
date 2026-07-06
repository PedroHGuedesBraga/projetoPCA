"use client";

import { formatCurrency } from "@/utils/formatters";
import { ContratoEmpresa } from "@/types/contratoEmpresa";
import { DescontoEmpresaResponse } from "@/types/descontoEmpresa";

interface Props {
  contrato: ContratoEmpresa| null ;
  descontos: DescontoEmpresaResponse | null ;
  saldo: number | null ;
}

export default function DescontosResumo({
  contrato,
  descontos,
  saldo,
}: Props) {
  if (!contrato || !descontos) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">
            Valor do Contrato
          </span>

          <span className="text-gray-800 font-semibold text-lg">
            {formatCurrency(contrato.valorContrato)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">
            Total de Descontos ({descontos.totalDescontos})
          </span>

          <span className="text-red-600 font-semibold text-lg">
            − {formatCurrency(descontos.valorTotalDescontos)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-gray-800 font-bold text-lg">
            Valor Restante
          </span>

          <span
            className="font-bold text-xl"
            style={{
              color:
                saldo !== null && saldo >= 0
                  ? "#16a34a"
                  : "#dc2626",
            }}
          >
            {saldo !== null ? formatCurrency(saldo) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}