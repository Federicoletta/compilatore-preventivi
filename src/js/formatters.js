/**
 * Utility pure di formattazione, sanitizzazione HTML (anti-XSS) e nomi file.
 */

export function euro(n) {
  const num = Number(n);
  const safe = Number.isFinite(num) ? num : 0;
  const formatted = safe.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `€\u00A0${formatted}`;
}

export function numeroBreve(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("it-IT", { maximumFractionDigits: 2 });
}

export function aIsoLocale(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function aggiungiGiorni(isoDate, giorni = 30) {
  if (!isoDate) return "";
  const parts = String(isoDate).split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return "";
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + giorni);
  return aIsoLocale(d);
}

export function dataIt(iso) {
  if (!iso) return "";
  const str = String(iso).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return str;
  const mesi = [
    "gennaio",
    "febbraio",
    "marzo",
    "aprile",
    "maggio",
    "giugno",
    "luglio",
    "agosto",
    "settembre",
    "ottobre",
    "novembre",
    "dicembre",
  ];
  const anno = match[1];
  const mese = mesi[parseInt(match[2], 10) - 1] || match[2];
  const giorno = parseInt(match[3], 10);
  return `${giorno} ${mese} ${anno}`;
}

export function dataBreve(iso) {
  if (!iso) return "—";
  const str = String(iso).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return str;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function dataOra(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function maiuscola(s) {
  const str = String(s || "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizzaChiave(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function sanitizzaNomeFile(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

export function nomeFileDocumento(tipo, quote) {
  const num = sanitizzaNomeFile(quote?.numero || "Preventivo");
  const cl = sanitizzaNomeFile(quote?.cliente?.nome || "");
  const parts = ["FC", sanitizzaNomeFile(tipo || "Preventivo"), num, cl].filter(Boolean);
  return `${parts.join("_")}.pdf`;
}

export function generaId(prefisso = "p") {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefisso}_${ts}_${rand}`.slice(0, 64);
}
