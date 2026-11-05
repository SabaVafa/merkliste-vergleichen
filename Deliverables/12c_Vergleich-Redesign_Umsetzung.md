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

## 6 · Kundenentscheidungen (Protokoll)

Aus Brief §7 umgesetzt: Erklärsätze nur aus der freigegebenen Kurzliste (E1, E2, E4, E10); Spaltenwahl als mobiles Muster (PO-Freigabe CP1); UVP bleibt, kleiner und ruhiger (Caption, muted, durchgestrichen); andere Klasse erlaubt mit Hinweis ohne „Aufpreis“; Overlay bleibt. Offen bei der Nutzerin: Richtungsfreigabe der Liste 12a §2.8 und Token-Vorschläge P1–P4 (12b §2).
