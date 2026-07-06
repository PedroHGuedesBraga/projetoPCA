"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatters";
import { ContratoEmpresa } from "@/types/contratoEmpresa";

interface Props {
  contratos: ContratoEmpresa[];
}

export default function ContratosTable({ contratos }: Props) {
  const router = useRouter();

  const acoesTemplate = (contrato: ContratoEmpresa) => (
    <button
      onClick={() => router.push(`/descontosContrato/${contrato.id}`)}
      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
      style={{ backgroundColor: "#1d4ed8" }}
    >
      <i className="pi pi-folder-open text-xs" />
      Abrir
    </button>
  );

  return (
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
  );
}