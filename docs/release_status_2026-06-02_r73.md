# Release-Status R73 — Benannte normale Sonderkarten im Basisdeck

- Datum: 02.06.2026
- Ziel: Die normalen 32 Sonderkarten des Basisdecks als benannte Karten statt als generische Platzhalter darstellen, z. B. Schlangengrube.
- Ergebnis: `src/engine/deck.ts` erzeugt das Basisdeck als 8 benannte Sonderkartentypen mit je 4 Exemplaren: Farbenschutz, Regenbogenschlange, Schlangenfrass, Schlangenblockade, Farbendieb, Schlangengrube, Farbenfusion und Verdoppler.
- UI: `src/App.tsx` zeigt im Bereich `Material und Aufgaben` zusätzlich die Zeile `Sonderkarten: 4 Farbenschutz, 4 Regenbogenschlange, 4 Schlangenfrass, 4 Schlangenblockade, 4 Farbendieb, 4 Schlangengrube, 4 Farbenfusion, 4 Verdoppler`.
- Tests: `src/engine/__tests__/engine.test.ts` prüft die 32 benannten Basis-Sonderkarten; `src/App.r51.test.tsx` akzeptiert nun benannte Sonderkarten im Startauszug.
- Verifikation:
  - `npm test -- --run src/engine/__tests__/engine.test.ts src/App.r51.test.tsx` ✅
  - `npm test -- --run` ✅ — 50 Testfiles, 295 Tests
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅
- Hinweis: Die Erweiterungssonderkarten aus R72 bleiben unverändert benannt und separat sichtbar.
