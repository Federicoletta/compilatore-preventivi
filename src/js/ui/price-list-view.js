/**
 * Vista Listino Servizi Cloud-First.
 * - Modifiche inline con debounce 800ms (zero flood di scritture su Firestore)
 * - Rispetta firestore.rules (nome >= 1 char, prezzo >= 0)
 * - Stampa PDF A4 del listino interno
 */

import { esc, generaId } from "../formatters.js";
import { actions, getState } from "../store.js";
import { deletePriceItemFromCloud, schedulePriceItemSave } from "../firebase-sync.js";
import { printPriceListDocument } from "../print-engine.js";
import { confirmModal, showToast } from "./modal.js";

export function renderPriceListView() {
  const container = document.getElementById("pricelist-view-root");
  if (!container) return;

  const st = getState();
  const all = st.priceList;
  const q = st.priceListSearch.trim().toLowerCase();

  const filtered = all.filter((v) => {
    if (!q) return true;
    const hay = `${v.cat || ""} ${v.nome || ""} ${v.desc || ""} ${v.unita || ""}`.toLowerCase();
    return hay.includes(q);
  });

  const cats = [...new Set(all.map((v) => v.cat).filter(Boolean))];
  const units = [...new Set(["giornata", "mezza giornata", "forfait", "ora", "pezzo", ...all.map((v) => v.unita).filter(Boolean)])];

  const rowsHtml = filtered
    .map(
      (v) => `<tr data-item-id="${esc(v.id)}">
        <td class="pl-col-cat">
          <input class="field-input field-sm" data-field="cat" list="dl-pl-cats" placeholder="Categoria" value="${esc(v.cat || "")}">
        </td>
        <td class="pl-col-main">
          <input class="field-input field-sm pl-nome-input" data-field="nome" placeholder="Nome prestazione *" value="${esc(v.nome || "")}">
          <textarea class="field-input field-sm pl-desc-input" data-field="desc" rows="2" placeholder="Descrizione che verrà inserita nel preventivo">${esc(v.desc || "")}</textarea>
        </td>
        <td class="pl-col-unit">
          <input class="field-input field-sm" data-field="unita" list="dl-pl-units" placeholder="giornata" value="${esc(v.unita || "")}">
        </td>
        <td class="pl-col-price">
          <input class="field-input field-sm num-input" type="number" step="0.01" min="0" data-field="prezzo" value="${Number(v.prezzo) || 0}">
        </td>
        <td class="col-actions">
          <button type="button" class="icon-btn icon-danger" data-action="delete-price-item" data-id="${esc(v.id)}" title="Elimina voce" aria-label="Elimina voce">✕</button>
        </td>
      </tr>`
    )
    .join("");

  container.innerHTML = `
    <div class="view-header">
      <div>
        <h1 class="view-title">Listino Servizi</h1>
        <p class="view-subtitle">${all.length} voci in catalogo · salvataggio automatico Cloud (debounce 800ms)</p>
      </div>
      <div class="view-header-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-action="print-pricelist">Stampa PDF Listino</button>
        <button type="button" class="btn btn-primary" data-action="add-price-item">+ Aggiungi voce</button>
      </div>
    </div>

    <div class="toolbar-card">
      <input type="search" id="pricelist-search-input" class="field-input search-input" placeholder="Filtra per categoria, nome o descrizione…" value="${esc(st.priceListSearch)}" aria-label="Cerca nel listino">
    </div>

    ${
      filtered.length
        ? `<div class="table-card">
            <div class="table-scroll">
              <table class="data-table pricelist-table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Voce &amp; Descrizione</th>
                    <th>Unità</th>
                    <th class="num">Prezzo (€)</th>
                    <th class="num">Azioni</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>
          </div>`
        : `<div class="empty-state">
            <p class="empty-title">Nessuna voce trovata</p>
            <p class="empty-desc">Aggiungi i tuoi servizi ricorrenti per inserirli con un clic nei preventivi.</p>
            <button type="button" class="btn btn-primary" data-action="add-price-item">+ Aggiungi prima voce</button>
          </div>`
    }

    <datalist id="dl-pl-cats">${cats.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
    <datalist id="dl-pl-units">${units.map((u) => `<option value="${esc(u)}">`).join("")}</datalist>
  `;
}

export function initPriceListView() {
  const container = document.getElementById("pricelist-view-root");
  if (!container) return;

  container.addEventListener("input", (e) => {
    if (e.target.id === "pricelist-search-input") {
      const pos = e.target.selectionStart;
      actions.setPriceListSearch(e.target.value);
      const next = document.getElementById("pricelist-search-input");
      if (next) {
        next.focus();
        if (pos !== null) next.setSelectionRange(pos, pos);
      }
      return;
    }

    const row = e.target.closest("tr[data-item-id]");
    const field = e.target.dataset.field;
    if (!row || !field) return;

    const id = row.dataset.itemId;
    const item = getState().priceList.find((v) => v.id === id);
    if (!item) return;

    const updated = { ...item };
    if (field === "prezzo") {
      updated.prezzo = Math.max(0, parseFloat(e.target.value) || 0);
    } else {
      updated[field] = e.target.value;
    }

    // Aggiorna in-place senza ri-renderizzare il DOM mentre l'utente sta scrivendo
    item[field] = updated[field];
    if (String(updated.nome || "").trim().length >= 1) {
      schedulePriceItemSave(updated);
    }
  });

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === "add-price-item") {
      const list = getState().priceList;
      const newItem = {
        id: generaId("voc"),
        cat: "",
        nome: "Nuova voce",
        desc: "",
        unita: "giornata",
        prezzo: 0,
        ordine: list.length + 1,
        attivo: true,
        creato: new Date().toISOString(),
        modificato: new Date().toISOString(),
      };
      actions.setPriceListSearch("");
      schedulePriceItemSave(newItem);
      renderPriceListView();
      const input = container.querySelector(`tr[data-item-id="${newItem.id}"] .pl-nome-input`);
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        input.focus();
        input.select();
      }
      return;
    }

    if (action === "print-pricelist") {
      const st = getState();
      await printPriceListDocument(st.priceList, st.issuer);
      return;
    }

    if (action === "delete-price-item") {
      const id = btn.dataset.id;
      const item = getState().priceList.find((v) => v.id === id);
      const ok = await confirmModal({
        title: "Elimina voce di listino",
        message: `Eliminare «${item?.nome || "questa voce"}» dal catalogo?`,
        confirmLabel: "Elimina",
        danger: true,
      });
      if (!ok) return;
      await deletePriceItemFromCloud(id);
      showToast("Voce eliminata dal listino.");
    }
  });
}
