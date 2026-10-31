# 07a — PDP-Merkliste: Flow & UX-Spezifikation (Version B, „Konfiguration merken")

Datum: 2026-10-31 · Scope: `Deliverables/vergleichen-flow-B/pdp/index.html` (+ `pdp-b.js`, `pdp-b.css`) und das bestehende Add-on `merkliste.js` / `merkliste.css` · Rolle: Lead UX Design
Baut auf: `05_Merkliste_Flow_und_Interface.md` (§3.2 / P1 „Konfiguration merken" wird hier vollständig definiert), `06_Flow-Audit_Umsetzung.md` (Drawer-Stand v4: Toast im Dialog, Undo-Fokus, Gruppen, Konfigurations-Zeile mit Tag).
Wording unverändert: **Merkliste / Merken / Gemerkt** — nie „Wishlist", „Wunschzettel", „günstig". Präfix `mkl-`. Der Kaufpfad (`#bCart`, `#pdpStickyCta`, `#bSheetCart`, `addToCart()`) wird nicht verändert.

Gemessen am Prototyp (1440 × 900 / 375 × 812): Desktop-Buybox rechts, Zeile „★ 4,5 · Produkt teilen" (`.bx-cred`) bei y ≈ 353, Farbwahl y ≈ 660, nach Farbwahl entfaltet sich der Konfigurator (639 px) und die Kaufzeile (`.cfgb-buyrow`: Menge + „In den Warenkorb") liegt ≈ 1.100 px unter der Teilen-Zeile; Sticky-Bar erscheint, sobald `#bCart` aus dem Viewport ist. Mobile: Titel → Sterne/Teilen → Galerie → Preis → Farbe → Konfigurator → Kaufzeile; „Preisdetails & Menge" bleibt verborgen, bis ein kostenpflichtiges Extra gewählt ist.

---

## 1 · Entscheidung in 10 Zeilen

1. **Ein Control, ein Zustand, drei Instanzen.** `button.mkl-mark[aria-pressed]` erscheint (A) in der Zeile neben „Produkt teilen", (B) direkt unter der Kaufzeile, (C) in der Sticky-Bar. Alle drei zeigen denselben Zustand und lösen dieselbe Aktion aus. Kein zweiter Button-Typ, keine zwei Listen.
2. **Das Objekt hängt am Zustand der Seite, nicht am Button.** Ohne gewählte Farbe wird das **Modell** gemerkt (wie auf der PLP). Sobald eine Farbe gewählt ist — Farbe = eigene Artikelnummer, also schon eine Entscheidung — wird die **Konfiguration** gemerkt: Farbartikel, alle gewählten Optionen, Menge, Gesamtpreis. Das Label sagt es: „Merken" → „Konfiguration merken" (gleiche Grammatik wie der CTA, der von „Bitte Farbe wählen" zu „In den Warenkorb" wechselt).
3. **Unvollständig darf gemerkt werden** (Wunschfarbe ohne RAL-Ton, Anschluss offen): gespeichert wird der Stand, so wie er ist, mit `configComplete:false`; der Rückweg öffnet den ersten offenen Schritt. Begründung: Auto-Konfiguratoren (BMW/Audi „Konfiguration speichern") speichern jederzeit — Merken ist Parken, nicht Kaufen.
4. **Gemerkt = gespeicherter Stand entspricht dem Live-Stand** (Hash-Vergleich). Ändert der Kunde danach eine Option, zeigt das Control wieder „Konfiguration merken" plus den Hinweis „Geändert seit dem Merken"; Klick **aktualisiert** den Eintrag dieser Sitzung (kein Duplikat). Benchmark: BMW überschreibt den Code, Apple „Save for later" hält genau einen Stand je Build.
5. **Eine Konfiguration je Farbvariante und Sitzung.** Andere Farbe = anderer Artikel = eigener Eintrag (Anthrazit vs. Weiß zu Hause vergleichen ist der reale Anwendungsfall). Gleiche Farbe, geänderte Optionen = Update.
6. **Modell und Konfiguration dürfen nebeneinander in der Liste stehen.** Ein PLP-Eintrag des Basismodells wird beim Speichern einer Konfiguration nie stillschweigend entfernt oder ersetzt; die Konfigurations-Zeile wird direkt hinter die Modell-Zeile einsortiert.
7. **Nach „In den Warenkorb" bleibt der gemerkte Build in der Liste.** Die Merkliste ist kein Warenkorb (Apple, Thomann: Gemerktes überlebt den Kauf).
8. **Kein Control im Sheet „Preisdetails & Menge".** Das Sheet ist die einzige rein kaufbezogene Fläche; beim Schließen ist Instanz C wieder da. Drei Instanzen reichen.
9. **Rückweg = `?merkliste=<configId>`** (JTL: Konfigurations-ID des Plugins). Ankunft: Farbe und Schritte wiederhergestellt, Hinweisleiste „Gespeicherte Konfiguration vom {Datum}" über der Farbwahl, Control „Konfiguration gemerkt", „Neu konfigurieren" als Ausweg.
10. **Feedback in PLP-Grammatik**: Zustandswechsel + Badge-Puls + ein Toast mit genau einer Aktion („Zur Merkliste" / „Rückgängig") + Live-Region. Kein Modal, kein Listenname, keine Anmelde-Wand.

---

## 2 · Zustandsmodell

Begriffe: `S0` = keine Farbe gewählt (`state.finish === ''`). `S1` = Farbe gewählt (jede Swatch, auch „Wunschfarbe nach RAL" ohne Ton). `hash` = djb2 über das normalisierte Konfigurationsobjekt (§2.2). `cfgOfSession` = in `sessionStorage['mtz_mkl_pdp']` gemerkte Zuordnung `variantArticleNo → configId` dieser Sitzung (gesetzt beim Speichern und bei Ankunft über `?merkliste=`).

| # | Zustand der Seite | Control-Label (A, B) / `aria-label` | Klick-Verhalten | Gespeichertes Objekt |
|---|---|---|---|---|
| Z1 | S0, Basismodell nicht in Liste | „Merken" / `„{Modell} merken"` | `addModel()` → Eintrag, Badge +1, Toast „Gemerkt · Zur Merkliste" | **Modell-Item** (§2.1 a) |
| Z2 | S0, Basismodell in Liste (z. B. von der PLP) | „Gemerkt" (`aria-pressed=true`) / `„{Modell} aus der Merkliste entfernen"` | `removeItem(baseId)` → Toast „Aus der Merkliste entfernt · Rückgängig" | — |
| Z3 | S1, kein Konfig-Eintrag mit gleichem `hash` **und** kein `cfgOfSession[variant]` | „Konfiguration merken" / `„Konfiguration merken: {Modell}, {Farbe}"` | `addConfig()` → neuer Eintrag `cfg:<configId>`, `cfgOfSession[variant]=configId`, Toast „Konfiguration gemerkt · Zur Merkliste" | **Konfigurations-Item** (§2.1 b), `configComplete` je nach `firstInvalid()`/`needsRal()` |
| Z4 | S1, Eintrag mit gleichem `hash` vorhanden | „Konfiguration gemerkt" (`aria-pressed=true`) / `„Konfiguration aus der Merkliste entfernen: {Modell}, {Farbe}"` | `removeItem('cfg:'+configId)` → Toast „Konfiguration aus der Merkliste entfernt · Rückgängig"; `cfgOfSession[variant]` bleibt (Undo-fähig) | — |
| Z5 | S1, `cfgOfSession[variant]` existiert, `hash` weicht ab | „Konfiguration merken" + Caption unter Instanz B „Geändert seit dem Merken — erneut merken, um zu aktualisieren" | `updateConfig(configId)` → Snapshot, `configTotal`, `updatedAt` neu; `addedAt` bleibt; Toast „Konfiguration aktualisiert · Zur Merkliste"; **kein** Badge-Puls (Zahl unverändert) | Konfigurations-Item aktualisiert |
| Z6 | S1, Wunschfarbe ohne RAL-Ton | wie Z3/Z5 | wie Z3/Z5; Summary-Zeile „Farbe: Wunschfarbe nach RAL · Ton noch zu wählen"; `configComplete:false` | Konfigurations-Item, `variantArticleNo:'31108'`, `configState.ral:null` |
| Z7 | Limit 50 erreicht, Objekt nicht in Liste | Label wie Z1/Z3, `aria-disabled="true"`, Glyph `--graphite-500` | Toast „Ihre Merkliste ist voll (50) — bitte zuerst einen Artikel entfernen · Zur Merkliste"; nichts wird gespeichert | — |
| Z8 | Storage blockiert | wie Z1–Z6 | identisch, in-memory; Toast-Text erhält den Zusatz „— nur in dieser Sitzung" | nur Speicher |

**Zustandswechsel S0 ↔ S1.** Beim ersten Farb-Klick wechselt das Label von „Merken/Gemerkt" zu „Konfiguration merken/gemerkt" — ohne Animation, ohne Toast. Ein in Z2 gemerktes Modell bleibt gemerkt (die Liste ändert sich nicht), nur das Control bezieht sich jetzt auf die Konfiguration. „Neu konfigurieren" (§4) oder Farbwahl zurücksetzen gibt es im Prototyp nicht; S1 → S0 tritt nur über den Rückweg-Reset ein.

**Wann wird `hash` neu berechnet?** In `refresh()` (jede Zustandsänderung läuft dort durch) → `window.MTZ_PDP.onChange(state)` → das Add-on vergleicht und synchronisiert alle drei Instanzen (`syncPdpMarks()`).

### 2.1 Gespeicherte Objekte (Schema `mtz_merkliste` v1, abwärtskompatibel)

(a) **Modell-Item** — identisch zur PLP, damit der PLP-Bookmark auf der Karte „Gemerkt" zeigt:
```
{ id:'colson1', articleId:'colson1', lens:'sprechanlage', name:'Metzler VDM10 2.0 Video-Türsprechanlage | 1 Klingeltaster | Colson',
  url:'pdp/index.html', img:'…/video-station.png', priceFrom:699, uvp:822, konfig:true, addedAt:ISO, priceAtAdd:699 }
```
Die PDP liefert dafür `window.MTZ_PDP = { id, lens, name, img, price, uvp, url }` (Gegenstück zu `MTZ_PRODUCTS` auf der PLP; `id` = PLP-Karten-ID, JTL: Vaterartikel).

(b) **Konfigurations-Item** — erweitert die bereits gerenderte `cfg:`-Form:
```
{ id:'cfg:c-31101-k7f3a2', articleId:'colson1', variantArticleNo:'31101', lens:'sprechanlage', name:<wie a>,
  url:'pdp/index.html?merkliste=c-31101-k7f3a2', img:<Bild der Farbvariante>, priceFrom:699, konfig:true,
  configId:'c-31101-k7f3a2', configComplete:true,
  configSummary:[ {label:'Farbe',value:'Anthrazit RAL 7016'}, {label:'Anschluss',value:'LAN / PoE'},
                  {label:'Gravur',value:'„Familie Maier" · Klassisch'}, {label:'Innenstation',value:'2× Innenstation 7″'},
                  {label:'Stromversorgung',value:'PoE-Switch 4-Port'}, {label:'Zubehör',value:'Regendach'}, {label:'Menge',value:'2'} ],
  configTotal:1398, configQty:2,
  configState:{ finish, article, ral, anschluss, conn, gravurOn, gravurText, font, innenSel, strom, stromDelta, stromQty, extras, mainQty },
  configHash:'8f2…', addedAt:ISO, updatedAt:ISO, priceAtAdd:1398, configExpired:false }
```
Regeln: `configSummary` enthält nur gewählte, nicht-Default-Positionen in fester Reihenfolge Farbe → Anschluss → Gravur → Innenstation → Stromversorgung → Zubehör → Menge (nur bei > 1). Offene Pflichtschritte erscheinen als Wert „noch zu wählen" (Anschluss) bzw. „Ton noch zu wählen" (Wunschfarbe). Der Drawer zeigt wie bisher die ersten drei Zeilen; dadurch steht die Farbe immer in Zeile 1. `configTotal` = `total()` inkl. Menge; der Drawer rendert „Gesamt 1.398,00 € · 2 Stück" (Suffix nur bei `configQty > 1`). Im Prototyp trägt `configState` den Rückweg; auf JTL hält der Server den Stand (§9) und `configState` entfällt client-seitig.

### 2.2 Hash
`hash(normalize(state))` mit `normalize` = `{ article, ral:ral&&ral.code, anschluss, gravur: gravurOn ? [gravurText.trim(), font] : null, innen: sortierte [name, qty], strom: hasStrom ? [strom, stromQty] : null, extras: sortierte [name, qty], mainQty }`. Preise fließen nicht in den Hash ein (Preisänderung macht einen Build nicht „ungespeichert", §5.5).

---

## 3 · Flows

### 3.1 Erstes Merken ohne Farbe (Modell)
1. Kunde landet auf der PDP, scrollt nicht. Instanz A steht rechts neben „Produkt teilen": Lesezeichen-Glyph + „Merken".
2. Klick/Tap → Glyph füllt sich (teal), Label „Gemerkt", `aria-pressed=true`; Header-Badge 0 → 1 mit Puls; Live-Region „Gemerkt: VDM10 2.0 Colson. Merkliste: 1 Artikel".
3. Toast unten (PLP-Grammatik, 5 s, Hover/Fokus pausiert): „Gemerkt" · Aktion „Zur Merkliste". Fokus bleibt auf dem Control.
4. „Zur Merkliste" → Drawer (28 rem rechts / Vollbild mobil) mit der Modell-Zeile „VDM10 2.0 Colson · ab 699,00 € · UVP 822,00 €" und CTA „Konfigurieren" (führt auf diese PDP zur Farbwahl). Escape/Schließen → Fokus zurück auf das Control.

### 3.2 Erstes Merken einer Konfiguration
1. Kunde wählt Anthrazit → Konfigurator entfaltet sich, Preis liest „Preis wie konfiguriert 699,00 €", Instanz A liest jetzt „Konfiguration merken". Anschluss LAN/PoE, Gravur „Familie Maier", eine Innenstation.
2. Am Ende der Schritte sieht er die Kaufzeile; direkt darunter Instanz B: Glyph + „Konfiguration merken" (Textbutton in `.bx-share`-Grammatik, 2,75 rem Trefferhöhe, linksbündig; der Kaufpfad bleibt unberührt).
3. Klick → alle drei Instanzen „Konfiguration gemerkt"; Badge +1 mit Puls; Live-Region „Konfiguration gemerkt: VDM10 2.0 Colson, Anthrazit RAL 7016, Gesamt 1.249,00 €. Merkliste: 2 Artikel"; Toast „Konfiguration gemerkt · Zur Merkliste".
4. Drawer: Zeile mit Tag „Ihre Konfiguration · 31.10.2026", teal Bildrahmen, „VDM10 2.0 Colson", „Gesamt 1.249,00 €", drei Summary-Zeilen „Farbe: Anthrazit RAL 7016 · Anschluss: LAN / PoE · Gravur: „Familie Maier"", CTA „Konfiguration öffnen", Hinweis „Vergleich auf Modellebene — über das Basismodell", kein Vergleichs-Feld (unverändert).

### 3.3 Erneut merken nach Änderung (Update)
1. Zustand Z4 („Konfiguration gemerkt"). Kunde wechselt die Innenstation.
2. `refresh()` → Hash weicht ab → Label fällt auf „Konfiguration merken"; unter Instanz B Caption „Geändert seit dem Merken — erneut merken, um zu aktualisieren" (`--text-caption`, `--text-muted`). Keine Live-Ansage (der Kunde hat selbst geändert).
3. Klick → Eintrag derselben `configId` wird überschrieben (Summary, Total, `updatedAt`); Drawer-Tag liest „Ihre Konfiguration · aktualisiert 31.10.2026"; Toast „Konfiguration aktualisiert · Zur Merkliste"; Live „Konfiguration aktualisiert: … Gesamt 1.399,00 €". Badge pulsiert nicht (Anzahl gleich).
4. Farbwechsel (anderer Artikel) → Z3 für die neue Farbe: Klick legt einen **zweiten** Eintrag an; der erste bleibt. Beide Zeilen unterscheiden sich in Summary-Zeile 1 (Farbe).

### 3.4 Entfernen vom PDP-Control
1. Klick auf „Gemerkt"/„Konfiguration gemerkt" → Eintrag raus, Glyph leer, Badge −1, Live „Entfernt: …", Toast „… entfernt · Rückgängig" (5 s).
2. „Rückgängig" → Eintrag an alter Position zurück (bestehendes `restore()`), Control wieder gefüllt, Fokus zurück auf die auslösende Instanz, Live „Wiederhergestellt: …".

### 3.5 Aus der Sticky-Bar (Instanz C)
1. Beim Scrollen über die Kaufzeile hinaus erscheint `#pdpStickyBar`; Instanz C ist ein 2,75-rem-Icon-Button zwischen „Details" und dem CTA (Desktop) bzw. am rechten Ende der Info-Zeile (mobil, §6). Gleicher Zustand wie A/B, `title` „Konfiguration merken" / „Konfiguration gemerkt".
2. Klick → identisches Verhalten; Toast sitzt **über** der Sticky-Bar (`bottom = Bar-Höhe + 0,75 rem`, wie `.is-raised` beim Vergleichs-Tray). Bar ist `inert`, solange sie verborgen ist — Instanz C ist dann nicht in der Tab-Reihenfolge.

### 3.6 Sheet „Preisdetails & Menge"
Kein Control. Das Sheet versteckt die Sticky-Bar (`body.cfg-sheet-open`); nach dem Schließen ist Instanz C wieder erreichbar. Mengenänderungen im Sheet laufen über `refresh()` und verändern den Hash → Z5 greift.

### 3.7 Nach „In den Warenkorb"
Keine Änderung an der Merkliste. Der Eintrag bleibt, das Control bleibt „Konfiguration gemerkt". Wird der Warenkorb später bestellt, bleibt der Eintrag ebenfalls (JTL: optionaler Hinweis in der Merkliste „Bereits bestellt am {Datum}" — P2, nicht Teil dieses Prototyps).

### 3.8 Drawer-CTA „Konfigurieren" bei Modell-Zeile
Navigiert auf die PDP (S0), scrollt zu `#bFarbe` mit dem Preisblock sichtbar (`scroll-margin-top` = Höhe Sticky-Header + 1 rem). Kein Banner. Instanz A liest „Gemerkt" (Modell ist in der Liste).

---

## 4 · Rückweg: „Konfiguration öffnen"

**Prototyp-URL:** `pdp/index.html?merkliste=<configId>` (der Drawer verlinkt `url` des Items; der bisherige `#konfigurator?configId=` wird dadurch ersetzt). **JTL:** `/merkliste/konfiguration/<uuid>` → Redirect auf die Artikel-URL der Farbvariante mit `?mkl=<uuid>` (§9).

1. `pdp-b.js` liest den Parameter vor dem ersten `refresh()`, holt das Item aus `mtz_merkliste` (Prototyp) und ruft `applyConfig(configState)`: Swatch per `click()` (nutzt die bestehende Auswahl-Engine inkl. Entsperren des Konfigurators), dann Anschluss → Gravur (Text, Schrift) → Innenstationen (mit Mengen) → Stromversorgung → Zubehör → `mainQty`. Jeder Schritt wird auf Verfügbarkeit geprüft (`.cfg-opt.is-unavailable` / fehlender Knoten = nicht wiederherstellbar).
2. `history.replaceState` entfernt den Parameter (Reload wiederholt nichts), `cfgOfSession[variant] = configId`.
3. **Ankunft (Viewport):** Seite scrollt so, dass Preisblock + Farbzeile sichtbar sind (Zielanker `.pdp-price--lead`, `block:'start'`, Offset Sticky-Header). Darüber, als erste Zeile der Buybox unter den Produktdaten, die Leiste `.mkl-restore` (`role="status"`, `tabindex="-1"`, Fokus wird nach dem Scroll hierher gesetzt):
   - Glyph gefüllt + Titel **„Gespeicherte Konfiguration vom 30.10.2026"** · Zeile „Gesamt 1.249,00 € · Anthrazit RAL 7016 · LAN / PoE · Gravur" (max. 3 Positionen, dann „+ n weitere")
   - Aktionen: Textbutton **„Neu konfigurieren"** · Schließen „×" (`aria-label="Hinweis schließen"`). Die Leiste bleibt bis zum Schließen oder bis zur ersten Änderung (dann wandelt sie sich in die Caption aus Z5).
   - Gestaltung: `--teal-100`-Fläche, `--r-l`, 0,0625 rem `--teal`-Rand links, `--text-body-sm`; kein Modal, kein Toast zusätzlich.
4. Alle drei Instanzen stehen auf „Konfiguration gemerkt". Der Stepper zeigt die erledigten Schritte mit Haken; `configComplete:false` → der erste offene Schritt wird geöffnet (`openStep(firstInvalid(), true)`), Leiste ergänzt „Noch offen: Anschluss".
5. **Option nicht mehr verfügbar.** Die Leiste listet „Nicht mehr verfügbar: Innenstation 7″ — bitte neu wählen"; der betroffene Schritt wird geöffnet; der gemerkte Eintrag bleibt unverändert, bis der Kunde erneut merkt (dann Update). Ist der **Farbartikel** selbst nicht mehr verfügbar, wird der Eintrag mit `configExpired:true` gespeichert (Drawer: „Konfiguration abgelaufen — Details siehe Zusammenfassung", CTA fällt auf „Konfigurieren"), und die Leiste liest „Diese Farbe ist nicht mehr verfügbar — bitte wählen Sie eine Farbe." (S0, Fokus auf die Swatches). JTL: `configExpired` kommt aus der Server-Antwort (§9).
6. **Preis geändert.** Nach `applyConfig()` gilt `total() !== configTotal` → Leiste ergänzt „Preis aktualisiert: 1.249,00 € → 1.279,00 €"; die Preisanzeige der Seite ist die Wahrheit, der Eintrag behält den alten Wert bis zum nächsten Merken (Z5 greift nicht — der Hash ist gleich, das Control zeigt „Konfiguration gemerkt"; der Drawer zeigt ab jetzt zusätzlich „Preis geändert" als Caption, sobald `priceAtAdd !== configTotal`-Prüfung beim nächsten Server-Abgleich fehlschlägt — JTL).
7. **„Neu konfigurieren"** → `resetConfig()`: Zustand auf S0 (keine Farbe, Konfigurator gesperrt, Menge 1), Leiste verschwindet, Scroll auf die Swatches mit kurzem Halo (vorhandene `.is-invalid`-Animation **nicht** verwenden — stattdessen `.is-hint`, gleiche Geometrie, teal), Instanz A liest „Merken" oder „Gemerkt" je nach Modell-Eintrag; der gemerkte Build bleibt in der Liste. Toast: keiner.
8. Ungültige/unbekannte `configId` (gelöscht, anderes Gerät): Seite lädt normal (S0), Toast „Diese Konfiguration ist auf diesem Gerät nicht gespeichert · Zur Merkliste" (info).

---

## 5 · Edge Cases

| # | Fall | Verhalten |
|---|---|---|
| 5.1 | **Limit 50** | Wie PLP: nicht gemerkte Instanzen `aria-disabled`, Limit-Toast mit „Zur Merkliste"; Z4/Z2 (Entfernen) funktioniert weiter. Ein Update (Z5) ist trotz Limit erlaubt (Anzahl ändert sich nicht). |
| 5.2 | **Storage blockiert** | `storageOk=false` → in-memory für die Sitzung; Drawer-Hinweis wie bisher; PDP-Toasts erhalten den Suffix „— nur in dieser Sitzung"; der Rückweg über `?merkliste=` kann dann nur Einträge dieser Sitzung auflösen (sonst 4.8). |
| 5.3 | **Modell schon von der PLP in der Liste** | Beim Speichern einer Konfiguration bleibt die Modell-Zeile; die Konfigurations-Zeile wird direkt dahinter einsortiert (`insertAfter(index(baseId))` statt `push`). Badge zählt beide. Das Control auf der PDP bezieht sich in S1 nur auf die Konfiguration. Ausnahme-Vorschlag für JTL (Offene Punkte): Modell-Zeile ausblenden, sobald eine Konfiguration desselben Basismodells vorliegt. |
| 5.4 | **Gast vs. Login** | Gerätelokal; der Hinweis „Auf diesem Gerät gespeichert · Anmelden …" steht im Drawer-Footer (unverändert). Auf der PDP selbst **kein** zusätzlicher Hinweis — er würde die Buybox verlängern; der erste Toast führt in den Drawer, wo er steht. Nach Login: Union wie 05 §3.7, Konfigurationen in die Plugin-Tabelle. |
| 5.5 | **Preis seit dem Merken geändert** | Drawer zeigt gespeicherten `configTotal`; Rückweg zeigt die Differenz in der Leiste (4.6). JTL: beim Rendern des Drawers/der Seite `/merkliste` fragt das Plugin die aktuellen Preise ab und ergänzt pro Zeile „Preis geändert: jetzt {neu}"; `priceAtAdd` bleibt als Referenz. |
| 5.6 | **Menge > 1** | `mainQty` (und Mengen der Positionen) im `configState`; Summary-Zeile „Menge: 2"; Drawer „Gesamt 1.398,00 € · 2 Stück"; Rückweg stellt Mengen wieder her. Menge ändern = Hash ändert = Z5. |
| 5.7 | **Wunschfarbe ohne RAL** | Merken erlaubt (`configComplete:false`); Rückweg öffnet den RAL-Picker (`ralUI.open()`, Fokus auf `#ralSearch` wie in `addToCart()`), Leiste „Noch offen: RAL-Ton". Mit Ton: Summary „Farbe: Wunschfarbe · RAL 3003 Rubinrot" (Text aus `finishText()`), `configState.ral` gespeichert. |
| 5.8 | **Konfiguration in zweitem Tab geändert** | `storage`-Event (vorhanden) → `syncPdpMarks()`; Live „Merkliste in einem anderen Tab geändert: n Artikel". |
| 5.9 | **Doppelklick / Schnellklicks** | Control ist während 120 ms `is-pressed` nicht erneut auslösbar (Debounce im Add-on), Toasts stapeln nie. |
| 5.10 | **`?merkliste=` + `?flow=`/`?touch=` kombiniert** | Parameter unabhängig; `merkliste` wird nach dem Konsum entfernt, die übrigen bleiben. |

---

## 6 · Mobile (< 48 rem, geprüft bei 375 × 812)

- **Instanz A** bleibt in der Sterne/Teilen-Zeile über der Galerie. Die Zeile (327 px nutzbar) wird `flex-wrap`: Sterne „★ 4,5" links; rechts die Aktionsgruppe **„Merken · Produkt teilen"** (beide `.bx-share`-Grammatik, je ≥ 2,75 rem hoch, 0,75 rem Abstand). Passt die Gruppe nicht neben die Sterne, bricht sie als eigene Zeile rechtsbündig um — nie Text-Truncation. In S1 „Konfiguration merken" (≈ 165 px) + „Produkt teilen" (119 px) → zweite Zeile ist die Regel; akzeptiert, weil A oben das Modell-Intent bedient und B/C das Konfigurations-Intent im Daumenbereich.
- **Instanz B** unter der Kaufzeile ist die Haupt-Instanz auf dem Phone: volle Breite, linksbündig, 2,75 rem Höhe, Glyph 1,25 rem; die Caption aus Z5 steht darunter in einer Zeile (Umbruch erlaubt).
- **Instanz C** in der Sticky-Bar: Die Bar ist mobil zweizeilig (Info-Zeile mit Thumb/Name/Preis; Aktionszeile Details + CTA). Instanz C sitzt am **rechten Ende der Info-Zeile** (2,75 rem Icon-Button, Thumb-Reichweite: unterer Bildschirmrand, rechts). Die CTA-Breite bleibt unverändert (Kaufpfad). Bei offener Tastatur (`body.kbd-open`) ist die Bar ohnehin verborgen.
- **Toast** mobil über der Sticky-Bar, volle Breite minus 1 rem; Aktion rechts; Safe-Area-Padding.
- **Drawer** Vollbild wie PLP; „Konfiguration öffnen" schließt den Drawer, navigiert, Rückweg-Leiste wird oberhalb des Preisblocks fokussiert (Scrollziel), nicht oberhalb der Galerie.
- **Keine horizontale Verbreiterung**: alle drei Instanzen `min-width:0`, Labels dürfen umbrechen; Prüfung `scrollWidth === clientWidth`.

---

## 7 · Accessibility

- **Rolle & Name.** Jede Instanz ist `<button type="button" class="mkl-mark mkl-mark--pdp" aria-pressed="true|false">`. Ein Toggle, weil jede Instanz dasselbe Objekt ein- oder ausschaltet; kein separater „Konfiguration merken"-Button ohne `aria-pressed`, weil sonst zwei Controls für ein Objekt entstünden. Name = sichtbares Label + Objekt: S0 `„{Modell} merken"` / `„{Modell} aus der Merkliste entfernen"`; S1 `„Konfiguration merken: {Modell}, {Farbe}"` / `„Konfiguration aus der Merkliste entfernen: {Modell}, {Farbe}"`. Instanz C (Icon-only) erhält denselben `aria-label` und ein `title`. Z7: `aria-disabled="true"` (nicht `disabled`, bleibt fokussierbar und erklärt sich per Toast).
- **Synchronisation.** Alle Instanzen wechseln gleichzeitig; nur die ausgelöste Instanz bekommt die Press-Animation. Fokus bleibt nach dem Klick auf der ausgelösten Instanz; der Toast stiehlt keinen Fokus (`role="status"`), seine Aktion ist per Tab erreichbar (wie PLP; bei offenem Drawer wandert der Toast in den Dialog).
- **Nach Undo** (Toast „Rückgängig"): Fokus zurück auf die auslösende Instanz, falls sie noch im DOM und sichtbar ist (Instanz C nur, wenn die Bar `is-visible`), sonst auf Instanz B. Live „Wiederhergestellt: …".
- **Tastaturpfad.** Konfigurator-Schritte → „Weiter" des letzten Schritts → Menge − / + → „In den Warenkorb" → **Instanz B** (nächster Tab-Stop; DOM direkt hinter `.cfgb-buyrow`) → Trusted-Shops-Link … Instanz A liegt in der Reihenfolge hinter „Produkt teilen". Instanz C nur, wenn die Bar sichtbar ist (`inert` sonst, vorhanden).
- **Rückweg-Leiste.** `role="status"`, Überschrift `h2`-Niveau visuell, semantisch `p` mit `strong`; nach dem Laden `focus()` auf die Leiste (`tabindex="-1"`), danach normaler Fluss: „Neu konfigurieren" → „×" → Preisblock. Escape schließt die Leiste nicht (kein Dialog).
- **Ansagen** (`#mkl-live`, polite, atomar): add / update / remove / restore / limit / Tab-Änderung; keine Ansage beim reinen Label-Wechsel (S0→S1, Hash-Abweichung) — der neue Name wird beim nächsten Fokus gelesen.
- **Kontrast & Größe.** Glyph `--schwarz`/`--teal` auf Weiß (16:1 / 9:1), Label `--teal` 14 px/600 wie „Produkt teilen" (≥ 4,5:1), Caption `--text-muted` 5,4:1; Trefferfläche ≥ 2,75 rem überall (Instanz A per `::before`-Inset). Reduced Motion: kein Press-Scale, kein Badge-Puls, kein Halo; Leiste erscheint ohne Transition.

---

## 8 · Copy-Tabelle (Deutsch, Sie)

| Key | Zustand | String |
|---|---|---|
| pdp.mark.rest | S0 | „Merken" |
| pdp.mark.on | S0 | „Gemerkt" |
| pdp.mark.cfg.rest | S1 | „Konfiguration merken" |
| pdp.mark.cfg.on | S1 | „Konfiguration gemerkt" |
| pdp.mark.aria.rest / .on | S0 | `„{Modell} merken"` / `„{Modell} aus der Merkliste entfernen"` |
| pdp.mark.aria.cfg.rest / .on | S1 | `„Konfiguration merken: {Modell}, {Farbe}"` / `„Konfiguration aus der Merkliste entfernen: {Modell}, {Farbe}"` |
| pdp.mark.title.cfg | C | „Konfiguration merken" / „Konfiguration gemerkt — aus der Merkliste entfernen" |
| pdp.mark.changed | Z5 | „Geändert seit dem Merken — erneut merken, um zu aktualisieren" |
| toast.added | Z1 | „Gemerkt" · „Zur Merkliste" |
| toast.addedConfig | Z3 | „Konfiguration gemerkt" · „Zur Merkliste" |
| toast.updatedConfig | Z5 | „Konfiguration aktualisiert" · „Zur Merkliste" |
| toast.removed | Z2 | „Aus der Merkliste entfernt" · „Rückgängig" |
| toast.removedConfig | Z4 | „Konfiguration aus der Merkliste entfernt" · „Rückgängig" |
| toast.limit | Z7 | „Ihre Merkliste ist voll (50) — bitte zuerst einen Artikel entfernen" · „Zur Merkliste" |
| toast.sessionOnly | Z8 | Suffix „ — nur in dieser Sitzung" |
| toast.restoreMissing | 4.8 | „Diese Konfiguration ist auf diesem Gerät nicht gespeichert" · „Zur Merkliste" |
| live.added / .addedConfig | | „Gemerkt: {Modell}. Merkliste: {n} Artikel" / „Konfiguration gemerkt: {Modell}, {Farbe}, Gesamt {Preis}. Merkliste: {n} Artikel" |
| live.updatedConfig | | „Konfiguration aktualisiert: {Modell}, {Farbe}, Gesamt {Preis}" |
| live.removed / .restored | | „Entfernt: {Modell}. Merkliste: {n} Artikel" / „Wiederhergestellt: {Modell}. Merkliste: {n} Artikel" |
| drawer.tag | | „Ihre Konfiguration · {Datum}" · nach Update „Ihre Konfiguration · aktualisiert {Datum}" |
| drawer.total | | „Gesamt {Preis}" · bei Menge > 1 „Gesamt {Preis} · {n} Stück" |
| drawer.cfg.open | | „Konfiguration öffnen" |
| drawer.cfg.incomplete | | Caption „Noch nicht vollständig — {Schritt} offen" |
| drawer.cfg.expired | | „Konfiguration abgelaufen — Details siehe Zusammenfassung" (unverändert) |
| drawer.cfg.priceChanged | JTL | „Preis geändert: jetzt {Preis}" |
| summary.farbe / .anschluss / .gravur / .innen / .strom / .zubehoer / .menge | | „Farbe" · „Anschluss" · „Gravur" · „Innenstation" · „Stromversorgung" · „Zubehör" · „Menge" |
| summary.open.anschluss / .ral | | „noch zu wählen" / „Wunschfarbe nach RAL · Ton noch zu wählen" |
| restore.title | | „Gespeicherte Konfiguration vom {Datum}" |
| restore.line | | „Gesamt {Preis} · {Farbe} · {Anschluss} · {Position 3}" (+ „ · + {n} weitere") |
| restore.open | | „Noch offen: {Schritt}" |
| restore.unavailable | | „Nicht mehr verfügbar: {Option} — bitte neu wählen" |
| restore.colourGone | | „Diese Farbe ist nicht mehr verfügbar — bitte wählen Sie eine Farbe." |
| restore.price | | „Preis aktualisiert: {alt} → {neu}" |
| restore.reset / .close | | „Neu konfigurieren" / `aria-label="Hinweis schließen"` |
| error.save | | „Die Konfiguration konnte nicht gemerkt werden — bitte versuchen Sie es erneut." (nur JTL, Serverfehler) |

Nicht verwendet: „speichern" als Control-Label (Merken ist das Verb der Merkliste; „Gespeicherte Konfiguration" bleibt als Substantiv in der Leiste, weil „Gemerkte Konfiguration" sperrig ist), „Wishlist", „Favorit", „Warenkorb" in jeder Merklisten-Fläche.

---

## 9 · Events + JTL-Mapping

**Analytics-Events (Namen; Payload in Klammern).**
`merkliste_add` (source:'pdp', kind:'model'|'config', instance:'cred'|'buyrow'|'sticky', configComplete, configTotal, variantArticleNo) · `merkliste_update` (configId, instance, configTotal) · `merkliste_remove` (source:'pdp', kind, instance) · `merkliste_undo` (kind) · `merkliste_open` (from:'toast'|'header') · `merkliste_limit` (source:'pdp') · `merkliste_storage_blocked` · `merkliste_restore` (configId, complete, unavailableCount, priceChanged) · `merkliste_restore_reset` (configId) · `merkliste_restore_missing` · `merkliste_changed_after_save` (einmal je configId und Sitzung, wenn Z5 erstmals eintritt) · `merkliste_cart_from_saved` (configId; „In den Warenkorb" im Zustand Z4 — misst, ob gemerkte Builds kaufen).

**JTL-Mapping.**
- **Artikel.** Basismodell = Vaterartikel (`kVaterArtikel`), Farbe = Kindartikel mit eigener `cArtNr` (31101 …, Prototyp `data-article`). Modell-Item → Wunschliste-Position auf den Vaterartikel; Konfigurations-Item → `variantArticleNo` = Kindartikel. Der Drawer-Vergleich läuft über `articleId` (Vater) — unverändert.
- **Konfiguration.** JTL hält Konfigurator-Stände nur als Warenkorb-Positionen; für Gäste existiert keine persistente ID. Das Plugin speichert deshalb den Snapshot selbst: `plugin_mtz_merkliste_cfg (cfgId UUID, kKunde NULL|int, cSessionHash, kArtikel Kind, cStateJson, fTotal, cSummaryJson, dCreated, dUpdated, dExpires = +180 Tage, bExpired)`. `configId` im Client = `cfgId`. Login-Merge: Union nach `cfgId`, `kKunde` setzen.
- **Rückweg.** `/merkliste/konfiguration/{cfgId}` → 302 auf die Kindartikel-URL mit `?mkl={cfgId}`; Plugin-JS liest den Stand per `GET /plugin/mtz-merkliste/cfg/{cfgId}` (liefert `state`, `summary`, `total`, `expired`, `unavailable[]`, `currentTotal`) und ruft dieselbe `applyConfig()`-Sequenz über die Konfigurator-Optionen (JTL Konfiggruppen/Konfigitems, `kKonfigitem`). Preisdifferenz = `currentTotal` vs. `fTotal`, serverseitig berechnet.
- **Speichern.** `POST /plugin/mtz-merkliste/cfg` mit `kArtikel`, `state`, `summary`, `total`; Antwort `cfgId`. Update = `PUT …/{cfgId}`. Guest-Fallback bleibt `localStorage` (Snapshot inkl. `configState`) — der Server-Call ist additiv, nie blockierend (bei Fehler `error.save`-Toast, lokaler Eintrag bleibt).
- **Sprachvariablen.** Alle Strings aus §8 als `plugin_mtz_merkliste_*`; `wishlist*` → Merkliste wie 05 §9.
- **Consent.** `sessionStorage['mtz_mkl_pdp']` und `localStorage['mtz_merkliste']` sind funktional notwendig; in der Datenschutzerklärung unter „Merkliste" dokumentieren.

---

## 10 · Offene Punkte

1. **Modell-Zeile ausblenden, sobald eine Konfiguration desselben Basismodells existiert?** Vorschlag: nein im Prototyp (Nutzerintention respektieren), A/B-Kandidat im Shop (Metrik: Drawer-Dubletten je Liste).
2. **Control im Sheet „Preisdetails & Menge"** (3.6): bewusst weggelassen; prüfen, ob Mobile-Nutzer das Sheet als Hauptfläche verwenden (Event `merkliste_add` mit `instance` liefert die Antwort).
3. **„Konfiguration merken" vs. „Merken" in Instanz A auf dem Phone** — die zweite Zeile verlängert die Kopfzone um ≈ 2,75 rem. Alternative: Instanz A mobil Icon-only mit `aria-label`; entscheiden nach erstem Klick-Test.
4. **Rückweg-Leiste bis zur ersten Änderung oder 10 s?** Spezifiziert: bis Schließen/Änderung. Falls sie als störend empfunden wird: Auto-Collapse auf eine Zeile nach 10 s (nicht Auto-Hide).
5. **Ablauf gespeicherter Konfigurationen** (JTL `dExpires` 180 Tage): Dauer und Erinnerung per E-Mail (nur mit Login) sind Produkt-Entscheidungen.
6. **„Bereits bestellt"-Hinweis** in der Merkliste nach Kauf (3.7) — P2.
7. **Share-Link einer Konfiguration** („Produkt teilen" mit `?merkliste=`): im Prototyp nicht möglich (gerätelokal); auf JTL identisch mit dem Rückweg-Link — mit „Link kopieren" aus 05 §3.8 zusammenführen.
8. **PLP-Karte bei gemerkter Konfiguration:** Zeigt der Karten-Bookmark „Gemerkt", wenn nur eine Konfiguration (nicht das Modell) gemerkt ist? Vorschlag: ja, gefüllt mit Caption-Tooltip „Konfiguration gemerkt" — erfordert `articleId`-Abgleich in `syncHeart()`; kleine Änderung an `merkliste.js`, separat freigeben.

---

## Anhang · Umsetzungsnotizen für den Prototyp (nur Hinweise, keine Vorgabe der Architektur)

- `pdp-b.js` exponiert `window.MTZ_PDP = { id:'colson1', lens:'sprechanlage', name, img, price:699, uvp:822, url:'pdp/index.html', getState(), applyConfig(state), resetConfig(), summary(), total(), onChange(fn) }`; `refresh()` ruft die registrierten `onChange`-Hooks am Ende auf.
- `merkliste.js` lädt auch auf der PDP (gleiche Datei; Header-Control und Drawer kommen mit). Erkennung: `window.MTZ_PDP` vorhanden und kein `#productGrid` → `initPdp()`: drei Instanzen rendern, `syncPdpMarks()` an `onChange`, `storage` und nach jeder Mutation; `?merkliste=` konsumieren.
- `rowHTML()`: `url` des Items als `href` der Konfigurations-CTA verwenden; Mengen-Suffix und „aktualisiert"-Tag ergänzen; Einsortierung hinter die Modell-Zeile in `addConfig()`.
- Asset-Versionen hochzählen (`merkliste.css|js?v=5`, `pdp-b.js?v=295`).
