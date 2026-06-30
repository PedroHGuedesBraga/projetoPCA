"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputSwitch } from "primereact/inputswitch";
import { secretariaService } from "@/services/secretaria/secretariaService";
import { contratoService } from "@/services/contrato/contratoService";
import { itemService } from "@/services/item/itemService";
import { useRouteGuard } from "@/hooks/useRouteGuard";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES_NOMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  aprovado:  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  urgente:   { bg: "#fef2f2", text: "#b91c1c", border: "#fca5a5", dot: "#ef4444" },
  rascunho:  { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
  andamento: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
};

export default function CalendarioMesPage() {
  const params = useParams();
  const secretariaId = params.secretariaId as string;
  const router = useRouter();
  const toastRef = useRef<Toast>(null);

  useRouteGuard("any", secretariaId);

  const [ano, setAno] = useState(parseInt(params.ano as string));
  const [mes, setMes] = useState(parseInt(params.mes as string)); // 1-12
  const [contratosOrganizados, setContratosOrganizados] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [secretariaNome, setSecretariaNome] = useState("");

  // Modal novo contrato
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [nome, setNome] = useState("");
  const [status, setStatus] = useState("andamento");
  const [importarItens, setImportarItens] = useState(false);

  // Popover "+N mais"
  const [popover, setPopover] = useState<{ day: number; contratos: any[]; x: number; y: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node))
        setPopover(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Ajusta verticalmente se popover sair da tela
  useEffect(() => {
    if (!popover || !popoverRef.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    const margin = 10;
    if (rect.bottom > window.innerHeight - margin) {
      const overflowY = rect.bottom - window.innerHeight + margin;
      setPopover(p => p ? { ...p, y: p.y - overflowY } : null);
    }
  }, [popover?.day]);

  const showToast = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  useEffect(() => {
    secretariaService.getById(secretariaId).then(s => {
      if (s?.nome) setSecretariaNome(s.nome);
    });
  }, [secretariaId]);

  useEffect(() => {
    setLoading(true);
    secretariaService.getContratosOrganizados(secretariaId).then(res => {
      const mesStr = String(mes).padStart(2, "0");
      setContratosOrganizados((res as any)?.[String(ano)]?.[mesStr]
        ? { [mesStr]: (res as any)[String(ano)][mesStr] }
        : {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [secretariaId, ano, mes]);

  // Último contrato para importar itens
  const ultimoContrato = useMemo(() => {
    const todos = Object.values(contratosOrganizados).flat();
    return todos.length > 0 ? todos[todos.length - 1] : null;
  }, [contratosOrganizados]);

  // Agrupar contratos por dia do mês (baseado no campo `data`)
  const contratosPorDia = useMemo(() => {
    const map: Record<number, any[]> = {};
    Object.values(contratosOrganizados).flat().forEach((c: any) => {
      if (c.data) {
        const day = parseInt(c.data.split("T")[0].split("-")[2]);
        if (!map[day]) map[day] = [];
        map[day].push(c);
      }
    });
    return map;
  }, [contratosOrganizados]);

  // Grid do calendário
  const primeiroDia = new Date(ano, mes - 1, 1).getDay(); // 0=Dom
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const hoje = new Date();
  const ehHoje = (day: number) =>
    day === hoje.getDate() && mes === hoje.getMonth() + 1 && ano === hoje.getFullYear();

  const navMes = (delta: number) => {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes > 12) { novoMes = 1; novoAno++; }
    if (novoMes < 1)  { novoMes = 12; novoAno--; }
    setMes(novoMes);
    setAno(novoAno);
  };

  const handleDayClick = (day: number) => {
    const d = new Date(ano, mes - 1, day);
    setSelectedDate(d);
    setNome("");
    setStatus("andamento");
    setImportarItens(false);
    setIsModalOpen(true);
  };

  const handleSaveContrato = async () => {
    if (!nome.trim()) { showToast("warn", "Campo obrigatório", "Preencha o nome do contrato."); return; }
    if (!selectedDate) { showToast("warn", "Campo obrigatório", "Selecione a data do contrato."); return; }
    try {
      const payload = {
        nome,
        data: selectedDate.toISOString().split("T")[0],
        status,
        aprovado: false,
        secretariaId,
        itensQuantidade: 0,
      };
      const novoContrato = await contratoService.create(payload);
      if (importarItens && ultimoContrato) {
        const { itens } = await contratoService.getItensByContrato(ultimoContrato.id);
        if (itens?.length > 0) {
          await Promise.all(itens.map((item: any) =>
            itemService.create({
              nome: item.nome, descricao: item.descricao,
              quantidadeItem: item.quantidadeItem,
              data: novoContrato.data, unidadeDeMedida: item.unidadeDeMedida,
              aprovado: false, contratoId: novoContrato.id,
            })
          ));
          await contratoService.update(novoContrato.id, { itensQuantidade: itens.length });
        }
      }
      setIsModalOpen(false);
      showToast("success", "Contrato criado", "Recarregando calendário...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      showToast("error", "Erro ao criar", "Não foi possível criar o contrato.");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><ProgressSpinner /></div>;

  // Células do grid: espaços vazios + dias
  const totalCells = Math.ceil((primeiroDia + diasNoMes) / 7) * 7;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-5">
      <Toast ref={toastRef} position="top-right" />

      <div className="w-full max-w-6xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <i className="pi pi-arrow-left" /> Voltar
          </button>

          {/* Navegação mês/ano */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{secretariaNome}</div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navMes(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer text-gray-600 text-lg font-bold"
              >‹</button>
              <span className="text-xl font-bold text-gray-800 w-44 text-center">
                {MESES_NOMES[mes - 1]} {ano}
              </span>
              <button
                onClick={() => navMes(1)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer text-gray-600 text-lg font-bold"
              >›</button>
            </div>
          </div>

          <button
            onClick={() => { setSelectedDate(new Date(ano, mes - 1, hoje.getDate())); setNome(""); setStatus("andamento"); setImportarItens(false); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: "#16a34a" }}
          >
            <i className="pi pi-plus text-xs" /> Adicionar Contrato
          </button>
        </div>

        {/* Calendário */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">

          {/* Cabeçalho dias da semana */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={{
                padding: "0.75rem 0", textAlign: "center",
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em",
                color: d === "Dom" || d === "Sáb" ? "#94a3b8" : "#64748b",
                textTransform: "uppercase", borderBottom: "2px solid #f1f5f9",
                background: "#f8fafc",
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Células dos dias */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {Array.from({ length: totalCells }).map((_, idx) => {
              const day = idx - primeiroDia + 1;
              const valid = day >= 1 && day <= diasNoMes;
              const contratos = valid ? (contratosPorDia[day] ?? []) : [];
              const isToday = valid && ehHoje(day);
              const isFds = idx % 7 === 0 || idx % 7 === 6;

              return (
                <div
                  key={idx}
                  onClick={() => valid && handleDayClick(day)}
                  style={{
                    minHeight: "120px",
                    borderRight: idx % 7 !== 6 ? "1px solid #f1f5f9" : "none",
                    borderBottom: "1px solid #f1f5f9",
                    padding: "0.5rem",
                    background: !valid ? "#fafafa" : isFds ? "#fdfcff" : "#fff",
                    cursor: valid ? "pointer" : "default",
                    transition: "background 0.12s",
                    position: "relative",
                  }}
                  onMouseEnter={e => { if (valid) (e.currentTarget as HTMLDivElement).style.background = "#f0f7ff"; }}
                  onMouseLeave={e => { if (valid) (e.currentTarget as HTMLDivElement).style.background = !valid ? "#fafafa" : isFds ? "#fdfcff" : "#fff"; }}
                >
                  {valid && (
                    <>
                      {/* Número do dia */}
                      <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: "50%", marginBottom: "0.35rem",
                        background: isToday ? "#1d4ed8" : "transparent",
                        color: isToday ? "#fff" : isFds ? "#94a3b8" : "#374151",
                        fontSize: "0.82rem", fontWeight: isToday ? 700 : 500,
                      }}>
                        {day}
                      </div>

                      {/* Contratos como compromissos — máx 2 visíveis */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        {contratos.slice(0, 2).map((c: any) => {
                          const st = c.aprovado ? "aprovado" : c.itensQuantidade === 0 || c.status === "rascunho" ? "rascunho" : c.status === "urgente" ? "urgente" : "andamento";
                          const col = STATUS_COLOR[st];
                          return (
                            <div
                              key={c.id}
                              onClick={e => { e.stopPropagation(); router.push(`/itensContrato/${c.id}`); }}
                              style={{
                                display: "flex", alignItems: "center", gap: "0.3rem",
                                background: col.bg, border: `1px solid ${col.border}`,
                                borderRadius: "6px", padding: "0.2rem 0.45rem",
                                fontSize: "0.68rem", fontWeight: 600, color: col.text,
                                cursor: "pointer", overflow: "hidden",
                                maxWidth: "100%",
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.8"}
                              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                              title={c.nome}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nome}</span>
                            </div>
                          );
                        })}
                        {contratos.length > 2 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                              const pw = 288; // largura estimada do popover
                              const margin = 10;
                              let x = rect.left;
                              let y = rect.bottom + 6;
                              if (x + pw + margin > window.innerWidth) x = window.innerWidth - pw - margin;
                              if (x < margin) x = margin;
                              setPopover({ day, contratos, x, y });
                            }}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "0.25rem",
                              background: "#f1f5f9", border: "1px solid #e2e8f0",
                              borderRadius: "6px", padding: "0.2rem 0.45rem",
                              fontSize: "0.65rem", fontWeight: 700, color: "#475569",
                              cursor: "pointer", width: "100%",
                            }}
                          >
                            <i className="pi pi-ellipsis-h" style={{ fontSize: "0.6rem" }} />
                            +{contratos.length - 2} mais
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Popover "+N mais" */}
        {popover && (
          <div
            ref={popoverRef}
            style={{
              position: "fixed", top: popover.y, left: popover.x, zIndex: 999,
              background: "#fff", borderRadius: "14px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.14)", border: "1px solid #e2e8f0",
              padding: "0.75rem", minWidth: "220px", maxWidth: "280px",
            }}
          >
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
              {popover.day} de {MESES_NOMES[mes - 1]} — {popover.contratos.length} contratos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {popover.contratos.map((c: any) => {
                const st = c.aprovado ? "aprovado" : c.itensQuantidade === 0 || c.status === "rascunho" ? "rascunho" : c.status === "urgente" ? "urgente" : "andamento";
                const col = STATUS_COLOR[st];
                return (
                  <div
                    key={c.id}
                    onClick={() => { setPopover(null); router.push(`/itensContrato/${c.id}`); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.4rem",
                      background: col.bg, border: `1px solid ${col.border}`,
                      borderRadius: "8px", padding: "0.4rem 0.65rem",
                      fontSize: "0.78rem", fontWeight: 600, color: col.text,
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.8"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                    {c.nome}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legenda */}
        <div className="flex gap-4 mt-4 justify-end flex-wrap">
          {Object.entries(STATUS_COLOR).map(([key, col]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#64748b" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot }} />
              {key === "aprovado" ? "Aprovado" : key === "urgente" ? "Urgente" : key === "rascunho" ? "Rascunho" : "Em Andamento"}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Novo Contrato */}
      <Dialog header="Novo Contrato" visible={isModalOpen} style={{ width: "40vw" }} modal onHide={() => setIsModalOpen(false)}>
        <div className="flex flex-column gap-3 p-3">
          <label>Secretaria</label>
          <InputText value={secretariaNome} disabled className="w-full" />

          <label>Nome do Contrato</label>
          <InputText value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Contrato de fornecimento" className="w-full" />

          <label>Data de Vencimento</label>
          <Calendar
            value={selectedDate}
            onChange={e => setSelectedDate(e.value as Date)}
            dateFormat="dd/mm/yy"
            className="w-full"
          />

          <label>Status</label>
          <Dropdown
            value={status}
            options={[
              { label: "Rascunho", value: "rascunho" },
              { label: "Andamento", value: "andamento" },
              { label: "Urgente", value: "urgente" },
            ]}
            onChange={e => setStatus(e.value)}
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
                  <InputSwitch checked={importarItens} onChange={e => setImportarItens(e.value)} />
                  <span className="text-xs text-blue-600">Importar itens</span>
                </div>
              </div>
            </div>
          )}

          <Button label="Salvar Contrato" icon="pi pi-check" className="p-button-success mt-3" onClick={handleSaveContrato} />
        </div>
      </Dialog>
    </div>
  );
}
