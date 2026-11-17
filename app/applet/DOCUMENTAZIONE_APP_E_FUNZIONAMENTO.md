# Compilatore Preventivi — Documentazione Completa & Mappa Architetturale
**Sviluppato per:** Federico Coletta — Direttore della Fotografia & Videomaker  
**Versione:** 4.0 Cloud-First ("Cinematic Cloud Pro")  
**Data di riferimento:** Novembre 2026  
**Ambiente di Produzione:** Firebase Hosting (`https://preventivi-federico-coletta.web.app`)  

---

## 1. Che Cos'è l'App e a Cosa Serve

Il **Compilatore Preventivi** è una web application professionale Cloud-First, creata su misura per gestire l'intero ciclo economico e commerciale dell'attività di Federico Coletta nel settore cinematografico, pubblicitario ed editoriale video.

### Obiettivi Primari del Software
1. **Redazione Preventivi Rapida e Flessibile:** Compilazione assistita di documenti formali con voci di ripresa, allestimento luci, noleggio kit camera cinema, post-produzione e diritti di sfruttamento.
2. **Motore di Calcolo Fiscale Certificato:** Calcolo al centesimo di imponibile, sconti su misura, ritenuta d'acconto (20%), rivalsa INPS Gestione Separata (4% o 2%), marca da bollo (€ 2,00 oltre la soglia legale di € 77,47) e gestione di tutti i regimi fiscali italiani (Prestazione Occasionale, Forfettario 5%, Forfettario 15%, Regime Ordinario IVA).
3. **Generazione di Due Tipologie di Documenti in un Clic:**
   - **Preventivo Commerciale Formale:** Presentazione estetica per il committente con lettere di intenti, elenco voci dettagliato, cosa include/esclude il pacchetto, termini di pagamento e condizioni contrattuali legali.
   - **Nota di Prestazione / Fattura Proforma:** Documento contabile formale con codice fiscale, IBAN per il bonifico, rivalse e ritenute per la liquidazione del compenso.
4. **Motore di Impaginazione Tipografica A4 (Print Engine):** Algoritmo di distribuzione che impagina i contenuti su esattamente 2 o 3 pagine A4 senza interruzioni di riga sgradevoli (*anti-orphan guard*) ed esporta in PDF a 300 DPI con firma autografa e logo vettoriale integrati.
5. **Archiviazione Cloud Automatica su Google Drive:** Generazione e caricamento automatico del PDF nella cartella dedicata Google Drive (`1F5m8TD08yubxf_Rpuk-T_-_74SVzX76V`) con preservazione dei metadati (`driveFileId`, `driveUrl`, `driveSavedAt`).
6. **Sincronizzazione Real-Time Cloud Firestore:** Dati sincronizzati in tempo reale tra tutti i dispositivi (desktop, tablet, smartphone) con persistenza offline automatica (IndexedDB) e Auto-Save continuo debounced a 1.2 secondi.
7. **CRM Clienti & Cruscotto Archivio:** Monitoraggio metriche di business (KPI su fatturato incassato, opportunità aperte, tassi di conversione) e raggruppamento preventivi per cliente con badge iniziale e storico immediato.
8. **Accesso Riservato & Sicurezza:** Gate di autenticazione Google integrato su Firebase Auth riservato a `fedecoletta@gmail.com` e regole Firestore rigorose (`firestore.rules`).

---

## 2. Come Funziona l'Architettura: I Livelli del Progetto

Il progetto adotta un'**architettura modulare Cloud-First** orientata alla pulizia dei sorgenti e alla massima affidabilità:

```text
1. Livello Sorgente (src/)
   ├── src/index.html                     (Template semantico)
   ├── src/css/                           (Fogli di stile: fonts, main, dark-mode, print)
   └── src/js/                            (Moduli specializzati: core, calculations, firebase-sync...)
          │
          ▼
2. Pipeline di Build & Test
   ├── test.cjs                           (52 Unit Test in <400ms: sintassi, calcoli fiscali, validator)
   └── build.py                           (Script Python che compila src/ in public/index.html)
          │
          ▼
3. Livello Produzione (Firebase Hosting & Vite)
   └── public/index.html                  (Web app online protetta da Google Auth)
          │
          ▼
4. Archiviazione Cloud & Locale
   ├── Google Firebase Firestore          (Collezioni /preventivi, /clienti, /config con listener onSnapshot)
   ├── Google Drive                       (Archiviazione automatica PDF preventivi via API v3)
   └── IndexedDB / Cache locale           (Persistenza offline atomica con dirty-check)
```

---

## 3. Mappa dei Collegamenti tra i Moduli (`src/js/`)

L'applicazione fa uso di moduli JavaScript specializzati, orchestrati secondo principi di *Clean Architecture*:

| Modulo | Ruolo Principale | Con chi si collega |
| :--- | :--- | :--- |
| **`core.js`** | Inizializza il namespace `window.App`, isola lo stato globale e attiva l'**Error Boundary** (scudo anti-crash con banner di avviso in caso di errori imprevisti). | Collegato con tutti i moduli dell'app. |
| **`validator.js`** | **Schema Guard**: sanifica ogni dato in ingresso, converte testi in numeri validi, impedisce valori `NaN`, valida la struttura dei preventivi e preserva metadati (`driveUrl`, `cestinato`, `eliminatoIl`). | Chiamato da `app.js`, `storage-safety.js`, `firebase-sync.js` ed `editor.js`. |
| **`config.js`** | Contiene i dati anagrafici predefiniti di Federico Coletta (C.F., P.IVA, IBAN, email, ruoli), costanti fiscali, credenziali Firebase, logo SVG e firma autografa PNG base64. | Letto da `calculations.js`, `print-engine.js`, `firebase-auth.js` ed `editor.js`. |
| **`helpers.js`** | Utility pure: formattazione valuta (`euro()`), formattazione date italiane, escape stringhe HTML (`esc()`), selettori DOM rapidi (`val()`, `set()`). | Utilizzato trasversalmente da tutta l'interfaccia. |
| **`calculations.js`** | **Motore Fiscale Certificato**: calcola imponibile, sconti, rivalsa INPS (4% o 2%), ritenuta d'acconto (20%), marca da bollo (€ 2,00 oltre € 77,47) e netto a pagare. | Riceve i dati da `editor.js` e aggiorna in tempo reale la sidebar e la stima pagine A4. |
| **`editor.js`** | Gestisce il modulo del preventivo: tabella voci con riordino Drag & Drop, stepper micro-pulsanti `[−]` e `[+]` su Quantità e Prezzo, duplicazione ed eliminazione righe, pacchetti rapidi (Spot, Docufilm, DoP). | Comunica con `calculations.js`, `app.js` e la cronologia Undo/Redo. |
| **`archive.js`** | Cruscotto dell'Archivio: vista cronologica o raggruppata per cliente, calcolo delle 4 card KPI in tempo reale, filtri rapidi di stato, barra di ricerca istantanea, soft-delete e ripristino dal cestino unificato. | Legge e scrive tramite `storage-safety.js` e `firebase-sync.js`, dialoga con `app.js` per aprire o duplicare preventivi. |
| **`clients.js`** | Mini-CRM integrato: memorizza l'anagrafica dei clienti, sincronizza i dati su Firestore e permette l'autocompilazione istantanea nel preventivo. | Si interfaccia con `editor.js`, `archive.js` e `firebase-sync.js`. |
| **`firebase-auth.js`** | **Security Gate**: controlla l'accesso tramite Google Sign-In, verifica che l'email corrisponda a `fedecoletta@gmail.com` e gestisce il refresh dei token ID e la protezione anti-manomissione. | Dialoga con Firebase Auth e sblocca l'interfaccia applicativa. |
| **`firebase-sync.js`** | **Cloud Engine**: gestisce i listener real-time `onSnapshot` di Firestore per `/preventivi`, `/clienti` e `/config`, l'Auto-Save continuo con debounce a 1.2s e la persistenza IndexedDB. | Connette il database cloud a `archive.js`, `clients.js` ed `editor.js`. |
| **`google-drive.js`** | **Drive Archiver**: genera il PDF A4 con `html2pdf.js` e lo carica via multipart upload API v3 nella cartella dedicata Google Drive, registrando URL e ID nel preventivo. | Chiamato da `editor.js` e `archive.js` sui pulsanti di salvataggio Drive. |
| **`price-list.js`** | Catalogo e listino prezzi predefinito per aggiungere voci frequenti con un solo clic dal menu a tendina. | Alimenta il menu *"+ Aggiungi dal listino..."* in `editor.js`. |
| **`print-engine.js`** | **Motore di Impaginazione e Stampa A4**: distribuisce e impagina il preventivo o la proforma su 2 o 3 pagine A4 senza tagli a metà riga (*anti-orphan guard*), include logo e firma. | Legge lo stato da `editor.js`, applica gli stili di `print.css` e gestisce l'anteprima. |
| **`storage-safety.js`** | Strato di persistenza atomica locale: interfaccia cache IndexedDB/localStorage, salvataggio di emergenza e import/export di backup JSON. | Intermediario di sicurezza tra il browser e i moduli applicativi. |
| **`theme.js`** | Gestisce il commutatore Dark Mode / Light Mode, sincronizzando le preferenze nel sistema e salvandole in memoria. | Applica l'attributo `data-tema="dark"` sul tag `<html>`. |
| **`app.js`** | **Controller Principale**: gestisce il ciclo di vita dei documenti (Nuovo, Salva, Duplica, Cambia Vista), ascolta le scorciatoie da tastiera (`Ctrl+S`, `Ctrl+P`, `Ctrl+Z`) e coordina i flussi. | È il "direttore d'orchestra" che connette UI, calcoli, cloud e archivio. |

---

## 4. Flusso dei Dati: Come Avviene una Modifica

Ecco cosa accade quando crei o modifichi un preventivo:

1. **Interazione dell'utente:** Federico modifica una quantità o un prezzo nella tabella voci usando i micro-pulsanti `[−]` e `[+]` o digitando il valore.
2. **Reattività immediata:** L'evento scatena `calcola()`, che ricalcola al volo imponibile, rivalsa INPS, ritenuta d'acconto e marca da bollo, aggiornando la Sidebar Live a destra e la stima delle pagine A4.
3. **Auto-Save Continuo:** Il modulo `firebase-sync.js` intercetta le modifiche con debounce a 1.2 secondi, esegue il dirty-check tramite hash JSON ed invia la mutazione atomica a Cloud Firestore.
4. **Validazione & Sanificazione:** Prima della persistenza, `validator.js` sanifica l'oggetto per garantire che nessun dato sia corrotto o mancante.
5. **Sincronizzazione Istantanea:** Tramite i listener `onSnapshot`, ogni altro dispositivo connesso (es. iPad o smartphone sul set) riceve l'aggiornamento in frazioni di secondo.
6. **Esportazione & Backup Drive:** Cliccando *"Salva su Google Drive"*, viene generato il PDF A4 a 300 DPI e caricato direttamente nella cartella dedicata Drive con notifica di successo e link diretto.

---

## 5. Le Funzionalità dell'Interfaccia "Cinematic Cloud Pro"

1. **Design System Deep Obsidian (`#080B10`):**
   - Palette scura cinematografica ad alto contrasto, studiata per non affaticare la vista in sala montaggio o sul set.
   - Schede scure con sottili bagliori ciano/teal (`#00B4D8`) al focus e bordature ad alta definizione.
2. **Micro-Stepper Box su Quantità e Prezzo:**
   - Pulsanti dedicati `[ − ]` e `[ + ]` per alzare o abbassare rapidamente quantità e prezzi.
   - Libertà di digitazione manuale immediata da tastiera senza rotelline del mouse che alterano i numeri per errore.
3. **Archivio Clienti con Badge Iniziali e Accordion Dinamico:**
   - Schede raggruppate per cliente con avatar (`[ID]`, `[MD]`, `[VV]`) e chevron vettoriale con rotazione fluida.
4. **Card Metriche KPI in Testa all'Archivio:**
   - 4 card interattive che filtrano l'archivio al clic (Accettati, In Attesa/Inviati, Bozze, Totale Gestito e tasso di conversione).
5. **Cestino Unificato Cloud:**
   - Gestione delle eliminazioni con soft-delete: nessun dato viene perso, ripristino istantaneo con un clic.
6. **Badge di Sincronizzazione Cloud in Navbar:**
   - Indicatore visivo di stato (Verde = Sincronizzato, Giallo = In salvataggio, Grigio = Offline) con possibilità di forzare il sync.

---

## 6. Sicurezza, Test Automatizzati e Struttura File del Progetto

### La Suite di Test Automatici (`test.cjs`)
La suite automatizzata esegue 52 test unitari e di regressione in meno di 400ms:
```bash
npm run test
# oppure: node test.cjs
```
1. **Controllo Sintattico:** Tutti i 16 file JavaScript vengono scansionati da Node.js (`node --check`) per verificare l'assenza di errori di sintassi.
2. **Schema Validator:** Verifica la preservazione di numeri, stati bozza/annullato, fallback a 0 per `NaN`, fallback a 1 per quantità vuote, metadati Drive (`driveFileId`, `driveUrl`) e flag di soft-delete (`cestinato`, `eliminatoIl`).
3. **Matematica Fiscale:** Controlla che imponibile, sconti, rivalse INPS (4%), ritenute (20%) e marca da bollo (€ 2,00 oltre € 77,47) siano esatti al centesimo di euro rispetto alle normative fiscali italiane.
4. **Disaccoppiamento Dati Fiscali Stampa & Cloud Data Model:** Verifica che P.IVA e Codice Fiscale vengano letti correttamente dal preventivo e che siano conformi sia in regime forfettario che in prestazione occasionale.
5. **Storage Safety & Funzioni Ausiliarie:** Verifica la presenza e la robustezza delle funzioni di backup, archivio e cestino.

---

## 7. Riepilogo Operativo per l'Uso Quotidiano

* **Accesso Web:** Apri `https://preventivi-federico-coletta.web.app` (o l'anteprima locale) ed effettua l'accesso con il tuo account Google `fedecoletta@gmail.com`.
* **Redazione Preventivo:** Compila le voci, seleziona il cliente o usa i pacchetti rapidi (Spot, Docufilm, DoP). Il salvataggio avviene automaticamente in background su Firestore.
* **Stampa & PDF:** Premi `Ctrl+P` o clicca *"Stampa Preventivo / Proforma"* per generare il PDF A4 tipografico.
* **Archiviazione Drive:** Clicca *"Salva su Google Drive"* per inviare una copia PDF direttamente nella cartella cloud dedicata.
* **Recupero Documenti:** Accedi all'Archivio e usa il filtro *"Cestino"* per visualizzare o ripristinare qualsiasi preventivo eliminato.
