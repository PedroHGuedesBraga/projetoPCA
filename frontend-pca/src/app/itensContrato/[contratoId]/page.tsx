"use client";

import React, { useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ItensDataTable from "@/components/cards/ItemCard";
import useItensContrato from "@/hooks/useItensContrato";
import { useItemActions } from "@/hooks/useItemActions";
import { useLogo } from "@/hooks/useLogo";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { contratoService } from "@/services/contrato/contratoService";
import { secretariaService } from "@/services/secretaria/secretariaService";
import { authService } from "@/services/authService";
import { useNotificacao } from "@/context/NotificacaoContext";
import RascunhoBanner from "@/components/itensContrato/RascunhoBanner";
import ItensContratoHeader from "@/components/itensContrato/ItensContratoHeader";
import ContratoInfoBadge from "@/components/itensContrato/ContratoInfoBadge";
import ItemModal from "@/components/itensContrato/ItemModal";
import MudarMesModal from "@/components/itensContrato/MudarMesModal";

export default function ItensContratoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const contratoId = params.contratoId as string;
  const openItemId = searchParams.get("openItem") ?? undefined;
  const toastRef = useRef<Toast>(null);

  const [mudarMesOpen, setMudarMesOpen] = useState(false);
  const [novaDataMes, setNovaDataMes] = useState<Date | null>(null);
  const [justificativaMes, setJustificativaMes] = useState("");
  const [salvandoMes, setSalvandoMes] = useState(false);

  const { marcarAprovacoesPorContrato, notificacoes } = useNotificacao();

  useRouteGuard("any");
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const aprovadosMarcados = useRef(false);
  React.useEffect(() => {
    if (aprovadosMarcados.current || !contratoId) return;
    const temAprovacao = notificacoes.some(
      (n) => !n.lida && n.referenciaId === contratoId && n.tipo === "item_aprovado"
    );
    if (temAprovacao) {
      aprovadosMarcados.current = true;
      marcarAprovacoesPorContrato(contratoId);
    }
  }, [notificacoes, contratoId, marcarAprovacoesPorContrato]);

  const { logo } = useLogo();
  const [secretariaNome, setSecretariaNome] = React.useState<string>("");

  const showToast = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  const showConfirm = (message: string, onAccept: () => void) => {
    confirmDialog({
      message,
      header: "Confirmar ação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, deletar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: onAccept,
    });
  };

  const { contrato, itens, loading, error, fetchItens } = useItensContrato(contratoId);

  React.useEffect(() => {
    if (contrato?.secretariaId) {
      secretariaService.getById(contrato.secretariaId).then((s) => {
        if (s?.nome) setSecretariaNome(s.nome);
      });
    }
  }, [contrato?.secretariaId]);

  const {
    isModalOpen, setIsModalOpen, editingItemId,
    novoNome, setNovoNome,
    novoDescricao, setNovoDescricao,
    novoQuantidade, setNovoQuantidade,
    novoData, setNovoData,
    novoUnidade, setNovoUnidade,
    handleSaveItem, handleToggleAprovado, handleEdit, handleDelete,
  } = useItemActions(contratoId, fetchItens, contrato?.itensQuantidade, showToast, showConfirm);

  if (!contratoId) return <p className="p-5 text-red-500">Contrato ID não fornecido.</p>;

  const handleBack = () => router.back();

  const handleDeleteContrato = () => {
    showConfirm("Tem certeza que deseja deletar este contrato e todos os seus itens?", async () => {
      try {
        const contratoData = await contratoService.getById(contratoId);
        if (!contratoData || !contratoData.secretariaId || !contratoData.data) {
          showToast("error", "Erro", "Não foi possível carregar os dados do contrato.");
          return;
        }
        const date = new Date(contratoData.data);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        await contratoService.delete(contratoId);
        showToast("success", "Contrato deletado", "O contrato foi removido com sucesso.");
        setTimeout(() => {
          router.push(`/contratosSecretaria/${contratoData.secretariaId}?year=${year}&month=${month}`);
        }, 1500);
      } catch (err: any) {
        showToast("error", "Erro ao deletar", err.message || "Não foi possível deletar o contrato.");
      }
    });
  };

  const handleMarcarAndamento = async () => {
    if (itens.length === 0) {
      showToast("warn", "Sem itens", "Adicione pelo menos 1 item antes de marcar o contrato como em andamento.");
      return;
    }
    await contratoService.update(contratoId, { status: "andamento" });
    showToast("success", "Status atualizado", "Contrato marcado como em andamento.");
    fetchItens();
  };

  const handleAprovarTodos = async () => {
    try {
      const { itemService } = await import("@/services/item/itemService");
      await itemService.aprovarTodos(contratoId);
      fetchItens();
    } catch { /* erro silencioso */ }
  };

  const handleMudarMes = async () => {
    if (!novaDataMes) { showToast("warn", "Campo obrigatório", "Selecione a nova data."); return; }
    if (!justificativaMes.trim()) { showToast("warn", "Campo obrigatório", "A justificativa é obrigatória."); return; }
    setSalvandoMes(true);
    try {
      const dataStr = novaDataMes.toISOString().split("T")[0];
      await contratoService.mudarMes(contratoId, { data: dataStr, justificativa: justificativaMes.trim() });
      showToast("success", "Mês alterado", "O contrato foi movido com sucesso.");
      setMudarMesOpen(false);
      setNovaDataMes(null);
      setJustificativaMes("");
      setTimeout(() => fetchItens(), 500);
    } catch {
      showToast("error", "Erro ao mudar mês", "Não foi possível alterar a data do contrato.");
    } finally {
      setSalvandoMes(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><ProgressSpinner /></div>;
  if (error) return <p className="text-red-500 p-5">Erro: {error}</p>;
  if (!contrato) return <p className="p-5">Contrato não encontrado</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-5">
      <Toast ref={toastRef} position="top-right" />
      <ConfirmDialog />

      <div className="w-full max-w-6xl mx-auto">
        {contrato.status === "rascunho" && (
          <RascunhoBanner
            onMarcarAndamento={handleMarcarAndamento}
          />
        )}

        <ItensContratoHeader
          contrato={contrato}
          itens={itens}
          logo={logo}
          secretariaNome={secretariaNome}
          onBack={handleBack}
          onAddItem={() => setIsModalOpen(true)}
          onMudarMes={() => { setNovaDataMes(null); setJustificativaMes(""); setMudarMesOpen(true); }}
          onAprovarTodos={handleAprovarTodos}
          onDeleteContrato={handleDeleteContrato}
          showToast={showToast}
        />

        <ContratoInfoBadge
          nome={contrato.nome}
          codigoRastreio={contrato.codigoRastreio}
          justificativa={contrato.justificativa}
        />

        <ItensDataTable
          itens={itens}
          onToggleAprovado={handleToggleAprovado}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={authService.isAdmin()}
          openItemId={openItemId}
        />
      </div>

      <ItemModal
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        editingItemId={editingItemId}
        nome={novoNome} onNomeChange={setNovoNome}
        descricao={novoDescricao} onDescricaoChange={setNovoDescricao}
        quantidade={novoQuantidade} onQuantidadeChange={setNovoQuantidade}
        data={novoData} onDataChange={setNovoData}
        unidade={novoUnidade} onUnidadeChange={setNovoUnidade}
        onSalvar={handleSaveItem}
      />

      <MudarMesModal
        visible={mudarMesOpen}
        onHide={() => setMudarMesOpen(false)}
        contratoNome={contrato?.nome ?? ""}
        novaData={novaDataMes}
        onNovaDataChange={setNovaDataMes}
        justificativa={justificativaMes}
        onJustificativaChange={setJustificativaMes}
        salvando={salvandoMes}
        onConfirmar={handleMudarMes}
      />
    </div>
  );
}
