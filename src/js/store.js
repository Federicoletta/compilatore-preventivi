/**
 * Store reattivo centrale (Single Source of Truth) — addio DOM-as-Source-of-Truth.
 * Gestisce stato preventivo corrente, archivio, clienti, listino, impostazioni,
 * viste UI e stack Undo/Redo esclusivamente strutturale (non interferisce con Ctrl+Z nei campi testo).
 */

import { PREF_KEYS } from "./config.js";
import { calcolaTotali } from "./calculations.js";
import { creaPreventivoVuoto, sanificaPreventivo } from "./validator.js";

function deepClone(obj) {
  if (typeof structuredClone === "function") return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

function readLocalJson(key, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in restricted contexts
  }
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(PREF_KEYS.theme);
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  } catch {
    // ignore
  }
  return "light";
}

function getInitialSignature() {
  try {
    return localStorage.getItem(PREF_KEYS.signature) !== "false";
  } catch {
    return true;
  }
}

const initialIssuer = readLocalJson(PREF_KEYS.localCacheIssuer, {
  cf: "",
  piva: "",
  iban: "",
  indirizzo: "",
});

const initialQuotes = (readLocalJson(PREF_KEYS.localCacheQuotes, []) || [])
  .filter((x) => x && typeof x === "object")
  .map((x) => sanificaPreventivo(x));

const initialClients = (readLocalJson(PREF_KEYS.localCacheClients, []) || []).filter(
  (x) => x && typeof x === "object" && x.id
);

const initialPriceList = (readLocalJson(PREF_KEYS.localCachePriceList, []) || []).filter(
  (x) => x && typeof x === "object" && x.nome
);

const MAX_STRUCTURAL_HISTORY = 30;

const state = {
  user: null,
  activeView: "editor", // 'editor' | 'archivio' | 'clienti' | 'listino'
  splitPreviewOpen: false, // Desktop default: Editor + sidebar compatta con toggle Split-Screen
  syncStatus: "saved", // 'saved' | 'saving' | 'offline' | 'error'
  syncMessage: "",
  theme: getInitialTheme(),
  signatureEnabled: getInitialSignature(),

  issuer: {
    cf: String(initialIssuer.cf || ""),
    piva: String(initialIssuer.piva || ""),
    iban: String(initialIssuer.iban || ""),
    indirizzo: String(initialIssuer.indirizzo || ""),
  },

  quotes: initialQuotes,
  clients: initialClients,
  priceList: initialPriceList,

  currentQuote: creaPreventivoVuoto({ allQuotes: initialQuotes, issuer: initialIssuer }),
  isDraftPersisted: false,

  // Undo / Redo strutturale (aggiunta/rimozione/riordino voci, opzioni, condizioni, pacchetti)
  structuralPast: [],
  structuralFuture: [],

  // Filtri e stato UI Archivio
  archiveViewMode: "cronologico", // 'cronologico' | 'clienti'
  archiveStatusFilter: "tutti", // 'tutti' | 'bozza' | 'inviato' | 'accettato' | 'rifiutato' | 'annullato' | 'cestino'
  archiveSort: "modificato_desc", // 'modificato_desc' | 'data_desc' | 'data_asc' | 'numero_desc' | 'totale_desc' | 'cliente_asc'
  archiveSearch: "",
  selectedArchiveIds: new Set(),
  openClientGroups: new Set(),

  // Filtri Clienti e Listino
  clientSearch: "",
  priceListSearch: "",
};

const listeners = new Set();

function emit(scope = "all", meta = {}) {
  for (const fn of listeners) {
    try {
      fn(state, scope, meta);
    } catch (err) {
      console.error("[Store] Errore listener:", err);
    }
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function getActiveQuotes() {
  return state.quotes.filter((q) => !q.cestinato);
}

export function getTrashedQuotes() {
  return state.quotes.filter((q) => Boolean(q.cestinato));
}

export function hasQuoteMeaningfulContent(q) {
  if (!q) return false;
  if (String(q.cliente?.nome || "").trim()) return true;
  if (String(q.progetto?.titolo || "").trim()) return true;
  return (Array.isArray(q.voci) ? q.voci : []).some(
    (v) => String(v?.nome || "").trim().length > 0 || Number(v?.p) > 0
  );
}

function captureStructuralSnapshot(quote) {
  return {
    voci: deepClone(quote.voci),
    opzioni: deepClone(quote.opzioni),
    incluso: deepClone(quote.incluso),
    escluso: deepClone(quote.escluso),
    condizioni: deepClone(quote.condizioni),
  };
}

function recomputeCurrentTotals() {
  const t = calcolaTotali(state.currentQuote);
  state.currentQuote.sconto = t.sconto;
  state.currentQuote.totale = t.netto;
  state.currentQuote.progetto.scontoTipo = state.currentQuote.scontoTipo;
  state.currentQuote.progetto.scontoValore = state.currentQuote.scontoValore;
  return t;
}

export const actions = {
  setUser(user) {
    state.user = user;
    emit("auth");
  },

  setActiveView(view) {
    if (!["editor", "archivio", "clienti", "listino"].includes(view)) return;
    state.activeView = view;
    emit("view");
  },

  setSplitPreviewOpen(open) {
    state.splitPreviewOpen = Boolean(open);
    try {
      localStorage.setItem(PREF_KEYS.splitPreview, state.splitPreviewOpen ? "1" : "0");
    } catch {
      // ignore
    }
    emit("splitPreview");
  },

  toggleSplitPreview() {
    actions.setSplitPreviewOpen(!state.splitPreviewOpen);
  },

  setSyncStatus(status, message = "") {
    state.syncStatus = status;
    state.syncMessage = message;
    emit("sync");
  },

  setTheme(theme) {
    state.theme = theme === "dark" ? "dark" : "light";
    try {
      localStorage.setItem(PREF_KEYS.theme, state.theme);
    } catch {
      // ignore
    }
    emit("theme");
  },

  toggleTheme() {
    actions.setTheme(state.theme === "dark" ? "light" : "dark");
  },

  setSignatureEnabled(enabled) {
    state.signatureEnabled = Boolean(enabled);
    try {
      localStorage.setItem(PREF_KEYS.signature, state.signatureEnabled ? "true" : "false");
    } catch {
      // ignore
    }
    emit("signature");
  },

  setIssuer(issuer, { persistCache = true } = {}) {
    state.issuer = {
      cf: String(issuer?.cf || ""),
      piva: String(issuer?.piva || ""),
      iban: String(issuer?.iban || ""),
      indirizzo: String(issuer?.indirizzo || ""),
    };
    state.currentQuote.io = { ...state.issuer };
    if (persistCache) writeLocalJson(PREF_KEYS.localCacheIssuer, state.issuer);
    emit("issuer");
  },

  setQuotes(quotes, { persistCache = true } = {}) {
    const clean = (Array.isArray(quotes) ? quotes : []).map((q) => sanificaPreventivo(q));
    state.quotes = clean;
    if (persistCache) writeLocalJson(PREF_KEYS.localCacheQuotes, clean);

    // Se il preventivo aperto in editor è appena stato confermato in archivio, segna isDraftPersisted
    if (state.currentQuote?.id && clean.some((q) => q.id === state.currentQuote.id)) {
      state.isDraftPersisted = true;
    }

    // Pulisci selezioni non più esistenti
    const existingIds = new Set(clean.map((q) => q.id));
    for (const id of [...state.selectedArchiveIds]) {
      if (!existingIds.has(id)) state.selectedArchiveIds.delete(id);
    }

    emit("quotes");
  },

  upsertQuoteInList(quote) {
    const clean = sanificaPreventivo(quote);
    const idx = state.quotes.findIndex((q) => q.id === clean.id);
    if (idx >= 0) {
      state.quotes[idx] = clean;
    } else {
      state.quotes.unshift(clean);
    }
    if (state.currentQuote?.id === clean.id) {
      state.isDraftPersisted = true;
    }
    writeLocalJson(PREF_KEYS.localCacheQuotes, state.quotes);
    emit("quotes");
  },

  removeQuotesFromList(ids) {
    const idSet = new Set(ids);
    state.quotes = state.quotes.filter((q) => !idSet.has(q.id));
    for (const id of idSet) state.selectedArchiveIds.delete(id);
    writeLocalJson(PREF_KEYS.localCacheQuotes, state.quotes);
    emit("quotes");
  },

  setClients(clients, { persistCache = true } = {}) {
    state.clients = Array.isArray(clients) ? clients : [];
    if (persistCache) writeLocalJson(PREF_KEYS.localCacheClients, state.clients);
    emit("clients");
  },

  setPriceList(items, { persistCache = true } = {}) {
    const sorted = (Array.isArray(items) ? items : [])
      .slice()
      .sort(
        (a, b) =>
          (Number(a.ordine) || 999) - (Number(b.ordine) || 999) ||
          String(a.nome || "").localeCompare(String(b.nome || ""), "it")
      );
    state.priceList = sorted;
    if (persistCache) writeLocalJson(PREF_KEYS.localCachePriceList, sorted);
    emit("priceList");
  },

  /**
   * Carica un preventivo nell'editor (nuovo o esistente), azzerando lo stack strutturale.
   */
  loadQuoteIntoEditor(quote, { persisted = true } = {}) {
    const clean = sanificaPreventivo(quote);
    // Allinea dati emittente se mancanti nel documento
    if (!clean.io.cf && state.issuer.cf) clean.io.cf = state.issuer.cf;
    if (!clean.io.piva && state.issuer.piva) clean.io.piva = state.issuer.piva;
    if (!clean.io.iban && state.issuer.iban) clean.io.iban = state.issuer.iban;
    if (!clean.io.indirizzo && state.issuer.indirizzo) clean.io.indirizzo = state.issuer.indirizzo;

    state.currentQuote = clean;
    state.isDraftPersisted = persisted;
    state.structuralPast = [];
    state.structuralFuture = [];
    recomputeCurrentTotals();
    emit("quoteLoaded");
  },

  newQuote(prefillCliente = null) {
    const fresh = creaPreventivoVuoto({ allQuotes: state.quotes, issuer: state.issuer });
    if (prefillCliente && typeof prefillCliente === "object") {
      fresh.cliente = {
        clienteId: String(prefillCliente.id || prefillCliente.clienteId || ""),
        nome: String(prefillCliente.nome || ""),
        ref: String(prefillCliente.ref || ""),
        indirizzo: String(prefillCliente.indirizzo || ""),
        piva: String(prefillCliente.piva || ""),
        cf: String(prefillCliente.cf || ""),
        sdi: String(prefillCliente.sdi || ""),
        pec: String(prefillCliente.pec || ""),
        email: String(prefillCliente.email || ""),
        tel: String(prefillCliente.tel || ""),
      };
      if (prefillCliente.ref) {
        fresh.progetto.saluto = `Gentile ${prefillCliente.ref},`;
      }
    }
    actions.loadQuoteIntoEditor(fresh, { persisted: false });
  },

  /**
   * Mutazione su campi scalari del preventivo corrente (typing in input/select).
   * NON tocca lo stack Undo/Redo strutturale così Ctrl+Z nativo del browser resta intatto!
   */
  updateCurrentQuote(mutatorFn, { triggerAutosave = true, structural = false } = {}) {
    if (structural) {
      state.structuralPast.push(captureStructuralSnapshot(state.currentQuote));
      if (state.structuralPast.length > MAX_STRUCTURAL_HISTORY) {
        state.structuralPast.shift();
      }
      state.structuralFuture = [];
    }

    mutatorFn(state.currentQuote);
    state.currentQuote.modificato = new Date().toISOString();
    recomputeCurrentTotals();

    emit(structural ? "quoteStructural" : "quoteField", { triggerAutosave });
  },

  undoStructural() {
    if (state.structuralPast.length === 0) return false;
    state.structuralFuture.push(captureStructuralSnapshot(state.currentQuote));
    const prev = state.structuralPast.pop();
    state.currentQuote.voci = prev.voci;
    state.currentQuote.opzioni = prev.opzioni;
    state.currentQuote.incluso = prev.incluso;
    state.currentQuote.escluso = prev.escluso;
    state.currentQuote.condizioni = prev.condizioni;
    state.currentQuote.modificato = new Date().toISOString();
    recomputeCurrentTotals();
    emit("quoteStructural", { triggerAutosave: true });
    return true;
  },

  redoStructural() {
    if (state.structuralFuture.length === 0) return false;
    state.structuralPast.push(captureStructuralSnapshot(state.currentQuote));
    const next = state.structuralFuture.pop();
    state.currentQuote.voci = next.voci;
    state.currentQuote.opzioni = next.opzioni;
    state.currentQuote.incluso = next.incluso;
    state.currentQuote.escluso = next.escluso;
    state.currentQuote.condizioni = next.condizioni;
    state.currentQuote.modificato = new Date().toISOString();
    recomputeCurrentTotals();
    emit("quoteStructural", { triggerAutosave: true });
    return true;
  },

  // Filtri Archivio / Clienti / Listino
  setArchiveFilter(patch) {
    Object.assign(state, patch);
    if (patch.archiveStatusFilter !== undefined) {
      state.selectedArchiveIds.clear();
    }
    emit("archiveFilter");
  },

  toggleSelectArchiveId(id) {
    if (state.selectedArchiveIds.has(id)) state.selectedArchiveIds.delete(id);
    else state.selectedArchiveIds.add(id);
    emit("archiveSelection");
  },

  setSelectedArchiveIds(ids) {
    state.selectedArchiveIds = new Set(ids);
    emit("archiveSelection");
  },

  clearSelectedArchiveIds() {
    state.selectedArchiveIds.clear();
    emit("archiveSelection");
  },

  toggleClientGroup(key) {
    if (state.openClientGroups.has(key)) state.openClientGroups.delete(key);
    else state.openClientGroups.add(key);
    emit("archiveFilter");
  },

  setClientSearch(q) {
    state.clientSearch = String(q || "");
    emit("clientFilter");
  },

  setPriceListSearch(q) {
    state.priceListSearch = String(q || "");
    emit("priceListFilter");
  },
};
