---
id: TF-TISCH-027
titel: Während der Partie zeigt der Tisch je Spieler den Zwischenstand der Engine ohne Kettenbonus und ohne fremde geheime Aufgabe, auch nach jedem Zug.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ui/tisch/Zwischenstand.test.tsx
aenderung: task/O8-spielende (PR #77)
---

## Worum es geht

Am Tisch steht bei jedem Gegner und bei dir eine Punktzahl. Sie soll zeigen, wie es gerade steht, ohne den Kettenbonus, den es erst nach Spielende gibt. Die geheimen Aufgaben der Gegner bleiben verdeckt und dürfen auch über die Punkte nicht auffallen.

## Bestanden, wenn

Im Szenario `wertung-joker` stehen bei KI-Gegner 1, 2 und 3 „14 Punkte“, „0 Punkte“ und „55 Punkte“, neben „Deine Schlangen“ „15 Punkte“. Vorgelesen wird davor „Zwischenstand ohne Kettenbonus:“. Nach deiner Rot an das Ende deiner Schlange 1 stehen bei dir 18 Punkte. Jeder Wert ist `berechneZwischenstand` aus deiner Sicht. Die Endwertung desselben Stands läge bei dir und KI-Gegner 3 um 5 höher (Kette) und bei KI-Gegner 1 um 5 (seine erfüllte geheime Aufgabe). Kein Name und keine Kennung einer fremden geheimen Aufgabe steht im Seitenquelltext.

## Fehlgeschlagen, wenn

Eine Punktzahl enthält den Kettenbonus oder die geheime Aufgabe eines Gegners, sie ändert sich nach einem Zug nicht wie die Engine, oder der Name einer fremden geheimen Aufgabe steht im Quelltext.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 0b0d639 |
| Ausgangslage prüfen | „Du bist dran“, Stapel 31 |

## Testdaten

Adresse `/spiel?szenario=wertung-joker` (vier Spieler, mit Erweiterung; KI-Gegner 1 hat seine geheime Aufgabe „Gelber Schatz“ erfüllt).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=wertung-joker` | KI-Gegner 1 „14 Punkte“, KI-Gegner 2 „0 Punkte“, KI-Gegner 3 „55 Punkte“, „Deine Schlangen 15 Punkte“ |
| 2 | Deine Hand | „Farbkarte Rot, 1 Punkt“ antippen, dann „Deine Schlange 1: Ende“ | | „Deine Schlangen 18 Punkte“ |
| 3 | Zugleiste | „Zug beenden“ antippen und die Züge der KI abwarten | | Wieder „Du bist dran“; die Punkte passen zum Stand (Technische Prüfung) |

## Technische Prüfung

Nach jedem Schritt den Speicher `schlangentanz-v2:partie` mit `deserialisiere` laden und die vier Zahlen mit `berechneZwischenstand(zustand, "spieler-1")` vergleichen, dazu `berechneEndwertung` desselben Stands für die Differenz.

## Nicht abgedeckte Grenzfälle

Eine eigene erfüllte geheime Aufgabe: zählt bei dir mit, belegt nur im Komponententest, weil die Engine Aufgaben noch nicht prüft (X1, X2). Negative Punkte gibt es nicht.
