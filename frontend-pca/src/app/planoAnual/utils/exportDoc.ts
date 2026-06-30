import { SecretariaPlano } from "@/services/planoAnual/planoAnualService";
import { Toast } from "primereact/toast";

interface ExportDocProps {
  ano: number;
  dados: SecretariaPlano[];
  totalContratos: number;
  totalItens: number;
  toast: React.RefObject<Toast | null>;
  fmtDate: (d: string) => string;
  STATUS_LABEL: Record<string, string>;
  STATUS_COLOR: Record<string, string>;
}

export const handleExportPDF = async ({ ano, dados, totalContratos, totalItens, toast, fmtDate, STATUS_LABEL, STATUS_COLOR }: ExportDocProps) => {
  try {
    toast.current?.show({ severity: "info", summary: "Gerando Documento", detail: "Aguarde...", life: 3000 });

    const secoes = dados.map(sec => {
      const contratosHtml = sec.contratos.map(c => {
        const itensHtml = (c.Items || []).map((item, idx) => {
          const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
          return `<tr style="background:${bg}">
            <td style="padding:5px 8px;border:1px solid #e5e7eb">${item.nome}</td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb">${item.descricao || "-"}</td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:center">${item.quantidadeItem}</td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:center">${item.unidadeDeMedida || "-"}</td>
            <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:center;color:${item.aprovado ? "#15803d" : "#b91c1c"};font-weight:bold">${item.aprovado ? "✓ Sim" : "✗ Não"}</td>
          </tr>`;
        }).join("");
        return `
          <div style="margin-bottom:16px;border-left:4px solid #3b82f6;padding-left:10px">
            <div style="font-size:10pt;font-weight:bold;color:#1e3a5f;margin-bottom:4px">
              ${c.nome}
              <span style="font-weight:normal;color:#64748b;margin-left:8px;font-size:9pt">${fmtDate(c.data)}</span>
              <span style="margin-left:8px;color:${STATUS_COLOR[c.status] || "#64748b"};font-size:9pt">${STATUS_LABEL[c.status] || c.status}</span>
              ${c.aprovado ? '<span style="margin-left:6px;color:#15803d;font-size:9pt">✓ Aprovado</span>' : ""}
              ${c.codigoRastreio ? `<span style="margin-left:8px;color:#94a3b8;font-family:monospace;font-size:8pt">${c.codigoRastreio}</span>` : ""}
            </div>
            ${c.justificativa ? `<div style="font-size:8pt;color:#7c3aed;font-style:italic;margin-bottom:6px">Justificativa: ${c.justificativa}</div>` : ""}
            ${c.Items && c.Items.length > 0 ? `
            <table style="width:100%;border-collapse:collapse;font-size:9pt">
              <thead>
                <tr style="background:#1a4d99;color:#fff">
                  <th style="padding:5px 8px;border:1px solid #3b82f6;text-align:left">Item</th>
                  <th style="padding:5px 8px;border:1px solid #3b82f6;text-align:left">Descrição</th>
                  <th style="padding:5px 8px;border:1px solid #3b82f6;text-align:center">Qtd</th>
                  <th style="padding:5px 8px;border:1px solid #3b82f6;text-align:center">Unidade</th>
                  <th style="padding:5px 8px;border:1px solid #3b82f6;text-align:center">Aprovado</th>
                </tr>
              </thead>
              <tbody>${itensHtml}</tbody>
            </table>` : '<p style="font-size:9pt;color:#94a3b8;font-style:italic">Sem itens cadastrados.</p>'}
          </div>`;
      }).join("");

      return `
        <div style="margin-bottom:28px;page-break-inside:avoid">
          <div style="background:#1e3a5f;color:#fff;padding:10px 14px;border-radius:6px 6px 0 0;font-size:12pt;font-weight:bold;margin-bottom:12px">
            ${sec.nome}
          </div>
          ${contratosHtml}
        </div>`;
    }).join("");

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>PCA ${ano}</title>
      <style>
        body{font-family:Calibri,Arial,sans-serif;font-size:10pt;margin:1.5cm;color:#1f2937}
        @media print{.no-break{page-break-inside:avoid}}
      </style></head>
      <body>
        <div style="background:#1a4d99;padding:18px 24px;margin-bottom:0">
          <p style="margin:0;color:#fff;font-size:16pt;font-weight:bold">PREFEITURA MUNICIPAL DE NAZAREZINHO</p>
          <p style="margin:4px 0 0;color:#bfd7f5;font-size:10pt">Plano de Contratações Anual — PCA ${ano}</p>
        </div>
        <div style="height:4px;background:#f0c040;margin-bottom:20px"></div>

        <div style="display:flex;gap:24px;margin-bottom:20px;font-size:10pt">
          <div style="background:#f0f7ff;border:1px solid #bfdbfe;padding:10px 18px;border-radius:8px;text-align:center">
            <div style="font-size:8pt;color:#64748b;font-weight:bold;text-transform:uppercase">Secretarias</div>
            <div style="font-size:18pt;font-weight:bold;color:#1d4ed8">${dados.length}</div>
          </div>
          <div style="background:#f0f7ff;border:1px solid #bfdbfe;padding:10px 18px;border-radius:8px;text-align:center">
            <div style="font-size:8pt;color:#64748b;font-weight:bold;text-transform:uppercase">Contratos</div>
            <div style="font-size:18pt;font-weight:bold;color:#1d4ed8">${totalContratos}</div>
          </div>
          <div style="background:#f0f7ff;border:1px solid #bfdbfe;padding:10px 18px;border-radius:8px;text-align:center">
            <div style="font-size:8pt;color:#64748b;font-weight:bold;text-transform:uppercase">Itens</div>
            <div style="font-size:18pt;font-weight:bold;color:#1d4ed8">${totalItens}</div>
          </div>
        </div>

        ${secoes}

        <div style="margin-top:28px;font-size:8pt;color:#9ca3af;text-align:right;font-style:italic">
          Gerado em ${new Date().toLocaleString("pt-BR")} — Sistema PCA | Prefeitura Municipal de Nazarezinho
        </div>
      </body></html>`;

    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `PCA-${ano}.doc`; a.click();
    URL.revokeObjectURL(url);
    toast.current?.show({ severity: "success", summary: "Documento gerado", detail: "Download iniciado.", life: 3000 });
  } catch (err) {
    console.error(err);
    toast.current?.show({ severity: "error", summary: "Erro", detail: "Não foi possível gerar o documento.", life: 3000 });
  }
};