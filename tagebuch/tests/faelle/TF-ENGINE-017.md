---
id: TF-ENGINE-017
titel: Eine Gruppe nur aus Regenbogenschlangen bringt keine Farbe für den Vielfaltbonus, bleibt aber eine Gruppe mit 0 Punkten.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A11_vielfalt.test.ts
aenderung: task/E10b-vielfalt-regenbogen (PR #52)
---

## Worum es geht

Der Autor hat am 20.11.2026 geantwortet, dass eine Regenbogenschlange beim Vielfaltbonus nicht zählt (D32). Drei Regenbogenschlangen nebeneinander sind nach D31 weiter eine Gruppe mit 0 Punkten, bringen aber keine zusätzliche Farbe. Die Wertung darf sie auch bei der Jokerwahl nicht als neue Farbe ansetzen, nur damit der Bonus steigt.

## Bestanden, wenn

Die Schlange Rot, Rot, Rot, Blau, Blau, Blau, Gelb, Gelb, Gelb, Schlangenblockade, Regenbogenschlange, Regenbogenschlange, Regenbogenschlange ergibt die Gruppen 3, 3, 3 und 0 Punkte, die Farben für den Vielfaltbonus Blau, Rot und Gelb und den Vielfaltbonus 2. Ohne Blockade bekommen die drei Regenbogenschlangen die Farbe Blau, und der Bonus bleibt 2. Mit vier Regenbogenschlangen hinter Rot³, Blau³, Gelb, Gelb wird die erste Gelb (8 Gruppenpunkte), der Bonus ist 2. Am Entwicklertisch zeigt `wertung-vielfalt-regenbogen` für Spieler 1 „Farben für den Vielfaltbonus: Blau, Rot, Gelb, Vielfalt 2“ und die Summe 16.

## Fehlgeschlagen, wenn

Die Regenbogen-Gruppe als vierte Farbe zählt (Bonus 3), sie ganz aus den Gruppen verschwindet oder die Jokerwahl sie als Violett ansetzt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches ab Commit 4c83fb0, `npm ci` gelaufen, `git status` leer |

## Testdaten

Schlange A: Rot, Rot, Rot, Blau, Blau, Blau, Gelb, Gelb, Gelb, Schlangenblockade, Regenbogenschlange ×3. Schlange B: wie A ohne Blockade. Schlange C: Rot ×3, Blau ×3, Gelb ×2, Regenbogenschlange ×4. Alle mit Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Vielfalttests ausführen | `npx vitest run src/engine/__tests__/regeln/A11_vielfalt.test.ts src/engine/__tests__/regeln/A11_farbgruppen.test.ts; echo $?` | Exit 0, der Block „D32: eine Gruppe nur aus Regenbogenschlangen …“ mit 6 grünen Tests |
| 2 | Browser, `http://localhost:<port>/dev?szenario=wertung-vielfalt-regenbogen` (Testhook-Build) | bis zum Abschnitt „Wertung“ scrollen | | Spieler 1: „Blau×3 = 0“, „Farben für den Vielfaltbonus: Blau, Rot, Gelb, Vielfalt 2“, „Summe 16“ |

## Nicht abgedeckte Grenzfälle

Eine Gruppe aus Regenbogenschlangen und einer Farbenfusion ohne Farbkarte ist offen (Rückfrage an den Autor) und zählt bis zur Antwort nach D31 als Farbe; dieser Testfall prüft sie nicht. Regenbogenschlangen vor einer Farbkarte (TF-ENGINE-018) und allein in einer zweiten Schlange (TF-ENGINE-019) sind eigene Testfälle. Ohne Erweiterung gibt es keinen Vielfaltbonus; das prüft E10.
