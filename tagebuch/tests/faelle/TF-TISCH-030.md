---
id: TF-TISCH-030
titel: Auch 320 px breit zeigt die Wertung lange Schlangen ohne waagrechtes Scrollen der Seite; die Schlangen scrollen in sich und sagen, dass sie weitergehen.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O8-spielende (PR #77)
grenzfall_von: TF-TISCH-024
---

## Worum es geht

In der Wertung stehen die Schlangen mit allen Karten. Nach einer langen Partie hat eine Schlange leicht 15 bis 20 Karten. Auf einem schmalen Handy darf das die Seite nicht verbreitern.

## Bestanden, wenn

Bei 320 × 568 ist `scrollWidth` der Seite gleich `clientWidth`. Lange Schlangen sind breiter als ihr Bereich (etwa 624 px in 252 px) und zeigen am Rand „+12 ›“. „Zur Lobby“ und „Noch einmal“ stehen ganz im Fenster. Dasselbe gilt für `wertung-beispiele` mit vier Spielern.

## Fehlgeschlagen, wenn

Die Seite scrollt waagrecht, eine Schlange ist abgeschnitten, ohne dass ein Zeichen sagt, dass sie weitergeht, oder ein Knopf liegt ausserhalb des Fensters.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Fenster 320 × 568 mit Touch, Stand ab Commit 0b0d639 |
| Datenstand | Endstand der Zufallspartie Saat 7004 (zwei Spieler, Schlangen mit 19 und 15 Karten), im Speicher `schlangentanz-v2:partie` abgelegt |

## Testdaten

Endstand Saat 7004 als Text aus `serialisiere`, dazu Adresse `/spiel?szenario=wertung-beispiele`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Endstand in den Speicher legen, `/spiel` öffnen | Endstand Saat 7004 | „Du gewinnst!“, „Mit 17 Punkten.“ |
| 2 | Wertung | Schlange 1 bei „Du“ ansehen | | Karten bis zum Rand, „+12 ›“ am rechten Rand, Seite nicht breiter als 320 px |
| 3 | Browser | Adresse öffnen | `/spiel?szenario=wertung-beispiele` | Vier Spieler, Knöpfe ganz zu sehen, kein waagrechtes Scrollen |
