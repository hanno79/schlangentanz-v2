---
id: TF-KI-045
titel: Schaltet man eine Stelle der Erstzug-Regel oder die Vorauswahl-Regel für Aufgaben aus, wird mindestens ein Test der Suite rot.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-28
veraendert_daten: nein
skript: src/ki/strategien/solideKi_erweiterung_erstzug_regel.test.ts
aenderung: task/K4-ki-erweiterung (PR #125)
grenzfall_von: TF-KI-039
---

## Worum es geht

Plan K4, Kriterien 1 und 2: Eine Regel, die man ausschalten kann, ohne dass ein Test es bemerkt, ist nicht abgesichert. Die Regel für den ersten Zug greift an drei Stellen (Plan der Zugsuche, Schätzung des verdeckten Ziehens mit dem Korb, Schwelle der Risiko-Karte), die Regel für Aufgaben in der Vorauswahl. Jede Stelle wird einzeln ausgeschaltet, die Suite läuft, danach wird zurückgesetzt.

## Bestanden, wenn

Für jede der Änderungen M1 bis M4 (siehe Technische Prüfung) wird mindestens ein Test rot, und nach dem Zurücksetzen zeigt `git status` ausserhalb von `tagebuch/` keine Änderung.

## Fehlgeschlagen, wenn

Nach einer der Änderungen bleiben alle Tests der Suite grün, etwa wenn `lohnt` in der Zugsuche immer wahr ist und trotzdem kein Test anschlägt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K4-ki-erweiterung`, `npm ci` gelaufen, keine eigene Änderung im Code |

## Testdaten

Keine eigenen Daten; die Tests der Suite unter `src/ki/strategien/` mit ihren festen Saaten.

## Technische Prüfung

Je eine Änderung, danach die Tests der Erweiterung unter `src/ki/strategien/` (`solideKi_erweiterung*.test.ts`, `vorauswahl_aufgaben.test.ts`) mit `npx vitest run`, danach `git checkout -- <datei>`:

- M1: `zugsuche.ts`, `lohnt` liefert immer `true`.
- M2: `zugsuche.ts`, die Bedingung mit `ERSTZUG_HALTEN` beim verdeckten Ziehen entfällt.
- M3: `risiko.ts`, `waehleRisiko` nimmt im ersten Zug `GLEICH` statt `ERSTZUG_HALTEN`.
- M4: `vorauswahl.ts`, die beste erfüllende Aktion wird nicht mehr zwingend aufgenommen und nicht nach vorn gestellt.

## Nicht abgedeckte Grenzfälle

Mehrere Stellen zugleich auszuschalten prüft der Testfall nicht; fällt schon jede einzeln auf, fällt auch die Kombination auf. Die Regel `erfuellend` beim Vertiefen in `zugsuche.ts` und die Paarprüfung `tauschpruefung` in der Vorauswahl werden nur protokolliert, wenn sie mitgeprüft wurden.
