---
id: TF-PRUEF-027
titel: Ein sichtbares Eingabefeld, dessen Label nur vorgelesen wird, messen die Wächter „ausserhalb des Bildes“ und „vollständig verdeckt“ weiter selbst.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/O2b-lobby-flach (PR #35)
grenzfall_von: TF-PRUEF-025
---

## Worum es geht

Seit O2b Iteration 2 misst `messeErreichbarkeit` ein `input` mit Label an seinem grössten Label statt am Feld selbst. Das ist richtig, solange das Feld unsichtbar ist und das Label getippt wird. Umgekehrt gibt es auch sichtbare Felder mit einem Label, das nur vorgelesen wird (`.nur-vorlesen`, 1 × 1 px), etwa ein Suchfeld. Dann darf der Wächter das Feld nicht übergehen.

## Bestanden, wenn

Ein sichtbares Textfeld (240 × 48 px) mit einem 1 × 1 px grossen Label meldet `findeAusserhalbDesBildes`, wenn es 100 px unter dem Bildrand liegt, und `findeVerdeckteBedienelemente`, wenn eine Fläche es ganz zudeckt.

## Fehlgeschlagen, wenn

Beide Wächter liefern in diesen Fällen eine leere Liste.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab O2b Iteration 2, Ports 4173 und 4174 frei |
| Ausgangslage | `git status` leer |

## Testdaten

Eine eigene Seite über `page.setContent`: `<label for="f">` mit den Stilen von `.nur-vorlesen`, dazu `<input id="f" type="text">` mit 240 × 48 px, einmal bei `top: calc(100vh + 100px)`, einmal bei `top: 16px` unter einer `position: fixed`-Fläche über das ganze Fenster.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole | vorübergehende Spec-Datei unter `tests/layout/` mit beiden Seiten anlegen, die `findeAusserhalbDesBildes` und `findeVerdeckteBedienelemente` aus `./messung` aufruft | | |
| 2 | Konsole | Datei in einer Klasse laufen lassen | `npx playwright test tests/layout/<datei> --project=desktop` | je ein Befund erwartet |
| 3 | Konsole | zum Vergleich `tests/layout/messung.ts` von `origin/neuaufbau` einsetzen und wiederholen | `git show origin/neuaufbau:tests/layout/messung.ts > tests/layout/messung.ts` | dort meldet der Wächter beide Fälle |

## Zurücksetzen

Spec-Datei löschen, `git checkout -- tests/layout/messung.ts`, danach `git status` leer.
