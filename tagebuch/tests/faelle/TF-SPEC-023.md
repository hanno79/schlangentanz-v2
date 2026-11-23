---
id: TF-SPEC-023
titel: Nach X1 sind C1, C15 und C20 aus Teil C gestrichen und als behoben vermerkt, und B1 beschreibt die Aufgabenkarten so, wie die Engine sie heute behandelt.
art: beides
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: tests/spec_documentation_teil_b_c.test.ts
aenderung: task/P0.5f-rueckfragen-x3 (PR #105, Iteration 2)
---

## Worum es geht

Teil C listet, wo die Engine noch von der Website abweicht, und B1 sagt, welche Teile der Erweiterung umgesetzt sind. X1 hat das Prüfen und Einlösen der Aufgaben gebaut, die 15 Bedingungen aber als Platzhalter gelassen, die nie erfüllt sind. Stehen behobene Abweichungen noch in Teil C oder sagt B1 mehr, als die Engine kann, plant der nächste Task gegen einen falschen Stand.

## Bestanden, wenn

Die Tabelle in Teil C führt C1, C15 und C20 nicht mehr, und die Zeile „Behoben und gestrichen“ nennt „C1, C15 und C20 (X1, 23.11.2026)“. Jede Nummer von C1 bis zur höchsten in der Tabelle steht entweder in der Tabelle oder unter „Behoben und gestrichen“. Die Zeile „15 Aufgabenkarten“ in B1 sagt, dass Prüfung und Einlösen umgesetzt sind und die 15 Bedingungen noch Platzhalter sind, und nennt nicht mehr „14 von 15“. Unter `src/engine/aufgaben/` sind alle 15 Aufgaben mit `platzhalterAufgabe` angelegt. Teil A ist unverändert. `npx vitest run tests/spec_documentation_teil_b_c.test.ts` endet mit 0.

## Fehlgeschlagen, wenn

Eine der drei Nummern steht noch in der Tabelle oder fehlt unter „Behoben und gestrichen“, eine andere gestrichene Nummer ist nirgends vermerkt, oder B1 beschreibt einen anderen Stand als den Code nach X1.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, X1 (#100) in `neuaufbau` gemergt, `npm ci` gelaufen |

## Testdaten

X1-Block in `docs/UMSETZUNGSPLAN.md`: „Behebt: C15, C20, Rest von C1“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil C | Tabelle und Zeile „Behoben und gestrichen“ lesen | | C1, C15, C20 nicht in der Tabelle; „C1, C15 und C20 (X1, 23.11.2026)“ vermerkt |
| 2 | Editor, Teil B, Tabelle B1 | Zeile „15 Aufgabenkarten“ lesen | | „Prüfung und Einlösen nach A9 (X1 …)“ und „Platzhalter, die nie erfüllt sind (X2)“ |
| 3 | Git Bash im Repo | Platzhalter zählen | `grep -l "platzhalterAufgabe(" src/engine/aufgaben/*.ts \| grep -v definition \| wc -l` | 15 |
| 4 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation_teil_b_c.test.ts; echo $?` | Exit 0 |
| 5 | Editor, Teil C | in „Behoben und gestrichen“ „C9 und “ entfernen und Schritt 4 wiederholen | | Exit 1, „Nummern weder in der Tabelle noch unter „Behoben und gestrichen““ mit C9 |
| 6 | Git Bash im Repo | zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status --short` leer |

## Nicht abgedeckte Grenzfälle

Wird die höchste Nummer der Tabelle gestrichen und nicht vermerkt, merkt es der allgemeine Test nicht, weil er nur bis zur höchsten verbliebenen Nummer zählt. Die Fundstellen der verbliebenen Zeilen C10, C14, C21 und C23 prüft kein Test; sie betreffen X2.
