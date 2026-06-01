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

## Evidence — 01.06.2026 R23 UI-Zugpflichtenanzeige

- [x] RED: `src/App.test.tsx -t 'R23 UI-Zugpflichtenanzeige'` schlug vor Implementierung fehl.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/legal_actions_discard.test.ts src/engine/__tests__/legal_actions.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 221 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; Nachzug: `MAX_KARTEN_PRO_ZUG` ist noch nicht vollständig Engine-Single-Source-of-Truth.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R24 MAX_KARTEN_PRO_ZUG Single-Source-of-Truth

- [x] Guard-Test: Serialisierung akzeptiert `MAX_KARTEN_PRO_ZUG` und lehnt `MAX_KARTEN_PRO_ZUG + 1` ab.
- [x] Engine-Refactor: `turnState`, `legalActions` und `serialization` nutzen `MAX_KARTEN_PRO_ZUG` statt harter Maximalwert-Literale.
- [x] Targeted: `npm test -- --run src/engine/__tests__/turn_state.test.ts src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/serialization_r19.test.ts src/App.test.tsx` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 223 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Literal-Scan: keine verbleibenden relevanten `gespielteKarten`/`ausgespielteKarten`-Maximalwert-Literale gefunden.
- [x] Codex Review: keine Blocker, keine Non-Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R25 UI-Ausspielphase beenden

- [x] RED: `src/App.test.tsx -t 'R25 UI-Ausspielphase beenden'` schlug vor Implementierung fehl, weil Zugphase/Button noch fehlten.
- [x] Codex-Blocker reproduziert: zusätzlicher RED-Test belegt, dass `Ausspielphase beenden` auch bei weiterer legaler Aktion nach 1 gespielten Karte sichtbar sein muss.
- [x] GREEN: UI rendert `Zugphase`, zeigt `Ausspielphase beenden` ab `gespielteKarten > 0` und ruft `beendeAusspielphase(z)` auf.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/legal_actions.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 225 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review/Re-Review: initialer Button-Gating-Blocker behoben; final keine Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R26 UI-Aufgabenprüfung beenden

- [x] Baseline: `HEAD == origin/main` auf `29b3dcacdeb64943a857e538d6b77ee5d988b4bd`; targeted Tests und Typecheck bestanden.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R26 UI-Aufgabenprüfung beenden'` schlug erwartungsgemäß fehl, weil der Button `Aufgabenprüfung beenden` fehlte.
- [x] GREEN: UI rendert `Aufgabenprüfung beenden` nur bei `zugphase === 'Aufgabenpruefung'` und ruft `beendeAufgabenpruefung(z, { aufgabenGeprueft: true })` auf.
- [x] R25-Regression abgesichert: In `Aufgabenpruefung` ist `Ausspielphase beenden` nicht sichtbar, stattdessen der neue R26-Button.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 226 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; keine actionable Non-Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R27 UI-Zug beenden

- [x] Baseline: `HEAD == origin/main` auf `4662e5489b321fb58438363b7606c6088281727d`; targeted Tests und Typecheck bestanden.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R27 UI-Zug beenden'` schlug erwartungsgemäß fehl, weil der Button `Zug beenden` im `Zugabschluss` fehlte.
- [x] GREEN: UI rendert `Zug beenden` nur bei `zugphase === 'Zugabschluss'` und ruft `beendeZug(z, { pflichtenErfuellt: true })` auf.
- [x] Sichtbarer Engine-State nach Klick: `Zugphase: Nachziehphase`, `Aktiver Spieler: spieler-2`, `Gespielte Karten: 0/2`.
- [x] R26-Regression abgesichert: In `Zugabschluss` ist `Aufgabenprüfung beenden` nicht sichtbar, stattdessen der neue R27-Button.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/turn_state_endrunde.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 227 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; keine Non-Blocker.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R28 UI-Ausspielphase für nächsten Spieler starten

- [x] Baseline: `HEAD == origin/main` auf `eeecfbfefdabde1679bb783a88da647ad94ed48e`; targeted Tests und Typecheck bestanden.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R28 UI-Ausspielphase für nächsten Spieler starten'` schlug erwartungsgemäß fehl, weil `Ausspielphase starten` in der `Nachziehphase` fehlte.
- [x] GREEN: UI rendert `Ausspielphase starten` nur bei `zugphase === 'Nachziehphase'` und ruft `starteAusspielphase(z)` auf.
- [x] Sichtbarer Engine-State nach Klick: `Zugphase: Ausspielphase`, `Aktiver Spieler: spieler-2`, 5 legale Aktionsbuttons, u.a. `Neue Schlange starten mit Karte blau-02`.
- [x] R27-Regression abgesichert: Nach `Zug beenden` ist Spieler 2 in `Nachziehphase` und der neue Startbutton sichtbar.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/turn_state_endrunde.test.ts` bestanden.
- [x] Full tests: `npm test -- --run` → 13 Testfiles, 228 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; Non-Blockers nur Verifikationsnotizen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R29 Pflicht-Nachziehen beim Zugwechsel

- [x] Nutzerfund reproduziert: Screenshot zeigte `spieler-1` in `Nachziehphase` mit nur `blau-03, blau-05, blau-07, blau-09`; die nachgezogene fünfte Karte fehlte sichtbar.
- [x] Root Cause: `beendeZug(...)` wechselte zum nächsten Spieler in `Nachziehphase`, zog aber noch nicht auf 5 Karten auf; Nachziehen passierte erst später in `starteAusspielphase(...)`.
- [x] RED Engine: `turn_state_r29.test.ts` erwartet, dass `beendeZug(...)` den nächsten aktiven Spieler beim Zugwechsel sichtbar auf 5 Karten auffüllt und den Nachziehstapel reduziert.
- [x] RED UI: `App.test.tsx` bildet zwei Züge nach und erwartet bei Spieler 1 zu Beginn des zweiten Zuges `Handkarten: blau-03, blau-05, blau-07, blau-09, blau-11`.
- [x] GREEN: `zieheAufMindesthand(...)` zentralisiert Pflicht-Nachziehen; `beendeZug(...)` nutzt es für den nächsten aktiven Spieler, `starteAusspielphase(...)` behält den Legacy-/Direktzustand-Sicherheitszug.
- [x] `/simplify`: Draw-Logik dedupliziert; keine zusätzliche Regel eingeführt.
- [x] Targeted: `npm test -- --run src/App.test.tsx src/engine/__tests__/turn_state.test.ts src/engine/__tests__/turn_state_r29.test.ts src/engine/__tests__/turn_state_endrunde.test.ts` → 69 Tests bestanden.
- [x] Full tests: `npm test -- --run` → 14 Testfiles, 230 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden Mutation, Double-Draw, Endspurt-Auslöser, Endrundenverhalten und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.

## Evidence — 01.06.2026 R30 UI-Wertungsanzeige

- [x] Scope: Vorhandene Engine-Wertung (`berechneSpielzustandGesamtwertung`) in der UI sichtbar machen; keine neue Scoring-Regel in React.
- [x] RED: `npm test -- --run src/App.test.tsx -t 'R30 UI-Wertungsanzeige'` schlug erwartungsgemäß fehl, weil Wertungszeilen fehlten.
- [x] GREEN: `src/App.tsx` importiert `berechneSpielzustandGesamtwertung`, berechnet die Wertung aus `zustand` und rendert `Wertung {spielerId}: {gesamtPunkte} Punkte` für alle Spieler.
- [x] Test-Härtung: Reihenfolge der Spielerwertung wird explizit geprüft; Wertung aktualisiert nach einer Engine-Aktion sichtbar von `0 Punkte` auf `3 Punkte`.
- [x] Targeted: `npm test -- --run src/App.test.tsx -t 'R30 UI-Wertungsanzeige'` → 2 R30-Tests bestanden.
- [x] Full tests: `npm test -- --run` → 14 Testfiles, 232 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Build: `npm run build` bestanden.
- [x] Codex Review: keine Blocker; geprüft wurden Engine-only-Wertung, Aktualisierung nach UI-Aktion, stabile Reihenfolge, Hook-Dependency, Fixture-Eigentum und Dateigrößen.
- [ ] Production URL returns HTTP 200 — nach Deploy zu prüfen.
- [ ] Game route loads without console errors — nach Deploy zu prüfen.
