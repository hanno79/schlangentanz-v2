---
id: TF-VOLL-004
titel: Auch mit gesetztem VITE_TEST_HOOKS=1 spielt der Vollpartie-Lauf den Produktionsbuild ohne Entwicklertisch.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
skript: playwright.vollpartien.config.ts
aenderung: task/Z1-vollpartien (PR #123)
grenzfall_von: TF-VOLL-001
---

## Worum es geht

Wer in seiner Konsole noch `VITE_TEST_HOOKS=1` von einem anderen Lauf gesetzt hat, soll trotzdem den Produktionsbuild spielen. Sonst prüfte der Lauf einen Build mit Testhooks und hielte ihn für die ausgelieferte App.

## Bestanden, wenn

Der Lauf „Basis zu zweit“ auf Desktop ist grün, und die Dateien in `dist-vollpartien/assets` haben dieselben SHA-256-Prüfsummen wie die aus `npm run build` in `dist/assets`. Das Wort „Entwicklertisch“ kommt in keinem Bundle vor.

## Fehlgeschlagen, wenn

Die Prüfsummen weichen ab oder das Bundle enthält den Entwicklertisch.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Quellstand ab Commit 2ad2cfde, `npm run build` vorher gelaufen |

## Testdaten

`VITE_TEST_HOOKS=1` in der Umgebung des Aufrufs.

## Technische Prüfung

`VITE_TEST_HOOKS=1 npx playwright test --config playwright.vollpartien.config.ts --project desktop -g "zu zweit"`, danach `sha256sum dist/assets/*.js dist-vollpartien/assets/*.js` und `grep -c Entwicklertisch dist-vollpartien/assets/*.js`. Erwartet: Exit 0, gleiche Prüfsummen (`ea17188d…` und `0a1e3382…`), Zählung 0.
