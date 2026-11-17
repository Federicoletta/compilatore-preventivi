/**
 * Compilatore Preventivi - Schema Guard & Data Validator (v2.1.0)
 * Verifica, sanifica e ripara le strutture dati per evitare valori NaN, campi nulli o crash.
 */
(function(window){
  "use strict";

  const STATI_VALIDI = new Set(["bozza", "inviato", "accettato", "rifiutato", "annullato"]);

  function numeroSicuro(val, fallback = 0) {
    if (typeof val === "number" && !isNaN(val) && isFinite(val)) return val;
    if (typeof val === "string") {
      const parsed = parseFloat(val.replace(",", "."));
      if (!isNaN(parsed) && isFinite(parsed)) return parsed;
    }
    return fallback;
  }

  function stringaSicura(val, fallback = "") {
    if (typeof val === "string") return val;
    if (val == null) return fallback;
    return String(val);
  }

  function arraySicuro(val) {
    return Array.isArray(val) ? val : [];
  }

  /**
   * Sanifica un preventivo garantendo che ogni proprietà esista e sia del tipo corretto.
   */
  function sanificaPreventivo(p) {
    if (!p || typeof p !== "object") {
      p = {};
    }

    const c = Object.assign({}, p);

    c.id = stringaSicura(c.id, "p" + Date.now());
    c.numero = stringaSicura(c.numero, "FC_2026_01");
    c.data = stringaSicura(c.data, new Date().toISOString().slice(0, 10));
    c.validita = stringaSicura(c.validita, "");
    c.stato = STATI_VALIDI.has(c.stato) ? c.stato : "bozza";

    c.cliente = {
      nome: stringaSicura(c.cliente?.nome),
      ref: stringaSicura(c.cliente?.ref),
      indirizzo: stringaSicura(c.cliente?.indirizzo),
      piva: stringaSicura(c.cliente?.piva),
      email: stringaSicura(c.cliente?.email),
      tel: stringaSicura(c.cliente?.tel)
    };

    c.progetto = {
      titolo: stringaSicura(c.progetto?.titolo),
      tipo: stringaSicura(c.progetto?.tipo),
      luogo: stringaSicura(c.progetto?.luogo),
      giornate: stringaSicura(c.progetto?.giornate),
      consegna: stringaSicura(c.progetto?.consegna),
      saluto: stringaSicura(c.progetto?.saluto, "Gentile "),
      intro: stringaSicura(c.progetto?.intro)
    };

    c.voci = arraySicuro(c.voci).map(v => {
      const pVal = Math.max(0, numeroSicuro(v?.p != null ? v.p : v?.prezzo, 0));
      const qVal = Math.max(0, numeroSicuro(v?.q != null ? v.q : v?.qta, 1));
      const nomeVal = stringaSicura(v?.nome || v?.desc);
      const descVal = stringaSicura(v?.desc || v?.dettaglio);

      return {
        nome: nomeVal,
        desc: descVal,
        q: qVal,
        p: pVal
      };
    });

    if (c.voci.length === 0) {
      c.voci.push({ nome: "", desc: "", q: 1, p: 0 });
    }

    c.sconto = Math.max(0, numeroSicuro(c.sconto, 0));
    c.sconto_txt = stringaSicura(c.sconto_txt, "Sconto pacchetto");
    c.regime = stringaSicura(c.regime, "occasionale");
    c.ritenuta = numeroSicuro(c.ritenuta, 20);
    c.rivalsa = numeroSicuro(c.rivalsa, 0);
    c.iva = numeroSicuro(c.iva, 22);
    c.bollo = stringaSicura(c.bollo, "auto");

    c.incluso = arraySicuro(c.incluso).map(s => stringaSicura(s).trim()).filter(Boolean);
    c.escluso = arraySicuro(c.escluso).map(s => stringaSicura(s).trim()).filter(Boolean);
    c.opzioni = arraySicuro(c.opzioni).map(o => ({
      nome: stringaSicura(o?.nome),
      desc: stringaSicura(o?.desc),
      p: Math.max(0, numeroSicuro(o?.p != null ? o.p : o?.prezzo, 0))
    }));
    c.condizioni = arraySicuro(c.condizioni).map(cond => {
      if (Array.isArray(cond)) {
        return [stringaSicura(cond[0]).trim(), stringaSicura(cond[1]).trim()];
      }
      if (cond && typeof cond === "object") {
        return [stringaSicura(cond.titolo || cond.nome).trim(), stringaSicura(cond.testo || cond.desc).trim()];
      }
      const str = stringaSicura(cond).trim();
      const idx = str.indexOf(",");
      if (idx > -1) {
        return [str.slice(0, idx).trim(), str.slice(idx + 1).trim()];
      }
      return [str, ""];
    }).filter(c => c[0] || c[1]);

    c.io = {
      cf: stringaSicura(c.io?.cf),
      iban: stringaSicura(c.io?.iban),
      indirizzo: stringaSicura(c.io?.indirizzo),
      piva: stringaSicura(c.io?.piva)
    };

    c.totale = numeroSicuro(c.totale, 0);
    c.modificato = stringaSicura(c.modificato, new Date().toISOString());

    // Preservazione metadati Cloud, Cestino e Annullamento
    if (p.annullamento && typeof p.annullamento === "object") {
      c.annullamento = {
        data: stringaSicura(p.annullamento.data),
        nota: stringaSicura(p.annullamento.nota)
      };
    }
    if (p.cestinato === true) {
      c.cestinato = true;
    }
    if (p.eliminatoIl) {
      c.eliminatoIl = stringaSicura(p.eliminatoIl);
    }
    if (p.driveFileId) {
      c.driveFileId = stringaSicura(p.driveFileId);
    }
    if (p.driveUrl) {
      c.driveUrl = stringaSicura(p.driveUrl);
    }
    if (p.driveSavedAt) {
      c.driveSavedAt = stringaSicura(p.driveSavedAt);
    }

    return c;
  }

  /**
   * Valida un oggetto preventivo e segnala eventuali incongruenze.
   */
  function validaPreventivo(p) {
    const errori = [];
    const avvisi = [];

    if (!p || typeof p !== "object") {
      return { valido: false, errori: ["L'oggetto preventivo è nullo o non valido."], avvisi };
    }

    if (!p.numero || typeof p.numero !== "string") errori.push("Numero preventivo mancante o non valido.");
    if (!p.data || typeof p.data !== "string") avvisi.push("Data mancante o non specificata.");
    if (!Array.isArray(p.voci) || p.voci.length === 0) avvisi.push("Il preventivo non contiene voci di compenso.");

    return {
      valido: errori.length === 0,
      errori,
      avvisi,
      sanificato: sanificaPreventivo(p)
    };
  }

  /**
   * Valida e ripara una stringa JSON di backup completa prima del caricamento.
   */
  function validaBackupJSON(rawJson) {
    let parsed;
    try {
      parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
    } catch(err) {
      return { valido: false, errore: "JSON non valido: " + err.message, dati: null };
    }

    if (!parsed || typeof parsed !== "object") {
      return { valido: false, errore: "Il file non contiene una struttura dati valida.", dati: null };
    }

    const preventiviRaw = Array.isArray(parsed) ? parsed : (parsed.preventivi || []);
    const preventiviSanificati = preventiviRaw.map(p => sanificaPreventivo(p));

    return {
      valido: true,
      conteggio: preventiviSanificati.length,
      dati: {
        preventivi: preventiviSanificati,
        listino: Array.isArray(parsed.listino) ? parsed.listino : [],
        io: parsed.io && typeof parsed.io === "object" ? parsed.io : {}
      }
    };
  }

  const Validator = {
    sanitizeQuote: sanificaPreventivo,
    validateQuote: validaPreventivo,
    validateBackup: validaBackupJSON,
    safeNumber: numeroSicuro,
    safeString: stringaSicura
  };

  if (window.App) {
    window.App.validator = Validator;
  }

  // Facade globale
  window.sanificaPreventivo = sanificaPreventivo;
  window.validaPreventivo = validaPreventivo;
  window.validaBackupJSON = validaBackupJSON;

})(typeof window !== "undefined" ? window : globalThis);
