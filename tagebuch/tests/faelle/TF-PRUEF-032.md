---
id: TF-PRUEF-032
titel: Eine K2-Bewertung als Strategie, die nur die Sicht nutzt, bleibt im Architekturtest ohne Meldung und spielt Partien zu Ende.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.3d-ki-grenze (PR #55)
grenzfall_von: TF-PRUEF-028
---

## Worum es geht

Die Strategien unter `src/ki/strategien/` dürfen fast nichts importieren und keinen Zustandstyp erwähnen. K2 soll trotzdem ohne Umwege bauen können. Geprüft wird eine Bewertung, wie K2 sie schreiben würde: eine `Map` zum Zählen, Sortieren, `werteSchlangen` auf den Schlangen der Sicht, Konstanten der Engine und eine kleine Vorausschau auf einer Abschrift der eigenen Schlangen.

## Bestanden, wenn

Die Probe `zz_k2_bewertung.ts` bekommt 0 Meldungen, `npx tsc -p tsconfig.app.json --noEmit` endet mit 0, und 20 Turnierpartien gegen die Zufalls-KI enden alle mit dem Ausgang `beendet`.

## Fehlgeschlagen, wenn

Die Probe bekommt eine Meldung, die keinen echten Verstoss betrifft, oder eine der 20 Partien endet mit `invariante` oder `schrittgrenze` oder mit einer Ausnahme.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Probe `zz_k2_bewertung.ts` aus dem Prüfprotokoll P0.3d, Iteration 2, mit `erstelleSolideKi(zufall)`; Turnier mit 2 Teilnehmern (Probe und Zufalls-KI), 20 Partien ab Saat 1, ohne Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Probe nach `src/ki/strategien/` kopieren | | `git status` zeigt nur die neue Datei |
| 2 | Konsole im Repo | Architekturtest laufen lassen | `npx vitest run tests/architektur.test.ts tests/architektur_ki.test.ts` | Exit 0, keine Zeile mit `zz_k2_bewertung.ts` |
| 3 | Konsole im Repo | Typprüfung der App | `npx tsc -p tsconfig.app.json --noEmit` | Exit 0 |
| 4 | Konsole im Repo | Turnier laufen lassen, etwa in einer vorübergehenden Testdatei | `turnier({ teilnehmer: [Probe, Zufalls-KI], partien: 20, erweiterung: false })` | 20-mal `beendet` |
| 5 | Konsole im Repo | Probe wieder löschen | | `git status` leer |

## Nicht abgedeckte Grenzfälle

Eine Zugsuche über mehrere Züge auf einem erratenen Zustand ist nicht dabei; dafür fehlt die Determinisierung im Rahmen, die der Plan erst für K2 vorsieht.
