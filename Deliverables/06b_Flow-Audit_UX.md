# 06b — Flow-Audit UX: Merkliste + Vergleichen (Version B)

Datum: 2026-10-30 · Rolle: Lead UX Design · Scope: `Deliverables/vergleichen-flow-B/` (index.html = Türsprechanlagen, briefkasten.html = Briefkästen; `vergleichen.js/css`, `merkliste.js/css` über dem PLP-Prototyp)
Methode: End-to-end-Begehung des laufenden Prototyps (http://127.0.0.1:8821, beide Lenses) bei 1440 × 900 und 375 × 812, Tastatur-only (Tab / Shift+Tab / Enter / Space / Escape), DOM-/ARIA-Inspektion, Messung von Trefferflächen und Kontrasten, Lesen aller Quelldateien sowie 03/04/05. Standing decisions des Kunden (versteckte Karten-Checkboxen bis „Vergleichen", teal-100-Button, Berater über dem Grid, zentrierte CTAs, nackte Lesezeichen-Glyphe, feste Höhe des Sticky-Headers, Cap 4 / eine Kategorie, Merkliste gerätelokal mit Limit 50) wurden nicht in Frage gestellt. Bewusst zurückgestellte P1-Themen (Account-Merge, Link teilen, PDF, PDP „Konfiguration merken") sind hier nicht erneut aufgeführt.

Hinweis zur Testumgebung: Die Testtabs liefen auf `http://localhost:8821` (eigener `localStorage`-Origin), damit die Begehung nicht mit dem parallel laufenden Audit auf 127.0.0.1 kollidiert. Alle Befunde wurden gegen den Quellcode gegengeprüft.

---

## 1 · Summary

- **Urteil:** Der Flow ist fachlich richtig gedacht (Merken ≠ Vergleichen, Cap, Kategorie-Guard, Undo, Twin-State) und in den Grundzügen barrierefrei. Was fehlt, ist der letzte Schliff auf Interaktionsebene: drei echte Tastatur-/Fokus-Brüche, zu kleine Trefferflächen, ein CSS-Fehler, der die gesamte Button-Typografie der Add-ons neutralisiert, und ein Vergleichskopf, der auf dem Smartphone zwei Drittel des Bildschirms blockiert.
- **Win 1 — Typografie reparieren (UX-01):** Die `font:`-Kurzschrift mit `inherit` als Familie ist ungültig und wird komplett verworfen; alle Vergleichs- und Merklisten-Buttons, Chips und Links rendern mit 16 px / 400 statt 14 px / 600. Eine S-Änderung, die das Erscheinungsbild beider Add-ons auf das Design-System zurückholt.
- **Win 2 — Fokus und Undo schließen (UX-02/03):** „Rückgängig" ist bei offener Merkliste per Tastatur unerreichbar (Fokusfalle), und nach dem Entfernen einer Vergleichsspalte landet der Fokus im `body`. Beides verletzt WCAG 2.1.1 / 2.4.3 und ist in einem Nachmittag behoben.
- **Win 3 — Vergleichskopf und Mobile-Lesefluss (UX-04 bis 07):** 414–506 px Sticky-Header am Desktop, 472–489 px auf dem Phone (65 % der Scrollfläche), Chips in fünf Zeilen, erste Merkmalszeile unterhalb der Falz — der Vergleich beginnt erst nach dem Scrollen. „Auf einen Blick" aus dem Sticky-Bereich in eine erste Tabellenzeile verlagern, mobile Hero-Höhe korrigieren, Chips einzeilig scrollen.

---

## 2 · Was bleibt

- Zwei Werkzeuge, zwei Formen: Lesezeichen (persistent, immer sichtbar, Media-Ecke) vs. Checkbox „Vergleichen" (Modus, Footer, Cap 4). Die Trennung ist auf jeder Karte, in der Merkliste und im Overlay konsistent.
- Merken-Feedback: `aria-pressed`, gefülltes Glyph, Badge-Puls, Live-Region („Gemerkt: … Merkliste: n Artikel"), Toast mit genau einer Aktion, 5 s, pausierbar. Reload stellt alles wieder her; Storage-Event synchronisiert Tabs.
- Merkliste-Drawer: `role="dialog" aria-modal`, Fokus auf den Titel, Tab-Wrap, Escape schließt nur den Drawer (nicht den Vergleich darunter), Fokus kehrt zum Öffner zurück. Inline-Bestätigung für „Alle entfernen", Rückgängig für Einzel- und Gesamtlöschung, Fokus wandert nach dem Entfernen zur nächsten Zeile.
- Übergabe Merkliste → Vergleich: Kategorie-Lock mit Hinweis, Cap-Toast bei der 5. Auswahl, gleiche Lens → Overlay sofort, andere Lens → `?vergleich=…&von=merkliste` mit Ankunfts-Toast. Nach dem Schließen ist der Kunde im normalen Vergleichsmodus mit Tray.
- Vergleich: Summary-Strip mit Verdict und Sprungmarken, „Nur Unterschiede" automatisch ab 60 % Ähnlichkeit, neutrale Preis-Differenz statt „Bestwert" beim Preis, Set-Zeilen mit „zusätzlich / ohne", Twin-State mit Wertaussage und Alternativen, Kombi-Set-Guard unterdrückt die Preis-Differenz, Modell-zuerst-Namen, CTAs „Konfigurieren / Zum Produkt" (kein Warenkorb), Caption der Tabelle, Escape schließt, Fokus zurück zum Öffner.
- Limit 50: Unselektierte Lesezeichen werden `aria-disabled`, Toast + Live-Region, Titel „(50 / 50)", gemerkte Lesezeichen lassen sich weiter abwählen.
- Reduced Motion und Print sind vorgesehen; Kontraste der Kernfarben (`--text-muted` 5,7:1, teal auf teal-100 7,9:1, teal-mint auf schwarz 10:1) bestehen.

---

## 3 · Findings (nach Impact)

Format: Flow-Schritt / Zustand · Problem · Evidenz · Empfehlung · Aufwand (S / M / L). **„Umsetzen jetzt"** = Top 10.

### UX-01 · Ungültige `font`-Kurzschrift neutralisiert die gesamte Button-Typografie — **Umsetzen jetzt**
- **Flow / Zustand:** Alle Zustände beider Add-ons (Toolbar „Vergleichen", Tray-CTA, Chips, „Nur Unterschiede", „Drucken", „Alle entfernen", „Abbrechen", Merkliste-CTA, „Alle entfernen", „Ja, entfernen", Tour-Buttons).
- **Problem:** Buttons und Links wirken schwerer, größer und weniger „premium" als spezifiziert; Gewichtungen (600/700) fehlen, Größen weichen vom DS ab.
- **Evidenz:** `vergleichen.css` / `merkliste.css` setzen z. B. `.vgl-bar-btn{font:600 var(--text-body-sm,.875rem)/1 inherit}`. `inherit` ist innerhalb der `font`-Kurzschrift kein gültiger Familienwert → die gesamte Deklaration wird verworfen. Computed: `.vgl-bar-btn`, `.vgl-tray__cta`, `.vgl-chip`, `.vgl-link`, `.vgl-cancel`, `.mkl-cta`, `.mkl-link`, `.vgl-tourfab`: **16 px / 400**; `.mkl-btn`, `.vgl-alt__add`: 400 statt 600. `CSSStyleRule.style.fontWeight === ""` bestätigt den Drop.
- **Empfehlung:** Kurzschrift auflösen: `font-family:inherit; font-size:var(--text-body-sm); font-weight:600; line-height:1`. Betroffene Selektoren: `.vgl-bar-btn, .vgl-cancel, .vgl-link, .vgl-tray__cta, .vgl-chip, .vgl-more, .vgl-add, .vgl-alt__add, .vgl-coach__btn, .vgl-coach__x, .vgl-coach__step, .vgl-tourfab, .vgl-i::after, .mkl-link, .mkl-btn, .mkl-cta, .mkl-toast__act`.
- **Aufwand:** S.

### UX-02 · „Rückgängig" ist bei offener Merkliste per Tastatur unerreichbar und liegt optisch außerhalb des Drawers — **Umsetzen jetzt**
- **Flow / Zustand:** Merkliste → Entfernen (Zeile oder „Alle entfernen") → Toast „Aus der Merkliste entfernt · Rückgängig".
- **Problem:** Tastatur- und Screenreader-Nutzer können die Löschung nicht zurücknehmen; Mausnutzer müssen den Blick vom Drawer (rechts) in den abgedunkelten Scrim (Mitte) wechseln.
- **Evidenz:** Tastenfolge Tab… → `button.mkl-rm` → Space: Zeile verschwindet, Toast erscheint bei x 560–879 (Viewport-Mitte), Drawer beginnt bei x 992. `focusables()` in `merkliste.js` sammelt nur `drawer.querySelectorAll(...)`; der Toast (`.mkl-toast`, `z 970`) liegt außerhalb → Tab-Wrap überspringt ihn. Nach Klick auf „Rückgängig": `document.activeElement === body` (Fokus verloren).
- **Empfehlung:** (a) Bei offenem Drawer den Toast **innerhalb** des Drawers über dem Footer rendern (`.mkl-foot` bekommt einen Slot `.mkl-foot__undo`) und in `focusables()` aufnehmen. (b) Alternativ/zusätzlich: Inline-Undo-Zeile an der Stelle der entfernten Zeile („VDM10 2.0 entfernt · **Rückgängig**", 5 s), Fokus wandert auf „Rückgängig". (c) Nach Undo Fokus auf die wiederhergestellte Zeile (`.mkl-rm` der Zeile) setzen, Live-Region „Wiederhergestellt: {Modell}".
- **Aufwand:** S.

### UX-03 · Fokusverlust im Vergleich: Spalte entfernen, „Modell hinzufügen" und Toast-Undo werfen den Fokus auf `body` — **Umsetzen jetzt**
- **Flow / Zustand:** Vergleich → Kopfzeile „×" (Enter) · Alternativen „Zum Vergleich" · Undo-Toast.
- **Problem:** Nach dem Entfernen einer Spalte ist der Fokus im Dialog weg; Screenreader erhalten keine Rückmeldung (kein Live-Region im Overlay). Bei 2 → 1 Modellen schließt sich der Dialog kommentarlos.
- **Evidenz:** Fokus auf `button.vgl-ph__rm`, Enter → `renderView()` ersetzt `viewBody.innerHTML` → `activeElement = BODY.plp sprech vgl-mode`, Dialog bleibt offen, `view.querySelector('[aria-live]') === null`. Gleicher Mechanismus bei Chip-Klick, „Zum Vergleich" und Details-Toggle (Fokus bleibt nur, weil der Button nicht im `viewBody` liegt).
- **Empfehlung:** Nach jedem `renderView()` den Fokus bewusst setzen: nach Entfernen auf das „×" der nächsten Spalte, sonst auf den Dialog-Titel (`tabindex="-1"`); nach „Zum Vergleich" auf das „×" der neuen Spalte. Eine `aria-live="polite"`-Region im Overlay: „{Modell} entfernt. Vergleich mit n Modellen." / „{Modell} hinzugefügt." Beim Fall 2 → 1: Overlay nicht schließen, sondern Leerzustand „Mindestens zwei Modelle wählen" mit Fokus auf „Modell hinzufügen".
- **Aufwand:** S.

### UX-04 · Der feste Sticky-Kopf blockiert die Hälfte des Desktops und zwei Drittel des Phones — **Umsetzen jetzt**
- **Flow / Zustand:** Vergleich, 2–4 Modelle, beide Lenses; Twin-State verschärft (Hero 200/220 px).
- **Problem:** Der eigentliche Vergleich (Merkmalszeilen) beginnt erst nach dem Scrollen; beim Scrollen bleiben am Desktop ~450 px, am Phone 255 px für Zeilen übrig. Auf dem Phone liegt die erste Zeile außerhalb des Viewports.
- **Evidenz:** 1440 × 900: `thead` 414 px (2 Modelle), 447 px (4), 469 px (Twin Sprechanlagen), 506 px (Twin Briefkästen); erste Datenzeile bei y 631. 375 × 812: `thead` 472–489 px, Scrollfläche 727 px, erste Datenzeile bei **y 900** (> 812); nach `scrollTop = 600` bleiben 255 px sichtbar. Kopf = Hero + 2-zeiliger Name + Qualifier + Preis/UVP + bis zu 3 Highlights + 74 px CTA-Reserve.
- **Empfehlung (innerhalb der Entscheidung „feste Höhe"):** Die Höhe fest, aber kleiner. (a) „Auf einen Blick" aus dem `thead` in eine **erste, nicht-sticky Tabellenzeile** „Auf einen Blick" (`tr.vgl-glance`) verschieben — der Inhalt bleibt, der Kopf schrumpft um ~90 px. (b) Hero 124 → 96 px Desktop, 84 px Mobile (siehe UX-05); Twin-Hero 200/220 → 160 px, auf dem Phone kein Twin-Zuschlag. (c) UVP-Zeile nur bei vorhandener UVP (keine `&nbsp;`-Platzhalter). Ziel: ≤ 260 px Desktop, ≤ 200 px Phone.
- **Aufwand:** M.

### UX-05 · Mobile-Hero der Briefkästen-Lens ist 170 px statt 84 px (CSS-Reihenfolge)
- **Flow / Zustand:** briefkasten.html, Vergleich auf dem Phone.
- **Evidenz:** `.vgl-view.lens-briefkasten .vgl-ph__media{height:170px}` (Z. 343) steht **nach** `@media(max-width:768px){.vgl-ph__media{height:84px}}` (Z. 366) und hat höhere Spezifität → gemessen `mediaH: 170` bei 375 px.
- **Empfehlung:** Lens-Regeln in den Mobile-Block spiegeln: `@media(max-width:768px){.vgl-view.lens-briefkasten .vgl-ph__media,.vgl-view.lens-briefkasten.is-twin .vgl-ph__media{height:84px}}`.
- **Aufwand:** S.

### UX-06 · Summary-Chips auf dem Phone: fünf Zeilen, „+n weitere" ist tot — **Umsetzen jetzt**
- **Flow / Zustand:** Vergleich mobil, ≥ 6 Unterschiede; Desktop mit > 8 Unterschieden.
- **Problem:** 258 px Summary-Box schieben den Produktkopf auf y 386 und die erste Zeile auf y 900; „+3 weitere" sieht wie ein Chip aus, tut aber nichts — die restlichen Unterschiede sind vom Strip aus nicht erreichbar.
- **Evidenz:** `.vgl-sum` 258 × 351 px bei 375 px; `.vgl-chip--more` ist ein `<span>` mit `cursor:default`. Desktop 4 Modelle: „+5 weitere" verdeckt u. a. „Schutzart".
- **Empfehlung:** Mobil: Chips in einer **horizontal scrollenden Zeile** (`overflow-x:auto; scroll-snap-type:x mandatory; flex-wrap:nowrap`, rechter Fade als Scroll-Hinweis). „+n weitere" → echter Button `aria-expanded`, klappt alle Chips auf („Alle n Unterschiede"). Verdict-Zeile bleibt oben, Guard-Hinweise darunter.
- **Aufwand:** S–M.

### UX-07 · Twin-State: die eigentliche Entscheidungshilfe liegt unter der Falz, die Spaltentitel sind identisch, die Farb-Differenz ist unsichtbar — **Umsetzen jetzt**
- **Flow / Zustand:** `briefkasten.html?vergleich=ebenhard,ebenhard-v2a` (Twin), `index.html` Colson vs. Neo (Twin).
- **Problem:** Der Kunde sieht einen riesigen Kopf, eine 3-Zeilen-Tabelle und muss scrollen, um „Was der Aufpreis bringt" und „Alternativen mit echtem Unterschied" zu erreichen. Beide Spalten heißen „Ebenhard"; der Unterschied steckt im 12-px-Qualifier mit Ellipse. Der Chip „Farben" verspricht einen Unterschied, die Zeile zeigt nur Swatches, und beide Köpfe sagen „7 Farben". „+ 29,01 € … dafür: Namensschild-Material: Edelstahl V2A gebürstet statt Edelstahl V4A gebürstet" liest sich als Gewinn, ist aber eine neutrale (eher schwächere) Abweichung.
- **Evidenz:** `.vgl-twin` top = 973 px (Briefkästen) / 932 px (Sprechanlagen) bei 900 px Viewport; `thead` 506 / 469 px; `vgl-ph__name` = „Ebenhard" / „Ebenhard"; Zeile `data-key="colors"` innerText leer (nur `swHTML`); Highlights „7 Farben" in beiden Spalten; `gains()` erzeugt für nicht-gerankte Zeilen „{label}: a statt b" unter „dafür:".
- **Empfehlung:** (a) Im Twin-State Reihenfolge `vgl-sum → vgl-twin → vgl-wrap → aftertable` (Wertaussage direkt unter dem Verdict). (b) Wenn `shortName().main` in zwei Spalten gleich ist, den Qualifier in den Titel heben: „Ebenhard **mit V2A-Front**" / „Ebenhard **mit austauschbarem Namensschild**" (Qualifier-Diff via `setDiff` auf Titel-Tokens). (c) Farben-Zelle immer mit Text: Swatches + „zusätzlich: Eisenglimmer, Wunschfarbe · ohne: Braun" (die Funktion `colorDiff` existiert bereits); Highlight nur bei **mehr** Farben als jedes andere Modell, Text „+2 Farben (Eisenglimmer, Wunschfarbe)". (d) `gains()`: nicht-gerankte, nicht-boolesche Zeilen nicht unter „dafür:" führen, sondern als „Unterschied: Namensschild-Material V2A statt V4A" in einem eigenen, neutralen Satz.
- **Aufwand:** M.

### UX-08 · Karten-Checkbox „Vergleichen" ist 21 px hoch; bei erreichtem Cap passiert beim Tippen nichts — **Umsetzen jetzt**
- **Flow / Zustand:** PLP im Vergleichsmodus, Desktop und Phone; 4 Modelle markiert, Tipp auf eine 5. Karte.
- **Problem:** Trefferfläche weit unter 2,75 rem; am Phone (Kartenbreite 157 px) schwer zu treffen. Am Cap ist das Feld `disabled` → kein Toast, kein Hinweis auf der Karte (nur die Tray-Zeile, die mobil ausgeblendet ist, s. UX-21).
- **Evidenz:** `.vgl-toggle` 240 × **21 px** (Desktop), 132 × 21 px (Phone), `.vgl-box` 18 px; 5. Klick: `vgl-toast` bleibt leer, `selected.length === 4` unverändert.
- **Empfehlung:** Label zur vollen Kartenbreite mit `min-height:2.75rem`, Box 1,25 rem, Checked-State auch als Kartenrahmen (bereits `is-vgl`). Am Cap: nicht `disabled`, sondern `aria-disabled="true"` + Klick-Handler mit Cap-Toast („Maximal 4 Modelle gleichzeitig — bitte zuerst eines entfernen.", wie im Drawer) und sichtbarem Mini-Hinweis unter dem Label „Maximum erreicht".
- **Aufwand:** S.

### UX-09 · Trefferflächen unter 2,75 rem im Vergleich und Tray — **Umsetzen jetzt**
- **Flow / Zustand:** Vergleich (Desktop/Phone), Tray, Toolbar.
- **Evidenz (gemessen):** Sprungmarken-Chips **28 px**; (i)-Erklärung **18 × 18 px**; Spalten-„×" **26 × 26 px**; Tray-Slot-„×" **18 × 18 px**; Tray „Zurücksetzen" 26 px; Toolbar „Abbrechen" 26 px; Overlay-Close 36 px (Phone); „Nur Unterschiede"-Label 22 px; „Zum Vergleich" (Alternativen) 28 px; Drawer-Zeilen-CTA **36 px** (auch mobil, volle Breite).
- **Empfehlung:** Mindestens 2,75 rem Hit-Area (sichtbare Form darf kleiner bleiben, `::before` mit negativem Inset wie beim Lesezeichen): Chips `min-height:2.25rem` + `padding-block`, (i) 2.75 rem-Button um 1 rem-Glyph, Spalten-„×" 2.75 rem transparent um 1.625 rem Disc, Tray-„×" 2 rem Disc/2.75 rem Area, Textlinks `min-height:2.75rem`, Overlay-Close 2.75 rem, Zeilen-CTA 2.75 rem auf Touch (`@media (pointer:coarse)`).
- **Aufwand:** S–M.

### UX-10 · „Alle entfernen" bedeutet im Drawer und im Vergleich zwei verschiedene Dinge
- **Flow / Zustand:** Merkliste-Kopf („Alle entfernen" = Merkliste löschen, mit Bestätigung) vs. Vergleichs-Bar („Alle entfernen" = Vergleich leeren + schließen, ohne Bestätigung) vs. Tray („Zurücksetzen").
- **Problem:** Gleicher Wortlaut, unterschiedliche Tragweite (persistente Liste vs. Session-Auswahl); drei Begriffe für zwei Aktionen.
- **Evidenz:** `merkliste.js` `data-mkl="clear"`, `vergleichen.js` `data-vgl="clear"` → `clearAll(); closeView()`, Tray `data-vgl="reset"`.
- **Empfehlung:** Vergleich (Bar + Tray): **„Vergleich leeren"**; Merkliste: **„Merkliste leeren"** (statt „Alle entfernen"), Bestätigung „{n} Artikel aus der Merkliste entfernen?". Im Vergleich nach „Vergleich leeren" Toast „Vergleich geleert · Rückgängig" (5 s).
- **Aufwand:** S.

### UX-11 · „Abbrechen" löscht bis zu vier Auswahlen sofort und ohne Rückweg
- **Flow / Zustand:** Toolbar im Vergleichsmodus → „Abbrechen".
- **Evidenz:** `exitMode()` → `selected=[]; persist(); closeView()`, kein Toast, kein Undo; Button 26 px, Textlink-Optik neben einem 40-px-Button.
- **Empfehlung:** Label „Vergleich beenden"; wenn `selected.length ≥ 1`: Toast „Vergleich beendet — {n} Modelle verworfen · Rückgängig" (5 s, stellt Auswahl + Modus wieder her). Button als sekundärer Ghost-Button in Toolbar-Höhe.
- **Aufwand:** S.

### UX-12 · „Modell hinzufügen" setzt den Kunden an den Seitenanfang, die Karten liegen unter der Falz; die Merkliste wird als Quelle nicht angeboten
- **Flow / Zustand:** Vergleich → „Modell hinzufügen" (Spalte) → Overlay schließt.
- **Evidenz:** nach Klick `scrollY = 0`, `#productGrid.top = 671 px`, Fokus auf `button.mkl-hdr` (Header), Toast „Wählen Sie ein weiteres Modell über „Vergleichen" auf den Produktkarten — bis zu 4 gleichzeitig."; Drawer bleibt zu.
- **Empfehlung:** (a) `grid.scrollIntoView({block:'start'})` + Fokus auf die erste nicht markierte Karten-Checkbox. (b) Zweite Option im Add-Panel: „Aus der Merkliste wählen (n)" → öffnet den Drawer mit Lens-Filter, Checkbox-Klick ergänzt direkt den Vergleich (statt nur „Auswahl vergleichen"). (c) Toast kürzer: „Weiteres Modell auf einer Produktkarte markieren — noch {4−n} möglich."
- **Aufwand:** S (a, c) / M (b).

### UX-13 · Konfigurierter Merklisten-Eintrag: zwei Wege zum selben Ziel, kein Status-Marker, Doppel-Checkbox
- **Flow / Zustand:** `?merkliste=demo` → Drawer-Zeile „VDM10 2.0 … Gesamt 1.249,00 €".
- **Problem:** „Konfiguration öffnen" (Link) und „Konfigurieren" (CTA) zeigen auf dieselbe URL `#konfigurator?configId=…`; nichts sagt „das ist Ihre gespeicherte Konfiguration". Die Zeile und das Basismodell „colson1" teilen die Vergleichs-ID → Anhaken der einen hakt optisch beide an, zählt aber 1.
- **Evidenz:** `rowHTML()`: `ctaHref` und `cfglink` identisch; `cmpId = it.articleId` → zwei `input[data-id="colson1"]`; `syncCmp()` setzt beide `checked`.
- **Empfehlung:** Zeile mit Tag „Ihre Konfiguration · gespeichert am {Datum}" (teal-100-Pill), CTA **„Konfiguration öffnen"** (einziger Primär-CTA, Link entfällt), Sekundärlink „Neu konfigurieren". Vergleichs-Checkbox bei konfigurierten Einträgen ausblenden mit Hinweis „Vergleich auf Modellebene — siehe {Basismodell}", oder Basis- und Konfigurationszeile de-duplizieren.
- **Aufwand:** S.

### UX-14 · Gemischte Merkliste: flache Liste, vierfacher Hinweis, CTA verschweigt den Seitenwechsel
- **Flow / Zustand:** Türsprechanlagen + Briefkästen in einer Liste, erster Haken auf einem Briefkasten.
- **Evidenz:** keine Gruppierung (`groupHeadings: 0`), Reihenfolge = Reihenfolge des Merkens; nach dem Haken: 4 × „Vergleich nur innerhalb einer Kategorie" unter jeder gesperrten Zeile; CTA „Auswahl vergleichen (2)" navigiert ohne Ankündigung zu `briefkasten.html`; Live-Region bleibt leer.
- **Empfehlung:** Zeilen nach Kategorie gruppieren (`h3.mkl-group` „Türsprechanlagen (4)", „Briefkästen (2)"); der Lock-Hinweis einmal im Gruppenkopf („Vergleich nur innerhalb einer Kategorie — Auswahl läuft bei Briefkästen"). CTA mit Kategorie: **„2 Briefkästen vergleichen"**; bei Lens-Wechsel Live-Region „Öffnet den Vergleich auf der Seite Briefkästen". Optional: Sortierung „Zuletzt gemerkt / Preis".
- **Aufwand:** M.

### UX-15 · Deep-Link klebt: Reload öffnet den Vergleich erneut und wiederholt den Toast; falsche Lens wird still ignoriert
- **Flow / Zustand:** Ankunft über `?vergleich=a,b&von=merkliste`; Overlay schließen; F5. · `index.html?vergleich=siebert,ebenhard`.
- **Evidenz:** nach Schließen + Reload `viewReopenedOnReload: true`, Toast erneut „Vergleich mit 2 Modellen aus Ihrer Merkliste". Falsche Lens: `setSelection` filtert alles → `viewOpen:false`, keine Meldung.
- **Empfehlung:** Nach dem Konsumieren des Parameters `history.replaceState` auf die reine PLP-URL (Session-Auswahl trägt den Zustand). Falsche Lens: Toast „Diese Modelle gehören zur Kategorie {Lens} — Vergleich dort öffnen" mit Link, oder serverseitige Weiterleitung auf JTL.
- **Aufwand:** S.

### UX-16 · Modell-zuerst-Name versagt, wenn die Modellnummer am Titelende steht
- **Flow / Zustand:** SDM10X in Drawer, Tray-Label, Vergleichskopf.
- **Evidenz:** Titel „Türsprechanlage mit Kamera | Gesichtserkennung | … | SDM10X" → `main = "Türsprechanlage mit Kamera"`, `sub = "… · SDM10X"`; im Vergleich steht neben „VDM10 2.0 Video-Türsprechanlage" ein generisches „Türsprechanlage mit Kamera".
- **Empfehlung:** In `shortName()` ein Modell-Token (`/\b[A-Z]{2,4}\d{2,}[A-Z0-9.]*\b/`) suchen und voranstellen: „**SDM10X** Türsprechanlage mit Kamera"; Qualifier ohne das Token. Dieselbe Funktion in `merkliste.js` und `vergleichen.js` nutzen (heute zwei Kopien).
- **Aufwand:** S.

### UX-17 · (i)-Erklärungen: nur per CSS-Hover, nicht für Screenreader, Escape schließt den ganzen Dialog — **Umsetzen jetzt**
- **Flow / Zustand:** Vergleich, Zeilenkopf mit (i).
- **Evidenz:** `button.vgl-i[aria-label="Erklärung: Preis"][data-tip]`, Text nur in `::after{content:attr(data-tip)}`; kein `aria-describedby`, kein `aria-expanded`; Fokus-Indikator = Farbwechsel grau → teal (`outline:none`); Fokus auf (i) + Escape → `view.is-open === false`, Fokus auf Header. Ziel 18 × 18 px. Zusatzbefund: Tooltip-Titel der Preisdifferenz „Differenz zum **günstigsten** Modell" (verbotene Wortwahl).
- **Empfehlung:** Toggletip: Klick/Enter/Space öffnet `div[role=tooltip] id=tip-{key}`, Button `aria-expanded` + `aria-describedby`, Escape schließt **zuerst** den Tooltip (stopPropagation), Hover zeigt ihn weiterhin; Fokusring `outline:.1875rem solid var(--teal); outline-offset:.125rem`; 2.75 rem Hit-Area. Preis-Delta-Titel → „Differenz zum niedrigsten Preis im Vergleich".
- **Aufwand:** M.

### UX-18 · Kontrast: Grün für „Ja" und „BESTWERT" liegt bei 3,3:1 — **Umsetzen jetzt**
- **Flow / Zustand:** Vergleichstabelle (boolesche Zeilen, Bestwert-Pill, Tray-„Bereit"-Icon, Highlight-Punkte).
- **Evidenz:** `--green #009951` auf `--white` = **3,3:1**; `.vgl-yes` ist 14 px / 600 Text („Ja"), `.vgl-best` ist 10 px uppercase Weiß auf Grün (3,3:1). WCAG 1.4.3 verlangt 4,5:1.
- **Empfehlung:** Text „Ja" in `--schwarz` mit grünem Haken-Icon (Icon ≥ 3:1 reicht nach 1.4.11); „Bestwert" als Pill `--teal-100`/`--teal` (7,9:1) oder dunkleres Grün-Token `#00733D` (4,6:1) aus dem DS ergänzen. Nicht ausschließlich über Farbe kodieren (Haken + Text bleibt).
- **Aufwand:** S.

### UX-19 · Mikrocopy: Zahlformat, Wortwahl, Pointer-Inkonsistenz
- **Flow / Zustand:** Vergleich und Twin-State, beide Lenses.
- **Evidenz:** Preis im Vergleich „ab 1266,50 €" (ohne Tausenderpunkt, `euro()` in `vergleichen.js`) vs. „ab 1.266,50 €" auf Karte und in der Merkliste. Leer-Highlight „Keine Alleinstellung in den Kernmerkmalen". Wertaussage „— ohne technischen Mehrwert, reine Design-Entscheidung". Guard „wählen Sie diese auf der Produktseite" neben CTA „Konfigurieren" und Note „im Konfigurator". Verdict „11 von 20 Merkmalen unterscheiden sich." ohne Handlungshinweis. Dialogtitel „Vergleich (0)" im Leerzustand.
- **Empfehlung:** siehe Copy-Tabelle (Abschnitt 4). `euro()` aus `merkliste.js` (mit Gruppierung) in beiden Dateien verwenden. Pointer vereinheitlichen: „auf der Produktseite" nur, wenn der CTA „Zum Produkt" heißt, sonst „in der Konfiguration".
- **Aufwand:** S.

### UX-20 · Merken ist auf der Karte nur eine Glyphe ohne Wort, Tooltip oder Erstnutzer-Hinweis
- **Flow / Zustand:** PLP im Ruhezustand, Maus/Touch.
- **Evidenz:** `button.mkl-mark` ohne `title`; einziger Text „Merken" existiert im `aria-label`. Das Wort „Merkliste" erscheint erst im Header-Tooltip (`title="Merkliste"`). Im Leerzustand des Drawers wird das Symbol erklärt — dorthin kommt aber nur, wer das Header-Icon findet.
- **Empfehlung:** `title="Merken"` / `title="Gemerkt — aus der Merkliste entfernen"` (Hover-Tooltip für Maus), bei 0 Einträgen einmalig eine dezente Coach-Mark am ersten Lesezeichen („Modelle merken — sie bleiben auf diesem Gerät gespeichert", schließt bei Klick/Escape, `localStorage`-Flag). Nach dem ersten Merken Toast „Gemerkt · Zur Merkliste" beibehalten (gut).
- **Aufwand:** S.

### UX-21 · Mobile Tray ohne Status-Hinweis
- **Flow / Zustand:** Vergleichsmodus auf dem Phone, 1 / 4 Modelle markiert.
- **Evidenz:** `@media(max-width:768px){.vgl-tray__hint{display:none}}` → „Noch 1 Modell wählen" / „Maximum erreicht" fehlen; sichtbar nur „Vergleich (1) / max. 4" und ein grauer CTA ohne Begründung.
- **Empfehlung:** Hinweis mobil als zweite, kompakte Zeile (11–12 px) unter dem Label oder als Ersatztext im CTA („Noch 1 wählen" disabled → „Vergleichen" aktiv). `aria-live` bleibt.
- **Aufwand:** S.

### UX-22 · Mobile Detailgrößen: 11-px-Zeilenlabels, 36-px-CTAs, Bar in zwei Zeilen
- **Evidenz:** `.rh` mobil `font-size: 11px` (Gruppe `.6875rem` uppercase + Zeilenlabel), Spalte 112 px; Drawer-Zeilen-CTA 36 px hoch bei voller Breite; Overlay-Bar 85 px hoch (Titel/Close + Switch/„Alle entfernen").
- **Empfehlung:** Zeilenlabels mindestens 0.75 rem (12 px), Gruppenbänder dürfen 0.6875 rem bleiben; CTA 2.75 rem auf Touch; Bar: „Alle entfernen" in ein Overflow-Menü („…") verschieben, Switch allein in Zeile 2.
- **Aufwand:** S.

### UX-23 · Prototyp-Artefakte würden im Shop stören
- **Evidenz:** `button.vgl-tourfab` „Vergleichen-Flow ansehen" (fixed, bottom-left, `z 840`) verschwindet hinter dem Tray (`z 850`) und deckt auf dem Phone 241 × 40 px Inhalt ab; Link „Version B · Vergleich-Demo auch für …" unter dem Seitentitel; Toasts „(Prototyp)" bei CTA-Klick.
- **Empfehlung:** Tour und Lens-Link nur mit `?tour=1` rendern; im JTL-Build entfernen. Keine Änderung am Flow.
- **Aufwand:** S.

### UX-24 · „Alle entfernen"-Bestätigung fokussiert den destruktiven Button
- **Evidenz:** `[data-mkl="clear"]` → `confirmEl.hidden=false; …clear-yes.focus()`; Enter, Enter löscht die Liste (Undo existiert, mildert).
- **Empfehlung:** Fokus auf die Gruppe (`tabindex="-1"`, Live „3 Artikel entfernen? Ja, entfernen oder Abbrechen") oder auf „Abbrechen"; „Ja, entfernen" bleibt rot, aber nicht vorfokussiert.
- **Aufwand:** S.

### UX-25 · Drucken: Gemeinsamkeiten bleiben zugeklappt, Kopfdaten fehlen
- **Evidenz:** `printView()` öffnet nur die technischen Details; `<details class="vgl-common">` ist ohne `open`, wenn „Nur Unterschiede" aus ist → im Ausdruck fehlt die Liste; keine Datum/URL-Zeile; `.vgl-sum__chips` ausgeblendet (gut).
- **Empfehlung:** Vor `window.print()` `details.open = true` setzen (und danach zurück), Druckkopf „Vergleich {Lens} · edelstahl-tuerklingel.de · {Datum}" via `@media print` `::before`.
- **Aufwand:** S.

### UX-26 · Vergleichsdialog ohne Überschriftenstruktur
- **Evidenz:** `#vglTitle` ist ein `<span>`; im Overlay keine `h1–h4` außer den Twin-Boxen (`h3`); Summary, Tabelle und Gemeinsamkeiten sind für Screenreader nicht per Überschrift anspringbar.
- **Empfehlung:** Titel als `<h2>`, Summary `h3` „Auf einen Blick: n Unterschiede" (visuell wie heute), Tabellen-Caption sichtbar als `h3` „Merkmale", Gemeinsamkeiten-Summary als `h3`.
- **Aufwand:** S.

### UX-27 · Farben ohne Textalternative und in der falschen Gruppe
- **Evidenz:** Swatches `<span title style>` ohne Text (PLP `.pcard__sw`, Vergleich `.vgl-sw span`); Zeile „Farben" der Sprechanlagen-Lens steht unter „Bauform & Schutz".
- **Empfehlung:** Visually-hidden Liste der Farbnamen in der Zelle („Anthrazit, Schwarz, …") + sichtbare Diff (UX-07c); Zeile „Farben" in „Grundlagen" direkt nach „Namensschild" (wie in der Briefkästen-Lens).
- **Aufwand:** S.

### UX-28 · „n Farben" als Highlight auch bei weniger oder gleich vielen Farben
- **Evidenz:** Vossberg „2 Farben" vs. Ebenhard „7 Farben" — beide als Highlight; Ebenhard vs. Ebenhard V2A beide „7 Farben".
- **Empfehlung:** `highlights()`: Swatch-Zeile nur für das Modell mit der größten Farbanzahl und nur bei echtem Mehr, Text „+2 Farben (…)".
- **Aufwand:** S.

### UX-29 · Nach der Übergabe aus der Merkliste ist der Rückweg zur Merkliste weg
- **Evidenz:** Overlay schließen → PLP oben (`scrollY 0`), Tray offen, Karten unter der Falz; der Ankunfts-Toast ist nach 5 s weg; kein „Zurück zur Merkliste" im Overlay oder Tray.
- **Empfehlung:** Bei `von=merkliste` (oder Hook-Aufruf) im Overlay-Bar links einen Textbutton „← Merkliste" (öffnet den Drawer über dem Overlay, z-Index erlaubt das bereits) und beim Schließen des Overlays `grid.scrollIntoView`.
- **Aufwand:** S.

### UX-30 · Limit-Toast ohne Ausweg; Fremd-Tab-Änderungen bleiben stumm
- **Evidenz:** Limit-Toast „Ihre Merkliste ist voll (50) — bitte zuerst einen Artikel entfernen" ohne Aktion; `storage`-Event rendert den offenen Drawer neu, ohne Live-Meldung.
- **Empfehlung:** Toast-Aktion „Zur Merkliste"; Live-Region „Merkliste in einem anderen Tab geändert: n Artikel".
- **Aufwand:** S.

---

## 4 · Copy-Tabelle

| Ort | Aktuell | Vorschlag | Grund |
|---|---|---|---|
| Vergleich-Bar + Tray | „Alle entfernen" / „Zurücksetzen" | „Vergleich leeren" (beide) | Ein Begriff pro Aktion; Abgrenzung zur Merkliste (UX-10) |
| Merkliste-Kopf | „Alle entfernen" | „Merkliste leeren" | Tragweite (persistente Liste) benennen |
| Merkliste-Bestätigung | „3 Artikel entfernen?" | „3 Artikel aus der Merkliste entfernen?" | Kontext im Satz |
| Toolbar, Modus aktiv | „Abbrechen" | „Vergleich beenden" | „Abbrechen" klingt nach Formular; Aktion verwirft Auswahl (UX-11) |
| Toast nach Beenden | — | „Vergleich beendet — 3 Modelle verworfen · Rückgängig" | Undo-Parität mit der Merkliste |
| Drawer-CTA, Fremd-Lens | „Auswahl vergleichen (2)" | „2 Briefkästen vergleichen" / „2 Türsprechanlagen vergleichen" | Kündigt Kategorie und ggf. Seitenwechsel an (UX-14) |
| Drawer-Gruppenhinweis | „Vergleich nur innerhalb einer Kategorie" (4 ×) | einmal im Gruppenkopf: „Vergleich nur innerhalb einer Kategorie — Ihre Auswahl läuft bei Briefkästen" | Redundanz, Erklärung des Locks |
| Konfigurierte Zeile | Link „Konfiguration öffnen" + CTA „Konfigurieren" | Tag „Ihre Konfiguration · 30.10.2026", CTA „Konfiguration öffnen", Sekundär „Neu konfigurieren" | Ein Ziel, ein Primär-CTA (UX-13) |
| Preisdifferenz-Title | „Differenz zum günstigsten Modell im Vergleich" | „Differenz zum niedrigsten Preis im Vergleich" | Verbotene Wortwahl „günstig" |
| Preisformat Vergleich | „ab 1266,50 €" | „ab 1.266,50 €" | Konsistenz mit Karte/Merkliste |
| Highlight leer | „Keine Alleinstellung in den Kernmerkmalen" | „Keine Besonderheit gegenüber den anderen Modellen" | Verständlicher, weniger Fachjargon |
| Wertaussage ohne Gewinn | „— ohne technischen Mehrwert, reine Design-Entscheidung" | „— technisch identisch; der Unterschied ist die Optik" | Weniger abwertend, premium |
| Wertaussage, neutrale Abweichung | „dafür: Namensschild-Material: Edelstahl V2A gebürstet statt Edelstahl V4A gebürstet" | „Unterschied: Namensschild-Material V2A gebürstet statt V4A gebürstet" | Kein Gewinn vorgetäuscht (UX-07d) |
| Farben-Highlight | „7 Farben" / „2 Farben" | „+2 Farben (Eisenglimmer, Wunschfarbe)" nur beim Modell mit mehr Farben | Differenz statt Zählung (UX-28) |
| Guard gleiche Linie (Briefkästen) | „… wählen Sie diese auf der Produktseite." | „… wählen Sie diese in der Konfiguration." (wenn CTA „Konfigurieren") | Pointer = CTA (UX-19) |
| Verdict ohne Twin | „11 von 20 Merkmalen unterscheiden sich." | „11 von 20 Merkmalen unterscheiden sich — die wichtigsten:" (Chips folgen) | Leitet zu den Sprungmarken |
| Chip „+n weitere" | Text-Pill | Button „+3 weitere anzeigen" | Interaktiv (UX-06) |
| Add-Column-Toast | „Wählen Sie ein weiteres Modell über „Vergleichen" auf den Produktkarten — bis zu 4 gleichzeitig." | „Weiteres Modell auf einer Produktkarte markieren — noch 2 möglich." | Kürzer, Restanzahl (UX-12) |
| Add-Column, zweite Option | — | „Aus der Merkliste wählen (3)" | Verbindet beide Werkzeuge |
| Overlay-Bar bei `von=merkliste` | — | „← Merkliste" | Rückweg (UX-29) |
| Dialog-Leerzustand | „Vergleich (0)" | „Vergleich" | Leere Klammer wirkt technisch |
| Lesezeichen (Maus) | kein `title` | `title="Merken"` / `"Gemerkt — aus der Merkliste entfernen"` | Discoverability (UX-20) |
| Coach-Mark (einmalig) | — | „Modelle merken — sie bleiben auf diesem Gerät gespeichert." | Erklärt Symbol und Persistenz |
| Limit-Toast | „Ihre Merkliste ist voll (50) — bitte zuerst einen Artikel entfernen" | gleich + Aktion „Zur Merkliste" | Ausweg (UX-30) |
| Live-Region, Fremd-Tab | — | „Merkliste in einem anderen Tab geändert: 7 Artikel" | Transparenz |
| Falsche Lens im Deep-Link | — (still) | „Diese Modelle gehören zu Briefkästen — Vergleich dort öffnen" (Link) | Kein stiller Fehler (UX-15) |
| Overlay-Live-Region | — | „{Modell} entfernt. Vergleich mit n Modellen." / „{Modell} hinzugefügt." | Statusmeldung (UX-03) |

Beibehalten (geprüft, gut): „Merkliste / Merken / Gemerkt", „Gemerkt · Zur Merkliste", „Aus der Merkliste entfernt · Rückgängig", „Auf diesem Gerät gespeichert · Anmelden, um …", „Ihre Merkliste ist leer", „Wählen Sie mindestens 2 Modelle derselben Kategorie", „Maximal 4 Modelle gleichzeitig — bitte zuerst eines entfernen.", „Technisch baugleich — der Unterschied liegt in …", „Was der Aufpreis bringt", „Alternativen mit echtem Unterschied", „Konfigurieren / Zum Produkt", „Nur Unterschiede (n)", „Bestwert" (nicht beim Preis).

---

## 5 · Accessibility-Checkliste (WCAG 2.1 AA, getestet)

| Kriterium | Ergebnis | Evidenz / Bezug |
|---|---|---|
| 1.1.1 Nicht-Text-Inhalte | **Teilweise** | Lesezeichen/Icons haben Namen; Farb-Swatches nur `title` (UX-27) |
| 1.3.1 Info und Beziehungen | **Teilweise** | Tabelle mit `caption`, `scope`; Dialog ohne Überschrift (UX-26); Merkliste nicht gruppiert (UX-14) |
| 1.3.2 Sinnvolle Reihenfolge | Bestanden | DOM-Reihenfolge = visuelle Reihenfolge (Drawer-Aktionen CTA → Vergleichen → Entfernen) |
| 1.4.1 Benutzung von Farbe | Bestanden | Gemerkt = Füllung + `aria-pressed`; Diff = Tint + Akzentlinie; „Ja" = Haken + Text |
| 1.4.3 Kontrast (Minimum) | **Nicht bestanden** | `--green` 3,3:1 für „Ja" und „BESTWERT" (UX-18); sonst ≥ 4,5:1 |
| 1.4.4 Textgröße ändern / 1.4.10 Umbruch | Bestanden | 375 px ohne Seiten-Horizontalscroll (Drawer `scrollWidth = clientWidth`); Tabelle scrollt im Container (zulässig) |
| 1.4.11 Nicht-Text-Kontrast | **Teilweise** | Checkbox-Rahmen 5,7:1; (i)-Fokus nur Farbwechsel (UX-17) |
| 1.4.12 Textabstand | Bestanden (Stichprobe) | keine festen Höhen auf Fließtext außer Kopf-Clamp (`height:2.6em`) |
| 1.4.13 Inhalt bei Hover/Fokus | **Nicht bestanden** | Tooltip nicht per Escape schließbar ohne Dialog zu schließen; nicht hoverbar (`pointer-events:none`) (UX-17) |
| 2.1.1 Tastatur | **Nicht bestanden** | „Rückgängig" bei offenem Drawer unerreichbar (UX-02) |
| 2.1.2 Keine Tastaturfalle | Bestanden | Escape verlässt Drawer und Dialog |
| 2.2.1 Zeitbegrenzung | **Teilweise** | Merkliste-Toast 5 s, pausierbar; Vergleichs-Toast 2,6 s, nicht pausierbar (Information nur im Toast) |
| 2.3.3 Animation aus Interaktion | Bestanden | `prefers-reduced-motion` deaktiviert Slide/Puls/Scale |
| 2.4.3 Fokus-Reihenfolge | **Nicht bestanden** | Fokus auf `body` nach Spalte entfernen / Undo (UX-03, UX-02) |
| 2.4.6 Überschriften und Beschriftungen | **Teilweise** | Drawer `h2`; Overlay-Titel `span` (UX-26) |
| 2.4.7 Fokus sichtbar | **Teilweise** | Ringe vorhanden (teal 3 px); (i) ohne Ring (UX-17) |
| 2.5.3 Beschriftung im Namen | Bestanden | „Vergleichen"-Label ⊂ `aria-label` „… zum Vergleich auswählen" |
| 2.5.5 Zielgröße (AAA, als Ziel 2,75 rem) / 2.5.8 (AA 2.2, 24 px) | **Nicht bestanden** | (i) 18 px, Tray-„×" 18 px, Karten-Checkbox 21 px, „×" 26 px, Chips 28 px (UX-08/09) |
| 3.2.1/3.2.2 Bei Fokus / Eingabe | Bestanden | keine Kontextwechsel bei Fokus; Checkbox-Change öffnet nichts |
| 3.3.1 Fehlererkennung | **Teilweise** | Cap im Drawer erklärt; Cap auf Karte stumm (UX-08); falsche Lens stumm (UX-15) |
| 4.1.2 Name, Rolle, Wert | **Teilweise** | `aria-pressed`, `aria-expanded`, `aria-controls`, `role=dialog` korrekt; Tooltip-Inhalt nicht verknüpft (UX-17) |
| 4.1.3 Statusmeldungen | **Teilweise** | Merkliste: `role=status` + Live-Region; Overlay: keine Live-Region für Entfernen/Hinzufügen (UX-03) |

Gesamtbild: 9 bestanden, 9 teilweise, 5 nicht bestanden — alle fünf Fails liegen in den Findings UX-02, 03, 08/09, 17, 18 und sind mit S/M-Aufwand behebbar.
