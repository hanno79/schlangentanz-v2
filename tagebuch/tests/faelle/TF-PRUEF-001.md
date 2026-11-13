---
id: TF-PRUEF-001
titel: npm run check:regeln schlägt bei je einer eingebauten Verletzung von U1, U6 und U7 fehl und ist ohne sie grün.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/check_regeln.test.ts
aenderung: task/P0.3-pruefwerkzeuge (PR #26)
---

## Worum es geht

`check:regeln` ist das Gate für die Umsetzungsregeln U1 (Regeltest nennt Spec-Abschnitt), U6 (kein `any`, `@ts-ignore`, unbegründetes `eslint-disable`, `skip`/`only`) und U7 (Zeilengrenzen). Meldet es eine echte Verletzung nicht, rutschen Regelverstösse in jeden späteren Task.

## Bestanden, wenn

Ohne Eingriff endet `npm run check:regeln` mit Exit 0 und „keine Verstösse“. Mit je einer eingebauten Verletzung endet es mit Exit 1 und nennt Regel, Datei und Zeile: U1 neuer Regeltest unter `src/engine/__tests__/` ohne Abschnitt; U6 `any` in `src/engine`, `describe.only` in `tests/`, `@ts-ignore` in `scripts/`; U7 Testdatei mit 500 Zeilen, Datei unter `src/ui` mit 301 Zeilen. Die Gegenstücke (Name mit `A12:`, 499 Zeilen, 300 Zeilen unter `src/ki`) enden mit 0.

## Fehlgeschlagen, wenn

Eine eingebaute Verletzung endet mit Exit 0, oder ein Gegenstück endet mit Exit 1, oder der saubere Stand endet nicht mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, nach `npm ci`, Zeilenenden LF |

## Testdaten

Probedateien `src/engine/__tests__/pruefer_u1.test.ts` (`describe('Wertung im Endspurt', () => { it('verdoppelt die Punkte', …) })`), `src/engine/pruefer_u6.ts` (`(wert: any) => wert`), `tests/pruefer_u6b.test.ts` (`describe.only`), `scripts/pruefer_u6c.mjs` (`// @ts-ignore`), `tests/pruefer_u7.test.ts` (500 bzw. 499 Zeilen), `src/ui/PrueferGross.tsx` (301 Zeilen), `src/ki/pruefer.ts` (300 Zeilen).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Gate ausführen | `npm run check:regeln; echo $?` | Exit 0, „keine Verstösse“ |
| 2 | dieselbe Konsole | je eine Probedatei aus „Testdaten“ anlegen, Gate ausführen, Datei wieder löschen | `node scripts/check_regeln.mjs; echo $?` | Verletzung: Exit 1 mit Regel und `Datei:Zeile`; Gegenstück: Exit 0 |
| 3 | dieselbe Konsole | Zustand prüfen | `git status --short` und `npm run check:regeln` | leer, Exit 0 |

## Nicht abgedeckte Grenzfälle

Die Ausnahmeliste zählt Verstösse je Datei. Wer in einer gelisteten Datei einen alten Verstoss behebt und zugleich einen neuen einbaut, bleibt grün (geprüft im Protokoll P0.3, Hinweis 1). Dass die Liste nur schrumpft, prüft kein Gate: Ein von Hand erhöhter Eintrag mit passendem neuem Verstoss bleibt grün; das fängt nur der Prüfer am Diff (PRUEFER_ANLEITUNG, Schritt 4).
