# 12a · Vergleich-Redesign: UX-Spec (Lead UX Designer)

Stand: 05.11.2026, **überarbeitet nach CP1**; Satz-2-Texte nach CP4 (PO-Abnahme M2/F1/F2) angepasst (PO-Review `12_Vergleich-Redesign_PO-Review-CP1.md`, Änderungen 1–8 und 11; Vorgabe der Nutzerin zu den Erklärsätzen)
Grundlage: PO-Brief 12 (AK 1–43 inkl. „geändert CP1", §7 Entscheidungen) · Scope: `vergleichen-flow-B/vergleichen.js|css`, keine neuen Daten
Empfänger: Lead UI Designer (12b), PO (CP2), Nutzerin (Richtungsfreigabe §2.8)
Geprüft am laufenden Prototyp (v=29/27) mit S1–S5 bei 1440 × 900. Die Zahlen in §3.7 und §4 sind aus `MTZ_VGL_DATA` nachgerechnet.

---

## 0 · Kurzfassung

1. **Drei Fragen in dieser Reihenfolge:** Was ist anders und womit geht der Preisunterschied einher (Fazit)? Welche Modelle sind das (Kopf)? Wo steht das im Detail (Unterschiede → offen → Gemeinsamkeiten)?
2. **Das Fazit ist ein Lückentext**: 2 Sätze aus festen Bausteinen, die nur Tabellenwerte einsetzen (§3). Es enthält keine Wertung. „Technisch gleich" steht ohne Zusatz nur dann da, wenn auch die Bauform gleich ist.
3. **Die Tabelle ist immer nach Unterschieden sortiert**: *Unterschiede (U)* → *Nicht für alle gepflegt (O)* → *Gemeinsamkeiten (G)*. G ist zugeklappt und zeigt jeden gemeinsamen Wert einmal, als eine Zelle über alle Spalten.
4. **Eine Zählregel (§4)**: Jede sichtbare Merkmalszeile ist genau U, O oder G. Preis und Design-Linie sind Identität, keine Merkmale. Es gibt keine Sprungmarken, keine Prozente und kein „x von y".
5. **Ein Kopf, feste Höhe, sticky**: Bild, Titel, Preis (+ Differenz), kleine UVP, ein CTA als Textlink und × stehen in **einer** Kopfzeile. Leiste und Kopf: höchstens 15,25 rem ab 1024 px, 12 rem bei 375 px (Ausnahme 13,5 rem bei einem 3-zeiligen Titel).
6. **Titelregel**: Modellcode + Design-Linie („VDM10 2.0 Colson"). Bei gleichem Titel steht das unterscheidende Namenssegment in der Titelzeile.
7. **Spaltenwahl** (freigegeben): höchstens 4 / 3 / 2 Spalten (≥ 64 / 48–64 / < 48 rem). Weitere Modelle wählt man über den Titel-Button. Die Seite scrollt nie horizontal.
8. **4 Erklärsätze** (von der Nutzerin freigegeben, gekürzt, §3.6). Sie nennen nur Folgen, die nicht in der Zelle stehen und nicht allgemein bekannt sind.

---

## 1 · Entscheidungsmodell

| Frage des Kunden (Brief §1.1) | Antwort | Wo |
|---|---|---|
| 1. Ist das dasselbe? Was ist anders, womit geht der Preis einher? | Klassifikation (gleich / bis auf … / verschieden / andere Klasse) + belegte Unterschiede mit Werten | Fazit (scrollt weg) |
| 2. Welche Modelle sind das? | Bild, unterscheidbarer Titel, Preis + Differenz | Sticky-Kopf |
| 3. Wo steht das im Detail, was ist gleich? | U zuerst, O getrennt, G zugeklappt mit Anzahl | Tabelle |
| 4. Wie geht es weiter? | Ein CTA je Spalte | Sticky-Kopf |

**Leserichtung (AK 10)** = DOM- und Tab-Reihenfolge:
Leiste → **Fazit** (+ „Was bedeutet das?") → **Modellköpfe** (sticky) → **U** → **O** → **G (zugeklappt)** → [Fall F3: Alternativen] → **Quellzeile** (+ mobil Aktionszeile).

---

## 2 · Informationsarchitektur

### 2.1 Regionen

| Region | Inhalt | Verhalten |
|---|---|---|
| **Leiste** (`h2`) | [← Merkliste] · „Vergleich (n)" · Schalter „Nur Unterschiede (U)" · ‖ · Link kopieren · Drucken · Vergleich leeren · × | Fest, 3,75 rem (mobil 3,5 rem). Mobil stehen Link/Drucken/Leeren in der Aktionszeile am Ende |
| **Fazit** (`section`, `h3` „Fazit" nur für Screenreader) | Satz 1 + Satz 2 (§3); gegebenenfalls ein Hinweis (fehlende Shopdaten); Textbutton „Was bedeutet das?" **inline am Textende**. Der Button hat keine eigene Zeile; seine Trefferfläche von 2,75 rem kommt über `::before` und braucht keinen Platz im Layout | Scrollt weg. Ab 90 rem stehen die Erklärsätze offen rechts neben dem Fazit (kein Button), darunter sind sie zugeklappt |
| **Kopf** (`thead`, eine Zeile) | Labelspalte: „Modell hinzufügen" bzw. „4 von 4". Je Modell: Bild · Titel · Preis + Δ · UVP · CTA · × | Sticky; die Höhe ist fest und wird aus **allen** Modellen berechnet (§2.6) |
| **Bildleiste** (nur < 48 rem) | Bilder der sichtbaren Spalten, Pille „i / n" | Steht über dem Kopf und scrollt weg |
| **Tabelle** | Abschnitte U / O / G (§5); in jedem Abschnitt gilt die Lens-Reihenfolge (`ROWS_*`) | – |
| **Alternativen** (nur Fall F3) | „Alternativen mit technischem Unterschied", höchstens 3 | Nach G |
| **Quellzeile** | Quelle + Stand (unverändert) und Preis-Hinweis (§8) | Auch im Druck |

### 2.2 Was entfällt oder zusammengelegt wird (Z2: jede Information einmal)

| Heute | Neu | AK |
|---|---|---|
| „Auf einen Blick" / „Das zeichnet das Modell aus" / „Keine Besonderheit …" | entfällt; die belegten Unterschiede stehen im Fazit | 5 |
| Tabellenzeilen Preis und Design-Linie | Preis + Δ stehen im Kopf, die Design-Linie im Titel | 9 |
| Zusatzzeile unter dem Namen | entfällt; der volle Shopname steht im `alt` des Bildes | 4/8 |
| „x von y …" / „Zu x % ähnlich" / „Technisch baugleich …" | Lückentext §3 | 1/12 |
| Block „Was der Aufpreis bringt" / „Gleicher Preis — das unterscheidet …" | Satz 2 des Fazits, neutral | 2 |
| Hinweis „Gleiche Design-Linie …" | entfällt (Satz 1 sagt dasselbe) | 8 |
| Warnung „Set vs. Einzelmodell" | Fall F1 | 6 |
| Sprungmarken + „+ n weitere" | entfallen (PO CP1: angenommen) | 12/33 |
| „Alle technischen Details (n)" und Gruppenköpfe | Abschnitte U/O/G | 11 |
| 60-%-Automatik | „Nur Unterschiede" ist immer an (bei U = 0 aus) | 10 |
| Add-Spalte | Kopfzelle der Labelspalte bzw. mobil die Aktionszeile | 13/21 |
| „zusätzlich:/ohne:" unter Mengenzeilen | entfällt | 8/30 |
| Gemeinsamkeiten als Liste unter der Tabelle | Abschnitt G; jeder Wert steht in **einer** Zelle über alle Spalten | 8 |

### 2.3 Modellkopf und Titelregel

**Inhalt je Spalte** (jedes Element nur einmal):
- **Bild** mit Fallback; `alt` = voller Shopname.
- **Titel**: Titelgröße, höchstens 2 Zeilen, nie gekürzt (AK 4). Ausnahme: bei 375 px darf ein Titel ohne Design-Linie eine 3. Zeile bekommen (AK 24).
- **Preis** „ab …"; die Differenz „+ Δ" nur beim teureren Modell und nicht bei F1.
- **UVP** in Captiongröße, gedämpft, durchgestrichen.
- **CTA** links und **×** rechts in einer Zeile.

**Titelregel** (aus den `|`-Segmenten des Shopnamens):
1. *Sprechanlagen*: Modellcode aus Segment 0 (`/^[A-Z]{2,4}\d{2}[A-Z0-9]*( \d\.\d)?/`) + Design-Linie (letztes Segment), wenn sie vom Code abweicht → „VDM10 2.0 Colson", „XDM10 Maxior", „SDM10X", „ADM10 Kai".
   *Briefkästen*: die Design-Linie. Ohne `|` gilt der Text bis zum ersten Komma („Briefkastenanlage freistehend für 3 Parteien").
2. **Kollision** (gleicher Titel): angehängt wird „ · " + das erste mittlere Segment, das bei allen vorhanden ist und sich unterscheidet („VDM10 2.0 Colson · 1 Klingeltaster"). Gibt es keins, die abweichenden Wörter aus Segment 0 („Ebenhard · mit Edelstahlfront"). Das entspricht `colLabels`, steht jetzt aber in der Titelzeile.
3. Fallback: `shortName().main`.

**Referenzname (Ref) im Fazit und in den Erklärsätzen:**
- die Design-Linie, wenn sie eindeutig ist („Colson");
- bei Zwillingen „die Ausführung mit Aufpreis" bzw. „die andere";
- sonst der Titel.

### 2.4 CTA (AK 7)
- Genau ein CTA je Spalte: „Konfigurieren" bzw. „Zum Produkt" (`konfigOf`).
- Stil: Textlink im Merkliste-Stil (teal, unterstrichen, Chevron, 2,75 rem Trefferfläche). Er bleibt das stärkste Element der Spalte (12b, Änderung 9).
- Er steht im Sticky-Kopf, ist also ohne Aktion erreichbar; bei der Spaltenwahl mit einer Aktion.
- `aria-label` = „Konfigurieren – {Titel}".
- Der Rückweg über `PDP_URLS`/`mtz_return` bleibt unverändert.

### 2.5 Modell hinzufügen (AK 21)
- **Ab 48 rem** in der Kopfzelle der Labelspalte: „+ Modell hinzufügen" (öffnet die bestehende Suche), „noch n möglich", „Aus der Merkliste (m)". Bei 4 Modellen: „4 von 4 Modellen. Entfernen Sie ein Modell, um ein anderes hinzuzufügen."
- **Unter 48 rem** in der Aktionszeile am Ende und im Leerzustand.
- Es gibt keine Add-Spalte; alle Produktspalten sind gleich breit.

### 2.6 Höhenbudget (AK 15–18, 23–25), inkl. „Was bedeutet das?"

**Kopfzelle.** Layout „L": Bild links, Text rechts. Layout „M": Titel oben, darunter Thumbnail 3,5 rem mit Preis/UVP, darunter CTA/×.

| Breite | Layout | Bild | Leiste + Kopf | Limit |
|---|---|---|---|---|
| ≥ 90 rem, 2–3 Modelle | L | 10 rem | 3,75 + 11,5 = **15,25** | 16 |
| ≥ 90 rem, 4 Modelle | L | 7,5 rem | 3,75 + 9,9 = 13,65 | 16 |
| 64–90 rem, Spalte ≥ 17 rem | L | 7 rem | ≤ 13,65 | 16 |
| 64–90 rem, Spalte < 17 rem | M | 3,5 rem | 3,75 + 11,5 = 15,25 | 16 |
| 48–64 rem | L (6 rem) / M | 6 / 3,5 rem | ≤ 15,25 | – |
| < 48 rem | Titel · Preis + Δ · UVP · CTA/× | Bildleiste 4,5 rem (nicht sticky) | 3,5 + 8,5 = **12** (3-zeiliger Titel: 3,5 + 9,7 = 13,2) | 13 (13,5) |

Labelspalte: 15 rem ab 64 rem, 11 rem bei 48–64 rem, darunter keine.

**Fazitblock:**

| Bestandteil | ≥ 48 rem | < 48 rem |
|---|---|---|
| Polster | 1,5 rem | 1,25 rem |
| Schrift | Body, 1,55 rem je Zeile, ≈ 115 Zeichen je Zeile bei 1024 | Body-sm, 1,3125 rem je Zeile, ≈ 48 Zeichen je Zeile |

„Was bedeutet das?" zählt mit 18 Zeichen zum Text. Mit diesen Zeichenzahlen wird gerechnet, nicht geschätzt.

**Bis zur ersten U-Zeile** (Abschnittskopf 2,25 rem):

| Szenario | Fazit (Zeichen → Zeilen) | Rechnung | Ergebnis | Grenze |
|---|---|---|---|---|
| **S3 bei 1024** | 301 + 18 = 319 → 3 Z. = 4,65 + 1,5 | 3,75 + 6,15 + 11,5 (M) + 2,25 | **23,65 rem = 378 px** | 384 px |
| **S3 bei 375** (Spaltenwahl 2 von 4) | 319 → 7 Z. = 9,19 + 1,25 | 3,5 + 10,44 + 5 + 8,5 + 2,25 | **29,69 rem = 475 px** | 487 px |
| **S4 bei 375** (2 von 3, Titel Trias 3 Zeilen, kein Button) | 238 → 5 Z.; gerechnet mit 6 Z. = 7,88 + 1,25 | 3,5 + 9,13 + 5 + 9,7 + 2,25 | **29,58 rem = 473 px** | 487 px |
| S1 bei 375 (Kontrolle) | 291 + 18 = 309 → 7 Z. | wie S3 | 475 px | 487 px |

**Hebel, falls die Messung bei CP2 knapp ausfällt** (in dieser Reihenfolge): Polster des Fazits → Abschnittskopf → Thumbnail/Bildleiste −0,5 rem. **Nie** kürzen: Titel, Fazit-Bausteine, Trefferflächen.

### 2.7 Low-Fi (S1 bei 1440, S3 bei 375)
```
1440 ┌ ← Merkliste  Vergleich (2)  [◯ Nur Unterschiede (4)]   Link kopieren · Drucken · Vergleich leeren  × ┐
     │ Laut Shopdaten technisch gleich, aber in Maßen und Gewicht …        │ Was das bedeutet: E4 (Colson) │
     ├───────────────┬──────────────────────────────────┬─────────────────────────────────┤ ← sticky
     │ + Modell      │ [Bild 10rem] VDM10 2.0 Colson    │ [Bild 10rem] VDM10 2.0 Neo      │
     │ noch 2 mögl.  │              ab 594,15 € +42,50 €│              ab 551,65 €        │
     │ Aus Merkl.(2) │              UVP 699,00 €        │              UVP 649,00 €       │
     │               │              Zum Produkt ›    × │              Zum Produkt ›    × │
     ├ UNTERSCHIEDE (4) ───────────────────────────────────────────────────────────────── ┤
     │ Namensschild ⓘ│ Lasergraviert                    │ Austauschbar (Papiereinleger)   │
     ├ GEMEINSAMKEITEN (8) · gilt für alle 2 Modelle                          [Anzeigen ▾] ┤
     │ System ⓘ      │ IP-System (eine Zelle über beide Spalten)                          │ ← aufgeklappt
     └ Daten: Metzler Shop (JTL-Wawi), Stand 02.11.2026 · …                                ┘
375  ┌ Vergleich  [◯ Nur Unterschiede (8)]  × ┐
     │ Technisch verschieden – … Was bedeutet das? │
     │ [Bild 1/4]          [Bild 2/4]          │ ← scrollt weg
     ├ XDM10 Maxior ▾      SDM10X ▾            ┤ ← sticky
     │ ab 424,15 €         ab 1.266,50 € +842,35 €│
     │ UVP 499,00 €        UVP 1.490,00 €      │
     │ Zum Produkt › ×     Konfigurieren › ×   │
     ├ UNTERSCHIEDE (8)                        ┤
     │ Typ ⓘ   Unterschied bei: Kai            │
     │ Video               Video               │
```

### 2.8 Umgekehrte frühere Entscheidungen (vollständig; zur Richtungsfreigabe durch die Nutzerin)

| # | Bisher (Quelle) | Neu | Grund |
|---|---|---|---|
| 1 | Maße, Gewicht und Material zählen als technisch; nur Preis, Design, Namensschild und Farben sind `soft` (Zwillingsregel 30.09., Doc 11 R4) | Eigene Klasse **F Bauform**. „Technisch gleich" ohne Zusatz gibt es nur bei gleicher Bauform; sonst nennt derselbe Satz die Bauform (F3b/F4) | Colson/Neo unterscheiden sich nur in Ausführung und Maßen; ohne die Trennung würde F6 ein „technisch verschieden" behaupten. Die Bauform verschwindet dabei nie aus dem Fazit (AK 3) |
| 2 | Automatische Ansicht „Nur Unterschiede" ab 60 % (Doc 02 §3, 03) | Immer an (bei U = 0 aus) | Die Unterschiede stehen ohnehin zuerst (AK 10) |
| 3 | Preiszeile als Kernzeile (Doc 11 §7.2/7.3) | Preis + Δ nur im Kopf | AK 9 |
| 4 | Design-first-Gruppen der Briefkästen (01b, Doc 11 §7.3), Gruppen der Sprechanlagen | Abschnitte U/O/G; die Lens-Reihenfolge gilt in jedem Abschnitt | AK 10/11 |
| 5 | Gefüllter CTA-Button („Primär bleibt das Overlay", 06 §2) | Textlink (bleibt das stärkste Element der Spalte) | H5 |
| 6 | „Auf einen Blick" (03, 06 §1 Nr. 2, Doc 11 R6) | entfällt | V9, AK 5 |
| 7 | Verdict-Text und Sprungmarken (03 §14, 06 §1 Nr. 4) | Lückentext, keine Sprungmarken | V3/V4, AK 1/12 |
| 8 | Zwillingsblock „Was der Aufpreis bringt" vor der Tabelle (06 §1 Nr. 2, 03 §3b) | Satz 2 des Fazits, ohne Wertung | AK 2 |
| 9 | Add-Spalte 8,5 rem (06 §2) | Kopfzelle der Labelspalte | AK 21 |
| 10 | Zwilling-Hero 12,5 rem (30.09.) | 10 rem im Sticky-Kopf | AK 24 |
| 11 | „Gleiche Design-Linie"- und Set-Hinweis (06, Doc 11 §7.3) | im Fazit (Satz 1 bzw. F1) | V2 |
| 12 | Alternativen über/unter der Tabelle (30.09.) | **bleiben**, stehen nach G | – |
| 13 | – | **neu:** Rückgängig beim Entfernen einer Spalte | AK 22 |

---

## 3 · Fazit-Logik (feste Bausteine, nur Tabellenwerte, keine Wertung)

### 3.1 Begriffe

**Basis** = Modelle mit Shopdaten (Doc 11 R10). U/O/G nach §4.

**Merkmalsklassen je Lens:**

| Klasse | Sprechanlagen | Briefkästen |
|---|---|---|
| **T** Technik | Typ, System, Anzahl Klingeltaster, Türöffner-Bedienung, Mit Briefkasten/Paketbox, Kameraauflösung, Nachtsicht, Sichtwinkel, IP, IK | Fächer / Parteien, Zeitungsfach, Klingel / Sprechanlage, Montageart |
| **A** Ausführung | Namensschild, Farben | Namensschild, Farben |
| **F** Bauform | Abmessungen, Gewicht | Abmessungen, Gewicht, Material |

**Klassenregel K** (nur belegte Werte):
- Briefkästen: Fächer „1" gegen „≥ 2", oder Klingel / Sprechanlage „Nein" gegen einen Wert, oder `set` verschieden.
- Sprechanlagen: Mit Briefkasten/Paketbox „Nein" gegen einen Wert.
- Die Montageart und die Anzahl der Klingeltaster bestimmen **keine** Klasse.

**T-Ref** = Ref des teureren Modells. Die Δ-Zahl steht nie im Fazit.

### 3.2 Satz 1 (der erste Treffer gilt)

**Bauform-Zusatz BZ** (gilt für F3b und F4):
- „, außerdem in {U∩F-Labels} verschieden" bzw. bei F3b „, aber in {U∩F-Labels} verschieden" (Labels: Maßen / Gewicht / Material);
- dazu bei O∩F ≠ ∅: „, bei {O∩F-Label} nicht eindeutig ({k. A. | je nach Ausführung})".

| Fall | Bedingung | Satz 1 |
|---|---|---|
| F0 | < 2 Modelle mit Shopdaten | „Für {Namen} enthält der Shop-Export keine Merkmale – ein Vergleich der Merkmale ist nicht möglich." |
| F1 | K trifft zu | „Unterschiedliche Produktklassen: {Gruppe 1} {hat/haben je} {Klassenwert 1}, {Gruppe 2} {Klassenwert 2}." |
| F2 | U = ∅ | „Laut Shopdaten in allen {G} gepflegten Merkmalen gleich – {verschieden ist nur die Design-Linie \| einen Unterschied zeigen die Shopdaten nicht}." |
| **F3a** | U∩T, O∩T, U∩F, O∩F = ∅ | „Laut Shopdaten technisch gleich." |
| **F3b** | U∩T = O∩T = ∅, U∩F ≠ ∅ | „Laut Shopdaten technisch gleich, aber in {U∩F} verschieden{, bei … nicht eindeutig}." |
| **F3c** | U∩T = O∩T = U∩F = ∅, O∩F ≠ ∅ | „Laut Shopdaten technisch gleich, bei {O∩F} nicht eindeutig ({Grund})." |
| F4 | \|U∩T\| = 1, O∩T = ∅ | „Laut Shopdaten technisch gleich bis auf {Akk-Label}{BZ}." |
| F5 | U∩T = ∅, O∩T ≠ ∅ | „Laut Shopdaten kein technischer {Mehrwert \| Unterschied} belegt (nicht gepflegt: {O∩T})." (Doc 11 R4; „Mehrwert" nur bei verschiedenen Preisen) |
| F6 | sonst | „Technisch verschieden – vor allem {Dat-Phrase r1}{, r2}{ und r3}; insgesamt {U} Unterschiede{, {O} Merkmale nicht für alle gepflegt}." (r = die ersten U∩T-Zeilen in Lens-Reihenfolge, höchstens 3 bei 2 Modellen und 2 bei 3–4 Modellen) |

### 3.3 Satz 2 (Preis): neutral, ohne Δ-Zahl, nie „günstig"

| Lage | Satz 2 |
|---|---|
| F1 | „Die Preise sind deshalb nicht als Aufpreis vergleichbar{; außerdem verschieden: {≤ 2 weitere U∩T-Labels, sonst U-Labels}}." Im Kopf steht keine Δ (AK 6) |
| Gleicher Preis (alle Modelle) | „Gleicher Preis; verschieden {ist \| sind} {A∪F-Phrasen ≤ 4}." Entfällt, wenn es nichts zu nennen gibt |
| **2 Modelle, Preis verschieden** (F2–F6) | *(CP4)* „{T-Ref} kostet mehr und unterscheidet sich in: {U-Phrasen ≤ 4}{ und {n} weiteren Merkmalen}." Zwillinge: „Die Ausführung mit Aufpreis unterscheidet sich in: …". Ist der Titel des T-Ref länger als 24 Zeichen (Artikel ohne Design-Linie): „Das Modell mit dem höheren Preis unterscheidet sich in: …". Bei F2: „Der Preisunterschied geht mit keinem gepflegten Merkmal einher." |
| 3–4 Modelle, Preis verschieden, F2–F5 | *(CP4)* „Neben den Preisen unterscheiden sich {U-Labels, die Satz 1 noch nicht nennt}." bzw. „… nur die genannten Merkmale." Bei F2: „Die Preisunterschiede gehen mit keinem gepflegten Merkmal einher." |
| 3–4 Modelle, Preis verschieden, F6 | *(CP4)* „Die Preisunterschiede lassen sich deshalb keinem einzelnen Merkmal zuordnen." |

- **CP4 (PO-Abnahme M2):** „laut Shopdaten" steht höchstens einmal je Fazit, in Satz 1; die Floskel „geht … mit diesen Werten von {Ref} einher" und „weitere Unterschiede zeigen die Shopdaten nicht" entfallen (die Quellzeile nennt die Herkunft, Satz 1 sagt schon, was gleich ist).
- **Entfällt (CP1):** „einen Mehrwert für den Aufpreis belegen die Shopdaten nicht", „Einen Ausstattungsvorsprung … belegen die Shopdaten nicht", „Zusätzlich für den Aufpreis …", „Der Aufpreis bringt …".
- Die U-Phrasen enthalten **alle** U-Klassen (T, A und F). Die F-Werte stehen also in jedem Zweig von Satz 2; die F-Labels in Satz 1 stehen ohne Werte (ein Fakt = einmal).

**Phrasen je Zeile** (nominale Listenform, Wert von T-Ref zuerst, Werte wörtlich aus der Zelle):

| Zeile | Akk („bis auf …") | Dat („vor allem …") | Phrase |
|---|---|---|---|
| Typ / System | den Typ / das System | im Typ / im System | „{Label} {vT} statt {vB}" |
| Anzahl Klingeltaster | die Tasteranzahl | in der Tasteranzahl | „{vT} statt {vB} Taster" |
| Namensschild | das Namensschild | im Namensschild | „Namensschild {vT} statt {vB}" |
| Türöffner-Bedienung | die Türöffner-Bedienung | in der Türöffner-Bedienung | „Türöffner-Bedienung {Liste}" bzw. „zusätzlich {Extra}" |
| Kamera / Nachtsicht / Sichtwinkel / IP / IK | den/die … | im/in der … | „{Label} {vT} statt {vB}" |
| Farben | – | in den Farben | „zusätzlich die Farbe(n) {≤ 3 \| n weitere}" / „nur {≤ 3} statt {m} Farben" / „{n} statt {m} Farben" |
| Abmessungen | – | in den Maßen | 1 Achse verschieden: „{Höhe\|Breite\|Tiefe} {a} statt {b} cm"; mehrere: „Maße {B × H × T} statt {B × H × T}" |
| Gewicht | – | im Gewicht | „Gewicht {a} statt {b}" |
| Fächer · Zeitungsfach · Klingel · Montage · Material | die/das … | in der/im … | „{Label} {vT} statt {vB}" (Mengen: abweichende Elemente) |

Bei 3–4 Modellen gruppiert die Dat-Phrase nach Wert:
- weicht genau ein Modell ab: „({Ref}: {v}, sonst {w})";
- sonst „({v}: {Refs}; {w}: {Refs})".

### 3.4 Hinweis unter dem Fazit
Höchstens einer: Modell ohne Shopdaten (`guardsData`-Text). O steht in Satz 1 (F3b/F3c/F4/F5/F6) und als Tabellenabschnitt (AK 27).

### 3.5 Erklärsätze: Regeln
- Ein Satz erscheint nur, wenn seine Zeile **U** ist und der Auslösewert bei ≥ 1 Modell der Basis vorkommt.
- Höchstens 3 Sätze, Reihenfolge = Lens-Zeilen.
- Form: „**{Ref}:** {fester Satz}". Eingesetzt wird nur der Ref, kein Wert; mehrere Modelle mit demselben Wert werden zusammengefasst („SDM10X, Colson, Kai: …").
- Ein Satz entfällt, wenn Satz 1 oder 2 dieselbe Folge schon nennt (heute ist das bei keinem der Fall).
- Darstellung: ab 90 rem offen rechts neben dem Fazit, darunter hinter „Was bedeutet das?" (inline am Textende, `aria-expanded`). Ohne Satz gibt es keinen Button.
- Dieselben Sätze ersetzen den Bedarfsteil der (i)-Hinweise der jeweiligen Zeile. Alle übrigen Bedarfs- und Faustregeln in den (i)-Texten entfallen („ideal bei Modernisierung", „für Eigentümer", „ideal bei Mietobjekten"). Die (i) definieren nur noch.

### 3.6 Erklärsätze (von der Nutzerin freigegeben, gekürzt nach Vorgabe 05.11.)

Die Vorgabe der Nutzerin: nur nicht Offensichtliches, das bei der Entscheidung hilft; kein Wiederholen des Zellwerts oder des Fazits; kurz; im Zweifel weglassen statt einschränken. Die Fakten sind nach PO-Änderung 4 geprüft.

**Gültige Sätze:**

| # | Auslöser (Zeile = Wert) | Satz (nach „{Ref}:") | Grundlage / Faktenprüfung |
|---|---|---|---|
| **E1** | System = 2-Draht-BUS | „Nutzt eine vorhandene zweiadrige Klingelleitung weiter." | (i) System / Phase-0 „nutzt vorhandene Klingelleitungen". Es wird nur gesagt, was der Shop sagt; „kein neues Kabel nötig" entfällt, weil die Eignung der Leitung nicht belegt ist |
| **E2** | System = IP-System | „Braucht an der Außenstation eine Verbindung zu Ihrem Heimnetzwerk." | Folgt aus „IP-System". Der Satz nennt bewusst weder LAN noch WLAN/PoE, die im Export nicht belegt sind (PO-Prüfpunkt) |
| **E4** | Namensschild = Lasergraviert | „Ändert sich ein Name, brauchen Sie ein neues Schild." | Eine Gravur ist dauerhaft; der Shop führt Ersatzschilder (Doc 11 §5). Die Faustregel „Eigentümer" entfällt |
| **E10** | Montageart = Unterputz (bei Unterschied) | „Braucht eine passende Öffnung in der Wand." | Folgt aus „Unterputz: in der Wand" ((i) Montageart; Nora = „Mauerdurchwurf" im Shopnamen) |

**Gestrichene Sätze:**

| # | Gestrichen, weil |
|---|---|
| E3 Typ = Audio („keine Kamera") | offensichtlich; die Kamerazeilen zeigen bereits „–" |
| E5 Papiereinleger („Namen selbst tauschen, Mietobjekt") | Der Zellwert „Austauschbar (Papiereinleger)" sagt das schon; „Mietobjekt" ist eine Faustregel |
| E6 Digital („elektronisch hinterlegt") | wiederholt nur den Wert; wie Namen geändert werden (App/Display), ist nicht belegt |
| E7 Klingeltaster („ein Taster je Wohneinheit") | allgemein bekannt |
| E8 Türöffner-Bedienung („ohne Schlüssel") | Label und Werte (RFID, PIN-Code) sagen es; die eigentliche Folge (elektrischer Türöffner nötig) ist nicht belegt |
| E9 Fächer („ein Fach je Partei") | allgemein bekannt |
| E10 (Teil Aufputz/Stand/Zaun) | offensichtlich; nur die Unterputz-Folge bleibt |

### 3.7 Durchgespielt (Soll-Ausgabe, aus `MTZ_VGL_DATA` berechnet)

**Szenarien aus dem Brief:**

| | U / O / G | Fall | Fazit (Satz 1 + 2) | Erklärsätze |
|---|---|---|---|---|
| **S1** colson1, neo1 | 4 / 0 / 8 | F3b | „Laut Shopdaten technisch gleich, aber in Maßen und Gewicht verschieden. Colson kostet mehr und unterscheidet sich in: Namensschild Lasergraviert statt Austauschbar (Papiereinleger), zusätzlich die Farbe Weiß, Höhe 27,4 statt 29 cm, Gewicht 2,12 statt 2,39 kg." | E4 (Colson) |
| **S2** colson1, colson2 | 1 / 0 / 11 | F4 | „Laut Shopdaten technisch gleich bis auf die Tasteranzahl. Die Ausführung mit Aufpreis unterscheidet sich in: 2 statt 1 Taster." | – |
| **S3** dominik1, sdm10x, colson1, kai1 | 8 / 5 / 1 | F6 | „Technisch verschieden – vor allem im Typ (Kai: Audio, sonst Video) und im System (Maxior: 2-Draht-BUS, sonst IP-System); insgesamt 8 Unterschiede, 5 Merkmale nicht für alle gepflegt. Die Preisunterschiede lassen sich deshalb keinem einzelnen Merkmal zuordnen." | E1 (Maxior), E2 (SDM10X, Colson, Kai), E4 (Colson) |
| **S4** siebert, ebenhard, trias | 5 / 3 / 1 | F1 | „Unterschiedliche Produktklassen: Siebert und Ebenhard haben je 1 Fach, die Briefkastenanlage freistehend für 3 Parteien hat 3 Fächer. Die Preise sind deshalb nicht als Aufpreis vergleichbar; außerdem verschieden: Zeitungsfach, Montageart." | – |
| **S5** ebenhard, ebenhard-v2a | 1 / 1 / 6 | F3c | „Laut Shopdaten technisch gleich, beim Gewicht nicht eindeutig (je nach Ausführung). Die Ausführung mit Aufpreis unterscheidet sich in: nur Edelstahl statt 7 Farben." | – |

AK 8 (Fakten): S1 nennt „Lasergraviert" 2-mal (Tabelle + Fazit). S2 hat 5-mal „taster": 2 Titel, 1 Label, im Fazit „Tasteranzahl" und „Taster".

**Neue Testfälle (Änderung 11):**

| Test | IDs (Lens Briefkästen) | U / O / G | Erwartung |
|---|---|---|---|
| T1 Klassenregel K (1-Partei-Standbriefkasten) | `lessing,siebert` (Alves, Standmontage, 1 Fach) | 4 / 1 / 4 | **Kein F1.** F4: „Laut Shopdaten technisch gleich bis auf die Montageart, außerdem in Maßen und Gewicht verschieden, beim Material nicht eindeutig (k. A.). Alves kostet mehr und unterscheidet sich in: Montageart Standmontage statt Aufputz, 3 statt 7 Farben, Maße 39,5 × 115 × 14,3 statt 37 × 37 × 10,5 cm, Gewicht 9,9 statt 3,4 kg." Kein Erklärsatz (kein Unterputz) |
| T1b Erklärsatz Montage | `schneider,siebert` (Nora, Unterputz) | – | F6 mit Zeitungsfach und Montageart; E10 „Nora: Braucht eine passende Öffnung in der Wand." |
| T2 Überlappende Spanne | `siebert,ebenhard` (3,4 kg gegen 3,4–5 kg) | 1 / 2 / 6 | Gewicht und Namensschild sind O. F3b: „Laut Shopdaten technisch gleich, aber im Material verschieden, beim Gewicht nicht eindeutig (je nach Ausführung). Gleicher Preis; verschieden ist das Material (Siebert: Edelstahl V4A, Ebenhard: Edelstahl)." Ebenso S5 |
| T3 Titel ohne Design-Linie bei 375 px | S4 sowie `trias,quartett` | – | Titel nicht gekürzt (3 Zeilen); Kopfhöhe aus allen Modellen 13,2 rem ≤ 13,5 rem; beim Spaltentausch unverändert |

---

## 4 · Zählregel (AK 12, 27)

- **Z0 Zeilenmenge R** = Lens-Zeilen ohne Preis und Design-Linie. Zeilen ohne einen einzigen echten Wert werden ausgeblendet und nicht gezählt.
- **Z1 Basis** = Modelle mit Shopdaten (≥ 2, sonst alle).
- **Z2 O (offen):**
  - **a)** Eine Zelle der Basis ist „k. A." (eine „k. A."-Achse innerhalb der Abmessungen zählt nicht), oder
  - **b)** eine Spanne „(je nach Ausführung)" überschneidet sich mit dem Wert bzw. der Spanne eines anderen Modells. Die Zelle zeigt die Spanne weiter; Spannen ohne Überschneidung sind U.
- **Z3 U**: sonst, wenn die kanonischen Werte der Basis nicht gleich sind. „–" ist ein Wert, Mengen werden ohne Reihenfolge verglichen, Abmessungen als ganzer String.
- **Z4 G**: alle übrigen Zeilen.
- **Z5** U + O + G = Zahl der eingeblendeten Merkmalszeilen. Angezeigt werden nur:
  - Schalter „Nur Unterschiede (U)",
  - Abschnittsköpfe „Unterschiede (U)", „Nicht für alle gepflegt (O)", „Gemeinsamkeiten (G)",
  - im Fazit „insgesamt U Unterschiede, O Merkmale …" (F6) bzw. „in allen G gepflegten Merkmalen" (F2).
  - Keine Prozente, kein „x von y", keine Sprungmarken.
- **Z6** Gezählt werden immer **alle** Modelle, auch bei der Spaltenwahl und im Druck.

---

## 5 · Tabellenverhalten

**Abschnitte:** je ein `tbody`, Kopf `th scope=rowgroup`; der Titel ist Text, Unterschiede sind also nicht nur an der Farbe erkennbar (AK 34).
1. **„Unterschiede (U)"**, immer offen. Bei U = 0: „Keine belegten Unterschiede." *(CP4)*
2. **„Nicht für alle gepflegt (O)"**, nur bei O > 0, immer offen. Unterzeile: „Mindestens ein Modell ohne Angabe im Shop („k. A.") oder mit Wert je nach Ausführung – kein belegter Unterschied."
3. **„Gemeinsamkeiten (G) · gilt für alle n Modelle"** mit Button „Anzeigen"/„Ausblenden" (`aria-expanded`, `aria-controls`), standardmäßig zugeklappt. **Aufgeklappt** hat jede G-Zeile nur `th scope=row` (Label + (i)) und **eine** Wertzelle mit `colspan` über alle sichtbaren Produktspalten. Darin steht der Wert einmal (Farben als Swatches + Liste) und für Screenreader „– gilt für alle n Modelle" (03 §3 Nr. 10, AK 8).

**Schalter und G-Button:**
- „Nur Unterschiede" und der G-Button teilen sich einen Zustand (an = G zu).
- Standard: an; bei U = 0 aus. Der Zustand wird bei jedem Öffnen neu gesetzt.
- Spaltenbreiten und Kopfhöhe bleiben gleich (AK 40).

**Zeilen und Zellen:**
- (i) als Toggletip wie heute, Inhalt nach §3.5. Kein Silbentrennen (`hyphens:manual`, AK 19).
- „k. A."/„–" mit Screenreader-Text, „Bestwert" nur bei IP/IK und vollständigen Werten, Farben ohne Zusatz, Mengen als Liste – alles unverändert.

**Spaltenwahl:** Eine U-Zeile, deren sichtbare Werte gleich sind, bekommt die Caption „Unterschied bei: {Ref der nicht sichtbaren Modelle}".

**Druck:** alle Modelle, G aufgeklappt (mit `colspan`), Erklärsätze offen, keine Alternativen, keine Bedienelemente; Kopfzeile „edelstahl-tuerklingel.de · Kategorie · Datum" und Quellzeile (AK 29/42).

---

## 6 · Responsives Verhalten

### 6.1 Breiten

| Breite | 2 Modelle | 3 Modelle | 4 Modelle |
|---|---|---|---|
| 1920 / 1440 | L, Bild 10 rem | L, Bild 10 rem | L, Bild 7,5 rem |
| 1024 | L, Bild 7 rem | M | M |
| 768 | L, Bild 6 rem | M | M, Spaltenwahl 3 von 4 |
| 375 | 2 Spalten, Bildleiste | Spaltenwahl 2 von 3 | Spaltenwahl 2 von 4 |

- Nie horizontales Scrollen (AK 14).
- Unter 48 rem steht das Label über den Werten: `tr{display:grid}`, `th[scope=row]{grid-column:1/-1}` mit **expliziten ARIA-Rollen** `table/row/rowheader/columnheader/cell` (AK 32).
- Bei 320 px / 400 % Zoom darf die Leiste umbrechen. `fitHeader()` löst den Kopf bei > 60 % Höhe aus der Sticky-Position, läuft aber **nur bei Resize/Zoom und beim Rendern, nie beim Scrollen** (AK 23/35).

### 6.2 Spaltenwahl (freigegeben, AK 18) mit den CP1-Bedingungen
- Sichtbar sind höchstens 2 Spalten (< 48 rem) bzw. 3 (48–64 rem). Der Titel ist ein Button mit ▾ und öffnet eine Liste **aller** Modelle (mobil als Bottom-Sheet wie die Modellsuche).
- Die Liste zeigt je Modell Bild, Titel, Preis und den Ort: „in Spalte 1", „in Spalte 2" bzw. „nicht sichtbar". Wählt man das Modell der Nachbarspalte, werden die Spalten getauscht.
- Sichtbare Hinweise: die Pille „i / n" auf jedem Bild, der Chevron, „Vergleich (n)". Startpaar: die ersten beiden der Auswahl.
- **Die Kopfhöhe wird aus allen Modellen berechnet** (längster Titel). Ein Tausch verschiebt nichts (AK 24/40).
- **Fazit, Zählung und Druck beziehen sich immer auf alle Modelle** (Z6).
- Nach dem Tausch bleibt der **Fokus auf dem Titel-Button**, die Live-Region meldet „Spalte 1 zeigt jetzt ADM10 Kai."
- Tastatur: Enter/Leertaste öffnet; ↑/↓ und Enter wählen; Escape schließt und fokussiert den Button.
- Screenreader:
  - Button-Name: „Spalte 1 von 2: VDM10 2.0 Colson. Modell wechseln, 4 Modelle im Vergleich" (`aria-haspopup=listbox`).
  - Ausgeblendete Spalten bekommen `hidden`.
  - `caption`: „… – sichtbar: A, B".
- Verworfen: Wischen (Labels verlieren den Bezug, verdeckte Spalten sind für Screenreader unsichtbar), Karten je Modell (kein Nebeneinander), transponierte Tabelle (Namen in jeder Zeile).

### 6.3 Tastatur und Screenreader
- **Tab-Reihenfolge** = Leserichtung = Pfad AK 33:
  1. Leiste (← Merkliste, **Schalter**, Link, Drucken, Leeren, ×)
  2. **„Was bedeutet das?"**
  3. Labelkopf (Hinzufügen, Merkliste)
  4. je Spalte [**Titel-Button**] · **CTA** · **×**
  5. (i)-Buttons
  6. **„Gemeinsamkeiten anzeigen"**
  7. Alternativen
  8. mobil die Aktionszeile
  9. „Rückgängig" im Toast, solange er sichtbar ist (§7)
- Unverändert: Fokusfalle, `role=dialog`, `aria-modal`, `h2`, Fokus-Rückgabe. Escape schließt in dieser Reihenfolge: Tip → Liste/Suche/Teilen → Dialog (AK 31).

---

## 7 · Interaktionen und Zustände

| Zustand / Aktion | Verhalten |
|---|---|
| **Öffnen** | Schalter nach §5, Fokus auf das `h2`, URL `?vergleich=`, Seitentitel „Vergleich: A vs. B \| Metzler" (neue Titel) |
| **Schalter / G-Button** | Klappt nur Abschnitt 3; der Fokus bleibt. Live: „Nur Unterschiede an – {G} Gemeinsamkeiten ausgeblendet." / „Alle Merkmale – {G} Gemeinsamkeiten eingeblendet." |
| **„Was bedeutet das?"** | Klappt die Erklärsätze auf (`aria-expanded`) |
| **Entfernen (×)** | Fokus auf das × der nächsten Spalte; Live „{Ref} entfernt. Vergleich mit n Modellen." (wie heute) |
| **Rückgängig-Toast** (neu, Anatomie wie `.mkl-toast`) | „{Ref} entfernt." · „Rückgängig". Der Toast liegt **im Dialog** und damit in der Fokusfalle (wie der Merkliste-Toast im Drawer), unten im Scrollbereich, nie über dem Sticky-Kopf. 6 s, der Timer **pausiert bei Hover und Fokus** (WCAG 2.2.1). „Rückgängig" fügt das Modell an der alten Position wieder ein; Fokus auf dessen ×, Live „{Ref} wieder im Vergleich." |
| **2 → 1** | Der Dialog bleibt mit dem Leerzustand (unverändert); der Toast mit „Rückgängig" erscheint auch hier |
| **Hinzufügen** | Bestehende Suche bzw. Sheet; Fokus auf das × der neuen Spalte, Live wie heute; bei Spaltenwahl kommt das Modell in Spalte 2 |
| **Leeren + Rückgängig, aus der Merkliste, andere Kategorie, ungültig / > 4 / nur 1 gültig** | unverändert (Doc 06/09) |
| **Geteilter Link** | Toast „Geteilter Vergleich geöffnet." · „Meine Auswahl ({n})" (aria: „… wiederherstellen"), damit nichts abgeschnitten wird |
| **Toasts allgemein** | Unten mittig, höchstens `min(36rem, 100vw − 2rem)`, Text bricht um; verdecken weder Kopf noch Fazit (AK 19) |
| **Modell ohne Shopdaten** | Hinweis §3.4; die Spalte zeigt „k. A." und zählt nicht |
| **Bild offline** | Fallback auf das Kartenbild; feste Bildbox, kein Layout-Shift |
| **Zwilling (F3a/b/c)** | Alternativen nach G (höchstens 3, „Zum Vergleich", bei 4 Modellen deaktiviert) |
| **Drucken** | §5; danach wird der vorherige Zustand wiederhergestellt |

---

## 8 · Copy (neu oder geändert)

| Ort | Text |
|---|---|
| Schalter | „Nur Unterschiede ({U})" |
| Fazit | §3.2 / §3.3 wörtlich; `h3` „Fazit" nur für Screenreader |
| Erklärung | „Was bedeutet das?" / „Erklärung ausblenden"; Spalte ab 90 rem: „Was das bedeutet"; Sätze E1, E2, E4, E10 (§3.6) als „{Ref}: {Satz}" |
| Kopf | „ab {Preis}" · „+ {Δ}" (SR: „{Δ} mehr als das Modell mit dem niedrigsten Preis im Vergleich") · „UVP {UVP}" (SR: „unverbindliche Preisempfehlung …") · CTA „Konfigurieren"/„Zum Produkt" (aria „… – {Titel}") · × aria „{Titel} aus dem Vergleich entfernen" |
| Spaltenwahl | Pille „{i} / {n}" · Button-aria §6.2 · Liste „Modell für Spalte {k} wählen" · Ort „in Spalte {k}" / „nicht sichtbar" · Live „Spalte {k} zeigt jetzt {Ref}." |
| Labelkopf | „Modell hinzufügen" · „noch {n} möglich" · „Aus der Merkliste ({m})" · „4 von 4 Modellen" + „Entfernen Sie ein Modell, um ein anderes hinzuzufügen." |
| Abschnitte | „Unterschiede ({U})" · „Keine belegten Unterschiede." *(CP4)* · „Nicht für alle gepflegt ({O})" + Unterzeile §5 · „Gemeinsamkeiten ({G})" + „gilt für alle {n} Modelle" + „Anzeigen"/„Ausblenden" · SR in der G-Zelle „– gilt für alle {n} Modelle" |
| Zeile bei Spaltenwahl | „Unterschied bei: {Ref}" |
| (i)-Hinweise | Definitionen ohne Faustregeln; Bedarfsteil = E1/E2/E4/E10 |
| Alternativen | „Alternativen mit technischem Unterschied" (CP4: ohne Varianten, die sich nur in der Tasteranzahl unterscheiden; bleibt sonst nichts, heißt der Block „Andere Tasteranzahl") · „Zum Vergleich" |
| Quellzeile 2 | Sprechanlagen: „„ab"-Preise gelten für die Standardausführung; Farbe und Gravur legen Sie auf der Produktseite bzw. in der Konfiguration fest." · Briefkästen: „… Farbe, Gravur, Ständer und Erweiterungen legen Sie im Konfigurator fest." (bestehender Text aus `configNote` bzw. dem (i) der Preiszeile) |
| Aktionszeile (< 48 rem) | „Modell hinzufügen" · „Aus der Merkliste ({m})" · „Teilen" · „Drucken" · „Vergleich leeren" |
| Toasts / Live | „{Ref} entfernt." + „Rückgängig" · „{Ref} wieder im Vergleich." · „Meine Auswahl ({n})" · Schalter-Ansagen §7 |
| Tour Schritt 4 | „Ein Klick öffnet die Gegenüberstellung: oben das Fazit in Klartext, darunter die Unterschiede, dann die Gemeinsamkeiten (zugeklappt)." + `LENS.step4` |
| **Entfällt** | „Auf einen Blick", „Das zeichnet das Modell aus", „Keine Besonderheit …", „x von y …", „Zu x % ähnlich …", „Technisch baugleich …", „Was der Aufpreis bringt", „Gleicher Preis — das unterscheidet …", „Gleiche Design-Linie …", „Set vs. Einzelmodell …", „Alle technischen Details anzeigen (n)", „Weniger anzeigen", „+ n weitere", „zusätzlich:/ohne:", Zusatzzeile unter dem Namen, „kein Mehrwert"/„Ausstattungsvorsprung"-Sätze, Erklärsätze E3/E5–E9 |

Kein „Wishlist / Wunschzettel / Favoriten / günstig / Warenkorb"; durchgehend „Sie" (AK 37).

---

## 9 · Abgleich mit den Akzeptanzkriterien (Stand CP1)

| AK | Erfüllt durch | Anmerkung |
|---|---|---|
| 1 | §3.2–3.3, §3.7 S1 | – |
| 2 *(CP1)* | §3.3 | Neutral „geht … einher"; S3 nicht zuordenbar; R4-Satz nur bei F5 |
| 3 *(CP1)* | §3.2 F3a/b/c, F4 mit BZ, §3.7 S1/S2/S5 | – |
| 4 | §2.3 | 3. Zeile als Ausnahme bei 375 px |
| 5 | §2.2 | – |
| 6 | §3.1 K, F1 | Ohne Δ |
| 7 | §2.4 | – |
| 8 *(CP1)* | §2.2, §3.3 (F-Labels in Satz 1 ohne Werte), §3.5, §5 G-`colspan` | S2 hat 5-mal „taster", S1 2-mal „Lasergraviert" |
| 9 | §2.3 | – |
| 10 | §1 | – |
| 11 | §5 | – |
| 12 *(CP1)* | §4 | Keine Sprungmarken |
| 13 | §2.5 | – |
| 14 | §6.1 | – |
| 15 | §2.6 | – |
| 16 | §2.6 (S3 = 378 px) | Messung CP2/CP3 |
| 17 | §2.6, §6.1 | – |
| 18 *(CP1)* | §6.2 (S3 = 475 px) | Messung CP2/CP3 |
| 19 | §5, §7 | – |
| 20 | §2.4, §2.1, §6.2 | – |
| 21 | §2.5 | – |
| 22 | §7 | + Rückgängig |
| 23 | §2.6, §6.1 (`fitHeader` nie beim Scrollen) | – |
| 24 *(CP1)* | §2.6, §6.2 | 12 rem; 13,2 rem bei 3-zeiligem Titel |
| 25 | §2.3 | – |
| 26 | §3, §3.7 | – |
| 27 *(CP1)* | §4 Z2, §5 | – |
| 28 | §5 | – |
| 29 | §2.1, §5 | – |
| 30 *(CP1)* | keine Datenänderung | gegen CP0-Kopie |
| 31 | §6.3 | – |
| 32 | §6.1, §6.2 | – |
| 33 *(CP1)* | §6.3 | Pfad vollständig abgebildet |
| 34 | §5 | – |
| 35 | §6.1 | – |
| 36 | §7 | – |
| 37 | §8 | – |
| 38 | 12b | – |
| 39 | §2.4, §6.2 | – |
| 40 | §5, §6.2, §7 | Der Toast liegt im Scrollbereich; der Schalter klappt nur G |
| 41 | Build | – |
| 42 | §7 | – |
| 43 *(CP1)* | gesamt | Nur `vergleichen.js/css` |

---

## 10 · Offene Punkte

1. **Richtungsfreigabe** der Liste §2.8 durch die Nutzerin (vor allem Nr. 1: Bauform als eigene Klasse).
2. **Messung bei CP2** (UI-Mock, echte Texte aus §3.7) für S3 bei 1024/375 und S4 bei 375. Sie ist die Grundlage für die Hebel in §2.6.
