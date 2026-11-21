---
id: TF-PRUEF-029
titel: Eine KI-Bewertung, die nur die Sicht nutzt und auf Casts und freie Text-Schlüssel verzichtet, bleibt im Architekturtest ohne Meldung.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.3d-ki-grenze (PR #55)
grenzfall_von: TF-PRUEF-028
status: stillgelegt
---

## Worum es geht

Stillgelegt mit P0.3d, Iteration 3: Seit Rahmen und Strategien getrennt sind, darf eine Strategie weder `anwendeAktion` noch `sichtFuer` aufrufen. Die Frage nach Fehlalarmen beantwortet jetzt TF-PRUEF-032.

Die verschärfte KI-Grenze darf K2 nicht unnötig aufhalten. Geprüft wird, ob übliche Bauweisen einer Bewertung ohne Fehlalarm durchgehen: Maps, Schleifen, Sortieren, eigene Hilfsfunktionen, `werteSchlangen` aus der Engine, Typprädikate, `as const` und eine Zugsuche, die einen Zustand über `anwendeAktion` und `sichtFuer` durchrechnet.

## Bestanden, wenn

Die Probe-Bewertung `zz-k2-bewertung.ts` und die Varianten A (Schleife) und C (`map`) der Probe-Zugsuche erhalten 0 Meldungen. Meldungen gibt es nur an den drei absichtlich eingebauten Stellen: Schreiben in ein `Record<string, number>` mit `spieler.id` als Schlüssel, ein Cast `as FarbkarteLegenAktion[]` und eine Hilfsfunktion, die einen Zustand zurückgibt.

## Fehlgeschlagen, wenn

Der Architekturtest meldet eine Zeile, die nur die Sicht, eine Map, eine Sortierung, `werteSchlangen` oder die Weitergabe an `anwendeAktion` und `sichtFuer` enthält.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Zwei vorübergehende Dateien unter `src/ki/`: `zz-k2-bewertung.ts` (Bewertung aus Paaren, Vielfalt, Punkten, stärkstem Gegner, eine Probe-KI mit Gedächtnis in einer Map) und `zz-k2-zugsuche.ts` (A: Schleife über `ermittleAktionen`, B: `folgezustand` mit Rückgabe des Zustands, C: `map` über die Aktionen).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | beide Dateien anlegen | Inhalt aus dem Beleg `P0.3d-k2-probe-quellen.txt` | `npx tsc -p tsconfig.app.json --noEmit` meldet für sie nichts |
| 2 | Konsole im Repo | Architekturtest laufen lassen | `npx vitest run tests/architektur.test.ts` | genau drei Meldungen: `bewertung.ts` Zeilen 70 und 81, `zugsuche.ts` Zeile 25 |

## Zurücksetzen

Beide Dateien löschen, danach `git status` leer.
