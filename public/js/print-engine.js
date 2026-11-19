/* ================== stampa ================== */
function dicituraFiscale(t){
  const parti=[];
  if(t.regime==="occasionale"){
    parti.push("Prestazione occasionale ai sensi dell'art. 67, comma 1, lett. l) del D.P.R. 917/1986, priva del carattere di abitualità.");
    if(t.ritPerc>0) parti.push("Compenso soggetto a ritenuta d'acconto del "+t.ritPerc+"% ai sensi dell'art. 25 del D.P.R. 600/1973, versata dal committente in qualità di sostituto d'imposta.");
    parti.push("Operazione fuori campo IVA ai sensi dell'art. 5 del D.P.R. 633/1972.");
    if(t.bollo>0) parti.push("Imposta di bollo di € 2,00 assolta sull'originale per importi superiori a € 77,47, a carico del committente.");
  } else if(t.regime==="forf5"||t.regime==="forf15"){
    parti.push("Operazione effettuata ai sensi dell'art. 1, commi da 54 a 89, della Legge 190/2014 e successive modificazioni — regime forfettario. Imposta non applicata.");
    parti.push("Si richiede la non applicazione della ritenuta d'acconto ai sensi dell'art. 1, comma 67, della Legge 190/2014.");
    if(t.bollo>0) parti.push("Imposta di bollo di € 2,00 assolta sull'originale per importi superiori a € 77,47, a carico del committente.");
  } else if(t.regime==="ordinario"){
    if(t.ivaPerc>0) parti.push("Operazione soggetta a IVA con aliquota del "+t.ivaPerc+"%.");
    else parti.push("Operazione non imponibile o esente ai fini IVA.");
    if(t.ritPerc>0) parti.push("Compenso soggetto a ritenuta d'acconto del "+t.ritPerc+"% a titolo di acconto IRPEF ai sensi dell'art. 25 del D.P.R. 600/1973, operata dal committente in qualità di sostituto d'imposta.");
  }
  if(t.rivPerc===4) parti.push("Rivalsa INPS Gestione Separata del 4% ai sensi dell'art. 1, comma 212, della Legge 662/1996.");
  if(t.rivPerc===2) parti.push("Contributo integrativo di cassa del 2%, non soggetto a ritenuta d'acconto.");
  return parti.join(" ");
}

function bloccoTotali(t,etichettaImponibile,scontoTxt,senzaNota,titoloTotale){
  const r=(cl,l,v)=>`<div class="riga ${cl}"><span>${l}</span><span class="num">${v}</span></div>`;
  let h=r("",etichettaImponibile||"Imponibile",euro(t.imponibile));
  if(t.sconto>0) h+=r("att",esc(scontoTxt||"Sconto"),"\u2212\u00A0"+euro(t.sconto));
  if(t.rivPerc>0) h+=r("att",(t.rivPerc===2?"Contributo cassa ":"Rivalsa INPS ")+t.rivPerc+"%",euro(t.rivalsa));
  if(t.ivaPerc>0) h+=r("att","IVA "+t.ivaPerc+"%",euro(t.iva));
  if(t.bollo>0) h+=r("att","Marca da bollo",euro(t.bollo));
  if(t.ritenuta>0){
    h+=r("","<b>Totale documento</b>","<b>"+euro(t.totaleDoc)+"</b>");
    h+=r("att","Ritenuta d'acconto "+t.ritPerc+"%","\u2212\u00A0"+euro(t.ritenuta));
  }
  const labelTot = titoloTotale || "Totale Preventivo";
  h+=`<div class="riga totale"><span>${labelTot}</span><span class="num">${euro(t.netto)}</span></div>`;
  const d=senzaNota?"":dicituraFiscale(t);
  const noteCol = d
    ? `<div class="totali-note"><div class="totali-note-tit">Note fiscali</div><p class="nota">${d}</p></div>`
    : `<div class="totali-note"></div>`;
  return `<div class="totali">${noteCol}<div class="box">${h}</div></div>`;
}

function pieded(p){
  const io = (p && p.io) ? p.io : datiIo();
  const reg = (p && p.regime) ? p.regime : (typeof regimeAttivo === "function" ? regimeAttivo() : "occasionale");
  const haPartitaIva = ["forf5", "forf15", "ordinario"].includes(reg);
  const pivaVal = (io && io.piva) ? io.piva : (typeof val === "function" ? val("io_piva") : "");
  const cfVal = (io && io.cf) ? io.cf : (typeof val === "function" ? val("io_cf") : "");
  const fisc=[(haPartitaIva && pivaVal) ? "P. IVA "+esc(pivaVal) : "", cfVal ? "C.F. "+esc(cfVal) : ""].filter(Boolean).join(" · ");
  return `<footer class="pieded">
    <div class="footer-riga-1">
      <b>${IO.nome}</b> · ${IO.ruolo}${fisc?` · <span class="dati-fisc">${fisc}</span>`:""}
    </div>
    <div class="footer-riga-2">
      ${IO.citta} · <a href="mailto:${IO.mail}">${IO.mail}</a> · <a href="tel:${IO.tel.replace(/\s+/g,'')}">${IO.tel}</a> · <a href="${IO.sito && IO.sito.startsWith('http') ? IO.sito : ('https://' + (IO.sito || 'federicoletta.com'))}" target="_blank">federicoletta.com</a>
    </div>
  </footer>`;
}

function stimaIngombroStampa(p){
  const voci = Array.isArray(p?.voci) ? p.voci : [];
  let righeVoci = 0;
  voci.forEach(v => {
    const descLen = String(v?.desc || "").trim().length;
    const righeDesc = descLen > 0 ? Math.ceil(descLen / 72) : 0;
    righeVoci += 1.9 + righeDesc;
  });
  const introLen = String(p?.progetto?.intro || "").trim().length;
  const extraIntro = introLen > 240 ? Math.ceil((introLen - 240) / 105) : 0;
  const ingombroP1 = righeVoci + extraIntro;
  const pagina1Compatta = voci.length <= 4 && ingombroP1 <= 16;
  return {
    totVoci: voci.length,
    ingombroP1,
    pagina1Compatta
  };
}

function generaHtmlPaginePreventivo(p, t){
  if(!p) p = raccogli();
  if(!t) t = (typeof totaliPreventivo === "function" ? totaliPreventivo(p) : totali());
  const haFirma = usaFirmaAutografa();
  const voci = Array.isArray(p.voci) ? p.voci : [];
  const opzioni = Array.isArray(p.opzioni) ? p.opzioni : [];
  const incluso = Array.isArray(p.incluso) ? p.incluso : [];
  const escluso = Array.isArray(p.escluso) ? p.escluso : [];
  const condizioni = Array.isArray(p.condizioni) ? p.condizioni : [];
  const cliente = p.cliente || {};
  const progetto = p.progetto || {};

  const generaRighe=(lista, startIdx=1)=>lista.map((v, i)=>{
    const idxFmt = String(startIdx + i).padStart(2, "0");
    return `<tr class="voice-item">
      <td>
        <span class="v-nome"><span class="v-idx">${idxFmt}</span>${esc(v.nome)}</span>
        ${v.desc?`<span class="v-desc">${esc(v.desc)}</span>`:""}
      </td>
      <td class="num">${v.q}</td>
      <td class="num">${euro(v.p)}</td>
      <td class="num col-totale">${euro(v.q*v.p)}</td>
    </tr>`;
  }).join("");

  const scheda=[
    ["Titolo", progetto.titolo, true],
    ["Tipologia", progetto.tipo, false],
    ["Location", progetto.luogo, false],
    ["Giornate", progetto.giornate, false],
    ["Consegna", progetto.consegna, false]
  ]
    .filter(r=>r[1])
    .map(r=>`<div class="spec-item${r[2]?" spec-full":""}"><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`)
    .join("");

  const tabellaVoci = `<table class="voci">
    <colgroup>
      <col style="width:62%">
      <col style="width:10%">
      <col style="width:14%">
      <col style="width:14%">
    </colgroup>
    <thead>
      <tr>
        <th>Descrizione Prestazione</th>
        <th class="num">Q.tà</th>
        <th class="num">Unitario</th>
        <th class="num">Totale</th>
      </tr>
    </thead>
    <tbody>${generaRighe(voci, 1)}</tbody>
  </table>`;

  const opz = opzioni.length ? `<div class="sezione">Opzioni su richiesta</div>
    <table class="voci voci-opzioni">
      <colgroup>
        <col style="width:82%">
        <col style="width:18%">
      </colgroup>
      <tbody>${opzioni.map(o=>`<tr class="voice-item">
        <td><span class="v-nome">${esc(o.nome)}</span>${o.desc?`<span class="v-desc">${esc(o.desc)}</span>`:""}</td>
        <td class="num col-totale">${euro(o.p)}</td>
      </tr>`).join("")}</tbody>
    </table>` : "";

  const comprende = (incluso.length || escluso.length) ? `<div class="sezione">Cosa comprende</div>
    <div class="due-colonne">
      <div class="col-card">
        <div class="etichetta-incluso">Incluso nell'offerta</div>
        <ul>${incluso.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>
      </div>
      <div class="col-card escluso">
        <div class="etichetta-escluso">Escluso dall'offerta</div>
        <ul>${escluso.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>
      </div>
    </div>` : "";

  const condCards = condizioni.length ? `<div class="sezione">Condizioni contrattuali</div>
    <div class="condizioni-grid">${condizioni.map((c, i)=>{
      const isUltimoDispari = (i === condizioni.length - 1) && (condizioni.length % 2 !== 0);
      return `<div class="cond-card clause${isUltimoDispari?" clause-full":""}">
        <div class="cond-tit">${esc(c[0])}</div>
        <div class="cond-txt">${esc(c[1])}</div>
      </div>`;
    }).join("")}</div>` : "";

  const bloccoAccettazione = `<section class="accettazione sign-area">
    <div class="tit">Accettazione e Conferma d'Ordine</div>
    <p>Per accettare il presente preventivo, restituire copia firmata via email a <a href="mailto:${IO.mail}">${IO.mail}</a> oppure rispondere per iscritto con la formula «confermo il preventivo N. ${esc(p.numero)}».</p>
    <div class="firme">
      <div class="f">
        <div class="linea"></div>
        <div class="did">Il Committente · Data e firma per accettazione</div>
      </div>
      <div class="f">
        <div class="linea">${haFirma?`<img src="${FIRMA_AUTOGRAFA_PNG}" class="img-firma-auto" alt="Firma ${esc(IO.nome)}">`:""}</div>
        <div class="did">${esc(IO.nome)}</div>
      </div>
    </div>
  </section>`;

  const introHtml = (progetto.saluto || progetto.titolo || progetto.intro)
    ? `<section class="intro">
        ${progetto.saluto?`<p>${esc(progetto.saluto)}</p>`:""}
        <p>di seguito il preventivo${progetto.titolo?` per <b>${esc(progetto.titolo)}</b>`:""}.${progetto.intro?` ${esc(maiuscola(progetto.intro))}`:""}</p>
      </section>`
    : "";

  const headerPrincipale = `<header class="intestazione">
    <div class="intestazione-logo">${LOGO}</div>
    <div class="doc">
      <div class="tipo">PREVENTIVO</div>
      <div class="meta">N. <b>${esc(p.numero)}</b> · Genzano di Roma, ${esc(dataIt(p.data))}<br>
      ${p.validita?`Valido fino al <b>${esc(dataIt(p.validita))}</b>`:""}</div>
    </div>
  </header>`;

  const blocchiClienteProgetto = `<section class="blocchi">
    <div class="blocco blocco-cliente">
      <div class="etichetta">Cliente</div>
      <div class="nome">${esc(cliente.nome)}</div>
      <div class="righe">${[cliente.ref,cliente.indirizzo,cliente.piva,
        [cliente.email,cliente.tel].filter(Boolean).join(" · ")].filter(Boolean).map(esc).join("<br>")}</div>
    </div>
    <div class="blocco blocco-specifiche">
      <div class="etichetta">Specifiche Progetto</div>
      <dl class="spec-grid">${scheda}</dl>
    </div>
  </section>`;

  const stima = stimaIngombroStampa(p);

  if(stima.pagina1Compatta) {
    // Preventivo corto (2-4 voci): Pagina 1 pulita + Allegato Contrattuale a Pagina 2
    return `
      <div class="foglio-stampa foglio-preventivo">
        ${headerPrincipale}
        ${blocchiClienteProgetto}
        ${introHtml}
        <div class="sezione">Voci di preventivo</div>
        ${tabellaVoci}
        ${bloccoTotali(t,"Imponibile",p.sconto_txt,false,"Totale Preventivo")}
        <div class="spazio-flessibile"></div>
        <div class="rimando-continua">Segue allegato contrattuale, condizioni e firme a Pagina 2 →</div>
        ${pieded(p)}
      </div>

      <div class="foglio-stampa allegato-condizioni inizia-nuova-pagina">
        <header class="intestazione intestazione-compatta">
          <div class="intestazione-logo">${LOGO}</div>
          <div class="doc">
            <div class="tipo">Allegato Contrattuale</div>
            <div class="meta">Rif. preventivo <b>${esc(p.numero)}</b> · ${esc(dataIt(p.data))}</div>
          </div>
        </header>
        ${opz}
        ${comprende}
        ${condCards}
        ${bloccoAccettazione}
        <div class="spazio-flessibile"></div>
        ${pieded(p)}
      </div>`;
  }

  // Preventivo articolato (5+ voci o descrizioni estese): flusso continuo multi-pagina intelligente
  return `
    <div class="foglio-stampa foglio-continuo">
      ${headerPrincipale}
      ${blocchiClienteProgetto}
      ${introHtml}
      <div class="sezione">Voci di preventivo</div>
      ${tabellaVoci}
      ${bloccoTotali(t,"Imponibile",p.sconto_txt,false,"Totale Preventivo")}
      ${opz}

      <div class="allegato-condizioni flusso-continuo">
        <div class="allegato-header-inline">
          <div class="tit-inline">Allegato Contrattuale &amp; Condizioni</div>
          <div class="rif-inline">Rif. preventivo ${esc(p.numero)} · ${esc(dataIt(p.data))}</div>
        </div>
        ${comprende}
        ${condCards}
        ${bloccoAccettazione}
      </div>

      ${pieded(p)}
    </div>`;
}

function generaHtmlSecondoDocumento(p, t){
  if(!p) p = raccogli();
  if(!t) t = (typeof totaliPreventivo === "function" ? totaliPreventivo(p) : totali());
  const haFirma = usaFirmaAutografa();
  const reg = p.regime || (typeof regimeAttivo === "function" ? regimeAttivo() : "occasionale");
  const pIva = ["forf5", "forf15", "ordinario"].includes(reg);
  const oggi = aIsoLocale(new Date());
  const titolo = pIva ? "Proforma" : "Nota di prestazione occasionale";
  const compenso = t.imponibile - t.sconto;
  const io = p.io || datiIo();

  const bloccoIo = `<div class="blocco"><div class="etichetta">${pIva?"Prestatore":"Prestatore d'opera"}</div>
        <div class="nome">${esc(IO.nome)}</div>
        <div class="righe">${esc(IO.ruolo)}<br>${io.indirizzo?esc(io.indirizzo)+"<br>":""}
          ${(pIva&&io.piva)?"P. IVA "+esc(io.piva)+"<br>":""}${io.cf?"C.F. "+esc(io.cf)+"<br>":""}${esc(IO.tel)} · ${esc(IO.mail)}<br><a href="${IO.sito && IO.sito.startsWith('http') ? IO.sito : ('https://' + (IO.sito || 'federicoletta.com'))}" target="_blank">${esc(IO.sito)}</a></div>
      </div>`;

  const avvertenza = pIva
    ? `<b>Documento non valido ai fini fiscali.</b> La fattura sarà emessa in formato elettronico e trasmessa
       tramite il Sistema di Interscambio, come previsto per tutti i titolari di partita IVA. ${dicituraFiscale(t)}`
    : `<b>Prestazione occasionale ai sensi dell'art. 67, comma 1, lett. l) del D.P.R. 917/1986.</b>
       Compenso soggetto a ritenuta d'acconto del 20% ai sensi dell'art. 25 del D.P.R. 600/1973, che il committente
       versa in qualità di sostituto d'imposta. Operazione fuori campo IVA ai sensi dell'art. 5 del D.P.R. 633/1972,
       in quanto prestazione priva del carattere di abitualità.${t.bollo>0?" Marca da bollo da € 2,00 assolta sull'originale per importi oltre € 77,47.":""}
       Il compenso non supera il limite annuo di € 5.000 oltre il quale è dovuta l'iscrizione alla Gestione Separata INPS.`;

  return `
    <div class="foglio-stampa foglio-secondo">
      <header class="intestazione">
        <div class="intestazione-logo">${LOGO}</div>
        <div class="doc">
          <div class="tipo" style="font-size:18px">${titolo}</div>
          <div class="meta">Genzano di Roma, ${esc(dataIt(oggi))}<br>Rif. preventivo <b>${esc(p.numero)}</b></div>
        </div>
      </header>
      <section class="blocchi">
        ${bloccoIo}
        <div class="blocco"><div class="etichetta">Committente</div>
          <div class="nome">${esc(p.cliente.nome)}</div>
          <div class="righe">${[p.cliente.indirizzo,p.cliente.piva].filter(Boolean).map(esc).join("<br>")}</div>
        </div>
      </section>
      <div class="sezione">${pIva?"Prestazione concordata":"Prestazione svolta"}</div>
      <table class="voci">
        <colgroup>
          <col style="width:80%">
          <col style="width:20%">
        </colgroup>
        <thead><tr><th>Descrizione Prestazione</th><th class="num">Importo</th></tr></thead>
        <tbody><tr class="voice-item">
          <td><span class="v-nome">${esc(p.progetto.titolo)}</span>
          <span class="v-desc">${esc(p.voci.map(v=>v.nome).join(" · "))}${p.progetto.luogo?" · "+esc(p.progetto.luogo):""}</span></td>
          <td class="num col-totale">${euro(compenso)}</td>
        </tr></tbody>
      </table>
      ${bloccoTotali(Object.assign({},t,{imponibile:compenso,sconto:0}), pIva?"Compenso":"Compenso lordo", "", true, pIva?"Totale Documento":"Netto a pagare")}
      <div class="dicitura">${avvertenza}</div>
      <section class="pagamento">
        <div class="col"><div class="etichetta">Modalità di pagamento</div>
          <div class="val">Bonifico bancario</div>${io.iban?"IBAN "+esc(io.iban)+"<br>":""}Intestato a ${esc(IO.nome)}</div>
        <div class="col"><div class="etichetta">Termini e Causale</div>
          <div class="val">30 giorni data documento</div>Causale: ${esc(titolo)} rif. ${esc(p.numero)}${p.progetto.titolo?" · "+esc(p.progetto.titolo):""}</div>
      </section>
      <div class="firma-singola sign-area">
        <div class="b">
          <div class="linea">${haFirma?`<img src="${FIRMA_AUTOGRAFA_PNG}" class="img-firma-auto" alt="Firma ${esc(IO.nome)}">`:""}</div>
          <div class="did">${esc(IO.nome)}</div>
        </div>
      </div>
      <div class="spazio-flessibile"></div>
      ${pieded(p)}
    </div>`;
}

function stampaPreventivoVerificato(){
  const p = raccogli(), t = totali();
  const htmlPagine = generaHtmlPaginePreventivo(p, t);
  document.getElementById("stampa").innerHTML = htmlPagine;
  document.title = nomeFileDocumento("Preventivo",p).replace(/\.pdf$/i,"");
  window.print();
}

function stampaPreventivoArchivio(id){
  const tutti = (typeof archivio === "function" ? archivio() : []);
  const p = tutti.find(x => x.id === id);
  if(!p) {
    if(typeof avviso === "function") avviso("Preventivo non trovato.");
    return;
  }
  const t = (typeof totaliPreventivo === "function" ? totaliPreventivo(p) : totali());
  const htmlPagine = generaHtmlPaginePreventivo(p, t);
  document.getElementById("stampa").innerHTML = htmlPagine;
  document.title = (typeof nomeFileDocumento === "function" ? nomeFileDocumento("Preventivo", p) : (p.numero || "Preventivo")).replace(/\.pdf$/i, "");
  window.print();
}

function stampaSecondoVerificato(p){
  if(!p) p = raccogli();
  const t = (typeof totaliPreventivo === "function" ? totaliPreventivo(p) : totali());
  document.getElementById("stampa").innerHTML = generaHtmlSecondoDocumento(p, t);
  const reg = p.regime || (typeof regimeAttivo === "function" ? regimeAttivo() : "occasionale");
  const pIva = ["forf5", "forf15", "ordinario"].includes(reg);
  const tipoDoc = pIva ? "Proforma" : "NotaPrestazione";
  document.title = (typeof nomeFileDocumento === "function" ? nomeFileDocumento(tipoDoc, p) : tipoDoc).replace(/\.pdf$/i,"");
  window.print();
}

if(typeof window !== 'undefined'){
  window.stimaIngombroStampa = stimaIngombroStampa;
  window.generaHtmlPaginePreventivo = generaHtmlPaginePreventivo;
  window.generaHtmlSecondoDocumento = generaHtmlSecondoDocumento;
  window.pieded = pieded;
  window.stampaPreventivoArchivio = stampaPreventivoArchivio;
  window.stampaPreventivoVerificato = stampaPreventivoVerificato;
  window.stampaSecondoVerificato = stampaSecondoVerificato;
}
if(typeof window !== 'undefined' && window.App){
  window.App.print = {
    fiscalNotice: dicituraFiscale,
    totalsBlock: bloccoTotali,
    footer: pieded,
    estimateLayout: stimaIngombroStampa,
    printQuote: stampaPreventivoVerificato,
    printProforma: stampaSecondoVerificato,
    generatePagesHtml: generaHtmlPaginePreventivo,
    generateSecondDocHtml: generaHtmlSecondoDocumento
  };
}
