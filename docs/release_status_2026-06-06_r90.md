# Release Status 2026-06-06 R90 — Farbharmonie-Aufgabenprüfung

Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Release-Status für den R90-Feature-Slice zur offenen Aufgabenprüfung `Farbharmonie`.

## Scope

- `Farbharmonie` (`aufgabe-02`) wird in `src/engine/aufgabenPruefung.ts` geprüft.
- Regel: Der aktive Spieler erfüllt die Aufgabe, wenn in seinen eigenen Schlangen mindestens eine Dreiergruppe jeder der sechs Farben vorhanden ist: Rot, Blau, Gelb, Grün, Violett und Braun.
- Dreiergruppen dürfen über mehrere eigene Schlangen verteilt sein.
- Grundlage: Farbgruppen werden über `ermittleFarbgruppen` erkannt; Sonderkarten/Regenbogenschlangen unterbrechen Gruppen.
- Nicht gezählt werden:
  - Farben mit nur zwei zusammenhängenden Karten,
  - Dreiergruppen über Sonderkarten/Regenbogenschlangen hinweg,
  - gegnerische Schlangen.
- Keine UI-Änderung, keine State-Shape-Änderung.

## TDD-/Review-Evidence

- Spec-Klärung: `Farbharmonie` nutzt vorhandene Farbgruppenlogik; jede der sechs Farben muss mindestens eine eigene Dreiergruppe besitzen.
- RED: `npm test -- src/engine/__tests__/turn_state_r90_farbharmonie.test.ts` schlug erwartungsgemäß in 2 positiven Fällen fehl; 3 negative Grenzen waren grün.
- GREEN: `aufgabe-02` wurde im Aufgabenprüfungsmodul registriert und sammelt die Farben der Farbgruppen des aktiven Spielers.
- Claude `/simplify`: ausgeführt; redundante Gruppenlängenprüfung entfernt und die Prüfung kompakt gehalten, ohne Verhalten zu ändern.
- Codex Review: `BLOCKERS: keine`, `NON-BLOCKERS: keine`.

## Verifikation lokal

- Targeted nach GREEN und nach `/simplify`: `npm test -- src/engine/__tests__/turn_state_r90_farbharmonie.test.ts` → 1 Testfile / 5 Tests bestanden.
- Codex-Review-Smoke: `npm test -- src/engine/__tests__/turn_state_r90_farbharmonie.test.ts --run` → 1 Testfile / 5 Tests bestanden.
- `npm run check:test-lines` → grün; R90-Testdatei: 207 Zeilen.
- `npm run lint` → grün.
- `npm run typecheck` → grün.
- Full Tests: `npm test -- --run` → 102 Testfiles / 523 Tests bestanden.
- `npm run build` → grün.

## Release

- Code-Commit/Push: `618064d — R90 Farbharmonie-Aufgabe pruefen` auf `origin/main`.
- Production-Deploy: `https://schlangentanz-v2-myt74454g-alfreds-projects-7e9df1b4.vercel.app` bereitgestellt und auf `https://schlangentanz-v2.vercel.app` aliasiert.
- HTTP-Smoke: `https://schlangentanz-v2.vercel.app/game` → 200.
- Browser-Smoke `/game`: Playwright lädt die App ohne Console-/Page-Errors; `Schlangentanz` und der Aufgabenbereich sind sichtbar.
- First-Turn-Smoke `/game`: erste Aktion im exakt gescopten Bereich `Aktionen` ausgeführt; DOM-Zustand geändert; keine Console-/Page-Errors.

## Offene Hinweise

- R90 erweitert nur die Aufgabenprüfung. Weitere offene Aufgaben bleiben eigene kleine Slices.
