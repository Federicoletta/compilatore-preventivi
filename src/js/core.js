/**
 * Compilatore Preventivi - Architettura Modulare e State Management (v2.1.0)
 * Namespace centralizzato App con isolamento dello stato e compatibilità globale.
 */
(function(window){
  "use strict";

  const App = {
    version: "2.1.0",
    state: {
      currentId: null,
      isDirty: false,
      selectedArchiveIds: new Set(),
      archiveSort: { field: "data", desc: true },
      activeStatusFilter: "",
      archiveViewMode: "cliente",
      openClientGroups: new Set(),
      activeTab: "editor"
    },
    config: {},
    utils: {},
    storage: {},
    calc: {},
    quotes: {},
    clients: {},
    priceList: {},
    editor: {},
    archive: {},
    validator: {},
    print: {},
    ui: {}
  };

  window.App = App;

  // Global Error Boundary & Crash Protection
  const segnalaErroreGlobale = (messaggio, sorgente, err) => {
    console.error("[App Error Boundary]", messaggio, err || sorgente);
    try {
      const banner = document.getElementById("crash-protection-banner");
      if (banner) {
        banner.style.display = "flex";
        const msgEl = document.getElementById("crash-protection-msg");
        if (msgEl) msgEl.textContent = String(messaggio || "Errore imprevisto di esecuzione");
      }
    } catch(e) {}
  };

  if (typeof window.addEventListener === "function") {
    window.addEventListener("error", function(evt) {
      segnalaErroreGlobale(evt.message, evt.filename + ":" + evt.lineno, evt.error);
    });

    window.addEventListener("unhandledrejection", function(evt) {
      segnalaErroreGlobale("Promise non gestita: " + (evt.reason?.message || evt.reason), "Promise", evt.reason);
    });
  }

  // Bridge di compatibilità reattiva con le variabili legacy dello scope globale
  Object.defineProperty(window, "corrente", {
    get: () => App.state.currentId,
    set: v => { App.state.currentId = v; },
    configurable: true
  });

  Object.defineProperty(window, "modificatoNonSalvato", {
    get: () => App.state.isDirty,
    set: v => { App.state.isDirty = Boolean(v); },
    configurable: true
  });

  Object.defineProperty(window, "selezionatiArchivio", {
    get: () => App.state.selectedArchiveIds,
    set: v => { App.state.selectedArchiveIds = v instanceof Set ? v : new Set(v); },
    configurable: true
  });

  Object.defineProperty(window, "ordinamentoArchivio", {
    get: () => App.state.archiveSort,
    set: v => { App.state.archiveSort = v; },
    configurable: true
  });

  Object.defineProperty(window, "filtroStatoAttivo", {
    get: () => App.state.activeStatusFilter,
    set: v => { App.state.activeStatusFilter = v; },
    configurable: true
  });

  Object.defineProperty(window, "vistaArchivioModo", {
    get: () => App.state.archiveViewMode,
    set: v => { App.state.archiveViewMode = v; },
    configurable: true
  });

  Object.defineProperty(window, "gruppiClientiAperti", {
    get: () => App.state.openClientGroups,
    set: v => { App.state.openClientGroups = v instanceof Set ? v : new Set(v); },
    configurable: true
  });

})(window);
