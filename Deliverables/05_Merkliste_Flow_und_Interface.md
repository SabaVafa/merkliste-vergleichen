# 05 — Merkliste: Flow & Interface (Version B prototype)

Date: 2026-10-10 · Scope: `Deliverables/vergleichen-flow-B/` (intercom PLP `index.html`, mailbox PLP `briefkasten.html`, compare add-on) · Role: Lead Product Design
Builds on: `04_Merkliste_Benchmark.md` (guest-first, no cart, configId + snapshot), `03_Audit_Version-B.md` (compare principles), `01_Phase-0 §3.4` (configured builds are JTL properties, not Merkmale).
UI wording: **Merkliste / Merken / Gemerkt** — never "Wishlist", "Wunschzettel", "günstig". Prefix for all new classes: `mkl-` (never `vgl-`).

---

## 1 · Goals, principles, success metrics

**Goals.** (1) Let a customer keep a shortlist across visits without an account. (2) Keep a *configured* intercom or mailbox build (colour, nameplate, engraving, modules) retrievable — the thing the native JTL Wunschliste cannot do. (3) Feed the existing Vergleichen flow from the shortlist instead of duplicating it.

**Principles.**
- **One act, always visible.** Merken is a single click/tap on a control that is present at rest — on touch too. It never depends on compare mode.
- **Two tools, two shapes.** Bookmark = keep for later (persistent, unlimited-ish). Checkbox = compare now (session, cap 4). They share tokens, not affordances.
- **No cart from the list.** Every product is individualised on the PDP or in the configurator; CTAs are "Konfigurieren" / "Zum Produkt" only.
- **Guest-first, merge later.** `localStorage` now; union into the account on login; never drop, never wall.
- **Quiet premium feedback.** State change + counter + one toast with an action. No modal, no list naming, no confetti.

**Success metrics (prototype → shop).** Merken-rate per PLP session (target ≥ 8 %); Merkliste re-open rate within 7 days (≥ 25 % of lists with ≥ 1 item); Merkliste → Konfigurieren/Zum Produkt click-through (≥ 35 %); "Auswahl vergleichen" starts from the Merkliste (≥ 10 % of lists with ≥ 2 items); share of configured builds among items (tracks goal 2); zero "In den Warenkorb" in the surface (audit check).

---

## 2 · Entry points & placement

| Surface | Control | Placement (exact) |
|---|---|---|
| **PLP card** (`.pcard`, both lenses) | `button.mkl-mark` — 2.25 rem circular, white fill, hairline, bookmark glyph | Absolutely positioned **top-right of `.pcard__media`**, `top:0.75rem; right:0.75rem; z-index:3`. Price badge stays top-left, Red-Dot lockup bottom-left — no collision. Injected by `merkliste.js` after `.pcard[data-id]` render (same scan pattern as `injectToggle`). |
| **PDP** | `button.mkl-mark.mkl-mark--label` — same bookmark + text "Merken"/"Gemerkt", 2.75 rem height | Directly beside the primary CTA ("Bitte Farbe wählen"/"In den Warenkorb"), same row as "Produkt teilen". Spec only (no PDP in the prototype). |
| **Compare overlay** (`.vgl-ph` column) | `button.mkl-mark` 2 rem | **Top-left of `.vgl-ph__media`** (`top:0.375rem; left:0.375rem`), mirroring the existing remove "×" at top-right. Hidden while `.vgl-view.is-compact` (header is compacted; it returns on scroll-up). |
| **Configurator** | Text button "Konfiguration merken" with bookmark glyph | Top bar, between "Teilen" and "PDF Export". Spec only. |
| **Header** | `a.icon-btn.mkl-hdr` with `span.badge` count | In `.header__icons`, **between "Mein Konto" and "Warenkorb"** (the slot the live shop reserves for the hidden `compare-list-menu`). Opens the drawer; on JTL links to `/merkliste`. Badge hidden at 0. |

**Card bookmark — states.**

| State | Glyph | Fill / border | Token |
|---|---|---|---|
| Rest | Outline bookmark, stroke 1.75 (SVG units) | White disc, hairline `--graphite-300` | glyph `--schwarz` (16:1 on white) |
| Hover / focus-visible | Outline bookmark | Disc `--teal-100`, border `--teal`; focus ring `outline:0.1875rem solid var(--teal); outline-offset:0.125rem` | glyph `--teal` |
| **Gemerkt** (`aria-pressed="true"`) | **Filled bookmark** | White disc, border `--teal` | fill `--teal` (9:1 on white) |
| Gemerkt + hover | Filled bookmark | Disc `--teal-100` | fill `--teal` |
| Pressed (120 ms) | Scale 0.9 → 1.0 | — | reduced-motion: no transform |
| Limit reached (50) | Outline bookmark | Disc white, glyph `--graphite-500` | `aria-disabled="true"`, tooltip via toast |

**Colour decision: teal, not Metzler Rot.** Three reasons. (a) The DS reserves `--color-metzler-rot` for the logo M-square and sale badges only; a red bookmark on every card would dilute the one place red carries brand meaning and read as "Sale". (b) Red is the shop's error/remove colour (`--red-default` on the compare "×" hover, `--rot` on "Filter löschen"); "kept" should not share the hue of "danger". (c) Teal is already the shop's "selected/active" ink (compare checkbox, `.pcard.is-vgl` outline, header badge), so a teal bookmark says *selected for later* in the same language. Shape (bookmark vs. checkbox) and position (media corner vs. footer) keep the two tools distinguishable.

**Toast after Merken** (see §6): "Gemerkt · Zur Merkliste" (action link) for 5 s; after Entfernen: "Aus der Merkliste entfernt · Rückgängig".

---

## 3 · Flows

### 3.1 Merken from the PLP
1. Customer taps the bookmark on a card. 2. `merkliste.js` reads the card's `data-id`, builds the item from `window.MTZ_PRODUCTS` (`id, name, img, price, konfig, lens`) and pushes it into `mtz_merkliste`. 3. Bookmark → gemerkt, header badge increments (0 → 1 shows the badge), live region announces "Gemerkt: {name}. Merkliste: n Artikel". 4. Toast "Gemerkt · Zur Merkliste". 5. Tap again → removed, toast with "Rückgängig" (5 s). No scroll, no reload, no compare-mode change.

### 3.2 Merken a configured build (configurator, spec)
```mermaid
flowchart LR
  A[Konfigurator: „Konfiguration merken"] --> B{configId vorhanden?}
  B -- nein --> C[Konfiguration speichern → configId]
  B -- ja --> D
  C --> D[Snapshot bauen: name, img, configSummary[], configTotal]
  D --> E[Item {id:'cfg:'+configId, configId, snapshot} → mtz_merkliste]
  E --> F[Toast „Konfiguration gemerkt · Zur Merkliste"]
```
The snapshot is stored **with** `configId`, so the row stays readable when the server-side config expires; "Konfiguration öffnen" deep-links to `/konfigurator?configId=…`. If the link 404s, the row shows "Konfiguration abgelaufen — Details siehe Zusammenfassung" and the CTA falls back to "Konfigurieren" (fresh start).

### 3.3 Open the Merkliste
Header control (or the toast link) → drawer slides in from the right (desktop) / full-screen panel (mobile). Focus moves to the drawer title; body scroll locks; Escape or "Schließen" returns focus to the opener. On JTL the same markup renders at `/merkliste`.

### 3.4 Merkliste → Konfigurieren / Zum Produkt
Per row one primary CTA: `konfig === true` → "Konfigurieren" (links to configurator, with `?configId` when present); otherwise "Zum Produkt" (PDP). The drawer closes on navigation; the item stays in the list.

### 3.5 Merkliste → Auswahl vergleichen (handover to the existing overlay)
1. Each row has a checkbox "Vergleichen" (visible only in the Merkliste, independent of PLP compare mode). 2. The first checked row fixes the **category**; rows of another lens become disabled with hint "Vergleich nur innerhalb einer Kategorie". 3. Footer button "Auswahl vergleichen (n)" enables at n ≥ 2, disables at n = 4 for further checks (reuse the compare guardrail copy "Maximal 4 Modelle gleichzeitig"). 4. Click → `window.MTZ_VGL.compare(ids)`:
   - if the ids' lens equals `window.MTZ_LENS`: the hook sets `selected = ids`, persists to `mtz_vgl_flow`, enters compare mode (adds `body.vgl-mode`, so the card checkboxes appear exactly as if the toolbar button had been pressed — the gating rule is unchanged), syncs tray/bar and calls `openView()`;
   - otherwise it navigates to the matching PLP with `?vergleich=id,id` and the add-on reads the param on `init()`, then does the same.
5. The drawer closes before the overlay opens; closing the overlay later lands on the PLP with the tray open and the 2–4 models marked — the customer is inside the normal compare flow.

### 3.6 Remove · Undo · Alle entfernen
Row "Entfernen" (icon button) → row fades out (120 ms), toast "… entfernt · Rückgängig" for 5 s; undo re-inserts at the original index. "Alle entfernen" → inline confirm in the drawer header ("n Artikel entfernen?" · "Ja, entfernen" / "Abbrechen"), then toast with a single "Rückgängig" for the whole set.

### 3.7 Guest → login merge (spec)
On successful login the plugin posts `mtz_merkliste.items` to `/merkliste/merge`. Server = **union** by `articleId` (plain items → native Wunschliste) and by `configId` (configured items → custom table). Response returns the merged list; client replaces `localStorage` with it and shows "n Artikel aus dieser Sitzung übernommen". Nothing is ever dropped; duplicates keep the earlier `addedAt`.

### 3.8 Share by link (P1, spec)
"Link kopieren" in the drawer header serialises `ids + configIds` to a server token → `/merkliste?list=<token>`. The recipient sees a read-only copy with "In meine Merkliste übernehmen" (union into their own). Mirrors "Produkt teilen" and the configurator's "Teilen".

### 3.9 PDF export (P1, spec)
"Als PDF speichern" reuses the configurator's jsPDF + autotable: thumbnail, model name, Artikelnummer, configuration summary lines, price/total, deep link, date. B2B artefact for installers/architects; same print CSS discipline as the compare "Drucken".

---

## 4 · Merkliste surface

**Decision: drawer for the prototype; page on JTL.** The prototype has no routing, and a drawer keeps the customer in the category while they prune the list — the quick-view use (OTTO/IKEA mini-panels). On JTL the identical component is the body of `/merkliste` (page = permanent, shareable URL; drawer = quick view from the header). Rendering is one function with a `mode: 'drawer' | 'page'` flag.

**Layout.** Desktop: right-side panel `width: min(28rem, 100vw)`, full height, `--white` surface, `--shadow-xl`, scrim `rgba(10,20,20,.45)` (same as the compare tour scrim). Mobile (< 48 rem): `inset:0`, full-screen, body scroll locked, sticky header and footer, scrolling list between them, **no horizontal page scroll** (rows use `min-width:0`, names wrap). z-index 960 — above the compare tray (850) and overlay (900), so the drawer can open from inside the comparison; toasts at 970.

**Header.** Title `h2.mkl-title` "Merkliste" + `span.mkl-count` "(n)"; right: "Alle entfernen" (`.mkl-link`, hidden at n = 0) and close "×" (`.mkl-close`, 2.75 rem). Below: a muted hint line "Auf diesem Gerät gespeichert · Anmelden, um die Merkliste auf allen Geräten zu nutzen" (link opens the login popup; never a wall).

**Item row anatomy** (`article.mkl-item`, grid `4.5rem 1fr auto`):

| Slot | Content | Style |
|---|---|---|
| Media | Thumbnail 4.5 rem square, `--graphite-200` hairline, `--r-l` | `object-fit: contain` |
| Name | **Model-first** like the compare header: `shortName().main` bold (`--text-body`, `--schwarz`), qualifier beneath (`--text-caption`, `--text-muted`) | 2-line clamp on the main line |
| Price | "ab 89,99 €" or, for a build, "Gesamt 1.249,00 €" | `--text-body-sm` weight 700 |
| Config summary (when `configId`) | Up to 3 lines "Farbe: Anthrazit · Klingeltaster: 2 · Gravur: Familie Maier" + "Konfiguration öffnen" link | `--text-caption`, `--text-muted` |
| Availability (optional) | "Sofort verfügbar" with `--green` dot | `--text-caption`; omitted when unknown |
| Actions | Primary CTA "Konfigurieren" / "Zum Produkt" (`.btn.btn--primary`, 2.25 rem high in the drawer, full-width on mobile); checkbox "Vergleichen"; icon button "Entfernen" (2.75 rem hit area) | CTA pinned bottom-right of the row on desktop, full-width row on mobile |

**Footer** (sticky): "Auswahl vergleichen (n)" (`.mkl-cta`, same visual grammar as `.vgl-tray__cta`: disabled grey until n ≥ 2, then light-teal fill / teal ink, solid teal on hover). Disabled helper text: "Wählen Sie mindestens 2 Modelle derselben Kategorie". P1 links "Link kopieren" · "Als PDF speichern" sit left of the CTA (desktop) or above it (mobile).

**Empty state.** Outline bookmark 2.75 rem in `--graphite-300`, title "Ihre Merkliste ist leer", copy "Merken Sie Modelle mit dem Lesezeichen-Symbol — sie bleiben auf diesem Gerät gespeichert.", CTA "Zurück zu {Kategorie}" (`.btn--secondary`; category from `MTZ_LENS`: "Türsprechanlagen" / "Briefkästen").

**Item limit.** 50 items. At 50 every unselected bookmark becomes `aria-disabled`; tapping it toasts "Ihre Merkliste ist voll (50) — bitte zuerst einen Artikel entfernen" and opens nothing. Gemerkt bookmarks still toggle off. The drawer header shows "(50 / 50)".

**States & feedback.** Counter badge animates (scale 1 → 1.25 → 1, 180 ms; none under reduced motion). Toasts 5 s with one action, pause on hover/focus. Live region `#mkl-live` (`aria-live="polite"`, visually hidden) announces add/remove/limit/merge. When `localStorage` is unavailable: one-line notice in the drawer "Die Merkliste kann auf diesem Gerät nicht gespeichert werden (Cookies/Speicher blockiert)" and the list runs in-memory for the session.

---

## 5 · Interplay rules with Vergleichen

1. **Independent sets.** A product can be gemerkt, in the compare set, both, or neither. `mtz_merkliste` (localStorage, persistent) and `mtz_vgl_flow` (sessionStorage, session) never write to each other.
2. **Card gating unchanged.** The compare checkbox stays hidden until the toolbar "Vergleichen" button activates compare mode. The bookmark is always visible. Entering/leaving compare mode does not touch bookmarks.
3. **Merken inside the comparison.** Each `.vgl-ph` column carries a bookmark (top-left of the media). It toggles the same item; the header badge updates behind the overlay; the toast appears above the overlay (z 970).
4. **Vergleichen from the Merkliste.** The only way the Merkliste reaches the comparison is the handover in §3.5 — it *enters* compare mode and reuses the overlay; it never renders its own table. If the compare set already holds models, the handover **replaces** it (the Merkliste selection is the explicit intent) and toasts "Vergleich mit n Modellen aus Ihrer Merkliste".
5. **Tray.** After handover the standard tray shows the n slots, "Vergleich (n) / max. 4" and the ready hint — nothing Merkliste-specific. Removing a model from the tray does not remove it from the Merkliste.
6. **Guardrail copy reuse.** Cap and category guards reuse the compare strings verbatim ("Maximal 4 Modelle gleichzeitig — bitte zuerst eines entfernen", "Mindestens zwei Modelle wählen"); the overlay's own guardrails (same design line, Kombi-Set) apply unchanged once open.
7. **Toasts never stack.** One toast element per layer; a Merkliste toast replaces a compare toast and vice versa.

---

## 6 · Micro-copy (German, Sie)

| Key | String |
|---|---|
| bookmark.label.rest | `aria-label="{Modell} merken"` |
| bookmark.label.on | `aria-label="{Modell} aus der Merkliste entfernen"` (+ `aria-pressed="true"`) |
| bookmark.pdp.rest / on | "Merken" / "Gemerkt" |
| konfigurator.save | "Konfiguration merken" |
| header.label | `aria-label="Merkliste, {n} Artikel"` · visible tooltip "Merkliste" |
| toast.added | "Gemerkt" · action "Zur Merkliste" |
| toast.addedConfig | "Konfiguration gemerkt" · action "Zur Merkliste" |
| toast.removed | "Aus der Merkliste entfernt" · action "Rückgängig" |
| toast.clearedAll | "{n} Artikel entfernt" · action "Rückgängig" |
| toast.limit | "Ihre Merkliste ist voll (50) — bitte zuerst einen Artikel entfernen" |
| toast.compareStart | "Vergleich mit {n} Modellen aus Ihrer Merkliste" |
| toast.merged | "{n} Artikel aus dieser Sitzung übernommen" |
| drawer.title | "Merkliste" + "({n})" / at limit "({n} / 50)" |
| drawer.hint | "Auf diesem Gerät gespeichert · Anmelden, um die Merkliste auf allen Geräten zu nutzen" |
| drawer.clearAll | "Alle entfernen" · confirm "{n} Artikel entfernen?" · "Ja, entfernen" / "Abbrechen" |
| drawer.close | `aria-label="Merkliste schließen"` |
| row.cta.konfig / row.cta.pdp | "Konfigurieren" / "Zum Produkt" |
| row.openConfig | "Konfiguration öffnen" |
| row.configExpired | "Konfiguration abgelaufen — Details siehe Zusammenfassung" |
| row.compare | "Vergleichen" (`aria-label="{Modell} zum Vergleich auswählen"`) |
| row.compare.otherLens | "Vergleich nur innerhalb einer Kategorie" |
| row.remove | `aria-label="{Modell} entfernen"` |
| row.price.from / total | "ab {Preis}" / "Gesamt {Preis}" |
| row.availability | "Sofort verfügbar" |
| footer.compare | "Auswahl vergleichen ({n})" |
| footer.compare.hint | "Wählen Sie mindestens 2 Modelle derselben Kategorie" |
| footer.share / pdf (P1) | "Link kopieren" / "Als PDF speichern" |
| empty.title / body / cta | "Ihre Merkliste ist leer" / "Merken Sie Modelle mit dem Lesezeichen-Symbol — sie bleiben auf diesem Gerät gespeichert." / "Zurück zu {Kategorie}" |
| storage.unavailable | "Die Merkliste kann auf diesem Gerät nicht gespeichert werden (Cookies/Speicher blockiert)" |
| live.added / removed | "Gemerkt: {Modell}. Merkliste: {n} Artikel" / "Entfernt: {Modell}. Merkliste: {n} Artikel" |

---

## 7 · Accessibility

- **Roles.** Bookmark: `<button type="button" aria-pressed>`; never a link, never a checkbox. Drawer: `role="dialog" aria-modal="true" aria-labelledby="mklTitle"`; list: `<ul role="list">` with `<li><article>`; compare checkboxes: native `<input type="checkbox">` with visible label. Header control: `<a>` (page) in JTL, `<button>` in the prototype (opens the drawer).
- **Focus order.** Drawer: title → "Alle entfernen" → close → rows (CTA → Vergleichen → Entfernen, DOM order) → footer CTA. Focus trap identical to the compare dialog (Tab/Shift+Tab wrap). Opening moves focus to the title (`tabindex="-1"`); closing returns it to the opener. Escape closes the drawer; if the compare overlay is open beneath, Escape closes the drawer only.
- **Live regions.** `#mkl-live` polite for add/remove/limit/merge; toasts `role="status"`. Counter badge is `aria-hidden` (the header `aria-label` carries the number).
- **Contrast.** Text ≥ 4.5:1 (`--schwarz` 16:1, `--text-muted` 5.4:1, white on `--teal` 9:1, `--teal-mint` link on `--schwarz` toast 10.5:1). Icons ≥ 3:1: bookmark glyph `--schwarz` or `--teal` on white (16:1 / 9:1); the hairline disc is decorative. Disabled bookmarks `--graphite-500` are exempt but still announced.
- **Touch targets ≥ 2.75 rem.** Bookmark renders at 2.25 rem but its hit area is 2.75 rem (`::before` inset −0.25rem); close/remove/header buttons are 2.75 rem; compare checkbox label is a 2.75 rem row.
- **Motion.** All transitions ≤ 220 ms; under `prefers-reduced-motion: reduce` the drawer appears without slide, the bookmark without scale, the badge without pulse, the row removal without fade.
- **Keyboard parity.** Everything reachable with Tab/Enter/Space; no hover-only affordance; tooltips not required (labels are explicit).

---

## 8 · Components, tokens, responsive rules, acceptance checklist

**Component inventory + token mapping** (prototype tokens from `Home/styles-v2.css`; DS canonical names in brackets; all sizes in rem).

| Class | Role | Tokens |
|---|---|---|
| `.mkl-mark` | card/overlay bookmark, 2.25 rem, `border-radius: var(--r-pill)` | bg `--white`, border `0.0625rem solid var(--graphite-300)`, glyph `--schwarz`; `.is-on` glyph+border `--teal` [`--color-teal`]; hover bg `--teal-100`; shadow `--shadow-sm`; focus `--teal` ring |
| `.mkl-mark--label` | PDP variant with text | height 2.75 rem, `--r-m`, `--text-body-sm` 600 |
| `.mkl-hdr` + `.badge` | header control | reuses `.icon-btn` (52 px existing) and `.icon-btn .badge` (`--teal` / `--white`) unchanged |
| `.mkl-scrim` | backdrop | `rgba(10,20,20,.45)` (same as `.vgl-scrim`) |
| `.mkl-drawer` | panel | bg `--white`, `--shadow-xl`, width `min(28rem,100vw)`, `--r-xl` on the inner page card |
| `.mkl-head` / `.mkl-title` / `.mkl-count` | header | `--text-h3` 700 `--schwarz`; count `--text-body` 400 `--text-muted`; divider `--graphite-200` |
| `.mkl-hint` | device/sync hint | `--text-caption` `--text-muted`, link `--teal` |
| `.mkl-item` | row | padding `--sp-4`, divider `--graphite-100`, hover bg `--paper-white` |
| `.mkl-item__media` | thumbnail | 4.5 rem, border `--graphite-200`, `--r-l`, bg `--white` |
| `.mkl-item__name` / `__sub` | model-first name / qualifier | `--text-body` 700 / `--text-caption` `--text-muted` |
| `.mkl-item__price` | price | `--text-body-sm` 700 `--schwarz` |
| `.mkl-item__cfg` | config summary lines | `--text-caption` `--text-muted`; link `--teal` |
| `.mkl-item__avail` | availability | dot `--green`, `--text-caption` |
| `.mkl-item__cta` | CTA | existing `.btn.btn--primary` (`--teal`, hover `--teal-600`) |
| `.mkl-cmp` | compare checkbox | same box grammar as `.vgl-box` (`--graphite-500` border, checked `--teal`) |
| `.mkl-rm` | remove icon button | 2.75 rem, glyph `--graphite-500`, hover `--red-default` [`--color-red`] |
| `.mkl-foot` / `.mkl-cta` | sticky footer + compare CTA | states copied from `.vgl-tray__cta`: disabled `--graphite-100`/`--graphite-500`/`--graphite-300`; ready `--teal-100`/`--teal`; hover solid `--teal` |
| `.mkl-empty` | empty state | icon `--graphite-300`, title `--text-h4`, body `--text-body-sm` `--text-muted` |
| `.mkl-toast` | toast with action | bg `--schwarz`, text `--white`, action `--teal-mint`, `--r-l`, `--shadow-lg`, z 970, bottom offset `6.5rem` when the compare tray is open |
| `.mkl-live` | SR-only live region | same clip pattern as `.vgl-visually-hidden` |

**Responsive rules.** Base (mobile-first): drawer `inset:0`; rows stack (media left, text right, actions as a full-width row: CTA full width, Vergleichen + Entfernen beneath); footer sticky with safe-area padding; bookmark stays 2.25 rem. `@media (min-width: 48rem)`: drawer 28 rem right-anchored with scrim; row grid `4.5rem 1fr auto`; CTA 2.25 rem high inline. Header: on the mobile bar the Merkliste control replaces nothing — it sits left of the cart icon at 2 rem glyph / 2.75 rem hit area. Overlay bookmark: hidden in `.is-compact`, 2 rem otherwise; 1.75 rem below 48 rem.

**Acceptance checklist** (front-end, verifiable).

1. Every `.pcard[data-id]` on both PLPs shows a bookmark at rest, top-right of `.pcard__media`, without compare mode active.
2. Clicking the bookmark toggles `aria-pressed`, the filled state, the header badge count and writes `mtz_merkliste` (`v:1`, `items[]`, `updatedAt` ISO) to `localStorage`.
3. Reloading the page restores bookmarks and badge from `localStorage`; opening a new tab shows the same list.
4. Bookmark hit area measures ≥ 2.75 rem × 2.75 rem (DevTools box); visual disc 2.25 rem.
5. Activating/cancelling compare mode changes no bookmark state; compare checkboxes remain hidden until the toolbar button is pressed.
6. Header control opens the drawer; focus lands on the title; Tab cycles inside; Escape closes and focus returns to the header control.
7. Drawer rows show model-first name + qualifier, "ab"-price, and exactly one CTA reading "Konfigurieren" or "Zum Produkt"; the string "In den Warenkorb" does not occur in `merkliste.js`/`.css`.
8. A configured item (seed one in the demo data) shows ≥ 1 config summary line, "Gesamt"-price and "Konfiguration öffnen" linking to `?configId=…`.
9. "Auswahl vergleichen (n)" is disabled at n < 2 with the hint text; enabled at 2–4; a 5th checkbox is disabled and a toast shows the cap copy.
10. Checking a row of another category disables the remaining rows of that category with the "nur innerhalb einer Kategorie" hint.
11. Clicking "Auswahl vergleichen (3)" closes the drawer, adds `body.vgl-mode`, shows the tray with 3 slots and opens the compare overlay with those 3 columns; closing the overlay leaves the PLP in compare mode with the 3 cards marked.
12. The overlay's product columns each show a bookmark whose state matches the PLP card; toggling it updates the header badge.
13. "Entfernen" shows a toast with "Rückgängig" for 5 s; undo restores the row at its previous position.
14. "Alle entfernen" asks for confirmation inline, then clears the list and offers a single undo.
15. At 50 items unselected bookmarks are `aria-disabled` and show the limit toast; gemerkt bookmarks still remove.
16. Empty state shows icon, title, body and "Zurück zu {Kategorie}" matching `MTZ_LENS`.
17. Mobile 375 px: drawer is full-screen, no horizontal page scroll (`document.documentElement.scrollWidth === clientWidth`), footer CTA visible without scrolling.
18. With `prefers-reduced-motion: reduce` no transform/opacity animation runs (check computed `transition`/`animation` = none).
19. Contrast (DevTools): bookmark glyph ≥ 3:1, all drawer text ≥ 4.5:1, disabled CTA text exempt but present.
20. With `localStorage` blocked (Chrome "Block third-party/site data"), bookmarks still work for the session and the drawer shows the storage notice; no console error.
21. No class starting with `vgl-` is added or changed by `merkliste.js`; the only change to `vergleichen.js` is the exported `window.MTZ_VGL.compare(ids)` hook plus the `?vergleich=` reader.

---

## 9 · JTL integration notes

- **Guest layer.** `localStorage['mtz_merkliste']` = `{ v: 1, updatedAt: ISO, items: [{ id, articleId, lens, name, url, img, priceFrom, variant?: { farbe }, configId?, configSummary?: [{ label, value }], configTotal?, addedAt, priceAtAdd }] }`. Items identified by `id` (`articleId` for plain products, `'cfg:' + configId` for builds). Migrations keyed on `v`.
- **Account merge (plugin).** On login, POST the guest items; server unions plain `articleId`s into the native Wunschliste (`tWunschliste`/`tWunschlistePos`) and configured items into a plugin table `plugin_mtz_merkliste_cfg (kKunde, configId, snapshot JSON, addedAt)`; respond with the merged list; client overwrites `localStorage`. Never delete, never replace. Logged-in sessions keep writing through the same client API, with the server as source of truth.
- **Naming.** Rename the Sprachvariablen `wishlist*` ("Wunschzettel"/"Wunschliste") → "Merkliste", "Merken", "Gemerkt", "Zur Merkliste". Route `/merkliste` (alias of the native wishlist page, template overridden by the plugin to the §4 layout, guest-accessible). Keep **`/favoriten` = Vergleichsliste** and relabel its header stub "Vergleichsliste"; hide it once Version B replaces the native compare.
- **Product data for rows.** `name`, `img`, `priceFrom`, `konfig` flag and `lens` come from the article (`kArtikel`, category); configuration summaries come from the configurator's own `configId` store, not from Merkmale (Phase-0 §3.4: engraving and build state are JTL Eigenschaften/order-level data).
- **Compare bridge.** `/merkliste` builds `?vergleich=id,id` for the category PLP (or the Version B overlay route) — same parameter the audit already proposed for compare share links.
- **Consent.** `localStorage` for the Merkliste is strictly necessary (customer-initiated storage, no tracking); document it in the Datenschutz/Cookie page; show the §4 notice if storage is unavailable.
