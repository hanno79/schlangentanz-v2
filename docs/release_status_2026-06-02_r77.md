# R77 — Spec-Status bereinigt

Datum: 02.06.2026

## Ziel

Die Spezifikation sollte von veraltetem Draft-/Template-Wording bereinigt werden, ohne Spielregeln zu ändern oder neue Sonderkartenwirkungen zu erfinden.

## Ergebnis

- `docs/GAME_SPEC.md` beschreibt sich jetzt als aktive, inkrementell versionierte Projektspezifikation.
- Der alte Hinweis `No real game implementation should begin...` wurde entfernt.
- Der generische Entities-TODO wurde durch den aktuellen Bestand zentraler Spielobjekte ersetzt.
- Der alte `Acceptance Sign-Off`-Block wurde durch `Status und offene Regelfragen` ersetzt.
- `tests/spec_documentation.test.ts` sichert diese Bereinigung gegen Rückfall in altes Template-Wording ab.
- Nach Codex-Review wurden drei verbliebene `Draft — Signoff ausstehend`-Hinweise ebenfalls durch Arbeitsstatus-Hinweise ersetzt.

## Verifikation

- RED: `npm test -- --run tests/spec_documentation.test.ts` → 1 erwarteter Fehlschlag wegen altem Draft-/Template-Status.
- Review-RED: verschärfter Test gegen `Draft — Signoff ausstehend` schlug erwartungsgemäß fehl.
- GREEN: `npm test -- --run tests/spec_documentation.test.ts` → 13 Tests bestanden.
- Full Gates: `npm test -- --run` → 51 Testfiles / 316 Tests bestanden; `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
