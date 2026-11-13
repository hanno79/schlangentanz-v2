---
id: TF-SPEC-001
titel: Teil D und docs/REGELFRAGEN.md geben die Antworten des Autors zu F1–F15 und F8a vom 13.11.2026 wortgetreu wieder, ohne zusätzliche Regel.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/regelfragen_antworten.test.ts
aenderung: task/P0.5-regelfragen (PR #25)
---

## Worum es geht

Die Engine-Tasks E2–E10 und K1 setzen die Antworten aus `docs/GAME_SPEC.md` Teil D um. Steht dort mehr oder anderes, als der Autor gesagt hat, entsteht eine erfundene Regel (U2).

## Bestanden, wenn

Jeder Eintrag D14–D29 entspricht genau der gewählten Möglichkeit in `docs/REGELFRAGEN.md` (Vorschlag übernommen bei F1–F7, F9, F10, F12–F15; Abweichung bei F8, F8a, F11 mit Wortlaut des Autors), jede Antwort trägt das Datum 13.11.2026, und `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts` endet mit Exit 0.

## Fehlgeschlagen, wenn

Ein Eintrag enthält eine Regel, die weder in der gewählten Möglichkeit noch im Wortlaut des Autors steht, ein Datum fehlt, oder der Testlauf endet nicht mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit |
| Quelle | Antworten des Autors vom 13.11.2026: Sammelantwort zu F1–F15 (Abweichungen F8 und F11), Nachfrage F8a „Ja, ohne Wirkung“, Bestätigung zu F11 „Ja, genau so“ |

## Testdaten

`docs/GAME_SPEC.md` Teil D, Tabelle „Beantwortet“, Zeilen D14–D29; `docs/REGELFRAGEN.md`, Blöcke F1–F15 und F8a.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Für jede Zeile D14–D29 den Text der Spalte „Antwort“ neben die gewählte Möglichkeit im Block der Frage in `docs/REGELFRAGEN.md` legen | | jeder Satz stammt aus der Möglichkeit (ohne „Folge“) oder aus dem Wortlaut des Autors |
| 2 | Editor | D21, D24 und D29 mit dem Wortlaut des Autors vergleichen | | D21: Grube in der Schlussrunde nimmt den letzten Zug, Abwehr erlaubt; D24: ab 3 Farbkarten; D29: erlaubt, ohne Wirkung |
| 3 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/regelfragen.test.ts tests/regelfragen_antworten.test.ts; echo $?` | Exit 0 |

## Nicht abgedeckte Grenzfälle

Keine; Verfälschung des Inhalts siehe TF-SPEC-003, Merge mit dem aktuellen `neuaufbau` siehe TF-SPEC-004.
