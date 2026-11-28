---
id: TF-KI-043
titel: Im ersten Zug setzt die solide KI Comeback-Karte, Risiko-Karte oder Schlangenkorb nur ein, wenn der Zug eine Gruppe vollendet, eine Aufgabe erfüllt, einen Angriff abwehrt oder die Bewertung um mehr als den Haltewert steigt.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-28
veraendert_daten: nein
skript: src/ki/strategien/solideKi_erweiterung_erstzug.test.ts
aenderung: task/K4-ki-erweiterung (PR #125)
grenzfall_von: TF-KI-039
---

## Worum es geht

Plan K4, Kriterium 2 in der Fassung vom 27.11.2026: Im ersten Zug darf die KI die drei Karten der Erweiterung nur mit Nutzen einsetzen. Geprüft wird an Zufallsstarthänden, nicht an ausgesuchten. Der erste Zug wird am echten Zugverlauf bestimmt; ein Zug, den derselbe Spieler nach einer Schlangengrube gleich noch einmal hat, ist kein erster Zug mehr.

## Bestanden, wenn

In ganzen Partien mit Erweiterung, 2 bis 4 Spieler, die solide KI an allen Sitzen, gilt für jeden ersten Zug mit Comeback-Karte oder Schlangenkorb ohne verdeckte Karte: Der Zug vollendet eine Gruppe, erfüllt eine Aufgabe, wehrt einen Angriff ab, oder die Bewertung steigt vom Stand vor dem Einsatz bis zum Zugende um mehr als 2 (`ERSTZUG_HALTEN`). Risiko-Karten setzt sie im ersten Zug nur ein, wenn ihr Erwartungswert die Bewertung um mehr als 2 hebt (im Code geprüft, der Ausgang hängt an der aufgedeckten Karte).

## Fehlgeschlagen, wenn

Ein erster Zug setzt Comeback-Karte oder Korb ein, ohne Gruppe, ohne Aufgabe, ohne Abwehr und mit einem Anstieg der Bewertung von höchstens 2, etwa Korb „aktionen“ mit +0.29.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K4-ki-erweiterung`, `npm ci` gelaufen |

## Testdaten

Partiesaaten 810'000 bis 810'199, Spielerzahl 2 + (Saat mod 3), KI-Saat je Sitz (Saat × 13 + Sitz × 101 + 5).

## Technische Prüfung

Die Probe `zz_pruefer2_k4_erstzug.test.ts` aus dem Beleg nach `src/ki/strategien/` legen, mit `P2_ERSTE`, `P2_ANZAHL` und `P2_AUSGABE` über `npx vitest run` ausführen und danach löschen. Sie schreibt je Partie eine JSON-Zeile mit den Einsätzen im ersten Zug, dem Abgleich von `imErstenZug` gegen den echten Zugverlauf und der Störprobe zu K2.7.

## Nicht abgedeckte Grenzfälle

Ein erster Zug mit abgewehrtem Angriff kommt praktisch nicht vor: Vor dem eigenen ersten Zug hat ein Spieler keine Schlange, die ein Gegner angreifen könnte. Ob eine Risiko-Karte im ersten Zug ihren Erwartungswert hält, lässt sich an einer einzelnen Partie nicht ablesen; dafür steht TF-KI-044.
