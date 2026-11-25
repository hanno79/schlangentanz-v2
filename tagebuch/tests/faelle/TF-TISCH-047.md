---
id: TF-TISCH-047
titel: Am Tisch, in der Lobby und in der Wertung hat jeder lesbare Text mindestens 4,5 : 1 Kontrast, und axe meldet nichts Schweres.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
aenderung: task/O11-barrierefreiheit (PR #121)
---

## Worum es geht

Texte müssen sich genug vom Hintergrund abheben (WCAG 1.4.3: mindestens 4,5 : 1). axe-core prüft dazu Namen, Rollen und weitere Regeln. Gemessen wird selbst, mit der Deckkraft aller Vorfahren, an Stellen, die leicht zu blass geraten: Grund neben einem gesperrten Knopf, Hinweise, Bereichstitel, Abzeichen.

## Bestanden, wenn

An jeder gemessenen Stelle mit bedienbarem oder reinem Text liegt das Verhältnis bei mindestens 4,5 : 1, und axe meldet in Lobby, Tisch am Zug, Karte gewählt, Häutung ordnen, Abwehrfrage, Dialog „Zu viele Handkarten“ und Wertung keinen Befund der Stufe „serious“ oder „critical“.

## Fehlgeschlagen, wenn

Ein lesbarer Text liegt unter 4,5 : 1, oder axe meldet einen Befund der Stufe „serious“ oder „critical“.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (Lobby) und Testhook-Build (Tisch), Stand ab Commit 5634c28 |

## Testdaten

Szenarien `farbkarte-beim-gegner`, `haeutung-punkte`, `angriff-auf-dich`, `schlussrunde-2`, `zu-viele-handkarten`, `wertung-beispiele`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby `/` | axe laufen lassen, Kontrast von Untertitel, gewähltem Segment und „Aus“ messen | | keine schweren Befunde, alle ≥ 4,5 |
| 2 | Tisch, jedes Szenario | axe laufen lassen; Kontrast von Statuszeile, Grund, Bereichstitel, Protokoll, Satz der Zugleiste, „Ansehen“, Abwehrhinweis, Abzeichen „Schlussrunde“ messen | | keine schweren Befunde, alle ≥ 4,5 |
| 3 | Tisch | Kontrast der gesperrten Knöpfe messen (halbe Deckkraft) | | nur festhalten, siehe unten |

## Technische Prüfung

Kontrast nach WCAG 2.1 aus `getComputedStyle`: Textfarbe mit der Deckkraft aller Vorfahren über die erste deckende Hintergrundfarbe gemischt. axe über `@axe-core/playwright` mit den Standardregeln.

## Nicht abgedeckte Grenzfälle

Gesperrte Knöpfe (halbe Deckkraft) liegen bei etwa 2,4 : 1. WCAG 1.4.3 nimmt inaktive Bedienelemente vom Kontrast aus; der Lauf hält die Werte fest, wertet sie aber nicht. Text über Verläufen und auf Kartenbildern ist nicht messbar.
