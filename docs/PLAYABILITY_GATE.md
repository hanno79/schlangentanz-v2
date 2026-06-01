# Playability Gate

A route loading successfully is not enough. A green smoke test is not enough.

## Automated gates

- [ ] Unit tests pass
- [ ] Rule-contract tests pass
- [ ] Invalid-action tests pass
- [ ] State-machine tests pass
- [ ] Integration tests pass
- [ ] Playwright E2E gameplay scenarios pass
- [ ] Typecheck passes
- [ ] Production build passes

## Live production gates

- [ ] Production URL returns HTTP 200
- [ ] Game route loads without console errors
- [ ] New game can be started
- [ ] Legal actions are available only when legal
- [ ] Illegal actions are blocked with clear feedback
- [ ] A complete representative game can be played to end condition
- [ ] Scoring/end state matches spec

## Human gate

- [ ] User confirms the game is actually playable according to the locked spec

## Evidence — 01.06.2026 R20 Pflicht-Abwurf als Legal Action

- [x] Unit/Rule/State/UI tests: `npm test -- --run` → 13 Testfiles, 218 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Production build: `npm run build` bestanden.
- [x] Diff hygiene: `git diff --check` bestanden.
- [x] Codex Review: keine Blocker nach R19-Pflicht-Abwurf-Fix.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.
- [ ] Legal actions are available only when legal — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R21 Pflicht-Abwurf-UI-Binding

- [x] RED: `src/App.test.tsx -t 'R21 UI-Pflicht-Abwurf'` schlug vor Implementierung fehl.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/legal_actions_discard.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 219 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R22 UI-Handkartenanzeige

- [x] RED: `src/App.test.tsx -t 'R22 UI-Handkartenanzeige'` schlug vor Implementierung fehl.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/legal_actions_discard.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 220 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.
