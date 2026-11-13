---
id: TF-DEV-013
titel: Auf dem Handy hochkant (390×844) sind die Wertungstabellen der drei Wertungsszenarien lesbar, ohne waagrecht zu scrollen.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/E10-wertung (PR #33)
grenzfall_von: TF-DEV-012
---

## Worum es geht

Die Wertungstabellen haben sechs Spalten. Auf einem schmalen Handy könnten sie über den Rand ragen oder Spaltenköpfe abschneiden.

## Bestanden, wenn

Bei 390×844 mit Touch ist auf `/dev?szenario=wertung-beispiele`, `/dev?szenario=wertung-beispiele-kette` und `/dev?szenario=wertung-joker` `document.documentElement.scrollWidth` gleich `clientWidth` (390), beide Tabellen sind nicht breiter als ihr Abschnitt, und jeder Spaltenkopf und jede Zahl ist ganz zu lesen.

## Fehlgeschlagen, wenn

`scrollWidth` grösser als 390 ist, eine Tabelle über ihren Abschnitt ragt oder ein Spaltenkopf oder eine Zahl abgeschnitten ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright-Kontext der Geräteklasse `handy-hochkant` aus `scripts/pruefung/geraeteklassen.mjs` |

## Testdaten

Die drei Adressen unter „Bestanden, wenn“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Playwright, Klasse handy-hochkant | Adresse öffnen, zum Abschnitt „Wertung“ scrollen | `/dev?szenario=wertung-joker` | `scrollWidth` 390, Tabelle Zwischenstand und Endwertung ganz sichtbar |
| 2 | Playwright, Klasse handy-hochkant | wie 1 | `/dev?szenario=wertung-beispiele` | wie 1 |
| 3 | Playwright, Klasse handy-hochkant | wie 1 | `/dev?szenario=wertung-beispiele-kette` | wie 1, Striche „–“ für Vielfalt und Aufgaben |
