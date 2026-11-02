/* ============================================================
   Metzler — Vergleichen add-on + guided flow (PLP Türsprechanlagen)
   Shows the COMPLETE journey end-to-end:
     0 Ruhezustand  → "Vergleichen" control disabled (nothing selected)
     1 mark 1 item  → tray appears, still not enough (need ≥2)
     2 mark ≥2      → control ACTIVATES
     3 open         → side-by-side comparison
     4 only-diffs   → identical rows hidden
   A guided tour ("Flow ansehen") narrates and drives all of it.
   Decoupled layer; reads window.MTZ_PRODUCTS; PLP files untouched.
   ============================================================ */
(function () {
  'use strict';
  var MAX = 4, MIN = 2;
  /* 09b P0-1: one slot per category in localStorage (survives tabs/sessions, 30 days); compare MODE stays per session (cards stay hidden until "Vergleichen") */
  var KEY = 'mtz_vgl', OLDKEY = 'mtz_vgl_flow', MODEKEY = 'mtz_vgl_mode', TTL = 30 * 864e5, LENSKEY = window.MTZ_LENS || 'sprechanlage';
  var PAGES = { sprechanlage: 'index.html', briefkasten: 'briefkasten.html' };
  var PDP_URLS = { colson1: 'pdp/index.html' };   /* models with a product page in the prototype (same map as merkliste.js) */

  var SW = {anthrazit:'#383E42',braun:'#5A3B29',edelstahl:'linear-gradient(135deg,#e9ebee,#a7adb4 55%,#d6d9dd)',eisenglimmer:'linear-gradient(135deg,#3a3d40,#23262a)',grau:'#B9BCC0',schwarz:'#1A171B',weiss:'#FFFFFF',wunschfarbe:'conic-gradient(from 90deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa,#e53935)'};
  var SWL = {anthrazit:'Anthrazit',braun:'Braun',edelstahl:'Edelstahl',eisenglimmer:'Eisenglimmer',grau:'Grau',schwarz:'Schwarz',weiss:'Weiß',wunschfarbe:'Wunschfarbe'};
  var ZUT = {rfid:'RFID',gesicht:'Gesichtserkennung',pin:'PIN-Code',qr:'QR-Code',fingerprint:'Fingerprint'};

  function profile(kind){
    switch(kind){
      case 'audio': return {kameraaufloesung:null,sichtwinkel:null,nachtsicht:null,schutzart:'IP-geschützt',schlagfestigkeit:null,app_steuerung:true,sip_fritzbox:true,tueroeffner_relais:1,display:'separate Innenstation',poe:true};
      case 'xdm':   return {kameraaufloesung:'2 MP Full-HD',sichtwinkel:'Weitwinkel',nachtsicht:true,schutzart:'witterungsbeständig',schlagfestigkeit:null,app_steuerung:true,sip_fritzbox:true,tueroeffner_relais:2,display:'separate Innenstation (7″)',poe:false};
      case 'sdm':   return {kameraaufloesung:'2 MP Full-HD',sichtwinkel:'88° (Dual-Lens)',nachtsicht:true,schutzart:null,schlagfestigkeit:'IK07',app_steuerung:true,sip_fritzbox:true,tueroeffner_relais:2,display:'integriertes IPS-Touch-Display 1280×800',poe:true};
      default:      return {kameraaufloesung:'2 MP Full-HD',sichtwinkel:'146° / 82° (Ultraweitwinkel)',nachtsicht:true,schutzart:'IP65',schlagfestigkeit:'IK09',app_steuerung:true,sip_fritzbox:true,tueroeffner_relais:2,display:'separate Innenstation',poe:true};
    }
  }
  function familyOf(p){var n=p.name||'',s=(p.system||'').toLowerCase();if(/SDM10/i.test(n))return 'sdm';if(s==='bus'||/XDM10|2-Draht/i.test(n))return 'xdm';if(p.type==='audio'||/ADM10|Audio/i.test(n))return 'audio';return 'vdm';}
  function haushaltOf(p){if(p.klingel==='flex')return 'Skalierbar (1–500)';if(/Mehrfamilien/i.test(p.name))return 'Mehrfamilienhaus';if(p.klingel&&p.klingel!=='1')return 'Mehrfamilienhaus';return 'Einfamilienhaus';}
  function konfigOf(p){return !!p.briefkasten||p.klingel==='flex'||/SDM10|modular|Paketbox|Standbriefkast/i.test(p.name);}
  function euro(n){return (typeof n==='number')?n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,'.').replace(/\.(\d{2})$/,',$1')+' €':'—';}
  function klingelLabel(k){return k==='flex'?'Flexibel (1–500)':k;}

  var SRC=(window.MTZ_PRODUCTS||[]), BY_ID={};
  function designOf(p){var parts=String(p.name||'').split('|').map(function(s){return s.trim();}).filter(Boolean);return parts.length>1?parts[parts.length-1]:'–';}
  function namensschildOf(p){return /austauschbar/i.test(p.name||'')?'Austauschbar':'Lasergravur';}
  /* ---- Lens: Türsprechanlagen ---- */
  function enrichSprech(p){return {id:p.id,name:p.name,img:p.img,price:p.price,uvp:p.uvp,typ:(p.type==='audio'?'Audio':'Video'),system:(p.line||(p.system==='bus'?'2-Draht-BUS':'IP-System')),klingel:klingelLabel(p.klingel),haushalt:haushaltOf(p),zutritt:(p.tuer&&p.tuer.length)?p.tuer.map(function(k){return ZUT[k]||k;}):['Standard'],colors:p.colors||[],briefkasten:!!p.briefkasten,konfig:konfigOf(p),design:designOf(p),namensschild:namensschildOf(p),specs:profile(familyOf(p))};}

  /* ---- Lens: Briefkästen — Phase-0 model 01b (Design-first) ----
     Seeds for the lead models come from the live PDPs (Siebert, Ebenhard) and the catalogue titles;
     everything else is derived from the PLP fields and marked as prototype defaults. */
  var BK_SEED={
    siebert:  {colors:['anthrazit','schwarz','grau','eisenglimmer','weiss','edelstahl','wunschfarbe'],namensschild:'Gravurleiste V4A, wechselbar',einwurf:'Verdeckte Einwurfklappe',einwurfmass:[335,35],din:true,schloss:'Verdeckt, smart-fähig',smart:['Smart-Schloss (Fingerprint/RFID/App)','Einwurfsensor (App)'],zf_abdeckbar:true,aufstellung:['Wand','Stand','Zaun','Einbetonieren'],optionen:['Soft-Close','Entnahmesicherung','Zeitungsfach-Abdeckung','Keine-Werbung-Schild','Blumenkasten/Deko','Ständer'],kombi:['Funkklingel','Video-Sprechanlage VDM10'],abmessungen:'37 × 37 × 10,5 cm',gewicht:3.4},
    ebenhard: {colors:['anthrazit','schwarz','grau','eisenglimmer','weiss','edelstahl','wunschfarbe'],namensschild:'Austauschbares Namensschild (Einschub)',einwurf:'Offener Einwurfschlitz',din:true,schloss:'Standard-Zylinder',smart:[],zf_abdeckbar:true,aufstellung:['Wand','Stand'],optionen:['Entnahmesicherung','Zeitungsfach-Abdeckung','Keine-Werbung-Schild','Ständer'],kombi:[],abmessungen:'37 × 37 × 10,5 cm',gewicht:5.0},
    /* same line as Ebenhard, only the front differs → technically identical (twin demo + same-line guardrail) */
    'ebenhard-v2a':{namensschild:'Austauschbares Namensschild (Einschub)',ns_material:'Edelstahl V2A gebürstet',einwurf:'Offener Einwurfschlitz',din:true,schloss:'Standard-Zylinder',smart:[],zf_abdeckbar:true,aufstellung:['Wand','Stand'],optionen:['Entnahmesicherung','Zeitungsfach-Abdeckung','Keine-Werbung-Schild','Ständer'],kombi:[],korpus:'Galvanisierter Stahl, pulverbeschichtet',abmessungen:'37 × 37 × 10,5 cm',gewicht:5.0},
    hermann:  {namensschild:'Gravurleiste V4A, fest',einwurf:'Verdeckte Einwurfklappe',schloss:'Verdeckt hinter Einwurfklappe',abmessungen:'37 × 37 × 10,5 cm'},
    lepo:     {namensschild:'Ohne Namensschild',ns_material:null,einwurf:'Offener Einwurfschlitz',schloss:'Standard-Zylinder',optionen:['Entnahmesicherung','Keine-Werbung-Schild','Ständer']},
    kompakt:  {namensschild:'Ohne Namensschild',ns_material:null,einwurf:'Offener Einwurfschlitz',max_format:'DIN C5',din:false,schloss:'Standard-Zylinder',optionen:['Keine-Werbung-Schild']},
    gienger:  {einwurf:'Offener Einwurfschlitz',schloss:'Standard-Zylinder'},
    cube:     {sichtfenster:3,einwurf:'Offener Einwurfschlitz'},
    klar:     {sichtfenster:3,ns_material:'Acrylglas'},
    schneider:{einwurf:'Durchwurf (Unterputz)',aufstellung:['Unterputz'],optionen:[]},
    castor:   {einwurf:'Durchwurf (Unterputz)',aufstellung:['Unterputz'],optionen:[]},
    nordkap:  {korpus:'Edelstahl V4A (salzwasserfest)'},
    trias:    {beleuchtung:true},
    quartett: {beleuchtung:true,aufstellung:['Unterputz']},
    'vdm10-zf':{smart:['App (Video-Sprechanlage)'],beleuchtung:true}
  };
  function enrichBK(p){
    var nm=String(p.name||''),s=BK_SEED[p.id]||{},mat=p.material;
    var ns=s.namensschild||(/austauschbar/i.test(nm)?'Austauschbares Namensschild (Einschub)':(/ohne Gravur|Basic/i.test(nm)?'Ohne Namensschild':(/Edelstahl-Front|Edelstahlblende|gebürstet/i.test(nm)?'Gravierte Edelstahlblende':'Gravurleiste V4A, fest')));
    var auf=s.aufstellung||({wand:['Wand','Stand'],stand:['Stand'],unterputz:['Unterputz'],durchwurf:['Unterputz']}[p.montage]||['Wand']); if(/Zaun/i.test(nm))auf=['Wand','Zaun'];
    var isSet=!!(p.sprech||p.klingel);
    var kombi=s.kombi||[]; if(!s.kombi){if(p.sprech)kombi.push('Enthalten: Video-Sprechanlage');else if(p.klingel)kombi.push('Enthalten: Funkklingel');if(p.paket)kombi.push('Enthalten: Paketfach');}
    var opt=s.optionen||(p.montage==='wand'?['Entnahmesicherung','Keine-Werbung-Schild','Ständer']:['Entnahmesicherung','Keine-Werbung-Schild']); if(p.blumenkasten&&opt.indexOf('Blumenkasten/Deko')<0)opt=opt.concat(['Blumenkasten/Deko']);
    var korpus=s.korpus||({stahl:'Galvanisierter Stahl, pulverbeschichtet',edelstahl:'Edelstahl V4A',acrylglas:'Galvanisierter Stahl, pulverbeschichtet',holz:'Stahl, Holzoptik'}[mat]||'Galvanisierter Stahl, pulverbeschichtet');
    var nsMat=('ns_material' in s)?s.ns_material:(ns==='Ohne Namensschild'?null:(mat==='edelstahl'?'Edelstahl V4A gebürstet':'Edelstahl V4A gebürstet'));
    var zf={integriert:'Integriert (beidseitig befüllbar)',optional:'Optional (Zubehör)',ohne:'Ohne'}[p.zeitung]||'–';
    return {id:p.id,name:p.name,img:p.img||'Product%20Image/einfamilien-briefkasten.png',price:p.price,uvp:p.uvp,colors:s.colors||p.colors||[],konfig:!/ohne Gravur|Basic/i.test(nm),isSet:isSet,
      design:designOf(p),namensschild:ns,ns_material:nsMat,
      sichtfenster:s.sichtfenster!=null?s.sichtfenster:((mat==='acrylglas'||/Sichtfenster/i.test(nm))?3:0),
      einwurf:s.einwurf||'Verdeckte Einwurfklappe',einwurfmass:s.einwurfmass||null,max_format:s.max_format||'DIN C4 knickfrei',din:('din' in s)?s.din:true,
      schloss:s.schloss||'Verdeckt hinter Einwurfklappe',smart:s.smart||[],
      zeitungsfach:zf,zf_abdeckbar:('zf_abdeckbar' in s)?s.zf_abdeckbar:(p.zeitung==='integriert'),faecher:String(p.faecher||'1'),
      aufstellung:auf,korpus:korpus,abmessungen:s.abmessungen||(p.faecher==='1'&&p.montage==='wand'?'37 × 37 × 10,5 cm':null),gewicht:s.gewicht||null,beleuchtung:!!s.beleuchtung,
      optionen:opt,kombi:kombi};
  }

  /* imp:true = key row (shown by default); others sit behind "Alle technischen Details".
     better: 'min' | 'maxnum' | 'yes' → marks the strongest value per row. */
  /* hint = plain-language explanation shown via the (i) next to the row label (Baymard: explain technical attributes).
     Price has no "Bestwert" on purpose — a premium brand shows the price difference neutrally (delta), it doesn't crown the cheapest. */
  var ROWS_SPRECH=[
    {group:'Grundlagen'},
    {key:'price',label:'Preis',imp:true,soft:true,get:function(p){return 'ab '+euro(p.price);},hint:'Grundpreis der Standardausführung. Farbe, Namensschild und Gravur werden bei der Konfiguration festgelegt.'},
    /* soft = non-technical decider (design, nameplate, colours, price). When ONLY soft rows differ, the set is "technisch baugleich". */
    {key:'design',label:'Design-Linie',imp:true,soft:true,nohl:true,get:function(p){return p.design;},hint:'Formsprache der Frontplatte. Modelle derselben Baureihe teilen sich die Technik — die Linie bestimmt die Optik.'},
    {key:'namensschild',label:'Namensschild',imp:true,soft:true,get:function(p){return p.namensschild;},hint:'Lasergravur: dauerhaft und edel — für Eigentümer. Austauschbar: Name später wechselbar — ideal bei Mietobjekten.'},
    {key:'typ',label:'Typ',imp:true,get:function(p){return p.typ;},hint:'Video: Kamera an der Außenstation, Bild auf Innenstation/App. Audio: Sprechverbindung ohne Kamera.'},
    {key:'system',label:'System',imp:true,get:function(p){return p.system;},hint:'IP-System: Anbindung ans Heimnetzwerk (LAN/PoE). 2-Draht-BUS: nutzt vorhandene Klingelleitungen — ideal bei Modernisierung.'},
    {key:'haushalt',label:'Geeignet für',imp:true,get:function(p){return p.haushalt;}},
    {key:'klingel',label:'Anzahl Klingeltaster',imp:true,get:function(p){return p.klingel;},hint:'Ein Klingeltaster je Wohneinheit/Partei.'},
    {group:'Kamera & Bild'},
    {key:'kameraaufloesung',label:'Kameraauflösung',imp:true,spec:true,hint:'Auflösung des Kamerabilds — 2 MP entspricht Full-HD (1920 × 1080).'},
    {key:'sichtwinkel',label:'Sichtwinkel',imp:true,better:'maxnum',spec:true,hint:'Horizontaler / vertikaler Erfassungsbereich der Kamera. Je größer, desto mehr vom Eingangsbereich ist sichtbar.'},
    {key:'nachtsicht',label:'Nachtsicht',imp:true,better:'yes',spec:true,bool:true,hint:'Infrarot-Ausleuchtung für ein klares Bild bei Dunkelheit.'},
    {group:'Smart & Zutritt'},
    {key:'app_steuerung',label:'App-Steuerung',imp:true,better:'yes',spec:true,bool:true,hint:'Sehen, sprechen und öffnen per Smartphone — auch von unterwegs.'},
    {key:'sip_fritzbox',label:'SIP / FRITZ!Box',better:'yes',spec:true,bool:true,hint:'Ruf auf Telefone oder FRITZ!Fon über den SIP-Standard, ohne separate Innenstation.'},
    {key:'zutritt',label:'Zutritt',imp:true,get:function(p){return p.zutritt.join(' · ');},hint:'Schlüsselloser Zutritt: RFID-Transponder, PIN-Code, QR-Code oder Gesichtserkennung.'},
    {key:'tueroeffner_relais',label:'Türöffner-Relais',imp:true,better:'maxnum',spec:true,hint:'Schaltbare Ausgänge, z. B. für Haustür und Gartentor.'},
    {group:'Bauform & Schutz'},
    {key:'schutzart',label:'Schutzart',spec:true,hint:'IP-Schutzklasse gegen Staub und Wasser — IP65 = staubdicht und strahlwassergeschützt.'},
    {key:'schlagfestigkeit',label:'Schlagfestigkeit',spec:true,hint:'IK-Schutzklasse gegen Stöße (IK07 bis IK10). Höher = robuster.'},
    {key:'display',label:'Display / Innenstation',spec:true},
    {key:'poe',label:'PoE (Power over Ethernet)',better:'yes',spec:true,bool:true,hint:'Stromversorgung über das Netzwerkkabel — kein separates Netzteil an der Tür nötig.'},
    {key:'colors',label:'Farben',swatches:true,soft:true},
    {key:'briefkasten',label:'Mit Briefkasten/Paketbox',get:function(p){return p.briefkasten;},bool:true}
  ];

  /* Briefkästen lens — row plan from 01b_Phase-0 §5: Design first, technology after.
     set:true = Mehrfachauswahl (arrays, compared as sets → "zusätzlich / ohne"); better:'more' = larger set wins; 'rank' = ordered scale. */
  function g(k){return function(p){return p[k];};}
  var ROWS_BK=[
    {group:'Design & Namensschild'},
    {key:'price',label:'Preis',imp:true,soft:true,get:function(p){return 'ab '+euro(p.price);},hint:'Grundpreis der Standardausführung. Farbe, Gravur und Zubehör werden im Konfigurator festgelegt.'},
    {key:'design',label:'Design-Linie',imp:true,soft:true,nohl:true,get:g('design'),hint:'Die Front bestimmt die Optik. Viele Linien teilen sich denselben Korpus (37 × 37 × 10,5 cm).'},
    {key:'namensschild',label:'Namensschild',imp:true,soft:true,get:g('namensschild'),hint:'Gravurleiste: dauerhaft gelasert, edel — für Eigentümer. Austauschbares Namensschild (Einschub): Name später wechselbar — ideal bei Mietobjekten.'},
    {key:'ns_material',label:'Namensschild-Material',soft:true,get:g('ns_material')},
    {key:'colors',label:'Farben',imp:true,swatches:true,soft:true},
    {key:'sichtfenster',label:'Sichtfenster',imp:true,better:'maxnum',get:function(p){return p.sichtfenster?p.sichtfenster+' Fenster':'Keine';},hint:'Postkontrolle auf einen Blick, ohne den Kasten zu öffnen.'},
    {group:'Post & Einwurf'},
    {key:'einwurf',label:'Einwurf',imp:true,get:g('einwurf'),hint:'Verdeckte Einwurfklappe: Post bleibt trocken, Schloss geschützt. Offener Schlitz: schneller Einwurf, weniger Wetterschutz.'},
    {key:'max_format',label:'Max. Briefformat',imp:true,better:'rank',rank:['DIN Lang','DIN C5','DIN C4 knickfrei'],get:g('max_format'),hint:'DIN C4 (324 × 229 mm) = A4-Umschlag ungefaltet.'},
    {key:'einwurfmass',label:'Einwurfmaß',neutral:true,get:function(p){return p.einwurfmass?p.einwurfmass[0]+' × '+p.einwurfmass[1]+' mm':null;}},
    {key:'din',label:'Norm DIN EN 13724',bool:true,better:'yes',get:g('din'),hint:'Europäische Briefkastennorm: Mindestmaße, Einwurf, Entnahmesicherheit.'},
    {key:'zeitungsfach',label:'Zeitungsfach',imp:true,get:g('zeitungsfach')},
    {key:'zf_abdeckbar',label:'Zeitungsfach abdeckbar',bool:true,get:g('zf_abdeckbar')},
    {key:'faecher',label:'Fächer / Parteien',imp:true,get:g('faecher')},
    {group:'Schloss & Smart'},
    {key:'schloss',label:'Schloss',get:g('schloss'),hint:'Verdeckt hinter der Klappe: rostet nicht, friert nicht ein. Smart-fähig: kann durch Fingerprint-/RFID-/App-Schloss ersetzt werden.'},
    {key:'smart',label:'Smart-Optionen',imp:true,set:true,better:'more',get:g('smart'),hint:'Im Konfigurator wählbar: Öffnen ohne Schlüssel (Fingerprint, RFID, App) oder Einwurf-Benachrichtigung aufs Handy.'},
    {group:'Aufstellung & Bauform'},
    {key:'aufstellung',label:'Aufstellung',imp:true,set:true,get:g('aufstellung'),hint:'Wand: Befestigungsmaterial liegt bei. Stand: Ständer im Konfigurator wählbar. Zaun / Einbetonieren: passende Halter.'},
    {key:'korpus',label:'Korpusmaterial',neutral:true,get:g('korpus')},
    {key:'abmessungen',label:'Abmessungen (B × H × T)',neutral:true,get:g('abmessungen')},
    {key:'gewicht',label:'Gewicht',neutral:true,get:function(p){return p.gewicht?String(p.gewicht).replace('.',',')+' kg':null;}},
    {key:'beleuchtung',label:'Beleuchtung',bool:true,get:g('beleuchtung')},
    {group:'Optionen & Sets'},
    {key:'optionen',label:'Optional erweiterbar um',set:true,better:'more',get:g('optionen'),hint:'Erweiterungen, die direkt im Konfigurator mitbestellt werden können.'},
    {key:'kombi',label:'Kombi-Sets',set:true,get:g('kombi'),hint:'Als Set mit Klingel, Video-Sprechanlage oder Paketfach erhältlich — alles aus einer Hand.'}
  ];

  /* Guardrails (01b §5): same design line → variant hint; set vs. single model → price warning */
  function guardsBK(items){
    var gs=[];
    var lines=[];items.forEach(function(p){if(lines.indexOf(p.design)<0)lines.push(p.design);});
    if(lines.length===1&&items.length>1){
      var aufDiff=items.some(function(p){return p.aufstellung.join()!==items[0].aufstellung.join();});
      gs.push({type:'info',text:'Gleiche Design-Linie „'+lines[0]+'" — '+(aufDiff?'Wand- und Standvariante: der Ständer ist im Konfigurator wählbar.':'die Varianten unterscheiden sich nur in Front, Farbe oder Namensschild — wählen Sie diese in der Konfiguration.')});
    }
    var sets=items.filter(function(p){return p.isSet;});
    if(sets.length&&sets.length<items.length)gs.push({type:'warn',noDelta:true,text:'Set vs. Einzelmodell: „'+sets.map(function(p){return p.design;}).join('", „')+'" enthält Klingel bzw. Sprechanlage — der Preis ist nicht direkt vergleichbar.'});
    return gs;
  }
  function guardsSprech(items){
    var lines=[];items.forEach(function(p){if(lines.indexOf(p.design)<0)lines.push(p.design);});
    if(lines.length===1&&items.length>1)return [{type:'info',text:'Gleiche Design-Linie „'+lines[0]+'" — die Varianten unterscheiden sich in Klingeltastern bzw. Namensschild; die Technik ist identisch.'}];
    return [];
  }

  var LENSES={
    sprechanlage:{label:'Türsprechanlagen',enrich:enrichSprech,rows:ROWS_SPRECH,trio:['kai1','colson1','sdm10x'],guards:guardsSprech,twinHint:'entscheiden Sie nach Optik, Farbe und Namensschild',configNote:'Farbe, Namensschild und Gravur legen Sie auf der Produktseite bzw. in der Konfiguration fest — die Technik ist bei allen Modellen identisch.',step4:'Audio-Modelle zeigen bei Kamera-Werten neutral „–".'},
    briefkasten:{label:'Briefkästen',enrich:enrichBK,rows:ROWS_BK,trio:['siebert','ebenhard','hermann'],guards:guardsBK,designFirst:true,twinHint:'entscheiden Sie nach Optik, Namensschild und Farbe — das Produktbild ist hier der eigentliche Vergleich',configNote:'Farbe, Gravur, Ständer und Erweiterungen legen Sie im Konfigurator fest — Korpus und Technik sind bei diesen Modellen identisch.',step4:'Bei Briefkästen steht das Design zuerst, die Technik danach.'}
  };
  var LENS=LENSES[window.MTZ_LENS]||LENSES.sprechanlage;
  var ROWS=LENS.rows;
  SRC.forEach(function(p){BY_ID[p.id]=LENS.enrich(p);});

  var selected=[];
  var compareMode=false;   /* card compare fields are hidden until the user starts a comparison */
  var detailsOpen=false;   /* progressive disclosure of non-key rows (Version B) */
  var mem=null;   /* in-memory fallback when localStorage is blocked */
  function readStore(){
    var s=mem;try{var raw=localStorage.getItem(KEY);s=raw?JSON.parse(raw):mem;}catch(e){}
    if(!s||s.v!==2||!s.lenses||typeof s.lenses!=='object')s={v:2,lenses:{}};
    var now=Date.now();Object.keys(s.lenses).forEach(function(k){var sl=s.lenses[k];if(!sl||!Array.isArray(sl.ids)||!(now-Date.parse(sl.updatedAt)<TTL))delete s.lenses[k];});
    return s;
  }
  function ownIds(){var sl=readStore().lenses[LENSKEY];return (sl?sl.ids:[]).filter(function(id){return BY_ID[id];}).slice(0,MAX);}
  function loadSel(){
    selected=ownIds();
    var old=null;try{old=JSON.parse(sessionStorage.getItem(OLDKEY)||'null');}catch(e){}
    if(Array.isArray(old)){   /* migration from the session-only v1 key */
      try{sessionStorage.removeItem(OLDKEY);}catch(e){}
      if(!selected.length){selected=old.filter(function(id){return BY_ID[id];}).slice(0,MAX);if(selected.length){persist();storeMode(true);}}
    }
  }
  /* writes only this category's slot — read fresh first so a parallel tab of the other category is kept */
  function persist(){var s=readStore();if(selected.length)s.lenses[LENSKEY]={ids:selected.slice(),updatedAt:new Date().toISOString()};else delete s.lenses[LENSKEY];mem=s;try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
  function modeStored(){try{return !!(JSON.parse(sessionStorage.getItem(MODEKEY)||'{}')||{})[LENSKEY];}catch(e){return false;}}
  function storeMode(on){try{var m=JSON.parse(sessionStorage.getItem(MODEKEY)||'{}')||{};if(on)m[LENSKEY]=1;else delete m[LENSKEY];sessionStorage.setItem(MODEKEY,JSON.stringify(m));}catch(e){}}
  function setMode(on){compareMode=!!on;document.body.classList.toggle('vgl-mode',compareMode);storeMode(compareMode);}
  function isFull(){return selected.length>=MAX;}
  function canCompare(){return selected.length>=MIN;}

  function h(html){var d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  var SCALE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M4 6h6M4 12h6M4 18h6M20 8l-3-3-3 3M17 5v9"/></svg>';
  var IC_INFO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.6" r="0.6" fill="currentColor" stroke="none"/></svg>';
  var IC_OK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="8.4 12.5 11 15 16 9.5"/></svg>';
  var IC_LIMIT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13.5"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></svg>';
  function swHTML(colors,lim){lim=lim||8;var o='';(colors||[]).slice(0,lim).forEach(function(c){if(SW[c])o+='<span title="'+SWL[c]+'" style="background:'+SW[c]+'"></span>';});return '<span class="vgl-sw">'+o+'</span>';}

  var tray,traySlots,trayLabel,trayHint,trayCta,view,viewBody,viewCount,diffCb,diffN,scrollEl,toastEl,toastT,barBtn,cancelBtn,lastFocus;
  var IC_PRINT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';
  var IC_PLUS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  var IC_X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var IC_BM='<svg viewBox="0 0 27 26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 1.7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v22.9a.6.6 0 0 1-.97.47L13.5 19.4l-8.03 5.67a.6.6 0 0 1-.97-.47V1.7z"/></svg>';   /* same glyph as merkliste.js (DS icon canvas 27×26) */
  var IC_LINK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>';
  var IC_SEARCH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>';
  var liveEl,shareBtn,fromMkl=false,lastCleared=null,chipsAll=false,prevTitle=null;

  function buildChrome(){
    tray=h('<div class="vgl-tray" role="region" aria-label="Vergleichsauswahl">'+
      '<div class="vgl-tray__inner">'+
        '<div class="vgl-tray__status">'+
          '<span class="vgl-tray__label" aria-live="polite">Vergleich (0)</span>'+
          '<span class="vgl-tray__hint" aria-live="polite"></span>'+
        '</div>'+
        '<div class="vgl-tray__slots"></div>'+
        '<div class="vgl-tray__actions">'+
          '<button class="vgl-link" type="button" data-vgl="reset"><span class="vgl-m-hide">Vergleich leeren</span><span class="vgl-m-only">Leeren</span></button>'+
          '<button class="vgl-tray__cta" type="button" data-vgl="open" disabled>Vergleichen</button>'+
        '</div>'+
      '</div></div>');
    document.body.appendChild(tray);
    traySlots=tray.querySelector('.vgl-tray__slots');trayLabel=tray.querySelector('.vgl-tray__label');
    trayHint=tray.querySelector('.vgl-tray__hint');trayCta=tray.querySelector('[data-vgl="open"]');

    view=h('<div class="vgl-view" role="dialog" aria-modal="true" aria-labelledby="vglTitle" aria-hidden="true">'+
      '<div class="vgl-view__bar"><div class="vgl-view__bar-in">'+
        '<button class="vgl-back" type="button" data-vgl="back" hidden>'+IC_BM+'Merkliste</button>'+
        '<h2 class="vgl-view__title" id="vglTitle" tabindex="-1">Vergleich <span data-vgl="count">(0)</span></h2>'+
        '<label class="vgl-diff"><input type="checkbox" data-vgl="diff"><span class="vgl-switch" aria-hidden="true"></span>Nur Unterschiede <span class="vgl-diff__n" data-vgl="diffn"></span></label>'+
        '<button class="vgl-link vgl-link--share" type="button" data-vgl="share" title="Link zu diesem Vergleich kopieren">'+IC_LINK+'<span class="vgl-share__l"><span class="vgl-m-hide">Link kopieren</span><span class="vgl-m-only">Teilen</span></span></button>'+
        '<button class="vgl-link vgl-link--ic" type="button" data-vgl="print">'+IC_PRINT+'Drucken</button>'+
        '<button class="vgl-link" type="button" data-vgl="clear"><span class="vgl-m-hide">Vergleich leeren</span><span class="vgl-m-only">Leeren</span></button>'+
        '<button class="vgl-close" type="button" data-vgl="close" aria-label="Vergleich schließen"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'+
      '</div></div>'+
      '<div class="vgl-view__scroll"><div class="vgl-view__scroll-in" data-vgl="body"></div></div>'+
      '<div class="vgl-visually-hidden" aria-live="polite" aria-atomic="true" data-vgl="live"></div></div>');
    document.body.appendChild(view);liveEl=view.querySelector('[data-vgl="live"]');shareBtn=view.querySelector('[data-vgl="share"]');
    viewBody=view.querySelector('[data-vgl="body"]');viewCount=view.querySelector('[data-vgl="count"]');diffCb=view.querySelector('[data-vgl="diff"]');
    diffN=view.querySelector('[data-vgl="diffn"]');scrollEl=view.querySelector('.vgl-view__scroll');

    toastEl=h('<div class="vgl-toast" role="status" aria-live="polite"></div>');document.body.appendChild(toastEl);

    tray.addEventListener('click',function(e){var a=e.target.closest('[data-vgl]');if(a){var k=a.getAttribute('data-vgl');if(k==='reset')clearAll();if(k==='open')openView();return;}var rm=e.target.closest('[data-rm]');if(rm)toggle(rm.getAttribute('data-rm'),false);});
    view.addEventListener('click',function(e){
      if(addPanel&&!addPanel.contains(e.target)&&!(addAnchor&&addAnchor.contains(e.target)))closeAdd(false);   /* outside click closes the search */
      var pop=view.querySelector('.vgl-sharepop');if(pop&&!pop.contains(e.target)&&!e.target.closest('[data-vgl="share"]'))pop.remove();
      var opt=e.target.closest('[data-addid]');if(opt){chooseAdd(opt.getAttribute('data-addid'));return;}
      var a=e.target.closest('[data-vgl]');
      if(a&&a.getAttribute('data-vgl')==='body')a=null;   /* the body container carries data-vgl too — don't swallow chip/alt clicks */
      if(a){var k=a.getAttribute('data-vgl');
        if(k==='close')closeView();
        if(k==='clear')clearView();
        if(k==='undo-clear')undoClear();
        if(k==='details'){detailsOpen=!detailsOpen;renderView();focusIn('[data-vgl="details"]');}
        if(k==='morechips'){chipsAll=!chipsAll;renderView();focusIn('[data-vgl="morechips"]');}
        if(k==='add'){if(addPanel&&addAnchor===a)closeAdd(true);else openAddSearch(a);}
        if(k==='addgrid'){closeAdd(false);addFromGrid();}
        if(k==='addclose')closeAdd(true);
        if(k==='share')shareView(a);
        if(k==='sharepop-close'){var sp=view.querySelector('.vgl-sharepop');if(sp)sp.remove();if(shareBtn)shareBtn.focus();}
        if(k==='addmkl'){closeAdd(false);closeView();if(window.MTZ_MKL)window.MTZ_MKL.open();}
        if(k==='back'){if(window.MTZ_MKL)window.MTZ_MKL.open();}
        if(k==='print'){printView();}
        return;}
      var ti=e.target.closest('.vgl-i');if(ti){var was=ti.classList.contains('is-open');closeTip();if(!was){ti.classList.add('is-open');ti.setAttribute('aria-expanded','true');}return;}
      var j=e.target.closest('[data-jump]');if(j){jumpTo(j.getAttribute('data-jump'));return;}
      var alt=e.target.closest('[data-alt]');if(alt){var aid=alt.getAttribute('data-alt');if(toggle(aid,true)){var anm=shortName(BY_ID[aid]).main;toast(esc(anm)+' hinzugefügt.','ok');announce(anm+' hinzugefügt. Vergleich mit '+selected.length+' Modellen.');scrollEl.scrollTop=0;focusIn('.vgl-ph__rm[data-rm="'+aid+'"]');}return;}
      var rm=e.target.closest('[data-rm]');if(rm){removeColumn(rm.getAttribute('data-rm'));return;}
      var go=e.target.closest('[data-go]');
      if(go&&go.tagName==='A'){   /* real product page: remember the way back (P0-10), then navigate normally */
        try{sessionStorage.setItem('mtz_return',JSON.stringify({type:'vergleich',href:(PAGES[LENSKEY]||'index.html')+'?vergleich='+selected.map(encodeURIComponent).join(','),n:selected.length,lens:LENSKEY,t:Date.now()}));}catch(err){}
        return;
      }
      if(go)toast('Im Prototyp ohne '+(/Konfigurieren/.test(go.textContent)?'Konfigurator':'Produktseite')+'.','info');
    });
    view.addEventListener('keydown',function(e){if(e.key!=='Escape')return;
      if(addPanel){e.stopPropagation();closeAdd(true);return;}
      var pop=view.querySelector('.vgl-sharepop');if(pop){e.stopPropagation();pop.remove();if(shareBtn)shareBtn.focus();return;}
      var tip=view.querySelector('.vgl-i.is-open');if(tip){e.stopPropagation();closeTip();tip.focus();}});
    diffCb.addEventListener('change',renderView);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&view.classList.contains('is-open')&&!view.querySelector('.vgl-i.is-open')&&!addPanel&&!view.querySelector('.vgl-sharepop'))closeView();});
    /* (sticky product header stays a stable size — no scroll-driven resize, which caused a layout jump) */
    /* keep keyboard focus inside the dialog */
    view.addEventListener('keydown',function(e){if(e.key!=='Tab')return;var f=view.querySelectorAll('button:not([disabled]),input:not([disabled]),summary,[tabindex="0"]');if(!f.length)return;var first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
  }
  function printView(){
    var was=detailsOpen;detailsOpen=true;renderView();var det=viewBody.querySelector('.vgl-common');if(det)det.open=true;var d=new Date();view.querySelector('.vgl-view__bar-in').setAttribute('data-print','edelstahl-tuerklingel.de · '+LENS.label+' · '+d.toLocaleDateString('de-DE'));
    /* print rules apply only while the comparison is being printed (a plain PLP print stays the page) */
    var done=function(){document.body.classList.remove('vgl-printing');window.removeEventListener('afterprint',done);};
    document.body.classList.add('vgl-printing');window.addEventListener('afterprint',done);
    try{window.print();}catch(e){}
    setTimeout(done,1000);
    detailsOpen=was;renderView();
  }
  /* ---- P0-2: the comparison has an address (?vergleich=a,b,c) ---- */
  function pageUrl(ids){
    var q=location.search.replace(/^\?/,'').split('&').filter(function(kv){return kv&&!/^(vergleich|von)=/.test(kv);});
    if(ids&&ids.length>=MIN)q.push('vergleich='+ids.map(encodeURIComponent).join(','));
    return location.pathname+(q.length?'?'+q.join('&'):'')+location.hash;
  }
  function shareUrl(){return location.origin+location.pathname+'?vergleich='+selected.map(encodeURIComponent).join(',');}
  function setTitle(){
    if(prevTitle===null)prevTitle=document.title;
    var items=selected.map(function(id){return BY_ID[id];}).filter(Boolean);
    document.title=items.length>=MIN?'Vergleich: '+colLabels(items).map(function(l){return l.main;}).join(' vs. ')+' | Metzler':prevTitle;
  }
  function syncUrl(){if(!view.classList.contains('is-open'))return;try{history.replaceState(history.state,'',pageUrl(selected));}catch(e){}setTitle();}
  function shareView(btn){
    var url=shareUrl(),mobile=!!(window.matchMedia&&window.matchMedia('(max-width:47.99rem)').matches);
    if(mobile&&navigator.share){navigator.share({title:document.title,url:url}).catch(function(err){if(err&&err.name==='AbortError')return;copyLink(url,btn);});return;}
    copyLink(url,btn);
  }
  function copyLink(url,btn){
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(function(){shareDone(btn);},function(){sharePop(url,btn);});
    else sharePop(url,btn);
  }
  function shareDone(btn){
    var l=btn.querySelector('.vgl-share__l'),ic=btn.querySelector('svg'),oldL=l.innerHTML,oldIc=ic.outerHTML;
    btn.classList.add('is-done');l.textContent='Link kopiert';ic.outerHTML=IC_OK;
    clearTimeout(btn._t);btn._t=setTimeout(function(){btn.classList.remove('is-done');l.innerHTML=oldL;var c=btn.querySelector('svg');if(c)c.outerHTML=oldIc;},2000);
    announce('Link zum Vergleich kopiert.');
    toast('Link zum Vergleich kopiert.','ok');
  }
  /* no clipboard API: a read-only field to copy by hand */
  function sharePop(url,btn){
    var old=view.querySelector('.vgl-sharepop');if(old)old.remove();
    var pop=h('<div class="vgl-sharepop" role="group" aria-label="Link zum Vergleich"><label for="vglShareUrl">Link zum Vergleich</label><input id="vglShareUrl" type="text" readonly value="'+esc(url)+'"><button class="vgl-link" type="button" data-vgl="sharepop-close">Schließen</button></div>');
    btn.parentNode.insertBefore(pop,btn.nextSibling);
    var inp=pop.querySelector('input');inp.focus();inp.select();
  }
  /* ---- P0-9: add a model by search, without leaving the comparison ---- */
  var addPanel=null,addAnchor=null,addActive=-1;
  function norm(s){return String(s||'').toLowerCase().replace(/ä/g,'a').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ß/g,'ss');}
  function reviewsOf(id){for(var i=0;i<SRC.length;i++)if(SRC[i].id===id)return SRC[i].reviews||0;return 0;}
  function mklIdsHere(){try{return window.MTZ_MKL?window.MTZ_MKL.items().filter(function(it){return it.lens===LENSKEY&&!it.configId;}).map(function(it){return it.articleId||it.id;}):[];}catch(e){return [];}}
  function addGroups(q){
    var pool=Object.keys(BY_ID).map(function(id){return BY_ID[id];}).filter(function(p){return selected.indexOf(p.id)<0;});
    q=norm(q).trim();
    if(q){
      var toks=q.split(/\s+/);
      return [{h:null,list:pool.filter(function(p){var hay=norm([p.name,p.design,shortName(p).main,p.artNr||''].join(' '));return toks.every(function(t){return hay.indexOf(t)>-1;});}).slice(0,6)}];
    }
    var seen={},n=0,mk=[],sug=[];
    function take(p,arr){if(!p||seen[p.id]||selected.indexOf(p.id)>-1||n>=6)return;seen[p.id]=1;n++;arr.push(p);}
    mklIdsHere().forEach(function(id){take(BY_ID[id],mk);});
    var items=selected.map(function(id){return BY_ID[id];});
    if(items.length>=MIN&&analyze(items).twin)alternatives(items).forEach(function(o){take(o.p,sug);});
    pool.slice().sort(function(a,b){return reviewsOf(b.id)-reviewsOf(a.id);}).forEach(function(p){take(p,sug);});
    var g=[];if(mk.length)g.push({h:'Aus Ihrer Merkliste',list:mk});if(sug.length)g.push({h:'Vorschläge',list:sug});
    return g;
  }
  function renderAddList(){
    var inp=addPanel.querySelector('input'),ul=addPanel.querySelector('ul'),st=addPanel.querySelector('.vgl-addsearch__empty');
    var groups=addGroups(inp.value),html='',any=false;
    groups.forEach(function(g){
      if(g.h&&g.list.length)html+='<li class="vgl-addsearch__h" role="presentation">'+esc(g.h)+'</li>';
      g.list.forEach(function(p){any=true;var nm=shortName(p);html+='<li class="vgl-addopt" role="option" id="vglOpt-'+esc(p.id)+'" data-addid="'+esc(p.id)+'" aria-selected="false"><span class="vgl-addopt__img"><img src="'+esc(p.img)+'" alt=""></span><span class="vgl-addopt__t"><b>'+esc(nm.main)+'</b>'+(nm.sub?'<small>'+esc(nm.sub)+'</small>':'')+'<span class="vgl-addopt__p">ab '+euro(p.price)+'</span></span></li>';});
    });
    ul.innerHTML=html;addActive=-1;inp.removeAttribute('aria-activedescendant');
    inp.setAttribute('aria-expanded',String(any));
    st.textContent=any?'':'Kein passendes Modell bei '+LENS.label+' gefunden.';
    st.hidden=any;
  }
  function moveActive(d){
    var opts=addPanel.querySelectorAll('.vgl-addopt');if(!opts.length)return;
    if(addActive>-1)opts[addActive].setAttribute('aria-selected','false'),opts[addActive].classList.remove('is-active');
    addActive=(addActive+d+opts.length)%opts.length;
    var o=opts[addActive];o.setAttribute('aria-selected','true');o.classList.add('is-active');
    addPanel.querySelector('input').setAttribute('aria-activedescendant',o.id);
    try{o.scrollIntoView({block:'nearest'});}catch(e){}
  }
  function openAddSearch(anchor){
    closeAdd(false);
    addAnchor=anchor;
    var mobile=!!(window.matchMedia&&window.matchMedia('(max-width:47.99rem)').matches);
    var nM=mklCount();
    addPanel=h('<div class="vgl-addsearch'+(mobile?' is-sheet':'')+'" role="dialog" aria-label="Modell zum Vergleich hinzufügen">'+
      '<div class="vgl-addsearch__head"><label for="vglAddQ">Modell suchen</label><button class="vgl-addsearch__x" type="button" data-vgl="addclose" aria-label="Suche schließen">'+IC_X+'</button></div>'+
      '<div class="vgl-addsearch__field">'+IC_SEARCH+'<input id="vglAddQ" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="vglAddList" autocomplete="off" placeholder="'+(LENSKEY==='briefkasten'?'z. B. Siebert, Ebenhard':'z. B. VDM10, Colson')+'"></div>'+
      '<ul class="vgl-addsearch__list" id="vglAddList" role="listbox" aria-label="'+esc(LENS.label)+'"></ul>'+
      '<p class="vgl-addsearch__empty" role="status" hidden></p>'+
      '<div class="vgl-addsearch__foot"><button class="vgl-link" type="button" data-vgl="addgrid">Auf der Produktliste wählen</button>'+(nM?'<button class="vgl-link" type="button" data-vgl="addmkl">Aus der Merkliste ('+nM+')</button>':'')+'</div>'+
    '</div>');
    if(mobile){var scrim=h('<div class="vgl-addsearch__scrim" aria-hidden="true"></div>');view.appendChild(scrim);addPanel._scrim=scrim;}
    view.appendChild(addPanel);
    if(!mobile){   /* anchored to the add tile, kept inside the viewport */
      var r=anchor.getBoundingClientRect(),w=addPanel.offsetWidth,ht=addPanel.offsetHeight;
      var left=Math.max(16,Math.min(r.right-w,window.innerWidth-w-16)),top=Math.max(16,Math.min(r.top,window.innerHeight-ht-16));
      addPanel.style.left=left+'px';addPanel.style.top=top+'px';
    }
    var inp=addPanel.querySelector('input');
    inp.addEventListener('input',renderAddList);
    inp.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'){e.preventDefault();moveActive(1);}
      else if(e.key==='ArrowUp'){e.preventDefault();moveActive(-1);}
      else if(e.key==='Enter'){e.preventDefault();var opts=addPanel.querySelectorAll('.vgl-addopt');var o=opts[addActive>-1?addActive:0];if(o)chooseAdd(o.getAttribute('data-addid'));}
    });
    renderAddList();
    inp.focus();
  }
  function closeAdd(refocus){
    if(!addPanel)return;
    if(addPanel._scrim)addPanel._scrim.remove();
    addPanel.remove();addPanel=null;
    var a=addAnchor;addAnchor=null;
    if(refocus&&a&&document.contains(a))a.focus();
  }
  function chooseAdd(id){
    var keep=selected.length+1<MIN;   /* first model of an empty comparison: keep searching for the second */
    var anchorSel=addAnchor&&addAnchor.getAttribute('data-vgl');
    if(!keep)closeAdd(false);
    if(!toggle(id,true))return;
    var nm=shortName(BY_ID[id]).main;
    if(keep){
      announce(nm+' hinzugefügt. Wählen Sie ein weiteres Modell.');
      var a2=view.querySelector('[data-vgl="'+anchorSel+'"]');if(addPanel){addPanel.querySelector('input').value='';renderAddList();addPanel.querySelector('input').focus();}if(a2)addAnchor=a2;
      return;
    }
    announce(nm+' hinzugefügt. Vergleich mit '+selected.length+' Modellen.');
    focusIn('.vgl-ph__rm[data-rm="'+id+'"]');
  }
  function announce(m){if(!liveEl)return;liveEl.textContent='';setTimeout(function(){liveEl.textContent=m;},30);}
  function focusIn(sel){var el=view.querySelector(sel);(el||view.querySelector('#vglTitle')).focus();}
  /* remove a column: focus moves to the next column's remove control (or the add tile); 2 → 1 keeps the dialog open with the empty state */
  function removeColumn(id){
    var i=selected.indexOf(id),nm=shortName(BY_ID[id]).main;
    toggle(id,false);
    announce(nm+' entfernt. Vergleich mit '+selected.length+' Modellen.');
    if(selected.length<1){closeView();return;}
    var next=selected[Math.min(i,selected.length-1)];
    focusIn(selected.length>=MIN?'.vgl-ph__rm[data-rm="'+next+'"]':'[data-vgl="add"]');
  }
  /* "Vergleich leeren" inside the dialog: keeps the dialog open (empty state) and offers an inline undo */
  function clearView(){lastCleared=selected.slice();clearAll();announce('Vergleich geleert.');focusIn('[data-vgl="undo-clear"]');}
  function undoClear(){if(!lastCleared)return;var ids=lastCleared;lastCleared=null;setSelection(ids);syncAll();announce('Vergleich wiederhergestellt: '+selected.length+' Modelle.');focusIn('.vgl-ph__rm');}
  /* "Modell hinzufügen": back to the grid, first free card field focused */
  function addFromGrid(){
    closeView();
    var g=document.getElementById('productGrid');
    if(g)try{g.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}
    var free=null;if(g)g.querySelectorAll('.vgl-toggle input').forEach(function(i){if(!free&&!i.checked)free=i;});
    if(free)setTimeout(function(){free.focus({preventScroll:true});},350);
    toast('Wählen Sie ein weiteres Modell auf den Karten.','info');
  }
  /* (i) toggletip: click/Enter opens a real tooltip node (aria-describedby), Escape closes it first */
  function closeTip(){var o=view.querySelector('.vgl-i.is-open');if(o){o.classList.remove('is-open');o.setAttribute('aria-expanded','false');}}
  function mklCount(){try{if(!window.MTZ_MKL)return 0;return window.MTZ_MKL.items().filter(function(it){return it.lens===(window.MTZ_LENS||'sprechanlage')&&!it.configId&&BY_ID[it.articleId||it.id]&&selected.indexOf(it.articleId||it.id)<0;}).length;}catch(e){return 0;}}
  function jumpTo(key){
    var tr=viewBody.querySelector('tr[data-key="'+key+'"]');
    if(!tr&&!detailsOpen&&!diffCb.checked){detailsOpen=true;renderView();tr=viewBody.querySelector('tr[data-key="'+key+'"]');}
    if(!tr)return;
    var top=tr.getBoundingClientRect().top-scrollEl.getBoundingClientRect().top+scrollEl.scrollTop-280;
    try{scrollEl.scrollTo({top:Math.max(0,top),behavior:'smooth'});}catch(e){scrollEl.scrollTop=Math.max(0,top);}
    tr.classList.remove('is-flash');void tr.offsetWidth;tr.classList.add('is-flash');
    if(!view.contains(document.activeElement)||document.activeElement===view)tr.focus({preventScroll:true});
  }

  /* toolbar control — rest: "Vergleichen" (starts compare mode → card fields appear);
     in mode: "Vergleich anzeigen (n)", grey until ≥2, teal + opens comparison from 2. */
  function injectBarButton(){
    var bar=document.querySelector('.catalog__bar'); if(!bar||bar.querySelector('.vgl-barwrap'))return;
    var wrap=h('<div class="vgl-barwrap"><button class="vgl-bar-btn" type="button">'+SCALE+'<span class="lbl">Vergleichen</span> <span class="cnt" aria-hidden="true">0</span></button><button class="vgl-cancel" type="button">Vergleich beenden</button></div>');
    barBtn=wrap.querySelector('.vgl-bar-btn');
    cancelBtn=wrap.querySelector('.vgl-cancel');
    barBtn.addEventListener('click',function(){if(!compareMode){enterMode();}else if(canCompare()){openView();}});
    cancelBtn.addEventListener('click',exitMode);
    bar.appendChild(wrap);
    syncBar();
  }
  function enterMode(){
    setMode(true);syncAll();var g=document.getElementById('productGrid');if(g)try{g.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}
    var n=selected.length;
    if(n)toast('Ihre letzte Auswahl ist wieder da ('+(n>1?n+' Modelle':'1 Modell')+').','info',{label:'Leeren',fn:function(){clearAll();if(barBtn)barBtn.focus();}});
    else toast('Wählen Sie 2 bis 4 Modelle zum Vergleich.','info');
  }
  function exitMode(){
    var snap=selected.slice();
    setMode(false);selected=[];persist();closeView();syncAll();
    if(snap.length)toast('Vergleich beendet.','ok',{label:'Rückgängig',fn:function(){setSelection(snap);syncAll();if(barBtn)barBtn.focus();}});
  }

  function toast(m,type,action){
    type=type||'ok';
    var ic=type==='limit'?IC_LIMIT:(type==='info'?IC_INFO:IC_OK);
    var inView=view.classList.contains('is-open');
    toastEl.className='vgl-toast t-'+type+(action?' has-act':'')+(inView?' in-view':(tray.classList.contains('is-open')?' is-raised':''));
    toastEl.innerHTML=ic+'<span>'+m+'</span>'+(action?'<button class="vgl-toast__act" type="button">'+esc(action.label)+'</button>':'');
    if(action)toastEl.querySelector('.vgl-toast__act').addEventListener('click',function(){toastEl.classList.remove('show');action.fn();});
    toastEl.classList.add('show');
    clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('show');},action?6000:4000);
  }

  function injectToggle(cardEl){
    if(cardEl.querySelector('.vgl-toggle'))return;
    var id=cardEl.dataset.id; if(!id||!BY_ID[id])return;
    var foot=cardEl.querySelector('.pcard__footer')||cardEl.querySelector('.pcard__body')||cardEl;
    var on=selected.indexOf(id)>-1;
    var lbl=h('<label class="vgl-toggle"><input type="checkbox" '+(on?'checked':'')+' aria-label="'+esc(BY_ID[id].name)+' zum Vergleich hinzufügen"><span class="vgl-box" aria-hidden="true">'+CHK+'</span>Vergleichen</label>');
    lbl.querySelector('input').addEventListener('change',function(e){var ok=toggle(id,e.target.checked);if(!ok)e.target.checked=false;});
    foot.appendChild(lbl);
    cardEl.classList.toggle('is-vgl',on);
  }
  function scanCards(){var grid=document.getElementById('productGrid');if(!grid)return;grid.querySelectorAll('.pcard[data-id]').forEach(injectToggle);syncCards();}

  function toggle(id,on){var i=selected.indexOf(id);if(on&&i<0){if(isFull()){toast('Maximal '+MAX+' Modelle. Bitte entfernen Sie zuerst eines.','limit');return false;}selected.push(id);}else if(!on&&i>-1){selected.splice(i,1);}persist();syncAll();return true;}
  function clearAll(){selected=[];persist();syncAll();}

  function syncCards(){var grid=document.getElementById('productGrid');if(!grid)return;grid.querySelectorAll('.pcard[data-id]').forEach(function(c){var id=c.dataset.id,on=selected.indexOf(id)>-1,cb=c.querySelector('.vgl-toggle input'),lab=c.querySelector('.vgl-toggle');if(cb)cb.checked=on;c.classList.toggle('is-vgl',on);var dis=!on&&isFull();if(cb){if(dis)cb.setAttribute('aria-disabled','true');else cb.removeAttribute('aria-disabled');}if(lab)lab.classList.toggle('is-disabled',dis);});}
  function syncBar(){
    if(!barBtn)return;
    var n=selected.length;
    barBtn.querySelector('.cnt').textContent=n;
    var lbl=barBtn.querySelector('.lbl');
    if(!compareMode){
      lbl.textContent='Vergleichen';
      barBtn.classList.remove('is-active','is-wait');
      barBtn.classList.toggle('has-saved',n>0);
      barBtn.setAttribute('aria-label',n?'Vergleichen, '+(n>1?n+' Modelle':'1 Modell')+' aus Ihrer letzten Auswahl':'Vergleich starten');
      barBtn.removeAttribute('aria-disabled');
    }else{
      lbl.textContent='Vergleich anzeigen';
      barBtn.classList.remove('has-saved');
      barBtn.classList.toggle('is-active',canCompare());
      barBtn.classList.toggle('is-wait',!canCompare());
      barBtn.setAttribute('aria-label',canCompare()?'Vergleich anzeigen':'Mindestens zwei Modelle wählen');
      barBtn.setAttribute('aria-disabled',String(!canCompare()));
    }
    if(cancelBtn)cancelBtn.classList.toggle('is-shown',compareMode);
  }
  function syncTray(){
    var n=selected.length;
    trayLabel.innerHTML='Vergleich ('+n+') <span class="of">/ max. '+MAX+'</span>';
    var shown=n>0&&compareMode;   /* a stored selection waits behind the toolbar button until the mode is started */
    tray.classList.toggle('is-open',shown);
    trayCta.disabled=!canCompare();
    trayHint.className='vgl-tray__hint';
    if(!canCompare()){
      var need=MIN-n;
      trayHint.classList.add('info');
      trayHint.innerHTML=IC_INFO+'Noch <b>'+need+'</b> Modell'+(need>1?'e':'')+' wählen, um zu vergleichen';
    }else if(n>=MAX){
      trayHint.classList.add('limit');
      trayHint.innerHTML=IC_LIMIT+'Maximum erreicht — mehr als '+MAX+' Modelle sind nicht vergleichbar';
    }else{
      var more=MAX-n;
      trayHint.classList.add('ready');
      trayHint.innerHTML=IC_OK+'Bereit zum Vergleichen · bis zu '+more+' weitere möglich';
    }
    traySlots.innerHTML='';
    selected.forEach(function(id){var p=BY_ID[id];traySlots.appendChild(h('<div class="vgl-slot"><img src="'+esc(p.img)+'" alt="'+esc(p.name)+'"><button class="vgl-slot__rm" type="button" data-rm="'+id+'" aria-label="'+esc(p.name)+' aus Vergleich entfernen">×</button></div>'));});
    document.body.style.paddingBottom=shown?((tray.offsetHeight||88)/16)+'rem':'';
    document.documentElement.style.setProperty('--vgl-tray-h',((tray.offsetHeight||88)/16)+'rem');   /* alerts lift exactly above the tray */   /* measured after the slots exist — the mobile tray wraps to two rows */
  }
  function syncAll(){syncCards();syncBar();syncTray();if(view.classList.contains('is-open'))renderView();}

  function cellVal(p,row){return row.spec?p.specs[row.key]:(row.get?row.get(p):p[row.key]);}
  function disp(v,row){if(row.bool)return v===true?'ja':(v===false?'nein':'–');if(Array.isArray(v))return v.length?v.join(' · '):'Keine';if(v==null||v==='')return '–';return String(v);}
  function canon(v,t){return Array.isArray(v)?v.slice().sort().join('|'):t;}   /* sets compare order-independently (Mehrfachauswahl, colours) */
  function numOf(t){var m=String(t).replace(/\.(?=\d{3}(\D|$))/g,'').match(/-?\d+(?:,\d+)?/);return m?parseFloat(m[0].replace(',','.')):null;}
  function bestIdx(row,vals,texts){
    if(!row.better)return [];
    var idxs=[];
    if(row.better==='yes'){var y=vals.some(function(v){return v===true;}),n=vals.some(function(v){return v!==true;});if(y&&n)vals.forEach(function(v,i){if(v===true)idxs.push(i);});return idxs;}
    if(row.better==='more'){var cs=vals.map(function(v){return Array.isArray(v)?v.length:0;}),mx=Math.max.apply(null,cs);if(mx===0||cs.every(function(c){return c===mx;}))return [];cs.forEach(function(c,i){if(c===mx)idxs.push(i);});return idxs;}
    if(row.better==='rank'){var rs=vals.map(function(v){return row.rank.indexOf(String(v));}),rm=Math.max.apply(null,rs);if(rm<0||rs.every(function(r){return r===rm;}))return [];rs.forEach(function(r,i){if(r===rm)idxs.push(i);});return idxs;}
    var nums=texts.map(numOf),valid=nums.filter(function(x){return x!=null;});
    if(valid.length<2||new Set(valid).size===1)return [];
    var best=row.better==='min'?Math.min.apply(null,valid):Math.max.apply(null,valid);
    nums.forEach(function(x,i){if(x===best)idxs.push(i);});
    return idxs;
  }
  function panelVal(row,items,texts){
    if(row.swatches)return items.map(function(p){return (p.colors||[]).length;}).join(' · ')+' Farben';
    if(row.bool)return texts.map(function(t){return t==='ja'?'Ja':(t==='nein'?'Nein':'–');}).join('  ·  ');
    return texts.join('  ·  ');
  }
  /* "Modell | Klingeltaster | Zusatz" → bold model line + muted qualifier line (scannable like Apple/Galaxus headers) */
  var MODEL_RE=/^[A-Z]{2,4}\d{2}[A-Z0-9.]*(?:\s[\d.]+)?$/;   /* XDM10 · VDM10 2.0 · SDM10X · ADM10 — a trailing model segment moves to the front */
  function shortName(p){
    var parts=String(p.name||'').split('|').map(function(s){return s.trim();}).filter(Boolean);
    if(LENS.designFirst&&parts.length>1)return {main:parts[parts.length-1],sub:parts.slice(0,-1).join(' · ')};   /* Briefkästen: the design line IS the product */
    for(var i=1;i<parts.length;i++)if(MODEL_RE.test(parts[i])){var rest=parts.slice();rest.splice(i,1);return {main:parts[i]+' '+parts[0],sub:rest.slice(1).join(' · ')};}
    return {main:parts[0]||p.name,sub:parts.slice(1).join(' · ')};
  }
  /* column labels: when two models share the same model line, the words that differ in the qualifier move up into the name */
  function colLabels(items){
    var out=items.map(function(p){var n=shortName(p);return {main:n.main,sub:n.sub,dx:''};});
    var groups={};out.forEach(function(l,i){(groups[l.main]=groups[l.main]||[]).push(i);});
    Object.keys(groups).forEach(function(k){
      var g=groups[k];if(g.length<2)return;
      var words=g.map(function(i){return out[i].sub.split(/\s+/).filter(Boolean);});
      var c=0;while(words.every(function(w){return w.length>c&&w[c]===words[0][c];}))c++;
      var keep=(c>0&&/^(mit|ohne|für|aus|und)$/i.test(words[0][c-1]))?c-1:c;
      g.forEach(function(i,j){out[i].dx=words[j].slice(keep).join(' ');});
    });
    return out;
  }
  function colName(l){return l.main+(l.dx?' ('+l.dx+')':'');}
  function tokens(t){return String(t).split(' · ').map(function(s){return s.trim();}).filter(Boolean);}
  /* Per-product "Auf einen Blick": up to 3 differentiators that are unique to (or best for) this model.
     Replaces the unlabeled dot-chain panel — every value is mapped to its product. */
  function highlights(items,an){
    var out=items.map(function(){return [];});
    var diffs=an.diffs.slice().sort(function(a,b){return (b.row.imp?1:0)-(a.row.imp?1:0);});
    diffs.forEach(function(d){
      var row=d.row; if(row.key==='price'||row.nohl)return;       /* price already sits in the header; design line is the column itself */
      var bi=bestIdx(row,d.vals,d.texts);
      items.forEach(function(p,i){
        if(out[i].length>=3)return;
        var t=d.texts[i]; if(t==='–')return;
        var label=null,isBest=bi.indexOf(i)>-1;
        var lab=row.label;
        if(row.key==='zutritt'||row.set){var mine=row.set?(d.vals[i]||[]):tokens(t),others=[];items.forEach(function(q,j){if(j!==i)others=others.concat(row.set?(d.vals[j]||[]):tokens(d.texts[j]));});var uniq=mine.filter(function(x){return others.indexOf(x)<0&&x!=='Standard';});if(!uniq.length)return;label=uniq.join(', ');if(row.set)lab='';}
        else if(row.bool){if(d.vals[i]!==true)return;label=row.label;lab='';}          /* "Nachtsicht" — not "Nachtsicht: Nachtsicht" */
        else if(row.swatches){var csd=setDiff(row,items,i);if(!csd.extra.length)return;label='+ '+csd.extra.length+' Farbe'+(csd.extra.length>1?'n':'')+' ('+csd.extra.join(', ')+')';lab='';}   /* only a real surplus of colours is a highlight */
        else if(row.better){if(!isBest)return;label=t;}                                 /* ranked rows: only the best value is a highlight, never a unique-but-weaker one */
        else{var unique=d.texts.every(function(x,j){return j===i||x!==t;});if(!unique)return;label=t;}
        out[i].push({k:row.key,t:label,l:lab,best:isBest});
      });
    });
    return out;
  }
  function analyze(items){
    var diffs=[],sames=[];
    ROWS.forEach(function(row){
      if(row.group)return;
      var vals=items.map(function(p){return cellVal(p,row);});
      var texts=vals.map(function(v){return disp(v,row);});
      var keys=vals.map(function(v,i){return canon(v,texts[i]);});
      var same=keys.every(function(t){return t===keys[0];});
      (same?sames:diffs).push({row:row,vals:vals,texts:texts});
    });
    var total=diffs.length+sames.length;
    var tech=diffs.filter(function(d){return !d.row.soft;}).length;
    /* twin = technically identical: differences only in design / nameplate / colours / price */
    return {diffs:diffs,sames:sames,ratio:total?sames.length/total:0,tech:tech,twin:diffs.length>0&&tech===0};
  }
  /* colour set differences per model: extra = colours no other model offers, missing = colours every other model offers */
  /* set differences per model (colours and every Mehrfachauswahl row): extra = values no other model has, missing = values every other model has */
  function setDiff(row,items,i){
    var pick=function(p){return row.swatches?(p.colors||[]):((row.get?row.get(p):p[row.key])||[]);};
    var lab=function(c){return row.swatches?(SWL[c]||c):c;};
    var mine=pick(items[i]),others=items.filter(function(q,j){return j!==i;}).map(pick);
    var extra=mine.filter(function(c){return others.every(function(o){return o.indexOf(c)<0;});});
    var missing=[];others.length&&others[0].forEach(function(c){if(mine.indexOf(c)<0&&others.every(function(o){return o.indexOf(c)>-1;}))missing.push(c);});
    return {extra:extra.map(lab),missing:missing.map(lab)};
  }
  function colorDiff(items,i){return setDiff({swatches:true},items,i);}
  /* Alternatives that differ MEANINGFULLY: nearest models with 1–3 technical differences to the compared set, closest price first */
  function alternatives(items){
    var techRows=ROWS.filter(function(r){return !r.group&&!r.soft&&!r.neutral;});
    var ref=items[0],refPrice=typeof ref.price==='number'?ref.price:0;
    var out=[];
    SRC.forEach(function(raw){
      var p=BY_ID[raw.id]; if(!p||selected.indexOf(p.id)>-1)return;
      var why=[];
      techRows.forEach(function(row){
        var va=cellVal(p,row),vb=cellVal(ref,row),a=disp(va,row),b=disp(vb,row);
        if(a===b||a==='–')return;
        if(row.set){var sd=setDiff(row,[p,ref],0);var parts=[];if(sd.extra.length)parts.push('+ '+sd.extra.join(', '));if(sd.missing.length)parts.push('ohne '+sd.missing.join(', '));if(!parts.length)return;why.push({l:row.label,v:parts.join(' · ')});return;}
        why.push({l:row.label,v:(row.bool?(a==='ja'?'Ja':'Nein'):a)});
      });
      if(why.length<1||why.length>3)return;
      out.push({p:p,why:why,dist:Math.abs((typeof p.price==='number'?p.price:0)-refPrice)});
    });
    out.sort(function(a,b){return a.why.length-b.why.length||a.dist-b.dist;});
    /* one per design line, so the list doesn't show three Colsons */
    var seen={},res=[];out.forEach(function(o){var k=o.p.design+'|'+o.why.map(function(w){return w.l+w.v;}).join();if(seen[k])return;seen[k]=1;res.push(o);});
    return res.slice(0,3);
  }
  /* "Für +X € erhalten Sie …" — turns the price delta into a value statement (twin state only) */
  /* What model p offers beyond model ref, phrased from the differing rows (generic over both lenses) */
  function gains(p,ref){
    var gets=[],less=[],neutral=[];
    ROWS.forEach(function(row){
      if(row.group||row.key==='price'||row.key==='design'||row.neutral)return;   /* identity and neutral facts (weight, size) are no "gain" */
      var a=cellVal(p,row),b=cellVal(ref,row);
      if(row.swatches||row.set){
        var sd=setDiff(row,[p,ref],0);
        if(sd.extra.length)gets.push(row.swatches?(sd.extra.length+' zusätzliche Farbe'+(sd.extra.length>1?'n':'')+' ('+sd.extra.join(', ')+')'):(sd.extra.join(', ')+' ('+row.label+')'));
        if(sd.missing.length)less.push((row.swatches?'':row.label+': ')+sd.missing.join(', '));
        return;
      }
      var ta=disp(a,row),tb=disp(b,row); if(ta===tb||ta==='–'||tb==='–')return;   /* unknown on either side → no claim */
      if(row.bool){if(a===true)gets.push(row.label);else if(b===true)less.push(row.label);return;}
      if(row.better){var bi=bestIdx(row,[a,b],[ta,tb]);if(bi.indexOf(0)>-1)gets.push(row.label+': '+ta);else if(bi.indexOf(1)>-1)less.push(row.label+': '+tb);else neutral.push(row.label+': '+ta+' statt '+tb);return;}
      neutral.push(row.label+': '+ta+' statt '+tb);   /* unranked facts are a difference, not a gain */
    });
    return {gets:gets,less:less,neutral:neutral};
  }
  function valueStatement(items,labels){
    var cheap=items.reduce(function(a,b){return (b.price<a.price)?b:a;});
    var lines=[];
    items.forEach(function(p){
      var ref=(p===cheap)?items.filter(function(q){return q!==p;})[0]:cheap;
      if(!ref)return;
      var d=p.price-ref.price;
      if(p===cheap&&d!==0)return;                      /* cheapest vs pricier: shown from the pricier side */
      var gn=gains(p,ref),CAP=5;
      var gets=gn.gets.slice(0,CAP),more=gn.gets.length-gets.length;
      var who=labels?colName(labels[items.indexOf(p)]):p.design;
      var tail=gets.length?' — dafür: '+esc(gets.join(' · '))+(more>0?' <span class="vgl-twin__less">+ '+more+' weitere</span>':''):(gn.neutral.length?'':' — technisch identisch; der Unterschied ist die Optik');
      if(gn.neutral.length)tail+=' <span class="vgl-twin__less">'+(gets.length?'· ':'— ')+'Unterschied: '+esc(gn.neutral.slice(0,2).join(' · '))+'</span>';
      lines.push('<li><b>'+(d>0?'+ '+euro(d):'Gleicher Preis')+'</b> für <b>'+esc(who)+'</b>'+tail+((d>0&&gn.less.length)?' <span class="vgl-twin__less">(ohne '+esc(gn.less.slice(0,3).join(', '))+')</span>':'')+'</li>');
    });
    return lines.join('');
  }
  function hlHTML(list){
    return '<ul class="vgl-ph__hl" aria-label="Das zeichnet dieses Modell aus">'+
      (list.length?list.map(function(c){return '<li'+(c.best?' class="is-best"':'')+'>'+(c.l?'<span class="vgl-hl__k">'+esc(c.l)+'</span> ':'')+esc(c.t)+'</li>';}).join(''):'<li class="none">Keine Besonderheit gegenüber den anderen Modellen</li>')+
    '</ul>';
  }
  function renderView(){
    var items=selected.map(function(id){return BY_ID[id];});
    viewCount.textContent='('+items.length+')';
    var back=view.querySelector('[data-vgl="back"]');if(back)back.hidden=!(fromMkl&&window.MTZ_MKL);
    if(shareBtn)shareBtn.hidden=items.length<MIN;
    syncUrl();
    if(items.length<2){
      viewBody.innerHTML='<div class="vgl-empty">'+SCALE+'<b>Mindestens zwei Modelle wählen</b><span>Markieren Sie über „Vergleichen" auf den Produktkarten weitere Modelle, um sie hier gegenüberzustellen.</span>'+
        '<div class="vgl-empty__act">'+(lastCleared?'<button class="vgl-more" type="button" data-vgl="undo-clear">Vergleich wiederherstellen ('+lastCleared.length+')</button>':'')+'<button class="vgl-more" type="button" data-vgl="add">'+IC_PLUS+'Modell wählen</button>'+(mklCount()?'<button class="vgl-more" type="button" data-vgl="addmkl">'+IC_BM+'Aus der Merkliste wählen ('+mklCount()+')</button>':'')+'</div></div>';
      return;
    }
    var onlyDiff=diffCb.checked;
    var an=analyze(items);
    var total=an.diffs.length+an.sames.length;
    var detailCount=ROWS.filter(function(r){return !r.group&&!r.imp;}).length;
    var hl=highlights(items,an);
    var labels=colLabels(items);
    var minPrice=Math.min.apply(null,items.map(function(p){return typeof p.price==='number'?p.price:Infinity;}));
    var addCol=items.length<MAX;                               /* Baymard: let users add from inside the comparison */
    diffN.textContent='('+an.diffs.length+')';
    var guards=LENS.guards?LENS.guards(items):[];
    var noDelta=guards.some(function(x){return x.noDelta;});
    var samePrice=items.every(function(p){return p.price===items[0].price;});
    view.className=view.className.replace(/\blens-\S+/g,'').replace(/\s+/g,' ').trim()+' lens-'+(window.MTZ_LENS||'sprechanlage');

    /* ---- Summary strip: similarity verdict + jump chips to the differing rows ---- */
    var sum='<div class="vgl-sum">';
    if(an.diffs.length===0){
      sum+='<h3 class="vgl-sum__txt vgl-sum__txt--same">'+IC_OK+'<span>In allen <b>'+total+'</b> verglichenen Merkmalen identisch — '+LENS.twinHint+'.</span></h3>';
    }else{
      var verdict;
      if(an.twin){
        var SOFT_ORDER=['design','namensschild','colors','price'];   /* look first, price last */
        var softLabels=an.diffs.slice().sort(function(a,b){return SOFT_ORDER.indexOf(a.row.key)-SOFT_ORDER.indexOf(b.row.key);}).map(function(d){return d.row.label;});
        verdict='<b>Technisch baugleich</b> — der Unterschied liegt in '+esc(softLabels.length>1?softLabels.slice(0,-1).join(', ')+' und '+softLabels.slice(-1):softLabels[0])+'.';
      }else if(an.ratio>=0.6){
        verdict='Zu <b>'+Math.round(an.ratio*100)+'&nbsp;%</b> ähnlich — <b>'+an.diffs.length+'</b> Unterschied'+(an.diffs.length>1?'e':'')+' entscheide'+(an.diffs.length>1?'n':'t')+'.'+(samePrice&&!noDelta?' <b>Gleicher Preis</b> — die Ausstattung entscheidet.':'');
      }else{
        verdict='<b>'+an.diffs.length+' von '+total+'</b> Merkmalen unterscheiden sich.';
      }
      sum+='<h3 class="vgl-sum__txt">'+IC_INFO+'<span>'+verdict+'</span></h3>';
      var chips=an.diffs.slice().sort(function(a,b){return an.twin?(['design','namensschild','colors','price'].indexOf(a.row.key)-['design','namensschild','colors','price'].indexOf(b.row.key)):((b.row.imp?1:0)-(a.row.imp?1:0));});
      var LIM=8,shown=chipsAll?chips:chips.slice(0,LIM);
      sum+='<div class="vgl-sum__chips" role="group" aria-label="Zu den Unterschieden springen">';
      shown.forEach(function(d){sum+='<button type="button" class="vgl-chip" data-jump="'+d.row.key+'">'+esc(d.row.label)+'</button>';});
      if(chips.length>LIM)sum+='<button type="button" class="vgl-chip vgl-chip--more" data-vgl="morechips" aria-expanded="'+chipsAll+'">'+(chipsAll?'Weniger':'+ '+(chips.length-LIM)+' weitere')+'</button>';
      sum+='</div>';
    }
    guards.forEach(function(x){sum+='<div class="vgl-guard vgl-guard--'+x.type+'">'+(x.type==='warn'?IC_LIMIT:IC_INFO)+'<span>'+x.text+'</span></div>';});
    sum+='</div>';

    /* ---- Guidance: twin (technically identical) → value statement + alternatives; merely similar (≥60 %) → value statement only ---- */
    view.classList.toggle('is-twin',an.twin);
    var twin='';
    if(an.diffs.length&&(an.twin||an.ratio>=0.6||samePrice)&&!noDelta){   /* equal price = "what do I get for it" matters most */
      var alts=an.twin?alternatives(items):[];
      twin='<div class="vgl-twin'+(alts.length?'':' vgl-twin--single')+'">'+
        '<section class="vgl-twin__col"><h3 class="vgl-twin__h">'+(samePrice?'Gleicher Preis — das unterscheidet die Ausstattung':'Was der Aufpreis bringt')+'</h3><ul class="vgl-twin__list">'+valueStatement(items,labels)+'</ul>'+
          '<p class="vgl-twin__note">'+LENS.configNote+'</p></section>'+
        (alts.length?'<section class="vgl-twin__col vgl-twin__col--alt"><h3 class="vgl-twin__h">Alternativen mit echtem Unterschied</h3><ul class="vgl-alts">'+
          alts.map(function(o){var nm=shortName(o.p);return '<li class="vgl-alt"><div class="vgl-alt__media"><img src="'+esc(o.p.img)+'" alt=""></div><div class="vgl-alt__body"><div class="vgl-alt__name">'+esc(nm.main)+(o.p.design!=='–'&&o.p.design!==nm.main?' <span>'+esc(o.p.design)+'</span>':'')+'</div><div class="vgl-alt__why">'+o.why.map(function(w){return '<span><em>'+esc(w.l)+':</em> '+esc(w.v)+'</span>';}).join('')+'</div><div class="vgl-alt__foot"><b>ab '+euro(o.p.price)+'</b><button type="button" class="vgl-alt__add" data-alt="'+o.p.id+'"'+(isFull()?' disabled':'')+'>'+IC_PLUS+'Zum Vergleich</button></div></div></li>';}).join('')+
        '</ul></section>':'')+
      '</div>';
    }

    /* ---- Table ---- */
    var n=items.length+(addCol?1:0);
    var cols='<col class="rl">'+items.map(function(){return '<col class="pc">';}).join('')+(addCol?'<col class="pc pc--add">':'');
    var emptyCells=items.map(function(){return '<td></td>';}).join('')+(addCol?'<td class="vgl-addcell"></td>':'');
    var thead='<thead><tr><th class="rh" scope="col"><span class="vgl-visually-hidden">Merkmal</span></th>';
    items.forEach(function(p,i){
      var nm=labels[i];
      thead+='<th class="vgl-ph" scope="col">'+
        '<div class="vgl-ph__media"><button class="vgl-ph__rm" type="button" data-rm="'+p.id+'" aria-label="'+esc(colName(nm))+' aus dem Vergleich entfernen">'+IC_X+'</button><img src="'+esc(p.img)+'" alt="'+esc(p.name)+'"></div>'+
        '<div class="vgl-ph__name" title="'+esc(p.name)+'">'+esc(nm.main)+(nm.dx?' <span class="vgl-ph__dx">'+esc(nm.dx)+'</span>':'')+'</div>'+
        '<div class="vgl-ph__sub">'+(nm.sub?esc(nm.sub):'&nbsp;')+'</div>'+
        '<div class="vgl-ph__price">ab '+euro(p.price)+(p.uvp?'<small class="uvp">UVP '+euro(p.uvp)+'</small>':'')+'</div>'+
        (PDP_URLS[p.id]?'<a class="btn btn--primary" href="'+esc(PDP_URLS[p.id])+'" data-go="'+esc(p.id)+'">'+(p.konfig?'Konfigurieren':'Zum Produkt')+'</a>':'<button class="btn btn--primary" type="button" data-go>'+(p.konfig?'Konfigurieren':'Zum Produkt')+'</button>')+'</th>';
    });
    var nMkl=addCol?mklCount():0;
    if(addCol)thead+='<th class="vgl-ph vgl-ph--add" scope="col"><button class="vgl-add" type="button" data-vgl="add" title="Bis zu '+MAX+' Modelle vergleichbar">'+IC_PLUS+'<b>Modell hinzufügen</b><small>noch '+(MAX-items.length)+' möglich</small></button>'+(nMkl?'<button class="vgl-add__mkl" type="button" data-vgl="addmkl">'+IC_BM+'Aus der Merkliste ('+nMkl+')</button>':'')+'</th>';
    thead+='</tr></thead>';
    /* "Auf einen Blick" is the first row group of the body — the sticky header stays short (media · name · price · CTA) */
    var tbody='<tbody><tr class="vgl-group"><th class="rh" scope="rowgroup">Auf einen Blick</th>'+emptyCells+'</tr>'+
      '<tr class="vgl-glance" data-key="glance" tabindex="-1"><th class="rh" scope="row"><span class="rh__l">Das zeichnet das Modell aus</span></th>'+
      items.map(function(p,i){return '<td class="vgl-val">'+hlHTML(hl[i])+'</td>';}).join('')+(addCol?'<td class="vgl-addcell"></td>':'')+'</tr>';
    var curG=null,gRows='',any=false;
    function flush(){if(curG!==null&&gRows!==''){tbody+='<tr class="vgl-group"><th class="rh" scope="rowgroup">'+esc(curG)+'</th>'+emptyCells+'</tr>'+gRows;}gRows='';}
    ROWS.forEach(function(row){
      if(row.group){flush();curG=row.group;return;}
      var vals=items.map(function(p){return cellVal(p,row);});
      var texts=vals.map(function(v){return disp(v,row);});
      var keys=vals.map(function(v,i){return canon(v,texts[i]);});
      var same=keys.every(function(t){return t===keys[0];});
      var visible=onlyDiff?!same:(row.imp||detailsOpen);
      if(!visible)return;
      any=true;
      var bi=same?[]:bestIdx(row,vals,texts);
      var tr='<tr data-key="'+row.key+'" tabindex="-1" class="'+(same||onlyDiff?'':'is-diff')+'"><th class="rh" scope="row"><span class="rh__l">'+esc(row.label)+'</span>'+(row.hint?'<button class="vgl-i" type="button" aria-label="Erklärung: '+esc(row.label)+'" aria-expanded="false" aria-describedby="vgl-tip-'+row.key+'">'+IC_INFO+'<span class="vgl-tip" role="tooltip" id="vgl-tip-'+row.key+'">'+esc(row.hint)+'</span></button>':'')+'</th>';
      items.forEach(function(p,i){var v=vals[i],t=texts[i],na=(t==='–'),isb=bi.indexOf(i)>-1,inner;
        if(row.swatches){inner=swHTML(p.colors,10)+'<span class="vgl-visually-hidden">'+esc((p.colors||[]).map(function(c){return SWL[c]||c;}).join(', ')||'Keine')+'</span>';}   /* swatches + text alternative — the colour difference is named in "Auf einen Blick" */
        else if(row.set){
          var sd=same?{extra:[],missing:[]}:setDiff(row,items,i),arr=v||[];
          inner=(arr.length?'<ul class="vgl-setl">'+arr.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'<span class="vgl-no">Keine</span>')+
            ((sd.extra.length||sd.missing.length)?'<span class="vgl-swn">'+(sd.extra.length?'<b>zusätzlich:</b> '+esc(sd.extra.join(', ')):'')+(sd.extra.length&&sd.missing.length?' · ':'')+(sd.missing.length?'<b>ohne:</b> '+esc(sd.missing.join(', ')):'')+'</span>':'');
        }
        else if(row.bool){inner=v===true?'<span class="vgl-yes">'+CHK+'Ja</span>':(v===false?'<span class="vgl-no">Nein</span>':'<span class="vgl-no">–</span>');}
        else if(row.key==='price'){inner=esc(t)+((typeof p.price==='number'&&p.price>minPrice&&!same&&!noDelta)?'<span class="vgl-delta" title="Differenz zum niedrigsten Preis im Vergleich">+ '+euro(p.price-minPrice)+'</span>':'');}
        else inner=esc(t);
        if(isb)inner+='<span class="vgl-best">Bestwert</span>';
        tr+='<td class="vgl-val'+(na?' na':'')+(isb?' is-best':'')+'">'+inner+'</td>';});
      if(addCol)tr+='<td class="vgl-addcell"></td>';
      tr+='</tr>';gRows+=tr;
    });
    flush();
    if(onlyDiff&&!any)tbody+='<tr><th class="rh" scope="row">—</th><td class="vgl-val na" colspan="'+n+'">Alle ausgewählten Modelle sind in diesen Merkmalen identisch.</td></tr>';
    tbody+='</tbody>';
    var table='<div class="vgl-wrap"><table class="vgl-t"><caption class="vgl-visually-hidden">Vergleich von '+items.length+' '+LENS.label+'</caption><colgroup>'+cols+'</colgroup>'+thead+tbody+'</table></div>';

    /* ---- After table: details toggle + Gemeinsamkeiten ---- */
    var after='<div class="vgl-aftertable">';
    if(!onlyDiff&&detailCount)after+='<button class="vgl-more" type="button" data-vgl="details" aria-expanded="'+detailsOpen+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'+(detailsOpen?'Weniger anzeigen':'Alle technischen Details anzeigen ('+detailCount+')')+'</button>';
    if(an.sames.length){
      after+='<details class="vgl-common"'+(onlyDiff?' open':'')+'><summary><h3 class="vgl-common__h">Gemeinsamkeiten <span class="cnt">'+an.sames.length+'</span></h3><span class="vgl-common__hint">gilt für alle '+items.length+' Modelle</span></summary><ul class="vgl-commonlist">';
      an.sames.forEach(function(s){after+='<li><span class="k">'+esc(s.row.label)+'</span><span class="v">'+esc(panelVal(s.row,[items[0]],[s.texts[0]]))+'</span></li>';});
      after+='</ul></details>';
    }
    after+='</div>';

    /* twin: the guidance is the point of that state → directly under the verdict; otherwise products first, guidance after the table */
    viewBody.innerHTML=sum+(an.twin?twin+table:table+twin)+after;
  }
  function openView(opt){
    opt=opt||{};
    if(selected.length<MIN)return;
    lastFocus=document.activeElement;
    var an=analyze(selected.map(function(id){return BY_ID[id];}));
    diffCb.checked=(an.ratio>=0.6 && an.diffs.length>0);   /* auto difference-first when highly similar */
    detailsOpen=false;
    chipsAll=false;lastCleared=null;
    renderView();
    scrollEl.scrollTop=0;
    view.classList.add('is-open');view.setAttribute('aria-hidden','false');document.body.classList.add('vgl-overlay');document.body.style.overflow='hidden';view.querySelector('#vglTitle').focus();
    /* opening pushes a history entry → the browser's Back closes the comparison; arriving by link replaces it (a reload reopens) */
    var url=pageUrl(selected);
    try{
      if(opt.arrived)history.replaceState({mtzVgl:1,arrived:1},'',url);
      else if(opt.push!==false&&!(history.state&&history.state.mtzVgl))history.pushState({mtzVgl:1},'',url);
      else history.replaceState(history.state,'',url);
    }catch(e){}
    setTitle();
  }
  function closeView(fromPop){
    if(!view.classList.contains('is-open'))return;
    closeAdd(false);var sp=view.querySelector('.vgl-sharepop');if(sp)sp.remove();
    closeTip();view.classList.remove('is-open');view.setAttribute('aria-hidden','true');document.body.classList.remove('vgl-overlay');document.body.style.overflow='';
    if(lastFocus&&lastFocus.focus&&document.contains(lastFocus)&&lastFocus!==document.body)lastFocus.focus();
    else if(barBtn)barBtn.focus();
    /* arrived from the Merkliste / a link: the grid is the natural landing, not the page top */
    if(fromMkl&&compareMode){var g=document.getElementById('productGrid');if(g)try{g.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}}
    fromMkl=false;
    if(prevTitle!==null){document.title=prevTitle;prevTitle=null;}
    try{sessionStorage.removeItem('mtz_return');}catch(e){}   /* the PDP "Zurück zum Vergleich" link ends with the comparison */
    if(fromPop!==true){try{var st=history.state;if(st&&st.mtzVgl&&!st.arrived)history.back();else history.replaceState(null,'',pageUrl([]));}catch(e){}}
  }

  /* =========================================================
     Guided flow tour
     ========================================================= */
  var TRIO=LENS.trio;  // lens demo set (all on page 1): Sprechanlagen = Audio · VDM10 · SDM10X, Briefkästen = Siebert · Ebenhard · Hermann
  var coach,coachProg,coachStep,coachTitle,coachText,coachBack,coachNext,coachEnd,spotEl,cur=0;
  var STEPS=[
    {k:'Schritt 1 / 6',t:'Ruhezustand',x:'Zunächst ist der Vergleich reduziert: auf den Produktkarten sind <b>keine Auswahlfelder</b> sichtbar. In der Ergebnisleiste lädt die Schaltfläche „Vergleichen" dazu ein, den Vergleich zu starten.',target:function(){return barBtn;}},
    {k:'Schritt 2 / 6',t:'Vergleich starten',x:'Ein Klick auf „Vergleichen" aktiviert den Vergleichsmodus — <b>jetzt erscheint auf jeder Produktkarte ein „Vergleichen"-Feld</b>. Wählen Sie damit 2–4 Modelle.',target:function(){return cardToggle(TRIO[0])||barBtn;}},
    {k:'Schritt 3 / 6',t:'Ab zwei Artikeln aktiv',x:'Sobald zwei oder mehr Modelle markiert sind, wird „Vergleich anzeigen (3)" <b>aktiv</b> (grün) — in der Ergebnisleiste und in der Auswahlleiste unten.',target:function(){return barBtn;}},
    {k:'Schritt 4 / 6',t:'Gegenüberstellung',x:'Ein Klick öffnet die Gegenüberstellung: oben das Fazit („x Unterschiede") mit Sprungmarken, je Modell <b>„Auf einen Blick"</b> mit dessen Alleinstellungen, darunter die Kernmerkmale in Gruppen. Erklärungen per (i), Bestwerte markiert. '+LENS.step4,target:function(){return null;}},
    {k:'Schritt 5 / 6',t:'Nur Unterschiede',x:'Mit „Nur Unterschiede anzeigen" bleiben nur die abweichenden Merkmale sichtbar — ideal, um schnell zu entscheiden.',target:function(){return view.querySelector('.vgl-diff');}},
    {k:'Schritt 6 / 6',t:'Weiter im Kauf',x:'Aus dem Vergleich geht es direkt weiter: <b>Konfigurieren</b> bzw. <b>Zum Produkt</b> (kein Direktkauf, da individualisierbar), Artikel entfernen oder weitere hinzufügen. Das ist der komplette Ablauf.',target:function(){return null;},last:true}
  ];
  function cardToggle(id){var c=document.querySelector('.pcard[data-id="'+id+'"] .vgl-toggle');return c;}
  function clearSpot(){if(spotEl){spotEl.classList.remove('vgl-spot');spotEl=null;}}
  function spot(el){clearSpot();if(!el)return;spotEl=el;el.classList.add('vgl-spot');try{el.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}}

  function applyState(step){
    closeView();
    setMode(step>=1);                          /* step 1+ = compare mode on → card fields visible */
    selected = step>=2 ? TRIO.slice() : [];    /* models get marked from step 3 (index 2) */
    selected = selected.filter(function(id){return BY_ID[id];});
    persist(); syncAll();
    diffCb.checked = step>=4;
    if(step>=3){ openView(); }
  }
  function buildCoach(){
    var fab=h('<button class="vgl-tourfab" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></svg>Vergleichen-Flow ansehen</button>');
    fab.addEventListener('click',function(){startTour();});
    document.body.appendChild(fab);
    coach=h('<div class="vgl-coach" role="dialog" aria-modal="false" aria-label="Vergleichen-Flow">'+
      '<div class="vgl-coach__top"><div class="vgl-coach__prog" style="width:0"></div></div>'+
      '<div class="vgl-coach__body">'+
        '<div class="vgl-coach__step"></div>'+
        '<div class="vgl-coach__title"></div>'+
        '<div class="vgl-coach__text"></div>'+
        '<div class="vgl-coach__foot">'+
          '<button class="vgl-coach__x" type="button" data-c="close">Tour beenden</button>'+
          '<span class="spacer"></span>'+
          '<button class="vgl-coach__btn" type="button" data-c="back">Zurück</button>'+
          '<button class="vgl-coach__btn vgl-coach__btn--primary" type="button" data-c="next">Weiter</button>'+
        '</div>'+
      '</div></div>');
    document.body.appendChild(coach);
    coachProg=coach.querySelector('.vgl-coach__prog');coachStep=coach.querySelector('.vgl-coach__step');
    coachTitle=coach.querySelector('.vgl-coach__title');coachText=coach.querySelector('.vgl-coach__text');
    coachBack=coach.querySelector('[data-c="back"]');coachNext=coach.querySelector('[data-c="next"]');
    coach.addEventListener('click',function(e){var b=e.target.closest('[data-c]');if(!b)return;var k=b.getAttribute('data-c');if(k==='close')endTour();if(k==='back')goTo(cur-1);if(k==='next'){if(cur>=STEPS.length-1)endTour();else goTo(cur+1);}});
  }
  function startTour(){cur=0;coach.classList.add('is-open');goTo(0);}
  function endTour(){clearSpot();coach.classList.remove('is-open');}
  function goTo(i){
    cur=Math.max(0,Math.min(STEPS.length-1,i));
    var s=STEPS[cur];
    applyState(cur);
    coachProg.style.width=Math.round((cur)/(STEPS.length-1)*100)+'%';
    coachStep.textContent=s.k;coachTitle.textContent=s.t;coachText.innerHTML=s.x;
    coachBack.style.visibility=cur===0?'hidden':'visible';
    coachNext.textContent=s.last?'Fertig':'Weiter';
    clearSpot();
    setTimeout(function(){var el=s.target&&s.target();if(el)spot(el);},80);
  }

  /* ---- Public hook for the Merkliste add-on (05_Merkliste §3.5) ----
     compare(ids): replaces the selection with the valid ids of this lens (max 4), persists it,
     enters compare mode (body.vgl-mode → card checkboxes appear, same gating as the toolbar
     button), syncs bar/tray/cards and opens the comparison from 2 models. Returns the count. */
  function setSelection(ids){
    var valid=[];(ids||[]).forEach(function(id){id=String(id);if(BY_ID[id]&&valid.indexOf(id)<0&&valid.length<MAX)valid.push(id);});
    if(!valid.length)return 0;
    selected=valid;persist();
    setMode(true);
    return selected.length;
  }
  window.MTZ_VGL={
    compare:function(ids){var n=setSelection(ids);if(!n)return 0;fromMkl=true;syncAll();if(canCompare())openView();return n;},
    enterMode:function(){if(!compareMode)enterMode();},
    isMode:function(){return compareMode;},
    selected:function(){return selected.slice();}
  };

  /* ---- Init ---- */
  function init(){
    if(!window.MTZ_PRODUCTS)return setTimeout(init,50);
    if(!SRC.length){SRC=window.MTZ_PRODUCTS;SRC.forEach(function(p){if(!BY_ID[p.id])BY_ID[p.id]=LENS.enrich(p);});}
    loadSel();
    compareMode=modeStored();   /* the mode survives a reload in this session only */
    document.body.classList.toggle('vgl-mode',compareMode);
    /* ?vergleich=id,id (shared link, reload, Merkliste handover) */
    var arr=null;
    try{var qm=/[?&]vergleich=([^&#]+)/.exec(location.search);if(qm)arr={raw:decodeURIComponent(qm[1]).split(',').map(function(x){return x.trim();}).filter(Boolean),fromMkl:/[?&]von=merkliste\b/.test(location.search)};}catch(e){}
    buildChrome(); buildCoach(); injectBarButton();
    var grid=document.getElementById('productGrid');
    if(grid){scanCards();new MutationObserver(function(){scanCards();injectBarButton();}).observe(grid,{childList:true});}
    syncAll();
    if(arr)arrive(arr);
    window.addEventListener('popstate',function(e){
      var st=e.state,open=view.classList.contains('is-open');
      if(open&&!(st&&st.mtzVgl)){closeView(true);return;}
      if(!open&&st&&st.mtzVgl){var m=/[?&]vergleich=([^&#]+)/.exec(location.search);if(m&&setSelection(decodeURIComponent(m[1]).split(','))>=MIN){syncAll();openView({push:false});}}
    });
    /* another tab changed this category's selection */
    window.addEventListener('storage',function(e){if(e.key!==KEY)return;selected=ownIds();syncAll();});
  }
  function arrive(arr){
    var uniq=[];arr.raw.forEach(function(id){if(uniq.indexOf(id)<0)uniq.push(id);});
    var valid=uniq.filter(function(id){return BY_ID[id];}),bad=uniq.length-valid.length,over=valid.length>MAX;
    valid=valid.slice(0,MAX);fromMkl=arr.fromMkl;
    if(valid.length>=MIN){
      var prev=selected.slice(),differs=!arr.fromMkl&&prev.length>0&&prev.slice().sort().join()!==valid.slice().sort().join();
      if(differs)try{sessionStorage.setItem('mtz_vgl_prev',JSON.stringify(prev));}catch(e){}
      setSelection(valid);syncAll();openView({arrived:true});
      var msg=null,act=null;
      if(differs){msg='Geteilter Vergleich geöffnet.';act={label:'Meine Auswahl ('+prev.length+') wiederherstellen',fn:function(){setSelection(prev);syncAll();if(!view.classList.contains('is-open')&&selected.length>=MIN)openView({push:false});}};}
      else if(over)msg='Es werden die ersten '+MAX+' Modelle verglichen.';
      else if(bad)msg=(bad>1?bad+' Modelle':'1 Modell')+' aus dem Link '+(bad>1?'sind':'ist')+' nicht mehr verfügbar.';
      if(msg)setTimeout(function(){toast(msg,'info',act);},300);
      return;
    }
    try{history.replaceState(null,'',pageUrl([]));}catch(e){}
    if(valid.length===1){
      var prev1=selected.slice(),keep1=!arr.fromMkl&&prev1.length>0&&prev1.join()!==valid.join();   /* never drop the visitor's own selection silently */
      setSelection(valid);syncAll();
      setTimeout(function(){toast('Aus dem Link ist nur ein Modell verfügbar.','info',keep1?{label:'Meine Auswahl ('+prev1.length+') wiederherstellen',fn:function(){setSelection(prev1);syncAll();}}:null);},300);
      return;
    }
    /* none of this category: a handover from the other category's Merkliste (or ids of the other category) opens there.
       Prototype heuristic — on JTL the server resolves the category of each id. */
    var bkIds=Object.keys(BK_SEED),otherLens=arr.fromMkl||(LENSKEY==='briefkasten'?uniq.some(function(id){return bkIds.indexOf(id)<0;}):uniq.some(function(id){return bkIds.indexOf(id)>-1;}));
    if(otherLens){
      var other=(LENSKEY==='briefkasten')?{page:'index.html',label:'Türsprechanlagen'}:{page:'briefkasten.html',label:'Briefkästen'};
      setTimeout(function(){toast('Diese Modelle gehören zu '+other.label+'.','info',{label:'Dort öffnen',fn:function(){location.href=other.page+'?vergleich='+encodeURIComponent(uniq.join(','))+(arr.fromMkl?'&von=merkliste':'');}});},300);
    }else setTimeout(function(){toast('Dieser Vergleichs-Link ist nicht mehr gültig.','limit');},300);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
