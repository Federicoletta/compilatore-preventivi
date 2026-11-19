/**
 * Vista Editor Preventivo (v2.0 Cloud-First).
 * - Collegata allo Store centrale (zero DOM-as-Source-of-Truth)
 * - Autocomplete clienti diretto dalla collezione /clienti (con clienteId, cf, sdi, pec)
 * - Toggle sconto € / %
 * - Riordino touch ↑ / ↓ su voci, opzioni e condizioni
 * - Undo/Redo solo strutturale (pulsanti dedicati; Ctrl+Z nativo intatto nei campi testo)
 * - Default Desktop: Editor + Sidebar compatta + toggle Split-Screen Anteprima A4 Live
 * - Menu ⋯ Azioni secondarie (zero pulsante manuale "Salva nell'archivio", zero email generator)
 */

import {
  CONDIZIONI_STD,
  ESCLUSO_STD,
  INCLUSO_STD,
  PACCHETTI,
  REGIMI_FISCALI,
  STATI_PREVENTIVO,
} from "../config.js";
import { calcolaTotali } from "../calculations.js";
import { aggiungiGiorni, esc, euro, generaId } from "../formatters.js";
import { actions, getState } from "../store.js";
import {
  moveQuotesToTrash,
  saveClientToCloud,
  saveIssuerToCloud,
  saveQuoteToCloud,
  scheduleQuoteAutosave,
} from "../firebase-sync.js";
import { printQuoteDocument, printSecondDocument, renderQuoteDocumentHtml } from "../print-engine.js";
import { exportSingleQuoteJson } from "../import-export.js";
import { confirmModal, openModal, showToast } from "./modal.js";
import { prossimoNumero, sanificaPreventivo, verificaPreventivo } from "../validator.js";

let _previewDebounce = null;
let _acOpen = false;

function swapItems(arr, i, j) {
  if (i < 0 || j < 0 || i >= arr.length || j >= arr.length) return;
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const next = String(value ?? "");
  if (el.value !== next) el.value = next;
}

/**
 * Sincronizza tutti i campi scalari dell'editor dallo Store (su loadQuote / reset).
 */
export function syncEditorScalarsFromStore() {
  const st = getState();
  const q = st.currentQuote;

  setFieldValue("f-numero", q.numero);
  setFieldValue("f-data", q.data);
  setFieldValue("f-validita", q.validita);
  setFieldValue("f-stato", q.stato);

  setFieldValue("f-cl-nome", q.cliente.nome);
  setFieldValue("f-cl-ref", q.cliente.ref);
  setFieldValue("f-cl-email", q.cliente.email);
  setFieldValue("f-cl-tel", q.cliente.tel);
  setFieldValue("f-cl-piva", q.cliente.piva);
  setFieldValue("f-cl-cf", q.cliente.cf);
  setFieldValue("f-cl-sdi", q.cliente.sdi);
  setFieldValue("f-cl-pec", q.cliente.pec);
  setFieldValue("f-cl-indirizzo", q.cliente.indirizzo);

  setFieldValue("f-pr-titolo", q.progetto.titolo);
  setFieldValue("f-pr-tipo", q.progetto.tipo);
  setFieldValue("f-pr-luogo", q.progetto.luogo);
  setFieldValue("f-pr-giornate", q.progetto.giornate);
  setFieldValue("f-pr-consegna", q.progetto.consegna);
  setFieldValue("f-pr-saluto", q.progetto.saluto);
  setFieldValue("f-pr-intro", q.progetto.intro);

  setFieldValue("f-sconto-val", q.scontoValore || "");
  setFieldValue("f-sconto-txt", q.sconto_txt);
  setFieldValue("f-regime", q.regime);
  setFieldValue("f-ritenuta", q.ritenuta);
  setFieldValue("f-rivalsa", q.rivalsa);
  setFieldValue("f-iva", q.iva);
  setFieldValue("f-bollo", q.bollo);

  setFieldValue("f-io-cf", q.io.cf);
  setFieldValue("f-io-piva", q.io.piva);
  setFieldValue("f-io-iban", q.io.iban);
  setFieldValue("f-io-indirizzo", q.io.indirizzo);

  // Stato pulsanti toggle sconto € / %
  document.querySelectorAll("[data-sconto-tipo]").forEach((btn) => {
    const active = btn.dataset.scontoTipo === q.scontoTipo;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  // Checkbox firma autografa
  const chkFirma = document.getElementById("f-firma-autografa");
  if (chkFirma) chkFirma.checked = st.signatureEnabled;

  // Badge collegamento CRM
  const crmBadge = document.getElementById("editor-client-linked-badge");
  if (crmBadge) {
    crmBadge.hidden = !q.cliente.clienteId;
  }

  // Pulsante cestino nel menu Azioni
  const trashBtn = document.querySelector("[data-editor-action='trash-current']");
  if (trashBtn) trashBtn.hidden = !st.isDraftPersisted;

  updateFiscalVisibility(q.regime);
  updateStructuralUndoButtons();
}

function updateFiscalVisibility(regime) {
  const haPiva = ["forf5", "forf15", "ordinario"].includes(regime);
  const haRit = regime === "occasionale" || regime === "ordinario";
  const haIva = regime === "ordinario";
  const haBollo = ["forf5", "forf15", "occasionale"].includes(regime);

  const toggle = (id, show) => {
    const el = document.getElementById(id);
    if (el) el.hidden = !show;
  };

  toggle("wrap-rivalsa", haPiva);
  toggle("wrap-ritenuta", haRit);
  toggle("wrap-iva", haIva);
  toggle("wrap-bollo", haBollo);

  const info = REGIMI_FISCALI.find((r) => r.id === regime);
  const hint = document.getElementById("fiscal-regime-hint");
  if (hint && info) hint.textContent = info.descrizione;
}

export function updateStructuralUndoButtons() {
  const st = getState();
  const btnUndo = document.getElementById("btn-undo-struct");
  const btnRedo = document.getElementById("btn-redo-struct");
  if (btnUndo) btnUndo.disabled = st.structuralPast.length === 0;
  if (btnRedo) btnRedo.disabled = st.structuralFuture.length === 0;
}

export function renderPriceListSelect() {
  const sel = document.getElementById("sel-listino");
  if (!sel) return;
  const items = getState().priceList;
  const cats = [...new Set(items.map((v) => v.cat || "Altro"))];
  sel.innerHTML =
    `<option value="">+ Aggiungi dal listino…</option>` +
    cats
      .map(
        (cat) =>
          `<optgroup label="${esc(cat)}">` +
          items
            .filter((v) => (v.cat || "Altro") === cat)
            .map(
              (v) =>
                `<option value="${esc(v.id)}">${esc(v.nome)} — ${euro(v.prezzo)}${v.unita ? ` / ${esc(v.unita)}` : ""}</option>`
            )
            .join("") +
          `</optgroup>`
      )
      .join("");
}

/**
 * Renderizza le liste strutturali (Voci, Opzioni, Incluso/Escluso, Condizioni).
 */
export function renderEditorLists() {
  const q = getState().currentQuote;

  // 1. Voci di preventivo
  const vociWrap = document.getElementById("editor-voci-list");
  if (vociWrap) {
    vociWrap.innerHTML = q.voci
      .map((v, i) => {
        const sub = (Number(v.q) || 0) * (Number(v.p) || 0);
        return `<div class="line-item-card" data-voce-idx="${i}">
          <div class="line-item-top">
            <span class="line-idx">${String(i + 1).padStart(2, "0")}</span>
            <input type="text" class="field-input li-nome" data-li-field="nome" placeholder="Titolo prestazione (es. Giornata di ripresa)" value="${esc(v.nome)}">
            <div class="li-controls">
              <button type="button" class="icon-btn icon-sm" data-li-move="up" title="Sposta su" aria-label="Sposta voce su"${i === 0 ? " disabled" : ""}>↑</button>
              <button type="button" class="icon-btn icon-sm" data-li-move="down" title="Sposta giù" aria-label="Sposta voce giù"${i === q.voci.length - 1 ? " disabled" : ""}>↓</button>
              <button type="button" class="icon-btn icon-sm icon-danger" data-li-remove title="Rimuovi voce" aria-label="Rimuovi voce">✕</button>
            </div>
          </div>
          <div class="line-item-body">
            <textarea class="field-input li-desc" data-li-field="desc" rows="2" placeholder="Descrizione tecnica, attrezzatura, ore, deliverable…">${esc(v.desc)}</textarea>
            <div class="line-item-nums">
              <div class="mini-field">
                <label>Q.tà</label>
                <input type="number" step="0.5" min="0" class="field-input num-input" data-li-field="q" value="${v.q}">
              </div>
              <div class="mini-field">
                <label>Prezzo (€)</label>
                <input type="number" step="0.01" min="0" class="field-input num-input" data-li-field="p" value="${v.p}">
              </div>
              <div class="mini-field mini-total">
                <label>Subtotale</label>
                <span class="li-subtot">${euro(sub)}</span>
              </div>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }

  // 2. Opzioni su richiesta
  const opzWrap = document.getElementById("editor-opzioni-list");
  if (opzWrap) {
    opzWrap.innerHTML = q.opzioni.length
      ? q.opzioni
          .map(
            (o, i) => `<div class="sub-item-row" data-opz-idx="${i}">
              <div class="sub-item-fields">
                <input type="text" class="field-input field-sm" data-opz-field="nome" placeholder="Titolo opzione (es. Riprese aeree con drone)" value="${esc(o.nome)}">
                <input type="text" class="field-input field-sm" data-opz-field="desc" placeholder="Dettagli opzione" value="${esc(o.desc)}">
              </div>
              <input type="number" step="0.01" min="0" class="field-input field-sm num-input opz-price" data-opz-field="p" value="${o.p}" aria-label="Prezzo opzione">
              <div class="li-controls">
                <button type="button" class="icon-btn icon-sm" data-opz-move="up" aria-label="Sposta su"${i === 0 ? " disabled" : ""}>↑</button>
                <button type="button" class="icon-btn icon-sm" data-opz-move="down" aria-label="Sposta giù"${i === q.opzioni.length - 1 ? " disabled" : ""}>↓</button>
                <button type="button" class="icon-btn icon-sm icon-danger" data-opz-remove aria-label="Rimuovi opzione">✕</button>
              </div>
            </div>`
          )
          .join("")
      : `<p class="muted-hint">Nessuna opzione aggiuntiva inserita.</p>`;
  }

  // 3. Incluso / Escluso
  const renderBullets = (list, kind, elId) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = list
      .map(
        (txt, i) => `<div class="bullet-row" data-bullet-kind="${kind}" data-bullet-idx="${i}">
          <input type="text" class="field-input field-sm" data-bullet-input value="${esc(txt)}" placeholder="Voce…">
          <button type="button" class="icon-btn icon-sm icon-danger" data-bullet-remove aria-label="Rimuovi">✕</button>
        </div>`
      )
      .join("");
  };
  renderBullets(q.incluso, "incluso", "editor-incluso-list");
  renderBullets(q.escluso, "escluso", "editor-escluso-list");

  // 4. Condizioni contrattuali
  const condWrap = document.getElementById("editor-condizioni-list");
  if (condWrap) {
    condWrap.innerHTML = q.condizioni
      .map(
        (c, i) => `<div class="cond-item-row" data-cond-idx="${i}">
          <div class="cond-item-head">
            <input type="text" class="field-input field-sm cond-tit-input" data-cond-field="titolo" placeholder="Titolo clausola" value="${esc(c.titolo)}">
            <div class="li-controls">
              <button type="button" class="icon-btn icon-sm" data-cond-move="up" aria-label="Sposta su"${i === 0 ? " disabled" : ""}>↑</button>
              <button type="button" class="icon-btn icon-sm" data-cond-move="down" aria-label="Sposta giù"${i === q.condizioni.length - 1 ? " disabled" : ""}>↓</button>
              <button type="button" class="icon-btn icon-sm icon-danger" data-cond-remove aria-label="Rimuovi clausola">✕</button>
            </div>
          </div>
          <textarea class="field-input field-sm" data-cond-field="testo" rows="2" placeholder="Testo clausola contrattuale…">${esc(c.testo)}</textarea>
        </div>`
      )
      .join("");
  }

  updateStructuralUndoButtons();
}

/**
 * Aggiorna riepilogo numerico nella sidebar compatta + mobile bar + Anteprima A4 Live.
 */
export function renderEditorSummaryAndPreview() {
  const st = getState();
  const q = st.currentQuote;
  const t = calcolaTotali(q);

  // Aggiorna subtotale singolo di ogni voce in-place
  const rows = document.querySelectorAll("#editor-voci-list .line-item-card");
  rows.forEach((card) => {
    const idx = Number(card.dataset.voceIdx);
    const v = q.voci[idx];
    const subEl = card.querySelector(".li-subtot");
    if (v && subEl) {
      subEl.textContent = euro((Number(v.q) || 0) * (Number(v.p) || 0));
    }
  });

  // Aggiorna riepilogo compatto nella sidebar
  const sumBox = document.getElementById("sidebar-totals-box");
  if (sumBox) {
    const lines = [`<div class="sum-row"><span>Imponibile</span><strong>${euro(t.imponibile)}</strong></div>`];
    if (t.sconto > 0) {
      const label = t.scontoTipo === "perc" ? `Sconto (${t.scontoValore}%)` : "Sconto";
      lines.push(`<div class="sum-row is-muted"><span>${esc(label)}</span><span>− ${euro(t.sconto)}</span></div>`);
    }
    if (t.rivPerc > 0) {
      lines.push(
        `<div class="sum-row is-muted"><span>${t.rivPerc === 2 ? "Cassa" : "Rivalsa INPS"} ${t.rivPerc}%</span><span>${euro(t.rivalsa)}</span></div>`
      );
    }
    if (t.ivaPerc > 0) {
      lines.push(`<div class="sum-row is-muted"><span>IVA ${t.ivaPerc}%</span><span>${euro(t.iva)}</span></div>`);
    }
    if (t.bollo > 0) {
      lines.push(`<div class="sum-row is-muted"><span>Marca da bollo</span><span>${euro(t.bollo)}</span></div>`);
    }
    if (t.ritenuta > 0) {
      lines.push(`<div class="sum-row"><span>Totale documento</span><strong>${euro(t.totaleDoc)}</strong></div>`);
      lines.push(
        `<div class="sum-row is-muted"><span>Ritenuta ${t.ritPerc}%</span><span>− ${euro(t.ritenuta)}</span></div>`
      );
    }
    lines.push(`<div class="sum-total"><span>Totale Netto</span><strong>${euro(t.netto)}</strong></div>`);
    sumBox.innerHTML = lines.join("");
  }

  // Aggiorna meta header dell'editor
  const headerNum = document.getElementById("editor-doc-badge");
  if (headerNum) {
    headerNum.textContent = `N. ${q.numero}`;
  }
  const mobileTot = document.getElementById("mobile-bar-total");
  if (mobileTot) mobileTot.textContent = euro(t.netto);

  // Aggiorna stato Split-Screen & Anteprima Live A4
  const workspace = document.getElementById("editor-workspace");
  const previewPane = document.getElementById("editor-preview-pane");
  const toggleBtn = document.getElementById("btn-toggle-split-preview");

  if (workspace) workspace.classList.toggle("is-split-open", st.splitPreviewOpen);
  if (previewPane) previewPane.hidden = !st.splitPreviewOpen;
  if (toggleBtn) {
    toggleBtn.classList.toggle("active", st.splitPreviewOpen);
    toggleBtn.setAttribute("aria-pressed", String(st.splitPreviewOpen));
  }

  if (st.splitPreviewOpen) {
    clearTimeout(_previewDebounce);
    _previewDebounce = setTimeout(() => {
      renderLivePreviewInto("a4-preview-stage");
    }, 90);
  }
}

export function renderLivePreviewInto(containerId) {
  const stage = document.getElementById(containerId);
  if (!stage) return;
  const st = getState();
  stage.innerHTML = renderQuoteDocumentHtml(st.currentQuote, {
    showSignature: st.signatureEnabled,
  });
}

/**
 * Autocomplete clienti da /clienti nell'editor.
 */
function renderClientAutocomplete(query) {
  const listEl = document.getElementById("client-autocomplete-list");
  if (!listEl) return;

  const q = String(query || "").trim().toLowerCase();
  const clients = getState().clients;
  const matches = clients
    .filter((c) => {
      if (!q) return true;
      return `${c.nome} ${c.ref || ""} ${c.piva || ""} ${c.email || ""}`.toLowerCase().includes(q);
    })
    .slice(0, 8);

  if (!matches.length) {
    listEl.hidden = true;
    _acOpen = false;
    return;
  }

  listEl.innerHTML = matches
    .map(
      (c) => `<button type="button" class="ac-option" data-ac-client-id="${esc(c.id)}">
        <span class="ac-name">${esc(c.nome)}</span>
        <span class="ac-meta">${esc([c.ref, c.piva, c.email].filter(Boolean).join(" · "))}</span>
      </button>`
    )
    .join("");
  listEl.hidden = false;
  _acOpen = true;
}

function closeClientAutocomplete() {
  const listEl = document.getElementById("client-autocomplete-list");
  if (listEl) listEl.hidden = true;
  _acOpen = false;
}

async function openVerifyModal() {
  const st = getState();
  const res = verificaPreventivo(st.currentQuote, st.quotes);

  const renderSection = (title, items, cls) => {
    if (!items.length) return "";
    return `<div class="verify-group ${cls}">
      <h4>${title} (${items.length})</h4>
      <ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </div>`;
  };

  const body =
    res.errori.length === 0 && res.avvisi.length === 0 && res.suggerimenti.length === 0
      ? `<div class="verify-ok">Il preventivo è completo e coerente in tutti i campi fiscali e descrittivi.</div>`
      : renderSection("Errori da correggere", res.errori, "v-err") +
        renderSection("Avvisi fiscali", res.avvisi, "v-warn") +
        renderSection("Suggerimenti", res.suggerimenti, "v-info");

  const action = await openModal({
    title: "Verifica Preventivo",
    subtitle: `Preventivo N. ${st.currentQuote.numero}`,
    bodyHtml: body,
    size: "md",
    buttons: [
      { label: "Chiudi", value: "close", variant: "ghost" },
      { label: "Stampa PDF comunque", value: "print", variant: "primary" },
    ],
  });

  if (action === "print") {
    await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
  }
}

export async function openMobilePreviewSheet() {
  const st = getState();
  const html = renderQuoteDocumentHtml(st.currentQuote, {
    showSignature: st.signatureEnabled,
  });

  const res = await openModal({
    title: `Anteprima A4 — N. ${st.currentQuote.numero}`,
    subtitle: "Identica al PDF esportato in stampa",
    size: "lg",
    bodyHtml: `<div class="modal-a4-scroll"><div class="a4-sheet-frame">${html}</div></div>`,
    buttons: [
      { label: "Chiudi", value: "close", variant: "ghost" },
      { label: "Stampa / Salva PDF", value: "print", variant: "primary" },
    ],
  });

  if (res === "print") {
    await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
  }
}

export function initEditorView({ onTriggerImport }) {
  const root = document.getElementById("vista-editor");
  if (!root) return;

  // Popola tendina regimi e stati
  const selStato = document.getElementById("f-stato");
  if (selStato) {
    selStato.innerHTML = STATI_PREVENTIVO.map(
      (s) => `<option value="${esc(s.id)}">${esc(s.label)}</option>`
    ).join("");
  }
  const selRegime = document.getElementById("f-regime");
  if (selRegime) {
    selRegime.innerHTML = REGIMI_FISCALI.map(
      (r) => `<option value="${esc(r.id)}">${esc(r.label)}</option>`
    ).join("");
  }

  // Binding campi scalari via event delegation
  const scalarHandlers = {
    "f-numero": (q, v) => {
      q.numero = v;
    },
    "f-data": (q, v) => {
      q.data = v;
      if (v) {
        q.validita = aggiungiGiorni(v, 30);
        setFieldValue("f-validita", q.validita);
      }
    },
    "f-validita": (q, v) => {
      q.validita = v;
    },
    "f-stato": (q, v) => {
      q.stato = v;
    },
    "f-cl-nome": (q, v) => {
      q.cliente.nome = v;
      q.cliente.clienteId = ""; // scollega se modificato manualmente
      const badge = document.getElementById("editor-client-linked-badge");
      if (badge) badge.hidden = true;
    },
    "f-cl-ref": (q, v) => {
      q.cliente.ref = v;
    },
    "f-cl-email": (q, v) => {
      q.cliente.email = v;
    },
    "f-cl-tel": (q, v) => {
      q.cliente.tel = v;
    },
    "f-cl-piva": (q, v) => {
      q.cliente.piva = v;
    },
    "f-cl-cf": (q, v) => {
      q.cliente.cf = v;
    },
    "f-cl-sdi": (q, v) => {
      q.cliente.sdi = v.toUpperCase();
    },
    "f-cl-pec": (q, v) => {
      q.cliente.pec = v;
    },
    "f-cl-indirizzo": (q, v) => {
      q.cliente.indirizzo = v;
    },
    "f-pr-titolo": (q, v) => {
      q.progetto.titolo = v;
    },
    "f-pr-tipo": (q, v) => {
      q.progetto.tipo = v;
    },
    "f-pr-luogo": (q, v) => {
      q.progetto.luogo = v;
    },
    "f-pr-giornate": (q, v) => {
      q.progetto.giornate = v;
    },
    "f-pr-consegna": (q, v) => {
      q.progetto.consegna = v;
    },
    "f-pr-saluto": (q, v) => {
      q.progetto.saluto = v;
    },
    "f-pr-intro": (q, v) => {
      q.progetto.intro = v;
    },
    "f-sconto-val": (q, v) => {
      q.scontoValore = Math.max(0, parseFloat(v) || 0);
    },
    "f-sconto-txt": (q, v) => {
      q.sconto_txt = v;
    },
    "f-regime": (q, v) => {
      q.regime = v;
      if (v === "occasionale") {
        q.ritenuta = 20;
        q.rivalsa = 0;
        setFieldValue("f-ritenuta", 20);
        setFieldValue("f-rivalsa", 0);
      } else if (v === "forf5" || v === "forf15") {
        q.ritenuta = 0;
        q.iva = 0;
        setFieldValue("f-ritenuta", 0);
      } else if (v === "ordinario") {
        if (!q.iva) {
          q.iva = 22;
          setFieldValue("f-iva", 22);
        }
      }
      updateFiscalVisibility(v);
    },
    "f-ritenuta": (q, v) => {
      q.ritenuta = Math.min(100, Math.max(0, parseFloat(v) || 0));
    },
    "f-rivalsa": (q, v) => {
      q.rivalsa = Math.min(100, Math.max(0, parseFloat(v) || 0));
    },
    "f-iva": (q, v) => {
      q.iva = Math.min(100, Math.max(0, parseFloat(v) || 0));
    },
    "f-bollo": (q, v) => {
      q.bollo = v;
    },
  };

  const issuerFields = {
    "f-io-cf": "cf",
    "f-io-piva": "piva",
    "f-io-iban": "iban",
    "f-io-indirizzo": "indirizzo",
  };

  let issuerSaveTimer = null;

  root.addEventListener("input", (e) => {
    const target = e.target;

    // Autocomplete cliente su digitazione
    if (target.id === "f-cl-nome") {
      renderClientAutocomplete(target.value);
    }

    // Campi scalari
    if (scalarHandlers[target.id]) {
      actions.updateCurrentQuote((q) => scalarHandlers[target.id](q, target.value));
      scheduleQuoteAutosave();
      return;
    }

    // Dati emittente (salvati sia nel preventivo sia in /config/impostazioni)
    if (issuerFields[target.id]) {
      const key = issuerFields[target.id];
      const nextIssuer = { ...getState().issuer, [key]: target.value };
      actions.setIssuer(nextIssuer);
      actions.updateCurrentQuote((q) => {
        q.io[key] = target.value;
      });
      scheduleQuoteAutosave();
      clearTimeout(issuerSaveTimer);
      issuerSaveTimer = setTimeout(() => {
        saveIssuerToCloud(getState().issuer);
      }, 900);
      return;
    }

    // Voci di preventivo
    const voceCard = target.closest("[data-voce-idx]");
    if (voceCard && target.dataset.liField) {
      const idx = Number(voceCard.dataset.voceIdx);
      const field = target.dataset.liField;
      actions.updateCurrentQuote((q) => {
        if (!q.voci[idx]) return;
        q.voci[idx][field] =
          field === "q" || field === "p" ? Math.max(0, parseFloat(target.value) || 0) : target.value;
      });
      scheduleQuoteAutosave();
      return;
    }

    // Opzioni
    const opzRow = target.closest("[data-opz-idx]");
    if (opzRow && target.dataset.opzField) {
      const idx = Number(opzRow.dataset.opzIdx);
      const field = target.dataset.opzField;
      actions.updateCurrentQuote((q) => {
        if (!q.opzioni[idx]) return;
        q.opzioni[idx][field] = field === "p" ? Math.max(0, parseFloat(target.value) || 0) : target.value;
      });
      scheduleQuoteAutosave();
      return;
    }

    // Incluso / Escluso
    const bulletRow = target.closest("[data-bullet-idx]");
    if (bulletRow && target.hasAttribute("data-bullet-input")) {
      const kind = bulletRow.dataset.bulletKind;
      const idx = Number(bulletRow.dataset.bulletIdx);
      actions.updateCurrentQuote((q) => {
        if (q[kind] && q[kind][idx] !== undefined) q[kind][idx] = target.value;
      });
      scheduleQuoteAutosave();
      return;
    }

    // Condizioni
    const condRow = target.closest("[data-cond-idx]");
    if (condRow && target.dataset.condField) {
      const idx = Number(condRow.dataset.condIdx);
      const field = target.dataset.condField;
      actions.updateCurrentQuote((q) => {
        if (q.condizioni[idx]) q.condizioni[idx][field] = target.value;
      });
      scheduleQuoteAutosave();
    }
  });

  root.addEventListener("change", (e) => {
    const target = e.target;

    if (target.id === "f-firma-autografa") {
      actions.setSignatureEnabled(target.checked);
      return;
    }

    if (target.id === "sel-listino" && target.value) {
      const item = getState().priceList.find((v) => v.id === target.value);
      target.value = "";
      if (!item) return;
      actions.updateCurrentQuote(
        (q) => {
          const emptyIdx = q.voci.findIndex((v) => !v.nome.trim() && !(Number(v.p) > 0));
          const nuova = { nome: item.nome, desc: item.desc || "", q: 1, p: Number(item.prezzo) || 0 };
          if (emptyIdx >= 0) q.voci.splice(emptyIdx, 1, nuova);
          else q.voci.push(nuova);
        },
        { structural: true }
      );
      scheduleQuoteAutosave();
      showToast(`Voce «${item.nome}» aggiunta dal listino.`);
      return;
    }

    if (scalarHandlers[target.id]) {
      actions.updateCurrentQuote((q) => scalarHandlers[target.id](q, target.value));
      scheduleQuoteAutosave();
    }
  });

  // Focus autocomplete clienti
  const clNomeInput = document.getElementById("f-cl-nome");
  clNomeInput?.addEventListener("focus", () => {
    if (getState().clients.length > 0) renderClientAutocomplete(clNomeInput.value);
  });

  document.addEventListener("click", (e) => {
    if (_acOpen && !e.target.closest(".client-ac-wrap")) {
      closeClientAutocomplete();
    }
    const dropdown = document.getElementById("editor-more-menu");
    if (dropdown && !dropdown.hidden && !e.target.closest(".more-menu-wrap")) {
      dropdown.hidden = true;
    }
  });

  // Click delegation nell'editor
  root.addEventListener("click", async (e) => {
    // Selezione cliente da autocomplete
    const acBtn = e.target.closest("[data-ac-client-id]");
    if (acBtn) {
      const c = getState().clients.find((x) => x.id === acBtn.dataset.acClientId);
      closeClientAutocomplete();
      if (!c) return;
      actions.updateCurrentQuote((q) => {
        q.cliente = {
          clienteId: c.id,
          nome: c.nome || "",
          ref: c.ref || "",
          indirizzo: c.indirizzo || "",
          piva: c.piva || "",
          cf: c.cf || "",
          sdi: c.sdi || "",
          pec: c.pec || "",
          email: c.email || "",
          tel: c.tel || "",
        };
        if (c.ref && (!q.progetto.saluto || q.progetto.saluto === "Gentile Cliente,")) {
          q.progetto.saluto = `Gentile ${c.ref},`;
        }
      });
      syncEditorScalarsFromStore();
      scheduleQuoteAutosave();
      showToast(`Cliente «${c.nome}» collegato dalla rubrica.`);
      return;
    }

    // Toggle sconto € / %
    const scontoBtn = e.target.closest("[data-sconto-tipo]");
    if (scontoBtn) {
      const tipo = scontoBtn.dataset.scontoTipo === "perc" ? "perc" : "euro";
      actions.updateCurrentQuote((q) => {
        q.scontoTipo = tipo;
        q.progetto.scontoTipo = tipo;
        if (tipo === "perc" && q.scontoValore > 100) q.scontoValore = 100;
      });
      syncEditorScalarsFromStore();
      scheduleQuoteAutosave();
      return;
    }

    // Sposta / Rimuovi voce
    const voceCard = e.target.closest("[data-voce-idx]");
    if (voceCard) {
      const idx = Number(voceCard.dataset.voceIdx);
      const moveBtn = e.target.closest("[data-li-move]");
      if (moveBtn) {
        const dir = moveBtn.dataset.liMove === "up" ? -1 : 1;
        actions.updateCurrentQuote((q) => swapItems(q.voci, idx, idx + dir), { structural: true });
        scheduleQuoteAutosave();
        return;
      }
      if (e.target.closest("[data-li-remove]")) {
        actions.updateCurrentQuote(
          (q) => {
            if (q.voci.length <= 1) {
              q.voci[0] = { nome: "", desc: "", q: 1, p: 0 };
            } else {
              q.voci.splice(idx, 1);
            }
          },
          { structural: true }
        );
        scheduleQuoteAutosave();
        return;
      }
    }

    // Sposta / Rimuovi opzione
    const opzRow = e.target.closest("[data-opz-idx]");
    if (opzRow) {
      const idx = Number(opzRow.dataset.opzIdx);
      const moveBtn = e.target.closest("[data-opz-move]");
      if (moveBtn) {
        const dir = moveBtn.dataset.opzMove === "up" ? -1 : 1;
        actions.updateCurrentQuote((q) => swapItems(q.opzioni, idx, idx + dir), { structural: true });
        scheduleQuoteAutosave();
        return;
      }
      if (e.target.closest("[data-opz-remove]")) {
        actions.updateCurrentQuote((q) => q.opzioni.splice(idx, 1), { structural: true });
        scheduleQuoteAutosave();
        return;
      }
    }

    // Rimuovi incluso / escluso
    const bulletRow = e.target.closest("[data-bullet-idx]");
    if (bulletRow && e.target.closest("[data-bullet-remove]")) {
      const kind = bulletRow.dataset.bulletKind;
      const idx = Number(bulletRow.dataset.bulletIdx);
      actions.updateCurrentQuote((q) => q[kind]?.splice(idx, 1), { structural: true });
      scheduleQuoteAutosave();
      return;
    }

    // Sposta / Rimuovi condizione
    const condRow = e.target.closest("[data-cond-idx]");
    if (condRow) {
      const idx = Number(condRow.dataset.condIdx);
      const moveBtn = e.target.closest("[data-cond-move]");
      if (moveBtn) {
        const dir = moveBtn.dataset.condMove === "up" ? -1 : 1;
        actions.updateCurrentQuote((q) => swapItems(q.condizioni, idx, idx + dir), { structural: true });
        scheduleQuoteAutosave();
        return;
      }
      if (e.target.closest("[data-cond-remove]")) {
        actions.updateCurrentQuote((q) => q.condizioni.splice(idx, 1), { structural: true });
        scheduleQuoteAutosave();
        return;
      }
    }

    // Azioni editor dedicate
    const actBtn = e.target.closest("[data-editor-action]");
    if (!actBtn) return;
    const action = actBtn.dataset.editorAction;
    const st = getState();

    // Chiudi eventuale dropdown menu
    const moreMenu = document.getElementById("editor-more-menu");
    if (moreMenu && action !== "toggle-more-menu") moreMenu.hidden = true;

    switch (action) {
      case "toggle-more-menu":
        if (moreMenu) moreMenu.hidden = !moreMenu.hidden;
        break;

      case "add-voce":
        actions.updateCurrentQuote(
          (q) => q.voci.push({ nome: "", desc: "", q: 1, p: 0 }),
          { structural: true }
        );
        scheduleQuoteAutosave();
        {
          const cards = document.querySelectorAll("#editor-voci-list .li-nome");
          cards[cards.length - 1]?.focus();
        }
        break;

      case "apply-package": {
        const pkgKey = actBtn.dataset.package;
        const pkg = PACCHETTI[pkgKey];
        if (!pkg) return;
        const hasFilled = st.currentQuote.voci.some((v) => v.nome.trim() || v.p > 0);
        if (hasFilled) {
          const ok = await confirmModal({
            title: "Carica pacchetto preimpostato",
            message: "Vuoi aggiungere le voci del pacchetto a quelle già presenti?",
            confirmLabel: "Aggiungi voci",
            cancelLabel: "Annulla",
          });
          if (!ok) return;
        }
        actions.updateCurrentQuote(
          (q) => {
            const cleanExisting = q.voci.filter((v) => v.nome.trim() || v.p > 0);
            q.voci = [...cleanExisting, ...pkg.map((item) => ({ ...item }))];
          },
          { structural: true }
        );
        scheduleQuoteAutosave();
        showToast("Pacchetto inserito nelle voci di preventivo.");
        break;
      }

      case "add-opzione":
        actions.updateCurrentQuote(
          (q) => q.opzioni.push({ nome: "", desc: "", p: 0 }),
          { structural: true }
        );
        scheduleQuoteAutosave();
        break;

      case "add-incluso":
        actions.updateCurrentQuote((q) => q.incluso.push(""), { structural: true });
        scheduleQuoteAutosave();
        break;

      case "add-escluso":
        actions.updateCurrentQuote((q) => q.escluso.push(""), { structural: true });
        scheduleQuoteAutosave();
        break;

      case "add-condizione":
        actions.updateCurrentQuote(
          (q) => q.condizioni.push({ titolo: "", testo: "" }),
          { structural: true }
        );
        scheduleQuoteAutosave();
        break;

      case "undo-struct":
        if (actions.undoStructural()) {
          scheduleQuoteAutosave();
          showToast("Modifica strutturale annullata.");
        }
        break;

      case "redo-struct":
        if (actions.redoStructural()) {
          scheduleQuoteAutosave();
          showToast("Modifica strutturale ripristinata.");
        }
        break;

      case "save-client-to-crm": {
        const cl = st.currentQuote.cliente;
        if (!cl.nome.trim()) {
          showToast("Inserisci prima il nome del cliente.", { type: "error" });
          return;
        }
        const saved = await saveClientToCloud({
          id: cl.clienteId || generaId("cli"),
          nome: cl.nome,
          ref: cl.ref,
          indirizzo: cl.indirizzo,
          piva: cl.piva,
          cf: cl.cf,
          sdi: cl.sdi,
          pec: cl.pec,
          email: cl.email,
          tel: cl.tel,
        });
        if (saved) {
          actions.updateCurrentQuote((q) => {
            q.cliente.clienteId = saved.id;
          });
          syncEditorScalarsFromStore();
          scheduleQuoteAutosave();
          showToast(`Cliente «${saved.nome}» salvato nella rubrica CRM.`, { type: "success" });
        }
        break;
      }

      case "toggle-split-preview":
        if (window.innerWidth <= 1024) {
          await openMobilePreviewSheet();
        } else {
          actions.toggleSplitPreview();
        }
        break;

      case "print-quote":
        await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
        break;

      case "print-proforma":
        await printSecondDocument(st.currentQuote, { showSignature: st.signatureEnabled });
        break;

      case "verify-quote":
        await openVerifyModal();
        break;

      case "new-quote":
        actions.newQuote();
        showToast("Nuovo preventivo pronto.");
        break;

      case "duplicate-current": {
        const copy = sanificaPreventivo({
          ...st.currentQuote,
          id: generaId("p"),
          numero: prossimoNumero(st.quotes),
          stato: "bozza",
          cestinato: false,
          eliminatoIl: null,
          modificato: new Date().toISOString(),
        });
        await saveQuoteToCloud(copy);
        actions.loadQuoteIntoEditor(copy, { persisted: true });
        showToast(`Duplicato come preventivo ${copy.numero}.`, { type: "success" });
        break;
      }

      case "export-current-json":
        exportSingleQuoteJson(st.currentQuote);
        break;

      case "import-json":
        onTriggerImport?.();
        break;

      case "reset-standard-texts": {
        const ok = await confirmModal({
          title: "Ripristina testi standard",
          message:
            "Vuoi ripristinare le voci «Incluso / Escluso» e le 8 clausole contrattuali predefinite per questo preventivo?",
          confirmLabel: "Ripristina",
        });
        if (!ok) return;
        actions.updateCurrentQuote(
          (q) => {
            q.incluso = [...INCLUSO_STD];
            q.escluso = [...ESCLUSO_STD];
            q.condizioni = CONDIZIONI_STD.map((c) => ({ ...c }));
          },
          { structural: true }
        );
        scheduleQuoteAutosave();
        showToast("Testi contrattuali standard ripristinati.");
        break;
      }

      case "trash-current": {
        if (!st.isDraftPersisted) return;
        const ok = await confirmModal({
          title: "Sposta nel cestino",
          message: `Spostare il preventivo ${st.currentQuote.numero} nel cestino?`,
          confirmLabel: "Sposta nel cestino",
          danger: true,
        });
        if (!ok) return;
        await moveQuotesToTrash(st.currentQuote.id);
        actions.newQuote();
        showToast("Preventivo spostato nel cestino.");
        break;
      }
    }
  });
}
