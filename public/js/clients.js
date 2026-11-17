function calcolaTotalePreventivo(p){
  if(!p) return 0;
  if(typeof p.totale === 'number') return p.totale;
  if(p.totali && typeof p.totali.totaleDoc === 'number') return p.totali.totaleDoc;
  return (p.voci || []).reduce((acc, v) => {
    const q = Number(v.q != null ? v.q : v.qta) || 1;
    const pr = Number(v.p != null ? v.p : v.prezzo) || 0;
    return acc + (q * pr);
  }, 0);
}

/* ================== anagrafica clienti (CRM) ================== */
const CHIAVE_CLIENTI = "fc_clienti";
let _clientiCache = null;
let filtroClientiAttivo = "";

function invalidaCacheClienti(){
  _clientiCache = null;
}

function clienti(){
  if(_clientiCache !== null) return _clientiCache;
  try{
    const raw = localStorage.getItem(CHIAVE_CLIENTI);
    _clientiCache = raw ? JSON.parse(raw) : null;
    if(!Array.isArray(_clientiCache)){
      _clientiCache = sincronizzaClientiDaArchivio(false);
    }
  }catch(e){
    _clientiCache = [];
  }
  return _clientiCache;
}

function salvaClienti(lista){
  _clientiCache = Array.isArray(lista) ? lista : [];
  try{
    localStorage.setItem(CHIAVE_CLIENTI, JSON.stringify(_clientiCache));
  }catch(e){
    console.error("Errore salvataggio clienti:", e);
  }
  aggiornaRubrica();
  aggiornaBadgeContatoreClienti();
}

function normalizzaChiaveCliente(nome, piva){
  const n = String(nome || "").trim().toLowerCase().replace(/\s+/g, " ");
  const p = String(piva || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return n + "|" + p;
}

function ottieniClientePerId(id){
  return clienti().find(c => c.id === id) || null;
}

function ottieniClientePerNome(nome){
  if(!nome) return null;
  const n = String(nome).trim().toLowerCase();
  return clienti().find(c => String(c.nome || "").trim().toLowerCase() === n) || null;
}

/* ================== importazione/sincronizzazione iniziale da preventivi ================== */
function sincronizzaClientiDaArchivio(mostraMessaggio = false){
  const preventivi = typeof archivio === "function" ? archivio() : [];
  const mappa = new Map();
  
  // Mantiene prima eventuali clienti già salvati
  const attuali = _clientiCache || [];
  attuali.forEach(c => {
    if(c && c.nome){
      mappa.set(normalizzaChiaveCliente(c.nome, c.piva), { ...c });
    }
  });

  let aggiunti = 0;
  // Ordina preventivi dal più vecchio al più recente così i dati più recenti sovrascrivono i vecchi
  const ordinati = preventivi.slice().sort((a,b) => String(a.data||"").localeCompare(String(b.data||"")));
  
  ordinati.forEach(p => {
    const c = p.cliente;
    if(!c || !c.nome || !c.nome.trim()) return;
    const chiave = normalizzaChiaveCliente(c.nome, c.piva);
    const esistente = mappa.get(chiave);
    if(!esistente){
      mappa.set(chiave, {
        id: "cli_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        nome: c.nome.trim(),
        ref: (c.ref || "").trim(),
        indirizzo: (c.indirizzo || "").trim(),
        piva: (c.piva || "").trim(),
        cf: (c.cf || "").trim(),
        sdi: (c.sdi || "").trim(),
        pec: (c.pec || "").trim(),
        email: (c.email || "").trim(),
        tel: (c.tel || "").trim(),
        note: "",
        creato: p.data || aIsoLocale(new Date()),
        modificato: p.modificato || p.data || aIsoLocale(new Date())
      });
      aggiunti++;
    } else {
      // Aggiorna campi vuoti con dati più recenti
      ["ref", "indirizzo", "piva", "cf", "sdi", "pec", "email", "tel"].forEach(k => {
        if(!esistente[k] && c[k]) esistente[k] = String(c[k]).trim();
      });
      if(p.data && p.data > (esistente.modificato || "")) esistente.modificato = p.data;
    }
  });

  const lista = [...mappa.values()].sort((a,b) => a.nome.localeCompare(b.nome, "it"));
  _clientiCache = lista;
  try{
    localStorage.setItem(CHIAVE_CLIENTI, JSON.stringify(lista));
  }catch(e){}

  // Sincronizza anche su Firestore se online
  if(window.FirebaseSync && typeof window.FirebaseSync.sincronizzaCliente === "function"){
    lista.forEach(c => {
      window.FirebaseSync.sincronizzaCliente(c);
    });
  }
  
  aggiornaBadgeContatoreClienti();
  if(typeof aggiornaRubrica === "function") aggiornaRubrica();
  
  if(mostraMessaggio){
    avviso(`Sincronizzazione completata: ${lista.length} clienti in archivio (+${aggiunti} nuovi).`);
    disegnaClienti();
  }
  return lista;
}

function aggiornaBadgeContatoreClienti(){
  const badge = document.getElementById("contatore-clienti-badge");
  if(!badge) return;
  const tot = clienti().length;
  badge.textContent = tot > 0 ? tot : "";
}

/* ================== interfaccia gestione clienti ================== */
function filtraClienti(q){
  filtroClientiAttivo = String(q || "").trim().toLowerCase();
  disegnaClienti();
}

function preventiviDiCliente(cliente){
  if(!cliente || !cliente.nome) return [];
  const nomeNorm = normalizzaChiaveCliente(cliente.nome, "");
  const pivaNorm = String(cliente.piva || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  
  return (typeof archivio === "function" ? archivio() : []).filter(p => {
    const c = p.cliente;
    if(!c || !c.nome) return false;
    if(normalizzaChiaveCliente(c.nome, "") === nomeNorm) return true;
    if(pivaNorm && String(c.piva || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "") === pivaNorm) return true;
    return false;
  }).sort((a,b) => String(b.data || "").localeCompare(String(a.data || "")));
}

function disegnaClienti(){
  const container = document.getElementById("elenco-clienti-container");
  if(!container) return;

  const tutti = clienti();
  const q = filtroClientiAttivo;
  const filtrati = tutti.filter(c => {
    if(!q) return true;
    const haystack = [c.nome, c.ref, c.piva, c.cf, c.sdi, c.pec, c.email, c.tel, c.indirizzo, c.note].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(q);
  });

  // Calcolo KPI riassuntivi clienti
  const prevTutti = typeof archivio === "function" ? archivio() : [];
  let totPreventivatoGlobale = 0;
  prevTutti.forEach(p => {
    const vTot = calcolaTotalePreventivo(p);
    totPreventivatoGlobale += vTot;
  });

  const kpiEl = document.getElementById("kpi-clienti-box");
  if(kpiEl){
    kpiEl.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-val">${tutti.length}</span>
        <span class="kpi-lbl">Clienti Censiti</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-val">${prevTutti.length}</span>
        <span class="kpi-lbl">Preventivi Collegati</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-val">${euro(totPreventivatoGlobale)}</span>
        <span class="kpi-lbl">Valore Preventivato</span>
      </div>
    `;
  }

  if(filtrati.length === 0){
    container.innerHTML = `
      <div class="vuoto-box" style="padding:48px 24px;text-align:center;background:#fff;border-radius:8px;border:1px dashed var(--linea)">
        <p style="font-size:16px;color:var(--muted);margin-bottom:16px">
          ${q ? "Nessun cliente corrisponde alla ricerca." : "Nessun cliente ancora registrato."}
        </p>
        <button type="button" class="btn primario" onclick="apriModaleCliente()">+ Crea Primo Cliente</button>
        <button type="button" class="btn chiaro" onclick="sincronizzaClientiDaArchivio(true)" style="margin-left:8px">Importa dai Preventivi</button>
      </div>
    `;
    return;
  }

  let html = `
    <table class="arch clienti-tabella">
      <thead>
        <tr>
          <th>Ragione Sociale & Referente</th>
          <th>Dati Fiscali</th>
          <th>Recapiti</th>
          <th class="n">Preventivi</th>
          <th style="text-align:right">Azioni</th>
        </tr>
      </thead>
      <tbody>
  `;

  filtrati.forEach(c => {
    const collegati = preventiviDiCliente(c);
    const totFatt = collegati.reduce((acc, p) => {
      const v = calcolaTotalePreventivo(p);
      return acc + v;
    }, 0);

    const fiscali = [];
    if(c.piva) fiscali.push(`<b>P.IVA:</b> ${esc(c.piva)}`);
    if(c.cf && c.cf !== c.piva) fiscali.push(`<b>CF:</b> ${esc(c.cf)}`);
    if(c.sdi) fiscali.push(`<span class="badge-sdi" title="Codice Destinatario SDI">SDI: <code>${esc(c.sdi)}</code></span>`);
    if(c.pec) fiscali.push(`<span class="badge-pec" title="Posta Certificata">PEC: ${esc(c.pec)}</span>`);

    const contatti = [];
    if(c.email) contatti.push(`<a href="mailto:${esc(c.email)}" class="link-contatto">✉️ ${esc(c.email)}</a>`);
    if(c.tel) contatti.push(`<a href="tel:${esc(c.tel)}" class="link-contatto">📞 ${esc(c.tel)}</a>`);
    if(c.indirizzo) contatti.push(`<span class="cliente-ind" title="${esc(c.indirizzo)}">📍 ${esc(c.indirizzo)}</span>`);

    html += `
      <tr class="riga-cliente" id="riga-cli-${esc(c.id)}">
        <td>
          <div class="cliente-nome-box">
            <span class="cliente-nome-txt" onclick="apriModaleCliente('${esc(c.id)}')" title="Clicca per visualizzare e modificare la scheda">${esc(c.nome)}</span>
            ${c.ref ? `<span class="cliente-ref-txt">👤 ${esc(c.ref)}</span>` : ""}
            ${c.note ? `<span class="cliente-note-pill" title="${esc(c.note)}">📝 Note</span>` : ""}
          </div>
        </td>
        <td class="cliente-fiscali-td">
          ${fiscali.length > 0 ? fiscali.join("<br>") : "<span class='testo-smorzato'>−</span>"}
        </td>
        <td class="cliente-contatti-td">
          ${contatti.length > 0 ? contatti.join("<br>") : "<span class='testo-smorzato'>−</span>"}
        </td>
        <td class="n">
          <div class="cliente-preventivi-badge" onclick="apriModaleCliente('${esc(c.id)}', true)" title="Visualizza preventivi collegati">
            <b>${collegati.length}</b> preventiv${collegati.length === 1 ? "o" : "i"}<br>
            <span class="tot-cliente-val">${euro(totFatt)}</span>
          </div>
        </td>
        <td style="text-align:right;white-space:nowrap">
          <button type="button" class="btn mini primario" onclick="creaPreventivoPerCliente('${esc(c.id)}')" title="Crea subito un nuovo preventivo per questo cliente">➕ Prev</button>
          <button type="button" class="btn mini chiaro" onclick="apriModaleCliente('${esc(c.id)}')" title="Modifica scheda anagrafica">✏️</button>
          <button type="button" class="btn mini pericolo" onclick="confermaEliminaCliente('${esc(c.id)}')" title="Elimina cliente dall'anagrafica">🗑️</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

/* ================== modale dettaglio / modifica cliente ================== */
let clienteInModifica = null;

function apriModaleCliente(id = null, mostraSubitoPreventivi = false){
  clienteInModifica = id ? ottieniClientePerId(id) : null;
  const isNuovo = !clienteInModifica;
  const c = clienteInModifica || {
    id: "cli_" + Date.now(),
    nome: "", ref: "", indirizzo: "", piva: "", cf: "", sdi: "", pec: "", email: "", tel: "", note: ""
  };

  const collegati = !isNuovo ? preventiviDiCliente(c) : [];

  let htmlPrev = "";
  if(collegati.length > 0){
    htmlPrev = `
      <div class="blocco-prev-collegati" style="margin-top:20px;border-top:1px solid var(--linea);padding-top:16px">
        <h4 style="margin:0 0 10px 0;font-size:14px;color:var(--teal)">Preventivi emessi per questo cliente (${collegati.length})</h4>
        <div style="max-height:180px;overflow-y:auto;border:1px solid var(--linea);border-radius:6px">
          <table class="arch" style="width:100%;margin:0;font-size:12.5px">
            <thead>
              <tr style="background:var(--sfondo-tabella-th, #f8f8f8)">
                <th>Numero</th>
                <th>Data</th>
                <th>Progetto</th>
                <th>Stato</th>
                <th class="n">Totale</th>
                <th style="text-align:right">Azione</th>
              </tr>
            </thead>
            <tbody>
              ${collegati.map(p => {
                const tot = calcolaTotalePreventivo(p);
                return `
                  <tr>
                    <td><b>${esc(p.numero)}</b></td>
                    <td>${esc(dataIt(p.data))}</td>
                    <td>${esc(p.progetto?.titolo || "−")}</td>
                    <td><span class="stato-pill stato-${esc(p.stato||'bozza')}">${esc(p.stato||'bozza')}</span></td>
                    <td class="n">${euro(tot)}</td>
                    <td style="text-align:right">
                      <button type="button" class="btn mini" onclick="chiudiModaleCliente();apri('${esc(p.id)}')">Apri</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  const contenuto = `
    <form id="form-cliente-modale" onsubmit="event.preventDefault();salvaClienteDaModale();" style="display:flex;flex-direction:column;gap:12px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label class="campo" style="grid-column:1/-1">
          <b>Ragione Sociale / Denominazione *</b>
          <input id="cli_m_nome" required placeholder="Es. Azienda S.r.l. o Mario Rossi" value="${esc(c.nome)}">
        </label>
        <label class="campo">
          Referente / Contatto
          <input id="cli_m_ref" placeholder="Es. Marco Rossi, Resp. Acquisti" value="${esc(c.ref)}">
        </label>
        <label class="campo">
          Indirizzo Completo
          <input id="cli_m_indirizzo" placeholder="Via, CAP, Città (Prov)" value="${esc(c.indirizzo)}">
        </label>
        <label class="campo">
          Partita IVA
          <input id="cli_m_piva" placeholder="Es. 01234567890" value="${esc(c.piva)}">
        </label>
        <label class="campo">
          Codice Fiscale
          <input id="cli_m_cf" placeholder="Es. RSSMRA80A01H501U" value="${esc(c.cf)}">
        </label>
        <label class="campo">
          Codice Destinatario SDI (7 caratteri)
          <input id="cli_m_sdi" maxlength="7" placeholder="Es. M5UXCR1 (o 0000000)" value="${esc(c.sdi)}" style="text-transform:uppercase;font-family:monospace">
        </label>
        <label class="campo">
          PEC (Posta Elettronica Certificata)
          <input id="cli_m_pec" type="email" placeholder="Es. azienda@pec.it" value="${esc(c.pec)}">
        </label>
        <label class="campo">
          Email Ordinaria
          <input id="cli_m_email" type="email" placeholder="Es. info@azienda.it" value="${esc(c.email)}">
        </label>
        <label class="campo">
          Telefono / Cellulare
          <input id="cli_m_tel" placeholder="Es. 06 1234567 / 333 1234567" value="${esc(c.tel)}">
        </label>
        <label class="campo" style="grid-column:1/-1">
          Note interne & Accordi commerciali
          <textarea id="cli_m_note" rows="2" placeholder="Es. Bonifico 30 gg d.f. f.m., sconto concordato 10% sui video...">${esc(c.note)}</textarea>
        </label>
      </div>
      ${htmlPrev}
    </form>
  `;

  const azioni = [
    { testo: "Annulla", classe: "chiaro" },
    {
      testo: isNuovo ? "Crea Cliente" : "Salva Modifiche",
      primario: true,
      esegui: () => salvaClienteDaModale()
    }
  ];

  if(!isNuovo){
    azioni.unshift({
      testo: "➕ Nuovo Preventivo per questo Cliente",
      classe: "primario",
      esegui: () => {
        chiudiModaleCliente();
        creaPreventivoPerCliente(c.id);
      }
    });
  }

  const d = modaleSicurezza(isNuovo ? "Nuovo Cliente" : `Scheda Cliente: ${c.nome}`, contenuto, azioni);
  d.classList.add("modale-cliente-dialog");
  setTimeout(() => {
    const primo = document.getElementById("cli_m_nome");
    if(primo) primo.focus();
  }, 100);
}

function chiudiModaleCliente(){
  document.getElementById("sicurezza-dialog")?.remove();
}

function salvaClienteDaModale(){
  const nome = val("cli_m_nome");
  if(!nome){
    avviso("Inserisci la Ragione Sociale del cliente.", "errore");
    return;
  }

  const lista = clienti().slice();
  const id = clienteInModifica ? clienteInModifica.id : ("cli_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6));
  const idx = lista.findIndex(x => x.id === id);

  const dati = {
    id: id,
    nome: nome,
    ref: val("cli_m_ref"),
    indirizzo: val("cli_m_indirizzo"),
    piva: val("cli_m_piva"),
    cf: val("cli_m_cf"),
    sdi: val("cli_m_sdi").toUpperCase(),
    pec: val("cli_m_pec"),
    email: val("cli_m_email"),
    tel: val("cli_m_tel"),
    note: val("cli_m_note"),
    creato: (clienteInModifica && clienteInModifica.creato) || aIsoLocale(new Date()),
    modificato: aIsoLocale(new Date())
  };

  if(idx >= 0){
    lista[idx] = dati;
  } else {
    lista.unshift(dati);
  }

  salvaClienti(lista);
  avviso(`Cliente "${nome}" salvato correttamente.`);
  disegnaClienti();
  if(window.FirebaseSync && typeof window.FirebaseSync.sincronizzaCliente === "function"){
    window.FirebaseSync.sincronizzaCliente(dati);
  }
}

function confermaEliminaCliente(id){
  const c = ottieniClientePerId(id);
  if(!c) return;
  const prevCollegati = preventiviDiCliente(c);
  
  const mess = prevCollegati.length > 0
    ? `Attenzione: ci sono ${prevCollegati.length} preventivi emessi per "${c.nome}". Eliminando la scheda cliente, i preventivi nell'archivio rimarranno comunque intatti. Vuoi continuare?`
    : `Sei sicuro di voler eliminare "${c.nome}" dall'anagrafica clienti?`;

  modaleSicurezza(
    "Elimina Cliente",
    `<p style="margin:0 0 16px 0;line-height:1.5">${esc(mess)}</p>`,
    [
      { testo: "Annulla", classe: "chiaro" },
      {
        testo: "Elimina Definitivamente",
        primario: true,
        classe: "pericolo",
        esegui: () => {
          const nuovaLista = clienti().filter(x => x.id !== id);
          salvaClienti(nuovaLista);
          avviso(`Cliente "${c.nome}" eliminato dall'anagrafica.`);
          disegnaClienti();
          if(window.FirebaseSync && typeof window.FirebaseSync.eliminaCliente === "function"){
            window.FirebaseSync.eliminaCliente(id);
          }
        }
      }
    ]
  );
}

function creaPreventivoPerCliente(id){
  const c = ottieniClientePerId(id);
  if(!c) return;

  const compila = () => {
    nuovo();
    set("cl_nome", c.nome || "");
    set("cl_ref", c.ref || "");
    set("cl_indirizzo", c.indirizzo || "");
    set("cl_piva", c.piva || (c.cf ? `C.F. ${c.cf}` : ""));
    set("cl_email", c.email || (c.pec ? `PEC: ${c.pec}` : ""));
    set("cl_tel", c.tel || "");
    
    // Aggiorna stato editor
    ultimoClienteAutocompilato = normalizzaCliente(c.nome);
    mostraFeedbackRubrica({ cliente: c });
    vista("editor");
    avviso(`Nuovo preventivo inizializzato per "${c.nome}".`);
  };

  if(modificatoNonSalvato){
    modaleSicurezza(
      "Modifiche non salvate",
      "<p>Ci sono modifiche non salvate nel preventivo corrente. Vuoi scartarle e creare un nuovo preventivo per questo cliente?</p>",
      [
        { testo: "Annulla", classe: "chiaro" },
        { testo: "Crea Nuovo", primario: true, classe: "pericolo", esegui: compila }
      ]
    );
    return;
  }

  compila();
}

// Registrazione modulo CRM Clienti in App
if(typeof window !== 'undefined' && window.App){
  window.App.clients = {
    getAll: clienti,
    saveAll: salvaClienti,
    getById: ottieniClientePerId,
    getByName: ottieniClientePerNome,
    syncFromArchive: sincronizzaClientiDaArchivio,
    render: disegnaClienti,
    filter: filtraClienti,
    openModal: apriModaleCliente,
    closeModal: chiudiModaleCliente,
    saveFromModal: salvaClienteDaModale,
    deleteClient: confermaEliminaCliente,
    createQuoteForClient: creaPreventivoPerCliente,
    updateBadge: aggiornaBadgeContatoreClienti,
    getQuotesForClient: preventiviDiCliente
  };
}
