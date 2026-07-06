"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { ProgressSpinner } from "primereact/progressspinner";

import descontoEmpresaService from "@/services/descontoEmpresa/descontoEmpresaService";
import { formatDescontoDate } from "@/utils/descontoEmpresa";

interface Props {
  visible: boolean;
  onHide: () => void;
  contratoId: string;
  onSuccess: () => void;
  showToast: (
    severity: "success" | "error" | "warn",
    summary: string,
    detail?: string
  ) => void;
}

export default function DescontoModal({
  visible,
  onHide,
  contratoId,
  onSuccess,
  showToast,
}: Props) {
  const [motivo, setMotivo] = useState("");
  const [valor, setValor] = useState<number | null>(null);
  const [dataEnvio, setDataEnvio] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setMotivo("");
    setValor(null);
    setDataEnvio(null);
  };

  const fechar = () => {
    resetForm();
    onHide();
  };

  const handleCadastrar = async () => {
    if (!motivo.trim() || !valor || !dataEnvio) {
      showToast(
        "warn",
        "Campos obrigatórios",
        "Preencha todos os campos."
      );
      return;
    }

    try {
      setSaving(true);

      await descontoEmpresaService.create({
        contratoEmpresaId: contratoId,
        motivoDesconto: motivo,
        valorDesconto: valor,
        dataEnvio: formatDescontoDate(dataEnvio),
      });

      showToast(
        "success",
        "Desconto cadastrado com sucesso."
      );

      fechar();
      onSuccess();
    } catch (err: any) {
      showToast(
        "error",
        "Erro",
        err?.response?.data?.error ||
          "Não foi possível cadastrar o desconto."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header="Novo Desconto"
      visible={visible}
      style={{ width: "36vw" }}
      modal
      onHide={fechar}
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
          {saving ? (
            <ProgressSpinner style={{ width: 20, height: 20 }} />
          ) : (
            "Cadastrar"
          )}
        </button>
      </div>
    </Dialog>
  );
}