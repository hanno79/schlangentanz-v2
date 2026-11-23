---
id: TF-SPEC-020
titel: D56 und D57 geben die beiden Antworten des Autors vom 22.11.2026 auf die Rückfragen aus X3 in Teil D und im Website-Nachtrag genau wieder.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: tests/spec_documentation_teil_d.test.ts
aenderung: task/P0.5f-rueckfragen-x3 (PR #105)
---

## Worum es geht

X3 baut den Rahmen für Zusatzaktionen und braucht zwei Regeln, die weder auf der Website noch in Teil D standen: ob eine abgewehrte Farbenfusion die Fusion des Zuges verbraucht und ob mitten im Zug gezogene letzte Karten noch im selben Zug spielbar sind. Der Autor hat beide am 22.11.2026 mit je einer von zwei Möglichkeiten beantwortet. D56 und D57 dürfen nur diese Wahl wiedergeben, sonst setzt X3 eine Regel um, die der Autor nicht gewählt hat.

## Bestanden, wenn

D56 beginnt mit „Ja:“, sagt, dass eine abgewehrte Farbenfusion die Fusion des Zuges verbraucht und keine zweite möglich ist, und nennt „Ja, gespielt ist gespielt“. D57 beginnt mit „Ja:“, sagt, dass die eben gezogenen Karten im selben Zug spielbar sind und danach die Schlussrunde beginnt, und nennt „Ja, im selben Zug“. Beide haben Folge X3, Datum 22.11.2026, eine Frage mit „?“ am Ende und „Website folgt.“ am Schluss. Teil D zählt lückenlos bis D57. Die Verweise in D57 auf D43, D49 und D55 stimmen inhaltlich. Der Nachtrag führt beide Antworten im Abschnitt „Erweiterung“ ohne „Website folgt“, und `git diff origin/neuaufbau...HEAD -- docs/GAME_SPEC.md` ändert nichts in Teil A. `npx vitest run tests/spec_documentation_teil_d.test.ts tests/spec_documentation_teil_e.test.ts tests/regelfragen_antworten.test.ts` endet mit 0.

## Fehlgeschlagen, wenn

Eine Antwort gibt die andere Möglichkeit wieder, fügt eine Regel hinzu, die weder aus der Wahl noch aus einem anderen D-Eintrag folgt, oder lässt einen Teil der Wahl weg. Oder Datum, Folge, Nummerierung, ein Verweis oder der Nachtrag stimmt nicht, oder Teil A ist verändert.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen |
| Quelle | Rückfragen aus X3 an den Autor mit je zwei Möglichkeiten, beantwortet am 22.11.2026 (Auftrag des Orchestrators) |

## Testdaten

Rückfrage 1: „Pro Zug ist nur eine Farbenfusion erlaubt. Zählt eine Farbenfusion, die ein Gegner mit Farbenschutz abgewehrt hat, schon als ‚die Fusion des Zuges‘?“ Gewählt: „Ja, gespielt ist gespielt“ (die Fusion ist verbraucht, eine zweite ist nicht möglich). Verworfen: „Nein, nur eine wirksame“.

Rückfrage 2: „Zieht ein Spieler mitten in seinem Zug die letzte Karte vom Stapel (etwa über Korb oder Comeback): Darf er die eben gezogenen Karten noch im selben Zug ausspielen?“ Gewählt: „Ja, im selben Zug“ (er spielt seinen Zug zu Ende und darf die eben gezogenen Karten einsetzen, danach beginnt die Schlussrunde). Verworfen: „Nein, erst später“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil D, Tabelle „Beantwortet“ | Zeilen D56 und D57 neben die Testdaten legen | | Antwort beginnt mit „Ja:“; gewählte Möglichkeit wörtlich in „…“; Folge X3; Datum 22.11.2026; Frage endet mit „?“; Antwort endet mit „Website folgt.“ |
| 2 | Editor, Teil D, Spalte „Nr.“ | Nummern von oben nach unten lesen | | D1 bis D57 ohne Lücke und ohne Doppel |
| 3 | Editor, Teil D | D43, D49 und D55 lesen und mit D57 vergleichen | | alle drei sagen: wer die letzte Karte zieht, spielt seinen Zug zu Ende, danach beginnt die Schlussrunde; keiner verbietet das Ausspielen der eben gezogenen Karten |
| 4 | Editor, Teil D, Einleitung; Teil E „Stand und Verlauf“; `docs/REGELFRAGEN.md`, Stand-Absatz | lesen | | alle drei nennen D56, D57 und den 22.11.2026 |
| 5 | Editor, `docs/WEBSITE_NACHTRAG.md`, Abschnitt „Erweiterung“ | Einträge „(D56)“ und „(D57)“ lesen | | gleiche Frage wie in Teil D, gleiche Regel, ohne „Website folgt“ und ohne „gewählte Möglichkeit“; verständlich ohne Teil D |
| 6 | Git Bash im Repo | Teil A vergleichen | `git diff origin/neuaufbau...HEAD -- docs/GAME_SPEC.md` | kein Abschnitt vor „## Teil D“ geändert |
| 7 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation_teil_d.test.ts tests/spec_documentation_teil_e.test.ts tests/regelfragen_antworten.test.ts; echo $?` | Exit 0 |

## Nicht abgedeckte Grenzfälle

Verfälschung der Antworten: TF-SPEC-021. Ob D57 den Satz der Website zum Spielende einordnet, prüft TF-SPEC-022. Ob die Website die Antworten übernimmt, prüft `npm run abgleich:website` (TF-SPEC-005); bis dahin steht „Website folgt.“.
