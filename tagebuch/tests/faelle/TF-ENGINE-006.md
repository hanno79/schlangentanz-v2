---
id: TF-ENGINE-006
titel: Schaltet man eine einzelne Prüfung in pruefeInvarianten oder im Szenario-Baukasten ab, wird mindestens ein Test rot.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/invarianten.test.ts
aenderung: task/E1-struktur (PR #31), Commit 96b1650
grenzfall_von: TF-ENGINE-003
---

## Worum es geht

Die Invarianten prüfen jeden Zustand, den spätere Engine-Tasks erzeugen. Fehlt einer Prüfung der Test, fällt das erst auf, wenn ein kaputter Zustand unbemerkt durchgeht. Deshalb wird jede einzelne Prüfung abgeschaltet und nachgesehen, ob ein Test es merkt.

## Bestanden, wenn

Jede der 15 Änderungen unter „Technische Prüfung“ macht in `npx vitest run src/engine` mindestens einen Test rot, und der rote Test nennt die abgeschaltete Regel.

## Fehlgeschlagen, wenn

Nach einer der Änderungen bleiben alle Tests grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E1-struktur`, `npm ci` gelaufen, keine offenen Änderungen |

## Testdaten

Je eine Änderung in `src/engine/invarianten.ts` oder `src/engine/testing/szenario.ts`, nach jedem Lauf zurückgesetzt.

## Technische Prüfung

`invarianten.ts`: Doppelt erst ab 3 statt ab 2; ausliegende Gruben nicht mitzählen; mehr als 4 statt 3 offene Aufgaben erlaubt; Comeback/Risiko auf falschem Platz nicht melden; 3 Schlangen erlaubt; leere Schlange nicht melden; Schlangen-Ids nicht auf Eindeutigkeit prüfen; Fusion über zwei Farben erlauben; Grube vor dem eigenen Spieler nicht melden; Angreifer unter den Betroffenen nicht melden; fehlende Karten einer schwebenden Aktion nicht melden; laufende Partie mit leerem Stapel nicht melden. `szenario.ts`: Bauschritt bei Fehler nicht zurücksetzen; `zustand()` ohne Invariantenprüfung; fehlendes Material erfinden statt ablehnen.
