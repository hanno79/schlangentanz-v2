---
id: <D-NNN, gleich dem Dateinamen ohne .md, etwa D-014>
anlass: <wofür der Durchgang ist, etwa vor Deployment 22.10.2026 oder nach MR !34>
datum: <JJJJ-MM-TT>
branch: <Name des Branches>
commit: <volle Commit-ID des Stands, für den der Durchgang angelegt wurde>
basis: <Commit des vorigen freigegebenen Durchgangs, oder keine>
datenstand: <optional: Datenstand, mit dem geprüft wird; sonst Zeile löschen>
---

## Fällig

| Testfall | Grund |
|---|---|
| <ID des Testfalls> | <Bereich geändert, Regression lange nicht gelaufen oder von Hand aufgenommen> |

## Freigaben

| Testfall | wer | Begründung |
|---|---|---|
| <ID eines blockierten oder übersprungenen Testfalls; Abschnitt löschen, wenn es keine Freigabe gibt> | <Name des Menschen, der freigibt, nie ein Agent> | <warum der Testfall trotzdem nicht im Weg steht> |
