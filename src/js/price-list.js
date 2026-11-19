/* ================== listino cloud DB v4.0 ================== */
let _listinoCache = null;

function generaIdVoce(nome, idx){
  const slug = (nome || "voce").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 32);
  return "voc_" + (slug || "item") + (idx != null ? "_" + idx : "_" + Date.now().toString(36));
}

function normalizzaVoceListino(v, idx){
  if(!v || typeof v !== "object") return null;
  return {
    id: v.id || generaIdVoce(v.nome, idx != null ? idx + 1 : undefined),
    cat: String(v.cat || "").trim(),
    nome: String(v.nome || "").trim(),
    desc: String(v.desc || "").trim(),
    unita: String(v.unita || "forfait").trim(),
    prezzo: Number(v.prezzo != null ? v.prezzo : 0) || 0,
    ordine: Number(v.ordine != null ? v.ordine : (idx != null ? idx + 1 : 999)) || 999,
    attivo: v.attivo !== false,
    creato: v.creato || new Date().toISOString(),
    modificato: v.modificato || new Date().toISOString()
  };
}

function listino(){
  if(_listinoCache) return _listinoCache;
  let l = [];
  try{
    const x = JSON.parse(localStorage.getItem(CHIAVE_LISTINO));
    if(Array.isArray(x)){
      l = x.map((v, i) => normalizzaVoceListino(v, i)).filter(Boolean);
    }
  }catch(e){}

  _listinoCache = l;
  return _listinoCache;
}

function salvaListino(l, sincronizzaTuttoCloud = false){
  const listaNormalizzata = (Array.isArray(l) ? l : []).map((v, i) => normalizzaVoceListino(v, i)).filter(Boolean);
  _listinoCache = listaNormalizzata;
  try{
    localStorage.setItem(CHIAVE_LISTINO, JSON.stringify(listaNormalizzata));
  }catch(e){
    console.error("Errore salvataggio locale listino:", e);
  }
  aggiornaTendinaListino();

  // Sincronizzazione cloud Firestore
  if(sincronizzaTuttoCloud && window.FirebaseSync && typeof window.FirebaseSync.salvaListino === "function"){
    window.FirebaseSync.salvaListino(listaNormalizzata);
  }
}

function aggiornaCacheListino(nuoveVoci){
  if(Array.isArray(nuoveVoci)){
    _listinoCache = nuoveVoci.map((v, i) => normalizzaVoceListino(v, i)).filter(Boolean);
  } else {
    _listinoCache = null;
  }
}

function salvaVoceListino(id, campo, val){
  const l = listino();
  const v = l.find(x => x.id === id);
  if(v){
    v[campo] = (campo === "prezzo") ? (parseFloat(val) || 0) : String(val || "").trim();
    v.modificato = new Date().toISOString();
    salvaListino(l, false);
    
    // Invia mutazione singola atomica a Firestore
    if(window.FirebaseSync && typeof window.FirebaseSync.salvaVoceListino === "function"){
      window.FirebaseSync.salvaVoceListino(v);
    }

    const s = document.getElementById("stato-listino");
    if(s) s.textContent = "Salvato alle " + new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}) +
      " · " + l.length + " voci in listino";
  }
}

function eliminaVoceListino(id){
  let l = listino();
  l = l.filter(x => x.id !== id);
  salvaListino(l, false);

  if(window.FirebaseSync && typeof window.FirebaseSync.eliminaVoceListino === "function"){
    window.FirebaseSync.eliminaVoceListino(id);
  }
  disegnaListino();
}

function rigaListino(v){
  const tr = document.createElement("tr");
  tr.dataset.id = v.id;
  tr.innerHTML = `
    <td><input class="l-cat" list="categorie-listino" placeholder="Categoria" value="${esc(v.cat || "")}"></td>
    <td><input class="l-nome nome" placeholder="Nome della voce" value="${esc(v.nome || "")}">
        <textarea class="l-desc desc" placeholder="Descrizione che finisce nel preventivo">${esc(v.desc || "")}</textarea></td>
    <td><input class="l-unita" list="unita-listino" placeholder="giornata" value="${esc(v.unita || "")}"></td>
    <td><input class="l-prezzo num" type="number" step="0.01" value="${v.prezzo != null ? v.prezzo : 0}"></td>
    <td class="col-x"><button class="btn mini pericolo" title="Elimina la voce">&times;</button></td>`;
  
  tr.querySelector(".l-cat").addEventListener("input", e => salvaVoceListino(v.id, "cat", e.target.value));
  tr.querySelector(".l-nome").addEventListener("input", e => salvaVoceListino(v.id, "nome", e.target.value));
  tr.querySelector(".l-desc").addEventListener("input", e => salvaVoceListino(v.id, "desc", e.target.value));
  tr.querySelector(".l-unita").addEventListener("input", e => salvaVoceListino(v.id, "unita", e.target.value));
  tr.querySelector(".l-prezzo").addEventListener("input", e => salvaVoceListino(v.id, "prezzo", e.target.value));
  
  tr.querySelector("button").addEventListener("click", () => {
    if(!creaSnapshot("prima-di-eliminazione-listino", "Eliminazione voce di listino")) return;
    eliminaVoceListino(v.id);
  });
  return tr;
}

function disegnaListino(){
  const q = (document.getElementById("filtro-listino")?.value || "").toLowerCase();
  const tutte = listino();
  const corpo = document.getElementById("corpo-listino");
  if(!corpo) return;
  corpo.innerHTML = "";
  let visibiliCount = 0;
  tutte.forEach((v) => {
    const testo = ((v.cat || "") + " " + (v.nome || "") + " " + (v.desc || "")).toLowerCase();
    if(!q || testo.includes(q)){
      corpo.appendChild(rigaListino(v));
      visibiliCount++;
    }
  });
  const statoEl = document.getElementById("stato-listino");
  if(statoEl){
    statoEl.textContent = tutte.length + " voci in listino" + (q ? " · " + visibiliCount + " corrispondono alla ricerca" : "") +
      " · sincronizzazione Cloud attiva";
  }
  const cats = [...new Set(tutte.map(v => v.cat).filter(Boolean))];
  const unita = [...new Set(tutte.map(v => v.unita).filter(Boolean))];
  let dl = document.getElementById("categorie-listino");
  if(!dl){ dl = document.createElement("datalist"); dl.id = "categorie-listino"; document.body.appendChild(dl); }
  dl.innerHTML = cats.map(c => `<option value="${esc(c)}">`).join("");
  let du = document.getElementById("unita-listino");
  if(!du){ du = document.createElement("datalist"); du.id = "unita-listino"; document.body.appendChild(du); }
  du.innerHTML = unita.map(c => `<option value="${esc(c)}">`).join("");
}

function aggiungiRigaListino(){
  const l = listino();
  const nuovaVoce = {
    id: "voc_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6),
    cat: "",
    nome: "",
    desc: "",
    unita: "forfait",
    prezzo: 0,
    ordine: l.length + 1,
    attivo: true,
    creato: new Date().toISOString(),
    modificato: new Date().toISOString()
  };
  l.push(nuovaVoce);
  salvaListino(l, false);
  if(window.FirebaseSync && typeof window.FirebaseSync.salvaVoceListino === "function"){
    window.FirebaseSync.salvaVoceListino(nuovaVoce);
  }
  const f = document.getElementById("filtro-listino"); if(f) f.value = "";
  disegnaListino();
  const righe = document.querySelectorAll("#corpo-listino tr");
  const ultima = righe[righe.length - 1];
  if(ultima){ ultima.scrollIntoView({block:"center"}); ultima.querySelector(".l-cat")?.focus(); }
}

function aggiornaTendinaListino(){
  const sel = document.getElementById("sel-listino"); if(!sel) return;
  const l = listino();
  const cats = [...new Set(l.map(v => v.cat || "Altro"))];
  sel.innerHTML = `<option value="">+ Aggiungi dal listino…</option>` +
    cats.map(c => `<optgroup label="${esc(c)}">` +
      l.filter(v => (v.cat || "Altro") === c)
       .map(v => `<option value="${esc(v.id)}">${esc(v.nome)} — ${euro(v.prezzo)}${v.unita ? " / " + esc(v.unita) : ""}</option>`).join("") +
      `</optgroup>`).join("");
}

function aggiungiDaListino(sel){
  const id = sel.value;
  sel.value = "";
  if(!id) return;
  const v = listino().find(x => x.id === id); if(!v) return;
  const righe = [...document.querySelectorAll("#corpo-voci tr")];
  const vuota = righe.find(tr => {
    const inp = tr.querySelectorAll("input");
    return !inp[0].value.trim() && !(parseFloat(inp[2].value) || 0);
  });
  if(vuota) vuota.remove();
  aggiungiVoce({nome: v.nome, desc: v.desc, q: 1, p: v.prezzo});
  segnaModificato();
  avviso("Voce aggiunta: quantità e prezzo restano modificabili.");
}

function stampaListino(){
  const l = listino();
  const cats = [...new Set(l.map(v => v.cat || "Altro"))];
  const oggi = aIsoLocale(new Date());
  const sezioni = cats.map(c => `
    <div class="sezione">${esc(c)}</div>
    <table class="voci">
      <colgroup><col style="width:66%"><col style="width:16%"><col style="width:18%"></colgroup>
      <thead><tr><th>Voce</th><th class="num">Unità</th>
      <th class="num">Prezzo</th></tr></thead><tbody>` +
    l.filter(v => (v.cat || "Altro") === c).map(v => `<tr class="voice-item">
      <td><span class="v-nome">${esc(v.nome)}</span>${v.desc ? `<span class="v-desc">${esc(v.desc)}</span>` : ""}</td>
      <td class="num">${esc(v.unita || "—")}</td>
      <td class="num col-totale">${v.prezzo ? euro(v.prezzo) : "a preventivo"}</td></tr>`).join("") +
    `</tbody></table>`).join("");
  document.getElementById("stampa").innerHTML = `
    <div class="foglio-stampa foglio-continuo">
      <header class="intestazione">
        <div class="intestazione-logo">${LOGO}</div>
        <div class="doc"><div class="tipo" style="font-size:19px">Listino interno</div>
          <div class="meta">Aggiornato al ${esc(dataIt(oggi))}<br>Documento di lavoro</div></div>
      </header>
      <div class="dicitura" style="margin-bottom:14px">
        <b>Uso interno.</b> Prezzi di riferimento per la compilazione dei preventivi, al netto di sconti,
        imposte e maggiorazioni. Gli importi non costituiscono offerta al pubblico e vanno confermati caso per caso.
      </div>
      ${sezioni}
      ${pieded()}
    </div>`;
  document.title = `FC_Listino_Interno_${oggi}`;
  window.print();
}

// Registrazione modulo Listino in App
if(typeof window !== 'undefined' && window.App){
  window.App.priceList = {
    getAll: listino,
    saveAll: salvaListino,
    saveItem: salvaVoceListino,
    deleteItem: eliminaVoceListino,
    render: disegnaListino,
    addItem: aggiungiRigaListino,
    updateDropdown: aggiornaTendinaListino,
    insertIntoEditor: aggiungiDaListino,
    print: stampaListino,
    updateCache: aggiornaCacheListino
  };
}

if(typeof globalThis !== 'undefined'){
  globalThis.generaIdVoce = generaIdVoce;
  globalThis.normalizzaVoceListino = normalizzaVoceListino;
  globalThis.listino = listino;
  globalThis.aggiornaCacheListino = aggiornaCacheListino;
  globalThis.salvaListino = salvaListino;
  globalThis.salvaVoceListino = salvaVoceListino;
  globalThis.eliminaVoceListino = eliminaVoceListino;
  globalThis.disegnaListino = disegnaListino;
  globalThis.aggiungiRigaListino = aggiungiRigaListino;
  globalThis.aggiornaTendinaListino = aggiornaTendinaListino;
  globalThis.aggiungiDaListino = aggiungiDaListino;
  globalThis.stampaListino = stampaListino;
}
