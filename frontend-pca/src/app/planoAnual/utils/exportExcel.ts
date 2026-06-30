import { SecretariaPlano } from "@/services/planoAnual/planoAnualService";
import { Toast } from "primereact/toast";

interface ExportExcelProps {
    ano: number;
    dados: SecretariaPlano[];
    toast: React.RefObject<Toast | null>;
    fmtDate: (d: string) => string;
    STATUS_LABEL: Record<string, string>;
}

export const handleExportExcel = async ({ ano, dados, toast, fmtDate, STATUS_LABEL }: ExportExcelProps) => {
    try {
        toast.current?.show({ severity: "info", summary: "Gerando Excel", detail: "Aguarde...", life: 3000 });
        const ExcelJS = await import("exceljs");
        const wb = new ExcelJS.Workbook();
        wb.creator = "Sistema PCA";
        const ws = wb.addWorksheet(`PCA ${ano}`, {
            pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1 },
        });

        const COLS = 5;
        ws.columns = [
            { key: "a", width: 32 }, { key: "b", width: 36 }, { key: "c", width: 10 },
            { key: "d", width: 16 }, { key: "e", width: 14 },
        ];

        const merge = (r: number, val: string | number, style: any, h = 20) => {
            ws.mergeCells(r, 1, r, COLS);
            const cell = ws.getCell(r, 1);
            cell.value = val; cell.style = style;
            ws.getRow(r).height = h;
        };

        let row = 1;
        merge(row++, "PREFEITURA MUNICIPAL DE NAZAREZINHO", {
            font: { bold: true, size: 16, color: { argb: "FFFFFFFF" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A4D99" } },
            alignment: { horizontal: "center", vertical: "middle" },
        }, 36);
        merge(row++, `Plano de Contratações Anual — PCA ${ano}`, {
            font: { size: 11, color: { argb: "FFBFD7F5" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A4D99" } },
            alignment: { horizontal: "center", vertical: "middle" },
        }, 20);
        ws.mergeCells(row, 1, row, COLS);
        ws.getCell(row, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0C040" } };
        ws.getRow(row).height = 4; row++;
        ws.addRow([]); row++;

        const hdrStyle = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } },
            alignment: {
                horizontal: 'center', // ou o alinhamento que você definiu
                vertical: 'middle'
            },
            border: { bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } } }
        } as const; // <--- Adicione isso aqui

        for (const sec of dados) {
            ws.mergeCells(row, 1, row, COLS);
            const secCell = ws.getCell(row, 1);
            secCell.value = sec.nome.toUpperCase();
            secCell.style = {
                font: { bold: true, size: 12, color: { argb: "FFFFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } },
                alignment: { horizontal: "left", vertical: "middle", indent: 1 },
            };
            ws.getRow(row).height = 24; row++;

            for (const c of sec.contratos) {
                ws.mergeCells(row, 1, row, COLS);
                const cCell = ws.getCell(row, 1);
                cCell.value = `  ${c.nome}  |  ${fmtDate(c.data)}  |  ${STATUS_LABEL[c.status] || c.status}${c.aprovado ? "  ✓ Aprovado" : ""}`;
                cCell.style = {
                    font: { bold: true, size: 10, color: { argb: "FF1E3A5F" } },
                    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF3FB" } },
                    alignment: { horizontal: "left", vertical: "middle" },
                    border: { left: { style: "thick" as const, color: { argb: "FF3B82F6" } } },
                };
                ws.getRow(row).height = 20; row++;

                if (c.Items && c.Items.length > 0) {
                    const hdrRow = ws.getRow(row);
                    ["Item", "Descrição", "Qtd", "Unidade", "Aprovado"].forEach((h, i) => {
                        const cell = hdrRow.getCell(i + 1); cell.value = h; cell.style = hdrStyle;
                    });
                    ws.getRow(row).height = 18; row++;

                    for (const item of c.Items) {
                        const iRow = ws.getRow(row);
                        [item.nome, item.descricao || "-", item.quantidadeItem, item.unidadeDeMedida || "-",
                        item.aprovado ? "✓ Sim" : "✗ Não"
                        ].forEach((v, i) => {
                            const cell = iRow.getCell(i + 1);
                            cell.value = v;
                            cell.style = {
                                alignment: { horizontal: i >= 2 ? "center" : "left", vertical: "middle" },
                                fill: { type: "pattern", pattern: "solid", fgColor: { argb: row % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF" } },
                                font: i === 4 ? { color: { argb: item.aprovado ? "FF15803D" : "FFB91C1C" }, bold: true } : {},
                                border: { bottom: { style: "hair" as const, color: { argb: "FFE5E7EB" } } },
                            };
                        });
                        ws.getRow(row).height = 16; row++;
                    }
                }
                row++;
            }
            row++;
        }

        const buf = await wb.xlsx.writeBuffer();
        const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `PCA-${ano}.xlsx`; a.click();
        URL.revokeObjectURL(url);
        toast.current?.show({ severity: "success", summary: "Excel gerado", detail: "Download iniciado.", life: 3000 });
    } catch (err) {
        console.error(err);
        toast.current?.show({ severity: "error", summary: "Erro", detail: "Não foi possível gerar o Excel.", life: 3000 });
    }
};