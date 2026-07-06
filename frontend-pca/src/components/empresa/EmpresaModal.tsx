"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";

import empresaService from "@/services/empresa/empresaService";
import { validarCNPJ, somenteNumeros } from "@/utils/cnpj";

interface EmpresaModalProps {
  visible: boolean;
  onHide: () => void;
  onSuccess: () => void;
  showToast: (
    severity: "success" | "error" | "warn",
    summary: string,
    detail?: string
  ) => void;
}

export default function EmpresaModal({
  visible,
  onHide,
  onSuccess,
  showToast,
}: EmpresaModalProps) {
  const [cnpj, setCnpj] = useState("");
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setCnpj("");
    setNome("");
  };

  const fechar = () => {
    resetForm();
    onHide();
  };

  const handleCadastrar = async () => {
    if (!cnpj.trim() || !nome.trim()) {
      showToast(
        "warn",
        "Campos obrigatórios",
        "Preencha o CNPJ e o nome."
      );
      return;
    }

    if (!validarCNPJ(cnpj)) {
      showToast(
        "error",
        "CNPJ inválido",
        "Informe um CNPJ válido."
      );
      return;
    }

    try {
      setSaving(true);

      await empresaService.create(
        somenteNumeros(cnpj),
        nome
      );

      showToast(
        "success",
        "Empresa cadastrada com sucesso."
      );

      fechar();
      onSuccess();
    } catch (err: any) {
      showToast(
        "error",
        "Erro",
        err?.response?.data?.error ||
          "Não foi possível cadastrar a empresa."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header="Cadastrar Empresa"
      visible={visible}
      style={{ width: "36vw" }}
      modal
      onHide={fechar}
    >
      <div className="flex flex-col gap-3 p-3">
        <label>CNPJ</label>

        <InputMask
          value={cnpj}
          onChange={(e) => setCnpj(e.value ?? "")}
          mask="99.999.999/9999-99"
          placeholder="00.000.000/0000-00"
          className="w-full"
        />

        <label>Nome da Empresa</label>

        <InputText
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Construtora ABC Ltda"
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