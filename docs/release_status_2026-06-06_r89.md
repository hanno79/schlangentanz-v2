# Release Status 2026-06-06 R89 — Farbvielfalt-Aufgabenprüfung

Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Release-Status für den R89-Feature-Slice zur offenen Aufgabenprüfung `Farbvielfalt`.

## Scope

- `Farbvielfalt` (`aufgabe-04`) wird in `src/engine/aufgabenPruefung.ts` geprüft.
- Regel: Der aktive Spieler erfüllt die Aufgabe, wenn in einer eigenen Schlange mindestens ein direkt aufeinanderfolgendes 6er-Fenster aus Farbkarten liegt und diese 6 Karten exakt alle 6 Farben je einmal enthalten.
- Ein gültiges 6er-Fenster innerhalb einer längeren Schlange zählt.
- Nicht gezählt werden:
  - nur 5 direkt aufeinanderfolgende verschiedene Farbkarten,
  - 6 Karten mit wiederholter Farbe im betrachteten Fenster,
  - Farben über Sonderkarten/Regenbogenschlangen hinweg,
  - gegnerische Schlangen.
- Keine UI-Änderung, keine State-Shape-Änderung.
- R88 `Farbwechsler` nutzt nach `/simplify` denselben internen Fenster-Helper weiterhin mit 4er-Fenster.

## TDD-/Review-Evidence

- Spec-Klärung: `Farbvielfalt` nutzt direkte Farbkarten-Nachbarschaft in einer Schlange; Sonderkarten unterbrechen.
- RED: `npm test -- --run src/engine/__tests__/turn_state_r89_farbvielfalt.test.ts` schlug erwartungsgemäß in 3 positiven Fällen fehl; 4 negative Grenzen waren grün.
- GREEN: `aufgabe-04` wurde im Aufgabenprüfungsmodul registriert und prüft ein laufendes 6er-Farbfenster.
- Claude `/simplify`: ausgeführt; gemeinsame Fensterprüfung für R89 `Farbvielfalt` und R88 `Farbwechsler` extrahiert, ohne Verhalten zu ändern.
- Codex Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.

## Verifikation lokal

- Targeted nach GREEN und nach `/simplify`: `npm test -- --run src/engine/__tests__/turn_state_r89_farbvielfalt.test.ts src/engine/__tests__/turn_state_r88_farbwechsler.test.ts src/engine/__tests__/turn_state_r87_lila_riese.test.ts src/engine/__tests__/turn_state_r86_gelber_schatz.test.ts src/engine/__tests__/turn_state_r85_farbkombination.test.ts src/engine/__tests__/turn_state_r82_aufgaben.test.ts tests/architecture_r84.test.ts` → 7 Testfiles / 47 Tests bestanden.
- Codex-Review-Smoke: `npm test -- --run src/engine/__tests__/turn_state_r89_farbvielfalt.test.ts src/engine/__tests__/turn_state_r88_farbwechsler.test.ts` → 2 Testfiles / 14 Tests bestanden.
- `npm run check:test-lines` → grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- Full Tests: `npm test -- --run` → 101 Testfiles / 518 Tests bestanden.

## Release

- Code-Commit/Push: `da4f2a4 — R89 Farbvielfalt-Aufgabe pruefen` auf `origin/main`.
- Production-Deploy: `https://schlangentanz-v2-b0yjn4t3z-alfreds-projects-7e9df1b4.vercel.app` bereitgestellt und auf `https://schlangentanz-v2.vercel.app` aliasiert.
- HTTP-Smoke: `https://schlangentanz-v2.vercel.app/game` → 200.
- Browser-Smoke `/game`: Playwright lädt die App ohne Console-/Page-Errors; `Schlangentanz` und der Aufgabenbereich sind sichtbar.
- First-Turn-Smoke `/game`: empfohlene erste Aktion im Bereich `Aktionen` ausgeführt; DOM-Zustand geändert; keine Console-/Page-Errors.

## Offene Hinweise

- R89 erweitert nur die Aufgabenprüfung. Weitere Aufgaben bleiben eigene kleine Slices.
