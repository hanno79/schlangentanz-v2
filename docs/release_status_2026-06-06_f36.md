# Release Status 2026-06-06 F36 — Dragstatus und Drop-Feedback stabilisieren

Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Release-Status für den F36-Slice zur stabileren Drag-and-Drop-Bedienung im Schlangenbereich.

## Scope

- Dragstatus im Schlangenbereich als zugängliche Statusmeldung ergänzt.
- Legale Drop-Ziele für eigene Schlangen und Startzone sichtbarer gemacht.
- Illegale Drag-/Drop-Ziele melden klar: `Karte kann hier nicht abgelegt werden.`
- Hängendes Fehlfeedback bei `dragleave` und `dragend` abgesichert.
- F36-UI-Tests und große Engine-Testdateien unter die 500-Zeilen-Grenze gesplittet.
- `check:test-lines` als Qualitätsgate ergänzt.
- `/game` per Vercel-Rewrite auf die SPA gelegt, damit das Playability-Smoke-Gate direkt auf `/game` laufen kann.

## TDD-/Review-Evidence

- RED: Neuer Regressionstest für illegales Drag-Over-Feedback beim Verlassen der Startzone schlug erwartungsgemäß fehl.
- GREEN: `handleDragLeave` räumt auch ungültige Drag-Zustände auf; F36-Targeted-Tests wurden grün.
- Claude `/simplify`: ausgeführt; eine eingeführte Fallback-Regression wurde durch Tests erkannt und zurückkorrigiert.
- Codex Review: initialer Blocker zum hängenden Fehlfeedback gefunden; finaler Re-Review meldete `BLOCKERS: Keine` und `VERDICT: Freigeben`.
- Codex Review zum `/game`-Rewrite: einziger Blocker war untracked `vercel.json`; nach Commit behoben.

## Verifikation lokal

- `git diff --check` → grün.
- `npm run check:test-lines` → grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- Targeted F36: `npm test -- --run src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.f36_drag_drop_timeout_reset.test.tsx` → 3 Testfiles / 26 Tests bestanden.
- Full Tests: `npm test -- --run` → 95 Testfiles / 482 Tests bestanden.

## Release

- Code-Commit/Push: `51689fe — F36 Dragstatus und Drop-Feedback stabilisieren` auf `origin/main`.
- Routing-Fix-Commit/Push: `c82fb94 — F36 /game-Route fuer Vercel-Smoke freischalten` auf `origin/main`.
- Production-Deploy: `https://schlangentanz-v2.vercel.app` bereitgestellt.
- Deploy-Inspect: `https://vercel.com/alfreds-projects-7e9df1b4/schlangentanz-v2/Gw1dEep19jP6WxDLUyMKW6S1NGH2`.
- HTTP-Smoke: `https://schlangentanz-v2.vercel.app/game` → 200.
- Browser-Smoke `/game`: Playwright lädt die App ohne Console-/Page-Errors.
- F36-Live-Smoke `/game`: echte Handkarte per Drag&Drop auf Startzone abgelegt; eigene Schlangen von 0 auf 1; Handkarte entfernt; Status nach Drop leer.
- Invalid-Feedback-Smoke `/game`: illegale Karten-ID zeigt `Karte kann hier nicht abgelegt werden.` und wird nach `dragleave` wieder geleert.

## Offene Hinweise

- Codex Non-Blocker: Startzone-Keyboard-Fallback ist enger als Klick-Fallback; Enter/Space ohne Auswahl startet keine Schlange. Das ist nicht neu in diesem Slice und sollte bei Bedarf als separater Accessibility-Slice behandelt werden.
- Nächster sinnvoller Feature-Slice: Regenbogenschlange engine-seitig per kleinem TDD-Scoring-Slice.
