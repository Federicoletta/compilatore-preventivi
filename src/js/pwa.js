/**
 * Modulo PWA: registrazione Service Worker (Workbox), rilevamento installazione
 * nativa (Chrome/Edge/Android) e guida iOS Safari (Aggiungi a schermata Home).
 */

import { registerSW } from "virtual:pwa-register";
import { openModal, showToast } from "./ui/modal.js";

let deferredInstallPrompt = null;
let isInstalled = false;

function detectStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function detectIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

function updateInstallButtons() {
  const buttons = document.querySelectorAll("[data-action='install-pwa']");
  const canShow = !isInstalled && (Boolean(deferredInstallPrompt) || detectIosSafari());
  buttons.forEach((btn) => {
    btn.hidden = !canShow;
  });
}

export async function triggerPwaInstall() {
  if (isInstalled) {
    showToast("L'app è già installata sul dispositivo.");
    return;
  }

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (outcome === "accepted") {
      isInstalled = true;
      showToast("App installata! Ora puoi aprirla dalla schermata Home.", { type: "success" });
    }
    updateInstallButtons();
    return;
  }

  if (detectIosSafari()) {
    await openModal({
      title: "Installa su iPad o iPhone",
      subtitle: "Aggiungi Compilatore Preventivi alla schermata Home",
      size: "sm",
      bodyHtml: `
        <ol class="ios-install-steps">
          <li>Tocca l'icona <strong>Condividi</strong> (quadrato con freccia verso l'alto) nella barra di Safari.</li>
          <li>Scorri e seleziona <strong>Aggiungi alla schermata Home</strong>.</li>
          <li>Conferma toccando <strong>Aggiungi</strong> in alto a destra per usarla a schermo intero.</li>
        </ol>
      `,
      buttons: [{ label: "Ho capito", value: true, variant: "primary" }],
    });
  }
}

export function initPwa() {
  isInstalled = detectStandalone();

  try {
    registerSW({
      immediate: true,
      onOfflineReady() {
        console.info("[PWA] Asset statici pronti per uso offline.");
      },
      onNeedRefresh() {
        showToast("Nuova versione pronta: aggiornamento applicato al prossimo avvio.");
      },
      onRegisterError(err) {
        console.warn("[PWA] Registrazione Service Worker non disponibile:", err);
      },
    });
  } catch (err) {
    console.warn("[PWA] virtual:pwa-register saltato:", err);
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    updateInstallButtons();
  });

  window.addEventListener("appinstalled", () => {
    isInstalled = true;
    deferredInstallPrompt = null;
    updateInstallButtons();
    showToast("Compilatore Preventivi installato con successo!", { type: "success" });
  });

  updateInstallButtons();
}
