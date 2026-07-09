type ShowToast = (severity: "success" | "error" | "warn" | "info", summary: string, detail?: string) => void;

const exportStatusMap: Record<string, string> = {
  aprovado: "Aprovado", andamento: "Em Andamento", urgente: "Urgente", rascunho: "Rascunho",
};

function fmtData(d: string) {
  if (!d) return "-";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

export async function exportExcel(contrato: any, itens: any[], secretariaNome: string, showToast: ShowToast) {
  try {
    showToast("info", "Gerando Excel", "Aguarde um momento...");
    const ExcelJS = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    wb.creator = "Sistema PCA"; wb.created = new Date();
    const ws = wb.addWorksheet("Contrato", { pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1 } });
    const COLS = 7;
    ws.columns = [{ key: "a", width: 30 }, { key: "b", width: 36 }, { key: "c", width: 9 }, { key: "d", width: 14 }, { key: "e", width: 20 }, { key: "f", width: 20 }, { key: "g", width: 12 }];

    const merge = (r: number, value: string | number, style: any, height = 22) => {
      ws.mergeCells(r, 1, r, COLS);
      const cell = ws.getCell(r, 1);
      cell.value = value; cell.style = style;
      ws.getRow(r).height = height;
    };

    merge(1, "PREFEITURA MUNICIPAL DE NAZAREZINHO", { font: { bold: true, size: 15, color: { argb: "FFFFFFFF" } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A4D99" } }, alignment: { horizontal: "center", vertical: "middle" } }, 34);
    merge(2, "Sistema de Gestão do Plano de Contratações Anual — PCA", { font: { size: 10, color: { argb: "FFBFD7F5" } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A4D99" } }, alignment: { horizontal: "center", vertical: "middle" } }, 18);
    ws.mergeCells(3, 1, 3, COLS);
    ws.getCell(3, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0C040" } };
    ws.getRow(3).height = 4;
    ws.addRow([]);

    const infoData = [
      ["Secretaria", secretariaNome || "-"], ["Contrato", contrato.nome],
      ["Código de Rastreio", contrato.codigoRastreio || "-"], ["Data de Vencimento", fmtData(contrato.data)],
      ["Status", exportStatusMap[contrato.status] || contrato.status], ["Situação", contrato.aprovado ? "Aprovado" : "Pendente de aprovação"],
    ];
    let r = 5;
    for (const [label, value] of infoData) {
      ws.mergeCells(r, 1, r, 3); ws.mergeCells(r, 4, r, COLS);
      const lCell = ws.getCell(r, 1);
      lCell.value = label;
      lCell.style = { font: { bold: true, size: 10, color: { argb: "FF1E3A5F" } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF3FB" } }, alignment: { horizontal: "left", vertical: "middle", indent: 1 }, border: { bottom: { style: "thin", color: { argb: "FFD1D5DB" } }, right: { style: "thin", color: { argb: "FFD1D5DB" } } } };
      const vCell = ws.getCell(r, 4);
      vCell.value = value;
      vCell.style = { font: { size: 10, color: { argb: "FF1F2937" } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } }, alignment: { horizontal: "left", vertical: "middle", indent: 1 }, border: { bottom: { style: "thin", color: { argb: "FFD1D5DB" } } } };
      ws.getRow(r).height = 22; r++;
    }
    r++;
    merge(r, "ITENS DO CONTRATO", { font: { bold: true, size: 12, color: { argb: "FF1A4D99" } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF3FB" } }, alignment: { horizontal: "left", vertical: "middle", indent: 1 }, border: { bottom: { style: "medium", color: { argb: "FF1A4D99" } }, top: { style: "medium", color: { argb: "FF1A4D99" } } } }, 26); r++;

    const headerRow = ws.getRow(r);
    ["Nome", "Descrição", "Qtd", "Unidade", "Aprovado"].forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.style = { font: { bold: true, size: 10, color: { argb: "FFFFFFFF" } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A4D99" } }, alignment: { horizontal: "center", vertical: "middle" }, border: { bottom: { style: "thin", color: { argb: "FF3B82F6" } }, right: { style: "thin", color: { argb: "FF3B82F6" } } } };
    });
    headerRow.height = 24; r++;

    itens.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC";
      const dataRow = ws.getRow(r);
      [item.nome, item.descricao || "-", Number(item.quantidadeItem), item.unidadeDeMedida || "-", item.aprovado ? "✓ Sim" : "✗ Não"].forEach((v, i) => {
        const cell = dataRow.getCell(i + 1);
        cell.value = v;
        const isText = i < 2; const isAprov = i === 4;
        cell.style = { font: { size: 10, color: { argb: isAprov ? (item.aprovado ? "FF15803D" : "FFB91C1C") : "FF1F2937" } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: bg } }, alignment: { horizontal: isText ? "left" : "center", vertical: "middle", indent: isText ? 1 : 0 }, border: { bottom: { style: "hair", color: { argb: "FFE5E7EB" } }, right: { style: "hair", color: { argb: "FFE5E7EB" } } } };
      });
      dataRow.height = 20; r++;
    });
    r++;
    ws.mergeCells(r, 1, r, COLS);
    const footerCell = ws.getCell(r, 1);
    footerCell.value = `Gerado em ${new Date().toLocaleString("pt-BR")} — Sistema PCA | Prefeitura Municipal de Nazarezinho`;
    footerCell.style = { font: { size: 8, color: { argb: "FF9CA3AF" }, italic: true }, alignment: { horizontal: "right", vertical: "middle" } };

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `contrato-${contrato.nome.replace(/\s+/g, "-")}.xlsx`; a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Excel gerado", "O download foi iniciado.");
  } catch (err) {
    console.error(err);
    showToast("error", "Erro ao gerar Excel", "Não foi possível gerar o Excel.");
  }
}

export function exportDoc(contrato: any, itens: any[], secretariaNome: string, showToast: ShowToast) {
  try {
    showToast("info", "Gerando DOC", "Aguarde um momento...");
    const itensRows = itens.map((item, idx) => {
      const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
      return `<tr style="background:${bg}"><td style="padding:6px 8px;border:1px solid #e5e7eb">${item.nome}</td><td style="padding:6px 8px;border:1px solid #e5e7eb">${item.descricao || "-"}</td><td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${item.quantidadeItem}</td><td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center">${item.unidadeDeMedida || "-"}</td><td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center;color:${item.aprovado ? "#15803d" : "#b91c1c"};font-weight:bold">${item.aprovado ? "✓ Sim" : "✗ Não"}</td></tr>`;
    }).join("");

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${contrato.nome}</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:2cm;color:#1f2937}.header-box{background:#1a4d99;padding:18px 24px;margin-bottom:0}.header-title{color:#fff;font-size:16pt;font-weight:bold;margin:0}.header-sub{color:#bfd7f5;font-size:10pt;margin:4px 0 0 0}.gold{height:4px;background:#f0c040;margin:0 0 20px 0}.contract-title{font-size:14pt;font-weight:bold;color:#1a4d99;margin-bottom:12px}.info-table{width:100%;border-collapse:collapse;margin-bottom:20px}.info-table td{padding:7px 10px;border:1px solid #e2e8f0;font-size:10pt}.info-table .lbl{background:#eef3fb;font-weight:bold;color:#1e3a5f;width:36%}.section-title{font-size:12pt;font-weight:bold;color:#1a4d99;background:#eef3fb;padding:8px 10px;border-top:2px solid #1a4d99;border-bottom:2px solid #1a4d99;margin:20px 0 8px 0}.items-table{width:100%;border-collapse:collapse}.items-table th{background:#1a4d99;color:#fff;font-weight:bold;padding:8px;text-align:center;border:1px solid #3b82f6;font-size:10pt}.items-table td{font-size:10pt}.footer{margin-top:28px;font-size:8pt;color:#9ca3af;text-align:right;font-style:italic}</style></head><body><div class="header-box"><p class="header-title">PREFEITURA MUNICIPAL DE NAZAREZINHO</p><p class="header-sub">Sistema de Gestão do Plano de Contratações Anual — PCA${secretariaNome ? ` &nbsp;|&nbsp; ${secretariaNome}` : ""}</p></div><div class="gold"></div><p class="contract-title">${contrato.nome}</p><table class="info-table"><tr><td class="lbl">Código de Rastreio</td><td>${contrato.codigoRastreio || "-"}</td></tr><tr><td class="lbl">Data de Vencimento</td><td>${fmtData(contrato.data)}</td></tr><tr><td class="lbl">Status</td><td>${exportStatusMap[contrato.status] || contrato.status}</td></tr><tr><td class="lbl">Situação</td><td>${contrato.aprovado ? "Aprovado" : "Pendente de aprovação"}</td></tr></table><div class="section-title">ITENS DO CONTRATO</div><table class="items-table"><thead><tr><th>Nome</th><th>Descrição</th><th>Qtd</th><th>Unidade</th><th>Aprovado</th></tr></thead><tbody>${itensRows}</tbody></table><div class="footer">Gerado em ${new Date().toLocaleString("pt-BR")} — Sistema PCA | Prefeitura Municipal de Nazarezinho</div></body></html>`;

    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `contrato-${contrato.nome.replace(/\s+/g, "-")}.doc`; a.click();
    URL.revokeObjectURL(url);
    showToast("success", "DOC gerado", "O download foi iniciado.");
  } catch (err) {
    console.error(err);
    showToast("error", "Erro ao gerar DOC", "Não foi possível gerar o DOC.");
  }
}

export async function exportPDF(contrato: any, itens: any[], logo: string | null, secretariaNome: string, showToast: ShowToast) {
  try {
    showToast("info", "Gerando PDF", "Aguarde um momento...");
    const { pdf } = await import("@react-pdf/renderer");
    const { ContratoPDF } = await import("@/components/pdf/ContratoPDF");
    const blob = await pdf(
      <ContratoPDF contrato={contrato} itens={itens} logo={logo} secretariaNome={secretariaNome} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `contrato-${contrato.nome.replace(/\s+/g, "-")}.pdf`; a.click();
    URL.revokeObjectURL(url);
    showToast("success", "PDF gerado", "O download foi iniciado.");
  } catch (err) {
    console.error(err);
    showToast("error", "Erro ao gerar PDF", "Não foi possível gerar o PDF.");
  }
}
