---
id: TF-APP-010
titel: Ändert man bei offener Rückfrage die Gegnerzahl, legt „Ja, neue Partie“ die Partie mit der neuen Wahl an.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2-app-rahmen-lobby (PR #29)
grenzfall_von: TF-APP-003
---

## Worum es geht

Während die Rückfrage offen ist, bleiben Gegnerwahl und Erweiterung bedienbar. Die neue Partie muss dann mit dem angelegt werden, was zum Zeitpunkt der Bestätigung gewählt ist. Dabei wird auch Escape mit dem Fokus ausserhalb der Rückfrage geprüft.

## Bestanden, wenn

Nach „Neue Partie“, dann „3 Gegner“, dann „Ja, neue Partie“ zeigt `/spiel` „Gegner 3“, und der alte Spielstand ist überschrieben.

## Fehlgeschlagen, wenn

`/spiel` zeigt die Gegnerzahl von vor der Änderung.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf Port 4173, Desktop 1280×900 |
| Ausgangslage | Eine Partie mit 1 Gegner ist gespeichert |

## Testdaten

Neue Wahl: 3 Gegner.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | „Neue Partie“ | | Rückfrage offen |
| 2 | Lobby | „3 Gegner“ anklicken, dann Escape | | Rückfrage bleibt offen, weil der Fokus auf „3 Gegner“ liegt |
| 3 | Rückfrage | „Ja, neue Partie“ | | `/spiel` mit „Gegner 3“ |

## Zurücksetzen

Local Storage löschen.
