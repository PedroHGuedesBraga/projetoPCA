"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { notificacaoService, Notificacao } from "@/services/notificacao/notificacaoService";
import { authService } from "@/services/authService";

interface NotificacaoContextType {
  notificacoes: Notificacao[];
  naoLidas: number;
  marcarLida: (id: string) => Promise<void>;
  marcarTodasLidas: () => Promise<void>;
  marcarLidasPorItem: (itemId: string) => void;
  marcarAprovacoesPorContrato: (contratoId: string) => void;
  temNotifSecretaria: (secretariaId: string) => boolean;
  temNotifContrato: (contratoId: string) => boolean;
  temNotifItem: (itemId: string) => boolean;
  temAprovacaoPorItem: (itemId: string) => boolean;
  temComentarioPorItem: (itemId: string) => boolean;
  refetch: () => Promise<void>;
}

const NotificacaoContext = createContext<NotificacaoContextType>({
  notificacoes: [],
  naoLidas: 0,
  marcarLida: async () => {},
  marcarTodasLidas: async () => {},
  marcarLidasPorItem: () => {},
  marcarAprovacoesPorContrato: () => {},
  temNotifSecretaria: () => false,
  temNotifContrato: () => false,
  temNotifItem: () => false,
  temAprovacaoPorItem: () => false,
  temComentarioPorItem: () => false,
  refetch: async () => {},
});

export function NotificacaoProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [ativo, setAtivo] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setAtivo(authService.isLoggedIn());
  }, [pathname]);

  const carregar = useCallback(async () => {
    if (!authService.isLoggedIn()) return;
    try {
      const data = authService.isAdmin()
        ? await notificacaoService.listarAdmin()
        : await notificacaoService.listar();
      setNotificacoes((prev) => {
        const lidasLocal = new Set(prev.filter((n) => n.lida).map((n) => n.id));
        return data.map((n) => ({ ...n, lida: n.lida || lidasLocal.has(n.id) }));
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (!ativo) return;
    carregar();
    const interval = setInterval(carregar, 5000);
    return () => clearInterval(interval);
  }, [ativo, carregar]);

  const marcarLida = async (id: string) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    const fn = authService.isAdmin() ? notificacaoService.marcarLidaAdmin : notificacaoService.marcarLida;
    fn(id).catch(() => {});
  };

  const marcarTodasLidas = async () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    const fn = authService.isAdmin() ? notificacaoService.marcarTodasLidasAdmin : notificacaoService.marcarTodasLidas;
    fn().catch(() => {});
  };

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const temNotifSecretaria = (id: string) =>
    notificacoes.some((n) => !n.lida && n.secretariaId === id);

  const temNotifContrato = (id: string) =>
    notificacoes.some((n) => !n.lida && n.referenciaId === id);

  const temNotifItem = (id: string) =>
    notificacoes.some((n) => !n.lida && n.itemId === id);

  const temAprovacaoPorItem = (id: string) =>
    notificacoes.some((n) => !n.lida && n.itemId === id && n.tipo === "item_aprovado");

  const temComentarioPorItem = (id: string) =>
    notificacoes.some((n) => !n.lida && n.itemId === id && n.tipo === "comentario");

  const marcarLidasPorItem = (itemId: string) => {
    const ids = notificacoes.filter((n) => !n.lida && n.itemId === itemId).map((n) => n.id);
    if (ids.length === 0) return;
    setNotificacoes((prev) =>
      prev.map((n) => (n.itemId === itemId ? { ...n, lida: true } : n))
    );
    const fn = authService.isAdmin() ? notificacaoService.marcarLidaAdmin : notificacaoService.marcarLida;
    ids.forEach((id) => fn(id).catch(() => {}));
  };

  const marcarAprovacoesPorContrato = (contratoId: string) => {
    const ids = notificacoes
      .filter((n) => !n.lida && n.referenciaId === contratoId && n.tipo === "item_aprovado")
      .map((n) => n.id);
    if (ids.length === 0) return;
    setNotificacoes((prev) =>
      prev.map((n) =>
        !n.lida && n.referenciaId === contratoId && n.tipo === "item_aprovado"
          ? { ...n, lida: true }
          : n
      )
    );
    ids.forEach((id) => notificacaoService.marcarLida(id).catch(() => {}));
  };

  return (
    <NotificacaoContext.Provider
      value={{ notificacoes, naoLidas, marcarLida, marcarTodasLidas, marcarLidasPorItem, marcarAprovacoesPorContrato, temNotifSecretaria, temNotifContrato, temNotifItem, temAprovacaoPorItem, temComentarioPorItem, refetch: carregar }}
    >
      {children}
    </NotificacaoContext.Provider>
  );
}

export function useNotificacao() {
  return useContext(NotificacaoContext);
}
