# 12 · Vergleich-Redesign — Brief des Lead Product Owners

Stand: 05.11.2026 · Scope: Vergleichs-Overlay in `Deliverables/vergleichen-flow-B/` (`vergleichen.js` + `vergleichen.css`, geöffnet auf `index.html` und `briefkasten.html`)
Empfänger: Lead UX Designer, Lead UI Designer, Kunde (Product Designer METZLER) · Rolle des Autors: Lead Product Owner (überwacht, prüft, nimmt ab — entwirft und programmiert nicht)

Auslöser (Kunde): „There is zero UX behind this page." Der Vergleich ist technisch vollständig (echte Shopdaten, Barrierefreiheit, Deep-Link), hilft dem Kunden aber nicht beim Entscheiden. Dieses Redesign soll genau das ändern.

---

## 1 · Problem aus Sicht des Kunden

### 1.1 Wofür der Kunde die Seite „einstellt" (Job to be done)
> „Ich habe 2–4 Modelle in der engeren Wahl, die oft fast gleich aussehen und gleich heißen. Sagen Sie mir schnell, **worin sie sich wirklich unterscheiden, was der Aufpreis bringt und welches zu meinem Haus passt** — damit ich eines konfigurieren kann."

Daraus folgen drei Fragen, die die Seite der Reihe nach beantworten muss:
1. **Welche sind das?** Die Modelle müssen auf einen Blick unterscheidbar sein (Name, Bild, Preis).
2. **Was ist anders — und was bedeutet das?** Die belegten Unterschiede, in Klartext, zuerst.
3. **Wie geht es weiter?** Ein klarer nächster Schritt je Modell: „Konfigurieren" oder „Zum Produkt".

### 1.2 Verifizierte Beobachtungen (Browser, 05.11.2026, Version B, `vergleichen.*` v=29)
Gemessen mit `getBoundingClientRect`/`innerText`, Transitions deaktiviert.

| # | Beobachtung | Beleg | Folge für den Kunden |
|---|---|---|---|
| V1 | **Gleiche Titel.** Colson und Neo heißen beide „VDM10 2.0 Video-Türsprechanlage …". Das unterscheidende Wort („Colson"/„Neo") steht nur in der 12-px-Zusatzzeile „1 Klingeltaster · Colson". Auf 375 px wird der zweite Titel zu „Türsprechanl…" gekürzt. | `?vergleich=colson1,neo1` | Der Kunde weiß nicht sicher, welche Spalte welches Modell ist. |
| V2 | **Dieselbe Information mehrfach.** Bei `colson1,colson2` gibt es genau einen technischen Unterschied (Klingeltaster 1 vs. 2). Das Wort „Klingeltaster" steht 8-mal im Dialog: Zusatzzeile, Chip, Hinweis „Gleiche Design-Linie …", „Auf einen Blick", Tabellenzeile, „Was der Aufpreis bringt" usw. Bei Colson/Neo steht das Namensschild 3-mal, Preis und Design-Linie je 2-mal (Kopf und Tabelle). | `innerText` des Dialogs | Viel Lesen, wenig Neues. Die Seite wirkt lang, obwohl die Antwort kurz ist. |
| V3 | **Kein Fazit.** Die Kopfzeile lautet „6 von 14 Merkmalen unterscheiden sich". Preis und Design-Linie (also der Name) zählen dabei mit. Was die + 42,50 € bei Colson bringen (lasergraviert statt Papiereinleger, + Weiß, 27,4 statt 29 cm hoch, 2,12 statt 2,39 kg), steht nirgends zusammen. „Was der Aufpreis bringt" erscheint erst ab 60 % Ähnlichkeit, und zwar **unter** der Tabelle. Colson/Neo liegen bei 57 %, also fehlt der Block dort. | `colson1,neo1` vs. `colson1,colson2` | Der Kunde muss selbst Zeile für Zeile vergleichen. Das ist genau die Arbeit, die die Seite ihm abnehmen soll. |
| V4 | **Zahlen widersprechen sich.** Bei 4 Modellen steht am Schalter „Nur Unterschiede (15)", im Fazit aber „10 von 11 … 5 weitere k. A.". Bei Briefkästen steht am Schalter (10), im Fazit „8 von 9". | `dominik1,sdm10x,colson1,kai1`; `siebert,ebenhard,trias` | Das kostet Vertrauen, und zwar ausgerechnet auf der Seite, die Fakten liefern soll. |
| V5 | **Die Chips zeigen auf versteckte Zeilen.** Abmessungen, Gewicht und Farben werden als Unterschied genannt, stehen aber hinter „Alle technischen Details anzeigen (6)". Ein Klick auf den Chip klappt die Details auf und springt zur Zeile (funktioniert). | `colson1,neo1`, Chip „Gewicht" | Die Unterschiede stehen nicht in der Tabelle, die man auf den ersten Blick sieht. |
| V6 | **Platz wird verschenkt.** Bei 1900 px ist die Label-Spalte 396 px breit, ihr Kopf bleibt leer (27 % der Tabellenbreite). Bei 1440 px ist das Produktbild 94 × 94 px groß, obwohl die Spalte 375 px breit ist; der CTA „Zum Produkt" ist dagegen 339 px breit. Der Sticky-Kopf misst 320 px, das sind 34 % des sichtbaren Bereichs. | 1900 / 1440 Desktop | Die Bilder sind zu klein, um das Design zu beurteilen (für Briefkästen das wichtigste Kriterium). Die Buttons dominieren. |
| V7 | **Tablet: zu wenig Inhalt sichtbar.** Bei 1024 × 768 und 4 Modellen ist der Kopf 357 px hoch, die erste Datenzeile beginnt bei 580 von 768 px, und die Tabelle scrollt horizontal (1226 / 1009 px). Bei 768 px scrollen schon 3 Modelle horizontal (1112 / 753 px), die Label-Spalte ist 224 px breit. | 1024, 768 | Ohne Scrollen ist kaum ein Wert sichtbar. |
| V8 | **Mobil (375 × 812): Text bricht, Inhalt läuft über.** Die Label-Spalte ist 88 px breit. „AUF EINEN BLICK" bricht auf 3 Zeilen um, „GRUNDLA-GEN" wird mitten im Wort getrennt, „Video-/Türsprechanlage" ebenso. Schon bei 2 Modellen scrollt die Tabelle horizontal (444 / 375 px), die Spalte „Modell hinzufügen" ist abgeschnitten. Die erste Datenzeile beginnt bei 522 px. Der Toast „Geteilter Vergleich geöffnet" verdeckt die Tabelle, sein Link ist abgeschnitten („…wiederherstelle"). | `colson1,neo1` mobil | Wirkt kaputt. Am Handy lässt sich so nicht entscheiden. |
| V9 | **„Auf einen Blick" hilft wenig.** Bei Siebert und Ebenhard steht in 2 von 3 Spalten „Keine Besonderheit gegenüber den anderen Modellen". Bei 4 Modellen gilt „Nachtsicht" für 3 Modelle als Besonderheit (nur weil Kai eine Audio-Anlage ist). Die Inhalte sind rohe Paare aus Merkmal und Wert. | Briefkästen; 4 Modelle | Der Platz ganz oben in der Tabelle bringt kaum Information. |
| V10 | **Modelle verschiedener Klasse ohne Hinweis.** Die 3-Parteien-Standanlage (349 €) steht neben zwei Einzelbriefkästen (89,99 €). Angezeigt werden „+ 259,01 €", der volle Shop-Name als Titel, eine leere Zusatzzeile und „Design-Linie –". | `siebert,ebenhard,trias` | Die Preisdifferenz suggeriert einen Aufpreis, wo es um eine ganz andere Produktklasse geht. |
| V11 | **Abweichungen vom Design-System.** Die Gruppenlabels (AUF EINEN BLICK, GRUNDLAGEN …) sind 11 px groß; das DS-Minimum ist 0,75 rem. Die leere Spalte „Modell hinzufügen" läuft als graue Fläche über die ganze Tabellenhöhe. | computed style | Der Vergleich wirkt unruhig und nicht wie aus einem Guss. |
| V12 | **Das funktioniert und bleibt:** echte Tabellensemantik (`caption`, `th scope`), `h2`-Dialogtitel, beschriftete Icon-Buttons, „k. A."/„–" mit Screenreader-Text, Quellzeile, Fokus-Management, zugeklappte Gemeinsamkeiten, Deep-Link, Drucken, Rückgängig. | DOM | Das ist die Basis für das Redesign; nichts davon darf verloren gehen. |

### 1.3 Hypothesen (nicht verifiziert — mit dem Konzept prüfen)
- **H1** Kunden entscheiden nach ihrem **Bedarf** (Anzahl Parteien/Klingeltaster, Audio oder Video, IP oder vorhandene 2-Draht-Leitung, Art des Namensschilds, Farbe) und kaum nach einer Datenliste. Ein bedarfsorientiertes Fazit ist hilfreicher als die Zahl „x von y".
- **H2** Bei Zwillingen fragt der Kunde zuerst: „Ist das dasselbe Gerät?" Die Antwort („laut Shopdaten technisch gleich bis auf …") gehört ganz nach oben.
- **H3** Bei Briefkästen und Designlinien wird nach dem Aussehen gewählt. Größere Bilder bringen dort mehr als zusätzliche Zeilen.
- **H4** Am Handy werden meist nur 2 Modelle zugleich gelesen. Bei 3–4 Modellen braucht es ein eigenes Muster statt einer geschrumpften Desktop-Tabelle.
- **H5** Vier gleich starke, teal gefüllte CTAs auf voller Breite konkurrieren mit dem Inhalt. Der CTA soll erreichbar sein, aber nicht die Spalte beherrschen.

---

## 2 · Nutzer und Schlüsselszenarien (zugleich die Testfälle)

Kunde: Endkunde (B2C) beim Kauf einer konfigurierbaren Türsprechanlage oder eines Briefkastens. Er vergleicht Modelle, die laut Shop vorselektiert sind, und konfiguriert anschließend auf der PDP oder im Konfigurator.

| ID | Szenario | Test-URL (Server `127.0.0.1:8821`) |
|---|---|---|
| S1 | **Fast gleiche Modelle, verschiedene Linien** (Colson vs. Neo, 57 % ähnlich) | `/index.html?vergleich=colson1,neo1` |
| S2 | **Zwillinge derselben Linie** (Colson 1 vs. 2 Klingeltaster) | `/index.html?vergleich=colson1,colson2` |
| S3 | **Sehr unterschiedliche Modelle, 4 Spalten** (BUS · SDM10X · VDM10 · Audio) | `/index.html?vergleich=dominik1,sdm10x,colson1,kai1` |
| S4 | **Briefkästen, Design zuerst + andere Klasse** | `/briefkasten.html?vergleich=siebert,ebenhard,trias` |
| S5 | **Briefkasten-Zwillinge** (gleiche Linie, Variante) | `/briefkasten.html?vergleich=ebenhard,ebenhard-v2a` |
| S6 | **Ankunft aus der Merkliste** („← Merkliste", Toast) | Merkliste → „Auswahl vergleichen" bzw. `&von=merkliste` |
| S7 | **Geteilter Link** (fremde Auswahl, „Meine Auswahl wiederherstellen") | S3-URL mit bestehender eigener Auswahl |
| S8 | **Rand: 1 Modell / 3 Modelle / viele „k. A."** (2 → 1 entfernen; S3 mit Türöffner „k. A.") | aus S1/S3 heraus |

Jedes Szenario wird bei **1920 × 1080, 1440 × 900, 1024 × 768, 768 × 1024 und 375 × 812** geprüft.

---

## 3 · Ziele und Nicht-Ziele

**Ziele (dieses Redesign, baubar im Prototyp jetzt)**
- **Z1 Entscheidung zuerst:** Im ersten Bildschirm stehen Fazit, Modellidentität und die entscheidenden Unterschiede, alles in Klartext und nur aus belegten Daten.
- **Z2 Jede Information einmal:** eine Stelle pro Fakt. Zusammenfassung und Tabelle ergänzen sich, statt sich zu wiederholen.
- **Z3 Klare Hierarchie:** Fazit → Modelle (Bild, Name, Preis, CTA) → Unterschiede → Gemeinsamkeiten (zugeklappt) → Quelle.
- **Z4 Layout für jede Breite:** Desktop nutzt die Breite für Bilder und Inhalt, Tablet ohne verschenkten Raum, Handy mit einem eigenen, lesbaren Muster.
- **Z5 Nichts geht verloren:** Datenehrlichkeit, Barrierefreiheit, Deep-Link, Drucken, Merkliste-Anbindung und beide Lenses bleiben erhalten.

**Nicht-Ziele (ausdrücklich außerhalb)**
- Neue Daten, neue Merkmale, Scraping, Handpflege von `vergleich-daten.js`. Änderungen an `tools/build_vergleich_daten.py` nur mit PO-Freigabe und nur für Darstellung, nie für neue Werte.
- „Testsieger"/Scoring oder eine Kaufempfehlung „Nehmen Sie X", die nicht aus Shopdaten belegt ist.
- PLP-Karten, Einstieg über die Karten-Checkboxen (bleiben bis zum Toolbar-Button „Vergleichen" verborgen), Vergleichsleiste (Tray), Merkliste-Drawer, PDP (inkl. Kaufbutton und „Fotos | 3D"), Kaufberater.
- JTL-Integrationsspec, PDF-Export, Account-Funktionen, Bewertungen, Warenkorb.
- Version A (`vergleichen-flow/`), `vergleichen-prototype/`, `Desktop/PLP`, `Desktop/PDP METZLER`, `_old-private-backups`, `Catalogue merkmale/`.

**Harte Leitplanken (nicht verhandelbar)**
- Formelles „Sie". Begriffe „Merkliste/Merken/Gemerkt/Vergleichen". **Nie** „Wishlist/Wunschzettel/Favoriten/günstig".
- **Kein „In den Warenkorb"** im Vergleich. CTAs heißen „Konfigurieren" oder „Zum Produkt".
- Nur rem. Nur Tokens aus `Design SYSTEM/metzler-tokens.css`, nur die DS-Typoskala, keine erfundenen Werte. WCAG 2.1 AA, Tastatur, Screenreader, `prefers-reduced-motion`.
- Datenehrlichkeit (Doc 11 §7.1): nur Shopdaten. „k. A." = im Shop nicht gepflegt, „–" = trifft nicht zu. Zeilen ohne Wert werden ausgeblendet. „Bestwert" nur bei IP/IK und nur, wenn alle Modelle einen Wert haben. Die Quellzeile „Daten: Metzler Shop (JTL-Wawi), Stand …" bleibt. Keine erfundenen Spezifikationen.
- Lesezeichen-Glyph (kein Herz). Icon-Buttons ohne Hover-Effekt, der Fokusring bleibt. Sticky-Kopf mit **fester Höhe** (keine Größenänderung beim Scrollen). Die Zeile „Farben zusätzlich/ohne" kommt nicht zurück.

---

## 4 · Akzeptanzkriterien (prüft der PO im Browser; jedes Kriterium gilt für S1–S8 und alle 5 Breiten, sofern nicht anders angegeben)

**A · Entscheidung**
1. Bei 1440 × 900 steht **ohne Scrollen** ein Fazit von 1–2 Sätzen. Es nennt die belegten, entscheidenden Unterschiede in Klartext. S1 nennt mindestens Namensschild (lasergraviert vs. Papiereinleger), die zusätzliche Farbe Weiß und die Höhe/das Gewicht. Ein Fazit, das nur aus Zählwerten besteht („x von y Merkmalen"), ist nicht zulässig.
2. *(geändert CP1)* Bei unterschiedlichen Preisen ordnet ein Satz oberhalb der Tabelle den Preis ein, unabhängig von einer Ähnlichkeitsschwelle. Bei **2 Modellen** (S1, S2) nennt er, womit der Preisunterschied laut Shopdaten einhergeht. Bei **3–4 Modellen** gibt es zwei Fälle: Sind sie technisch gleich oder technisch offen, nennt er die Unterschiede, mit denen die Preise einhergehen. Sind sie technisch verschieden (S3), sagt er ausdrücklich, dass sich der Preis keinem einzelnen Merkmal zuordnen lässt. Der Satz bewertet nie („kein Mehrwert", „kein Vorsprung"). Ausnahme ist der Satz aus Doc 11 R4 bei nicht gepflegten technischen Zeilen.
3. *(geändert CP1)* Zwillinge (S2, S5) zeigen oben ausdrücklich „laut Shopdaten technisch gleich bis auf …" bzw. „kein technischer Mehrwert belegt (nicht gepflegt: …)", wenn „k. A." die Aussage verhindert (Doc 11 §7.1 Regel 4). Sind Maße oder Gewicht verschieden, nennt **derselbe Satz** diese Bauform-Unterschiede. Ein „technisch gleich" ohne diesen Zusatz gibt es nur bei gleicher Bauform.
4. Jede Produktspalte ist am Namen unterscheidbar. Das unterscheidende Wort (z. B. „Colson"/„Neo", „1 Klingeltaster"/„2 Klingeltaster") steht in der Titelzeile in Titelgröße, nicht nur in einer Zusatzzeile. Kein Titel wird so gekürzt, dass dieses Wort verschwindet.
5. Keine Spalte zeigt „Keine Besonderheit gegenüber den anderen Modellen" oder eine Besonderheit, die nur entsteht, weil ein anderes Modell „–" hat (z. B. „Nachtsicht" gegenüber einer Audio-Anlage).
6. Bei Modellen verschiedener Klasse (Einzelbriefkasten vs. Mehrparteien-/Standanlage, Set vs. Einzel; S4) steht ein Hinweis darauf, und die Preisdifferenz wird nicht als „Aufpreis" dargestellt.
7. Jede Spalte hat genau einen CTA, „Konfigurieren" oder „Zum Produkt" (wie heute je Artikel). Er ist von jeder Scrollposition aus mit höchstens einer Aktion erreichbar.

**B · Hierarchie und keine Wiederholung**
8. *(geändert CP1)* In der Standardansicht steht jeder **Fakt** (Wert eines Produkts) höchstens einmal in Tabelle/Kopf und einmal im Fazit. Synonyme zählen mit. Einzige Ausnahme ist das unterscheidende Titelsegment nach AK 4. Die aufgeklappten Gemeinsamkeiten zeigen jeden gemeinsamen Wert einmal, nicht je Spalte. Messung über `innerText` mit zugeklappten Erklärsätzen: In S2 kommt das Teilwort „taster" (inkl. „Tasteranzahl") höchstens 5-mal vor (2 Titel, 1 Zeilenlabel, Fazit), in S1 „Lasergraviert" höchstens 2-mal.
9. Der Preis steht je Produkt einmal (Kopf **oder** Tabellenzeile), die Differenz einmal. Die Design-Linie steht einmal.
10. Reihenfolge im Dialog: Fazit → Modellköpfe → Unterschiede → Gemeinsamkeiten (zugeklappt, mit Anzahl) → Quellzeile.
11. Jeder im Fazit oder als Sprungmarke genannte Unterschied ist **ohne Aufklappen** in der Tabelle sichtbar. S1: Abmessungen, Gewicht und Farben stehen nicht mehr hinter „Alle technischen Details".
12. *(geändert CP1)* Alle Zahlen auf der Seite folgen der Zählregel 12a §4. Schalter „Nur Unterschiede (U)", Abschnittskopf „Unterschiede (U)" und eine U-Angabe im Fazit zeigen dieselbe Zahl. U + O + G entspricht der Zahl der eingeblendeten Merkmalszeilen. Es gibt keine Prozentwerte, kein „x von y" und keine Sprungmarken (die Unterschiede stehen direkt unter dem Kopf). Prüfung mit S3 und S4.
13. Ab 1024 px ist die Label-Spalte höchstens 15 rem breit. Kopfzellen bleiben nicht leer, wenn sie breiter als 8 rem sind.

**C · Layout je Breite**
14. `document.documentElement.scrollWidth === innerWidth` bei allen 5 Breiten (die Seite scrollt nie horizontal).
15. Bei 1920 und 1440 laufen 2, 3 und 4 Modelle ohne horizontales Scrollen. Das Produktbild ist bei 2–3 Modellen mindestens 10 rem groß, bei 4 Modellen mindestens 7,5 rem. Der Inhalt bleibt innerhalb des DS-Containers (max. 100 rem).
16. Bei 1024 × 768 laufen 4 Modelle ohne horizontales Scrollen. Die erste Unterschieds-Zeile beginnt im oberen 50 % des Viewports (≤ 384 px, heute 580 px).
17. Bei 768 × 1024 laufen 3 Modelle ohne horizontales Scrollen, die erste Unterschieds-Zeile beginnt bei höchstens 512 px.
18. *(geändert CP1)* Bei 375 × 812 gibt es kein horizontales Scrollen. Bei mehr Modellen gilt das freigegebene Muster „Spaltenwahl" (12a §6.2):
    - höchstens 2 Spalten unter 48 rem, höchstens 3 bei 48–64 rem;
    - der Titel ist ein Button, der das Modell wechselt;
    - Pille „i / n" als sichtbarer Hinweis;
    - „Unterschied bei: …" an U-Zeilen, deren sichtbare Werte gleich sind;
    - Fazit und Zählung beziehen sich auf alle Modelle, der Druck zeigt alle;
    - bedienbar per Tastatur und Screenreader, für Screenreader eine echte Tabelle der sichtbaren Spalten.

    Die erste Unterschieds-Zeile beginnt bei höchstens 487 px (heute 522 px).
19. Keine Silbentrennung mitten im Wort durch Platzmangel (kein „GRUNDLA-GEN"). Toasts verdecken weder CTA noch Fazit, ihr Text wird nicht abgeschnitten.
20. Alle Bedienelemente haben eine Trefferfläche von mindestens 2,75 rem.

**D · 2 / 3 / 4 Spalten**
21. Die Produktspalten sind gleich breit. Der Platz „Modell hinzufügen" (nur bei weniger als 4 Modellen) erzeugt keine leere graue Fläche über die ganze Tabellenhöhe. Die Option „Aus der Merkliste (n)" bleibt.
22. Beim Entfernen und Hinzufügen bleiben Fokusführung und Live-Ansage wie heute erhalten (2 → 1 behält den Dialog mit Leerzustand).

**E · Sticky-Kopf**
23. Die Höhe des Sticky-Bereichs ist bei `scrollTop` 0, 200 und 1000 identisch (±0 px). Beim Scrollen wechselt keine Klasse.
24. *(geändert CP1)* Der Sticky-Bereich (Leiste + Modellköpfe) ist ab 1024 px höchstens 16 rem hoch, bei 375 px höchstens 13 rem (heute 320–357 bzw. 293 px). Ausnahme: höchstens 13,5 rem, aber nur, wenn ein Titel ohne Design-Linie bei 375 px eine 3. Zeile braucht. Die Höhe wird aus **allen** Modellen des Vergleichs berechnet und ändert sich weder beim Scrollen noch beim Spaltentausch. AK 18 gilt weiter.
25. Im Sticky-Bereich bleiben je Modell sichtbar: unterscheidbarer Name, Preis und Entfernen. CTA laut Kriterium 7.

**F · Datenehrlichkeit**
26. Stichprobe von 10 Zellen aus S1–S5: Jeder angezeigte Wert entspricht `window.MTZ_VGL_DATA`. Jede Aussage im Fazit lässt sich auf eine Tabellenzeile zurückführen.
27. „k. A." und „–" behalten Bedeutung und Screenreader-Text. Zeilen ohne einen einzigen Wert bleiben ausgeblendet. „k. A."-Zeilen zählen nicht als Unterschied oder Gemeinsamkeit und werden separat genannt. *(geändert CP1)* Gleiches gilt für Spannen „(je nach Ausführung)", die sich mit dem Wert eines anderen Modells überschneiden (12a §4 Z2b). Die Zelle zeigt die Spanne weiter, und Spannen ohne Überschneidung zählen als Unterschied.
28. „Bestwert" erscheint nur bei IP/IK und nur, wenn alle Modelle einen Wert haben.
29. Die Quellzeile „Daten: Metzler Shop (JTL-Wawi), Stand …" ist vorhanden, auch im Druck.
30. In der Farbzeile gibt es keine Ergänzung „zusätzlich/ohne". *(geändert CP1)* `vergleich-daten.js` ist byte-gleich mit der CP0-Kopie in `…\scratchpad\cp0\` (Commits entscheidet die Nutzerin; Prüfung gegen die Kopie, nicht gegen git HEAD).

**G · Barrierefreiheit**
31. Der Dialog hat `role=dialog`, `aria-modal` und einen `h2`-Titel, eine Fokusfalle und Escape zum Schließen (offener Tip zuerst). Beim Schließen kehrt der Fokus zum Auslöser zurück.
32. Tabellensemantik bleibt erhalten (`caption`, `th scope=col/row`). Ein mobiles Alternativmuster bietet dieselbe Zuordnung „Merkmal – Modell – Wert" für Screenreader.
33. *(geändert CP1)* Der Tastaturpfad Öffnen → Schalter → „Was bedeutet das?" → [Spaltenwahl] → CTA → Entfernen (+ Rückgängig) → Gemeinsamkeiten anzeigen → Schließen funktioniert vollständig. Die Tab-Reihenfolge folgt der Leserichtung, der DS-Fokusring ist überall sichtbar.
34. Text hat mindestens 4,5:1 Kontrast, UI-Elemente mindestens 3:1. Unterschiede sind nicht nur durch Farbe erkennbar.
35. `prefers-reduced-motion` schaltet Flash, Smooth-Scroll und Übergänge ab. Bei 320 CSS-px bzw. 400 % Zoom geht kein Inhalt verloren.
36. Die Live-Region meldet Schalterwechsel und Spaltenänderungen.

**H · Copy und Design-System**
37. Im `innerText` aller Szenarien kommen „Wishlist", „Wunschzettel", „Favoriten", „günstig" und „Warenkorb" nicht vor. Die Ansprache ist durchgehend „Sie".
38. Es gibt keine Schriftgröße unter 0,75 rem und nur Größen der DS-Typoskala. Neue und geänderte CSS-Zeilen enthalten kein `px` und keinen Hex-Wert außerhalb der Token-Definitionen.
39. Das Lesezeichen-Glyph bleibt. Icon-Buttons sehen im Hover- und Ruhezustand gleich aus (computed style), der Fokusring bleibt.

**I · Stabilität und Performance**
40. Öffnen, Scrollen, Schalter und Sprungmarke erzeugen zusammen einen Layout-Shift (PerformanceObserver `layout-shift`) von höchstens 0,05. Bilder haben reservierte Maße. Der Schalter ändert weder Spaltenbreiten noch Kopfhöhe.
41. In keinem Szenario gibt es Konsolenfehler.

**J · Keine Regression**
42. Es funktionieren weiterhin: Merkliste → Vergleich (mit „← Merkliste"), `?vergleich=` (Zurück schließt, Reload öffnet), geteilter Link mit „Meine Auswahl wiederherstellen", Link kopieren, Drucken (vollständig, inkl. Gemeinsamkeiten), Vergleich leeren + Rückgängig, Hinweis auf eine andere Kategorie und beide Lenses.
43. *(geändert CP1)* Ein Vergleich mit den CP0-Kopien bzw. dem Arbeitsbaum zeigt Änderungen nur in `vergleichen-flow-B/vergleichen.js|css`, an den `?v=`-Parametern in `index.html`/`briefkasten.html` und in den Docs 12a–12c. Andere Dateien nur nach PO-Freigabe.

---

## 5 · Rollen, Übergaben, Prüfung

**Lead UX Designer liefert `12a_Vergleich-Redesign_UX.md`**
- Informationsarchitektur und Reihenfolge je Zustand: 2/3/4 Modelle, Zwilling, fast gleich, sehr verschieden, andere Klasse, viele „k. A.", 1 Modell, Ankunft aus der Merkliste, geteilter Link.
- **Fazit-Regeln:** feste Textbausteine, die nur aus Zeilenwerten befüllt werden (keine freie Formulierung). Dazu Zählregel (AK 12) und Standardansicht (heute die 60 %-Regel → beibehalten oder ersetzen, mit Begründung).
- Low-Fi-Wireframes für 1920, 1440, 1024, 768 und 375 (ASCII oder Skizzen-HTML in der Scratchpad, nicht im Projekt). Mobiles Muster für 3–4 Modelle.
- Interaktionsspec: Sticky-Kopf (Inhalt, feste Höhe), Schalter, Sprungmarken, Entfernen/Hinzufügen, CTA-Erreichbarkeit, Toasts.
- Copy-Deck mit jedem sichtbaren String und jedem Screenreader-String, A11y-Spec (Lesereihenfolge, Ansagen).
- **Abgleich:** jedes Akzeptanzkriterium → Stelle im Konzept.

**Lead UI Designer liefert `12b_Vergleich-Redesign_UI.md`** (startet nach CP1)
- Visuelle Spec ausschließlich mit DS-Tokens: Typostufe je Element, Abstände, Farben, Zustände (Standard, Fokus, Unterschied, Bestwert, k. A., „–", deaktiviert). Hover nur bei Text-/Flächen-Buttons, nie bei Icon-Buttons.
- Raster je Breite: Spaltenbreiten, Bildgrößen, Höhe des Sticky-Kopfs in rem (AK 13/15/24).
- Token-Tabelle. Fehlt ein Token, kommt es auf eine **Vorschlagsliste** für den Kunden und wird nicht erfunden.
- Statisches Mock (HTML in der Scratchpad oder Screenshots) für S1 und S3 bei 1440 und 375.

**Umsetzung:** nach CP2 durch den UI-Lead oder einen Senior FE, nur in `vergleichen.js|css` (Versionen erhöhen). Bericht `12c_Vergleich-Redesign_Umsetzung.md` mit einer Prüftabelle AK 1–43.

**Checkpoints (PO prüft und gibt frei, Kunde entscheidet bei Richtungsfragen)**
| CP | Inhalt | Prüfung durch den PO | Freigabe |
|---|---|---|---|
| CP0 | Dieser Brief + Antworten auf §6 | — | Kunde |
| CP1 | UX-Konzept 12a | Szenarien S1–S8 durchgespielt; AK A, B, F, H abgedeckt; keine neuen Daten | PO, dann Kunde (Richtung) |
| CP2 | UI-Spec 12b | AK C, D, E, G, H; nur DS-Tokens; stimmt mit 12a überein | PO |
| CP3 | Build im Prototyp | alle AK im Browser, 5 Breiten × S1–S8; Mängelliste | PO |
| CP4 | Abschluss 12c | alle AK bestanden, Regression grün | Kunde |

Spielregeln: Der Scope ändert sich nur über den PO. Bei Konflikten zwischen UX und UI entscheidet der PO nach dem Job to be done (§1.1). Kundenentscheidungen werden in 12c protokolliert. Nach jedem Browser-Test: `localStorage.clear(); sessionStorage.clear()`.

**Definition of Done:** AK 1–43 bestanden und in 12c mit Messwerten belegt · keine Konsolenfehler · Asset-Versionen erhöht · Leitplanken aus §3 eingehalten · unberührte Pfade unverändert · Kunde hat bei CP4 abgenommen.

---

## 6 · Risiken und offene Fragen an den Kunden

**Fragen, die nur der Kunde entscheiden kann**
1. **Wie weit darf das Fazit interpretieren?** Variante (a): nur Fakten („2-Draht-BUS vs. IP-System"). Variante (b): zusätzlich feste, vom Kunden freigegebene Bedarfssätze je Merkmalswert („2-Draht-BUS: nutzt eine vorhandene 2-Draht-Klingelleitung"). (b) hilft beim Entscheiden, braucht aber eine freigegebene Textliste. *Empfehlung PO: (b) mit einer kurzen Liste von 6–10 Sätzen.*
2. **Handy mit 3–4 Modellen:** Dürfen dort 2 Modelle nebeneinander stehen, mit einer Auswahl, welche 2 sichtbar sind (wie bei Apple oder Samsung)? Oder sollen alle Spalten wischbar bleiben?
3. **UVP im Vergleich:** Soll der durchgestrichene UVP bleiben (Verkaufsargument) oder entfallen (Ruhe, weniger Wiederholung)?
4. **Andere Produktklasse (S4):** Den Vergleich zulassen mit Hinweis (Empfehlung) oder Einzel- und Mehrparteienanlage gar nicht erst zusammen vergleichen lassen?
5. **Overlay oder eigene Seite?** Der Prototyp bleibt ein Overlay (geringeres Risiko, Deep-Link besteht bereits). Ist das für diese Runde in Ordnung?

**Risiken (der PO steuert sie)**
- **Datenlücken:** Viele „k. A." (Türöffner bei 50 Anlagen, Tiefe bei 40 Artikeln) machen das Fazit dünn. Das Konzept muss mit „k. A." ehrlich und trotzdem hilfreich umgehen; Ergänzungen kommen über das Shop-Team (Doc 11 §9), nicht über das Design.
- **Generierte Sätze können falsch werden:** Jeder Baustein braucht eine Regel und einen Testfall (AK 26).
- **Höhe des Sticky-Kopfs vs. Inhalt:** Das 16-rem-Limit kann nur mit einem schlanken festen Kopf erreichbar sein (laut früherer Entscheidung: separater, schlanker Identitätsstreifen statt Größenänderung beim Scrollen).
- **Scope Creep** in Richtung Tray, Merkliste, PLP: wird über §3 abgewehrt.
- **Test-Artefakte:** In einem ausgeblendeten Browser-Pane laufen Transitions nicht. Vor jedem Messen werden Transitions per CSS abgeschaltet.

## 7. Entscheidungen der Nutzerin (05.11.2026)

| Frage | Entscheidung |
|---|---|
| Wie weit darf das Fazit interpretieren? | **Freigegebene Kurzliste:** Fakten aus der Tabelle plus eine kurze, feste Liste von 6–10 bedarfsbezogenen Erklärsätzen (z. B. was „2-Draht-BUS“ für vorhandene Leitungen bedeutet). Die Liste steht im UX-Spec und wird von der Nutzerin freigegeben; darüber hinaus wird nichts interpretiert. |
| Mobil mit 3–4 Modellen | **Designer entscheiden:** Die UX-Leitung schlägt das Muster vor, die PO gibt es frei (Kriterium 18). |
| Durchgestrichene UVP | **Bleibt, aber kleiner/ruhiger.** |
| Modelle unterschiedlicher Klasse | **Vergleich erlaubt, mit Hinweis;** die Preisdifferenz wird nicht als „Aufpreis“ dargestellt. |
| Overlay oder eigene Seite | Nicht gefragt → bleibt in dieser Runde ein Overlay. |

**CP0-Basis:** Der aktuelle Arbeitsstand (inkl. der noch nicht committeten Bildkorrektur) ist als Kopie gesichert; Kriterien 30 und 43 werden gegen diese Kopie geprüft (`vergleich-daten.js` darf sich nicht ändern).
