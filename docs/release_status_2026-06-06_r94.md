# Release-Status 2026-06-06 — R94 Schlangenrepertoire

Author: rahn  
Datum: 06.06.2026  
Version: 1.0  
Beschreibung: Release-Nachweis für R94 — Aufgabenprüfung `Schlangenrepertoire` / `aufgabe-09`.

## Änderung

- `aufgabe-09` / `Schlangenrepertoire` in der Engine-Aufgabenprüfung registriert.
- Regel umgesetzt: Der aktive Spieler erfüllt die Aufgabe, wenn mindestens fünf verschiedene Sonderkartenarten in seiner ausgespielten Sonderkartenhistorie stehen.
- Neue Spieler-Historie `ausgespielteSonderkartenNamen` eingeführt.
- Historie wird bei normalen Sonderkarten-Spielaktionen gepflegt.
- `Farbenschutz` als Reaktions-/Abwehrkarte zählt ebenfalls für den reaktionsspielenden Spieler.
- Alte Spielstände ohne Historie werden beim Deserialisieren auf ein leeres Array migriert.
- Historie wird beim Deserialisieren als Array nicht-leerer Textwerte validiert.
- Keine UI-Änderung.

## Geänderte Dateien

- `src/engine/types.ts`
- `src/engine/state.ts`
- `src/engine/serialization.ts`
- `src/engine/turnState.ts`
- `src/engine/aufgabenPruefung.ts`
- `src/engine/__tests__/testHelpers.ts`
- `src/engine/__tests__/turn_state_r94_schlangenrepertoire.test.ts`
- `docs/release_status_2026-06-06_r94.md`

## TDD-Nachweis

### RED

Gezielter Testlauf vor Implementierung:

```text
npm test -- src/engine/__tests__/turn_state_r94_schlangenrepertoire.test.ts

Test Files  1 failed (1)
Tests  6 failed
```

Erwarteter RED-Befund:

- Positive `Schlangenrepertoire`-Fälle schlugen fehl, weil `aufgabe-09` noch nicht registriert war.
- Historien-/Serialisierungsfälle schlugen fehl, weil das neue Spielerfeld noch fehlte.

### Review-RED

Codex fand nach dem ersten GREEN echte Blocker bei `Farbenschutz`-Reaktionen. Daraufhin wurden zusätzliche RED-Fälle ergänzt:

```text
npm test -- src/engine/__tests__/turn_state_r94_schlangenrepertoire.test.ts

Test Files  1 failed (1)
Tests  3 failed | 8 passed (11)
```

Erwarteter RED-Befund:

- `SchlangengrubeAbwehr` / Standard-Farbenschutz-Reaktion schrieb keine Historie.
- `SchlangenfrassAbwehr` schrieb keine Historie.
- `VerdopplerAbwehr` schrieb keine Historie.

### GREEN

Gezielter Testlauf nach Implementierung und Review-Fix:

```text
npm test -- src/engine/__tests__/turn_state_r94_schlangenrepertoire.test.ts

Test Files  1 passed (1)
Tests  11 passed (11)
```

## Review-Nachweis

### Claude `/simplify`

- Claude `/simplify` wurde auf den R94-Diff angesetzt.
- Wegen Dateirechten konnte Claude als `claudeuser` nicht direkt schreiben, lieferte aber zwei konkrete Simplify-Edits.
- Übernommen wurden:
  - History-Ergänzung in `inkrementiereSpieleKarten` über den vorhandenen `aktualisiereAktivenSpieler`-Helper.
  - Serialisierungsvalidierung über den vorhandenen `erwarteArray`-Helper.
- Targeted Tests, Test-Zeilenlimit, Typecheck und Lint danach grün.

### Codex-Review 1

Codex-Review der uncommitted Änderungen inklusive untracked Testdatei:

```text
BLOCKERS:
- Farbenschutz als Standard-Reaktion wurde nicht als ausgespielte Sonderkarte gezählt.
- SchlangenfrassAbwehr wurde nicht als ausgespielter Farbenschutz gezählt.
- VerdopplerAbwehr wurde nicht als ausgespielter Farbenschutz gezählt.
```

Alle Blocker wurden mit RED-Tests reproduziert und anschließend behoben.

### Codex-Review 2

Codex-Review nach Blocker-Fix:

```text
BLOCKERS:
- Keine

NON-BLOCKERS:
- Historienvalidierung erlaubt aktuell beliebige nicht-leere Strings; optional später auf bekannte Sonderkartennamen härten.
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
Tests  558 passed (558)
Build erfolgreich.
```

## Commit

```text
R94 Schlangenrepertoire-Aufgabe pruefen
```

## Deployment

```text
bash -ic 'vercel deploy --prod --yes --token="$VERCEL_TOKEN"'

Production  https://schlangentanz-v2-j5d0mirio-alfreds-projects-7e9df1b4.vercel.app
Aliased     https://schlangentanz-v2.vercel.app
Ready in 15s
```

## Live-Smoke

```text
HTTP 200 https://schlangentanz-v2.vercel.app/game
```

Playwright-Smoke gegen `/game`:

```json
{
  "status": 200,
  "title": "schlangentanz-v2",
  "hasGameHeading": true,
  "hasActionsRegion": true,
  "actionButtonsBefore": 10,
  "firstActionClicked": true,
  "textChangedAfterFirstAction": true,
  "consoleErrors": [],
  "pageErrors": []
}
```

## Release-Gate-Status

- Code/Test: erledigt
- Full Gates lokal: grün
- Dokumentation: erledigt
- Deployment/Live-Smoke: grün
