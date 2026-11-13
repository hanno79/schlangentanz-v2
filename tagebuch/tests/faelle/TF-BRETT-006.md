---
id: TF-BRETT-006
titel: Mit zehn Handkarten bleibt jede Handkarte ganz im Bild und mindestens 44 px breit.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O4-spieltisch (PR #34)
grenzfall_von: TF-BRETT-001
---

## Worum es geht

Am Zugende kann die Hand mehr als fünf Karten haben, bevor du ablegst. Die Szenarien haben nur fünf. Mit zehn Karten soll keine angeschnitten sein und die Statuszeile das Ablegen ansagen.

## Bestanden, wenn

In allen fünf Klassen liegen zehn Handkarten ganz im Fenster (rechte Kante ≤ Fensterbreite, Unterkante ≤ Fensterhöhe), jede mindestens 44 px breit; `scrollWidth` gleich `clientWidth`; die Statuszeile sagt „Lege überzählige Handkarten ab.“

## Fehlgeschlagen, wenn

Eine Handkarte ragt über den Rand, ist schmaler als 44 px, oder die Seite scrollt waagrecht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright-Kontexte aller fünf Klassen |
| Ausgangslage | Szenario `neuePartie`, im gespeicherten JSON fünf Karten vom Nachziehstapel in die Hand des Menschen verschoben, `zug.abschnitt` = `Abwerfen` |

## Testdaten

Zehn Handkarten, Abschnitt Abwerfen.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | geänderten Spielstand legen, `/spiel` öffnen | | Titel „Deine Hand · 10 Karten“ |
| 2 | Konsole | Breite, rechte und untere Kante jeder Handkarte lesen | | alle im Fenster, ≥ 44 px |
| 3 | Tisch | Foto ansehen | | keine Karte angeschnitten |

## Zurücksetzen

Browserkontext schliessen.
