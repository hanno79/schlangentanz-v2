# Schlangentanz v2 — Agent Instructions

## Scope
This repository is a **fresh greenfield rebuild** of Schlangentanz.

Do **not** copy or import code from:
- `/home/projects/schlangentanz-game`
- Paperclip workspaces or artifacts
- old Vercel project output

Old work may be read only as historical reference after explicit Hermes approval, but no code should be copied blindly.

## Regelquelle (ÄNDERUNG 12.11.2026)

- **Einzige verbindliche Regelquelle ist die Website `https://schlangentanz.ch/rules`.**
- `docs/GAME_SPEC.md` spiegelt sie wörtlich (Teil A) und führt die Abweichungen der
  Engine als Arbeitsliste (Teil C) und offene Fragen an den Autor (Teil D).
- Dart-Tasks, Dart-Dokumente, `docs/release_status_*`, `docs/slice_plan_*` und
  `docs/PLAYABILITY_GATE.md` sind **keine** Regelquelle.
- Weicht der Code von der Website ab, ist der Code falsch. Gibt die Website etwas
  nicht her, wird gefragt und nicht geraten.

## Roles
- Hermes: orchestrator, release manager, quality gatekeeper.
- Claude Code: builder for implementation slices.
- Codex: adversarial reviewer and verifier.
- Dart: backlog source. Not a rules source — rules come from the website only.
- Paperclip: archived history/tracking only, **not** an implementation backend.

## Required workflow
1. Keep `docs/GAME_SPEC.md` in sync with the website before real game implementation.
2. Write acceptance tests before production game logic.
3. Implement in small slices.
4. After every coding pass, run Claude Code `/simplify` once as a simplification pre-check.
5. Run tests, typecheck, and build after each slice.
6. Codex reviews every rules/engine slice after the `/simplify` pre-check and before merge/release.
7. No release without `docs/PLAYABILITY_GATE.md` evidence.

## Layout-Verträge (ÄNDERUNG 30.07.2026, AP-2)

Layout-Verträge werden **gemessen, nicht im CSS-Quelltext gelesen**.

- Neue Layout-Zusicherungen gehören als Playwright-Messung nach `tests/layout/`
  und benutzen die Primitive aus `tests/layout/messung.ts`.
- **Keine neuen CSS-Quelltext-Parser.** Es wird kein `readFileSync('src/App.css')`
  mit selbstgebautem Klammer-Walker mehr in Testdateien eingeführt.
  `npm run check:css-asserts` bricht ab, sobald der Bestand steigt.
- `clamp()`-Verträge werden als **Bereich** geprüft (`erwarteHoeheImRemBereich`),
  nie als exakter Pixelwert — sonst ist es dieselbe Brüchigkeit in neuer Verpackung.
- Der Altbestand wird slice-weise abgebaut; die verbleibende Zahl steht in
  `scripts/css_source_asserts_baseline.json`.

## Commands
- `npm test -- --run`
- `npm run test:layout` — Playwright-Layout-Verträge gegen `vite preview`.
  Zwei Projekte: `chromium` (Port 4173, Produktionsbuild) und
  `chromium-testhooks` (Port 4174, Build mit `VITE_TEST_HOOKS=1`) für Verträge,
  die den `?phase=`-Hook brauchen (`*.hooks.spec.ts`). Siehe `docs/WORKFLOW.md`.
  Beide Server laufen mit `reuseExistingServer: false`: antwortet unter der URL
  schon ein Server, bricht Playwright ab, statt ihn weiterzubenutzen und still
  einen alten Build zu messen.
- `npm run typecheck`
- `npm run build`
- `npm run check:test-lines`
- `npm run check:css-asserts`
- `npm run dev`
