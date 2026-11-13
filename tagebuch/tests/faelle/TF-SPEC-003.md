---
id: TF-SPEC-003
titel: Wird der Regelinhalt einer Antwort in Teil D verfälscht, schlagen die P0.5-Tests fehl.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.5-regelfragen (PR #25)
grenzfall_von: TF-SPEC-001
---

## Worum es geht

Teil D ist die Vorlage für die Engine. Die Tests sollen nicht nur das Vorhandensein einer Antwort, sondern ihren Inhalt festhalten, sonst kann eine spätere Änderung die Regel unbemerkt umkehren.

## Bestanden, wenn

Jede Verfälschung unten führt einzeln zu Exit ungleich 0 bei `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts`.

## Fehlgeschlagen, wenn

Mindestens eine Verfälschung bleibt grün (Exit 0).

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `git status --short` leer |

## Testdaten

Je Zeile eine Verfälschung; „ersetzt durch“ gilt für `docs/GAME_SPEC.md` Teil D, wo nichts anderes steht.

- D14 „Zwei Züge: Jede Schlangengrube kostet einen eigenen Zug und bleibt vor ihm liegen, bis er für sie ausgesetzt hat.“ ersetzt durch „Ein Zug: Die zweite Schlangengrube hat keine weitere Wirkung; beide gehen nach dem ausgesetzten Zug auf den Ablagestapel.“
- D24 „Eine Kette zählt erst ab 3 Farbkarten derselben Farbe nebeneinander, nicht schon ab 2;“ ersetzt durch „Eine Kette zählt schon ab 2 Farbkarten derselben Farbe nebeneinander;“ (Wortlaut des Autors bleibt stehen)
- D29 „Ja, erlaubt: Die Grube darf ihn treffen und geht ohne Wirkung auf den Ablagestapel.“ ersetzt durch „Nein: kein Ziel; die Grube wird für ihn nicht angeboten.“ (Wortlaut bleibt stehen)
- F13 in `docs/REGELFRAGEN.md` „**Antwort:** a. Vorschlag übernommen …“ ersetzt durch „**Antwort:** b. Abweichung vom Vorschlag, Wortlaut des Autors: „die Reihenfolge darf gleich bleiben“. Teil D: D26.“ und D26 passend dazu „Nein, die Reihenfolge darf gleich bleiben. Wortlaut: „die Reihenfolge darf gleich bleiben“. Website folgt.“
- F2 in `docs/REGELFRAGEN.md` auf „b“ mit Zitat „nein“, D15 passend dazu „Nein, je Karte ein Farbenschutz …“
- D18 „Kein Auffüllen im ausgesetzten Zug; er füllt erst zu Beginn seines nächsten gespielten Zuges auf.“ ersetzt durch „Er füllt zu Beginn des ausgesetzten Zuges auf 5 auf, spielt aber nichts.“
- D25 „Nein. Wirkungslos ablegen geht nur, wenn die Karte kein mögliches Ziel hat; …“ ersetzt durch „Ja. Jede Sonderkarte darf jederzeit wirkungslos abgelegt werden, auch mit möglichem Ziel; …“
- die Zeile D22 aus Teil D gelöscht

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | eine Verfälschung aus „Testdaten“ eintragen | | nur die genannten Zeilen geändert |
| 2 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts; echo $?` | Exit ungleich 0 |
| 3 | dieselbe Konsole | zurücksetzen | `git checkout -- docs/GAME_SPEC.md docs/REGELFRAGEN.md` | `git status --short` leer |

## Nicht abgedeckte Grenzfälle

Die Abschriften der Antworten ausserhalb von Teil D und `docs/REGELFRAGEN.md` (Spalte „Antwort“ in Abschnitt 9 des Umsetzungsplans, E10 Kriterium 5, Teil C) halten die Tests nicht fest; eine Verfälschung dort bleibt grün. Regelquelle ist nach Plan 2.1 nur Teil D.
