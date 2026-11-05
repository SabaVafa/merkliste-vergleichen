# 13 · PLP Live-Abgleich – Briefkästen & Türsprechanlagen (Version B)

**Quelle:** Live-Kategorien `https://edelstahl-tuerklingel.de/briefkasten` (Seiten `_s1`–`_s4`) und `https://edelstahl-tuerklingel.de/tuersprechanlagen` (Seiten `_s1`–`_s2`, Kategorie aus der Shop-Navigation „Sprechanlagen"), gelesen am **05.11.2026**, Sortierung „Standard". Merkmale aus dem JTL-Export `Catalogue merkmale/vergleich-briefkasten-sprechanlagen-2026-11-02.json`.
**Prototyp:** `Deliverables/vergleichen-flow-B/` – `briefkasten.html` + `plp.js`, `index.html` + `sprechanlage.js`.

## 1. Was gespiegelt wird

| | Briefkästen | Türsprechanlagen |
|---|---|---|
| Artikel live / Prototyp | **79 / 79** (vorher 25, davon 3 fiktiv) | **41 / 41** (vorher 33) |
| Seiten (24 je Seite wie live) | 4 / 4 | 2 / 2 |
| Ergebniszahl | „79 Artikel" | „41 Artikel" |

- **Produktkarten aus der Live-Liste:** Reihenfolge, Name (ohne „Metzler"), aktueller Preis, durchgestrichene UVP, Badge „−15 %", Sterne mit halben Sternen (z. B. 4,5/5), Bewertungsanzahl. „ab" steht nur dort, wo der Shop es zeigt. Die Farbpunkte sind die Farbvarianten der Live-Karte (erste 3 + „+N weitere"); fehlen sie im Shop, fehlen sie auch im Prototyp. Ohne Bewertung (SDM10S, Bispo 2, Zivo 2 LAN) gibt es keine Sterne. Preise mit Tausenderpunkt (1.490,00 €).
- **Türsprechanlagen-Pills wie live:** Auszeichnungen („Reddot Winner 2026", „German Design Award 2026" bei Maxior 1/2/3), System, Türöffner-Bedienung.
- **Echte Produktfotos:** Das Hauptbild jeder Karte ist das Shop-Bild (`/media/image/product/{id}/md/…webp`), direkt vom Shop geladen. Alle 120 URLs geprüft (laden). Offline greift ein lokales Kategoriefoto (`data-fallback`). Derselbe Bildpfad steht in `tools/shop-bilder.json` und wird im Vergleich verwendet.
- **Filter = Live-Filter:** Gruppen, Reihenfolge, Optionstexte und Zahlen 1:1.
  - Briefkästen: Anzahl der Briefkastenfächer · Anzahl der Klingeltaster (ohne Zahl, wie live) · Farbe · Montageart · Zeitungsfach · Namensschild · Marke („Metzler 64", ohne Klammer).
  - Türsprechanlagen: Fächer · Klingeltaster (ohne Zahl) · Farbe · Montageart · Türöffner Bedienung · Zeitungsfach · Namensschild · Paketbox · System · Briefkastentyp.
  - Gefiltert wird auf den Rohwerten der Shop-Merkmale (neu: `card.f` in `vergleich-daten.js`). Die Zählung aus den Daten ergibt genau die Live-Zahlen.
  - Ist ein Filter aktiv, werden die Zahlen neu berechnet. Stichproben stimmen mit dem Shop überein: Standmontage 29, Zeitungsfach „Ohne" 7, BUS-System 4, RFID 7, 2 Taster 10, jeweils mit gleichen Facettenzahlen.
  - Optionen ohne Treffer werden jetzt wirklich ausgeblendet. Vorher hob `.fopt { display:flex }` das `hidden` auf; behoben mit `.fopt[hidden]` in `plp.css`.
- **Unterkategorien-Leiste wie live:** Briefkästen 11 Kacheln, Türsprechanlagen 8 Kacheln, jeweils mit Namen, „N Modelle", Konfigurator-Kachel „Jetzt konfigurieren" und „Paketboxen" ohne Zahl. Das Bild ist die Shop-Kachel mit lokalem Fallback. Ein Klick öffnet die Live-Unterkategorie in einem neuen Tab.
- **Promo-Banner** wie live nach der ersten Reihe: Desktop nach 3 Karten, Mobil nach 4.

## 2. Artikelliste – Änderungen

**Unverändert (gleicher Shop-Artikel, ID bleibt):**
- **Briefkästen (15):** `siebert`, `ebenhard`, `hermann`, `lepo` (Lepo 2), `zaun` (Emma), `moris`, `schneider` (Nora), `gienger` (Modell-G), `flora` (Siebert Frame J), `anton2`, `lessing` (Alves), `castor` (Hugo), `stencil2` (Edelstahl-Standbriefkasten MFH Stencil), `cube` (Standbriefkasten MFH Cube), `hoffmann-edelstahl` (Standbriefkasten MFH Hoffmann).
- **Türsprechanlagen (31):** `dominik1` (Maxior 1), `sdm10x`, `sdm10h`, `sdm10s`, `horizon`, `colson1`–`colson7`, `kian1`–`3`, `niko1`–`3`, `neo1`–`3`, `kai1`–`6`, `maxior2`, `maxior3`, `domaudio1`, `vdm10-pb`.

**Entfernt (nicht in der Live-Liste):**
- **Briefkästen:**
  - fiktiv: `klar`, `nordkap`, `kompakt`
  - nur Variante eines gelisteten Artikels: `ebenhard-v2a`
  - nicht in /briefkasten gelistet: `trias`, `quartett`, `duo`, `bk212` (36617), `vossberg` (39718 steht in /tuersprechanlagen), `vdm10-zf` (42274)
- **Türsprechanlagen:** `vdm10-zf-bk` (42274 nicht gelistet), `vdm10-anlage-bk` (ohne Shop-Artikel).

**Neu (64 + 10, alle per Shop-ID zugeordnet, Sicherheit „hoch"):**
- **Briefkästen:**
  - Aufputz und Sonstige: `emma2` `stencil2-wand` `lepo1` `bk212-zf` `albrecht` `lepo3` `hermann-funk` `siebert-sf` `nora2` `alves3` `alves2` `siebert-stand` `hugo2` `siebert2` `anton` `hoffmann` `stelio` `enno` `zeppelin` `stencil` `lepo-stahl` `thobe` `gustav` `svena` `oltmann` `neumann` `hoffmann-sf` `cube-wand` `modell01` `hoffmann-ns` `anton-edelstahl` `anton-anthrazit` `masiva-eiche` `modell02` `masiva-anthrazit` `masiva-laerche` `bk212-ns`
  - Standbriefkästen: `thobe-stand` `modell-g-stand` `ebenhard-stand` `cube-stand` `enno-stand` `stencil-stand` `oltmann-stand` `hoffmann-stand-pe` `stand01` `neumann-stand` `gustav-stand` `hermann-stand` `hoffmann-stand` `cube-stand-sf`
  - Mehrfamilienhaus: `hermann-mfh-edelstahl` `siebert-mfh-edelstahl` `oltmann-mfh` `svena-mfh` `stencil-mfh` `hermann-mfh` `siebert-mfh`
  - Funkklingel: `funk02` `lepo2-funk` `siebert-funk` `stencil-funk` `funk01` `funk02-stand`
- **Türsprechanlagen:** `neo4` `neo5` `neo6` `vdm10-bk1` `bispo2-lan` `zivo2-bus` `zivo2-lan` `siebert-vdm10` `siebert-vdm10-stand` `vdm10-siebert-set`

**Vergleichsdaten:** `MAP` im Build-Skript folgt der Live-Reihenfolge. Nach dem Neuaufbau sind alle 46 bestehenden Einträge Feld für Feld unverändert; neu ist nur `card.f`. Das Build-Skript liefert bei erneutem Lauf eine identische Datei. Vergleich und Merkliste funktionieren damit für jeden Artikel der beiden Seiten. Tour-Trios (`siebert/ebenhard/hermann`, `kai1/colson1/sdm10x`) existieren weiter, `vergleichen.js` blieb unverändert.

## 3. Was der Prototyp bewusst nicht nachbildet

- Sortier-Auswahl „Standard / Bestseller": Der Prototyp hat keine Sortierung; gezeigt wird die Standard-Reihenfolge.
- Overlay „Gültig bis: 30.11.2026" auf jeder Live-Karte: weggelassen, wie schon bei den Türsprechanlagen.
- Live-Verhalten in einer aktiven Filtergruppe: Der Shop zeigt dort nur die gewählte Option, der Prototyp zeigt alle Optionen mit neuer Zahl (bisheriges Prototyp-Verhalten).
- Bei „Anzahl der Klingeltaster" zählt der Shop nicht; der Prototyp filtert trotzdem korrekt (live 2 Taster = 10 Artikel, Prototyp 10).
- Shop-Namen ohne „|" (z. B. „Briefkasten rostfrei und massiv, … Modell Siebert") erscheinen im Vergleichskopf in voller Länge. `vergleichen.js` wurde nicht angepasst (PO-abgenommen).
- Die H1 der Türsprechanlagen-Seite lautet live nur „Türsprechanlagen"; im Prototyp bleibt „Metzler Türsprechanlagen | Video & Audio für Ihr Zuhause".

## 4. Weitere Produktbilder und -daten auf beiden PLPs

- **Geändert:**
  - Red-Dot-Lockup auf dem Kartenbild entfernt. Es war auf ein Platzhalterfoto abgestimmt und hätte das echte Produktbild verdeckt; die Auszeichnungen stehen jetzt als Text-Pills wie live.
  - Platzhalterfotos `I82`–`I87` und die `M`-Bildzuordnung durch Shop-Bilder ersetzt.
  - Unterkategorie-Kacheln verwenden die Shop-Kachelbilder.
- **Unverändert gelassen** (keine Preise, keine Artikeldaten):
  - Mega-Menü im Header mit Kategoriebildern und Postern (Konfigurator, XDM10)
  - Briefkasten-Promobanner („Original Metzler Briefkästen", entspricht dem Live-Banner)
  - XDM10-Banner der Türsprechanlagen: anderer Text als der Live-Hero („Die passende Video-Türsprechanlage – egal ob Neubau oder Altbau"), aber eine zutreffende Aussage zur XDM10
  - SEO-Text, Produktberater-iframe

## 5. Prüfung (Browser, 127.0.0.1:8821, Desktop + Mobil 375 px)

- **Kartendaten:** Seite 1 sowie Stichproben der Seiten 2–4 (Briefkästen) und 2 (Türsprechanlagen) stimmen in Reihenfolge, Name, Preis und UVP mit dem Shop überein.
- **Bilder:** alle 120 Produktbilder und 19 Kachelbilder laden.
- **Filter und Zahlen:** wie oben; Kombinationen wie Standmontage + Schwarz (14) funktionieren.
- **Seiten und Ansicht:** Paginierung 1–4 bzw. 1–2; mobile Filter-Schublade funktioniert, kein horizontales Scrollen.
- **Merkliste:** Merken (z. B. `hermann-mfh` auf Seite 3) zeigt den Artikel mit echtem Foto und Preis in der Merkliste. Geteilte Merkliste-Links behalten das Shop-Foto: `merkliste.js` lässt jetzt genau `https://edelstahl-tuerklingel.de/media/image/product/…` als Bild zu.
- **Vergleich:**
  - `?vergleich=siebert,ebenhard` funktioniert wie zuvor.
  - Neue Artikel (`albrecht,cube-stand,masiva-eiche,funk02-stand` und `neo4,zivo2-bus,siebert-vdm10,vdm10-siebert-set`) öffnen den Vergleich mit Shop-Daten und echten Bildern.
  - Die Tour läuft auf beiden Seiten (6 Schritte).
- **Stabilität:** keine Konsolenfehler (PLPs, PDP); `localStorage` und `sessionStorage` nach dem Test geleert.

**Geänderte Dateien:**
- `vergleichen-flow-B/`: `plp.js`, `sprechanlage.js`, `briefkasten.html`, `index.html`, `plp.css`, `merkliste.js`, `pdp/index.html` (nur `?v=`)
- `vergleichen-flow-B/tools/`: `build_vergleich_daten.py`, `shop-bilder.json`
- generiert: `vergleich-daten.js`
- **Versionen:**
  - `plp.js` v6, `sprechanlage.js` v99, `vergleich-daten.js` v4, `plp.css` v262, `merkliste.js` v18
  - `vergleichen.js` und `vergleichen.css` unverändert

**Nachtrag 05.11.2026:** Titel und H1 der Türsprechanlagen-Seite wie live: `<title>Türsprechanlagen online kaufen | Metzler</title>`, H1 „Türsprechanlagen“ (vorher „Metzler Türsprechanlagen | Video & Audio für Ihr Zuhause“). Briefkästen-H1 entsprach bereits dem Live-Shop.
