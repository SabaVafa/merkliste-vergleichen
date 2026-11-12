/* ============================================================
   Metzler — Merkliste add-on (Version B prototype)
   Spec: Deliverables/05_Merkliste_Flow_und_Interface.md
     · bookmark on every PLP card (always visible, independent of compare mode)
     · header control with count badge → right drawer (full-screen on mobile)
     · item rows: model-first name, price, Konfigurieren / Zum Produkt,
       "Vergleichen" checkbox, Entfernen + undo, Alle entfernen + confirm
     · "Auswahl vergleichen (n)" hands over to the compare overlay via
       window.MTZ_VGL.compare(ids) — same lens — or ?vergleich=id,id on the
       other PLP (cross-lens)
     · bookmark in every compare-overlay column (decorated via MutationObserver)
     · localStorage['mtz_merkliste'] = {v:1, updatedAt, items[]}, limit 50
     · 09b: share as #liste= link (no account) + shared view, print/PDF,
       current price + change since saving, all configuration positions,
       "Zurück zum Vergleich" on the PDP ("Alle n auswählen" removed 11.11., user decision)
     · pick mode (10.11.): MTZ_MKL.open({pick:{lens, inCmp, slots, onAdd}})
       from the comparison's "Aus der Merkliste" — tick models, "Zum
       Vergleich hinzufügen" hands them to onAdd; models already compared
       show "Im Vergleich". Also on the category page while compare mode
       is on: the drawer adds to the selection in the strip (MTZ_VGL.add)
   Decoupled layer: reads window.MTZ_PRODUCTS / window.MTZ_LENS, touches no
   PLP file, defines no vgl- class and changes nothing in vergleichen.js.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'mtz_merkliste', LIMIT = 50, CMP_MAX = 4, CMP_MIN = 2, TOAST_MS = 5000, TOAST_UNDO_MS = 10000;   /* emptying the whole list: 10 s to undo (pauses on hover / focus) */
  var LENS = window.MTZ_LENS || 'sprechanlage';
  var BASE = window.MTZ_MKL_BASE || '';                 /* '' on the PLPs, '../' on pdp/index.html — stored paths are relative to vergleichen-flow-B */
  var PDP_URLS = { colson1: 'pdp/index.html' };         /* products that have a PDP in the prototype */
  var PDP = (window.MTZ_PDP && window.MTZ_PDP_PRODUCT) ? window.MTZ_PDP_PRODUCT : null;   /* product detail page mode (07a/07b) */
  function asset(u) { u = String(u || ''); return (/^(https?:|data:|\/|#)/.test(u) || !u) ? u : BASE + u; }
  var LENSES = {
    sprechanlage: { label: 'Türsprechanlagen', page: 'index.html', img: 'Product%20Image/Sprechanlage/video-station.png' },
    briefkasten:  { label: 'Briefkästen',      page: 'briefkasten.html', img: 'Product%20Image/einfamilien-briefkasten.png' }
  };
  var QS = String(location.search || '');   /* captured at parse time */

  /* ---- Storage ---- */
  var storageOk = (function () { try { var k = 'mtz_mkl_probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  var items = [];
  function load() {
    if (!storageOk) return;
    try { var raw = localStorage.getItem(KEY); if (!raw) { items = []; return; } var d = JSON.parse(raw); items = (d && d.v === 1 && Array.isArray(d.items)) ? d.items.filter(function (it) { return it && it.id; }) : []; } catch (e) { items = []; }
  }
  function save() {
    if (!storageOk) return;
    try { localStorage.setItem(KEY, JSON.stringify({ v: 1, updatedAt: new Date().toISOString(), items: items })); } catch (e) { storageOk = false; if (notice) notice.hidden = false; }
  }
  function indexOf(id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return i; return -1; }
  function has(id) { return indexOf(id) > -1; }
  function byId(id) { var i = indexOf(id); return i > -1 ? items[i] : null; }
  function isFull() { return items.length >= LIMIT; }

  /* ---- Product data (same derivations as the compare add-on, per lens) ---- */
  var BY_ID = {};
  function indexProducts() { (window.MTZ_PRODUCTS || []).forEach(function (p) { BY_ID[String(p.id)] = p; }); }
  function konfigOf(p) {
    if (p.konfig === true) return true;
    var nm = String(p.name || '');
    if (LENS === 'briefkasten') return !/ohne Gravur|Basic/i.test(nm);
    return !!p.briefkasten || p.klingel === 'flex' || /SDM10|modular|Paketbox|Standbriefkast/i.test(nm);
  }
  function imgOf(p, cardEl) {
    var im = cardEl && cardEl.querySelector('.pcard__img');
    if (im && im.getAttribute('src')) return im.getAttribute('src');
    return p.img || LENSES[LENS].img;
  }
  function itemFrom(p, cardEl) {
    return { id: String(p.id), articleId: String(p.id), lens: LENS, name: p.name, url: (PDP_URLS[String(p.id)] || '#'), img: imgOf(p, cardEl), priceFrom: (typeof p.price === 'number' ? p.price : null), uvp: (typeof p.uvp === 'number' ? p.uvp : null), konfig: konfigOf(p), addedAt: new Date().toISOString(), priceAtAdd: (typeof p.price === 'number' ? p.price : null), priceSrc: (PDP ? 'pdp' : 'plp') };
  }
  /* 09b P0-5: current price per source. PLP and PDP are separate price sources in the prototype (colson1: 594,15 € vs 699 €),
     so a price is only compared against the source it was saved from; on JTL there is one source and this guard disappears */
  function curPrice(it) {
    if (!it || it.configId) return null;
    var id = it.articleId || it.id, src = it.priceSrc;
    if (src === 'pdp') return (PDP && id === PDP.id && typeof PDP.price === 'number') ? PDP.price : null;
    if (src === 'plp' || (!src && it.url !== 'pdp/index.html')) { if (PDP || (it.lens || LENS) !== LENS) return null; var p = BY_ID[id]; return (p && typeof p.price === 'number') ? p.price : null; }
    return null;
  }
  function curUvp(it) {
    var id = it.articleId || it.id;
    if (it.priceSrc === 'pdp') return (PDP && id === PDP.id && typeof PDP.uvp === 'number') ? PDP.uvp : null;
    var p = BY_ID[id]; return (p && typeof p.uvp === 'number') ? p.uvp : null;
  }
  /* display price follows the current price; priceAtAdd stays the reference and is never overwritten */
  function refreshPrices() {
    var changed = false;
    items.forEach(function (it) {
      var c = curPrice(it); if (c === null) return;
      if (it.priceFrom !== c) { it.priceFrom = c; changed = true; }
      var u = curUvp(it); if (u !== null && it.uvp !== u) { it.uvp = u; changed = true; }
    });
    if (changed) save();
  }
  var cfgLive = {};   /* configId → current total, known on the PDP after arrive() */
  function deltaHTML(it) {
    var cur, ref;
    if (it.configId) { cur = cfgLive[it.configId]; ref = it.configTotal; }
    else { if (!it.priceSrc) return ''; cur = curPrice(it); ref = it.priceAtAdd; }
    if (typeof cur !== 'number' || typeof ref !== 'number') return '';
    var d = Math.round((cur - ref) * 100) / 100; if (Math.abs(d) < 1) return '';
    var down = d < 0;
    return '<p class="mkl-item__delta mkl-item__delta--' + (down ? 'down' : 'up') + '">' + (down ? IC_DOWN : IC_UP) +
      '<span>' + (down ? 'Seit dem Merken gesunken: <b>\u2212' + euro(-d) + '</b>' : 'Seit dem Merken gestiegen: +' + euro(d)) + ' (vorher ' + euro(ref) + ')</span></p>';
  }
  /* "Modell | Klingeltaster | Zusatz" → bold model line + muted qualifier (mirrors the compare header; Briefkästen: design line first) */
  var MODEL_RE = /^[A-Z]{2,4}\d{2}[A-Z0-9.]*(?:\s[\d.]+)?$/;   /* XDM10 · VDM10 2.0 · SDM10X · ADM10 — a trailing model segment moves to the front */
  function shortName(it) {
    var parts = String(it.name || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    if (it.lens === 'briefkasten' && parts.length > 1) return { main: parts[parts.length - 1], sub: parts.slice(0, -1).join(' · ') };
    for (var i = 1; i < parts.length; i++) if (MODEL_RE.test(parts[i])) { var rest = parts.slice(); rest.splice(i, 1); return { main: parts[i] + ' ' + parts[0], sub: rest.slice(1).join(' · ') }; }
    return { main: parts[0] || it.name || '', sub: parts.slice(1).join(' · ') };
  }
  function fmtDate(iso) { try { return new Date(iso).toLocaleDateString('de-DE'); } catch (e) { return ''; } }
  function euro(n) { return (typeof n === 'number') ? n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace(/\.(\d{2})$/, ',$1') + ' €' : '–'; }

  /* ---- DOM helpers + icons ---- */
  function h(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var HEART_PATH = 'M4.5 1.7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v22.9a.6.6 0 0 1-.97.47L13.5 19.4l-8.03 5.67a.6.6 0 0 1-.97-.47V1.7z';   /* bookmark glyph (Merkliste = Lesezeichen) — drawn on the DS icon canvas 27×26 like profile.svg / cart.svg: 1.4 line, round joins, ≈1-unit corner radius */
  var HEART = '<svg viewBox="0 0 27 26" aria-hidden="true"><path d="' + HEART_PATH + '"/></svg>';
  var CHK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  var IC_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var IC_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
  var IC_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="8.4 12.5 11 15 16 9.5"/></svg>';
  var IC_INFO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.6" r="0.6"/></svg>';
  var IC_LIMIT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13.5"/><circle cx="12" cy="17" r="0.6"/></svg>';
  var IC_SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>';
  var IC_CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var IC_CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var IC_CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  var IC_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="6 13 12 19 18 13"/></svg>';
  var IC_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/></svg>';
  var reduced = function () { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  /* ---- Chrome ---- */
  var hdrBtn, hdrBadge, scrim, drawer, titleEl, countEl, clearBtn, notice, listEl, emptyEl, footHint, cta, footEl, toastEl, toastT, liveEl;
  var recentEl, toolsEl, shareBtn, askEl, popEl, sharedEl, sharedLink, hintEl;
  var sharedList = null, sharedMode = false, openParts = {};   /* 09b: shared list (sessionStorage), expanded configuration rows */
  /* storage note (10.11.): icon + a bold statement + one explaining sentence; 14 px instead of 12 px grey caption */
  /* hint glyph (11.11., user decision): info circle = "Hinweis"; replaces the device icon. DS icon style: inline,
     currentColor stroke 1.8, round caps; decorative (the sentence carries the meaning). */
  var IC_HINT = '<svg class="mkl-hint__ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.75" r=".6" fill="currentColor" stroke="none"/></svg>';
  var OWN_HINT = IC_HINT + '<span class="mkl-hint__t"><b>Auf diesem Gerät gespeichert.</b> <a href="#konto" data-mkl="login">Anmelden</a>, um Ihre Merkliste auf allen Geräten zu nutzen.</span>';
  var SHARED_HINT = IC_HINT + '<span class="mkl-hint__t"><b>Geteilte Ansicht.</b> Wird erst gespeichert, wenn Sie sie übernehmen.</span>';
  var isOpen = false, opener = null, prevOverflow = '', toastHome = null;
  var cmpSel = [];   /* ids ticked for "Auswahl vergleichen" (session UI state, never persisted) */
  var pick = null;   /* pick mode: opened from the comparison to add models — {lens, inCmp:[ids], slots, onAdd(ids)} */

  function buildChrome() {
    /* header control between "Mein Konto" and "Warenkorb" */
    var icons = document.querySelector('.header__icons');
    if (icons && !icons.querySelector('.mkl-hdr')) {
      hdrBtn = h('<button class="icon-btn mkl-hdr" type="button" title="Merkliste" aria-label="Merkliste, 0 Artikel" aria-haspopup="dialog" aria-expanded="false" aria-controls="mklDrawer">' + HEART + '<span class="badge is-zero" aria-hidden="true">0</span></button>');
      var cart = null; icons.querySelectorAll('.icon-btn').forEach(function (a) { if (/warenkorb/i.test(a.getAttribute('aria-label') || '')) cart = a; });
      if (cart) icons.insertBefore(hdrBtn, cart); else icons.appendChild(hdrBtn);
      hdrBadge = hdrBtn.querySelector('.badge');
      hdrBtn.addEventListener('click', function () { if (isOpen) closeDrawer(); else openDrawer(); });
    }

    scrim = h('<div class="mkl-scrim"></div>');
    scrim.addEventListener('click', closeDrawer);
    document.body.appendChild(scrim);

    drawer = h('<div class="mkl-drawer" id="mklDrawer" role="dialog" aria-modal="true" aria-labelledby="mklTitle" aria-hidden="true">' +
      '<div class="mkl-head">' +
        '<div class="mkl-head__row">' +
          '<h2 class="mkl-title" id="mklTitle" tabindex="-1">Merkliste <span class="mkl-count">(0)</span></h2>' +
          '<div class="mkl-tools" role="group" aria-label="Merkliste weitergeben" hidden>' +   /* in the title row (12.11.): a row of its own for one link wasted space */
            '<button class="mkl-tool" type="button" data-mkl="share" aria-label="Merkliste teilen">' + IC_SHARE + '<span class="mkl-tool__l">Teilen</span></button>' +
          '</div>' +
          '<button class="mkl-link" type="button" data-mkl="clear" aria-label="Merkliste leeren" hidden><span class="mkl-w-hide">Merkliste leeren</span><span class="mkl-w-only">Leeren</span></button>' +
          '<button class="mkl-close" type="button" data-mkl="close" aria-label="Merkliste schließen">' + IC_X + '</button>' +
        '</div>' +
        '<div class="mkl-shareask" role="group" aria-labelledby="mklAskQ" tabindex="-1" hidden><p class="mkl-shareask__q" id="mklAskQ"></p><div class="mkl-shareask__act"><button class="mkl-btn mkl-btn--neutral" type="button" data-mkl="share-plain">Ohne Gravurtext teilen</button><button class="mkl-link" type="button" data-mkl="share-full">Mit Gravurtext teilen</button><button class="mkl-link" type="button" data-mkl="share-no">Abbrechen</button></div></div>' +
        '<div class="mkl-sharepop" hidden><label class="mkl-sharepop__l" for="mklShareUrl">Link zur Merkliste</label><input class="mkl-sharepop__in" id="mklShareUrl" type="text" readonly><button class="mkl-link" type="button" data-mkl="sharepop-close">Schließen</button></div>' +
        '<p class="mkl-notice" hidden>Die Merkliste kann auf diesem Gerät nicht gespeichert werden (Cookies/Speicher blockiert)</p>' +
      '</div>' +
      '<div class="mkl-body">' +
        '<div class="mkl-shared" role="status" tabindex="-1" hidden></div>' +
        '<button class="mkl-link mkl-sharedlink" type="button" data-mkl="show-shared" hidden></button>' +
        '<ul class="mkl-list" role="list"></ul>' +
        '<section class="mkl-recent" aria-labelledby="mklRecentH" hidden><div class="mkl-recent__head"><h3 class="mkl-recent__h" id="mklRecentH">Zuletzt angesehen</h3><button class="mkl-link" type="button" data-mkl="recent-clear">Verlauf löschen</button></div><ul class="mkl-recent__list" role="list"></ul></section>' +
        '<div class="mkl-empty" hidden>' + HEART + '<h3 class="mkl-empty__title">Ihre Merkliste ist leer</h3><p class="mkl-empty__body">Merken Sie Modelle mit dem Lesezeichen-Symbol – sie bleiben auf diesem Gerät gespeichert.</p><button class="btn btn--secondary" type="button" data-mkl="back">' + (PDP ? 'Zurück zum Produkt' : 'Zurück zu ' + esc(LENSES[LENS].label)) + '</button></div>' +
      '</div>' +
      '<div class="mkl-foot">' +
        '<p class="mkl-hint">' + OWN_HINT + '</p>' +
        '<p class="mkl-foot__hint" id="mkl-foot-status" aria-live="polite"><b class="mkl-foot__s">Keine Modelle ausgewählt</b><span class="mkl-foot__d">2 bis 4 Modelle einer Kategorie</span></p>' +
        '<button class="mkl-cta" type="button" data-mkl="compare" aria-describedby="mkl-foot-status" disabled>Vergleichen</button>' +
      '</div>' +
    '</div>');
    document.body.appendChild(drawer);
    titleEl = drawer.querySelector('.mkl-title'); countEl = drawer.querySelector('.mkl-count'); clearBtn = drawer.querySelector('[data-mkl="clear"]');
    notice = drawer.querySelector('.mkl-notice');
    listEl = drawer.querySelector('.mkl-list'); emptyEl = drawer.querySelector('.mkl-empty'); footHint = drawer.querySelector('.mkl-foot__hint'); cta = drawer.querySelector('[data-mkl="compare"]'); footEl = drawer.querySelector('.mkl-foot');
    notice.hidden = storageOk;
    toolsEl = drawer.querySelector('.mkl-tools'); shareBtn = drawer.querySelector('[data-mkl="share"]');
    askEl = drawer.querySelector('.mkl-shareask'); popEl = drawer.querySelector('.mkl-sharepop'); sharedEl = drawer.querySelector('.mkl-shared'); sharedLink = drawer.querySelector('.mkl-sharedlink');
    hintEl = drawer.querySelector('.mkl-hint'); recentEl = drawer.querySelector('.mkl-recent');
    var gOf = function (t) { var g = t && t.closest && t.closest('.mkl-ghost'); return g ? g.getAttribute('data-ghost') : null; };
    /* hover pauses only when the pointer comes onto the undo row from outside: the row appears right under the cursor
       that clicked the bin, and that must not hold it open (12.11. bug: the first removal stayed far beyond its 3 s) */
    listEl.addEventListener('mouseover', function (e) { var id = gOf(e.target), from = e.relatedTarget; if (id && from && from.isConnected && gOf(from) !== id) ghostPause(id); });
    listEl.addEventListener('mouseout', function (e) { var id = gOf(e.target); if (id && gOf(e.relatedTarget) !== id && !(kbdNav && gOf(document.activeElement) === id)) ghostResume(id); });   /* focus put on "Rückgängig" by the script after a mouse click must not hold the row */
    listEl.addEventListener('focusin', function (e) { var id = gOf(e.target); if (id && kbdNav) ghostPause(id); });
    listEl.addEventListener('focusout', function (e) { var id = gOf(e.target); if (id && gOf(e.relatedTarget) !== id) { var gl = listEl.querySelector('.mkl-ghost[data-ghost="' + cssId(id) + '"]'); if (!(gl && gl.matches(':hover'))) ghostResume(id); } });
    document.addEventListener('keydown', function () { kbdNav = true; }, true);
    document.addEventListener('pointerdown', function () { kbdNav = false; }, true);

    drawer.addEventListener('click', function (e) {
      var a = e.target.closest('[data-mkl]');
      if (a) {
        var k = a.getAttribute('data-mkl');
        if (k === 'close' || k === 'back') { closeDrawer(); return; }
        if (k === 'clear') { clearAll(); return; }   /* no confirmation step: emptied at once, undo in the toast (12.11., user decision) */
        if (k === 'compare') { startCompare(); return; }
        if (k === 'login') { e.preventDefault(); toast('Anmelden ist im Prototyp nicht verfügbar.', 'info'); return; }
        if (k === 'share') { askOrShare(); return; }
        if (k === 'share-plain' || k === 'share-full') { askEl.hidden = true; shareList(k === 'share-full'); shareBtn.focus(); return; }
        if (k === 'share-no') { askEl.hidden = true; shareBtn.focus(); return; }
        if (k === 'sharepop-close') { popEl.hidden = true; shareBtn.focus(); return; }
        if (k === 'recent-clear') { recentSave([]); render(); titleEl.focus(); live('Verlauf gelöscht.'); return; }
        if (k === 'take') { takeShared(); return; }
        if (k === 'show-own') { sharedMode = false; render(); titleEl.focus(); return; }
        if (k === 'show-shared') { sharedMode = true; render(); sharedEl.focus(); live('Geteilte Merkliste mit ' + sharedList.items.length + ' Artikeln geöffnet.'); return; }
      }
      var pb = e.target.closest('.mkl-item__more');
      if (pb) { var pid = pb.getAttribute('data-parts'); openParts[pid] = !openParts[pid]; render(); var nb2 = listEl.querySelector('.mkl-item__more[data-parts="' + pid.replace(/"/g, '') + '"]'); if (nb2) nb2.focus(); return; }
      var ug = e.target.closest('[data-undo]');
      if (ug) { ghostUndo(ug.getAttribute('data-undo')); return; }
      var rs = e.target.closest('[data-rv-save]');
      if (rs) { saveRecent(rs.getAttribute('data-rv-save')); return; }
      var tk = e.target.closest('[data-take]');
      if (tk) { takeOne(tk.getAttribute('data-take')); return; }
      var go = e.target.closest('.mkl-item__cta');
      if (go) {
        var href = go.getAttribute('href') || '#', row = go.closest('.mkl-item'), rid = row && row.getAttribute('data-id'), rit = rid && viewById(rid);
        if (PDP && rit && rit.articleId === PDP.id) {   /* this product's own entries: no navigation, act in place */
          e.preventDefault(); closeDrawer();
          if (rit.configId) { arrive(rit.configId); } else { var sw = document.getElementById('pdpSwatches'); if (sw) { sw.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }); hintSwatches(); } }
          return;
        }
        if (href.charAt(0) === '#') { e.preventDefault(); closeDrawer(); toast(/Konfiguration öffnen/.test(go.textContent) ? 'Gespeicherte Konfiguration öffnen (Prototyp)' : ('Weiter zur ' + (/Konfigurieren/.test(go.textContent) ? 'Konfiguration' : 'Produktseite') + ' (Prototyp)'), 'info'); return; }
        closeDrawer(); return;   /* a real page: let the link navigate */
      }
      var rm = e.target.closest('.mkl-rm');
      if (rm) { removeFromRow(rm.getAttribute('data-id'), rm); return; }
      var cmp = e.target.closest('.mkl-cmp');
      if (cmp) { var inp = cmp.querySelector('input'); if (inp.disabled) { e.preventDefault(); if (cmp.classList.contains('is-in')) toast('Dieses Modell ist bereits im Vergleich', 'info'); else if (cmp.classList.contains('is-lens')) toast('Vergleich nur innerhalb einer Kategorie', 'info'); else toast(pick ? 'Kein Platz mehr im Vergleich – maximal ' + CMP_MAX + ' Modelle' : 'Maximal ' + CMP_MAX + ' Modelle. Bitte entfernen Sie zuerst eines.', 'limit'); } }
    });
    drawer.addEventListener('change', function (e) {
      var inp = e.target.closest('.mkl-cmp input'); if (!inp) return;
      var id = inp.getAttribute('data-id'), i = cmpSel.indexOf(id);
      if (inp.checked && i < 0) { if (cmpSel.length >= (pick ? pick.slots : CMP_MAX)) { inp.checked = false; toast(pick ? 'Kein Platz mehr im Vergleich – maximal ' + CMP_MAX + ' Modelle' : 'Maximal ' + CMP_MAX + ' Modelle. Bitte entfernen Sie zuerst eines.', 'limit'); return; } cmpSel.push(id); }
      else if (!inp.checked && i > -1) cmpSel.splice(i, 1);
      syncCmp();
    });
    /* keyboard: Escape closes the drawer only (not an overlay beneath); Tab wraps inside */
    drawer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); if (!askEl.hidden) { askEl.hidden = true; shareBtn.focus(); } else if (!popEl.hidden) { popEl.hidden = true; shareBtn.focus(); } else closeDrawer(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) { e.preventDefault(); titleEl.focus(); return; }
      var first = f[0], last = f[f.length - 1], cur = document.activeElement;
      if (e.shiftKey && (cur === first || cur === titleEl)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
    });

    toastEl = h('<div class="mkl-toast" role="status" aria-live="polite"></div>');
    toastHome = document.body;
    toastEl.addEventListener('mouseenter', pauseToast); toastEl.addEventListener('focusin', pauseToast);
    toastEl.addEventListener('mouseleave', resumeToast); toastEl.addEventListener('focusout', resumeToast);
    document.body.appendChild(toastEl);
    liveEl = h('<div class="mkl-live" id="mkl-live" aria-live="polite" aria-atomic="true"></div>');
    document.body.appendChild(liveEl);

    /* toasts never stack: when the compare add-on shows its toast, ours yields */
    var vt = document.querySelector('.vgl-toast');
    if (vt && window.MutationObserver) new MutationObserver(function () { if (vt.classList.contains('show') && toastEl.classList.contains('show')) hideToast(); }).observe(vt, { attributes: true, attributeFilter: ['class'] });
  }
  function focusables() {
    return Array.prototype.filter.call(drawer.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'), function (el) { return el.offsetParent !== null && !el.closest('[hidden]'); });
  }

  /* ---- Drawer open / close ---- */
  /* category page in compare mode (10.11., user decision): the Merkliste adds its models to the selection in the strip
     instead of starting a separate comparison — not inside the open comparison ("Zurück zur Merkliste") or a shared list */
  function autoPick() {
    var v = window.MTZ_VGL;
    if (PDP || sharedMode || !v || typeof v.add !== 'function' || !v.isMode() || document.querySelector('.vgl-view.is-open')) return null;
    var sel = v.selected(), max = v.max || CMP_MAX;
    return { auto: true, lens: LENS, inCmp: sel, slots: Math.max(0, max - sel.length), onAdd: function (ids) {
      var a = v.add(ids) || []; if (!a.length) return;
      var one = a.length === 1 ? items.filter(function (it) { return (it.articleId || it.id) === a[0]; })[0] : null;
      var n = v.selected().length, nm = a.length === 1 ? shortName(one || { name: a[0] }).main : a.length + ' Modelle';
      toast(nm + ' zum Vergleich hinzugefügt' + (n < CMP_MIN ? ' – wählen Sie noch ein Modell' : ''), 'ok', null, false, one && one.img);
      live(nm + ' zum Vergleich hinzugefügt. Vergleich: ' + n + ' Modell' + (n === 1 ? '' : 'e') + '.');
    } };
  }
  function openDrawer() {
    if (isOpen) return;
    if (!pick) { pick = autoPick(); if (pick) cmpSel = []; }
    isOpen = true;
    var ae = document.activeElement;
    opener = (ae && ae !== document.body && !toastEl.contains(ae)) ? ae : hdrBtn;
    hideToast(); drawer.appendChild(toastEl);   /* the toast joins the dialog: inside the focus trap, above the footer */
    render();
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    scrim.classList.add('is-open'); drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    if (hdrBtn) hdrBtn.setAttribute('aria-expanded', 'true');
    void drawer.offsetWidth;   /* flush styles so the now-visible dialog can take focus */
    titleEl.focus();
  }
  function closeDrawer() {
    if (!isOpen) return;
    isOpen = false;
    if (pick) { pick = null; cmpSel = []; drawer.classList.remove('is-pick'); }
    askEl.hidden = true; popEl.hidden = true;
    ghostClearAll();   /* pending removals become final */
    hideToast(); document.body.appendChild(toastEl);
    scrim.classList.remove('is-open'); drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    if (hdrBtn) hdrBtn.setAttribute('aria-expanded', 'false');
    var ov = document.querySelector('.vgl-view.is-open');
    document.body.style.overflow = ov ? 'hidden' : prevOverflow;   /* compare overlay beneath keeps its scroll lock */
    if (opener && opener.focus && document.contains(opener)) opener.focus();
    opener = null;
  }

  /* ---- Toast (one element, one action, 5 s, pause on hover/focus) ---- */
  var toastLeft = 0, toastStart = 0, toastPaused = false;
  /* img (12.11., user: "add the product images, the same approach as Airbnb"): a single product added or removed shows
     its photo as a small tile in place of the status icon, so the visitor sees at once which model it was */
  function toast(msg, type, action, quiet, img) {
    type = type || 'ok';
    toastEl.setAttribute('aria-live', quiet ? 'off' : 'polite');   /* spec 10 §4.4: announced once — the live region already spoke */
    var vt = document.querySelector('.vgl-toast.show'); if (vt) vt.classList.remove('show');   /* a Merkliste toast replaces a compare toast (§5.7) */
    toastEl.className = 'mkl-toast t-' + type + (action ? ' has-act' : '') + (action && action.undo ? ' is-undo' : '') + (isOpen ? ' is-drawer' : (document.querySelector('.vgl-view.is-open') ? ' is-view' : (document.querySelector('.vgl-tray.is-open') ? ' is-raised' : ((pdpBarVisible && pdpBarVisible()) ? ' is-pdp-bar' : ''))));
    toastEl.classList.toggle('has-img', !!img);
    toastEl.innerHTML = (img ? '<span class="mkl-toast__img"><img src="' + esc(asset(img)) + '" alt=""></span>' : (type === 'limit' ? IC_LIMIT : (type === 'info' ? IC_INFO : IC_OK))) + '<span class="mkl-toast__msg">' + esc(msg) + '</span>' + (action ? '<button class="mkl-toast__act" type="button">' + esc(action.label) + '</button>' : '');
    if (action) toastEl.querySelector('.mkl-toast__act').addEventListener('click', function () { hideToast(); action.fn(); });
    toastEl.classList.add('show');
    var ms = (action && action.ms) || TOAST_MS;
    clearTimeout(toastT); toastPaused = false; toastLeft = ms; toastStart = Date.now();
    toastT = setTimeout(hideToast, ms);
  }
  function hideToast() { clearTimeout(toastT); toastEl.classList.remove('show'); rmBatch = null; }
  function pauseToast() { if (!toastEl.classList.contains('show') || toastPaused) return; toastPaused = true; clearTimeout(toastT); toastLeft = Math.max(800, toastLeft - (Date.now() - toastStart)); }
  function resumeToast() { if (!toastPaused) return; toastPaused = false; toastStart = Date.now(); toastT = setTimeout(hideToast, toastLeft); }
  function live(msg) { if (!liveEl) return; liveEl.textContent = ''; setTimeout(function () { liveEl.textContent = msg; }, 30); }

  /* ---- Hearts: PLP cards + compare overlay columns ---- */
  function heartHTML(extra) { return '<button class="mkl-mark' + (extra || '') + '" type="button" aria-pressed="false"><span class="mkl-mark__disc">' + HEART + '</span></button>'; }
  function injectCardHeart(cardEl) {
    if (cardEl.querySelector('.mkl-mark')) return;
    var id = cardEl.dataset.id; if (!id || !BY_ID[id]) return;
    var media = cardEl.querySelector('.pcard__media') || cardEl;
    var btn = h(heartHTML('')); btn.setAttribute('data-mkl-id', id);
    btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); pressHeart(btn, id, cardEl); });
    media.appendChild(btn);
    syncHeart(btn, id);
  }
  function scanCards() { var grid = document.getElementById('productGrid'); if (!grid) return; grid.querySelectorAll('.pcard[data-id]').forEach(injectCardHeart); }
  function injectOverlayHearts() {
    document.querySelectorAll('.vgl-altc .pcard[data-id]').forEach(injectCardHeart);   /* Ähnliche Modelle = PLP cards (12.11.) */
    document.querySelectorAll('.vgl-ph__media').forEach(function (media) {
      if (media.querySelector('.mkl-mark')) return;
      var rm = media.querySelector('[data-rm]'); var id = rm && rm.getAttribute('data-rm'); if (!id || !BY_ID[id]) return;
      var btn = h(heartHTML(' mkl-mark--ov')); btn.setAttribute('data-mkl-id', id);
      btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); pressHeart(btn, id, null); });
      media.appendChild(btn);
      syncHeart(btn, id);
    });
  }
  function pressHeart(btn, id, cardEl) {
    if (!reduced()) { btn.classList.add('is-pressed'); setTimeout(function () { btn.classList.remove('is-pressed'); }, 120); }
    if (has(id)) removeItem(id); else addItem(id, cardEl);
  }
  function syncHeart(btn, id) {
    var on = has(id), nm = shortName(byId(id) || BY_ID[id] && { name: BY_ID[id].name, lens: LENS } || { name: id }).main;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? nm + ' aus der Merkliste entfernen' : nm + ' merken');
    btn.setAttribute('title', on ? 'Gemerkt – aus der Merkliste entfernen' : 'Merken');
    var lim = !on && isFull();
    btn.classList.toggle('is-limit', lim);
    if (lim) btn.setAttribute('aria-disabled', 'true'); else btn.removeAttribute('aria-disabled');
  }
  function syncHearts() { document.querySelectorAll('.mkl-mark[data-mkl-id]').forEach(function (b) { syncHeart(b, b.getAttribute('data-mkl-id')); }); }
  function syncHeader() {
    if (!hdrBtn) return;
    var n = items.length;
    hdrBadge.textContent = n > 99 ? '99+' : String(n);
    hdrBadge.classList.toggle('is-zero', n === 0);
    hdrBtn.setAttribute('aria-label', 'Merkliste, ' + n + ' Artikel');
  }
  function pulseBadge() { if (!hdrBadge || reduced()) return; hdrBadge.classList.remove('is-pulse'); void hdrBadge.offsetWidth; hdrBadge.classList.add('is-pulse'); setTimeout(function () { hdrBadge.classList.remove('is-pulse'); }, 220); }
  function syncAll() { syncHearts(); syncHeader(); if (isOpen) render(); if (PDP) syncPdpMarks(); }

  /* ---- Mutations ---- */
  function addItem(id, cardEl) {
    var p = BY_ID[id]; if (!p) return false;
    if (isFull()) { var m = 'Ihre Merkliste ist voll (' + LIMIT + ' Artikel).'; toast(m, 'limit', { label: 'Zur Merkliste', fn: openDrawer }, true); live(m); return false; }
    var it = itemFrom(p, cardEl); items.push(it); save(); syncAll(); pulseBadge();
    live('Gemerkt: ' + shortName(it).main + '. Merkliste: ' + items.length + ' Artikel');
    toast('Gemerkt', 'ok', { label: 'Zur Merkliste', fn: openDrawer }, true, it.img);
    return true;
  }
  /* Single removals (12.11., lead fullstack review): 10 s to undo like "Merkliste leeren"; removals made while their
     undo toast is still up are collected, so "Rückgängig" brings all of them back to their places (before, each new
     toast replaced the last one and only the most recent removal could be undone) */
  var rmBatch = null;
  function removeItem(id, silent) {
    var i = indexOf(id); if (i < 0) return;
    var it = items[i]; items.splice(i, 1); cmpSel = cmpSel.filter(function (x) { return x !== id; }); save(); syncAll();
    live('Entfernt: ' + shortName(it).main + '. Merkliste: ' + items.length + ' Artikel');
    if (silent) return;
    if (!(rmBatch && toastEl.classList.contains('show') && toastEl.classList.contains('is-undo'))) rmBatch = [];
    rmBatch.push({ item: it, index: i });
    var b = rmBatch, n = b.length;
    toast(n > 1 ? n + ' Artikel entfernt' : (it.configId ? 'Konfiguration aus der Merkliste entfernt' : 'Aus der Merkliste entfernt'), 'ok',
      { label: 'Rückgängig', undo: true, ms: TOAST_UNDO_MS, fn: function () { restore(b.slice().reverse(), true); } }, true, n > 1 ? null : it.img);
    rmBatch = b;   /* toast() replaced the content, the batch stays open while this toast shows */
  }
  /* ---- Inline undo on a removed entry (12.11., user decision) ----
     The bin removes the entry at once (count, badge, compare selection, storage), and a light-red layer slides over
     the entry with only "Rückgängig" on it (12.11. revision: no icon, text or countdown bar) for 5 s; it slides in over
     350 ms (decelerating). Hover, or keyboard focus, pauses the time. "Rückgängig" slides the layer away and puts the entry back on its place (anchored to its neighbours, so
     several pending removals restore correctly in any order); when the time is up the entry collapses. Every entry
     has its own layer and timer. Closing the drawer makes pending removals final. Removals made elsewhere (product
     card, product page, comparison) keep the toast with "Rückgängig". */
  var GHOST_MS = 3000, ghosts = {},   /* 3 s (user decision 12.11.; was 8 s, then 5 s) */
  ghostSeq = 0, kbdNav = false;
  function cssId(id) { return String(id).replace(/["\\]/g, ''); }
  function ghostLeft(g) { return g.paused ? g.left : Math.max(0, g.left - (Date.now() - g.start)); }
  function ghostRun(g) { g.paused = false; g.start = Date.now(); clearTimeout(g.t); g.t = setTimeout(function () { ghostEnd(g.item.id); }, g.left); }
  function ghostBar() {}   /* no countdown bar any more (12.11.) */
  function ghostPause(id) { var g = ghosts[id]; if (!g || g.paused) return; clearTimeout(g.t); g.left = Math.max(600, g.left - (Date.now() - g.start)); g.paused = true; ghostBar(id); }
  function ghostResume(id) { var g = ghosts[id]; if (!g || !g.paused) return; ghostRun(g); ghostBar(id); }
  function ghostClearAll() { Object.keys(ghosts).forEach(function (k) { clearTimeout(ghosts[k].t); }); ghosts = {}; }
  function removeFromRow(id, btn) {
    var i = indexOf(id); if (i < 0) return;
    var it = items[i], aid = it.articleId || it.id, art = btn && btn.closest('.mkl-item');
    var g = { h0: art ? art.offsetHeight : 0, item: it, index: i, prev: i > 0 ? items[i - 1].id : null, next: i < items.length - 1 ? items[i + 1].id : null, wasSel: cmpSel.indexOf(aid) > -1, left: GHOST_MS, seq: ++ghostSeq, shown: false, paused: false, start: Date.now() };
    ghosts[id] = g;
    removeItem(id, true);   /* no toast: the layer is the undo */
    var nm = it.name || shortName(it).main;
    live(nm + ' entfernt. Rückgängig möglich.');
    var ub = listEl.querySelector('.mkl-ghost__undo[data-undo="' + cssId(id) + '"]');
    if (ub) ub.focus({ preventScroll: true });
    if (kbdNav) { g.paused = true; ghostBar(id); } else ghostRun(g);   /* keyboard: paused while focus is on "Rückgängig" */
  }
  function placeOf(g, list) {
    var at = function (id) { if (!id) return -1; for (var k = 0; k < list.length; k++) if (list[k].id === id) return k; return -1; };
    var n = at(g.next); if (n > -1) return n;
    var p = at(g.prev); if (p > -1) return p + 1;
    return Math.min(g.index, list.length);
  }
  function ghostUndo(id) {
    var g = ghosts[id]; if (!g) return; clearTimeout(g.t);
    var ov = listEl.querySelector('.mkl-ghost[data-ghost="' + cssId(id) + '"]');
    var done = function () {
      delete ghosts[id];
      if (has(id)) { render(); return; }
      if (isFull()) { render(); toast('Ihre Merkliste ist voll (' + LIMIT + ' Artikel).', 'limit'); return; }
      items.splice(placeOf(g, items), 0, g.item);
      var aid = g.item.articleId || g.item.id; if (g.wasSel && cmpSel.indexOf(aid) < 0) cmpSel.push(aid);
      save(); syncAll(); pulseBadge();
      live(shortName(g.item).main + ' wiederhergestellt. Merkliste: ' + items.length + ' Artikel');
      var rb = listEl.querySelector('.mkl-rm[data-id="' + cssId(id) + '"]'); (rb || titleEl).focus({ preventScroll: true });
    };
    if (ov && !reduced()) { var ar = ov.closest('.mkl-item'); if (ar && g.h0) { ar.classList.remove('is-shrink'); ar.classList.add('is-grow'); } ov.classList.remove('is-enter'); ov.classList.add('is-leave'); setTimeout(done, 240); } else done();
  }
  function ghostEnd(id) {
    var g = ghosts[id]; if (!g) return; clearTimeout(g.t);
    var li = (listEl.querySelector('.mkl-ghost[data-ghost="' + cssId(id) + '"]') || {}).parentNode;
    li = li && li.closest ? li.closest('li') : null;
    var hadFocus = !!(li && li.contains(document.activeElement)), nextLi = li && li.nextElementSibling;
    var nextId = nextLi && nextLi.querySelector('.mkl-rm') ? nextLi.querySelector('.mkl-rm').getAttribute('data-id') : null;
    var fin = function () {
      delete ghosts[id]; render();
      if (hadFocus) { var nb = nextId && listEl.querySelector('.mkl-rm[data-id="' + cssId(nextId) + '"]'); (nb || titleEl).focus({ preventScroll: true }); }
    };
    if (li && !reduced()) { li.style.height = li.offsetHeight + 'px'; void li.offsetHeight; li.classList.add('is-collapsing'); li.style.height = '0px'; setTimeout(fin, 260); } else fin();
  }
  function ghostWrap(html, it) {
    var g = it.__ghost, nm = it.name || shortName(it).main;   /* full shop title for the accessible names: the short name alone does not tell the variants apart */
    var ov = '<div class="mkl-ghost' + (g.shown ? '' : ' is-enter') + '" role="group" aria-label="' + esc(nm) + ' entfernt" data-ghost="' + esc(it.id) + '">' +
      '<button class="mkl-ghost__undo" type="button" data-undo="' + esc(it.id) + '" aria-label="' + esc(nm) + ' wiederherstellen">Rückgängig</button></div>';   /* only the undo (user: the state was too much) */
    g.shown = true;
    var shrink = !g.grown; g.grown = true;   /* the entry shrinks to the compact undo row once, on removal */
    return html.replace('<article class="mkl-item', '<article style="--h0:' + (g.h0 || 0) + 'px" class="mkl-item is-ghost' + (shrink && g.h0 ? ' is-shrink' : '')).replace(/(<article[^>]*>)/, '$1<div class="mkl-ghost__under" inert aria-hidden="true">').replace('</article></li>', '</div>' + ov + '</article></li>');
  }
  function restore(entries, ordered) {
    if (!ordered) entries.sort(function (a, b) { return a.index - b.index; });
    entries.forEach(function (e) { if (has(e.item.id)) return; if (items.length >= LIMIT) return; items.splice(Math.min(e.index, items.length), 0, e.item); });
    save(); syncAll(); pulseBadge();
    live('Wiederhergestellt: ' + (entries.length === 1 ? shortName(entries[0].item).main : entries.length + ' Artikel') + '. Merkliste: ' + items.length + ' Artikel');
    if (isOpen) { var b = entries.length === 1 && listEl.querySelector('.mkl-rm[data-id="' + entries[0].item.id.replace(/"/g, '') + '"]'); (b || titleEl).focus(); }
    else if (PDP && pdpBtn) { var t = (pdpLast === pdpBar && pdpBarVisible && pdpBarVisible()) ? pdpBar : pdpBtn; t.focus({ preventScroll: true }); }
  }
  function clearAll() {
    var snap = items.map(function (it, i) { return { item: it, index: i }; }), n = items.length;
    items = []; cmpSel = []; save(); syncAll(); titleEl.focus();
    live(n + ' Artikel entfernt. Merkliste: 0 Artikel. Rückgängig in der Meldung möglich.');
    toast(n + ' Artikel entfernt', 'ok', { label: 'Rückgängig', ms: TOAST_UNDO_MS, fn: function () { restore(snap); } });
    rmBatch = null;
  }

  /* ---- Zuletzt angesehen (12.11.) ----
     Models the visitor opened in this session (product page, card title or image, "Zum Produkt" / "Konfigurieren" in
     the comparison), newest first. Session only (sessionStorage, gone when the browser closes, no consent needed);
     a snapshot like a Merkliste item, so a model seen on the other category page still renders. Shown below the saved
     items, at most 4 and never one that is already saved; one click on "Merken" moves it into the list. On JTL this
     reads the shop's own "zuletzt angesehen" data instead of keeping a second history. */
  var RKEY = 'mtz_recent', RSHOW = 4, RMAX = 12;
  function recentLoad() { try { var d = JSON.parse(sessionStorage.getItem(RKEY) || '[]'); return Array.isArray(d) ? d.filter(function (x) { return x && typeof x.id === 'string' && typeof x.name === 'string'; }) : []; } catch (e) { return []; } }
  function recentSave(l) { try { if (l.length) sessionStorage.setItem(RKEY, JSON.stringify(l.slice(0, RMAX))); else sessionStorage.removeItem(RKEY); } catch (e) {} }
  function recordView(id, cardEl) {
    var p = BY_ID[String(id)]; if (!p) return;
    var snap = itemFrom(p, cardEl); delete snap.addedAt; delete snap.priceAtAdd; snap.viewedAt = new Date().toISOString();
    var l = recentLoad().filter(function (x) { return x.id !== snap.id; }); l.unshift(snap); recentSave(l);
    if (isOpen) render();
  }
  function recentShown() { return recentLoad().filter(function (x) { return !has(x.id) && !ghosts[x.id]; }).slice(0, RSHOW); }
  function recentRowHTML(it) {
    var nm = shortName(it), price = typeof it.priceFrom === 'number' ? 'ab ' + euro(it.priceFrom) : '';
    var ctaTxt = it.konfig ? 'Konfigurieren' : 'Zum Produkt', ctaHref = it.url && it.url !== '#' ? asset(it.url) : (it.konfig ? '#konfigurator' : '#produkt');
    return '<li class="mkl-rv" data-id="' + esc(it.id) + '">' +
      '<div class="mkl-rv__media"><img src="' + esc(asset(it.img)) + '" alt=""></div>' +
      '<div class="mkl-rv__text"><div class="mkl-rv__name" title="' + esc(it.name) + '">' + esc(nm.main) + '</div>' +
        (price ? '<div class="mkl-rv__price">' + esc(price) + '</div>' : '') +
        '<a class="mkl-rv__cta" href="' + esc(ctaHref) + '">' + ctaTxt + IC_CHEV_R + '</a></div>' +
      '<button class="mkl-rv__save" type="button" data-rv-save="' + esc(it.id) + '" aria-label="' + esc(nm.main) + ' merken">' + HEART + '<span>Merken</span></button>' +
    '</li>';
  }
  function renderRecent(shared) {
    if (!recentEl) return;
    var l = (shared || (pick && !pick.auto)) ? [] : recentShown();   /* hidden only in the explicit picker opened from the comparison */
    recentEl.hidden = !l.length;
    recentEl.querySelector('.mkl-recent__list').innerHTML = l.map(recentRowHTML).join('');
  }
  function saveRecent(id) {
    var snap = null; recentLoad().forEach(function (x) { if (x.id === id) snap = x; }); if (!snap || has(id)) return;
    if (isFull()) { var m = 'Ihre Merkliste ist voll (' + LIMIT + ' Artikel).'; toast(m, 'limit', null, true); live(m); return; }
    var btns = Array.prototype.slice.call(recentEl.querySelectorAll('[data-rv-save]')), at = btns.map(function (b) { return b.getAttribute('data-rv-save'); }).indexOf(id);
    var it = {}; Object.keys(snap).forEach(function (k) { if (k !== 'viewedAt') it[k] = snap[k]; });
    it.addedAt = new Date().toISOString(); it.priceAtAdd = typeof it.priceFrom === 'number' ? it.priceFrom : null;
    items.push(it); save(); syncAll(); pulseBadge();
    live('Gemerkt: ' + shortName(it).main + '. Merkliste: ' + items.length + ' Artikel');
    toast('Gemerkt', 'ok', null, true, it.img);
    var nb = recentEl.querySelectorAll('[data-rv-save]'); (nb[Math.min(at, nb.length - 1)] || titleEl).focus();
  }

  /* ---- Drawer rendering ---- */
  function rowHTML(it, shared) {
    var nm = shortName(it), cfg = !!it.configId, cmpId = it.articleId || it.id;
    var price = (cfg && typeof it.configTotal === 'number') ? 'Gesamt ' + euro(it.configTotal) + ((it.configQty || 1) > 1 ? ' · ' + it.configQty + ' Stück' : '') : (typeof it.priceFrom === 'number' ? 'ab ' + euro(it.priceFrom) : '');
    var uvp = (!cfg && typeof it.uvp === 'number' && it.uvp > (it.priceFrom || 0)) ? '<span class="mkl-item__uvp">UVP ' + euro(it.uvp) + '</span>' : '';
    var ctaTxt = cfg ? (it.configExpired ? 'Konfigurieren' : 'Konfiguration öffnen') : (it.konfig ? 'Konfigurieren' : 'Zum Produkt');
    var ctaHref = cfg ? (it.url && it.url !== '#' ? asset(it.url) : '#konfigurator?configId=' + encodeURIComponent(it.configId)) : (it.url && it.url !== '#' ? asset(it.url) : (it.konfig ? '#konfigurator' : '#produkt'));
    var openStep = cfg && !it.configExpired && it.configComplete === false ? cfgOpenStep(it.configState) : null;
    var cfgHtml = '';
    if (cfg) {
      var all = it.configSummary || [], lines = all.slice(0, 3).map(function (l) { return esc(l.label) + ': ' + esc(l.value); });
      var op = !!openParts[it.id], sid = 'mkl-parts-' + String(it.id).toLowerCase().replace(/[^a-z0-9-]/g, '-');
      cfgHtml = (lines.length ? '<p class="mkl-item__cfg"' + (op && all.length > 3 ? ' hidden' : '') + '>' + lines.join(' · ') + '</p>' : '') +
        (all.length > 3 ? '<dl class="mkl-item__parts" id="' + sid + '"' + (op ? '' : ' hidden') + '>' + all.map(function (l) { return '<dt>' + esc(l.label) + '</dt><dd' + (/noch zu wählen/.test(l.value) ? ' class="is-open"' : '') + '>' + esc(l.value) + '</dd>'; }).join('') + '</dl>' +
          '<button class="mkl-item__more" type="button" aria-expanded="' + op + '" aria-controls="' + sid + '" data-parts="' + esc(it.id) + '">' + (op ? 'Weniger anzeigen' : 'Alle Positionen anzeigen (' + all.length + ')') + IC_CHEV + '</button>' : '') +
        (it.configExpired ? '<p class="mkl-item__expired">Konfiguration abgelaufen – Details siehe Zusammenfassung</p>' : (openStep ? '<p class="mkl-item__expired">Noch nicht vollständig – ' + esc(openStep) + ' offen</p>' : ''));
    }
    var avail = it.availability ? '<span class="mkl-item__avail">' + esc(it.availability) + '</span>' : '';
    return (it.__ghost ? function (x) { return ghostWrap(x, it); } : function (x) { return x; })('<li><article class="mkl-item' + (cfg ? ' mkl-item--cfg' : '') + '" data-id="' + esc(it.id) + '" data-lens="' + esc(it.lens) + '">' +
      '<div class="mkl-item__media"><img src="' + esc(asset(it.img)) + '" alt=""></div>' +
      '<div class="mkl-item__text">' +
        (cfg ? '<span class="mkl-item__tag">Ihre Konfiguration' + (it.updatedAt ? ' · aktualisiert ' + esc(fmtDate(it.updatedAt)) : (it.addedAt ? ' · ' + esc(fmtDate(it.addedAt)) : '')) + '</span>' : '') +
        '<div class="mkl-item__name">' + esc(nm.main) + '</div>' +
        (nm.sub ? '<div class="mkl-item__sub">' + esc(nm.sub) + '</div>' : '') +
        (price ? '<div class="mkl-item__price">' + esc(price) + uvp + '</div>' : '') + deltaHTML(it) +
        cfgHtml + avail +
      '</div>' +
      (shared ? takeHTML(it, nm) : '<button class="mkl-rm" type="button" data-id="' + esc(it.id) + '" aria-label="' + esc(nm.main) + ' entfernen">' + IC_TRASH + '</button>') +
      '<div class="mkl-item__actions">' +
        '<a class="mkl-item__cta" href="' + esc(ctaHref) + '"><span>' + ctaTxt + '</span>' + IC_CHEV_R + '</a>' +
        '<div class="mkl-item__sec">' +
          (cfg ? '<span class="mkl-item__cfgnote">Vergleich auf Modellebene – über das Basismodell</span>' :
            '<label class="mkl-cmp"><input type="checkbox" data-id="' + esc(cmpId) + '" data-lens="' + esc(it.lens) + '" aria-label="' + esc(nm.main) + ' zum Vergleich auswählen"><span class="mkl-cmp__box" aria-hidden="true">' + CHK + '</span><span class="mkl-cmp__t">Vergleichen</span></label>') +
        '</div>' +
      '</div>' +
    '</article></li>');
  }
  /* rows grouped by category: the current page's category first; the lock hint sits once in the group head */
  function groupHTML(lens, rows, shared) {
    var lab = (LENSES[lens] || LENSES[LENS]).label;
    return '<li class="mkl-group" data-lens="' + esc(lens) + '"><div class="mkl-group__row"><h3 class="mkl-group__h">' + esc(lab) + ' <span class="mkl-group__n">(' + rows.length + ')</span></h3></div><span class="mkl-group__hint" hidden></span></li>' + rows.map(function (it) { return rowHTML(it, shared); }).join('');
  }
  function viewItems() { return (sharedMode && sharedList) ? sharedList.items : items; }
  function viewById(id) { var l = viewItems(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function render() {
    var shared = !!(sharedMode && sharedList), list = viewItems(), n = list.length;
    var ae = document.activeElement, keep = (ae && listEl.contains(ae)) ? (ae.getAttribute('data-parts') ? '.mkl-item__more[data-parts="' + ae.getAttribute('data-parts').replace(/"/g, '') + '"]' : (ae.getAttribute('data-take') ? '[data-take="' + ae.getAttribute('data-take').replace(/"/g, '') + '"]' : null)) : null;
    drawer.classList.toggle('is-shared', shared); drawer.classList.toggle('is-pick', !!pick);
    titleEl.firstChild.nodeValue = shared ? 'Geteilte Merkliste ' : 'Merkliste ';
    countEl.textContent = (!shared && n >= LIMIT) ? '(' + n + ' / ' + LIMIT + ')' : '(' + n + ')';
    clearBtn.hidden = n === 0 || shared;
    toolsEl.hidden = n === 0 || shared; if (toolsEl.hidden) { askEl.hidden = true; popEl.hidden = true; }
    notice.hidden = storageOk;
    sharedEl.hidden = !shared; if (shared) sharedEl.innerHTML = bannerHTML();
    sharedLink.hidden = shared || !sharedList; if (!sharedLink.hidden) sharedLink.textContent = 'Geteilte Merkliste anzeigen (' + sharedList.items.length + ')';
    hintEl.innerHTML = shared ? SHARED_HINT : OWN_HINT; hintEl.hidden = n === 0; placeHint();
    var disp = list;
    if (!shared) {
      Object.keys(ghosts).forEach(function (k) { if (has(k)) { clearTimeout(ghosts[k].t); delete ghosts[k]; } });
      disp = list.slice();
      Object.keys(ghosts).map(function (k) { return ghosts[k]; }).sort(function (a, b) { return b.seq - a.seq; }).forEach(function (g) {
        var o = {}; Object.keys(g.item).forEach(function (k) { o[k] = g.item[k]; }); o.__ghost = g; disp.splice(placeOf(g, disp), 0, o);
      });
    }
    emptyEl.hidden = disp.length > 0; listEl.hidden = disp.length === 0; footEl.hidden = n === 0;
    renderRecent(shared); emptyEl.classList.toggle('has-recent', !recentEl.hidden);
    var byLens = {}, order = [LENS]; disp.forEach(function (it) { var l = it.lens || LENS; if (!byLens[l]) { byLens[l] = []; if (order.indexOf(l) < 0) order.push(l); } byLens[l].push(it); });
    var multi = order.filter(function (l) { return byLens[l]; }).length > 1;
    listEl.innerHTML = multi ? order.filter(function (l) { return byLens[l]; }).map(function (l) { return groupHTML(l, byLens[l], shared); }).join('') : disp.map(function (it) { return rowHTML(it, shared); }).join('');
    try { document.documentElement.style.setProperty('--mkl-foot-h', (footEl.hidden ? 0 : footEl.offsetHeight / 16) + 'rem'); } catch (e) {}
    var valid = {}; list.forEach(function (it) { valid[it.articleId || it.id] = 1; });
    cmpSel = cmpSel.filter(function (id) { return valid[id]; });
    syncCmp();
    if (keep) { var kb = listEl.querySelector(keep); if (kb) kb.focus(); }   /* re-render keeps the keyboard where it was */
    fitDrawer();
  }
  /* Responsive audit 14 (07.11.): on phones the storage hint (3–4 lines) leaves the pinned footer and closes the list
     instead — the footer keeps only the selection and the compare CTA, so the list gets the room (320×568: footer 223 → ~130 px) */
  var MQ_PHONE = window.matchMedia ? window.matchMedia('(max-width:47.99rem)') : null;
  function placeHint() {
    if (!hintEl || !footEl) return;
    var body = drawer.querySelector('.mkl-body'), inBody = !!(MQ_PHONE && MQ_PHONE.matches);
    hintEl.classList.toggle('mkl-hint--body', inBody);
    if (inBody) { if (hintEl.parentNode !== body) body.appendChild(hintEl); }
    else if (hintEl.parentNode !== footEl) footEl.insertBefore(hintEl, footEl.firstChild);
  }
  /* Responsive audit (2026-11-02): on short viewports (landscape phones) or with enlarged text the pinned head +
     footer left no room for the list (65px at 844×390, 2px at 200 % text) — then the dialog scrolls as one column */
  function fitDrawer() {
    if (!isOpen) return;
    var st = drawer.scrollTop, b = drawer.querySelector('.mkl-body');
    drawer.classList.remove('is-flow');
    if (b && !listEl.hidden && b.clientHeight < drawer.clientHeight * 0.35) { drawer.classList.add('is-flow'); drawer.scrollTop = st; }   /* re-measuring keeps the reading position */
  }
  function lensOfCmp(id) { var l = viewItems(); for (var i = 0; i < l.length; i++) if ((l[i].articleId || l[i].id) === id) return l[i].lens; return null; }
  function setFoot(status, detail) {
    footHint.hidden = false;
    footHint.firstChild.textContent = status; footHint.lastChild.textContent = detail;
  }
  function syncCmp() {
    if (pick) { syncPick(); return; }
    var n = cmpSel.length, lock = n ? lensOfCmp(cmpSel[0]) : null, full = n >= CMP_MAX;
    listEl.querySelectorAll('.mkl-cmp').forEach(function (lab) {
      var inp = lab.querySelector('input'), id = inp.getAttribute('data-id'), on = cmpSel.indexOf(id) > -1;
      var otherLens = !!(lock && inp.getAttribute('data-lens') !== lock);
      var dis = !on && (full || otherLens);
      inp.checked = on; inp.disabled = dis;
      lab.classList.toggle('is-disabled', dis); lab.classList.toggle('is-lens', otherLens && !on);
    });
    listEl.querySelectorAll('.mkl-group').forEach(function (g) {
      var hint = g.querySelector('.mkl-group__hint'), other = !!(lock && g.getAttribute('data-lens') !== lock);
      hint.hidden = !other; if (other) hint.textContent = 'Vergleich nur innerhalb einer Kategorie – Ihre Auswahl läuft bei ' + (LENSES[lock] || LENSES[LENS]).label;
    });
    /* footer status (11.11., user: "not professional"): what is selected (bold) + what comes next (muted); the
       button just says "Vergleichen" */
    var lab = (LENSES[lock] || LENSES[LENS]).label;
    cta.textContent = 'Vergleichen';
    cta.disabled = n < CMP_MIN;
    setFoot(n ? (n === 1 ? '1 Modell ausgewählt' : n + ' ' + lab + ' ausgewählt') : 'Keine Modelle ausgewählt',
      !n ? CMP_MIN + ' bis ' + CMP_MAX + ' Modelle einer Kategorie'
        : n < CMP_MIN ? 'Noch mindestens 1 weiteres Modell'
        : lock && lock !== LENS ? 'Der Vergleich öffnet bei ' + lab
        : full ? 'Maximum von ' + CMP_MAX + ' Modellen erreicht'
        : 'Bis zu ' + (CMP_MAX - n) + ' weitere möglich');
    try { document.documentElement.style.setProperty('--mkl-foot-h', (footEl.hidden ? 0 : footEl.offsetHeight / 16) + 'rem'); } catch (e) {}
    fitDrawer();
  }

  /* Pick mode (10.11.): the drawer adds models to an open comparison. Models already compared stay ticked and locked
     ("Im Vergleich"), other categories are locked, at most the free slots can be ticked; the CTA hands the ids over. */
  function syncPick() {
    var n = cmpSel.length, free = pick.slots - n, lab0 = (LENSES[pick.lens] || LENSES[LENS]).label;
    listEl.querySelectorAll('.mkl-cmp').forEach(function (lab) {
      var inp = lab.querySelector('input'), id = inp.getAttribute('data-id'), inCmp = pick.inCmp.indexOf(id) > -1, on = cmpSel.indexOf(id) > -1;
      var otherLens = inp.getAttribute('data-lens') !== pick.lens, dis = inCmp || (!on && (free <= 0 || otherLens));
      inp.checked = inCmp || on; inp.disabled = dis;
      lab.classList.toggle('is-in', inCmp); lab.classList.toggle('is-disabled', dis && !inCmp); lab.classList.toggle('is-lens', otherLens && !inCmp);
      var t = lab.querySelector('.mkl-cmp__t'); if (t) t.textContent = inCmp ? 'Im Vergleich' : 'Vergleichen';
      inp.setAttribute('aria-label', inp.getAttribute('aria-label').replace(/ (zum Vergleich auswählen|ist bereits im Vergleich)$/, inCmp ? ' ist bereits im Vergleich' : ' zum Vergleich auswählen'));
    });
    listEl.querySelectorAll('.mkl-group').forEach(function (g) {
      var hint = g.querySelector('.mkl-group__hint'), other = g.getAttribute('data-lens') !== pick.lens;
      hint.hidden = !other; if (other) hint.textContent = 'Vergleich nur innerhalb einer Kategorie – Ihr Vergleich läuft bei ' + lab0;
    });
    cta.textContent = 'Hinzufügen';
    cta.disabled = n < 1;
    setFoot(n ? (n === 1 ? '1 Modell ausgewählt' : n + ' Modelle ausgewählt') : 'Keine Modelle ausgewählt',
      free > 0 ? 'Noch ' + free + (free === 1 ? ' Platz' : ' Plätze') + ' im Vergleich frei' : 'Vergleich vollständig – maximal ' + CMP_MAX + ' Modelle');
    try { document.documentElement.style.setProperty('--mkl-foot-h', (footEl.hidden ? 0 : footEl.offsetHeight / 16) + 'rem'); } catch (e) {}
    fitDrawer();
  }

  /* =====================================================================
     09b P0-3 · Share the Merkliste without an account
     The list travels in the URL fragment (#liste=…), which never reaches a
     server: 'z.' + base64url(deflate-raw(JSON)) or 'j.' + base64url(JSON).
     The receiver sees it read-only in the drawer and can take it over.
     ===================================================================== */
  var SHKEY = 'mtz_mkl_shared';
  function b64url(bytes) { var str = ''; for (var i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]); return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64url(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; var bin = atob(str), out = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }
  function pipeBytes(bytes, stream) { return new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer().then(function (b) { return new Uint8Array(b); }); }
  function encodeList(obj) {
    var raw = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream !== 'function') return Promise.resolve('j.' + b64url(raw));
    return pipeBytes(raw, new CompressionStream('deflate-raw')).then(function (z) { return 'z.' + b64url(z); }, function () { return 'j.' + b64url(raw); });
  }
  function decodeList(payload) {
    try {
      if (payload.indexOf('j.') === 0) return Promise.resolve(JSON.parse(new TextDecoder().decode(unb64url(payload.slice(2)))));
      if (payload.indexOf('z.') === 0 && typeof DecompressionStream === 'function') return pipeBytes(unb64url(payload.slice(2)), new DecompressionStream('deflate-raw')).then(function (b) { return JSON.parse(new TextDecoder().decode(b)); });
    } catch (e) { return Promise.reject(e); }
    return Promise.reject(new Error('format'));
  }
  function gravurOf(it) { var st = it.configState; return (it.configId && st && st.gravurOn && String(st.gravurText || '').trim()) ? String(st.gravurText).trim() : ''; }
  function packItem(it, withGravur) {
    if (!it.configId) return { k: 'm', id: it.id, l: it.lens, n: it.name, im: it.img, p: it.priceFrom, u: it.uvp, f: it.konfig ? 1 : 0, url: it.url, pa: it.priceAtAdd, ps: it.priceSrc };
    var st = it.configState ? JSON.parse(JSON.stringify(it.configState)) : null, cs = (it.configSummary || []).map(function (l) { return { label: l.label, value: l.value }; });
    if (!withGravur && gravurOf(it)) { st.gravurText = ''; cs.forEach(function (l) { if (l.label === 'Gravur') l.value = 'Gravur gewählt (Text nicht geteilt)'; }); }
    return { k: 'c', id: it.configId, a: it.articleId, vn: it.variantArticleNo, l: it.lens, n: it.name, im: it.img, url: it.url, cs: cs, ct: it.configTotal, cq: it.configQty, cc: it.configComplete === false ? 0 : 1, st: st, at: it.updatedAt || it.addedAt, pa: it.priceAtAdd };
  }
  /* --- validation of a received payload: known keys only, bounded strings, finite numbers, relative safe paths --- */
  var KEYS_M = ['k', 'id', 'l', 'n', 'im', 'p', 'u', 'f', 'url', 'pa', 'ps'], KEYS_C = ['k', 'id', 'a', 'vn', 'l', 'n', 'im', 'url', 'cs', 'ct', 'cq', 'cc', 'st', 'at', 'pa'];
  function vStr(x) { return (typeof x === 'string' && x.length <= 300) ? x : null; }
  function vNum(x) { return (typeof x === 'number' && isFinite(x)) ? x : null; }
  function vUrl(x) { x = vStr(x); if (!x || /^javascript:/i.test(x) || x.indexOf('//') > -1 || !/^[\w%./?=&#-]+$/.test(x)) return null; return x; }
  /* product photos may be the shop's hotlinked main image (PLP cards mirror the live shop) — that one host/path only */
  function vImg(x) { x = vStr(x); if (x && /^https:\/\/edelstahl-tuerklingel\.de\/media\/image\/product\/[\w%./~-]+$/.test(x)) return x; return vUrl(x); }
  function vKey(x) { return (typeof x === 'string' && /^[^"\\<>]{1,300}$/.test(x)) ? x : null; }
  function vQtyMap(m) { var out = {}; if (!m || typeof m !== 'object' || Array.isArray(m)) return out; Object.keys(m).slice(0, 20).forEach(function (k) { if (vKey(k) && m[k] && typeof m[k] === 'object') out[k] = { qty: Math.max(1, Math.min(99, vNum(m[k].qty) || 1)) }; }); return out; }
  function vState(st) {
    if (!st || typeof st !== 'object' || Array.isArray(st)) return null;
    var art = vStr(st.article); if (art && !/^[\w.-]+$/.test(art)) art = null;
    return { article: art, finish: vKey(st.finish), finishText: vStr(st.finishText), ral: (st.ral && typeof st.ral === 'object') ? { code: vStr(st.ral.code), name: vStr(st.ral.name), hex: vStr(st.ral.hex) } : null,
      anschluss: vKey(st.anschluss), gravurOn: st.gravurOn === true, gravurText: vStr(st.gravurText) || '', font: vKey(st.font), innen: vQtyMap(st.innen),
      strom: (st.strom && typeof st.strom === 'object' && vKey(st.strom.name)) ? { name: st.strom.name, qty: Math.max(1, Math.min(99, vNum(st.strom.qty) || 1)) } : null,
      extras: vQtyMap(st.extras), mainQty: Math.max(1, Math.min(20, vNum(st.mainQty) || 1)), total: vNum(st.total), needsRal: st.needsRal === true, hasColour: st.hasColour === true, complete: st.complete === true, configured: st.configured === true };
  }
  function unpack(o, t) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    var keys = o.k === 'm' ? KEYS_M : (o.k === 'c' ? KEYS_C : null); if (!keys) return null;
    for (var k in o) if (keys.indexOf(k) < 0) return null;
    var lens = vStr(o.l); if (!LENSES[lens]) return null;
    var name = vStr(o.n); if (!name) return null;
    var img = vImg(o.im) || LENSES[lens].img, url = vUrl(o.url) || '#', at = vStr(o.at) || t;
    if (o.k === 'm') {
      var id = vStr(o.id); if (!id || !/^[\w.-]{1,80}$/.test(id)) return null;
      return { id: id, articleId: id, lens: lens, name: name, url: url, img: img, priceFrom: vNum(o.p), uvp: vNum(o.u), konfig: o.f === 1, addedAt: t, priceAtAdd: vNum(o.pa), priceSrc: (o.ps === 'plp' || o.ps === 'pdp') ? o.ps : undefined };
    }
    var cid = vStr(o.id); if (!cid || !/^[\w-]{1,80}$/.test(cid)) return null;
    var aid = vStr(o.a); if (!aid || !/^[\w.-]{1,80}$/.test(aid)) return null;
    var cs = Array.isArray(o.cs) ? o.cs.slice(0, 12).map(function (l) { return (l && vStr(l.label) && vStr(l.value)) ? { label: l.label, value: l.value } : null; }).filter(Boolean) : [];
    var st = vState(o.st);
    return { id: 'cfg:' + cid, configId: cid, articleId: aid, variantArticleNo: vStr(o.vn), lens: lens, name: name, img: img, url: url, konfig: true, configSummary: cs, configTotal: vNum(o.ct), configQty: Math.max(1, vNum(o.cq) || 1),
      configComplete: o.cc !== 0, configState: st, configHash: st ? cfgHash(st) : null, configExpired: false, addedAt: at, priceAtAdd: vNum(o.pa), priceSrc: 'cfg' };
  }
  function validateList(d) {
    if (!d || d.v !== 1 || !Array.isArray(d.i) || !d.i.length || d.i.length > LIMIT) return null;
    var t = vStr(d.t); if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(t)) t = new Date().toISOString().slice(0, 10);
    var seen = {}, out = [];
    d.i.forEach(function (o) { var it = unpack(o, t); if (it && !seen[it.id]) { seen[it.id] = 1; out.push(it); } });
    return out.length ? { t: t, items: out } : null;
  }
  function storeShared() { try { if (sharedList) sessionStorage.setItem(SHKEY, JSON.stringify(sharedList)); else sessionStorage.removeItem(SHKEY); } catch (e) {} }
  function loadShared() { try { var d = JSON.parse(sessionStorage.getItem(SHKEY) || 'null'); sharedList = (d && Array.isArray(d.items) && d.items.length) ? d : null; } catch (e) { sharedList = null; } }
  /* --- sender --- */
  function rootUrl() { try { return new URL(BASE || './', location.href).href; } catch (e) { return ''; } }
  function askOrShare() {
    var texts = []; items.forEach(function (it) { var g = gravurOf(it); if (g && texts.indexOf(g) < 0) texts.push(g); });
    if (!texts.length) { shareList(false); return; }
    popEl.hidden = true;
    askEl.querySelector('.mkl-shareask__q').textContent = 'Ihr Gravurtext („' + texts.join('“, „') + '“) ist Teil der Konfiguration. Soll er im Link enthalten sein?';
    askEl.hidden = false; askEl.focus();
  }
  function shareList(withGravur) {
    var n = items.length; if (!n) return;
    var obj = { v: 1, t: new Date().toISOString().slice(0, 10), i: items.map(function (it) { return packItem(it, withGravur); }) };
    encodeList(obj).then(function (payload) {
      var url = rootUrl() + LENSES[LENS].page + '#liste=' + payload;
      if (url.length > 7000) { toast('Zu viele Artikel für einen Link.', 'limit'); return; }
      var mobile = false; try { mobile = window.matchMedia('(max-width:47.99rem)').matches; } catch (e) {}
      if (mobile && navigator.share) { navigator.share({ title: 'Meine Merkliste | Metzler', text: n + ' Artikel', url: url }).catch(function (err) { if (!err || err.name !== 'AbortError') copyLink(url, n); }); return; }
      copyLink(url, n);
    });
  }
  function copyLink(url, n) {
    var ok = function () { toast('Link zur Merkliste kopiert.', 'ok'); live('Link zur Merkliste kopiert.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, function () { showSharePop(url); });
    else showSharePop(url);
  }
  function showSharePop(url) {   /* no clipboard: the link pre-selected in a read-only field */
    askEl.hidden = true; popEl.hidden = false;
    var inp = popEl.querySelector('input'); inp.value = url; inp.focus(); inp.select();
  }
  /* --- receiver --- */
  function bannerHTML() {
    var k = items.length;
    return '<p class="mkl-shared__t">Diese Merkliste wurde mit Ihnen geteilt</p>' +
      '<p class="mkl-shared__s">Erstellt am ' + esc(fmtDate(sharedList.t)) + ' · Ihre eigene Merkliste (' + k + ') bleibt unverändert.</p>' +
      '<div class="mkl-shared__act"><button class="btn btn--primary mkl-shared__take" type="button" data-mkl="take">In meine Merkliste übernehmen</button><button class="mkl-link" type="button" data-mkl="show-own">Meine Merkliste anzeigen (' + k + ')</button></div>';
  }
  /* the own entry that corresponds to a shared one (a different own build under the same id was renamed with -s on take-over) */
  function ownFor(sit) {
    var own = byId(sit.id);
    if (own && (!sit.configId || own.configHash === sit.configHash)) return own;
    return sit.configId ? byId('cfg:' + sit.configId + '-s') : null;
  }
  function takeHTML(it, nm) {
    var on = !!ownFor(it);
    return '<button class="mkl-mark mkl-mark--row' + (on ? ' is-on' : '') + '" type="button" data-take="' + esc(it.id) + '" aria-pressed="' + on + '" aria-label="' + esc(nm.main) + (on ? ' aus meiner Merkliste entfernen' : ' in meine Merkliste übernehmen') + '" title="' + (on ? 'In Ihrer Merkliste – entfernen' : 'In meine Merkliste übernehmen') + '"><span class="mkl-mark__disc">' + HEART + '</span></button>';
  }
  function copyShared(sit) {
    var it = JSON.parse(JSON.stringify(sit));
    if (it.configId && has(it.id)) { it.configId = it.configId + '-s'; it.id = 'cfg:' + it.configId; if (/[?&]merkliste=/.test(it.url)) it.url = 'pdp/index.html?merkliste=' + it.configId; if (has(it.id)) return null; }
    it.addedAt = new Date().toISOString();
    return it;
  }
  function takeOne(id) {
    var sit = viewById(id); if (!sit) return;
    var own = ownFor(sit), nm = shortName(sit).main;
    if (own) { removeItem(own.id); return; }   /* removeItem renders and offers undo */
    if (isFull()) { toast('Ihre Merkliste ist voll (' + LIMIT + ' Artikel).', 'limit'); return; }
    var it = copyShared(sit); if (!it) return;
    items.push(it); save(); syncAll(); pulseBadge();
    live('Übernommen: ' + nm + '. Merkliste: ' + items.length + ' Artikel');
    toast('In Ihre Merkliste übernommen', 'ok', { label: 'Rückgängig', fn: function () { var i = indexOf(it.id); if (i > -1) { items.splice(i, 1); save(); syncAll(); } } }, false, it.img);
  }
  function takeShared() {
    if (!sharedList) return;
    var todo = sharedList.items.filter(function (sit) { return !ownFor(sit); }), added = [];
    todo.forEach(function (sit) { if (isFull()) return; var it = copyShared(sit); if (it) { items.push(it); added.push(it.id); } });
    sharedList = null; sharedMode = false; storeShared();
    save(); syncAll(); if (added.length) pulseBadge(); titleEl.focus();
    if (!todo.length) { toast('Alle Artikel sind bereits in Ihrer Merkliste', 'info'); return; }
    if (added.length < todo.length) { toast(added.length + ' von ' + todo.length + ' übernommen. Ihre Merkliste ist voll.', 'limit'); return; }
    live(added.length + ' Artikel übernommen. Merkliste: ' + items.length + ' Artikel');
    toast(added.length + ' Artikel in Ihre Merkliste übernommen', 'ok', { label: 'Rückgängig', fn: function () { items = items.filter(function (it) { return added.indexOf(it.id) < 0; }); save(); syncAll(); titleEl.focus(); } });
  }
  function receiveShared() {
    var m = /^#liste=(.+)$/.exec(location.hash || ''); if (!m) return;
    var clean = function () { try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) {} };
    decodeList(m[1]).then(function (d) {
      var res = validateList(d); if (!res) throw new Error('invalid');
      clean(); sharedList = res; storeShared(); sharedMode = true;
      openDrawer(); sharedEl.focus();
      live('Geteilte Merkliste mit ' + res.items.length + ' Artikeln geöffnet.');
    }).catch(function () { clean(); toast('Dieser Link ist unvollständig.', 'limit'); });
  }
  function sharedCfg(cid) { loadShared(); if (!sharedList) return null; for (var i = 0; i < sharedList.items.length; i++) if (sharedList.items[i].configId === cid) return sharedList.items[i]; return null; }

  /* =====================================================================
     09b P0-4 · Print / PDF: a separate document node, not the scrolling drawer
     ===================================================================== */
  function startCompare() {
    if (pick) { var add = cmpSel.slice(0, pick.slots), fn = pick.onAdd; if (!add.length) return; closeDrawer(); if (typeof fn === 'function') fn(add); return; }
    var ids = cmpSel.slice(0, CMP_MAX); if (ids.length < CMP_MIN) return;
    var lens = lensOfCmp(ids[0]) || LENS;
    if (lens === LENS && window.MTZ_VGL && typeof window.MTZ_VGL.compare === 'function') {
      closeDrawer();
      var n = window.MTZ_VGL.compare(ids);
      cmpSel = [];
      if (n) toast('Vergleich mit ' + n + ' Modellen aus Ihrer Merkliste', 'ok');
    } else {
      var page = (LENSES[lens] || LENSES[LENS]).page;
      live('Öffnet den Vergleich auf der Seite ' + (LENSES[lens] || LENSES[LENS]).label);
      location.href = BASE + page + '?vergleich=' + encodeURIComponent(ids.join(',')) + '&von=merkliste';
    }
  }

  /* =====================================================================
     Product detail page (07a flow + 07b interface)
     One toggle, two instances (ghost button under the buy row, icon echo
     in the sticky bar). Below a chosen colour the page state is the
     configuration: colour article + options + quantity + total. "Gemerkt"
     = a saved build with the same hash exists; a changed build updates the
     session's entry instead of duplicating; ?merkliste=<configId> restores
     a saved build through the configurator's own controls and shows a band.
     ===================================================================== */
  var pdpRow, pdpBtn, pdpBar, pdpChanged, pdpBand, pdpLast = null, pdpBarVisible = null, bandCfgId = null, bandHash = null;
  var SKEY = 'mtz_mkl_pdp';
  function cfgOfSession() { try { return JSON.parse(sessionStorage.getItem(SKEY) || '{}'); } catch (e) { return {}; } }
  function setCfgOfSession(variant, id) { try { var m = cfgOfSession(); m[variant] = id; sessionStorage.setItem(SKEY, JSON.stringify(m)); } catch (e) {} }
  function djb2(str) { var hh = 5381; for (var i = 0; i < str.length; i++) hh = ((hh << 5) + hh + str.charCodeAt(i)) | 0; return (hh >>> 0).toString(16); }
  function cfgHash(sn) {
    var innen = Object.keys(sn.innen || {}).sort().map(function (k) { return [k, sn.innen[k].qty || 1]; });
    var extras = Object.keys(sn.extras || {}).sort().map(function (k) { return [k, sn.extras[k].qty || 1]; });
    return djb2(JSON.stringify({ a: sn.article, r: sn.ral && sn.ral.code, an: sn.anschluss, g: sn.gravurOn ? [String(sn.gravurText || '').trim(), sn.font] : null, i: innen, s: sn.strom ? [sn.strom.name, sn.strom.qty || 1] : null, x: extras, q: sn.mainQty || 1 }));
  }
  function cfgOpenStep(st) { if (!st) return null; if (st.needsRal) return 'RAL-Ton'; if (!st.anschluss) return 'Anschluss'; if (st.gravurOn && !String(st.gravurText || '').trim()) return 'Gravurtext'; return null; }
  function pdpSnap() { return window.MTZ_PDP.snapshot(); }
  function pdpSummary(sn) {
    var lines = window.MTZ_PDP.summary().map(function (l) { return { label: l.label, value: l.value }; });
    if (sn.needsRal) lines.forEach(function (l) { if (l.label === 'Farbe') l.value = 'Wunschfarbe nach RAL · Ton noch zu wählen'; });
    if (!sn.anschluss) lines.splice(1, 0, { label: 'Anschluss', value: 'noch zu wählen' });
    return lines;
  }
  function pdpVariantImg() { var src = String(window.MTZ_PDP.image() || ''); return /^(https?:|data:|\/)/.test(src) ? src : 'pdp/' + encodeURI(src); }
  function cfgItemFor(sn) {
    return { articleId: PDP.id, variantArticleNo: sn.article, lens: LENS, name: PDP.name, img: pdpVariantImg(), priceFrom: PDP.price, uvp: PDP.uvp, konfig: true,
      configSummary: pdpSummary(sn), configTotal: sn.total, configQty: sn.mainQty || 1, configState: sn, configHash: cfgHash(sn), configComplete: !!sn.complete, configExpired: false, priceSrc: 'cfg' };
  }
  function findCfgByHash(hh) { for (var i = 0; i < items.length; i++) if (items[i].configId && items[i].configHash === hh && items[i].articleId === PDP.id && !items[i].configExpired) return items[i]; return null; }
  /* Z-state of the page (07a §2) */
  function pdpState() {
    var sn = pdpSnap();
    if (!sn.finish) return { s1: false, on: has(PDP.id), sn: sn, changed: false };
    var hh = cfgHash(sn), hit = findCfgByHash(hh), sess = cfgOfSession()[sn.article] || null, sessItem = sess ? byId('cfg:' + sess) : null;
    return { s1: true, on: !!hit, hit: hit, sn: sn, hash: hh, sessId: sessItem ? sess : null, changed: !hit && !!sessItem };
  }
  function pdpBtnHTML(extra, iconOnly) {
    var glyph = '<span class="mkl-pdp-save__glyph" aria-hidden="true">' + HEART + '<i class="mkl-pdp-save__dot"></i></span>';
    var label = '<span class="mkl-pdp-save__label' + (iconOnly ? ' mkl-pdp-sr' : '') + '" data-alt="Gemerkt">Merken</span>';
    if (/\bmkl-pdp-media\b/.test(extra || ''))   /* gallery control (spec 10): one segment like "Fotos | 3D"; long label ≥ 561px, short label on phones */
      return '<button class="mkl-pdp-save' + extra + '" type="button" aria-pressed="false"><span class="mkl-pdp-media__seg">' + glyph + label + '<span class="mkl-pdp-save__short" data-alt="Gemerkt" aria-hidden="true">Merken</span></span></button>';
    return '<button class="mkl-pdp-save' + (extra || '') + '" type="button" aria-pressed="false">' + glyph + label + '</button>';
  }
  /* saved "stamp" — only after a click, never on load or sync (spec 10 §4.3) */
  function stampPdp() {
    if (reduced()) return;
    [pdpBtn, pdpBar].forEach(function (b) { if (!b) return; b.classList.remove('is-just-saved'); void b.offsetWidth; b.classList.add('is-just-saved'); setTimeout(function () { b.classList.remove('is-just-saved'); }, 260); });
  }
  function pressPdp(btn) {
    pdpLast = btn;
    if (!reduced()) { btn.classList.add('is-pressed'); setTimeout(function () { btn.classList.remove('is-pressed'); }, 120); }
    var st = pdpState(), was = st.on;
    if (!st.s1) { if (st.on) removeItem(PDP.id); else addItem(PDP.id, null); }
    else if (st.on) removeItem(st.hit.id);
    else if (st.changed) updateConfig(st.sessId, st.sn);
    else addConfig(st.sn);
    if (!was && btn.classList.contains('is-on')) stampPdp();
  }
  function addConfig(sn) {
    if (isFull()) { var m = 'Ihre Merkliste ist voll (' + LIMIT + ' Artikel).'; toast(m, 'limit', { label: 'Zur Merkliste', fn: openDrawer }, true); live(m); return; }
    var it = cfgItemFor(sn), cid = 'c-' + (sn.article || 'x') + '-' + Math.random().toString(36).slice(2, 8);
    it.id = 'cfg:' + cid; it.configId = cid; it.url = 'pdp/index.html?merkliste=' + cid; it.addedAt = new Date().toISOString(); it.priceAtAdd = sn.total;
    var mi = indexOf(PDP.id); if (mi > -1) items.splice(mi + 1, 0, it); else items.push(it);   /* the build sits right behind its model row */
    setCfgOfSession(sn.article, cid);
    save(); syncAll(); pulseBadge();
    live('Konfiguration gemerkt: ' + shortName(it).main + ', ' + (sn.finishText || '') + ', Gesamt ' + euro(sn.total) + '. Merkliste: ' + items.length + ' Artikel');
    toast('Konfiguration gemerkt' + (storageOk ? '' : ' – nur in dieser Sitzung'), 'ok', { label: 'Zur Merkliste', fn: openDrawer }, true, it.img);
  }
  function updateConfig(cid, sn) {
    var it = byId('cfg:' + cid); if (!it) { addConfig(sn); return; }
    var fresh = cfgItemFor(sn);
    ['variantArticleNo', 'img', 'configSummary', 'configTotal', 'configQty', 'configState', 'configHash', 'configComplete'].forEach(function (k) { it[k] = fresh[k]; });
    it.updatedAt = new Date().toISOString(); it.configExpired = false; delete cfgLive[cid];
    save(); syncAll();   /* no badge pulse: the count is unchanged */
    live('Konfiguration aktualisiert: ' + shortName(it).main + ', ' + (sn.finishText || '') + ', Gesamt ' + euro(sn.total));
    toast('Konfiguration aktualisiert' + (storageOk ? '' : ' – nur in dieser Sitzung'), 'ok', { label: 'Zur Merkliste', fn: openDrawer }, true, it.img);
  }
  function syncPdpMarks() {
    if (!PDP || !pdpBtn || !window.MTZ_PDP) return;
    var st = pdpState(), nm = shortName({ name: PDP.name, lens: LENS }).main, colour = st.sn.finishText || '';
    var label = st.s1 ? (st.on ? 'Konfiguration gemerkt' : 'Konfiguration merken') : (st.on ? 'Gemerkt' : 'Merken');
    var alt = st.s1 ? (st.on ? 'Konfiguration merken' : 'Konfiguration gemerkt') : (st.on ? 'Merken' : 'Gemerkt');
    var shortL = st.on ? 'Gemerkt' : 'Merken', shortAlt = st.on ? 'Merken' : 'Gemerkt';
    var aria = label + ': ' + nm + (st.s1 && colour ? ', ' + colour : '');   /* starts with the visible label (WCAG 2.5.3) */
    var lim = !st.on && !st.changed && isFull();
    var extraTitle = lim ? 'Ihre Merkliste ist voll (' + LIMIT + ' Artikel).' : (st.changed ? 'Geändert seit dem Merken – erneut merken, um zu aktualisieren' : (st.on ? 'Aus der Merkliste entfernen' : ''));
    [pdpBtn, pdpBar].forEach(function (b) {
      if (!b) return;
      b.classList.toggle('is-on', st.on); b.setAttribute('aria-pressed', st.on ? 'true' : 'false'); b.setAttribute('aria-label', aria);
      var t = extraTitle || (b === pdpBar ? label : ''); if (t) b.setAttribute('title', t); else b.removeAttribute('title');
      var l = b.querySelector('.mkl-pdp-save__label'); l.textContent = label; l.setAttribute('data-alt', alt);
      var s = b.querySelector('.mkl-pdp-save__short'); if (s) { s.textContent = shortL; s.setAttribute('data-alt', shortAlt); }
      b.classList.toggle('is-changed', !!st.changed); if (st.changed) b.setAttribute('aria-describedby', 'mklPdpChanged'); else b.removeAttribute('aria-describedby');
      b.classList.toggle('is-limit', lim); if (lim) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    });
    pdpChanged.hidden = !st.changed; pdpRow.hidden = !st.changed;   /* the caption row only exists while it has something to say (no empty gap in the checkout stack) */
    if (pdpBand && !(st.on && st.hit && st.hit.configId === bandCfgId) && !(bandHash && st.hash === bandHash)) removeBand();   /* the band describes the restored build; the first change turns it into the caption */
  }
  function hintSwatches() { var sw = document.getElementById('pdpSwatches'); if (!sw) return; sw.classList.add('mkl-pdp-hint'); setTimeout(function () { sw.classList.remove('mkl-pdp-hint'); }, 1400); }
  function removeBand() { if (!pdpBand) return; var b = pdpBand; pdpBand = null; bandCfgId = null; bandHash = null; if (reduced()) { b.remove(); } else { b.classList.add('is-leaving'); setTimeout(function () { b.remove(); }, 160); } }
  function resetConfig() { removeBand(); window.MTZ_PDP.reset(); var sw = document.getElementById('pdpSwatches'); if (sw) sw.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }); hintSwatches(); syncPdpMarks(); if (pdpBtn) pdpBtn.focus({ preventScroll: true }); }
  /* arrival via ?merkliste=<configId> or "Konfiguration öffnen" in the drawer on this page */
  function arrive(cid) {
    try { var q = location.search.replace(/([?&])merkliste=[^&#]*(&|$)/, function (m0, a, b) { return b ? a : ''; }).replace(/[?&]$/, ''); history.replaceState(null, '', location.pathname + q + location.hash); } catch (e) {}
    var it = byId('cfg:' + cid), fromShare = false;
    if (!it || !it.configState) { var sit = sharedCfg(cid); if (sit && sit.configState) { it = sit; fromShare = true; } }   /* 09b: a configuration from a shared list */
    if (!it || !it.configState) { setTimeout(function () { toast('Diese Konfiguration ist hier nicht gespeichert.', 'info', { label: 'Zur Merkliste', fn: openDrawer }); }, 300); return; }
    removeBand();
    var missing = window.MTZ_PDP.restore(it.configState) || [];
    var sn = pdpSnap(), colourGone = !!it.configState.article && sn.article !== it.configState.article;
    if (!fromShare) { if (colourGone) { it.configExpired = true; save(); } else { setCfgOfSession(sn.article, cid); it.configExpired = false; cfgLive[cid] = sn.total; } }
    var lines = (it.configSummary || []).slice(0, 3).map(function (l) { return esc(l.label) + ': ' + esc(l.value); }), more = (it.configSummary || []).length - lines.length;
    var notes = [];
    if (colourGone) notes.push('Diese Farbe ist nicht mehr verfügbar – bitte wählen Sie eine Farbe.');
    if (missing.length) notes.push('Nicht mehr verfügbar: ' + esc(missing.join(', ')) + ' – bitte neu wählen');
    var open = colourGone ? null : window.MTZ_PDP.firstOpen(); if (open) notes.push('Noch offen: ' + esc(open));
    if (!colourGone && typeof it.configTotal === 'number' && Math.abs(sn.total - it.configTotal) > 0.004) notes.push('Preis aktualisiert: ' + euro(it.configTotal) + ' → ' + euro(sn.total));
    var title = colourGone ? 'Konfiguration abgelaufen – Zusammenfassung siehe Merkliste' : (fromShare ? 'Geteilte' : 'Gespeicherte') + ' Konfiguration vom ' + fmtDate(it.updatedAt || it.addedAt);
    pdpBand = h('<div class="mkl-pdp-band" id="mklPdpBand" role="status" tabindex="-1">' +
      '<span class="mkl-pdp-band__glyph" aria-hidden="true">' + HEART + '</span>' +
      '<div class="mkl-pdp-band__text"><span class="mkl-pdp-band__title">' + title + '</span>' +
        '<span class="mkl-pdp-band__sub"><b>Gesamt ' + euro(it.configTotal) + '</b>' + (lines.length ? ' · ' + lines.join(' · ') : '') + (more > 0 ? ' · + ' + more + ' weitere' : '') + '</span>' +
        (notes.length ? '<span class="mkl-pdp-band__sub">' + notes.join(' · ') + '</span>' : '') + '</div>' +
      '<button class="mkl-pdp-band__act" type="button" data-mkl="reconfigure">' + (colourGone ? 'Farbe wählen' : 'Neu konfigurieren') + '</button>' +
      '<button class="mkl-pdp-band__x" type="button" aria-label="Hinweis schließen">' + IC_X + '</button></div>');
    bandCfgId = colourGone || fromShare ? null : cid; bandHash = colourGone ? null : cfgHash(sn);   /* the band stays until the first change of the restored build */
    var lead = document.querySelector('.pdp-price--lead') || document.querySelector('.pdp-buybox');
    if (lead) { lead.insertBefore(pdpBand, lead.firstChild); lead.style.scrollMarginTop = '6rem'; }
    pdpBand.querySelector('[data-mkl="reconfigure"]').addEventListener('click', function () { if (colourGone) { removeBand(); var sw = document.getElementById('pdpSwatches'); if (sw) { sw.scrollIntoView({ behavior: 'smooth', block: 'center' }); hintSwatches(); var f = sw.querySelector('.pdp-swatch'); if (f) f.focus({ preventScroll: true }); } } else resetConfig(); });
    pdpBand.querySelector('.mkl-pdp-band__x').addEventListener('click', function () { removeBand(); if (pdpBtn) pdpBtn.focus({ preventScroll: true }); });
    if (open && !colourGone) window.MTZ_PDP.openFirst();
    syncPdpMarks();
    setTimeout(function () { if (lead) try { window.scrollTo({ top: Math.max(0, lead.getBoundingClientRect().top + window.pageYOffset - 96), behavior: reduced() ? 'auto' : 'smooth' }); } catch (e) {} if (pdpBand) pdpBand.focus({ preventScroll: true }); }, 350);   /* after the configurator has unfolded */
  }
  function initPdp() {
    var buy = document.querySelector('#bCheckout .cfgb-buyrow'); if (!buy) return;
    /* one Merken control on the gallery, opposite the "Fotos | 3D" switch (client decision 2026-11-01, desktop + mobile); state via glyph + aria-label/title */
    var stage = document.querySelector('.pdp-media__stage');
    pdpBtn = h(pdpBtnHTML(' mkl-pdp-media', false));
    if (stage) stage.appendChild(pdpBtn); else buy.appendChild(pdpBtn);
    pdpBtn.addEventListener('click', function () { pressPdp(pdpBtn); });
    pdpRow = h('<div class="mkl-pdp-row" id="mklPdpRow" hidden><p class="mkl-pdp-changed" id="mklPdpChanged" hidden>Geändert seit dem Merken – erneut merken, um zu aktualisieren</p></div>');
    buy.insertAdjacentElement('afterend', pdpRow);
    pdpChanged = pdpRow.querySelector('.mkl-pdp-changed');
    var details = document.getElementById('bStickyDetails');
    if (details) { pdpBar = h(pdpBtnHTML(' mkl-pdp-save--icon mkl-pdp-bar', true)); details.insertAdjacentElement('beforebegin', pdpBar); pdpBar.addEventListener('click', function () { pressPdp(pdpBar); }); }
    var bar = document.getElementById('pdpStickyBar');
    if (bar) {
      pdpBarVisible = function () { return bar.classList.contains('is-visible') && !document.body.classList.contains('cfg-sheet-open'); };
      /* one instance at a time: the echo steps back while the gallery control is on screen (spec 10, M6) */
      var dupCheck = function () { if (!pdpBar || !pdpBtn) return; var r = pdpBtn.getBoundingClientRect(); pdpBar.classList.toggle('is-dup', r.width > 0 && r.bottom > 0 && r.top < window.innerHeight); };
      var dupT = 0, dupSoon = function () { if (dupT) return; dupT = setTimeout(function () { dupT = 0; dupCheck(); }, 60); };   /* throttled; a timer also runs in background tabs */
      window.addEventListener('scroll', dupSoon, { passive: true }); window.addEventListener('resize', dupSoon);
      var updBar = function () { document.documentElement.style.setProperty('--mkl-pdp-bar-h', (bar.offsetHeight / 16) + 'rem'); if (toastEl.classList.contains('show') && !isOpen) toastEl.classList.toggle('is-pdp-bar', pdpBarVisible()); dupCheck(); };
      if (window.MutationObserver) new MutationObserver(updBar).observe(bar, { attributes: true, attributeFilter: ['class'] });
      updBar();
    }
    document.addEventListener('mtz:pdp-change', syncPdpMarks);
    initReturn();
    var m = /[?&]merkliste=([^&#]+)/.exec(QS), cid = m && decodeURIComponent(m[1]);
    syncPdpMarks();
    if (cid && cid !== 'demo') setTimeout(function () { arrive(cid); }, 50);
  }

  /* 09b P0-10: came from a comparison (vergleichen.js writes sessionStorage.mtz_return on the column CTA) → way back in the breadcrumb row */
  function initReturn() {
    var rt = null; try { rt = JSON.parse(sessionStorage.getItem('mtz_return') || 'null'); } catch (e) {}
    if (!rt || rt.type !== 'vergleich' || typeof rt.t !== 'number' || Date.now() - rt.t > 7200000 || !/^[\w.-]+\.html\?vergleich=[\w.,%-]+$/.test(String(rt.href || ''))) return;
    var ct = document.querySelector('.crumb .container'); if (!ct || ct.querySelector('.mkl-return')) return;
    var n = Math.max(0, parseInt(rt.n, 10) || 0);
    ct.classList.add('mkl-has-return');
    ct.appendChild(h('<a class="mkl-return" href="' + esc(BASE + rt.href) + '" aria-label="Zurück zum Vergleich mit ' + n + ' Modellen">' + IC_CHEV_L + '<span class="mkl-return__l">Zurück zum Vergleich (' + n + ')</span><span class="mkl-return__s">Zum Vergleich (' + n + ')</span></a>'));
  }

  /* ---- Demo seed: a configured build (spec §3.2 / checklist 8) via ?merkliste=demo or window.MTZ_MKL.seedDemoConfig() ---- */
  function seedDemoConfig() {
    var baseId = LENS === 'briefkasten' ? 'siebert' : 'colson1', p = BY_ID[baseId] || (window.MTZ_PRODUCTS || [])[0]; if (!p) return false;
    var cid = 'demo-7f3a', id = 'cfg:' + cid; if (has(id)) return true;
    items.unshift({ id: id, articleId: String(p.id), lens: LENS, name: p.name, url: '#', img: p.img || LENSES[LENS].img, priceFrom: (typeof p.price === 'number' ? p.price : null), konfig: true, configId: cid,
      configSummary: LENS === 'briefkasten' ? [{ label: 'Farbe', value: 'Anthrazit' }, { label: 'Gravur', value: 'Familie Maier' }, { label: 'Aufstellung', value: 'Stand mit Ständer' }] : [{ label: 'Farbe', value: 'Anthrazit' }, { label: 'Klingeltaster', value: '2' }, { label: 'Gravur', value: 'Familie Maier' }],
      configTotal: LENS === 'briefkasten' ? 389 : 1249, addedAt: new Date().toISOString(), priceAtAdd: LENS === 'briefkasten' ? 389 : 1249 });
    save(); syncAll(); return true;
  }

  /* ---- Init ---- */
  function init() {
    if (PDP && !window.MTZ_PRODUCTS) {   /* product detail page: one product, described by the page */
      PDP.name = PDP.name || window.MTZ_PDP.name(); PDP.img = PDP.img || ('pdp/' + encodeURI(window.MTZ_PDP.image() || '')); PDP.lens = PDP.lens || LENS;
      window.MTZ_PRODUCTS = [{ id: PDP.id, name: PDP.name, price: PDP.price, uvp: PDP.uvp, img: PDP.img, konfig: true }];
    }
    if (!window.MTZ_PRODUCTS) return setTimeout(init, 50);
    indexProducts(); load(); refreshPrices(); loadShared(); buildChrome();
    var grid = document.getElementById('productGrid');
    if (grid) { scanCards(); new MutationObserver(scanCards).observe(grid, { childList: true }); }
    /* compare overlay: decorate every product column with a bookmark whenever it (re)renders */
    var tries = 0; (function watchOverlay() {
      var body = document.querySelector('[data-vgl="body"]');
      if (!body) { if (tries++ < 40) setTimeout(watchOverlay, 50); return; }
      injectOverlayHearts();
      new MutationObserver(injectOverlayHearts).observe(body, { childList: true, subtree: true });
    })();
    window.addEventListener('resize', function () { if (!isOpen) return; placeHint(); try { document.documentElement.style.setProperty('--mkl-foot-h', (footEl.hidden ? 0 : footEl.offsetHeight / 16) + 'rem'); } catch (e) {} fitDrawer(); });   /* rotation re-checks the drawer layout */
    /* cross-tab: another tab changed the list */
    window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); refreshPrices(); syncAll(); live('Merkliste in einem anderen Tab geändert: ' + items.length + ' Artikel'); } });
    if (/[?&]merkliste=demo\b/.test(QS)) seedDemoConfig();
    syncAll();
    if (PDP) { initPdp(); recordView(PDP.id, null); }
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.pcard .pcard__title a, .pcard .pcard__img, [data-go]'); if (!t) return;
      var card = t.closest('.pcard[data-id]'), id = card ? card.getAttribute('data-id') : t.getAttribute('data-go');
      if (id) recordView(id, card);
    }, true);
    /* arrived from the other PLP's Merkliste with ?vergleich=…&von=merkliste */
    var m = /[?&]vergleich=([^&#]+)/.exec(QS);
    if (m && /[?&]von=merkliste\b/.test(QS)) { var n = decodeURIComponent(m[1]).split(',').filter(function (id) { return BY_ID[id]; }).length; if (n >= CMP_MIN) setTimeout(function () { toast('Vergleich mit ' + n + ' Modellen aus Ihrer Merkliste', 'ok'); }, 300); }
    receiveShared();
  }
  window.MTZ_MKL = { open: function (o) {
      if (isOpen) return;
      var pk = o && o.pick;
      pick = pk ? { lens: pk.lens || LENS, inCmp: (pk.inCmp || []).slice(), slots: Math.max(0, pk.slots || 0), onAdd: pk.onAdd } : null;
      if (pick) { cmpSel = []; sharedMode = false; }
      openDrawer();
    }, close: closeDrawer, items: function () { return items.slice(); }, has: has, seedDemoConfig: seedDemoConfig, reload: function () { load(); refreshPrices(); syncAll(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
