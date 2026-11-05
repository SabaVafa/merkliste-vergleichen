# 12 · PO-Abnahme CP4: Vergleich-Redesign (Version B)

Stand: 05.11.2026 · Prüfer: Lead Product Owner · Build: `vergleichen.js?v=28`, `vergleichen.css?v=30` · Grundlage: Brief 12 (AK 1–43 inkl. CP1-Änderungen), 12a, 12b, Selbstprüfung 12c
Methode: eigene Messung im Browser-Pane (Transitions per CSS aus), Breiten 1920/1900 · 1440 · 1024 · 768 · 375, Szenarien S1–S5, S6 (Merkliste), S7 (geteilter Link), S8 (2 → 1, Leeren) sowie T1, T1b, T2, T3. Die Selbstprüfung 12c habe ich nicht übernommen, sondern jeden Wert unten selbst gemessen. Speicher geleert, Viewport zurückgesetzt.

## Urteil: **Abgenommen mit Folgeaufgaben**, unter der Bedingung der 3 Must-fix-Punkte (§4)

Die Seite hat jetzt eine erkennbare UX. In S1 steht bei 1900 und 1440 px die ganze Entscheidung im ersten Bildschirm:
- ein Fazit in Klartext: „technisch gleich, aber in Maßen und Gewicht verschieden" plus die Werte, mit denen der Preisunterschied einhergeht;
- zwei eindeutig benannte Köpfe („VDM10 2.0 Colson" / „VDM10 2.0 Neo") mit 10-rem-Bild, Preis und Differenz;
- direkt darunter genau die 4 Unterschiede;
- die Gemeinsamkeiten zugeklappt.

Damit ist die Beschwerde „zero UX" ausgeräumt: keine Doppelungen, kein „6 von 14", keine leere Labelspalte, mobil kein Überlauf. Die 3 Must-fix-Punkte sind klein. Ich prüfe nur sie nach und mache keine erneute Vollabnahme.

## 1 · Messbelege je Kriteriengruppe

| Gruppe | Gemessen (eigene Prüfung) | Ergebnis |
|---|---|---|
| **A Entscheidung (1–7)** | **S1:** „Laut Shopdaten technisch gleich, aber in Maßen und Gewicht verschieden. Der Preisunterschied geht … einher: Namensschild Lasergraviert statt Austauschbar (Papiereinleger), zusätzlich die Farbe Weiß, Höhe 27,4 statt 29 cm, Gewicht 2,12 statt 2,39 kg."<br>**S2:** „… bis auf die Tasteranzahl …".<br>**S3:** „Technisch verschieden – vor allem im Typ (Kai: Audio, sonst Video) und im System …; Die Preisunterschiede ordnet der Vergleich keinem einzelnen Merkmal zu …".<br>**S4:** „Unterschiedliche Produktklassen … nicht als Aufpreis vergleichbar", ohne Δ im Kopf.<br>**T2/S5:** „nicht eindeutig (je nach Ausführung)".<br>Titel sind eindeutig („· 1 Klingeltaster" / „· 2 Klingeltaster", „Ebenhard · mit Edelstahlfront"). Je Spalte gibt es einen Text-CTA im Sticky-Kopf. „Auf einen Blick" / „Keine Besonderheit" sind weg. | bestanden; Copy-Mängel → M2 |
| **B Hierarchie (8–13)** | S2 „taster" 5× (Grenze 5), S1 „Lasergraviert" 2× (1440 und 375). Preis und Δ stehen nur im Kopf. Reihenfolge Fazit → Kopf → U → O → G (zu) → Alternativen → Quelle. Alle U-Zeilen sind ohne Aufklappen sichtbar. Zählung: S3 Schalter (8) = „Unterschiede (8)" = „insgesamt 8", U+O+G = 8+5+1; S4 (5) = 5, 5+3+1. Labelspalte 15 rem (≥ 90 rem), 12 rem (1024), Kopfzelle gefüllt („Modell hinzufügen" / „4 von 4 Modellen …"). | bestanden |
| **C Layout (14–20)** | `scrollWidth = innerWidth` und `scrollWidth = clientWidth` des Scrollbereichs bei allen gemessenen Kombinationen. Erste U-Zeile:<br>– 1440 S1 386, S2 357, S3 474 px<br>– 1024 S3 (4 Spalten) 348 px (≤ 384)<br>– 768 S3 (3 von 4) 394 px, S1 422 px (≤ 512)<br>– 375 S1 463, S3 464, S4 440 px (≤ 487), **T3 503 px**<br>Bildbox 10 rem (1440, 2 Modelle), 7,5 rem (1920, 4 Modelle). Keine Trennung mitten im Wort, Toast mobil vollständig („Meine Auswahl (2)"). Trefferflächen ≥ 2,75 rem (per `::before`). | bestanden; T3 → Abweichung 1 |
| **D Spalten (21–22)** | Gleich breite Spalten, keine Add-Spalte. Entfernen → Fokus auf das nächste ×, Toast „SDM10X entfernt. Rückgängig" im Dialog. Rückgängig stellt die alte Position wieder her, Fokus auf dessen ×, Live „SDM10X wieder im Vergleich.". Leeren → Leerzustand → „Vergleich wiederherstellen (3)" funktioniert. **Lücke:** Ist der Toast „Geteilter Vergleich geöffnet" sichtbar, bekommt das Entfernen **kein** Rückgängig (S7). | M1 |
| **E Sticky (23–25)** | Kopfhöhe bei scrollTop 0/200/1000 identisch:<br>– 180,8 px (1440/1920, S3)<br>– 150,8 px (1024)<br>– 130,1 px (375)<br>Spaltentausch Maxior → Kai: 130,1 → 130,1 px. Kein Klassenwechsel. Sticky-Bereich: 15,36 rem (S1 1440), 15,10 (S3 1920), 13,23 (1024), 11,66–12,85 rem (375). Titel, Preis, CTA und × bleiben im Kopf. | bestanden |
| **F Daten (26–30)** | Stichprobe gegen `MTZ_VGL_DATA`, alle gleich: Colson/Neo Maße, Gewicht, Namensschild, 7/6 Farben; Siebert 3,4 kg + Material; Ebenhard 3,4–5 kg (`kgv`), Namensschild k. A.; Alves 39,5 × 115 × 14,3 cm, 9,9 kg, 3 Farben, Material k. A.; Nora 35 × 35,5 × 21 cm, 3 kg, Unterputz, Zeitungsfach Ohne; Trias 37,2 kg, Namensschild „Ohne Gravur", 3 Fächer. Überlappende Spanne → O (T2, S5). „Bestwert" erscheint in keinem Szenario (keine vollständigen IP/IK-Werte, korrekt). Quellzeile vorhanden. Kein „zusätzlich/ohne". `vergleich-daten.js` ist **byte-gleich** mit der CP0-Kopie (`cmp`). | bestanden |
| **G A11y (31–36)** | `role=dialog`, `aria-modal=true`, `aria-labelledby=vglTitle` (h2), Fokus beim Öffnen auf dem h2. `th scope`: col 3 / row 12 / rowgroup 2. Tastatur: Tab → Schalter (Name „Nur Unterschiede (1)"), Leertaste schaltet, Live „Alle Merkmale – 11 Gemeinsamkeiten eingeblendet.", G-Button `aria-expanded=true`. Escape schließt, Fokus auf „Vergleich anzeigen". Picker: `role=listbox`, ↓↓↓ + Enter wählt Kai, Fokus bleibt auf dem Titel-Button, Live „Spalte 1 zeigt jetzt Kai.", Caption „– sichtbar: ADM10 Kai, SDM10X", „Unterschied bei: Kai". Keine positiven tabindex, Toast in der Tab-Reihenfolge. | bestanden |
| **H Copy/DS (37–39)** | Keine Verbotswörter (Wishlist, Wunschzettel, Favoriten, günstig, Warenkorb, Auf einen Blick, zusätzlich:/ohne:), kein „du". Schriftgrößen nur 12/14/16/18/20 px. Neue CSS-Zeilen enthalten kein px, Hex nur als Fallback im Token-Alias-Block. **Aber:** `--v-shadow-sm` / `--v-shadow-lg` und ein Swatch-Rand `rgba(0,0,0,.14)` sind erfundene Werte. Icon-Hover laut CSS-Regeln unverändert (× muted → muted, Schließen ink → ink, Lesezeichen-Badge statisch). | M3 |
| **I Stabilität (40–41)** | CLS beim Öffnen + 3 Scrollpositionen + Schalter 2×: **0,0000**. Keine Konsolenfehler. | bestanden |
| **J Regression (42–43)** | Merkliste → 2 Lesezeichen → „2 Türsprechanlagen vergleichen" → Dialog mit „← Merkliste" ✓. Deep-Link öffnet ✓. Zurück schließt ✓. Geteilter Link → „Meine Auswahl (2)" stellt die eigene Auswahl wieder her ✓. Drucken-Button: G offen, alle Spalten, Zustand danach zurück ✓. Andere Kategorie: Toast „Diese Modelle gehören zu Briefkästen. Dort öffnen" ✓. Beide Lenses ✓. Gegenüber CP0 geändert: nur `vergleichen.js/css` + je 2 `?v=`-Zeilen in `index.html`/`briefkasten.html`. `tools/`, `merkliste.*`, `plp.js`, `sprechanlage.js` wurden seit CP0 nicht verändert (mtime vor der CP0-Kopie). | bestanden (Hinweise F4/F5) |

## 2 · Entscheidungen zu den gemeldeten Abweichungen

| # | Abweichung | Entscheidung |
|---|---|---|
| 1 | T3 `trias,quartett` bei 375 px: erste U-Zeile 503 px (> 487) | **Angenommen, Folgeaufgabe F1.** S1–S8 halten die Grenze ein. Ursache ist der lange Referenzname im Fazit, nicht der Kopf (12,85 rem). |
| 2 | Titel ohne Design-Linie mit 3 Zeilen bei 1440/1920 (3 Modelle) und 768 | **Angenommen.** AK 4 (nie kürzen) hat Vorrang vor 12a „2 Zeilen". Die Höhe bleibt fest und unter 16 rem (15,35). |
| 3 | 768 px mit 2 Modellen im kompakten Kopf | **Angenommen.** Für 768 gibt es keine Höhengrenze. Gemessen: 13,2 rem, U bei 422 px. |
| 4 | Labelspalte 12 rem bei 64–90 rem | **Angenommen.** Liegt im Rahmen von AK 13 (≤ 15 rem) und ist nötig, damit 4 Modelle bei 1024 ohne Scrollen passen. |
| 5 | AK 7: hinter dem Tabellenende scrollt der Kopf weg | **Angenommen.** Eine Scrollbewegung zurück ist „höchstens eine Aktion". |
| 6 | Lesezeichen als kleines weißes Badge auf 3,5-rem-Thumbnails | **Angenommen.** Statisch, Lesezeichen-Glyph, ohne Hover. |
| 7 | Kein separates CP2-Mock | **Nachträglich akzeptiert.** Die Messung lief mit echten Texten am Build und ist hier bestätigt. Prozesshinweis: Beim nächsten Mal das Mock vor dem Build liefern. |
| 8 | Escape schließt Merkliste und Vergleich zugleich | **Außerhalb des Scopes** (bestehend, `merkliste.*`) → Folgeaufgabe F5. |
| 9 | Ein-Zeilen-Fix in `applyState` (Tour) | **Angenommen.** Erlaubte Datei, behebt einen echten Fehler, kein Einfluss auf den Vergleich. |

## 3 · Fazit-Texte aus Kundensicht

- **Verständlich und ehrlich:**
  - S2: „bis auf die Tasteranzahl".
  - S3: Kai: Audio, Maxior: 2-Draht-BUS.
  - S4: andere Klasse, kein Aufpreis.
  - T2: „nicht eindeutig (je nach Ausführung)".
  - Die Erklärsätze sind kurz und ohne Allgemeinplätze, wie die Nutzerin es verlangt hat: „Colson: Ändert sich ein Name, brauchen Sie ein neues Schild.", „Nora: Braucht eine passende Öffnung in der Wand.".
- **Redundant:** „laut Shopdaten" steht in jedem Fazit zweimal (S2 sogar 3× „Shopdaten" in zwei Sätzen), dazu die Floskel „geht … mit diesen Werten von {Ref} einher". Die Herkunft nennt schon die Quellzeile → M2.
- **Liest sich ungünstig, ist aber datenehrlich:** S5 „…der Ausführung mit Aufpreis einher: nur Edelstahl statt 7 Farben" klingt nach „mehr zahlen für weniger". Die Edelstahlfront ist im Export nicht als Material des Artikels gepflegt → Datenaufgabe F3, keine Designänderung.

## 4 · Must-fix (blockierend, vor Übergabe an die Nutzerin)

1. **Rückgängig auch bei sichtbarem Fremd-Toast (S7, AK 22 / CP1-Änderung 7).** Nach dem Öffnen über einen geteilten Link bekommt das Entfernen eines Modells kein „Rückgängig", weil der Toast „Geteilter Vergleich geöffnet" stehen bleibt. Der Entfernen-Toast muss ihn ersetzen. Prüfung: S7 → × → „{Ref} entfernt. Rückgängig".
2. **Fazit ohne Wiederholungen** (Copy, nur `verdict`):
   - „laut Shopdaten" höchstens **einmal** je Fazit, in Satz 1;
   - Satz 2 ohne die Floskel „mit diesen Werten von {Ref}", z. B. „Colson kostet mehr und unterscheidet sich in: …"; bei gleichem Preis bleibt Satz 2 unverändert;
   - der Ton bleibt neutral (CP1-Änderung 2).

   Prüfung: S1, S2, S5, T1 → je höchstens 1× „Shopdaten".
3. **Keine erfundenen Werte im CSS** (Leitplanke „nur DS-Tokens"):
   - `--v-shadow-sm` → `--shadow-card`;
   - `--v-shadow-lg` → `--shadow-modal` (oder `--shadow-hover`);
   - Swatch-Rand `rgba(0,0,0,.14)` → `--color-graphite-300`.

   Prüfung: Neue CSS-Zeilen enthalten keine `rgba(` außerhalb der Token-Fallbacks.

Danach Asset-Version erhöhen und 12c um die Nachprüfung ergänzen.

## 5 · Folgeaufgaben (nicht blockierend)

1. **F1 Kurz-Referenz im Fazit:** Ist der Referenztitel länger als eine Zeile (Artikel ohne Design-Linie), steht „das Modell mit Aufpreis" / „das günstigere …" (Achtung: „günstig" ist verboten → „das Modell mit dem niedrigeren Preis"). Ziel: T3 bei 375 px ≤ 487 px. Kurznamen über das Shop-Team (Doc 11 §10.1).
2. **F2 Alternativen bei Zwillingen** (S1 zeigt Neo mit 3 bzw. 2 Tastern): Varianten, die sich nur in der Tasteranzahl unterscheiden, sind keine echten Alternativen. Sie sollten ausgeschlossen werden oder unter „Andere Tasteranzahl" stehen.
3. **F3 Datenliste (Doc 11 §9):** Material der Ebenhard-Edelstahlfront je Variante pflegen. Dann bekommt S5 einen belegten Unterschied.
4. **F4 Browser-Zurück:** Im Pane schließt Zurück den Dialog, die Adresszeile behält aber `?vergleich=` (Logik unverändert gegenüber CP0). Im echten Browser prüfen. Wenn reproduzierbar: beim Öffnen nicht erst per `replaceState` die URL setzen.
5. **F5 Escape-Reihenfolge Merkliste über Vergleich** (`merkliste.*`, eigenes Ticket): Escape soll nur die oberste Ebene schließen.
6. **F6 Druck per Strg+P** öffnet die Gemeinsamkeiten nicht (nur der Button „Drucken"). Ein `beforeprint`-Handler sollte dieselbe Vorbereitung auslösen.
7. **F7 Lesezeichen-`aria-label` im Vergleichskopf** nutzt den alten Shopnamen („VDM10 2.0 Video-Türsprechanlage merken") statt des Spaltentitels („VDM10 2.0 Colson") — `merkliste.js`, eigenes Ticket.
8. **F8 Richtungsfreigabe** der umgekehrten Entscheidungen (12a §2.8) und der Token-Vorschläge P1–P4 (12b §2) durch die Nutzerin. Beides ist noch offen.

---

## 6 · Nachprüfung (05.11.2026, `vergleichen.js?v=29`, `vergleichen.css?v=31`)

Geprüft wurden nur M1–M3 sowie F1, F2 und F6, mit derselben Methode wie oben (Transitions aus, 1440 und 375 px). Danach habe ich den Speicher geleert und den Viewport zurückgesetzt.

| Punkt | Prüfung | Ergebnis |
|---|---|---|
| **M1** Rückgängig bei geteiltem Link | Eigene Auswahl (2) → geteilter Link mit 4 Modellen → Toast „Geteilter Vergleich geöffnet. Meine Auswahl (2)" sichtbar → Kai entfernen | Der Toast wird ersetzt durch „Kai entfernt. Rückgängig". Rückgängig stellt die 4 Spalten in alter Reihenfolge wieder her, der Fokus liegt auf „ADM10 Kai aus dem Vergleich entfernen". ✓ |
| **M2** Fazit ohne Wiederholung | „Shopdaten" im ganzen Dialog: S1 1×, S2 1×, S5 1×, S3 0×, T3 0×, T1b 0×. Satz 2 wird ohne Floskel und ohne Wertung gebildet: „Colson kostet mehr und unterscheidet sich in: …", „Die Ausführung mit Aufpreis unterscheidet sich in: 2 statt 1 Taster.", S3: „Die Preisunterschiede lassen sich deshalb keinem einzelnen Merkmal zuordnen." | ✓. Aus Kundensicht klar und ehrlich. Die Erklärsätze bleiben kurz und ohne Allgemeinplätze. |
| **M3** Keine erfundenen Werte | Der neue CSS-Teil nutzt `--shadow-card` / `--shadow-hover` / `--shadow-tooltip` (alle in `metzler-tokens.css`). Die Fallbacks entsprechen den DS-Werten. Der Swatch-Rand ist `var(--v-g300)` (graphite-300). Außerhalb der Token-Fallbacks gibt es im neuen Teil kein `rgba(`/Hex. Die übrigen `rgba` stehen nur in den unveränderten Altblöcken (Tray, Tour, Toast, Stand CP0). | ✓ |
| **F1** T3 bei 375 px | Erste Unterschieds-Zeile bei **462 px** (≤ 487, vorher 503). Sticky 12,88 rem. Referenz: „Das Modell mit dem höheren Preis …". Kein „günstig" in T3, S1–S5 und T1b. | ✓ |
| **F2** Alternativen in S1 | Angeboten werden nur noch ADM10 Kai (Typ Audio), ADM10 Dominik (Typ Audio) und die Video-Türsprechanlage mit Paketbox, also keine reinen Tasteranzahl-Varianten mehr. | ✓ |
| **F6** Strg+P / `beforeprint` | Bei 375 px (Erklärsätze sonst zugeklappt) sind Erklärsätze und Gemeinsamkeiten während des Drucks offen, danach wieder zu. | ✓ |
| Daten / Konsole | `vergleich-daten.js` ist byte-gleich mit `scratchpad\cp0` (`cmp`). Seit CP0 geändert: nur `vergleichen.js/css`, `index.html` und `briefkasten.html` (nur `?v=`). Keine Konsolenfehler. | ✓ |

### Endgültiges Urteil: **Abgenommen.**

Alle Must-fix-Punkte sind erledigt, und alle 43 Akzeptanzkriterien sind erfüllt (T3 jetzt ebenfalls).

**Weiterhin offen (nicht blockierend):**
- **F3** Datenpflege: Material der Ebenhard-Edelstahlfront je Variante. Bis dahin lautet S5 „nur Edelstahl statt 7 Farben".
- **F4** Zurück-Taste / Adresszeile im echten Browser prüfen.
- **F5** Escape-Reihenfolge Merkliste über Vergleich (`merkliste.*`).
- **F7** `aria-label` des Lesezeichens im Vergleichskopf (`merkliste.js`).
- **F8** Richtungsfreigabe der umgekehrten Entscheidungen (12a §2.8) und der Token-Vorschläge P1–P4 durch die Nutzerin.
- Commit liegt bei der Nutzerin.
- Optional (Produktfrage): S1 schlägt jetzt Audio-Modelle als Alternative zu Video vor. Das ist technisch korrekt, für Video-Käufer aber eher ein Abstieg.
