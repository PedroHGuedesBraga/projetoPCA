"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useContratosEmpresa } from "@/hooks/useContratosEmpresa";
import empresaService from "@/services/empresa/empresaService";
import ContratosHeader from "@/components/contratoEmpresa/ContratosHeader";
import ContratosTable from "@/components/contratoEmpresa/ContratosTable";
import ContratoModal from "@/components/contratoEmpresa/ContratoModal";

export default function ContratosEmpresaPage() {
  const { empresaId } = useParams() as { empresaId: string };
  const toastRef = useRef<Toast>(null);

  const { contratos, loading, error, refetch } =
    useContratosEmpresa(empresaId);

  const [empresaNome, setEmpresaNome] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    empresaService.getById(empresaId)
      .then((e) => setEmpresaNome(e.nome))
      .catch(() => { });
  }, [empresaId]);

  const showToast = (severity: any, summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };


  return (
    <div className="p-5 max-w-5xl mx-auto">
      <Toast ref={toastRef} position="top-right" />

      <ContratosHeader
        empresaNome={empresaNome}
        onNew={() => setModalOpen(true)}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ContratosTable contratos={contratos} />
      )}

      <ContratoModal
        visible={modalOpen}
        onHide={() => setModalOpen(false)}
        empresaId={empresaId}
        onSuccess={refetch}
        showToast={showToast}
      />
    </div>
  );
}