/**
 * Motore fiscale e di calcolo 100% puro (zero dipendenze DOM).
 * Unica fonte di verità condivisa tra Editor, Anteprima A4, Stampa, Archivio e CRM Clienti.
 */

export const SOGLIA_BOLLO = 77.47;
export const IMPORTO_BOLLO = 2;
export const REGIMI_PIVA = new Set(["forf5", "forf15", "ordinario"]);
export const REGIMI_BOLLO = new Set(["forf5", "forf15", "occasionale"]);

export function round2(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calcola tutti gli importi fiscali del preventivo da un oggetto puro.
 * Supporta sconto in Euro ('euro') oppure percentuale ('perc').
 */
export function calcolaTotali(quote = {}) {
  const q = quote && typeof quote === "object" ? quote : {};
  const voci = Array.isArray(q.voci) ? q.voci : [];

  const imponibile = round2(
    voci.reduce((sum, v) => {
      const qty = Math.max(0, Number(v?.q) || 0);
      const price = Math.max(0, Number(v?.p) || 0);
      return sum + qty * price;
    }, 0)
  );

  const scontoTipo =
    q.scontoTipo === "perc" || q.progetto?.scontoTipo === "perc" ? "perc" : "euro";

  const rawScontoValore =
    q.scontoValore !== undefined && q.scontoValore !== null
      ? Number(q.scontoValore)
      : q.progetto?.scontoValore !== undefined && q.progetto?.scontoValore !== null
        ? Number(q.progetto.scontoValore)
        : Number(q.sconto);

  const scontoValore = Number.isFinite(rawScontoValore) ? Math.max(0, rawScontoValore) : 0;

  let scontoLordo = 0;
  if (scontoTipo === "perc") {
    const perc = Math.min(100, Math.max(0, scontoValore));
    scontoLordo = round2((imponibile * perc) / 100);
  } else {
    scontoLordo = round2(scontoValore);
  }

  const sconto = round2(Math.min(imponibile, scontoLordo));
  const base = round2(Math.max(0, imponibile - sconto));

  const regime = String(q.regime || "occasionale");
  const haPartitaIva = REGIMI_PIVA.has(regime);

  const rivPerc = haPartitaIva ? Math.min(100, Math.max(0, Number(q.rivalsa) || 0)) : 0;
  const rivalsa = round2((base * rivPerc) / 100);
  const imponibileIva = round2(base + rivalsa);

  const ivaPerc = regime === "ordinario" ? Math.min(100, Math.max(0, Number(q.iva) || 0)) : 0;
  const iva = round2((imponibileIva * ivaPerc) / 100);

  const bolloFlag = String(q.bollo || "auto");
  const bollo =
    REGIMI_BOLLO.has(regime) && bolloFlag !== "no" && imponibileIva > SOGLIA_BOLLO
      ? IMPORTO_BOLLO
      : 0;

  const ritAttiva = regime === "occasionale" || regime === "ordinario";
  const ritPerc = ritAttiva ? Math.min(100, Math.max(0, Number(q.ritenuta) || 0)) : 0;
  // La cassa integrativa 2% non è soggetta a ritenuta; la rivalsa INPS 4% sì.
  const baseRitenuta = rivPerc === 2 ? base : round2(base + rivalsa);
  const ritenuta = round2((baseRitenuta * ritPerc) / 100);

  const totaleDoc = round2(imponibileIva + iva + bollo);
  const netto = round2(totaleDoc - ritenuta);

  return {
    regime,
    haPartitaIva,
    imponibile,
    scontoTipo,
    scontoValore,
    scontoLordo,
    sconto,
    base,
    rivPerc,
    rivalsa,
    imponibileIva,
    ivaPerc,
    iva,
    bollo,
    ritPerc,
    ritenuta,
    totaleDoc,
    netto,
  };
}

/**
 * Helper rapido per KPI Archivio / Clienti (totale netto coerente col motore fiscale).
 */
export function calcolaTotalePreventivo(quote) {
  return calcolaTotali(quote).netto;
}

/**
 * Dicitura fiscale legale completa per Preventivo e Proforma / Nota di prestazione.
 */
export function dicituraFiscale(t) {
  if (!t || t.regime === "nessuno") return "";
  const parti = [];
  if (t.regime === "occasionale") {
    parti.push(
      "Prestazione occasionale ai sensi dell'art. 67, comma 1, lett. l) del D.P.R. 917/1986, priva del carattere di abitualità."
    );
    if (t.ritPerc > 0) {
      parti.push(
        `Compenso soggetto a ritenuta d'acconto del ${t.ritPerc}% ai sensi dell'art. 25 del D.P.R. 600/1973, versata dal committente in qualità di sostituto d'imposta.`
      );
    }
    parti.push("Operazione fuori campo IVA ai sensi dell'art. 5 del D.P.R. 633/1972.");
    if (t.bollo > 0) {
      parti.push(
        "Imposta di bollo di € 2,00 assolta sull'originale per importi superiori a € 77,47, a carico del committente."
      );
    }
  } else if (t.regime === "forf5" || t.regime === "forf15") {
    parti.push(
      "Operazione effettuata ai sensi dell'art. 1, commi da 54 a 89, della Legge 190/2014 e successive modificazioni — regime forfettario. Imposta non applicata."
    );
    parti.push(
      "Si richiede la non applicazione della ritenuta d'acconto ai sensi dell'art. 1, comma 67, della Legge 190/2014."
    );
    if (t.bollo > 0) {
      parti.push(
        "Imposta di bollo di € 2,00 assolta sull'originale per importi superiori a € 77,47, a carico del committente."
      );
    }
  } else if (t.regime === "ordinario") {
    if (t.ivaPerc > 0) {
      parti.push(`Operazione soggetta a IVA con aliquota del ${t.ivaPerc}%.`);
    } else {
      parti.push("Operazione non imponibile o esente ai fini IVA.");
    }
    if (t.ritPerc > 0) {
      parti.push(
        `Compenso soggetto a ritenuta d'acconto del ${t.ritPerc}% a titolo di acconto IRPEF ai sensi dell'art. 25 del D.P.R. 600/1973, operata dal committente in qualità di sostituto d'imposta.`
      );
    }
  }

  if (t.rivPerc === 4) {
    parti.push(
      "Rivalsa INPS Gestione Separata del 4% ai sensi dell'art. 1, comma 212, della Legge 662/1996."
    );
  } else if (t.rivPerc === 2) {
    parti.push("Contributo integrativo di cassa del 2%, non soggetto a ritenuta d'acconto.");
  }

  return parti.join(" ");
}

/**
 * Stima ingombro stampa A4 per decidere tra layout 2 pagine pulite (brevi)
 * e flusso continuo multi-pagina intelligente (articolati, 5+ voci o descrizioni estese).
 */
export function stimaIngombroStampa(quote) {
  const voci = Array.isArray(quote?.voci) ? quote.voci : [];
  let righeVoci = 0;
  for (const v of voci) {
    const descLen = String(v?.desc || "").trim().length;
    const righeDesc = descLen > 0 ? Math.ceil(descLen / 72) : 0;
    righeVoci += 1.9 + righeDesc;
  }
  const introLen = String(quote?.progetto?.intro || "").trim().length;
  const extraIntro = introLen > 240 ? Math.ceil((introLen - 240) / 105) : 0;
  const ingombroP1 = righeVoci + extraIntro;
  const pagina1Compatta = voci.length <= 4 && ingombroP1 <= 16;

  return {
    totVoci: voci.length,
    ingombroP1,
    pagina1Compatta,
  };
}
