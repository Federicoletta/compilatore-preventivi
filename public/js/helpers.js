/* ================== helpers di formattazione e utilità ================== */
(function(window){
  "use strict";

  const utils = {
    aIsoLocale(d){
      if(!d || isNaN(d.getTime?.())) d = new Date();
      const anno = d.getFullYear();
      const mese = String(d.getMonth() + 1).padStart(2, "0");
      const giorno = String(d.getDate()).padStart(2, "0");
      return `${anno}-${mese}-${giorno}`;
    },

    euro(n){
      const v = Math.abs(Number(n) || 0);
      const [i, d] = v.toFixed(2).split(".");
      const mig = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return ((Number(n) || 0) < 0 ? "−\u00A0" : "") + "€\u00A0" + mig + "," + d;
    },

    dataIt(iso){
      if(!iso) return "";
      const parti = String(iso).split("-").map(Number);
      if(parti.length < 3 || isNaN(parti[0])) return "";
      const [y, m, d] = parti;
      const mesi = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
      return d + " " + (mesi[m - 1] || "") + " " + y;
    },

    maiuscola(s){
      s = String(s || "").trim();
      return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
    },

    esc(s){
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },

    sanitizzaNomeFile(s){
      return String(s || "")
        .replace(/[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ_-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
    },

    val(id){
      const e = document.getElementById(id);
      return e ? e.value.trim() : "";
    },

    set(id, v){
      const e = document.getElementById(id);
      if(e) e.value = v == null ? "" : v;
    }
  };

  const ui = {
    avviso(t, tipo = "info"){
      const m = document.getElementById("msg");
      if(!m) return;
      const isErr = tipo === "errore" || String(t).toLowerCase().includes("errore") || String(t).toLowerCase().includes("non valido");
      const icona = isErr ? "⚠️" : "✓";
      m.innerHTML = `<span class="toast-icon">${icona}</span> <span class="toast-text">${utils.esc(t)}</span>`;
      m.className = "toast-msg on" + (isErr ? " warn" : " success");
      clearTimeout(m._t);
      m._t = setTimeout(() => m.classList.remove("on"), 2400);
    },

    impostaStatoSalvataggio(testo, isHtml = false){
      const s = document.getElementById("stato-salvataggio");
      if(!s) return;
      if(isHtml) s.innerHTML = testo;
      else s.textContent = testo;
    },

    segnaModificato(){
      if(window.App && window.App.state) window.App.state.isDirty = true;
      else window.modificatoNonSalvato = true;
      ui.impostaStatoSalvataggio("<span style='color:#C45318;font-weight:600'>● Modifiche non salvate</span>", true);
      if(typeof sicurezzaPronta !== "undefined" && sicurezzaPronta){
        clearTimeout(window.timerBozza);
        window.timerBozza = setTimeout(window.salvaBozza, 5000);
      }
      if(typeof window.editorRecordHistory === "function"){
        window.editorRecordHistory();
      }
    }
  };

  // Registrazione nel namespace centrale App
  if(window.App){
    Object.assign(window.App.utils, utils);
    Object.assign(window.App.ui, ui);
  }

  // Gestione Dropdown Menu Strumenti
  function toggleMenuStrumenti(e){
    if(e && typeof e.stopPropagation === "function") e.stopPropagation();
    const m = document.getElementById("menu-dropdown-strumenti");
    if(m) m.style.display = (m.style.display === "none" || !m.style.display) ? "flex" : "none";
  }
  function chiudiMenuStrumenti(){
    const m = document.getElementById("menu-dropdown-strumenti");
    if(m) m.style.display = "none";
  }
  document.addEventListener("click", function(e){
    const wrap = document.getElementById("wrap-menu-strumenti");
    if(wrap && !wrap.contains(e.target)){
      chiudiMenuStrumenti();
    }
  });

  // Global Facade
  window.aIsoLocale = utils.aIsoLocale;
  window.euro = utils.euro;
  window.dataIt = utils.dataIt;
  window.maiuscola = utils.maiuscola;
  window.esc = utils.esc;
  window.sanitizzaNomeFile = utils.sanitizzaNomeFile;
  window.val = utils.val;
  window.set = utils.set;
  window.avviso = ui.avviso;
  window.impostaStatoSalvataggio = ui.impostaStatoSalvataggio;
  window.segnaModificato = ui.segnaModificato;
  window.toggleMenuStrumenti = toggleMenuStrumenti;
  window.chiudiMenuStrumenti = chiudiMenuStrumenti;

})(window);
