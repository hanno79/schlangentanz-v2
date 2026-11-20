---
id: TF-SPEC-016
titel: Ersetzt man in Teil D die Kernaussage von D31, D23 oder den Beleg von D19 durch ihr Gegenteil, schlagen die Spec-Tests fehl, auch wenn das Zitat des Autors stehen bleibt.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/P0.5d-teil-a-website (PR #50)
grenzfall_von: TF-SPEC-014
---

## Worum es geht

Der Autor hat am 20.11.2026 drei Antworten präzisiert: Regenbogenschlange, Fusion aus Grün und Grün, Regenbogenschlange bringt 6 Punkte (D31); ein Verdoppler darf im zweiten Zug wirkungslos abgelegt werden (D23); D19 steht seit dem 13.11.2026 in A5. Die Tests sollen es merken, wenn jemand eine dieser Aussagen umdreht und das Zitat stehen lässt.

## Bestanden, wenn

Jede der drei Gegenproben unter „Testdaten“ lässt `npx vitest run tests/spec_documentation.test.ts tests/regelfragen_antworten.test.ts tests/regelfragen.test.ts` mit 1 enden. Gegenprobe 1 macht „D31: drei Joker nebeneinander sind eine Gruppe …“ und „P0.5: G9: gewählt „a“ …“ rot, Gegenprobe 2 „D23: der Verdoppler darf im zweiten Zug wirkungslos abgelegt werden …“, Gegenprobe 3 „P0.5: F6 steht in Teil D …“ mit der Meldung „F6: Beleg steht nicht in Teil A“.

## Fehlgeschlagen, wenn

Nach einer der drei Gegenproben enden die Tests mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches, `npm ci` gelaufen, `git status` leer |

## Testdaten

Gegenprobe 1: in der Zeile D31 von `docs/GAME_SPEC.md` „Regenbogenschlange: eine Gruppe mit 6 Punkten“ durch „Regenbogenschlange: eine Gruppe mit 0 Punkten“ ersetzen (nur in D31, nicht in D30). Gegenprobe 2: in der Zeile D23 „Ja: Im zweiten Zug darf er wirkungslos auf den eigenen Ablagestapel;“ durch „Nein: Im zweiten Zug ist er nicht ablegbar;“ ersetzen. Gegenprobe 3: in A5 „Eine Farbkarte, um eine eigene Schlange zu beginnen oder eine beliebige Schlange fortzusetzen, auch die eines Mitspielers (muss an einem Ende der Schlange angelegt werden)“ durch den alten Wortlaut „Eine Farbkarte, um eine Schlange zu beginnen oder fortzusetzen (muss an einem beliebigen Ende der Schlange angelegt werden)“ ersetzen.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `docs/GAME_SPEC.md`, Teil D, Zeile D31 | Gegenprobe 1 einsetzen, speichern | siehe „Testdaten“ | |
| 2 | Git Bash im Repo | Tests ausführen | `npx vitest run tests/spec_documentation.test.ts tests/regelfragen_antworten.test.ts tests/regelfragen.test.ts; echo $?` | Exit 1, rot: D31 und G9 |
| 3 | Git Bash im Repo | zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status` leer |
| 4 | Editor, `docs/GAME_SPEC.md`, Teil D, Zeile D23 | Gegenprobe 2 einsetzen, speichern | siehe „Testdaten“ | |
| 5 | Git Bash im Repo | Tests wie in Schritt 2 | | Exit 1, rot: D23 |
| 6 | Git Bash im Repo | zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status` leer |
| 7 | Editor, `docs/GAME_SPEC.md`, Teil A, A5 | Gegenprobe 3 einsetzen, speichern | siehe „Testdaten“ | |
| 8 | Git Bash im Repo | `npx vitest run tests/regelfragen.test.ts; echo $?` | | Exit 1, „F6: Beleg steht nicht in Teil A“ |
| 9 | Git Bash im Repo | zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status` leer |
