(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={nome:`Federico Coletta`,ruolo:`Direttore della Fotografia & Videomaker`,citta:`Genzano di Roma (RM) · Roma e Lazio`,tel:`+39 377 094 9147`,mail:`fedecoletta@gmail.com`,ig:`instagram.com/federi.coletta`,li:`linkedin.com/in/federicoletta`,sito:`federicoletta.com`},t={logoDoc:`/assets/logo_federico_coletta.svg`,logoNavbar:`/assets/logo_navbar.svg`,firma:`/assets/firma_federico_coletta.png`},n=[{id:`bozza`,label:`Bozza`},{id:`inviato`,label:`Inviato`},{id:`accettato`,label:`Accettato`},{id:`rifiutato`,label:`Rifiutato`},{id:`annullato`,label:`Annullato`}],r=[{id:`occasionale`,label:`Prestazione occasionale`,breve:`Occasionale`,haPartitaIva:!1,descrizione:`Ritenuta d'acconto 20%, fuori campo IVA, bollo € 2,00 sopra € 77,47.`},{id:`forf5`,label:`Regime forfettario (5%)`,breve:`Forfettario 5%`,haPartitaIva:!0,descrizione:`Senza IVA e senza ritenuta, rivalsa INPS 4% opzionale, bollo € 2,00 sopra € 77,47.`},{id:`forf15`,label:`Regime forfettario (15%)`,breve:`Forfettario 15%`,haPartitaIva:!0,descrizione:`Senza IVA e senza ritenuta, rivalsa INPS 4% opzionale, bollo € 2,00 sopra € 77,47.`},{id:`ordinario`,label:`Regime ordinario (IVA)`,breve:`Ordinario`,haPartitaIva:!0,descrizione:`IVA 22%/10%/0%, rivalsa INPS 4% o cassa 2%, ritenuta d'acconto opzionale.`},{id:`nessuno`,label:`Solo imponibile (senza note fiscali)`,breve:`Solo imponibile`,haPartitaIva:!1,descrizione:`Mostra unicamente gli importi netti concordati senza dicitura fiscale.`}],i=[{titolo:`Validità`,testo:`Il presente preventivo è valido 30 giorni dalla data di emissione.`},{titolo:`Pagamento`,testo:`Acconto del 30% alla conferma, saldo entro 30 giorni dalla consegna dei file finali. Bonifico bancario, coordinate comunicate in fase di conferma.`},{titolo:`Tempistiche`,testo:`Le date di ripresa si intendono confermate al ricevimento dell'acconto. Il calendario di consegna decorre dall'ultima giornata di ripresa.`},{titolo:`Revisioni`,testo:`Sono incluse due tornate di modifiche sul montaggio. Le richieste successive o i cambi di impostazione dopo l'approvazione sono quotati a parte.`},{titolo:`Diritti d'uso`,testo:`Alla conferma del saldo il cliente riceve i diritti d'uso illimitati nel tempo sui canali web, social, fiere e proiezioni interne. Il materiale grezzo resta di proprietà dell'autore, salvo diverso accordo scritto.`},{titolo:`Portfolio`,testo:`Federico Coletta si riserva l'uso del lavoro finito nel proprio portfolio e sui propri canali, salvo richiesta scritta di riservatezza.`},{titolo:`Rinvii`,testo:`Rinvii comunicati con meno di 48 ore di preavviso comportano l'addebito del 50% della giornata. Il maltempo, per le riprese in esterni, non è considerato rinvio imputabile.`},{titolo:`Trasferte`,testo:`Oltre 50 km da Genzano di Roma: € 0,35/km e, se previsto il pernotto, vitto e alloggio a carico del committente.`}],a=[`Attrezzatura camera, ottiche e luci`,`Audio in presa diretta con radiomicrofoni`,`Backup del girato su doppio supporto`,`Due giri di revisione sul montaggio`,`Consegna nei formati concordati`],o=[`Musiche con licenza a pagamento`,`Location, permessi e diritti di ripresa`,`Talent, casting e figuranti`,`Trasferte oltre 50 km da Genzano di Roma`,`Revisioni oltre le due incluse: € 45,00/h`],s={doc:[{nome:`Pre-produzione`,desc:`Sopralluogo, scaletta narrativa, lista inquadrature e piano di lavorazione.`,q:1,p:350},{nome:`Giornata di ripresa`,desc:`Direzione della fotografia e operatore di macchina, fino a 10 ore. Attrezzatura camera, ottiche, luci e audio incluse.`,q:2,p:650},{nome:`Montaggio, color e sound`,desc:`Montaggio del film principale, color grading in DaVinci Resolve, sound design e due giri di revisione.`,q:1,p:900},{nome:`Reel verticali 9:16`,desc:`Pezzi da 20–30 secondi ricavati dal materiale girato, con sottotitoli aperti.`,q:3,p:120}],spot:[{nome:`Pre-produzione e trattamento`,desc:`Trattamento, storyboard, lista inquadrature e piano di lavorazione.`,q:1,p:450},{nome:`Giornata di ripresa`,desc:`Direzione della fotografia con attrezzatura camera e luci, fino a 10 ore.`,q:1,p:750},{nome:`Montaggio, color e sound design`,desc:`Versioni da 15", 30" e 60" con color grading in DaVinci Resolve.`,q:1,p:850}],dop:[{nome:`Giornata come direttore della fotografia`,desc:`Direzione della fotografia in troupe già strutturata, fino a 10 ore. Attrezzatura non inclusa.`,q:1,p:450},{nome:`Giornata come operatore di macchina`,desc:`Operatore con propria attrezzatura camera, fino a 10 ore.`,q:1,p:350}]},c={theme:`fc_theme_v2`,signature:`fc_firma_autografa`,splitPreview:`fc_split_preview_v2`,localCacheQuotes:`fc_preventivi_v1`,localCacheClients:`fc_clienti_v1`,localCachePriceList:`fc_listino_v1`,localCacheIssuer:`fc_dati_personali_v1`},l=new Set([`forf5`,`forf15`,`ordinario`]),u=new Set([`forf5`,`forf15`,`occasionale`]);function d(e){let t=Number(e);return Number.isFinite(t)?Math.round((t+2**-52)*100)/100:0}function f(e={}){let t=e&&typeof e==`object`?e:{},n=d((Array.isArray(t.voci)?t.voci:[]).reduce((e,t)=>e+Math.max(0,Number(t?.q)||0)*Math.max(0,Number(t?.p)||0),0)),r=t.scontoTipo===`perc`||t.progetto?.scontoTipo===`perc`?`perc`:`euro`,i=t.scontoValore!==void 0&&t.scontoValore!==null?Number(t.scontoValore):t.progetto?.scontoValore!==void 0&&t.progetto?.scontoValore!==null?Number(t.progetto.scontoValore):Number(t.sconto),a=Number.isFinite(i)?Math.max(0,i):0,o=0;o=d(r===`perc`?n*Math.min(100,Math.max(0,a))/100:a);let s=d(Math.min(n,o)),c=d(Math.max(0,n-s)),f=String(t.regime||`occasionale`),p=l.has(f),m=p?Math.min(100,Math.max(0,Number(t.rivalsa)||0)):0,h=d(c*m/100),g=d(c+h),_=f===`ordinario`?Math.min(100,Math.max(0,Number(t.iva)||0)):0,v=d(g*_/100),y=String(t.bollo||`auto`),b=u.has(f)&&y!==`no`&&g>77.47?2:0,x=f===`occasionale`||f===`ordinario`?Math.min(100,Math.max(0,Number(t.ritenuta)||0)):0,S=d((m===2?c:d(c+h))*x/100),C=d(g+v+b),w=d(C-S);return{regime:f,haPartitaIva:p,imponibile:n,scontoTipo:r,scontoValore:a,scontoLordo:o,sconto:s,base:c,rivPerc:m,rivalsa:h,imponibileIva:g,ivaPerc:_,iva:v,bollo:b,ritPerc:x,ritenuta:S,totaleDoc:C,netto:w}}function p(e){if(!e||e.regime===`nessuno`)return``;let t=[];return e.regime===`occasionale`?(t.push(`Prestazione occasionale ai sensi dell'art. 67, comma 1, lett. l) del D.P.R. 917/1986, priva del carattere di abitualità.`),e.ritPerc>0&&t.push(`Compenso soggetto a ritenuta d'acconto del ${e.ritPerc}% ai sensi dell'art. 25 del D.P.R. 600/1973, versata dal committente in qualità di sostituto d'imposta.`),t.push(`Operazione fuori campo IVA ai sensi dell'art. 5 del D.P.R. 633/1972.`),e.bollo>0&&t.push(`Imposta di bollo di € 2,00 assolta sull'originale per importi superiori a € 77,47, a carico del committente.`)):e.regime===`forf5`||e.regime===`forf15`?(t.push(`Operazione effettuata ai sensi dell'art. 1, commi da 54 a 89, della Legge 190/2014 e successive modificazioni — regime forfettario. Imposta non applicata.`),t.push(`Si richiede la non applicazione della ritenuta d'acconto ai sensi dell'art. 1, comma 67, della Legge 190/2014.`),e.bollo>0&&t.push(`Imposta di bollo di € 2,00 assolta sull'originale per importi superiori a € 77,47, a carico del committente.`)):e.regime===`ordinario`&&(e.ivaPerc>0?t.push(`Operazione soggetta a IVA con aliquota del ${e.ivaPerc}%.`):t.push(`Operazione non imponibile o esente ai fini IVA.`),e.ritPerc>0&&t.push(`Compenso soggetto a ritenuta d'acconto del ${e.ritPerc}% a titolo di acconto IRPEF ai sensi dell'art. 25 del D.P.R. 600/1973, operata dal committente in qualità di sostituto d'imposta.`)),e.rivPerc===4?t.push(`Rivalsa INPS Gestione Separata del 4% ai sensi dell'art. 1, comma 212, della Legge 662/1996.`):e.rivPerc===2&&t.push(`Contributo integrativo di cassa del 2%, non soggetto a ritenuta d'acconto.`),t.join(` `)}function m(e){let t=Array.isArray(e?.voci)?e.voci:[],n=0;for(let e of t){let t=String(e?.desc||``).trim().length,r=t>0?Math.ceil(t/72):0;n+=1.9+r}let r=String(e?.progetto?.intro||``).trim().length,i=r>240?Math.ceil((r-240)/105):0,a=n+i,o=t.length<=4&&a<=16;return{totVoci:t.length,ingombroP1:a,pagina1Compatta:o}}function h(e){let t=Number(e);return`€\u00A0${(Number.isFinite(t)?t:0).toLocaleString(`it-IT`,{minimumFractionDigits:2,maximumFractionDigits:2})}`}function g(e=new Date){let t=e instanceof Date?e:new Date(e);if(Number.isNaN(t.getTime())){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}function _(e,t=30){if(!e)return``;let n=String(e).split(`-`).map(Number);if(n.length!==3||n.some(Number.isNaN))return``;let r=new Date(n[0],n[1]-1,n[2]);return r.setDate(r.getDate()+t),g(r)}function v(e){if(!e)return``;let t=String(e).trim(),n=t.match(/^(\d{4})-(\d{2})-(\d{2})/);if(!n)return t;let r=[`gennaio`,`febbraio`,`marzo`,`aprile`,`maggio`,`giugno`,`luglio`,`agosto`,`settembre`,`ottobre`,`novembre`,`dicembre`],i=n[1],a=r[parseInt(n[2],10)-1]||n[2];return`${parseInt(n[3],10)} ${a} ${i}`}function y(e){if(!e)return`—`;let t=String(e).trim(),n=t.match(/^(\d{4})-(\d{2})-(\d{2})/);return n?`${n[3]}/${n[2]}/${n[1]}`:t}function b(e){let t=String(e||``).trim();return t?t.charAt(0).toUpperCase()+t.slice(1):``}function x(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function S(e){return String(e||``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]/g,``)}function C(e){return String(e||``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-zA-Z0-9]+/g,`_`).replace(/^_+|_+$/g,``).slice(0,48)}function w(e,t){let n=C(t?.numero||`Preventivo`),r=C(t?.cliente?.nome||``);return`${[`FC`,C(e||`Preventivo`),n,r].filter(Boolean).join(`_`)}.pdf`}function T(e=`p`){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`.slice(0,64)}var ee=`id.numero.data.validita.stato.cliente.progetto.voci.sconto.sconto_txt.regime.ritenuta.rivalsa.iva.bollo.incluso.escluso.opzioni.condizioni.io.totale.modificato.driveFileId.driveUrl.driveSavedAt.cestinato.eliminatoIl.annullamento`.split(`.`),te=[`id`,`nome`,`ref`,`indirizzo`,`piva`,`cf`,`sdi`,`pec`,`email`,`tel`,`note`,`creato`,`modificato`],ne=[`id`,`cat`,`nome`,`desc`,`unita`,`prezzo`,`ordine`,`attivo`,`creato`,`modificato`],re=new Set([`bozza`,`inviato`,`accettato`,`rifiutato`,`annullato`]);function ie(e){return Array.isArray(e)?{titolo:String(e[0]||``),testo:String(e[1]||``)}:e&&typeof e==`object`?{titolo:String(e.titolo??e.nome??``),testo:String(e.testo??e.desc??``)}:{titolo:String(e||``),testo:``}}function ae(e=[],t=new Date().getFullYear()){let n=`${t}-`,r=0;for(let t of Array.isArray(e)?e:[]){let e=String(t?.numero||``).trim();if(e.startsWith(n)){let t=e.slice(n.length),i=parseInt(t,10);Number.isFinite(i)&&i>r&&(r=i)}}return`${n}${String(r+1).padStart(3,`0`)}`}function oe({allQuotes:e=[],issuer:t={}}={}){let n=g(new Date);return E({id:T(`p`),numero:ae(e),data:n,validita:_(n,30),stato:`bozza`,cliente:{clienteId:``,nome:``,ref:``,indirizzo:``,piva:``,cf:``,sdi:``,pec:``,email:``,tel:``},progetto:{titolo:``,tipo:``,luogo:``,giornate:``,consegna:``,saluto:`Gentile Cliente,`,intro:``,scontoTipo:`euro`,scontoValore:0},voci:[{nome:``,desc:``,q:1,p:0}],sconto:0,scontoTipo:`euro`,scontoValore:0,sconto_txt:``,regime:`occasionale`,ritenuta:20,rivalsa:0,iva:22,bollo:`auto`,incluso:[...a],escluso:[...o],opzioni:[],condizioni:i.map(e=>({...e})),io:{cf:String(t?.cf||``),piva:String(t?.piva||``),iban:String(t?.iban||``),indirizzo:String(t?.indirizzo||``)},totale:0,cestinato:!1,eliminatoIl:null,modificato:new Date().toISOString()})}function E(e={}){let t=e&&typeof e==`object`?e:{},n=String(t.id||T(`p`)).replace(/[^a-zA-Z0-9_-]/g,``).slice(0,64)||T(`p`),r=g(new Date),i=String(t.data||``).trim(),a=i.length>=8&&i.length<=32?i:r,o=t.cliente&&typeof t.cliente==`object`?t.cliente:{},s=t.progetto&&typeof t.progetto==`object`?t.progetto:{},c=t.io&&typeof t.io==`object`?t.io:{},l=t.scontoTipo===`perc`||s.scontoTipo===`perc`?`perc`:`euro`,u=t.scontoValore!==void 0&&t.scontoValore!==null?Number(t.scontoValore):s.scontoValore!==void 0&&s.scontoValore!==null?Number(s.scontoValore):Number(t.sconto),d=Number.isFinite(u)?Math.max(0,u):0,p=(Array.isArray(t.voci)?t.voci:[]).slice(0,200).map(e=>({nome:String(e?.nome??``),desc:String(e?.desc??``),q:Number.isFinite(Number(e?.q))?Math.max(0,Number(e.q)):1,p:Number.isFinite(Number(e?.p))?Math.max(0,Number(e.p)):0}));p.length===0&&p.push({nome:``,desc:``,q:1,p:0});let m={id:n,numero:String(t.numero||``).trim().slice(0,64)||`BOZZA_${n.slice(-4)}`,data:a,validita:String(t.validita||``).slice(0,32),stato:re.has(t.stato)?t.stato:`bozza`,cliente:{clienteId:String(o.clienteId||t.clienteId||``).slice(0,64),nome:String(o.nome||``),ref:String(o.ref||``),indirizzo:String(o.indirizzo||``),piva:String(o.piva||``),cf:String(o.cf||``),sdi:String(o.sdi||``),pec:String(o.pec||``),email:String(o.email||``),tel:String(o.tel||``)},progetto:{titolo:String(s.titolo||``),tipo:String(s.tipo||``),luogo:String(s.luogo||``),giornate:String(s.giornate||``),consegna:String(s.consegna||``),saluto:String(s.saluto||``),intro:String(s.intro||``),scontoTipo:l,scontoValore:d},voci:p,scontoTipo:l,scontoValore:d,sconto:0,sconto_txt:String(t.sconto_txt||``).slice(0,300),regime:String(t.regime||`occasionale`).slice(0,100),ritenuta:Number.isFinite(Number(t.ritenuta))?Math.min(100,Math.max(0,Number(t.ritenuta))):20,rivalsa:Number.isFinite(Number(t.rivalsa))?Math.min(100,Math.max(0,Number(t.rivalsa))):0,iva:Number.isFinite(Number(t.iva))?Math.min(100,Math.max(0,Number(t.iva))):22,bollo:String(t.bollo||`auto`).slice(0,50),incluso:(Array.isArray(t.incluso)?t.incluso:[]).slice(0,100).map(e=>String(e||``)),escluso:(Array.isArray(t.escluso)?t.escluso:[]).slice(0,100).map(e=>String(e||``)),opzioni:(Array.isArray(t.opzioni)?t.opzioni:[]).slice(0,100).map(e=>({nome:String(e?.nome||``),desc:String(e?.desc||``),p:Number.isFinite(Number(e?.p))?Math.max(0,Number(e.p)):0})),condizioni:(Array.isArray(t.condizioni)?t.condizioni:[]).slice(0,100).map(ie),io:{cf:String(c.cf||``),piva:String(c.piva||``),iban:String(c.iban||``),indirizzo:String(c.indirizzo||``)},totale:0,modificato:String(t.modificato||new Date().toISOString()).slice(0,64),cestinato:!!t.cestinato,eliminatoIl:t.eliminatoIl?String(t.eliminatoIl).slice(0,64):null};t.driveFileId&&(m.driveFileId=String(t.driveFileId).slice(0,128)),t.driveUrl&&(m.driveUrl=String(t.driveUrl).slice(0,500)),t.driveSavedAt&&(m.driveSavedAt=String(t.driveSavedAt).slice(0,64)),t.annullamento&&typeof t.annullamento==`object`&&!Array.isArray(t.annullamento)&&(m.annullamento={data:String(t.annullamento.data||``),nota:String(t.annullamento.nota||``)});let h=f(m);return m.sconto=h.sconto,m.totale=h.netto,m}function se(e){let t=E(e),n=f(t),r={id:t.id,numero:t.numero,data:t.data,validita:t.validita,stato:t.stato,cliente:{clienteId:t.cliente.clienteId,nome:t.cliente.nome,ref:t.cliente.ref,indirizzo:t.cliente.indirizzo,piva:t.cliente.piva,cf:t.cliente.cf,sdi:t.cliente.sdi,pec:t.cliente.pec,email:t.cliente.email,tel:t.cliente.tel},progetto:{titolo:t.progetto.titolo,tipo:t.progetto.tipo,luogo:t.progetto.luogo,giornate:t.progetto.giornate,consegna:t.progetto.consegna,saluto:t.progetto.saluto,intro:t.progetto.intro,scontoTipo:t.scontoTipo,scontoValore:t.scontoValore},voci:t.voci.slice(0,200).map(e=>({nome:String(e.nome||``),desc:String(e.desc||``),q:Math.max(0,Number(e.q)||0),p:Math.max(0,Number(e.p)||0)})),sconto:Math.max(0,n.sconto),sconto_txt:t.sconto_txt.slice(0,300),regime:t.regime.slice(0,100),ritenuta:Math.min(100,Math.max(0,Number(t.ritenuta)||0)),rivalsa:Math.min(100,Math.max(0,Number(t.rivalsa)||0)),iva:Math.min(100,Math.max(0,Number(t.iva)||0)),bollo:t.bollo.slice(0,50),incluso:t.incluso.slice(0,100).map(e=>String(e||``)),escluso:t.escluso.slice(0,100).map(e=>String(e||``)),opzioni:t.opzioni.slice(0,100).map(e=>({nome:String(e.nome||``),desc:String(e.desc||``),p:Math.max(0,Number(e.p)||0)})),condizioni:t.condizioni.slice(0,100).map(e=>({titolo:String(e.titolo||``),testo:String(e.testo||``)})),io:{cf:t.io.cf,piva:t.io.piva,iban:t.io.iban,indirizzo:t.io.indirizzo},totale:n.netto,modificato:String(t.modificato||new Date().toISOString()).slice(0,64),cestinato:!!t.cestinato,eliminatoIl:t.cestinato?String(t.eliminatoIl||new Date().toISOString()).slice(0,64):null};t.driveFileId&&(r.driveFileId=t.driveFileId.slice(0,128)),t.driveUrl&&(r.driveUrl=t.driveUrl.slice(0,500)),t.driveSavedAt&&(r.driveSavedAt=t.driveSavedAt.slice(0,64)),t.annullamento&&typeof t.annullamento==`object`&&!Array.isArray(t.annullamento)&&(r.annullamento={data:String(t.annullamento.data||``),nota:String(t.annullamento.nota||``)});let i={};for(let e of ee)r[e]!==void 0&&(i[e]=r[e]);return i}function ce(e){return E(e)}function le(e){if(!e||typeof e!=`object`)return null;let t=String(e.nome||``).trim().slice(0,200);if(!t)return null;let n=String(e.id||T(`cli`)).replace(/[^a-zA-Z0-9_-]/g,``).slice(0,64)||T(`cli`),r=new Date().toISOString(),i={id:n,nome:t,ref:String(e.ref||``).trim().slice(0,200),indirizzo:String(e.indirizzo||``).trim().slice(0,300),piva:String(e.piva||``).trim().slice(0,50),cf:String(e.cf||``).trim().slice(0,50),sdi:String(e.sdi||``).trim().slice(0,20),pec:String(e.pec||``).trim().slice(0,150),email:String(e.email||``).trim().slice(0,150),tel:String(e.tel||``).trim().slice(0,50),note:String(e.note||``).trim().slice(0,2e3),creato:String(e.creato||r).slice(0,64),modificato:String(e.modificato||r).slice(0,64)},a={};for(let e of te)a[e]=i[e];return a}function ue(e,t=999){if(!e||typeof e!=`object`)return null;let n=String(e.nome||``).trim().slice(0,200);if(!n)return null;let r=String(e.id||T(`voc`)).replace(/[^a-zA-Z0-9_-]/g,`_`).slice(0,64)||T(`voc`),i=new Date().toISOString(),a={id:r,cat:String(e.cat||``).trim().slice(0,100),nome:n,desc:String(e.desc||``).trim().slice(0,1e3),unita:String(e.unita||`forfait`).trim().slice(0,50),prezzo:Number.isFinite(Number(e.prezzo))?Math.max(0,Number(e.prezzo)):0,ordine:Number.isFinite(Number(e.ordine))?Number(e.ordine):t,attivo:e.attivo!==!1,creato:String(e.creato||i).slice(0,64),modificato:String(e.modificato||i).slice(0,64)},o={};for(let e of ne)o[e]=a[e];return o}function de(e,t=[]){let n=E(e),r=f(n),i=[],a=[],o=[];return n.numero.trim()?(Array.isArray(t)?t:[]).find(e=>!e.cestinato&&e.id!==n.id&&String(e.numero||``).trim()===n.numero.trim())&&i.push(`Il numero preventivo «${n.numero}» è già utilizzato in archivio.`):i.push(`Manca il numero del preventivo.`),n.data||i.push(`Manca la data di emissione.`),n.cliente.nome.trim()||i.push(`Inserisci il nome o ragione sociale del cliente.`),n.progetto.titolo.trim()||i.push(`Inserisci il titolo del progetto.`),n.voci.filter(e=>e.nome.trim()||e.p>0).length===0&&i.push(`Aggiungi almeno una voce di preventivo.`),r.imponibile<=0&&i.push(`L'imponibile totale è € 0,00.`),r.scontoLordo>r.imponibile&&r.imponibile>0&&i.push(`Lo sconto supera l'imponibile totale.`),n.data&&n.validita&&n.validita<n.data&&a.push(`La data di validità è anteriore alla data di emissione.`),n.regime===`occasionale`&&r.netto>5e3&&a.push(`Importo superiore a € 5.000 in prestazione occasionale: verificare l'obbligo di iscrizione Gestione Separata INPS.`),r.haPartitaIva&&!n.io.piva.trim()&&a.push(`Regime con Partita IVA selezionato, ma manca la tua P. IVA nei dati emittente.`),n.io.cf.trim()||a.push(`Manca il tuo Codice Fiscale nei dati emittente (necessario per la Proforma/Nota).`),n.io.iban.trim()||o.push(`Inserisci l'IBAN nei dati emittente per completare la Proforma/Nota.`),n.cliente.email.trim()||o.push(`Aggiungi l'email del cliente per facilitare l'invio e il CRM.`),!n.cliente.piva.trim()&&!n.cliente.cf.trim()&&o.push(`Aggiungi P. IVA o C.F. del cliente per la successiva fatturazione.`),n.voci.some(e=>e.nome.trim()&&e.p===0)&&a.push(`Una o più voci hanno importo unitario pari a € 0,00.`),{errori:i,avvisi:a,suggerimenti:o,valido:i.length===0}}function fe(e){return!e||typeof e!=`object`?{ok:!1,error:`Il file JSON non contiene un oggetto valido.`}:Array.isArray(e.preventivi)?{ok:!0,type:`backup`,preventivi:e.preventivi.map(e=>E(e)),clienti:Array.isArray(e.clienti)?e.clienti.map(e=>le(e)).filter(Boolean):[],listino:Array.isArray(e.listino)?e.listino.map((e,t)=>ue(e,t+1)).filter(Boolean):[],io:e.io&&typeof e.io==`object`?e.io:null}:Array.isArray(e.voci)||e.cliente&&typeof e.cliente==`object`||e.progetto&&typeof e.progetto==`object`?{ok:!0,type:`single`,quote:E(e)}:{ok:!1,error:`Formato JSON non riconosciuto: deve contenere un preventivo valido o un backup completo.`}}function D(e){return typeof structuredClone==`function`?structuredClone(e):JSON.parse(JSON.stringify(e))}function pe(e,t){try{if(typeof localStorage>`u`)return t;let n=localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}}function O(e,t){try{if(typeof localStorage>`u`)return;localStorage.setItem(e,JSON.stringify(t))}catch{}}function me(){try{let e=localStorage.getItem(c.theme);if(e===`dark`||e===`light`)return e;if(window.matchMedia?.(`(prefers-color-scheme: dark)`).matches)return`dark`}catch{}return`light`}function he(){try{return localStorage.getItem(c.signature)!==`false`}catch{return!0}}var k=pe(c.localCacheIssuer,{cf:``,piva:``,iban:``,indirizzo:``}),ge=(pe(c.localCacheQuotes,[])||[]).filter(e=>e&&typeof e==`object`).map(e=>E(e)),_e=(pe(c.localCacheClients,[])||[]).filter(e=>e&&typeof e==`object`&&e.id),ve=(pe(c.localCachePriceList,[])||[]).filter(e=>e&&typeof e==`object`&&e.nome),ye=30,A={user:null,activeView:`editor`,splitPreviewOpen:!1,syncStatus:`saved`,syncMessage:``,theme:me(),signatureEnabled:he(),issuer:{cf:String(k.cf||``),piva:String(k.piva||``),iban:String(k.iban||``),indirizzo:String(k.indirizzo||``)},quotes:ge,clients:_e,priceList:ve,currentQuote:oe({allQuotes:ge,issuer:k}),isDraftPersisted:!1,structuralPast:[],structuralFuture:[],archiveViewMode:`cronologico`,archiveStatusFilter:`tutti`,archiveSort:`modificato_desc`,archiveSearch:``,selectedArchiveIds:new Set,openClientGroups:new Set,clientSearch:``,priceListSearch:``},be=new Set;function j(e=`all`,t={}){for(let n of be)try{n(A,e,t)}catch(e){console.error(`[Store] Errore listener:`,e)}}function xe(e){return be.add(e),()=>be.delete(e)}function M(){return A}function N(){return A.quotes.filter(e=>!e.cestinato)}function Se(){return A.quotes.filter(e=>!!e.cestinato)}function Ce(e){return e?String(e.cliente?.nome||``).trim()||String(e.progetto?.titolo||``).trim()?!0:(Array.isArray(e.voci)?e.voci:[]).some(e=>String(e?.nome||``).trim().length>0||Number(e?.p)>0):!1}function we(e){return{voci:D(e.voci),opzioni:D(e.opzioni),incluso:D(e.incluso),escluso:D(e.escluso),condizioni:D(e.condizioni)}}function Te(){let e=f(A.currentQuote);return A.currentQuote.sconto=e.sconto,A.currentQuote.totale=e.netto,A.currentQuote.progetto.scontoTipo=A.currentQuote.scontoTipo,A.currentQuote.progetto.scontoValore=A.currentQuote.scontoValore,e}var P={setUser(e){A.user=e,j(`auth`)},setActiveView(e){[`editor`,`archivio`,`clienti`,`listino`].includes(e)&&(A.activeView=e,j(`view`))},setSplitPreviewOpen(e){A.splitPreviewOpen=!!e;try{localStorage.setItem(c.splitPreview,A.splitPreviewOpen?`1`:`0`)}catch{}j(`splitPreview`)},toggleSplitPreview(){P.setSplitPreviewOpen(!A.splitPreviewOpen)},setSyncStatus(e,t=``){A.syncStatus=e,A.syncMessage=t,j(`sync`)},setTheme(e){A.theme=e===`dark`?`dark`:`light`;try{localStorage.setItem(c.theme,A.theme)}catch{}j(`theme`)},toggleTheme(){P.setTheme(A.theme===`dark`?`light`:`dark`)},setSignatureEnabled(e){A.signatureEnabled=!!e;try{localStorage.setItem(c.signature,A.signatureEnabled?`true`:`false`)}catch{}j(`signature`)},setIssuer(e,{persistCache:t=!0}={}){A.issuer={cf:String(e?.cf||``),piva:String(e?.piva||``),iban:String(e?.iban||``),indirizzo:String(e?.indirizzo||``)},A.currentQuote.io={...A.issuer},t&&O(c.localCacheIssuer,A.issuer),j(`issuer`)},setQuotes(e,{persistCache:t=!0}={}){let n=(Array.isArray(e)?e:[]).map(e=>E(e));A.quotes=n,t&&O(c.localCacheQuotes,n),A.currentQuote?.id&&n.some(e=>e.id===A.currentQuote.id)&&(A.isDraftPersisted=!0);let r=new Set(n.map(e=>e.id));for(let e of[...A.selectedArchiveIds])r.has(e)||A.selectedArchiveIds.delete(e);j(`quotes`)},upsertQuoteInList(e){let t=E(e),n=A.quotes.findIndex(e=>e.id===t.id);n>=0?A.quotes[n]=t:A.quotes.unshift(t),A.currentQuote?.id===t.id&&(A.isDraftPersisted=!0),O(c.localCacheQuotes,A.quotes),j(`quotes`)},removeQuotesFromList(e){let t=new Set(e);A.quotes=A.quotes.filter(e=>!t.has(e.id));for(let e of t)A.selectedArchiveIds.delete(e);O(c.localCacheQuotes,A.quotes),j(`quotes`)},setClients(e,{persistCache:t=!0}={}){A.clients=Array.isArray(e)?e:[],t&&O(c.localCacheClients,A.clients),j(`clients`)},setPriceList(e,{persistCache:t=!0}={}){let n=(Array.isArray(e)?e:[]).slice().sort((e,t)=>(Number(e.ordine)||999)-(Number(t.ordine)||999)||String(e.nome||``).localeCompare(String(t.nome||``),`it`));A.priceList=n,t&&O(c.localCachePriceList,n),j(`priceList`)},loadQuoteIntoEditor(e,{persisted:t=!0}={}){let n=E(e);!n.io.cf&&A.issuer.cf&&(n.io.cf=A.issuer.cf),!n.io.piva&&A.issuer.piva&&(n.io.piva=A.issuer.piva),!n.io.iban&&A.issuer.iban&&(n.io.iban=A.issuer.iban),!n.io.indirizzo&&A.issuer.indirizzo&&(n.io.indirizzo=A.issuer.indirizzo),A.currentQuote=n,A.isDraftPersisted=t,A.structuralPast=[],A.structuralFuture=[],Te(),j(`quoteLoaded`)},newQuote(e=null){let t=oe({allQuotes:A.quotes,issuer:A.issuer});e&&typeof e==`object`&&(t.cliente={clienteId:String(e.id||e.clienteId||``),nome:String(e.nome||``),ref:String(e.ref||``),indirizzo:String(e.indirizzo||``),piva:String(e.piva||``),cf:String(e.cf||``),sdi:String(e.sdi||``),pec:String(e.pec||``),email:String(e.email||``),tel:String(e.tel||``)},e.ref&&(t.progetto.saluto=`Gentile ${e.ref},`)),P.loadQuoteIntoEditor(t,{persisted:!1})},updateCurrentQuote(e,{triggerAutosave:t=!0,structural:n=!1}={}){n&&(A.structuralPast.push(we(A.currentQuote)),A.structuralPast.length>ye&&A.structuralPast.shift(),A.structuralFuture=[]),e(A.currentQuote),A.currentQuote.modificato=new Date().toISOString(),Te(),j(n?`quoteStructural`:`quoteField`,{triggerAutosave:t})},undoStructural(){if(A.structuralPast.length===0)return!1;A.structuralFuture.push(we(A.currentQuote));let e=A.structuralPast.pop();return A.currentQuote.voci=e.voci,A.currentQuote.opzioni=e.opzioni,A.currentQuote.incluso=e.incluso,A.currentQuote.escluso=e.escluso,A.currentQuote.condizioni=e.condizioni,A.currentQuote.modificato=new Date().toISOString(),Te(),j(`quoteStructural`,{triggerAutosave:!0}),!0},redoStructural(){if(A.structuralFuture.length===0)return!1;A.structuralPast.push(we(A.currentQuote));let e=A.structuralFuture.pop();return A.currentQuote.voci=e.voci,A.currentQuote.opzioni=e.opzioni,A.currentQuote.incluso=e.incluso,A.currentQuote.escluso=e.escluso,A.currentQuote.condizioni=e.condizioni,A.currentQuote.modificato=new Date().toISOString(),Te(),j(`quoteStructural`,{triggerAutosave:!0}),!0},setArchiveFilter(e){Object.assign(A,e),e.archiveStatusFilter!==void 0&&A.selectedArchiveIds.clear(),j(`archiveFilter`)},toggleSelectArchiveId(e){A.selectedArchiveIds.has(e)?A.selectedArchiveIds.delete(e):A.selectedArchiveIds.add(e),j(`archiveSelection`)},setSelectedArchiveIds(e){A.selectedArchiveIds=new Set(e),j(`archiveSelection`)},clearSelectedArchiveIds(){A.selectedArchiveIds.clear(),j(`archiveSelection`)},toggleClientGroup(e){A.openClientGroups.has(e)?A.openClientGroups.delete(e):A.openClientGroups.add(e),j(`archiveFilter`)},setClientSearch(e){A.clientSearch=String(e||``),j(`clientFilter`)},setPriceListSearch(e){A.priceListSearch=String(e||``),j(`priceListFilter`)}},Ee=`modulepreload`,De=function(e){return`/`+e},Oe={},ke=function(e){return e.pathname.endsWith(`.css`)},Ae=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},je=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=De(t,n);let r=s(t),i=ke(r);return Ae(Oe,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:Ee,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Me=`true`,Ne=`false`,Pe=Me===`true`,Fe=Ne===`true`;function Ie(e={}){let{immediate:t=!1,onNeedReload:n,onNeedRefresh:r,onOfflineReady:i,onRegistered:a,onRegisteredSW:o,onRegisterError:s}=e,c,l,u,d=async(e=!0)=>{await l,Pe||u?.()};async function f(){if(`serviceWorker`in navigator){if(c=await je(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-Bd17z0YL.js`);return{Workbox:e}},[]).then(({Workbox:e})=>new e(`/sw.js`,{scope:`/`,type:`classic`})).catch(e=>{s?.(e)}),!c)return;if(u=()=>{c?.messageSkipWaiting()},!Fe){if(Pe)c.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(n?n():window.location.reload())}),c.addEventListener(`installed`,e=>{e.isUpdate||i?.()});else{let e=!1,t=()=>{e=!0,c?.addEventListener(`controlling`,e=>{e.isUpdate&&(n?n():window.location.reload())}),r?.()};c.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&i?.():n.isExternal?t():!e&&i?.():n.isUpdate||i?.()}),c.addEventListener(`waiting`,t)}}c.register({immediate:t}).then(e=>{o?o(`/sw.js`,e):a?.(e)}).catch(e=>{s?.(e)})}}return l=f(),d}var Le=null;function F(e,{type:t=`info`,duration:n=3200}={}){let r=document.getElementById(`app-toast`);r&&(r.textContent=String(e||``),r.dataset.type=t,r.classList.add(`visible`),clearTimeout(Le),Le=setTimeout(()=>{r.classList.remove(`visible`)},n))}function Re(){let e=document.getElementById(`app-modal-dialog`);return e||(e=document.createElement(`dialog`),e.id=`app-modal-dialog`,e.className=`app-modal`,document.body.appendChild(e)),e}function I({title:e=``,subtitle:t=``,bodyHtml:n=``,buttons:r=[{label:`Chiudi`,value:!0,variant:`primary`}],size:i=`md`,onMount:a=null}){return new Promise(o=>{let s=Re();s.dataset.size=i;let c=r.map((e,t)=>`<button type="button" class="btn btn-${x(e.variant||`ghost`)}" data-modal-idx="${t}">${x(e.label)}</button>`).join(``);s.innerHTML=`
      <div class="modal-shell">
        <header class="modal-header">
          <div class="modal-title-group">
            <h3 class="modal-title">${x(e)}</h3>
            ${t?`<p class="modal-subtitle">${x(t)}</p>`:``}
          </div>
          <button type="button" class="icon-btn modal-close-x" aria-label="Chiudi finestra" data-modal-close>✕</button>
        </header>
        <div class="modal-body">${n}</div>
        ${r.length?`<footer class="modal-footer">${c}</footer>`:``}
      </div>
    `;let l=!1,u=e=>{l||(l=!0,s.removeEventListener(`cancel`,d),s.removeEventListener(`click`,f),s.open&&s.close(),o(e))},d=e=>{e.preventDefault(),u(null)},f=async e=>{if(e.target===s||e.target.closest(`[data-modal-close]`)){u(null);return}let t=e.target.closest(`[data-modal-idx]`);if(t){let e=r[Number(t.dataset.modalIdx)];if(!e)return;if(typeof e.onClick==`function`){let t=await e.onClick(s);if(t===!1)return;u(t===void 0?e.value:t)}else u(e.value)}};s.addEventListener(`cancel`,d),s.addEventListener(`click`,f),typeof a==`function`&&a(s,u),typeof s.showModal==`function`?s.showModal():s.setAttribute(`open`,``)})}function ze(e,t){return I({title:e,bodyHtml:`<p class="modal-text">${x(t)}</p>`,buttons:[{label:`Ho capito`,value:!0,variant:`primary`}],size:`sm`})}function L({title:e=`Conferma operazione`,message:t=``,confirmLabel:n=`Conferma`,cancelLabel:r=`Annulla`,danger:i=!1}){return I({title:e,bodyHtml:`<p class="modal-text">${x(t)}</p>`,buttons:[{label:r,value:!1,variant:`ghost`},{label:n,value:!0,variant:i?`danger`:`primary`}],size:`sm`}).then(e=>e===!0)}function Be({title:e,message:t,choices:n=[]}){return I({title:e,bodyHtml:`<p class="modal-text">${x(t)}</p>`,buttons:n,size:`md`})}var R=null,z=!1;function Ve(){return typeof window>`u`?!1:window.matchMedia?.(`(display-mode: standalone)`).matches||window.navigator.standalone===!0}function He(){if(typeof navigator>`u`)return!1;let e=navigator.userAgent||``,t=/iPad|iPhone|iPod/.test(e)||navigator.platform===`MacIntel`&&navigator.maxTouchPoints>1,n=/Safari/.test(e)&&!/CriOS|FxiOS|OPiOS|EdgiOS/.test(e);return t&&n}function Ue(){let e=document.querySelectorAll(`[data-action='install-pwa']`),t=!z&&(!!R||He());e.forEach(e=>{e.hidden=!t})}async function We(){if(z)F(`L'app è già installata sul dispositivo.`);else if(R){R.prompt();let{outcome:e}=await R.userChoice;R=null,e===`accepted`&&(z=!0,F(`App installata! Ora puoi aprirla dalla schermata Home.`,{type:`success`})),Ue()}else He()&&await I({title:`Installa su iPad o iPhone`,subtitle:`Aggiungi Compilatore Preventivi alla schermata Home`,size:`sm`,bodyHtml:`
        <ol class="ios-install-steps">
          <li>Tocca l'icona <strong>Condividi</strong> (quadrato con freccia verso l'alto) nella barra di Safari.</li>
          <li>Scorri e seleziona <strong>Aggiungi alla schermata Home</strong>.</li>
          <li>Conferma toccando <strong>Aggiungi</strong> in alto a destra per usarla a schermo intero.</li>
        </ol>
      `,buttons:[{label:`Ho capito`,value:!0,variant:`primary`}]})}function Ge(){z=Ve();try{Ie({immediate:!0,onOfflineReady(){console.info(`[PWA] Asset statici pronti per uso offline.`)},onNeedRefresh(){F(`Nuova versione pronta: aggiornamento applicato al prossimo avvio.`)},onRegisterError(e){console.warn(`[PWA] Registrazione Service Worker non disponibile:`,e)}})}catch(e){console.warn(`[PWA] virtual:pwa-register saltato:`,e)}window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),R=e,Ue()}),window.addEventListener(`appinstalled`,()=>{z=!0,R=null,Ue(),F(`Compilatore Preventivi installato con successo!`,{type:`success`})}),Ue()}var Ke={apiKey:`AIzaSyCB7tSAXM8SSFKKKjMeXsDK3sFMpyz2xUk`,authDomain:`preventivi-federico-coletta.firebaseapp.com`,projectId:`preventivi-federico-coletta`,storageBucket:`preventivi-federico-coletta.firebasestorage.app`,messagingSenderId:`226848240794`,appId:`1:226848240794:web:32658649186bde08af1b23`},qe=`fedecoletta@gmail.com`,B=null,Je=!1;function Ye(){if(globalThis.firebase===void 0)return null;let e=globalThis.firebase;return e.apps&&e.apps.length!==0||e.initializeApp(Ke),e}function Xe(){let e=Ye();return!e||typeof e.auth!=`function`?null:e.auth()}function V(){if(B)return B;let e=Ye();if(!e||typeof e.firestore!=`function`)return null;if(B=e.firestore(),!Je){Je=!0;try{B.enablePersistence({synchronizeTabs:!0}).catch(e=>{e?.code===`failed-precondition`?console.warn(`[Firestore] Persistenza attiva in un'altra scheda.`):e?.code===`unimplemented`&&console.warn(`[Firestore] IndexedDB non supportato da questo browser.`)})}catch(e){console.warn(`[Firestore] enablePersistence non disponibile:`,e)}}return B}function Ze(){if(typeof window>`u`||!window.location)return!1;let e=(window.location.hostname||``).toLowerCase(),t=(window.location.protocol||``).toLowerCase();return!!(e===`localhost`||e===`127.0.0.1`||e.endsWith(`.run.app`)&&t===`https:`)}var Qe=null,$e=!1,et=null;function tt(e=Qe){return!!(e&&e.email&&String(e.email).toLowerCase().trim()===`fedecoletta@gmail.com`)}function nt(e){let t=document.getElementById(`auth-gate-overlay`);t&&(t.hidden=!e),document.documentElement.classList.toggle(`auth-locked`,e),document.body.classList.toggle(`auth-locked`,e)}function rt(e,t=`info`){let n=document.getElementById(`auth-gate-feedback`);n&&(n.hidden=!1,n.dataset.variant=t,n.innerHTML=e)}function it(){let e=document.getElementById(`auth-gate-feedback`);e&&(e.hidden=!0)}function at(e){let t=document.getElementById(`user-profile-wrap`),n=document.getElementById(`user-profile-avatar`),r=document.getElementById(`user-profile-label`);t&&(e&&e.email?(t.hidden=!1,r&&(r.textContent=e.displayName||e.email),n&&(e.photoURL?(n.src=e.photoURL,n.hidden=!1):n.hidden=!0)):t.hidden=!0)}function ot(){$e||typeof MutationObserver>`u`||($e=!0,new MutationObserver(()=>{if(tt())return;let e=document.getElementById(`auth-gate-overlay`);if(!e||e.hidden||e.style.display===`none`||!document.contains(e)){let e=document.getElementById(`app`);e&&e.remove(),document.body.innerHTML=`
        <div class="auth-tamper-lock">
          <h2>Accesso Riservato — Protezione Attiva</h2>
          <p>Ricarica la pagina e accedi con il tuo account Google autorizzato.</p>
          <button type="button" class="btn btn-primary" id="btn-tamper-reload">Ricarica pagina</button>
        </div>
      `,document.getElementById(`btn-tamper-reload`)?.addEventListener(`click`,()=>{window.location.reload()})}}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:[`hidden`,`style`,`class`]}))}function st(e){Qe=e,P.setUser(e),e?tt(e)?(it(),nt(!1),at(e),typeof et==`function`&&et(e)):(nt(!0),at(null),ot(),rt(`<strong>Accesso negato</strong><br>
     L'account <code>${x(e.email||`sconosciuto`)}</code> non è autorizzato.<br>
     Questo gestionale è riservato a <strong>${x(qe)}</strong>.<br>
     <button type="button" class="btn btn-ghost btn-sm" id="btn-auth-switch-account" style="margin-top:10px">
       Esci e cambia account
     </button>`,`error`),document.getElementById(`btn-auth-switch-account`)?.addEventListener(`click`,()=>{ut()})):(nt(!0),at(null),ot())}async function ct(){let e=Xe();if(!e||typeof globalThis.firebase?.auth?.GoogleAuthProvider!=`function`){await ze(`Autenticazione non disponibile`,`Il servizio Google Auth è momentaneamente irraggiungibile o bloccato dalla rete.`);return}rt(`Apertura accesso Google in corso...`,`info`);let t=new globalThis.firebase.auth.GoogleAuthProvider;t.setCustomParameters({prompt:`select_account`});try{await e.signInWithPopup(t)}catch(n){if(n?.code===`auth/popup-blocked`)e.signInWithRedirect(t);else if(n?.code===`auth/popup-closed-by-user`)it();else{let e=`Impossibile completare l'accesso: ${x(n?.message||`errore sconosciuto`)}`;n?.code===`auth/unauthorized-domain`&&Ze()&&(e+=`<br><span class="auth-dev-hint">Dominio di anteprima non nella whitelist Firebase: usa il pulsante "Sessione Studio" qui sotto.</span>`),rt(e,`error`)}}}function lt(){Ze()&&st({email:qe,displayName:`Federico Coletta`,photoURL:``,isDevSession:!0,getIdToken:async()=>``})}async function ut(){let e=Xe();if(e)try{await e.signOut()}catch{}window.location.reload()}async function dt(){await L({title:`Disconnetti account`,message:`Vuoi uscire dal tuo account? Tutte le modifiche salvate restano al sicuro nel Cloud.`,confirmLabel:`Esci`,cancelLabel:`Rimani connesso`})&&await ut()}function ft(e){et=e,nt(!0),document.getElementById(`btn-login-google`)?.addEventListener(`click`,ct);let t=document.getElementById(`btn-login-dev`);t&&(Ze()?(t.hidden=!1,t.addEventListener(`click`,lt)):t.remove());let n=0,r=()=>{let e=Xe();if(!e)n<40&&(n+=1,setTimeout(r,120));else try{e.onAuthStateChanged(st)}catch(e){console.warn(`[FirebaseAuth] Errore inizializzazione listener:`,e)}};r()}var pt=1e3,mt=800,ht=!1,H=null,gt=new Map,U=new Map;function W(){return typeof navigator<`u`&&navigator.onLine===!1}function G(){let e=M().user;return!e||e.isDevSession?!1:!!V()}function _t(){if(ht)return;if(!G()){P.setSyncStatus(W()?`offline`:`saved`,`Sessione locale`);return}let e=V();e&&(ht=!0,e.collection(`preventivi`).onSnapshot({includeMetadataChanges:!0},e=>{let t=[];e.forEach(e=>{let n=e.data();n&&n.id&&t.push(ce(n))}),(t.length>0||!e.metadata.fromCache)&&P.setQuotes(t),e.metadata.hasPendingWrites||W()?P.setSyncStatus(`offline`,`Salvato offline`):P.setSyncStatus(`saved`,`Salvato`)},e=>{console.warn(`[Firestore] Errore listener /preventivi:`,e),P.setSyncStatus(W()?`offline`:`error`,`Errore sincronizzazione`)}),e.collection(`clienti`).onSnapshot({includeMetadataChanges:!0},e=>{let t=[];e.forEach(e=>{let n=e.data();n&&n.id&&t.push(n)}),(t.length>0||!e.metadata.fromCache)&&P.setClients(t)},e=>{console.warn(`[Firestore] Errore listener /clienti:`,e)}),e.collection(`listino`).onSnapshot({includeMetadataChanges:!0},e=>{let t=[];e.forEach(e=>{let n=e.data();n&&n.nome&&t.push(n)}),(t.length>0||!e.metadata.fromCache)&&P.setPriceList(t)},e=>{console.warn(`[Firestore] Errore listener /listino:`,e)}),e.collection(`config`).doc(`impostazioni`).onSnapshot(e=>{if(e.exists){let t=e.data();t?.data&&typeof t.data==`object`&&P.setIssuer(t.data)}},e=>{console.warn(`[Firestore] Errore listener /config/impostazioni:`,e)}))}function K(){let e=M();(e.isDraftPersisted||Ce(e.currentQuote))&&(clearTimeout(H),P.setSyncStatus(W()?`offline`:`saving`,W()?`Offline`:`Salvataggio...`),H=setTimeout(()=>{q()},pt))}async function q({force:e=!1}={}){clearTimeout(H),H=null;let t=M(),n=t.currentQuote;if(!n||!n.id)return!1;if(!t.isDraftPersisted&&!e&&!Ce(n))return P.setSyncStatus(W()?`offline`:`saved`),!1;let r=se(n),i=JSON.stringify({...r,modificato:``});if(!e&&gt.get(r.id)===i)return P.setSyncStatus(W()?`offline`:`saved`),!0;if(P.upsertQuoteInList(r),!G())return gt.set(r.id,i),P.setSyncStatus(W()?`offline`:`saved`),!0;let a=V();P.setSyncStatus(W()?`offline`:`saving`);try{return await a.collection(`preventivi`).doc(r.id).set(r,{merge:!0}),gt.set(r.id,i),P.setSyncStatus(W()?`offline`:`saved`),!0}catch(e){return console.error(`[Firestore] Errore salvataggio preventivo:`,e),P.setSyncStatus(W()?`offline`:`error`,e?.code||`Errore sync`),!1}}async function vt(e){let t=se(e);if(P.upsertQuoteInList(t),!G())return!0;let n=V();P.setSyncStatus(`saving`);try{return await n.collection(`preventivi`).doc(t.id).set(t,{merge:!0}),gt.set(t.id,JSON.stringify({...t,modificato:``})),P.setSyncStatus(W()?`offline`:`saved`),!0}catch(e){return console.error(`[Firestore] Errore saveQuoteToCloud:`,e),P.setSyncStatus(W()?`offline`:`error`),!1}}async function yt(e,t){let n=Array.isArray(e)?e:[e];if(n.length===0)return;let r=new Date().toISOString(),i=M().quotes.map(e=>n.includes(e.id)?{...e,stato:t,modificato:r}:e);if(P.setQuotes(i),n.includes(M().currentQuote.id)&&P.updateCurrentQuote(e=>{e.stato=t},{triggerAutosave:!1}),!G())return;let a=V();P.setSyncStatus(`saving`);try{let e=a.batch();n.forEach(n=>{e.set(a.collection(`preventivi`).doc(n),{stato:t,modificato:r},{merge:!0})}),await e.commit(),P.setSyncStatus(W()?`offline`:`saved`)}catch(e){console.error(`[Firestore] Errore updateQuoteStatus:`,e),P.setSyncStatus(W()?`offline`:`error`)}}async function bt(e){let t=Array.isArray(e)?e:[e];if(t.length===0)return;let n=new Date().toISOString(),r=M().quotes.map(e=>t.includes(e.id)?{...e,cestinato:!0,eliminatoIl:n,modificato:n}:e);if(P.setQuotes(r),!G())return;let i=V();P.setSyncStatus(`saving`);try{let e=i.batch();t.forEach(t=>{e.set(i.collection(`preventivi`).doc(t),{cestinato:!0,eliminatoIl:n,modificato:n},{merge:!0})}),await e.commit(),P.setSyncStatus(W()?`offline`:`saved`)}catch(e){console.error(`[Firestore] Errore moveQuotesToTrash:`,e),P.setSyncStatus(W()?`offline`:`error`)}}async function xt(e){let t=Array.isArray(e)?e:[e];if(t.length===0)return;let n=new Date().toISOString(),r=M().quotes.map(e=>t.includes(e.id)?{...e,cestinato:!1,eliminatoIl:null,modificato:n}:e);if(P.setQuotes(r),!G())return;let i=V();P.setSyncStatus(`saving`);try{let e=i.batch();t.forEach(t=>{e.set(i.collection(`preventivi`).doc(t),{cestinato:!1,eliminatoIl:null,modificato:n},{merge:!0})}),await e.commit(),P.setSyncStatus(W()?`offline`:`saved`)}catch(e){console.error(`[Firestore] Errore restoreQuotesFromTrash:`,e),P.setSyncStatus(W()?`offline`:`error`)}}async function St(e){let t=Array.isArray(e)?e:[e];if(t.length===0||(P.removeQuotesFromList(t),!G()))return;let n=V();P.setSyncStatus(`saving`);try{let e=n.batch();t.forEach(t=>{e.delete(n.collection(`preventivi`).doc(t))}),await e.commit(),P.setSyncStatus(W()?`offline`:`saved`)}catch(e){console.error(`[Firestore] Errore deleteQuotesPermanently:`,e),P.setSyncStatus(W()?`offline`:`error`)}}async function Ct(e){let t=le({...e,modificato:new Date().toISOString()});if(!t)return null;let n=M().clients.slice(),r=n.findIndex(e=>e.id===t.id);if(r>=0?n[r]=t:n.push(t),P.setClients(n),!G())return t;let i=V();P.setSyncStatus(`saving`);try{await i.collection(`clienti`).doc(t.id).set(t,{merge:!0}),P.setSyncStatus(W()?`offline`:`saved`)}catch(e){console.error(`[Firestore] Errore saveClientToCloud:`,e),P.setSyncStatus(W()?`offline`:`error`)}return t}async function wt(e){if(!e)return;let t=M().clients.filter(t=>t.id!==e);if(P.setClients(t),!G())return;let n=V();P.setSyncStatus(`saving`);try{await n.collection(`clienti`).doc(e).delete(),P.setSyncStatus(W()?`offline`:`saved`)}catch(e){console.error(`[Firestore] Errore deleteClientFromCloud:`,e),P.setSyncStatus(W()?`offline`:`error`)}}function Tt(e){let t=ue({...e,modificato:new Date().toISOString()});if(!t)return;let n=M().priceList.slice(),r=n.findIndex(e=>e.id===t.id);if(r>=0?n[r]=t:n.push(t),P.setPriceList(n),!G())return;clearTimeout(U.get(t.id)),P.setSyncStatus(W()?`offline`:`saving`);let i=setTimeout(async()=>{U.delete(t.id);let e=V();try{await e.collection(`listino`).doc(t.id).set(t,{merge:!0}),P.setSyncStatus(W()?`offline`:`saved`)}catch(e){console.error(`[Firestore] Errore salvataggio voce listino:`,e),P.setSyncStatus(W()?`offline`:`error`)}},mt);U.set(t.id,i)}async function Et(e){if(!e)return;clearTimeout(U.get(e)),U.delete(e);let t=M().priceList.filter(t=>t.id!==e);if(P.setPriceList(t),!G())return;let n=V();P.setSyncStatus(`saving`);try{await n.collection(`listino`).doc(e).delete(),P.setSyncStatus(W()?`offline`:`saved`)}catch(e){console.error(`[Firestore] Errore deletePriceItemFromCloud:`,e),P.setSyncStatus(W()?`offline`:`error`)}}async function Dt(e){let t={cf:String(e?.cf||``).trim(),piva:String(e?.piva||``).trim(),iban:String(e?.iban||``).trim(),indirizzo:String(e?.indirizzo||``).trim()};if(P.setIssuer(t),!G())return!0;let n=V();P.setSyncStatus(`saving`);try{return await n.collection(`config`).doc(`impostazioni`).set({data:t,modificato:new Date().toISOString()},{merge:!0}),P.setSyncStatus(W()?`offline`:`saved`),!0}catch(e){return console.error(`[Firestore] Errore saveIssuerToCloud:`,e),P.setSyncStatus(W()?`offline`:`error`),!1}}async function Ot({preventivi:e=[],clienti:t=[],listino:n=[],io:r=null}){if(r&&await Dt(r),e.length){let t=new Map(M().quotes.map(e=>[e.id,e]));e.forEach(e=>t.set(e.id,e)),P.setQuotes([...t.values()])}if(t.length){let e=new Map(M().clients.map(e=>[e.id,e]));t.forEach(t=>e.set(t.id,t)),P.setClients([...e.values()])}if(n.length){let e=new Map(M().priceList.map(e=>[e.id,e]));n.forEach(t=>e.set(t.id,t)),P.setPriceList([...e.values()])}if(!G())return!0;let i=V();P.setSyncStatus(`saving`,`Importazione Cloud...`);try{for(let t=0;t<e.length;t+=400){let n=i.batch();e.slice(t,t+400).forEach(e=>{let t=se(e);n.set(i.collection(`preventivi`).doc(t.id),t,{merge:!0})}),await n.commit()}for(let e=0;e<t.length;e+=400){let n=i.batch();t.slice(e,e+400).forEach(e=>{let t=le(e);t&&n.set(i.collection(`clienti`).doc(t.id),t,{merge:!0})}),await n.commit()}for(let e=0;e<n.length;e+=400){let t=i.batch();n.slice(e,e+400).forEach((n,r)=>{let a=ue(n,e+r+1);a&&t.set(i.collection(`listino`).doc(a.id),a,{merge:!0})}),await t.commit()}return P.setSyncStatus(W()?`offline`:`saved`),!0}catch(e){return console.error(`[Firestore] Errore syncImportedBackupToCloud:`,e),P.setSyncStatus(W()?`offline`:`error`),!1}}function kt(){window.addEventListener(`online`,()=>{P.setSyncStatus(`saving`,`Riconnessione...`),q().finally(()=>{W()||P.setSyncStatus(`saved`)})}),window.addEventListener(`offline`,()=>{P.setSyncStatus(`offline`,`Offline`)}),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`hidden`&&H&&q()}),window.addEventListener(`pagehide`,()=>{H&&q()})}function At(e,t){let n=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=t,document.body.appendChild(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(r),1e3)}function jt(e){if(!e)return;let t=C(e.numero||`Preventivo`),n=C(e.cliente?.nome||``),r=`Preventivo_${t}${n?`_${n}`:``}.json`;At(e,r),F(`Esportato ${r}`,{type:`success`})}function Mt(){let e=M();At({version:`2.0.0`,exportedAt:new Date().toISOString(),preventivi:e.quotes,clienti:e.clients,listino:e.priceList,io:e.issuer},`FC_Backup_Preventivi_${g(new Date)}.json`),F(`Backup esportato (${e.quotes.length} preventivi, ${e.clients.length} clienti).`,{type:`success`})}async function Nt(e){if(!e)return;let t;try{let n=await e.text();t=JSON.parse(n)}catch{await ze(`File non valido`,`Il file selezionato non è un documento JSON leggibile.`);return}let n=fe(t);n.ok?n.type===`single`?await Pt(n.quote):await L({title:`Importa backup completo`,message:`Il file contiene ${n.preventivi.length} preventivi, ${n.clienti.length} clienti e ${n.listino.length} voci di listino. I dati verranno uniti e sincronizzati sul Cloud.`,confirmLabel:`Importa e sincronizza`,cancelLabel:`Annulla`})&&(await Ot({preventivi:n.preventivi,clienti:n.clienti,listino:n.listino,io:n.io}),F(`Backup importato e sincronizzato sul Cloud.`,{type:`success`})):await ze(`Importazione non riuscita`,n.error)}async function Pt(e){let t=M().quotes,n=t.find(t=>t.id===e.id||e.numero&&String(t.numero||``).trim().toLowerCase()===String(e.numero||``).trim().toLowerCase()),r=E(e);if(n){let i=await Be({title:`Preventivo già presente in archivio`,message:`Esiste già un preventivo corrispondente (N. ${n.numero}${n.cliente?.nome?` — ${n.cliente.nome}`:``}). Come vuoi procedere?`,choices:[{label:`Annulla`,value:`cancel`,variant:`ghost`},{label:`Sovrascrivi esistente`,value:`overwrite`,variant:`danger`},{label:`Crea nuova copia`,value:`copy`,variant:`primary`}]});if(!i||i===`cancel`)return;i===`copy`?r=E({...e,id:T(`p`),numero:ae(t),stato:`bozza`,cestinato:!1,eliminatoIl:null,modificato:new Date().toISOString()}):i===`overwrite`&&(r=E({...e,id:n.id,cestinato:!1,eliminatoIl:null,modificato:new Date().toISOString()}))}else r=E({...e,cestinato:!1,eliminatoIl:null,modificato:new Date().toISOString()});P.loadQuoteIntoEditor(r,{persisted:!0}),P.setActiveView(`editor`),await vt(r),F(`Preventivo ${x(r.numero)} importato e aperto nell'editor.`,{type:`success`})}function Ft(e,{labelImponibile:t=`Imponibile`,scontoTxt:n=``,senzaNota:r=!1,titoloTotale:i=`Totale Preventivo`}={}){let a=(e,t,n)=>`<div class="riga ${e}"><span>${t}</span><span class="num">${n}</span></div>`,o=a(``,x(t),h(e.imponibile));if(e.sconto>0){let t=e.scontoTipo===`perc`&&e.scontoValore>0?`Sconto (${e.scontoValore}%)`:`Sconto`;o+=a(`att`,x(n||t),`\u2212\u00A0${h(e.sconto)}`)}e.rivPerc>0&&(o+=a(`att`,`${e.rivPerc===2?`Contributo cassa`:`Rivalsa INPS`} ${e.rivPerc}%`,h(e.rivalsa))),e.ivaPerc>0&&(o+=a(`att`,`IVA ${e.ivaPerc}%`,h(e.iva))),e.bollo>0&&(o+=a(`att`,`Marca da bollo`,h(e.bollo))),e.ritenuta>0&&(o+=a(``,`<b>Totale documento</b>`,`<b>${h(e.totaleDoc)}</b>`),o+=a(`att`,`Ritenuta d'acconto ${e.ritPerc}%`,`\u2212\u00A0${h(e.ritenuta)}`)),o+=`<div class="riga totale"><span>${x(i)}</span><span class="num">${h(e.netto)}</span></div>`;let s=r?``:p(e);return`<div class="totali">${s?`<div class="totali-note"><div class="totali-note-tit">Note fiscali</div><p class="nota">${x(s)}</p></div>`:`<div class="totali-note"></div>`}<div class="box">${o}</div></div>`}function J(t={},n={}){let r=t?.io||n||{},i=t?.regime||`occasionale`,a=[`forf5`,`forf15`,`ordinario`].includes(i),o=String(r.piva||``).trim(),s=String(r.cf||``).trim(),c=[a&&o?`P. IVA ${x(o)}`:``,s?`C.F. ${x(s)}`:``].filter(Boolean).join(` · `),l=e.sito.startsWith(`http`)?e.sito:`https://${e.sito}`;return`<footer class="pieded">
    <div class="footer-riga-1">
      <b>${x(e.nome)}</b> · ${x(e.ruolo)}${c?` · <span class="dati-fisc">${c}</span>`:``}
    </div>
    <div class="footer-riga-2">
      ${x(e.citta)} · <a href="mailto:${x(e.mail)}">${x(e.mail)}</a> · <a href="tel:${x(e.tel.replace(/\s+/g,``))}">${x(e.tel)}</a> · <a href="${x(l)}" target="_blank" rel="noopener">${x(e.sito)}</a>
    </div>
  </footer>`}function It(n=!1){return`<img src="${t.logoDoc}" class="doc-logo-img${n?` doc-logo-compact`:``}" alt="${x(e.nome)}">`}function Lt(n){return n?`<img src="${t.firma}" class="img-firma-auto" alt="Firma ${x(e.nome)}">`:``}function Rt(t,{showSignature:n=!0,totals:r=null}={}){let i=t||{},a=r||f(i),o=Array.isArray(i.voci)?i.voci:[],s=Array.isArray(i.opzioni)?i.opzioni:[],c=Array.isArray(i.incluso)?i.incluso:[],l=Array.isArray(i.escluso)?i.escluso:[],u=Array.isArray(i.condizioni)?i.condizioni:[],d=i.cliente||{},p=i.progetto||{},g=o.map((e,t)=>{let n=String(t+1).padStart(2,`0`),r=Number(e?.q)||0,i=Number(e?.p)||0;return`<tr class="voice-item">
        <td>
          <span class="v-nome"><span class="v-idx">${n}</span>${x(e?.nome||`Voce senza titolo`)}</span>
          ${e?.desc?`<span class="v-desc">${x(e.desc)}</span>`:``}
        </td>
        <td class="num">${x(r)}</td>
        <td class="num">${h(i)}</td>
        <td class="num col-totale">${h(r*i)}</td>
      </tr>`}).join(``),_=[[`Titolo`,p.titolo,!0],[`Tipologia`,p.tipo,!1],[`Location`,p.luogo,!1],[`Giornate`,p.giornate,!1],[`Consegna`,p.consegna,!1]].filter(e=>!!e[1]).map(([e,t,n])=>`<div class="spec-item${n?` spec-full`:``}"><dt>${x(e)}</dt><dd>${x(t)}</dd></div>`).join(``),y=[d.ref,d.indirizzo,[d.piva?`P. IVA ${d.piva}`:``,d.cf?`C.F. ${d.cf}`:``].filter(Boolean).join(` · `),[d.sdi?`SDI ${d.sdi}`:``,d.pec?`PEC ${d.pec}`:``].filter(Boolean).join(` · `),[d.email,d.tel].filter(Boolean).join(` · `)].filter(Boolean).map(x).join(`<br>`),S=`<table class="voci">
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
    <tbody>${g}</tbody>
  </table>`,C=s.length?`<div class="sezione">Opzioni su richiesta</div>
       <table class="voci voci-opzioni">
         <colgroup>
           <col style="width:82%">
           <col style="width:18%">
         </colgroup>
         <tbody>${s.map(e=>`<tr class="voice-item">
               <td><span class="v-nome">${x(e?.nome)}</span>${e?.desc?`<span class="v-desc">${x(e.desc)}</span>`:``}</td>
               <td class="num col-totale">${h(e?.p)}</td>
             </tr>`).join(``)}</tbody>
       </table>`:``,w=c.length||l.length?`<div class="sezione">Cosa comprende</div>
         <div class="due-colonne">
           <div class="col-card">
             <div class="etichetta-incluso">Incluso nell'offerta</div>
             <ul>${c.map(e=>`<li>${x(e)}</li>`).join(``)}</ul>
           </div>
           <div class="col-card escluso">
             <div class="etichetta-escluso">Escluso dall'offerta</div>
             <ul>${l.map(e=>`<li>${x(e)}</li>`).join(``)}</ul>
           </div>
         </div>`:``,T=u.length?`<div class="sezione">Condizioni contrattuali</div>
       <div class="condizioni-grid">${u.map((e,t)=>{let n=Array.isArray(e)?e[0]:e?.titolo,r=Array.isArray(e)?e[1]:e?.testo;return`<div class="cond-card clause${t===u.length-1&&u.length%2!=0?` clause-full`:``}">
             <div class="cond-tit">${x(n)}</div>
             <div class="cond-txt">${x(r)}</div>
           </div>`}).join(``)}</div>`:``,ee=`<section class="accettazione sign-area">
    <div class="tit">Accettazione e Conferma d'Ordine</div>
    <p>Per accettare il presente preventivo, restituire copia firmata via email a <a href="mailto:${x(e.mail)}">${x(e.mail)}</a> oppure rispondere per iscritto con la formula «confermo il preventivo N. ${x(i.numero)}».</p>
    <div class="firme">
      <div class="f">
        <div class="linea"></div>
        <div class="did">Il Committente · Data e firma per accettazione</div>
      </div>
      <div class="f">
        <div class="linea">${Lt(n)}</div>
        <div class="did">${x(e.nome)}</div>
      </div>
    </div>
  </section>`,te=p.saluto||p.titolo||p.intro?`<section class="intro">
          ${p.saluto?`<p>${x(p.saluto)}</p>`:``}
          <p>di seguito il preventivo${p.titolo?` per <b>${x(p.titolo)}</b>`:``}.${p.intro?` ${x(b(p.intro))}`:``}</p>
        </section>`:``,ne=`<header class="intestazione">
    <div class="intestazione-logo">${It(!1)}</div>
    <div class="doc">
      <div class="tipo">PREVENTIVO</div>
      <div class="meta">N. <b>${x(i.numero)}</b> · Genzano di Roma, ${x(v(i.data))}<br>
      ${i.validita?`Valido fino al <b>${x(v(i.validita))}</b>`:``}</div>
    </div>
  </header>`,re=`<section class="blocchi">
    <div class="blocco blocco-cliente">
      <div class="etichetta">Cliente</div>
      <div class="nome">${x(d.nome||`—`)}</div>
      <div class="righe">${y}</div>
    </div>
    <div class="blocco blocco-specifiche">
      <div class="etichetta">Specifiche Progetto</div>
      <dl class="spec-grid">${_||`<div class="spec-item spec-full"><dd>—</dd></div>`}</dl>
    </div>
  </section>`;return m(i).pagina1Compatta?`<div class="doc-a4-root">
      <div class="foglio-stampa foglio-preventivo">
        ${ne}
        ${re}
        ${te}
        <div class="sezione">Voci di preventivo</div>
        ${S}
        ${Ft(a,{scontoTxt:i.sconto_txt})}
        <div class="spazio-flessibile"></div>
        <div class="rimando-continua">Segue allegato contrattuale, condizioni e firme a Pagina 2 →</div>
        ${J(i)}
      </div>

      <div class="foglio-stampa allegato-condizioni inizia-nuova-pagina">
        <header class="intestazione intestazione-compatta">
          <div class="intestazione-logo">${It(!0)}</div>
          <div class="doc">
            <div class="tipo">Allegato Contrattuale</div>
            <div class="meta">Rif. preventivo <b>${x(i.numero)}</b> · ${x(v(i.data))}</div>
          </div>
        </header>
        ${C}
        ${w}
        ${T}
        ${ee}
        <div class="spazio-flessibile"></div>
        ${J(i)}
      </div>
    </div>`:`<div class="doc-a4-root">
    <div class="foglio-stampa foglio-continuo">
      ${ne}
      ${re}
      ${te}
      <div class="sezione">Voci di preventivo</div>
      ${S}
      ${Ft(a,{scontoTxt:i.sconto_txt})}
      ${C}

      <div class="allegato-condizioni flusso-continuo">
        <div class="allegato-header-inline">
          <div class="tit-inline">Allegato Contrattuale &amp; Condizioni</div>
          <div class="rif-inline">Rif. preventivo ${x(i.numero)} · ${x(v(i.data))}</div>
        </div>
        ${w}
        ${T}
        ${ee}
      </div>

      ${J(i)}
    </div>
  </div>`}function zt(t,{showSignature:n=!0,totals:r=null}={}){let i=t||{},a=r||f(i),o=a.haPartitaIva,s=g(new Date),c=o?`Proforma`:`Nota di prestazione occasionale`,l=a.base,u=i.io||{},d=i.cliente||{},m=i.progetto||{},_=e.sito.startsWith(`http`)?e.sito:`https://${e.sito}`,y=`<div class="blocco">
    <div class="etichetta">${o?`Prestatore`:`Prestatore d'opera`}</div>
    <div class="nome">${x(e.nome)}</div>
    <div class="righe">
      ${x(e.ruolo)}<br>
      ${u.indirizzo?`${x(u.indirizzo)}<br>`:``}
      ${o&&u.piva?`P. IVA ${x(u.piva)}<br>`:``}
      ${u.cf?`C.F. ${x(u.cf)}<br>`:``}
      ${x(e.tel)} · ${x(e.mail)}<br>
      <a href="${x(_)}" target="_blank" rel="noopener">${x(e.sito)}</a>
    </div>
  </div>`,b=[d.indirizzo,[d.piva?`P. IVA ${d.piva}`:``,d.cf?`C.F. ${d.cf}`:``].filter(Boolean).join(` · `),d.sdi?`Codice SDI: ${d.sdi}`:``,d.pec?`PEC: ${d.pec}`:``].filter(Boolean).map(x).join(`<br>`),S=o?`<b>Documento non valido ai fini fiscali.</b> La fattura sarà emessa in formato elettronico e trasmessa tramite il Sistema di Interscambio, come previsto per tutti i titolari di partita IVA. ${x(p(a))}`:`<b>Prestazione occasionale ai sensi dell'art. 67, comma 1, lett. l) del D.P.R. 917/1986.</b> Compenso soggetto a ritenuta d'acconto del ${x(a.ritPerc||20)}% ai sensi dell'art. 25 del D.P.R. 600/1973, che il committente versa in qualità di sostituto d'imposta. Operazione fuori campo IVA ai sensi dell'art. 5 del D.P.R. 633/1972, in quanto prestazione priva del carattere di abitualità.${a.bollo>0?` Marca da bollo da € 2,00 assolta sull'originale per importi oltre € 77,47.`:``} Il compenso non supera il limite annuo di € 5.000 oltre il quale è dovuta l'iscrizione alla Gestione Separata INPS.`,C=(Array.isArray(i.voci)?i.voci:[]).map(e=>String(e?.nome||``).trim()).filter(Boolean).join(` · `);return`<div class="doc-a4-root">
    <div class="foglio-stampa foglio-secondo">
      <header class="intestazione">
        <div class="intestazione-logo">${It(!1)}</div>
        <div class="doc">
          <div class="tipo" style="font-size:18px">${x(c)}</div>
          <div class="meta">Genzano di Roma, ${x(v(s))}<br>Rif. preventivo <b>${x(i.numero)}</b></div>
        </div>
      </header>
      <section class="blocchi">
        ${y}
        <div class="blocco">
          <div class="etichetta">Committente</div>
          <div class="nome">${x(d.nome||`—`)}</div>
          <div class="righe">${b}</div>
        </div>
      </section>
      <div class="sezione">${o?`Prestazione concordata`:`Prestazione svolta`}</div>
      <table class="voci">
        <colgroup>
          <col style="width:80%">
          <col style="width:20%">
        </colgroup>
        <thead><tr><th>Descrizione Prestazione</th><th class="num">Importo</th></tr></thead>
        <tbody><tr class="voice-item">
          <td>
            <span class="v-nome">${x(m.titolo||`Prestazione professionale`)}</span>
            <span class="v-desc">${x(C)}${m.luogo?` · ${x(m.luogo)}`:``}</span>
          </td>
          <td class="num col-totale">${h(l)}</td>
        </tr></tbody>
      </table>
      ${Ft({...a,imponibile:l,sconto:0},{labelImponibile:o?`Compenso`:`Compenso lordo`,senzaNota:!0,titoloTotale:o?`Totale Documento`:`Netto a pagare`})}
      <div class="dicitura">${S}</div>
      <section class="pagamento">
        <div class="col">
          <div class="etichetta">Modalità di pagamento</div>
          <div class="val">Bonifico bancario</div>
          ${u.iban?`IBAN ${x(u.iban)}<br>`:``}Intestato a ${x(e.nome)}
        </div>
        <div class="col">
          <div class="etichetta">Termini e Causale</div>
          <div class="val">30 giorni data documento</div>
          Causale: ${x(c)} rif. ${x(i.numero)}${m.titolo?` · ${x(m.titolo)}`:``}
        </div>
      </section>
      <div class="firma-singola sign-area">
        <div class="b">
          <div class="linea">${Lt(n)}</div>
          <div class="did">${x(e.nome)}</div>
        </div>
      </div>
      <div class="spazio-flessibile"></div>
      ${J(i)}
    </div>
  </div>`}function Bt(e=[],t={}){let n=Array.isArray(e)?e:[],r=[...new Set(n.map(e=>e.cat||`Altro`))],i=g(new Date),a=r.map(e=>{let t=n.filter(t=>(t.cat||`Altro`)===e).map(e=>`<tr class="voice-item">
            <td>
              <span class="v-nome">${x(e.nome)}</span>
              ${e.desc?`<span class="v-desc">${x(e.desc)}</span>`:``}
            </td>
            <td class="num">${x(e.unita||`—`)}</td>
            <td class="num col-totale">${Number(e.prezzo)>0?h(e.prezzo):`a preventivo`}</td>
          </tr>`).join(``);return`<div class="sezione">${x(e)}</div>
        <table class="voci">
          <colgroup><col style="width:66%"><col style="width:16%"><col style="width:18%"></colgroup>
          <thead><tr><th>Voce</th><th class="num">Unità</th><th class="num">Prezzo</th></tr></thead>
          <tbody>${t}</tbody>
        </table>`}).join(``);return`<div class="doc-a4-root">
    <div class="foglio-stampa foglio-continuo">
      <header class="intestazione">
        <div class="intestazione-logo">${It(!1)}</div>
        <div class="doc">
          <div class="tipo" style="font-size:19px">Listino interno</div>
          <div class="meta">Aggiornato al ${x(v(i))}<br>Documento di lavoro</div>
        </div>
      </header>
      <div class="dicitura" style="margin-bottom:14px">
        <b>Uso interno.</b> Prezzi di riferimento per la compilazione dei preventivi, al netto di sconti,
        imposte e maggiorazioni. Gli importi non costituiscono offerta al pubblico e vanno confermati caso per caso.
      </div>
      ${a||`<p class="v-desc">Nessuna voce presente nel listino.</p>`}
      ${J({io:t})}
    </div>
  </div>`}async function Vt(e){let t=[...e.querySelectorAll(`img`)];await Promise.all(t.map(e=>e.complete?Promise.resolve():new Promise(t=>{e.addEventListener(`load`,t,{once:!0}),e.addEventListener(`error`,t,{once:!0}),setTimeout(t,1500)})))}async function Ht(e,t){let n=document.getElementById(`stampa`);if(!n)return;let r=document.title;n.innerHTML=e,document.title=t,await Vt(n);let i=()=>{document.title=r};window.addEventListener(`afterprint`,i,{once:!0}),window.print(),setTimeout(i,1e3)}async function Y(e,{showSignature:t=!0}={}){await Ht(Rt(e,{showSignature:t}),w(`Preventivo`,e).replace(/\.pdf$/i,``))}async function Ut(e,{showSignature:t=!0}={}){let n=f(e),r=n.haPartitaIva?`Proforma`:`NotaPrestazione`;await Ht(zt(e,{showSignature:t,totals:n}),w(r,e).replace(/\.pdf$/i,``))}async function Wt(e,t){let n=g(new Date);await Ht(Bt(e,t),`FC_Listino_Interno_${n}`)}var Gt=null,Kt=!1;function qt(e,t,n){if(t<0||n<0||t>=e.length||n>=e.length)return;let r=e[t];e[t]=e[n],e[n]=r}function X(e,t){let n=document.getElementById(e);if(!n)return;let r=String(t??``);n.value!==r&&(n.value=r)}function Z(){let e=M(),t=e.currentQuote;X(`f-numero`,t.numero),X(`f-data`,t.data),X(`f-validita`,t.validita),X(`f-stato`,t.stato),X(`f-cl-nome`,t.cliente.nome),X(`f-cl-ref`,t.cliente.ref),X(`f-cl-email`,t.cliente.email),X(`f-cl-tel`,t.cliente.tel),X(`f-cl-piva`,t.cliente.piva),X(`f-cl-cf`,t.cliente.cf),X(`f-cl-sdi`,t.cliente.sdi),X(`f-cl-pec`,t.cliente.pec),X(`f-cl-indirizzo`,t.cliente.indirizzo),X(`f-pr-titolo`,t.progetto.titolo),X(`f-pr-tipo`,t.progetto.tipo),X(`f-pr-luogo`,t.progetto.luogo),X(`f-pr-giornate`,t.progetto.giornate),X(`f-pr-consegna`,t.progetto.consegna),X(`f-pr-saluto`,t.progetto.saluto),X(`f-pr-intro`,t.progetto.intro),X(`f-sconto-val`,t.scontoValore||``),X(`f-sconto-txt`,t.sconto_txt),X(`f-regime`,t.regime),X(`f-ritenuta`,t.ritenuta),X(`f-rivalsa`,t.rivalsa),X(`f-iva`,t.iva),X(`f-bollo`,t.bollo),X(`f-io-cf`,t.io.cf),X(`f-io-piva`,t.io.piva),X(`f-io-iban`,t.io.iban),X(`f-io-indirizzo`,t.io.indirizzo),document.querySelectorAll(`[data-sconto-tipo]`).forEach(e=>{let n=e.dataset.scontoTipo===t.scontoTipo;e.classList.toggle(`active`,n),e.setAttribute(`aria-pressed`,String(n))});let n=document.getElementById(`f-firma-autografa`);n&&(n.checked=e.signatureEnabled);let r=document.getElementById(`editor-client-linked-badge`);r&&(r.hidden=!t.cliente.clienteId);let i=document.querySelector(`[data-editor-action='trash-current']`);i&&(i.hidden=!e.isDraftPersisted),Jt(t.regime),Yt()}function Jt(e){let t=[`forf5`,`forf15`,`ordinario`].includes(e),n=e===`occasionale`||e===`ordinario`,i=e===`ordinario`,a=[`forf5`,`forf15`,`occasionale`].includes(e),o=(e,t)=>{let n=document.getElementById(e);n&&(n.hidden=!t)};o(`wrap-rivalsa`,t),o(`wrap-ritenuta`,n),o(`wrap-iva`,i),o(`wrap-bollo`,a);let s=r.find(t=>t.id===e),c=document.getElementById(`fiscal-regime-hint`);c&&s&&(c.textContent=s.descrizione)}function Yt(){let e=M(),t=document.getElementById(`btn-undo-struct`),n=document.getElementById(`btn-redo-struct`);t&&(t.disabled=e.structuralPast.length===0),n&&(n.disabled=e.structuralFuture.length===0)}function Xt(){let e=document.getElementById(`sel-listino`);if(!e)return;let t=M().priceList;e.innerHTML=`<option value="">+ Aggiungi dal listino…</option>`+[...new Set(t.map(e=>e.cat||`Altro`))].map(e=>`<optgroup label="${x(e)}">`+t.filter(t=>(t.cat||`Altro`)===e).map(e=>`<option value="${x(e.id)}">${x(e.nome)} — ${h(e.prezzo)}${e.unita?` / ${x(e.unita)}`:``}</option>`).join(``)+`</optgroup>`).join(``)}function Zt(){let e=M().currentQuote,t=document.getElementById(`editor-voci-list`);t&&(t.innerHTML=e.voci.map((t,n)=>{let r=(Number(t.q)||0)*(Number(t.p)||0);return`<div class="line-item-card" data-voce-idx="${n}">
          <div class="line-item-top">
            <span class="line-idx">${String(n+1).padStart(2,`0`)}</span>
            <input type="text" class="field-input li-nome" data-li-field="nome" placeholder="Titolo prestazione (es. Giornata di ripresa)" value="${x(t.nome)}">
            <div class="li-controls">
              <button type="button" class="icon-btn icon-sm" data-li-move="up" title="Sposta su" aria-label="Sposta voce su"${n===0?` disabled`:``}>↑</button>
              <button type="button" class="icon-btn icon-sm" data-li-move="down" title="Sposta giù" aria-label="Sposta voce giù"${n===e.voci.length-1?` disabled`:``}>↓</button>
              <button type="button" class="icon-btn icon-sm icon-danger" data-li-remove title="Rimuovi voce" aria-label="Rimuovi voce">✕</button>
            </div>
          </div>
          <div class="line-item-body">
            <textarea class="field-input li-desc" data-li-field="desc" rows="2" placeholder="Descrizione tecnica, attrezzatura, ore, deliverable…">${x(t.desc)}</textarea>
            <div class="line-item-nums">
              <div class="mini-field">
                <label>Q.tà</label>
                <input type="number" step="0.5" min="0" class="field-input num-input" data-li-field="q" value="${t.q}">
              </div>
              <div class="mini-field">
                <label>Prezzo (€)</label>
                <input type="number" step="0.01" min="0" class="field-input num-input" data-li-field="p" value="${t.p}">
              </div>
              <div class="mini-field mini-total">
                <label>Subtotale</label>
                <span class="li-subtot">${h(r)}</span>
              </div>
            </div>
          </div>
        </div>`}).join(``));let n=document.getElementById(`editor-opzioni-list`);n&&(n.innerHTML=e.opzioni.length?e.opzioni.map((t,n)=>`<div class="sub-item-row" data-opz-idx="${n}">
              <div class="sub-item-fields">
                <input type="text" class="field-input field-sm" data-opz-field="nome" placeholder="Titolo opzione (es. Riprese aeree con drone)" value="${x(t.nome)}">
                <input type="text" class="field-input field-sm" data-opz-field="desc" placeholder="Dettagli opzione" value="${x(t.desc)}">
              </div>
              <input type="number" step="0.01" min="0" class="field-input field-sm num-input opz-price" data-opz-field="p" value="${t.p}" aria-label="Prezzo opzione">
              <div class="li-controls">
                <button type="button" class="icon-btn icon-sm" data-opz-move="up" aria-label="Sposta su"${n===0?` disabled`:``}>↑</button>
                <button type="button" class="icon-btn icon-sm" data-opz-move="down" aria-label="Sposta giù"${n===e.opzioni.length-1?` disabled`:``}>↓</button>
                <button type="button" class="icon-btn icon-sm icon-danger" data-opz-remove aria-label="Rimuovi opzione">✕</button>
              </div>
            </div>`).join(``):`<p class="muted-hint">Nessuna opzione aggiuntiva inserita.</p>`);let r=(e,t,n)=>{let r=document.getElementById(n);r&&(r.innerHTML=e.map((e,n)=>`<div class="bullet-row" data-bullet-kind="${t}" data-bullet-idx="${n}">
          <input type="text" class="field-input field-sm" data-bullet-input value="${x(e)}" placeholder="Voce…">
          <button type="button" class="icon-btn icon-sm icon-danger" data-bullet-remove aria-label="Rimuovi">✕</button>
        </div>`).join(``))};r(e.incluso,`incluso`,`editor-incluso-list`),r(e.escluso,`escluso`,`editor-escluso-list`);let i=document.getElementById(`editor-condizioni-list`);i&&(i.innerHTML=e.condizioni.map((t,n)=>`<div class="cond-item-row" data-cond-idx="${n}">
          <div class="cond-item-head">
            <input type="text" class="field-input field-sm cond-tit-input" data-cond-field="titolo" placeholder="Titolo clausola" value="${x(t.titolo)}">
            <div class="li-controls">
              <button type="button" class="icon-btn icon-sm" data-cond-move="up" aria-label="Sposta su"${n===0?` disabled`:``}>↑</button>
              <button type="button" class="icon-btn icon-sm" data-cond-move="down" aria-label="Sposta giù"${n===e.condizioni.length-1?` disabled`:``}>↓</button>
              <button type="button" class="icon-btn icon-sm icon-danger" data-cond-remove aria-label="Rimuovi clausola">✕</button>
            </div>
          </div>
          <textarea class="field-input field-sm" data-cond-field="testo" rows="2" placeholder="Testo clausola contrattuale…">${x(t.testo)}</textarea>
        </div>`).join(``)),Yt()}function Q(){let e=M(),t=e.currentQuote,n=f(t);document.querySelectorAll(`#editor-voci-list .line-item-card`).forEach(e=>{let n=Number(e.dataset.voceIdx),r=t.voci[n],i=e.querySelector(`.li-subtot`);r&&i&&(i.textContent=h((Number(r.q)||0)*(Number(r.p)||0)))});let r=document.getElementById(`sidebar-totals-box`);if(r){let e=[`<div class="sum-row"><span>Imponibile</span><strong>${h(n.imponibile)}</strong></div>`];if(n.sconto>0){let t=n.scontoTipo===`perc`?`Sconto (${n.scontoValore}%)`:`Sconto`;e.push(`<div class="sum-row is-muted"><span>${x(t)}</span><span>− ${h(n.sconto)}</span></div>`)}n.rivPerc>0&&e.push(`<div class="sum-row is-muted"><span>${n.rivPerc===2?`Cassa`:`Rivalsa INPS`} ${n.rivPerc}%</span><span>${h(n.rivalsa)}</span></div>`),n.ivaPerc>0&&e.push(`<div class="sum-row is-muted"><span>IVA ${n.ivaPerc}%</span><span>${h(n.iva)}</span></div>`),n.bollo>0&&e.push(`<div class="sum-row is-muted"><span>Marca da bollo</span><span>${h(n.bollo)}</span></div>`),n.ritenuta>0&&(e.push(`<div class="sum-row"><span>Totale documento</span><strong>${h(n.totaleDoc)}</strong></div>`),e.push(`<div class="sum-row is-muted"><span>Ritenuta ${n.ritPerc}%</span><span>− ${h(n.ritenuta)}</span></div>`)),e.push(`<div class="sum-total"><span>Totale Netto</span><strong>${h(n.netto)}</strong></div>`),r.innerHTML=e.join(``)}let i=document.getElementById(`editor-doc-badge`);i&&(i.textContent=`N. ${t.numero}`);let a=document.getElementById(`mobile-bar-total`);a&&(a.textContent=h(n.netto));let o=document.getElementById(`editor-workspace`),s=document.getElementById(`editor-preview-pane`),c=document.getElementById(`btn-toggle-split-preview`);o&&o.classList.toggle(`is-split-open`,e.splitPreviewOpen),s&&(s.hidden=!e.splitPreviewOpen),c&&(c.classList.toggle(`active`,e.splitPreviewOpen),c.setAttribute(`aria-pressed`,String(e.splitPreviewOpen))),e.splitPreviewOpen&&(clearTimeout(Gt),Gt=setTimeout(()=>{Qt(`a4-preview-stage`)},90))}function Qt(e){let t=document.getElementById(e);if(!t)return;let n=M();t.innerHTML=Rt(n.currentQuote,{showSignature:n.signatureEnabled})}function $t(e){let t=document.getElementById(`client-autocomplete-list`);if(!t)return;let n=String(e||``).trim().toLowerCase(),r=M().clients.filter(e=>!n||`${e.nome} ${e.ref||``} ${e.piva||``} ${e.email||``}`.toLowerCase().includes(n)).slice(0,8);r.length?(t.innerHTML=r.map(e=>`<button type="button" class="ac-option" data-ac-client-id="${x(e.id)}">
        <span class="ac-name">${x(e.nome)}</span>
        <span class="ac-meta">${x([e.ref,e.piva,e.email].filter(Boolean).join(` · `))}</span>
      </button>`).join(``),t.hidden=!1,Kt=!0):(t.hidden=!0,Kt=!1)}function en(){let e=document.getElementById(`client-autocomplete-list`);e&&(e.hidden=!0),Kt=!1}async function tn(){let e=M(),t=de(e.currentQuote,e.quotes),n=(e,t,n)=>t.length?`<div class="verify-group ${n}">
      <h4>${e} (${t.length})</h4>
      <ul>${t.map(e=>`<li>${x(e)}</li>`).join(``)}</ul>
    </div>`:``,r=t.errori.length===0&&t.avvisi.length===0&&t.suggerimenti.length===0?`<div class="verify-ok">Il preventivo è completo e coerente in tutti i campi fiscali e descrittivi.</div>`:n(`Errori da correggere`,t.errori,`v-err`)+n(`Avvisi fiscali`,t.avvisi,`v-warn`)+n(`Suggerimenti`,t.suggerimenti,`v-info`);await I({title:`Verifica Preventivo`,subtitle:`Preventivo N. ${e.currentQuote.numero}`,bodyHtml:r,size:`md`,buttons:[{label:`Chiudi`,value:`close`,variant:`ghost`},{label:`Stampa PDF comunque`,value:`print`,variant:`primary`}]})===`print`&&await Y(e.currentQuote,{showSignature:e.signatureEnabled})}async function nn(){let e=M(),t=Rt(e.currentQuote,{showSignature:e.signatureEnabled});await I({title:`Anteprima A4 — N. ${e.currentQuote.numero}`,subtitle:`Identica al PDF esportato in stampa`,size:`lg`,bodyHtml:`<div class="modal-a4-scroll"><div class="a4-sheet-frame">${t}</div></div>`,buttons:[{label:`Chiudi`,value:`close`,variant:`ghost`},{label:`Stampa / Salva PDF`,value:`print`,variant:`primary`}]})===`print`&&await Y(e.currentQuote,{showSignature:e.signatureEnabled})}function rn({onTriggerImport:e}){let t=document.getElementById(`vista-editor`);if(!t)return;let c=document.getElementById(`f-stato`);c&&(c.innerHTML=n.map(e=>`<option value="${x(e.id)}">${x(e.label)}</option>`).join(``));let l=document.getElementById(`f-regime`);l&&(l.innerHTML=r.map(e=>`<option value="${x(e.id)}">${x(e.label)}</option>`).join(``));let u={"f-numero":(e,t)=>{e.numero=t},"f-data":(e,t)=>{e.data=t,t&&(e.validita=_(t,30),X(`f-validita`,e.validita))},"f-validita":(e,t)=>{e.validita=t},"f-stato":(e,t)=>{e.stato=t},"f-cl-nome":(e,t)=>{e.cliente.nome=t,e.cliente.clienteId=``;let n=document.getElementById(`editor-client-linked-badge`);n&&(n.hidden=!0)},"f-cl-ref":(e,t)=>{e.cliente.ref=t},"f-cl-email":(e,t)=>{e.cliente.email=t},"f-cl-tel":(e,t)=>{e.cliente.tel=t},"f-cl-piva":(e,t)=>{e.cliente.piva=t},"f-cl-cf":(e,t)=>{e.cliente.cf=t},"f-cl-sdi":(e,t)=>{e.cliente.sdi=t.toUpperCase()},"f-cl-pec":(e,t)=>{e.cliente.pec=t},"f-cl-indirizzo":(e,t)=>{e.cliente.indirizzo=t},"f-pr-titolo":(e,t)=>{e.progetto.titolo=t},"f-pr-tipo":(e,t)=>{e.progetto.tipo=t},"f-pr-luogo":(e,t)=>{e.progetto.luogo=t},"f-pr-giornate":(e,t)=>{e.progetto.giornate=t},"f-pr-consegna":(e,t)=>{e.progetto.consegna=t},"f-pr-saluto":(e,t)=>{e.progetto.saluto=t},"f-pr-intro":(e,t)=>{e.progetto.intro=t},"f-sconto-val":(e,t)=>{e.scontoValore=Math.max(0,parseFloat(t)||0)},"f-sconto-txt":(e,t)=>{e.sconto_txt=t},"f-regime":(e,t)=>{e.regime=t,t===`occasionale`?(e.ritenuta=20,e.rivalsa=0,X(`f-ritenuta`,20),X(`f-rivalsa`,0)):t===`forf5`||t===`forf15`?(e.ritenuta=0,e.iva=0,X(`f-ritenuta`,0)):t===`ordinario`&&(e.iva||(e.iva=22,X(`f-iva`,22))),Jt(t)},"f-ritenuta":(e,t)=>{e.ritenuta=Math.min(100,Math.max(0,parseFloat(t)||0))},"f-rivalsa":(e,t)=>{e.rivalsa=Math.min(100,Math.max(0,parseFloat(t)||0))},"f-iva":(e,t)=>{e.iva=Math.min(100,Math.max(0,parseFloat(t)||0))},"f-bollo":(e,t)=>{e.bollo=t}},d={"f-io-cf":`cf`,"f-io-piva":`piva`,"f-io-iban":`iban`,"f-io-indirizzo":`indirizzo`},f=null;t.addEventListener(`input`,e=>{let t=e.target;if(t.id===`f-cl-nome`&&$t(t.value),u[t.id]){P.updateCurrentQuote(e=>u[t.id](e,t.value)),K();return}if(d[t.id]){let e=d[t.id],n={...M().issuer,[e]:t.value};P.setIssuer(n),P.updateCurrentQuote(n=>{n.io[e]=t.value}),K(),clearTimeout(f),f=setTimeout(()=>{Dt(M().issuer)},900);return}let n=t.closest(`[data-voce-idx]`);if(n&&t.dataset.liField){let e=Number(n.dataset.voceIdx),r=t.dataset.liField;P.updateCurrentQuote(n=>{n.voci[e]&&(n.voci[e][r]=r===`q`||r===`p`?Math.max(0,parseFloat(t.value)||0):t.value)}),K();return}let r=t.closest(`[data-opz-idx]`);if(r&&t.dataset.opzField){let e=Number(r.dataset.opzIdx),n=t.dataset.opzField;P.updateCurrentQuote(r=>{r.opzioni[e]&&(r.opzioni[e][n]=n===`p`?Math.max(0,parseFloat(t.value)||0):t.value)}),K();return}let i=t.closest(`[data-bullet-idx]`);if(i&&t.hasAttribute(`data-bullet-input`)){let e=i.dataset.bulletKind,n=Number(i.dataset.bulletIdx);P.updateCurrentQuote(r=>{r[e]&&r[e][n]!==void 0&&(r[e][n]=t.value)}),K();return}let a=t.closest(`[data-cond-idx]`);if(a&&t.dataset.condField){let e=Number(a.dataset.condIdx),n=t.dataset.condField;P.updateCurrentQuote(r=>{r.condizioni[e]&&(r.condizioni[e][n]=t.value)}),K()}}),t.addEventListener(`change`,e=>{let t=e.target;if(t.id===`f-firma-autografa`)P.setSignatureEnabled(t.checked);else if(t.id===`sel-listino`&&t.value){let e=M().priceList.find(e=>e.id===t.value);if(t.value=``,!e)return;P.updateCurrentQuote(t=>{let n=t.voci.findIndex(e=>!e.nome.trim()&&!(Number(e.p)>0)),r={nome:e.nome,desc:e.desc||``,q:1,p:Number(e.prezzo)||0};n>=0?t.voci.splice(n,1,r):t.voci.push(r)},{structural:!0}),K(),F(`Voce «${e.nome}» aggiunta dal listino.`)}else u[t.id]&&(P.updateCurrentQuote(e=>u[t.id](e,t.value)),K())});let p=document.getElementById(`f-cl-nome`);p?.addEventListener(`focus`,()=>{M().clients.length>0&&$t(p.value)}),document.addEventListener(`click`,e=>{Kt&&!e.target.closest(`.client-ac-wrap`)&&en();let t=document.getElementById(`editor-more-menu`);t&&!t.hidden&&!e.target.closest(`.more-menu-wrap`)&&(t.hidden=!0)}),t.addEventListener(`click`,async t=>{let n=t.target.closest(`[data-ac-client-id]`);if(n){let e=M().clients.find(e=>e.id===n.dataset.acClientId);if(en(),!e)return;P.updateCurrentQuote(t=>{t.cliente={clienteId:e.id,nome:e.nome||``,ref:e.ref||``,indirizzo:e.indirizzo||``,piva:e.piva||``,cf:e.cf||``,sdi:e.sdi||``,pec:e.pec||``,email:e.email||``,tel:e.tel||``},e.ref&&(!t.progetto.saluto||t.progetto.saluto===`Gentile Cliente,`)&&(t.progetto.saluto=`Gentile ${e.ref},`)}),Z(),K(),F(`Cliente «${e.nome}» collegato dalla rubrica.`);return}let r=t.target.closest(`[data-sconto-tipo]`);if(r){let e=r.dataset.scontoTipo===`perc`?`perc`:`euro`;P.updateCurrentQuote(t=>{t.scontoTipo=e,t.progetto.scontoTipo=e,e===`perc`&&t.scontoValore>100&&(t.scontoValore=100)}),Z(),K();return}let c=t.target.closest(`[data-voce-idx]`);if(c){let e=Number(c.dataset.voceIdx),n=t.target.closest(`[data-li-move]`);if(n){let t=n.dataset.liMove===`up`?-1:1;P.updateCurrentQuote(n=>qt(n.voci,e,e+t),{structural:!0}),K();return}if(t.target.closest(`[data-li-remove]`)){P.updateCurrentQuote(t=>{t.voci.length<=1?t.voci[0]={nome:``,desc:``,q:1,p:0}:t.voci.splice(e,1)},{structural:!0}),K();return}}let l=t.target.closest(`[data-opz-idx]`);if(l){let e=Number(l.dataset.opzIdx),n=t.target.closest(`[data-opz-move]`);if(n){let t=n.dataset.opzMove===`up`?-1:1;P.updateCurrentQuote(n=>qt(n.opzioni,e,e+t),{structural:!0}),K();return}if(t.target.closest(`[data-opz-remove]`)){P.updateCurrentQuote(t=>t.opzioni.splice(e,1),{structural:!0}),K();return}}let u=t.target.closest(`[data-bullet-idx]`);if(u&&t.target.closest(`[data-bullet-remove]`)){let e=u.dataset.bulletKind,t=Number(u.dataset.bulletIdx);P.updateCurrentQuote(n=>n[e]?.splice(t,1),{structural:!0}),K();return}let d=t.target.closest(`[data-cond-idx]`);if(d){let e=Number(d.dataset.condIdx),n=t.target.closest(`[data-cond-move]`);if(n){let t=n.dataset.condMove===`up`?-1:1;P.updateCurrentQuote(n=>qt(n.condizioni,e,e+t),{structural:!0}),K();return}if(t.target.closest(`[data-cond-remove]`)){P.updateCurrentQuote(t=>t.condizioni.splice(e,1),{structural:!0}),K();return}}let f=t.target.closest(`[data-editor-action]`);if(!f)return;let p=f.dataset.editorAction,m=M(),h=document.getElementById(`editor-more-menu`);switch(h&&p!==`toggle-more-menu`&&(h.hidden=!0),p){case`toggle-more-menu`:h&&(h.hidden=!h.hidden);break;case`add-voce`:P.updateCurrentQuote(e=>e.voci.push({nome:``,desc:``,q:1,p:0}),{structural:!0}),K();{let e=document.querySelectorAll(`#editor-voci-list .li-nome`);e[e.length-1]?.focus()}break;case`apply-package`:{let e=s[f.dataset.package];if(!e||m.currentQuote.voci.some(e=>e.nome.trim()||e.p>0)&&!await L({title:`Carica pacchetto preimpostato`,message:`Vuoi aggiungere le voci del pacchetto a quelle già presenti?`,confirmLabel:`Aggiungi voci`,cancelLabel:`Annulla`}))return;P.updateCurrentQuote(t=>{t.voci=[...t.voci.filter(e=>e.nome.trim()||e.p>0),...e.map(e=>({...e}))]},{structural:!0}),K(),F(`Pacchetto inserito nelle voci di preventivo.`);break}case`add-opzione`:P.updateCurrentQuote(e=>e.opzioni.push({nome:``,desc:``,p:0}),{structural:!0}),K();break;case`add-incluso`:P.updateCurrentQuote(e=>e.incluso.push(``),{structural:!0}),K();break;case`add-escluso`:P.updateCurrentQuote(e=>e.escluso.push(``),{structural:!0}),K();break;case`add-condizione`:P.updateCurrentQuote(e=>e.condizioni.push({titolo:``,testo:``}),{structural:!0}),K();break;case`undo-struct`:P.undoStructural()&&(K(),F(`Modifica strutturale annullata.`));break;case`redo-struct`:P.redoStructural()&&(K(),F(`Modifica strutturale ripristinata.`));break;case`save-client-to-crm`:{let e=m.currentQuote.cliente;if(!e.nome.trim()){F(`Inserisci prima il nome del cliente.`,{type:`error`});return}let t=await Ct({id:e.clienteId||T(`cli`),nome:e.nome,ref:e.ref,indirizzo:e.indirizzo,piva:e.piva,cf:e.cf,sdi:e.sdi,pec:e.pec,email:e.email,tel:e.tel});t&&(P.updateCurrentQuote(e=>{e.cliente.clienteId=t.id}),Z(),K(),F(`Cliente «${t.nome}» salvato nella rubrica CRM.`,{type:`success`}));break}case`toggle-split-preview`:window.innerWidth<=1024?await nn():P.toggleSplitPreview();break;case`print-quote`:await Y(m.currentQuote,{showSignature:m.signatureEnabled});break;case`print-proforma`:await Ut(m.currentQuote,{showSignature:m.signatureEnabled});break;case`verify-quote`:await tn();break;case`new-quote`:P.newQuote(),F(`Nuovo preventivo pronto.`);break;case`duplicate-current`:{let e=E({...m.currentQuote,id:T(`p`),numero:ae(m.quotes),stato:`bozza`,cestinato:!1,eliminatoIl:null,modificato:new Date().toISOString()});await vt(e),P.loadQuoteIntoEditor(e,{persisted:!0}),F(`Duplicato come preventivo ${e.numero}.`,{type:`success`});break}case`export-current-json`:jt(m.currentQuote);break;case`import-json`:e?.();break;case`reset-standard-texts`:if(!await L({title:`Ripristina testi standard`,message:`Vuoi ripristinare le voci «Incluso / Escluso» e le 8 clausole contrattuali predefinite per questo preventivo?`,confirmLabel:`Ripristina`}))return;P.updateCurrentQuote(e=>{e.incluso=[...a],e.escluso=[...o],e.condizioni=i.map(e=>({...e}))},{structural:!0}),K(),F(`Testi contrattuali standard ripristinati.`);break;case`trash-current`:if(!m.isDraftPersisted||!await L({title:`Sposta nel cestino`,message:`Spostare il preventivo ${m.currentQuote.numero} nel cestino?`,confirmLabel:`Sposta nel cestino`,danger:!0}))return;await bt(m.currentQuote.id),P.newQuote(),F(`Preventivo spostato nel cestino.`)}})}function an(e){return n.find(t=>t.id===e)?.label||`Bozza`}function on(e,t){let n=e.slice();switch(t){case`data_desc`:return n.sort((e,t)=>String(t.data||``).localeCompare(String(e.data||``)));case`data_asc`:return n.sort((e,t)=>String(e.data||``).localeCompare(String(t.data||``)));case`numero_desc`:return n.sort((e,t)=>String(t.numero||``).localeCompare(String(e.numero||``),`it`,{numeric:!0}));case`totale_desc`:return n.sort((e,t)=>f(t).netto-f(e).netto);case`cliente_asc`:return n.sort((e,t)=>String(e.cliente?.nome||``).localeCompare(String(t.cliente?.nome||``),`it`));default:return n.sort((e,t)=>String(t.modificato||``).localeCompare(String(e.modificato||``)))}}function sn(){let e=M(),t=e.archiveStatusFilter===`cestino`,n=t?Se():N(),r=e.archiveSearch.trim().toLowerCase();return on(n.filter(n=>!t&&e.archiveStatusFilter!==`tutti`&&n.stato!==e.archiveStatusFilter?!1:!r||[n.numero,n.cliente?.nome,n.cliente?.ref,n.progetto?.titolo,n.progetto?.tipo,n.progetto?.luogo].filter(Boolean).join(` `).toLowerCase().includes(r)),e.archiveSort)}function cn(e){let t=n.map(t=>`<option value="${x(t.id)}"${e.stato===t.id?` selected`:``}>${x(t.label)}</option>`).join(``);return`<select class="status-select status-${x(e.stato)}" data-action="change-status" data-id="${x(e.id)}" aria-label="Stato preventivo ${x(e.numero)}">${t}</select>`}function ln(e,{isTrash:t,isSelected:n,isCurrent:r}){let i=f(e),a=e.cliente?.nome||`Cliente non indicato`,o=e.progetto?.titolo||`Senza titolo`;return t?`<tr class="archive-row${n?` is-selected`:``}" data-id="${x(e.id)}">
      <td class="col-check">
        <input type="checkbox" class="row-check" data-action="toggle-select" data-id="${x(e.id)}"${n?` checked`:``} aria-label="Seleziona ${x(e.numero)}">
      </td>
      <td class="col-num">
        <span class="mono-num">${x(e.numero)}</span>
        <span class="row-sub">Eliminato il ${x(y(e.eliminatoIl))}</span>
      </td>
      <td class="col-main">
        <div class="row-title">${x(a)}</div>
        <div class="row-sub">${x(o)}</div>
      </td>
      <td class="col-date">${x(y(e.data))}</td>
      <td class="col-status"><span class="status-tag status-${x(e.stato)}">${x(an(e.stato))}</span></td>
      <td class="col-amount">${h(i.netto)}</td>
      <td class="col-actions">
        <div class="row-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="restore-one" data-id="${x(e.id)}">Ripristina</button>
          <button type="button" class="btn btn-danger btn-sm" data-action="delete-one" data-id="${x(e.id)}">Elimina</button>
        </div>
      </td>
    </tr>`:`<tr class="archive-row${n?` is-selected`:``}${r?` is-current`:``}" data-id="${x(e.id)}">
    <td class="col-check">
      <input type="checkbox" class="row-check" data-action="toggle-select" data-id="${x(e.id)}"${n?` checked`:``} aria-label="Seleziona ${x(e.numero)}">
    </td>
    <td class="col-num">
      <button type="button" class="link-num" data-action="open-quote" data-id="${x(e.id)}">${x(e.numero)}</button>
      ${r?`<span class="current-dot" title="Aperto nell'editor">Aperto</span>`:``}
    </td>
    <td class="col-main">
      <button type="button" class="row-open-trigger" data-action="open-quote" data-id="${x(e.id)}">
        <span class="row-title">${x(a)}</span>
        <span class="row-sub">${x(o)}</span>
      </button>
    </td>
    <td class="col-date">${x(y(e.data))}</td>
    <td class="col-status">${cn(e)}</td>
    <td class="col-amount">${h(i.netto)}</td>
    <td class="col-actions">
      <div class="row-actions">
        <button type="button" class="icon-btn" title="Stampa PDF Preventivo" data-action="print-quote" data-id="${x(e.id)}" aria-label="Stampa PDF">PDF</button>
        <button type="button" class="icon-btn" title="Proforma / Nota di prestazione" data-action="print-proforma" data-id="${x(e.id)}" aria-label="Stampa Proforma">Nota</button>
        <button type="button" class="icon-btn" title="Duplica preventivo" data-action="duplicate-quote" data-id="${x(e.id)}" aria-label="Duplica">Duplica</button>
        <button type="button" class="icon-btn" title="Esporta JSON" data-action="export-json" data-id="${x(e.id)}" aria-label="Esporta JSON">JSON</button>
        <button type="button" class="icon-btn icon-danger" title="Sposta nel cestino" data-action="trash-one" data-id="${x(e.id)}" aria-label="Sposta nel cestino">✕</button>
      </div>
    </td>
  </tr>`}function un(e,t){let n=new Map;for(let t of e){let e=String(t.cliente?.nome||``).trim()||`Cliente non indicato`,r=t.cliente?.clienteId||S(e)||`__none__`;n.has(r)||n.set(r,{key:r,label:e,items:[],totalNetto:0,acceptedNetto:0});let i=n.get(r);i.items.push(t);let a=f(t).netto;i.totalNetto+=a,t.stato===`accettato`&&(i.acceptedNetto+=a)}let r=[...n.values()].sort((e,t)=>e.label.localeCompare(t.label,`it`));return r.map(e=>{let n=t.openClientGroups.has(e.key)||r.length<=3,i=n?`<div class="table-scroll">
            <table class="data-table archive-table">
              <tbody>
                ${e.items.map(e=>ln(e,{isTrash:!1,isSelected:t.selectedArchiveIds.has(e.id),isCurrent:t.currentQuote?.id===e.id})).join(``)}
              </tbody>
            </table>
          </div>`:``;return`<section class="client-group-card${n?` is-open`:``}">
        <button type="button" class="client-group-head" data-action="toggle-group" data-group="${x(e.key)}" aria-expanded="${n}">
          <div class="cg-left">
            <span class="cg-chevron">${n?`▾`:`▸`}</span>
            <span class="cg-name">${x(e.label)}</span>
            <span class="cg-count">${e.items.length} ${e.items.length===1?`preventivo`:`preventivi`}</span>
          </div>
          <div class="cg-right">
            <span class="cg-stat">Accettati: <strong>${h(e.acceptedNetto)}</strong></span>
            <span class="cg-stat">Totale: <strong>${h(e.totalNetto)}</strong></span>
          </div>
        </button>
        ${i}
      </section>`}).join(``)}function dn(){let e=document.getElementById(`archive-view-root`);if(!e)return;let t=M(),r=N(),i=Se(),a=t.archiveStatusFilter===`cestino`,o=sn(),s=0,c=0,l=0,u=0;for(let e of r){let t=f(e).netto;e.stato===`accettato`?(s+=t,l+=1,u+=1):e.stato===`inviato`?c+=t:e.stato===`rifiutato`&&(u+=1)}let d=u>0?Math.round(l/u*100):0,p=document.getElementById(`nav-archive-count`);p&&(p.textContent=String(r.length));let m={tutti:r.length,bozza:r.filter(e=>e.stato===`bozza`).length,inviato:r.filter(e=>e.stato===`inviato`).length,accettato:r.filter(e=>e.stato===`accettato`).length,rifiutato:r.filter(e=>e.stato===`rifiutato`).length,annullato:r.filter(e=>e.stato===`annullato`).length,cestino:i.length},g=[[`tutti`,`Tutti`],[`bozza`,`Bozze`],[`inviato`,`Inviati`],[`accettato`,`Accettati`],[`rifiutato`,`Rifiutati`],[`annullato`,`Annullati`],[`cestino`,`Cestino`]].map(([e,n])=>`<button type="button" class="filter-tab${t.archiveStatusFilter===e?` active`:``}${e===`cestino`?` is-trash`:``}" data-action="set-status-filter" data-value="${e}">
          <span>${n}</span>
          <span class="filter-count">${m[e]}</span>
        </button>`).join(``),_=t.selectedArchiveIds.size,v=o.length>0&&o.every(e=>t.selectedArchiveIds.has(e.id)),y=_?`<div class="bulk-bar">
        <span class="bulk-count"><strong>${_}</strong> selezionati</span>
        <div class="bulk-actions">
          ${a?`<button type="button" class="btn btn-secondary btn-sm" data-action="bulk-restore">Ripristina</button>
                 <button type="button" class="btn btn-danger btn-sm" data-action="bulk-delete">Elimina definitivamente</button>`:`<select class="field-input field-sm" data-action="bulk-status" aria-label="Cambia stato ai selezionati">
                   <option value="">Cambia stato…</option>
                   ${n.map(e=>`<option value="${e.id}">${e.label}</option>`).join(``)}
                 </select>
                 <button type="button" class="btn btn-danger btn-sm" data-action="bulk-trash">Sposta nel cestino</button>`}
          <button type="button" class="btn btn-ghost btn-sm" data-action="clear-selection">Deseleziona</button>
        </div>
      </div>`:``,b=``;b=o.length===0?`<div class="empty-state">
      <p class="empty-title">${a?`Il cestino è vuoto`:`Nessun preventivo trovato`}</p>
      <p class="empty-desc">${a?`I preventivi spostati nel cestino restano sincronizzati nel Cloud finché non li elimini definitivamente.`:`Prova a rimuovere i filtri di ricerca oppure crea un nuovo preventivo.`}</p>
      ${a?``:`<button type="button" class="btn btn-primary" data-action="new-quote-from-archive">+ Nuovo preventivo</button>`}
    </div>`:!a&&t.archiveViewMode===`clienti`?un(o,t):`<div class="table-card">
      <div class="table-scroll">
        <table class="data-table archive-table">
          <thead>
            <tr>
              <th class="col-check">
                <input type="checkbox" data-action="toggle-select-all"${v?` checked`:``} aria-label="Seleziona tutti">
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
            ${o.map(e=>ln(e,{isTrash:a,isSelected:t.selectedArchiveIds.has(e.id),isCurrent:t.currentQuote?.id===e.id})).join(``)}
          </tbody>
        </table>
      </div>
    </div>`,e.innerHTML=`
    <div class="view-header">
      <div>
        <h1 class="view-title">Archivio Preventivi</h1>
        <p class="view-subtitle">Sincronizzato in tempo reale con Firebase Cloud · ${r.length} attivi${i.length?` · ${i.length} nel cestino`:``}</p>
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
        <strong class="kpi-value">${h(s)}</strong>
        <span class="kpi-meta">${l} preventivi confermati</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">In attesa (Inviati)</span>
        <strong class="kpi-value">${h(c)}</strong>
        <span class="kpi-meta">${m.inviato} offerte aperte</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Tasso di conversione</span>
        <strong class="kpi-value">${d}%</strong>
        <span class="kpi-meta">${l} su ${u} definiti</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Archivio totale</span>
        <strong class="kpi-value">${r.length}</strong>
        <span class="kpi-meta">${m.bozza} bozze in lavorazione</span>
      </div>
    </div>

    <div class="toolbar-card">
      <div class="filter-tabs" role="tablist">${g}</div>
      <div class="toolbar-controls">
        <input type="search" id="archive-search-input" class="field-input search-input" placeholder="Cerca numero, cliente, progetto, location…" value="${x(t.archiveSearch)}" aria-label="Cerca nell'archivio">
        <select id="archive-sort-select" class="field-input field-sm" aria-label="Ordina preventivi">
          <option value="modificato_desc"${t.archiveSort===`modificato_desc`?` selected`:``}>Ultima modifica</option>
          <option value="data_desc"${t.archiveSort===`data_desc`?` selected`:``}>Data (più recenti)</option>
          <option value="data_asc"${t.archiveSort===`data_asc`?` selected`:``}>Data (meno recenti)</option>
          <option value="numero_desc"${t.archiveSort===`numero_desc`?` selected`:``}>Numero decrescente</option>
          <option value="totale_desc"${t.archiveSort===`totale_desc`?` selected`:``}>Importo più alto</option>
          <option value="cliente_asc"${t.archiveSort===`cliente_asc`?` selected`:``}>Cliente (A–Z)</option>
        </select>
        ${a?`<button type="button" class="btn btn-danger btn-sm" data-action="empty-trash"${i.length===0?` disabled`:``}>Svuota cestino</button>`:`<div class="segmented" role="group" aria-label="Modalità vista archivio">
                <button type="button" class="seg-btn${t.archiveViewMode===`cronologico`?` active`:``}" data-action="set-view-mode" data-value="cronologico">Elenco</button>
                <button type="button" class="seg-btn${t.archiveViewMode===`clienti`?` active`:``}" data-action="set-view-mode" data-value="clienti">Per Cliente</button>
              </div>`}
      </div>
    </div>

    ${y}
    ${b}
  `}function fn({onOpenQuote:e,onTriggerImport:t,onExportBackup:n}){let r=document.getElementById(`archive-view-root`);r&&(r.addEventListener(`input`,e=>{if(e.target.id===`archive-search-input`){let t=e.target.selectionStart;P.setArchiveFilter({archiveSearch:e.target.value});let n=document.getElementById(`archive-search-input`);n&&(n.focus(),t!==null&&n.setSelectionRange(t,t))}}),r.addEventListener(`change`,async e=>{let t=e.target;if(t.id===`archive-sort-select`){P.setArchiveFilter({archiveSort:t.value});return}let n=t.dataset.action;if(n===`change-status`){let e=t.dataset.id;await yt(e,t.value),F(`Stato aggiornato a «${an(t.value)}».`)}else if(n===`toggle-select`)P.toggleSelectArchiveId(t.dataset.id);else if(n===`toggle-select-all`){let e=sn();t.checked?P.setSelectedArchiveIds(e.map(e=>e.id)):P.clearSelectedArchiveIds()}else if(n===`bulk-status`&&t.value){let e=[...M().selectedArchiveIds],n=t.value;t.value=``,await yt(e,n),P.clearSelectedArchiveIds(),F(`${e.length} preventivi aggiornati a «${an(n)}».`,{type:`success`})}}),r.addEventListener(`click`,async r=>{let i=r.target.closest(`[data-action]`);if(!i)return;let a=i.dataset.action,o=i.dataset.id,s=M();switch(a){case`set-status-filter`:P.setArchiveFilter({archiveStatusFilter:i.dataset.value});break;case`set-view-mode`:P.setArchiveFilter({archiveViewMode:i.dataset.value});break;case`toggle-group`:P.toggleClientGroup(i.dataset.group);break;case`clear-selection`:P.clearSelectedArchiveIds();break;case`new-quote-from-archive`:P.newQuote(),P.setActiveView(`editor`);break;case`export-backup`:n?.();break;case`trigger-import-json`:t?.();break;case`open-quote`:{let t=s.quotes.find(e=>e.id===o);t&&e?.(t);break}case`print-quote`:{let e=s.quotes.find(e=>e.id===o);e&&await Y(e,{showSignature:s.signatureEnabled});break}case`print-proforma`:{let e=s.quotes.find(e=>e.id===o);e&&await Ut(e,{showSignature:s.signatureEnabled});break}case`export-json`:{let e=s.quotes.find(e=>e.id===o);e&&jt(e);break}case`duplicate-quote`:{let e=s.quotes.find(e=>e.id===o);if(!e)return;let t=E({...e,id:T(`p`),numero:ae(s.quotes),stato:`bozza`,cestinato:!1,eliminatoIl:null,modificato:new Date().toISOString()});await vt(t),P.loadQuoteIntoEditor(t,{persisted:!0}),P.setActiveView(`editor`),F(`Duplicato come preventivo ${t.numero}.`,{type:`success`});break}case`trash-one`:{let e=s.quotes.find(e=>e.id===o);if(!e||!await L({title:`Sposta nel cestino`,message:`Vuoi spostare il preventivo ${e.numero} nel cestino? Potrai sempre ripristinarlo.`,confirmLabel:`Sposta nel cestino`,danger:!0}))return;await bt(o),F(`Preventivo ${e.numero} spostato nel cestino.`);break}case`restore-one`:await xt(o),F(`Preventivo ripristinato nell'archivio.`,{type:`success`});break;case`delete-one`:{let e=s.quotes.find(e=>e.id===o);if(!e||!await L({title:`Eliminazione definitiva`,message:`Eliminare definitivamente il preventivo ${e.numero}? Questa operazione non può essere annullata.`,confirmLabel:`Elimina per sempre`,danger:!0}))return;await St(o),F(`Preventivo eliminato definitivamente.`);break}case`bulk-trash`:{let e=[...s.selectedArchiveIds];if(!await L({title:`Sposta nel cestino`,message:`Spostare ${e.length} preventivi selezionati nel cestino?`,confirmLabel:`Sposta nel cestino`,danger:!0}))return;await bt(e),P.clearSelectedArchiveIds(),F(`${e.length} preventivi spostati nel cestino.`);break}case`bulk-restore`:{let e=[...s.selectedArchiveIds];await xt(e),P.clearSelectedArchiveIds(),F(`${e.length} preventivi ripristinati.`,{type:`success`});break}case`bulk-delete`:{let e=[...s.selectedArchiveIds];if(!await L({title:`Elimina definitivamente`,message:`Eliminare definitivamente ${e.length} preventivi dal cestino? Azione irreversibile.`,confirmLabel:`Elimina per sempre`,danger:!0}))return;await St(e),P.clearSelectedArchiveIds(),F(`${e.length} preventivi eliminati definitivamente.`);break}case`empty-trash`:{let e=Se().map(e=>e.id);if(!e.length||!await L({title:`Svuota cestino`,message:`Eliminare definitivamente tutti i ${e.length} preventivi presenti nel cestino? Azione irreversibile.`,confirmLabel:`Svuota cestino`,danger:!0}))return;await St(e),P.clearSelectedArchiveIds(),F(`Cestino svuotato.`);break}}}))}function pn(e,t){let n=S(e.nome),r=S(e.piva);return t.filter(t=>{if(t.cliente?.clienteId&&t.cliente.clienteId===e.id)return!0;let i=S(t.cliente?.piva);if(r&&i&&r===i)return!0;let a=S(t.cliente?.nome);return!!(n&&a&&n===a)})}async function mn(e=null,{onOpenQuote:t}={}){let n=!!e,r=e||{id:T(`cli`),nome:``,ref:``,indirizzo:``,piva:``,cf:``,sdi:``,pec:``,email:``,tel:``,note:``},i=n?pn(r,N()):[],a=i.length?`<div class="client-history">
         <h4 class="modal-section-title">Storico preventivi (${i.length})</h4>
         <ul class="history-list">
           ${i.slice(0,8).map(e=>{let t=f(e).netto;return`<li>
                 <button type="button" class="history-row" data-open-linked-quote="${x(e.id)}">
                   <span class="mono-num">${x(e.numero)}</span>
                   <span class="history-title">${x(e.progetto?.titolo||`Senza titolo`)}</span>
                   <span class="history-date">${x(y(e.data))}</span>
                   <span class="history-amount">${h(t)}</span>
                 </button>
               </li>`}).join(``)}
         </ul>
       </div>`:``;await I({title:n?`Modifica cliente — ${r.nome}`:`Nuovo cliente`,subtitle:`I dati fiscali vengono sincronizzati su Cloud e suggeriti automaticamente nell'editor.`,size:`md`,bodyHtml:`
      <form id="client-crud-form" class="modal-form-grid">
        <div class="field span-2">
          <label for="cm-nome">Ragione sociale o Nome *</label>
          <input id="cm-nome" class="field-input" required maxlength="200" value="${x(r.nome)}" placeholder="Es. Produzioni Roma S.r.l.">
        </div>
        <div class="field">
          <label for="cm-ref">Referente</label>
          <input id="cm-ref" class="field-input" maxlength="200" value="${x(r.ref)}" placeholder="Es. Marco Rossi">
        </div>
        <div class="field">
          <label for="cm-email">Email</label>
          <input id="cm-email" type="email" class="field-input" maxlength="150" value="${x(r.email)}" placeholder="nome@azienda.it">
        </div>
        <div class="field">
          <label for="cm-tel">Telefono</label>
          <input id="cm-tel" class="field-input" maxlength="50" value="${x(r.tel)}" placeholder="+39 …">
        </div>
        <div class="field">
          <label for="cm-piva">Partita IVA</label>
          <input id="cm-piva" class="field-input" maxlength="50" value="${x(r.piva)}" placeholder="IT01234567890">
        </div>
        <div class="field">
          <label for="cm-cf">Codice Fiscale</label>
          <input id="cm-cf" class="field-input" maxlength="50" value="${x(r.cf)}">
        </div>
        <div class="field">
          <label for="cm-sdi">Codice Univoco SDI</label>
          <input id="cm-sdi" class="field-input" maxlength="20" value="${x(r.sdi)}" placeholder="7 caratteri">
        </div>
        <div class="field span-2">
          <label for="cm-pec">PEC</label>
          <input id="cm-pec" type="email" class="field-input" maxlength="150" value="${x(r.pec)}" placeholder="azienda@pec.it">
        </div>
        <div class="field span-2">
          <label for="cm-indirizzo">Indirizzo sede legale</label>
          <input id="cm-indirizzo" class="field-input" maxlength="300" value="${x(r.indirizzo)}" placeholder="Via, CAP, Città">
        </div>
        <div class="field span-2">
          <label for="cm-note">Note interne</label>
          <textarea id="cm-note" class="field-input" rows="2" maxlength="2000" placeholder="Condizioni concordate, preferenze, contatti amministrativi…">${x(r.note)}</textarea>
        </div>
      </form>
      ${a}
    `,onMount(e,n){e.querySelectorAll(`[data-open-linked-quote]`).forEach(e=>{e.addEventListener(`click`,()=>{let r=M().quotes.find(t=>t.id===e.dataset.openLinkedQuote);r&&(n(null),t?.(r))})})},buttons:[{label:`Annulla`,value:null,variant:`ghost`},{label:n?`Salva modifiche`:`Crea cliente`,value:`save`,variant:`primary`,async onClick(e){let t=e.querySelector(`#cm-nome`)?.value.trim()||``;return t?(await Ct({...r,nome:t,ref:e.querySelector(`#cm-ref`)?.value.trim()||``,email:e.querySelector(`#cm-email`)?.value.trim()||``,tel:e.querySelector(`#cm-tel`)?.value.trim()||``,piva:e.querySelector(`#cm-piva`)?.value.trim()||``,cf:e.querySelector(`#cm-cf`)?.value.trim()||``,sdi:e.querySelector(`#cm-sdi`)?.value.trim().toUpperCase()||``,pec:e.querySelector(`#cm-pec`)?.value.trim()||``,indirizzo:e.querySelector(`#cm-indirizzo`)?.value.trim()||``,note:e.querySelector(`#cm-note`)?.value.trim()||``}),F(n?`Scheda cliente aggiornata.`:`Nuovo cliente salvato nel Cloud.`,{type:`success`}),!0):(e.querySelector(`#cm-nome`)?.focus(),F(`Inserisci la ragione sociale o il nome del cliente.`,{type:`error`}),!1)}}]})}async function hn(){let e=N(),t=M().clients,n=new Set(t.map(e=>S(e.nome))),r=0;for(let t of e){let e=String(t.cliente?.nome||``).trim();if(!e)continue;let i=S(e);i&&!n.has(i)&&(n.add(i),await Ct({id:T(`cli`),nome:e,ref:t.cliente?.ref||``,indirizzo:t.cliente?.indirizzo||``,piva:t.cliente?.piva||``,cf:t.cliente?.cf||``,sdi:t.cliente?.sdi||``,pec:t.cliente?.pec||``,email:t.cliente?.email||``,tel:t.cliente?.tel||``,note:``}),r+=1)}r>0?F(`Importati ${r} nuovi clienti dai preventivi in archivio.`,{type:`success`}):F(`Tutti i clienti presenti nei preventivi sono già in rubrica.`)}function gn(){let e=document.getElementById(`clients-view-root`);if(!e)return;let t=M(),n=t.clients.slice().sort((e,t)=>String(e.nome||``).localeCompare(String(t.nome||``),`it`)),r=N(),i=t.clientSearch.trim().toLowerCase(),a=n.filter(e=>!i||[e.nome,e.ref,e.email,e.piva,e.cf,e.tel,e.indirizzo].filter(Boolean).join(` `).toLowerCase().includes(i)),o=0,s=0,c=new Map;for(let e of n){let t=pn(e,r),n=0,i=0;for(let e of t){let t=f(e).netto;i+=t,e.stato===`accettato`&&(n+=t)}o+=n,s+=i,c.set(e.id,{count:t.length,accepted:n,total:i})}let l=a.length?`<div class="table-card">
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
              ${a.map(e=>{let t=c.get(e.id)||{count:0,accepted:0,total:0};return`<tr>
                    <td>
                      <div class="row-title">${x(e.nome)}</div>
                      ${e.ref?`<div class="row-sub">Ref: ${x(e.ref)}</div>`:``}
                    </td>
                    <td>
                      <div class="row-sub">${x(e.email||`—`)}</div>
                      ${e.tel?`<div class="row-sub">${x(e.tel)}</div>`:``}
                    </td>
                    <td>
                      <div class="row-sub">${e.piva?`P. IVA ${x(e.piva)}`:e.cf?`C.F. ${x(e.cf)}`:`—`}</div>
                      ${e.sdi?`<div class="row-sub">SDI ${x(e.sdi)}</div>`:``}
                    </td>
                    <td class="num">${t.count}</td>
                    <td class="col-amount">${h(t.accepted)}</td>
                    <td class="col-actions">
                      <div class="row-actions">
                        <button type="button" class="btn btn-secondary btn-sm" data-action="quote-for-client" data-id="${x(e.id)}">+ Preventivo</button>
                        <button type="button" class="icon-btn" data-action="edit-client" data-id="${x(e.id)}" title="Modifica cliente">Modifica</button>
                        <button type="button" class="icon-btn icon-danger" data-action="delete-client" data-id="${x(e.id)}" title="Elimina cliente">✕</button>
                      </div>
                    </td>
                  </tr>`}).join(``)}
            </tbody>
          </table>
        </div>
      </div>`:`<div class="empty-state">
        <p class="empty-title">Nessun cliente in rubrica</p>
        <p class="empty-desc">Crea una scheda cliente o importa automaticamente i clienti dai preventivi già presenti in archivio.</p>
        <div class="empty-actions">
          <button type="button" class="btn btn-secondary" data-action="sync-from-quotes">Importa dai preventivi</button>
          <button type="button" class="btn btn-primary" data-action="new-client">+ Nuovo cliente</button>
        </div>
      </div>`;e.innerHTML=`
    <div class="view-header">
      <div>
        <h1 class="view-title">Rubrica Clienti</h1>
        <p class="view-subtitle">Anagrafica CRM collegata ai preventivi tramite ID relazionale · ${n.length} clienti</p>
      </div>
      <div class="view-header-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-action="sync-from-quotes">Aggiorna dai preventivi</button>
        <button type="button" class="btn btn-primary" data-action="new-client">+ Nuovo cliente</button>
      </div>
    </div>

    <div class="kpi-grid kpi-grid-3">
      <div class="kpi-card">
        <span class="kpi-label">Clienti registrati</span>
        <strong class="kpi-value">${n.length}</strong>
        <span class="kpi-meta">Sincronizzati su Firestore</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Volume accettato</span>
        <strong class="kpi-value">${h(o)}</strong>
        <span class="kpi-meta">Somma preventivi confermati</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Volume preventivato</span>
        <strong class="kpi-value">${h(s)}</strong>
        <span class="kpi-meta">Storico complessivo attivo</span>
      </div>
    </div>

    <div class="toolbar-card">
      <input type="search" id="client-search-input" class="field-input search-input" placeholder="Cerca ragione sociale, referente, P. IVA, email…" value="${x(t.clientSearch)}" aria-label="Cerca clienti">
    </div>

    ${l}
  `}function _n({onOpenQuote:e}){let t=document.getElementById(`clients-view-root`);t&&(t.addEventListener(`input`,e=>{if(e.target.id===`client-search-input`){let t=e.target.selectionStart;P.setClientSearch(e.target.value);let n=document.getElementById(`client-search-input`);n&&(n.focus(),t!==null&&n.setSelectionRange(t,t))}}),t.addEventListener(`click`,async t=>{let n=t.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.action,i=n.dataset.id,a=M();if(r===`new-client`)await mn(null,{onOpenQuote:e});else if(r===`sync-from-quotes`)await hn();else if(r===`edit-client`){let t=a.clients.find(e=>e.id===i);t&&await mn(t,{onOpenQuote:e})}else if(r===`quote-for-client`){let e=a.clients.find(e=>e.id===i);if(!e)return;P.newQuote(e),P.setActiveView(`editor`),F(`Nuovo preventivo precompilato per ${e.nome}.`)}else if(r===`delete-client`){let e=a.clients.find(e=>e.id===i);if(!e||!await L({title:`Elimina cliente`,message:`Eliminare «${e.nome}» dalla rubrica? I preventivi esistenti resteranno intatti in archivio.`,confirmLabel:`Elimina`,danger:!0}))return;await wt(i),F(`Cliente eliminato dalla rubrica.`)}}))}function $(){let e=document.getElementById(`pricelist-view-root`);if(!e)return;let t=M(),n=t.priceList,r=t.priceListSearch.trim().toLowerCase(),i=n.filter(e=>!r||`${e.cat||``} ${e.nome||``} ${e.desc||``} ${e.unita||``}`.toLowerCase().includes(r)),a=[...new Set(n.map(e=>e.cat).filter(Boolean))],o=[...new Set([`giornata`,`mezza giornata`,`forfait`,`ora`,`pezzo`,...n.map(e=>e.unita).filter(Boolean)])],s=i.map(e=>`<tr data-item-id="${x(e.id)}">
        <td class="pl-col-cat">
          <input class="field-input field-sm" data-field="cat" list="dl-pl-cats" placeholder="Categoria" value="${x(e.cat||``)}">
        </td>
        <td class="pl-col-main">
          <input class="field-input field-sm pl-nome-input" data-field="nome" placeholder="Nome prestazione *" value="${x(e.nome||``)}">
          <textarea class="field-input field-sm pl-desc-input" data-field="desc" rows="2" placeholder="Descrizione che verrà inserita nel preventivo">${x(e.desc||``)}</textarea>
        </td>
        <td class="pl-col-unit">
          <input class="field-input field-sm" data-field="unita" list="dl-pl-units" placeholder="giornata" value="${x(e.unita||``)}">
        </td>
        <td class="pl-col-price">
          <input class="field-input field-sm num-input" type="number" step="0.01" min="0" data-field="prezzo" value="${Number(e.prezzo)||0}">
        </td>
        <td class="col-actions">
          <button type="button" class="icon-btn icon-danger" data-action="delete-price-item" data-id="${x(e.id)}" title="Elimina voce" aria-label="Elimina voce">✕</button>
        </td>
      </tr>`).join(``);e.innerHTML=`
    <div class="view-header">
      <div>
        <h1 class="view-title">Listino Servizi</h1>
        <p class="view-subtitle">${n.length} voci in catalogo · salvataggio automatico Cloud (debounce 800ms)</p>
      </div>
      <div class="view-header-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-action="print-pricelist">Stampa PDF Listino</button>
        <button type="button" class="btn btn-primary" data-action="add-price-item">+ Aggiungi voce</button>
      </div>
    </div>

    <div class="toolbar-card">
      <input type="search" id="pricelist-search-input" class="field-input search-input" placeholder="Filtra per categoria, nome o descrizione…" value="${x(t.priceListSearch)}" aria-label="Cerca nel listino">
    </div>

    ${i.length?`<div class="table-card">
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
                <tbody>${s}</tbody>
              </table>
            </div>
          </div>`:`<div class="empty-state">
            <p class="empty-title">Nessuna voce trovata</p>
            <p class="empty-desc">Aggiungi i tuoi servizi ricorrenti per inserirli con un clic nei preventivi.</p>
            <button type="button" class="btn btn-primary" data-action="add-price-item">+ Aggiungi prima voce</button>
          </div>`}

    <datalist id="dl-pl-cats">${a.map(e=>`<option value="${x(e)}">`).join(``)}</datalist>
    <datalist id="dl-pl-units">${o.map(e=>`<option value="${x(e)}">`).join(``)}</datalist>
  `}function vn(){let e=document.getElementById(`pricelist-view-root`);e&&(e.addEventListener(`input`,e=>{if(e.target.id===`pricelist-search-input`){let t=e.target.selectionStart;P.setPriceListSearch(e.target.value);let n=document.getElementById(`pricelist-search-input`);n&&(n.focus(),t!==null&&n.setSelectionRange(t,t));return}let t=e.target.closest(`tr[data-item-id]`),n=e.target.dataset.field;if(!t||!n)return;let r=t.dataset.itemId,i=M().priceList.find(e=>e.id===r);if(!i)return;let a={...i};n===`prezzo`?a.prezzo=Math.max(0,parseFloat(e.target.value)||0):a[n]=e.target.value,i[n]=a[n],String(a.nome||``).trim().length>=1&&Tt(a)}),e.addEventListener(`click`,async t=>{let n=t.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.action;if(r===`add-price-item`){let t=M().priceList,n={id:T(`voc`),cat:``,nome:`Nuova voce`,desc:``,unita:`giornata`,prezzo:0,ordine:t.length+1,attivo:!0,creato:new Date().toISOString(),modificato:new Date().toISOString()};P.setPriceListSearch(``),Tt(n),$();let r=e.querySelector(`tr[data-item-id="${n.id}"] .pl-nome-input`);r&&(r.scrollIntoView({behavior:`smooth`,block:`center`}),r.focus(),r.select())}else if(r===`print-pricelist`){let e=M();await Wt(e.priceList,e.issuer)}else if(r===`delete-price-item`){let e=n.dataset.id;if(!await L({title:`Elimina voce di listino`,message:`Eliminare «${M().priceList.find(t=>t.id===e)?.nome||`questa voce`}» dal catalogo?`,confirmLabel:`Elimina`,danger:!0}))return;await Et(e),F(`Voce eliminata dal listino.`)}}))}function yn(e){document.documentElement.dataset.theme=e;let t=document.querySelector(`meta[name="theme-color"]`);t&&t.setAttribute(`content`,e===`dark`?`#0F1714`:`#1B4332`);let n=document.getElementById(`btn-toggle-theme`);n&&(n.setAttribute(`aria-label`,e===`dark`?`Passa al tema chiaro`:`Passa al tema scuro`),n.textContent=e===`dark`?`☀`:`☾`)}function bn(e){let t=document.getElementById(`topbar-sync-indicator`),n=document.getElementById(`topbar-sync-text`);if(t&&n)switch(t.dataset.status=e.syncStatus,e.syncStatus){case`saving`:n.textContent=e.syncMessage||`Salvataggio…`;break;case`offline`:n.textContent=e.syncMessage||`Offline`;break;case`error`:n.textContent=e.syncMessage||`Errore sync`;break;default:n.textContent=e.syncMessage||`Salvato`}}function xn(e){[`editor`,`archivio`,`clienti`,`listino`].forEach(t=>{let n=document.getElementById(`vista-${t}`);n&&(n.hidden=t!==e)}),document.querySelectorAll(`[data-nav-view]`).forEach(t=>{let n=t.dataset.navView===e;t.classList.toggle(`active`,n),n?t.setAttribute(`aria-current`,`page`):t.removeAttribute(`aria-current`)});let t=document.getElementById(`mobile-editor-bar`);t&&(t.hidden=e!==`editor`)}function Sn(){let e=M();yn(e.theme),bn(e);let t=document.getElementById(`global-json-import-input`),n=()=>{t&&(t.value=``,t.click())};t?.addEventListener(`change`,async e=>{let t=e.target.files?.[0];t&&await Nt(t)});let r=async e=>{await q(),P.loadQuoteIntoEditor(e,{persisted:!0}),P.setActiveView(`editor`),window.scrollTo({top:0,behavior:`smooth`})};rn({onTriggerImport:n}),fn({onOpenQuote:r,onTriggerImport:n,onExportBackup:Mt}),_n({onOpenQuote:r}),vn(),Z(),Zt(),Xt(),Q(),dn(),gn(),$(),xn(e.activeView),xe((e,t)=>{switch(t){case`theme`:yn(e.theme);break;case`sync`:bn(e);break;case`view`:xn(e.activeView),e.activeView===`archivio`?dn():e.activeView===`clienti`?gn():e.activeView===`listino`?$():Q();break;case`quoteLoaded`:Z(),Zt(),Q();break;case`quoteStructural`:Zt(),Q();break;case`quoteField`:case`splitPreview`:case`signature`:Q();break;case`issuer`:Z(),Q();break;case`quotes`:dn(),e.activeView===`clienti`&&gn(),Yt();break;case`archiveFilter`:case`archiveSelection`:dn();break;case`clients`:case`clientFilter`:gn();break;case`priceList`:Xt(),$();break;case`priceListFilter`:$()}}),document.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-nav-view]`);if(t){let e=t.dataset.navView;M().activeView===`editor`&&e!==`editor`&&await q(),P.setActiveView(e),window.scrollTo({top:0,behavior:`instant`});return}let n=e.target.closest(`[data-action]`);if(n)switch(n.dataset.action){case`toggle-theme`:P.toggleTheme();break;case`install-pwa`:await We();break;case`logout`:await dt();break;case`mobile-preview`:await nn();break;case`mobile-print`:{let e=M();await Y(e.currentQuote,{showSignature:e.signatureEnabled});break}case`topbar-new-quote`:await q(),P.newQuote(),P.setActiveView(`editor`),F(`Nuovo preventivo creato.`)}}),document.addEventListener(`keydown`,async e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`p`){if(M().activeView===`editor`){e.preventDefault();let t=M();await Y(t.currentQuote,{showSignature:t.signatureEnabled})}}else e.altKey&&e.key.toLowerCase()===`n`&&M().activeView===`editor`&&(e.preventDefault(),P.updateCurrentQuote(e=>e.voci.push({nome:``,desc:``,q:1,p:0}),{structural:!0}),F(`Nuova voce aggiunta.`))}),kt(),Ge(),ft(()=>{_t()})}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,Sn):Sn();