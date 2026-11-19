/**
 * Entry Point Applicazione v2.0 (ES Modules nativi).
 * Collega Store, Tema, PWA, Auth Firebase, Sync Cloud-First e le 4 Viste.
 */

import "../css/tokens.css";
import "../css/app.css";
import "../css/print.css";

import { actions, getState, subscribe } from "./store.js";
import { initPwa, triggerPwaInstall } from "./pwa.js";
import { initAuth, logoutUser } from "./firebase-auth.js";
import {
  flushQuoteAutosave,
  initSyncLifecycle,
  startRealtimeSync,
} from "./firebase-sync.js";
import { exportFullBackupJson, handleJsonFileImport } from "./import-export.js";
import {
  initEditorView,
  openMobilePreviewSheet,
  renderEditorLists,
  renderEditorSummaryAndPreview,
  renderPriceListSelect,
  syncEditorScalarsFromStore,
  updateStructuralUndoButtons,
} from "./ui/editor-view.js";
import { initArchiveView, renderArchiveView } from "./ui/archive-view.js";
import { initClientsView, renderClientsView } from "./ui/clients-view.js";
import { initPriceListView, renderPriceListView } from "./ui/price-list-view.js";
import { printQuoteDocument } from "./print-engine.js";
import { showToast } from "./ui/modal.js";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute("content", theme === "dark" ? "#0F1714" : "#1B4332");
  }
  const btn = document.getElementById("btn-toggle-theme");
  if (btn) {
    btn.setAttribute("aria-label", theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro");
    btn.textContent = theme === "dark" ? "☀" : "☾";
  }
}

function updateSyncIndicator(st) {
  const pill = document.getElementById("topbar-sync-indicator");
  const txt = document.getElementById("topbar-sync-text");
  if (!pill || !txt) return;

  pill.dataset.status = st.syncStatus;
  switch (st.syncStatus) {
    case "saving":
      txt.textContent = st.syncMessage || "Salvataggio…";
      break;
    case "offline":
      txt.textContent = st.syncMessage || "Offline";
      break;
    case "error":
      txt.textContent = st.syncMessage || "Errore sync";
      break;
    case "saved":
    default:
      txt.textContent = st.syncMessage || "Salvato";
      break;
  }
}

function updateActiveViewDom(activeView) {
  const views = ["editor", "archivio", "clienti", "listino"];
  views.forEach((v) => {
    const el = document.getElementById(`vista-${v}`);
    if (el) el.hidden = v !== activeView;
  });

  document.querySelectorAll("[data-nav-view]").forEach((btn) => {
    const isCurrent = btn.dataset.navView === activeView;
    btn.classList.toggle("active", isCurrent);
    if (isCurrent) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });

  // Mostra barra mobile rapida solo in vista Editor
  const mobileBar = document.getElementById("mobile-editor-bar");
  if (mobileBar) mobileBar.hidden = activeView !== "editor";
}

function bootstrap() {
  const initialState = getState();
  applyTheme(initialState.theme);
  updateSyncIndicator(initialState);

  const fileInput = document.getElementById("global-json-import-input");
  const triggerImport = () => {
    if (!fileInput) return;
    fileInput.value = "";
    fileInput.click();
  };

  fileInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleJsonFileImport(file);
  });

  const openQuoteInEditor = async (quote) => {
    await flushQuoteAutosave();
    actions.loadQuoteIntoEditor(quote, { persisted: true });
    actions.setActiveView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Inizializza le 4 viste modulari
  initEditorView({ onTriggerImport: triggerImport });
  initArchiveView({
    onOpenQuote: openQuoteInEditor,
    onTriggerImport: triggerImport,
    onExportBackup: exportFullBackupJson,
  });
  initClientsView({ onOpenQuote: openQuoteInEditor });
  initPriceListView();

  // Primo rendering sincronizzato con lo store
  syncEditorScalarsFromStore();
  renderEditorLists();
  renderPriceListSelect();
  renderEditorSummaryAndPreview();
  renderArchiveView();
  renderClientsView();
  renderPriceListView();
  updateActiveViewDom(initialState.activeView);

  // Sottoscrizione reattiva allo Store centrale
  subscribe((st, scope) => {
    switch (scope) {
      case "theme":
        applyTheme(st.theme);
        break;
      case "sync":
        updateSyncIndicator(st);
        break;
      case "view":
        updateActiveViewDom(st.activeView);
        if (st.activeView === "archivio") renderArchiveView();
        else if (st.activeView === "clienti") renderClientsView();
        else if (st.activeView === "listino") renderPriceListView();
        else renderEditorSummaryAndPreview();
        break;
      case "quoteLoaded":
        syncEditorScalarsFromStore();
        renderEditorLists();
        renderEditorSummaryAndPreview();
        break;
      case "quoteStructural":
        renderEditorLists();
        renderEditorSummaryAndPreview();
        break;
      case "quoteField":
      case "splitPreview":
      case "signature":
        renderEditorSummaryAndPreview();
        break;
      case "issuer":
        syncEditorScalarsFromStore();
        renderEditorSummaryAndPreview();
        break;
      case "quotes":
        renderArchiveView();
        if (st.activeView === "clienti") renderClientsView();
        updateStructuralUndoButtons();
        break;
      case "archiveFilter":
      case "archiveSelection":
        renderArchiveView();
        break;
      case "clients":
      case "clientFilter":
        renderClientsView();
        break;
      case "priceList":
        renderPriceListSelect();
        renderPriceListView();
        break;
      case "priceListFilter":
        renderPriceListView();
        break;
    }
  });

  // Navigazione Topbar + Mobile Bottom Bar
  document.addEventListener("click", async (e) => {
    const navBtn = e.target.closest("[data-nav-view]");
    if (navBtn) {
      const targetView = navBtn.dataset.navView;
      if (getState().activeView === "editor" && targetView !== "editor") {
        await flushQuoteAutosave();
      }
      actions.setActiveView(targetView);
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;

    switch (actionEl.dataset.action) {
      case "toggle-theme":
        actions.toggleTheme();
        break;
      case "install-pwa":
        await triggerPwaInstall();
        break;
      case "logout":
        await logoutUser();
        break;
      case "mobile-preview":
        await openMobilePreviewSheet();
        break;
      case "mobile-print": {
        const st = getState();
        await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
        break;
      }
      case "topbar-new-quote":
        await flushQuoteAutosave();
        actions.newQuote();
        actions.setActiveView("editor");
        showToast("Nuovo preventivo creato.");
        break;
    }
  });

  // Scorciatoie tastiera NON distruttive (NO Ctrl+S, NO override Ctrl+Z nei campi testo)
  document.addEventListener("keydown", async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
      if (getState().activeView === "editor") {
        e.preventDefault();
        const st = getState();
        await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
      }
    } else if (e.altKey && e.key.toLowerCase() === "n" && getState().activeView === "editor") {
      e.preventDefault();
      actions.updateCurrentQuote(
        (q) => q.voci.push({ nome: "", desc: "", q: 1, p: 0 }),
        { structural: true }
      );
      showToast("Nuova voce aggiunta.");
    }
  });

  // Lifecycle Cloud Sync + PWA + Auth
  initSyncLifecycle();
  initPwa();
  initAuth(() => {
    startRealtimeSync();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
