# Release-Status — 19.06.2026 — M1cb Waldtanz-Zielranken

## Status

Release vollständig auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M1cb ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Nach Auswahl einer Handkarte wird die bisher textige `Waldtanz-Zielspur` zu einem körperlichen Rankenpfad `Handkarte → Waldlichtung → Brettziel`. Das verbessert die Entscheidungsspur vom Handkartenfächer ins Brett, ohne Engine-Regeln, Legal-Actions, Drag-and-drop oder bestehende Brettziele umzubauen.

## Umsetzung

- `src/components/WaldtanzZielspur.tsx`: behält `role="note"`/`Waldtanz-Zielspur`, ergänzt `waldtanz-zielspur--rankenpfad`, Badge `Rankenpfad aktiv` und die sichtbare Liste `Waldtanz-Zielranken` mit `Handkarte`, `Waldlichtung`, `Brettziel`.
- `src/App.css`: route-sichere `/game`-CSS-Verträge für den Rankenpfad, 3px-Waldgrün-Rand, Hard Shadow, pillige Rankenpunkte und volle Textbreite im Grid.
- `src/App.m1cb_waldtanz_zielranken.test.tsx`: RED/GREEN-Regressionsschutz für Struktur, Status-Rollen-Eindeutigkeit, CSS-Vertrag und Smoke-Wiring.
- `scripts/m1cb_zielranken_smoke.mjs`: Playwright-Smoke prüft Auswahl einer Farbkarte, Rankenliste, computed 3px-Rand/Hard Shadow, genau einen Status im Brett und Console-/Page-Error-Freiheit.
- `package.json`: `npm run smoke:production` führt den neuen M1cb-Smoke nach M1ca aus.

## Workflow

- RED: `npm test -- --run src/App.m1cb_waldtanz_zielranken.test.tsx` fiel initial wegen fehlendem Smoke/fehlender Zielranken aus.
- Claude Code / `/simplify`: Beide `claude --model opusplan`-Aufrufe waren weiter durch `401 Invalid authentication credentials` blockiert; der Slice wurde als enger manueller Fallback umgesetzt und manuell vereinfacht.
- Codex Review: initialer Blocker zur Grid-Breite des erklärenden Zielspur-Texts wurde test-first behoben. Re-Review: `BLOCKERS: None`.

## Verifikation

- Targeted/Adjacent: `npm test -- --run src/App.m1cb_waldtanz_zielranken.test.tsx src/App.m1z_waldtanz_zielspur.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx src/App.m1n_drag_vorschau.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.f36_drag_drop_timeout_reset.test.tsx src/App.f36_drag_drop_schlange.test.tsx` → 7 Testdateien / 37 Tests bestanden.
- Full Gates: `npm test -- --run` → 292 Testdateien / 891 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Lokaler Vite-Preview-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4179 npm run smoke:production` → `/` und `/game` HTTP 200, bestehende Waldtanz-Smokes grün, `M1cb Zielranken: 3 Rankenpunkte, 3px-Rand, Hard Shadow und ein einziger Status im Brett.`
- Production-Deploy: Vercel Production für Feature-Commit `d4b0a0d — M1cb: Zielranken fuer Brettziele zeigen`, `READY`, stabile Alias `https://schlangentanz-v2.vercel.app`.
- Production-Smoke: `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; `R107 Production-Smoke bestanden`; M1bx/M1by/M1bz/M1ca und neu `M1cb Zielranken` grün; keine Console-/Page-Errors.

## Nächste mittlere Lücke

Als nächster sichtbarer Waldtanz-Vertical bietet sich ein weiterer spielwertiger Board-Entscheidungsfluss an, z. B. die direkte visuelle Kopplung der Rankenpfad-Auswahl an konkrete Magiekreis-/Schlangenende-Hoverzustände oder ein M2-Sonderkarten-Ziel-Vertical. Keine rein mechanische A11y-/IDREF-Folge ohne Spielwert.
