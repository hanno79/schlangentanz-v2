---
id: TF-SPEC-015
titel: Durchsucht die Abdeckungsprüfung wieder das ganze Dokument statt nur Teil A, schlagen die Offline-Tests fehl, und ein verfälschter Satz in Teil A erscheint beim Abgleich als fehlend.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/P0.5d-teil-a-website (PR #50)
grenzfall_von: TF-SPEC-006
---

## Worum es geht

Ein Satz der Website zählt nur als gespiegelt, wenn er in Teil A steht. Viele Sätze stehen zusätzlich in Teil D oder im Verlauf, etwa „Im zweiten Zug darfst du keinen weiteren Verdoppler spielen“. Liest die Prüfung das ganze Dokument, übersieht sie einen falschen Satz in Teil A.

## Bestanden, wenn

Mit `norm(spec)` statt `norm(spec.slice(start, ende))` in `scripts/website_abgleich/abgleich.cjs` endet `npx vitest run tests/website_abgleich.test.ts` mit 1 und zwei roten P0.5d-Tests. Mit der unveränderten Prüfung und dem Satz „Im zweiten Zug darfst du einen weiteren Verdoppler spielen“ in Teil A endet `npm run abgleich:website` mit 1 und meldet „FEHLT: Im zweiten Zug darfst du keinen weiteren Verdoppler spielen“, obwohl der richtige Satz noch in Teil D und Teil E steht.

## Fehlgeschlagen, wenn

Einer der beiden Befehle endet mit 0, oder die FEHLT-Liste nennt den Verdoppler-Satz nicht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches, Netzzugang für `abgleich:website` |

## Testdaten

`scripts/website_abgleich/abgleich.cjs` Zeile 61; `docs/GAME_SPEC.md` Zeile 388 (letzter Punkt der „Wichtigen Regeln“ in A7.8).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor, `scripts/website_abgleich/abgleich.cjs` Zeile 61 | Ausschnitt entfernen | `const dokument = norm(spec);` | |
| 2 | Git Bash im Repo | Offline-Tests ausführen | `npx vitest run tests/website_abgleich.test.ts; echo $?` | Exit 1, rot: „P0.5d: ein Satz der Website, der nur in Teil D steht, fehlt in Teil A“ und „P0.5d: Sätze nur vor Teil A oder nur in Teil B …“ |
| 3 | Git Bash im Repo | zurücksetzen | `git checkout -- scripts/website_abgleich/abgleich.cjs` | `git status` leer |
| 4 | Editor, `docs/GAME_SPEC.md` Zeile 388 | „keinen weiteren“ durch „einen weiteren“ ersetzen | | |
| 5 | Git Bash im Repo | Abgleich ausführen | `npm run abgleich:website; echo $?` | Exit 1, „1 fehlen“, „FEHLT: Im zweiten Zug darfst du keinen weiteren Verdoppler spielen“ |
| 6 | Git Bash im Repo | zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status` leer |
