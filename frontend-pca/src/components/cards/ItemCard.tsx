"use client";

import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { Sidebar } from "primereact/sidebar";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { Item } from "@/types/item";
import { comentarioItemService, Comentario } from "@/services/comentario/comentarioItemService";
import { useNotificacao } from "@/context/NotificacaoContext";

// Extende Item com flags de notificação embarcadas nos dados
// Assim o DataTable detecta mudança de valor e re-renderiza as células
type ItemRow = Item & { _notifComentario: boolean; _notifAprovado: boolean };

interface ItensDataTableProps {
  itens: Item[];
  onToggleAprovado: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  isAdmin?: boolean;
  openItemId?: string;
}

export default function ItensDataTable({
  itens,
  onToggleAprovado,
  onEdit,
  onDelete,
  isAdmin = false,
  openItemId,
}: ItensDataTableProps) {
  const { temComentarioPorItem, temAprovacaoPorItem, marcarLidasPorItem, naoLidas } = useNotificacao();
  const autoOpenedRef = useRef(false);
  const [sidebarItem, setSidebarItem] = useState<Item | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Recomputa quando itens mudam OU quando naoLidas muda
  // Isso cria um novo array → DataTable re-renderiza células
  const rows: ItemRow[] = React.useMemo(
    () =>
      itens.map((item) => ({
        ...item,
        _notifComentario: temComentarioPorItem(item.id),
        _notifAprovado: temAprovacaoPorItem(item.id),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itens, naoLidas]
  );

  const abrirComentarios = async (item: Item) => {
    setSidebarItem(item);
    setComentarios([]);
    setNovoTexto("");
    setLoadingComentarios(true);
    marcarLidasPorItem(item.id);
    try {
      const data = await comentarioItemService.listar(item.id);
      setComentarios(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } finally {
      setLoadingComentarios(false);
    }
  };

  // Auto-abrir sidebar via URL param (apenas uma vez após itens carregarem)
  React.useEffect(() => {
    if (!openItemId || itens.length === 0 || autoOpenedRef.current) return;
    const item = itens.find((i) => i.id === openItemId);
    if (item) {
      autoOpenedRef.current = true;
      abrirComentarios(item);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openItemId, itens]);

  const enviarComentario = async () => {
    if (!novoTexto.trim() || !sidebarItem) return;
    setEnviando(true);
    try {
      const novo = await comentarioItemService.criar(sidebarItem.id, novoTexto.trim());
      setComentarios((prev) => [...prev, novo]);
      setNovoTexto("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } finally {
      setEnviando(false);
    }
  };

  const formatarHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const aprovadoBodyTemplate = (row: ItemRow) => {
    if (isAdmin) {
      return (
        <Tag
          value={row.aprovado ? "Sim" : "Não"}
          severity={row.aprovado ? "success" : "warning"}
          onClick={() => onToggleAprovado(row)}
          className="cursor-pointer transition-colors duration-200"
          title="Clique para alterar aprovação"
        />
      );
    }
    return (
      <div className="relative inline-flex">
        <Tag
          value={row.aprovado ? "Aprovado" : "Pendente"}
          severity={row.aprovado ? "success" : "warning"}
        />
        {row._notifAprovado && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ef4444",
              border: "1.5px solid #fff",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    );
  };

  const actionBodyTemplate = (row: ItemRow) => {
    return (
      <div className="flex gap-1 items-center">
        <div className="relative inline-flex">
          <Button
            icon="pi pi-comment"
            onClick={() => abrirComentarios(row)}
            className="p-button-sm p-button-text p-button-info"
            tooltip="Ver comentários"
          />
          {row._notifComentario && (
            <span
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ef4444",
                border: "1.5px solid #fff",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {row.aprovado ? (
          <div className="flex items-center gap-1 text-gray-400">
            <i className="pi pi-lock text-sm" />
            <span className="text-xs">Bloqueado</span>
          </div>
        ) : (
          <>
            <Button
              icon="pi pi-pencil"
              onClick={() => onEdit(row)}
              className="p-button-sm p-button-text p-button-secondary"
              tooltip="Editar Item"
            />
            <Button
              icon="pi pi-trash"
              onClick={() => onDelete(row)}
              className="p-button-sm p-button-text p-button-danger"
              tooltip="Excluir Item"
            />
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <Card title="Itens do Contrato" className="shadow-md">
        <DataTable
          value={rows}
          dataKey="id"
          size="small"
          paginator
          rows={10}
          emptyMessage="Nenhum item encontrado neste contrato."
          className="p-datatable-gridlines"
          sortField="id"
          sortOrder={1}
        >
          <Column field="nome" header="Nome" sortable style={{ width: "15%" }} />
          <Column field="descricao" header="Descrição" style={{ width: "28%" }} />
          <Column field="quantidadeItem" header="Qtd" sortable style={{ width: "9%" }} />
          <Column field="unidadeDeMedida" header="Unidade" style={{ width: "11%" }} />
          <Column header="Aprovado" body={aprovadoBodyTemplate} align="center" style={{ width: "12%" }} />
          <Column
            header="Ações"
            body={actionBodyTemplate}
            style={{ width: "19%" }}
            alignFrozen="right"
            frozen
          />
        </DataTable>
      </Card>

      <Sidebar
        visible={!!sidebarItem}
        onHide={() => setSidebarItem(null)}
        position="right"
        style={{ width: "380px" }}
        header={
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Comentários do item</p>
            <p className="text-base font-bold text-gray-800 leading-tight">{sidebarItem?.nome}</p>
          </div>
        }
      >
        <div className="flex flex-col h-full" style={{ height: "calc(100vh - 120px)" }}>
          <div className="flex-1 overflow-y-auto px-1 pb-4" style={{ minHeight: 0 }}>
            {loadingComentarios ? (
              <div className="flex justify-center mt-10">
                <ProgressSpinner style={{ width: 36, height: 36 }} />
              </div>
            ) : comentarios.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-16 text-gray-400 gap-2">
                <i className="pi pi-comment text-4xl" />
                <p className="text-sm">Nenhum comentário ainda.</p>
                <p className="text-xs">Seja o primeiro a enviar uma mensagem.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                {comentarios.map((c) => {
                  const isMinha =
                    (isAdmin && c.autorTipo === "admin") ||
                    (!isAdmin && c.autorTipo === "usuario");
                  return (
                    <div
                      key={c.id}
                      className={`flex flex-col gap-0.5 ${isMinha ? "items-end" : "items-start"}`}
                    >
                      <span className="text-xs font-semibold px-1" style={{ color: isMinha ? "#2563eb" : "#7c3aed" }}>
                        {isMinha ? "Você" : c.autorTipo === "admin" ? "Admin" : "Usuário"}
                      </span>
                      <div
                        className="px-4 py-2.5 text-sm leading-relaxed max-w-[85%]"
                        style={{
                          borderRadius: isMinha
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                          background: isMinha ? "#2563eb" : "#f3f4f6",
                          color: isMinha ? "#fff" : "#1e293b",
                          border: isMinha ? "none" : "1px solid #e5e7eb",
                        }}
                      >
                        {c.texto}
                      </div>
                      <div className={`flex items-center gap-2 px-1 ${isMinha ? "flex-row-reverse" : ""}`}>
                        <span className="text-xs text-gray-400">{formatarHora(c.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            <InputTextarea
              value={novoTexto}
              onChange={(e) => setNovoTexto(e.target.value)}
              placeholder="Digite uma mensagem..."
              rows={3}
              className="w-full text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviarComentario();
                }
              }}
            />
            <Button
              label="Enviar"
              icon="pi pi-send"
              className="p-button-sm p-button-primary w-full"
              onClick={enviarComentario}
              loading={enviando}
              disabled={!novoTexto.trim()}
            />
          </div>
        </div>
      </Sidebar>
    </>
  );
}
