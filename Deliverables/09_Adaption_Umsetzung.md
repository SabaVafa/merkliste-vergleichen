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
