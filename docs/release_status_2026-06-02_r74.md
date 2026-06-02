# Release-Status R74 — Schlangengrube lässt einen gewählten Spieler aussetzen

- Datum: 02.06.2026
- Ziel: Die Sonderkarte `Schlangengrube` soll einen anderen Spieler gezielt für seinen nächsten Zug aussetzen lassen; bei 2 Spielern ist automatisch der andere Spieler betroffen.
- Ergebnis: `src/engine/turnState.ts` führt einen `aussetzenSpielerIndizes`-Zustand ein, `src/engine/legalActions.ts` bietet `SonderkarteSpielen` für `Schlangengrube` an und `src/App.tsx` zeigt die neue Aktion mit Zielspieler im UI an.
- Tests: `src/engine/__tests__/turn_state.test.ts` prüft das gezielte Aussetzen beim Zugwechsel; `src/engine/__tests__/legal_actions.test.ts` prüft die auswählbaren Zielspieler, Endrunden-Zielbarkeit und das Sonderkartenlimit.
- Verifikation:
  - `npm test -- --run src/engine/__tests__/legal_actions.test.ts` ✅ — 23 Tests
  - `npm test -- --run src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/turn_state.test.ts src/App.r53.test.tsx` ✅
  - `npm test -- --run` ✅ — 50 Testfiles, 299 Tests
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅
- Hinweis: Die Spezifikation in `docs/GAME_SPEC.md` wurde um die `Schlangengrube`-Aussetzregel und den neuen Sonderkartenaktionstyp ergänzt.
- Live-Deploy/Smoke: `https://schlangentanz-v2.vercel.app` ✅; Browser-Check liefert `heading=Schlangentanz v2 Greenfield Rebuild`, `material` mit `Schlangengrube` und keine Console-/Page-Errors.
