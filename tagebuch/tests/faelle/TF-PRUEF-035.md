---
id: TF-PRUEF-035
titel: Eine Strategie, die den Isolationstest und den Architekturtest besteht, kennt auch in einem längeren Turnier keine fremde Hand.
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

Der Isolationstest sieht nur seine vier Partien mit höchstens elf Instanzen aus einem Modul. Eine Strategie kann ihren Kanal erst danach öffnen, etwa ab der 21. Instanz, wie es in einem Messlauf mit 500 Partien (K5) geschieht. Geprüft wird, ob so ein Zeitzünder, der beide Tests besteht, im echten Turnier fremde Hände kennt. Dazu kommt ein Kanal über ein globales Objekt, das beide Läufe des Isolationstests teilen.

## Bestanden, wenn

Besteht eine Datei aus den Testdaten Architekturtest (keine Meldung) und Isolationstest (Exit 0), dann zählt die Probe im Turnier mit 30 Partien zu zweit 0 Entscheidungen mit richtigem verborgenem Fremdwissen.

## Fehlgeschlagen, wenn

Eine Datei besteht beide Tests und die Probe zählt im Turnier Entscheidungen mit richtigen verborgenen Fremdkarten, also Karten, die in der echten Fremdhand liegen und in der eigenen Sicht nicht vorkommen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand ab `task/P0.3d-ki-grenze`, `npm ci` gelaufen |
| Ausgangslage | `git status` leer |

## Testdaten

Aus dem Prüfprotokoll P0.3d, Schlussprüfung: `zz_p_t01_zeitzuender.ts` (Methode am Prototyp einer Klasse der Modulebene als Ablage, scharf ab der 21. Instanz), `zz_p_g01_global.ts` (Ablage am globalen `JSON`, von jeder neuen Instanz geleert) und die Probe `zz_pruef_leck.test.ts`. Turnier mit `ersteSaat` 1000, `kiSaat` 77, ohne Erweiterung, Spiegel gegen Spiegel: Zeitzünder 30 Partien, globaler Kanal 5 Partien.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | `zz_p_t01_zeitzuender.ts` allein nach `src/ki/strategien/` kopieren | | `git status` zeigt nur diese Datei |
| 2 | Konsole im Repo | Isolationstest laufen lassen | `npx vitest run tests/strategie_isolation.test.ts --reporter=verbose` | Exit und Zeile zur Datei (`✓` oder `×`) |
| 3 | Konsole im Repo | Architekturtest laufen lassen | `npx vitest run tests/architektur.test.ts tests/architektur_ki.test.ts` | Exit 0 heisst: keine Meldung |
| 4 | Konsole im Repo | Datei löschen, Schritte 1 bis 3 mit `zz_p_g01_global.ts` | | wie oben |
| 5 | Konsole im Repo | Beide Dateien und die Probe nach `tests/` kopieren, Probe laufen lassen | `PRUEF_LOG=<datei> npx vitest run tests/zz_pruef_leck.test.ts` | Zeilen `T01` und `G01`: erste Partie mit Fund, Entscheidungen mit richtigem verborgenem Fremdwissen |
| 6 | Konsole im Repo | Alle Dateien löschen | | `git status` leer |

## Technische Prüfung

Der globale Kanal G01 wird im Architekturtest gemeldet; er zeigt nur, dass der Isolationstest Kanäle über globale Objekte nicht sieht, weil beide Läufe dieselben globalen Objekte haben. Für die Bewertung zählt allein der Zeitzünder T01.
