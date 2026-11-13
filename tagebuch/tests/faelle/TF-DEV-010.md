---
id: TF-DEV-010
titel: Auch auf einem sehr schmalen Handy (320 px) passt der Entwicklertisch in die Breite.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.4-entwicklertisch (PR #27, Iteration 2)
grenzfall_von: TF-DEV-002
---

## Worum es geht

Die Geräteklasse Handy der Abnahme ist 390 px breit. Ältere oder kleine Handys haben 320 px. Der Testfall hält fest, ob der Tisch dort ohne waagrechtes Scrollen lesbar bleibt; ob 320 px gefordert sind, entscheidet der Orchestrator.

## Bestanden, wenn

Bei 320×640 mit Touch ist `document.documentElement.scrollWidth` gleich 320 auf `/dev?seed=7&spieler=4`, `/dev?szenario=spielende`, `/dev/szenarien` und `/dev`.

## Fehlgeschlagen, wenn

`scrollWidth` grösser als 320 ist; dann das Element nennen, das rechts hinausragt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174, Playwright-Kontext 320×640, `hasTouch`, `isMobile`, `deviceScaleFactor` 1 |

## Testdaten

Die vier Adressen unter „Bestanden, wenn“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Playwright 320×640 | Adresse öffnen, `scrollWidth` lesen | `/dev?seed=7&spieler=4` | 320 |
| 2 | Playwright 320×640 | Adresse öffnen, `scrollWidth` lesen | `/dev?szenario=spielende` | 320, Wertungstabelle ganz sichtbar |
| 3 | Playwright 320×640 | Adresse öffnen, `scrollWidth` lesen | `/dev/szenarien` | 320, je Szenario eine Karte |
| 4 | Playwright 320×640 | Adresse öffnen, `scrollWidth` lesen | `/dev` | 320 |
