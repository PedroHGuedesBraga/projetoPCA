import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Aprovado } from "@/services/aprovado/aprovadoService";

interface DetalheAprovadoModalProps {
  visible: boolean;
  onHide: () => void;
  aprovado: Aprovado | null;
  loading: boolean;
  onDownload: (aprovado: Aprovado) => void;
}

export default function DetalheAprovadoModal({ visible, onHide, aprovado, loading, onDownload }: DetalheAprovadoModalProps) {
  const fmtData = (d?: string) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");

  return (
    <Dialog header="Detalhes do Contrato" visible={visible} style={{ width: "38vw" }} modal onHide={onHide}>
      {loading ? (
        <div className="flex justify-center py-6"><ProgressSpinner /></div>
      ) : aprovado && (
        <div className="flex flex-col gap-4 p-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-semibold uppercase">Empresa</span>
            <span className="text-lg font-bold text-gray-800">{aprovado.nomeEmpresa}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-semibold uppercase">Data do Contrato</span>
            <span className="text-gray-700">{fmtData(aprovado.dataContrato)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-semibold uppercase">Data de Envio</span>
            <span className="text-gray-700">{fmtData(aprovado.createdAt)}</span>
          </div>
          <Button label="Baixar Documento" icon="pi pi-download" severity="info" className="mt-2" onClick={() => onDownload(aprovado)} />
        </div>
      )}
    </Dialog>
  );
}
