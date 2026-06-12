/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R181 — Schlangenfrass kann nach Sonderkarten-Auswahl board-nah auf eigene Zielkarten gespielt werden.
# ÄNDERUNG 12.06.2026: R181 dokumentiert TDD, Claude-Fallback, Codex-Review, Gates, Deploy und Production-Smoke.
*/

# Release-Status R181 — Schlangenfrass boardnah spielbar

Zeitpunkt: 2026-06-12 21:33:13 UTC
Baseline: `1003b02`
Feature-HEAD: `3aa62e59f620129d58630f11430a6b0eb01526d9`
Production-Alias: `https://schlangentanz-v2.vercel.app`

## Ziel

R181 schließt die nächste konkrete Playability-Lücke nach R180: `SchlangenfrassSpielen` war bereits als konkrete Aktion benannt, musste aber weiterhin aus der Aktionsliste gelesen werden. Spieler können jetzt die Schlangenfrass-Handkarte auswählen und eine eigene Zielkarte direkt im Schlangenbereich sehen und ausführen.

## Scope

- Nur die sichere, bereits enumerierte 1-Ziel-Variante auf eigenen Schlangen wird board-nah angeboten.
- Die spätere Zwei-Gegner-Zielauswahl bleibt bewusst außerhalb dieses Slices, weil sie eine eigene Mehrfachziel-Interaktion braucht.
- Engine-Regeln, Aktionsvalidierung, Drag-and-drop und bestehende Farbenfusion-Interaktion bleiben unverändert.

## Änderung

- `src/App.tsx` filtert `SchlangenfrassSpielen` aus `legaleAktionen` und reicht die Aktionen an `Schlangenbereich` weiter.
- `src/components/Schlangenbereich.tsx` matcht ausgewählte Handkarte + eigene Zielschlange + Zielkarte exakt gegen die vorhandene Engine-Aktion und rendert `Schlangenfrass hier spielen` direkt auf der Zielkarte.
- `src/App.css` nutzt eine gemeinsame Sonderaktions-Zielklasse und eine Frass-spezifische Button-Farbe im Stitch-Stil.
- `src/App.r181_schlangenfrass_boardziel.test.tsx` sichert den positiven eigenen Zielkartenpfad und den negativen Zwei-Gegner-Pfad ab.

## TDD-Nachweis

RED beobachtet:

```bash
npm test -- --run src/App.r181_schlangenfrass_boardziel.test.tsx
```

Ergebnis vor Implementierung: Test fehlgeschlagen, weil nach Auswahl der Schlangenfrass-Handkarte keine `schlangekarte__karte--schlangenfrass-ziel`-Markierung und kein board-lokaler Schlangenfrass-Button vorhanden waren.

GREEN:

```bash
npm test -- --run src/App.r181_schlangenfrass_boardziel.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx src/App.r178_board_zielmarkierungen.test.tsx src/App.r111_schlangenbereich_label_idrefs.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx
```

Ergebnis: 6 Testdateien, 27 Tests bestanden.

## Gates

```bash
npm test -- --run
npm run check:test-lines
npm run typecheck
npm run lint
npm run build
git diff --check
```

Ergebnis: Full Suite grün mit 187 Testdateien / 678 Tests; Test-Line-Check, Typecheck, Lint, Build und Diff-Hygiene bestanden. Build erzeugte `dist/assets/index-C4mnPjBV.js` und `dist/assets/index-C2E1cJyf.css`.

## Review

Claude Code und `/simplify` wurden versucht, waren aber wegen bestehendem Auth-Blocker nicht verfügbar:

```text
Failed to authenticate. API Error: 401 Invalid authentication credentials
```

Codex Review auf uncommitted Worktree inkl. untracked R181-Test:

```text
BLOCKERS: none
NON-BLOCKERS: Targeted re-check passed. No two-target opponent board flow exposed, no R180 regression found, and targeted R181/R180 tests passed: 2 files, 3 tests.
```

## Zeilenbudget

- `src/App.tsx`: 470 Zeilen
- `src/components/Schlangenbereich.tsx`: 456 Zeilen
- `src/App.r181_schlangenfrass_boardziel.test.tsx`: 81 Zeilen

## Release

Feature-Commit:

```text
3aa62e5 R181: Schlangenfrass boardnah spielbar machen
```

Push:

```text
1003b02..3aa62e5  main -> main
```

Production-Deploy:

```text
Alias: https://schlangentanz-v2.vercel.app
✓ Ready in 18s
```

Production-Smoke:

```json
{
  "rootStatus": 200,
  "gameStatus": 200,
  "alias": "https://schlangentanz-v2.vercel.app",
  "proof": "Math.random=0.1, eigene Schlange mit rot-15 gestartet, schlangenfrass-04 ausgewählt, board-lokaler Zielbutton mit schlangekarte__karte--schlangenfrass-ziel sichtbar, Klick entfernt rot-15.",
  "consoleErrors": [],
  "pageErrors": []
}
```

## Nächste Spielwert-Lücke

Nächster sinnvoller mittlerer Vertical Slice: board-nahe Mehrfachziel-Auswahl für `SchlangenfrassSpielen` gegen zwei gegnerische Karten oder alternativ `FarbendiebSpielen`, damit weitere bereits enumerierte Sonderkarten nicht mehr über lange Aktionslisten gesucht werden müssen.
