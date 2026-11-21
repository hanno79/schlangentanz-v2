---
id: TF-PRUEF-037
titel: Die Gegenproben des Isolationstests werden rot, wenn sein zweiter Lauf die Instanzen nicht mehr aus getrennten Modulen lädt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.3d-ki-grenze (PR #55)
grenzfall_von: TF-PRUEF-033
---

## Worum es geht

Der Isolationstest hängt an einer Stelle: `vi.resetModules()` vor jedem Laden, damit der zweite Lauf jede Instanz aus einem frischen Modul bekommt. Fällt das weg, etwa bei einer Änderung am Test oder an vitest, laufen beide Durchgänge mit demselben Modul. Die drei Gegenproben unter `tests/isolation/` sollen das bemerken.

## Bestanden, wenn

Mit auskommentiertem `vi.resetModules()` in `tests/strategie_isolation.test.ts` endet `npx vitest run tests/strategie_isolation.test.ts` mit Exit 1, und mindestens eine Gegenprobe „… verhält sich mit geteiltem Modul anders“ ist rot.

## Fehlgeschlagen, wenn

Der Test endet trotz auskommentiertem `vi.resetModules()` mit Exit 0 und „5 passed“.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Zeile `  vi.resetModules()` in `ladeFabriken` (`tests/strategie_isolation.test.ts`). Zur Einordnung die Angriffsdatei `zz_p_r01_ruecksetzer.ts` aus dem Prüfprotokoll P0.3d, Schlussprüfung: Ihre Fabrik leert die geteilte Ablage bei jeder neuen Instanz, sodass Lauf (a) nichts für Lauf (b) hinterlässt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `tests/strategie_isolation.test.ts` | Zeile `vi.resetModules()` auskommentieren | `// vi.resetModules()` | `git diff --stat` zeigt eine geänderte Zeile |
| 2 | Konsole im Repo | Isolationstest laufen lassen | `npx vitest run tests/strategie_isolation.test.ts` | Exit 1 und rote Gegenprobe erwartet |
| 3 | Konsole im Repo | `zz_p_r01_ruecksetzer.ts` nach `src/ki/strategien/` kopieren und Schritt 2 wiederholen | | Wird die Datei rot? |
| 4 | Konsole im Repo | Datei löschen, Zeile zurücksetzen | `git checkout -- tests/strategie_isolation.test.ts` | `git status` leer |
| 5 | Konsole im Repo | Mit `vi.resetModules()` noch einmal mit `zz_p_r01_ruecksetzer.ts` | | Exit 1, die Datei ist rot |
