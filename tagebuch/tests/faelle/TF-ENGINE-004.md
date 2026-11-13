---
id: TF-ENGINE-004
titel: Speichern und Laden ergibt denselben Zustand, und ein Spielstand im alten Format 1 wird verworfen.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/speicherformat.test.ts
aenderung: task/E1-struktur (PR #31)
---

## Worum es geht

Eine Partie muss einen Reload überstehen, ohne sich zu verändern. Alte Spielstände aus der Zeit vor dem Neuaufbau passen nicht mehr zu den Regeln und werden verworfen, nicht umgebaut.

## Bestanden, wenn

200 Zufallszustände aus dem Baukasten (Saaten 5000 bis 5199) und die sechs Startpartien (2, 3, 4 Spieler, mit und ohne Erweiterung) sind nach `deserialisiere(serialisiere(z))` gleich `z`. Ein Spielstand, den die alte Engine (`origin/neuaufbau`, `erstelleSpielzustand` und `serialisiere`) schreibt, trägt `version: 1`, `deserialisiere` lehnt ihn mit „Format 1“ ab, und `ladeSpielstand` liefert `null` und löscht den Eintrag im `localStorage`.

## Fehlgeschlagen, wenn

Ein Zustand nach dem Laden abweicht oder der alte Spielstand geladen wird.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E1-struktur`, `npm ci` gelaufen, alte Engine aus `origin/neuaufbau` per `git archive` als Kopie verfügbar |

## Testdaten

Saaten 5000 bis 5199 für `zufallszustand`; alter Spielstand aus `erstelleSpielzustand(3, erzeugeZufall(9))` der alten Engine.

## Technische Prüfung

Eigene Testdatei des Prüfers mit der alten Engine als vorübergehender Kopie unter `src/`; `npx vitest run` endet mit 0.

## Nicht abgedeckte Grenzfälle

Ein Spielstand mit nur KI-Spielern oder mit zwei Menschen lädt ohne Befund; der Umsetzer hält das für gewollt (Turniere nur mit KI, K5).
