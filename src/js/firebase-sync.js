/**
 * Compilatore Preventivi — Modulo Sincronizzazione Cloud Firebase Firestore (v4.0 Cloud-First)
 * Gestione sincronizzazione nativa tramite SDK Firestore, Auto-Save continuo e persistenza IndexedDB.
 */
(function(window){
  "use strict";

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCB7tSAXM8SSFKKKjMeXsDK3sFMpyz2xUk",
    authDomain: "preventivi-federico-coletta.firebaseapp.com",
    projectId: "preventivi-federico-coletta",
    storageBucket: "preventivi-federico-coletta.firebasestorage.app",
    messagingSenderId: "226848240794",
    appId: "1:226848240794:web:32658649186bde08af1b23"
  };

  let db = null;
  let listenersAttivi = false;
  let statoSync = "in_attesa";
  let autoSaveTimer = null;
  const DEBOUNCE_MS = 1200;
  const ultimoHashSalvataggio = new Map(); // id -> string JSON per dirty-check
  let authToken = null; // per compatibilità retroattiva

  /* ================== Inizializzazione Firestore SDK ================== */
  function getDb() {
    if (!db && typeof firebase !== "undefined" && firebase.firestore) {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      db = firebase.firestore();
      try {
        db.enablePersistence({ synchronizeTabs: true }).catch(err => {
          if (err.code === "failed-precondition") {
            console.warn("[Firestore] Persistenza limitata a una sola scheda attiva.");
          } else if (err.code === "unimplemented") {
            console.warn("[Firestore] Il browser non supporta la persistenza IndexedDB.");
          }
        });
      } catch (e) {
        console.warn("[Firestore] enablePersistence non inizializzata:", e);
      }
    }
    return db;
  }

  /* ================== UI Badge di Stato ================== */
  function aggiornaBadge(stato, messaggio) {
    statoSync = stato;
    const btn = document.getElementById("btn-cloud-sync");
    const txt = document.getElementById("cloud-sync-txt");
    const dot = document.getElementById("cloud-sync-dot");
    if (!btn || !txt) return;

    btn.classList.remove("sync-ok", "sync-pending", "sync-offline", "sync-error");

    switch(stato) {
      case "sincronizzato":
        btn.classList.add("sync-ok");
        txt.textContent = "Salvato nel Cloud";
        btn.title = "Tutte le modifiche sono sincronizzate in tempo reale con Firebase Firestore.";
        if (dot) dot.style.background = "#10B981";
        break;
      case "in_corso":
        btn.classList.add("sync-pending");
        txt.textContent = messaggio || "Salvataggio...";
        btn.title = "Salvataggio in corso...";
        if (dot) dot.style.background = "#F59E0B";
        break;
      case "offline":
        btn.classList.add("sync-offline");
        txt.textContent = messaggio || "Salvato offline";
        btn.title = "Salvataggio completato nella memoria locale del browser. Verrà sincronizzato sul cloud non appena tornerà la connessione.";
        if (dot) dot.style.background = "#00B4D8";
        break;
      case "errore":
        btn.classList.add("sync-error");
        txt.textContent = "Errore Sync";
        btn.title = messaggio || "Errore di sincronizzazione.";
        if (dot) dot.style.background = "#F43F5E";
        break;
    }
  }

  /* ================== Listener Real-Time (onSnapshot) ================== */
  function attivaRealtimeListeners() {
    if (listenersAttivi) return;
    const firestore = getDb();
    if (!firestore) return;

    listenersAttivi = true;

    // 1. Collezione Preventivi (Sincronizzazione archivio e cestino con Safe Guard anti-wipe)
    firestore.collection("preventivi").onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
      const tutti = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d && d.id) {
          tutti.push(typeof sanificaPreventivo === "function" ? sanificaPreventivo(d) : d);
        }
      });

      if (tutti.length > 0) {
        salvaArchivio(tutti);
        if (typeof window.disegnaArchivio === "function") {
          window.disegnaArchivio();
        }
      } else if (snapshot.size === 0) {
        // Safe Guard: se il Cloud è vuoto ma in locale abbiamo dei preventivi, NON cancelliamo il locale!
        const locali = typeof archivio === "function" ? archivio() : [];
        if (locali.length > 0) {
          console.log("[FirebaseSync] Cloud vuoto ma trovati " + locali.length + " preventivi locali. Salvataggio preventivi locali su Cloud...");
          const batch = firestore.batch();
          locali.forEach(p => {
            if (p && p.id) {
              batch.set(firestore.collection("preventivi").doc(p.id), p, { merge: true });
            }
          });
          batch.commit().catch(e => console.warn("[FirebaseSync] Errore sync iniziale locale->cloud:", e));
        } else {
          salvaArchivio([]);
          if (typeof window.disegnaArchivio === "function") {
            window.disegnaArchivio();
          }
        }
      }

      if (snapshot.metadata.hasPendingWrites || !navigator.onLine) {
        aggiornaBadge("offline", "Salvato offline");
      } else {
        aggiornaBadge("sincronizzato");
      }
    }, (err) => {
      console.warn("[FirebaseSync] Errore listener preventivi:", err);
      aggiornaBadge("offline");
    });

    // 2. Collezione Clienti
    firestore.collection("clienti").onSnapshot((snapshot) => {
      const clienti = [];
      snapshot.forEach(doc => {
        const c = doc.data();
        if (c && c.id) clienti.push(c);
      });
      if (clienti.length > 0) {
        if (typeof salvaClienti === "function") {
          salvaClienti(clienti);
        }
        if (typeof disegnaClienti === "function") {
          disegnaClienti();
        }
      }
    }, (err) => {
      console.warn("[FirebaseSync] Errore listener clienti:", err);
    });

    // 3. Collezione Listino (Scorporata v4.0 come collezione di documenti autonomi)
    firestore.collection("listino").onSnapshot((snapshot) => {
      const items = [];
      snapshot.forEach(doc => {
        const v = doc.data();
        if (v && v.nome) {
          items.push(v);
        }
      });
      if (items.length > 0) {
        items.sort((a, b) => (Number(a.ordine) || 999) - (Number(b.ordine) || 999) || (a.nome || "").localeCompare(b.nome || ""));
        try {
          localStorage.setItem(CHIAVE_LISTINO, JSON.stringify(items));
          if (typeof aggiornaCacheListino === "function") aggiornaCacheListino(items);
          if (typeof disegnaListino === "function") disegnaListino();
          if (typeof aggiornaTendinaListino === "function") aggiornaTendinaListino();
        } catch(e) {}
      }
    }, (err) => {
      console.warn("[FirebaseSync] Errore listener listino:", err);
    });

    // 4. Configurazione Dati Emittente
    firestore.collection("config").doc("impostazioni").onSnapshot((doc) => {
      if (doc.exists) {
        const d = doc.data();
        if (d && d.data) {
          try {
            localStorage.setItem(CHIAVE_IO, JSON.stringify(d.data));
          } catch(e) {}
        }
      }
    }, (err) => {
      console.warn("[FirebaseSync] Errore listener impostazioni:", err);
    });

    // Esegui migrazione dati storica e migrazione listino
    eseguiMigrazioneOneTime();
    eseguiMigrazioneListinoCloud();
  }

  /* ================== Auto-Save Intelligente Stile Google Docs ================== */
  function pianificaAutoSave() {
    clearTimeout(autoSaveTimer);
    aggiornaBadge("in_corso", "Salvataggio...");
    autoSaveTimer = setTimeout(() => {
      eseguiSalvataggioImmediato(false);
    }, DEBOUNCE_MS);
  }

  async function eseguiSalvataggioImmediato(mostraToast = false) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;

    const firestore = getDb();
    if (!firestore) return false;

    const p = (typeof raccogli === "function") ? raccogli() : null;
    if (!p || !p.id) return false;

    // Guardia Anti-Bozze Vuote se è un nuovo preventivo non ancora salvato
    if (!window.corrente) {
      const clNome = (p.cliente?.nome || "").trim();
      const haVoci = (p.voci || []).some(v => (v.nome && v.nome.trim()) || (v.p && v.p > 0));
      if (!clNome && !haVoci) {
        aggiornaBadge("sincronizzato");
        return false; // Non salvare documenti vuoti
      }
      window.corrente = p.id;
      const btnElimina = document.getElementById("btn-elimina");
      if (btnElimina) btnElimina.style.display = "inline-block";
    }

    // Dirty-check: se il payload è identico a quello salvato precedentemente, salta la scrittura
    const pJson = JSON.stringify(p);
    if (ultimoHashSalvataggio.get(p.id) === pJson && !mostraToast) {
      aggiornaBadge("sincronizzato");
      return true;
    }

    aggiornaBadge("in_corso", "Salvataggio...");

    try {
      p.modificato = new Date().toISOString();
      await firestore.collection("preventivi").doc(p.id).set(p, { merge: true });
      ultimoHashSalvataggio.set(p.id, JSON.stringify(p));
      window.modificatoNonSalvato = false;
      aggiornaBadge("sincronizzato");

      if (mostraToast && typeof avviso === "function") {
        avviso("Preventivo " + (p.numero || "") + " salvato nel Cloud!");
      }
      return true;
    } catch (err) {
      console.error("[FirebaseSync] Errore durante il salvataggio:", err);
      aggiornaBadge("offline", "Salvato offline");
      return false;
    }
  }

  /* ================== Gestione Operazioni Cestino su Cloud ================== */
  async function spostaNelCestino(id) {
    if (!id) return;
    const firestore = getDb();
    if (!firestore) return;
    aggiornaBadge("in_corso", "Spostamento nel cestino...");
    try {
      const now = new Date().toISOString();
      await firestore.collection("preventivi").doc(id).set({
        cestinato: true,
        eliminatoIl: now,
        modificato: now
      }, { merge: true });
      aggiornaBadge("sincronizzato");
    } catch (e) {
      console.error("[FirebaseSync] Errore spostaNelCestino:", e);
      aggiornaBadge("offline");
    }
  }

  async function ripristinaDaCestino(id) {
    if (!id) return;
    const firestore = getDb();
    if (!firestore) return;
    aggiornaBadge("in_corso", "Ripristino in corso...");
    try {
      const now = new Date().toISOString();
      await firestore.collection("preventivi").doc(id).set({
        cestinato: false,
        eliminatoIl: null,
        modificato: now
      }, { merge: true });
      aggiornaBadge("sincronizzato");
    } catch (e) {
      console.error("[FirebaseSync] Errore ripristinaDaCestino:", e);
      aggiornaBadge("offline");
    }
  }

  async function eliminaDefinitivamente(id) {
    if (!id) return;
    const firestore = getDb();
    if (!firestore) return;
    aggiornaBadge("in_corso", "Eliminazione...");
    try {
      await firestore.collection("preventivi").doc(id).delete();
      aggiornaBadge("sincronizzato");
    } catch (e) {
      console.error("[FirebaseSync] Errore eliminaDefinitivamente:", e);
      aggiornaBadge("offline");
    }
  }

  async function spostaMultipliNelCestino(ids) {
    if (!ids || !ids.length) return;
    const firestore = getDb();
    if (!firestore) return;
    aggiornaBadge("in_corso", "Spostamento nel cestino...");
    try {
      const batch = firestore.batch();
      const now = new Date().toISOString();
      ids.forEach(id => {
        batch.set(firestore.collection("preventivi").doc(id), {
          cestinato: true,
          eliminatoIl: now,
          modificato: now
        }, { merge: true });
      });
      await batch.commit();
      aggiornaBadge("sincronizzato");
    } catch (e) {
      console.error("[FirebaseSync] Errore spostaMultipliNelCestino:", e);
      aggiornaBadge("offline");
    }
  }

  async function ripristinaMultipliDaCestino(ids) {
    if (!ids || !ids.length) return;
    const firestore = getDb();
    if (!firestore) return;
    aggiornaBadge("in_corso", "Ripristino...");
    try {
      const batch = firestore.batch();
      const now = new Date().toISOString();
      ids.forEach(id => {
        batch.set(firestore.collection("preventivi").doc(id), {
          cestinato: false,
          eliminatoIl: null,
          modificato: now
        }, { merge: true });
      });
      await batch.commit();
      aggiornaBadge("sincronizzato");
    } catch (e) {
      console.error("[FirebaseSync] Errore ripristinaMultipliDaCestino:", e);
      aggiornaBadge("offline");
    }
  }

  async function eliminaDefinitivoMultipli(ids) {
    if (!ids || !ids.length) return;
    const firestore = getDb();
    if (!firestore) return;
    aggiornaBadge("in_corso", "Eliminazione...");
    try {
      const batch = firestore.batch();
      ids.forEach(id => {
        batch.delete(firestore.collection("preventivi").doc(id));
      });
      await batch.commit();
      aggiornaBadge("sincronizzato");
    } catch (e) {
      console.error("[FirebaseSync] Errore eliminaDefinitivoMultipli:", e);
      aggiornaBadge("offline");
    }
  }

  async function cambiaStatoMultiplo(ids, nuovoStato) {
    if (!ids || !ids.length || !nuovoStato) return;
    const firestore = getDb();
    if (!firestore) return;
    aggiornaBadge("in_corso", "Aggiornamento stato...");
    try {
      const batch = firestore.batch();
      const now = new Date().toISOString();
      ids.forEach(id => {
        batch.set(firestore.collection("preventivi").doc(id), {
          stato: nuovoStato,
          modificato: now
        }, { merge: true });
      });
      await batch.commit();
      aggiornaBadge("sincronizzato");
    } catch (e) {
      console.error("[FirebaseSync] Errore cambiaStatoMultiplo:", e);
      aggiornaBadge("offline");
    }
  }

  /* ================== Clienti, Listino e Impostazioni Cloud ================== */
  async function sincronizzaCliente(cliente) {
    if (!cliente || !cliente.id) return;
    const firestore = getDb();
    if (!firestore) return;
    try {
      cliente.modificato = new Date().toISOString();
      await firestore.collection("clienti").doc(cliente.id).set(cliente, { merge: true });
    } catch (e) {
      console.error("[FirebaseSync] Errore salvataggio cliente:", e);
    }
  }

  async function eliminaCliente(id) {
    if (!id) return;
    const firestore = getDb();
    if (!firestore) return;
    try {
      await firestore.collection("clienti").doc(id).delete();
    } catch (e) {
      console.error("[FirebaseSync] Errore eliminazione cliente:", e);
    }
  }

  /* Gestione Voci Listino Singole (Collezione /listino/{id}) */
  async function salvaVoceListinoCloud(voce) {
    if (!voce || !voce.id) return;
    const firestore = getDb();
    if (!firestore) return;
    try {
      voce.modificato = new Date().toISOString();
      await firestore.collection("listino").doc(voce.id).set(voce, { merge: true });
    } catch (e) {
      console.error("[FirebaseSync] Errore salvataggio voce listino:", e);
    }
  }

  async function eliminaVoceListinoCloud(id) {
    if (!id) return;
    const firestore = getDb();
    if (!firestore) return;
    try {
      await firestore.collection("listino").doc(id).delete();
    } catch (e) {
      console.error("[FirebaseSync] Errore eliminazione voce listino:", e);
    }
  }

  /* Salvataggio in Batch dell'Intero Listino */
  async function salvaListinoCloud(items) {
    if (!Array.isArray(items)) return;
    const firestore = getDb();
    if (!firestore) return;
    try {
      const batch = firestore.batch();
      const now = new Date().toISOString();
      items.forEach((v, idx) => {
        if (!v.id) {
          v.id = "voc_" + (v.nome || "voce").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30) + "_" + (idx + 1);
        }
        v.ordine = v.ordine != null ? v.ordine : (idx + 1);
        v.attivo = v.attivo !== false;
        v.modificato = now;
        batch.set(firestore.collection("listino").doc(v.id), v, { merge: true });
      });
      await batch.commit();
      console.log("[FirebaseSync] Listino sincronizzato su Cloud (" + items.length + " voci).");
    } catch (e) {
      console.error("[FirebaseSync] Errore salvataggio listino:", e);
    }
  }

  async function salvaImpostazioniCloud(io) {
    if (!io || typeof io !== "object") return;
    const firestore = getDb();
    if (!firestore) return;
    try {
      await firestore.collection("config").doc("impostazioni").set({
        data: io,
        modificato: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("[FirebaseSync] Errore salvataggio impostazioni:", e);
    }
  }

  /* ================== Migrazione Listino su Collezione Dedicata ================== */
  async function eseguiMigrazioneListinoCloud() {
    const firestore = getDb();
    if (!firestore) return;
    try {
      const snap = await firestore.collection("listino").limit(1).get();
      if (snap.empty) {
        console.log("[FirebaseSync] Collezione /listino vuota. Avvio migrazione automatica da standard o config...");
        let items = null;
        try {
          items = JSON.parse(localStorage.getItem(CHIAVE_LISTINO));
        } catch(e) {}

        if (!Array.isArray(items) || items.length === 0) {
          if (typeof listinoStandard === "function") {
            items = listinoStandard();
          }
        }

        if (Array.isArray(items) && items.length > 0) {
          await salvaListinoCloud(items);
          console.log("[FirebaseSync] Migrazione listino completata: " + items.length + " voci create nella collezione /listino.");
        }
      }
    } catch (err) {
      console.warn("[FirebaseSync] Controllo migrazione listino cloud:", err);
    }
  }

  /* ================== Migrazione Dati Storica (One-Time) ================== */
  async function eseguiMigrazioneOneTime() {
    const MIGRATION_KEY = "fc_migrated_v4_cloud";
    if (localStorage.getItem(MIGRATION_KEY) === "1") return;

    const firestore = getDb();
    if (!firestore) return;

    try {
      // 1. Migra vecchi preventivi cestinati in localStorage
      const vecchioCestino = JSON.parse(localStorage.getItem(CHIAVECESTINO) || "[]");
      if (Array.isArray(vecchioCestino) && vecchioCestino.length > 0) {
        const batch = firestore.batch();
        vecchioCestino.forEach(item => {
          const p = item.preventivo;
          if (p && p.id) {
            p.cestinato = true;
            p.eliminatoIl = item.eliminatoIl || new Date().toISOString();
            batch.set(firestore.collection("preventivi").doc(p.id), p, { merge: true });
          }
        });
        await batch.commit();
        localStorage.removeItem(CHIAVECESTINO);
        console.log("[FirebaseSync] Migrati con successo " + vecchioCestino.length + " preventivi cestinati su Cloud.");
      }

      // 2. Migra impostazioni emittente se presenti
      const datiEmittente = datiIo();
      if (datiEmittente && (datiEmittente.cf || datiEmittente.piva || datiEmittente.iban)) {
        await salvaImpostazioniCloud(datiEmittente);
      }

      localStorage.setItem(MIGRATION_KEY, "1");
    } catch (err) {
      console.warn("[FirebaseSync] Migrazione one-time parziale:", err);
    }
  }

  /* ================== Inizializzazione del Modulo ================== */
  function inizializza() {
    getDb();

    // Aggancia gli eventi di input e change dell'editor per l'auto-save debounce
    const editor = document.getElementById("vista-editor");
    if (editor) {
      editor.addEventListener("input", () => {
        window.modificatoNonSalvato = true;
        pianificaAutoSave();
      });
      editor.addEventListener("change", () => {
        window.modificatoNonSalvato = true;
        pianificaAutoSave();
      });
    }

    // Flush immediato dell'auto-save alla chiusura scheda o cambio visibilità
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && autoSaveTimer) {
        eseguiSalvataggioImmediato(false);
      }
    });
    window.addEventListener("beforeunload", () => {
      if (autoSaveTimer) {
        eseguiSalvataggioImmediato(false);
      }
    });

    window.addEventListener("online", () => {
      aggiornaBadge("in_corso", "Riconnessione Cloud...");
      setTimeout(() => aggiornaBadge("sincronizzato"), 800);
    });

    window.addEventListener("offline", () => {
      aggiornaBadge("offline", "Salvato offline");
    });

    // Se l'utente è già autenticato, attiva subito i listener
    if (window.FirebaseAuthModule && typeof window.FirebaseAuthModule.getUtente === "function") {
      const user = window.FirebaseAuthModule.getUtente();
      if (user && user.email) {
        attivaRealtimeListeners();
      }
    }
  }

  /* ================== Interfaccia Pubblica ================== */
  window.FirebaseSync = {
    inizializza,
    attivaRealtimeListeners,
    pianificaAutoSave,
    salvaImmediato: eseguiSalvataggioImmediato,
    sincronizzaPreventivo: async function(p) {
      if (!p || !p.id) return false;
      const d = getDb();
      if (!d) return false;
      p.modificato = new Date().toISOString();
      await d.collection("preventivi").doc(p.id).set(p, { merge: true });
      return true;
    },
    sincronizzaTutto: async function() {
      aggiornaBadge("sincronizzato");
      return true;
    },
    eliminaPreventivo: eliminaDefinitivamente,
    spostaNelCestino,
    ripristinaDaCestino,
    eliminaDefinitivamente,
    spostaMultipliNelCestino,
    ripristinaMultipliDaCestino,
    eliminaDefinitivoMultipli,
    cambiaStatoMultiplo,
    sincronizzaCliente,
    eliminaCliente,
    salvaVoceListino: salvaVoceListinoCloud,
    eliminaVoceListino: eliminaVoceListinoCloud,
    salvaListino: salvaListinoCloud,
    salvaImpostazioni: salvaImpostazioniCloud,
    aggiornaBadge,
    impostaTokenAuth: function(token) { authToken = token; }
  };

  if (window.App) {
    window.App.firebaseSync = window.FirebaseSync;
  }
})(typeof window !== "undefined" ? window : globalThis);
