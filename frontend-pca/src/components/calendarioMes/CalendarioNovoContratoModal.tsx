import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";

interface CalendarioNovoContratoModalProps {
  visible: boolean;
  onHide: () => void;
  secretariaNome: string;
  nome: string;
  onNomeChange: (v: string) => void;
  selectedDate: Date | null;
  onSelectedDateChange: (v: Date | null) => void;
  status: string;
  onStatusChange: (v: string) => void;
  importarItens: boolean;
  onImportarItensChange: (v: boolean) => void;
  ultimoContrato: any | null;
  onSalvar: () => void;
}

export default function CalendarioNovoContratoModal({
  visible, onHide, secretariaNome, nome, onNomeChange,
  selectedDate, onSelectedDateChange, status, onStatusChange,
  importarItens, onImportarItensChange, ultimoContrato, onSalvar,
}: CalendarioNovoContratoModalProps) {
  return (
    <Dialog header="Novo Contrato" visible={visible} style={{ width: "40vw" }} modal onHide={onHide}>
      <div className="flex flex-column gap-3 p-3">
        <label>Secretaria</label>
        <InputText value={secretariaNome} disabled className="w-full" />

        <label>Nome do Contrato</label>
        <InputText value={nome} onChange={e => onNomeChange(e.target.value)} placeholder="Ex: Contrato de fornecimento" className="w-full" />

        <label>Data de Vencimento</label>
        <Calendar value={selectedDate} onChange={e => onSelectedDateChange(e.value as Date)} dateFormat="dd/mm/yy" className="w-full" />

        <label>Status</label>
        <Dropdown
          value={status}
          options={[
            { label: "Rascunho",  value: "rascunho"  },
            { label: "Andamento", value: "andamento" },
            { label: "Urgente",   value: "urgente"   },
          ]}
          onChange={e => onStatusChange(e.value)}
          className="w-full"
        />

        {ultimoContrato && (
          <div className="border border-blue-100 rounded-lg p-3 bg-blue-50 mt-1">
            <div className="flex justify-between items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1"><i className="pi pi-history mr-2" />Último contrato</p>
                <p className="text-sm text-blue-700">{ultimoContrato.nome}</p>
                <p className="text-xs text-blue-500 mt-1">{ultimoContrato.itensQuantidade} {ultimoContrato.itensQuantidade === 1 ? "item" : "itens"}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <InputSwitch checked={importarItens} onChange={e => onImportarItensChange(e.value)} />
                <span className="text-xs text-blue-600">Importar itens</span>
              </div>
            </div>
          </div>
        )}

        <Button label="Salvar Contrato" icon="pi pi-check" className="p-button-success mt-3" onClick={onSalvar} />
      </div>
    </Dialog>
  );
}
