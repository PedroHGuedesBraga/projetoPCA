"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Calendar } from "primereact/calendar";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import aprovadoService, { Aprovado } from "@/services/aprovado/aprovadoService";

export default function AdminPage() {
  const guardStatus = useRouteGuard("admin");
  const toastRef = useRef<Toast>(null);

  const [aprovados, setAprovados] = useState<Aprovado[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [dataContrato, setDataContrato] = useState<Date | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  const fetchAprovados = async () => {
    try {
      const data = await aprovadoService.getAll();
      setAprovados(data);
    } catch {
      showToast("error", "Erro", "Não foi possível carregar os documentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAprovados();
  }, []);

  const resetForm = () => {
    setNomeEmpresa("");
    setDataContrato(null);
    setArquivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!nomeEmpresa.trim() || !dataContrato || !arquivo) {
      showToast("warn", "Campos obrigatórios", "Preencha todos os campos e selecione um PDF.");
      return;
    }
    try {
      const dataStr = dataContrato.toISOString().split("T")[0];
      await aprovadoService.upload(nomeEmpresa, dataStr, arquivo);
      showToast("success", "Documento enviado", `${nomeEmpresa} foi cadastrado.`);
      setModalOpen(false);
      resetForm();
      fetchAprovados();
    } catch (err: any) {
      showToast("error", "Erro ao enviar", err?.response?.data?.message || "Não foi possível enviar o documento.");
    }
  };

  const handleDownload = async (aprovado: Aprovado) => {
    try {
      await aprovadoService.downloadDocumento(aprovado.id, aprovado.nomeEmpresa);
    } catch {
      showToast("error", "Erro", "Não foi possível baixar o documento.");
    }
  };

  const handleDelete = (aprovado: Aprovado) => {
    confirmDialog({
      message: `Deseja remover o documento de "${aprovado.nomeEmpresa}"?`,
      header: "Confirmar exclusão",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, remover",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          showToast("info", "Removido", `Documento de ${aprovado.nomeEmpresa} removido.`);
          fetchAprovados();
        } catch {
          showToast("error", "Erro", "Não foi possível remover o documento.");
        }
      },
    });
  };

  const dataContratoTemplate = (a: Aprovado) =>
    a.dataContrato ? new Date(a.dataContrato).toLocaleDateString("pt-BR") : "-";

  const dataEnvioTemplate = (a: Aprovado) =>
    a.createdAt ? new Date(a.createdAt).toLocaleDateString("pt-BR") : "-";

  const acoesTemplate = (a: Aprovado) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-download"
        severity="info"
        className="p-button-sm p-button-text"
        tooltip="Baixar PDF"
        onClick={() => handleDownload(a)}
      />
      <Button
        icon="pi pi-trash"
        severity="danger"
        className="p-button-sm p-button-text"
        tooltip="Remover"
        onClick={() => handleDelete(a)}
      />
    </div>
  );

  if (guardStatus === "loading")
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );

  if (guardStatus === "denied")
    return (
      <div className="flex flex-column justify-content-center align-items-center min-h-screen gap-4">
        <i className="pi pi-lock text-7xl text-400" />
        <h2 className="text-2xl font-bold text-700">Acesso Restrito</h2>
        <p className="text-500 text-center" style={{ maxWidth: "380px" }}>
          Esta área é exclusiva para administradores.<br />
          Faça logout e entre com uma conta de administrador para ter acesso.
        </p>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <i className="pi pi-arrow-left" />
          Voltar
        </button>
      </div>
    );

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <Toast ref={toastRef} position="top-right" />
      <ConfirmDialog />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-900">Documentos Aprovados</h1>
          <p className="text-500 mt-1">Documentos PDF de contratos aprovados</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#16a34a" }}
        >
          <i className="pi pi-upload text-xs" />
          Enviar Documento
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable
          value={aprovados}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Nenhum documento enviado."
          className="shadow-2"
          size="small"
        >
          <Column field="nomeEmpresa" header="Empresa" sortable />
          <Column header="Data do Contrato" body={dataContratoTemplate} sortable sortField="dataContrato" />
          <Column header="Data de Envio" body={dataEnvioTemplate} sortable sortField="createdAt" />
          <Column header="Ações" body={acoesTemplate} style={{ width: "110px" }} />
        </DataTable>
      )}

      <Dialog
        header="Enviar Documento Aprovado"
        visible={modalOpen}
        style={{ width: "38vw" }}
        modal
        onHide={() => { setModalOpen(false); resetForm(); }}
      >
        <div className="flex flex-col gap-3 p-3">
          <label>Nome da Empresa</label>
          <InputText
            value={nomeEmpresa}
            onChange={(e) => setNomeEmpresa(e.target.value)}
            placeholder="Ex: Construtora ABC Ltda"
            className="w-full"
          />

          <label>Data do Contrato</label>
          <Calendar
            value={dataContrato}
            onChange={(e) => setDataContrato(e.value as Date)}
            dateFormat="dd/mm/yy"
            placeholder="Selecione a data"
            className="w-full"
            showIcon
          />

          <label>Arquivo PDF</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold"
          />
          {arquivo && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <i className="pi pi-check-circle" /> {arquivo.name}
            </p>
          )}

          <Button label="Enviar" icon="pi pi-upload" className="p-button-success mt-3" onClick={handleUpload} />
        </div>
      </Dialog>
    </div>
  );
}
