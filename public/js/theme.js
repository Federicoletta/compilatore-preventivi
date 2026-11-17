/* ================== gestione tema ================== */
function applicaTema(tema, salva) {
  document.documentElement.setAttribute("data-tema", tema);
  if (salva) {
    try { localStorage.setItem("fc_tema", tema); } catch (e) {}
  }
  const btn = document.getElementById("btn-tema");
  if (!btn) return;
  const icona = btn.querySelector(".icona-tema");
  const testo = btn.querySelector(".testo-tema");
  if (tema === "dark") {
    if (icona) icona.textContent = "☀️";
    if (testo) testo.textContent = "Light";
    btn.title = "Attiva tema chiaro";
  } else {
    if (icona) icona.textContent = "🌙";
    if (testo) testo.textContent = "Dark";
    btn.title = "Attiva tema scuro";
  }
}

function toggleTema() {
  const attuale = document.documentElement.getAttribute("data-tema") === "dark" ? "dark" : "light";
  const nuovo = attuale === "dark" ? "light" : "dark";
  applicaTema(nuovo, true);
  if (typeof avviso === "function") {
    avviso(nuovo === "dark" ? "Tema scuro attivato" : "Tema chiaro attivato");
  }
}

function inizializzaTema() {
  let tema = "light";
  try {
    const salvato = localStorage.getItem("fc_tema");
    if (salvato === "dark" || salvato === "light") {
      tema = salvato;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      tema = "dark";
    }
  } catch (e) {}
  applicaTema(tema, false);
}

// Registrazione modulo Tema in App.ui
if(typeof window !== 'undefined' && window.App && window.App.ui){
  window.App.ui.theme = {
    apply: applicaTema,
    toggle: toggleTema,
    init: inizializzaTema
  };
}
