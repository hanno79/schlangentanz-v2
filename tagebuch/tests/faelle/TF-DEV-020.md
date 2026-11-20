---
id: TF-DEV-020
titel: Im Szenario „verdoppler-schlussrunde“ folgt der zweite Zug ohne Nachziehen, danach hat KI-Gegner 1 genau einen letzten Zug, und die Partie endet.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/E3-verdoppler (PR #51)
grenzfall_von: TF-DEV-022
---

## Worum es geht

In der Schlussrunde ist der Nachziehstapel leer. Spielt jemand dort einen Verdoppler, bekommt er seinen zweiten Zug, zieht aber nichts nach, und beide Teilzüge zusammen sind sein letzter Zug.

## Bestanden, wenn

Nach VerdopplerSpielen, Grün und „ZugBeenden“ steht nur „ZugBegonnen: Spieler 1, Teilzug 2“ da, kein KartenGezogen; Spieler 1 hält 2 Karten (Gelb, Farbenschutz), Stapel 0. Nach Gelb, Farbenschutz und „ZugBeenden“ steht nur „ZugBegonnen: KI-Gegner 1, Teilzug 1“, Spieler 1 hält 0 Karten. Nach einer Farbkarte und „ZugBeenden“ von KI-Gegner 1 steht „PartieBeendet“, „Am Zug: niemand“, „Schlussrunde: ausgelöst von KI-Gegner 2“, keine Knöpfe. Keine Konsolenfehler, kein waagrechtes Scrollen.

## Fehlgeschlagen, wenn

Zwischen den Teilzügen KartenGezogen erscheint, KI-Gegner 2 noch einmal drankommt, KI-Gegner 1 zwei Züge bekommt oder die Partie nicht endet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, `npm run preview:testhooks` auf Port 4174 |
| Ausgangslage prüfen | Desktop 1280×900 mit Maus, Handy hochkant 390×844 mit Touch |

## Testdaten

Szenario `verdoppler-schlussrunde`: drei Spieler, Schlussrunde ausgelöst von KI-Gegner 2, Spieler 1 am Zug mit Verdoppler, Grün, Gelb, Farbenschutz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?szenario=verdoppler-schlussrunde` | Seite öffnen | | Partiephase Schlussrunde, Stapel 0 |
| 2 | Aktionen der Engine | „VerdopplerSpielen“, „FarbkarteLegen: Waldspross (gruen-09) → neue Schlange“, „ZugBeenden“ | | nur ZugBegonnen: Spieler 1, Teilzug 2; Hand (2) |
| 3 | Aktionen der Engine | „FarbkarteLegen: Sonnenblatt (gelb-08) …“, „SonderkarteWirkungslosAblegen: Farbenschutz“, „ZugBeenden“ | | nur ZugBegonnen: KI-Gegner 1, Teilzug 1 |
| 4 | Aktionen der Engine | eine Farbkarte von KI-Gegner 1, dann „ZugBeenden“ | | PartieBeendet; Am Zug: niemand; Aktionen der Engine (0) |

## Nicht abgedeckte Grenzfälle

Ein Verdoppler des Auslösers selbst in der Schlussrunde ist nicht möglich, weil der Auslöser keinen Zug mehr hat; den Fall, dass der Stapel erst zwischen den Teilzügen leer wird, prüft TF-ENGINE-020.
