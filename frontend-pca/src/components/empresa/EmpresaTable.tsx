import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Empresa } from "@/types/empresa";

interface EmpresasTableProps {
  empresas: Empresa[];
  onAbrir: (empresa: Empresa) => void;
}

export default function EmpresasTable({
  empresas,
  onAbrir,
}: EmpresasTableProps) {
  const acoesTemplate = (empresa: Empresa) => (
    <button
      onClick={() => onAbrir(empresa)}
      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      style={{ backgroundColor: "#1d4ed8" }}
    >
      <i className="pi pi-folder-open text-xs" />
      Abrir
    </button>
  );

  return (
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
      <Column
        header="Ações"
        body={acoesTemplate}
        style={{ width: "120px" }}
      />
    </DataTable>
  );
}