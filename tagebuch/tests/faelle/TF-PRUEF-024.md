---
id: TF-PRUEF-024
titel: Jeder Eintrag der Ausnahmeliste für Handy quer lässt sich mit eigenen Messwerten nachvollziehen, und die betroffenen Bedienelemente erreicht man durch Scrollen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3c-fuenf-geraeteklassen (PR #32)
grenzfall_von: TF-PRUEF-020
---

## Worum es geht

Ein Eintrag in `tests/layout/geraeteklassen_ausnahmen.json` duldet einen roten Vertrag. Das ist nur vertretbar, wenn der Befund im Eintrag stimmt und das Bedienelement trotzdem erreichbar bleibt, etwa durch Scrollen. Dieser Fall misst jeden Befund in Handy quer (844×390, Touch) selbst nach.

## Bestanden, wenn

Für jeden Eintrag mit Klasse `handy-quer` liegt das genannte Bedienelement in der eigenen Messung an der genannten Stelle, auf wenige Pixel genau; eine andere Schrift kann die Lage um einige Pixel verschieben. Bei der Lupe ist das Bild höchstens 280 px breit. Auf keiner Seite gilt `scrollWidth > clientWidth`. Was unter dem Rand liegt, erscheint nach Scrollen der Seite oder ihres Scrollbereichs ganz im Bild.

## Fehlgeschlagen, wenn

Ein Element liegt deutlich anders als im Befund (mehr als etwa 20 px), die Lupe ist mindestens 280 px breit (dann ist der Eintrag wirkungslos), eine Seite scrollt waagrecht, oder ein gelistetes Bedienelement ist auch nach Scrollen nicht erreichbar.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild auf `http://localhost:4173/`, Testhook-Build auf `http://localhost:4174/` (Befehle in `docs/abnahme/PRUEFER_ANLEITUNG.md`, Schritt 7) |

## Testdaten

Die sechs Einträge der Liste. Kaputter Spielstand für den zweiten: Schlüssel `schlangentanz-v2:partie`, Wert `{"version":2,"kaputt":true}`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Playwright, Klasse `handy-quer` | Lobby öffnen, „Neue Partie“ tippen, zurück zur Lobby | `http://localhost:4173/` | „Weiterspielen“ ist da; „Neue Partie“ und „Regeln“ liegen laut `getBoundingClientRect()` wie im ersten Eintrag |
| 2 | derselbe Kontext, neu | Lobby öffnen, kaputten Spielstand setzen, neu laden | Testdaten | Hinweis „beschädigt“; „Neue Partie“ und „Regeln“ wie im zweiten Eintrag |
| 3 | neuer Kontext | Partie starten, Lobby, „Neue Partie“ tippen | | Rückfrage sichtbar; „Regeln“ wie im dritten Eintrag |
| 4 | neuer Kontext | Entwurfsübersicht öffnen | `http://localhost:4174/dev/entwurf` | das genannte Element schneidet den Rand des Scrollbereichs `div.entwurf` |
| 5 | neuer Kontext | Entwurfs-Lobby öffnen | `http://localhost:4174/dev/entwurf/lobby` | „Weiterspielen“ wie im fünften Eintrag |
| 6 | neuer Kontext | Entwurfstisch öffnen, „Aufgabe Farbenpracht“ tippen | `http://localhost:4174/dev/entwurf/tisch` | Bild in der Lupe unter 280 px breit |
| 7 | jede Seite | `scrollWidth` und `clientWidth` von `document.documentElement` lesen, danach scrollen | | gleich gross; die Elemente erscheinen nach Scrollen |
