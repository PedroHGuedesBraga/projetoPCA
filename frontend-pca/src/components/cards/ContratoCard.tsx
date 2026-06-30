"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';

interface ContratoCardProps {
  status: 'aprovado' | 'andamento' | 'urgente' | 'rascunho';
  contratoNome: string;
  itemCount: number;
  contratoId: string;
  codigoRastreio?: string;
  hasNotif?: boolean;
  data?: string;
  aprovado?: boolean;
  createdAt?: string;
}

type VencTipo = 'ok' | 'proximo' | 'critico' | 'vencido' | null;

function getVencimento(data?: string): { tipo: VencTipo; dias: number } {
  if (!data) return { tipo: null, dias: 0 };
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(data); d.setHours(0, 0, 0, 0);
  const dias = Math.ceil((d.getTime() - hoje.getTime()) / 86400000);
  if (dias < 0)  return { tipo: 'vencido',  dias: Math.abs(dias) };
  if (dias <= 3) return { tipo: 'critico',  dias };
  if (dias <= 30) return { tipo: 'proximo', dias };
  return { tipo: 'ok', dias };
}

const vencConfig: Record<string, { bg: string; icon: string; label: (d: number) => string }> = {
  ok:      { bg: '#16a34a', icon: 'pi-calendar-clock', label: (d) => `Vence em ${d}d` },
  proximo: { bg: '#f97316', icon: 'pi-clock',          label: (d) => `Vence em ${d}d` },
  critico: { bg: '#dc2626', icon: 'pi-clock',          label: (d) => `Vence em ${d}d` },
  vencido: { bg: '#7f1d1d', icon: 'pi-exclamation-triangle', label: (d) => `Vencido há ${d}d` },
};

const statusConfig = {
  aprovado:  { color: '#22c55e', label: 'Aprovado',     icon: 'pi-check-circle'         },
  andamento: { color: '#3b82f6', label: 'Em Andamento', icon: 'pi-sync'                 },
  urgente:   { color: '#ef4444', label: 'Urgente',      icon: 'pi-exclamation-triangle' },
  rascunho:  { color: '#94a3b8', label: 'Rascunho',     icon: 'pi-pencil'               },
};

const fmtData = (d?: string) => {
  if (!d) return null;
  const [y, m, day] = d.split('T')[0].split('-');
  return `${day}/${m}/${y}`;
};

const ContratoCard: React.FC<ContratoCardProps> = ({ status, contratoNome, itemCount, contratoId, codigoRastreio, hasNotif = false, data, aprovado, createdAt }) => {
  const router = useRouter();
  const cfg = statusConfig[status] ?? statusConfig.andamento;
  const venc = getVencimento(data);
  const vc = venc.tipo ? vencConfig[venc.tipo] : null;

  return (
    <div className="relative">
      {hasNotif && (
        <span style={{
          position: "absolute", top: 10, right: 10,
          width: 12, height: 12, borderRadius: "50%",
          background: "#ef4444", border: "2px solid #fff",
          zIndex: 10, boxShadow: "0 0 0 2px #fecaca",
        }} />
      )}
      <Card
        header={<div style={{ backgroundColor: cfg.color, height: 4, borderRadius: "6px 6px 0 0" }} />}
        className="shadow-3 surface-card hover:shadow-5 transition-shadow transition-duration-300 h-full flex flex-col cursor-pointer overflow-hidden"
        style={{ borderTop: "none" }}
        pt={{ body: { style: { padding: '0.75rem' } }, content: { style: { padding: 0 } } }}
        onClick={() => router.push(`/itensContrato/${contratoId}`)}
      >
        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.3, minHeight: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.2rem' }} className="text-900 line-clamp-2">{contratoNome}</h3>
        {codigoRastreio && (
          <p className="text-center text-400 font-mono" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>{codigoRastreio}</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', padding: '0.4rem 0' }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: '#374151' }}>{itemCount}</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6b7280' }}>Total de Itens</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginTop: '0.5rem', marginBottom: '0.2rem' }}>
          <i className={`pi ${cfg.icon}`} style={{ color: cfg.color, fontSize: '0.72rem' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
        </div>
        {vc && !aprovado && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.4rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              background: vc.bg, color: '#fff',
              borderRadius: '999px', padding: '0.2rem 0.6rem',
              fontSize: '0.62rem', fontWeight: 700,
            }}>
              <i className={`pi ${vc.icon}`} style={{ fontSize: '0.62rem' }} />
              {vc.label(venc.dias)}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9' }}>
          {createdAt && (
            <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
              <i className="pi pi-calendar-plus" style={{ fontSize: '0.58rem', marginRight: '0.2rem' }} />
              {fmtData(createdAt)}
            </span>
          )}
          {data && (
            <span style={{ fontSize: '0.62rem', color: '#dc2626', fontWeight: 600 }}>
              <i className="pi pi-calendar-times" style={{ fontSize: '0.58rem', marginRight: '0.2rem' }} />
              {fmtData(data)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.2rem', color: '#9ca3af', fontSize: '0.7rem', marginTop: '0.4rem' }}>
          <span>Ver Itens</span>
          <i className="pi pi-angle-right" style={{ fontSize: '0.6rem' }} />
        </div>
      </Card>
    </div>
  );
};

export default ContratoCard;
