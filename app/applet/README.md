# Compilatore Preventivi — Federico Coletta (v4.0 Cloud-First)

Web Application Cloud-First professionale per la redazione, gestione, calcolo e stampa in formato PDF A4 di preventivi e note proforma per Direzione della Fotografia, Riprese e Video.

---

## 🚀 Architettura del Progetto (v4.0 Cloud-First)

L'applicazione è strutturata su un'architettura **modulare moderna** ospitata su **Firebase Hosting** e sincronizzata in tempo reale con **Google Firebase Firestore** e **Google Drive**.

```text
Compilatore-Preventivi/
├── public/                       # File di produzione per Firebase Hosting & Vite
│   ├── index.html                # Entry point web di produzione
│   ├── css/                      # Fogli di stile compilati e webfonts
│   ├── js/                       # Moduli JavaScript pronti per la distribuzione
│   └── assets/                   # Risorse grafiche (logo SVG, firma autografa PNG)
├── src/                          # Codice sorgente modulare (Clean Architecture)
│   ├── index.html                # Template HTML semantico
│   ├── assets/                   # Asset originali vettoriali e raster
│   ├── css/                      # Fogli di stile per responsabilità
│   │   ├── fonts.css             # Webfonts con definizioni @font-face
│   │   ├── main.css              # Layout app, design system Deep Obsidian, tabelle, form, modali
│   │   ├── dark-mode.css         # Palette Dark/Light mode ad alto contrasto
│   │   └── print.css             # Print engine A4 anti-orphan, condizioni e firme
│   └── js/                       # Moduli JavaScript specializzati
│       ├── core.js               # Namespace window.App, stato globale reattivo, error boundary
│       ├── validator.js          # Schema Guard, sanitizzazione input, validazione JSON
│       ├── config.js             # Dati anagrafici Federico Coletta, costanti fiscali
│       ├── helpers.js            # Formattazione valuta (€), date italiane, escape stringhe
│       ├── calculations.js       # Motore fiscale certificato (regimi, ritenuta, rivalsa, bollo)
│       ├── storage-safety.js     # Cache atomica, snapshot di recovery, export/import JSON
│       ├── clients.js            # Mini-CRM anagrafica clienti con autocompilazione
│       ├── firebase-auth.js      # Gate di autenticazione Google riservato a fedecoletta@gmail.com
│       ├── firebase-sync.js      # Sincronizzazione real-time Firestore SDK, Auto-Save continuo
│       ├── editor.js             # Form preventivo, voci, drag & drop, micro-stepper [−][+]
│       ├── price-list.js         # Listino prezzi predefinito e pacchetti (Spot, Doc, DoP)
│       ├── print-engine.js       # Motore impaginazione tipografica A4 anti-orphan
│       ├── google-drive.js       # Upload automatico PDF su Google Drive (API v3 multipart)
│       ├── archive.js            # Cruscotto archivio, KPI, filtri, ricerca, soft-delete unificato
│       ├── theme.js              # Gestione persistente tema chiaro / scuro
│       └── app.js                # Controller principale e coordinatore ciclo di vita
├── build.py                      # Script di build per compilare src/ in public/index.html
├── test.cjs                      # Suite di test automatizzati (52/52 superati)
├── firestore.rules               # Regole di sicurezza Firestore per preventivi, clienti, config
├── firebase.json                 # Configurazione Firebase Hosting e Firestore
└── DOCUMENTAZIONE_APP_E_FUNZIONAMENTO.md # Documentazione tecnica dettagliata v4.0
```

---

## 🌟 Principali Novità v4.0 Cloud-First

1. **Sincronizzazione Cloud Istantanea:** Sincronizzazione nativa tramite **Firebase Firestore SDK** con listener real-time (`onSnapshot`) sulle collezioni `/preventivi`, `/clienti` e `/config`.
2. **Auto-Save Continuo:** Salvataggio automatico debounced (1.2s) e persistenza offline nativa su **IndexedDB**.
3. **Archiviazione Google Drive:** Esportazione del preventivo PDF ad alta risoluzione (300 DPI) con upload automatico nella cartella dedicata su Google Drive (`1F5m8TD08yubxf_Rpuk-T_-_74SVzX76V`) e salvataggio dei metadati (`driveFileId`, `driveUrl`, `driveSavedAt`).
4. **Soft-Delete Unificato:** Gestione del cestino sincronizzata direttamente su Firestore tramite i flag `cestinato: true` ed `eliminatoIl`.
5. **Accesso Protetto:** Area riservata protetta da Google Auth con whitelist esclusiva per l'account proprietario `fedecoletta@gmail.com`.
6. **Multi-device:** Accessibile da desktop, tablet e smartphone senza dipendenze da file locali o File System Access API.

---

## 🧪 Test Automatizzati

Il progetto include una suite completa di 52 test unitari e di regressione eseguiti con Node.js:

```bash
npm run test
# oppure: node test.cjs
```

Controlli verificati:
- Controllo sintattico di tutti i 16 moduli JavaScript.
- Schema Validator & Sanitizer (gestione valori nulli, stringhe, `NaN`, array).
- Calcoli matematici fiscali (imponibile, rivalsa INPS 4%, ritenuta d'acconto 20%, soglia marca da bollo € 77,47).
- Disaccoppiamento dati fiscali e modello cloud.
- Modulo storage safety e gestione transazioni atomiche.
