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
    return { id: String(p.id), articleId: String(p.id), lens: LENS, name: p.name, url: '#', img: imgOf(p, cardEl), priceFrom: (typeof p.price === 'number' ? p.price : null), uvp: (typeof p.uvp === 'number' ? p.uvp : null), konfig: konfigOf(p), addedAt: new Date().toISOString(), priceAtAdd: (typeof p.price === 'number' ? p.price : null) };
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
        '<div class="mkl-empty" hidden>' + HEART + '<h3 class="mkl-empty__title">Ihre Merkliste ist leer</h3><p class="mkl-empty__body">Merken Sie Modelle mit dem Lesezeichen-Symbol — sie bleiben auf diesem Gerät gespeichert.</p><button class="btn btn--secondary" type="button" data-mkl="back">Zurück zu ' + esc(LENSES[LENS].label) + '</button></div>' +
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
      if (go) { e.preventDefault(); closeDrawer(); toast(/Konfiguration öffnen/.test(go.textContent) ? 'Gespeicherte Konfiguration öffnen (Prototyp)' : ('Weiter zur ' + (/Konfigurieren/.test(go.textContent) ? 'Konfiguration' : 'Produktseite') + ' — dort Farbe, Namensschild & Gravur wählen (Prototyp)'), 'info'); return; }
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
    toastEl.className = 'mkl-toast t-' + type + (isOpen ? ' is-drawer' : (document.querySelector('.vgl-view.is-open') ? ' is-view' : (document.querySelector('.vgl-tray.is-open') ? ' is-raised' : '')));
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
  function syncAll() { syncHearts(); syncHeader(); if (isOpen) render(); }

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
    if (!silent) toast('Aus der Merkliste entfernt', 'ok', { label: 'Rückgängig', fn: function () { restore([{ item: it, index: i }]); } });
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
    var price = (cfg && typeof it.configTotal === 'number') ? 'Gesamt ' + euro(it.configTotal) : (typeof it.priceFrom === 'number' ? 'ab ' + euro(it.priceFrom) : '');
    var uvp = (!cfg && typeof it.uvp === 'number' && it.uvp > (it.priceFrom || 0)) ? '<span class="mkl-item__uvp">UVP ' + euro(it.uvp) + '</span>' : '';
    var ctaTxt = cfg ? 'Konfiguration öffnen' : (it.konfig ? 'Konfigurieren' : 'Zum Produkt');
    var ctaHref = cfg ? '#konfigurator?configId=' + encodeURIComponent(it.configId) : (it.konfig ? '#konfigurator' : (it.url && it.url !== '#' ? it.url : '#produkt'));
    var cfgHtml = '';
    if (cfg) {
      var lines = (it.configSummary || []).slice(0, 3).map(function (l) { return esc(l.label) + ': ' + esc(l.value); });
      cfgHtml = (lines.length ? '<p class="mkl-item__cfg">' + lines.join(' · ') + '</p>' : '') +
        (it.configExpired ? '<p class="mkl-item__expired">Konfiguration abgelaufen — Details siehe Zusammenfassung</p>' : '');
    }
    var avail = it.availability ? '<span class="mkl-item__avail">' + esc(it.availability) + '</span>' : '';
    return '<li><article class="mkl-item' + (cfg ? ' mkl-item--cfg' : '') + '" data-id="' + esc(it.id) + '" data-lens="' + esc(it.lens) + '">' +
      '<div class="mkl-item__media"><img src="' + esc(it.img) + '" alt=""></div>' +
      '<div class="mkl-item__text">' +
        (cfg ? '<span class="mkl-item__tag">Ihre Konfiguration' + (it.addedAt ? ' · ' + esc(fmtDate(it.addedAt)) : '') + '</span>' : '') +
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
      location.href = page + '?vergleich=' + encodeURIComponent(ids.join(',')) + '&von=merkliste';
    }
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
    /* arrived from the other PLP's Merkliste with ?vergleich=…&von=merkliste */
    var m = /[?&]vergleich=([^&#]+)/.exec(QS);
    if (m && /[?&]von=merkliste\b/.test(QS)) { var n = decodeURIComponent(m[1]).split(',').filter(function (id) { return BY_ID[id]; }).length; if (n >= CMP_MIN) setTimeout(function () { toast('Vergleich mit ' + n + ' Modellen aus Ihrer Merkliste', 'ok'); }, 300); }
  }
  window.MTZ_MKL = { open: function () { openDrawer(); }, close: closeDrawer, items: function () { return items.slice(); }, has: has, seedDemoConfig: seedDemoConfig };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
