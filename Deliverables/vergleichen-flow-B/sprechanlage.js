/* ============================================================
   Metzler PLP — Türsprechanlagen
   Client-side rendering, live filtering, chips, pagination.
   Product list, prices, badges, reviews, awards, colour swatches, filters
   and subcategory rail mirror the live category page
   edelstahl-tuerklingel.de/tuersprechanlagen (Stand 05.11.2026, 41 Artikel,
   Standard-Sortierung) — see Deliverables/13_PLP_Live-Abgleich.md.
   Styling reuses the shared Briefkasten design system (plp.css).
   ============================================================ */
(function () {
  'use strict';

  var IMG = 'Product%20Image/Sprechanlage/video-station.png';
  var PAGE = 24; // products per page — as in the live shop (41 Artikel = 2 Seiten)

  /* ---- Colour facet (Shop-Merkmal „Farbe") — order + counts as on the live website ---- */
  var COLORS = {
    anthrazit:   { label: 'Anthrazit',    css: '#383E42', count: 40 },
    braun:       { label: 'Braun',        css: '#5A3B29', count: 3 },
    edelstahl:   { label: 'Edelstahl',    css: 'linear-gradient(135deg,#e9ebee,#a7adb4 55%,#d6d9dd)', count: 29 },
    eisenglimmer:{ label: 'Eisenglimmer', css: 'linear-gradient(135deg,#3a3d40,#23262a)', count: 31 },
    grau:        { label: 'Grau',         css: '#B9BCC0', count: 31 },
    schwarz:     { label: 'Schwarz',      css: '#1A171B', count: 31 },
    weiss:       { label: 'Weiß',         css: '#FFFFFF', count: 30 },
    wunschfarbe: { label: 'Wunschfarbe',  css: 'conic-gradient(from 90deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa,#e53935)', count: 27 }
  };

  /* ---- Card swatches = the colour bubbles of the live product card (Farbvarianten, in shop order) ---- */
  var SW = {
    '7016': { label: 'RAL 7016 Anthrazitgrau', css: '#383E42' },
    '9016': { label: 'RAL 9016 Verkehrsweiß', css: '#F1F0EA' },
    '9007': { label: 'RAL 9007 Graualuminium', css: '#8F8F8C' },
    '703':  { label: 'DB 703 Eisenglimmer', css: 'linear-gradient(135deg,#55595c,#3a3d40 60%,#4d5053)' },
    '9005': { label: 'RAL 9005 Tiefschwarz', css: '#0E0E10' },
    '7012': { label: 'RAL 7012 Basaltgrau', css: '#4E5754' },
    'es':   { label: 'Edelstahl gebürstet', css: 'linear-gradient(135deg,#e9ebee,#a7adb4 55%,#d6d9dd)' },
    'ltb':  { label: 'Linen Tex Black', css: 'repeating-linear-gradient(45deg,#1c1c1e 0 2px,#2b2b2e 2px 4px)' },
    'bs':   { label: 'Black Satin', css: 'linear-gradient(135deg,#3a3a3d,#141416)' },
    'bz':   { label: 'Bronze', css: 'linear-gradient(135deg,#a07a4f,#6e5034)' },
    'wf':   { label: 'Wunschfarbe nach RAL', css: 'conic-gradient(from 90deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa,#e53935)' }
  };

  /* ---- Sidebar facets = the live filter groups, in live order (Shop-Merkmale; option labels + counts
         exactly as shown on edelstahl-tuerklingel.de/tuersprechanlagen). Each product carries the raw shop
         values in p.f (card.f in vergleich-daten.js); 'color' uses p.colors. noCount: the live page shows
         no count for this group. ---- */
  var FACET_ORDER = ['fa', 'kt', 'color', 'mo', 'tb', 'zf', 'ns', 'pb', 'sys', 'bt'];
  var FACETS = {
    fa: { title: 'Anzahl der Briefkastenfächer', items: [
      { key: '1', label: '1', chip: '1 Briefkastenfach', count: 6 }
    ]},
    kt: { title: 'Anzahl der Klingeltaster', noCount: true, items: [
      { key: '1 Taster', label: '1 Taster', count: 19 },
      { key: '2 Taster', label: '2 Taster', count: 10 },
      { key: '3 Taster', label: '3 Taster', count: 10 },
      { key: '4 Taster', label: '4 Taster', count: 7 },
      { key: '5 Taster', label: '5 Taster', count: 7 },
      { key: '6 Taster', label: '6 Taster', count: 7 },
      { key: '7 Taster', label: '7 Taster', count: 5 },
      { key: 'Flexibel von 1-500', label: 'Flexibel von 1-500', chip: 'Klingeltaster flexibel (1–500)', count: 4 }
    ]},
    mo: { title: 'Montageart', items: [
      { key: 'Aufputz', label: 'Aufputz', count: 4 },
      { key: 'Standmontage', label: 'Standmontage', count: 1 },
      { key: 'Unterputz', label: 'Unterputz', count: 2 }
    ]},
    tb: { title: 'Türöffner Bedienung', items: [
      { key: 'Fingerprint', label: 'Fingerprint', count: 3 },
      { key: 'Gesichtserkennung', label: 'Gesichtserkennung', count: 3 },
      { key: 'PIN-Code', label: 'PIN-Code', count: 4 },
      { key: 'QR-Code', label: 'QR-Code', count: 3 },
      { key: 'RFID', label: 'RFID', count: 7 }
    ]},
    zf: { title: 'Zeitungsfach', items: [
      { key: 'Integriert', label: 'Integriert', chip: 'Zeitungsfach integriert', count: 3 }
    ]},
    ns: { title: 'Namensschild', items: [
      { key: 'Lasergraviert', label: 'Lasergraviert', chip: 'Namensschild lasergraviert', count: 21 },
      { key: 'mit Papiereinleger', label: 'mit Papiereinleger', chip: 'Namensschild mit Papiereinleger', count: 15 },
      { key: 'Digital', label: 'Digital', chip: 'Namensschild digital', count: 4 }
    ]},
    pb: { title: 'Paketbox', items: [
      { key: 'Integriert', label: 'Integriert', chip: 'Paketbox integriert', count: 4 }
    ]},
    sys: { title: 'System', items: [
      { key: 'IP-System', label: 'IP-System', count: 37 },
      { key: 'BUS-System', label: 'BUS-System', count: 4 }
    ]},
    bt: { title: 'Briefkastentyp', items: [
      { key: 'Wandbriefkasten', label: 'Wandbriefkasten', count: 2 },
      { key: 'Standbriefkasten', label: 'Standbriefkasten', count: 4 }
    ]},
    /* advisor-only group — NOT rendered as a sidebar facet (inactive inline advisor). */
    material: { title: 'material', items: [
      { key: 'edelstahl',   label: 'Edelstahl', count: 5 },
      { key: 'galvanisiert',label: 'Galvanisierter Stahl', count: 1 },
      { key: 'v2a',         label: 'V2A Edelstahl (1.4301)', count: 5 }
    ]}
  };

  /* Human-readable labels for chips */
  var LABELS = {};
  Object.keys(COLORS).forEach(function (k) { LABELS['color:' + k] = COLORS[k].label; });
  Object.keys(FACETS).forEach(function (g) {
    FACETS[g].items.forEach(function (it) { LABELS[g + ':' + it.key] = it.chip || it.label; });
  });

  /* ---- Subcategory rail = the live tiles (name, count, target). Image: the shop's tile image,
         local photo as offline fallback. ---- */
  var SP = 'Product%20Image/Sprechanlage/';
  var SHOP = 'https://edelstahl-tuerklingel.de/';
  var CAT_IMG = SHOP + 'media/image/category/';
  var SUBCATS = [
    { t: 'Video Sprechanlagen', n: 38, href: SHOP + 'video-tuersprechanlagen', img: CAT_IMG + '691/md/video-tuersprechanlagen.jpg', fb: SP + 'video-station.png' },
    { t: 'Sprechanlagen Sets', n: 6, href: SHOP + 'sprechanlagen-sets', img: CAT_IMG + '1272/md/sprechanlagen-sets.jpg', fb: SP + 'mehrfamilien-anlage.png' },
    { t: 'Audio Sprechanlagen', n: 7, href: SHOP + 'audio-tuersprechanlagen', img: CAT_IMG + '721/md/audio-tuersprechanlagen.jpg', fb: SP + 'audio-station.png' },
    { t: 'Video Sprechanlagen mit Briefkasten/Paketbox', n: 12, href: SHOP + 'sprechanlage-briefkasten', img: CAT_IMG + '926/md/sprechanlage-briefkasten.jpg', fb: SP + 'briefkasten-paketbox.png' },
    { t: 'Briefkastenanlagen Konfigurator', n: null, cta: true, href: SHOP + 'briefkastenanlage', img: CAT_IMG + '1085/md/briefkastenanlage.webp', fb: 'Product%20Image/Briefkastenanlage/konfigurator-tile.png' },
    { t: 'Innenstationen', n: 11, href: SHOP + 'innenstationen', img: CAT_IMG + '1102/md/innenstationen.jpg', fb: SP + 'innenstation.png' },
    { t: 'Ersatz Namensschilder', n: 8, href: SHOP + 'ersatz-namensschilder', img: CAT_IMG + '1056/md/ersatz-namensschilder.gif', fb: SP + 'audio-station-namensschild.png' },
    { t: 'Erweiterungen & Zubehör', n: 22, href: SHOP + 'vdm10-zubehoer', img: CAT_IMG + '810/md/vdm10-zubehoer.jpg', fb: SP + 'zubehoer.png' }
  ];

  /* ---- Product catalogue = the live category listing, both pages in the shop's default order
         („Standard"). name/price/uvp/ab/rating/reviews/badge/sw/awards are read from the live product
         cards (price = current price, uvp = struck price, ab = card shows „ab", sw = colour bubbles,
         awards = award pills). Image, colours, System, Klingeltaster, Türöffner and filter attributes come
         from the shop data (vergleich-daten.js, below). Existing prototype ids are kept where they map to
         the same shop article (dominik1 = Maxior 1 Taster, domaudio1 = ADM10 Dominik, …). ---- */
  var SALE = { type: 'sale', text: '−15 %' };
  var PRODUCTS = [
    { id:'sdm10x', name:'Türsprechanlage mit Kamera | Gesichtserkennung | Touch-Display | Live-HD-Video | Ein- und Mehrfamilien | SDM10X', price:1266.5, uvp:1490, ab:true, rating:4.5, reviews:9, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'colson1', name:'VDM10 2.0 Video-Türsprechanlage | 1 Klingeltaster | Colson', price:594.15, uvp:699, ab:true, rating:4.5, reviews:65, badge:SALE, sw:'7016 9016 9007 703 9005 es ltb wf' },
    { id:'dominik1', name:'XDM10 Video-Türsprechanlage mit austauschbarem Namensschild | 2-Draht-BUS | 1 Klingeltaster | Maxior', price:764.15, uvp:899, ab:true, rating:4.5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 wf', awards:['reddot','gda-medaille'] },
    { id:'horizon', name:'VDM10 2.0 modulare Video-Türsprechanlage | Ein- und Mehrfamilien | Horizon', price:849.15, uvp:999, ab:true, rating:5, reviews:25, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'sdm10h', name:'Türsprechanlage mit Kamera | Gesichtserkennung | Touch-Display | Hausnummer beleuchtet | Live-HD-Video | Ein- und Mehrfamilien | SDM10H', price:1351.5, uvp:1590, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 es wf' },
    { id:'kian1', name:'VDM10 2.0 Video-Türsprechanlage | 1 Klingeltaster | Kian', price:577.15, uvp:679, ab:true, rating:4.5, reviews:22, badge:SALE, sw:'7016 9016 9007 703 9005 es ltb bs bz wf' },
    { id:'niko1', name:'VDM10 2.0 Video-Türsprechanlage | mit Fingerprint | 1 Klingeltaster | Niko', price:721.65, uvp:849, ab:true, rating:5, reviews:12, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'neo1', name:'VDM10 2.0 Video-Türsprechanlage mit austauschbarem Namensschild | 1 Klingeltaster | Neo', price:551.65, uvp:649, ab:true, rating:5, reviews:4, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'sdm10s', name:'Video-Türsprechsäule | Klingelstele mit Gesichtserkennung | Farbe wählbar | Ein- & Mehrfamilienhaus | Personalisierbar | SDM10S', price:2209.15, uvp:2599, rating:null, reviews:null, badge:SALE, sw:'' },
    { id:'domaudio1', name:'ADM10 Audio-Türsprechanlage | 1 Klingeltaster | RAL 7016 Anthrazit | Dominik', price:424.15, uvp:499, rating:5, reviews:2, badge:SALE, sw:'' },
    { id:'colson2', name:'VDM10 2.0 Mehrfamilien Video-Türsprechanlage | 2 Klingeltaster | Colson', price:645.15, uvp:759, ab:true, rating:5, reviews:27, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'kai1', name:'ADM10 Audio-Türsprechanlage | 1 Klingeltaster | Mit austauschbarem Namensschild | Kai', price:424.15, uvp:499, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'kian2', name:'VDM10 2.0 Mehrfamilien Video-Türsprechanlage | 2 Klingeltaster | Kian', price:628.15, uvp:739, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es ltb bs bz wf' },
    { id:'niko2', name:'VDM10 2.0 Video-Türsprechanlage | mit Fingerprint | 2 Klingeltaster | Niko', price:849.15, uvp:999, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'neo2', name:'VDM10 2.0 Video-Türsprechanlage mit austauschbarem Namensschild | 2 Klingeltaster | Neo', price:577.15, uvp:679, ab:true, rating:5, reviews:6, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'kai2', name:'ADM10 Audio-Türsprechanlage | 2 Klingeltaster | Mit austauschbarem Namensschild | Kai', price:466.65, uvp:549, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'maxior2', name:'XDM10 Video-Türsprechanlage mit austauschbarem Namensschild | 2-Draht-BUS | 2 Klingeltaster | Maxior', price:806.65, uvp:949, ab:true, rating:5, reviews:1, badge:SALE, sw:'7016 9016 9007 703 9005 es wf', awards:['reddot','gda-medaille'] },
    { id:'colson3', name:'VDM10 2.0 Mehrfamilien Video-Türsprechanlage | 3 Klingeltaster | Colson', price:696.15, uvp:819, ab:true, rating:5, reviews:5, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'kian3', name:'VDM10 2.0 Mehrfamilien Video-Türsprechanlage | 3 Klingeltaster | Kian', price:679.15, uvp:799, ab:true, rating:4.5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es ltb bs bz wf' },
    { id:'niko3', name:'VDM10 2.0 Video-Türsprechanlage | mit Fingerprint | 3 Klingeltaster | Niko', price:892.5, uvp:1050, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'neo3', name:'VDM10 2.0 Video-Türsprechanlage mit austauschbarem Namensschild | 3 Klingeltaster | Neo', price:602.65, uvp:709, ab:true, rating:4.5, reviews:5, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'kai3', name:'ADM10 Audio-Türsprechanlage | 3 Klingeltaster | Mit austauschbarem Namensschild | Kai', price:509.15, uvp:599, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'maxior3', name:'XDM10 Video-Türsprechanlage mit austauschbarem Namensschild | 2-Draht-BUS | 3 Klingeltaster | Maxior', price:849.15, uvp:999, ab:true, rating:5, reviews:1, badge:SALE, sw:'7016 9016 9007 703 9005 wf', awards:['reddot','gda-medaille'] },
    { id:'colson4', name:'VDM10 2.0 Mehrfamilien Video-Türsprechanlage | 4 Klingeltaster | Colson', price:798.15, uvp:939, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es' },
    { id:'neo4', name:'VDM10 2.0 Video-Türsprechanlage mit austauschbarem Namensschild | 4 Klingeltaster | Neo', price:636.65, uvp:749, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'kai4', name:'ADM10 Audio-Türsprechanlage | 4 Klingeltaster | Mit austauschbarem Namensschild | Kai', price:551.65, uvp:649, ab:true, rating:5, reviews:3, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'colson5', name:'VDM10 2.0 Mehrfamilien Video-Türsprechanlage | 5 Klingeltaster | Colson', price:849.15, uvp:999, rating:5, reviews:1, badge:SALE, sw:'7016 9016 9007 703 9005 es' },
    { id:'neo5', name:'VDM10 2.0 Video-Türsprechanlage mit austauschbarem Namensschild | 5 Klingeltaster | Neo', price:662.15, uvp:779, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'kai5', name:'ADM10 Audio-Türsprechanlage | 5 Klingeltaster | Mit austauschbarem Namensschild | Kai', price:594.15, uvp:699, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'colson6', name:'VDM10 2.0 Mehrfamilien Video-Türsprechanlage | 6 Klingeltaster | Colson', price:900.15, uvp:1059, rating:5, reviews:1, badge:SALE, sw:'7016 9016 9007 703 9005 es' },
    { id:'neo6', name:'VDM10 2.0 Video-Türsprechanlage mit austauschbarem Namensschild | 6 Klingeltaster | Neo', price:679.15, uvp:799, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'kai6', name:'ADM10 Audio-Türsprechanlage | 6 Klingeltaster | Mit austauschbarem Namensschild | Kai', price:636.65, uvp:749, ab:true, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'colson7', name:'VDM10 2.0 Mehrfamilien Video-Türsprechanlage | 7 Klingeltaster | Colson', price:951.15, uvp:1119, rating:5, reviews:1, badge:SALE, sw:'7016 9016 9007 703 9005 es' },
    { id:'vdm10-bk1', name:'Briefkasten mit VDM10 2.0 Video-Türsprechanlage | 1 Klingel | RAL7016 Anthrazit', price:934.15, uvp:1099, rating:5, reviews:1, badge:SALE, sw:'' },
    { id:'bispo2-lan', name:'Video-Türsprechanlage mit Paketbox Bispo 2 | LAN/PoE | mit Brieffach | personalisiert mit Gravur | Anthrazit RAL 7016', price:1189.15, uvp:1399, rating:null, reviews:null, badge:SALE, sw:'' },
    { id:'zivo2-bus', name:'Video-Türsprechanlage mit Paketbox Zivo 2 | 2-Draht-BUS | mit Brieffach | personalisiert mit Gravur | Entnahme auf der Rückseite | Anthrazit RAL 7016', price:1189.15, uvp:1399, rating:5, reviews:1, badge:SALE, sw:'' },
    { id:'zivo2-lan', name:'Video-Türsprechanlage mit Paketbox Zivo 2 | LAN/PoE | mit Brieffach | personalisiert mit Gravur | Entnahme auf der Rückseite | Anthrazit RAL 7016', price:1189.15, uvp:1399, rating:null, reviews:null, badge:SALE, sw:'' },
    { id:'vdm10-pb', name:'Video-Türsprechanlage mit Paketbox | Anthrazit RAL 7016 | personalisiert mit Gravur | Edelstahl-Namensschild', price:1019.15, uvp:1199, rating:5, reviews:1, badge:SALE, sw:'' },
    { id:'siebert-vdm10', name:'Briefkasten rostfrei und massiv, RAL7016 Anthrazitgrau mit Videosprechanlage VDM10 2.0, Modell Siebert', price:764.15, uvp:899, rating:4.5, reviews:3, badge:SALE, sw:'' },
    { id:'siebert-vdm10-stand', name:'Standbriefkasten rostfrei und massiv, RAL7016 Anthrazitgrau mit Videosprechanlage VDM10 2.0, Modell Siebert', price:900.15, uvp:1059, rating:5, reviews:1, badge:SALE, sw:'' },
    { id:'vdm10-siebert-set', name:'Videosprechanlage VDM10 2.0 in RAL7016 Anthrazit passend als Set mit dem Briefkasten Modell Siebert', price:679.15, uvp:799, rating:5, reviews:1, badge:SALE, sw:'' }
  ];

  /* Shop data (vergleich-daten.js, generated from the JTL export 02.11.2026 by tools/build_vergleich_daten.py):
     every card takes its main image (hotlinked shop image, local photo as offline fallback), colours, System,
     Klingeltaster, Türöffner-Bedienung, Typ, Kombination, Material, Namensschild and the raw filter values
     from the shop — the same values the comparison shows. Name, price, UVP, rating and reviews stay as
     listed on the live category page. */
  function fallbackImg(p) {
    if (p.type === 'audio') return SP + 'audio-station.png';
    if (p.briefkasten) return SP + 'briefkasten-paketbox.png';
    if (((p.f && p.f.ns) || []).indexOf('Digital') !== -1) return SP + 'touch-display-station.png';
    return IMG;
  }
  (function () {
    var D = window.MTZ_VGL_DATA && window.MTZ_VGL_DATA.sprechanlage;
    PRODUCTS.forEach(function (p) {
      p.colors = []; p.tuer = []; p.f = {};
      var d = D && D[p.id], c = d && d.card;
      if (c) {
        p.colors = c.colors.slice(); p.tuer = c.tuer.slice(); p.briefkasten = c.briefkasten; p.f = c.f || {};
        if (c.system) { p.system = c.system; p.line = c.system === 'bus' ? 'BUS-System' : 'IP-System'; }
        if (c.klingel) p.klingel = c.klingel;
        if (c.type) p.type = c.type;
        p.material = c.material; p.ns = c.ns;
      }
      p.img = fallbackImg(p);            /* local photo — offline fallback (card + comparison) */
      p.shopImg = (d && d.img) || null;  /* real shop main image, hotlinked */
    });
  })();

  /* Expose the catalogue to the Vergleichen add-on (vergleichen.js) — read-only hook. */
  try { window.MTZ_PRODUCTS = PRODUCTS; } catch (e) {}

  /* Hotlinked shop images fall back to the local photo when offline / blocked. */
  document.addEventListener('error', function (e) {
    var t = e.target, fb = t && t.tagName === 'IMG' && t.getAttribute('data-fallback');
    if (fb && t.getAttribute('src') !== fb) t.setAttribute('src', fb);
  }, true);

  var TOTAL = 41; // live headline figure („41 Artikel") — equals PRODUCTS.length

  /* ---- State ---- */
  var active = { color: [], fa: [], kt: [], mo: [], tb: [], zf: [], ns: [], pb: [], sys: [], bt: [],
                 system: [], klingel: [], tuer: [], material: [], type: [], verwendung: [], namensschild: [], kombi: [] };   /* 2nd row: inactive inline advisor only */
  var page = 1;
  var advisorChips = false;   /* true while the active filters were set by the KI advisor → don't echo them as toolbar chips */

  /* ---- Helpers ---- */
  function $(s, ctx) { return (ctx || document).querySelector(s); }
  function euro(n) { return n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+,)/g, '.') + ' €'; }   /* 1.490,00 € as on the live card */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* Live rating: full / half / empty stars (e.g. 4.5/5); no rating → no stars (as on the live card) */
  function stars(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) html += '<span class="star' + (rating >= i ? ' is-full' : (rating >= i - 0.5 ? ' is-half' : '')) + '">★</span>';
    return '<span class="pcard__stars" aria-label="' + String(rating).replace('.', ',') + ' von 5 Sternen">' + html + '</span>';
  }

  /* Colour bubbles of the live card: first 3, then „+N weitere"; none when the shop shows none */
  function colorRow(sw) {
    var keys = (sw || '').split(' ').filter(function (k) { return SW[k]; });
    if (!keys.length) return '';
    var max = 3, html = '';
    keys.slice(0, max).forEach(function (k) {
      html += '<span class="pcard__sw" title="' + SW[k].label + '" style="background:' + SW[k].css + '"></span>';
    });
    if (keys.length > max) html += '<a class="pcard__more" href="#">+' + (keys.length - max) + ' weitere</a>';
    return '<div class="pcard__colors">' + html + '</div>';
  }

  /* ---- Build subcategory rail (live tiles → live subcategory pages, new tab) ---- */
  function buildSubnav() {
    var track = $('#subTrack'); if (!track) return;
    SUBCATS.forEach(function (s) {
      var a = el('a', 'subtile' + (s.cta ? ' subtile--cta' : ''));
      a.href = s.href || '#grid';
      if (s.href) { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML =
        '<span class="subtile__thumb"><img src="' + (s.img || s.fb || IMG) + '" data-fallback="' + (s.fb || IMG) + '" alt="" loading="lazy"></span>' +
        '<span class="subtile__text">' +
          '<span class="subtile__label">' + s.t + '</span>' +
          (s.n != null
            ? '<span class="subtile__count">' + s.n + ' Modelle</span>'
            : (s.cta ? '<span class="subtile__count subtile__count--cta">Jetzt konfigurieren</span>' : '')) +
        '</span>';
      track.appendChild(a);
    });
  }

  /* ---- Build filter controls (checkbox rows — matches the live website) ---- */
  function fid(group, key) { return 'f-' + group + '-' + String(key).replace(/[^\w-]/g, '_'); }
  function countText(group, n) {
    var g = FACETS[group];
    if (g && g.noCount) return '';
    return (g && g.plain) ? String(n) : '(' + n + ')';
  }
  function optionRow(group, key, label, count, swatchCss) {
    var id = fid(group, key);
    var row = el('label', 'fopt');
    row.setAttribute('for', id);
    row.innerHTML =
      '<input type="checkbox" id="' + id + '" data-group="' + group + '" data-key="' + key + '">' +
      '<span class="fopt__box" aria-hidden="true"></span>' +
      '<span class="fopt__label">' + label + '</span>' +
      '<span class="fopt__count">' + countText(group, count) + '</span>' +
      (swatchCss ? '<span class="fopt__swatch" style="background:' + swatchCss + '"></span>' : '');
    row.querySelector('input').addEventListener('change', function () { toggle(group, key); });
    return row;
  }

  function buildColorGroup() {
    var wrap = $('#facet-color'); if (!wrap) return;
    Object.keys(COLORS).forEach(function (key) {
      var c = COLORS[key];
      wrap.appendChild(optionRow('color', key, c.label, c.count, c.css));
    });
  }

  function buildFacetGroup(group) {
    var wrap = $('#facet-' + group); if (!wrap) return;
    FACETS[group].items.forEach(function (it) {
      wrap.appendChild(optionRow(group, it.key, it.label, it.count, null));
    });
  }

  /* Sidebar: one .facet block per live group, in live order (markup generated here so it can't drift) */
  function buildFacets() {
    var aside = $('#filters'); if (!aside) return;
    FACET_ORDER.forEach(function (group) {
      var box = el('div', 'facet');
      box.innerHTML = '<h3 class="facet__title">' + (group === 'color' ? 'Farbe' : FACETS[group].title) + '</h3>' +
        '<div class="facet__body" id="facet-' + group + '" data-group="' + group + '"></div>';
      aside.appendChild(box);
      if (group === 'color') buildColorGroup(); else buildFacetGroup(group);
    });
  }

  /* ---- Toggle a filter value ---- */
  function toggle(group, key) {
    advisorChips = false;   /* user is now filtering manually → toolbar chips return */
    var arr = active[group];
    var i = arr.indexOf(key);
    if (i === -1) arr.push(key); else arr.splice(i, 1);
    page = 1;
    updateFacets(group);
    syncControls();
    render();
  }

  function clearAll() {
    advisorChips = false;
    Object.keys(active).forEach(function (g) { active[g] = []; });
    page = 1;
    updateFacets();
    syncControls();
    render();
  }

  /* Reflect state onto controls (checkbox rows) */
  function syncControls() {
    document.querySelectorAll('.fopt input').forEach(function (cb) {
      cb.checked = active[cb.getAttribute('data-group')].indexOf(cb.getAttribute('data-key')) !== -1;
    });
  }

  /* ---- Filtering ----
     matchesWith(p, a) tests a product against an arbitrary active-selection
     object; matches(p) uses the live one. The indirection lets the facet engine
     compute per-option counts by overriding a single group. Sidebar groups match the
     raw shop value (p.f[group]) exactly like the live filter; OR within a group,
     AND across groups. The second block serves the inactive inline advisor only. */
  function matchesWith(p, a) {
    if (a.color.length && !a.color.some(function (c) { return p.colors.indexOf(c) !== -1; })) return false;
    for (var gi = 0; gi < FACET_ORDER.length; gi++) {
      var g = FACET_ORDER[gi], sel = a[g];
      if (g === 'color' || !sel || !sel.length) continue;
      var vals = (p.f && p.f[g]) || [];
      if (!sel.some(function (k) { return vals.indexOf(k) !== -1; })) return false;
    }
    /* — inactive inline advisor (legacy keys) — */
    if (a.system && a.system.length && a.system.indexOf(p.system) === -1) return false;
    if (a.klingel && a.klingel.length && a.klingel.indexOf(p.klingel) === -1 && p.klingel !== 'flex') return false;
    if (a.tuer && a.tuer.length && !a.tuer.some(function (k) { return (p.tuer || []).indexOf(k) !== -1; })) return false;
    if (a.type && a.type.length && a.type.indexOf(p.type) === -1) return false;
    if (a.material && a.material.length && a.material.indexOf(p.material) === -1) return false;
    if (a.verwendung && a.verwendung.length && a.verwendung.indexOf(verwOf(p)) === -1 && verwOf(p) !== 'flexibel') return false;
    if (a.namensschild && a.namensschild.length && a.namensschild.indexOf(nsOf(p)) === -1) return false;
    if (a.kombi && a.kombi.length && !a.kombi.some(function (k) { return k === 'briefkasten' && !!p.briefkasten; })) return false;
    return true;
  }
  function matches(p) { return matchesWith(p, active); }

  /* ---- Dynamic facets ------------------------------------------------------
     When at least one filter is selected, every facet recomputes against the
     current selection: each option shows the real number of matching products
     and options with none are hidden (e.g. picking BUS-System leaves only the
     colours / Klingeltaster the 2-Draht line actually offers). With no filter active the curated
     "live-mirror" counts are restored and all options shown. */
  var FACET_GROUPS = FACET_ORDER;
  function facetKeys(group) {
    return group === 'color' ? Object.keys(COLORS) : FACETS[group].items.map(function (it) { return it.key; });
  }
  function curatedCount(group, key) {
    if (group === 'color') return (COLORS[key] && COLORS[key].count) || 0;
    var items = (FACETS[group] && FACETS[group].items) || [];
    for (var i = 0; i < items.length; i++) if (items[i].key === key) return items[i].count;
    return 0;
  }
  /* How many products match if this single option were the only choice in its
     group (the group's own current selection is ignored — standard facet count). */
  function optionCount(group, value) {
    var a = {};
    Object.keys(active).forEach(function (g) { a[g] = (g === group) ? [value] : active[g]; });
    return PRODUCTS.filter(function (p) { return matchesWith(p, a); }).length;
  }
  function setFacetRow(group, key, n, hide) {
    var input = document.getElementById(fid(group, key));
    var row = input && input.closest('.fopt');
    if (!row) return;
    var cnt = row.querySelector('.fopt__count');
    if (cnt) cnt.textContent = group === 'color' ? '(' + n + ')' : countText(group, n);
    row.hidden = hide;
  }
  /* Drop selections that became impossible in combination with the others.
     keepGroup is the group the user just touched — its choice wins, so conflicts
     are resolved by dropping the incompatible values from the OTHER groups. */
  function pruneActive(keepGroup) {
    for (var pass = 0; pass < 6; pass++) {
      var changed = false;
      FACET_GROUPS.forEach(function (group) {
        if (group === keepGroup) return;
        active[group].slice().forEach(function (key) {
          if (optionCount(group, key) === 0) {
            var i = active[group].indexOf(key);
            if (i !== -1) { active[group].splice(i, 1); changed = true; }
          }
        });
      });
      if (!changed) break;
    }
  }
  function facetContainer(group) {
    var body = document.getElementById('facet-' + group);
    return body ? body.closest('.facet') : null;
  }
  function refreshFacetDisplay() {
    var dynamic = activeCount() > 0;
    FACET_GROUPS.forEach(function (group) {
      var hasMatch = false, anySelected = false;
      facetKeys(group).forEach(function (key) {
        var selected = active[group].indexOf(key) !== -1;
        if (selected) anySelected = true;
        var n = optionCount(group, key);
        if (n > 0) hasMatch = true;
        if (!dynamic) { setFacetRow(group, key, curatedCount(group, key), false); return; }
        setFacetRow(group, key, n, n === 0 && !selected);
      });
      /* As on the live page, a group stays visible while at least one of its options
         still has matches (even a single one); a group with none left is hidden —
         unless the user has a pick there, so they can still see/clear it. */
      var box = facetContainer(group);
      if (box) box.hidden = (dynamic && !hasMatch && !anySelected);
    });
  }
  /* User-driven refresh (sidebar toggle / clear): prune impossible picks first.
     keepGroup (the just-toggled group) is preserved during conflict resolution. */
  function updateFacets(keepGroup) {
    if (activeCount() > 0) pruneActive(keepGroup);
    refreshFacetDisplay();
  }

  /* Derived advisor attributes (computed from existing data — no per-product field needed) */
  function verwOf(p) { return p.klingel === 'flex' ? 'flexibel' : (p.klingel === '1' ? 'einfamilien' : 'mehrfamilien'); }
  function nsOf(p) {
    if (p.ns) return p.ns === 'display' && /Hausnummer|Türsprechsäule|Klingelstele/i.test(p.name) ? 'display-hn' : p.ns;   /* Shop-Merkmal „Namensschild" */
    if (/austauschbar/i.test(p.name)) return 'wechsel';
    if (p.type === 'audio') return 'fest';   /* Audio (ADM10) hat keine Laser-Gravur-Option — fester Namensschild (Kai ist oben schon als wechsel erfasst) */
    if (/Hausnummer|Türsprechsäule|Klingelstele/i.test(p.name)) return 'display-hn';   /* Display-Modelle mit beleuchteter Hausnummer (SDM10H, SDM10S-Säule) */
    if (/SDM10|Touch-Display|Display/i.test(p.name)) return 'display';
    return 'gravur';
  }

  function activeCount() {
    return Object.keys(active).reduce(function (n, g) { return n + active[g].length; }, 0);
  }

  /* ---- Product card (data as on the live card: pills = awards, System, Türöffner-Bedienung;
         badge, Metzler, stars + review count, name, „ab" only where the shop shows it, current
         price + struck UVP, colour bubbles) ---- */
  var AWARD_LABEL = { reddot: 'Reddot Winner 2026', 'gda-medaille': 'German Design Award 2026' };
  function card(p) {
    var c = el('article', 'pcard');
    c.dataset.id = p.id;   /* hook for the Vergleichen add-on (vergleichen.js) */
    var badge = p.badge ? '<span class="pcard__badge pcard__badge--' + p.badge.type + '">' + p.badge.text + '</span>' : '';
    var priceRow = (p.price != null)
      ? '<div class="pcard__pricerow">' +
          (p.uvp ? '<span class="pcard__uvp">' + euro(p.uvp) + '</span>' : '') +
          (p.ab ? '<span class="pcard__ab">ab</span> ' : '') +
          '<span class="pcard__price' + (p.uvp ? ' pcard__price--sale' : '') + '">' + euro(p.price) + '</span>' +
        '</div>'
      : '';
    var rating = p.rating ? '<span class="pcard__rating">' + stars(p.rating) + (p.reviews ? '<span class="pcard__reviews">(' + p.reviews + ')</span>' : '') + '</span>' : '';
    /* Award pills as on the live card (text-only per PILL RULE — the former image lockup was tuned
       to a placeholder photo and would cover the real product image) */
    var awards = (p.awards || []).map(function (a) { return AWARD_LABEL[a] ? '<span class="pcard__feat">' + AWARD_LABEL[a] + '</span>' : ''; }).join('');
    var sys = p.line ? '<span class="pcard__sys">' + p.line + '</span>' : '';   /* IP-System / BUS-System tag */
    var feat = ((p.f && p.f.tb) || []).map(function (k) { return '<span class="pcard__feat">' + k + '</span>'; }).join('');   /* Türöffner-Bedienung (Shop-Merkmal, live pill text) */
    var tags = (awards || sys || feat)
      ? '<div class="pcard__tags">' + awards + sys + feat + '</div>'
      : '';

    c.innerHTML =
      '<div class="pcard__media">' +
        badge +
        '<img class="pcard__img" src="' + (p.shopImg || p.img || IMG) + '" data-fallback="' + (p.img || IMG) + '" alt="' + p.name + '" loading="lazy">' +
      '</div>' +
      '<div class="pcard__body">' +
        tags +
        '<div class="pcard__top">' +
          '<span class="pcard__brand">Metzler</span>' +
          rating +
        '</div>' +
        '<h3 class="pcard__title"><a href="#">' + p.name + '</a></h3>' +
        '<div class="pcard__footer">' +
          priceRow +
          colorRow(p.sw) +
        '</div>' +
      '</div>';
    return c;
  }
  window.MTZ_PLP_CARD = card;   /* read-only hook: the comparison's "Ähnliche Modelle" render the same card (12.11.) */

  /* ---- In-grid promo banner — compact version of the Home XDM10 hero
         (reuses .hero-banner from Home/styles-v2.css; .hero-banner--inline
         shrinks it). Spans the full grid width so it aligns with the cards. ---- */
  function bannerEl() {
    var b = el('div', 'pgrid__banner');
    b.innerHTML =
      '<section class="hero-banner hero-banner--inline" aria-label="XDM10 Video-Türsprechanlage">' +
        '<div class="hero-banner__copy">' +
          '<h2 class="hero-banner__title">Video-Türsprechanlage zur Nachrüstung – ohne neue Kabel</h2>' +
          '<div class="hero-banner__chips">' +
            '<span class="hero-chip"><span class="hero-chip__pre">POWERED BY</span><span class="hero-chip__hikvision">HIK<span>VISION</span></span></span>' +
            '<span class="hero-chip"><span class="hero-chip__pre">DESIGNED IN GERMANY</span>' +
              '<svg class="hero-chip__flag" viewBox="0 0 18 12" aria-hidden="true"><rect width="18" height="4" y="0" fill="#000"/><rect width="18" height="4" y="4" fill="#DD0000"/><rect width="18" height="4" y="8" fill="#FFCE00"/></svg>' +
            '</span>' +
          '</div>' +
          '<p class="hero-banner__body">Die XDM10 nutzt die vorhandene Verkabelung und verwandelt alte Klingel- und Sprechanlagen ohne neue Kabel in ein modernes System mit App-Anbindung.</p>' +
          '<div class="hero-banner__ctas">' +
            '<a class="btn btn--primary hero-banner__cta" href="#">Jetzt konfigurieren</a>' +
            '<a class="btn hero-banner__cta hero-banner__cta--secondary" href="#">Mehr erfahren</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-banner__stage" aria-hidden="true">' +
          '<div class="hero-banner__device">' +
            '<img class="hero-banner__poster" src="Home/XDM10%20Banner/Photo.png" alt="">' +
            '<img class="hero-banner__award" src="Badge/reddot-award-lockup.svg" alt="Red Dot Award Winner 2026">' +
          '</div>' +
        '</div>' +
      '</section>';
    return b;
  }

  /* ---- Active filter chips ---- */
  function renderChips() {
    var wrap = $('#activeChips'); wrap.innerHTML = '';
    if (advisorChips) { $('#clearAll').hidden = true; return; }   /* KI-applied filters live in the advisor card, not the toolbar */
    var n = activeCount();
    Object.keys(active).forEach(function (g) {
      active[g].forEach(function (key) {
        var chip = el('button', 'chip');
        chip.type = 'button';
        chip.innerHTML = (LABELS[g + ':' + key] || key) + ' <svg><use href="#i-x"/></svg>';
        chip.addEventListener('click', function () { toggle(g, key); });
        wrap.appendChild(chip);
      });
    });
    $('#clearAll').hidden = n === 0;
  }

  /* ---- Main render ---- */
  function render() {
    var grid = $('#productGrid');
    var filtered = PRODUCTS.filter(matches);
    var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
    if (page > totalPages) page = totalPages;

    grid.innerHTML = '';
    var start = (page - 1) * PAGE;
    var pageItems2 = filtered.slice(start, start + PAGE);
    // On page 1 (unfiltered), drop the XDM10 hero banner into the grid as on the live
    // page: after the first row on desktop (3 cards), after two rows on mobile (4 cards).
    var cols = (getComputedStyle(grid).gridTemplateColumns || '').split(' ').filter(Boolean).length;
    if (!(cols > 0 && cols < 7)) cols = 3;
    var bannerN = cols >= 3 ? cols : cols * 2;
    var bannerAt = (page === 1 && activeCount() === 0 && pageItems2.length > bannerN) ? bannerN : -1;
    pageItems2.forEach(function (p, i) {
      if (i === bannerAt) grid.appendChild(bannerEl());
      grid.appendChild(card(p));
    });

    // Count + empty state
    var displayTotal = activeCount() === 0 ? TOTAL : filtered.length;
    $('#resultCount').textContent = displayTotal + ' Artikel';
    $('#emptyState').hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;

    renderPagination(totalPages);
    renderChips();

    /* Scroll affordance for the feature-pill row: an edge fade that appears on
       whichever side has more pills. Toggle the state classes the fade mask keys off. */
    [].forEach.call(grid.querySelectorAll('.pcard__tags'), function (t) {
      var upd = function () {
        var max = t.scrollWidth - t.clientWidth, on = max > 1;
        t.classList.toggle('is-scroll', on);
        t.classList.toggle('at-start', !on || t.scrollLeft <= 1);
        t.classList.toggle('at-end', !on || t.scrollLeft >= max - 1);
      };
      upd();
      t.addEventListener('scroll', upd, { passive: true });
      /* Re-evaluate when the row's box changes (viewport/card resize) and once web
         fonts finish loading — pills measured before the font swap are wider, which
         would otherwise leave a stale fade on a row that actually fits. */
      if (window.ResizeObserver) new ResizeObserver(upd).observe(t);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(upd);
    });
  }

  /* ---- Pagination (live-style numbered pages + arrows) ---- */
  function goTo(p) {
    page = p;
    render();
    var top = $('#grid').getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function pageItems(total) {
    var items = [];
    if (total <= 7) { for (var i = 1; i <= total; i++) items.push(i); return items; }
    items.push(1);
    var s = Math.max(2, page - 1), e = Math.min(total - 1, page + 1);
    if (s > 2) items.push('…');
    for (var j = s; j <= e; j++) items.push(j);
    if (e < total - 1) items.push('…');
    items.push(total);
    return items;
  }

  function pgArrow(rel) {
    var b = el('button', 'pg-arrow pg-arrow--' + rel);
    b.type = 'button';
    b.setAttribute('aria-label', rel === 'next' ? 'Nächste Seite' : 'Vorherige Seite');
    b.innerHTML = '<svg><use href="#i-chevron-right"/></svg>';
    b.addEventListener('click', function () { goTo(rel === 'next' ? page + 1 : page - 1); });
    return b;
  }

  function renderPagination(totalPages) {
    var nav = $('#pagination'); nav.innerHTML = '';
    if (totalPages <= 1) { nav.hidden = true; return; }
    nav.hidden = false;

    if (page > 1) nav.appendChild(pgArrow('prev'));

    pageItems(totalPages).forEach(function (it) {
      if (it === '…') { nav.appendChild(el('span', 'pg-btn pg-btn--more', '…')); return; }
      var b = el('button', 'pg-btn' + (it === page ? ' is-active' : ''), String(it));
      b.type = 'button';
      if (it === page) b.setAttribute('aria-current', 'page');
      else b.addEventListener('click', function () { goTo(it); });
      nav.appendChild(b);
    });

    if (page < totalPages) nav.appendChild(pgArrow('next'));
  }

  /* ---- Mobile filter drawer ---- */
  function wireDrawer() {
    var panel = $('#filters'), backdrop = $('#filtersBackdrop');
    function open() { panel.classList.add('is-open'); backdrop.hidden = false; document.body.style.overflow = 'hidden'; }
    function close() { panel.classList.remove('is-open'); backdrop.hidden = true; document.body.style.overflow = ''; }
    $('#openFilters').addEventListener('click', open);
    $('#closeFilters').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---- Subcategory rail — seamless circular carousel ---- */
  function wireSubnav() {
    var track = $('#subTrack'); if (!track) return;
    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;

    /* The prev arrow is hidden (CSS) until the user first advances the rail.
       Any forward move — arrow click or manual scroll — reveals it for good. */
    var subnav = track.closest('.subnav');
    function engage() { if (subnav) subnav.classList.add('is-engaged'); }

    /* Clone one full set after the originals so the rail can wrap continuously.
       Clones are decorative duplicates — hidden from AT and the tab order. */
    originals.forEach(function (node) {
      var c = node.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('tabindex', '-1');
      track.appendChild(c);
    });
    var firstClone = track.children[originals.length];
    /* exact width of one set (tiles + gaps), so the seam reset is pixel-perfect */
    function loopW() { return firstClone.offsetLeft - track.children[0].offsetLeft; }

    /* When the scroll passes the seam, shift by exactly one set — invisible
       because the duplicate cards line up identically. */
    function normalize() {
      var w = loopW();
      if (track.scrollLeft >= w) track.scrollLeft -= w;
      else if (track.scrollLeft < 0) track.scrollLeft += w;
    }
    var settle;
    track.addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(normalize, 90);   /* reset only once motion settles → no mid-scroll jump */
    }, { passive: true });

    document.querySelectorAll('[data-sub-scroll]').forEach(function (b) {
      b.addEventListener('click', function () {
        engage();                             /* first arrow click reveals the prev arrow */
        var dir = b.getAttribute('data-sub-scroll') === 'next' ? 1 : -1;
        var w = loopW();
        var first = track.children[0];
        /* Advance exactly ONE tile per click so the movement is small, predictable
           and easy to follow (paging several tiles at once read as a confusing jump). */
        var pitch = track.children[1].offsetLeft - first.offsetLeft;   /* tile width + gap */
        var tilesPerStep = 1;
        /* Land each tile at the snap inset so it clears the prev arrow / edge fade.
           Read the actual scroll-padding so this adapts to the breakpoint (≈46px on
           phones, 0 on desktop). */
        var inset = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
        /* pre-shift into the duplicate so there's always identical content to scroll into */
        if (dir === 1 && track.scrollLeft >= w) track.scrollLeft -= w;
        else if (dir === -1 && track.scrollLeft < pitch) track.scrollLeft += w;
        var curN = Math.round((track.scrollLeft - first.offsetLeft + inset) / pitch);
        var target = first.offsetLeft + (curN + dir * tilesPerStep) * pitch - inset;
        target = Math.max(0, Math.min(target, track.scrollWidth - track.clientWidth));
        /* Smooth so the one-tile move is followable. The target is a tile-aligned
           snap position, so snap can't pull it elsewhere. */
        track.scrollTo({ left: target, behavior: 'smooth' });
      });
    });
  }

  /* ---- Footer accordions: collapsed on mobile, expanded on tablet+ ---- */
  function wireFooterAccordions() {
    var details = document.querySelectorAll('.footer__details');
    if (!details.length) return;
    var mobileMq = window.matchMedia('(max-width: 640px)');
    function sync() {
      details.forEach(function (el) {
        if (mobileMq.matches) el.removeAttribute('open');
        else el.setAttribute('open', '');
      });
    }
    sync();
    mobileMq.addEventListener ? mobileMq.addEventListener('change', sync) : mobileMq.addListener(sync);
  }

  /* ---- KI-Kaufberater: a guided recommendation quiz. Each answer maps to a
         catalogue facet; the final step "thinks", applies the combined filters
         to narrow the grid, and summarises the recommendation. ---- */
  function wireAiAdvisor() {
    var root = document.querySelector('[data-ai]');
    if (!root) return;
    var quizEl  = root.querySelector('[data-ai-quiz]');
    var results = root.querySelector('[data-ai-results]');
    if (!quizEl) return;
    var thinkTimer;

    /* Needs-based questions (not a mirror of the manual filters). Each option maps to a
       catalogue attribute the recommendation engine reads:
         group color/colorset/material/faecher/zeitung/montage/zusatz → filters + ranks
         group 'pref' → noted preference (Beschriftung), not filtered
         neutral:true → "no preference" (adds no filter). Steps are skippable. */
    /* Needs-based quiz for Türsprechanlagen (7 steps). Each answer maps to a
       catalogue attribute the engine reads: verwendung / type / system / tuer /
       namensschild / kombi / color / colorset / material. neutral:true = "no
       preference". Step 4 (Zutrittsmethoden) is multi-select. */
    var QUIZ = [
      { q: 'Für welche Wohnsituation suchen Sie eine Sprechanlage?', opts: [
        { label: 'Einfamilienhaus',     sub: 'ein Haushalt, eine Klingeltaste', group: 'verwendung', value: 'einfamilien',  chip: 'Einfamilienhaus' },
        { label: 'Mehrfamilienhaus',    sub: 'mehrere Parteien & Klingeltasten', group: 'verwendung', value: 'mehrfamilien', chip: 'Mehrfamilienhaus' },
        { label: 'Flexible Großanlage', sub: 'flexibel von 1–500 Tasten',        group: 'verwendung', value: 'flexibel',     chip: 'Großanlage' }
      ]},
      /* Exakte Klingeltaster-Staffel (live: Colson 1–7, Kai 1–6, Maxior 1–3). Nur für
         Mehrfamilienhaus; flexible Großanlagen (klingel 'flex', 1–500) erfüllen jede
         Anzahl und bleiben immer im Pool — spätere Schritte blenden sich je nach
         gewählter Anzahl automatisch aus (BUS ab 4, Audio ab 7). */
      { q: 'Wie viele Klingeltaster benötigen Sie?', opts: [
        { label: '2 Taster', sub: 'für 2 Parteien', group: 'klingel', value: '2', chip: '2 Klingeltaster', hideWhen: gateHide },
        { label: '3 Taster', sub: 'für 3 Parteien', group: 'klingel', value: '3', chip: '3 Klingeltaster', hideWhen: gateHide },
        { label: '4 Taster', sub: 'für 4 Parteien', group: 'klingel', value: '4', chip: '4 Klingeltaster', hideWhen: gateHide },
        { label: '5 Taster', sub: 'für 5 Parteien', group: 'klingel', value: '5', chip: '5 Klingeltaster', hideWhen: gateHide },
        { label: '6 Taster', sub: 'für 6 Parteien', group: 'klingel', value: '6', chip: '6 Klingeltaster', hideWhen: gateHide },
        { label: '7 Taster', sub: 'für 7 Parteien', group: 'klingel', value: '7', chip: '7 Klingeltaster', hideWhen: gateHide }
      ]},
      /* Facet options are dataset-gated via gateHide (live-shop parity): e.g. no
         Audio-Großanlage exists → "Audio-only" vanishes for Flexibel and the step
         auto-skips; the BUS line stops at Video-Ein-/Mehrfamilien → "BUS-System"
         vanishes for Großanlagen & Audio. */
      { q: 'Möchten Sie sehen, wer vor der Tür steht?', opts: [
        { label: 'Mit Kamera (Video)', sub: 'Live-HD-Bild der Besucher', group: 'type', value: 'video', chip: 'Video', hideWhen: gateHide },
        { label: 'Audio-only',         sub: 'nur sprechen, ohne Kamera',  group: 'type', value: 'audio', chip: 'Audio', hideWhen: gateHide }
      ]},
      { q: 'Planen Sie einen Neubau oder eine Modernisierung?', opts: [
        { label: 'Neubau und Neuverkabelung', sub: 'Ideal für Neubauten – LAN- oder 2-Draht-Sternverkabelung · IP-System', group: 'system', value: 'ip',  chip: 'IP-System', hideWhen: gateHide },
        { label: 'Modernisierung und bestehende Verkabelung', sub: 'Perfekt zum Modernisieren – nutzt die vorhandene 2-Draht-Leitung · BUS-System', group: 'system', value: 'bus', chip: '2-Draht-BUS', hideWhen: gateHide },
        { label: 'Weiß ich nicht', sub: 'wir empfehlen passende Modelle für beide Systeme',             neutral: true, hideWhen: function () { var pool = poolBefore(stepOfOpt(this)); return !(pool.some(function (p) { return p.system === 'ip'; }) && pool.some(function (p) { return p.system === 'bus'; })); } }   /* nur zeigen, wenn wirklich beide Systeme möglich sind — sonst bleibt nur eine echte Option und der Schritt wird übersprungen */
      ]},
      /* Zutritt methods are gated per option: only the methods a product consistent
         with the answers so far actually carries are offered (Türöffner Bedienung is
         a multi-value attribute on the live shop — premium devices carry several). */
      { q: 'Wie möchten Sie Zutritt gewähren?', sub: 'Mehrfachauswahl möglich', opts: [
        { label: 'Fingerabdrucksensor', sub: 'schlüsselloser Zutritt',   group: 'tuer', value: 'fingerprint', chip: 'Fingerprint', hideWhen: tuerGate },
        { label: 'RFID-Chip',           sub: 'Transponder oder Karte',   group: 'tuer', value: 'rfid',        chip: 'RFID', hideWhen: tuerGate },
        { label: 'Gesichtserkennung',   sub: 'Tür öffnet beim Erkennen', group: 'tuer', value: 'gesicht',     chip: 'Gesichtserkennung', hideWhen: tuerGate },
        { label: 'PIN-Code',            sub: 'Zahlencode am Tastenfeld', group: 'tuer', value: 'pin',         chip: 'PIN-Code', hideWhen: tuerGate },
        { label: 'QR-Code',             sub: 'Zutritt per QR-Scan',      group: 'tuer', value: 'qr',          chip: 'QR-Code', hideWhen: tuerGate },
        { label: 'Keine Zutrittsfunktion', sub: 'nur klingeln und sprechen', neutral: true }
      ]},
      { q: 'Welches Namensschild bevorzugen Sie?', opts: [
        { label: 'Lasergraviertes Namensschild', sub: 'jederzeit wechselbar',  group: 'namensschild', value: 'gravur',  chip: 'Lasergravur', hideWhen: function () { return picked('verwendung', 'flexibel') || gateHide.call(this); } },   /* Ein-/Mehrfamilien: Laser-Namensgravur. Flexible Großanlagen sind display-basiert → hier ausgeblendet. */
        { label: 'Namensschild mit Papiereinleger', sub: 'jederzeit wechselbar', group: 'namensschild', value: 'wechsel', chip: 'Papiereinleger', hideWhen: gateHide },
        { label: 'Digitales Namensschild',    sub: 'editierbar',                group: 'namensschild', value: 'display', chip: 'Digitales Schild', hideWhen: gateHide },
        { label: 'Digitales Namensschild + Hausnummer', sub: 'editierbar, mit beleuchteter Hausnummer', group: 'namensschild', value: 'display-hn', chip: 'Digital + Hausnummer', hideWhen: gateHide },   /* Display-Modelle mit beleuchteter Hausnummer (SDM10H, SDM10S) — nur flexible Großanlage */
        { label: 'Egal',                      sub: 'keine Präferenz',           neutral: true }
      ]},
      { q: 'Soll die Anlage mit einem Briefkasten kombiniert sein?', opts: [
        { label: 'Nur Türstation',            sub: 'klassische Außenstation',          neutral: true },
        { label: 'Mit Briefkasten & Paketbox', sub: 'integrierte Brief-/Paketbox',     group: 'kombi', value: 'briefkasten', chip: 'Mit Briefkasten', hideWhen: gateHide }
      ]},
      { q: 'Welche Optik passt zu Ihrem Eingang?', opts: [
        { label: 'Klassische Farbe', sub: 'z. B. Anthrazit, Schwarz, Weiß oder Grau', group: 'colorset', values: ['anthrazit','braun','schwarz','eisenglimmer','weiss','grau'], chip: 'Klassische Farbe', swatch: 'linear-gradient(135deg,#1A171B,#383E42 38%,#B9BCC0 70%,#FFFFFF)', hideWhen: gateHide },
        { label: 'Edelstahl',        sub: 'rostfrei und zeitlos',                     group: 'material', value: 'edelstahl', chip: 'Edelstahl-Optik', swatch: 'linear-gradient(135deg,#e9ebee,#a7adb4 55%,#d6d9dd)', hideWhen: function () { return busChosen() || gateHide.call(this); } },   /* BUS-Serie (XDM10) hat keine Edelstahl-Optik */
        { label: 'Wunschfarbe',      sub: 'individuell nach RAL',                     group: 'color', value: 'wunschfarbe', chip: 'Wunschfarbe', swatch: 'conic-gradient(from 90deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa,#e53935)', hideWhen: gateHide }
      ]}
    ];

    var step = 0;
    var picks = [];   /* picks[i] = array of chosen option objects for step i (multi-select; [] = skipped) */
    var lead = { email: '', news: false };   /* optional e-mail capture (final step) */
    var STEPS = QUIZ.length;                  /* questions only — e-mail capture now lives on the result */

    /* Resolve the system step (IP/BUS) and the Zutritt step by content, so the
       skip logic survives any re-ordering of QUIZ. */
    var IDX_SYSTEM = -1, IDX_ZUTRITT = -1, IDX_TYPE = -1, IDX_NAMENSSCHILD = -1, IDX_OPTIK = -1, IDX_KLINGEL = -1;
    QUIZ.forEach(function (s, i) {
      (s.opts || []).forEach(function (o) {
        if (o.group === 'system') IDX_SYSTEM = i;
        if (o.group === 'tuer')   IDX_ZUTRITT = i;
        if (o.group === 'type')    IDX_TYPE = i;
        if (o.group === 'namensschild') IDX_NAMENSSCHILD = i;
        if (o.group === 'colorset') IDX_OPTIK = i;
        if (o.group === 'klingel') IDX_KLINGEL = i;
      });
    });
    /* Has the shopper chosen option `value` for facet `group` anywhere so far?
       Used by option-level hideWhen() guards. */
    function picked(group, value) {
      return picks.some(function (arr) {
        return (arr || []).some(function (o) { return o && o.group === group && o.value === value; });
      });
    }
    /* The 2-Draht-BUS line (XDM10) does not offer the dedicated Zutritt features
       (Fingerprint, Gesichtserkennung, PIN, QR …), so when BUS is chosen we hide
       the Zutritt step entirely instead of showing options that don't apply. */
    function busChosen() {
      return (picks[IDX_SYSTEM] || []).some(function (o) { return o && o.value === 'bus'; });
    }
    /* ── Dataset-driven option availability (live-shop parity, edelstahl-
       tuerklingel.de/tuersprechanlagen): an option is offered only while ≥1
       product consistent with the answers on EARLIER steps satisfies it —
       zero-result options disappear (never greyed out). This encodes the live
       couplings (BUS ⇒ kein Türöffner & max 3 Taster, Audio & Großanlagen ⇒
       IP-only, Gesichtserkennung ⇒ IP …) from the data instead of by hand. */
    function stepOfOpt(o) {
      for (var i = 0; i < QUIZ.length; i++) if (QUIZ[i].opts.indexOf(o) !== -1) return i;
      return QUIZ.length;
    }
    /* Products consistent with every facet answer on steps < limit (within a
       step: OR; across steps: AND; neutral picks add no constraint). Falls back
       to the full catalogue so the quiz never strands a step. */
    function poolBefore(limit) {
      var pool = PRODUCTS.filter(function (p) {
        for (var j = 0; j < limit; j++) {
          var facet = (picks[j] || []).filter(function (o) { return o && o.group; });
          if (facet.length && !facet.some(function (o) { return sat(p, o); })) return false;
        }
        return true;
      });
      return pool.length ? pool : PRODUCTS;
    }
    /* Option hideWhen — `this` is the option (called as o.hideWhen()). */
    function gateHide() { var o = this; return !poolBefore(stepOfOpt(o)).some(function (p) { return sat(p, o); }); }
    /* Progressive AND-gating for the multi-select Zutritt step: a method stays offered
       only while a product carries every already-picked method plus this one — so the
       shopper can only build combinations a real product fully satisfies. */
    function tuerGate() {
      var o = this, idx = stepOfOpt(o);
      var picked = (picks[idx] || []).filter(function (x) { return x && x.group === 'tuer' && x.value !== o.value; });
      return !poolBefore(idx).some(function (p) { return sat(p, o) && picked.every(function (x) { return sat(p, x); }); });
    }
    function optVisible(o) { return !(o.hideWhen && o.hideWhen()); }
    function stepHidden(i) {
      /* Zutritt features don't apply to BUS or to Audio-only models (no Türöffner) —
         verified on the live shop: the BUS-Serie & Audio categories carry no
         "Türöffner Bedienung" facet at all. */
      /* Klingeltaster-Anzahl nur für Mehrfamilienhaus — Einfamilien ist immer 1 Taster,
         flexible Großanlagen wählen frei (1–500). */
      if (i === IDX_KLINGEL && IDX_KLINGEL !== -1 && !picked('verwendung', 'mehrfamilien')) return true;
      if (i === IDX_ZUTRITT && IDX_ZUTRITT !== -1 && (busChosen() || picked('type', 'audio'))) return true;
      /* BUS-Serie (XDM10) ships only with an austauschbares Namensschild — no gravur/
         display choice — so the Namensschild step offers no real decision for BUS → skip. */
      if (i === IDX_NAMENSSCHILD && IDX_NAMENSSCHILD !== -1 && (busChosen() || new Set(poolBefore(i).map(nsOf)).size <= 1)) return true;   /* skip unless ≥2 distinct Namensschild-Typen remain — otherwise only one real type + "Egal" (dead step, e.g. Fingerprint = Lasergravur only) */
      /* Flexible Großanlagen are video-only, so the Video/Audio step has no choice → skip it. */
      if (i === IDX_TYPE && IDX_TYPE !== -1 && picked('verwendung', 'flexibel')) return true;
      /* Optik is a per-product config (Farbe/Edelstahl/Wunschfarbe), not a differentiator —
         once only one product remains there is nothing to choose (e.g. Audio + Papiereinleger). */
      if (i === IDX_OPTIK && IDX_OPTIK !== -1 && (busChosen() || poolBefore(i).length <= 1)) return true;   /* BUS (XDM10) has no Optik choice → color step redundant */
      /* Generic rule (live-shop parity): a step left with ≤1 real option offers
         no choice → skip it. */
      var n = 0;
      QUIZ[i].opts.forEach(function (o) { if (optVisible(o)) n++; });
      return n <= 1;
    }
    function visibleSteps() {
      var a = [];
      for (var i = 0; i < QUIZ.length; i++) if (!stepHidden(i)) a.push(i);
      return a;
    }
    function nextVisible(from) {                 /* returns QUIZ.length to signal "finish" */
      for (var i = from + 1; i < QUIZ.length; i++) if (!stepHidden(i)) return i;
      return QUIZ.length;
    }
    function prevVisible(from) {                  /* returns -1 when already at the first visible step */
      for (var i = from - 1; i >= 0; i--) if (!stepHidden(i)) return i;
      return -1;
    }

    function labelFor(group, key) {
      if (group === 'color') return (COLORS[key] && COLORS[key].label) || key;
      var items = (FACETS[group] && FACETS[group].items) || [];
      for (var i = 0; i < items.length; i++) if (items[i].key === key) return items[i].label;
      return key;
    }
    /* Apply the picks; if the full AND-combination has no match, progressively
       relax the lowest-priority answer (colour first, household last) so the
       advisor always returns a recommendation. Returns {kept, dropped, count}. */
    function applyPicks() {
      var priority = ['verwendung', 'klingel', 'type', 'system', 'tuer', 'namensschild', 'material', 'kombi', 'colorset', 'color']; /* later = dropped first */
      var sel = [], prefs = [];
      picks.forEach(function (arr, idx) {
        if (stepHidden(idx)) return;             /* skipped step (e.g. Zutritt when BUS) → its picks don't filter */
        (arr || []).forEach(function (o) {       /* picks[i] is an array (multi-select) */
          if (!o || !o.group) return;            /* neutral option → no filter */
          if (o.group === 'pref') prefs.push(o); /* Beschriftung → noted, not filterable */
          else sel.push(o);                      /* real facet → filters + ranks */
        });
      });
      function setActive(list) {
        Object.keys(active).forEach(function (g) { active[g] = []; });
        list.forEach(function (o) {
          if (o.group === 'colorset') { (o.values || []).forEach(function (v) { if (active.color.indexOf(v) === -1) active.color.push(v); }); }
          else if (active[o.group] && active[o.group].indexOf(o.value) === -1) active[o.group].push(o.value);
        });
        advisorChips = true;   /* filters came from the KI → keep them out of the toolbar */
        page = 1; refreshFacetDisplay(); syncControls(); render();
        return PRODUCTS.filter(matches).length;
      }
      var current = sel.slice(), dropped = [];
      var count = setActive(current);
      while (count === 0 && current.length) {
        var worst = 0, worstPri = -1;
        current.forEach(function (o, i) {
          var p = priority.indexOf(o.group); if (p === -1) p = 99;
          if (p > worstPri) { worstPri = p; worst = i; }
        });
        dropped.push(current[worst]);
        current.splice(worst, 1);
        count = setActive(current);
      }
      return { kept: current, dropped: dropped, count: count, prefs: prefs };
    }
    function scrollToGrid() {
      var top = $('#grid').getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

    /* Fluid phase change: fade-and-slide the current step out, THEN run fn
       (which renders the next phase and fades it in). No instant swap. */
    /* Step transition: fade the outgoing step, swap, then TWEEN the container from the
       old height to the new step's natural height while the new step fades in. This
       removes the height "jump" between differently-sized steps without locking every
       step to the tallest (which left dead space on the short ones). On desktop the
       inline min-height (lockQuizHeight) keeps the box fixed, so the tween is a no-op
       there; on phones (min-height:0) it animates. */
    function go(fn) {
      var cur = quizEl.querySelector('.advisor__step');
      if (!cur) { fn(); return; }
      var h0 = quizEl.getBoundingClientRect().height;
      cur.classList.remove('is-in'); cur.classList.add('is-out');
      setTimeout(function () {
        fn();                                            /* render next step (or finish) */
        var next = quizEl.querySelector('.advisor__step');
        if (!next) return;                                /* finish() → no height tween */
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || typeof quizEl.animate !== 'function') return;   /* graceful: instant change */
        /* cancel any in-flight height tween so we read the TRUE natural height */
        if (quizEl.getAnimations) quizEl.getAnimations().forEach(function (a) { a.cancel(); });
        var h1 = quizEl.getBoundingClientRect().height;   /* natural height of the new step */
        if (Math.abs(h1 - h0) < 2) return;
        /* Web Animations API: deterministic height tween (no transitionend-bubbling
           quirks from the step's own fade). overflow:hidden so growing/shrinking
           content doesn't spill mid-tween. */
        quizEl.style.overflow = 'hidden';
        var anim = quizEl.animate(
          [{ height: h0 + 'px' }, { height: h1 + 'px' }],
          { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
        var clear = function () { quizEl.style.overflow = ''; };
        anim.onfinish = clear; anim.oncancel = clear;
        /* fallback: if onfinish never fires (e.g. backgrounded tab), release the box */
        setTimeout(function () { if (anim.playState !== 'finished') { try { anim.cancel(); } catch (e) {} } clear(); }, 380);
      }, 190);
    }

    /* ── Recommendation-card helpers ── */
    function fmtPrice(n) { return n.toFixed(2).replace('.', ',') + ' €'; }
    var SYS = { ip: 'IP-System', bus: '2-Draht-BUS' };
    var TYP = { video: 'Video-Türsprechanlage', audio: 'Audio-Türsprechanlage' };
    function specsOf(p) {
      var taster = p.klingel === 'flex' ? 'Flexibel 1–500 Taster' : labelFor('klingel', p.klingel);
      return [ TYP[p.type] || p.type, SYS[p.system] || p.system, taster ];
    }
    function pickImg(p) { return p.img || IMG; }
    /* Does product p satisfy a single facet pick? (mirrors matches()) */
    function sat(p, o) {
      if (o.group === 'color')    return o.value === 'wunschfarbe' || p.colors.indexOf(o.value) !== -1;   /* Wunschfarbe (RAL) auf allen Modellen möglich */
      if (o.group === 'colorset') return (o.values || []).some(function (c) { return p.colors.indexOf(c) !== -1; });
      if (o.group === 'material') return p.material === o.value;
      if (o.group === 'system')   return p.system === o.value;
      if (o.group === 'klingel')  return p.klingel === o.value || p.klingel === 'flex';   /* flex (1–500) erfüllt jede Anzahl */
      if (o.group === 'tuer')     return (p.tuer || []).indexOf(o.value) !== -1;
      if (o.group === 'type')     return p.type === o.value;
      if (o.group === 'verwendung')   return verwOf(p) === o.value || verwOf(p) === 'flexibel';   /* flexible Großanlage (1–500 Taster) passt auch für Ein-/Mehrfamilien */
      if (o.group === 'namensschild') return nsOf(p) === o.value;
      if (o.group === 'kombi')        return o.value === 'briefkasten' ? !!p.briefkasten : false;
      return false;
    }
    function recCardHTML(p) {
      return '<a class="advisor__rec" href="#grid" data-details>' +
        '<span class="advisor__rec-thumb"><img src="' + pickImg(p) + '" alt="" loading="lazy"></span>' +
        '<span class="advisor__rec-info">' +
          '<span class="advisor__rec-name">' + p.name + '</span>' +
          '<span class="advisor__rec-price">' + fmtPrice(p.price) + (p.uvp ? '<s>' + fmtPrice(p.uvp) + '</s>' : '') + '</span>' +
        '</span>' +
        '<svg class="advisor__rec-go" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-chevron-right"/></svg>' +
      '</a>';
    }


    /* Markup for one question step (i) — shared by renderStep and the height probe. */
    function stepInnerHTML(i) {
      var s = QUIZ[i];
      var cur = Array.isArray(picks[i]) ? picks[i] : [];
      var opts = s.opts.map(function (o, k) {
        if (o.hideWhen && o.hideWhen()) return '';   /* option not applicable to current picks → drop (keep index k stable) */
        var on = cur.some(function (p) { return p.label === o.label; }) ? ' is-active' : '';
        var swCss = o.swatch || (o.group === 'color' && COLORS[o.value] ? COLORS[o.value].css : null);
        var sw = swCss ? '<span class="advisor__opt-sw" style="background:' + swCss + '" aria-hidden="true"></span>' : '';
        var text = '<span class="advisor__opt-label">' + o.label + '</span>' +
          (o.sub ? '<span class="advisor__opt-sub">' + o.sub + '</span>' : '');
        // Swatch tiles lay out as [palette] [caption column]; non-swatch keep label+sub inline.
        var inner = swCss ? sw + '<span class="advisor__opt-text">' + text + '</span>' : text;
        return '<button type="button" class="advisor__opt' + on + (swCss ? ' advisor__opt--sw' : '') + '" data-opt="' + k + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
          inner +
        '</button>';
      }).join('');
      /* Progress reflects only the steps actually shown for this path (the Zutritt
         step drops out for BUS), so the count stays honest as the flow changes. */
      var vis = visibleSteps();
      var pos = vis.indexOf(i);                 /* 0-based position within the visible sequence */
      var total = vis.length;
      var isLast = pos === total - 1;
      var dots = '';
      for (var d = 0; d < total; d++) dots += '<span class="' + (d < pos ? 'is-done' : (d === pos ? 'is-current' : '')) + '"></span>';
      return '<div class="advisor__step">' +
          '<div class="advisor__progress">' +
            '<span class="advisor__progress-dots">' + dots + '</span>' +
            '<span class="advisor__progress-label">Schritt ' + (pos + 1) + ' von ' + total + '</span>' +
          '</div>' +
          '<h3 class="advisor__q">' + s.q + '</h3>' +
          '<div class="advisor__opts" role="group" aria-label="' + s.q + '">' + opts + '</div>' +
          '<div class="advisor__nav">' +
            (pos > 0 ? '<button type="button" class="advisor__back" data-back><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-chevron-right"/></svg>Zurück</button>' : '<span></span>') +
            '<button type="button" class="advisor__forward' + (isLast ? ' advisor__forward--cta' : '') + '" data-next>' + (isLast ? 'Empfehlung anzeigen' : 'Weiter') + '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-chevron-right"/></svg></button>' +
          '</div>' +
        '</div>';
    }

    /* If any option's label+sub wraps to a 2nd line, stack ALL options in the step. */
    function markStacked(scope) {
      var optsEl = scope.querySelector('.advisor__opts');
      if (!optsEl) return;
      var anyWrapped = [].some.call(scope.querySelectorAll('.advisor__opt:not(.advisor__opt--sw)'), function (o) {
        var lab = o.querySelector('.advisor__opt-label'), sub = o.querySelector('.advisor__opt-sub');
        return sub && sub.getBoundingClientRect().top >= lab.getBoundingClientRect().bottom - 2;
      });
      if (anyWrapped) optsEl.classList.add('advisor__opts--stacked');
    }

    /* Fix the quiz column to the tallest QUESTION step (the result step is excluded)
       so the container does not jump as the option count changes. Measured in an
       offscreen probe so the live step (and its listeners) is never disturbed. */
    function lockQuizHeight() {
      var w = quizEl.clientWidth;
      if (!w) return;
      var probe = document.createElement('div');
      probe.className = quizEl.className;
      probe.style.cssText = 'position:absolute; left:-9999px; top:0; visibility:hidden; width:' + w + 'px;';
      quizEl.parentNode.appendChild(probe);
      var max = 0;
      for (var i = 0; i < STEPS; i++) {
        probe.innerHTML = stepInnerHTML(i);
        markStacked(probe);
        var el = probe.querySelector('.advisor__step');
        var h = el ? el.offsetHeight : 0;
        if (h > max) max = h;
      }
      probe.remove();
      if (max) quizEl.style.minHeight = max + 'px';
    }

    function renderStep() {
      if (step >= QUIZ.length) { finish(); return; }   /* after the last question → result (with e-mail capture) */
      /* Drop any pick that is no longer offered on this step (e.g. BUS picked
         earlier, then the shopper switched to a Flexible Großanlage). */
      if (Array.isArray(picks[step])) {
        picks[step] = picks[step].filter(function (o) { return !(o.hideWhen && o.hideWhen()); });
      }
      results.hidden = true; results.innerHTML = '';
      var s = QUIZ[step];
      quizEl.innerHTML = stepInnerHTML(step);
      var stepEl = quizEl.querySelector('.advisor__step');
      requestAnimationFrame(function () { stepEl.classList.add('is-in'); });
      markStacked(quizEl);

      quizEl.querySelectorAll('[data-opt]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var o = s.opts[+btn.getAttribute('data-opt')];
          if (!Array.isArray(picks[step])) picks[step] = [];
          var arr = picks[step], ix = -1;
          for (var j = 0; j < arr.length; j++) { if (arr[j].label === o.label) { ix = j; break; } }
          if (ix === -1) arr.push(o); else arr.splice(ix, 1);   /* toggle — multi-select, no auto-advance */
          var onNow = btn.classList.toggle('is-active');
          btn.setAttribute('aria-pressed', onNow ? 'true' : 'false');
        });
      });
      var back = quizEl.querySelector('[data-back]');
      if (back) back.addEventListener('click', function () { var p = prevVisible(step); if (p >= 0) go(function () { step = p; renderStep(); }); });
      var next = quizEl.querySelector('[data-next]');   /* Weiter advances; empty selection = skip; hidden steps are jumped */
      if (next) next.addEventListener('click', function () { if (!Array.isArray(picks[step])) picks[step] = []; go(function () { step = nextVisible(step); renderStep(); }); });
    }

    /* Premium loader: pulsing geometric wave + shimmer skeleton cards. */
    function loaderHTML() {
      var sk = '<div class="adv-sk">' +
        '<span class="adv-sk__thumb"></span>' +
        '<span class="adv-sk__lines">' +
          '<span class="adv-sk__line adv-sk__line--sm"></span>' +
          '<span class="adv-sk__line adv-sk__line--lg"></span>' +
          '<span class="adv-sk__line adv-sk__line--md"></span>' +
        '</span></div>';
      return '<div class="advisor__thinking">' +
        '<span class="advisor__thinking-head"><span class="advisor__wave"><i></i><i></i><i></i><i></i><i></i></span>' +
        'Wir analysieren Ihre Antworten und kuratieren passende Modelle…</span>' +
        '<div class="advisor__skeleton">' + sk + sk + '</div>' +
      '</div>';
    }

    function resultHTML(res, top) {
      /* Always the top picks (we only ever show 2 cards). The total match count is
         truthfully conveyed by the "Alle N Modelle ansehen" button, not the title —
         a count here read as "N curated" when only 2 are shown. */
      var headText = 'Unsere Top-Empfehlungen für Sie';
      var cards = top.map(function (t) { return recCardHTML(t.p); }).join('');
      var chips = res.kept.map(function (o) {
        var chipText = o.chip || o.label || labelFor(o.group, o.value);
        return '<span class="advisor__chip">' + chipText +
          '<button type="button" class="advisor__chip-x" data-ai-chip-label="' + o.label + '" aria-label="Filter ' + chipText + ' entfernen">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>' +
          '</button></span>';
      });
      var note = res.dropped.length
        ? '<p class="advisor__note">Kein exakter Treffer – wir zeigen Ihnen die besten Alternativen.</p>'
        : '';
      var capture =
        '<div class="advisor__capture" data-result-capture>' +
          '<p class="advisor__capture-q">Empfehlung per E-Mail erhalten?</p>' +
          '<div class="advisor__capture-row">' +
            '<div class="advisor__field">' +
              '<svg class="advisor__field-ico advisor__field-ico--mail" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>' +
              '<input type="email" class="advisor__input" data-email autocomplete="email" placeholder="E-Mail-Adresse eingeben" aria-label="E-Mail-Adresse">' +
            '</div>' +
            '<div class="advisor__capture-end">' +
              '<label class="advisor__optin">' +
                '<input type="checkbox" data-optin>' +
                '<span class="advisor__optin-box" aria-hidden="true"></span>' +
                '<span>Schicken Sie mir Metzler News &amp; Angebote.</span>' +
              '</label>' +
              '<button type="button" class="advisor__send" data-email-send aria-label="Absenden"><span class="advisor__send-label">Absenden</span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-chevron-right"/></svg></button>' +
            '</div>' +
          '</div>' +
          '<p class="advisor__optin-info" data-optin-info role="status">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11.5v4.5"/><path d="M12 7.7h.01"/></svg>' +
            '<span>Wir senden Ihnen eine E-Mail mit einem Freischalt-Link für den Erhalt unseres Newsletters. Die Abmeldung ist jederzeit möglich.</span>' +
          '</p>' +
          '<p class="advisor__legal">Hinweise zum Datenschutz finden Sie <a href="#">hier</a>.</p>' +
        '</div>';
      return '<div class="advisor__result">' +
        '<div class="advisor__result-head"><h3 class="advisor__result-title">' + headText + '</h3></div>' +
        '<div class="advisor__recs">' + cards + '</div>' +
        '<div class="advisor__aside">' +
          '<div class="advisor__summary">' +                  /* chips left · actions right, one horizontal row */
            (chips.length ? '<div class="advisor__chips">' + chips.join('') + '</div>' : '<span></span>') +
            '<div class="advisor__actions">' +
              '<button type="button" class="advisor__view" data-ai-view>' + (res.count === 1 ? 'Das Modell ansehen' : 'Alle ' + res.count + ' Modelle ansehen') + '</button>' +
              '<button type="button" class="advisor__reset" data-ai-reset>Quiz neu starten</button>' +
            '</div>' +
          '</div>' +
          note +
        '</div>' +
        capture +
        '</div>';
    }

    /* Remove every pick with this label (used by the removable result chips). */
    function removePick(label) {
      picks.forEach(function (arr) {
        if (!Array.isArray(arr)) return;
        for (var i = arr.length - 1; i >= 0; i--) {
          if (arr[i].label === label) arr.splice(i, 1);
        }
      });
    }

    /* Build + wire the result (no loader). Called after the loader, and again
       instantly when a result chip is removed → re-curate. */
    function renderResult() {
      var res = applyPicks();
      var selAll = res.kept.concat(res.dropped);
      function ratioOf(p) { return selAll.length ? selAll.filter(function (o) { return sat(p, o); }).length / selAll.length : 1; }
      var ranked = PRODUCTS.filter(matches).map(function (p) {
        return { p: p, ratio: ratioOf(p) };
      }).sort(function (a, b) { return b.ratio - a.ratio || b.p.rating - a.p.rating || (b.p.reviews||0) - (a.p.reviews||0); });
      var top = ranked.slice(0, 2);
      if (top.length < 2) {   /* always fill 2 cards — pad with the next-best alternatives (no lone card / blank) */
        var have = top.map(function (t) { return t.p.id; });
        var fill = PRODUCTS.filter(function (p) { return have.indexOf(p.id) === -1; })
          .map(function (p) { return { p: p, ratio: ratioOf(p) }; })
          .sort(function (a, b) { return b.ratio - a.ratio || b.p.rating - a.p.rating || (b.p.reviews||0) - (a.p.reviews||0); });
        top = top.concat(fill).slice(0, 2);
      }
      results.innerHTML = resultHTML(res, top);
      var el = results.querySelector('.advisor__result');
      requestAnimationFrame(function () { if (el) el.classList.add('is-in'); });
      results.querySelectorAll('[data-details]').forEach(function (d) {
        d.addEventListener('click', function (e) { e.preventDefault(); scrollToGrid(); });
      });
      var view = results.querySelector('[data-ai-view]');
      if (view) view.addEventListener('click', scrollToGrid);
      var reset = results.querySelector('[data-ai-reset]');
      if (reset) reset.addEventListener('click', restart);

      /* Removable filter chips — drop the filter and re-curate instantly */
      results.querySelectorAll('[data-ai-chip-label]').forEach(function (b) {
        b.addEventListener('click', function () {
          removePick(b.getAttribute('data-ai-chip-label'));
          renderResult();
        });
      });

      /* E-mail capture (on the result): submit → inline confirmation that
         auto-reverts to the pristine form after a few seconds. */
      var cap = results.querySelector('[data-result-capture]');
        if (cap) {
          var captureInner = cap.innerHTML;   /* pristine form markup, restored after the confirmation */
          var revertTimer;
          var wireCapture = function () {
            var emailEl = cap.querySelector('[data-email]');
            if (!emailEl) return;
            var optinEl = cap.querySelector('[data-optin]');
            var optinLabel = cap.querySelector('.advisor__optin');
            var optinInfo = cap.querySelector('[data-optin-info]');
            optinEl.addEventListener('change', function () {
              optinLabel.classList.toggle('is-on', optinEl.checked);
              if (optinInfo) optinInfo.classList.toggle('is-shown', optinEl.checked);   /* newsletter → double-opt-in notice */
            });
            var submitEmail = function () {
              var v = emailEl.value.trim();
              if (!v) { emailEl.focus(); return; }
              lead.email = v; lead.news = optinEl.checked;
              cap.innerHTML =
                '<div class="advisor__sent" role="status">' +
                  '<svg class="advisor__sent-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.4 12.3l2.4 2.4 4.8-5.4"/></svg>' +
                  '<p class="advisor__sent-text">Ihre Empfehlung wird an <strong>' + v + '</strong> gesendet' + (lead.news ? ' – inkl. News &amp; Angebote' : '') + '.' + (lead.news ? ' Bitte bestätigen Sie die E-Mail in Ihrem Postfach.' : '') + '</p>' +
                '</div>';
              clearTimeout(revertTimer);
              revertTimer = setTimeout(function () { cap.innerHTML = captureInner; wireCapture(); }, 4000);   /* back to the default form */
            };
            emailEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submitEmail(); } });
            cap.querySelector('[data-email-send]').addEventListener('click', submitEmail);
          };
          wireCapture();
        }
    }

    function finish() {
      clearTimeout(thinkTimer);
      root.classList.add('is-result');   /* hide the intro block on the result step */
      quizEl.innerHTML = '';
      results.hidden = false;
      results.innerHTML = loaderHTML();
      thinkTimer = setTimeout(renderResult, 1500);
    }

    function restart() {
      step = 0; picks = []; lead = { email: '', news: false };
      root.classList.remove('is-result');   /* bring the intro block back */
      clearAll();                 /* clears active filters + re-renders the full grid */
      results.hidden = true; results.innerHTML = '';
      renderStep();
    }

    renderStep();   /* render step 0 into the (collapsed) card */

    /* Collapsible dropdown — collapsed by default; measure the quiz on open (hidden = width 0) */
    function toggleAdvisor() {
      var open = root.classList.toggle('is-open');
      var bar = root.querySelector('.advisor__bar');
      if (bar) bar.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var st = quizEl.querySelector('.advisor__step'); if (st) st.classList.add('is-in');   /* settle entrance offset so the quiz aligns to the content top */
        lockQuizHeight();
        var f = root.querySelector('.advisor__result-title') || root.querySelector('.advisor__q');
        if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 80);
      }
    }
    root.querySelectorAll('[data-ai-toggle]').forEach(function (b) { b.addEventListener('click', toggleAdvisor); });
    var rzT;
    window.addEventListener('resize', function () { clearTimeout(rzT); if (root.classList.contains('is-open')) rzT = setTimeout(lockQuizHeight, 200); });
  }

  /* ---- SEO "Mehr lesen" toggle ---- */
  function wireSeo() {
    var text = $('#seoText'), btn = $('#seoToggle');
    if (!text || !btn) return;
    btn.addEventListener('click', function () {
      var open = text.classList.toggle('is-open');
      btn.textContent = open ? 'Weniger lesen' : 'Mehr lesen';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- Contact modal (Info- & Hilfecenter) ---- */
  function wireContactModal() {
    var modal = document.getElementById('contactModal');
    if (!modal) return;
    var dialog = modal.querySelector('.modal');
    var lastFocused = null;
    function focusables() {
      return dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
    }
    function open() {
      lastFocused = document.activeElement;
      // Close the mobile contact-bar dropdown so it isn't left open behind the modal
      var qb = document.getElementById('quickbar');
      if (qb) { qb.classList.remove('is-open'); var qbt = qb.querySelector('.qa-mobile-toggle'); if (qbt) qbt.setAttribute('aria-expanded', 'false'); }
      modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // On mobile, size the sheet so its top reaches the bottom of the contact bar
      if (qb && window.matchMedia('(max-width:767px)').matches) {
        var topY = Math.max(0, qb.getBoundingClientRect().bottom) + 3;
        var h = Math.max(0, window.innerHeight - topY);
        dialog.style.height = h + 'px'; dialog.style.maxHeight = h + 'px';
      } else { dialog.style.height = ''; dialog.style.maxHeight = ''; }
      var f = focusables(); if (f.length) f[0].focus();
    }
    function close() {
      modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      dialog.style.height = ''; dialog.style.maxHeight = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    document.querySelectorAll('[data-open-modal]').forEach(function (el) { el.addEventListener('click', open); });
    document.querySelectorAll('[data-close-modal]').forEach(function (el) { el.addEventListener('click', close); });
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    /* Mobile contact-bar dropdown toggle */
    var bar = document.getElementById('quickbar');
    var qt = bar && bar.querySelector('.qa-mobile-toggle');
    if (qt) { qt.addEventListener('click', function () {
      var o = bar.classList.toggle('is-open');
      qt.setAttribute('aria-expanded', o ? 'true' : 'false');
    }); }
  }

  /* ---- Init ---- */
  buildSubnav();
  buildFacets();
  updateFacets();
  wireDrawer();
  wireSubnav();
  wireFooterAccordions();
  wireAiAdvisor();
  wireSeo();
  wireContactModal();
  $('#clearAll').addEventListener('click', clearAll);
  $('#emptyReset').addEventListener('click', clearAll);
  render();
})();
