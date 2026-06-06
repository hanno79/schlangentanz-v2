# Release Status 2026-06-06 R85 — Farbkombination-Aufgabenprüfung

Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Release-Status für den R85-Feature-Slice zur offenen Aufgabenprüfung `Farbkombination`.

## Scope

- `Farbkombination` (`aufgabe-03`) wird in `src/engine/aufgabenPruefung.ts` geprüft.
- Regel: Der aktive Spieler erfüllt die Aufgabe, wenn eine eigene Schlange 5 oder mehr Farbkarten gleicher Farbe enthält.
- Nicht gezählt werden:
  - nur 4 gleiche Farbkarten,
  - gleiche Farbe verteilt über mehrere eigene Schlangen,
  - gegnerische Karten,
  - Sonderkarten in derselben Schlange.
- Keine UI-Änderung, keine weiteren Aufgaben ergänzt.

## TDD-/Review-Evidence

- RED: `npm test -- --run src/engine/__tests__/turn_state_r85_farbkombination.test.ts` schlug erwartungsgemäß im positiven 5er-Fall fehl; negative Grenzfälle waren bereits grün.
- GREEN: `aufgabe-03` wurde im Aufgabenprüfungsmodul registriert und zählt Farbkarten pro eigener Schlange des aktiven Spielers.
- Claude `/simplify`: ausgeführt; Testdatei auf bestehende Engine-Testhelper umgestellt, Produktivcode unverändert gelassen.
- Codex Review: `BLOCKERS: Keine`.
- Codex Non-Blocker behandelt:
  - expliziter Test, dass Sonderkarten nicht mitzählen,
  - positiver Test für `aktiverSpielerIndex = 1`.
- Codex Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.

## Verifikation lokal

- Targeted: `npm test -- --run src/engine/__tests__/turn_state_r85_farbkombination.test.ts src/engine/__tests__/turn_state_r82_aufgaben.test.ts tests/architecture_r84.test.ts` → 3 Testfiles / 21 Tests bestanden.
- `npm run check:test-lines` → grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün.
- Full Tests: `npm test -- --run` → 97 Testfiles / 492 Tests bestanden.

## Release

- Code-Commit/Push: `078ef34 — R85 Farbkombination-Aufgabe pruefen` auf `origin/main`.
- Production-Deploy: `https://schlangentanz-v2-2k21q7upy-alfreds-projects-7e9df1b4.vercel.app` bereitgestellt und auf `https://schlangentanz-v2.vercel.app` aliasiert.
- HTTP-Smoke: `https://schlangentanz-v2.vercel.app/game` → 200.
- Browser-Smoke `/game`: Playwright lädt die App ohne Console-/Page-Errors; `Schlangentanz` und der Aufgabenbereich sind sichtbar.
- First-Turn-Smoke `/game`: empfohlene erste Aktion ausgeführt; DOM-Zustand geändert; keine Console-/Page-Errors.

## Offene Hinweise

- R85 erweitert nur die Aufgabenprüfung. Weitere Aufgaben bleiben eigene kleine Slices.
- Der nächste naheliegende Aufgaben-Slice kann eine weitere einfache Aufgabe aus `aufgabenKarten.ts` sein; alternativ kann ein separater Regel-/GUI-Smoke-Slice folgen.
