---
id: TF-ENGINE-021
titel: In 300 Zufallspartien mit eigenen Saaten enden alle Partien, und jeder zweite Zug folgt direkt auf einen ersten Zug mit Verdoppler desselben Spielers.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/E3-verdoppler (PR #51)
grenzfall_von: TF-ENGINE-020
---

## Worum es geht

Der Dauerlauf des Umsetzers zählt zweite Züge mit seinem eigenen Prüfer und seinen eigenen Saaten. Hier läuft ein unabhängiger Prüfer über andere Saaten und zählt mit, wie oft der Verdoppler wirklich vorkommt, auch in der Schlussrunde und mit leerem Stapel zwischen den Zügen.

## Bestanden, wenn

Alle 300 Partien (150 ohne Erweiterung ab Saat 1001, 150 mit Erweiterung ab Saat 5001, je 2, 3 und 4 Spieler) enden mit „beendet“. Der eigene Prüfer meldet keinen Verstoss: kein Verdoppler mit Wirkung im Teilzug 2, kein dritter Zug, kein zweiter Zug ohne Verdoppler davor oder für einen anderen Spieler, nach einem Verdoppler im ersten Zug immer ein zweiter Zug, beim Auffüllen zwischen den Zügen 5 Karten, solange der Stapel reicht, und in der Schlussrunde kein Nachziehen. Gezählt werden mehr als 100 zweite Züge, mindestens einer in der Schlussrunde und mindestens einer, bei dem der Stapel zwischen den Zügen leer wird.

## Fehlgeschlagen, wenn

Eine Partie nicht endet oder der Prüfer einen der genannten Verstösse meldet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E3-verdoppler`, `npm ci` gelaufen |

## Testdaten

`dauerlaufPartien(150, false, 1001)` und `dauerlaufPartien(150, true, 5001)` aus `src/engine/testing/dauerlauf.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | vorübergehende Testdatei `src/engine/__tests__/zz_pruefer_e3_tmp.test.ts` mit eigenem Schrittprüfer über `dauerlauf(…, { neuerPruefer })` anlegen | Saaten aus „Testdaten“ | Prüfer merkt sich je Partie, ob im laufenden ersten Zug ein Verdoppler gespielt wurde |
| 2 | Konsole im Repo | Datei ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e3_tmp.test.ts` | Exit 0; Zählerstand mit zweiten Zügen, davon in der Schlussrunde, Stapel leer zwischen den Zügen |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt keine Änderung unter `src/` |

## Nicht abgedeckte Grenzfälle

Hand nur aus Verdopplern im zweiten Zug kam in den Zufallspartien nicht vor (Zähler 0); diesen Fall deckt der Regeltest „D23: wer im zweiten Zug nur Verdoppler hält …“ ab.
