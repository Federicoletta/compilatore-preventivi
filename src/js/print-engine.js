/**
 * Motore unificato di rendering editoriale A4 (Anteprima Live + Stampa / PDF).
 * - Unico template HTML condiviso (zero divergenze tra schermo e carta).
 * - Vero footer a piè di pagina su ogni foglio (Table Spacer + Fixed Footer).
 * - Misurazione reale del DOM prima di window.print() per Auto-Compact (100%–120%)
 *   e Salto Pagina Intelligente dell'Allegato (soglia 42% spazio libero).
 * - Sanitizzazione esc() rigorosa su tutti i campi utente (anti-XSS).
 */

import { ASSET_PATHS, IO } from "./config.js";
import { calcolaTotali, dicituraFiscale, stimaIngombroStampa } from "./calculations.js";
import { aIsoLocale, dataIt, esc, euro, maiuscola, nomeFileDocumento } from "./formatters.js";

const USABLE_PAGE_HEIGHT_MM = 255; // A4 (297mm) - margini (24mm) - footer spacer (14mm) - tolleranza (4mm)
const FALLBACK_PAGE_HEIGHT_PX = 964; // ~255mm a 96dpi
const AUTO_COMPACT_MAX_RATIO = 1.2; // 100%–120% di 1 pagina -> attiva .print-compact (Preventivo)
const ANNEX_AUTO_COMPACT_MAX_RATIO = 1.22; // 100%–122% di 1 pagina -> tenta .print-compact (Allegato)
const FLOW_ANNEX_FREE_RATIO_MIN = 0.42; // >42% di foglio libero sull'ultima pagina -> .flow-annex

function formatPiva(raw) {
  const val = String(raw || "").trim();
  if (!val) return "";
  return /^p\.?\s*iva\b|^p\.\s*iva/i.test(val) ? val : `P. IVA ${val}`;
}

function formatCf(raw) {
  const val = String(raw || "").trim();
  if (!val) return "";
  return /^c\.\s*f\.?|^cf(?:\s|:)/i.test(val) ? val : `C.F. ${val}`;
}

function renderTotalsBlock(
  t,
  { labelImponibile = "Imponibile", scontoTxt = "", senzaNota = false, titoloTotale = "Totale Preventivo" } = {}
) {
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

  return `<div class="totali doc-totals-wrap">${noteCol}<div class="box">${html}</div></div>`;
}

export function renderFooterHtml(quote = {}, issuerFallback = {}) {
  const io = quote?.io || issuerFallback || {};
  const regime = quote?.regime || "occasionale";
  const haPartitaIva = ["forf5", "forf15", "ordinario"].includes(regime);
  const pivaVal = String(io.piva || "").trim();
  const cfVal = String(io.cf || "").trim();

  const fisc = [
    haPartitaIva && pivaVal ? esc(formatPiva(pivaVal)) : "",
    cfVal ? esc(formatCf(cfVal)) : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const siteUrl = IO.sito.startsWith("http") ? IO.sito : `https://${IO.sito}`;

  return `<footer class="pieded doc-running-footer">
    <div class="footer-riga-1">
      <b>${esc(IO.nome)}</b> · ${esc(IO.ruolo)}${fisc ? ` · <span class="dati-fisc">${fisc}</span>` : ""}
    </div>
    <div class="footer-riga-2">
      ${esc(IO.citta)} · <a href="mailto:${esc(IO.mail)}">${esc(IO.mail)}</a> · <a href="tel:${esc(IO.tel.replace(/\s+/g, ""))}">${esc(IO.tel)}</a> · <a href="${esc(siteUrl)}" target="_blank" rel="noopener">${esc(IO.sito)}</a>
    </div>
  </footer>`;
}

function wrapInPrintShell(bodyHtml, footerHtml) {
  return `<div class="doc-a4-root">
    <table class="print-shell" role="presentation">
      <tbody>
        <tr>
          <td class="print-shell-body">${bodyHtml}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td class="print-shell-foot">
            <div class="print-footer-spacer" aria-hidden="true"></div>
          </td>
        </tr>
      </tfoot>
    </table>
    ${footerHtml}
  </div>`;
}

function renderLogoImg(compact = false) {
  return `<img src="${ASSET_PATHS.logoDoc}" class="doc-logo-img${compact ? " doc-logo-compact" : ""}" alt="${esc(IO.nome)}">`;
}

function renderSignatureImg(showSignature) {
  if (!showSignature) return "";
  return `<img src="${ASSET_PATHS.firma}" class="img-firma-auto" alt="Firma ${esc(IO.nome)}">`;
}

/**
 * Calcolo puro della decisione di salto pagina per l'Allegato (usabile anche in test).
 * - Se .doc-section-quote <= 1 pagina -> "force-page-break"
 * - Se > 1 pagina e spazio libero sull'ultima pagina > 42% -> "flow-annex"
 * - Altrimenti -> "force-page-break"
 */
export function computeAnnexBreakMode(quoteHeightPx, pageHeightPx = FALLBACK_PAGE_HEIGHT_PX) {
  if (!pageHeightPx || pageHeightPx <= 0) return "force-page-break";
  if (quoteHeightPx <= pageHeightPx) {
    return "force-page-break";
  }
  const remainder = quoteHeightPx % pageHeightPx;
  const usedOnLastPage = remainder === 0 ? pageHeightPx : remainder;
  const freeRatio = (pageHeightPx - usedOnLastPage) / pageHeightPx;
  return freeRatio > FLOW_ANNEX_FREE_RATIO_MIN ? "flow-annex" : "force-page-break";
}

/**
 * Genera l'HTML A4 completo del Preventivo (condiviso al 100% tra Anteprima Live e Stampa PDF).
 * Separa nettamente .doc-section-quote e .doc-section-annex dentro .print-shell + .doc-running-footer.
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
    [formatPiva(cliente.piva), formatCf(cliente.cf)].filter(Boolean).join(" · "),
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
    ? `<div class="doc-section-conditions">
         <div class="sezione">Condizioni contrattuali</div>
         <div class="condizioni-grid clauses-grid">${condizioni
           .map((c, i) => {
             const titolo = Array.isArray(c) ? c[0] : c?.titolo;
             const testo = Array.isArray(c) ? c[1] : c?.testo;
             const isLastOdd = i === condizioni.length - 1 && condizioni.length % 2 !== 0;
             return `<div class="cond-card clause${isLastOdd ? " clause-full" : ""}">
               <div class="cond-tit">${esc(titolo)}</div>
               <div class="cond-txt">${esc(testo)}</div>
             </div>`;
           })
           .join("")}</div>
       </div>`
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

  // Classe iniziale per l'anteprima a schermo; in stampa viene ricalcolata su misure DOM reali.
  const stima = stimaIngombroStampa(p);
  const initialAnnexMode = stima.pagina1Compatta ? "force-page-break" : "flow-annex";

  const bodyHtml = `
    <div class="doc-section-quote">
      ${headerPrincipale}
      ${blocchiClienteProgetto}
      ${introHtml}
      <div class="sezione">Voci di preventivo</div>
      ${tabellaVoci}
      ${renderTotalsBlock(t, { scontoTxt: p.sconto_txt })}
      <div class="rimando-continua"${initialAnnexMode === "flow-annex" ? " hidden" : ""}>Segue allegato contrattuale, condizioni e firme nella pagina seguente →</div>
    </div>

    <div class="doc-section-annex allegato-condizioni ${initialAnnexMode}">
      <table class="annex-shell" role="presentation">
        <thead class="annex-header-page">
          <tr>
            <th class="annex-shell-head">
              <header class="intestazione intestazione-compatta">
                <div class="intestazione-logo">${renderLogoImg(true)}</div>
                <div class="doc">
                  <div class="tipo">Allegato Contrattuale &amp; Condizioni</div>
                  <div class="meta">Rif. preventivo <b>${esc(p.numero)}</b> · ${esc(dataIt(p.data))}</div>
                </div>
              </header>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="annex-row-main">
            <td class="annex-shell-body">
              <div class="allegato-header-inline annex-header-flow">
                <div class="tit-inline">Allegato Contrattuale &amp; Condizioni</div>
                <div class="rif-inline">Rif. preventivo ${esc(p.numero)} · ${esc(dataIt(p.data))}</div>
              </div>
              ${comprendeHtml}
              ${opzHtml}
            </td>
          </tr>
          <tr class="annex-row-conditions">
            <td class="annex-shell-body">
              ${condHtml}
              ${bloccoAccettazione}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  return wrapInPrintShell(bodyHtml, renderFooterHtml(p));
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
      ${pIva && io.piva ? `${esc(formatPiva(io.piva))}<br>` : ""}
      ${io.cf ? `${esc(formatCf(io.cf))}<br>` : ""}
      ${esc(IO.tel)} · ${esc(IO.mail)}<br>
      <a href="${esc(siteUrl)}" target="_blank" rel="noopener">${esc(IO.sito)}</a>
    </div>
  </div>`;

  const committenteRighe = [
    cliente.indirizzo,
    [formatPiva(cliente.piva), formatCf(cliente.cf)].filter(Boolean).join(" · "),
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

  const bodyHtml = `
    <div class="doc-section-second foglio-secondo">
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
      <div class="firma-singola sign-area">
        <div class="b">
          <div class="linea">${renderSignatureImg(showSignature)}</div>
          <div class="did">${esc(IO.nome)}</div>
        </div>
      </div>
    </div>
  `;

  return wrapInPrintShell(bodyHtml, renderFooterHtml(p));
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

  const bodyHtml = `
    <div class="doc-section-pricelist">
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
    </div>
  `;

  return wrapInPrintShell(bodyHtml, renderFooterHtml({ io: issuer }));
}

async function waitForPrintAssets(container) {
  const imgs = [...container.querySelectorAll("img")];
  const imgWait = Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 1500);
      });
    })
  );

  const fontWait =
    typeof document !== "undefined" && document.fonts?.ready
      ? Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 600))])
      : Promise.resolve();

  await Promise.all([imgWait, fontWait]);
}

function measureUsablePageHeightPx(stage) {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:1px;height:${USABLE_PAGE_HEIGHT_MM}mm;`;
  stage.appendChild(probe);
  const measured = probe.getBoundingClientRect().height;
  probe.remove();
  return measured > 100 ? measured : FALLBACK_PAGE_HEIGHT_PX;
}

/**
 * Motore Auto-Fit Anti-Sbordo & Salto Pagina Intelligente:
 * Misura l'altezza reale del DOM a larghezza A4 utile (182mm) prima di window.print().
 */
function applySmartPrintLayout(stage) {
  stage.classList.add("is-measuring-print");

  try {
    const pageHeightPx = measureUsablePageHeightPx(stage);
    const quoteSec = stage.querySelector(".doc-section-quote");
    const annexSec = stage.querySelector(".doc-section-annex");
    const secondSec = stage.querySelector(".doc-section-second");

    // Documento secondario (Proforma / Nota di prestazione): Auto-Compact se sborda leggermente (100%–120%)
    if (secondSec) {
      secondSec.classList.remove("print-compact");
      const h = secondSec.getBoundingClientRect().height;
      if (h > pageHeightPx && h <= pageHeightPx * AUTO_COMPACT_MAX_RATIO) {
        secondSec.classList.add("print-compact");
      }
      return;
    }

    if (!quoteSec) return;

    const rimandoEl = quoteSec.querySelector(".rimando-continua");
    const condRow = annexSec ? annexSec.querySelector(".annex-row-conditions") : null;
    const condSec = annexSec ? annexSec.querySelector(".doc-section-conditions") : null;

    // Reset iniziale per misurazione pulita
    quoteSec.classList.remove("print-compact");
    if (annexSec) {
      annexSec.classList.remove("print-compact", "force-page-break", "flow-annex");
      annexSec.classList.add("force-page-break");
    }
    if (condRow) condRow.classList.remove("break-conditions-page");
    if (condSec) condSec.classList.remove("break-conditions-page");
    if (rimandoEl) rimandoEl.hidden = true;

    // 1) Misura .doc-section-quote e applica Auto-Compact se tra 100% e 120% di 1 pagina
    let quoteHeight = quoteSec.getBoundingClientRect().height;
    if (quoteHeight > pageHeightPx && quoteHeight <= pageHeightPx * AUTO_COMPACT_MAX_RATIO) {
      quoteSec.classList.add("print-compact");
      quoteHeight = quoteSec.getBoundingClientRect().height;
    }

    if (!annexSec) return;

    // 2) Salto Pagina Intelligente per l'Allegato (soglia 42% spazio libero sull'ultima pagina)
    const annexMode = computeAnnexBreakMode(quoteHeight, pageHeightPx);
    annexSec.classList.remove("force-page-break", "flow-annex");
    annexSec.classList.add(annexMode);

    // Mostra il rimando solo se c'è un salto pagina reale e se non fa sbordare Pagina 1
    if (rimandoEl) {
      if (annexMode === "force-page-break") {
        rimandoEl.hidden = false;
        const heightWithRimando = quoteSec.getBoundingClientRect().height;
        if (quoteHeight <= pageHeightPx && heightWithRimando > pageHeightPx) {
          rimandoEl.hidden = true;
        }
      } else {
        rimandoEl.hidden = true;
      }
    }

    // 3) Misura .doc-section-annex:
    //    - Se rientra in 1 pagina -> invariato (2 pagine pulite).
    //    - Se sfora fino al 122% -> prova .print-compact per farlo rientrare in Pagina 2.
    //    - Se supera comunque 1 pagina -> rimuove .print-compact e manda in blocco
    //      CONDIZIONI CONTRATTUALI + Accettazione & Firme su Pagina 3 (con thead ripetuto).
    const annexHeight = annexSec.getBoundingClientRect().height;
    if (annexHeight > pageHeightPx) {
      let fitsInOnePage = false;

      if (annexHeight <= pageHeightPx * ANNEX_AUTO_COMPACT_MAX_RATIO) {
        annexSec.classList.add("print-compact");
        const compactHeight = annexSec.getBoundingClientRect().height;
        if (compactHeight <= pageHeightPx) {
          fitsInOnePage = true;
        } else {
          annexSec.classList.remove("print-compact");
        }
      }

      if (!fitsInOnePage && (condRow || condSec)) {
        const hasContentBeforeConditions = Boolean(
          annexSec.querySelector(".due-colonne, .voci-opzioni")
        );
        if (hasContentBeforeConditions) {
          if (condRow) condRow.classList.add("break-conditions-page");
          if (condSec) condSec.classList.add("break-conditions-page");
        }
      }
    }
  } finally {
    stage.classList.remove("is-measuring-print");
  }
}

async function mountAndPrint(html, docTitle) {
  const stage = document.getElementById("stampa");
  if (!stage) return;
  const prevTitle = document.title;
  stage.innerHTML = html;
  document.title = docTitle;
  await waitForPrintAssets(stage);
  applySmartPrintLayout(stage);

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
