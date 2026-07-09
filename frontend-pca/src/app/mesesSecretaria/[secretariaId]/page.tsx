"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useMesesSecretaria } from "@/hooks/useMesesSecretaria";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { contratoService } from "@/services/contrato/contratoService";
import { itemService } from "@/services/item/itemService";
import { secretariaService } from "@/services/secretaria/secretariaService";
import { useNotificacao } from "@/context/NotificacaoContext";
import MesesHeader from "@/components/mesesSecretaria/MesesHeader";
import AnoSelector from "@/components/mesesSecretaria/AnoSelector";
import MesesGrid from "@/components/mesesSecretaria/MesesGrid";
import NovoContratoModal from "@/components/mesesSecretaria/NovoContratoModal";

export default function MesesSecretariaPage() {
  const params = useParams();
  const secretariaId = params.secretariaId as string;
  const router = useRouter();
  const toastRef = useRef<Toast>(null);

  useRouteGuard("any", secretariaId);
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const { temNotifContrato } = useNotificacao();
  const { loading, error, secretariaNome, contratosOrganizados, anoSelecionado, setAnoSelecionado } =
    useMesesSecretaria(secretariaId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [data, setData] = useState<Date | null>(null);
  const [status, setStatus] = useState("andamento");
  const [importarItens, setImportarItens] = useState(false);
  const [clonando, setClonando] = useState(false);

  const anoAtual = anoSelecionado ?? String(new Date().getFullYear());

  const ultimoContrato = React.useMemo(() => {
    const anos = Object.keys(contratosOrganizados).sort((a, b) => parseInt(b) - parseInt(a));
    for (const ano of anos) {
      const meses = Object.keys(contratosOrganizados[ano]).sort((a, b) => parseInt(b) - parseInt(a));
      for (const mes of meses) {
        const lista = contratosOrganizados[ano][mes] as any[];
        if (lista.length > 0) return lista[lista.length - 1];
      }
    }
    return null;
  }, [contratosOrganizados]);

  const showToast = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  const handleClonarAno = () => {
    const anoOrigem = parseInt(anoAtual);
    const anoDestino = anoOrigem + 1;
    const temContratosDestino = Object.keys(contratosOrganizados[String(anoDestino)] ?? {}).some(
      (mes) => ((contratosOrganizados[String(anoDestino)] as any)[mes] as any[]).length > 0
    );
    const totalContratos = Object.values(contratosOrganizados[String(anoOrigem)] ?? {}).reduce(
      (s, lista) => s + (lista as any[]).length, 0
    );
    if (totalContratos === 0) { showToast("warn", "Nenhum contrato", `Não há contratos em ${anoOrigem} para clonar.`); return; }
    confirmDialog({
      message: temContratosDestino
        ? `Já existem contratos em ${anoDestino}. Deseja clonar os ${totalContratos} contrato(s) de ${anoOrigem} e misturar com os existentes?`
        : `Deseja clonar os ${totalContratos} contrato(s) de ${anoOrigem} para ${anoDestino} como rascunhos?`,
      header: `Clonar para ${anoDestino}`,
      icon: temContratosDestino ? "pi pi-exclamation-triangle" : "pi pi-copy",
      acceptLabel: "Sim, clonar", rejectLabel: "Cancelar", acceptClassName: "p-button-primary",
      accept: async () => {
        setClonando(true);
        try {
          const { clonados, anoDestino: ano } = await contratoService.clonarAno(secretariaId, anoOrigem);
          showToast("success", "Clonagem concluída", `${clonados} contrato(s) criados como rascunho em ${ano}.`);
          setTimeout(() => window.location.reload(), 2000);
        } catch (err: any) {
          showToast("error", "Erro ao clonar", err?.response?.data?.message || "Não foi possível clonar os contratos.");
        } finally {
          setClonando(false);
        }
      },
    });
  };

  const handleDeleteSecretaria = () => {
    confirmDialog({
      message: "Deseja realmente deletar esta secretaria e todos os seus contratos?",
      header: "Confirmar exclusão",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, deletar", rejectLabel: "Cancelar", acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await secretariaService.delete(secretariaId);
          showToast("success", "Secretaria deletada", "Redirecionando...");
          setTimeout(() => router.push("/home"), 1500);
        } catch {
          showToast("error", "Erro ao deletar", "Não foi possível deletar a secretaria.");
        }
      },
    });
  };

  const handleSaveContrato = async () => {
    if (!nome.trim()) { showToast("warn", "Campo obrigatório", "Preencha o nome do contrato."); return; }
    if (!data) { showToast("warn", "Campo obrigatório", "Selecione a data do contrato."); return; }
    try {
      const payload = { nome, data: data.toISOString().split("T")[0], status, aprovado: false, secretariaId, itensQuantidade: 0 };
      const novoContrato = await contratoService.create(payload);
      if (importarItens && ultimoContrato) {
        const { itens } = await contratoService.getItensByContrato(ultimoContrato.id);
        if (itens?.length > 0) {
          await Promise.all(itens.map((item: any) =>
            itemService.create({ nome: item.nome, descricao: item.descricao, quantidadeItem: item.quantidadeItem, data: novoContrato.data, unidadeDeMedida: item.unidadeDeMedida, aprovado: false, contratoId: novoContrato.id })
          ));
          await contratoService.update(novoContrato.id, { itensQuantidade: itens.length });
        }
      }
      setIsModalOpen(false);
      setImportarItens(false);
      if (importarItens && ultimoContrato) showToast("success", "Contrato criado", `${ultimoContrato.itensQuantidade} itens importados do último contrato.`);
      else if (status === "andamento") showToast("info", "Contrato criado", "Lembre-se de adicionar pelo menos 1 item ao contrato.");
      else showToast("success", "Contrato criado", "O contrato foi criado com sucesso.");
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      showToast("error", "Erro ao criar", "Não foi possível criar o contrato.");
    }
  };

  if (loading) return <div className="flex justify-content-center align-items-center min-h-screen"><ProgressSpinner /></div>;
  if (error) return <p className="text-red-500 p-5">Erro: {error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-5">
      <Toast ref={toastRef} position="top-right" />
      <ConfirmDialog />
      <div className="w-full max-w-6xl mx-auto">
        <MesesHeader
          secretariaNome={secretariaNome}
          clonando={clonando}
          anoSelecionado={anoAtual}
          onBack={() => router.push("/home")}
          onAddContrato={() => setIsModalOpen(true)}
          onClonarAno={handleClonarAno}
          onDeleteSecretaria={handleDeleteSecretaria}
        />
        <AnoSelector anoSelecionado={anoAtual} onAnoChange={setAnoSelecionado} />
        <MesesGrid
          anoSelecionado={anoAtual}
          contratosOrganizados={contratosOrganizados}
          temNotifContrato={temNotifContrato}
          onMonthClick={(ano, mes) => router.push(`/calendarioMes/${secretariaId}/${ano}/${mes}`)}
        />
      </div>
      <NovoContratoModal
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        secretariaNome={secretariaNome}
        nome={nome} onNomeChange={setNome}
        data={data} onDataChange={setData}
        status={status} onStatusChange={setStatus}
        importarItens={importarItens} onImportarItensChange={setImportarItens}
        ultimoContrato={ultimoContrato}
        onSalvar={handleSaveContrato}
      />
    </div>
  );
}
