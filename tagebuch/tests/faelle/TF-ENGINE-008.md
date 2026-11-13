---
id: TF-ENGINE-008
titel: Verfälscht man eine Wertungsregel in scoring.ts oder jokerGruppen.ts, wird ein passender Test rot.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/wertung_gesamt.test.ts
aenderung: task/E10-wertung (PR #33)
grenzfall_von: TF-ENGINE-007
---

## Worum es geht

Grüne Tests nützen nur, wenn sie eine falsche Wertung auch bemerken. Deshalb wird jede wichtige Regel im Code absichtlich verfälscht und nachgesehen, ob ein Test rot wird.

## Bestanden, wenn

Jede der Verfälschungen unter „Technische Prüfung“ macht in den Wertungstests mindestens einen Test rot, bei den Proben aus der Satz-für-Satz-Tabelle genau den Test, der die Regel nennt. Nach jedem Lauf ist die Datei wiederhergestellt und `git status` zeigt keine Änderung im Code.

## Fehlgeschlagen, wenn

Nach einer Verfälschung bleiben alle Tests grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E10-wertung`, `npm ci` gelaufen, keine offenen Änderungen |

## Testdaten

Je eine Ersetzung in `src/engine/scoring.ts` oder `src/engine/jokerGruppen.ts`, nach jedem Lauf byte-genau zurückgeschrieben.

## Technische Prüfung

Kettenbonus 5 → 4; Kettenmindestlänge 3 → 2 und → 1; Kettenbonus nur für den ersten Spieler mit der längsten Kette; Sonderkarten unterbrechen die Kette nicht; Ketten mehrerer Schlangen addiert; Kettenbonus im Zwischenstand; fremde geheime Aufgabe im Zwischenstand; Aufgabenpunkte doppelt; nur der erste Punktgleiche gewinnt; Vielfaltbonus auch ohne Erweiterung; Höchstbonus 4 → 5; Vielfaltbonus summiert statt höchster; Fusion bringt nur eine Karte; Regenbogenschlange bringt 1 Punkt; Joker immer Blau; Jokerwahl ohne Vielfaltbonus; Farbreihenfolge umgekehrt; Bonus fertiger Schlangen verworfen; Vielfaltfarben doppelt gezählt; Schlangenende setzt die laufende Gruppe nicht zurück; Suchschlüssel zu eng; Gewicht 1; Joker ohne Gruppe meldet Farbe; Joker am Gruppenanfang nicht als Joker gezählt; geheime Aufgabe in der Endwertung verdeckt; unbekannter Betrachter angenommen; Schlangenblockade unterbricht in der Suche nicht.
