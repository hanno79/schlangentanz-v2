---
id: TF-DEV-012
titel: Die Wertungsszenarien am Entwicklertisch zeigen Zwischenstand, Endwertung und Aufschlüsselung mit den von Hand nachgerechneten Zahlen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/E10-wertung (PR #33)
---

## Worum es geht

Am Entwicklertisch soll man jede Zahl der Wertung ablesen und von Hand nachrechnen können. Die drei Szenarien legen die Rechenbeispiele der Website und knifflige Jokerfälle aus.

## Bestanden, wenn

Im Abschnitt „Wertung“ stehen: bei `wertung-beispiele` die Endwertung 10, 12, 28, 6 und „Gewonnen: KI-Gegner 2 (28)“; bei `wertung-beispiele-kette` 12, 12, 4 und „Gewonnen: Spieler 1 (12), KI-Gegner 1 (12)“; bei `wertung-joker` der Zwischenstand 15, 14, 0, 55 (Kette „–“) und die Endwertung 20, 19, 0, 60. Die Aufschlüsselung nennt die Gruppen je Schlange, die Farbe jedes Jokers, den Vielfaltbonus, die Kette und die Aufgaben. Keine Konsolenfehler.

## Fehlgeschlagen, wenn

Eine Zahl von den nachgerechneten Werten abweicht, ein Joker eine andere Farbe hat, die Kette im Zwischenstand steht oder die Seite einen Fehler zeigt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), Vorschau mit `vite preview --outDir dist-testhooks`, Fenster 1280×900 |

## Testdaten

Die Szenarien `wertung-beispiele`, `wertung-beispiele-kette` und `wertung-joker` aus `/dev/szenarien`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev/szenarien` | Link `wertung-beispiele` anklicken | | Tisch lädt, keine rote Invariante |
| 2 | Abschnitt „Wertung“ | Tabellen und Aufschlüsselung lesen | | Endwertung 10, 12, 28, 6; Schlangen 6 und 4, 7, 15 und 11, 2 und 4 |
| 3 | `/dev/szenarien` | Link `wertung-beispiele-kette` anklicken | | Endwertung 12, 12, 4, zwei Gewinner |
| 4 | `/dev/szenarien` | Link `wertung-joker` anklicken | | Zwischenstand 15, 14, 0, 55; Endwertung 20, 19, 0, 60; Regenbogenschlange als Rot, Fusion als Blau |

## Nicht abgedeckte Grenzfälle

Die Lesbarkeit auf dem Handy hochkant hat einen eigenen Testfall (TF-DEV-013). Eine Partie, die mit echten Zügen bis zur Wertung gespielt wird, ist erst ab E2 möglich; bis dahin legen nur die Szenarien Schlangen aus.
