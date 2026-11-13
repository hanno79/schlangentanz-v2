---
id: TF-DEV-007
titel: Auf dem Handy hochkant (390×844) passt der Entwicklertisch in die Breite, ohne waagrecht zu scrollen.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.4-entwicklertisch (PR #27)
grenzfall_von: TF-DEV-002
---

## Worum es geht

Prüfer sollen den Tisch in allen drei Geräteklassen bedienen können. Ragt die Seite auf dem Handy über den Rand, sind Texte am rechten Rand abgeschnitten, bis man waagrecht scrollt.

## Bestanden, wenn

Bei 390×844 mit Touch ist `document.documentElement.scrollWidth` gleich `clientWidth` (390) auf `/dev?seed=1&spieler=2`, `/dev?seed=7&spieler=4` und `/dev/szenarien`; kein Text endet abgeschnitten am rechten Rand.

## Fehlgeschlagen, wenn

`scrollWidth` grösser als 390 ist oder Texte am rechten Rand abgeschnitten sind.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174, Playwright-Kontext der Geräteklasse `handy-hochkant` aus `scripts/pruefung/geraeteklassen.mjs` |

## Testdaten

Die drei Adressen unter „Bestanden, wenn“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Playwright, Klasse `handy-hochkant` | Adresse öffnen | `/dev?seed=1&spieler=2` | `scrollWidth` 390, Hinweistext ganz sichtbar |
| 2 | Playwright, Klasse `handy-hochkant` | Adresse öffnen | `/dev/szenarien` | Tabelle passt in 390 px |
| 3 | Playwright, Klasse `handy-quer` (844×390) | Adresse öffnen | `/dev?seed=1&spieler=2` | `scrollWidth` 844 |
