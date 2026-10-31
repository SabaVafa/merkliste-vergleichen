# 07b — Merkliste auf der Produktdetailseite · Interface-Design

Datum: 2026-10-31 · Rolle: Lead Product Design (UI) · Scope: `Deliverables/vergleichen-flow-B/pdp/index.html` (Version B, Inline-Konfiguration)
Grundlage: `merkliste.css|js` (v4, bleibt im Look unverändert), `05_Merkliste_Flow_und_Interface.md` §2 (PDP-Zeile wird durch dieses Dokument ersetzt), `06_Flow-Audit_Umsetzung.md`. Alle Maße am laufenden Prototyp gemessen (1440 × 900 und 375 × 812, `getBoundingClientRect`).
Wann welches Label gilt („Merken" / „Gemerkt" / „Konfiguration merken" / „Konfiguration gemerkt") definiert der UX-Lead; hier steht, wie jeder Zustand aussieht.

---

## 1 · Entscheidung

1. **Ein primärer Ort: eine eigene Sekundärzeile direkt unter der Kaufzeile** (`.cfgb-buyrow` → neue `.mkl-pdp-row` in `#bCheckout`). Merken ist die Alternative zu „In den Warenkorb" — die Entscheidung fällt genau dort, und nur dort ist der Konfigurationsstand bekannt.
2. **Anatomie: Ghost-Button mit Lesezeichen-Glyph + Label** (`.mkl-pdp-save`, 2,75 rem hoch, Hairline `--graphite-300`, Ink `--schwarz`, 0,875 rem / 600). Kein `.btn--secondary` (teal Outline) — zwei teal Buttons übereinander würden mit dem CTA konkurrieren.
3. **Gemerkt = gefülltes Glyph in `--teal`, Rahmen `--teal`, Label teal** — dieselbe Sprache wie auf der PLP-Karte (nacktes Glyph, Kundenentscheid), nur mit Text.
4. **Echo in der Sticky-Bar**: Icon-only 2,75 rem links von „Details" (Desktop) bzw. links vom CTA (Mobile); unter 30 rem weicht das dekorative Thumbnail dem Echo.
5. **Bestätigungszeile** „Konfiguration gemerkt · Zur Merkliste" sitzt in derselben Sekundärzeile rechts neben dem Button (Mobile: darunter) — kein zweiter Ort unter dem Preis.
6. **Ankunftsband** „Gespeicherte Konfiguration vom {Datum}" steht als erstes Kind **in** `.pdp-price--lead`, über dem Angebotslabel, denn es erklärt den vorbelegten Preis.
7. **Header + Drawer unverändert**; Toast bodenzentriert, oberhalb der sichtbaren Sticky-Bar (`--mkl-pdp-bar-h`).
8. **Keine Kontrolle auf Titelzeile, Galerie oder neben dem Preis** — Begründung in §2.

## 2 · Placement-Bewertung

Gemessen (1440): Titel-/Bewertungszeile y 353, h 25 (Teilen-Button nur 24,8 px hoch); Galerie 580 × 580, Toggle oben links; Preisblock y 491–638 mit Angebotspill oben rechts (x 1147); CTA y 796 (vor Farbwahl „Bitte Farbe wählen") bzw. y 1483 nach Farbwahl (Schritte 388 px dazwischen); Sticky-Bar 74 px, erscheint, sobald der CTA aus dem Viewport ist — auf dem Phone also schon bei Ankunft (CTA bei y 1344 > 812).

| Ort | Sichtbarkeit | Nähe zur Entscheidung | Konflikt mit CTA | Mobile (375) | Urteil |
|---|---|---|---|---|---|
| **a** Titel-/Bewertungszeile (neben „Produkt teilen") | Hoch, über der Falz | Gering: 440 px (vor Farbwahl) bis 1 130 px (nach Farbwahl) über dem CTA; Konfigurationsstand dort nicht lesbar | Keiner | Zeile ist 44 px hoch, Platz vorhanden; aber 2 Bildschirme vom CTA entfernt | Nein — „Konfiguration merken" neben dem Titel wäre ortsfremd (Otto/Zalando-Muster passt zu Mode, nicht zur Konfiguration) |
| **b** Galerie, oben rechts im Bild | Hoch; PLP-Kontinuität | Gering; Galerie-Spalte ist sticky, Kontrolle würde über dem Produktbild „schweben" | Keiner | Bild 327 × 315, Ecke frei | Nein — Control-on-Image liest sich auf der PDP als Bildaktion (Zoom/3D), kein Platz für Label oder Bestätigungszeile |
| **c** Preisblock, neben dem Betrag | Hoch | Hoch | Angebotspill belegt die rechte Seite der Preiszeile; Betrag 2 rem muss frei scannbar bleiben | Pill umbricht, Zeile wird dreiteilig | Nein — Preis bleibt Preis (Apple/Miele halten den Preisblock kontrollfrei) |
| **d** Sekundärzeile unter „In den Warenkorb" | Mittel: an der Falz (y 844) vor Farbwahl, nach Farbwahl unter der Falz — das Echo (e) deckt das ab | **Maximal**: dieselbe Entscheidung, derselbe Konfigurationsstand | Gering bei Ghost-Grammatik; der solide teal CTA bleibt allein dominant | Kaufzeile ist voll (Stepper 123 + CTA 194 px); eigene Zeile darunter umbricht sauber | **Ja — primär** (Miele/Ikea: „Merken"-Zeile unter dem Kauf-CTA) |
| **e** Sticky-Bar | Nur wenn der CTA außer Sicht ist — d. h. beim Lesen der langen Seite und auf dem Phone ab Ankunft | Hoch (Bar = Kaufentscheidung in Kurzform) | CTA 186 × 44, Bar hat 562 px Luft (Desktop) | Eng: Thumb 48 + Info + CTA 170; Thumb weicht < 30 rem | **Ja — Echo**, nicht primär (Zalando/Otto führen das Herz in der Sticky-Bar mit) |

## 3 · Komponenten-Spec

### 3.1 Voraussetzungen (Prototyp)

- `merkliste.css|js` auf der PDP einbinden; `merkliste.js` wartet auf `window.MTZ_PRODUCTS` — die PDP liefert ein Array mit dem Artikel je Farbe (`id` = `data-article` des Swatches, `name`, `price`, `img`) und `window.MTZ_LENS = 'sprechanlage'`.
- **Token-Aliasse**: die PDP-Kopie von `Home/styles-v2.css` kennt nur `--color-*`; `--teal`, `--schwarz`, `--paper-white`, `--teal-100`, `--graphite-*`, `--white`, `--teal-mint`, `--green`, `--red-default` sind leer (gemessen). `merkliste.css` fällt dann auf seine Hex-Fallbacks zurück — funktioniert, umgeht aber das Design-System. Deshalb ein Alias-Block in `mkl-pdp.css` (keine neuen Werte, nur Verweise):

```css
/* mkl-pdp.css — Aliasse auf die DS-Tokens der PDP (keine Rohwerte) */
:root{
  --teal:var(--color-teal);--teal-600:var(--color-teal-600);--teal-100:var(--color-teal-100);
  --teal-mint:var(--color-mint);--schwarz:var(--color-digital-black);--white:var(--color-white);
  --paper-white:var(--color-paper);--graphite-100:var(--color-graphite-100);--graphite-200:var(--color-graphite-200);
  --graphite-300:var(--color-graphite-300);--graphite-500:var(--color-graphite-500);
  --green:var(--color-green);--red-default:var(--color-red-600);--star:var(--color-star);
}
```

### 3.2 Markup-Skelett (Buybox)

Einfügen als Kind von `#bCheckout` **direkt nach** `.cfgb-buyrow` (vor dem Trusted-Shops-Slot `.ts-sig[data-pos=cta]`):

```html
<div class="mkl-pdp-row" id="mklPdpRow">
  <button class="mkl-pdp-save" type="button" id="mklPdpSave"
          data-mkl-id="31101" aria-pressed="false"
          aria-label="Metzler VDM10 2.0 merken" title="Merken">
    <span class="mkl-pdp-save__glyph" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/></svg>
    </span>
    <span class="mkl-pdp-save__label">Merken</span>
  </button>
  <p class="mkl-pdp-note" id="mklPdpNote" hidden>
    Konfiguration gemerkt · <a href="#merkliste" data-mkl="open">Zur Merkliste</a>
  </p>
</div>
```

Label-Varianten (Text vom UX-Lead): `Merken` · `Gemerkt` · `Konfiguration merken` · `Konfiguration gemerkt`. `aria-label` wie auf der PLP: „{Modell} merken" / „{Modell} aus der Merkliste entfernen"; `title` „Merken" / „Gemerkt — aus der Merkliste entfernen". Die Zustandsklassen sind dieselben wie bei `.mkl-mark` (`is-on`, `is-pressed`, `is-limit`), damit `syncHeart()` sie ohne zweite Logik setzen kann.

### 3.3 CSS — Zeile, Button, alle Zustände

```css
/* ---- Sekundärzeile unter der Kaufzeile ----
   #bCheckout stapelt mit gap 1.6rem (pdp-b.css:622); die Zeile zieht sich auf 0.75rem an den CTA heran. */
.mkl-pdp-row{display:flex;align-items:center;flex-wrap:wrap;gap:var(--sp-2) var(--sp-4);
  margin-top:calc(var(--sp-3) - 1.6rem);min-width:0}

/* ---- Merken-Button (Ghost) ---- */
.mkl-pdp-save{position:relative;display:inline-flex;align-items:center;gap:var(--sp-2);
  height:2.75rem;min-height:2.75rem;padding:0 var(--sp-4) 0 var(--sp-3);
  border:.0625rem solid var(--graphite-300);border-radius:var(--r-m);
  background:var(--white);color:var(--schwarz);
  font-family:inherit;font-size:var(--text-body-sm);font-weight:600;line-height:1;white-space:nowrap;
  cursor:pointer;-webkit-tap-highlight-color:transparent;
  transition:border-color .15s,background .15s,color .15s}
.mkl-pdp-save__glyph{display:flex;width:1.5rem;height:1.5rem;flex-shrink:0;transition:transform .12s}
.mkl-pdp-save svg{width:1.5rem;height:1.5rem;display:block}
.mkl-pdp-save svg path{fill:none;stroke:currentColor;stroke-width:1.75;stroke-linejoin:round;transition:fill .15s}
.mkl-pdp-save__label{min-width:3.5rem;text-align:left}          /* „Merken" → „Gemerkt" ohne Sprung der Zeile */

/* Rest: siehe Basisregel. Hover / Fokus: teal Ink, Hairline teal, Fläche --teal-5 */
.mkl-pdp-save:hover{border-color:var(--teal);color:var(--teal);background:var(--teal-5)}
.mkl-pdp-save:focus-visible{outline:.1875rem solid var(--teal);outline-offset:.125rem}
/* Pressed: 120 ms Scale nur auf dem Glyph (wie .mkl-mark__disc auf der PLP) */
.mkl-pdp-save.is-pressed .mkl-pdp-save__glyph{transform:scale(.9)}
/* Gemerkt: gefülltes Glyph, Rahmen und Label teal; Fläche bleibt weiß (ruhig neben dem soliden CTA) */
.mkl-pdp-save.is-on{border-color:var(--teal);color:var(--teal)}
.mkl-pdp-save.is-on svg path{fill:currentColor}
.mkl-pdp-save.is-on:hover{background:var(--teal-5)}
/* Limit (50 erreicht, nicht gemerkt): inert per aria-disabled, weiterhin fokussierbar und angesagt */
.mkl-pdp-save.is-limit{color:var(--text-muted);border-color:var(--graphite-300);background:var(--white);opacity:.6;cursor:not-allowed}
/* Disabled (z. B. Wunschfarbe ohne RAL-Ton; UX-Lead entscheidet, ob Merken dann gesperrt ist) */
.mkl-pdp-save[disabled],.mkl-pdp-save[aria-disabled="true"]:not(.is-limit){
  color:var(--graphite-500);border-color:var(--graphite-200);background:var(--graphite-100);cursor:not-allowed}
.mkl-pdp-save[disabled] svg path{stroke:currentColor}

/* Bestätigungszeile: Caption, gedämpft, Link teal; mindestens 2.75rem Trefferhöhe für den Link */
.mkl-pdp-note{margin:0;flex:1 1 12rem;min-width:0;font-size:var(--text-caption);line-height:1.45;color:var(--text-muted);
  opacity:0;transition:opacity .15s}
.mkl-pdp-note:not([hidden]){opacity:1}
.mkl-pdp-note[hidden]{display:none}
.mkl-pdp-note a{display:inline-block;padding:.5rem 0;margin:-.5rem 0;color:var(--teal);font-weight:600;text-decoration:underline}
.mkl-pdp-note a:focus-visible{outline:.1875rem solid var(--teal);outline-offset:.125rem;border-radius:var(--r-s)}
```

Kontraste (auf `--white`): `--schwarz` 17:1, `--teal` 9,0:1, `--text-muted` 5,4:1, Hairline `--graphite-300` 1,5:1 ist nur Dekor — die Form trägt das 1,5 rem-Glyph (teal 9,0:1 bzw. schwarz 17:1, UI-Kontrast ≥ 3:1 erfüllt). Disabled-Zustände sind von 1.4.3/1.4.11 ausgenommen.

### 3.4 Zustandsmatrix

| Zustand | Glyph | Rahmen | Label / Ink | Fläche | Sonstiges |
|---|---|---|---|---|---|
| Rest | Outline, Stroke 1,75 | `--graphite-300` | `--schwarz`, 0,875 rem / 600 | `--white` | `aria-pressed="false"` |
| Hover | Outline | `--teal` | `--teal` | `--teal-5` | Cursor pointer |
| Focus-visible | wie Hover | — | — | — | Ring 0,1875 rem `--teal`, Offset 0,125 rem (DS-Ring) |
| Pressed (120 ms) | scale(.9) | — | — | — | nur das Glyph skaliert; Klasse `is-pressed` wird nach 120 ms entfernt |
| Gemerkt | **gefüllt** `--teal` | `--teal` | `--teal` | `--white` (Hover `--teal-5`) | `aria-pressed="true"`, Label-Wechsel, Bestätigungszeile sichtbar |
| Limit | Outline | `--graphite-300` | `--text-muted`, Opacity .6 | `--white` | `aria-disabled="true"`, Klick → Limit-Toast mit „Zur Merkliste" |
| Disabled | Outline | `--graphite-200` | `--graphite-500` | `--graphite-100` | `disabled`; Grund steht in der Konfiguration („Bitte RAL-Farbe wählen"), kein eigener Hinweis |

### 3.5 Abstände zu den Nachbarn

- Oberkante Button ↔ Unterkante Kaufzeile: **0,75 rem** (`--sp-3`); linke Kante bündig mit dem Mengen-Stepper (x 744 Desktop / x 24 Mobile).
- Button ↔ Bestätigungszeile: `--sp-4` horizontal; Umbruch → `--sp-2` vertikal.
- Unterkante Zeile ↔ Trusted-Shops-Slot / Liefertabelle: der Checkout-Gap 1,6 rem bleibt (keine Änderung an `.cfgb-checkout`).
- Breite: `inline-flex` (hugging). „Merken" ≈ 7,25 rem, „Konfiguration gemerkt" ≈ 13 rem — passt einzeilig in 327 px; **keine** Zweizeiler nötig.

### 3.6 Variante „gespeicherter Build" (optional, zweizeilig)

Nur wenn der UX-Lead die Kurzfassung der Konfiguration **auf** dem Button will (sonst steht sie im Drawer):

```html
<button class="mkl-pdp-save mkl-pdp-save--build is-on" …>
  <span class="mkl-pdp-save__glyph" aria-hidden="true">…</span>
  <span class="mkl-pdp-save__text">
    <span class="mkl-pdp-save__label">Konfiguration gemerkt</span>
    <span class="mkl-pdp-save__sub">Anthrazit · 2 Klingeltaster · Gravur · Gesamt 1.249,00 €</span>
  </span>
</button>
```

```css
.mkl-pdp-save--build{height:auto;min-height:3rem;padding:var(--sp-2) var(--sp-4) var(--sp-2) var(--sp-3);align-items:flex-start;white-space:normal}
.mkl-pdp-save--build .mkl-pdp-save__glyph{margin-top:.0625rem}
.mkl-pdp-save__text{display:flex;flex-direction:column;gap:.125rem;min-width:0;text-align:left}
.mkl-pdp-save__sub{font-size:var(--text-caption);font-weight:400;line-height:1.35;color:var(--text-muted);overflow-wrap:anywhere}
.mkl-pdp-save--build.is-on .mkl-pdp-save__sub{color:var(--text-muted)}   /* Subzeile bleibt gedämpft, nur Label + Glyph sind teal */
```

## 4 · Saved-build-Affordanz und Ankunftsband

### 4.1 Nach „Konfiguration merken" (auf der Seite)

1. Button → `is-on`, Label „Konfiguration gemerkt" (bzw. „Gemerkt").
2. `.mkl-pdp-note` wird eingeblendet (Opacity 0 → 1, 150 ms): „Konfiguration gemerkt · **Zur Merkliste**" — der Link öffnet `#mklDrawer` (`MTZ_MKL.open()`), Fokus landet auf dem Drawer-Titel wie gehabt.
3. Toast (dark, ein Link `--teal-mint`): „Konfiguration gemerkt" · „Zur Merkliste" — Position §6.
4. Header-Badge pulst (bestehende `mklpulse`), Live-Region „Gemerkt: {Modell}. Merkliste: n Artikel".
5. Toggle aus → Note `hidden`, Toast „Aus der Merkliste entfernt · Rückgängig"; Rückgängig stellt Note und Zustand wieder her.
6. Sticky-Echo (§5) spiegelt `is-on` sofort (dieselbe `data-mkl-id`).

Die Note zeigt bei einem Modell ohne Konfiguration „Gemerkt · Zur Merkliste"; Wortlaut vom UX-Lead, Platz ist derselbe.

### 4.2 Ankunft über „Konfiguration öffnen" (`?configId=…`)

Band als **erstes Kind von `.pdp-price--lead`**, vor `.pdp-offer`; `.pdp-price--lead` ist `flex-column; align-items:flex-start` → das Band streckt sich selbst. Die Preiszeile zeigt dann „Preis wie konfiguriert" (`.cfgb-price__label` wird von der PDP eingeblendet) und `#bTotal` den Gesamtpreis.

```html
<div class="mkl-pdp-band" id="mklPdpBand" role="status">
  <span class="mkl-pdp-band__glyph" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/></svg>
  </span>
  <div class="mkl-pdp-band__text">
    <span class="mkl-pdp-band__title">Gespeicherte Konfiguration vom 12.10.2026</span>
    <span class="mkl-pdp-band__sub">Farbe: Anthrazit · Klingeltaster: 2 · Gravur: Familie Maier</span>
  </div>
  <button class="mkl-pdp-band__act" type="button" data-mkl="reconfigure">Neu konfigurieren</button>
</div>
```

```css
.mkl-pdp-band{align-self:stretch;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;
  gap:var(--sp-3);margin:0 0 var(--sp-3);padding:var(--sp-3) var(--sp-4);
  border-radius:var(--r-m);background:var(--teal-100);color:var(--schwarz)}
.mkl-pdp-band__glyph{display:flex;width:1.25rem;height:1.25rem;color:var(--teal)}
.mkl-pdp-band__glyph svg{width:1.25rem;height:1.25rem}
.mkl-pdp-band__glyph svg path{fill:currentColor;stroke:currentColor;stroke-width:1.75;stroke-linejoin:round}
.mkl-pdp-band__text{display:flex;flex-direction:column;gap:.125rem;min-width:0}
.mkl-pdp-band__title{font-size:var(--text-body-sm);font-weight:700;line-height:1.35}
.mkl-pdp-band__sub{font-size:var(--text-caption);line-height:1.4;color:var(--text-muted);overflow-wrap:anywhere}
.mkl-pdp-band__act{min-height:2.75rem;margin:-.5rem 0;padding:0 var(--sp-2);border:0;background:none;
  color:var(--teal);font-family:inherit;font-size:var(--text-body-sm);font-weight:600;text-decoration:underline;white-space:nowrap;cursor:pointer}
.mkl-pdp-band__act:hover{color:var(--teal-600)}
.mkl-pdp-band__act:focus-visible{outline:.1875rem solid var(--teal);outline-offset:.125rem;border-radius:var(--r-s)}
@media(max-width:47.99rem){
  .mkl-pdp-band{grid-template-columns:auto minmax(0,1fr)}
  .mkl-pdp-band__act{grid-column:2;justify-self:start;margin:0 0 -.5rem -.5rem}
}
```

Kontraste auf `--teal-100` (#E6EEEE): `--schwarz` 15:1, `--teal` 7,6:1, `--text-muted` 4,6:1 — alle AA. Das Band ist bewusst **ohne Rahmen und ohne Icon-Disc** (ruhige Tönung wie der Drawer-Tag „Ihre Konfiguration"). Abstand Band ↔ Angebotspill: `--sp-3`; Band ↔ Spezifikationsliste darüber: der Buybox-Gap 2 rem bleibt. „Neu konfigurieren" setzt die Schritte zurück, entfernt das Band (Fade 150 ms) und lässt den Merklisten-Eintrag unverändert; der Button in §3 steht danach auf Rest. Abgelaufene Konfiguration: Titel „Konfiguration abgelaufen — Zusammenfassung siehe Merkliste", Aktion „Konfigurieren" (Text vom UX-Lead, Layout identisch).

## 5 · Sticky-Bar

Gemessen (1440, `#pdpStickyBar.is-visible`): Höhe 74 px; Thumb 3 rem bei x 100 · Info 265 px · „Details" 101 × 44 bei x 1010 (`margin-left:auto`) · CTA 186 × 44 bei x 1139; innerer Gap 1,1 rem. Die Bar ist `inert` + `aria-hidden`, solange sie versteckt ist — das Echo erbt das automatisch.

**Markup**: Echo **vor** `#bStickyDetails` einfügen:

```html
<button class="mkl-pdp-save mkl-pdp-save--icon mkl-pdp-bar" type="button" id="mklPdpBar"
        data-mkl-id="31101" aria-pressed="false" aria-label="Metzler VDM10 2.0 merken" title="Merken">
  <span class="mkl-pdp-save__glyph" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/></svg></span>
  <span class="mkl-pdp-save__label mkl-pdp-sr">Merken</span>
</button>
```

```css
/* Icon-only: 2.75rem Quadrat, Label nur für Screenreader */
.mkl-pdp-save--icon{width:2.75rem;padding:0;justify-content:center;gap:0}
.mkl-pdp-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;min-width:0}
/* Reihenfolge Desktop: Thumb · Info · [auto] · Lesezeichen · Details · CTA */
#pdpStickyBar .mkl-pdp-bar{margin-left:auto;flex-shrink:0}
#pdpStickyBar .pdp-stickybar__details{margin-left:0}
/* ≤ 56.25rem: „Details" wird zum Chevron-Griff (absolut, oben Mitte) → Thumb · Info · Lesezeichen · CTA */
@media(max-width:56.25rem){
  #pdpStickyBar .mkl-pdp-bar{margin-left:0}
}
/* < 30rem: das dekorative Thumbnail weicht dem Lesezeichen (Info behält ≥ 6.5rem für Name + Preis) */
@media(max-width:29.99rem){
  #pdpStickyBar .pdp-stickybar__thumb{display:none}
}
```

Rechnung 375 px: 16 + 44 (Echo) + 9,6 + Info + 9,6 + 170 (CTA) + 16 → Info ≈ 110 px; Name ellipsiert (bereits `nowrap/ellipsis`), Preis „ab 699,00 €" bleibt ganz. Mit Thumb wären es 52 px — zu wenig. Das Echo hat in der Bar dieselben Zustände wie §3.4 (Hover `--teal-5`, Gemerkt gefüllt teal); Limit und Disabled ebenfalls gespiegelt. Kein Label-Wechsel sichtbar — nur `aria-pressed`, `aria-label`, `title`.

## 6 · Toast-Position auf der PDP

`.mkl-toast` bleibt fixed, bodenzentriert, `bottom:1.5rem`, z 970 (über Sheet z 400 und Sticky-Bar z 300). Ist die Sticky-Bar sichtbar, rückt der Toast über sie:

```css
.mkl-toast.is-pdp-bar{bottom:calc(var(--mkl-pdp-bar-h,4.625rem) + 1rem + env(safe-area-inset-bottom,0px))}
```

Regel: `--mkl-pdp-bar-h` = `#pdpStickyBar.offsetHeight / 16` rem, gesetzt, wenn `#pdpStickyBar.is-visible` (Desktop 4,625 rem → Toast-Unterkante bei 5,625 rem; Mobile ≈ 6,9 rem). Die Klasse wird beim Anzeigen gesetzt und per `MutationObserver` auf `#pdpStickyBar`-`class` nachgeführt, solange der Toast steht (Bar verschwindet beim Zurückscrollen → Toast sinkt auf 1,5 rem, Übergang `bottom .2s`). Bei offenem Preis-Sheet (`body.cfg-sheet-open`) ist die Bar weggeschoben → Standard 1,5 rem. Im offenen Drawer gilt weiterhin die 06-Regel (Toast im Dialog, über dem Footer). Der Trusted-Shops-Float (`.ts-float`, fixed rechts unten, z 60) liegt rechts außen — der Toast (max 30 rem, zentriert) berührt ihn ab 1 024 px nicht; darunter ist der Float ohnehin `display:none`.

## 7 · Mobile (375 × 812)

- **Reihenfolge**: Titel · Bewertung/Teilen (44 px) · Galerie 327 × 315 · Thumbs · Buybox (Spezifikationen y 779, Preis y 949, Farbe y 1183, CTA y 1344 vor Farbwahl / y 2178 danach).
- **Kontrolle**: dieselbe Sekundärzeile unter dem CTA, linksbündig bei x 24; Bestätigungszeile umbricht darunter (`flex-basis:12rem`). Daumenerreichbarkeit kommt **nicht** aus der Buybox, sondern aus dem Echo: die Bar ist ab Ankunft sichtbar (CTA unter der Falz), das Lesezeichen liegt direkt links vom CTA in der rechten Daumenzone.
- **Header**: `.icon-btn` 48 × 48, Gap 0, `margin-right:-13px`; mit drei Icons beginnt die Gruppe bei x 220 — exakt an der rechten Logokante (Logo 113 px, endet x 220; auf der PLP gemessen, identisches Markup). Keine Kollision, kein Sonderfall.
- **Drawer**: `inset:0`, Vollbild, Body-Scroll gesperrt, Toast im Dialog — alles bestehend.
- **Band**: Aktion „Neu konfigurieren" rutscht unter den Text (Grid-Spalte 2), 2,75 rem hoch.
- **Touch**: `@media(pointer:coarse)` ändert nichts — alle Ziele sind bereits 2,75 rem; Links in Note und Band tragen 0,5 rem vertikales Padding.

## 8 · Motion und Reduced Motion

| Moment | Bewegung | Dauer |
|---|---|---|
| Pressed | Glyph `scale(.9)` und zurück | 120 ms (Klasse `is-pressed`, JS-Timer wie PLP) |
| Gemerkt | `fill` none → `currentColor`, Rahmen/Ink → teal | 150 ms |
| Bestätigungszeile | Opacity 0 → 1 | 150 ms |
| Header-Badge | `mklpulse` 1 → 1,25 → 1 | 180 ms (bestehend) |
| Toast | Opacity + 0,75 rem Rise; `bottom` beim Bar-Wechsel | 200 ms |
| Ankunftsband | keine Einblendung — steht bei Seitenaufbau; nur Ausblenden bei „Neu konfigurieren" (Opacity) | 150 ms |

```css
@media(prefers-reduced-motion:reduce){
  .mkl-pdp-save,.mkl-pdp-save__glyph,.mkl-pdp-save svg path,.mkl-pdp-note,.mkl-pdp-band,.mkl-toast.is-pdp-bar{transition:none !important;animation:none !important}
  .mkl-pdp-save.is-pressed .mkl-pdp-save__glyph{transform:none}
}
@media print{.mkl-pdp-row,.mkl-pdp-bar{display:none !important}}   /* das Band darf drucken: es beschreibt den Zustand der Seite */
```

Kein Konfetti, kein Pulsieren des Buttons selbst — der gefüllte Glyph **ist** die Bestätigung (Premium-Haltung wie Apple/Miele).

## 9 · Checkliste für den Entwickler

1. `getBoundingClientRect(#mklPdpSave)`: Höhe **44 px**, Oberkante = Unterkante `.cfgb-buyrow` + **12 px**, linke Kante = linke Kante `.cfgb-buyrow` (744 / 24).
2. `getComputedStyle(#mklPdpSave)`: `font-size 14px`, `font-weight 600`, `border 1px solid #DADADA`, `border-radius 4px`; Glyph `24 × 24`, `stroke-width 1.75`, `fill none`; `is-on` → `fill #015253`, `border-color #015253`, `color #015253`.
3. Token-Aliasse greifen: `getComputedStyle(document.documentElement).getPropertyValue('--teal')` ≠ leer; keine Hex-Fallbacks in Benutzung (DevTools → Computed).
4. `merkliste.js`: `syncHearts()` muss `.mkl-pdp-save[data-mkl-id]` einschließen (Selector-Erweiterung, keine Logikänderung); Label-Text im `is-on`-Fall setzt der UX-Lead-Hook, nicht `syncHeart`.
5. Fokus-Reihenfolge: Mengen-Stepper → „In den Warenkorb" → Merken → „Zur Merkliste" (Note) → Trusted-Shops-Slot; Fokusring 3 px `#015253`, Offset 2 px, auf allen vier Controls sichtbar.
6. Sticky-Bar: Echo 44 × 44 links von „Details" (Desktop) bzw. links vom CTA (≤ 900 px); bei 375 px ist `.pdp-stickybar__thumb` `display:none`, `.pdp-stickybar__info` ≥ 100 px breit, CTA-Rechtskante ≤ 359 px, kein horizontaler Scroll.
7. Bar versteckt → Echo nicht in der Tab-Reihenfolge (`inert` der Bar erbt); Bar sichtbar → `aria-pressed` beider Controls identisch nach jedem Toggle (Buybox ↔ Bar).
8. Toast: bei sichtbarer Bar Unterkante **90 px** über dem Viewport-Boden (1440: 74 + 16), bei versteckter Bar 24 px; Toast liegt vollständig über der Bar (kein Überlappen des CTA), z-index 970 > 300.
9. Ankunftsband: erstes Kind von `.pdp-price--lead`, volle Buybox-Breite (580 / 327 px), Hintergrund `#E6EEEE`, 12 px Abstand zur Angebotspill; „Neu konfigurieren" min-height 44 px; Kontraste 15 / 7,6 / 4,6:1.
10. Limit (50 Einträge seeden): Button `aria-disabled="true"`, Opacity .6, Klick → Limit-Toast mit „Zur Merkliste", kein Zustandswechsel; gemerkte Einträge lassen sich weiterhin abwählen.
11. Disabled-Fall (Wunschfarbe ohne RAL, falls UX-Lead sperrt): `disabled`, Hintergrund `#F0F0F0`, Ink `#A1A1A1`; nach RAL-Wahl wieder Rest — ohne Reload.
12. Header: `.mkl-hdr` zwischen „Mein Konto" und „Warenkorb" (Desktop x 1225, 52 × 52, Gap 8 px; Mobile x 268, 48 × 48), Badge `is-zero` bei 0, Pulse 180 ms.
13. `prefers-reduced-motion: reduce`: keine Scale-, Fill- und Opacity-Transitions (DevTools → Rendering → emulate), Drawer ohne Slide.
14. Keine Konsolenfehler; `MTZ_PRODUCTS` enthält jede Farbvariante (`31101`–`31108`), damit der Farbwechsel die `data-mkl-id` beider Controls nachführt.
