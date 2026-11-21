---
id: TF-DEV-039
titel: Nach R1 lassen sich farbendieb-abwehr und frass-fusion am Entwicklertisch so durchklicken, dass gestohlene und gefressene Karten wie erwartet wandern und leere Schlangen verschwinden.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/R1-kartenhilfen (PR #74)
---

## Worum es geht

R1 hat die Hilfen zusammengelegt, mit denen Farbendieb und Schlangenfrass Karten aus Schlangen nehmen und neue Schlangen beginnen. Am Entwicklertisch zeigt sich, ob das im gebauten Programm noch so wirkt, wie die Szenarien es beschreiben: der Diebstahl der letzten Karte einer Schlange und das Fressen einer Fusion beim Gegner.

## Bestanden, wenn

`farbendieb-abwehr`: Nach dem ersten Farbendieb-Knopf und „durchlassen“ liegt gruen-03 in schlange-3 von Spieler 1, KI-Gegner 1 hat noch gruen-04 und gruen-01. Nach „Von vorn“, dem vierten Farbendieb-Knopf (blau-08) und „durchlassen“ für spieler-3 meldet KartenVersetzt „blau-08: schlange-2 … → schlange-3 von Spieler 1 … ; aufgelöst: schlange-2“, und KI-Gegner 2 zeigt „Schlangen: keine“. `frass-fusion`: Option a) auf farbenfusion-03 ergibt Blau, Gelb, Gelb, Blau; nach „Schritt zurück“, Option c) auf rot-04 und farbenfusion-02 und „durchlassen“ hat KI-Gegner 1 rot-12, gruen-01, gruen-06, der Ablagestapel von Spieler 1 zeigt Schlangenfrass, rot-04, Farbenfusion. Alle Invarianten sind erfüllt, die Konsole zeigt keinen Fehler, `scrollWidth` ist gleich `clientWidth`.

## Fehlgeschlagen, wenn

Eine Karte an einer anderen Stelle landet, eine leere Schlange stehen bleibt, die Karten unter der gefressenen Fusion fehlen, eine Invariante verletzt ist oder ein Konsolenfehler erscheint.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`vite build --mode testhooks`), ausgeliefert mit `vite preview`, Stand ab Commit `35c1af7` |
| Ausgangslage prüfen | Die Seite zeigt „Szenario farbendieb-abwehr“ bzw. „Szenario frass-fusion“ und „Schritt 0“ |

## Testdaten

Szenarien `farbendieb-abwehr` und `frass-fusion` des Entwicklertischs, Fenster 1280×900.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, 1280×900 | Adresse öffnen | `http://localhost:<port>/dev?szenario=farbendieb-abwehr` | „FarbendiebSpielen (4)“ |
| 2 | Abschnitt „FarbendiebSpielen“ | ersten Knopf klicken, dann „Reagieren: durchlassen“ für spieler-2 | – | gruen-03 in schlange-3 von Spieler 1 |
| 3 | oben | „Von vorn“, vierten Farbendieb-Knopf (blau-08), dann „Reagieren: durchlassen“ für spieler-3 | – | „aufgelöst: schlange-2“, KI-Gegner 2 „Schlangen: keine“ |
| 4 | Browser, 1280×900 | Adresse öffnen | `http://localhost:<port>/dev?szenario=frass-fusion` | „SchlangenfrassSpielen (6)“ |
| 5 | Abschnitt „SchlangenfrassSpielen“ | zweiten Knopf klicken (eigeneKarte, farbenfusion-03) | – | Schlange 1 von Spieler 1: blau-15, gelb-09, gelb-06, blau-07 |
| 6 | oben | „Schritt zurück“, dann den Knopf mit rot-04 und farbenfusion-02, dann „Reagieren: durchlassen“ | – | KI-Gegner 1: rot-12, gruen-01, gruen-06 |
| 7 | Entwicklerwerkzeuge, Konsole | Fehler ablesen | – | keine Fehlermeldung |

## Nicht abgedeckte Grenzfälle

Abwehren statt durchlassen und die Szenarien frass-eigen und frass-zwei-spieler prüfen TF-DEV-026 und TF-DEV-028; R1 ändert dort nichts, was diese Fälle nicht auch berühren. Andere Geräteklassen sind weggelassen, weil R1 keine Oberfläche ändert.
