---
id: TF-KI-034
titel: Der Stärkenachweis K5 wird rot, wenn die gemessene KI schwächer ist, die Schwelle gesenkt wird, Instanzen ein Modul teilen oder „erste erlaubte Aktion“ eine andere Aktion wählt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
aenderung: task/K5-staerkenachweis (PR #122)
grenzfall_von: TF-KI-032
---

## Worum es geht

Ein grüner Stärkenachweis sagt nur etwas, wenn er bei einem Fehler rot wird. Vier Gegenproben ändern je eine Stelle und erwarten einen roten Test. Danach wird die Änderung zurückgenommen.

## Bestanden, wenn

Alle vier Gegenproben werden rot. „Erste erlaubte Aktion“ nimmt die letzte statt der ersten Aktion: Der Test meldet `spielerId: 'c'` statt `'a'`. Bei 98 % statt 99 % meldet der Schwellentest `[490, 490, 294, 490, 490, 286]` statt `[495, 495, 297, 495, 495, 289]`. Spielt die Zufalls-KI statt der soliden, holt sie zu viert nur 74 von 300 Siegen statt mindestens 297. Ohne `vi.resetModules()` bricht der Messlauf ab, weil zwei Fabriken aus demselben Modul kommen.

## Fehlgeschlagen, wenn

Eine der vier Änderungen lässt den zugehörigen Test grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand, `git status` ohne Änderungen |

## Testdaten

Saaten des Laufs „zu viert ohne Erweiterung“ aus `tests/staerke_k5.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `src/ki/strategien/ersteAktionKi.ts` | `aktionen[0]` durch `aktionen[aktionen.length - 1]` ersetzen, Test ausführen | `npx vitest run src/ki/strategien/ersteAktionKi.test.ts` | 1 rot, 3 grün |
| 2 | `tests/staerke_k5.ts`, Funktion `mindestSiege` | `* 99` durch `* 98` ersetzen, Test ausführen | `npx vitest run tests/staerke_k5_schwellen.test.ts` | 3 rot, 5 grün |
| 3 | `tests/staerke_k5.ts`, Funktion `messe` | `frischerTeilnehmer('solideKi', …)` durch `'zufallsKi'` ersetzen, Lauf zu viert ausführen | `npx vitest run --mode staerke tests/staerke_k5_vier.staerke.test.ts` | rot mit 74 Siegen, mindestens 297 verlangt |
| 4 | `tests/registry_laden.ts` | Zeile `vi.resetModules()` auskommentieren, Lauf zu viert ausführen | wie Schritt 3 | rot mit „kam zweimal aus demselben Modul“ |
| 5 | Konsole | nach jedem Schritt die Datei zurücksetzen | `git checkout -- <datei>` | `git status` ohne Änderungen |
