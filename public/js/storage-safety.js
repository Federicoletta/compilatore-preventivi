/* ================== storage e accesso dati ================== */
let _archivioCache = null;
function invalidaCacheArchivio(){ _archivioCache = null; }
function tuttiPreventiviRaw(){
  if(_archivioCache !== null) return _archivioCache;
  try{
    const raw = localStorage.getItem(CHIAVE);
    _archivioCache = raw ? JSON.parse(raw) : [];
    if(!Array.isArray(_archivioCache)) _archivioCache = [];
  }catch(e){
    _archivioCache = [];
  }
  return _archivioCache;
}
function archivio(){
  return tuttiPreventiviRaw().filter(p => !p.cestinato);
}
function salvaArchivio(a){
  _archivioCache = Array.isArray(a) ? a : [];
  try{ localStorage.setItem(CHIAVE, JSON.stringify(_archivioCache)); }catch(e){ console.error("Errore salvaArchivio:", e); }
}
function datiIo(){ try{ return JSON.parse(localStorage.getItem(CHIAVE_IO)) || {}; }catch(e){ return {}; } }

/* ================== sicurezza e controllo qualità (v1) ================== */
const CHIAVEBOZZA="fcpreventivi_bozza_recupero_v1";
const CHIAVECESTINO="fcpreventivi_cestino_v1";
const CHIAVEULTIMOBACKUP="fcpreventivi_ultimo_backup_v1";
let sicurezzaPronta=false, timerBozza=null;
const oraLocale=()=>new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"});
const dataOra=s=>new Date(s).toLocaleString("it-IT");
const normalizzaNumero=s=>String(s||"").trim().replace(/\s+/g,"").toLowerCase();
const nuovoId=()=>globalThis.crypto?.randomUUID?.() || ("s"+Date.now()+Math.random().toString(36).slice(2));
function leggiLocale(k,defaultValue){ try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?defaultValue:v; }catch(e){return defaultValue;} }
function oggetto(v){return v!==null && typeof v==="object" && !Array.isArray(v);}
function recordValido(p){
  return oggetto(p) && typeof p.id==="string" && /^[a-zA-Z0-9_-]+$/.test(p.id) &&
    typeof p.numero==="string" && oggetto(p.cliente) && oggetto(p.progetto) &&
    ["data","validita","stato","regime","sconto_txt","bollo"].every(k=>p[k]===undefined||typeof p[k]==="string") &&
    ["nome","ref","indirizzo","piva","email","tel"].every(k=>p.cliente[k]===undefined||typeof p.cliente[k]==="string") &&
    ["titolo","tipo","luogo","giornate","consegna","saluto","intro"].every(k=>p.progetto[k]===undefined||typeof p.progetto[k]==="string") &&
    Array.isArray(p.voci) && p.voci.every(v=>oggetto(v)&&typeof v.nome==="string"&&Number.isFinite(v.q)&&Number.isFinite(v.p)) &&
    (!p.opzioni || (Array.isArray(p.opzioni)&&p.opzioni.every(o=>oggetto(o)&&typeof o.nome==="string"&&Number.isFinite(o.p)))) &&
    (!p.condizioni || (Array.isArray(p.condizioni)&&p.condizioni.every(c=>Array.isArray(c)&&c.length===2&&c.every(x=>typeof x==="string")))) &&
    ["incluso","escluso"].every(k=>p[k]===undefined || (Array.isArray(p[k])&&p[k].every(x=>typeof x==="string"))) &&
    ["sconto","ritenuta","rivalsa","iva","totale"].every(k=>p[k]===undefined || Number.isFinite(p[k])) &&
    (p.io===undefined || oggetto(p.io));
}
function listinoValido(l){return Array.isArray(l)&&l.every(v=>oggetto(v)&&typeof v.nome==="string"&&Number.isFinite(v.prezzo));}
function snapshotValido(s){return oggetto(s)&&typeof s.id==="string"&&Number.isFinite(Date.parse(s.creatoIl));}
function elementoCestinoValido(x){return oggetto(x)&&typeof x.id==="string"&&Number.isFinite(Date.parse(x.eliminatoIl))&&recordValido(x.preventivo);}
function cronologia(){return [];}
function cestino(){
  return tuttiPreventiviRaw()
    .filter(p => p.cestinato === true)
    .map(p => ({
      id: p.id,
      originaleId: p.id,
      eliminatoIl: p.eliminatoIl || p.modificato || new Date().toISOString(),
      preventivo: p
    }));
}
// Scritture multiple con rollback best-effort. In caso di quota esaurita non si dichiara successo.
function scriviTransazione(dati){
  const precedenti={}; const scritte=[];
  try{
    Object.keys(dati).forEach(k=>precedenti[k]=localStorage.getItem(k));
    for(const k of Object.keys(dati)){localStorage.setItem(k,JSON.stringify(dati[k]));scritte.push(k);}
    if(dati[CHIAVE] !== undefined){
      _archivioCache = dati[CHIAVE];
    }
    return true;
  }catch(e){
    for(const k of scritte.reverse()){try{if(precedenti[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,precedenti[k]);}catch(_){}}
    alert("Salvataggio locale non riuscito. Lo spazio potrebbe essere esaurito o il browser potrebbe bloccare la memoria. Esporta un backup prima di continuare. Non chiudere questa pagina.");
    return false;
  }
}
function creaSnapshot(){ return true; }
function cancellaBozza(){clearTimeout(timerBozza);try{localStorage.removeItem(CHIAVEBOZZA);}catch(e){avviso("Impossibile rimuovere la bozza locale.");}}
function salvaBozza(){
  if(!sicurezzaPronta || !modificatoNonSalvato) return;
  // I valori grezzi preservano anche righe incomplete e campi numerici ancora da correggere.
  const grezzi=[...document.querySelectorAll("#vista-editor input,#vista-editor select,#vista-editor textarea")].map(e=>e.value);
  const p=raccogli();
  p.voci=[...document.querySelectorAll("#corpo-voci tr")].map(tr=>{const i=tr.querySelectorAll("input");return {nome:i[0].value,desc:tr.querySelector("textarea").value,q:Number(i[1].value)||0,p:Number(i[2].value)||0};});
  p.opzioni=[...document.querySelectorAll("#corpo-opzioni tr")].map(tr=>{const i=tr.querySelectorAll("input");return {nome:i[0].value,desc:tr.querySelector("textarea").value,p:Number(i[1].value)||0};});
  p.condizioni=[...document.querySelectorAll("#corpo-condizioni > div")].map(d=>[d.querySelector("input").value,d.querySelector("textarea").value]);
  try{
    localStorage.setItem(CHIAVEBOZZA,JSON.stringify({versione:1,salvataIl:new Date().toISOString(),preventivo:p,correnteId:corrente,modificatoNonSalvato:true,grezzi},(k,v)=>typeof v==="number"&&!Number.isFinite(v)?0:v));
    impostaStatoSalvataggio("Modifiche non salvate · Bozza di recupero aggiornata alle "+oraLocale());
  }catch(e){impostaStatoSalvataggio("Modifiche non salvate · Recupero automatico non disponibile: esporta un backup e non chiudere la pagina.");}
}
function consentiCambioEditor(){
  if(!modificatoNonSalvato) return true;
  if(!confirm("Ci sono modifiche non salvate. Aprire un altro preventivo? La bozza di recupero corrente sarà conservata fino alla prossima modifica o al prossimo salvataggio.")) return false;
  salvaBozza();clearTimeout(timerBozza);return true;
}
function modaleSicurezza(titolo,contenuto,azioni=[]){
  document.getElementById("sicurezza-dialog")?.remove();
  const d=document.createElement("dialog");d.id="sicurezza-dialog";
  d.innerHTML=`<h2 id="sicurezza-titolo">${esc(titolo)}</h2><div class="sicurezza-contenuto">${contenuto}</div><div class="azioni"></div>`;
  d.setAttribute("aria-labelledby","sicurezza-titolo");
  azioni.forEach(a=>{const b=document.createElement("button");b.className="btn "+(a.primario?"pieno ":"")+(a.classe?a.classe+" ":"");b.textContent=a.testo;b.onclick=()=>{d.close();d.remove();a.esegui?.();};d.querySelector(":scope > .azioni").appendChild(b);});
  document.body.appendChild(d);d.showModal();return d;
}
function verificaPreventivo(p,opzioni={}){
  const r={errori:[],avvisi:[],suggerimenti:[]};
  const add=(sez,codice,messaggio,campo=null)=>r[sez].push({codice,messaggio,campo});
  const e=(...a)=>add("errori",...a), a=(...x)=>add("avvisi",...x), s=(...x)=>add("suggerimenti",...x);
  const numero=normalizzaNumero(p.numero), c=p.cliente||{}, pr=p.progetto||{}, t=opzioni.totali||totali();
  const oggi=aIsoLocale(new Date()), trim=x=>String(x||"").trim();
  if(!numero)e("NUMERO_MANCANTE","Inserisci un numero di preventivo.","numero");
  else if(archivio().some(x=>normalizzaNumero(x.numero)===numero && x.id!==(opzioni.correnteId??corrente)))e("NUMERO_DUPLICATO","Esiste già un preventivo archiviato con questo numero. Usa un riferimento diverso.","numero");
  if(!trim(c.nome))e("CLIENTE_MANCANTE","Inserisci il nome o la ragione sociale del cliente.","cl_nome");
  if(!p.data)e("DATA_MANCANTE","Inserisci la data del documento.","data");
  if(p.validita && p.data && p.validita<p.data)e("VALIDITA_INCOERENTE","La data di validità non può essere precedente alla data del documento.","validita");
  if(!p.voci.some(v=>trim(v.nome)&&v.q>0&&v.p>0))e("VOCI_MANCANTI","Inserisci almeno una voce con nome, quantità e prezzo maggiori di zero.","corpo-voci");
  if(p.sconto>t.imponibile)e("SCONTO_ECCESSIVO","Lo sconto non può superare l’imponibile delle voci.","sconto");
  if([t.imponibile,t.totaleDoc,t.netto].some(x=>x<0))e("TOTALE_NEGATIVO","Il preventivo produce un totale negativo: verifica voci, sconto e imposte.","sconto");
  if(Object.values(t).some(v=>typeof v==="number"&&!Number.isFinite(v)))e("CALCOLO_INVALIDO","Un calcolo non produce un importo numerico finito: verifica quantità, prezzi e percentuali.","corpo-voci");
  document.querySelectorAll("#vista-editor input[type=number]").forEach((el,i)=>{
    if(!el.id)el.id="sic-num-"+i;
    if(el.validity.badInput || el.value.trim()==="" || !Number.isFinite(Number(el.value)))e("NUMERO_INVALIDO_"+i,"Inserisci un valore numerico valido nel campo "+(el.closest("tr")?.querySelector(".nome")?.value||el.id)+".",el.id);
  });
  ["sconto","ritenuta","rivalsa","iva"].forEach(k=>{if(!Number.isFinite(p[k]))e("NUMERO_INVALIDO_"+k,"Il campo "+k+" non contiene un numero valido.",k);});
  const righe=opzioni.righe || [...document.querySelectorAll("#corpo-voci tr")].map(tr=>{const i=tr.querySelectorAll("input");return {nome:i[0].value,q:Number(i[1].value),p:Number(i[2].value),desc:tr.querySelector("textarea").value};});
  righe.forEach((v,i)=>{
    const campo="sic-voce-"+i;const el=document.querySelectorAll("#corpo-voci tr .nome")[i];if(el)el.id=campo;
    if(!Number.isFinite(v.q)||!Number.isFinite(v.p))e("IMPORTO_INVALIDO_"+i,"La voce "+(i+1)+" contiene quantità o prezzo non validi.",campo);
    if(trim(v.nome)&&v.p===0)a("PREZZO_ZERO_"+i,`La voce “${v.nome}” ha un prezzo pari a € 0,00.`,campo);
    if(trim(v.nome)&&v.q<=0)a("QUANTITA_ZERO_"+i,`La voce “${v.nome}” ha una quantità pari a ${v.q}.`,campo);
    if(v.p<0)a("PREZZO_NEGATIVO_"+i,`La voce “${v.nome||i+1}” ha un prezzo negativo.`,campo);
    if(!trim(v.nome)&&(v.q||v.p))a("VOCE_SENZA_NOME_"+i,"È presente una voce con quantità o prezzo compilato ma senza nome.",campo);
  });
  if(p.validita && p.validita<oggi)a("SCADUTO","La validità del preventivo è scaduta il "+dataIt(p.validita)+".","validita");
  if(p.data>oggi)a("DATA_FUTURA","La data del documento è successiva alla data odierna.","data");
  const anno=trim(p.numero).match(/^FC_(\d{4})_\d+$/i);
  if(anno&&p.data&&anno[1]!==p.data.slice(0,4))a("ANNO_NUMERO","L’anno nel numero del preventivo non coincide con l’anno della data documento.","numero");
  if(!trim(c.email)&&!trim(c.tel))a("CONTATTI_MANCANTI","Mancano sia email sia telefono del cliente.","cl_email");
  if(!trim(pr.titolo))a("TITOLO_MANCANTE","Il titolo del progetto non è compilato.","pr_titolo");
  if(!p.condizioni.some(c=>c.some(x=>trim(x))))a("CONDIZIONI_ASSENTI","Non sono presenti condizioni contrattuali nel documento.","corpo-condizioni");
  const salvato=archivio().find(x=>x.id===corrente);
  const confronta=x=>{const c=JSON.parse(JSON.stringify(x));delete c.modificato;delete c.annullamento;return JSON.stringify(c);};
  if(salvato?.stato==="accettato" && confronta(salvato)!==confronta(p))a("ACCETTATO_MODIFICATO","Stai modificando un preventivo già accettato. Valuta di duplicarlo e creare una nuova versione.","stato");
  if(["inviato","accettato"].includes(p.stato)&&!trim(c.piva))a("FISCALE_CLIENTE","Il preventivo è impostato come inviato o accettato, ma manca P. IVA/C.F. del cliente.","cl_piva");
  if(opzioni.modalita==="nota"&&!trim(p.io.iban))a("IBAN_MANCANTE","L’IBAN non è compilato: il documento di pagamento non indicherà le coordinate bancarie.","io_iban");
  if(!trim(c.ref))s("REFERENTE","Il referente cliente non è compilato.","cl_ref");
  if(!trim(c.email))s("EMAIL","L’email cliente non è compilata.","cl_email");
  if(p.voci.some(v=>!trim(v.desc)))s("DESCRIZIONI","La descrizione di una o più voci è vuota.","corpo-voci");
  if(!p.incluso.length)s("INCLUSO","Il campo “Incluso” è vuoto.","incluso");
  if(!p.escluso.length)s("ESCLUSO","Il campo “Non incluso” è vuoto.","escluso");
  if(!p.opzioni.length)s("OPZIONI","Le opzioni su richiesta sono assenti.","corpo-opzioni");
  const giorni=(Date.parse(p.validita)-Date.parse(p.data))/86400000;
  if(giorni<7||giorni>60)s("DURATA","La data di validità è inferiore a 7 giorni o superiore a 60 giorni dalla data documento.","validita");
  if(!salvato)s("BOZZA","Il preventivo è una bozza non ancora salvata.");
  if(p.sconto_txt&&p.sconto===0)s("SCONTO_TESTO","È presente una dicitura sconto ma lo sconto è uguale a zero.","sconto_txt");
  if(t.netto===0)s("NETTO_ZERO","Il netto è uguale a € 0,00.");
  return r;
}
function salva(){controllaAzione("salva");}
function stampaPreventivo(){controllaAzione("stampa");}
function stampaSecondo(){controllaAzione("nota");}
function controllaAzione(modalita){
  const p=raccogli(), r=verificaPreventivo(p,{modalita});
  const esegui=()=>{try{({salva:salvaVerificato,stampa:stampaPreventivoVerificato,nota:stampaSecondoVerificato})[modalita]?.();}catch(e){if(typeof avviso === "function") avviso("Operazione non completata: "+e.message); else console.error(e);}};
  if(modalita!=="verifica"&&!r.errori.length&&!r.avvisi.length){esegui();return;}
  const sezioni=[["errori","✕","Errori da correggere"],["avvisi","!","Avvisi da verificare"],["suggerimenti","i","Suggerimenti"]];
  const contenuto=`<p><b>${esc(p.numero||"Senza numero")}</b> · ${esc(p.cliente.nome||"Cliente non compilato")}<br>${esc(p.progetto.titolo||"Progetto senza titolo")} · ${esc(p.stato)} · Netto ${esc(euro(totali().netto))}</p>`+
    sezioni.map(([k,ic,t])=>`<section><h3>${ic} ${t} (${r[k].length})</h3>${r[k].length?r[k].map(x=>`<button class="sic-messaggio" ${x.campo?`data-campo="${esc(x.campo)}"`:"disabled"}>${esc(x.messaggio)}</button>`).join(""):"<p>Nessun elemento.</p>"}</section>`).join("");
  const azioni=[{testo:r.errori.length?"Torna al preventivo":"Torna a correggere"}];
  if(modalita!=="verifica"&&!r.errori.length)azioni.push({testo:"Procedi comunque",primario:true,esegui});
  const d=modaleSicurezza("Verifica preventivo",contenuto,azioni);
  d.querySelectorAll("[data-campo]").forEach(b=>b.onclick=()=>{const id=b.dataset.campo;d.close();d.remove();vista("editor");const el=document.getElementById(id);el?.scrollIntoView({block:"center"});(el?.matches("input,select,textarea")?el:el?.querySelector("input,textarea,button"))?.focus();});
}
function aggiornaEtichettaEliminazione(){const b=document.getElementById("btn-elimina");if(b)b.textContent=["inviato","accettato"].includes(val("stato"))?"Annulla / Cestino":"Sposta nel cestino";}
function gestisciEliminazione(){
  const p=archivio().find(x=>x.id===corrente);if(!p)return;
  const sposta=()=>{
    if(!confirm("Spostare "+p.numero+" nel cestino?"+(modificatoNonSalvato?" Verrà conservata la versione archiviata; le modifiche non salvate saranno scartate.":"")))return;
    if(window.FirebaseSync && typeof window.FirebaseSync.spostaNelCestino === "function"){
      window.FirebaseSync.spostaNelCestino(p.id);
    }
    const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).map(x => x.id === p.id ? { ...x, cestinato: true, eliminatoIl: new Date().toISOString(), modificato: new Date().toISOString() } : x);
    salvaArchivio(tutti);
    modificatoNonSalvato=false;cancellaBozza();nuovo();disegnaArchivio();
    impostaStatoSalvataggio("Preventivo spostato nel cestino");
    alert("Preventivo spostato nel cestino. Puoi ripristinarlo in qualsiasi momento dalla sezione Cestino.");
  };
  if(["inviato","accettato"].includes(p.stato)||["inviato","accettato"].includes(val("stato"))){
    modaleSicurezza("Gestisci preventivo",`<p>${esc(p.numero)} · ${esc(p.cliente.nome)}</p><p>Annullare mantiene numero, consultazione e stampa. Il cestino rimuove il documento dall’archivio attivo.</p>`,[
      {testo:"Torna al preventivo"},{testo:"Annulla preventivo",esegui:()=>{
        const nota=prompt("Nota di annullamento (facoltativa)."+(modificatoNonSalvato?" Le modifiche non salvate saranno scartate.":""),"");if(nota===null)return;
        const aggiornato={...p,stato:"annullato",annullamento:{data:new Date().toISOString(),nota},modificato:new Date().toISOString()};
        if(window.FirebaseSync && typeof window.FirebaseSync.sincronizzaPreventivo === "function"){
          window.FirebaseSync.sincronizzaPreventivo(aggiornato);
        }
        const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).map(x => x.id === p.id ? aggiornato : x);
        salvaArchivio(tutti);
        carica(aggiornato);cancellaBozza();disegnaArchivio();avviso("Preventivo annullato.");
      }},{testo:"Sposta nel cestino",esegui:sposta}]);
  }else sposta();
}
function mostraCestino(){
  const items=cestino();
  const d=modaleSicurezza("Cestino",`<p>Puoi ripristinarlo entro 60 giorni. In questa versione non avviene alcuna cancellazione automatica, neppure oltre i 60 giorni.</p>`+
    (items.length?items.map((x,i)=>`<section class="sic-elemento"><b>${esc(x.preventivo.numero)}</b> · ${esc(x.preventivo.cliente.nome)}<br>${esc(x.preventivo.progetto.titolo)} · Stato originale: ${esc(x.preventivo.stato)}<br>Eliminato: ${esc(dataOra(x.eliminatoIl))}${Date.now()-Date.parse(x.eliminatoIl)>60*86400000?" · Oltre 60 giorni (ancora recuperabile)":""}<div class="azioni"><button class="btn" data-rip="${i}">Ripristina</button><button class="btn pericolo" data-del="${i}">Elimina definitivamente</button></div></section>`).join(""):"<p>Il cestino è vuoto.</p>"),[{testo:"Chiudi"}]);
  d.querySelectorAll("[data-rip]").forEach(b=>b.onclick=()=>{
    const x=items[+b.dataset.rip],a=archivio();
    if(a.some(p=>p.id===x.preventivo.id||normalizzaNumero(p.numero)===normalizzaNumero(x.preventivo.numero))){alert("Ripristino bloccato: ID o numero già presente nell’archivio. Modifica prima il riferimento del documento in conflitto.");return;}
    if(!creaSnapshot("prima-di-ripristino-cestino","Ripristino "+x.preventivo.numero))return;
    if(scriviTransazione({[CHIAVE]:[...a,x.preventivo],[CHIAVECESTINO]:cestino().filter(y=>y.id!==x.id)})){
      disegnaArchivio();mostraCestino();avviso("Preventivo ripristinato.");
      if(window.FirebaseSync && typeof window.FirebaseSync.sincronizzaPreventivo === "function"){
        window.FirebaseSync.sincronizzaPreventivo(x.preventivo);
      }
    }
  });
  d.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{
    const x=items[+b.dataset.del];
    if(!confirm("Questa eliminazione è definitiva. Il preventivo potrà essere recuperato solo tramite un backup o una cronologia di sicurezza precedente."))return;
    if(!confirm("Confermi definitivamente l’eliminazione di "+x.preventivo.numero+"?"))return;
    if(!creaSnapshot("prima-di-eliminazione-definitiva","Eliminazione definitiva "+x.preventivo.numero))return;
    if(scriviTransazione({[CHIAVECESTINO]:cestino().filter(y=>y.id!==x.id)})){
      mostraCestino();
      if(window.FirebaseSync && typeof window.FirebaseSync.eliminaPreventivo === "function"){
        window.FirebaseSync.eliminaPreventivo(x.preventivo.id);
      }
    }
  });
}
function aggiornaBackupInfo(){
  const el=document.getElementById("sic-backup-info");if(!el)return;
  const ultimo=leggiLocale(CHIAVEULTIMOBACKUP,null), ts=Date.parse(ultimo);
  el.textContent=!Number.isFinite(ts)?"Non risulta alcun backup esterno scaricato.":
    Date.now()-ts>30*86400000?"L’ultimo backup risale al "+dataOra(ultimo)+".":"Ultimo backup: "+dataOra(ultimo)+".";
}
if(typeof window !== "undefined") window.aggiornaBackupInfo = aggiornaBackupInfo;

function esportaBackup(){
  const d={tipo:"backup-compilatore-preventivi",versione:2,creatoIl:new Date().toISOString(),preventivi:archivio(),cestino:cestino(),io:datiIo(),listino:listino()};
  d.riepilogo={preventivi:d.preventivi.length,cestino:d.cestino.length,vociListino:d.listino.length};
  const ora=new Date(),a=document.createElement("a"),u=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:"application/json"}));
  a.href=u;a.download="FC_backup-preventivi_"+aIsoLocale(ora)+"_"+String(ora.getHours()).padStart(2,"0")+String(ora.getMinutes()).padStart(2,"0")+".json";
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
  scriviTransazione({[CHIAVEULTIMOBACKUP]:d.creatoIl});
  aggiornaBackupInfo();
  alert(`Backup scaricato: ${d.preventivi.length} preventivi, ${d.cestino.length} elementi nel cestino, ${d.listino.length} voci di listino.`);
}
function importaBackup(input){
  const f=input.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onerror=()=>{alert("Impossibile leggere il file.");input.value="";};
  reader.onload=()=>{
    try{
      let d=JSON.parse(reader.result);
      if(Array.isArray(d)) d={preventivi:d};
      // Supporto sia per singoli file preventivo diretti che per backup completi
      if(oggetto(d) && !d.preventivi && (d.numero || d.progetto || d.voci)){
        d = { tipo: "backup-compilatore-preventivi", versione: 2, preventivi: [d] };
      }
      if(!oggetto(d)||!Array.isArray(d.preventivi)||!d.preventivi.every(recordValido))throw Error("Struttura dei preventivi non valida.");
      if(d.versione!==undefined&&d.versione!==2)throw Error("Versione backup non supportata.");
      if(d.versione===2&&d.tipo!=="backup-compilatore-preventivi")throw Error("Tipo di backup non riconosciuto.");
      if(d.io!==undefined&&!oggetto(d.io))throw Error("Dati personali non validi.");
      if(d.listino!==undefined&&!listinoValido(d.listino))throw Error("Listino non valido.");
      if(d.cestino!==undefined&&(!Array.isArray(d.cestino)||!d.cestino.every(elementoCestinoValido)))throw Error("Cestino non valido.");
      const a=archivio().slice();let aggiunti=0,aggiornati=0;
      const ids=new Set(),numeri=new Set();
      for(const p of d.preventivi){
        const n=normalizzaNumero(p.numero);
        if(ids.has(p.id)||(n&&numeri.has(n)))throw Error("Conflitto: ID o numero duplicato nel backup.");
        ids.add(p.id);if(n)numeri.add(n);
        const perId=a.findIndex(x=>x.id===p.id), perNumero=a.findIndex(x=>n&&normalizzaNumero(x.numero)===n);
        if(perId>=0&&perNumero>=0&&perId!==perNumero)throw Error("Conflitto tra ID e numero per "+p.numero+". Nessun dato importato.");
        const i=perId>=0?perId:perNumero;
        if(i>=0){a[i]=p;aggiornati++;}else{a.push(p);aggiunti++;}
      }
      const isSingolo = d.preventivi.length === 1;
      const messaggio = isSingolo
        ? `Importare e aprire il preventivo ${d.preventivi[0].numero || ""} (${d.preventivi[0].cliente?.nome || "Cliente"})?`
        : `Importare il backup?\nAggiunta: ${aggiunti} preventivi.\nAggiornamento/sostituzione per ID o numero: ${aggiornati} preventivi.\nConflitti ambigui: nessuno.\nListino: ${d.listino!==undefined?d.listino.length+" voci, sostituisce quello attuale":"invariato"}.\nDati personali: ${d.io?"sostituiti":"invariati"}.\nCestino: ${d.cestino?.length||0} elementi da unire per ID.`;
      if(!confirm(messaggio))return;
      const dati={[CHIAVE]:a};
      if(d.io)dati[CHIAVE_IO]=d.io;
      if(d.listino!==undefined){dati[CHIAVE_LISTINO]=d.listino;dati[CHIAVE_LISTINO_VISTE]=listinoStandard().map(v=>v.nome);}
      const unisci=(esistenti,nuovi)=>{const m=new Map(esistenti.map(x=>[x.id,x]));nuovi.forEach(x=>{if(!m.has(x.id))m.set(x.id,x);});return [...m.values()];};
      if(d.cestino)dati[CHIAVECESTINO]=unisci(cestino(),d.cestino);
      if(!scriviTransazione(dati))return;
      invalidaCacheArchivio();
      if(typeof invalidaCacheClienti === "function") invalidaCacheClienti();
      if(typeof sincronizzaClientiDaArchivio === "function") sincronizzaClientiDaArchivio(true);
      if(d.listino!==undefined)_listinoCache=d.listino;
      disegnaArchivio();disegnaListino();aggiornaTendinaListino();
      
      // Sincronizza immediatamente i preventivi e clienti importati sul cloud Firebase
      if(window.FirebaseSync && typeof window.FirebaseSync.sincronizzaTutto === "function"){
        window.FirebaseSync.sincronizzaTutto(true);
      }
      
      if(isSingolo){
        carica(d.preventivi[0]);
        vista("editor");
        if(typeof avviso === "function") avviso(`Preventivo ${d.preventivi[0].numero || ""} caricato nell'editor e sincronizzato nel cloud!`);
      } else {
        vista("archivio");
        alert(`Importazione completata: ${aggiunti} aggiunti, ${aggiornati} aggiornati. Sincronizzati sul cloud.`);
      }
    }catch(e){alert("File JSON non valido: "+e.message);}
    finally{input.value="";}
  };reader.readAsText(f);
}
function inizializzaSicurezza(){
  sicurezzaPronta=true;
  const stile=document.createElement("style");
  stile.textContent=`#sicurezza-dialog{border:1px solid var(--linea);border-radius:4px;background:#EFEEE9;color:var(--ink);width:min(760px,94vw);max-height:88vh;padding:24px;font:inherit}#sicurezza-dialog::backdrop{background:rgba(12,35,38,.6)}#sicurezza-dialog h2{margin-top:0;color:var(--teal)}#sicurezza-dialog .azioni{flex-wrap:wrap;margin-top:18px}.sic-messaggio{display:block;text-align:left;width:100%;margin:7px 0;padding:10px;background:white;border:1px solid var(--linea);color:var(--ink);font:inherit}.sic-messaggio[data-campo]:hover{border-color:var(--teal)}.sic-messaggio:disabled{cursor:default;opacity:1}.sic-elemento{padding:14px 0;border-bottom:1px solid var(--linea)}.sic-info{padding:16px;border:1px solid var(--linea);margin-bottom:18px;font-size:13px}.sic-info p{margin:5px 0}@media print{#sicurezza-dialog{display:none!important}}`;
  document.head.appendChild(stile);
  ["stato","filtro-stato"].forEach(id=>{const s=document.getElementById(id);if(s && s.tagName === "SELECT" && !s.querySelector('option[value="annullato"]'))s.add(new Option("Annullato","annullato"));});
  document.getElementById("stato").addEventListener("change",aggiornaEtichettaEliminazione);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")salvaBozza();});
  window.addEventListener("pagehide",salvaBozza);
  const b=leggiLocale(CHIAVEBOZZA,null);
  if(b?.versione===1&&b.modificatoNonSalvato&&recordValido(b.preventivo)&&Number.isFinite(Date.parse(b.salvataIl))){
    const d=modaleSicurezza("Bozza non salvata trovata",`<p>È stata trovata una bozza non salvata del ${esc(dataOra(b.salvataIl))}.</p><p>${esc(b.preventivo.numero)} · ${esc(b.preventivo.cliente.nome)}</p>`,[
      {testo:"Ripristina bozza",primario:true,esegui:()=>{
        carica(b.preventivo);corrente=b.correnteId||null;
        if(Array.isArray(b.grezzi)){const campi=[...document.querySelectorAll("#vista-editor input,#vista-editor select,#vista-editor textarea")];if(campi.length===b.grezzi.length)campi.forEach((e,i)=>e.value=b.grezzi[i]);}
        cambiaRegime();segnaModificato();aggiornaEtichettaEliminazione();
        document.getElementById("btn-elimina").style.display=corrente?"inline-block":"none";
        impostaStatoSalvataggio("Modifiche non salvate · Preventivo ripristinato dalla bozza di recupero");
      }},{testo:"Ignora e crea nuovo",esegui:()=>{cancellaBozza();nuovo();}}]);
    d.addEventListener("cancel",e=>e.preventDefault());
  }
}

// Registrazione modulo Storage & Sicurezza in App
if(typeof window !== 'undefined' && window.App){
  window.App.storage = {
    getArchive: archivio,
    saveArchive: salvaArchivio,
    invalidateCache: invalidaCacheArchivio,
    getPersonalData: datiIo,
    getHistory: cronologia,
    getTrash: cestino,
    createSnapshot: creaSnapshot,
    saveDraft: salvaBozza,
    deleteDraft: cancellaBozza,
    exportBackup: esportaBackup,
    importBackup: importaBackup,
    init: inizializzaSicurezza
  };
  if(window.App.ui){
    window.App.ui.modal = modaleSicurezza;
    window.App.ui.verify = verificaPreventivo;
  }
}
