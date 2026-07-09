"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import aprovadoService, { Aprovado } from "@/services/aprovado/aprovadoService";
import AdminHeader from "@/components/adminPage/AdminHeader";
import AprovadosTable from "@/components/adminPage/AprovadosTable";
import DetalheAprovadoModal from "@/components/adminPage/DetalheAprovadoModal";
import EnviarDocumentoModal from "@/components/adminPage/EnviarDocumentoModal";

export default function AdminPage() {
  const guardStatus = useRouteGuard("admin");
  const toastRef = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aprovados, setAprovados] = useState<Aprovado[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [dataContrato, setDataContrato] = useState<Date | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [detalheAprovado, setDetalheAprovado] = useState<Aprovado | null>(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

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

  useEffect(() => { fetchAprovados(); }, []);

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
      await aprovadoService.upload(nomeEmpresa, dataContrato.toISOString().split("T")[0], arquivo);
      showToast("success", "Documento enviado", `${nomeEmpresa} foi cadastrado.`);
      setModalOpen(false);
      resetForm();
      fetchAprovados();
    } catch (err: any) {
      showToast("error", "Erro ao enviar", err?.response?.data?.message || "Não foi possível enviar o documento.");
    }
  };

  const handleVisualizar = async (aprovado: Aprovado) => {
    setLoadingDetalhe(true);
    setDetalheOpen(true);
    try {
      const data = await aprovadoService.getById(aprovado.id);
      setDetalheAprovado(data);
    } catch {
      showToast("error", "Erro", "Não foi possível carregar os detalhes.");
      setDetalheOpen(false);
    } finally {
      setLoadingDetalhe(false);
    }
  };

  const handleDownload = async (aprovado: Aprovado) => {
    try {
      await aprovadoService.downloadDocumento(aprovado.id, aprovado.nomeEmpresa);
    } catch {
      showToast("error", "Erro", "Não foi possível baixar o documento.");
    }
  };

  if (guardStatus === "loading")
    return <div className="flex justify-center items-center min-h-screen"><ProgressSpinner /></div>;

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
          <i className="pi pi-arrow-left" /> Voltar
        </button>
      </div>
    );

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <Toast ref={toastRef} position="top-right" />
      <AdminHeader onUploadClick={() => setModalOpen(true)} />
      <AprovadosTable aprovados={aprovados} loading={loading} onVisualizar={handleVisualizar} />
      <DetalheAprovadoModal
        visible={detalheOpen}
        onHide={() => { setDetalheOpen(false); setDetalheAprovado(null); }}
        aprovado={detalheAprovado}
        loading={loadingDetalhe}
        onDownload={handleDownload}
      />
      <EnviarDocumentoModal
        visible={modalOpen}
        onHide={() => { setModalOpen(false); resetForm(); }}
        nomeEmpresa={nomeEmpresa}
        onNomeEmpresaChange={setNomeEmpresa}
        dataContrato={dataContrato}
        onDataContratoChange={setDataContrato}
        arquivo={arquivo}
        onArquivoChange={setArquivo}
        fileInputRef={fileInputRef}
        onEnviar={handleUpload}
      />
    </div>
  );
}
