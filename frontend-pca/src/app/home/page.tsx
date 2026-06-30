"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";

import { secretariaService } from "@/services/secretaria/secretariaService";
import { Secretaria } from "@/types/secretaria";
import HomeCard from "@/components/cards/HomeCard";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function HomePage() {
  const guardStatus = useRouteGuard('admin');
  const router = useRouter();
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);

  React.useEffect(() => {
    if (guardStatus === 'denied') {
      const sid = typeof window !== 'undefined' ? localStorage.getItem('secretariaId') : null;
      router.replace(sid ? `/mesesSecretaria/${sid}` : '/');
    }
    // CORREÇÃO: Adicionado o router nas dependências para limpar o warning do ESLint
  }, [guardStatus, router]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastRef = useRef<Toast>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [novaSecretaria, setNovaSecretaria] = useState("");

  // ======================================
  // FETCH SECRETARIAS
  // ======================================
  useEffect(() => {
    const fetchSecretarias = async () => {
      try {
        const data = await secretariaService.getAll();
        setSecretarias(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar secretarias:", err);
        setError("Não foi possível carregar as secretarias. Verifique o servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchSecretarias();
  }, []);

  // ======================================
  // ADICIONAR SECRETARIA
  // ======================================
  const handleAddSecretaria = async () => {
    if (!novaSecretaria.trim()) return;

    try {
      const nova = await secretariaService.create({ nome: novaSecretaria });
      setSecretarias((prev) => [...prev, nova]);
      setNovaSecretaria("");
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao adicionar secretaria:", error);
      toastRef.current?.show({ severity: "error", summary: "Erro", detail: "Não foi possível adicionar a secretaria.", life: 3000 });
    }
  };

  // ======================================
  // TELAS DE STATUS
  // ======================================

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <ProgressSpinner aria-label="Carregando Secretarias" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-content-center m-5">
        <Card title="Erro de Conexão" className="shadow-4 surface-card">
          <p className="p-text-danger">{error}</p>
        </Card>
      </div>
    );
  }

  // ======================================
  // RENDERIZAÇÃO DOS CARDS
  // ======================================

  return (
    <div className="p-5">
      <Toast ref={toastRef} position="top-right" />
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold text-900">Lista de Secretarias</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: '#16a34a' }}
        >
          <i className="pi pi-plus text-xs" />
          Adicionar Secretaria
        </button>
      </div>

      {secretarias.length === 0 ? (
        <div className="flex flex-column align-items-center justify-content-center gap-3 p-6 mt-4">
          <i className="pi pi-inbox text-6xl text-400" />
          <p className="text-xl text-500">Nenhuma secretaria cadastrada ainda.</p>
          {/* CORREÇÃO: Mudado de "Adicionar Secretaria" para usar &quot; que evita o erro fatal do Next build */}
          <p className="text-sm text-400">Clique em &quot;Adicionar Secretaria&quot; para começar.</p>
        </div>
      ) : (
        <div className="grid">
          {secretarias.map((secretaria) => (
            <div key={secretaria.id} className="col-12 md:col-6 lg:col-3 mb-4">
              <HomeCard
                secretaryId={secretaria.id}
                secretaryName={secretaria.nome}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal para adicionar secretaria */}
      <Dialog
        header="Nova Secretaria"
        visible={showModal}
        style={{ width: "30vw" }}
        modal
        onHide={() => setShowModal(false)}
      >
        <div className="flex flex-column gap-3 p-3">
          <label htmlFor="nome">Nome da Secretaria</label>
          <InputText
            id="nome"
            value={novaSecretaria}
            onChange={(e) => setNovaSecretaria(e.target.value)}
            placeholder="Digite o nome da secretaria"
            className="w-full"
          />
          <Button
            label="Adicionar"
            icon="pi pi-check"
            className="p-button-success mt-2"
            onClick={handleAddSecretaria}
          />
        </div>
      </Dialog>
    </div>
  );
}