---
id: TF-DEV-017
titel: Eine ganze Partie zu zweit, in der die KI jeden Zug des Gegners per Knopf „KI-Schritt“ spielt, endet mit „Beendet“ und gesperrtem Knopf.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/K1-ki-schnittstelle
grenzfall_von: TF-DEV-016
---

## Worum es geht

Ein einzelner Schritt sagt wenig darüber, ob der Knopf eine ganze Partie lang trägt: über Schlussrunde, Abwerfen und Spielende hinweg. Hier spielt der Mensch je Zug die erste angebotene Karte und beendet den Zug, die KI spielt alles andere per Knopf.

## Bestanden, wenn

Die Partie aus Saat 7 endet bei „Schritt 185“ mit „Die Partie ist beendet.“ und gesperrtem Knopf. Das sind 99 Klicks auf „KI-Schritt“, jeder mit genau einem neuen Verlaufseintrag, der mit „KI-Schritt: “ beginnt, und 43 Züge des Menschen; bei jedem davon war der Knopf gesperrt. Höchstens 3 KI-Schritte folgen aufeinander (Farbkarte, Sonderkarte, „ZugBeenden“). Alle Invarianten erfüllt, keine Konsolenfehler, `scrollWidth` gleich `clientWidth`. Auf Desktop und Handy hochkant läuft dieselbe Partie gleich ab.

## Fehlgeschlagen, wenn

Ein Klick nicht genau einen Eintrag erzeugt, der Knopf für den Menschen frei ist, eine Fehlermeldung erscheint oder die Partie nicht bei „Beendet“ ankommt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, `npm run preview:testhooks` auf Port 4174; Desktop 1280×900 mit Maus und Handy hochkant 390×844 mit Touch (Playwright) |

## Testdaten

Adresse `/dev?seed=7&spieler=2`. Der Mensch wählt je Zug den ersten Aktionsknopf, der nicht „ZugBeenden“ ist, und danach „ZugBeenden“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?seed=7&spieler=2` | Seite öffnen | | „Schritt 0“, Knopf „KI-Schritt“ grau |
| 2 | Aktionen der Engine | erste Karte, dann „ZugBeenden“ | | Knopf frei, Hinweis „KI-Gegner 1 entscheidet; das ist eine KI.“ |
| 3 | Knopf „KI-Schritt“ | klicken, bis der Hinweis „ein Mensch“ zeigt | | je Klick ein Verlaufseintrag mehr, beginnend mit „KI-Schritt: “ |
| 4 | dieselbe Seite | Schritte 2 und 3 wiederholen, bis „Die Partie ist beendet.“ erscheint | | „Schritt 185“, „Aktionen der Engine (0)“, Ereignis „PartieBeendet“, Lage „Partiephase Beendet“ |
