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

  /* ================== Serializzazione Sicura per Firestore ================== */
  const CAMPI_PREVENTIVO_FIRESTORE = [
    "id", "numero", "data", "validita", "stato", "cliente", "progetto", "voci",
    "sconto", "sconto_txt", "regime", "ritenuta", "rivalsa", "iva", "bollo",
    "incluso", "escluso", "opzioni", "condizioni", "io", "totale", "modificato",
    "driveFileId", "driveUrl", "driveSavedAt", "cestinato", "eliminatoIl", "annullamento"
  ];
  const STATI_FIRESTORE = new Set(["bozza", "inviato", "accettato", "rifiutato", "annullato"]);

  function preparaPreventivoPerFirestore(raw) {
    const base = typeof sanificaPreventivo === "function" ? sanificaPreventivo(raw) : Object.assign({}, raw);
    const out = {};

    const idClean = String(base.id || ("p" + Date.now())).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || ("p" + Date.now());
    out.id = idClean;
    out.numero = String(base.numero || "").trim().slice(0, 64) || ("BOZZA_" + idClean.slice(-4));

    const dataStr = String(base.data || "").trim();
    out.data = (dataStr.length >= 8 && dataStr.length <= 32) ? dataStr : new Date().toISOString().slice(0, 10);
    out.validita = String(base.validita || "").slice(0, 32);
    out.stato = STATI_FIRESTORE.has(base.stato) ? base.stato : "bozza";

    if (base.cliente && typeof base.cliente === "object") {
      out.cliente = {
        nome: String(base.cliente.nome || ""),
        ref: String(base.cliente.ref || ""),
        indirizzo: String(base.cliente.indirizzo || ""),
        piva: String(base.cliente.piva || ""),
        email: String(base.cliente.email || ""),
        tel: String(base.cliente.tel || "")
      };
    }
    if (base.progetto && typeof base.progetto === "object") {
      out.progetto = {
        titolo: String(base.progetto.titolo || ""),
        tipo: String(base.progetto.tipo || ""),
        luogo: String(base.progetto.luogo || ""),
        giornate: String(base.progetto.giornate || ""),
        consegna: String(base.progetto.consegna || ""),
        saluto: String(base.progetto.saluto || ""),
        intro: String(base.progetto.intro || "")
      };
    }

    out.voci = (Array.isArray(base.voci) ? base.voci : []).slice(0, 200).map(v => ({
      nome: String(v?.nome || ""),
      desc: String(v?.desc || ""),
      q: Number.isFinite(Number(v?.q)) ? Math.max(0, Number(v.q)) : 1,
      p: Number.isFinite(Number(v?.p)) ? Math.max(0, Number(v.p)) : 0
    }));
    if (out.voci.length === 0) {
      out.voci.push({ nome: "", desc: "", q: 1, p: 0 });
    }

    out.sconto = Number.isFinite(Number(base.sconto)) ? Math.max(0, Number(base.sconto)) : 0;
    out.sconto_txt = String(base.sconto_txt || "").slice(0, 300);
    out.regime = String(base.regime || "occasionale").slice(0, 100);
    out.ritenuta = Number.isFinite(Number(base.ritenuta)) ? Math.min(100, Math.max(0, Number(base.ritenuta))) : 20;
    out.rivalsa = Number.isFinite(Number(base.rivalsa)) ? Math.min(100, Math.max(0, Number(base.rivalsa))) : 0;
    out.iva = Number.isFinite(Number(base.iva)) ? Math.min(100, Math.max(0, Number(base.iva))) : 22;
    out.bollo = String(base.bollo || "auto").slice(0, 50);

    out.incluso = (Array.isArray(base.incluso) ? base.incluso : []).slice(0, 100).map(x => String(x || ""));
    out.escluso = (Array.isArray(base.escluso) ? base.escluso : []).slice(0, 100).map(x => String(x || ""));
    out.opzioni = (Array.isArray(base.opzioni) ? base.opzioni : []).slice(0, 100).map(o => ({
      nome: String(o?.nome || ""),
      desc: String(o?.desc || ""),
      p: Number.isFinite(Number(o?.p)) ? Math.max(0, Number(o.p)) : 0
    }));

    // Firestore vieta gli array annidati ([[titolo, testo]]): converti sempre in array di mappe {titolo, testo}
    out.condizioni = (Array.isArray(base.condizioni) ? base.condizioni : []).slice(0, 100).map(cond => {
      if (Array.isArray(cond)) {
        return { titolo: String(cond[0] || ""), testo: String(cond[1] || "") };
      }
      if (cond && typeof cond === "object") {
        return { titolo: String(cond.titolo || cond.nome || ""), testo: String(cond.testo || cond.desc || "") };
      }
      return { titolo: String(cond || ""), testo: "" };
    });

    if (base.io && typeof base.io === "object") {
      out.io = {
        cf: String(base.io.cf || ""),
        iban: String(base.io.iban || ""),
        indirizzo: String(base.io.indirizzo || ""),
        piva: String(base.io.piva || "")
      };
    }

    out.totale = Number.isFinite(Number(base.totale)) ? Number(base.totale) : 0;
    out.modificato = String(base.modificato || new Date().toISOString()).slice(0, 64);

    if (base.driveFileId) out.driveFileId = String(base.driveFileId).slice(0, 128);
    if (base.driveUrl) out.driveUrl = String(base.driveUrl).slice(0, 500);
    if (base.driveSavedAt) out.driveSavedAt = String(base.driveSavedAt).slice(0, 64);
    if (typeof base.cestinato === "boolean") out.cestinato = base.cestinato;
    if (base.eliminatoIl !== undefined) out.eliminatoIl = base.eliminatoIl ? String(base.eliminatoIl).slice(0, 64) : null;
    if (base.annullamento && typeof base.annullamento === "object") {
      out.annullamento = {
        data: String(base.annullamento.data || ""),
        nota: String(base.annullamento.nota || "")
      };
    }

    // Garanzia finale: mantieni esclusivamente campi consentiti da firestore.rules
    const safe = {};
    CAMPI_PREVENTIVO_FIRESTORE.forEach(k => {
      if (out[k] !== undefined) safe[k] = out[k];
    });
    return safe;
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
              const pFire = preparaPreventivoPerFirestore(p);
              batch.set(firestore.collection("preventivi").doc(pFire.id), pFire, { merge: true });
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

    // 3. Collezione Listino (Scorporata v4.0 come collezione di documenti autonomi su DB)
    firestore.collection("listino").onSnapshot((snapshot) => {
      const items = [];
      snapshot.forEach(doc => {
        const v = doc.data();
        if (v && v.nome) {
          items.push(v);
        }
      });
      if (items.length > 0 || !snapshot.metadata.fromCache) {
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
      const pFire = preparaPreventivoPerFirestore(p);
      await firestore.collection("preventivi").doc(pFire.id).set(pFire, { merge: true });
      ultimoHashSalvataggio.set(pFire.id, JSON.stringify(p));
      window.modificatoNonSalvato = false;
      aggiornaBadge("sincronizzato");

      if (mostraToast && typeof avviso === "function") {
        avviso("Preventivo " + (pFire.numero || "") + " salvato nel Cloud!");
      }
      return true;
    } catch (err) {
      console.error("[FirebaseSync] Errore durante il salvataggio:", err);
      aggiornaBadge("offline", "Salvato offline");
      if (mostraToast && typeof avviso === "function") {
        avviso("Salvato in locale; sincronizzazione Cloud in attesa (" + (err?.code || err?.message || "offline") + ").");
      }
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
  function preparaVoceListinoPerFirestore(v, idx) {
    if (!v || typeof v !== "object") return null;
    const rawNome = String(v.nome || "").trim().slice(0, 200);
    if (!rawNome) return null;
    const rawId = String(v.id || ("voc_" + rawNome.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30) + "_" + ((idx || 0) + 1)))
      .replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || ("voc_" + Date.now());
    const out = {
      id: rawId,
      cat: String(v.cat || "").trim().slice(0, 100),
      nome: rawNome,
      desc: String(v.desc || "").trim().slice(0, 1000),
      unita: String(v.unita || "forfait").trim().slice(0, 50),
      prezzo: Number.isFinite(Number(v.prezzo)) ? Math.max(0, Number(v.prezzo)) : 0,
      ordine: Number.isFinite(Number(v.ordine)) ? Number(v.ordine) : ((idx || 0) + 1),
      attivo: v.attivo !== false,
      modificato: String(v.modificato || new Date().toISOString()).slice(0, 64)
    };
    if (v.creato) out.creato = String(v.creato).slice(0, 64);
    return out;
  }

  async function salvaVoceListinoCloud(voce) {
    const vFire = preparaVoceListinoPerFirestore(voce);
    if (!vFire) return;
    const firestore = getDb();
    if (!firestore) return;
    try {
      vFire.modificato = new Date().toISOString();
      await firestore.collection("listino").doc(vFire.id).set(vFire, { merge: true });
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
    if (!Array.isArray(items)) return true;
    const firestore = getDb();
    if (!firestore) return false;
    const safeItems = items.map((v, idx) => preparaVoceListinoPerFirestore(v, idx)).filter(Boolean);
    const CHUNK = 400;
    for (let i = 0; i < safeItems.length; i += CHUNK) {
      const batch = firestore.batch();
      safeItems.slice(i, i + CHUNK).forEach(vFire => {
        batch.set(firestore.collection("listino").doc(vFire.id), vFire, { merge: true });
      });
      await batch.commit();
    }
    console.log("[FirebaseSync] Listino sincronizzato su Cloud (" + safeItems.length + " voci).");
    return true;
  }

  async function salvaImpostazioniCloud(io) {
    if (!io || typeof io !== "object") return true;
    const firestore = getDb();
    if (!firestore) return false;
    await firestore.collection("config").doc("impostazioni").set({
      data: io,
      modificato: new Date().toISOString()
    }, { merge: true });
    return true;
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
            const pFire = preparaPreventivoPerFirestore({
              ...p,
              cestinato: true,
              eliminatoIl: item.eliminatoIl || new Date().toISOString()
            });
            batch.set(firestore.collection("preventivi").doc(pFire.id), pFire, { merge: true });
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
      const pFire = preparaPreventivoPerFirestore(p);
      await d.collection("preventivi").doc(pFire.id).set(pFire, { merge: true });
      return true;
    },
    sincronizzaTutto: async function(mostraToast = false, opzioni = {}) {
      const firestore = getDb();
      if (!firestore) return false;

      aggiornaBadge("in_corso", "Sincronizzazione...");
      try {
        const listaPrev = Array.isArray(opzioni.preventivi)
          ? opzioni.preventivi
          : (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : (typeof archivio === "function" ? archivio() : []));

        const eseguiScritture = async () => {
          const CHUNK = 400;
          for (let i = 0; i < listaPrev.length; i += CHUNK) {
            const batch = firestore.batch();
            const slice = listaPrev.slice(i, i + CHUNK);
            slice.forEach(item => {
              if (!item || typeof item !== "object") return;
              const pFire = preparaPreventivoPerFirestore(item);
              batch.set(firestore.collection("preventivi").doc(pFire.id), pFire, { merge: true });
            });
            await batch.commit();
          }

          if (Array.isArray(opzioni.eliminaIds) && opzioni.eliminaIds.length > 0) {
            for (let i = 0; i < opzioni.eliminaIds.length; i += CHUNK) {
              const batch = firestore.batch();
              opzioni.eliminaIds.slice(i, i + CHUNK).forEach(id => {
                if (id) batch.delete(firestore.collection("preventivi").doc(id));
              });
              await batch.commit();
            }
          }

          if (Array.isArray(opzioni.listino) && opzioni.listino.length > 0) {
            await salvaListinoCloud(opzioni.listino);
          }
          if (opzioni.io && typeof opzioni.io === "object") {
            await salvaImpostazioniCloud(opzioni.io);
          }
        };

        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          // Offline con persistenza IndexedDB: accoda senza bloccare l'UI
          eseguiScritture().catch(err => console.warn("[FirebaseSync] Errore coda offline:", err));
          aggiornaBadge("offline", "Salvato offline");
          return false;
        }

        const esito = await Promise.race([
          eseguiScritture().then(() => "ok"),
          new Promise(resolve => setTimeout(() => resolve("timeout"), 7000))
        ]);

        if (esito === "timeout") {
          aggiornaBadge("offline", "Sync in coda");
          return false;
        }

        aggiornaBadge("sincronizzato");
        if (mostraToast && typeof avviso === "function") {
          avviso("Sincronizzazione Cloud completata (" + listaPrev.length + " preventivi)!");
        }
        return true;
      } catch (err) {
        console.error("[FirebaseSync] Errore sincronizzaTutto:", err);
        aggiornaBadge("errore", "Errore sincronizzazione Cloud: " + (err?.message || ""));
        if (mostraToast && typeof avviso === "function") {
          avviso("Errore sincronizzazione Cloud: " + (err?.code || err?.message || "riprovare"));
        }
        return false;
      }
    },
    preparaPreventivoPerFirestore,
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
