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
  var MAX = 4, MIN = 2, KEY = 'mtz_vgl_flow';

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
  function euro(n){return (typeof n==='number')?n.toFixed(2).replace('.',',')+' €':'—';}
  function klingelLabel(k){return k==='flex'?'Flexibel (1–500)':k;}

  var SRC=(window.MTZ_PRODUCTS||[]), BY_ID={};
  function enrich(p){return {id:p.id,name:p.name,img:p.img,price:p.price,uvp:p.uvp,typ:(p.type==='audio'?'Audio':'Video'),system:(p.line||(p.system==='bus'?'2-Draht-BUS':'IP-System')),klingel:klingelLabel(p.klingel),haushalt:haushaltOf(p),zutritt:(p.tuer&&p.tuer.length)?p.tuer.map(function(k){return ZUT[k]||k;}):['Standard'],colors:p.colors||[],briefkasten:!!p.briefkasten,konfig:konfigOf(p),specs:profile(familyOf(p))};}
  SRC.forEach(function(p){BY_ID[p.id]=enrich(p);});

  var ROWS=[
    {group:'Grundlagen'},
    {key:'price',label:'Preis',get:function(p){return 'ab '+euro(p.price);}},
    {key:'typ',label:'Typ',get:function(p){return p.typ;}},
    {key:'system',label:'System',get:function(p){return p.system;}},
    {key:'haushalt',label:'Geeignet für',get:function(p){return p.haushalt;}},
    {key:'klingel',label:'Anzahl Klingeltaster',get:function(p){return p.klingel;}},
    {group:'Kamera & Bild'},
    {key:'kameraaufloesung',label:'Kameraauflösung',spec:true},
    {key:'sichtwinkel',label:'Sichtwinkel',spec:true},
    {key:'nachtsicht',label:'Nachtsicht',spec:true,bool:true},
    {group:'Smart & Zutritt'},
    {key:'app_steuerung',label:'App-Steuerung',spec:true,bool:true},
    {key:'sip_fritzbox',label:'SIP / FRITZ!Box',spec:true,bool:true},
    {key:'zutritt',label:'Zutritt',get:function(p){return p.zutritt.join(' · ');}},
    {key:'tueroeffner_relais',label:'Türöffner-Relais',spec:true},
    {group:'Bauform & Schutz'},
    {key:'schutzart',label:'Schutzart',spec:true},
    {key:'schlagfestigkeit',label:'Schlagfestigkeit',spec:true},
    {key:'display',label:'Display / Innenstation',spec:true},
    {key:'poe',label:'PoE (Power over Ethernet)',spec:true,bool:true},
    {key:'colors',label:'Farben',swatches:true},
    {key:'briefkasten',label:'Mit Briefkasten/Paketbox',get:function(p){return p.briefkasten;},bool:true}
  ];

  var selected=[];
  var compareMode=false;   /* card compare fields are hidden until the user starts a comparison */
  try{var raw=sessionStorage.getItem(KEY);if(raw)selected=JSON.parse(raw).filter(function(id){return BY_ID[id];});}catch(e){}
  function persist(){try{sessionStorage.setItem(KEY,JSON.stringify(selected));}catch(e){}}
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

  var tray,traySlots,trayLabel,trayHint,trayCta,view,viewBody,viewCount,diffCb,toastEl,toastT,barBtn,cancelBtn,lastFocus;

  function buildChrome(){
    tray=h('<div class="vgl-tray" role="region" aria-label="Vergleichsauswahl">'+
      '<div class="vgl-tray__inner">'+
        '<div class="vgl-tray__status">'+
          '<span class="vgl-tray__label" aria-live="polite">Vergleich (0)</span>'+
          '<span class="vgl-tray__hint" aria-live="polite"></span>'+
        '</div>'+
        '<div class="vgl-tray__slots"></div>'+
        '<div class="vgl-tray__actions">'+
          '<button class="vgl-link" type="button" data-vgl="reset">Zurücksetzen</button>'+
          '<button class="vgl-tray__cta" type="button" data-vgl="open" disabled>Vergleichen</button>'+
        '</div>'+
      '</div></div>');
    document.body.appendChild(tray);
    traySlots=tray.querySelector('.vgl-tray__slots');trayLabel=tray.querySelector('.vgl-tray__label');
    trayHint=tray.querySelector('.vgl-tray__hint');trayCta=tray.querySelector('[data-vgl="open"]');

    view=h('<div class="vgl-view" role="dialog" aria-modal="true" aria-labelledby="vglTitle" aria-hidden="true">'+
      '<div class="vgl-view__bar"><div class="vgl-view__bar-in">'+
        '<span class="vgl-view__title" id="vglTitle">Vergleich <span data-vgl="count">(0)</span></span>'+
        '<label class="vgl-diff"><input type="checkbox" data-vgl="diff"><span class="vgl-switch" aria-hidden="true"></span>Nur Unterschiede anzeigen</label>'+
        '<button class="vgl-link" type="button" data-vgl="clear">Alle entfernen</button>'+
        '<button class="vgl-close" type="button" data-vgl="close" aria-label="Vergleich schließen"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'+
      '</div></div>'+
      '<div class="vgl-view__scroll"><div class="vgl-view__scroll-in" data-vgl="body"></div></div></div>');
    document.body.appendChild(view);
    viewBody=view.querySelector('[data-vgl="body"]');viewCount=view.querySelector('[data-vgl="count"]');diffCb=view.querySelector('[data-vgl="diff"]');

    toastEl=h('<div class="vgl-toast" role="status" aria-live="polite"></div>');document.body.appendChild(toastEl);

    tray.addEventListener('click',function(e){var a=e.target.closest('[data-vgl]');if(a){var k=a.getAttribute('data-vgl');if(k==='reset')clearAll();if(k==='open')openView();return;}var rm=e.target.closest('[data-rm]');if(rm)toggle(rm.getAttribute('data-rm'),false);});
    view.addEventListener('click',function(e){var a=e.target.closest('[data-vgl]');if(a){var k=a.getAttribute('data-vgl');if(k==='close')closeView();if(k==='clear'){clearAll();closeView();}return;}var rm=e.target.closest('[data-rm]');if(rm){toggle(rm.getAttribute('data-rm'),false);if(selected.length<1)closeView();return;}var go=e.target.closest('[data-go]');if(go)toast('Weiter zur '+(/Konfigurieren/.test(go.textContent)?'Konfiguration':'Produktseite')+' — dort Farbe, Namensschild & Gravur wählen (Prototyp)','info');});
    diffCb.addEventListener('change',renderView);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&view.classList.contains('is-open'))closeView();});
  }

  /* toolbar control — rest: "Vergleichen" (starts compare mode → card fields appear);
     in mode: "Vergleich anzeigen (n)", grey until ≥2, teal + opens comparison from 2. */
  function injectBarButton(){
    var bar=document.querySelector('.catalog__bar'); if(!bar||bar.querySelector('.vgl-barwrap'))return;
    var wrap=h('<div class="vgl-barwrap"><button class="vgl-bar-btn" type="button">'+SCALE+'<span class="lbl">Vergleichen</span> <span class="cnt">0</span></button><button class="vgl-cancel" type="button">Abbrechen</button></div>');
    barBtn=wrap.querySelector('.vgl-bar-btn');
    cancelBtn=wrap.querySelector('.vgl-cancel');
    barBtn.addEventListener('click',function(){if(!compareMode){enterMode();}else if(canCompare()){openView();}});
    cancelBtn.addEventListener('click',exitMode);
    bar.appendChild(wrap);
    syncBar();
  }
  function enterMode(){compareMode=true;document.body.classList.add('vgl-mode');syncBar();var g=document.getElementById('productGrid');if(g)try{g.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}toast('Vergleichsmodus aktiv — wählen Sie 2 bis 4 Modelle über „Vergleichen" auf den Karten.','info');}
  function exitMode(){compareMode=false;document.body.classList.remove('vgl-mode');selected=[];persist();closeView();syncAll();}

  function toast(m,type){
    type=type||'ok';
    var ic=type==='limit'?IC_LIMIT:(type==='info'?IC_INFO:IC_OK);
    toastEl.className='vgl-toast t-'+type;
    toastEl.innerHTML=ic+'<span>'+m+'</span>';
    toastEl.classList.add('show');
    clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('show');},2600);
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

  function toggle(id,on){var i=selected.indexOf(id);if(on&&i<0){if(isFull()){toast('Maximal '+MAX+' Modelle gleichzeitig — bitte zuerst eines entfernen.','limit');return false;}selected.push(id);}else if(!on&&i>-1){selected.splice(i,1);}persist();syncAll();return true;}
  function clearAll(){selected=[];persist();syncAll();}

  function syncCards(){var grid=document.getElementById('productGrid');if(!grid)return;grid.querySelectorAll('.pcard[data-id]').forEach(function(c){var id=c.dataset.id,on=selected.indexOf(id)>-1,cb=c.querySelector('.vgl-toggle input'),lab=c.querySelector('.vgl-toggle');if(cb)cb.checked=on;c.classList.toggle('is-vgl',on);var dis=!on&&isFull();if(cb)cb.disabled=dis;if(lab)lab.classList.toggle('is-disabled',dis);});}
  function syncBar(){
    if(!barBtn)return;
    var n=selected.length;
    barBtn.querySelector('.cnt').textContent=n;
    var lbl=barBtn.querySelector('.lbl');
    if(!compareMode){
      lbl.textContent='Vergleichen';
      barBtn.classList.remove('is-active','is-wait');
      barBtn.setAttribute('aria-label','Vergleich starten');
      barBtn.removeAttribute('aria-disabled');
    }else{
      lbl.textContent='Vergleich anzeigen';
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
    tray.classList.toggle('is-open',n>0);
    document.body.style.paddingBottom=n>0?'88px':'';
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
  }
  function syncAll(){syncCards();syncBar();syncTray();if(view.classList.contains('is-open'))renderView();}

  function cellVal(p,row){return row.spec?p.specs[row.key]:(row.get?row.get(p):p[row.key]);}
  function disp(v,row){if(row.bool)return v===true?'ja':(v===false?'nein':'–');if(v==null||v==='')return '–';return String(v);}
  function renderView(){
    var items=selected.map(function(id){return BY_ID[id];});
    viewCount.textContent='('+items.length+')';
    if(items.length<2){viewBody.innerHTML='<div class="vgl-empty">'+SCALE+'<b>Mindestens zwei Modelle wählen</b><span>Markieren Sie über „Vergleichen" auf den Produktkarten weitere Anlagen, um sie hier gegenüberzustellen.</span></div>';return;}
    var onlyDiff=diffCb.checked;
    var cols='<col class="rl">'+items.map(function(){return '<col class="pc">';}).join('');
    var emptyCells=items.map(function(){return '<td></td>';}).join('');
    var thead='<thead><tr><th class="rh" scope="col"><span class="vgl-visually-hidden">Merkmal</span></th>';
    items.forEach(function(p){thead+='<th class="vgl-ph" scope="col"><div class="vgl-ph__media"><button class="vgl-ph__rm" type="button" data-rm="'+p.id+'" aria-label="'+esc(p.name)+' entfernen">×</button><img src="'+esc(p.img)+'" alt="'+esc(p.name)+'"></div><div class="vgl-ph__name">'+esc(p.name)+'</div><div class="vgl-ph__price">ab '+euro(p.price)+'<small>'+(p.uvp?'UVP '+euro(p.uvp):'&nbsp;')+'</small></div><button class="btn btn--primary" type="button" data-go>'+(p.konfig?'Konfigurieren':'Zum Produkt')+'</button></th>';});
    thead+='</tr></thead>';
    var tbody='<tbody>',curG=null,gRows='',any=false;
    function flush(){if(curG!==null&&gRows!==''){tbody+='<tr class="vgl-group"><th class="rh" scope="rowgroup">'+esc(curG)+'</th>'+emptyCells+'</tr>'+gRows;}gRows='';}
    ROWS.forEach(function(row){
      if(row.group){flush();curG=row.group;return;}
      var vals=items.map(function(p){return cellVal(p,row);});
      var texts=vals.map(function(v){return disp(v,row);});
      var same=texts.every(function(t){return t===texts[0];});
      if(onlyDiff&&same)return;
      any=true;
      var tr='<tr class="'+(same?'':'is-diff')+'"><th class="rh" scope="row">'+esc(row.label)+(same?'':'<span class="vgl-dot" aria-hidden="true" title="unterscheidet sich"></span>')+'</th>';
      items.forEach(function(p,i){var v=vals[i],t=texts[i],na=(t==='–'),inner;if(row.swatches)inner=swHTML(p.colors,10);else if(row.bool){inner=v===true?'<span class="vgl-yes">'+CHK+'Ja</span>':(v===false?'<span class="vgl-no">Nein</span>':'<span class="vgl-no">–</span>');}else inner=esc(t);tr+='<td class="vgl-val'+(na?' na':'')+'">'+inner+'</td>';});
      tr+='</tr>';gRows+=tr;
    });
    flush();
    if(onlyDiff&&!any)tbody+='<tr><th class="rh" scope="row">—</th><td class="vgl-val na" colspan="'+items.length+'">Alle ausgewählten Modelle sind in diesen Merkmalen identisch.</td></tr>';
    tbody+='</tbody>';
    viewBody.innerHTML='<div class="vgl-wrap"><table class="vgl-t"><colgroup>'+cols+'</colgroup>'+thead+tbody+'</table></div>';
  }
  function openView(){if(selected.length<MIN)return;lastFocus=document.activeElement;renderView();view.classList.add('is-open');view.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';view.querySelector('[data-vgl="close"]').focus();}
  function closeView(){view.classList.remove('is-open');view.setAttribute('aria-hidden','true');document.body.style.overflow='';if(lastFocus&&lastFocus.focus&&document.contains(lastFocus))lastFocus.focus();}

  /* =========================================================
     Guided flow tour
     ========================================================= */
  var TRIO=['kai1','colson1','sdm10x'];  // Audio · VDM10 · SDM10X (all on page 1)
  var coach,coachProg,coachStep,coachTitle,coachText,coachBack,coachNext,coachEnd,spotEl,cur=0;
  var STEPS=[
    {k:'Schritt 1 / 6',t:'Ruhezustand',x:'Zunächst ist der Vergleich reduziert: auf den Produktkarten sind <b>keine Auswahlfelder</b> sichtbar. In der Ergebnisleiste lädt die Schaltfläche „Vergleichen" dazu ein, den Vergleich zu starten.',target:function(){return barBtn;}},
    {k:'Schritt 2 / 6',t:'Vergleich starten',x:'Ein Klick auf „Vergleichen" aktiviert den Vergleichsmodus — <b>jetzt erscheint auf jeder Produktkarte ein „Vergleichen"-Feld</b>. Wählen Sie damit 2–4 Modelle.',target:function(){return cardToggle(TRIO[0])||barBtn;}},
    {k:'Schritt 3 / 6',t:'Ab zwei Artikeln aktiv',x:'Sobald zwei oder mehr Modelle markiert sind, wird „Vergleich anzeigen (3)" <b>aktiv</b> (grün) — in der Ergebnisleiste und in der Auswahlleiste unten.',target:function(){return barBtn;}},
    {k:'Schritt 4 / 6',t:'Gegenüberstellung',x:'Ein Klick öffnet die Gegenüberstellung: Fachwerte in Gruppen (Grundlagen, Kamera & Bild, Smart & Zutritt, Bauform & Schutz), Unterschiede mit einem Punkt markiert. Audio-Modelle zeigen bei Kamera-Werten neutral „–".',target:function(){return null;}},
    {k:'Schritt 5 / 6',t:'Nur Unterschiede',x:'Mit „Nur Unterschiede anzeigen" bleiben nur die abweichenden Merkmale sichtbar — ideal, um schnell zu entscheiden.',target:function(){return view.querySelector('.vgl-diff');}},
    {k:'Schritt 6 / 6',t:'Weiter im Kauf',x:'Aus dem Vergleich geht es direkt weiter: <b>Konfigurieren</b> bzw. <b>Zum Produkt</b> (kein Direktkauf, da individualisierbar), Artikel entfernen oder weitere hinzufügen. Das ist der komplette Ablauf.',target:function(){return null;},last:true}
  ];
  function cardToggle(id){var c=document.querySelector('.pcard[data-id="'+id+'"] .vgl-toggle');return c;}
  function clearSpot(){if(spotEl){spotEl.classList.remove('vgl-spot');spotEl=null;}}
  function spot(el){clearSpot();if(!el)return;spotEl=el;el.classList.add('vgl-spot');try{el.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}}

  function applyState(step){
    closeView();
    compareMode = step>=1;                     /* step 1+ = compare mode on → card fields visible */
    document.body.classList.toggle('vgl-mode',compareMode);
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

  /* ---- Init ---- */
  function init(){
    if(!window.MTZ_PRODUCTS)return setTimeout(init,50);
    if(!SRC.length){SRC=window.MTZ_PRODUCTS;SRC.forEach(function(p){if(!BY_ID[p.id])BY_ID[p.id]=enrich(p);});}
    compareMode = selected.length>0;   /* restore mode if a selection persisted across reload */
    if(compareMode)document.body.classList.add('vgl-mode');
    buildChrome(); buildCoach(); injectBarButton();
    var grid=document.getElementById('productGrid');
    if(grid){scanCards();new MutationObserver(function(){scanCards();injectBarButton();}).observe(grid,{childList:true});}
    syncAll();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
