"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useEmpresas } from "@/hooks/useEmpresas";
import EmpresasHeader from "@/components/empresa/EmpresaHeader";
import EmpresasTable from "@/components/empresa/EmpresaTable";
import EmpresaModal from "@/components/empresa/EmpresaModal";

export default function EmpresasPage() {
  const router = useRouter();
  const toastRef = useRef<Toast>(null);
  const { empresas, loading, error, refetch } = useEmpresas();

  const [modalOpen, setModalOpen] = useState(false);


  const showToast = (severity: "success" | "error" | "warn", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <Toast ref={toastRef} position="top-right" />

      <EmpresasHeader
        onCadastrar={() => setModalOpen(true)}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <EmpresasTable
          empresas={empresas}
          onAbrir={(empresa) =>
            router.push(`/contratosEmpresa/${empresa.id}`)
          }
        />
      )}

      <EmpresaModal
        visible={modalOpen}
        onHide={() => setModalOpen(false)}
        onSuccess={refetch}
        showToast={showToast}
      />
    </div>
  );
}
