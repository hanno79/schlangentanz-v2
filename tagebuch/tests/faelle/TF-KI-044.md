---
id: TF-KI-044
titel: In mindestens 2'000 Spiegelpartien holt die solide KI nicht weniger als 50 % minus zwei Standardfehler gegen dieselbe KI, die im ersten Zug weder Comeback-Karte noch Risiko-Karte noch Schlangenkorb einsetzt.
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

Plan K4, Kriterium 2: Der Haltewert, ab dem die KI im ersten Zug eine der drei Karten einsetzt, muss sich in Partien bewähren. Gemessen wird gegen dieselbe KI, der im ersten Zug diese Karten nicht angeboten werden; jede Saat wird zweimal mit vertauschten Sitzen gespielt.

## Bestanden, wenn

Über mindestens 2'000 Partien zu zweit mit Erweiterung erreicht die gelieferte KI (Sieg 1, geteilter Sieg 0.5) einen Anteil, der nicht unter 50 % minus zwei Standardfehler liegt; bei 2'000 Partien ist das etwa 47.8 %.

## Fehlgeschlagen, wenn

Der Anteil liegt unter dieser Grenze, etwa 46 % bei 2'000 Partien.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K4-ki-erweiterung`, `npm ci` gelaufen |

## Testdaten

Partiesaaten 700'000 bis 700'999, je zwei Partien (gelieferte KI an Sitz 0 und an Sitz 1), KI-Saat je Sitz (Saat × 31 + Sitz × 7 + 12'345). Der erste Zug ist der erste eigene Zug nach dem echten Zugverlauf.

## Technische Prüfung

Die Probe `zz_pruefer2_k4_spiegel.test.ts` aus dem Beleg nach `src/ki/strategien/` legen, in fünf Teilen zu je 200 Saaten nacheinander mit `P2_ERSTE`, `P2_ANZAHL` und `P2_AUSGABE` über `npx vitest run` ausführen und danach löschen. Ausgewertet werden Anteil, Standardfehler über die Partien und über die Saatpaare.

## Nicht abgedeckte Grenzfälle

Partien mit drei oder vier Spielern: Eine Spiegelpartie braucht genau zwei Teilnehmer, deshalb nur zu zweit. Der erste Zug nach einer Schlangengrube, die den Gegner aussetzen lässt, gilt in der Probe noch als erster Zug, wenn derselbe Spieler gleich wieder dran ist; das betrifft nur wenige Partien und nur die Vergleichs-KI.
