# 14 · Responsive-Audit Version B (07.11.2026)

Gegenstand: `Deliverables/vergleichen-flow-B/`. Geprüft wurden der Vergleich (Overlay), die Merkliste (Drawer, auch auf der PDP), beide PLPs mit Vergleichsmodus und Leiste sowie auf der PDP nur der Merken-Button. Es wurden nur Fehler behoben, das Design blieb gleich: Ab 64 rem ist der Vergleich pixelgleich zu vorher (Kopf 292 px bei 1024/1280/1440/1920, gemessen vorher und nachher). Die PDP-eigenen Elemente (Fotos | 3D, Kaufbutton) blieben unberührt. Produktdaten, `vergleich-daten.js`, `tools/`, Version A und die PLP/PDP-Quellprojekte wurden nicht verändert.

## Testmatrix

| | 320 | 360 | 375 | 390 | 414 | 768 | 812×375 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Vergleich 2 (`colson1,neo1`) | ✓ | ✓ | ✓ (×667) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vergleich 3 Briefkästen (`siebert,ebenhard,moris`) | ✓ | – | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vergleich 4, gemischte Bewertungen (`dominik1,sdm10x,colson1,kai1`) | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vergleich 3, sehr lange Namen (`siebert-vdm10,siebert-vdm10-stand,colson1`) | ✓ | – | – | ✓ | – | ✓ | ✓ | ✓ | ✓ | – | ✓ |
| PLP Briefkästen, Vergleichsmodus + Leiste | ✓ | – | ✓ | – | ✓ | ✓ | – | ✓ | ✓ | – | ✓ |
| PLP Türsprechanlagen, Filter-Sheet, Leiste | ✓ | – | ✓ | – | – | – | – | – | – | – | – |
| Merkliste-Drawer (PLP + PDP) | ✓ (×568) | – | ✓ | – | – | – | ✓ | – | – | – | – |
| PDP Merken | ✓ | – | ✓ | – | – | – | – | – | – | – | – |

Zusätzlich wurde mit 200 % Schriftgröße am Desktop (Wurzel-Schriftgröße 200 % bei 1280 px, also ein Härtetest) und mit Reflow bei 320 CSS-px (WCAG 1.4.10) geprüft.

**Methode:** Alles wurde gemessen statt nach Augenmaß beurteilt, mit einem eingebundenen Prüfskript. Geprüft wurde:
- `scrollWidth` gegen `innerWidth`, für die Seite und den Scrollbereich des Overlays
- Elemente, die über den Viewport hinausragen
- Ausrichtung der Kopfzeilen über alle Spalten (Foto, Name + Sterne, Preis, CTA)
- die Regel `is-tight` (Spalte < 20 rem)
- die Ausrichtung der Fixleiste am Tabellenraster
- Bedienflächen < 2,75 rem und Schrift < 12 px
- die Position der Toggletips

Endstand: In allen Szenarien und Breiten **0 Abweichungen**. Es gibt keinen horizontalen Scroll, die Kopfzeilen sind auf 0 px genau ausgerichtet, die Sterne stehen regelkonform, die Fixleiste ist spaltengenau, und alle Ziele sind ≥ 2,75 rem groß.

## Befunde

| # | Bereich | Breite | Problem | Fix | Verifiziert |
|---|---|---|---|---|---|
| 1 | Vergleich · Toggletips | < 48 rem | Eine spätere `.rh__w`-Regel hob die Handy-Regel auf. Dadurch waren die (i)-Tipps **24 px breit und bis 3 000 px hoch**. Sie waren unlesbar und erzeugten am Ende der Seite ~1 900 px leere Scrollfläche. | Die tote Regel ist entfernt. Breite jetzt `min(17rem, 100vw − 2rem)`. Neue JS-Funktion `placeTip()`: Sie setzt jeden Tipp vor dem Anzeigen (Hover, Fokus, Tap) und nach jedem Rendern bzw. Resize so, dass er 1 rem Abstand zu beiden Viewport-Rändern hält. | ja (9/9 Tipps bei 320, 768, 1280 innerhalb) |
| 2 | Vergleich · Gemeinsamkeiten-Raster | 768 | Der Tipp in der rechten Rasterspalte ragte 47 px über den Viewport und wurde abgeschnitten. | wie #1 | ja |
| 3 | Vergleich · Neu-Layout | alle | Spaltenzahl, `is-tight`, Fixleiste und Leiste wurden nur beim `resize`-Event neu berechnet. Kam das Event verspätet oder gar nicht (Split-View, Scrollbar erscheint), blieb der Desktop-Zustand stehen: Sterne neben dem Titel bei 124 px breiten Spalten und Fixleisten-Spalten von 544 px (`scrollWidth` +1 041 px bei 320). | Zusätzlich ein `ResizeObserver` auf den Scrollbereich: Er reagiert nur auf Breitenänderungen, höchstens einmal pro Frame, und nie beim Scrollen. | ja |
| 4 | Vergleich · Fixleiste | < 48 rem | Die Spalten der Fixleiste lagen ab der 2. Spalte 6 px versetzt zur Tabelle, weil der rechte Innenabstand des grauen Bands fehlte. | `placePin()` übernimmt den rechten Einzug ebenfalls. | ja (Abweichung 0 px) |
| 5 | Vergleich · Produktkopf | < 48 rem | Der Innenabstand der Labelspalte (`tr>:first-child`) griff im Kopf: 12 px Lücke zwischen Name und Sternen, je 24 px unter dem Foto und unter dem CTA. | Kopfzellen auf Handys ohne Innenabstand unten | ja (Kopf 306 → 248 px bei 375) |
| 6 | Vergleich · Preisdifferenz-Zeile | < 48 rem | Die reservierte Zeile blieb auch dann leer, wenn alle Preise gleich waren. | `.no-gap` am Table, wenn kein Modell eine Differenz hat. Die Zeile entfällt dann nur auf Handys; zum Ausrichten bleibt sie, sobald irgendein Modell (auch ein ausgeblendetes) eine Differenz hat. | ja |
| 7 | Vergleich · Spaltenwahl | < 64 rem | Bei langen Namen stand das ⌄ am Spaltenrand neben der Nachbarspalte, sodass unklar war, zu welchem Modell es gehört. | Das ⌄ folgt jetzt inline dem letzten Wort des Namens. | ja (4 px Abstand zum Namen) |
| 8 | Vergleich · Abmessungen | < 48 rem | Umbrüche wie „T 10,5 / cm“ oder „T / k. A.“ | geschützte Leerzeichen zwischen Achse, Wert und Einheit | ja |
| 9 | Vergleich · kurze Querformate | 812×375 | Leiste (60) + Fixleiste (64) belegten ein Drittel der Höhe. | Bei `max-height: 30rem` nehmen Leiste und Fixleiste je 3 rem ein; die Fixleiste zeigt dann kein Bild und keinen Preis. Die Höhe der Fixleiste bleibt konstant. | ja (Leiste 48 px) |
| 10 | Vergleich · 200 % Text | 1280 | Preis, Sternzahl und CTA (`nowrap`) liefen in die Nachbarspalte; `scrollWidth` +108. | Preis und UVP dürfen umbrechen, ebenso Sternzahl und CTA (mit deutscher Silbentrennung). Bei normaler Schrift bleibt alles einzeilig. | ja |
| 11 | PLP · Filter-Sheet | < 1024 px | **Filter unter dem ersten Bildschirm waren nicht erreichbar.** Die Desktop-Regel `align-self:start` gilt in aktuellem Chromium auch für das `position:fixed`-Sheet. Es wurde dadurch 2 363 px hoch (bei 568 px Viewport) und konnte nicht scrollen. | `align-self: stretch` + `max-height: 100dvh` | ja (Sheet = Viewporthöhe bei 320/375/414/768) |
| 12 | PLP · Bedienflächen | < 768 / < 1024 px | „Filter“-Button 34 px, Sheet-× 36 px | 2,75 rem | ja |
| 13 | PLP · Vergleichsleiste | alle | Der Platz für die Leiste (`body` padding-bottom, `--vgl-tray-h`) wurde nur beim Ändern der Auswahl gemessen. Nach Drehen oder Textzoom war er veraltet: 160 px Platz für 123 px Leiste, oder die letzte Kartenreihe lag unter der Leiste. | `trayPad()` und ein `ResizeObserver` auf die Leiste; gemessen in rem relativ zur aktuellen Wurzel-Schriftgröße | ja (Code und Messung bei Auswahländerung) |
| 14 | PLP · Vergleichsleiste | < 48 rem | Hinweistext 11 px, unter der DS-Caption | `--text-caption` (12 px) | ja |
| 15 | PLP · Toolbar im Modus | 375–414 | „Vergleich anzeigen (n)“ und „Vergleich beenden“ standen auf zwei Zeilen (96 px). | Auf Handys „Beenden“ (aria-label „Vergleich beenden“) | ja (eine Zeile ab 375, zwei Zeilen bei 320) |
| 16 | Merkliste · Footer | < 48 rem | Der fixierte Footer war höher als die Liste (320×568: Footer 223 px, Liste 220 px, nur eine Zeile sichtbar). | Siehe Mobile UX M7 | ja (Footer 121 px, Liste 322 px) |
| 17 | Merkliste · Kopf | < 360 px | „Merkliste (4)“ brach in zwei Zeilen. | „Leeren“ statt „Merkliste leeren“ unter 22,5 rem (aria-label bleibt vollständig) | ja |

Ohne Befund geprüft:
- grauer Kopf-Band bis zu beiden Rändern, ohne Überdeckung
- Gemeinsamkeiten zu- und aufgeklappt
- Spaltenwahl-Sheet und Hinzufügen-Sheet auf Handys (≤ 2 Spalten < 48 rem, ≤ 3 bei 48–64 rem)
- Toasts innerhalb des Viewports
- PLP-Raster (2 Spalten < 1024, 3 Spalten ab 1280)
- Karten-Lesezeichen und Vergleichsfeld (44 px)
- PDP-Merken (36 px sichtbar, 48 px Trefferfläche, Fotos | 3D unverändert)
- Drawer im Querformat (`is-flow`)

## Mobile UX (Entscheidungen)

| # | Entscheidung | Begründung | Vorher → nachher |
|---|---|---|---|
| M1 | Eine Zeile auf dem grauen Band über den Fotos: „**2 von 3 Modellen sichtbar** – zum Wechseln den Namen antippen.“ + „+ Hinzufügen“ | Die Labelspalte mit dem Hinzufügen-Feld gibt es auf Handys nicht. „Modell hinzufügen“ war nur ganz unten in der Aktionszeile erreichbar (bei 3 000 px Seitenlänge), und wie man Spalten wechselt, zeigten nur „1 / 3“ und ⌄. | Hinzufügen: Seitenende → erste Zeile; Kopf inkl. Zeile 296 px statt 306 px (375, 3 Modelle) |
| M2 | Bei 4/4 Modellen (Tablet, 3 sichtbar) nennt das Labelfeld „3 sind sichtbar – zum Wechseln den Namen wählen.“ | gleiche Erklärung auch auf dem Tablet | – |
| M3 | ⌄ direkt am Namen | Die Zuordnung zur Spalte ist eindeutig, das Muster entspricht der bekannten Dropdown-Konvention. | Abstand zum Namen 4 px |
| M4 | Lesereihenfolge Foto → Name → Sterne → Preis → CTA ohne Leerzeilen | Die unnötige Höhe (12 px + 24 px + leere Preisdifferenz-Zeile) trennte zusammengehörige Angaben. | Kopf −58 px |
| M5 | „Ähnliche Modelle“ als Liste (Foto 5 rem links, Gründe und Preis rechts) statt 2er-Raster; **kein** Karussell | Bei 3 Modellen blieb eine verwaiste dritte Karte. Ein horizontales Karussell versteckt Inhalte und verstößt gegen den Geist von 1.4.10. Die Zeilen lesen sich wie die Merkliste. | 2 × 266 px Höhe → 3 × 145 px, nichts verdeckt |
| M6 | Toggletips immer im Viewport, 288 px breit bei 320 | lesbar, schließbar (erneut tippen, Escape) | 24 → 272–288 px Breite |
| M7 | Merkliste: Der Speicherhinweis steht auf Handys am Listenende statt im fixierten Footer. „Wählen Sie mindestens 2 …“ steht neben „Alle n auswählen“. | Der fixierte Bereich enthält nur, was zum Handeln nötig ist (Auswahl + CTA). Der Hinweis bleibt vollständig erhalten und erscheint bei leerer Liste nicht doppelt. | Footer 223 → 121 px, Liste 220 → 322 px |
| M8 | Toolbar „Beenden“ auf Handys | Beide Aktionen passen in eine Daumenzeile. | 96 → 44 px ab 375 |
| M9 | Filter-Sheet scrollt wieder bis zur letzten Facette, Einstieg mit 44 px | Ohne diesen Fix war Filtern auf Handys nur teilweise möglich. | Sheet 2 363 → 568 px (scrollbar) |
| M10 | Fixleiste auf Handys unverändert (Name + CTA, 3,5 rem, ohne Bild) | Sie bleibt nützlich, weil der CTA jederzeit erreichbar ist. Mit 56 px von 844 px verdeckt sie wenig; die Höhe bleibt konstant. | Spaltenversatz 6 → 0 px |
| M11 | Kurze Querformate: Leiste und Fixleiste kompakt | Mehr sichtbare Tabellenzeilen bei 375 px Höhe | 124 → 96 px Chrome |

## Nicht behoben (mit Grund)

- **PLP-Karten-Typografie 10–11 px** (UVP/„ab“ `clamp(10px…)`, System-Pill 11 px): Das ist bewusst live-shop-gleich gestaltet. Eine größere Schrift würde die einzeilige Preiszeile in 130 px breiten Karten bei 320 px zum Umbrechen oder Abschneiden bringen. Das ist eine Designentscheidung für die PLP-Abstimmung.
- **„+N weitere“ (56×18 px) und Karussell-Pfeile (34 px) auf Handys**: Das sind PLP-Gestaltungsvorgaben; die Leiste ist zusätzlich wischbar. Eine Vergrößerung würde die schmalen Kacheln verdecken. Empfehlung: für die PLP-Abstimmung.
- **Filter-Sheet ohne „n Artikel anzeigen“-Abschluss**: Die Filterung wirkt sofort; geschlossen wird über × oder den Hintergrund. Ein Abschluss-CTA wäre eine PLP-Funktionsänderung (Logik in `sprechanlage.js`/`plp.js`). Das ist als Empfehlung notiert.
- **Toast über dem Hinzufügen-Sheet** (nur direkt nach dem Öffnen per Link, ≤ 6 s): Der Toast ist vorübergehend und bedienbar. Eine Stapellogik für Toasts und Sheets ist nicht gebaut.
- **Sehr lange Shop-Namen** (z. B. Siebert + VDM10, 6 Zeilen bei 320): Sie werden vollständig angezeigt. Kürzen würde gegen „Text nie abschneiden“ verstoßen; eine Namenspflege gehört in die Daten (JTL).
- **200 % per Wurzel-Schriftgröße bei 1280**: Das ist ein Härtetest. Echter Browser-Zoom auf 200 % ergibt 640 CSS-px und damit das Handy-Layout (geprüft); echte Benutzer-Schriftgrößen verschieben die rem-Breakpoints mit. Sterne (5 × 1,125 rem) können dann in den 2-rem-Zwischenraum ragen, überdecken aber keinen Text.
- **Prüfgrenze**: Im verborgenen Browser-Bereich liefen `IntersectionObserver`, `ResizeObserver` und `requestAnimationFrame` nicht. Deshalb wurde Resize per Event ausgelöst und `is-pinned` gesetzt, um die Fixleiste zu messen. Auf Geräten laufen beide Wege.

## Geänderte Dateien (Version B)

| Datei | Änderung | neues `?v=` |
|---|---|---|
| `vergleichen.js` | ResizeObserver-Relayout, `placeTip(s)`, Fixleiste rechter Einzug, `trayPad` + ResizeObserver, Mobilzeile `.vgl-mbar`, `.no-gap`, Abmessungen mit geschützten Leerzeichen, „Beenden“, Labelfeld-Hinweis | 47 (index, briefkasten) |
| `vergleichen.css` | Tote Handy-Tip-Regel entfernt, Tip-Breite gedeckelt, Block „14 · Responsive-Audit“ | 63 (index, briefkasten) |
| `plp.css` | Block „14 · Responsive-Audit“ (Filter-Sheet, Bedienflächen) | 263 (index, briefkasten) |
| `merkliste.js` | `placeHint()`, „Leeren“-Kurzlabel, Resize misst den Footer neu | 19 (index, briefkasten, pdp) |
| `merkliste.css` | Block „16 · Responsive-Audit“ | 17 (index, briefkasten, pdp) |

**Nachtrag 17.11.2026:** Für das Responsive-Verhalten gilt jetzt vollständig der PLP-Prototyp (https://sabavafa.github.io/product-listing-page/). Die sichtbaren Änderungen dieses Audits in `plp.css` (44-px-Flächen für „Filter“ und Schließen, 12-px-Textwerte aus Teil 2) sind zurückgenommen; behalten sind nur Korrekturen ohne sichtbare Wirkung (scrollbares Filter-Sheet, Tab-Reihenfolge, unsichtbare Tippflächen). Details: `09_Adaption_Umsetzung.md` §38.
