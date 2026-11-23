---
id: TF-SPEC-026
titel: Nach X2b und X2c sind C21 und C23 aus Teil C gestrichen, C10 und C14 nennen den Stand bis X2a mit vorhandenen Fundstellen, und B1 führt nur noch die fünf Aufgaben aus X2a als Platzhalter.
art: beides
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: tests/spec_documentation_teil_b_c.test.ts
aenderung: task/P0.5g-antworten-x2-x3 (PR #110)
---

## Worum es geht

Teil C listet, wo die Engine noch von der Website abweicht, B1 sagt, was von der Erweiterung umgesetzt ist. X2b (#106) und X2c (#109) sind gemergt und haben zehn Aufgaben gebaut, X2a (#107) ist noch offen. Streicht die Doku zu viel, sieht niemand mehr, was X2a noch beheben muss; streicht sie zu wenig, plant der nächste Task gegen einen alten Stand.

## Bestanden, wenn

Teil C führt C21 und C23 nicht mehr, die Zeile „Behoben und gestrichen“ nennt „C21 und C23 (X2b, 23.11.2026)“ und „C10 teilweise (X2b, X2c, 23.11.2026)“. C10 und C14 stehen weiter in der Tabelle, sagen, dass die fünf Aufgaben aus X2a noch Platzhalter sind, und jede Fundstelle in Teil C nennt eine Datei, die es im Repo gibt. Das deckt sich mit `docs/abnahme/X2b.md` („C10 (für diese fünf Aufgaben), C21 und C23 sind damit belegt behoben“) und `docs/abnahme/X2c.md` („C10 teilweise“). In `src/engine/aufgaben/` sind genau Farbenpracht, Farbharmonie, Farbkombination, Gelber Schatz und Lila Riese mit `platzhalterAufgabe` angelegt, und B1 nennt genau diese fünf als Platzhalter. `npx vitest run tests/spec_documentation_teil_b_c.test.ts` endet mit 0.

## Fehlgeschlagen, wenn

C21 oder C23 stehen noch in der Tabelle, C10 oder C14 sind gestrichen, obwohl X2a nicht gemergt ist, eine Fundstelle nennt eine Datei, die es nicht gibt, oder B1 nennt andere Aufgaben als Platzhalter als der Code.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen, `git fetch origin` |

## Testdaten

Gemergt in `origin/neuaufbau`: X2b (#106: Farbvielfalt, Vielfaltskönig, Farbwechsler, Schlangenbändiger, Symmetriemeister) und X2c (#109: Fusionsexperte, Schlangenbeschwörer, Schlangenmeister, Schlangenrepertoire, Schlangentanz). Offen: X2a (#107).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil C | Tabelle und Zeile „Behoben und gestrichen“ lesen | | nur C10 und C14 in der Tabelle; „C21 und C23 (X2b, 23.11.2026); C10 teilweise (X2b, X2c, 23.11.2026)“ |
| 2 | Git Bash im Repo | Urteil der Prüfprotokolle lesen | `git show origin/neuaufbau:docs/abnahme/X2b.md` und `…/X2c.md` | beide ABGENOMMEN; X2b nennt C21 und C23 behoben, beide C10 nur teilweise |
| 3 | Git Bash im Repo | Platzhalter zählen | `grep -l "platzhalterAufgabe(" src/engine/aufgaben/*.ts` | ausser `definition.ts` genau die fünf Dateien aus X2a |
| 4 | Editor, Teil B, B1, Zeile „15 Aufgabenkarten“ | lesen | | „zehn Bedingungen nach A9 (X2b, X2c, 23.11.2026)“ und die fünf Namen aus X2a als Platzhalter |
| 5 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation_teil_b_c.test.ts; echo $?` | Exit 0 |

## Nicht abgedeckte Grenzfälle

Ein Lauf nach dem Merge von X2a ist nicht abgedeckt: Dann müssen C10 und C14 gestrichen und B1 auf „ja“ gesetzt werden, und der P0.5g-Test zum Stand vor X2a wird bewusst rot. Fundstellen ausserhalb von `src/` prüft der Test nicht, Teil C nennt heute keine.
