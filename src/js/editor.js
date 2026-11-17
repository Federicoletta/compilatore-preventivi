/* ================== righe voci ================== */
let rigaTrascinata = null;

function rigaVoce(v={}){
  const tr=document.createElement("tr");
  tr.innerHTML=`
    <td class="col-m"><span class="maniglia" title="Trascina per riordinare" draggable="false">⠿</span></td>
    <td>
      <input class="nome" placeholder="Nome della voce" value="${esc(v.nome||"")}">
      <textarea class="desc" placeholder="Descrizione — cosa comprende, quante ore, cosa consegni">${esc(v.desc||"")}</textarea>
    </td>
    <td class="n col-q">
      <div class="stepper-box stepper-qta">
        <button type="button" class="stepper-btn stepper-meno" tabindex="-1" aria-label="Diminuisci quantità" title="Diminuisci (−1, Shift per −0.5)">−</button>
        <input class="num" type="number" step="0.5" min="0" value="${v.q!=null?v.q:1}">
        <button type="button" class="stepper-btn stepper-piu" tabindex="-1" aria-label="Aumenta quantità" title="Aumenta (+1, Shift per +0.5)">+</button>
      </div>
    </td>
    <td class="n col-p">
      <div class="stepper-box stepper-prezzo">
        <button type="button" class="stepper-btn stepper-p-meno" tabindex="-1" aria-label="Diminuisci prezzo" title="Diminuisci (−10€, Shift per −1€)">−</button>
        <input class="num" type="number" step="0.01" min="0" value="${v.p!=null?v.p:0}">
        <button type="button" class="stepper-btn stepper-p-piu" tabindex="-1" aria-label="Aumenta prezzo" title="Aumenta (+10€, Shift per +1€)">+</button>
      </div>
    </td>
    <td class="tot-cella">€ 0,00</td>
    <td><div class="azioni-voce">
      <button class="btn mini duplica-voce" title="Duplica la riga" aria-label="Duplica la riga">⧉</button>
      <button class="btn mini pericolo elimina-voce" title="Elimina la riga" aria-label="Elimina la riga">×</button>
    </div></td>`;

  const btnMeno = tr.querySelector(".stepper-meno");
  const btnPiu = tr.querySelector(".stepper-piu");
  const inputQ = tr.querySelector(".col-q input");
  if(btnMeno && btnPiu && inputQ){
    btnMeno.addEventListener("click", (e)=>{
      let val = parseFloat(inputQ.value) || 0;
      const step = e.shiftKey ? 0.5 : 1;
      val = Math.max(0, val - step);
      inputQ.value = Math.round(val * 100) / 100;
      calcola();
      segnaModificato();
    });
    btnPiu.addEventListener("click", (e)=>{
      let val = parseFloat(inputQ.value) || 0;
      const step = e.shiftKey ? 0.5 : 1;
      val = val + step;
      inputQ.value = Math.round(val * 100) / 100;
      calcola();
      segnaModificato();
    });
  }

  const btnPMeno = tr.querySelector(".stepper-p-meno");
  const btnPPiu = tr.querySelector(".stepper-p-piu");
  const inputP = tr.querySelector(".col-p input");
  if(btnPMeno && btnPPiu && inputP){
    btnPMeno.addEventListener("click", (e)=>{
      let val = parseFloat(inputP.value) || 0;
      const step = e.shiftKey ? 1 : 10;
      val = Math.max(0, val - step);
      inputP.value = Math.round(val * 100) / 100;
      calcola();
      segnaModificato();
    });
    btnPPiu.addEventListener("click", (e)=>{
      let val = parseFloat(inputP.value) || 0;
      const step = e.shiftKey ? 1 : 10;
      val = val + step;
      inputP.value = Math.round(val * 100) / 100;
      calcola();
      segnaModificato();
    });
  }

  const m = tr.querySelector(".maniglia");
  m.addEventListener("mousedown", ()=>{ tr.draggable = true; });
  m.addEventListener("mouseup", ()=>{ tr.draggable = false; });
  m.addEventListener("mouseleave", ()=>{ if(!rigaTrascinata) tr.draggable = false; });

  tr.addEventListener("dragstart", (e)=>{
    rigaTrascinata = tr;
    tr.classList.add("trascinamento");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  });

  tr.addEventListener("dragend", ()=>{
    tr.classList.remove("trascinamento");
    tr.draggable = false;
    rigaTrascinata = null;
    calcola();
    segnaModificato();
  });

  tr.querySelectorAll("input,textarea").forEach(i=>{
    i.addEventListener("input", ()=>{ calcola(); segnaModificato(); });
  });
  tr.querySelector(".elimina-voce").onclick=()=>{ tr.remove(); calcola(); segnaModificato(); };
  tr.querySelector(".duplica-voce").onclick=()=>{
    const i=tr.querySelectorAll("input");
    const copia=rigaVoce({nome:i[0].value,desc:tr.querySelector("textarea").value,q:i[1].value,p:i[2].value});
    tr.after(copia);calcola();segnaModificato();
    copia.querySelector(".nome").focus();copia.querySelector(".nome").select();
    avviso("Riga duplicata: modifica nome, quantità o prezzo.");
  };
  return tr;
}

const corpoVoci = document.getElementById("corpo-voci");
if(corpoVoci){
  corpoVoci.addEventListener("dragover", (e)=>{
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if(!rigaTrascinata) return;
    const targetTr = e.target.closest("#corpo-voci tr");
    if(!targetTr || targetTr === rigaTrascinata) return;

    const rect = targetTr.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if(e.clientY < midY){
      if(rigaTrascinata.nextElementSibling !== targetTr){
        corpoVoci.insertBefore(rigaTrascinata, targetTr);
      }
    } else {
      if(targetTr.nextElementSibling !== rigaTrascinata){
        corpoVoci.insertBefore(rigaTrascinata, targetTr.nextElementSibling);
      }
    }
  });

  corpoVoci.addEventListener("drop", (e)=>{
    e.preventDefault();
    calcola();
    segnaModificato();
  });
}

window.addEventListener("mouseup", ()=>{
  if(!rigaTrascinata){
    document.querySelectorAll("#corpo-voci tr[draggable='true']").forEach(tr=>{ tr.draggable = false; });
  }
});
function aggiungiVoce(v){
  document.getElementById("corpo-voci").appendChild(rigaVoce(v||{}));
  calcola();
  if(sicurezzaPronta) segnaModificato();
}
function vociTipo(k){
  PACCHETTI[k].forEach(([n,d,q,p])=>aggiungiVoce({nome:n,desc:d,q:q,p:p}));
  segnaModificato();
  avviso("Pacchetto aggiunto: modifica pure quantità e prezzi.");
}
function leggiVoci(){
  return [...document.querySelectorAll("#corpo-voci tr")].map(tr=>{
    const i=tr.querySelectorAll("input");
    return {nome:i[0].value, desc:tr.querySelector("textarea").value,
            q:parseFloat(i[1].value)||0, p:parseFloat(i[2].value)||0};
  }).filter(v=>v.nome||v.desc||v.p);
}

function rigaOpzione(o={}){
  const tr=document.createElement("tr");
  tr.innerHTML=`
    <td class="col-m"><span class="maniglia" role="button" tabindex="0" aria-label="Riordina opzione" title="Trascina per riordinare; Alt + freccia su/giù da tastiera" draggable="false">⠿</span></td>
    <td>
      <input class="nome" placeholder="Nome dell'opzione" value="${esc(o.nome||"")}">
      <textarea class="desc" placeholder="Descrizione">${esc(o.desc||"")}</textarea>
    </td>
    <td class="n"><input class="num" type="number" step="0.01" value="${o.p!=null?o.p:0}"></td>
    <td><button class="btn mini pericolo">×</button></td>`;
  tr.querySelectorAll("input,textarea").forEach(i=>i.addEventListener("input",segnaModificato));
  tr.querySelector("button").onclick=()=>{ tr.remove(); segnaModificato(); };
  abilitaRiordinoExtra(tr);
  return tr;
}
function aggiungiOpzione(o){
  document.getElementById("corpo-opzioni").appendChild(rigaOpzione(o||{}));
  if(sicurezzaPronta) segnaModificato();
}
function leggiOpzioni(){
  return [...document.querySelectorAll("#corpo-opzioni tr")].map(tr=>{
    const i=tr.querySelectorAll("input");
    return {nome:i[0].value, desc:tr.querySelector("textarea").value, p:parseFloat(i[1].value)||0};
  }).filter(o=>o.nome);
}

function rigaCondizione(c=["",""]){
  const d=document.createElement("div");
  d.className="riga-condizione";
  d.innerHTML=`
    <span class="maniglia" role="button" tabindex="0" aria-label="Riordina condizione" title="Trascina per riordinare; Alt + freccia su/giù da tastiera" draggable="false">⠿</span>
    <input value="${esc(c[0])}" placeholder="Titolo" class="cond-input">
    <textarea rows="2" placeholder="Testo della condizione" class="cond-textarea">${esc(c[1])}</textarea>
    <button class="btn mini pericolo elimina-condizione" aria-label="Elimina condizione">×</button>`;
  d.querySelectorAll("input,textarea").forEach(i=>i.addEventListener("input",segnaModificato));
  d.querySelector("button").onclick=()=>{ d.remove(); segnaModificato(); };
  abilitaRiordinoExtra(d);
  return d;
}
function aggiungiCondizione(c){
  document.getElementById("corpo-condizioni").appendChild(rigaCondizione(c||["",""]));
  if(sicurezzaPronta) segnaModificato();
}
function condizioniStandard(avvisa){
  document.getElementById("corpo-condizioni").innerHTML="";
  CONDIZIONI_STD.forEach(c=>aggiungiCondizione(c));
  segnaModificato();
  if(avvisa) avviso("Condizioni standard ripristinate.");
}
function leggiCondizioni(){
  return [...document.querySelectorAll("#corpo-condizioni > div")].map(d=>{
    return [d.querySelector("input").value, d.querySelector("textarea").value];
  }).filter(c=>c[0]||c[1]);
}

/* ================== listener modifiche ================== */
document.querySelectorAll("#vista-editor input, #vista-editor select, #vista-editor textarea").forEach(el=>{
  el.addEventListener("input", segnaModificato);
  el.addEventListener("change", segnaModificato);
});
document.getElementById("sconto_txt").addEventListener("input", calcola);

window.addEventListener("beforeunload", (e)=>{
  if(modificatoNonSalvato){
    salvaBozza();
    e.preventDefault();
    e.returnValue = "";
  }
});

/* ================== produttività: rubrica, email, righe e nomi PDF ================== */
let ultimoClienteAutocompilato = null;

function normalizzaCliente(s){return String(s||"").trim().replace(/\s+/g," ").toLocaleLowerCase("it-IT");}

function clientiRubrica(){
  const m=new Map();
  const ordinati=archivio().filter(p=>typeof p?.cliente?.nome==="string"&&p.cliente.nome.trim()).slice().sort((a,b)=>{
    const tempo=p=>Date.parse(p.modificato||p.data)||0;
    return tempo(b)-tempo(a);
  });
  ordinati.forEach(p=>{
    const c=p.cliente, chiave=normalizzaCliente(c.nome)+"|"+normalizzaCliente(c.piva||"").replace(/\s/g,"");
    if(!m.has(chiave)) m.set(chiave,{cliente:{...c},numero:p.numero,data:p.modificato||p.data||""});
  });
  return [...m.values()].sort((a,b)=>a.cliente.nome.localeCompare(b.cliente.nome,"it"));
}

function aggiornaRubrica(){
  const dl=document.getElementById("rubrica-clienti");if(!dl)return;
  const nomi=new Map();
  clientiRubrica().forEach(x=>{
    const k = normalizzaCliente(x.cliente.nome);
    if(!nomi.has(k)) nomi.set(k, x.cliente.nome);
  });
  dl.innerHTML=[...nomi.values()].map(n=>`<option value="${esc(n)}"></option>`).join("");
  aggiornaSceltaRubrica();
}

function corrispondenzeCliente(nomeInput){
  const nome = normalizzaCliente(nomeInput != null ? nomeInput : val("cl_nome"));
  if(!nome) return [];
  const cards = clientiRubrica().filter(x => normalizzaCliente(x.cliente.nome) === nome);
  cards.sort((a, b) => (Date.parse(b.data) || 0) - (Date.parse(a.data) || 0));
  return cards;
}

function mostraFeedbackRubrica(x){
  const box = document.getElementById("rubrica-feedback");
  const info = document.getElementById("rubrica-info");
  const btnAltre = document.getElementById("btn-cambia-scheda-cliente");
  if(!box) return;
  
  box.style.display = "flex";
  const numPrev = x.numero ? `preventivo ${x.numero}` : "archivio";
  if(info) {
    info.textContent = `Dati anagrafici e fiscali compilati automaticamente da ${numPrev}`;
  }
  const candidati = corrispondenzeCliente(x.cliente.nome);
  if(btnAltre) {
    btnAltre.style.display = candidati.length > 1 ? "inline-block" : "none";
  }
}

function nascondiFeedbackRubrica(){
  const box = document.getElementById("rubrica-feedback");
  if(box) box.style.display = "none";
}

function applicaDatiCliente(x, mostraAvvisoToast = false){
  if(!x || !x.cliente) return;
  const c = x.cliente;
  const campi = ["ref","indirizzo","piva","email","tel"];
  
  if(c.nome) set("cl_nome", c.nome);
  campi.forEach(k => set("cl_" + k, c[k] || ""));
  
  ultimoClienteAutocompilato = normalizzaCliente(c.nome);
  segnaModificato();
  aggiornaNomePdf();
  
  mostraFeedbackRubrica(x);
  if(mostraAvvisoToast) {
    avviso("Dati cliente compilati dalla rubrica.");
  }
}

function aggiornaSceltaRubrica(){
  const nomeAttuale = val("cl_nome").trim();
  const nomeNorm = normalizzaCliente(nomeAttuale);
  
  if(!nomeNorm) {
    ultimoClienteAutocompilato = null;
    nascondiFeedbackRubrica();
    return;
  }
  
  // Se è già stato autocompilato per questo nome, non sovrascrivere mentre l'utente modifica altri campi
  if(nomeNorm === ultimoClienteAutocompilato) {
    return;
  }
  
  const candidati = corrispondenzeCliente(nomeNorm);
  if(!candidati.length) {
    ultimoClienteAutocompilato = null;
    nascondiFeedbackRubrica();
    return;
  }
  
  // Trovata corrispondenza: autocompila immediatamente tutti i campi!
  applicaDatiCliente(candidati[0], false);
}

function apriSceltaSchedaCliente(){
  const candidati = corrispondenzeCliente();
  if(!candidati.length) return;
  modaleSicurezza("Seleziona versione dati cliente", "<p>Questo cliente compare in più preventivi con identificativi o recapiti differenti. Seleziona quale scheda utilizzare:</p>", [
    ...candidati.map(x => ({
      testo: `${x.cliente.nome} · ${x.cliente.piva || "P. IVA assente"} · ${x.cliente.indirizzo || x.cliente.email || ""} (${x.numero || "Prev."})`,
      esegui: () => applicaDatiCliente(x, true)
    })),
    { testo: "Annulla" }
  ]);
}

function compilaClienteRubrica(){
  aggiornaSceltaRubrica();
}
function nomeFileDocumento(tipo="Preventivo",p=null){
  p=p||{numero:val("numero"),cliente:{nome:val("cl_nome")},progetto:{titolo:val("pr_titolo")}};
  const parte=(s,fallback,max)=>sanitizzaNomeFile(String(s||"").normalize("NFC")).slice(0,max).replace(/_+$/,"")||fallback;
  return `${parte(p.numero,"SenzaNumero",32)}_${parte(p.cliente?.nome,"Cliente",60)}_${parte(p.progetto?.titolo,"Progetto",60)}_${parte(tipo,"Preventivo",20)}.pdf`;
}
function aggiornaNomePdf(){ /* no-op / compatibilità */ }
function testoEmailAccompagnamento(p){
  const nome=(p.cliente.ref||p.cliente.nome||"[nome cliente]").trim();
  const progetto=p.progetto.titolo||"[titolo progetto]",numero=p.numero||"[numero preventivo]";
  const validita=p.validita?`\nLa validità indicata nel documento è fino al ${dataIt(p.validita)}.\n`:"";
  return `Oggetto: Preventivo ${numero} | ${progetto}\n\nCiao ${nome},\n\nin allegato trovi il preventivo ${numero} per il progetto “${progetto}”, con il dettaglio delle attività e delle condizioni proposte.\n${validita}\nResto a disposizione per qualsiasi chiarimento o confronto tecnico.\n\nUn saluto,\n${IO.nome}\nDirettore della Fotografia / Videomaker`;
}
function mostraEmailAccompagnamento(){
  const p=raccogli(), testo=testoEmailAccompagnamento(p);
  const incompleto=!p.cliente.nome||!p.numero||!p.progetto.titolo;
  const scaduto=p.validita&&p.validita<aIsoLocale(new Date());
  const d=modaleSicurezza("Email di accompagnamento",`<p>Controlla e modifica il testo, poi copialo nella tua email. Ricorda di allegare il PDF: questa funzione non invia messaggi e non allega file.</p>
    ${incompleto?"<p>Attenzione: mancano numero, cliente o titolo del progetto. Completa i segnaposto prima dell’invio.</p>":""}
    ${scaduto?"<p>Attenzione: la validità del preventivo è scaduta. Verifica la data prima dell’invio.</p>":""}
    <label for="testo-email-copia">Oggetto e messaggio</label><textarea id="testo-email-copia" class="testo-copia">${esc(testo)}</textarea>
    <div style="margin-top:12px"><button class="btn pieno" id="copia-email-conferma">Copia negli appunti</button></div>`,[{testo:"Chiudi"}]);
  const area=d.querySelector("#testo-email-copia");
  d.querySelector("#copia-email-conferma").onclick=()=>copiaTestoLocale(area.value,area);
}
async function copiaTestoLocale(testo,area=null){
  const feedback=messaggio=>{
    avviso(messaggio);
    const dialog=area?.closest("dialog");
    if(dialog?.isConnected){
      let esito=dialog.querySelector(".copia-esito");
      if(!esito){esito=document.createElement("p");esito.className="copia-esito";esito.setAttribute("role","status");area.after(esito);}
      esito.textContent=messaggio;
    }
  };
  try{
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(testo);feedback("Testo copiato negli appunti.");return;}
  }catch(e){/* Nei file locali il browser può negare la Clipboard API: usa il fallback. */}
  let d=null;
  if(!area){
    d=modaleSicurezza("Copia nome PDF",`<p>Se la copia automatica non è disponibile, premi Ctrl+C o Cmd+C sul testo selezionato.</p><textarea class="testo-copia" style="min-height:90px" readonly>${esc(testo)}</textarea>`,[{testo:"Chiudi"}]);
    area=d.querySelector("textarea");
  }
  area.focus();area.select();
  try{if(document.execCommand("copy")){if(d){d.close();d.remove();}feedback("Testo copiato negli appunti.");return;}}catch(e){}
  feedback("Copia automatica non disponibile: premi Ctrl+C o Cmd+C sul testo selezionato.");
}
let trascinataExtra=null;
function abilitaRiordinoExtra(el){
  const maniglia=el.querySelector(".maniglia");if(!maniglia)return;
  maniglia.draggable=true;
  maniglia.style.userSelect="none";
  el.addEventListener("dragstart",e=>{
    if(e.target!==maniglia)return;
    trascinataExtra={el,contenitore:el.parentElement,indice:[...el.parentElement.children].indexOf(el)};
    el.classList.add("trascinamento");e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain","riordino-locale");
    e.dataTransfer.setDragImage(el,12,12);
  });
  el.addEventListener("dragover",e=>{
    const corrente=trascinataExtra;
    if(!corrente||corrente.el===el||corrente.contenitore!==el.parentElement)return;
    e.preventDefault();e.dataTransfer.dropEffect="move";
    const sopra=e.clientY<el.getBoundingClientRect().top+el.getBoundingClientRect().height/2;
    if(sopra){if(corrente.el.nextElementSibling!==el)el.before(corrente.el);}
    else if(el.nextElementSibling!==corrente.el)el.after(corrente.el);
  });
  el.addEventListener("drop",e=>{if(trascinataExtra?.contenitore===el.parentElement)e.preventDefault();});
  el.addEventListener("dragend",()=>{
    const corrente=trascinataExtra;
    el.classList.remove("trascinamento");el.draggable=false;trascinataExtra=null;
    if(corrente&&[...corrente.contenitore.children].indexOf(el)!==corrente.indice)segnaModificato();
  });
  maniglia.addEventListener("keydown",e=>{
    if(!e.altKey||!["ArrowUp","ArrowDown"].includes(e.key))return;
    e.preventDefault();
    const vicino=e.key==="ArrowUp"?el.previousElementSibling:el.nextElementSibling;
    if(!vicino)return;
    if(e.key==="ArrowUp")vicino.before(el);else vicino.after(el);
    maniglia.focus();segnaModificato();
  });
}
function inizializzaProduttivita(){
  const titoloOriginale=document.title;
  window.addEventListener("afterprint",()=>{document.title=titoloOriginale;});
  window.addEventListener("mouseup",()=>{
    if(!trascinataExtra)document.querySelectorAll("#corpo-opzioni tr,#corpo-condizioni > div").forEach(el=>el.draggable=false);
  });
  ["numero","cl_nome","pr_titolo"].forEach(id=>["input","change"].forEach(ev=>document.getElementById(id).addEventListener(ev,aggiornaNomePdf)));
  ["input","change"].forEach(ev=>document.getElementById("cl_nome").addEventListener(ev,aggiornaSceltaRubrica));
  const selStato = document.getElementById("stato");
  if(selStato){
    selStato.addEventListener("change", function(){ aggiornaPilloleStato(this.value); });
    aggiornaPilloleStato(selStato.value);
  }
  aggiornaRubrica();aggiornaNomePdf();initScrollSpyNav();
}

/* ================== gestione pillole stato interattive ================== */
function impostaStato(s){
  const sel = document.getElementById("stato");
  if(sel){ sel.value = s; }
  aggiornaPilloleStato(s);
  segnaModificato();
}

function aggiornaPilloleStato(s){
  s = String(s || "bozza").toLowerCase();
  document.querySelectorAll("#stato-pills-bar .pill-st, .stato-pills .pill-st, .mob-sheet-options .pill-st").forEach(btn => {
    btn.classList.toggle("sel", btn.getAttribute("data-val") === s);
  });
  const mobTxt = document.getElementById("mob-stato-txt");
  const mobDot = document.getElementById("mob-stato-dot");
  const mobBtn = document.getElementById("mob-stato-btn");
  if(mobTxt && mobDot && mobBtn) {
    const labels = { bozza: "Bozza", inviato: "Inviato", accettato: "Accettato", rifiutato: "Rifiutato" };
    const colors = { bozza: "#94A3B8", inviato: "#F59E0B", accettato: "#10B981", rifiutato: "#EF4444" };
    mobTxt.textContent = labels[s] || "Bozza";
    mobDot.style.background = colors[s] || "#94A3B8";
    mobBtn.setAttribute("data-stato", s);
  }
}



/* ================== scrollspy navigazione rapida sezioni ================== */
function initScrollSpyNav(){
  const nav = document.querySelector(".nav-sezioni-rapida");
  if(!nav) return;
  const links = Array.from(nav.querySelectorAll(".pill-nav"));
  const sezioni = [
    { id: "sec-documento", altId: "sec-cliente", link: links[0] },
    { id: "sec-progetto", link: links[1] },
    { id: "sec-voci", link: links[2] },
    { id: "sec-condizioni", link: links[3] }
  ];

  function evidenziaSezione(){
    const scrollPos = window.scrollY || window.pageYOffset;
    const soglia = scrollPos + 160;

    let trovata = null;
    for(const s of sezioni){
      const el = document.getElementById(s.id);
      if(el && el.offsetTop <= soglia){
        trovata = s;
      }
    }
    // Se non ancora raggiunta la prima sezione, evidenzia la prima
    if(!trovata && sezioni[0]) trovata = sezioni[0];

    links.forEach(l => l.classList.remove("attivo"));
    if(trovata && trovata.link){
      trovata.link.classList.add("attivo");
    }
  }

  window.addEventListener("scroll", evidenziaSezione, { passive: true });
  evidenziaSezione();

  // Highlight immediato al click
  links.forEach(l => {
    l.addEventListener("click", () => {
      links.forEach(x => x.classList.remove("attivo"));
      l.classList.add("attivo");
    });
  });
}

/* ================== Editor History (Undo / Redo) ================== */
const editorHistory = {
  stack: [],
  index: -1,
  isOperating: false,
  maxStates: 25,
  debounceTimer: null,

  record(force = false) {
    if (this.isOperating) return;
    if (typeof raccogli !== 'function') return;

    const capture = () => {
      try {
        const state = raccogli();
        const json = JSON.stringify(state);
        if (this.index >= 0 && this.stack[this.index] === json) return;

        this.stack = this.stack.slice(0, this.index + 1);
        this.stack.push(json);
        if (this.stack.length > this.maxStates) {
          this.stack.shift();
        } else {
          this.index++;
        }
        this.updateButtons();
      } catch(e) {}
    };

    if (force) {
      clearTimeout(this.debounceTimer);
      capture();
    } else {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(capture, 400);
    }
  },

  undo() {
    if (this.index > 0) {
      this.index--;
      this.applyCurrent("Undo");
    } else if (typeof avviso === 'function') {
      avviso("Nessuna modifica precedente da annullare.");
    }
  },

  redo() {
    if (this.index < this.stack.length - 1) {
      this.index++;
      this.applyCurrent("Redo");
    } else if (typeof avviso === 'function') {
      avviso("Nessuna modifica successiva da ripristinare.");
    }
  },

  applyCurrent(label) {
    if (this.index < 0 || !this.stack[this.index]) return;
    this.isOperating = true;
    try {
      const state = JSON.parse(this.stack[this.index]);
      if (typeof carica === 'function') {
        carica(state);
        if (typeof avviso === 'function') avviso(`Modifica ${label}: stato ripristinato.`);
      }
    } finally {
      this.isOperating = false;
      this.updateButtons();
    }
  },

  reset() {
    this.stack = [];
    this.index = -1;
    this.updateButtons();
  },

  updateButtons() {
    const btnUndo = document.getElementById("btn-undo");
    const btnRedo = document.getElementById("btn-redo");
    if (btnUndo) {
      btnUndo.disabled = (this.index <= 0);
      btnUndo.style.opacity = (this.index <= 0) ? "0.4" : "1";
    }
    if (btnRedo) {
      btnRedo.disabled = (this.index >= this.stack.length - 1);
      btnRedo.style.opacity = (this.index >= this.stack.length - 1) ? "0.4" : "1";
    }
  }
};

window.editorUndo = () => editorHistory.undo();
window.editorRedo = () => editorHistory.redo();
window.editorRecordHistory = (force) => editorHistory.record(force);
window.editorResetHistory = () => editorHistory.reset();

// Registrazione modulo Editor in App
if(typeof window !== 'undefined' && window.App){
  window.App.editor = {
    history: editorHistory,
    undo: window.editorUndo,
    redo: window.editorRedo,
    getRows: typeof leggiVoci === 'function' ? leggiVoci : null,
    addRow: typeof aggiungiVoce === 'function' ? aggiungiVoce : null,
    getOptions: typeof leggiOpzioni === 'function' ? leggiOpzioni : null,
    getConditions: typeof leggiCondizioni === 'function' ? leggiCondizioni : null,
    getIncluded: typeof leggiIncluso === 'function' ? leggiIncluso : null,
    getExcluded: typeof leggiEscluso === 'function' ? leggiEscluso : null,
    updateContactsDatalist: typeof aggiornaRubrica === 'function' ? aggiornaRubrica : null,
    applyClientData: typeof applicaDatiCliente === 'function' ? applicaDatiCliente : null,
    setStatus: typeof impostaStato === 'function' ? impostaStato : null,
    initScrollSpy: typeof initScrollSpyNav === 'function' ? initScrollSpyNav : null
  };
}
