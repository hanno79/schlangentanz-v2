# Release Status 2026-06-03 R80 — Farbenfusion dokumentiert und testabgesichert

Author: rahn
Datum: 03.06.2026
Version: 1.0
Beschreibung: Release-Status für den R80-Slice, der Farbenfusion als implementierte Sonderkarte dokumentiert und die offene Sonderkartenliste bereinigt.

## Scope

- Farbenfusion ist als normale Sonderkarte umgesetzt und testabgesichert.
- Die Wirkung ist: zwei nebeneinanderliegende Karten gleicher Farbe in einer eigenen Schlange werden zu einer Punkteeinheit fusioniert.
- Für den Vielfaltbonus wird die Fusion ignoriert.
- Die Spezifikation trennt nun sauber zwischen umgesetzten Sonderkartenwirkungen und nicht mehr offenen normalen Sonderkartenwirkungen.

## Umsetzung

- `docs/GAME_SPEC.md` dokumentiert Farbenfusion jetzt in `R7.1 Umgesetzte Sonderkartenwirkungen`.
- `docs/GAME_SPEC.md` entfernt Farbenfusion aus den offenen normalen Sonderkartenwirkungen.
- `tests/spec_documentation.test.ts` prüft die neue Implementierungszuordnung und das Entfernen der alten offenen Formulierung.
- `src/engine/__tests__/farbenfusion.test.ts` prüft das Fusionieren und die Ablehnung ungültiger Ziele.

## Tests

- Targeted: `npm test -- --run src/engine/__tests__/farbenfusion.test.ts tests/spec_documentation.test.ts` → bestanden.
- Full Gates: `npm test -- --run`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` → bestanden.
