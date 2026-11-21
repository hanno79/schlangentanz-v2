---
id: TF-TISCH-031
titel: Ein Doppelklick auf „Noch einmal“ beginnt genau eine neue Partie, und Neuladen danach zeigt sie wieder.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O8-spielende (PR #77)
grenzfall_von: TF-TISCH-026
---

## Worum es geht

Wer ungeduldig zweimal auf „Noch einmal“ tippt, soll nicht zwei Partien hintereinander anlegen oder im zweiten Klick etwas am neuen Tisch auslösen. Nach dem Neuladen muss die neue Partie stehen, nicht die alte Wertung.

## Bestanden, wenn

Nach dem Doppelklick steht der Tisch mit „Du bist dran“, der Speicher hält eine laufende Partie mit 4 Spielern und leeren Schlangen, und die Konsole meldet keinen Fehler. Nach „Noch einmal“ aus dem Endstand Saat 7023 (zwei Gegner, ohne Erweiterung) und Neuladen steht derselbe Spielstand am Tisch. Zurück im Browser führt in die Lobby mit „Laufende Partie: 2 Gegner, Erweiterung aus“ und „Weiterspielen“, und „Neue Partie“ fragt dort nach.

## Fehlgeschlagen, wenn

Der zweite Klick spielt eine Karte oder legt eine zweite Partie an, Neuladen zeigt die alte Wertung, oder die Lobby bietet danach „Ergebnis ansehen“ statt „Weiterspielen“.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Desktop 1280 × 900 mit Maus und Handy hochkant 390 × 844 mit Touch, Stand ab Commit 0b0d639 |

## Testdaten

Adresse `/spiel?szenario=wertung-beispiele`; Endstand Saat 7023 im Speicher `schlangentanz-v2:partie`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser (Desktop) | Adresse öffnen | `/spiel?szenario=wertung-beispiele` | Wertung „KI-Gegner 2 gewinnt!“ |
| 2 | Wertung | „Noch einmal“ doppelklicken | | Tisch mit drei Gegnern, „Du bist dran“, „Deine Schlangen 0 Punkte“ |
| 3 | Browser (Handy) | Endstand Saat 7023 in den Speicher legen, Lobby öffnen, „Ergebnis ansehen“ antippen | | „KI-Gegner 2 gewinnt!“ mit 17 Punkten |
| 4 | Wertung | „Noch einmal“ antippen, dann neu laden | | Tisch mit zwei Gegnern, gleicher Spielstand wie vor dem Neuladen |
| 5 | Browser | Zurück | | Lobby „Laufende Partie: 2 Gegner, Erweiterung aus“, „Weiterspielen“ |
| 6 | Lobby | „Neue Partie“ antippen | | Rückfrage „Es läuft schon eine Partie. …“ |
