---
id: TF-SPEC-014
titel: D30 und D31 stehen mit Wortlaut, Datum 20.11.2026 und Folge-Tasks in Teil D, und eine verfälschte Antwort macht die Tests rot.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: tests/spec_documentation_teil_d.test.ts
aenderung: task/P0.5d-teil-a-website (PR #50)
---

## Worum es geht

Der Autor hat am 20.11.2026 zwei Fragen beantwortet: Eine Farbenfusion bringt in einer Gruppe die Summe der Karten darunter (D30), und drei Joker nebeneinander sind eine Gruppe (D31). Die Antworten müssen so in der Spec stehen, wie er sie gegeben hat, und ein Test muss es merken, wenn jemand den Inhalt umdreht.

## Bestanden, wenn

D30 enthält „Summe der beiden Karten darunter“ und das Zitat „Summe darunter“, D31 enthält „Ja, als Gruppe“; beide tragen das Datum 20.11.2026 und nennen E10, D31 zusätzlich X2. Die Pläne zu E10 und X2 verweisen mit „G9 → D31“ auf die Antwort. Dreht man die Kernaussage von D30 oder die Wahl bei G9 um, endet `npx vitest run tests/spec_documentation_teil_d.test.ts tests/regelfragen_antworten.test.ts` mit 1.

## Fehlgeschlagen, wenn

Ein Zitat, das Datum oder ein Folge-Task fehlt, oder die Tests bleiben nach einer umgedrehten Antwort grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches, `npm ci` gelaufen |

## Testdaten

Gegenprobe D30: in der Zeile D30 „Die Summe der beiden Karten darunter, nicht der Wert einer Karte der Gruppenfarbe.“ ersetzen durch „Der Wert einer Karte der Gruppenfarbe, nicht die Summe der beiden Karten darunter.“; das Zitat „Summe darunter“ bleibt. Gegenprobe G9: in `docs/REGELFRAGEN.md` „**Antwort:** a.“ bei G9 durch „**Antwort:** b.“ ersetzen.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil D | Zeilen D30 und D31 lesen | | Zitate, Datum 20.11.2026, Folge E10 und X2 wie unter „Bestanden, wenn“ |
| 2 | Editor, `docs/UMSETZUNGSPLAN.md`, Blöcke E10 und X2 | Zeile „Fragen“ lesen | | „G9 → D31“ steht in beiden Blöcken |
| 3 | Editor, `docs/GAME_SPEC.md` | Gegenprobe D30 einsetzen, speichern | siehe „Testdaten“ | |
| 4 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation_teil_d.test.ts tests/regelfragen_antworten.test.ts; echo $?` | Exit 1 und ein Test, der D30 nennt |
| 5 | Git Bash im Repo | Datei zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status` zeigt nichts mehr |
| 6 | Editor, `docs/REGELFRAGEN.md` | Gegenprobe G9 einsetzen, Tests wie in Schritt 4 | siehe „Testdaten“ | Exit 1, Meldung „G9: gewählte Möglichkeit: expected 'b' to be 'a'“ |
| 7 | Git Bash im Repo | Datei zurücksetzen | `git checkout -- docs/REGELFRAGEN.md` | `git status` zeigt nichts mehr |

## Technische Prüfung

`tests/spec_documentation_teil_d.test.ts` › „D30: die Farbenfusion bringt in einer Gruppe die Summe der beiden Karten darunter (Antwort vom 20.11.2026)“ und `tests/regelfragen_antworten.test.ts` › „P0.5: G9: gewählt „a“, die Kernaussage steht in REGELFRAGEN.md und in Teil D“.

## Nicht abgedeckte Grenzfälle

Ob die Wertung D30 und D31 umsetzt, prüft dieser Testfall nicht; das ist Sache von E10 und X2. Eine Gruppe aus drei Farbenfusionen ist nicht eigens geprüft, weil D31 Joker allgemein nennt.
