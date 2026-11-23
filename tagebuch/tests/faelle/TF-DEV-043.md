---
id: TF-DEV-043
titel: Am Entwicklertisch löst jedes der fünf Szenarien aus X2 Paket C seine Aufgabe mit echten Karten ein, und eine Zufallspartie mit Erweiterung läuft ohne verletzte Invariante bis zum Ende.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X2c-aufgaben-sonderkarten (PR #109)
---

## Worum es geht

Die Szenarien `aufgabe-fusionsexperte`, `aufgabe-schlangenbeschwoerer`, `aufgabe-schlangenmeister`, `aufgabe-schlangenrepertoire` und `aufgabe-schlangentanz` kommen ohne Testbedingung aus. Mit einem Klick, bei Schlangenmeister mit zwei Klicks, soll man sehen, dass die Engine die Aufgabe mit echten Karten einlöst und die Zähler richtig führt.

## Bestanden, wenn

Nach den Klicks steht unter „Ereignisse des letzten Schritts“ AufgabeErfuellt für Spieler 1 mit der Aufgabe des Szenarios und AufgabeAufgedeckt mit Farbkombination. Bei Schlangenmeister steht unter „Ausgespielte Sonderkarten“ von Spieler 1 „Regenbogenschlange, Farbenschutz, Verdoppler, Schlangengrube“, bei KI-Gegner 1 „Schlangenblockade, Farbenschutz“. Bei Schlangenrepertoire stehen fünf Arten, bei Schlangentanz „Dreiergruppen durch Häutung: 2“. Alle Invarianten sind erfüllt, die Konsole zeigt keinen Fehler, und die Seite ist nicht breiter als das Fenster. Die Zufallspartie mit Saat 11 endet mit „Partiephase Beendet“ ohne verletzte Invariante.

## Fehlgeschlagen, wenn

Eine Aufgabe wird nicht, zu früh oder für den falschen Spieler eingelöst, ein Zähler zeigt einen anderen Wert, oder eine Invariante ist verletzt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, `npm run preview:testhooks`) unter http://localhost:4174, Stand ab Commit b4942251 |

## Testdaten

Die fünf Szenarien oben und die Partie `/dev?seed=11&spieler=3&erweiterung=1`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/dev?szenario=aufgabe-fusionsexperte` | Schlange 1: Gelb, Farbenfusion, Gelb, Rot, Rot; nur ein Knopf unter „FusionLegen (1)“ |
| 2 | Aktionen der Engine | Knopf unter „FusionLegen“ klicken | | AufgabeErfuellt: Spieler 1 nimmt Fusionsexperte (aufgabe-07); „Ausgespielte Sonderkarten: Farbenfusion“ |
| 3 | Adresse | öffnen | `/dev?szenario=aufgabe-schlangenbeschwoerer` | 3 Sonderkarten in zwei Schlangen |
| 4 | Aktionen der Engine | einen Knopf „RegenbogenschlangeLegen“ klicken | | AufgabeErfuellt: Spieler 1 nimmt Schlangenbeschwörer (aufgabe-08) |
| 5 | Adresse | öffnen | `/dev?szenario=aufgabe-schlangenmeister` | „Ausgespielte Sonderkarten: Regenbogenschlange, Farbenschutz, Verdoppler“ |
| 6 | Aktionen der Engine | „SchlangengrubeSpielen“ klicken | | KarteAngesagt und AbwehrGefragt, kein AufgabeErfuellt; vier ausgespielte Sonderkarten bei Spieler 1 |
| 7 | Aktionen der Engine | „Reagieren: abwehren mit Farbenschutz (farbenschutz-01)“ klicken | | Abgewehrt, AnsageEntschieden ohne Wirkung, AufgabeErfuellt: Spieler 1 nimmt Schlangenmeister (aufgabe-09) |
| 8 | Adresse | öffnen | `/dev?szenario=aufgabe-schlangenrepertoire` | vier Arten ausgespielt |
| 9 | Aktionen der Engine | „SonderkarteWirkungslosAblegen“ klicken | | AufgabeErfuellt: Spieler 1 nimmt Schlangenrepertoire (aufgabe-10); fünf Arten mit Farbenschutz |
| 10 | Adresse | öffnen | `/dev?szenario=aufgabe-schlangentanz` | „Dreiergruppen durch Häutung: 0“ |
| 11 | Aktionen der Engine | den Häutungsknopf mit „Feuerkeim (rot-04), Feuerkeim (rot-05), Mondranke (violett-02), Mondranke (violett-03), Mondranke (violett-04)“ klicken | | AufgabeErfuellt: Spieler 1 nimmt Schlangentanz (aufgabe-12); Schlange endet Rot, Rot, Rot, Violett, Violett, Violett; „Dreiergruppen durch Häutung: 2“ |
| 12 | Adresse | öffnen | `/dev?seed=11&spieler=3&erweiterung=1` | Spieler 1 ist am Zug |
| 13 | Aktionen der Engine und „KI-Schritt (solide)“ | als Spieler 1 eine Karte legen und den Zug beenden, für die KI „KI-Schritt (solide)“ klicken, bis die Partie endet | | jedes Mal „Invarianten (alle erfüllt)“; am Ende „Partiephase Beendet“ |

## Nicht abgedeckte Grenzfälle

Die anderen Geräteklassen entfallen, weil X2c die Oberfläche nicht ändert. Den Zweig „durchlassen“ bei Schlangenmeister prüft der Regeltest in TF-ENGINE-061. Ein Szenario, in dem die zwei Lesarten von „neue Dreiergruppe“ verschieden zählen, gibt es nicht; dazu steht die Frage im Prüfprotokoll X2c.
