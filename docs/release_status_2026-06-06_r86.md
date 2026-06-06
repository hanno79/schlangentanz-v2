# Release Status 2026-06-06 R86 — Gelber Schatz-Aufgabenprüfung

Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Release-Status für den R86-Feature-Slice zur offenen Aufgabenprüfung `Gelber Schatz`.

## Scope

- `Gelber Schatz` (`aufgabe-13`) wird in `src/engine/aufgabenPruefung.ts` geprüft.
- Regel: Der aktive Spieler erfüllt die Aufgabe, wenn eine eigene Schlange mindestens 6 zusammenhängende gelbe Farbkarten enthält.
- Grundlage: Farbgruppen werden über `ermittleFarbgruppen` erkannt; andere Farben und Sonderkarten unterbrechen Gruppen.
- Nicht gezählt werden:
  - nur 5 gelbe Farbkarten,
  - gelbe Karten über Unterbrechungen hinweg,
  - gegnerische Schlangen,
  - Regenbogenschlangen/Sonderkarten als gelbe Farbkarten.
- Keine UI-Änderung, keine weiteren Aufgaben ergänzt.

## TDD-/Review-Evidence

- Spec-Klärung: `Gelber Schatz` nutzt die bestehende Farbgruppen-Semantik aus `colorGroups.ts` — zusammenhängende Farbkarten gleicher Farbe.
- RED: `npm test -- --run src/engine/__tests__/turn_state_r86_gelber_schatz.test.ts` schlug erwartungsgemäß nur im positiven 6er-Fall fehl; 3 negative Grenzen waren grün.
- GREEN: `aufgabe-13` wurde im Aufgabenprüfungsmodul registriert und delegiert an `ermittleFarbgruppen`.
- Claude `/simplify`: ausgeführt; keine Änderungen vorgenommen, weil der R86-Diff bereits klein genug war.
- Codex Review: `BLOCKERS: Keine`.
- Codex Non-Blocker behandelt:
  - expliziter Test, dass eine Regenbogenschlange/Sonderkarte die gelbe Gruppe unterbricht,
  - positiver Test für `aktiverSpielerIndex = 1`.
- Codex Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.

## Verifikation lokal

- Targeted: `npm test -- --run src/engine/__tests__/turn_state_r86_gelber_schatz.test.ts src/engine/__tests__/turn_state_r85_farbkombination.test.ts src/engine/__tests__/turn_state_r82_aufgaben.test.ts tests/architecture_r84.test.ts` → 4 Testfiles / 27 Tests bestanden.
- `npm run check:test-lines` → grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- Full Tests: `npm test -- --run` → 98 Testfiles / 498 Tests bestanden.

## Release

- Code-Commit/Push: folgt nach finalem Staging-Check.
- Production-Deploy: folgt nach Push.
- HTTP-/Browser-Smoke: folgt nach Production-Deploy.

## Offene Hinweise

- R86 erweitert nur die Aufgabenprüfung. Weitere Aufgaben bleiben eigene kleine Slices.
- Ein späterer Refactor-Slice kann doppelte Testhelper aus R85/R86 in `testHelpers.ts` bündeln; bewusst nicht Teil dieses Feature-Slices.
