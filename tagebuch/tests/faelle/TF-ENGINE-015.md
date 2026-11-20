---
id: TF-ENGINE-015
titel: Am Rand des Zugablaufs verhält sich die Engine nach A5, A10, D12 und D14, auch wenn der Stapel zu wenig Karten hat oder beim Abwerfen falsche Aktionen kommen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/E2-zugablauf (PR #36)
grenzfall_von: TF-ENGINE-010
---

## Worum es geht

Fünf Lagen, die in den Abnahmekriterien nicht einzeln stehen: Der Stapel hat weniger Karten als nötig, eine Grube liegt bei Spielende noch vor dem Auslöser, zwei Gruben liegen in der Schlussrunde vor demselben Spieler, im Abschnitt „Abwerfen“ kommen falsche Aktionen, und ein Farbenschutz wird nach einer Farbkarte oder nach einer Sonderkarte abgelegt.

## Bestanden, wenn

Alle fünf Fälle verhalten sich so:

- Liegt noch 1 Karte im Stapel und braucht Spieler 1 am Zugende 2, zieht er 1 (Hand 4), die Schlussrunde beginnt mit ihm als Auslöser.
- Liegt bei Spielende eine Grube vor dem Auslöser, endet die Partie mit `PartieBeendet`, und keine Invariante ist verletzt.
- Liegen zwei Gruben vor demselben Spieler in der Schlussrunde, setzt er genau einmal aus (D21), dann endet die Partie.
- Im Abschnitt „Abwerfen“ werden ein fremder Spieler, „Zug beenden“, eine Karte mit oder ohne Wirkung, 0 Karten, 2 Karten statt 1 und eine doppelt genannte Karte mit deutschem Grund abgelehnt; Speichern und Laden ergibt denselben Zustand.
- Nach einer Farbkarte sind beide Farbenschutz wirkungslos ablegbar; nach einem davon bleibt nur „Zug beenden“, der zweite wird mit Verweis auf D12 abgelehnt.

## Fehlgeschlagen, wenn

Einer der fünf Fälle anders ausgeht, etwa die Schlussrunde mit einer Karte im Stapel nicht beginnt, eine falsche Aktion beim Abwerfen erlaubt ist oder ein Spieler in der Schlussrunde zweimal aussetzt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E2-zugablauf`, `npm ci` gelaufen |

## Testdaten

Szenario-Baukasten ohne Erweiterung; Hände aus Blau, Rot, Gelb, Grün, Violett, Braun und Farbenschutz; `stapelBehalten(1)`, `.grube(1, 0).schlussrunde(0).amZug(1)` und `.grube(0, 1).grube(2, 1).schlussrunde(0)`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | vorübergehende Testdatei `src/engine/__tests__/pruefer_e2_tmp.test.ts` mit den Fällen G-A bis G-E anlegen | Lagen aus „Testdaten“ | Datei liegt neben den Zugablauf-Tests |
| 2 | Konsole im Repo | Datei ausführen | `npx vitest run src/engine/__tests__/pruefer_e2_tmp.test.ts -t "eigene Grenzfälle" --reporter=verbose` | Zeilen „G-A“ bis „G-E“ mit den Werten aus „Bestanden, wenn“, Exit 0 |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt keine Änderung unter `src/` |
