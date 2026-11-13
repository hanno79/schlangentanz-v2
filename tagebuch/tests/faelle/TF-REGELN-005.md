---
id: TF-REGELN-005
titel: Jeder Satz aus dem Abschnitt einer Karte in Teil A erscheint auch in ihrem Kartentext.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/O9-regelhilfe (PR #37)
---

## Worum es geht

Ein Kartentext, der nur wörtliche Sätze enthält, kann trotzdem einen Satz weglassen. Fehlt etwa das Ergebnis eines Beispiels, versteht der Spieler das Beispiel nicht mehr. Bildzeilen wie „[Blau] [Rot]“ zählen dabei nicht als Satz.

## Bestanden, wenn

Für jede Sonderkarte (A7.1 bis A7.10), die Comeback-Karte (A8.1) und die Risiko-Belohnungs-Karte (A8.2) fehlt im Kartentext keine Textzeile des Abschnitts.

## Fehlgeschlagen, wenn

Eine Textzeile des Abschnitts fehlt, etwa „Ergebnis nach Anwendung der Schlangenhäutung“ samt Ergebnis in A7.9.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem geprüften Stand |

## Testdaten

Alle 12 Karten mit eigenem Abschnitt in A7 und A8.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `docs/GAME_SPEC.md`, A7.9 | Beispiele lesen | | Zeile „Ergebnis nach Anwendung der Schlangenhäutung“ |
| 2 | `/regeln`, Schlangenhäutung | Grossansicht öffnen, „Beispiele“ lesen | | steht das Ergebnis da? |

## Technische Prüfung

Ein vorübergehender Vitest-Test vergleicht jede Zeile von `abschnittA(quelle)` (ohne Bildzeilen) mit dem zusammengesetzten Kartentext und listet fehlende Zeilen.

## Nicht abgedeckte Grenzfälle

Farbkarten und Aufgaben haben keinen eigenen Abschnitt in Teil A; ihre Texte stammen aus A1, A5, A11 und der Tabelle in A9.
