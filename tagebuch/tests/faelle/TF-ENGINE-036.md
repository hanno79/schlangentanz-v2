---
id: TF-ENGINE-036
titel: Die Farbenfusion folgt A7.7, D9, D10, D20, D25, D27 und D30, und jede umgekehrte Regel macht einen Regeltest rot.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/farbenfusion.test.ts
aenderung: task/E7-farbenfusion (PR #65)
---

## Worum es geht

Die Farbenfusion kommt auf zwei nebeneinanderliegende Farbkarten derselben Farbe in jeder Schlange am Tisch. Die beiden Karten bleiben links zuerst unter ihr liegen, beim Mitspieler wird sie angesagt und ist abwehrbar, und je Zug geht nur eine. Geprüft wird, dass die Regeltests das festhalten: Sie sind auf dem ersten Testcommit rot, auf dem geprüften Stand grün, und sie werden rot, sobald eine dieser Regeln im Code umgedreht wird.

## Bestanden, wenn

- Auf dem ersten Testcommit `64258d8` enden die drei Testdateien mit Exit 1 und „Tests 39 failed | 1 passed (40)“; rot, weil die Karte noch ein Platzhalter ohne Ziel ist.
- Auf dem geprüften Stand enden `farbenfusion.test.ts`, `farbenfusion_wertung.test.ts`, `szenarienFarbenfusion.test.ts`, `dauerlauf.test.ts`, `kartenversetzt.test.ts` und `aktionen.test.ts` mit Exit 0.
- Jede Gegenprobe aus „Testdaten“ macht mindestens einen Test rot, dessen Name zur umgekehrten Regel passt, und `farbenfusion.ts` ist danach wieder unverändert.

## Fehlgeschlagen, wenn

Der Testcommit grün ist, ein Test auf dem geprüften Stand rot ist oder eine Gegenprobe alle Tests grün lässt. Dann hält kein Test diese Regel fest.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E7-farbenfusion`, ab Commit `e48c49e` |
| Ausgangslage prüfen | `git status` leer, `npm ci` gelaufen |

## Testdaten

Gegenproben in `src/engine/karten/farbenfusion.ts`: G1 Reihenfolge unter der Fusion vertauscht (`unter: [unter[1], unter[0]]`); G2 `betroffene` liefert immer `[]`; G3 `gleichfarbig` lässt Sonderkarten zu; G4 `ziele` im zweiten Zug nach einem Verdoppler leer; G5 die Prüfung `farbenfusionGespielt` in `ziele` und `pruefe` entfernt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | ersten Testcommit auschecken und seine Testdateien ausführen | `git checkout 64258d8`, dann `npx vitest --run src/engine/__tests__/farbenfusion.test.ts src/engine/__tests__/farbenfusion_wertung.test.ts src/entwicklung/szenarienFarbenfusion.test.ts` | Exit 1, „39 failed“ |
| 2 | Konsole im Repo | zurück auf den geprüften Stand und die Tests aus „Bestanden, wenn“ ausführen | `git checkout pruefung-E7`, dann `npx vitest --run <sechs Dateien>` | Exit 0, „Tests 112 passed“ |
| 3 | Konsole im Repo | jede Gegenprobe einzeln einbauen, die drei E7-Testdateien ausführen, Datei zurückkopieren | Skript `gp.sh` im Prüferordner | G1 4 rot, G2 14 rot, G3 4 rot, G4 2 rot, G5 1 rot |

## Nicht abgedeckte Grenzfälle

Das Entfernen einer Fusion mit Schlangenfrass prüft E6; in E7 ist Schlangenfrass noch ein Platzhalter. Aufgaben, bei denen die Fusion eine Farbe annimmt, kommen mit X2. Die eigenen Grenzfälle stehen in TF-ENGINE-037.
