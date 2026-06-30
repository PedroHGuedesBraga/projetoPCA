"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { authService } from "@/services/authService";

type Role = "usuario" | "admin";

export function LoginForm() {
  const [role, setRole] = useState<Role>("usuario");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toastRef = useRef<Toast>(null);

  const handleCpfChange = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    const formatted = nums
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(formatted);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cpfNum = cpf.replace(/\D/g, "");
      if (role === "admin") {
        const data = await authService.loginAdmin(cpfNum, senha);
        if (data?.token) {
          toastRef.current?.show({ severity: "success", summary: "Login realizado", detail: "Redirecionando...", life: 1500 });
          setTimeout(() => router.push("/home"), 1000);
        }
      } else {
        const data = await authService.loginUsuario(cpfNum, senha);
        if (data?.token) {
          const secretariaId = data.usuario?.secretariaId || data.user?.secretariaId;
          if (secretariaId) {
            toastRef.current?.show({ severity: "success", summary: "Login realizado", detail: "Redirecionando...", life: 1500 });
            setTimeout(() => router.push(`/mesesSecretaria/${secretariaId}`), 1000);
          } else {
            toastRef.current?.show({ severity: "warn", summary: "Sem secretaria", detail: "Usuário sem secretaria atribuída.", life: 3000 });
          }
        }
      }
    } catch (err: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "Erro ao entrar",
        detail: err?.response?.data?.message || "Verifique suas credenciais.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen surface-ground">
      <Toast ref={toastRef} position="top-right" />
      <Card
        title={<h1 className="text-2xl font-bold">Acesso ao Sistema</h1>}
        className="md:w-30rem shadow-6 p-fluid"
      >
        <form onSubmit={handleLogin} className="p-fluid">

          {/* Seletor de perfil */}
          <div className="mb-4">
            <label className="font-semibold mb-2 block text-sm text-color-secondary">Entrar como</label>
            <div className="flex gap-2">
              {([
                { id: "usuario" as Role, label: "Usuário", icon: "pi-user" },
                { id: "admin" as Role, label: "Administrador", icon: "pi-star" },
              ] as const).map(opt => {
                const active = role === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id)}
                    style={{
                      flex: 1,
                      padding: "0.65rem 0.5rem",
                      borderRadius: "10px",
                      border: active ? "2px solid #1d4ed8" : "2px solid #e2e8f0",
                      background: active ? "#eff6ff" : "#f8fafc",
                      color: active ? "#1d4ed8" : "#64748b",
                      fontWeight: active ? 700 : 500,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <i className={`pi ${opt.icon}`} style={{ fontSize: "0.9rem" }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CPF */}
          <div className="field mb-4">
            <label htmlFor="cpf" className="font-semibold mb-2 block">CPF</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon"><i className="pi pi-user" /></span>
              <InputText
                id="cpf"
                value={cpf}
                onChange={e => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div className="field mb-4">
            <label htmlFor="senha" className="font-semibold mb-2 block">Senha</label>
            <Password
              id="senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              toggleMask
              feedback={false}
              className="w-full"
              inputClassName="w-full"
              required
            />
          </div>

          <Button
            label={loading ? "Entrando..." : `Entrar como ${role === "admin" ? "Administrador" : "Usuário"}`}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
            type="submit"
            className="p-button-lg w-full"
            disabled={loading}
          />
        </form>
      </Card>
    </div>
  );
}
