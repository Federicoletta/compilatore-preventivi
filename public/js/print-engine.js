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
  if(d) h+=`<div class="nota">${d}</div>`;
  return `<div class="totali"><div class="box">${h}</div></div>`;
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
function generaHtmlPaginePreventivo(p, t){
  if(!p) p = raccogli();
  if(!t) t = (typeof totaliPreventivo === "function" ? totaliPreventivo(p) : totali());
  const haFirma = usaFirmaAutografa();
  
  const generaRighe=(lista, startIdx=1)=>lista.map((v, i)=>`<tr>
      <td><span class="v-nome">${startIdx + i}. ${esc(v.nome)}</span>${v.desc?`<span class="v-desc">${esc(v.desc)}</span>`:""}</td>
      <td class="num">${v.q}</td><td class="num">${euro(v.p)}</td><td class="num">${euro(v.q*v.p)}</td></tr>`).join("");
  
  const scheda=[["Titolo",p.progetto.titolo],["Tipologia",p.progetto.tipo],["Location",p.progetto.luogo],
                ["Giornate",p.progetto.giornate],["Consegna",p.progetto.consegna]]
      .filter(r=>r[1]).map(r=>`<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join("");
  
  const opz=p.opzioni.length?`<div class="sezione" style="margin-top:3.5mm">Opzioni su richiesta</div>
      <table class="voci"><tbody>${p.opzioni.map(o=>`<tr>
        <td><span class="v-nome">${esc(o.nome)}</span>${o.desc?`<span class="v-desc">${esc(o.desc)}</span>`:""}</td>
        <td class="num" style="width:28mm">${euro(o.p)}</td></tr>`).join("")}</tbody></table>`:"";
  
  const comprende=(p.incluso.length||p.escluso.length)?`<div class="sezione" style="margin-top:2mm">Cosa comprende</div>
      <div class="due-colonne">
        <div class="col-card"><div class="etichetta-incluso">✓ Incluso nell'offerta</div><ul>${p.incluso.map(i=>`<li>${esc(i)}</li>`).join("")}</ul></div>
        <div class="col-card escluso"><div class="etichetta-escluso">✕ Non incluso nell'offerta</div><ul>${p.escluso.map(i=>`<li>${esc(i)}</li>`).join("")}</ul></div>
      </div>`:"";

  const condCards = p.condizioni.length ? `<div class="sezione" style="margin-top:2mm">Condizioni contrattuali</div>
      <div class="condizioni-grid">${p.condizioni.map((c, i)=>{
        const isUltimoDispari = (i === p.condizioni.length - 1) && (p.condizioni.length % 2 !== 0);
        return `<div class="cond-card"${isUltimoDispari?' style="grid-column: 1 / -1"':''}>
          <div class="cond-tit">${esc(c[0])}</div><div class="cond-txt">${esc(c[1])}</div>
        </div>`;
      }).join("")}</div>` : "";

  const bloccoAccettazione = `<section class="accettazione">
    <div class="tit">Accettazione e Conferma d'Ordine</div>
    <p>Per accettare il presente preventivo, restituire copia firmata via email a <a href="mailto:${IO.mail}">${IO.mail}</a> oppure rispondere per iscritto con la formula «confermo il preventivo N. ${esc(p.numero)}».</p>
    <div class="firme">
      <div class="f"><div class="linea"></div><div class="did">Il Committente (Data e Firma per accettazione)</div></div>
      <div class="f"><div class="linea">${haFirma?`<img src="${FIRMA_AUTOGRAFA_PNG}" class="img-firma-auto" alt="Firma Federico Coletta">`:""}</div><div class="did">${IO.nome} · Federico Coletta</div></div>
    </div>
  </section>`;

  const totVoci = p.voci.length;
  let htmlPagine = "";

  if(totVoci <= 5) {
    htmlPagine = `
      <div class="foglio-stampa">
        <header class="intestazione">
          ${LOGO}
          <div class="doc"><div class="tipo">PREVENTIVO</div>
            <div class="meta">N. <b>${esc(p.numero)}</b> · Genzano di Roma, ${esc(dataIt(p.data))}<br>
            ${p.validita?`Valido fino al <b>${esc(dataIt(p.validita))}</b>`:""}</div></div>
        </header>
        <section class="blocchi">
          <div class="blocco"><div class="etichetta">Cliente</div>
            <div class="nome">${esc(p.cliente.nome)}</div>
            <div class="righe">${[p.cliente.ref,p.cliente.indirizzo,p.cliente.piva,
              [p.cliente.email,p.cliente.tel].filter(Boolean).join(" · ")].filter(Boolean).map(esc).join("<br>")}</div>
          </div>
          <div class="blocco card"><div class="etichetta">Specifiche Progetto</div><dl>${scheda}</dl></div>
        </section>
        <section class="intro">
          ${p.progetto.saluto?`<p>${esc(p.progetto.saluto)}</p>`:""}
          <p>di seguito il preventivo per <b>${esc(p.progetto.titolo)}</b>. ${esc(maiuscola(p.progetto.intro))}</p>
        </section>
        <div class="sezione">Voci di preventivo</div>
        <table class="voci"><thead><tr><th>Descrizione Prestazione</th><th class="num" style="width:16mm">Q.tà</th>
          <th class="num" style="width:26mm">Prezzo unit.</th><th class="num" style="width:28mm">Totale</th></tr></thead>
          <tbody>${generaRighe(p.voci, 1)}</tbody></table>
        ${bloccoTotali(t,"Imponibile",p.sconto_txt,false,"Totale Preventivo")}
        
        <div class="spazio-flessibile"></div>
        <div class="rimando-continua">Segue allegato contrattuale, condizioni e firme a Pagina 2 →</div>
        ${pieded(p)}
      </div>

      <div class="foglio-stampa allegato-condizioni">
        <header class="intestazione" style="margin-bottom:3mm">
          ${LOGO}
          <div class="doc"><div class="tipo" style="font-size:12pt">Allegato Contrattuale & Firme</div>
            <div class="meta">Rif. preventivo <b>${esc(p.numero)}</b> · ${esc(dataIt(p.data))}</div></div>
        </header>
        ${comprende}
        ${opz}
        ${condCards}
        ${bloccoAccettazione}
        <div class="spazio-flessibile"></div>
        ${pieded(p)}
      </div>`;
  } else {
    const sogliaP1 = totVoci <= 8 ? Math.ceil(totVoci / 2) : 6;
    const vociP1 = p.voci.slice(0, sogliaP1);
    const vociP2 = p.voci.slice(sogliaP1);

    htmlPagine = `
      <div class="foglio-stampa">
        <header class="intestazione">
          ${LOGO}
          <div class="doc"><div class="tipo">PREVENTIVO</div>
            <div class="meta">N. <b>${esc(p.numero)}</b> · Genzano di Roma, ${esc(dataIt(p.data))}<br>
            ${p.validita?`Valido fino al <b>${esc(dataIt(p.validita))}</b>`:""}</div></div>
        </header>
        <section class="blocchi">
          <div class="blocco"><div class="etichetta">Cliente</div>
            <div class="nome">${esc(p.cliente.nome)}</div>
            <div class="righe">${[p.cliente.ref,p.cliente.indirizzo,p.cliente.piva,
              [p.cliente.email,p.cliente.tel].filter(Boolean).join(" · ")].filter(Boolean).map(esc).join("<br>")}</div>
          </div>
          <div class="blocco card"><div class="etichetta">Specifiche Progetto</div><dl>${scheda}</dl></div>
        </section>
        <section class="intro">
          ${p.progetto.saluto?`<p>${esc(p.progetto.saluto)}</p>`:""}
          <p>di seguito il preventivo per <b>${esc(p.progetto.titolo)}</b>. ${esc(maiuscola(p.progetto.intro))}</p>
        </section>
        <div class="sezione">Voci di preventivo (1/2)</div>
        <table class="voci"><thead><tr><th>Descrizione Prestazione</th><th class="num" style="width:16mm">Q.tà</th>
          <th class="num" style="width:26mm">Prezzo unit.</th><th class="num" style="width:28mm">Totale</th></tr></thead>
          <tbody>${generaRighe(vociP1, 1)}</tbody></table>
        
        <div class="spazio-flessibile"></div>
        <div class="rimando-continua">Segue continuazione voci, totali e opzioni a Pagina 2 →</div>
        ${pieded(p)}
      </div>

      <div class="foglio-stampa">
        <header class="intestazione" style="margin-bottom:3mm">
          ${LOGO}
          <div class="doc"><div class="tipo" style="font-size:12pt">Continuazione Voci & Totali</div>
            <div class="meta">Rif. preventivo <b>${esc(p.numero)}</b> · Pagina 2</div></div>
        </header>
        <div class="sezione">Voci di preventivo (2/2)</div>
        <table class="voci"><thead><tr><th>Descrizione Prestazione</th><th class="num" style="width:16mm">Q.tà</th>
          <th class="num" style="width:26mm">Prezzo unit.</th><th class="num" style="width:28mm">Totale</th></tr></thead>
          <tbody>${generaRighe(vociP2, sogliaP1 + 1)}</tbody></table>
        
        ${bloccoTotali(t,"Imponibile",p.sconto_txt,false,"Totale Preventivo")}
        ${opz}
        
        <div class="spazio-flessibile"></div>
        <div class="rimando-continua">Segue allegato contrattuale, condizioni e firme a Pagina 3 →</div>
        ${pieded(p)}
      </div>

      <div class="foglio-stampa allegato-condizioni">
        <header class="intestazione" style="margin-bottom:3mm">
          ${LOGO}
          <div class="doc"><div class="tipo" style="font-size:12pt">Allegato Contrattuale & Firme</div>
            <div class="meta">Rif. preventivo <b>${esc(p.numero)}</b> · Pagina 3</div></div>
        </header>
        ${comprende}
        ${condCards}
        ${bloccoAccettazione}
        <div class="spazio-flessibile"></div>
        ${pieded(p)}
      </div>`;
  }

  return htmlPagine;
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
        <div class="nome">${IO.nome}</div>
        <div class="righe">${IO.ruolo}<br>${io.indirizzo?esc(io.indirizzo)+"<br>":""}
          ${(pIva&&io.piva)?"P. IVA "+esc(io.piva)+"<br>":""}${io.cf?"C.F. "+esc(io.cf)+"<br>":""}${IO.tel} · ${IO.mail}<br><a href="${IO.sito}" target="_blank">${IO.sito}</a></div>
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
    <div class="foglio-stampa">
    <header class="intestazione">
      ${LOGO}
      <div class="doc"><div class="tipo" style="font-size:14pt">${titolo}</div>
        <div class="meta">Genzano di Roma, ${esc(dataIt(oggi))}<br>Rif. preventivo <b>${esc(p.numero)}</b></div></div>
    </header>
    <section class="blocchi">
      ${bloccoIo}
      <div class="blocco card"><div class="etichetta">Committente</div>
        <div class="nome">${esc(p.cliente.nome)}</div>
        <div class="righe">${[p.cliente.indirizzo,p.cliente.piva].filter(Boolean).map(esc).join("<br>")}</div>
      </div>
    </section>
    <div class="sezione">${pIva?"Prestazione concordata":"Prestazione svolta"}</div>
    <table class="voci"><thead><tr><th>Descrizione Prestazione</th><th class="num" style="width:32mm">Importo</th></tr></thead>
      <tbody><tr>
        <td><span class="v-nome">${esc(p.progetto.titolo)}</span>
        <span class="v-desc">${esc(p.voci.map(v=>v.nome).join(" · "))}${p.progetto.luogo?" · "+esc(p.progetto.luogo):""}</span></td>
        <td class="num">${euro(compenso)}</td></tr></tbody></table>
    ${bloccoTotali(Object.assign({},t,{imponibile:compenso,sconto:0}), pIva?"Compenso":"Compenso lordo", "", true, pIva?"Totale Documento":"Netto a pagare")}
    <div class="dicitura">${avvertenza}</div>
    <section class="pagamento">
      <div class="col"><div class="etichetta">Modalità di pagamento</div>
        <div class="val">Bonifico bancario</div>${io.iban?"IBAN "+esc(io.iban)+"<br>":""}Intestato a ${IO.nome}</div>
      <div class="col"><div class="etichetta">Termini e Causale</div>
        <div class="val">30 giorni data documento</div>Causale: ${esc(titolo)} rif. ${esc(p.numero)}${p.progetto.titolo?" · "+esc(p.progetto.titolo):""}</div>
    </section>
    <div class="firma-singola"><div class="b"><div class="linea">${haFirma?`<img src="${FIRMA_AUTOGRAFA_PNG}" class="img-firma-auto" alt="Firma Federico Coletta">`:""}</div><div class="did">${IO.nome} · Federico Coletta</div></div></div>
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

function stampaSecondoVerificato(p){
  if(!p) p = raccogli();
  const t = (typeof totaliPreventivo === "function" ? totaliPreventivo(p) : totali());
  document.getElementById("stampa").innerHTML = generaHtmlSecondoDocumento(p, t);
  const reg = p.regime || (typeof regimeAttivo === "function" ? regimeAttivo() : "occasionale");
  const pIva = ["forf5", "forf15", "ordinario"].includes(reg);
  const tipoDoc = pIva ? "Proforma" : "NotaPrestazione";
  document.title = nomeFileDocumento(tipoDoc,p).replace(/\.pdf$/i,"");
  window.print();
}

if(typeof window !== 'undefined'){
  window.generaHtmlPaginePreventivo = generaHtmlPaginePreventivo;
  window.generaHtmlSecondoDocumento = generaHtmlSecondoDocumento;
  window.pieded = pieded;
}
if(typeof window !== 'undefined' && window.App){
  window.App.print = {
    fiscalNotice: dicituraFiscale,
    totalsBlock: bloccoTotali,
    footer: pieded,
    printQuote: stampaPreventivoVerificato,
    printProforma: stampaSecondoVerificato,
    generatePagesHtml: generaHtmlPaginePreventivo,
    generateSecondDocHtml: generaHtmlSecondoDocumento
  };
}
