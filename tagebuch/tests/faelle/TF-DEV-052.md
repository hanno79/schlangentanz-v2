---
id: TF-DEV-052
titel: Die fünf Comeback-Szenarien am Entwicklertisch lassen sich mit Klicks so durchspielen, wie ihre Erwartung es beschreibt.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X4-comeback (PR #111)
---

## Worum es geht

Der Entwicklertisch zeigt die Comeback-Karte mit eigenen Szenarien. Ein Tester lädt jedes Szenario, klickt die Knöpfe der Engine und vergleicht, was in „Lage“, „Aktionen der Engine“ und „Ereignisse des letzten Schritts“ steht.

## Bestanden, wenn

`comeback-bedingung`: „Comeback-Bedingung zu Zugbeginn erfüllt“; nach „ComebackEinsetzen“ das Ereignis „ComebackEingesetzt … dreht comeback-01 um“, zweimal „Comeback: Farbkarte/Sonderkarte/Zwei Karten abwerfen, drei ziehen“, der Verdoppler nur noch als „SonderkarteWirkungslosAblegen“; nach drei Farbkarten und der Blockade bleibt nur „ZugBeenden“; danach „nicht erfüllt“ bei KI-Gegner 1. `comeback-rueckstand-4`: kein Comeback-Knopf, auch nachdem Blau an die Schlange des KI-Gegners gelegt ist (6 gegen 1). `comeback-abwerfen-ziehen`: zehn Abwerfen-Knöpfe, nach dem ersten Klick 6 Handkarten und 15 Knöpfe, nach dem zweiten 7 Handkarten, kein Abwerfen und kein „ZugBeenden“ mehr. `comeback-letzte-karte`: „zieht 2“, „SchlussrundeBegonnen: ausgelöst von Spieler 1“, beide violetten Karten spielbar, nach „ZugBeenden“ kein Nachziehen, nach zwei KI-Schritten „PartieBeendet“. `comeback-verdoppler`: nach „VerdopplerSpielen“ und im Teilzug 2 kein Comeback-Knopf, „in dieser Runde: Verdoppler“. Keine Konsolenfehler, kein waagrechtes Scrollen.

## Fehlgeschlagen, wenn

Ein Knopf fehlt oder ist zu viel, ein Ereignis oder eine Zahl weicht ab, oder die Konsole meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build von 9e253382 (`npx vite build --mode testhooks`), `vite preview` auf einem freien Port, Fenster 1280×900 |

## Testdaten

Adressen `/dev?szenario=comeback-bedingung`, `comeback-rueckstand-4`, `comeback-abwerfen-ziehen`, `comeback-letzte-karte`, `comeback-verdoppler`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?szenario=comeback-bedingung` | „ComebackEinsetzen: Comeback-Karte (comeback-01)“ klicken |  | Ereignis „ComebackEingesetzt“, Lage „Zusatzaktionen“ zweimal Comeback, 10 Knöpfe „ZweiAbwerfenDreiZiehen“, Verdoppler nur wirkungslos |
| 2 | dasselbe | Blau, Rot und Gelb an „schlange-1“ legen, dann die Blockade spielen und „Reagieren: durchlassen“ klicken |  | „gespielt: 3 Farbkarte(n), 1 Sonderkarte(n)“, nur „ZugBeenden“ |
| 3 | dasselbe | „ZugBeenden“ klicken |  | „KartenGezogen … zieht 4“, KI-Gegner 1 am Zug, „Comeback-Bedingung zu Zugbeginn nicht erfüllt“, Zusatzaktionen „keine“ |
| 4 | `/dev?szenario=comeback-rueckstand-4` | Blau an „schlange-2 ende“ legen |  | „nicht erfüllt“, kein Knopf „ComebackEinsetzen“ vorher und nachher, Schlange von KI-Gegner 1 hat 6 Karten |
| 5 | `/dev?szenario=comeback-abwerfen-ziehen` | „ComebackEinsetzen“, dann zweimal einen „ZweiAbwerfenDreiZiehen“-Knopf |  | „zieht 3“ ohne Karten-Ids, Hand 6 und dann 7 Karten, danach kein Abwerfen und kein „ZugBeenden“ |
| 6 | `/dev?szenario=comeback-letzte-karte` | den ersten „ZweiAbwerfenDreiZiehen“-Knopf, dann beide violetten Karten an die eigene Schlange, „ZugBeenden“, zweimal „KI-Schritt (solide)“ |  | „zieht 2“, „SchlussrundeBegonnen: ausgelöst von Spieler 1“, Partiephase Schlussrunde, nach „ZugBeenden“ kein „KartenGezogen“, zuletzt „PartieBeendet“ |
| 7 | `/dev?szenario=comeback-verdoppler` | „VerdopplerSpielen“, dann „ZugBeenden“ |  | kein „ComebackEinsetzen“, Teilzug 2, „in dieser Runde: Verdoppler“ |

## Nicht abgedeckte Grenzfälle

Touch-Bedienung und andere Geräteklassen: Der Entwicklertisch ist ein Werkzeug für Desktop; die Bedienung am Spieltisch baut O10.
