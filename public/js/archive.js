/**
 * Compilatore Preventivi - Modulo Gestione Archivio, Dashboard & Cestino (v2.1.0)
 * Gestione filtri, ricerca rapida, raggruppamento per cliente, KPI e operazioni batch.
 */
(function(window){
  "use strict";

  // Riferimenti di stato (sincronizzati con App.state tramite getter/setter globali)
  // filtroStatoAttivo, vistaArchivioModo, gruppiClientiAperti, selezionatiArchivio, ordinamentoArchivio

  let gruppiClientiInizializzati = false;

  function impostaVistaArchivio(modo) {
    window.vistaArchivioModo = modo;
    try {
      localStorage.setItem("fc_archivio_vista", modo);
    } catch(e) {}
    disegnaArchivio();
  }

  function toggleGruppoCliente(nomeClienteEncoded) {
    const nomeCliente = decodeURIComponent(nomeClienteEncoded);
    if (window.gruppiClientiAperti.has(nomeCliente)) {
      window.gruppiClientiAperti.delete(nomeCliente);
    } else {
      window.gruppiClientiAperti.add(nomeCliente);
    }
    disegnaArchivio();
  }

  function espandiTuttiClienti() {
    const tutti = archivio();
    tutti.forEach(p => {
      const nome = (p.cliente?.nome || "").trim() || "Cliente non specificato";
      window.gruppiClientiAperti.add(nome);
    });
    gruppiClientiInizializzati = true;
    disegnaArchivio();
  }

  function comprimiTuttiClienti() {
    window.gruppiClientiAperti.clear();
    gruppiClientiInizializzati = true;
    disegnaArchivio();
  }

  function impostaFiltroStatoRapido(stato) {
    window.filtroStatoAttivo = stato;
    const sel = document.getElementById("filtro-stato");
    if(sel) sel.value = stato;
    window.selezionatiArchivio.clear();
    disegnaArchivio();
  }

  function pulisciRicerca() {
    const f = document.getElementById("filtro");
    if(f) f.value = "";
    const b = document.getElementById("btn-clear-search");
    if(b) b.style.display = "none";
    disegnaArchivio();
  }

  function alternaOrdinamento(campo) {
    if(window.ordinamentoArchivio.campo === campo) {
      window.ordinamentoArchivio.desc = !window.ordinamentoArchivio.desc;
    } else {
      window.ordinamentoArchivio.campo = campo;
      window.ordinamentoArchivio.desc = (campo === "data" || campo === "totale");
    }
    disegnaArchivio();
  }

  function toggleSelezioneTutti(selezionaTutti, idsVisibili) {
    if(selezionaTutti) {
      idsVisibili.forEach(id => window.selezionatiArchivio.add(id));
    } else {
      idsVisibili.forEach(id => window.selezionatiArchivio.delete(id));
    }
    aggiornaBarraAzioniGruppo();
    disegnaArchivio();
  }

  function toggleSelezioneSingola(id, checkEl) {
    if(checkEl.checked) window.selezionatiArchivio.add(id);
    else window.selezionatiArchivio.delete(id);
    aggiornaBarraAzioniGruppo();
    const tr = checkEl.closest("tr");
    if(tr) tr.classList.toggle("selezionata", checkEl.checked);
    const master = document.getElementById("check-select-all");
    if(master) {
      const allRowChecks = document.querySelectorAll(".check-row-item");
      const countChecked = document.querySelectorAll(".check-row-item:checked").length;
      master.checked = allRowChecks.length > 0 && countChecked === allRowChecks.length;
      master.indeterminate = countChecked > 0 && countChecked < allRowChecks.length;
    }
  }

  function aggiornaBarraAzioniGruppo() {
    const bar = document.getElementById("archivio-bulk-bar");
    const cntEl = document.getElementById("bulk-selected-count");
    const lblEl = document.getElementById("bulk-selected-label");
    const actCont = document.getElementById("bulk-actions-container");
    if(!bar || !cntEl || !actCont) return;

    const n = window.selezionatiArchivio.size;
    if(n === 0) {
      bar.style.display = "none";
      return;
    }
    bar.style.display = "flex";
    cntEl.textContent = n;
    lblEl.textContent = n === 1 ? "preventivo selezionato" : "preventivi selezionati";

    if(window.filtroStatoAttivo === "cestino") {
      actCont.innerHTML = `
        <button type="button" class="btn mini pieno" onclick="ripristinaSelezionatiDalCestino()">
          ↩️ Ripristina selezionati (${n})
        </button>
        <button type="button" class="btn mini pericolo" onclick="eliminaDefinitivoSelezionatiCestino()">
          🗑️ Elimina definitivamente (${n})
        </button>
        <button type="button" class="btn mini" onclick="deselezionaTutti()">
          ✕ Deseleziona
        </button>
      `;
    } else {
      actCont.innerHTML = `
        <div class="bulk-dropdown-wrap">
          <span style="font-size:12px;color:rgba(255,255,255,0.7);margin-right:6px">Cambia stato:</span>
          <button type="button" class="btn mini" onclick="cambiaStatoMultiplo('bozza')">⚪ Bozza</button>
          <button type="button" class="btn mini" onclick="cambiaStatoMultiplo('inviato')">🟡 Inviato</button>
          <button type="button" class="btn mini" onclick="cambiaStatoMultiplo('accettato')">🟢 Accettato</button>
          <button type="button" class="btn mini" onclick="cambiaStatoMultiplo('rifiutato')">🔴 Rifiutato</button>
        </div>
        <button type="button" class="btn mini pericolo" onclick="spostaSelezionatiNelCestino()">
          🗑️ Sposta nel cestino (${n})
        </button>
        <button type="button" class="btn mini" onclick="deselezionaTutti()">
          ✕ Deseleziona
        </button>
      `;
    }
  }

  function deselezionaTutti() {
    window.selezionatiArchivio.clear();
    aggiornaBarraAzioniGruppo();
    disegnaArchivio();
  }

  /* ================== gestione cestino (singolo e gruppo) ================== */
  function confermaSpostaNelCestino(id) {
    const p = archivio().find(x => x.id === id);
    if (!p) return;
    
    let msgAvviso = "";
    if (["inviato", "accettato"].includes(p.stato)) {
      msgAvviso = `<div class="conferma-warning-box" style="margin:10px 0;padding:10px;background:rgba(196,83,24,0.12);border:1px solid #C45318;border-radius:4px;font-size:12.5px;color:#C45318">
        ⚠️ <b>Attenzione:</b> Questo preventivo è attualmente registrato come <b>${p.stato.toUpperCase()}</b>.
      </div>`;
    }
    
    modaleSicurezza("Sposta nel cestino", `
      <p>Vuoi spostare il preventivo <b>${esc(p.numero || "senza numero")}</b> nel cestino?</p>
      <p style="color:var(--muted);font-size:13px;margin:6px 0">Cliente: <b>${esc(p.cliente?.nome || "Non specificato")}</b> — Progetto: ${esc(p.progetto?.titolo || "—")}</p>
      ${msgAvviso}
      <p style="font-size:12.5px;color:var(--muted);margin-top:12px">Potrai ripristinarlo in qualsiasi momento dalla scheda <b>🗑️ Cestino</b>.</p>
    `, [
      { testo: "Annulla" },
      {
        testo: "🗑️ Sposta nel cestino",
        primario: true,
        classe: "pericolo",
        esegui: () => {
          if (window.FirebaseSync && typeof window.FirebaseSync.spostaNelCestino === "function") {
            window.FirebaseSync.spostaNelCestino(p.id);
          }
          const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).map(x => x.id === p.id ? { ...x, cestinato: true, eliminatoIl: new Date().toISOString(), modificato: new Date().toISOString() } : x);
          salvaArchivio(tutti);
          window.selezionatiArchivio.delete(p.id);
          disegnaArchivio();
          avviso("Preventivo " + (p.numero || "") + " spostato nel cestino");
        }
      }
    ]);
  }

  function spostaSelezionatiNelCestino() {
    const ids = Array.from(window.selezionatiArchivio);
    if (!ids.length) return;
    modaleSicurezza("Sposta selezionati nel cestino", `
      <p>Vuoi spostare i <b>${ids.length}</b> preventivi selezionati nel cestino?</p>
      <p style="font-size:12.5px;color:var(--muted);margin-top:10px">Potrai consultarli e ripristinarli quando vuoi dalla sezione Cestino.</p>
    `, [
      { testo: "Annulla" },
      {
        testo: "🗑️ Sposta nel cestino (" + ids.length + ")",
        primario: true,
        classe: "pericolo",
        esegui: () => {
          if (window.FirebaseSync && typeof window.FirebaseSync.spostaMultipliNelCestino === "function") {
            window.FirebaseSync.spostaMultipliNelCestino(ids);
          }
          const now = new Date().toISOString();
          const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).map(x => ids.includes(x.id) ? { ...x, cestinato: true, eliminatoIl: now, modificato: now } : x);
          salvaArchivio(tutti);
          window.selezionatiArchivio.clear();
          disegnaArchivio();
          avviso(ids.length + " preventivi spostati nel cestino.");
        }
      }
    ]);
  }

  function ripristinaDaCestino(idCestino) {
    const item = cestino().find(x => x.id === idCestino);
    if (!item) return;
    const p = item.preventivo;
    const a = archivio();
    if (a.some(x => x.id === p.id || normalizzaNumero(x.numero) === normalizzaNumero(p.numero))) {
      alert("Ripristino bloccato: un preventivo con lo stesso numero o ID è già presente nell'archivio attivo. Modifica il documento in conflitto prima di ripristinare.");
      return;
    }
    if (window.FirebaseSync && typeof window.FirebaseSync.ripristinaDaCestino === "function") {
      window.FirebaseSync.ripristinaDaCestino(idCestino);
    }
    const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).map(x => x.id === idCestino ? { ...x, cestinato: false, eliminatoIl: null, modificato: new Date().toISOString() } : x);
    salvaArchivio(tutti);
    window.selezionatiArchivio.delete(idCestino);
    disegnaArchivio();
    avviso("Preventivo " + (p.numero || "") + " ripristinato con successo!");
  }

  function ripristinaSelezionatiDalCestino() {
    const ids = Array.from(window.selezionatiArchivio);
    if (!ids.length) return;
    const c = cestino();
    const daRipristinare = c.filter(x => ids.includes(x.id));
    const a = archivio();
    
    const conflitti = daRipristinare.filter(x => a.some(p => p.id === x.preventivo.id || normalizzaNumero(p.numero) === normalizzaNumero(x.preventivo.numero)));
    if (conflitti.length > 0) {
      alert("Impossibile ripristinare: " + conflitti.length + " preventivo/i hanno numeri o ID già presenti nell'archivio attivo.");
      return;
    }
    
    if (window.FirebaseSync && typeof window.FirebaseSync.ripristinaMultipliDaCestino === "function") {
      window.FirebaseSync.ripristinaMultipliDaCestino(ids);
    }
    const now = new Date().toISOString();
    const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).map(x => ids.includes(x.id) ? { ...x, cestinato: false, eliminatoIl: null, modificato: now } : x);
    salvaArchivio(tutti);
    window.selezionatiArchivio.clear();
    disegnaArchivio();
    avviso(daRipristinare.length + " preventivi ripristinati nell'archivio!");
  }

  function eliminaDefinitivoCestino(idCestino) {
    const item = cestino().find(x => x.id === idCestino);
    if (!item) return;
    modaleSicurezza("Eliminazione Definitiva", `
      <p>Sei sicuro di voler eliminare <b>definitivamente</b> il preventivo <b>${esc(item.preventivo.numero)}</b> (${esc(item.preventivo.cliente?.nome || "")})?</p>
      <p style="color:#C45318;font-size:13px;margin-top:10px">⚠️ Questa operazione è irreversibile: il documento verrà rimosso per sempre dal cloud e da questo dispositivo.</p>
    `, [
      { testo: "Annulla" },
      {
        testo: "🗑️ Elimina per sempre",
        primario: true,
        classe: "pericolo",
        esegui: () => {
          if (window.FirebaseSync && typeof window.FirebaseSync.eliminaDefinitivamente === "function") {
            window.FirebaseSync.eliminaDefinitivamente(item.preventivo.id);
          }
          const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).filter(x => x.id !== item.preventivo.id);
          salvaArchivio(tutti);
          window.selezionatiArchivio.delete(idCestino);
          disegnaArchivio();
          avviso("Preventivo eliminato definitivamente.");
        }
      }
    ]);
  }

  function eliminaDefinitivoSelezionatiCestino() {
    const ids = Array.from(window.selezionatiArchivio);
    if (!ids.length) return;
    modaleSicurezza("Eliminazione Definitiva", `
      <p>Sei sicuro di voler eliminare <b>definitivamente</b> i <b>${ids.length}</b> preventivi selezionati?</p>
      <p style="color:#C45318;font-size:13px;margin-top:10px">⚠️ Questa operazione è irreversibile e cancellerà definitivamente i file.</p>
    `, [
      { testo: "Annulla" },
      {
        testo: "🗑️ Elimina definitivamente (" + ids.length + ")",
        primario: true,
        classe: "pericolo",
        esegui: () => {
          if (window.FirebaseSync && typeof window.FirebaseSync.eliminaDefinitivoMultipli === "function") {
            window.FirebaseSync.eliminaDefinitivoMultipli(ids);
          }
          const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).filter(x => !ids.includes(x.id));
          salvaArchivio(tutti);
          window.selezionatiArchivio.clear();
          disegnaArchivio();
          avviso(ids.length + " preventivi eliminati definitivamente.");
        }
      }
    ]);
  }

  function confermaSvuotaCestino() {
    const n = cestino().length;
    if (!n) { avviso("Il cestino è già vuoto."); return; }
    modaleSicurezza("Svuota Cestino", `
      <p>Sei sicuro di voler svuotare completamente il cestino?</p>
      <p style="color:#C45318;font-size:13px;margin-top:10px">Verranno eliminati definitivamente <b>${n}</b> preventivi. Questa azione non può essere annullata.</p>
    `, [
      { testo: "Annulla" },
      {
        testo: "🧹 Svuota definitivamente (" + n + ")",
        primario: true,
        classe: "pericolo",
        esegui: () => {
          const cestinatiIds = cestino().map(x => x.id);
          if (window.FirebaseSync && typeof window.FirebaseSync.eliminaDefinitivoMultipli === "function") {
            window.FirebaseSync.eliminaDefinitivoMultipli(cestinatiIds);
          }
          const tutti = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).filter(x => !x.cestinato);
          salvaArchivio(tutti);
          window.selezionatiArchivio.clear();
          disegnaArchivio();
          avviso("Cestino svuotato completamente.");
        }
      }
    ]);
  }

  function cambiaStatoMultiplo(nuovoStato) {
    const ids = Array.from(window.selezionatiArchivio);
    if (!ids.length) return;
    if (window.FirebaseSync && typeof window.FirebaseSync.cambiaStatoMultiplo === "function") {
      window.FirebaseSync.cambiaStatoMultiplo(ids, nuovoStato);
    }
    const now = new Date().toISOString();
    const a = (typeof tuttiPreventiviRaw === "function" ? tuttiPreventiviRaw() : archivio()).map(p => {
      if (ids.includes(p.id)) {
        return Object.assign({}, p, { stato: nuovoStato, modificato: now });
      }
      return p;
    });
    salvaArchivio(a);
    window.selezionatiArchivio.clear();
    disegnaArchivio();
    avviso("Stato aggiornato a " + nuovoStato.toUpperCase() + " per " + ids.length + " preventivi");
  }

  /* ================== rendering archivio & dashboard ================== */
  function disegnaArchivio(){
    aggiornaRubrica();
    if(typeof aggiornaBackupInfo === "function") aggiornaBackupInfo();

    const q = (document.getElementById("filtro")?.value || "").trim().toLowerCase();
    const clearBtn = document.getElementById("btn-clear-search");
    if(clearBtn) clearBtn.style.display = q ? "inline-block" : "none";

    const tutti = archivio();
    const cst = cestino();

    // 1. Calcolo KPI globali
    const accettati = tutti.filter(p => p.stato === "accettato");
    const inviati = tutti.filter(p => p.stato === "inviato");
    const bozze = tutti.filter(p => (p.stato || "bozza") === "bozza");
    const rifiutati = tutti.filter(p => p.stato === "rifiutato");

    const totAccettati = accettati.reduce((s, p) => s + (p.totale || 0), 0);
    const totInviati = inviati.reduce((s, p) => s + (p.totale || 0), 0);
    const totGenerale = tutti.reduce((s, p) => s + (p.totale || 0), 0);
    const tassoConv = tutti.length > 0 ? Math.round((accettati.length / tutti.length) * 100) : 0;

    const kpiCntAcc = document.getElementById("kpi-cnt-accettati");
    const kpiValAcc = document.getElementById("kpi-val-accettati");
    if(kpiCntAcc) kpiCntAcc.textContent = accettati.length;
    if(kpiValAcc) kpiValAcc.textContent = euro(totAccettati);

    const kpiCntInv = document.getElementById("kpi-cnt-inviati");
    const kpiValInv = document.getElementById("kpi-val-inviati");
    if(kpiCntInv) kpiCntInv.textContent = inviati.length;
    if(kpiValInv) kpiValInv.textContent = euro(totInviati);

    const kpiCntBoz = document.getElementById("kpi-cnt-bozze");
    const kpiValBoz = document.getElementById("kpi-val-bozze");
    if(kpiCntBoz) kpiCntBoz.textContent = bozze.length;
    if(kpiValBoz) kpiValBoz.textContent = bozze.length + (bozze.length === 1 ? " bozza" : " bozze");

    const kpiCntTot = document.getElementById("kpi-cnt-totale");
    const kpiValTot = document.getElementById("kpi-val-totale");
    const kpiConv = document.getElementById("kpi-conversion");
    if(kpiCntTot) kpiCntTot.textContent = tutti.length;
    if(kpiValTot) kpiValTot.textContent = euro(totGenerale);
    if(kpiConv) kpiConv.textContent = "Tasso di successo: " + tassoConv + "%";

    // Sincronizza controlli visualizzazione (Cronologica / Per Cliente)
    const btnCron = document.getElementById("btn-view-cronologica");
    const btnCli = document.getElementById("btn-view-cliente");
    if(btnCron && btnCli) {
      btnCron.classList.toggle("attiva", window.vistaArchivioModo === "cronologica");
      btnCli.classList.toggle("attiva", window.vistaArchivioModo === "cliente");
    }
    const switcher = document.getElementById("archivio-view-switcher");
    if(switcher) {
      switcher.style.display = (window.filtroStatoAttivo === "cestino") ? "none" : "inline-flex";
    }
    const clientiBar = document.getElementById("archivio-clienti-bar");
    if(clientiBar) {
      clientiBar.style.display = (window.vistaArchivioModo === "cliente" && window.filtroStatoAttivo !== "cestino") ? "flex" : "none";
    }

    // 2. Pillole di stato e filtro
    const pillsCont = document.getElementById("archivio-filtri-pills");
    if(pillsCont) {
      pillsCont.innerHTML = `
        <button type="button" class="arch-pill ${window.filtroStatoAttivo === "" ? "attiva" : ""}" onclick="impostaFiltroStatoRapido('')">
          Tutti <span class="arch-pill-cnt">${tutti.length}</span>
        </button>
        <button type="button" class="arch-pill pill-inviato ${window.filtroStatoAttivo === "inviato" ? "attiva" : ""}" onclick="impostaFiltroStatoRapido('inviato')">
          🟡 Inviati <span class="arch-pill-cnt">${inviati.length}</span>
        </button>
        <button type="button" class="arch-pill pill-accettato ${window.filtroStatoAttivo === "accettato" ? "attiva" : ""}" onclick="impostaFiltroStatoRapido('accettato')">
          🟢 Accettati <span class="arch-pill-cnt">${accettati.length}</span>
        </button>
        <button type="button" class="arch-pill pill-bozza ${window.filtroStatoAttivo === "bozza" ? "attiva" : ""}" onclick="impostaFiltroStatoRapido('bozza')">
          ⚪ Bozze <span class="arch-pill-cnt">${bozze.length}</span>
        </button>
        <button type="button" class="arch-pill pill-rifiutato ${window.filtroStatoAttivo === "rifiutato" ? "attiva" : ""}" onclick="impostaFiltroStatoRapido('rifiutato')">
          🔴 Rifiutati <span class="arch-pill-cnt">${rifiutati.length}</span>
        </button>
        <span class="arch-pill-sep"></span>
        <button type="button" class="arch-pill pill-cestino ${window.filtroStatoAttivo === "cestino" ? "attiva" : ""}" onclick="impostaFiltroStatoRapido('cestino')" title="Visualizza i preventivi eliminati">
          🗑️ Cestino <span class="arch-pill-cnt ${cst.length > 0 ? "has-trash" : ""}">${cst.length}</span>
        </button>
      `;
    }

    // 3. Banner Cestino
    const cestBanner = document.getElementById("cestino-banner");
    if(cestBanner) {
      cestBanner.style.display = (window.filtroStatoAttivo === "cestino") ? "flex" : "none";
      const sub = document.getElementById("cestino-sub-info");
      if(sub) sub.textContent = cst.length + (cst.length === 1 ? " preventivo conservato nel cestino." : " preventivi conservati nel cestino.");
    }

    const box = document.getElementById("lista-archivio");
    const totEl = document.getElementById("totali-archivio");

    // 4. Sezione Cestino
    if(window.filtroStatoAttivo === "cestino") {
      let righeCestino = [...cst];
      if(q) {
        righeCestino = righeCestino.filter(x => {
          const p = x.preventivo || {};
          return ((p.cliente?.nome || "") + " " + (p.numero || "") + " " + (p.progetto?.titolo || "")).toLowerCase().includes(q);
        });
      }
      righeCestino.sort((a, b) => (b.eliminatoIl || "").localeCompare(a.eliminatoIl || ""));

      if(!righeCestino.length) {
        box.innerHTML = `<div class="vuoto"><b>Il cestino è vuoto</b>I preventivi che elimini vengono conservati qui e puoi recuperarli in qualsiasi momento.</div>`;
        if(totEl) totEl.textContent = "";
        aggiornaBarraAzioniGruppo();
        return;
      }

      const idsVisibili = righeCestino.map(x => x.id);
      const tuttiSelezionati = idsVisibili.length > 0 && idsVisibili.every(id => window.selezionatiArchivio.has(id));

      let html = `<table class="arch arch-cestino">
        <thead>
          <tr>
            <th style="width:38px;text-align:center" onclick="event.stopPropagation()">
              <input type="checkbox" id="check-select-all" ${tuttiSelezionati ? "checked" : ""} onchange='toggleSelezioneTutti(this.checked, ${JSON.stringify(idsVisibili)})'>
            </th>
            <th style="width:130px">Numero</th>
            <th style="width:150px">Eliminato il</th>
            <th>Cliente</th>
            <th>Progetto</th>
            <th style="width:110px">Stato orig.</th>
            <th style="text-align:right;width:120px">Netto</th>
            <th style="text-align:right;width:170px">Azioni</th>
          </tr>
        </thead>
        <tbody>`;

      righeCestino.forEach(x => {
        const p = x.preventivo || {};
        const isSel = window.selezionatiArchivio.has(x.id);
        html += `<tr class="${isSel ? "selezionata" : ""}">
          <td style="text-align:center" onclick="event.stopPropagation()">
            <input type="checkbox" class="check-row-item" ${isSel ? "checked" : ""} onchange="toggleSelezioneSingola('${x.id}', this)">
          </td>
          <td class="numero">${esc(p.numero || "—")}</td>
          <td class="col-data" style="white-space:nowrap">${esc(dataOra(x.eliminatoIl))}</td>
          <td><b>${esc(p.cliente?.nome || "—")}</b></td>
          <td class="col-progetto">${esc(p.progetto?.titolo || "—")}</td>
          <td><span class="stato ${esc(p.stato || "bozza")}">${esc(p.stato || "bozza")}</span></td>
          <td class="imp">${euro(p.totale || 0)}</td>
          <td style="text-align:right;white-space:nowrap" onclick="event.stopPropagation()">
            <button type="button" class="btn mini pieno" onclick="ripristinaDaCestino('${x.id}')" title="Ripristina nell'archivio attivo">↩️ Ripristina</button>
            <button type="button" class="btn mini pericolo" onclick="eliminaDefinitivoCestino('${x.id}')" title="Elimina definitivamente">🗑️ Elimina</button>
          </td>
        </tr>`;
      });

      html += `</tbody></table>`;
      box.innerHTML = html;
      if(totEl) totEl.textContent = righeCestino.length + " preventivi nel cestino.";
      aggiornaBarraAzioniGruppo();
      return;
    }

    // 5. Sezione Archivio Attivo
    let a = [...tutti];
    if(q) {
      a = a.filter(p => ((p.cliente?.nome || "") + " " + (p.numero || "") + " " + (p.progetto?.titolo || "")).toLowerCase().includes(q));
    }
    if(window.filtroStatoAttivo) {
      a = a.filter(p => (p.stato || "bozza") === window.filtroStatoAttivo);
    }

    // Ordinamento generale
    const campo = window.ordinamentoArchivio.campo;
    const desc = window.ordinamentoArchivio.desc;
    a.sort((x, y) => {
      let vx, vy;
      if(campo === "totale") { vx = x.totale || 0; vy = y.totale || 0; return desc ? vy - vx : vx - vy; }
      if(campo === "numero") { vx = x.numero || ""; vy = y.numero || ""; }
      else if(campo === "cliente") { vx = x.cliente?.nome || ""; vy = y.cliente?.nome || ""; }
      else if(campo === "stato") { vx = x.stato || "bozza"; vy = y.stato || "bozza"; }
      else { vx = x.data || ""; vy = y.data || ""; }
      return desc ? vy.localeCompare(vx) : vx.localeCompare(vy);
    });

    if(!a.length) {
      box.innerHTML = `<div class="vuoto"><b>Nessun preventivo trovato</b>
        ${q ? "Nessun risultato per la ricerca inserita. Prova a modificare i termini." : "I preventivi che salvi restano su questo computer e li ritrovi qui."}</div>`;
      if(totEl) totEl.textContent = "";
      const clientiBar = document.getElementById("archivio-clienti-bar");
      if(clientiBar) clientiBar.style.display = "none";
      aggiornaBarraAzioniGruppo();
      return;
    }

    // VISTA ACCORPATA PER CLIENTE
    if(window.vistaArchivioModo === "cliente") {
      const gruppiMap = new Map();
      a.forEach(p => {
        const nomeCliente = (p.cliente?.nome || "").trim() || "Cliente non specificato";
        if (!gruppiMap.has(nomeCliente)) {
          gruppiMap.set(nomeCliente, {
            clienteNome: nomeCliente,
            preventivi: [],
            totale: 0,
            stati: { bozza: 0, inviato: 0, accettato: 0, rifiutato: 0 }
          });
        }
        const g = gruppiMap.get(nomeCliente);
        g.preventivi.push(p);
        g.totale += (p.totale || 0);
        const st = p.stato || "bozza";
        g.stati[st] = (g.stati[st] || 0) + 1;
      });

      // Ordinamento alfabetico dei clienti
      const gruppi = Array.from(gruppiMap.values()).sort((g1, g2) => 
        g1.clienteNome.localeCompare(g2.clienteNome, 'it', { sensitivity: 'base' })
      );

      // Se prima volta che si apre la vista cliente, espandi tutti
      if (!gruppiClientiInizializzati) {
        gruppi.forEach(g => window.gruppiClientiAperti.add(g.clienteNome));
        gruppiClientiInizializzati = true;
      }

      // Aggiorna contatori barra clienti
      const acbCliCnt = document.getElementById("acb-clienti-count");
      const acbPrevCnt = document.getElementById("acb-preventivi-count");
      if(acbCliCnt) acbCliCnt.textContent = gruppi.length + (gruppi.length === 1 ? " cliente" : " clienti");
      if(acbPrevCnt) acbPrevCnt.textContent = a.length + (a.length === 1 ? " preventivo" : " preventivi");

      const freccia = (c) => window.ordinamentoArchivio.campo === c ? (window.ordinamentoArchivio.desc ? " ▾" : " ▴") : "";

      let html = `<div class="archivio-gruppi-clienti">`;

      gruppi.forEach(g => {
        g.preventivi.sort((x, y) => {
          let vx, vy;
          if(campo === "totale") { vx = x.totale || 0; vy = y.totale || 0; return desc ? vy - vx : vx - vy; }
          if(campo === "numero") { vx = x.numero || ""; vy = y.numero || ""; }
          else if(campo === "stato") { vx = x.stato || "bozza"; vy = y.stato || "bozza"; }
          else { vx = x.data || ""; vy = y.data || ""; }
          return desc ? vy.localeCompare(vx) : vx.localeCompare(vy);
        });

        const isAperto = window.gruppiClientiAperti.has(g.clienteNome);
        const idsGruppo = g.preventivi.map(p => p.id);
        const tuttiGruppoSelezionati = idsGruppo.length > 0 && idsGruppo.every(id => window.selezionatiArchivio.has(id));
        const iniziali = (g.clienteNome || "").split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "CL";

        html += `
          <div class="cliente-group-card ${isAperto ? "aperto" : "chiuso"}">
            <div class="cgc-header" onclick="toggleGruppoCliente('${encodeURIComponent(g.clienteNome)}')">
              <div class="cgc-left">
                <div class="cgc-chevron-box" title="${isAperto ? "Comprimi cliente" : "Espandi cliente"}">
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
                <div class="avatar-badge">${esc(iniziali)}</div>
                <span class="cgc-name">${esc(g.clienteNome)}</span>
                <span class="cgc-count-badge">${g.preventivi.length} ${g.preventivi.length === 1 ? "preventivo" : "preventivi"}</span>
              </div>

              <div class="cgc-right">
                <div class="cgc-status-summary">
                  ${g.stati.accettato ? `<span class="cgc-pill pill-accettato" title="Accettati">🟢 ${g.stati.accettato}</span>` : ""}
                  ${g.stati.inviato ? `<span class="cgc-pill pill-inviato" title="Inviati">🟡 ${g.stati.inviato}</span>` : ""}
                  ${g.stati.bozza ? `<span class="cgc-pill pill-bozza" title="Bozze">⚪ ${g.stati.bozza}</span>` : ""}
                  ${g.stati.rifiutato ? `<span class="cgc-pill pill-rifiutato" title="Rifiutati">🔴 ${g.stati.rifiutato}</span>` : ""}
                </div>
                
                <div class="cgc-total-badge" title="Totale preventivi per questo cliente">
                  <span class="cgc-total-lbl">Totale</span>
                  <span class="cgc-total-val">${euro(g.totale)}</span>
                </div>
              </div>
            </div>`;

        if(isAperto) {
          html += `
            <div class="cgc-body">
              <table class="arch arch-cliente-nested">
                <thead>
                  <tr>
                    <th style="width:38px;text-align:center" onclick="event.stopPropagation()">
                      <input type="checkbox" ${tuttiGruppoSelezionati ? "checked" : ""} onchange='toggleSelezioneTutti(this.checked, ${JSON.stringify(idsGruppo)})' title="Seleziona tutti i preventivi di ${esc(g.clienteNome)}">
                    </th>
                    <th class="th-sortable" style="width:130px" onclick="alternaOrdinamento('numero')">Numero${freccia('numero')}</th>
                    <th class="th-sortable" style="width:140px" onclick="alternaOrdinamento('data')">Data${freccia('data')}</th>
                    <th>Progetto</th>
                    <th class="th-sortable" style="width:110px" onclick="alternaOrdinamento('stato')">Stato${freccia('stato')}</th>
                    <th class="th-sortable" style="text-align:right;width:120px" onclick="alternaOrdinamento('totale')">Netto${freccia('totale')}</th>
                    <th style="text-align:right;width:150px">Azioni</th>
                  </tr>
                </thead>
                <tbody>`;

          g.preventivi.forEach(p => {
            const isSel = window.selezionatiArchivio.has(p.id);
            html += `<tr class="${isSel ? "selezionata" : ""}" onclick="apri('${p.id}')">
              <td style="text-align:center" onclick="event.stopPropagation()">
                <input type="checkbox" class="check-row-item" ${isSel ? "checked" : ""} onchange="toggleSelezioneSingola('${p.id}', this)">
              </td>
              <td class="numero">${esc(p.numero || "—")}</td>
              <td class="col-data" style="white-space:nowrap">${esc(dataIt(p.data))}</td>
              <td class="col-progetto">${esc(p.progetto?.titolo || "—")}</td>
              <td><span class="stato ${esc(p.stato || "bozza")}">${esc(p.stato || "bozza")}</span></td>
              <td class="imp">${euro(p.totale || 0)}</td>
              <td style="text-align:right;white-space:nowrap" onclick="event.stopPropagation()">
                ${p.driveUrl ? `<a href="${esc(p.driveUrl)}" target="_blank" class="btn mini" style="color:#0F9D58;border-color:rgba(15,157,88,0.4);text-decoration:none" title="Apri il PDF salvato su Google Drive">📁 Drive</a>` : `<button type="button" class="btn mini" onclick="GoogleDriveModule.salvaPreventivoDaArchivio('${p.id}')" title="Genera il PDF e salvalo in Google Drive">📁 +Drive</button>`}
                <button type="button" class="btn mini" onclick="apri('${p.id}')" title="Apri nell'editor">Apri</button>
                <button type="button" class="btn mini" onclick="duplica('${p.id}')" title="Duplica come nuovo preventivo">Duplica</button>
                <button type="button" class="btn mini pericolo" onclick="confermaSpostaNelCestino('${p.id}')" title="Sposta nel cestino">🗑️</button>
              </td>
            </tr>`;
          });

          html += `</tbody></table></div>`;
        }

        html += `</div>`;
      });

      html += `</div>`;
      box.innerHTML = html;

      const sommaAcc = a.filter(p => p.stato === "accettato").reduce((s, p) => s + (p.totale || 0), 0);
      if(totEl) {
        totEl.textContent = gruppi.length + " clienti con preventivi · " + a.length + " preventivi in elenco · accettati per un netto di " + euro(sommaAcc);
      }

      aggiornaBarraAzioniGruppo();
      return;
    }

    const idsVisibili = a.map(p => p.id);
    const tuttiSelezionati = idsVisibili.length > 0 && idsVisibili.every(id => window.selezionatiArchivio.has(id));
    const freccia = (c) => window.ordinamentoArchivio.campo === c ? (window.ordinamentoArchivio.desc ? " ▾" : " ▴") : "";

    let html = `<table class="arch">
      <thead>
        <tr>
          <th style="width:38px;text-align:center" onclick="event.stopPropagation()">
            <input type="checkbox" id="check-select-all" ${tuttiSelezionati ? "checked" : ""} onchange='toggleSelezioneTutti(this.checked, ${JSON.stringify(idsVisibili)})'>
          </th>
          <th class="th-sortable" style="width:130px" onclick="alternaOrdinamento('numero')">Numero${freccia('numero')}</th>
          <th class="th-sortable" style="width:140px" onclick="alternaOrdinamento('data')">Data${freccia('data')}</th>
          <th class="th-sortable" onclick="alternaOrdinamento('cliente')">Cliente${freccia('cliente')}</th>
          <th>Progetto</th>
          <th class="th-sortable" style="width:110px" onclick="alternaOrdinamento('stato')">Stato${freccia('stato')}</th>
          <th class="th-sortable" style="text-align:right;width:120px" onclick="alternaOrdinamento('totale')">Netto${freccia('totale')}</th>
          <th style="text-align:right;width:150px">Azioni</th>
        </tr>
      </thead>
      <tbody>`;

    a.forEach(p => {
      const isSel = window.selezionatiArchivio.has(p.id);
      html += `<tr class="${isSel ? "selezionata" : ""}" onclick="apri('${p.id}')">
        <td style="text-align:center" onclick="event.stopPropagation()">
          <input type="checkbox" class="check-row-item" ${isSel ? "checked" : ""} onchange="toggleSelezioneSingola('${p.id}', this)">
        </td>
        <td class="numero">${esc(p.numero || "—")}</td>
        <td class="col-data" style="white-space:nowrap">${esc(dataIt(p.data))}</td>
        <td class="col-cliente"><b>${esc(p.cliente?.nome || "—")}</b></td>
        <td class="col-progetto">${esc(p.progetto?.titolo || "—")}</td>
        <td><span class="stato ${esc(p.stato || "bozza")}">${esc(p.stato || "bozza")}</span></td>
        <td class="imp">${euro(p.totale || 0)}</td>
        <td style="text-align:right;white-space:nowrap" onclick="event.stopPropagation()">
          ${p.driveUrl ? `<a href="${esc(p.driveUrl)}" target="_blank" class="btn mini" style="color:#0F9D58;border-color:rgba(15,157,88,0.4);text-decoration:none" title="Apri il PDF salvato su Google Drive">📁 Drive</a>` : `<button type="button" class="btn mini" onclick="GoogleDriveModule.salvaPreventivoDaArchivio('${p.id}')" title="Genera il PDF e salvalo in Google Drive">📁 +Drive</button>`}
          <button type="button" class="btn mini" onclick="apri('${p.id}')" title="Apri nell'editor">Apri</button>
          <button type="button" class="btn mini" onclick="duplica('${p.id}')" title="Duplica come nuovo preventivo">Duplica</button>
          <button type="button" class="btn mini pericolo" onclick="confermaSpostaNelCestino('${p.id}')" title="Sposta nel cestino">🗑️</button>
        </td>
      </tr>`;
    });

    html += `</tbody></table>`;
    box.innerHTML = html;

    const sommaAcc = a.filter(p => p.stato === "accettato").reduce((s, p) => s + (p.totale || 0), 0);
    if(totEl) {
      totEl.textContent = a.length + " preventivi in elenco · accettati per un netto di " + euro(sommaAcc);
    }

    aggiornaBarraAzioniGruppo();
  }

  // Registrazione nel modulo App
  const ArchiveModule = {
    render: disegnaArchivio,
    setViewMode: impostaVistaArchivio,
    toggleGroup: toggleGruppoCliente,
    expandAll: espandiTuttiClienti,
    collapseAll: comprimiTuttiClienti,
    setStatusFilter: impostaFiltroStatoRapido,
    toggleSelectAll: toggleSelezioneTutti,
    toggleSelectOne: toggleSelezioneSingola,
    moveToTrash: spostaSelezionatiNelCestino,
    restoreFromTrash: ripristinaSelezionatiDalCestino,
    emptyTrash: confermaSvuotaCestino,
    changeStatusMultiple: cambiaStatoMultiplo,
    clearSearch: pulisciRicerca,
    sort: alternaOrdinamento
  };

  if(window.App) {
    window.App.archive = ArchiveModule;
  }

  // Esposizione Facade globale per inline handler
  window.impostaVistaArchivio = impostaVistaArchivio;
  window.toggleGruppoCliente = toggleGruppoCliente;
  window.espandiTuttiClienti = espandiTuttiClienti;
  window.comprimiTuttiClienti = comprimiTuttiClienti;
  window.impostaFiltroStatoRapido = impostaFiltroStatoRapido;
  window.pulisciRicerca = pulisciRicerca;
  window.alternaOrdinamento = alternaOrdinamento;
  window.toggleSelezioneTutti = toggleSelezioneTutti;
  window.toggleSelezioneSingola = toggleSelezioneSingola;
  window.aggiornaBarraAzioniGruppo = aggiornaBarraAzioniGruppo;
  window.deselezionaTutti = deselezionaTutti;
  window.confermaSpostaNelCestino = confermaSpostaNelCestino;
  window.spostaSelezionatiNelCestino = spostaSelezionatiNelCestino;
  window.ripristinaDaCestino = ripristinaDaCestino;
  window.ripristinaSelezionatiDalCestino = ripristinaSelezionatiDalCestino;
  window.eliminaDefinitivoCestino = eliminaDefinitivoCestino;
  window.eliminaDefinitivoSelezionatiCestino = eliminaDefinitivoSelezionatiCestino;
  window.confermaSvuotaCestino = confermaSvuotaCestino;
  window.cambiaStatoMultiplo = cambiaStatoMultiplo;
  window.disegnaArchivio = disegnaArchivio;

})(typeof window !== "undefined" ? window : globalThis);
