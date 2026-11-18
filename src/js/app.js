/**
 * Compilatore Preventivi - Controller Principale & Ciclo di Vita Preventivi (v2.1.0)
 * Gestione form, nuovo preventivo, salvataggio, apertura, duplicazione e scorciatoie.
 */
(function(window){
  "use strict";

  let currentDriveMeta = { driveFileId: null, driveUrl: null, driveSavedAt: null };
  let currentAnnullamento = null;
  let currentCestinato = false;
  let currentEliminatoIl = null;

  function setDriveMeta(meta) {
    if (meta && typeof meta === "object") {
      currentDriveMeta = {
        driveFileId: meta.driveFileId || currentDriveMeta.driveFileId,
        driveUrl: meta.driveUrl || currentDriveMeta.driveUrl,
        driveSavedAt: meta.driveSavedAt || currentDriveMeta.driveSavedAt
      };
    }
  }

  /* ================== raccolta / caricamento ================== */
  function raccogli(){
    const p = {
      id: window.corrente || ("p"+Date.now()),
      numero: val("numero"), data: val("data"), validita: val("validita"), stato: val("stato"),
      cliente:{nome:val("cl_nome"),ref:val("cl_ref"),indirizzo:val("cl_indirizzo"),
               piva:val("cl_piva"),email:val("cl_email"),tel:val("cl_tel")},
      progetto:{titolo:val("pr_titolo"),tipo:val("pr_tipo"),luogo:val("pr_luogo"),
                giornate:val("pr_giornate"),consegna:val("pr_consegna"),
                saluto:val("pr_saluto"),intro:val("pr_intro")},
      voci: leggiVoci(),
      sconto: parseFloat(val("sconto"))||0, sconto_txt: val("sconto_txt"),
      regime: regimeAttivo(), ritenuta: parseFloat(val("ritenuta"))||0,
      rivalsa: parseFloat(val("rivalsa"))||0, iva: parseFloat(val("iva"))||0, bollo: val("bollo"),
      incluso: val("incluso").split("\n").map(s=>s.trim()).filter(Boolean),
      escluso: val("escluso").split("\n").map(s=>s.trim()).filter(Boolean),
      opzioni: leggiOpzioni(), condizioni: leggiCondizioni(),
      io:{cf:val("io_cf"),iban:val("io_iban"),indirizzo:val("io_indirizzo"),piva:val("io_piva")},
      totale: totali().netto,
      modificato: new Date().toISOString()
    };

    if (currentDriveMeta.driveFileId) p.driveFileId = currentDriveMeta.driveFileId;
    if (currentDriveMeta.driveUrl) p.driveUrl = currentDriveMeta.driveUrl;
    if (currentDriveMeta.driveSavedAt) p.driveSavedAt = currentDriveMeta.driveSavedAt;
    if (currentAnnullamento) p.annullamento = currentAnnullamento;
    if (currentCestinato) p.cestinato = true;
    if (currentEliminatoIl) p.eliminatoIl = currentEliminatoIl;

    return (typeof sanificaPreventivo === "function") ? sanificaPreventivo(p) : p;
  }

  function carica(p){
    if (typeof sanificaPreventivo === "function") {
      p = sanificaPreventivo(p);
    }
    clearTimeout(window.timerBozza);
    window.corrente = p.id;
    currentDriveMeta = {
      driveFileId: p.driveFileId || null,
      driveUrl: p.driveUrl || null,
      driveSavedAt: p.driveSavedAt || null
    };
    currentAnnullamento = p.annullamento || null;
    currentCestinato = p.cestinato === true;
    currentEliminatoIl = p.eliminatoIl || null;

    set("numero",p.numero); set("data",p.data); set("validita",p.validita); set("stato",p.stato||"bozza"); 
    if(typeof aggiornaPilloleStato === "function") aggiornaPilloleStato(p.stato||"bozza");
    ["nome","ref","indirizzo","piva","email","tel"].forEach(k=>set("cl_"+k,(p.cliente||{})[k]));
    ["titolo","tipo","luogo","giornate","consegna","saluto","intro"].forEach(k=>set("pr_"+k,(p.progetto||{})[k]));
    document.getElementById("corpo-voci").innerHTML="";
    (p.voci||[]).forEach(v=>aggiungiVoce(v));
    set("sconto",p.sconto||0); set("sconto_txt",p.sconto_txt||"");
    set("regime",p.regime||"occasionale");
    set("ritenuta",p.ritenuta!=null?p.ritenuta:20);
    set("rivalsa",p.rivalsa||0); set("iva",p.iva!=null?p.iva:22); set("bollo",p.bollo||"auto");
    set("incluso",(p.incluso||[]).join("\n")); set("escluso",(p.escluso||[]).join("\n"));
    document.getElementById("corpo-opzioni").innerHTML="";
    (p.opzioni||[]).forEach(o=>aggiungiOpzione(o));
    document.getElementById("corpo-condizioni").innerHTML="";
    (p.condizioni||CONDIZIONI_STD).forEach(c=>aggiungiCondizione(c));
    const io=p.io||datiIo();
    set("io_cf",io.cf); set("io_iban",io.iban); set("io_indirizzo",io.indirizzo); set("io_piva",io.piva);
    cambiaRegime();
    document.getElementById("btn-elimina").style.display="inline-block";
    impostaStatoSalvataggio("Aperto: "+(p.numero||"senza numero"));
    window.modificatoNonSalvato = false;
    clearTimeout(window.timerBozza);
    if(typeof aggiornaEtichettaEliminazione === "function") aggiornaEtichettaEliminazione();
    calcola(); vista("editor"); window.scrollTo(0,0);
    if(typeof ultimoClienteAutocompilato !== "undefined") {
      ultimoClienteAutocompilato = normalizzaCliente(p.cliente?.nome);
    }
    aggiornaSceltaRubrica();aggiornaNomePdf();

    // Registra lo stato aperto nella cronologia Undo/Redo
    if (typeof window.editorRecordHistory === "function") {
      window.editorRecordHistory(true);
    }
  }

  function prossimoNumero(){
    const anno = new Date().getFullYear();
    const regex = new RegExp(`^FC_${anno}_(\\d+)`, "i");
    let maxNum = 0;
    archivio().forEach(p => {
      const m = (p.numero || "").match(regex);
      if (m) {
        const valNum = parseInt(m[1], 10);
        if (!isNaN(valNum) && valNum > maxNum) maxNum = valNum;
      }
    });
    return "FC_" + anno + "_" + String(maxNum + 1).padStart(2, "0");
  }

  function nuovo(){
    if(window.modificatoNonSalvato && !confirm("Ci sono modifiche non salvate nel preventivo corrente. Continuare creando un nuovo preventivo?")) {
      return;
    }
    window.corrente = null;
    currentDriveMeta = { driveFileId: null, driveUrl: null, driveSavedAt: null };
    currentAnnullamento = null;
    currentCestinato = false;
    currentEliminatoIl = null;
    if(sicurezzaPronta) cancellaBozza();
    const oggi=new Date();
    const fra30=new Date();
    fra30.setDate(oggi.getDate()+30);

    set("numero",prossimoNumero());
    set("data",aIsoLocale(oggi));
    set("validita",aIsoLocale(fra30));
    set("stato","bozza");
    ["cl_nome","cl_ref","cl_indirizzo","cl_piva","cl_email","cl_tel",
     "pr_titolo","pr_tipo","pr_luogo","pr_giornate","pr_consegna","pr_intro"].forEach(k=>set(k,""));
    set("pr_saluto","Gentile "); set("sconto",0); set("sconto_txt","Sconto pacchetto");
    const ultimo=archivio()[0];
    set("regime", (ultimo&&ultimo.regime) || datiIo().regime || "occasionale");
    set("ritenuta","20"); set("rivalsa", (ultimo&&ultimo.rivalsa)||0); set("iva","22"); set("bollo","auto");
    document.getElementById("corpo-voci").innerHTML="";
    document.getElementById("corpo-opzioni").innerHTML="";
    aggiungiVoce();
    set("incluso",INCLUSO_STD.join("\n")); set("escluso",ESCLUSO_STD.join("\n"));
    condizioniStandard(false);
    const io=datiIo(); set("io_cf",io.cf); set("io_iban",io.iban); set("io_indirizzo",io.indirizzo); set("io_piva",io.piva);
    document.getElementById("btn-elimina").style.display="none";
    impostaStatoSalvataggio("Nuovo preventivo, non ancora salvato");
    window.modificatoNonSalvato = false;
    clearTimeout(window.timerBozza);
    cambiaRegime(); vista("editor"); window.scrollTo(0,0);
    if(typeof ultimoClienteAutocompilato !== "undefined") {
      ultimoClienteAutocompilato = null;
    }
    if(typeof nascondiFeedbackRubrica === "function") nascondiFeedbackRubrica();
    aggiornaSceltaRubrica();aggiornaNomePdf();

    // Reset cronologia Undo/Redo per il nuovo preventivo
    if (typeof window.editorResetHistory === "function") {
      window.editorResetHistory();
    }
    if (typeof window.editorRecordHistory === "function") {
      window.editorRecordHistory(true);
    }
  }

  function salvaVerificato(){
    let p = raccogli();
    if (typeof sanificaPreventivo === "function") {
      p = sanificaPreventivo(p);
    }
    const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).slice();
    const i = tutti.findIndex(x => x.id === p.id);
    if(i>=0) tutti[i]=Object.assign({},tutti[i],p); else tutti.unshift(p);
    salvaArchivio(tutti);
    try {
      localStorage.setItem(CHIAVE_IO, JSON.stringify(Object.assign({}, p.io, { regime: p.regime })));
    } catch(e) {}
    window.corrente = p.id;
    window.modificatoNonSalvato = false;
    document.getElementById("btn-elimina").style.display="inline-block";
    cancellaBozza();
    if(typeof aggiornaEtichettaEliminazione === "function") aggiornaEtichettaEliminazione();
    impostaStatoSalvataggio("Salvato nell’archivio alle "+oraLocale());
    disegnaArchivio();

    // Sincronizzazione automatica Firebase Cloud
    if(window.FirebaseSync && typeof window.FirebaseSync.salvaImmediato === "function"){
      window.FirebaseSync.salvaImmediato(true);
    } else if(window.FirebaseSync && typeof window.FirebaseSync.sincronizzaPreventivo === "function"){
      window.FirebaseSync.sincronizzaPreventivo(p);
      avviso("Preventivo salvato nell'archivio.");
    } else {
      avviso("Preventivo salvato nell'archivio.");
    }
  }

  function eliminaCorrente(){ gestisciEliminazione(); }

  function aggiornaValidita(){
    const d=val("data"); if(!d) return;
    const parti = d.split("-").map(Number);
    if(parti.length < 3 || isNaN(parti[0])) return;
    const v = new Date(parti[0], parti[1]-1, parti[2]);
    v.setDate(v.getDate()+30);
    set("validita", aIsoLocale(v));
    segnaModificato();
  }

  /* ================== Navigazione Schede (Viste) ================== */
  function vista(v){
    const esegui = () => {
      window.modificatoNonSalvato = false;
      document.getElementById("vista-editor").style.display = v==="editor"?"block":"none";
      document.getElementById("vista-archivio").style.display = v==="archivio"?"block":"none";
      document.getElementById("vista-listino").style.display = v==="listino"?"block":"none";
      const vCli = document.getElementById("vista-clienti");
      if(vCli) vCli.style.display = v==="clienti"?"block":"none";

      document.getElementById("tab-ed").classList.toggle("attivo", v==="editor");
      document.getElementById("tab-ar").classList.toggle("attivo", v==="archivio");
      document.getElementById("tab-li").classList.toggle("attivo", v==="listino");
      const tCli = document.getElementById("tab-cl");
      if(tCli) tCli.classList.toggle("attivo", v==="clienti");

      const mobEd = document.getElementById("mob-tab-ed");
      const mobAr = document.getElementById("mob-tab-ar");
      const mobLi = document.getElementById("mob-tab-li");
      const mobCl = document.getElementById("mob-tab-cl");
      if(mobEd) mobEd.classList.toggle("attivo", v==="editor");
      if(mobAr) mobAr.classList.toggle("attivo", v==="archivio");
      if(mobLi) mobLi.classList.toggle("attivo", v==="listino");
      if(mobCl) mobCl.classList.toggle("attivo", v==="clienti");

      const mobBar = document.getElementById("mobile-editor-bar");
      if(mobBar) {
        mobBar.classList.toggle("visibile", v === "editor");
        mobBar.style.display = "";
      }

      if(v==="archivio") disegnaArchivio();
      if(v==="listino") disegnaListino();
      if(v==="clienti" && typeof disegnaClienti === "function") disegnaClienti();
    };

    if(v !== "editor" && window.modificatoNonSalvato) {
      modaleSicurezza(
        "Modifiche non salvate",
        "<p style='margin:0 0 16px 0;line-height:1.5'>Attenzione: ci sono modifiche non salvate nel preventivo. Vuoi cambiare scheda perdendo le ultime modifiche?</p>",
        [
          { testo: "Rimani qui", classe: "chiaro" },
          {
            testo: "Cambia scheda",
            primario: true,
            classe: "pericolo",
            esegui: () => {
              window.modificatoNonSalvato = false;
              esegui();
            }
          }
        ]
      );
      return;
    }
    esegui();
  }

  function apri(id){ if(!consentiCambioEditor()) return; const p=archivio().find(x=>x.id===id); if(p) carica(p); }

  function duplica(id){
    if(!consentiCambioEditor()) return;
    const p=archivio().find(x=>x.id===id); if(!p) return;
    const c=JSON.parse(JSON.stringify(p));
    c.id=null; c.numero=prossimoNumero(); c.stato="bozza";
    const oggi = new Date();
    const fra30 = new Date();
    fra30.setDate(oggi.getDate()+30);
    c.data=aIsoLocale(oggi);
    c.validita=aIsoLocale(fra30);
    carica(Object.assign(c,{id:"p"+Date.now()})); if(typeof aggiornaPilloleStato === "function") aggiornaPilloleStato("bozza");
    window.corrente=null;
    document.getElementById("btn-elimina").style.display="none";
    impostaStatoSalvataggio("Copia non ancora salvata");
    segnaModificato();
    avviso("Copia creata: controlla numero e date.");
  }

  /* ================== Avvio Applicazione ================== */
  inizializzaTema();
  initPrefFirma();
  document.getElementById("header-logo").innerHTML = LOGO_NAVBAR;
  const gateLogo = document.getElementById("auth-gate-logo");
  if(gateLogo) gateLogo.innerHTML = LOGO_NAVBAR;
  nuovo();
  aggiornaTendinaListino();
  disegnaArchivio();
  if(archivio().length){ vista("archivio"); }
  inizializzaSicurezza();
  inizializzaProduttivita();
  if(window.FirebaseAuthModule && typeof window.FirebaseAuthModule.inizializza === "function"){
    window.FirebaseAuthModule.inizializza();
  }
  if(window.FirebaseSync && typeof window.FirebaseSync.inizializza === "function"){
    window.FirebaseSync.inizializza();
  }

  const detScorciatoie = document.getElementById("dettagli-scorciatoie");
  if(detScorciatoie){
    detScorciatoie.open = localStorage.getItem("fc_pref_mostra_scorciatoie") === "1";
    detScorciatoie.addEventListener("toggle", function(){
      try{ localStorage.setItem("fc_pref_mostra_scorciatoie", this.open ? "1" : "0"); }catch(e){}
    });
  }

  /* ================== Scorciatoie da tastiera (UX) ================== */
  window.addEventListener("keydown", function(e){
    if(document.querySelector("dialog[open]")) return;
    
    // Ctrl+S o Cmd+S: Salva nell'archivio
    if((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "s"){
      e.preventDefault();
      salva();
    }
    // Ctrl+P o Cmd+P: Stampa preventivo PDF
    else if((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "p"){
      e.preventDefault();
      stampaPreventivo();
    }
    // Alt+N: Aggiungi nuova riga vuota
    else if(e.altKey && e.key.toLowerCase() === "n"){
      e.preventDefault();
      aggiungiVoce();
      const rows = document.querySelectorAll("#corpo-voci tr");
      const lastInput = rows[rows.length - 1]?.querySelector("input");
      if(lastInput) lastInput.focus();
    }
    // Ctrl+Z o Cmd+Z: Annulla modifica editor (Undo)
    else if((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z"){
      const attivoEditor = document.getElementById("vista-editor")?.style.display !== "none";
      if(attivoEditor && typeof window.editorUndo === "function"){
        e.preventDefault();
        window.editorUndo();
      }
    }
    // Ctrl+Y o Cmd+Shift+Z o Ctrl+Shift+Z: Ripristina modifica editor (Redo)
    else if(((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
            ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")){
      const attivoEditor = document.getElementById("vista-editor")?.style.display !== "none";
      if(attivoEditor && typeof window.editorRedo === "function"){
        e.preventDefault();
        window.editorRedo();
      }
    }
  });

  // Registrazione modulo Quotes & UI in App
  if(window.App){
    window.App.quotes = Object.assign(window.App.quotes || {}, {
      collect: raccogli,
      load: carica,
      newQuote: nuovo,
      nextNumber: prossimoNumero,
      saveVerified: salvaVerificato,
      open: apri,
      duplicate: duplica,
      deleteCurrent: eliminaCorrente
    });

    if(window.App.ui){
      window.App.ui.switchView = vista;
    }
  }

  function toggleMenuStatoMobile() {
    const sheet = document.getElementById("mob-status-sheet");
    if(sheet) sheet.style.display = sheet.style.display === "flex" ? "none" : "flex";
  }
  function toggleMenuAzioniMobile() {
    const sheet = document.getElementById("mob-actions-sheet");
    if(sheet) sheet.style.display = sheet.style.display === "flex" ? "none" : "flex";
  }

  // Facade globale
  window.raccogli = raccogli;
  window.carica = carica;
  window.prossimoNumero = prossimoNumero;
  window.nuovo = nuovo;
  window.salvaVerificato = salvaVerificato;
  window.eliminaCorrente = eliminaCorrente;
  window.aggiornaValidita = aggiornaValidita;
  window.vista = vista;
  window.apri = apri;
  window.duplica = duplica;
  window.setDriveMeta = setDriveMeta;
  window.toggleMenuStatoMobile = toggleMenuStatoMobile;
  window.toggleMenuAzioniMobile = toggleMenuAzioniMobile;

})(typeof window !== "undefined" ? window : globalThis);
