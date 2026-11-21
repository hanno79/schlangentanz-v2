---
id: TF-TISCH-023
titel: „Zur Lobby“ funktioniert mitten in der Partie, auch mit gewählter Karte, und „Weiterspielen“ bringt dieselbe Partie ohne Auswahl zurück.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O5-karten-spielen (PR #73)
---

## Worum es geht

Der Weg zurück zur Lobby muss in jeder Lage offen sein, auch wenn du gerade eine Karte gewählt hast. Ein angefangener Zug darf dabei nicht halb ausgeführt werden. Kommst du zurück, steht der Tisch wie vorher da, nur die Auswahl ist leer.

## Bestanden, wenn

Nach dem Antippen von „Zur Lobby“ zeigt die Lobby „Laufende Partie“ und „Weiterspielen“. Der gespeicherte Spielstand ist derselbe wie vor dem Antippen. Nach „Weiterspielen“ steht der Tisch mit fünf Handkarten da, keine ist gedrückt, und die Zugleiste sagt „Wähle eine Karte aus deiner Hand.“. Die Konsole meldet keinen Fehler.

## Fehlgeschlagen, wenn

„Zur Lobby“ reagiert nicht, die Lobby bietet kein „Weiterspielen“, der Spielstand hat sich geändert oder die Karte ist nach der Rückkehr gespielt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, eingebauter Browser der Desktop-App 1280 × 900 mit Maus, Stand ab Commit 6915756 |

## Testdaten

Adresse `/spiel?szenario=farbkarte-beim-gegner&tempo=sofort`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | | „Du bist dran“ |
| 2 | Deine Hand | „Farbkarte Rot, 1 Punkt“ anklicken, dann „KI-Gegner 1, Schlange 1: Anfang“, dann „Ausführen“ | | „Beende deinen Zug.“ |
| 3 | Zugleiste | „Zug beenden“ anklicken | | KI-Gegner 1 spielt, danach wieder „Du bist dran“ |
| 4 | Deine Hand | „Sonderkarte Schlangenfrass“ anklicken | | Möglichkeiten a) und c) in der Zugleiste |
| 5 | Kopfleiste | „Zur Lobby“ anklicken | | Lobby mit „Laufende Partie: 1 Gegner“ und „Weiterspielen“ |
| 6 | Lobby | „Weiterspielen“ anklicken | | fünf Handkarten, keine gedrückt, „Wähle eine Karte aus deiner Hand.“ |

## Nicht abgedeckte Grenzfälle

Zur Lobby während des Abwerf-Dialogs: Der Dialog deckt die Kopfleiste ab; erst „Zum Tisch“ gibt den Weg frei. Zur Lobby während eines KI-Zugs: nicht geprüft, weil `tempo=sofort` den KI-Zug ohne Pause spielt.
