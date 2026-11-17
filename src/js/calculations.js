/* ================== calcolo e regimi fiscali ================== */
(function(window){
  "use strict";

  const calc = {
    regimeAttivo(){
      return (window.val ? window.val("regime") : "") || "occasionale";
    },

    conPartitaIva(){
      return ["forf5", "forf15", "ordinario"].includes(calc.regimeAttivo());
    },

    totali(){
      const r = calc.regimeAttivo();
      const voci = typeof window.leggiVoci === "function" ? window.leggiVoci() : [];
      const imponibile = voci.reduce((s, v) => s + (v.q * v.p), 0);
      const sconto = parseFloat(window.val ? window.val("sconto") : 0) || 0;
      const base = Math.max(0, imponibile - sconto);

      const rivPerc = calc.conPartitaIva() ? (parseFloat(window.val ? window.val("rivalsa") : 0) || 0) : 0;
      const rivalsa = base * rivPerc / 100;
      const imponibileIva = base + rivalsa;

      const ivaPerc = (r === "ordinario") ? (parseFloat(window.val ? window.val("iva") : 0) || 0) : 0;
      const iva = imponibileIva * ivaPerc / 100;

      const applicaBolloRegime = (r === "forf5" || r === "forf15" || r === "occasionale");
      const bolloDovuto = applicaBolloRegime && (window.val ? window.val("bollo") : "") !== "no" && imponibileIva > 77.47;
      const bollo = bolloDovuto ? 2 : 0;

      let ritPerc = 0;
      if(r === "occasionale" || r === "ordinario"){
        ritPerc = parseFloat(window.val ? window.val("ritenuta") : 0) || 0;
      }
      const baseRitenuta = (rivPerc === 2) ? base : base + rivalsa;
      const ritenuta = baseRitenuta * ritPerc / 100;

      const totaleDoc = imponibileIva + iva + bollo;
      return {
        imponibile, sconto, base, rivPerc, rivalsa, imponibileIva, ivaPerc, iva,
        bollo, ritPerc, ritenuta, totaleDoc, netto: totaleDoc - ritenuta, regime: r
      };
    },

    totaliPreventivo(p){
      if(!p) return calc.totali();
      const r = p.regime || "occasionale";
      const pIva = ["forf5", "forf15", "ordinario"].includes(r);
      const voci = Array.isArray(p.voci) ? p.voci : [];
      const imponibile = voci.reduce((s, v) => s + ((parseFloat(v.q) || 0) * (parseFloat(v.p) || 0)), 0);
      const sconto = parseFloat(p.sconto) || 0;
      const base = Math.max(0, imponibile - sconto);
      const rivPerc = pIva ? (parseFloat(p.rivalsa) || 0) : 0;
      const rivalsa = base * rivPerc / 100;
      const imponibileIva = base + rivalsa;
      const ivaPerc = (r === "ordinario") ? (parseFloat(p.iva) || 0) : 0;
      const iva = imponibileIva * ivaPerc / 100;
      const applicaBolloRegime = (r === "forf5" || r === "forf15" || r === "occasionale");
      const bolloDovuto = applicaBolloRegime && p.bollo !== "no" && imponibileIva > 77.47;
      const bollo = bolloDovuto ? 2 : 0;
      let ritPerc = 0;
      if(r === "occasionale" || r === "ordinario"){
        ritPerc = parseFloat(p.ritenuta) || 0;
      }
      const baseRitenuta = (rivPerc === 2) ? base : base + rivalsa;
      const ritenuta = baseRitenuta * ritPerc / 100;
      const totaleDoc = imponibileIva + iva + bollo;
      return {
        imponibile, sconto, base, rivPerc, rivalsa, imponibileIva, ivaPerc, iva,
        bollo, ritPerc, ritenuta, totaleDoc, netto: totaleDoc - ritenuta, regime: r
      };
    },

    cambiaRegime(){
      const r = calc.regimeAttivo();
      const mostra = (id, v) => {
        const e = document.getElementById(id);
        if(e) e.style.display = v ? "flex" : "none";
      };

      mostra("c-ritenuta", r === "occasionale" || r === "ordinario");
      mostra("c-rivalsa", calc.conPartitaIva());
      mostra("c-iva", r === "ordinario");
      mostra("c-bollo", r === "forf5" || r === "forf15" || r === "occasionale");

      const note = {
        occasionale: "Compenso soggetto a ritenuta del 20% versata dal committente. Fuori campo IVA. Marca da bollo € 2,00 se superiore a € 77,47. Oltre € 5.000 lordi/anno scatta l'iscrizione alla Gestione Separata INPS.",
        forf5: "Nessuna IVA e nessuna ritenuta d'acconto. Aliquota agevolata al 5% per i primi cinque anni di attività. Bollo da € 2,00 sui documenti oltre € 77,47.",
        forf15: "Nessuna IVA e nessuna ritenuta d'acconto. Imposta sostitutiva al 15%. Bollo da € 2,00 sui documenti oltre € 77,47.",
        ordinario: "IVA in fattura e ritenuta del 20% quando il committente è sostituto d'imposta (imprese, professionisti, enti). Verso privati la ritenuta non si applica: metti No.",
        nessuno: "Nessuna imposta calcolata: il totale coincide con l'imponibile. Utile per bozze e stime interne."
      };
      const nEl = document.getElementById("nota-regime");
      if(nEl) nEl.textContent = note[r] || "";

      calc.calcola();
    },

    aggiornaPannelloTotali(prefisso, t, scontoTxt){
      const setTxt = (suf, val) => {
        const el = document.getElementById(prefisso + suf);
        if(el) el.textContent = val;
      };
      const setVis = (suf, vis) => {
        const el = document.getElementById(prefisso + suf);
        if(el) el.style.display = vis ? "flex" : "none";
      };

      setTxt("t-imp", window.euro(t.imponibile));
      setTxt("t-sconto", "− " + window.euro(t.sconto));
      setTxt("t-sconto-txt", scontoTxt || "Sconto");
      setVis("r-sconto", t.sconto > 0);

      const labelRiv = (t.rivPerc === 2 ? "Contributo cassa " : "Rivalsa INPS ") + t.rivPerc + "%";
      setTxt("t-riv-txt", labelRiv);
      setTxt("t-riv", window.euro(t.rivalsa));
      setVis("r-riv", t.rivPerc > 0);

      setTxt("t-iva-txt", "IVA " + t.ivaPerc + "%");
      setTxt("t-iva", window.euro(t.iva));
      setVis("r-iva", t.ivaPerc > 0);
      setVis("r-bollo", t.bollo > 0);

      setTxt("t-rit-txt", "Ritenuta d'acconto " + t.ritPerc + "%");
      setTxt("t-rit", "− " + window.euro(t.ritenuta));
      setVis("r-rit", t.ritenuta > 0);

      if(document.getElementById(prefisso + "t-doc")){
        setTxt("t-doc", window.euro(t.totaleDoc));
        setVis("r-doc", t.rivalsa > 0 || t.iva > 0 || t.bollo > 0);
      }
      setTxt("t-netto", window.euro(t.netto));
    },

    calcola(){
      // Calcolo righe voci
      document.querySelectorAll("#corpo-voci tr").forEach(tr => {
        const inputs = tr.querySelectorAll("input");
        if(inputs.length >= 3){
          const qta = parseFloat(inputs[1].value) || 0;
          const pr = parseFloat(inputs[2].value) || 0;
          const cella = tr.querySelector(".tot-cella");
          if(cella) cella.textContent = window.euro(qta * pr);
        }
      });

      const t = calc.totali();
      const scontoTxt = window.val ? window.val("sconto_txt") : "";

      // 1. Box totali in fondo all'editor
      calc.aggiornaPannelloTotali("", t, scontoTxt);

      // 2. Box totali nella sidebar live
      calc.aggiornaPannelloTotali("sb-", t, scontoTxt);

      // 2b. Box totale nella barra mobile rapida
      const mobNetto = document.getElementById("mob-t-netto");
      if(mobNetto) mobNetto.textContent = window.euro(t.netto);

      // 3. Etichetta del secondo pulsante (Proforma vs Nota)
      const labelSecondo = calc.conPartitaIva() ? "Proforma" : "Nota di prestazione";
      const bSec = document.getElementById("btn-secondo");
      if(bSec) bSec.textContent = labelSecondo;

      // 4. Stima dinamica pagine A4
      const totVoci = document.querySelectorAll("#corpo-voci tr").length;
      const badgeStima = document.getElementById("badge-stima-pagine");
      if(badgeStima){
        if(totVoci <= 5){
          badgeStima.innerHTML = "📄 Stima: <b>2 Pagine A4</b>";
          badgeStima.className = "badge-stima-pagine p2";
          badgeStima.title = "Fino a 5 voci: preventivo ottimizzato su 2 pagine pulite.";
        } else {
          badgeStima.innerHTML = "📄 Stima: <b>3 Pagine A4</b>";
          badgeStima.className = "badge-stima-pagine p3";
          badgeStima.title = "Più di 5 voci: tabella suddivisa su Pagina 1 e 2, allegato a Pagina 3.";
        }
      }
    }
  };

  // Registrazione nel namespace centrale App
  if(window.App){
    window.App.calc = calc;
  }

  // Global Facade
  window.regimeAttivo = calc.regimeAttivo;
  window.conPartitaIva = calc.conPartitaIva;
  window.totali = calc.totali;
  window.totaliPreventivo = calc.totaliPreventivo;
  window.cambiaRegime = calc.cambiaRegime;
  window.calcola = calc.calcola;

})(window);
