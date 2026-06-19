# Release Status — 19.06.2026 — M1bt Waldtanz-Startlichtung

## Slice

M1bt ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die erste eigene Schlangen-/Startkreis-Lichtung wird vor der Handbank freigelegt, damit der Startkreis und seine fünf Startfährten im ersten 1280×900-Spielbild wie ein echtes Brettobjekt statt wie ein verdeckter Listenbereich wirken.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Slice verändert die tatsächliche Erstbild-Geometrie und Hit-Testbarkeit der primären Startentscheidung im Spielbrett.
- Kein Big-Bang: Engine-Regeln, Aktionspfade, Drag-and-drop, Handkarten und Sonderkarten bleiben unverändert; der Eingriff beschränkt sich auf route-scoped CSS, M1bt/M1ax/M1ba-Smoke-Verträge und einen eigenen Browser-Smoke.

## Umsetzung

- `src/App.css`: Die erste eigene Schlangen-Gruppe wird auf Desktop-`/game` etwas weniger aggressiv nach oben gezogen (`translateY(-5.6rem)` statt `-6.1rem`), sodass Startkreis und Startfährten frei über der Handbank bleiben.
- `src/App.m1bt_waldtanz_startlichtung.test.tsx`: CSS-/Smoke-Vertrag schützt die neue Startlichtung, die 3px-Waldkreis-Gestaltung und die ehrliche Handbank-Kante.
- `scripts/m1bt_startlichtung_smoke.mjs`: prüft `/` und `/game` HTTP 200, 1280×900-Geometrie, 3px gestrichelten Startkreis, Hard Shadow, 5 Startfährten, Handbank-Abstand und normalen `elementFromPoint`-Hit-Test.
- `scripts/live_smoke.mjs`: M1ax/M1ba-Prüfpunkte wurden auf den tatsächlich klickbaren Startkreisbereich ausgerichtet und die M1ba-Vorschau scrollt vor der Brettaktion zurück an den ersten Viewport.

## Verifikation

- Claude Code / `/simplify`: `claude --model opusplan` ist weiterhin durch `401 Invalid authentication credentials` blockiert; daher enger manueller Smoke-Blocker-Fallback plus manuelle Simplify-/Line-Budget-Prüfung.
- Codex Review/Re-Review: Review-only auf dem uncommitted Worktree; initial `BLOCKERS: None`, ein Non-Blocker zur alten `Mittelpunkt`-Diagnose wurde behoben. Re-Review: `BLOCKERS: None`.
- Targeted/Adjacent: `npm test -- --run src/App.m1bt_waldtanz_startlichtung.test.tsx src/App.m1ax_waldtanz_freie_lichtung.test.tsx src/App.m1ba_startkreis_vorschau.test.tsx` → 3 Testdateien / 5 Tests bestanden.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4180 node scripts/m1bt_startlichtung_smoke.mjs` → `/` und `/game` HTTP 200; `M1bt Startlichtung: Startkreis 430x129px frei vor Handtop 695px hit-testbar, 5 Startfaehrten sichtbar`.
- Lokaler gesamter Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4180 npm run smoke:production` → `R107 Production-Smoke bestanden`, inklusive M1as/M1aw/M1ax/M1ay/M1bp/M1bc/M1bd/M1bf/M1bg/M1bi/M1bj/M1ba/M1bb/M1bn/M1bl.
- Full Gates: `npm test -- --run` → 285 Testdateien / 875 Tests bestanden; `npm run check:test-lines`; `npm run typecheck`; `npm run lint`; `npm run build`; `git diff --check` grün.
- Line Budget: `scripts/live_smoke.mjs` bleibt exakt bei 500 Zeilen; `scripts/m1bt_startlichtung_smoke.mjs` 88 Zeilen; Testdatei 76 Zeilen.

## Release

Der finale Stand ist auf `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` deployt. Die Alias-Smokes prüfen `/`, `/game`, die generischen Waldtanz-Verträge und den exakten M1bt-Startlichtung-Vertrag.

## Nächste mittlere Lücke

Nach der Startlichtung sollte der nächste autonome Slice nicht wieder ein Geometrie-Mikrofix sein. Sinnvoll ist ein mittlerer Spielwert-Vertical in M1/M2: entweder die Startkreis-/Handkarten-Interaktion mit sichtbarem Snap-/Drop-Feedback weiter körperlich machen oder eine weitere board-nahe Sonderkarten-Zielauswahl als Spielobjekt ausbauen.
