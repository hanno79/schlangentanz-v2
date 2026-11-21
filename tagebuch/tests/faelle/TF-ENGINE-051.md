---
id: TF-ENGINE-051
titel: Der lange Dauerlauf mit 2'000 Zufallspartien endet grün, und keine Aufzählung überschreitet 6'000 Aktionen.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/dauerlauf_lang.ts
aenderung: task/E11-abnahme-basis (PR #72)
---

## Worum es geht

Der lange Dauerlauf spielt 2'000 Zufallspartien mit 2, 3 und 4 Spielern, je zur Hälfte mit und ohne Erweiterung. In jedem Schritt prüft er Invarianten, Speichern und Laden, jede aufgezählte Aktion, eine verfälschte Aktion, die Handgrenze von 5 Karten nach dem eigenen Zugende und den leeren Stapel nur in Schlussrunde oder nach Spielende. Dazu gehört die Zahl der Aktionen, die die Engine in einem Zustand aufzählt.

## Bestanden, wenn

`npm run test:dauerlauf` endet mit 0 (4 Testdateien, 4 Tests grün). Eine eigene Zählung über dieselben 2'000 Partien findet höchstens 6'000 Aktionen in einem Zustand. Am ungünstigsten Tisch aus `legal_actions_umfang.test.ts` zählt die Engine 39'375 Aktionen, jede davon erlaubt.

## Fehlgeschlagen, wenn

Eine Partie endet nicht regulär, ein Prüfer meldet einen Verstoss, eine verfälschte Aktion wird erlaubt, eine Aufzählung überschreitet 6'000 Aktionen oder der Befehl endet nicht mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `npm ci` gelaufen |

## Testdaten

Saaten 1 bis 1000 ohne Erweiterung und 1001 bis 2000 mit Erweiterung, reihum 2, 3 und 4 Spieler (`partienDesTeils` in `dauerlauf_lang.ts`).

## Technische Prüfung

`npm run test:dauerlauf` (Laufzeit rund 2 bis 3 Minuten). Für die Zahl der Aktionen eine eigene Zählung mit `ermittleAktionen` als Motor über `partienDesTeils(1)` bis `partienDesTeils(4)`; erwartet: alle 2'000 Partien beendet, höchste Aktionszahl ≤ 6'000.

## Nicht abgedeckte Grenzfälle

Die Schranke für den ungünstigsten Tisch (39'375) beruht auf einer Überlegung, nicht auf einem Beweis; das sagt der Test selbst. Der Dauerlauf wählt gleichverteilt, sehr unwahrscheinliche Lagen kommen in ihm nicht vor.
