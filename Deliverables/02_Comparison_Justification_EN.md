# Why "Compare"? — Justification & Defense of the Feature

**Context:** METZLER (edelstahl-tuerklingel.de) · Lead Product Design assessment
**Prompted by:** the fair objection — *"Our products are sometimes ~90% identical — do we even need a comparison feature?"*

---

## Executive summary

Comparison matters **precisely because** many METZLER products are very similar and technically dense. When models differ a lot, the choice is easy. When they're 90% alike, the customer is at their **most uncertain** — and needs a tool the most to surface the deciding 10%. That is exactly what a well‑built comparison with "Show differences only" does.

So the objection is **not an argument against** comparison — it's an argument **for a comparison that handles similarity well**, and a signal that the differences that matter simply aren't structured as data today.

---

## 1 · The objection — and why it reverses

**Example (real data, two mailboxes in the same price class):**

| Attribute | Siebert | Ebenhard |
|---|---|---|
| Price | from 89.99 € | from 89.99 € |
| Colour | 7 options | *identical* |
| Compartments · newspaper slot | 1 · integrated | 1 · integrated |
| Dimensions | 37 × 37 × 10.5 cm | 37 × 37 × 10.5 cm |
| **Nameplate** | **laser engraving (permanent)** | **interchangeable (swappable)** |
| **Design / look** | **model "Siebert"** | **model "Ebenhard"** |
| Weight | 3.40 kg | 5.00 kg |

At first glance: nearly the same. In reality, **two purchase‑deciding factors** separate them — the nameplate type (renters want swappable; owners often prefer the premium engraving) and the design. Both are central to the decision — and today **neither is structured on the datasheet nor visible in a comparison**.

> **Core point:** Similarity creates *more* decision uncertainty, not less. Comparison is the instrument that turns "these all look the same" into "*this* specific difference is the one that matters to me."

---

## 2 · Seven reasons the feature is needed

**1. A high‑consideration, technical purchase.**
Intercoms (~€500–2,600), mailboxes, and security are **considered purchases**, not impulse buys. Customers research heavily. Without a comparison tool they do it **manually** — many tabs, screenshots, notes — with high friction and abandonment risk.

**2. The "90% identical" case *is* the need case.**
When differences are large, people decide unaided. When differences are small but consequential, help matters most. "Show differences only" collapses a confusing near‑tie into **a one‑line decision**.

**3. Comparison forces better product data — benefiting the whole shop.**
The apparent sameness is partly a **structuring artifact**: the real differences (camera, viewing angle, IP rating, nameplate type, design) exist but live only in prose. Building comparison requires structuring these attributes (Phase 0) — which simultaneously improves **PDP datasheets, the finder/filters, and SEO**. Comparison is therefore a lever for data quality, not just a UI.

**4. Relieves the hotlines & reduces returns.**
METZLER runs dedicated advice hotlines (incl. the Sprechanlagen hotline). A large share of questions is effectively *"What's the difference between X and Y?"* A comparison answers that **24/7 at no staffing cost** — and prevents **wrong‑model purchases/returns**, which are especially expensive for bulky, sometimes configured hardware.

**5. Premium expectation & competitive parity.**
Comparison is standard on technical premium shops and marketplaces. Its absence on a premium brand reads as a gap. Customers **compare anyway** — the only question is whether **on our site** (well guided) or **elsewhere/laboriously** (leakage).

**6. Conversion & average order value.**
Comparison builds **decision confidence** → higher conversion on considered purchases. It also makes the better‑equipped (often higher‑priced) model's advantages visible → **trade‑up / higher AOV**. And it keeps the customer **on the site during deliberation** instead of drifting to a marketplace.

**7. B2B / professional audience.**
Installers, architects, and property managers (the /b2b path) compare specifications **as part of their job**. A spec comparison (later with export) is baseline for this audience, not a nice‑to‑have.

---

## 3 · How we design and define the tool (so it helps even when most attributes are shared)

The risk isn't similarity itself — it's a tool that treats every attribute equally and repeats the shared ones. The answer is to make the comparison **signal‑seeking**: curate what's compared, weight the differences, and turn spec gaps into guidance. Concretely:

**A. Curate a comparison‑attribute model per category — signal over noise.**
Don't dump every field into the table. For each category, define the attributes that are (1) decision‑relevant *and* (2) actually vary across the catalogue. Rank by **decision impact × variance**; drop or demote constants (e.g. "Brand: Metzler" tells no one anything). This curation — not the UI — is the core definition work (Phase 0), done once per category.

**B. Difference‑first by default.**
Detect how similar the chosen items are and lead with what differs: order rows by "does this differ?" then by importance, collapse identical groups, and auto‑enable "Show differences only" above a similarity threshold. The customer sees the deciding 10% immediately.

**C. State the shared once — don't repeat it.**
A collapsed **"Commonalities (n)"** line summarizes everything identical in one place — *"Both: 1 compartment · integrated newspaper slot · 37 × 37 × 10.5 cm · 7 colours · 89.99 €."* — building trust instead of a wall of matching rows.

**D. Elevate the decisive few — turn spec gaps into guidance.**
A short **"What sets them apart"** block at the top names the 2–4 differing attributes in plain language *and what they mean for the buyer*: *"Nameplate: engraved (permanent, premium) vs. swappable (change the name later)."* A comparison should **advise**, not just tabulate. Where relevant, mark a "best in row" (e.g. widest viewing angle) so the trade‑off is legible.

**E. Category‑aware lenses & row templates.**
Same tool, different lens. Intercoms compare on camera / relays / app / access; mailboxes on nameplate type / design / material / norm. Each category defines **which rows appear and in what order** — so the shared base (brand, warranty, generic dimensions) never crowds out the category's real levers.

**F. The image & design as an explicit comparison dimension.**
For design‑led categories (mailboxes, doorbells, house numbers), the large product image *is* the primary differentiator — it stays pinned at the top of each column, prominent, because for these products "look" outweighs any spec row.

**G. Comparability rules & guardrails.**
Define what may be compared: cross‑model within a category — yes; the **same model in a different colour** — send to the PDP's **variant selector**, not the comparison; mixing incompatible categories — prevent or warn. Cap at **3–4 items**. Handle "not applicable" neutrally (Audio has no camera → "–", never shown as a shortcoming).

**H. Progressive disclosure & human‑readable values.**
Show the key rows first, with "show all technical details" to expand the full spec. Normalize and label values so a difference is *meaningful* — 146° reads as "146° ultra‑wide" next to 88°, with consistent units — otherwise a number difference tells the customer nothing.

**I. Contextual entry & smart alternatives.**
Offer **"compare with similar"** from the PDP and suggest the closest alternatives, so the customer compares the *right* set. When items turn out near‑identical, the tool **says so** and steers to the real decision (look, nameplate) or the configurator — an honest dead‑end beats a table pretending specs decide it.

> **In one line:** the tool is defined by *what it chooses to compare and how it ranks differences* — not by how many rows it can show. Curate per category, lead with differences, summarize the shared, and translate gaps into guidance.

---

## 4 · The cost of *not* having it (risk of inaction)

- Customers compare **manually** (tabs/screenshots) or **on marketplaces** → friction, leakage.
- More *"what's the difference?"* **hotline calls** (staffing cost).
- More **wrong‑model purchases/returns** in exactly the similar categories.
- Weaker position vs. competitors that offer comparison.
- The **prose data debt** (unstructured specs) stays invisible and unaddressed.

---

## 5 · Effort vs. value

- **Engine already exists:** JTL ships the comparison list (session‑based, guest‑friendly) — we **enable and style** it rather than build from scratch → low marginal effort.
- **Double payoff:** the attribute structuring comparison needs also feeds **finder, datasheet, and SEO**.
- **Scales across categories:** once established, the pattern applies to intercoms, mailboxes, doorbells, and security.

---

## 6 · How we'll measure success (so the decision stays testable)

- **Usage:** share of sessions using compare; avg. models compared.
- **Impact:** conversion rate "compare users vs. non‑users"; AOV delta.
- **Relief:** volume of "difference?" hotline enquiries (trend).
- **Quality:** return rate in the high‑similarity categories.
- **Target corridor (hypothesis, to validate):** noticeably higher conversion among compare users and falling "difference?" contacts within 1–2 quarters.

---

## Conclusion

Comparison is **not a luxury for dissimilar products** — it is the **decision tool for similar ones**, exactly where the customer can't get there alone. It lowers advice and return costs, lifts conversion and AOV, keeps customers on the site, serves the professional audience, and — as a by‑product — forces the data quality the whole shop benefits from. The similarity objection is valid — and already answered in the design.

> **Recommendation:** enable and pilot comparison (intercoms), accompanied by category‑specific attribute structuring (Phase 0). Measure success against the metrics above.
