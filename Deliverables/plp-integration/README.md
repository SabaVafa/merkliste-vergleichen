# PLP-Integration — Vergleichen als entkoppeltes Add-on

Diese Dateien zeigen, wie „Vergleichen" **in die bestehende PLP** (`sprechanlage.html`) eingebunden wird, **ohne den Shop-Core umzuschreiben** — analog zum JTL-Ansatz (Plugin + Child-Template-Overrides statt Änderungen an Snackys-Dateien).

## Inhalt
- **`vergleichen.js`** · **`vergleichen.css`** — das Add-on (Auswahl-Toggle je Karte via MutationObserver, session-basierte Auswahl, Auswahlleiste + barrierefreie Vergleichstabelle). Fachwerte nach dem Phase-0-Merkmalmodell, per Modellfamilie zugeordnet.
- **`sprechanlage-hooks.patch`** — die einzigen zwei nicht-destruktiven Eingriffe in die PLP:
  1. in `sprechanlage.js`: `c.dataset.id = p.id;` in `card()` und `window.MTZ_PRODUCTS = PRODUCTS;` nach dem Katalog-Array (read-only Hook),
  2. in `sprechanlage.html`: je eine `<link>`- und `<script>`-Zeile für das Add-on.

## Einbau
```bash
# 1) Add-on-Dateien neben die PLP legen
cp vergleichen.js vergleichen.css  <PLP>/
# 2) Hooks anwenden
cd <PLP> && git apply sprechanlage-hooks.patch
```

## Verhältnis zu `../vergleichen-flow/`
`../vergleichen-flow/` ist die **weiterentwickelte** Variante desselben Add-ons: zusätzlich mit deaktivierter→aktiver „Vergleichen"-Schaltfläche, Zwischenzuständen und geführter Flow-Tour (kompletter Ablauf). Für eine Live-Einbindung ist `vergleichen-flow` der aktuelle Stand; dieses Verzeichnis dokumentiert die minimale Erst-Integration.

> Hinweis: Diese Kopien wurden aus dem separaten PLP-Projekt übernommen; jenes Projekt bleibt unverändert.
