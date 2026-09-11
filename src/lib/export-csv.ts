/**
 * Export CSV utility for the Neurautomation Admin Dashboard.
 * Generates a properly encoded CSV file and triggers a browser download.
 */

type CsvRow = Record<string, string | number | boolean | null | undefined>;

function toCsvString(rows: CsvRow[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",")
  );
  return [header, ...body].join("\r\n");
}

export function downloadCsv(filename: string, rows: CsvRow[], columns: { key: string; label: string }[]): void {
  if (typeof window === "undefined") return;
  const csv = toCsvString(rows, columns);
  // BOM for Excel compatibility with UTF-8 (R$, ã, ç, etc.)
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSalesCsv(
  sales: {
    id: string;
    date: string;
    affiliate_network: string;
    origin: string;
    sale_value: number;
    commission: number;
    status: string;
    tracking_status: string;
    order_id?: string | null;
    notes?: string | null;
  }[],
  storeName?: string
): void {
  const filename = `vendas${storeName ? `_${storeName.toLowerCase().replace(/\s+/g, "_")}` : ""}_${new Date().toISOString().slice(0, 10)}.csv`;
  const columns = [
    { key: "date", label: "Data" },
    { key: "affiliate_network", label: "Rede de Afiliados" },
    { key: "origin", label: "Origem" },
    { key: "order_id", label: "ID do Pedido" },
    { key: "sale_value", label: "Valor da Venda (R$)" },
    { key: "commission", label: "Comissao (R$)" },
    { key: "status", label: "Status" },
    { key: "tracking_status", label: "Rastreamento" },
    { key: "notes", label: "Notas" },
  ];
  downloadCsv(filename, sales as CsvRow[], columns);
}

export function exportAdSpendCsv(
  spends: {
    id: string;
    date: string;
    cost: number;
    clicks: number;
    impressions: number;
    source: string;
    campaign_id?: string | null;
    notes?: string | null;
  }[],
  storeName?: string
): void {
  const filename = `gastos${storeName ? `_${storeName.toLowerCase().replace(/\s+/g, "_")}` : ""}_${new Date().toISOString().slice(0, 10)}.csv`;
  const columns = [
    { key: "date", label: "Data" },
    { key: "source", label: "Fonte" },
    { key: "cost", label: "Custo (R$)" },
    { key: "clicks", label: "Cliques" },
    { key: "impressions", label: "Impressoes" },
    { key: "campaign_id", label: "ID Campanha" },
    { key: "notes", label: "Notas" },
  ];
  downloadCsv(filename, spends as CsvRow[], columns);
}

export function exportPerformanceCsv(
  rows: {
    rank: number;
    name: string;
    network: string;
    clicks: number;
    sales_count: number;
    conversion_rate: number;
    ad_spend: number;
    total_commission: number;
    cpa: number;
    epc: number;
    profit: number;
    roi: number;
    status: string;
  }[]
): void {
  const filename = `performance_lojas_${new Date().toISOString().slice(0, 10)}.csv`;
  const columns = [
    { key: "rank", label: "Rank" },
    { key: "name", label: "Loja" },
    { key: "network", label: "Rede" },
    { key: "clicks", label: "Cliques" },
    { key: "sales_count", label: "Vendas" },
    { key: "conversion_rate", label: "Taxa Conv. (%)" },
    { key: "ad_spend", label: "Gasto Ads (R$)" },
    { key: "total_commission", label: "Comissao (R$)" },
    { key: "cpa", label: "CPA (R$)" },
    { key: "epc", label: "EPC (R$)" },
    { key: "profit", label: "Lucro Liquido (R$)" },
    { key: "roi", label: "ROI (%)" },
    { key: "status", label: "Status" },
  ];
  downloadCsv(filename, rows as CsvRow[], columns);
}
