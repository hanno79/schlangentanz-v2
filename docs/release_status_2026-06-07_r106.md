# Release-Status R106 — Schlangenhäutung-Dreiergruppen-Regression

Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R106 — Engine-Regressionstest für die Zählung neuer Dreiergruppen bei Schlangenhäutung.

# ÄNDERUNG 07.06.2026: R106 dokumentiert einen kleinen Test-only-Regelsicherungs-Slice für Schlangentanz.

## Ziel

R106 sichert die Regel `Schlangentanz` gezielt gegen eine Zählregression ab:

- Eine bereits bestehende Dreiergruppe darf nach Schlangenhäutung nicht erneut zählen, nur weil sie an eine andere Position verschoben wurde.
- Eine gleichzeitig wirklich neu gebildete Dreiergruppe muss weiterhin zählen.
- Eine einzige neu gebildete Dreiergruppe reicht nicht aus, um `Schlangentanz` zu erfüllen.

Regelquelle geprüft: [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules)

Verbindliche Aufgabenbedingung:

> Bilde durch Schlangenhäutung 2 neue Dreiergruppen.

## Umgesetzt

- Neuer Regressionstest in `turn_state_r98_schlangenhaeutung.test.ts`:
  - Vorher: Rot-Dreiergruppe existiert bereits an Positionen 2–4.
  - Vorher: Grün-Karten sind getrennt und bilden noch keine Dreiergruppe.
  - Nachher: Rot-Dreiergruppe ist nur an Positionen 0–2 verschoben.
  - Nachher: Grün-Karten bilden erstmals eine Dreiergruppe an Positionen 3–5.
  - Erwartung: `schlangenhaeutungDreiergruppen` steigt genau auf `1`.
  - Aufgabenprüfung erfüllt `Schlangentanz` dabei nicht, weil die Aufgabe zwei neue Dreiergruppen verlangt.

## Relevante Dateien

- `src/engine/__tests__/turn_state_r98_schlangenhaeutung.test.ts`

## Tests und Gates

Ausgeführt vor Release:

```bash
npm test -- --run src/engine/__tests__/turn_state_r98_schlangenhaeutung.test.ts
npm test -- --run
npm run typecheck
npm run lint
npm run check:test-lines
npm run build
git diff --check
```

Ergebnis:

- Focused Engine-Test grün: 1 Testdatei, 7 Tests.
- Full Tests grün: 115 Testdateien, 589 Tests.
- Typecheck grün.
- Lint grün.
- Test-Dateilängencheck grün; Datei bleibt bei 293 Zeilen.
- Build grün.
- `git diff --check` grün.

## Review

- Claude Code GREEN-Pass mit Modell `opusplan`: Test-only Slice, kein Produktionscode geändert.
- Claude Code `/simplify`: Test-ID-Namen an bestehende Dateikonvention angepasst.
- Codex Review nach `/simplify`:
  - BLOCKERS: none
  - NON-BLOCKER umgesetzt: zusätzlich dokumentieren, dass eine neue Dreiergruppe `Schlangentanz` nicht erfüllt.
- Codex Re-Review nach Härtung:
  - BLOCKERS: none
  - Bestätigt: Fixture enthält genau eine verschobene Bestandsgruppe und genau eine neu gebildete Dreiergruppe.
  - Bestätigt: Aufgabenprüfung-Assertion dokumentiert korrekt, dass `1` neue Dreiergruppe für `Schlangentanz` nicht reicht.

## Bewusst nicht im Scope

- Keine Produktionscode-Änderung.
- Keine UI-Änderung.
- Keine neue Schlangenhäutung-Aktion.
- Keine freie Sortierung oder Drag&Drop-Mechanik.
- Keine Änderung an `zaehleNeueDreiergruppen`, weil bestehende Implementierung korrekt nach Kartenidentität zählt.

## Release-Status

Lokal releasebereit am 07.06.2026. Commit, Push, Production-Deploy und Smoke folgen in diesem R106-Slice.
