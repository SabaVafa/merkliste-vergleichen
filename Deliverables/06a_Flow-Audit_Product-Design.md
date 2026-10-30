# 06a — Flow-Audit Version B · Product Design (Visual / Interface)

Date: 2026-10-30 · Scope: `Deliverables/vergleichen-flow-B/` (index.html + briefkasten.html, vergleichen.js/css, merkliste.js/css over the fixed PLP base plp.js/plp.css + Home/styles-v2.css) · Role: Lead Product Design
Method: full walk of the live prototype at 1440 × 900 and 375 × 812 (bookmark → badge → drawer → Vergleichen checkboxes → Auswahl vergleichen → Entfernen/Undo → Alle entfernen → compare mode 2/3/4 → overlay incl. Nur Unterschiede, chips, (i), Modell hinzufügen, Details, Gemeinsamkeiten → twin `?vergleich=ebenhard,ebenhard-v2a` → guard `?vergleich=vossberg,ebenhard` → `?merkliste=demo` → empty state), measurements via `getComputedStyle` / `getBoundingClientRect`, plus a read of all four add-on files against the DS tokens in `Home/styles-v2.css`.
Standing client decisions (hidden card checkboxes until "Vergleichen", `--teal-100` compare button, white product images, advisor above the grid, centred CTA labels, 3-line titles, aligned cards, bare bookmark glyph, no "Version B" badge, fixed-height sticky compare header) are respected throughout — every recommendation below works inside them.

---

## 1 · Summary

**Verdict:** The flow is complete, the information design (summary strip, "Auf einen Blick", twin state, guards, model-first naming) is ahead of Miele/Bosch and on par with Apple's compare — but the *rendering* currently undersells it: a single CSS defect (invalid `font:` shorthands) drops the whole button/chip/link scale to 16 px regular, the sticky product header takes 46–54 % of the viewport, and the mobile tray overflows. Fixing the top ten below makes the surface read as one premium component family instead of a feature-rich add-on.

**The three biggest wins**
1. **PD-01 — Restore the typography scale.** 17 declarations of the form `font:600 .875rem/1 inherit` are invalid CSS (a CSS-wide keyword cannot sit inside a shorthand) and are silently dropped; every `.vgl-bar-btn`, `.vgl-tray__cta`, `.vgl-chip`, `.vgl-link`, `.mkl-cta`, `.mkl-link`, `.mkl-btn`, `.mkl-toast__act`, `.vgl-more`, `.vgl-coach__*` renders at 16 px / 400. One search-and-replace restores 14 px / 600 everywhere.
2. **PD-02 — Move "Auf einen Blick" out of the sticky header into the first table row group.** The header stays fixed-height (client decision) but drops from 414–489 px to ≈ 290 px on desktop and from 403 px to ≈ 300 px on mobile, so the first spec rows and the twin guidance come above the fold.
3. **PD-03 / PD-07 — Fix the two mobile breakages:** the compare tray's CTA is cut off at 375 px and the thumbnails are covered; the Merkliste toast lands beside the desktop drawer and on top of the mobile footer CTA.

---

## 2 · Was bleibt (do not touch)

- Bare teal bookmark glyph top-right of `.pcard__media`, 2.75 rem hit area, `aria-pressed`, filled when gemerkt; header control between Konto and Warenkorb with teal badge; badge pulse 180 ms, none under reduced motion.
- Drawer anatomy: 28 rem right panel / full-screen mobile, title + count, inline "Alle entfernen" confirm, undo toasts (5 s, pause on hover), model-first row naming, one CTA per row ("Konfigurieren" / "Zum Produkt" only), "Auswahl vergleichen (n)" handing over to the existing compare flow, lens guard copy, 50-item limit, empty state copy and secondary button, live region, focus trap, Escape semantics, `localStorage` notice.
- Compare mode gating, `.pcard.is-vgl` teal outline, tray "Vergleich (n) / max. 4" with ready / limit hints, `--teal-100` ready state that fills to solid teal on hover.
- Overlay: single scroll container, frozen row-label column, summary strip verdict + jump chips + flash, group bands in `--teal-100` with uppercase teal label, neutral price delta (no "Bestwert" on price), green "Bestwert" only on capability rows, difference tint only in the full view, "Nur Unterschiede (n)" auto-on ≥ 60 %, (i) hints, Gemeinsamkeiten as label → value pairs, twin state with "Was der Aufpreis bringt" + "Alternativen mit echtem Unterschied", set-valued cells with "zusätzlich / ohne", Kombi-Set warning suppressing the delta, hero 170 / 220 px in the Briefkästen lens, print stylesheet, `?vergleich=` deep link.
- Colour discipline: teal as the only "selected / active" ink, red reserved for remove-hover and the destructive confirm, green only for "Ja" / Bestwert.

---

## 3 · Findings (ordered by impact)

Legend — Effort S ≤ ½ day · M ≤ 2 days · L > 2 days. **Umsetzen jetzt** = top 10.

### PD-01 · Invalid `font:` shorthands collapse the control typography — **Umsetzen jetzt** · S
- **Screen/State:** every state of the toolbar button, tray, chips, links, drawer footer, confirm, toast action, coach.
- **Problem:** "Vergleichen" (toolbar), "Vergleichen" (tray), "Auswahl vergleichen (2)", "Alle entfernen", "Drucken", "Zurücksetzen", jump chips, "Ja, entfernen", "Rückgängig", "Alle technischen Details anzeigen", "Modell hinzufügen"'s neighbours all render in **16 px / regular** — the same weight as body copy. The ready-state compare button therefore reads as a light pill with thin text; chips are 28 px tall with 16 px text; "Nur Unterschiede" (14 px / 600, styled via `font-weight`) sits next to "Drucken" (16 px / 400) in one bar.
- **Evidence:** `getComputedStyle(.vgl-bar-btn)` → `16px/24px`, weight 400; `.vgl-chip` → 16 px / 400; `.mkl-cta` → 16 px / 400; `.mkl-btn` → 14 px / 400; `.mkl-toast__act` → weight 500. `CSSStyleRule.style.font` for `.vgl-chip` and `.mkl-link` is empty — the parser dropped the declaration. Source: `vergleichen.css` 13 occurrences (`font:600 var(--text-body-sm,.875rem)/1 inherit`, `font:500 .8125rem/1 inherit`, `font:700 .75rem/1 inherit`, `font:400 .8125rem/1.45 inherit` …), `merkliste.css` 4 occurrences.
- **Recommendation:** replace each with longhands: `font-family:inherit; font-size:var(--text-body-sm); font-weight:600; line-height:1;` (chips/links: `font-size:.8125rem; font-weight:600`; coach step / Bestwert: `font-size:var(--text-caption); font-weight:700`). Keep `font:inherit` alone (that one is valid). Re-measure: toolbar + tray + drawer CTAs must all read 14 px / 600, chips 13 px / 600, links 13 px / 500.
- **Effort:** S.

### PD-02 · Sticky product header occupies 46–54 % of the viewport — **Umsetzen jetzt** · M
- **Screen/State:** overlay, all sets; worst in the twin state and with 4 models.
- **Problem:** With the header pinned at a fixed height (client decision, kept), only 324–430 px remain for the rows; on mobile the first spec row starts at y = 736 of 812, i.e. **below the fold on open**; in the twin state the whole "Was der Aufpreis bringt" block starts at y = 908 of 900 — invisible without scrolling, although it is the point of that state.
- **Evidence:** `thead` height 414 px (2 models, Sprechanlagen), 447 px (4 models), 477 px (Vossberg vs Ebenhard), 489 px (twin, hero 220 px); mobile 403 px. Drivers: `.vgl-ph__media` 124–220 px + 12 px margin, name 2.6 em, `.vgl-ph__sub`, price + `<small>&nbsp;</small>` placeholder, `.vgl-ph__hl` (3 bullets, up to 2 lines each) and `padding-bottom:74px` for the pinned CTA.
- **Recommendation (keeps the fixed-height rule):** render "Auf einen Blick" as the **first tbody row group** (`tr.vgl-group` "Auf einen Blick" + one `tr[data-key="hl"]` whose cells hold the bullet lists), not inside `th.vgl-ph`. The sticky header then holds media · name · qualifier · price · CTA only (≈ 290 px desktop / ≈ 300 px mobile) and the highlights still open the table. Also: drop the `<small>&nbsp;</small>` placeholder when there is no UVP (`.vgl-ph__price small{min-height:0}`), reduce `.vgl-ph__media{margin-bottom:.5rem}` and `.vgl-ph__price{margin-bottom:.375rem}`. In the twin state render `.vgl-twin` **above** `.vgl-wrap` (order: `vgl-sum` → `vgl-twin` → `vgl-wrap` → `vgl-aftertable`) since the 3-row diff table is short anyway.
- **Effort:** M.

### PD-03 · Mobile compare tray overflows: CTA cut off, thumbnails covered — **Umsetzen jetzt** · S
- **Screen/State:** PLP compare mode at 375 px with ≥ 2 models.
- **Problem:** The tray row cannot fit label + slots + "Zurücksetzen" + "Vergleichen"; the CTA is clipped at the right edge and the slot thumbnails sit underneath the actions, so the customer sees "Vergleich (3) / max. 4 · Zurücksetzen · Vergleic".
- **Evidence:** `.vgl-tray__cta` rect x 300–424 at `innerWidth` 375; slots at x 162–310 overlapped by `.vgl-tray__actions` x 180–424; hint already `display:none`.
- **Recommendation:** `@media(max-width:47.99rem){.vgl-tray__inner{flex-wrap:wrap;gap:.5rem .75rem;padding:.625rem 1rem}.vgl-tray__status{flex:1 1 auto}.vgl-tray__slots{order:3;flex:1 1 100%}.vgl-tray__actions{flex:0 0 auto}.vgl-tray__cta{height:2.75rem;padding:0 1rem}}` and shorten "Zurücksetzen" to an icon-only `.vgl-link` with `aria-label` below 24 rem. Body padding-bottom becomes the measured tray height (JS reads `tray.offsetHeight`) instead of the hard-coded 88 px.
- **Effort:** S.

### PD-04 · (i) tooltip is cut to one line by the next row-label cell — **Umsetzen jetzt** · S
- **Screen/State:** overlay, hover/focus on any `.vgl-i`.
- **Problem:** Only the first line of the hint is visible ("Grundpreis der Standardausführung." — the second sentence never appears). Keyboard users get the same truncated tip.
- **Evidence:** `.vgl-i::after` lives inside `th.rh{position:sticky;z-index:2;background:#fff}`; the following row's `.rh` has the same z-index and paints later, covering the overflow. Tooltip rect 17 rem wide, visible height = row height (51 px).
- **Recommendation:** raise the owning cell while active: `table.vgl-t tbody tr:hover>.rh, table.vgl-t tbody .rh:focus-within{z-index:5}`. Longer term, render one body-level tooltip element positioned from the trigger (`position:fixed`) so it also escapes the frozen column on mobile (`.vgl-i::after{width:14rem}` currently overlaps the scrolling values).
- **Effort:** S.

### PD-05 · Twin state loses its three signals — **Umsetzen jetzt** · M
- **Screen/State:** `briefkasten.html?vergleich=ebenhard,ebenhard-v2a` (and Colson vs Neo).
- **Problem:** (a) Both header cells read **"Ebenhard"** in bold; the only distinguishing fact ("gebürstete V2A-Edelstahl-Front") is a 12 px muted qualifier. (b) "**7 Farben**" is listed as a highlight in *both* columns although the count is identical — the swatch rule always emits a highlight. (c) The value statement says "+ 29,01 € für **Ebenhard** — dafür: …" which is ambiguous when both are Ebenhard. (d) The guidance block is below the fold (see PD-02).
- **Evidence:** `.vgl-ph__name` = "Ebenhard" × 2; `.vgl-ph__hl` = ["7 Farben", "Namensschild-Material …"] in both; `highlights()` branch `row.swatches` pushes `n + ' Farben'` unconditionally; `valueStatement()` uses `p.design`.
- **Recommendation:** when `shortName().main` collides inside the set, promote the first differing title segment into the name line: "Ebenhard **· V2A-Edelstahl-Front**" (`.vgl-ph__name` keeps 2-line clamp; the differentiator in `--teal`, weight 600). In `highlights()` only emit the colour highlight when the counts differ or the set has unique colours (`setDiff().extra.length`), and phrase it "+ 2 Farben (Eisenglimmer, Wunschfarbe)" rather than a bare count. In `valueStatement()` use the same disambiguated label. Same fix removes "2 Farben" being crowned as a highlight on the *weaker* Vossberg column.
- **Effort:** M.

### PD-06 · Model identity buried for titles that end with the model — **Umsetzen jetzt** · S
- **Screen/State:** drawer rows, overlay header, chips ("Design-Linie: SDM10X"), tray `alt`.
- **Problem:** "Türsprechanlage mit Kamera" is shown as the model line while the real model name **SDM10X** sits at the end of a 12 px qualifier ("Gesichtserkennung · Touch-Display · Live-HD-Video · Ein- & Mehrfamilien · SDM10X") — truncated with an ellipsis in the overlay, so the customer compares "Türsprechanlage mit Kamera" against "VDM10 2.0 Video-Türsprechanlage".
- **Evidence:** `shortName()` in both add-ons takes `parts[0]` for the Sprechanlagen lens; JTL title of `sdm10x` = "Türsprechanlage mit Kamera | Gesichtserkennung | … | SDM10X".
- **Recommendation:** in `shortName()` pick the first segment matching `/^[A-Z]{2,4}\d{2}[A-Z0-9.\s]*$/` (XDM10, VDM10 2.0, SDM10X, ADM10) as `main`, prepend the product type from the generic segment as a muted prefix if needed; fall back to `parts[0]`. On JTL this should be a real `model` Merkmal (01 §3.4). Also widen `.vgl-ph__sub` to 2 lines (`white-space:normal; -webkit-line-clamp:2`) instead of a single ellipsised line.
- **Effort:** S (prototype) / M (JTL data).

### PD-07 · Merkliste toasts land beside the drawer (desktop) and on the footer CTA (mobile) — **Umsetzen jetzt** · S
- **Screen/State:** drawer open → Entfernen / Alle entfernen / Merken from inside the overlay.
- **Problem:** Desktop: "Aus der Merkliste entfernt · Rückgängig" appears bottom-centre of the page (x 560–880) — in the dimmed area left of the 448 px drawer, outside the customer's focus; the undo affordance is easy to miss. Mobile: the toast (bottom 5.75 rem) covers the footer hint and the top edge of "Auswahl vergleichen".
- **Evidence:** `.mkl-toast{left:50%}`; `.mkl-toast.is-drawer{bottom:5.75rem}`; drawer x = 992–1440; mobile `.mkl-foot` height 93 px, toast y = 753.
- **Recommendation:** anchor the toast to the drawer when it is open: `.mkl-toast.is-drawer{left:auto;right:1rem;transform:none;bottom:calc(var(--mkl-foot-h,4.375rem) + .75rem)}` with `--mkl-foot-h` written by JS from `foot.offsetHeight` (+ `env(safe-area-inset-bottom)`); `@media(min-width:48rem){.mkl-toast.is-drawer{width:calc(28rem - 2rem);max-width:none}}`. Keep the page-level position for toasts without a drawer.
- **Effort:** S.

### PD-08 · "Auf einen Blick" key + value are glued into one unbreakable word — **Umsetzen jetzt** · S
- **Screen/State:** overlay on mobile (10.5 rem columns), also 4-model desktop.
- **Problem:** Bullets are hard-clipped mid-word: "Namensschild: Austau", "Schutzart: witterungs", "Geeignet für: Skalie".
- **Evidence:** markup `<span class="vgl-hl__k">Namensschild</span>Austauschbar` with the colon from `::after` and `margin-right:4px` — no whitespace, no break opportunity; `li.scrollWidth` 190 > `clientWidth` 144 with `overflow:hidden`.
- **Recommendation:** emit a real space after the key in `renderView()` (`…</span> '+esc(c.t)`), set `.vgl-hl__k::after{content:': '}`, drop the margin, add `.vgl-ph__hl li{overflow-wrap:anywhere}`. Cap the bullets to 2 on `max-width:47.99rem` (`li:nth-child(n+3){display:none}`) once PD-02 moves them into a row (then no cap needed).
- **Effort:** S.

### PD-09 · Focus rings missing or browser-default on the compare controls — **Umsetzen jetzt** · S
- **Screen/State:** keyboard navigation in compare mode and the overlay.
- **Problem:** `.vgl-bar-btn`, `.vgl-cancel`, `.vgl-tray__cta`, `.vgl-link`, `.vgl-slot__rm`, `.vgl-ph__rm`, `.vgl-close`, `.vgl-more`, `.vgl-alt__add`, `.vgl-coach__btn` have no `:focus-visible` rule → Chrome's default two-tone ring, clipped on the 26 px `×`; the Merkliste add-on uses the DS 3 px teal ring everywhere. Two focus languages in one flow.
- **Evidence:** `grep focus-visible vergleichen.css` → only `.vgl-toggle input`, `.vgl-diff input`, `.vgl-chip`, `.vgl-add`, `.vgl-i`. `.vgl-i:focus-visible{outline:none}` removes the ring on a keyboard-reachable control (the colour change alone is < 3:1).
- **Recommendation:** one rule: `.vgl-bar-btn:focus-visible,.vgl-cancel:focus-visible,.vgl-tray__cta:focus-visible,.vgl-link:focus-visible,.vgl-slot__rm:focus-visible,.vgl-ph__rm:focus-visible,.vgl-close:focus-visible,.vgl-more:focus-visible,.vgl-alt__add:focus-visible,.vgl-coach__btn:focus-visible,.vgl-coach__x:focus-visible,.vgl-i:focus-visible{outline:.1875rem solid var(--teal);outline-offset:.125rem}` (same values as `merkliste.css`). Keep `outline:none` only where a `box-shadow` ring replaces it.
- **Effort:** S.

### PD-10 · Reduced motion is not honoured by the compare layer — **Umsetzen jetzt** · S
- **Screen/State:** `prefers-reduced-motion: reduce`.
- **Problem:** Tray slide (280 ms), card-checkbox fade (`vglfade` 250 ms with translate), row flash (`vglflash` 1.6 s), overlay fade, toast slide, coach progress and the **infinite** `vglpulse` spotlight all keep running; `merkliste.css` switches everything off.
- **Evidence:** no `@media (prefers-reduced-motion)` block in `vergleichen.css`; `plp.css` and `styles-v2.css` both have one.
- **Recommendation:** `@media(prefers-reduced-motion:reduce){.vgl-tray,.vgl-view,.vgl-toast,.vgl-coach,.vgl-scrim,.vgl-chip,.vgl-add,.vgl-more svg,.vgl-switch,.vgl-switch::after,.vgl-box,.vgl-toggle,tr.is-flash td.vgl-val,.vgl-spot{transition:none!important;animation:none!important}.vgl-spot{box-shadow:0 0 0 .375rem rgba(92,219,211,.35)}}` — keep the end states (the flash becomes a static `--teal-100` fill for 1.6 s via a class, if desired).
- **Effort:** S.

### PD-11 · "Modell hinzufügen" column dominates the table · M
- **Screen/State:** overlay with 2–3 models (desktop and mobile).
- **Problem:** A 243 px (desktop) / 120 px (mobile) column with a dashed box as tall as a product card (379 px) plus a `--paper-white` tinted cell in **every** row runs the full table height — the empty column is the most prominent shape on the screen, and on mobile it costs a third of the product width.
- **Evidence:** `col.pc--add{width:10rem}` stretches to 243 px with `table-layout:fixed; width:100%`; `.vgl-ph--add .vgl-add{top:16px;bottom:18px}`; `td.vgl-addcell{background:var(--paper-white)}` on all rows.
- **Recommendation:** narrow to `col.pc--add{width:7rem}` (mobile 5.5 rem) and stop the stretch (`table.vgl-t{width:auto;min-width:100%}` is not possible with fixed layout — instead give product cols `width:auto` and only the add col a fixed width). Cap the tile to the media box: `.vgl-ph--add .vgl-add{bottom:auto;height:7.75rem}` (desktop) / `5.25rem` (mobile) with the "+" and "Modell hinzufügen" only; move "bis zu 4 Modelle vergleichbar" into the tile's `title`/toast. Remove the body tint (`td.vgl-addcell{background:transparent}`) and let the dashed tile be the single cue — matches Samsung/Galaxus.
- **Effort:** M.

### PD-12 · Drawer rows: a solid primary button per row, remove next to compare · S
- **Screen/State:** drawer with ≥ 2 items.
- **Problem:** Three stacked solid `--teal` buttons ("Zum Produkt", "Konfigurieren") make the list louder than the PLP cards (which have no button at all) and compete with the footer CTA; visually it reads like a generic cart drawer. The `Vergleichen` checkbox (x 1012–1124) and the trash icon (x 1128) touch each other (4 px gap) — the destructive control is the nearest neighbour of the most-used control.
- **Evidence:** `.mkl-item__cta.btn` = `.btn--primary` 2.25 rem; `.mkl-item__sec{gap:0 .25rem}`; `.mkl-rm` 2.75 rem adjacent.
- **Recommendation:** row CTA as `.btn.btn--secondary` (2 px teal outline, hover `--teal-100`, height 2.25 rem) — the primary stays reserved for the overlay header and the PDP. Move `.mkl-rm` to the row's top-right (`grid-area:text` end, `position:absolute; top:var(--sp-3); right:var(--sp-4)`) so the three actions read: keep / compare / remove on three different axes; set `.mkl-item__sec{gap:0 .75rem}`. On mobile keep CTA full width, checkbox left, trash top-right.
- **Effort:** S.

### PD-13 · Solid red "Ja, entfernen" is the loudest element in the flow · S
- **Screen/State:** drawer → "Alle entfernen".
- **Problem:** A filled `--red-default` button with white text is the only saturated red surface in the whole shop; the DS uses red for the logo square and sale prices only. For a reversible action (there is an undo toast) this reads as alarm, not confirmation.
- **Evidence:** `.mkl-btn{background:var(--red-default);border-color:var(--red-default)}`; hover `#A80000` (raw value, not a token).
- **Recommendation:** `.mkl-btn{background:var(--white);color:var(--red-default);border:.0625rem solid var(--red-default)}` `.mkl-btn:hover{background:var(--red-default);color:var(--white)}` — same grammar as `.vgl-ph__rm:hover` and `.mkl-rm:hover`. Keep the 2.75 rem height; drop `#A80000`.
- **Effort:** S.

### PD-14 · Two chip grammars; chips wrap to four rows on mobile · S/M
- **Screen/State:** summary strip (overlay) vs filter chips (PLP toolbar).
- **Problem:** Compare chips: 28 px, `--teal-100` fill, 13 px (now 16 px, see PD-01). PLP `.chip`: 32 px, `--teal-5` fill, `rgba(1,82,83,.18)` border, 14 px / 600. Same meaning ("an attribute you can act on"), two looks. On mobile 9 chips wrap into 4 rows → the summary strip is 180 px tall before the table starts.
- **Evidence:** `.vgl-chip{height:28px;background:var(--teal-100)}`; `.chip{height:32px;background:var(--teal-5)}`; `.vgl-sum` rect h 180 at 375 px.
- **Recommendation:** align `.vgl-chip` to the PLP recipe: `height:2rem;padding:0 .75rem;background:var(--teal-5);border:.0625rem solid rgba(1,82,83,.18);font-size:var(--text-body-sm);font-weight:600`, hover `--teal-10`, active/jumped `--teal-100`. Below 48 rem make `.vgl-sum__chips` a single scrolling line with the PLP's own edge-fade pattern (`.pcard__tags.is-scroll` mask) — `display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin-inline:-.75rem;padding-inline:.75rem`.
- **Effort:** S (desktop) / M (mobile scroll + fade).

### PD-15 · px-based compare layer vs rem-based Merkliste layer · M
- **Screen/State:** everywhere both add-ons meet (toolbar vs drawer footer, tray vs drawer).
- **Problem:** The same button grammar is 40 px tall in the compare layer (`.vgl-bar-btn`, `.vgl-tray__cta`, `.vgl-more`) and 44 px (2.75 rem) in the Merkliste layer; at 125 % browser font size the compare controls stay 40 px while the drawer scales. The brief asks for rem.
- **Evidence:** `vergleichen.css` contains 402 px values vs 76 rem values; `merkliste.css` is rem-only.
- **Recommendation:** convert `vergleichen.css` to rem in one pass (÷16; 40 px → 2.5 rem but unify CTAs to **2.75 rem**, 18 px cell padding → `1.125rem`, 60 px bar → `3.75rem`, 112/124/170/220 px heros → 7/7.75/10.625/13.75 rem, 26 px `×` → 2 rem disc, chips 2 rem). Spacing should reference the DS scale even though the tokens are defined in px (`--sp-3` = 12 px): use `var(--sp-4)` where the value is 16 px etc., and plain rem elsewhere.
- **Effort:** M.

### PD-16 · Remove "×" in the header cells: text glyph, 26 px, bordered disc next to a bare bookmark · S
- **Screen/State:** overlay product header.
- **Problem:** Top-left a bare 1.125 rem SVG bookmark, top-right a 26 px white disc with a hairline and a typographic "×" at 15 px in `--graphite-500`. Two icon styles in one 328 px box; the "×" is below the 2.75 rem target and visually heavier than the bookmark.
- **Evidence:** `.vgl-ph__rm{width:26px;font-size:15px;border:1px solid …}`; `.mkl-mark--ov` 2.75 rem hit / 2 rem disc, no border.
- **Recommendation:** render `×` as the same SVG used by `.mkl-close` (`IC_X`, stroke 2), bare glyph, `width/height:2.75rem` hit area with a 1.125 rem icon, colour `--graphite-500`, hover `--red-default`, no disc/border; align both corners to `.375rem` inset. Mobile keeps 2.75 rem.
- **Effort:** S.

### PD-17 · Three price presentations for one product · S
- **Screen/State:** PLP card → drawer row → overlay header.
- **Problem:** Card: struck UVP + red sale price (`.pcard__price--sale`). Drawer: "ab 424,15 €" black, no UVP. Overlay: "ab 424,15 €" black 18 px + muted struck "UVP 499,00 €". The same product changes colour and context three times within 30 seconds.
- **Evidence:** `.mkl-item__price` has no UVP slot; `.vgl-ph__price small.uvp`; `.pcard__price--sale{color:var(--red-default)}` (base shop).
- **Recommendation:** inside both add-ons use one neutral grammar: `ab 424,15 €` in `--schwarz` 700 + `UVP 499,00 €` in `--text-muted` caption, struck — add `uvp` to the Merkliste item snapshot (`p.uvp`) and render `.mkl-item__uvp` under the price. Never red in the add-ons (premium = calm); the card's red stays the base shop's decision.
- **Effort:** S.

### PD-18 · Empty drawer still shows the disabled compare footer · S
- **Screen/State:** drawer with 0 items.
- **Problem:** Under the calm empty state ("Ihre Merkliste ist leer" + "Zurück zu Briefkästen") the sticky footer still displays "Wählen Sie mindestens 2 Modelle derselben Kategorie" and a greyed "Auswahl vergleichen (0)" — instructions for a list that does not exist.
- **Evidence:** `.mkl-foot` rendered at y 831 with `cta.disabled` and `footHint.hidden=false` while `items.length===0`.
- **Recommendation:** `if(n===0) foot.hidden=true` in `render()`; `.mkl-foot[hidden]{display:none}`. The empty state's secondary button becomes the only action.
- **Effort:** S.

### PD-19 · "Alle entfernen" in the overlay bar is destructive without confirm or undo; link styling inconsistent · S
- **Screen/State:** overlay bar.
- **Problem:** One click clears the whole compare set **and** closes the overlay — no confirm, no undo, while the drawer's identical label asks "n Artikel entfernen?" and offers "Rückgängig". In the same bar "Drucken" has no underline, "Alle entfernen" is underlined, "Nur Unterschiede" is a bold label — three link treatments side by side.
- **Evidence:** `view` click handler `k==='clear' → clearAll(); closeView()`; `.vgl-link--ic{text-decoration:none}`.
- **Recommendation:** keep the user in the overlay: `clearAll()` only, then render the existing `.vgl-empty` state ("Mindestens zwei Modelle wählen") with the tray still visible, and show a toast "Vergleich geleert · Rückgängig" (reuse the Merkliste toast grammar). Unify the bar: all three as `.vgl-link` 13 px / 500 `--text-muted`, underline on hover only, icons 1 rem; order: Nur Unterschiede · Drucken · Alle entfernen · ×.
- **Effort:** S.

### PD-20 · Colour swatch grammar differs from the PLP · S
- **Screen/State:** "Farben" row in the overlay.
- **Problem:** PLP cards show 26 px rounded squares (`--r-m`, inset hairline); the overlay shows 14 px circles with a 15 % black border — on a design-led row the swatches are too small to read Eisenglimmer vs Anthrazit and look like a different product.
- **Evidence:** `.vgl-sw span{width:14px;border-radius:50%}` vs `.pcard__sw{width:26px;border-radius:var(--r-m);box-shadow:inset 0 0 0 1px rgba(0,0,0,.14)}`.
- **Recommendation:** `.vgl-sw span{width:1.375rem;height:1.375rem;border-radius:var(--r-m);border:0;box-shadow:inset 0 0 0 .0625rem rgba(0,0,0,.14)}` (mobile 1.125 rem), gap `.375rem`, and keep the `title`. Add the colour names as a `.vgl-swn` caption line when ≤ 4 colours.
- **Effort:** S.

### PD-21 · Checkbox and label inks differ between card and drawer · S
- **Screen/State:** "Vergleichen" on cards vs in drawer rows.
- **Problem:** Card box border `--graphite-500` (#A1A1A1), drawer box border `--text-muted` (#6A6A6A); label colour identical but weight/size differ once PD-01 is fixed (card 14 px / 600, drawer 14 px / 600 — fine) — the box difference is visible when the drawer sits over the grid.
- **Evidence:** `.vgl-box{border:2px solid var(--graphite-500)}`; `.mkl-cmp__box{border:.125rem solid var(--text-muted)}`.
- **Recommendation:** one token for both: `--graphite-500` is the DS "inactive control" tone; set `.mkl-cmp__box{border-color:var(--graphite-500)}` and hover `--teal` on both. Checked state already identical.
- **Effort:** S.

### PD-22 · A configured build looks like a plain product in the drawer · S
- **Screen/State:** `?merkliste=demo`.
- **Problem:** The row shows "Siebert · Gesamt 389,00 € · Farbe: Anthrazit · Gravur: Familie Maier …" but nothing marks it as *the customer's own configuration* — the Merkliste's unique capability (05 §1 goal 2) is not visible at a glance.
- **Evidence:** `rowHTML()` emits `.mkl-item__cfg` lines only; no badge class.
- **Recommendation:** add a pill above the name using the PLP's pill grammar (`.pcard__sys`: `--graphite-100` fill, inset hairline, caption 500): `<span class="mkl-item__tag">Ihre Konfiguration</span>`; give the thumbnail a `--teal` hairline instead of `--graphite-200`. "Konfiguration öffnen" becomes a `.tlink` with chevron for consistency with the shop's text links.
- **Effort:** S.

### PD-23 · "Auf einen Blick" has no visible label · S
- **Screen/State:** overlay header (until PD-02 moves it).
- **Problem:** Three teal bullets under the price have an `aria-label` but no visible heading, so sighted users read them as generic feature bullets, not as "what only this model has".
- **Evidence:** `<ul class="vgl-ph__hl" aria-label="Das zeichnet dieses Modell aus">`.
- **Recommendation:** eyebrow above the list: `<div class="vgl-ph__hl-h">Auf einen Blick</div>` styled like the group band label (`font-size:.6875rem;letter-spacing:.13em;text-transform:uppercase;color:var(--teal);font-weight:700;margin:.5rem 0 .25rem`). With PD-02 the row-group band carries the label instead.
- **Effort:** S.

### PD-24 · Warning colours are raw values, not tokens · S
- **Screen/State:** guard "Set vs. Einzelmodell", limit toasts.
- **Problem:** `rgba(255,192,65,.16)` background, `#B8860B` icon, `var(--star,#FFC041)` (the token `--star` does not exist in `styles-v2.css`), `#A80000` hover — the only non-token colours in the two layers.
- **Evidence:** `.vgl-guard--warn`, `.vgl-toast.t-limit svg`, `.mkl-toast.t-limit>svg`, `.mkl-btn:hover`, `.mkl-notice`.
- **Recommendation:** propose two DS tokens in `styles-v2.css` (`--warn:#B8860B`, `--warn-10:rgba(255,192,65,.16)`) and reference only those; or stay inside the palette: background `--graphite-100`, icon `--schwarz`, text `--schwarz` (a warning in a premium shop can be quiet). Remove `#A80000` (PD-13).
- **Effort:** S.

### PD-25 · Drawer header carries a two-line storage hint on every open · S
- **Screen/State:** drawer header.
- **Problem:** "Auf diesem Gerät gespeichert · Anmelden, um die Merkliste auf allen Geräten zu nutzen" (12 px, 35 px tall) sits between the title and the first row on every open; it is secondary information occupying the primary slot and pushes the first product down to y 132.
- **Evidence:** `.mkl-hint` inside `.mkl-head`.
- **Recommendation:** move it into `.mkl-foot` above the CTA row (caption, `--text-muted`) or show it once per session (dismiss stored in `sessionStorage`). Keep the login link.
- **Effort:** S.

### PD-26 · Header badges behave differently side by side · S
- **Screen/State:** header, 0 items.
- **Problem:** The Merkliste badge hides at 0 (spec), the base shop's Warenkorb badge shows "0" permanently — two neighbouring icons with opposite rules.
- **Evidence:** `.mkl-hdr .badge.is-zero{display:none}`; cart `.badge` text "0", `display:flex`.
- **Recommendation:** keep the Merkliste rule (hide at 0 — Apple/Zalando/Otto do the same) and hand the base shop a one-line note to apply `.badge.is-zero{display:none}` to the cart as well; until then the add-on could mirror the cart (show "0") — but hiding is the better pattern, so align the shop, not the add-on.
- **Effort:** S (shop-level).

### PD-27 · Toast and small-button offsets · S
- **Screen/State:** overlay toasts; twin alternatives.
- **Problem:** The compare toast floats at `bottom:104px` inside the overlay although the tray is hidden behind it — it hangs mid-screen; "+ Zum Vergleich" buttons are 28 px tall (`.vgl-alt__add`), below the 2.75 rem target used everywhere else.
- **Evidence:** `.vgl-toast{bottom:104px}`; `.vgl-alt__add{height:28px}`.
- **Recommendation:** `.vgl-view.is-open ~ .vgl-toast, body.vgl-overlay .vgl-toast{bottom:1.5rem}` (add `body.vgl-overlay` in `openView()`); `.vgl-alt__add{height:2.25rem;padding:0 .75rem}`.
- **Effort:** S.

### PD-28 · Dead "compact" rules and hidden-bookmark rule · S
- **Screen/State:** code hygiene after the fixed-height decision.
- **Problem:** `.vgl-view.is-compact …` (11 rules) and `.vgl-view.is-compact .mkl-mark--ov{display:none}` remain although no code adds `is-compact` any more; the `transition:height .18s` on `.vgl-ph__media`/`__name` also remains and fires on lens switches.
- **Evidence:** `vergleichen.js` comment "sticky product header stays a stable size"; `grep is-compact vergleichen.js` → only `classList.remove`.
- **Recommendation:** delete the `is-compact` block and the media/name transitions; keep the overlay bookmark always visible.
- **Effort:** S.

---

## 4 · Quick spec snippets (top items, existing tokens only)

**PD-01 — valid typography (replace every `font:… inherit`)**
```css
/* vergleichen.css */
.vgl-bar-btn,.vgl-tray__cta,.vgl-more{font-family:inherit;font-size:var(--text-body-sm);font-weight:600;line-height:1}
.vgl-chip,.vgl-coach__btn{font-family:inherit;font-size:.8125rem;font-weight:600;line-height:1}
.vgl-link,.vgl-cancel,.vgl-coach__x{font-family:inherit;font-size:.8125rem;font-weight:500;line-height:1}
.vgl-coach__step,.vgl-alt__add{font-family:inherit;font-size:var(--text-caption);font-weight:700;line-height:1}
.vgl-tourfab{font-family:inherit;font-size:var(--text-body-sm);font-weight:700;line-height:1}
.vgl-i::after{font-family:inherit;font-size:.8125rem;font-weight:400;line-height:1.45}
/* merkliste.css */
.mkl-cta{font-family:inherit;font-size:var(--text-body-sm);font-weight:600;line-height:1}
.mkl-link{font-family:inherit;font-size:.8125rem;font-weight:500;line-height:1}
.mkl-btn{font-family:inherit;font-size:.8125rem;font-weight:600;line-height:1}
.mkl-toast__act{font-family:inherit;font-size:var(--text-body-sm);font-weight:700;line-height:1}
```

**PD-02 — shorter fixed header, highlights as the first row group**
```js
// renderView(): after thead, before the ROWS loop
tbody+='<tr class="vgl-group"><th class="rh" scope="rowgroup">Auf einen Blick</th>'+emptyCells+'</tr>'+
  '<tr data-key="hl"><th class="rh" scope="row">Das zeichnet das Modell aus</th>'+
  items.map(function(p,i){return '<td class="vgl-val"><ul class="vgl-ph__hl">'+hlHTML(hl[i])+'</ul></td>';}).join('')+(addCol?'<td class="vgl-addcell"></td>':'')+'</tr>';
```
```css
table.vgl-t thead th.vgl-ph{padding:1rem 1.125rem 4.125rem}      /* 74 → 66 px */
.vgl-ph__media{margin-bottom:.5rem}
.vgl-ph__price{margin-bottom:.375rem}
.vgl-ph__price small{min-height:0}
.vgl-ph__hl{padding:0;border-top:0}                                /* now lives in the row */
tr[data-key="hl"] td.vgl-val{background:var(--white)}              /* never tinted */
```

**PD-03 — mobile tray**
```css
@media(max-width:47.99rem){
  .vgl-tray__inner{flex-wrap:wrap;gap:.5rem .75rem;padding:.625rem 1rem}
  .vgl-tray__status{flex:1 1 auto}
  .vgl-tray__actions{flex:0 0 auto;gap:.5rem}
  .vgl-tray__cta{height:2.75rem;padding:0 1rem}
  .vgl-tray__slots{order:3;flex:1 1 100%;gap:.5rem}
  .vgl-slot{width:2.75rem;height:2.75rem}
}
```

**PD-04 — tooltip stacking**
```css
table.vgl-t tbody tr:hover>.rh,table.vgl-t tbody .rh:focus-within{z-index:5}
```

**PD-07 — drawer-anchored toast**
```css
.mkl-toast.is-drawer{left:auto;right:1rem;transform:translateY(.75rem);
  bottom:calc(var(--mkl-foot-h,4.375rem) + .75rem + env(safe-area-inset-bottom,0px))}
.mkl-toast.is-drawer.show{transform:none}
@media(min-width:48rem){.mkl-toast.is-drawer{width:26rem;max-width:26rem}}
```
```js
// render(): document.documentElement.style.setProperty('--mkl-foot-h', foot.offsetHeight/16+'rem');
```

**PD-08 — breakable highlights**
```css
.vgl-hl__k{margin-right:0}.vgl-hl__k::after{content:': '}.vgl-ph__hl li{overflow-wrap:anywhere}
```

**PD-09 — one focus ring**
```css
.vgl-bar-btn:focus-visible,.vgl-cancel:focus-visible,.vgl-tray__cta:focus-visible,.vgl-link:focus-visible,
.vgl-slot__rm:focus-visible,.vgl-ph__rm:focus-visible,.vgl-close:focus-visible,.vgl-more:focus-visible,
.vgl-alt__add:focus-visible,.vgl-coach__btn:focus-visible,.vgl-coach__x:focus-visible,.vgl-i:focus-visible{
  outline:.1875rem solid var(--teal);outline-offset:.125rem}
```

**PD-10 — reduced motion for the compare layer**
```css
@media(prefers-reduced-motion:reduce){
  .vgl-tray,.vgl-view,.vgl-toast,.vgl-coach,.vgl-scrim,.vgl-chip,.vgl-add,.vgl-more svg,.vgl-switch,.vgl-switch::after,
  .vgl-box,.vgl-toggle,.vgl-ph__media,.vgl-ph__name,tr.is-flash td.vgl-val,.vgl-spot{transition:none!important;animation:none!important}
  tr.is-flash td.vgl-val{background:var(--teal-100)}
}
```

**PD-12 / PD-13 — quieter drawer actions**
```css
.mkl-item__cta.btn{background:transparent;color:var(--teal);border:.125rem solid var(--teal)}  /* = .btn--secondary */
.mkl-item__cta.btn:hover{background:var(--teal-100)}
.mkl-item{position:relative}.mkl-rm{position:absolute;top:var(--sp-3);right:var(--sp-4)}
.mkl-item__sec{gap:0 .75rem}
.mkl-btn{background:var(--white);color:var(--red-default);border:.0625rem solid var(--red-default)}
.mkl-btn:hover{background:var(--red-default);color:var(--white)}
```

**PD-14 — one chip**
```css
.vgl-chip{height:2rem;padding:0 .75rem;border-radius:var(--r-pill);background:var(--teal-5);
  border:.0625rem solid rgba(1,82,83,.18);color:var(--teal);font-size:var(--text-body-sm);font-weight:600}
.vgl-chip:hover{background:var(--teal-10);color:var(--teal);border-color:var(--teal)}
@media(max-width:47.99rem){.vgl-sum__chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;width:auto;
  margin-inline:-.75rem;padding-inline:.75rem;-webkit-mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - 1.625rem),transparent 100%)}}
```

**PD-16 — header remove control**
```css
.vgl-ph__rm{top:.375rem;right:.375rem;width:2.75rem;height:2.75rem;border:0;background:transparent;box-shadow:none;color:var(--graphite-500)}
.vgl-ph__rm svg{width:1.125rem;height:1.125rem}      /* use IC_X markup instead of the "×" character */
.vgl-ph__rm:hover{color:var(--red-default)}
```

**PD-18 / PD-25 — drawer chrome**
```css
.mkl-foot[hidden]{display:none}
.mkl-foot .mkl-hint{flex:1 1 100%;margin:0 0 .25rem}
```

---

### Verification checklist for the implementer
1. `getComputedStyle(document.querySelector('.vgl-bar-btn')).font` → `600 14px / 14px …`; chips 13 px / 600.
2. Overlay `thead` height ≤ 18.5 rem (296 px) at 1440 × 900 with 2–4 models; ≤ 19 rem on 375 px; twin block visible on open.
3. 375 px tray: `.vgl-tray__cta` right edge ≤ 375, all slots visible.
4. Hover any (i): full hint text visible over the next row.
5. Drawer toast rect lies inside the drawer rect on desktop; on mobile its bottom ≥ footer top + 0.75 rem.
6. `?vergleich=ebenhard,ebenhard-v2a`: names differ in the header, no "7 Farben" bullet, value statement names the front.
7. Tab through compare mode and overlay: every control shows the 3 px teal ring.
8. `prefers-reduced-motion: reduce`: no `animation`/`transition` on `.vgl-*`.
