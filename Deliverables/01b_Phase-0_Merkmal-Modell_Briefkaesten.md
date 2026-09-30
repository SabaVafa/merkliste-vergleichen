# Phase 0 — Merkmal-Modell & Migrations-Leitfaden

**Kategorie: Briefkästen** · METZLER (edelstahl-tuerklingel.de, JTL-Shop / Snackys)
Deliverable 1b · Ergänzung zum Sprechanlagen-Modell (`01_Phase-0_Merkmal-Modell_Sprechanlagen.md`) · Grundlage für die Briefkästen-Linse in Vergleichen (Version B) und den Briefkasten-Finder

---

## 0 · Zweck und Ausgangslage

Der Anlass ist konkret: **Siebert** und **Ebenhard** (beide ab 89,99 €, 37 × 37 × 10,5 cm, 7 Farben, 1 Fach, Zeitungsfach integriert) sind mit den heute strukturierten Daten **nicht unterscheidbar** — der einzige abweichende Wert ist das Gewicht (3,40 kg vs. 5,00 kg), und der ist mit hoher Wahrscheinlichkeit ein Pflegefehler. Alles, was die Kaufentscheidung tatsächlich trägt (Namensschild-Mechanik, verdeckte Einwurfklappe, Smart-Optionen, Aufstellung, Design), steht ausschließlich im Fließtext oder im Titel.

Briefkästen sind dabei anders gebaut als Sprechanlagen: Ein **Korpus** (überwiegend 37 × 37 × 10,5 cm, galvanisierter Stahl, pulverbeschichtet) wird mit **verschiedenen Fronten** zur Design-Linie (Siebert, Ebenhard, Albrecht, Thobe, Enno, Stencil, Cube, Svena, Oltmann …). Technisch sind viele Modelle baugleich — genau der Fall, für den Version B den Zustand „Technisch baugleich" hat. Damit dieser Zustand **etwas zu sagen hat**, müssen die Fronten-Unterschiede als Merkmale existieren.

Dieses Dokument definiert dafür: (1) Bestandsaufnahme, (2) das Merkmal-Set, (3) den Migrations-Leitfaden, (4) belegte Seed-Werte für acht Leitmodelle, (5) den Vergleichstabellen-Plan (Briefkästen-Linse), (6) das JSON-Datenmodell.

---

## 1 · Bestandsaufnahme

Datenbasis: `Json Folder/briefkasten-finder.json` (217 Einträge in der Kategorie samt Unterkategorien) und die Live-PDPs Siebert / Ebenhard (Stand 2026-09-30).

**Was in den 217 Einträgen steckt:** 80 Briefkästen · 77 Einfamilien · 56 Standbriefkästen (überwiegend Wandmodell + Ständer als eigene SKU) · 35 Mehrfamilien/Anlagen · 19 mit Klingel & Sprechanlage · 4 Unterputz · 26 „ohne Gravur" · dazu 42 Ersatzteile & Zubehör, 22 Ersatz-Gravurleisten, 20 Ständer, 16 Schilder. Nach Bereinigung um Zubehör bleiben **ca. 85 echte Briefkasten-Modelle**; Preise ab 69,99 € (Median 229 €, Anlagen bis 2.390 €).

### 1a · Bereits strukturiert

| Merkmal | Werte | Deckung | Bewertung |
|---|---|---|---|
| **Farbe** | Anthrazit · Schwarz · Grau · Eisenglimmer · Weiß · Edelstahl · Braun · Silber · Rot · Wunschfarbe | 190 | ✅ sauber, sofort nutzbar |
| **Anzahl der Briefkastenfächer** | 1 · 2 · 3 · 4 · 6 | 111 | ✅ sauber (= Parteien) |
| **Zeitungsfach** | Ohne · Integriert · Optional | 93 | ✅ nutzbar |
| **Material** | Edelstahl · V2A · V4A · Galvanisierter Stahl · Acrylglas · Lärchenholz · Metall | 105 | ⚠️ **verunreinigt** — aggregiert über Varianten und Bauteile: „V4A" ist die Gravurleiste, „Acrylglas" das Sichtfenster. Siebert führt „Galvanisierter Stahl + V4A", Ebenhard „Edelstahl + Galvanisierter Stahl" — beide sind derselbe Stahlkorpus. Als Vergleichszeile heute **irreführend**. |
| **Montageart** | Aufputz · Unterputz | 4 | ⚠️ praktisch ungepflegt |
| **Anzahl der Klingeltaster / System** | 1–3 · Flexibel · IP-System | 18 / 8 | nur Kombi-Modelle |
| **Preis (von–bis)** | Systemdaten | 217 | ✅ |
| **Abmessungen · Gewicht** | Artikelstammdaten (B × H × T, kg) | PDP | ✅ vorhanden, aber Gewicht prüfen (Siebert 3,40 kg vs. Ebenhard 5,00 kg bei identischem Maß) |

### 1b · Nur als Prosa oder Titel vorhanden — die eigentlichen Entscheider

Aus den 85 Modellen (Titel + Kurzbeschreibung): Standbriefkasten/Ständer 45 · Lasergravur/personalisiert 33 · Zeitungsfach 31 · Mehrfamilien/Anlage 30 · Smart (Fingerprint/RFID/App/Sensor) 15 · austauschbares Namensschild 9 · Klingel/Sprechanlage-Kombi 8 · Sichtfenster 7 · zwei Namensschilder 3 · Soft-Close 3 · beleuchtet 5. **Keines davon ist ein Merkmal.** Die Design-Linie steht nur als letztes Titelsegment („… | Siebert"), bei 8 Titeln endet der Titel sogar mit „personalisiert mit Gravur" statt mit dem Modellnamen.

**Widersprüche, die der Vergleich sichtbar machen würde:**
- Siebert wirbt mit „Ihr Name, austauschbar" (Gravurleisten wechselbar), Ebenhard ist das Modell mit „austauschbarem Namensschild" — die Abgrenzung ist auf beiden Seiten nicht formuliert.
- Siebert (neue PDP) zeigt Smart-Schloss, Einwurfsensor, Soft-Close, sieben Ständer, Deko, Kombi-Sets im Konfigurator; Ebenhard (alte PDP) nichts davon, Extras nur als Einzelartikel. Ob Ebenhard diese Optionen technisch **nicht hat** oder nur **nicht zeigt**, ist aus den Daten nicht erkennbar.

---

## 2 · Das Merkmal-Set für Briefkästen

Typ-Vokabular wie im Sprechanlagen-Modell: **Auswahl** · **Mehrfachauswahl** · **Ja/Nein** · **Zahl+Einheit** · **Freitext**.
**Rolle „soft"** = nicht-technischer Entscheider (Design, Namensschild, Farbe, Preis). Unterscheiden sich nur soft-Merkmale, zeigt Version B den Zustand „Technisch baugleich".

### 2a · Bestehende Merkmale — übernehmen bzw. bereinigen

| # | Merkmal | Typ | Maßnahme | Filter | Vergleich |
|--:|---|---|---|:--:|:--:|
| 1 | Farbe | Mehrfachauswahl | übernehmen (soft) | ✅ | ✅ |
| 2 | Anzahl der Briefkastenfächer | Auswahl | übernehmen; Anzeige-Label „Fächer / Parteien" | ✅ | ✅ |
| 3 | Zeitungsfach | Auswahl | übernehmen; Wert „Integriert (unten, beidseitig befüllbar)" als Anzeigetext | ✅ | ✅ |
| 4 | Material → **Korpusmaterial** | Auswahl | **bereinigen**: nur der Korpus (Galvanisierter Stahl, pulverbeschichtet · Edelstahl V2A · Edelstahl V4A · Lärchenholz). Bauteil-Materialien (Gravurleiste V4A, Acrylglas) wandern in N2 und N9. | ✅ | ✅ |
| 5 | Montageart → ersetzt durch **N11 Aufstellung** | – | auslaufen lassen (4 Modelle gepflegt) | – | – |
| 6 | Anzahl der Klingeltaster · System | Auswahl | nur bei Kombi-Modellen; unverändert | ✅ | ✅ |

### 2b · NEUE Merkmale (Titel/Prosa → Merkmal)

Priorisiert nach Kaufrelevanz × Varianz im Sortiment. **N1–N6 zuerst** — sie tragen die Entscheidung zwischen baugleichen Modellen.

| # | Merkmal | Typ | Erlaubte Werte | Filter | Vergleich | Warum |
|--:|---|---|---|:--:|:--:|---|
| N1 | **Design-Linie** *(soft)* | Auswahl | Siebert · Ebenhard · Albrecht · Thobe · Enno · Stencil · Cube · Svena · Oltmann · Hermann · Lepo · Masiva · Neumann · Gustav · Anton · Emma · Alves · Zeppelin · Moris · Stelio · Modell 01 / 02 / G … | ✅ (PLP) | ✅ | Die Front **ist** das Produkt. Heute nur im Titel. |
| N2 | **Namensschild** *(soft)* | Auswahl | Gravurleiste V4A, fest · Gravurleiste V4A, wechselbar · Austauschbares Namensschild (Einschub) · Zwei Namensschilder + Adressleiste · Gravierte Edelstahlblende · Ohne Namensschild | ✅ | ✅ | Der Siebert/Ebenhard-Entscheider: Eigentümer (dauerhaft) vs. Mieter (wechselbar) |
| N3 | **Einwurf** | Auswahl | Verdeckte Einwurfklappe · Offener Einwurfschlitz · Durchwurf (Unterputz) | ✅ | ✅ | Trockene Post, verdecktes Schloss — Kernargument der Siebert-PDP |
| N4 | **Max. Briefformat** | Auswahl | DIN C4 knickfrei · DIN C5 · DIN Lang | ✅ | ✅ | „Passt ein C4 flach hinein?" ist die häufigste Praxisfrage |
| N5 | **Smart-Optionen** | Mehrfachauswahl | Smart-Schloss (Fingerprint / RFID / App) · Einwurfsensor (App-Benachrichtigung) · Keine | ✅ | ✅ | +49,99 / +59,99 € im Konfigurator; unterscheidet Linien bei gleichem Grundpreis |
| N6 | **Aufstellung** | Mehrfachauswahl | Wandmontage · Standbriefkasten (Ständer wählbar) · Zaunmontage · Einbetonieren · Unterputz | ✅ | ✅ | Ersetzt „Montageart"; 56 Standbriefkästen sind heute eigene SKUs derselben Linie |
| N7 | **Sichtfenster** | Zahl | 0 · 1 · 3 | ✅ | ✅ | Postkontrolle ohne Öffnen (Cube, Svena, Oltmann) |
| N8 | **Schloss** | Auswahl | Verdeckt hinter Einwurfklappe · Standard-Zylinder · Smart-fähig (ersetzt Standardschloss) | – | ✅ | Frost/Nässe; Voraussetzung für N5 |
| N9 | **Namensschild-Material** | Auswahl | Edelstahl V4A gebürstet · Edelstahl V2A · Acrylglas (Sichtfenster) | – | ✅ | nimmt die Bauteil-Werte aus dem heutigen „Material" auf |
| N10 | **Norm DIN EN 13724** | Ja/Nein | Ja · Nein | – | ✅ | Vertrauensmerkmal, B2B-relevant |
| N11 | **Einwurfmaß** | Zahl+Einheit | z. B. 335 × 35 mm | – | ✅ | belegt N4; Vergleich zeigt es als Zusatzinfo |
| N12 | **Ausstattungsoptionen** | Mehrfachauswahl | Soft-Close (Absenkautomatik) · Entnahmesicherung · Zeitungsfach-Abdeckung · „Keine Werbung"-Schild · Blumenkasten / Dekorahmen · Ständer | – | ✅ | Zeile „Optional erweiterbar um" — der stärkste Unterschied Siebert vs. Ebenhard bei gleichem Preis |
| N13 | **Kombi-Sets** | Mehrfachauswahl | Mit Funkklingel · Mit Klingel (kabelgebunden) · Mit Video-Sprechanlage VDM10 · Mit Paketbox · Keine | ✅ | ✅ | 19 Kombi-Modelle; „alles aus einer Hand" |
| N14 | **Zeitungsfach abdeckbar** | Ja/Nein | Ja (Abdeckung optional) · Nein | – | ✅ | Ergänzt Merkmal 3 |
| N15 | **Beleuchtung** | Ja/Nein | Ja (LED, Hausnummer/Namensschild) · Nein | ✅ | ✅ | Mehrfamilien-Anlagen, Standbriefkästen |

**Anzeige-Regeln:** Bei **Unterputz-/Durchwurf-Modellen** N6 = „Unterputz", N3 = „Durchwurf", Ständer-Optionen als „–". Bei **Anlagen (≥ 2 Fächer)** zusätzlich Merkmal 2 als „Parteien" prominent führen. Bei **Modellen ohne Gravur** N2 = „Ohne Namensschild" (neutral, kein Nachteil).

---

## 3 · Migrations-Leitfaden: Titel/Prosa → JTL-Merkmale (Wawi)

### 3.1 · Merkmale, nicht Variationen — mit zwei Briefkasten-Besonderheiten

N1–N15 sind **artikelweit konstant** (ein Siebert hat die verdeckte Klappe in jeder Farbe) → **Artikelmerkmale am Vaterartikel**, wie bei den Sprechanlagen. Zwei Punkte sind anders:

1. **Standbriefkästen als eigene SKU.** 56 Einträge sind „Wandmodell + Ständer" derselben Linie (z. B. `SB-Hermann`). Empfehlung: **N6 Aufstellung** am Wandmodell mit *allen* möglichen Werten pflegen (Wand · Stand · Zaun · Einbetonieren, weil der Ständer im Konfigurator wählbar ist) und den Stand-SKU als **Variante derselben Linie** kennzeichnen (N1 identisch). Der Vergleich nutzt das als Leitplanke: gleiche Linie, andere Aufstellung → Hinweis „Variante — Ständer im Konfigurator wählbar", nicht zwei Spalten.
2. **„Material" bereinigen statt ergänzen.** Der heutige Wert ist die Vereinigung aller Varianten- und Bauteil-Materialien. Beim Umbau auf **Korpusmaterial** (Merkmal 4) sinkt die Werteliste auf vier Einträge; die Bauteil-Werte gehen in N9. Ohne diese Bereinigung zeigt der Vergleich „Edelstahl + Galvanisierter Stahl" gegen „Galvanisierter Stahl + V4A" — ein Unterschied, den es nicht gibt.

### 3.2 · Anlege-Reihenfolge

1. **Merkmale anlegen** (N1–N15) mit festen Wertelisten aus 2b. Für N1 die Linien-Liste aus den Titeln generieren (letztes Titelsegment), die 8 Titel ohne Linienname von Hand zuordnen.
2. **Material** in **Korpusmaterial** umbenennen und je Vaterartikel auf den einen Korpuswert reduzieren; V4A/Acrylglas nach N9.
3. **Werte zuweisen**, beginnend mit den acht Leitmodellen aus Abschnitt 4 (Werte liegen vor), dann die übrigen ca. 30 Einfamilien-Linien, dann Mehrfamilien/Anlagen.
4. **Shop-Sichtbarkeit**: „im Vergleich anzeigen" für alle; Filter für N1–N7, N13, N15.
5. **Gewicht** aller 37 × 37 × 10,5-Modelle gegen das Datenblatt prüfen (Siebert/Ebenhard-Abweichung).
6. **Abgleich Wawi → Shop.**

### 3.3 · Aufwand

- 10 der 15 Merkmale sind Auswahl/Ja-Nein mit ≤ 6 Werten → Sekunden je Artikel.
- Pilotumfang: **ca. 40 Linien** (nicht 217 SKUs — Farb- und Stand-Varianten teilen die Werte). Realistisch **ein Arbeitstag** inkl. Material-Bereinigung.
- Nebeneffekt: die neue Siebert-PDP-Struktur („Das Wichtigste in Kürze", Smart, Befestigung, Erweiterungen) lässt sich aus denselben Merkmalen für **alle** Linien erzeugen — Ebenhard bekäme die Sektionen automatisch, sobald die Werte gepflegt sind.

### 3.4 · Gravur bleibt Eigenschaft

Gravurtext, Schriftart und Vorschau bleiben native JTL-Eigenschaften bzw. Konfigurator-Zustand (pro Bestellung individuell) — **kein Merkmal**. Der Vergleich verweist mit „Konfigurieren" dorthin.

---

## 4 · Belegte Seed-Werte (acht Leitmodelle)

Quelle: Live-PDPs Siebert und Ebenhard (2026-09-30) sowie Titel/Kurzbeschreibung aus dem Katalog-JSON. **(?)** = aus den Daten nicht eindeutig, beim Pflegen aus dem Datenblatt bestätigen.

| Merkmal | **Siebert** | **Ebenhard** | **Albrecht** | **Svena** | **Cube** | **Thobe** | **Hermann (Stand)** | **Lepo** |
|---|---|---|---|---|---|---|---|---|
| Preis ab | 89,99 € | 89,99 € | 99,99 € | 109 € | 99,99 € | 99,99 € | 169 € | 139 € |
| N1 Design-Linie | Siebert | Ebenhard | Albrecht | Svena | Cube | Thobe | Hermann | Lepo |
| N2 Namensschild | Gravurleiste V4A, wechselbar | Austauschbares Namensschild (Einschub), graviert | Zwei Namensschilder + Adressleiste (V4A) | Gravierte Edelstahlblende | Gravierte Front (?) | Edelstahlleiste + Namensschild, graviert | Lasergravur (?) | Ohne Namensschild |
| N3 Einwurf | Verdeckte Einwurfklappe | Einwurfschlitz (?) | Einwurfklappe (?) | Einwurfklappe (?) | Offener Einwurfschlitz | Verdeckte Einwurfklappe | (?) | Offener Einwurfschlitz |
| N4 Max. Format | DIN C4 knickfrei | DIN C4 | DIN C4 (?) | DIN C4 (?) | DIN C4 (?) | DIN C4 | (?) | DIN C4 (?) |
| N11 Einwurfmaß | 335 × 35 mm | (?) | (?) | (?) | (?) | (?) | (?) | (?) |
| N10 DIN EN 13724 | Ja | Ja | (?) | (?) | (?) | (?) | (?) | (?) |
| N8 Schloss | Verdeckt, smart-fähig | Standard (?) | (?) | (?) | (?) | (?) | (?) | (?) |
| N5 Smart-Optionen | Smart-Schloss · Einwurfsensor | Keine (nicht angeboten) (?) | (?) | (?) | (?) | (?) | (?) | (?) |
| N7 Sichtfenster | 0 | 0 | 0 | **3** | **3** | 0 | 0 | 0 |
| Zeitungsfach (3) | Integriert, beidseitig | Integriert, unten | Integriert | Integriert | Integriert | Integriert | Integriert | Integriert |
| N14 abdeckbar | Ja (+19,99 €) | Ja (Zubehör) | (?) | (?) | (?) | (?) | (?) | (?) |
| N6 Aufstellung | Wand · Stand (7 Ständer) · Zaun · Einbetonieren | Wand · Stand (Erpo, Zubehör) | Wand · Stand | Wand · Stand | Wand · Stand | Wand · Stand | **Stand (Edelstahl-Standfuß)** | Wand (Aufputz) |
| N12 Ausstattungsoptionen | Soft-Close · Entnahmesicherung · ZF-Abdeckung · Keine-Werbung · Deko (Cubic/Frame/Plate) · Ständer | Entnahmesicherung · ZF-Abdeckung · Keine-Werbung · Ständer (alle als Einzelartikel) | (?) | (?) | (?) | (?) | (?) | (?) |
| N13 Kombi-Sets | Funkklingel · VDM10-Set | Keine | Keine | Keine | Keine | Keine | Keine | Keine |
| Korpusmaterial (4) | Galv. Stahl, pulverbeschichtet | Galv. Stahl, pulverbeschichtet | Galv. Stahl | Galv. Stahl | Stahl (?) | Galv. Stahl | Galv. Stahl + Edelstahl-Fuß | Galv. Stahl |
| N9 Namensschild-Material | V4A gebürstet | Edelstahl | V4A | V4A + Acrylglas | Acrylglas (Fenster) | V2A | (?) | – |
| Farben | 7 | 7 | 6 | 5 | 5 | 5 | 5 | 5 |
| Abmessungen | 37 × 37 × 10,5 cm | 37 × 37 × 10,5 cm | (?) | (?) | (?) | (?) | (?) | (?) |
| Gewicht | 3,40 kg (?) | 5,00 kg (?) | (?) | (?) | (?) | (?) | (?) | (?) |

> **Lesehilfe:** Siebert vs. Ebenhard unterscheiden sich nach diesem Modell in **N2, N3, N5, N8, N12, N13** — sechs echte Entscheider statt „Gewicht". Genau diese Zeilen würde Version B im Zustand „Technisch baugleich" als „Das unterscheidet sie" zeigen, mit dem Fazit „Gleicher Preis — Siebert bietet Smart-Schloss, Einwurfsensor und Soft-Close als Option; Ebenhard das Einschub-Namensschild für Mieterwechsel".

---

## 5 · Vergleichstabellen-Plan — die Briefkästen-Linse

Briefkästen sind Design-Käufe: das **Produktbild bleibt die primäre Vergleichsdimension** (großer Hero, Farbvariante wählbar). Reihenfolge der Gruppen deshalb Design-first, Technik danach.

**Gruppe A — Design & Namensschild** *(soft-Zeilen)*
`Preis` · `Design-Linie` · `Namensschild` · `Namensschild-Material` · `Farben` · `Sichtfenster`

**Gruppe B — Post & Einwurf**
`Einwurf` · `Max. Briefformat` · `Einwurfmaß` · `Norm DIN EN 13724` · `Zeitungsfach` · `Zeitungsfach abdeckbar` · `Fächer / Parteien`

**Gruppe C — Schloss & Smart**
`Schloss` · `Smart-Optionen`

**Gruppe D — Aufstellung & Bauform**
`Aufstellung` · `Korpusmaterial` · `Abmessungen` · `Gewicht` · `Beleuchtung`

**Gruppe E — Optionen & Sets**
`Optional erweiterbar um` (N12) · `Kombi-Sets` (N13)

**Regeln für Version B in dieser Kategorie**
- **Twin-Zustand** greift, wenn nur Gruppe A abweicht → Fazit look-first, Hero 200 px+, Wertaussage „Was der Aufpreis bringt" bzw. bei gleichem Preis „Gleicher Preis — Ihre Entscheidung: …" mit den Werten aus N2/N5/N12.
- **Leitplanke Variante:** gleiche Design-Linie, andere Aufstellung (Siebert vs. Standbriefkasten Siebert) oder andere Farbe → nicht als zweite Spalte, sondern Hinweis „Variante — im Konfigurator wählbar".
- **Leitplanke Kategorie:** Kombi-Set (mit VDM10) neben reinem Briefkasten → Warnhinweis „Set vs. Einzelmodell", Preis nicht als Bestwert werten.
- **Bestwert** nur auf Sichtfenster (max), Max. Briefformat (C4 > C5 > Lang), Smart-Optionen (mehr), Ausstattungsoptionen (mehr). **Nie** auf Preis (Delta neutral).
- **Alternativen mit echtem Unterschied** aus N2, N7, N5, N6, N13 (z. B. „Albrecht: zwei Namensschilder", „Svena: 3 Sichtfenster", „Hermann: Standbriefkasten", „Siebert Frame J: mit Blumenkasten").
- **CTA:** `Konfigurieren` für alle Modelle mit Gravur/Optionen, `Zum Produkt` für „ohne Gravur". Kein Direktkauf.

---

## 6 · Datenmodell (JSON) für den Prototyp

Additiv zum bestehenden `briefkasten-finder.json`, analog zu den Sprechanlagen (`specs`-Objekt je Modell):

```jsonc
{
  "sku": "Siebert",
  "name": "Metzler Briefkasten aus hochwertigem Stahl | Siebert",
  "price_eur_gross": { "from": 89.99, "to": 139 },
  "characteristics": { "Farbe": ["Anthrazit", "..."], "Anzahl der Briefkastenfächer": ["1"], "Zeitungsfach": ["Integriert"], "Korpusmaterial": ["Galvanisierter Stahl, pulverbeschichtet"] },
  "specs": {
    "design_linie": "Siebert",
    "namensschild": "Gravurleiste V4A, wechselbar",
    "namensschild_material": "Edelstahl V4A gebürstet",
    "einwurf": "Verdeckte Einwurfklappe",
    "einwurfmass_mm": [335, 35],
    "max_format": "DIN C4",
    "din_en_13724": true,
    "schloss": "Verdeckt, smart-fähig",
    "smart_optionen": ["Smart-Schloss", "Einwurfsensor"],
    "sichtfenster": 0,
    "zeitungsfach_abdeckbar": true,
    "aufstellung": ["Wand", "Stand", "Zaun", "Einbetonieren"],
    "ausstattungsoptionen": ["Soft-Close", "Entnahmesicherung", "Zeitungsfach-Abdeckung", "Keine-Werbung-Schild", "Deko", "Ständer"],
    "kombi_sets": ["Funkklingel", "VDM10-Set"],
    "beleuchtung": false,
    "abmessungen_cm": [37, 37, 10.5],
    "gewicht_kg": 3.4
  }
}
```

`soft`-Zeilen im Prototyp: `price`, `design_linie`, `namensschild`, `colors`. Mehrfachauswahl-Zeilen (Smart-Optionen, Aufstellung, Ausstattungsoptionen, Kombi-Sets) vergleichen als Mengen: der Vergleich zeigt je Spalte „zusätzlich: …" / „ohne: …" wie heute bei den Farben.

---

## 7 · Nächste Schritte

1. **Freigabe** der Merkmal-Namen und Werte (v. a. N2-Werte und die Linien-Liste N1).
2. **Datenblatt-Check** der „(?)"-Felder für die acht Leitmodelle; Gewicht Siebert/Ebenhard klären.
3. Danach: **Briefkästen-Linse in Version B** — Zeilenprofil nach Abschnitt 5, Seed-Werte aus Abschnitt 4, Demo-Paar Siebert vs. Ebenhard.

### Offene Punkte (nicht blockierend)
- Sollen Ständer/Standbriefkästen weiterhin eigene SKUs bleiben oder als Konfigurator-Option am Wandmodell geführt werden? (Für den Vergleich reicht die Linien-Kennzeichnung; für die PLP wäre eine Zusammenführung sauberer.)
- Ist bei Ebenhard das Smart-Schloss technisch **nicht möglich** oder nur nicht auf der PDP? Entscheidet, ob N5 dort „Keine" oder ein Pflegefehler ist.
- N4/N11: reicht das Format (C4/C5/Lang) als Filter, oder soll das Einwurfmaß ebenfalls filterbar sein? (Empfehlung: nur N4 als Filter.)
