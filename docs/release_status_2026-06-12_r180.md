/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R180 — Farbenfusion-Zielpaare werden nach Sonderkarten-Auswahl board-nah sichtbar und ausführbar.
# ÄNDERUNG 12.06.2026: R180 dokumentiert TDD, Review-Fix, Gates, Deploy und Production-Smoke.
*/

# Release-Status R180 — Farbenfusion boardnah spielbar

Zeitpunkt: 2026-06-12 21:13:42 UTC
Baseline: `306785f`
Feature-HEAD: `9a7f46ef9c8fb22a8fd5755a89d42681cea03abf`

## Ziel

R180 schließt eine Playability-Lücke direkt am Spieltisch: Nach R179 waren `FarbenfusionSpielen`-Aktionen zwar im Aktionenbereich konkret benannt, das eigentliche Zielpaar musste aber weiterhin aus einer langen Aktionsliste gelesen werden. Spieler können jetzt eine Farbenfusion-Handkarte auswählen und das passende Kartenpaar direkt im Schlangenbereich sehen und ausführen.

## Normquelle / Scope

- Lokale Spezifikation geprüft: `docs/GAME_SPEC.md` R7.1 beschreibt Farbenfusion als Auswahl zweier nebeneinanderliegender Karten gleicher Farbe in einer eigenen Schlange.
- Externe Normquelle `https://schlangentanz.ch/rules` war in dieser Cron-Session per Shell-Fetch wegen HTTP 403 nicht abrufbar; es wurde keine neue Regel geraten.
- Engine-Regel und Enumeration bestanden bereits; R180 fügt nur die board-nahe UI-Affordance für die vorhandene `FarbenfusionSpielen`-Aktion hinzu.

## Änderung

- `src/App.tsx` filtert `FarbenfusionSpielen` aus den vorhandenen `legaleAktionen` und reicht sie an den Schlangenbereich weiter.
- `src/components/Schlangenbereich.tsx` markiert nur dann ein eigenes Schlangenkarten-Ziel, wenn die ausgewählte Handkarte exakt zur enumerierten Farbenfusion-Aktion passt.
- Auf der Zielkarte erscheint ein board-lokaler Button `Farbenfusion hier spielen`, der über den normalen `onAktion`/`anwendeAktion`-Pfad ausführt.
- Keyboard-Regression aus dem Codex-Review behoben: verschachtelte Buttons in der fokussierbaren Schlangenkarte werden bei Enter/Space nicht mehr durch den Eltern-Handler `preventDefault()` blockiert.
- `src/App.css` ergänzt eine sichtbare Zielklasse und Button-Optik.

## TDD-Nachweis

RED beobachtet:

```bash
npm test -- --run src/App.r180_farbenfusion_boardziel.test.tsx
```

Ergebnis vor Implementierung: Test fehlgeschlagen, weil nach Auswahl der Farbenfusion-Handkarte keine `schlangekarte__karte--farbenfusion-ziel`-Markierung und kein board-lokaler Farbenfusion-Button vorhanden waren.

Review-RED beobachtet:

```bash
npm test -- --run src/App.r180_farbenfusion_boardziel.test.tsx
```

Ergebnis vor Fix: `fireEvent.keyDown(boardAktion, { key: 'Enter' })` gab `false` zurück, weil der Eltern-`li role="button"` die native Button-Aktivierung per `preventDefault()` blockierte.

GREEN nach Implementierung und Review-Fix:

```bash
npm test -- --run src/App.r180_farbenfusion_boardziel.test.tsx src/App.r178_board_zielmarkierungen.test.tsx src/App.r179_sonderkarten_aktionslabels.test.tsx src/App.r111_schlangenbereich_label_idrefs.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx
```

Ergebnis: 6 Testdateien, 26 Tests bestanden.

## Gates

```bash
npm test -- --run
```

Ergebnis: 186 Testdateien, 676 Tests bestanden.

```bash
npm run check:test-lines
npm run typecheck
npm run lint
npm run build
git diff --check
```

Ergebnis: alle bestanden. Build erzeugte `dist/assets/index-wsaFC8O5.js` und `dist/assets/index-B8c_SbFe.css`.

## Review

Claude Code und `/simplify` wurden versucht, waren aber wegen bestehendem Auth-Blocker nicht verfügbar:

```text
Failed to authenticate. API Error: 401 Invalid authentication credentials
```

Codex Review auf uncommitted Worktree inkl. untracked R180-Test fand zunächst einen Keyboard-Blocker. Der Blocker wurde test-first reproduziert und behoben. Re-Review:

```text
BLOCKERS: None.
NON-BLOCKERS: Prior blocker appears fixed: handleSchlangeKeyDown now returns early for keydown events originating inside a nested button. Focused test passed.
```

## Zeilenbudget

- `src/App.tsx`: 463 Zeilen
- `src/components/Schlangenbereich.tsx`: 429 Zeilen
- `src/App.r180_farbenfusion_boardziel.test.tsx`: 68 Zeilen

## Release

Feature-Commit:

```text
9a7f46e R180: Farbenfusion boardnah spielbar machen
```

Push:

```text
306785f..9a7f46e  main -> main
```

Production-Deploy:

```text
Inspect: https://vercel.com/alfreds-projects-7e9df1b4/schlangentanz-v2/14ksuoidRvaspiq2Dx9D55QM7YRg
Production: https://schlangentanz-v2-plq66xc6i-alfreds-projects-7e9df1b4.vercel.app
Alias: https://schlangentanz-v2.vercel.app
✓ Ready in 16s
```

Production-Smoke:

```json
{
  "rootStatus": 200,
  "gameStatus": 200,
  "alias": "https://schlangentanz-v2.vercel.app",
  "proof": "Farbenfusion-Handkarte ausgewählt, board-lokaler Zielbutton mit Zielklasse sichtbar, Klick ersetzt Zielpaar durch farbenfusion-02.",
  "consoleErrors": [],
  "pageErrors": []
}
```

Der Smoke patcht im Browser vor App-Initialisierung deterministisch `Math.random = () => 0.029`, spielt eine reale mehrzügige UI-Sequenz über `/game`, baut eine eigene blaue Schlange, wählt `farbenfusion-02`, prüft den board-lokalen Zielbutton samt Klasse `schlangekarte__karte--farbenfusion-ziel` und führt die Farbenfusion in Produktion aus.

## Nächste Spielwert-Lücke

Nächster sinnvoller kleiner Slice: board-nahe Sonderkarten-Zielauswahl für `SchlangenfrassSpielen` oder `FarbendiebSpielen`, damit bereits enumerierte Sonderkarten nicht nur über die Aktionenliste, sondern direkt an den betroffenen Karten/Schlangen verständlich spielbar werden.
