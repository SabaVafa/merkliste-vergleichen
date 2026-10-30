# 06 — Flow-Audit Version B · Konsolidierung und Umsetzung

Datum: 2026-10-30 · Scope: `Deliverables/vergleichen-flow-B/` (Merkliste + Vergleichen, beide Lenses)
Quellen: `06a_Flow-Audit_Product-Design.md` (Lead Product Design, 28 Befunde) und `06b_Flow-Audit_UX.md` (Lead UX Design, 30 Befunde, Copy-Tabelle, WCAG-Checkliste). Beide Audits liefen unabhängig voneinander am laufenden Prototyp (1440 × 900 und 375 × 812, Tastatur, DOM/ARIA, Messungen).

Alle Standing Decisions des Kunden bleiben unverändert: Karten-Checkboxen erst nach „Vergleichen", `--teal-100`-Button, Berater über dem Grid, zentrierte CTAs, nacktes Lesezeichen-Glyph, kein „Version B"-Tag, Sticky-Kopf mit fester Höhe, Cap 4 / eine Kategorie, Merkliste gerätelokal (Limit 50). Version A und `vergleichen-prototype/` wurden nicht angefasst.

---

## 1 · Was beide Audits unabhängig gefunden haben (und was jetzt gilt)

| # | Befund (PD / UX) | Ursache | Umsetzung |
|---|---|---|---|
| 1 | **Gesamte Button-Typografie der Add-ons fiel auf 16 px / 400** (PD-01, UX-01) | `font:600 … inherit` ist als Kurzschrift ungültig (`inherit` ist keine Schriftfamilie) → Deklaration verworfen | 17 Vorkommen in beiden Stylesheets in Longhands aufgelöst. Gemessen: Toolbar-Button 14 px / 600, Chips 14 px / 600, Tray-CTA 14 px / 600 |
| 2 | **Sticky-Produktkopf 414–506 px Desktop, 472–489 px Phone** (PD-02, UX-04/05) | „Auf einen Blick" + Qualifier + UVP-Platzhalter + 74 px CTA-Reserve im `thead`; Briefkästen-Hero-Regel übersteuerte die Mobile-Regel | „Auf einen Blick" ist jetzt die **erste Zeilengruppe im `tbody`** (bleibt oben, scrollt aber mit). Kopf = Bild · Modell · Qualifier · Preis · CTA. Gemessen: **341 px Desktop (3 Modelle), 289 px Phone**; erste Datenzeile auf dem Phone sichtbar. Im Twin-State steht der Entscheidungsblock („Was der Aufpreis bringt" / Alternativen) **vor** der Tabelle. Mobile Hero in beiden Lenses 5,25 rem |
| 3 | **Mobiler Tray überläuft, Hinweiszeile fehlt** (PD-03, UX-21) | einzeilige Flex-Zeile, Hinweis `display:none` | Tray bricht in zwei Zeilen (Status + Aktionen / Thumbnails), Hinweis sichtbar, „Leeren" als Kurzlabel, `padding-bottom` des Body = gemessene Tray-Höhe. Gemessen: CTA-Rechtskante 359 px bei 375 px, Tray 121 px |
| 4 | **Chips in 4–5 Zeilen auf dem Phone, „+n weitere" tot** (PD-14, UX-06) | wrap, inertes `<span>` | Chips in der PLP-Chip-Grammatik (`--teal-5`, 2 rem, 14 px / 600, 2,75-rem-Trefferfläche per `::before`); auf dem Phone eine **horizontal scrollende Zeile** mit Fade; „+ n weitere" ist ein Button mit `aria-expanded`, der alle Chips aufklappt. Gemessen: Summary-Strip 94 px statt 258 px |
| 5 | **Twin-State: zwei Spalten „Ebenhard", „7 Farben" beidseitig, Block unter der Falz** (PD-05, UX-07/28) | `shortName()` kollidiert, Farb-Highlight bedingungslos, Reihenfolge | `colLabels()`: bei gleicher Modellzeile wandern die abweichenden Qualifier-Wörter in den Titel („Ebenhard **mit gebürsteter V2A-Edelstahl-Front**", teal); Farb-Highlight nur bei echtem Mehr („+ 2 Farben (Eisenglimmer, Wunschfarbe)"); Mengen-Zeilen vergleichen **reihenfolgeunabhängig** (vorher zählte eine andere Reihenfolge der Farben als Unterschied); Wertaussage benennt die Variante und führt nicht gerankte Fakten als „Unterschied: …", nicht als „dafür:" |
| 6 | **Modellname am Titelende verschwindet** (PD-06, UX-16) | `parts[0]` | `MODEL_RE` hebt ein Modell-Segment (XDM10, VDM10 2.0, SDM10X, ADM10) an den Anfang: „**SDM10X** Türsprechanlage mit Kamera" — in Merkliste und Vergleich identisch |
| 7 | **Merkliste-Toast außerhalb des Drawers, per Tastatur unerreichbar, Fokus nach Undo weg** (PD-07, UX-02) | Toast im `body`, Fokusfalle nur im Drawer | Das Toast-Element wandert bei offenem Drawer **in den Dialog** (Teil der Fokusfalle), sitzt über dem Footer (`--mkl-foot-h`); nach „Rückgängig" liegt der Fokus auf der wiederhergestellten Zeile, Live-Region „Wiederhergestellt: {Modell}" |
| 8 | **Fokusverlust im Vergleich nach Spalte entfernen / Chip / Details** (UX-03) | `innerHTML`-Re-Render ohne Fokusziel, keine Live-Region | `removeColumn()`: Fokus auf das „×" der nächsten Spalte, bei 2 → 1 bleibt der Dialog offen (Leerzustand mit „Modell wählen", „Aus der Merkliste wählen (n)", „Vergleich wiederherstellen"); `aria-live` im Overlay („{Modell} entfernt. Vergleich mit n Modellen."); Details-/Chip-Buttons werden nach dem Re-Render refokussiert; Sprungmarken fokussieren die Zielzeile |
| 9 | **Trefferflächen unter 2,75 rem** (PD-16, UX-08/09) | 18–28 px Elemente | Karten-Checkbox volle Breite, 2,75 rem; Spalten-„×" als SVG in 2,75 rem (ohne Disc); (i) 2,75 rem per `::before`; Tray-„×" 2,75 rem per `::before`; Textlinks `min-height:2.75rem`; Overlay-Close 2,75 rem; „Zum Vergleich" 2,25 rem; Toolbar-Button und Tray-CTA 2,75 rem (wie der PLP-Toolbar) |
| 10 | **Fokusringe fehlen / Browser-Default; keine Reduced-Motion-Regeln im Vergleich** (PD-09/10) | — | Ein Ring (DS: 0,1875 rem teal) für alle `vgl-`-Controls; `prefers-reduced-motion`-Block für Tray, Overlay, Toast, Coach, Chips, Flash, Spotlight |
| 11 | **Kontrast „Ja" / „BESTWERT" 3,3:1** (UX-18) | `--green` als Textfarbe | „Ja" in `--schwarz` mit grünem Haken; „Bestwert"-Pill `--teal-100` / `--teal` (7,9:1) |
| 12 | **(i) nur CSS-Hover, nicht für Screenreader, Escape schließt den Dialog** (UX-17, PD-04) | `::after{content:attr()}`, gleicher z-index wie die nächste Sticky-Zelle | Toggletip: echter `.vgl-tip`-Knoten (`role=tooltip`, `aria-describedby`, `aria-expanded`), Klick/Enter öffnet, Hover zeigt weiter, **Escape schließt zuerst den Tip**; Zelle hebt sich beim Hover/Fokus (`z-index:5`), Tip nicht mehr abgeschnitten. Title der Preisdifferenz ohne „günstig" |
| 13 | **„Alle entfernen" meint zwei Dinge; „Abbrechen" verwirft ohne Rückweg** (UX-10/11, PD-19) | — | „**Vergleich leeren**" (Bar + Tray) bleibt im Dialog und bietet Undo; „**Merkliste leeren**" mit Frage „n Artikel aus der Merkliste entfernen?"; Toolbar „**Vergleich beenden**" als sekundärer Button mit Toast „Vergleich beendet — n Modelle verworfen · Rückgängig" |
| 14 | **px-basierter Vergleichs-Layer** (PD-15) | — | `vergleichen.css` komplett in rem (ein Durchlauf, inkl. Media-Queries und `var()`-Fallbacks); Breakpoint beider Layer 47,99 rem |

## 2 · Weitere umgesetzte Befunde

- **„Modell hinzufügen"** (PD-11, UX-12): Spalte 8,5 rem statt 10 rem+, Kachel auf Bildhöhe, Body-Zellen ohne Tönung; Klick schließt den Dialog, scrollt zum Grid und fokussiert das erste freie Karten-Feld; Toast „Weiteres Modell auf einer Produktkarte markieren — noch n möglich."; zweite Option **„Aus der Merkliste (n)"** öffnet den Drawer.
- **Rückweg zur Merkliste** (UX-29): Bei Ankunft aus der Merkliste (Hook oder `?von=merkliste`) zeigt die Overlay-Bar „← Merkliste"; beim Schließen landet der Kunde am Grid, nicht am Seitenanfang.
- **Deep-Link** (UX-15): `?vergleich=…` wird konsumiert und per `history.replaceState` entfernt (Reload öffnet nicht erneut, Toast wiederholt sich nicht); Modelle der anderen Kategorie → Toast „Diese Modelle gehören zur Kategorie … — der Vergleich öffnet sich dort" mit „Dort öffnen".
- **Cap-Feedback auf der Karte** (UX-08): fünfte Checkbox ist `aria-disabled` statt `disabled`, der Tipp löst den Cap-Toast aus.
- **Preisformat** (UX-19): Tausenderpunkt im Vergleich („ab 1.266,50 €"); UVP-Zeile nur bei vorhandener UVP; Merkliste zeigt dieselbe Grammatik inkl. UVP (PD-17).
- **Drawer** (PD-12/13/18/21/22/25, UX-13/14/24/30): Zeilen-CTA als `.btn--secondary` (Primär bleibt PDP/Overlay), Papierkorb oben rechts, Bestätigung als Outline-Button (kein rohes `#A80000`), Fokus auf der Frage statt auf „Ja, entfernen", Speicherhinweis im Footer, Footer im Leerzustand ausgeblendet, Checkbox-Rand `--graphite-500` wie auf der Karte, Hover-Title „Merken" / „Gemerkt — …" (UX-20), Limit-Toast mit „Zur Merkliste", Fremd-Tab-Änderung in der Live-Region. **Gemischte Liste** gruppiert nach Kategorie (aktuelle Seite zuerst), Lock-Hinweis einmal im Gruppenkopf, CTA „2 Briefkästen vergleichen", Hinweis „Öffnet den Vergleich auf der Seite Briefkästen". **Konfigurierte Einträge**: Tag „Ihre Konfiguration · Datum", teal Bildrahmen, ein CTA „Konfiguration öffnen", kein Vergleichs-Feld (Vergleich auf Modellebene über das Basismodell → keine Doppel-ID).
- **Überschriften + Semantik** (UX-26/27): Dialogtitel ist `h2`, Verdict `h3`, Gemeinsamkeiten `h3`; Swatches mit versteckter Farbliste; PLP-Swatch-Grammatik (1,375 rem, `--r-m`) im Vergleich (PD-20).
- **Drucken** (UX-25): Gemeinsamkeiten werden vor dem Druck geöffnet, Kopfzeile „edelstahl-tuerklingel.de · Kategorie · Datum".
- **Warnfarben** (PD-24): Set-vs-Einzel-Guard in `--graphite-100`/`--schwarz`; kein `--star`-Fremdtoken mehr.
- **Tour-FAB** (UX-23, PD-27): während des Vergleichsmodus und im Overlay ausgeblendet; Overlay-Toast sitzt am unteren Rand statt bei 104 px.
- **Hygiene** (PD-28): `is-compact`-Regeln und Hero-Transitions entfernt.

## 3 · Bewusst nicht umgesetzt (mit Begründung)

| Befund | Entscheidung |
|---|---|
| Tour-FAB und Lens-Link nur mit `?tour=1` (UX-23) | Beide dienen der Kunden-Demo des Prototyps; im JTL-Build entfallen sie ohnehin. Nur die Überlappung wurde behoben. |
| Coach-Mark beim ersten Lesezeichen (UX-20) | Hover-Title und Leerzustand erklären das Symbol; ein Overlay-Hinweis widerspräche der ruhigen Premium-Haltung. Kandidat für den A/B-Test im Shop. |
| Farb-Zeile mit Text „zusätzlich / ohne" (UX-07c) | Vom Kunden am 2026-10-10 explizit entfernt; die Differenz steht stattdessen in „Auf einen Blick". |
| Warenkorb-Badge „0" ausblenden (PD-26) | Shop-Basis, nicht Add-on. Hinweis für JTL: `.badge.is-zero{display:none}` auch am Warenkorb. |
| DS-Tokens `--warn` / `--green-dark` (PD-24, UX-18) | Vorschlag für das Design-System; die Add-ons bleiben vorerst in der bestehenden Palette. |
| Account-Merge, Link teilen, PDF, PDP „Konfiguration merken" | Weiterhin P1 laut `05_Merkliste_Flow_und_Interface.md`. |

## 4 · Verifikation (Prototyp, 2026-10-30)

| Prüfung | Ergebnis |
|---|---|
| `getComputedStyle(.vgl-bar-btn)` | 14 px / 600, Höhe 44 px (vorher 16 px / 400, 40 px) |
| Chips | 32 px, 14 px / 600, 2,75 rem Trefferfläche |
| Sticky-Kopf 1440 × 900 (3 Modelle) | 341 px (vorher 431 px); Briefkästen-Twin 367 px (vorher 489–506 px) |
| Sticky-Kopf 375 × 812 | 289 px (vorher 403–489 px), Hero 84 px in beiden Lenses |
| Tray 375 px | CTA-Rechtskante 359 px, alle Thumbnails sichtbar, Hinweis sichtbar, Höhe 121 px |
| Twin `?vergleich=ebenhard,ebenhard-v2a&von=merkliste` | Titel „Ebenhard (mit austauschbarem Namensschild)" vs. „Ebenhard (mit gebürsteter V2A-Edelstahl-Front)", Reihenfolge Summary → Entscheidungsblock → Tabelle, URL bereinigt, „← Merkliste" sichtbar, Toast „Vergleich mit 2 Modellen aus Ihrer Merkliste" |
| (i) | Klick öffnet (`aria-expanded=true`), Escape schließt nur den Tip, Dialog bleibt offen |
| Spalte entfernen (2 → 1) | Fokus auf „Modell wählen", Live „Ebenhard entfernt. Vergleich mit 1 Modellen." |
| Drawer | Gruppen „Türsprechanlagen (1)" / „Briefkästen (2)", Lock-Hinweis einmal, CTA „2 Briefkästen vergleichen", Toast im Drawer (innerhalb des Dialog-Rechtecks), Fokus nach Undo auf „Siebert entfernen", UVP-Zeile, Bestätigungstext „2 Artikel aus der Merkliste entfernen?" mit Fokus auf der Gruppe |
| Cap | 5. Karte `aria-disabled`, Toast „Maximal 4 Modelle …", Auswahl bleibt 4 |
| „Vergleich beenden" | Toast mit „Rückgängig", Undo stellt 4 Modelle und den Modus wieder her, Fokus auf dem Toolbar-Button |
| Konsolenfehler | keine |

Asset-Versionen: `vergleichen.css|js?v=20`, `merkliste.css|js?v=4`.
