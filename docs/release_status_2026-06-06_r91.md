# Release-Status 2026-06-06 — R91 Farbenpracht

Author: rahn  
Datum: 06.06.2026  
Version: 1.0  
Beschreibung: Release-Nachweis für R91 — Aufgabenprüfung `Farbenpracht` / `aufgabe-01`.

## Änderung

- `aufgabe-01` / `Farbenpracht` in der Engine-Aufgabenprüfung registriert.
- Regel umgesetzt: Der aktive Spieler erfüllt die Aufgabe, wenn in seinen eigenen Schlangen jede Farbe mindestens zweimal als Farbkarte vorhanden ist:
  - Rot
  - Blau
  - Gelb
  - Grün
  - Violett
  - Braun
- Karten dürfen über zwei eigene Schlangen verteilt oder in einer eigenen Schlange liegen.
- Sonderkarten/Regenbogenschlangen zählen nicht als Farbe.
- Gegnerische Schlangen zählen nicht.
- Keine UI-Änderung, keine State-Shape-Änderung.

## Geänderte Dateien

- `src/engine/aufgabenPruefung.ts`
- `src/engine/__tests__/turn_state_r91_farbenpracht.test.ts`

## TDD-Nachweis

### RED

Gezielter Testlauf vor Implementierung:

```text
npm test -- src/engine/__tests__/turn_state_r91_farbenpracht.test.ts

Test Files  1 failed (1)
Tests  3 failed | 3 passed (6)
```

Erwarteter RED-Befund:

- Positive Fälle für gültige `Farbenpracht`-Zustände schlugen fehl.
- Negative Grenzfälle blieben grün.

### GREEN

Gezielter Testlauf nach Implementierung:

```text
npm test -- src/engine/__tests__/turn_state_r91_farbenpracht.test.ts

Test Files  1 passed (1)
Tests  6 passed (6)
```

## Review-Nachweis

### Claude `/simplify`

- `ALLE_FARBEN` aus `pruefeFarbenpracht` und `pruefeFarbharmonie` in eine Modul-Konstante extrahiert.
- Keine Verhaltensänderung.
- Targeted Tests und Test-Zeilenlimit danach grün.

### Codex-Review

Codex-Review der uncommitted Änderungen inklusive untracked Testdatei:

```text
BLOCKERS:
- keine

NON-BLOCKERS:
- keine
```

## Full Gates

Ausgeführt vor Commit:

```text
npm run check:test-lines
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Ergebnis:

```text
Alle Testdateien bleiben unter 500 Zeilen.
Lint erfolgreich.
Typecheck erfolgreich.
Test Files  103 passed (103)
Tests  529 passed (529)
Build erfolgreich.
```

## Commit

```text
5666dce R91 Farbenpracht-Aufgabe pruefen
```

## Release-Gate-Status

- Code/Test: erledigt
- Full Gates lokal: grün
- Dokumentation: dieser Nachweis
- Deployment/Live-Smoke: nachfolgender Schritt
