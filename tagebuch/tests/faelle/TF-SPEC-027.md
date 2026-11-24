---
id: TF-SPEC-027
titel: D66 und D67 geben die beiden Antworten des Autors vom 23.11.2026 zu „Farbenpracht“ nach einem Verdoppler und zur Vierergruppe bei „Farbharmonie“ in Teil D und im Website-Nachtrag genau wieder.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
skript: tests/spec_documentation_teil_d.test.ts
aenderung: task/P0.5g-antworten-x2-x3 (PR #110, Iteration 2)
---

## Worum es geht

Nach der ersten Prüfung von P0.5g blieben zwei Fragen offen, die X2a braucht: ob „Farbenpracht“ nach einem Verdoppler schon am Ende des ersten Zuges geprüft wird und ob bei „Farbharmonie“ eine Vierer- oder Fünfergruppe als Dreiergruppe zählt. Der Autor hat beide am 23.11.2026 beantwortet. D66 und D67 dürfen nur diese Wahl wiedergeben, sonst prüft X2a anders, als der Autor entschieden hat.

## Bestanden, wenn

D66 nennt „Nach jedem der zwei“ und sagt, dass „Farbenpracht“ am Ende des ersten und am Ende des zweiten Zuges geprüft wird. D67 beginnt mit „Ja:“, nennt „Ja, ab drei Karten“ und sagt, dass jede Farbgruppe ab drei Karten als Dreiergruppe ihrer Farbe zählt. Beide haben das Datum 23.11.2026, Folge X2, eine Frage mit „?“ und am Ende „Website folgt.“. Jedes Zitat steht wörtlich in Teil A, und Teil D zählt lückenlos bis D67. Der Nachtrag führt beide Antworten mit hartem Umbruch nach der Frage und ohne „Website folgt“. Einleitung von Teil D, Teil E und `docs/REGELFRAGEN.md` nennen D58–D67. `npx vitest run tests/spec_documentation_teil_d.test.ts` endet mit 0.

## Fehlgeschlagen, wenn

D66 lässt nur das Ende des zweiten Zuges gelten, D67 verlangt genau drei Karten oder fügt eine Regel hinzu, die weder aus der Wahl noch aus Teil A oder einem genannten D-Eintrag folgt. Fehlgeschlagen ist der Test auch, wenn Datum, Folge, Nummerierung oder der Nachtrag nicht stimmen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen |
| Quelle | Antworten des Autors vom 23.11.2026 (Auftrag des Orchestrators, Nachprüfung P0.5g Iteration 2) |

## Testdaten

Frage 1: „Farbenpracht wird nur am Ende des eigenen Zuges geprüft. Nach einem Verdoppler hast du zwei Züge hintereinander (A7.8: ‚Damit ist dein erster Zug beendet‘). Wird schon am Ende des ersten Zuges geprüft oder erst am Ende des zweiten?“ Gewählt: „Nach jedem der zwei“.

Frage 2: „Farbharmonie: Zählt eine Vierer- oder Fünfergruppe als ‚Dreiergruppe‘ ihrer Farbe?“ Gewählt: „Ja, ab drei Karten“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil D, Zeilen D66 und D67 | neben die Testdaten legen | | Wahl wörtlich in „…“, Datum 23.11.2026, Folge X2, Frage endet mit „?“, Antwort endet mit „Website folgt.“; D67 beginnt mit „Ja:“ |
| 2 | Editor, Teil A, A7.8 und A11 | Zitate aus D66 und D67 suchen | „Damit ist dein erster Zug beendet“ | steht wörtlich in A7.8; die Gruppendefinition steht in A11 |
| 3 | Editor, `docs/WEBSITE_NACHTRAG.md`, Abschnitt „Erweiterung“ | Einträge „(D66)“ und „(D67)“ lesen | | gleiche Frage, gleiche Regel, Fragezeile endet mit zwei Leerzeichen, kein „Website folgt“ |
| 4 | Editor, Einleitung Teil D, Teil E, `docs/REGELFRAGEN.md` | lesen | | alle nennen D58–D67 |
| 5 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation_teil_d.test.ts; echo $?` | Exit 0 |

## Nicht abgedeckte Grenzfälle

Verfälschung der Antworten: TF-SPEC-028. Ob „Dreiergruppe“ bei „Schlangentanz“ (D62) ebenso ab drei Karten gilt, sagt D67 nicht; die Antwort betrifft nur „Farbharmonie“. Ob die Website die Antworten übernimmt, prüft TF-SPEC-005.
