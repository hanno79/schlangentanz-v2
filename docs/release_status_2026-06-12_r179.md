/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R179 — enumerierte Sonderkarten-Aktionen Farbenfusion und Schlangenfrass zeigen konkrete Spielerlabels statt `Unbekannte Aktion`.
# ÄNDERUNG 12.06.2026: R179 dokumentiert TDD, Gates, Review, Deploy und Production-Smoke.
*/

# Release-Status R179 — Sonderkarten-Aktionslabels

Zeitpunkt: 2026-06-12 20:52:02 UTC
Baseline: `e4b7779`

## Ziel

R179 schließt eine echte Playability-Lücke im Aktionenbereich: Bereits von der Engine enumerierte Sonderkarten-Aktionen `FarbenfusionSpielen` und `SchlangenfrassSpielen` wurden in der UI nur als `Unbekannte Aktion` beschriftet. Dadurch waren legale Aktionen zwar technisch klickbar, aber für Spieler nicht verständlich.

## Änderung

- `src/aktionsLabel.ts` neu erstellt und die Aktionsbeschriftung aus `src/App.tsx` ausgelagert.
- `FarbenfusionSpielen` erhält ein konkretes Label mit Handkarte, Zielschlange und Zielkarte.
- `SchlangenfrassSpielen` erhält ein konkretes Label mit Handkarte und allen Zielkarten/Zielschlangen.
- Die bisher vorhandenen Labels für andere Aktionen bleiben erhalten.
- `src/App.tsx` liegt nach der Extraktion wieder deutlich unter dem 500-Zeilen-Limit.

## TDD-Nachweis

RED beobachtet:

```bash
npm test -- --run src/App.r179_sonderkarten_aktionslabels.test.tsx
```

Ergebnis vor Implementierung: Test fehlgeschlagen, weil die Buttons nur `Unbekannte Aktion` hießen.

GREEN nach Implementierung:

```bash
npm test -- --run src/App.r179_sonderkarten_aktionslabels.test.tsx
```

Ergebnis: 1 Test bestanden.

## Gates

```bash
npm test -- --run src/App.r179_sonderkarten_aktionslabels.test.tsx src/App.r141_aktionen_copy.test.tsx src/App.f12_spielbare_aktionen.test.tsx src/App.f6_aktionenbereich.test.tsx
```

Ergebnis: 4 Testdateien, 5 Tests bestanden.

```bash
npm test -- --run
```

Ergebnis: 185 Testdateien, 675 Tests bestanden.

```bash
npm run check:test-lines
```

Ergebnis: Alle Testdateien bleiben unter 500 Zeilen.

```bash
npm run typecheck
npm run lint
npm run build
git diff --check
```

Ergebnis: alle bestanden. Build erzeugte `dist/assets/index-BpEYArYi.js` und `dist/assets/index-BXDdNVQD.css`.

## Review

Claude `/simplify` wurde wie üblich versucht, war aber wegen bestehendem Auth-Blocker nicht verfügbar:

```text
Failed to authenticate. API Error: 401 Invalid authentication credentials
```

Codex Review auf uncommitted Worktree inkl. untracked Dateien:

```text
BLOCKERS: None.
NON-BLOCKERS: Targeted Vitest passed: `npm test -- --run src/App.r179_sonderkarten_aktionslabels.test.tsx`. Scoped files are under 500 lines. No missing `SpielAktion` cases, wrong `FarbenfusionSpielen`/`SchlangenfrassSpielen` fields, AktionenPanel accessible-name regression, test false positive, or scope creep found.
```

## Zeilenbudget

- `src/App.tsx`: 456 Zeilen
- `src/aktionsLabel.ts`: 67 Zeilen
- `src/App.r179_sonderkarten_aktionslabels.test.tsx`: 63 Zeilen

## Release

Feature-Commit:

```text
5fd91e6 R179 Sonderkarten-Aktionslabels
```

Push:

```text
e4b7779..5fd91e6  main -> main
```

Production-Deploy:

```text
Inspect: https://vercel.com/alfreds-projects-7e9df1b4/schlangentanz-v2/7xT2vFLEV9hEreDxtFpqE79bChHm
Production: https://schlangentanz-v2-ou7kcdq88-alfreds-projects-7e9df1b4.vercel.app
Alias: https://schlangentanz-v2.vercel.app
✓ Ready in 15s
```

Production-Smoke:

```text
HTTP 200  https://schlangentanz-v2.vercel.app/
HTTP 200  https://schlangentanz-v2.vercel.app/game
Sichtbar: "Spielstatus"
Sichtbar: "Aktiver Spieler"
Sichtbar: "Aktionen"
Sichtbar: "Schlangenbereich"
R107 Production-Smoke bestanden
```

Zusätzlicher R179-Bundle-/GUI-Smoke:

```text
Production R179 Bundle-Smoke bestanden: {"farbenfusionLabel":true,"schlangenfrassLabel":true,"engineFallbackError":true}
Production GUI: Spielstatus=true, Aktionen=true, Unbekannte-Aktion-Buttons=0, console/page errors=0
```

Hinweis: `engineFallbackError=true` bezieht sich auf den weiterhin korrekten Engine-Fehlerpfad `Unbekannte Aktion.` im Validator, nicht auf UI-Buttons. Die UI zeigte im Smoke keine `Unbekannte Aktion`-Buttons.
