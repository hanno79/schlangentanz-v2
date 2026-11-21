---
id: TF-ENGINE-036
titel: Wird eine Regel des Farbendiebs im Code verfälscht, schlagen die Farbendieb-Tests fehl, auch der Ereignistest bei einem falschen Ziel im Ereignis.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E8-farbendieb (PR #67)
---

## Worum es geht

Geprüft wird, ob die Tests einen Fehler im Code bemerken. Dazu werden fünf Regeln des Farbendiebs einzeln verfälscht: was gestohlen werden darf (D2), an welche Stelle die Karte kommt (A7.1), was das Ereignis als Ziel nennt (E4b), wer gefragt wird (D33) und wann eine neue Schlange entsteht (D17). Nach jeder Verfälschung muss ein passender Test rot werden.

## Bestanden, wenn

Jede der fünf Verfälschungen aus „Testdaten“ führt zu Exit 1 mit mindestens einem roten Test, dessen Name die verfälschte Regel nennt. GP3 macht den Test „A7.1: in eine eigene Schlange: Herkunft …, Ziel an der angesagten Stelle …“ in `farbendieb_ereignisse.test.ts` rot. Nach dem Zurücksetzen ist `git status` leer.

## Fehlgeschlagen, wenn

Nach einer Verfälschung laufen alle Tests grün (Exit 0), oder es wird nur ein Test rot, der mit der Regel nichts zu tun hat.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E8-farbendieb`, Stand ab Commit `bb19f19`, `npm ci` gelaufen |
| Ausgangslage prüfen | `git status` leer |

## Testdaten

1. GP1 (D2): `src/engine/karten/farbendieb.ts` Zeile 35 `karte.typ === 'Farbkarte'` durch `true` ersetzen und Zeile 59 `if (karte.typ !== 'Farbkarte')` zu `if (false && karte.typ !== 'Farbkarte')`.
2. GP2 (A7.1): Zeile 125 `karten.splice(ziel.position, 0, karte)` zu `karten.splice(0, 0, karte)`.
3. GP3 (E4b): `src/engine/kartenorte.ts` Zeile 85 im Ereignis `nach` bei Ziel in einer Schlange durch `{ ...nach, position: nach.position + 1 }` ersetzen.
4. GP4 (D33): `farbendieb.ts` Zeile 113 `[gefunden.besitzer]` durch `mitspielerImUhrzeigersinn(zustand, spielerIndexVon(zustand, aktion.spielerId))`.
5. GP5 (D17): `farbendieb.ts` Zeile 43 zusätzlich `{ art: 'neueSchlange' }` anbieten, solange der Dieb weniger als 2 Schlangen hat, und Zeile 66 `eigene.length === 0` zu `eigene.length < 2`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Verfälschung 1 einbauen | Testdaten 1 | nur diese Datei geändert |
| 2 | Konsole im Repo | Farbendieb-Tests ausführen | `npx vitest run src/engine/__tests__/farbendieb.test.ts src/engine/__tests__/farbendieb_abwehr.test.ts src/engine/__tests__/farbendieb_ereignisse.test.ts src/entwicklung/szenarienFarbendieb.test.ts` | Exit 1; rot u. a. „D2: die Sonderkarte … wird abgelehnt“ (5 rot) |
| 3 | Konsole im Repo | zurücksetzen | `git checkout -- src/engine/karten/farbendieb.ts` | `git status` leer |
| 4 | Editor und Konsole | wie 1 bis 3 mit Verfälschung 2 | Testdaten 2 | Exit 1; rot u. a. „an Stelle 1 liegt die Karte danach genau dort“ (9 rot) |
| 5 | Editor und Konsole | Verfälschung 3, nur `farbendieb_ereignisse.test.ts` ausführen, dann `git checkout -- src/engine/kartenorte.ts` | Testdaten 3 | Exit 1; 2 rot, Meldung „der Schritt lässt sich nicht nachrechnen“ |
| 6 | Editor und Konsole | wie 1 bis 3 mit Verfälschung 4 | Testdaten 4 | Exit 1; rot u. a. „A6/D33: betroffen ist nur der Besitzer …“ (9 rot) |
| 7 | Editor und Konsole | wie 1 bis 3 mit Verfälschung 5 | Testdaten 5 | Exit 1; rot u. a. „D17: hat der Dieb eine Schlange, beginnt die gestohlene Karte keine neue“ (3 rot) |

## Nicht abgedeckte Grenzfälle

Bei GP1 und GP4 bleibt der Dauerlauf in `farbendieb_abwehr.test.ts` grün; rot werden nur die gezielten Tests. Eine Verfälschung der Abwehr selbst gehört zu E4 und wird hier nicht wiederholt.
