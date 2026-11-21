---
id: TF-KI-015
titel: Beendet die solide KI ihren Zug, liegt keine Karte mehr auf der Hand, die ihre Endwertung hebt, keinem Gegner nützt und nicht schlechter bewertet ist als das Halten.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ki/strategien/solideKi_zugende.test.ts
aenderung: task/K2-solide-ki (PR #71)
grenzfall_von: TF-KI-009
---

## Worum es geht

TF-KI-013 zählt jede liegen gelassene Karte, die Punkte gebracht hätte. Der Orchestrator hat am 21.11.2026 entschieden: Stellt die Bewertung der KI das Halten höher, ist das ein legitimer Spielzug. Sind Spielen und Halten gleich bewertet, muss der Zug mit dem sicheren Punkt gewinnen. Dieser Testfall prüft genau diese Fassung, auf Saaten ausserhalb der Testsuite.

## Bestanden, wenn

In allen Partien der Testdaten gibt es 0 Zugenden, nach denen eine andere erlaubte Karte die Endwertung der KI um mindestens 1 erhöht hätte, ohne die Endwertung eines Gegners zu erhöhen, und deren Bewertung nicht unter der des Haltens liegt (Abstand höchstens 1e-9).

## Fehlgeschlagen, wenn

Die Zählung grösser als 0 ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K2-solide-ki`, `npm ci` gelaufen |

## Testdaten

Die 36 Partien aus TF-KI-014 und die 33 Partien aus TF-KI-013.

## Technische Prüfung

Die Probe `pruefer_k2_it3.test.ts` aus dem Beleg vorübergehend unter `tests/` ablegen und mit `PRUEFER_LOG=<datei> npx vitest run tests/pruefer_k2_it3.test.ts -t "eigenes Turnier"` ausführen. An jedem „ZugBeenden“ der soliden KI wendet sie jede andere angebotene Karte an, lässt gefragte Gegner durchlassen und vergleicht `berechneEndwertung` und `bewerte`. Erwartet in der Zeile „VERSCHENKT“: 0. Die Zeile „Halten höher bewertet“ ist Auskunft, kein Fehler.

## Nicht abgedeckte Grenzfälle

Karten, die erst zusammen mit einer zweiten Karte Punkte bringen, zählt die Probe nicht. Gegen Gegner, die gezielt abwehren, misst sie nicht.
