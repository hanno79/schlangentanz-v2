---
datum: 2026-11-12
zeit: 21:57
titel: Der Baseline-Kern gilt vor Plan-Regel U9, das Testregister sperrt nur Merges nach main
art: entscheidung
wer: Hanno Rahn, Claude Code
betrifft: Arbeitsweise
kapitel: 5, 3
---

Mit der Baseline kam eine zweite Regelquelle für die Arbeitsweise ins Repo. Vor dem Start von P0.2 mussten zwei Widersprüche zum Umsetzungsplan geklärt werden.

## Frage

Gilt für neuen Code Plan-Regel U9 mit Dateikopf und ÄNDERUNG-Kommentaren oder der Kern, der beides verbietet? Und braucht jeder Merge einen freigegebenen Durchgang des Testregisters?

## Optionen

U9 unverändert lassen und die Abweichung vom Kern begründen, U9 an den Kern anpassen und nur die deutschen Bezeichner behalten, oder den Kern ganz übernehmen und neuen Code englisch benennen. Beim Register: ein freigegebener Durchgang vor jedem Merge in `neuaufbau`, nur vor Merges nach `main`, oder das Register bis M2 zurückstellen.

## Gewählt

U9 folgt dem Kern: kein Dateikopf, keine ÄNDERUNG-Kommentare, deutsche Bezeichner bleiben. Task-Merges in `neuaufbau` setzen das bestandene Prüfprotokoll voraus, Merges nach `main` zusätzlich einen freigegebenen Durchgang.

## Begründung

Wer wann was geändert hat, steht im git-Log; Köpfe und Vermerke im Code veralten. Der Bestand ist deutsch benannt, ein Wechsel mitten im Umbau brächte Mischformen. `main` geht sofort in Produktion, dort lohnt die zusätzliche Sperre. Für jeden der 42 Tasks einen ganzen Durchgang zu fahren, hätte die Arbeit stark gebremst, ohne mehr zu prüfen als das Prüfprotokoll.
