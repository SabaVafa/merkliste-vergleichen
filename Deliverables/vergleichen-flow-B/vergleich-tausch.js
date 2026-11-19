/* =====================================================================
   METZLER · Vergleich voll → „Welches Modell soll Platz machen?“ (19.11.2026)
   One swap picker for every place where a 4th model meets a full comparison: product cards, „Ähnliche Modelle“,
   the Merkliste (category page and product page), „Aus der Merkliste“ and a handover from the Merkliste.
   UX decision (09 §76): the visitor chooses which model makes room – nothing is replaced silently; the caller swaps
   on „Ersetzen“ and offers „Rückgängig“ in its own toast.

   Pure UI, no data: callers pass the models and get the chosen id back.
     MTZ_SWAP.ask({
       newName: 'VDM10 2.0 Colson',                       // the model that wants in
       models: [{ id, name, img, price }],                // the models in the comparison (max 3)
       anchor: element,                                   // focus returns here on cancel
       within: element,                                   // optional: rise inside this panel (the Merkliste drawer)
       intro: 'optional sentence that replaces the default question',
       onPick: function (id) {}, onCancel: function () {}
     })
   Inside the Merkliste drawer a sheet that rises from below at the drawer's width (user: "it must be bottom up window
   and not a pop up"); elsewhere a centred dialog from 48rem (user: "it must be a normal popup when the side bookmark is
   not open"); on phones always the bottom sheet. Modal dialog: focus on the first „Ersetzen“, Tab stays inside, Escape / „Abbrechen“ / the scrim cancel.
   ===================================================================== */
(function () {
  'use strict';
  var open = null;
  var MAX = 3;
  var IC_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function euro(n) { return typeof n === 'number' ? 'ab ' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace(/\.(\d{2})$/, ',$1') + ' €' : ''; }
  function remPx() { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function close(picked) {
    if (!open) return;
    var o = open; open = null;
    o.el.remove(); o.scrim.remove();
    if (picked != null) { if (typeof o.opts.onPick === 'function') o.opts.onPick(picked); return; }
    if (o.opts.anchor && document.contains(o.opts.anchor)) try { o.opts.anchor.focus({ preventScroll: true }); } catch (e) {}
    if (typeof o.opts.onCancel === 'function') o.opts.onCancel();
  }
  /* inside a panel (Merkliste drawer): the sheet and its scrim take the panel's left edge and width */
  function fit(el, scrim, within) {
    if (!within || !document.contains(within)) return;
    /* layout box, not the painted one: the drawer may still be sliding in (transform) when the sheet opens */
    var rp = remPx(), left = within.offsetLeft, w = within.offsetWidth;
    [el, scrim].forEach(function (x) { x.style.left = (left / rp) + 'rem'; x.style.width = (w / rp) + 'rem'; x.style.right = 'auto'; });
  }
  function ask(opts) {
    close();
    opts = opts || {};
    var models = (opts.models || []).slice(0, MAX), nm = esc(opts.newName || 'das neue Modell');
    var scrim = document.createElement('div'); scrim.className = 'vgl-swap__scrim' + (opts.within ? ' is-within' : ''); scrim.setAttribute('aria-hidden', 'true');
    var el = document.createElement('div');
    el.className = 'vgl-swap' + (opts.within ? ' is-within' : '');
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'vglSwapT'); el.setAttribute('aria-describedby', 'vglSwapD');
    el.innerHTML =
      '<div class="vgl-swap__head"><h2 class="vgl-swap__t" id="vglSwapT">Ihr Vergleich ist voll</h2>' +
        '<button class="vgl-swap__x" type="button" data-swap="cancel" aria-label="Schließen, nichts ersetzen">' + IC_X + '</button></div>' +
      '<p class="vgl-swap__d" id="vglSwapD">' + (opts.intro ? esc(opts.intro) : 'Sie vergleichen bereits ' + MAX + ' Modelle – mehr sind nicht möglich. Um dieses Modell aufzunehmen, ersetzen Sie eines davon:'   /* no product name in the text (19.11., user) – the buttons' names keep it */) + '</p>' +
      '<ul class="vgl-swap__list" role="list">' + models.map(function (m) {
        return '<li class="vgl-swap__row"><span class="vgl-swap__img">' + (m.img ? '<img src="' + esc(m.img) + '" alt="" loading="lazy">' : '') + '</span>' +
          '<span class="vgl-swap__txt"><span class="vgl-swap__n">' + esc(m.name || m.id) + '</span>' + (euro(m.price) ? '<span class="vgl-swap__p">' + euro(m.price) + '</span>' : '') + '</span>' +
          '<button class="vgl-swap__btn" type="button" data-swap-id="' + esc(m.id) + '" aria-label="' + esc(m.name || m.id) + ' durch ' + nm + ' ersetzen">Ersetzen</button></li>';
      }).join('') + '</ul>' +
      '<div class="vgl-swap__foot"><button class="vgl-swap__cancel" type="button" data-swap="cancel">Abbrechen</button></div>';
    document.body.appendChild(scrim); document.body.appendChild(el);
    open = { el: el, scrim: scrim, opts: opts };
    fit(el, scrim, opts.within);
    if (reduced()) el.classList.add('no-motion');
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-swap-id]'); if (b) { close(b.getAttribute('data-swap-id')); return; }
      if (e.target.closest('[data-swap="cancel"]')) close();
    });
    scrim.addEventListener('click', function () { close(); });
    /* its own keyboard: Escape cancels only the picker (not the drawer or the comparison beneath), Tab stays inside */
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      e.stopPropagation();
      var f = el.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    var go = el.querySelector('.vgl-swap__btn') || el.querySelector('.vgl-swap__cancel');
    setTimeout(function () { if (open && open.el === el) go.focus({ preventScroll: true }); }, 30);
    window.addEventListener('resize', onResize);
  }
  function onResize() { if (!open) { window.removeEventListener('resize', onResize); return; } fit(open.el, open.scrim, open.opts.within); }
  window.MTZ_SWAP = { ask: ask, close: function () { close(); }, isOpen: function () { return !!open; } };
})();
