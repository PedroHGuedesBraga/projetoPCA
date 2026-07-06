"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useEmpresas } from "@/hooks/useEmpresas";
import empresaService from "@/services/empresa/empresaService";
import { Empresa } from "@/types/empresa";

export default function EmpresasPage() {
  const guardStatus = useRouteGuard("admin");
  const router = useRouter();
  const toastRef = useRef<Toast>(null);
  const { empresas, loading, error, refetch } = useEmpresas();

  const [modalOpen, setModalOpen] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = (severity: "success" | "error" | "warn", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  const resetForm = () => { setCnpj(""); setNome(""); };

  const handleCadastrar = async () => {
    if (!cnpj.trim() || !nome.trim()) {
      showToast("warn", "Campos obrigatórios", "Preencha o CNPJ e o nome.");
      return;
    }
    try {
      setSaving(true);
      await empresaService.create(cnpj, nome);
      showToast("success", "Empresa cadastrada com sucesso.");
      setModalOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      showToast("error", "Erro", err?.response?.data?.error || "Não foi possível cadastrar a empresa.");
    } finally {
      setSaving(false);
    }
  };

  const acoesTemplate = (empresa: Empresa) => (
    <button
      onClick={() => router.push(`/contratosEmpresa/${empresa.id}`)}
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

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-900">Empresas</h1>
          <p className="text-500 mt-1">Gestão de empresas e contratos</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#16a34a" }}
        >
          <i className="pi pi-plus text-xs" />
          Cadastrar Empresa
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><ProgressSpinner /></div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DataTable
          value={empresas}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Nenhuma empresa cadastrada."
          className="shadow-2"
          size="small"
        >
          <Column field="nome" header="Nome" sortable />
          <Column field="cnpj" header="CNPJ" />
          <Column header="Ações" body={acoesTemplate} style={{ width: "120px" }} />
        </DataTable>
      )}

      <Dialog
        header="Cadastrar Empresa"
        visible={modalOpen}
        style={{ width: "36vw" }}
        modal
        onHide={() => { setModalOpen(false); resetForm(); }}
      >
        <div className="flex flex-col gap-3 p-3">
          <label>CNPJ</label>
          <InputText
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
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
            {saving ? <ProgressSpinner style={{ width: 20, height: 20 }} /> : "Cadastrar"}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
