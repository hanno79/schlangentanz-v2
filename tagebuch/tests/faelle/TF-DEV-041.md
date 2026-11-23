---
id: TF-DEV-041
titel: Am Entwicklertisch zeigen die vier Aufgaben-Szenarien Einlösen, Aufdecken, leeren Stapel, Abwehr und Gegnerzug genau wie im Text „Erwartet“.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X1-aufgaben-rahmen (PR #100)
---

## Worum es geht

Die Szenarien `aufgaben-einloesen`, `aufgaben-stapel-leer`, `aufgaben-abwehr` und `aufgaben-gegnerzug` geben einzelnen Aufgaben eine Testbedingung, die nur am Entwicklertisch gilt. Mit echten Klicks soll man dort sehen, wann die Engine Aufgaben einlöst und was danach offen liegt.

## Bestanden, wenn

Nach den Klicks stehen unter „Ereignisse des letzten Schritts“ genau die Zeilen aus „Erwartet“, die Angaben unter „Offene Aufgaben“, „Erfüllte Aufgaben“, „Geheime Aufgabe“ und „Aufgabenstapel“ stimmen damit überein, alle Invarianten sind erfüllt und die Konsole zeigt keinen Fehler.

## Fehlgeschlagen, wenn

Eine Aufgabe wird zu früh, für den falschen Spieler oder gar nicht eingelöst, ein Platz wird nicht ersetzt, oder eine Invariante ist verletzt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, `npm run preview:testhooks`) unter http://localhost:4174, Stand ab Commit 0f83bf6 |

## Testdaten

Szenarien `aufgaben-einloesen`, `aufgaben-stapel-leer`, `aufgaben-abwehr`, `aufgaben-gegnerzug`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/dev?szenario=aufgaben-einloesen` | Schlange 1 hat Blau, Blau; offen Farbkombination, Fusionsexperte, Lila Riese; Aufgabenstapel 10 Karten |
| 2 | Aktionen der Engine | Knopf „FarbkarteLegen: Wasserwirbel (blau-03) → schlange-1 ende“ klicken | | Ereignisse: KarteGespielt, AufgabeErfuellt Farbkombination, AufgabeAufgedeckt Gelber Schatz, AufgabeErfuellt Gelber Schatz, AufgabeAufgedeckt Farbvielfalt; offen Farbvielfalt, Fusionsexperte, Lila Riese; Stapel 8; geheime Aufgabe Schlangentanz „erfüllt“ |
| 3 | Adresse | öffnen | `/dev?szenario=aufgaben-stapel-leer` | Stapel 1 Karte |
| 4 | Aktionen der Engine | „FarbkarteLegen: Wasserwirbel (blau-03) → schlange-1 ende“ klicken | | AufgabeErfuellt Farbkombination, AufgabeAufgedeckt Gelber Schatz, AufgabeErfuellt Lila Riese, AufgabenstapelLeer; offen nur Gelber Schatz und Fusionsexperte; Stapel 0 |
| 5 | Adresse | öffnen | `/dev?szenario=aufgaben-abwehr` | Spieler 1 hält eine Schlangengrube |
| 6 | Aktionen der Engine | „SchlangengrubeSpielen“ klicken | | nur KarteAngesagt und AbwehrGefragt, kein AufgabeErfuellt |
| 7 | Aktionen der Engine | Reagieren von spieler-2 mit farbenschutz-01 klicken | | Abgewehrt, AnsageEntschieden, AufgabeErfuellt (Spieler 1, Farbkombination), AufgabeAufgedeckt; erfüllt bei Spieler 1, nicht bei KI-Gegner 1 |
| 8 | Adresse | öffnen | `/dev?szenario=aufgaben-gegnerzug` | KI-Gegner 1 hat Schlange Gelb, Gelb |
| 9 | Aktionen der Engine | „FarbkarteLegen: Sonnenblatt (gelb-01) → schlange-2 ende“ klicken | | nur KarteGespielt; geheime Aufgabe von KI-Gegner 1 „nicht erfüllt“ |
| 10 | Aktionen der Engine | „ZugBeenden“ klicken | | KartenGezogen, ZugBegonnen KI-Gegner 1, AufgabeErfuellt (KI-Gegner 1, Farbkombination), AufgabeAufgedeckt Gelber Schatz; geheime Aufgabe Symmetriemeister „erfüllt“ |

## Nicht abgedeckte Grenzfälle

Dass unter `/spiel` keine Testbedingung gilt, prüft TF-DEV-042. Eine Kette über mehr als zwei Aufgaben und zwei offene Aufgaben zugleich zeigt kein Szenario; das belegen die Regeltests in TF-ENGINE-060.
