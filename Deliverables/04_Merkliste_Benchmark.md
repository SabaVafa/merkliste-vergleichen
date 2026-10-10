# 04 — Merkliste Benchmark (Bookmark / Shortlist) for METZLER

Audit date: 2026-10-10 · Scope: edelstahl-tuerklingel.de (JTL-Shop, template "Snackys") · Author: competitive-UX analysis for the Merkliste + Vergleichen project
UI wording throughout: **Merkliste / Merken / Gemerkt** (never "Wishlist", never "günstig").

---

## 1. Executive summary

1. **The live shop has no usable Merkliste today.** There is no Merken control on listing cards, on the PDP, or in the header. The only native wishlist route (`/Wunschliste`) redirects to a login wall headed "Wunschzettel"; `/favoriten` is not a wishlist at all but the JTL **Vergleichsliste** page. The header carries a hidden `compare-list-menu` stub whose link is titled "Favoriten" but labelled "Zur Vergleichsliste" — three names for two features, none of them "Merkliste".
2. **The research consensus is unambiguous: no login wall.** Baymard finds 75 % of sites gate "Save" behind an account and 89 % make save features hard to use; 21 % of surveyed shoppers rely on save features. NN/g adds that the label "Wishlist" reads as gift-list, and that a good save feature must be discoverable, clearly labelled, transparent and low-effort (no registration, no list naming).
3. **The best-practice stack for METZLER** is OTTO's guest-first model (session list, "Melde dich an, um bereits gemerkte Artikel zu sehen" merge on login) + IKEA's list surface (named lists, share by link/e-mail, print, private by default) + Galaxus's follow-up (price/availability e-mails once an account exists) — minus the "In den Warenkorb" shortcut, which METZLER's configurable products cannot support.
4. **The METZLER-specific twist is configured builds.** No benchmarked shop stores a configuration in its list (Apple saves a configured Mac only inside a saved bag, behind sign-in). The configurator already produces a shareable `?configId=<uuid>` and a client-side PDF; the Merkliste must store `configId` **plus** a snapshot of the configuration summary and price, so a gemerkte Konfiguration survives even if the server-side config expires.
5. **Compare and Merkliste are two tools, not one icon.** Merken is a persistent, always-visible, single-click act; Vergleichen (Version B) is a mode with a cap of 4. The Merkliste page should feed the compare tray ("Auswahl vergleichen"), not replace it.

---

## 2. Live-shop audit (what was actually observed, guest session, cookies declined)

| Surface | Observation |
|---|---|
| **Header (all pages)** | Visible: search, "Login" popup (Anmelden / Passwort vergessen / Jetzt registrieren), Warenkorb ("Warenkorb ist leer"). Hidden: `div.hidden-xs.compare-list-menu.hidden` containing `<a href="/favoriten" title="Favoriten" aria-label="Zur Vergleichsliste">` with badge `0`. No Merken/Wunschliste icon exists for guests or at all. |
| **Listing `/briefkasten`** | Cards (`.p-w > .p-c.thumbnail`) show "Top bewertet" badge, image, rating "(741)", name, "ab 89,99 €", colour swatches "+5 weitere". Each card contains `form.form-basket` with **only** a `jtl_token` — no CTA, no `Wunschliste`/`Vergleichsliste` inputs, no heart. Whole card links to the PDP. |
| **PDP Siebert** | H1, rating, **"Produkt teilen"** dropdown (Link kopieren, social), Hersteller / Breite×Höhe×Tiefe / Artikelnummer, "ab 89,99 €", "Sofort verfügbar", Farbe swatches, primary CTA **"Bitte Farbe wählen"** (`button[name=inWarenkorb].sn-addBasket`, becomes add-to-cart once a colour is picked), Ratenzahlung link, Montageanleitung + GPSR PDFs. **No Merken/Wunschliste control anywhere on the page**, not even hidden. |
| **`/favoriten`** | Page title "Meine Favoriten", body: *"Bitte fügen Sie mindestens zwei Artikel zur Vergleichsliste hinzu."* → this is the JTL **compare** page, guest-accessible, session-based. |
| **`/Wunschliste`** | 302 → `/Konto?r=7`, heading **"Wunschzettel"**: *"Sie sind nicht angemeldet. Bitte geben Sie Ihre Daten ein, um sich anzumelden. Danach gelangen Sie zurück zur Wunschzettel Seite."* Login-gated; JTL default wording, not brand wording. |
| **`/konfigurator`** | Vanilla-JS SPA (Tailwind CDN, jsPDF + autotable, qrcode.js). Top bar: **Zurücksetzen · Teilen · PDF Export**. Clicking "Teilen" rewrote the URL to `?configId=2fa52186-…` and copied the link (clipboard write observed). Side panel: Gesamtsumme, "Konfiguration anzeigen" summary, **"In den Warenkorb"**; step 2 contains a **"Türstationsmodule vergleichen"** button — a second, isolated compare UI. No "Merken"/save-build control. `localStorage` holds only consent/analytics keys — nothing product-related. |

**Implications.** (a) The only persistence primitives available without JTL admin are `localStorage` and the configurator's `configId`. (b) The naming layer is inconsistent (Favoriten / Vergleichsliste / Wunschzettel) and must be unified in the integration spec. (c) "Produkt teilen" and the configurator's "Teilen" are proof that link-based sharing is already accepted in this shop; the Merkliste can reuse the same mental model.

---

## 3. Benchmark table

| Shop | Entry points | Guest vs. account | List surface | Item content & actions | Share | Price/availability alerts | Multiple lists | Compare interplay |
|---|---|---|---|---|---|---|---|---|
| **Amazon.de** | PDP dropdown "Auf den Wunschzettel" below "In den Einkaufswagen"; header "Listen" | Account-bound | Page | Price, availability, notes, priority; add to cart | Link read-only or invite read/write | Price-drop push (app) | Yes | None |
| **OTTO** | Header "Merkzettel" + counter; heart on PDP (not on listing cards) | **Guest session list**; "Melde dich an, um bereits gemerkte Artikel zu sehen" → merge | Page "Mein Merkzettel (0)" | Price incl. activated vouchers; to cart | — | Preisalarm + Wiederverfügbarkeit (app) | No | None |
| **Zalando** | Heart on cards + PDP; header heart | Guest hearts in session; `/wishlist` as guest → **login redirect** (observed); account sync | Page | Size/price; to cart | — | Price drop + restock (app) | No | None |
| **MediaMarkt / Saturn** | Heart next to cart button (PDP); app heart tab | **Onlinekonto required** | Account page "Meine Wunschliste" | Price; to cart | — | Preisalarm with Wunschpreis (app) | No | Separate "Produktvergleich" |
| **IKEA** | Heart on PDP + header heart | Lists tied to IKEA Family for cross-device; "Für später speichern" in checkout | Page, named lists | Price, availability; to cart; print | **Link or e-mail**, private by default; recipient can copy to own list | — | **Yes**, free naming | None |
| **Apple** | "Save for later" in bag; "Saved Items" in account menu | **Sign-in required** for Saved Items and saved bag; guest checkout allowed | Account page | Configured products only via saved bag; "Add to Bag" | — | — | No | None |
| **Galaxus** | Heart on cards/PDP; header | Account for notifications | Page + homepage notices | Price history; to cart | — | **E-mail on price drop or back in stock** for Merkliste and cart (login + notifications on) | Yes | Separate Vergleichen |
| **Bosch Home** (manufacturer) | **No wishlist at all**; "Produktvergleich" on every card | — | — | — | — | — | — | Compare-only model |
| **Manufactum** (premium) | "Merkliste" wording; PDP | Saved in account, cross-device; session otherwise | Page | Price; to cart | — | — | No | None |
| **HORNBACH** | Header "Meine Merklisten" + "Artikelvergleich"; cards + PDP | **Guest: temporary list + print**; account: lists per project; needs cookies | Page; app turns list into aisle-sorted Einkaufsliste | Price, store stock; to cart | Print | — | **Yes** (per project) | Side-by-side with Vergleichsliste |
| **Research** | Baymard: controls belong in header near cart + on PDP near primary CTA | Baymard: 75 % require account, 89 % fail guideline; NN/g: no login wall | NN/g: discoverable, labelled, transparent, low-effort | NN/g: "save for later" link inside cart | — | — | NN/g: no forced list naming | — |

---

## 4. Pattern-by-pattern analysis

**Entry points.** The dominant pattern is a heart/bookmark on the PDP next to the primary CTA plus a header icon with a counter; listing-card hearts are common in fashion (Zalando) but absent at OTTO and most manufacturers. For METZLER the PDP placement must sit beside "Bitte Farbe wählen / In den Warenkorb", and the listing card needs an always-visible "Merken" because cards have no CTA today — Merken becomes the card's only secondary action.

**Guest vs. account.** OTTO and HORNBACH prove that a session/guest list with a soft "Anmelden, um zu synchronisieren" prompt works at scale; Zalando, MediaMarkt and Apple show the login wall that Baymard and NN/g warn against. The right model is guest-first storage with a non-blocking merge on login.

**Persistence.** Guest lists live in cookies/localStorage (HORNBACH explicitly warns that Merk- and Vergleichsliste need cookies). Accounts add cross-device persistence (IKEA, Manufactum). For configured builds, no benchmarked shop persists a configuration in the list; Apple only keeps a configured Mac in a saved bag. METZLER must store `configId` + snapshot itself.

**List surface.** A dedicated page wins everywhere; drawers are used only as a quick confirmation. IKEA's named lists, print icon and three-dot "Teilen" menu are the clearest reference for a premium list page.

**Item content.** Price, availability, chosen variant (colour/size), and a per-item CTA. OTTO re-prices items when a voucher is activated; Galaxus shows price history. METZLER items should show "ab"-price or configured total, selected Farbe, and the configuration summary lines where present.

**Actions.** "To cart" is universal — but METZLER products need configuration first, so the per-item CTA must be **"Konfigurieren"** or **"Zum Produkt"** (never "In den Warenkorb"), consistent with PLP and compare. Remove, notes (Amazon), move between lists (IKEA), print (IKEA/HORNBACH).

**Multiple lists.** Useful only for project-driven buyers (HORNBACH "per project", IKEA rooms). For METZLER this is the B2B/installer case, not the B2C default — keep a single list first, allow named "Projekte" later.

**Notifications.** Price-drop/restock alerts are account- or app-bound everywhere (OTTO, Zalando, MediaMarkt, Galaxus). They need an e-mail address, so they belong to the post-merge phase.

**Interplay with compare.** No consumer shop merges the two; HORNBACH and Bosch keep "Merkliste" and "Vergleich" as parallel tools; Bosch is compare-only. The METZLER shop currently conflates them under `/favoriten`. Keep them distinct, but let the Merkliste page launch a compare of 2–4 gemerkte Artikel.

**Mobile.** Heart icon in the bottom/tab bar (Zalando, MediaMarkt app); list as full page with sticky CTA. Counter badge on the header icon is the universal feedback.

**Micro-interactions.** Filled icon state ("Gemerkt"), counter increments, short toast with "Zur Merkliste" link (OTTO's mini tooltip on the header icon is a good reference). No modal, no page reload, no list-naming prompt.

---

## 5. Recommendations for METZLER (ranked)

### P0 — must-have for the prototype and integration spec
1. **Guest-first Merkliste, no login.** Persist in `localStorage` (`mtz_merkliste`, versioned JSON); works on PLP, PDP, configurator and the compare overlay. Soft prompt on the list page: "Anmelden, um Ihre Merkliste auf allen Geräten zu nutzen" — never a wall.
2. **Entry points.** (a) Listing card: always-visible icon-button "Merken" → "Gemerkt" (filled), independent of compare mode. (b) PDP: "Merken" beside the primary CTA, same vertical rhythm as "Produkt teilen". (c) Header: "Merkliste" icon + counter in the slot of the hidden `compare-list-menu`. (d) Configurator: "Konfiguration merken" next to "Teilen / PDF Export".
3. **Item model that carries configuration.** `{ id, articleId, name, url, img, priceFrom, variant:{farbe}, configId?, configSummary?:[{label,value}], configTotal?, addedAt, priceAtAdd }`. For configured builds store **`configId` + a snapshot** of the summary and total, so the entry remains readable if the server-side config expires; "Konfiguration öffnen" deep-links to `?configId=…`.
4. **List page `/merkliste`** with product rows (image, name, selected Farbe / configuration summary, live price with "Preis bei Merken" delta if changed, availability), per-item **"Konfigurieren" / "Zum Produkt"** (never "In den Warenkorb"), "Entfernen", and a **"Vergleichen" checkbox per row + "Auswahl vergleichen (n)"** that opens the Version B overlay (cap 4, same guardrails).
5. **Wording and naming cleanup in the integration spec.** Rename JTL Sprachvariablen "Wunschzettel/Wunschliste" → "Merkliste", "Favoriten" → "Vergleichsliste" (or hide `/favoriten` once Version B ships), button labels "Merken / Gemerkt / Zur Merkliste".
6. **Feedback.** Icon state change + counter + 3-second toast "Gemerkt · Zur Merkliste". Keyboard/ARIA: `aria-pressed`, live region for the toast.

### P1 — next iteration
7. **Account merge.** On login, union the guest list with the JTL Wunschliste (article IDs via the native wishlist endpoint) and a custom table for configured entries; never drop guest items; show "n Artikel übernommen".
8. **Share the list by link** ("Link kopieren", mirrors "Produkt teilen" / configurator "Teilen"): serialize IDs + `configId`s into a short server-side token (`/merkliste?list=<id>`) — recipients open a read-only copy and can "In meine Merkliste übernehmen" (IKEA model).
9. **PDF export of the Merkliste** (reuse the configurator's jsPDF + autotable): image, name, Artikelnummer, configuration summary, price, link — the B2B artefact for Installateure/Architekten.
10. **Notes per item** ("Bauvorhaben / Kommission"), shown in PDF and share view.
11. **"Für später merken" in the Warenkorb** (NN/g save-for-later), moving a line item — including its JTL `eigenschaftwert` engraving and Kommentar — into the Merkliste.

### P2 — later / account-dependent
12. **Named lists ("Projekte")** and CSV export for B2B.
13. **"Angebot anfordern"** from the Merkliste (prefilled request with the PDF attached) — the real B2B conversion path.
14. **Preis-/Verfügbarkeitsbenachrichtigung** per item (requires e-mail → account; Galaxus model).
15. Multi-device sync for configured builds via account-side `configId` ownership.

---

## 6. Anti-patterns to avoid

- **Login wall on "Merken"** (Zalando list page, MediaMarkt, Apple) — Baymard: 75 % of sites do this and lose new users.
- **"Wishlist"/"Wunschzettel" wording** — gift-list connotation (NN/g); also violates the brand voice.
- **One icon for two features** — the current `/favoriten` "Favoriten / Vergleichsliste" mix; keep Merken and Vergleichen visually and semantically separate.
- **Heart only on hover / hidden in dropdowns** (NN/g: Macy's swipe, Sears dropdown) — METZLER cards must show "Merken" at rest, including on touch.
- **Saving only the article ID for a configurable product** — the native Wunschliste model; the customer loses colour, nameplate, engraving and the whole configuration.
- **"In den Warenkorb" from the list** — impossible for configurable items and inconsistent with PLP/compare CTAs.
- **Forced list naming or modal on first save** (NN/g: low-effort rule).
- **Losing guest items on login / replacing instead of merging.**
- **Silent save** — no icon state change, no counter, no toast.
- **Cookie-dependence without a message** (HORNBACH silently disables the list when cookies are blocked) — show a one-line notice if `localStorage` is unavailable.

---

## 7. Sources

Live shop (observed 2026-10-10): https://edelstahl-tuerklingel.de/ · https://edelstahl-tuerklingel.de/briefkasten · https://edelstahl-tuerklingel.de/metzler-briefkasten-aus-hochwertigem-stahl-siebert · https://edelstahl-tuerklingel.de/favoriten · https://edelstahl-tuerklingel.de/Wunschliste (→ /Konto?r=7) · https://edelstahl-tuerklingel.de/konfigurator

Research:
- Baymard, Product Page UX Best Practices 2026 ("Make It Easy to Access and Use 'Save' Features (89 % Don't)"): https://baymard.com/blog/current-state-ecommerce-product-page-ux
- Baymard, Guideline #622 "Implementing a Cart 'Save for Later' Feature": https://baymard.com/guidelines/622-implementing-a-cart-save-for-later-feature
- Baymard, Accounts & Self-Service UX Best Practices 2025: https://baymard.com/blog/current-state-accounts-selfservice
- NN/g, "Wishlist or Shopping Cart? Saving Products for Later": https://www.nngroup.com/articles/wishlist-or-cart/
- NN/g, Wishlists, Gift Cards and Gift Giving (report): https://www.nngroup.com/reports/ecommerce-ux-wishlists-and-gifts/

Shops:
- Amazon.de — Wunschzettel erstellen: https://www.amazon.de/gp/help/customer/display.html?nodeId=GHCGC7B7SQ222YMD · Wunschzettel teilen: https://www.amazon.de/gp/help/customer/display.html?nodeId=GPWMKQXXSBT8NAHN · Price-drop alerts: https://aboutamazon.com/news/retail/amazon-wish-list
- OTTO — Merkzettel page (observed as guest): https://www.otto.de/wishlist-view/
- Zalando — wishlist (observed redirect to login): https://www.zalando.de/wishlist/ · App listing (price-drop/restock notifications): https://apps.apple.com/de/app/zalando-mode-fashion-online/id585629514
- MediaMarkt/Saturn — "Wie erstelle ich eine Wunschliste?": https://hilfe.saturn.de/app/answers/detail/a_id/16206/~/wunsch--/-merkliste · Preisalarm (App): https://www.mediamarkt.at/de/specials/app
- IKEA — Merkzettel erstellen und teilen: https://www.ikea.com/de/de/customer-service/knowledge/articles/5ee95be1-7bg9-4bc9-bd94-055733e108ec.html · Wunschliste teilen: https://www.ikea.com/de/de/customer-service/knowledge/articles/27927025-021e-46ge-8105-c3de824f8001.html
- Apple — Shopping help (Saved Items, saved bag, sign-in): https://apple.com/shop/help/your_account · https://apple.com/ca/shop/help/shopping_experience
- Galaxus — Merkliste notifications: https://www.galaxus.de/de/page/produkt-zu-teuer-oder-nicht-verfuegbar-abwarten-und-benachrichtigen-lassen-16603 · Price history: https://www.galaxus.ch/en/guide/32
- Bosch Home — category page with "Produktvergleich" per card, no wishlist: https://www.bosch-home.com/de/de/category/waschen-trocknen/waschmaschinen
- Manufactum — account FAQ (Merkliste saved in account): https://www.manufactum.com/account-c201130/
- HORNBACH — FAQ (guest Merkliste + print, multiple lists, cookies): https://www.hornbach.at/services/hilfe-kontakt-haeufige-fragen/ · https://www.hornbach.ch/services/hilfe-und-kontakt/ · App (Merkliste → Einkaufsliste): https://www.hornbach.at/aktuelles/hornbach-app/
