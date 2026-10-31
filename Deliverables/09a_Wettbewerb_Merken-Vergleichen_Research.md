# 09a — Wettbewerbsanalyse „Merken" und „Vergleichen" (Interaktionsebene)

Stand: 31.10.2026 · Auftrag: Lead Competitive Research für METZLER (edelstahl-tuerklingel.de, JTL-Shop) · Empfänger: Lead Product Design
Baut auf: `04_Merkliste_Benchmark.md` (Feature-Ebene), `02_Vergleichen_Begruendung.md`, `05_Merkliste_Flow_und_Interface.md`, `06_Flow-Audit_Umsetzung.md`, `07a_PDP-Merkliste_Flow_UX.md`. Dieses Dokument wiederholt die Feature-Tabelle aus 04 nicht, sondern geht auf **Position, Zustand, Rückmeldung, Listen-/Tabellen-Anatomie, Mobile und Copy** ein.
Strukturierte Daten zum Filtern: `09a_research-data.json` · Bildbelege: `09_assets/` (24 PNG).

---

## 0 · Management-Zusammenfassung

1. **Gast-Merken ist Standard.** 7 von 9 live geprüften Shops mit Merkfunktion speichern ohne Konto (Galaxus, notebooksbilliger, Thomann, OTTO, IKEA, HORNBACH, Manufactum). Zalando und MediaMarkt leiten beim Herz-Klick vollständig auf die Anmeldung um.
2. **Der Konto-Hinweis wird sanft als Nutzen formuliert, nicht als Sperre.** Beispiele: OTTO nennt die Gast-Speicherdauer („länger als zwei Wochen speichern"), IKEA wirbt im Toast für IKEA Family, Galaxus und Thomann zeigen ein Banner auf der Liste.
3. **Listen werden zu Projektlisten.** Galaxus, Thomann, IKEA und HORNBACH bieten pro Eintrag eine Menge und eine Gesamtsumme bzw. „Alles in den Warenkorb". Dazu kommen je nach Shop Teilen, Drucken oder ein Code. Neue Listen werden automatisch benannt, z. B. „Neue Merkliste (31.10.2026)" oder „Meine Wunschliste vom 31.10.2026".
4. **Konfigurationen behält heute kaum ein Shop.**
   - IKEA speichert eine vorkonfigurierte PAX-Kombination als *einen* Eintrag mit „Enthaltene Teile anzeigen".
   - Manufactum speichert die Variante („Farbe: Weiß").
   - DoorBird verlangt fürs Speichern E-Mail und Telefon (Lead-Formular).
   - METZLERs „Konfiguration merken" liegt hier bereits vorn.
5. **Codes und IDs ersetzen das Konto beim Wiederaufrufen.** Beispiele sind HORNBACH „Merklisten-ID kopieren", DoorBird „Projekt laden" per Projekt-ID und Porsche Code (berichtet). Für Fachhandel und Installateur ist das der direkteste Übergabeweg.
6. **Beim Vergleichen ist die Checkbox auf der Karte immer sichtbar.**
   - Fünf Shops nutzen eine dauerhaft sichtbare Checkbox: MediaMarkt, Samsung, Bosch, notebooksbilliger, Miele.
   - Zwei weitere zeigen dauerhaft ein Icon (HORNBACH, Thomann Desktop); Galaxus zeigt es nur bei Hover.
   - **Kein Shop schaltet die Auswahl erst über einen Modus frei.** METZLER ist hier die Ausnahme.
7. **Die Obergrenze liegt bei 3 Modellen** (Apple, Samsung, Bosch, Miele). Galaxus hat kein Limit, gruppiert die Vergleichslisten aber automatisch nach Produkttyp.
8. **Die Vergleichstabelle ist meist eine eigene Seite mit teilbarer URL.** Galaxus, Bosch, Miele, notebooksbilliger und Apple codieren die Produkt-IDs in der URL. Thomann, HORNBACH und Samsung (Modal) bieten keinen teilbaren Stand.
9. **„Nur Unterschiede" gibt es fast überall, aber immer standardmäßig aus.**
   - Ausblenden statt nur Hervorheben: Galaxus, Bosch, Samsung, Miele.
   - Nur Hervorheben: notebooksbilliger.
   - METZLERs automatisches Einschalten ab 60 % Ähnlichkeit hat am Markt kein Gegenstück.
10. **Für METZLER zählen am meisten:**
    - eine teilbare Vergleichs-URL,
    - ein Merklisten-Code bzw. eine PDF für die Übergabe an den Fachhandel,
    - die Auswahl von Varianten in der Vergleichsspalte (Samsung),
    - das Hinzufügen per Artikelnummer (Bosch, Thomann),
    - ein A/B-Test der modusgebundenen Vergleichsauswahl.

---

## 1 · Methode

**Vorgehen.** Am 31.10.2026 wurden die Abläufe im integrierten Browser als Gast durchlaufen, in einem eigenen Tab und mit 1366 × 900 px (Desktop) bzw. 375 × 812 px (Mobile).

- **Cookies:** Nicht notwendige Cookies wurden jeweils abgelehnt („Nur das Nötigste", „Alle ablehnen", „Optionales ablehnen", „Verweigern").
- **Keine Konten, keine Formulare:** Es gab keine Anmeldung, keine Kontoerstellung, keine personenbezogenen Eingaben, kein Absenden von Formularen und keine Käufe.
- **Speicher-Einwilligung bei MediaMarkt:** Den Dialog zur Speicherung der Vergleichsdaten habe ich mit „Abbrechen" geschlossen, nicht mit „Zulassen".

**Evidenz.**
- **[B] beobachtet** heißt: selbst gesehen am 31.10.2026 unter der angegebenen URL. Labels wurden aus dem DOM (`aria-label`, Text) ausgelesen.
- **[R] berichtet** heißt: aus Hilfeseiten, Baymard, NN/g oder Fachartikeln, mit Quelle. Was in den Quellen nicht eindeutig belegt ist, ist als „unverifiziert" markiert.
- **UI-Texte** werden nur als kurze Label-Zitate (< 15 Wörter) wiedergegeben.

**Bewertung.** Je Shop vergebe ich 1–5 Punkte für Merken (M) und Vergleichen (V). Das Raster:
- 5 = Referenz;
- 4 = gut mit kleinen Lücken;
- 3 = solide, aber generisch;
- 2 = mit deutlichen Hürden;
- 1 = kaum nutzbar;
- „–" = Funktion nicht vorhanden.

**Grenzen.**
- **MediaMarkt:** Die Vergleichstabelle ohne Speicher-Einwilligung ist nur berichtet. Die Wunschliste liegt hinter dem Login.
- **Siedle und Gira:** Die Konfiguratoren waren als Gast nicht erreichbar (Siedle leitet auf „Preisbeispiele" um, die Gira-URL lieferte 404).
- **Nur berichtet:** Amazon, Apple „Saved Items" und Porsche Code.
- **Galaxus:** Die Hover-Zustände auf der Karte lassen sich per DOM nur indirekt prüfen.

**Shop-Auswahl (18 Profile: 14 Kernprofile + 4 Kurzprofile).**

| Segment | Shops | Evidenz |
|---|---|---|
| **Vergleichsführer** | Galaxus, MediaMarkt, Apple, Samsung, Bosch Hausgeräte, notebooksbilliger, Thomann | B (MediaMarkt B+R, Apple B+R) |
| **Merkführer** | OTTO, Zalando, IKEA, HORNBACH, Manufactum, Amazon | B (Amazon R) |
| **Premium, konfigurierbar, Gebäudetechnik** | Miele, DoorBird (Konfigurator), Siedle, Ring, Porsche (Konfigurator-Code) | B (Siedle B+R, Porsche R) |

---

## 2 · Shop-Profile

> Lesart: **Merken** → Einstieg · Zustand · Rückmeldung · Gast · Liste · Variante. **Vergleichen** → Einstieg · Limit · Tray · Tabelle · Mobile · Teilen. Belegbilder sind in Klammern angegeben (Nummer in `09_assets/`).

### 2.1 Galaxus (galaxus.de) · M 4 · V 5 · [B]
**Merken.**
- **Karte:** Drei Icon-Buttons unten rechts: „Vergleichsliste hinzufügen", „Merken" (Pin-Icon), „In den Warenkorb". Auf dem Desktop erscheinen sie erst bei Hover.
- **PDP** (`01`): Unter dem vollbreiten Primär-CTA „In den Warenkorb" stehen zwei gleich breite Sekundär-Buttons, **„Vergleichen | Merken"**.
- **Zustand nach dem Klick:** Das Label bleibt „Merken", `aria-pressed` fehlt.
- **Header:** Getrennte Icons für Vergleichslisten und Merklisten mit Punkt-Marker. Der Screenreader-Text lautet „1 Merkliste".
- **Gast:** Die Liste wird automatisch angelegt, als **„Neue Merkliste (31.10.2026)"**.
- **Fläche:** Flyout rechts am Header-Icon (`03`). Dazu kommt die Seite `/de/lists` mit den Tabs **„Merklisten | Vergleichslisten"**.
- **Eintrag:** Bild, Name, Variantenzeile, Mengen-Dropdown, Preis, „In den Warenkorb", Papierkorb.
- **Liste:** „Total", „Alles in den Warenkorb", Menü „Grösser anzeigen · Teilen · Umbenennen · Löschen", „+ Neue Merkliste erstellen".
- **Konto-Hinweis:** „Melde dich an, um deine Listen dauerhaft in deinem Kundenkonto zu speichern."
- **[R] Benachrichtigungen:** Preis- und Verfügbarkeits-Mails für Merkliste und Warenkorb gibt es nur mit Login.

**Vergleichen.**
- **Einstieg:** Karten-Icon (Hover) oder PDP-Button. Die Karte zeigt danach **keinen Ausgewählt-Zustand**.
- **Rückmeldung:** Flyout am Header-Icon (`02`) mit Produktname, „✓ Zur Vergleichsliste hinzugefügt" und dem Button **„Produkte vergleichen"**. Er ist bei einem Produkt deaktiviert und lautet bei drei Produkten „3 Produkte vergleichen". Einen Bodentray gibt es nicht.
- **Kategorie-übergreifend:** Galaxus legt die Vergleichslisten automatisch je Produkttyp an, etwa „Klingel + Türsprechanlage · 3".
- **Tabelle:** Eigene Seite `/de/comparison/<id>-<id>-<id>`, also teilbar. Der kompakte Kopf bleibt sticky.
  - Bedienelemente: Toggle **„Identische Eigenschaften verbergen"** (Standard aus), „Sortieren nach" (Manuell, Bestseller, Günstigste, Teuerste, Bewertung, Liefertermin, Neu auf Galaxus, Rabatt) und Drag-Griff „Ziehen zum Sortieren".
  - Inhalt: Erste Gruppe ist automatisch **„Die wichtigsten Unterschiede"**, danach folgen einklappbare Merkmalsgruppen mit (i)-Erklärungen je Wert. Eigene Datenzeilen sind Gewährleistungsfallquote, Rückgabequote und Verkaufsrang.
- **Limit:** keines ([R] bis 20 bzw. 29 Produkte berichtet).
- **Mobile** (`04`): Etwa 2,2 Spalten sichtbar, horizontales Wischen.
  - Die Merkmalsbezeichnung steht **in jeder Zelle**; eine sticky Label-Spalte gibt es nicht.
  - Jede Spalte hat Drag-Griff, Papierkorb, Merken-Pin und Warenkorb.

**Stärken.**
- Merkliste und Vergleich liegen in einem Listen-Hub.
- Eigene Daten machen den Vergleich beratend (Rückgabequote).
- Teilbare URL.
- Unterschiede werden zuerst gezeigt.
- Projektlisten mit Mengen.

**Schwächen.**
- Kein Ausgewählt- bzw. Gemerkt-Zustand an Karte und PDP-Button.
- Karten-Aktionen nur bei Hover.
- Kein Bodentray: Der Fortschritt ist nur am Header-Punkt sichtbar.

### 2.2 MediaMarkt (mediamarkt.de) · M 2 · V 3 · [B+R]
**Merken.**
- **Karte** (Listenlayout, `05`): Herz-Icon-Button direkt rechts neben „In den Warenkorb".
- **Gast:** Der Klick leitet vollständig um auf `/de/myaccount/auth/login?redirectURL=…addToWishlist=<id>`. Die Absicht bleibt also erhalten, aber der Login ist Pflicht.
- **[R]** „Meine Wunschliste" gibt es nur mit Onlinekonto; Preisalarm nur in der App.

**Vergleichen.**
- **Karte:** Checkbox **„Vergleichen"** unten links, immer sichtbar.
- **Einwilligung:** Bei abgelehnten Cookies öffnet der Klick ein Seitenpanel „Wir respektieren Ihre Privatsphäre" (`06`). Es fragt die Einwilligung zur lokalen Speicherung der Vergleichsdaten ab („Abbrechen / Zulassen").
- **[R]** Der Zustand lautet „Im Vergleich", die Bodenleiste „Jetzt vergleichen". Der Filter bietet alle Details, nur Unterschiede oder nur Gemeinsamkeiten (Saturn: „Zeige nur Unterschiede").

**Stärken.**
- Checkbox immer sichtbar.
- Die Merk-Absicht überlebt den Login (`addToWishlist`).

**Schwächen.**
- Login-Wand beim Merken.
- Vergleich hinter einem Einwilligungs-Dialog: funktionaler Speicher wird wie Marketing behandelt.

### 2.3 Apple (apple.com/de) · M 2 · V 4 · [B+R]
**Vergleichen.**
- **Seite:** Eigene Seite „Mac Modelle vergleichen" (`07`). **Drei vorbefüllte Dropdowns**, die als sticky Kopfzeile stehen bleiben; pro Spalte Farb-Swatches.
- **Werte:** Große typografische „Hero-Werte" mit Bildunterschrift statt Zeilenlabels. Bei konfigurierbaren Minima steht **„Ab"** davor („Ab 16 GB").
- **URL:** `?modelList=A,B,C`, Seitentitel „X vs Y vs Z". Pro Spalte „Kaufen".
- **Limit:** 3 auf dem Desktop, **2 auf Mobile** (beobachtet: zwei Dropdowns bei 375 px).
- **Kein** Toggle für „Nur Unterschiede".

**Merken [R].**
- „Saved Items" und gespeicherte Warenkörbe gibt es nur mit Apple Account.
- Konfigurierte Macs werden nur über den gespeicherten Warenkorb gehalten (unverifiziert für DE).

**Stärken.**
- Teilbare, SEO-fähige URL.
- „Ab"-Präfix für konfigurierbare Werte.
- Mobile ist auf 2 Spalten reduziert.

**Schwächen.**
- Keine Auswahl aus dem Katalog heraus.
- Kein Unterschieds-Filter.
- Merken nur mit Konto.

### 2.4 Samsung (samsung.com/de) · M – · V 4 · [B]
**Vergleichen.**
- **Karte:** Checkbox „Vergleichen" unter den CTAs „Kaufen" und „Mehr erfahren", immer sichtbar.
- **Leiste:** **Oben angedockt** unter der sticky Filterleiste (`08`). Drei Slots: Thumbnails mit ×, ein „+"-Platzhalter, CTA „Vergleichen" und Schließen-×.
- **Limit 3:** Beim vierten Klick erscheint ein **Modal** „Du hast 3 Produkte zum Vergleich ausgewählt."
- **Tabelle:** Modal-Layer **„Modelle vergleichen"** mit der Unterzeile „Vergleiche Funktionen, die für dich am wichtigsten sind."
  - **Jede Spalte hat Varianten-Selektoren** (Farbe, Speicher); der Preis passt sich an.
  - Pro Spalte „Kaufen" und „Mehr erfahren"; Toggle **„Nur die Unterschiede anzeigen"**.
  - Rund 60 Merkmale in einer ungruppierten Liste. Nicht zutreffende Werte erscheinen wörtlich als **„none"**.

**Merken:** Für Gäste im Katalog nicht vorhanden.

**Stärken.**
- Varianten lassen sich in der Vergleichsspalte wählen.
- Leere Slots zeigen die verbleibende Kapazität.

**Schwächen.**
- Cap-Hinweis als Modal.
- „none".
- Keine Gruppen.
- Modal ohne URL.

### 2.5 Bosch Hausgeräte (bosch-home.com/de) · M – · V 4 · [B]
**Vergleichen.**
- **Karte:** Checkbox **„Produktvergleich"** unten rechts, immer sichtbar. Screenreader-Text: „Produkt WGN256MR40 vergleichen".
- **Dock** (`09`): Eingeklappter Tab unten rechts, **„2 zu vergleichende Produkte ⌃"**. Aufgeklappt zeigt er Produkte mit Nummer, „Du hast 2 Produkte zum Vergleich ausgewählt.", „Zurücksetzen" und „Produktvergleich".
- **Seite** `/de/de/comparison?products=A,B` (`10`), teilbar.
  - Kopf und Werkzeuge: „Vergleiche deine Produkte" · „Deine Auswahl" · Toggle **„Nur Unterschiede anzeigen"** (aus) · × je Spalte.
  - Dritter Slot: **„Produkt über Produktliste hinzufügen — Oder über Produkt-Nr."** (Platzhalter „z.B. WGB2560X0").
  - Akkordeon-Gruppen: Allgemein, Programme, Zuschaltbare Optionen, Komfort, Sicherheit, Nachhaltigkeit und Energieeffizienz, Größe und Gewicht; dazu „Ähnliche Produkte".
  - Pro Spalte „Händler-Shop" und „In den Warenkorb".
- **Limit:** 3.

**Merken:** Keine Merkliste.

**Stärken.**
- Hinzufügen per Produktnummer: ideal für Fachpublikum.
- Teilbare URL.
- Unaufdringliches Dock.

**Schwächen.**
- Das Dock verdeckt ausgeklappt Karteninhalt.
- Keine Merkliste.

### 2.6 notebooksbilliger (notebooksbilliger.de) · M 4 · V 3 · [B]
**Merken.**
- **Karte:** Herz-Icon-Button rechts neben dem CTA „Zum Produkt".
- **Zustand:** Der Screenreader-Text wechselt von „Produkt merken" zu **„Von deinem Merkzettel entfernen"** (`aria-pressed="true"`), das Herz wird gefüllt.
- **Header:** Herz mit Zahl.
- **Gast:** funktioniert.

**Vergleichen.**
- **Karte:** Checkbox „Vergleichen" unter dem Bild, immer sichtbar.
- **Rückmeldung:** Toast oben „Produkt wurde zum Vergleich hinzugefügt." und ein **schwebender Button am rechten Rand** mit Zähler (Titel „2 Produkte vergleichen").
- **Seite** `/produkt+vergleich/show/<id>,<id>` (`15`), teilbar.
  - Werkzeuge: Toggle **„Unterschiede hervorheben"** (Hervorheben, nicht Ausblenden), „Alle entfernen", Druck-Icon, Pfeile zum Blättern zwischen Spalten.
  - Pro Spalte: Herz, ×, „Zum Produkt".

**Stärken.**
- Sauberer `aria-pressed`-Zustand.
- Merken direkt in der Vergleichsspalte.
- Teilbare URL.

**Schwächen.**
- Unterschiede werden nur hervorgehoben.
- Dichte, ungruppierte Tabelle.

### 2.7 Thomann (thomann.de) · M 5 · V 3 · [B]
**Merken.**
- **Listenzeile:** Drei Icon-Buttons unten rechts (Vergleich, Herz, Warenkorb).
- **Zustand:** Herz sofort lila gefüllt, Header-Herz mit Punkt, **kein Toast**.
- **Gast-Wunschliste** (`13`): automatisch benannt **„Meine Wunschliste vom 31.10.2026"**, „+ Neu" für mehrere Listen.
  - Sortierung: „Eigene Sortierung" mit Drag-Griffen, Beliebtheit, Preis.
  - Kopf-Icons: **„Alle vergleichen"**, „Teilen", „Bearbeiten".
  - Zeile: Papierkorb, Stift, Menge 1–10+, Warenkorb; darunter „Alle in den Warenkorb".
  - Banner: „Bitte anmelden, um Ihre Wunschlisten zu speichern – und von allen Geräten …"

**Vergleichen.**
- **Zustand:** Das Icon färbt sich lila.
- **Tray** (`11`): Unten mittig, etwa 440 px breit. Thumbnails mit Papierkorb, Pill **„Vergleichen"** mit Zähler-Badge (schraffiert deaktiviert bis 2), „Alle löschen", ×.
- **Persistenz:** **Der Tray bleibt über Seitenwechsel und Reload erhalten.**
- **Seite** `/de/compare.html` (`12`), ohne IDs, also nicht teilbar.
  - Gruppen „Allgemeine Infos" und „Features".
  - Spalten mit Warenkorb und Herz; der Merken-Zustand ist synchron.
  - Hinzufügen per **„Artikelnummer/n hinzufügen"**.
  - Kein Unterschieds-Toggle, kein sticky Kopf.
- **Mobile** (`14`): In der Liste sind Vergleich und Herz **ausgeblendet**. Der Tray wird zum Bottom-Sheet mit Griff und belegt etwa ein Drittel der Höhe.

**Stärken.**
- Vollständige Gast-Liste (mehrere Listen, Teilen, Sortieren, Menge).
- Vergleich direkt aus der Liste.
- Artikelnummer-Eingabe.

**Schwächen.**
- Vergleichsseite ohne URL-Zustand und ohne Unterschiede-Filter.
- Mobile Liste ohne Merken und Vergleichen.

### 2.8 OTTO (otto.de) · M 4 · V – · [B]
**Merken.**
- **Karte:** Herz oben rechts im Bild, immer sichtbar, wird rot gefüllt.
- **Header:** „Merkzettel" mit Zahl.
- **PDP:** Herz **oben rechts in der Bildergalerie**, nicht am CTA.
- **Gast-Liste** `/wishlist-view/` (`16`): „Mein Merkzettel (1)".
  - Hinweisbox: „Du möchtest deine gemerkten Artikel **länger als zwei Wochen** speichern …" mit „Jetzt anmelden". **Die Gast-Speicherdauer wird offen genannt.**
  - Zeile: Marke, Name, Bewertung, Datenblatt, Lieferzeit, Verkäufer, Preis mit UVP und Rabatt; „Entfernen", „In den Warenkorb".
- **Entfernen:** ohne sichtbares Rückgängig.
- **Leerzustand:** „Du hast noch keine Artikel auf dem Merkzettel." · „Lass dich inspirieren" · „Melde dich an, um bereits gemerkte Artikel zu sehen."
- **App-Werbung:** Ein Bottom-Sheet bewirbt Preisalarm und Wiederverfügbarkeit in der App.

**Vergleichen:** nicht vorhanden.

**Stärken.**
- Speicherdauer ist transparent.
- Leerzustand mit Brücke zu alten Listen.

**Schwächen.**
- Kein Undo.
- Benachrichtigungen nur per App.
- Merken auf der PDP fern vom CTA.

### 2.9 Zalando (zalando.de) · M 2 · V – · [B+R]
**Merken.**
- **Karte:** Herz oben rechts.
- **Gast:** Der Klick führt vollständig zu `accounts.zalando.com` „Einloggen oder registrieren" (`17`), ohne Vorschau der Liste.
- **Header:** „Wunschzettel".
- **[R]** Bei ausverkaufter Größe gibt es eine Glocke für die Verfügbarkeits-Mail, entfernt wird per ×.

**Schwächen:** Harte Login-Wand beim ersten Herz-Klick (Baymard-Antimuster).

### 2.10 IKEA (ikea.com/de) · M 5 · V – · [B]
**Merken.**
- **Karte:** Herz unter dem Bild rechts, neben dem runden Warenkorb-Button.
- **Zustand:** Der Screenreader-Text wechselt von „… zum Merkzettel hinzufügen" zu „… vom Merkzettel entfernen".
- **Toast oben rechts, dunkel** (`18`): „… wurde in Meine Liste gespeichert. Behalte deine Listen mit IKEA Family für deinen nächsten Besuch." Dazu der Link „Kostenlos Mitglied werden oder anmelden" und ×.
- **Gast-Liste** „Meine Liste" unter `/favourites/<uuid>/` (`19`).
  - Werkzeuge: Sortier-Chips (Kürzlich hinzugefügt, Name, Preis auf/ab), **Teilen**, **Einkaufsliste drucken**, Einstellungen, Listen- oder Rasteransicht, Toggle „Hol dich im Einrichtungshaus ab".
  - Summen: Family-Preis gegenüber regulärem Preis; „Alles zum Warenkorb hinzu".
  - Zeile: Checkbox „Wähle", Mengen-Stepper, Warenkorb, Papierkorb, „Überprüfe die Verfügbarkeit", **„Enthaltene Teile anzeigen"** (bei der PAX-Kombination), „Mehr Optionen".
- **Übersicht:** „Merkzettel erstellen".

**Stärken.**
- Eine Kombination wird als ein Eintrag mit Stückliste gespeichert, also das Modell für METZLER-Konfigurationen.
- Der Toast verknüpft den Konto-Nutzen mit dem Moment.
- Teilen und Drucken für Gäste.

**Schwächen.**
- Uneinheitliche Begriffe: Merkzettel, Meine Liste, Lieblingsprodukte (Seitentitel).

### 2.11 HORNBACH (hornbach.de) · M 4 · V 3 · [B]
**Merken.**
- **Karte:** Herz oben rechts im Bild, darunter das Vergleichs-Icon; beides immer sichtbar.
- **Gast-Merkliste** `/wishlist/`:
  - **„Merkliste ID: G7QGXH4JF3"** mit **„Merklisten-ID kopieren"**.
  - Werkzeuge: „Liste verwalten", „Liste drucken", „Liste leeren".
  - Summe: „1 Artikel · Gesamtsumme".
  - Zeile: Menge, „Online bestellen", Reservierungsstatus, **Vergleichs-Schalter**.
  - Konto-Hinweis: „Nutze die Vorteile eines Kundenkontos! Erstelle mehrere Merklisten, organisiere Projekte …"

**Vergleichen.**
- **Zustand:** Das Icon wird zum ✓.
- **Rückmeldung:** Grüne Snackbar unten, **„Erfolgreich hinzugefügt! ZUM ARTIKELVERGLEICH"** (`20`).
- **Header:** „Artikelvergleich 2".
- **Seite** `/comparison/`, nicht teilbar.
  - Werkzeuge: „Artikelvergleich (2)", „Drucken", „Leeren", × je Spalte.
  - Merkmale: flache Liste (Verfügbarkeit, Artikeltyp, Ausführung, Breite, Höhe, Tiefe, Material …) mit sticky Zeilenlabels.
  - Kein Unterschieds-Toggle.
- **Kategorie:** Briefkästen, also direkt vergleichbar mit METZLER.

**Stärken.**
- Merklisten-ID als kontofreier Übergabecode.
- Projekt-Denke.
- Snackbar mit Sprungziel.

**Schwächen.**
- Vergleich ohne Unterschiede-Filter und ohne Gruppen.
- Keine teilbare URL.

### 2.12 Manufactum (manufactum.de) · M 4 · V – · [B]
**Merken.**
- **PDP:** Varianten-Dropdown „Farbe", Menge, Preis. Ist der Artikel nicht lieferbar, steht **„♡ Merken" vollbreit im CTA-Slot**.
- **Rückmeldung:** **Grüne Inline-Bestätigung direkt unter dem Button**, „… wurde zur Merkliste hinzugefügt." mit „Zur Merkliste" (`21`). Das Header-Herz wird zur gefüllten Scheibe.
- **Zustand:** Das Button-Label bleibt „Merken".
- **Gast-Liste** `/merkliste`:
  - Hinweise: „Ihre Merkliste wird durch Anmeldung oder Registrierung dauerhaft gespeichert." · „Merkliste am Konto speichern" · **„Merkliste mit anderen teilen"** (auch für Gäste).
  - Zeile: Marke, Name, Einzelpreis, Art.-Nr., **„Farbe: Weiß"**, Lieferstatus, „Entfernen", „In den Warenkorb".

**Stärken.**
- Merken ersetzt den CTA, wenn Kauf nicht möglich ist.
- Bestätigung am Ort des Klicks.
- Variante und Artikelnummer stehen in der Liste.

**Schwächen.**
- Kein Gemerkt-Zustand am Button.

### 2.13 Miele (miele.de) · M – · V 4 · [B+R]
**Vergleichen.**
- **Kachel:** Checkbox „Vergleichen".
- **Tray** (`22`): Bodentray mit **„⌃ Vergleichen"** zum Einklappen, „Alles löschen" und dem orangen CTA „VERGLEICHEN". Drei Slots mit Bild, Modellcode und ×, leer als „Kein Gerät ausgewählt".
- **Seite** `/e/compare/<id>,<id>` (`23`), teilbar.
  - Kopf: „Modelle vergleichen — Sie können bis zu 3 Produkte vergleichen", × je Spalte, Slot „Neues Modell hinzufügen".
  - Toggle **„Nur Unterschiede anzeigen"** und Sprunglink „Unterschiede".
  - Akkordeon **„Schnellübersicht"** (Kategorie, Preis, Energieeffizienz, Datenblatt), danach „Alle Merkmale" in Gruppen bis „Design"; dazu „IN DEN WARENKORB" und „Zurück".
- **Störung:** Auf der Kategorie öffnet sich ungefragt der „KI-Shopping-Assistent" als Drawer.

**[R]** Miele Professional: „Merkzettel" mit Vergleich von bis zu 4 Produkten und Export als Broschüre.

**Stärken.**
- Klarer Tray mit Leer-Slots.
- Schnellübersicht vor dem Detail.
- Teilbare URL.

**Schwächen.**
- Kein Merken für Endkunden.
- Assistent überlagert den Kontext.

### 2.14 DoorBird Konfigurator (configurator.doorbird.com) · M 2 · V – · [B]
- **3D-Konfigurator für Türstationen und Briefkästen.**
  - Einstieg: „Projekt laden", „Vorlagen", „Neues Projekt" und ein Assistent mit „Überspringen".
  - Schritte: Maße, Material/Farbe, Module, Ruftasten/Namensschilder, Lichttaster, Gravuren.
  - Fuß: Live-Preis „Netto / UVP", „Speichern", „In den Warenkorb", „Augmented Reality".
- **Projekt-ID:** „Bitte geben Sie eine Ihnen bekannte Projekt-ID ein. Ihr aktuelles Projekt wird dabei überschrieben."
- **„Speichern":**
  - Bei unvollständigem Stand kommt die Meldung „Eine Konfiguration ohne elektronische Haupteinheit ist nicht möglich." (`24`).
  - Das zugehörige Speicherformular (im DOM gelesen) verlangt **E-Mail-Adresse\*, Wiederholung\*, Telefon\***. **Speichern ist hier Lead-Erfassung.**

**Stärken.**
- Projekt-ID zum Wiederaufrufen.
- Vorlagen.
- Live-Preis.

**Schwächen.**
- Speichern braucht Kontaktdaten.
- Ein unvollständiger Stand ist nicht speicherbar.

### 2.15 Siedle (siedle.de) · M – · V – · [B+R]
- **Weiterleitung:** `/konfigurator` führt auf „Preisbeispiele und Service".
- **Angebot dort:** Siedle IQ „Anlage planen" (IQ-Plattform, IQ Config), Anlagen- und Preisbeispiele zum Download, Anfragen an den Online-Service.
- **Kein** Shop-Merken oder -Vergleich.
- **[R]** Der alte Konfigurator wurde aus Sicherheits- und Usability-Gründen abgeschaltet; im Profimodus wurden Anlagen unter einer Konfigurationsnummer gespeichert.

**Lehre:** Bei Premium-Sprechanlagen wird die „gespeicherte Anlage" zur Anfrage bzw. zum Angebot. Diese Brücke fehlt im Shop-Kontext.

### 2.16 Ring (ring.com/de) · M – · V 1 · [B]
- **Kollektion:** Videotürklingeln sind **nach Stromversorgung gruppiert** (akkubetrieben, verdrahtet, PoE) und per Anker-Navigation erreichbar.
- **Kein** produktbezogenes Vergleichswerkzeug. Die Unterschiede stehen als Fließtext-FAQ („Was sind die Unterschiede zwischen …").
- „Abonnements vergleichen" gibt es nur für Tarife.

**Lehre:** Eine kuratierte Segmentierung ersetzt das Werkzeug. Das genügt bei 6–8 Modellen, die sich klar unterscheiden, nicht aber bei Fast-Zwillingen wie METZLERs.

### 2.17 Amazon (amazon.de) · M 3 · V 2 · [R]
- **Merken mit Konto:** Dropdown „Auf den Wunschzettel" unter „In den Einkaufswagen".
- **Merken im Warenkorb:** „Auf die Merkliste" bzw. „Für später speichern".
- **Listen:** beliebig viele, teilbar per Link oder Einladung.
- **Vergleich:** „Mit ähnlichen Artikeln vergleichen" (unverifiziert).

### 2.18 Porsche Car Configurator · M 4 (Konfiguration) · V – · [R]
- **Porsche Code:** **8-stellig, alphanumerisch**, mit Link. Damit lässt sich eine Konfiguration **ohne Konto** laden und teilen.
- **Konto:** „In meinem Profil speichern" mit Porsche ID.
- **Vergleichbar:** VW-Code, maximal 3 Monate gültig.

**Lehre:** Code und Konto sind zwei Ebenen, und der Code kommt zuerst.

---

## 3 · Pattern-Bibliothek

Verbreitung bezieht sich auf die live beobachteten Shops mit der jeweiligen Funktion (n in Klammern). „BP" steht für die evidenzbasierte Best Practice.

### 3.1 Merken

| # | Entscheidung | Beobachtete Varianten (Shops) | Verbreitung | BP / Evidenz |
|---|---|---|---|---|
| M1 | **Merken auf der Karte – Position** | (a) Icon oben rechts im Bild: OTTO, Zalando, HORNBACH · (b) Icon rechts neben dem Karten-CTA: MediaMarkt, notebooksbilliger, IKEA, Thomann · (c) nur bei Hover: Galaxus · (d) mobil ausgeblendet: Thomann | a 3 · b 4 · c 1 (n = 8) | Immer sichtbar, ohne Hover; NN/g zitiert Swipe- und Dropdown-Lösungen als Fehler. Ohne Karten-CTA (METZLER) ist (a) Standard. |
| M2 | **Merken auf der PDP** | (a) Sekundär-Button direkt unter bzw. neben dem Primär-CTA: Galaxus (50/50 mit „Vergleichen"), MediaMarkt [R] (Herz neben dem Warenkorb) · (b) im CTA-Slot, wenn nicht kaufbar: Manufactum · (c) Herz oben rechts in der Galerie: OTTO | a 2 · b 1 · c 1 | Nah am Primär-CTA und über der Falz (NN/g). (b) ist eine gute Ergänzung für „nicht lieferbar" bzw. Konfiguration offen. |
| M3 | **Icon und Wort** | Herz: OTTO, Zalando, MediaMarkt, notebooksbilliger, Thomann, IKEA, HORNBACH, Manufactum · Pin: Galaxus · Wort: Merkliste (Galaxus, HORNBACH, Manufactum), Merkzettel (OTTO, IKEA, notebooksbilliger), Wunschliste/-zettel (Thomann, MediaMarkt, Zalando) | Herz 8/9 | „Wishlist" bzw. „Wunsch-" klingt nach Geschenkliste (NN/g). „Merkliste" mit sichtbarem Label „Merken" auf der PDP ist präzise; das Lesezeichen ist für METZLER vertretbar, wenn PDP und Header ein Label tragen. |
| M4 | **Zustand nach dem Merken** | (a) gefülltes Icon und Wechsel des Screenreader-Texts: notebooksbilliger (`aria-pressed`), IKEA, Thomann, OTTO, HORNBACH · (b) Label bleibt „Merken": Galaxus, Manufactum | a 5 · b 2 | Sichtbarer und programmatischer Toggle-Zustand (`aria-pressed`); das Label wechselt zu „Gemerkt". |
| M5 | **Rückmeldung** | (a) nur Zustandswechsel und Header-Marker: Thomann, OTTO, notebooksbilliger · (b) Toast mit Link und Konto-Nutzen: IKEA · (c) Flyout am Header-Icon: Galaxus (Vergleich) · (d) Inline-Bestätigung unter dem Button: Manufactum · (e) Snackbar mit Sprungziel: HORNBACH (Vergleich), notebooksbilliger (Vergleich) | gemischt | Ein Zustandswechsel genügt auf der Karte. Beim ersten Merken bzw. auf der PDP eine Bestätigung **nahe am Auslöser oder Ziel**, mit genau einer Aktion („Zur Merkliste"). Kein Modal. |
| M6 | **Gast oder Login** | (a) Gast-Liste: Galaxus, notebooksbilliger, Thomann, OTTO, IKEA, HORNBACH, Manufactum · (b) Login-Wand: Zalando, MediaMarkt, [R] Apple | a 7 · b 2 (+1 R) | Baymard: 75 % der Shops setzen ein Konto voraus, das führt zu rund 30 % Abbruch. Gast plus sanfter Konto-Nutzen ist Best Practice. |
| M7 | **Transparenz zur Speicherung** | Speicherdauer genannt: OTTO („zwei Wochen") · Nutzen-Banner: Galaxus, Thomann, Manufactum, HORNBACH · Toast: IKEA | 6/7 Gast-Shops | Ort bzw. Dauer klar nennen und den Konto-Nutzen konkret machen („auf allen Geräten", „Projekte"). |
| M8 | **Listenfläche** | (a) Seite: alle · (b) zusätzlich Header-Flyout: Galaxus · (c) Hub mit Tabs „Merklisten / Vergleichslisten": Galaxus | Seite 7/7 | Eine Seite mit eigener URL ist Pflicht; Flyout bzw. Drawer dient als Schnellzugriff. |
| M9 | **Benennung und mehrere Listen** | Automatisch benannt: Galaxus („Neue Merkliste (Datum)"), Thomann („Meine Wunschliste vom Datum"), IKEA („Meine Liste") · mehrere Listen als Gast: Galaxus, Thomann · nur mit Konto: HORNBACH | 4 | Nie einen Namen erzwingen (NN/g); automatisch benennen, Umbenennen anbieten. Mehrere Listen sind ein Projekt-Feature. |
| M10 | **Listen-Aktionen** | Menge pro Eintrag: Galaxus, Thomann, IKEA, HORNBACH · Gesamtsumme: Galaxus, IKEA, HORNBACH · alles in den Warenkorb: Galaxus, Thomann, IKEA · Teilen: Galaxus, Thomann, IKEA, Manufactum · Drucken: IKEA, HORNBACH · ID bzw. Code: HORNBACH · Sortieren: Thomann, IKEA · Vergleichen aus der Liste: Thomann, HORNBACH, Galaxus (Hub) | – | Teilen und Drucken für Gäste ist bei IKEA, HORNBACH und Manufactum Standard. Projektlisten (Menge, Summe) dort, wo der Kauf ein Vorhaben ist. |
| M11 | **Variante bzw. Konfiguration** | Variante als Zeile: Manufactum („Farbe: Weiß"), Galaxus (Variantenzeile) · Kombination als ein Eintrag mit Stückliste: IKEA („Enthaltene Teile anzeigen") · Konfigurator-Code: DoorBird (Projekt-ID), [R] Porsche Code · Konfiguration gegen Kontaktdaten: DoorBird | selten | Den Snapshot (Zusammenfassung, Preis, Variante) **im Eintrag** speichern, dazu einen Code bzw. Link zum Wiederherstellen. |
| M12 | **Preis- und Verfügbarkeitsänderung** | Live-Preis mit UVP bzw. Rabatt: OTTO · Lieferstatus: Manufactum, HORNBACH, IKEA · Alarme nur per Login oder App: Galaxus [R], OTTO (App), MediaMarkt [R] | – | Im Eintrag den Live-Preis zeigen und eine Änderung seit dem Merken benennen; Alarme erst mit E-Mail bzw. Konto. |
| M13 | **Leerzustand** | OTTO: „Du hast noch keine Artikel auf dem Merkzettel." und „Lass dich inspirieren" sowie „Melde dich an, um bereits gemerkte Artikel zu sehen." · IKEA: Erklärung und „Merkzettel erstellen" | – | Erklären, Weg zurück anbieten, auf eventuell vorhandene Listen im Konto hinweisen. |
| M14 | **Entfernen und Rückgängig** | Papierkorb bzw. „Entfernen" überall; Undo nicht beobachtet (OTTO, Galaxus, IKEA) | 0 Undo | Undo per Toast (5 s) ist ein klarer Vorsprung (METZLER hat ihn). |
| M15 | **Mobile** | Thomann: Merken und Vergleichen nur auf der PDP · Galaxus: Pin und Warenkorb in der Vergleichsspalte | – | Die Merk-Kontrolle bleibt auch mobil auf der Karte; Trefferfläche mindestens 44 px. |

### 3.2 Vergleichen

| # | Entscheidung | Beobachtete Varianten (Shops) | Verbreitung | BP / Evidenz |
|---|---|---|---|---|
| V1 | **Einstieg auf der Karte** | (a) Checkbox mit Label „Vergleichen" bzw. „Produktvergleich", immer sichtbar: MediaMarkt, Samsung, Bosch, notebooksbilliger, Miele · (b) Icon immer sichtbar: HORNBACH, Thomann (Desktop) · (c) Icon nur bei Hover: Galaxus · (d) eigene Seite mit Selektoren: Apple · (e) **erst nach Moduswechsel sichtbar: keiner** | a 5 · b 2 · c 1 · d 1 | Baymard 2022: Checkboxen „visible by default" (frühere Hover-Empfehlung revidiert); 67 % der Testpersonen nutzten den Vergleich. |
| V2 | **Limit** | 3: Apple, Samsung, Bosch, Miele · keins: Galaxus · 4: METZLER · Hinweis bei Überschreitung als Modal: Samsung | 3 dominiert | NN/g: 3–4 dynamisch, maximal 5; mobil 2. Limit sichtbar über Leer-Slots („Kein Gerät ausgewählt"). |
| V3 | **Tray bzw. Dock** | Unten vollbreit: Miele · unten mittig kompakt: Thomann · unten rechts eingeklappter Tab: Bosch · Button am rechten Rand mit Zähler: notebooksbilliger · oben unter der Filterleiste: Samsung · Header-Flyout: Galaxus · Header-Link mit Zähler: HORNBACH | unten 3 | Baymard: persistentes Overlay am unteren Rand mit Auswahl und Restkapazität. Leer-Slots, Zähler, „Alle löschen", CTA ab 2. |
| V4 | **Zustand auf der Karte** | Checkbox angehakt bzw. Icon zu ✓ oder Farbwechsel: alle außer Galaxus | 8/9 | Immer ein Ausgewählt-Zustand. |
| V5 | **Rückmeldung beim Hinzufügen** | Toast oben: notebooksbilliger · Snackbar mit Sprungziel: HORNBACH · Flyout mit CTA: Galaxus · nur Tray: Thomann, Miele, Samsung, Bosch | – | Der Tray selbst ist die Rückmeldung; ein Toast ist nur ohne Tray nötig. |
| V6 | **Weg zur Tabelle** | Eigene Seite: Galaxus, Bosch, notebooksbilliger, Thomann, HORNBACH, Miele, Apple · Modal-Overlay: Samsung (METZLER) | Seite 7/8 | Eine Seite mit URL erlaubt Teilen, Zurück-Navigation und SEO. |
| V7 | **Teilbare URL** | IDs in der URL: Galaxus, Bosch, Miele, notebooksbilliger, Apple · ohne: Thomann, HORNBACH, Samsung | 5/8 | Teilbar und reload-fest. |
| V8 | **Tabellen-Layout** | Sticky Produktkopf: Galaxus, Apple (Selektoren) · sticky Zeilenlabels: HORNBACH · Akkordeon-Gruppen: Galaxus, Bosch, Miele · flache Liste: Samsung, Thomann, HORNBACH · „Schnellübersicht" zuerst: Miele · „Die wichtigsten Unterschiede" zuerst: Galaxus | – | Baymard: Unterschiede zuerst, gruppieren, sticky Kopf, Zeilen-Zebra. NN/g: sticky Kopf. |
| V9 | **Nur Unterschiede** | Ausblenden: Galaxus („Identische Eigenschaften verbergen"), Bosch, Samsung, Miele („Nur Unterschiede anzeigen"), [R] MediaMarkt · Hervorheben: notebooksbilliger („Unterschiede hervorheben") · fehlt: Thomann, HORNBACH, Apple · **Standard überall aus** | Ausblenden 4–5 | Baymard: Ausblenden schlägt Hervorheben. Kontextabhängiges Einschalten ist nirgends beobachtet. |
| V10 | **Erklärungen und Bestwert** | (i) je Wert: Galaxus · „Ab"-Präfix: Apple · Bestwert-Markierung: nicht beobachtet | selten | Fachbegriffe erklären (Baymard-Pitfall); Bestwert sparsam, nie nur über Farbe. |
| V11 | **Spalten verwalten** | × je Spalte: alle · Slot „Neues Modell hinzufügen": Miele, Bosch, Samsung („+") · **per Artikelnummer**: Bosch („Oder über Produkt-Nr."), Thomann („Artikelnummer/n hinzufügen") · Umsortieren per Drag bzw. Sortierung: Galaxus · Dropdown je Slot: Apple | – | Hinzufügen ohne Zurück zur Liste (Smashing). Die Artikelnummer ist ein Fachpublikums-Feature. |
| V12 | **Variante in der Spalte** | Farbe und Speicher als Selektor in der Spalte, Preis passt sich an: Samsung · Swatches: Apple | 2 | Bei konfigurierbaren Produkten die Variante in der Spalte wählbar machen. |
| V13 | **Kaufpfad aus der Spalte** | „In den Warenkorb", „Kaufen" bzw. „Zum Produkt": alle | – | METZLER: „Konfigurieren" bzw. „Zum Produkt" (kein Direktkauf). |
| V14 | **Merken in der Spalte** | Herz bzw. Pin je Spalte: notebooksbilliger, Thomann, Galaxus (mobil) | 3 | Den Zustand mit Karte und PDP synchron halten. |
| V15 | **Mobile** | Galaxus: rund 2,2 Spalten wischen, Label in jeder Zelle · Apple: 2 Selektoren · Thomann: Tray als Bottom-Sheet, Karten-Icons ausgeblendet | – | NN/g: 2 Spalten, Label-Spalte fixieren, Scroll-Hinweis per angeschnittenem Inhalt. |
| V16 | **Kategorie-übergreifend** | Automatische Listen je Produkttyp: Galaxus · sonst nicht adressiert | 1 | Nicht blockieren, sondern trennen (Galaxus) bzw. mit Hinweis umleiten. |
| V17 | **Persistenz** | Tray über Seitenwechsel und Reload: Thomann, Galaxus, Bosch · lokaler Speicher mit Einwilligungsabfrage: MediaMarkt | – | Mindestens sitzungs- und tab-übergreifend; per URL dauerhaft. |
| V18 | **Drucken und Teilen** | Drucken: HORNBACH, notebooksbilliger · Teilen: über URL (s. V7) | – | Drucken mit Kopfzeile; „Link kopieren" explizit anbieten. |

---

## 4 · Top 15 übertragbare Muster (nach erwartetem Hebel für einen konfigurierbaren Premium-Shop)

| Rang | Muster (Vorbild) | Warum es wirkt | Voraussetzung |
|---|---|---|---|
| 1 | **Gast-Merkliste mit transparentem Speicherhinweis und sanftem Konto-Nutzen** (OTTO „zwei Wochen", IKEA-Toast, Galaxus- und Thomann-Banner) | Es gibt keinen Abbruch durch eine Login-Wand (Baymard 75 % bzw. 30 %), und Vertrauen entsteht durch Offenheit. | `localStorage` plus Merge beim Login; ehrliche Angabe von Ort bzw. Dauer. |
| 2 | **Konfiguration als ein Eintrag mit aufklappbarer Stückliste** (IKEA „Enthaltene Teile anzeigen", Manufactum „Farbe: Weiß") | Kundinnen erkennen *ihre* Anlage wieder, nicht nur das Modell. Das ist der Kern für Sprechanlagen mit Innenstationen und Zubehör. | Snapshot (Zusammenfassung, Preis, Variante) im Eintrag; `configId`. |
| 3 | **Kontofreier Wiederaufruf-Code** (HORNBACH „Merklisten-ID kopieren", DoorBird Projekt-ID, Porsche Code [R]) | Übergabe an Elektriker, Fachhandel oder Partner ohne Konto, Telefon-tauglich (8–10 Zeichen). | Serverseitiger Token auf eine Momentaufnahme der Liste bzw. Konfiguration; Gültigkeit kommunizieren. |
| 4 | **Teilbare, reload-feste Vergleichs-URL** (Galaxus, Bosch, Miele, notebooksbilliger, Apple) | Teilen mit Partner bzw. Installateur, Zurück-Navigation, kein Verlust beim Tab-Wechsel; Apple nutzt sie zusätzlich für SEO („X vs Y"). | Die IDs bleiben in der URL (nicht per `replaceState` entfernen); Seite oder Overlay mit Deep-Link. |
| 5 | **Merkliste als Projektliste: Menge, Summe, Drucken bzw. PDF** (Galaxus, IKEA, HORNBACH, Thomann) | Mehrfamilienhaus, Briefkastenanlage, Neubau: Der Kauf ist ein Vorhaben. Die Summe beantwortet „Was kostet mein Paket?" | Menge im Eintragsmodell; PDF über bestehendes jsPDF; Menge bei Konfigurationen wahlweise. |
| 6 | **„Vergleichen" direkt aus der Merkliste** (Thomann „Alle vergleichen", HORNBACH-Zeilenschalter, Galaxus-Listen-Hub) | Die Merkliste ist die natürliche Shortlist; man muss nicht zurück auf die Karte. | Gleiche Cap- und Kategorie-Regeln; Handover in den Vergleich. |
| 7 | **Unterschiede zuerst** (Galaxus „Die wichtigsten Unterschiede" als erste Gruppe, Miele „Schnellübersicht") | Bei Fast-Zwillingen steht die Entscheidung in 2–4 Zeilen statt in 60. | Kuratiertes Merkmalset je Kategorie (Phase 0). |
| 8 | **Varianten-Selektor in der Vergleichsspalte** (Samsung) | Bei konfigurierbaren Modellen vergleicht man „Colson in Anthrazit mit 2 Tastern" und nicht „Colson". Wechseln, ohne den Vergleich zu verlassen. | Variantenpreise und -bilder pro Spalte verfügbar; nur kaufrelevante Achsen (Farbe, Tasteranzahl). |
| 9 | **Modell per Artikelnummer hinzufügen** (Bosch „Oder über Produkt-Nr.", Thomann „Artikelnummer/n hinzufügen") | Installateure und B2B-Kunden kennen Nummern; das ist der schnellste Weg zur Gegenüberstellung. | Eingabefeld im Leer-Slot; Validierung und Kategorie-Prüfung. |
| 10 | **Rückmeldung am Ort des Klicks** (Manufactum Inline-Bestätigung, Galaxus Flyout am Header-Ziel) | Man sieht, *was* gemerkt wurde und *wo* es liegt, ohne Modal. | Eine Aktion („Zur Merkliste"); Live-Region. |
| 11 | **Konto-Nutzen im Moment des Merkens** (IKEA-Toast) | Konversion zum Konto ohne Zwang, der Nutzen ist konkret (Folgebesuch, Geräte). | Merge-Logik vorhanden; Text ohne Druck. |
| 12 | **Persistenter, kompakter Tray mit Leer-Slots** (Miele, Thomann, Samsung) | Die Restkapazität ist sichtbar, und der Vergleich überlebt die Navigation. | Speicher über die Sitzung hinaus bzw. per URL. |
| 13 | **Merken-Zustand überall synchron und programmatisch** (notebooksbilliger `aria-pressed`, Thomann Spalte und Karte) | Vertrauen in die Funktion und Barrierefreiheit. | Ein Store, Events an alle Instanzen. |
| 14 | **„Ab"-Werte für konfigurierbare Minima** (Apple „Ab 16 GB") | Ehrlich bei konfigurierbaren Werten (Innenstationen, Tasteranzahl); verhindert falsche Gleichheit. | Datenmodell kennt Basis- und Maximalwert. |
| 15 | **Kategorie-Trennung statt Sperre** (Galaxus: automatische Vergleichslisten je Produkttyp) | Niemand wird mit „nicht möglich" gestoppt; Sprechanlage und Briefkasten liegen sauber getrennt bereit. | Kategorie am Eintrag; Tray zeigt die aktive Gruppe. |

---

## 5 · Beobachtete Anti-Patterns

| Anti-Pattern | Shops | Warum schädlich |
|---|---|---|
| **Login-Wand beim ersten Merken** (vollständige Umleitung) | Zalando, MediaMarkt; [R] Apple | Baymard: Account-Wände führen dazu, dass die meisten Nutzer die Funktion meiden; rund 30 % Abbruch. |
| **Vergleich hinter Einwilligungsdialog** (funktionaler Speicher wie Marketing behandelt) | MediaMarkt | Kundinnen, die Cookies ablehnen, verlieren eine Kernfunktion; der Dialog unterbricht die Auswahl. |
| **Karten-Aktionen nur bei Hover** bzw. mobil ausgeblendet | Galaxus (Desktop), Thomann (Mobile-Liste) | Auf Touch-Geräten unsichtbar (NN/g, Baymard). |
| **Kein Gemerkt- bzw. Ausgewählt-Zustand am Auslöser** | Galaxus (PDP „Merken", Karten-Vergleich), Manufactum (PDP „Merken") | Man klickt doppelt und entfernt dabei versehentlich; kein Screenreader-Zustand. |
| **Cap-Hinweis als Modal** | Samsung | Unterbricht für eine Information, die ein Leer-Slot bzw. Toast trägt. |
| **Literal „none" bzw. leere Zellen für „nicht zutreffend"** | Samsung | Wirkt wie ein Mangel und ist unprofessionell; besser „–" mit Erklärung. |
| **Flache, ungruppierte Merkmalslisten ohne Unterschiede-Filter** | HORNBACH, Thomann, Samsung (ohne Gruppen) | Zwingt zum Zeilen-für-Zeilen-Lesen (Baymard: „Hide identical attributes first"). |
| **Nicht teilbarer Vergleich** (Seite ohne IDs bzw. Modal) | Thomann, HORNBACH, Samsung | Kein Teilen, kein Lesezeichen, Verlust beim Reload. |
| **Konfiguration speichern nur gegen E-Mail und Telefon** | DoorBird | Das Speichern wird zum Lead-Formular und kostet Vertrauen; ein unvollständiger Stand ist nicht speicherbar. |
| **Entfernen ohne Rückgängig** | OTTO, Galaxus, IKEA | Fehlklicks auf Listen sind teuer, gerade bei Konfigurationen. |
| **Benachrichtigungen nur in der App** | OTTO | Web-Kundinnen bleiben ausgeschlossen. |
| **Uneinheitliche Begriffe** | IKEA (Merkzettel, Meine Liste, Lieblingsprodukte), Zalando (Wunschzettel) | Orientierungsverlust; Gift-List-Konnotation. |
| **Ungefragter Assistenten-Drawer über Liste und Tray** | Miele | Verdeckt den Vergleichs-Tray und lenkt ab. |
| **Nur „Unterschiede hervorheben" statt ausblenden** | notebooksbilliger | Schwächere Variante: Man muss weiter selbst filtern (Baymard). |

---

## 6 · Gap-Analyse METZLER (Prototyp `Deliverables/vergleichen-flow-B`, Stand `merkliste.*?v=4`, `vergleichen.*?v=20`)

### 6.1 Wo METZLER bereits Best Practice erfüllt
- **Gast-Merkliste ohne Wand.** `localStorage['mtz_merkliste']` (Limit 50). Der Hinweis „Auf diesem Gerät gespeichert · Anmelden …" entspricht M6 und M7 (OTTO, IKEA, Thomann).
- **Merken immer sichtbar auf der Karte.**
  - `button.mkl-mark` steht oben rechts in `.pcard__media`, mit `aria-pressed` und gefülltem Glyph (M1, M4: wie OTTO, HORNBACH, notebooksbilliger).
  - Der Header `.mkl-hdr` trägt ein Badge (Zahl wie OTTO und notebooksbilliger statt Punkt).
- **Rückmeldung mit genau einer Aktion.** Toast „Gemerkt · Zur Merkliste" und Live-Region `#mkl-live`, kein Modal (M5).
- **Vergleichs-Tray am unteren Rand.** `.vgl-tray` mit Slots, Zähler „Vergleich (n) / max. 4", CTA erst ab 2 und „Leeren" (V3, wie Miele und Thomann).
- **Tabelle nach Baymard.**
  - Sticky Kopf (`table.vgl-t thead th`) und sticky Label-Spalte (`.rh`).
  - Gruppen, Toggletips `.vgl-tip` (wie Galaxus (i)), × je Spalte, Slot „Modell hinzufügen" `.vgl-ph--add` (Miele, Bosch), „Drucken" (HORNBACH, notebooksbilliger).
  - Merken in der Spalte (`.vgl-ph` mit `.mkl-mark`, wie notebooksbilliger und Thomann).
- **Vergleichen aus der Merkliste.** „Auswahl vergleichen (n)" bzw. „2 Briefkästen vergleichen" (Top-15 Nr. 6, wie Thomann und HORNBACH).
- **Konfigurationsorientierte CTAs.** „Konfigurieren" bzw. „Zum Produkt" statt Direktkauf (V13).

### 6.2 Wo METZLER voraus ist (kein beobachteter Wettbewerber macht das)
- **Automatisches „Nur Unterschiede".** `diffCb.checked = (an.ratio >= 0.6 && an.diffs.length > 0)`. Alle Wettbewerber starten mit dem Toggle aus (V9).
- **Beratender Vergleich.**
  - Urteil mit Sprung-Chips: `.vgl-sum`.
  - „Gemeinsamkeiten (n)" einmal zusammengefasst: `.vgl-common`.
  - „Technisch baugleich" plus „Alternativen mit echtem Unterschied": `.vgl-twin`, `.vgl-alts`.
  - „Auf einen Blick" je Modell und Bestwert-Pill `.vgl-best`. Galaxus kommt mit „Die wichtigsten Unterschiede" am nächsten, ohne Urteil.
- **„Konfiguration merken" auf der PDP** (07a).
  - Drei synchrone Instanzen.
  - Hash-Abgleich mit „Geändert seit dem Merken" sowie Aktualisieren statt Duplikat.
  - Rückweg `?merkliste=<configId>` mit Band `.mkl-pdp-band` („Gespeicherte Konfiguration vom …", „Preis aktualisiert: alt → neu", „Nicht mehr verfügbar …", „Noch offen …").
  - Unvollständige Stände sind speicherbar. Das geht über IKEA (statische Kombination) und DoorBird (nur vollständig, gegen Kontaktdaten) hinaus.
- **Rückgängig beim Entfernen.** Toast mit „Rückgängig" und Fokus-Rückgabe; das wurde bei keinem Wettbewerber beobachtet (M14).
- **Kategorie-Gruppen im Drawer.** Dazu Deep-Link in die andere Kategorie statt Sperre (nahe an Galaxus V16).

### 6.3 Wo METZLER hinter Best Practice zurückbleibt (priorisiert)
1. **Vergleichsauswahl modusgebunden.**
   - Die Karten-Checkbox erscheint erst nach dem Toolbar-Button „Vergleichen" (`body.vgl-mode`).
   - Von 9 beobachteten Vergleichs-Shops macht das keiner; Baymard empfiehlt seit 2022 die standardmäßig sichtbare Checkbox.
   - Weil es eine Standing Decision des Kunden ist: **A/B-Test** (Modus vs. dauerhaft sichtbare „Vergleichen"-Checkbox unter dem Preis), Metrik Vergleichsstarts je PLP-Sitzung.
2. **Vergleich nicht teilbar und nicht dauerhaft.**
   - Die Auswahl liegt in `sessionStorage['mtz_vgl_flow']` (weg in neuem Tab bzw. nach Sitzungsende).
   - `?vergleich=` wird nach dem Lesen per `history.replaceState` entfernt.
   - Ein „Link kopieren" fehlt. 5 von 8 Wettbewerbern halten die IDs in der URL.
   - **Empfehlung:** URL-Zustand im Overlay beibehalten (`?vergleich=a,b,c` solange offen), „Link kopieren" in `.vgl-view__bar`.
3. **Kein kontofreier Übergabeweg für die Merkliste.**
   - „Link kopieren" und „Als PDF speichern" sind weiter P1 (05 §3.8, §3.9).
   - IKEA, Manufactum, HORNBACH und Thomann bieten Teilen bzw. Drucken für Gäste; HORNBACH zusätzlich einen **Merklisten-Code**.
   - **Empfehlung:** Kurzcode (z. B. 8 Zeichen) plus Link im Drawer-Fuß, dazu PDF mit Konfigurations-Zusammenfassung (Fachhandel, Elektriker).
4. **Keine Variantenwahl in der Vergleichsspalte.**
   - `.vgl-ph` zeigt Modell und Preis „ab". Farbe bzw. Taster-Anzahl lassen sich nur über die PDP ändern.
   - Samsung zeigt, wie es in der Spalte geht. Für METZLER mindestens Farbe als Swatch-Selektor mit Preis- und Bildwechsel.
5. **Kein Hinzufügen per Artikelnummer.** `.vgl-ph--add` verweist nur auf Karten bzw. Merkliste. Bosch und Thomann haben ein Eingabefeld; das ist für die B2B-Strecke (Installateure) relevant.
6. **Preisänderung in der Liste unsichtbar.**
   - `priceAtAdd` wird gespeichert, aber `.mkl-item` zeigt keine Änderung seit dem Merken; nur das PDP-Band nennt „Preis aktualisiert".
   - **Empfehlung:** Zeile „Preis seit dem Merken: −40,00 €" bzw. „Nicht mehr verfügbar" direkt im Eintrag (M12).
7. **Keine Menge und keine Listensumme.**
   - Projektlisten (Galaxus, IKEA, HORNBACH, Thomann) beantworten „Was kostet das Paket?".
   - Für Mehrfamilienhaus bzw. Briefkastenanlage: Menge pro Eintrag und Summe im Drawer-Fuß (optional, B2B-Lens).
8. **Mobile Vergleichsdichte.**
   - Bei 375 px zeigt `col.rl` 7 rem plus `col.pc` je 10,5 rem nur rund 1,7 Spalten. „Drucken" ist mobil ausgeblendet.
   - NN/g und Apple: 2 Spalten fest. **Empfehlung:** auf dem Phone 2 Spalten (z. B. 6 + 2 × 9,25 rem) bzw. Spalten-Umschalter wie Apple; Scroll-Hinweis durch angeschnittene dritte Spalte.
9. **Kein Umsortieren der Spalten** (Galaxus: Drag bzw. Sortierung). Das ist geringer Hebel, aber bei 4 Spalten hilfreich („günstigste zuerst").
10. **Merkliste nur als Drawer im Prototyp.** Auf JTL ist `/merkliste` als Seite geplant (05 §4). Alle Wettbewerber haben eine Seite mit URL; der Drawer bleibt der Schnellzugriff (Galaxus-Flyout).
11. **Mehrere Listen bzw. Projekte fehlen.** Galaxus und Thomann bieten das für Gäste, HORNBACH mit Konto. Bleibt P2; automatische Benennung („Merkliste vom …") vorsehen, sobald das Feature kommt.

### 6.4 Begriffe und Ikonografie im Marktvergleich
- „Merken / Gemerkt / Merkliste" deckt sich mit Galaxus, HORNBACH und Manufactum; „Merkzettel" nutzen OTTO, IKEA und notebooksbilliger. Bei der Wortwahl ist keine Änderung nötig.
- Das Lesezeichen-Glyph ist im Markt selten: Herz 8×, Pin 1×. Weil METZLER auf der PDP und im Header ein Label führt und das Herz Wunsch bzw. Geschenk konnotiert, ist das Lesezeichen vertretbar. Auf der Karte sollte der Hover-Titel „Merken" bleiben.

---

## 7 · Quellen

**Beobachtet am 31.10.2026 (Gast, nicht notwendige Cookies abgelehnt).**
- Galaxus: https://www.galaxus.de/de/s4/producttype/klingel-tuersprechanlage-1929 · https://www.galaxus.de/de/s4/product/ubiquiti-uvc-g6-pro-entry-bluetooth-ethernet-klingel-tuersprechanlage-68868885 · https://www.galaxus.de/de/lists · https://www.galaxus.de/de/comparison/68868885-24496828-52568625
- MediaMarkt: https://www.mediamarkt.de/de/category/fernseher-203.html · Umleitung beim Herz-Klick auf https://www.mediamarkt.de/de/myaccount/auth/login?redirectURL=…
- Apple: https://www.apple.com/de/mac/compare/ · https://www.apple.com/de/mac/compare/?modelList=MacBook-Air-M5-15,MacBook-Air-M5,MacBook-Pro-14-M6
- Samsung: https://www.samsung.com/de/smartphones/all-smartphones/
- Bosch Hausgeräte: https://www.bosch-home.com/de/de/category/waschen-trocknen/waschmaschinen · https://www.bosch-home.com/de/de/comparison?products=WGN256MR40%2CWUU28T71
- notebooksbilliger: https://www.notebooksbilliger.de/notebooks · https://www.notebooksbilliger.de/produkt+vergleich/show/906505%2C909202
- Thomann: https://www.thomann.de/de/st-modelle.html · https://www.thomann.de/de/compare.html · https://www.thomann.de/de/wishlist.html
- OTTO: https://www.otto.de/haushalt/waschmaschinen/ · https://www.otto.de/wishlist-view/ · PDP https://www.otto.de/p/hisense-waschmaschine-5i-wf5i1045bwq-10-5-kg-1400-u-min-digitales-farbdisplay-autodose-energie-40-besser-als-a-2095862379/
- Zalando: https://www.zalando.de/herrenschuhe-sneaker/ (Umleitung auf accounts.zalando.com)
- IKEA: https://www.ikea.com/de/de/cat/pax-system-19086/ · https://www.ikea.com/de/de/favourites/
- HORNBACH: https://www.hornbach.de/c/eisenwaren/briefkaesten/S23225/ · https://www.hornbach.de/comparison/ · https://www.hornbach.de/wishlist/
- Manufactum: https://www.manufactum.de/herrnhuter-stern-a1e-13-cm-a204804/ · https://www.manufactum.de/merkliste
- Miele: https://www.miele.de/category/1015696/waschmaschinen · https://www.miele.de/e/compare/000000000012703540,000000000012703660
- DoorBird: https://configurator.doorbird.com/
- Siedle: https://www.siedle.de/konfigurator (Umleitung auf /de-de/home/service/preisbeispiele/)
- Ring: https://ring.com/de/de/collections/video-doorbell-cameras

**Berichtet (Forschung).**
- Baymard, „Always Provide Comparison Features for Spec-Driven Industries (17% Don't)": https://baymard.com/blog/provide-comparison-features
- Baymard, „4 Ways to Optimize the Comparison Feature for Scanning": https://baymard.com/blog/user-friendly-comparison-tools
- Baymard, Comparison-Tool-Benchmark: https://baymard.com/ecommerce-product-lists/benchmark/page-types/comparison-tool
- Baymard, Guideline #495: https://baymard.com/guidelines/495-comparison-features-in-listings-for-spec-heavy-products
- Baymard, Product Page UX („Save" features, 21 % nutzen sie): https://baymard.com/blog/current-state-ecommerce-product-page-ux
- Baymard, Out-of-stock (75 % Account-Pflicht, ~30 % Abbruch): https://baymard.com/blog/handling-out-of-stock-products
- Baymard, Guideline #798 und #622: https://baymard.com/guidelines/798-implementing-save-features · https://baymard.com/guidelines/622-implementing-a-cart-save-for-later-feature
- NN/g, „Comparison Tables for Products, Services, and Features": https://www.nngroup.com/articles/comparison-tables/
- NN/g, „Mobile Tables": https://www.nngroup.com/articles/mobile-tables/
- NN/g, „Shopping Cart or Wishlist?": https://www.nngroup.com/articles/wishlist-or-cart/
- Smashing Magazine, „Designing The Perfect Feature Comparison Table": https://www.smashingmagazine.com/2017/08/designing-perfect-feature-comparison-table/

**Berichtet (Hersteller und Shops).**
- MediaMarkt FAQ Wunschliste: https://faq.mediamarkt.de/app/answers/detail/a_id/16206 · Vergleich: https://faq.mediamarkt.de/app/answers/detail/a_id/19733 · Saturn: https://hilfe.saturn.de/app/answers/detail/a_id/11079
- Galaxus Benachrichtigungen: https://www.galaxus.de/de/page/produkt-zu-teuer-oder-nicht-verfuegbar-abwarten-und-benachrichtigen-lassen-16603 · Vergleich: https://www.galaxus.ch/en/page/our-product-comparison-feature-makes-shopping-simple-21982
- Apple Shopping-Hilfe: https://apple.com/ca/shop/help/shopping_experience
- Amazon Hilfe: https://www.amazon.de/gp/help/customer/display.html?nodeId=GHCGC7B7SQ222YMD · https://www.heise.de/tipps-tricks/Amazon-Wunschliste-teilen-so-geht-s-10509978.html
- Zalando FAQ: https://www.zalando.de/faq/Mein-Kundenkonto/Mein-Wunschzettel.html
- IKEA Hilfe: https://www.ikea.com/de/en/customer-service/knowledge/articles/5ee95be1-7bg9-4bc9-bd94-055733e108ec.html
- HORNBACH Hilfe: https://www.hornbach.at/services/hilfe-kontakt-haeufige-fragen/
- Porsche Code: https://configurator.porsche.com/porsche-code/de-DE · VW: https://www.volkswagen.de/de/modelle/konfiguration-laden.html
- Miele Professional Merkzettel: https://www.miele.de/professional/merkzettel-8.htm
- Siedle Profimodus: https://www.siedle.de/xs_db/DOKUMENT_DB/www/Bedienungsanleitungen/Konfigurator/Anleitung_Konfigurator_Profimodus.pdf
- DoorBird Konfigurator-Datenblatt: https://www.doorbird.com/downloads/datasheet/datasheet_konfigurator_de.pdf
- Gira Designkonfigurator (Heinze): https://www.heinze.de/apps/gira-designkonfigurator/13559616/

**Bildbelege** (`Deliverables/09_assets/`): 01–04 Galaxus · 05–06 MediaMarkt · 07 Apple · 08 Samsung · 09–10 Bosch · 11–14 Thomann · 15 notebooksbilliger · 16 OTTO · 17 Zalando · 18–19 IKEA · 20 HORNBACH · 21 Manufactum · 22–23 Miele · 24 DoorBird.
