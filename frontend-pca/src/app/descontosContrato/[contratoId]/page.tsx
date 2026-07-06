"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useDescontosContrato } from "@/hooks/useDescontosContrato";

import DescontosHeader from "@/components/descontoEmpresa/DescontosHeader";
import DescontosResumo from "@/components/descontoEmpresa/DescontosResumo";
import DescontosList from "@/components/descontoEmpresa/DescontosList";
import DescontoModal from "@/components/descontoEmpresa/DescontoModal";

export default function DescontosContratoPage() {
  const { contratoId } = useParams() as { contratoId: string };

  const guardStatus = useRouteGuard("admin");
  const toastRef = useRef<Toast>(null);

  const {
    contrato,
    descontos,
    loading,
    error,
    saldo,
    refetch,
  } = useDescontosContrato(contratoId);

  const [modalOpen, setModalOpen] = useState(false);

  const showToast = (
    severity: "success" | "error" | "warn",
    summary: string,
    detail?: string
  ) => {
    toastRef.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  if (guardStatus === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <Toast ref={toastRef} position="top-right" />

      <DescontosHeader
        contrato={contrato}
        onNovo={() => setModalOpen(true)}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <DescontosResumo
            contrato={contrato}
            descontos={descontos}
            saldo={saldo}
          />

          <DescontosList
            descontos={descontos?.descontos ?? []}
          />
        </>
      )}

      <DescontoModal
        visible={modalOpen}
        onHide={() => setModalOpen(false)}
        contratoId={contratoId}
        onSuccess={refetch}
        showToast={showToast}
      />
    </div>
  );
}