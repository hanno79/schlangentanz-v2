---
id: TF-KI-014
titel: Lässt die solide KI eine mögliche Dreiergruppe liegen, ist ihr Zug strikt besser bewertet als jede Vollendung samt bester zweiter Karte, auch auf Saaten ausserhalb der Testsuite.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ki/strategien/solideKi.test.ts
aenderung: task/K2-solide-ki (PR #71)
grenzfall_von: TF-KI-009
---

## Worum es geht

Kriterium 1 von K2 in der Fassung des Orchestrators vom 21.11.2026: Kann die solide KI zu Beginn ihres Zuges mit einer Handkarte eine Dreiergruppe vollenden, muss sie es tun. Ausgenommen ist nur ein Zug, den ihre eigene Bewertung strikt höher stellt als jede Vollendung, zusammen mit der besten zweiten Karte desselben Zuges. Die Bewertung schliesst den Kettenbonus ein. Ein Gleichstand reicht nicht. Der Test der Suite prüft das auf seinen Saaten. Dieser Testfall prüft dieselbe Regel auf Saaten, die die Suite nicht kennt.

## Bestanden, wenn

In allen Partien der Testdaten gibt es 0 Züge, in denen die KI keine Gruppe vollendet und ihr Stand beim ersten „ZugBeenden“ nicht strikt höher bewertet ist als die beste Vollendung samt zweiter Karte. Nicht gezählt werden Züge, in denen ein Gegner die erste Karte der KI mit Farbenschutz abwehrt. Dort zählt die Bewertung, die die KI beim Entscheiden vor sich hatte.

## Fehlgeschlagen, wenn

Mindestens ein solcher Zug ohne Abwehr übrig bleibt, auch bei gleicher Bewertung (Differenz 0).

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K2-solide-ki`, `npm ci` gelaufen |

## Testdaten

36 Partien solide KI gegen Zufalls-KIs: je 6 mit 2, 3 und 4 Spielern ohne und mit Erweiterung, Saat 8600 + 100 × Spielerzahl + 50 (mit Erweiterung) + 0 bis 5. Sitz der soliden KI ist Saat × 7 modulo Spielerzahl, ihr Zufall `erzeugeZufall(Saat × 101 + 7)`, die Zufalls-KIs `erzeugeZufall(Saat × 53 + Sitz + 3)`. Dazu die 33 Partien aus TF-KI-013.

## Technische Prüfung

Die Probe `pruefer_k2_it3.test.ts` aus dem Beleg vorübergehend unter `tests/` ablegen und mit `PRUEFER_LOG=<datei> npx vitest run tests/pruefer_k2_it3.test.ts -t "eigenes Turnier"` ausführen. In der Ausgabe stehen die Zeile „K2.1: geprüft …, davon nicht strikt besser bewertet …“ und je Ausnahme eine Zeile „K2.1 ok“ oder „K2.1 VERSTOSS“. Jede Zeile „VERSTOSS“ wird mit `pruefer_k2_it3_diag.test.ts` nachgespielt: Steht dort im Zug der KI „Abgewehrt“, zählt der Fall nicht.

## Nicht abgedeckte Grenzfälle

Gegner, die gezielt abwehren, kommen nicht vor; die Zufalls-KI wehrt nur zufällig ab. Eine Vollendung, die erst mit zwei Karten entsteht, zählt nicht als Vollendung mit einer Handkarte. Dass eine Häutung die Zahl der Gruppen erhöht, ohne Punkte zu bringen, zählt die Probe als Vollendung mit.
