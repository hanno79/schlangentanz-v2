---
id: TF-ENGINE-032
titel: Ruft eine Kartendatei platzhalter() anders auf als gewohnt, meldet der Quelltextabgleich in aktionen.test.ts einen roten Test, statt den Platzhalter still zu übergehen.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4b-versetzt (PR #63)
grenzfall_von: TF-ENGINE-030
---

## Worum es geht

Seit Iteration 2 von E4b liest `aktionen.test.ts` jede Kartendatei als Text und erwartet, dass `istPlatzhalter` genau dann wahr ist, wenn die Datei `platzhalter(` enthält. Ein Textvergleich kann eine ungewohnte Schreibweise falsch lesen. Geprüft wird, dass dann ein Test rot wird und kein Platzhalter unbemerkt aus den D13-Tests fällt.

## Bestanden, wenn

Jede der vier Abwandlungen aus „Testdaten“ macht den Test „D13/E4b: … ist genau dann als Platzhalter markiert …“ der geänderten Karte rot und keinen anderen. Nach dem Zurücksetzen laufen alle 45 Tests von `aktionen.test.ts` grün.

## Fehlgeschlagen, wenn

Eine Abwandlung lässt `aktionen.test.ts` grün, obwohl die Karte dadurch anders markiert ist, als ihre Datei es nahelegt, oder die Zahl der Tests „D13: … ist noch ein Platzhalter“ sinkt, ohne dass ein Test rot wird.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E4b-versetzt`, `npm ci` gelaufen, `git status` leer |

## Testdaten

1. Kommentar in einer umgesetzten Karte: in `src/engine/karten/verdoppler.ts` nach den Importen die Zeile `// Bis E4 stand hier platzhalter('Verdoppler', 'VerdopplerSpielen', 'E4').`
2. Platzhalter über eine Hilfsfunktion: neue Datei `src/engine/karten/spaeter_probe.ts` mit `export function spaeter(art, aktionstyp, task) { return platzhalter(art, aktionstyp, task) }` (mit Typen), `farbendieb.ts` importiert `spaeter` statt `platzhalter` und ruft `spaeter<FarbendiebSpielenAktion>(…)`.
3. Halb umgesetzte Karte: in `farbenfusion.ts` `export const farbenfusion = { ...platzhalter<FusionLegenAktion>('Farbenfusion', 'FusionLegen', 'E7'), ziele: () => [] };`
4. Verschachtelte Typangabe: in `regenbogenschlange.ts` `platzhalter<Extract<RegenbogenschlangeLegenAktion, { typ: 'RegenbogenschlangeLegen' }>>(…)`

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Abwandlung 1 aus „Testdaten“ einbauen | Abwandlung 1 | nur diese Datei geändert |
| 2 | Konsole im Repo | Registertests ausführen | `npx vitest run src/engine/__tests__/aktionen.test.ts` | Exit 1, rot genau „D13/E4b: Verdoppler ist genau dann …“ mit „erwartet true“ |
| 3 | Konsole im Repo | zurücksetzen | `git checkout -- src/engine/karten/verdoppler.ts` | `git status` leer |
| 4 | Editor | Abwandlung 2 einbauen | Abwandlung 2 | `farbendieb.ts` geändert, `spaeter_probe.ts` neu |
| 5 | Konsole im Repo | wie Schritt 2 | wie Schritt 2 | Exit 1, rot genau „D13/E4b: Farbendieb …“ mit „erwartet false“ |
| 6 | Konsole im Repo | zurücksetzen | `git checkout -- src/engine/karten/farbendieb.ts`, `spaeter_probe.ts` löschen | `git status` leer |
| 7 | Editor | Abwandlungen 3 und 4 einbauen | Abwandlungen 3 und 4 | zwei Dateien geändert |
| 8 | Konsole im Repo | wie Schritt 2 | wie Schritt 2 | Exit 1, rot genau „D13/E4b: Farbenfusion …“ (erwartet true) und „D13/E4b: Regenbogenschlange …“ (erwartet false) |
| 9 | Konsole im Repo | zurücksetzen und wie Schritt 2 | `git checkout -- src/engine/karten/` | Exit 0, 45 Tests grün, `git status` leer |

## Nicht abgedeckte Grenzfälle

Ein Platzhalter, den eine Kartendatei von Hand nachbaut, ohne `platzhalter()` zu rufen (ein Objekt mit `ziele: () => []` und dem Grund „… ist noch nicht umgesetzt“), bleibt still: Der Abgleich erwartet `false`, `istPlatzhalter` liefert `false`, und die Karte fällt aus den D13-Tests. Das ist geprüft, aber kein Testfall, weil eine solche Datei nicht unter die Markierung fällt und kein Kartentask Grund hat, so zu schreiben. Bei Abwandlung 4 nennt die Meldung „platzhalter() nicht aufruft“, obwohl die Datei es tut; rot wird der Test trotzdem.
