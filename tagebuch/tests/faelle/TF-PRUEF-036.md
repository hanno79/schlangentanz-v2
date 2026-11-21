---
id: TF-PRUEF-036
titel: Ehrliche Strategien mit Zustand je Instanz bleiben im Isolationstest und im Architekturtest grün.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/P0.3d-ki-grenze (PR #55)
grenzfall_von: TF-PRUEF-033
---

## Worum es geht

Eine Strategie für K2 wird Zustand haben, Tabellen nachschlagen und feste Listen nutzen. Solange das je Instanz geschieht, darf keiner der beiden Tests anschlagen; ein Fehlalarm würde ehrliche Arbeit an K2 blockieren.

## Bestanden, wenn

Mit beiden Probe-Strategien unter `src/ki/strategien/` enden `npx vitest run tests/architektur.test.ts tests/architektur_ki.test.ts tests/strategie_isolation.test.ts` und `npx eslint` auf den beiden Dateien mit Exit 0, und der Isolationstest führt beide Fabriken als bestanden.

## Fehlgeschlagen, wenn

Einer der Befehle endet mit Exit 1, etwa mit einer Meldung U5 zu `new Set(BEVORZUGT)` oder mit „verhält sich mit geteiltem Modul anders“ für eine der beiden Fabriken.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Aus dem Prüfprotokoll P0.3d, Schlussprüfung: `zz_p_k2_eigen.ts` (Merkliste und Zähler als Eigenschaft der KI, Nachschlagetabelle in einer Funktion, `as const`-Listen kopiert mit `new Set`, `Array.from` und `[...AKTIONSTYPEN]`, Hilfsklasse je Instanz, `liste.sort(absteigend)`) und `zz_p_k2_solide.ts` (Bewertungsstrategie der Iteration 3 mit `Map` in der Closure).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Beide Dateien nach `src/ki/strategien/` kopieren | | `git status` zeigt zwei neue Dateien |
| 2 | Konsole im Repo | Tests laufen lassen | `npx vitest run tests/architektur.test.ts tests/architektur_ki.test.ts tests/strategie_isolation.test.ts` | Exit 0; im Isolationstest `erstelleEigeneKi` und `erstelleSolideKi` mit `✓` |
| 3 | Konsole im Repo | eslint auf beiden Dateien | `npx eslint src/ki/strategien/zz_p_k2_eigen.ts src/ki/strategien/zz_p_k2_solide.ts` | Exit 0 |
| 4 | Konsole im Repo | Dateien löschen | | `git status` leer |
