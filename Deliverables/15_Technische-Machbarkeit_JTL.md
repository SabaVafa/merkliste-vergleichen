# 15 · Technical feasibility audit: Merkliste + Vergleichen on JTL-Shop 5

**Role:** Lead full-stack developer · **Date:** 10.11.2026 · **Scope:** every functionality of prototype Version B (`vergleichen-flow-B`, `vergleichen.js?v=89`, `merkliste.js?v=21`) checked against the live shop https://edelstahl-tuerklingel.de/ and its JTL background system.

**Method:**
- Read-only inspection of the live shop: HTML, response headers, template and plugin assets, JSON-LD, the native compare and wish-list scripts, and the configurator assets.
- Full code inventory of the prototype (storage keys, URL parameters, data fields, inter-module APIs).
- No admin, Wawi or staging access, and nothing on the live shop was changed. Everything that needs admin access to confirm is listed in §8.

---

## 1. Verdict

**Everything in the prototype can be built on the live shop.** No feature depends on something JTL-Shop 5 cannot do. The work splits into three kinds:

| | Meaning | Share of features |
|---|---|---|
| **A · Ready** | Runs client-side as in the prototype. Only needs real IDs and live data from the shop. | ~60 % (all UI, compare mode, strip, overlay, Merkliste drawer, undo, print, `?vergleich=` links, `#liste=` sharing) |
| **B · Plugin work** | Needs server code in a JTL plugin: data endpoint, price/status refresh, account sync, stored configurations, short links. | ~30 % |
| **C · Depends on others** | Not a code question. Needs data maintenance in JTL-Wawi or a decision or API from another team (configurator, new PDP). | ~10 %, but these carry the risk |

**The three things that decide success:**
1. **Comparison data must come from JTL-Wawi Merkmale, not from description text.** Camera, view angle, night vision, IP and IK ratings are currently parsed out of the description prose. On the live shop they must be real Merkmale, otherwise the comparison shows "k. A." where the shop actually has the information (see doc 11).
2. **Prices must always come live from the shop, per customer group.** The shop has B2B customer groups and date-limited special prices (the current offers are valid 01.11.–30.11.2026). Stored prices are only a reference for "since saved" deltas.
3. **"Konfiguration merken" depends on the configurator owners.** The live product page and the Unity configurator do not expose a snapshot/restore interface today. Bookmarking plain models works without them; saving configured builds does not.

---

## 2. What the live shop runs on (findings)

| Area | Finding | Evidence |
|---|---|---|
| Shop system | JTL-Shop 5 | Session cookie `JTLSHOP`, `io.php`, `jtl_token`, `jtl.evo.js` / `jtl.io.js` |
| Template | **Snackys 3.9.7** (parent) + **`metzler`** child template | `templates/Snackys/...?v=3.9.7`, `templates/metzler/js/...`. Legacy references to `templates/ETK2022` (engraving preview) and `NOVA` |
| Own plugins | `metzler_aio_reviews`, `metzler_geo`, `metzler_search`, `metzler_ai_image_notice`, plus `jtl_paypal_commerce` and `jtl_reviews_extended` | Asset paths. **The team already builds JTL plugins in-house**, so a new plugin fits the existing setup. |
| Caching | HTML is **not** cached at the edge: Cloudflare `cf-cache-status: DYNAMIC`, `Cache-Control: no-store`. Session cookie lasts 7 days (`Max-Age=604800`). | Response headers |
| Security headers | CSP only `frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`, HSTS | No script restrictions, so inline data and plugin JS are fine |
| Consent | JTL Consent Manager (`window.CM`, version 52) with marketing and analytics services. There is no "functional" entry. | `consent.js`, `data-storage-key` list |
| Native compare list | **Present and working but hidden** (`div.compare-list-menu.hidden`, no button on cards). Session-based, at `/favoriten`, driven by `io.php` → `pushToComparelist` / `removeFromComparelist`. | `templates/metzler/js/snackys/jtl.article.js:616-735` |
| Native wish list | **Login only:** `/Wunschliste` → 302 → `/Konto?r=7`. IO calls `pushToWishlist` / `removeFromWishlist` exist. | Redirect, `jtl.article.js:738-871` |
| Category page | 41 items in Türsprechanlagen, 22 cards per page, paginated. Each card has `data-article-id` (kArtikel), the "ab" price, UVP (`<del>`), stars and review count from `metzler_aio_reviews`, and colour bubbles with variation images. | `/tuersprechanlagen` |
| Product page | Merkmale rendered as `ul.product-attributes` with SEO links per value. JSON-LD `Product` with `sku` (kArtikel), `mpn` (model code), `offers` (price, availability, **`priceValidUntil` 2026-11-30**), `aggregateRating`. Colour is a JTL variation (`eigenschaftwert[13013]`). Accessories are separate `basket-add` forms. Long text built with the OnPage Composer. | SDM10X page |
| Configurator `/konfigurator/` | Separate app. The core is a **Unity WebGL** build (`myUnityInstance`) with vanilla-JS panels, jsPDF, a QR code, and Sentry. It adds to the cart by posting to `/warenkorb.php` with `jtl_token`. It detects the customer group by fetching a product page (`?a=45162`) and reading `kKundengruppe`. **The share link is generated inside Unity** (`SendMessage('Configurator','ShareLink')`). | `konfigurator/js/cart.js`, `main.js` |
| URL parameters | `/tuersprechanlagen?vergleich=…&von=merkliste` returns 200. The canonical tag stays `/tuersprechanlagen`, so there is no duplicate-content risk. | Response + canonical |

**Important correction:** the PDP the Merkliste was designed on (`pdp/index.html`) has a single configurator: colour, connection, engraving, indoor station, power supply, accessories, and a total. **The live product page has no such configurator today.** It has a colour variation plus separate add-to-cart forms for accessories. Section D (PDP) can therefore only ship together with the new PDP, or in a reduced form ("Merken" without configuration) on the current one.

---

## 3. Target architecture

**One JTL plugin** (working name `metzler_merken_vergleichen`), built like the team's existing `metzler_*` plugins:

```
Plugin metzler_merken_vergleichen
├─ frontend/js   merkliste.js + vergleichen.js (prototype modules, IDs → kArtikel, selectors → Snackys markup)
├─ frontend/css  merkliste.css + vergleichen.css (DS tokens; scoped mkl-/vgl- classes, no collisions found)
├─ Smarty        template blocks in the child template "metzler":
│                  header icon · product card (bookmark + compare checkbox, data-*) · listing toolbar
│                  ("Vergleichen") · PDP (Merken) · footer: data island <script type="application/json">
├─ IO functions  via io.php (same channel as the native compare/wish list, jtl_token protected):
│                  mtzCompareData(ids)      → comparison rows from Merkmale (+ hints, ratings, images)
│                  mtzStatus(ids)           → live price "ab"/UVP/availability per customer group
│                  mtzMklSync(items)        → login merge into the wish list (union)
│                  mtzCfgSave/Load(cfgId)   → stored configurations (phase 2)
│                  mtzShare(items) → code   → short link /merkliste/<code> (phase 2)
├─ DB tables     plugin_mtz_cfg (configurations) · plugin_mtz_share (snapshots), both with expiry
├─ Admin         settings: max. compare 4, Merkliste limit 50, Merkmal → row mapping, hint texts
└─ Language vars all UI text (Merkliste / Merken / Vergleichen; replaces "Wunschzettel"/"Favoriten")
```

**Why not use the native compare list and wish list directly?**
- **Native compare list:** it lives in the PHP session (7-day cookie) and has a fixed page layout. The prototype keeps the selection per category for 30 days in `localStorage`, works without a round trip, and renders its own overlay. **Recommendation:** keep the native compare list disabled (Settings → Vergleichsliste) so there are not two compare systems. `/favoriten` is its SEO URL today; redirect it to the category page.
- **Native wish list:** it requires login. The prototype's Merkliste works for guests (`localStorage`). **Recommendation:** use the wish list as the server store for logged-in customers only (tables `tWunschliste` / `tWunschlistePos`). Guests keep `localStorage`; at login the plugin merges both as a union.

---

## 4. Feature by feature

Effort is a rough estimate in developer days for one experienced JTL developer, frontend included; see §7.

### 4.1 Category page (PLP)

| Feature | Status | How on JTL | Notes / risks |
|---|---|---|---|
| "Vergleichen" toolbar button, compare mode, "Vergleich beenden" + undo | **A** | Smarty block in the listing toolbar; mode stays in `sessionStorage` | — |
| Compare checkbox per card (visible only in compare mode, max 4) | **A** | Card template outputs `data-mtz-id="{kArtikel}"`; the JS injects the checkbox as today (MutationObserver) | Prototype selectors (`.pcard`, `.pcard__footer`, `#productGrid`) must map to the Snackys card markup. Better: output the hooks in the Smarty template instead of guessing selectors. |
| Sticky strip (thumbnails, hint, "Vergleich leeren", "Vergleichen") | **A** | Pure frontend | Check against Snackys' own fixed elements (cookie bar, chat, back-to-top) at the page bottom |
| Bookmark on every card + toast + undo | **A** | Card template outputs `data-mtz-id`, name and image URL | — |
| Header Merkliste icon with counter | **A** | Smarty block in the header between account and cart; counter rendered by JS from `localStorage` | HTML is not edge-cached, but a JS counter is cache-proof anyway |
| Merkliste drawer adds to the strip while compare mode is on | **A** | Frontend only (`MTZ_VGL.add`) | — |
| Persistence 30 days per category, tab sync | **A** | `localStorage` `mtz_vgl` | Category = JTL category ID or a "lens" setting per category in the plugin admin |
| Guided tour | **—** | Prototype only. Do not ship. | — |

### 4.2 Comparison overlay

| Feature | Status | How on JTL | Notes / risks |
|---|---|---|---|
| Dialog, focus trap, Esc, Back closes, `?vergleich=` in the URL, page title | **A** | Frontend | Canonical already strips the parameter. Add `noindex` for `?vergleich=` as extra safety. |
| Column header: photo, full title, stars + count, "ab" price + UVP, CTA | **B** | `mtzCompareData` returns name, main image (`cBildpfad`, md size), `aggregateRating` from `metzler_aio_reviews`, price/UVP **per customer group** via the article object | Stars/count: read from the in-house review plugin, no extra source. **The CTA label (Konfigurieren / Zum Produkt) must come from data** (e.g. a function attribute or a category flag), not from the prototype's name regex. |
| Sections Unterschiede / Nicht für alle gepflegt / Gemeinsamkeiten, "k. A." / "–" | **B + C** | Rows = Merkmale per article from the shop DB; classification stays in JS | **Data is the risk:** see §5. The logic itself is unchanged. |
| (i) explanation per row | **B** | Hint texts as plugin language variables or a plugin setting per Merkmal ID | JTL Merkmale have no frontend help-text field, so they are kept in the plugin. |
| Colour swatches | **B** | Colours from the variation (Farbe) with the hex or image of the Merkmalwert/variation value | Prototype has a hard-coded hex map. Use the shop's bubble images/classes (`cc-bubble ral-7016-…`) instead. |
| "Bestwert" (IP/IK) | **A** once the data exists | Frontend | — |
| Ähnliche Modelle (up to 3) | **B** | Candidate pool = all articles of the same category, supplied by `mtzCompareData` (or a second call). Selection logic stays in JS. | Needs the full category data, not just the compared IDs. 41 intercoms / 79 letterboxes is small enough for one cached response (JTL object cache). |
| Column limits by width, column picker | **A** | Frontend | — |
| Sticky identity strip | **A** | Frontend | — |
| Add model → back to the category page in compare mode | **A** | Frontend | — |
| "Aus der Merkliste" → drawer in pick mode | **A** | Frontend | — |
| Remove column + undo, "Vergleich leeren" + restore | **A** | Frontend | — |
| "Link kopieren" (`?vergleich=` with IDs) | **A** | Frontend; IDs = kArtikel | A link with IDs from another category: the server knows the category of each kArtikel, so `mtzCompareData` returns it and the "Dort öffnen" decision becomes exact. |
| Drucken | **A** | `window.print()` + print CSS | Check the Snackys print stylesheet so header/footer do not leak into the print |
| Data notice "nicht im Shop-Export" | **—** | Disappears on the live shop: data comes straight from the shop | — |

### 4.3 Merkliste drawer

| Feature | Status | How on JTL | Notes / risks |
|---|---|---|---|
| Rows: image, model-first name, price, UVP, CTA, delete + undo, clear all + confirm, limit 50 | **A** | Frontend, `localStorage` `mtz_merkliste` | — |
| Price refresh and "Seit dem Merken gesunken/gestiegen" | **B** | `mtzStatus(ids)` on drawer open: current "ab" price, UVP, availability per customer group | **Must** replace the prototype's `priceSrc` workaround. Special prices end 30.11.; without a live call every saved item would show a wrong price from 01.12. |
| Availability line | **B** | `mtzStatus` returns the JTL delivery status | Implemented in the UI but never fed in the prototype |
| Grouping by category, compare 2–4 of one category, cross-category handover | **A** | Category per item from `mtzStatus` or stored at add | — |
| Pick mode (from the comparison and from compare mode) | **A** | Frontend | — |
| "Anmelden, um die Merkliste auf allen Geräten zu nutzen" | **B** | At login: `mtzMklSync` merges `localStorage` items into the native wish list (union, no duplicates). While logged in, writes go to both. Server is the source of truth. | Use the wish list only for model items; configurations go into `plugin_mtz_cfg`. Rename the language variables ("Wunschzettel" → "Merkliste"). |
| Storage-blocked notice | **A** | Frontend | — |

### 4.4 Product page (PDP)

| Feature | Status | How on JTL | Notes / risks |
|---|---|---|---|
| "Merken" (model) + echo in the sticky bar | **A** on the current PDP | Smarty block next to the buy box; needs kArtikel, name, image, price | Works today without a configurator |
| "Konfiguration merken", "Geändert seit dem Merken", update in place | **C** | Needs a snapshot/summary/restore interface from the configurator (the prototype's `window.MTZ_PDP`) | **Not possible on the current live PDP:** it has no single configurator (colour variation + separate accessory forms). Ships with the new PDP. |
| Restore `?merkliste=<cfgId>` with band (expired / no longer available / price updated) | **B + C** | `plugin_mtz_cfg` stores the state server-side with UUID, kKunde or session hash, kArtikel, state JSON, total and expiry. Restore runs through the configurator's own controls. | Client-generated IDs (`c-<article>-<rand>`) are replaced by server UUIDs. |
| Configured builds from `/konfigurator/` (Unity) | **C** | Only if the configurator team exposes the share link (or a config ID) to JS, e.g. a callback after `ShareLink`. The Merkliste then stores the link as the item URL. | The share link is created inside Unity today; it is not visible whether it is stored server-side. Owner: configurator team. |
| "Zurück zum Vergleich" in the breadcrumb | **A** | `sessionStorage` `mtz_return`; adapt the href pattern to the shop's SEO URLs | Prototype regex expects `*.html?vergleich=`; must accept `/<category-seo-url>?vergleich=` |

### 4.5 Sharing, print, PDF

| Feature | Status | How on JTL | Notes / risks |
|---|---|---|---|
| Merkliste link `#liste=` (compressed in the URL, no server) | **A** | Frontend. The hash never reaches the server, so no data protection issue. Host allowlist for images → `edelstahl-tuerklingel.de/media/image/…` | Prices are frozen in the link, so the receiver must re-price via `mtzStatus`. Engraving text consent prompt is already built. |
| Short link `/merkliste/<code>` (12 months) | **B** | Optional, phase 2: `plugin_mtz_share` + plugin frontend link (SEO route) | Only needed if `#liste=` links get too long (limit 7,000 characters, roughly 30+ items) |
| Merkliste print / "PDF" via the print dialog | **A** | `window.print()` | A real PDF (logo, ArtNr, QR) is possible with jsPDF, which the configurator already uses: about 3 days |
| Comparison print | **A** | As above | — |

---

## 5. Data feasibility

| Data | Source on JTL | Status |
|---|---|---|
| ID | `kArtikel` (card `data-article-id`, JSON-LD `sku`) | Available. **Compare and bookmark the parent article (Vaterartikel)**; variations (colours) are attributes of the parent. |
| Name, model code | Article name; model code from `mpn` (e.g. `SDM10X`) | Available. Better than the prototype's name parsing (`MODEL_RE`): use `mpn` directly. |
| Price "ab", UVP | JTL article object, per customer group (B2C gross / B2B net) | Available, **always live** |
| Special price + validity | JTL special prices (`priceValidUntil` in JSON-LD) | Available. Optionally show "Angebot bis 30.11." |
| Rating, review count | `metzler_aio_reviews` (in-house) | Available. Needs a small read accessor from the review plugin. |
| Images | Article and variation images (`/media/image/product/…`, `/media/image/variation/…`) | Available |
| Availability / delivery time | JTL delivery status | Available |
| Structured Merkmale (Farbe, Klingeltaster, Montageart, Türöffner-Bedienung, System, Namensschild; Briefkästen: Fächer, Zeitungsfach, Material, Montageart) | JTL-Wawi Merkmale (rendered as `product-attributes`) | Available |
| **Camera, view angle, night vision, IP rating, IK rating, Kombi/Set** | Today **only in the description prose**. The prototype extracts them from the text (`specsFromDescription`). | **Missing. Must be created as Merkmale in JTL-Wawi** (doc 01 / 11). Without this, these rows show "k. A." on the live shop. This is the largest single task, and it is data entry, not code. |
| Briefkästen new Merkmale N1–N15 (Design-Linie, Einwurf, Schloss, …) | Doc 01b | **Missing.** Same as above. |
| Dimensions, weight | Article fields (width/height/depth, weight) | Available, but the data quality is uneven (e.g. Siebert vs Ebenhard weight, doc 01b). Clean up in Wawi. |
| Hint texts (i), meaning lines | — | Plugin language variables (maintained by the shop team) |
| Colour hex / swatch | Variation value images / CSS classes (`cc-bubble ral-…`) | Available |

---

## 6. Non-functional checks

| Topic | Assessment |
|---|---|
| **Data protection / consent** | `localStorage`/`sessionStorage` for a list the user explicitly creates counts as strictly necessary (§ 25 Abs. 2 Nr. 2 TDDDG): no consent banner entry needed. **List the keys in the privacy policy** (`mtz_merkliste`, `mtz_vgl`, `mtz_vgl_mode`, `mtz_mkl_shared`, `mtz_mkl_pdp`, `mtz_return`). No personal data except optional engraving text; the share prompt already asks before including it. Account sync stores data under the customer account: covered by the existing customer-account terms. |
| **Security** | IO calls that write (sync, save configuration, share code) need `jtl_token` (CSRF), as the native IO calls do. Validate IDs server-side (integer kArtikel, visible to the customer group). The `#liste=` receiver already validates strictly (whitelisted keys, length limits, relative URLs). |
| **Performance** | Comparison data: one IO call per opening (≤ 4 articles + candidates of one category ≈ 40–80 articles). Cache per category and customer group in the JTL object cache, invalidated on Wawi sync. Merkliste status: one call per drawer opening. No impact on the page HTML. |
| **SEO** | `?vergleich=` keeps the category canonical (checked). Set `noindex` on comparison states. Redirect `/favoriten` (native compare list) to avoid an empty indexable page. |
| **Accessibility** | Already built to WCAG 2.1 AA in the prototype (focus trap, live regions, 44 px targets). Re-test inside Snackys (z-index, fixed elements, skip links). |
| **Template updates** | Snackys updates can overwrite parent templates. **Put all changes in the child template `metzler` or the plugin**, never in Snackys. |
| **Multi-tab / multi-device** | Tab sync via the `storage` event is built. Device sync only with login (§4.3). |
| **B2B** | Prices and the "ab" label differ for B2B groups (net). The plugin must use the customer group of the session, as the configurator already does. |

---

## 7. Effort and phases (estimate)

Assumes one experienced JTL-Shop 5 developer who knows Snackys, plus QA. Without admin access these are ranges, not commitments.

| Phase | Content | Estimate |
|---|---|---|
| **0 · Data** (shop team, can start now) | Create the missing Merkmale in JTL-Wawi (camera, view angle, night vision, IP, IK, Kombi; Briefkästen N1–N15), fill them for the pilot category Türsprechanlagen, fix dimension/weight outliers | 3–5 days of data work for 41 intercoms; Briefkästen afterwards |
| **1 · MVP** (guest) | Plugin skeleton, Smarty hooks (header, card, toolbar, PDP "Merken" for models), `mtzCompareData` + `mtzStatus` with caching, port the JS (IDs → kArtikel, selectors, data island), language variables, hint texts, disable the native compare list, QA in Snackys | 12–18 days |
| **2 · Account + sharing** | Login merge into the wish list, short link `/merkliste/<code>`, real PDF | 6–10 days |
| **3 · Configurations** | `plugin_mtz_cfg`, "Konfiguration merken" + restore, integration with the new PDP configurator and/or the Unity share link | 5–8 days **after** the configurator interface exists |

**Recommended order:** start Phase 0 immediately (it blocks the comparison's value), build Phase 1 for the pilot category only (Türsprechanlagen), then roll out to Briefkästen once their Merkmale exist.

---

## 8. Not verified (needs admin, Wawi or team input)

1. **Exact JTL-Shop version** (5.x) and the PHP version: needed to confirm the plugin hooks and IO registration used by the existing `metzler_*` plugins.
2. **Wawi Merkmal setup:** which Merkmale exist without being shown, and whether the shop team can create new ones (doc 01 model).
3. **Review plugin API:** how `metzler_aio_reviews` exposes the rating average and count to other plugins.
4. **Unity configurator:** whether the share link / config ID is stored server-side, and whether it can be passed to JS.
5. **New PDP:** timeline and owner of the PDP with a single configurator (prerequisite for "Konfiguration merken").
6. **Native compare list / wish list settings:** whether anything (e.g. a newsletter or the account page) relies on them before they are disabled or renamed.
7. **B2B customer groups:** which groups exist and whether B2B customers should see the Merkliste/comparison at all (memory: B2C first).
8. **Product questions / OPC content:** none of the features depend on it, but OPC long texts are where the missing Merkmal values currently live.
