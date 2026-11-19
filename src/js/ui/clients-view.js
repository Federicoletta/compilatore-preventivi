/**
 * Vista Rubrica Clienti (CRM) Cloud-First.
 * - Collegamento relazionale tramite clienteId (con fallback retrocompatibile su nome/piva normalizzati)
 * - KPI calcolati con motore fiscale puro (calcolaTotali)
 * - CRUD completo con modale custom (cf, sdi, pec, note)
 */

import { calcolaTotali } from "../calculations.js";
import { dataBreve, esc, euro, generaId, normalizzaChiave } from "../formatters.js";
import { actions, getActiveQuotes, getState } from "../store.js";
import { deleteClientFromCloud, saveClientToCloud } from "../firebase-sync.js";
import { confirmModal, openModal, showToast } from "./modal.js";

function findQuotesForClient(client, quotes) {
  const cKey = normalizzaChiave(client.nome);
  const cPiva = normalizzaChiave(client.piva);
  return quotes.filter((q) => {
    if (q.cliente?.clienteId && q.cliente.clienteId === client.id) return true;
    const qPiva = normalizzaChiave(q.cliente?.piva);
    if (cPiva && qPiva && cPiva === qPiva) return true;
    const qKey = normalizzaChiave(q.cliente?.nome);
    return Boolean(cKey && qKey && cKey === qKey);
  });
}

async function openClientModal(existing = null, { onOpenQuote } = {}) {
  const isEdit = Boolean(existing);
  const c = existing || {
    id: generaId("cli"),
    nome: "",
    ref: "",
    indirizzo: "",
    piva: "",
    cf: "",
    sdi: "",
    pec: "",
    email: "",
    tel: "",
    note: "",
  };

  const linkedQuotes = isEdit ? findQuotesForClient(c, getActiveQuotes()) : [];

  const historyHtml = linkedQuotes.length
    ? `<div class="client-history">
         <h4 class="modal-section-title">Storico preventivi (${linkedQuotes.length})</h4>
         <ul class="history-list">
           ${linkedQuotes
             .slice(0, 8)
             .map((q) => {
               const net = calcolaTotali(q).netto;
               return `<li>
                 <button type="button" class="history-row" data-open-linked-quote="${esc(q.id)}">
                   <span class="mono-num">${esc(q.numero)}</span>
                   <span class="history-title">${esc(q.progetto?.titolo || "Senza titolo")}</span>
                   <span class="history-date">${esc(dataBreve(q.data))}</span>
                   <span class="history-amount">${euro(net)}</span>
                 </button>
               </li>`;
             })
             .join("")}
         </ul>
       </div>`
    : "";

  await openModal({
    title: isEdit ? `Modifica cliente — ${c.nome}` : "Nuovo cliente",
    subtitle: "I dati fiscali vengono sincronizzati su Cloud e suggeriti automaticamente nell'editor.",
    size: "md",
    bodyHtml: `
      <form id="client-crud-form" class="modal-form-grid">
        <div class="field span-2">
          <label for="cm-nome">Ragione sociale o Nome *</label>
          <input id="cm-nome" class="field-input" required maxlength="200" value="${esc(c.nome)}" placeholder="Es. Produzioni Roma S.r.l.">
        </div>
        <div class="field">
          <label for="cm-ref">Referente</label>
          <input id="cm-ref" class="field-input" maxlength="200" value="${esc(c.ref)}" placeholder="Es. Marco Rossi">
        </div>
        <div class="field">
          <label for="cm-email">Email</label>
          <input id="cm-email" type="email" class="field-input" maxlength="150" value="${esc(c.email)}" placeholder="nome@azienda.it">
        </div>
        <div class="field">
          <label for="cm-tel">Telefono</label>
          <input id="cm-tel" class="field-input" maxlength="50" value="${esc(c.tel)}" placeholder="+39 …">
        </div>
        <div class="field">
          <label for="cm-piva">Partita IVA</label>
          <input id="cm-piva" class="field-input" maxlength="50" value="${esc(c.piva)}" placeholder="IT01234567890">
        </div>
        <div class="field">
          <label for="cm-cf">Codice Fiscale</label>
          <input id="cm-cf" class="field-input" maxlength="50" value="${esc(c.cf)}">
        </div>
        <div class="field">
          <label for="cm-sdi">Codice Univoco SDI</label>
          <input id="cm-sdi" class="field-input" maxlength="20" value="${esc(c.sdi)}" placeholder="7 caratteri">
        </div>
        <div class="field span-2">
          <label for="cm-pec">PEC</label>
          <input id="cm-pec" type="email" class="field-input" maxlength="150" value="${esc(c.pec)}" placeholder="azienda@pec.it">
        </div>
        <div class="field span-2">
          <label for="cm-indirizzo">Indirizzo sede legale</label>
          <input id="cm-indirizzo" class="field-input" maxlength="300" value="${esc(c.indirizzo)}" placeholder="Via, CAP, Città">
        </div>
        <div class="field span-2">
          <label for="cm-note">Note interne</label>
          <textarea id="cm-note" class="field-input" rows="2" maxlength="2000" placeholder="Condizioni concordate, preferenze, contatti amministrativi…">${esc(c.note)}</textarea>
        </div>
      </form>
      ${historyHtml}
    `,
    onMount(dialog, finish) {
      dialog.querySelectorAll("[data-open-linked-quote]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const q = getState().quotes.find((x) => x.id === btn.dataset.openLinkedQuote);
          if (q) {
            finish(null);
            onOpenQuote?.(q);
          }
        });
      });
    },
    buttons: [
      { label: "Annulla", value: null, variant: "ghost" },
      {
        label: isEdit ? "Salva modifiche" : "Crea cliente",
        value: "save",
        variant: "primary",
        async onClick(dialog) {
          const nome = dialog.querySelector("#cm-nome")?.value.trim() || "";
          if (!nome) {
            dialog.querySelector("#cm-nome")?.focus();
            showToast("Inserisci la ragione sociale o il nome del cliente.", { type: "error" });
            return false;
          }
          const payload = {
            ...c,
            nome,
            ref: dialog.querySelector("#cm-ref")?.value.trim() || "",
            email: dialog.querySelector("#cm-email")?.value.trim() || "",
            tel: dialog.querySelector("#cm-tel")?.value.trim() || "",
            piva: dialog.querySelector("#cm-piva")?.value.trim() || "",
            cf: dialog.querySelector("#cm-cf")?.value.trim() || "",
            sdi: dialog.querySelector("#cm-sdi")?.value.trim().toUpperCase() || "",
            pec: dialog.querySelector("#cm-pec")?.value.trim() || "",
            indirizzo: dialog.querySelector("#cm-indirizzo")?.value.trim() || "",
            note: dialog.querySelector("#cm-note")?.value.trim() || "",
          };
          await saveClientToCloud(payload);
          showToast(isEdit ? "Scheda cliente aggiornata." : "Nuovo cliente salvato nel Cloud.", {
            type: "success",
          });
          return true;
        },
      },
    ],
  });
}

async function syncClientsFromArchiveQuotes() {
  const activeQuotes = getActiveQuotes();
  const existing = getState().clients;
  const knownKeys = new Set(existing.map((c) => normalizzaChiave(c.nome)));

  let added = 0;
  for (const q of activeQuotes) {
    const nome = String(q.cliente?.nome || "").trim();
    if (!nome) continue;
    const key = normalizzaChiave(nome);
    if (!key || knownKeys.has(key)) continue;
    knownKeys.add(key);
    await saveClientToCloud({
      id: generaId("cli"),
      nome,
      ref: q.cliente?.ref || "",
      indirizzo: q.cliente?.indirizzo || "",
      piva: q.cliente?.piva || "",
      cf: q.cliente?.cf || "",
      sdi: q.cliente?.sdi || "",
      pec: q.cliente?.pec || "",
      email: q.cliente?.email || "",
      tel: q.cliente?.tel || "",
      note: "",
    });
    added += 1;
  }

  if (added > 0) {
    showToast(`Importati ${added} nuovi clienti dai preventivi in archivio.`, { type: "success" });
  } else {
    showToast("Tutti i clienti presenti nei preventivi sono già in rubrica.");
  }
}

export function renderClientsView() {
  const container = document.getElementById("clients-view-root");
  if (!container) return;

  const st = getState();
  const clients = st.clients.slice().sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "it"));
  const activeQuotes = getActiveQuotes();
  const q = st.clientSearch.trim().toLowerCase();

  const filtered = clients.filter((c) => {
    if (!q) return true;
    const hay = [c.nome, c.ref, c.email, c.piva, c.cf, c.tel, c.indirizzo].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });

  let totalAcceptedAll = 0;
  let totalPipelineAll = 0;
  const statsByClient = new Map();
  for (const c of clients) {
    const linked = findQuotesForClient(c, activeQuotes);
    let accepted = 0;
    let total = 0;
    for (const quote of linked) {
      const net = calcolaTotali(quote).netto;
      total += net;
      if (quote.stato === "accettato") accepted += net;
    }
    totalAcceptedAll += accepted;
    totalPipelineAll += total;
    statsByClient.set(c.id, { count: linked.length, accepted, total });
  }

  const bodyHtml = filtered.length
    ? `<div class="table-card">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cliente &amp; Referente</th>
                <th>Contatti</th>
                <th>Dati Fiscali</th>
                <th class="num">Preventivi</th>
                <th class="num">Accettati</th>
                <th class="num">Azioni</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map((c) => {
                  const s = statsByClient.get(c.id) || { count: 0, accepted: 0, total: 0 };
                  return `<tr>
                    <td>
                      <div class="row-title">${esc(c.nome)}</div>
                      ${c.ref ? `<div class="row-sub">Ref: ${esc(c.ref)}</div>` : ""}
                    </td>
                    <td>
                      <div class="row-sub">${esc(c.email || "—")}</div>
                      ${c.tel ? `<div class="row-sub">${esc(c.tel)}</div>` : ""}
                    </td>
                    <td>
                      <div class="row-sub">${c.piva ? `P. IVA ${esc(c.piva)}` : c.cf ? `C.F. ${esc(c.cf)}` : "—"}</div>
                      ${c.sdi ? `<div class="row-sub">SDI ${esc(c.sdi)}</div>` : ""}
                    </td>
                    <td class="num">${s.count}</td>
                    <td class="col-amount">${euro(s.accepted)}</td>
                    <td class="col-actions">
                      <div class="row-actions">
                        <button type="button" class="btn btn-secondary btn-sm" data-action="quote-for-client" data-id="${esc(c.id)}">+ Preventivo</button>
                        <button type="button" class="icon-btn" data-action="edit-client" data-id="${esc(c.id)}" title="Modifica cliente">Modifica</button>
                        <button type="button" class="icon-btn icon-danger" data-action="delete-client" data-id="${esc(c.id)}" title="Elimina cliente">✕</button>
                      </div>
                    </td>
                  </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>`
    : `<div class="empty-state">
        <p class="empty-title">Nessun cliente in rubrica</p>
        <p class="empty-desc">Crea una scheda cliente o importa automaticamente i clienti dai preventivi già presenti in archivio.</p>
        <div class="empty-actions">
          <button type="button" class="btn btn-secondary" data-action="sync-from-quotes">Importa dai preventivi</button>
          <button type="button" class="btn btn-primary" data-action="new-client">+ Nuovo cliente</button>
        </div>
      </div>`;

  container.innerHTML = `
    <div class="view-header">
      <div>
        <h1 class="view-title">Rubrica Clienti</h1>
        <p class="view-subtitle">Anagrafica CRM collegata ai preventivi tramite ID relazionale · ${clients.length} clienti</p>
      </div>
      <div class="view-header-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-action="sync-from-quotes">Aggiorna dai preventivi</button>
        <button type="button" class="btn btn-primary" data-action="new-client">+ Nuovo cliente</button>
      </div>
    </div>

    <div class="kpi-grid kpi-grid-3">
      <div class="kpi-card">
        <span class="kpi-label">Clienti registrati</span>
        <strong class="kpi-value">${clients.length}</strong>
        <span class="kpi-meta">Sincronizzati su Firestore</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Volume accettato</span>
        <strong class="kpi-value">${euro(totalAcceptedAll)}</strong>
        <span class="kpi-meta">Somma preventivi confermati</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Volume preventivato</span>
        <strong class="kpi-value">${euro(totalPipelineAll)}</strong>
        <span class="kpi-meta">Storico complessivo attivo</span>
      </div>
    </div>

    <div class="toolbar-card">
      <input type="search" id="client-search-input" class="field-input search-input" placeholder="Cerca ragione sociale, referente, P. IVA, email…" value="${esc(st.clientSearch)}" aria-label="Cerca clienti">
    </div>

    ${bodyHtml}
  `;
}

export function initClientsView({ onOpenQuote }) {
  const container = document.getElementById("clients-view-root");
  if (!container) return;

  container.addEventListener("input", (e) => {
    if (e.target.id === "client-search-input") {
      const pos = e.target.selectionStart;
      actions.setClientSearch(e.target.value);
      const next = document.getElementById("client-search-input");
      if (next) {
        next.focus();
        if (pos !== null) next.setSelectionRange(pos, pos);
      }
    }
  });

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const st = getState();

    if (action === "new-client") {
      await openClientModal(null, { onOpenQuote });
    } else if (action === "sync-from-quotes") {
      await syncClientsFromArchiveQuotes();
    } else if (action === "edit-client") {
      const c = st.clients.find((x) => x.id === id);
      if (c) await openClientModal(c, { onOpenQuote });
    } else if (action === "quote-for-client") {
      const c = st.clients.find((x) => x.id === id);
      if (!c) return;
      actions.newQuote(c);
      actions.setActiveView("editor");
      showToast(`Nuovo preventivo precompilato per ${c.nome}.`);
    } else if (action === "delete-client") {
      const c = st.clients.find((x) => x.id === id);
      if (!c) return;
      const ok = await confirmModal({
        title: "Elimina cliente",
        message: `Eliminare «${c.nome}» dalla rubrica? I preventivi esistenti resteranno intatti in archivio.`,
        confirmLabel: "Elimina",
        danger: true,
      });
      if (!ok) return;
      await deleteClientFromCloud(id);
      showToast("Cliente eliminato dalla rubrica.");
    }
  });
}
