---
id: TF-DESIGN-002
titel: Die Entwurfsseiten Lobby, Tisch und Ergebnis passen in jede Geräteklasse und lassen sich mit Maus und Finger bedienen.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/layout/entwurf.hooks.spec.ts
aenderung: task/O1-gestaltung (PR #30)
---

## Worum es geht

Die Entwürfe unter `/dev/entwurf` legen fest, wie das Spiel später aussieht. Sie müssen auf Desktop, Tablet und Handy ohne waagrechtes Scrollen auskommen, und man muss am Tisch eine Karte wählen, ein Ziel wählen und ausführen können.

## Bestanden, wenn

In allen drei Klassen ist `scrollWidth` gleich `clientWidth` (1280, 1024, 390). Nach der Wahl von „Farbkarte Rot“ erscheinen 14 Ziele, nach dem Farbendieb 27, nach der Schlangengrube 3, nach dem Farbenschutz 1. Ein gewähltes Ziel bringt „Ausführen“ in die Zugleiste. Die Grossansicht einer Aufgabe ist mindestens 280 px breit und schliesst mit Escape und mit einem Tipp daneben. In der Lobby wechselt der Schalter von „Aus“ auf „An“. Das Ergebnis nennt vier Plätze mit „Sieger“ beim ersten. Die Konsole meldet keinen Fehler.

## Fehlgeschlagen, wenn

Eine Seite breiter ist als das Fenster, ein Ziel fehlt, „Ausführen“ nicht erscheint, die Grossansicht schmaler als 280 px ist oder nicht schliesst, oder die Konsole einen Fehler zeigt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174 (`npm run build:testhooks`, `npm run preview:testhooks`) |
| Geräteklassen | Desktop 1280×900 Maus, Tablet 1024×768 Touch, Handy 390×844 Touch |

## Testdaten

Feste Beispieldaten aus `src/entwicklung/entwurf/beispiel.ts`: drei Gegner (Mia, Ben, Lea), Hand Rot, Grün, Farbendieb, Schlangengrube, Farbenschutz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev/entwurf/tisch` | Seite öffnen, Breite messen | | `scrollWidth` gleich Fensterbreite |
| 2 | Deine Hand | „Farbkarte Rot“ tippen | | 14 gestrichelte Ziele, „+“ links und rechts der Schlangen |
| 3 | Deine Schlangen | linkes „+“ von Schlange 1 tippen, dann „Ausführen“ | | Zugleiste: „Rot: links an deine Schlange 1.“, danach Entwurfsmeldung |
| 4 | Deine Hand | „Sonderkarte Farbendieb“ tippen, eine Karte von Ben tippen | | Zugleiste nennt die Karte, „Ausführen“ erscheint |
| 5 | Tischmitte | Aufgabe „Lila Riese“ tippen | | Grossansicht, Text lesbar, schliesst mit Escape und mit Tipp daneben |
| 6 | `/dev/entwurf/lobby` | Schalter „Erweiterung“ tippen, „1 Gegner“ tippen | | Schalter zeigt „An“, „1“ gewählt |
| 7 | `/dev/entwurf/ergebnis` | Seite lesen | | Mia 52, Du 47, Ben 31, Lea 28 Punkte, „Sieger“ bei Mia |

## Nicht abgedeckte Grenzfälle

Handy quer (TF-DESIGN-003) und Breiten zwischen 700 und 850 px (TF-DESIGN-004) haben eigene Testfälle.
