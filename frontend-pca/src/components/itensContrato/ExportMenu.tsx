"use client";

import { useRef, useState } from "react";
import { exportExcel, exportDoc, exportPDF } from "@/utils/exportContrato";

type ShowToast = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => void;

interface ExportMenuProps {
  contrato: any;
  itens: any[];
  logo: string | null;
  secretariaNome: string;
  showToast: ShowToast;
}

export default function ExportMenu({ contrato, itens, logo, secretariaNome, showToast }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const options = [
    { label: "PDF",   icon: "pi-file-pdf",  color: "#dc2626", fn: () => exportPDF(contrato, itens, logo, secretariaNome, showToast) },
    { label: "Excel", icon: "pi-table",     color: "#15803d", fn: () => exportExcel(contrato, itens, secretariaNome, showToast) },
    { label: "DOC",   icon: "pi-file-word", color: "#4f46e5", fn: () => exportDoc(contrato, itens, secretariaNome, showToast) },
  ];

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        style={{ backgroundColor: "#475569" }}
      >
        <i className="pi pi-download text-xs" />
        Exportar
        <i className={`pi ${open ? "pi-chevron-up" : "pi-chevron-down"} text-xs`} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb", overflow: "hidden", minWidth: "160px", zIndex: 50 }}>
          {options.map(opt => (
            <button
              key={opt.label}
              onClick={() => { opt.fn(); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", padding: "0.65rem 1rem", background: "transparent", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, color: opt.color }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <i className={`pi ${opt.icon}`} style={{ fontSize: "0.85rem" }} />{opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
