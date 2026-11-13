---
id: TF-DEV-014
titel: Die sechs Szenarien des Zugablaufs lassen sich am Entwicklertisch mit Klicks durchspielen und zeigen die erwarteten Ereignisse, Handgrössen und das Spielende.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/E2-zugablauf (PR #36)
---

## Worum es geht

Am Entwicklertisch prüft man die Engine von Hand: Szenario laden, auf die Knöpfe der Engine klicken, Ereignisse und Lage ablesen. Die sechs Szenarien aus dem Plan zeigen Auffüllen, Schlussrunde, Aussetzen und die Pflichtkarte.

## Bestanden, wenn

`stapel-fast-leer`: nach „Zug beenden“ die Ereignisse KartenGezogen (Spieler 1, 1), ZugBegonnen (KI-Gegner 1), KartenGezogen (KI-Gegner 1, 1), SchlussrundeBegonnen (KI-Gegner 1), Hände 5/3, Stapel 0; danach je ein Zug ohne Ziehen und „Die Partie ist beendet (A10)“. `schlussrunde-2`: Spieler 1 und KI-Gegner 1 je ein Zug, Hände 4/4, PartieBeendet, Wertung mit „Gewonnen“. `schlussrunde-4`: Reihenfolge KI-Gegner 3, Spieler 1, KI-Gegner 1, dann PartieBeendet. `aussetzen`: KartenGezogen, Ausgesetzt (KI-Gegner 1), ZugBegonnen (KI-Gegner 2), Hände 5/3/5, Grube auf dem Ablagestapel von Spieler 1; zwei Züge später zieht KI-Gegner 1 zwei Karten. `nur-farbenschutz`: drei Knöpfe „wirkungslos“, danach nur „Zug beenden“, das 3 Karten zieht. `nur-sonderkarten`: fünf Knöpfe „wirkungslos“, danach nur „Zug beenden“. Alle Invarianten erfüllt, kein Konsolenfehler, kein waagrechtes Scrollen.

## Fehlgeschlagen, wenn

Ein Ereignis fehlt oder in anderer Reihenfolge kommt, eine Handgrösse abweicht, jemand in der Schlussrunde zieht, der Auslöser noch einmal dran ist, eine Invariante rot ist oder die Seite breiter ist als das Fenster.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), `npm run preview:testhooks` auf Port 4174 |

## Testdaten

Die Szenarien `stapel-fast-leer`, `schlussrunde-2`, `schlussrunde-4`, `aussetzen`, `nur-farbenschutz`, `nur-sonderkarten` aus `/dev/szenarien`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?szenario=stapel-fast-leer` | erste Farbkarte anklicken, dann „ZugBeenden“ | | Ereignisse wie oben, Hände 5/3, Partiephase Schlussrunde |
| 2 | dieselbe Seite | je Zug eine Karte und „ZugBeenden“, bis keine Knöpfe mehr da sind | | „Die Partie ist beendet (A10)“, Hände 4/1 oder 4/2 |
| 3 | `/dev?szenario=schlussrunde-2` und `schlussrunde-4` | je Zug eine Karte und „ZugBeenden“ | | Reihenfolge der ZugBegonnen-Ereignisse, PartieBeendet |
| 4 | `/dev?szenario=aussetzen` | Karte, „ZugBeenden“, dann zwei weitere Züge | | Ausgesetzt, Grube auf Ablagestapel Spieler 1, später zieht KI-Gegner 1 zwei |
| 5 | `/dev?szenario=nur-farbenschutz` und `nur-sonderkarten` | einen „wirkungslos“-Knopf, dann „ZugBeenden“ | | nach dem Ablegen nur noch „ZugBeenden“ |
| 6 | dieselben Seiten auf dem Handy hochkant (390×844, Touch) | wie 1 bis 5 mit Tippen | | dieselben Werte, `scrollWidth` 390 |

## Nicht abgedeckte Grenzfälle

Handy quer und die Tablet-Klassen prüft hier niemand; die Layoutverträge des Entwicklertischs laufen in allen zehn Projekten von `npm run test:layout`.
