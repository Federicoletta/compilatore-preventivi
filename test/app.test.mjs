/**
 * Suite di test automatici sui moduli ES reali di Compilatore Preventivi v2.0.
 * Zero mock: importa direttamente calculations.js, validator.js, print-engine.js e formatters.js.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { calcolaTotali, stimaIngombroStampa } from "../src/js/calculations.js";
import {
  ALLOWED_CLIENT_FIELDS,
  ALLOWED_PRICE_ITEM_FIELDS,
  ALLOWED_QUOTE_FIELDS,
  deserializeQuoteFromFirestore,
  prossimoNumero,
  serializeClientForFirestore,
  serializePriceItemForFirestore,
  serializeQuoteForFirestore,
  validaImportJSON,
  verificaPreventivo,
} from "../src/js/validator.js";
import { renderQuoteDocumentHtml, renderSecondDocumentHtml } from "../src/js/print-engine.js";
import { esc, euro } from "../src/js/formatters.js";

test("Calcolo fiscale: Prestazione occasionale con ritenuta 20% e bollo > 77.47€", () => {
  const res = calcolaTotali({
    regime: "occasionale",
    ritenuta: 20,
    bollo: "auto",
    voci: [
      { nome: "Ripresa", q: 2, p: 500 }, // 1000
    ],
  });
  assert.equal(res.imponibile, 1000);
  assert.equal(res.rivalsa, 0);
  assert.equal(res.iva, 0);
  assert.equal(res.bollo, 2);
  assert.equal(res.ritenuta, 200);
  assert.equal(res.totaleDoc, 1002);
  assert.equal(res.netto, 802);
});

test("Calcolo fiscale: Soglia bollo esatta € 77,47 (<= 77.47 nessun bollo, > 77.47 bollo € 2)", () => {
  const below = calcolaTotali({
    regime: "forf5",
    bollo: "auto",
    voci: [{ nome: "Servizio", q: 1, p: 77.47 }],
  });
  assert.equal(below.bollo, 0);

  const above = calcolaTotali({
    regime: "forf5",
    bollo: "auto",
    voci: [{ nome: "Servizio", q: 1, p: 77.48 }],
  });
  assert.equal(above.bollo, 2);
});

test("Calcolo fiscale: Regime forfettario con rivalsa INPS 4% e sconto percentuale", () => {
  const res = calcolaTotali({
    regime: "forf15",
    rivalsa: 4,
    bollo: "auto",
    scontoTipo: "perc",
    scontoValore: 10,
    voci: [{ nome: "Documentario", q: 1, p: 2000 }],
  });
  assert.equal(res.imponibile, 2000);
  assert.equal(res.sconto, 200);
  assert.equal(res.base, 1800);
  assert.equal(res.rivalsa, 72); // 4% di 1800
  assert.equal(res.imponibileIva, 1872);
  assert.equal(res.iva, 0);
  assert.equal(res.bollo, 2);
  assert.equal(res.ritenuta, 0);
  assert.equal(res.netto, 1874);
});

test("Calcolo fiscale: Regime ordinario IVA 22% + cassa 2% (esclusa da ritenuta) + ritenuta 20%", () => {
  const res = calcolaTotali({
    regime: "ordinario",
    rivalsa: 2,
    iva: 22,
    ritenuta: 20,
    voci: [{ nome: "Direzione fotografia", q: 1, p: 1000 }],
  });
  assert.equal(res.rivalsa, 20);
  assert.equal(res.imponibileIva, 1020);
  assert.equal(res.iva, 224.4);
  assert.equal(res.bollo, 0);
  assert.equal(res.ritenuta, 200); // 20% su base 1000 (cassa 2% non soggetta a ritenuta)
  assert.equal(res.totaleDoc, 1244.4);
  assert.equal(res.netto, 1044.4);
});

test("Calcolo fiscale: Regime 'nessuno' e sconto Euro bloccato all'imponibile", () => {
  const res = calcolaTotali({
    regime: "nessuno",
    scontoTipo: "euro",
    scontoValore: 500,
    voci: [{ nome: "Montaggio", q: 1, p: 300 }],
  });
  assert.equal(res.scontoLordo, 500);
  assert.equal(res.sconto, 300);
  assert.equal(res.base, 0);
  assert.equal(res.netto, 0);
});

test("Numerazione progressiva sicura: considera anche i preventivi cestinati", () => {
  const quotes = [
    { id: "p1", numero: "2026-001", cestinato: false },
    { id: "p2", numero: "2026-004", cestinato: true },
    { id: "p3", numero: "2025-099", cestinato: false },
  ];
  assert.equal(prossimoNumero(quotes, 2026), "2026-005");
  assert.equal(prossimoNumero([], 2026), "2026-001");
});

test("Serializzazione Firestore /preventivi: rispetto 100% whitelist, limiti chiavi e zero nested array", () => {
  const raw = {
    id: "p_test_123",
    numero: "2026-010",
    data: "2026-05-10",
    validita: "2026-06-09",
    stato: "inviato",
    clienteId: "cli_should_move_into_cliente_map",
    scontoTipo: "perc",
    scontoValore: 15,
    extraCampoIllegale: "DEVE_ESSERE_SCARTATO",
    annullamento: null, // Non deve mai finire come null nel payload
    cliente: {
      clienteId: "cli_01",
      nome: "Studio Alfa",
      ref: "Anna",
      cf: "ABCDEF01G23H456I",
      sdi: "M5UXCR1",
      pec: "alfa@pec.it",
    },
    progetto: { titolo: "Spot TV", tipo: "Spot" },
    voci: [{ nome: "Riprese", desc: "Cinema line", q: 2, p: 500 }],
    condizioni: [["Validità", "30 giorni"]],
    cestinato: false,
  };

  const payload = serializeQuoteForFirestore(raw);

  // 1. Solo chiavi nella whitelist firestore.rules
  const allowedSet = new Set(ALLOWED_QUOTE_FIELDS);
  for (const key of Object.keys(payload)) {
    assert.ok(allowedSet.has(key), `Chiave non consentita in /preventivi: ${key}`);
  }
  assert.equal("extraCampoIllegale" in payload, false);
  assert.equal("clienteId" in payload, false);
  assert.equal("scontoTipo" in payload, false);
  assert.equal("scontoValore" in payload, false);
  assert.equal("annullamento" in payload, false);

  // 2. Limiti mappe <= 15 chiavi
  assert.ok(Object.keys(payload.cliente).length <= 15);
  assert.ok(Object.keys(payload.progetto).length <= 15);
  assert.ok(Object.keys(payload.io).length <= 15);

  // 3. Persistenza campi nuovi dentro le mappe esistenti + sconto Euro numerico top-level
  assert.equal(payload.cliente.clienteId, "cli_01");
  assert.equal(payload.cliente.sdi, "M5UXCR1");
  assert.equal(payload.progetto.scontoTipo, "perc");
  assert.equal(payload.progetto.scontoValore, 15);
  assert.equal(payload.sconto, 150); // 15% di 1000

  // 4. Condizioni serializzate come oggetti { titolo, testo } (mai array annidati)
  assert.ok(!Array.isArray(payload.condizioni[0]));
  assert.deepEqual(payload.condizioni[0], { titolo: "Validità", testo: "30 giorni" });

  // 5. Round-trip deserializzazione
  const hydrated = deserializeQuoteFromFirestore(payload);
  assert.equal(hydrated.scontoTipo, "perc");
  assert.equal(hydrated.scontoValore, 15);
  assert.equal(hydrated.cliente.clienteId, "cli_01");
});

test("Serializzazione Firestore /clienti e /listino: conformità whitelist e campi obbligatori", () => {
  const client = serializeClientForFirestore({
    id: "cli_1",
    nome: "Casa Produzione",
    sdi: "SUBM70N",
    campoExtra: "no",
  });
  const allowedClient = new Set(ALLOWED_CLIENT_FIELDS);
  for (const k of Object.keys(client)) {
    assert.ok(allowedClient.has(k), `Chiave non consentita in /clienti: ${k}`);
  }
  assert.equal(serializeClientForFirestore({ id: "cli_2", nome: "   " }), null);

  const item = serializePriceItemForFirestore({
    id: "voc_1",
    nome: "Giornata DoP",
    prezzo: 650,
    campoExtra: "no",
  });
  const allowedPrice = new Set(ALLOWED_PRICE_ITEM_FIELDS);
  for (const k of Object.keys(item)) {
    assert.ok(allowedPrice.has(k), `Chiave non consentita in /listino: ${k}`);
  }
  assert.equal(serializePriceItemForFirestore({ id: "voc_2", nome: "" }), null);
});

test("Validazione preventivo e import JSON", () => {
  const checkErr = verificaPreventivo({
    id: "p1",
    numero: "2026-001",
    data: "2026-05-01",
    voci: [{ nome: "Voce", q: 1, p: 100 }],
    scontoTipo: "euro",
    scontoValore: 200,
  });
  assert.equal(checkErr.valido, false);
  assert.ok(checkErr.errori.some((e) => e.includes("sconto supera")));

  const impSingle = validaImportJSON({ numero: "2026-002", voci: [{ nome: "Montaggio", q: 1, p: 400 }] });
  assert.equal(impSingle.ok, true);
  assert.equal(impSingle.type, "single");

  const impBad = validaImportJSON({ foo: "bar" });
  assert.equal(impBad.ok, false);
});

test("Motore A4 unificato: anti-XSS rigoroso e stima paginazione breve vs lunga", () => {
  const maliciousQuote = {
    id: "p_xss",
    numero: "2026-099",
    data: "2026-05-10",
    cliente: { nome: `<img src=x onerror="alert(1)">` },
    progetto: { titolo: `<script>window.pwned=1</script>` },
    voci: [{ nome: `<b>Ripresa</b>`, desc: `" onclick="evil()`, q: 1, p: 500 }],
    incluso: [`<svg onload=alert(1)>`],
    escluso: [],
    condizioni: [{ titolo: `Clausola <script>`, testo: `Testo & "quote"` }],
  };

  const html = renderQuoteDocumentHtml(maliciousQuote, { showSignature: false });
  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("<img src=x"), false);
  assert.equal(html.includes("<svg"), false);
  assert.ok(html.includes(esc(`<script>window.pwned=1</script>`)));
  assert.ok(html.includes(esc(`<svg onload=alert(1)>`)));
  assert.ok(html.includes("doc-a4-root"));

  const secondHtml = renderSecondDocumentHtml(maliciousQuote, { showSignature: false });
  assert.equal(secondHtml.includes("<script>"), false);

  const breve = stimaIngombroStampa({ voci: [{ desc: "breve" }, { desc: "breve" }] });
  assert.equal(breve.pagina1Compatta, true);

  const lungo = stimaIngombroStampa({
    voci: Array.from({ length: 8 }, () => ({ desc: "Descrizione dettagliata prestazione video." })),
  });
  assert.equal(lungo.pagina1Compatta, false);

  assert.ok(euro(1250.5).includes("1.250,50") || euro(1250.5).includes("1250,50"));
});
