"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { secretariaService } from "@/services/secretaria/secretariaService";
import { contratoService } from "@/services/contrato/contratoService";
import { itemService } from "@/services/item/itemService";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import CalendarioHeader from "@/components/calendarioMes/CalendarioHeader";
import CalendarioGrid from "@/components/calendarioMes/CalendarioGrid";
import CalendarioPopover from "@/components/calendarioMes/CalendarioPopover";
import CalendarioLegenda from "@/components/calendarioMes/CalendarioLegenda";
import CalendarioNovoContratoModal from "@/components/calendarioMes/CalendarioNovoContratoModal";

export default function CalendarioMesPage() {
  const params = useParams();
  const secretariaId = params.secretariaId as string;
  const router = useRouter();
  const toastRef = useRef<Toast>(null);

  useRouteGuard("any", secretariaId);

  const [ano, setAno] = useState(parseInt(params.ano as string));
  const [mes, setMes] = useState(parseInt(params.mes as string));
  const [contratosOrganizados, setContratosOrganizados] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [secretariaNome, setSecretariaNome] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [nome, setNome] = useState("");
  const [status, setStatus] = useState("andamento");
  const [importarItens, setImportarItens] = useState(false);
  const [popover, setPopover] = useState<{ day: number; contratos: any[]; x: number; y: number } | null>(null);

  const showToast = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  useEffect(() => {
    secretariaService.getById(secretariaId).then(s => { if (s?.nome) setSecretariaNome(s.nome); });
  }, [secretariaId]);

  useEffect(() => {
    setLoading(true);
    secretariaService.getContratosOrganizados(secretariaId).then(res => {
      const mesStr = String(mes).padStart(2, "0");
      setContratosOrganizados(
        (res as any)?.[String(ano)]?.[mesStr] ? { [mesStr]: (res as any)[String(ano)][mesStr] } : {}
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [secretariaId, ano, mes]);

  const ultimoContrato = useMemo(() => {
    const todos = Object.values(contratosOrganizados).flat();
    return todos.length > 0 ? todos[todos.length - 1] : null;
  }, [contratosOrganizados]);

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

  const navMes = (delta: number) => {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes > 12) { novoMes = 1; novoAno++; }
    if (novoMes < 1)  { novoMes = 12; novoAno--; }
    setMes(novoMes);
    setAno(novoAno);
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(ano, mes - 1, day));
    setNome(""); setStatus("andamento"); setImportarItens(false);
    setIsModalOpen(true);
  };

  const handleSaveContrato = async () => {
    if (!nome.trim()) { showToast("warn", "Campo obrigatório", "Preencha o nome do contrato."); return; }
    if (!selectedDate) { showToast("warn", "Campo obrigatório", "Selecione a data do contrato."); return; }
    try {
      const payload = { nome, data: selectedDate.toISOString().split("T")[0], status, aprovado: false, secretariaId, itensQuantidade: 0 };
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
      showToast("success", "Contrato criado", "Recarregando calendário...");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      showToast("error", "Erro ao criar", "Não foi possível criar o contrato.");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><ProgressSpinner /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-5">
      <Toast ref={toastRef} position="top-right" />
      <div className="w-full max-w-6xl mx-auto">
        <CalendarioHeader
          secretariaNome={secretariaNome} mes={mes} ano={ano}
          onBack={() => router.back()} onNavMes={navMes}
          onAddContrato={() => { setSelectedDate(new Date(ano, mes - 1, new Date().getDate())); setNome(""); setStatus("andamento"); setImportarItens(false); setIsModalOpen(true); }}
        />
        <CalendarioGrid
          ano={ano} mes={mes} contratosPorDia={contratosPorDia}
          onDayClick={handleDayClick}
          onShowPopover={(day, contratos, x, y) => setPopover({ day, contratos, x, y })}
        />
        {popover && (
          <CalendarioPopover
            day={popover.day} mes={mes} contratos={popover.contratos}
            x={popover.x} y={popover.y} onClose={() => setPopover(null)}
          />
        )}
        <CalendarioLegenda />
      </div>
      <CalendarioNovoContratoModal
        visible={isModalOpen} onHide={() => setIsModalOpen(false)}
        secretariaNome={secretariaNome} nome={nome} onNomeChange={setNome}
        selectedDate={selectedDate} onSelectedDateChange={setSelectedDate}
        status={status} onStatusChange={setStatus}
        importarItens={importarItens} onImportarItensChange={setImportarItens}
        ultimoContrato={ultimoContrato} onSalvar={handleSaveContrato}
      />
    </div>
  );
}
