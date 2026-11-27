---
id: TF-TISCH-054
titel: Die Comeback-Karte lässt sich einsetzen, heisst danach „verbraucht“, und die Statuszeile zeigt, wie viele Zusatzaktionen noch übrig sind.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: ja
aenderung: task/O10-erweiterung-tisch (PR #124)
---

## Worum es geht

Liegt der Mensch zu Zugbeginn mindestens fünf Karten zurück, bietet die Zugleiste „Comeback einsetzen“ an. Danach hat er zwei Zusatzaktionen (A8.1). Geprüft werden der Einsatz, die Anzeige in der Auslage und die Zahl in der Statuszeile, nachdem Zusatzaktionen verbraucht sind.

## Bestanden, wenn

Vor dem Einsatz steht unter der Comeback-Karte „einsetzbar“. Nach „Comeback einsetzen“ und „Ausführen“ steht dort „verbraucht“, die Statuszeile „2 Zusatzaktionen“ und die Zugleiste „2 abwerfen, 3 ziehen“. Nach einer verbrauchten Zusatzaktion sagt die Statuszeile „1 Zusatzaktion“, nach zwei nennt sie keine Zusatzaktion mehr.

## Fehlgeschlagen, wenn

„einsetzbar“ fehlt vor dem Einsatz oder steht danach noch da, oder die Statuszeile nennt nach verbrauchten Zusatzaktionen weiter „2 Zusatzaktionen“.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 4ad16f8 |

## Testdaten

Szenario `comeback-bedingung`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=comeback-bedingung&tempo=sofort` | „einsetzbar“ in der Auslage, Knopf „Comeback einsetzen“ |
| 2 | Zugleiste | „Comeback einsetzen“, „Ausführen“ | | „verbraucht“, Statuszeile „2 Zusatzaktionen“ |
| 3 | Zugleiste, Hand | „2 abwerfen, 3 ziehen“, zwei Sonderkarten antippen, „Ausführen“ | | Statuszeile „1 Zusatzaktion“ |
| 4 | Zugleiste, Hand | noch einmal „2 abwerfen, 3 ziehen“, zwei Karten, „Ausführen“ | | Knopf „2 abwerfen, 3 ziehen“ weg, Statuszeile ohne Zusatzaktion |

## Zurücksetzen

Das Szenario setzt den Stand neu.

## Nicht abgedeckte Grenzfälle

Rückstand von genau vier Karten (`comeback-rueckstand-4`) und die Comeback-Karte nach einem Verdoppler (`comeback-verdoppler`) sind nicht im Browser geprüft; beide prüfen Unit-Tests.
