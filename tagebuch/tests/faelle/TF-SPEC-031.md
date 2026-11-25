---
id: TF-SPEC-031
titel: Nach X2a, X4, X5 und X6 ist Teil C leer, jede Nummer C1 bis C23 steht mit dem Task und Datum ihres Prüfprotokolls unter „Behoben und gestrichen“, und B1 nennt jeden Teil der Erweiterung so als umgesetzt, wie der Code ihn hat.
art: beides
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
skript: tests/spec_documentation_teil_b_c.test.ts
aenderung: task/P0.5h-antworten-x4-x6 (PR #119)
---

## Worum es geht

Teil C listet, wo die Engine noch von der Website abweicht, B1 sagt, was von der Erweiterung umgesetzt ist. Die Abnahme der Erweiterung (X7) verlangt eine leere Teil C. Stimmen Task oder Datum einer gestrichenen Nummer nicht oder nennt B1 einen Teil als fertig, der im Code fehlt, steht im Bericht ein falscher Stand. Dieser Testfall ersetzt TF-SPEC-026, der den Stand vor dem Merge von X2a festhielt.

## Bestanden, wenn

Die Tabelle in Teil C hat keine Zeile, darunter steht „Offene Abweichungen gibt es keine.“, und der Kopf nennt „Stand 24.11.2026“. Jede Nummer C1 bis C23 steht unter „Behoben und gestrichen“, und Task und Datum je Nummer stimmen mit dem Datum des abnehmenden Prüfprotokolls unter `docs/abnahme/` überein (bei X2a die Iteration 2 vom 24.11.2026). Der Schlusssatz nennt die KI unter `src/ki/`, kein Pfad in Teil C zeigt auf eine fehlende Datei. B1 nennt Aufgabenkarten, Schlangenkorb, Comeback- und Risiko-Karten mit Task und Datum als umgesetzt, den Vielfaltbonus mit E10 und E10b. Im Code ist keine Aufgabe mehr mit `platzhalterAufgabe` angelegt, und `src/engine/karten/schlangenkorb.ts`, `src/engine/erweiterung/comeback.ts` und `src/engine/erweiterung/risiko.ts` gibt es. B2 nennt die nach D52 und D77 benannte Farbkarte als einzige Ausnahme von der verdeckten Information. `npx vitest run tests/spec_documentation_teil_b_c.test.ts` endet mit 0.

## Fehlgeschlagen, wenn

Teil C hat noch eine Zeile, eine Nummer fehlt unter „Behoben und gestrichen“, Task oder Datum einer Nummer widersprechen dem Prüfprotokoll, ein Pfad in Teil C zeigt ins Leere, oder B1 nennt einen Teil als umgesetzt, den der Code nicht hat.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen, `git fetch origin` |

## Testdaten

Datum je Prüfprotokoll (Feld „Datum“): E1 und E10 13.11.2026; E2, E3 und E10b 20.11.2026; E4, E5, E6, E7, E9 und E11 21.11.2026; X1, X2b und X2c 23.11.2026; X2a Iteration 2, X4, X5 und X6 24.11.2026.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil C | Kopf, Tabelle und Schlusssatz lesen | | „Arbeitsliste, Stand 24.11.2026“, keine Tabellenzeile, „Offene Abweichungen gibt es keine.“, Schlusssatz mit `src/ki/` |
| 2 | Editor, Zeile „Behoben und gestrichen“ | jede Nummer C1 bis C23 abhaken | | jede Nummer kommt vor, mit Task und Datum in Klammern |
| 3 | Git Bash im Repo | Datum der Prüfprotokolle lesen | `grep -m1 "Datum" docs/abnahme/E1.md` usw. | stimmt mit den Testdaten und mit Schritt 2 überein |
| 4 | Git Bash im Repo | Platzhalter suchen | `grep -rl "platzhalterAufgabe(" src/engine --exclude-dir=__tests__` | nur `src/engine/aufgaben/definition.ts` |
| 5 | Editor, Teil B, B1 und B2 | lesen | | alle Zeilen „ja“ mit Task und Datum; B2 mit der Ausnahme aus D52 und D77 |
| 6 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation_teil_b_c.test.ts; echo $?` | Exit 0 |

## Nicht abgedeckte Grenzfälle

Ob Task und Datum je Nummer zum Prüfprotokoll passen, prüft kein Test, nur Schritt 3 von Hand; der Test prüft, dass jede Nummer genannt ist und die neue Angabe für C10 und C14 wörtlich dasteht. Die Protokolle von E1 und E2 nennen C5 beziehungsweise C3, C4 und C12 nicht mit Nummer, nur dem Inhalt nach (eigener Ablagestapel, Auffüllen, Pflichtkarte). Ob die Engine die Antworten D68 bis D79 schon umsetzt, gehört nicht hierher. Verfälschungen prüft TF-SPEC-030.
