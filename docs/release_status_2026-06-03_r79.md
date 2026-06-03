# Release Status 2026-06-03 R79 — Schlangenfrass dokumentiert und aus den offenen Sonderkarten entfernt

Author: rahn
Datum: 03.06.2026
Version: 1.0
Beschreibung: Release-Status für den R79-Slice, der Schlangenfrass als implementierte Sonderkarte dokumentiert und aus der offenen Sonderkartenliste entfernt.

## Scope

- Schlangenfrass ist als normale Sonderkarte umgesetzt und testabgesichert.
- Die Wirkung ist: 1 oder 2 Karten aus beliebigen Schlangen entfernen.
- Geschützte Ziele werden über die Farbenschutz-Reaktionskette im Uhrzeigersinn abgewickelt.
- Die Spezifikation trennt nun sauber zwischen umgesetzten Sonderkartenwirkungen und offenen restlichen Sonderkartenpunkten.

## Umsetzung

- `docs/GAME_SPEC.md` dokumentiert Schlangenfrass jetzt in `R7.1 Umgesetzte Sonderkartenwirkungen`.
- `docs/GAME_SPEC.md` entfernt Schlangenfrass aus `R7.2 Offene normale Sonderkartenwirkungen`.
- `docs/GAME_SPEC.md` benennt den aktuellen Status der Schlangenfrass-Abwehr-Reaktionskette.
- `tests/spec_documentation.test.ts` prüft die neue Implementierungszuordnung und das Entfernen der alten offenen Formulierung.

## Tests

- Targeted: `npm test -- --run tests/spec_documentation.test.ts src/engine/__tests__/schlangenfrass.test.ts` → bestanden.
- Full Gates: `npm test -- --run`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` → bestanden.
