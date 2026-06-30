"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { useNotificacao } from '@/context/NotificacaoContext';

interface HomeCardProps {
  secretaryId: string;
  secretaryName: string;
}

const HomeCard: React.FC<HomeCardProps> = ({ secretaryId, secretaryName }) => {
  const router = useRouter();
  const { temNotifSecretaria } = useNotificacao();
  const temNotif = temNotifSecretaria(secretaryId);

  return (
    <div className="relative">
      {temNotif && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ef4444",
            border: "2px solid #fff",
            zIndex: 10,
            boxShadow: "0 0 0 2px #fecaca",
          }}
        />
      )}
      <Card
        title={
          <div style={{ minHeight: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 className="font-bold text-lg text-center leading-tight">{secretaryName}</h3>
          </div>
        }
        className="shadow-5 surface-card hover:shadow-7 transition-shadow transition-duration-300 h-full flex flex-col cursor-pointer"
        onClick={() => router.push(`/mesesSecretaria/${secretaryId}`)}
      >
        <div className="flex justify-content-center align-items-center py-4">
          <i className="pi pi-building text-5xl text-400" />
        </div>
        <div className="flex justify-content-center align-items-center gap-1 text-500 text-sm mt-2">
          <span>Visualizar</span>
          <i className="pi pi-angle-right text-xs" />
        </div>
      </Card>
    </div>
  );
};

export default HomeCard;
