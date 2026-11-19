// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
// src/js/config.js
var IO = {
	nome: "Federico Coletta",
	ruolo: "Direttore della Fotografia & Videomaker",
	citta: "Genzano di Roma (RM) · Roma e Lazio",
	tel: "+39 377 094 9147",
	mail: "fedecoletta@gmail.com",
	ig: "instagram.com/federi.coletta",
	li: "linkedin.com/in/federicoletta",
	sito: "federicoletta.com"
};
var ASSET_PATHS = {
	logoDoc: "/assets/logo_federico_coletta.svg",
	logoNavbar: "/assets/logo_navbar.svg",
	firma: "/assets/firma_federico_coletta.png"
};
var STATI_PREVENTIVO = [
	{
		id: "bozza",
		label: "Bozza"
	},
	{
		id: "inviato",
		label: "Inviato"
	},
	{
		id: "accettato",
		label: "Accettato"
	},
	{
		id: "rifiutato",
		label: "Rifiutato"
	},
	{
		id: "annullato",
		label: "Annullato"
	}
];
var REGIMI_FISCALI = [
	{
		id: "occasionale",
		label: "Prestazione occasionale",
		breve: "Occasionale",
		haPartitaIva: false,
		descrizione: "Ritenuta d'acconto 20%, fuori campo IVA, bollo € 2,00 sopra € 77,47."
	},
	{
		id: "forf5",
		label: "Regime forfettario (5%)",
		breve: "Forfettario 5%",
		haPartitaIva: true,
		descrizione: "Senza IVA e senza ritenuta, rivalsa INPS 4% opzionale, bollo € 2,00 sopra € 77,47."
	},
	{
		id: "forf15",
		label: "Regime forfettario (15%)",
		breve: "Forfettario 15%",
		haPartitaIva: true,
		descrizione: "Senza IVA e senza ritenuta, rivalsa INPS 4% opzionale, bollo € 2,00 sopra € 77,47."
	},
	{
		id: "ordinario",
		label: "Regime ordinario (IVA)",
		breve: "Ordinario",
		haPartitaIva: true,
		descrizione: "IVA 22%/10%/0%, rivalsa INPS 4% o cassa 2%, ritenuta d'acconto opzionale."
	},
	{
		id: "nessuno",
		label: "Solo imponibile (senza note fiscali)",
		breve: "Solo imponibile",
		haPartitaIva: false,
		descrizione: "Mostra unicamente gli importi netti concordati senza dicitura fiscale."
	}
];
var CONDIZIONI_STD = [
	{
		titolo: "Validità",
		testo: "Il presente preventivo è valido 30 giorni dalla data di emissione."
	},
	{
		titolo: "Pagamento",
		testo: "Acconto del 30% alla conferma, saldo entro 30 giorni dalla consegna dei file finali. Bonifico bancario, coordinate comunicate in fase di conferma."
	},
	{
		titolo: "Tempistiche",
		testo: "Le date di ripresa si intendono confermate al ricevimento dell'acconto. Il calendario di consegna decorre dall'ultima giornata di ripresa."
	},
	{
		titolo: "Revisioni",
		testo: "Sono incluse due tornate di modifiche sul montaggio. Le richieste successive o i cambi di impostazione dopo l'approvazione sono quotati a parte."
	},
	{
		titolo: "Diritti d'uso",
		testo: "Alla conferma del saldo il cliente riceve i diritti d'uso illimitati nel tempo sui canali web, social, fiere e proiezioni interne. Il materiale grezzo resta di proprietà dell'autore, salvo diverso accordo scritto."
	},
	{
		titolo: "Portfolio",
		testo: "Federico Coletta si riserva l'uso del lavoro finito nel proprio portfolio e sui propri canali, salvo richiesta scritta di riservatezza."
	},
	{
		titolo: "Rinvii",
		testo: "Rinvii comunicati con meno di 48 ore di preavviso comportano l'addebito del 50% della giornata. Il maltempo, per le riprese in esterni, non è considerato rinvio imputabile."
	},
	{
		titolo: "Trasferte",
		testo: "Oltre 50 km da Genzano di Roma: € 0,35/km e, se previsto il pernotto, vitto e alloggio a carico del committente."
	}
];
var INCLUSO_STD = [
	"Attrezzatura camera, ottiche e luci",
	"Audio in presa diretta con radiomicrofoni",
	"Backup del girato su doppio supporto",
	"Due giri di revisione sul montaggio",
	"Consegna nei formati concordati"
];
var ESCLUSO_STD = [
	"Musiche con licenza a pagamento",
	"Location, permessi e diritti di ripresa",
	"Talent, casting e figuranti",
	"Trasferte oltre 50 km da Genzano di Roma",
	"Revisioni oltre le due incluse: € 45,00/h"
];
var PACCHETTI = {
	doc: [
		{
			nome: "Pre-produzione",
			desc: "Sopralluogo, scaletta narrativa, lista inquadrature e piano di lavorazione.",
			q: 1,
			p: 350
		},
		{
			nome: "Giornata di ripresa",
			desc: "Direzione della fotografia e operatore di macchina, fino a 10 ore. Attrezzatura camera, ottiche, luci e audio incluse.",
			q: 2,
			p: 650
		},
		{
			nome: "Montaggio, color e sound",
			desc: "Montaggio del film principale, color grading in DaVinci Resolve, sound design e due giri di revisione.",
			q: 1,
			p: 900
		},
		{
			nome: "Reel verticali 9:16",
			desc: "Pezzi da 20–30 secondi ricavati dal materiale girato, con sottotitoli aperti.",
			q: 3,
			p: 120
		}
	],
	spot: [
		{
			nome: "Pre-produzione e trattamento",
			desc: "Trattamento, storyboard, lista inquadrature e piano di lavorazione.",
			q: 1,
			p: 450
		},
		{
			nome: "Giornata di ripresa",
			desc: "Direzione della fotografia con attrezzatura camera e luci, fino a 10 ore.",
			q: 1,
			p: 750
		},
		{
			nome: "Montaggio, color e sound design",
			desc: "Versioni da 15\", 30\" e 60\" con color grading in DaVinci Resolve.",
			q: 1,
			p: 850
		}
	],
	dop: [{
		nome: "Giornata come direttore della fotografia",
		desc: "Direzione della fotografia in troupe già strutturata, fino a 10 ore. Attrezzatura non inclusa.",
		q: 1,
		p: 450
	}, {
		nome: "Giornata come operatore di macchina",
		desc: "Operatore con propria attrezzatura camera, fino a 10 ore.",
		q: 1,
		p: 350
	}]
};
var PREF_KEYS = {
	theme: "fc_theme_v2",
	signature: "fc_firma_autografa",
	splitPreview: "fc_split_preview_v2",
	localCacheQuotes: "fc_preventivi_v1",
	localCacheClients: "fc_clienti_v1",
	localCachePriceList: "fc_listino_v1",
	localCacheIssuer: "fc_dati_personali_v1"
};
var REGIMI_PIVA = /* @__PURE__ */ new Set([
	"forf5",
	"forf15",
	"ordinario"
]);
var REGIMI_BOLLO = /* @__PURE__ */ new Set([
	"forf5",
	"forf15",
	"occasionale"
]);
function round2(val) {
	const num = Number(val);
	if (!Number.isFinite(num)) return 0;
	return Math.round((num + Number.EPSILON) * 100) / 100;
}
/**
* Calcola tutti gli importi fiscali del preventivo da un oggetto puro.
* Supporta sconto in Euro ('euro') oppure percentuale ('perc').
*/
function calcolaTotali(quote = {}) {
	const q = quote && typeof quote === "object" ? quote : {};
	const imponibile = round2((Array.isArray(q.voci) ? q.voci : []).reduce((sum, v) => {
		return sum + Math.max(0, Number(v?.q) || 0) * Math.max(0, Number(v?.p) || 0);
	}, 0));
	const scontoTipo = q.scontoTipo === "perc" || q.progetto?.scontoTipo === "perc" ? "perc" : "euro";
	const rawScontoValore = q.scontoValore !== void 0 && q.scontoValore !== null ? Number(q.scontoValore) : q.progetto?.scontoValore !== void 0 && q.progetto?.scontoValore !== null ? Number(q.progetto.scontoValore) : Number(q.sconto);
	const scontoValore = Number.isFinite(rawScontoValore) ? Math.max(0, rawScontoValore) : 0;
	let scontoLordo = 0;
	if (scontoTipo === "perc") scontoLordo = round2(imponibile * Math.min(100, Math.max(0, scontoValore)) / 100);
	else scontoLordo = round2(scontoValore);
	const sconto = round2(Math.min(imponibile, scontoLordo));
	const base = round2(Math.max(0, imponibile - sconto));
	const regime = String(q.regime || "occasionale");
	const haPartitaIva = REGIMI_PIVA.has(regime);
	const rivPerc = haPartitaIva ? Math.min(100, Math.max(0, Number(q.rivalsa) || 0)) : 0;
	const rivalsa = round2(base * rivPerc / 100);
	const imponibileIva = round2(base + rivalsa);
	const ivaPerc = regime === "ordinario" ? Math.min(100, Math.max(0, Number(q.iva) || 0)) : 0;
	const iva = round2(imponibileIva * ivaPerc / 100);
	const bolloFlag = String(q.bollo || "auto");
	const bollo = REGIMI_BOLLO.has(regime) && bolloFlag !== "no" && imponibileIva > 77.47 ? 2 : 0;
	const ritPerc = regime === "occasionale" || regime === "ordinario" ? Math.min(100, Math.max(0, Number(q.ritenuta) || 0)) : 0;
	const ritenuta = round2((rivPerc === 2 ? base : round2(base + rivalsa)) * ritPerc / 100);
	const totaleDoc = round2(imponibileIva + iva + bollo);
	const netto = round2(totaleDoc - ritenuta);
	return {
		regime,
		haPartitaIva,
		imponibile,
		scontoTipo,
		scontoValore,
		scontoLordo,
		sconto,
		base,
		rivPerc,
		rivalsa,
		imponibileIva,
		ivaPerc,
		iva,
		bollo,
		ritPerc,
		ritenuta,
		totaleDoc,
		netto
	};
}
/**
* Dicitura fiscale legale completa per Preventivo e Proforma / Nota di prestazione.
*/
function dicituraFiscale(t) {
	if (!t || t.regime === "nessuno") return "";
	const parti = [];
	if (t.regime === "occasionale") {
		parti.push("Prestazione occasionale ai sensi dell'art. 67, comma 1, lett. l) del D.P.R. 917/1986, priva del carattere di abitualità.");
		if (t.ritPerc > 0) parti.push(`Compenso soggetto a ritenuta d'acconto del ${t.ritPerc}% ai sensi dell'art. 25 del D.P.R. 600/1973, versata dal committente in qualità di sostituto d'imposta.`);
		parti.push("Operazione fuori campo IVA ai sensi dell'art. 5 del D.P.R. 633/1972.");
		if (t.bollo > 0) parti.push("Imposta di bollo di € 2,00 assolta sull'originale per importi superiori a € 77,47, a carico del committente.");
	} else if (t.regime === "forf5" || t.regime === "forf15") {
		parti.push("Operazione effettuata ai sensi dell'art. 1, commi da 54 a 89, della Legge 190/2014 e successive modificazioni — regime forfettario. Imposta non applicata.");
		parti.push("Si richiede la non applicazione della ritenuta d'acconto ai sensi dell'art. 1, comma 67, della Legge 190/2014.");
		if (t.bollo > 0) parti.push("Imposta di bollo di € 2,00 assolta sull'originale per importi superiori a € 77,47, a carico del committente.");
	} else if (t.regime === "ordinario") {
		if (t.ivaPerc > 0) parti.push(`Operazione soggetta a IVA con aliquota del ${t.ivaPerc}%.`);
		else parti.push("Operazione non imponibile o esente ai fini IVA.");
		if (t.ritPerc > 0) parti.push(`Compenso soggetto a ritenuta d'acconto del ${t.ritPerc}% a titolo di acconto IRPEF ai sensi dell'art. 25 del D.P.R. 600/1973, operata dal committente in qualità di sostituto d'imposta.`);
	}
	if (t.rivPerc === 4) parti.push("Rivalsa INPS Gestione Separata del 4% ai sensi dell'art. 1, comma 212, della Legge 662/1996.");
	else if (t.rivPerc === 2) parti.push("Contributo integrativo di cassa del 2%, non soggetto a ritenuta d'acconto.");
	return parti.join(" ");
}
/**
* Stima ingombro stampa A4 per decidere tra layout 2 pagine pulite (brevi)
* e flusso continuo multi-pagina intelligente (articolati, 5+ voci o descrizioni estese).
*/
function stimaIngombroStampa(quote) {
	const voci = Array.isArray(quote?.voci) ? quote.voci : [];
	let righeVoci = 0;
	for (const v of voci) {
		const descLen = String(v?.desc || "").trim().length;
		const righeDesc = descLen > 0 ? Math.ceil(descLen / 72) : 0;
		righeVoci += 1.9 + righeDesc;
	}
	const introLen = String(quote?.progetto?.intro || "").trim().length;
	const extraIntro = introLen > 240 ? Math.ceil((introLen - 240) / 105) : 0;
	const ingombroP1 = righeVoci + extraIntro;
	const pagina1Compatta = voci.length <= 4 && ingombroP1 <= 16;
	return {
		totVoci: voci.length,
		ingombroP1,
		pagina1Compatta
	};
}
// src/js/formatters.js
/**
* Utility pure di formattazione, sanitizzazione HTML (anti-XSS) e nomi file.
*/
function euro(n) {
	const num = Number(n);
	return `€\u00A0${(Number.isFinite(num) ? num : 0).toLocaleString("it-IT", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
function aIsoLocale(date = /* @__PURE__ */ new Date()) {
	const d = date instanceof Date ? date : new Date(date);
	if (Number.isNaN(d.getTime())) {
		const now = /* @__PURE__ */ new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	}
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function aggiungiGiorni(isoDate, giorni = 30) {
	if (!isoDate) return "";
	const parts = String(isoDate).split("-").map(Number);
	if (parts.length !== 3 || parts.some(Number.isNaN)) return "";
	const d = new Date(parts[0], parts[1] - 1, parts[2]);
	d.setDate(d.getDate() + giorni);
	return aIsoLocale(d);
}
function dataIt(iso) {
	if (!iso) return "";
	const str = String(iso).trim();
	const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (!match) return str;
	const mesi = [
		"gennaio",
		"febbraio",
		"marzo",
		"aprile",
		"maggio",
		"giugno",
		"luglio",
		"agosto",
		"settembre",
		"ottobre",
		"novembre",
		"dicembre"
	];
	const anno = match[1];
	const mese = mesi[parseInt(match[2], 10) - 1] || match[2];
	return `${parseInt(match[3], 10)} ${mese} ${anno}`;
}
function dataBreve(iso) {
	if (!iso) return "—";
	const str = String(iso).trim();
	const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (!match) return str;
	return `${match[3]}/${match[2]}/${match[1]}`;
}
function maiuscola(s) {
	const str = String(s || "").trim();
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function esc(s) {
	return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function normalizzaChiave(s) {
	return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}
function sanitizzaNomeFile(str) {
	return String(str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
}
function nomeFileDocumento(tipo, quote) {
	const num = sanitizzaNomeFile(quote?.numero || "Preventivo");
	const cl = sanitizzaNomeFile(quote?.cliente?.nome || "");
	return `${[
		"FC",
		sanitizzaNomeFile(tipo || "Preventivo"),
		num,
		cl
	].filter(Boolean).join("_")}.pdf`;
}
function generaId(prefisso = "p") {
	return `${prefisso}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`.slice(0, 64);
}
// src/js/validator.js
/**
* Validazione, sanificazione, numerazione progressiva sicura e serializzazione
* strettamente conforme a /firestore.rules (zero chiavi non consentite, zero array annidati).
*/
var ALLOWED_QUOTE_FIELDS = [
	"id",
	"numero",
	"data",
	"validita",
	"stato",
	"cliente",
	"progetto",
	"voci",
	"sconto",
	"sconto_txt",
	"regime",
	"ritenuta",
	"rivalsa",
	"iva",
	"bollo",
	"incluso",
	"escluso",
	"opzioni",
	"condizioni",
	"io",
	"totale",
	"modificato",
	"driveFileId",
	"driveUrl",
	"driveSavedAt",
	"cestinato",
	"eliminatoIl",
	"annullamento"
];
var ALLOWED_CLIENT_FIELDS = [
	"id",
	"nome",
	"ref",
	"indirizzo",
	"piva",
	"cf",
	"sdi",
	"pec",
	"email",
	"tel",
	"note",
	"creato",
	"modificato"
];
var ALLOWED_PRICE_ITEM_FIELDS = [
	"id",
	"cat",
	"nome",
	"desc",
	"unita",
	"prezzo",
	"ordine",
	"attivo",
	"creato",
	"modificato"
];
var VALID_STATUSES = /* @__PURE__ */ new Set([
	"bozza",
	"inviato",
	"accettato",
	"rifiutato",
	"annullato"
]);
function normalizeConditionItem(cond) {
	if (Array.isArray(cond)) return {
		titolo: String(cond[0] || ""),
		testo: String(cond[1] || "")
	};
	if (cond && typeof cond === "object") return {
		titolo: String(cond.titolo ?? cond.nome ?? ""),
		testo: String(cond.testo ?? cond.desc ?? "")
	};
	return {
		titolo: String(cond || ""),
		testo: ""
	};
}
/**
* Calcola il prossimo numero progressivo dell'anno corrente (es. 2026-001)
* esaminando TUTTI i preventivi (inclusi quelli cestinati) per impedire collisioni.
*/
function prossimoNumero(allQuotes = [], year = (/* @__PURE__ */ new Date()).getFullYear()) {
	const prefix = `${year}-`;
	let max = 0;
	for (const q of Array.isArray(allQuotes) ? allQuotes : []) {
		const numStr = String(q?.numero || "").trim();
		if (numStr.startsWith(prefix)) {
			const tail = numStr.slice(prefix.length);
			const parsed = parseInt(tail, 10);
			if (Number.isFinite(parsed) && parsed > max) max = parsed;
		}
	}
	return `${prefix}${String(max + 1).padStart(3, "0")}`;
}
/**
* Crea un preventivo nuovo pulito (bozza non ancora persistita in Firestore fino alla prima modifica).
*/
function creaPreventivoVuoto({ allQuotes = [], issuer = {} } = {}) {
	const oggi = aIsoLocale(/* @__PURE__ */ new Date());
	return sanificaPreventivo({
		id: generaId("p"),
		numero: prossimoNumero(allQuotes),
		data: oggi,
		validita: aggiungiGiorni(oggi, 30),
		stato: "bozza",
		cliente: {
			clienteId: "",
			nome: "",
			ref: "",
			indirizzo: "",
			piva: "",
			cf: "",
			sdi: "",
			pec: "",
			email: "",
			tel: ""
		},
		progetto: {
			titolo: "",
			tipo: "",
			luogo: "",
			giornate: "",
			consegna: "",
			saluto: "Gentile Cliente,",
			intro: "",
			scontoTipo: "euro",
			scontoValore: 0
		},
		voci: [{
			nome: "",
			desc: "",
			q: 1,
			p: 0
		}],
		sconto: 0,
		scontoTipo: "euro",
		scontoValore: 0,
		sconto_txt: "",
		regime: "occasionale",
		ritenuta: 20,
		rivalsa: 0,
		iva: 22,
		bollo: "auto",
		incluso: [...INCLUSO_STD],
		escluso: [...ESCLUSO_STD],
		opzioni: [],
		condizioni: CONDIZIONI_STD.map((c) => ({ ...c })),
		io: {
			cf: String(issuer?.cf || ""),
			piva: String(issuer?.piva || ""),
			iban: String(issuer?.iban || ""),
			indirizzo: String(issuer?.indirizzo || "")
		},
		totale: 0,
		cestinato: false,
		eliminatoIl: null,
		modificato: (/* @__PURE__ */ new Date()).toISOString()
	});
}
/**
* Sanifica e idrata un preventivo da qualsiasi sorgente (Firestore, JSON import, stato locale).
*/
function sanificaPreventivo(raw = {}) {
	const d = raw && typeof raw === "object" ? raw : {};
	const idClean = String(d.id || generaId("p")).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || generaId("p");
	const oggi = aIsoLocale(/* @__PURE__ */ new Date());
	const dataStr = String(d.data || "").trim();
	const safeData = dataStr.length >= 8 && dataStr.length <= 32 ? dataStr : oggi;
	const rawCliente = d.cliente && typeof d.cliente === "object" ? d.cliente : {};
	const rawProgetto = d.progetto && typeof d.progetto === "object" ? d.progetto : {};
	const rawIo = d.io && typeof d.io === "object" ? d.io : {};
	const scontoTipo = d.scontoTipo === "perc" || rawProgetto.scontoTipo === "perc" ? "perc" : "euro";
	const rawScontoVal = d.scontoValore !== void 0 && d.scontoValore !== null ? Number(d.scontoValore) : rawProgetto.scontoValore !== void 0 && rawProgetto.scontoValore !== null ? Number(rawProgetto.scontoValore) : Number(d.sconto);
	const scontoValore = Number.isFinite(rawScontoVal) ? Math.max(0, rawScontoVal) : 0;
	const voci = (Array.isArray(d.voci) ? d.voci : []).slice(0, 200).map((v) => ({
		nome: String(v?.nome ?? ""),
		desc: String(v?.desc ?? ""),
		q: Number.isFinite(Number(v?.q)) ? Math.max(0, Number(v.q)) : 1,
		p: Number.isFinite(Number(v?.p)) ? Math.max(0, Number(v.p)) : 0
	}));
	if (voci.length === 0) voci.push({
		nome: "",
		desc: "",
		q: 1,
		p: 0
	});
	const normalized = {
		id: idClean,
		numero: String(d.numero || "").trim().slice(0, 64) || `BOZZA_${idClean.slice(-4)}`,
		data: safeData,
		validita: String(d.validita || "").slice(0, 32),
		stato: VALID_STATUSES.has(d.stato) ? d.stato : "bozza",
		cliente: {
			clienteId: String(rawCliente.clienteId || d.clienteId || "").slice(0, 64),
			nome: String(rawCliente.nome || ""),
			ref: String(rawCliente.ref || ""),
			indirizzo: String(rawCliente.indirizzo || ""),
			piva: String(rawCliente.piva || ""),
			cf: String(rawCliente.cf || ""),
			sdi: String(rawCliente.sdi || ""),
			pec: String(rawCliente.pec || ""),
			email: String(rawCliente.email || ""),
			tel: String(rawCliente.tel || "")
		},
		progetto: {
			titolo: String(rawProgetto.titolo || ""),
			tipo: String(rawProgetto.tipo || ""),
			luogo: String(rawProgetto.luogo || ""),
			giornate: String(rawProgetto.giornate || ""),
			consegna: String(rawProgetto.consegna || ""),
			saluto: String(rawProgetto.saluto || ""),
			intro: String(rawProgetto.intro || ""),
			scontoTipo,
			scontoValore
		},
		voci,
		scontoTipo,
		scontoValore,
		sconto: 0,
		sconto_txt: String(d.sconto_txt || "").slice(0, 300),
		regime: String(d.regime || "occasionale").slice(0, 100),
		ritenuta: Number.isFinite(Number(d.ritenuta)) ? Math.min(100, Math.max(0, Number(d.ritenuta))) : 20,
		rivalsa: Number.isFinite(Number(d.rivalsa)) ? Math.min(100, Math.max(0, Number(d.rivalsa))) : 0,
		iva: Number.isFinite(Number(d.iva)) ? Math.min(100, Math.max(0, Number(d.iva))) : 22,
		bollo: String(d.bollo || "auto").slice(0, 50),
		incluso: (Array.isArray(d.incluso) ? d.incluso : []).slice(0, 100).map((x) => String(x || "")),
		escluso: (Array.isArray(d.escluso) ? d.escluso : []).slice(0, 100).map((x) => String(x || "")),
		opzioni: (Array.isArray(d.opzioni) ? d.opzioni : []).slice(0, 100).map((o) => ({
			nome: String(o?.nome || ""),
			desc: String(o?.desc || ""),
			p: Number.isFinite(Number(o?.p)) ? Math.max(0, Number(o.p)) : 0
		})),
		condizioni: (Array.isArray(d.condizioni) ? d.condizioni : []).slice(0, 100).map(normalizeConditionItem),
		io: {
			cf: String(rawIo.cf || ""),
			piva: String(rawIo.piva || ""),
			iban: String(rawIo.iban || ""),
			indirizzo: String(rawIo.indirizzo || "")
		},
		totale: 0,
		modificato: String(d.modificato || (/* @__PURE__ */ new Date()).toISOString()).slice(0, 64),
		cestinato: Boolean(d.cestinato),
		eliminatoIl: d.eliminatoIl ? String(d.eliminatoIl).slice(0, 64) : null
	};
	if (d.driveFileId) normalized.driveFileId = String(d.driveFileId).slice(0, 128);
	if (d.driveUrl) normalized.driveUrl = String(d.driveUrl).slice(0, 500);
	if (d.driveSavedAt) normalized.driveSavedAt = String(d.driveSavedAt).slice(0, 64);
	if (d.annullamento && typeof d.annullamento === "object" && !Array.isArray(d.annullamento)) normalized.annullamento = {
		data: String(d.annullamento.data || ""),
		nota: String(d.annullamento.nota || "")
	};
	const calc = calcolaTotali(normalized);
	normalized.sconto = calc.sconto;
	normalized.totale = calc.netto;
	return normalized;
}
/**
* Serializza un preventivo garantendo conformità 100% con /firestore.rules:
* - Solo le 28 chiavi nella whitelist (zero chiavi top-level sconosciute)
* - cliente map ≤ 15 chiavi (10 chiavi)
* - progetto map ≤ 15 chiavi (9 chiavi, include scontoTipo e scontoValore)
* - sconto top-level sempre numerico >= 0 (importo in Euro)
* - condizioni sempre list di mappe { titolo, testo } (mai nested array)
* - annullamento omesso se non è una mappa valida (mai null!)
*/
function serializeQuoteForFirestore(raw) {
	const q = sanificaPreventivo(raw);
	const calc = calcolaTotali(q);
	const candidate = {
		id: q.id,
		numero: q.numero,
		data: q.data,
		validita: q.validita,
		stato: q.stato,
		cliente: {
			clienteId: q.cliente.clienteId,
			nome: q.cliente.nome,
			ref: q.cliente.ref,
			indirizzo: q.cliente.indirizzo,
			piva: q.cliente.piva,
			cf: q.cliente.cf,
			sdi: q.cliente.sdi,
			pec: q.cliente.pec,
			email: q.cliente.email,
			tel: q.cliente.tel
		},
		progetto: {
			titolo: q.progetto.titolo,
			tipo: q.progetto.tipo,
			luogo: q.progetto.luogo,
			giornate: q.progetto.giornate,
			consegna: q.progetto.consegna,
			saluto: q.progetto.saluto,
			intro: q.progetto.intro,
			scontoTipo: q.scontoTipo,
			scontoValore: q.scontoValore
		},
		voci: q.voci.slice(0, 200).map((v) => ({
			nome: String(v.nome || ""),
			desc: String(v.desc || ""),
			q: Math.max(0, Number(v.q) || 0),
			p: Math.max(0, Number(v.p) || 0)
		})),
		sconto: Math.max(0, calc.sconto),
		sconto_txt: q.sconto_txt.slice(0, 300),
		regime: q.regime.slice(0, 100),
		ritenuta: Math.min(100, Math.max(0, Number(q.ritenuta) || 0)),
		rivalsa: Math.min(100, Math.max(0, Number(q.rivalsa) || 0)),
		iva: Math.min(100, Math.max(0, Number(q.iva) || 0)),
		bollo: q.bollo.slice(0, 50),
		incluso: q.incluso.slice(0, 100).map((x) => String(x || "")),
		escluso: q.escluso.slice(0, 100).map((x) => String(x || "")),
		opzioni: q.opzioni.slice(0, 100).map((o) => ({
			nome: String(o.nome || ""),
			desc: String(o.desc || ""),
			p: Math.max(0, Number(o.p) || 0)
		})),
		condizioni: q.condizioni.slice(0, 100).map((c) => ({
			titolo: String(c.titolo || ""),
			testo: String(c.testo || "")
		})),
		io: {
			cf: q.io.cf,
			piva: q.io.piva,
			iban: q.io.iban,
			indirizzo: q.io.indirizzo
		},
		totale: calc.netto,
		modificato: String(q.modificato || (/* @__PURE__ */ new Date()).toISOString()).slice(0, 64),
		cestinato: Boolean(q.cestinato),
		eliminatoIl: q.cestinato ? String(q.eliminatoIl || (/* @__PURE__ */ new Date()).toISOString()).slice(0, 64) : null
	};
	if (q.driveFileId) candidate.driveFileId = q.driveFileId.slice(0, 128);
	if (q.driveUrl) candidate.driveUrl = q.driveUrl.slice(0, 500);
	if (q.driveSavedAt) candidate.driveSavedAt = q.driveSavedAt.slice(0, 64);
	if (q.annullamento && typeof q.annullamento === "object" && !Array.isArray(q.annullamento)) candidate.annullamento = {
		data: String(q.annullamento.data || ""),
		nota: String(q.annullamento.nota || "")
	};
	const safe = {};
	for (const key of ALLOWED_QUOTE_FIELDS) if (candidate[key] !== void 0) safe[key] = candidate[key];
	return safe;
}
function deserializeQuoteFromFirestore(docData) {
	return sanificaPreventivo(docData);
}
/**
* Serializza un cliente rispettando al 100% /firestore.rules (/clienti/{id}).
*/
function serializeClientForFirestore(raw) {
	if (!raw || typeof raw !== "object") return null;
	const nome = String(raw.nome || "").trim().slice(0, 200);
	if (!nome) return null;
	const id = String(raw.id || generaId("cli")).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || generaId("cli");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const candidate = {
		id,
		nome,
		ref: String(raw.ref || "").trim().slice(0, 200),
		indirizzo: String(raw.indirizzo || "").trim().slice(0, 300),
		piva: String(raw.piva || "").trim().slice(0, 50),
		cf: String(raw.cf || "").trim().slice(0, 50),
		sdi: String(raw.sdi || "").trim().slice(0, 20),
		pec: String(raw.pec || "").trim().slice(0, 150),
		email: String(raw.email || "").trim().slice(0, 150),
		tel: String(raw.tel || "").trim().slice(0, 50),
		note: String(raw.note || "").trim().slice(0, 2e3),
		creato: String(raw.creato || now).slice(0, 64),
		modificato: String(raw.modificato || now).slice(0, 64)
	};
	const safe = {};
	for (const key of ALLOWED_CLIENT_FIELDS) safe[key] = candidate[key];
	return safe;
}
/**
* Serializza una voce di listino rispettando al 100% /firestore.rules (/listino/{id}).
*/
function serializePriceItemForFirestore(raw, fallbackOrder = 999) {
	if (!raw || typeof raw !== "object") return null;
	const nome = String(raw.nome || "").trim().slice(0, 200);
	if (!nome) return null;
	const id = String(raw.id || generaId("voc")).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || generaId("voc");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const candidate = {
		id,
		cat: String(raw.cat || "").trim().slice(0, 100),
		nome,
		desc: String(raw.desc || "").trim().slice(0, 1e3),
		unita: String(raw.unita || "forfait").trim().slice(0, 50),
		prezzo: Number.isFinite(Number(raw.prezzo)) ? Math.max(0, Number(raw.prezzo)) : 0,
		ordine: Number.isFinite(Number(raw.ordine)) ? Number(raw.ordine) : fallbackOrder,
		attivo: raw.attivo !== false,
		creato: String(raw.creato || now).slice(0, 64),
		modificato: String(raw.modificato || now).slice(0, 64)
	};
	const safe = {};
	for (const key of ALLOWED_PRICE_ITEM_FIELDS) safe[key] = candidate[key];
	return safe;
}
/**
* Verifica qualità del preventivo su 3 livelli (errori bloccanti, avvisi, suggerimenti).
*/
function verificaPreventivo(quote, allQuotes = []) {
	const q = sanificaPreventivo(quote);
	const t = calcolaTotali(q);
	const errori = [];
	const avvisi = [];
	const suggerimenti = [];
	if (!q.numero.trim()) errori.push("Manca il numero del preventivo.");
	else if ((Array.isArray(allQuotes) ? allQuotes : []).find((x) => !x.cestinato && x.id !== q.id && String(x.numero || "").trim() === q.numero.trim())) errori.push(`Il numero preventivo «${q.numero}» è già utilizzato in archivio.`);
	if (!q.data) errori.push("Manca la data di emissione.");
	if (!q.cliente.nome.trim()) errori.push("Inserisci il nome o ragione sociale del cliente.");
	if (!q.progetto.titolo.trim()) errori.push("Inserisci il titolo del progetto.");
	if (q.voci.filter((v) => v.nome.trim() || v.p > 0).length === 0) errori.push("Aggiungi almeno una voce di preventivo.");
	if (t.imponibile <= 0) errori.push("L'imponibile totale è € 0,00.");
	if (t.scontoLordo > t.imponibile && t.imponibile > 0) errori.push("Lo sconto supera l'imponibile totale.");
	if (q.data && q.validita && q.validita < q.data) avvisi.push("La data di validità è anteriore alla data di emissione.");
	if (q.regime === "occasionale" && t.netto > 5e3) avvisi.push("Importo superiore a € 5.000 in prestazione occasionale: verificare l'obbligo di iscrizione Gestione Separata INPS.");
	if (t.haPartitaIva && !q.io.piva.trim()) avvisi.push("Regime con Partita IVA selezionato, ma manca la tua P. IVA nei dati emittente.");
	if (!q.io.cf.trim()) avvisi.push("Manca il tuo Codice Fiscale nei dati emittente (necessario per la Proforma/Nota).");
	if (!q.io.iban.trim()) suggerimenti.push("Inserisci l'IBAN nei dati emittente per completare la Proforma/Nota.");
	if (!q.cliente.email.trim()) suggerimenti.push("Aggiungi l'email del cliente per facilitare l'invio e il CRM.");
	if (!q.cliente.piva.trim() && !q.cliente.cf.trim()) suggerimenti.push("Aggiungi P. IVA o C.F. del cliente per la successiva fatturazione.");
	if (q.voci.some((v) => v.nome.trim() && v.p === 0)) avvisi.push("Una o più voci hanno importo unitario pari a € 0,00.");
	return {
		errori,
		avvisi,
		suggerimenti,
		valido: errori.length === 0
	};
}
/**
* Valida un payload JSON importato (singolo preventivo oppure backup completo).
*/
function validaImportJSON(parsed) {
	if (!parsed || typeof parsed !== "object") return {
		ok: false,
		error: "Il file JSON non contiene un oggetto valido."
	};
	if (Array.isArray(parsed.preventivi)) return {
		ok: true,
		type: "backup",
		preventivi: parsed.preventivi.map((p) => sanificaPreventivo(p)),
		clienti: Array.isArray(parsed.clienti) ? parsed.clienti.map((c) => serializeClientForFirestore(c)).filter(Boolean) : [],
		listino: Array.isArray(parsed.listino) ? parsed.listino.map((v, i) => serializePriceItemForFirestore(v, i + 1)).filter(Boolean) : [],
		io: parsed.io && typeof parsed.io === "object" ? parsed.io : null
	};
	if (Array.isArray(parsed.voci) || parsed.cliente && typeof parsed.cliente === "object" || parsed.progetto && typeof parsed.progetto === "object") return {
		ok: true,
		type: "single",
		quote: sanificaPreventivo(parsed)
	};
	return {
		ok: false,
		error: "Formato JSON non riconosciuto: deve contenere un preventivo valido o un backup completo."
	};
}
// src/js/store.js
/**
* Store reattivo centrale (Single Source of Truth) — addio DOM-as-Source-of-Truth.
* Gestisce stato preventivo corrente, archivio, clienti, listino, impostazioni,
* viste UI e stack Undo/Redo esclusivamente strutturale (non interferisce con Ctrl+Z nei campi testo).
*/
function deepClone(obj) {
	if (typeof structuredClone === "function") return structuredClone(obj);
	return JSON.parse(JSON.stringify(obj));
}
function readLocalJson(key, fallback) {
	try {
		if (typeof localStorage === "undefined") return fallback;
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
function writeLocalJson(key, value) {
	try {
		if (typeof localStorage === "undefined") return;
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
function getInitialTheme() {
	try {
		const saved = localStorage.getItem(PREF_KEYS.theme);
		if (saved === "dark" || saved === "light") return saved;
		if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
	} catch {}
	return "light";
}
function getInitialSignature() {
	try {
		return localStorage.getItem(PREF_KEYS.signature) !== "false";
	} catch {
		return true;
	}
}
var initialIssuer = readLocalJson(PREF_KEYS.localCacheIssuer, {
	cf: "",
	piva: "",
	iban: "",
	indirizzo: ""
});
var initialQuotes = (readLocalJson(PREF_KEYS.localCacheQuotes, []) || []).filter((x) => x && typeof x === "object").map((x) => sanificaPreventivo(x));
var initialClients = (readLocalJson(PREF_KEYS.localCacheClients, []) || []).filter((x) => x && typeof x === "object" && x.id);
var initialPriceList = (readLocalJson(PREF_KEYS.localCachePriceList, []) || []).filter((x) => x && typeof x === "object" && x.nome);
var MAX_STRUCTURAL_HISTORY = 30;
var state = {
	user: null,
	activeView: "editor",
	splitPreviewOpen: false,
	syncStatus: "saved",
	syncMessage: "",
	theme: getInitialTheme(),
	signatureEnabled: getInitialSignature(),
	issuer: {
		cf: String(initialIssuer.cf || ""),
		piva: String(initialIssuer.piva || ""),
		iban: String(initialIssuer.iban || ""),
		indirizzo: String(initialIssuer.indirizzo || "")
	},
	quotes: initialQuotes,
	clients: initialClients,
	priceList: initialPriceList,
	currentQuote: creaPreventivoVuoto({
		allQuotes: initialQuotes,
		issuer: initialIssuer
	}),
	isDraftPersisted: false,
	structuralPast: [],
	structuralFuture: [],
	archiveViewMode: "cronologico",
	archiveStatusFilter: "tutti",
	archiveSort: "modificato_desc",
	archiveSearch: "",
	selectedArchiveIds: /* @__PURE__ */ new Set(),
	openClientGroups: /* @__PURE__ */ new Set(),
	clientSearch: "",
	priceListSearch: ""
};
var listeners = /* @__PURE__ */ new Set();
function emit(scope = "all", meta = {}) {
	for (const fn of listeners) try {
		fn(state, scope, meta);
	} catch (err) {
		console.error("[Store] Errore listener:", err);
	}
}
function subscribe(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
function getState() {
	return state;
}
function getActiveQuotes() {
	return state.quotes.filter((q) => !q.cestinato);
}
function getTrashedQuotes() {
	return state.quotes.filter((q) => Boolean(q.cestinato));
}
function hasQuoteMeaningfulContent(q) {
	if (!q) return false;
	if (String(q.cliente?.nome || "").trim()) return true;
	if (String(q.progetto?.titolo || "").trim()) return true;
	return (Array.isArray(q.voci) ? q.voci : []).some((v) => String(v?.nome || "").trim().length > 0 || Number(v?.p) > 0);
}
function captureStructuralSnapshot(quote) {
	return {
		voci: deepClone(quote.voci),
		opzioni: deepClone(quote.opzioni),
		incluso: deepClone(quote.incluso),
		escluso: deepClone(quote.escluso),
		condizioni: deepClone(quote.condizioni)
	};
}
function recomputeCurrentTotals() {
	const t = calcolaTotali(state.currentQuote);
	state.currentQuote.sconto = t.sconto;
	state.currentQuote.totale = t.netto;
	state.currentQuote.progetto.scontoTipo = state.currentQuote.scontoTipo;
	state.currentQuote.progetto.scontoValore = state.currentQuote.scontoValore;
	return t;
}
var actions = {
	setUser(user) {
		state.user = user;
		emit("auth");
	},
	setActiveView(view) {
		if (![
			"editor",
			"archivio",
			"clienti",
			"listino"
		].includes(view)) return;
		state.activeView = view;
		emit("view");
	},
	setSplitPreviewOpen(open) {
		state.splitPreviewOpen = Boolean(open);
		try {
			localStorage.setItem(PREF_KEYS.splitPreview, state.splitPreviewOpen ? "1" : "0");
		} catch {}
		emit("splitPreview");
	},
	toggleSplitPreview() {
		actions.setSplitPreviewOpen(!state.splitPreviewOpen);
	},
	setSyncStatus(status, message = "") {
		state.syncStatus = status;
		state.syncMessage = message;
		emit("sync");
	},
	setTheme(theme) {
		state.theme = theme === "dark" ? "dark" : "light";
		try {
			localStorage.setItem(PREF_KEYS.theme, state.theme);
		} catch {}
		emit("theme");
	},
	toggleTheme() {
		actions.setTheme(state.theme === "dark" ? "light" : "dark");
	},
	setSignatureEnabled(enabled) {
		state.signatureEnabled = Boolean(enabled);
		try {
			localStorage.setItem(PREF_KEYS.signature, state.signatureEnabled ? "true" : "false");
		} catch {}
		emit("signature");
	},
	setIssuer(issuer, { persistCache = true } = {}) {
		state.issuer = {
			cf: String(issuer?.cf || ""),
			piva: String(issuer?.piva || ""),
			iban: String(issuer?.iban || ""),
			indirizzo: String(issuer?.indirizzo || "")
		};
		state.currentQuote.io = { ...state.issuer };
		if (persistCache) writeLocalJson(PREF_KEYS.localCacheIssuer, state.issuer);
		emit("issuer");
	},
	setQuotes(quotes, { persistCache = true } = {}) {
		const clean = (Array.isArray(quotes) ? quotes : []).map((q) => sanificaPreventivo(q));
		state.quotes = clean;
		if (persistCache) writeLocalJson(PREF_KEYS.localCacheQuotes, clean);
		if (state.currentQuote?.id && clean.some((q) => q.id === state.currentQuote.id)) state.isDraftPersisted = true;
		const existingIds = new Set(clean.map((q) => q.id));
		for (const id of [...state.selectedArchiveIds]) if (!existingIds.has(id)) state.selectedArchiveIds.delete(id);
		emit("quotes");
	},
	upsertQuoteInList(quote) {
		const clean = sanificaPreventivo(quote);
		const idx = state.quotes.findIndex((q) => q.id === clean.id);
		if (idx >= 0) state.quotes[idx] = clean;
		else state.quotes.unshift(clean);
		if (state.currentQuote?.id === clean.id) state.isDraftPersisted = true;
		writeLocalJson(PREF_KEYS.localCacheQuotes, state.quotes);
		emit("quotes");
	},
	removeQuotesFromList(ids) {
		const idSet = new Set(ids);
		state.quotes = state.quotes.filter((q) => !idSet.has(q.id));
		for (const id of idSet) state.selectedArchiveIds.delete(id);
		writeLocalJson(PREF_KEYS.localCacheQuotes, state.quotes);
		emit("quotes");
	},
	setClients(clients, { persistCache = true } = {}) {
		state.clients = Array.isArray(clients) ? clients : [];
		if (persistCache) writeLocalJson(PREF_KEYS.localCacheClients, state.clients);
		emit("clients");
	},
	setPriceList(items, { persistCache = true } = {}) {
		const sorted = (Array.isArray(items) ? items : []).slice().sort((a, b) => (Number(a.ordine) || 999) - (Number(b.ordine) || 999) || String(a.nome || "").localeCompare(String(b.nome || ""), "it"));
		state.priceList = sorted;
		if (persistCache) writeLocalJson(PREF_KEYS.localCachePriceList, sorted);
		emit("priceList");
	},
	/**
	* Carica un preventivo nell'editor (nuovo o esistente), azzerando lo stack strutturale.
	*/
	loadQuoteIntoEditor(quote, { persisted = true } = {}) {
		const clean = sanificaPreventivo(quote);
		if (!clean.io.cf && state.issuer.cf) clean.io.cf = state.issuer.cf;
		if (!clean.io.piva && state.issuer.piva) clean.io.piva = state.issuer.piva;
		if (!clean.io.iban && state.issuer.iban) clean.io.iban = state.issuer.iban;
		if (!clean.io.indirizzo && state.issuer.indirizzo) clean.io.indirizzo = state.issuer.indirizzo;
		state.currentQuote = clean;
		state.isDraftPersisted = persisted;
		state.structuralPast = [];
		state.structuralFuture = [];
		recomputeCurrentTotals();
		emit("quoteLoaded");
	},
	newQuote(prefillCliente = null) {
		const fresh = creaPreventivoVuoto({
			allQuotes: state.quotes,
			issuer: state.issuer
		});
		if (prefillCliente && typeof prefillCliente === "object") {
			fresh.cliente = {
				clienteId: String(prefillCliente.id || prefillCliente.clienteId || ""),
				nome: String(prefillCliente.nome || ""),
				ref: String(prefillCliente.ref || ""),
				indirizzo: String(prefillCliente.indirizzo || ""),
				piva: String(prefillCliente.piva || ""),
				cf: String(prefillCliente.cf || ""),
				sdi: String(prefillCliente.sdi || ""),
				pec: String(prefillCliente.pec || ""),
				email: String(prefillCliente.email || ""),
				tel: String(prefillCliente.tel || "")
			};
			if (prefillCliente.ref) fresh.progetto.saluto = `Gentile ${prefillCliente.ref},`;
		}
		actions.loadQuoteIntoEditor(fresh, { persisted: false });
	},
	/**
	* Mutazione su campi scalari del preventivo corrente (typing in input/select).
	* NON tocca lo stack Undo/Redo strutturale così Ctrl+Z nativo del browser resta intatto!
	*/
	updateCurrentQuote(mutatorFn, { triggerAutosave = true, structural = false } = {}) {
		if (structural) {
			state.structuralPast.push(captureStructuralSnapshot(state.currentQuote));
			if (state.structuralPast.length > MAX_STRUCTURAL_HISTORY) state.structuralPast.shift();
			state.structuralFuture = [];
		}
		mutatorFn(state.currentQuote);
		state.currentQuote.modificato = (/* @__PURE__ */ new Date()).toISOString();
		recomputeCurrentTotals();
		emit(structural ? "quoteStructural" : "quoteField", { triggerAutosave });
	},
	undoStructural() {
		if (state.structuralPast.length === 0) return false;
		state.structuralFuture.push(captureStructuralSnapshot(state.currentQuote));
		const prev = state.structuralPast.pop();
		state.currentQuote.voci = prev.voci;
		state.currentQuote.opzioni = prev.opzioni;
		state.currentQuote.incluso = prev.incluso;
		state.currentQuote.escluso = prev.escluso;
		state.currentQuote.condizioni = prev.condizioni;
		state.currentQuote.modificato = (/* @__PURE__ */ new Date()).toISOString();
		recomputeCurrentTotals();
		emit("quoteStructural", { triggerAutosave: true });
		return true;
	},
	redoStructural() {
		if (state.structuralFuture.length === 0) return false;
		state.structuralPast.push(captureStructuralSnapshot(state.currentQuote));
		const next = state.structuralFuture.pop();
		state.currentQuote.voci = next.voci;
		state.currentQuote.opzioni = next.opzioni;
		state.currentQuote.incluso = next.incluso;
		state.currentQuote.escluso = next.escluso;
		state.currentQuote.condizioni = next.condizioni;
		state.currentQuote.modificato = (/* @__PURE__ */ new Date()).toISOString();
		recomputeCurrentTotals();
		emit("quoteStructural", { triggerAutosave: true });
		return true;
	},
	setArchiveFilter(patch) {
		Object.assign(state, patch);
		if (patch.archiveStatusFilter !== void 0) state.selectedArchiveIds.clear();
		emit("archiveFilter");
	},
	toggleSelectArchiveId(id) {
		if (state.selectedArchiveIds.has(id)) state.selectedArchiveIds.delete(id);
		else state.selectedArchiveIds.add(id);
		emit("archiveSelection");
	},
	setSelectedArchiveIds(ids) {
		state.selectedArchiveIds = new Set(ids);
		emit("archiveSelection");
	},
	clearSelectedArchiveIds() {
		state.selectedArchiveIds.clear();
		emit("archiveSelection");
	},
	toggleClientGroup(key) {
		if (state.openClientGroups.has(key)) state.openClientGroups.delete(key);
		else state.openClientGroups.add(key);
		emit("archiveFilter");
	},
	setClientSearch(q) {
		state.clientSearch = String(q || "");
		emit("clientFilter");
	},
	setPriceListSearch(q) {
		state.priceListSearch = String(q || "");
		emit("priceListFilter");
	}
};
// \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep) {
	return "/" + dep;
};
var seen = {};
var isCssPreloadUrl = function isCssPreloadUrl(url) {
	return url.pathname.endsWith(".css");
};
var preloadOnce = function preloadOnce(seen, href, preload) {
	if (href in seen) return seen[href];
	const promise = preload();
	if (!promise) {
		seen[href] = void 0;
		return;
	}
	const preloadPromise = promise.then(() => {
		seen[href] = void 0;
	}, (err) => {
		seen[href] = void 0;
		throw err;
	});
	seen[href] = preloadPromise;
	return preloadPromise;
};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		let preloadedHrefs;
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		function importMetaResolve(specifier) {
			if (import.meta.resolve) return new URL(import.meta.resolve(specifier));
			return new URL(
				specifier,
				/** #__KEEP__ */
				import.meta.url
			);
		}
		promise = allSettled(deps.map((depString) => {
			depString = assetsURL(depString, importerUrl);
			const dep = importMetaResolve(depString);
			const isCss = isCssPreloadUrl(dep);
			return preloadOnce(seen, dep.href, () => {
				if (preloadedHrefs === void 0) {
					preloadedHrefs = {
						all: /* @__PURE__ */ new Set(),
						styles: /* @__PURE__ */ new Set()
					};
					const links = document.getElementsByTagName("link");
					for (let i = links.length - 1; i >= 0; i--) {
						const link = links[i];
						preloadedHrefs.all.add(link.href);
						if (link.rel === "stylesheet") preloadedHrefs.styles.add(link.href);
					}
				}
				if ((isCss ? preloadedHrefs.styles : preloadedHrefs.all).has(dep.href)) return;
				const link = document.createElement("link");
				link.rel = isCss ? "stylesheet" : scriptRel;
				if (!isCss) link.as = "script";
				link.crossOrigin = "";
				link.href = dep.href;
				if (cspNonce) link.setAttribute("nonce", cspNonce);
				document.head.appendChild(link);
				if (isCss) return new Promise((res, rej) => {
					const handleSettle = (e) => {
						link.removeEventListener("load", handleSettle);
						link.removeEventListener("error", handleSettle);
						if (e.type === "error") rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`));
						else res(e);
					};
					link.addEventListener("load", handleSettle);
					link.addEventListener("error", handleSettle);
				});
			});
		}).filter((p) => p !== void 0));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
// ../../@vite-plugin-pwa/virtual:pwa-register
var autoUpdateMode = "true";
var selfDestroying = "false";
var auto = autoUpdateMode === "true";
var autoDestroy = selfDestroying === "true";
function registerSW(options = {}) {
	const { immediate = false, onNeedReload, onNeedRefresh, onOfflineReady, onRegistered, onRegisteredSW, onRegisterError } = options;
	let wb;
	let registerPromise;
	let sendSkipWaitingMessage;
	const updateServiceWorker = async (_reloadPage = true) => {
		await registerPromise;
		if (!auto) sendSkipWaitingMessage?.();
	};
	async function register() {
		if ("serviceWorker" in navigator) {
			wb = await __vitePreload(async () => {
				const { Workbox } = await import("./workbox-window.prod.es5-CzJxx9q2.js");
				return { Workbox };
			}, []).then(({ Workbox }) => {
				return new Workbox("/sw.js", {
					scope: "/",
					type: "classic"
				});
			}).catch((e) => {
				onRegisterError?.(e);
			});
			if (!wb) return;
			sendSkipWaitingMessage = () => {
				wb?.messageSkipWaiting();
			};
			if (!autoDestroy) {
				if (auto) {
					wb.addEventListener("activated", (event) => {
						if (event.isUpdate || event.isExternal) {
							if (onNeedReload) onNeedReload();
							else window.location.reload();
						}
					});
					wb.addEventListener("installed", (event) => {
						if (!event.isUpdate) onOfflineReady?.();
					});
				} else {
					let onNeedRefreshCalled = false;
					const showSkipWaitingPrompt = () => {
						onNeedRefreshCalled = true;
						wb?.addEventListener("controlling", (event) => {
							if (event.isUpdate) {
								if (onNeedReload) onNeedReload();
								else window.location.reload();
							}
						});
						onNeedRefresh?.();
					};
					wb.addEventListener("installed", (event) => {
						if (typeof event.isUpdate === "undefined") {
							if (typeof event.isExternal !== "undefined") {
								if (event.isExternal) showSkipWaitingPrompt();
								else !onNeedRefreshCalled && onOfflineReady?.();
							} else !onNeedRefreshCalled && onOfflineReady?.();
						} else if (!event.isUpdate) onOfflineReady?.();
					});
					wb.addEventListener("waiting", showSkipWaitingPrompt);
				}
			}
			wb.register({ immediate }).then((r) => {
				if (onRegisteredSW) onRegisteredSW("/sw.js", r);
				else onRegistered?.(r);
			}).catch((e) => {
				onRegisterError?.(e);
			});
		}
	}
	registerPromise = register();
	return updateServiceWorker;
}
// src/js/ui/modal.js
/**
* Sistema Modali (<dialog> accessibile) e Toast non-bloccante.
* Sostituisce al 100% window.alert, window.confirm e window.prompt.
*/
var _toastTimer = null;
function showToast(message, { type = "info", duration = 3200 } = {}) {
	const el = document.getElementById("app-toast");
	if (!el) return;
	el.textContent = String(message || "");
	el.dataset.type = type;
	el.classList.add("visible");
	clearTimeout(_toastTimer);
	_toastTimer = setTimeout(() => {
		el.classList.remove("visible");
	}, duration);
}
function getDialogEl() {
	let dialog = document.getElementById("app-modal-dialog");
	if (!dialog) {
		dialog = document.createElement("dialog");
		dialog.id = "app-modal-dialog";
		dialog.className = "app-modal";
		document.body.appendChild(dialog);
	}
	return dialog;
}
/**
* Apre una modale personalizzata con contenuto HTML/DOM e pulsanti d'azione.
* Restituisce una Promise risolta col valore del pulsante cliccato (o null se chiusa con ESC/backdrop).
*/
function openModal({ title = "", subtitle = "", bodyHtml = "", buttons = [{
	label: "Chiudi",
	value: true,
	variant: "primary"
}], size = "md", onMount = null }) {
	return new Promise((resolve) => {
		const dialog = getDialogEl();
		dialog.dataset.size = size;
		const btnHtml = buttons.map((b, idx) => `<button type="button" class="btn btn-${esc(b.variant || "ghost")}" data-modal-idx="${idx}">${esc(b.label)}</button>`).join("");
		dialog.innerHTML = `
      <div class="modal-shell">
        <header class="modal-header">
          <div class="modal-title-group">
            <h3 class="modal-title">${esc(title)}</h3>
            ${subtitle ? `<p class="modal-subtitle">${esc(subtitle)}</p>` : ""}
          </div>
          <button type="button" class="icon-btn modal-close-x" aria-label="Chiudi finestra" data-modal-close>✕</button>
        </header>
        <div class="modal-body">${bodyHtml}</div>
        ${buttons.length ? `<footer class="modal-footer">${btnHtml}</footer>` : ""}
      </div>
    `;
		let settled = false;
		const finish = (val) => {
			if (settled) return;
			settled = true;
			dialog.removeEventListener("cancel", onCancel);
			dialog.removeEventListener("click", onClick);
			if (dialog.open) dialog.close();
			resolve(val);
		};
		const onCancel = (e) => {
			e.preventDefault();
			finish(null);
		};
		const onClick = async (e) => {
			if (e.target === dialog) {
				finish(null);
				return;
			}
			if (e.target.closest("[data-modal-close]")) {
				finish(null);
				return;
			}
			const btn = e.target.closest("[data-modal-idx]");
			if (btn) {
				const cfg = buttons[Number(btn.dataset.modalIdx)];
				if (!cfg) return;
				if (typeof cfg.onClick === "function") {
					const result = await cfg.onClick(dialog);
					if (result === false) return;
					finish(result !== void 0 ? result : cfg.value);
				} else finish(cfg.value);
			}
		};
		dialog.addEventListener("cancel", onCancel);
		dialog.addEventListener("click", onClick);
		if (typeof onMount === "function") onMount(dialog, finish);
		if (typeof dialog.showModal === "function") dialog.showModal();
		else dialog.setAttribute("open", "");
	});
}
function alertModal(title, message) {
	return openModal({
		title,
		bodyHtml: `<p class="modal-text">${esc(message)}</p>`,
		buttons: [{
			label: "Ho capito",
			value: true,
			variant: "primary"
		}],
		size: "sm"
	});
}
function confirmModal({ title = "Conferma operazione", message = "", confirmLabel = "Conferma", cancelLabel = "Annulla", danger = false }) {
	return openModal({
		title,
		bodyHtml: `<p class="modal-text">${esc(message)}</p>`,
		buttons: [{
			label: cancelLabel,
			value: false,
			variant: "ghost"
		}, {
			label: confirmLabel,
			value: true,
			variant: danger ? "danger" : "primary"
		}],
		size: "sm"
	}).then((res) => res === true);
}
function choiceModal({ title, message, choices = [] }) {
	return openModal({
		title,
		bodyHtml: `<p class="modal-text">${esc(message)}</p>`,
		buttons: choices,
		size: "md"
	});
}
// src/js/pwa.js
/**
* Modulo PWA: registrazione Service Worker (Workbox), rilevamento installazione
* nativa (Chrome/Edge/Android) e guida iOS Safari (Aggiungi a schermata Home).
*/
var deferredInstallPrompt = null;
var isInstalled = false;
function detectStandalone() {
	if (typeof window === "undefined") return false;
	return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function detectIosSafari() {
	if (typeof navigator === "undefined") return false;
	const ua = navigator.userAgent || "";
	const isIos = /iPad|iPhone|iPod/.test(ua) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
	const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
	return isIos && isSafari;
}
function updateInstallButtons() {
	const buttons = document.querySelectorAll("[data-action='install-pwa']");
	const canShow = !isInstalled && (Boolean(deferredInstallPrompt) || detectIosSafari());
	buttons.forEach((btn) => {
		btn.hidden = !canShow;
	});
}
async function triggerPwaInstall() {
	if (isInstalled) {
		showToast("L'app è già installata sul dispositivo.");
		return;
	}
	if (deferredInstallPrompt) {
		deferredInstallPrompt.prompt();
		const { outcome } = await deferredInstallPrompt.userChoice;
		deferredInstallPrompt = null;
		if (outcome === "accepted") {
			isInstalled = true;
			showToast("App installata! Ora puoi aprirla dalla schermata Home.", { type: "success" });
		}
		updateInstallButtons();
		return;
	}
	if (detectIosSafari()) await openModal({
		title: "Installa su iPad o iPhone",
		subtitle: "Aggiungi Compilatore Preventivi alla schermata Home",
		size: "sm",
		bodyHtml: `
        <ol class="ios-install-steps">
          <li>Tocca l'icona <strong>Condividi</strong> (quadrato con freccia verso l'alto) nella barra di Safari.</li>
          <li>Scorri e seleziona <strong>Aggiungi alla schermata Home</strong>.</li>
          <li>Conferma toccando <strong>Aggiungi</strong> in alto a destra per usarla a schermo intero.</li>
        </ol>
      `,
		buttons: [{
			label: "Ho capito",
			value: true,
			variant: "primary"
		}]
	});
}
function initPwa() {
	isInstalled = detectStandalone();
	try {
		registerSW({
			immediate: true,
			onOfflineReady() {
				console.info("[PWA] Asset statici pronti per uso offline.");
			},
			onNeedRefresh() {
				showToast("Nuova versione pronta: aggiornamento applicato al prossimo avvio.");
			},
			onRegisterError(err) {
				console.warn("[PWA] Registrazione Service Worker non disponibile:", err);
			}
		});
	} catch (err) {
		console.warn("[PWA] virtual:pwa-register saltato:", err);
	}
	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		deferredInstallPrompt = e;
		updateInstallButtons();
	});
	window.addEventListener("appinstalled", () => {
		isInstalled = true;
		deferredInstallPrompt = null;
		updateInstallButtons();
		showToast("Compilatore Preventivi installato con successo!", { type: "success" });
	});
	updateInstallButtons();
}
// src/js/firebase-config.js
/**
* Configurazione centralizzata Firebase (unica fonte di verità per Auth e Firestore).
*/
var FIREBASE_CONFIG = {
	apiKey: "AIzaSyCB7tSAXM8SSFKKKjMeXsDK3sFMpyz2xUk",
	authDomain: "preventivi-federico-coletta.firebaseapp.com",
	projectId: "preventivi-federico-coletta",
	storageBucket: "preventivi-federico-coletta.firebasestorage.app",
	messagingSenderId: "226848240794",
	appId: "1:226848240794:web:32658649186bde08af1b23"
};
var OWNER_EMAIL = "fedecoletta@gmail.com";
var _db = null;
var _persistenceStarted = false;
function ensureFirebaseApp() {
	if (typeof globalThis.firebase === "undefined") return null;
	const fb = globalThis.firebase;
	if (!fb.apps || fb.apps.length === 0) fb.initializeApp(FIREBASE_CONFIG);
	return fb;
}
function getFirebaseAuth() {
	const fb = ensureFirebaseApp();
	if (!fb || typeof fb.auth !== "function") return null;
	return fb.auth();
}
function getFirestoreDb() {
	if (_db) return _db;
	const fb = ensureFirebaseApp();
	if (!fb || typeof fb.firestore !== "function") return null;
	_db = fb.firestore();
	if (!_persistenceStarted) {
		_persistenceStarted = true;
		try {
			_db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
				if (err?.code === "failed-precondition") console.warn("[Firestore] Persistenza attiva in un'altra scheda.");
				else if (err?.code === "unimplemented") console.warn("[Firestore] IndexedDB non supportato da questo browser.");
			});
		} catch (err) {
			console.warn("[Firestore] enablePersistence non disponibile:", err);
		}
	}
	return _db;
}
function isDevEnvironment() {
	if (typeof window === "undefined" || !window.location) return false;
	const host = (window.location.hostname || "").toLowerCase();
	const proto = (window.location.protocol || "").toLowerCase();
	if (host === "localhost" || host === "127.0.0.1") return true;
	if (host.endsWith(".run.app") && proto === "https:") return true;
	return false;
}
// src/js/firebase-auth.js
/**
* Modulo Autenticazione Firebase Google (single-owner whitelist: Federico Coletta).
* Zero alert/confirm nativi, zero HTML inline handlers, protezione anti-manomissione.
*/
var _currentUser = null;
var _antiTamperActive = false;
var _onAuthorizedCallback = null;
function isAuthorizedUser(user = _currentUser) {
	return Boolean(user && user.email && String(user.email).toLowerCase().trim() === "fedecoletta@gmail.com".toLowerCase());
}
function setGateVisible(visible) {
	const gate = document.getElementById("auth-gate-overlay");
	if (gate) gate.hidden = !visible;
	document.documentElement.classList.toggle("auth-locked", visible);
	document.body.classList.toggle("auth-locked", visible);
}
function showGateFeedback(htmlMessage, variant = "info") {
	const box = document.getElementById("auth-gate-feedback");
	if (!box) return;
	box.hidden = false;
	box.dataset.variant = variant;
	box.innerHTML = htmlMessage;
}
function hideGateFeedback() {
	const box = document.getElementById("auth-gate-feedback");
	if (box) box.hidden = true;
}
function updateProfileBadge(user) {
	const wrap = document.getElementById("user-profile-wrap");
	const avatar = document.getElementById("user-profile-avatar");
	const label = document.getElementById("user-profile-label");
	if (!wrap) return;
	if (user && user.email) {
		wrap.hidden = false;
		if (label) label.textContent = user.displayName || user.email;
		if (avatar) {
			if (user.photoURL) {
				avatar.src = user.photoURL;
				avatar.hidden = false;
			} else avatar.hidden = true;
		}
	} else wrap.hidden = true;
}
function activateAntiTamper() {
	if (_antiTamperActive || typeof MutationObserver === "undefined") return;
	_antiTamperActive = true;
	new MutationObserver(() => {
		if (isAuthorizedUser()) return;
		const gate = document.getElementById("auth-gate-overlay");
		if (!gate || gate.hidden || gate.style.display === "none" || !document.contains(gate)) {
			const app = document.getElementById("app");
			if (app) app.remove();
			document.body.innerHTML = `
        <div class="auth-tamper-lock">
          <h2>Accesso Riservato — Protezione Attiva</h2>
          <p>Ricarica la pagina e accedi con il tuo account Google autorizzato.</p>
          <button type="button" class="btn btn-primary" id="btn-tamper-reload">Ricarica pagina</button>
        </div>
      `;
			document.getElementById("btn-tamper-reload")?.addEventListener("click", () => {
				window.location.reload();
			});
		}
	}).observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: [
			"hidden",
			"style",
			"class"
		]
	});
}
function handleAuthState(user) {
	_currentUser = user;
	actions.setUser(user);
	if (!user) {
		setGateVisible(true);
		updateProfileBadge(null);
		activateAntiTamper();
		return;
	}
	if (isAuthorizedUser(user)) {
		hideGateFeedback();
		setGateVisible(false);
		updateProfileBadge(user);
		if (typeof _onAuthorizedCallback === "function") _onAuthorizedCallback(user);
		return;
	}
	setGateVisible(true);
	updateProfileBadge(null);
	activateAntiTamper();
	showGateFeedback(`<strong>Accesso negato</strong><br>
     L'account <code>${esc(user.email || "sconosciuto")}</code> non è autorizzato.<br>
     Questo gestionale è riservato a <strong>${esc(OWNER_EMAIL)}</strong>.<br>
     <button type="button" class="btn btn-ghost btn-sm" id="btn-auth-switch-account" style="margin-top:10px">
       Esci e cambia account
     </button>`, "error");
	document.getElementById("btn-auth-switch-account")?.addEventListener("click", () => {
		signOutImmediately();
	});
}
async function loginWithGoogle() {
	const auth = getFirebaseAuth();
	if (!auth || typeof globalThis.firebase?.auth?.GoogleAuthProvider !== "function") {
		await alertModal("Autenticazione non disponibile", "Il servizio Google Auth è momentaneamente irraggiungibile o bloccato dalla rete.");
		return;
	}
	showGateFeedback("Apertura accesso Google in corso...", "info");
	const provider = new globalThis.firebase.auth.GoogleAuthProvider();
	provider.setCustomParameters({ prompt: "select_account" });
	try {
		await auth.signInWithPopup(provider);
	} catch (err) {
		if (err?.code === "auth/popup-blocked") auth.signInWithRedirect(provider);
		else if (err?.code === "auth/popup-closed-by-user") hideGateFeedback();
		else {
			let msg = `Impossibile completare l'accesso: ${esc(err?.message || "errore sconosciuto")}`;
			if (err?.code === "auth/unauthorized-domain" && isDevEnvironment()) msg += `<br><span class="auth-dev-hint">Dominio di anteprima non nella whitelist Firebase: usa il pulsante "Sessione Studio" qui sotto.</span>`;
			showGateFeedback(msg, "error");
		}
	}
}
function loginDevSession() {
	if (!isDevEnvironment()) return;
	handleAuthState({
		email: OWNER_EMAIL,
		displayName: "Federico Coletta",
		photoURL: "",
		isDevSession: true,
		getIdToken: async () => ""
	});
}
async function signOutImmediately() {
	const auth = getFirebaseAuth();
	if (auth) try {
		await auth.signOut();
	} catch {}
	window.location.reload();
}
async function logoutUser() {
	if (!await confirmModal({
		title: "Disconnetti account",
		message: "Vuoi uscire dal tuo account? Tutte le modifiche salvate restano al sicuro nel Cloud.",
		confirmLabel: "Esci",
		cancelLabel: "Rimani connesso"
	})) return;
	await signOutImmediately();
}
function initAuth(onAuthorized) {
	_onAuthorizedCallback = onAuthorized;
	setGateVisible(true);
	document.getElementById("btn-login-google")?.addEventListener("click", loginWithGoogle);
	const btnDev = document.getElementById("btn-login-dev");
	if (btnDev) {
		if (isDevEnvironment()) {
			btnDev.hidden = false;
			btnDev.addEventListener("click", loginDevSession);
		} else btnDev.remove();
	}
	let attempts = 0;
	const attachAuthListener = () => {
		const auth = getFirebaseAuth();
		if (!auth) {
			if (attempts < 40) {
				attempts += 1;
				setTimeout(attachAuthListener, 120);
			}
			return;
		}
		try {
			auth.onAuthStateChanged(handleAuthState);
		} catch (err) {
			console.warn("[FirebaseAuth] Errore inizializzazione listener:", err);
		}
	};
	attachAuthListener();
}
// src/js/firebase-sync.js
/**
* Modulo Sincronizzazione Cloud-First su Firebase Firestore.
* - Real-time onSnapshot su /preventivi, /clienti, /listino, /config/impostazioni
* - Fix bug eliminazione ultimo cliente / ultimo preventivo (sincronizza anche snapshot vuoti da server)
* - Autosave automatico 1000ms debounce con creazione bozza pigra (solo alla prima modifica reale)
* - Debounce 800ms per modifiche listino
* - Cestino 100% Cloud (cestinato: true/false, eliminatoIl) senza localStorage legacy
* - 100% conforme a /firestore.rules
*/
var AUTOSAVE_DEBOUNCE_MS = 1e3;
var PRICE_LIST_DEBOUNCE_MS = 800;
var _listenersStarted = false;
var _autosaveTimer = null;
var _lastSavedHashes = /* @__PURE__ */ new Map();
var _priceItemTimers = /* @__PURE__ */ new Map();
function isOffline() {
	return typeof navigator !== "undefined" && navigator.onLine === false;
}
function hasLiveCloudSession() {
	const user = getState().user;
	if (!user) return false;
	if (user.isDevSession) return false;
	return Boolean(getFirestoreDb());
}
/**
* Attiva i listener real-time Firestore sulle 4 collezioni.
*/
function startRealtimeSync() {
	if (_listenersStarted) return;
	if (!hasLiveCloudSession()) {
		actions.setSyncStatus(isOffline() ? "offline" : "saved", "Sessione locale");
		return;
	}
	const db = getFirestoreDb();
	if (!db) return;
	_listenersStarted = true;
	db.collection("preventivi").onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
		const items = [];
		snapshot.forEach((doc) => {
			const d = doc.data();
			if (d && d.id) items.push(deserializeQuoteFromFirestore(d));
		});
		if (items.length > 0 || !snapshot.metadata.fromCache) actions.setQuotes(items);
		if (snapshot.metadata.hasPendingWrites || isOffline()) actions.setSyncStatus("offline", "Salvato offline");
		else actions.setSyncStatus("saved", "Salvato");
	}, (err) => {
		console.warn("[Firestore] Errore listener /preventivi:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error", "Errore sincronizzazione");
	});
	db.collection("clienti").onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
		const clients = [];
		snapshot.forEach((doc) => {
			const c = doc.data();
			if (c && c.id) clients.push(c);
		});
		if (clients.length > 0 || !snapshot.metadata.fromCache) actions.setClients(clients);
	}, (err) => {
		console.warn("[Firestore] Errore listener /clienti:", err);
	});
	db.collection("listino").onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
		const items = [];
		snapshot.forEach((doc) => {
			const v = doc.data();
			if (v && v.nome) items.push(v);
		});
		if (items.length > 0 || !snapshot.metadata.fromCache) actions.setPriceList(items);
	}, (err) => {
		console.warn("[Firestore] Errore listener /listino:", err);
	});
	db.collection("config").doc("impostazioni").onSnapshot((doc) => {
		if (doc.exists) {
			const data = doc.data();
			if (data?.data && typeof data.data === "object") actions.setIssuer(data.data);
		}
	}, (err) => {
		console.warn("[Firestore] Errore listener /config/impostazioni:", err);
	});
}
/**
* Pianifica autosave del preventivo corrente (debounce 1000ms).
*/
function scheduleQuoteAutosave() {
	const st = getState();
	if (!st.isDraftPersisted && !hasQuoteMeaningfulContent(st.currentQuote)) return;
	clearTimeout(_autosaveTimer);
	actions.setSyncStatus(isOffline() ? "offline" : "saving", isOffline() ? "Offline" : "Salvataggio...");
	_autosaveTimer = setTimeout(() => {
		flushQuoteAutosave();
	}, AUTOSAVE_DEBOUNCE_MS);
}
/**
* Esegue il salvataggio immediato del preventivo corrente (usato anche su cambio vista / chiusura scheda).
*/
async function flushQuoteAutosave({ force = false } = {}) {
	clearTimeout(_autosaveTimer);
	_autosaveTimer = null;
	const st = getState();
	const quote = st.currentQuote;
	if (!quote || !quote.id) return false;
	if (!st.isDraftPersisted && !force && !hasQuoteMeaningfulContent(quote)) {
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
		return false;
	}
	const payload = serializeQuoteForFirestore(quote);
	const hashKey = JSON.stringify({
		...payload,
		modificato: ""
	});
	if (!force && _lastSavedHashes.get(payload.id) === hashKey) {
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
		return true;
	}
	actions.upsertQuoteInList(payload);
	if (!hasLiveCloudSession()) {
		_lastSavedHashes.set(payload.id, hashKey);
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
		return true;
	}
	const db = getFirestoreDb();
	actions.setSyncStatus(isOffline() ? "offline" : "saving");
	try {
		await db.collection("preventivi").doc(payload.id).set(payload, { merge: true });
		_lastSavedHashes.set(payload.id, hashKey);
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
		return true;
	} catch (err) {
		console.error("[Firestore] Errore salvataggio preventivo:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error", err?.code || "Errore sync");
		return false;
	}
}
async function saveQuoteToCloud(quote) {
	const payload = serializeQuoteForFirestore(quote);
	actions.upsertQuoteInList(payload);
	if (!hasLiveCloudSession()) return true;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving");
	try {
		await db.collection("preventivi").doc(payload.id).set(payload, { merge: true });
		_lastSavedHashes.set(payload.id, JSON.stringify({
			...payload,
			modificato: ""
		}));
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
		return true;
	} catch (err) {
		console.error("[Firestore] Errore saveQuoteToCloud:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
		return false;
	}
}
async function updateQuoteStatus(ids, stato) {
	const list = Array.isArray(ids) ? ids : [ids];
	if (list.length === 0) return;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const updatedQuotes = getState().quotes.map((q) => list.includes(q.id) ? {
		...q,
		stato,
		modificato: now
	} : q);
	actions.setQuotes(updatedQuotes);
	if (list.includes(getState().currentQuote.id)) actions.updateCurrentQuote((q) => {
		q.stato = stato;
	}, { triggerAutosave: false });
	if (!hasLiveCloudSession()) return;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving");
	try {
		const batch = db.batch();
		list.forEach((id) => {
			batch.set(db.collection("preventivi").doc(id), {
				stato,
				modificato: now
			}, { merge: true });
		});
		await batch.commit();
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
	} catch (err) {
		console.error("[Firestore] Errore updateQuoteStatus:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
	}
}
async function moveQuotesToTrash(ids) {
	const list = Array.isArray(ids) ? ids : [ids];
	if (list.length === 0) return;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const updatedQuotes = getState().quotes.map((q) => list.includes(q.id) ? {
		...q,
		cestinato: true,
		eliminatoIl: now,
		modificato: now
	} : q);
	actions.setQuotes(updatedQuotes);
	if (!hasLiveCloudSession()) return;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving");
	try {
		const batch = db.batch();
		list.forEach((id) => {
			batch.set(db.collection("preventivi").doc(id), {
				cestinato: true,
				eliminatoIl: now,
				modificato: now
			}, { merge: true });
		});
		await batch.commit();
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
	} catch (err) {
		console.error("[Firestore] Errore moveQuotesToTrash:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
	}
}
async function restoreQuotesFromTrash(ids) {
	const list = Array.isArray(ids) ? ids : [ids];
	if (list.length === 0) return;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const updatedQuotes = getState().quotes.map((q) => list.includes(q.id) ? {
		...q,
		cestinato: false,
		eliminatoIl: null,
		modificato: now
	} : q);
	actions.setQuotes(updatedQuotes);
	if (!hasLiveCloudSession()) return;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving");
	try {
		const batch = db.batch();
		list.forEach((id) => {
			batch.set(db.collection("preventivi").doc(id), {
				cestinato: false,
				eliminatoIl: null,
				modificato: now
			}, { merge: true });
		});
		await batch.commit();
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
	} catch (err) {
		console.error("[Firestore] Errore restoreQuotesFromTrash:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
	}
}
async function deleteQuotesPermanently(ids) {
	const list = Array.isArray(ids) ? ids : [ids];
	if (list.length === 0) return;
	actions.removeQuotesFromList(list);
	if (!hasLiveCloudSession()) return;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving");
	try {
		const batch = db.batch();
		list.forEach((id) => {
			batch.delete(db.collection("preventivi").doc(id));
		});
		await batch.commit();
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
	} catch (err) {
		console.error("[Firestore] Errore deleteQuotesPermanently:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
	}
}
async function saveClientToCloud(rawClient) {
	const client = serializeClientForFirestore({
		...rawClient,
		modificato: (/* @__PURE__ */ new Date()).toISOString()
	});
	if (!client) return null;
	const existing = getState().clients.slice();
	const idx = existing.findIndex((c) => c.id === client.id);
	if (idx >= 0) existing[idx] = client;
	else existing.push(client);
	actions.setClients(existing);
	if (!hasLiveCloudSession()) return client;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving");
	try {
		await db.collection("clienti").doc(client.id).set(client, { merge: true });
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
	} catch (err) {
		console.error("[Firestore] Errore saveClientToCloud:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
	}
	return client;
}
async function deleteClientFromCloud(clientId) {
	if (!clientId) return;
	const next = getState().clients.filter((c) => c.id !== clientId);
	actions.setClients(next);
	if (!hasLiveCloudSession()) return;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving");
	try {
		await db.collection("clienti").doc(clientId).delete();
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
	} catch (err) {
		console.error("[Firestore] Errore deleteClientFromCloud:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
	}
}
function schedulePriceItemSave(item) {
	const safe = serializePriceItemForFirestore({
		...item,
		modificato: (/* @__PURE__ */ new Date()).toISOString()
	});
	if (!safe) return;
	const list = getState().priceList.slice();
	const idx = list.findIndex((v) => v.id === safe.id);
	if (idx >= 0) list[idx] = safe;
	else list.push(safe);
	actions.setPriceList(list);
	if (!hasLiveCloudSession()) return;
	clearTimeout(_priceItemTimers.get(safe.id));
	actions.setSyncStatus(isOffline() ? "offline" : "saving");
	const timer = setTimeout(async () => {
		_priceItemTimers.delete(safe.id);
		const db = getFirestoreDb();
		try {
			await db.collection("listino").doc(safe.id).set(safe, { merge: true });
			actions.setSyncStatus(isOffline() ? "offline" : "saved");
		} catch (err) {
			console.error("[Firestore] Errore salvataggio voce listino:", err);
			actions.setSyncStatus(isOffline() ? "offline" : "error");
		}
	}, PRICE_LIST_DEBOUNCE_MS);
	_priceItemTimers.set(safe.id, timer);
}
async function deletePriceItemFromCloud(itemId) {
	if (!itemId) return;
	clearTimeout(_priceItemTimers.get(itemId));
	_priceItemTimers.delete(itemId);
	const next = getState().priceList.filter((v) => v.id !== itemId);
	actions.setPriceList(next);
	if (!hasLiveCloudSession()) return;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving");
	try {
		await db.collection("listino").doc(itemId).delete();
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
	} catch (err) {
		console.error("[Firestore] Errore deletePriceItemFromCloud:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
	}
}
async function saveIssuerToCloud(issuer) {
	const clean = {
		cf: String(issuer?.cf || "").trim(),
		piva: String(issuer?.piva || "").trim(),
		iban: String(issuer?.iban || "").trim(),
		indirizzo: String(issuer?.indirizzo || "").trim()
	};
	actions.setIssuer(clean);
	if (!hasLiveCloudSession()) return true;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving");
	try {
		await db.collection("config").doc("impostazioni").set({
			data: clean,
			modificato: (/* @__PURE__ */ new Date()).toISOString()
		}, { merge: true });
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
		return true;
	} catch (err) {
		console.error("[Firestore] Errore saveIssuerToCloud:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
		return false;
	}
}
async function syncImportedBackupToCloud({ preventivi = [], clienti = [], listino = [], io = null }) {
	if (io) await saveIssuerToCloud(io);
	if (preventivi.length) {
		const mergedMap = new Map(getState().quotes.map((q) => [q.id, q]));
		preventivi.forEach((q) => mergedMap.set(q.id, q));
		actions.setQuotes([...mergedMap.values()]);
	}
	if (clienti.length) {
		const mergedMap = new Map(getState().clients.map((c) => [c.id, c]));
		clienti.forEach((c) => mergedMap.set(c.id, c));
		actions.setClients([...mergedMap.values()]);
	}
	if (listino.length) {
		const mergedMap = new Map(getState().priceList.map((v) => [v.id, v]));
		listino.forEach((v) => mergedMap.set(v.id, v));
		actions.setPriceList([...mergedMap.values()]);
	}
	if (!hasLiveCloudSession()) return true;
	const db = getFirestoreDb();
	actions.setSyncStatus("saving", "Importazione Cloud...");
	const CHUNK = 400;
	try {
		for (let i = 0; i < preventivi.length; i += CHUNK) {
			const batch = db.batch();
			preventivi.slice(i, i + CHUNK).forEach((q) => {
				const safe = serializeQuoteForFirestore(q);
				batch.set(db.collection("preventivi").doc(safe.id), safe, { merge: true });
			});
			await batch.commit();
		}
		for (let i = 0; i < clienti.length; i += CHUNK) {
			const batch = db.batch();
			clienti.slice(i, i + CHUNK).forEach((c) => {
				const safe = serializeClientForFirestore(c);
				if (safe) batch.set(db.collection("clienti").doc(safe.id), safe, { merge: true });
			});
			await batch.commit();
		}
		for (let i = 0; i < listino.length; i += CHUNK) {
			const batch = db.batch();
			listino.slice(i, i + CHUNK).forEach((v, idx) => {
				const safe = serializePriceItemForFirestore(v, i + idx + 1);
				if (safe) batch.set(db.collection("listino").doc(safe.id), safe, { merge: true });
			});
			await batch.commit();
		}
		actions.setSyncStatus(isOffline() ? "offline" : "saved");
		return true;
	} catch (err) {
		console.error("[Firestore] Errore syncImportedBackupToCloud:", err);
		actions.setSyncStatus(isOffline() ? "offline" : "error");
		return false;
	}
}
function initSyncLifecycle() {
	window.addEventListener("online", () => {
		actions.setSyncStatus("saving", "Riconnessione...");
		flushQuoteAutosave().finally(() => {
			if (!isOffline()) actions.setSyncStatus("saved");
		});
	});
	window.addEventListener("offline", () => {
		actions.setSyncStatus("offline", "Offline");
	});
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden" && _autosaveTimer) flushQuoteAutosave();
	});
	window.addEventListener("pagehide", () => {
		if (_autosaveTimer) flushQuoteAutosave();
	});
}
// src/js/import-export.js
/**
* Import / Export JSON (singolo preventivo e backup completo).
* - Validazione schema tramite validator.js
* - Conflitto ID/numero su import singolo preventivo: modale dedicata (Crea nuova copia vs Sovrascrivi esistente)
* - Sincronizzazione immediata su Firestore
*/
function downloadJsonFile(data, filename) {
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function exportSingleQuoteJson(quote) {
	if (!quote) return;
	const num = sanitizzaNomeFile(quote.numero || "Preventivo");
	const cl = sanitizzaNomeFile(quote.cliente?.nome || "");
	const name = `Preventivo_${num}${cl ? `_${cl}` : ""}.json`;
	downloadJsonFile(quote, name);
	showToast(`Esportato ${name}`, { type: "success" });
}
function exportFullBackupJson() {
	const st = getState();
	downloadJsonFile({
		version: "2.0.0",
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		preventivi: st.quotes,
		clienti: st.clients,
		listino: st.priceList,
		io: st.issuer
	}, `FC_Backup_Preventivi_${aIsoLocale(/* @__PURE__ */ new Date())}.json`);
	showToast(`Backup esportato (${st.quotes.length} preventivi, ${st.clients.length} clienti).`, { type: "success" });
}
async function handleJsonFileImport(file) {
	if (!file) return;
	let parsed;
	try {
		const text = await file.text();
		parsed = JSON.parse(text);
	} catch {
		await alertModal("File non valido", "Il file selezionato non è un documento JSON leggibile.");
		return;
	}
	const check = validaImportJSON(parsed);
	if (!check.ok) {
		await alertModal("Importazione non riuscita", check.error);
		return;
	}
	if (check.type === "single") {
		await importSingleQuote(check.quote);
		return;
	}
	if (!await confirmModal({
		title: "Importa backup completo",
		message: `Il file contiene ${check.preventivi.length} preventivi, ${check.clienti.length} clienti e ${check.listino.length} voci di listino. I dati verranno uniti e sincronizzati sul Cloud.`,
		confirmLabel: "Importa e sincronizza",
		cancelLabel: "Annulla"
	})) return;
	await syncImportedBackupToCloud({
		preventivi: check.preventivi,
		clienti: check.clienti,
		listino: check.listino,
		io: check.io
	});
	showToast("Backup importato e sincronizzato sul Cloud.", { type: "success" });
}
async function importSingleQuote(incomingQuote) {
	const allQuotes = getState().quotes;
	const conflict = allQuotes.find((q) => q.id === incomingQuote.id || incomingQuote.numero && String(q.numero || "").trim().toLowerCase() === String(incomingQuote.numero || "").trim().toLowerCase());
	let finalQuote = sanificaPreventivo(incomingQuote);
	if (conflict) {
		const choice = await choiceModal({
			title: "Preventivo già presente in archivio",
			message: `Esiste già un preventivo corrispondente (N. ${conflict.numero}${conflict.cliente?.nome ? ` — ${conflict.cliente.nome}` : ""}). Come vuoi procedere?`,
			choices: [
				{
					label: "Annulla",
					value: "cancel",
					variant: "ghost"
				},
				{
					label: "Sovrascrivi esistente",
					value: "overwrite",
					variant: "danger"
				},
				{
					label: "Crea nuova copia",
					value: "copy",
					variant: "primary"
				}
			]
		});
		if (!choice || choice === "cancel") return;
		if (choice === "copy") finalQuote = sanificaPreventivo({
			...incomingQuote,
			id: generaId("p"),
			numero: prossimoNumero(allQuotes),
			stato: "bozza",
			cestinato: false,
			eliminatoIl: null,
			modificato: (/* @__PURE__ */ new Date()).toISOString()
		});
		else if (choice === "overwrite") finalQuote = sanificaPreventivo({
			...incomingQuote,
			id: conflict.id,
			cestinato: false,
			eliminatoIl: null,
			modificato: (/* @__PURE__ */ new Date()).toISOString()
		});
	} else finalQuote = sanificaPreventivo({
		...incomingQuote,
		cestinato: false,
		eliminatoIl: null,
		modificato: (/* @__PURE__ */ new Date()).toISOString()
	});
	actions.loadQuoteIntoEditor(finalQuote, { persisted: true });
	actions.setActiveView("editor");
	await saveQuoteToCloud(finalQuote);
	showToast(`Preventivo ${esc(finalQuote.numero)} importato e aperto nell'editor.`, { type: "success" });
}
// src/js/print-engine.js
/**
* Motore unificato di rendering editoriale A4 (Anteprima Live + Stampa / PDF).
* - Unico template HTML condiviso (zero divergenze tra schermo e carta).
* - Sanitizzazione esc() rigorosa su tutti i campi utente (anti-XSS).
* - Asset esterni leggeri da /assets/ (logo SVG e firma PNG).
*/
function renderTotalsBlock(t, { labelImponibile = "Imponibile", scontoTxt = "", senzaNota = false, titoloTotale = "Totale Preventivo" } = {}) {
	const row = (cls, label, val) => `<div class="riga ${cls}"><span>${label}</span><span class="num">${val}</span></div>`;
	let html = row("", esc(labelImponibile), euro(t.imponibile));
	if (t.sconto > 0) {
		const defaultLabel = t.scontoTipo === "perc" && t.scontoValore > 0 ? `Sconto (${t.scontoValore}%)` : "Sconto";
		html += row("att", esc(scontoTxt || defaultLabel), `\u2212\u00A0${euro(t.sconto)}`);
	}
	if (t.rivPerc > 0) html += row("att", `${t.rivPerc === 2 ? "Contributo cassa" : "Rivalsa INPS"} ${t.rivPerc}%`, euro(t.rivalsa));
	if (t.ivaPerc > 0) html += row("att", `IVA ${t.ivaPerc}%`, euro(t.iva));
	if (t.bollo > 0) html += row("att", "Marca da bollo", euro(t.bollo));
	if (t.ritenuta > 0) {
		html += row("", "<b>Totale documento</b>", `<b>${euro(t.totaleDoc)}</b>`);
		html += row("att", `Ritenuta d'acconto ${t.ritPerc}%`, `\u2212\u00A0${euro(t.ritenuta)}`);
	}
	html += `<div class="riga totale"><span>${esc(titoloTotale)}</span><span class="num">${euro(t.netto)}</span></div>`;
	const note = senzaNota ? "" : dicituraFiscale(t);
	return `<div class="totali">${note ? `<div class="totali-note"><div class="totali-note-tit">Note fiscali</div><p class="nota">${esc(note)}</p></div>` : `<div class="totali-note"></div>`}<div class="box">${html}</div></div>`;
}
function renderFooterHtml(quote = {}, issuerFallback = {}) {
	const io = quote?.io || issuerFallback || {};
	const regime = quote?.regime || "occasionale";
	const haPartitaIva = [
		"forf5",
		"forf15",
		"ordinario"
	].includes(regime);
	const pivaVal = String(io.piva || "").trim();
	const cfVal = String(io.cf || "").trim();
	const fisc = [haPartitaIva && pivaVal ? `P. IVA ${esc(pivaVal)}` : "", cfVal ? `C.F. ${esc(cfVal)}` : ""].filter(Boolean).join(" · ");
	const siteUrl = IO.sito.startsWith("http") ? IO.sito : `https://${IO.sito}`;
	return `<footer class="pieded">
    <div class="footer-riga-1">
      <b>${esc(IO.nome)}</b> · ${esc(IO.ruolo)}${fisc ? ` · <span class="dati-fisc">${fisc}</span>` : ""}
    </div>
    <div class="footer-riga-2">
      ${esc(IO.citta)} · <a href="mailto:${esc(IO.mail)}">${esc(IO.mail)}</a> · <a href="tel:${esc(IO.tel.replace(/\s+/g, ""))}">${esc(IO.tel)}</a> · <a href="${esc(siteUrl)}" target="_blank" rel="noopener">${esc(IO.sito)}</a>
    </div>
  </footer>`;
}
function renderLogoImg(compact = false) {
	return `<img src="${ASSET_PATHS.logoDoc}" class="doc-logo-img${compact ? " doc-logo-compact" : ""}" alt="${esc(IO.nome)}">`;
}
function renderSignatureImg(showSignature) {
	if (!showSignature) return "";
	return `<img src="${ASSET_PATHS.firma}" class="img-firma-auto" alt="Firma ${esc(IO.nome)}">`;
}
/**
* Genera l'HTML A4 completo del Preventivo (condiviso al 100% tra Anteprima Live e Stampa PDF).
*/
function renderQuoteDocumentHtml(quote, { showSignature = true, totals = null } = {}) {
	const p = quote || {};
	const t = totals || calcolaTotali(p);
	const voci = Array.isArray(p.voci) ? p.voci : [];
	const opzioni = Array.isArray(p.opzioni) ? p.opzioni : [];
	const incluso = Array.isArray(p.incluso) ? p.incluso : [];
	const escluso = Array.isArray(p.escluso) ? p.escluso : [];
	const condizioni = Array.isArray(p.condizioni) ? p.condizioni : [];
	const cliente = p.cliente || {};
	const progetto = p.progetto || {};
	const rowsHtml = voci.map((v, idx) => {
		const numIdx = String(idx + 1).padStart(2, "0");
		const qty = Number(v?.q) || 0;
		const price = Number(v?.p) || 0;
		return `<tr class="voice-item">
        <td>
          <span class="v-nome"><span class="v-idx">${numIdx}</span>${esc(v?.nome || "Voce senza titolo")}</span>
          ${v?.desc ? `<span class="v-desc">${esc(v.desc)}</span>` : ""}
        </td>
        <td class="num">${esc(qty)}</td>
        <td class="num">${euro(price)}</td>
        <td class="num col-totale">${euro(qty * price)}</td>
      </tr>`;
	}).join("");
	const scheda = [
		[
			"Titolo",
			progetto.titolo,
			true
		],
		[
			"Tipologia",
			progetto.tipo,
			false
		],
		[
			"Location",
			progetto.luogo,
			false
		],
		[
			"Giornate",
			progetto.giornate,
			false
		],
		[
			"Consegna",
			progetto.consegna,
			false
		]
	].filter((item) => Boolean(item[1])).map(([label, val, full]) => `<div class="spec-item${full ? " spec-full" : ""}"><dt>${esc(label)}</dt><dd>${esc(val)}</dd></div>`).join("");
	const clienteDetails = [
		cliente.ref,
		cliente.indirizzo,
		[cliente.piva ? `P. IVA ${cliente.piva}` : "", cliente.cf ? `C.F. ${cliente.cf}` : ""].filter(Boolean).join(" · "),
		[cliente.sdi ? `SDI ${cliente.sdi}` : "", cliente.pec ? `PEC ${cliente.pec}` : ""].filter(Boolean).join(" · "),
		[cliente.email, cliente.tel].filter(Boolean).join(" · ")
	].filter(Boolean).map(esc).join("<br>");
	const tabellaVoci = `<table class="voci">
    <colgroup>
      <col style="width:62%">
      <col style="width:10%">
      <col style="width:14%">
      <col style="width:14%">
    </colgroup>
    <thead>
      <tr>
        <th>Descrizione Prestazione</th>
        <th class="num">Q.tà</th>
        <th class="num">Unitario</th>
        <th class="num">Totale</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>`;
	const opzHtml = opzioni.length ? `<div class="sezione">Opzioni su richiesta</div>
       <table class="voci voci-opzioni">
         <colgroup>
           <col style="width:82%">
           <col style="width:18%">
         </colgroup>
         <tbody>${opzioni.map((o) => `<tr class="voice-item">
               <td><span class="v-nome">${esc(o?.nome)}</span>${o?.desc ? `<span class="v-desc">${esc(o.desc)}</span>` : ""}</td>
               <td class="num col-totale">${euro(o?.p)}</td>
             </tr>`).join("")}</tbody>
       </table>` : "";
	const comprendeHtml = incluso.length || escluso.length ? `<div class="sezione">Cosa comprende</div>
         <div class="due-colonne">
           <div class="col-card">
             <div class="etichetta-incluso">Incluso nell'offerta</div>
             <ul>${incluso.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
           </div>
           <div class="col-card escluso">
             <div class="etichetta-escluso">Escluso dall'offerta</div>
             <ul>${escluso.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
           </div>
         </div>` : "";
	const condHtml = condizioni.length ? `<div class="sezione">Condizioni contrattuali</div>
       <div class="condizioni-grid">${condizioni.map((c, i) => {
		const titolo = Array.isArray(c) ? c[0] : c?.titolo;
		const testo = Array.isArray(c) ? c[1] : c?.testo;
		return `<div class="cond-card clause${i === condizioni.length - 1 && condizioni.length % 2 !== 0 ? " clause-full" : ""}">
             <div class="cond-tit">${esc(titolo)}</div>
             <div class="cond-txt">${esc(testo)}</div>
           </div>`;
	}).join("")}</div>` : "";
	const bloccoAccettazione = `<section class="accettazione sign-area">
    <div class="tit">Accettazione e Conferma d'Ordine</div>
    <p>Per accettare il presente preventivo, restituire copia firmata via email a <a href="mailto:${esc(IO.mail)}">${esc(IO.mail)}</a> oppure rispondere per iscritto con la formula «confermo il preventivo N. ${esc(p.numero)}».</p>
    <div class="firme">
      <div class="f">
        <div class="linea"></div>
        <div class="did">Il Committente · Data e firma per accettazione</div>
      </div>
      <div class="f">
        <div class="linea">${renderSignatureImg(showSignature)}</div>
        <div class="did">${esc(IO.nome)}</div>
      </div>
    </div>
  </section>`;
	const introHtml = progetto.saluto || progetto.titolo || progetto.intro ? `<section class="intro">
          ${progetto.saluto ? `<p>${esc(progetto.saluto)}</p>` : ""}
          <p>di seguito il preventivo${progetto.titolo ? ` per <b>${esc(progetto.titolo)}</b>` : ""}.${progetto.intro ? ` ${esc(maiuscola(progetto.intro))}` : ""}</p>
        </section>` : "";
	const headerPrincipale = `<header class="intestazione">
    <div class="intestazione-logo">${renderLogoImg(false)}</div>
    <div class="doc">
      <div class="tipo">PREVENTIVO</div>
      <div class="meta">N. <b>${esc(p.numero)}</b> · Genzano di Roma, ${esc(dataIt(p.data))}<br>
      ${p.validita ? `Valido fino al <b>${esc(dataIt(p.validita))}</b>` : ""}</div>
    </div>
  </header>`;
	const blocchiClienteProgetto = `<section class="blocchi">
    <div class="blocco blocco-cliente">
      <div class="etichetta">Cliente</div>
      <div class="nome">${esc(cliente.nome || "—")}</div>
      <div class="righe">${clienteDetails}</div>
    </div>
    <div class="blocco blocco-specifiche">
      <div class="etichetta">Specifiche Progetto</div>
      <dl class="spec-grid">${scheda || `<div class="spec-item spec-full"><dd>—</dd></div>`}</dl>
    </div>
  </section>`;
	if (stimaIngombroStampa(p).pagina1Compatta) return `<div class="doc-a4-root">
      <div class="foglio-stampa foglio-preventivo">
        ${headerPrincipale}
        ${blocchiClienteProgetto}
        ${introHtml}
        <div class="sezione">Voci di preventivo</div>
        ${tabellaVoci}
        ${renderTotalsBlock(t, { scontoTxt: p.sconto_txt })}
        <div class="spazio-flessibile"></div>
        <div class="rimando-continua">Segue allegato contrattuale, condizioni e firme a Pagina 2 →</div>
        ${renderFooterHtml(p)}
      </div>

      <div class="foglio-stampa allegato-condizioni inizia-nuova-pagina">
        <header class="intestazione intestazione-compatta">
          <div class="intestazione-logo">${renderLogoImg(true)}</div>
          <div class="doc">
            <div class="tipo">Allegato Contrattuale</div>
            <div class="meta">Rif. preventivo <b>${esc(p.numero)}</b> · ${esc(dataIt(p.data))}</div>
          </div>
        </header>
        ${opzHtml}
        ${comprendeHtml}
        ${condHtml}
        ${bloccoAccettazione}
        <div class="spazio-flessibile"></div>
        ${renderFooterHtml(p)}
      </div>
    </div>`;
	return `<div class="doc-a4-root">
    <div class="foglio-stampa foglio-continuo">
      ${headerPrincipale}
      ${blocchiClienteProgetto}
      ${introHtml}
      <div class="sezione">Voci di preventivo</div>
      ${tabellaVoci}
      ${renderTotalsBlock(t, { scontoTxt: p.sconto_txt })}
      ${opzHtml}

      <div class="allegato-condizioni flusso-continuo">
        <div class="allegato-header-inline">
          <div class="tit-inline">Allegato Contrattuale &amp; Condizioni</div>
          <div class="rif-inline">Rif. preventivo ${esc(p.numero)} · ${esc(dataIt(p.data))}</div>
        </div>
        ${comprendeHtml}
        ${condHtml}
        ${bloccoAccettazione}
      </div>

      ${renderFooterHtml(p)}
    </div>
  </div>`;
}
/**
* Genera l'HTML A4 della Nota di Prestazione Occasionale o Fattura Proforma.
*/
function renderSecondDocumentHtml(quote, { showSignature = true, totals = null } = {}) {
	const p = quote || {};
	const t = totals || calcolaTotali(p);
	const pIva = t.haPartitaIva;
	const oggi = aIsoLocale(/* @__PURE__ */ new Date());
	const titolo = pIva ? "Proforma" : "Nota di prestazione occasionale";
	const compenso = t.base;
	const io = p.io || {};
	const cliente = p.cliente || {};
	const progetto = p.progetto || {};
	const siteUrl = IO.sito.startsWith("http") ? IO.sito : `https://${IO.sito}`;
	const bloccoIo = `<div class="blocco">
    <div class="etichetta">${pIva ? "Prestatore" : "Prestatore d'opera"}</div>
    <div class="nome">${esc(IO.nome)}</div>
    <div class="righe">
      ${esc(IO.ruolo)}<br>
      ${io.indirizzo ? `${esc(io.indirizzo)}<br>` : ""}
      ${pIva && io.piva ? `P. IVA ${esc(io.piva)}<br>` : ""}
      ${io.cf ? `C.F. ${esc(io.cf)}<br>` : ""}
      ${esc(IO.tel)} · ${esc(IO.mail)}<br>
      <a href="${esc(siteUrl)}" target="_blank" rel="noopener">${esc(IO.sito)}</a>
    </div>
  </div>`;
	const committenteRighe = [
		cliente.indirizzo,
		[cliente.piva ? `P. IVA ${cliente.piva}` : "", cliente.cf ? `C.F. ${cliente.cf}` : ""].filter(Boolean).join(" · "),
		cliente.sdi ? `Codice SDI: ${cliente.sdi}` : "",
		cliente.pec ? `PEC: ${cliente.pec}` : ""
	].filter(Boolean).map(esc).join("<br>");
	const avvertenza = pIva ? `<b>Documento non valido ai fini fiscali.</b> La fattura sarà emessa in formato elettronico e trasmessa tramite il Sistema di Interscambio, come previsto per tutti i titolari di partita IVA. ${esc(dicituraFiscale(t))}` : `<b>Prestazione occasionale ai sensi dell'art. 67, comma 1, lett. l) del D.P.R. 917/1986.</b> Compenso soggetto a ritenuta d'acconto del ${esc(t.ritPerc || 20)}% ai sensi dell'art. 25 del D.P.R. 600/1973, che il committente versa in qualità di sostituto d'imposta. Operazione fuori campo IVA ai sensi dell'art. 5 del D.P.R. 633/1972, in quanto prestazione priva del carattere di abitualità.${t.bollo > 0 ? " Marca da bollo da € 2,00 assolta sull'originale per importi oltre € 77,47." : ""} Il compenso non supera il limite annuo di € 5.000 oltre il quale è dovuta l'iscrizione alla Gestione Separata INPS.`;
	const vociTitoli = (Array.isArray(p.voci) ? p.voci : []).map((v) => String(v?.nome || "").trim()).filter(Boolean).join(" · ");
	return `<div class="doc-a4-root">
    <div class="foglio-stampa foglio-secondo">
      <header class="intestazione">
        <div class="intestazione-logo">${renderLogoImg(false)}</div>
        <div class="doc">
          <div class="tipo" style="font-size:18px">${esc(titolo)}</div>
          <div class="meta">Genzano di Roma, ${esc(dataIt(oggi))}<br>Rif. preventivo <b>${esc(p.numero)}</b></div>
        </div>
      </header>
      <section class="blocchi">
        ${bloccoIo}
        <div class="blocco">
          <div class="etichetta">Committente</div>
          <div class="nome">${esc(cliente.nome || "—")}</div>
          <div class="righe">${committenteRighe}</div>
        </div>
      </section>
      <div class="sezione">${pIva ? "Prestazione concordata" : "Prestazione svolta"}</div>
      <table class="voci">
        <colgroup>
          <col style="width:80%">
          <col style="width:20%">
        </colgroup>
        <thead><tr><th>Descrizione Prestazione</th><th class="num">Importo</th></tr></thead>
        <tbody><tr class="voice-item">
          <td>
            <span class="v-nome">${esc(progetto.titolo || "Prestazione professionale")}</span>
            <span class="v-desc">${esc(vociTitoli)}${progetto.luogo ? ` · ${esc(progetto.luogo)}` : ""}</span>
          </td>
          <td class="num col-totale">${euro(compenso)}</td>
        </tr></tbody>
      </table>
      ${renderTotalsBlock({
		...t,
		imponibile: compenso,
		sconto: 0
	}, {
		labelImponibile: pIva ? "Compenso" : "Compenso lordo",
		senzaNota: true,
		titoloTotale: pIva ? "Totale Documento" : "Netto a pagare"
	})}
      <div class="dicitura">${avvertenza}</div>
      <section class="pagamento">
        <div class="col">
          <div class="etichetta">Modalità di pagamento</div>
          <div class="val">Bonifico bancario</div>
          ${io.iban ? `IBAN ${esc(io.iban)}<br>` : ""}Intestato a ${esc(IO.nome)}
        </div>
        <div class="col">
          <div class="etichetta">Termini e Causale</div>
          <div class="val">30 giorni data documento</div>
          Causale: ${esc(titolo)} rif. ${esc(p.numero)}${progetto.titolo ? ` · ${esc(progetto.titolo)}` : ""}
        </div>
      </section>
      <div class="firma-singola sign-area">
        <div class="b">
          <div class="linea">${renderSignatureImg(showSignature)}</div>
          <div class="did">${esc(IO.nome)}</div>
        </div>
      </div>
      <div class="spazio-flessibile"></div>
      ${renderFooterHtml(p)}
    </div>
  </div>`;
}
/**
* Genera l'HTML A4 del Listino Interno.
*/
function renderPriceListDocumentHtml(items = [], issuer = {}) {
	const list = Array.isArray(items) ? items : [];
	const cats = [...new Set(list.map((v) => v.cat || "Altro"))];
	const oggi = aIsoLocale(/* @__PURE__ */ new Date());
	const sezioni = cats.map((c) => {
		const rows = list.filter((v) => (v.cat || "Altro") === c).map((v) => `<tr class="voice-item">
            <td>
              <span class="v-nome">${esc(v.nome)}</span>
              ${v.desc ? `<span class="v-desc">${esc(v.desc)}</span>` : ""}
            </td>
            <td class="num">${esc(v.unita || "—")}</td>
            <td class="num col-totale">${Number(v.prezzo) > 0 ? euro(v.prezzo) : "a preventivo"}</td>
          </tr>`).join("");
		return `<div class="sezione">${esc(c)}</div>
        <table class="voci">
          <colgroup><col style="width:66%"><col style="width:16%"><col style="width:18%"></colgroup>
          <thead><tr><th>Voce</th><th class="num">Unità</th><th class="num">Prezzo</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
	}).join("");
	return `<div class="doc-a4-root">
    <div class="foglio-stampa foglio-continuo">
      <header class="intestazione">
        <div class="intestazione-logo">${renderLogoImg(false)}</div>
        <div class="doc">
          <div class="tipo" style="font-size:19px">Listino interno</div>
          <div class="meta">Aggiornato al ${esc(dataIt(oggi))}<br>Documento di lavoro</div>
        </div>
      </header>
      <div class="dicitura" style="margin-bottom:14px">
        <b>Uso interno.</b> Prezzi di riferimento per la compilazione dei preventivi, al netto di sconti,
        imposte e maggiorazioni. Gli importi non costituiscono offerta al pubblico e vanno confermati caso per caso.
      </div>
      ${sezioni || `<p class="v-desc">Nessuna voce presente nel listino.</p>`}
      ${renderFooterHtml({ io: issuer })}
    </div>
  </div>`;
}
async function waitForPrintImages(container) {
	const imgs = [...container.querySelectorAll("img")];
	await Promise.all(imgs.map((img) => {
		if (img.complete) return Promise.resolve();
		return new Promise((resolve) => {
			img.addEventListener("load", resolve, { once: true });
			img.addEventListener("error", resolve, { once: true });
			setTimeout(resolve, 1500);
		});
	}));
}
async function mountAndPrint(html, docTitle) {
	const stage = document.getElementById("stampa");
	if (!stage) return;
	const prevTitle = document.title;
	stage.innerHTML = html;
	document.title = docTitle;
	await waitForPrintImages(stage);
	const restore = () => {
		document.title = prevTitle;
	};
	window.addEventListener("afterprint", restore, { once: true });
	window.print();
	setTimeout(restore, 1e3);
}
async function printQuoteDocument(quote, { showSignature = true } = {}) {
	await mountAndPrint(renderQuoteDocumentHtml(quote, { showSignature }), nomeFileDocumento("Preventivo", quote).replace(/\.pdf$/i, ""));
}
async function printSecondDocument(quote, { showSignature = true } = {}) {
	const t = calcolaTotali(quote);
	const tipo = t.haPartitaIva ? "Proforma" : "NotaPrestazione";
	await mountAndPrint(renderSecondDocumentHtml(quote, {
		showSignature,
		totals: t
	}), nomeFileDocumento(tipo, quote).replace(/\.pdf$/i, ""));
}
async function printPriceListDocument(items, issuer) {
	const oggi = aIsoLocale(/* @__PURE__ */ new Date());
	await mountAndPrint(renderPriceListDocumentHtml(items, issuer), `FC_Listino_Interno_${oggi}`);
}
// src/js/ui/editor-view.js
/**
* Vista Editor Preventivo (v2.0 Cloud-First).
* - Collegata allo Store centrale (zero DOM-as-Source-of-Truth)
* - Autocomplete clienti diretto dalla collezione /clienti (con clienteId, cf, sdi, pec)
* - Toggle sconto € / %
* - Riordino touch ↑ / ↓ su voci, opzioni e condizioni
* - Undo/Redo solo strutturale (pulsanti dedicati; Ctrl+Z nativo intatto nei campi testo)
* - Default Desktop: Editor + Sidebar compatta + toggle Split-Screen Anteprima A4 Live
* - Menu ⋯ Azioni secondarie (zero pulsante manuale "Salva nell'archivio", zero email generator)
*/
var _previewDebounce = null;
var _acOpen = false;
function swapItems(arr, i, j) {
	if (i < 0 || j < 0 || i >= arr.length || j >= arr.length) return;
	const tmp = arr[i];
	arr[i] = arr[j];
	arr[j] = tmp;
}
function setFieldValue(id, value) {
	const el = document.getElementById(id);
	if (!el) return;
	const next = String(value ?? "");
	if (el.value !== next) el.value = next;
}
/**
* Sincronizza tutti i campi scalari dell'editor dallo Store (su loadQuote / reset).
*/
function syncEditorScalarsFromStore() {
	const st = getState();
	const q = st.currentQuote;
	setFieldValue("f-numero", q.numero);
	setFieldValue("f-data", q.data);
	setFieldValue("f-validita", q.validita);
	setFieldValue("f-stato", q.stato);
	setFieldValue("f-cl-nome", q.cliente.nome);
	setFieldValue("f-cl-ref", q.cliente.ref);
	setFieldValue("f-cl-email", q.cliente.email);
	setFieldValue("f-cl-tel", q.cliente.tel);
	setFieldValue("f-cl-piva", q.cliente.piva);
	setFieldValue("f-cl-cf", q.cliente.cf);
	setFieldValue("f-cl-sdi", q.cliente.sdi);
	setFieldValue("f-cl-pec", q.cliente.pec);
	setFieldValue("f-cl-indirizzo", q.cliente.indirizzo);
	setFieldValue("f-pr-titolo", q.progetto.titolo);
	setFieldValue("f-pr-tipo", q.progetto.tipo);
	setFieldValue("f-pr-luogo", q.progetto.luogo);
	setFieldValue("f-pr-giornate", q.progetto.giornate);
	setFieldValue("f-pr-consegna", q.progetto.consegna);
	setFieldValue("f-pr-saluto", q.progetto.saluto);
	setFieldValue("f-pr-intro", q.progetto.intro);
	setFieldValue("f-sconto-val", q.scontoValore || "");
	setFieldValue("f-sconto-txt", q.sconto_txt);
	setFieldValue("f-regime", q.regime);
	setFieldValue("f-ritenuta", q.ritenuta);
	setFieldValue("f-rivalsa", q.rivalsa);
	setFieldValue("f-iva", q.iva);
	setFieldValue("f-bollo", q.bollo);
	setFieldValue("f-io-cf", q.io.cf);
	setFieldValue("f-io-piva", q.io.piva);
	setFieldValue("f-io-iban", q.io.iban);
	setFieldValue("f-io-indirizzo", q.io.indirizzo);
	document.querySelectorAll("[data-sconto-tipo]").forEach((btn) => {
		const active = btn.dataset.scontoTipo === q.scontoTipo;
		btn.classList.toggle("active", active);
		btn.setAttribute("aria-pressed", String(active));
	});
	const chkFirma = document.getElementById("f-firma-autografa");
	if (chkFirma) chkFirma.checked = st.signatureEnabled;
	const crmBadge = document.getElementById("editor-client-linked-badge");
	if (crmBadge) crmBadge.hidden = !q.cliente.clienteId;
	const trashBtn = document.querySelector("[data-editor-action='trash-current']");
	if (trashBtn) trashBtn.hidden = !st.isDraftPersisted;
	updateFiscalVisibility(q.regime);
	updateStructuralUndoButtons();
}
function updateFiscalVisibility(regime) {
	const haPiva = [
		"forf5",
		"forf15",
		"ordinario"
	].includes(regime);
	const haRit = regime === "occasionale" || regime === "ordinario";
	const haIva = regime === "ordinario";
	const haBollo = [
		"forf5",
		"forf15",
		"occasionale"
	].includes(regime);
	const toggle = (id, show) => {
		const el = document.getElementById(id);
		if (el) el.hidden = !show;
	};
	toggle("wrap-rivalsa", haPiva);
	toggle("wrap-ritenuta", haRit);
	toggle("wrap-iva", haIva);
	toggle("wrap-bollo", haBollo);
	const info = REGIMI_FISCALI.find((r) => r.id === regime);
	const hint = document.getElementById("fiscal-regime-hint");
	if (hint && info) hint.textContent = info.descrizione;
}
function updateStructuralUndoButtons() {
	const st = getState();
	const btnUndo = document.getElementById("btn-undo-struct");
	const btnRedo = document.getElementById("btn-redo-struct");
	if (btnUndo) btnUndo.disabled = st.structuralPast.length === 0;
	if (btnRedo) btnRedo.disabled = st.structuralFuture.length === 0;
}
function renderPriceListSelect() {
	const sel = document.getElementById("sel-listino");
	if (!sel) return;
	const items = getState().priceList;
	sel.innerHTML = `<option value="">+ Aggiungi dal listino…</option>` + [...new Set(items.map((v) => v.cat || "Altro"))].map((cat) => `<optgroup label="${esc(cat)}">` + items.filter((v) => (v.cat || "Altro") === cat).map((v) => `<option value="${esc(v.id)}">${esc(v.nome)} — ${euro(v.prezzo)}${v.unita ? ` / ${esc(v.unita)}` : ""}</option>`).join("") + `</optgroup>`).join("");
}
/**
* Renderizza le liste strutturali (Voci, Opzioni, Incluso/Escluso, Condizioni).
*/
function renderEditorLists() {
	const q = getState().currentQuote;
	const vociWrap = document.getElementById("editor-voci-list");
	if (vociWrap) vociWrap.innerHTML = q.voci.map((v, i) => {
		const sub = (Number(v.q) || 0) * (Number(v.p) || 0);
		return `<div class="line-item-card" data-voce-idx="${i}">
          <div class="line-item-top">
            <span class="line-idx">${String(i + 1).padStart(2, "0")}</span>
            <input type="text" class="field-input li-nome" data-li-field="nome" placeholder="Titolo prestazione (es. Giornata di ripresa)" value="${esc(v.nome)}">
            <div class="li-controls">
              <button type="button" class="icon-btn icon-sm" data-li-move="up" title="Sposta su" aria-label="Sposta voce su"${i === 0 ? " disabled" : ""}>↑</button>
              <button type="button" class="icon-btn icon-sm" data-li-move="down" title="Sposta giù" aria-label="Sposta voce giù"${i === q.voci.length - 1 ? " disabled" : ""}>↓</button>
              <button type="button" class="icon-btn icon-sm icon-danger" data-li-remove title="Rimuovi voce" aria-label="Rimuovi voce">✕</button>
            </div>
          </div>
          <div class="line-item-body">
            <textarea class="field-input li-desc" data-li-field="desc" rows="2" placeholder="Descrizione tecnica, attrezzatura, ore, deliverable…">${esc(v.desc)}</textarea>
            <div class="line-item-nums">
              <div class="mini-field">
                <label>Q.tà</label>
                <input type="number" step="0.5" min="0" class="field-input num-input" data-li-field="q" value="${v.q}">
              </div>
              <div class="mini-field">
                <label>Prezzo (€)</label>
                <input type="number" step="0.01" min="0" class="field-input num-input" data-li-field="p" value="${v.p}">
              </div>
              <div class="mini-field mini-total">
                <label>Subtotale</label>
                <span class="li-subtot">${euro(sub)}</span>
              </div>
            </div>
          </div>
        </div>`;
	}).join("");
	const opzWrap = document.getElementById("editor-opzioni-list");
	if (opzWrap) opzWrap.innerHTML = q.opzioni.length ? q.opzioni.map((o, i) => `<div class="sub-item-row" data-opz-idx="${i}">
              <div class="sub-item-fields">
                <input type="text" class="field-input field-sm" data-opz-field="nome" placeholder="Titolo opzione (es. Riprese aeree con drone)" value="${esc(o.nome)}">
                <input type="text" class="field-input field-sm" data-opz-field="desc" placeholder="Dettagli opzione" value="${esc(o.desc)}">
              </div>
              <input type="number" step="0.01" min="0" class="field-input field-sm num-input opz-price" data-opz-field="p" value="${o.p}" aria-label="Prezzo opzione">
              <div class="li-controls">
                <button type="button" class="icon-btn icon-sm" data-opz-move="up" aria-label="Sposta su"${i === 0 ? " disabled" : ""}>↑</button>
                <button type="button" class="icon-btn icon-sm" data-opz-move="down" aria-label="Sposta giù"${i === q.opzioni.length - 1 ? " disabled" : ""}>↓</button>
                <button type="button" class="icon-btn icon-sm icon-danger" data-opz-remove aria-label="Rimuovi opzione">✕</button>
              </div>
            </div>`).join("") : `<p class="muted-hint">Nessuna opzione aggiuntiva inserita.</p>`;
	const renderBullets = (list, kind, elId) => {
		const el = document.getElementById(elId);
		if (!el) return;
		el.innerHTML = list.map((txt, i) => `<div class="bullet-row" data-bullet-kind="${kind}" data-bullet-idx="${i}">
          <input type="text" class="field-input field-sm" data-bullet-input value="${esc(txt)}" placeholder="Voce…">
          <button type="button" class="icon-btn icon-sm icon-danger" data-bullet-remove aria-label="Rimuovi">✕</button>
        </div>`).join("");
	};
	renderBullets(q.incluso, "incluso", "editor-incluso-list");
	renderBullets(q.escluso, "escluso", "editor-escluso-list");
	const condWrap = document.getElementById("editor-condizioni-list");
	if (condWrap) condWrap.innerHTML = q.condizioni.map((c, i) => `<div class="cond-item-row" data-cond-idx="${i}">
          <div class="cond-item-head">
            <input type="text" class="field-input field-sm cond-tit-input" data-cond-field="titolo" placeholder="Titolo clausola" value="${esc(c.titolo)}">
            <div class="li-controls">
              <button type="button" class="icon-btn icon-sm" data-cond-move="up" aria-label="Sposta su"${i === 0 ? " disabled" : ""}>↑</button>
              <button type="button" class="icon-btn icon-sm" data-cond-move="down" aria-label="Sposta giù"${i === q.condizioni.length - 1 ? " disabled" : ""}>↓</button>
              <button type="button" class="icon-btn icon-sm icon-danger" data-cond-remove aria-label="Rimuovi clausola">✕</button>
            </div>
          </div>
          <textarea class="field-input field-sm" data-cond-field="testo" rows="2" placeholder="Testo clausola contrattuale…">${esc(c.testo)}</textarea>
        </div>`).join("");
	updateStructuralUndoButtons();
}
/**
* Aggiorna riepilogo numerico nella sidebar compatta + mobile bar + Anteprima A4 Live.
*/
function renderEditorSummaryAndPreview() {
	const st = getState();
	const q = st.currentQuote;
	const t = calcolaTotali(q);
	document.querySelectorAll("#editor-voci-list .line-item-card").forEach((card) => {
		const idx = Number(card.dataset.voceIdx);
		const v = q.voci[idx];
		const subEl = card.querySelector(".li-subtot");
		if (v && subEl) subEl.textContent = euro((Number(v.q) || 0) * (Number(v.p) || 0));
	});
	const sumBox = document.getElementById("sidebar-totals-box");
	if (sumBox) {
		const lines = [`<div class="sum-row"><span>Imponibile</span><strong>${euro(t.imponibile)}</strong></div>`];
		if (t.sconto > 0) {
			const label = t.scontoTipo === "perc" ? `Sconto (${t.scontoValore}%)` : "Sconto";
			lines.push(`<div class="sum-row is-muted"><span>${esc(label)}</span><span>− ${euro(t.sconto)}</span></div>`);
		}
		if (t.rivPerc > 0) lines.push(`<div class="sum-row is-muted"><span>${t.rivPerc === 2 ? "Cassa" : "Rivalsa INPS"} ${t.rivPerc}%</span><span>${euro(t.rivalsa)}</span></div>`);
		if (t.ivaPerc > 0) lines.push(`<div class="sum-row is-muted"><span>IVA ${t.ivaPerc}%</span><span>${euro(t.iva)}</span></div>`);
		if (t.bollo > 0) lines.push(`<div class="sum-row is-muted"><span>Marca da bollo</span><span>${euro(t.bollo)}</span></div>`);
		if (t.ritenuta > 0) {
			lines.push(`<div class="sum-row"><span>Totale documento</span><strong>${euro(t.totaleDoc)}</strong></div>`);
			lines.push(`<div class="sum-row is-muted"><span>Ritenuta ${t.ritPerc}%</span><span>− ${euro(t.ritenuta)}</span></div>`);
		}
		lines.push(`<div class="sum-total"><span>Totale Netto</span><strong>${euro(t.netto)}</strong></div>`);
		sumBox.innerHTML = lines.join("");
	}
	const headerNum = document.getElementById("editor-doc-badge");
	if (headerNum) headerNum.textContent = `N. ${q.numero}`;
	const mobileTot = document.getElementById("mobile-bar-total");
	if (mobileTot) mobileTot.textContent = euro(t.netto);
	const workspace = document.getElementById("editor-workspace");
	const previewPane = document.getElementById("editor-preview-pane");
	const toggleBtn = document.getElementById("btn-toggle-split-preview");
	if (workspace) workspace.classList.toggle("is-split-open", st.splitPreviewOpen);
	if (previewPane) previewPane.hidden = !st.splitPreviewOpen;
	if (toggleBtn) {
		toggleBtn.classList.toggle("active", st.splitPreviewOpen);
		toggleBtn.setAttribute("aria-pressed", String(st.splitPreviewOpen));
	}
	if (st.splitPreviewOpen) {
		clearTimeout(_previewDebounce);
		_previewDebounce = setTimeout(() => {
			renderLivePreviewInto("a4-preview-stage");
		}, 90);
	}
}
function renderLivePreviewInto(containerId) {
	const stage = document.getElementById(containerId);
	if (!stage) return;
	const st = getState();
	stage.innerHTML = renderQuoteDocumentHtml(st.currentQuote, { showSignature: st.signatureEnabled });
}
/**
* Autocomplete clienti da /clienti nell'editor.
*/
function renderClientAutocomplete(query) {
	const listEl = document.getElementById("client-autocomplete-list");
	if (!listEl) return;
	const q = String(query || "").trim().toLowerCase();
	const matches = getState().clients.filter((c) => {
		if (!q) return true;
		return `${c.nome} ${c.ref || ""} ${c.piva || ""} ${c.email || ""}`.toLowerCase().includes(q);
	}).slice(0, 8);
	if (!matches.length) {
		listEl.hidden = true;
		_acOpen = false;
		return;
	}
	listEl.innerHTML = matches.map((c) => `<button type="button" class="ac-option" data-ac-client-id="${esc(c.id)}">
        <span class="ac-name">${esc(c.nome)}</span>
        <span class="ac-meta">${esc([
		c.ref,
		c.piva,
		c.email
	].filter(Boolean).join(" · "))}</span>
      </button>`).join("");
	listEl.hidden = false;
	_acOpen = true;
}
function closeClientAutocomplete() {
	const listEl = document.getElementById("client-autocomplete-list");
	if (listEl) listEl.hidden = true;
	_acOpen = false;
}
async function openVerifyModal() {
	const st = getState();
	const res = verificaPreventivo(st.currentQuote, st.quotes);
	const renderSection = (title, items, cls) => {
		if (!items.length) return "";
		return `<div class="verify-group ${cls}">
      <h4>${title} (${items.length})</h4>
      <ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </div>`;
	};
	const body = res.errori.length === 0 && res.avvisi.length === 0 && res.suggerimenti.length === 0 ? `<div class="verify-ok">Il preventivo è completo e coerente in tutti i campi fiscali e descrittivi.</div>` : renderSection("Errori da correggere", res.errori, "v-err") + renderSection("Avvisi fiscali", res.avvisi, "v-warn") + renderSection("Suggerimenti", res.suggerimenti, "v-info");
	if (await openModal({
		title: "Verifica Preventivo",
		subtitle: `Preventivo N. ${st.currentQuote.numero}`,
		bodyHtml: body,
		size: "md",
		buttons: [{
			label: "Chiudi",
			value: "close",
			variant: "ghost"
		}, {
			label: "Stampa PDF comunque",
			value: "print",
			variant: "primary"
		}]
	}) === "print") await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
}
async function openMobilePreviewSheet() {
	const st = getState();
	const html = renderQuoteDocumentHtml(st.currentQuote, { showSignature: st.signatureEnabled });
	if (await openModal({
		title: `Anteprima A4 — N. ${st.currentQuote.numero}`,
		subtitle: "Identica al PDF esportato in stampa",
		size: "lg",
		bodyHtml: `<div class="modal-a4-scroll"><div class="a4-sheet-frame">${html}</div></div>`,
		buttons: [{
			label: "Chiudi",
			value: "close",
			variant: "ghost"
		}, {
			label: "Stampa / Salva PDF",
			value: "print",
			variant: "primary"
		}]
	}) === "print") await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
}
function initEditorView({ onTriggerImport }) {
	const root = document.getElementById("vista-editor");
	if (!root) return;
	const selStato = document.getElementById("f-stato");
	if (selStato) selStato.innerHTML = STATI_PREVENTIVO.map((s) => `<option value="${esc(s.id)}">${esc(s.label)}</option>`).join("");
	const selRegime = document.getElementById("f-regime");
	if (selRegime) selRegime.innerHTML = REGIMI_FISCALI.map((r) => `<option value="${esc(r.id)}">${esc(r.label)}</option>`).join("");
	const scalarHandlers = {
		"f-numero": (q, v) => {
			q.numero = v;
		},
		"f-data": (q, v) => {
			q.data = v;
			if (v) {
				q.validita = aggiungiGiorni(v, 30);
				setFieldValue("f-validita", q.validita);
			}
		},
		"f-validita": (q, v) => {
			q.validita = v;
		},
		"f-stato": (q, v) => {
			q.stato = v;
		},
		"f-cl-nome": (q, v) => {
			q.cliente.nome = v;
			q.cliente.clienteId = "";
			const badge = document.getElementById("editor-client-linked-badge");
			if (badge) badge.hidden = true;
		},
		"f-cl-ref": (q, v) => {
			q.cliente.ref = v;
		},
		"f-cl-email": (q, v) => {
			q.cliente.email = v;
		},
		"f-cl-tel": (q, v) => {
			q.cliente.tel = v;
		},
		"f-cl-piva": (q, v) => {
			q.cliente.piva = v;
		},
		"f-cl-cf": (q, v) => {
			q.cliente.cf = v;
		},
		"f-cl-sdi": (q, v) => {
			q.cliente.sdi = v.toUpperCase();
		},
		"f-cl-pec": (q, v) => {
			q.cliente.pec = v;
		},
		"f-cl-indirizzo": (q, v) => {
			q.cliente.indirizzo = v;
		},
		"f-pr-titolo": (q, v) => {
			q.progetto.titolo = v;
		},
		"f-pr-tipo": (q, v) => {
			q.progetto.tipo = v;
		},
		"f-pr-luogo": (q, v) => {
			q.progetto.luogo = v;
		},
		"f-pr-giornate": (q, v) => {
			q.progetto.giornate = v;
		},
		"f-pr-consegna": (q, v) => {
			q.progetto.consegna = v;
		},
		"f-pr-saluto": (q, v) => {
			q.progetto.saluto = v;
		},
		"f-pr-intro": (q, v) => {
			q.progetto.intro = v;
		},
		"f-sconto-val": (q, v) => {
			q.scontoValore = Math.max(0, parseFloat(v) || 0);
		},
		"f-sconto-txt": (q, v) => {
			q.sconto_txt = v;
		},
		"f-regime": (q, v) => {
			q.regime = v;
			if (v === "occasionale") {
				q.ritenuta = 20;
				q.rivalsa = 0;
				setFieldValue("f-ritenuta", 20);
				setFieldValue("f-rivalsa", 0);
			} else if (v === "forf5" || v === "forf15") {
				q.ritenuta = 0;
				q.iva = 0;
				setFieldValue("f-ritenuta", 0);
			} else if (v === "ordinario") {
				if (!q.iva) {
					q.iva = 22;
					setFieldValue("f-iva", 22);
				}
			}
			updateFiscalVisibility(v);
		},
		"f-ritenuta": (q, v) => {
			q.ritenuta = Math.min(100, Math.max(0, parseFloat(v) || 0));
		},
		"f-rivalsa": (q, v) => {
			q.rivalsa = Math.min(100, Math.max(0, parseFloat(v) || 0));
		},
		"f-iva": (q, v) => {
			q.iva = Math.min(100, Math.max(0, parseFloat(v) || 0));
		},
		"f-bollo": (q, v) => {
			q.bollo = v;
		}
	};
	const issuerFields = {
		"f-io-cf": "cf",
		"f-io-piva": "piva",
		"f-io-iban": "iban",
		"f-io-indirizzo": "indirizzo"
	};
	let issuerSaveTimer = null;
	root.addEventListener("input", (e) => {
		const target = e.target;
		if (target.id === "f-cl-nome") renderClientAutocomplete(target.value);
		if (scalarHandlers[target.id]) {
			actions.updateCurrentQuote((q) => scalarHandlers[target.id](q, target.value));
			scheduleQuoteAutosave();
			return;
		}
		if (issuerFields[target.id]) {
			const key = issuerFields[target.id];
			const nextIssuer = {
				...getState().issuer,
				[key]: target.value
			};
			actions.setIssuer(nextIssuer);
			actions.updateCurrentQuote((q) => {
				q.io[key] = target.value;
			});
			scheduleQuoteAutosave();
			clearTimeout(issuerSaveTimer);
			issuerSaveTimer = setTimeout(() => {
				saveIssuerToCloud(getState().issuer);
			}, 900);
			return;
		}
		const voceCard = target.closest("[data-voce-idx]");
		if (voceCard && target.dataset.liField) {
			const idx = Number(voceCard.dataset.voceIdx);
			const field = target.dataset.liField;
			actions.updateCurrentQuote((q) => {
				if (!q.voci[idx]) return;
				q.voci[idx][field] = field === "q" || field === "p" ? Math.max(0, parseFloat(target.value) || 0) : target.value;
			});
			scheduleQuoteAutosave();
			return;
		}
		const opzRow = target.closest("[data-opz-idx]");
		if (opzRow && target.dataset.opzField) {
			const idx = Number(opzRow.dataset.opzIdx);
			const field = target.dataset.opzField;
			actions.updateCurrentQuote((q) => {
				if (!q.opzioni[idx]) return;
				q.opzioni[idx][field] = field === "p" ? Math.max(0, parseFloat(target.value) || 0) : target.value;
			});
			scheduleQuoteAutosave();
			return;
		}
		const bulletRow = target.closest("[data-bullet-idx]");
		if (bulletRow && target.hasAttribute("data-bullet-input")) {
			const kind = bulletRow.dataset.bulletKind;
			const idx = Number(bulletRow.dataset.bulletIdx);
			actions.updateCurrentQuote((q) => {
				if (q[kind] && q[kind][idx] !== void 0) q[kind][idx] = target.value;
			});
			scheduleQuoteAutosave();
			return;
		}
		const condRow = target.closest("[data-cond-idx]");
		if (condRow && target.dataset.condField) {
			const idx = Number(condRow.dataset.condIdx);
			const field = target.dataset.condField;
			actions.updateCurrentQuote((q) => {
				if (q.condizioni[idx]) q.condizioni[idx][field] = target.value;
			});
			scheduleQuoteAutosave();
		}
	});
	root.addEventListener("change", (e) => {
		const target = e.target;
		if (target.id === "f-firma-autografa") {
			actions.setSignatureEnabled(target.checked);
			return;
		}
		if (target.id === "sel-listino" && target.value) {
			const item = getState().priceList.find((v) => v.id === target.value);
			target.value = "";
			if (!item) return;
			actions.updateCurrentQuote((q) => {
				const emptyIdx = q.voci.findIndex((v) => !v.nome.trim() && !(Number(v.p) > 0));
				const nuova = {
					nome: item.nome,
					desc: item.desc || "",
					q: 1,
					p: Number(item.prezzo) || 0
				};
				if (emptyIdx >= 0) q.voci.splice(emptyIdx, 1, nuova);
				else q.voci.push(nuova);
			}, { structural: true });
			scheduleQuoteAutosave();
			showToast(`Voce «${item.nome}» aggiunta dal listino.`);
			return;
		}
		if (scalarHandlers[target.id]) {
			actions.updateCurrentQuote((q) => scalarHandlers[target.id](q, target.value));
			scheduleQuoteAutosave();
		}
	});
	const clNomeInput = document.getElementById("f-cl-nome");
	clNomeInput?.addEventListener("focus", () => {
		if (getState().clients.length > 0) renderClientAutocomplete(clNomeInput.value);
	});
	document.addEventListener("click", (e) => {
		if (_acOpen && !e.target.closest(".client-ac-wrap")) closeClientAutocomplete();
		const dropdown = document.getElementById("editor-more-menu");
		if (dropdown && !dropdown.hidden && !e.target.closest(".more-menu-wrap")) dropdown.hidden = true;
	});
	root.addEventListener("click", async (e) => {
		const acBtn = e.target.closest("[data-ac-client-id]");
		if (acBtn) {
			const c = getState().clients.find((x) => x.id === acBtn.dataset.acClientId);
			closeClientAutocomplete();
			if (!c) return;
			actions.updateCurrentQuote((q) => {
				q.cliente = {
					clienteId: c.id,
					nome: c.nome || "",
					ref: c.ref || "",
					indirizzo: c.indirizzo || "",
					piva: c.piva || "",
					cf: c.cf || "",
					sdi: c.sdi || "",
					pec: c.pec || "",
					email: c.email || "",
					tel: c.tel || ""
				};
				if (c.ref && (!q.progetto.saluto || q.progetto.saluto === "Gentile Cliente,")) q.progetto.saluto = `Gentile ${c.ref},`;
			});
			syncEditorScalarsFromStore();
			scheduleQuoteAutosave();
			showToast(`Cliente «${c.nome}» collegato dalla rubrica.`);
			return;
		}
		const scontoBtn = e.target.closest("[data-sconto-tipo]");
		if (scontoBtn) {
			const tipo = scontoBtn.dataset.scontoTipo === "perc" ? "perc" : "euro";
			actions.updateCurrentQuote((q) => {
				q.scontoTipo = tipo;
				q.progetto.scontoTipo = tipo;
				if (tipo === "perc" && q.scontoValore > 100) q.scontoValore = 100;
			});
			syncEditorScalarsFromStore();
			scheduleQuoteAutosave();
			return;
		}
		const voceCard = e.target.closest("[data-voce-idx]");
		if (voceCard) {
			const idx = Number(voceCard.dataset.voceIdx);
			const moveBtn = e.target.closest("[data-li-move]");
			if (moveBtn) {
				const dir = moveBtn.dataset.liMove === "up" ? -1 : 1;
				actions.updateCurrentQuote((q) => swapItems(q.voci, idx, idx + dir), { structural: true });
				scheduleQuoteAutosave();
				return;
			}
			if (e.target.closest("[data-li-remove]")) {
				actions.updateCurrentQuote((q) => {
					if (q.voci.length <= 1) q.voci[0] = {
						nome: "",
						desc: "",
						q: 1,
						p: 0
					};
					else q.voci.splice(idx, 1);
				}, { structural: true });
				scheduleQuoteAutosave();
				return;
			}
		}
		const opzRow = e.target.closest("[data-opz-idx]");
		if (opzRow) {
			const idx = Number(opzRow.dataset.opzIdx);
			const moveBtn = e.target.closest("[data-opz-move]");
			if (moveBtn) {
				const dir = moveBtn.dataset.opzMove === "up" ? -1 : 1;
				actions.updateCurrentQuote((q) => swapItems(q.opzioni, idx, idx + dir), { structural: true });
				scheduleQuoteAutosave();
				return;
			}
			if (e.target.closest("[data-opz-remove]")) {
				actions.updateCurrentQuote((q) => q.opzioni.splice(idx, 1), { structural: true });
				scheduleQuoteAutosave();
				return;
			}
		}
		const bulletRow = e.target.closest("[data-bullet-idx]");
		if (bulletRow && e.target.closest("[data-bullet-remove]")) {
			const kind = bulletRow.dataset.bulletKind;
			const idx = Number(bulletRow.dataset.bulletIdx);
			actions.updateCurrentQuote((q) => q[kind]?.splice(idx, 1), { structural: true });
			scheduleQuoteAutosave();
			return;
		}
		const condRow = e.target.closest("[data-cond-idx]");
		if (condRow) {
			const idx = Number(condRow.dataset.condIdx);
			const moveBtn = e.target.closest("[data-cond-move]");
			if (moveBtn) {
				const dir = moveBtn.dataset.condMove === "up" ? -1 : 1;
				actions.updateCurrentQuote((q) => swapItems(q.condizioni, idx, idx + dir), { structural: true });
				scheduleQuoteAutosave();
				return;
			}
			if (e.target.closest("[data-cond-remove]")) {
				actions.updateCurrentQuote((q) => q.condizioni.splice(idx, 1), { structural: true });
				scheduleQuoteAutosave();
				return;
			}
		}
		const actBtn = e.target.closest("[data-editor-action]");
		if (!actBtn) return;
		const action = actBtn.dataset.editorAction;
		const st = getState();
		const moreMenu = document.getElementById("editor-more-menu");
		if (moreMenu && action !== "toggle-more-menu") moreMenu.hidden = true;
		switch (action) {
			case "toggle-more-menu":
				if (moreMenu) moreMenu.hidden = !moreMenu.hidden;
				break;
			case "add-voce":
				actions.updateCurrentQuote((q) => q.voci.push({
					nome: "",
					desc: "",
					q: 1,
					p: 0
				}), { structural: true });
				scheduleQuoteAutosave();
				{
					const cards = document.querySelectorAll("#editor-voci-list .li-nome");
					cards[cards.length - 1]?.focus();
				}
				break;
			case "apply-package": {
				const pkg = PACCHETTI[actBtn.dataset.package];
				if (!pkg) return;
				if (st.currentQuote.voci.some((v) => v.nome.trim() || v.p > 0)) {
					if (!await confirmModal({
						title: "Carica pacchetto preimpostato",
						message: "Vuoi aggiungere le voci del pacchetto a quelle già presenti?",
						confirmLabel: "Aggiungi voci",
						cancelLabel: "Annulla"
					})) return;
				}
				actions.updateCurrentQuote((q) => {
					q.voci = [...q.voci.filter((v) => v.nome.trim() || v.p > 0), ...pkg.map((item) => ({ ...item }))];
				}, { structural: true });
				scheduleQuoteAutosave();
				showToast("Pacchetto inserito nelle voci di preventivo.");
				break;
			}
			case "add-opzione":
				actions.updateCurrentQuote((q) => q.opzioni.push({
					nome: "",
					desc: "",
					p: 0
				}), { structural: true });
				scheduleQuoteAutosave();
				break;
			case "add-incluso":
				actions.updateCurrentQuote((q) => q.incluso.push(""), { structural: true });
				scheduleQuoteAutosave();
				break;
			case "add-escluso":
				actions.updateCurrentQuote((q) => q.escluso.push(""), { structural: true });
				scheduleQuoteAutosave();
				break;
			case "add-condizione":
				actions.updateCurrentQuote((q) => q.condizioni.push({
					titolo: "",
					testo: ""
				}), { structural: true });
				scheduleQuoteAutosave();
				break;
			case "undo-struct":
				if (actions.undoStructural()) {
					scheduleQuoteAutosave();
					showToast("Modifica strutturale annullata.");
				}
				break;
			case "redo-struct":
				if (actions.redoStructural()) {
					scheduleQuoteAutosave();
					showToast("Modifica strutturale ripristinata.");
				}
				break;
			case "save-client-to-crm": {
				const cl = st.currentQuote.cliente;
				if (!cl.nome.trim()) {
					showToast("Inserisci prima il nome del cliente.", { type: "error" });
					return;
				}
				const saved = await saveClientToCloud({
					id: cl.clienteId || generaId("cli"),
					nome: cl.nome,
					ref: cl.ref,
					indirizzo: cl.indirizzo,
					piva: cl.piva,
					cf: cl.cf,
					sdi: cl.sdi,
					pec: cl.pec,
					email: cl.email,
					tel: cl.tel
				});
				if (saved) {
					actions.updateCurrentQuote((q) => {
						q.cliente.clienteId = saved.id;
					});
					syncEditorScalarsFromStore();
					scheduleQuoteAutosave();
					showToast(`Cliente «${saved.nome}» salvato nella rubrica CRM.`, { type: "success" });
				}
				break;
			}
			case "toggle-split-preview":
				if (window.innerWidth <= 1024) await openMobilePreviewSheet();
				else actions.toggleSplitPreview();
				break;
			case "print-quote":
				await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
				break;
			case "print-proforma":
				await printSecondDocument(st.currentQuote, { showSignature: st.signatureEnabled });
				break;
			case "verify-quote":
				await openVerifyModal();
				break;
			case "new-quote":
				actions.newQuote();
				showToast("Nuovo preventivo pronto.");
				break;
			case "duplicate-current": {
				const copy = sanificaPreventivo({
					...st.currentQuote,
					id: generaId("p"),
					numero: prossimoNumero(st.quotes),
					stato: "bozza",
					cestinato: false,
					eliminatoIl: null,
					modificato: (/* @__PURE__ */ new Date()).toISOString()
				});
				await saveQuoteToCloud(copy);
				actions.loadQuoteIntoEditor(copy, { persisted: true });
				showToast(`Duplicato come preventivo ${copy.numero}.`, { type: "success" });
				break;
			}
			case "export-current-json":
				exportSingleQuoteJson(st.currentQuote);
				break;
			case "import-json":
				onTriggerImport?.();
				break;
			case "reset-standard-texts":
				if (!await confirmModal({
					title: "Ripristina testi standard",
					message: "Vuoi ripristinare le voci «Incluso / Escluso» e le 8 clausole contrattuali predefinite per questo preventivo?",
					confirmLabel: "Ripristina"
				})) return;
				actions.updateCurrentQuote((q) => {
					q.incluso = [...INCLUSO_STD];
					q.escluso = [...ESCLUSO_STD];
					q.condizioni = CONDIZIONI_STD.map((c) => ({ ...c }));
				}, { structural: true });
				scheduleQuoteAutosave();
				showToast("Testi contrattuali standard ripristinati.");
				break;
			case "trash-current":
				if (!st.isDraftPersisted) return;
				if (!await confirmModal({
					title: "Sposta nel cestino",
					message: `Spostare il preventivo ${st.currentQuote.numero} nel cestino?`,
					confirmLabel: "Sposta nel cestino",
					danger: true
				})) return;
				await moveQuotesToTrash(st.currentQuote.id);
				actions.newQuote();
				showToast("Preventivo spostato nel cestino.");
		}
	});
}
// src/js/ui/archive-view.js
/**
* Vista Archivio & Cestino Cloud-First.
* - KPI calcolati con motore fiscale puro (calcolaTotali)
* - Vista cronologica o raggruppata per cliente
* - Ricerca, filtro stato, ordinamento, azioni batch
* - Cestino 100% Cloud (cestinato: true/false), zero inline onclick
*/
function statusLabel(stato) {
	return STATI_PREVENTIVO.find((s) => s.id === stato)?.label || "Bozza";
}
function sortQuotes(list, sortKey) {
	const arr = list.slice();
	switch (sortKey) {
		case "data_desc": return arr.sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
		case "data_asc": return arr.sort((a, b) => String(a.data || "").localeCompare(String(b.data || "")));
		case "numero_desc": return arr.sort((a, b) => String(b.numero || "").localeCompare(String(a.numero || ""), "it", { numeric: true }));
		case "totale_desc": return arr.sort((a, b) => calcolaTotali(b).netto - calcolaTotali(a).netto);
		case "cliente_asc": return arr.sort((a, b) => String(a.cliente?.nome || "").localeCompare(String(b.cliente?.nome || ""), "it"));
		default: return arr.sort((a, b) => String(b.modificato || "").localeCompare(String(a.modificato || "")));
	}
}
function getFilteredArchiveList() {
	const st = getState();
	const isTrash = st.archiveStatusFilter === "cestino";
	const base = isTrash ? getTrashedQuotes() : getActiveQuotes();
	const q = st.archiveSearch.trim().toLowerCase();
	return sortQuotes(base.filter((item) => {
		if (!isTrash && st.archiveStatusFilter !== "tutti" && item.stato !== st.archiveStatusFilter) return false;
		if (!q) return true;
		return [
			item.numero,
			item.cliente?.nome,
			item.cliente?.ref,
			item.progetto?.titolo,
			item.progetto?.tipo,
			item.progetto?.luogo
		].filter(Boolean).join(" ").toLowerCase().includes(q);
	}), st.archiveSort);
}
function renderStatusSelect(quote) {
	const opts = STATI_PREVENTIVO.map((s) => `<option value="${esc(s.id)}"${quote.stato === s.id ? " selected" : ""}>${esc(s.label)}</option>`).join("");
	return `<select class="status-select status-${esc(quote.stato)}" data-action="change-status" data-id="${esc(quote.id)}" aria-label="Stato preventivo ${esc(quote.numero)}">${opts}</select>`;
}
function renderQuoteRow(quote, { isTrash, isSelected, isCurrent }) {
	const t = calcolaTotali(quote);
	const cliente = quote.cliente?.nome || "Cliente non indicato";
	const progetto = quote.progetto?.titolo || "Senza titolo";
	if (isTrash) return `<tr class="archive-row${isSelected ? " is-selected" : ""}" data-id="${esc(quote.id)}">
      <td class="col-check">
        <input type="checkbox" class="row-check" data-action="toggle-select" data-id="${esc(quote.id)}"${isSelected ? " checked" : ""} aria-label="Seleziona ${esc(quote.numero)}">
      </td>
      <td class="col-num">
        <span class="mono-num">${esc(quote.numero)}</span>
        <span class="row-sub">Eliminato il ${esc(dataBreve(quote.eliminatoIl))}</span>
      </td>
      <td class="col-main">
        <div class="row-title">${esc(cliente)}</div>
        <div class="row-sub">${esc(progetto)}</div>
      </td>
      <td class="col-date">${esc(dataBreve(quote.data))}</td>
      <td class="col-status"><span class="status-tag status-${esc(quote.stato)}">${esc(statusLabel(quote.stato))}</span></td>
      <td class="col-amount">${euro(t.netto)}</td>
      <td class="col-actions">
        <div class="row-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="restore-one" data-id="${esc(quote.id)}">Ripristina</button>
          <button type="button" class="btn btn-danger btn-sm" data-action="delete-one" data-id="${esc(quote.id)}">Elimina</button>
        </div>
      </td>
    </tr>`;
	return `<tr class="archive-row${isSelected ? " is-selected" : ""}${isCurrent ? " is-current" : ""}" data-id="${esc(quote.id)}">
    <td class="col-check">
      <input type="checkbox" class="row-check" data-action="toggle-select" data-id="${esc(quote.id)}"${isSelected ? " checked" : ""} aria-label="Seleziona ${esc(quote.numero)}">
    </td>
    <td class="col-num">
      <button type="button" class="link-num" data-action="open-quote" data-id="${esc(quote.id)}">${esc(quote.numero)}</button>
      ${isCurrent ? `<span class="current-dot" title="Aperto nell'editor">Aperto</span>` : ""}
    </td>
    <td class="col-main">
      <button type="button" class="row-open-trigger" data-action="open-quote" data-id="${esc(quote.id)}">
        <span class="row-title">${esc(cliente)}</span>
        <span class="row-sub">${esc(progetto)}</span>
      </button>
    </td>
    <td class="col-date">${esc(dataBreve(quote.data))}</td>
    <td class="col-status">${renderStatusSelect(quote)}</td>
    <td class="col-amount">${euro(t.netto)}</td>
    <td class="col-actions">
      <div class="row-actions">
        <button type="button" class="icon-btn" title="Stampa PDF Preventivo" data-action="print-quote" data-id="${esc(quote.id)}" aria-label="Stampa PDF">PDF</button>
        <button type="button" class="icon-btn" title="Proforma / Nota di prestazione" data-action="print-proforma" data-id="${esc(quote.id)}" aria-label="Stampa Proforma">Nota</button>
        <button type="button" class="icon-btn" title="Duplica preventivo" data-action="duplicate-quote" data-id="${esc(quote.id)}" aria-label="Duplica">Duplica</button>
        <button type="button" class="icon-btn" title="Esporta JSON" data-action="export-json" data-id="${esc(quote.id)}" aria-label="Esporta JSON">JSON</button>
        <button type="button" class="icon-btn icon-danger" title="Sposta nel cestino" data-action="trash-one" data-id="${esc(quote.id)}" aria-label="Sposta nel cestino">✕</button>
      </div>
    </td>
  </tr>`;
}
function renderGroupedByClient(items, st) {
	const groups = /* @__PURE__ */ new Map();
	for (const q of items) {
		const label = String(q.cliente?.nome || "").trim() || "Cliente non indicato";
		const key = q.cliente?.clienteId || normalizzaChiave(label) || "__none__";
		if (!groups.has(key)) groups.set(key, {
			key,
			label,
			items: [],
			totalNetto: 0,
			acceptedNetto: 0
		});
		const g = groups.get(key);
		g.items.push(q);
		const val = calcolaTotali(q).netto;
		g.totalNetto += val;
		if (q.stato === "accettato") g.acceptedNetto += val;
	}
	const sortedGroups = [...groups.values()].sort((a, b) => a.label.localeCompare(b.label, "it"));
	return sortedGroups.map((g) => {
		const isOpen = st.openClientGroups.has(g.key) || sortedGroups.length <= 3;
		const rows = isOpen ? `<div class="table-scroll">
            <table class="data-table archive-table">
              <tbody>
                ${g.items.map((q) => renderQuoteRow(q, {
			isTrash: false,
			isSelected: st.selectedArchiveIds.has(q.id),
			isCurrent: st.currentQuote?.id === q.id
		})).join("")}
              </tbody>
            </table>
          </div>` : "";
		return `<section class="client-group-card${isOpen ? " is-open" : ""}">
        <button type="button" class="client-group-head" data-action="toggle-group" data-group="${esc(g.key)}" aria-expanded="${isOpen}">
          <div class="cg-left">
            <span class="cg-chevron">${isOpen ? "▾" : "▸"}</span>
            <span class="cg-name">${esc(g.label)}</span>
            <span class="cg-count">${g.items.length} ${g.items.length === 1 ? "preventivo" : "preventivi"}</span>
          </div>
          <div class="cg-right">
            <span class="cg-stat">Accettati: <strong>${euro(g.acceptedNetto)}</strong></span>
            <span class="cg-stat">Totale: <strong>${euro(g.totalNetto)}</strong></span>
          </div>
        </button>
        ${rows}
      </section>`;
	}).join("");
}
function renderArchiveView() {
	const container = document.getElementById("archive-view-root");
	if (!container) return;
	const st = getState();
	const active = getActiveQuotes();
	const trashed = getTrashedQuotes();
	const isTrash = st.archiveStatusFilter === "cestino";
	const items = getFilteredArchiveList();
	let totAccettato = 0;
	let totInAttesa = 0;
	let countAccettati = 0;
	let countChiusi = 0;
	for (const q of active) {
		const net = calcolaTotali(q).netto;
		if (q.stato === "accettato") {
			totAccettato += net;
			countAccettati += 1;
			countChiusi += 1;
		} else if (q.stato === "inviato") totInAttesa += net;
		else if (q.stato === "rifiutato") countChiusi += 1;
	}
	const convRate = countChiusi > 0 ? Math.round(countAccettati / countChiusi * 100) : 0;
	const navCount = document.getElementById("nav-archive-count");
	if (navCount) navCount.textContent = String(active.length);
	const counts = {
		tutti: active.length,
		bozza: active.filter((q) => q.stato === "bozza").length,
		inviato: active.filter((q) => q.stato === "inviato").length,
		accettato: active.filter((q) => q.stato === "accettato").length,
		rifiutato: active.filter((q) => q.stato === "rifiutato").length,
		annullato: active.filter((q) => q.stato === "annullato").length,
		cestino: trashed.length
	};
	const filterButtons = [
		["tutti", "Tutti"],
		["bozza", "Bozze"],
		["inviato", "Inviati"],
		["accettato", "Accettati"],
		["rifiutato", "Rifiutati"],
		["annullato", "Annullati"],
		["cestino", "Cestino"]
	].map(([id, label]) => `<button type="button" class="filter-tab${st.archiveStatusFilter === id ? " active" : ""}${id === "cestino" ? " is-trash" : ""}" data-action="set-status-filter" data-value="${id}">
          <span>${label}</span>
          <span class="filter-count">${counts[id]}</span>
        </button>`).join("");
	const selectedCount = st.selectedArchiveIds.size;
	const allVisibleSelected = items.length > 0 && items.every((q) => st.selectedArchiveIds.has(q.id));
	const bulkBarHtml = selectedCount ? `<div class="bulk-bar">
        <span class="bulk-count"><strong>${selectedCount}</strong> selezionati</span>
        <div class="bulk-actions">
          ${isTrash ? `<button type="button" class="btn btn-secondary btn-sm" data-action="bulk-restore">Ripristina</button>
                 <button type="button" class="btn btn-danger btn-sm" data-action="bulk-delete">Elimina definitivamente</button>` : `<select class="field-input field-sm" data-action="bulk-status" aria-label="Cambia stato ai selezionati">
                   <option value="">Cambia stato…</option>
                   ${STATI_PREVENTIVO.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}
                 </select>
                 <button type="button" class="btn btn-danger btn-sm" data-action="bulk-trash">Sposta nel cestino</button>`}
          <button type="button" class="btn btn-ghost btn-sm" data-action="clear-selection">Deseleziona</button>
        </div>
      </div>` : "";
	let bodyHtml = "";
	if (items.length === 0) bodyHtml = `<div class="empty-state">
      <p class="empty-title">${isTrash ? "Il cestino è vuoto" : "Nessun preventivo trovato"}</p>
      <p class="empty-desc">${isTrash ? "I preventivi spostati nel cestino restano sincronizzati nel Cloud finché non li elimini definitivamente." : "Prova a rimuovere i filtri di ricerca oppure crea un nuovo preventivo."}</p>
      ${!isTrash ? `<button type="button" class="btn btn-primary" data-action="new-quote-from-archive">+ Nuovo preventivo</button>` : ""}
    </div>`;
	else if (!isTrash && st.archiveViewMode === "clienti") bodyHtml = renderGroupedByClient(items, st);
	else bodyHtml = `<div class="table-card">
      <div class="table-scroll">
        <table class="data-table archive-table">
          <thead>
            <tr>
              <th class="col-check">
                <input type="checkbox" data-action="toggle-select-all"${allVisibleSelected ? " checked" : ""} aria-label="Seleziona tutti">
              </th>
              <th>Numero</th>
              <th>Cliente &amp; Progetto</th>
              <th>Data</th>
              <th>Stato</th>
              <th class="num">Totale Netto</th>
              <th class="num">Azioni</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((q) => renderQuoteRow(q, {
		isTrash,
		isSelected: st.selectedArchiveIds.has(q.id),
		isCurrent: st.currentQuote?.id === q.id
	})).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
	container.innerHTML = `
    <div class="view-header">
      <div>
        <h1 class="view-title">Archivio Preventivi</h1>
        <p class="view-subtitle">Sincronizzato in tempo reale con Firebase Cloud · ${active.length} attivi${trashed.length ? ` · ${trashed.length} nel cestino` : ""}</p>
      </div>
      <div class="view-header-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-action="export-backup">Backup JSON</button>
        <button type="button" class="btn btn-ghost btn-sm" data-action="trigger-import-json">Importa JSON</button>
        <button type="button" class="btn btn-primary" data-action="new-quote-from-archive">+ Nuovo preventivo</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">Accettati</span>
        <strong class="kpi-value">${euro(totAccettato)}</strong>
        <span class="kpi-meta">${countAccettati} preventivi confermati</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">In attesa (Inviati)</span>
        <strong class="kpi-value">${euro(totInAttesa)}</strong>
        <span class="kpi-meta">${counts.inviato} offerte aperte</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Tasso di conversione</span>
        <strong class="kpi-value">${convRate}%</strong>
        <span class="kpi-meta">${countAccettati} su ${countChiusi} definiti</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Archivio totale</span>
        <strong class="kpi-value">${active.length}</strong>
        <span class="kpi-meta">${counts.bozza} bozze in lavorazione</span>
      </div>
    </div>

    <div class="toolbar-card">
      <div class="filter-tabs" role="tablist">${filterButtons}</div>
      <div class="toolbar-controls">
        <input type="search" id="archive-search-input" class="field-input search-input" placeholder="Cerca numero, cliente, progetto, location…" value="${esc(st.archiveSearch)}" aria-label="Cerca nell'archivio">
        <select id="archive-sort-select" class="field-input field-sm" aria-label="Ordina preventivi">
          <option value="modificato_desc"${st.archiveSort === "modificato_desc" ? " selected" : ""}>Ultima modifica</option>
          <option value="data_desc"${st.archiveSort === "data_desc" ? " selected" : ""}>Data (più recenti)</option>
          <option value="data_asc"${st.archiveSort === "data_asc" ? " selected" : ""}>Data (meno recenti)</option>
          <option value="numero_desc"${st.archiveSort === "numero_desc" ? " selected" : ""}>Numero decrescente</option>
          <option value="totale_desc"${st.archiveSort === "totale_desc" ? " selected" : ""}>Importo più alto</option>
          <option value="cliente_asc"${st.archiveSort === "cliente_asc" ? " selected" : ""}>Cliente (A–Z)</option>
        </select>
        ${!isTrash ? `<div class="segmented" role="group" aria-label="Modalità vista archivio">
                <button type="button" class="seg-btn${st.archiveViewMode === "cronologico" ? " active" : ""}" data-action="set-view-mode" data-value="cronologico">Elenco</button>
                <button type="button" class="seg-btn${st.archiveViewMode === "clienti" ? " active" : ""}" data-action="set-view-mode" data-value="clienti">Per Cliente</button>
              </div>` : `<button type="button" class="btn btn-danger btn-sm" data-action="empty-trash"${trashed.length === 0 ? " disabled" : ""}>Svuota cestino</button>`}
      </div>
    </div>

    ${bulkBarHtml}
    ${bodyHtml}
  `;
}
function initArchiveView({ onOpenQuote, onTriggerImport, onExportBackup }) {
	const container = document.getElementById("archive-view-root");
	if (!container) return;
	container.addEventListener("input", (e) => {
		if (e.target.id === "archive-search-input") {
			const pos = e.target.selectionStart;
			actions.setArchiveFilter({ archiveSearch: e.target.value });
			const next = document.getElementById("archive-search-input");
			if (next) {
				next.focus();
				if (pos !== null) next.setSelectionRange(pos, pos);
			}
		}
	});
	container.addEventListener("change", async (e) => {
		const target = e.target;
		if (target.id === "archive-sort-select") {
			actions.setArchiveFilter({ archiveSort: target.value });
			return;
		}
		const action = target.dataset.action;
		if (action === "change-status") {
			const id = target.dataset.id;
			await updateQuoteStatus(id, target.value);
			showToast(`Stato aggiornato a «${statusLabel(target.value)}».`);
			return;
		}
		if (action === "toggle-select") {
			actions.toggleSelectArchiveId(target.dataset.id);
			return;
		}
		if (action === "toggle-select-all") {
			const visible = getFilteredArchiveList();
			if (target.checked) actions.setSelectedArchiveIds(visible.map((q) => q.id));
			else actions.clearSelectedArchiveIds();
			return;
		}
		if (action === "bulk-status" && target.value) {
			const ids = [...getState().selectedArchiveIds];
			const nextStatus = target.value;
			target.value = "";
			await updateQuoteStatus(ids, nextStatus);
			actions.clearSelectedArchiveIds();
			showToast(`${ids.length} preventivi aggiornati a «${statusLabel(nextStatus)}».`, { type: "success" });
		}
	});
	container.addEventListener("click", async (e) => {
		const btn = e.target.closest("[data-action]");
		if (!btn) return;
		const action = btn.dataset.action;
		const id = btn.dataset.id;
		const st = getState();
		switch (action) {
			case "set-status-filter":
				actions.setArchiveFilter({ archiveStatusFilter: btn.dataset.value });
				break;
			case "set-view-mode":
				actions.setArchiveFilter({ archiveViewMode: btn.dataset.value });
				break;
			case "toggle-group":
				actions.toggleClientGroup(btn.dataset.group);
				break;
			case "clear-selection":
				actions.clearSelectedArchiveIds();
				break;
			case "new-quote-from-archive":
				actions.newQuote();
				actions.setActiveView("editor");
				break;
			case "export-backup":
				onExportBackup?.();
				break;
			case "trigger-import-json":
				onTriggerImport?.();
				break;
			case "open-quote": {
				const quote = st.quotes.find((q) => q.id === id);
				if (quote) onOpenQuote?.(quote);
				break;
			}
			case "print-quote": {
				const quote = st.quotes.find((q) => q.id === id);
				if (quote) await printQuoteDocument(quote, { showSignature: st.signatureEnabled });
				break;
			}
			case "print-proforma": {
				const quote = st.quotes.find((q) => q.id === id);
				if (quote) await printSecondDocument(quote, { showSignature: st.signatureEnabled });
				break;
			}
			case "export-json": {
				const quote = st.quotes.find((q) => q.id === id);
				if (quote) exportSingleQuoteJson(quote);
				break;
			}
			case "duplicate-quote": {
				const src = st.quotes.find((q) => q.id === id);
				if (!src) return;
				const copy = sanificaPreventivo({
					...src,
					id: generaId("p"),
					numero: prossimoNumero(st.quotes),
					stato: "bozza",
					cestinato: false,
					eliminatoIl: null,
					modificato: (/* @__PURE__ */ new Date()).toISOString()
				});
				await saveQuoteToCloud(copy);
				actions.loadQuoteIntoEditor(copy, { persisted: true });
				actions.setActiveView("editor");
				showToast(`Duplicato come preventivo ${copy.numero}.`, { type: "success" });
				break;
			}
			case "trash-one": {
				const quote = st.quotes.find((q) => q.id === id);
				if (!quote) return;
				if (!await confirmModal({
					title: "Sposta nel cestino",
					message: `Vuoi spostare il preventivo ${quote.numero} nel cestino? Potrai sempre ripristinarlo.`,
					confirmLabel: "Sposta nel cestino",
					danger: true
				})) return;
				await moveQuotesToTrash(id);
				showToast(`Preventivo ${quote.numero} spostato nel cestino.`);
				break;
			}
			case "restore-one":
				await restoreQuotesFromTrash(id);
				showToast("Preventivo ripristinato nell'archivio.", { type: "success" });
				break;
			case "delete-one": {
				const quote = st.quotes.find((q) => q.id === id);
				if (!quote) return;
				if (!await confirmModal({
					title: "Eliminazione definitiva",
					message: `Eliminare definitivamente il preventivo ${quote.numero}? Questa operazione non può essere annullata.`,
					confirmLabel: "Elimina per sempre",
					danger: true
				})) return;
				await deleteQuotesPermanently(id);
				showToast("Preventivo eliminato definitivamente.");
				break;
			}
			case "bulk-trash": {
				const ids = [...st.selectedArchiveIds];
				if (!await confirmModal({
					title: "Sposta nel cestino",
					message: `Spostare ${ids.length} preventivi selezionati nel cestino?`,
					confirmLabel: "Sposta nel cestino",
					danger: true
				})) return;
				await moveQuotesToTrash(ids);
				actions.clearSelectedArchiveIds();
				showToast(`${ids.length} preventivi spostati nel cestino.`);
				break;
			}
			case "bulk-restore": {
				const ids = [...st.selectedArchiveIds];
				await restoreQuotesFromTrash(ids);
				actions.clearSelectedArchiveIds();
				showToast(`${ids.length} preventivi ripristinati.`, { type: "success" });
				break;
			}
			case "bulk-delete": {
				const ids = [...st.selectedArchiveIds];
				if (!await confirmModal({
					title: "Elimina definitivamente",
					message: `Eliminare definitivamente ${ids.length} preventivi dal cestino? Azione irreversibile.`,
					confirmLabel: "Elimina per sempre",
					danger: true
				})) return;
				await deleteQuotesPermanently(ids);
				actions.clearSelectedArchiveIds();
				showToast(`${ids.length} preventivi eliminati definitivamente.`);
				break;
			}
			case "empty-trash": {
				const ids = getTrashedQuotes().map((q) => q.id);
				if (!ids.length) return;
				if (!await confirmModal({
					title: "Svuota cestino",
					message: `Eliminare definitivamente tutti i ${ids.length} preventivi presenti nel cestino? Azione irreversibile.`,
					confirmLabel: "Svuota cestino",
					danger: true
				})) return;
				await deleteQuotesPermanently(ids);
				actions.clearSelectedArchiveIds();
				showToast("Cestino svuotato.");
				break;
			}
		}
	});
}
// src/js/ui/clients-view.js
/**
* Vista Rubrica Clienti (CRM) Cloud-First.
* - Collegamento relazionale tramite clienteId (con fallback retrocompatibile su nome/piva normalizzati)
* - KPI calcolati con motore fiscale puro (calcolaTotali)
* - CRUD completo con modale custom (cf, sdi, pec, note)
*/
function findQuotesForClient(client, quotes) {
	const cKey = normalizzaChiave(client.nome);
	const cPiva = normalizzaChiave(client.piva);
	return quotes.filter((q) => {
		if (q.cliente?.clienteId && q.cliente.clienteId === client.id) return true;
		const qPiva = normalizzaChiave(q.cliente?.piva);
		if (cPiva && qPiva && cPiva === qPiva) return true;
		const qKey = normalizzaChiave(q.cliente?.nome);
		return Boolean(cKey && qKey && cKey === qKey);
	});
}
async function openClientModal(existing = null, { onOpenQuote } = {}) {
	const isEdit = Boolean(existing);
	const c = existing || {
		id: generaId("cli"),
		nome: "",
		ref: "",
		indirizzo: "",
		piva: "",
		cf: "",
		sdi: "",
		pec: "",
		email: "",
		tel: "",
		note: ""
	};
	const linkedQuotes = isEdit ? findQuotesForClient(c, getActiveQuotes()) : [];
	const historyHtml = linkedQuotes.length ? `<div class="client-history">
         <h4 class="modal-section-title">Storico preventivi (${linkedQuotes.length})</h4>
         <ul class="history-list">
           ${linkedQuotes.slice(0, 8).map((q) => {
		const net = calcolaTotali(q).netto;
		return `<li>
                 <button type="button" class="history-row" data-open-linked-quote="${esc(q.id)}">
                   <span class="mono-num">${esc(q.numero)}</span>
                   <span class="history-title">${esc(q.progetto?.titolo || "Senza titolo")}</span>
                   <span class="history-date">${esc(dataBreve(q.data))}</span>
                   <span class="history-amount">${euro(net)}</span>
                 </button>
               </li>`;
	}).join("")}
         </ul>
       </div>` : "";
	await openModal({
		title: isEdit ? `Modifica cliente — ${c.nome}` : "Nuovo cliente",
		subtitle: "I dati fiscali vengono sincronizzati su Cloud e suggeriti automaticamente nell'editor.",
		size: "md",
		bodyHtml: `
      <form id="client-crud-form" class="modal-form-grid">
        <div class="field span-2">
          <label for="cm-nome">Ragione sociale o Nome *</label>
          <input id="cm-nome" class="field-input" required maxlength="200" value="${esc(c.nome)}" placeholder="Es. Produzioni Roma S.r.l.">
        </div>
        <div class="field">
          <label for="cm-ref">Referente</label>
          <input id="cm-ref" class="field-input" maxlength="200" value="${esc(c.ref)}" placeholder="Es. Marco Rossi">
        </div>
        <div class="field">
          <label for="cm-email">Email</label>
          <input id="cm-email" type="email" class="field-input" maxlength="150" value="${esc(c.email)}" placeholder="nome@azienda.it">
        </div>
        <div class="field">
          <label for="cm-tel">Telefono</label>
          <input id="cm-tel" class="field-input" maxlength="50" value="${esc(c.tel)}" placeholder="+39 …">
        </div>
        <div class="field">
          <label for="cm-piva">Partita IVA</label>
          <input id="cm-piva" class="field-input" maxlength="50" value="${esc(c.piva)}" placeholder="IT01234567890">
        </div>
        <div class="field">
          <label for="cm-cf">Codice Fiscale</label>
          <input id="cm-cf" class="field-input" maxlength="50" value="${esc(c.cf)}">
        </div>
        <div class="field">
          <label for="cm-sdi">Codice Univoco SDI</label>
          <input id="cm-sdi" class="field-input" maxlength="20" value="${esc(c.sdi)}" placeholder="7 caratteri">
        </div>
        <div class="field span-2">
          <label for="cm-pec">PEC</label>
          <input id="cm-pec" type="email" class="field-input" maxlength="150" value="${esc(c.pec)}" placeholder="azienda@pec.it">
        </div>
        <div class="field span-2">
          <label for="cm-indirizzo">Indirizzo sede legale</label>
          <input id="cm-indirizzo" class="field-input" maxlength="300" value="${esc(c.indirizzo)}" placeholder="Via, CAP, Città">
        </div>
        <div class="field span-2">
          <label for="cm-note">Note interne</label>
          <textarea id="cm-note" class="field-input" rows="2" maxlength="2000" placeholder="Condizioni concordate, preferenze, contatti amministrativi…">${esc(c.note)}</textarea>
        </div>
      </form>
      ${historyHtml}
    `,
		onMount(dialog, finish) {
			dialog.querySelectorAll("[data-open-linked-quote]").forEach((btn) => {
				btn.addEventListener("click", () => {
					const q = getState().quotes.find((x) => x.id === btn.dataset.openLinkedQuote);
					if (q) {
						finish(null);
						onOpenQuote?.(q);
					}
				});
			});
		},
		buttons: [{
			label: "Annulla",
			value: null,
			variant: "ghost"
		}, {
			label: isEdit ? "Salva modifiche" : "Crea cliente",
			value: "save",
			variant: "primary",
			async onClick(dialog) {
				const nome = dialog.querySelector("#cm-nome")?.value.trim() || "";
				if (!nome) {
					dialog.querySelector("#cm-nome")?.focus();
					showToast("Inserisci la ragione sociale o il nome del cliente.", { type: "error" });
					return false;
				}
				await saveClientToCloud({
					...c,
					nome,
					ref: dialog.querySelector("#cm-ref")?.value.trim() || "",
					email: dialog.querySelector("#cm-email")?.value.trim() || "",
					tel: dialog.querySelector("#cm-tel")?.value.trim() || "",
					piva: dialog.querySelector("#cm-piva")?.value.trim() || "",
					cf: dialog.querySelector("#cm-cf")?.value.trim() || "",
					sdi: dialog.querySelector("#cm-sdi")?.value.trim().toUpperCase() || "",
					pec: dialog.querySelector("#cm-pec")?.value.trim() || "",
					indirizzo: dialog.querySelector("#cm-indirizzo")?.value.trim() || "",
					note: dialog.querySelector("#cm-note")?.value.trim() || ""
				});
				showToast(isEdit ? "Scheda cliente aggiornata." : "Nuovo cliente salvato nel Cloud.", { type: "success" });
				return true;
			}
		}]
	});
}
async function syncClientsFromArchiveQuotes() {
	const activeQuotes = getActiveQuotes();
	const existing = getState().clients;
	const knownKeys = new Set(existing.map((c) => normalizzaChiave(c.nome)));
	let added = 0;
	for (const q of activeQuotes) {
		const nome = String(q.cliente?.nome || "").trim();
		if (!nome) continue;
		const key = normalizzaChiave(nome);
		if (!key || knownKeys.has(key)) continue;
		knownKeys.add(key);
		await saveClientToCloud({
			id: generaId("cli"),
			nome,
			ref: q.cliente?.ref || "",
			indirizzo: q.cliente?.indirizzo || "",
			piva: q.cliente?.piva || "",
			cf: q.cliente?.cf || "",
			sdi: q.cliente?.sdi || "",
			pec: q.cliente?.pec || "",
			email: q.cliente?.email || "",
			tel: q.cliente?.tel || "",
			note: ""
		});
		added += 1;
	}
	if (added > 0) showToast(`Importati ${added} nuovi clienti dai preventivi in archivio.`, { type: "success" });
	else showToast("Tutti i clienti presenti nei preventivi sono già in rubrica.");
}
function renderClientsView() {
	const container = document.getElementById("clients-view-root");
	if (!container) return;
	const st = getState();
	const clients = st.clients.slice().sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "it"));
	const activeQuotes = getActiveQuotes();
	const q = st.clientSearch.trim().toLowerCase();
	const filtered = clients.filter((c) => {
		if (!q) return true;
		return [
			c.nome,
			c.ref,
			c.email,
			c.piva,
			c.cf,
			c.tel,
			c.indirizzo
		].filter(Boolean).join(" ").toLowerCase().includes(q);
	});
	let totalAcceptedAll = 0;
	let totalPipelineAll = 0;
	const statsByClient = /* @__PURE__ */ new Map();
	for (const c of clients) {
		const linked = findQuotesForClient(c, activeQuotes);
		let accepted = 0;
		let total = 0;
		for (const quote of linked) {
			const net = calcolaTotali(quote).netto;
			total += net;
			if (quote.stato === "accettato") accepted += net;
		}
		totalAcceptedAll += accepted;
		totalPipelineAll += total;
		statsByClient.set(c.id, {
			count: linked.length,
			accepted,
			total
		});
	}
	const bodyHtml = filtered.length ? `<div class="table-card">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cliente &amp; Referente</th>
                <th>Contatti</th>
                <th>Dati Fiscali</th>
                <th class="num">Preventivi</th>
                <th class="num">Accettati</th>
                <th class="num">Azioni</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map((c) => {
		const s = statsByClient.get(c.id) || {
			count: 0,
			accepted: 0,
			total: 0
		};
		return `<tr>
                    <td>
                      <div class="row-title">${esc(c.nome)}</div>
                      ${c.ref ? `<div class="row-sub">Ref: ${esc(c.ref)}</div>` : ""}
                    </td>
                    <td>
                      <div class="row-sub">${esc(c.email || "—")}</div>
                      ${c.tel ? `<div class="row-sub">${esc(c.tel)}</div>` : ""}
                    </td>
                    <td>
                      <div class="row-sub">${c.piva ? `P. IVA ${esc(c.piva)}` : c.cf ? `C.F. ${esc(c.cf)}` : "—"}</div>
                      ${c.sdi ? `<div class="row-sub">SDI ${esc(c.sdi)}</div>` : ""}
                    </td>
                    <td class="num">${s.count}</td>
                    <td class="col-amount">${euro(s.accepted)}</td>
                    <td class="col-actions">
                      <div class="row-actions">
                        <button type="button" class="btn btn-secondary btn-sm" data-action="quote-for-client" data-id="${esc(c.id)}">+ Preventivo</button>
                        <button type="button" class="icon-btn" data-action="edit-client" data-id="${esc(c.id)}" title="Modifica cliente">Modifica</button>
                        <button type="button" class="icon-btn icon-danger" data-action="delete-client" data-id="${esc(c.id)}" title="Elimina cliente">✕</button>
                      </div>
                    </td>
                  </tr>`;
	}).join("")}
            </tbody>
          </table>
        </div>
      </div>` : `<div class="empty-state">
        <p class="empty-title">Nessun cliente in rubrica</p>
        <p class="empty-desc">Crea una scheda cliente o importa automaticamente i clienti dai preventivi già presenti in archivio.</p>
        <div class="empty-actions">
          <button type="button" class="btn btn-secondary" data-action="sync-from-quotes">Importa dai preventivi</button>
          <button type="button" class="btn btn-primary" data-action="new-client">+ Nuovo cliente</button>
        </div>
      </div>`;
	container.innerHTML = `
    <div class="view-header">
      <div>
        <h1 class="view-title">Rubrica Clienti</h1>
        <p class="view-subtitle">Anagrafica CRM collegata ai preventivi tramite ID relazionale · ${clients.length} clienti</p>
      </div>
      <div class="view-header-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-action="sync-from-quotes">Aggiorna dai preventivi</button>
        <button type="button" class="btn btn-primary" data-action="new-client">+ Nuovo cliente</button>
      </div>
    </div>

    <div class="kpi-grid kpi-grid-3">
      <div class="kpi-card">
        <span class="kpi-label">Clienti registrati</span>
        <strong class="kpi-value">${clients.length}</strong>
        <span class="kpi-meta">Sincronizzati su Firestore</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Volume accettato</span>
        <strong class="kpi-value">${euro(totalAcceptedAll)}</strong>
        <span class="kpi-meta">Somma preventivi confermati</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Volume preventivato</span>
        <strong class="kpi-value">${euro(totalPipelineAll)}</strong>
        <span class="kpi-meta">Storico complessivo attivo</span>
      </div>
    </div>

    <div class="toolbar-card">
      <input type="search" id="client-search-input" class="field-input search-input" placeholder="Cerca ragione sociale, referente, P. IVA, email…" value="${esc(st.clientSearch)}" aria-label="Cerca clienti">
    </div>

    ${bodyHtml}
  `;
}
function initClientsView({ onOpenQuote }) {
	const container = document.getElementById("clients-view-root");
	if (!container) return;
	container.addEventListener("input", (e) => {
		if (e.target.id === "client-search-input") {
			const pos = e.target.selectionStart;
			actions.setClientSearch(e.target.value);
			const next = document.getElementById("client-search-input");
			if (next) {
				next.focus();
				if (pos !== null) next.setSelectionRange(pos, pos);
			}
		}
	});
	container.addEventListener("click", async (e) => {
		const btn = e.target.closest("[data-action]");
		if (!btn) return;
		const action = btn.dataset.action;
		const id = btn.dataset.id;
		const st = getState();
		if (action === "new-client") await openClientModal(null, { onOpenQuote });
		else if (action === "sync-from-quotes") await syncClientsFromArchiveQuotes();
		else if (action === "edit-client") {
			const c = st.clients.find((x) => x.id === id);
			if (c) await openClientModal(c, { onOpenQuote });
		} else if (action === "quote-for-client") {
			const c = st.clients.find((x) => x.id === id);
			if (!c) return;
			actions.newQuote(c);
			actions.setActiveView("editor");
			showToast(`Nuovo preventivo precompilato per ${c.nome}.`);
		} else if (action === "delete-client") {
			const c = st.clients.find((x) => x.id === id);
			if (!c) return;
			if (!await confirmModal({
				title: "Elimina cliente",
				message: `Eliminare «${c.nome}» dalla rubrica? I preventivi esistenti resteranno intatti in archivio.`,
				confirmLabel: "Elimina",
				danger: true
			})) return;
			await deleteClientFromCloud(id);
			showToast("Cliente eliminato dalla rubrica.");
		}
	});
}
// src/js/ui/price-list-view.js
/**
* Vista Listino Servizi Cloud-First.
* - Modifiche inline con debounce 800ms (zero flood di scritture su Firestore)
* - Rispetta firestore.rules (nome >= 1 char, prezzo >= 0)
* - Stampa PDF A4 del listino interno
*/
function renderPriceListView() {
	const container = document.getElementById("pricelist-view-root");
	if (!container) return;
	const st = getState();
	const all = st.priceList;
	const q = st.priceListSearch.trim().toLowerCase();
	const filtered = all.filter((v) => {
		if (!q) return true;
		return `${v.cat || ""} ${v.nome || ""} ${v.desc || ""} ${v.unita || ""}`.toLowerCase().includes(q);
	});
	const cats = [...new Set(all.map((v) => v.cat).filter(Boolean))];
	const units = [.../* @__PURE__ */ new Set([
		"giornata",
		"mezza giornata",
		"forfait",
		"ora",
		"pezzo",
		...all.map((v) => v.unita).filter(Boolean)
	])];
	const rowsHtml = filtered.map((v) => `<tr data-item-id="${esc(v.id)}">
        <td class="pl-col-cat">
          <input class="field-input field-sm" data-field="cat" list="dl-pl-cats" placeholder="Categoria" value="${esc(v.cat || "")}">
        </td>
        <td class="pl-col-main">
          <input class="field-input field-sm pl-nome-input" data-field="nome" placeholder="Nome prestazione *" value="${esc(v.nome || "")}">
          <textarea class="field-input field-sm pl-desc-input" data-field="desc" rows="2" placeholder="Descrizione che verrà inserita nel preventivo">${esc(v.desc || "")}</textarea>
        </td>
        <td class="pl-col-unit">
          <input class="field-input field-sm" data-field="unita" list="dl-pl-units" placeholder="giornata" value="${esc(v.unita || "")}">
        </td>
        <td class="pl-col-price">
          <input class="field-input field-sm num-input" type="number" step="0.01" min="0" data-field="prezzo" value="${Number(v.prezzo) || 0}">
        </td>
        <td class="col-actions">
          <button type="button" class="icon-btn icon-danger" data-action="delete-price-item" data-id="${esc(v.id)}" title="Elimina voce" aria-label="Elimina voce">✕</button>
        </td>
      </tr>`).join("");
	container.innerHTML = `
    <div class="view-header">
      <div>
        <h1 class="view-title">Listino Servizi</h1>
        <p class="view-subtitle">${all.length} voci in catalogo · salvataggio automatico Cloud (debounce 800ms)</p>
      </div>
      <div class="view-header-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-action="print-pricelist">Stampa PDF Listino</button>
        <button type="button" class="btn btn-primary" data-action="add-price-item">+ Aggiungi voce</button>
      </div>
    </div>

    <div class="toolbar-card">
      <input type="search" id="pricelist-search-input" class="field-input search-input" placeholder="Filtra per categoria, nome o descrizione…" value="${esc(st.priceListSearch)}" aria-label="Cerca nel listino">
    </div>

    ${filtered.length ? `<div class="table-card">
            <div class="table-scroll">
              <table class="data-table pricelist-table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Voce &amp; Descrizione</th>
                    <th>Unità</th>
                    <th class="num">Prezzo (€)</th>
                    <th class="num">Azioni</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>
          </div>` : `<div class="empty-state">
            <p class="empty-title">Nessuna voce trovata</p>
            <p class="empty-desc">Aggiungi i tuoi servizi ricorrenti per inserirli con un clic nei preventivi.</p>
            <button type="button" class="btn btn-primary" data-action="add-price-item">+ Aggiungi prima voce</button>
          </div>`}

    <datalist id="dl-pl-cats">${cats.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
    <datalist id="dl-pl-units">${units.map((u) => `<option value="${esc(u)}">`).join("")}</datalist>
  `;
}
function initPriceListView() {
	const container = document.getElementById("pricelist-view-root");
	if (!container) return;
	container.addEventListener("input", (e) => {
		if (e.target.id === "pricelist-search-input") {
			const pos = e.target.selectionStart;
			actions.setPriceListSearch(e.target.value);
			const next = document.getElementById("pricelist-search-input");
			if (next) {
				next.focus();
				if (pos !== null) next.setSelectionRange(pos, pos);
			}
			return;
		}
		const row = e.target.closest("tr[data-item-id]");
		const field = e.target.dataset.field;
		if (!row || !field) return;
		const id = row.dataset.itemId;
		const item = getState().priceList.find((v) => v.id === id);
		if (!item) return;
		const updated = { ...item };
		if (field === "prezzo") updated.prezzo = Math.max(0, parseFloat(e.target.value) || 0);
		else updated[field] = e.target.value;
		item[field] = updated[field];
		if (String(updated.nome || "").trim().length >= 1) schedulePriceItemSave(updated);
	});
	container.addEventListener("click", async (e) => {
		const btn = e.target.closest("[data-action]");
		if (!btn) return;
		const action = btn.dataset.action;
		if (action === "add-price-item") {
			const list = getState().priceList;
			const newItem = {
				id: generaId("voc"),
				cat: "",
				nome: "Nuova voce",
				desc: "",
				unita: "giornata",
				prezzo: 0,
				ordine: list.length + 1,
				attivo: true,
				creato: (/* @__PURE__ */ new Date()).toISOString(),
				modificato: (/* @__PURE__ */ new Date()).toISOString()
			};
			actions.setPriceListSearch("");
			schedulePriceItemSave(newItem);
			renderPriceListView();
			const input = container.querySelector(`tr[data-item-id="${newItem.id}"] .pl-nome-input`);
			if (input) {
				input.scrollIntoView({
					behavior: "smooth",
					block: "center"
				});
				input.focus();
				input.select();
			}
			return;
		}
		if (action === "print-pricelist") {
			const st = getState();
			await printPriceListDocument(st.priceList, st.issuer);
			return;
		}
		if (action === "delete-price-item") {
			const id = btn.dataset.id;
			if (!await confirmModal({
				title: "Elimina voce di listino",
				message: `Eliminare «${getState().priceList.find((v) => v.id === id)?.nome || "questa voce"}» dal catalogo?`,
				confirmLabel: "Elimina",
				danger: true
			})) return;
			await deletePriceItemFromCloud(id);
			showToast("Voce eliminata dal listino.");
		}
	});
}
// src/js/main.js
function applyTheme(theme) {
	document.documentElement.dataset.theme = theme;
	const themeMeta = document.querySelector("meta[name=\"theme-color\"]");
	if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#0F1714" : "#1B4332");
	const btn = document.getElementById("btn-toggle-theme");
	if (btn) {
		btn.setAttribute("aria-label", theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro");
		btn.textContent = theme === "dark" ? "☀" : "☾";
	}
}
function updateSyncIndicator(st) {
	const pill = document.getElementById("topbar-sync-indicator");
	const txt = document.getElementById("topbar-sync-text");
	if (!pill || !txt) return;
	pill.dataset.status = st.syncStatus;
	switch (st.syncStatus) {
		case "saving":
			txt.textContent = st.syncMessage || "Salvataggio…";
			break;
		case "offline":
			txt.textContent = st.syncMessage || "Offline";
			break;
		case "error":
			txt.textContent = st.syncMessage || "Errore sync";
			break;
		default: txt.textContent = st.syncMessage || "Salvato";
	}
}
function updateActiveViewDom(activeView) {
	[
		"editor",
		"archivio",
		"clienti",
		"listino"
	].forEach((v) => {
		const el = document.getElementById(`vista-${v}`);
		if (el) el.hidden = v !== activeView;
	});
	document.querySelectorAll("[data-nav-view]").forEach((btn) => {
		const isCurrent = btn.dataset.navView === activeView;
		btn.classList.toggle("active", isCurrent);
		if (isCurrent) btn.setAttribute("aria-current", "page");
		else btn.removeAttribute("aria-current");
	});
	const mobileBar = document.getElementById("mobile-editor-bar");
	if (mobileBar) mobileBar.hidden = activeView !== "editor";
}
function bootstrap() {
	const initialState = getState();
	applyTheme(initialState.theme);
	updateSyncIndicator(initialState);
	const fileInput = document.getElementById("global-json-import-input");
	const triggerImport = () => {
		if (!fileInput) return;
		fileInput.value = "";
		fileInput.click();
	};
	fileInput?.addEventListener("change", async (e) => {
		const file = e.target.files?.[0];
		if (file) await handleJsonFileImport(file);
	});
	const openQuoteInEditor = async (quote) => {
		await flushQuoteAutosave();
		actions.loadQuoteIntoEditor(quote, { persisted: true });
		actions.setActiveView("editor");
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	initEditorView({ onTriggerImport: triggerImport });
	initArchiveView({
		onOpenQuote: openQuoteInEditor,
		onTriggerImport: triggerImport,
		onExportBackup: exportFullBackupJson
	});
	initClientsView({ onOpenQuote: openQuoteInEditor });
	initPriceListView();
	syncEditorScalarsFromStore();
	renderEditorLists();
	renderPriceListSelect();
	renderEditorSummaryAndPreview();
	renderArchiveView();
	renderClientsView();
	renderPriceListView();
	updateActiveViewDom(initialState.activeView);
	subscribe((st, scope) => {
		switch (scope) {
			case "theme":
				applyTheme(st.theme);
				break;
			case "sync":
				updateSyncIndicator(st);
				break;
			case "view":
				updateActiveViewDom(st.activeView);
				if (st.activeView === "archivio") renderArchiveView();
				else if (st.activeView === "clienti") renderClientsView();
				else if (st.activeView === "listino") renderPriceListView();
				else renderEditorSummaryAndPreview();
				break;
			case "quoteLoaded":
				syncEditorScalarsFromStore();
				renderEditorLists();
				renderEditorSummaryAndPreview();
				break;
			case "quoteStructural":
				renderEditorLists();
				renderEditorSummaryAndPreview();
				break;
			case "quoteField":
			case "splitPreview":
			case "signature":
				renderEditorSummaryAndPreview();
				break;
			case "issuer":
				syncEditorScalarsFromStore();
				renderEditorSummaryAndPreview();
				break;
			case "quotes":
				renderArchiveView();
				if (st.activeView === "clienti") renderClientsView();
				updateStructuralUndoButtons();
				break;
			case "archiveFilter":
			case "archiveSelection":
				renderArchiveView();
				break;
			case "clients":
			case "clientFilter":
				renderClientsView();
				break;
			case "priceList":
				renderPriceListSelect();
				renderPriceListView();
				break;
			case "priceListFilter": renderPriceListView();
		}
	});
	document.addEventListener("click", async (e) => {
		const navBtn = e.target.closest("[data-nav-view]");
		if (navBtn) {
			const targetView = navBtn.dataset.navView;
			if (getState().activeView === "editor" && targetView !== "editor") await flushQuoteAutosave();
			actions.setActiveView(targetView);
			window.scrollTo({
				top: 0,
				behavior: "instant"
			});
			return;
		}
		const actionEl = e.target.closest("[data-action]");
		if (!actionEl) return;
		switch (actionEl.dataset.action) {
			case "toggle-theme":
				actions.toggleTheme();
				break;
			case "install-pwa":
				await triggerPwaInstall();
				break;
			case "logout":
				await logoutUser();
				break;
			case "mobile-preview":
				await openMobilePreviewSheet();
				break;
			case "mobile-print": {
				const st = getState();
				await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
				break;
			}
			case "topbar-new-quote":
				await flushQuoteAutosave();
				actions.newQuote();
				actions.setActiveView("editor");
				showToast("Nuovo preventivo creato.");
		}
	});
	document.addEventListener("keydown", async (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
			if (getState().activeView === "editor") {
				e.preventDefault();
				const st = getState();
				await printQuoteDocument(st.currentQuote, { showSignature: st.signatureEnabled });
			}
		} else if (e.altKey && e.key.toLowerCase() === "n" && getState().activeView === "editor") {
			e.preventDefault();
			actions.updateCurrentQuote((q) => q.voci.push({
				nome: "",
				desc: "",
				q: 1,
				p: 0
			}), { structural: true });
			showToast("Nuova voce aggiunta.");
		}
	});
	initSyncLifecycle();
	initPwa();
	initAuth(() => {
		startRealtimeSync();
	});
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap);
else bootstrap();
