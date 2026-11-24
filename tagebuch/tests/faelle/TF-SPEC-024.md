---
id: TF-SPEC-024
titel: D58 bis D65 und die Ergänzung von D48 geben die neun Antworten des Autors vom 23.11.2026 auf die Rückfragen aus X2 und X3 in Teil D und im Website-Nachtrag vollständig und ohne Zusatzregel wieder.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: tests/spec_documentation_teil_d.test.ts
aenderung: task/P0.5g-antworten-x2-x3 (PR #110)
---

## Worum es geht

Die Prüfer von X2a, X2b, X2c und X3 haben neun Stellen gefunden, die weder die Website noch Teil D regeln: Farbvielfalt, zwei zum Zeitpunkt von Farbenpracht, reine Jokerreihen, zwei zu Schlangentanz, Schlangenmeister, die wirkungslose Farbenfusion und die Comeback-Karte nach einem Verdoppler. Der Autor hat jede am 23.11.2026 mit einer Möglichkeit beantwortet. Teil D ist die Regelquelle für X2 und X4. Steht dort weniger oder mehr als gewählt, baut der nächste Task eine Regel, die der Autor nicht gewählt hat, oder fragt noch einmal.

## Bestanden, wenn

Acht neue Zeilen D58 bis D65 stehen in Teil D, die Nummern laufen von D1 bis D65 ohne Lücke. Jede Zeile hat eine Frage mit „?“, nennt die gewählte Möglichkeit wörtlich in „…“, endet mit „Website folgt.“ und hat das Datum 23.11.2026. Bei D58 bis D64 steht in „Folge“ X2, bei D65 X3. Jede Antwort gibt den Inhalt der Wahl wieder, auch was eine nicht gewählte Möglichkeit ausschliesst, und fügt nur Sätze hinzu, die aus der Wahl, aus Teil A oder aus einem genannten D-Eintrag folgen. D48 behält seinen Wortlaut samt Datum 21.11.2026 und Folge X4 und ist um „Ja, nie möglich“ ergänzt. Einleitung von Teil D, Teil E, `docs/REGELFRAGEN.md` und der Abschnitt „Erweiterung“ im Website-Nachtrag nennen die neuen Einträge. Im Nachtrag ist jeder neue Eintrag so gesetzt wie die bisherigen: fette Frage mit Nummer, harter Zeilenumbruch, Antwort. Teil A ist unverändert. `npx vitest run tests/spec_documentation_teil_d.test.ts tests/spec_documentation_teil_e.test.ts tests/regelfragen_antworten.test.ts` endet mit 0.

## Fehlgeschlagen, wenn

Eine Zeile gibt eine andere Möglichkeit wieder, lässt einen Teil der Wahl weg oder fügt eine Regel hinzu, die nicht aus ihr folgt. Fehlgeschlagen ist der Test auch, wenn Datum, Folge, Nummerierung oder der Wortlaut von D48 nicht stimmen, wenn der Nachtrag einen Eintrag anders setzt als die bisherigen oder wenn Teil A verändert ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen |
| Quelle | Antworten des Autors vom 23.11.2026, gewählte Möglichkeit je wörtlich (Auftrag des Orchestrators), dazu die Auslegungsfragen in `docs/abnahme/X2a.md`, `X2b.md`, `X2c.md` und `X3.md` |

## Testdaten

1. Farbvielfalt, Farbe doppelt in der Kette (Blau, Rot, Rot, Gelb, Braun, Violett, Grün)? Gewählt „Nein, je genau einmal“: sechs Karten direkt hintereinander, jede Farbe genau einmal.
2. Farbenpracht mitten im Zug einlösbar, auch wenn die Bedingung im selben Zug wieder zerstört wird? Gewählt „Nur am Zugende“.
3. Farbenpracht am Spielende für alle prüfen? Gewählt „Nur eigenes Zugende“.
4. Reine Jokerreihen bei Gelber Schatz, Lila Riese, Farbkombination, Farbenpracht? Gewählt „Ja, Joker zählen immer“.
5. Schlangentanz, „neue Dreiergruppe“? Gewählt „Jede neu entstandene“: jede Gruppe, in der keine Gruppe von vor der Häutung weiterlebt.
6. Schlangentanz, Häutung im selben Zug? Gewählt „Gilt die ganze Partie“. Zur Wahl standen auch „Nur im selben Zug“ und „Gruppen müssen liegen“ (beide Gruppen müssen beim Einlösen noch liegen, Lesart (c) in `docs/abnahme/X2c.md`); beide nicht gewählt.
7. Schlangenmeister „2 versch. Sonderkarten“? Gewählt „Zwei Arten“; eine vom Gegner gelegte Blockade in der eigenen Schlange zählt mit.
8. Wirkungslos abgelegte Farbenfusion verbraucht die Fusion des Zuges? Gewählt „Ja, verbraucht“.
9. Comeback im zweiten Zug nach Verdoppler nie möglich, so in D48? Gewählt „Ja, nie möglich“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil D, Tabelle „Beantwortet“ | Zeilen D58 bis D65 neben die Testdaten 1 bis 8 legen | | je Zeile die gewählte Möglichkeit wörtlich in „…“, Datum 23.11.2026, Folge X2 (D58 bis D64) beziehungsweise X3 (D65), Frage endet mit „?“, Antwort endet mit „Website folgt.“ |
| 2 | Editor, Teil D, Zeile D63 | Antwort neben Testdaten 6 legen | | die Antwort sagt, dass die Häutung die ganze Partie gilt, und auch, dass die beiden Gruppen beim Einlösen nicht mehr liegen müssen |
| 3 | Editor, Teil D, Zeile D48 | mit dem Stand auf `origin/neuaufbau` vergleichen | `git diff origin/neuaufbau...HEAD -- docs/GAME_SPEC.md` | alter Wortlaut bleibt, eingefügt ist nur „Rückfrage vom 23.11.2026: …“ mit „Ja, nie möglich“ vor „Website folgt.“; Datum 21.11.2026, Folge X4 |
| 4 | Editor, Teil D, Spalte „Nr.“ | Nummern von oben nach unten lesen | | D1 bis D65 ohne Lücke und ohne Doppel |
| 5 | Editor, jede Zeile D58 bis D65 | jeden Verweis auf Teil A und auf einen anderen D-Eintrag nachschlagen | | jedes Zitat in „…“ steht wörtlich in Teil A; jeder genannte D-Eintrag sagt, was die Zeile ihm zuschreibt |
| 6 | Editor, Einleitung Teil D; Teil E „Stand und Verlauf“; `docs/REGELFRAGEN.md`, Stand-Absatz | lesen | | alle drei nennen D58–D65, den 23.11.2026 und die Ergänzung von D48 |
| 7 | Editor, `docs/WEBSITE_NACHTRAG.md`, Abschnitt „Erweiterung“ | Einträge „(D58)“ bis „(D65)“ lesen und mit „(D57)“ vergleichen | | gleiche Frage wie in Teil D, gleiche Regel, ohne „Website folgt“; die Fragezeile endet wie bei „(D57)“ mit zwei Leerzeichen (harter Umbruch) |
| 8 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation_teil_d.test.ts tests/spec_documentation_teil_e.test.ts tests/regelfragen_antworten.test.ts; echo $?` | Exit 0 |

## Nicht abgedeckte Grenzfälle

Verfälschung einer Antwort und eines Datums: TF-SPEC-025. Teil C und B1 nach X2b und X2c: TF-SPEC-026. Ob die Website die Antworten übernimmt, prüft `npm run abgleich:website` (TF-SPEC-005); bis dahin steht „Website folgt.“. Drei Fragen bleiben nach den Antworten offen und sind deshalb kein Kriterium: Farbharmonie mit Vierergruppe, Schlangentanz mit Vierergruppe als „Dreiergruppe“ und, falls nicht als entschieden angesehen, das Zugende beim Verdoppler (siehe `docs/abnahme/P0.5g.md`).
