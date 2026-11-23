---
id: TF-TISCH-039
titel: Wird eine KI angegriffen, vergeht bis zu ihrer Entscheidung gleich viel Zeit und der Tisch zeigt dasselbe, ob sie einen Farbenschutz hält oder nicht.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-22
veraendert_daten: nein
aenderung: task/O6-gegnerzuege (PR #79)
---

## Worum es geht

Würde eine KI mit Farbenschutz länger überlegen oder anders angezeigt, verriete der Tisch eine verdeckte Handkarte (B2, D33). Die Pause muss deshalb in beiden Fällen gleich sein, und nur eine echte Abwehr darf als Abwehr erscheinen.

## Bestanden, wenn

In je mindestens 8 Läufen liegt die Zeit vom Speichern der Ansage bis zum Speichern der Entscheidung in beiden Fällen im selben Bereich (Abweichung der Mittelwerte unter 5 ms, normale Pause etwa 700 ms). Während der Pause sind Statuszeile, Zugleiste, Protokoll und Gegnerbereich Zeichen für Zeichen gleich. Im Protokoll steht danach „… lässt … durch.“ oder „… wehrt … mit Farbenschutz ab.“, je nachdem, was die KI tatsächlich getan hat.

## Fehlgeschlagen, wenn

Die Zeiten der beiden Fälle unterscheiden sich sichtbar, der Tisch zeigt während der Pause einen Unterschied, oder eine Abwehr erscheint, obwohl die KI durchgelassen hat.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit fde8e51, Desktop 1280 × 900 |

## Testdaten

Szenarien `ki-angriff-mit-schutz` und `ki-angriff-ohne-schutz` (KI-Gegner 1 legt eine Blockade in die Schlange von KI-Gegner 2), dazu `blockade-abwehr`: du legst die Blockade bei KI-Gegner 1; für den Fall ohne Schutz wird dessen Farbenschutz vor dem Zug gegen eine Farbkarte des Stapels getauscht.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=ki-angriff-mit-schutz` | „KI-Gegner 2 entscheidet, ob abgewehrt wird.“ |
| 2 | Tisch | Zeit bis zum ersten Protokolleintrag stoppen | | etwa 0,7 s nach dem Aufbau des Tischs |
| 3 | Browser | dasselbe mit `ki-angriff-ohne-schutz` | | gleiche Zeit, gleiches Bild während der Pause |
| 4 | Deine Hand | in `blockade-abwehr` Schlangenblockade, „KI-Gegner 1, Schlange 1 wählen“, „zwischen Karte 1 und 2“, „Ausführen“ | | gleiche Zeit mit und ohne Farbenschutz bei KI-Gegner 1 |

## Technische Prüfung

Das Prüferskript zeichnet jedes `localStorage.setItem` auf den Spielstand mit `performance.now()` auf und nimmt den Abstand der beiden Speicherungen, 8 Läufe je Fall, mit und ohne „weniger Bewegung“.

## Nicht abgedeckte Grenzfälle

Mit „weniger Bewegung“ ist die Pause 0; dann bleibt die Rechenzeit der KI als Unterschied von gut 1 ms, die man nicht sehen kann. „Schneller“ (250 ms) ist in ganzen Partien gemessen, nicht in diesen Szenarien, weil der Knopf erst während der Pause erscheint.
