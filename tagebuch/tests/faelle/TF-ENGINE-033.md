---
id: TF-ENGINE-033
titel: Der Schlangenfrass frisst mit a) eine eigene Karte, mit b) eine eigene Blockade und mit c) zwei Karten der Mitspieler ohne deren Blockaden, wer abwehrt, behält seine Karten, und die Tests dafür werden rot, sobald eine dieser Regeln im Code fehlt.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E6-schlangenfrass (PR #68)
skript: src/engine/__tests__/schlangenfrass.test.ts
---

## Worum es geht

E6 setzt den Schlangenfrass nach A7.4 und A6 Beispiel 2 um. Geprüft wird, dass die Regeltests auf dem ersten Commit rot und auf dem geprüften Stand grün sind. Danach wird die Karte an fünf Stellen absichtlich verfälscht, und jedes Mal muss ein passender Test rot werden.

## Bestanden, wenn

- Auf dem ersten Commit `a420880` scheitern alle 42 Tests der drei Dateien, weil der Schlangenfrass dort noch ein Platzhalter ist und die Szenarien fehlen.
- Auf dem geprüften Stand laufen die 45 Tests der drei Dateien grün.
- Jede der fünf Verfälschungen macht mindestens einen Test rot: Abwehr übergehen, gegnerische Blockaden zulassen, Karten unter der Fusion umgekehrt einsetzen, Schlangenfrass nach den gefressenen Karten ablegen, „zwei, sofern möglich“ streichen.

## Fehlgeschlagen, wenn

Ein Test auf dem ersten Commit grün ist, ein Test auf dem geprüften Stand scheitert oder eine Verfälschung keinen Test rot macht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E6-schlangenfrass`, `npm ci` gelaufen |

## Testdaten

Die Tische bauen die Testdateien selbst; es gibt keine äusseren Daten.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Worktree | `git switch --detach a420880`, die drei Testdateien ausführen | Befehl unter „Technische Prüfung“ | 42 failed, Grund: Platzhalter oder fehlendes Szenario |
| 2 | Git Bash im Worktree | zurück auf den geprüften Stand, dieselben Tests | | 45 passed |
| 3 | `src/engine/karten/schlangenfrass.ts`, `wirke` | `!abgewehrt.includes(besitzer)` entfernen, Tests ausführen, zurücksetzen | | Tests zu A6 Beispiel 2 „nur B/C wehrt ab“ rot |
| 4 | dieselbe Datei, `gegnerischeZiele` | Filter `!istBlockade` entfernen, Tests, zurücksetzen | | Test zu Kriterium 3 rot |
| 5 | dieselbe Datei, `friss` | Karten unter der Fusion umgekehrt einsetzen, Tests, zurücksetzen | | Test zu Kriterium 6 „links zuerst“ rot |
| 6 | dieselbe Datei, `wirke` | `legeAufEigenenAblagestapel` hinter die Schleife verschieben, Tests, zurücksetzen | | Tests zur Ablagereihenfolge rot |
| 7 | dieselbe Datei, `pruefeOption` | die Bedingung „zwei, sofern möglich“ durch `false` ersetzen, Tests, zurücksetzen | | Test zu Kriterium 2 rot; danach `git status` ohne Änderung |

## Technische Prüfung

`npx vitest --run src/engine/__tests__/schlangenfrass.test.ts src/engine/__tests__/schlangenfrass_abwehr.test.ts src/entwicklung/szenarienFrass.test.ts` auf dem ersten Commit (erwartet: 42 failed) und auf dem geprüften Stand (erwartet: 45 passed). Danach je Verfälschung in `src/engine/karten/schlangenfrass.ts` dieselben Tests, erwartet mindestens ein Fehlschlag, dann `git checkout -- src/engine/karten/schlangenfrass.ts`.

## Nicht abgedeckte Grenzfälle

Eigene Grenzfälle und Zufallspartien stehen in TF-ENGINE-034.
