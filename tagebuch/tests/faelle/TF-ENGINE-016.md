---
id: TF-ENGINE-016
titel: Drei Regenbogenschlangen nebeneinander bilden eine Gruppe mit 0 Punkten, und Regenbogenschlange, Fusion aus Grün und Grün, Regenbogenschlange eine Gruppe mit 6 Punkten.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A11_farbgruppen.test.ts
aenderung: task/P0.5d-teil-a-website (PR #50)
---

## Worum es geht

Nach den Antworten des Autors vom 20.11.2026 (D30, D31) zählen drei Joker nebeneinander als Gruppe. Regenbogenschlangen bringen darin keine Punkte, eine Farbenfusion die Summe der beiden Karten darunter. Die Wertung muss genau das rechnen, und die Tests müssen rot werden, wenn eine Regenbogenschlange plötzlich Punkte bringt.

## Bestanden, wenn

Im Block „D30, D31: Gruppen aus Jokern und Fusionen“ sind alle vier Tests grün: drei Regenbogenschlangen ergeben eine Gruppe „×3=0“ mit 0 Gruppenpunkten, Regenbogenschlange, Fusion aus Grün und Grün, Regenbogenschlange eine Gruppe „×3=6“ mit 6 Punkten. Setzt man in `src/engine/jokerGruppen.ts` den Wert der Regenbogenschlange von 0 auf 1, endet `npx vitest run src/engine/__tests__/regeln/A11_farbgruppen.test.ts` mit 1, und beide D31-Tests sind rot.

## Fehlgeschlagen, wenn

Ein Test des Blocks ist rot, oder nach der Gegenprobe bleiben die D31-Tests grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches, `npm ci` gelaufen, `git status` leer |

## Testdaten

Gegenprobe: in `src/engine/jokerGruppen.ts`, Funktion `jokerPunkte`, die Zeile `if (karte.name === 'Regenbogenschlange') return 0;` auf `return 1;` ändern.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Wertungstests ausführen | `npx vitest run src/engine/__tests__/regeln/A11_farbgruppen.test.ts; echo $?` | Exit 0, die vier Tests „D30, D31: …“ grün |
| 2 | Editor, `src/engine/jokerGruppen.ts` | Gegenprobe einsetzen, speichern | siehe „Testdaten“ | |
| 3 | Git Bash im Repo | Tests wie in Schritt 1 | | Exit 1, rot: „D31: drei Regenbogenschlangen nebeneinander sind eine Gruppe mit 0 Punkten“ und „D30, D31: Regenbogenschlange, Fusion aus Grün und Grün, Regenbogenschlange ist eine Gruppe mit 6 Punkten“ |
| 4 | Git Bash im Repo | zurücksetzen | `git checkout -- src/engine/jokerGruppen.ts` | `git status` leer |

## Nicht abgedeckte Grenzfälle

Drei Farbenfusionen nebeneinander und eine Gruppe aus nur zwei Jokern sind nicht eigens geprüft; D31 nennt Joker allgemein, und zwei Karten sind nach A11 nie eine Gruppe. Ob eine Gruppe nur aus Regenbogenschlangen den Vielfaltbonus erhöht, prüft der Block mit, ist aber eine Folgerung aus A11 und Möglichkeit a von G9, kein Wortlaut des Autors.
