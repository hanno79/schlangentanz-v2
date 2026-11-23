---
id: TF-TISCH-041
titel: Liegen zwei Schlangengruben vor dir, setzt du zwei Züge aus, und das Protokoll nennt beide.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-22
veraendert_daten: nein
aenderung: task/O6-gegnerzuege (PR #79)
grenzfall_von: TF-TISCH-038
---

## Worum es geht

Jede Schlangengrube kostet einen eigenen Zug (D14). Der Tisch muss das zweite Aussetzen genauso ansagen wie das erste und danach wieder an dich übergeben.

## Bestanden, wenn

Im Protokoll steht „Du setzt diesen Zug aus (Schlangengrube).“ zweimal, dazwischen spielt KI-Gegner 1 einen Zug. Danach liegt keine Grube mehr vor dir, die Statuszeile sagt „Du bist dran“, und der gelbe Hinweis steht in der Zugleiste.

## Fehlgeschlagen, wenn

Du setzt nur einmal aus, eine Grube bleibt liegen, oder die Partie bleibt stehen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit fde8e51 |

## Testdaten

Szenario `grube-vor-dir`, im gespeicherten Stand eine zweite Schlangengrube aus dem Nachziehstapel als ausliegende Grube vor dir (`gespieltVon` 1, `vor` 0) eingefügt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=grube-vor-dir` | Tisch erscheint |
| 2 | Entwicklerwerkzeuge, Speicher | im Eintrag `schlangentanz-v2:partie` eine Schlangengrube aus `nachziehstapel` nach `ausliegendeGruben` verschieben | `{ "karte": …, "gespieltVon": 1, "vor": 0 }` | zwei Gruben vor dir |
| 3 | Browser | Adresse öffnen | `/spiel?tempo=sofort` | Partie läuft weiter |
| 4 | Protokoll | lesen | | zweimal „Du setzt diesen Zug aus (Schlangengrube).“, danach „Du bist dran.“ |
