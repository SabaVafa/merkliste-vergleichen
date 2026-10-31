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
   Decoupled layer: reads window.MTZ_PRODUCTS / window.MTZ_LENS, touches no
   PLP file, defines no vgl- class and changes nothing in vergleichen.js.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'mtz_merkliste', LIMIT = 50, CMP_MAX = 4, CMP_MIN = 2, TOAST_MS = 5000;
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
    return { id: String(p.id), articleId: String(p.id), lens: LENS, name: p.name, url: (PDP_URLS[String(p.id)] || '#'), img: imgOf(p, cardEl), priceFrom: (typeof p.price === 'number' ? p.price : null), uvp: (typeof p.uvp === 'number' ? p.uvp : null), konfig: konfigOf(p), addedAt: new Date().toISOString(), priceAtAdd: (typeof p.price === 'number' ? p.price : null) };
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
  function euro(n) { return (typeof n === 'number') ? n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace(/\.(\d{2})$/, ',$1') + ' €' : '—'; }

  /* ---- DOM helpers + icons ---- */
  function h(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var HEART_PATH = 'M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z';   /* bookmark glyph (Merkliste = Lesezeichen) */
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + HEART_PATH + '"/></svg>';
  var CHK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  var IC_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var IC_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
  var IC_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="8.4 12.5 11 15 16 9.5"/></svg>';
  var IC_INFO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.6" r="0.6"/></svg>';
  var IC_LIMIT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13.5"/><circle cx="12" cy="17" r="0.6"/></svg>';
  var reduced = function () { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  /* ---- Chrome ---- */
  var hdrBtn, hdrBadge, scrim, drawer, titleEl, countEl, clearBtn, confirmEl, confirmQ, notice, listEl, emptyEl, footHint, cta, footEl, toastEl, toastT, liveEl;
  var isOpen = false, opener = null, prevOverflow = '', toastHome = null;
  var cmpSel = [];   /* ids ticked for "Auswahl vergleichen" (session UI state, never persisted) */

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
          '<button class="mkl-link" type="button" data-mkl="clear" hidden>Merkliste leeren</button>' +
          '<button class="mkl-close" type="button" data-mkl="close" aria-label="Merkliste schließen">' + IC_X + '</button>' +
        '</div>' +
        '<div class="mkl-confirm" hidden role="group" aria-label="Merkliste leeren bestätigen" tabindex="-1"><span class="mkl-confirm__q"></span><button class="mkl-btn" type="button" data-mkl="clear-yes">Ja, entfernen</button><button class="mkl-link" type="button" data-mkl="clear-no">Abbrechen</button></div>' +
        '<p class="mkl-notice" hidden>Die Merkliste kann auf diesem Gerät nicht gespeichert werden (Cookies/Speicher blockiert)</p>' +
      '</div>' +
      '<div class="mkl-body">' +
        '<ul class="mkl-list" role="list"></ul>' +
        '<div class="mkl-empty" hidden>' + HEART + '<h3 class="mkl-empty__title">Ihre Merkliste ist leer</h3><p class="mkl-empty__body">Merken Sie Modelle mit dem Lesezeichen-Symbol — sie bleiben auf diesem Gerät gespeichert.</p><button class="btn btn--secondary" type="button" data-mkl="back">' + (PDP ? 'Zurück zum Produkt' : 'Zurück zu ' + esc(LENSES[LENS].label)) + '</button></div>' +
      '</div>' +
      '<div class="mkl-foot">' +
        '<p class="mkl-hint">Auf diesem Gerät gespeichert · <a href="#" data-mkl="login">Anmelden</a>, um die Merkliste auf allen Geräten zu nutzen</p>' +
        '<span class="mkl-foot__hint">Wählen Sie mindestens 2 Modelle derselben Kategorie</span>' +
        '<button class="mkl-cta" type="button" data-mkl="compare" disabled>Auswahl vergleichen (0)</button>' +
      '</div>' +
    '</div>');
    document.body.appendChild(drawer);
    titleEl = drawer.querySelector('.mkl-title'); countEl = drawer.querySelector('.mkl-count'); clearBtn = drawer.querySelector('[data-mkl="clear"]');
    confirmEl = drawer.querySelector('.mkl-confirm'); confirmQ = drawer.querySelector('.mkl-confirm__q'); notice = drawer.querySelector('.mkl-notice');
    listEl = drawer.querySelector('.mkl-list'); emptyEl = drawer.querySelector('.mkl-empty'); footHint = drawer.querySelector('.mkl-foot__hint'); cta = drawer.querySelector('[data-mkl="compare"]'); footEl = drawer.querySelector('.mkl-foot');
    notice.hidden = storageOk;

    drawer.addEventListener('click', function (e) {
      var a = e.target.closest('[data-mkl]');
      if (a) {
        var k = a.getAttribute('data-mkl');
        if (k === 'close' || k === 'back') { closeDrawer(); return; }
        if (k === 'clear') { confirmQ.textContent = items.length + ' Artikel aus der Merkliste entfernen?'; confirmEl.hidden = false; confirmEl.focus(); return; }
        if (k === 'clear-no') { confirmEl.hidden = true; clearBtn.focus(); return; }
        if (k === 'clear-yes') { clearAll(); return; }
        if (k === 'compare') { startCompare(); return; }
        if (k === 'login') { e.preventDefault(); toast('Anmelden ist im Prototyp nicht verfügbar — im Shop werden die Artikel nach dem Login zusammengeführt.', 'info'); return; }
      }
      var go = e.target.closest('.mkl-item__cta');
      if (go) {
        var href = go.getAttribute('href') || '#', row = go.closest('.mkl-item'), rid = row && row.getAttribute('data-id'), rit = rid && byId(rid);
        if (PDP && rit && rit.articleId === PDP.id) {   /* this product's own entries: no navigation, act in place */
          e.preventDefault(); closeDrawer();
          if (rit.configId) { arrive(rit.configId); } else { var sw = document.getElementById('pdpSwatches'); if (sw) { sw.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }); hintSwatches(); } }
          return;
        }
        if (href.charAt(0) === '#') { e.preventDefault(); closeDrawer(); toast(/Konfiguration öffnen/.test(go.textContent) ? 'Gespeicherte Konfiguration öffnen (Prototyp)' : ('Weiter zur ' + (/Konfigurieren/.test(go.textContent) ? 'Konfiguration' : 'Produktseite') + ' — dort Farbe, Namensschild & Gravur wählen (Prototyp)'), 'info'); return; }
        closeDrawer(); return;   /* a real page: let the link navigate */
      }
      var rm = e.target.closest('.mkl-rm');
      if (rm) { removeFromRow(rm.getAttribute('data-id'), rm); return; }
      var cmp = e.target.closest('.mkl-cmp');
      if (cmp) { var inp = cmp.querySelector('input'); if (inp.disabled) { e.preventDefault(); if (cmp.classList.contains('is-lens')) toast('Vergleich nur innerhalb einer Kategorie', 'info'); else toast('Maximal ' + CMP_MAX + ' Modelle gleichzeitig — bitte zuerst eines entfernen.', 'limit'); } }
    });
    drawer.addEventListener('change', function (e) {
      var inp = e.target.closest('.mkl-cmp input'); if (!inp) return;
      var id = inp.getAttribute('data-id'), i = cmpSel.indexOf(id);
      if (inp.checked && i < 0) { if (cmpSel.length >= CMP_MAX) { inp.checked = false; toast('Maximal ' + CMP_MAX + ' Modelle gleichzeitig — bitte zuerst eines entfernen.', 'limit'); return; } cmpSel.push(id); }
      else if (!inp.checked && i > -1) cmpSel.splice(i, 1);
      syncCmp();
    });
    /* keyboard: Escape closes the drawer only (not an overlay beneath); Tab wraps inside */
    drawer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); if (!confirmEl.hidden) { confirmEl.hidden = true; clearBtn.focus(); } else closeDrawer(); return; }
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
  function openDrawer() {
    if (isOpen) return;
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
    confirmEl.hidden = true;
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
  function toast(msg, type, action) {
    type = type || 'ok';
    var vt = document.querySelector('.vgl-toast.show'); if (vt) vt.classList.remove('show');   /* a Merkliste toast replaces a compare toast (§5.7) */
    toastEl.className = 'mkl-toast t-' + type + (isOpen ? ' is-drawer' : (document.querySelector('.vgl-view.is-open') ? ' is-view' : (document.querySelector('.vgl-tray.is-open') ? ' is-raised' : ((pdpBarVisible && pdpBarVisible()) ? ' is-pdp-bar' : ''))));
    toastEl.innerHTML = (type === 'limit' ? IC_LIMIT : (type === 'info' ? IC_INFO : IC_OK)) + '<span class="mkl-toast__msg">' + esc(msg) + '</span>' + (action ? '<button class="mkl-toast__act" type="button">' + esc(action.label) + '</button>' : '');
    if (action) toastEl.querySelector('.mkl-toast__act').addEventListener('click', function () { hideToast(); action.fn(); });
    toastEl.classList.add('show');
    clearTimeout(toastT); toastPaused = false; toastLeft = TOAST_MS; toastStart = Date.now();
    toastT = setTimeout(hideToast, TOAST_MS);
  }
  function hideToast() { clearTimeout(toastT); toastEl.classList.remove('show'); }
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
    btn.setAttribute('title', on ? 'Gemerkt — aus der Merkliste entfernen' : 'Merken');
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
    if (isFull()) { var m = 'Ihre Merkliste ist voll (' + LIMIT + ') — bitte zuerst einen Artikel entfernen'; toast(m, 'limit', { label: 'Zur Merkliste', fn: openDrawer }); live(m); return false; }
    var it = itemFrom(p, cardEl); items.push(it); save(); syncAll(); pulseBadge();
    live('Gemerkt: ' + shortName(it).main + '. Merkliste: ' + items.length + ' Artikel');
    toast('Gemerkt', 'ok', { label: 'Zur Merkliste', fn: openDrawer });
    return true;
  }
  function removeItem(id, silent) {
    var i = indexOf(id); if (i < 0) return;
    var it = items[i]; items.splice(i, 1); cmpSel = cmpSel.filter(function (x) { return x !== id; }); save(); syncAll();
    live('Entfernt: ' + shortName(it).main + '. Merkliste: ' + items.length + ' Artikel');
    if (!silent) toast(it.configId ? 'Konfiguration aus der Merkliste entfernt' : 'Aus der Merkliste entfernt', 'ok', { label: 'Rückgängig', fn: function () { restore([{ item: it, index: i }]); } });
  }
  function removeFromRow(id, btn) {
    var row = btn.closest('.mkl-item'), li = row && row.parentNode, next = li && li.nextElementSibling;
    var focusId = next ? next.querySelector('.mkl-rm').getAttribute('data-id') : null;
    var doIt = function () { removeItem(id); var nb = focusId && listEl.querySelector('.mkl-rm[data-id="' + focusId + '"]'); (nb || titleEl).focus(); };
    if (row && !reduced()) { row.classList.add('is-leaving'); setTimeout(doIt, 120); } else doIt();
  }
  function restore(entries) {
    entries.sort(function (a, b) { return a.index - b.index; }).forEach(function (e) { if (has(e.item.id)) return; if (items.length >= LIMIT) return; items.splice(Math.min(e.index, items.length), 0, e.item); });
    save(); syncAll(); pulseBadge();
    live('Wiederhergestellt: ' + (entries.length === 1 ? shortName(entries[0].item).main : entries.length + ' Artikel') + '. Merkliste: ' + items.length + ' Artikel');
    if (isOpen) { var b = entries.length === 1 && listEl.querySelector('.mkl-rm[data-id="' + entries[0].item.id.replace(/"/g, '') + '"]'); (b || titleEl).focus(); }
    else if (PDP && pdpBtn) { var t = (pdpLast === pdpBar && pdpBarVisible && pdpBarVisible()) ? pdpBar : pdpBtn; t.focus({ preventScroll: true }); }
  }
  function clearAll() {
    var snap = items.map(function (it, i) { return { item: it, index: i }; }), n = items.length;
    items = []; cmpSel = []; confirmEl.hidden = true; save(); syncAll(); titleEl.focus();
    live(n + ' Artikel entfernt. Merkliste: 0 Artikel');
    toast(n + ' Artikel entfernt', 'ok', { label: 'Rückgängig', fn: function () { restore(snap); } });
  }

  /* ---- Drawer rendering ---- */
  function rowHTML(it) {
    var nm = shortName(it), cfg = !!it.configId, cmpId = it.articleId || it.id;
    var price = (cfg && typeof it.configTotal === 'number') ? 'Gesamt ' + euro(it.configTotal) + ((it.configQty || 1) > 1 ? ' · ' + it.configQty + ' Stück' : '') : (typeof it.priceFrom === 'number' ? 'ab ' + euro(it.priceFrom) : '');
    var uvp = (!cfg && typeof it.uvp === 'number' && it.uvp > (it.priceFrom || 0)) ? '<span class="mkl-item__uvp">UVP ' + euro(it.uvp) + '</span>' : '';
    var ctaTxt = cfg ? (it.configExpired ? 'Konfigurieren' : 'Konfiguration öffnen') : (it.konfig ? 'Konfigurieren' : 'Zum Produkt');
    var ctaHref = cfg ? (it.url && it.url !== '#' ? asset(it.url) : '#konfigurator?configId=' + encodeURIComponent(it.configId)) : (it.url && it.url !== '#' ? asset(it.url) : (it.konfig ? '#konfigurator' : '#produkt'));
    var openStep = cfg && !it.configExpired && it.configComplete === false ? cfgOpenStep(it.configState) : null;
    var cfgHtml = '';
    if (cfg) {
      var lines = (it.configSummary || []).slice(0, 3).map(function (l) { return esc(l.label) + ': ' + esc(l.value); });
      cfgHtml = (lines.length ? '<p class="mkl-item__cfg">' + lines.join(' · ') + '</p>' : '') +
        (it.configExpired ? '<p class="mkl-item__expired">Konfiguration abgelaufen — Details siehe Zusammenfassung</p>' : (openStep ? '<p class="mkl-item__expired">Noch nicht vollständig — ' + esc(openStep) + ' offen</p>' : ''));
    }
    var avail = it.availability ? '<span class="mkl-item__avail">' + esc(it.availability) + '</span>' : '';
    return '<li><article class="mkl-item' + (cfg ? ' mkl-item--cfg' : '') + '" data-id="' + esc(it.id) + '" data-lens="' + esc(it.lens) + '">' +
      '<div class="mkl-item__media"><img src="' + esc(asset(it.img)) + '" alt=""></div>' +
      '<div class="mkl-item__text">' +
        (cfg ? '<span class="mkl-item__tag">Ihre Konfiguration' + (it.updatedAt ? ' · aktualisiert ' + esc(fmtDate(it.updatedAt)) : (it.addedAt ? ' · ' + esc(fmtDate(it.addedAt)) : '')) + '</span>' : '') +
        '<div class="mkl-item__name">' + esc(nm.main) + '</div>' +
        (nm.sub ? '<div class="mkl-item__sub">' + esc(nm.sub) + '</div>' : '') +
        (price ? '<div class="mkl-item__price">' + esc(price) + uvp + '</div>' : '') +
        cfgHtml + avail +
      '</div>' +
      '<button class="mkl-rm" type="button" data-id="' + esc(it.id) + '" aria-label="' + esc(nm.main) + ' entfernen">' + IC_TRASH + '</button>' +
      '<div class="mkl-item__actions">' +
        '<a class="btn btn--secondary mkl-item__cta" href="' + esc(ctaHref) + '">' + ctaTxt + '</a>' +
        '<div class="mkl-item__sec">' +
          (cfg ? '<span class="mkl-item__cfgnote">Vergleich auf Modellebene — über das Basismodell</span>' :
            '<label class="mkl-cmp"><input type="checkbox" data-id="' + esc(cmpId) + '" data-lens="' + esc(it.lens) + '" aria-label="' + esc(nm.main) + ' zum Vergleich auswählen"><span class="mkl-cmp__box" aria-hidden="true">' + CHK + '</span>Vergleichen</label>') +
        '</div>' +
      '</div>' +
    '</article></li>';
  }
  /* rows grouped by category: the current page's category first; the lock hint sits once in the group head */
  function groupHTML(lens, rows) {
    var lab = (LENSES[lens] || LENSES[LENS]).label;
    return '<li class="mkl-group" data-lens="' + esc(lens) + '"><h3 class="mkl-group__h">' + esc(lab) + ' <span class="mkl-group__n">(' + rows.length + ')</span></h3><span class="mkl-group__hint" hidden></span></li>' + rows.map(rowHTML).join('');
  }
  function render() {
    var n = items.length;
    countEl.textContent = n >= LIMIT ? '(' + n + ' / ' + LIMIT + ')' : '(' + n + ')';
    clearBtn.hidden = n === 0; if (n === 0) confirmEl.hidden = true;
    notice.hidden = storageOk;
    emptyEl.hidden = n > 0; listEl.hidden = n === 0; footEl.hidden = n === 0;
    var byLens = {}, order = [LENS]; items.forEach(function (it) { var l = it.lens || LENS; if (!byLens[l]) { byLens[l] = []; if (order.indexOf(l) < 0) order.push(l); } byLens[l].push(it); });
    var multi = order.filter(function (l) { return byLens[l]; }).length > 1;
    listEl.innerHTML = multi ? order.filter(function (l) { return byLens[l]; }).map(function (l) { return groupHTML(l, byLens[l]); }).join('') : items.map(rowHTML).join('');
    try { document.documentElement.style.setProperty('--mkl-foot-h', (footEl.hidden ? 0 : footEl.offsetHeight / 16) + 'rem'); } catch (e) {}
    var valid = {}; items.forEach(function (it) { valid[it.articleId || it.id] = 1; });
    cmpSel = cmpSel.filter(function (id) { return valid[id]; });
    syncCmp();
  }
  function lensOfCmp(id) { for (var i = 0; i < items.length; i++) if ((items[i].articleId || items[i].id) === id) return items[i].lens; return null; }
  function syncCmp() {
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
      hint.hidden = !other; if (other) hint.textContent = 'Vergleich nur innerhalb einer Kategorie — Ihre Auswahl läuft bei ' + (LENSES[lock] || LENSES[LENS]).label;
    });
    cta.textContent = n >= CMP_MIN ? n + ' ' + (LENSES[lock] || LENSES[LENS]).label + ' vergleichen' : 'Auswahl vergleichen (' + n + ')';
    cta.disabled = n < CMP_MIN;
    footHint.hidden = n >= CMP_MIN;
    if (n >= CMP_MIN && lock && lock !== LENS) footHint.hidden = false, footHint.textContent = 'Öffnet den Vergleich auf der Seite ' + (LENSES[lock] || LENSES[LENS]).label;
    else if (n < CMP_MIN) footHint.textContent = 'Wählen Sie mindestens 2 Modelle derselben Kategorie';
    try { document.documentElement.style.setProperty('--mkl-foot-h', (footEl.hidden ? 0 : footEl.offsetHeight / 16) + 'rem'); } catch (e) {}
  }

  /* ---- Handover to the compare flow (§3.5) ---- */
  function startCompare() {
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
  var pdpRow, pdpBtn, pdpBar, pdpNote, pdpChanged, pdpBand, pdpLast = null, pdpBarVisible = null, bandCfgId = null;
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
      configSummary: pdpSummary(sn), configTotal: sn.total, configQty: sn.mainQty || 1, configState: sn, configHash: cfgHash(sn), configComplete: !!sn.complete, configExpired: false };
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
    return '<button class="mkl-pdp-save' + (extra || '') + '" type="button" aria-pressed="false"><span class="mkl-pdp-save__glyph" aria-hidden="true">' + HEART + '</span><span class="mkl-pdp-save__label' + (iconOnly ? ' mkl-pdp-sr' : '') + '">Merken</span></button>';
  }
  function pressPdp(btn) {
    pdpLast = btn;
    if (!reduced()) { btn.classList.add('is-pressed'); setTimeout(function () { btn.classList.remove('is-pressed'); }, 120); }
    var st = pdpState();
    if (!st.s1) { if (st.on) removeItem(PDP.id); else addItem(PDP.id, null); return; }
    if (st.on) { removeItem(st.hit.id); return; }
    if (st.changed) updateConfig(st.sessId, st.sn); else addConfig(st.sn);
  }
  function addConfig(sn) {
    if (isFull()) { var m = 'Ihre Merkliste ist voll (' + LIMIT + ') — bitte zuerst einen Artikel entfernen'; toast(m, 'limit', { label: 'Zur Merkliste', fn: openDrawer }); live(m); return; }
    var it = cfgItemFor(sn), cid = 'c-' + (sn.article || 'x') + '-' + Math.random().toString(36).slice(2, 8);
    it.id = 'cfg:' + cid; it.configId = cid; it.url = 'pdp/index.html?merkliste=' + cid; it.addedAt = new Date().toISOString(); it.priceAtAdd = sn.total;
    var mi = indexOf(PDP.id); if (mi > -1) items.splice(mi + 1, 0, it); else items.push(it);   /* the build sits right behind its model row */
    setCfgOfSession(sn.article, cid);
    save(); syncAll(); pulseBadge();
    live('Konfiguration gemerkt: ' + shortName(it).main + ', ' + (sn.finishText || '') + ', Gesamt ' + euro(sn.total) + '. Merkliste: ' + items.length + ' Artikel');
    toast('Konfiguration gemerkt' + (storageOk ? '' : ' — nur in dieser Sitzung'), 'ok', { label: 'Zur Merkliste', fn: openDrawer });
  }
  function updateConfig(cid, sn) {
    var it = byId('cfg:' + cid); if (!it) { addConfig(sn); return; }
    var fresh = cfgItemFor(sn);
    ['variantArticleNo', 'img', 'configSummary', 'configTotal', 'configQty', 'configState', 'configHash', 'configComplete'].forEach(function (k) { it[k] = fresh[k]; });
    it.updatedAt = new Date().toISOString(); it.configExpired = false;
    save(); syncAll();   /* no badge pulse: the count is unchanged */
    live('Konfiguration aktualisiert: ' + shortName(it).main + ', ' + (sn.finishText || '') + ', Gesamt ' + euro(sn.total));
    toast('Konfiguration aktualisiert' + (storageOk ? '' : ' — nur in dieser Sitzung'), 'ok', { label: 'Zur Merkliste', fn: openDrawer });
  }
  function syncPdpMarks() {
    if (!PDP || !pdpBtn || !window.MTZ_PDP) return;
    var st = pdpState(), nm = shortName({ name: PDP.name, lens: LENS }).main, colour = st.sn.finishText || '';
    var label = st.s1 ? (st.on ? 'Konfiguration gemerkt' : 'Konfiguration merken') : (st.on ? 'Gemerkt' : 'Merken');
    var aria = st.s1 ? (st.on ? 'Konfiguration aus der Merkliste entfernen: ' + nm + ', ' + colour : 'Konfiguration merken: ' + nm + ', ' + colour) : (st.on ? nm + ' aus der Merkliste entfernen' : nm + ' merken');
    var title = st.on ? (st.s1 ? 'Konfiguration gemerkt — aus der Merkliste entfernen' : 'Gemerkt — aus der Merkliste entfernen') : (st.s1 ? 'Konfiguration merken' : 'Merken');
    var lim = !st.on && !st.changed && isFull();
    [pdpBtn, pdpBar].forEach(function (b) {
      if (!b) return;
      b.classList.toggle('is-on', st.on); b.setAttribute('aria-pressed', st.on ? 'true' : 'false'); b.setAttribute('aria-label', aria); b.setAttribute('title', title);
      b.querySelector('.mkl-pdp-save__label').textContent = label;
      b.classList.toggle('is-limit', lim); if (lim) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    });
    pdpNote.hidden = !st.on; pdpNote.firstChild.nodeValue = (st.s1 ? 'Konfiguration gemerkt' : 'Gemerkt') + ' · ';
    pdpChanged.hidden = !st.changed;
    if (pdpBand && !(st.on && st.hit && st.hit.configId === bandCfgId)) removeBand();   /* the band describes the restored build; the first change turns it into the caption */
  }
  function hintSwatches() { var sw = document.getElementById('pdpSwatches'); if (!sw) return; sw.classList.add('mkl-pdp-hint'); setTimeout(function () { sw.classList.remove('mkl-pdp-hint'); }, 1400); }
  function removeBand() { if (!pdpBand) return; var b = pdpBand; pdpBand = null; bandCfgId = null; if (reduced()) { b.remove(); } else { b.classList.add('is-leaving'); setTimeout(function () { b.remove(); }, 160); } }
  function resetConfig() { removeBand(); window.MTZ_PDP.reset(); var sw = document.getElementById('pdpSwatches'); if (sw) sw.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }); hintSwatches(); syncPdpMarks(); if (pdpBtn) pdpBtn.focus({ preventScroll: true }); }
  /* arrival via ?merkliste=<configId> or "Konfiguration öffnen" in the drawer on this page */
  function arrive(cid) {
    try { var q = location.search.replace(/([?&])merkliste=[^&#]*(&|$)/, function (m0, a, b) { return b ? a : ''; }).replace(/[?&]$/, ''); history.replaceState(null, '', location.pathname + q + location.hash); } catch (e) {}
    var it = byId('cfg:' + cid);
    if (!it || !it.configState) { setTimeout(function () { toast('Diese Konfiguration ist auf diesem Gerät nicht gespeichert', 'info', { label: 'Zur Merkliste', fn: openDrawer }); }, 300); return; }
    removeBand();
    var missing = window.MTZ_PDP.restore(it.configState) || [];
    var sn = pdpSnap(), colourGone = !!it.configState.article && sn.article !== it.configState.article;
    if (colourGone) { it.configExpired = true; save(); } else { setCfgOfSession(sn.article, cid); it.configExpired = false; }
    var lines = (it.configSummary || []).slice(0, 3).map(function (l) { return esc(l.label) + ': ' + esc(l.value); }), more = (it.configSummary || []).length - lines.length;
    var notes = [];
    if (colourGone) notes.push('Diese Farbe ist nicht mehr verfügbar — bitte wählen Sie eine Farbe.');
    if (missing.length) notes.push('Nicht mehr verfügbar: ' + esc(missing.join(', ')) + ' — bitte neu wählen');
    var open = colourGone ? null : window.MTZ_PDP.firstOpen(); if (open) notes.push('Noch offen: ' + esc(open));
    if (!colourGone && typeof it.configTotal === 'number' && Math.abs(sn.total - it.configTotal) > 0.004) notes.push('Preis aktualisiert: ' + euro(it.configTotal) + ' → ' + euro(sn.total));
    var title = colourGone ? 'Konfiguration abgelaufen — Zusammenfassung siehe Merkliste' : 'Gespeicherte Konfiguration vom ' + fmtDate(it.updatedAt || it.addedAt);
    pdpBand = h('<div class="mkl-pdp-band" id="mklPdpBand" role="status" tabindex="-1">' +
      '<span class="mkl-pdp-band__glyph" aria-hidden="true">' + HEART + '</span>' +
      '<div class="mkl-pdp-band__text"><span class="mkl-pdp-band__title">' + title + '</span>' +
        '<span class="mkl-pdp-band__sub"><b>Gesamt ' + euro(it.configTotal) + '</b>' + (lines.length ? ' · ' + lines.join(' · ') : '') + (more > 0 ? ' · + ' + more + ' weitere' : '') + '</span>' +
        (notes.length ? '<span class="mkl-pdp-band__sub">' + notes.join(' · ') + '</span>' : '') + '</div>' +
      '<button class="mkl-pdp-band__act" type="button" data-mkl="reconfigure">' + (colourGone ? 'Farbe wählen' : 'Neu konfigurieren') + '</button>' +
      '<button class="mkl-pdp-band__x" type="button" aria-label="Hinweis schließen">' + IC_X + '</button></div>');
    bandCfgId = colourGone ? null : cid;
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
    pdpRow = h('<div class="mkl-pdp-row" id="mklPdpRow">' + pdpBtnHTML('', false) +
      '<p class="mkl-pdp-note" id="mklPdpNote" hidden>Gemerkt · <a href="#merkliste">Zur Merkliste</a></p>' +
      '<p class="mkl-pdp-changed" id="mklPdpChanged" hidden>Geändert seit dem Merken — erneut merken, um zu aktualisieren</p></div>');
    buy.insertAdjacentElement('afterend', pdpRow);
    pdpBtn = pdpRow.querySelector('.mkl-pdp-save'); pdpNote = pdpRow.querySelector('.mkl-pdp-note'); pdpChanged = pdpRow.querySelector('.mkl-pdp-changed');
    pdpBtn.addEventListener('click', function () { pressPdp(pdpBtn); });
    pdpNote.querySelector('a').addEventListener('click', function (e) { e.preventDefault(); openDrawer(); });
    var details = document.getElementById('bStickyDetails');
    if (details) { pdpBar = h(pdpBtnHTML(' mkl-pdp-save--icon mkl-pdp-bar', true)); details.insertAdjacentElement('beforebegin', pdpBar); pdpBar.addEventListener('click', function () { pressPdp(pdpBar); }); }
    var bar = document.getElementById('pdpStickyBar');
    if (bar) {
      pdpBarVisible = function () { return bar.classList.contains('is-visible') && !document.body.classList.contains('cfg-sheet-open'); };
      var updBar = function () { document.documentElement.style.setProperty('--mkl-pdp-bar-h', (bar.offsetHeight / 16) + 'rem'); if (toastEl.classList.contains('show') && !isOpen) toastEl.classList.toggle('is-pdp-bar', pdpBarVisible()); };
      if (window.MutationObserver) new MutationObserver(updBar).observe(bar, { attributes: true, attributeFilter: ['class'] });
      updBar();
    }
    document.addEventListener('mtz:pdp-change', syncPdpMarks);
    var m = /[?&]merkliste=([^&#]+)/.exec(QS), cid = m && decodeURIComponent(m[1]);
    syncPdpMarks();
    if (cid && cid !== 'demo') setTimeout(function () { arrive(cid); }, 50);
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
    indexProducts(); load(); buildChrome();
    var grid = document.getElementById('productGrid');
    if (grid) { scanCards(); new MutationObserver(scanCards).observe(grid, { childList: true }); }
    /* compare overlay: decorate every product column with a bookmark whenever it (re)renders */
    var tries = 0; (function watchOverlay() {
      var body = document.querySelector('[data-vgl="body"]');
      if (!body) { if (tries++ < 40) setTimeout(watchOverlay, 50); return; }
      injectOverlayHearts();
      new MutationObserver(injectOverlayHearts).observe(body, { childList: true, subtree: true });
    })();
    /* cross-tab: another tab changed the list */
    window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); syncAll(); live('Merkliste in einem anderen Tab geändert: ' + items.length + ' Artikel'); } });
    if (/[?&]merkliste=demo\b/.test(QS)) seedDemoConfig();
    syncAll();
    if (PDP) initPdp();
    /* arrived from the other PLP's Merkliste with ?vergleich=…&von=merkliste */
    var m = /[?&]vergleich=([^&#]+)/.exec(QS);
    if (m && /[?&]von=merkliste\b/.test(QS)) { var n = decodeURIComponent(m[1]).split(',').filter(function (id) { return BY_ID[id]; }).length; if (n >= CMP_MIN) setTimeout(function () { toast('Vergleich mit ' + n + ' Modellen aus Ihrer Merkliste', 'ok'); }, 300); }
  }
  window.MTZ_MKL = { open: function () { openDrawer(); }, close: closeDrawer, items: function () { return items.slice(); }, has: has, seedDemoConfig: seedDemoConfig, reload: function () { load(); syncAll(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
