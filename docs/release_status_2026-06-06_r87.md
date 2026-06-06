# Release Status 2026-06-06 R87 — Lila Riese-Aufgabenprüfung

Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Release-Status für den R87-Feature-Slice zur offenen Aufgabenprüfung `Lila Riese`.

## Scope

- `Lila Riese` (`aufgabe-14`) wird in `src/engine/aufgabenPruefung.ts` geprüft.
- Regel: Der aktive Spieler erfüllt die Aufgabe, wenn eine eigene Schlange mindestens 3 zusammenhängende violette Farbkarten enthält.
- Grundlage: Farbgruppen werden über `ermittleFarbgruppen` erkannt; andere Farben und Sonderkarten unterbrechen Gruppen.
- Nicht gezählt werden:
  - nur 2 violette Farbkarten,
  - violette Karten über Unterbrechungen hinweg,
  - gegnerische Schlangen,
  - Regenbogenschlangen/Sonderkarten als violette Farbkarten.
- Keine UI-Änderung, keine weitere Aufgabenregel ergänzt.
- Kleine Testhelper-Härtung: `schlangeMitFarben` in `testHelpers.ts` erzeugt Karten-IDs mit Schlangen-ID-Präfix, damit Testdaten bei mehreren Schlangen stabil eindeutig bleiben.

## TDD-/Review-Evidence

- Spec-Klärung: `Lila Riese` nutzt die bestehende Farbgruppen-Semantik aus `colorGroups.ts` — zusammenhängende Farbkarten gleicher Farbe ab Mindestlänge 3.
- RED: `npm test -- --run src/engine/__tests__/turn_state_r87_lila_riese.test.ts` schlug erwartungsgemäß in den zwei positiven Fällen fehl; 4 negative Grenzen waren grün.
- GREEN: `aufgabe-14` wurde im Aufgabenprüfungsmodul registriert und delegiert an `ermittleFarbgruppen`.
- Claude `/simplify`: ausgeführt; gemeinsame `schlangeMitFarben`-Testhilfe extrahiert und R87-Test vereinfacht.
- Codex Review: `BLOCKERS: Keine`.
- Codex Non-Blocker behandelt:
  - `schlangeMitFarben` erzeugt eindeutige Karten-IDs mit Schlangen-ID-Präfix.
- Codex Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.

## Verifikation lokal

- Targeted: `npm test -- --run src/engine/__tests__/turn_state_r87_lila_riese.test.ts src/engine/__tests__/turn_state_r86_gelber_schatz.test.ts src/engine/__tests__/turn_state_r85_farbkombination.test.ts src/engine/__tests__/turn_state_r82_aufgaben.test.ts tests/architecture_r84.test.ts` → 5 Testfiles / 33 Tests bestanden.
- `npm run check:test-lines` → grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- Full Tests: `npm test -- --run` → 99 Testfiles / 504 Tests bestanden.

## Release

- Code-Commit/Push: folgt nach finalem Staging-Check.
- Production-Deploy: folgt nach Push.
- HTTP-/Browser-Smoke: folgt nach Production-Deploy.

## Offene Hinweise

- R87 erweitert nur die Aufgabenprüfung. Weitere Aufgaben bleiben eigene kleine Slices.
- R85/R86 behalten aktuell lokale `schlangeMitFarben`-Helper; ein späterer Refactor-Slice kann diese bewusst bündeln, statt dies im Feature-Slice auszuweiten.
