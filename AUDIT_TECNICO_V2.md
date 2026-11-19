# Audit Tecnico Repository — Compilatore Preventivi (Pre-Refactoring v2.0)

---

## 1. STACK & STRUTTURA FILE

### Stack effettivo vs boilerplate inutilizzato
- **Runtime reale**: **100% Vanilla JavaScript (ES6+)** organizzato in script classici/IIFE su `window`, **HTML5** e **CSS puro** (con custom properties e tema `data-tema="dark"`). Nessun bundler JS, nessun TypeScript a runtime, nessun framework UI.
- **Dipendenze esterne (CDN)**: Firebase SDK **v10.12.0 compat** (`firebase-app-compat.js`, `firebase-auth-compat.js`, `firebase-firestore-compat.js`) caricato da `gstatic.com`.
- **Asset incorporati**: Font `DM Sans` e `Inter` inlined in Base64 dentro `src/css/fonts.css` (**~1,49 MB**); logo SVG e firma autografa PNG in Base64 dentro `src/js/config.js` (**~121 KB**).
- **Build & Test reali**:
  - `build.py` (Python 3): legge `src/index.html` e inietta inline i 4 CSS e 15 file JS producendo due file HTML monolitici identici da **~1,94 MB**: `public/index.html` (Firebase Hosting) e `Compilatore-preventivi.html` (standalone offline).
  - `test.cjs` (Node.js): suite di 90 asserzioni su regex/unit-test statici (in parte con funzioni mockate, non importa i moduli reali).
  - `firebase.json`: hosting statico su `public/` + deploy di `firestore.rules`.
- **Boilerplate morto/inutilizzato**: `package.json` installa `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `motion`, `@google/genai`, `express`, `better-sqlite3`, `tsx`, `typescript` (`bun.lock`, `vite.config.ts`, `tsconfig.json`, `src/App.tsx`, `src/main.tsx`, `src/index.css`). L'app reale non usa nessuno di questi pacchetti; Vite funge oggi solo da dev server statico che serve `/index.html` e `public/`.

### Albero completo dei file e ruolo
- `/index.html` (687 righe): entry point servito in dev da Vite; quasi identico a `src/index.html`, ma **disallineato** (contiene il pulsante dev `#btn-login-dev`).
- `/Compilatore-preventivi.html` (~1,94 MB): build standalone monolitica generata da `build.py`.
- `/build.py`: script Python che inlinea CSS e JS da `src/` in `public/index.html` e `Compilatore-preventivi.html`.
- `/firebase.json` & `/firestore.rules` (300 righe): config Firebase Hosting e regole di sicurezza/validazione Firestore.
- `/test.cjs`: script Node di smoke/regression test (90 check).
- `/package.json`, `/bun.lock`, `/tsconfig.json`, `/vite.config.ts`, `/metadata.json`: configurazione ambiente Vite/TypeScript/AI Studio (dipendenze React/Tailwind/Express non utilizzate dal runtime).
- `/DOCUMENTAZIONE_APP_E_FUNZIONAMENTO.md` (+ copie obsolete in `/app/applet/DOCUMENTAZIONE_APP_E_FUNZIONAMENTO.md` e `/app/applet/README.md`): documentazione legacy.
- `/src/App.tsx`, `/src/main.tsx`, `/src/index.css`: stub React/Tailwind vuoti/non caricati.
- `/src/index.html` (684 righe): template sorgente usato da `build.py` (carica `/src/css/*` e `/js/*`).
- `/src/assets/firma_federico_coletta.png` & `logo_federico_coletta.svg`: sorgenti originali di firma e logo (poi duplicati in Base64 in `config.js`).
- `/src/css/fonts.css` (58 righe, 1,49 MB): `@font-face` Base64 di DM Sans e Inter.
- `/src/css/main.css` (2.614 righe): layout app, sidebar, tabelle, modali, breakpoint tablet/mobile.
- `/src/css/dark-mode.css` (993 righe): override completi per `[data-tema="dark"]` e reset stampa.
- `/src/css/print.css` (882 righe): foglio di stile editoriale A4 (`@page` + `@media print`) per preventivo, nota/proforma e listino.
- `/src/js/core.js` (102 righe): namespace `window.App`, bridge reattivi globali, banner crash `onerror`/`unhandledrejection`.
- `/src/js/validator.js` (219 righe): validazione/sanificazione input (`sanificaPreventivo`, regex P.IVA/CF/email/ISO).
- `/src/js/config.js` (81 righe): costanti `IO`, `LOGO_NAVBAR`, `LOGO_STAMPA`, `FIRMA_IMG`, `PACCHETTI`, `CONDIZIONI_STD`, `INCLUSO_STD`, `ESCLUSO_STD`, `LISTINO_STD` (`[]`).
- `/src/js/helpers.js` (133 righe): formattatori (`euro`, `dataIt`, `esc`, `aIsoLocale`), `val`/`set`, toast `avviso`, `segnaModificato`, dropdown `Strumenti`.
- `/src/js/calculations.js` (209 righe): motore fiscale, totali live (sidebar + mobile), stima pagine A4.
- `/src/js/storage-safety.js` (389 righe): wrapper `localStorage` (`archivio`, `cestino`, `salvaBozza`), import/export JSON, `verificaPreventivo`, modale custom `modaleSicurezza`, eliminazione/annullamento.
- `/src/js/clients.js` (537 righe): modulo CRM clienti (`fc_clienti`), KPI clienti, modale CRUD, sync da archivio preventivi.
- `/src/js/firebase-auth.js` (293 righe): Auth Google Firebase, whitelist singola email, gate overlay + `MutationObserver` anti-tamper.
- `/src/js/firebase-sync.js` (833 righe): sincronizzazione Firestore real-time (`onSnapshot`), autosave debounce 1,2s, migrazione v4, batch delete/status.
- `/src/js/editor.js` (631 righe): righe dinamiche (voci con stepper e drag&drop, opzioni, condizioni), rubrica datalist, Undo/Redo, scrollspy, email accompagnamento (non esposta in UI).
- `/src/js/price-list.js` (261 righe): CRUD listino interno (`fc_listino_v1`), tendina editor, stampa PDF listino.
- `/src/js/print-engine.js` (396 righe): generatori HTML per stampa preventivo, nota di prestazione/proforma e stampa da archivio.
- `/src/js/archive.js` (789 righe): dashboard KPI, filtri/ordinamento, vista cronologica vs raggruppata per cliente, azioni bulk e cestino.
- `/src/js/theme.js` (52 righe): toggle tema chiaro/scuro (`fc_tema`).
- `/src/js/app.js` (401 righe): bootstrap app, `raccogli()`, `carica()`, `nuovo()`, `salvaVerificato()`, `duplica()`, routing `vista()`, scorciatoie tastiera.
- `/src/js/google-drive.js` (419 righe): **modulo orfano/non caricato** (integrazione Google Drive + export `html2pdf` con layer testo).
- `/public/index.html`, `/public/css/*`, `/public/js/*`, `/public/assets/*`: copia speculare per Firebase Hosting + **14 screenshot temporanei** in `public/assets/aistudio/`.

---

## 2. ARCHITETTURA & GESTIONE STATO

- **Stato di lavoro nel DOM (DOM-as-Source-of-Truth)**: durante la compilazione non esiste uno store reattivo; il preventivo in modifica vive direttamente nei `value` degli `<input>`, `<select>`, `<textarea>` e nelle righe `<tr>`/`<div>` di `#corpo-voci`, `#corpo-opzioni`, `#corpo-condizioni`. Ogni salvataggio, calcolo, autosave, verifica, undo o stampa esegue uno scraping completo del DOM tramite `raccogli()` (`app.js`).
- **Globali ibridi + Facade `window.App`**: `core.js` definisce `window.App.state` (`currentId`, `isDirty`, `selectedArchiveIds`, `archiveSort`, `activeStatusFilter`, `archiveViewMode`, `openClientGroups`) ed espone proprietà bridge su `window` via `Object.defineProperty` (`window.corrente`, `window.modificatoNonSalvato`, ecc.). Tutte le funzioni sono esposte globalmente su `window` per essere richiamate da handler HTML inline (`onclick="..."`, `oninput="..."`, `onchange="..."`).
- **Cache in-memory decentralizzate**: ogni modulo mantiene la propria cache parallela sopra `localStorage`: `_archivioCache` (`storage-safety.js`), `_clientiCache` (`clients.js`), `_listinoCache` (`price-list.js`), `_ultimoHashSalvato` (`firebase-sync.js`), `editorHistory.stack` (max 25 snapshot JSON completi in `editor.js`).
- **Accoppiamento forte (UI / Calcolo / Persistenza mescolati)**:
  - `calculations.js` legge direttamente dal DOM (`val("regime")`, `#corpo-voci tr`), calcola i numeri e muta direttamente il DOM di righe, sidebar, badge pagine e barra mobile.
  - `storage-safety.js` unisce persistenza `localStorage`, validazione di business (`verificaPreventivo`), rendering di `<dialog>` HTML + iniezione dinamica di `<style>` e `window.confirm`/`window.alert`/`window.prompt`.
  - `archive.js` e `clients.js` generano grandi blocchi HTML tramite template string con `innerHTML` e handler inline serializzati (`JSON.stringify(ids)` dentro `onchange`).

---

## 3. DATABASE & PERSISTENZA

### Stack attuale
- **Database primario Cloud**: **Firebase Firestore** (progetto `preventivi-federico-coletta`) con persistenza offline IndexedDB (`enablePersistence({ synchronizeTabs: true })`).
- **Autenticazione**: Firebase Auth (Google Sign-In) bloccato a un singolo account hardcoded (`fedecoletta@gmail.com`) sia lato client (`firebase-auth.js`) sia nelle `firestore.rules` (eccetto modalità locale `file://` o `localhost`).
- **Mirror locale (`localStorage`)**:
  - `fc_preventivi_v1` (array JSON di preventivi attivi + cestinati con flag `cestinato`)
  - `fc_clienti` (array JSON anagrafica CRM)
  - `fc_listino_v1` (array JSON listino prezzi)
  - `fc_dati_personali_v1` (oggetto `io` + `regime`)
  - `fcpreventivi_bozza_recupero_v1` (bozza crash recovery)
  - `fcpreventivi_cestino_v1` (chiave cestino legacy)
  - `fcpreventivi_ultimo_backup_v1`, `fc_migrated_v4_cloud`, `fc_tema`, `fc_firma_autografa`, `fc_archivio_vista`, `fc_pref_mostra_scorciatoie`.

### Schema Firestore (validato da `firestore.rules`)
1. **`/preventivi/{preventivoId}`** (28 campi whitelisted):
   - Metadati: `id`, `numero`, `data`, `validita`, `stato` (`bozza|inviato|accettato|rifiutato|annullato`), `totale` (number), `modificato` (ISO), `cestinato` (bool), `eliminatoIl` (string|null), `annullamento` (map|null), `driveFileId/driveFileUrl/driveSavedAt`.
   - Contenuto: `cliente` (map denormalizzata `{nome, ref, indirizzo, piva, email, tel}`), `progetto` (map `{titolo, tipo, luogo, giornate, consegna, saluto, intro}`), `voci` (array max 200 di `{nome, desc, q, p}`), `opzioni` (array di `{nome, desc, p}`), `incluso` (array string), `escluso` (array string), `condizioni` (convertito in `[{titolo, testo}]` su Firestore perché Firestore vieta array annidati, riconvertito in `[titolo, testo]` al caricamento), `io` (snapshot dati prestatore).
   - Fiscalità: `sconto`, `sconto_txt`, `regime`, `ritenuta`, `rivalsa`, `iva`, `bollo`.
2. **`/clienti/{clienteId}`** (13 campi):
   - `id`, `nome`, `ref`, `indirizzo`, `piva`, `cf`, `sdi`, `pec`, `email`, `tel`, `note`, `creato`, `modificato`.
3. **`/listino/{voceId}`** (10 campi):
   - `id`, `cat`, `nome`, `desc`, `unita`, `prezzo`, `ordine`, `attivo`, `creato`, `modificato`.
4. **`/config/{configId}`** (doc `impostazioni`):
   - `data` (map `io` + `regime`), `items`, `modificato`, `version`, `tipo`.

### Relazioni, problemi di sincronizzazione e colli di bottiglia
- **Nessuna relazione per Foreign Key (`clienteId`)**: `/preventivi` incorpora uno snapshot del cliente e il collegamento con `/clienti` avviene a runtime confrontando `nome` normalizzato o `piva`. Inoltre il CRM ha `cf`, `sdi`, `pec`, `note`, che **non esistono** nel form editor del preventivo (vengono persi o fusi in `cl_piva`/`cl_email`).
- **Caricamento full-collection senza paginazione**: `onSnapshot` scarica tutti i documenti di `/preventivi`, `/clienti` e `/listino` in memoria ad ogni avvio/update.
- **Scritture Firestore ridondanti e non debounced**:
  - Nel listino (`price-list.js`), ogni singolo `input` (ogni tasto premuto) invoca `salvaVoceListinoCloud(voce)` senza debounce.
  - `salvaVerificato()` scrive su `localStorage` e richiama `FirebaseSync.salvaImmediato(true)`, che ri-esegue `raccogli()` e riscrive l'intero documento.
  - Su `beforeunload`, `eseguiSalvataggioImmediato(false)` lancia una Promise async non garantita alla chiusura del tab.
- **Bug di sincronizzazione attivi**:
  - Listener `clienti` in `firebase-sync.js`: aggiorna la cache locale solo `if (clienti.length > 0)`; eliminando l'ultimo cliente, la cache locale non si svuota mai.
  - Conflitto cestino legacy vs cloud: `mostraCestino()` in `storage-safety.js` scrive ancora su `fcpreventivi_cestino_v1` invece di aggiornare `cestinato: false` su `fc_preventivi_v1`/Firestore.
  - La rubrica autocompletamento editor (`aggiornaRubrica()` in `editor.js`) legge solo da `archivio()` e **ignora** la collezione `/clienti`.

---

## 4. MOTORE DI CALCOLO & LOGICA DI BUSINESS

- **Calcolo fiscale e totali** (`src/js/calculations.js` → `calcola()` e `datiCalcolo()`):
  - **Regimi supportati**: `occasionale`, `forf5` (Forfettario 5%), `forf15` (Forfettario 15%), `ordinario` (IVA), `nessuno`.
  - **Formule**:
    - `imponibile = Σ (q × p)` (righe in `#corpo-voci`).
    - `base = max(0, imponibile - sconto)` — **solo sconto fisso in €** (nessuno sconto percentuale reale nell'app; la `%` esiste solo in un mock dentro `test.cjs`).
    - `rivalsa = base × rivPerc / 100` (`0%`, `2%` cassa, `4%` Gestione Separata INPS — attiva solo con P.IVA).
    - `imponibileIva = base + rivalsa`.
    - `iva = imponibileIva × ivaPerc / 100` (`0%`, `10%`, `22%` — solo `ordinario`).
    - `bollo = 2 €` automatico se regime ∈ `{forf5, forf15, occasionale}`, `bollo !== "no"` e `imponibileIva > 77,47 €`.
    - `baseRitenuta = (rivPerc === 2 ? base : base + rivalsa)`; `ritenuta = baseRitenuta × ritPerc / 100` (`0%` o `20%`, solo `occasionale` o `ordinario`).
    - `totaleDoc = imponibileIva + iva + bollo`; `netto = totaleDoc - ritenuta`.
  - **Nota su `totale` archiviato**: `raccogli()` salva `totale = calc.netto` (usato poi nei KPI di `archive.js` e `clients.js`).
  - **Tranche di pagamento**: **nessun calcolo automatico** (acconto 30% / saldo 70% è solo testo statico modificabile in `CONDIZIONI_STD`).
- **Numerazione progressiva** (`src/js/app.js` → `prossimoNumero()`):
  - Formato `FC_{ANNO}_{NN}` (es. `FC_2026_01`), calcolato cercando il massimo suffisso numerico in `archivio()` (solo preventivi **attivi**; spostare nel cestino l'ultimo preventivo provoca il riutilizzo del numero e successivo blocco in ripristino).
- **Scadenza validità** (`src/js/app.js` → `aggiornaValidita()`): somma automatica `+30 giorni` alla data documento.
- **Validazione & controlli pre-stampa/salvataggio** (`src/js/storage-safety.js` → `verificaPreventivo()`, `src/js/validator.js`):
  - Controlli su 3 livelli (Errori bloccanti: numero mancante, duplicato, data/validità incoerenti, totale ≤ 0; Avvisi: sconto > imponibile, voci a prezzo 0, dati fiscali mancanti; Suggerimenti: cliente/progetto/intro/condizioni).
- **Stima ingombro A4** (`src/js/print-engine.js` → `stimaIngombroStampa()` + `calculations.js`): stima euristica in punti (base + righe + righe descrizione + opzioni + condizioni) per aggiornare il badge live `1 / 2 / 3+ Pagine A4` e decidere se applicare `.doc-p2-break` in stampa.
- **Calcolo duplicato nei KPI Clienti** (`src/js/clients.js` → `calcolaTotalePreventivo()`): fallback grezzo `Σ(q × p)` che ignora sconti/tasse se `p.totale` manca.

---

## 5. MOTORE DI ESPORTAZIONE PDF / STAMPA

- **Meccanismo attivo**: stampa nativa del browser via **`window.print()`** (`src/js/print-engine.js` + `src/css/print.css`).
  - Al click su *Stampa PDF* (`stampaPreventivo()`), *Nota di prestazione / Proforma* (`stampaSecondo()`), *Stampa da Archivio* (`stampaPreventivoArchivio(id)`) o *Stampa Listino* (`stampaListino()`), il JS genera una stringa HTML completa, la inietta nel contenitore nascosto `#stampa`, imposta `document.title = nomeFileDocumento(...)` (ripristinato su evento `afterprint`) e invoca `window.print()`.
  - `@media print` nasconde `#app`, mostra `#stampa` e applica `@page { size: A4; margin: 18mm 20mm; }` con `print-color-adjust: exact`, `thead { display: table-header-group; }`, `break-inside: avoid` su righe, totali, clausole e blocco firme.
- **Motore orfano non collegato**: `src/js/google-drive.js` implementa una pipeline alternativa (`html2pdf` + `html2canvas` + `jsPDF` con layer testo invisibile ISO 32000 `3 Tr`), ma il file **non è importato** né in `index.html` né in `build.py` e `html2pdf.js` non è presente nel progetto.
- **Limiti e criticità attuali (Desktop & Mobile)**:
  - **Dipendenza dal dialogo di stampa OS/Browser**: l'utente deve selezionare manualmente *"Salva come PDF"* e disattivare intestazioni/piè di pagina del browser; impossibile generare un Blob PDF direttamente in JS (es. per invio email, archiviazione su Storage/Drive o download 1-click).
  - **Nessuna anteprima live A4 in-app**: per verificare l'impaginazione reale l'utente deve aprire ogni volta il dialogo di stampa.
  - **Inconsistenze Mobile / iOS Safari / iPadOS**: `window.print()` su iOS/Android ha supporto parziale per `@page` margins, `print-color-adjust` e `break-inside: avoid`; il nome file da `document.title` viene spesso ignorato su mobile; `afterprint` su alcuni browser mobile può non scattare correttamente.
  - **Nessun numero di pagina nativo ("Pagina X di Y")** nel footer stampato (CSS `@page` margin boxes non uniformemente supportati cross-browser).

---

## 6. UI / UX & PULSANTI ATTUALI

### Viste principali (4 tab + Auth Gate)
1. **Auth Gate (`#auth-gate-overlay`)**: card di login full-screen con `Accedi con Google` (`#btn-login-google`) (+ `#btn-login-dev` presente solo in `/index.html` root).
2. **Editor Preventivo (`#vista-editor`)**: layout a 2 colonne (Form + Sidebar Sticky riepilogo/azioni).
3. **Archivio & Dashboard (`#vista-archivio`)**: 4 KPI card cliccabili, barra filtri/vista/ricerca, bulk-action bar, banner cestino, tabella cronologica o accordion per cliente.
4. **Listino Interno (`#vista-listino`)**: tabella editabile inline per categoria, voce/descrizione, unità, prezzo.
5. **Anagrafica Clienti (`#vista-clienti`)**: 3 KPI card, ricerca, tabella clienti + modale CRUD con storico preventivi collegati.

### Censimento completo di pulsanti e controlli
- **Topbar globale (`header.barra`)**:
  - Tab navigazione: `Preventivo`, `Archivio`, `Listino`, `Clienti` (con badge numerico).
  - Profilo utente: avatar, label email, pulsante `Esci`.
  - Sync Cloud: `#btn-cloud-sync` (*Salvato nel Cloud* — click forza salvataggio immediato).
  - Dropdown `⚙️ Strumenti`: `📥 Importa JSON (Preventivo / Backup)`, `💾 Esporta Backup Completo (.json)`, `🔄 Sincronizza Clienti da Archivio`.
  - Toggle tema: `🌙 Dark` / `☀️ Light`.
- **Editor — Barra rapida sticky (`.nav-sezioni-rapida`)**:
  - 4 anchor jump-link (`Documento & Cliente`, `Specifiche Progetto`, `Voci & Compensi`, `Condizioni & Firme`).
  - History: `↶ Annulla` (`#btn-undo`), `↷ Ripristina` (`#btn-redo`).
- **Editor — Sezioni form**:
  - *Documento*: Numero, Data, Valido fino al.
  - *Cliente*: Ragione sociale (con `<datalist>`), Referente, Indirizzo, P.IVA/C.F., Email, Telefono + pulsante contestuale `Cambia versione...` (quando esistono duplicati in archivio).
  - *Progetto*: Titolo, Tipologia, Location, Giornate, Consegna, Apertura lettera, Introduzione.
  - *Voci di preventivo*: per ogni riga: maniglia drag (`⠿`), input Nome, textarea Descrizione, stepper Q.tà (`−` / input / `+`), stepper Prezzo (`−` / input / `+`), totale riga, `⧉ Duplica`, `× Elimina`. Sotto la tabella: select `+ Aggiungi dal listino…`, `+ Riga vuota`, `Pacchetto documentario`, `Pacchetto spot`, `Giornata camera department`. Poi Sconto (€), Dicitura sconto, Box Regime fiscale (`Come fatturi`, `Ritenuta d'acconto`, `Rivalsa INPS`, `IVA`, `Marca da bollo`).
  - *Cosa comprende*: textarea `Incluso` e `Non incluso`.
  - *Opzioni su richiesta*: righe riordinabili (`⠿`, Nome, Descrizione, Prezzo, `×`) + `+ Opzione`.
  - *Condizioni*: righe riordinabili (`⠿`, Titolo, Testo, `×`) + `+ Condizione` + `Ripristina le standard`.
  - *Dati prestatore*: Codice fiscale, Partita IVA, IBAN, Indirizzo.
- **Editor — Sidebar sticky (`.editor-sidebar-col`)**:
  - Badge `Stima: X Pagine A4`.
  - 4 pillole stato (`⚪ Bozza`, `🟡 Inviato`, `🟢 Accettato`, `🔴 Rifiutato`).
  - Box Riepilogo Live (Imponibile, Sconto, Rivalsa, IVA, Bollo, Ritenuta, Totale).
  - Azioni principali: `💾 Salva nell'archivio` (`Ctrl+S`), `🖨️ Stampa PDF` (`Ctrl+P`).
  - Opzioni documento: `Nota di prestazione` / `Fattura proforma` (dinamico per regime), checkbox `Firma autografa`.
  - Gestione: `+ Nuovo`, `🔍 Verifica`, `🗑️ Sposta nel cestino` / `Annulla preventivo` (solo su doc salvati).
  - Stato salvataggio footer + `<details>` collassabile `⌨️ Scorciatoie veloci`.
- **Archivio (`#vista-archivio`)**:
  - 4 KPI card cliccabili (Accettati, Inviati, Bozze, Totale).
  - 6 pillole filtro (`Tutti`, `Inviati`, `Accettati`, `Bozze`, `Rifiutati`, `Cestino`).
  - Switcher vista: `📋 Cronologica` / `👥 Per cliente` (+ `Espandi tutti` / `Comprimi tutti`).
  - Ricerca `#filtro` + pulsante `✕` clear + `+ Nuovo preventivo`.
  - Barra bulk (contestuale alla selezione): cambio stato multiplo (4 bottoni), `Sposta nel cestino (N)`, `Deseleziona` (oppure in Cestino: `Ripristina selezionati`, `Elimina definitivamente`).
  - Banner Cestino: `🧹 Svuota cestino`, `← Torna all'Archivio`.
  - Header colonne ordinabili + checkbox master; per ogni riga attiva: `🖨️ Stampa PDF`, `Apri`, `Duplica`, `🗑️`; per ogni riga cestino: `↩️ Ripristina`, `🗑️ Elimina`.
- **Listino (`#vista-listino`)**:
  - Ricerca `#filtro-listino`, `+ Nuova voce`, `Stampa / PDF`, e per riga: input Categoria/Voce/Descrizione/Unità/Prezzo + `×` elimina.
- **Clienti (`#vista-clienti`)**:
  - Ricerca `#cerca-cliente`, `+ Nuovo Cliente`, `🔄 Aggiorna dai Preventivi`; per riga: `➕ Prev`, `✏️`, `🗑️`, click su nome/badge apre modale cliente (`➕ Nuovo Preventivo per questo Cliente`, `Salva Modifiche`, `Annulla`, `Apri` su preventivi collegati).
- **Scorciatoie tastiera globali**: `Ctrl/Cmd+S` (Salva), `Ctrl/Cmd+P` (Stampa PDF), `Alt+N` (+ Nuova voce), `Ctrl/Cmd+Z` (Undo), `Ctrl/Cmd+Y` / `Ctrl/Cmd+Shift+Z` (Redo), `Alt+↑/↓` (riordina opzioni/condizioni).

### Comportamento Desktop vs Tablet/iPad vs Mobile
- **Desktop (`> 1260px`)**: topbar estesa con 4 tab, editor 2 colonne (`1fr` + sidebar `320px+`), tabelle standard.
- **Tablet / iPad (`769px – 1260px`)**: progressiva compressione su 4 media query sovrapposte (`1260px`, `1120px`, `960px`, `920px`): sparisce `.brand-pill`, poi email utente e label Undo/Redo (`≤1120px`), poi testo dei pulsanti Cloud/Strumenti/Tema (`≤960px`); sotto `920px` la sidebar passa a colonna singola sotto il form.
- **Mobile (`≤ 768px`)**:
  - Nasconde i tab in topbar e attiva una **Bottom Navigation Bar** fissa (`#mobile-bottom-nav` con 4 tab).
  - Nasconde la sidebar nell'editor e mostra una **Floating Quick Bar** (`#mobile-editor-bar`) con pillola stato, totale live, `⚡ Azioni` e `💾 Salva`, collegata a due **Bottom Sheet** (`#mob-status-sheet` e `#mob-actions-sheet`).
  - Forza `font-size: 16px !important` su tutti gli input per evitare l'auto-zoom di iOS.
  - **Gap UX su mobile**: nella bottom sheet azioni mancano `Firma autografa`, `Sposta nel cestino` e Undo/Redo; il drag&drop HTML5 (`draggable`) su voci/opzioni/condizioni non funziona nativamente su touch iOS/Android.

---

## 7. DEBITO TECNICO & CRITICITÀ

1. **Duplicazione strutturale e build fragile**:
   - Coesistono 3 copie dei sorgenti/entry point (`/` root `index.html`, `/src/*`, `/public/*`, più `/Compilatore-preventivi.html` e cartella orfana `/app/applet/`). `/index.html` e `/src/index.html` sono già divergenti (`#btn-login-dev`).
   - `package.json` trascina dipendenze React/Tailwind/Express/SQLite/Gemini inutilizzate mentre il build vero dipende da uno script Python (`build.py`) con lista file JS hardcoded.
   - `public/assets/aistudio/` contiene 14 immagini di debug esposte pubblicamente al prossimo deploy Firebase Hosting.
2. **File monolitici e responsabilità mescolate**:
   - `main.css` (2.614 righe) + `dark-mode.css` (993 righe) + `print.css` (882 righe) = **4.489 righe di CSS non strutturato** con numerosi `!important` e media query frammentate.
   - `firebase-sync.js` (833 righe), `archive.js` (789 righe), `editor.js` (631 righe), `clients.js` (537 righe) mescolano logica di stato, chiamate DB e costruzione HTML via stringhe.
   - Configurazione Firebase hardcoded e duplicata identica in due file (`firebase-auth.js` e `firebase-sync.js`); versionamento incoerente (`2.1.0` nei commenti/`core.js` vs `4.0 Cloud` in UI/`package.json`).
3. **Codice morto / feature rotte o scollegate**:
   - `src/js/google-drive.js` (419 righe) non è incluso nel build ma viene ancora copiato in `public/js/`.
   - `mostraEmailAccompagnamento()` (`editor.js`) esiste ma non ha alcun pulsante nell'UI.
   - `mostraCestino()` (`storage-safety.js`) opera ancora sulla vecchia chiave `localStorage` `fcpreventivi_cestino_v1` invece del cestino cloud v4.
   - `test.cjs` testa una funzione `calcolaTest()` locale fittizia che non corrisponde al vero `calculations.js` (es. sconto `%`).
4. **Bug di usabilità e integrità dati**:
   - **Undo/Redo distruttivo (`editor.js` + `app.js`)**: `Ctrl+Z` intercetta globalmente qualsiasi input di testo nell'editor e chiama `carica(state)` (ricostruzione totale DOM), distruggendo lo storico nativo del campo e perdendo focus/cursore.
   - **Perdita modifiche silenziosa**: `vista()` resetta `window.modificatoNonSalvato = false` all'ingresso e usa `modaleSicurezza`, mentre `apri()`/`duplica()` usano `window.confirm()` (bloccato in alcuni iframe/PWA).
   - **Dati cliente disallineati**: `cf`, `sdi`, `pec` del CRM vengono persi o concatenati in `cl_piva`/`cl_email` creando un preventivo; nessuna chiave esterna `clienteId` lega preventivi e clienti.
   - **Race condition & rischio perdita dati**: `beforeunload` non può attendere Firestore async; `salvaVoceListinoCloud` spara una write Firestore per ogni singolo tasto digitato; eliminazione dell'ultimo cliente non aggiorna la cache da `onSnapshot`.
   - **Numerazione non atomica**: `prossimoNumero()` ignora i cestinati e non usa contatori transazionali su Firestore (rischio collisione multi-dispositivo).
5. **Sicurezza & Superficie XSS**:
   - Massiccio uso di `innerHTML` con template literal; sebbene `esc()` venga usato spesso, in alcuni punti (`archive.js` ID non escapati negli `onclick="apri('${p.id}')"`, `JSON.stringify(ids)` in attributi HTML, `msgAvviso`, `impostaStatoSalvataggio(..., true)`) eventuali caratteri speciali o payload importati via JSON possono rompere il markup o introdurre XSS DOM-based.
   - Single-tenant hardcoded: l'email `fedecoletta@gmail.com` è cablata sia nel codice client sia in `firestore.rules` (impossibile estendere a multi-utente/team senza riprogettare lo schema per `uid`/workspace).
   - Payload iniziale pesante: **~1,94 MB** di HTML monolitico non cachabile per singoli asset (1,49 MB sono font TTF Base64 caricati ad ogni apertura).
