/**
 * Motore unificato di rendering editoriale A4 (Anteprima Live + Stampa / PDF).
 * - Unico template HTML condiviso (zero divergenze tra schermo e carta).
 * - Sanitizzazione esc() rigorosa su tutti i campi utente (anti-XSS).
 * - Asset esterni leggeri da /assets/ (logo SVG e firma PNG).
 */

import { ASSET_PATHS, IO } from "./config.js";
import { calcolaTotali, dicituraFiscale, stimaIngombroStampa } from "./calculations.js";
import { aIsoLocale, dataIt, esc, euro, maiuscola, nomeFileDocumento } from "./formatters.js";

function renderTotalsBlock(t, { labelImponibile = "Imponibile", scontoTxt = "", senzaNota = false, titoloTotale = "Totale Preventivo" } = {}) {
  const row = (cls, label, val) =>
    `<div class="riga ${cls}"><span>${label}</span><span class="num">${val}</span></div>`;

  let html = row("", esc(labelImponibile), euro(t.imponibile));

  if (t.sconto > 0) {
    const defaultLabel =
      t.scontoTipo === "perc" && t.scontoValore > 0
        ? `Sconto (${t.scontoValore}%)`
        : "Sconto";
    html += row("att", esc(scontoTxt || defaultLabel), `\u2212\u00A0${euro(t.sconto)}`);
  }
  if (t.rivPerc > 0) {
    html += row("att", `${t.rivPerc === 2 ? "Contributo cassa" : "Rivalsa INPS"} ${t.rivPerc}%`, euro(t.rivalsa));
  }
  if (t.ivaPerc > 0) {
    html += row("att", `IVA ${t.ivaPerc}%`, euro(t.iva));
  }
  if (t.bollo > 0) {
    html += row("att", "Marca da bollo", euro(t.bollo));
  }
  if (t.ritenuta > 0) {
    html += row("", "<b>Totale documento</b>", `<b>${euro(t.totaleDoc)}</b>`);
    html += row("att", `Ritenuta d'acconto ${t.ritPerc}%`, `\u2212\u00A0${euro(t.ritenuta)}`);
  }

  html += `<div class="riga totale"><span>${esc(titoloTotale)}</span><span class="num">${euro(t.netto)}</span></div>`;

  const note = senzaNota ? "" : dicituraFiscale(t);
  const noteCol = note
    ? `<div class="totali-note"><div class="totali-note-tit">Note fiscali</div><p class="nota">${esc(note)}</p></div>`
    : `<div class="totali-note"></div>`;

  return `<div class="totali">${noteCol}<div class="box">${html}</div></div>`;
}

export function renderFooterHtml(quote = {}, issuerFallback = {}) {
  const io = quote?.io || issuerFallback || {};
  const regime = quote?.regime || "occasionale";
  const haPartitaIva = ["forf5", "forf15", "ordinario"].includes(regime);
  const pivaVal = String(io.piva || "").trim();
  const cfVal = String(io.cf || "").trim();

  const fisc = [
    haPartitaIva && pivaVal ? `P. IVA ${esc(pivaVal)}` : "",
    cfVal ? `C.F. ${esc(cfVal)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const siteUrl = IO.sito.startsWith("http") ? IO.sito : `https://${IO.sito}`;

  return `<footer class="pieded">
    <div class="footer-riga-1">
      <b>${esc(IO.nome)}</b> · ${esc(IO.ruolo)}${fisc ? ` · <span class="dati-fisc">${fisc}</span>` : ""}
    </div>
    <div class="footer-riga-2">
      ${esc(IO.citta)} · <a href="mailto:${esc(IO.mail)}">${esc(IO.mail)}</a> · <a href="tel:${esc(IO.tel.replace(/\s+/g, ""))}">${esc(IO.tel)}</a> · <a href="${esc(siteUrl)}" target="_blank" rel="noopener">${esc(IO.sito)}</a>
    </div>
  </footer>`;
}

function renderLogoImg(compact = false) {
  return `<img src="${ASSET_PATHS.logoDoc}" class="doc-logo-img${compact ? " doc-logo-compact" : ""}" alt="${esc(IO.nome)}">`;
}

function renderSignatureImg(showSignature) {
  if (!showSignature) return "";
  return `<img src="${ASSET_PATHS.firma}" class="img-firma-auto" alt="Firma ${esc(IO.nome)}">`;
}

/**
 * Genera l'HTML A4 completo del Preventivo (condiviso al 100% tra Anteprima Live e Stampa PDF).
 */
export function renderQuoteDocumentHtml(quote, { showSignature = true, totals = null } = {}) {
  const p = quote || {};
  const t = totals || calcolaTotali(p);
  const voci = Array.isArray(p.voci) ? p.voci : [];
  const opzioni = Array.isArray(p.opzioni) ? p.opzioni : [];
  const incluso = Array.isArray(p.incluso) ? p.incluso : [];
  const escluso = Array.isArray(p.escluso) ? p.escluso : [];
  const condizioni = Array.isArray(p.condizioni) ? p.condizioni : [];
  const cliente = p.cliente || {};
  const progetto = p.progetto || {};

  const rowsHtml = voci
    .map((v, idx) => {
      const numIdx = String(idx + 1).padStart(2, "0");
      const qty = Number(v?.q) || 0;
      const price = Number(v?.p) || 0;
      return `<tr class="voice-item">
        <td>
          <span class="v-nome"><span class="v-idx">${numIdx}</span>${esc(v?.nome || "Voce senza titolo")}</span>
          ${v?.desc ? `<span class="v-desc">${esc(v.desc)}</span>` : ""}
        </td>
        <td class="num">${esc(qty)}</td>
        <td class="num">${euro(price)}</td>
        <td class="num col-totale">${euro(qty * price)}</td>
      </tr>`;
    })
    .join("");

  const scheda = [
    ["Titolo", progetto.titolo, true],
    ["Tipologia", progetto.tipo, false],
    ["Location", progetto.luogo, false],
    ["Giornate", progetto.giornate, false],
    ["Consegna", progetto.consegna, false],
  ]
    .filter((item) => Boolean(item[1]))
    .map(
      ([label, val, full]) =>
        `<div class="spec-item${full ? " spec-full" : ""}"><dt>${esc(label)}</dt><dd>${esc(val)}</dd></div>`
    )
    .join("");

  const clienteDetails = [
    cliente.ref,
    cliente.indirizzo,
    [cliente.piva ? `P. IVA ${cliente.piva}` : "", cliente.cf ? `C.F. ${cliente.cf}` : ""]
      .filter(Boolean)
      .join(" · "),
    [cliente.sdi ? `SDI ${cliente.sdi}` : "", cliente.pec ? `PEC ${cliente.pec}` : ""]
      .filter(Boolean)
      .join(" · "),
    [cliente.email, cliente.tel].filter(Boolean).join(" · "),
  ]
    .filter(Boolean)
    .map(esc)
    .join("<br>");

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
    <tbody>${rowsHtml}</tbody>
  </table>`;

  const opzHtml = opzioni.length
    ? `<div class="sezione">Opzioni su richiesta</div>
       <table class="voci voci-opzioni">
         <colgroup>
           <col style="width:82%">
           <col style="width:18%">
         </colgroup>
         <tbody>${opzioni
           .map(
             (o) => `<tr class="voice-item">
               <td><span class="v-nome">${esc(o?.nome)}</span>${o?.desc ? `<span class="v-desc">${esc(o.desc)}</span>` : ""}</td>
               <td class="num col-totale">${euro(o?.p)}</td>
             </tr>`
           )
           .join("")}</tbody>
       </table>`
    : "";

  const comprendeHtml =
    incluso.length || escluso.length
      ? `<div class="sezione">Cosa comprende</div>
         <div class="due-colonne">
           <div class="col-card">
             <div class="etichetta-incluso">Incluso nell'offerta</div>
             <ul>${incluso.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
           </div>
           <div class="col-card escluso">
             <div class="etichetta-escluso">Escluso dall'offerta</div>
             <ul>${escluso.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
           </div>
         </div>`
      : "";

  const condHtml = condizioni.length
    ? `<div class="sezione">Condizioni contrattuali</div>
       <div class="condizioni-grid">${condizioni
         .map((c, i) => {
           const titolo = Array.isArray(c) ? c[0] : c?.titolo;
           const testo = Array.isArray(c) ? c[1] : c?.testo;
           const isLastOdd = i === condizioni.length - 1 && condizioni.length % 2 !== 0;
           return `<div class="cond-card clause${isLastOdd ? " clause-full" : ""}">
             <div class="cond-tit">${esc(titolo)}</div>
             <div class="cond-txt">${esc(testo)}</div>
           </div>`;
         })
         .join("")}</div>`
    : "";

  const bloccoAccettazione = `<section class="accettazione sign-area">
    <div class="tit">Accettazione e Conferma d'Ordine</div>
    <p>Per accettare il presente preventivo, restituire copia firmata via email a <a href="mailto:${esc(IO.mail)}">${esc(IO.mail)}</a> oppure rispondere per iscritto con la formula «confermo il preventivo N. ${esc(p.numero)}».</p>
    <div class="firme">
      <div class="f">
        <div class="linea"></div>
        <div class="did">Il Committente · Data e firma per accettazione</div>
      </div>
      <div class="f">
        <div class="linea">${renderSignatureImg(showSignature)}</div>
        <div class="did">${esc(IO.nome)}</div>
      </div>
    </div>
  </section>`;

  const introHtml =
    progetto.saluto || progetto.titolo || progetto.intro
      ? `<section class="intro">
          ${progetto.saluto ? `<p>${esc(progetto.saluto)}</p>` : ""}
          <p>di seguito il preventivo${progetto.titolo ? ` per <b>${esc(progetto.titolo)}</b>` : ""}.${progetto.intro ? ` ${esc(maiuscola(progetto.intro))}` : ""}</p>
        </section>`
      : "";

  const headerPrincipale = `<header class="intestazione">
    <div class="intestazione-logo">${renderLogoImg(false)}</div>
    <div class="doc">
      <div class="tipo">PREVENTIVO</div>
      <div class="meta">N. <b>${esc(p.numero)}</b> · Genzano di Roma, ${esc(dataIt(p.data))}<br>
      ${p.validita ? `Valido fino al <b>${esc(dataIt(p.validita))}</b>` : ""}</div>
    </div>
  </header>`;

  const blocchiClienteProgetto = `<section class="blocchi">
    <div class="blocco blocco-cliente">
      <div class="etichetta">Cliente</div>
      <div class="nome">${esc(cliente.nome || "—")}</div>
      <div class="righe">${clienteDetails}</div>
    </div>
    <div class="blocco blocco-specifiche">
      <div class="etichetta">Specifiche Progetto</div>
      <dl class="spec-grid">${scheda || `<div class="spec-item spec-full"><dd>—</dd></div>`}</dl>
    </div>
  </section>`;

  const stima = stimaIngombroStampa(p);

  if (stima.pagina1Compatta) {
    return `<div class="doc-a4-root">
      <div class="foglio-stampa foglio-preventivo">
        ${headerPrincipale}
        ${blocchiClienteProgetto}
        ${introHtml}
        <div class="sezione">Voci di preventivo</div>
        ${tabellaVoci}
        ${renderTotalsBlock(t, { scontoTxt: p.sconto_txt })}
        <div class="spazio-flessibile"></div>
        <div class="blocco-chiusura">
          <div class="rimando-continua">Segue allegato contrattuale, condizioni e firme a Pagina 2 →</div>
          ${renderFooterHtml(p)}
        </div>
      </div>

      <div class="foglio-stampa allegato-condizioni inizia-nuova-pagina">
        <header class="intestazione intestazione-compatta">
          <div class="intestazione-logo">${renderLogoImg(true)}</div>
          <div class="doc">
            <div class="tipo">Allegato Contrattuale &amp; Condizioni</div>
            <div class="meta">Rif. preventivo <b>${esc(p.numero)}</b> · ${esc(dataIt(p.data))}</div>
          </div>
        </header>
        ${comprendeHtml}
        ${opzHtml}
        ${condHtml}
        <div class="blocco-chiusura">
          ${bloccoAccettazione}
          ${renderFooterHtml(p)}
        </div>
      </div>
    </div>`;
  }

  return `<div class="doc-a4-root">
    <div class="foglio-stampa foglio-continuo">
      ${headerPrincipale}
      ${blocchiClienteProgetto}
      ${introHtml}
      <div class="sezione">Voci di preventivo</div>
      ${tabellaVoci}
      ${renderTotalsBlock(t, { scontoTxt: p.sconto_txt })}

      <div class="allegato-condizioni inizia-nuova-pagina">
        <div class="allegato-header-inline">
          <div class="tit-inline">Allegato Contrattuale &amp; Condizioni</div>
          <div class="rif-inline">Rif. preventivo ${esc(p.numero)} · ${esc(dataIt(p.data))}</div>
        </div>
        ${comprendeHtml}
        ${opzHtml}
        ${condHtml}
        <div class="blocco-chiusura">
          ${bloccoAccettazione}
          ${renderFooterHtml(p)}
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Genera l'HTML A4 della Nota di Prestazione Occasionale o Fattura Proforma.
 */
export function renderSecondDocumentHtml(quote, { showSignature = true, totals = null } = {}) {
  const p = quote || {};
  const t = totals || calcolaTotali(p);
  const pIva = t.haPartitaIva;
  const oggi = aIsoLocale(new Date());
  const titolo = pIva ? "Proforma" : "Nota di prestazione occasionale";
  const compenso = t.base;
  const io = p.io || {};
  const cliente = p.cliente || {};
  const progetto = p.progetto || {};
  const siteUrl = IO.sito.startsWith("http") ? IO.sito : `https://${IO.sito}`;

  const bloccoIo = `<div class="blocco">
    <div class="etichetta">${pIva ? "Prestatore" : "Prestatore d'opera"}</div>
    <div class="nome">${esc(IO.nome)}</div>
    <div class="righe">
      ${esc(IO.ruolo)}<br>
      ${io.indirizzo ? `${esc(io.indirizzo)}<br>` : ""}
      ${pIva && io.piva ? `P. IVA ${esc(io.piva)}<br>` : ""}
      ${io.cf ? `C.F. ${esc(io.cf)}<br>` : ""}
      ${esc(IO.tel)} · ${esc(IO.mail)}<br>
      <a href="${esc(siteUrl)}" target="_blank" rel="noopener">${esc(IO.sito)}</a>
    </div>
  </div>`;

  const committenteRighe = [
    cliente.indirizzo,
    [cliente.piva ? `P. IVA ${cliente.piva}` : "", cliente.cf ? `C.F. ${cliente.cf}` : ""]
      .filter(Boolean)
      .join(" · "),
    cliente.sdi ? `Codice SDI: ${cliente.sdi}` : "",
    cliente.pec ? `PEC: ${cliente.pec}` : "",
  ]
    .filter(Boolean)
    .map(esc)
    .join("<br>");

  const avvertenza = pIva
    ? `<b>Documento non valido ai fini fiscali.</b> La fattura sarà emessa in formato elettronico e trasmessa tramite il Sistema di Interscambio, come previsto per tutti i titolari di partita IVA. ${esc(dicituraFiscale(t))}`
    : `<b>Prestazione occasionale ai sensi dell'art. 67, comma 1, lett. l) del D.P.R. 917/1986.</b> Compenso soggetto a ritenuta d'acconto del ${esc(t.ritPerc || 20)}% ai sensi dell'art. 25 del D.P.R. 600/1973, che il committente versa in qualità di sostituto d'imposta. Operazione fuori campo IVA ai sensi dell'art. 5 del D.P.R. 633/1972, in quanto prestazione priva del carattere di abitualità.${t.bollo > 0 ? " Marca da bollo da € 2,00 assolta sull'originale per importi oltre € 77,47." : ""} Il compenso non supera il limite annuo di € 5.000 oltre il quale è dovuta l'iscrizione alla Gestione Separata INPS.`;

  const vociTitoli = (Array.isArray(p.voci) ? p.voci : [])
    .map((v) => String(v?.nome || "").trim())
    .filter(Boolean)
    .join(" · ");

  return `<div class="doc-a4-root">
    <div class="foglio-stampa foglio-secondo">
      <header class="intestazione">
        <div class="intestazione-logo">${renderLogoImg(false)}</div>
        <div class="doc">
          <div class="tipo" style="font-size:18px">${esc(titolo)}</div>
          <div class="meta">Genzano di Roma, ${esc(dataIt(oggi))}<br>Rif. preventivo <b>${esc(p.numero)}</b></div>
        </div>
      </header>
      <section class="blocchi">
        ${bloccoIo}
        <div class="blocco">
          <div class="etichetta">Committente</div>
          <div class="nome">${esc(cliente.nome || "—")}</div>
          <div class="righe">${committenteRighe}</div>
        </div>
      </section>
      <div class="sezione">${pIva ? "Prestazione concordata" : "Prestazione svolta"}</div>
      <table class="voci">
        <colgroup>
          <col style="width:80%">
          <col style="width:20%">
        </colgroup>
        <thead><tr><th>Descrizione Prestazione</th><th class="num">Importo</th></tr></thead>
        <tbody><tr class="voice-item">
          <td>
            <span class="v-nome">${esc(progetto.titolo || "Prestazione professionale")}</span>
            <span class="v-desc">${esc(vociTitoli)}${progetto.luogo ? ` · ${esc(progetto.luogo)}` : ""}</span>
          </td>
          <td class="num col-totale">${euro(compenso)}</td>
        </tr></tbody>
      </table>
      ${renderTotalsBlock(
        { ...t, imponibile: compenso, sconto: 0 },
        {
          labelImponibile: pIva ? "Compenso" : "Compenso lordo",
          senzaNota: true,
          titoloTotale: pIva ? "Totale Documento" : "Netto a pagare",
        }
      )}
      <div class="dicitura">${avvertenza}</div>
      <section class="pagamento">
        <div class="col">
          <div class="etichetta">Modalità di pagamento</div>
          <div class="val">Bonifico bancario</div>
          ${io.iban ? `IBAN ${esc(io.iban)}<br>` : ""}Intestato a ${esc(IO.nome)}
        </div>
        <div class="col">
          <div class="etichetta">Termini e Causale</div>
          <div class="val">30 giorni data documento</div>
          Causale: ${esc(titolo)} rif. ${esc(p.numero)}${progetto.titolo ? ` · ${esc(progetto.titolo)}` : ""}
        </div>
      </section>
      <div class="spazio-flessibile"></div>
      <div class="blocco-chiusura">
        <div class="firma-singola sign-area">
          <div class="b">
            <div class="linea">${renderSignatureImg(showSignature)}</div>
            <div class="did">${esc(IO.nome)}</div>
          </div>
        </div>
        ${renderFooterHtml(p)}
      </div>
    </div>
  </div>`;
}

/**
 * Genera l'HTML A4 del Listino Interno.
 */
export function renderPriceListDocumentHtml(items = [], issuer = {}) {
  const list = Array.isArray(items) ? items : [];
  const cats = [...new Set(list.map((v) => v.cat || "Altro"))];
  const oggi = aIsoLocale(new Date());

  const sezioni = cats
    .map((c) => {
      const rows = list
        .filter((v) => (v.cat || "Altro") === c)
        .map(
          (v) => `<tr class="voice-item">
            <td>
              <span class="v-nome">${esc(v.nome)}</span>
              ${v.desc ? `<span class="v-desc">${esc(v.desc)}</span>` : ""}
            </td>
            <td class="num">${esc(v.unita || "—")}</td>
            <td class="num col-totale">${Number(v.prezzo) > 0 ? euro(v.prezzo) : "a preventivo"}</td>
          </tr>`
        )
        .join("");

      return `<div class="sezione">${esc(c)}</div>
        <table class="voci">
          <colgroup><col style="width:66%"><col style="width:16%"><col style="width:18%"></colgroup>
          <thead><tr><th>Voce</th><th class="num">Unità</th><th class="num">Prezzo</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    })
    .join("");

  return `<div class="doc-a4-root">
    <div class="foglio-stampa foglio-continuo">
      <header class="intestazione">
        <div class="intestazione-logo">${renderLogoImg(false)}</div>
        <div class="doc">
          <div class="tipo" style="font-size:19px">Listino interno</div>
          <div class="meta">Aggiornato al ${esc(dataIt(oggi))}<br>Documento di lavoro</div>
        </div>
      </header>
      <div class="dicitura" style="margin-bottom:14px">
        <b>Uso interno.</b> Prezzi di riferimento per la compilazione dei preventivi, al netto di sconti,
        imposte e maggiorazioni. Gli importi non costituiscono offerta al pubblico e vanno confermati caso per caso.
      </div>
      ${sezioni || `<p class="v-desc">Nessuna voce presente nel listino.</p>`}
      ${renderFooterHtml({ io: issuer })}
    </div>
  </div>`;
}

async function waitForPrintImages(container) {
  const imgs = [...container.querySelectorAll("img")];
  await Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 1500);
      });
    })
  );
}

async function mountAndPrint(html, docTitle) {
  const stage = document.getElementById("stampa");
  if (!stage) return;
  const prevTitle = document.title;
  stage.innerHTML = html;
  document.title = docTitle;
  await waitForPrintImages(stage);

  const restore = () => {
    document.title = prevTitle;
  };
  window.addEventListener("afterprint", restore, { once: true });
  window.print();
  setTimeout(restore, 1000);
}

export async function printQuoteDocument(quote, { showSignature = true } = {}) {
  const html = renderQuoteDocumentHtml(quote, { showSignature });
  const title = nomeFileDocumento("Preventivo", quote).replace(/\.pdf$/i, "");
  await mountAndPrint(html, title);
}

export async function printSecondDocument(quote, { showSignature = true } = {}) {
  const t = calcolaTotali(quote);
  const tipo = t.haPartitaIva ? "Proforma" : "NotaPrestazione";
  const html = renderSecondDocumentHtml(quote, { showSignature, totals: t });
  const title = nomeFileDocumento(tipo, quote).replace(/\.pdf$/i, "");
  await mountAndPrint(html, title);
}

export async function printPriceListDocument(items, issuer) {
  const oggi = aIsoLocale(new Date());
  const html = renderPriceListDocumentHtml(items, issuer);
  await mountAndPrint(html, `FC_Listino_Interno_${oggi}`);
}
