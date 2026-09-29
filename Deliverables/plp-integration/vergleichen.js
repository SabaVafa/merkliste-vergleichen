/* ============================================================
   Metzler — Vergleichen add-on (PLP Türsprechanlagen)
   Enhances the existing PLP (sprechanlage.js) without touching it:
   - injects a "Vergleichen" toggle into every .pcard (via MutationObserver,
     so it survives filtering & pagination re-renders)
   - persistent tray + accessible side-by-side compare overlay
   - session-based selection (guest-friendly, like native JTL Vergleichsliste)
   Data: window.MTZ_PRODUCTS (exposed by sprechanlage.js) + Phase-0 spec seeds.
   ============================================================ */
(function () {
  'use strict';
  var MAX = 4, KEY = 'mtz_vgl';

  /* ---- Swatch palette (same values as the PLP COLORS map) ---- */
  var SW = {
    anthrazit:'#383E42', braun:'#5A3B29',
    edelstahl:'linear-gradient(135deg,#e9ebee,#a7adb4 55%,#d6d9dd)',
    eisenglimmer:'linear-gradient(135deg,#3a3d40,#23262a)',
    grau:'#B9BCC0', schwarz:'#1A171B', weiss:'#FFFFFF',
    wunschfarbe:'conic-gradient(from 90deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa,#e53935)'
  };
  var SWL = {anthrazit:'Anthrazit',braun:'Braun',edelstahl:'Edelstahl',eisenglimmer:'Eisenglimmer',grau:'Grau',schwarz:'Schwarz',weiss:'Weiß',wunschfarbe:'Wunschfarbe'};
  var ZUT = {rfid:'RFID',gesicht:'Gesichtserkennung',pin:'PIN-Code',qr:'QR-Code',fingerprint:'Fingerprint'};

  /* ---- Spec profiles by model family (Phase-0 §4, real values) ---- */
  function profile(kind){
    switch(kind){
      case 'audio': return {kameraaufloesung:null,sichtwinkel:null,nachtsicht:null,schutzart:'IP-geschützt',schlagfestigkeit:null,app_steuerung:true,sip_fritzbox:true,tueroeffner_relais:1,display:'separate Innenstation',poe:true};
      case 'xdm':   return {kameraaufloesung:'2 MP Full-HD',sichtwinkel:'Weitwinkel',nachtsicht:true,schutzart:'witterungsbeständig',schlagfestigkeit:null,app_steuerung:true,sip_fritzbox:true,tueroeffner_relais:2,display:'separate Innenstation (7″)',poe:false};
      case 'sdm':   return {kameraaufloesung:'2 MP Full-HD',sichtwinkel:'88° (Dual-Lens)',nachtsicht:true,schutzart:null,schlagfestigkeit:'IK07',app_steuerung:true,sip_fritzbox:true,tueroeffner_relais:2,display:'integriertes IPS-Touch-Display 1280×800',poe:true};
      default:      return {kameraaufloesung:'2 MP Full-HD',sichtwinkel:'146° / 82° (Ultraweitwinkel)',nachtsicht:true,schutzart:'IP65',schlagfestigkeit:'IK09',app_steuerung:true,sip_fritzbox:true,tueroeffner_relais:2,display:'separate Innenstation',poe:true};
    }
  }
  function familyOf(p){
    var n=p.name||'', s=(p.system||'').toLowerCase();
    if(/SDM10/i.test(n)) return 'sdm';
    if(s==='bus'||/XDM10|2-Draht/i.test(n)) return 'xdm';
    if(p.type==='audio'||/ADM10|Audio/i.test(n)) return 'audio';
    return 'vdm';
  }
  function haushaltOf(p){
    if(p.klingel==='flex') return 'Skalierbar (1–500)';
    if(/Mehrfamilien/i.test(p.name)) return 'Mehrfamilienhaus';
    if(p.klingel && p.klingel!=='1') return 'Mehrfamilienhaus';
    return 'Einfamilienhaus';
  }
  function konfigOf(p){
    return !!p.briefkasten || p.klingel==='flex' || /SDM10|modular|Paketbox|Standbriefkast/i.test(p.name);
  }
  function euro(n){ return (typeof n==='number') ? n.toFixed(2).replace('.',',')+' €' : '—'; }
  function klingelLabel(k){ return k==='flex' ? 'Flexibel (1–500)' : k; }

  /* ---- Build enriched model map ---- */
  var SRC = (window.MTZ_PRODUCTS || []);
  var BY_ID = {};
  SRC.forEach(function(p){
    BY_ID[p.id] = {
      id:p.id, name:p.name, img:p.img, price:p.price, uvp:p.uvp,
      typ:(p.type==='audio'?'Audio':'Video'),
      system:(p.line || (p.system==='bus'?'2-Draht-BUS':'IP-System')),
      klingel:klingelLabel(p.klingel),
      haushalt:haushaltOf(p),
      zutritt:(p.tuer&&p.tuer.length)?p.tuer.map(function(k){return ZUT[k]||k;}):['Standard'],
      colors:p.colors||[],
      briefkasten:!!p.briefkasten,
      konfig:konfigOf(p),
      specs:profile(familyOf(p))
    };
  });

  /* ---- Compare rows (Phase-0 §5) ---- */
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

  /* ---- State ---- */
  var selected=[];
  try{var raw=sessionStorage.getItem(KEY);if(raw)selected=JSON.parse(raw).filter(function(id){return BY_ID[id];});}catch(e){}
  function persist(){try{sessionStorage.setItem(KEY,JSON.stringify(selected));}catch(e){}}
  function isFull(){return selected.length>=MAX;}

  /* ---- Helpers ---- */
  function h(html){var d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  function swHTML(colors,lim){lim=lim||8;var o='';(colors||[]).slice(0,lim).forEach(function(c){if(SW[c])o+='<span title="'+SWL[c]+'" style="background:'+SW[c]+'"></span>';});return '<span class="vgl-sw">'+o+'</span>';}

  /* ---- DOM: tray + overlay + toast (built once, appended to body) ---- */
  var tray,traySlots,trayLabel,view,viewBody,viewCount,diffCb,toastEl,toastT,lastFocus;
  function buildChrome(){
    tray=h('<div class="vgl-tray" role="region" aria-label="Vergleichsauswahl">'+
      '<div class="vgl-tray__inner">'+
        '<span class="vgl-tray__label" aria-live="polite">Vergleich (0)</span>'+
        '<div class="vgl-tray__slots"></div>'+
        '<div class="vgl-tray__actions">'+
          '<button class="vgl-link" type="button" data-vgl="reset">Zurücksetzen</button>'+
          '<button class="btn btn--primary" type="button" data-vgl="open" style="height:40px">Vergleichen</button>'+
        '</div>'+
      '</div></div>');
    document.body.appendChild(tray);
    traySlots=tray.querySelector('.vgl-tray__slots');
    trayLabel=tray.querySelector('.vgl-tray__label');

    view=h('<div class="vgl-view" role="dialog" aria-modal="true" aria-labelledby="vglTitle" aria-hidden="true">'+
      '<div class="vgl-view__bar"><div class="vgl-view__bar-in">'+
        '<span class="vgl-view__title" id="vglTitle">Vergleich <span data-vgl="count">(0)</span></span>'+
        '<label class="vgl-diff"><input type="checkbox" data-vgl="diff"><span class="vgl-switch" aria-hidden="true"></span>Nur Unterschiede anzeigen</label>'+
        '<button class="vgl-link" type="button" data-vgl="clear">Alle entfernen</button>'+
        '<button class="vgl-close" type="button" data-vgl="close" aria-label="Vergleich schließen"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'+
      '</div></div>'+
      '<div class="vgl-view__scroll"><div class="vgl-view__scroll-in" data-vgl="body"></div></div>'+
    '</div>');
    document.body.appendChild(view);
    viewBody=view.querySelector('[data-vgl="body"]');
    viewCount=view.querySelector('[data-vgl="count"]');
    diffCb=view.querySelector('[data-vgl="diff"]');

    toastEl=h('<div class="vgl-toast" role="status" aria-live="polite"></div>');
    document.body.appendChild(toastEl);

    /* events */
    tray.addEventListener('click',function(e){
      var a=e.target.closest('[data-vgl]'); if(!a){var rm=e.target.closest('[data-rm]');if(rm)toggle(rm.getAttribute('data-rm'),false);return;}
      var act=a.getAttribute('data-vgl');
      if(act==='reset')clearAll();
      if(act==='open')openView();
    });
    view.addEventListener('click',function(e){
      var a=e.target.closest('[data-vgl]');
      if(a){var act=a.getAttribute('data-vgl');if(act==='close')closeView();if(act==='clear'){clearAll();closeView();}return;}
      var rm=e.target.closest('[data-rm]'); if(rm){toggle(rm.getAttribute('data-rm'),false);if(selected.length<1)closeView();return;}
      var go=e.target.closest('[data-go]'); if(go){toast('Weiter zur '+(/Konfigurieren/.test(go.textContent)?'Konfiguration':'Produktseite')+' — dort Farbe, Namensschild & Gravur wählen (Prototyp)');}
    });
    diffCb.addEventListener('change',renderView);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&view.classList.contains('is-open'))closeView();});
  }
  function toast(m){toastEl.textContent=m;toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('show');},2400);}

  /* ---- Inject compare toggle into each card ---- */
  function injectToggle(cardEl){
    if(cardEl.querySelector('.vgl-toggle'))return;
    var id=cardEl.dataset.id; if(!id||!BY_ID[id])return;
    var foot=cardEl.querySelector('.pcard__footer')||cardEl.querySelector('.pcard__body')||cardEl;
    var on=selected.indexOf(id)>-1;
    var lbl=h('<label class="vgl-toggle" data-vgl-card="'+id+'">'+
      '<input type="checkbox" '+(on?'checked':'')+' aria-label="'+esc(BY_ID[id].name)+' zum Vergleich hinzufügen">'+
      '<span class="vgl-box" aria-hidden="true">'+CHK+'</span>Vergleichen</label>');
    lbl.querySelector('input').addEventListener('change',function(e){
      var ok=toggle(id,e.target.checked); if(!ok)e.target.checked=false;
    });
    foot.appendChild(lbl);
    cardEl.classList.toggle('is-vgl',on);
  }
  function scanCards(){
    var grid=document.getElementById('productGrid'); if(!grid)return;
    grid.querySelectorAll('.pcard[data-id]').forEach(injectToggle);
    syncCards();
  }

  /* ---- Selection ---- */
  function toggle(id,on){
    var i=selected.indexOf(id);
    if(on&&i<0){ if(isFull()){toast('Sie können bis zu '+MAX+' Modelle vergleichen.');return false;} selected.push(id);}
    else if(!on&&i>-1){selected.splice(i,1);}
    persist(); syncCards(); syncTray(); if(view.classList.contains('is-open'))renderView(); return true;
  }
  function clearAll(){selected=[];persist();syncCards();syncTray();}

  function syncCards(){
    var grid=document.getElementById('productGrid'); if(!grid)return;
    grid.querySelectorAll('.pcard[data-id]').forEach(function(cardEl){
      var id=cardEl.dataset.id, on=selected.indexOf(id)>-1;
      var cb=cardEl.querySelector('.vgl-toggle input');
      var lab=cardEl.querySelector('.vgl-toggle');
      if(cb)cb.checked=on;
      cardEl.classList.toggle('is-vgl',on);
      var dis=!on&&isFull();
      if(cb)cb.disabled=dis;
      if(lab)lab.classList.toggle('is-disabled',dis);
    });
  }
  function syncTray(){
    var n=selected.length;
    trayLabel.textContent='Vergleich ('+n+')';
    tray.classList.toggle('is-open',n>0);
    document.body.style.paddingBottom=n>0?'84px':'';
    traySlots.innerHTML='';
    for(var s=0;s<MAX;s++){
      var id=selected[s];
      if(id){var p=BY_ID[id];
        traySlots.appendChild(h('<div class="vgl-slot"><img src="'+esc(p.img)+'" alt="'+esc(p.name)+'"><button class="vgl-slot__rm" type="button" data-rm="'+id+'" aria-label="'+esc(p.name)+' aus Vergleich entfernen">×</button></div>'));
      }else{
        traySlots.appendChild(h('<div class="vgl-slot empty" aria-hidden="true"></div>'));
      }
    }
  }

  /* ---- Compare overlay ---- */
  function cellVal(p,row){ return row.spec?p.specs[row.key]:(row.get?row.get(p):p[row.key]); }
  function disp(v,row){ if(row.bool)return v===true?'ja':(v===false?'nein':'–'); if(v==null||v==='')return '–'; return String(v); }
  function renderView(){
    var items=selected.map(function(id){return BY_ID[id];});
    viewCount.textContent='('+items.length+')';
    if(items.length<2){
      viewBody.innerHTML='<div class="vgl-empty"><b>Bitte wählen Sie mindestens zwei Modelle.</b><span>Über „Vergleichen" auf den Produktkarten weitere Anlagen hinzufügen.</span></div>';
      return;
    }
    var onlyDiff=diffCb.checked;
    var cols='<col class="rl">'+items.map(function(){return '<col class="pc">';}).join('');
    var emptyCells=items.map(function(){return '<td></td>';}).join('');
    /* head */
    var thead='<thead><tr><th class="rh" scope="col"><span class="vgl-visually-hidden">Merkmal</span></th>';
    items.forEach(function(p){
      thead+='<th class="vgl-ph" scope="col">'+
        '<div class="vgl-ph__media"><button class="vgl-ph__rm" type="button" data-rm="'+p.id+'" aria-label="'+esc(p.name)+' entfernen">×</button><img src="'+esc(p.img)+'" alt="'+esc(p.name)+'"></div>'+
        '<div class="vgl-ph__name">'+esc(p.name)+'</div>'+
        '<div class="vgl-ph__price">ab '+euro(p.price)+(p.uvp?'<small>UVP '+euro(p.uvp)+'</small>':'')+'</div>'+
        '<button class="btn btn--primary" type="button" data-go>'+(p.konfig?'Konfigurieren':'Zum Produkt')+'</button>'+
      '</th>';
    });
    thead+='</tr></thead>';
    /* body, group-aware */
    var tbody='<tbody>',curGroup=null,gRows='',any=false;
    function flush(){ if(curGroup!==null&&gRows!==''){tbody+='<tr class="vgl-group"><th class="rh" scope="rowgroup">'+esc(curGroup)+'</th>'+emptyCells+'</tr>'+gRows;} gRows=''; }
    ROWS.forEach(function(row){
      if(row.group){flush();curGroup=row.group;return;}
      var vals=items.map(function(p){return cellVal(p,row);});
      var texts=vals.map(function(v){return disp(v,row);});
      var same=texts.every(function(t){return t===texts[0];});
      if(onlyDiff&&same)return;
      any=true;
      var tr='<tr class="'+(same?'':'is-diff')+'"><th class="rh" scope="row">'+esc(row.label)+(same?'':'<span class="vgl-dot" aria-hidden="true" title="unterscheidet sich"></span>')+'</th>';
      items.forEach(function(p,i){
        var v=vals[i],t=texts[i],na=(t==='–'),inner;
        if(row.swatches)inner=swHTML(p.colors,10);
        else if(row.bool){inner=v===true?'<span class="vgl-yes">'+CHK+'Ja</span>':(v===false?'<span class="vgl-no">Nein</span>':'<span class="vgl-no">–</span>');}
        else inner=esc(t);
        tr+='<td class="vgl-val'+(na?' na':'')+'">'+inner+'</td>';
      });
      tr+='</tr>'; gRows+=tr;
    });
    flush();
    if(onlyDiff&&!any)tbody+='<tr><th class="rh" scope="row">—</th><td class="vgl-val na" colspan="'+items.length+'">Alle ausgewählten Modelle sind in diesen Merkmalen identisch.</td></tr>';
    tbody+='</tbody>';
    viewBody.innerHTML='<div class="vgl-wrap"><table class="vgl-t"><colgroup>'+cols+'</colgroup>'+thead+tbody+'</table></div>';
  }
  function openView(){ if(selected.length<1)return; lastFocus=document.activeElement; renderView(); view.classList.add('is-open'); view.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; view.querySelector('[data-vgl="close"]').focus(); }
  function closeView(){ view.classList.remove('is-open'); view.setAttribute('aria-hidden','true'); document.body.style.overflow=''; if(lastFocus&&lastFocus.focus)lastFocus.focus(); }

  /* ---- Init ---- */
  function init(){
    if(!window.MTZ_PRODUCTS){ /* PLP data not ready yet — retry shortly */ return setTimeout(init,50); }
    if(!SRC.length){ SRC=window.MTZ_PRODUCTS; SRC.forEach(function(p){ if(!BY_ID[p.id]) BY_ID[p.id]={id:p.id,name:p.name,img:p.img,price:p.price,uvp:p.uvp,typ:(p.type==='audio'?'Audio':'Video'),system:(p.line||(p.system==='bus'?'2-Draht-BUS':'IP-System')),klingel:klingelLabel(p.klingel),haushalt:haushaltOf(p),zutritt:(p.tuer&&p.tuer.length)?p.tuer.map(function(k){return ZUT[k]||k;}):['Standard'],colors:p.colors||[],briefkasten:!!p.briefkasten,konfig:konfigOf(p),specs:profile(familyOf(p))}; }); }
    buildChrome();
    var grid=document.getElementById('productGrid');
    if(grid){
      scanCards();
      new MutationObserver(function(){scanCards();}).observe(grid,{childList:true});
    }
    syncTray();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
