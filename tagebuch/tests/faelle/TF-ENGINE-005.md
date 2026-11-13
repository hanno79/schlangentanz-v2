---
id: TF-ENGINE-005
titel: Ein Test wird rot, wenn die geheimen Aufgaben ungemischt verteilt oder die Handkarten vor dem Mischen ausgeteilt werden.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/material.test.ts
aenderung: task/E1-struktur (PR #31), Commit 96b1650
grenzfall_von: TF-ENGINE-001
---

## Worum es geht

A4 sagt zuerst „mischen“ und dann „austeilen“, für die Spielkarten wie für die Aufgaben. Wer das vertauscht, gibt jedem Spieler in jeder Partie dieselben Starthandkarten oder dieselbe geheime Aufgabe, und der Rest der Partie sieht trotzdem gemischt aus. Ein Test muss das bemerken.

## Bestanden, wenn

Jede der beiden Änderungen in `src/engine/state.ts` macht mindestens einen Test von `npm test` rot: (a) die geheimen Aufgaben vor dem Mischen aus dem ungemischten Aufgabenstapel verteilen, danach den Rest mischen; (b) in `erstellePartie` erst aus dem ungemischten Tisch austeilen und danach nur den Nachziehstapel mischen.

## Fehlgeschlagen, wenn

Nach (a) bekommt Spieler 1 bei jeder Saat „Farbenpracht“ (`aufgabe-01`) und Spieler 2 „Farbharmonie“ (`aufgabe-02`), oder nach (b) hat Spieler 1 bei jeder Saat `blau-01`, `blau-03`, `blau-05`, `blau-07`, `blau-09` auf der Hand, und trotzdem bleiben alle Tests grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E1-struktur`, `npm ci` gelaufen, keine offenen Änderungen |

## Testdaten

Die Änderungen (a) und (b) unter „Technische Prüfung“.

## Technische Prüfung

(a) In `erstelleTisch` die drei Zeilen ab `const aufgabenStapel = …` ersetzen durch: `const ungemischt = erweiterung ? erstelleAufgabenStapel() : []; for (const einzelner of spieler) einzelner.geheimeAufgabe = ungemischt.shift() ?? null; const aufgabenStapel = mische(ungemischt); const offeneAufgaben = aufgabenStapel.splice(0, OFFENE_AUFGABEN);`. `npx vitest run` ausführen, Exit-Code lesen, `git checkout -- src/engine/state.ts`.

(b) In `erstellePartie` `erstelleTisch({ spielerzahl, erweiterung, zufall })` durch `erstelleTisch({ spielerzahl, erweiterung })` ersetzen, nach `teileReihumAus(zustand)` den Nachziehstapel mit `mischeDeck(zustand.nachziehstapel, zufall)` mischen und die Aufgaben aus einem zweiten, gemischten `erstelleTisch` übernehmen. `npx vitest run` ausführen, Exit-Code lesen, zurücksetzen.
