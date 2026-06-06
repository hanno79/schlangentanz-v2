# Release-Status 2026-06-06 — R95 Sonderkartenhistorie validieren

Author: rahn  
Datum: 06.06.2026  
Version: 1.0  
Beschreibung: Release-Nachweis für R95 — Deserialisierung der ausgespielten Sonderkartenhistorie gegen bekannte Sonderkartennamen härten.

## Änderung

- `spieler[].ausgespielteSonderkartenNamen` wird beim Deserialisieren nicht mehr nur als Array nicht-leerer Texte validiert.
- Erlaubt sind jetzt ausschließlich bekannte Sonderkartennamen aus Basis- und Erweiterungs-Sonderkarten.
- Unbekannte Namen wie `Hausregelkarte` werden mit einem `Sonderkartenhistorie`-Fehler abgelehnt.
- Erweiterungs-Sonderkarten wie `Schlangenhäutung` bleiben explizit erlaubt.
- Keine UI-Änderung.

## Geänderte Dateien

- `src/engine/serialization.ts`
- `src/engine/__tests__/turn_state_r94_schlangenrepertoire.test.ts`
- `docs/release_status_2026-06-06_r95.md`

## TDD-Nachweis

### RED

Gezielter Testlauf nach neuem Negativtest für unbekannte Sonderkartennamen:

```text
npm test -- src/engine/__tests__/turn_state_r94_schlangenrepertoire.test.ts

Test Files  1 failed (1)
Tests  1 failed | 11 passed (12)
```

Erwarteter RED-Befund:

```text
AssertionError: expected [Function] to throw an error
```

Der alte Validator akzeptierte `['Verdoppler', 'Hausregelkarte']` fälschlich.

### GREEN

Gezielter Testlauf nach Implementierung:

```text
npm test -- src/engine/__tests__/turn_state_r94_schlangenrepertoire.test.ts

Test Files  1 passed (1)
Tests  12 passed (12)
```

### Review-Härtung

Codex meldete keinen Blocker, aber einen sinnvollen Non-Blocker: Erweiterungs-Sonderkarten sollten explizit positiv getestet werden. Ergänzt wurde:

```text
akzeptiert Erweiterungs-Sonderkartennamen in der ausgespielten Sonderkartenhistorie
```

Danach:

```text
npm test -- src/engine/__tests__/turn_state_r94_schlangenrepertoire.test.ts

Test Files  1 passed (1)
Tests  13 passed (13)
```

## Review-Nachweis

### Claude `/simplify`

- Claude `/simplify` wurde auf den R95-Diff angesetzt.
- Übernommen wurde nur eine Vereinfachung der Fehlermeldung: Template-Literal ohne Interpolation wurde zu einem normalen String.
- Verhalten unverändert.

### Codex-Review 1

```text
BLOCKERS:
- Keine

NON-BLOCKERS:
- Es fehlt ein expliziter Positivtest, dass ein Erweiterungs-Sonderkartenname wie `Schlangenhäutung` oder `Risiko-Belohnung` in `ausgespielteSonderkartenNamen` erfolgreich deserialisiert.
```

### Codex-Re-Review

Nach Ergänzung des Erweiterungs-Positivtests:

```text
BLOCKERS:
- Keine

NON-BLOCKERS:
- Keine
```

## Full Gates

Ausgeführt vor Commit:

```text
npm run check:test-lines
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Ergebnis:

```text
Alle Testdateien bleiben unter 500 Zeilen.
Typecheck erfolgreich.
Lint erfolgreich.
Test Files  106 passed (106)
Tests  560 passed (560)
Build erfolgreich.
```

## Commit

```text
R95 Sonderkartenhistorie validieren
```

## Deployment

```text
Vercel Production: https://schlangentanz-v2-mi98y27ku-alfreds-projects-7e9df1b4.vercel.app
Alias: https://schlangentanz-v2.vercel.app
Ready in 15s
```

## Live-Smoke

```text
HTTP_STATUS 200
{
  "status": 200,
  "title": "schlangentanz-v2",
  "hasGameHeading": true,
  "hasActionsRegion": true,
  "actionButtonsBefore": 14,
  "firstActionClicked": true,
  "textChangedAfterFirstAction": true,
  "consoleErrors": [],
  "pageErrors": []
}
```

Hinweis: Der erste Playwright-Aufruf aus `/tmp` scheiterte an Node-Modulauflösung (`ERR_MODULE_NOT_FOUND: playwright`). Der Smoke wurde anschließend erfolgreich aus dem Projektverzeichnis ausgeführt.

## Release-Gate-Status

- Code/Test: erledigt
- Full Gates lokal: grün
- Review: grün
- Dokumentation: aktualisiert
- Commit/Push: erledigt
- Deployment/Live-Smoke: grün
