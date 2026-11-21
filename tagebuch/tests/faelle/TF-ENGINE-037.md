---
id: TF-ENGINE-037
titel: Der Farbendieb verhält sich auch im zweiten Zug, bei einer Grube vor dem Bestohlenen, bei einer neuen und einer zweiten Schlange, bei einer zurückbleibenden Fusion und bei unförmigen Ansagen richtig.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E8-farbendieb (PR #67)
grenzfall_von: TF-ENGINE-035
---

## Worum es geht

Geprüft werden fünf Fälle, die der Plan nicht nennt. Der Farbendieb wird im zweiten Zug nach einem Verdoppler gespielt, und einmal muss der Bestohlene wegen einer Grube aussetzen, darf aber trotzdem abwehren (D18). Ein Dieb ohne Schlange beginnt mit der gestohlenen Karte eine und danach mit einer Farbkarte eine zweite, aber keine dritte. Beim Gegner bleibt nach dem Diebstahl nur eine Fusion in der Schlange zurück. Zuletzt gehen Ansagen mit falsch geformten Feldern an die Engine.

## Bestanden, wenn

G1: im Teilzug 2 wird gestohlen, die Schlange heisst danach Gelb, Rot, `gespielteSonderkarten` ist 1. G2: KarteAngesagt nennt `betroffene: [1]`, Spieler 2 wehrt ab, seine Schlange bleibt Blau. G3: Nach dem Diebstahl und einer Farbkarte hat der Dieb 2 Schlangen mit verschiedenen Ids, Speichern und Laden ändert nichts, im nächsten Zug ist keine neue Schlange angeboten. G4: Beim Gegner bleibt eine Schlange nur mit der Fusion und Blau, Blau darunter; der Schritt lässt sich nachrechnen. G5: vier unförmige Ansagen werden mit deutschem Grund abgelehnt.

## Fehlgeschlagen, wenn

Einer der fünf Tests im Prüfskript rot wird oder die Engine bei G5 wirft statt abzulehnen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E8-farbendieb`, Stand ab Commit `bb19f19`, `npm ci` gelaufen |
| Ausgangslage prüfen | `git status` leer |

## Testdaten

Prüfskript `zz_pruefer_e8.test.ts` (Teil „eigene Grenzfälle“, G1 bis G5), als Beleg des Laufs abgelegt. G5 nutzt `ziel: { art: 'fremd' }`, `position: 0.5`, eine Quelle ohne `karteId` und eine Farbkarte als gespielte Karte.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfskript aus dem Beleg nach `src/engine/__tests__/zz_pruefer_e8.test.ts` kopieren | – | Datei neu |
| 2 | Konsole im Repo | nur die Grenzfälle ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e8.test.ts -t "eigene Grenzfälle" --silent=false` | Exit 0, 5 Tests grün; Zeile „G5“ mit vier deutschen Gründen |
| 3 | Konsole im Repo | Prüfskript löschen | – | `git status` leer |

## Nicht abgedeckte Grenzfälle

Ein Farbendieb in der Schlussrunde ist nicht eigens geprüft; die Schlussrunde ändert an der Wirkung nichts, und der Dauerlauf spielt sie mit. Eine Karte mit Wert 0 gibt es im Spiel nicht.
