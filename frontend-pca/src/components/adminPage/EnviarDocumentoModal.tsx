import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";

interface EnviarDocumentoModalProps {
  visible: boolean;
  onHide: () => void;
  nomeEmpresa: string;
  onNomeEmpresaChange: (value: string) => void;
  dataContrato: Date | null;
  onDataContratoChange: (value: Date | null) => void;
  arquivo: File | null;
  onArquivoChange: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onEnviar: () => void;
}

export default function EnviarDocumentoModal({
  visible, onHide, nomeEmpresa, onNomeEmpresaChange,
  dataContrato, onDataContratoChange, arquivo, onArquivoChange,
  fileInputRef, onEnviar,
}: EnviarDocumentoModalProps) {
  return (
    <Dialog header="Enviar Documento Aprovado" visible={visible} style={{ width: "38vw" }} modal onHide={onHide}>
      <div className="flex flex-col gap-3 p-3">
        <label>Nome da Empresa</label>
        <InputText value={nomeEmpresa} onChange={(e) => onNomeEmpresaChange(e.target.value)} placeholder="Ex: Construtora ABC Ltda" className="w-full" />

        <label>Data do Contrato</label>
        <Calendar value={dataContrato} onChange={(e) => onDataContratoChange(e.value as Date)} dateFormat="dd/mm/yy" placeholder="Selecione a data" className="w-full" showIcon />

        <label>Arquivo PDF</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => onArquivoChange(e.target.files?.[0] ?? null)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold"
        />
        {arquivo && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <i className="pi pi-check-circle" /> {arquivo.name}
          </p>
        )}

        <Button label="Enviar" icon="pi pi-upload" className="p-button-success mt-3" onClick={onEnviar} />
      </div>
    </Dialog>
  );
}
