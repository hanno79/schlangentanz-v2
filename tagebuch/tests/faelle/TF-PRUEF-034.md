---
id: TF-PRUEF-034
titel: Jede Strategie unter src/ki/strategien wird vom Isolationstest geprüft oder im Architekturtest gemeldet, gleich wie ihre Fabrik exportiert ist.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.3d-ki-grenze (PR #55)
grenzfall_von: TF-PRUEF-033
---

## Worum es geht

Der Isolationstest findet Strategien nur über exportierte Funktionen, deren Exportname mit `erstelle` beginnt. Eine Strategie, deren Fabrik anders heisst oder anders gebaut ist, prüft er nicht. Damit sie nicht still herausfällt, soll der Architekturtest sie melden. Geprüft wird, ob das für jede naheliegende Form einer Fabrik gilt.

## Bestanden, wenn

Jede Datei aus den Testdaten, allein unter `src/ki/strategien/` eingesetzt, erscheint entweder als Testfall im Isolationstest (`npx vitest run tests/strategie_isolation.test.ts --reporter=verbose` nennt die Datei) oder bekommt im Architekturtest mindestens eine Meldung U5. `zz_p_f05_neu.ts` erscheint im Isolationstest, `zz_p_f06_falscher_name.ts` wird gemeldet.

## Fehlgeschlagen, wenn

Eine Datei, die eine KI liefert, erscheint nicht im Isolationstest und bekommt im Architekturtest keine Meldung; der Isolationstest endet dann mit „5 passed“, ohne die Datei zu nennen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Dateien aus dem Prüfprotokoll P0.3d, Schlussprüfung. Die Dateien F01 bis F04 teilen Hände über eine Methode am Prototyp einer Klasse der Modulebene. `zz_p_f01_default.ts` (`export default function erstelleSpion`), `zz_p_f02_umbenannt.ts` (`export { erstelleSpion as spion }`), `zz_p_f03_stufe.ts` (`export const mitStufe = (stufe) => (zufall) => Ki`), `zz_p_f04_klasse.ts` (`export class SpionKi implements Ki`), `zz_p_f05_neu.ts` (ehrlich, `erstelleErsteAktion`), `zz_p_f06_falscher_name.ts` (ehrlich, `baueErsteAktion`), `zz_p_f07_helfer.ts` (Helfer `erstelleHandliste`, liefert keine KI).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Eine Datei aus den Testdaten nach `src/ki/strategien/` kopieren | | `git status` zeigt nur diese Datei |
| 2 | Konsole im Repo | Isolationstest laufen lassen | `npx vitest run tests/strategie_isolation.test.ts --reporter=verbose` | Wird die Datei genannt? Zahl der Tests: 5 ohne, 6 oder mehr mit der Datei |
| 3 | Konsole im Repo | Architekturtest laufen lassen | `npx vitest run tests/architektur.test.ts tests/architektur_ki.test.ts` | Exit 1 und eine Meldung U5 zur Datei, oder Exit 0 |
| 4 | Konsole im Repo | Datei löschen, mit der nächsten Datei wiederholen | | `git status` leer |

## Technische Prüfung

`zz_p_f07_helfer.ts` ist kein Fall für „Bestanden“: Der Isolationstest ruft den Helfer als Fabrik auf und wird mit einem TypeError rot. Das ist laut, aber die Meldung nennt den Grund nicht.
