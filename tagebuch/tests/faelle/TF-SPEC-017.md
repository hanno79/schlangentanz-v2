---
id: TF-SPEC-017
titel: D32 steht mit Frage, Wortlaut, Datum 20.11.2026, Folge E10b und „Website folgt“ in Teil D, D31 verweist darauf, und eine umgedrehte Antwort macht die Tests rot.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: tests/spec_documentation_teil_d.test.ts
aenderung: task/E10b-vielfalt-regenbogen (PR #52)
---

## Worum es geht

Die Antwort des Autors zum Vielfaltbonus einer Gruppe nur aus Regenbogenschlangen muss so in der Spec stehen, wie er sie gegeben hat: „Nein. Eine Regenbogenschlange zählt nicht beim Vielfalt Bonus“. D31 sagte vorher das Gegenteil für den Vielfaltbonus und muss deshalb auf D32 verweisen. Was der Autor nicht beantwortet hat, die Gruppe aus Regenbogenschlangen und Farbenfusion, muss als offen dastehen.

## Bestanden, wenn

Die Zeile D32 enthält die Frage, den Wortlaut in Anführungszeichen, „Website folgt.“, die Folge E10b und das Datum 20.11.2026, nennt die Gruppe mit Farbenfusion ausdrücklich als offen und sagt zu „Farbharmonie“ nur, dass dort D31 weiter gilt. D31 endet mit „Für den Vielfaltbonus schränkt D32 das ein.“ Teil E hat einen Eintrag vom 20.11.2026 zu E10b. Ersetzt man in D32 „bringt keine Farbe für den Vielfaltbonus“ durch „bringt eine Farbe für den Vielfaltbonus“, endet `npx vitest run tests/spec_documentation_teil_d.test.ts` mit 1.

## Fehlgeschlagen, wenn

Ein Feld fehlt, D32 behauptet mehr als der Wortlaut und Teil A hergeben, oder die Tests bleiben nach der umgedrehten Aussage grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches ab Commit 4c83fb0, `npm ci` gelaufen, `git status` leer |

## Testdaten

Gegenprobe: in `docs/GAME_SPEC.md`, Zeile D32, den ersten Satz „Nein: Eine Gruppe nur aus Regenbogenschlangen bringt keine Farbe für den Vielfaltbonus.“ ersetzen durch „Nein: Eine Gruppe nur aus Regenbogenschlangen bringt eine Farbe für den Vielfaltbonus.“

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil D | Zeilen D31 und D32 lesen | | Felder wie unter „Bestanden, wenn“ |
| 2 | Git Bash im Repo | Spec-Tests ausführen | `npx vitest run tests/spec_documentation_teil_d.test.ts; echo $?` | Exit 0 |
| 3 | Editor | Gegenprobe einsetzen | siehe „Testdaten“ | |
| 4 | Git Bash im Repo | Tests wie in Schritt 2 | | Exit 1, rot: „D32: eine Gruppe nur aus Regenbogenschlangen bringt keine Farbe …“ |
| 5 | Git Bash im Repo | zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status` leer |

## Nicht abgedeckte Grenzfälle

Ob die Website die Antwort schon übernommen hat, prüft `npm run abgleich:website` (TF-SPEC-005), nicht dieser Testfall.
