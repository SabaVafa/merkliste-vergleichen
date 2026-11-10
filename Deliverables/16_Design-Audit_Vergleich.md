# 16 · Design audit of the comparison page (Vergleich)

**Role:** Lead Product Designer · **Date:** 10.11.2026 · **State audited:** `vergleichen.js?v=92`, `vergleichen.css?v=125`

**Scope:** the whole comparison overlay, checked on both letterbox and intercom data at three widths:
- desktop 1024 px with 4 models and with 2 models;
- phone 375 px with 3 models.

**Overall verdict:** the structure is right. It has a clear order (header → Unterschiede → Nicht für alle gepflegt → Gemeinsamkeiten → Ähnliche Modelle), honest data and a calm palette. What keeps it from looking premium is **visual weight in the wrong places**:
- too much grey;
- product titles that dominate the header;
- noisy "k. A." cells;
- a few layout breaks at mid widths.

None of these needs a new concept; they are refinements.

---

## 1. Findings, by priority

### P1: visibly broken or confusing

| # | Finding | Where | Why it matters |
|---|---|---|---|
| 1 | **Sticky identity strip breaks at ≤ 1024 px.** Names wrap to 2 lines, the CTA wraps and is cut off ("Zum Produkt" under *VDM10 2.0 Colson* shows only half), and some cells centre their text while others are left-aligned. | Strip that appears when scrolling | It is visible during the whole read of the table, so a broken strip makes the whole page look unfinished. |
| 2 | **Grey everywhere flattens the hierarchy.** The header band, the label column, every section bar and the Gemeinsamkeiten bar all use the same paper tone (#F5F6FA). On the phone the section bars and the label bands are identical grey strips, so "Nicht für alle gepflegt" looks like just another row label. | Whole page, worst on the phone | Section headings are the main navigation of a long table; they must stand out from the rows. |
| 3 | **Product titles dominate the header.** With 4 models the full shop titles run to 5–7 lines (e.g. *"Türsprechanlage mit Kamera \| Gesichtserkennung \| Touch-Display \| Live-HD-Video \| Ein- und Mehrfamilien \| SDM10X"*). The header becomes ~370 px tall, the model name is at the end of the title, and the strip shows short names ("SDM10X"). The same product therefore carries two different names on one screen. | Column header | The first thing a customer needs to know is *which model is which*; it should be readable in one glance. |

### P2: quality and polish

| # | Finding | Where | Why it matters |
|---|---|---|---|
| 4 | **"k. A." noise.** In *Nicht für alle gepflegt* many cells read "k. A." (e.g. IK: 3 of 4, Türöffner-Bedienung: 3 of 4). In body-size grey text it looks like an error state and draws as much attention as a real value. | Nicht für alle gepflegt | Missing data should be visible but quiet. |
| 5 | **Mixed value in the dimensions row:** "B 13,3 · H 29 cm · T k. A." puts the unit in the middle and the missing axis at the end. | Abmessungen | Reads like a typo. |
| 6 | **Colour swatches wrap** to a second line at 4 columns (7 swatches), so the row is taller than its neighbours and the "7 Farben" count jumps. | Farben | Uneven row heights in the most visual row. |
| 7 | **Empty width with 2 models.** Each value column stretches to ~290 px for values like "1" or "Digital"; the eye travels far between label and value. | Desktop, 2–3 models | Comparisons with 2 models are the most common case. |
| 8 | **Weak type contrast between levels:** section title 16 / 700, row label 14 / 700, value 16 / 400. Section and label are nearly the same weight and size. | Table | A clearer step between levels makes the table scannable. |
| 9 | **"Maximale Anzahl erreicht" tile** fills the whole height of the header slot (~360 px) for two lines of text. | Header, 4 models | A large empty card for a status message. |

### P3: details

| # | Finding |
|---|---|
| 10 | Phone picker note "2 von 3 Modellen sichtbar – zum Wechseln den Namen antippen." is 12 px grey and easy to miss; the chevron next to the name is the real cue. |
| 11 | Star rating colour (#FFC041) is not a design-system token; check against the shop's rating widget (`metzler_aio_reviews`) and use the same value. |
| 12 | Row separators: value cells have hairlines, the label column has none. With a white label column (see 2) both would need the same hairline. |

---

## 2. Suggestions

| # | Suggestion | Effect | Effort |
|---|---|---|---|
| A (→ 2, 8, 12) | **Grey only for structure, not for every row.** Label column white with bold labels and the same hairlines as the values. Section bars stay grey (as decided), so they become the only grey bands and read as headings on desktop and phone. Section title one step up to 18 px / 700 (h4 token). | Clear hierarchy, lighter page, fewer competing bands | S |
| B (→ 3) | **Model-first title in the header**, like the strip and the Merkliste already do: line 1 "SDM10X" (or "VDM10 2.0 Colson") in 18 / 700, line 2 the descriptive part in 14 px muted, **clamped to 2 lines**, full title in the link/tooltip. One name per product everywhere. *Note: the full title was a user decision on 09.11.; this keeps the full text available but leads with the model.* | Header ~40 % shorter, models identifiable at a glance | S–M |
| C (→ 1) | **Fix the strip:** name on one line with ellipsis, CTA as a short arrow link below it, everything left-aligned, fixed height; below 64 rem show thumbnail + name only (the CTA is in the header anyway). | No broken text while scrolling | S |
| D (→ 4) | **Quieter missing values:** show "Keine Angabe" written out (decided earlier as preferred) in caption size and muted colour. Sort rows inside *Nicht für alle gepflegt* by how many models have a value, so the fullest rows come first. | Missing data visible but calm | S |
| E (→ 5) | **Dimensions:** show only the known axes with the unit at the end ("B 13,3 · H 29 cm") and the missing axis as a second muted line ("Tiefe: keine Angabe"). | Clean value line | S |
| F (→ 6) | **Swatches on one line:** 1.25 rem chips with 0.25 rem gaps, at most 5 chips plus "+2", count on the same line. | Even row heights | S |
| G (→ 7) | **Cap the value column width** at ~20 rem and keep the table left-aligned under the header; extra width stays as white space on the right. | Shorter eye path with 2–3 models | S |
| H (→ 9) | **Compact limit note:** replace the full-height card with a small status line at the top of the slot ("4 von 4 Modellen · Zum Wechseln ein Modell entfernen"), no frame. | Less empty space in the header | S |
| I (→ 10) | Phone picker note at 14 px, or replace it with the "1/3" badges and chevron alone (already self-explanatory). | Clearer on the phone | XS |

**Recommended order:** A and C first (largest visual gain, smallest risk), then B (needs your decision because of the earlier "full titles" choice), then D–H as one polish pass.

---

## 3. What already works (keep)

- **Section order and naming:** differences first, gaps next, commonalities collapsed.
- **One section-bar system** with the action only on Gemeinsamkeiten (10.11.).
- **Explanations in the (i) tooltip** instead of grey lines under values (10.11.).
- **Honest data:** "–" for not applicable vs a marker for missing; nothing guessed.
- **Teal reserved for actions;** ink for content; orange only for the warning icon.
- **Phone layout:** label band above values, two columns with a picker, no horizontal scroll.
