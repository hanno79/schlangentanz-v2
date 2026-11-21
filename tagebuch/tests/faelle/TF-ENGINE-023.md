---
id: TF-ENGINE-023
titel: Abwehr und Schlangengrube folgen A6, A7.2, A7.6 und D33, und jede umgekehrte Regel macht einen Regeltest rot.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A6_reaktion.test.ts
aenderung: task/E4-abwehr-grube (PR #54)
---

## Worum es geht

Eine Sonderkarte gegen Mitspieler wird angesagt und schwebt. Jeder Betroffene wird im Uhrzeigersinn ab dem Angreifer einmal gefragt, abwehren kann nur, wer Farbenschutz hält, und erst danach wirkt die Karte. Die Schlangengrube bleibt vor dem Getroffenen liegen, bis er ausgesetzt hat. Geprüft wird, dass die Regeltests das festhalten: Sie sind auf dem ersten Testcommit rot, auf dem geprüften Stand grün, und sie werden rot, sobald eine dieser Regeln im Code umgedreht wird.

## Bestanden, wenn

- Auf dem ersten Testcommit `56d9da8` enden die neun Testdateien mit Exit 1, rot wegen fehlenden Verhaltens (etwa „Schlangengrube auf spieler-2 ist nicht aufgezählt“, „Szenario schlangengrube fehlt“).
- Auf dem D33-Testcommit `fcba084` enden die neun betroffenen Testdateien mit Exit 1, darunter „D33/E4 Kriterium 3 …“ und beide Geheimnistests „B2/D33 …“.
- Auf dem geprüften Stand enden `npx vitest run src/engine src/ki src/entwicklung/szenarienAbwehr.test.ts` mit Exit 0.
- Jede der Gegenproben in „Testdaten“ macht mindestens einen Test rot, dessen Name zur umgekehrten Regel passt, und `git status` ist danach leer.

## Fehlgeschlagen, wenn

Ein Testcommit grün ist, ein Test auf dem geprüften Stand rot ist oder eine Gegenprobe alle Tests grün lässt. Dann hält kein Test diese Regel fest.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E4-abwehr-grube`, ab Commit `3dbb35b` |
| Ausgangslage prüfen | `git status` leer, `npm ci` gelaufen |

## Testdaten

Gegenproben (Datei: Änderung): T1 `reaktion.ts` Karte wirkt sofort; T3 Betroffene aufsteigend sortiert; T4 Betroffene roh aus dem Register; T6 nur Betroffene mit Farbenschutz gefragt; T7 jede Handkarte als Abwehr angeboten; T8 Prüfung auf Farbenschutz entfernt; T9 Farbenschutz auf den Stapel des Angreifers; T11 `wirke` ohne Abwehrende; T12 `ohneWirkung` immer falsch; T13 Abwehrender zieht sofort nach; T15 `pruefen.ts` Entscheider immer der Spieler am Zug; T17 `zugablauf.ts` ausgesessene Grube auf den Stapel des Aussetzenden; T18 Gruben ohne Zug nie abgelegt; T19 zweite Grube trotz belegtem letzten Zug behalten; T20 `<=` statt `<` in `hatNochLetztenZug`; T21 `serialization.ts` Laden verliert die schwebende Karte; O1 Angreifer selbst gefragt; O2 Wirkung nach der ersten Entscheidung; O3 `schlangengrube.ts` Grube sofort auf den Ablagestapel; O4 Reagieren ohne schwebende Karte erlaubt; O5 abgewehrte Karte auf den Stapel des Abwehrenden; O6 `AbwehrGefragt` verrät, ob der Gefragte Farbenschutz hält.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | ersten Testcommit auschecken und die Testdateien des Commits ausführen | `git switch --detach 56d9da8`, dann `npx vitest run <neun Dateien aus git show --stat>` | Exit 1, „Tests 52 failed“ |
| 2 | Konsole im Repo | D33-Testcommit auschecken und seine Testdateien ausführen | `git switch --detach fcba084`, dann `npx vitest run <Dateien>` | Exit 1, „Tests 34 failed“ |
| 3 | Konsole im Repo | zurück auf den geprüften Stand und die Engine-Tests ausführen | `git switch pruefung-E4`, `npx vitest run src/engine src/ki src/entwicklung/szenarienAbwehr.test.ts` | Exit 0, „Tests 478 passed“ |
| 4 | Konsole im Repo | jede Gegenprobe einzeln einbauen, Tests ausführen, Datei mit `git checkout --` zurücksetzen | Skript `gegenproben.py` im Prüferordner | je Zeile Exit 1 und ein passender roter Testname; am Ende „git status: sauber“ |

## Nicht abgedeckte Grenzfälle

Mehrere Betroffene mit echter Kartenwirkung (Schlangenfrass, Farbendieb, Blockade) prüfen die Tests nur über einen Spion auf dem Kartenregister; die echten Wirkungen kommen mit E5 bis E9. Eine Gegenprobe an den Ereignistexten des Entwicklertischs entfällt, weil die Texte keine Regel tragen.
