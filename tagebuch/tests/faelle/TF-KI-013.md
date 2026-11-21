---
id: TF-KI-013
titel: Beendet die solide KI ihren Zug, gibt es keine weitere erlaubte Karte, die ihre Endwertung überhaupt erhöht, ohne einem Gegner Punkte zu bringen.
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

TF-KI-009 zählt nur Zugenden, bei denen eine liegen gebliebene Karte 3 oder mehr Punkte gebracht hätte. Der Orchestrator erwartet strenger, dass die KI gar keinen Punkt liegen lässt: Kein Zug endet, solange eine weitere Karte die eigene Endwertung um mindestens 1 erhöht und keinem Gegner nützt. Ob die KI eine solche Karte bewusst für später behalten darf, weil ihre Bewertung das Halten höher stellt, entscheidet ein Mensch.

## Bestanden, wenn

In den 33 Partien der Testdaten gibt es 0 Zugenden, nach denen eine andere erlaubte Karte die Endwertung der soliden KI erhöht hätte, ohne die Endwertung eines Gegners zu erhöhen.

## Fehlgeschlagen, wenn

Die Zählung grösser als 0 ist und der Autor das Halten der Karte nicht als gewollt bestätigt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K2-solide-ki`, `npm ci` gelaufen |

## Testdaten

33 Partien solide KI gegen Zufalls-KIs: zu zweit 8 ohne Erweiterung (Saaten 7101 bis 7108) und 4 mit (7151 bis 7154), zu dritt 7 ohne (7201 bis 7207) und 4 mit (7251 bis 7254), zu viert 6 ohne (7301 bis 7306) und 4 mit (7351 bis 7354). Sitz der soliden KI ist Saat modulo Spielerzahl, ihr Zufall `erzeugeZufall(Saat × 13 + 3)`, die Zufalls-KIs `erzeugeZufall(Saat × 7 + Sitz + 11)`.

## Technische Prüfung

Der Test der Suite in `solideKi_zugende.test.ts` zählt nur Karten, nach denen auch die Bewertung der KI steigt; er ist damit schwächer als dieser Testfall und bleibt grün. Gemessen wird deshalb mit der Prüferprobe: Die Probe `pruefer_k2_it2.test.ts` (Beleg) vorübergehend unter `tests/` ablegen, dazu `tests/pruefer_alt/` mit den drei Dateien aus `2fa5fdc`, und mit `PRUEFER_LOG=<datei> npx vitest run tests/pruefer_k2_it2.test.ts -t Turnier` ausführen. An jedem „ZugBeenden“ der soliden KI wendet sie jede andere angebotene Karte an, lässt gefragte Gegner durchlassen und vergleicht `berechneEndwertung` vorher und nachher. Erwartet in der Zeile „verschenkt“: 0.

## Nicht abgedeckte Grenzfälle

Karten, die erst zusammen mit einer zweiten Karte Punkte bringen, zählt die Probe nicht. Gegen Gegner, die abwehren, misst sie nicht; die Zufalls-KI lässt fast immer durch.
