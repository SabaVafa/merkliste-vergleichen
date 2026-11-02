# 10 — PDP „Merken“: Benchmark und Build-Spec für das Lesezeichen in der Galerie

Datum: 2026-11-02 · Rolle: Lead Product Design · Scope: `.pdp-media__stage > .mkl-pdp-media` und Sticky-Echo `#pdpStickyBar .mkl-pdp-bar` in `Deliverables/vergleichen-flow-B/pdp/index.html` (`merkliste.js?v=13`, `merkliste-pdp.css?v=15`)
Grundlage: `09a_Wettbewerb_Merken-Vergleichen_Research.md` (+ `09a_research-data.json`, `09_assets/`), `08_PDP-Merken_Positionierung.md`, `09_Adaption_Umsetzung.md` §5–§9.

**Feste Regeln (Kunde):** Position oben rechts auf der Galerie, gegenüber „Fotos | 3D“ · Lesezeichen, nie Herz · immer nur eine Instanz sichtbar · „Sie“ · Wortschatz „Merken / Gemerkt / Konfiguration merken / Merkliste“ · nur Metzler-DS-Tokens, rem · WCAG 2.1 AA · `prefers-reduced-motion` · kein neues „In den Warenkorb“.

**Kennzeichnung:** **[B]** = am 2026-11-02 live beobachtet bzw. gemessen (Gast, nur notwendige Cookies, ohne Anmeldung und ohne Formulare; Test-Merkungen danach wieder entfernt) · **[09a]** = beobachtet am 2026-10-31, aus 09a übernommen · **[R]** = berichtet oder Vorkenntnis, am 2026-11-02 nicht live geprüft.
Screenshots: `Deliverables/10_assets/` — `01` Zalando Desktop · `02` Zalando mobil · `03` OTTO Galerie-Herz mit Snackbar · `04` IKEA Toast · `05` Apple „Sichern“ · `06` Vitra Konfigurator · `07` Manufactum · `08` METZLER Ist Desktop (gemerkt) · `09` METZLER Ist mobil.

---

## 0 · Ist-Stand METZLER (gemessen [B], 1440 × 900 bzw. 375 × 812, Transitions abgeschaltet)

| # | Befund | Messwert | Folge |
|---|---|---|---|
| I1 | Rahmen und Segment sind deckungsgleich mit „Fotos \| 3D“ | Rahmen 35,6 × 35,6 bei y 283,6, rechte Kante 680,4 = Bühnenkante; Segment 27,6 bei y 287,6; Glyph 15,2 | gut, bleibt |
| I2 | **Trefferfläche Desktop zu klein** | `::before` inset −0,25 rem → 35,6 + 8 = **43,6 px** (< 44) | AA-Ziel 2,75 rem knapp verfehlt |
| I3 | **Kein Wort am Control.** Zustand nur über Füllung; Bedeutung des Lesezeichens nur per `title` | Lesezeichen im Markt selten (Herz 8/9, 09a M3) | 09a: Lesezeichen nur vertretbar, wenn ein Label es trägt |
| I4 | **Rückmeldung weit weg vom Klick** | Control y 284 → Toast y 811 (Desktop, unten mittig) | Blick muss 530 px wandern; nahe am Klick ändert sich nur die Füllung |
| I5 | **„Geändert seit dem Merken“ am Control unsichtbar** | Control sieht aus wie „nicht gemerkt“; Caption bei y 1 529 (außerhalb des 900-px-Viewports) | Nutzer erkennt nicht, dass die gemerkte Konfiguration veraltet ist |
| I6 | **Pop läuft auch beim Laden** | Regel hängt an `.is-on`, nicht am Klick; auf der Galerie ist `.mkl-pdp-save__glyph` das ganze 27,6-px-Segment | Wiederkehrer sehen eine „Gemerkt“-Animation ohne Aktion |
| I7 | **Mobil zwei Instanzen gleichzeitig** (aus Code abgeleitet) | `pdp-b.js` zeigt die Sticky-Bar, sobald der CTA außerhalb des Viewports liegt, auch *unterhalb*; bei Ankunft am Telefon sind Galerie-Chip und Echo zugleich sichtbar | verletzt „eine Instanz“ |
| I8 | **Doppelte Ansage** | Toast `role="status" aria-live="polite"` **und** `#mkl-live` melden denselben Klick | Screenreader hört zwei Meldungen |
| I9 | Mobil „gemerkt“ = Optik des „3D“-Chips (Teal-Rand, `teal-50`) | beide Chips y 347,5, Höhe 36 / 36,4 | Zustand liest sich wie eine zweite Einladung |

---

## 1 · Benchmark: das Merken-Control auf der PDP

| Shop | Quelle | Icon | Container | Position | Zustände / ARIA | Bewegung | Rückmeldung · Undo | Mobil |
|---|---|---|---|---|---|---|---|---|
| **Zalando** · zalando.de/nike-sportswear-air-force-1-07-sneaker-low-white-ni112n022-a11.html | [B] | Herz 24 px | 48 × 48 Kreis, 1 px Ring (inset); Hover: Grau-Fläche + 2 px Ring | Desktop rechts neben vollbreitem CTA „Jetzt kaufen“, gleiche Höhe 48 | `aria-label` „Zu Favoriten hinzufügen“, kein `aria-pressed`, kein `title` | keine auffällige | Gast → Login-Wand [09a] | **40 × 40 weißer Kreis oben rechts in der Galerie**, 8 px Einzug, gegenüber Badges oben links; am CTA kein Herz mehr (`02`) |
| **OTTO** · otto.de/p/hisense-…-2095862379/ | [B] | Herz | 40 × 40 weißer Kreis, ohne Rand | **oben rechts in der Galerie**, gegenüber Rabatt-Badge oben links (`03`) | idle Outline grau → rot gefüllt; Label „Artikel merken“ → „Artikel gemerkt. Vom Merkzettel entfernen?“; kein `aria-pressed`; Live-Region „Hinweis: Gemerkt!“ | sofort | grüne Snackbar unten „Gemerkt! · Zum Merkzettel ×“; Header-Zähler; Entfernen „Vom Merkzettel entfernt.“ **ohne** Rückgängig | [09a] Herz in der Galerie; mobil am 02.11. nicht gerendert |
| **IKEA** · ikea.com/de/de/p/billy-buecherregal-weiss-00263850/ | [B] | Herz 24 px | 40 × 40 Kreis, transparent | rechts neben dem Produkttitel (Kopf der Kaufspalte); die Galerie trägt unten rechts „Alle Medien \| 3D-Ansicht“ | „Auf dem Merkzettel speichern“ → „Von Merkzettel entfernen“; gefüllt schwarz | sofort | **dunkler Toast oben rechts, am Header-Ziel** (360 px) mit IKEA-Family-Hinweis und × (`04`); Entfernen ohne Rückgängig | [R] Herz am Titel |
| **Apple** · apple.com/de/shop/buy-mac/macbook-air | [B] | **Lesezeichen** 21 px | Textlink mit Glyph, „Sichern“ (68 × 21) neben „Teilen“ | Zusammenfassung unter dem CTA „Weiter“, mit Erklärsatz zum Speichern von Konfigurationen (`05`) | Wort + Glyph | – | Sichern erfordert Apple-Account [R] | [R] gleiche Lage |
| **Vitra** · vitra.com/de-de/product/details/eames-plastic-side-chair-re-dsw | [B] | Herz 18 px | 38 × 42 Quadrat, Radius 5 px | links neben „In den Warenkorb“ im Konfigurator-Panel → **merkt die Konfiguration** (`06`) | rot gefüllt; `aria-label` bleibt „Zur Wunschliste hinzufügen“, kein `aria-pressed` | sofort | **keine** sichtbare Rückmeldung außer Füllung | [R] |
| **Manufactum** · manufactum.de/herrnhuter-stern-a1e-13-cm-a204804/ | [B] idle · [09a] Klick | Herz + Wort | vollbreite Pill 48 px, 1 px grau | Kaufbox unter dem Preis; ersetzt den CTA bei „nicht lieferbar“ (`07`) | Label bleibt „Merken“ | – | **grüne Inline-Bestätigung unter dem Button** + „Zur Merkliste“ [09a `21`] | [09a] |
| **Galaxus** | [09a] | Pin + „Merken“ | Sekundär-Button, 50/50 mit „Vergleichen“ | unter dem Primär-CTA | kein Gemerkt-Zustand | – | Header-Punkt; Flyout am Header (Vergleich) | – |
| **notebooksbilliger / Thomann** | [09a] | Herz | Icon-Button | an Karte/Spalte | **`aria-pressed`** + Label-Wechsel (nbb); Herz sofort gefüllt (Thomann) | – | kein Toast (Thomann) | Thomann: Merken nur auf PDP |
| **Net-a-Porter, SSENSE, Mytheresa** | [R] | Herz bzw. nur Wort | beschrifteter Sekundär-Button | unter dem Kauf-CTA, nicht auf der Galerie | – | – | – | Live-Prüfung am 02.11. gescheitert (404 bzw. Consent-Umleitung) |
| **Porsche / BMW Konfigurator** | [R] | Wort | Textaktion | Zusammenfassung | – | – | Speichern mit Konto bzw. Porsche Code [09a R] | – |

---

## 2 · Muster und was Premium-Shops anders machen

| Muster | Beobachtung | Bedeutung für METZLER |
|---|---|---|
| **Galerie oben rechts** | OTTO (Desktop), Zalando (mobil) setzen das Merken als Overlay in die Bildecke, gegenüber einem Element oben links | Kundenposition ist marktüblich; bei METZLER ist die Galerie-Spalte zusätzlich sticky → Control bleibt beim Konfigurieren sichtbar. **Keine Gegenempfehlung.** |
| **Am CTA (Desktop)** | Zalando, Vitra, Galaxus, Apple, Manufactum | Mehrheit auf dem Desktop. Der Nachteil der Galerie-Ecke (Abstand zur Zusammenfassung) wird durch das Label „Konfiguration merken“ ausgeglichen (siehe §3). |
| **Icon-only vs. Wort** | Massenmarkt Icon-only (Zalando, OTTO, IKEA, Vitra); Premium und Konfigurator mit Wort (Apple „Sichern“, Manufactum, Galaxus „Merken“) | METZLER nutzt das seltene Lesezeichen → **Wort ist Pflicht**, nicht nur `title`. |
| **Zustand** | Füllung überall; ARIA uneinheitlich (Vitra ohne, OTTO/IKEA über Label-Wechsel, nur nbb mit `aria-pressed`) | Füllung + Wortwechsel + `aria-pressed` ist mehr als der Markt. |
| **Rückmeldung** | Nur Füllung (Vitra, Thomann) · Snackbar mit Sprungziel (OTTO) · Toast am Ziel (IKEA) · Inline am Button (Manufactum) | Nah am Klick *und* ein Weg zur Liste; nie Modal. |
| **Undo** | in keinem geprüften Shop (OTTO, IKEA) | METZLER-Vorsprung „Rückgängig“ bleibt. |
| **Bewegung** | keine nennenswerte Animation beobachtet; Zustand springt | kurzer, ruhiger „Stempel“ ist differenzierend, aber nur nach Klick. |
| **Konfiguration** | Vitra merkt die Konfiguration stumm; Apple erklärt das Sichern der Konfiguration; Porsche [R] mit Code | METZLER sagt es im Label: „Konfiguration merken / gemerkt“. |

**Was Premium anders macht:** Wort statt nur Symbol, ruhiger Container ohne Signalfarbe (kein Rot), Rückmeldung ohne Werbung, Konfiguration wird ausdrücklich benannt und ist wieder abrufbar. Massenmarkt dagegen: farbiges Herz, Icon-only, Marketing im Toast (IKEA Family), Login-Wände (Zalando).

---

## 3 · Entscheidung

**Ein beschrifteter Lesezeichen-Schalter im Galerie-Werkzeugrahmen** — der echte Ein-Segment-Zwilling von „Fotos | 3D“: Rahmen, Segment, Schrift und Icon-Größe wie die Umschaltung, plus das Wort.

| Frage | Entscheidung | Begründung |
|---|---|---|
| Label | **Sichtbar.** Desktop (> 35 rem): „Merken“ / „Gemerkt“; nach Farbwahl „Konfiguration merken“ / „Konfiguration gemerkt“. Mobil (≤ 560 px): kurz „Merken“ / „Gemerkt“ | Lesezeichen braucht ein Wort (09a M3, I3); die Segmente „Fotos“ und „3D“ tragen ebenfalls Glyph + Wort; Premium-Muster. Das lange Label nennt den Konfigurationsstand dort, wo der Kunde merkt. |
| Tooltip | `title` nur noch für Zusatzinfo: „Aus der Merkliste entfernen“, „Geändert seit dem Merken …“, „Merkliste voll“ | Das Label ersetzt den Tooltip; Tooltips sind per Touch und Tastatur nicht erreichbar. |
| Hover | Wort + Glyph in Teal (wie das „3D“-Segment), **keine** Füll-Vorschau | Füllung bedeutet Zustand; eine Vorschau würde „gemerkt“ vortäuschen. |
| Gemerkt | Segment Teal, Wort + Glyph weiß, Glyph gefüllt; **auch mobil** (statt `teal-50`) | gleiche Grammatik wie das aktive „Fotos“-Segment; trennt Zustand vom Einladungs-Chip „3D“ (I9). |
| Mikro-Interaktion | Segment-Füllung 160 ms (wie Umschaltung) + Glyph-Stempel 0,86 → 1,06 → 1 in 220 ms, **nur nach Klick** | spürbar, aber ruhig; behebt I6. |
| Rückmeldung | Am Control: Wortwechsel + Stempel. Global: bestehender Hinweis „Gemerkt · Zur Merkliste“ / „Konfiguration gemerkt“ + Header-Badge-Puls. **Kein** zusätzliches Inline-Popover | Der Wortwechsel ist die Inline-Bestätigung (Manufactum-Nähe ohne zweite Hinweis-Anatomie). Die Kunden-Anatomie für Hinweise (§9) bleibt die einzige. |
| Geändert seit dem Merken | Control wirkt wie „nicht gemerkt“, Label „Konfiguration merken“ + **Teal-Punkt am Glyph**; `title`/Beschreibung „Geändert seit dem Merken — erneut merken, um zu aktualisieren“ | „Ungespeicherte Änderung“-Konvention; macht I5 am Ort sichtbar. Klick aktualisiert denselben Eintrag. |
| Limit | Optik gedämpft (0,6), `aria-disabled`, Klick → Hinweis „Ihre Merkliste ist voll (50 Artikel).“ · „Zur Merkliste“ | wie bisher, plus Beschreibung per `title`. |
| Mobil / Daumen | Chip oben bleibt; im Daumenbereich trägt das Sticky-Echo (2,75 rem) — **nur wenn der Chip nicht im Viewport ist** | erfüllt „eine Instanz“ (I7). |
| Rückkehr | Zustand wird synchron aus dem Speicher gesetzt, ohne Animation | I6. |

**Hinweis zur Position:** Die Recherche zeigt auf dem Desktop mehrheitlich „am CTA“. Das ist kein starker Widerspruch zur Kundenentscheidung: OTTO nutzt die Galerie-Ecke auf dem Desktop, Zalando mobil, und die sticky Galerie hält das Control beim Konfigurieren im Blick. Keine zweite Instanz ergänzen.

---

## 4 · Build-Spec

### 4.1 Anatomie

| Teil | Desktop und Tablet (> 560 px) | Mobil (≤ 560 px) |
|---|---|---|
| Lage | `position:absolute; top:.75rem; right:0` in `.pdp-media__stage` (Oberkante = Umschaltung, rechte Kante = Bühnenkante) | `top:0; right:0`, gleiche Zeile wie der „3D“-Chip |
| Rahmen `.mkl-pdp-media` | `padding:.2rem`, `1px solid var(--graphite-300)`, `border-radius:var(--radius-lg)`, `background:var(--white)`; Außenhöhe 35,6 px | `padding:0`, `border-radius:var(--radius)`; Außenhöhe 36 px = „3D“-Chip |
| Segment `.mkl-pdp-media__seg` | `inline-flex`, `gap:.3rem`, `height:1.725rem`, `padding:0 .6rem`, `border-radius:var(--radius)` | `height:2.125rem`, `padding:0 .9rem`, `border-radius:calc(var(--radius) - 1px)` |
| Glyph | `.95rem` (= 3D-Würfel), DS-Lesezeichen 27 × 26, `stroke-width:2` (≈ 1,1 px) | gleich |
| Wort | `.75rem`, 700, `line-height:1` (= Umschalter-Buttons); langes Label sichtbar | kurzes Label sichtbar, langes ausgeblendet |
| Breitenstabilität | Label reserviert die Breite des Alternativ-Worts (`::after{content:attr(data-alt)}`, Höhe 0) → kein Springen beim Umschalten | gleich |
| Punkt „geändert“ `.mkl-pdp-save__dot` | im Glyph oben rechts: `.375rem` Kreis `var(--teal)`, Ring `0 0 0 .125rem var(--white)`, `top:-.125rem; right:-.1875rem` | gleich |
| Trefferfläche | `::before inset:-.3125rem` → 45,6 px hoch, ≥ 2,75 rem | 36 + 10 = 46 px |
| Fokus | `outline:.1875rem solid var(--teal); outline-offset:.125rem` (nur `:focus-visible`) | gleich |
| Sticky-Echo `.mkl-pdp-bar` | ab 56,25 rem ausgeblendet (wie bisher) | 2,75 rem Quadrat links vom CTA, icon-only; ausgeblendet (`.is-dup`), solange der Galerie-Chip im Viewport liegt |

### 4.2 Zustände

| Zustand | Bedingung (`pdpState()`) | Rahmen | Segment | Wort + Glyph | Label Desktop / Mobil | `aria-pressed` | `title` |
|---|---|---|---|---|---|---|---|
| idle | `!on && !changed` | weiß, `--graphite-300` | transparent | `--graphite-700`, Outline | „Merken“ bzw. „Konfiguration merken“ / „Merken“ | false | – |
| hover | idle + `:hover` | unverändert | transparent | `--teal` | wie idle | false | – |
| pressed | `:active` (+ `.is-pressed` 120 ms) | unverändert | `--teal-5` | `--teal`, Glyph `scale(.9)` | wie idle | – | – |
| focus | `:focus-visible` | + Outline Teal 3 px | – | – | – | – | – |
| saved | `on` | weiß, `--graphite-300` (mobil: `--teal`) | `--teal` | `--white`, Glyph gefüllt | „Gemerkt“ bzw. „Konfiguration gemerkt“ / „Gemerkt“ | true | „Aus der Merkliste entfernen“ |
| saved-hover | saved + `:hover`/`:active` | unverändert | `--teal-600` | `--white` | wie saved | true | wie saved |
| changed | `s1 && changed` | wie idle | wie idle | wie idle + **Punkt** | „Konfiguration merken“ / „Merken“ | false | „Geändert seit dem Merken — erneut merken, um zu aktualisieren“ + `aria-describedby="mklPdpChanged"` |
| limit | `!on && !changed && isFull()` | wie idle, `opacity:.6`, `cursor:not-allowed` | – | – | wie idle | false + `aria-disabled="true"` | „Ihre Merkliste ist voll (50 Artikel).“ |
| disabled | nicht vorgesehen (localStorage synchron). **JTL:** optimistisch umschalten; bei Serverfehler zurücksetzen + Hinweis „Konnte nicht gemerkt werden. Bitte erneut versuchen.“ | – | – | – | – | – | – |

Echo (mobil): idle wie heute (`--graphite-300`, Glyph `--schwarz`); saved = Rand `--teal`, Fläche `--color-teal-50`, Glyph `--teal` gefüllt (sekundär neben dem gefüllten CTA); changed = Punkt; `title` = Label, sofern kein Zusatz-`title` gilt.

Kontraste: `--graphite-700`/weiß 7,5 : 1 · `--teal`/weiß 9,0 : 1 · weiß/`--teal-600` 10,1 : 1 · `--teal`/`--color-teal-50` 8,3 : 1 · Punkt `--teal`/weiß 9,0 : 1.

### 4.3 Bewegung

| Was | Eigenschaft | Dauer | Easing | Reduzierte Bewegung |
|---|---|---|---|---|
| Segment-Wechsel (idle ↔ saved, Hover) | `background-color`, `color` | 160 ms | `ease` (= Umschaltung) | sofort |
| Stempel nach Merken (nur Klick, Klasse `.is-just-saved` 260 ms) | `transform: scale` .86 → 1.06 → 1 (`@keyframes mkl-bm-pop`) am Glyph | 220 ms | `cubic-bezier(.2,.8,.2,1)` | keiner |
| Druck | Glyph `scale(.9)` | 120 ms | `ease` | keiner |
| Entfernen | nur Segment-Wechsel, kein Stempel | 160 ms | `ease` | sofort |
| Punkt „geändert“ | `opacity` 0 → 1 | 160 ms | `ease` | sofort |
| Header-Badge | bestehender Puls | 180 ms | `ease` | keiner |
| Laden / Rückkehr | – | keine Animation | – | – |

### 4.4 Copy und ARIA

| Element | Text |
|---|---|
| `aria-label` | **beginnt mit dem sichtbaren Label** (WCAG 2.5.3): `Merken: VDM10 2.0 Video-Türsprechanlage` · `Gemerkt: …` · `Konfiguration merken: …, Anthrazit RAL 7016` · `Konfiguration gemerkt: …, Anthrazit RAL 7016` |
| Live (`#mkl-live`, unverändert) | „Gemerkt: … Merkliste: n Artikel“ · „Konfiguration gemerkt: …, Gesamt … €. Merkliste: n Artikel“ · „Konfiguration aktualisiert: …“ · „Entfernt: … Merkliste: n Artikel“ |
| Hinweis (unverändert) | „Gemerkt“ · Zur Merkliste — „Konfiguration gemerkt“ · Zur Merkliste — „Konfiguration aktualisiert“ · Zur Merkliste — „Aus der Merkliste entfernt“ / „Konfiguration aus der Merkliste entfernt“ · Rückgängig — „Ihre Merkliste ist voll (50 Artikel).“ · Zur Merkliste |
| Ansage nur einmal | Hinweise, die zusätzlich `live()` aufrufen, setzen am Toast `aria-live="off"` |
| Fokus | bleibt nach dem Klick auf dem Control; nach „Rückgängig“ zurück auf `.mkl-pdp-media` bzw. das Echo (bestehendes `restore()`) |

### 4.5 Änderungen je Datei

**`merkliste-pdp.css`** (`?v=16`)
1. Im `:root`-Alias ergänzen: `--graphite-700:var(--color-graphite-700);`
2. **Ersetzen:** alle Regeln mit Selektor `.pdp-media__stage .mkl-pdp-media…` in den Blöcken „Merken on the gallery“ (inkl. `@media(max-width:560px)`) und „Gallery bookmark = a one-segment twin“ durch den Block unten, der **am Dateiende** steht (er muss nach der gemeinsamen Strichstärken-Regel `…svg path{stroke-width:1.4}` folgen). Die Echo-Regel `@media(min-width:56.25rem){#pdpStickyBar .mkl-pdp-bar{display:none}}` bleibt.
3. Im Block „Bookmark glyph (lead design pass)“: `.mkl-pdp-save.is-on .mkl-pdp-save__glyph{animation:…}` → `.mkl-pdp-save.is-just-saved .mkl-pdp-save__glyph{animation:mkl-bm-pop .22s cubic-bezier(.2,.8,.2,1)}`.

```css
/* ==== 10 · Galerie-Merken: beschrifteter Ein-Segment-Zwilling von „Fotos | 3D“ (Spec 10) ==== */
.pdp-media__stage .mkl-pdp-media{position:absolute;top:.75rem;right:0;z-index:3;display:inline-flex;width:auto;height:auto;min-height:0;padding:.2rem;border:1px solid var(--graphite-300);border-radius:var(--radius-lg);background:var(--white);color:var(--graphite-700);font-size:.75rem;font-weight:700;line-height:1;transition:none}
.pdp-media__stage .mkl-pdp-media::before{content:'';position:absolute;inset:-.3125rem}
.pdp-media__stage .mkl-pdp-media:hover,.pdp-media__stage .mkl-pdp-media.is-on,.pdp-media__stage .mkl-pdp-media.is-on:hover{border-color:var(--graphite-300);background:var(--white)}
.mkl-pdp-media__seg{display:inline-flex;align-items:center;gap:.3rem;height:1.725rem;padding:0 .6rem;border-radius:var(--radius);transition:background-color .16s ease,color .16s ease}
.mkl-pdp-media .mkl-pdp-save__glyph{position:relative;width:.95rem;height:.95rem}
.mkl-pdp-media .mkl-pdp-save__glyph svg{width:.95rem;height:.95rem}
.pdp-media__stage .mkl-pdp-media svg path{stroke-width:2}   /* must follow the shared 1.4 rule (same specificity) */
.mkl-pdp-media .mkl-pdp-save__label,.mkl-pdp-media .mkl-pdp-save__short{display:inline-block;min-width:0;text-align:left}
.mkl-pdp-media .mkl-pdp-save__label::after,.mkl-pdp-media .mkl-pdp-save__short::after{content:attr(data-alt);display:block;height:0;overflow:hidden;visibility:hidden}
.mkl-pdp-media .mkl-pdp-save__short{display:none}
.mkl-pdp-media:hover .mkl-pdp-media__seg{color:var(--teal)}
.mkl-pdp-media:active .mkl-pdp-media__seg{background:var(--teal-5)}
.mkl-pdp-media.is-on .mkl-pdp-media__seg{background:var(--teal);color:var(--white)}
.mkl-pdp-media.is-on:hover .mkl-pdp-media__seg,.mkl-pdp-media.is-on:active .mkl-pdp-media__seg{background:var(--teal-600);color:var(--white)}
.mkl-pdp-media.is-limit{opacity:.6;cursor:not-allowed}
.mkl-pdp-media.is-limit .mkl-pdp-media__seg{color:var(--graphite-700);background:none}
/* "changed since bookmarking" dot (idle look + dot) — also on the echo */
.mkl-pdp-save__dot{position:absolute;top:-.125rem;right:-.1875rem;width:.375rem;height:.375rem;border-radius:50%;background:var(--teal);box-shadow:0 0 0 .125rem var(--white);opacity:0;transition:opacity .16s ease;pointer-events:none}
.mkl-pdp-save.is-changed .mkl-pdp-save__dot{opacity:1}
.mkl-pdp-save .mkl-pdp-save__glyph{position:relative}
@media(max-width:560px){
  .pdp-media__stage .mkl-pdp-media{top:0;padding:0;border-radius:var(--radius)}
  .pdp-media__stage .mkl-pdp-media.is-on,.pdp-media__stage .mkl-pdp-media.is-on:hover{border-color:var(--teal)}
  .mkl-pdp-media__seg{height:2.125rem;padding:0 .9rem;border-radius:calc(var(--radius) - 1px)}
  .mkl-pdp-media .mkl-pdp-save__label{display:none}
  .mkl-pdp-media .mkl-pdp-save__short{display:inline-block}
}
/* sticky echo: saved = secondary teal (next to the filled CTA); hidden while the gallery chip is in view */
#pdpStickyBar .mkl-pdp-bar.is-on{border-color:var(--teal);background:var(--color-teal-50);color:var(--teal)}
#pdpStickyBar .mkl-pdp-bar.is-dup{display:none}
@media(prefers-reduced-motion:reduce){.mkl-pdp-media__seg,.mkl-pdp-save__dot{transition:none !important}.mkl-pdp-save .mkl-pdp-save__glyph{animation:none !important;transform:none !important}}
```

**`merkliste.js`** (`?v=14`)

| Funktion | Änderung |
|---|---|
| `pdpBtnHTML(extra, iconOnly)` | Glyph-Span bekommt `<i class="mkl-pdp-save__dot"></i>`; Label bekommt `data-alt="Gemerkt"`. Enthält `extra` die Klasse `mkl-pdp-media`, werden Glyph + Label in `<span class="mkl-pdp-media__seg">…</span>` gewickelt und dahinter `<span class="mkl-pdp-save__short" data-alt="Gemerkt" aria-hidden="true">Merken</span>` (im Segment) ergänzt. |
| `initPdp()` | `pdpBtn = h(pdpBtnHTML(' mkl-pdp-media'))` — ohne `mkl-pdp-save--icon`, Label sichtbar. Neue Prüfung `dupCheck()`: `var r = pdpBtn.getBoundingClientRect(); pdpBar.classList.toggle('is-dup', r.width > 0 && r.bottom > 0 && r.top < window.innerHeight);` — aufrufen in `updBar`, bei `scroll` (passiv, per `requestAnimationFrame`) und `resize`. |
| `syncPdpMarks()` | `label` wie heute; zusätzlich `alt` (Gegenwort im selben Modus), `shortL = on ? 'Gemerkt' : 'Merken'`, `shortAlt`. `aria-label = label + ': ' + nm + (st.s1 && colour ? ', ' + colour : '')`. `title`: Limit → „Ihre Merkliste ist voll (50 Artikel).“; `changed` → „Geändert seit dem Merken — erneut merken, um zu aktualisieren“; `on` → „Aus der Merkliste entfernen“; sonst am Galerie-Control entfernen, am Echo = `label`. Je Instanz: `is-changed` togglen, `aria-describedby="mklPdpChanged"` nur bei `changed`, Label- und Short-Text plus `data-alt` setzen. |
| `pressPdp(btn)` | Ablauf wie heute, aber ohne frühe `return`s; vorher `was = st.on` merken; danach `if (!was && btn.classList.contains('is-on')) stampPdp();` |
| neu `stampPdp()` | ohne `reduced()`: an `pdpBtn` und `pdpBar` `.is-just-saved` entfernen, Reflow (`void b.offsetWidth`), setzen, nach 260 ms entfernen. |
| `toast(msg, type, action, quiet)` | neuer 4. Parameter: `toastEl.setAttribute('aria-live', quiet ? 'off' : 'polite')`. `quiet = true` in `addItem`, `removeItem`, `addConfig`, `updateConfig` und den beiden Limit-Zweigen (Zeilen mit `live(m)`). |

`pdp/index.html`: Cache-Busting `merkliste-pdp.css?v=16`, `merkliste.js?v=14`. `merkliste.css`, Toast-Anatomie und Header-Badge bleiben unverändert.

### 4.6 Abnahme (Transitions für Messungen per `*{transition:none!important;animation:none!important}` abschalten, außer bei A12)

**Desktop 1440 × 900, `scrollY 0`**

| # | Prüfung | Soll |
|---|---|---|
| A1 | Rahmen vs. `.pdp-media__toggle` | Oberkante gleich (283,6 ± 0,5), Höhe gleich (35,6 ± 0,5); rechte Kante = Bühnenkante (680,4 ± 0,5) |
| A2 | Segment vs. „Fotos“-Segment | Oberkante 287,6 ± 0,5, Höhe 27,6 ± 0,5; Schrift `12px`/700 wie Umschalter; Glyph 15,2 × 15,2 |
| A3 | Label je Zustand | S0: „Merken“ → „Gemerkt“; nach Farbwahl: „Konfiguration merken“ → „Konfiguration gemerkt“ |
| A4 | Breitenstabilität | Breite idle = saved (Δ ≤ 0,5 px), je Modus S0 und S1 |
| A5 | Abstand zur Umschaltung | ≥ 1 rem zwischen Umschaltung rechts und Control links, in S1, auch bei 900 × 800. Falls verfehlt: das kurze Label bis 64 rem verwenden (nur der Label-Tausch aus dem Mobil-Block, in `@media(max-width:64rem)`) |
| A6 | Trefferfläche | `getComputedStyle(btn,'::before')` → Breite und Höhe ≥ 44 px |
| A7 | saved | Segment `rgb(1, 82, 83)`, Text/Glyph `rgb(255, 255, 255)`, Glyph-`fill` weiß; Rahmen bleibt `rgb(218, 218, 218)` |
| A8 | saved-hover | Segment `rgb(1, 74, 75)` |
| A9 | Fokus per Tab | `outline` 3 px solid `rgb(1, 82, 83)`, Offset 2 px |
| A10 | ARIA | `aria-pressed` wechselt; `aria-label` beginnt mit dem sichtbaren Label; idle ohne `title` |
| A11 | changed (Farbe wählen → merken → Menge +) | `.is-changed`, Punkt 6 × 6 px sichtbar (`opacity 1`), Label „Konfiguration merken“, `aria-describedby="mklPdpChanged"`; Klick → Hinweis „Konfiguration aktualisiert“, Anzahl der Einträge unverändert |
| A12 | Stempel nur nach Klick (Transitions aktiv) | nach Reload mit gemerktem Artikel: `.mkl-pdp-media .mkl-pdp-save__glyph`.`getAnimations().length === 0` und keine `.is-just-saved`; nach Klick ≤ 260 ms `.is-just-saved`, danach entfernt |
| A13 | Reduzierte Bewegung (emuliert) | keine Animation; `transition-duration` des Segments `0s` |
| A14 | Ansagen | nach Klick genau eine Ansage: `#mkl-live` „Gemerkt: …“, Toast `aria-live="off"` |
| A15 | Entfernen + Undo | Hinweis „Aus der Merkliste entfernt · Rückgängig“; nach „Rückgängig“ saved und Fokus auf `.mkl-pdp-media` |
| A16 | Limit (50 Einträge im Speicher) | `aria-disabled="true"`, `opacity .6`, `title` „Ihre Merkliste ist voll (50 Artikel).“; Klick → Limit-Hinweis, kein Zustandswechsel |
| A17 | Echo | `#pdpStickyBar .mkl-pdp-bar` `display:none` |

**Mobil 375 × 812** (im 375-px-iFrame messen, siehe 08: die Emulation meldet `innerWidth` ≈ 1077)

| # | Prüfung | Soll |
|---|---|---|
| M1 | Chip vs. „3D“-Chip | Oberkante gleich (347,5 ± 0,5), Höhe 36 ± 0,5; rechte Kante = Bühnenkante (351 ± 0,5) |
| M2 | Label | kurzes Label sichtbar („Merken“/„Gemerkt“), auch nach Farbwahl; langes Label `display:none` |
| M3 | Abstand bei 320 px | Chip überlappt den „3D“-Chip nicht (Abstand ≥ 0,5 rem); kein horizontaler Scroll |
| M4 | Trefferfläche | `::before` ≥ 44 × 44 |
| M5 | saved | Rand `rgb(1, 82, 83)`, Segment `rgb(1, 82, 83)`, Text/Glyph weiß |
| M6 | eine Instanz | `scrollY 0` (Chip sichtbar, Bar `is-visible`): Echo hat `.is-dup` und `display:none`; Chip-Unterkante < 0 und Bar sichtbar: Echo 44 × 44 sichtbar |
| M7 | Echo saved | Rand `rgb(1, 82, 83)`, Fläche `rgb(242, 246, 246)`, Glyph Teal gefüllt; Zustand synchron mit Chip |
| M8 | Hinweis | über der Sticky-Bar (`.is-pdp-bar`), sobald die Bar sichtbar ist |

### 4.7 Nicht Teil dieses Schritts

- **Rückkehr mit gemerkter Konfiguration, aber ohne gemerktes Modell (S0):** Das Control zeigt „Merken“. Empfehlung P2: Beschreibung „1 Konfiguration dieses Modells ist gemerkt“ per `title` bzw. `aria-describedby`; kein zusätzlicher Zustand.
- JTL: optimistisches Umschalten mit Fehler-Rücksetzung (siehe 4.2 „disabled“), Konto-Sync.
