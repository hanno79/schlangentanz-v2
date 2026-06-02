# Release Status 2026-06-02 R75 — Farbenschutz als Schutzmarker spielen

Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: Release-Status für den kleinen Farbenschutz-Slice.

## Scope

- Genau eine normale Basis-Sonderkarte: `Farbenschutz`.
- Die Karte ist in der Ausspielphase als eigene Aktion spielbar.
- Ziel ist eine eigene aktive Schlange des aktiven Spielers.
- Die Zielschlange wird auf Zustand `geschuetzt` gesetzt.
- Nicht Teil dieses Slices: konkrete Schutzwirkung gegen spätere gegnerische Sonderkarten.

## Umsetzung

- `src/engine/legalActions.ts` ergänzt `FarbenschutzSpielen` als legalen Aktionstyp.
- `src/engine/turnState.ts` ergänzt `spieleFarbenschutz()` für Handkartenentnahme, Ablagestapel und Schlangenzustand.
- `src/engine/index.ts` exportiert Aktionstyp und Turn-State-Funktion.
- `src/App.tsx` zeigt Farbenschutz-Aktionen als eindeutige Buttons an.
- `docs/GAME_SPEC.md` beschreibt den kleinen R75-Scope.

## Tests

- `src/engine/__tests__/legal_actions.test.ts` prüft legale Farbenschutz-Aktionen und Ausschlüsse.
- `src/engine/__tests__/turn_state.test.ts` prüft Anwendung, Ablage, Zähler und Fehlerfälle.
- `src/App.r75.test.tsx` prüft UI-Button und sichtbaren geschützten Schlangenzustand nach Klick.

## Verifikation

- Targeted: `npm test -- --run src/App.r75.test.tsx src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/turn_state.test.ts` ✅ — 3 Testfiles, 88 Tests
- Full Tests: `npm test -- --run` ✅ — 51 Testfiles, 313 Tests
- Typecheck: `npm run typecheck` ✅
- Lint: `npm run lint` ✅
- Build: `npm run build` ✅
- Diff-Check: `git diff --check` ✅
- Review: Codex-Abschlussreview ✅ — keine blockierenden Findings nach Pflicht-Abwurf-Fix und DRY-Fix.
- Commit: `ad1b47a — R75: Farbenschutz spielbar machen` ✅
- Push: `origin/main` auf `ad1b47a` ✅
- Deploy: `vercel deploy --prod --yes --token=…` ✅ — Production-Alias `https://schlangentanz-v2.vercel.app`
- Smoke: Production-Alias liefert HTTP 200; Playwright lädt Heading, Farbenschutz-Materialzeile und Ausspielphase ohne Console-/Page-Errors ✅
