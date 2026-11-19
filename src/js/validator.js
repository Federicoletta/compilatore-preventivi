/**
 * Validazione, sanificazione, numerazione progressiva sicura e serializzazione
 * strettamente conforme a /firestore.rules (zero chiavi non consentite, zero array annidati).
 */

import { CONDIZIONI_STD, ESCLUSO_STD, INCLUSO_STD } from "./config.js";
import { calcolaTotali } from "./calculations.js";
import { aIsoLocale, aggiungiGiorni, generaId } from "./formatters.js";

export const ALLOWED_QUOTE_FIELDS = [
  "id",
  "numero",
  "data",
  "validita",
  "stato",
  "cliente",
  "progetto",
  "voci",
  "sconto",
  "sconto_txt",
  "regime",
  "ritenuta",
  "rivalsa",
  "iva",
  "bollo",
  "incluso",
  "escluso",
  "opzioni",
  "condizioni",
  "io",
  "totale",
  "modificato",
  "driveFileId",
  "driveUrl",
  "driveSavedAt",
  "cestinato",
  "eliminatoIl",
  "annullamento",
];

export const ALLOWED_CLIENT_FIELDS = [
  "id",
  "nome",
  "ref",
  "indirizzo",
  "piva",
  "cf",
  "sdi",
  "pec",
  "email",
  "tel",
  "note",
  "creato",
  "modificato",
];

export const ALLOWED_PRICE_ITEM_FIELDS = [
  "id",
  "cat",
  "nome",
  "desc",
  "unita",
  "prezzo",
  "ordine",
  "attivo",
  "creato",
  "modificato",
];

export const VALID_STATUSES = new Set([
  "bozza",
  "inviato",
  "accettato",
  "rifiutato",
  "annullato",
]);

function normalizeConditionItem(cond) {
  if (Array.isArray(cond)) {
    return { titolo: String(cond[0] || ""), testo: String(cond[1] || "") };
  }
  if (cond && typeof cond === "object") {
    return {
      titolo: String(cond.titolo ?? cond.nome ?? ""),
      testo: String(cond.testo ?? cond.desc ?? ""),
    };
  }
  return { titolo: String(cond || ""), testo: "" };
}

/**
 * Calcola il prossimo numero progressivo dell'anno corrente (es. 2026-001)
 * esaminando TUTTI i preventivi (inclusi quelli cestinati) per impedire collisioni.
 */
export function prossimoNumero(allQuotes = [], year = new Date().getFullYear()) {
  const prefix = `${year}-`;
  let max = 0;
  for (const q of Array.isArray(allQuotes) ? allQuotes : []) {
    const numStr = String(q?.numero || "").trim();
    if (numStr.startsWith(prefix)) {
      const tail = numStr.slice(prefix.length);
      const parsed = parseInt(tail, 10);
      if (Number.isFinite(parsed) && parsed > max) {
        max = parsed;
      }
    }
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

/**
 * Crea un preventivo nuovo pulito (bozza non ancora persistita in Firestore fino alla prima modifica).
 */
export function creaPreventivoVuoto({ allQuotes = [], issuer = {} } = {}) {
  const oggi = aIsoLocale(new Date());
  return sanificaPreventivo({
    id: generaId("p"),
    numero: prossimoNumero(allQuotes),
    data: oggi,
    validita: aggiungiGiorni(oggi, 30),
    stato: "bozza",
    cliente: {
      clienteId: "",
      nome: "",
      ref: "",
      indirizzo: "",
      piva: "",
      cf: "",
      sdi: "",
      pec: "",
      email: "",
      tel: "",
    },
    progetto: {
      titolo: "",
      tipo: "",
      luogo: "",
      giornate: "",
      consegna: "",
      saluto: "Gentile Cliente,",
      intro: "",
      scontoTipo: "euro",
      scontoValore: 0,
    },
    voci: [{ nome: "", desc: "", q: 1, p: 0 }],
    sconto: 0,
    scontoTipo: "euro",
    scontoValore: 0,
    sconto_txt: "",
    regime: "occasionale",
    ritenuta: 20,
    rivalsa: 0,
    iva: 22,
    bollo: "auto",
    incluso: [...INCLUSO_STD],
    escluso: [...ESCLUSO_STD],
    opzioni: [],
    condizioni: CONDIZIONI_STD.map((c) => ({ ...c })),
    io: {
      cf: String(issuer?.cf || ""),
      piva: String(issuer?.piva || ""),
      iban: String(issuer?.iban || ""),
      indirizzo: String(issuer?.indirizzo || ""),
    },
    totale: 0,
    cestinato: false,
    eliminatoIl: null,
    modificato: new Date().toISOString(),
  });
}

/**
 * Sanifica e idrata un preventivo da qualsiasi sorgente (Firestore, JSON import, stato locale).
 */
export function sanificaPreventivo(raw = {}) {
  const d = raw && typeof raw === "object" ? raw : {};
  const idClean =
    String(d.id || generaId("p"))
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 64) || generaId("p");

  const oggi = aIsoLocale(new Date());
  const dataStr = String(d.data || "").trim();
  const safeData = dataStr.length >= 8 && dataStr.length <= 32 ? dataStr : oggi;

  const rawCliente = d.cliente && typeof d.cliente === "object" ? d.cliente : {};
  const rawProgetto = d.progetto && typeof d.progetto === "object" ? d.progetto : {};
  const rawIo = d.io && typeof d.io === "object" ? d.io : {};

  const scontoTipo =
    d.scontoTipo === "perc" || rawProgetto.scontoTipo === "perc" ? "perc" : "euro";
  const rawScontoVal =
    d.scontoValore !== undefined && d.scontoValore !== null
      ? Number(d.scontoValore)
      : rawProgetto.scontoValore !== undefined && rawProgetto.scontoValore !== null
        ? Number(rawProgetto.scontoValore)
        : Number(d.sconto);
  const scontoValore = Number.isFinite(rawScontoVal) ? Math.max(0, rawScontoVal) : 0;

  const voci = (Array.isArray(d.voci) ? d.voci : [])
    .slice(0, 200)
    .map((v) => ({
      nome: String(v?.nome ?? ""),
      desc: String(v?.desc ?? ""),
      q: Number.isFinite(Number(v?.q)) ? Math.max(0, Number(v.q)) : 1,
      p: Number.isFinite(Number(v?.p)) ? Math.max(0, Number(v.p)) : 0,
    }));
  if (voci.length === 0) {
    voci.push({ nome: "", desc: "", q: 1, p: 0 });
  }

  const normalized = {
    id: idClean,
    numero: String(d.numero || "").trim().slice(0, 64) || `BOZZA_${idClean.slice(-4)}`,
    data: safeData,
    validita: String(d.validita || "").slice(0, 32),
    stato: VALID_STATUSES.has(d.stato) ? d.stato : "bozza",
    cliente: {
      clienteId: String(rawCliente.clienteId || d.clienteId || "").slice(0, 64),
      nome: String(rawCliente.nome || ""),
      ref: String(rawCliente.ref || ""),
      indirizzo: String(rawCliente.indirizzo || ""),
      piva: String(rawCliente.piva || ""),
      cf: String(rawCliente.cf || ""),
      sdi: String(rawCliente.sdi || ""),
      pec: String(rawCliente.pec || ""),
      email: String(rawCliente.email || ""),
      tel: String(rawCliente.tel || ""),
    },
    progetto: {
      titolo: String(rawProgetto.titolo || ""),
      tipo: String(rawProgetto.tipo || ""),
      luogo: String(rawProgetto.luogo || ""),
      giornate: String(rawProgetto.giornate || ""),
      consegna: String(rawProgetto.consegna || ""),
      saluto: String(rawProgetto.saluto || ""),
      intro: String(rawProgetto.intro || ""),
      scontoTipo,
      scontoValore,
    },
    voci,
    scontoTipo,
    scontoValore,
    sconto: 0,
    sconto_txt: String(d.sconto_txt || "").slice(0, 300),
    regime: String(d.regime || "occasionale").slice(0, 100),
    ritenuta: Number.isFinite(Number(d.ritenuta))
      ? Math.min(100, Math.max(0, Number(d.ritenuta)))
      : 20,
    rivalsa: Number.isFinite(Number(d.rivalsa))
      ? Math.min(100, Math.max(0, Number(d.rivalsa)))
      : 0,
    iva: Number.isFinite(Number(d.iva)) ? Math.min(100, Math.max(0, Number(d.iva))) : 22,
    bollo: String(d.bollo || "auto").slice(0, 50),
    incluso: (Array.isArray(d.incluso) ? d.incluso : []).slice(0, 100).map((x) => String(x || "")),
    escluso: (Array.isArray(d.escluso) ? d.escluso : []).slice(0, 100).map((x) => String(x || "")),
    opzioni: (Array.isArray(d.opzioni) ? d.opzioni : []).slice(0, 100).map((o) => ({
      nome: String(o?.nome || ""),
      desc: String(o?.desc || ""),
      p: Number.isFinite(Number(o?.p)) ? Math.max(0, Number(o.p)) : 0,
    })),
    condizioni: (Array.isArray(d.condizioni) ? d.condizioni : [])
      .slice(0, 100)
      .map(normalizeConditionItem),
    io: {
      cf: String(rawIo.cf || ""),
      piva: String(rawIo.piva || ""),
      iban: String(rawIo.iban || ""),
      indirizzo: String(rawIo.indirizzo || ""),
    },
    totale: 0,
    modificato: String(d.modificato || new Date().toISOString()).slice(0, 64),
    cestinato: Boolean(d.cestinato),
    eliminatoIl: d.eliminatoIl ? String(d.eliminatoIl).slice(0, 64) : null,
  };

  if (d.driveFileId) normalized.driveFileId = String(d.driveFileId).slice(0, 128);
  if (d.driveUrl) normalized.driveUrl = String(d.driveUrl).slice(0, 500);
  if (d.driveSavedAt) normalized.driveSavedAt = String(d.driveSavedAt).slice(0, 64);
  if (d.annullamento && typeof d.annullamento === "object" && !Array.isArray(d.annullamento)) {
    normalized.annullamento = {
      data: String(d.annullamento.data || ""),
      nota: String(d.annullamento.nota || ""),
    };
  }

  const calc = calcolaTotali(normalized);
  normalized.sconto = calc.sconto;
  normalized.totale = calc.netto;
  return normalized;
}

/**
 * Serializza un preventivo garantendo conformità 100% con /firestore.rules:
 * - Solo le 28 chiavi nella whitelist (zero chiavi top-level sconosciute)
 * - cliente map ≤ 15 chiavi (10 chiavi)
 * - progetto map ≤ 15 chiavi (9 chiavi, include scontoTipo e scontoValore)
 * - sconto top-level sempre numerico >= 0 (importo in Euro)
 * - condizioni sempre list di mappe { titolo, testo } (mai nested array)
 * - annullamento omesso se non è una mappa valida (mai null!)
 */
export function serializeQuoteForFirestore(raw) {
  const q = sanificaPreventivo(raw);
  const calc = calcolaTotali(q);

  const candidate = {
    id: q.id,
    numero: q.numero,
    data: q.data,
    validita: q.validita,
    stato: q.stato,
    cliente: {
      clienteId: q.cliente.clienteId,
      nome: q.cliente.nome,
      ref: q.cliente.ref,
      indirizzo: q.cliente.indirizzo,
      piva: q.cliente.piva,
      cf: q.cliente.cf,
      sdi: q.cliente.sdi,
      pec: q.cliente.pec,
      email: q.cliente.email,
      tel: q.cliente.tel,
    },
    progetto: {
      titolo: q.progetto.titolo,
      tipo: q.progetto.tipo,
      luogo: q.progetto.luogo,
      giornate: q.progetto.giornate,
      consegna: q.progetto.consegna,
      saluto: q.progetto.saluto,
      intro: q.progetto.intro,
      scontoTipo: q.scontoTipo,
      scontoValore: q.scontoValore,
    },
    voci: q.voci.slice(0, 200).map((v) => ({
      nome: String(v.nome || ""),
      desc: String(v.desc || ""),
      q: Math.max(0, Number(v.q) || 0),
      p: Math.max(0, Number(v.p) || 0),
    })),
    sconto: Math.max(0, calc.sconto),
    sconto_txt: q.sconto_txt.slice(0, 300),
    regime: q.regime.slice(0, 100),
    ritenuta: Math.min(100, Math.max(0, Number(q.ritenuta) || 0)),
    rivalsa: Math.min(100, Math.max(0, Number(q.rivalsa) || 0)),
    iva: Math.min(100, Math.max(0, Number(q.iva) || 0)),
    bollo: q.bollo.slice(0, 50),
    incluso: q.incluso.slice(0, 100).map((x) => String(x || "")),
    escluso: q.escluso.slice(0, 100).map((x) => String(x || "")),
    opzioni: q.opzioni.slice(0, 100).map((o) => ({
      nome: String(o.nome || ""),
      desc: String(o.desc || ""),
      p: Math.max(0, Number(o.p) || 0),
    })),
    condizioni: q.condizioni.slice(0, 100).map((c) => ({
      titolo: String(c.titolo || ""),
      testo: String(c.testo || ""),
    })),
    io: {
      cf: q.io.cf,
      piva: q.io.piva,
      iban: q.io.iban,
      indirizzo: q.io.indirizzo,
    },
    totale: calc.netto,
    modificato: String(q.modificato || new Date().toISOString()).slice(0, 64),
    cestinato: Boolean(q.cestinato),
    eliminatoIl: q.cestinato ? String(q.eliminatoIl || new Date().toISOString()).slice(0, 64) : null,
  };

  if (q.driveFileId) candidate.driveFileId = q.driveFileId.slice(0, 128);
  if (q.driveUrl) candidate.driveUrl = q.driveUrl.slice(0, 500);
  if (q.driveSavedAt) candidate.driveSavedAt = q.driveSavedAt.slice(0, 64);
  if (q.annullamento && typeof q.annullamento === "object" && !Array.isArray(q.annullamento)) {
    candidate.annullamento = {
      data: String(q.annullamento.data || ""),
      nota: String(q.annullamento.nota || ""),
    };
  }

  const safe = {};
  for (const key of ALLOWED_QUOTE_FIELDS) {
    if (candidate[key] !== undefined) {
      safe[key] = candidate[key];
    }
  }
  return safe;
}

export function deserializeQuoteFromFirestore(docData) {
  return sanificaPreventivo(docData);
}

/**
 * Serializza un cliente rispettando al 100% /firestore.rules (/clienti/{id}).
 */
export function serializeClientForFirestore(raw) {
  if (!raw || typeof raw !== "object") return null;
  const nome = String(raw.nome || "").trim().slice(0, 200);
  if (!nome) return null;
  const id =
    String(raw.id || generaId("cli"))
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 64) || generaId("cli");
  const now = new Date().toISOString();

  const candidate = {
    id,
    nome,
    ref: String(raw.ref || "").trim().slice(0, 200),
    indirizzo: String(raw.indirizzo || "").trim().slice(0, 300),
    piva: String(raw.piva || "").trim().slice(0, 50),
    cf: String(raw.cf || "").trim().slice(0, 50),
    sdi: String(raw.sdi || "").trim().slice(0, 20),
    pec: String(raw.pec || "").trim().slice(0, 150),
    email: String(raw.email || "").trim().slice(0, 150),
    tel: String(raw.tel || "").trim().slice(0, 50),
    note: String(raw.note || "").trim().slice(0, 2000),
    creato: String(raw.creato || now).slice(0, 64),
    modificato: String(raw.modificato || now).slice(0, 64),
  };

  const safe = {};
  for (const key of ALLOWED_CLIENT_FIELDS) {
    safe[key] = candidate[key];
  }
  return safe;
}

/**
 * Serializza una voce di listino rispettando al 100% /firestore.rules (/listino/{id}).
 */
export function serializePriceItemForFirestore(raw, fallbackOrder = 999) {
  if (!raw || typeof raw !== "object") return null;
  const nome = String(raw.nome || "").trim().slice(0, 200);
  if (!nome) return null;
  const id =
    String(raw.id || generaId("voc"))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 64) || generaId("voc");
  const now = new Date().toISOString();

  const candidate = {
    id,
    cat: String(raw.cat || "").trim().slice(0, 100),
    nome,
    desc: String(raw.desc || "").trim().slice(0, 1000),
    unita: String(raw.unita || "forfait").trim().slice(0, 50),
    prezzo: Number.isFinite(Number(raw.prezzo)) ? Math.max(0, Number(raw.prezzo)) : 0,
    ordine: Number.isFinite(Number(raw.ordine)) ? Number(raw.ordine) : fallbackOrder,
    attivo: raw.attivo !== false,
    creato: String(raw.creato || now).slice(0, 64),
    modificato: String(raw.modificato || now).slice(0, 64),
  };

  const safe = {};
  for (const key of ALLOWED_PRICE_ITEM_FIELDS) {
    safe[key] = candidate[key];
  }
  return safe;
}

/**
 * Verifica qualità del preventivo su 3 livelli (errori bloccanti, avvisi, suggerimenti).
 */
export function verificaPreventivo(quote, allQuotes = []) {
  const q = sanificaPreventivo(quote);
  const t = calcolaTotali(q);
  const errori = [];
  const avvisi = [];
  const suggerimenti = [];

  if (!q.numero.trim()) {
    errori.push("Manca il numero del preventivo.");
  } else {
    const dup = (Array.isArray(allQuotes) ? allQuotes : []).find(
      (x) => !x.cestinato && x.id !== q.id && String(x.numero || "").trim() === q.numero.trim()
    );
    if (dup) {
      errori.push(`Il numero preventivo «${q.numero}» è già utilizzato in archivio.`);
    }
  }

  if (!q.data) errori.push("Manca la data di emissione.");
  if (!q.cliente.nome.trim()) errori.push("Inserisci il nome o ragione sociale del cliente.");
  if (!q.progetto.titolo.trim()) errori.push("Inserisci il titolo del progetto.");

  const vociValide = q.voci.filter((v) => v.nome.trim() || v.p > 0);
  if (vociValide.length === 0) {
    errori.push("Aggiungi almeno una voce di preventivo.");
  }
  if (t.imponibile <= 0) {
    errori.push("L'imponibile totale è € 0,00.");
  }
  if (t.scontoLordo > t.imponibile && t.imponibile > 0) {
    errori.push("Lo sconto supera l'imponibile totale.");
  }

  if (q.data && q.validita && q.validita < q.data) {
    avvisi.push("La data di validità è anteriore alla data di emissione.");
  }
  if (q.regime === "occasionale" && t.netto > 5000) {
    avvisi.push(
      "Importo superiore a € 5.000 in prestazione occasionale: verificare l'obbligo di iscrizione Gestione Separata INPS."
    );
  }
  if (t.haPartitaIva && !q.io.piva.trim()) {
    avvisi.push("Regime con Partita IVA selezionato, ma manca la tua P. IVA nei dati emittente.");
  }
  if (!q.io.cf.trim()) {
    avvisi.push("Manca il tuo Codice Fiscale nei dati emittente (necessario per la Proforma/Nota).");
  }
  if (!q.io.iban.trim()) {
    suggerimenti.push("Inserisci l'IBAN nei dati emittente per completare la Proforma/Nota.");
  }
  if (!q.cliente.email.trim()) {
    suggerimenti.push("Aggiungi l'email del cliente per facilitare l'invio e il CRM.");
  }
  if (!q.cliente.piva.trim() && !q.cliente.cf.trim()) {
    suggerimenti.push("Aggiungi P. IVA o C.F. del cliente per la successiva fatturazione.");
  }
  if (q.voci.some((v) => v.nome.trim() && v.p === 0)) {
    avvisi.push("Una o più voci hanno importo unitario pari a € 0,00.");
  }

  return { errori, avvisi, suggerimenti, valido: errori.length === 0 };
}

/**
 * Valida un payload JSON importato (singolo preventivo oppure backup completo).
 */
export function validaImportJSON(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "Il file JSON non contiene un oggetto valido." };
  }

  // Backup completo v1/v2
  if (Array.isArray(parsed.preventivi)) {
    return {
      ok: true,
      type: "backup",
      preventivi: parsed.preventivi.map((p) => sanificaPreventivo(p)),
      clienti: Array.isArray(parsed.clienti)
        ? parsed.clienti.map((c) => serializeClientForFirestore(c)).filter(Boolean)
        : [],
      listino: Array.isArray(parsed.listino)
        ? parsed.listino.map((v, i) => serializePriceItemForFirestore(v, i + 1)).filter(Boolean)
        : [],
      io: parsed.io && typeof parsed.io === "object" ? parsed.io : null,
    };
  }

  // Singolo preventivo
  const hasQuoteShape =
    Array.isArray(parsed.voci) ||
    (parsed.cliente && typeof parsed.cliente === "object") ||
    (parsed.progetto && typeof parsed.progetto === "object");

  if (hasQuoteShape) {
    const quote = sanificaPreventivo(parsed);
    return { ok: true, type: "single", quote };
  }

  return {
    ok: false,
    error: "Formato JSON non riconosciuto: deve contenere un preventivo valido o un backup completo.",
  };
}
