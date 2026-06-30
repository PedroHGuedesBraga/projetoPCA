"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Badge } from "primereact/badge";
import ContratoCard from "@/components/cards/ContratoCard";
import { secretariaService } from "@/services/secretaria/secretariaService";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useNotificacao } from "@/context/NotificacaoContext";

// Mapeamento de número -> nome do mês
const MONTH_NAMES: { [key: string]: string } = {
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

export default function ContratosSecretariaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const secretariaId = params.secretariaId as string;
  const yearParam = searchParams.get("year") || "";
  const monthParam = searchParams.get("month") || "";

  useRouteGuard('any', secretariaId);
  const { temNotifContrato } = useNotificacao();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [secretariaNome, setSecretariaNome] = React.useState<string>("");
  const [contratosFiltrados, setContratosFiltrados] = React.useState<any[]>([]);

  const contratosPriorizados = React.useMemo(() => {
    const calcPrioridade = (c: any): number => {
      if (c.aprovado) return 7;
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const d = new Date(c.data); d.setHours(0,0,0,0);
      const dias = Math.ceil((d.getTime() - hoje.getTime()) / 86400000);
      if (dias < 0)               return 0; // vencido
      if (c.status === 'urgente') return 1; // urgente
      if (dias <= 3)              return 2; // crítico
      if (dias <= 30)             return 3; // próximo
      if (c.status === 'andamento') return 4; // em andamento
      if (c.status === 'rascunho')  return 5; // rascunho
      return 6;
    };
    return [...contratosFiltrados].sort((a, b) => {
      const diff = calcPrioridade(a) - calcPrioridade(b);
      if (diff !== 0) return diff;
      // Dentro do mesmo nível, mais próximo do vencimento primeiro
      return new Date(a.data).getTime() - new Date(b.data).getTime();
    });
  }, [contratosFiltrados]);
  const [viewMode, setViewMode] = React.useState<'cards' | 'lista'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('contratosViewMode') as 'cards' | 'lista') || 'cards';
    }
    return 'cards';
  });
  const [globalFilter, setGlobalFilter] = React.useState("");

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  React.useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true);
        // Buscar todos os contratos organizados por ano/mês
        const res = await secretariaService.getContratosOrganizados(secretariaId);

        // Buscar nome da secretaria
        const secretaria = await secretariaService.getById(secretariaId);
        setSecretariaNome(secretaria?.nome || "Secretaria");

        // Filtrar contratos do ano e mês selecionado
        const contratosDoAno = res[yearParam] || {};
        const contratosDoMes = contratosDoAno[monthParam] || [];
        setContratosFiltrados(contratosDoMes);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Erro ao buscar contratos");
      } finally {
        setLoading(false);
      }
    };

    if (yearParam && monthParam) {
      fetchContratos();
    } else {
      setContratosFiltrados([]);
      setLoading(false);
    }
  }, [secretariaId, yearParam, monthParam]);

  const monthTitle = monthParam ? MONTH_NAMES[monthParam] || "Mês Desconhecido" : "Mês Desconhecido";

  if (loading)
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );

  if (error) return <p className="text-red-500 p-5">Erro: {error}</p>;

  if (!secretariaNome && contratosFiltrados.length === 0)
    return <p className="p-5">Secretaria não encontrada ou não há contratos neste período</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-5">
      <div className="w-full max-w-6xl mx-auto">
        {/* BARRA SUPERIOR */}
        <div className="flex items-center mb-4 gap-4">

          {/* ESQUERDA: Voltar */}
          <div className="flex-1 flex items-start">
            <button
              onClick={() => router.push(`/mesesSecretaria/${secretariaId}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <i className="pi pi-arrow-left" />
              Voltar
            </button>
          </div>

          {/* CENTRO: caixa da secretaria */}
          <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest leading-none mb-1">Secretaria</p>
            <h2 className="text-lg font-bold text-gray-800 leading-tight whitespace-nowrap">{secretariaNome}</h2>
          </div>

          {/* DIREITA: toggles */}
          <div className="flex-1 flex gap-2 justify-end">
            <Button
              icon="pi pi-th-large"
              tooltip="Visualização em cards"
              className={`p-button-sm ${viewMode === 'cards' ? 'p-button-primary' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => {
                setViewMode('cards');
                localStorage.setItem('contratosViewMode', 'cards');
              }}
            />
            <Button
              icon="pi pi-list"
              tooltip="Visualização em lista"
              className={`p-button-sm ${viewMode === 'lista' ? 'p-button-primary' : 'p-button-outlined p-button-secondary'}`}
              onClick={() => {
                setViewMode('lista');
                localStorage.setItem('contratosViewMode', 'lista');
              }}
            />
          </div>
        </div>

        {/* LISTA DE CONTRATOS */}
        {contratosFiltrados.length === 0 ? (
          <div className="text-center p-5 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-700">
              Não há contratos para <strong>{monthTitle}</strong> de <strong>{yearParam}</strong>.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {contratosPriorizados.map((contrato) => (
              <ContratoCard
                key={contrato.id}
                contratoId={contrato.id}
                contratoNome={contrato.nome}
                itemCount={contrato.itensQuantidade}
                codigoRastreio={contrato.codigoRastreio}
                hasNotif={temNotifContrato(contrato.id)}
                data={contrato.data}
                createdAt={contrato.createdAt}
                aprovado={contrato.aprovado}
                status={
                  contrato.aprovado
                    ? "aprovado"
                    : contrato.itensQuantidade === 0 || contrato.status === "rascunho"
                    ? "rascunho"
                    : contrato.status === "urgente"
                    ? "urgente"
                    : "andamento"
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Barra de busca + resumo */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <span className="text-sm text-gray-500 font-medium">
                <i className="pi pi-file-o mr-2 text-blue-500" />
                {contratosFiltrados.length} contrato{contratosFiltrados.length !== 1 ? 's' : ''} em {monthTitle}/{yearParam}
              </span>
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none z-10" />
                <InputText
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Buscar contrato..."
                  className="pl-9 pr-3 py-2 text-sm w-56 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:border-blue-400"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <style>{`
              .contratos-lista .p-datatable-tbody > tr {
                transition: background 0.15s, box-shadow 0.15s;
              }
              .contratos-lista .p-datatable-tbody > tr:hover {
                background: #eff6ff !important;
                box-shadow: inset 3px 0 0 #3b82f6;
              }
              .contratos-lista .p-datatable-tbody > tr:hover td:first-child {
                padding-left: calc(1rem - 3px);
              }
              .contratos-lista .p-datatable-thead > tr > th {
                background: #f8fafc;
                color: #64748b;
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                border-bottom: 2px solid #e2e8f0;
                border-right: 1px solid #e9edf2;
              }
              .contratos-lista .p-datatable-thead > tr > th:last-child {
                border-right: none;
              }
              .contratos-lista .p-datatable-tbody > tr > td {
                border-bottom: 1px solid #f1f5f9;
                border-right: 1px solid #f1f5f9;
                padding: 0.875rem 1rem;
              }
              .contratos-lista .p-datatable-tbody > tr > td:last-child {
                border-right: none;
              }
            `}</style>

            <DataTable
              value={contratosPriorizados}
              dataKey="id"
              size="normal"
              paginator
              rows={12}
              globalFilter={globalFilter}
              globalFilterFields={["nome", "codigoRastreio"]}
              emptyMessage={
                <div className="text-center py-10 text-gray-400">
                  <i className="pi pi-inbox text-4xl mb-3 block" />
                  Nenhum contrato encontrado
                </div>
              }
              className="contratos-lista"
              onRowClick={(e) => router.push(`/itensContrato/${e.data.id}`)}
              rowClassName={() => 'cursor-pointer'}
              paginatorClassName="border-t border-gray-100 bg-gray-50"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            >
              {/* Coluna: Código */}
              <Column
                field="codigoRastreio"
                header="Código"
                sortable
                style={{ width: '140px' }}
                headerStyle={{ textAlign: 'center' }}
                pt={{ headerContent: { style: { justifyContent: 'center' } } }}
                bodyStyle={{ textAlign: 'center' }}
                body={(contrato) => (
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    {contrato.codigoRastreio ?? '—'}
                  </span>
                )}
              />

              {/* Coluna: Nome */}
              <Column
                field="nome"
                header="Nome do Contrato"
                sortable
                headerStyle={{ textAlign: 'left' }}
                bodyStyle={{ textAlign: 'left' }}
                body={(contrato) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: '#eff6ff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="pi pi-file" style={{ color: '#3b82f6', fontSize: '0.9rem' }} />
                      </div>
                      {temNotifContrato(contrato.id) && (
                        <span style={{
                          position: 'absolute', top: -3, right: -3,
                          width: 9, height: 9, borderRadius: '50%',
                          background: '#ef4444', border: '1.5px solid #fff',
                        }} />
                      )}
                    </div>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{contrato.nome}</span>
                  </div>
                )}
              />

              {/* Coluna: Itens */}
              <Column
                field="itensQuantidade"
                header="Itens"
                sortable
                style={{ width: '90px' }}
                headerStyle={{ textAlign: 'center' }}
                pt={{ headerContent: { style: { justifyContent: 'center' } } }}
                bodyStyle={{ textAlign: 'center' }}
                body={(contrato) => (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Badge
                      value={contrato.itensQuantidade ?? 0}
                      severity={contrato.itensQuantidade > 0 ? "info" : undefined}
                      style={contrato.itensQuantidade === 0 ? { background: '#9ca3af' } : {}}
                    />
                  </div>
                )}
              />

              {/* Coluna: Status */}
              <Column
                header="Status"
                style={{ width: '190px' }}
                headerStyle={{ textAlign: 'center' }}
                pt={{ headerContent: { style: { justifyContent: 'center' } } }}
                bodyStyle={{ textAlign: 'center' }}
                body={(contrato) => {
                  const status = contrato.aprovado
                    ? "aprovado"
                    : contrato.itensQuantidade === 0 || contrato.status === "rascunho"
                    ? "rascunho"
                    : contrato.status === "urgente"
                    ? "urgente"
                    : "andamento";
                  const config: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
                    aprovado:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: '#22c55e', label: 'Aprovado'      },
                    urgente:   { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5', dot: '#ef4444', label: 'Urgente'       },
                    rascunho:  { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', dot: '#94a3b8', label: 'Rascunho'      },
                    andamento: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6', label: 'Em Andamento'  },
                  };
                  const c = config[status];

                  // Vencimento — 4 estados
                  let vencTipo: 'ok' | 'proximo' | 'critico' | 'vencido' | null = null;
                  let vencDias = 0;
                  if (contrato.data) {
                    const hoje = new Date(); hoje.setHours(0,0,0,0);
                    const d = new Date(contrato.data); d.setHours(0,0,0,0);
                    const dias = Math.ceil((d.getTime() - hoje.getTime()) / 86400000);
                    if (dias < 0)   { vencTipo = 'vencido';  vencDias = Math.abs(dias); }
                    else if (dias <= 3)  { vencTipo = 'critico';  vencDias = dias; }
                    else if (dias <= 30) { vencTipo = 'proximo';  vencDias = dias; }
                    else                 { vencTipo = 'ok';        vencDias = dias; }
                  }

                  const vencStyle: Record<string, { bg: string; icon: string; label: string }> = {
                    ok:      { bg: '#16a34a', icon: 'pi-calendar-clock', label: `Vence em ${vencDias}d`     },
                    proximo: { bg: '#f97316', icon: 'pi-clock',          label: `Vence em ${vencDias}d`     },
                    critico: { bg: '#dc2626', icon: 'pi-clock',          label: `Vence em ${vencDias}d`     },
                    vencido: { bg: '#7f1d1d', icon: 'pi-exclamation-triangle', label: `Vencido há ${vencDias}d` },
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        background: c.bg, color: c.text, border: `1px solid ${c.border}`,
                        borderRadius: '999px', padding: '0.3rem 0.85rem',
                        fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
                        {c.label}
                      </span>
                      {vencTipo && !contrato.aprovado && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          background: vencStyle[vencTipo].bg, color: '#fff',
                          borderRadius: '999px', padding: '0.2rem 0.7rem',
                          fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap',
                        }}>
                          <i className={`pi ${vencStyle[vencTipo].icon}`} style={{ fontSize: '0.68rem' }} />
                          {vencStyle[vencTipo].label}
                        </span>
                      )}
                    </div>
                  );
                }}
              />

              {/* Coluna: Datas */}
              <Column
                header="Datas"
                style={{ width: '150px' }}
                headerStyle={{ textAlign: 'center' }}
                pt={{ headerContent: { style: { justifyContent: 'center' } } }}
                bodyStyle={{ textAlign: 'center' }}
                body={(contrato) => {
                  const fmt = (d?: string) => {
                    if (!d) return '-';
                    const [y, m, day] = d.split('T')[0].split('-');
                    return `${day}/${m}/${y}`;
                  };
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                      {contrato.createdAt && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          <i className="pi pi-calendar-plus" style={{ fontSize: '0.65rem', marginRight: '0.25rem' }} />
                          {fmt(contrato.createdAt)}
                        </span>
                      )}
                      {contrato.data && (
                        <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 600 }}>
                          <i className="pi pi-calendar-times" style={{ fontSize: '0.65rem', marginRight: '0.25rem' }} />
                          {fmt(contrato.data)}
                        </span>
                      )}
                    </div>
                  );
                }}
              />

              {/* Coluna: Seta */}
              <Column
                style={{ width: '50px' }}
                headerStyle={{ textAlign: 'center' }}
                bodyStyle={{ textAlign: 'center' }}
                body={() => (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <i className="pi pi-chevron-right" style={{ color: '#94a3b8', fontSize: '0.9rem' }} />
                  </div>
                )}
              />
            </DataTable>
          </div>
        )}
      </div>
    </div>
  );
}
