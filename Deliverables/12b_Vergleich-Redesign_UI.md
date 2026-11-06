# 12b · Vergleich-Redesign: UI-Spec (Lead UI Designer)

Stand: 05.11.2026 · Grundlage: Brief 12 (AK 1–43, CP1), PO-Review CP1 (Änderungen 9–10), UX-Spec 12a (nach CP1)
Umsetzung: `vergleichen-flow-B/vergleichen.css?v=31`, `vergleichen.js?v=29` (CP4-Nachbesserung) · Messwerte: 12c

---

## 1 · Prinzipien

1. **Eine Hierarchie, drei Gewichte.** Fazit-Satz 1 fett (stärkster Text), Modellköpfe (Titel fett, CTA als stärkstes Bedienelement), Tabelle ruhig (Body-sm). Farbe trägt keine Bedeutung allein: Abschnitte heißen „Unterschiede / Nicht für alle gepflegt / Gemeinsamkeiten“.
2. **Eine Sticky-Zeile mit fester Höhe.** Leiste (fest) + Modellkopf (`thead`, sticky). Die Höhe wird je Vergleich aus **allen** Modellen gemessen (`lockHead`), nie beim Scrollen geändert, keine Klasse wechselt beim Scrollen.
3. **Nie horizontal scrollen.** Spaltenzahl folgt der Breite (4 / 3 / 2), weitere Modelle über die Spaltenwahl.
4. **Nur Tokens, nur rem.** Ein Alias-Block `:root{--v-*}` bildet die PLP-/DS-Tokens ab (einzige Stelle mit Hex-Fallbacks); alle Regeln darunter nutzen nur `var(--v-*)` und rem-Werte der DS-Skala (Abstände 0,25-Raster = DS `--space-*`).
5. **Icon-Buttons ohne Hover** (×, ▾, (i), Schließen, Lesezeichen): Ruhe = Hover (computed style geprüft). Text-Buttons haben das DS-Hover (Unterstreichung, Stärke 0,0625 → 0,125 rem). Fokusring überall: `0,1875rem solid --v-teal`, Offset 0,125rem.

## 2 · Tokens

| Alias | Quelle (PLP `styles-v2.css` / DS `metzler-tokens.css`) | Verwendung |
|---|---|---|
| `--v-teal` | `--teal` = DS `--color-teal` #015253 | CTA, Links, U-Abschnitt, Schalter an, Fokus |
| `--v-teal-600` | `--teal-600` | (Reserve, gedrückt) |
| `--v-teal-100` | `--teal-100` = DS `--color-teal-100` | Kopf „Unterschiede“, Bestwert-Pille |
| `--v-teal-5` | `--teal-5` (PLP) | aktive Listenoption, Hover „Zum Vergleich“ (Fläche) |
| `--v-ink` | `--schwarz` = DS `--color-digital-black` | Text, Titel, Preis |
| `--v-muted` | `--text-muted` = DS `--color-graphite-600` | UVP, k. A./–, Zählwerte, Schalter aus (Spur) |
| `--v-white` / `--v-paper` | `--white` / `--paper-white` = DS `--color-paper` | Karten / Seitenfläche, Abschnittsköpfe O/G |
| `--v-g100/200/300` | `--graphite-100/200/300` | Zeilenlinien / Haarlinien / Rahmen |
| `--v-green` | `--green` | Häkchen „Ja“ |
| `--v-fs-h3 … --v-fs-cap` | `--text-h3/h4/body/body-sm/caption` | einzige Schriftgrößen: 1,25 · 1,125 · 1 · 0,875 · 0,75 rem |
| `--v-r-m/l/xl/pill` | DS `--radius/-lg/-xl/-pill` | 0,25 · 0,5 · 0,75 · Pille |
| `--v-shadow-card` / `-hover` / `-tip` | DS `--shadow-card` / `--shadow-hover` / `--shadow-tooltip` (Fallback = DS-Wert) | Tabellenkarte / Popover (Spaltenwahl, Suche) / (i)-Tip *(CP4)* |
| `--v-container` | DS-Container 100 rem | Leiste und Inhalt |
| `--v-pad` | `clamp(1.5rem,4vw,3.5rem)` (bestehend) | Seitenrand |

**Token-Vorschläge an die Kundin (nicht erfunden, nur gemeldet):**
- P1 `--graphite-200` fehlt in `styles-v2.css` (DS hat `--color-graphite-200`); heute Fallback #E6E6E8.
- P2 Abstands-Tokens der PLP (`--sp-*`) sind in px; Vorschlag: rem-Variante (`--space-*` aus dem DS) in `styles-v2.css` übernehmen. Bis dahin rem-Literale der DS-Skala.
- P3 `--teal-5` existiert nur in der PLP, nicht im DS (dort `--color-teal-50` #F2F6F6). Vorschlag: auf `--color-teal-50` vereinheitlichen.
- P4 Kein DS-Token für eine 3,5-rem-Thumbnail-/10-rem-Bildgröße im Vergleich; Werte stehen in 12a §2.6, Vorschlag `--compare-img-*`.

## 3 · Typografie

| Element | Stufe | Gewicht · Zeilenhöhe | Farbe |
|---|---|---|---|
| Dialogtitel „Vergleich (n)“ | h3 1,25 (< 48 rem: Body 1) | 700 · 1,35; Zahl Body 400 muted | ink |
| Fazit Satz 1 / Satz 2 | Body 1 (< 48 rem: Body-sm) | 700 / 400 · 1,55 (1,5) | ink |
| „Was bedeutet das?“ | wie Fazit | 600, unterstrichen, ▾ 1 rem | teal |
| „Was das bedeutet“ (≥ 90 rem) | Caption-Overline | 700, 0,15em, VERSALIEN | muted |
| Erklärsätze | Body-sm | Ref 700, Satz 400 · 1,5 | ink |
| Modelltitel | h4 1,125 (≥ 90 rem, 2–3 Modelle) · Body 1 (sonst) · Body-sm (< 48 rem und M-Kopf) | 700 · 1,375 | ink |
| Preis „ab …“ | Body 1 (M-Kopf, 4er-L, < 48 rem: Body-sm) | 700 | ink |
| Δ „+ 42,50 €“ | Body-sm | 600 | ink |
| UVP | Caption, durchgestrichen | 400 | muted |
| CTA | Body 1 (M, < 48 rem: Body-sm) | 700, Unterstreichung 0,0625 rem, Offset 0,1875 rem, Chevron 1,125 (1) rem | teal |
| Abschnittskopf | Body-sm | 700 Titel / 400 Zahl | U: teal; O/G: ink |
| Unterzeile O | Caption | 400 | muted |
| Zeilenlabel / Wert | Body-sm | 600 / 400 · 1,5 | ink; k. A./– muted |
| „Unterschied bei: …“, „7 Farben“, Quelle | Caption | 400 · 1,4–1,5 | muted |
| Bestwert | Caption-Pille | 700 | teal auf teal-100 |

Keine Größe unter 0,75 rem; Silbentrennung aus (`hyphens:manual`).

## 4 · Raster je Breite

| Breite | Spalten sichtbar | Labelspalte | Kopf-Layout | Bild | Titel |
|---|---|---|---|---|---|
| ≥ 90 rem (1440/1920) | bis 4 | 15 rem | **L** (Bild links) | 10 rem (2–3) · 7,5 rem (4) | h4 (2–3) · Body (4) |
| 64–90 rem (1024) | bis 4 | 12 rem | L, wenn Textspalte ≥ 9 rem, sonst **M** | 7 rem (L) · 3,5 rem (M) | Body |
| 48–64 rem (768) | bis 3 (Spaltenwahl ab 4) | 11 rem | L/M wie oben | 6 rem (L) · 3,5 rem (M) | Body |
| < 48 rem (375) | 2 (Spaltenwahl ab 3) | keine (Label über den Werten) | Text-Kopf + Bildleiste 4,25 rem (scrollt weg) | 4,25 rem | Body-sm |

- **L:** `grid-template-areas: "media title" "media money" "media act"`, Spaltenabstand 1 rem; bei 4 Spalten ≥ 90 rem `"act act"` über die volle Zellbreite (CTA passt sonst nicht neben das Bild).
- **M:** `"title title" "media money" "act act"`, Thumbnail 3,5 rem, Abstand 0,75/0,5 rem.
- Zellpolster Kopf 0,75 rem (< 48 rem: 0,5/0,75), Tabelle 0,75 × 1 rem (< 48 rem: 0,5 × 0,75).
- Alle Kopfzellen bekommen dieselbe Mindesthöhe `--vgl-ph-h` (Maximum aller Modelle); die Aktionszeile sitzt unten (`align-self:end`).
- Container 100 rem, Seitenrand `--v-pad`. Produktspalten gleich breit (`table-layout:fixed`, keine Add-Spalte).

## 5 · Regionen

**Leiste (3,75 rem, < 48 rem 3,5 rem, weiß, Haarlinie g300):** [← Merkliste (teal, Body-sm 600; mobil nur Chevron mit `aria-label`)] · h2 · Schalter „Nur Unterschiede (U)“ (Spur 2,5 × 1,375 rem, aus = muted ≥ 3:1, an = teal) · Textbuttons „Link kopieren“ (teal) · „Drucken“ · „Vergleich leeren“ (ink) · × 2,75 rem. Unter 48 rem wandern Link/Drucken/Leeren in die Aktionszeile am Ende. Läuft die Leiste über (Zoom, 320 px), bricht sie um (`is-barwrap`, nur bei Resize).

**Fazit (Seitenfläche, kein Kasten, Polster 0,75 rem; < 48 rem 0,5 rem):** ein Absatz, max. 75 rem breit. „Was bedeutet das?“ steht inline am Textende (Trefferfläche 2,75 rem über `::before`, keine eigene Zeile). Ab 90 rem: Erklärsätze als zweite Spalte (24 rem) mit 0,1875-rem-Teal-Linie links, ohne Button. Hinweis „ohne Shopdaten“ als Body-sm-Zeile mit (i) in muted.

**Tabellenkarte (weiß, Rahmen g200, Radius 0,5 rem, Schatten sm).**
- **Kopf (sticky, weiß, Haarlinie + 0,0625-rem-Schatten):** Labelzelle mit „+ Modell hinzufügen“ (teal Textbutton), „noch n möglich“ (Caption), „Aus der Merkliste (m)“ (Lesezeichen-Glyph); bei 4 Modellen „4 von 4 Modellen.“ + Hinweis. Je Modell: Bild (weiß, Rahmen g200, Radius 0,5) mit Lesezeichen oben links (Merkliste-Add-on; im M-Kopf als kleines weißes 1,5-rem-Badge, statisch), Titel (Spaltenwahl: Text-Button mit ▾ teal), Preis/Δ/UVP, Aktionszeile CTA links · × rechts.
- **CTA (PO-Änderung 9):** DS-Textlink, teal 700, unterstrichen, Chevron rechts — fetter und farbiger als alles andere in der Spalte (× ist muted, 1,125-rem-Glyph). Trefferfläche 2,75 rem Höhe über `::before`. Hover: Unterstreichung 0,125 rem + Chevron 0,125 rem nach rechts (Text-Button, zulässig). `aria-label` „Konfigurieren – {Titel}“.
- **×:** 2,75 × 1,75 rem Box, Trefferfläche 2,75 × 2,75 rem, Glyph 1,125 rem muted, kein Hover, negative Außenabstände statt Platzverbrauch.
- **Abschnittsköpfe (2,25 rem):** U auf teal-100 mit teal Titel; O und G auf paper. G mit Textbutton „Anzeigen/Ausblenden ▾“ rechts (Trefferfläche 2,75 rem). O mit Caption-Unterzeile.
- **Zeilen:** Label 600 + (i) (1,125-rem-Glyph, Ziel 2,75 rem; Tip ink-Fläche, Body-sm, 17 rem; < 48 rem über die volle Zellbreite). Werte Body-sm. Mengen als Liste mit 0,3125-rem-Punkt teal. Farben: Swatches 1,375 rem mit Innenrand g300 + Caption „n Farben“ (Namen für Screenreader). Spaltenwahl: Caption „Unterschied bei: …“ unter dem Label.
- **Gemeinsamkeiten aufgeklappt:** eine Wertzelle mit `colspan` über alle sichtbaren Spalten; Screenreader „– gilt für alle n Modelle“.

**Spaltenwahl (Picker):** ab 48 rem Popover 20 rem unter dem Titel, darunter Bottom-Sheet (Radius 0,75 oben) mit Scrim. Optionen 3,25 rem hoch: Bild 2,5 rem · Titel (Body-sm 600) · Preis (Caption) · Ort „in Spalte k“ (teal 600 bei der aktuellen) / „nicht sichtbar“ (muted). Aktive Option: 0,125-rem-Teal-Umriss + teal-5. Pille „i / n“ (Caption 600, weiß, Haarlinie) auf jedem Bild der Bildleiste.

**Nach der Tabelle:** Alternativen (nur F3) als Karten-Raster `minmax(18rem,1fr)`, „Zum Vergleich“ als Outline-Button 2,75 rem; Quellzeilen (Caption muted): „Daten: … Stand …“ und „„ab“-Preise …“. Unter 48 rem Aktionszeile (Textbuttons 2,75 rem, Haarlinie oben).

**Toasts:** unten mittig, 1,5 rem Abstand, Fläche teal-100 (bestehende Anatomie), Breite bis `min(36rem, 100vw − 2rem)`, Text bricht um. Liegt der Dialog offen, hängt der Toast **im Dialog** (Fokusfalle), pausiert bei Hover/Fokus, sichtbar sofort, versteckt erst nach dem Ausblenden (Aktion dann nicht fokussierbar). Verdeckt nie Kopf, CTA oder Fazit (beide oben).

**Druck:** nur der Vergleich; alle Modelle, G und Erklärsätze offen, Bilder 4 rem, keine Bedienelemente (CTA, ×, Schalter, Picker-▾, (i), Lesezeichen, Alternativen, Aktionszeile), Kopfzeile „edelstahl-tuerklingel.de · Kategorie · Datum“, Quellzeilen.

## 6 · Zustände

| Zustand | Darstellung |
|---|---|
| Fokus | Ring 0,1875 rem teal, Offset 0,125 rem (Liste: innen) |
| Unterschied | Abschnitt „Unterschiede (U)“ (Text + teal-100-Kopf) — nie nur Farbe |
| Bestwert | Caption-Pille teal/teal-100 + Wert 700 (nur IP/IK, alle Werte vorhanden) |
| k. A. / – | muted, Screenreader „keine Angabe im Shop“ / „trifft nicht zu“ |
| deaktiviert | „Zum Vergleich“: Rahmen g300, Text muted, `cursor:not-allowed` |
| Hover | nur Text-Buttons (Unterstreichung); Icons unverändert |
| reduzierte Bewegung | keine Übergänge (Dialog, Toast, Schalter, Chevron-Drehung, Tip) |

## 7 · Höhenbudget (gemessen, Details 12c)

| Messung | Grenze | Ergebnis |
|---|---|---|
| S3 1024 · erste U-Zeile | 384 px | 348 px |
| S3 375 · erste U-Zeile | 487 px | 464 px (482 px mit klassischer Scrollleiste) |
| S4 375 · erste U-Zeile | 487 px | 440 px |
| Sticky ab 1024 | 16 rem | max. 15,35 rem |
| Sticky 375 | 13 rem (13,5) | max. 12,86 rem (S4, aus allen Modellen inkl. 3-zeiligem Trias-Titel) |

Angewandte Hebel (12a §2.6): Fazit-Polster mobil 0,5 rem, Bildleiste 4,25 statt 4,5 rem. Titel, Fazit-Bausteine und Trefferflächen sind ungekürzt.

---

## 8 · Visual redesign 06.11. (ersetzt §3–§6 bei Widerspruch)

Ziel: ruhig und redaktionell, wenige Linien. Build `vergleichen.css?v=39` / `vergleichen.js?v=35`.

- **Fläche:**
  - eine weiße Fläche, keine Karte, keine senkrechten Linien;
  - Zeilen durch eine Haarlinie `--v-g100` getrennt;
  - Zellpolster 1 rem, damit 2 rem Spaltenabstand;
  - Labelspalte 14 / 12 / 11 rem (≥ 90 / 64–90 / 48–64 rem).
- **Produktkopf:** fünf Tabellenzeilen, damit alle Spalten dieselben Spuren haben. Er scrollt weg.
  1. **Aktionen:** Merken links, × rechts. Beides sind gedämpfte Icons mit 2,75-rem-Ziel und ohne Hover; nichts liegt auf dem Foto.
  2. **Bildkachel:** `--v-paper`, Radius l, ohne Rahmen. Höhe 11 rem bei 2–3 Modellen ab 90 rem, 9 rem bei 4 Modellen bzw. unter 90 rem, 7,5 / 6 rem darunter. In der Labelspalte steht in dieser Zeile die gleich große Kachel „+ Modell hinzufügen · noch n möglich".
  3. **Name:** h4, fett, ohne Kürzung. In der Labelspalte steht in dieser Zeile „Aus der Merkliste (n)".
  4. **Preis:** fett mit gedämpfter UVP in einer Zeile, der Preisabstand als Caption auf einer eigenen, immer reservierten Zeile.
  5. **CTA:** DS-Textlink.
- **Identitätsleiste:**
  - erscheint, sobald die CTA-Zeile aus dem Blick ist (IntersectionObserver);
  - feste Höhe: 4 rem, 3,5 rem auf dem Handy;
  - liegt über dem Inhalt, ohne ihn zu verschieben, im selben Spaltenraster (gemessen bei Render und Resize);
  - zeigt Thumbnail 2,5 rem, Name (höchstens 2 Zeilen), Preis (ab 90 rem) und CTA.
- **Abschnitte:**
  - Überschrift „Unterschiede 4": 1 rem fett plus gedämpfte Zahl, 2–2,25 rem Abstand darüber, Haarlinie `--v-g200` darunter;
  - keine Bänder, Pillen oder Kanten;
  - Gemeinsamkeiten zugeklappt als Textbutton „Gemeinsamkeiten anzeigen (n)".
- **Zeilen:**
  - Label body-sm 600; mit Definition ist es ein Toggletip-Button mit gepunkteter Unterstreichung statt eines (i);
  - Werte body, regular, nie fett; Mehrfachwerte als gestapelte Zeilen ohne Aufzählungszeichen;
  - k. A. und Bedeutungszeilen gedämpft;
  - Label und Wert stehen auf einer Grundlinie.
- **Farben:** Swatch in PLP-Sprache (quadratisch, Radius m, Innenring g300), 1,5 rem. Gleiche Slots in jeder Spalte; eine fehlende Farbe ist ein gestrichelter Slot. Sichtbar „7 Farben", die Namen nur für Screenreader.
- **Ähnliche Modelle:** Papierkacheln, keine Rahmen, Textlinks, 4 rem Abstand zur Tabelle.
- **Leiste:** Die Textaktionen sind gedämpft und werden bei Hover teal mit Unterstreichung.
- **Typografie:** h4 Namen · body Werte · body-sm Labels · caption Meta. Farben: ink, muted, teal (nur Links/CTA), Graphit-Haarlinien. Keine neuen Tokens; der Alias-Block ist um die nicht mehr genutzten Schatten verkleinert.
