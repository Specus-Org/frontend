export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "0";

  const numValue = typeof num === "string" ? parseFloat(num) : num;

  if (isNaN(numValue)) return "0";

  return numValue.toLocaleString("de-DE"); // Uses dots as thousands separator
}

export function formatMoney(num: number): string {
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000_000_000) {
    return sign + stripTrailingZeros((abs / 1_000_000_000_000).toFixed(3)) + "T";
  }
  if (abs >= 1_000_000_000) {
    return sign + stripTrailingZeros((abs / 1_000_000_000).toFixed(3)) + "B";
  }
  if (abs >= 1_000_000) {
    return sign + stripTrailingZeros((abs / 1_000_000).toFixed(3)) + "M";
  }

  return formatNumber(num);
}

export function shortenNumber(num: number): string {
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return sign + stripTrailingZeros((abs / 1_000_000_000).toFixed(1)) + "B";
  }
  if (abs >= 1_000_000) {
    return sign + stripTrailingZeros((abs / 1_000_000).toFixed(1)) + "M";
  }
  if (abs >= 1_000) {
    return sign + stripTrailingZeros((abs / 1_000).toFixed(1)) + "K";
  }

  return formatNumber(num);
}

function stripTrailingZeros(value: string): string {
  if (!value.includes(".")) return value;
  return value.replace(/\.?0+$/, "");
}

export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `Rp${(value / 1_000_000_000_000).toFixed(0)} triliun`;
  }
  if (value >= 1_000_000_000) {
    return `Rp${(value / 1_000_000_000).toFixed(0)} miliar`;
  }
  if (value >= 1_000_000) {
    return `Rp${(value / 1_000_000).toFixed(0)} juta`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function safeParseNumber(value?: string | null): number {
  if (value == null) return 0;
  const n = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function getStageColor(
  stage?: string | null
): "success" | "warning" | "danger" | "default" {
  const s = (stage ?? "").toLowerCase();
  if (s.includes("batal") || s.includes("cancel") || s.includes("gagal"))
    return "danger";
  if (
    s.includes("evaluasi") ||
    s.includes("klarifikasi") ||
    s.includes("penawaran") ||
    s.includes("seleksi")
  )
    return "warning";
  if (s.includes("selesai") || s.includes("kontrak") || s.includes("pemenang"))
    return "success";
  return "default";
}
