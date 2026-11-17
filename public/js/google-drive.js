/**
 * Compilatore Preventivi — Modulo Google Drive (v3.0 Pro)
 * Gestione salvataggio ed archiviazione automatica dei PDF nella cartella dedicata Google Drive.
 */
(function(window) {
  "use strict";

  const GDRIVE_FOLDER_ID = "1F5m8TD08yubxf_Rpuk-T_-_74SVzX76V";
  const SCOPE_DRIVE = "https://www.googleapis.com/auth/drive.file";

  let _caricamentoInCorso = false;

  function mostraOverlayCaricamento(testo) {
    let overlay = document.getElementById("gdrive-loading-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "gdrive-loading-overlay";
      overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(8,11,16,0.85);backdrop-filter:blur(6px);z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:system-ui,-apple-system,sans-serif;";
      overlay.innerHTML = `
        <div style="font-size:44px;margin-bottom:14px">⏳</div>
        <h3 id="gdrive-loading-txt" style="margin:0 0 8px;font-size:18px;font-weight:600;color:#fff">Preparazione in corso...</h3>
        <p style="margin:0;font-size:13.5px;color:#94A3B8">Generazione e archiviazione del preventivo...</p>
      `;
      document.body.appendChild(overlay);
    }
    const txt = document.getElementById("gdrive-loading-txt");
    if (txt && testo) txt.textContent = testo;
    overlay.style.display = "flex";
  }

  function nascondiOverlayCaricamento() {
    const overlay = document.getElementById("gdrive-loading-overlay");
    if (overlay) overlay.style.display = "none";
  }

  function caricaScriptHtml2Pdf() {
    return new Promise((resolve, reject) => {
      if (typeof window.html2pdf !== "undefined") {
        return resolve(window.html2pdf);
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => resolve(window.html2pdf);
      script.onerror = () => reject(new Error("Impossibile caricare il generatore PDF da internet."));
      document.head.appendChild(script);
    });
  }

  async function ottieniTokenGoogleDrive() {
    let token = sessionStorage.getItem("gdrive_access_token");
    const time = parseInt(sessionStorage.getItem("gdrive_token_time") || "0", 10);

    // Valido per 50 minuti (la scadenza standard Google è 60 min)
    if (token && (Date.now() - time < 50 * 60 * 1000)) {
      return token;
    }

    if (typeof firebase === "undefined" || !firebase.auth) {
      throw new Error("Autenticazione Firebase non inizializzata.");
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope(SCOPE_DRIVE);
    provider.setCustomParameters({ prompt: "select_account" });

    const user = firebase.auth().currentUser;
    let res;
    try {
      if (user && typeof user.reauthenticateWithPopup === "function") {
        res = await user.reauthenticateWithPopup(provider);
      } else {
        res = await firebase.auth().signInWithPopup(provider);
      }
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        throw new Error("Autorizzazione Google Drive annullata dall'utente.");
      }
      res = await firebase.auth().signInWithPopup(provider);
    }

    if (res && res.credential && res.credential.accessToken) {
      token = res.credential.accessToken;
      sessionStorage.setItem("gdrive_access_token", token);
      sessionStorage.setItem("gdrive_token_time", Date.now().toString());
      return token;
    }

    throw new Error("Nessun token di autorizzazione ricevuto da Google.");
  }

  async function generaPdfBlob(p, tipoDoc = "preventivo") {
    await caricaScriptHtml2Pdf();

    if (!p) p = (typeof window.raccogli === "function" ? window.raccogli() : {});
    const t = typeof window.totaliPreventivo === "function" ? window.totaliPreventivo(p) : (typeof window.totali === "function" ? window.totali() : {});

    let html = "";
    let nomeFile = "";
    const isNota = (tipoDoc === "nota" || tipoDoc === "proforma");

    if (isNota) {
      if (typeof window.generaHtmlSecondoDocumento !== "function") {
        throw new Error("Funzione generaHtmlSecondoDocumento non disponibile nel modulo stampa.");
      }
      html = window.generaHtmlSecondoDocumento(p, t);
      const reg = p.regime || (typeof regimeAttivo === "function" ? regimeAttivo() : "occasionale");
      const pIva = ["forf5", "forf15", "ordinario"].includes(reg);
      const tipo = pIva ? "Proforma" : "NotaPrestazione";
      nomeFile = (typeof window.nomeFileDocumento === "function"
        ? window.nomeFileDocumento(tipo, p)
        : `FC_${tipo}_${p.numero || "documento"}.pdf`);
    } else {
      if (typeof window.generaHtmlPaginePreventivo !== "function") {
        throw new Error("Funzione generaHtmlPaginePreventivo non disponibile nel modulo stampa.");
      }
      html = window.generaHtmlPaginePreventivo(p, t);
      nomeFile = (typeof window.nomeFileDocumento === "function" 
        ? window.nomeFileDocumento("Preventivo", p) 
        : `FC_preventivo_${p.numero || "documento"}.pdf`);
    }

    const stampaEl = document.getElementById("stampa");
    if (!stampaEl) throw new Error("Elemento container #stampa non trovato.");

    window.scrollTo(0, 0);
    stampaEl.innerHTML = html;
    stampaEl.classList.add("rendering-pdf");

    const opt = {
      margin: [0, 0, 0, 0],
      filename: nomeFile,
      image: { type: 'jpeg', quality: 0.98 },
      enableLinks: true,
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#ffffff",
        windowWidth: 794,
        letterRendering: true, 
        logging: false,
        scrollY: 0,
        scrollX: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      const worker = window.html2pdf().set(opt).from(stampaEl).toPdf();

      // Inietta il layer di testo invisibile ma selezionabile (ISO 32000 PDF text rendering mode 3 Tr)
      await worker.get('pdf').then(function(pdf) {
        const pages = stampaEl.querySelectorAll('.foglio-stampa');
        pages.forEach((pageEl, pageIdx) => {
          const pageNum = pageIdx + 1;
          if (pageNum <= pdf.internal.getNumberOfPages()) {
            pdf.setPage(pageNum);
          }
          const pageRect = pageEl.getBoundingClientRect();
          const walker = document.createTreeWalker(pageEl, NodeFilter.SHOW_TEXT, null, false);
          let n;
          while ((n = walker.nextNode())) {
            const txt = n.textContent.trim();
            if (!txt || txt.length < 2) continue;
            const parent = n.parentElement;
            if (!parent) continue;
            const rect = parent.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const leftMm = (rect.left - pageRect.left) * (210 / pageRect.width);
              const topMm = (rect.top - pageRect.top) * (297 / pageRect.height);
              const fontSizePt = (parseFloat(window.getComputedStyle(parent).fontSize) || 12) * 0.75;
              try {
                pdf.setFontSize(fontSizePt);
                pdf.internal.write('3 Tr'); // Modalità testo selezionabile ma visivamente trasparente
                pdf.text(txt, leftMm, topMm + (rect.height * (297 / pageRect.height) * 0.75));
              } catch (e) {}
            }
          }
          pdf.internal.write('0 Tr');
        });
      });

      let pdfBlob;
      if (typeof worker.output === "function") {
        pdfBlob = await worker.output("blob");
      } else if (typeof worker.outputPdf === "function") {
        pdfBlob = await worker.outputPdf("blob");
      } else {
        const pdf = await worker.toPdf().get("pdf");
        pdfBlob = pdf.output("blob");
      }
      return { blob: pdfBlob, nomeFile };
    } finally {
      stampaEl.classList.remove("rendering-pdf");
      stampaEl.innerHTML = "";
    }
  }

  async function caricaSuGoogleDriveApi(pdfBlob, nomeFile, folderId, accessToken) {
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      name: nomeFile,
      mimeType: "application/pdf",
      parents: [folderId || GDRIVE_FOLDER_ID]
    };

    const multipartRequestBody = new Blob([
      delimiter,
      "Content-Type: application/json; charset=UTF-8\r\n\r\n",
      JSON.stringify(metadata),
      delimiter,
      "Content-Type: application/pdf\r\n\r\n",
      pdfBlob,
      close_delim
    ], { type: `multipart/related; boundary=${boundary}` });

    const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = `Errore HTTP ${res.status}`;
      try {
        const errObj = JSON.parse(errText);
        if (errObj.error && errObj.error.message) {
          errMsg = errObj.error.message;
        }
      } catch (e) {}
      throw new Error(errMsg);
    }

    return await res.json();
  }

  function impostaStatoPulsanteDrive(testo, disabilitato) {
    const btn = document.getElementById("btn-salva-gdrive");
    const badge = document.getElementById("gdrive-status-badge");
    if (!btn) return;
    btn.disabled = !!disabilitato;
    if (testo) {
      btn.querySelector("span:first-child").textContent = testo;
    }
    if (badge && disabilitato) {
      badge.textContent = "⏳";
    }
  }

  async function salvaPreventivo(p, tipoDoc = "preventivo") {
    if (_caricamentoInCorso) return;
    _caricamentoInCorso = true;

    try {
      mostraOverlayCaricamento("📄 Generazione PDF in corso...");
      impostaStatoPulsanteDrive("📁 Preparazione PDF...", true);
      const { blob, nomeFile } = await generaPdfBlob(p, tipoDoc);

      mostraOverlayCaricamento("🔑 Accesso a Google Drive...");
      impostaStatoPulsanteDrive("🔑 Accesso Drive...", true);
      const accessToken = await ottieniTokenGoogleDrive();

      mostraOverlayCaricamento("☁️ Caricamento del PDF su Google Drive...");
      impostaStatoPulsanteDrive("☁️ Caricamento in Drive...", true);
      const file = await caricaSuGoogleDriveApi(blob, nomeFile, GDRIVE_FOLDER_ID, accessToken);

      // Aggiorna dati del preventivo con il link e l'ID del file Drive
      p.driveFileId = file.id;
      p.driveUrl = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;
      p.driveSavedAt = new Date().toISOString();
      if (typeof window.setDriveMeta === "function") {
        window.setDriveMeta(p);
      }

      // Salva nell'archivio locale e sincronizza su Cloud Firestore
      if (typeof window.salvaVerificato === "function") {
        window.salvaVerificato();
      }
      if (window.FirebaseSync && typeof window.FirebaseSync.sincronizzaPreventivo === "function") {
        window.FirebaseSync.sincronizzaPreventivo(p);
      }
      if (typeof window.disegnaArchivio === "function") {
        window.disegnaArchivio();
      }

      impostaStatoPulsanteDrive("✅ Salvato su Drive", false);
      const badge = document.getElementById("gdrive-status-badge");
      if (badge) badge.textContent = "Salvato";

      nascondiOverlayCaricamento();
      mostraSuccessoDrive(file, p);

    } catch (err) {
      nascondiOverlayCaricamento();
      console.error("[GoogleDrive] Errore salvataggio:", err);
      impostaStatoPulsanteDrive("📁 Salva su Google Drive", false);

      if (err.message && (err.message.includes("Google Drive API has not been used") || err.message.includes("it is disabled"))) {
        mostraModaleAbilitazioneDrive();
      } else {
        alert("Impossibile salvare su Google Drive:\n" + err.message);
      }
    } finally {
      _caricamentoInCorso = false;
      nascondiOverlayCaricamento();
    }
  }

  function mostraSuccessoDrive(file, p) {
    const url = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;
    const box = document.createElement("div");
    box.className = "modale-overlay";
    box.innerHTML = `
      <div class="modale-card" style="max-width:480px;text-align:center;padding:28px 24px">
        <div style="font-size:44px;margin-bottom:12px">📁✨</div>
        <h3 style="margin:0 0 8px;font-size:18px;color:var(--ink)">PDF Salvato su Google Drive!</h3>
        <p style="margin:0 0 16px;font-size:14px;color:var(--ink-soft);line-height:1.5">
          Il preventivo <strong>${p.numero || ""}</strong> è stato caricato con successo nella tua cartella dedicata su Google Drive.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px">
          <a href="${url}" target="_blank" class="btn pieno" style="padding:10px 18px;text-decoration:none">
            🔗 Apri su Google Drive
          </a>
          <button type="button" class="btn chiaro" onclick="this.closest('.modale-overlay').remove()">
            Chiudi
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(box);
  }

  function mostraModaleAbilitazioneDrive() {
    const box = document.createElement("div");
    box.className = "modale-overlay";
    box.innerHTML = `
      <div class="modale-card" style="max-width:520px;text-align:center;padding:28px 24px">
        <div style="font-size:40px;margin-bottom:12px">⚙️ Google Drive API</div>
        <h3 style="margin:0 0 10px;font-size:18px;color:var(--ink)">Abilitazione API richiesta</h3>
        <p style="margin:0 0 16px;font-size:13.5px;color:var(--ink-soft);line-height:1.55;text-align:left">
          Per permettere all'applicazione di salvare i PDF nella tua cartella Google Drive, devi abilitare la <strong>Google Drive API</strong> sul tuo progetto Google Cloud:
        </p>
        <div style="background:var(--bg-card);border:1px solid var(--linea);padding:14px;border-radius:8px;margin-bottom:20px;text-align:left;font-size:13px">
          1. Clicca sul pulsante sottostante per aprire la console Google Cloud.<br>
          2. Clicca sul pulsante blu <strong>"Abilita"</strong> (Enable).<br>
          3. Torna qui e premi di nuovo su <em>Salva su Google Drive</em>.
        </div>
        <div style="display:flex;gap:10px;justify-content:center">
          <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com?project=preventivi-federico-coletta" target="_blank" class="btn pieno" style="text-decoration:none">
            👉 Abilita Google Drive API
          </a>
          <button type="button" class="btn chiaro" onclick="this.closest('.modale-overlay').remove()">
            Ho già abilitato / Chiudi
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(box);
  }

  async function salvaSuDriveCorrente() {
    if (typeof window.salva === "function") {
      window.salva();
    }
    const p = typeof window.raccogli === "function" ? window.raccogli() : null;
    if (!p) {
      alert("Nessun preventivo aperto da salvare.");
      return;
    }
    await salvaPreventivo(p);
  }

  async function salvaPreventivoDaArchivio(id, tipoDoc = "preventivo") {
    if (typeof window.archivio !== "function") return;
    const p = window.archivio().find(x => x.id === id);
    if (!p) {
      alert("Preventivo non trovato nell'archivio.");
      return;
    }
    await salvaPreventivo(p, tipoDoc);
  }

  async function scaricaPdfLocale(p, tipoDoc = "preventivo") {
    if (!p && typeof window.raccogli === "function") p = window.raccogli();
    try {
      mostraOverlayCaricamento("📄 Preparazione download PDF...");
      const { blob, nomeFile } = await generaPdfBlob(p, tipoDoc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nomeFile;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      alert("Errore generazione PDF: " + e.message);
    } finally {
      nascondiOverlayCaricamento();
    }
  }

  window.GoogleDriveModule = {
    folderId: GDRIVE_FOLDER_ID,
    salvaSuDriveCorrente,
    salvaPreventivoDaArchivio,
    scaricaPdfLocale,
    generaPdfBlob
  };

})(window);
