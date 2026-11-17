# 09 — Adaption Merken/Vergleichen · Umsetzung (Prototyp)

Datum: 2026-10-31 · Quellen: `09a_Wettbewerb_Merken-Vergleichen_Research.md` (Lead Competitive Research, 18 Shops) → `09b_Adaption_Merken-Vergleichen_Design.md` (Lead Product Design, Build-Spec) · Prototyp: `Deliverables/vergleichen-flow-B/` · Assets: `vergleichen.*?v=21`, `merkliste.*?v=6`, `merkliste-pdp.css?v=3`

Alle zehn P0-Punkte aus 09b §3 sind gebaut. Die Kundenregeln sind unverändert: Vergleichs-Checkboxen erst nach „Vergleichen“, kein Warenkorb in Liste und Vergleich, Lesezeichen-Glyph, „Merkliste / Merken / Gemerkt“.

## 1 · Was gebaut wurde

| P0 | Ergebnis | Ort |
|---|---|---|
| **1 · Auswahl je Kategorie, tab-übergreifend** | `localStorage.mtz_vgl` v2 mit einem Slot je Kategorie, 30 Tage gültig. Ein paralleler Tab der anderen Kategorie wird nicht überschrieben, der `storage`-Sync läuft zwischen Tabs, die alte `mtz_vgl_flow` wird migriert. Der Modus bleibt sitzungsgebunden (`sessionStorage.mtz_vgl_mode`). Eine gespeicherte Auswahl zeigt im Ruhezustand nur den Zähler am Toolbar-Button („Vergleichen, 3 Modelle aus Ihrer letzten Auswahl“); Tray und Karten-Checkboxen bleiben verborgen. Toast beim Start: „Ihre letzte Auswahl ist wieder da …“ · „Vergleich leeren“. | `vergleichen.js` `readStore/loadSel/persist/setMode`, `syncBar`, `syncTray` |
| **2 · Vergleich hat eine Adresse** | Beim Öffnen wird `pushState` mit `?vergleich=a,b,c` gesetzt; Browser-Zurück schließt den Vergleich, Vor öffnet ihn wieder, ein Reload öffnet erneut. Spalte ×, Suche und Leeren aktualisieren die URL per `replaceState`. Der Seitentitel lautet „Vergleich: … vs. … \| Metzler“. „Link kopieren“ (mobil „Teilen“, `navigator.share`) mit Erfolgszustand; fehlt die Clipboard-API, erscheint ein Feld zum Kopieren. Ankunftsregeln gelten für fremde Auswahl (Wiederherstellen-Aktion), > 4 Modelle, teils ungültige Links, nur 1 gültiges Modell (mit Wiederherstellen), andere Kategorie („Dort öffnen“) und ungültige Links. Der Druckfehler (leere PLP) ist behoben, weil die Print-Regeln nur noch unter `body.vgl-printing` gelten. | `vergleichen.js` `openView/closeView/pageUrl/syncUrl/arrive`, `shareView`; `vergleichen.css` Print-Block |
| **3 · Merkliste teilen ohne Konto** | Neue Zeile „Teilen · Drucken / PDF“ im Kopf. Der Link `#liste=…` wird mit deflate-raw komprimiert und liegt im Fragment, wird also nie an den Server gesendet. Vor dem Teilen erscheint die Gravur-Abfrage, der Default lässt den Text weg. Ab 7.000 Zeichen erscheint ein Hinweis auf „Drucken / PDF“. Für Empfänger gibt es einen Geteilt-Modus mit Banner, Übernahme pro Zeile oder komplett mit Rückgängig. Geteilte Konfigurationen werden auf der PDP wiederhergestellt; das Band heißt dann „Geteilte Konfiguration vom …“. Eingaben aus dem Link werden validiert: `javascript:`-URLs, HTML und unbekannte Schlüssel werden verworfen. | `merkliste.js` `encodeList/receiveShared/validateList/takeShared`, `.mkl-tools`, `.mkl-shared` |
| **4 · Drucken / PDF** | Eigenes Druckdokument `.mkl-printdoc`, nach Kategorien gruppiert, mit allen Konfigurationspositionen, „Referenz“, absoluter Shop-URL und USt.-Fuß; danach wird aufgeräumt und der Fokus zurückgegeben. | `merkliste.js` `printList`; `merkliste.css` |
| **5 · Preis seit dem Merken** | Neues Feld `priceSrc` (`plp`, `pdp` oder `cfg`). Der Anzeigepreis wird aufgefrischt, `priceAtAdd` bleibt als Referenz. Die Zeile „Seit dem Merken gesunken: −40,00 € (vorher …)“ erscheint ab ±1,00 €, ohne Rot. Preise aus verschiedenen Quellen werden nie verglichen: PLP 594,15 € und PDP 699 € für `colson1` lösen keine falsche Meldung aus (geprüft in beide Richtungen). | `merkliste.js` `curPrice/refreshPrices/deltaHTML` |
| **6 · Alle Positionen** | „Alle Positionen anzeigen (n)“ bei mehr als 3 Positionen, mit `aria-expanded` und `<dl>`; der Zustand überlebt `render()`. | `merkliste.js` `rowHTML`, `openParts` |
| **7 · Alle n auswählen** | Im Footer (eine Kategorie) bzw. im Gruppenkopf (gemischt), nur bei 2–4 Modellen; danach „Auswahl aufheben“, Fokus auf den Vergleichs-CTA. | `merkliste.js` `syncAllBtn/selectAll` |
| **8 · Mobiler Vergleich** | Bei 375 px stehen zwei volle Produktspalten (je 124 px) und 28 px der dritten. Kopf 293 px (Ziel ≤ 304), Leiste zweizeilig („Nur Unterschiede · Teilen · Leeren“), Scroll-Snap. | `vergleichen.css` Block „09b“ |
| **9 · Modell per Suche hinzufügen** | Die „Modell hinzufügen“-Kachel öffnet auf dem Desktop ein Popover und mobil ein Bottom-Sheet. Ohne Eingabe gibt es Vorschläge (Merkliste → Alternativen → Bewertungen), sonst Token-Suche über Name, Design-Linie und Modellcode, mit Umlaut-Normalisierung. Als Combobox mit ↑/↓/Enter bedienbar; Escape schließt nur das Panel. Nach der Auswahl liegt der Fokus auf dem × der neuen Spalte. Im leeren Vergleich bleibt das Panel nach dem ersten Modell für das zweite offen. | `vergleichen.js` `openAddSearch/addGroups/chooseAdd`; `vergleichen.css` `.vgl-addsearch` |
| **10 · Kaufpfad und Rückweg** | Der Spalten-CTA ist ein echter Link, wo eine PDP existiert (`colson1`), und merkt sich den Rückweg (`sessionStorage.mtz_return`). Die PDP zeigt in der Breadcrumb-Zeile „Zurück zum Vergleich (3)“ (mobil „Zum Vergleich (3)“); der Link öffnet denselben Vergleich in derselben Reihenfolge. | `vergleichen.js` CTA + Handler; `merkliste.js` `initReturn`; `merkliste-pdp.css` |

## 2 · Abweichungen von 09b (mit Grund)

- **„Ohne Gravurtext teilen“:** gestaltet als `.mkl-btn--neutral` (Teal-Outline), weil `.mkl-btn` die rote Entfernen-Optik trägt.
- **Wiederherstellungs-Band:** bleibt bis zur ersten Änderung des wiederhergestellten Builds. Bei geteilten Konfigurationen verschwand es sonst sofort, weil der Build nicht in der eigenen Liste liegt.
- **Suchtreffer:** der Preis steht unter dem Namen statt in einer eigenen Spalte (Namen wurden sonst vierzeilig); Platzhalter je Kategorie gekürzt.
- **Spaltenformel mobil:** `(100vw − 8rem) / 2` statt `8,75rem`, damit der Anschnitt bei 28 px liegt (die Formel aus 09b ergab 40 px).
- **Ein Modell aus dem Link:** zusätzlich die Aktion „Meine Auswahl (n) wiederherstellen“, damit die eigene Auswahl nicht stillschweigend verloren geht.
- **Optionaler Wisch-Hinweis `.vgl-swipe`:** nicht gebaut; der Anschnitt der dritten Spalte trägt den Hinweis.
- **Andere Kategorie im Link:** Der Prototyp erkennt sie über die Briefkasten-Stammdaten (`BK_SEED`). Auf JTL löst der Server die Kategorie je ID auf.

## 3 · Verifikation (2026-10-31, Desktop + 375 × 812, keine Konsolenfehler)

| Prüfung | Ergebnis |
|---|---|
| 3 Sprechanlagen und 1 Briefkasten: beide Slots in `mtz_vgl` | ✓ |
| Neue Sitzung: Badge 3, Modus aus, keine Checkboxen; Klick zeigt den Tray mit 3 Modellen und den Toast „letzte Auswahl“ | ✓ |
| Migration `mtz_vgl_flow` → `mtz_vgl`; Slot älter als 31 Tage wird verworfen | ✓ |
| Öffnen setzt `?vergleich=` + Titel; Zurück schließt; Vor öffnet; Reload öffnet erneut; × aktualisiert die URL | ✓ |
| Fremder Link (eigene Auswahl abweichend) → „Geteilter Vergleich geöffnet“ + Wiederherstellen | ✓ |
| Link mit Briefkasten-IDs auf der Sprechanlagen-PLP → „Dort öffnen“; Unsinn-IDs → „nicht mehr gültig“; 1 gültig → Hinweis, Overlay zu | ✓ |
| „Link kopieren“ ohne Clipboard-Freigabe → Feld mit absoluter URL ohne `von`; Escape schließt nur das Feld | ✓ |
| Suche: 6 Vorschläge, „sdm“ → 3 Treffer, „xyz“ → Leertext, ↓ + Enter fügt hinzu, Fokus auf dem ×, URL aktualisiert | ✓ |
| Mobil: Spalte 2 endet bei 347 px, Spalte 3 mit 28 px sichtbar, `thead` 293 px, Leiste 2 Zeilen, Sheet unten | ✓ |
| Merkliste „Alle 3 auswählen“ → „3 Türsprechanlagen vergleichen“ → Vergleich mit `?vergleich=`, „← Merkliste“, Toast | ✓ |
| Vergleich → „Zum Produkt“ (Colson) → PDP „Zurück zum Vergleich (3)“ (44 px, teal) → derselbe Vergleich | ✓ |
| Preisquellen-Guard: PLP-Item auf der PDP und PDP-Item auf der PLP ohne falsche Änderungszeile | ✓ |
| Teilen, Empfang, Übernahme + Undo, Gravur-Abfrage, manipulierter Payload, Größenlimit, Druckdokument, Positionen, Preiszeile | ✓ (Build-Test Merkliste-Seite) |
| Echte Druckvorschau, Animation des Drawers | nicht geprüft: das Test-Pane druckt nicht und lässt Animationen nicht ablaufen; geprüft wurden DOM und Klassen |

## 4 · Offen (aus 09b §5, unverändert)

Die Test-Hypothesen sind nicht entschieden: immer sichtbare Vergleichs-Checkbox (A/B), Cap 3 vs. 4, automatisches „Nur Unterschiede“ ab 60 %, leere Tray-Slots, Konto-Vorteil im Merken-Toast. Die JTL-Punkte J1–J12 (Konto-Sync, E-Mail, serverseitiges PDF, `/merkliste`-Seite, Artikelnummern, Farbwahl in der Vergleichsspalte, Projektlisten) bleiben P1.

## 5 · Nachtrag: PDP „Merken“ als ausgerichteter Block (Kundenfeedback, 2026-10-31)

Der Button stand linksbündig mit Inhaltsbreite neben einer Zeile „Gemerkt · Zur Merkliste“ und wirkte vom Kaufblock losgelöst. Jetzt:
- **Breite:** volle Breite der Kaufzeile (Desktop x 744–1325, identisch zu „Bitte Farbe wählen“ bzw. Mengen-Stepper + „In den Warenkorb“).
- **Maße:** Höhe 3 rem wie der CTA, Label zentriert, 0,75 rem unter der Kaufzeile; der Abstand zum Versandblock bleibt beim Stack-Abstand.
- **Notizzeile entfernt:** Das Label trägt den Zustand („Gemerkt“ / „Konfiguration gemerkt“). Den Weg zur Liste bieten der Toast („Zur Merkliste“) und das Header-Badge.
- **Caption:** „Geändert seit dem Merken …“ steht zentriert unter dem Button.

Das Sticky-Echo ist unverändert. Assets: `merkliste.js?v=7`, `merkliste-pdp.css?v=4`.

## 6 · Nachtrag: Lesezeichen in der Galerie-Ecke (Desktop, Kundenwunsch, 2026-11-01)

Zusätzlich zum beschrifteten Button unter der Kaufzeile gibt es ab 64 rem (1024 px) ein Lesezeichen oben rechts auf der Galerie-Bühne (`.pdp-media__stage > .mkl-pdp-media`). Es hat dieselbe Anatomie wie `.mkl-mark` auf der PLP-Karte: blankes Glyph, 2,75 rem Trefferfläche, Teal und gefüllt im Zustand „Gemerkt“. Bei 1440 × 900 liegt es bei x 628–672 / y 280–324, vertikal mittig zur Umschaltung „Fotos / 3D“.
- **Ein Zustand für alle Instanzen:** Galerie-Ecke, Button und Sticky-Echo zeigen denselben Zustand, dasselbe `aria-label` und denselben `title` („Merken“ / „Konfiguration merken“ / „… gemerkt — aus der Merkliste entfernen“). Der Fokus kehrt nach Undo auf die auslösende Instanz zurück.
- **Sichtbarkeit beim Scrollen:** Die Galerie-Spalte ist auf dem Desktop sticky; die Ecke bleibt beim Konfigurieren im Blick (nach 900 px Scroll bei y 257). Das schließt die Lücke aus 08 §6.1: Bei 1440 × 900 war der Button vor der Farbwahl am Bildschirmrand halb abgeschnitten.
- **Unter 64 rem** gibt es keine Galerie-Ecke. Mobil bleiben das Header-Icon (öffnet die Liste) und der Button; so entstehen keine drei identischen Glyphen im ersten Viewport (08, Kandidat d).
- **Assets:** `merkliste.js?v=8`, `merkliste-pdp.css?v=5`.

## 7 · Nachtrag: ein „Merken“ direkt neben dem CTA, ruhigere Hinweise (Kundenentscheidung, 2026-11-01)

**PDP „Merken“:** Die Galerie-Ecke (§6) wirkte doppelt und frei schwebend; sie ist entfernt, ebenso die vollbreite Zeile (§5). Jetzt gibt es **eine** Instanz in der Kaufzeile:
- **Lage:** ein 3-rem-Quadrat direkt rechts neben dem CTA (`.cfgb-buyrow > .mkl-pdp-buy`), gleiche Höhe wie der CTA, Outline-Stil, damit der CTA primär bleibt (Desktop: CTA x 877–1267, Quadrat x 1277–1325).
- **Zustand:** Glyph gefüllt/teal; `aria-pressed`, `aria-label` und `title` nennen „Merken“, „Konfiguration merken“ bzw. „… gemerkt — aus der Merkliste entfernen“.
- **Mobil (< 30 rem):** Stepper + CTA + Quadrat passen nicht in eine Zeile, ohne dass „In den Warenkorb“ umbricht (gemessen: zwei Zeilen bei 137 px CTA-Breite). Deshalb bekommt der Stepper eine eigene Zeile, CTA und Quadrat bleiben nebeneinander (375 px: CTA 24–294, Quadrat 303–351, einzeilig). Vor der Farbwahl ist der Stepper ausgeblendet, alles steht in einer Zeile.
- **Caption:** „Geändert seit dem Merken …“ erscheint nur bei Bedarf unter der Kaufzeile; sonst entsteht kein Leerraum.
- **Sticky-Echo:** unverändert.

**Toasts (Merkliste + Vergleich):** Statt schwarzer Fläche mit Mint-Link gibt es jetzt eine weiße Fläche mit Haarlinie `--graphite-200` und `--shadow-md`; Glyph und Aktion in `--teal`, die Aktion in 600 mit Unterstreichung. Das Limit-Glyph ist `--graphite-500`. Behoben: Das Status-Glyph wurde als gefüllter schwarzer Punkt gerendert (`<circle>` ohne `fill:none`); jetzt erscheint es als Outline-Haken.

**Assets:** `merkliste.js?v=9`, `merkliste.css?v=8`, `merkliste-pdp.css?v=8`, `vergleichen.css?v=22`.

**Mobil nachgeschärft (2026-11-01):** Der Stepper stand links allein über der CTA-Zeile und wirkte verloren. Unter 30 rem ist er jetzt vollbreit (− links, Menge mittig, + rechts), sodass beide Zeilen dieselben Kanten haben. Der CTA hat `padding-inline:var(--sp-3)`; „In den Warenkorb“ bleibt so auch bei 320 px einzeilig (gemessen: Stepper 24–296, CTA 24–238, Quadrat 248–296). Asset: `merkliste-pdp.css?v=9`.

## 8 · Nachtrag: „Merken“ auf der Galerie, gegenüber „Fotos | 3D“ (Kundenentscheidung, 2026-11-01 — ersetzt §5–§7)

Es gibt **eine** Merken-Instanz auf der Seite: oben rechts auf der Galerie-Bühne (`.pdp-media__stage > .mkl-pdp-media`), auf Desktop und Mobil, spiegelbildlich zur Umschaltung „Fotos | 3D“. Das Quadrat neben dem CTA und die vollbreite Zeile sind entfernt; die Kaufzeile ist wieder im Originalzustand.
- **Gestaltung:** Damit nichts schwebt, spricht das Control die Sprache der Umschaltung: weiße Fläche, Haarlinie `--graphite-300`, gleicher Radius, gleiche Höhe. Desktop 35 × 35 px bei y 284–319, rechte Kante = Bühnenkante (Umschaltung 284–319, linke Kante = Bühnenkante). Mobil 36 × 36 px in einer Zeile mit dem „3D“-Chip (beide y 347–383), rechts bündig, ohne das Produktbild zu überdecken. Die Trefferfläche ist per `::before` auf ≥ 2,75 rem erweitert.
- **Zustände:** Glyph `--color-graphite-700`, Hover in Teal; „Gemerkt“ mit Teal-Rahmen und gefülltem Teal-Glyph; `aria-pressed`, `aria-label` und `title` wie bisher („Merken“, „Konfiguration merken“, „… gemerkt — aus der Merkliste entfernen“).
- **Sticky-Echo:** Ab 56,25 rem (zweispaltig, Galerie sticky) bleibt das Control beim Konfigurieren sichtbar; das Echo in der Sticky-Bar ist dort ausgeblendet, damit nichts doppelt erscheint. Mobil scrollt die Galerie weg; dort bleibt das Echo in der Bar.
- **Caption:** „Geändert seit dem Merken …“ erscheint weiterhin bei Bedarf unter der Kaufzeile.
- **Assets:** `merkliste.js?v=10`, `merkliste-pdp.css?v=10`.

**Sticky-Bar korrigiert (2026-11-01):** Nach dem Ausblenden des Echos auf dem Desktop rückten „Details“ und der CTA zur Mitte, weil das Add-on deren `margin-left:auto` auf 0 gesetzt hatte. Die Überschreibung gilt jetzt nur noch unter 56,25 rem, wo das Echo sichtbar ist. Auf dem Desktop hat die Bar wieder ihr Originallayout (CTA-Rechtskante 1325 px = Inhaltskante). Asset: `merkliste-pdp.css?v=11`.

## 9 · Lead-Design-Pass: Hinweise (Alerts) und Lesezeichen-Glyph (2026-11-02)

**Hinweise:** eine Anatomie für Merkliste und Vergleich (`.mkl-toast` / `.vgl-toast`, identische Werte).
- **Position:** unten mittig, 1,5 rem über dem Rand. Angehoben wird der Hinweis nur über eine *sichtbare* Leiste: Vergleichs-Tray (gemessene Höhe `--vgl-tray-h`) bzw. PDP-Sticky-Bar. Vorher stand der Vergleichs-Hinweis immer 6,5 rem hoch und schwebte über dem Produktraster.
- **Karte:** weiße Fläche, Haarlinie `--graphite-200`, `--shadow-lg`, `--r-l`, Höhe 3,125 rem mit und ohne Aktion. Glyph 1,125 rem in Teal (Limit: `--text-muted`).
- **Aktion:** hinter einer Haarlinie, Teal 600, Unterstreichung nur bei Hover, Trefferfläche 2,75 rem.
- **Bewegung:** 180 ms Einblenden mit 0,5 rem Anstieg. Anzeigedauer 4 s, mit Aktion 6 s.
- **Copy:** ein Satz, meist einzeilig, z. B. „Wählen Sie 2 bis 4 Modelle zum Vergleich.“, „Vergleich beendet.“ · Rückgängig, „Link zum Vergleich kopiert.“, „Maximal 4 Modelle. Bitte entfernen Sie zuerst eines.“, „Ihre Merkliste ist voll (50 Artikel).“, „Zu viele Artikel für einen Link.“ · Drucken / PDF.

**Lesezeichen-Glyph** (überall: Karte, Header, Leerzustand, Vergleichsspalte, PDP, Band):
- **Form:** schlanker 2:3-Umriss (12 × 18 im 24er-Raster) statt 14 × 18, weich gerundete obere Ecken, abgerundete Spitzen an der Kerbe, Strich 1,6.
- **Pop beim Merken:** Füllen mit kurzem Pop (0,86 → 1,06 → 1, 220 ms; reduzierte Bewegung: keiner).
- **PDP-Galerie:** Das Control folgt der Grammatik der Umschaltung: nicht gemerkt wie das „3D“-Segment (weiß, Graphit-Glyph), gemerkt wie das aktive „Fotos“-Segment (Teal-Fläche, weißes Glyph).

**Assets:** `merkliste.js?v=11`, `merkliste.css?v=10`, `merkliste-pdp.css?v=12`, `vergleichen.js?v=22`, `vergleichen.css?v=24`.

**Hinweise auf hellem Teal (Kundenwunsch, 2026-11-02):** Die Fläche ist jetzt `--teal-100` (wie der Kaufberater-Block „Finden statt Suchen“), die Haarlinie `--teal-10`, der Schatten `--shadow-md`. Der Trenner vor der Aktion ist `--graphite-300`, damit er auf der Tönung sichtbar bleibt. Kontraste auf `--teal-100`: Text `--schwarz` ≈ 15:1, Aktion `--teal` ≈ 8,5:1. Assets: `merkliste.css?v=11`, `vergleichen.css?v=25`.

**Lesezeichen = Icon-Familie des Design Systems (2026-11-02):** Das Glyph ist jetzt auf derselben Zeichenfläche gebaut wie `Home/ICONS/profile.svg` und `cart.svg`.
- **Geometrie:** 27 × 26, Linie 1,4, runde Enden und Ecken, Eckradius ≈ 1 Einheit, Höhe 0,7–25,3 wie die Tasche, Breite 18 Einheiten für dieselbe optische Masse.
- **Größe:** Im Header rendert es über `.icon-btn` in derselben Größe (28 px Desktop / 22 px mobil) neben Konto und Warenkorb.
- **Einsatz:** Karte, Leerzustand, Vergleich und PDP nutzen dasselbe Glyph. Gemerkt ist es gefüllt in Teal.
- **Assets:** `merkliste.js?v=13`, `merkliste.css?v=12`, `merkliste-pdp.css?v=13`, `vergleichen.js?v=24`.

**PDP-Galerie-Lesezeichen im Rhythmus der Umschaltung (Lead-PD-Pass, 2026-11-02):** gemessen an „Fotos | 3D“ und als Ein-Segment-Zwilling neu gebaut.
- **Desktop – Rahmen:** weiß, 1 px `graphite-300`, `--radius-lg`, 0,2 rem Innenabstand. Darin ein Segment von 27,6 px mit `--radius`.
- **Desktop – Glyph:** 0,95 rem wie der 3D-Würfel, Linie ≈ 1,1 px wie die Umschalter-Icons.
- **Desktop – Maße:** Außenhöhe 35,6 px und Oberkante y 283,6 identisch mit der Umschaltung; Segment-Oberkante 287,6 identisch; Glyph-Oberkante 293,8 identisch mit dem Würfel.
- **Desktop – Zustände:** nicht gemerkt wie das „3D“-Segment (Graphit, Hover Teal); gemerkt wie das aktive „Fotos“-Segment (Teal-Segment, weißes Glyph). Der Rahmen bleibt immer neutral.
- **Mobil (≤ 560 px):** Die Umschaltung ist dort ein einzelner Chip; das Lesezeichen ist derselbe Chip quadratisch (36 px, `--radius`, gleiche Oberkante 347,4). Gemerkt erscheint es im Teal-Akzent des „3D“-Chips (Teal-Rand, `--color-teal-50`, Teal-Glyph).
- **Asset:** `merkliste-pdp.css?v=15`.

## 10 · PDP-Merken nach Benchmark (Spec `10_PDP-Merken-Icon_Benchmark-und-Spec.md`, umgesetzt 2026-11-02)

- **Beschriftet:** Das Galerie-Control ist ein Ein-Segment-Zwilling von „Fotos | 3D“ mit Wort. Desktop zeigt „Merken / Gemerkt“, nach der Farbwahl „Konfiguration merken / gemerkt“; mobil das kurze Label. Die Breite bleibt beim Umschalten stabil, weil das Alternativ-Wort reserviert ist.
- **Gemerkt:** Teal-Segment mit weißem Wort und gefülltem Glyph, auch mobil.
- **Stempel:** Die Animation läuft nur nach einem Klick (`.is-just-saved`, 220 ms), nie beim Laden.
- **Geändert:** Nach einer Änderung der gemerkten Konfiguration erscheint ein Teal-Punkt am Glyph, mit `aria-describedby="mklPdpChanged"` und erklärendem `title`. Ein Klick aktualisiert denselben Eintrag.
- **Zugänglichkeit:**
  - `aria-label` beginnt mit dem sichtbaren Label.
  - Jeder Speichervorgang wird nur einmal angesagt: Der Hinweis setzt `aria-live="off"`, wenn die Live-Region schon spricht.
  - Die Trefferfläche hat 6 px Rand (48 px).
- **Eine Instanz:** Das Sticky-Echo ist mobil ausgeblendet (`.is-dup`), solange das Galerie-Control im Viewport ist. Gedrosselt wird per Timer, weil `requestAnimationFrame` in Hintergrund-Tabs pausiert.
- **Gemessen:**
  - Desktop: Rahmen 36 px an derselben Oberkante wie die Umschaltung, rechte Kante = Bühnenkante; Segment 27,6 px wie „Fotos“; Glyph 15,2 px wie der Würfel.
  - Mobil: 36 px in der Zeile des „3D“-Chips.
  - Keine Konsolenfehler.
- **Assets:** `merkliste.js?v=15`, `merkliste-pdp.css?v=17`.

## 11 · Lead-Design-Pass: Merken als ruhige Tonal-Control (2026-11-02)

Feedback: der gerahmte weiße Kasten mit teal gefülltem Innensegment wirkte altmodisch. Vorgabe: **„Fotos | 3D" bleibt unverändert** (ein kurzer Umbau des Umschalters wurde auf Wunsch zurückgenommen).

- **Merken** (`merkliste-pdp.css` §11): randlose Tonal-Fläche `--graphite-100`, `--radius-lg`, Höhe 2,25rem (36 px = Höhe des Umschalters, gleiche Oberkante). Nicht gemerkt = Graphit-Schrift; gemerkt = weißer Thumb mit `--shadow-sm`, teal Schrift + gefülltes Lesezeichen. Kein Rahmen, keine teal Fläche.
- **Phones (≤ 560 px):** Tonal-Chip 2,25rem in der Zeile des „3D"-Chips; gemerkt = `--color-teal-75`.
- Nur DS-Tokens; keine Konsolenfehler.

**11b · Merken umrandet statt gefüllt (2026-11-02):** weißer Grund + 1px Haarlinie `--graphite-300` (wie der Rahmen von „Fotos | 3D"), Graphit-Schrift, Umriss-Lesezeichen. Gemerkt = teal Haarlinie, teal „Gemerkt", gefülltes Lesezeichen; kein Flächen-Fill in keinem Zustand. 36 px hoch, gleiche Oberkante wie der Umschalter (Desktop und Mobile geprüft). „Fotos | 3D" unverändert.

## 12 · Responsive-Audit (Lead Full-Stack, 2026-11-02)

Geprüft: 320–1920 px (18 Breiten), Querformat 844×390 / 740×360 / 440×390, Schrift 125 % und 200 %. Behoben (je in Block „12 · Responsive audit"):
- **Vergleich:** Alert ein Wort pro Zeile < 900 px (`width:max-content`); horizontales Scrollen im Vergleichsmodus bei 320 px (Toolbar umbricht); Tray-Status bei 320 px; überlappende Trefferflächen (× / Lesezeichen) bei 320–347 px; Sticky-Produktkopf verdeckte die Tabelle auf flachen Screens → `fitHeader()` löst ihn ab > 60 % Höhe; Sprung-Chips landeten unter dem Kopf (gemessener statt fixer Versatz); „Modell hinzufügen"-Popover ragte aus dem Viewport; Leiste schob „Schließen" bei 200 % aus dem Bild.
- **Merkliste:** Liste auf flachen Screens/200 % unbenutzbar → `fitDrawer()` lässt den Dialog als eine Spalte scrollen; Vergleichs-Button darf bei 200 % umbrechen.
- **PDP:** horizontales Scrollen auf jeder Breite (verstecktes „Verifizierter Kauf"-Label entkam dem Karussell → `.rvw-verified{position:relative}`); Merken mittig zum 44 px hohen Umschalter bei 561–767 px; Überlappung Umschalter/Merken bei 200 % (Container-Query); Preis in der Sticky-Bar bei 320–359 px abgeschnitten. „Fotos | 3D" unverändert.
- Offen (Basis-PLP/PDP, nicht Add-on): Filter-Button 34 px, `.pcard__more`, FAQ/Footer bei 200 %; 200 % auf Phones braucht eine Design-Entscheidung; echtes Gerät: iOS-Safari-Toolbar vs. Kopf-Schwelle.

## 13 · Icon-Hover = Design-System (2026-11-02)

Alle Icon-only-Buttons verhalten sich wie die Header-Icons (`.header-icon-btn`): ruhend transparent, beim Hover ein `--color-paper`-Kreis, Glyph-Farbe unverändert, 0,14 s. Betrifft Karten-Lesezeichen, Merkliste schließen/entfernen, PDP-Hinweis-×, Vergleich schließen/entfernen, ×-Button der Modellsuche (vorher teal, rot oder graphite-100). Umrandetes Merken auf der PDP = `.btn--ghost` (Paper + graphite-400), gemerkt = `.btn--secondary` (teal-50); gleich für das Sticky-Bar-Echo. Per Hover-Simulation geprüft (Header und Karte identisch: transparent → #F5F6FA, Glyph unverändert).

## 14 · Merkliste: Zeilen-CTA als Textlink (02.11.2026)

- „Konfigurieren“ / „Zum Produkt“ / „Konfiguration öffnen“ in den Merkliste-Zeilen sind jetzt **Textlinks** statt umrandeter Buttons: Teal, unterstrichen (DS-Linkregel), Schriftgewicht 600, mit Chevron rechts.
- Begründung: Es handelt sich um Navigation, nicht um eine Aktion auf der Liste. Drei umrandete Buttons pro Kategorie konkurrierten mit Preis und Produktname.
- Hover: Unterstreichung 1 → 2 px, Chevron rückt 2 px nach rechts (.14s; ohne Bewegung bei reduzierter Bewegung). Fokus: 3 px Teal-Outline.
- „Vergleichen“ links, Link rechts — auf allen Breiten in einer Zeile (auf Mobil kein gestapelter Vollbreiten-Button mehr). Trefferfläche bleibt 44 px hoch.
- Dateien: `merkliste.js` (v=17), `merkliste.css` §14 (v=15).

## 15 · Kaufberater = Live-Version (05.11.2026)

- Der alte eingebettete Berater („Finden statt Suchen · Kaufberater ⌄“) ist auf beiden PLPs durch den **Produktberater der Live-Version** ersetzt (sabavafa.github.io/product-listing-page, Stand Commit c9e3980): „Produktberater · Jetzt starten“, Sprechanlagen 7 Schritte (ab „Wie sieht die Verkabelung bei Ihnen aus?“), Briefkästen 6 Schritte (ab „Wie soll montiert werden?“).
- Übernommen 1:1 aus dem PLP-Projekt (dort nichts verändert): `plp-berater.html` + Ordner `Kaufbrater Images/` (12 Bilder) und der Einbettungsblock (iframe `#beraterFrame`, `?cat=sprechanlage|briefkasten&v=10`, Höhe per `postMessage {type:"mf-height"}` mit Fallback-Abfrage).
- Der Berater bringt seine eigenen Empfehlungsdaten mit; seine Produktlinks führen wie live in den Shop (im Prototyp durch den Link-Schutz gesperrt). Merken/Vergleichen gibt es nur auf den Produktkarten, nicht in den Empfehlungen des Beraters.
- Der alte Berater-Code in `plp.js` / `sprechanlage.js` bleibt inaktiv (er startet nur, wenn `[data-ai]` existiert).

## 16 · Kein Hover-Effekt auf Icons (05.11.2026)

Auf Wunsch ersetzt dies §13: Icon-Buttons sehen beim Hover genauso aus wie im Ruhezustand — kein Paper-Kreis, kein Farbwechsel. Betrifft die Header-Icons (Merkliste, Konto, Warenkorb), das Lesezeichen auf den Karten, Schließen/Entfernen in Merkliste und Vergleich, das × der Modellsuche und das × an den Vorschaubildern in der Vergleichsleiste (vorher rot). Der Tastatur-Fokusring bleibt. `merkliste.css` §15 (v=16), `vergleichen.css` §15 (v=29). Per Hover-Simulation geprüft: Ruhe- und Hover-Zustand identisch.

## 17 · Radien = Design-System (10.11.2026)

Geprüft (gemessen im Browser) gegen die DS-Token `--r-s` 2 px Badges · `--r-m` 4 px Buttons/Eingaben/Checkboxen · `--r-l` 8 px Karten/Bildkacheln · `--r-xl` 12 px Pop-ups/Toasts. Bereits korrekt: Bildkachel der Merkliste 8 px, „Auswahl vergleichen" und alle Buttons 4 px, Icon-Ziele rund. Korrigiert: „Vergleichen"-Checkbox der Merkliste 2 → 4 px (wie Vergleich und PLP-Filter), Merkliste-Toast 8 → 12 px (wie alle Toasts/Pop-ups des Vergleichs), Produktberater-Opt-in-Checkbox 3 → 4 px. `merkliste.css?v=18`, `plp.css?v=264`.

## 18 · Speicherhinweis in der Merkliste (10.11.2026)

Nutzer: „Text nicht sichtbar genug, Stil nicht professionell“. Vorher 12-px-Grautext im Fuß, mit „·“ an die Aktionszeile gehängt. Jetzt eigenes Band auf Paper-Ton oben im Fuß, durch eine Haarlinie von der Aktionszeile getrennt: Geräte-Icon (Teal), **„Auf diesem Gerät gespeichert.“** in Schwarz/600, Erklärsatz in Grau (5,4 : 1), „Anmelden“ als Teal-Link – 14 px wie der übrige Sekundärtext der Merkliste. Geteilte Ansicht analog („Geteilte Ansicht. Wird erst gespeichert, wenn Sie sie übernehmen.“). Handy: Hinweis am Listenende, gleiche Gestaltung ohne Band. `merkliste.js?v=22`, `merkliste.css?v=20`.

**Nachtrag 11.11. (Nutzerentscheidung):** das Geräte-Icon vor dem Speicherhinweis wird durch ein Hinweis-Icon ersetzt (Kreis mit „i“, Teal wie zuvor, DS-Strichstil 1,8) – auch in der geteilten Ansicht. `merkliste.js?v=24`, `merkliste.css?v=23`.

## 19 · „Merkliste leeren": rote Hover-Fläche (11.11.2026)

Nutzerentscheidung: „Merkliste leeren" ist eine löschende Aktion und wird beim Hover rot – wie „Vergleich leeren" in der Vergleichsleiste: Fläche `--color-red-50` (#FFF0EF), Text `--color-red-600` (#B52320, 5,9 : 1 – AA), Radius 4 px, ohne Unterstreichung. „Abbrechen" in der Bestätigung bleibt neutral. `merkliste.css?v=21`.

## 20 · „Alle n auswählen" entfernt (11.11.2026)

Nutzerentscheidung: die Option wird nicht gebraucht. Entfernt im Gruppenkopf (beide Kategorien gemerkt) und im Fuß (eine Kategorie), samt Logik (`syncAllBtn`, `selectAll`, `modelIds`, Fokus-Wiederherstellung) und Styles. Modelle werden einzeln über „Vergleichen" angehakt; ab 2 Modellen derselben Kategorie ist „n … vergleichen" aktiv. Geprüft mit 4 Türsprechanlagen + 2 Briefkästen: Gruppenköpfe nur noch mit Titel und Anzahl, 2 angehakt → „2 Türsprechanlagen vergleichen", keine Fehler. `merkliste.js?v=25`, `merkliste.css?v=24`.

## 21 · Fußzeile der Merkliste als Status (11.11.2026)

Nutzer: „die Info ist nicht professionell dargestellt“. Vorher ein 12-px-Grausatz („Wählen Sie mindestens 2 Modelle derselben Kategorie“), zweizeilig umbrochen neben „Auswahl vergleichen (0)“. Jetzt ein Statusblock wie eine Bestellübersicht – Zeile 1 die Auswahl (14 px / 600, Schwarz), Zeile 2 der nächste Schritt (14 px, Grau 5,4 : 1); der Button heißt nur „Vergleichen“ (Auswahlmodus: „Hinzufügen“) und verweist per `aria-describedby` auf den Status, der Status wird per `aria-live` angesagt. Zustände: „Keine Modelle ausgewählt · 2 bis 4 Modelle einer Kategorie“ → „1 Modell ausgewählt · Noch mindestens 1 weiteres Modell“ → „2 Türsprechanlagen ausgewählt · Bis zu 2 weitere möglich“ → „4 … · Maximum von 4 Modellen erreicht“; andere Kategorie: „… · Der Vergleich öffnet bei Briefkästen“; Auswahlmodus: „… · Noch 2 Plätze im Vergleich frei“. Desktop: Status links (eine Zeile je Aussage), Button rechts in derselben Zeile; Handy: Status über dem vollbreiten Button. `merkliste.js?v=26`, `merkliste.css?v=25`.

## 22 · „Zuletzt angesehen“ in der Merkliste (12.11.2026)

Nutzerwunsch, Konzept Lead Product Design:
- **Was zählt als angesehen:** Aufruf der Produktseite, Klick auf Titel oder Bild einer Produktkarte (PLP und „Ähnliche Modelle“), „Zum Produkt“ / „Konfigurieren“ im Vergleich. Neueste zuerst, bis zu 12 gespeichert.
- **Speicher:** nur für die Sitzung (`sessionStorage` `mtz_recent`), beim Schließen des Browsers weg – keine Einwilligung nötig. Eintrag als Momentaufnahme wie ein Merkliste-Eintrag, damit ein Modell von der anderen Kategorieseite ebenfalls erscheint.
- **Darstellung:** eigener Bereich unter den gemerkten Artikeln, Papiergrau-Fläche (8 px) – angesehen wirkt nie wie gemerkt. Höchstens 4 Modelle, nie ein bereits gemerktes. Zeile: Bildkachel, Name (2 Zeilen), Preis, „Zum Produkt“ / „Konfigurieren“; rechts „Merken“ mit Lesezeichen (ein Klick übernimmt das Modell in die Liste). „Verlauf löschen“ leert den Bereich.
- **Leere Merkliste:** der Hinweis wird kürzer, „Zurück zu …“ entfällt, der Bereich übernimmt die Hauptrolle.
- **Ausgeblendet** in der geteilten Ansicht und im Auswahl-Modus, wenn der Vergleich die Merkliste öffnet.
- **JTL:** den shopeigenen „zuletzt angesehen“-Bestand lesen statt einen zweiten Verlauf zu führen.

## 23 · „Drucken / PDF“ entfernt, „Teilen“ rechts (12.11.2026)

Nutzerentscheidung: die Merkliste bietet nur noch „Teilen“ – in der Titelzeile zwischen Titel und „Merkliste leeren“ (eine eigene Zeile für einen Link verschenkte Platz); am Telefon „Leeren“, unter 22,5 rem „Teilen“ als Symbol. Druckfunktion, Druckdokument und der Ersatz-Hinweis „Drucken / PDF“ bei zu langen Links sind entfernt.

## 24 · Produktbild in Meldungen (12.11.2026)

Nutzerwunsch („wie Airbnb“): Meldungen zu genau einem Produkt zeigen statt des Status-Symbols das Produktfoto als kleine Kachel (2,5 rem, weiß, 8 px) – Gemerkt, Aus der Merkliste entfernt, Konfiguration gemerkt/aktualisiert, In Ihre Merkliste übernommen, zum Vergleich hinzugefügt; im Vergleich „… hinzugefügt“ und „… entfernt“. Meldungen zu mehreren Artikeln behalten das Symbol.

Versionen: `merkliste.js?v=32`, `merkliste.css?v=31`, `vergleichen.js?v=119`, `vergleichen.css?v=159`.

## 25 · „Merkliste leeren“ ohne Rückfrage, mit Rückgängig (12.11.2026)

Nutzerentscheidung: statt der Rückfrage („3 Artikel aus der Merkliste entfernen?“ – „Ja, entfernen“ / „Abbrechen“) leert „Merkliste leeren“ die Liste sofort; die Meldung „3 Artikel entfernt“ bietet „Rückgängig“ und bleibt dafür 10 s stehen (sonst 5 s; pausiert bei Hover und Fokus). Screenreader hören „… Rückgängig in der Meldung möglich“. Rückfrage-Bereich samt Stilen entfernt. `merkliste.js?v=33`, `merkliste.css?v=32`.

## 26 · Einzelnes Entfernen: Zeit zum Rückgängigmachen, Sammel-Rückgängig, einheitliches Hover (12.11.2026)

Lead-Fullstack-Prüfung auf Nutzerwunsch:
- **10 s zum Rückgängigmachen** auch beim einzelnen Entfernen (vorher 5 s), wie bei „Merkliste leeren“; pausiert bei Hover und Fokus.
- **Sammel-Rückgängig:** vorher ersetzte jede neue Meldung die vorige, nur das zuletzt Entfernte war wiederherstellbar. Jetzt werden Entfernungen, solange ihre Meldung steht, gesammelt („2 Artikel entfernt“ – Rückgängig) und kehren an ihre alten Plätze zurück (geprüft: 4 Artikel, 1. und 3. entfernt → Reihenfolge wieder wie vorher). Eine einzelne Entfernung zeigt das Produktbild.
- **Einheitliches Hover für jedes Entfernen:** „Verlauf löschen“ jetzt wie „Merkliste leeren“ (rote Fläche, roter Text). Geprüft: Merkliste leeren, Zeile entfernen, Verlauf löschen, Spalten-×, Vergleich leeren (Vergleich und Leiste), × in der Leiste – alle `--color-red-50` / `--color-red-600`.
- **„Teilen“ in der Titelzeile** (Titel · Teilen · Merkliste leeren · ×): eine eigene Zeile für einen Link verschenkte Platz; Telefon „Leeren“, unter 22,5 rem „Teilen“ als Symbol (Name „Merkliste teilen“).
- Versionen: `merkliste.js?v=35`, `merkliste.css?v=34`.

## 27 · Rückgängig direkt am Eintrag (12.11.2026)

Nutzerentscheidung: der Papierkorb an einem Merkliste-Eintrag zeigt keine Meldung mehr, sondern legt eine hellrote Ebene über den Eintrag (schiebt sich in 200 ms von rechts herein): „<voller Shop-Titel> entfernt · Rückgängig“, unten ein 3-px-Balken, der in 8 s abläuft.
- Entfernt ist sofort (Zähler, Kopf-Badge, Vergleichsauswahl, Speicher); die Ebene bietet nur den Rückweg. Die Liste springt nicht – die Ebene hat die Höhe des Eintrags.
- Hover pausiert den Ablauf, ebenso Tastaturfokus (bei Mausklick läuft er weiter, damit die Ebene nicht ewig stehen bleibt).
- „Rückgängig“: Ebene gleitet hinaus, der Eintrag steht wieder an seinem Platz (an den Nachbarn verankert, auch bei mehreren offenen Entfernungen in beliebiger Reihenfolge), ein gesetzter Vergleichshaken ist wieder gesetzt; Fokus auf seinen Papierkorb.
- Zeit abgelaufen: der Eintrag klappt in 200 ms zu; hatte er den Fokus, geht er zum nächsten Eintrag.
- Jeder Eintrag hat seine eigene Ebene und Zeit. Schließen der Merkliste macht offene Entfernungen endgültig.
- Farben: DS-Lösch-Farben (`--color-red-50` Fläche, `--color-red-600` Text, Symbol und Balken), „Rückgängig“ als Aktion in Teal (8,4 : 1). Screenreader: „… entfernt. Rückgängig möglich.“ / „… wiederhergestellt.“ Bei „Bewegung reduzieren“ ohne Schieben, Balken steht.
- Entfernen an anderer Stelle (Lesezeichen auf Karte oder PDP, Vergleich, untere Leiste) behält die Meldung mit Rückgängig; „Merkliste leeren“ ebenfalls.
- Versionen: `merkliste.js?v=37`, `merkliste.css?v=35`.
- **Nachtrag (12.11., Nutzer: „zu viel – nur Rückgängig; der erste Schritt zu schnell, das Abschließen zu langsam“):** die Ebene zeigt nur noch „Rückgängig“ (mittig; kein Symbol, kein Text, kein Ablaufbalken – Screenreader hören weiterhin „… entfernt. Rückgängig möglich.“, die Schaltfläche heißt „<Titel> wiederherstellen“). Hereinschieben 350 ms mit abbremsender Kurve (vorher 200 ms), Zuklappen nach 5 s (vorher 8 s) in 260 ms. `merkliste.js?v=38`, `merkliste.css?v=36`.
- **Nachtrag 2 (12.11., Nutzerentscheidung):** „Rückgängig“ als schlichte weiße Schaltfläche mit dünnem rotem Rand (1 px `--color-red-600`), Beschriftung rot 14 px / 700, 4 px Radius, ohne Unterstreichung; Hover: Rand 2 px. `merkliste.css?v=37`.
- **Nachtrag 3 (12.11., Nutzeridee):** der entfernte Eintrag schrumpft beim Entfernen von seiner Höhe auf eine kompakte 3,5-rem-Zeile mit „Rückgängig“ (350 ms, gleiche abbremsende Kurve wie das Hereinschieben) – die Liste rückt einmal ruhig nach; „Rückgängig“ lässt ihn wieder auf volle Höhe wachsen (240 ms); nach 5 s klappt die kompakte Zeile zu. `merkliste.js?v=39`, `merkliste.css?v=38`.
- **Nachtrag 4 (12.11., Nutzerentscheidung):** „Rückgängig“ als Textlink statt Schaltfläche (rot `--color-red-600`, 700, unterstrichen; Hover dickere Unterstreichung), die kompakte Zeile verschwindet nach 3 s (Hover und Tastaturfokus pausieren weiterhin). `merkliste.js?v=40`, `merkliste.css?v=39`.

## 28 · Kategorie-Überschriften mittig (12.11.2026)

Nutzerwunsch: „BRIEFKÄSTEN (3)“ / „TÜRSPRECHANLAGEN (n)“ saßen 5,5 px unter der Mitte ihres grauen Bands (16 px Abstand oben, 4 px unten). Jetzt oben und unten je 10 px; die Titelzeile der Merkliste (Titel, Teilen, Merkliste leeren, ×) war bereits mittig (nachgemessen). `merkliste.css?v=40`.
- **Fehler behoben (12.11.):** die Rückgängig-Zeile blieb deutlich länger als 3 s stehen, wenn der Mauszeiger nach dem Klick auf den Papierkorb über ihr stand – die Zeile erscheint genau unter dem Zeiger, die erste kleine Mausbewegung zählte als Hover und hielt sie an. Jetzt pausiert Hover nur, wenn der Zeiger von außen auf die Zeile kommt; verlässt er sie, läuft die Zeit weiter (zuvor hielt der vom Skript auf „Rückgängig“ gesetzte Fokus die Zeile auch nach Mausbedienung fest). `merkliste.js?v=42`.

## 29 · Auswahl aus der Merkliste: erklärt, wenn nichts passt (12.11.2026)

Nutzerwunsch: öffnet der Vergleich die Merkliste und keiner der gemerkten Artikel passt (nur andere Kategorie, nur Konfigurationen oder alles schon im Vergleich), waren die Haken nur ausgegraut. Jetzt steht über der Liste ein neutraler Hinweis (Papiergrau #F5F6FA wie der Speicherhinweis, Info-Symbol in Teal; zunächst Hellteal, auf Nutzerwunsch geändert – Grün steht für Bestätigungen): „**Keine weiteren Türsprechanlagen in Ihrer Merkliste.** Verglichen werden nur Modelle einer Kategorie.“ (Nachsatz zu den gemerkten Briefkästen auf Nutzerwunsch entfernt) (bzw. „Die gemerkten Modelle sind bereits im Vergleich.“), ergänzt um „Unter „Zuletzt angesehen“ können Sie ein Modell merken und dann hinzufügen.“, wenn es den Bereich gibt. Fuß: „Nichts zum Hinzufügen – Merken Sie zuerst eine Türsprechanlage.“ (Briefkästen: „… einen Briefkasten.“). Gibt es passende Modelle, bleibt alles wie bisher. `merkliste.js?v=46`, `merkliste.css?v=42`.

## 30 · Abstände in der Merkliste geprüft (13.11.2026)

Nach dem Abstand über der Kopfkarte im Vergleich wurden alle Abstände der Merkliste nachgemessen – Desktop (1560 px) und Telefon (375 px), normale Ansicht und Auswahl für den Vergleich.

- **Stimmt bereits:** die Kategorie-Überschrift beginnt direkt unter der Kopfzeile (ein Listenkopf, keine Karte). Einträge haben oben und unten 16 px (Telefon 12 px), Bild und Text 16 px Abstand, darunter die Aktionszeile mit 8 px. Die Karte „Zuletzt angesehen“ hat 16 px über und 20 px unter sich (Telefon 12/16 px) und 16 px Innenabstand. Im Fuß stehen Hinweisband und Inhalt 12 px auseinander, der Rand unten beträgt 12 px. Am Desktop liegen alle Inhalte auf derselben Kante (20 px).
- **Korrigiert – Kopfzeile am Telefon:** Titel und × saßen mit 20 px vom Rand, alle Inhalte darunter mit 16 px – der Titel stand 4 px versetzt. Jetzt 16 px; das × liegt damit genau über den Papierkorb-Symbolen. `merkliste.css?v=43`.
- **Korrigiert – Hinweis in der Auswahl:** die Hinweiskarte („Keine weiteren Briefkästen …“) lag ohne Abstand auf der grauen Kategorie-Überschrift. Darunter jetzt derselbe Abstand wie darüber: 16 px, am Telefon 12 px. `merkliste.css?v=44`.

## 31 · „Zuletzt angesehen“ über die volle Breite (13.11.2026, Nutzerentscheidung)

Der Bereich war eine eingerückte Karte (16 / 20 px Außenabstand, 8 px Radius) und wirkte neben den randlosen Kategorie-Überschriften wie ein Fremdkörper. Jetzt ein Band in Papiergrau über die volle Breite der Merkliste: ohne Außenabstand und Radius, der Inhalt auf der Inhaltskante der Merkliste (20 px, Telefon 16 px), oben und unten 16 px (Telefon 12 px). Es schließt direkt an den letzten Eintrag an, bei leerer Merkliste direkt an die Kopfzeile. Geprüft bei 1440 px und 375 px: Überschrift und Bilder auf derselben Kante wie der Titel, „Merken“ und „Verlauf löschen“ rechts bündig mit dem Inhalt, kein seitlicher Überlauf. `merkliste.css?v=45`.

## 32 · Responsive-Audit der Merkliste (13.11.2026)

Gemessen in 11 Breiten von 320 bis 2560 px, Telefon hoch und quer: kein Überlauf, keine abgeschnittenen Texte, alle Ziele mindestens 24 px, keine Schrift unter 12 px in der Merkliste; Meldungen liegen in allen Breiten über der Vergleichsleiste. Behoben: auf niedrigen Bildschirmen (Telefon quer, 320–375 px Höhe) blieben zwischen Kopf und Fuß nur 127 px für die Liste. Unter 30 rem Höhe ist der Kopf kompakt, der Hinweis „Auf diesem Gerät gespeichert“ entfällt dort (er steht auch im Leerzustand), Auswahl-Zusammenfassung und „Vergleichen“ stehen in einer Zeile – die Liste bekommt 194 px (568 × 320) bzw. 234 px (740 × 360). `merkliste.css?v=47`.

## 33 · Merken nur auf der Produktseite, nach der Farbwahl (13.11.2026, Nutzerentscheidung)

Ein Merklisten-Eintrag ist jetzt immer eine konkrete Ausführung (Modell + Farbe + Optionen), nie ein Modell ohne Farbe.

- **Produktseite:** „Merken“ an der Galerie und in der festen Kaufleiste bleibt sichtbar, wirkt aber inaktiv, solange keine Farbe gewählt ist (`aria-disabled`, Name „Merken: … – zuerst eine Farbe wählen“). Ein Klick führt zu den Farbfeldern, hebt sie kurz hervor, setzt den Fokus auf das erste Feld und meldet „Bitte wählen Sie zuerst eine Farbe – dann können Sie Ihre Konfiguration merken.“ Mit der Farbe wird daraus „Konfiguration merken“ wie bisher.
- **Entfernt:** das Lesezeichen auf den Produktkarten der Kategorieseiten, in den Spalten des Vergleichs, auf „Ähnliche Modelle“ und „Merken“ in „Zuletzt angesehen“. Die Zeilen in „Zuletzt angesehen“ führen weiter mit „Konfigurieren“ / „Zum Produkt“ zur Produktseite. Die Dateien der Kategorieseite bleiben unverändert – das Lesezeichen kam aus `merkliste.js`.
- **Vergleich aus der Merkliste:** gemerkte Konfigurationen haben jetzt selbst das Feld „Vergleichen“ (verglichen wird das Modell). Vorher waren sie davon ausgenommen – sonst bliebe der Vergleich aus der Merkliste leer. Zwei Konfigurationen desselben Modells zählen als ein Modell.
- **Texte:** Leerzustand „Wählen Sie auf der Produktseite eine Farbe und merken Sie Ihre Konfiguration …“; in der Auswahl für den Vergleich „Weitere Modelle merken Sie auf ihrer Produktseite, sobald Sie eine Farbe gewählt haben.“
- **Bleibt:** früher gemerkte Modelle ohne Farbe bleiben in der Liste und funktionieren weiter; „Übernehmen“ aus einer geteilten Merkliste kopiert vorhandene Einträge und bleibt.
- **Prototyp-Grenze:** nur die VDM10 2.0 Colson hat eine Produktseite. Im Prototyp lässt sich deshalb nur dieses Modell neu merken; ein Vergleich aus der Merkliste mit zwei Modellen braucht im Prototyp einen früher gemerkten Eintrag. Im Shop hat jedes Modell seine Produktseite.

`merkliste.js?v=48`, `merkliste.css?v=48`, `merkliste-pdp.css?v=24`, `vergleichen.js?v=130`, `vergleichen.css?v=180`.

## 34 · Mobil-Check „Merken“ und Beispielprodukt verknüpft (13.11.2026)
- **Mobil (375 px) geprüft:** Schaltfläche oben und Lesezeichen in der Kaufleiste warten auf die Farbe, führen zu den Farben und sagen warum; nach der Farbwahl wird gemerkt („Gemerkt“, Zähler +1, Hinweis über der Kaufleiste). Kein seitliches Scrollen.
- **Korrigiert:** „Merken“ ohne Farbe setzte den Fokus auf die erste Farbe – die Farbvorschau schrieb dann „Farbe: Anthrazit RAL 7016“, obwohl nichts gewählt war (auf dem Telefon bis zum nächsten Tippen). Jetzt bekommt die Farbgruppe den Fokus (`tabindex="-1"`, ohne Rahmen; die Farben blinken kurz auf); Tab führt zur ersten Farbe.
- **Beispielprodukt (Nutzerwunsch):** die VDM10 2.0 Colson steht auf der Türsprechanlagen-Seite jetzt an erster Stelle; Titel und Bild der Karte öffnen die Produktseite (`pdp` im Produkteintrag von `sprechanlage.js`). In „Ähnliche Modelle“ im Vergleich öffnet das Bild nichts. Der Brotkrumen „Sprechanlagen“ auf der Produktseite führt zurück zur Liste. So lassen sich Merken (Produktseite) und Vergleichen (Liste) im selben Durchlauf zeigen.

`merkliste.js?v=49`, `merkliste-pdp.css?v=25`, `sprechanlage.js?v=104`.

## 35 · „Merken“ vor der Farbwahl öffnet die Farbwahl (13.11.2026, Lead UX)
- **Problem:** ein ausgegrautes „Merken“ wirkt kaputt; die Erklärung kam erst nach dem Klick, als Hinweis weit weg vom Finger, und auf dem Desktop scrollte die Seite oft gar nicht sichtbar.
- **Lösung:** „Merken“ sieht ohne Farbe aus wie immer und öffnet direkt am Knopf ein kleines Fenster „Farbe wählen und merken“ mit allen Farben der Seite. Ein Klick auf eine Farbe setzt sie auf der Seite (Bild, Titel, Preis, Kaufknopf) und merkt die Konfiguration im selben Schritt („Konfiguration gemerkt · Zur Merkliste“). Die Antwort auf „Warum geht das nicht?“ ist damit der Weg nach vorn. Die Farbfelder der Seite bleiben der Hauptweg.
- **Details:** gleiche Lösung für den Knopf in der Galerie und das Lesezeichen in der Kaufleiste (öffnet nach oben). Die Zeile unten nennt die Farbe unter Maus oder Tastaturfokus (nicht beim automatischen Fokus beim Öffnen – das sähe gewählt aus). Pfeiltasten bewegen durch die Farben, Esc schließt und gibt den Fokus an „Merken“ zurück; Klick daneben oder Scrollen aus dem Bild schließt. „Wunschfarbe nach RAL · + 49,00 €“ setzt die Wunschfarbe und führt zum RAL-Wähler – gemerkt wird erst mit RAL-Ton (vorher zählte „Wunschfarbe“ ohne Ton schon als Farbe). Ist die Farbe schon gemerkt, sagt das ein Hinweis statt eines Doppels; eine frühere Konfiguration derselben Farbe wird nie überschrieben.
- **Barrierefreiheit:** „Merken“ ist nicht mehr `aria-disabled`, sondern `aria-haspopup="dialog"` mit `aria-expanded`; Name „Merken: VDM10 2.0 Video-Türsprechanlage – Farbe wählen“. Die Farbfelder haben je den Farbnamen als Namen.

`merkliste.js?v=52`, `merkliste-pdp.css?v=26`.

## 36 · „Merken“ öffnet das vorhandene Farbfenster; Link „Alle Farben“ wie im PDP-Prototyp (13.11.2026, Nutzerentscheidung)
- **Kein zusätzliches Fenster:** „Merken“ vor der Farbwahl öffnet jetzt das vorhandene Seitenfenster „Farbe wählen“ der Produktseite (`#colorwin`, Variante v2 des PDP-Prototyps). Das kleine Farbfenster am Knopf aus §35 ist entfernt.
- **Link wie im Prototyp:** Die Produktseite zeigt standardmäßig Variante v2 (`?flow=b`): Unter den Farbfeldern steht der Link „Alle Farben mit Bezeichnung ansehen“, der dasselbe Seitenfenster öffnet. v1 bleibt unter `?flow=a` erreichbar, v3/v4 unter `?flow=c` / `?flow=d`. (`review=1` blendet im Prototyp nur den internen Varianten-Umschalter ein und wird hier nicht gebraucht.)
- **Verhalten:** Öffnet „Merken“ das Fenster, steht unter dem Titel „Gemerkt wird Ihre Konfiguration – mit der Farbe, die Sie hier wählen.“ (auch als Beschreibung des Dialogs). Eine Farbe wählen setzt sie auf der Seite und merkt die Konfiguration im selben Schritt; schließen (✕, Esc, Hintergrund) merkt nichts und gibt den Fokus an „Merken“ zurück. Über den Link geöffnet, fehlt die Zeile, und eine Wahl setzt nur die Farbe. „Wunschfarbe nach RAL“ führt wie bisher zum RAL-Wähler. Aus der Kaufleiste gewählt, landet der Fokus auf „Merken“ in der Galerie (die Leiste tritt nach der Farbwahl zurück).
- **Technik:** Das Fenster ist in jeder Variante verdrahtet; `MTZ_PDP.colours(opener, hinweis, callback(gewählt))` öffnet es von außen. „Merken“ hat dabei `aria-haspopup="dialog"`, `aria-controls="colorwin"` und `aria-expanded`.

`merkliste.js?v=54`, `merkliste-pdp.css?v=27`, `pdp-b.js?v=298`.

## 37 · FAQ-Bereich „Warum Metzler?“ nach dem PLP-Prototyp (17.11.2026)
- Linke Spalte so breit wie die Filterleiste (`var(--sidebar-w)`, 288 px statt 340 px): Die Karte „Warum Metzler?“ fluchtet mit den Filtern darüber – wie im PLP-Prototyp.
- Text „Über 1,8 Mio. zufriedene Kunden“ (statt „Hauseigentümer“), Sprechanlagen und Briefkästen. Die Gedankenstriche bleiben als „ – “ (Halbgeviertstrich mit Leerzeichen), auch wo der Prototyp „—“ setzt.

- **Mobil-Check (17.11.):** Auf dem Handy (375 px) brachen die Fragen in 18 px fett mit 20 px Innenabstand und 16 px Lücke auf 3–4 Zeilen um (121–148 px je geschlossener Frage). Nur unter 768 px gilt jetzt: Fragen 16 px (Zeilenhöhe 1,4), Innenabstand 16 px, Lücke 12 px, Antworten 15 px ohne die 40 px Einzug rechts, Überschrift 24 px. Ergebnis: 2–3 Zeilen, 77–99 px je Frage (Briefkästen 56–77 px), kein horizontales Scrollen. „Warum Metzler?“ steht unter den Fragen und bleibt unverändert. Desktop bleibt wie im PLP-Prototyp.

`plp.css?v=270`.

## 38 · Responsive wie im PLP-Prototyp (17.11.2026, Nutzerentscheidung)
- **Vorgabe:** „for responsiveness follow the plp prototype fully“ – Referenz https://sabavafa.github.io/product-listing-page/ (identisch mit dem lokalen PLP-Prototyp: `plp.css`, `Home/styles-v2.css`).
- **Abgleich:** Prototyp und unsere Seite nebeneinander bei 375, 768 und 1024 px gemessen (Boxen, Schriftgrößen, Abstände, Rasterspalten). Ergebnis jetzt: gleiche Werte; Unterschiede nur noch im Inhalt (24 statt 12 Artikel je Seite wie im Live-Shop, längere Kategorienamen der Live-Seite, Version-B-Link, „Vergleichen“).
- **Zurückgenommen (sichtbar):** die Handy-Regel für die FAQ aus §37 (Fragen wieder 18 px, Überschrift 27 px), aus dem Responsive-Audit Teil 2 die 12-px-Werte für Pills, „ab“/UVP, „POWERED BY“ und den Zähler im Header, sowie die 44-px-Flächen für „Filter“ und das Schließen des Filter-Sheets (wieder 34 / 36 px, erfüllt WCAG 2.5.8 AA).
- **Ergänzt aus dem Prototyp:** SEO-Überschrift auf dem Handy 20 px (`--text-h3`), Produktberater in der Spalte ohne Abstand oben.
- **Behalten (unsichtbar, ändert am Bild nichts):** Filter-Sheet bis zum Bildschirmrand gestreckt, damit es in sich scrollt – im Prototyp ist es auf dem Handy 1379 px hoch bei 812 px Bildschirm, die unteren Filter sind nicht erreichbar; geschlossener Filter-Drawer nicht in der Tab-Reihenfolge; unsichtbare 24-px-Tippflächen für kleine Textlinks. Ebenso die nicht-responsiven Punkte: ausgeblendete leere Filteroptionen, Checkbox-Radius 4 px (DS).

`plp.css?v=271`.

## 39 · Farbfenster auf dem Handy wie im PDP-Prototyp (17.11.2026, Nutzerentscheidung)
- **Keine Zusatzzeile:** Die Zeile „Gemerkt wird Ihre Konfiguration – mit der Farbe, die Sie hier wählen.“ aus §36 ist entfernt. Das Fenster zeigt nur „Farbe wählen“ wie im PDP-Prototyp. „Merken“ öffnet es weiterhin und merkt bei einer Farbwahl; der Hinweis „Konfiguration gemerkt“ bestätigt danach.
- **Bottom-Sheet auf dem Handy:** Unter 768 px fährt das Farbfenster von unten hoch (Nutzer: „on mobile it is a bottom up window“, Vorlage: Screenshot aus dem PDP-Prototyp). Volle Breite, höchstens 70 % der Bildschirmhöhe (die Seite bleibt oben sichtbar), oben 12 px Radius, Schatten und abgedunkelter Hintergrund ohne Unschärfe wie beim Preis-Sheet der Seite (`.sheet__panel`). Die Liste scrollt im Sheet; Schließen, Esc und Fokus-Rückgabe bleiben. Ab 768 px bleibt das Seitenfenster rechts.
- Hinweis: Der veröffentlichte PDP-Prototyp (https://sabavafa.github.io/product-detail-page/, Stand 17.11.) zeigt mit `?flow=b` noch das Seitenfenster; umgesetzt ist das Bottom-Sheet nach dem Screenshot.

`pdp-b.css?v=731`, `pdp-b.js?v=299`, `merkliste.js?v=55`, `merkliste-pdp.css?v=28`.

## 40 · Vergleich auf dem Handy – Lead-Design-Durchgang (17.11.2026)
- **Gemeinsamkeiten in einer Zeile je Merkmal:** links das Merkmal mit ⓘ, rechts der gemeinsame Wert mit einem grünen Haken (z. B. „Typ ⓘ … ✓ Video“). Die Haken-Zeile unter jedem Modell entfällt auf dem Handy – die Überschrift sagt bereits, dass alles für alle Modelle gilt. Merkmal ohne Wert (Nachtsicht) zeigt „✓ Ja“. 88–108 px → 45 px je Merkmal. Passen Merkmal und Wert nicht nebeneinander (z. B. „Abmessungen (B × H × T)“ + „B 37 · H 37 · T 10,5 cm“), steht der Wert rechtsbündig in der Zeile darunter.
- **Geöffnete Gemeinsamkeiten ohne Leerzeile:** die ausgeblendete Merkmalsvorschau belegte noch eine Zeile (87 → 68 px).
- **Durchgehende Trennlinien:** Die Linien zwischen den Zeilen brachen in der Lücke zwischen den Modellspalten ab; jetzt laufen sie über die ganze Zeile.
- **Abmessungen:** „T k. A.“ bricht nicht mehr um („… · T“ / „k. A.“).
- **Bewusst nicht geändert:** die Modellnamen im Kopf bleiben die vollständigen Shop-Namen (Nutzerentscheidung 11.11., „Text nie abschneiden“ aus dem Responsive-Audit); die mitlaufende Leiste zeigt wie bisher die Kurznamen.
- Desktop unverändert (geprüft bei 1280 px: Haken je Modell, kein „Ja“). Ergebnis bei 375 px, SDM10X + Colson, Gemeinsamkeiten offen: Vergleich 3011 → 2697 px hoch, kein horizontales Scrollen.

`vergleichen.js?v=131`, `vergleichen.css?v=183`.

## 41 · Vergleich auf dem Handy – Struktur (17.11.2026, Nutzer: „on mobile it looks fully cluttered and not organized“)
- **Befund:** Die Werte schwebten – im Tabellenkörper fehlte die Spaltenlinie, die die mitlaufende Modellleiste hat, und die zweite Spalte stand 12 px rechts neben ihrem Modellnamen. Jedes Merkmal stand ~2,5 rem über seinen Werten, aber nur eine Haarlinie vom vorigen Merkmal entfernt – die Merkmale lasen sich wie eigene Zeilen. Das ⓘ stand in jeder Zeile am rechten Rand. Die weißen Zellen übermalten die runden Ecken der Karten unten. „k. A.“ brach in schmalen Spalten um („T k.“ / „A.“).
- **Ein Spaltensystem von der Leiste bis zur letzten Zeile:** Die Wertespalten stoßen aneinander (0,75 rem Innenabstand, Haarlinie zwischen den Modellen). Kopf und mitlaufende Leiste haben 1,5 rem Abstand bei 0,75 rem Einzug – damit liegen alle Spaltenkanten auf derselben x-Position, jeder Wert steht genau unter seinem Modellnamen, und die Trennlinie der Leiste setzt die Spaltenlinie des Körpers fort (für jede Modellzahl). Gemessen: Namen in der Leiste, im Kopf und Werte bei 29 / 207 px (390 px Breite), Trennlinie bei 195 px in Leiste und Körper.
- **Merkmal und Werte als ein Block:** Merkmal 0,25 rem über seinen Werten, Haarlinie zwischen den Merkmalen; das ⓘ folgt dem Merkmalsnamen statt am rechten Rand zu stehen (wie bei den Gemeinsamkeiten).
- **Saubere Karten:** Zellen transparent, die Zeile trägt Weiß, Rahmen und runde Ecken. Fotos im Kopf mit 0,75 rem Abstand oben wie an den Seiten.
- **„k. A.“** bricht nie um.
- Geprüft bei 390 px (SDM10X + Colson) und 360 px (drei Briefkästen, zwei sichtbar): kein horizontales Scrollen, kein Überlauf. Desktop unverändert (1280 px geprüft).

`vergleichen.css?v=187`.

## 42 · Vergleich auf dem Handy – feste Positionen und Modellwechsel (17.11.2026, Nutzer: „fix the placement of the additional info … professional“, „shared elements must be at the same positioning“)
- **ⓘ immer an derselben Stelle:** Das ⓘ war absolut am Merkmalsnamen ausgerichtet – es saß zu hoch und lief beim Nutzer in „Namensschild“ / „Anzahl Klingeltaster“ hinein. Jetzt steht jedes ⓘ in allen Abschnitten (Unterschiede, Nicht für alle gepflegt, Gemeinsamkeiten) in einer Spalte am rechten Zeilenrand, mittig auf der ersten Zeile des Merkmals; im Fluss bzw. Raster gesetzt, nichts wird nachgemessen. Gemessen bei 375 px: alle ⓘ bei x = 328, höchstens 1 px neben der Textmitte.
- **Gemeinsamkeiten im Spaltenraster:** Haken und gemeinsamer Wert beginnen genau dort, wo die Werte des zweiten Modells beginnen (x = 200 bei 375 px) – alle Haken stehen in einer Spalte, bündig mit der Tabelle darüber; vorher rechtsbündig, jeder Haken an einer anderen Stelle. Lange Werte brechen in dieser Spalte um.
- **Erklärungen:** öffnen weiterhin ganz im Bild, der Zeiger sitzt genau auf dem ⓘ.
- **Modellwechsel im Kopf (3 Modelle):** Namen mit Wechsel-Pfeil hatten weitere Zeilenabstände als normale Namen (24 statt 19,6 px) – angeglichen; der Pfeil ⌄ hängt am letzten Wort und rutscht nicht mehr allein in eine neue Zeile.
- Geprüft: Türsprechanlagen (2 Modelle) und Briefkästen (3 Modelle) bei 375 px, kein horizontales Scrollen; Desktop unverändert (1280 px: ⓘ am Rand der Merkmalsspalte, Haken je Modell).

`vergleichen.js?v=134`, `vergleichen.css?v=190`.

## 43 · Vergleich auf dem Handy – Tabellen, Ähnliche Modelle, Aktionen, Erklärungen (17.11.2026, Nutzer: „enhance the tables“, „horizontal scrollable strip“, „chevrons … consistent with metzler-seiten“, „fix the mess“, „repressing the icon must collapse the tooltip“, „right padding to the tooltip box“)
- **Tabellen-Typografie:** Die Rangfolge war verkehrt – Merkmalsnamen fett 14 px schwarz, Werte normal 14 px schwarz. Jetzt die Sprache der PDP-Fakten (`.pdp-specs`): Merkmal als ruhige Beschriftung (DS-Caption 12 px, 700, Versalien, 0,08 em Laufweite, grau; die PDP nutzt dieselbe Beschriftung mit 11 px), Werte als Hauptinformation (16 px schwarz, Tabellenziffern), „k. A.“ tritt zurück (14 px grau). Abschnittstitel 18 px. ⓘ mittig auf der Beschriftung.
- **Ähnliche Modelle als waagrechter Streifen:** statt 2 × 2-Raster eine Reihe der PLP-Karten (10,5 rem breit, ~1,8 Karten sichtbar, rastet je Karte am Anfang ein, ohne sichtbare Scrollleiste). Abschnitt 901 → 495 px hoch.
- **Pfeile nach dem Metzler Design System (NavigationArrows, mittel):** 2,625 rem quadratisch, 4 px Radius, weiß, 1 px Teal-Rand, Teal-Chevron 0,75 rem (NAV-09 / NAV-10); Hover Teal-100, gedrückt Teal mit weißem Chevron, deaktiviert Graphite-500. Paar rechts neben der Überschrift, je Druck eine Karte; am Anfang links, am Ende rechts deaktiviert (`aria-disabled`, der Fokus bleibt). Nur auf dem Handy (Desktop-Raster scrollt nicht).
- **Aktionen am Ende:** statt einer umbrechenden Zeile aus fünf Links in zwei Farben zwei Gruppen – „Modell hinzufügen“ und „Aus der Merkliste“ als DS-Sekundärbuttons (volle Breite, untereinander), darunter unter einer Haarlinie „Teilen“, „Drucken“ links und „Vergleich leeren“ rechts abgesetzt.
- **Erklärungen (ⓘ):** Erneutes Drücken schließt die Erklärung – auch wenn Zeiger/Fokus noch auf dem ⓘ liegen (vorher hielt Hover sie offen). Auf dem Handy hält das Fenster 1,5 rem Abstand zum rechten Bildschirmrand, also 8 px innerhalb der Karte statt bündig mit ihrem Rand; der Zeiger sitzt weiter auf dem ⓘ.
- Geprüft bei 375 und 457 px; Desktop unverändert (1280 px: Raster mit 4 Karten, keine Pfeile, Werkzeugleiste statt Aktionsbereich).

`vergleichen.js?v=138`, `vergleichen.css?v=195`.

## 44 · Vergleich auf dem Handy – Seitenaktionen oben, Trennlinie unter dem Merkmal (17.11.2026, Nutzer: „place the marked links at the top“, „leeren must be placed at the far top bar“, „not having a divider doesn't look professional“)
- **Teilen, Drucken, Vergleich leeren in der Kopfleiste:** Auf dem Handy war die Werkzeugleiste der Kopfleiste ausgeblendet; Teilen, Drucken und Leeren gab es nur ganz unten. Jetzt stehen sie oben neben dem Titel: „Vergleich (2) · [Link] [Drucker] [Papierkorb] · ×“ – von überall erreichbar. Drei beschriftete Buttons passen neben dem Titel nicht, daher Symbol-Buttons mit 2,75 rem Fläche; Namen („Teilen“, „Drucken“, „Vergleich leeren“) bleiben für Screenreader. Nach dem Kopieren zeigt der Button den Haken, der Hinweis sagt „Link zum Vergleich kopiert.“ Desktop behält die beschriftete Leiste („Link kopieren“, „Drucken“, „Vergleich leeren“).
- **Aktionen am Ende:** nur noch „Modell hinzufügen“ und „Aus der Merkliste“ (DS-Sekundärbuttons).
- **Trennlinie unter dem Merkmal:** Die Beschriftung schwebte zwischen zwei Zeilen. Jetzt eine Haarlinie unter jeder Beschriftung, eingerückt wie der Inhalt (0,75 rem: vom Anfang der Beschriftung bis zum Ende des ⓘ); die Spaltenlinie zwischen den Modellen beginnt an ihr. Werte 0,5 rem darunter. Gemeinsamkeiten (Merkmal und Wert in einer Zeile) behalten nur ihre Zeilenlinie.

`vergleichen.js?v=140`, `vergleichen.css?v=198`.

## 45 · Einheitlicher Hover für alle Symbole der Kopfleiste (17.11.2026, Nutzer: „hovering the trash … consistent with the prototype“, „all icons at the far top must have hover effect consistently“)
- **Muster aus dem Prototyp:** Symbol-Buttons (Entfernen auf der Modellkachel, Entfernen in der Merkliste) zeigen beim Hover ein 4-px-Quadrat hinter dem Symbol, eingerückt in die Bedienfläche. Jetzt haben alle Symbole der Kopfleiste dasselbe 36-px-Quadrat:
  - Teilen (Link), Drucken, Schließen ×: Graphite-100-Fläche, Symbol schwarz (Paper war auf der weißen Leiste kaum sichtbar);
  - Vergleich leeren (Papierkorb): DS-Löschen-Hover – Red-50-Fläche, Red-600-Symbol, wie der Papierkorb in der Vergleichsleiste und „Leeren“ in der Merkliste.
- Gemessen bei 375 px mit echtem Zeiger: alle vier Quadrate 36 px, 4 px Radius. Auf dem Desktop behalten Teilen, Drucken und Leeren ihre Beschriftung und den Hover über den ganzen Button; das × bekommt dasselbe Quadrat. Fokusrahmen (Teal) bleibt.

`vergleichen.css?v=200`.

## 46 · Titelleisten der Abschnitte in Teal-50 (17.11.2026, Nutzer: „let's make the title sections F2F6F6“)
- Die Titelleisten „Unterschiede“, „Nicht für alle gepflegt“ und „Gemeinsamkeiten“ waren weiß wie ihre Zeilen. Jetzt tragen sie DS Teal-50 (#F2F6F6, `--color-teal-50` aus dem Metzler Design System / PDP), so liest sich jede Karte als Titel + Inhalt. Rahmen, Radius und Haarlinie bleiben; „Gemeinsamkeiten“ behält den Ton beim Hover und eingeklappt. Alle Breiten.

`vergleichen.css?v=201`.
