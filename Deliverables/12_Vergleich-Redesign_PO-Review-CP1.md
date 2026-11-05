# 12 · PO-Review CP1: UX-Spec `12a_Vergleich-Redesign_UX.md`

Stand: 05.11.2026 · Prüfer: Lead Product Owner · Grundlage: Brief 12 (AK 1–43, §7 Entscheidungen der Nutzerin) · CP0-Basis: Kopien in `scratchpad\cp0\`

**Urteil: freigegeben mit Änderungen.** Das Konzept beantwortet den Job to be done: Fazit zuerst, Unterschiede direkt unter dem Kopf, eine Zählregel, kein horizontales Scrollen. Es deckt alle 43 Kriterien ab. Die UI-Spec 12b darf starten. Die Änderungen 1–4 müssen in 12a stehen, bevor die UI-Leitung die Fazit- und Gemeinsamkeiten-Regionen gestaltet.

---

## 1 · Entscheidungen zu den markierten Punkten

| Punkt | Entscheidung | Begründung |
|---|---|---|
| **AK 12/33: Sprungmarken entfallen** | **Angenommen.** Der Rückfall (U-Chips ab 64 rem) wird nicht gebaut. | Die Unterschiede sind die ersten Zeilen unter dem Kopf. Chips würden dieselben Labels ein drittes Mal zeigen (gegen AK 8) und auf dem Handy 2,75 rem kosten. AK 12 und AK 33 sind angepasst. |
| **AK 2: S3 ohne „Was der Aufpreis bringt"** | **Angenommen.** | Eine Liste „Aufpreis bringt …" für 4 technisch verschiedene Modelle würde eine falsche Ursache behaupten. AK 2 ist angepasst, Ton siehe Änderung 2. |
| **AK 16/18 knapp (≈ 378/384 px, ≈ 475/487 px)** | **Angenommen als Plan**, Grenzwerte bleiben. | Das Budget lässt den Button „Was bedeutet das?" weg (Änderung 5). Gemessen wird bei CP2 (Mock) und CP3 (Build) mit S3 und S4, dem längsten Fazit. Das 3,5-rem-Thumbnail bei Spalten < 17 rem ist in Ordnung: AK 15 verlangt große Bilder erst ab 1440. |
| **AK 4 vs. 24: 3. Titelzeile bei 375 px** | **Zugelassen als Ausnahme** bis 13,5 rem. | AK 4 (Name nie gekürzt) wiegt schwerer als 0,25 rem Höhe. Die Höhe bleibt je Vergleich fest und wird aus allen Modellen berechnet. AK 24 ist angepasst. Kurznamen für Artikel ohne Design-Linie kommen auf die Datenliste (Doc 11 §10.1), werden aber nicht erfunden. |
| **AK 8 über Kurzlabels im Fazit** | **Angenommen**, aber das Kriterium zählt jetzt Fakten, nicht Wörter. | Synonyme zählen mit. Das Titelsegment nach AK 4 ist die einzige Ausnahme. S2 erfüllt das: Titel + Zeile + Fazit. AK 8 ist angepasst. |
| **Mobiles Muster „Spaltenwahl"** | **Freigegeben** (2 Spalten < 48 rem, 3 bei 48–64 rem, Titel-Picker, Pille „i / n", Screenreader-Tabelle der sichtbaren Spalten). | Kein horizontales Scrollen, echte Tabelle, entspricht H4. Bedingungen: Änderung 6. AK 18 ist angepasst. |
| **Spannenregel Z2b** (überlappende Spannen „je nach Ausführung" = O) | **Angenommen.** | Das ist strenger und ehrlicher: Bei „3,4 kg" gegen „3,4–5 kg" ist kein Unterschied belegt. Die Zelle zeigt die Spanne weiter, Spannen ohne Überschneidung zählen als U. AK 27 ist angepasst. |
| **Klassenregel K** (1-Partei-Standbriefkasten = gleiche Klasse wie Wandbriefkasten) | **Angenommen.** | Die Klasse ergibt sich aus Parteien, Klingel/Sprechanlage und Set. Die Montageart ist ein normaler Unterschied, und E10 erklärt sie. Testfall ergänzen (Änderung 11). |

## 2 · Prüfung der Leitplanken

- **Datenehrlichkeit:** Das Fazit setzt nur Zellwerte ein, „Bestwert" bleibt unverändert, ebenso „k. A."/„–" und die Quellzeile. Zwei Punkte sind offen:
  - **(a)** Die neue Klasse „F Bauform" nimmt Maße, Gewicht und Material aus der Technik heraus. Damit gilt Colson/Neo als „technisch gleich", obwohl sie 1,6 cm und 0,27 kg auseinanderliegen. Heute zählen diese Zeilen als technisch (`soft` nur bei Preis, Design, Namensschild, Farben; Zwillingsregel von der Nutzerin bestätigt am 30.09.). Das ist eine ungenannte Umkehr einer Entscheidung → Änderungen 1 und 8.
  - **(b)** Wertende Sätze wie „einen Mehrwert … belegen die Shopdaten nicht" (F3 ohne A-Gewinn, S5) und „Einen Ausstattungsvorsprung … belegen die Shopdaten nicht" sprechen gegen das eigene Premium-Produkt (z. B. die Edelstahlfront), obwohl die Ursache eine Datenlücke ist → Änderung 2.
- **Kein Warenkorb, durchgehend „Sie", Verbotswörter:** erfüllt (§8).
- **Tokens/rem:** Alle Maße sind in rem angegeben. Typostufen legt 12b fest.
- **Kein Icon-Hover:** erfüllt. × bleibt ein Icon-Button ohne Hover. Chevron und ▾ gehören zu Text-Buttons.
- **Feste Sticky-Höhe:** erfüllt, „fest je Rendering". Zusätzlich gilt: Die Höhe ändert sich auch beim Spaltentausch nicht, und `fitHeader()` läuft nur bei Resize/Zoom, nie beim Scrollen (Änderung 6).
- **Kein „zusätzlich/ohne":** erfüllt. Die Farbzeile hat keinen Zusatz, und der Zusatz unter Mengenzeilen entfällt ganz. „Zusätzlich die Farbe Weiß" im Fazit ist zulässig, das war vorher die Rolle von „Auf einen Blick".
- **Preis-Hinweis in der Quellzeile** („„ab"-Preise gelten für die Standardausführung …"): Das ist keine neue Behauptung. Der Text steht heute schon im (i) der Preiszeile und im `configNote` (`vergleichen.js` Z. 64/88/132–133).

**Liste der umgekehrten Entscheidungen (12a §2.2):** angenommen, aber **unvollständig** → Änderung 8.

## 3 · Erforderliche Änderungen

**An die UX-Leitung (12a, vor CP2)**
1. **„Technisch gleich" nur bei gleicher Bauform.** F3 wird geteilt:
   - F3a (U∩F = ∅): „Laut Shopdaten technisch gleich".
   - F3b (U∩F ≠ ∅): Satz 1 nennt die Bauform im selben Satz, z. B. „Laut Shopdaten technisch gleich, aber in Maßen und Gewicht verschieden". Die F-Werte stehen in Satz 2, und zwar in **jedem** Zweig von Satz 2, nicht nur nach einem A-Gewinn.
   - §3.7 S1/S5 entsprechend neu durchrechnen (AK 3).
2. **Preis-Sätze ohne Wertung.** Die Sätze „einen Mehrwert für den Aufpreis belegen die Shopdaten nicht" und „Einen Ausstattungsvorsprung … belegen die Shopdaten nicht" entfallen. Ersatz für 2 Modelle: „Der Preisunterschied geht laut Shopdaten mit {U-Phrasen} einher." (Werte wie in §3.3). Der Satz aus Doc 11 R4 „kein technischer Mehrwert belegt (nicht gepflegt: …)" bleibt bei F5, weil er die Datenlücke benennt (AK 2).
3. **Gemeinsamkeiten einmal je Wert.** Aufgeklappt bekommt jede G-Zeile eine Wertzelle über alle Produktspalten (`colspan`, für Screenreader „gilt für alle n Modelle"), nicht n gleiche Zellen. So war es bisher (03 §3 Nr. 10), und so verlangt es AK 8.
4. **Erklärsätze: Faktenprüfung markieren** (die Freigabe liegt bei der Nutzerin, nicht beim PO). In §3.6 je Satz vermerken, was vor der Freigabe zu prüfen ist:
   - E1: „vorhandene zweiadrige Leitung" setzt eine geeignete Leitung voraus → „in der Regel"?
   - E2: Nur LAN? WLAN/PoE sind im Export nicht belegt (Doc 11 §1), der Satz darf beides weder versprechen noch ausschließen.
   - E6: Wie die Namen geändert werden (App/Display), ist nicht belegt.
   - E8: Setzt einen elektrischen Türöffner voraus.
   - E4/E5: Eigentümer/Mieter ist eine Faustregel, kein Fakt.
5. **Höhenbudget vollständig.** Der Button „Was bedeutet das?" fehlt im Budget. Er steht entweder inline am Ende des Fazits oder rechts in der Overline-Zeile und kostet dann keine eigene Zeile, oder er wird mitgerechnet. Danach §2.6 für S3 (1024, 375) und S4 (375) neu rechnen.
6. **Bedingungen für die Spaltenwahl:**
   - Die Kopfhöhe wird aus allen Modellen berechnet, ein Tausch verschiebt nichts (AK 24/40).
   - `fitHeader()` läuft nie beim Scrollen.
   - Die Liste im Picker zeigt, welches Modell in welcher Spalte steht.
   - Fazit, Zählung und Druck beziehen sich immer auf alle Modelle (Z6).
   - Der Live-Text wird nach dem Tausch angesagt; der Fokus bleibt auf dem Titel-Button.
7. **Rückgängig-Toast beim Entfernen:** wie der Merkliste-Toast; er pausiert bei Hover/Fokus (WCAG 2.2.1) und verdeckt den Sticky-Kopf nicht.
8. **Liste der umgekehrten Entscheidungen vervollständigen** (geht mit 12a zur Richtungsfreigabe an die Nutzerin):
   - Maße, Gewicht und Material nicht mehr „technisch" (Zwillingsregel 30.09., Doc 11 R4) → mit Änderung 1;
   - die automatische Ansicht ab 60 % (Doc 02 §3) → „immer an";
   - die Preiszeile als Kernzeile (Doc 11 §7.2) → nur noch im Kopf;
   - die Design-first-Gruppen der Briefkästen (01b, Doc 11 §7.3) → U/O/G; die Lens-Reihenfolge gilt nur innerhalb der Abschnitte;
   - der gefüllte CTA-Button (06 §2: „Primär bleibt das Overlay") → Textlink;
   - Doc 11 R6 („Auf einen Blick") entfällt;
   - neu: Rückgängig beim Entfernen.

**An die UI-Leitung (12b)**

9. **CTA als Textlink bleibt das stärkste Bedienelement der Spalte:** DS-Linkstil, Gewicht und Größe in 12b festlegen, Trefferfläche 2,75 rem. × und Picker-▾ bleiben ohne Hover (Icon-Regel), Text-Buttons dürfen ein DS-Hover haben.
10. **Mock-Messung bei CP2:** Leiste + Fazit + Kopf + Abschnittskopf für S3 bei 1024 und 375 und für S4 bei 375. Gemessen wird mit echten Texten aus §3.7, nicht mit Platzhaltern. Ist ein Grenzwert verfehlt, gelten die Hebel aus 12a §2.6 in der dort genannten Reihenfolge. Titel, Fazit-Bausteine und Trefferflächen werden nie gekürzt.

**Für den Build / CP3**

11. **Zusätzliche Testfälle:**
    - ein 1-Partei-Standbriefkasten gegen Siebert (Klassenregel K → keine F1-Meldung, Montageart als U + E10);
    - ein Paar mit überlappender Gewichtsspanne (Ebenhard-Varianten → O);
    - ein Titel ohne Design-Linie bei 375 px (S4 → Ausnahme AK 24).

    Die UX-Leitung benennt die IDs in 12a §3.7.

## 4 · Geänderte Akzeptanzkriterien (im Brief markiert „geändert CP1")

- **AK 2:**
  - 2 Modelle: Satz zum Preisunterschied oberhalb der Tabelle.
  - 3–4 Modelle, technisch gleich oder offen: „geht einher mit …".
  - 3–4 Modelle, technisch verschieden: ausdrücklich nicht zuordenbar.
  - Nie wertend; Ausnahme ist Doc 11 R4.
- **AK 3:** „Technisch gleich" ohne Zusatz nur bei gleicher Bauform. Sonst nennt derselbe Satz die Unterschiede in Maßen/Gewicht.
- **AK 8:** Gezählt werden Fakten statt Wörter, Synonyme zählen mit, Ausnahme ist das Titelsegment. G zeigt jeden Wert einmal. Messung: S2 „taster" ≤ 5, S1 „Lasergraviert" ≤ 2.
- **AK 12:** Eine Zählregel (12a §4), U ist in Schalter, Abschnittskopf und Fazit gleich, U + O + G = eingeblendete Zeilen, keine Prozente, kein „x von y", keine Sprungmarken.
- **AK 18:** Muster „Spaltenwahl" freigegeben, mit seinen Bestandteilen. Die erste U-Zeile beginnt bei höchstens 487 px.
- **AK 24:** Höchstens 16 rem ab 1024, höchstens 13 rem bei 375. Ausnahme bis 13,5 rem nur bei einem 3-zeiligen Titel ohne Design-Linie. Die Höhe wird aus allen Modellen berechnet und ändert sich weder durch Scrollen noch durch Spaltentausch.
- **AK 27:** Überlappende Spannen „(je nach Ausführung)" zählen wie „k. A." als O. Die Zelle zeigt die Spanne weiter.
- **AK 30 / 43:** Geprüft wird gegen die CP0-Kopien in `scratchpad\cp0\` (nicht gegen git HEAD). `vergleich-daten.js` muss byte-gleich sein.
- **AK 33:** Tastaturpfad ohne Sprungmarke: Öffnen → Schalter → „Was bedeutet das?" → [Spaltenwahl] → CTA → Entfernen (+ Rückgängig) → Gemeinsamkeiten anzeigen → Schließen.

## 5 · Nächste Schritte

- **Nutzerin:** gibt die Richtung von 12a frei (inkl. der vollständigen Liste aus Änderung 8) und die Erklärsätze E1–E10 (mit den Prüfpunkten aus Änderung 4).
- **UX-Leitung:** arbeitet die Änderungen 1–8 und 11 in 12a ein (Änderungen 1–4 vor dem Start der UI-Spec für Fazit und Gemeinsamkeiten).
- **UI-Leitung:** startet 12b mit den Änderungen 9–10.
- **PO:** prüft bei CP2 AK C, D, E, G, H und die Messung aus Änderung 10.
