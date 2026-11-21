---
id: TF-ENGINE-055
titel: zugBeendenGesperrt nennt genau dann einen Grund, wenn pruefeAktion das Beenden ablehnt, und zwar denselben.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A5_zug_beenden_grund.test.ts
aenderung: task/O5-karten-spielen (PR #73)
---

## Worum es geht

Die Oberfläche zeigt neben einem gesperrten „Zug beenden“ den Grund, den ihr die Engine mit `zugBeendenGesperrt` nennt. Die Funktion darf keine eigene Regel enthalten: Sie muss in jedem Zustand genau das sagen, was `pruefeAktion` beim Beenden für den Spieler am Zug antwortet.

## Bestanden, wenn

`npx vitest run src/engine/__tests__/regeln/A5_zug_beenden_grund.test.ts` endet mit 0, alle 8 Tests grün. Dazu findet eine unabhängige Probe über gespielte Partien, abgewandelte Zustände und Zufallszustände 0 Abweichungen zwischen `zugBeendenGesperrt` und `pruefeAktion`, und ohne schwebende Karte ist „Zug beenden“ genau dann aufgezählt, wenn kein Grund da ist.

## Fehlgeschlagen, wenn

Ein Test ist rot oder die Probe meldet einen Zustand, in dem Grund und Prüfung auseinanderlaufen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `git status` ohne Änderung ausserhalb von `tagebuch/` |

## Testdaten

Probe: 60 Partien (Saaten 101 bis 160, 2 bis 4 Spieler, mit und ohne Erweiterung, Karten bevorzugt vor „Zug beenden“), an jedem Schritt der Zustand und drei Abwandlungen (keine gespielte Karte; keine gespielte Karte und leere Hand; nur eine gespielte Sonderkarte), dazu `zufallszustand` mit den Saaten 20001 bis 25000.

## Technische Prüfung

Die Probe liegt als vorübergehende Testdatei unter `src/ui/spiel/`, läuft mit `npx vitest run` und wird danach gelöscht. Erwartet: 0 Abweichungen, sowohl gesperrte als auch freie Zustände kommen vor. Gegenprobe: `zugBeendenGesperrt` gibt statt `ergebnis.grund` einen festen Satz zurück; dann werden 6 Tests in `A5_zug_beenden_grund.test.ts` rot.

## Nicht abgedeckte Grenzfälle

Ein ungültiger `zug.spielerIndex` wirft einen TypeError statt einen Grund zu nennen. Nicht geprüft, weil Invarianten und Laden einen solchen Zustand vorher verwerfen.
