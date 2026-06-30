"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotificacao } from "@/context/NotificacaoContext";
import { authService } from "@/services/authService";
import { Notificacao } from "@/services/notificacao/notificacaoService";

const TIPO_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  item_aprovado:    { icon: "pi-check-circle",        color: "#16a34a", bg: "#f0fdf4" },
  comentario:       { icon: "pi-comment",              color: "#2563eb", bg: "#eff6ff" },
  comentario_usuario: { icon: "pi-comment",            color: "#7c3aed", bg: "#f5f3ff" },
  vencimento_10:    { icon: "pi-calendar-clock",       color: "#d97706", bg: "#fffbeb" },
  vencimento_5:     { icon: "pi-exclamation-triangle", color: "#dc2626", bg: "#fef2f2" },
};

function formatarHora(iso: string) {
  const d = new Date(iso);
  const agora = new Date();
  const diffMin = Math.floor((agora.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin} min atrás`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function NotificacaoBell() {
  const router = useRouter();
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas } = useNotificacao();
  const [aberto, setAberto] = useState(false);
  const [isUsuario, setIsUsuario] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsUsuario(authService.isLoggedIn());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const abrirNotificacao = async (n: Notificacao) => {
    if (!n.lida) await marcarLida(n.id);
    setAberto(false);
    if (!n.referenciaId) return;
    const url = (n.tipo === "comentario" || n.tipo === "comentario_usuario") && n.itemId
      ? `/itensContrato/${n.referenciaId}?openItem=${n.itemId}`
      : `/itensContrato/${n.referenciaId}`;
    router.push(url);
  };

  if (!isUsuario) return null;

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* BOTÃO DO SININHO */}
        <button
          onClick={() => setAberto((p) => !p)}
          title="Notificações"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.35)",
            background: aberto ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <i
            className="pi pi-bell"
            style={{ color: "#fff", fontSize: 16 }}
          />
          {naoLidas > 0 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: "#ef4444",
                border: "2px solid transparent",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingInline: 3,
                lineHeight: 1,
              }}
            >
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </button>

        {/* DROPDOWN */}
        {aberto && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 10px)",
              width: 360,
              maxHeight: 460,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
              border: "1px solid #f1f5f9",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px 12px",
                borderBottom: "1px solid #f1f5f9",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="pi pi-bell" style={{ color: "#64748b", fontSize: 14 }} />
                <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
                  Notificações
                </span>
                {naoLidas > 0 && (
                  <span
                    style={{
                      background: "#fef2f2",
                      color: "#ef4444",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 99,
                      border: "1px solid #fecaca",
                    }}
                  >
                    {naoLidas} nova{naoLidas > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#3b82f6",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* LISTA */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {notificacoes.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 20px",
                    gap: 10,
                    color: "#94a3b8",
                  }}
                >
                  <i className="pi pi-bell" style={{ fontSize: 36, opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: 13 }}>Sem notificações</p>
                </div>
              ) : (
                notificacoes.map((n) => {
                  const cfg = TIPO_CONFIG[n.tipo] ?? TIPO_CONFIG.item_aprovado;
                  return (
                    <button
                      key={n.id}
                      onClick={() => abrirNotificacao(n)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 18px",
                        borderBottom: "1px solid #f8fafc",
                        background: n.lida ? "#fff" : "#f8faff",
                        border: "none",
                        borderLeft: n.lida ? "3px solid transparent" : `3px solid ${cfg.color}`,
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = n.lida ? "#fff" : "#f8faff")}
                    >
                      {/* ÍCONE */}
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: cfg.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <i className={`pi ${cfg.icon}`} style={{ color: cfg.color, fontSize: 14 }} />
                      </div>

                      {/* TEXTO */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: n.lida ? 400 : 600,
                            color: n.lida ? "#64748b" : "#1e293b",
                            lineHeight: 1.4,
                          }}
                        >
                          {n.texto}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{formatarHora(n.createdAt)}</span>
                          {!n.lida && (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: cfg.color,
                                display: "inline-block",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
