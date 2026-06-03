# Release Status 2026-06-03 R83 — Schlangenbeschwörer-Aufgabenprüfung

Author: rahn
Datum: 03.06.2026
Version: 1.0
Beschreibung: Release-Status für den R83-Slice zur engine-seitigen Aufgabenprüfung für Schlangenbeschwörer.

## Scope

- Engine-seitige Aufgabenprüfung für die offene Aufgabe `Schlangenbeschwörer` ergänzt.
- Regel: Der aktive Spieler erfüllt `Schlangenbeschwörer`, wenn er insgesamt mindestens 4 Sonderkarten in eigenen Schlangen besitzt.
- Gegnerische Sonderkarten zählen nicht.
- Sonderkarten dürfen über mehrere eigene Schlangen verteilt sein.
- Aufgabenprüfung erfüllt mehrere gleichzeitig erfüllte offene Aufgaben in derselben Prüfung und zieht entsprechend viele Ersatzaufgaben nach.

## Geänderte Dateien

- `src/engine/turnState.ts`
- `src/engine/__tests__/turn_state_r82_aufgaben.test.ts`

## TDD-/Review-Evidence

- RED: Neuer Mehrfachaufgaben-Test schlug erwartungsgemäß fehl, weil `beendeAufgabenpruefung` vor dem Fix nach der ersten erfüllten Aufgabe zurückkehrte.
- GREEN: `Schlangenbeschwörer` wird über eine Aufgabenprüfungs-Map geprüft; `beendeAufgabenpruefung` sammelt alle erfüllten offenen Aufgaben und erfüllt sie gemeinsam.
- Simplify: Claude `/simplify` wurde nach dem Codex-Blocker-Fix ausgeführt; gezielte Tests blieben grün.
- Codex Review: Finaler Re-Review meldete `BLOCKERS: keine` und `NON-BLOCKERS: keine`.

## Verifikation

- Targeted: `npm test -- --run src/engine/__tests__/turn_state_r82_aufgaben.test.ts` → 1 Testfile / 14 Tests bestanden.
- Targeted mit angrenzenden Tests: `npm test -- --run src/engine/__tests__/turn_state_r82_aufgaben.test.ts src/engine/__tests__/farbenfusion.test.ts src/engine/__tests__/serialization_r19.test.ts` → 3 Testfiles / 41 Tests bestanden.
- Full Tests: `npm test -- --run` → 57 Testfiles / 407 Tests bestanden.
- Typecheck: `npm run typecheck` → grün.
- Lint: `npm run lint` → grün.
- Build: `npm run build` → grün.
- Whitespace: `git diff --check` → grün.

## Release

- Code-Commit/Push: `44b39eb — R83: Schlangenbeschwörer-Aufgabenprüfung umsetzen` auf `origin/main`.
- Deploy: `vercel deploy --prod --yes --token=…` auf `https://schlangentanz-v2.vercel.app` bereitgestellt.
- Smoke: Production-Alias liefert HTTP 200; Playwright lädt Heading, Engine-/Karten-Copy und meldet keine Console-/Page-/Request-Errors.
