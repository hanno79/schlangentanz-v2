---
id: TF-KI-009
titel: In Partien gegen die Zufalls-KI gewinnt die solide KI fast immer und lässt keinen Zug liegen, der ihre eigenen Punkte ohne Nutzen für einen Gegner erhöht.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ki/strategien/solideKi.test.ts
aenderung: task/K2-solide-ki (PR #71)
---

## Worum es geht

Der Autor verlangt, dass die KI ernsthaft zu gewinnen versucht und Züge meidet, die nichts bringen. Geprüft wird das in ganzen Partien gegen die Zufalls-KI mit 2, 3 und 4 Spielern: Siegquote, Punkte und jede Entscheidung, die eine Vorgabe verletzt oder Punkte verschenkt.

## Bestanden, wenn

Die solide KI gewinnt mindestens 80 % der Partien. Sie legt keine Karte wirkungslos ab, wenn es einen anderen erlaubten Zug gibt, spielt keine Schlangengrube ohne Wirkung und keine Farbenfusion, nach der ihre Endwertung mit Kettenbonus sinkt. Beendet sie einen Zug, gibt es keine weitere erlaubte Karte, die ihre Endwertung um 3 oder mehr Punkte erhöht, ohne einem Gegner Punkte zu bringen.

## Fehlgeschlagen, wenn

Eine dieser Zählungen grösser als 0 ist, etwa ein Zugende, nach dem ein Schlangenfrass auf die eigene Schlange 9 Punkte gebracht hätte, oder die Siegquote unter 80 % liegt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K2-solide-ki`, `npm ci` gelaufen |

## Testdaten

32 Partien ohne Erweiterung: 12 zu zweit (Saaten 9100 bis 9111), 10 zu dritt (9200 bis 9209), 10 zu viert (9300 bis 9309); Sitz der soliden KI ist Saat modulo Spielerzahl, KI-Zufall aus Saat × 17 + 999.

## Technische Prüfung

`npx vitest run src/ki/strategien/solideKi.test.ts` endet mit Exit 0. Die eigene Probe ist dieselbe Datei wie bei TF-KI-008 (`tests/pruefer_k2.test.ts`, Test „Turnier solide gegen Zufall“); die Diagnose einzelner Züge steht in `pruefer_k2_diag.test.ts` im Beleg.

## Nicht abgedeckte Grenzfälle

Partien mit Erweiterung prüft die Probe nur mit 6 Partien. Gegen eine stärkere Gegnerin als die Zufalls-KI misst erst K5.
