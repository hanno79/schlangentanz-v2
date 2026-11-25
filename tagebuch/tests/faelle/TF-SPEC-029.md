---
id: TF-SPEC-029
titel: D68 bis D79 geben die zwölf Antworten des Autors vom 24.11.2026 auf die Rückfragen aus X2, X4, X5 und X6 in Teil D und im Website-Nachtrag genau so wieder, wie er gewählt hat.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
skript: tests/spec_documentation_teil_d.test.ts
aenderung: task/P0.5h-antworten-x4-x6 (PR #119)
---

## Worum es geht

X4, X5 und X6 haben zwölf Fragen hinterlassen, die die Website nicht beantwortet, etwa ob der Tausch bei Risiko-Aktion 3 freiwillig ist oder wohin ein ungenutzt abgeworfener Schlangenkorb kommt. Der Autor hat am 24.11.2026 je eine Möglichkeit gewählt. Teil D ist die Regelquelle der Engine, solange die Website nachzieht. Steht dort eine andere Lesart oder eine dazuerfundene Regel, bauen die Folgetasks und die KI etwas, das der Autor nicht entschieden hat.

## Bestanden, wenn

Jede der zwölf Antworten steht als eigene Zeile D68 bis D79 in Teil D, mit der gewählten Möglichkeit wörtlich in „…“, Datum 24.11.2026, Folge X4, X6, X2 oder X5 und am Ende „Website folgt.“. Teil D zählt lückenlos bis D79. Jedes Zitat aus einer Antwort steht wörtlich in Teil A. Sätze, die nicht gewählt, sondern abgeleitet sind, nennen in D70, D75 und D76 die Stelle, aus der sie folgen, und folgen auch tatsächlich daraus. Der Website-Nachtrag führt alle zwölf mit derselben Regel und ohne „Website folgt“. Einleitung von Teil D, Teil E und `docs/REGELFRAGEN.md` nennen D68–D79 und den 24.11.2026. `npx vitest run tests/spec_documentation_teil_d.test.ts` endet mit 0.

## Fehlgeschlagen, wenn

Eine Zeile gibt eine andere Möglichkeit wieder als gewählt, etwa einen Tausch bei Risiko-Aktion 3 als Pflicht oder einen Korb, der nach dem Abwerfen aus dem Spiel kommt. Fehlgeschlagen ist der Test auch, wenn eine Zeile eine Regel enthält, die weder aus der Wahl noch aus Teil A oder einem genannten D-Eintrag folgt, wenn ein Zitat nicht wörtlich in Teil A steht oder wenn Datum, Folge, Nummerierung oder Nachtrag nicht stimmen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm ci` gelaufen |
| Quelle | Antworten des Autors vom 24.11.2026 mit wörtlich gewählter Möglichkeit (Auftrag des Orchestrators an die Prüfung von P0.5h) |

## Testdaten

Gewählt hat der Autor: (1) Comeback-Zusatzaktion darf eine Sonderkarte wirkungslos ablegen: „Ja, erlaubt“. (2) Ungenutzt abgeworfener Schlangenkorb: „Auf den Ablagestapel“. (3) „Tausche bis zu 2 Karten“ ohne Tausch: „Mindestens ein Tausch“. (4) Eine gezogene Farbkarte des Korbs zugleich als Farbkarte des Zuges: „Ja, drei möglich“. (5) „sofort“ beim Korb: „Im selben Zug“. (6) Vierer- oder Fünfergruppe bei „Schlangentanz“: „Ja, ab drei Karten“. (7) Risiko-Aktion 2 ohne eigene Schlange: „Nicht wählbar“. (8) Tausch bei Erfolg von Risiko-Aktion 3: „Freiwillig“. (9) Zusatzkarte aus Risiko-Aktion 2 für die Pflicht zur Karte im Zug: „Ja, zählt“. (10) Benannte Farbkarte aus D52 offen: „Ja, offen für alle“. (11) Sonderkarte bei Misserfolg von Risiko-Aktion 1: „Pflicht“. (12) Risiko-Aktion 4, Misserfolg, nichts zu holen: „Er bekommt nichts“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil D, Zeilen D68 bis D79 | Zeile für Zeile neben die Testdaten legen | | gewählte Möglichkeit wörtlich in „…“, Datum 24.11.2026, Folge X4 (D68), X6 (D69–D72), X2 (D73), X5 (D74–D79), Antwort endet mit „Website folgt.“ |
| 2 | Editor, Teil A, A5, A6, A7.10, A8.2 | jedes Zitat aus D68 bis D79 suchen | etwa „Du darfst den Tausch ausführen“ | steht wörtlich in Teil A |
| 3 | Editor, Teil D, D70, D75, D76 | den Satz „Abgeleitet aus …“ lesen und an der genannten Stelle nachschlagen | A7.10, D51, A8.2 | der abgeleitete Satz folgt aus der Stelle |
| 4 | Editor, `docs/WEBSITE_NACHTRAG.md`, Abschnitt „Erweiterung“ | Einträge „(D68)“ bis „(D79)“ lesen | | gleiche Frage, gleiche Regel, Fragezeile endet mit zwei Leerzeichen, kein „Website folgt“ |
| 5 | Editor, Einleitung Teil D, Teil E, `docs/REGELFRAGEN.md` | lesen | | nennen D68–D79 und den 24.11.2026 |
| 6 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation_teil_d.test.ts; echo $?` | Exit 0 |

## Nicht abgedeckte Grenzfälle

Verfälschungen der Antworten prüft TF-SPEC-030. Querverweise, die nicht zum Kern einer Antwort gehören, etwa „Die Sonderkarte des Zuges ist der Korb selbst (D42)“ in D71, prüft kein Test wörtlich; sie werden in Schritt 1 von Hand gelesen. Ob die Engine die Antworten schon umsetzt, prüft dieser Testfall nicht, das gehört zu den Folgetasks von X4, X5 und X6. Ob die Website die Antworten übernimmt, prüft TF-SPEC-005.
