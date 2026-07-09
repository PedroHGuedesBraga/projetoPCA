import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const UNIDADES = [
  { label: "Unidade (un)", value: "un" }, { label: "Quilograma (kg)", value: "kg" },
  { label: "Grama (g)", value: "g" }, { label: "Litro (L)", value: "L" },
  { label: "Mililitro (mL)", value: "mL" }, { label: "Metro (m)", value: "m" },
  { label: "Metro quadrado (m²)", value: "m²" }, { label: "Metro cúbico (m³)", value: "m³" },
  { label: "Centímetro (cm)", value: "cm" }, { label: "Quilômetro (km)", value: "km" },
  { label: "Caixa (cx)", value: "cx" }, { label: "Pacote (pct)", value: "pct" },
  { label: "Resma", value: "resma" }, { label: "Par", value: "par" },
  { label: "Hora (h)", value: "h" }, { label: "Diária", value: "diária" },
  { label: "Mês", value: "mês" }, { label: "Serviço (serv)", value: "serv" },
  { label: "Tonelada (t)", value: "t" },
];

interface ItemModalProps {
  visible: boolean;
  onHide: () => void;
  editingItemId: string | null;
  nome: string; onNomeChange: (v: string) => void;
  descricao: string; onDescricaoChange: (v: string) => void;
  quantidade: string; onQuantidadeChange: (v: string) => void;
  data: string; onDataChange: (v: string) => void;
  unidade: string; onUnidadeChange: (v: string) => void;
  onSalvar: () => void;
}

export default function ItemModal({
  visible, onHide, editingItemId, nome, onNomeChange, descricao, onDescricaoChange,
  quantidade, onQuantidadeChange, data, onDataChange, unidade, onUnidadeChange, onSalvar,
}: ItemModalProps) {
  return (
    <Dialog header={editingItemId ? "Editar Item" : "Novo Item"} visible={visible} style={{ width: "40vw" }} modal onHide={onHide}>
      <div className="flex flex-col gap-3 p-3">
        <label>Nome do Item</label>
        <InputText value={nome} onChange={(e) => onNomeChange(e.target.value)} placeholder="Ex: Fornecimento de materiais" className="w-full" />

        <label>Descrição</label>
        <InputTextarea rows={3} value={descricao} onChange={(e) => onDescricaoChange(e.target.value)} placeholder="Descreva o item brevemente" className="w-full" />

        <label>Quantidade</label>
        <InputText value={quantidade} onChange={(e) => onQuantidadeChange(e.target.value)} className="w-full" />

        <label>Data</label>
        <InputText type="date" value={data} onChange={(e) => onDataChange(e.target.value)} className="w-full" />

        <label>Unidade de Medida</label>
        <Dropdown value={unidade} onChange={(e) => onUnidadeChange(e.value)} options={UNIDADES} className="w-full" placeholder="Selecione a unidade" />

        <Button label="Salvar Item" icon="pi pi-check" className="p-button-success mt-3" onClick={onSalvar} />
      </div>
    </Dialog>
  );
}
