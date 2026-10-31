# 07 — Merkliste auf der Produktdetailseite · Umsetzung (Prototyp)

Datum: 2026-10-31 · Prototyp: `Deliverables/vergleichen-flow-B/pdp/index.html` (Kopie der PDP Version B aus `Desktop/PDP METZLER`, Quelle unverändert) · Add-on: `merkliste.js` (v5, gemeinsam mit den PLPs), `merkliste-pdp.css` (v1), Hook in `pdp/pdp-b.js` (v296)
Quellen: `07a_PDP-Merkliste_Flow_UX.md` (Lead UX: Zustandsmodell, Flows, Rückweg, Copy) und `07b_PDP-Merkliste_Interface_Design.md` (Lead Product Design: Platzierung, Anatomie, Zustände, Sticky-Bar, Band, Mobile).

Demo-Links (Server in `vergleichen-flow-B`): `pdp/index.html` · nach dem Merken einer Konfiguration: Drawer → „Konfiguration öffnen" (stellt in place wieder her) oder Reload mit `pdp/index.html?merkliste=<configId>` · PLP `index.html` → Merkliste → „Konfigurieren" führt auf die PDP.

---

## 1 · Was gebaut wurde

| Baustein | Entscheidung (Quelle) | Umsetzung |
|---|---|---|
| **Platzierung** | 07b: eine Sekundärzeile direkt unter der Kaufzeile, Echo in der Sticky-Bar; 07a wollte zusätzlich eine Instanz neben „Produkt teilen" | `.mkl-pdp-row` nach `.cfgb-buyrow` in `#bCheckout` (Ghost-Button 2,75 rem, linke Kante = Mengen-Stepper, 0,75 rem unter der Kaufzeile) + Icon-Echo `.mkl-pdp-bar` vor „Details" in `#pdpStickyBar`. Die Titelzeilen-Instanz wurde **nicht** gebaut: der Konfigurationsstand ist dort nicht lesbar, und 07a selbst stellt sie mobil in Frage (Offener Punkt 3). |
| **Ein Toggle, Zustand nach Seite** | 07a §2 | Ohne Farbe → Modell-Item (identisch zur PLP, dedupliziert mit dem Karten-Lesezeichen). Mit Farbe → Konfigurations-Item `cfg:c-<Artikel>-<id>` mit `variantArticleNo`, `configSummary` (Farbe → Anschluss → Gravur → Innenstation → Stromversorgung → Zubehör → Menge), `configTotal`, `configQty`, `configState`, `configHash`, `configComplete`. Unvollständige Builds (Anschluss offen, Wunschfarbe ohne Ton) sind merkbar. |
| **Gemerkt = gleicher Hash** | 07a §2.2 | djb2 über den normalisierten Stand (Artikel, RAL, Anschluss, Gravur+Schrift, Innenstationen+Mengen, Strom+Menge, Zubehör+Mengen, Menge). Preise fließen nicht ein. |
| **Update statt Duplikat** | 07a Z5 | `sessionStorage['mtz_mkl_pdp']` merkt `Farbartikel → configId`. Nach einer Änderung liest das Control „Konfiguration merken" mit Caption „Geändert seit dem Merken — erneut merken, um zu aktualisieren"; Klick überschreibt den Eintrag (`updatedAt`, Tag „Ihre Konfiguration · aktualisiert {Datum}"), Toast „Konfiguration aktualisiert", kein Badge-Puls. Andere Farbe = zweiter Eintrag. |
| **Einsortierung** | 07a 5.3 | Die Konfigurations-Zeile wird direkt hinter die Modell-Zeile gesetzt; Modell- und Build-Zeile dürfen koexistieren. |
| **Feedback** | 07a §3, 07b §4.1 | Gefülltes Glyph + Label-Wechsel, Bestätigungszeile „Konfiguration gemerkt · Zur Merkliste", Badge-Puls, Live-Region, Toast mit genau einer Aktion; Entfernen mit „Rückgängig" (Fokus kehrt auf die auslösende Instanz zurück). |
| **Rückweg** | 07a §4, 07b §4.2 | `?merkliste=<configId>` → `MTZ_PDP.restore()` spielt den Stand über die echten Controls ab (Swatch-Klick entsperrt den Konfigurator), `history.replaceState`, Band als erstes Kind von `.pdp-price--lead` („Gespeicherte Konfiguration vom {Datum}", Gesamt + 3 Positionen, Hinweise „Noch offen: …", „Nicht mehr verfügbar: …", „Preis aktualisiert: alt → neu"; Farbartikel weg → `configExpired`, „Farbe wählen"), Fokus auf dem Band, Scroll zum Preisblock. „Neu konfigurieren" → `MTZ_PDP.reset()` (S0, Konfigurator gesperrt, Menge 1, teal Halo auf den Swatches); „×" schließt das Band. Erste Änderung nach der Ankunft ersetzt das Band durch die Caption. Unbekannte ID → Toast „Diese Konfiguration ist auf diesem Gerät nicht gespeichert · Zur Merkliste". Im Drawer auf der PDP stellt „Konfiguration öffnen" **in place** wieder her (keine Navigation), „Konfigurieren" der Modell-Zeile scrollt zu den Swatches. |
| **Sticky-Bar** | 07b §5 | Echo 2,75 rem links von „Details" (Desktop) bzw. links vom CTA (≤ 56,25 rem); < 30 rem weicht das Thumbnail. Zustand, `aria-pressed`, `aria-label`, `title` synchron mit der Buybox-Instanz; die Bar bleibt `inert`, solange sie verborgen ist. |
| **Toast-Position** | 07b §6 | `.mkl-toast.is-pdp-bar` über der sichtbaren Bar (`--mkl-pdp-bar-h` per MutationObserver, Desktop 75 px → Toast-Unterkante 94 px); im Drawer gilt die 06-Regel (Toast im Dialog). |
| **Tokens** | 07b §3.1 | Die PDP-Kopie von `styles-v2.css` kennt nur `--color-*`; `merkliste-pdp.css` mappt die Kurznamen (`--teal`, `--schwarz`, `--graphite-*` …) darauf — keine Rohwerte. |
| **Hook in `pdp-b.js`** | 07a Anhang | `window.MTZ_PDP = { snapshot(), summary(), restore(snap) → fehlende Optionen, reset(), firstOpen(), openFirst(), name(), image(), base }` + `CustomEvent('mtz:pdp-change')` nach jedem `refresh()`. Nur Lesen + Abspielen über bestehende Controls; der Kaufpfad (`addToCart`, Sticky-CTA, Sheet) ist unverändert. Auf JTL liefert das Konfigurator-Plugin diese Fläche. |
| **Seiten-Deskriptor** | 07a §2.1 | `window.MTZ_PDP_PRODUCT = { id:'colson1', lens, price:699, uvp:822, url:'pdp/index.html' }` + `window.MTZ_MKL_BASE='../'`; gespeicherte Pfade sind relativ zu `vergleichen-flow-B`, das Add-on präfixt beim Rendern (`asset()`), so zeigen PLP und PDP dieselben Bilder und Links. |
| **Drawer-Zeile** | 07a §8 | Tag „Ihre Konfiguration · {Datum}" / „aktualisiert {Datum}", „Gesamt {Preis} · {n} Stück" bei Menge > 1, Caption „Noch nicht vollständig — {Schritt} offen", CTA „Konfiguration öffnen" (bei `configExpired` „Konfigurieren"), UVP-Zeile, keine Vergleichs-Checkbox (Vergleich auf Modellebene). Echte Links navigieren jetzt (PLP → PDP); nur `#konfigurator`/`#produkt` bleiben Prototyp-Toasts. |

## 2 · Verifikation (Prototyp, 2026-10-31)

| Prüfung | Ergebnis |
|---|---|
| Control-Geometrie (Desktop + 375) | 44 px hoch, 12 px unter der Kaufzeile, linke Kante = Kaufzeile (744 / 24); 14 px / 600; Rahmen `#DADADA`; `--teal` löst auf `#015253` auf |
| Z1 Modell merken | Label „Gemerkt", `aria-pressed=true`, Badge 1 mit Puls, Toast „Gemerkt · Zur Merkliste", Note sichtbar, Item `colson1` |
| S0 → S1 (Farbe gewählt) | Label „Konfiguration merken", `aria-label` „Konfiguration merken: VDM10 2.0 Video-Türsprechanlage, Verkehrsweiß RAL 9016"; Modell bleibt gemerkt |
| Z3 Konfiguration merken | Item `cfg:c-31102-…` direkt hinter der Modell-Zeile, Summary „Farbe · Anschluss", Gesamt 699 €, `configComplete=true`, URL `pdp/index.html?merkliste=…`, Session-Map gesetzt, Toast „Konfiguration gemerkt" |
| Z5 Änderung + Update | Caption sichtbar, Label zurück auf „Konfiguration merken"; erneuter Klick: gleicher Eintrag, Gesamt 898 €, `updatedAt`, Toast „Konfiguration aktualisiert", Anzahl unverändert |
| Echo | `aria-pressed` und `aria-label` identisch zur Buybox-Instanz; Echo 44 × 44 links von „Details" |
| Z4 Entfernen + Undo | Toast „Konfiguration aus der Merkliste entfernt · Rückgängig"; Undo: Eintrag zurück, Label „Konfiguration gemerkt", Fokus auf dem Control |
| Rückweg `?merkliste=<id>` | URL bereinigt, Farbe + Anschluss + Innenstation wiederhergestellt (Gesamt 898 €), Band als erstes Kind des Preisblocks mit Gesamt und 3 Positionen, Fokus auf dem Band, Label „Konfiguration gemerkt" |
| Band → Caption | Optionsänderung entfernt das Band und zeigt die Caption |
| „Konfiguration öffnen" im Drawer (PDP) | stellt in place wieder her, Drawer geschlossen, Band + Fokus |
| „Neu konfigurieren" | S0 („Bitte Farbe wählen", 699 €), Konfigurator gesperrt, Halo auf den Swatches, Eintrag bleibt (2 Artikel), Label „Gemerkt" (Modell) |
| Unbekannte ID | Toast „Diese Konfiguration ist auf diesem Gerät nicht gespeichert · Zur Merkliste", URL bereinigt |
| Toast über der Bar | `is-pdp-bar`, Unterkante 94 px über dem Rand (Bar 75 px), vollständig über der Bar |
| Mobile (375) | Zeile bei x 24, 44 px, Note bricht unter den Button; Thumbnail der Bar ausgeblendet (`< 30 rem`). Hinweis: unter der Browser-Emulation meldet die PDP eine Layout-Breite von 1078 px, verursacht durch die eigenen Off-Screen-Overlays (Sheet, Backdrops) — nicht durch das Add-on (Zeile 327 px breit). |
| Konsolenfehler | keine |

## 3 · Nicht umgesetzt / offen

- Instanz A neben „Produkt teilen" (07a) — bewusst weggelassen, siehe oben; bei Bedarf eine Zeile Markup + derselbe `pressPdp()`.
- Kontrolle im Sheet „Preisdetails & Menge" — beide Specs: nein.
- „Bereits bestellt"-Hinweis, Ablaufdatum, E-Mail-Erinnerung, Share-Link einer Konfiguration — JTL/P2 (07a §10).
- PLP-Karte „Gemerkt", wenn nur eine Konfiguration des Modells gemerkt ist (07a §10.8) — nicht geändert; die Karte zeigt weiterhin nur das Modell-Item.
- JTL: Plugin-Tabelle `plugin_mtz_merkliste_cfg`, Endpunkte und Redirect `/merkliste/konfiguration/{id}` wie in 07a §9; der Client-Teil ist in `merkliste.js` so gebaut, dass `configState` serverseitig entfallen kann.
