/**
 * Modulo Autenticazione Firebase Google (single-owner whitelist: Federico Coletta).
 * Zero alert/confirm nativi, zero HTML inline handlers, protezione anti-manomissione.
 */

import { getFirebaseAuth, isDevEnvironment, OWNER_EMAIL } from "./firebase-config.js";
import { esc } from "./formatters.js";
import { actions } from "./store.js";
import { alertModal, confirmModal } from "./ui/modal.js";

let _currentUser = null;
let _antiTamperActive = false;
let _onAuthorizedCallback = null;

export function isAuthorizedUser(user = _currentUser) {
  return Boolean(
    user && user.email && String(user.email).toLowerCase().trim() === OWNER_EMAIL.toLowerCase()
  );
}

export function getCurrentUser() {
  return _currentUser;
}

function setGateVisible(visible) {
  const gate = document.getElementById("auth-gate-overlay");
  if (gate) {
    gate.hidden = !visible;
  }
  document.documentElement.classList.toggle("auth-locked", visible);
  document.body.classList.toggle("auth-locked", visible);
}

function showGateFeedback(htmlMessage, variant = "info") {
  const box = document.getElementById("auth-gate-feedback");
  if (!box) return;
  box.hidden = false;
  box.dataset.variant = variant;
  box.innerHTML = htmlMessage;
}

function hideGateFeedback() {
  const box = document.getElementById("auth-gate-feedback");
  if (box) box.hidden = true;
}

function updateProfileBadge(user) {
  const wrap = document.getElementById("user-profile-wrap");
  const avatar = document.getElementById("user-profile-avatar");
  const label = document.getElementById("user-profile-label");
  if (!wrap) return;

  if (user && user.email) {
    wrap.hidden = false;
    if (label) label.textContent = user.displayName || user.email;
    if (avatar) {
      if (user.photoURL) {
        avatar.src = user.photoURL;
        avatar.hidden = false;
      } else {
        avatar.hidden = true;
      }
    }
  } else {
    wrap.hidden = true;
  }
}

function activateAntiTamper() {
  if (_antiTamperActive || typeof MutationObserver === "undefined") return;
  _antiTamperActive = true;

  const observer = new MutationObserver(() => {
    if (isAuthorizedUser()) return;
    const gate = document.getElementById("auth-gate-overlay");
    const tampered = !gate || gate.hidden || gate.style.display === "none" || !document.contains(gate);
    if (tampered) {
      const app = document.getElementById("app");
      if (app) app.remove();
      document.body.innerHTML = `
        <div class="auth-tamper-lock">
          <h2>Accesso Riservato — Protezione Attiva</h2>
          <p>Ricarica la pagina e accedi con il tuo account Google autorizzato.</p>
          <button type="button" class="btn btn-primary" id="btn-tamper-reload">Ricarica pagina</button>
        </div>
      `;
      document.getElementById("btn-tamper-reload")?.addEventListener("click", () => {
        window.location.reload();
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "style", "class"],
  });
}

function handleAuthState(user) {
  _currentUser = user;
  actions.setUser(user);

  if (!user) {
    setGateVisible(true);
    updateProfileBadge(null);
    activateAntiTamper();
    return;
  }

  if (isAuthorizedUser(user)) {
    hideGateFeedback();
    setGateVisible(false);
    updateProfileBadge(user);
    if (typeof _onAuthorizedCallback === "function") {
      _onAuthorizedCallback(user);
    }
    return;
  }

  // Account Google diverso dal proprietario
  setGateVisible(true);
  updateProfileBadge(null);
  activateAntiTamper();
  showGateFeedback(
    `<strong>Accesso negato</strong><br>
     L'account <code>${esc(user.email || "sconosciuto")}</code> non è autorizzato.<br>
     Questo gestionale è riservato a <strong>${esc(OWNER_EMAIL)}</strong>.<br>
     <button type="button" class="btn btn-ghost btn-sm" id="btn-auth-switch-account" style="margin-top:10px">
       Esci e cambia account
     </button>`,
    "error"
  );
  document.getElementById("btn-auth-switch-account")?.addEventListener("click", () => {
    signOutImmediately();
  });
}

export async function loginWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth || typeof globalThis.firebase?.auth?.GoogleAuthProvider !== "function") {
    await alertModal(
      "Autenticazione non disponibile",
      "Il servizio Google Auth è momentaneamente irraggiungibile o bloccato dalla rete."
    );
    return;
  }

  showGateFeedback("Apertura accesso Google in corso...", "info");
  const provider = new globalThis.firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    await auth.signInWithPopup(provider);
  } catch (err) {
    if (err?.code === "auth/popup-blocked") {
      auth.signInWithRedirect(provider);
    } else if (err?.code === "auth/popup-closed-by-user") {
      hideGateFeedback();
    } else {
      let msg = `Impossibile completare l'accesso: ${esc(err?.message || "errore sconosciuto")}`;
      if (err?.code === "auth/unauthorized-domain" && isDevEnvironment()) {
        msg += `<br><span class="auth-dev-hint">Dominio di anteprima non nella whitelist Firebase: usa il pulsante "Sessione Studio" qui sotto.</span>`;
      }
      showGateFeedback(msg, "error");
    }
  }
}

export function loginDevSession() {
  if (!isDevEnvironment()) return;
  handleAuthState({
    email: OWNER_EMAIL,
    displayName: "Federico Coletta",
    photoURL: "",
    isDevSession: true,
    getIdToken: async () => "",
  });
}

async function signOutImmediately() {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await auth.signOut();
    } catch {
      // ignore
    }
  }
  window.location.reload();
}

export async function logoutUser() {
  const ok = await confirmModal({
    title: "Disconnetti account",
    message: "Vuoi uscire dal tuo account? Tutte le modifiche salvate restano al sicuro nel Cloud.",
    confirmLabel: "Esci",
    cancelLabel: "Rimani connesso",
  });
  if (!ok) return;
  await signOutImmediately();
}

export function initAuth(onAuthorized) {
  _onAuthorizedCallback = onAuthorized;
  setGateVisible(true);

  const btnGoogle = document.getElementById("btn-login-google");
  btnGoogle?.addEventListener("click", loginWithGoogle);

  const btnDev = document.getElementById("btn-login-dev");
  if (btnDev) {
    if (isDevEnvironment()) {
      btnDev.hidden = false;
      btnDev.addEventListener("click", loginDevSession);
    } else {
      btnDev.remove();
    }
  }

  let attempts = 0;
  const attachAuthListener = () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      if (attempts < 40) {
        attempts += 1;
        setTimeout(attachAuthListener, 120);
      }
      return;
    }
    try {
      auth.onAuthStateChanged(handleAuthState);
    } catch (err) {
      console.warn("[FirebaseAuth] Errore inizializzazione listener:", err);
    }
  };

  attachAuthListener();
}
