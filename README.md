# METZLER Merkliste + Vergleichen – prototype and specs

Clickable prototype and design documentation for two shop features of edelstahl-tuerklingel.de:

- **Merkliste** (bookmarking): save models and saved configurations, share the list as a link, print it.
- **Vergleichen** (comparison): compare 2–3 models of one category side by side, with a short verdict, differences first and similarities collapsed.

Prototype: **Version B** in [`Deliverables/vergleichen-flow-B/`](Deliverables/vergleichen-flow-B/). It is a static HTML/CSS/JS build with no framework, no build step and no backend. The target platform is JTL-Shop 5; see [15 · Technical feasibility](Deliverables/15_Technische-Machbarkeit_JTL.md).

---

## Online

Hosted with GitHub Pages. The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes only `Deliverables/vergleichen-flow-B/` as the site root; every push to `main` that changes the prototype updates it within a minute or two:

- Türsprechanlagen: https://sabavafa.github.io/merkliste-vergleichen/
- Briefkästen: https://sabavafa.github.io/merkliste-vergleichen/briefkasten.html
- Product page: https://sabavafa.github.io/merkliste-vergleichen/pdp/index.html
- Comparison by link: https://sabavafa.github.io/merkliste-vergleichen/?vergleich=colson1,sdm10x

## Run it locally

The pages must be served over HTTP (`file://` breaks storage and relative paths):

```bash
cd "Deliverables/vergleichen-flow-B"
python -m http.server 8821 --bind 127.0.0.1
```

| Page | URL | Shows |
|---|---|---|
| Category page Türsprechanlagen | http://127.0.0.1:8821/index.html | Bookmarks on the cards, Merkliste in the header, "Vergleichen" mode and the comparison |
| Category page Briefkästen | http://127.0.0.1:8821/briefkasten.html | The same add-ons on a second category (separate comparison per category) |
| Product page (VDM10 2.0 Colson) | http://127.0.0.1:8821/pdp/index.html | "Merken" after a colour, saved configurations, "Zurück zum Vergleich" |
| Comparison by link | http://127.0.0.1:8821/index.html?vergleich=colson1,sdm10x | Opens the comparison directly |

Product photos are loaded from the live shop (`edelstahl-tuerklingel.de/media/…`), so you need an internet connection. The `?v=` numbers on the CSS/JS links are cache busters; bump them when you change a file.

## What is what

```
Deliverables/
  vergleichen-flow-B/        prototype (Version B)
    vergleichen.js / .css      ADD-ON  comparison: tray, comparison overlay, verdict, column picker, print
    merkliste.js / .css        ADD-ON  Merkliste: card bookmarks, drawer, sharing, print, PDP saving
    merkliste-pdp.css          ADD-ON  Merkliste styles that only apply on the product page
    vergleich-daten.js         DATA    comparison values per article (generated, do not edit by hand)
    tools/                     DATA    generator for vergleich-daten.js + shop main images
    index.html, sprechanlage.js   HOST  category page Türsprechanlagen (copied from the PLP prototype)
    briefkasten.html, plp.js      HOST  category page Briefkästen (copied from the PLP prototype)
    plp.css, plp-berater.html     HOST  PLP styles and the embedded Kaufberater
    pdp/                          HOST  product page (copied from the PDP prototype; pdp-b.js/css = Version B)
    Home/, Product Image/, Kaufbrater Images/, Banner/, Poster/, Badge/   images of the host pages
  01_ … 16_ *.md             specs, audits, research (see reading order below)
  08_assets/ 09_assets/ 10_assets/   screenshots referenced by the docs
Design SYSTEM/               older local copy of the Metzler design system (July 2026), reference only
Json Folder/                 product-finder exports, background only; the prototype does not use them
```

**Add-on vs. host.** The two add-ons are what is to be built. They sit on top of the host pages and only talk to them through a few globals (below); the host files are stand-ins for the existing shop templates and are not part of the scope. The add-ons use only `vgl-` (comparison) and `mkl-` (Merkliste) class names.

**Design system.** The binding Metzler Design System lives in Claude Design: https://claude.ai/artifact/GmM9m9zSAbikHUorc4dJ3H. The prototype uses its tokens (rem units, `var(--…)`); the CSS of the add-ons defines a few local aliases (`--v-…`) on top of them. `Design SYSTEM/` in this repo is an older copy, so use the Claude Design version.

## Integration contract (current state of the prototype)

**Globals the host page provides**

| Global | Set by | Content |
|---|---|---|
| `window.MTZ_PRODUCTS` | `sprechanlage.js`, `plp.js` | Products of the category page (id, name, price, uvp, img, …) |
| `window.MTZ_LENS` | host page | Comparison lens / category: `'sprechanlage'` or `'briefkasten'` |
| `window.MTZ_VGL_DATA` | `vergleich-daten.js` | Comparison values per lens and article |
| `window.MTZ_PDP_PRODUCT`, `window.MTZ_MKL_BASE` | `pdp/index.html` | Product of the product page; path prefix `'../'` |
| `window.MTZ_PDP` | `pdp/pdp-b.js` | Product page API; `MTZ_PDP.colours(opener, callback, note)` opens the colour window |

**APIs the add-ons expose**

| API | Purpose |
|---|---|
| `MTZ_VGL.compare(ids)`, `.add(ids)`, `.enterMode()`, `.isMode()`, `.selected()`, `.max` | Comparison (max 3, min 2 models) |
| `MTZ_MKL.open({pick})`, `.close()`, `.items()`, `.has(id)` | Merkliste drawer; `pick` = "Aus der Merkliste" mode of the comparison |

**Events:** `mtz-mkl-change` (window; the Merkliste changed – the comparison updates "Aus der Merkliste (n)"), `mtz:pdp-change` (document; the product page configuration changed).

**Storage** (no personal data, no account)

| Key | Where | Content |
|---|---|---|
| `mtz_merkliste` | localStorage | `{v:1, updatedAt, items[]}`, max 50 entries |
| `mtz_vgl` | localStorage | Comparison selection, one slot per category, 30 days (`mtz_vgl_flow` = old key, migrated) |
| `mtz_mkl_shared` | sessionStorage | A shared list being viewed (read-only until it is taken over) |
| `mtz_vgl_mode` | sessionStorage | Comparison mode on/off for this session |
| `mtz_vgl_prev` | sessionStorage | Last comparison, for "Vorherigen Vergleich wiederherstellen" |
| `mtz_recent` | sessionStorage | Recently viewed models |
| `mtz_return` | sessionStorage | Way back from a product page to the comparison |
| `mtz_mkl_pdp` | sessionStorage | Product page state for saved configurations |

**URLs:** `?vergleich=id,id[,id]` opens a comparison; `#liste=…` is a shared Merkliste (in the fragment, so it never reaches the server); `pdp/index.html?merkliste=<configId>` opens a saved configuration. Prototype-only switches on the product page: `?flow=a|c|d` (other colour-selection variants; default is Version B) and `?touch=1`.

A full inventory with the JTL mapping (plugins, Wawi attributes, what needs admin access) is in [15 · Technical feasibility](Deliverables/15_Technische-Machbarkeit_JTL.md). It was written on 10.11.2026; where it differs from this list, this list and the code are newer.

## Comparison data

`vergleich-daten.js` is generated – do not edit it by hand:

```bash
cd "Deliverables/vergleichen-flow-B/tools"
python -I build_vergleich_daten.py
```

Options: `--src <export.json>`, `--out <file.js>`, `--report <file.md>` (coverage and data gaps).

- **Input:** the shop export `vergleich-briefkasten-sprechanlagen-2026-11-02.json` (Wawi attributes, dimensions, weight). It is expected in `Catalogue merkmale/` at the repo root and is **not in the repository**; ask the project team for it, or pass another export with `--src <file>`.
- **Images:** `tools/shop-bilder.json` = main image of each article on the live shop.
- **Rules:** values are taken over normalised, never guessed. A missing value stays `null` and shows as „k. A.“; "does not apply" shows as „–“. Details: [11 · Datenqualität](Deliverables/11_Vergleich-Datenqualitaet.md).

## Which documents are current

Where documents disagree, the **prototype** wins, then the **newest dated section** of [09 · Umsetzung](Deliverables/09_Adaption_Umsetzung.md). That file is the running decision log since 31.10.2026 (§1–63); later sections replace earlier ones and replace the specs below.

**Read first (binding)**

| Doc | Content |
|---|---|
| [09 · Adaption Umsetzung](Deliverables/09_Adaption_Umsetzung.md) | Everything built and decided after the specs, with dates and reasons. Start at the end. |
| [09b · Zielbild und Build-Spec](Deliverables/09b_Adaption_Merken-Vergleichen_Design.md) | Target picture and build spec for Merken + Vergleichen |
| [12a · Vergleich UX](Deliverables/12a_Vergleich-Redesign_UX.md), [12b · Vergleich UI](Deliverables/12b_Vergleich-Redesign_UI.md) | Comparison: verdict rules F0–F6, row order, counting rule, layout per breakpoint |
| [12c · Vergleich Umsetzung](Deliverables/12c_Vergleich-Redesign_Umsetzung.md) | Comparison as built, with acceptance checks |
| [11 · Datenqualität](Deliverables/11_Vergleich-Datenqualitaet.md) | Which values are reliable and how gaps are shown |
| [05 · Merkliste Flow und Interface](Deliverables/05_Merkliste_Flow_und_Interface.md) | Merkliste spec (drawer, rows, limits) |
| [07a](Deliverables/07a_PDP-Merkliste_Flow_UX.md), [07b](Deliverables/07b_PDP-Merkliste_Interface_Design.md), [10](Deliverables/10_PDP-Merken-Icon_Benchmark-und-Spec.md) | Merken on the product page. The button label is now „Merken“ / „Gemerkt“ (09 §62), not „Konfiguration merken“ |
| [14 · Responsive-Audit](Deliverables/14_Responsive-Audit.md) | Checked widths and the rules for small screens |
| [15 · Technical feasibility (JTL)](Deliverables/15_Technische-Machbarkeit_JTL.md) | Architecture, effort, open questions for admin/Wawi |
| [16 · Design audit](Deliverables/16_Design-Audit_Vergleich.md) | Design check of the comparison |

**Background (history, not binding):** 01/01b Merkmal model and Wawi migration guide, 02 why "Vergleichen", 03 audit Version B, 04 Merkliste benchmark, 06/06a/06b flow audit, 08 Merken position on the PDP, 09a competitor research (+ `09a_research-data.json`), 12 PO brief, review CP1 and acceptance CP4, 13 PLP comparison with the live shop.

## Product rules that the build must keep

- Language: German, formal „Sie“. Words: Merkliste / Merken / Gemerkt and Vergleichen – never "Wishlist" or „günstig“.
- No „In den Warenkorb“ in the Merkliste or in the comparison.
- Bookmark glyph, not a heart.
- Comparison: max 3 models of one category. On phones two are visible at a time; „Auswahl ändern“ opens a bottom sheet.
- Add-to-comparison labels: „Modell hinzufügen“ (general), „Vergleichen“ (on a specific product) – never a bare „Hinzufügen“.
- Product page: „Merken“ needs a colour first. Without one, it opens the existing colour window (side window on desktop, bottom sheet on phones), which explains why.
- Product photos have a white ground and always sit on white.
- Units in rem, colours and radii from design-system tokens; WCAG 2.1 AA (keyboard, focus, screen reader names, contrast, reduced motion).
- German typography: spaced en dash „ – “, quotes „…“.
