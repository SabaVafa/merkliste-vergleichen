# 11 · Vergleich: Datenqualität und verlässliches Vergleichsmodell (Version B)

Stand: 02.11.2026 · Quelle: Shop-Export `Catalogue merkmale/vergleich-briefkasten-sprechanlagen-2026-11-02.json` (JTL, live, DE, Standard-Kundengruppe) · Umsetzung: `Deliverables/vergleichen-flow-B/`

---

## 1. Kurzfazit

- **Die bisherigen Vergleichswerte waren zu einem großen Teil nicht belegt.** Von 608 Wertzellen der 32 zugeordneten Sprechanlagen waren nur **47 % korrekt**, **9 % falsch**, **12 %** im Shop nicht gepflegt und **32 % ohne jede Datenbasis** (das Merkmal existiert im Export überhaupt nicht). Bei den Briefkästen (22 zugeordnet, 462 Zellen) waren nur **23 % korrekt**, **15 % falsch**, **6 %** fehlten trotz vorhandener Shopdaten, **3 %** sind im Shop nicht gepflegt und **52 % hatten keine Datenbasis**.
- **Die gröbsten Fehler:**
  - Sichtwinkel „146° / 82°“ für alle VDM10. Laut Shop sind es 146° / 80°. Bei XDM10 stand nur „Weitwinkel“, belegt sind 133°. Für SDM10 war „88° Dual-Lens“ angegeben, dafür gibt es keine Quelle.
  - Für alle VDM10 waren App, SIP/FRITZ!Box, PoE, 2 Türöffner-Relais und **IK09** angegeben. Nichts davon steht im Export.
  - SDM10X, SDM10H, SDM10S und Horizon standen mit Namensschild „Lasergravur“ im Vergleich. Laut Shop ist es „Digital“.
  - **28 von 32** Sprechanlagen und **18 von 22** Briefkästen zeigten falsche Farbsätze. Ein Beispiel: Kai war mit 3 Farben angegeben, angeboten werden 7.
  - Bei 14 Briefkästen stand „Wand · Stand“, laut Shop sind sie nur „Aufputz“. Quartett war mit 3 statt 4 Fächern und „Unterputz“ statt Aufputz angegeben.
  - 12 Briefkasten-Namen gibt es im Shop nicht, zum Beispiel Gienger, Castor, Trias, Vossberg und Flora. Trias und Quartett waren mit Klingel, Sprechanlage und Paketfach angegeben, die echten Anlagen haben nichts davon.
  - Der frühere Befund „Siebert 3,4 kg vs. Ebenhard 5 kg“ ist ein **Pflegefehler**: Für die Farbvarianten von Ebenhard sind 3,4 kg **und** 5 kg hinterlegt.
- **Neu:** Jeder Wert im Vergleich stammt jetzt aus dem Export. Grundlage ist eine generierte Datei, `vergleich-daten.js`, erzeugt von `tools/build_vergleich_daten.py`. Fehlende Werte erscheinen als „k. A.“, nicht zutreffende als „–“. Zeilen ohne einen einzigen Wert werden ausgeblendet. „Bestwert“ wird nur vergeben, wenn alle Modelle einen Wert haben. Unter dem Vergleich steht die Datenquelle mit Stand.
- **Größter Hebel für das Shop-Team:**
  1. Türöffner-Bedienung bei 50 Sprechanlagen pflegen.
  2. Kamera- und Schutzwerte als Wawi-Merkmale anlegen (heute nur im Beschreibungstext).
  3. Tiefe bei 40 Artikeln und Gewicht bei 28 Artikeln ergänzen.
  4. Material bei Briefkästen je Variante und mit einheitlichen Werten pflegen.

---

## 2. Datenquellen und Verlässlichkeit

| Quelle im Export | Inhalt | Verlässlichkeit | Verwendung im Vergleich |
|---|---|---|---|
| `merkmale` (Wawi-Merkmale) | Farbe, System, Klingeltaster, Namensschild, Türöffner-Bedienung, Fächer, Zeitungsfach, Montageart, Material, Briefkastentyp, Paketbox | **strukturiert, verlässlich**. Der Vaterartikel fasst die Werte aller Varianten zusammen. | 1:1, nur normalisiert |
| `dimensions` | Breite × Höhe × Tiefe in cm, null = nicht gepflegt | verlässlich, aber 2 Achsenfehler (§ 9) | 1:1, deutsches Zahlenformat |
| `weight.articleKg` | Artikelgewicht | verlässlich, aber bei 8 Hauptartikeln je Variante um mehr als 25 % abweichend | Spanne mit Zusatz „je nach Ausführung“ |
| `weight.shippingKg` | Versandgewicht | 10 unplausible Werte | **nicht** angezeigt (für die Kaufentscheidung irrelevant) |
| `specsFromDescription` | Kameraauflösung, Sichtwinkel, IP, IK, Nachtsicht | **nicht strukturiert**, automatisch aus dem Beschreibungstext gelesen | nur nach Plausibilitätsprüfung; Hinweis im (i); widersprüchliche Werte werden unterdrückt |
| Produktname, Unterkategorie | Design-Linie, Typ Audio/Video, Kombi | Shop-gepflegt, aber Freitext | nur für Identität (Design-Linie) und Typ |
| PLP-Kartendaten des Prototyps | Preis, UVP, Bild | Preis steht **nicht** im Export | Preis bleibt Prototyp-Wert; JTL liefert ihn live |

`specsFromDescription` steht nur am Vaterartikel. Varianten haben dort dieselben Felder wie der Vater, aber keine Beschreibungswerte.

---

## 3. Zuordnung Prototyp → Shop-Artikel

Sicherheit: **hoch** = Name und Merkmale eindeutig · **mittel** = gleiches Produkt, Prototyp-Name abweichend · **niedrig** = nächstliegender echter Artikel · **keine** = kein Pendant.

**Sprechanlagen (33):** 32 zugeordnet, alle mit Sicherheit **hoch**, 1 ohne Pendant.

| Prototyp-ID | Shop-Artikelnr. | Anmerkung |
|---|---|---|
| dominik1 | XDM10-MAXIOR-1T | Name identisch; die ID „dominik1“ ist irreführend (ADM10 Dominik ist `domaudio1`) |
| sdm10x · sdm10h · sdm10s | SDM10X · SDM10H · SDM10S-S250 | |
| horizon | VDM10-H | |
| colson1–7 | VDM10-COLSON-1T … 7T | |
| kian1–3 · niko1–3 · neo1–3 | VDM10-KIAN-1T…3T · VDM10-NIKO-1T…3T · VDM10-NEO-1T…3T | Neo = Einzelgerät, nicht das Komplettset |
| kai1–6 · domaudio1 | ADM10-KAI-1NT…6NT · ADM10-1T-1NT-AN | |
| maxior2 · maxior3 | XDM10-MAXIOR-2T · 3T | |
| vdm10-pb · vdm10-zf-bk | VDM10-PBOX · SK212-VDM-2x | |
| **vdm10-anlage-bk** | – | **keine**: „Modulare Standbriefkastenanlage mit VDM10“ fehlt im Export |

**Briefkästen (25):** 22 zugeordnet, 3 ohne Pendant. Wo der Prototyp-Name im Shop nicht existiert, ist der Kartenname jetzt der Shop-Name (`plp.js`, nur `name`). So zeigt der Vergleich keine Shopdaten unter einem fremden Namen.

| Prototyp-ID | Shop-Artikelnr. | Sicherheit | Alter Kartenname → neuer Name |
|---|---|---|---|
| siebert · ebenhard · hermann · moris · lepo · bk212 · cube · stencil2 · vdm10-zf · anton2 | Siebert · Ebenhard · Hermann · Modell01 (Moris) · lepo-2 · 2xBK212-RE-V · AN-CUBE-x2-AN-BS · STENCIL-2x-BS-VA · SK212-VDM-2x · Anton2-AN | hoch | unverändert |
| ebenhard-v2a | Variante ebenhard19-VA | mittel | „…gebürsteter V2A-Edelstahl-Front“ → „Briefkasten mit Edelstahlfront \| personalisiert mit Gravur \| Ebenhard“ („V2A“ ist nicht belegt) |
| gienger | Modell-G | mittel | „Gienger“ → „Briefkasten Design \| Modell-G“ |
| schneider | BK-Nora | mittel | „Schneider“ → „…Mauerdurchwurf \| personalisiert mit Gravur \| Nora“ |
| zaun | ZBK-Emma-1 | mittel | → „Briefkasten für Zaunmontage \| … \| Emma“ |
| flora | VA-Ebenhard-Frame-J | mittel | „Flora“ → „… \| Siebert Frame J“ |
| castor | UP-BK (Hugo) | mittel | „Castor“ (Edelstahl) → „Unterputz-Briefkasten aus hochwertigem Stahl \| Hugo“ (Kartenbild zeigt Hugo); Tagline „Edelstahl V2A“ entfernt |
| hoffmann-edelstahl | 2x-hoffmann24-BS | mittel | → „Standbriefkasten Mehrfamilienhaus \| austauschbares Namensschild \| Hoffmann“ |
| lessing | SK115-Alves | niedrig | „Lessing“ → „Standbriefkasten mit Zeitungsfach \| Alves“ |
| trias | 3xSBK212-1xBM | niedrig | „Trias“ → „Briefkastenanlage freistehend für 3 Parteien“ |
| quartett | 4xBK212- | niedrig | „Quartett“ → „Briefkastenanlage für 4 Parteien“ |
| duo | 2xBK212-RE-H | niedrig | „Duo“ → „Zweifach Briefkasten \| … \| BK212 horizontal“ |
| vossberg | BK212-VDM10 | niedrig | „Vossberg“ → „Briefkasten mit VDM10 2.0 Video-Türsprechanlage \| 1 Klingel \| BK212“ |
| **klar · nordkap · kompakt** | – | **keine** | bleiben; der Vergleich zeigt einen Hinweis und „k. A.“ |

Preise, Bilder und die PLP-Filterflags wurden **nicht** geändert (siehe Offene Fragen).

---

## 4. Zeilen-Audit: alter Prototyp-Wert gegen Shopdaten

Bewertung je Modell und Zeile:
- **korrekt**: stimmt mit dem Shop überein.
- **falsch**: der Shop sagt etwas anderes.
- **unvollst.**: der Prototyp zeigte „–“, obwohl der Shop einen Wert hat.
- **fehlt im Shop**: das Feld existiert im Export, ist bei diesem Artikel aber nicht gepflegt.
- **unbelegt**: das Feld gibt es im Export gar nicht.

Spalte „Neu“ zeigt, was jetzt passiert.

**Sprechanlagen (32 zugeordnete Modelle)**

| Zeile (alt) | korrekt | falsch | fehlt im Shop | unbelegt | Schlimmstes Beispiel | Neu |
|---|---:|---:|---:|---:|---|---|
| Design-Linie | 32 | 0 | 0 | 0 | – | bleibt (Name) |
| Namensschild | 28 | **4** | 0 | 0 | SDM10X/H/S, Horizon „Lasergravur“ → **Digital** | Merkmal |
| Typ · System · Klingeltaster | je 32 | 0 | 0 | 0 | – | Merkmal / Kategorie |
| Geeignet für | 0 | 0 | 0 | **32** | aus der Tasteranzahl abgeleitet | **entfernt** |
| Kameraauflösung | 31 | 0 | 1 | 0 | Horizon: kein Wert im Shop | Beschreibung, „2 MP (Full HD)“ |
| Sichtwinkel | 7 | **15** | 10 | 0 | VDM10 „146° / 82°“ → **146° / 80°**; XDM10 „Weitwinkel“ → **133°**; SDM10 „88° Dual-Lens“ ohne Quelle | Beschreibung, ohne Bestwert |
| Nachtsicht | 30 | 0 | 2 | 0 | VDM10-PBOX, Horizon: nicht erwähnt | Beschreibung |
| App-Steuerung · SIP/FRITZ!Box · Türöffner-Relais · Display · PoE | 0 | 0 | 0 | **je 32** | „2 Relais“, „PoE: nein“ (XDM10) frei gesetzt | **entfernt** |
| Zutritt | 6 | 1 | **25** | 0 | Horizon „RFID“ → **RFID · PIN-Code**; Colson/Kian/Neo „RFID“ ohne Beleg | Merkmal „Türöffner-Bedienung“ |
| Schutzart | 16 | **7** | 9 | 0 | Kai „IP-geschützt“ → **IP65**; XDM10 „witterungsbeständig“ ohne Beleg | Beschreibung |
| Schlagfestigkeit | 3 | 0 | **29** | 0 | VDM10 „IK09“ ohne Beleg | Beschreibung |
| Farben | 4 | **28** | 0 | 0 | Kai 3 statt 7 Farben; SDM10S ohne Grau/Weiß/Eisenglimmer; Standbriefkasten-Kombi 5 statt 1 | Merkmal (alle Varianten) |
| Mit Briefkasten/Paketbox | 32 | 0 | 0 | 0 | – | Merkmal / Kategorie |
| **Summe** | **285** | **55** | **76** | **192** | | |

**Briefkästen (22 zugeordnete Modelle)**

| Zeile (alt) | korrekt | falsch | unvollst. | fehlt im Shop | unbelegt | Schlimmstes Beispiel | Neu |
|---|---:|---:|---:|---:|---:|---|---|
| Design-Linie | 12 | **10** | 0 | 0 | 0 | erfundene Linien (Gienger, Trias …) | Name = Shop-Name |
| Namensschild | 14 | **5** | 0 | 3 | 0 | Lepo 2 „Ohne Namensschild“ → **Lasergraviert**; Duo „Gravurleiste“ → **Papiereinleger** | Merkmal |
| Farben | 4 | **18** | 0 | 0 | 0 | Hoffmann-Mehrfamilien 6 Farben → **nur Anthrazit** | Merkmal |
| Zeitungsfach | 17 | **5** | 0 | 0 | 0 | Modell-G „Ohne“ → **Integriert** | Merkmal |
| Fächer | 21 | 1 | 0 | 0 | 0 | Quartett 3 → **4** | Merkmal |
| Aufstellung | 8 | **14** | 0 | 0 | 0 | Siebert „Wand · Stand · Zaun · Einbetonieren“ → **Aufputz** | Merkmal „Montageart“ |
| Korpusmaterial | 7 | 5 | 0 | 10 | 0 | Lepo 2 „Stahl pulverbeschichtet“ → **V2A Edelstahl** | Merkmal „Material“ |
| Abmessungen | 6 | 5 | **11** | 0 | 0 | Moris „37 × 37 × 10,5“ → **33 × 38,5 × 9,5 cm** | Wawi-Maße |
| Gewicht | 2 | 1 | **17** | 2 | 0 | Ebenhard „5 kg“ → **3,4–5 kg je nach Ausführung** | Wawi-Gewicht |
| Kombi-Sets | 16 | 6 | 0 | 0 | 0 | Trias, Quartett, Moris „Paketfach enthalten“ → **nein** | Merkmal „Klingel / Sprechanlage“ |
| Namensschild-Material · Sichtfenster · Einwurf · Max. Briefformat · Einwurfmaß · DIN EN 13724 · ZF abdeckbar · Schloss · Smart-Optionen · Beleuchtung · Optionen | 0 | 0 | 0 | 0 | **je 22** | Siebert „Smart-Schloss, Einwurfsensor“, „DIN EN 13724: ja“ für alle | **entfernt** (Datenlücke, § 9) |
| **Summe** | **107** | **70** | **28** | **15** | **242** | | |

Lesart: „unbelegt“ heißt nicht „falsch“. Ein Kunde konnte diese Werte aber nicht prüfen. Und der Shop kann sie im JTL-Vergleich heute nicht liefern.

---

## 5. Abdeckung (nur Hauptartikel, ohne Zubehör und Ersatzteile)

Hauptartikel: **57 Sprechanlagen** (Video-, Audio-, Set- und Kombi-Kategorien; ohne Innenstationen, Zubehör, Ersatzschilder) und **123 Briefkästen** (Einfamilien, Stand, Mehrfamilien, Unterputz, ohne Gravur, mit Klingel; ohne Ständer, Schilder, Ersatzteile). Die Spalte „Prototyp“ zählt die 32 bzw. 22 Modelle, die im Vergleich vorkommen.

| Sprechanlagen | Hauptartikel | Prototyp | Bemerkung |
|---|---:|---:|---|
| Farbe · System · Anzahl Klingeltaster | 100 % | 32/32 | |
| Namensschild | 98 % | 32/32 | fehlt: VDM10-BK-SIEBERT-MONO |
| **Türöffner-Bedienung** | **12 %** | 7/32 | nur SDM10X/H/S, Horizon, Niko 1–3 |
| Montageart | 16 % | – | zu dünn für eine Zeile |
| Abmessungen vollständig | 47 % | 9/32 | Tiefe fehlt bei allen VDM10-Fronten und bei Kai |
| Artikelgewicht | 75 % | 26/32 | |
| Beschreibung: Kameraauflösung (nur Video, n = 50) | 80 % | 24/25 | |
| Beschreibung: Nachtsicht (nur Video) | 86 % | 23/25 | |
| Beschreibung: Sichtwinkel (nur Video) | 68 % | 15/25 | Colson 4–7 bewusst unterdrückt (§ 6) |
| Beschreibung: IP-Schutzart | 54 % | 23/32 | |
| Beschreibung: IK | 9 % | 3/32 | nur SDM10-Familie |

| Briefkästen | Hauptartikel | Prototyp | Bemerkung |
|---|---:|---:|---|
| Fächer · Farbe · Montageart · Zeitungsfach | 100 % | 22/22 | |
| Namensschild | 96 % | 19/22 | fehlt: Ebenhard, Hoffmann (Familie) |
| Material | 59 % | 12/22 | zusätzlich uneinheitlich (§ 9) |
| Abmessungen vollständig | 92 % | 19/22 | Tiefe fehlt bei Mehrfamilien-Standbriefkästen |
| Artikelgewicht | 89 % | 20/22 | |
| Anzahl Klingeltaster / System (Kombis) | 14 % / 6 % | – | nur bei Kombi-Artikeln sinnvoll |
| Beschreibung: Kamera / IP | ≤ 6 % | – | nur Kombis |

---

## 6. Stichprobe der Beschreibungswerte

| Wert | Befund | Entscheidung |
|---|---|---|
| Kameraauflösung „Full HD“ (17×) und „2 MP / Full HD“ (31×) | gleiche Bedeutung, nur anders formuliert | vereinheitlicht zu **„2 MP (Full HD)“** |
| Sichtwinkel „80° / 146°“ (18×) | plausibel für die VDM10-Außenstation; Achse nicht angegeben; die frühere PDP-Notiz nannte 82° | angezeigt als „146° / 80°“, **ohne Bestwert** |
| Sichtwinkel „80° / 180°“ bei **Colson 4–7 Taster** | widerspricht allen anderen VDM10-2.0-Modellen (146°) | **unterdrückt** → „k. A.“, zur Prüfung (§ 9) |
| Sichtwinkel „133°“ (XDM10, Zivo 2 BUS) | konsistent über alle BUS-Modelle | angezeigt |
| IP65 (31×) | konsistent für VDM10, ADM10 und Zivo/Bispo (IP) | angezeigt, Bestwert nur bei vollständigen Werten |
| IP67 bei **Bispo Funk** (Briefkasten-Kategorie) | vermutlich die Schutzart des Funktasters, nicht der Paketbox | nicht verwendet (kein Prototyp-Modell), prüfen |
| IK07 (SDM10X/H/S, SK212-SDM) | konsistent | angezeigt |
| Nachtsicht | nur „true“ oder nicht erwähnt, kein „false“ | „Ja“ oder „k. A.“, nie „Nein“, kein Bestwert |
| XDM10 PRO | Sichtwinkel und Nachtsicht vorhanden, Auflösung fehlt | Lücke |
| Horizon (VDM10-H) | **keinerlei** Beschreibungswerte | Lücke |

Abweichungen zwischen Varianten betreffen nur Wawi-Felder. Gewichte weichen je Farbe ab (bei 8 Hauptartikeln um mehr als 25 %), das Material ebenso (rund ein Dutzend Briefkästen). Die Maße weichen nur bei Siebert-Sets (L/R) und Bispo Funk ab.

---

## 7. Das Vergleichsmodell

### 7.1 Regeln

1. **Nur Exportdaten.** Werte kommen aus `vergleich-daten.js`. Profile je Produktfamilie und Ableitungen aus Kartenfeldern gibt es nicht mehr.
2. **„k. A.“ = im Shop nicht gepflegt** (nicht „nein“). **„–“ = trifft nicht zu**, zum Beispiel Kamera bei Audio. Beides ist im Screenreader ausgeschrieben („keine Angabe im Shop“ bzw. „trifft nicht zu“).
3. **Zeile ausblenden**, wenn kein verglichenes Modell einen echten Wert hat. Beispiel: Zwei Audio-Modelle zeigen keine Kamera-Zeilen.
4. **Unterschied oder Gemeinsamkeit wird nur behauptet, wenn er belegt ist.** Zeilen mit „k. A.“ erscheinen in der Tabelle und unter „Nur Unterschiede“, zählen aber weder zur Ähnlichkeit noch zu den Sprungmarken. Das Fazit nennt sie separat („1 weiteres Merkmal ist nicht für alle Modelle gepflegt“). „Technisch baugleich“ erscheint nur, wenn **keine** technische Zeile offen ist. Der Aufpreis-Text sagt in diesem Fall „kein technischer Mehrwert belegt (nicht gepflegt: …)“ statt „technisch identisch“.
5. **Bestwert** nur bei objektiv geordneten Werten (IP- und IK-Klasse) **und** nur, wenn alle Modelle einen Wert haben. Kein Bestwert bei Sichtwinkel (Achse unklar), Nachtsicht (kein „nein“ im Export), Maßen und Gewicht.
6. **„Auf einen Blick“** zeigt keine Alleinstellung gegenüber „k. A.“ und keine Abwesenheiten („Nein“). Maße und Gewicht gelten als Fakten, nicht als Vorteil.
7. **Varianten:** Farben = alle Farben aus Vaterartikel und Varianten. Gewicht oder Maße, die je Variante abweichen, erscheinen als Spanne mit „(je nach Ausführung)“. Das Material der Briefkästen ist am Vater zusammengefasst, das sagt das (i). Ein Prototyp-Artikel, der genau eine Variante zeigt (Ebenhard Edelstahlfront), nimmt nur deren Werte.
8. **Normalisierung:** deutsches Zahlenformat (13,3), Maße in „B × H × T cm“, kg mit Komma, „IP65“, „IK07“, „2 MP (Full HD)“, „146° / 80°“. „BUS-System“ wird zu „2-Draht-BUS“, „mit Papiereinleger“ zu „Austauschbar (Papiereinleger)“.
9. **Herkunft:** Das (i) der Kamera- und Schutzzeilen nennt „Angabe laut Produktbeschreibung (nicht als Merkmal gepflegt)“. Unter dem Vergleich steht eine Zeile: „Daten: Metzler Shop (JTL-Wawi), Stand 02.11.2026 · …“.
10. **Modelle ohne Shopdaten:** Hinweis im Fazit (und „Nicht im Shop-Export enthalten“ unter „Auf einen Blick“). Ihre Spalte zählt nicht in die Analyse. Sie erscheinen nicht als „Alternative“.

### 7.2 Zeilen Türsprechanlagen

Kernzeile = sichtbar ohne „Alle technischen Details“.

| Gruppe | Zeile | Kern | Quelle | Fehlwert | Bestwert |
|---|---|---|---|---|---|
| Grundlagen | Preis | ● | Prototyp (JTL live) | – | nein (Differenz neutral) |
| | Design-Linie | ● | Produktname | „–“ | nein |
| | Typ | ● | Unterkategorie Audio/Video | k. A. | nein |
| | System | ● | Merkmal System | k. A. | nein |
| | Anzahl Klingeltaster | ● | Merkmal | k. A. | nein |
| | Namensschild | ● | Merkmal | k. A. | nein |
| | Türöffner-Bedienung | ● | Merkmal | k. A. (≠ „keine“) | nein |
| | Mit Briefkasten/Paketbox | | Merkmale Paketbox/Briefkastentyp/Fächer + Kategorie | „Nein“ (Kategorie belegt) | nein |
| Kamera | Kameraauflösung | ● | Beschreibung | k. A. · Audio „–“ | nein |
| | Nachtsicht | ● | Beschreibung | k. A. · Audio „–“ | nein |
| | Sichtwinkel | | Beschreibung | k. A. · Audio „–“ | nein |
| Schutz & Bauform | Schutzart (IP) | | Beschreibung | k. A. | ja, nur bei vollständigen Werten |
| | Schlagfestigkeit (IK) | | Beschreibung | k. A. | ja, nur bei vollständigen Werten |
| | Abmessungen (B × H × T) | | Wawi | k. A. je Achse | nein |
| | Gewicht | | Wawi | k. A. | nein |
| | Farben | | Merkmal Farbe (alle Varianten) | k. A. | nur „+ n Farben“ in „Auf einen Blick“ |

### 7.3 Zeilen Briefkästen (Design zuerst)

| Gruppe | Zeile | Kern | Quelle | Fehlwert |
|---|---|---|---|---|
| Design & Namensschild | Preis · Design-Linie | ● | Prototyp / Produktname | – |
| | Namensschild | ● | Merkmal | k. A. |
| | Farben | ● | Merkmal Farbe | k. A. |
| Post & Fächer | Fächer / Parteien | ● | Merkmal | k. A. |
| | Zeitungsfach | ● | Merkmal | k. A. |
| | Klingel / Sprechanlage | ● | Merkmale System/Klingeltaster (+ „Funk“/„Video“ aus dem Namen) | „Nein“ |
| Montage & Bauform | Montageart | ● | Merkmal | k. A. |
| | Abmessungen (B × H × T) | ● | Wawi | k. A. |
| | Gewicht | | Wawi | k. A. |
| | Material | | Merkmal (am Vater zusammengefasst) | k. A. |

Hinweise zur Vergleichbarkeit:
- Gleiche Design-Linie: Der Hinweis nennt die belegten technischen Unterschiede.
- Set gegen Einzelmodell: Warnung, keine Preisdifferenz.
- Modell ohne Shopdaten: Hinweis.

---

## 8. Umsetzung (Version B)

| Datei | Änderung | Version |
|---|---|---|
| `vergleichen-flow-B/tools/build_vergleich_daten.py` | **neu**. Zuordnung, Normalisierung, Unterdrückungsliste, Bericht (`--report`); aufrufbar mit `python -I tools/build_vergleich_daten.py` | – |
| `vergleichen-flow-B/vergleich-daten.js` | **neu, generiert** (~31 KB), `window.MTZ_VGL_DATA` | `?v=1` |
| `vergleichen-flow-B/vergleichen.js` | `profile()`, `BK_SEED` und Kartenableitungen entfernt; `enrichSprech`/`enrichBK`, `ROWS_SPRECH`/`ROWS_BK` neu; k. A./–-Logik, Zeilenausblendung, belegte Unterschiede, Bestwert-Schutz, Hinweise, Herkunftszeile; Erkennung „anderer Bereich“ liest jetzt die Daten-IDs | `?v=26` (vorher 25) |
| `vergleichen-flow-B/vergleichen.css` | eine Regel `.vgl-src` (rem, DS-Tokens) | `?v=28` (vorher 27) |
| `vergleichen-flow-B/plp.js` | 12 Briefkasten-Namen = Shop-Namen; Tagline bei „Hugo“ entfernt | `?v=3` (vorher 2) |
| `index.html` · `briefkasten.html` | `vergleich-daten.js` vor `vergleichen.js` eingebunden, Versionen erhöht | – |

Unverändert: Overlay-Layout, Interaktion, Merkliste, PDP (lädt den Vergleich nicht), Version A und alle Quellprojekte.

**Neu erzeugen nach einem neuen Export:**
1. `python -I tools/build_vergleich_daten.py --src <export.json>` ausführen.
2. `?v=` von `vergleich-daten.js` erhöhen.

**Geprüft im Browser:**
- Sprechanlagen: XDM10 · SDM10X · Colson; Kai · Colson · Modell ohne Shopdaten; Kai 1 · Kai 2 (keine Kamera-Zeilen); Colson 1 · Colson 4; Niko · Kian; Colson · Kian („Technisch baugleich laut Shopdaten“); SDM10X · SDM10H · Horizon; Paketbox · Standbriefkasten-Kombi · XDM10.
- Briefkästen: Siebert · Ebenhard · Hermann; Ebenhard · Ebenhard Edelstahlfront; Siebert · BK212-VDM10 (Set-Warnung); Alves · Cube · Klar; BK212 vertikal · horizontal · 4 Parteien.
- Bereichswechsel-Hinweis, Konsole ohne Fehler, Syntaxprüfung aller JS-Dateien.

---

## 9. Datenlücken für das Shop-Team (priorisiert)

### P1: im Vergleich sofort sichtbar („k. A.“ bei Bestsellern)

| # | Lücke | Anzahl | Artikel |
|---|---|---:|---|
| 1 | **Türöffner-Bedienung** fehlt | **50 / 57** Sprechanlagen | alle Colson (VDM10-COLSON-1T…7T), Kian (1T–3T), Neo (1T–6T, NEO-1T/2T/3T-Set), ADM10 Kai (1NT–6NT) und Dominik (ADM10-1T-1NT-AN), XDM10 Maxior (1T–3T, 3 Sets), XDM10 PRO Maxior (1T–6T), alle Kombis (BK212-VDM10, VDM10-BK/BS-SIEBERT-SET, SK212-SDM/VDM-1x/2x, VDM10-PBOX, Bispo 2, Zivo 2 IP/BUS, VDM10-BK-SIEBERT-MONO). **Auch „keine“ pflegen**, wenn es keinen schlüssellosen Zugang gibt. Sonst bleibt „k. A.“. |
| 2 | **Kamera- und Schutzwerte als Merkmale anlegen**: Kameraauflösung, Sichtwinkel horizontal und vertikal, Nachtsicht, IP-Schutzart, IK-Klasse | alle 50 Video-Artikel | heute nur im Beschreibungstext. Ganz ohne Werte: **Horizon (VDM10-H)**. Ohne Auflösung: XDM10 PRO 1T–6T, XDM10-MAXIOR-1T/2T/3T-SET. Ohne Sichtwinkel: 16 (u. a. SDM10X/H/S, SK212-*, Siebert-Sets, VDM10-PBOX). Ohne IP: 26 (alle SDM10, alle XDM10, Kombis). IK nur bei 5. |
| 3 | **Tiefe fehlt** | 30 Sprechanlagen + 10 Briefkästen | alle VDM10-Fronten (Colson, Kian, Niko, Neo inkl. Sets), Kai 1–6, Horizon, Siebert-Mono; Mehrfamilien-Standbriefkästen 96 × 120 (STENCIL-2x-BS-VA/-AN-BS, HERMANN-x2-*, SIEBERT-2x-*, VA-CUBE-x2-AN-BS, AN-SVENA-x2-AN-BS, AN-CUBE-x2-AN-BS, 2x-hoffmann24-BS) |
| 4 | **Artikelgewicht fehlt** | 14 + 14 | Sprechanlagen: Kai 1–6, Horizon, SK212-SDM/VDM-1x/2x, Siebert-Sets, Siebert-Mono. Briefkästen: Hoffmann-OG, Hoffmann-RE, Neumann-OG, Modell-G-OG, UP-BK (Hugo), UP-BK-Hugo2, STENCIL-2x-BS-VA, 3xBK212-RE-V, SK212-* (4), Siebert-Sets |
| 5 | **Namensschild fehlt** | 5 Briefkästen + 1 | Ebenhard, hoffmann24, BS-Ebenhard19, hoffmann24-BS, 2x-hoffmann24-BS; VDM10-BK-SIEBERT-MONO. An Varianten zusätzlich: SDM10H, XDM10-MAXIOR-2T, XDM10-PRO-MAXIOR-1T |

### P2: falsche oder widersprüchliche Werte (verfälschen den Vergleich)

| # | Befund | Artikel |
|---|---|---|
| 6 | **Material** fehlt bei 51 von 123 Briefkästen. Wo gepflegt, ist es am Vater über alle Varianten zusammengefasst, mit uneinheitlichen Werten („Edelstahl“ / „V2A Edelstahl (1.4301)“ / „V4A Edelstahl“ / „Metall“). | Vorschlag: zwei Merkmale **Korpusmaterial** und **Frontmaterial**, je Variante, feste Werteliste |
| 7 | **Gewicht je Farbvariante widersprüchlich** | Ebenhard 3,4 / 5 kg · Horizon 2 / 5 · Hoffmann-OG 1 / 3 / 3,2 · Hoffmann-RE 1 / 3,24 · Lepo 3 / 5,9 · Modell02 3 / 6,5 · Enno 3 / 5 · Modell-G 3 / 4 · Lepo-1 insgesamt 1 kg |
| 8 | **Versandgewicht kleiner als Artikelgewicht** (meist 0,1 kg) | MA20-LAERCHE, HERMANN-x2-BS-VA, CUBE-BS, AN-CUBE-AN-BS, VA-CUBE-x2-AN-BS, STENCIL-2x-AN-BS, HERMANN-x2-AN-BS, SIEBERT-2x-AN-BS, AN-CUBE-x2-AN-BS, Anton |
| 9 | **Maßachsen vertauscht** (12 × 160 × 78 cm) | 3xSBK212-1xBM, 4xSBK212 |
| 10 | **Klingeltaster falsch** | VDM10-NEO-3T-Set: Merkmal „2 Taster“, Name „3 Klingeltaster“ |
| 11 | **Farbe an der Variante fehlt** | VDM10-NEO-1T-WE (Weiß fehlt deshalb im Vaterartikel); Colson 7T ohne Anthrazit: prüfen |
| 12 | **Siebert und Ebenhard vertauscht** | Siebert-Varianten heißen `VA-ebenhard…`; `ebenhard-BS` ist ein Siebert; die Ebenhard-Variante `ebenhard19-VA` ist eine Gravur-Ausführung mit anderem Namensschild als der Vaterartikel |
| 13 | **Sichtwinkel 180°** in der Beschreibung | VDM10-COLSON-4T…7T (übrige VDM10: 146°) |
| 14 | **IP67** bei Bispo Funk | PBOX-BISPO2-FU-1x/2x/3x: bezieht sich vermutlich auf den Funktaster |
| 15 | **System fehlt an Varianten** | XDM10-PRO-MAXIOR-1T…6T (nur am Vater gepflegt) |

### P3: neue Merkmale für einen vollständigen Vergleich

- **Briefkästen** (aus 01b, N1–N15): Einwurf (Klappe/Schlitz), max. Briefformat (C4), Sichtfenster, Schloss und Smart-Lock-Fähigkeit, DIN EN 13724, Zeitungsfach abdeckbar, Beleuchtung, Verknüpfung zu Set-Artikeln (Siebert ↔ Fu-Siebert ↔ VDM10-BK-SIEBERT-SET).
- **Sprechanlagen:** App-Steuerung, SIP/FRITZ!Box, PoE, Anzahl Türöffner-Relais, Display an der Außenstation. Diese Zeilen hatte der Prototyp ohne Datenbasis; sie sind entfernt, bis die Merkmale gepflegt sind.

Nach jeder Pflege `build_vergleich_daten.py` mit einem neuen Export ausführen. Die Zeilen füllen sich ohne Codeänderung, bei neuen Merkmalen genügt je eine Zeile in `ROWS_*`.

---

## 10. Offene Fragen

1. **Prototyp-Artikel ohne Shop-Pendant** (Klar, Nordkap, Kompakt, modulare Standbriefkastenanlage): durch echte Artikel ersetzen oder entfernen?
2. **PLP-Kartendaten:** Farb-Swatches, Taster- und Zutritt-Felder sowie Filterflags weichen bei vielen Karten vom Shop ab. Betroffen sind 28 von 32 bzw. 18 von 22 Farbsätzen und die Flags Klingel/Sprechanlage/Paketfach bei Trias, Quartett, Vossberg, Moris, Lessing. Quartett: 3 statt 4 Fächer, „unterputz“ statt Aufputz. Der Vergleich nutzt jetzt die Shopdaten, die Karten und Filter zeigen noch die alten Werte. Sollen die Karten ebenfalls angeglichen werden?
3. **Sichtwinkel:** Sind 146° / 80° horizontal / vertikal? Die frühere PDP-Notiz nannte 82°. Erst mit gepflegter Achse ist ein Bestwert vertretbar.
4. **Türöffner-Bedienung „nicht gepflegt“:** Bedeutet das „nur Klingel + App“? Welcher Wert soll im Shop für „keine“ stehen?
5. **Colson 4–7 mit 180°:** andere Kamera oder Textfehler?
6. **Ebenhard Edelstahlfront:** eigener Artikel oder Variante? Heute hängt eine Gravur-Ausführung unter dem Vaterartikel „austauschbares Namensschild“.
7. **Preis:** Der Export enthält keine Preise. Im Prototyp bleiben die Kartenpreise; in JTL kommt der Live-Preis. Soll der Export künftig Preise liefern, damit der Prototyp sie gegenprüfen kann?
