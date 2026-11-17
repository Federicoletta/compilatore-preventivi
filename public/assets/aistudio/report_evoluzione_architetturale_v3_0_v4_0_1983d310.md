# Report di Evoluzione Architetturale: Compilatore Preventivi (v3.0 → v4.0 Cloud-First)

**Progetto:** Compilatore Preventivi — Federico Coletta  
**Ambiente di Produzione:** Firebase Hosting (`https://preventivi-federico-coletta.web.app`)  
**Stato Migrazione:** Completata (Struttura verificata su commit `c7d8c19e`)

---

## 1. Sintesi della Trasformazione

Il progetto è stato trasformato da un'applicazione **ibrida desktop/locale** (nata per essere eseguita tramite doppio clic su un file HTML monolitico via protocollo `file://` e salvataggi su `localStorage`) a una **Web App Cloud-First moderna**, sincronizzata in tempo reale su **Google Firebase Firestore** e **Google Drive**.

### Confronto Diretto: Prima vs. Dopo

| Dimensione | Versione Precedente (v3.0 Local-First) | Versione Attuale (v4.0 Cloud-First) |
| :--- | :--- | :--- |
| **Modalità di Esecuzione** | File monolitico `Compilatore-preventivi.html` aperto in locale (`file://`) + copia web. | Web App pura su **Firebase Hosting** (`public/index.html`) con accesso protetto via Google Auth. |
| **Sincronizzazione Database** | Chiamate REST manuali via `fetch`, serializzazione custom (`_toFirestore` / `_fromFirestore`) e rinnovo manuale del token ogni 45 minuti. | **Firebase Firestore SDK nativo** con listener real-time (`onSnapshot`) e gestione automatica dell'autenticazione. |
| **Persistenza & Salvataggio** | Salvataggio manuale su `localStorage` con 15 snapshot completi dell'archivio (`CHIAVECRONOLOGIA`) a rischio esaurimento memoria (limite 5 MB). | **Auto-Save istantaneo stile Google Docs** con persistenza offline nativa su IndexedDB e coda di sincronizzazione automatica. |
| **Gestione File & Cartelle** | Dipendenza da File System Access API (`disk-sync.js`) per scrivere JSON in una cartella locale del PC (solo Chromium desktop). | Rimozione totale di `disk-sync.js`: dati allineati istantaneamente su qualsiasi dispositivo (PC, Mac, iPad, smartphone). |
| **Gestione Cestino** | Archivio separato in `localStorage` (`CHIAVECESTINO`), disallineato dal database cloud (causava il ripristino indesiderato al refresh). | **Soft-delete unificato su Firestore** tramite flag booleano `cestinato: true` direttamente sul documento. |
| **Esportazione PDF & Drive** | Metadati Drive sovrascritti al salvataggio successivo; dati emittente letti dal DOM dell'editor; possibile pagina bianca extra in `html2pdf`. | Preservazione dei metadati Drive nello stato, lettura dati direttamente dal preventivo selezionato e impaginazione A4 calibrata. |
| **Interfaccia Utente** | Pulsanti di importazione ed esportazione backup JSON esposti nella barra superiore. | Header snellito con azioni di backup e utilità raggruppate in un menu dedicato. |

---

## 2. Verifica Strutturale sul Nuovo Codice

Dall'analisi della struttura e dei metadati dell'archivio aggiornato (`compilatore-preventivi-main`), risultano confermati i seguenti interventi:

### File Rimossi (Pulizia Codice Obsoleto)
* **`Compilatore-preventivi.html` (Rimosso):** Eliminato il vecchio file monolitico dalla root del repository; `build.py` ora compila esclusivamente `public/index.html` per il deploy su Firebase Hosting.
* **`src/js/disk-sync.js` (Rimosso):** Eliminata completamente la logica di sincronizzazione su cartelle fisiche del PC e il relativo database IndexedDB (`fc_preventivi_sync_db`).

### Moduli Aggiornati
* **Infrastruttura & Build:** `.gitignore`, `build.py`, `firestore.rules`, `test.js`, `src/index.html`, `public/index.html`.
* **Core, Stato & Persistenza:** `src/js/core.js`, `src/js/validator.js`, `src/js/storage-safety.js`, `src/js/firebase-auth.js`, `src/js/firebase-sync.js`.
* **Logica Applicativa & UI:** `src/js/app.js`, `src/js/archive.js`, `src/js/clients.js`, `src/js/editor.js`, `src/js/helpers.js`.
* **Stampa, PDF & Stili:** `src/js/print-engine.js`, `src/js/google-drive.js`, `src/css/main.css`, `src/css/dark-mode.css`, `src/css/print.css`.

### Moduli Preservati Integralmente (Zero Regressioni)
* **`src/js/calculations.js`:** Motore di calcolo fiscale (regimi Occasionale, Forfettario 5%/15%, Ordinario, ritenuta d'acconto, rivalsa INPS 4%, contributo 2% e marca da bollo € 2,00) rimasto intatto.
* **`src/js/config.js`, `src/js/price-list.js`, `src/js/theme.js`, `src/css/fonts.css` e `src/assets/*`:** Costanti anagrafiche, listino interno, gestione temi e asset grafici (logo SVG e firma autografa PNG) preservati senza alterazioni.

---

## 3. Note Post-Migrazione Consigliate

1. **Aggiornamento Documentazione (`README.md` e `DOCUMENTAZIONE_APP_E_FUNZIONAMENTO.md`):**  
   Questi due file risultano ancora nella versione precedente (v3.0) e descrivono ancora `Compilatore-preventivi.html`, `disk-sync.js` e i 14 moduli locali. Conviene aggiornarli affinché riflettano la nuova architettura Cloud-First v4.0.
2. **Deploy delle Regole Firestore:**  
   Assicurati di aver eseguito `firebase deploy --only firestore:rules,hosting` in modo che le nuove regole su `cestinato`, `eliminatoIl`, `annullato` e `annullamento` siano attive in produzione.