---
id: TF-ENGINE-047
titel: Jede der sechs Verfälschungen der Schlangenhäutung macht mindestens einen Test von E9 rot.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/E9-haeutung (PR #69)
---

## Worum es geht

Tests, die nie rot werden, belegen nichts. Hier wird die Regel in `src/engine/karten/schlangenhaeutung.ts` an sechs Stellen absichtlich verfälscht, und nach jeder Verfälschung müssen die Tests von E9 einen Fehler zeigen.

## Bestanden, wenn

Nach jeder Verfälschung endet der Lauf über `schlangenhaeutung.test.ts`, `schlangenhaeutung_abwehr.test.ts` und `szenarienHaeutung.test.ts` mit Exit 1. Erwartete Zahl roter Tests von 35: GP1 9, GP2 9, GP3 2, GP4 3, GP5 9, GP6 12. Nach dem Zurücksetzen ist `git status` leer.

## Fehlgeschlagen, wenn

Eine Verfälschung lässt alle 35 Tests grün, oder die Datei ist nach dem Zurücksetzen noch geändert.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E9-haeutung`, Stand ab Commit `d750cda`, `npm ci` gelaufen |
| Ausgangslage prüfen | `git status` leer |

## Testdaten

| GP | Zeile alt | Zeile neu | prüft |
|---|---|---|---|
| GP1 | `else laeufe.push([]);` | `else void 0;` | Sonderkarten unterbrechen den Abschnitt nicht mehr (A7.9) |
| GP2 | `return folgen.filter((folge) => farbfolge(folge) !== bisher);` | `return bisher === '' ? [] : folgen;` | die Aufzählung bietet auch die unveränderte Folge an (D26) |
| GP3 | `if (farbfolge(bisher) === farbfolge(danach)) {` | `if (false && farbfolge(bisher) === farbfolge(danach)) {` | die Prüfung nimmt eine unveränderte Folge an (D26) |
| GP4 | `const GROESSTER_ABSCHNITT = 5;` | `const GROESSTER_ABSCHNITT = 6;` | ein Abschnitt von 6 wäre erlaubt (A7.9) |
| GP5 | `? [] : [besitzer];` in `betroffene` | `? [] : [];` | in gegnerischen Schlangen wird niemand gefragt (A6, D10) |
| GP6 | `schlange.karten.splice(erste, neu.length, ...neu);` | `schlange.karten.splice(erste, neu.length, ...neu.reverse());` | die Wirkung legt die Karten anders als angesagt |

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `src/engine/karten/schlangenhaeutung.ts` | Zeile „alt“ von GP1 durch „neu“ ersetzen | siehe Testdaten | genau eine Stelle geändert |
| 2 | Konsole im Repo | Tests ausführen | `npx vitest run src/engine/__tests__/schlangenhaeutung.test.ts src/engine/__tests__/schlangenhaeutung_abwehr.test.ts src/entwicklung/szenarienHaeutung.test.ts` | Exit 1, Zahl der roten Tests wie unter „Bestanden, wenn“ |
| 3 | Konsole im Repo | zurücksetzen | `git checkout -- src/engine/karten/schlangenhaeutung.ts` | `git status` leer |
| 4 | wie 1 bis 3 | für GP2 bis GP6 wiederholen | siehe Testdaten | je Exit 1 und danach `git status` leer |

## Zurücksetzen

Nach jeder Gegenprobe `git checkout -- src/engine/karten/schlangenhaeutung.ts`; `git status` zeigt danach keine geänderte Datei.

## Nicht abgedeckte Grenzfälle

Eine Verfälschung nur des Ereignisses (Zustand richtig, `KartenVersetzt` falsch) ist hier nicht dabei, weil das Ereignis generisch in `kartenorte.ts` entsteht und nicht zu E9 gehört; E8 hat diese Probe gemacht.
