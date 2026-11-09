# 12c · Vergleich-Redesign: Umsetzung und Prüfbericht (Lead UI Designer)

Stand: 05.11.2026 (inkl. CP4-Nachbesserung, §7) · Prototyp Version B (`Deliverables/vergleichen-flow-B/`) · nicht committet (Entscheidung der Nutzerin)
Grundlage: Brief 12 (AK 1–43), PO-Review CP1, UX-Spec 12a, UI-Spec 12b

---

## 1 · Was gebaut wurde

- **Render-Pfad neu geschrieben** (`renderView` und Helfer). Entfernt: „Auf einen Blick“ (`highlights`, `hlHTML`), Sprungmarken/Chips (`jumpTo`, `chipsAll`), „Alle technischen Details“ (`detailsOpen`), Zwillingsblock „Was der Aufpreis bringt“ (`gains`, `valueStatement`), Hinweise „Gleiche Design-Linie“/„Set vs. Einzelmodell“ (`guardsBK`, `guardsSprech`), Add-Spalte, Gruppenköpfe, Preis- und Design-Linie-Zeilen, „zusätzlich:/ohne:“. Im CSS wurden die Schichten „Version B“, „Flow-Audit (Overlay)“, „P0-8 phones“ und alle Überlagerungsregeln des alten Kopfs ersetzt; erhalten blieben unverändert die Blöcke für Toolbar, Kartenfeld, Tray, Tour, Suche, Teilen und die Toast-Anatomie.
- **Zeilen mit Klassen T/A/F** und festen Grammatikformen; **Zählregel U/O/G** inkl. Spannenregel Z2b (`analyzeAll`).
- **Fazit-Lückentext F0–F6** (inkl. F3a/b/c, Klassenregel K, Bauform-Zusatz) und Satz 2 neutral (`verdict`), **Erklärsätze E1, E2, E4, E10** (≤ 3, nur bei U-Zeile mit Auslösewert).
- **Titelregel** (Modellcode + Design-Linie, Kollision → unterscheidendes Segment in der Titelzeile) und **Ref** (Design-Linie, Zwilling „der Ausführung mit Aufpreis“, sonst Titel mit Artikel).
- **Ein Sticky-Kopf mit fester Höhe:** `lockHead()` setzt `--vgl-ph-h` = Maximum aller Modelle (bei Spaltenwahl auch der ausgeblendeten, in einer unsichtbaren Messzeile). Läuft nur bei Rendern/Resize, nie beim Scrollen.
- **Spaltenwahl** (< 48 rem: 2, 48–64 rem: 3): Titel-Button mit ▾ (`aria-haspopup=listbox`), Liste aller Modelle mit Ort, Nachbar = Tausch, Fokus bleibt auf dem Titel, Live „Spalte k zeigt jetzt …“, Pille „i / n“, „Unterschied bei: …“, Caption „– sichtbar: …“.
- **Abschnitte U / O / G** als `tbody` mit `th scope=rowgroup`; G zugeklappt, Schalter und G-Button teilen einen Zustand, Umschalten ohne Neu-Rendern; G-Werte als eine `colspan`-Zelle.
- **Rückgängig beim Entfernen** (Toast im Dialog, pausiert bei Hover/Fokus); Toast generell im Dialog, wenn er offen ist; geteilter Link: „Meine Auswahl (n)“ mit `aria-label` „… wiederherstellen“.
- **Mobil:** Tabelle mit expliziten ARIA-Rollen als Grid (Label über den Werten), Bildleiste, Aktionszeile (Hinzufügen, Merkliste, Teilen, Drucken, Leeren).
- **Druck:** alle Modelle (auch nach Spaltenwahl, die Auswahl bleibt danach erhalten), G und Erklärsätze offen.
- Nebenbei behoben: Tour-Schritt 4–6 schloss den Vergleich sofort wieder (spätes `popstate` aus `history.back()`; jetzt `closeView(true)` in `applyState`).

## 2 · Dateien und Versionen

| Datei | Änderung |
|---|---|
| `vergleichen-flow-B/vergleichen.js` | Render-Pfad neu, `?v=27 → 28`; CP4-Nachbesserung `→ 29` |
| `vergleichen-flow-B/vergleichen.css` | Overlay neu (§ „12 · Vergleich-Redesign“), Alt-Schichten entfernt, `?v=29 → 30`; CP4-Nachbesserung `→ 31` |
| `vergleichen-flow-B/index.html`, `briefkasten.html` | nur die beiden `?v=`-Parameter (diff gegen CP0: 2 Zeilen je Datei) |
| `Deliverables/12b_…`, `12c_…` | neu |

Unverändert (geprüft): `vergleich-daten.js` md5 `ca1ad449…` = CP0-Kopie; `tools/`, `plp.js`, `sprechanlage.js`, `merkliste.*`, `pdp/`, Version A und alle Pfade außerhalb.

## 3 · Messwerte (Browser-Pane, Transitions aus)

Desktop-Werte im Iframe gleicher Größe (klassische Scrollleiste), 375 px zusätzlich im Hauptfenster mit Mobil-Emulation. Sticky = Leiste + Kopf.

| Breite | S1 colson1,neo1 | S2 colson1,colson2 | S3 4 Modelle | S4 siebert,ebenhard,trias | S5 ebenhard,-v2a |
|---|---|---|---|---|---|
| 1920 | L 10 rem · 15,35 rem · U@386 | 15,35 · U@357 | L 7,5 rem · 15,10 · U@474 | L 10 rem · 15,35 · U@357 | 15,35 · U@357 |
| 1440 | L 10 rem · 15,35 · U@386 | 15,35 · U@357 | L 7,5 rem · 15,10 · U@474 | L 10 rem · 15,35 · U@357 | 15,35 · U@357 |
| 1024 | L 7 rem · 12,85 · U@342 | 14,23 · U@339 | **M · 13,23 rem · U@348 px** | M · 14,60 · U@345 | 13,18 · U@322 |
| 768 | M · 13,23 · U@372 | 14,60 · U@370 | M, 3 von 4 · 14,60 · U@394 | M · 15,98 · U@392 | 14,60 · U@370 |
| 375 | 11,66 · U@463 | 12,85 · U@440 | **11,69 rem · U@464 px** (Iframe 12,85 · 482) | **12,86 rem · U@440 px** | 11,79 · U@423 |

- **PO-Änderung 10:** S3 1024: Leiste 3,8 + Fazit (3 Zeilen) + Kopf + Abschnittskopf → erste U-Zeile **348 px ≤ 384**. S3 375: **464 px ≤ 487** (482 px mit Desktop-Scrollleiste). S4 375: **440 px ≤ 487**.
- **Sticky bei scrollTop 0 / 200 / 1000:** in allen 45 Kombinationen identisch (z. B. S3 1024: 211,6 / 211,6 / 211,6 px; S3 375: 187,1 / 187,1 / 187,1 px), `className` des Dialogs unverändert. Spaltentausch: S3 375 130,1 → 130,1 px, S4 375 148,8 → 148,8 px (Trias 3-zeilig).
- **`scrollWidth === innerWidth`:** ja in 45/45 Kombinationen (+ T-Fälle); Scrollbereich und Tabelle ohne Überlauf; 320 px ebenso (Leiste bricht um).
- **Bilder:** 1920/1440: 10 rem (2–3 Modelle), 7,5 rem (4); Labelspalte 15 rem (≥ 90 rem), 12 rem (1024), 11 rem (768).
- **Layout-Shift** (Öffnen + Scrollen 0→1000→0 + Schalter 2× + G-Button), S3 1440: **0,0000**.
- **Konsole:** keine Fehler (alle Szenarien, Tour, Druck-Simulation, Picker, Undo).
- **Daten (AK 26):** 117 von 117 Tabellenzellen in S1–S5 (G aufgeklappt) entsprechen `MTZ_VGL_DATA`.
- **Fazit-Texte** (Stand CP4, §7): Satz 1 wörtlich wie 12a §3.7; Satz 2 nach PO-Abnahme M2 neu formuliert (12a §3.3/§3.7 angepasst).
- **AK 8:** S1 „Lasergraviert“ 2× (1440 und 375); S2 „taster“ 5×.
- **Schriftgrößen** im Dialog: nur 12/14/16/18/20 px (Caption … h3).
- **Hover (computed style, `:hover`-Regeln als Klasse):** ×, Schließen, Lesezeichen, (i) identisch; CTA, Textbuttons, G-Button ändern nur die Unterstreichung.

## 4 · Prüftabelle AK 1–43

| AK | Status | Beleg |
|---|---|---|
| 1 | bestanden | S1 1440: Fazit oben (Satz 1 fett) nennt Namensschild, Farbe Weiß, Höhe, Gewicht; kein Zählwert-Fazit |
| 2 | bestanden | S1 „Colson kostet mehr und unterscheidet sich in: …“, S2/S5 „Die Ausführung mit Aufpreis unterscheidet sich in: …“; S3 „Die Preisunterschiede lassen sich deshalb keinem einzelnen Merkmal zuordnen.“; keine Wertung |
| 3 | bestanden | S2 F4 „… bis auf die Tasteranzahl“; S5 F3c; S1 F3b nennt Maße/Gewicht im selben Satz |
| 4 | bestanden | „VDM10 2.0 Colson · 1 Klingeltaster“, „Ebenhard · mit Edelstahlfront“ in Titelgröße, nie gekürzt |
| 5 | bestanden | „Auf einen Blick“/„Keine Besonderheit“ entfernt |
| 6 | bestanden | S4: F1-Satz, „nicht als Aufpreis vergleichbar“, kein Δ im Kopf |
| 7 | bestanden (Anm.) | ein CTA je Spalte im Sticky-Kopf; unterhalb des Tabellenendes (Alternativen, Quelle) verlässt der Kopf mit der Tabelle die Ansicht — eine Scrollbewegung zurück |
| 8 | bestanden | S1 „Lasergraviert“ 2× (1440 und 375), S2 „taster“ 5×, „Shopdaten“ höchstens 1× je Fazit (CP4); G zeigt jeden Wert einmal (`colspan`) |
| 9 | bestanden | Preis + Δ nur im Kopf, Design-Linie nur im Titel |
| 10 | bestanden | Fazit → Köpfe → U → O → G (zu) → [Alternativen] → Quelle |
| 11 | bestanden | alle U-Zeilen ohne Aufklappen sichtbar |
| 12 | bestanden | S3: Schalter (8) = „Unterschiede (8)“ = „insgesamt 8“; 8+5+1 = 14 Zeilen; S4 5+3+1 = 9 |
| 13 | bestanden | Labelspalte 15/12 rem; Kopfzelle mit „Modell hinzufügen“ bzw. „4 von 4“ |
| 14 | bestanden | 45/45 ohne horizontales Scrollen |
| 15 | bestanden | 1920/1440: 2–4 Modelle ohne Scrollen, Bild 10/7,5 rem, Container 100 rem |
| 16 | bestanden | 1024 S3: 4 Spalten, U@348 px |
| 17 | bestanden | 768: 3 Spalten, U ≤ 394 px |
| 18 | bestanden | Spaltenwahl mit allen Bestandteilen; S3 U@464 px; T3 U@462 px (CP4) |
| 19 | bestanden | `hyphens:manual`; Toasts unten, umbrechend, max. 36 rem, im Dialog |
| 20 | bestanden | alle Bedienelemente ≥ 2,75 rem (CTA, ×, ▾, „Was bedeutet das?“, G-Button über `::before`) |
| 21 | bestanden | gleich breite Spalten, keine Add-Spalte, „Aus der Merkliste (n)“ im Labelkopf/Aktionszeile |
| 22 | bestanden | × → Fokus auf nächstes ×, Live „… entfernt. Vergleich mit 3 Modellen.“; 2 → 1 Leerzustand; Rückgängig stellt Position wieder her; auch direkt nach einem geteilten Link (S7, CP4 M1) |
| 23 | bestanden | identische Höhe bei 0/200/1000, keine Klasse wechselt |
| 24 | bestanden | ab 1024 max. 15,35 rem; 375 max. 12,86 rem (S4, aus allen Modellen), Tausch ±0 |
| 25 | bestanden | Titel, Preis, × und CTA im Sticky-Kopf |
| 26 | bestanden | 117/117 Zellen; jede Fazit-Aussage stammt aus einer U/O-Zeile |
| 27 | bestanden | k. A./– mit SR-Text; leere Zeilen ausgeblendet; O-Abschnitt inkl. überlappender Spannen (S5, T2) |
| 28 | bestanden | Bestwert nur IP/IK bei vollständigen Werten (in S1–S5 nie erfüllt → nicht gezeigt) |
| 29 | bestanden | Quellzeile im Dialog und im Druck |
| 30 | bestanden | Farbzeile ohne Zusatz; `vergleich-daten.js` byte-gleich CP0 |
| 31 | bestanden | `role=dialog`, `aria-modal`, `h2`, Fokusfalle (nur gerenderte Elemente), Escape: Tip → Picker/Suche/Teilen → Dialog, Fokus zurück zum Auslöser |
| 32 | bestanden | `caption`, `th scope`, explizite Rollen; mobil Grid mit Tabellenrollen |
| 33 | bestanden | Tab-Folge: Leiste (Schalter …) → „Was bedeutet das?“ → Labelkopf → je Spalte [Lesezeichen] [Titel-Picker] CTA × → (i) → „Anzeigen“ → Alternativen → Aktionszeile → Toast |
| 34 | bestanden (rechnerisch) | Text muted 5,3:1, teal 9,9:1, teal auf teal-100 ≈ 8,6:1; Schalterspur aus = muted (≥ 3:1); Unterschiede per Abschnittstitel |
| 35 | bestanden (Anm.) | reduzierte Bewegung deaktiviert alle Übergänge des Overlays; 320 px ohne Verlust. Das bestehende Smooth-Scroll zum Kartenraster („Auf der Produktliste wählen“) liegt außerhalb des Dialogs und blieb unverändert |
| 36 | bestanden | Schalter, G-Button, Entfernen/Rückgängig, Hinzufügen, Spaltentausch werden angesagt |
| 37 | bestanden | keine Verbotswörter, durchgehend „Sie“ |
| 38 | bestanden | nur 0,75–1,25 rem; neue Zeilen ohne px/Hex/`rgba(` außer im Token-Block; Schatten = DS `--shadow-card/-hover/-tooltip`, Swatch-Rand g300 (CP4 M3) |
| 39 | bestanden | Lesezeichen-Glyph; Icon-Hover identisch; Fokusring bleibt |
| 40 | bestanden | CLS 0,0000; Bilder mit reservierter Box; Schalter ändert weder Breiten noch Kopfhöhe |
| 41 | bestanden | keine Konsolenfehler |
| 42 | bestanden | `&von=merkliste` → „← Merkliste“ öffnet die Merkliste; `?vergleich=` öffnet/Reload; geteilter Link + „Meine Auswahl (2)“; Link kopieren (ohne Clipboard-Recht: Kopierfeld); Drucken; Leeren + Rückgängig; andere Kategorie; beide Lenses; Tour |
| 43 | bestanden | Diff gegen CP0 nur in `vergleichen.js/css`, den `?v=`-Zeilen und 12b/12c |

## 5 · Abweichungen von 12a (begründet) und bekannte Lücken

1. **T3 `trias,quartett` bei 375 px:** *(behoben in CP4, F1)* vorher 503 px; mit der Kurz-Referenz „Das Modell mit dem höheren Preis“ jetzt **462 px** (≤ 487), Fazit 6 statt 8 Zeilen, Sticky 12,88 rem.
2. **Titel ohne Design-Linie** (Trias) brauchen im L-Kopf bei 3 Modellen (1440/1920) und im M-Kopf bei 768 px **3 Zeilen**. Sie werden nicht gekürzt (AK 4), die Kopfhöhe ändert sich dadurch nicht (das Bild ist höher). 12a „höchstens 2 Zeilen“ ist dort nicht erfüllt.
3. **768 px, 2 Modelle → M statt L 6 rem:** Mit 6-rem-Bild bliebe eine Textspalte von 8 rem, „VDM10 2.0 Colson · 1 Klingeltaster“ bräuchte 3 Zeilen. Regel: L nur, wenn die Textspalte ≥ 9 rem ist (ab 90 rem immer L, AK 15).
4. **Labelspalte 12 rem bei 64–90 rem** (12a: 15 rem), damit 4 Modelle bei 1024 ohne Scrollen in den M-Kopf passen (AK 13: ≤ 15 rem).
5. **Sticky bei 768 px bis 15,98 rem** (S4) — für 768 gibt es keine Höhengrenze (AK 24 gilt ab 1024 und bei 375); erste U-Zeile ≤ 394 px.
6. **Lesezeichen im M-Kopf:** Das Merkliste-Add-on setzt sein Lesezeichen in jedes `.vgl-ph__media`. Auf dem 3,5-rem-Thumbnail war der schwarze Glyph auf dunklen Fotos unsichtbar; er sitzt dort jetzt als kleines weißes Badge (nur CSS in `vergleichen.css`, statisch, gleich bei Hover). `merkliste.js` ist unverändert; damit das Lesezeichen weiter gefunden wird, trägt jede Bildbox einen versteckten `data-rm`-Marker.
7. **Kein separates CP2-Mock:** Der Build selbst diente als Mock; die Messung nach PO-Änderung 10 erfolgte mit echten Texten am Build (§3).
8. **Escape bei offener Merkliste über dem Vergleich** schließt beide (bestehender Dokument-Listener beider Add-ons; nicht im Scope, `merkliste.*` gesperrt).
9. **Link kopieren** im automatisierten Browser: ohne Clipboard-Recht erscheint das bestehende Kopierfeld (gewolltes Fallback).

## 7 · CP4-Nachbesserung (PO-Abnahme `12_Vergleich-Redesign_PO-Abnahme-CP4.md`)

Build: `vergleichen.js?v=29`, `vergleichen.css?v=31` (beide Seiten). Geprüft mit Transitions aus, Speicher geleert, Viewport zurückgesetzt; keine Konsolenfehler.

| Punkt | Änderung | Nachprüfung |
|---|---|---|
| **M1** Rückgängig bei sichtbarem Fremd-Toast (S7) | Ursache: Der Ankunfts-Toast („Geteilter Vergleich geöffnet.“) kam 300 ms verzögert und überschrieb einen inzwischen gezeigten Entfernen-Toast. Neu `toastSoon()`: Jeder neuere Toast bricht den wartenden ab; der Entfernen-Toast ersetzt den sichtbaren. | S7, 375 px: × sofort nach dem Öffnen → „Maxior entfernt. Rückgängig“ bleibt; × bei sichtbarem „Geteilter Vergleich geöffnet. Meine Auswahl (2)“ (gehovert und fokussiert) → „SDM10X entfernt. Rückgängig“, Rückgängig stellt die Position wieder her. |
| **M2** Fazit ohne Wiederholung | „laut Shopdaten“ nur noch in Satz 1. Satz 2: „{Ref} kostet mehr und unterscheidet sich in: …“, Zwillinge „Die Ausführung mit Aufpreis unterscheidet sich in: …“; „weitere Unterschiede zeigen die Shopdaten nicht“ entfällt (Satz 1 sagt es schon). 3–4 Modelle: F6 „… lassen sich deshalb keinem einzelnen Merkmal zuordnen.“; F3–F5 nennen nur, was Satz 1 noch nicht nennt. Gleicher Preis unverändert. Tabellentext bei U = 0: „Keine belegten Unterschiede.“ | „Shopdaten“ im ganzen Dialog: S1 1, S2 1, S5 1, T1 1, T2 1, S3/S4/T1b/T3 0 (1440 und 375). |
| **M3** keine erfundenen CSS-Werte | `--v-shadow-sm/-lg` → `--v-shadow-card` = `var(--shadow-card, DS-Wert)`, `--v-shadow-hover` (Popover), `--v-shadow-tip` = `--shadow-tooltip` ((i)); Swatch-Rand → `var(--v-g300)`; doppelte `.vgl-spot`-Schattenzeile in der Reduced-Motion-Regel entfernt (Grundregel unverändert). | Neue CSS-Zeilen: `rgba(` nur noch als Fallback im Token-Block. |
| **F1** Kurz-Referenz | Titel länger als 24 Zeichen (Artikel ohne Design-Linie) heißen in Satz 2 „Das Modell mit dem höheren Preis“ (nie „günstig“). | T3 375 px: erste U-Zeile **462 px** (vorher 503), Sticky 206 px = 12,88 rem bei 0/200/1000. |
| **F2** Alternativen bei Zwillingen | Varianten, die sich nur in der Tasteranzahl unterscheiden, fallen heraus; bleibt nichts, erscheinen sie unter „Andere Tasteranzahl“. | S1: „ADM10 Kai (Typ: Audio)“, „ADM10 Dominik (Typ: Audio)“, „Video-Türsprechanlage mit Paketbox“ statt Neo 3T/2T und Kian 2T. |
| **F6** Strg+P | `beforeprint`/`afterprint` lösen dieselbe Vorbereitung wie „Drucken“ aus (alle Spalten, G und Erklärsätze offen, `vgl-printing`) und stellen danach den Zustand wieder her. | S3 375: `beforeprint` → 4 Spalten, G offen, Erklärung offen; `afterprint` → 2 Spalten, G zu. |

**Neue Fazit-Texte (wörtlich, Satz 1 + Satz 2):**
- **S1:** „Laut Shopdaten technisch gleich, aber in Maßen und Gewicht verschieden. Colson kostet mehr und unterscheidet sich in: Namensschild Lasergraviert statt Austauschbar (Papiereinleger), zusätzlich die Farbe Weiß, Höhe 27,4 statt 29 cm, Gewicht 2,12 statt 2,39 kg.“
- **S2:** „Laut Shopdaten technisch gleich bis auf die Tasteranzahl. Die Ausführung mit Aufpreis unterscheidet sich in: 2 statt 1 Taster.“
- **S3:** „Technisch verschieden – vor allem im Typ (Kai: Audio, sonst Video) und im System (Maxior: 2-Draht-BUS, sonst IP-System); insgesamt 8 Unterschiede, 5 Merkmale nicht für alle gepflegt. Die Preisunterschiede lassen sich deshalb keinem einzelnen Merkmal zuordnen.“
- **S4:** unverändert.
- **S5:** „Laut Shopdaten technisch gleich, beim Gewicht nicht eindeutig (je nach Ausführung). Die Ausführung mit Aufpreis unterscheidet sich in: nur Edelstahl statt 7 Farben.“
- **T1:** „Laut Shopdaten technisch gleich bis auf die Montageart, außerdem in Maßen und Gewicht verschieden, beim Material nicht eindeutig (k. A.). Alves kostet mehr und unterscheidet sich in: Montageart Standmontage statt Aufputz, 3 statt 7 Farben, Maße 39,5 × 115 × 14,3 statt 37 × 37 × 10,5 cm, Gewicht 9,9 statt 3,4 kg.“
- **T2:** unverändert.
- **T3:** „Technisch verschieden – vor allem in der Fächerzahl und in der Montageart; insgesamt 4 Unterschiede. Das Modell mit dem höheren Preis unterscheidet sich in: Fächer 4 statt 3, Montageart Aufputz statt Standmontage, Maße 78 × 69 × 12 statt 12 × 160 × 78 cm, Gewicht 30 statt 37,2 kg.“

**Kontrollmessung nach CP4 (Iframe, 1440 / 375):**
- Erste U-Zeile bei 375 px: S1 442, S2 398, S3 482 (Hauptfenster 464), S4 440, S5 402, T2 385, T3 461 (Hauptfenster 462) px.
- Sticky bei 1440 / 375: unverändert, höchstens 15,35 / 12,85 rem.
- `scrollWidth = innerWidth` überall.
- Zählungen (AK 8): S1 „Lasergraviert“ 2×, S2 „taster“ 5×.
- Verbotswörter: keine.

## 8 · UX-Review 06.11. (Umsetzung)

Build `vergleichen.js?v=30`, `vergleichen.css?v=32`. Die PLPs und `vergleich-daten.js?v=4` stammen aus dem Live-Shop-Neuaufbau und sind unverändert. Geprüft im Browser-Pane:
- Transitions aus, Speicher geleert, Viewport zurückgesetzt;
- 1920 / 1440 / 1024 / 768 / 375;
- keine Konsolenfehler.

Regeln siehe 12a §11. Bei Widerspruch ersetzt dieser Abschnitt §3–§7.

**Fazit (wörtlich):**
- `colson1,neo1`: „Laut Shopdaten fast baugleich – der Unterschied ist das Namensschild: graviert bei Colson, austauschbar bei Neo; außerdem die Farben." (19 Wörter)
- `colson1,colson2`: „Laut Shopdaten technisch gleich bis auf die Tasteranzahl: 2 bei der Ausführung mit Aufpreis, 1 bei der anderen." (18)
- `dominik1,sdm10x,colson1,kai1`: „Technisch verschieden – vor allem der Typ (Kai: Audio, sonst Video) und das System (Maxior: 2-Draht-BUS, sonst IP-System). Die Preisunterschiede lassen sich keinem einzelnen Merkmal zuordnen." (26, zwei Sätze)
- `siebert,ebenhard`: „Laut Shopdaten fast baugleich bei gleichem Preis – der Unterschied ist das Material: Edelstahl V4A bei Siebert, Edelstahl bei Ebenhard." (20)
- `siebert,albrecht,cube-stand`: „Laut Shopdaten technisch gleich bis auf die Montageart (Cube: Standmontage, sonst Aufputz); außerdem das Material und die Farben." (18)

**Messwerte:**

| Größe | Wert |
|---|---|
| Kopfhöhe 1440 (2–3 Modelle, Bild 10 rem) | 176,8 px (vorher 185); Sticky 237,6 px = 14,85 rem, konstant bei 0/200/1000 |
| Erste Unterschiedszeile 1440 | 348 / 323 / 346 / 348 / 348 px (5 Fälle oben) |
| Erste Unterschiedszeile 375 | 367 / 386 / 428 / 388 / 367 px (Iframe mit Scrollleiste) |
| Sticky 375 | max. 194,6 px = 12,2 rem |
| Erste Unterschiedszeile 1024 / 768 | 1024: 308–352 px; 768: 328–377 px |
| Horizontales Scrollen | keines |

Weitere Prüfungen:
- „graviert" kommt in S1 2× vor (Zelle + Fazit), „Shopdaten" 1×, keine Verbotswörter.
- Schließen-× und (i)-Glyph sind beim Hover unverändert; beim (i) erscheint auf Hover nur der Tip, das Symbol selbst ändert sich nicht. Das × misst 2,75 × 2,75 rem und sitzt bündig oben rechts im Bild.
- `beforeprint` öffnet die Gemeinsamkeiten, `afterprint` stellt den vorherigen Zustand wieder her.

**Abweichungen:**
1. **Preis im Fazit:** Die Preisdifferenz steht nicht im Fazit, nur im Kopf, damit nichts doppelt steht. Ausnahmen sind „bei gleichem Preis", die andere Produktklasse und 3–4 technisch verschiedene Modelle.
2. **× auf dem Handy:** Dort hat der Kopf kein Bild, und die Bildleiste scrollt weg. Das × steht deshalb rechts in der Aktionszeile, getrennt vom CTA.
3. **Preisabstand auf dem Handy:** Kurzform „+ 51,00 €" neben der UVP (gedämpft). Sonst würde die Sticky-Höhe 13 rem überschreiten. Screenreader hören „51,00 € mehr als die andere Ausführung".
4. **Ähnliche Modelle:** In `colson1,colson2`, `dominik1,…` und `siebert,albrecht,cube-stand` erscheint kein Abschnitt, entweder weil es kein Fall „fast baugleich" ist oder weil es keinen passenden Treffer gibt.

## 9 · Visual redesign 06.11. (Umsetzung)

Build `vergleichen.js?v=35`, `vergleichen.css?v=39`; System siehe 12b §8. Geprüft im Browser-Pane:
- `briefkasten.html?vergleich=siebert,ebenhard,moris`, `index.html?vergleich=colson1,neo1` und `index.html?vergleich=dominik1,sdm10x,colson1,kai1`;
- bei 1920 / 1440 / 1280 / 1024 / 768 / 375;
- Transitions aus, danach Speicher geleert und Viewport zurückgesetzt.

| Messung | Ergebnis |
|---|---|
| Name, Preis, Bild und CTA auf gleicher Höhe in allen Spalten | ja, in 18 von 18 Fällen |
| Kopfhöhe (nicht sticky) | 1440/1920 bei 2–3 Modellen: 370 px (Bild 176 px = 11 rem); bei 4 Modellen 338 px; 1024: 338–379 px; 375: 275–292 px |
| Identitätsleiste | 64 px (4 rem), 375: 56 px (3,5 rem); konstant bei scrollTop 0/300/800/1500; erscheint, sobald die CTA-Zeile aus dem Blick ist |
| Erste Datenzeile | 1440: 499 px (4 Modelle 467); 375: 381–397 px |
| Horizontales Scrollen | keines |
| Spaltentausch (375, Spaltenwahl) | Kopfhöhe 292 → 292 px |
| Druck | `beforeprint` zeigt alle Spalten, Gemeinsamkeiten offen, keine Leiste; `afterprint` stellt den vorherigen Zustand wieder her |
| Tastatur | Schließen → Merken/× je Spalte → Spaltenwahl → CTAs → Labels mit Erklärung → „Gemeinsamkeiten anzeigen" → Aktionen |
| Toggletip | Escape schließt erst den Tipp, dann den Dialog |
| Konsole | keine Fehler |

**Entfernte CSS-Blöcke:**
- § 12 Vergleich-Redesign 05.11.: Kartenrahmen und Schatten, sticky `thead`, L/M-Kopf, Bildleiste, Lesezeichen-Badge, (i)-Glyph, Aufzählungspunkte;
- „Header polish (Lead UI, 06.11.)": × auf der Titelzeile, Spaltenlinien, gestrichelte Add-Kachel;
- „Table structure (Lead PD, 06.11.)": Bänder, Zählpillen, Teal-Kante, stärkere Labellinie;
- `is-unpinned` und `is-L` / `is-M`;
- die ungenutzten Token-Aliase `--v-shadow-card` und `--v-teal-600`.

Ersetzt wurden sie durch einen zusammenhängenden Overlay-Abschnitt. Toolbar, Tray, Tour, Toast, Suche und Teilen sind unverändert.

**Abweichungen:**
1. Die erste Datenzeile liegt tiefer als die alten Grenzen aus AK 16/18 (≤ 384 bzw. ≤ 487 px); bei 375 px hält sie die Grenze ein. Grund ist der große, nicht klebende Kopf nach der Art Direction.
2. Die Leiste wechselt beim Scrollen eine Klasse (`is-pinned`). Ihre Höhe ändert sich nie. Das entspricht dem vereinbarten Ansatz mit separater Identitätsleiste statt Größenänderung, widerspricht aber dem Wortlaut von AK 23.
3. In der Leiste steht kein ×, wie vorgegeben (Bild, Name, Preis, CTA). AK 25 sah „Entfernen" im Sticky-Bereich vor; Entfernen ist im Kopf möglich.
4. Der Name in der Leiste wird nach 2 Zeilen gekürzt (mobil nach 1 Zeile). Der volle Name steht im `title` und im Kopf; AK 4 gilt dort.

## 6 · Kundenentscheidungen (Protokoll)

Aus Brief §7 umgesetzt: Erklärsätze nur aus der freigegebenen Kurzliste (E1, E2, E4, E10); Spaltenwahl als mobiles Muster (PO-Freigabe CP1); UVP bleibt, kleiner und ruhiger (Caption, muted, durchgestrichen); andere Klasse erlaubt mit Hinweis ohne „Aufpreis“; Overlay bleibt. Offen bei der Nutzerin: Richtungsfreigabe der Liste 12a §2.8 und Token-Vorschläge P1–P4 (12b §2).

**Nachtrag (Lead-UX-Prüfung):** Die Farbnamen-Liste unter den Swatches wiederholte in jeder Spalte dieselben Namen → sichtbar nur noch „n Farben“, die Namen bleiben für Screenreader (`vgl-visually-hidden`) und als Swatch-Tooltip. `vergleichen.js?v=31`.

## 9. Entscheidungen der Nutzerin 06.11. + UI-Feinschliff Kopfbereich

- **Fazit entfernt** (Nutzerin: „the text is not needed"): kein Zusammenfassungssatz mehr über den Modellköpfen. Es bleibt nur der Datenhinweis, wenn ein Modell keine Shopdaten hat. Damit entfällt auch der Klassenhinweis (Einzel- vs. Mehrfamilienanlage). Tour-Schritt 4 angepasst.
- **Quell-/Preiszeile unten entfernt** (Nutzerin): „Daten: Metzler Shop (JTL-Wawi), Stand …" und der „ab"-Preis-Hinweis werden nicht mehr angezeigt. Das ersetzt PO-Kriterium 29 und die Footer-Regel aus Doc 11.
- **Kopfbereich (Lead UI):** × sitzt nicht mehr auf dem Foto, sondern oben rechts in der Spalte auf Höhe des Titels; Preis und UVP stehen in einer Zeile (Preis in h4), die Preisdifferenz leise darunter; feine Spaltentrenner in Kopf und Tabelle; „Modell hinzufügen" ist eine gestrichelte Kachel in Bildhöhe. Kompakt- und Handy-Layout unverändert. Geprüft bei 1600, 1024 und 375 px: kein seitliches Scrollen, keine Konsolenfehler. `vergleichen.js?v=33`, `vergleichen.css?v=34`.

## 10. Tabellenstruktur (Lead PD, 06.11.) + Fehlerbehebung

- **Fehler:** Beim Öffnen bekam der Titel „Vergleich (n)" einen sichtbaren Fokusrahmen (der Fokus springt für Screenreader auf die Überschrift). Ursache: die allgemeine Fokusregel `.vgl-view :is(…,[tabindex]):focus-visible` traf auch `tabindex="-1"`. Sie schließt `tabindex="-1"` jetzt aus; die Überschrift zeigt keinen Rahmen, Bedienelemente behalten ihren Fokusring (mit Tastatur geprüft, `vergleichen.css?v=38`).
- **Abschnitte als Bänder:** Unterschiede / Nicht für alle gepflegt / Gemeinsamkeiten sind getönte Bänder mit Haarlinie oben und unten; die Anzahl steht als Pille (Unterschiede: Teal-Pille + Teal-Kante links), Klammern entfallen.
- **Kurzer Hinweistext** bei „Nicht für alle gepflegt": „Ohne Shop-Angabe („k. A.") oder je nach Ausführung – zählt nicht als Unterschied."
- **Spalten:** stärkere Trennlinie zwischen Merkmalsspalte und Werten, feine Linien zwischen den Modellen; gleichmäßigere Zeilenhöhe; (i) auf die Textzeile ausgerichtet.
- „Modell hinzufügen" bricht in der gestrichelten Kachel nicht mehr um (1280 px).
- Geprüft bei 1800, 1280 und 375 px: kein seitliches Scrollen, keine Konsolenfehler. `vergleichen.js?v=34`, `vergleichen.css?v=37`.

## 11. Platz (Lead UX/UI, 06.11.) + Hinweis-Icon

- **Weniger Leerraum, gleiche Ruhe:** Merken und Entfernen sitzen in den oberen Ecken der Bildkachel (das Foto ist eingerückt, die Icons liegen nie darauf) – die eigene Aktionszeile entfällt. Die Kachel ist 9 rem statt 11 rem hoch (8 rem bei 4 Modellen ≥ 90 rem, 7 rem < 64 rem). Name → Preis → Link enger, weniger Luft über Abschnittsüberschriften und in den Zeilen.
- **Leere Merkmalsspalte im Kopf:** „Modell hinzufügen" ist ein Platzhalter über die ganze Kopfhöhe (wie ein leerer Modellplatz), „Aus der Merkliste (n)" darin; bei 4 von 4 der Hinweis.
- Ergebnis bei 1880 × 980 (3 Briefkästen): erste Datenzeile bei 389 px statt ca. 650 px; der ganze Vergleich passt auf einen Bildschirm. Bei 1024 px (4 Modelle): Links auf einer Linie, Leiste deckungsgleich mit den Spalten.
- **Hinweis-Icon (Nutzerin):** Merkmale mit Erklärung zeigen wieder ein (i)-Icon hinter dem Namen statt einer gepunkteten Unterstreichung. Icon ohne Hover-Effekt, 2,75 rem Klickfläche, geöffnet teal, Escape schließt zuerst den Hinweis.
- `vergleichen.js?v=38`, `vergleichen.css?v=44`.

- **Weiße Bildkacheln (06.11., Nutzerin: alle Shopfotos haben weißen Hintergrund):** Bildkacheln, Leisten-Vorschaubilder und „Ähnliche Modelle" sind weiß mit Haarlinie (wie die PLP-Karten) statt Paper + Multiply; das Foto füllt die Kachel (128 px statt ca. 90 px bei 1800 px Breite). Der leere „Modell hinzufügen"-Platz ist gestrichelt auf Weiß. `vergleichen.css?v=45`.

- **Sternebewertung im Kopf (06.11.):** zwischen Name und Preis, wie auf der Live-Karte (volle/halbe/leere Sterne in `--color-star`, Bewertungsanzahl gedämpft); Werte aus den Produktdaten (z. B. Siebert 5/763, Moris 4,5/31); Zeile in jeder Spalte reserviert; Screenreader: „4,5 von 5 Sternen, 31 Bewertungen".
- **Fehler behoben:** Seit die Kopfzeilen Name/Preis/Link keine Merkmalszelle mehr haben, erbte die erste Modellspalte deren Abstände (Desktop: Name 1 rem links neben der Bildkachel; Handy: Sterne/Preis 10 px tiefer). Jetzt in allen Spalten bündig (geprüft bei 1440 und 375 px). `vergleichen.js?v=39`, `vergleichen.css?v=47`.

- **Gemeinsamkeiten (06.11.):** zugeklappt kein einzelner Link mehr, sondern eine Abschnittsleiste wie die anderen: „Gemeinsamkeiten 3", die gemeinsamen Merkmale gedämpft in einer Zeile (z. B. „Fächer / Parteien · Klingel / Sprechanlage · Montageart"), rechts „Anzeigen"; die ganze Leiste ist klickbar. Aufgeklappt: statt einer fast leeren, vollbreiten Zeile je Merkmal ein Raster aus Merkmal/Wert-Paaren über die volle Breite (ab 15 rem je Feld, auf dem Handy 2 Spalten); Hinweis-Icons bleiben, Screenreader hören „gilt für alle n Modelle". `vergleichen.js?v=41`, `vergleichen.css?v=49`.

- **Sterne neben dem Titel (06.11.):** Bewertung in Kartengröße (1,25 rem Sterne, Anzahl in body-sm) auf der Titelzeile, rechtsbündig gegenüber dem Namen (bündig mit dem × darüber). In engen Spalten (< 20 rem, z. B. 4 Modelle bei 1024 px oder Handy) eigene Zeile direkt unter dem Namen, in allen Spalten auf gleicher Höhe – gemessen bei Darstellung/Größenänderung, nie beim Scrollen. `vergleichen.js?v=43`, `vergleichen.css?v=53`.

- **Grauer Kopfbereich (06.11.):** Der ganze Produktkopf (Hinzufügen-Platz + Modellspalten) liegt auf einer grauen Fläche (`--v-paper`, abgerundet, 1 rem Innenabstand), die weißen Bildkacheln wirken als Karten. Handy: gleiche Fläche über die sichtbaren Spalten. `vergleichen.css?v=54`.

- **Graue Fläche über die volle Breite (06.11.):** Der Kopfbereich reicht als grauer Streifen bis an beide Ränder des Vergleichsfensters (eckig), die Inhalte bleiben im Spaltenraster. Umsetzung ohne Layout-/Scroll-Einfluss: nur die äußeren Zellen verlängern die Fläche per geclipptem Schatten (Handy: je Kopfzeile). Druck ohne Streifen. `vergleichen.css?v=56`.

- **Farbe + Trennung im Tabellenteil (06.11.):** Merkmalsspalte auf Paper-Ton (Spaltentrennung ohne Zusatzlinie), Haarlinien zwischen den Modellspalten; „Unterschiede" als entscheidender Abschnitt in Teal (Überschrift, Teal-Zählpille, 3 px Teal-Kante an jedem Merkmal), übrige Abschnitte neutral (graue Pille); zugeklappte Gemeinsamkeiten-Leiste auf Paper. Abschnittsüberschriften bündig mit den Merkmalsnamen. Handy: Merkmalsname als Paper-Band über den Werten.
- **Fehler behoben:** Der graue Kopfstreifen erreichte bei manchen Breiten die Ränder nicht (Schatten war versetzt statt ausgedehnt) – jetzt durchgehend randlos. `vergleichen.css?v=58`.

- **Gemeinsamkeiten unterscheidbar (06.11.):** Die zugeklappte Leiste wirkte wie eine weitere Tabellenzeile (gleiches Grau wie die Merkmalsspalte, direkt an der letzten Zeile). Jetzt eigenes Element: Abschnittsabstand darüber, weiße Karte mit Haarlinie und abgerundeten Ecken, Häkchen-Icon (Teal) für „gemeinsam", Merkmalsnamen gedämpft, „Anzeigen" rechts; die ganze Karte ist klickbar (nicht der Abstand darüber). Aufgeklappt: normale Abschnittsüberschrift mit demselben Icon, darunter das Raster. `vergleichen.js?v=44`, `vergleichen.css?v=59`.

- **Gemeinsamkeiten aufgeklappt (09.11., Lead Design):** Vorher Überschrift eingerückt, Raster bündig links, einzelne Unterstriche mit Lücken, Leerraum rechts. Jetzt dieselbe weiße Karte wie zugeklappt, nur geöffnet: Kopf (Icon, Titel, Anzahl, „gilt für alle n Modelle", Ausblenden) oben, darunter ein Datenblatt-Raster, dessen Zellen sich saubere Haarlinien teilen und die volle Kartenbreite füllen (auto-fit, ≥ 14 rem; Handy ≥ 9 rem = 2 Spalten). Merkmal gedämpft, Wert fett. (i) folgt dem Merkmalsnamen und wird nie abgeschnitten. `vergleichen.css?v=65`.
- Gemeinsamkeiten-Leiste grau (09.11., Nutzerin): zugeklappte Leiste und Kopf der geöffneten Karte auf `--v-paper`, Zählpille weiß; das geöffnete Raster bleibt weiß. `vergleichen.css?v=66`.
- **Abschnittszahlen (09.11., Lead Design):** keine Pillen mehr (drei Stile, weiß auf Grau, nicht auf der Grundlinie). Eine typografische Zahl für alle Abschnitte: gleiche Größe wie die Überschrift, normal, gedämpft, Tabellenziffern, auf der Grundlinie der Überschrift. `vergleichen.css?v=68`.
- **Keine Zahlen an den Abschnittsüberschriften (09.11., Nutzerin):** Unterschiede / Nicht für alle gepflegt / Gemeinsamkeiten ohne Anzahl (offen und zugeklappt). Die Gemeinsamkeiten-Schaltfläche nennt die Anzahl weiter im Screenreader-Namen. `vergleichen.css?v=70`.
- „gilt für alle n Modelle" im Kopf der geöffneten Gemeinsamkeiten-Karte entfernt (09.11., Nutzerin); Screenreader hören den Hinweis weiter im Raster. `vergleichen.css?v=71`.
- **(i)-Platzierung (09.11., Lead Product Design):** feste Position statt hinter dem Text: rechtsbündig in der Merkmalszelle (16 px Abstand), mittig zur ersten Textzeile – alle Icons bilden eine senkrechte Linie, lange Namen umbrechen, ohne das Icon zu verschieben; gleiche Stelle oben rechts in den Gemeinsamkeiten-Zellen; auf dem Handy am rechten Ende des Merkmalsbands. Gemessen: Abstand rechts überall gleich, vertikal ±1 px zur Textzeile; Hinweis bleibt im Bild. `vergleichen.js?v=48`, `vergleichen.css?v=73`.
- **Leichtere Erklär-Pop-ups (09.11.):** weiß mit Haarlinie und weichem Schatten statt schwarzem Block, dunkle Schrift; Begriffslisten („Lasergraviert: … Austauschbar: …") je Begriff eine Zeile, Begriff fett, Erklärung gedämpft; Einzelsätze und „z. B." bleiben unverändert. `vergleichen.js?v=50`, `vergleichen.css?v=74`.
- **Erklär-Pop-up gestaltet (09.11.):** Teal-Akzentlinie oben, Kopfzeile mit Teal-(i) und Merkmalsname, Erklärung gedämpft darunter; passt sich bis 20 rem dem Inhalt an. `vergleichen.js?v=51`.
- **Radien = Design-System (09.11.):** `--radius-sm` 2 px Badges · `--radius` 4 px Buttons/Eingaben/Checkboxen · `--radius-lg` 8 px Karten · `--radius-xl` 12 px Pop-ups/Modals. Korrigiert: Erklär-Pop-up, Spaltenwahl, Teilen-/Such-Pop-up, Tour-Karte, Hinweise (8 → 12 px); Checkbox 3 → 4 px; Tour-Spotlight 6 → 8 px; Such-Vorschaubilder 2 → 4 px. Karten (Bildkacheln, Hinzufügen-Platz, Gemeinsamkeiten, Ähnliche Modelle) und Sheets waren bereits korrekt. `vergleichen.css?v=76`.
- **Erklär-Pop-up in der Sprache der Seite (09.11., Lead UI):** keine Akzentlinie, kein wiederholtes Icon. Weißes Pop-up (Haarlinie, `--radius-xl`, Pop-up-Schatten); Merkmalsname als kleine fette Überschrift mit Haarlinie darunter (wie die Abschnittsüberschriften); Begriffslisten als Mini-Tabelle wie der Vergleich: Begriffe in einer Spalte im Paper-Ton, Bedeutung daneben, Zeilen auf g100-Haarlinien; Einzelsätze als Absatz. Handy: Begriff als Paper-Band über der Bedeutung. `vergleichen.js?v=52`, `vergleichen.css?v=78`.
- **Ähnliche Modelle – Links auf einer Linie (09.11.):** Preis und „Zum Vergleich hinzufügen" stehen am Kartenfuß und fluchten über alle Karten, unabhängig von Titellänge (zweizeilig „BK212 mit austauschbarem Namensschild") und Anzahl der Begründungszeilen. Ab 48 rem; auf dem Handy (eine Zeile je Modell) unverändert. `vergleichen.css?v=79`.
- **Ähnliche Modelle – Unterschiede als Mini-Datenblatt (09.11., Lead Design):** statt grauer Kleinschrift „Zeitungsfach: Ohne" / „Montageart: + Standmontage · ohne Aufputz" ein kleines Feld im Paper-Ton: Merkmal gedämpft links, der eigene Wert des Modells fett rechts (keine „+ … · ohne …"-Formel mehr). Zwei Titelzeilen reserviert, damit die Felder über alle Karten fluchten. Handy: Merkmal über Wert. Kontrast Merkmal auf Paper 5,0 : 1.
- **Ähnliche Modelle bis zum Maximum (09.11.):** die Liste erscheint jetzt bei jedem Vergleich gleicher Produktart (vorher nur bei fast identischen Modellen) und aktualisiert sich nach jedem Hinzufügen, bis 4 Modelle gewählt sind; dann verschwindet sie. Unterschiede werden zum jeweils ähnlichsten Modell im Vergleich gemessen, nicht immer zum ersten.
- **Farben ohne Leerplätze (09.11.):** je Modell nur die eigenen Farbfelder (gemeinsame Farben in derselben Reihenfolge); die gestrichelten Plätze für „nicht erhältlich" wirkten wie nicht geladene Bilder. Daten unverändert und am Shop geprüft (Hermann: 5 Farben; Ebenhard zusätzlich Edelstahl und Wunschfarbe).
- **Gemeinsamkeiten bei vielen Merkmalen (09.11.):** Mehrfachwerte (z. B. Türöffner-Bedienung mit vier Verfahren) laufen in einer Zeile mit „ · " statt untereinander, Trenner bleibt am vorigen Wert; Merkmalsnamen brechen nach „/" statt mitten im Wort. Handy: eine Spalte als Datenblatt (Merkmal links, Wert rechts) statt zwei schmaler Spalten. `vergleichen.js?v=55`, `vergleichen.css?v=85`.
- **„Aus der Merkliste" bleibt im Vergleich (09.11.):** der Link schloss den Vergleich und öffnete die Merkliste über der Kategorieseite. Jetzt öffnet er das Hinzufügen-Pop-up mit nur den gemerkten, noch nicht verglichenen Modellen (Überschrift „Aus Ihrer Merkliste", Suche filtert darin, Fuß „Alle Modelle durchsuchen"); ein Klick fügt hinzu, der Vergleich bleibt offen. Behoben: Beim Öffnen per Link fehlte der Merkliste-Button, weil `merkliste.js` nach `vergleichen.js` lädt — nach dem Laden wird einmal neu gezeichnet.
- **„Aus der Merkliste" als Button (09.11., Lead Design):** statt nackter Textlink ein Sekundär-Button über die Breite des Platzes: weiß, DS-Haarlinie, 4-px-Button-Radius, gefülltes Merkliste-Lesezeichen, 44 px Zielgröße; Hover Teal-Rand. Ohne Zähler (Anzahl nur im zugänglichen Namen).
- **Volle Produkttitel im Kopf (09.11.):** wie auf der Shop-/PLP-Karte („Briefkasten aus hochwertigem Stahl | Siebert"); Kurztitel bleiben für Leiste, Screenreader-Beschriftungen und Hinweise. Sterne stehen dafür immer in eigener Zeile unter dem Titel und fluchten mit Preis und CTA über alle Spalten. `vergleichen.js?v=58`, `vergleichen.css?v=87`.
- **Vergleich voll (09.11., Lead Design):** statt loser Kleinschrift dieselbe Kachel wie „Modell hinzufügen" (gleiche Fläche, zentriert): weiße Karte mit DS-Haarlinie, Teal-Haken, „4 von 4 Modellen" im Stil der Kachelbeschriftung, darunter ein gedämpfter Hinweis „Entfernen Sie ein Modell mit ×, um ein anderes hinzuzufügen." `vergleichen.js?v=59`, `vergleichen.css?v=88`.
- **Preisabstand entfernt (09.11.):** die Zeile „+ 16,16 € ggü. Siebert" / „… mehr als …" unter dem Preis entfällt in allen Spalten – die Preise stehen direkt darüber, die Differenz wiederholte sie nur. Auch die dafür reservierte Leerzeile ist weg; Preis und CTA fluchten weiter über alle Spalten. `vergleichen.js?v=60`, `vergleichen.css?v=89`.
- **Gemeinsamkeiten als Datenblatt (09.11., Lead Design):** die Kachel-Rasterung (Merkmal über Wert, auto-fit) skalierte schlecht – bei 11 gemeinsamen Merkmalen (VDM10 Colson + Kian) 4 × 3 Kacheln mit Leerplatz am Ende, ungleichen Zeilenhöhen und mitten im Begriff umbrochenen Namen. Jetzt eine Zeile je Merkmal: Merkmal links (gedämpft, (i) am Rand der Merkmalsspalte wie in der Tabelle), Wert rechts (fett), Haarlinie darunter. Gelesen von oben nach unten, Spalte für Spalte, in Relevanzreihenfolge; 2 Spalten ab 48 rem, 3 ab 90 rem, Zeilen fluchten über die Spalten; hohe Werte (Farbfelder) oben bündig. Handy unverändert einspaltig. `vergleichen.js?v=61`, `vergleichen.css?v=90`.
- **Gemeinsamkeiten passen sich dem Inhalt an (09.11., Lead Design; ersetzt das Datenblatt von eben):** die Leiste zeigt die Fakten selbst statt nur der Merkmalsnamen – „Fächer / Parteien **1** | Klingel / Sprechanlage **Nein**" (Merkmal gedämpft, Wert fett, Paare durch Haarlinie getrennt). Passen alle in die eine Zeile, IST die Leiste der ganze Abschnitt: kein „Anzeigen", keine leere Karte. Sonst zeigt sie so viele ganze Fakten, wie hineinpassen (kein „Nein…"-Abschnitt), und der Button nennt die Summe: „Alle 11 anzeigen". Geöffnet: kompakte Einheiten (Merkmal über Wert, (i) direkt hinter dem Merkmal) auf fester 11-rem-Spur – wenige Fakten bleiben beieinander statt über die Karte gezogen, keine Zellrahmen. Handy: Fakten zeilenweise; bis 4 ganz, sonst die ersten 3 + „Alle n anzeigen". Neu gemessen bei jeder Größenänderung. `vergleichen.js?v=64`, `vergleichen.css?v=93`.
- **Gemeinsamkeiten als dritter Tabellenabschnitt (09.11., Lead UX/UI; ersetzt Leiste/Karte):** UX/UI-Bewertung: die graue Karte mit Haken brach das Raster, war das am stärksten gestaltete und zugleich unwichtigste Element, sah klickbar aus, verlor die (i) und verschwieg Screenreadern „gilt für alle". Jetzt im selben System wie „Nicht für alle gepflegt": schlichte Überschrift, Merkmalsspalte auf Paper mit (i), ein Wert über alle Modellspalten (visuell versteckt „– gilt für alle n Modelle"); leiser als die Unterschiede: kompakte Zeilen (0,5 rem), Wert normal statt fett. Bis 5 Merkmale ganz; mehr: die 4 relevantesten + Teal-Textbutton „Alle n Gemeinsamkeiten anzeigen" / „Weniger anzeigen" (Chevron dreht, `aria-expanded`/`aria-controls`). Gleiches Verhalten auf jeder Breite; Handy wie die anderen Abschnitte. Leisten-Logik (Fakten-Vorschau, Messung) entfernt. `vergleichen.js?v=65`, `vergleichen.css?v=94`.
- **Gemeinsamkeiten ohne Leerband (09.11.):** der eine Wert über alle Modellspalten ließ bei kurzen Werten („1", „Nein") eine leere Fläche über die halbe Tabelle. Jetzt steht der Wert in jeder Modellspalte – wie in den anderen Abschnitten: Spaltenraster und Trennlinien laufen durch, jede Spalte liest sich von oben nach unten vollständig. Der Abschnittstitel sagt bereits, dass die Werte gleich sind. `vergleichen.js?v=66`, `vergleichen.css?v=95`.
- **Gemeinsamkeiten: drei Merkmale je Zeile, standardmäßig eingeklappt (09.11., Nutzerentscheidung):** jeder Wert nur einmal (keine Wiederholung je Modellspalte) und kein Leerband: je Zeile Merkmal | Wert | Merkmal | Wert | Merkmal | Wert; die inneren Merkmale auf demselben Paper-Band wie die Merkmalsspalte, gleiche Breite (14/12/11 rem). 3 je Zeile ab 64 rem, 2 auf Tablets, 1 auf dem Handy (wie die anderen Abschnitte); leere Plätze der letzten Zeile bleiben weiß. Abschnitt startet eingeklappt: Überschrift + Teal-Textbutton „Anzeigen" / „Ausblenden" direkt dahinter (Chevron dreht, `aria-expanded`, Anzahl im zugänglichen Namen); offen, wenn sich nichts unterscheidet. Teilvorschau und „Alle n …"-Zeile entfernt. `vergleichen.js?v=71`, `vergleichen.css?v=101`.
- **Kachel „4 von 4 Modellen" ohne Wiederholung (09.11.):** Hinweis von „Entfernen Sie ein Modell mit ×, um ein anderes hinzuzufügen." auf „Zum Tauschen eines mit × entfernen." gekürzt – „Modell" stand schon in der Überschrift.
- **Gemeinsamkeiten-Aufklapper (09.11., Lead Product Design):** statt kleinem Textlink neben dem Titel ist die ganze Überschriftenzeile der Schalter (≥ 48 px Ziel; Handy 65 px): Titel im Abschnittsstil (fluchtet mit den anderen Überschriften) · gedämpfte Vorschau der enthaltenen Merkmale (nur ganze Namen, Rest als „+ n weitere"; offen ausgeblendet) · „Anzeigen"/„Ausblenden" mit Chevron am rechten Tabellenrand. Hover: Paper-Fläche + unterstrichene Aktion; Tastatur: Teal-Fokusring; Screenreader: „Gemeinsamkeiten – gilt für alle n Modelle, x Merkmale", `aria-expanded`/`aria-controls`. Handy: Vorschau unter dem Titel. Geöffnet: 3 Merkmale je Zeile erst ab 90 rem (darunter 2), Werte trennen mit Silbentrennung statt mitten im Wort. `vergleichen.js?v=74`, `vergleichen.css?v=105`.
- **Kachel bei vollem Vergleich – Text (09.11.):** statt Anweisung („Zum Tauschen eines mit × entfernen.") ein sachlicher Status: **„Maximale Anzahl erreicht"**, darunter „Es können bis zu 4 Modelle verglichen werden." Wie man entfernt, zeigt bereits das × auf jeder Karte. Bei Spaltenwahl ergänzt: „n davon sind sichtbar – zum Wechseln den Namen wählen." `vergleichen.js?v=75`.
- **Kopfleiste – Buttons (09.11., Lead Design):** vorher graue Textlinks (wirkten deaktiviert), „Vergleich leeren" ohne Icon im selben Stil wie die harmlosen Aktionen und direkt neben dem Schließen-×. Jetzt Toolbar-Buttons in Ink mit Icons (Link, Drucker, neu: Papierkorb), 44 px Ziel, 4-px-Radius, Hover = Paper-Fläche statt Unterstreichung, Teal-Fokusring; Haarlinien gruppieren: Link kopieren · Drucken | Vergleich leeren | ×. „Link kopiert" bleibt Teal. Handy-Aktionszeile: „Vergleich leeren" ebenfalls mit Papierkorb. `vergleichen.js?v=76`, `vergleichen.css?v=106`.
