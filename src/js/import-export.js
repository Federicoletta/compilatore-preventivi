/**
 * Import / Export JSON (singolo preventivo e backup completo).
 * - Validazione schema tramite validator.js
 * - Conflitto ID/numero su import singolo preventivo: modale dedicata (Crea nuova copia vs Sovrascrivi esistente)
 * - Sincronizzazione immediata su Firestore
 */

import { aIsoLocale, esc, generaId, sanitizzaNomeFile } from "./formatters.js";
import { actions, getState } from "./store.js";
import { saveQuoteToCloud, syncImportedBackupToCloud } from "./firebase-sync.js";
import { alertModal, choiceModal, confirmModal, showToast } from "./ui/modal.js";
import { prossimoNumero, sanificaPreventivo, validaImportJSON } from "./validator.js";

function downloadJsonFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportSingleQuoteJson(quote) {
  if (!quote) return;
  const num = sanitizzaNomeFile(quote.numero || "Preventivo");
  const cl = sanitizzaNomeFile(quote.cliente?.nome || "");
  const name = `Preventivo_${num}${cl ? `_${cl}` : ""}.json`;
  downloadJsonFile(quote, name);
  showToast(`Esportato ${name}`, { type: "success" });
}

export function exportFullBackupJson() {
  const st = getState();
  const payload = {
    version: "2.0.0",
    exportedAt: new Date().toISOString(),
    preventivi: st.quotes,
    clienti: st.clients,
    listino: st.priceList,
    io: st.issuer,
  };
  const filename = `FC_Backup_Preventivi_${aIsoLocale(new Date())}.json`;
  downloadJsonFile(payload, filename);
  showToast(`Backup esportato (${st.quotes.length} preventivi, ${st.clients.length} clienti).`, {
    type: "success",
  });
}

export async function handleJsonFileImport(file) {
  if (!file) return;

  let parsed;
  try {
    const text = await file.text();
    parsed = JSON.parse(text);
  } catch {
    await alertModal("File non valido", "Il file selezionato non è un documento JSON leggibile.");
    return;
  }

  const check = validaImportJSON(parsed);
  if (!check.ok) {
    await alertModal("Importazione non riuscita", check.error);
    return;
  }

  if (check.type === "single") {
    await importSingleQuote(check.quote);
    return;
  }

  // Backup completo
  const ok = await confirmModal({
    title: "Importa backup completo",
    message: `Il file contiene ${check.preventivi.length} preventivi, ${check.clienti.length} clienti e ${check.listino.length} voci di listino. I dati verranno uniti e sincronizzati sul Cloud.`,
    confirmLabel: "Importa e sincronizza",
    cancelLabel: "Annulla",
  });
  if (!ok) return;

  await syncImportedBackupToCloud({
    preventivi: check.preventivi,
    clienti: check.clienti,
    listino: check.listino,
    io: check.io,
  });

  showToast("Backup importato e sincronizzato sul Cloud.", { type: "success" });
}

async function importSingleQuote(incomingQuote) {
  const allQuotes = getState().quotes;
  const conflict = allQuotes.find(
    (q) =>
      q.id === incomingQuote.id ||
      (incomingQuote.numero &&
        String(q.numero || "").trim().toLowerCase() ===
          String(incomingQuote.numero || "").trim().toLowerCase())
  );

  let finalQuote = sanificaPreventivo(incomingQuote);

  if (conflict) {
    const choice = await choiceModal({
      title: "Preventivo già presente in archivio",
      message: `Esiste già un preventivo corrispondente (N. ${conflict.numero}${conflict.cliente?.nome ? ` — ${conflict.cliente.nome}` : ""}). Come vuoi procedere?`,
      choices: [
        { label: "Annulla", value: "cancel", variant: "ghost" },
        { label: "Sovrascrivi esistente", value: "overwrite", variant: "danger" },
        { label: "Crea nuova copia", value: "copy", variant: "primary" },
      ],
    });

    if (!choice || choice === "cancel") return;

    if (choice === "copy") {
      finalQuote = sanificaPreventivo({
        ...incomingQuote,
        id: generaId("p"),
        numero: prossimoNumero(allQuotes),
        stato: "bozza",
        cestinato: false,
        eliminatoIl: null,
        modificato: new Date().toISOString(),
      });
    } else if (choice === "overwrite") {
      finalQuote = sanificaPreventivo({
        ...incomingQuote,
        id: conflict.id,
        cestinato: false,
        eliminatoIl: null,
        modificato: new Date().toISOString(),
      });
    }
  } else {
    finalQuote = sanificaPreventivo({
      ...incomingQuote,
      cestinato: false,
      eliminatoIl: null,
      modificato: new Date().toISOString(),
    });
  }

  actions.loadQuoteIntoEditor(finalQuote, { persisted: true });
  actions.setActiveView("editor");
  await saveQuoteToCloud(finalQuote);
  showToast(`Preventivo ${esc(finalQuote.numero)} importato e aperto nell'editor.`, {
    type: "success",
  });
}
