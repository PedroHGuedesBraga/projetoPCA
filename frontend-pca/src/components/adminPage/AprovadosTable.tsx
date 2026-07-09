import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Aprovado } from "@/services/aprovado/aprovadoService";

interface AprovadosTableProps {
  aprovados: Aprovado[];
  loading: boolean;
  onVisualizar: (aprovado: Aprovado) => void;
}

export default function AprovadosTable({ aprovados, loading, onVisualizar }: AprovadosTableProps) {
  const fmtData = (d?: string) => (d ? new Date(d).toLocaleDateString("pt-BR") : "-");

  if (loading) return <div className="flex justify-center py-8"><ProgressSpinner /></div>;

  return (
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
      <Column header="Data do Contrato" body={(a: Aprovado) => fmtData(a.dataContrato)} sortable sortField="dataContrato" />
      <Column header="Data de Envio" body={(a: Aprovado) => fmtData(a.createdAt)} sortable sortField="createdAt" />
      <Column
        header="Ações"
        style={{ width: "110px" }}
        body={(a: Aprovado) => (
          <Button label="Visualizar" icon="pi pi-eye" severity="info" className="p-button-sm p-button-text" onClick={() => onVisualizar(a)} />
        )}
      />
    </DataTable>
  );
}
