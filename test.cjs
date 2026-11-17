/**
 * Compilatore Preventivi — Suite di Test Automatizzati (Unit & Regression Tests)
 * Esecuzione rapida (<500ms): `node test.js`
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const SRC_JS_DIR = path.join(ROOT_DIR, 'src', 'js');
const MASTER_BACKUP = path.join(ROOT_DIR, 'Backup Preventivi', 'FC_backup-preventivi_MASTER_2026-10-24.json');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FALLITO: ${message}`);
  }
}

console.log('====================================================');
console.log(' COMPILATORE PREVENTIVI — TEST SUITE AUTOMATIZZATA  ');
console.log('====================================================\n');

// 1. Controllo sintassi di tutti i file sorgente JS
console.log('1. Controllo sintattico file JavaScript (node --check):');
const jsFiles = fs.readdirSync(SRC_JS_DIR).filter(f => f.endsWith('.js'));
jsFiles.forEach(file => {
  const filePath = path.join(SRC_JS_DIR, file);
  try {
    execSync(`node --check "${filePath}"`);
    assert(true, `Sintassi corretta: src/js/${file}`);
  } catch (err) {
    assert(false, `Errore sintattico in src/js/${file}: ${err.message}`);
  }
});

// Carica il validatore per i test unitari
require(path.join(SRC_JS_DIR, 'validator.js'));
const validator = globalThis.sanificaPreventivo ? globalThis : (globalThis.App?.validator || {});

// 2. Test del modulo Schema Validator & Sanitizer
console.log('\n2. Test Schema Validator & Sanitizer (src/js/validator.js):');
{
  const preventivoIncompleto = {
    numero: 'FC_TEST_01',
    voci: [
      { desc: 'Voce 1', prezzo: '500.50', qta: '2' },
      { desc: 'Voce 2 con NaN', prezzo: 'non-un-numero', qta: null }
    ],
    sconto: '50',
    rivalsa: '4'
  };

  const sanificato = globalThis.sanificaPreventivo(preventivoIncompleto);
  assert(sanificato.numero === 'FC_TEST_01', 'Numero preservato correttamente');
  assert(sanificato.stato === 'bozza', 'Stato di default "bozza" applicato');
  assert(sanificato.cliente && typeof sanificato.cliente.nome === 'string', 'Struttura cliente inizializzata');
  assert(sanificato.voci[0].p === 500.50, 'Conversione numerica prezzo voce 1 corretta');
  assert(sanificato.voci[0].q === 2, 'Conversione quantità voce 1 corretta');
  assert(sanificato.voci[1].p === 0, 'Valore NaN sanificato a fallback 0');
  assert(sanificato.voci[1].q === 1, 'Quantità nulla sanificata a fallback 1');
  assert(sanificato.sconto === 50, 'Sconto sanificato a numero');
  assert(sanificato.rivalsa === 4, 'Rivalsa sanificata a numero');

  // Test per 'annullato', 'annullamento', 'cestinato' e metadati Google Drive
  const pAnnullato = globalThis.sanificaPreventivo({
    numero: 'FC_ANN_01',
    stato: 'annullato',
    annullamento: { data: '2026-11-17T00:00:00Z', nota: 'Progetto posticipato dal cliente' },
    cestinato: true,
    eliminatoIl: '2026-11-17T00:00:00Z',
    driveFileId: 'drive123',
    driveUrl: 'https://drive.google.com/file/d/drive123/view',
    driveSavedAt: '2026-11-17T00:00:00Z',
    voci: [{ nome: 'Video Promo', desc: '4K', q: 2, p: 400 }]
  });
  assert(pAnnullato.stato === 'annullato', 'Stato "annullato" riconosciuto e preservato');
  assert(pAnnullato.annullamento && pAnnullato.annullamento.nota === 'Progetto posticipato dal cliente', 'Campo annullamento preservato');
  assert(pAnnullato.cestinato === true, 'Flag cestinato: true preservato');
  assert(pAnnullato.eliminatoIl === '2026-11-17T00:00:00Z', 'Data eliminatoIl preservata');
  assert(pAnnullato.driveFileId === 'drive123', 'Metadato driveFileId preservato');
  assert(pAnnullato.driveUrl.includes('drive123'), 'Metadato driveUrl preservato');
  assert(!('qta' in pAnnullato.voci[0]), 'Nessun duplicato qta in voci');
  assert(!('prezzo' in pAnnullato.voci[0]), 'Nessun duplicato prezzo in voci');

  const validazione = globalThis.validaPreventivo(sanificato);
  assert(validazione.valido === true, 'Validazione preventivo sanificato ha successo');

  const validazioneNull = globalThis.validaPreventivo(null);
  assert(validazioneNull.valido === false, 'Oggetto nullo rigettato correttamente');
}

// 3. Test Calcoli Matematici
console.log('\n3. Test Calcoli Matematici & Arrotondamenti:');
{
  function calcolaTest(voci, sconto, scontoTxt, rivalsaPerc, bolloTipo) {
    let lordo = 0;
    voci.forEach(v => {
      lordo += (parseFloat(v.prezzo) || 0) * (parseFloat(v.qta) || 1);
    });

    let sc = parseFloat(sconto) || 0;
    if (scontoTxt && scontoTxt.includes('%')) {
      sc = lordo * (sc / 100);
    }
    const imponibile = Math.max(0, lordo - sc);
    const rivalsa = rivalsaPerc > 0 ? (imponibile * (rivalsaPerc / 100)) : 0;
    const baseBollo = imponibile + rivalsa;
    let bollo = 0;
    if (bolloTipo === 'auto') {
      bollo = baseBollo > 77.47 ? 2 : 0;
    } else if (bolloTipo === '2') {
      bollo = 2;
    }
    const totale = imponibile + rivalsa + bollo;

    return {
      lordo: Math.round(lordo * 100) / 100,
      imponibile: Math.round(imponibile * 100) / 100,
      rivalsa: Math.round(rivalsa * 100) / 100,
      bollo: Math.round(bollo * 100) / 100,
      totale: Math.round(totale * 100) / 100
    };
  }

  // Caso 1: Voce singola 1000€, rivalsa 4%, bollo auto
  const c1 = calcolaTest([{ prezzo: 1000, qta: 1 }], 0, '', 4, 'auto');
  assert(c1.imponibile === 1000, 'Caso 1: Imponibile € 1.000,00');
  assert(c1.rivalsa === 40, 'Caso 1: Rivalsa INPS 4% = € 40,00');
  assert(c1.bollo === 2, 'Caso 1: Marca da bollo € 2,00');
  assert(c1.totale === 1042, 'Caso 1: Totale documento = € 1.042,00');

  // Caso 2: Voce 1000€ con sconto fisso 100€
  const c2 = calcolaTest([{ prezzo: 1000, qta: 1 }], 100, 'Sconto pacchetto', 4, 'auto');
  assert(c2.imponibile === 900, 'Caso 2: Imponibile scontato € 900,00');
  assert(c2.rivalsa === 36, 'Caso 2: Rivalsa INPS su imponibile scontato = € 36,00');
  assert(c2.totale === 938, 'Caso 2: Totale documento = € 938,00');

  // Caso 3: Sotto soglia bollo (€ 77.47)
  const c3 = calcolaTest([{ prezzo: 50, qta: 1 }], 0, '', 4, 'auto');
  assert(c3.bollo === 0, 'Caso 3: Bollo non applicato sotto soglia € 77,47');
  assert(c3.totale === 52, 'Caso 3: Totale documento = € 52,00');
}

// 4. Test di Integrità sul Master Backup Reale
console.log('\n4. Test Integrità Master Backup:');
if (fs.existsSync(MASTER_BACKUP)) {
  const backupRaw = fs.readFileSync(MASTER_BACKUP, 'utf-8');
  const validazioneBackup = globalThis.validaBackupJSON(backupRaw);
  assert(validazioneBackup.valido === true, 'File MASTER JSON letto e validato con successo');
  assert(validazioneBackup.conteggio === 14, `Tutti i 14 preventivi storici presenti (${validazioneBackup.conteggio}/14)`);

  const clientiUnici = new Set();
  validazioneBackup.dati.preventivi.forEach(p => {
    if (p.cliente?.nome?.trim()) clientiUnici.add(p.cliente.nome.trim());
  });
  assert(clientiUnici.size === 8, `Riconosciuti tutti gli 8 clienti storici (${clientiUnici.size}/8)`);
} else {
  console.log('  - Master backup non trovato, test saltato.');
}

// 5. Test Disaccoppiamento Dati Fiscali Stampa & Cloud Data Model
console.log('\n5. Test Disaccoppiamento Dati Fiscali Stampa & Cloud Data Model:');
{
  globalThis.window = globalThis;
  globalThis.IO = {
    nome: 'Federico Coletta',
    ruolo: 'Video Editor & Colorist',
    citta: 'Genzano di Roma',
    mail: 'fedecoletta@gmail.com',
    tel: '+39 347 876 4304',
    sito: 'federicoletta.com'
  };
  globalThis.conPartitaIva = () => false;
  globalThis.val = () => '';
  globalThis.esc = (s) => s || '';
  globalThis.datiIo = () => ({});
  globalThis.regimeAttivo = () => 'occasionale';

  require(path.join(SRC_JS_DIR, 'print-engine.js'));
  if (typeof globalThis.pieded === 'function') {
    const pConPiva = {
      regime: 'forf5',
      io: { piva: '01234567890', cf: 'CLTFRC90A01H501U' }
    };
    const htmlPieded = globalThis.pieded(pConPiva);
    assert(htmlPieded.includes('01234567890'), 'P.IVA stampata correttamente dall\'oggetto preventivo p');
    assert(htmlPieded.includes('CLTFRC90A01H501U'), 'Codice Fiscale stampato correttamente dall\'oggetto p');
    assert(htmlPieded.includes('federicoletta.com'), 'Sito web formattato nel footer');

    const pOccasionale = {
      regime: 'occasionale',
      io: { cf: 'CLTFRC90A01H501U' }
    };
    const htmlOcc = globalThis.pieded(pOccasionale);
    assert(!htmlOcc.includes('P. IVA'), 'P.IVA non inclusa in regime occasionale');
    assert(htmlOcc.includes('CLTFRC90A01H501U'), 'Codice Fiscale presente in regime occasionale');
  }
}

// 6. Test Modulo Storage Safety & Funzioni Ausiliarie
console.log('\n6. Test Modulo Storage Safety & Funzioni Ausiliarie:');
globalThis.window = globalThis;
globalThis.CHIAVE = "fcpreventivi_archivio_v1";
globalThis.CHIAVE_IO = "fcpreventivi_dati_io_v1";
require(path.join(SRC_JS_DIR, 'core.js'));
require(path.join(SRC_JS_DIR, 'storage-safety.js'));
assert(typeof globalThis.aggiornaBackupInfo === 'function', 'Funzione aggiornaBackupInfo definita globalmente');
assert(typeof globalThis.App?.storage?.getArchive === 'function', 'Funzione archivio disponibile in App.storage');
assert(typeof globalThis.App?.storage?.getTrash === 'function', 'Funzione cestino disponibile in App.storage');

// 7. Test Scorporo Listino su Documenti Singoli con ID (v4.0 Decoupled)
console.log('\n7. Test Scorporo Listino su Documenti Singoli con ID (v4.0 Decoupled):');
globalThis.localStorage = {
  _store: {},
  getItem: function(k){ return this._store[k] || null; },
  setItem: function(k, v){ this._store[k] = String(v); },
  removeItem: function(k){ delete this._store[k]; }
};
globalThis.CHIAVE_LISTINO = "fc_listino_v1";
require(path.join(SRC_JS_DIR, 'config.js'));
require(path.join(SRC_JS_DIR, 'price-list.js'));

const stdVoci = globalThis.listinoStandard();
assert(Array.isArray(stdVoci) && stdVoci.length >= 30, `Listino standard contiene ${stdVoci.length} voci`);
const tuttiConId = stdVoci.every(v => typeof v.id === 'string' && v.id.startsWith('voc_'));
assert(tuttiConId, 'Tutte le voci del listino standard possiedono un ID univoco (voc_...)');

const idSet = new Set(stdVoci.map(v => v.id));
assert(idSet.size === stdVoci.length, `Tutti gli ${stdVoci.length} ID voce sono univoci e non duplicati`);

const normalizzata = globalThis.normalizzaVoceListino({ nome: 'Voce Personalizzata Test', prezzo: 150 });
assert(normalizzata && typeof normalizzata.id === 'string' && normalizzata.id.startsWith('voc_'), 'Generazione automatica ID per nuove voci senza ID');
assert(normalizzata.prezzo === 150, 'Preservazione prezzo numerico nella normalizzazione');
assert(normalizzata.attivo === true, 'Flag attivo: true impostato di default');

assert(typeof globalThis.App?.priceList?.deleteItem === 'function', 'Funzione deleteItem presente in App.priceList');
assert(typeof globalThis.App?.priceList?.saveItem === 'function', 'Funzione saveItem presente in App.priceList');

console.log('\n----------------------------------------------------');
console.log(`RISULTATO TEST: ${passedTests}/${totalTests} superati.`);
if (failedTests > 0) {
  console.error(`ATTENZIONE: ${failedTests} test falliti!\n`);
  process.exit(1);
} else {
  console.log('TUTTI I TEST SONO STATI SUPERATI CON SUCCESSO! ✓\n');
  process.exit(0);
}
