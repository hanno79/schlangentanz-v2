# Release Status 2026-06-02 R78 — Farbenschutz-Abwehr gegen Schlangengrube

Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: Release-Status für den R78-Slice zur einmaligen Farbenschutz-Abwehr gegen gegnerische Angriffe.

## Scope

- Quelle `https://schlangentanz.ch/rules` gezielt geprüft und in `docs/rules_source_2026-06-02_r78.md` extrahiert.
- Farbenschutz ist laut Quelle eine Reaktion des betroffenen Spielers gegen negative Sonderkarten-Effekte.
- R78 implementiert diese Reaktion für die bereits vorhandene Angriffskarte `Schlangengrube`.
- Noch nicht implementierte Angriffskarten (`Farbendieb`, `Schlangenfrass`) bleiben für Folgeslices offen, sind aber in der Spezifikation als Farbenschutz-relevant markiert.

## Umsetzung

- `src/engine/legalActions.ts` ergänzt `abwehrHandkartenId` an `SonderkarteSpielen`.
- Die Abwehr ist nur legal, wenn die angegebene Karte eine `Farbenschutz`-Handkarte des Zielspielers ist.
- `src/engine/turnState.ts` neutralisiert Schlangengrube bei gültiger Abwehr: Schlangengrube und Farbenschutz werden abgelegt; `aussetzenSpielerIndizes` bleibt unverändert.
- `src/App.tsx` benennt optional abgewehrte Schlangengrube-Aktionen eindeutig.
- `docs/GAME_SPEC.md` dokumentiert die R78-Regel und die offenen Folgeslices.

## Tests

- RED: `npm test -- --run src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/turn_state.test.ts` → 2 erwartete Fehlschläge vor Implementierung.
- GREEN: `npm test -- --run src/engine/__tests__/legal_actions.test.ts src/engine/__tests__/turn_state.test.ts` → 2 Testfiles / 90 Tests bestanden.
- Typecheck: `npm run typecheck` → bestanden.
- `/simplify`: Claude Code Opusplan prüfte den Slice; zwei kleine DRY-/Predicate-Vereinfachungen angewendet.
- Full Gates: `npm run typecheck`, `npm test -- --run` → 51 Testfiles / 319 Tests bestanden, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
