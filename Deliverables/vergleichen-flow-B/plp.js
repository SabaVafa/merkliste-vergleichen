/* ============================================================
   Metzler PLP — Briefkästen
   Client-side rendering, live filtering, chips, pagination.
   Product list, prices, badges, reviews, colour swatches, filters and
   subcategory rail mirror the live category page
   edelstahl-tuerklingel.de/briefkasten (Stand 05.11.2026, 79 Artikel,
   Standard-Sortierung) — see Deliverables/13_PLP_Live-Abgleich.md.
   ============================================================ */
(function () {
  'use strict';

  var IMG = 'Product%20Image/einfamilien-briefkasten.png';
  var PAGE = 24; // products per page — as in the live shop (79 Artikel = 4 Seiten)

  /* ---- Colour facet (Shop-Merkmal „Farbe") — order + counts as on the live website ---- */
  var COLORS = {
    anthrazit:   { label: 'Anthrazit',    css: '#383E42', count: 70 },
    braun:       { label: 'Braun',        css: '#5A3B29', count: 6 },
    edelstahl:   { label: 'Edelstahl',    css: 'linear-gradient(135deg,#e9ebee,#a7adb4 55%,#d6d9dd)', count: 9 },
    eisenglimmer:{ label: 'Eisenglimmer', css: 'linear-gradient(135deg,#3a3d40,#23262a)', count: 46 },
    grau:        { label: 'Grau',         css: '#B9BCC0', count: 46 },
    schwarz:     { label: 'Schwarz',      css: '#1A171B', count: 43 },
    weiss:       { label: 'Weiß',         css: '#FFFFFF', count: 38 },
    wunschfarbe: { label: 'Wunschfarbe',  css: 'conic-gradient(from 90deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa,#e53935)', count: 5 }
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
    'wf':   { label: 'Wunschfarbe nach RAL', css: 'conic-gradient(from 90deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa,#e53935)' }
  };

  /* ---- Sidebar facets = the live filter groups, in live order (Shop-Merkmale; option labels + counts
         exactly as shown on edelstahl-tuerklingel.de/briefkasten). Each product carries the raw shop values
         in p.f (card.f in vergleich-daten.js); 'color' uses p.colors. noCount: the live page shows no
         count for this group; plain: count without brackets (as on the live page). ---- */
  var FACET_ORDER = ['fa', 'kt', 'color', 'mo', 'zf', 'ns', 'mk'];
  var FACETS = {
    fa: { title: 'Anzahl der Briefkastenfächer', items: [
      { key: '1', label: '1', chip: '1 Fach', count: 69 },
      { key: '2', label: '2', chip: '2 Fächer', count: 10 }
    ]},
    kt: { title: 'Anzahl der Klingeltaster', noCount: true, items: [
      { key: '1 Taster', label: '1 Taster', count: 7 }
    ]},
    mo: { title: 'Montageart', items: [
      { key: 'Aufputz', label: 'Aufputz', count: 44 },
      { key: 'Standmontage', label: 'Standmontage', count: 29 },
      { key: 'Unterputz', label: 'Unterputz', count: 4 },
      { key: 'Zaunmontage', label: 'Zaunmontage', count: 2 }
    ]},
    zf: { title: 'Zeitungsfach', items: [
      { key: 'Integriert', label: 'Integriert', chip: 'Zeitungsfach integriert', count: 63 },
      { key: 'Ohne', label: 'Ohne', chip: 'Ohne Zeitungsfach', count: 7 },
      { key: 'Optional', label: 'Optional', chip: 'Zeitungsfach optional', count: 9 }
    ]},
    ns: { title: 'Namensschild', items: [
      { key: 'Lasergraviert', label: 'Lasergraviert', chip: 'Namensschild lasergraviert', count: 62 },
      { key: 'mit Papiereinleger', label: 'mit Papiereinleger', chip: 'Namensschild mit Papiereinleger', count: 7 },
      { key: 'Ohne Gravur', label: 'Ohne Gravur', chip: 'Namensschild ohne Gravur', count: 5 }
    ]},
    mk: { title: 'Marke', plain: true, items: [
      { key: 'Metzler', label: 'Metzler', count: 64 }
    ]}
  };

  /* Human-readable labels for chips */
  var LABELS = {};
  Object.keys(COLORS).forEach(function (k) { LABELS['color:' + k] = COLORS[k].label; });
  Object.keys(FACETS).forEach(function (g) {
    FACETS[g].items.forEach(function (it) { LABELS[g + ':' + it.key] = it.chip || it.label; });
  });

  /* ---- Subcategory rail = the live tiles (name, count, target). Image: the shop's tile image,
         local copy as offline fallback. ---- */
  var SHOP = 'https://edelstahl-tuerklingel.de/';
  var CAT_IMG = SHOP + 'media/image/category/';
  var SUBCATS = [
    { t: 'Einfamilien Briefkasten', n: 77, href: SHOP + 'exklusiv-briefkasten', img: CAT_IMG + '664/md/exklusiv-briefkasten.jpg', fb: 'Product%20Image/einfamilien-briefkasten.png' },
    { t: 'Briefkasten ohne Gravur', n: 26, href: SHOP + 'briefkasten-ohne-gravur', img: CAT_IMG + '948/md/briefkasten-ohne-gravur.jpg', fb: 'Product%20Image/briefkasten-ohne-gravur.webp' },
    { t: 'Standbriefkästen', n: 56, href: SHOP + 'standbriefkasten-sets', img: CAT_IMG + '670/md/standbriefkasten-sets.jpg', fb: 'Product%20Image/standbriefkaesten.webp' },
    { t: 'Briefkasten mit Klingel & Sprechanlage', n: 19, href: SHOP + 'briefkasten-funkklingel-sprechanlage', img: CAT_IMG + '874/md/briefkasten-funkklingel-sprechanlage.jpg', fb: 'Product%20Image/briefkasten-klingel-sprechanlage.webp' },
    { t: 'Mehrfamilien Briefkästen', n: 35, href: SHOP + 'briefkasten-zweifamilienhaus', img: CAT_IMG + '666/md/briefkasten-zweifamilienhaus.jpg', fb: 'Product%20Image/mehrfamilien-briefkaesten.webp' },
    { t: 'Unterputz Briefkästen', n: 4, href: SHOP + 'unterputz-briefkaesten', img: CAT_IMG + '1146/md/unterputz-briefkaesten.jpg', fb: 'Product%20Image/unterputz-briefkaesten.webp' },
    { t: 'Briefkastenanlagen Konfigurator', n: null, cta: true, href: SHOP + 'briefkastenanlage', img: CAT_IMG + '1085/md/briefkastenanlage.jpg', fb: 'Product%20Image/Briefkastenanlage/konfigurator-tile.png' },
    { t: 'Paketboxen', n: null, href: SHOP + 'paketboxen', img: CAT_IMG + '949/md/paketbox.webp', fb: 'Product%20Image/paketboxen.webp' },
    { t: 'Briefkastenschilder', n: 16, href: SHOP + 'briefkastenschilder', img: CAT_IMG + '768/md/briefkastenschilder.jpg', fb: 'Product%20Image/briefkastenschilder.webp' },
    { t: 'Briefkastenständer', n: 20, href: SHOP + 'briefkastenstaender', img: CAT_IMG + '669/md/briefkastenstaender.jpg', fb: 'Product%20Image/briefkastenstaender.webp' },
    { t: 'Ersatzteile & Zubehör', n: 37, href: SHOP + 'briefkasten-zubehoer', img: CAT_IMG + '809/md/briefkasten-zubehoer.png', fb: 'Product%20Image/ersatzteile-zubehoer.webp' }
  ];

  /* ---- Product catalogue = the live category listing, all 4 pages in the shop's default order
         („Standard"). name/price/uvp/ab/rating/reviews/badge/sw are read from the live product cards
         (price = current price, uvp = struck price, ab = card shows „ab", sw = colour bubbles).
         Image, colours and filter attributes come from the shop data (vergleich-daten.js, below).
         Existing prototype ids are kept where they map to the same shop article (deep links, saved
         Merklisten, comparison tour) — e.g. lessing = Alves, castor = Hugo, zaun = Emma,
         schneider = Nora, gienger = Modell-G, flora = Siebert Frame J, stencil2 = Stencil MFH. ---- */
  var SALE = { type: 'sale', text: '−15 %' };
  var PRODUCTS = [
    { id:'siebert', name:'Briefkasten aus hochwertigem Stahl | Siebert', price:76.49, uvp:89.99, ab:true, rating:5, reviews:763, badge:SALE, sw:'7016 9016 9007 703 9005 7012 es wf' },
    { id:'ebenhard', name:'Briefkasten austauschbares Namensschild | Ebenhard', price:76.49, uvp:89.99, ab:true, rating:5, reviews:253, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'hermann', name:'Briefkasten mit Lasergravur | Hermann', price:84.99, uvp:99.99, rating:5, reviews:160, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'lepo', name:'Briefkasten Anthrazit RAL 7016 Gravur | Lepo 2', price:126.65, uvp:149, rating:4.5, reviews:20, badge:SALE, sw:'' },
    { id:'zaun', name:'Briefkasten für Zaunmontage | Zaunbriefkasten | personalisiert mit Gravur | Anthrazit RAL 7016 | Emma', price:126.65, uvp:149, rating:4.5, reviews:7, badge:SALE, sw:'' },
    { id:'emma2', name:'Briefkasten für Zaunmontage | Zaunbriefkasten | personalisiert mit Gravur | Anthrazit RAL 7016 | Emma 2', price:126.65, uvp:149, rating:5, reviews:4, badge:SALE, sw:'' },
    { id:'moris', name:'Briefkasten aus Edelstahl | personalisiert mit Gravur | Zeitungsfach optional | Moris', price:126.65, uvp:149, ab:true, rating:4.5, reviews:31, badge:SALE, sw:'7016 9016 9007 703 es wf' },
    { id:'schneider', name:'Durchwurfbriefkasten | Mauerdurchwurf-Briefkasten | personalisiert mit Gravur | Edelstahl-Namensschild | Anthrazit RAL7016 | Nora', price:102, uvp:120, rating:5, reviews:3, badge:SALE, sw:'' },
    { id:'gienger', name:'Briefkasten Design | Modell-G', price:84.99, uvp:99.99, rating:5, reviews:37, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'flora', name:'Briefkasten mit Blumenkasten | personalisiert mit Gravur | Edelstahl-Namensschild | Siebert Frame J', price:101.15, uvp:119, ab:true, rating:5, reviews:6, badge:SALE, sw:'7016 9016 9007 703 9005 wf' },
    { id:'stencil2-wand', name:'Briefkasten mit Lasergravur | Stencil 2', price:84.99, uvp:99.99, rating:5, reviews:13, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'lepo1', name:'Briefkasten aus hochwertigem Stahl pulverbeschichtet | personalisiert mit Gravur | Lepo 1', price:126.65, uvp:149, rating:5, reviews:10, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'bk212-zf', name:'Briefkasten mit Zeitungsfach | RAL7016 Anthrazitgrau | BK212-RE-ZF', price:84.99, uvp:99.99, rating:5, reviews:13, badge:SALE, sw:'' },
    { id:'albrecht', name:'Briefkasten mit zwei Edelstahl-Namensschildern | personalisiert mit Gravur | Albrecht', price:84.99, uvp:99.99, ab:true, rating:5, reviews:132, badge:SALE, sw:'7016 9016 9007 703 9005 es' },
    { id:'lepo3', name:'Briefkasten Anthrazit Edelstahl | Lepo 3', price:143.65, uvp:169, rating:5, reviews:9, badge:SALE, sw:'' },
    { id:'hermann-funk', name:'Briefkasten mit Funkklingel | personalisiert mit Gravur | Edelstahl-Namensschild | mit Zeitungsfach | Hermann', price:126.65, uvp:149, rating:5, reviews:19, badge:SALE, sw:'7016 9007 703 9005' },
    { id:'siebert-sf', name:'Briefkasten mit Sichtfenster | Personalisiert mit Gravur | Edelstahl-Namensschild | Siebert SF', price:92.65, uvp:109, ab:true, rating:5, reviews:36, badge:SALE, sw:'7016 9016 9007 703 9005 es wf' },
    { id:'anton2', name:'Briefkasten Holzoptik Eiche | Anthrazit RAL7016 mit Edelstahl Namensschild | Anton 2', price:84.99, uvp:99.99, rating:5, reviews:20, badge:SALE, sw:'' },
    { id:'nora2', name:'Durchwurfbriefkasten | Mauerdurchwurf-Briefkasten | mit austauschbarem Namensschild | Anthrazit RAL7016 | Nora 2', price:102, uvp:120, rating:5, reviews:3, badge:SALE, sw:'' },
    { id:'alves3', name:'Standbriefkasten mit Zeitungsfach aus hochwertigem Stahl | Alves 3', price:169.15, uvp:199, rating:5, reviews:9, badge:SALE, sw:'7016 9007 703' },
    { id:'alves2', name:'Standbriefkasten mit Zeitungsfach aus hochwertigem Stahl | Alves 2', price:160.65, uvp:189, rating:5, reviews:23, badge:SALE, sw:'7016 9007 703' },
    { id:'siebert-stand', name:'Standbriefkasten aus hochwertigem Stahl | Siebert', price:135.15, uvp:159, ab:true, rating:5, reviews:99, badge:SALE, sw:'7016 9016 9007 703 9005 es' },
    { id:'lessing', name:'Standbriefkasten mit Zeitungsfach aus hochwertigem Stahl | Alves', price:160.65, uvp:189, rating:5, reviews:44, badge:SALE, sw:'7016 9007 703' },
    { id:'hugo2', name:'Briefkasten Unterputz | personalisiert mit Gravur | Edelstahl-Namensschild | Hugo 2', price:92.65, uvp:109, rating:5, reviews:36, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'siebert2', name:'Briefkasten | austauschbares Namensschild | Siebert 2', price:67.99, uvp:79.99, rating:5, reviews:10, badge:SALE, sw:'703 9007 9005 9016' },
    { id:'anton', name:'Briefkasten Holzoptik Eiche mit Edelstahl Namensschild | Anton', price:84.99, uvp:99.99, rating:4.5, reviews:11, badge:SALE, sw:'' },
    { id:'hoffmann', name:'Briefkasten mit austauschbarem Namensschild | Hoffmann', price:67.99, uvp:79.99, rating:5, reviews:31, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'stelio', name:'Briefkasten pulverbeschichtet | Lasergravur | Stelio', price:76.49, uvp:89.99, rating:5, reviews:26, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'enno', name:'Briefkasten mit Edelstahl-Namensschild | Enno', price:76.49, uvp:89.99, ab:true, rating:5, reviews:36, badge:SALE, sw:'7016 9016 9007 703 9005 es' },
    { id:'zeppelin', name:'Briefkasten Design Anthrazit Edelstahl | Zeppelin', price:84.99, uvp:99.99, rating:5, reviews:33, badge:SALE, sw:'' },
    { id:'stencil', name:'Briefkasten mit Lasergravur | Stencil', price:84.99, uvp:99.99, rating:5, reviews:100, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'lepo-stahl', name:'Briefkasten aus hochwertigem Stahl pulverbeschichtet | Lepo', price:118.15, uvp:139, rating:5, reviews:7, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'thobe', name:'Briefkasten mit Namensschild aus Edelstahl | Thobe', price:84.99, uvp:99.99, ab:true, rating:5, reviews:12, badge:SALE, sw:'7016 9016 9007 703 9005 es' },
    { id:'gustav', name:'Briefkasten mit personalisierbarer Blende aus Edelstahl | Gustav', price:109.65, uvp:129, rating:5, reviews:4, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'svena', name:'Briefkasten mit personalisierter Edelstahlblende und Sichtfenstern | Svena', price:92.65, uvp:109, rating:5, reviews:4, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'oltmann', name:'Briefkasten Stahl Sichtfenster | Oltmann', price:84.99, uvp:99.99, rating:5, reviews:23, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'neumann', name:'Design Briefkasten | Neumann', price:72.24, uvp:84.99, rating:5, reviews:16, badge:SALE, sw:'9007 703 9005' },
    { id:'castor', name:'Unterputz Briefkasten hochwertiger Stahl | Hugo', price:76.49, uvp:89.99, rating:5, reviews:21, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'hoffmann-sf', name:'Briefkasten mit Sichtfenster | mit austauschbarem Namensschild | Hoffmann SF', price:76.49, uvp:89.99, rating:5, reviews:9, badge:SALE, sw:'7016 9007 703 9016 9005' },
    { id:'cube-wand', name:'Briefkasten hochwertiger Stahl Sichtfenster | Cube', price:84.99, uvp:99.99, rating:4.5, reviews:31, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'modell01', name:'Briefkasten Anthrazit Gravur optional mit Zeitungsfach | Modell01', price:152.15, uvp:179, rating:5, reviews:8, badge:SALE, sw:'' },
    { id:'hoffmann-ns', name:'Briefkasten austauschbares Namensschild | Hoffmann', price:92.65, uvp:109, rating:5, reviews:12, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'anton-edelstahl', name:'Briefkasten aus Edelstahl in Holzoptik Eiche | Anton', price:76.49, uvp:89.99, rating:5, reviews:4, badge:SALE, sw:'' },
    { id:'anton-anthrazit', name:'Briefkasten Anthrazitgrau + Holzoptik Eiche | Anton', price:76.49, uvp:89.99, rating:5, reviews:3, badge:SALE, sw:'' },
    { id:'masiva-eiche', name:'Briefkasten Echtholz Eiche Edelstahl | Masiva', price:288.15, uvp:339, rating:4.5, reviews:7, badge:SALE, sw:'' },
    { id:'modell02', name:'Briefkasten Edelstahl Gravur optional | Modell02', price:220.15, uvp:259, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9005' },
    { id:'masiva-anthrazit', name:'Briefkasten Anthrazit Gravur optional | Masiva', price:237.15, uvp:279, rating:5, reviews:2, badge:SALE, sw:'' },
    { id:'masiva-laerche', name:'Briefkasten Edelstahl Echtholz Lärche | Masiva', price:288.15, uvp:339, rating:4, reviews:2, badge:SALE, sw:'' },
    { id:'bk212-ns', name:'Briefkasten in Anthrazit | BK212 mit austauschbarem Namensschild', price:76.49, uvp:89.99, rating:5, reviews:7, badge:SALE, sw:'' },
    { id:'thobe-stand', name:'Standbriefkasten | inkl. Namensschild aus Edelstahl | Thobe', price:143.65, uvp:169, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'modell-g-stand', name:'Standbriefkasten | Modell G', price:143.65, uvp:169, rating:4.5, reviews:21, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'ebenhard-stand', name:'Standbriefkasten | Namensschild austauschbar | Ebenhard', price:131.75, uvp:155, rating:5, reviews:4, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'cube-stand', name:'Standbriefkasten Anthrazit hochwertiger Stahl | Cube', price:130.9, uvp:154, rating:5, reviews:11, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'enno-stand', name:'Standbriefkasten mit Edelstahl-Namensschild und Edelstahl-Ständer | Enno', price:140.25, uvp:165, rating:5, reviews:2, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'stencil-stand', name:'Standbriefkasten mit Gravur aus Edelstahl | Stencil', price:126.65, uvp:149, rating:5, reviews:33, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'oltmann-stand', name:'Standbriefkasten Sichtfenster | Oltmann', price:143.65, uvp:169, rating:4.5, reviews:11, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'hoffmann-stand-pe', name:'Standbriefkasten aus hochwertigem Stahl | Namensschild mit Papiereinleger | Hoffmann', price:126.65, uvp:149, rating:3.5, reviews:3, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'stand01', name:'Standbriefkasten Anthrazit Gravur + Zeitungsfach optional | 01', price:245.65, uvp:289, rating:5, reviews:2, badge:SALE, sw:'' },
    { id:'neumann-stand', name:'Design Standbriefkasten mit Standfuß aus Edelstahl | Neumann', price:131.75, uvp:155, rating:4.5, reviews:3, badge:SALE, sw:'9007 703 9005' },
    { id:'gustav-stand', name:'Standbriefkasten Anthrazit RAL 7016 Namensschild | Gustav', price:169.15, uvp:199, rating:5, reviews:5, badge:SALE, sw:'' },
    { id:'hermann-stand', name:'Standbriefkasten | Standfuß aus Edelstahl | mit Lasergravur | Hermann', price:143.65, uvp:169, rating:4.5, reviews:9, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'hoffmann-stand', name:'Standbriefkasten Anthrazit austauschbares Namensschild | Hoffmann', price:143.65, uvp:169, rating:5, reviews:12, badge:SALE, sw:'' },
    { id:'cube-stand-sf', name:'Standbriefkasten Anthrazit Sichtfenster | Cube', price:135.15, uvp:159, rating:5, reviews:14, badge:SALE, sw:'' },
    { id:'stencil2', name:'Edelstahl Standbriefkasten Mehrfamilienhaus | Stencil', price:254.15, uvp:299, rating:5, reviews:1, badge:SALE, sw:'7016 9016 9007 703 9005' },
    { id:'hermann-mfh-edelstahl', name:'Edelstahl Standbriefkasten Mehrfamilienhaus Lasergravur | Hermann', price:271.15, uvp:319, rating:5, reviews:2, badge:SALE, sw:'7016 9007 703 9005' },
    { id:'siebert-mfh-edelstahl', name:'Edelstahl Standbriefkasten Mehrfamilienhaus mit Lasergravur | Siebert', price:254.15, uvp:299, ab:true, rating:5, reviews:11, badge:SALE, sw:'7016 9016 9007 703 9005 es' },
    { id:'oltmann-mfh', name:'Standbriefkasten Mehrfamilienhaus Anthrazit Edelstahlleiste | Oltmann', price:245.65, uvp:289, rating:5, reviews:1, badge:SALE, sw:'' },
    { id:'svena-mfh', name:'Standbriefkasten Mehrfamilienhaus Anthrazit Edelstahlleiste | Svena', price:245.65, uvp:289, rating:5, reviews:1, badge:SALE, sw:'' },
    { id:'stencil-mfh', name:'Standbriefkasten Mehrfamilienhaus Anthrazit Gravurleiste | Stencil', price:245.65, uvp:289, rating:5, reviews:1, badge:SALE, sw:'' },
    { id:'hermann-mfh', name:'Standbriefkasten Mehrfamilienhaus Anthrazit Lasergravur | Hermann', price:262.65, uvp:309, rating:5, reviews:1, badge:SALE, sw:'' },
    { id:'siebert-mfh', name:'Standbriefkasten Mehrfamilienhaus Anthrazit RAL 7016 Lasergravur | Siebert', price:245.65, uvp:289, rating:4.5, reviews:8, badge:SALE, sw:'' },
    { id:'cube', name:'Standbriefkasten Mehrfamilienhaus Anthrazit Sichtfenster | Cube', price:245.65, uvp:289, rating:5, reviews:2, badge:SALE, sw:'' },
    { id:'hoffmann-edelstahl', name:'Standbriefkasten Mehrfamilienhaus austauschbares Namensschild | Hoffmann', price:262.65, uvp:309, rating:5, reviews:2, badge:SALE, sw:'' },
    { id:'funk02', name:'Briefkasten Funkklingel Anthrazit Edelstahl Gravur optional | 02', price:245.65, uvp:289, rating:4.5, reviews:4, badge:SALE, sw:'' },
    { id:'lepo2-funk', name:'Briefkasten Funkklingel Anthrazit Gravur optional | Lepo 2', price:160.65, uvp:189, rating:5, reviews:5, badge:SALE, sw:'' },
    { id:'siebert-funk', name:'Briefkasten mit Funkklingel | personalisiert mit Gravur | Edelstahl-Namensschild | mit Zeitungsfach | Siebert', price:135.15, uvp:159, rating:5, reviews:25, badge:SALE, sw:'7016 9007 703 9005' },
    { id:'stencil-funk', name:'Briefkasten mit Funkklingel | personalisiert mit Gravur | Edelstahl-Namensschild | mit Zeitungsfach | Stencil', price:126.65, uvp:149, rating:5, reviews:7, badge:SALE, sw:'7016 9007 703 9005' },
    { id:'funk01', name:'Briefkasten mit Funkklingel Anthrazit Edelstahl | 01', price:194.65, uvp:229, rating:5, reviews:4, badge:SALE, sw:'' },
    { id:'funk02-stand', name:'Standbriefkasten Funkklingel Anthrazit Edelstahl Gravur optional | 02', price:322.15, uvp:379, rating:5, reviews:5, badge:SALE, sw:'' }
  ];

  /* Shop data (vergleich-daten.js, generated from the JTL export 02.11.2026 by tools/build_vergleich_daten.py):
     every card takes its main image (hotlinked shop image, local category photo as offline fallback),
     colours and filter attributes from the shop — the same values the comparison shows. Name, price,
     UVP, rating and reviews stay as listed on the live category page. Montage/Material can have several
     values (variants) → montages[] / materials[]. */
  function fallbackImg(p) {
    var f = p.f || {};
    if ((f.mo || []).indexOf('Unterputz') !== -1) return 'Product%20Image/unterputz-briefkaesten.webp';
    if ((f.kt || []).length) return 'Product%20Image/briefkasten-klingel-sprechanlage.webp';
    if ((f.mo || []).indexOf('Standmontage') !== -1) return 'Product%20Image/standbriefkaesten.webp';
    if ((f.fa || []).indexOf('2') !== -1) return 'Product%20Image/mehrfamilien-briefkaesten.webp';
    return IMG;
  }
  (function () {
    var D = window.MTZ_VGL_DATA && window.MTZ_VGL_DATA.briefkasten;
    PRODUCTS.forEach(function (p) {
      p.colors = []; p.f = {};
      var d = D && D[p.id], c = d && d.card;
      if (c) {
        p.colors = c.colors.slice(); p.f = c.f || {}; p.faecher = c.faecher; p.zeitung = c.zeitung;
        p.montages = c.montages; p.montage = c.montages[0] || null;
        p.materials = c.materials; p.material = c.materials[0] || null;
        p.klingel = c.klingel; p.sprech = c.sprech; p.paket = c.paket; p.blumenkasten = c.blumenkasten;
      }
      p.img = fallbackImg(p);            /* local photo — offline fallback (card + comparison) */
      p.shopImg = (d && d.img) || null;  /* real shop main image, hotlinked */
    });
  })();
  function hasVal(p, f, v) { var arr = p[f + 's']; return arr ? arr.indexOf(v) !== -1 : p[f] === v; }
  function faecherOk(p, k) { return k === 'paketfach' ? !!p.paket : (k === '3+' ? +p.faecher >= 3 : p.faecher === k); }
  window.MTZ_PRODUCTS = PRODUCTS;   /* hook for the Vergleichen add-on */
  window.MTZ_LENS = 'briefkasten';  /* tells the add-on which comparison lens to use */

  /* Hotlinked shop images fall back to the local photo when offline / blocked. */
  document.addEventListener('error', function (e) {
    var t = e.target, fb = t && t.tagName === 'IMG' && t.getAttribute('data-fallback');
    if (fb && t.getAttribute('src') !== fb) t.setAttribute('src', fb);
  }, true);

  var TOTAL = 79; // live headline figure („79 Artikel") — equals PRODUCTS.length

  /* ---- State ---- */
  var active = { color: [], fa: [], kt: [], mo: [], zf: [], ns: [], mk: [],
                 zeitung: [], faecher: [], montage: [], zusatz: [], material: [], door: [] };   /* 2nd row: inactive inline advisor only */
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
    if (a.faecher && a.faecher.length && !a.faecher.some(function (k) { return faecherOk(p, k); })) return false;
    if (a.zeitung && a.zeitung.length && a.zeitung.indexOf(p.zeitung) === -1) return false;
    if (a.montage && a.montage.length && !a.montage.some(function (v) { return hasVal(p, 'montage', v); })) return false;
    if (a.door && a.door.length && !a.door.some(function (v) { return hasVal(p, 'montage', 'wand') && (v === 'seite' ? !!p.seitentuer : true); })) return false;
    if (a.material && a.material.length && !a.material.some(function (v) { return hasVal(p, 'material', v); })) return false;
    if (a.zusatz && a.zusatz.length && !a.zusatz.some(function (k) {
      return k.indexOf('+') !== -1 ? k.split('+').every(function (x) { return !!p[x]; }) : !!p[k];
    })) return false;
    return true;
  }
  function matches(p) { return matchesWith(p, active); }

  /* ---- Dynamic facets ------------------------------------------------------
     When at least one filter is selected, every facet recomputes against the
     current selection: each option shows the real number of matching products
     and options with none are hidden (e.g. picking Unterputz leaves only the
     colours actually available wall-recessed). With no filter active the curated
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

  function activeCount() {
    return Object.keys(active).reduce(function (n, g) { return n + active[g].length; }, 0);
  }

  /* ---- Product card (data as on the live card: badge, Metzler, stars + review count,
         name, „ab" only where the shop shows it, current price + struck UVP, colour bubbles) ---- */
  function card(p) {
    var c = el('article', 'pcard');
    c.dataset.id = p.id;   /* hook for the Vergleichen add-on (vergleichen.js) */
    var badge = p.badge ? '<span class="pcard__badge pcard__badge--' + p.badge.type + '">' + p.badge.text + '</span>' : '';
    var priceBlock =
      (p.uvp ? '<span class="pcard__uvp">' + euro(p.uvp) + '</span>' : '') +
      (p.ab ? '<span class="pcard__ab">ab</span> ' : '') +
      '<span class="pcard__price' + (p.uvp ? ' pcard__price--sale' : '') + '">' + euro(p.price) + '</span>';
    var rating = p.rating ? '<span class="pcard__rating">' + stars(p.rating) + (p.reviews ? '<span class="pcard__reviews">(' + p.reviews + ')</span>' : '') + '</span>' : '';

    c.innerHTML =
      '<div class="pcard__media">' +
        badge +
        '<img class="pcard__img" src="' + (p.shopImg || p.img || IMG) + '" data-fallback="' + (p.img || IMG) + '" alt="' + p.name + '" loading="lazy">' +
      '</div>' +
      '<div class="pcard__body">' +
        '<div class="pcard__top">' +
          '<span class="pcard__brand">Metzler</span>' +
          rating +
        '</div>' +
        '<h3 class="pcard__title"><a href="#">' + p.name + '</a></h3>' +
        '<div class="pcard__pricerow">' + priceBlock + '</div>' +
        colorRow(p.sw) +
      '</div>';
    return c;
  }

  /* ---- In-grid promo banner (spans the full grid width) ---- */
  function bannerEl() {
    var b = el('a', 'pgrid__banner');
    b.href = '#grid';
    b.setAttribute('aria-label', 'Original Metzler Briefkästen');
    b.innerHTML =
      '<picture>' +
        '<source media="(max-width: 767px)" srcset="Banner/promo-briefkasten-mobile.png">' +
        '<img src="Banner/promo-briefkasten-desktop.png" alt="Original Metzler Briefkästen – Vergleichssieger bei Vergleich.org. Langlebig & wetterfest, minimalistisches Design, sicheres Schließsystem, individuelle Gravur, flexibel montierbar." loading="lazy">' +
      '</picture>';
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
    // On page 1 (unfiltered), drop the promo banner into the grid as on the live
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
        var step = track.clientWidth * 0.7;
        /* pre-shift into the duplicate so there's always identical content to scroll into */
        if (dir === 1 && track.scrollLeft >= w) track.scrollLeft -= w;
        else if (dir === -1 && track.scrollLeft < step) track.scrollLeft += w;
        track.scrollBy({ left: dir * step, behavior: 'smooth' });
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
         neutral:true → "no preference" (adds no filter). Steps are skippable.
       Availability follows the live shop (edelstahl-tuerklingel.de/briefkasten):
       facet options are dataset-gated via gateHide — an option shows only while
       ≥1 product consistent with the earlier answers satisfies it; the one
       remaining hardcoded wohnIs() rule is pure curation (Zaun = single-family
       only, all live Zaunbriefkästen are 1er). */
    var QUIZ = [
      { q: 'Für welche Wohnsituation suchen Sie einen Briefkasten?', opts: [
        { label: 'Einfamilienhaus',  sub: 'für einen Haushalt',     group: 'faecher', value: '1', chip: 'Einfamilienhaus' },
        { label: 'Zweifamilienhaus', sub: 'für zwei Haushalte',     group: 'faecher', value: '2', chip: 'Zweifamilienhaus' },
        { label: 'Mehrfamilienhaus', sub: 'für mehrere Parteien',   group: 'faecher', value: '3+', chip: 'Mehrfamilienhaus' }   /* 3, 4, 6 Fächer */
      ]},
      /* Montage options are dataset-gated (live-shop parity): each mounting kind is
         offered only if the chosen Wohnsituation has such a model — Zweifamilien keeps
         Wand (Duo) + Stand, Mehrfamilien keeps Stand (Trias) + Unterputz (Quartett).
         Only "Am Zaun" stays curated to single-family (all Zaunbriefkästen are 1er). */
      { q: 'Wo möchten Sie Ihren Briefkasten anbringen?',
        info: '<h4>Montagearten</h4><dl><dt>An der Hauswand</dt><dd>aufgeschraubt – die häufigste und einfachste Lösung</dd><dt>Freistehend</dt><dd>mit Standfuß, unabhängig von einer Wand (z. B. an der Grundstücksgrenze)</dd><dt>Unterputz</dt><dd>flächenbündig in die Wand eingelassen, Entnahme wie üblich von vorne</dd><dt>Mauerdurchwurf</dt><dd>durch die Wand geführt: Einwurf außen, Post bequem von innen im Haus entnehmen</dd></dl>', infoLabel: 'Montagearten erklärt',
        opts: [
        { label: 'An der Hauswand',          sub: 'klassische Wandmontage',         group: 'montage', value: 'wand',      chip: 'Wandmontage', hideWhen: gateHide },
        { label: 'Freistehend mit Standfuß', sub: 'z. B. am Weg oder in der Einfahrt', group: 'montage', value: 'stand',  chip: 'Standmontage', hideWhen: gateHide },
        { label: 'Am Zaun',                  sub: 'als Zaunbriefkasten',            group: 'montage', value: 'stand',      chip: 'Zaunmontage', hideWhen: function () { return wohnIs('2') || wohnIs('3') || gateHide.call(this); } },
        { label: 'Unterputz – bündig in der Wand', sub: 'flächenbündig eingelassen, Entnahme von vorne', group: 'montage', value: 'unterputz', chip: 'Unterputz', hideWhen: gateHide },
        { label: 'Mauerdurchwurf',                 sub: 'Einwurf außen, Post bequem von innen entnehmen', group: 'montage', value: 'durchwurf', chip: 'Mauerdurchwurf', hideWhen: gateHide }
      ]},
      /* Paketfach/Zeitungsfach are dataset-gated: e.g. Mehrfamilien keeps "Auch
         Pakete" (Trias/Quartett anlagen have one) but loses "Zeitungen & Post";
         after picking Unterputz the whole step collapses and auto-skips — exactly
         how the live shop's facets behave. */
      { q: 'Was soll neben Briefpost noch hineinpassen?', opts: [
        { label: 'Auch Pakete',      sub: 'sicheres Paketfach für DHL, Hermes & Co.',           group: 'faecher', value: 'paketfach', chip: 'Paketfach', hideWhen: gateHide },
        { label: 'Zeitungen & Post', sub: 'mit integriertem Zeitungsfach, beidseitig befüllbar', group: 'zeitung', value: 'integriert', chip: 'Zeitungsfach', hideWhen: gateHide },
        { label: 'Nur Briefkasten',  sub: 'reine Briefpost – kein Extra-Fach nötig',            neutral: true, exclusive: true }   /* valid for every Wohnsituation — the live shop sells zf models ohne Zeitungsfach (BK212) */
      ]},
      /* Every Zusatz is dataset-gated (live-shop "intercom facets only where such
         products exist"): Klingel-options survive for Zwei-/Mehrfamilien via the
         anlagen (VDM10/Trias/Quartett); Sichtfenster & Blumenkasten drop out there
         automatically because only 1er models carry them. */
      { q: 'Welche Zusatzfunktion wünschen Sie sich?', opts: [
        { label: 'Funkklingel',              sub: 'kabellos und einfach nachrüstbar',          group: 'zusatz',   value: 'klingel',        chip: 'Funkklingel', hideWhen: gateHide },
        { label: 'Klingel mit Sprechanlage', sub: 'sehen und sprechen, wer vor der Tür steht', group: 'zusatz',   value: 'klingel+sprech', chip: 'Klingel & Sprechanlage', hideWhen: gateHide },
        { label: 'Sichtfenster',             sub: 'Ihren Posteingang auf einen Blick erkennen', group: 'material', value: 'acrylglas',     chip: 'Sichtfenster', hideWhen: gateHide },
        { label: 'Mit Blumenkasten',         sub: 'integrierter Pflanzkasten als Blickfang',   group: 'zusatz',   value: 'blumenkasten',   chip: 'Blumenkasten', hideWhen: gateHide },
        { label: 'Keine Zusatzfunktion',     sub: 'ein reiner Briefkasten',                    neutral: true }
      ]},
      /* Öffnungsrichtung — Aufputz (Wandmontage) only. Both options require montage:'wand',
         so Stand/Unterputz/Mauerdurchwurf skip this step. "Von der Seite" is offered only on
         the few wall-mount models flagged seitentuer, and never on Klingel/Sprechanlage boxes
         — so once a bell was chosen it gates out (and if only "Von oben" remains the step
         auto-skips). Recommendation images stay the shared placeholders. */
      { q: 'Wie soll sich die Klappe öffnen?',
        info: '<h4>Öffnungsrichtung</h4><dl><dt>Von oben</dt><dd>die Klappe öffnet nach unten – die klassische Bauform</dd><dt>Von der Seite</dt><dd>seitlich angeschlagene Tür; nicht mit Klingel/Sprechanlage kombinierbar</dd></dl>', infoLabel: 'Öffnungsrichtung erklärt',
        opts: [
        { label: 'Von oben',      sub: 'Klappe öffnet nach unten',   group: 'door', value: 'oben',  chip: 'Klappe oben',  hideWhen: gateHide },
        { label: 'Von der Seite', sub: 'seitlich angeschlagene Tür',  group: 'door', value: 'seite', chip: 'Tür seitlich', hideWhen: gateHide }
      ]},
      /* V4A option is dataset-gated too: when no rust-free model fits the answers
         so far (e.g. Mehrfamilien anlagen), the step is left with the neutral
         option only and auto-skips — no dead-end answers. */
      { q: 'Wie stark ist der Standort der Witterung ausgesetzt?',
        hideWhen: function () { return picks.some(function (arr) { return (arr || []).some(function (o) { return o.group === 'montage' && o.value === 'durchwurf'; }); }); },   /* Mauerdurchwurf sitzt geschützt in der Wand → Witterungsfrage entfällt */
        opts: [
        { label: 'Übliche, geschützte Lage',          sub: 'pulverbeschichteter Stahl genügt',         neutral: true },
        { label: 'Rau, exponiert oder in Küstennähe', sub: 'mit rostfreien V4A-Edelstahlleisten, salzwasserfest', group: 'material', value: 'edelstahl', chip: 'V4A-Edelstahl', hideWhen: gateHide }
      ]},
      /* Optik looks are dataset-gated like everything else: a look is offered only
         if a product consistent with ALL answers so far comes in it (so 2-/Mehr-
         familien drop Holz/Wunschfarbe, and Mehrfamilien — left with one look —
         skips the step entirely). */
      { q: 'Welche Optik passt zu Ihrem Zuhause?', opts: [
        { label: 'Klassische Farbe',     sub: 'z. B. Anthrazit, Schwarz, Weiß oder Grau',      group: 'colorset', values: ['anthrazit','braun','schwarz','eisenglimmer','weiss','grau'], chip: 'Klassische Farbe', swatch: 'linear-gradient(135deg,#1A171B,#383E42 38%,#B9BCC0 70%,#FFFFFF)', hideWhen: gateHide },
        { label: 'Edelstahl-Optik',      sub: 'gebürstete Edelstahl-Elemente, zeitlos',         group: 'colorset', values: ['edelstahl'], chip: 'Edelstahl-Optik', swatch: 'linear-gradient(135deg,#e9ebee,#a7adb4 55%,#d6d9dd)', hideWhen: function () { return doorIs('seite') || gateHide.call(this); } },
        { label: 'Natürliche Holzoptik', sub: 'Eiche oder Lärche',                             group: 'material', value: 'holz', chip: 'Holzoptik', swatch: 'linear-gradient(135deg,#b07b46,#7a5230)', hideWhen: function () { return doorIs('seite') || gateHide.call(this); } },
        { label: 'Wunschfarbe',          sub: 'individuell nach RAL',                          group: 'color', value: 'wunschfarbe', chip: 'Wunschfarbe', swatch: 'conic-gradient(from 90deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa,#e53935)', hideWhen: function () { return doorIs('seite') || gateHide.call(this); } }
      ]},
      { q: 'Wie möchten Sie Ihren Briefkasten beschriften?', opts: [
        { label: 'Lasergraviertes Namensschild', sub: 'jederzeit wechselbar', group: 'pref', value: 'Lasergravur' },
        { label: 'Namensschild mit Papiereinleger', sub: 'jederzeit wechselbar',                        group: 'pref', value: 'Namensschild' },
        { label: 'Edelstahl-Namensschild',       sub: 'hochwertig graviert',                            group: 'pref', value: 'Edelstahl-Namensschild' },
        { label: 'Ohne Beschriftung',            sub: 'neutral',                                        neutral: true }
      ]}
    ];

    var step = 0;   /* raw QUIZ index of the current step; hidden steps are jumped */
    var picks = [];   /* picks[i] = array of chosen option objects for step i (multi-select; [] = skipped) */
    var lead = { email: '', news: false };   /* optional e-mail capture (final step) */
    var STEPS = QUIZ.length;                  /* questions only — e-mail capture now lives on the result */

    /* ── Option availability + step skip (parity with kaufberater.html and with
       the live shop, edelstahl-tuerklingel.de): an option is offered only while
       at least one product consistent with the answers to all EARLIER steps
       satisfies it — zero-result options disappear (never greyed out), and a
       step left with ≤1 real option is skipped entirely. Mirrors the live
       filter behaviour where e.g. Unterputz collapses the Zeitungsfach/Klingel
       facets and Mehrfamilien drops wall-mount. ─────── */
    var IDX_WOHN = 0;
    QUIZ.forEach(function (q, i) {
      if (q.opts.some(function (o) { return o.group === 'faecher' && o.value === '1'; })) IDX_WOHN = i;
    });
    /* QUIZ index of the step an option belongs to (options are gated only by
       ANSWERED steps BEFORE their own, so going back never hides the answers
       that led here). */
    function stepOf(o) {
      for (var i = 0; i < QUIZ.length; i++) if (QUIZ[i].opts.indexOf(o) !== -1) return i;
      return QUIZ.length;
    }
    /* Products consistent with every facet answer on steps < limit (within a
       step: OR; across steps: AND; neutral/pref picks add no constraint).
       Falls back to the full catalogue if nothing matches, so the quiz never
       strands a step. */
    function poolBefore(limit) {
      var pool = PRODUCTS.filter(function (p) {
        for (var j = 0; j < limit; j++) {
          var facet = (picks[j] || []).filter(function (o) { return o.group && o.group !== 'pref'; });
          if (facet.length && !facet.some(function (o) { return sat(p, o); })) return false;
        }
        return true;
      });
      return pool.length ? pool : PRODUCTS;
    }
    /* Dataset-driven option hideWhen — `this` is the option (called as o.hideWhen()). */
    function gateHide() { var o = this; return !poolBefore(stepOf(o)).some(function (p) { return sat(p, o); }); }
    function optVisible(o) { return !(o.hideWhen && o.hideWhen()); }
    /* Has the shopper chosen the given Wohnsituation (Fächer count)? */
    function wohnIs(val) { return (picks[IDX_WOHN] || []).some(function (o) { return o.group === 'faecher' && o.value === val; }); }
    /* Has the shopper chosen a given Öffnungsrichtung? Used to keep the side-door
       path classic-colour-only (side boxes aren't offered in Edelstahl/Holz/Wunschfarbe). */
    function doorIs(val) { return picks.some(function (arr) { return (arr || []).some(function (o) { return o.group === 'door' && o.value === val; }); }); }
    /* A step is skipped when its own `hideWhen` holds OR it offers no real choice
       (a single visible option). */
    function stepHidden(i) {
      if (QUIZ[i].hideWhen && QUIZ[i].hideWhen()) return true;
      var n = 0;
      QUIZ[i].opts.forEach(function (o) { if (optVisible(o)) n++; });
      return n <= 1;
    }
    function visibleSteps() {
      var a = [];
      for (var i = 0; i < QUIZ.length; i++) if (!stepHidden(i)) a.push(i);
      return a;
    }
    function nextVisible(from) {                  /* returns QUIZ.length to signal "finish" */
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
      var priority = ['faecher', 'zusatz', 'montage', 'zeitung', 'material', 'colorset', 'color']; /* later = dropped first */
      var sel = [], prefs = [];
      picks.forEach(function (arr, idx) {
        if (stepHidden(idx)) return;             /* skipped step (e.g. Optik on Mehrfamilien) → its picks don't filter */
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
    function go(fn) {
      var cur = quizEl.querySelector('.advisor__step');
      if (cur) { cur.classList.remove('is-in'); cur.classList.add('is-out'); setTimeout(fn, 190); }
      else fn();
    }

    /* ── Recommendation-card helpers ── */
    function fmtPrice(n) { return n.toFixed(2).replace('.', ',') + ' €'; }
    var MAT = { edelstahl: 'Edelstahl', stahl: 'Galvanisierter Stahl', acrylglas: 'Acrylglas', holz: 'Holzoptik' };
    function specsOf(p) {
      return [
        (p.materials || [p.material]).filter(Boolean).map(function (m) { return MAT[m] || m; }).join(' oder ') || 'Material k. A.',
        labelFor('faecher', p.faecher) + (p.paket ? ' · inkl. Paketfach' : ''),
        labelFor('montage', p.montage) + ' · ' + labelFor('zeitung', p.zeitung)
      ];
    }
    function pickImg(p) {
      if (p.montage === 'stand')      return 'Product%20Image/standbriefkaesten.webp';
      if (+p.faecher >= 3)            return 'Product%20Image/mehrfamilien-briefkaesten.webp';
      if (p.montage === 'unterputz' || p.montage === 'durchwurf') return 'Product%20Image/unterputz-briefkaesten.webp';
      return 'Product%20Image/einfamilien-briefkasten.png';
    }
    /* Does product p satisfy a single facet pick? (mirrors matches()) */
    function sat(p, o) {
      if (o.group === 'color')    return p.colors.indexOf(o.value) !== -1;
      if (o.group === 'colorset') return (o.values || []).some(function (c) { return p.colors.indexOf(c) !== -1; });
      if (o.group === 'material') return hasVal(p, 'material', o.value);
      if (o.group === 'faecher')  return faecherOk(p, o.value);
      if (o.group === 'zusatz')   return o.value.indexOf('+') !== -1 ? o.value.split('+').every(function (x) { return !!p[x]; }) : !!p[o.value];
      if (o.group === 'zeitung')  return p.zeitung === o.value;
      if (o.group === 'montage')  return hasVal(p, 'montage', o.value);
      if (o.group === 'door')     return hasVal(p, 'montage', 'wand') && (o.value === 'seite' ? !!p.seitentuer : true);
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


    /* Markup for one question step (i = raw QUIZ index) — shared by renderStep and
       the height probe. Options gated out (hideWhen) are dropped but keep their
       original index k stable so the click handler still resolves s.opts[k]. */
    function stepInnerHTML(i) {
      var s = QUIZ[i];
      var cur = Array.isArray(picks[i]) ? picks[i] : [];
      var opts = s.opts.map(function (o, k) {
        if (o.hideWhen && o.hideWhen()) return '';   /* option not available for current picks → drop */
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
      /* Progress reflects only the steps actually shown for this path (the Optik
         step drops out for Mehrfamilien), so the count stays honest as it changes. */
      var vis = visibleSteps();
      var pos = vis.indexOf(i);
      var total = vis.length;
      var isLast = pos === total - 1;
      var dots = '';
      for (var d = 0; d < total; d++) dots += '<span class="' + (d < pos ? 'is-done' : (d === pos ? 'is-current' : '')) + '"></span>';
      var info = s.info ?
        '<span class="advisor__info" data-info>' +
          '<button type="button" class="advisor__info-btn" data-info-btn aria-label="' + (s.infoLabel || 'Mehr Infos') + '">i</button>' +
          '<span class="advisor__info-pop">' + s.info + '</span>' +
        '</span>' : '';
      var qrow = info
        ? '<div class="advisor__qrow"><h3 class="advisor__q">' + s.q + '</h3>' + info + '</div>'
        : '<h3 class="advisor__q">' + s.q + '</h3>';
      return '<div class="advisor__step">' +
          '<div class="advisor__progress">' +
            '<span class="advisor__progress-dots">' + dots + '</span>' +
            '<span class="advisor__progress-label">Schritt ' + (pos + 1) + ' von ' + total + '</span>' +
          '</div>' +
          qrow +
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
      /* Drop any pick that is no longer offered on this step (e.g. an Optik look
         picked earlier, then the shopper switched to Mehrfamilien). */
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
          var arr = picks[step], j, ix = -1;
          for (j = 0; j < arr.length; j++) { if (arr[j].label === o.label) { ix = j; break; } }
          if (o.exclusive) {
            /* Exclusive option (e.g. "Nur Briefkasten"): selecting it clears the rest;
               clicking it again clears it. */
            if (ix !== -1) arr.splice(ix, 1); else { arr.length = 0; arr.push(o); }
          } else {
            /* Selecting a normal option first removes any exclusive pick in this step. */
            for (j = arr.length - 1; j >= 0; j--) { if (arr[j].exclusive) arr.splice(j, 1); }
            ix = -1;
            for (j = 0; j < arr.length; j++) { if (arr[j].label === o.label) { ix = j; break; } }
            if (ix === -1) arr.push(o); else arr.splice(ix, 1);   /* toggle — multi-select, no auto-advance */
          }
          /* Re-sync every option button to the picks (exclusive toggles flip siblings). */
          quizEl.querySelectorAll('[data-opt]').forEach(function (b) {
            var bo = s.opts[+b.getAttribute('data-opt')];
            var onx = arr.some(function (p) { return p.label === bo.label; });
            b.classList.toggle('is-active', onx);
            b.setAttribute('aria-pressed', onx ? 'true' : 'false');
          });
        });
      });
      var back = quizEl.querySelector('[data-back]');
      if (back) back.addEventListener('click', function () { var p = prevVisible(step); if (p >= 0) go(function () { step = p; renderStep(); }); });
      var next = quizEl.querySelector('[data-next]');   /* Weiter advances; empty selection = skip; hidden steps are jumped */
      if (next) next.addEventListener('click', function () { if (!Array.isArray(picks[step])) picks[step] = []; go(function () { step = nextVisible(step); renderStep(); }); });

      /* Montagearten info tooltip (only on steps with s.info). */
      var infoBtn = quizEl.querySelector('[data-info-btn]');
      if (infoBtn) {
        var wrap = quizEl.querySelector('[data-info]');
        infoBtn.addEventListener('click', function (e) { e.stopPropagation(); wrap.classList.toggle('is-open'); });
        document.addEventListener('click', function () { wrap.classList.remove('is-open'); });
      }
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
      var headText = (res.kept.length && res.count >= 2)   /* count title only when it matches the 2 cards shown */
        ? '<strong>' + res.count + '</strong> passende Empfehlungen für Sie kuratiert'
        : 'Unsere Top-Empfehlungen für Sie';
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
      /* Mehrfamilien → offer the Briefkastenanlagen-Konfigurator for custom / many-party setups */
      var konfig = wohnIs('3')
        ? '<a class="advisor__konfig" href="https://edelstahl-tuerklingel.de/briefkastenanlage" target="_blank" rel="noopener">' +
            '<span class="advisor__konfig-thumb"><img src="Product%20Image/Briefkastenanlage/image%206.png" alt=""></span>' +
            '<span class="advisor__konfig-txt"><strong>Mehr Parteien oder eine individuelle Anlage?</strong>Stellen Sie Ihre Mehrfamilien-Briefkastenanlage im Konfigurator zusammen.</span>' +
            '<span class="advisor__konfig-go">Konfigurator öffnen<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-chevron-right"/></svg></span>' +
          '</a>'
        : '';
      return '<div class="advisor__result">' +
        '<div class="advisor__result-head"><h3 class="advisor__result-title">' + headText + '</h3></div>' +
        '<div class="advisor__recs">' + cards + '</div>' +
        konfig +
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
      }).sort(function (a, b) { return b.ratio - a.ratio || b.p.rating - a.p.rating || b.p.reviews - a.p.reviews; });
      var top = ranked.slice(0, 2);
      if (top.length < 2) {   /* always fill 2 cards — pad with the next-best alternatives (no lone card / blank) */
        var have = top.map(function (t) { return t.p.id; });
        var fill = PRODUCTS.filter(function (p) { return have.indexOf(p.id) === -1; })
          .map(function (p) { return { p: p, ratio: ratioOf(p) }; })
          .sort(function (a, b) { return b.ratio - a.ratio || b.p.rating - a.p.rating || b.p.reviews - a.p.reviews; });
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

  /* ---- Init ---- */
  buildSubnav();
  buildFacets();
  updateFacets();
  wireDrawer();
  wireSubnav();
  wireFooterAccordions();
  wireAiAdvisor();
  wireSeo();
  $('#clearAll').addEventListener('click', clearAll);
  $('#emptyReset').addEventListener('click', clearAll);
  render();
})();
