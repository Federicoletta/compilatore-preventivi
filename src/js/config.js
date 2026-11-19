/**
 * Dati di dominio, costanti editoriali, clausole contrattuali e asset statici.
 * Zero Base64 inline: logo e firma vengono serviti come asset leggeri da /assets/.
 */

export const APP_VERSION = "2.0.0";

export const IO = {
  nome: "Federico Coletta",
  ruolo: "Direttore della Fotografia & Videomaker",
  citta: "Genzano di Roma (RM) · Roma e Lazio",
  tel: "+39 377 094 9147",
  mail: "fedecoletta@gmail.com",
  ig: "instagram.com/federi.coletta",
  li: "linkedin.com/in/federicoletta",
  sito: "federicoletta.com",
};

export const ASSET_PATHS = {
  logoDoc: "/assets/logo_federico_coletta.svg",
  logoNavbar: "/assets/logo_navbar.svg",
  firma: "/assets/firma_federico_coletta.png",
};

export const STATI_PREVENTIVO = [
  { id: "bozza", label: "Bozza" },
  { id: "inviato", label: "Inviato" },
  { id: "accettato", label: "Accettato" },
  { id: "rifiutato", label: "Rifiutato" },
  { id: "annullato", label: "Annullato" },
];

export const REGIMI_FISCALI = [
  {
    id: "occasionale",
    label: "Prestazione occasionale",
    breve: "Occasionale",
    haPartitaIva: false,
    descrizione: "Ritenuta d'acconto 20%, fuori campo IVA, bollo € 2,00 sopra € 77,47.",
  },
  {
    id: "forf5",
    label: "Regime forfettario (5%)",
    breve: "Forfettario 5%",
    haPartitaIva: true,
    descrizione: "Senza IVA e senza ritenuta, rivalsa INPS 4% opzionale, bollo € 2,00 sopra € 77,47.",
  },
  {
    id: "forf15",
    label: "Regime forfettario (15%)",
    breve: "Forfettario 15%",
    haPartitaIva: true,
    descrizione: "Senza IVA e senza ritenuta, rivalsa INPS 4% opzionale, bollo € 2,00 sopra € 77,47.",
  },
  {
    id: "ordinario",
    label: "Regime ordinario (IVA)",
    breve: "Ordinario",
    haPartitaIva: true,
    descrizione: "IVA 22%/10%/0%, rivalsa INPS 4% o cassa 2%, ritenuta d'acconto opzionale.",
  },
  {
    id: "nessuno",
    label: "Solo imponibile (senza note fiscali)",
    breve: "Solo imponibile",
    haPartitaIva: false,
    descrizione: "Mostra unicamente gli importi netti concordati senza dicitura fiscale.",
  },
];

export const CONDIZIONI_STD = [
  {
    titolo: "Validità",
    testo: "Il presente preventivo è valido 30 giorni dalla data di emissione.",
  },
  {
    titolo: "Pagamento",
    testo:
      "Acconto del 30% alla conferma, saldo entro 30 giorni dalla consegna dei file finali. Bonifico bancario, coordinate comunicate in fase di conferma.",
  },
  {
    titolo: "Tempistiche",
    testo:
      "Le date di ripresa si intendono confermate al ricevimento dell'acconto. Il calendario di consegna decorre dall'ultima giornata di ripresa.",
  },
  {
    titolo: "Revisioni",
    testo:
      "Sono incluse due tornate di modifiche sul montaggio. Le richieste successive o i cambi di impostazione dopo l'approvazione sono quotati a parte.",
  },
  {
    titolo: "Diritti d'uso",
    testo:
      "Alla conferma del saldo il cliente riceve i diritti d'uso illimitati nel tempo sui canali web, social, fiere e proiezioni interne. Il materiale grezzo resta di proprietà dell'autore, salvo diverso accordo scritto.",
  },
  {
    titolo: "Portfolio",
    testo:
      "Federico Coletta si riserva l'uso del lavoro finito nel proprio portfolio e sui propri canali, salvo richiesta scritta di riservatezza.",
  },
  {
    titolo: "Rinvii",
    testo:
      "Rinvii comunicati con meno di 48 ore di preavviso comportano l'addebito del 50% della giornata. Il maltempo, per le riprese in esterni, non è considerato rinvio imputabile.",
  },
  {
    titolo: "Trasferte",
    testo:
      "Oltre 50 km da Genzano di Roma: € 0,35/km e, se previsto il pernotto, vitto e alloggio a carico del committente.",
  },
];

export const INCLUSO_STD = [
  "Attrezzatura camera, ottiche e luci",
  "Audio in presa diretta con radiomicrofoni",
  "Backup del girato su doppio supporto",
  "Due giri di revisione sul montaggio",
  "Consegna nei formati concordati",
];

export const ESCLUSO_STD = [
  "Musiche con licenza a pagamento",
  "Location, permessi e diritti di ripresa",
  "Talent, casting e figuranti",
  "Trasferte oltre 50 km da Genzano di Roma",
  "Revisioni oltre le due incluse: € 45,00/h",
];

export const PACCHETTI = {
  doc: [
    {
      nome: "Pre-produzione",
      desc: "Sopralluogo, scaletta narrativa, lista inquadrature e piano di lavorazione.",
      q: 1,
      p: 350,
    },
    {
      nome: "Giornata di ripresa",
      desc: "Direzione della fotografia e operatore di macchina, fino a 10 ore. Attrezzatura camera, ottiche, luci e audio incluse.",
      q: 2,
      p: 650,
    },
    {
      nome: "Montaggio, color e sound",
      desc: "Montaggio del film principale, color grading in DaVinci Resolve, sound design e due giri di revisione.",
      q: 1,
      p: 900,
    },
    {
      nome: "Reel verticali 9:16",
      desc: "Pezzi da 20–30 secondi ricavati dal materiale girato, con sottotitoli aperti.",
      q: 3,
      p: 120,
    },
  ],
  spot: [
    {
      nome: "Pre-produzione e trattamento",
      desc: "Trattamento, storyboard, lista inquadrature e piano di lavorazione.",
      q: 1,
      p: 450,
    },
    {
      nome: "Giornata di ripresa",
      desc: "Direzione della fotografia con attrezzatura camera e luci, fino a 10 ore.",
      q: 1,
      p: 750,
    },
    {
      nome: "Montaggio, color e sound design",
      desc: 'Versioni da 15", 30" e 60" con color grading in DaVinci Resolve.',
      q: 1,
      p: 850,
    },
  ],
  dop: [
    {
      nome: "Giornata come direttore della fotografia",
      desc: "Direzione della fotografia in troupe già strutturata, fino a 10 ore. Attrezzatura non inclusa.",
      q: 1,
      p: 450,
    },
    {
      nome: "Giornata come operatore di macchina",
      desc: "Operatore con propria attrezzatura camera, fino a 10 ore.",
      q: 1,
      p: 350,
    },
  ],
};

export const PREF_KEYS = {
  theme: "fc_theme_v2",
  signature: "fc_firma_autografa",
  splitPreview: "fc_split_preview_v2",
  localCacheQuotes: "fc_preventivi_v1",
  localCacheClients: "fc_clienti_v1",
  localCachePriceList: "fc_listino_v1",
  localCacheIssuer: "fc_dati_personali_v1",
};
