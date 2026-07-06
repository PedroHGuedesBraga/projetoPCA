"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useDescontosContrato } from "@/hooks/useDescontosContrato";
import descontoEmpresaService from "@/services/descontoEmpresa/descontoEmpresaService";
import BackButton from "@/components/ui/BackButton";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { DescontoItem } from "@/types/descontoEmpresa";

export default function DescontosContratoPage() {
  const { contratoId } = useParams() as { contratoId: string };
  const guardStatus = useRouteGuard("admin");
  const toastRef = useRef<Toast>(null);
  const { contrato, descontos, loading, error, saldo, refetch } = useDescontosContrato(contratoId);

  const [modalOpen, setModalOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [valor, setValor] = useState<number | null>(null);
  const [dataEnvio, setDataEnvio] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const showToast = (severity: "success" | "error" | "warn", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  const resetForm = () => { setMotivo(""); setValor(null); setDataEnvio(null); };

  const handleCadastrar = async () => {
    if (!motivo.trim() || !valor || !dataEnvio) {
      showToast("warn", "Campos obrigatórios", "Preencha todos os campos.");
      return;
    }
    try {
      setSaving(true);
      await descontoEmpresaService.create({
        contratoEmpresaId: contratoId,
        motivoDesconto: motivo,
        valorDesconto: valor,
        dataEnvio: dataEnvio.toISOString().split("T")[0],
      });
      showToast("success", "Desconto cadastrado com sucesso.");
      setModalOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      showToast("error", "Erro", err?.response?.data?.error || "Não foi possível cadastrar o desconto.");
    } finally {
      setSaving(false);
    }
  };

  const toggleExpandido = (id: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (guardStatus === "loading") return (
    <div className="flex justify-center items-center min-h-screen">
      <ProgressSpinner />
    </div>
  );

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <Toast ref={toastRef} position="top-right" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-900">Descontos</h1>
            {contrato && <p className="text-500 mt-1">{contrato.nomeContrato}</p>}
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#16a34a" }}
        >
          <i className="pi pi-plus text-xs" />
          Novo Desconto
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><ProgressSpinner /></div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {contrato && descontos && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Valor do Contrato</span>
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
                  <span className="text-gray-800 font-bold text-lg">Valor Restante</span>
                  <span
                    className="font-bold text-xl"
                    style={{ color: saldo !== null && saldo >= 0 ? "#16a34a" : "#dc2626" }}
                  >
                    {saldo !== null ? formatCurrency(saldo) : "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {descontos?.descontos.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
                <i className="pi pi-inbox text-4xl text-gray-300 block mb-3" />
                <p className="text-gray-400">Nenhum desconto registrado.</p>
              </div>
            ) : (
              descontos?.descontos.map((d: DescontoItem) => (
                <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleExpandido(d.id)}
                  >
                    <div className="flex items-center gap-3">
                      <i className="pi pi-percentage text-blue-500" />
                      <span className="font-semibold text-gray-800">{d.motivo}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-red-600 font-bold">− {formatCurrency(d.valor)}</span>
                      <i className={`pi ${expandidos.has(d.id) ? "pi-chevron-up" : "pi-chevron-down"} text-gray-400`} />
                    </div>
                  </button>

                  {expandidos.has(d.id) && (
                    <div className="px-5 pb-4 pt-3 border-t border-gray-100 bg-gray-50 flex gap-8">
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Motivo</span>
                        <p className="text-gray-700 mt-0.5">{d.motivo}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Valor</span>
                        <p className="text-red-600 font-bold mt-0.5">{formatCurrency(d.valor)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Data de Envio</span>
                        <p className="text-gray-700 mt-0.5">{formatDate(d.dataEnvio)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      <Dialog
        header="Novo Desconto"
        visible={modalOpen}
        style={{ width: "36vw" }}
        modal
        onHide={() => { setModalOpen(false); resetForm(); }}
      >
        <div className="flex flex-col gap-3 p-3">
          <label>Motivo do Desconto</label>
          <InputText
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex: Desconto por negociação inicial"
            className="w-full"
          />
          <label>Valor do Desconto (R$)</label>
          <InputNumber
            value={valor}
            onValueChange={(e) => setValor(e.value ?? null)}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            className="w-full"
          />
          <label>Data de Envio</label>
          <Calendar
            value={dataEnvio}
            onChange={(e) => setDataEnvio(e.value as Date)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
          />
          <button
            onClick={handleCadastrar}
            disabled={saving}
            className="flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold mt-3 transition-all duration-200 cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: "#16a34a" }}
          >
            {saving ? <ProgressSpinner style={{ width: 20, height: 20 }} /> : "Cadastrar"}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
