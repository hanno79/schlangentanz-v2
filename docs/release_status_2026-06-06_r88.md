# Release Status 2026-06-06 R88 — Farbwechsler-Aufgabenprüfung

Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Release-Status für den R88-Feature-Slice zur offenen Aufgabenprüfung `Farbwechsler`.

## Scope

- `Farbwechsler` (`aufgabe-05`) wird in `src/engine/aufgabenPruefung.ts` geprüft.
- Regel: Der aktive Spieler erfüllt die Aufgabe, wenn in einer eigenen Schlange mindestens 4 direkt aufeinanderfolgende Farbkarten liegen und diese 4 Farben alle verschieden sind.
- Ein gültiges 4er-Fenster innerhalb einer längeren Schlange zählt.
- Nicht gezählt werden:
  - nur 3 direkt aufeinanderfolgende verschiedene Farbkarten,
  - 4 Karten mit wiederholter Farbe im betrachteten Fenster,
  - Farben über Sonderkarten/Regenbogenschlangen hinweg,
  - gegnerische Schlangen.
- Keine UI-Änderung, keine State-Shape-Änderung.

## TDD-/Review-Evidence

- Spec-Klärung: `Farbwechsler` nutzt direkte Farbkarten-Nachbarschaft in einer Schlange; Sonderkarten unterbrechen.
- RED: `npm test -- --run src/engine/__tests__/turn_state_r88_farbwechsler.test.ts` schlug erwartungsgemäß in 3 positiven Fällen fehl; 4 negative Grenzen waren grün.
- GREEN: `aufgabe-05` wurde im Aufgabenprüfungsmodul registriert und prüft ein laufendes 4er-Farbfenster.
- Claude `/simplify`: ausgeführt; Implementierung von Segment-Aufbau auf Single-Pass mit laufendem Farbfenster vereinfacht.
- Codex Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.

## Verifikation lokal

- Targeted nach GREEN und nach `/simplify`: `npm test -- --run src/engine/__tests__/turn_state_r88_farbwechsler.test.ts src/engine/__tests__/turn_state_r87_lila_riese.test.ts src/engine/__tests__/turn_state_r86_gelber_schatz.test.ts src/engine/__tests__/turn_state_r85_farbkombination.test.ts src/engine/__tests__/turn_state_r82_aufgaben.test.ts tests/architecture_r84.test.ts` → 6 Testfiles / 40 Tests bestanden.
- `npm run check:test-lines` → grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- Full Tests: `npm test -- --run` → 100 Testfiles / 511 Tests bestanden.

## Release

- Code-Commit/Push: `981c6ec — R88 Farbwechsler-Aufgabe pruefen` auf `origin/main`.
- Production-Deploy: `https://schlangentanz-v2-d9qli1ktg-alfreds-projects-7e9df1b4.vercel.app` bereitgestellt und auf `https://schlangentanz-v2.vercel.app` aliasiert.
- HTTP-Smoke: `https://schlangentanz-v2.vercel.app/game` → 200.
- Browser-Smoke `/game`: Playwright lädt die App ohne Console-/Page-Errors; `Schlangentanz` und der Aufgabenbereich sind sichtbar.
- First-Turn-Smoke `/game`: empfohlene erste Aktion ausgeführt; DOM-Zustand geändert; keine Console-/Page-Errors.

## Offene Hinweise

- R88 erweitert nur die Aufgabenprüfung. Weitere Aufgaben bleiben eigene kleine Slices.
