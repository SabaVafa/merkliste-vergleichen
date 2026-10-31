# 08 — Position des Merken-Controls auf der Produktdetailseite

Datum: 2026-10-31 · Rolle: Lead Product Design · Scope: `Deliverables/vergleichen-flow-B/pdp/index.html` (Version B, Inline-Konfiguration) mit `merkliste.js` v5 / `merkliste-pdp.css` v1
Grundlage: `07a_PDP-Merkliste_Flow_UX.md` (Zustandsmodell S0/S1, Z1–Z8), `07b_PDP-Merkliste_Interface_Design.md` (bisherige Platzierung), `07_PDP-Merkliste_Umsetzung.md` (Ist-Stand).
Dieses Dokument entscheidet nur die **Position** (plus das, was die Position am Control ändert). Zustandslogik, Toasts, Drawer, Band bleiben wie in 07a/07b.

**Messmethode.** Alle Werte am laufenden Prototyp mit `getBoundingClientRect()` (Dokument-y = `top + scrollY`), Transitions für die Messung per injiziertem Stil abgeschaltet. Desktop: 1440 × 900 (nutzbare Höhe 885 px), 1366 × 768 (753 px), 1024 × 768, 920 × 768. Mobile: 375 × 812, gemessen in einem 375 × 812-iFrame, weil die PDP unter der Mobile-Emulation durch ihre Off-Screen-Overlays eine Layoutbreite von 1077 px meldet. Kandidaten b–e wurden **nur im Browser** per DOM-Injektion simuliert (rot gestrichelt in den Screenshots); keine Datei außer diesem Dokument wurde geändert. y-Werte schwanken je Ladevorgang um ± 14 px (Webfont-Nachladen); angegeben ist jeweils die gemessene Spanne.
Kennzeichnung: **[M]** = gemessen · **[E]** = Einschätzung / Branchenwissen, nicht gemessen.

Screenshots: `Deliverables/08_assets/`
`01` Desktop S0 Ist · `02` Desktop S1 Kaufzeile Ist · `03` PLP-Karte · `04` Mobile S0 Ankunft Ist · `05` Mobile S1 Kaufzeile Ist · `06` Mock b Mobile · `07` Mock c+d Mobile · `08` Mock c+d+e Desktop S0 · `09` Mock b+d Desktop S1 · `10` Echo mit Label bei 1024 px (Mock) · `11` Entscheidung, Zustand „Konfiguration gemerkt“.

---

## 1 · Bewertungskriterien

| # | Kriterium | Gewicht | Was zählt |
|---|---|---|---|
| K1 | **Nähe zur Entscheidung & Lesbarkeit des Zustands** | 25 % | Abstand zur Kaufzeile; kann das Control „Konfiguration merken / gemerkt“ und die Caption „Geändert seit dem Merken …“ sichtbar tragen? Steht es dort, wo die Konfiguration fertig ist? |
| K2 | **Hierarchie: „In den Warenkorb“ bleibt unangetastet und dominant** | 20 % | Keine Breiten-, Umbruch- oder Positionsänderung am CTA; keine Fehltipp-Nachbarschaft gleicher Größe |
| K3 | **Auffindbarkeit im System** (zusammen mit dem Sticky-Echo) | 20 % | Ist bei Ankunft (S0) und während des Konfigurierens (S1) ein Merken-Control im Viewport? Nie zwei Toggles gleichzeitig? |
| K4 | **Mobile: Platz & Daumenreichweite** | 15 % | Passt es in 327 px ohne Umbruch fremder Elemente; liegt die erreichbare Instanz im unteren Drittel? |
| K5 | **Konsistenz mit PLP-Karte und Konvention** | 10 % | Gleiches Glyph, gleiche Zustandssprache; erwartbarer Ort |
| K6 | **Risiko & Aufwand** | 10 % | Konflikte mit Galerie-Gesten / Preisblock, Doppelungen, A11y, Umbau des Ist-Stands |

---

## 2 · Kandidaten und gemessene Fakten

### 2.1 Seitenkarte [M]

| Element | Desktop 1440 × 900 · S0 | Desktop S1 (Farbe gewählt) | Mobile 375 × 812 · S0 | Mobile S1 |
|---|---|---|---|---|
| H1 | y 272, h 68 | h 103 (Farbe im Titel) | y 192, h 76 | h 101 |
| Bewertung / „Produkt teilen“ (`.bx-cred`) | y 351, h 25; Teilen 119 × **25** px | y 386 | y 280, h 44; Teilen 119 × 44 bei x 232 | y 305 |
| Galerie-Bühne `.pdp-media__stage` | 580 × 580 bei x 100 / y 272; **Spalte sticky, `top: 104px`**; Toggle Fotos/3D oben links | bleibt im Viewport | 327 × 315 bei y 348; nicht sticky | y 373 |
| Preisblock `.pdp-price--lead` | y 490, h 147; Betrag y 500; Angebots-Pill x 1146 | y 515–519, h 169–179 | y 949, h 202 (**unter der Falz**) | y 964 |
| Farbwahl `#bFarbe` | y 669 | y 716 | y 1183 | y 1220 |
| Konfigurator `#cfgbPanel` | gesperrt | y 852–866, h 639 | gesperrt | y 1448, h 762 |
| Kaufzeile `.cfgb-buyrow` | CTA „Bitte Farbe wählen“ 580 × 48, y 787–801 | Menge 123 + CTA **448** × 48, y 1517–1531 | CTA 327 × 48, y 1402 | Menge 123 + CTA **194** × 48, y 2236 |
| Merken (Ist) `.mkl-pdp-save` | 118 × 44, y 847–861 → Unterkante 891–905 bei Falz 885: **an der Falz angeschnitten** | 207 × 44, y 1577–1591 (12 px unter der Kaufzeile) | 118 × 44, y 1462 | 207 × 44 bei x 24, y 2296 |
| Sticky-Bar `#pdpStickyBar` | verborgen (CTA sichtbar) | sichtbar, sobald CTA außerhalb des Viewports; h 74–75 | **ab Ankunft sichtbar**, h 108 | sichtbar außer an der Kaufzeile |
| Echo in der Bar | — | 44 × 44 bei x 949, links von „Details“ (x 1010) und CTA (x 1139); **518 px frei** zwischen Info und Echo | 44 × 44 bei x 127 / y 753–797, links vom CTA (x 181, 178 px) | wie S0 |
| Header-Merkliste `.mkl-hdr` | 52 × 52 bei x 1225 / y 50 | — | 48 × 48 bei x 268 / y 44 | — |

Zusatz 1366 × 768 (S0): CTA y 797 > 753 → Kaufzeile **und** Merken unter der Falz; die Bar ist ab Ankunft sichtbar, das Echo damit im ersten Viewport [M].
PLP-Karte (`index.html`): nacktes Lesezeichen 44 × 44, `position:absolute; top/right 8px` in `.pcard__media` [M] (Screenshot 03).

### 2.2 Kandidaten

| | Position | Fakten Desktop [M] | Fakten Mobile [M] | Bewertung |
|---|---|---|---|---|
| **a** | **Ist: Sekundärzeile direkt unter der Kaufzeile** (`#bCheckout`, nach `.cfgb-buyrow`) + Icon-Echo in der Sticky-Bar | Abstand zum CTA 12 px; trägt Label „Konfiguration merken/gemerkt“, Bestätigungszeile und Änderungs-Caption; CTA unverändert 448 px. S0 1440 × 900: 24 von 44 px über der Falz; 1366 × 768: unter der Falz, dafür Echo sichtbar. Bar ist genau dann verborgen, wenn die Kaufzeile sichtbar ist → **nie zwei Toggles gleichzeitig im Viewport** | Zeile 207 × 44 links bündig; CTA unverändert 194 px; erreichbare Instanz ist das Echo bei y 753–797 (unteres Zehntel) | Einziger Ort, der den Konfigurationsstand an der Stelle der Entscheidung ausspricht |
| **b** | Icon-Quadrat 3 rem **in** der Kaufzeile rechts neben „In den Warenkorb“ | CTA schrumpft 448 → **390 px (−13 %)** | CTA schrumpft 194 → **137 px**; „In den Warenkorb“ (Textbreite 135 px + 2 × 24 px Padding) **bricht zweizeilig um** (Screenshot 06). Kein Platz für Label oder Caption | Verletzt die Vorgabe „Kauf-Button unangetastet“ — K.-o. |
| **c** | Titelzeile neben „Produkt teilen“ (07a, Instanz A) | Im ersten Viewport (y 351). Abstand zum CTA in S1 **≈ 1 130–1 145 px**; bei 1024 px kollidiert der Text optisch mit „Produkt teilen“ (Screenshot 10). Teilen-Grammatik ist nur 25 px hoch | S1: „Konfiguration merken“ (172 px) + „Produkt teilen“ (119 px) passen nicht in 327 px → Zeile wächst 44 → **76 px**, Galerie rutscht 32 px nach unten (Screenshot 07). Abstand zum CTA ≈ 1 930 px. Bei Ankunft sind Titel-Instanz **und** Echo gleichzeitig sichtbar | „Konfiguration merken“ neben dem Titel spricht über einen Stand, der 1–2 Bildschirme tiefer entsteht |
| **d** | Galerie-Ecke oben rechts (PLP-Parität) | 44 × 44 bei x 629 / y 280; Galerie ist sticky → bleibt beim Konfigurieren im Viewport (gemessen bei y 112). Icon-only; kein Label, keine Caption. Bei sichtbarer Bar zwei Toggles gleichzeitig (Ecke + Echo) | Ecke bei x 299–343 / y 356–400, **in derselben Spalte wie das Header-Lesezeichen** (x 268–316) → drei identische Glyphen im ersten Viewport (Header = Liste öffnen, Ecke + Echo = merken), Screenshot 07. Oberes Viertel = schwer erreichbar [E] | Beste PLP-Parität, aber liest den Konfigurationsstand nicht und doppelt das Echo |
| **e** | Neben dem Preis / Gesamtbetrag (`.pdp-price__row`) | Icon bei x 996 / y 503 direkt neben der durchgestrichenen UVP; rechts davon die Angebots-Pill (x 1146) — Preiszeile wird dreiteilig (Screenshots 08, 10). Der Preisblock steht oben, nicht am Ende der Konfiguration: Abstand zum CTA in S1 ≈ 1 000–1 030 px | Preisblock y 949 → **unter der Falz**; Abstand zum CTA in S1 ≈ 1 200 px | Preis muss frei scannbar bleiben; kein Gewinn an Sichtbarkeit |
| **f** | Nur Sticky-Bar (Buybox-Zeile entfernen) | Bar ist verborgen, sobald die Kaufzeile sichtbar ist → **an der Entscheidungsstelle gibt es dann kein Control** | Gleiches Problem an der Kaufzeile; sonst gute Reichweite | Fällt an genau dem Moment aus, für den das Control da ist |
| **g** | a + c (drei Instanzen, Vorschlag 07a) | wie a, plus Titel-Instanz | wie a, plus Umbruch der Titelzeile (+32 px) und zwei gleichzeitig sichtbare Toggles bei Ankunft | Mehr Fläche, mehr Synchronisation, kaum mehr Reichweite (das Echo deckt die Ankunft bereits ab) |

### 2.3 Konventionen [E]

- **Baymard-Befunde (sinngemäß, aus der PDP-/Cart-Forschung, nicht am Prototyp gemessen):** Nutzer, die noch nicht kaufen wollen, suchen „Merken/Speichern“ in der Kaufbox; fehlt es dort, missbrauchen sie den Warenkorb als Merkliste. Sekundäraktionen in der Kaufbox müssen visuell klar unter dem Kauf-CTA stehen, sonst werden beide gleich gewichtet.
- **Konfigurierbare Premiumprodukte** (Auto-Konfiguratoren, Apple-Store-Konfiguration, Küchen/Hausgeräte): Speichern sitzt in der Zusammenfassung am Ende der Konfiguration, nahe am Preis-/Kauf-Abschluss, als Textaktion unter oder neben dem Kauf-Button — nicht neben dem Produktnamen.
- **Mode/Marktplatz (Zalando, Otto, IKEA):** Herz/Lesezeichen als Quadrat neben einem vollbreiten CTA. Funktioniert dort, weil kein Mengen-Stepper in der Zeile steht; hier belegt der Stepper genau diesen Platz (siehe b).
- **Bild-Ecke** ist auf Listen (Karte) Standard; auf der PDP konkurriert sie mit Zoom/Lightbox/3D und wird oft als Bildfunktion gelesen.

---

## 3 · Scoring-Matrix

Skala 1 (schlecht) – 5 (sehr gut); jeweils als System mit dem Sticky-Echo bewertet (außer f).

| Kandidat | K1 · 25 % | K2 · 20 % | K3 · 20 % | K4 · 15 % | K5 · 10 % | K6 · 10 % | **Summe** |
|---|---|---|---|---|---|---|---|
| **a Zeile unter der Kaufzeile + Echo** | 5 | 5 | 4 | 4 | 3 | 5 | **4,45** |
| g a + Titelzeile | 5 | 5 | 5 | 3 | 3 | 2 | 4,20 |
| d Galerie-Ecke + Echo | 2 | 5 | 5 | 2 | 5 | 2 | 3,50 |
| f nur Sticky-Bar | 2 | 5 | 3 | 5 | 3 | 3 | 3,45 |
| c Titelzeile + Echo | 1 | 5 | 5 | 2 | 3 | 3 | 3,15 |
| b inline in der Kaufzeile + Echo | 4 | 1 | 4 | 2 | 4 | 3 | 3,00 |
| e neben dem Preis + Echo | 2 | 4 | 3 | 3 | 2 | 3 | 2,85 |

Begründung der Abzüge für a: K3 = 4, weil der Button bei 1440 × 900 in S0 an der Falz angeschnitten ist, während die Bar noch verborgen ist (Risiko 6.1). K5 = 3, weil die Buybox-Instanz ein Ghost-Button mit Label ist, nicht das nackte Karten-Glyph — Glyph und Gemerkt-Sprache (gefüllt, teal) sind aber identisch.

---

## 4 · Entscheidung und Begründung

**Primärort bleibt die Sekundärzeile direkt unter der Kaufzeile (a). Sekundärinstanz: das Echo in der Sticky-Bar — ab 64 rem Viewport-Breite mit sichtbarem Label, darunter icon-only. Keine Instanz an Titelzeile, Galerie oder Preis.**

1. **Nur dort ist das Objekt eindeutig.** Das Control wechselt seine Bedeutung (Modell → Konfiguration). Unter der Kaufzeile steht es nach dem letzten Schritt, 12 px unter dem CTA, und kann „Konfiguration merken / gemerkt“ plus die Caption „Geändert seit dem Merken …“ ausschreiben [M]. An jedem anderen Ort liegt die Konfiguration 1 000–1 900 px entfernt (c, e) oder das Control hat keinen Platz für Text (b, d).
2. **Der Kauf-Button bleibt unberührt.** b ist der einzige Ort, der näher wäre — und kostet den CTA 13 % (Desktop) bzw. 57 px mit zweizeiligem Umbruch (Mobile) [M]. Damit ist b ausgeschlossen.
3. **Das System deckt die Auffindbarkeit bereits ab.** Die Bar erscheint genau dann, wenn die Kaufzeile außerhalb des Viewports liegt; das Echo ist dann die sichtbare Instanz (Mobile ab Ankunft, 1366 × 768 ab Ankunft, Desktop während des Konfigurierens). Ist die Kaufzeile sichtbar, ist die Bar weg und die Zeile übernimmt [M]. Ergebnis: in fast jedem Zustand genau **ein** Merken-Toggle im Viewport — c, d und g würden zwei gleichzeitig zeigen.
4. **Verbesserung gegenüber dem Ist-Stand:** Auf Desktop ist die Bar beim Konfigurieren die meistgesehene Instanz, sagt aber als Icon nicht, *was* gemerkt wird. In der Bar sind bei 1440 px 518 px frei, bei 1024 px nach dem Umbau noch 138 px [M] → ab 64 rem trägt das Echo dasselbe Label wie die Buybox-Instanz. Unter 64 rem bleibt es icon-only (bei 920 px blieben nur 34 px Luft [M]).
5. **PLP-Parität** entsteht über Glyph und Zustandssprache (Outline → gefüllt `--teal`), nicht über die Bildecke. Die Bildecke wäre auf Mobile das dritte identische Glyph im ersten Viewport, mit anderer Bedeutung als das Header-Glyph direkt darüber [M].

---

## 5 · Implementierungs-Spezifikation

### 5.1 DOM-Anker

| Instanz | Selektor (Anker) | Einfügeposition | Status |
|---|---|---|---|
| **Primär** `div.mkl-pdp-row#mklPdpRow` mit `button.mkl-pdp-save`, `p.mkl-pdp-note#mklPdpNote`, `p.mkl-pdp-changed#mklPdpChanged` | `#bCheckout > .cfgb-buyrow` | `afterend` — d. h. zwischen `.cfgb-buyrow` und `.ts-slot.ts-sig` | **unverändert** (Ist-Stand `initPdp()`) |
| **Echo** `button.mkl-pdp-save.mkl-pdp-save--icon.mkl-pdp-bar` (Label-Span `.mkl-pdp-save__label.mkl-pdp-sr`) | `#pdpStickyBar #bStickyDetails` | `beforebegin` | Position unverändert; **neu: sichtbares Label ab 64 rem** (5.4) |

Reihenfolge in der Bar (Desktop): Thumb · Info · [`margin-left:auto`] · Echo · Details · CTA. Fokus-Reihenfolge Buybox: Mengen-Stepper → „In den Warenkorb“ → Merken → „Zur Merkliste“ (Note) → Trusted-Shops-Slot.

### 5.2 Layout Buybox-Zeile (alle Breiten)

| Eigenschaft | Wert |
|---|---|
| `.mkl-pdp-row` | `display:flex; flex-wrap:wrap; align-items:center; gap:var(--sp-2) var(--sp-4); min-width:0; margin-top:calc(var(--sp-3) - 1.6rem)` → effektiv **0,75 rem** unter der Kaufzeile (der Checkout-Stack hat `gap:1.6rem`) |
| Ausrichtung | linke Kante bündig mit dem Mengen-Stepper bzw. dem CTA in S0 (Desktop x 744, Mobile x 24) |
| `.mkl-pdp-save` | `inline-flex`, **Breite hugging, nie volle Breite**; `height:2.75rem`; `padding:0 var(--sp-4) 0 var(--sp-3)`; `gap:var(--sp-2)`; `border:.0625rem solid var(--graphite-300)`; `border-radius:var(--r-m)`; `background:var(--white)`; `color:var(--schwarz)`; `font:600 .875rem/1 inherit`; `white-space:nowrap` |
| Glyph | 1,5 × 1,5 rem, Pfad `M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z`, `fill:none; stroke:currentColor; stroke-width:1.75; stroke-linejoin:round` — Lesezeichen, kein Herz, keine Disc |
| `.mkl-pdp-save__label` | `min-width:3.5rem` (kein Zeilensprung bei „Merken“ ↔ „Gemerkt“) |
| `.mkl-pdp-note` | `flex:1 1 12rem; font-size:.75rem; line-height:1.45; color:var(--text-muted)`; Link `color:var(--teal); font-weight:600; text-decoration:underline; padding:.5rem 0; margin:-.5rem 0` |
| `.mkl-pdp-changed` | `flex-basis:100%; margin:0; font-size:.75rem; line-height:1.45; color:var(--text-muted)` |
| Abstand nach unten | Checkout-Gap 1,6 rem zum nächsten Block bleibt unverändert |

### 5.3 Zustände (Buybox-Instanz und Echo identisch)

| Zustand | Auslöser (07a) | Glyph | Rahmen | Label / Ink | Fläche | ARIA / Sonstiges |
|---|---|---|---|---|---|---|
| **Default** | Z1, Z3 | Outline | `--graphite-300` | `--schwarz` | `--white` | `aria-pressed="false"` |
| **Hover** | Zeiger | Outline | `--teal` | `--teal` | `--teal-5` | `cursor:pointer` |
| **Focus-visible** | Tastatur | wie Hover | — | — | — | `outline:.1875rem solid var(--teal); outline-offset:.125rem` |
| **Pressed** | Klick | `transform:scale(.9)` 120 ms nur am Glyph | — | — | — | Klasse `is-pressed`; entfällt bei `prefers-reduced-motion` |
| **On (Gemerkt)** | Z2, Z4 | **gefüllt** `--teal` | `--teal` | `--teal` | `--white`, Hover `--teal-5` | `aria-pressed="true"`; Note „Gemerkt · Zur Merkliste“ bzw. „Konfiguration gemerkt · Zur Merkliste“ sichtbar |
| **Limit** | Z7 (50 Einträge, Objekt nicht gemerkt) | Outline | `--graphite-300` | `--text-muted`, `opacity:.6` | `--white` | `aria-disabled="true"` (fokussierbar), `cursor:not-allowed`; Klick → Limit-Toast mit „Zur Merkliste“ |
| **Changed** | Z5 (gemerkt, danach geändert) | Outline | `--graphite-300` | `--schwarz`, Label „Konfiguration merken“ | `--white` | `.mkl-pdp-changed` sichtbar (nur Buybox; das Echo zeigt nur den Default-Zustand); Klick aktualisiert den Eintrag |

Kontraste auf `--white`: `--schwarz` 17:1, `--teal` 9:1, `--text-muted` 5,4:1; Trefferfläche überall ≥ 2,75 rem (44 px).

### 5.4 Breakpoints

| Viewport | Buybox-Zeile | Sticky-Echo |
|---|---|---|
| **≥ 64 rem** | wie 5.2, Note rechts neben dem Button | **mit sichtbarem Label** (neu), links von „Details“; Breite hugging (≈ 7,4 rem „Merken“ / ≈ 13 rem „Konfiguration gemerkt“) |
| 56,25–63,99 rem | wie 5.2 | icon-only 2,75 × 2,75 rem, links von „Details“ (Ist) |
| ≤ 56,25 rem | wie 5.2 | icon-only, links vom CTA („Details“ wird zum Chevron-Griff) (Ist) |
| < 48 rem (Mobile) | links bündig bei 1,5 rem Seitenrand; Note bricht unter den Button (`flex-basis:12rem`); Caption volle Breite | icon-only, links vom CTA, unteres Bildschirmzehntel |
| < 30 rem | unverändert | Thumbnail der Bar `display:none` (Ist) |

**Neu in `merkliste-pdp.css`** (einzige Code-Änderung; nach dem bestehenden Echo-Block einfügen):

```css
/* Echo trägt ab 64rem dasselbe Label wie die Buybox-Instanz (Platz in der Bar: 518px @1440, 138px @1024) */
@media (min-width:64rem){
  #pdpStickyBar .mkl-pdp-bar{width:auto;padding:0 var(--sp-4) 0 var(--sp-3);gap:var(--sp-2)}
  #pdpStickyBar .mkl-pdp-bar .mkl-pdp-sr{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto;min-width:3.5rem}
}
```

`syncPdpMarks()` setzt den Label-Text bereits für beide Instanzen; kein JS nötig. `aria-label` und `title` bleiben wie gehabt (der sichtbare Text ist im Namen enthalten, WCAG 2.5.3).

### 5.5 Sticky-Echo: ja

Ja — als einzige Zweitinstanz. Begründung: Die Bar ist genau dann sichtbar, wenn die Buybox-Zeile es nicht ist (Mobile ab Ankunft, Desktop beim Konfigurieren). Zustand, `aria-pressed`, `aria-label`, `title` synchron mit der Buybox (Ist); die Bar bleibt `inert`, solange sie verborgen ist (Ist). Toast über der sichtbaren Bar (`.mkl-toast.is-pdp-bar`, Ist).

### 5.6 Entfernen / nicht bauen

- **Aus dem Ist-Stand entfernen: nichts.** Position und Markup der Buybox-Zeile und des Echos bleiben.
- **Nicht bauen:** keine Instanz in `.bx-cred` (neben „Produkt teilen“), auf `.pdp-media__stage`, in `.pdp-price--lead` / `.pdp-price__row`, im Sheet „Preisdetails & Menge“ und kein Icon in `.cfgb-buyrow`.
- In `07_PDP-Merkliste_Umsetzung.md` §3 ist der Punkt „Instanz A neben ‚Produkt teilen‘ — bei Bedarf eine Zeile Markup“ damit **geschlossen** (abgelehnt).
- Header-Control `.mkl-hdr` bleibt (öffnet die Liste, ist kein Toggle).

### 5.7 Copy (unverändert, Sie-Form)

| Zustand | Label (Buybox + Echo ab 64 rem) | Note / Caption |
|---|---|---|
| S0, nicht gemerkt | „Merken“ | — |
| S0, gemerkt | „Gemerkt“ | „Gemerkt · Zur Merkliste“ |
| S1, nicht gemerkt | „Konfiguration merken“ | — |
| S1, gemerkt | „Konfiguration gemerkt“ | „Konfiguration gemerkt · Zur Merkliste“ |
| S1, geändert | „Konfiguration merken“ | „Geändert seit dem Merken — erneut merken, um zu aktualisieren“ |
| `aria-label` | „{Modell} merken“ / „{Modell} aus der Merkliste entfernen“ / „Konfiguration merken: {Modell}, {Farbe}“ / „Konfiguration aus der Merkliste entfernen: {Modell}, {Farbe}“ | |
| `title` | „Merken“ / „Gemerkt — aus der Merkliste entfernen“ / „Konfiguration merken“ / „Konfiguration gemerkt — aus der Merkliste entfernen“ | |

Nie: „Wishlist“, „Wunschzettel“, „Favorit“, „speichern“ als Control-Label, „günstig“.

### 5.8 Abnahme (messbar)

1. Buybox: Button 44 px hoch, Oberkante = Unterkante `.cfgb-buyrow` + 12 px, linke Kante = linke Kante `.cfgb-buyrow` (1440: x 744; 375: x 24); `#bCart` unverändert 448 px (1440, S1) bzw. 194 px (375, S1), einzeilig.
2. Echo bei 1440 und 1024 px: sichtbares Label, Höhe 44 px, kein Überlappen mit `.pdp-stickybar__info` (Abstand ≥ 1 rem); bei 1000 px: 44 × 44, kein sichtbares Label.
3. Echo bei 375 px: 44 × 44 links vom CTA, CTA-Rechtskante ≤ 359 px, kein horizontaler Scroll.
4. Kaufzeile im Viewport → Bar verborgen → genau ein Merken-Toggle sichtbar; Kaufzeile außerhalb → Echo sichtbar.
5. Alle Zustände aus 5.3 in beiden Instanzen synchron; Fokusring 3 px `--teal`, Offset 2 px; keine Konsolenfehler.

---

## 6 · Risiken und offene Punkte

1. **Falzband Desktop S0** [M]: Bei nutzbarer Höhe ≈ 850–905 px (z. B. 1440 × 900 = 885 px) ist der CTA sichtbar, die Bar also verborgen, der Merken-Button aber nur zu 24 von 44 px sichtbar. Geringe Tragweite (ein Scroll von 20 px). Optionale Abhilfe liegt in der PDP, nicht im Add-on: Bar-Auslöser auf die Unterkante von `#mklPdpRow` statt `#bCart` beziehen — Änderung an `pdp-b.js`, separat vom PDP-Owner freizugeben.
2. **Annahmen zur Nutzung sind nicht gemessen** [E]. Validierung über das bestehende Event `merkliste_add` (`instance: 'buyrow' | 'sticky'`, `kind: 'model' | 'config'`). Ist der Anteil „model“ aus der Buybox in S0 niedrig und die PDP-Merkquote insgesamt deutlich unter der PLP-Quote, Titelzeilen-Instanz als A/B-Test prüfen — nicht vorher bauen.
3. **Label-Länge im Echo** springt zwischen „Merken“ (≈ 7,4 rem) und „Konfiguration gemerkt“ (≈ 13 rem). Durch `margin-left:auto` wächst das Echo nach links; „Details“ und CTA bleiben stehen [M]. Bei sehr langen Übersetzungen (JTL-Sprachvariablen) Grenze 64 rem neu prüfen.
4. **Mobile-Messung** erfolgte im 375-px-iFrame ohne Touch-Emulation (`pointer:coarse` nicht aktiv). Geometrie ist belastbar; Tap-Verhalten auf echtem Gerät einmal prüfen.
5. **Nebenbefund** [M]: „Produkt teilen“ ist auf Desktop nur 25 px hoch (< 44 px). Außerhalb dieses Scopes; wäre bei Kandidat c ein Blocker gewesen.
6. **Konventionsaussagen** (2.3) sind Erfahrungswissen [E] und wurden im Rahmen dieser Arbeit nicht an Live-Shops verifiziert.
