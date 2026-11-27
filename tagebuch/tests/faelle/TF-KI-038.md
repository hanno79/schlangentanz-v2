---
id: TF-KI-038
titel: Unter /spiel spielt die solide KI eine Partie mit Erweiterung bis zur Wertung, setzt Karten der Erweiterung nachvollziehbar ein und braucht für keinen Zug spürbar lange.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
aenderung: task/K4-ki-erweiterung (PR #125)
---

## Worum es geht

Die Szenarien zeigen einzelne Entscheidungen. Ob die KI in einer echten Partie mit Erweiterung vernünftig spielt, sieht man erst am Spieltisch: wann sie Comeback-Karte, Risiko-Karten, Schlangenkorb und Schlangenhäutung einsetzt, wie sie Aufgaben verfolgt und wie sie wählt, wenn eine misslungene Risiko-Karte ihr eine Ersatzbelohnung bringt.

## Bestanden, wenn

Die Partie läuft ohne Fehlermeldung bis zur Wertung. Kein Zug der KI dauert länger als etwa zwei Sekunden, und sie bleibt nie stehen. Das Protokoll zeigt keinen offensichtlich sinnlosen Zug: keine Risiko-Karte im ersten Zug ohne erkennbaren Zweck, keine Häutung, die eine eigene Gruppe zerstört, ohne dafür eine Aufgabe zu erfüllen, kein Comeback, nach dem sie nichts ausspielt. Die Konsole zeigt keine Fehler. Ob die Züge insgesamt plausibel sind, beurteilt ein Mensch anhand des Protokolls.

## Fehlgeschlagen, wenn

Die KI bleibt stehen, die Seite meldet einen Fehler, ein Zug dauert mehrere Sekunden, oder das Protokoll zeigt einen Zug, der ihr nachweislich schadet, ohne etwas zu bringen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Entwicklungsserver aus dem Worktree, `npx vite --port 4297 --strictPort` |
| Ausgangslage prüfen | `http://localhost:4297/` zeigt die Lobby; localStorage leer |

## Testdaten

Lobby: 1 Gegner (solide KI), Erweiterung an.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | Erweiterung einschalten, „Neue Partie“ klicken |  | Spieltisch mit offenen Aufgaben, Comeback- und zwei Risiko-Karten je Spieler |
| 2 | Spieltisch | eigenen Zug spielen: Karte wählen, Ziel wählen, „Ausführen“, „Zug beenden“; bei einer Ansage „Durchlassen“ oder abwehren |  | KI-Gegner 1 ist dran und spielt seinen Zug |
| 3 | Protokoll | Einträge des KI-Gegners lesen |  | welche Karten er spielt, ob er Erweiterungskarten einsetzt und wofür |
| 4 | Spieltisch | Schritte 2 und 3 bis zur Wertung wiederholen |  | Wertung erscheint, keine Fehlermeldung |
| 5 | Konsole des Browsers | Fehler lesen |  | keine Fehler aus der Partie |

## Nicht abgedeckte Grenzfälle

Partien mit 2 und 3 Gegnern laufen nur in den automatischen Partietests und im Stärkenachweis. Touch-Geräte entfallen, weil K4 keine Oberfläche ändert.
