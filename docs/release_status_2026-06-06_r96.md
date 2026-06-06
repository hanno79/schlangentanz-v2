# Release-Status 2026-06-06 — R96 Schlangenmeister-Aufgabenprüfung

Author: rahn  
Datum: 06.06.2026  
Version: R96  
Beschreibung: Release-Nachweis für den kleinen TDD-Slice `Schlangenmeister` (`aufgabe-08`).

## Umfang

R96 ergänzt die Aufgabenprüfung für `aufgabe-08` / **Schlangenmeister**.

Die Aufgabe wird erfüllt, wenn der aktive Spieler gleichzeitig:

1. mindestens zwei verschiedene konkrete Sonderkartennamen in den eigenen Schlangen liegen hat, und
2. mindestens vier Sonderkarten insgesamt in seiner eigenen `ausgespielteSonderkartenNamen`-Historie ausgespielt hat.

Duplikate zählen bei der History-Bedingung mit. Für die Schlangen-Bedingung zählen mehrere gleiche Sonderkartenarten nur als eine verschiedene Art.

## Geänderte Dateien

- `src/engine/aufgabenPruefung.ts`
  - `pruefeSchlangenmeister` ergänzt.
  - `aufgabe-08` in `aufgabePruefungen` registriert.
  - Header-Version auf `1.6` aktualisiert.
- `src/engine/__tests__/turn_state_r96_schlangenmeister.test.ts`
  - RED/GREEN-Regressionssuite für Erfolg, fehlende Vielfalt, zu kurze History, Gegnerabgrenzung und `aktiverSpielerIndex = 1`.

## TDD-Nachweis

RED wurde vor Implementierung validiert:

```text
src/engine/__tests__/turn_state_r96_schlangenmeister.test.ts
1 failed | 3 passed
Fehler: expected [] to deeply equal [ 'Schlangenmeister' ]
```

Nach GREEN und `/simplify`:

```text
src/engine/__tests__/turn_state_r96_schlangenmeister.test.ts
5 tests passed
```

## Review

Codex Review-only direkt im Worktree inklusive untracked Testdatei:

```text
BLOCKERS:
- Keine

NON-BLOCKERS:
- Header-Version inkonsistent.
- Zusätzlicher aktiver-Spieler-1-Fall empfohlen.
```

Beide Non-Blocker wurden umgesetzt. Codex Re-Review:

```text
BLOCKERS:
- Keine

NON-BLOCKERS:
- Keine
```

## Lokale Gates

Ausgeführt am 06.06.2026, 21:18 UTC:

```bash
npm run check:test-lines && npm run typecheck && npm run lint && npm test -- --run && npm run build
```

Ergebnis:

```text
check:test-lines: Alle Testdateien bleiben unter 500 Zeilen.
typecheck: erfolgreich
lint: erfolgreich
Test Files: 107 passed (107)
Tests: 565 passed (565)
build: erfolgreich
```

## Commit / Push / Deploy / Smoke

Commit erstellt:

```text
83b01a4 R96 Schlangenmeister-Aufgabe pruefen
```

Push, Production-Deploy und Smoke sind zum Zeitpunkt dieses Doku-Updates noch ausstehend und werden nach Abschluss ergänzt.
