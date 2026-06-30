"use client";

import React, { useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
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

export default function ItensContratoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const contratoId = params.contratoId as string;
  const openItemId = searchParams.get("openItem") ?? undefined;
  const toastRef = useRef<Toast>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [mudarMesOpen, setMudarMesOpen] = useState(false);
  const [novaDataMes, setNovaDataMes] = useState<Date | null>(null);
  const [justificativaMes, setJustificativaMes] = useState("");
  const [salvandoMes, setSalvandoMes] = useState(false);
  const { marcarAprovacoesPorContrato, notificacoes } = useNotificacao();

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node))
        setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useRouteGuard('any');
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  // Ao entrar na página, marca todas as notificações de aprovação do contrato como lidas
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
    handleSaveItem,
    handleToggleAprovado,
    handleEdit,
    handleDelete,
  } = useItemActions(contratoId, fetchItens, contrato?.itensQuantidade, showToast, showConfirm);

  if (!contratoId) {
    return <p className="p-5 text-red-500">Contrato ID não fornecido.</p>;
  }

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
        console.error(err);
        showToast("error", "Erro ao deletar", err.message || "Não foi possível deletar o contrato.");
      }
    });
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

  const exportFormatDate = (d: string) => {
    if (!d) return '-';
    const [y, m, day] = d.split('T')[0].split('-');
    return `${day}/${m}/${y}`;
  };
const exportStatusMap: Record<string, string> = {
    aprovado: 'Aprovado', andamento: 'Em Andamento', urgente: 'Urgente', rascunho: 'Rascunho',
  };

  const handleExportExcel = async () => {
    if (!contrato) return;
    try {
      showToast("info", "Gerando Excel", "Aguarde um momento...");
      const ExcelJS = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      wb.creator = 'Sistema PCA';
      wb.created = new Date();
      const ws = wb.addWorksheet('Contrato', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
      });

      const COLS = 7;
      ws.columns = [
        { key: 'a', width: 30 },
        { key: 'b', width: 36 },
        { key: 'c', width: 9 },
        { key: 'd', width: 14 },
        { key: 'e', width: 20 },
        { key: 'f', width: 20 },
        { key: 'g', width: 12 },
      ];

      const merge = (r: number, value: string | number, style: any, height = 22) => {
        ws.mergeCells(r, 1, r, COLS);
        const cell = ws.getCell(r, 1);
        cell.value = value;
        cell.style = style;
        ws.getRow(r).height = height;
      };

      // ── Cabeçalho ──────────────────────────────────────────
      merge(1, 'PREFEITURA MUNICIPAL DE NAZAREZINHO', {
        font: { bold: true, size: 15, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A4D99' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
      }, 34);

      merge(2, 'Sistema de Gestão do Plano de Contratações Anual — PCA', {
        font: { size: 10, color: { argb: 'FFBFD7F5' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A4D99' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
      }, 18);

      // Faixa dourada
      ws.mergeCells(3, 1, 3, COLS);
      ws.getCell(3, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0C040' } };
      ws.getRow(3).height = 4;

      ws.addRow([]); // linha 4 vazia

      // ── Informações do Contrato ─────────────────────────────
      const infoData = [
        ['Secretaria', secretariaNome || '-'],
        ['Contrato', contrato.nome],
        ['Código de Rastreio', contrato.codigoRastreio || '-'],
        ['Data de Vencimento', exportFormatDate(contrato.data)],
        ['Status', exportStatusMap[contrato.status] || contrato.status],
        ['Situação', contrato.aprovado ? 'Aprovado' : 'Pendente de aprovação'],
      ];

      let r = 5;
      for (const [label, value] of infoData) {
        ws.mergeCells(r, 1, r, 3);
        ws.mergeCells(r, 4, r, COLS);
        const lCell = ws.getCell(r, 1);
        lCell.value = label;
        lCell.style = {
          font: { bold: true, size: 10, color: { argb: 'FF1E3A5F' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF3FB' } },
          alignment: { horizontal: 'left', vertical: 'middle', indent: 1 },
          border: { bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } }, right: { style: 'thin', color: { argb: 'FFD1D5DB' } } },
        };
        const vCell = ws.getCell(r, 4);
        vCell.value = value;
        vCell.style = {
          font: { size: 10, color: { argb: 'FF1F2937' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
          alignment: { horizontal: 'left', vertical: 'middle', indent: 1 },
          border: { bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } } },
        };
        ws.getRow(r).height = 22;
        r++;
      }

      r++; // linha vazia

      // ── Título da seção de itens ────────────────────────────
      merge(r, 'ITENS DO CONTRATO', {
        font: { bold: true, size: 12, color: { argb: 'FF1A4D99' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF3FB' } },
        alignment: { horizontal: 'left', vertical: 'middle', indent: 1 },
        border: { bottom: { style: 'medium', color: { argb: 'FF1A4D99' } }, top: { style: 'medium', color: { argb: 'FF1A4D99' } } },
      }, 26);
      r++;

      // ── Cabeçalho da tabela ─────────────────────────────────
      const headerRow = ws.getRow(r);
      const headers = ['Nome', 'Descrição', 'Qtd', 'Unidade', 'Aprovado'];
      headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.style = {
          font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A4D99' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: { bottom: { style: 'thin', color: { argb: 'FF3B82F6' } }, right: { style: 'thin', color: { argb: 'FF3B82F6' } } },
        };
      });
      headerRow.height = 24;
      r++;

      // ── Linhas dos itens ────────────────────────────────────
      itens.forEach((item, idx) => {
        const bg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';
        const dataRow = ws.getRow(r);
        const values = [
          item.nome,
          item.descricao || '-',
          Number(item.quantidadeItem),
          item.unidadeDeMedida || '-',
          item.aprovado ? '✓ Sim' : '✗ Não',
        ];
        values.forEach((v, i) => {
          const cell = dataRow.getCell(i + 1);
          cell.value = v;
          const isText = i < 2;
          const isAprov = i === 4;
          cell.style = {
            font: { size: 10, color: { argb: isAprov ? (item.aprovado ? 'FF15803D' : 'FFB91C1C') : 'FF1F2937' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
            alignment: { horizontal: isText ? 'left' : 'center', vertical: 'middle', indent: isText ? 1 : 0 },
            border: { bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } }, right: { style: 'hair', color: { argb: 'FFE5E7EB' } } },
          };
        });
        dataRow.height = 20;
        r++;
      });
      r++;

      // ── Rodapé ──────────────────────────────────────────────
      ws.mergeCells(r, 1, r, COLS);
      const footerCell = ws.getCell(r, 1);
      footerCell.value = `Gerado em ${new Date().toLocaleString('pt-BR')} — Sistema PCA | Prefeitura Municipal de Nazarezinho`;
      footerCell.style = { font: { size: 8, color: { argb: 'FF9CA3AF' }, italic: true }, alignment: { horizontal: 'right', vertical: 'middle' } };

      // ── Download ─────────────────────────────────────────────
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${contrato.nome.replace(/\s+/g, '-')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("success", "Excel gerado", "O download foi iniciado.");
    } catch (err) {
      console.error(err);
      showToast("error", "Erro ao gerar Excel", "Não foi possível gerar o Excel.");
    }
  };

  const handleExportDOC = () => {
    if (!contrato) return;
    try {
      showToast("info", "Gerando DOC", "Aguarde um momento...");
      const itensRows = itens.map((item, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        return `
          <tr style="background:${bg}">
            <td style="padding:6px 8px;border:1px solid #e5e7eb">${item.nome}</td>
            <td style="padding:6px 8px;border:1px solid #e5e7eb">${item.descricao || '-'}</td>
            <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${item.quantidadeItem}</td>
            <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${item.unidadeDeMedida || '-'}</td>
            <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center;color:${item.aprovado ? '#15803d' : '#b91c1c'};font-weight:bold">${item.aprovado ? '✓ Sim' : '✗ Não'}</td>
          </tr>`;
      }).join('');

      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><title>${contrato.nome}</title>
        <style>
          body{font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:2cm;color:#1f2937}
          .header-box{background:#1a4d99;padding:18px 24px;margin-bottom:0}
          .header-title{color:#fff;font-size:16pt;font-weight:bold;margin:0}
          .header-sub{color:#bfd7f5;font-size:10pt;margin:4px 0 0 0}
          .gold{height:4px;background:#f0c040;margin:0 0 20px 0}
          .contract-title{font-size:14pt;font-weight:bold;color:#1a4d99;margin-bottom:12px}
          .info-table{width:100%;border-collapse:collapse;margin-bottom:20px}
          .info-table td{padding:7px 10px;border:1px solid #e2e8f0;font-size:10pt}
          .info-table .lbl{background:#eef3fb;font-weight:bold;color:#1e3a5f;width:36%}
          .section-title{font-size:12pt;font-weight:bold;color:#1a4d99;background:#eef3fb;padding:8px 10px;border-top:2px solid #1a4d99;border-bottom:2px solid #1a4d99;margin:20px 0 8px 0}
          .items-table{width:100%;border-collapse:collapse}
          .items-table th{background:#1a4d99;color:#fff;font-weight:bold;padding:8px;text-align:center;border:1px solid #3b82f6;font-size:10pt}
          .items-table td{font-size:10pt}
          .total-row td{background:#eef3fb;font-weight:bold;color:#1a4d99;border-top:2px solid #1a4d99;padding:8px}
          .footer{margin-top:28px;font-size:8pt;color:#9ca3af;text-align:right;font-style:italic}
        </style></head>
        <body>
          <div class="header-box">
            <p class="header-title">PREFEITURA MUNICIPAL DE NAZAREZINHO</p>
            <p class="header-sub">Sistema de Gestão do Plano de Contratações Anual — PCA${secretariaNome ? ` &nbsp;|&nbsp; ${secretariaNome}` : ''}</p>
          </div>
          <div class="gold"></div>
          <p class="contract-title">${contrato.nome}</p>
          <table class="info-table">
            <tr><td class="lbl">Código de Rastreio</td><td>${contrato.codigoRastreio || '-'}</td></tr>
            <tr><td class="lbl">Data de Vencimento</td><td>${exportFormatDate(contrato.data)}</td></tr>
            <tr><td class="lbl">Status</td><td>${exportStatusMap[contrato.status] || contrato.status}</td></tr>
            <tr><td class="lbl">Situação</td><td>${contrato.aprovado ? 'Aprovado' : 'Pendente de aprovação'}</td></tr>
          </table>
          <div class="section-title">ITENS DO CONTRATO</div>
          <table class="items-table">
            <thead><tr>
              <th>Nome</th><th>Descrição</th><th>Qtd</th><th>Unidade</th><th>Aprovado</th>
            </tr></thead>
            <tbody>
              ${itensRows}
            </tbody>
          </table>
          <div class="footer">Gerado em ${new Date().toLocaleString('pt-BR')} — Sistema PCA | Prefeitura Municipal de Nazarezinho</div>
        </body></html>`;

      const blob = new Blob(['﻿', html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${contrato.nome.replace(/\s+/g, '-')}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("success", "DOC gerado", "O download foi iniciado.");
    } catch (err) {
      console.error(err);
      showToast("error", "Erro ao gerar DOC", "Não foi possível gerar o DOC.");
    }
  };

  const handleExportPDF = async () => {
    if (!contrato) return;
    try {
      showToast("info", "Gerando PDF", "Aguarde um momento...");
      const { pdf } = await import('@react-pdf/renderer');
      const { ContratoPDF } = await import('@/components/pdf/ContratoPDF');
      const blob = await pdf(
        <ContratoPDF
          contrato={contrato}
          itens={itens}
          logo={logo}
          secretariaNome={secretariaNome}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${contrato.nome.replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("success", "PDF gerado", "O download foi iniciado.");
    } catch (err) {
      console.error(err);
      showToast("error", "Erro ao gerar PDF", "Não foi possível gerar o PDF.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );

  if (error) return <p className="text-red-500 p-5">Erro: {error}</p>;
  if (!contrato) return <p className="p-5">Contrato não encontrado</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-5">
      <Toast ref={toastRef} position="top-right" />
      <ConfirmDialog />

      <div className="w-full max-w-6xl mx-auto">

        {/* BANNER DE RASCUNHO */}
        {contrato.status === "rascunho" && (
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
              onClick={async () => {
                if (itens.length === 0) {
                  showToast("warn", "Sem itens", "Adicione pelo menos 1 item antes de marcar o contrato como em andamento.");
                  return;
                }
                await contratoService.update(contratoId, { status: "andamento" });
                showToast("success", "Status atualizado", "Contrato marcado como em andamento.");
                fetchItens();
              }}
            />
          </div>
        )}

        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-6 gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <i className="pi pi-arrow-left" />
            Voltar
          </button>
          <div className="flex gap-3 flex-wrap justify-end">
            <div ref={exportMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExportMenu(v => !v)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: '#475569' }}
              >
                <i className="pi pi-download text-xs" />
                Exportar
                <i className={`pi ${showExportMenu ? 'pi-chevron-up' : 'pi-chevron-down'} text-xs`} />
              </button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#fff', borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '1px solid #e5e7eb', overflow: 'hidden',
                  minWidth: '160px', zIndex: 50,
                }}>
                  {[
                    { label: 'PDF', icon: 'pi-file-pdf', color: '#dc2626', fn: handleExportPDF },
                    { label: 'Excel', icon: 'pi-table', color: '#15803d', fn: handleExportExcel },
                    { label: 'DOC', icon: 'pi-file-word', color: '#4f46e5', fn: handleExportDOC },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => { opt.fn(); setShowExportMenu(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        width: '100%', padding: '0.65rem 1rem',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: '0.875rem', fontWeight: 600, color: opt.color,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <i className={`pi ${opt.icon}`} style={{ fontSize: '0.85rem' }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {authService.isAdmin() && (
              <button
                onClick={() => { setNovaDataMes(null); setJustificativaMes(""); setMudarMesOpen(true); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: '#7c3aed' }}
              >
                <i className="pi pi-calendar text-xs" />
                Mudar de Mês
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: '#16a34a' }}
            >
              <i className="pi pi-plus text-xs" />
              Adicionar Item
            </button>
            {authService.isAdmin() && (
              <>
                <button
                  onClick={async () => {
                    try {
                      const { itemService } = await import('@/services/item/itemService');
                      await itemService.aprovarTodos(contratoId);
                      fetchItens();
                    } catch { /* erro silencioso */ }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: '#2563eb' }}
                >
                  <i className="pi pi-check-circle text-xs" />
                  Aprovar Todos
                </button>
                <button
                  onClick={handleDeleteContrato}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <i className="pi pi-trash text-xs" />
                  Deletar Contrato
                </button>
              </>
            )}
          </div>
        </div>

        {/* Nome do contrato acima da tabela */}
        <div className="mb-5 mt-6" style={{
          display: 'inline-block',
          border: '1.5px solid #cbd5e1',
          borderRadius: '14px',
          padding: '0.55rem 1.2rem',
          background: '#fff',
          maxWidth: '100%',
        }}>
          <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
            Contrato
          </span>
          <span style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#1e293b', wordBreak: 'break-word' }}>
            {contrato.nome}
          </span>
          {contrato.codigoRastreio && (
            <span style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'monospace', color: '#94a3b8', marginTop: '0.1rem' }}>
              {contrato.codigoRastreio}
            </span>
          )}
          {contrato.justificativa && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#7c3aed', marginTop: '0.35rem', fontStyle: 'italic' }}>
              <i className="pi pi-calendar mr-1" style={{ fontSize: '0.7rem' }} />
              Justificativa: {contrato.justificativa}
            </span>
          )}
        </div>

        {/* TABELA DE ITENS */}
        <ItensDataTable
          itens={itens}
          onToggleAprovado={handleToggleAprovado}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={authService.isAdmin()}
          openItemId={openItemId}
        />
      </div>

      {/* MODAL DE ADIÇÃO/EDIÇÃO DE ITEM */}
      <Dialog
        header={editingItemId ? "Editar Item" : "Novo Item"}
        visible={isModalOpen}
        style={{ width: "40vw" }}
        modal
        onHide={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col gap-3 p-3">
          <label>Nome do Item</label>
          <InputText value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Ex: Fornecimento de materiais" className="w-full" />

          <label>Descrição</label>
          <InputTextarea rows={3} value={novoDescricao} onChange={(e) => setNovoDescricao(e.target.value)} placeholder="Descreva o item brevemente" className="w-full" />

          <label>Quantidade</label>
          <InputText value={novoQuantidade} onChange={(e) => setNovoQuantidade(e.target.value)} className="w-full" />

          <label>Data</label>
          <InputText type="date" value={novoData} onChange={(e) => setNovoData(e.target.value)} className="w-full" />

          <label>Unidade de Medida</label>
          <Dropdown
            value={novoUnidade}
            onChange={(e) => setNovoUnidade(e.value)}
            options={[
              { label: "Unidade (un)", value: "un" },
              { label: "Quilograma (kg)", value: "kg" },
              { label: "Grama (g)", value: "g" },
              { label: "Litro (L)", value: "L" },
              { label: "Mililitro (mL)", value: "mL" },
              { label: "Metro (m)", value: "m" },
              { label: "Metro quadrado (m²)", value: "m²" },
              { label: "Metro cúbico (m³)", value: "m³" },
              { label: "Centímetro (cm)", value: "cm" },
              { label: "Quilômetro (km)", value: "km" },
              { label: "Caixa (cx)", value: "cx" },
              { label: "Pacote (pct)", value: "pct" },
              { label: "Resma", value: "resma" },
              { label: "Par", value: "par" },
              { label: "Hora (h)", value: "h" },
              { label: "Diária", value: "diária" },
              { label: "Mês", value: "mês" },
              { label: "Serviço (serv)", value: "serv" },
              { label: "Tonelada (t)", value: "t" },
            ]}
            className="w-full"
            placeholder="Selecione a unidade"
          />

          <Button label="Salvar Item" icon="pi pi-check" className="p-button-success mt-3" onClick={handleSaveItem} />
        </div>
      </Dialog>

      {/* MODAL MUDAR DE MÊS */}
      <Dialog
        header="Mudar de Mês"
        visible={mudarMesOpen}
        style={{ width: "38vw" }}
        modal
        onHide={() => setMudarMesOpen(false)}
      >
        <div className="flex flex-col gap-4 p-3">
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm text-purple-800">
            <i className="pi pi-info-circle mr-2" />
            Você está movendo o contrato <strong>{contrato?.nome}</strong> para outro mês.
            Uma justificativa é <strong>obrigatória</strong>.
          </div>

          <label className="font-medium text-gray-700">Nova data de vencimento</label>
          <Calendar
            value={novaDataMes}
            onChange={(e) => setNovaDataMes(e.value as Date)}
            dateFormat="dd/mm/yy"
            placeholder="Selecione a nova data"
            className="w-full"
            showIcon
          />

          <label className="font-medium text-gray-700">
            Justificativa <span className="text-red-500">*</span>
          </label>
          <InputTextarea
            value={justificativaMes}
            onChange={(e) => setJustificativaMes(e.target.value)}
            rows={4}
            placeholder="Descreva o motivo da mudança de mês..."
            className="w-full"
            maxLength={500}
          />
          <span className="text-xs text-gray-400 text-right">{justificativaMes.length}/500</span>

          <Button
            label="Confirmar Mudança"
            icon={salvandoMes ? "pi pi-spin pi-spinner" : "pi pi-check"}
            disabled={salvandoMes}
            className="mt-1"
            style={{ backgroundColor: '#7c3aed', border: 'none' }}
            onClick={handleMudarMes}
          />
        </div>
      </Dialog>
    </div>
  );
}
