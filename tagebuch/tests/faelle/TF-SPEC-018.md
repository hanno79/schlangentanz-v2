---
id: TF-SPEC-018
titel: Teil D und docs/REGELFRAGEN.md geben die Sammelantwort des Autors vom 21.11.2026 zu G1–G8 und G10–G23 als D34–D55 inhaltstreu wieder, ohne zusätzliche Regel.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: tests/regelfragen_antworten.test.ts
aenderung: task/P0.5e-g-antworten (PR #75)
---

## Worum es geht

Die Tasks X1 bis X6 bauen die Erweiterung nach Teil D. Der Autor hat am 21.11.2026 mit „ja zu deinen vorschlägen.“ bei allen 22 offenen G-Fragen den Vorschlag des Orchestrators bestätigt. Jeder Eintrag D34–D55 muss genau die vorgeschlagenen Möglichkeiten wiedergeben, sonst baut X1–X6 eine Regel, die der Autor nie bestätigt hat.

## Bestanden, wenn

Für jede der 22 Fragen stammt jeder Satz der Spalte „Antwort“ in D34–D55 aus dem Text einer vorgeschlagenen Möglichkeit, aus dem Fragenblock in `docs/REGELFRAGEN.md` oder aus dem Wortlaut des Autors, und jede vorgeschlagene Möglichkeit ist vertreten. Jeder Block G1–G8, G10–G23 trägt die Buchstaben des Vorschlags, den Wortlaut „ja zu deinen vorschlägen.“, den Verweis auf seinen D-Eintrag und das Datum 21.11.2026. Die Spalte „Folge“ nennt den Task aus „nennt die Frage“, bei G4 X2. `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts tests/spec_documentation_teil_d.test.ts` endet mit 0.

## Fehlgeschlagen, wenn

Ein D-Eintrag enthält eine Regel, die in keiner vorgeschlagenen Möglichkeit steht, lässt eine aus, schwächt sie ab, oder ein Block hat andere Buchstaben, ein anderes Datum oder einen veränderten Wortlaut.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen |
| Quelle | Sammelantwort des Autors vom 21.11.2026: „ja zu deinen vorschlägen.“; Vorschläge laut Übersicht in `docs/REGELFRAGEN.md` auf `origin/neuaufbau` vor dem Task |

## Testdaten

Vorschläge: G1 a · G2 a · G3 a · G4 a, c · G5 b, c · G6 b, c · G7 a · G8 b, c · G10 a, c, e · G11 a, c, e · G12 a, d · G13 a, c, e · G14 a, c, f, g · G15 a · G16 a, d, f · G17 a, c, e, g · G18 a · G19 a, c, e, g · G20 a, c, e, g · G21 a, d · G22 a, c, e · G23 a, c.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/REGELFRAGEN.md` von `origin/neuaufbau` | je Frage die Texte der vorgeschlagenen Möglichkeiten heraussuchen | `git show origin/neuaufbau:docs/REGELFRAGEN.md` | Buchstaben wie unter „Testdaten“ |
| 2 | Editor, `docs/GAME_SPEC.md`, Teil D | Zeilen D34–D55 Satz für Satz neben die Texte aus Schritt 1 legen | | jeder Satz hat seine Quelle; jede Möglichkeit ist vertreten; D48 endet mit „nur, wenn D47 (G15) das zulässt“; D51 hat vier Teile |
| 3 | Editor, `docs/REGELFRAGEN.md` | Felder „Antwort“ und „Datum“ von G1–G8, G10–G23 lesen | | Buchstaben, „ja zu deinen vorschlägen.“, „Teil D: D34“ bis „D55“, Datum 21.11.2026 |
| 4 | Editor, Teil D | Spalten „Folge“ und „Nr.“ lesen | | X1, X2, X3, X4, X5, X6 wie im Plan; D1 bis D55 ohne Lücke |
| 5 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts tests/spec_documentation_teil_d.test.ts; echo $?` | Exit 0 |

## Nicht abgedeckte Grenzfälle

Verfälschung des Inhalts: TF-SPEC-019. Ob die Website die Antworten übernimmt, prüft `npm run abgleich:website` (TF-SPEC-005); bis dahin steht „Website folgt.“.
