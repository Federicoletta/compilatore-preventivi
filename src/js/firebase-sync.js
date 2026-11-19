/**
 * Modulo Sincronizzazione Cloud-First su Firebase Firestore.
 * - Real-time onSnapshot su /preventivi, /clienti, /listino, /config/impostazioni
 * - Fix bug eliminazione ultimo cliente / ultimo preventivo (sincronizza anche snapshot vuoti da server)
 * - Autosave automatico 1000ms debounce con creazione bozza pigra (solo alla prima modifica reale)
 * - Debounce 800ms per modifiche listino
 * - Cestino 100% Cloud (cestinato: true/false, eliminatoIl) senza localStorage legacy
 * - 100% conforme a /firestore.rules
 */

import { getFirestoreDb } from "./firebase-config.js";
import { actions, getState, hasQuoteMeaningfulContent } from "./store.js";
import {
  deserializeQuoteFromFirestore,
  serializeClientForFirestore,
  serializePriceItemForFirestore,
  serializeQuoteForFirestore,
} from "./validator.js";

const AUTOSAVE_DEBOUNCE_MS = 1000;
const PRICE_LIST_DEBOUNCE_MS = 800;

let _listenersStarted = false;
let _autosaveTimer = null;
let _lastSavedHashes = new Map();
const _priceItemTimers = new Map();

function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function hasLiveCloudSession() {
  const user = getState().user;
  if (!user) return false;
  // In Sessione Studio locale senza token Firebase Auth, le scritture Firestore verrebbero rifiutate dalle rules
  if (user.isDevSession) return false;
  return Boolean(getFirestoreDb());
}

/**
 * Attiva i listener real-time Firestore sulle 4 collezioni.
 */
export function startRealtimeSync() {
  if (_listenersStarted) return;

  // In Sessione Studio (dev bypass senza auth Firebase reale), lavoriamo sulla cache locale reattiva
  if (!hasLiveCloudSession()) {
    actions.setSyncStatus(isOffline() ? "offline" : "saved", "Sessione locale");
    return;
  }

  const db = getFirestoreDb();
  if (!db) return;
  _listenersStarted = true;

  // 1. /preventivi
  db.collection("preventivi").onSnapshot(
    { includeMetadataChanges: true },
    (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        if (d && d.id) {
          items.push(deserializeQuoteFromFirestore(d));
        }
      });

      // Aggiorna sempre se ci sono dati OPPURE se lo snapshot vuoto arriva dal server (non cache vuota)
      if (items.length > 0 || !snapshot.metadata.fromCache) {
        actions.setQuotes(items);
      }

      if (snapshot.metadata.hasPendingWrites || isOffline()) {
        actions.setSyncStatus("offline", "Salvato offline");
      } else {
        actions.setSyncStatus("saved", "Salvato");
      }
    },
    (err) => {
      console.warn("[Firestore] Errore listener /preventivi:", err);
      actions.setSyncStatus(isOffline() ? "offline" : "error", "Errore sincronizzazione");
    }
  );

  // 2. /clienti (FIX: aggiorna lo store anche quando l'ultimo cliente viene eliminato)
  db.collection("clienti").onSnapshot(
    { includeMetadataChanges: true },
    (snapshot) => {
      const clients = [];
      snapshot.forEach((doc) => {
        const c = doc.data();
        if (c && c.id) clients.push(c);
      });
      if (clients.length > 0 || !snapshot.metadata.fromCache) {
        actions.setClients(clients);
      }
    },
    (err) => {
      console.warn("[Firestore] Errore listener /clienti:", err);
    }
  );

  // 3. /listino
  db.collection("listino").onSnapshot(
    { includeMetadataChanges: true },
    (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        const v = doc.data();
        if (v && v.nome) items.push(v);
      });
      if (items.length > 0 || !snapshot.metadata.fromCache) {
        actions.setPriceList(items);
      }
    },
    (err) => {
      console.warn("[Firestore] Errore listener /listino:", err);
    }
  );

  // 4. /config/impostazioni (dati emittente)
  db.collection("config")
    .doc("impostazioni")
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data?.data && typeof data.data === "object") {
            actions.setIssuer(data.data);
          }
        }
      },
      (err) => {
        console.warn("[Firestore] Errore listener /config/impostazioni:", err);
      }
    );
}

/**
 * Pianifica autosave del preventivo corrente (debounce 1000ms).
 */
export function scheduleQuoteAutosave() {
  const st = getState();
  if (!st.isDraftPersisted && !hasQuoteMeaningfulContent(st.currentQuote)) {
    return;
  }

  clearTimeout(_autosaveTimer);
  actions.setSyncStatus(isOffline() ? "offline" : "saving", isOffline() ? "Offline" : "Salvataggio...");

  _autosaveTimer = setTimeout(() => {
    flushQuoteAutosave();
  }, AUTOSAVE_DEBOUNCE_MS);
}

/**
 * Esegue il salvataggio immediato del preventivo corrente (usato anche su cambio vista / chiusura scheda).
 */
export async function flushQuoteAutosave({ force = false } = {}) {
  clearTimeout(_autosaveTimer);
  _autosaveTimer = null;

  const st = getState();
  const quote = st.currentQuote;
  if (!quote || !quote.id) return false;

  // Creazione pigra: non creare documenti vuoti in Firestore finché non esiste almeno 1 dato reale
  if (!st.isDraftPersisted && !force && !hasQuoteMeaningfulContent(quote)) {
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
    return false;
  }

  const payload = serializeQuoteForFirestore(quote);
  const hashKey = JSON.stringify({ ...payload, modificato: "" });
  if (!force && _lastSavedHashes.get(payload.id) === hashKey) {
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
    return true;
  }

  // Aggiorna sempre la lista locale in memoria per UX istantanea
  actions.upsertQuoteInList(payload);

  if (!hasLiveCloudSession()) {
    _lastSavedHashes.set(payload.id, hashKey);
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
    return true;
  }

  const db = getFirestoreDb();
  actions.setSyncStatus(isOffline() ? "offline" : "saving");

  try {
    await db.collection("preventivi").doc(payload.id).set(payload, { merge: true });
    _lastSavedHashes.set(payload.id, hashKey);
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
    return true;
  } catch (err) {
    console.error("[Firestore] Errore salvataggio preventivo:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error", err?.code || "Errore sync");
    return false;
  }
}

export async function saveQuoteToCloud(quote) {
  const payload = serializeQuoteForFirestore(quote);
  actions.upsertQuoteInList(payload);
  if (!hasLiveCloudSession()) return true;

  const db = getFirestoreDb();
  actions.setSyncStatus("saving");
  try {
    await db.collection("preventivi").doc(payload.id).set(payload, { merge: true });
    _lastSavedHashes.set(payload.id, JSON.stringify({ ...payload, modificato: "" }));
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
    return true;
  } catch (err) {
    console.error("[Firestore] Errore saveQuoteToCloud:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
    return false;
  }
}

export async function updateQuoteStatus(ids, stato) {
  const list = Array.isArray(ids) ? ids : [ids];
  if (list.length === 0) return;

  const now = new Date().toISOString();
  const updatedQuotes = getState().quotes.map((q) =>
    list.includes(q.id) ? { ...q, stato, modificato: now } : q
  );
  actions.setQuotes(updatedQuotes);

  if (list.includes(getState().currentQuote.id)) {
    actions.updateCurrentQuote((q) => {
      q.stato = stato;
    }, { triggerAutosave: false });
  }

  if (!hasLiveCloudSession()) return;
  const db = getFirestoreDb();
  actions.setSyncStatus("saving");
  try {
    const batch = db.batch();
    list.forEach((id) => {
      batch.set(db.collection("preventivi").doc(id), { stato, modificato: now }, { merge: true });
    });
    await batch.commit();
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
  } catch (err) {
    console.error("[Firestore] Errore updateQuoteStatus:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
  }
}

export async function moveQuotesToTrash(ids) {
  const list = Array.isArray(ids) ? ids : [ids];
  if (list.length === 0) return;

  const now = new Date().toISOString();
  const updatedQuotes = getState().quotes.map((q) =>
    list.includes(q.id) ? { ...q, cestinato: true, eliminatoIl: now, modificato: now } : q
  );
  actions.setQuotes(updatedQuotes);

  if (!hasLiveCloudSession()) return;
  const db = getFirestoreDb();
  actions.setSyncStatus("saving");
  try {
    const batch = db.batch();
    list.forEach((id) => {
      batch.set(
        db.collection("preventivi").doc(id),
        { cestinato: true, eliminatoIl: now, modificato: now },
        { merge: true }
      );
    });
    await batch.commit();
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
  } catch (err) {
    console.error("[Firestore] Errore moveQuotesToTrash:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
  }
}

export async function restoreQuotesFromTrash(ids) {
  const list = Array.isArray(ids) ? ids : [ids];
  if (list.length === 0) return;

  const now = new Date().toISOString();
  const updatedQuotes = getState().quotes.map((q) =>
    list.includes(q.id) ? { ...q, cestinato: false, eliminatoIl: null, modificato: now } : q
  );
  actions.setQuotes(updatedQuotes);

  if (!hasLiveCloudSession()) return;
  const db = getFirestoreDb();
  actions.setSyncStatus("saving");
  try {
    const batch = db.batch();
    list.forEach((id) => {
      batch.set(
        db.collection("preventivi").doc(id),
        { cestinato: false, eliminatoIl: null, modificato: now },
        { merge: true }
      );
    });
    await batch.commit();
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
  } catch (err) {
    console.error("[Firestore] Errore restoreQuotesFromTrash:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
  }
}

export async function deleteQuotesPermanently(ids) {
  const list = Array.isArray(ids) ? ids : [ids];
  if (list.length === 0) return;

  actions.removeQuotesFromList(list);

  if (!hasLiveCloudSession()) return;
  const db = getFirestoreDb();
  actions.setSyncStatus("saving");
  try {
    const batch = db.batch();
    list.forEach((id) => {
      batch.delete(db.collection("preventivi").doc(id));
    });
    await batch.commit();
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
  } catch (err) {
    console.error("[Firestore] Errore deleteQuotesPermanently:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
  }
}

/* ================== Clienti ================== */
export async function saveClientToCloud(rawClient) {
  const client = serializeClientForFirestore({
    ...rawClient,
    modificato: new Date().toISOString(),
  });
  if (!client) return null;

  const existing = getState().clients.slice();
  const idx = existing.findIndex((c) => c.id === client.id);
  if (idx >= 0) existing[idx] = client;
  else existing.push(client);
  actions.setClients(existing);

  if (!hasLiveCloudSession()) return client;
  const db = getFirestoreDb();
  actions.setSyncStatus("saving");
  try {
    await db.collection("clienti").doc(client.id).set(client, { merge: true });
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
  } catch (err) {
    console.error("[Firestore] Errore saveClientToCloud:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
  }
  return client;
}

export async function deleteClientFromCloud(clientId) {
  if (!clientId) return;
  const next = getState().clients.filter((c) => c.id !== clientId);
  actions.setClients(next);

  if (!hasLiveCloudSession()) return;
  const db = getFirestoreDb();
  actions.setSyncStatus("saving");
  try {
    await db.collection("clienti").doc(clientId).delete();
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
  } catch (err) {
    console.error("[Firestore] Errore deleteClientFromCloud:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
  }
}

/* ================== Listino (Debounced 800ms) ================== */
export function schedulePriceItemSave(item) {
  const safe = serializePriceItemForFirestore({
    ...item,
    modificato: new Date().toISOString(),
  });
  if (!safe) return;

  const list = getState().priceList.slice();
  const idx = list.findIndex((v) => v.id === safe.id);
  if (idx >= 0) list[idx] = safe;
  else list.push(safe);
  actions.setPriceList(list);

  if (!hasLiveCloudSession()) return;

  clearTimeout(_priceItemTimers.get(safe.id));
  actions.setSyncStatus(isOffline() ? "offline" : "saving");

  const timer = setTimeout(async () => {
    _priceItemTimers.delete(safe.id);
    const db = getFirestoreDb();
    try {
      await db.collection("listino").doc(safe.id).set(safe, { merge: true });
      actions.setSyncStatus(isOffline() ? "offline" : "saved");
    } catch (err) {
      console.error("[Firestore] Errore salvataggio voce listino:", err);
      actions.setSyncStatus(isOffline() ? "offline" : "error");
    }
  }, PRICE_LIST_DEBOUNCE_MS);

  _priceItemTimers.set(safe.id, timer);
}

export async function deletePriceItemFromCloud(itemId) {
  if (!itemId) return;
  clearTimeout(_priceItemTimers.get(itemId));
  _priceItemTimers.delete(itemId);

  const next = getState().priceList.filter((v) => v.id !== itemId);
  actions.setPriceList(next);

  if (!hasLiveCloudSession()) return;
  const db = getFirestoreDb();
  actions.setSyncStatus("saving");
  try {
    await db.collection("listino").doc(itemId).delete();
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
  } catch (err) {
    console.error("[Firestore] Errore deletePriceItemFromCloud:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
  }
}

/* ================== Impostazioni Emittente ================== */
export async function saveIssuerToCloud(issuer) {
  const clean = {
    cf: String(issuer?.cf || "").trim(),
    piva: String(issuer?.piva || "").trim(),
    iban: String(issuer?.iban || "").trim(),
    indirizzo: String(issuer?.indirizzo || "").trim(),
  };
  actions.setIssuer(clean);

  if (!hasLiveCloudSession()) return true;
  const db = getFirestoreDb();
  actions.setSyncStatus("saving");
  try {
    await db
      .collection("config")
      .doc("impostazioni")
      .set(
        {
          data: clean,
          modificato: new Date().toISOString(),
        },
        { merge: true }
      );
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
    return true;
  } catch (err) {
    console.error("[Firestore] Errore saveIssuerToCloud:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
    return false;
  }
}

/* ================== Batch Import Backup ================== */
export async function syncImportedBackupToCloud({ preventivi = [], clienti = [], listino = [], io = null }) {
  if (io) await saveIssuerToCloud(io);

  if (preventivi.length) {
    const mergedMap = new Map(getState().quotes.map((q) => [q.id, q]));
    preventivi.forEach((q) => mergedMap.set(q.id, q));
    actions.setQuotes([...mergedMap.values()]);
  }
  if (clienti.length) {
    const mergedMap = new Map(getState().clients.map((c) => [c.id, c]));
    clienti.forEach((c) => mergedMap.set(c.id, c));
    actions.setClients([...mergedMap.values()]);
  }
  if (listino.length) {
    const mergedMap = new Map(getState().priceList.map((v) => [v.id, v]));
    listino.forEach((v) => mergedMap.set(v.id, v));
    actions.setPriceList([...mergedMap.values()]);
  }

  if (!hasLiveCloudSession()) return true;

  const db = getFirestoreDb();
  actions.setSyncStatus("saving", "Importazione Cloud...");
  const CHUNK = 400;

  try {
    for (let i = 0; i < preventivi.length; i += CHUNK) {
      const batch = db.batch();
      preventivi.slice(i, i + CHUNK).forEach((q) => {
        const safe = serializeQuoteForFirestore(q);
        batch.set(db.collection("preventivi").doc(safe.id), safe, { merge: true });
      });
      await batch.commit();
    }
    for (let i = 0; i < clienti.length; i += CHUNK) {
      const batch = db.batch();
      clienti.slice(i, i + CHUNK).forEach((c) => {
        const safe = serializeClientForFirestore(c);
        if (safe) batch.set(db.collection("clienti").doc(safe.id), safe, { merge: true });
      });
      await batch.commit();
    }
    for (let i = 0; i < listino.length; i += CHUNK) {
      const batch = db.batch();
      listino.slice(i, i + CHUNK).forEach((v, idx) => {
        const safe = serializePriceItemForFirestore(v, i + idx + 1);
        if (safe) batch.set(db.collection("listino").doc(safe.id), safe, { merge: true });
      });
      await batch.commit();
    }
    actions.setSyncStatus(isOffline() ? "offline" : "saved");
    return true;
  } catch (err) {
    console.error("[Firestore] Errore syncImportedBackupToCloud:", err);
    actions.setSyncStatus(isOffline() ? "offline" : "error");
    return false;
  }
}

export function initSyncLifecycle() {
  window.addEventListener("online", () => {
    actions.setSyncStatus("saving", "Riconnessione...");
    flushQuoteAutosave().finally(() => {
      if (!isOffline()) actions.setSyncStatus("saved");
    });
  });

  window.addEventListener("offline", () => {
    actions.setSyncStatus("offline", "Offline");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && _autosaveTimer) {
      flushQuoteAutosave();
    }
  });

  window.addEventListener("pagehide", () => {
    if (_autosaveTimer) flushQuoteAutosave();
  });
}
