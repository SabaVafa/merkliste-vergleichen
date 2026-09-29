# Phase 0 — Merkmal-Modell & Migrations-Leitfaden

**Pilotkategorie: Türsprechanlagen** · METZLER (edelstahl-tuerklingel.de, JTL-Shop / Snackys)
Deliverable 1 von 3 · Grundlage für die Vergleichen- und Merkliste-UI (Deliverable 2) und die JTL-Integration (Deliverable 3)

---

## 0 · Zweck dieses Dokuments

Damit **Vergleichen** (side-by-side) und der **Sprechanlagen-Finder** die Fragen beantworten, die Kundinnen und Kunden wirklich stellen (*HD-Kamera? Nachtsicht? App? wetterfest? zwei Türöffner?*), müssen die entscheidungsrelevanten Spezifikationen als **strukturierte Daten** vorliegen. Heute liegen sie überwiegend nur als **Fließtext** in der Artikelbeschreibung (`tartikel.cBeschreibung`) — der Vergleich und der Finder können darauf nicht zugreifen.

Dieses Dokument definiert:

1. **Bestandsaufnahme** — welche Vergleichs-Attribute heute bereits strukturiert sind (sofort nutzbar) und welche nur als Prosa existieren.
2. **Das Merkmal-Set** für Sprechanlagen — Namen, Datentyp, erlaubte Werte, Rolle (Filter / Vergleich / beides).
3. **Migrations-Leitfaden** Prosa → JTL-Merkmale (Wawi), inkl. Aufwand und Reihenfolge.
4. **Belegte Modell-Zuordnung** — reale Werte der Leitmodelle (ADM10, VDM10 2.0, SDM10X, XDM10) als Nachweis und Seed-Daten.
5. **Vergleichstabellen-Plan** — Zeilen, Reihenfolge, Gruppierung für die UI.
6. **Datenmodell (JSON)**, das der Prototyp in Deliverable 2 konsumiert.

> Alle kundenseitigen Labels sind in formellem Deutsch gehalten. Maßeinheiten in der UI folgen der Design-System-Regel (rem im Layout; physikalische Einheiten wie MP, °, IP, mm in den Fachwerten).

---

## 1 · Bestandsaufnahme — strukturiert vs. Prosa

Datenbasis: `Json Folder/tuersprechanlagen-finder.json` (65 Einträge, davon **61 echte Geräte** mit `System`-Merkmal; der Rest sind Innenstationen/Zubehör). Verteilung: **47 Video · 7 Audio**; **47 IP / 14 2-Draht-BUS**.

### 1a · Bereits strukturiert — sofort im Vergleich nutzbar

Diese Attribute liegen als `characteristics{}` / `finder_facets{}` vor und werden auf der PDP bereits im Block `ul.product-attributes` (JTL-Merkmale/Attribute) ausgegeben:

| Attribut | Rolle heute | Deckung (von 65) |
|---|---|---|
| **System** (IP-System / 2-Draht-BUS) | Finder + Merkmal | 61 |
| **Typ** (Audio / Video) | Finder-Facette | 65 |
| **Anzahl der Klingeltaster** (1–7, Flexibel 1–500) | Finder + Merkmal | 53 |
| **Farbe** (8 Werte + Wunschfarbe) | Variation + Merkmal | 61 |
| **Material** (Edelstahl / V2A / Galvanisierter Stahl) | Merkmal | 10 |
| **Türöffner-Bedienung / Zutritt** (RFID, Gesichtserkennung, PIN, QR, Fingerprint) | Finder + Merkmal | 7 |
| **Haushalte / Parteien** (Einfamilien / Mehrfamilien) | Finder-Facette | 53 |
| **mit Briefkasten / Paketbox** (ja/nein) | Finder-Facette | 65 |
| **Montageart** (Aufputz / Unterputz) | Merkmal | teilweise |
| **Namensschild** (austauschbar / Digital) | Variation | teilweise |
| **Abmessungen · Gewicht** | Merkmal (Prosa-nah) | teilweise |
| **Preis (brutto, von–bis)** | Systemdaten | 65 |

→ **Diese 12 reichen für eine erste, ehrliche Vergleichstabelle.** Sie sind der Sockel von Deliverable 2.

### 1b · Nur als Prosa vorhanden — Migrationskandidaten

Die kaufentscheidenden Video-/Sicherheits-Specs stehen ausschließlich im Beschreibungstext (auf der SDM10X-PDP z. B. **12.559 Zeichen** Fließtext). Sie fehlen als strukturierte Daten und sind damit heute weder filter- noch vergleichbar. Genau diese schließt Abschnitt 2b.

---

## 2 · Das Merkmal-Set für Sprechanlagen

Datentyp-Vokabular (JTL-Wawi):
**Auswahl** = Merkmal mit fester Werteliste (Einfachauswahl) · **Mehrfachauswahl** = mehrere Werte je Artikel · **Ja/Nein** = boolesches Merkmal (Auswahl mit zwei Werten) · **Zahl+Einheit** = numerischer Wert mit Einheit · **Freitext** = nicht-filterbarer Anzeigewert.

### 2a · Bestehende Merkmale (übernehmen, nicht neu anlegen)

| # | Merkmal | Typ | Werte | Filter | Vergleich |
|--:|---|---|---|:--:|:--:|
| 1 | System | Auswahl | IP-System · 2-Draht-BUS | ✅ | ✅ |
| 2 | Typ | Auswahl | Audio · Video | ✅ | ✅ |
| 3 | Anzahl der Klingeltaster | Auswahl | 1 · 2 · 3 · 4 · 5 · 6 · 7 · Flexibel (1–500) | ✅ | ✅ |
| 4 | Farbe | Mehrfachauswahl | Anthrazit · Schwarz · Edelstahl · Grau · Eisenglimmer · Weiß · Braun · Wunschfarbe | ✅ | ✅ |
| 5 | Material | Auswahl | Edelstahl · V2A Edelstahl (1.4301) · Galvanisierter Stahl | ✅ | ✅ |
| 6 | Zutritt / Türöffner-Bedienung | Mehrfachauswahl | Standard · RFID · Fingerprint · PIN-Code · QR-Code · Gesichtserkennung | ✅ | ✅ |
| 7 | Geeignet für | Auswahl | Einfamilienhaus · Mehrfamilienhaus | ✅ | ✅ |
| 8 | Mit Briefkasten/Paketbox | Ja/Nein | Ja · Nein | ✅ | ✅ |
| 9 | Montageart | Auswahl | Aufputz · Unterputz | ✅ | ✅ |

### 2b · NEUE Merkmale (Prosa → Merkmal) — der eigentliche Hebel

Priorisiert nach Kaufrelevanz; die **oberen sechs** haben den höchsten Selektionsimpact und saubere Ja/Nein- bzw. Kurzwerte — dort beginnen.

| # | Merkmal | Typ | Beispiel-/erlaubte Werte | Filter | Vergleich | Warum |
|--:|---|---|---|:--:|:--:|---|
| N1 | **Kameraauflösung** | Auswahl | 2 MP Full-HD · keine (Audio-Modell) | ✅ | ✅ | Videoqualität = Frage Nr. 1 |
| N2 | **Sichtwinkel** | Auswahl (Zahl+Einheit) | 146° / 82° (Ultraweitwinkel) · 88° (Dual-Lens) · ~80° (Standard) · – | ✅ | ✅ | METZLERs Kernargument: ganze Türsituation im Blick |
| N3 | **Nachtsicht** | Ja/Nein | Ja (IR-LED) · Nein | ✅ | ✅ | Sicherheit bei Nacht |
| N4 | **Schutzart** | Auswahl | IP65 · IP54 · IP44 · – | ✅ | ✅ | Wetterfest — häufiger Einwand |
| N5 | **App-Steuerung** | Ja/Nein | Ja (iOS & Android, ohne Abo) · Nein | ✅ | ✅ | Smart-Home; Tür von unterwegs öffnen |
| N6 | **Anzahl Türöffner-Relais** | Zahl | 1 · 2 | ✅ | ✅ | Tür + Tor öffnen; konkreter Bedarf |
| N7 | **Integriertes Display / Innenstation** | Auswahl | Integriertes Touch-Display · separate Innenstation nötig · – | – | ✅ | All-in-one vs. Zusatzgerät |
| N8 | **Schlagfestigkeit** | Auswahl | IK09 · IK07 · – | – | ✅ | Vandalismusschutz (ergänzt Schutzart) |
| N9 | **SIP / FRITZ!Box-Integration** | Ja/Nein | Ja · Nein | ✅ | ✅ | Anschluss an bestehende Telefonie |
| N10 | **PoE (Power over Ethernet)** | Ja/Nein | Ja · Nein | – | ✅ | Installationsaufwand (nur IP-Modelle) |

**Anzeige-Regeln (kategoriespezifisch):** Bei **Audio-Modellen** (ADM10) werden N1–N4, N7, N8 als *„–"* bzw. *„Nur Video"* geführt und im Vergleich als „nicht zutreffend" dargestellt — sie werden nicht als Nachteil ausgewiesen. **PoE** nur bei IP-Modellen anzeigen.

---

## 3 · Migrations-Leitfaden: Prosa → JTL-Merkmale (Wawi)

### 3.1 · Warum Merkmale (nicht Variationen)

Die neuen Specs (N1–N10) sind **artikelweit konstant** — eine VDM10 2.0 ist 2 MP, egal in welcher Farbe. Sie gehören daher als **Artikelmerkmale** an den Vaterartikel, **nicht** als Variationen/Eigenschaften:

- **Artikelmerkmal** → einmal je Artikel gepflegt, im Shop als **Filter** und in der **Vergleichsliste** nutzbar. ✅ richtig für N1–N10.
- **Variation/Eigenschaft** → definiert Varianten (Farbe, Namensschild) oder Freitext-Eingaben (Gravurtext). ❌ nicht für konstante Specs.

Das deckt sich mit dem Ist-Zustand: die bestehenden Facetten erscheinen auf der PDP im Merkmal-Block `ul.product-attributes`.

### 3.2 · Anlege-Reihenfolge in Wawi

1. **Merkmale anlegen** (Artikel → Eigene Übersichten → *Merkmale*): pro N1–N10 ein Merkmal mit dem Typ aus Abschnitt 2b. Für Auswahl-/Ja-Nein-Merkmale die **Werteliste** aus Spalte „erlaubte Werte" hinterlegen (feste Werte → konsistente Filter, keine Tippfehler-Duplikate).
2. **Werte den Artikeln zuweisen**: zunächst nur den **echten Geräten** (die 61 mit `System`), nicht dem Zubehör. Start mit den **Leitmodellen** aus Abschnitt 4 (Werte bereits recherchiert → copy-paste).
3. **Shop-Sichtbarkeit** je Merkmal setzen: „im Vergleich anzeigen" für alle; „als Filter anzeigen" für die mit ✅ in Spalte *Filter*.
4. **Abgleich (Wawi → Shop)** anstoßen; danach erscheinen die Merkmale in der nativen Vergleichsliste und (optional) als Finder-Facetten.

### 3.3 · Aufwand

- **Datentyp der Werte** ist bewusst knapp gehalten: 6 der 10 Merkmale sind **Ja/Nein oder Kurz-Auswahl** → Pflege in Sekunden je Artikel.
- **Pilotumfang:** die ~14 Leitmodell-Familien (nicht alle 61 Einzel-SKUs — Farbvarianten teilen dieselben Specs). Realistisch **ein halber Tag Datenpflege** für die gesamte Sprechanlagen-Pilotmenge.
- **Nebeneffekt:** der bereits existierende PDP-Reiter **„Technische Details"** kann anschließend aus denselben Merkmalen automatisch bestückt werden — eine Quelle, zwei Ausgaben (Vergleich + Datenblatt).

### 3.4 · Gravur / konfigurierte Builds (Hinweis für Phase 3)

Gravur bleibt eine **native JTL-Eigenschaft** (`eigenschaftwert[…]` „Gravurtext" + `item[…][]` „Kommentar zur Gravur"), **kein** Merkmal — sie ist pro Bestellung individuell. Für „konfigurierten/gravierten Build merken" (Phase 3) ist relevant: die native Wunschliste speichert nur eine Artikel-ID, nicht den Eigenschafts-/Konfigurationszustand. Daher braucht dieser Build-Speicher eine eigene Ablage (eigener Spike in Phase 3).

---

## 4 · Belegte Modell-Zuordnung (Seed-Daten, reale Werte)

Quelle: Live-PDPs (Beschreibung + Titel), erhoben am 2026-09-28. Diese Zeilen dienen zugleich als **Seed** für den Prototyp und als **Vorlage** für die Wawi-Pflege.

| Merkmal | **ADM10** (Audio) | **VDM10 2.0** (Video/IP) | **SDM10X** (Top/IP) | **XDM10** (Video/2-Draht) |
|---|---|---|---|---|
| System | IP-System | IP-System | IP-System | 2-Draht-BUS |
| Typ | Audio | Video | Video | Video |
| Kameraauflösung (N1) | – (Audio) | 2 MP Full-HD | 2 MP Full-HD | 2 MP Full-HD |
| Sichtwinkel (N2) | – | **146°/82°** Ultraweitwinkel | **88°** Dual-Lens | Weitwinkel |
| Nachtsicht (N3) | – | Ja (IR-LED) | Ja (IR-LED) | Ja |
| Schutzart (N4) | IP-geschützt | **IP65** | (Front) | witterungsbeständig |
| Schlagfestigkeit (N8) | – | **IK09** | **IK07** (Display) | – |
| App-Steuerung (N5) | Ja (ohne Abo) | Ja (ohne Abo) | Ja (ohne Abo) | Ja |
| SIP / FRITZ!Box (N9) | Ja | Ja | Ja | Ja |
| Türöffner-Relais (N6) | 1 | **2** (Tür + Tor) | **2** (Tür + Tor) | 1–2 |
| Display/Innenstation (N7) | separate Innenstation | separate Innenstation | **integriertes IPS-Touch-Display 1280×800** | separate Innenstation (7″) |
| Zutritt (6) | Standard | Standard | RFID · Gesichtserkennung · PIN · QR | Standard |
| Preis ab | 499 € | 649 € | 1.590 € | 899 € |

> Werte mit **–** = Merkmal für dieses Modell nicht zutreffend (im Vergleich neutral als „–" darstellen, nicht als Minus werten). Leere/`(Front)`-Felder = beim Wawi-Pflegen final aus dem Datenblatt bestätigen.

---

## 5 · Vergleichstabellen-Plan (Sprechanlagen)

Zeilenreihenfolge und Gruppierung für die Vergleichen-UI (Deliverable 2). Gruppen als `<tbody>` mit Zwischenüberschrift; **erste Spalte sticky** (Mobile).

**Gruppe A — Grundlagen**
`Preis` · `Typ` · `System` · `Geeignet für` · `Anzahl der Klingeltaster`

**Gruppe B — Kamera & Bild** *(nur Video-Modelle; bei Audio ausgegraut)*
`Kameraauflösung` · `Sichtwinkel` · `Nachtsicht`

**Gruppe C — Smart & Zutritt**
`App-Steuerung` · `SIP / FRITZ!Box` · `Zutritt` · `Anzahl Türöffner-Relais`

**Gruppe D — Bauform & Schutz**
`Schutzart` · `Schlagfestigkeit` · `Montageart` · `Integriertes Display / Innenstation` · `Material` · `Farbe` · `Mit Briefkasten/Paketbox`

**Aktionen je Spalte:** `Konfigurieren` (Modelle mit Konfigurator) bzw. `Zum Produkt` (Varianten-/Gravur-Modelle) · `Merken`. **Kein direkter „In den Warenkorb"** — alle Sprechanlagen sind individualisierbar (Farbe, Namensschild, Gravur, Klingeltaster) und werden erst auf der Produktseite bzw. im Konfigurator zusammengestellt und dort in den Warenkorb gelegt.
**Toggle „Nur Unterschiede anzeigen":** blendet Zeilen aus, in denen alle verglichenen Modelle denselben Wert haben.
**Zutreffend-Regel:** „–"-Werte zählen für den Unterschieds-Toggle als eigener Wert, werden aber visuell neutral (grau, kein rotes „nein") dargestellt.

---

## 6 · Datenmodell (JSON) für den Prototyp

Der Prototyp (Deliverable 2) liest die vorhandenen `*-finder.json` und ergänzt pro Gerät ein `specs`-Objekt mit den neuen Merkmalen. Vorschlag für die zusätzliche Struktur (rückwärtskompatibel — nur additiv):

```jsonc
{
  "id": 12345,
  "sku": "VDM10-COLSON-2T",
  "name": "Metzler VDM10 2.0 Mehrfamilien Video-Türsprechanlage | 2 Klingeltaster | Colson",
  "price_eur_gross": { "from": 759, "to": 899 },
  "characteristics": { "System": ["IP-System"], "Anzahl der Klingeltaster": ["2 Taster"], "...": [] },
  "specs": {
    "kameraaufloesung": "2 MP Full-HD",
    "sichtwinkel": "146°/82° (Ultraweitwinkel)",
    "nachtsicht": true,
    "schutzart": "IP65",
    "schlagfestigkeit": "IK09",
    "app_steuerung": true,
    "sip_fritzbox": true,
    "tueroeffner_relais": 2,
    "display": "separate Innenstation",
    "poe": true
  }
}
```

**Schlüssel = kebab/snake der Merkmalnamen** (stabile Feld-IDs, unabhängig vom deutschen Anzeigelabel). Anzeige-Labels + Einheiten kommen aus einer separaten `MERKMALE`-Definition (single source of truth für UI-Reihenfolge, Gruppe, Typ, Label). Boolean-Merkmale rendern als „Ja/Nein" mit Häkchen/Strich; `null`/fehlend rendert als „–".

---

## 7 · Was als Nächstes passiert

- **Freigabe dieses Modells** (Merkmal-Namen, Werte, Reihenfolge) durch METZLER.
- Danach **Deliverable 2:** Vergleichen- + Merkliste-UI-Prototyp im Metzler Design System, verdrahtet mit `tuersprechanlagen-finder.json` + den `specs`-Seeds aus Abschnitt 4. „Vergleichen"-Control auf PLP-Karten und PDP, persistentes „Vergleich (n)", Vergleichstabelle nach Abschnitt 5, „Nur Unterschiede anzeigen", Cap 4, Mobile-Muster (sticky erste Spalte).
- Anschließend **Deliverable 3:** JTL-Integrationsspezifikation (native Vergleichsliste aktivieren/stylen, Merkliste-Guest-Layer als Plugin, Template-Overrides, Datenmodell).

### Offene Punkte zur Bestätigung (nicht blockierend)
1. **Merkmal-Namen & Werte** wie oben ok? (v. a. deutsche Labels für N1–N10.)
2. **Schutzart/Schlagfestigkeit** je Leitmodell final aus dem internen Datenblatt bestätigen (einige Werte stehen nur teilweise in der Prosa).
3. Sollen die neuen Merkmale **auch als Finder-Facetten** erscheinen (Filter) oder zunächst **nur im Vergleich**? (Empfehlung: N1, N3, N5 sofort auch als Filter — höchster Kundennutzen, kleinste Werteliste.)
```
