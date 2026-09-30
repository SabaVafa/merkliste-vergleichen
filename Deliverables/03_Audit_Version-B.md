# Version B — UX/UI Audit, Benchmark & Enhancement Log

**Scope:** `Deliverables/vergleichen-flow-B/` (compare overlay + flow). Version A untouched.
**Role:** Lead Product Design review, 2026-09-30.
**Method:** heuristic audit of the running prototype (desktop 1024 px + mobile 375 px, 2- and 3-model sets), checked against Baymard Institute comparison-tool research and the compare experiences of Apple, Samsung, Galaxus, MediaMarkt/Saturn, Best Buy, Home Depot, B&H Photo, Bosch and Miele.

---

## 1 · Audit findings (before)

| # | Finding | Severity | Evidence |
|---|---|---|---|
| 1 | **"Das unterscheidet sie" panel is unreadable with 3+ models.** Values are joined as an unlabeled dot-chain (`Standard · RFID · RFID · Gesichtserkennung · PIN-Code · QR-Code`) — the customer cannot tell which value belongs to which product. | Critical | 3-model set: 13 rows of dot-chains |
| 2 | **Products are below the fold.** The panel pushes the product images/names/CTAs out of the first viewport. Every benchmark leads with the product header row. | High | 1024×768: table header starts at y≈520 |
| 3 | **Nested scrolling.** The table had its own `max-height` scroller inside the page scroller — two scrollbars, sticky header only working in the inner one, jumpy on touch. | High | `.vgl-wrap{max-height:calc(100vh - 260px)}` |
| 4 | **Sticky product header eats a third of the viewport** (image 112 px + 3-line name + price + UVP + CTA ≈ 260 px) and never compacts. Apple/Samsung shrink the header once you scroll into specs. | High | measured 260 px |
| 5 | **"Bestwert" on the lowest price.** Crowning the cheapest model as "best" contradicts a premium positioning and reads as a discount cue. | Medium | price row |
| 6 | **Difference tint applied in "Nur Unterschiede" mode** — when every row is a difference, tinting all of them is noise. | Medium | `tr.is-diff` |
| 7 | **No attribute explanations.** IK09, PoE, SIP, 146°/82° are shown raw. Baymard: technical attributes need a one-line explanation. | Medium | no tooltips |
| 8 | **No way to add a model from inside the comparison** (Baymard, Best Buy, Home Depot all offer it). | Medium | — |
| 9 | **Long JTL product names** ("VDM10 2.0 Video-Türsprechanlage \| 1 Klingeltaster \| Colson…") clamp to 3 lines with the model buried mid-string. | Medium | header |
| 10 | **"Gemeinsamkeiten" repeated the value per model** (`Ja · Ja · Ja`) although by definition it is the same. | Low | commonalities list |
| 11 | **No print / export** — the B2B audience (installers, planners) compares as part of their job. | Low | — |
| 12 | **Dialog had no focus trap**, table had no caption. | Low (A11y) | — |

**Kept as strengths:** compare-mode gating on the PLP, ≥2 activation logic, tray, "Nur Unterschiede", group bands, neutral "–" for not-applicable, no direct cart (Konfigurieren / Zum Produkt), sessionStorage persistence, guided tour.

---

## 2 · Benchmark — what the leading shops do

| Pattern | Apple | Samsung | Galaxus | MediaMarkt / Saturn | Best Buy | Home Depot | B&H | Bosch / Miele | **Version B (after)** |
|---|---|---|---|---|---|---|---|---|---|
| Product header row pinned while scrolling | ● compacts | ● compacts | ● | ● | ● | ● | ● | ● | **● compacts on scroll** |
| Row-label column frozen (horizontal scroll) | – | – | ● | ● | ● | ● | ● | ● | **●** |
| Hide / show only differences | – | ● | ● | ● | ● (highlight) | ● (shade) | ● | ● | **● auto-on at ≥60 % similarity** |
| Grouped attributes with section bands | ● | ● | ● | ● | ● | ● | ● | ● | **●** |
| Per-product "at a glance" differentiators | ● ("Quick look") | ● | – | – | – | – | – | – | **● "Auf einen Blick"** |
| Attribute explanations (tooltip) | ● | ● | ● | – | ● | – | ● | ● | **● (i) on 10 rows** |
| Add a product from the compare page | – | ● | ● | ● | ● | ● | ● | – | **● "Modell hinzufügen" column** |
| Remove a product in the header | ● | ● | ● | ● | ● | ● | ● | ● | **●** |
| Cap on items | 3 | 4 | 4 | 4 | 4 | 4 | 5 | 3–4 | **4** |
| Neutral "–" for not applicable | ● | ● | ● | ● | ● | ● | ● | ● | **●** |
| Print / share | – | – | ● share | – | – | – | ● | ● print | **● Drucken (print CSS)** |
| Mobile: 2 columns + frozen label column | ● | ● | ● | ● | ● | ● | ● | ● | **●** |

Baymard's four scanning rules — remove identical attributes, group by category, persist column headings, horizontal row styling — are all met.

---

## 3 · Enhancements applied to Version B

1. **Summary strip replaces the panel.** One line verdict ("Zu 89 % ähnlich — 2 Unterschiede entscheiden." / "13 von 18 Merkmalen unterscheiden sich.") plus **jump chips** for each differing attribute; a chip scrolls to the row (opens the details if needed) and flashes it.
2. **"Auf einen Blick" per product** inside the header: up to three differentiators that are *unique to* or *best for* this model, so every value is mapped to its product. Booleans read as the feature name ("Nachtsicht"), ranked rows only when best, access methods as the unique tokens ("Gesichtserkennung, PIN-Code, QR-Code").
3. **Single scroll container** with a **sticky, self-compacting product header** (thumbnail 56 px, one-line name, price, CTA) after 180 px of scroll; frozen row-label column kept.
4. **Model-first naming:** "VDM10 2.0 Video-Türsprechanlage" bold, qualifiers ("1 Klingeltaster · Colson") muted beneath.
5. **CTA pinned to the cell bottom** so columns stay aligned regardless of how many highlights a model has.
6. **Price: neutral delta** ("+ 42,50 €" vs. the lowest in the set) instead of a "Bestwert" badge. Bestwert stays for capability rows (Sichtwinkel, Relais, Nachtsicht, App, SIP, PoE) and is now green.
7. **(i) explanations** on 10 technical rows (plain-language, hover/focus tooltip, `aria-label`).
8. **"Modell hinzufügen" column** (dashed, only while < 4) — returns to the list with a toast.
9. **Difference tint only in the full view**; in "Nur Unterschiede" the rows stay clean. Switch shows the count: "Nur Unterschiede (2)".
10. **Gemeinsamkeiten** states each shared value once, as label → value pairs in two columns, "gilt für alle n Modelle".
11. **Drucken** with a print stylesheet (chrome hidden, header static, all details expanded).
12. **A11y:** focus trap in the dialog, `<caption>`, `aria-expanded` on the details toggle, jump chips are real buttons, tooltips reachable by keyboard.
13. **Mobile:** two-row bar (title + close / switch + clear), 7 rem frozen label column, 10.5 rem product columns with the next column peeking to signal scroll, compact header, single-column commonalities.

### 3b · "Technisch baugleich" state (added after the question *"what if two products are 90 % similar — is the result almost empty?"*)

Two more deciders are now derived from the product titles and compared as rows: **Design-Linie** (last title segment: Colson, Neo, Kian …) and **Namensschild** (Lasergravur vs. Austauschbar). Rows are flagged *soft* (design, nameplate, colours, price) vs. technical. When only soft rows differ, the view switches to the twin state:

14. **Honest verdict:** "Technisch baugleich — der Unterschied liegt in Design-Linie, Namensschild, Farben und Preis." Chips ordered look-first, price last.
15. **The image is the comparison:** product hero grows to 200 px in this state.
16. **"Was der Aufpreis bringt":** the price delta becomes a value statement — "+ 42,50 € für Colson — dafür: 2 zusätzliche Farben (Eisenglimmer, Wunschfarbe) · Namensschild: Lasergravur statt Austauschbar · Design-Linie „Colson"."
17. **Colours explained, not counted:** the Farben row names what is *zusätzlich* / *ohne* per model.
18. **"Alternativen mit echtem Unterschied":** the three nearest models with one to three technical differences (e.g. Niko: Fingerprint; Paketbox model; 3-Klingeltaster Neo), each with the reason and a one-click "Zum Vergleich" that adds it to the set.
19. **Configurator pointer:** colour, nameplate and engraving are decided on the PDP / in the configurator — the technology is identical.

Verified with VDM10 Colson vs. Neo: 4 soft differences, 0 technical → twin state; 16 Gemeinsamkeiten.

---

## 4 · Still open (recommendations, not built)

- **Category lens for Briefkästen** (nameplate type, design, norm) once the Phase-0 model exists for mailboxes. Design-Linie and Namensschild should become real Merkmale in JTL rather than title-derived.
- **"Mit ähnlichen vergleichen"** entry from the PDP (methodology §3 I) — the alternatives engine above can be reused for it.
- **Same model, different colour** → route to the PDP variant selector instead of the comparison (guardrail G) — needs variant data in the catalogue JSON.
- **Share link** (URL with the selected IDs) — trivial once on JTL (`?vergleich=id,id`).

---

### Sources
- Baymard Institute — [User-friendly comparison tools](https://baymard.com/blog/user-friendly-comparison-tools) · [Comparison tool design examples](https://www.baymard.com/ecommerce-design-examples/39-comparison-tool/1298-best-buy) (Best Buy, Home Depot, B&H, Build.com, Crate & Barrel)
- Limely — [Top 8 e-commerce sites with the best product comparison experiences](https://www.limely.co.uk/blog/top-8-ecommerce-sites-with-the-best-product-comparison-experiences) (Apple, Samsung)
- Contentsquare — [Product comparison UI/UX](https://contentsquare.com/blog/product-comparison-ui-ux/)
- Foolproof — [Making product comparison work on mobile](https://foolproof.co.uk/journal/making-product-comparison-work-on-mobile)
