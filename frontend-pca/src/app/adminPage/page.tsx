"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { usuarioService, Usuario } from "@/services/usuario/usuarioService";
import { secretariaService } from "@/services/secretaria/secretariaService";
import { Secretaria } from "@/types/secretaria";

export default function AdminPage() {
  const guardStatus = useRouteGuard("admin");

  const toastRef = useRef<Toast>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("usuario");
  const [secretariaId, setSecretariaId] = useState("");

  const showToast = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  };

  const handleCpfChange = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    const formatted = nums
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(formatted);
  };

  const fetchUsuarios = async () => {
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch {
      showToast("error", "Erro", "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    secretariaService.getAll().then(setSecretarias);
  }, []);

  const resetForm = () => {
    setNome(""); setEmail(""); setCpf(""); setSenha("");
    setCargo("usuario"); setSecretariaId("");
  };

  const handleSave = async () => {
    if (!nome.trim() || !email.trim() || !cpf || !senha || !secretariaId) {
      showToast("warn", "Campos obrigatórios", "Preencha todos os campos.");
      return;
    }
    try {
      await usuarioService.create({
        nome, email,
        cpf: cpf.replace(/\D/g, ""),
        senha, cargo, secretariaId,
      });
      showToast("success", "Usuário criado", `${nome} foi adicionado ao sistema.`);
      setModalOpen(false);
      resetForm();
      fetchUsuarios();
    } catch (err: any) {
      showToast("error", "Erro ao criar", err?.response?.data?.message || "Não foi possível criar o usuário.");
    }
  };

  const handleDelete = (usuario: Usuario) => {
    confirmDialog({
      message: `Deseja remover o usuário "${usuario.nome}"?`,
      header: "Confirmar exclusão",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, remover",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await usuarioService.delete(usuario.id);
          showToast("success", "Usuário removido", `${usuario.nome} foi removido.`);
          fetchUsuarios();
        } catch {
          showToast("error", "Erro ao remover", "Não foi possível remover o usuário.");
        }
      },
    });
  };

  const cargoTemplate = (u: Usuario) => (
    <Tag
      value={u.cargo === "gerente" ? "Gerente" : "Usuário"}
      severity={u.cargo === "gerente" ? "warning" : "info"}
    />
  );

  const secretariaTemplate = (u: Usuario) =>
    u.Secretaria?.nome || secretarias.find(s => s.id === u.secretariaId)?.nome || "-";

  const acoesTemplate = (u: Usuario) => (
    <Button
      icon="pi pi-trash"
      severity="danger"
      className="p-button-sm p-button-text"
      tooltip="Remover usuário"
      onClick={() => handleDelete(u)}
    />
  );

  if (guardStatus === 'loading')
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );

  if (guardStatus === 'denied')
    return (
      <div className="flex flex-column justify-content-center align-items-center min-h-screen gap-4">
        <i className="pi pi-lock text-7xl text-400" />
        <h2 className="text-2xl font-bold text-700">Acesso Restrito</h2>
        <p className="text-500 text-center" style={{ maxWidth: '380px' }}>
          Esta área é exclusiva para administradores.<br />
          Faça logout e entre com uma conta de administrador para ter acesso.
        </p>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-800 text-blue-800 font-semibold text-sm bg-white shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <i className="pi pi-arrow-left" />
          Voltar
        </button>
      </div>
    );

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <Toast ref={toastRef} position="top-right" />
      <ConfirmDialog />

      {/* CABEÇALHO */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-900">Gerenciamento de Usuários</h1>
          <p className="text-500 mt-1">Cadastre e gerencie quem tem acesso ao sistema</p>
        </div>
        <Button
          label="Adicionar Usuário"
          icon="pi pi-user-plus"
          severity="success"
          onClick={() => setModalOpen(true)}
        />
      </div>

      {/* TABELA */}
      <DataTable
        value={usuarios}
        dataKey="id"
        paginator
        rows={10}
        emptyMessage="Nenhum usuário cadastrado."
        className="shadow-2"
        size="small"
      >
        <Column field="nome" header="Nome" sortable />
        <Column field="cpf" header="CPF" />
        <Column field="email" header="E-mail" />
        <Column header="Cargo" body={cargoTemplate} />
        <Column header="Secretaria" body={secretariaTemplate} />
        <Column header="Ações" body={acoesTemplate} style={{ width: "80px" }} alignFrozen="right" frozen />
      </DataTable>

      {/* MODAL CRIAR USUÁRIO */}
      <Dialog
        header="Novo Usuário"
        visible={modalOpen}
        style={{ width: "40vw" }}
        modal
        onHide={() => { setModalOpen(false); resetForm(); }}
      >
        <div className="flex flex-col gap-3 p-3">
          <label>Nome completo</label>
          <InputText value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Maria Silva" className="w-full" />

          <label>CPF</label>
          <InputText value={cpf} onChange={(e) => handleCpfChange(e.target.value)} placeholder="000.000.000-00" maxLength={14} className="w-full" />

          <label>E-mail</label>
          <InputText value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@prefeitura.gov.br" className="w-full" />

          <label>Senha</label>
          <Password value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha de acesso" feedback={false} toggleMask className="w-full" inputClassName="w-full" />

          <label>Cargo</label>
          <Dropdown
            value={cargo}
            options={[
              { label: "Usuário", value: "usuario" },
              { label: "Gerente", value: "gerente" },
            ]}
            onChange={(e) => setCargo(e.value)}
            className="w-full"
          />

          <label>Secretaria</label>
          <Dropdown
            value={secretariaId}
            options={secretarias.map(s => ({ label: s.nome, value: s.id }))}
            onChange={(e) => setSecretariaId(e.value)}
            placeholder="Selecione a secretaria"
            className="w-full"
          />

          <Button label="Salvar Usuário" icon="pi pi-check" className="p-button-success mt-3" onClick={handleSave} />
        </div>
      </Dialog>
    </div>
  );
}
