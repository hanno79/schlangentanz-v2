---
id: TF-DEV-053
titel: Eine Zufallspartie mit Erweiterung läuft am Entwicklertisch bis zum Ende, und dabei werden Comeback-Karten eingesetzt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X4-comeback (PR #111)
---

## Worum es geht

Die Szenarien zeigen die Comeback-Karte in vorbereiteten Stellungen; hier kommt sie in einer ganzen Partie vor. Der Tester spielt eine Partie mit Erweiterung durch Klicks zu Ende und zählt, wie oft eine Comeback-Karte eingesetzt wird.

## Bestanden, wenn

Die Partie aus Saat 14 mit 4 Spielern endet mit „PartieBeendet“, alle Invarianten sind erfüllt, mindestens eine Comeback-Karte wurde eingesetzt (Ereignis „ComebackEingesetzt“), die Konsole zeigt keinen Fehler, und `scrollWidth` ist nicht grösser als `clientWidth`.

## Fehlgeschlagen, wenn

Die Partie bleibt hängen, eine Invariante ist verletzt, eine Konsolenmeldung erscheint, oder keine Comeback-Karte wurde eingesetzt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build von 9e253382 mit `vite preview`, Fenster 1280×900 |

## Testdaten

Adresse `/dev?seed=14&spieler=4&erweiterung=1`; für Spieler 1 wird „ComebackEinsetzen“ gewählt, sobald es angeboten ist, sonst ein Aktionsknopf nach einem festen Zufall (Saat 12345).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?seed=14&spieler=4&erweiterung=1` | Seite öffnen |  | „Partie aus Saat 14, 4 Spieler, mit Erweiterung“ |
| 2 | dasselbe | solange „KI-Schritt“ aktiv ist, „KI-Schritt“ klicken; sonst für Spieler 1 einen Aktionsknopf, „ComebackEinsetzen“ zuerst |  | in den Ereignissen erscheint „ComebackEingesetzt“ |
| 3 | dasselbe | weiter, bis „PartieBeendet“ erscheint |  | „Invarianten (alle erfüllt)“, Partiephase „Beendet“ |

## Technische Prüfung

Das Playwright-Skript im Beleg führt die Klicks aus und schreibt Schritte, eingesetzte Comeback-Karten, Abwerfen mitten im Zug, Invarianten, Breite und Konsolenfehler in eine Textdatei.

## Nicht abgedeckte Grenzfälle

Partien mit 2 und 3 Spielern am Entwicklertisch: Der Dauerlauf spielt sie mit Erweiterung (150 Partien) ohne Oberfläche.
