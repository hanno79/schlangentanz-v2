---
id: TF-DEV-055
titel: Eine Zufallspartie mit Erweiterung läuft am Entwicklertisch bis zum Ende, und dabei entscheidet ein Gegner nach einer gescheiterten Risiko-Karte.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X5-risiko (PR #117)
---

## Worum es geht

Die Szenarien zeigen vorbereitete Stellungen. Hier kommen die Risiko-Karten in einer ganzen Partie vor, gespielt von der Zufalls-KI. Der Tester spielt die Partie durch Klicks zu Ende und sieht nach, ob nach einem Misserfolg der begünstigte Gegner selbst wählt.

## Bestanden, wenn

Die Partie aus Saat 8731 mit 3 Spielern endet mit „PartieBeendet“, alle Invarianten sind in jedem Schritt erfüllt, mindestens eine Risiko-Karte scheitert und danach entscheidet ein anderer Spieler als der am Zug („… entscheidet über „Risiko: geplante Farbkarte oder oberste Stapelkarte““), und die Konsole zeigt keinen Fehler.

## Fehlgeschlagen, wenn

Die Partie bleibt hängen, eine Invariante ist verletzt, eine Konsolenmeldung erscheint oder es kommt keine Gegnerentscheidung vor.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build des geprüften Stands mit `vite preview`, Fenster 1280×900 |

## Testdaten

Adresse `/dev?seed=8731&spieler=3&erweiterung=1`; für Spieler 1 wird ein Aktionsknopf ohne Risiko-Karte nach einem festen Zufall (Saat 12345) gewählt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?seed=8731&spieler=3&erweiterung=1` | Seite öffnen |  | „Partie aus Saat 8731, 3 Spieler, mit Erweiterung“ |
| 2 | dasselbe | solange „KI-Schritt“ aktiv ist, „KI-Schritt“ klicken; sonst für Spieler 1 einen Aktionsknopf |  | in Schritt 15 „RisikoKarteGespielt … Aktion 2 … Misserfolg“, in Schritt 16 entscheidet KI-Gegner 1 über die geplante Farbkarte |
| 3 | dasselbe | weiter bis zum Ende |  | „PartieBeendet“, Endwertung sichtbar |

## Nicht abgedeckte Grenzfälle

Der Mensch spielt in dieser Partie keine Risiko-Karte; das prüft TF-DEV-054 mit Klicks.
