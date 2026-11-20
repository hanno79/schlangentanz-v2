---
id: TF-KI-004
titel: Ein Turnier mit gleicher Saat ergibt Zug für Zug denselben Verlauf, eine andere Saat einen anderen.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/ki/turnier.test.ts
aenderung: task/K1-ki-schnittstelle
---

## Worum es geht

Ohne Wiederholbarkeit lässt sich ein Fehler in einer Turnierpartie nicht nachstellen, und die Schwellen von K5 wären vom Zufall abhängig. Aller Zufall muss deshalb aus der Saat kommen, nie aus `Math.random` (U4).

## Bestanden, wenn

Zwei Turniere mit denselben Optionen sind gleich (`toEqual`), eine um 1 verschobene Saat ergibt in Partie 0 einen anderen Verlauf, und `Math.random` wird nie gerufen. In der Probe des Prüfers gilt das auch zu viert mit Erweiterung und mit Saat 0 (163 Schritte, beide Läufe gleich).

## Fehlgeschlagen, wenn

Zwei Läufe mit gleicher Saat sich in einem Schritt unterscheiden, zwei Saaten denselben Verlauf ergeben oder `Math.random` gerufen wird.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K1-ki-schnittstelle`, `npm ci` gelaufen |

## Testdaten

Umsetzer: Saat 9 und 10, zwei Spieler mit Erweiterung. Prüfer: Saat 0 und 3, vier Spieler mit Erweiterung, je 3 Partien.

## Technische Prüfung

`npx vitest run src/ki/turnier.test.ts src/ki/zufallsKi.test.ts` endet mit Exit 0. Gegenprobe: In `src/ki/zufallsKi.ts` `Math.random() * 0 +` vor `zufall()` setzen; dann wird „U4: das Turnier zieht keinen eigenen Zufall“ rot.

## Nicht abgedeckte Grenzfälle

Negative und sehr grosse Saaten sind nicht eigens geprüft; `erzeugeZufall` nimmt jede Zahl mit `>>> 0` auf 32 Bit.
