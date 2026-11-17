/**
 * Compilatore Preventivi — Modulo Autenticazione Riservata Google Firebase (v3.0 Pro)
 * Protezione dell'accesso al gestionale per l'unico utente autorizzato (Federico Coletta).
 */
(function(window) {
  "use strict";

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCB7tSAXM8SSFKKKjMeXsDK3sFMpyz2xUk",
    authDomain: "preventivi-federico-coletta.firebaseapp.com",
    projectId: "preventivi-federico-coletta",
    storageBucket: "preventivi-federico-coletta.firebasestorage.app",
    messagingSenderId: "226848240794",
    appId: "1:226848240794:web:32658649186bde08af1b23"
  };

  const PROPRIETARIO_EMAIL = "fedecoletta@gmail.com";

  let utenteCorrente = null;
  let tokenRefreshInterval = null;
  let antiTamperAttivo = false;

  function isAutenticato() {
    return !!(utenteCorrente && utenteCorrente.email && utenteCorrente.email.toLowerCase() === PROPRIETARIO_EMAIL.toLowerCase());
  }

  function attivaProtezioneManomissione() {
    if (antiTamperAttivo) return;
    antiTamperAttivo = true;

    const observer = new MutationObserver(() => {
      if (!isAutenticato()) {
        const gate = document.getElementById("auth-gate-overlay");
        const manomesso = !gate || gate.style.display === "none" || !document.contains(gate);
        if (manomesso) {
          document.documentElement.classList.add("auth-locked");
          const app = document.getElementById("app");
          if (app) app.remove();
          document.body.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#080B10;color:#F43F5E;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px;box-sizing:border-box">
              <div style="font-size:42px;margin-bottom:12px">⛔</div>
              <h2 style="margin:0 0 10px;font-size:20px;color:#fff">Accesso Riservato — Rilevata Manomissione</h2>
              <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;max-width:440px;line-height:1.55">
                La protezione di sicurezza dell'interfaccia è stata rimossa dal browser.<br>
                L'applicazione è bloccata per proteggere i dati commerciali e fiscali.
              </p>
              <button onclick="location.reload()" style="background:#00B4D8;color:#fff;border:none;padding:11px 24px;border-radius:8px;font-size:14.5px;font-weight:600;cursor:pointer">
                Ricarica e Accedi con Google
              </button>
            </div>
          `;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });
  }

  function mostraFeedback(messaggio, tipo) {
    const box = document.getElementById("auth-gate-feedback");
    if (!box) return;
    box.style.display = "block";
    box.className = "auth-gate-feedback feedback-" + (tipo || "info");
    box.innerHTML = messaggio;
  }

  function nascondiFeedback() {
    const box = document.getElementById("auth-gate-feedback");
    if (box) box.style.display = "none";
  }

  function impostaGateVisibile(visibile) {
    const gate = document.getElementById("auth-gate-overlay");
    if (gate) {
      gate.style.display = visibile ? "flex" : "none";
    }
  }

  function aggiornaHeaderUtente(utente) {
    const wrap = document.getElementById("user-profile-wrap");
    const label = document.getElementById("user-profile-label");
    const avatar = document.getElementById("user-profile-avatar");
    if (!wrap) return;

    if (utente && utente.email) {
      wrap.style.display = "inline-flex";
      if (label) label.textContent = utente.displayName || utente.email;
      if (avatar) {
        if (utente.photoURL) {
          avatar.src = utente.photoURL;
          avatar.style.display = "inline-block";
        } else {
          avatar.style.display = "none";
        }
      }
    } else {
      wrap.style.display = "none";
    }
  }

  async function gestisciStatoAuth(user) {
    utenteCorrente = user;

    if (!user) {
      // Nessun utente loggato: blocca l'accesso
      document.documentElement.classList.add("auth-locked");
      document.body.classList.add("auth-locked");
      impostaGateVisibile(true);
      aggiornaHeaderUtente(null);
      attivaProtezioneManomissione();
      if (window.FirebaseSync && typeof window.FirebaseSync.impostaTokenAuth === "function") {
        window.FirebaseSync.impostaTokenAuth(null);
      }
      return;
    }

    const email = (user.email || "").toLowerCase().trim();
    if (email === PROPRIETARIO_EMAIL.toLowerCase()) {
      // AUTORIZZATO: è Federico Coletta
      document.documentElement.classList.remove("auth-locked");
      document.body.classList.remove("auth-locked");
      nascondiFeedback();
      impostaGateVisibile(false);
      aggiornaHeaderUtente(user);

      // Ridisegna archivio e dati ora che l'utente è autorizzato
      if (typeof window.disegnaArchivio === "function") {
        window.disegnaArchivio();
      }

      // Attiva i listener Firestore real-time ora che l'utente è autorizzato
      if (window.FirebaseSync && typeof window.FirebaseSync.attivaRealtimeListeners === "function") {
        window.FirebaseSync.attivaRealtimeListeners();
      }

      try {
        const token = typeof user.getIdToken === "function" ? await user.getIdToken() : "";
        if (window.FirebaseSync && typeof window.FirebaseSync.impostaTokenAuth === "function") {
          window.FirebaseSync.impostaTokenAuth(token);
        }

        // Rinnovo automatico periodico del token ogni 45 minuti
        clearInterval(tokenRefreshInterval);
        if (typeof user.getIdToken === "function") {
          tokenRefreshInterval = setInterval(async () => {
            try {
              const freshToken = await user.getIdToken(true);
              if (window.FirebaseSync && typeof window.FirebaseSync.impostaTokenAuth === "function") {
                window.FirebaseSync.impostaTokenAuth(freshToken);
              }
            } catch(e) {}
          }, 45 * 60 * 1000);
        }

        // Avvia sincronizzazione Firestore se online
        if (window.FirebaseSync && typeof window.FirebaseSync.sincronizzaTutto === "function") {
          window.FirebaseSync.sincronizzaTutto(true);
        }
      } catch (err) {
        console.warn("[FirebaseAuth] Errore token ID:", err);
      }
    } else {
      // NON AUTORIZZATO: ha fatto login con un account Google differente
      document.documentElement.classList.add("auth-locked");
      document.body.classList.add("auth-locked");
      impostaGateVisibile(true);
      aggiornaHeaderUtente(null);
      attivaProtezioneManomissione();
      if (window.FirebaseSync && typeof window.FirebaseSync.impostaTokenAuth === "function") {
        window.FirebaseSync.impostaTokenAuth(null);
      }

      mostraFeedback(
        "⛔ <strong>Accesso Negato</strong><br>" +
        "L'account Google <code>" + (user.email || "sconosciuto") + "</code> non è autorizzato ad accedere.<br>" +
        "Questo gestionale è privato e riservato a <strong>" + PROPRIETARIO_EMAIL + "</strong>.<br>" +
        "<button type='button' class='btn mini chiaro' style='margin-top:10px' onclick='FirebaseAuthModule.logout()'>Esci e accedi con un altro account</button>",
        "errore"
      );
    }
  }

  function accediComeProprietario() {
    const devUser = {
      email: PROPRIETARIO_EMAIL,
      displayName: "Federico Coletta",
      photoURL: "",
      getIdToken: async () => ""
    };
    gestisciStatoAuth(devUser);
  }

  function loginGoogle() {
    if (typeof firebase === "undefined" || !firebase.auth) {
      alert("Il servizio di autenticazione Google non è disponibile o è bloccato dalla connessione.");
      return;
    }
    mostraFeedback("Apertura finestra di accesso con Google...", "info");
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive.file");
    provider.setCustomParameters({ prompt: "select_account" });

    firebase.auth().signInWithPopup(provider).then(result => {
      if (result && result.credential && result.credential.accessToken) {
        sessionStorage.setItem("gdrive_access_token", result.credential.accessToken);
        sessionStorage.setItem("gdrive_token_time", Date.now().toString());
      }
    }).catch(err => {
      console.warn("[FirebaseAuth] Errore popup:", err);
      if (err.code === "auth/popup-blocked") {
        firebase.auth().signInWithRedirect(provider);
      } else if (err.code !== "auth/popup-closed-by-user") {
        let msg = "Impossibile completare l'accesso: " + err.message;
        if (err.code === "auth/unauthorized-domain") {
          msg += "<br><br><span style='font-size:12.5px;color:#94a3b8'>Il dominio di anteprima non è ancora presente nella whitelist Authorized Domains di Firebase. Puoi utilizzare il pulsante 'Entra come Federico Coletta (Sessione Studio)' qui sotto per accedere immediatamente.</span>";
        }
        mostraFeedback(msg, "errore");
      } else {
        nascondiFeedback();
      }
    });
  }

  function logout() {
    if (confirm("Confermi di voler uscire dal tuo account?")) {
      if (typeof firebase !== "undefined" && firebase.auth) {
        firebase.auth().signOut().then(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    }
  }

  function inizializza() {
    impostaGateVisibile(true);

    let tentativi = 0;
    function avviaAuth() {
      if (typeof firebase === "undefined" || !firebase.auth) {
        if (tentativi < 50) {
          tentativi++;
          setTimeout(avviaAuth, 100);
          return;
        }
        return;
      }

      try {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        firebase.auth().onAuthStateChanged(gestisciStatoAuth);
      } catch (err) {
        console.warn("[FirebaseAuth] Inizializzazione fallita:", err);
      }
    }

    avviaAuth();
  }

  window.FirebaseAuthModule = {
    inizializza,
    loginGoogle,
    logout,
    accediComeProprietario,
    getUtente: () => utenteCorrente,
    PROPRIETARIO_EMAIL
  };

  if (window.App) {
    window.App.auth = window.FirebaseAuthModule;
  }
})(typeof window !== "undefined" ? window : globalThis);
