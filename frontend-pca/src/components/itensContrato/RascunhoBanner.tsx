import { Button } from "primereact/button";

interface RascunhoBannerProps {
  onMarcarAndamento: () => void;
}

export default function RascunhoBanner({ onMarcarAndamento }: RascunhoBannerProps) {
  return (
    <div className="flex align-items-center justify-content-between gap-3 bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-lg">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-pencil text-yellow-600 text-xl" />
        <span className="text-yellow-800 font-semibold">Este contrato está em rascunho.</span>
        <span className="text-yellow-700 text-sm">Adicione os itens e finalize quando estiver pronto.</span>
      </div>
      <Button
        label="Marcar como Andamento"
        icon="pi pi-check"
        severity="warning"
        className="p-button-sm"
        onClick={onMarcarAndamento}
      />
    </div>
  );
}
