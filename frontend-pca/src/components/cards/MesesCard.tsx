"use client";

import React from 'react';
import { Card } from 'primereact/card';

interface MesesCardProps {
  monthName: string;
  totalCount: number;
  onClick: () => void;
  hasNotif?: boolean;
}

const MesesCard: React.FC<MesesCardProps> = ({ monthName, totalCount, onClick, hasNotif = false }) => {
  return (
    <div className="relative">
      {hasNotif && (
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
        title={<h3 className="text-2xl font-bold text-center text-900">{monthName}</h3>}
        className="shadow-5 surface-card hover:shadow-7 transition-shadow transition-duration-300 h-full flex flex-col cursor-pointer"
        onClick={onClick}
      >
        <div className="flex flex-col align-items-center justify-content-center w-full gap-2 py-3">
          <span className="text-6xl font-bold text-700">{totalCount}</span>
          <span className="text-sm font-bold text-600">Total de Contratos</span>
        </div>
        <div className="flex justify-content-center align-items-center gap-1 text-500 text-sm mt-2">
          <span>Ver Contratos</span>
          <i className="pi pi-angle-right text-xs" />
        </div>
      </Card>
    </div>
  );
};

export default MesesCard;
