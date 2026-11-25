---
id: TF-ENGINE-051
titel: Der lange Dauerlauf mit 3'000 Zufallspartien, davon 2'000 mit Erweiterung, endet grün, und keine Aufzählung überschreitet 20'000 Aktionen.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/dauerlauf_lang.ts
aenderung: task/E11-abnahme-basis (PR #72), task/X7-abnahme-erweiterung
---

## Worum es geht

Der lange Dauerlauf spielt 3'000 Zufallspartien mit 2, 3 und 4 Spielern: 1'000 ohne und 2'000 mit Erweiterung. In jedem Schritt prüft er Invarianten, Speichern und Laden, jede aufgezählte Aktion, eine verfälschte Aktion, die Handgrenze von 5 Karten nach dem eigenen Zugende und den leeren Stapel nur in Schlussrunde oder nach Spielende. Dazu zählt er, wie viele Aktionen die Engine in einem Zustand aufzählt und wie oft die Teile der Erweiterung gespielt werden: eingelöste offene und erfüllte geheime Aufgaben, Comeback-Karten, Risiko-Karten mit Erfolg und Misserfolg, Entscheidungen eines Gegners und der Schlangenkorb.

## Bestanden, wenn

`npm run test:dauerlauf` endet mit 0 (4 Testdateien, 4 Tests grün). In jedem der vier Teile kommt jeder Teil der Erweiterung mindestens so oft vor, wie `ERWEITERUNG_MINDESTENS` in `dauerlauf_lang.ts` verlangt, und keine Aufzählung überschreitet die Schranke `HOECHSTE_AKTIONSZAHL_IM_DAUERLAUF` von 20'000 Aktionen. Am ungünstigsten Tisch ohne Schlangenkorb aus `legal_actions_umfang.test.ts` zählt die Engine 39'377 Aktionen, jede davon erlaubt.

## Fehlgeschlagen, wenn

Eine Partie endet nicht regulär, ein Prüfer meldet einen Verstoss, eine verfälschte Aktion wird erlaubt, eine Aufzählung überschreitet 20'000 Aktionen, ein Teil der Erweiterung kommt in einem Teil seltener vor als verlangt, oder der Befehl endet nicht mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `npm ci` gelaufen |

## Testdaten

Saaten 1 bis 1000 ohne Erweiterung und 1001 bis 3000 mit Erweiterung, reihum 2, 3 und 4 Spieler, je Teil 250 ohne und 500 mit (`partienDesTeils` in `dauerlauf_lang.ts`).

## Technische Prüfung

`npm run test:dauerlauf` (Laufzeit am 25.11.2026 rund 3 1/2 Minuten auf 32 Kernen). Die Zählungen je Teil gibt der Lauf mit `npx vitest run --mode dauerlauf --silent=false` aus, Zeile „E11-Dauerlauf Teil n“.

## Nicht abgedeckte Grenzfälle

Die Schranke für den ungünstigsten Tisch ohne Schlangenkorb (39'377) beruht auf einer Überlegung, nicht auf einem Beweis; das sagt der Test selbst. Mit dem Tausch des Schlangenkorbs (D44) und einer Hand über 5 Karten sind rechnerisch rund 105'000 Aktionen möglich (sieben Farbkarten auf der Hand, die übrigen 71 Farbkarten in eigenen Schlangen); gemessen ist dieser Tisch nicht, und die Schranke von 20'000 gilt nur für die Zustände des Dauerlaufs. Der Dauerlauf wählt gleichverteilt, sehr unwahrscheinliche Lagen kommen in ihm nicht vor.
