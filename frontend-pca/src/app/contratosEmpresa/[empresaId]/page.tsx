"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useContratosEmpresa } from "@/hooks/useContratosEmpresa";
import contratoEmpresaService from "@/services/contratoEmpresa/contratoEmpresaService";
import empresaService from "@/services/empresa/empresaService";
import BackButton from "@/components/ui/BackButton";
import { formatCurrency } from "@/utils/formatters";
import { ContratoEmpresa } from "@/types/contratoEmpresa";

export default function ContratosEmpresaPage() {
  const { empresaId } = useParams() as { empresaId: string };
  const guardStatus = useRouteGuard("admin");
  const router = useRouter();
  const toastRef = useRef<Toast>(null);

  const { contratos, loading, error, refetch } = useContratosEmpresa(empresaId);
  const [empresaNome, setEmpresaNome] = useState("");

  useEffect(() => {
    empresaService.getById(empresaId).then((e) => setEmpresaNome(e.nome)).catch(() => {});
  }, [empresaId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [nomeContrato, setNomeContrato] = useState("");
  const [valorContrato, setValorContrato] = useState<number | null>(null);
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataTermino, setDataTermino] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (severity: "success" | "error" | "warn", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  const resetForm = () => {
    setNomeContrato("");
    setValorContrato(null);
    setDataInicio(null);
    setDataTermino(null);
  };

  const handleCadastrar = async () => {
    if (!nomeContrato.trim() || !valorContrato || !dataInicio || !dataTermino) {
      showToast("warn", "Campos obrigatórios", "Preencha todos os campos.");
      return;
    }
    try {
      setSaving(true);
      await contratoEmpresaService.create({
        empresaId,
        nomeContrato,
        valorContrato,
        dataInicioContrato: dataInicio.toISOString().split("T")[0],
        dataTerminoContrato: dataTermino.toISOString().split("T")[0],
      });
      showToast("success", "Contrato cadastrado com sucesso.");
      setModalOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      showToast("error", "Erro", err?.response?.data?.error || "Não foi possível cadastrar o contrato.");
    } finally {
      setSaving(false);
    }
  };

  const acoesTemplate = (contrato: ContratoEmpresa) => (
    <button
      onClick={() => router.push(`/descontosContrato/${contrato.id}`)}
      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      style={{ backgroundColor: "#1d4ed8" }}
    >
      <i className="pi pi-folder-open text-xs" />
      Abrir
    </button>
  );

  if (guardStatus === "loading") return (
    <div className="flex justify-center items-center min-h-screen">
      <ProgressSpinner />
    </div>
  );

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <Toast ref={toastRef} position="top-right" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton href="/empresas" />
          <div>
            <h1 className="text-3xl font-bold text-900">Contratos</h1>
            {empresaNome && <p className="text-500 mt-1">{empresaNome}</p>}
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#16a34a" }}
        >
          <i className="pi pi-plus text-xs" />
          Novo Contrato
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><ProgressSpinner /></div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DataTable
          value={contratos}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Nenhum contrato cadastrado."
          className="shadow-2"
          size="small"
        >
          <Column field="nomeContrato" header="Nome do Contrato" sortable />
          <Column
            field="valorContrato"
            header="Valor"
            sortable
            body={(c: ContratoEmpresa) => formatCurrency(c.valorContrato)}
          />
          <Column header="Ações" body={acoesTemplate} style={{ width: "120px" }} />
        </DataTable>
      )}

      <Dialog
        header="Novo Contrato"
        visible={modalOpen}
        style={{ width: "38vw" }}
        modal
        onHide={() => { setModalOpen(false); resetForm(); }}
      >
        <div className="flex flex-col gap-3 p-3">
          <label>Nome do Contrato</label>
          <InputText
            value={nomeContrato}
            onChange={(e) => setNomeContrato(e.target.value)}
            placeholder="Ex: Contrato de Suporte"
            className="w-full"
          />
          <label>Valor do Contrato (R$)</label>
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
