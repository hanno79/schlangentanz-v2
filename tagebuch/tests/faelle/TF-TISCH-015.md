---
id: TF-TISCH-015
titel: Auch am vollen Tisch und an einer langen Schlange ist jedes angebotene Ziel mindestens 44 px gross und nach dem Wischen frei zu treffen.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O5-karten-spielen (PR #73)
---

## Worum es geht

Liegen viele Karten aus, scrollen die Schlangen seitlich, und das Zeichen „+n ›“ steht am Rand. Ein Ziel darf dabei nicht kleiner als 44 px werden und nicht unter dem Zeichen oder einem anderen Element liegen, wenn man es in die Mitte holt. Tablet quer ist am engsten, weil dort die Zugleiste rechts Platz nimmt.

## Bestanden, wenn

In jeder Geräteklasse, für jede spielbare Handkarte beider Spielstände: Jedes Ziel, das nach dem Antippen der Karte markiert ist, misst nach `scrollIntoView` und 250 ms Wartezeit mindestens 44 × 44 px, liegt ganz im Fenster, wird an seiner Mitte selbst getroffen und liegt dort unter keinem Zeichen „geht weiter“. Die Seite scrollt nicht waagrecht. Im vollen Tisch sind das 12 Ziele für Rot, 41 für den Farbendieb, 3 für den Schlangenfrass, 6 für die Regenbogenschlange und 48 für die Farbenfusion.

## Fehlgeschlagen, wenn

Ein Ziel ist kleiner als 44 px, ragt aus dem Fenster, ist an seiner Mitte verdeckt oder liegt unter einem Zeichen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright Chromium mit den fünf Geräteklassen, Touch bei Tablet und Handy, Stand ab Commit 27d85d3 |
| Datenstand | Zwei Spielstände, mit dem Baukasten der Engine erzeugt und vor dem Laden in den Local Storage geschrieben |

## Testdaten

„Voller Tisch“: vier Spieler ohne Erweiterung, du mit zwei Schlangen zu je 11 Karten (eine davon mit Farbenfusion), KI-Gegner 1 mit zwei, KI-Gegner 2 und 3 mit je einer Schlange zu 11 Karten; deine Hand Rot, Farbendieb, Schlangenfrass, Regenbogenschlange, Farbenfusion; du bist am Zug. „Lange Schlange“: der Stand `langeSchlange()` aus `src/ui/tisch/__tests__/szenarien.ts` (22 Karten bei dir, 12 beim Gegner).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Entwicklerwerkzeuge | Spielstand in `schlangentanz-v2:partie` schreiben, `/spiel?tempo=sofort` öffnen | Spielstand | „Du bist dran“ |
| 2 | Deine Hand | spielbare Karte antippen | | Ziele markiert |
| 3 | Tisch | jedes markierte Ziel in die Mitte wischen | | Ziel ganz zu sehen, nicht unter „+n ›“ |
| 4 | Entwicklerwerkzeuge | Grösse, Lage und `elementFromPoint` an der Mitte messen | | mindestens 44 × 44 px, trifft das Ziel |
| 5 | Zugleiste | „Abbrechen“ antippen, mit der nächsten Karte weiter | | keine Ziele mehr markiert |

## Nicht abgedeckte Grenzfälle

Fenster schmaler als die Klassen: TF-TISCH-004 und TF-TISCH-011 (O4, O3). Ohne Scrollen kann ein Ziel am Rand unter dem Zeichen liegen; das Zeichen sagt dann „Ziel“ und lässt Tippen durch. Das ist gewollt und wird hier nicht als Befund gezählt.
