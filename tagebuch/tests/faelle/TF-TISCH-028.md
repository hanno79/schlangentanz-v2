---
id: TF-TISCH-028
titel: Nach Spielende ist in der Sicht des Tischs niemand mehr am Zug, auch wenn die Engine den zuletzt Spielenden noch als Zugstelle führt.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ui/spiel/tischAnsicht.ende.test.ts
aenderung: task/O8-spielende (PR #77)
---

## Worum es geht

Die Engine lässt nach Spielende die Zugstelle beim zuletzt Spielenden stehen. Der Tisch darf daraus kein „ist dran“ machen, sonst sieht es aus, als ginge die Partie weiter.

## Bestanden, wenn

Für einen beendeten Stand (Szenario `wertung-beispiele` und ganze Partien aus Saat 3 mit 2 und Saat 8 mit 4 Spielern) liefert `tischAnsicht` bei keinem Platz `amZug: true`, und `status.amZug` ist `null`. Für die laufende Schlussrunde `schlussrunde-ohne-dich` ist genau KI-Gegner 1 am Zug.

## Fehlgeschlagen, wenn

Nach Spielende trägt ein Platz `amZug: true` oder die Statuszeile nennt jemanden, der dran ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Quellstand ab Commit 0b0d639, `npx vitest run` |

## Testdaten

Szenarien `wertung-beispiele` und `schlussrunde-ohne-dich`, Saaten 3 und 8.

## Technische Prüfung

`npx vitest run src/ui/spiel/tischAnsicht.ende.test.ts src/ui/tisch/Zwischenstand.test.tsx` endet mit 0. Gegenprobe: `amZug: !beendet && …` in `src/ui/spiel/tischAnsicht.ts` zu `amZug: …` ändern; dann werden drei Tests in `tischAnsicht.ende.test.ts` rot.

## Nicht abgedeckte Grenzfälle

Der Tisch selbst ist nach Spielende nicht mehr zu sehen, weil die Wertung ihn ersetzt; geprüft wird die Sicht und die Komponente im Test. Den Entwicklertisch prüft TF-DEV-040.
