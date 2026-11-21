---
id: TF-TISCH-018
titel: Ein Doppeltipp auf „Ausführen“ spielt die Karte genau einmal.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O5-karten-spielen (PR #73)
grenzfall_von: TF-TISCH-013
---

## Worum es geht

Wer ungeduldig zweimal tippt, darf keine zweite Aktion auslösen, weder dieselbe noch die eines Knopfs, der nach dem ersten Tippen an dieselbe Stelle rückt.

## Bestanden, wenn

Nach Rot an das Ende deiner Schlange 1 und einem Doppelklick (Desktop) bzw. zwei schnellen Taps (Tablet quer) auf „Ausführen“ hältst du 4 Karten, deine Schlange 1 hat 2 Karten, im Zug ist genau eine Farbkarte gespielt, die Zugleiste sagt „Beende deinen Zug.“, und die Konsole bleibt ohne Fehler.

## Fehlgeschlagen, wenn

Zwei Karten sind gespielt, der Zug ist schon beendet, oder die Konsole meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright Chromium, Desktop 1280 × 900 und Tablet quer 1024 × 768 mit Touch, Stand ab Commit 27d85d3 |

## Testdaten

Adresse `/spiel?szenario=farbkarte-beim-gegner&tempo=sofort`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | | „Du bist dran“ |
| 2 | Deine Hand | „Farbkarte Rot, 1 Punkt“ antippen | | 6 Ziele markiert |
| 3 | Tisch | „Deine Schlange 1: Ende“ antippen | | Ansage, „Ausführen“ |
| 4 | Zugleiste | „Ausführen“ doppelt antippen | | eine Karte gespielt, „Beende deinen Zug.“ |

## Zurücksetzen

Browserkontext schliessen.
