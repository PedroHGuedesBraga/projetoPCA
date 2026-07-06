"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { ProgressSpinner } from "primereact/progressspinner";

import contratoEmpresaService from "@/services/contratoEmpresa/contratoEmpresaService";
import { formatContratoDate } from "@/utils/contratoEmpresa";

interface Props {
  visible: boolean;
  onHide: () => void;
  empresaId: string;
  onSuccess: () => void;
  showToast: (
    severity: "success" | "error" | "warn",
    summary: string,
    detail?: string
  ) => void;
}

export default function ContratoModal({
  visible,
  onHide,
  empresaId,
  onSuccess,
  showToast,
}: Props) {
  const [nomeContrato, setNomeContrato] = useState("");
  const [valorContrato, setValorContrato] = useState<number | null>(null);
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataTermino, setDataTermino] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setNomeContrato("");
    setValorContrato(null);
    setDataInicio(null);
    setDataTermino(null);
  };

  const fechar = () => {
    resetForm();
    onHide();
  };

  const handleSave = async () => {
    if (!nomeContrato.trim() || !valorContrato || !dataInicio || !dataTermino) {
      showToast(
        "warn",
        "Campos obrigatórios",
        "Preencha todos os campos."
      );
      return;
    }

    try {
      setSaving(true);

      await contratoEmpresaService.create({
        empresaId,
        nomeContrato,
        valorContrato,
        dataInicioContrato: formatContratoDate(dataInicio),
        dataTerminoContrato: formatContratoDate(dataTermino),
      });

      showToast(
        "success",
        "Contrato cadastrado com sucesso."
      );

      fechar();
      onSuccess();

    } catch (err: any) {
      showToast(
        "error",
        "Erro",
        err?.response?.data?.error ||
          "Não foi possível cadastrar o contrato."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header="Novo Contrato"
      visible={visible}
      style={{ width: "38vw" }}
      modal
      onHide={fechar}
    >
      <div className="flex flex-col gap-3 p-3">
        <label>Nome do Contrato</label>

        <InputText
          value={nomeContrato}
          onChange={(e) => setNomeContrato(e.target.value)}
          placeholder="Ex: Contrato de Suporte"
          className="w-full"
        />

        <label>Valor do Contrato</label>

        <InputNumber
          value={valorContrato}
          onValueChange={(e) => setValorContrato(e.value ?? null)}
          mode="currency"
          currency="BRL"
          locale="pt-BR"
          className="w-full"
        />

        <label>Data de Início</label>

        <Calendar
          value={dataInicio}
          onChange={(e) => setDataInicio(e.value as Date)}
          dateFormat="dd/mm/yy"
          showIcon
          className="w-full"
        />

        <label>Data de Término</label>

        <Calendar
          value={dataTermino}
          onChange={(e) => setDataTermino(e.value as Date)}
          dateFormat="dd/mm/yy"
          showIcon
          className="w-full"
        />

        <button
          onClick={handleSave}
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