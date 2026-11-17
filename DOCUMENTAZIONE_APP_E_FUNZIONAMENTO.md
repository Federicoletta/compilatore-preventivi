# Compilatore Preventivi — Documentazione Completa & Mappa Architetturale
**Sviluppato per:** Federico Coletta — Direttore della Fotografia & Videomaker  
**Versione:** 3.0 Pro ("Cinematic Pro")  
**Data di riferimento:** Novembre 2026  

---

## 1. Che Cos'è l'App e a Cosa Serve

Il **Compilatore Preventivi** è una web application professionale standalone e autonoma al 100%, creata su misura per gestire l'intero ciclo economico e commerciale dell'attività di Federico Coletta nel settore cinematografico, pubblicitario ed editoriale video.

### Obiettivi Primari del Software
1. **Redazione Preventivi Rapida e Flessibile:** Compilazione assistita di documenti formali con voci di ripresa, allestimento luci, noleggio kit camera cinema, post-produzione e diritti di sfruttamento.
2. **Motore di Calcolo Fiscale Certificato:** Calcolo al centesimo di imponibile, sconti su misura, ritenuta d'acconto (20%), rivalsa INPS Gestione Separata (4% o 2%), marca da bollo (€ 2,00 oltre la soglia legale di € 77,47) e gestione di tutti i regimi fiscali italiani (Prestazione Occasionale, Forfettario 5%, Forfettario 15%, Regime Ordinario IVA).
3. **Generazione di Due Tipologie di Documenti in un Clic:**
   - **Preventivo Commerciale Formale:** Presentazione estetica per il committente con lettere di intenti, elenco voci dettagliato, cosa include/esclude il pacchetto, termini di pagamento e condizioni contrattuali legali.
   - **Nota di Prestazione / Fattura Proforma:** Documento contabile formale con codice fiscale, IBAN per il bonifico, rivalse e ritenute per la liquidazione del compenso.
4. **Motore di Impaginazione Tipografica A4 (Print Engine):** Algoritmo di distribuzione che impagina i contenuti su esattamente 2 o 3 pagine A4 senza interruzioni di riga sgradevoli (*anti-orphan guard*) ed esporta in PDF a 300 DPI con firma autografa e logo vettoriale integrati.
5. **CRM Locale & Archivio Preventivi:** Monitoraggio metriche di business (KPI su fatturato incassato, opportunità aperte, tassi di conversione) e raggruppamento preventivi per cliente con badge iniziale e storico immediato.
6. **Privacy e Sovranità Totale dei Dati:** L'app funziona **completamente offline**. Nessun dato finisce su cloud esterni o server terzi; tutto è memorizzato localmente sul tuo computer.

---

## 2. Come Funziona l'Architettura: I Due Livelli

Il progetto è strutturato su un'**architettura modulare a due livelli**: il livello di sviluppo sorgente e il livello compilato di produzione.

```text
1. Livello Sorgente (src/)
   ├── src/index.html                     (Template semantico)
   ├── src/css/                           (Fogli di stile: fonts, main, dark-mode, print)
   └── src/js/                            (14 Moduli specializzati: core, calculations, editor...)
          │
          ▼
2. Pipeline di Build & Test
   ├── test.js                            (37 Unit Test in <400ms: sintassi, calcoli fiscali, backup)
   └── build.py                           (Script Python che unifica i sorgenti in un unico file)
          │
          ▼
3. Livello Produzione (File Singolo)
   └── Compilatore-preventivi.html        (100% Autonomo, pronto con doppio clic, nessun server)
          │
          ▼
4. Archiviazione Dati Locale
   ├── localStorage                       (Memoria interna del browser per uso immediato)
   ├── 📁 Cartella PC                     (Sincronizzazione opzionale su cartella Windows)
   └── Backup/*.zip                       (Snapshot automatici di sicurezza)
```

### Perché questa struttura è fondamentale?
* **Durante lo sviluppo (in `src/`):** Ogni funzione ha il suo file dedicato. Se dobbiamo modificare il calcolo delle tasse tocchiamo solo `calculations.js`; se ritocchiamo la Dark Mode tocchiamo solo `dark-mode.css`. Questo evita il disordine dei vecchi file unici giganti.
* **Nell'uso quotidiano (con `Compilatore-preventivi.html`):** Non devi avviare nessun terminale o server. Fai doppio clic sul file HTML come se fosse un programma `.exe`: il browser non applicherà restrizioni di sicurezza (CORS) perché tutto il codice, i font e i loghi sono già incorporati al suo interno.

---

## 3. Mappa dei Collegamenti tra i Moduli (`src/js/`)

L'applicazione fa uso di 14 moduli JavaScript specializzati, orchestrati secondo principi di *Clean Architecture*:

| Modulo | Ruolo Principale | Con chi si collega |
| :--- | :--- | :--- |
| **`core.js`** | Inizializza il namespace `window.App`, isola lo stato globale e attiva l'**Error Boundary** (scudo anti-crash con banner di avviso in caso di errori imprevisti). | Collegato con tutti i moduli dell'app. |
| **`validator.js`** | **Schema Guard**: sanifica ogni dato in ingresso, converte testi in numeri validi, impedisce valori `NaN`, valida la struttura dei JSON importati. | Chiamato da `app.js`, `storage-safety.js` ed `editor.js`. |
| **`config.js`** | Contiene i dati anagrafici predefiniti di Federico Coletta (C.F., P.IVA, IBAN, email, ruoli), costanti fiscali e chiavi di storage. | Letto da `calculations.js`, `print-engine.js` ed `editor.js`. |
| **`helpers.js`** | Utility pure: formattazione valuta (`euro()`), formattazione date italiane, escape stringhe HTML (`esc()`), selettori DOM rapidi (`val()`, `set()`). | Utilizzato trasversalmente da tutta l'interfaccia. |
| **`calculations.js`** | **Motore Fiscale**: calcola imponibile, sconti, rivalsa INPS, ritenuta, marca da bollo e netto. Aggiorna in tempo reale la sidebar e la stima pagine A4. | Riceve i dati da `editor.js` e aggiorna il DOM e la sidebar. |
| **`editor.js`** | Gestisce il modulo del preventivo: tabella voci con riordino Drag & Drop, stepper micro-pulsanti `[−]` e `[+]` su Quantità e Prezzo, duplicazione ed eliminazione righe, pacchetti rapidi (Spot, Docufilm, DoP). | Comunica con `calculations.js`, `app.js` e la cronologia Undo/Redo. |
| **`archive.js`** | Cruscotto dell'Archivio: vista cronologica o raggruppata per cliente, calcolo delle 4 card KPI in tempo reale, filtri rapidi di stato, barra di ricerca istantanea, gestione cestino e ripristino. | Legge e scrive in `storage-safety.js`, dialoga con `app.js` per aprire o duplicare preventivi. |
| **`clients.js`** | Mini-CRM integrato: memorizza l'anagrafica dei clienti, aggancia i dati di contatto storici ed effettua l'autocompilazione istantanea nel preventivo. | Si interfaccia con `editor.js` e `archive.js`. |
| **`price-list.js`** | Catalogo e listino prezzi predefinito per aggiungere voci frequenti con un solo clic dal menu a tendina. | Alimenta il menu *"+ Aggiungi dal listino..."* in `editor.js`. |
| **`print-engine.js`** | **Motore di Impaginazione e Stampa A4**: distribuisce e impagina il preventivo o la proforma su 2 o 3 pagine A4 senza tagli a metà riga, genera la stampa PDF pulita. | Legge lo stato da `editor.js`, applica gli stili di `print.css` e gestisce l'anteprima. |
| **`storage-safety.js`** | Strato di persistenza atomica: memorizza su `localStorage`, gestisce cache veloce con invalidazione automatica, esporta e importa i backup JSON. | Intermediario di sicurezza tra il browser e i moduli `archive.js` ed `editor.js`. |
| **`disk-sync.js`** | Integrazione con Windows via File System Access API: permette di sincronizzare i preventivi direttamente in una cartella fisica del PC (`📁 Cartella PC`). | Collega il browser alla memoria di massa del disco locale. |
| **`theme.js`** | Gestisce il commutatore Dark Mode / Light Mode, sincronizzando le preferenze nel sistema e salvandole in memoria. | Applica l'attributo `data-tema="dark"` sul tag `<html>`. |
| **`app.js`** | **Controller Principale**: gestisce il ciclo di vita dei documenti (Nuovo, Salva, Duplica, Cambia Vista), ascolta le scorciatoie da tastiera (`Ctrl+S`, `Ctrl+P`, `Ctrl+Z`) e coordina i flussi. | È il "direttore d'orchestra" che connette UI, calcoli e archivio. |

---

## 4. Flusso dei Dati: Come Avviene una Modifica

Ecco cosa accade "dietro le quinte" quando crei o modifichi un preventivo:

1. **Interazione dell'utente:** Federico modifica una quantità o un prezzo nella tabella voci usando i micro-pulsanti `[−]` e `[+]` o digitando il valore.
2. **Reattività immediata:** L'evento scatena `calcola()`, che ricalcola al volo imponibile, rivalsa INPS, ritenuta d'acconto e marca da bollo, aggiornando la Sidebar Live a destra e la stima delle pagine A4.
3. **Salvataggio con Validazione:** Quando premi `Ctrl+S` o clicchi su *"Salva nell'archivio"*, il modulo `validator.js` sanifica l'oggetto per garantire che nessun dato sia corrotto o mancante.
4. **Scrittura Atomica:** L'oggetto viene registrato in `localStorage` attraverso `storage-safety.js`. Se è attiva la cartella locale (`📁 Cartella PC`), viene creata istantaneamente anche una copia su disco.
5. **Stampa PDF Certificata:** Premendo `Ctrl+P` o *"Stampa / Salva PDF"*, `print-engine.js` applica il layout tipografico A4, include logo, firma autografa e condizioni contrattuali ed apre la finestra di esportazione PDF nativa.

---

## 5. Le Funzionalità Esclusive dell'Interfaccia "Cinematic Pro"

1. **Design System Deep Obsidian (`#080B10`):**
   - Palette scura cinematografica ad alto contrasto, studiata per non affaticare la vista in sala montaggio o sul set.
   - Schede scure con sottili bagliori ciano/teal (`#00B4D8`) al focus e bordature ad alta definizione.
2. **Micro-Stepper Box su Quantità e Prezzo:**
   - Pulsanti dedicati `[ − ]` e `[ + ]` per alzare o abbassare rapidamente quantità (a scatti di 1 o 0.5 con Shift) e prezzi (a scatti di 10€ o 1€ con Shift).
   - Libertà di digitazione manuale immediata da tastiera senza fastidiose rotelline del mouse che alterano i numeri per errore.
3. **Menu a Tendina con Chevron SVG Vettoriale:**
   - Eliminazione completa delle frecce grigie sgranate native di Windows a favore di micro-icone geometriche ciano ad alta risoluzione ancorate a destra.
4. **Archivio Clienti con Badge Iniziali e Chevron Dinamico:**
   - Schede raggruppate per cliente con avatar (`[ID]`, `[MD]`, `[VV]`) e chevron vettoriale che ruota morbidamente di 90° all'apertura dell'accordion.
5. **Card Metriche KPI in Testa all'Archivio:**
   - 4 card interattive che filtrano l'archivio al clic:
     - **Accettati:** Fatturato confermato effettivo.
     - **In Attesa / Inviati:** Opportunità aperte in trattativa.
     - **Bozze:** Preventivi in lavorazione.
     - **Totale Gestito:** Volume complessivo e tasso di conversione (win-rate).
6. **Pulsante `📥 Importa JSON` Sempre Visibile:**
   - Posizionato stabilmente nella testata dell'app accanto a `📁 Cartella PC` e `💾 Backup` per caricare preventivi con un clic.

---

## 6. Sicurezza, Test Automatizzati e Struttura File del Progetto

Sul tuo computer in `C:\Users\fedec\Desktop\Compilatore-Preventivi` la cartella è organizzata come segue:

```text
Compilatore-Preventivi/
├── Compilatore-preventivi.html   # File finale da usare (doppio clic)
├── build.py                      # Compilatore Python con test runner integrato
├── test.js                       # Suite con 37 test automatici
├── README.md                     # Guida rapida di progetto
├── DOCUMENTAZIONE_APP_E_FUNZIONAMENTO.md # Questo documento completo
├── src/                          # I file sorgenti puliti e modulari
│   ├── index.html                # Struttura HTML
│   ├── css/                      # Fogli di stile (main, dark-mode, print, fonts)
│   └── js/                       # I 14 moduli JavaScript
├── Backup/                       # Snapshot storici zip creati ad ogni avanzamento
├── Backup Preventivi/            # Master file JSON con tutti i preventivi storici
├── JSON/                         # Esportazioni JSON dei singoli preventivi
└── PDF/                          # Raccolta dei preventivi PDF generati
```

### La Suite di Test Automatici (`test.js`)
Prima di ogni compilazione eseguiamo:
```bash
python build.py --test
```
Questo comando lancia istantaneamente 37 test unitari che controllano:
1. **Controllo Sintattico:** Tutti i 14 file JavaScript vengono scansionati da Node.js per verificare l'assenza di errori di sintassi.
2. **Schema Validator:** Verifica che nessun campo sia corrotto, che i valori nulli vengano sanificati e che non compaiano `NaN`.
3. **Matematica Fiscale:** Controlla che sconti, rivalse INPS, ritenute e bolli siano esatti al centesimo di euro rispetto alle formule dell'Agenzia delle Entrate.
4. **Integrità Backup Storico:** Verifica che tutti i 14 preventivi e gli 8 clienti storici vengano caricati e riconosciuti senza perdite.

---

## 7. Riepilogo Operativo per l'Uso Quotidiano

* **Per redigere o consultare i preventivi:** Fai doppio clic su `Compilatore-preventivi.html`.
* **Per salvare il lavoro su disco:** Clicca `💾 Backup` o `📁 Cartella PC` nella barra superiore.
* **Per stampare o esportare:** Premi `Ctrl+P` o clicca `Stampa / Salva PDF` nella colonna di destra.
* **Per recuperare un preventivo eliminato per errore:** Apri l'Archivio e clicca sul filtro `Cestino`.
