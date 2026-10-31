# 09b — Adaption „Merken" und „Vergleichen": Zielbild, Entscheidungen, Build-Spec

Datum: 31.10.2026 · Rolle: Lead Product Design · Empfänger: Main Engineer (baut direkt im Anschluss)
Scope: **nur** `Deliverables/vergleichen-flow-B/` (`index.html`, `briefkasten.html`, `pdp/index.html`, `vergleichen.js|css`, `merkliste.js|css`, `merkliste-pdp.css`). Nicht anfassen: `Desktop/PDP METZLER`, `Desktop/PLP`, `Deliverables/vergleichen-flow/` (Version A), `Deliverables/vergleichen-prototype/` (eingefroren). Kein Commit.
Grundlagen: `09a_Wettbewerb_Merken-Vergleichen_Research.md` (+ `09a_research-data.json`, `09_assets/`), `05`, `06`, `07`, `07a`, `07b`, `08` (PDP-Position entschieden, unverändert), `02`, `01/01b`.

**Eigene Prüfung am Prototyp (31.10.2026, 1440 × 900 und 375 × 812, Ist: `vergleichen.*?v=20`, `merkliste.*?v=5`, `merkliste-pdp.css?v=2`).** Die Gaps aus 09a §6.3 habe ich nachgestellt. Ergebnis:

| Gap laut 09a | Befund am Prototyp | Status |
|---|---|---|
| Vergleich nicht teilbar, nicht dauerhaft | URL bleibt beim Öffnen `index.html` ohne Parameter; `?vergleich=` wird in `init()` per `replaceState` entfernt; Auswahl nur in `sessionStorage['mtz_vgl_flow']` | bestätigt |
| **(neu)** Kategorien überschreiben sich | 3 Sprechanlagen gewählt → `briefkasten.html` → 1 Briefkasten markiert → `mtz_vgl_flow` = `["siebert"]`. Die Sprechanlagen-Auswahl ist weg (ein Schlüssel für beide Lenses) | **Fehler, neu gefunden** |
| Keine Übergabe der Merkliste ohne Konto | Drawer ohne Teilen/Drucken | bestätigt |
| Preisänderung unsichtbar | `priceAtAdd` manuell auf 469,00 gesetzt → Zeile zeigt weiter „ab 424,15 €" ohne Hinweis. Zusätzlich zeigt die Zeile den **gespeicherten** `priceFrom`, nicht den aktuellen Preis | bestätigt + verschärft |
| Mobile Vergleich ~1,7 Spalten | gemessen: `col.rl` 112 px + `col.pc` 168 px → bei 375 px sind **≈ 1,5** Produktspalten sichtbar | bestätigt (schlechter als berichtet) |
| Kein Hinzufügen per Artikelnummer | Add-Spalte schließt den Dialog und schickt zurück ins Grid; im Prototyp gibt es **keine Artikelnummern** in den Daten | bestätigt; Lösung über Modellsuche (P0-9) |
| **(neu)** Kaufpfad aus dem Vergleich endet im Toast | `[data-go]` zeigt nur einen Prototyp-Toast, auch für `colson1`, das eine PDP hat; vom PDP gibt es keinen Weg zurück zum Vergleich | **Flow-Bruch, neu gefunden** |
| **(neu)** Drucken auf der PLP | `vergleichen.css` `@media print{body>*:not(.vgl-view){display:none}}` gilt **immer**, auch ohne offenen Vergleich → Strg+P auf der PLP (und jede künftige Merkliste-Druckansicht) ergibt eine leere Seite | **Fehler, neu gefunden** |
| **(neu)** Preisquellen inkonsistent | PLP `colson1`: ab 594,15 € / UVP 699 €; PDP-Deskriptor `MTZ_PDP_PRODUCT`: 699 € / UVP 822 € | Datenartefakt; P0-5 berücksichtigt es |
| Variante in der Spalte, Menge/Summe, Spalten umsortieren, mehrere Listen, `/merkliste`-Seite | zutreffend | entschieden in §2 |

---

## 1 · Leitbild

### 1.1 Ziel-Flow

```
PLP (Sprechanlagen | Briefkästen)
 ├─ Lesezeichen auf jeder Karte ─────────────► Merkliste (Header-Badge, Drawer)
 │                                               │  Zeile: aktueller Preis + „Preis seit dem Merken" (P0-5)
 │                                               │  Konfiguration: „Alle Positionen anzeigen" (P0-6)
 │                                               │  Kopf: Teilen (Link, P0-3) · Drucken / PDF (P0-4)
 │                                               │  „Alle n auswählen" → „n Türsprechanlagen vergleichen" (P0-7)
 │                                               ▼
 └─ Toolbar „Vergleichen" (Modus) → Karten-Checkboxen → Tray (je Kategorie gespeichert, P0-1)
                                                 ▼
                         Vergleich (Overlay, URL ?vergleich=a,b,c, P0-2)
                           · Link kopieren / Teilen · Drucken · Nur Unterschiede
                           · Modell hinzufügen: Suche im Overlay (P0-9) · Aus der Merkliste
                           · Mobile: 2 Spalten + Anschnitt (P0-8)
                           · Lesezeichen je Spalte (Merkliste synchron)
                           · Spalten-CTA „Konfigurieren / Zum Produkt" → PDP (P0-10)
                                                 ▼
                         PDP · „Merken / Konfiguration merken" (08, unverändert)
                           · „‹ Zurück zum Vergleich (3)" in der Breadcrumb-Zeile (P0-10)
                           · Rückweg aus der Merkliste: ?merkliste=<configId> + Band (07)
                                                 ▼
 Übergabe ohne Konto: Merkliste-Link (#liste=…) → Empfänger sieht „Geteilte Merkliste"
   → „In meine Merkliste übernehmen" · „Konfiguration öffnen" stellt die geteilte Konfiguration auf der PDP wieder her
 Vergleichs-Link (?vergleich=…) → Empfänger landet direkt im geöffneten Vergleich
```

### 1.2 Designprinzipien (aus 09a abgeleitet)

1. **Merken ist ein Gast-Recht.** Gast-Merkliste ohne Login-Wand (09a M6, Baymard: 75 % Konto-Pflicht → ≈ 30 % Abbruch). Der Konto-Hinweis nennt einen konkreten Nutzen und steht nie im Weg.
2. **Jeder Stand hat eine Adresse.** Vergleich und Merkliste lassen sich ohne Konto per Link weitergeben und überstehen Reload, neuen Tab und Zurück-Taste (09a V7, V17, Top-15 Nr. 3/4). Personenbezogenes, z. B. ein Gravurtext, gehört nicht in die Query. Es reist nur auf ausdrücklichen Wunsch mit, und dann im `#`-Fragment.
3. **Die Konfiguration ist das Objekt.** Sie wird als ein Eintrag mit vollständiger Stückliste und Rückweg gespeichert (IKEA „Enthaltene Teile anzeigen", 09a M11). Vergleichen bleibt auf Modellebene.
4. **Unterschiede vor Vollständigkeit.** „Auf einen Blick", Sprung-Chips und das automatische „Nur Unterschiede" ab 60 % bleiben (bei METZLER weiter als bei jedem Wettbewerber, 09a §6.2). Neue Funktionen dürfen den Kopf nicht höher machen.
5. **Rückmeldung am Ort, Rückweg immer sichtbar.** Kein Modal. Jede Aktion hat ein Ziel („Zur Merkliste", „Zurück zum Vergleich") und, wenn sie destruktiv ist, ein „Rückgängig".
6. **Ehrlich über Daten.** Der Speicherort wird genannt, Preisänderungen ebenfalls. Es gibt keine erfundenen Werte: „–" statt „none", und keine Artikelnummer-Suche ohne Artikelnummern.
7. **Ein Store, viele Instanzen.** Karte, Vergleichsspalte, Drawer, PDP und Sticky-Echo lesen denselben Zustand (`mtz_merkliste`, `mtz_vgl`) und synchronisieren sich über Events und den `storage`-Event.

---

## 2 · Entscheidungen

Legende: **Ü** = übernehmen · **A** = adaptieren · **V** = verwerfen · **✓** = bereits gebaut (bleibt). Shops in Klammern, Pattern-Nummer aus 09a.

### 2.1 Merken

| # | Pattern (Shops) | Entscheidung | Begründung |
|---|---|---|---|
| M1 | Merken-Icon immer sichtbar auf der Karte, oben rechts (OTTO, Zalando, HORNBACH) | ✓ | So gebaut (`.mkl-mark` in `.pcard__media`), auch mobil |
| M2 | Merken auf der PDP nahe am Primär-CTA (Galaxus, MediaMarkt) | ✓ | Entschieden in 08 (Zeile unter der Kaufzeile + Sticky-Echo mit Label ab 64 rem) |
| M2b | Merken ersetzt den CTA, wenn nicht kaufbar (Manufactum) | V | Unsere PDP hat immer einen Kaufpfad; die gesperrte Kaufzeile in S0 ist ein Konfigurationszustand, kein „nicht lieferbar" |
| M3 | Herz-Icon (8 von 9 Shops) | V | Kundenentscheidung: Lesezeichen ohne Disc. Mit Label auf PDP und im Header ist es vertretbar (09a §6.4). Wiedererkennung → §5 |
| M4 | Zustand `aria-pressed` + Labelwechsel (notebooksbilliger, IKEA) | ✓ | Gebaut |
| M5 | Rückmeldung nahe am Auslöser, genau eine Aktion (Manufactum, IKEA) | ✓ | Toast „Gemerkt · Zur Merkliste", Note auf der PDP |
| M6 | Gast-Liste statt Login-Wand (7 von 9) | ✓ | Gebaut; Login-Wand (Zalando, MediaMarkt) verworfen |
| M7 | Speicherort bzw. -dauer offen nennen (OTTO „zwei Wochen") | A | Die Footer-Zeile ist gebaut. Präzisierung (P0-3): „Auf diesem Gerät gespeichert, bis Sie die Browserdaten löschen". Eine Dauer gibt es bei `localStorage` nicht, daher wird keine erfunden |
| M7b | Konto-Nutzen im Toast beim Merken (IKEA) | V (jetzt) | Toast trägt bereits „Zur Merkliste". Eine zweite Aktion bräche die Ein-Aktions-Regel → Test-Hypothese §5 |
| M8 | Eigene Listenseite mit URL (alle) | A → P1 | Auf JTL `/merkliste`. Im Prototyp wird der Drawer per Link adressierbar (`#liste=`, P0-3) |
| M9 | Mehrere Listen, automatisch benannt (Galaxus, Thomann) | V (jetzt) → P1 | Braucht Konto bzw. Server; für B2C-Gast eher Komplexität als Nutzen |
| M10a | Menge + Summe je Liste (Galaxus, IKEA, HORNBACH, Thomann) | V (jetzt) | Modellzeilen tragen „ab"-Preise, eine Summe aus „ab"-Preisen wäre irreführend. Menge und Summe entstehen in der Konfiguration (`configQty`, „Gesamt … · 2 Stück" ist gebaut). B2B-Projektliste → P1 |
| M10b | „Alles in den Warenkorb" | V | Kundenregel: kein Warenkorb aus Merkliste bzw. Vergleich; Produkte werden konfiguriert |
| M10c | Teilen für Gäste (Galaxus, Thomann, IKEA, Manufactum) | Ü → **P0-3** | Größter Übergabe-Hebel (Fachhandel, Elektriker, Partner) |
| M10d | Drucken bzw. PDF (IKEA, HORNBACH) | A → **P0-4** | Druckansicht im Prototyp („Als PDF speichern" über den Druckdialog); echtes jsPDF → P1 |
| M10e | Merklisten-ID bzw. Code (HORNBACH, Porsche, DoorBird) | A → P1 | Braucht einen Server-Token. Im Prototyp ersetzt der Link den Code; auf dem Ausdruck steht je Konfiguration die Referenz `configId` |
| M10f | Vergleichen aus der Liste (Thomann „Alle vergleichen", HORNBACH) | ✓ + **P0-7** | Checkbox je Zeile gebaut; „Alle n auswählen" ergänzt |
| M10g | Sortieren (Thomann, IKEA) | V | Bei typischen 2–8 Einträgen geringer Nutzen; die Gruppierung nach Kategorie ist gebaut |
| M11 | Konfiguration als ein Eintrag mit Stückliste (IKEA) | ✓ + **P0-6** | Eintrag gebaut; Stückliste aufklappbar ergänzt |
| M12 | Live-Preis + Änderung seit dem Merken (OTTO) | Ü → **P0-5** | `priceAtAdd` liegt vor; Vertrauen und Anlass zur Rückkehr |
| M12b | Preis- bzw. Verfügbarkeitsalarm per Mail | A → P1 | Braucht E-Mail mit Double-Opt-in |
| M13 | Leerzustand mit Rückweg (OTTO, IKEA) | ✓ | Gebaut („Zurück zu Türsprechanlagen") |
| M14 | Undo beim Entfernen | ✓ | Gebaut, Vorsprung (keiner der Wettbewerber hat es) |
| M15 | Merken auch mobil auf der Karte (gegen Thomann) | ✓ | Gebaut |

### 2.2 Vergleichen

| # | Pattern (Shops) | Entscheidung | Begründung |
|---|---|---|---|
| V1 | Checkbox immer sichtbar (MediaMarkt, Samsung, Bosch, nbb, Miele; Baymard 2022) | V (Kundenregel) → §5 A/B | Modusbindung bleibt. Der Test ist als Hypothese formuliert |
| V2 | Cap 3 (Apple, Samsung, Bosch, Miele) | V | Cap 4 bleibt (02). Mobil sind 2 Spalten gleichzeitig sichtbar (P0-8), das entspricht Apples Mobile-Regel |
| V2b | Cap-Hinweis als Modal (Samsung) | V | Toast + `aria-disabled` gebaut |
| V3 | Persistenter Bodentray mit Restkapazität (Miele, Thomann) | ✓ | Gebaut („bis zu n weitere möglich") |
| V3b | Leere Slots im Tray („Kein Gerät ausgewählt", Miele) | V (jetzt) | Die Textzeile trägt die Restkapazität; leere Slots kosten mobil eine Zeile → §5 |
| V4 | Ausgewählt-Zustand auf der Karte | ✓ | Gebaut (`.pcard.is-vgl`) |
| V5 | Toast beim Hinzufügen (nbb) | V | Der Tray ist die Rückmeldung (09a BP) |
| V6/V7 | Eigene Seite bzw. teilbare URL (Galaxus, Bosch, Miele, nbb, Apple) | A → **P0-2** | Overlay bleibt (Kontext PLP), bekommt aber URL-Zustand, History-Eintrag und „Link kopieren". Eigene Seite `/vergleich/…` → P1 (SEO) |
| V8 | Unterschiede zuerst, Gruppen, sticky Kopf (Galaxus, Miele) | ✓ | „Auf einen Blick" + Chips + Gruppen gebaut. **„Die wichtigsten Unterschiede" als eigene Gruppe: V**, weil Chips und Auto-Diff sie bereits abdecken und eine weitere Gruppe Zeilen doppeln würde |
| V9 | Nur Unterschiede = ausblenden | ✓ | Gebaut, plus Auto-Einschalten ab 60 % (Vorsprung) |
| V10 | (i)-Erklärungen, „Ab"-Werte (Galaxus, Apple) | ✓ | Toggletips gebaut; Preise mit „ab"; flexible Werte „Flexibel (1–500)" |
| V11a | Slot „Modell hinzufügen" im Vergleich (Miele, Bosch) | ✓ + **P0-9** | Bisher verließ man den Dialog; jetzt Suche direkt im Overlay |
| V11b | Hinzufügen per Artikelnummer (Bosch, Thomann) | A | Prototyp: Suche nach Modellname, Design-Linie und Modellcode. Artikelnummer, sobald JTL sie liefert (P1). Ein Feld „Artikelnummer" ohne Daten wäre unehrlich |
| V11c | Spalten umsortieren (Galaxus Drag) | V | ≤ 4 Spalten, Preisdifferenz je Spalte bereits sichtbar; Drag auf Touch ist fehleranfällig |
| V12 | Variante bzw. Farbe in der Spalte (Samsung) | V (jetzt) → P1 | Keine Farbpreise bzw. -bilder im Datenmodell; Farbe ändert kein Vergleichsmerkmal außer „Farben"; konfiguriert wird auf der PDP. P1: „Farbe vorwählen" mit JTL-Variationsbildern, wird an die PDP übergeben |
| V13 | Kaufpfad aus der Spalte | ✓ + **P0-10** | „Konfigurieren / Zum Produkt" führt jetzt real zur PDP, mit Rückweg |
| V14 | Merken in der Spalte (nbb, Thomann) | ✓ | Gebaut, synchron |
| V15 | Mobile: 2 Spalten, fixierte Labels, Anschnitt (NN/g, Apple) | Ü → **P0-8** | Heute ≈ 1,5 Spalten |
| V16 | Kategorien getrennt statt blockiert (Galaxus) | Ü → **P0-1** | Heute überschreibt eine Kategorie die andere |
| V17 | Persistenz über Reload und Tabs (Thomann, Galaxus, Bosch) | Ü → **P0-1/P0-2** | `localStorage` je Kategorie + URL |
| V17b | Einwilligungsdialog für Vergleichsdaten (MediaMarkt) | V | Funktionaler Speicher ist kein Marketing; Anti-Pattern 09a §5 |
| V18 | Drucken + Link kopieren | ✓ + **P0-2** | Drucken gebaut; Link ergänzt |
| — | PDP-Einstieg „Vergleichen" (Galaxus 50/50) | V (jetzt) → P1 | PDP-Buybox ist in 08 entschieden. Rückweg in den Vergleich (P0-10) deckt den häufigeren Fall ab |
| — | Header-Flyout beim Hinzufügen (Galaxus) | V | Tray ist sichtbarer; Flyout am Header ohne Gemerkt-Zustand ist eine Schwäche (09a) |

---

## 3 · Backlog

### Gemeinsame Bau-Regeln für alle P0-Punkte

- **Asset-Versionen** nach dem Build: `vergleichen.css|js?v=21`, `merkliste.css|js?v=6`, `merkliste-pdp.css?v=3` in `index.html`, `briefkasten.html`, `pdp/index.html`.
- **Tokens:** nur die genannten DS-Tokens. Auf der PDP über die Alias-Map in `merkliste-pdp.css` (07b §3.1). Fokusring überall `outline:.1875rem solid var(--teal); outline-offset:.125rem`. Trefferfläche ≥ 2,75 rem. Schrift-Longhands, nie `font: … inherit` (06 #1).
- **Klassen:** neue Klassen in `vergleichen.*` mit Präfix `vgl-`, in `merkliste.*` mit Präfix `mkl-`. `merkliste.js` definiert keine `vgl-`-Klasse (Entkopplung bleibt).
- **Reduced Motion:** jede neue Transition in den bestehenden `prefers-reduced-motion`-Block der jeweiligen Datei aufnehmen.
- **Toasts:** bestehende `toast(msg,type,action)` je Add-on, max. eine Aktion, 5 s, pausiert bei Hover und Fokus (gebaut).

---

### P0-1 · Vergleichsauswahl je Kategorie getrennt und tab-übergreifend speichern

**Problem.** Eine Kategorie überschreibt die andere (gemessen). Die Auswahl stirbt mit dem Tab (`sessionStorage`). Galaxus führt getrennte Listen je Produkttyp. Thomann, Galaxus und Bosch halten den Tray über Reload und Tabs.

**Lösung.** Neuer Speicher `localStorage['mtz_vgl']` mit einem Slot je Lens. Der Modus bleibt sitzungsgebunden (Kundenregel: Checkboxen erst nach Klick auf „Vergleichen").

**Ort.** `vergleichen.js` Z. 14 (`KEY`), Z. 175–176 (Laden/`persist()`), `init()` Z. 778–781 (Moduswiederherstellung), `syncBar()` (Toolbar-Label).

**Daten.**
```
localStorage['mtz_vgl'] = { v:2, lenses:{ sprechanlage:{ ids:['dominik1','colson1','kian1'], updatedAt:ISO },
                                          briefkasten:{ ids:['siebert'], updatedAt:ISO } } }
sessionStorage['mtz_vgl_mode'] = { sprechanlage:1 }      // Modus nur in dieser Sitzung aktiv
```
- `LENSKEY = window.MTZ_LENS || 'sprechanlage'`. `persist()` schreibt nur den eigenen Slot (vorher frisch lesen, dann mergen, damit ein paralleler Tab der anderen Lens nicht überschrieben wird).
- **Ablauf:** Slots mit `updatedAt` älter als 30 Tage werden beim Laden verworfen.
- **Migration:** Existiert `sessionStorage['mtz_vgl_flow']` (Array, v1) und ist der eigene Slot leer, werden dessen IDs übernommen, die zu `BY_ID` dieser Lens gehören. Danach wird `mtz_vgl_flow` gelöscht. Version A liegt in einem anderen Ordner und ist nicht betroffen.
- **Ohne Speicher** (`localStorage` blockiert): Fallback auf In-Memory für die Seite; keine Fehlermeldung.
- **Tab-Sync:** `window.addEventListener('storage', e => e.key==='mtz_vgl' …)` lädt den eigenen Slot neu und ruft `syncAll()`.

**Zustände Toolbar-Button `.vgl-bar-btn`** (Farben unverändert, `--teal-100`):

| Situation | Modus | Label | Tray |
|---|---|---|---|
| Keine Auswahl | aus | „Vergleichen" (Ruhezustand, wie heute) | verborgen |
| Gespeicherte Auswahl aus früherer Sitzung (n ≥ 1) | **aus** | „Vergleichen" + Zähler-Badge `.cnt` sichtbar (n), `aria-label="Vergleichen, {n} Modelle aus Ihrer letzten Auswahl"` | **verborgen**, Karten-Checkboxen verborgen |
| Klick darauf | an | bestehende Logik (`is-wait` < 2, `is-active` ≥ 2) | sichtbar mit der gespeicherten Auswahl |
| Gleiche Sitzung, Reload | an (aus `mtz_vgl_mode`) | wie vor dem Reload | sichtbar |
| „Vergleich beenden" | aus | Slot wird geleert, `mtz_vgl_mode[lens]` gelöscht (Undo-Toast wie heute stellt beides wieder her) | verborgen |

**Copy.** Beim Betreten des Modus mit wiederhergestellter Auswahl ersetzt dieser Toast den bisherigen Modus-Toast: „Ihre letzte Auswahl ist wieder da — {n} Modell(e). Wählen Sie bis zu 4 Modelle über „Vergleichen" auf den Karten." (Typ `info`, Aktion „Vergleich leeren" → `clearAll()`).

**Mobile.** Unverändert (zweizeiliger Tray).
**A11y.** Badge ist `aria-hidden`; die Zahl steht im `aria-label`. Live-Region im Tray wie heute.

**Abnahme.**
1. 3 Sprechanlagen wählen → `briefkasten.html` → 1 Briefkasten wählen → zurück zu `index.html`: Tray zeigt weiterhin 3; `mtz_vgl.lenses` enthält beide Slots.
2. Neuer Tab `index.html`, gleiche Sitzung: Button-Badge 3, Modus aus, keine Karten-Checkbox sichtbar. Klick auf „Vergleichen" → Tray mit 3 Thumbnails.
3. Altes `sessionStorage.mtz_vgl_flow=["colson1","kian1"]`, `mtz_vgl` leer → Reload → Slot enthält beide; `mtz_vgl_flow` ist gelöscht.
4. Slot mit `updatedAt` vor 31 Tagen → Reload → Slot leer.

---

### P0-2 · Vergleich hat eine Adresse: URL-Zustand, Zurück-Taste, „Link kopieren"

**Problem.** Der Vergleich lässt sich nicht teilen, nicht als Lesezeichen speichern und nicht per Zurück-Taste schließen. Ein Reload verliert den offenen Zustand. 5 von 8 Wettbewerbern codieren die IDs in der URL.

**Ort.** `vergleichen.js` `openView()`, `closeView()`, `removeColumn()`, Alternativen-/Add-Handler (jede Änderung der Auswahl bei offenem Overlay), `init()` Z. 776–781, `buildChrome()` Leiste `.vgl-view__bar-in`.

**URL-Regeln.**

| Ereignis | History | URL |
|---|---|---|
| `openView()` aus dem Tray, der Toolbar oder der Merkliste | `pushState({mtzVgl:1}, '', u)` | `{pfad}?vergleich=a,b,c` (Reihenfolge = Spaltenreihenfolge; andere Parameter wie `merkliste=demo` bleiben; **`von=merkliste` wird nie geschrieben**) |
| Auswahl ändert sich bei offenem Overlay (Spalte ×, Alternative, Suche P0-9, Leeren/Wiederherstellen) | `replaceState` | ≥ 2 IDs: aktualisierte Liste; < 2: Parameter entfernen |
| Schließen per ×, Escape oder „← Merkliste" | wenn `history.state.mtzVgl && !history.state.arrived` → `history.back()`; sonst `replaceState` ohne Parameter | Parameter weg |
| Browser-Zurück bei offenem Overlay | `popstate` ohne `mtzVgl` → interne Schließ-Funktion ohne History-Aufruf | — |
| Browser-Vor | `popstate` mit `mtzVgl` → IDs aus der URL lesen → `setSelection()` → `openView()` ohne erneuten Push | — |
| Ankunft mit `?vergleich=` (Link, Reload, Merkliste) | `replaceState({mtzVgl:1, arrived:1}, …)`; `von=merkliste` wird dabei entfernt | Parameter **bleibt** (Reload öffnet den Vergleich erneut). Das ersetzt die Regel aus 06 „Reload öffnet nicht erneut" |

- **Seitentitel** bei offenem Overlay: `Vergleich: {Modell1} vs. {Modell2}[ vs. …] | Metzler` (Modellnamen aus `colLabels()` `.main`). Beim Schließen wird der vorherige Titel wiederhergestellt.
- **Toast „aus Ihrer Merkliste"** erscheint nur bei `von=merkliste` und nur einmal (heute in `merkliste.js` Z. 591). Weil `von` bei der Ankunft entfernt wird, wiederholt ein Reload ihn nicht.

**Ankunft über einen fremden Link (neue Sitzung).**

| Fall | Verhalten | Copy (Toast, Typ) |
|---|---|---|
| 2–4 gültige IDs der Lens | Auswahl setzen, Modus an, Overlay öffnen | keiner |
| Empfänger hatte eine **andere** gespeicherte Auswahl in dieser Lens | Alte IDs in `sessionStorage['mtz_vgl_prev']` sichern, dann wie oben | „Geteilter Vergleich geöffnet." · Aktion „Meine Auswahl ({n}) wiederherstellen" → `setSelection(prev)` + `renderView()` + `replaceState` (info) |
| > 4 IDs | die ersten 4 | „Es werden die ersten 4 Modelle verglichen." (info) |
| ungültige IDs teilweise, ≥ 2 gültig | gültige öffnen | „{k} Modell(e) aus dem Link sind nicht mehr verfügbar." (info) |
| genau 1 gültige ID | Auswahl = 1, Modus an, Overlay **nicht** öffnen, Parameter entfernen | „Aus dem Link ist nur noch ein Modell verfügbar — wählen Sie ein weiteres zum Vergleich." (info) |
| 0 gültige IDs dieser Lens, aber gültig in der anderen | bestehende Logik „Dort öffnen" (06) | unverändert |
| 0 gültige IDs | Parameter entfernen | „Dieser Vergleichs-Link ist nicht mehr gültig." (limit) |

**Button „Link kopieren".**
- **Ort:** in `.vgl-view__bar-in` **vor** `[data-vgl="print"]`: `<button class="vgl-link vgl-link--share" type="button" data-vgl="share">{IC_LINK}<span class="vgl-m-hide">Link kopieren</span><span class="vgl-m-only">Teilen</span></button>`. `IC_LINK` = 24er-Glyph mit zwei Kettengliedern, Stroke 2, Stil wie `IC_PRINT`.
- **Anatomie:** wie `.vgl-link--ic`: Höhe 2,75 rem, Icon 1,125 rem, Gap `--sp-2`, Schrift `--text-body-sm`/600, Farbe `--teal`, Hover unterstrichen. Die Klasse `vgl-link--share` wird mobil **nicht** ausgeblendet (anders als `--ic`).
- **Verhalten Desktop:** `navigator.clipboard.writeText(absUrl)`. Ist die Clipboard-API nicht verfügbar, öffnet sich ein Popover `.vgl-sharepop` unter dem Button: `<label>Link zum Vergleich</label><input readonly>` vorselektiert, „Schließen". Escape schließt, der Fokus geht zurück auf den Button.
- **Verhalten mobil** (`matchMedia('(max-width:47.99rem)')` und `navigator.share` vorhanden): `navigator.share({title:'Vergleich: … | Metzler', url:absUrl})`. Bei `AbortError` passiert nichts; bei anderem Fehler greift der Clipboard-Weg.
- `absUrl` = `location.origin + location.pathname + '?vergleich=' + ids.join(',')`. Ohne `von`, ohne `merkliste`.

**Zustände.** Default · Hover (Unterstreichung) · Fokus (Ring) · Aktiv (`:active` Farbe `--teal-600`) · Erfolg: Label für 2 s „Link kopiert" mit Haken-Icon `IC_OK`, `aria-live` im Overlay „Link zum Vergleich kopiert." · Fehler: Popover-Fallback · Disabled: nie; bei < 2 Modellen wird der Button `hidden`.
**Toast** (zusätzlich, `ok`): „Link kopiert — wer ihn öffnet, sieht diesen Vergleich."
**Mobile.** Die Leiste kürzt „Vergleich leeren" auf „Leeren" (`vgl-m-hide`/`vgl-m-only`, wie im Tray). Zeile 2 der Leiste: Schalter „Nur Unterschiede (n)" · „Teilen" · „Leeren". Bei 375 px entsteht kein Umbruch in eine dritte Zeile.
**Druck:** `.vgl-link--share` in die Print-Ausblendliste aufnehmen. **Zusätzlich Fehler beheben:** `@media print{body>*:not(.vgl-view){…}}` → nur bei `body.vgl-printing` anwenden. `printView()` setzt die Klasse vor `window.print()` und entfernt sie in `afterprint` (und als Fallback nach `print()`).

**Abnahme.**
1. Tray „Vergleichen" → URL enthält `?vergleich=dominik1,colson1,kian1`, Titel „Vergleich: XDM10 … vs. …".
2. Browser-Zurück schließt das Overlay; die URL ist ohne Parameter; die PLP-Scrollposition bleibt.
3. Reload bei offenem Overlay → Overlay ist wieder offen, gleiche Spalten.
4. × an einer Spalte → URL hat 2 IDs; × bis 1 → Parameter weg, Leerzustand wie 06.
5. „Link kopieren" → Zwischenablage = absolute URL ohne `von`; Live-Text gesetzt.
6. Strg+P auf der PLP ohne Overlay → normale Seite im Druck (nicht leer).

---

### P0-3 · Merkliste teilen ohne Konto (Link) + Empfängeransicht

**Problem.** Die Übergabe an Partner, Elektriker oder Fachhandel ist heute unmöglich. IKEA, Manufactum, Thomann und Galaxus bieten Teilen für Gäste.

**Ort.**
- `merkliste.js` `buildChrome()`: neue Zeile `.mkl-tools` in `.mkl-head` **nach** `.mkl-head__row`, **vor** `.mkl-confirm`.
- Neuer Banner `.mkl-shared` als erstes Kind von `.mkl-body`.
- `init()`: Hash lesen.
- `rowHTML()`: Modus „geteilt".
- `arrive()`: Fallback-Lookup.
- `merkliste.css`: neue Regeln nach dem Head-Block.

**Kopf-Werkzeuge `.mkl-tools`.**
- Markup: `<div class="mkl-tools" role="group" aria-label="Merkliste weitergeben">` mit zwei Buttons:
  - `<button class="mkl-tool" type="button" data-mkl="share">{IC_SHARE}Teilen</button>`
  - `<button class="mkl-tool" type="button" data-mkl="print">{IC_PRINT}Drucken / PDF</button>` (P0-4).
- Anatomie:
  - `.mkl-tools{display:flex;flex-wrap:wrap;gap:0 var(--sp-4);margin-top:var(--sp-1)}`
  - `.mkl-tool{display:inline-flex;align-items:center;gap:var(--sp-2);min-height:2.75rem;padding:0;border:0;background:none;color:var(--teal);font-family:inherit;font-size:var(--text-body-sm);font-weight:600;line-height:1;cursor:pointer}` · Icon 1,125 rem, Stroke 2.
  - Hover: Unterstreichung. Fokus: Ring.
- Sichtbar nur bei `items.length>0` und nicht im Geteilt-Modus. Im Leerzustand ist die Zeile `hidden` (wie „Merkliste leeren").

**Link-Format (Prototyp).** `{origin}{BASE}{LENSES[LENS].page}#liste={payload}`
- **Fragment statt Query.** Das Fragment wird nie an einen Server gesendet und erscheint nicht in Logs oder Analytics.
- `payload` = `'z.' + base64url(deflate-raw(JSON))` über `CompressionStream('deflate-raw')`. Fehlt die API: `'j.' + base64url(UTF-8 JSON)`.
- JSON (kompakt):
  ```
  { v:1, t:'2026-10-31', i:[
      { k:'m', id, l:lens, n:name, im:img, p:priceFrom, u:uvp, f:konfig?1:0, url, pa:priceAtAdd },
      { k:'c', id, a:articleId, vn:variantArticleNo, l, n, im, url, cs:configSummary, ct:configTotal, cq:configQty,
        cc:configComplete?1:0, st:configState, at:addedAt, pa:priceAtAdd } ] }
  ```
  `configHash` wird nicht mitgeschickt; beim Übernehmen wird er mit `cfgHash(st)` neu berechnet.
- **Gravurtext.** Enthält eine Konfiguration `st.gravurOn && st.gravurText`, erscheint vor dem Kopieren eine Inline-Abfrage `.mkl-shareask` unter `.mkl-tools` (`role="group"`, Fokus auf die Frage, `tabindex="-1"`):
  - Text: „Ihr Gravurtext („{Text}") ist Teil der Konfiguration. Soll er im Link enthalten sein?"
  - Buttons: `.mkl-btn` „Ohne Gravurtext teilen" (Default, zuerst) · `.mkl-link` „Mit Gravurtext teilen" · `.mkl-link` „Abbrechen".
  - Ohne Gravurtext: `st.gravurText=''` und Summary-Wert „Gravur" → „Gravur gewählt (Text nicht geteilt)".
- **Größe.** Ist die URL länger als 7.000 Zeichen, wird nicht kopiert. Toast (limit): „Ihre Merkliste ist für einen Link zu umfangreich — bitte nutzen Sie „Drucken / PDF"." · Aktion „Drucken / PDF".
- **Kopieren bzw. Teilen** wie P0-2 (Desktop Clipboard + Popover-Fallback `.mkl-sharepop`, mobil `navigator.share({title:'Meine Merkliste | Metzler', text:'{n} Artikel', url})`).
- Toast (ok, im Drawer): „Link kopiert — wer ihn öffnet, sieht Ihre Merkliste ({n} Artikel) und kann sie übernehmen."

**Empfang (alle Seiten mit `merkliste.js`).**
1. `init()`: `location.hash` beginnt mit `#liste=` → dekodieren (async bei `z.`), validieren und bereinigen:
   - `v===1`, `i` ist ein Array mit ≤ 50 Einträgen;
   - nur bekannte Schlüssel; Strings ≤ 300 Zeichen;
   - Zahlen `isFinite`;
   - `url` und `im` relativ: kein `javascript:`, kein `//`, nur `^[\w%./?=&#-]+$`;
   - jeder Text wird beim Rendern ohnehin mit `esc()` ausgegeben.
2. Ergebnis nach `sessionStorage['mtz_mkl_shared'] = {t, items:[…im v1-Item-Format…]}` schreiben, `history.replaceState` ohne Hash, Drawer im **Geteilt-Modus** öffnen.
3. Fehler beim Dekodieren → Toast (limit): „Dieser Merklisten-Link ist unvollständig oder beschädigt." Die eigene Liste bleibt unangetastet.

**Geteilt-Modus des Drawers** (Klasse `.mkl-drawer.is-shared`).

| Element | Inhalt |
|---|---|
| Titel `#mklTitle` | „Geteilte Merkliste ({n})" |
| Banner `.mkl-shared` (`role="status"`) | Zeile 1 fett: „Diese Merkliste wurde mit Ihnen geteilt" · Zeile 2: „Erstellt am {t} · Ihre eigene Merkliste ({k}) bleibt unverändert." · Buttons: `.btn.btn--primary` „In meine Merkliste übernehmen" · `.mkl-link` „Meine Merkliste anzeigen ({k})" |
| Banner-Anatomie | `background:var(--teal-100); border-left:.25rem solid var(--teal); border-radius:var(--r-l); padding:var(--sp-3) var(--sp-4); margin:var(--sp-4) var(--sp-5) 0; font-size:var(--text-body-sm); color:var(--schwarz)`; Buttons in einer Zeile mit `flex-wrap`, Gap `--sp-3` |
| Zeilen | `rowHTML(it,{shared:true})`: statt Papierkorb ein Lesezeichen-Toggle `.mkl-mark` (gleiche Position oben rechts, 2,75 rem). Es übernimmt bzw. entfernt **diesen** Eintrag in bzw. aus der eigenen Liste (`aria-pressed`, `aria-label` „{Modell} in meine Merkliste übernehmen" / „{Modell} aus meiner Merkliste entfernen"). CTA und Vergleichs-Checkbox wie gewohnt |
| `.mkl-tools`, „Merkliste leeren" | ausgeblendet |
| Footer | Vergleich wie gewohnt (geteilte Modelle sind vergleichbar); Speicherhinweis ersetzt durch „Geteilte Ansicht — wird nicht gespeichert, bis Sie sie übernehmen." |

**Übernehmen** = Union in `items` (Duplikat-Prüfung über `id`; Konfigurationen behalten ihre `configId`. Bei Kollision mit einer eigenen, anderen Konfiguration mit gleicher ID wird `cfg:<id>-s` vergeben). `priceAtAdd` wird übernommen, `addedAt` = jetzt. Danach:
- Toast (ok): „{n} Artikel in Ihre Merkliste übernommen" · Aktion „Rückgängig" (entfernt genau die übernommenen IDs).
- Bei Limit: „{n} von {m} Artikeln übernommen — Ihre Merkliste ist voll (50)." (limit).
- Der Drawer wechselt in den normalen Modus, `mtz_mkl_shared` wird gelöscht, der Fokus geht auf `#mklTitle`.

**„Meine Merkliste anzeigen"** wechselt in den normalen Modus. Die geteilte Liste bleibt in `sessionStorage`. Im normalen Modus steht dann über der Liste ein Link `.mkl-link` „Geteilte Merkliste anzeigen ({n})", bis sie übernommen oder der Tab geschlossen wird.

**Geteilte Konfiguration öffnen.** CTA-URL `pdp/index.html?merkliste=<configId>` (wie bisher). In `arrive(cid)`:
- `byId('cfg:'+cid)` findet nichts → in `mtz_mkl_shared` suchen.
- Gefunden: Wiederherstellung wie gehabt, Band-Titel „**Geteilte** Konfiguration vom {Datum}".
- Das Control steht auf Z3 „Konfiguration merken" (nicht in der eigenen Liste). Ein Klick speichert sie mit neuer `configId` in die eigene Liste.
- Nicht gefunden: Toast wie bisher.

**Speicherhinweis im Footer** (normaler Modus, Copy-Präzisierung M7): „Auf diesem Gerät gespeichert, bis Sie die Browserdaten löschen · <a>Anmelden</a>, um die Merkliste auf allen Geräten zu nutzen".

**Mobile (375).** `.mkl-tools` passt in eine Zeile (gemessen: Kopf 375 px breit, Padding `--sp-4`). Der Banner bricht die Buttons untereinander um; der Primär-Button ist volle Breite.
**Tastatur und Screenreader.**
- Tab-Reihenfolge: Titel → Leeren → × → Teilen → Drucken → Liste.
- Gravur-Abfrage: Fokus auf den Fragetext, Escape = Abbrechen, der Fokus geht zurück auf „Teilen".
- Geteilt-Modus: Fokus beim Öffnen auf den Banner (`tabindex="-1"`); Live: „Geteilte Merkliste mit {n} Artikeln geöffnet."

**Rückwärtskompatibilität.** `mtz_merkliste` bleibt `v:1`; es gibt keine neuen Pflichtfelder. `?merkliste=<id>` und `?merkliste=demo` sind unverändert; `#liste=` ist ein neues Fragment und kollidiert nicht.

**Abnahme.**
1. 3 Modelle + 1 Konfiguration mit Gravur → „Teilen" → Abfrage erscheint → „Ohne Gravurtext teilen" → URL enthält `#liste=z.` bzw. `j.`, ist ≤ 7.000 Zeichen und enthält den Gravurtext nicht (dekodiert prüfen).
2. Link in einem frischen Profil bzw. nach Leeren des Speichers öffnen: Drawer „Geteilte Merkliste (4)", Banner, eigene Liste (0) unverändert, Hash entfernt.
3. „Konfiguration öffnen" in der geteilten Ansicht → PDP stellt Farbe, Anschluss und Innenstation wieder her, Band „Geteilte Konfiguration vom …", Control „Konfiguration merken".
4. „In meine Merkliste übernehmen" → Badge 4, Toast mit „Rückgängig"; Undo → Badge 0.
5. Manipulierter Payload (`#liste=j.abc`) → Toast „… unvollständig oder beschädigt", keine Konsolenfehler.

---

### P0-4 · Merkliste drucken / als PDF speichern

**Problem.** Fachhandel, Elektriker und Architekten arbeiten mit Papier bzw. PDF (IKEA „Einkaufsliste drucken", HORNBACH „Liste drucken"). Der Druck der PLP ist heute leer (Fehler aus P0-2).

**Ort.** `merkliste.js` Handler `data-mkl="print"` → `printList()`. `merkliste.css` neuer `@media print`-Block. Das Druckdokument ist ein eigener Knoten `.mkl-printdoc` direkt in `body`, nicht der Drawer (der Drawer ist `fixed` und scrollt).

**Ablauf.** `printList()` baut `.mkl-printdoc` aus `items` (bzw. im Geteilt-Modus aus der geteilten Liste), setzt `body.mkl-printing`, ruft `window.print()` und räumt in `afterprint` auf (Fallback: `setTimeout` 1 s nach `print()`). Der Drawer bleibt offen; danach geht der Fokus zurück auf „Drucken / PDF".

**Inhalt `.mkl-printdoc`.**
- **Kopf:** „Merkliste" (h1, `--text-h2`) · rechts „edelstahl-tuerklingel.de · Stand {TT.MM.JJJJ}" (`--text-caption`).
- **Je Kategorie** eine Überschrift (h2, `--text-h4`), dann je Eintrag ein Block `break-inside:avoid`:
  - Bild 4 rem (weißer Grund);
  - Modellname `main` fett, `sub` darunter;
  - Preis wie im Drawer, inkl. Zeile aus P0-5;
  - bei Konfiguration **alle** `configSummary`-Zeilen als `<dl>` (zweispaltig: Label `--text-muted`, Wert `--schwarz`), „Gesamt … · n Stück", Status („Noch nicht vollständig — Anschluss offen" bzw. „Konfiguration abgelaufen"), **„Referenz: {configId}"**;
  - **„Im Shop: {absolute URL}"** (Konfiguration: `…?merkliste=<id>`; Modell: PDP-URL bzw. Kategorie-URL).
- **Fuß:** „Alle Preise inkl. 19 % USt., Stand {Datum}. Konfigurationen öffnen Sie im Shop über „Konfiguration öffnen" auf diesem Gerät oder über den geteilten Link."

**Druck-CSS.**
```
@media print{
  body.mkl-printing>*:not(.mkl-printdoc){display:none !important}
  .mkl-printdoc{display:block;color:#000;font-size:10pt}
}
.mkl-printdoc{display:none}
```
Keine Bildschirm-Tokens für Farbe im Druck: Text Schwarz, Linien `--graphite-300`. Seitenränder über `@page{margin:1.5cm}`.

**Copy.** Button „Drucken / PDF", `title="Drucken oder im Druckdialog als PDF speichern"`. Live: „Druckansicht der Merkliste geöffnet."
**Mobile.** Button sichtbar. Der Druckdialog des Systems übernimmt; mobil ist „Als PDF sichern" der typische Weg.
**Abnahme.**
1. Druckvorschau zeigt nur `.mkl-printdoc`, beide Kategorien gruppiert, Konfiguration mit allen Positionen und Referenz.
2. Nach dem Schließen des Dialogs: kein `.mkl-printdoc` im DOM, `body` ohne `mkl-printing`, Fokus auf dem Button.
3. Vergleich drucken funktioniert weiter (über `body.vgl-printing`).

---

### P0-5 · Aktueller Preis + „Preis seit dem Merken" in der Zeile

**Problem.** Die Zeile zeigt den Preis vom Zeitpunkt des Merkens, die Änderung bleibt unsichtbar (gemessen). OTTO zeigt den Live-Preis; 09a M12 empfiehlt, die Änderung zu benennen.

**Ort.** `merkliste.js` `load()` (Auffrischen), `itemFrom()` / `cfgItemFor()` (neues Feld `priceSrc`), `rowHTML()` (Zeile), `merkliste.css` (`.mkl-item__delta`).

**Datenregeln.**
- **Neues optionales Feld** `priceSrc`: `'plp'` (Merken auf der PLP-Karte bzw. in der Vergleichsspalte) oder `'pdp'` (PDP-Modell-Item). Konfigurationen: `'cfg'`.
- **Aktueller Preis** `cur(it)`:
  - `priceSrc==='plp'` und `BY_ID[it.articleId]` dieser Seite hat `price` → dieser;
  - `priceSrc==='pdp'` und `PDP && it.articleId===PDP.id` → `PDP.price`;
  - sonst `null`.
- **Grund für die Quellentrennung:** PLP 594,15 € und PDP 699,00 € für `colson1` sind im Prototyp verschiedene Datenquellen. Ein Vergleich über Quellen hinweg würde eine falsche Preissenkung melden. Auf JTL gibt es eine Quelle; dort entfällt die Regel.
- **Altdaten** ohne `priceSrc`: keine Änderungszeile (sicher), aber Auffrischung des Anzeigepreises, falls `cur` über die `plp`-Regel auflösbar ist **und** `it.url !== 'pdp/index.html'`.
- **Auffrischen:** Beim Laden werden `priceFrom`/`uvp` auf den aktuellen Wert gesetzt, wenn `cur(it)!==null`. Gespeichert wird nur bei Änderung. **`priceAtAdd` wird nie überschrieben** (Referenz).
- **Delta** = `round2(cur − priceAtAdd)`. Die Zeile erscheint nur, wenn `|Delta| ≥ 1,00 €` und `priceAtAdd` eine Zahl ist.
- **Konfigurationen** (`priceSrc:'cfg'`): Die Zeile erscheint nur auf der PDP nach `arrive()`, wenn `total() !== configTotal`. Dann gilt das Band (07) **und** die Drawer-Zeile. Auf der PLP gibt es keine Konfig-Preisprüfung (JTL, P1).

**Anatomie.** Unter `.mkl-item__price`: `<p class="mkl-item__delta mkl-item__delta--down|--up">{Icon}<span>{Text}</span></p>`
- `font-size:var(--text-caption); line-height:1.45; color:var(--text-muted); display:flex; gap:var(--sp-1); align-items:flex-start; margin:var(--sp-1) 0 0`.
- Icon 0,875 rem: Pfeil nach unten in `--green` (Nicht-Text-Kontrast 3,6:1 ≥ 3:1) bzw. Pfeil nach oben in `--graphite-500`.
- Text immer `--text-muted` (5,4:1). Bei `--down` ist der Betrag `--schwarz`, `font-weight:600`.
- **Kein Rot** (Rot ist für Sale und Entfernen reserviert).

**Copy.**
- gesunken: „Seit dem Merken gesunken: −40,00 € (vorher 464,15 €)"
- gestiegen: „Seit dem Merken gestiegen: +20,00 € (vorher 404,15 €)"
- Screenreader: identisch (kein separates `aria-label` nötig).
- Kein „günstig", kein Ausrufezeichen.

**Zustände.** Kein Delta → nichts. Preis unbekannt → nichts. Nicht interaktiv.
**Mobile.** Die Zeile bricht unter dem Preis um; keine Abschneidung.
**Abnahme.**
1. Karte merken → in der Konsole `priceAtAdd` auf `price + 40` setzen → `MTZ_MKL.reload()` → Zeile „Seit dem Merken gesunken: −40,00 € (vorher …)", Preis zeigt den aktuellen Wert.
2. `colson1` auf der PDP merken (`priceSrc:'pdp'`) → auf der PLP öffnen → **keine** Änderungszeile.
3. Altdaten ohne `priceSrc` → keine Zeile, kein Fehler.
4. Delta 0,50 € → keine Zeile.

---

### P0-6 · Konfigurations-Zeile: „Alle Positionen anzeigen"

**Problem.** Der Drawer zeigt nur 3 von bis zu 7 Positionen (Farbe → Anschluss → Gravur → Innenstation → Stromversorgung → Zubehör → Menge). Ihre Anlage erkennt die Kundin erst an Innenstationen und Zubehör wieder (IKEA „Enthaltene Teile anzeigen").

**Ort.** `merkliste.js` `rowHTML()` im Zweig `cfg` (heute `.mkl-item__cfg`), Click-Handler im Drawer, Modulvariable `openParts = {}` (überlebt `render()`); `merkliste.css`.

**Anatomie.**
- `configSummary.length ≤ 3`: unverändert.
- `> 3`: unter der Zusammenfassungszeile ein Button `<button class="mkl-item__more" type="button" aria-expanded="false" aria-controls="mkl-parts-{safeId}">Alle Positionen anzeigen ({n})</button>`.
  - Stil: Textbutton, `min-height:2.75rem; padding:0; color:var(--teal); font-size:var(--text-caption); font-weight:600`, Chevron 1 rem dreht um 180° (Transition 150 ms, Reduced Motion: keine).
- Aufgeklappt: Die Zusammenfassungszeile wird ausgeblendet. Es erscheint `<dl class="mkl-item__parts" id="mkl-parts-{safeId}">` mit allen Paaren:
  - Grid `grid-template-columns:minmax(6rem,auto) 1fr; gap:var(--sp-1) var(--sp-3)`;
  - `dt` `--text-muted`, `dd` `--schwarz`, beide `--text-caption`;
  - oben `border-top:.0625rem solid var(--graphite-200); padding-top:var(--sp-2)`.
  - Button-Text: „Weniger anzeigen".
- `safeId` = `id` mit `[^a-z0-9-]` → `-`.

**Zustände.** Default · Hover (Unterstreichung) · Fokus (Ring) · Expanded. Unvollständige Positionen („noch zu wählen") stehen im `dd` kursiv.
**A11y.** `aria-expanded` wechselt; der Fokus bleibt auf dem Button (auch nach `render()`: Fokus per `data-id` wiederherstellen).
**Abnahme.** PDP: Konfiguration mit Farbe, Anschluss, Innenstation, Strom und Zubehör merken → Drawer zeigt 3 Positionen + „Alle Positionen anzeigen (5)" → Klick: 5 `dt/dd`; nach Entfernen und Undo einer anderen Zeile bleibt der Zustand offen.

---

### P0-7 · Aus der Merkliste: „Alle n auswählen"

**Problem.** Wer 2–4 Modelle einer Kategorie gemerkt hat, muss jede Checkbox einzeln setzen (Thomann: „Alle vergleichen").

**Ort.** `merkliste.js` `syncCmp()` (Sichtbarkeit und Label), `groupHTML()` (gemischte Liste), Footer `.mkl-foot` (einheitliche Liste); `merkliste.css`.

**Regel.** `c(lens)` = Anzahl der Modell-Items (ohne `configId`) dieser Lens.
- Gezeigt wird der Link nur bei `2 ≤ c ≤ 4`.
- Bei `c > 4` erscheint kein Link; die Kundin wählt selbst (Cap).
- Liegt die Auswahl schon bei einer anderen Lens, ist der Link dieser Gruppe verborgen (Lock-Hinweis wie 06).

**Platzierung.**
- Einheitliche Liste: `<button class="mkl-link mkl-foot__all" type="button" data-mkl="cmp-all" data-lens="{lens}">Alle {c} auswählen</button>` im Footer **vor** `.mkl-foot__hint`.
- Gemischte Liste: gleicher Button im Gruppenkopf `.mkl-group` rechts (`margin-left:auto`), Label „Alle {c} auswählen".

**Verhalten.** Klick → `cmpSel` = alle Modell-IDs dieser Lens → `syncCmp()`. Der Fokus geht auf den CTA („3 Türsprechanlagen vergleichen"); Live: „{c} Modelle zum Vergleich ausgewählt." Sind alle gewählt, lautet das Label „Auswahl aufheben" (setzt `cmpSel=[]`).
**Zustände.** Default/Hover/Fokus wie `.mkl-link` (2,75 rem Höhe).
**Mobile.** Im Footer in derselben Zeile wie der Hinweis; bei Platzmangel bricht der Hinweis darunter (`flex-wrap` besteht).
**Abnahme.** 3 Sprechanlagen gemerkt → Footer „Alle 3 auswählen" → CTA aktiv „3 Türsprechanlagen vergleichen" → Klick öffnet den Vergleich mit `?vergleich=…` (P0-2). Gemischte Liste (2 + 2): je Gruppe ein Link; nach Wahl in Gruppe A ist der Link in Gruppe B verborgen.

---

### P0-8 · Mobiler Vergleich: zwei volle Spalten + Anschnitt

**Problem.** Bei 375 px sind heute ≈ 1,5 Produktspalten sichtbar (Label 112 px + Spalte 168 px). NN/g und Apple empfehlen auf dem Phone 2 Spalten.

**Ort.** `vergleichen.css`, letzter Block `@media(max-width:47.99rem)` (ab Z. 475). Neue Regeln **ans Ende** dieses Blocks.

**Regeln.**
```
@media(max-width:47.99rem){
  .vgl-view__scroll-in{padding-inline:.75rem}
  table.vgl-t col.rl{width:5.5rem}
  table.vgl-t col.pc{width:calc((100vw - 8.75rem) / 2)}       /* 1,5 rem Rand + 5,5 rem Label + 1,75 rem Anschnitt der 3. Spalte */
  table.vgl-t col.pc--add{width:6rem}
  table.vgl-t th,table.vgl-t td{padding:.5rem .5rem}
  table.vgl-t tbody .rh{font-size:.75rem;line-height:1.3;hyphens:auto;overflow-wrap:anywhere}
  table.vgl-t thead th.vgl-ph{padding:.5rem .5rem 3.25rem}
  .vgl-ph__name{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .vgl-ph__price{font-size:var(--text-body-sm)}
  .vgl-ph .btn{left:.5rem;right:.5rem;bottom:.5rem;font-size:.8125rem;padding:0 .5rem}
  .vgl-view__scroll{scroll-snap-type:x proximity;scroll-padding-inline-start:6.25rem}
  table.vgl-t thead th.vgl-ph{scroll-snap-align:start}
}
```
- Bei 375 px ergibt das je Spalte 7,34 rem (117 px), bei 414 px 8,56 rem. Die 3. Spalte ist 1,75 rem angeschnitten (Scroll-Hinweis, NN/g).
- Bei genau 2 Modellen + Add-Spalte gilt die gleiche Breite; die Add-Spalte liegt im Anschnitt.
- Der Name hat das 3-Zeilen-Limit (Kundenregel); `title` trägt den vollen Namen (besteht).
- **Fixe Kopfhöhe bleibt** (Kundenregel). Ziel: `thead` ≤ 19 rem (304 px) bei 375 × 812; gemessen heute 305 px.
- **Kein JS nötig.** Optional: Steht nach dem Öffnen `scrollLeft===0` und gibt es > 2 Modelle, erscheint einmal pro Sitzung über dem Kopf ein Hinweis `.vgl-swipe` „Wischen für weitere Modelle ›" (`--text-caption`, `--text-muted`, verschwindet beim ersten horizontalen Scroll; `aria-hidden="true"`, weil die Tabelle für Screenreader ohnehin linear ist).

**A11y.** Die Tabellensemantik bleibt unverändert (kein `display:grid` auf Tabellenelementen). `caption` besteht.
**Abnahme (375 × 812).**
1. Mit 3 Modellen: Spalte 1 und 2 vollständig sichtbar (rechte Kante Spalte 2 ≤ 375 − 28 px), Spalte 3 mit 1,5–2 rem sichtbar.
2. `thead` ≤ 304 px.
3. Preis „ab 1.266,50 €" ohne Umbruch.
4. CTA-Label einzeilig.
5. Kein horizontaler Seiten-Scroll außerhalb des Overlays.
6. Desktop 1440 unverändert (`col.pc` 15 rem).

---

### P0-9 · Modell im Vergleich hinzufügen: Suche im Overlay

**Problem.** „Modell hinzufügen" schließt heute den Vergleich und schickt die Kundin ins Grid. Bosch, Thomann (Nummer) und Apple (Dropdown je Slot) fügen hinzu, ohne die Tabelle zu verlassen. Artikelnummern fehlen in den Prototyp-Daten; deshalb wird nach Modellnamen gesucht.

**Ort.** `vergleichen.js` `renderView()` Add-Spalte (Z. 618), Click-Handler `k==='add'`, neue Funktion `openAddSearch()`; `vergleichen.css` neuer Block `.vgl-addsearch`.

**Verhalten.**
- Klick auf die Kachel `[data-vgl="add"]` (Desktop **und** Leerzustand) öffnet ein Panel. `addFromGrid()` bleibt als sekundärer Link.
- **Desktop ≥ 48 rem:** Popover `.vgl-addsearch`, verankert an der Add-Spalte (`position:absolute` im `th.vgl-ph--add`, `top:0; right:0; width:20rem`, z-index über dem Sticky-Kopf), `background:var(--white); border:.0625rem solid var(--graphite-300); border-radius:var(--r-l); box-shadow:var(--shadow-lg); padding:var(--sp-4)`.
- **Mobil < 48 rem:** Bottom-Sheet im Dialog (`position:fixed; inset:auto 0 0 0; max-height:70vh; border-radius:var(--r-xl) var(--r-xl) 0 0; padding:var(--sp-4) var(--sp-4) calc(var(--sp-4) + env(safe-area-inset-bottom))`), darüber ein Scrim `--white-50`.
- **Inhalt:**
  - Label `<label for="vglAddQ">Modell suchen</label>` (`--text-body-sm`/600);
  - Eingabe `<input id="vglAddQ" type="search" role="combobox" aria-autocomplete="list" aria-expanded aria-controls="vglAddList" autocomplete="off" placeholder="z. B. VDM10, Colson, Siebert">` (Höhe 2,75 rem, Rand `--graphite-300`, Fokus `--teal`-Ring);
  - Liste `<ul id="vglAddList" role="listbox">`, max. 6 Optionen `role="option"` mit Thumb 2,5 rem (weißer Grund), Name `shortName().main` (fett) + `sub` (`--text-muted`), rechts „ab {Preis}";
  - Fuß: `.vgl-link` „Auf der Produktliste wählen" (= `addFromGrid()`) und, falls `mklCount()`, „Aus der Merkliste ({n})" (= `addmkl`);
  - Schließen-× 2,75 rem.
- **Ohne Eingabe** zeigt die Liste bis zu 6 Vorschläge: zuerst Modelle aus der Merkliste dieser Lens, dann die nächsten Alternativen (`alternatives()`, falls Twin), dann nach Beliebtheit (`reviews` absteigend). Überschrift der Gruppe: „Aus Ihrer Merkliste" bzw. „Vorschläge" (`role="presentation"`-Zeilen).
- **Matching:** Kleinschreibung; Umlaute normalisiert (ä→a etc.); Token-UND über `name`, `design`, Modellcode und, falls vorhanden, `p.artNr`. Nur die eigene Lens, nicht bereits gewählt.
- **Auswahl** (Klick, Enter) → `toggle(id,true)` → Panel schließt → `renderView()` → Fokus auf das × der neuen Spalte; Live: „{Modell} hinzugefügt. Vergleich mit {n} Modellen."; URL per `replaceState` (P0-2).
- **Leer:** Option-lose Liste + Text `role="status"`: „Kein passendes Modell bei {Türsprechanlagen} gefunden."

**Tastatur.** ↓/↑ bewegt `aria-activedescendant`; Enter wählt; Escape schließt **nur** das Panel (wie der Toggletip), der Fokus geht zurück auf die Kachel. Tab bleibt in der Fokusfalle des Dialogs.
**Zustände Option.** Default · Hover/aktiv `background:var(--teal-5)` · Fokus über `aria-activedescendant` mit `outline` an der Option.
**Cap.** Die Add-Spalte existiert nur bei < 4 (besteht); nach dem 4. Modell verschwindet sie.
**Abnahme.**
1. Vergleich mit 2 Modellen → Kachel → Panel offen, Fokus im Feld, 6 Vorschläge.
2. „horizon" → 1 Treffer → Enter → 3 Spalten, Fokus auf dem ×, URL aktualisiert.
3. „xyz" → Leertext.
4. Escape schließt das Panel, nicht den Dialog.
5. Mobil 375: Sheet unten, Eingabe über der Tastatur sichtbar, Treffer ≥ 2,75 rem hoch.

---

### P0-10 · Kaufpfad aus dem Vergleich + „Zurück zum Vergleich" auf der PDP

**Problem.** Der Spalten-CTA endet im Prototyp-Toast, auch für `colson1`, das eine PDP hat. Von der PDP führt kein Weg zurück in den Vergleich (Flow-Bruch).

**Ort.**
- `vergleichen.js`: `renderView()` Kopfzellen-CTA (Z. 615), Click-Handler `[data-go]` (Z. 249), neue Map `PDP_URLS={colson1:'pdp/index.html'}` (gleich wie in `merkliste.js`).
- `merkliste.js` `initPdp()`: Rückweg-Link.
- `merkliste-pdp.css`: Stil `.mkl-return`.

**Vergleich → PDP.**
- Hat `PDP_URLS[p.id]` einen Eintrag, wird der CTA als `<a class="btn btn--primary" href="{url}" data-go="{id}">` gerendert (Label unverändert: „Konfigurieren" bzw. „Zum Produkt"). Sonst bleibt `<button data-go>` mit dem bestehenden Toast.
- Klick auf `<a>`:
  - `sessionStorage['mtz_return'] = {type:'vergleich', href:'{page}?vergleich={ids}', n:{anzahl}, lens, t:Date.now()}`;
  - `{page}` = `index.html` bzw. `briefkasten.html`, relativ zu `vergleichen-flow-B`;
  - dann normale Navigation (kein `preventDefault`).

**PDP: Rückweg-Link.**
- `initPdp()` liest `mtz_return`, gültig < 2 h und `type==='vergleich'`.
- Einfügen als letztes Kind von `.crumb .container`: `<a class="mkl-return" href="{BASE}{href}">{Chevron-links 1 rem}<span>Zurück zum Vergleich ({n})</span></a>`.
- CSS:
  - `.crumb .container{display:flex;align-items:center;justify-content:space-between;gap:var(--sp-4)}`
  - `.mkl-return{display:inline-flex;align-items:center;gap:var(--sp-1);min-height:2.75rem;flex:0 0 auto;color:var(--teal);font-size:var(--text-body-sm);font-weight:600;text-decoration:none}`
  - Hover: Unterstreichung. Fokus: Ring.
- `< 30rem`: Label „Zum Vergleich ({n})"; die Breadcrumb-`ol` behält `overflow-x:auto` und `min-width:0`.
- Ziel-Seite öffnet den Vergleich über `?vergleich=` (P0-2: Ankunft, kein Toast).
- Der Link verschwindet, wenn `mtz_return` abgelaufen ist oder die Kundin über die PLP-Navigation (nicht über diesen Link) zurückkehrt. Das Löschen geschieht in `vergleichen.js` beim Schließen des Overlays.

**Copy.** „Zurück zum Vergleich (3)" · `aria-label="Zurück zum Vergleich mit 3 Modellen"`.
**Abnahme.**
1. Vergleich mit `colson1` → „Zum Produkt" in der Colson-Spalte → PDP lädt; Breadcrumb-Zeile rechts „Zurück zum Vergleich (3)".
2. Klick → `index.html?vergleich=…`, Overlay offen mit denselben 3 Spalten und derselben Reihenfolge.
3. CTA eines Modells ohne PDP → bestehender Toast.
4. PDP direkt aufrufen (ohne `mtz_return`) → kein Link.
5. Mobil 375: Link sichtbar, Breadcrumb nicht überlagert.

---

### P1 · JTL-Integration (serverabhängig)

| # | Baustein | Kurzspezifikation |
|---|---|---|
| J1 | **Konto-Merge** | Wie 05 §3.7: Union beim Login (Gast-`localStorage` + Konto), Konfigurationen in `plugin_mtz_merkliste_cfg`. Nach dem Merge: `localStorage` = Spiegel des Kontos |
| J2 | **Merklisten-Code + Kurzlink** | `POST /merkliste/teilen` → Snapshot-Token, 8 Zeichen Crockford-Base32 (ohne 0/O/1/I), z. B. `MTZ-7K4Q-9R2D`; Link `/merkliste/<code>`; Gültigkeit 12 Monate, im UI genannt: „Gültig bis {Datum}". Ersetzt `#liste=` (bleibt als Fallback). Gravurtext nur mit Zustimmung (gleiche Abfrage wie P0-3). Feld „Code eingeben" im Drawer-Leerzustand und auf `/merkliste` |
| J3 | **`/merkliste`-Seite** | Eigene URL (09a M8), gleiche Zeilenkomponente wie der Drawer, Tabs „Merkliste / Vergleiche" (Galaxus-Hub), `noindex` |
| J4 | **`/vergleich/<ids>`-Seite** | Serverseitig gerenderter Vergleich mit gleicher Tabelle; Titel „X vs. Y – Metzler", `rel=canonical` auf sortierte IDs; das Overlay verlinkt dorthin („In neuem Tab öffnen") |
| J5 | **Echtes PDF** | jsPDF + autotable aus dem Konfigurator: Logo, Datum, je Eintrag Bild, Artikelnummer, Positionen, Preise, Code bzw. QR auf den Kurzlink (J2). Ersetzt den Druckdialog-Weg |
| J6 | **Live-Preise und Verfügbarkeit** | Endpunkt `GET /merkliste/status?ids=` → aktueller Preis, Verfügbarkeit, `configExpired`, `configTotal` neu berechnet. Speist P0-5 auch für Konfigurationen und Kategorien außerhalb der aktuellen Seite. `priceSrc` entfällt |
| J7 | **Preis- und Verfügbarkeitsalarm** | Per E-Mail mit Double-Opt-in, je Eintrag „Bei Preisänderung benachrichtigen" (Konto oder E-Mail). Keine App-Pflicht (OTTO-Anti-Pattern) |
| J8 | **Artikelnummer im Vergleich** | `p.artNr` aus der JTL-Artikelnummer bzw. Herstellernummer; Label in P0-9 wird „Modell oder Artikelnummer" |
| J9 | **Farbe in der Vergleichsspalte** | Swatch-Selektor mit JTL-Variationsbild und Aufpreis (Wunschfarbe); übergibt `?farbe=<artikel>` an die PDP, die die Farbe vorwählt (S1). Erst wenn die Variationsdaten vorliegen |
| J10 | **Mehrere Listen / Projekte** | Nur mit Konto; automatische Benennung „Merkliste vom {Datum}", Umbenennen; Menge je Eintrag + Projektsumme für B2B (Mehrfamilienhaus, Briefkastenanlage); verbunden mit „Angebot anfordern" (B2B-Phase) |
| J11 | **PDP-Einstieg „Vergleichen"** | Falls gewünscht: Textlink „Mit ähnlichen Modellen vergleichen" im Technik-Tab, nicht in der Buybox (08 bleibt). Legt das Modell in den Lens-Slot und öffnet die PLP im Modus |
| J12 | **Tracking** | Events `mkl_add`, `mkl_share`, `mkl_share_open`, `mkl_takeover`, `mkl_print`, `vgl_open`, `vgl_share`, `vgl_link_open`, `vgl_add_search`, `vgl_to_pdp`, `pdp_back_to_vgl`. Grundlage für §5 |

### Verworfen (mit Grund)

| Kandidat | Grund |
|---|---|
| Farbwahl in der Vergleichsspalte (jetzt) | Keine Farbpreise bzw. -bilder im Datenmodell; Farbe ändert keinen Vergleichswert; Konfiguration gehört auf die PDP. → J9 |
| Menge und Summe in der Merkliste (jetzt) | Eine Summe aus „ab"-Preisen täuscht. Mengen leben in der Konfiguration (gebaut). → J10 |
| „Alle in den Warenkorb" / Warenkorb in Liste oder Vergleich | Kundenregel (konfigurierte Produkte) |
| Spalten umsortieren (Drag bzw. Sortierung) | ≤ 4 Spalten, Preis-Delta je Spalte vorhanden, Drag auf Touch fehleranfällig; geringer Hebel (09a selbst: „geringer Hebel") |
| Mehrere Listen als Gast | Komplexität ohne Konto-Gegenwert. → J10 |
| Eigene Gruppe „Die wichtigsten Unterschiede" | Bereits abgedeckt durch Urteil + Sprung-Chips + „Auf einen Blick" + Auto-„Nur Unterschiede"; eine weitere Gruppe doppelt Zeilen und erhöht die Länge |
| Eingabefeld „Artikelnummer" im Prototyp | Keine Artikelnummern in den Daten → Suche nach Modellname (P0-9); Nummer folgt mit J8 |
| Herz statt Lesezeichen | Kundenentscheidung; Wiedererkennung als Test (§5) |
| Login-Wand, Einwilligungsdialog für den Vergleich | Anti-Patterns (09a §5) |
| Cap-Modal, Toast beim Hinzufügen zum Vergleich, Header-Flyout | Tray und `aria-disabled` + Toast reichen; Modal unterbricht (09a §5) |
| Leere Tray-Slots (jetzt) | Textzeile „bis zu n weitere möglich" trägt die Kapazität; mobil kostet die Slot-Reihe Höhe. → §5 |
| Konto-Werbung im Merken-Toast (jetzt) | Bricht die Ein-Aktions-Regel des Toasts. → §5 |
| Dritte PDP-Merken-Instanz / PDP-Vergleichen in der Buybox | 08 ist entschieden. → J11 nur außerhalb der Buybox |
| Sortieren der Merkliste | Geringer Nutzen bei 2–8 Einträgen; Kategorie-Gruppen bestehen |

---

## 4 · Flow-Abnahme (Testskript für den Engineer)

**Vorbereitung.** Server `python -m http.server 8821 --bind 127.0.0.1` in `vergleichen-flow-B`. Vorhandene Werte von `localStorage.mtz_merkliste`, `localStorage.mtz_vgl`, `sessionStorage.*` sichern, für den Test leeren und am Ende zurückschreiben. Konsole offen; bei jedem Schritt gilt: keine Fehler.

### 4.1 Desktop 1440 × 900 — Happy Path

1. `index.html`: Lesezeichen auf Karte 1, 3 und 4 → Badge 3, Toast „Gemerkt · Zur Merkliste".
2. Toolbar „Vergleichen" → Karten-Checkboxen erscheinen; Karte 1, 3, 6 markieren → Tray „Vergleich (3)".
3. `localStorage.mtz_vgl.lenses.sprechanlage.ids` = 3 IDs; `sessionStorage.mtz_vgl_mode.sprechanlage` = 1 (P0-1).
4. „Vergleichen" im Tray → Overlay; URL `?vergleich=…`; Titel „Vergleich: … vs. …" (P0-2).
5. „Link kopieren" → Label „Link kopiert", Toast; Zwischenablage ohne `von` (P0-2).
6. Add-Kachel → Suche „horizon" → Enter → 4 Spalten, Add-Spalte weg, URL mit 4 IDs, Fokus auf dem neuen × (P0-9).
7. × an Spalte 4 → 3 Spalten, URL mit 3 IDs.
8. Spalte VDM10 Colson → „Zum Produkt" → PDP lädt; rechts in der Breadcrumb-Zeile „Zurück zum Vergleich (3)" (P0-10).
9. PDP: Farbe wählen, Anschluss, Innenstation, Stromversorgung, Zubehör → „Konfiguration merken" → Toast; Badge 4.
10. „Zurück zum Vergleich (3)" → `index.html`, Overlay offen mit denselben 3 Spalten (P0-2 Ankunft).
11. Browser-Zurück → PDP; Browser-Vor → PLP mit offenem Vergleich; × schließt; Zurück-Taste verlässt jetzt die PLP nicht unerwartet (Overlay war Ankunft → `replaceState`).
12. Header-Lesezeichen → Drawer: Konfigurationszeile mit 3 Positionen + „Alle Positionen anzeigen (n)" → aufklappen (P0-6).
13. Footer „Alle 3 auswählen" → CTA „3 Türsprechanlagen vergleichen" → Klick → Vergleich, Toast „Vergleich mit 3 Modellen aus Ihrer Merkliste", URL ohne `von` (P0-7, P0-2).
14. Drawer → „Drucken / PDF" → Vorschau nur Merkliste, alle Positionen, Referenz, URLs; Dialog schließen → Fokus zurück (P0-4).
15. Drawer → „Teilen" → Gravur-Abfrage (falls Gravur gewählt) → „Ohne Gravurtext teilen" → Toast „Link kopiert …" (P0-3).
16. Strg+P auf der PLP ohne Overlay → normale Seite (Druck-Fix).

### 4.2 Mobile 375 × 812 (Viewport-Emulation, danach auf Desktop zurücksetzen)

17. `index.html`: Lesezeichen sind auf den Karten sichtbar (≥ 2,75 rem); „Vergleichen" → 3 Modelle → Tray zweizeilig, CTA-Rechtskante ≤ 359 px.
18. Vergleich öffnen: zwei Produktspalten vollständig, dritte angeschnitten; `thead` ≤ 304 px; Wischen rastet an Spaltenanfängen ein (P0-8).
19. Leiste: „Nur Unterschiede (n)" · „Teilen" · „Leeren" in einer Zeile. „Teilen" öffnet das native Share-Sheet bzw. kopiert (P0-2).
20. Add-Kachel → Bottom-Sheet mit Suche; Treffer wählen → Spalte ergänzt (P0-9).
21. Drawer (Vollbild): „Teilen" und „Drucken / PDF" in einer Zeile; Preisänderungszeile bricht sauber um (P0-5); „Alle Positionen anzeigen" funktioniert (P0-6).
22. PDP mobil über den Vergleichs-CTA: „Zum Vergleich (3)" sichtbar, Breadcrumb nicht überlagert (P0-10).

### 4.3 Grenzfälle

| # | Fall | Schritte | Erwartung |
|---|---|---|---|
| E1 | **Cap erreicht** | 4 Modelle im Modus, 5. Karte antippen | 5. Checkbox `aria-disabled`, Toast „Maximal 4 Modelle …"; im Overlay keine Add-Spalte; Link mit 5 IDs öffnet die ersten 4 + Toast „Es werden die ersten 4 Modelle verglichen." |
| E2 | **Kategorie-übergreifend (Vergleich)** | 3 Sprechanlagen wählen → `briefkasten.html` → 2 Briefkästen wählen → zurück | Beide Auswahlen bleiben getrennt erhalten (P0-1); Link `index.html?vergleich=siebert,ebenhard` → Toast „… gehören zur Kategorie Briefkästen …" mit „Dort öffnen" |
| E3 | **Kategorie-übergreifend (Merkliste)** | 2 Sprechanlagen + 2 Briefkästen merken, Drawer | Gruppen; je Gruppe „Alle 2 auswählen"; nach Wahl in einer Gruppe ist der Link der anderen verborgen, Lock-Hinweis sichtbar; Briefkasten-Vergleich von `index.html` aus → Navigation nach `briefkasten.html?vergleich=…&von=merkliste` → Overlay offen, `von` aus der URL entfernt |
| E4 | **Leere Liste** | Merkliste leeren | Leerzustand, `.mkl-tools` und Footer verborgen; „Rückgängig" stellt alles inkl. `.mkl-tools` wieder her |
| E5 | **Abgelaufene Konfiguration** | In `mtz_merkliste` bei einem `cfg:`-Item `configState.article='99999'` setzen → „Konfiguration öffnen" | Band „Diese Farbe ist nicht mehr verfügbar …", Item `configExpired:true`, Drawer-CTA „Konfigurieren", Zeile „Konfiguration abgelaufen — …"; Druckansicht zeigt den Status |
| E6 | **Geteilter Merklisten-Link, frische Sitzung** | Link aus Schritt 15 in einem neuen Profil bzw. nach Leeren des Speichers öffnen | „Geteilte Merkliste (n)", eigene Liste (0); „Konfiguration öffnen" stellt auf der PDP wieder her, Band „Geteilte Konfiguration vom …"; „In meine Merkliste übernehmen" → Badge n, Undo funktioniert |
| E7 | **Geteilter Vergleichs-Link, frische Sitzung** | Link aus Schritt 5 in einem neuen Profil öffnen | Overlay sofort offen, Modus an, Slot gespeichert; Zurück-Taste verlässt das Overlay **nicht** in eine leere History (Ankunft = `replaceState`); × schließt und lässt die PLP stehen |
| E8 | **Vergleichs-Link überschreibt eigene Auswahl** | Eigene Auswahl (2) gespeichert, fremden Link öffnen | Toast „Geteilter Vergleich geöffnet." mit „Meine Auswahl (2) wiederherstellen" → stellt sie her, URL aktualisiert |
| E9 | **Preis geändert** | Karte merken; in der Konsole `priceAtAdd = price + 40` → `MTZ_MKL.reload()`; zusätzlich ein Item mit `priceAtAdd = price − 20` | Zeilen „Seit dem Merken gesunken: −40,00 € (vorher …)" und „… gestiegen: +20,00 € …"; PDP-gemerktes `colson1` auf der PLP ohne Zeile |
| E10 | **Beschädigter Link** | `index.html#liste=j.xxx` und `index.html?vergleich=foo,bar` | Toast „… unvollständig oder beschädigt" bzw. „Dieser Vergleichs-Link ist nicht mehr gültig."; eigene Daten unverändert |
| E11 | **Speicher blockiert** | `localStorage` per DevTools sperren (bzw. `storageOk=false` simulieren) | Merkliste-Hinweis wie gehabt; Vergleich funktioniert in-memory; keine Konsolenfehler |
| E12 | **Zwei Tabs** | Tab A Vergleich, Tab B Auswahl ändern | Tab A übernimmt über den `storage`-Event; Merkliste-Live „… in einem anderen Tab geändert" |
| E13 | **Alter Speicherstand** | `sessionStorage.mtz_vgl_flow='["colson1","kian1"]'`, `mtz_vgl` leer, `mtz_merkliste` v1 ohne `priceSrc` | Migration in den Slot, alter Schlüssel gelöscht; Merkliste rendert ohne Änderungszeile |
| E14 | **Merkliste voll (50) + Übernahme** | Eigene Liste mit 49 Items, geteilte Liste mit 3 | Toast „1 von 3 Artikeln übernommen — Ihre Merkliste ist voll (50)." |
| E15 | **Tastatur komplett** | Vergleich nur mit Tab, Enter, Escape, Pfeiltasten bedienen | Fokusfalle hält; Escape schließt zuerst Toggletip bzw. Such-Panel, dann den Dialog; Fokus kehrt jeweils an den Auslöser zurück |

**Schluss.** Gesicherte Speicherwerte zurückschreiben, Viewport auf Desktop zurücksetzen.

---

## 5 · Offene Punkte / Test-Hypothesen

1. **A/B: Karten-Checkbox „Vergleichen" immer sichtbar vs. Modus** (Kundenregel bleibt bis zum Test). Die Research spricht klar dagegen: 9 von 9 Vergleichs-Shops verzichten auf einen Modus; Baymard 2022 empfiehlt „visible by default".
   - Hypothese: Die dauerhaft sichtbare Checkbox unter dem Preis erhöht die Vergleichsstarts je PLP-Sitzung um ≥ 20 %, ohne die Klickrate auf „Konfigurieren / Zum Produkt" zu senken.
   - Metriken: `vgl_open` je Sitzung, Karten-CTR, Konversion in Konfiguration. Laufzeit bis 2 × 400 Vergleichsstarts.
2. **Cap 3 vs. 4.** Markt-Standard 3 (Apple, Samsung, Bosch, Miele). Hypothese: Bei 4 Spalten sinkt die Abschlussrate aus dem Vergleich nicht. Messen: Anteil Vergleiche mit 4 Modellen; Scrolltiefe. Mobil sind ohnehin 2 Spalten sichtbar.
3. **Auto-„Nur Unterschiede" ab 60 %.** Kein Marktvorbild. Hypothese: Der Toggle wird seltener manuell zurückgeschaltet als eingeschaltet. Messen: Toggle-Events nach dem Öffnen.
4. **Leere Tray-Slots** (Miele, Samsung) statt Textzeile — Test auf Desktop, wenn der Tray-Platz es erlaubt.
5. **Konto-Nutzen im ersten Merken-Toast** (IKEA) vs. nur im Footer: Kontoerstellungen ohne Anstieg der Merken-Abbrüche?
6. **Lesezeichen-Erkennung** (Herz 8 von 9 im Markt): First-Click-Test auf der PLP-Karte; bei < 80 % Erkennung Coach-Mark beim ersten Besuch (06 hatte es verworfen) oder Label „Merken" am Hover/Fokus prüfen.
7. **Link-Länge.** `#liste=` mit Konfigurationen kann in Messengern umbrechen; bis J2 (Kurzcode) beobachten: Anteil `mkl_share` mit Länge > 2.000 Zeichen.
8. **Datenqualität Preis.** PLP 594,15 € vs. PDP 699,00 € für `colson1`. Vor dem Kunden-Review klären, welcher Wert gilt; im Prototyp verhindert `priceSrc` eine falsche Änderungsmeldung.
9. **Wann verlässt der Vergleich das Overlay?** Mit J4 (eigene Seite) prüfen, ob Overlay und Seite parallel bestehen sollen (Overlay = schnell aus der PLP, Seite = teilen, SEO).
