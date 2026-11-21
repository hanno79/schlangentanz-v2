---
id: TF-TISCH-033
titel: Beim Ordnen einer Häutung nennt die Zugleiste die Punkte vorher und nachher, und nach „Ausführen“ zeigt der Tisch genau den angekündigten Stand.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ui/spiel/haeutungsvorschau.test.ts
aenderung: task/O7-haeutung-tisch (PR #78)
---

## Worum es geht

Wer Karten umordnet, will vorher wissen, was es bringt. Die Zahlen müssen aus der Wertung der Engine kommen und nach dem Ausführen am Tisch wieder genau so dastehen, in der eigenen Schlange wie in der eines Gegners.

## Bestanden, wenn

In deiner Schlange Rot, Blau, Rot, Rot, Gelb mit Abschnitt Karte 1 bis 5 zeigt jede Anordnung mit drei Rot nebeneinander „Deine Punkte: vorher 0, nachher 3“, jede andere neue Anordnung „vorher 0, nachher 0“ und die alte Folge nur „Deine Punkte: 0“. Nach „Ausführen“ mit drei Rot nebeneinander steht am Tisch „Deine Schlangen 3 Punkte“. In der Schlange von KI-Gegner 1 (Grün, Grün, Grün, Blau, Rot), Abschnitt 1 bis 4, Grün mit Blau getauscht: „Punkte von KI-Gegner 1: vorher 9, nachher 0“; nach „Ausführen“ und seinem Durchlassen steht bei ihm „0 Punkte“.

## Fehlgeschlagen, wenn

Eine angezeigte Zahl weicht von `berechneZwischenstand` vor und nach der Aktion ab, oder der Tisch zeigt nach dem Ausführen einen anderen Wert als „nachher“.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, alle fünf Geräteklassen, Touch auf Tablet und Handy, Stand ab Commit 49a394c |

## Testdaten

Szenario `haeutung-punkte`: deine Schlange Rot, Blau, Rot, Rot, Gelb (0 Punkte); KI-Gegner 1 Grün, Grün, Grün, Blau, Rot (9 Punkte), kein Farbenschutz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=haeutung-punkte&tempo=sofort` | „Deine Schlangen 0 Punkte“, KI-Gegner 1 „9 Punkte“ |
| 2 | Tisch | Häutung, „Deine Schlange 1 wählen“, Karte 1 und Karte 5 antippen | | „Deine Punkte: 0“ |
| 3 | Deine Schlange 1 | Karte 1 und 2 tauschen | | Blau, Rot, Rot, Rot, Gelb; „Deine Punkte: vorher 0, nachher 3“ |
| 4 | Deine Schlange 1 | Weitere Tausche: 2 mit 4, 3 mit 4, 1 mit 5, 4 mit 5, 2 mit 3, 4 mit 5 | | nach jedem Tausch „nachher 3“ bei drei Rot in Folge, sonst „nachher 0“ |
| 5 | Zugleiste | „Ausführen“ | | „Deine Schlangen 3 Punkte“ |
| 6 | Browser | Adresse aus Schritt 1 neu öffnen; Häutung, „KI-Gegner 1, Schlange 1 wählen“, Karte 1 und 4, dann Karte 3 und 4 tauschen | | Grün, Grün, Blau, Grün, Rot; „Punkte von KI-Gegner 1: vorher 9, nachher 0“ |
| 7 | Zugleiste | „Ausführen“ | | KI-Gegner 1 lässt durch, bei ihm „0 Punkte“ |

## Technische Prüfung

Je Anordnung die aufgezählte Häutung mit derselben Farbfolge suchen und `berechneZwischenstand(…, 'spieler-1')` vor und nach `anwendeAktion` vergleichen.

## Nicht abgedeckte Grenzfälle

Vorschau mit Kettenbonus: entfällt, der Zwischenstand rechnet ohne Kette (O8). Fremde geheime Aufgabe, die durch die Häutung erfüllt würde: nicht geprüft, weil Aufgaben in der Engine noch fehlen (X1, X2). Gegner wehrt mit Farbenschutz ab: dann gilt „nachher“ nicht; die Abwehr baut O6.
