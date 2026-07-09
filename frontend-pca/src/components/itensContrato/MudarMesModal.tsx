import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

interface MudarMesModalProps {
  visible: boolean;
  onHide: () => void;
  contratoNome: string;
  novaData: Date | null;
  onNovaDataChange: (v: Date | null) => void;
  justificativa: string;
  onJustificativaChange: (v: string) => void;
  salvando: boolean;
  onConfirmar: () => void;
}

export default function MudarMesModal({
  visible, onHide, contratoNome, novaData, onNovaDataChange,
  justificativa, onJustificativaChange, salvando, onConfirmar,
}: MudarMesModalProps) {
  return (
    <Dialog header="Mudar de Mês" visible={visible} style={{ width: "38vw" }} modal onHide={onHide}>
      <div className="flex flex-col gap-4 p-3">
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm text-purple-800">
          <i className="pi pi-info-circle mr-2" />
          Você está movendo o contrato <strong>{contratoNome}</strong> para outro mês.
          Uma justificativa é <strong>obrigatória</strong>.
        </div>

        <label className="font-medium text-gray-700">Nova data de vencimento</label>
        <Calendar value={novaData} onChange={(e) => onNovaDataChange(e.value as Date)} dateFormat="dd/mm/yy" placeholder="Selecione a nova data" className="w-full" showIcon />

        <label className="font-medium text-gray-700">Justificativa <span className="text-red-500">*</span></label>
        <InputTextarea value={justificativa} onChange={(e) => onJustificativaChange(e.target.value)} rows={4} placeholder="Descreva o motivo da mudança de mês..." className="w-full" maxLength={500} />
        <span className="text-xs text-gray-400 text-right">{justificativa.length}/500</span>

        <Button
          label="Confirmar Mudança"
          icon={salvando ? "pi pi-spin pi-spinner" : "pi pi-check"}
          disabled={salvando}
          className="mt-1"
          style={{ backgroundColor: "#7c3aed", border: "none" }}
          onClick={onConfirmar}
        />
      </div>
    </Dialog>
  );
}
