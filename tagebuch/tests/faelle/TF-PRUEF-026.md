---
id: TF-PRUEF-026
titel: Die Wächter melden auch Segmente unter dem Bildrand und ein zugedecktes Schalter-Label der Lobby.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/O2b-lobby-flach (PR #35)
grenzfall_von: TF-PRUEF-025
---

## Worum es geht

TF-PRUEF-025 schiebt den Schalter unter den Bildrand. Hier geht es um die beiden anderen Fälle derselben Lücke: Die Segmente 1, 2 und 3 rutschen unter den Rand, oder das Label des Schalters liegt hinter seiner Fläche, wo kein Finger es trifft. Beide Wächter sollen das melden, obwohl Radio und Kästchen nur 1 × 1 px gross sind.

## Bestanden, wenn

Mit `.lobby__segment { position: relative; top: 400px; }` sind in `handy-quer` die Verträge „kein Bedienelement liegt außerhalb des Bildes“ rot und nennen „1 Gegner“, „2 Gegner“ und „3 Gegner“. Mit `.lobby__schalter { position: relative; z-index: -1; }` sind die Verträge „kein Bedienelement ist vollständig verdeckt“ rot und nennen „Mit Erweiterung“.

## Fehlgeschlagen, wenn

Einer der beiden Läufe endet mit Exit 0, oder die roten Verträge nennen ein anderes Element.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab O2b Iteration 2, Ports 4173 und 4174 frei |
| Ausgangslage | `git status` leer |

## Testdaten

Je eine Zeile CSS am Ende von `src/ui/lobby/lobby-seite.css`, nacheinander, nie beide zugleich:

- `.lobby__segment { position: relative; top: 400px; }`
- `.lobby__schalter { position: relative; z-index: -1; }`

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole | erste Zeile anhängen | | |
| 2 | Konsole | Lobby-Verträge in Handy quer laufen lassen | `npx playwright test tests/layout/lobby.spec.ts --project=handy-quer` | Exit 1, „lobby__segment "1 Gegner" — liegt bei …“ |
| 3 | Konsole | Datei zurücksetzen, zweite Zeile anhängen | `git checkout -- src/ui/lobby/lobby-seite.css` | |
| 4 | Konsole | dieselben Verträge laufen lassen | wie Schritt 2 | Exit 1, „lobby__schalter "Mit ErweiterungAus" — an keiner Stelle frei“ |

## Zurücksetzen

`git checkout -- src/ui/lobby/lobby-seite.css`, danach `git status` leer.
