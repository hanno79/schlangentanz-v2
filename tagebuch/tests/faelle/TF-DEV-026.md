---
id: TF-DEV-026
titel: Die Szenarien frass-eigen, frass-zwei-spieler und frass-fusion laufen am Entwicklertisch mit Klicks so ab, wie ihr Text „Erwartet“ es sagt, auf dem Desktop und auf dem Handy hochkant.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E6-schlangenfrass (PR #68)
---

## Worum es geht

Ein Tester spielt die drei Szenarien von E6 mit Klicks durch. Er vergleicht die angebotenen Knöpfe, die Ereignisse und die Lage mit dem Text des Szenarios. Welche Option und welche Karten ein Knopf „SchlangenfrassSpielen“ frisst, zeigt der Tooltip; alle Knöpfe haben dieselbe Beschriftung.

## Bestanden, wenn

- `frass-eigen`: 5 Knöpfe SchlangenfrassSpielen, viermal Option a) und einmal b). Nach b) stehen KartenVersetzt (schlangenblockade-01 von Stelle 2 auf den Ablagestapel von Spieler 1) und KarteGespielt da. Niemand wird gefragt. Die Schlange ist rot-15, rot-12, rot-09. Auf dem Ablagestapel liegen Schlangenfrass und Blockade. Angeboten sind noch 12 Mal FarbkarteLegen und ZugBeenden. Mit a) auf rot-12 statt b) bleibt rot-15, Blockade, rot-09.
- `frass-zwei-spieler`: 15 Knöpfe, alle Option c). Auf blau-15 und gelb-13 folgen KarteAngesagt (trifft KI-Gegner 1 und 2) und AbwehrGefragt an KI-Gegner 1 mit zwei Knöpfen. Nach „abwehren“ wird KI-Gegner 2 mit nur „durchlassen“ gefragt, alle sechs Karten liegen noch. Danach meldet KartenVersetzt nur gelb-13. KI-Gegner 1 behält drei Blau und hält 4 Karten, KI-Gegner 2 hat noch zwei Gelb. Mit zwei Blau stattdessen wird nur KI-Gegner 1 gefragt, und sein Farbenschutz schützt beide (D15).
- `frass-fusion`: 3 Knöpfe a) und 3 Knöpfe c). a) auf die eigene Fusion ergibt Blau, Gelb, Gelb, Blau; die beiden Gelb kommen von „unter farbenfusion-03“ an Stelle 1 und 2. c) auf rot-04 und farbenfusion-02 ergibt beim Gegner rot-12, gruen-01, gruen-06. Der Ablagestapel von Spieler 1 ist Schlangenfrass, rot-04, Farbenfusion.
- In beiden Geräteklassen sind alle Invarianten erfüllt, es gibt keinen Konsolenfehler, und `scrollWidth` ist gleich `clientWidth`.

## Fehlgeschlagen, wenn

Ein Knopf fehlt oder zu viel da ist, ein Ereignis fehlt oder anders lautet, eine Karte am falschen Ort liegt, eine Invariante verletzt ist, ein Konsolenfehler erscheint oder die Seite waagrecht scrollt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`) des geprüften Stands, `vite preview --outDir dist-testhooks` auf Port 4196 |

## Testdaten

Adressen `/dev?szenario=frass-eigen`, `/dev?szenario=frass-zwei-spieler`, `/dev?szenario=frass-fusion`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser 1280×900, `/dev?szenario=frass-eigen` | den fünften Knopf „SchlangenfrassSpielen“ klicken (Tooltip `eigeneBlockade`) | | Ereignisse und Lage wie unter „Bestanden, wenn“ |
| 2 | dieselbe Seite | „Schritt zurück“, dann den zweiten Knopf klicken (Tooltip `eigeneKarte`, rot-12) | | Schlange rot-15, Blockade, rot-09 |
| 3 | Browser 1280×900, `/dev?szenario=frass-zwei-spieler` | den Knopf mit Tooltip `blau-15` und `gelb-13` klicken | | KarteAngesagt, AbwehrGefragt an KI-Gegner 1, zwei Knöpfe |
| 4 | dieselbe Seite | „Reagieren: abwehren mit Farbenschutz“, dann „Reagieren: durchlassen“ | | nach dem ersten Klick alle Karten noch da; danach Werte wie unter „Bestanden, wenn“ |
| 5 | Browser 1280×900, `/dev?szenario=frass-fusion` | den zweiten Knopf klicken (Tooltip `eigeneKarte`, farbenfusion-03) | | Blau, Gelb, Gelb, Blau |
| 6 | dieselbe Seite | „Schritt zurück“, dann den Knopf mit Tooltip `rot-04` und `farbenfusion-02`, dann „Reagieren: durchlassen“ | | Gegnerschlange rot-12, gruen-01, gruen-06 |
| 7 | Browser 390×844 mit Touch, `/dev?szenario=frass-zwei-spieler` | den ersten Knopf (blau-13 und blau-15), dann „abwehren“ | | nur KI-Gegner 1 gefragt; AnsageEntschieden „ohne Wirkung“, drei Blau bleiben |
| 8 | Playwright, Desktop und Handy hochkant mit Touch | Schritte 1, 3 und 4 sowie 6 mit `click()` bzw. `tap()` wiederholen | | dieselben Ereignisse, `scrollWidth` 1280 bzw. 390, 0 Konsolenfehler |

## Nicht abgedeckte Grenzfälle

Tablet und Handy quer sind nicht durchgespielt, weil E6 die Oberfläche des Entwicklertischs nicht verändert; das deckt `npm run test:layout` ab.
