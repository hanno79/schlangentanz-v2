---
id: TF-TISCH-045
titel: Endet die Partie nach einer Aktion mit der Tastatur, steht der Fokus auf der Wertung, und das Spielende wird vorgelesen.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: ja
aenderung: task/O11-barrierefreiheit (PR #121)
grenzfall_von: TF-TISCH-044
---

## Worum es geht

Beim Spielende ersetzt die Wertung den Tisch. Der Knopf, den man eben gedrückt hat („Zug beenden“), verschwindet dabei. Wer mit Tastatur oder Bildschirmleser spielt, muss danach erfahren, dass die Partie vorbei ist, und ohne Umweg weiterbedienen können.

## Bestanden, wenn

Nach dem letzten Zug steht der Fokus sichtbar auf einem Element der Wertung (etwa ihrem Titel, „Noch einmal“ oder „Zur Lobby“), und ein vorlesender Bereich oder das Element mit Fokus nennt das Ergebnis, etwa „Gleichstand: Du und KI-Gegner 1 gewinnen!“.

## Fehlgeschlagen, wenn

Nach dem letzten Zug steht der Fokus auf der leeren Seite (`document.activeElement` ist `body`), oder nichts liest das Spielende vor.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 5634c28 |

## Testdaten

Szenario `schlussrunde-2`: Du bist in der Schlussrunde dran, danach spielt KI-Gegner 1 seinen letzten Zug.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=schlussrunde-2&tempo=sofort` | „Du bist dran“, Abzeichen „Schlussrunde“ |
| 2 | „Deine Hand“ | Tab bis „Farbkarte Grün, 3 Punkte“, Enter | | Karte gedrückt |
| 3 | Ziele | Umschalt+Tab bis „Neue Schlange“, Enter; Umschalt+Tab bis „Ausführen“, Enter | | Fokus auf „Zug beenden“ |
| 4 | Zugleiste | Enter | | KI-Gegner 1 spielt, die Wertung erscheint |
| 5 | Konsole | `document.activeElement` lesen | | ein Element der Wertung, nicht `body` |
| 6 | Seitenbaum | vorlesende Bereiche (`aria-live`, `role="status"`, `role="alert"`) lesen | | einer nennt das Ergebnis |

## Zurücksetzen

Ein frischer Browserkontext oder ein neues Szenario setzt den Stand zurück.

## Nicht abgedeckte Grenzfälle

Spielende durch einen Gegnerzug, während der Fokus auf „Schneller“ steht: Auch dieser Knopf verschwindet mit dem Tisch; nicht eigens geprüft, gleiche Ursache.
