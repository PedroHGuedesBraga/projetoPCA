import { useState } from "react";
import { itemService } from "@/services/item/itemService";
import { contratoService } from "@/services/contrato/contratoService";
import { Item } from "@/types/item";

type ToastFn = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => void;
type ConfirmFn = (message: string, onAccept: () => void) => void;

export function useItemActions(
  contratoId: string,
  fetchItens: () => void,
  itensQuantidade?: number,
  showToast?: ToastFn,
  showConfirm?: ConfirmFn
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoDescricao, setNovoDescricao] = useState("");
  const [novoQuantidade, setNovoQuantidade] = useState("");
  const [novoData, setNovoData] = useState(new Date().toISOString().substring(0, 10));
  const [novoUnidade, setNovoUnidade] = useState("un");
  const [loading, setLoading] = useState(false);

  const toast: ToastFn = showToast ?? ((_severity, summary, detail) => alert(detail || summary));
  const confirm: ConfirmFn = showConfirm ?? ((message, onAccept) => { if (window.confirm(message)) onAccept(); });

  // --- ABRIR MODAL DE EDIÇÃO ---
  const handleEdit = (item: Item) => {
    setEditingItemId(item.id);
    setNovoNome(item.nome);
    setNovoDescricao(item.descricao || "");
    setNovoQuantidade(String(item.quantidadeItem));
    setNovoData(item.data ? item.data.substring(0, 10) : new Date().toISOString().substring(0, 10));
    setNovoUnidade(item.unidadeDeMedida || "un");
    setIsModalOpen(true);
  };

  // --- SALVAR ITEM (CRIAR OU EDITAR) ---
  const handleSaveItem = async () => {
    if (!novoNome.trim()) {
      toast("warn", "Campo obrigatório", "Preencha o nome do item.");
      return;
    }
    if (!novoQuantidade || isNaN(Number(novoQuantidade.replace(",", "."))) || Number(novoQuantidade.replace(",", ".")) <= 0) {
      toast("warn", "Campo obrigatório", "Informe uma quantidade válida (maior que zero).");
      return;
    }
    if (!novoData) {
      toast("warn", "Campo obrigatório", "Informe a data do item.");
      return;
    }
    setLoading(true);

    try {
      const quantidadeNum = Number(novoQuantidade.replace(",", "."));

      const payload: Partial<Item> = {
        nome: novoNome,
        descricao: novoDescricao,
        quantidadeItem: quantidadeNum,
        data: novoData,
        unidadeDeMedida: novoUnidade,
      };

      if (editingItemId) {
        await itemService.update(editingItemId, payload);
        toast("success", "Item atualizado", "As alterações foram salvas.");
      } else {
        await itemService.create({ ...payload, contratoId, aprovado: false, id: "" });
        await contratoService.update(contratoId, { itensQuantidade: (itensQuantidade || 0) + 1 });
        toast("success", "Item adicionado", "O item foi criado com sucesso.");
      }

      setIsModalOpen(false);
      fetchItens();

      setNovoNome("");
      setNovoDescricao("");
      setNovoQuantidade("");
      setNovoData(new Date().toISOString().substring(0, 10));
      setNovoUnidade("un");
      setEditingItemId(null);

    } catch (err) {
      console.error(err);
      toast("error", "Erro ao salvar", "Não foi possível salvar o item.");
    } finally {
      setLoading(false);
    }
  };

  // --- TOGGLE APROVADO (admin only) ---
  const handleToggleAprovado = async (item: Item) => {
    try {
      await itemService.toggleAprovado(item.id, !item.aprovado);
      fetchItens();
    } catch (err) {
      console.error(err);
      toast("error", "Erro", "Não foi possível atualizar a aprovação do item.");
    }
  };

  // --- DELETE ITEM ---
  const handleDelete = (item: Item) => {
    confirm(`Deseja deletar o item "${item.nome}"?`, async () => {
      try {
        await itemService.delete(item.id);
        await contratoService.update(contratoId, { itensQuantidade: Math.max(0, (itensQuantidade || 0) - 1) });
        fetchItens();
        toast("success", "Item removido", `"${item.nome}" foi deletado.`);
      } catch (err) {
        console.error(err);
        toast("error", "Erro ao deletar", "Não foi possível deletar o item.");
      }
    });
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editingItemId,
    novoNome,
    setNovoNome,
    novoDescricao,
    setNovoDescricao,
    novoQuantidade,
    setNovoQuantidade,
    novoData,
    setNovoData,
    novoUnidade,
    setNovoUnidade,
    loading,
    handleSaveItem,
    handleToggleAprovado,
    handleEdit,
    handleDelete,
  };
}
