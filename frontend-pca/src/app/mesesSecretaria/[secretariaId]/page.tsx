"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputSwitch } from "primereact/inputswitch";
import { useMesesSecretaria } from "@/hooks/useMesesSecretaria";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { authService } from "@/services/authService";
import { contratoService } from "@/services/contrato/contratoService";
import { itemService } from "@/services/item/itemService";
import { secretariaService } from "@/services/secretaria/secretariaService";
import MesesCard from "@/components/cards/MesesCard";
import { useNotificacao } from "@/context/NotificacaoContext";

const mesesNomes: Record<string, string> = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro",
};

export default function MesesSecretariaPage() {
  const params = useParams();
  const secretariaId = params.secretariaId as string;
  const router = useRouter();
  const toastRef = useRef<Toast>(null);

  useRouteGuard('any', secretariaId);
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

  const handleMonthClick = (ano: string, mes: string) => {
    router.push(`/calendarioMes/${secretariaId}/${ano}/${mes}`);
  };

  const handleClonarAno = () => {
    const anoOrigem = parseInt(anoSelecionado ?? String(new Date().getFullYear()));
    const anoDestino = anoOrigem + 1;
    const temContratosDestino = Object.keys(contratosOrganizados[String(anoDestino)] ?? {}).some(
      (mes) => ((contratosOrganizados[String(anoDestino)] as any)[mes] as any[]).length > 0
    );

    const totalContratos = Object.values(contratosOrganizados[String(anoOrigem)] ?? {}).reduce(
      (s, lista) => s + (lista as any[]).length, 0
    );

    if (totalContratos === 0) {
      showToast("warn", "Nenhum contrato", `Não há contratos em ${anoOrigem} para clonar.`);
      return;
    }

    confirmDialog({
      message: temContratosDestino
        ? `Já existem contratos em ${anoDestino}. Deseja clonar os ${totalContratos} contrato(s) de ${anoOrigem} e misturar com os existentes?`
        : `Deseja clonar os ${totalContratos} contrato(s) de ${anoOrigem} para ${anoDestino} como rascunhos?`,
      header: `Clonar para ${anoDestino}`,
      icon: temContratosDestino ? "pi pi-exclamation-triangle" : "pi pi-copy",
      acceptLabel: "Sim, clonar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-primary",
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
      acceptLabel: "Sim, deletar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await secretariaService.delete(secretariaId);
          showToast("success", "Secretaria deletada", "Redirecionando...");
          setTimeout(() => router.push("/home"), 1500);
        } catch (error) {
          console.error("Erro ao deletar secretaria:", error);
          showToast("error", "Erro ao deletar", "Não foi possível deletar a secretaria.");
        }
      },
    });
  };

  const handleSaveContrato = async () => {
    if (!nome.trim()) {
      showToast("warn", "Campo obrigatório", "Preencha o nome do contrato.");
      return;
    }
    if (!data) {
      showToast("warn", "Campo obrigatório", "Selecione a data do contrato.");
      return;
    }

    try {
      const payload = {
        nome,
        data: data.toISOString().split("T")[0],
        status,
        aprovado: false,
        secretariaId,
        itensQuantidade: 0,
      };

      const novoContrato = await contratoService.create(payload);

      if (importarItens && ultimoContrato) {
        const { itens } = await contratoService.getItensByContrato(ultimoContrato.id);
        if (itens && itens.length > 0) {
          await Promise.all(itens.map((item: any) =>
            itemService.create({
              nome: item.nome,
              descricao: item.descricao,
              quantidadeItem: item.quantidadeItem,
              data: novoContrato.data,
              unidadeDeMedida: item.unidadeDeMedida,
              aprovado: false,
              contratoId: novoContrato.id,
            })
          ));
          await contratoService.update(novoContrato.id, { itensQuantidade: itens.length });
        }
      }

      setIsModalOpen(false);
      setImportarItens(false);
      if (importarItens && ultimoContrato) {
        showToast("success", "Contrato criado", `${ultimoContrato.itensQuantidade} itens importados do último contrato.`);
      } else if (status === "andamento") {
        showToast("info", "Contrato criado", "Lembre-se de adicionar pelo menos 1 item ao contrato.");
      } else {
        showToast("success", "Contrato criado", "O contrato foi criado com sucesso.");
      }
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      console.error("Erro ao criar contrato:", err);
      showToast("error", "Erro ao criar", "Não foi possível criar o contrato.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );

  if (error) return <p className="text-red-500 p-5">Erro: {error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-5">
      <Toast ref={toastRef} position="top-right" />
      <ConfirmDialog />

      <div className="w-full max-w-6xl mx-auto">
        {/* Cabeçalho: Voltar | Secretaria | Botões */}
        <div className="flex items-center mb-4 gap-4">

          {/* Esquerda: Voltar */}
          <div className="flex-1 flex items-center">
            {authService.isAdmin() && (
              <button
                onClick={() => router.push("/home")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <i className="pi pi-arrow-left" />
                Voltar
              </button>
            )}
          </div>

          {/* Centro: caixa da secretaria */}
          <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest leading-none mb-1">Secretaria</p>
            <h1 className="text-lg font-bold text-gray-800 leading-tight whitespace-nowrap">{secretariaNome}</h1>
          </div>

          {/* Direita: botões de ação */}
          <div className="flex-1 flex flex-row gap-2 items-center justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold whitespace-nowrap shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: '#16a34a' }}
            >
              <i className="pi pi-plus text-xs" />
              Adicionar Contrato
            </button>
            {authService.isAdmin() && (
              <button
                onClick={handleClonarAno}
                disabled={clonando}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold whitespace-nowrap shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#7c3aed' }}
              >
                <i className={`pi ${clonando ? 'pi-spin pi-spinner' : 'pi-copy'} text-xs`} />
                Clonar para {parseInt(anoSelecionado ?? String(new Date().getFullYear())) + 1}
              </button>
            )}
            {authService.isAdmin() && (
              <button
                onClick={handleDeleteSecretaria}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold whitespace-nowrap shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: '#dc2626' }}
              >
                <i className="pi pi-trash text-xs" />
                Deletar Secretaria
              </button>
            )}
          </div>

        </div>

        {/* Seletor de ano — logo acima dos cards */}
        <div className="flex items-center justify-start mb-3 pl-1">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl shadow-sm px-3 py-1.5">
            <button
              onClick={() => setAnoSelecionado(String(parseInt(anoSelecionado ?? String(new Date().getFullYear())) - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer text-gray-500 text-base font-bold select-none"
            >‹</button>
            <span className="text-base font-bold text-gray-700 px-2 min-w-[3.5rem] text-center tabular-nums">
              {anoSelecionado ?? new Date().getFullYear()}
            </span>
            <button
              onClick={() => setAnoSelecionado(String(parseInt(anoSelecionado ?? String(new Date().getFullYear())) + 1))}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer text-gray-500 text-base font-bold select-none"
            >›</button>
          </div>
        </div>

        {/* 12 meses fixos em ordem */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {["01","02","03","04","05","06","07","08","09","10","11","12"].map((mes) => {
            const ano = anoSelecionado ?? String(new Date().getFullYear());
            const contratos: any[] = contratosOrganizados[ano]?.[mes] ?? [];
            return (
              <MesesCard
                key={mes}
                monthName={mesesNomes[mes]}
                totalCount={contratos.length}
                onClick={() => handleMonthClick(ano, mes)}
                hasNotif={contratos.some((c) => temNotifContrato(c.id))}
              />
            );
          })}
        </div>
      </div>

      {/* Modal Novo Contrato */}
      <Dialog
        header="Novo Contrato"
        visible={isModalOpen}
        style={{ width: "40vw" }}
        modal
        onHide={() => setIsModalOpen(false)}
      >
        <div className="flex flex-column gap-3 p-3">
          <label htmlFor="secretaria">Secretaria</label>
          <InputText id="secretaria" value={secretariaNome} disabled className="w-full" />

          <label htmlFor="nome">Nome do Contrato</label>
          <InputText
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Contrato de fornecimento"
            className="w-full"
          />

          <label htmlFor="data">Data</label>
          <Calendar
            id="data"
            value={data}
            onChange={(e) => setData(e.value as Date)}
            dateFormat="dd/mm/yy"
            placeholder="Selecione a data"
            className="w-full"
          />

          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={[
              { label: "Rascunho", value: "rascunho" },
              { label: "Andamento", value: "andamento" },
              { label: "Urgente", value: "urgente" },
            ]}
            onChange={(e) => setStatus(e.value)}
            className="w-full"
          />

          {ultimoContrato && (
            <div className="border border-blue-100 rounded-lg p-3 bg-blue-50 mt-1">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    <i className="pi pi-history mr-2" />
                    Último contrato
                  </p>
                  <p className="text-sm text-blue-700">{ultimoContrato.nome}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {ultimoContrato.itensQuantidade} {ultimoContrato.itensQuantidade === 1 ? 'item' : 'itens'}
                    {ultimoContrato.codigoRastreio && ` · ${ultimoContrato.codigoRastreio}`}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <InputSwitch
                    checked={importarItens}
                    onChange={(e) => setImportarItens(e.value)}
                  />
                  <span className="text-xs text-blue-600">Importar itens</span>
                </div>
              </div>
            </div>
          )}

          <Button
            label="Salvar Contrato"
            icon="pi pi-check"
            className="p-button-success mt-3"
            onClick={handleSaveContrato}
          />
        </div>
      </Dialog>
    </div>
  );
}
