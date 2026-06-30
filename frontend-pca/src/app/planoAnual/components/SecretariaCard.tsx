"use client";

import React from "react";
import { SecretariaPlano } from "@/services/planoAnual/planoAnualService";

interface SecretariaCardProps {
  sec: SecretariaPlano;
  aberta: boolean;
  onToggle: () => void;
  fmtDate: (d: string) => string;
  STATUS_LABEL: Record<string, string>;
  STATUS_COLOR: Record<string, string>;
}

export const SecretariaCard: React.FC<SecretariaCardProps> = ({
  sec,
  aberta,
  onToggle,
  fmtDate,
  STATUS_LABEL,
  STATUS_COLOR,
}) => {
  const itensSec = sec.contratos.reduce((s, c) => s + (c.Items?.length || 0), 0);

  return (
    <div className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header secretaria */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: "#1a4d99" }} />
          <div className="text-left">
            <p className="font-bold text-gray-800 text-base">{sec.nome}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {sec.contratos.length} contrato{sec.contratos.length !== 1 ? "s" : ""}
              {" · "}
              {itensSec} itens
            </p>
          </div>
        </div>
        <i className={`pi ${aberta ? "pi-chevron-up" : "pi-chevron-down"} text-gray-400 text-sm`} />
      </button>

      {/* Contratos */}
      {aberta && (
        <div className="border-t border-gray-100">
          {sec.contratos.map((c, ci) => {
            const statusColor = STATUS_COLOR[c.aprovado ? "aprovado" : c.status] || "#64748b";
            return (
              <div key={c.id} className={ci > 0 ? "border-t border-gray-50" : ""}>
                {/* Sub-header contrato */}
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 text-sm">{c.nome}</span>
                      {c.codigoRastreio && (
                        <span className="text-xs font-mono text-gray-400">{c.codigoRastreio}</span>
                      )}
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: statusColor, backgroundColor: `${statusColor}18` }}
                      >
                        {c.aprovado ? "Aprovado" : STATUS_LABEL[c.status] || c.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">Venc: {fmtDate(c.data)}</span>
                      {c.justificativa && (
                        <span className="text-xs text-purple-600 italic">
                          <i className="pi pi-calendar mr-1" style={{ fontSize: "0.65rem" }} />
                          {c.justificativa}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabela de itens */}
                {c.Items && c.Items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-blue-50 text-blue-900">
                          {["Item", "Descrição", "Qtd", "Unidade", "Aprov."].map(h => (
                            <th key={h} className="px-4 py-2 text-left font-semibold border-b border-blue-100">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {c.Items.map((item, ii) => (
                          <tr key={item.id} className={ii % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-2 text-gray-700 font-medium">{item.nome}</td>
                            <td className="px-4 py-2 text-gray-500">{item.descricao || "-"}</td>
                            <td className="px-4 py-2 text-center text-gray-600">{item.quantidadeItem}</td>
                            <td className="px-4 py-2 text-center text-gray-500">{item.unidadeDeMedida || "-"}</td>
                            <td
                              className="px-4 py-2 text-center font-bold"
                              style={{ color: item.aprovado ? "#15803d" : "#b91c1c" }}
                            >
                              {item.aprovado ? "✓" : "✗"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-6 py-3 text-xs text-gray-400 italic">Sem itens cadastrados.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};