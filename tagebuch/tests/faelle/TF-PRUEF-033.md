---
id: TF-PRUEF-033
titel: Der Isolationstest wird rot, sobald Instanzen einer Strategie über ein Objekt ihres Moduls Wissen teilen.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: tests/strategie_isolation.test.ts
aenderung: task/P0.3d-ki-grenze (PR #55)
---

## Worum es geht

Mehrere KI-Gegner derselben Strategie laufen aus demselben Modul. Liegt dort ein Objekt, das alle Instanzen beschreiben können, kennt jede KI die Hand der anderen. Der Isolationstest spielt dieselben Partien einmal mit allen Instanzen aus einem Modul und einmal mit jeder Instanz aus einem frisch geladenen Modul und verlangt gleiche Entscheidungen. Hier wird geprüft, dass er jeden solchen Kanal tatsächlich bemerkt, auch einen, den die statische Regel durchlässt.

## Bestanden, wenn

Jede Angriffsdatei aus den Testdaten, allein unter `src/ki/strategien/` eingesetzt, macht `npx vitest run tests/strategie_isolation.test.ts` rot (Exit 1), und zwar mit der Meldung „… verhält sich mit geteiltem Modul anders als mit getrennten Modulen; Instanzen teilen Wissen“ für ihre Fabriken. Ohne Angriffsdatei endet der Test mit Exit 0.

## Fehlgeschlagen, wenn

Eine Angriffsdatei bleibt grün, obwohl ihre Instanzen im Lauf mit geteiltem Modul fremde Handkarten in ihren Funden haben.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer; `npx vitest run tests/strategie_isolation.test.ts` endet mit Exit 0 |

## Testdaten

Angriffsdateien aus dem Prüfprotokoll P0.3d, Schlussprüfung. Jede hat zwei Fabriken: `erstelleLeckOffen` (Funde als Eigenschaft der KI, Wahl zufällig) und `erstelleLeckVerdeckt` (keine sichtbare Eigenschaft, das Fremdwissen verschiebt die Wahl). Die sieben Wege der Iteration 3: `zz_p_a02.ts` (Array.of), `zz_p_a03.ts` (call mit sich als this), `zz_p_a04.ts` (thisArg von forEach), `zz_p_a05.ts` und `zz_p_a05b.ts` (Engine-Werte über Array.of), `zz_p_a06.ts` (Klassenmethode mit call), `zz_p_a07.ts` (new.target), `zz_p_a14.ts` (Map.set und get), dazu `zz_p_c01_sauber.ts`. Sechs neue Wege: `zz_p_n01_valueof.ts` (`anker.valueOf()`), `zz_p_n02_methode.ts` (Methode am Prototyp über `new Anker().merke`), `zz_p_n03_statisch.ts` (statische Methode als Wert), `zz_p_n04_static_this.ts` (statische Methode gibt `this` zurück), `zz_p_n05_namensraum.ts` (`import * as selbst`), `zz_p_n06_engine_valueof.ts` (`werteSchlangen.valueOf()`).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Eine Angriffsdatei nach `src/ki/strategien/` kopieren | | `git status` zeigt nur diese Datei |
| 2 | Konsole im Repo | Isolationstest allein laufen lassen | `npx vitest run tests/strategie_isolation.test.ts --reporter=verbose` | Exit 1; zwei Zeilen mit `×` für die Datei, je eine für `erstelleLeckOffen` und `erstelleLeckVerdeckt` |
| 3 | Konsole im Repo | Datei wieder löschen | | `git status` leer |
| 4 | Konsole im Repo | Schritte 1 bis 3 mit jeder weiteren Angriffsdatei wiederholen | | jede Datei rot |
| 5 | Konsole im Repo | Isolationstest ohne Angriff | `npx vitest run tests/strategie_isolation.test.ts` | Exit 0, 5 Tests grün |

## Nicht abgedeckte Grenzfälle

Fabriken, die nicht als `erstelle…` exportiert sind, stehen in TF-PRUEF-034. Kanäle, die erst nach den vier Partien des Tests oder über globale Objekte wirken, stehen in TF-PRUEF-035. Fehlalarme bei ehrlichen Strategien stehen in TF-PRUEF-036, die Gegenproben des Tests selbst in TF-PRUEF-037.
