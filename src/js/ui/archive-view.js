/**
 * Vista Archivio & Cestino Cloud-First.
 * - KPI calcolati con motore fiscale puro (calcolaTotali)
 * - Vista cronologica o raggruppata per cliente
 * - Ricerca, filtro stato, ordinamento, azioni batch
 * - Cestino 100% Cloud (cestinato: true/false), zero inline onclick
 */

import { STATI_PREVENTIVO } from "../config.js";
import { calcolaTotali } from "../calculations.js";
import { dataBreve, esc, euro, generaId, normalizzaChiave } from "../formatters.js";
import { actions, getActiveQuotes, getState, getTrashedQuotes } from "../store.js";
import {
  deleteQuotesPermanently,
  moveQuotesToTrash,
  restoreQuotesFromTrash,
  saveQuoteToCloud,
  updateQuoteStatus,
} from "../firebase-sync.js";
import { printQuoteDocument, printSecondDocument } from "../print-engine.js";
import { exportSingleQuoteJson } from "../import-export.js";
import { confirmModal, showToast } from "./modal.js";
import { prossimoNumero, sanificaPreventivo } from "../validator.js";

function statusLabel(stato) {
  return STATI_PREVENTIVO.find((s) => s.id === stato)?.label || "Bozza";
}

function sortQuotes(list, sortKey) {
  const arr = list.slice();
  switch (sortKey) {
    case "data_desc":
      return arr.sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
    case "data_asc":
      return arr.sort((a, b) => String(a.data || "").localeCompare(String(b.data || "")));
    case "numero_desc":
      return arr.sort((a, b) => String(b.numero || "").localeCompare(String(a.numero || ""), "it", { numeric: true }));
    case "totale_desc":
      return arr.sort((a, b) => calcolaTotali(b).netto - calcolaTotali(a).netto);
    case "cliente_asc":
      return arr.sort((a, b) =>
        String(a.cliente?.nome || "").localeCompare(String(b.cliente?.nome || ""), "it")
      );
    case "modificato_desc":
    default:
      return arr.sort((a, b) => String(b.modificato || "").localeCompare(String(a.modificato || "")));
  }
}

function getFilteredArchiveList() {
  const st = getState();
  const isTrash = st.archiveStatusFilter === "cestino";
  const base = isTrash ? getTrashedQuotes() : getActiveQuotes();
  const q = st.archiveSearch.trim().toLowerCase();

  const filtered = base.filter((item) => {
    if (!isTrash && st.archiveStatusFilter !== "tutti" && item.stato !== st.archiveStatusFilter) {
      return false;
    }
    if (!q) return true;
    const hay = [
      item.numero,
      item.cliente?.nome,
      item.cliente?.ref,
      item.progetto?.titolo,
      item.progetto?.tipo,
      item.progetto?.luogo,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  return sortQuotes(filtered, st.archiveSort);
}

function renderStatusSelect(quote) {
  const opts = STATI_PREVENTIVO.map(
    (s) =>
      `<option value="${esc(s.id)}"${quote.stato === s.id ? " selected" : ""}>${esc(s.label)}</option>`
  ).join("");
  return `<select class="status-select status-${esc(quote.stato)}" data-action="change-status" data-id="${esc(quote.id)}" aria-label="Stato preventivo ${esc(quote.numero)}">${opts}</select>`;
}

function renderQuoteRow(quote, { isTrash, isSelected, isCurrent }) {
  const t = calcolaTotali(quote);
  const cliente = quote.cliente?.nome || "Cliente non indicato";
  const progetto = quote.progetto?.titolo || "Senza titolo";

  if (isTrash) {
    return `<tr class="archive-row${isSelected ? " is-selected" : ""}" data-id="${esc(quote.id)}">
      <td class="col-check">
        <input type="checkbox" class="row-check" data-action="toggle-select" data-id="${esc(quote.id)}"${isSelected ? " checked" : ""} aria-label="Seleziona ${esc(quote.numero)}">
      </td>
      <td class="col-num">
        <span class="mono-num">${esc(quote.numero)}</span>
        <span class="row-sub">Eliminato il ${esc(dataBreve(quote.eliminatoIl))}</span>
      </td>
      <td class="col-main">
        <div class="row-title">${esc(cliente)}</div>
        <div class="row-sub">${esc(progetto)}</div>
      </td>
      <td class="col-date">${esc(dataBreve(quote.data))}</td>
      <td class="col-status"><span class="status-tag status-${esc(quote.stato)}">${esc(statusLabel(quote.stato))}</span></td>
      <td class="col-amount">${euro(t.netto)}</td>
      <td class="col-actions">
        <div class="row-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="restore-one" data-id="${esc(quote.id)}">Ripristina</button>
          <button type="button" class="btn btn-danger btn-sm" data-action="delete-one" data-id="${esc(quote.id)}">Elimina</button>
        </div>
      </td>
    </tr>`;
  }

  return `<tr class="archive-row${isSelected ? " is-selected" : ""}${isCurrent ? " is-current" : ""}" data-id="${esc(quote.id)}">
    <td class="col-check">
      <input type="checkbox" class="row-check" data-action="toggle-select" data-id="${esc(quote.id)}"${isSelected ? " checked" : ""} aria-label="Seleziona ${esc(quote.numero)}">
    </td>
    <td class="col-num">
      <button type="button" class="link-num" data-action="open-quote" data-id="${esc(quote.id)}">${esc(quote.numero)}</button>
      ${isCurrent ? `<span class="current-dot" title="Aperto nell'editor">Aperto</span>` : ""}
    </td>
    <td class="col-main">
      <button type="button" class="row-open-trigger" data-action="open-quote" data-id="${esc(quote.id)}">
        <span class="row-title">${esc(cliente)}</span>
        <span class="row-sub">${esc(progetto)}</span>
      </button>
    </td>
    <td class="col-date">${esc(dataBreve(quote.data))}</td>
    <td class="col-status">${renderStatusSelect(quote)}</td>
    <td class="col-amount">${euro(t.netto)}</td>
    <td class="col-actions">
      <div class="row-actions">
        <button type="button" class="icon-btn" title="Stampa PDF Preventivo" data-action="print-quote" data-id="${esc(quote.id)}" aria-label="Stampa PDF">PDF</button>
        <button type="button" class="icon-btn" title="Proforma / Nota di prestazione" data-action="print-proforma" data-id="${esc(quote.id)}" aria-label="Stampa Proforma">Nota</button>
        <button type="button" class="icon-btn" title="Duplica preventivo" data-action="duplicate-quote" data-id="${esc(quote.id)}" aria-label="Duplica">Duplica</button>
        <button type="button" class="icon-btn" title="Esporta JSON" data-action="export-json" data-id="${esc(quote.id)}" aria-label="Esporta JSON">JSON</button>
        <button type="button" class="icon-btn icon-danger" title="Sposta nel cestino" data-action="trash-one" data-id="${esc(quote.id)}" aria-label="Sposta nel cestino">✕</button>
      </div>
    </td>
  </tr>`;
}

function renderGroupedByClient(items, st) {
  const groups = new Map();
  for (const q of items) {
    const label = String(q.cliente?.nome || "").trim() || "Cliente non indicato";
    const key = q.cliente?.clienteId || normalizzaChiave(label) || "__none__";
    if (!groups.has(key)) {
      groups.set(key, { key, label, items: [], totalNetto: 0, acceptedNetto: 0 });
    }
    const g = groups.get(key);
    g.items.push(q);
    const val = calcolaTotali(q).netto;
    g.totalNetto += val;
    if (q.stato === "accettato") g.acceptedNetto += val;
  }

  const sortedGroups = [...groups.values()].sort((a, b) => a.label.localeCompare(b.label, "it"));

  return sortedGroups
    .map((g) => {
      const isOpen = st.openClientGroups.has(g.key) || sortedGroups.length <= 3;
      const rows = isOpen
        ? `<div class="table-scroll">
            <table class="data-table archive-table">
              <tbody>
                ${g.items
                  .map((q) =>
                    renderQuoteRow(q, {
                      isTrash: false,
                      isSelected: st.selectedArchiveIds.has(q.id),
                      isCurrent: st.currentQuote?.id === q.id,
                    })
                  )
                  .join("")}
              </tbody>
            </table>
          </div>`
        : "";

      return `<section class="client-group-card${isOpen ? " is-open" : ""}">
        <button type="button" class="client-group-head" data-action="toggle-group" data-group="${esc(g.key)}" aria-expanded="${isOpen}">
          <div class="cg-left">
            <span class="cg-chevron">${isOpen ? "▾" : "▸"}</span>
            <span class="cg-name">${esc(g.label)}</span>
            <span class="cg-count">${g.items.length} ${g.items.length === 1 ? "preventivo" : "preventivi"}</span>
          </div>
          <div class="cg-right">
            <span class="cg-stat">Accettati: <strong>${euro(g.acceptedNetto)}</strong></span>
            <span class="cg-stat">Totale: <strong>${euro(g.totalNetto)}</strong></span>
          </div>
        </button>
        ${rows}
      </section>`;
    })
    .join("");
}

export function renderArchiveView() {
  const container = document.getElementById("archive-view-root");
  if (!container) return;

  const st = getState();
  const active = getActiveQuotes();
  const trashed = getTrashedQuotes();
  const isTrash = st.archiveStatusFilter === "cestino";
  const items = getFilteredArchiveList();

  // KPI (calcolati tramite motore puro)
  let totAccettato = 0;
  let totInAttesa = 0;
  let countAccettati = 0;
  let countChiusi = 0;
  for (const q of active) {
    const net = calcolaTotali(q).netto;
    if (q.stato === "accettato") {
      totAccettato += net;
      countAccettati += 1;
      countChiusi += 1;
    } else if (q.stato === "inviato") {
      totInAttesa += net;
    } else if (q.stato === "rifiutato") {
      countChiusi += 1;
    }
  }
  const convRate = countChiusi > 0 ? Math.round((countAccettati / countChiusi) * 100) : 0;

  // Aggiorna badge numerico nella navigazione
  const navCount = document.getElementById("nav-archive-count");
  if (navCount) navCount.textContent = String(active.length);

  const counts = {
    tutti: active.length,
    bozza: active.filter((q) => q.stato === "bozza").length,
    inviato: active.filter((q) => q.stato === "inviato").length,
    accettato: active.filter((q) => q.stato === "accettato").length,
    rifiutato: active.filter((q) => q.stato === "rifiutato").length,
    annullato: active.filter((q) => q.stato === "annullato").length,
    cestino: trashed.length,
  };

  const filterButtons = [
    ["tutti", "Tutti"],
    ["bozza", "Bozze"],
    ["inviato", "Inviati"],
    ["accettato", "Accettati"],
    ["rifiutato", "Rifiutati"],
    ["annullato", "Annullati"],
    ["cestino", "Cestino"],
  ]
    .map(
      ([id, label]) =>
        `<button type="button" class="filter-tab${st.archiveStatusFilter === id ? " active" : ""}${id === "cestino" ? " is-trash" : ""}" data-action="set-status-filter" data-value="${id}">
          <span>${label}</span>
          <span class="filter-count">${counts[id]}</span>
        </button>`
    )
    .join("");

  const selectedCount = st.selectedArchiveIds.size;
  const allVisibleSelected = items.length > 0 && items.every((q) => st.selectedArchiveIds.has(q.id));

  const bulkBarHtml = selectedCount
    ? `<div class="bulk-bar">
        <span class="bulk-count"><strong>${selectedCount}</strong> selezionati</span>
        <div class="bulk-actions">
          ${
            isTrash
              ? `<button type="button" class="btn btn-secondary btn-sm" data-action="bulk-restore">Ripristina</button>
                 <button type="button" class="btn btn-danger btn-sm" data-action="bulk-delete">Elimina definitivamente</button>`
              : `<select class="field-input field-sm" data-action="bulk-status" aria-label="Cambia stato ai selezionati">
                   <option value="">Cambia stato…</option>
                   ${STATI_PREVENTIVO.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}
                 </select>
                 <button type="button" class="btn btn-danger btn-sm" data-action="bulk-trash">Sposta nel cestino</button>`
          }
          <button type="button" class="btn btn-ghost btn-sm" data-action="clear-selection">Deseleziona</button>
        </div>
      </div>`
    : "";

  let bodyHtml = "";
  if (items.length === 0) {
    bodyHtml = `<div class="empty-state">
      <p class="empty-title">${isTrash ? "Il cestino è vuoto" : "Nessun preventivo trovato"}</p>
      <p class="empty-desc">${
        isTrash
          ? "I preventivi spostati nel cestino restano sincronizzati nel Cloud finché non li elimini definitivamente."
          : "Prova a rimuovere i filtri di ricerca oppure crea un nuovo preventivo."
      }</p>
      ${
        !isTrash
          ? `<button type="button" class="btn btn-primary" data-action="new-quote-from-archive">+ Nuovo preventivo</button>`
          : ""
      }
    </div>`;
  } else if (!isTrash && st.archiveViewMode === "clienti") {
    bodyHtml = renderGroupedByClient(items, st);
  } else {
    bodyHtml = `<div class="table-card">
      <div class="table-scroll">
        <table class="data-table archive-table">
          <thead>
            <tr>
              <th class="col-check">
                <input type="checkbox" data-action="toggle-select-all"${allVisibleSelected ? " checked" : ""} aria-label="Seleziona tutti">
              </th>
              <th>Numero</th>
              <th>Cliente &amp; Progetto</th>
              <th>Data</th>
              <th>Stato</th>
              <th class="num">Totale Netto</th>
              <th class="num">Azioni</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((q) =>
                renderQuoteRow(q, {
                  isTrash,
                  isSelected: st.selectedArchiveIds.has(q.id),
                  isCurrent: st.currentQuote?.id === q.id,
                })
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  container.innerHTML = `
    <div class="view-header">
      <div>
        <h1 class="view-title">Archivio Preventivi</h1>
        <p class="view-subtitle">Sincronizzato in tempo reale con Firebase Cloud · ${active.length} attivi${trashed.length ? ` · ${trashed.length} nel cestino` : ""}</p>
      </div>
      <div class="view-header-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-action="export-backup">Backup JSON</button>
        <button type="button" class="btn btn-ghost btn-sm" data-action="trigger-import-json">Importa JSON</button>
        <button type="button" class="btn btn-primary" data-action="new-quote-from-archive">+ Nuovo preventivo</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">Accettati</span>
        <strong class="kpi-value">${euro(totAccettato)}</strong>
        <span class="kpi-meta">${countAccettati} preventivi confermati</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">In attesa (Inviati)</span>
        <strong class="kpi-value">${euro(totInAttesa)}</strong>
        <span class="kpi-meta">${counts.inviato} offerte aperte</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Tasso di conversione</span>
        <strong class="kpi-value">${convRate}%</strong>
        <span class="kpi-meta">${countAccettati} su ${countChiusi} definiti</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Archivio totale</span>
        <strong class="kpi-value">${active.length}</strong>
        <span class="kpi-meta">${counts.bozza} bozze in lavorazione</span>
      </div>
    </div>

    <div class="toolbar-card">
      <div class="filter-tabs" role="tablist">${filterButtons}</div>
      <div class="toolbar-controls">
        <input type="search" id="archive-search-input" class="field-input search-input" placeholder="Cerca numero, cliente, progetto, location…" value="${esc(st.archiveSearch)}" aria-label="Cerca nell'archivio">
        <select id="archive-sort-select" class="field-input field-sm" aria-label="Ordina preventivi">
          <option value="modificato_desc"${st.archiveSort === "modificato_desc" ? " selected" : ""}>Ultima modifica</option>
          <option value="data_desc"${st.archiveSort === "data_desc" ? " selected" : ""}>Data (più recenti)</option>
          <option value="data_asc"${st.archiveSort === "data_asc" ? " selected" : ""}>Data (meno recenti)</option>
          <option value="numero_desc"${st.archiveSort === "numero_desc" ? " selected" : ""}>Numero decrescente</option>
          <option value="totale_desc"${st.archiveSort === "totale_desc" ? " selected" : ""}>Importo più alto</option>
          <option value="cliente_asc"${st.archiveSort === "cliente_asc" ? " selected" : ""}>Cliente (A–Z)</option>
        </select>
        ${
          !isTrash
            ? `<div class="segmented" role="group" aria-label="Modalità vista archivio">
                <button type="button" class="seg-btn${st.archiveViewMode === "cronologico" ? " active" : ""}" data-action="set-view-mode" data-value="cronologico">Elenco</button>
                <button type="button" class="seg-btn${st.archiveViewMode === "clienti" ? " active" : ""}" data-action="set-view-mode" data-value="clienti">Per Cliente</button>
              </div>`
            : `<button type="button" class="btn btn-danger btn-sm" data-action="empty-trash"${trashed.length === 0 ? " disabled" : ""}>Svuota cestino</button>`
        }
      </div>
    </div>

    ${bulkBarHtml}
    ${bodyHtml}
  `;
}

export function initArchiveView({ onOpenQuote, onTriggerImport, onExportBackup }) {
  const container = document.getElementById("archive-view-root");
  if (!container) return;

  container.addEventListener("input", (e) => {
    if (e.target.id === "archive-search-input") {
      const pos = e.target.selectionStart;
      actions.setArchiveFilter({ archiveSearch: e.target.value });
      const next = document.getElementById("archive-search-input");
      if (next) {
        next.focus();
        if (pos !== null) next.setSelectionRange(pos, pos);
      }
    }
  });

  container.addEventListener("change", async (e) => {
    const target = e.target;
    if (target.id === "archive-sort-select") {
      actions.setArchiveFilter({ archiveSort: target.value });
      return;
    }

    const action = target.dataset.action;
    if (action === "change-status") {
      const id = target.dataset.id;
      await updateQuoteStatus(id, target.value);
      showToast(`Stato aggiornato a «${statusLabel(target.value)}».`);
      return;
    }

    if (action === "toggle-select") {
      actions.toggleSelectArchiveId(target.dataset.id);
      return;
    }

    if (action === "toggle-select-all") {
      const visible = getFilteredArchiveList();
      if (target.checked) actions.setSelectedArchiveIds(visible.map((q) => q.id));
      else actions.clearSelectedArchiveIds();
      return;
    }

    if (action === "bulk-status" && target.value) {
      const ids = [...getState().selectedArchiveIds];
      const nextStatus = target.value;
      target.value = "";
      await updateQuoteStatus(ids, nextStatus);
      actions.clearSelectedArchiveIds();
      showToast(`${ids.length} preventivi aggiornati a «${statusLabel(nextStatus)}».`, {
        type: "success",
      });
    }
  });

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const st = getState();

    switch (action) {
      case "set-status-filter":
        actions.setArchiveFilter({ archiveStatusFilter: btn.dataset.value });
        break;

      case "set-view-mode":
        actions.setArchiveFilter({ archiveViewMode: btn.dataset.value });
        break;

      case "toggle-group":
        actions.toggleClientGroup(btn.dataset.group);
        break;

      case "clear-selection":
        actions.clearSelectedArchiveIds();
        break;

      case "new-quote-from-archive":
        actions.newQuote();
        actions.setActiveView("editor");
        break;

      case "export-backup":
        onExportBackup?.();
        break;

      case "trigger-import-json":
        onTriggerImport?.();
        break;

      case "open-quote": {
        const quote = st.quotes.find((q) => q.id === id);
        if (quote) onOpenQuote?.(quote);
        break;
      }

      case "print-quote": {
        const quote = st.quotes.find((q) => q.id === id);
        if (quote) await printQuoteDocument(quote, { showSignature: st.signatureEnabled });
        break;
      }

      case "print-proforma": {
        const quote = st.quotes.find((q) => q.id === id);
        if (quote) await printSecondDocument(quote, { showSignature: st.signatureEnabled });
        break;
      }

      case "export-json": {
        const quote = st.quotes.find((q) => q.id === id);
        if (quote) exportSingleQuoteJson(quote);
        break;
      }

      case "duplicate-quote": {
        const src = st.quotes.find((q) => q.id === id);
        if (!src) return;
        const copy = sanificaPreventivo({
          ...src,
          id: generaId("p"),
          numero: prossimoNumero(st.quotes),
          stato: "bozza",
          cestinato: false,
          eliminatoIl: null,
          modificato: new Date().toISOString(),
        });
        await saveQuoteToCloud(copy);
        actions.loadQuoteIntoEditor(copy, { persisted: true });
        actions.setActiveView("editor");
        showToast(`Duplicato come preventivo ${copy.numero}.`, { type: "success" });
        break;
      }

      case "trash-one": {
        const quote = st.quotes.find((q) => q.id === id);
        if (!quote) return;
        const ok = await confirmModal({
          title: "Sposta nel cestino",
          message: `Vuoi spostare il preventivo ${quote.numero} nel cestino? Potrai sempre ripristinarlo.`,
          confirmLabel: "Sposta nel cestino",
          danger: true,
        });
        if (!ok) return;
        await moveQuotesToTrash(id);
        showToast(`Preventivo ${quote.numero} spostato nel cestino.`);
        break;
      }

      case "restore-one":
        await restoreQuotesFromTrash(id);
        showToast("Preventivo ripristinato nell'archivio.", { type: "success" });
        break;

      case "delete-one": {
        const quote = st.quotes.find((q) => q.id === id);
        if (!quote) return;
        const ok = await confirmModal({
          title: "Eliminazione definitiva",
          message: `Eliminare definitivamente il preventivo ${quote.numero}? Questa operazione non può essere annullata.`,
          confirmLabel: "Elimina per sempre",
          danger: true,
        });
        if (!ok) return;
        await deleteQuotesPermanently(id);
        showToast("Preventivo eliminato definitivamente.");
        break;
      }

      case "bulk-trash": {
        const ids = [...st.selectedArchiveIds];
        const ok = await confirmModal({
          title: "Sposta nel cestino",
          message: `Spostare ${ids.length} preventivi selezionati nel cestino?`,
          confirmLabel: "Sposta nel cestino",
          danger: true,
        });
        if (!ok) return;
        await moveQuotesToTrash(ids);
        actions.clearSelectedArchiveIds();
        showToast(`${ids.length} preventivi spostati nel cestino.`);
        break;
      }

      case "bulk-restore": {
        const ids = [...st.selectedArchiveIds];
        await restoreQuotesFromTrash(ids);
        actions.clearSelectedArchiveIds();
        showToast(`${ids.length} preventivi ripristinati.`, { type: "success" });
        break;
      }

      case "bulk-delete": {
        const ids = [...st.selectedArchiveIds];
        const ok = await confirmModal({
          title: "Elimina definitivamente",
          message: `Eliminare definitivamente ${ids.length} preventivi dal cestino? Azione irreversibile.`,
          confirmLabel: "Elimina per sempre",
          danger: true,
        });
        if (!ok) return;
        await deleteQuotesPermanently(ids);
        actions.clearSelectedArchiveIds();
        showToast(`${ids.length} preventivi eliminati definitivamente.`);
        break;
      }

      case "empty-trash": {
        const ids = getTrashedQuotes().map((q) => q.id);
        if (!ids.length) return;
        const ok = await confirmModal({
          title: "Svuota cestino",
          message: `Eliminare definitivamente tutti i ${ids.length} preventivi presenti nel cestino? Azione irreversibile.`,
          confirmLabel: "Svuota cestino",
          danger: true,
        });
        if (!ok) return;
        await deleteQuotesPermanently(ids);
        actions.clearSelectedArchiveIds();
        showToast("Cestino svuotato.");
        break;
      }
    }
  });
}
